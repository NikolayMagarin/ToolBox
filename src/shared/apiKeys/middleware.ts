import { RequestHandler } from 'express';
import { config } from '../../config';
import { ApiError } from '../ApiError';
import { ApiServiceName, servicesNames } from '../db/schema';
import { checkQuota } from './quota';

const publicServices: ApiServiceName[] = ['linkShortener'];

export const apiKeysMiddleware: RequestHandler = async function (
  req,
  res,
  next
) {
  const service = req.params.service;
  if (!servicesNames.includes(service as any)) {
    throw new ApiError(400, `Unknown service '${service}'`);
  }

  const origin = req.get('origin');
  // some services are public
  if (
    origin === config.origin &&
    publicServices.includes(service as ApiServiceName)
  ) {
    next();
  } else {
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
  }
};
