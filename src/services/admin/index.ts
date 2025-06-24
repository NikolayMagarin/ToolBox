import express from 'express';
import { z } from 'zod';
import { ApiError } from '../../shared/ApiError';
import { generateApiKey } from '../../shared/apiKeys';
import { db } from '../../shared/db';
import { ApiServiceQuotaName, servicesNames } from '../../shared/db/schema';
import { validate } from '../../shared/reqValidate';

export const router = express.Router();

const createKeySchema = z.object({
  quotas: z.record(z.enum(servicesNames), z.number().int().nonnegative()),
});

router.post('/admins/api/createkey', validate(createKeySchema), (req, res) => {
  const key = generateApiKey(req.body.quotas);

  res.status(200).json({ key: key });
});

const editKeyQuotasSchema = z.object({
  key: z.string(),
  quotas: z.record(z.enum(servicesNames), z.number().int().nonnegative()),
});

router.post(
  '/admins/api/editkeyquotas',
  validate(editKeyQuotasSchema),
  async (req, res) => {
    const keyData = await db.get('apiKeys', req.body.key);

    if (!keyData) {
      throw new ApiError(400, "Api key doesn't exist");
    }

    db.merge(
      'apiKeys',
      req.body.key,
      Object.fromEntries(
        Object.entries(req.body.quotas).map(([serviceName, perDayQuota]) => {
          const quotaName = `${serviceName}Quota`;
          return [
            quotaName,
            {
              usedToday: keyData[quotaName as ApiServiceQuotaName].usedToday,
              dailyLimit: perDayQuota,
            },
          ];
        })
      )
    );

    res.status(200).json({ ok: true });
  }
);
