const collections = ['apiKeys', 'shortLinks'] as const;

export interface Schema extends DataBaseSchema {
  apiKeys: {
    docId: ApiKey;
    data: {
      createdAt: number;
      lastUsedAt: number;
      isActive: boolean;
    } & Record<ApiServiceQuotaName, ApiServiceQuota>;
  };
  shortLinks: {
    docId: string;
    data: {
      originalUrl: string;
      urlHash: string;
      createdAt: Timestamp;
      ttlDays: number;
      expiresAt: Timestamp;
    };
  };
}

export type Timestamp = FirebaseFirestore.Timestamp | Date;

export const servicesNames = ['admins', 'aiProxy', 'linkShortener'] as const;
export type ApiKey = string;
export type ApiServiceName = (typeof servicesNames)[number];
export type ApiServiceQuota = { dailyLimit: number; usedToday: number };
export type ApiServiceQuotaName = `${ApiServiceName}Quota`;

///////////

type DocIdType = string;
type DocDataType = Record<string, Serializable>;
type Primitive = string | number | boolean | Timestamp | null;
type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

type DataBaseSchema = Record<
  (typeof collections)[number],
  { docId: DocIdType; data: DocDataType }
>;
