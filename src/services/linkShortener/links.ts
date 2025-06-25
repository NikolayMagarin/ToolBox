import admin from 'firebase-admin';
import crypto from 'crypto';
import { ApiError } from '../../shared/ApiError';

const db = admin.firestore();
const linksCollection = db.collection('shortLinks');

function hashUrl(url: string) {
  return crypto.createHash('sha256').update(url).digest('base64');
}

export async function generateShortUrlId(
  originalUrl: string,
  customId: string | null,
  linkTTLdays: number | null
) {
  try {
    new URL(originalUrl);
  } catch (e) {
    throw new ApiError(400, "Not a valid url: '" + originalUrl + "'");
  }

  const urlHash = hashUrl(originalUrl);

  if (customId === null) {
    const existingId = await linksCollection
      .where('urlHash', '==', urlHash)
      .limit(1)
      .get();

    if (!existingId.empty) {
      const doc = existingId.docs[0];

      const oldTTLdays = doc.get('ttlDays');
      const oldExpiresAt = doc.get('expiresAt');

      if (linkTTLdays === null) {
        if (oldTTLdays !== null) {
          await doc.ref.update({
            ttlDays: null,
            expiresAt: null,
          });
        }
      } else if (oldTTLdays !== null) {
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + linkTTLdays);
        if (newExpiresAt.getTime() / 1000 > oldExpiresAt._seconds) {
          await doc.ref.update({
            ttlDays: linkTTLdays,
            expiresAt: newExpiresAt,
          });
        }
      }

      return doc.id;
    }
  }

  let shortId;
  let attempts = 0;

  while (attempts < 10) {
    shortId = customId || generateShortId();
    const docRef = linksCollection.doc(shortId);

    try {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (doc.exists) {
          if (customId === null) throw new Error('Code already exists');

          throw new ApiError(
            400,
            "Link with id '" +
              customId +
              "' already exists. Try another id or use random id"
          );
        } else if (linkTTLdays === null) {
          transaction.set(docRef, {
            originalUrl: originalUrl,
            urlHash: urlHash,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ttlDays: null,
            expiresAt: null,
          });
        } else {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + linkTTLdays);
          transaction.set(docRef, {
            originalUrl: originalUrl,
            urlHash: urlHash,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ttlDays: linkTTLdays,
            expiresAt: expiresAt,
          });
        }
      });

      return shortId;
    } catch (err) {
      if (err instanceof ApiError) throw err;

      attempts++;
      if (attempts >= 10) {
        break;
      }
    }
  }

  throw new ApiError(500, 'Failed to generate short link. Try again later');
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function generateShortId(size = 6) {
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
