import express from 'express';
import path from 'path';
import { z } from 'zod';
import { config } from '../../config';
import { validate } from '../../shared/reqValidate';
import { generateShortUrlId } from './links';
import admin from 'firebase-admin';
import { logger } from '../../shared/logger';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const router = express.Router();

router.get('/links', (req, res) =>
  res.sendFile(path.resolve('public', 'linkShortener', 'index.html'))
);

const shortLinkSchema = z.object({
  originalUrl: z.string().trim().nonempty(),
  customSlug: z.string().trim().nonempty().optional(),
  expiration: z.enum(['1day', '1week', '1month', '6months', 'never']),
});

type ExpirationOption = '1day' | '1week' | '1month' | '6months' | 'never';
const EXPIRATION_MAP = {
  '1day': 1,
  '1week': 7,
  '1month': 30,
  '6months': 180,
  never: null,
};

router.post(
  '/linkShortener/api/create',
  validate(shortLinkSchema),
  async (req, res) => {
    if (req.body.originalUrl.startsWith(`${config.origin}/l/`)) {
      res.status(200).json({
        shortUrl: req.body.originalUrl,
      });
    } else {
      const linkId = await generateShortUrlId(
        req.body.originalUrl,
        req.body.customSlug || null,
        EXPIRATION_MAP[req.body.expiration as ExpirationOption]
      );

      res.status(200).json({ shortUrl: `${config.origin}/l/${linkId}` });

      saveMetaTags(req.body.originalUrl, linkId);
    }
  }
);

const db = admin.firestore();

async function saveMetaTags(originalUrl: string, linkId: string) {
  const doc = await db.collection('shortLinks').doc(linkId).get();

  if (!doc.exists) {
    return;
  }
  try {
    const { data } = await axios.get(originalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkShortener/1.0)',
      },
    });

    const $ = cheerio.load(data);

    doc.ref.update({
      metaTags: {
        title: $('title').text() || originalUrl,
        description: $('meta[name="description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
      },
    });
  } catch {}
}

router.get('/linkShortener/api/cleanup-expired', async (req, res) => {
  const now = new Date();
  const expiredLinks = await db
    .collection('shortLinks')
    .where('expiresAt', '<=', now)
    .get();

  const batch = db.batch();
  expiredLinks.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  res.send(`Deleted ${expiredLinks.size} expired links`);
});

router.get('/l/:linkId', async (req, res) => {
  const doc = await db.collection('shortLinks').doc(req.params.linkId).get();

  if (!doc.exists) {
    return res.status(404).send('Short link not exists');
  }

  const originalUrl: string = doc.get('originalUrl');
  const metaTags = (doc.get('metaTags') || {}) as {
    title: string;
    description: string;
    image: string;
  };

  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${metaTags.title}</title>
          <meta name="description" content="${metaTags.description}">
          <meta property="og:title" content="${metaTags.title}">
          <meta property="og:description" content="${metaTags.description}">
          <meta property="og:image" content="${metaTags.image}">
          <meta property="og:url" content="${originalUrl}">
          <meta name="twitter:card" content="summary_large_image">
          <meta http-equiv="refresh" content="0;url=${originalUrl}">
        </head>
        <body>
          <script>
            window.location.href = "${originalUrl}";
          </script>
        </body>
      </html>
    `;

  res.send(html);
});
