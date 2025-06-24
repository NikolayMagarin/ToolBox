import { RequestHandler } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiError } from './ApiError';
import { generateErrorMessage } from 'zod-error';

export const validate: (schema: ZodSchema) => RequestHandler = function (
  schema
) {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ApiError(
          400,
          'Invalid body schema: ' +
            generateErrorMessage(err.issues, {
              code: { enabled: false },
              path: { enabled: true, label: null, type: 'objectNotation' },
              message: { enabled: true, label: ':' },
            })
        );
      }
      throw new Error('Interenal server error');
    }
  };
};
