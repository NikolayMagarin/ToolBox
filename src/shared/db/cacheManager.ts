type CacheEntry<T> = {
  data: T;
  expiresAt: number;
  persistent: boolean;
};

const TTL = 1000 * 60 * 10; // 10 minutes
const CLEANUP_INTERVAL = 1000 * 60 * 5; // every 5 minutes
const cache = new Map<string, CacheEntry<any>>();

export function set<T>(key: string, data: T, persistent = false): void {
  cache.set(key, {
    data,
    persistent,
    expiresAt: persistent ? Infinity : Date.now() + TTL,
  });
}

export function get<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (!entry.persistent) {
    entry.expiresAt = Date.now() + TTL;
  }

  return entry.data as T;
}

export function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (!entry.persistent && entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}

setInterval(cleanup, CLEANUP_INTERVAL); // every minute
