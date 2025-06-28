import express from 'express';
import { config } from '../../config';
import { validate } from '../../shared/reqValidate';
import Groq from 'groq-sdk';
import { chatCompletionSchema } from './bodySchema';

export const router = express.Router();

const groq = new Groq({
  apiKey: config.groqApiKey,
});

router.post(
  '/aiProxy/api/v1/chat/completions',
  validate(chatCompletionSchema),
  async (req, res) => {
    try {
      const { messages, model, stream, ...otherParams } =
        req.body as ReturnType<typeof chatCompletionSchema.parse>;

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await groq.chat.completions.create({
          model,
          messages,
          stream: true,
          ...otherParams,
        });

        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const completion = await groq.chat.completions.create({
          model,
          messages,
          stream: false,
          ...otherParams,
        });
        res.json(completion);
      }
    } catch (error) {
      if (error instanceof Groq.APIError) {
        res.status(error.status).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: (error as any)?.message || 'Internal server error' });
      }
    }
  }
);
