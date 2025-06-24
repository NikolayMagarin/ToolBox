import { RequestHandler } from 'express';
import { ApiError } from '../ApiError';
import { ApiServiceName, servicesNames } from '../db/schema';
import { checkQuota } from './quota';

export const apiKeysMiddleware: RequestHandler = async function (
  req,
  res,
  next
) {
  const service = req.params.service;
  if (!servicesNames.includes(service as any)) {
    throw new ApiError(400, `Unknown service '${service}'`);
  }

  let authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new ApiError(403, 'Invalid authorization header');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new ApiError(403, 'Invalid authorization header');
  }

  const apiKey = authHeader.slice(7);

  await checkQuota(apiKey, service as ApiServiceName);

  next();
};
