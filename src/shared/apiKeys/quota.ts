import { ApiError } from '../ApiError';
import { db } from '../db';
import { ApiKey, ApiServiceName } from '../db/schema';

/**
 * Throws error if api key is invalid or daily qouta exeeded.
 * Also automaticaly updates lastUsedAt and resets daily usage if necessary
 */
export async function checkQuota(key: ApiKey, service: ApiServiceName) {
  const keyData = await db.get('apiKeys', key);

  if (!keyData) throw new ApiError(403, 'Invalid API key');

  const quota = keyData[`${service}Quota`];

  if (!quota || quota.dailyLimit === 0)
    throw new ApiError(
      403,
      `API key lacks permissions for service '${service}'`
    );

  const now = Date.now();

  let usedToday = quota.usedToday;

  // if new day
  if (Math.floor(keyData.lastUsedAt / 8.64e7) < Math.floor(now / 8.64e7)) {
    usedToday = 0;
  }

  if (quota.dailyLimit <= usedToday)
    throw new ApiError(429, `Daily quota exceeded for service '${service}'`);

  db.merge('apiKeys', key, {
    lastUsedAt: now,
    [`${service}Quota`]: {
      dailyLimit: quota.dailyLimit,
      usedToday: usedToday + 1,
    },
  });

  return true;
}
