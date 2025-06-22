const collections = ['apiKeys'] as const;

export interface Schema extends DataBaseSchema {
  apiKeys: {
    docId: ApiKeyHash;
    data: {
      createdAt: number;
      isActive: boolean;
    } & Record<`${ApiServiceName}Quota`, ApiServiceQuota>;
  };
}

type ApiKeyHash = string;
type ApiServiceName = 'aiProxy' | 'linkShortener';
type ApiServiceQuota = { dailyLimit: number; usedToday: number };

///////////

type DocIdType = string;
type DocDataType = Record<string, Serializable>;
type Primitive = string | number | boolean | null;
type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

type DataBaseSchema = Record<
  (typeof collections)[number],
  { docId: DocIdType; data: DocDataType }
>;
