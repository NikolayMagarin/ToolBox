import { ApiServiceName, ApiServiceQuota, servicesNames } from '../db/schema';
import crypto from 'crypto';
import { db } from '../db';

export function generateQuotas(
  quotasPerDay: Partial<Record<ApiServiceName, ApiServiceQuota['dailyLimit']>>
) {
  const quotas: Partial<Record<`${ApiServiceName}Quota`, ApiServiceQuota>> = {};

  for (const serviceName of servicesNames) {
    quotas[`${serviceName}Quota`] = { dailyLimit: 0, usedToday: 0 };
  }

  for (const serviceName in quotasPerDay) {
    quotas[`${serviceName as ApiServiceName}Quota`]!.dailyLimit =
      quotasPerDay[serviceName as ApiServiceName]!;
  }

  return quotas as Record<`${ApiServiceName}Quota`, ApiServiceQuota>;
}

export function generateApiKey(
  quotasPerDay: Partial<
    Record<ApiServiceName, ApiServiceQuota['dailyLimit']>
  > = {}
) {
  const key = 'tbk_' + crypto.randomBytes(32).toString('hex');
  const quotas = generateQuotas(quotasPerDay);

  const now = Date.now();

  db.set('apiKeys', key, {
    createdAt: now,
    lastUsedAt: now,
    isActive: true,
    ...quotas,
  });

  return key;
}
