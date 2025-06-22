import admin from 'firebase-admin';
import { get, set } from './cacheManager';
import { queueWrite } from './batchWriter';
import { config } from '../../config';
import { Schema } from './schema';
import { logger } from '../logger';

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: config.firebaseClientEmail,
    privateKey: config.firebasePrivateKey,
    projectId: config.firebaseProjectId,
  }),
});

const firestore = admin.firestore();

export async function getDocument<
  C extends keyof Schema,
  D extends Schema[C]['docId'],
  T extends Schema[C]['data']
>(
  collection: C,
  docId: D,
  options = { force: false, persistent: false }
): Promise<T | null> {
  const cacheKey = `${collection}/${docId}`;
  if (!options.force) {
    const cached = get<T>(cacheKey);
    if (cached) return cached;
  }

  const snapshot = await firestore
    .collection(collection.toString())
    .doc(docId)
    .get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as T;
  set<T>(cacheKey, data, options.persistent);

  logger.debug(`[Firestore] Loaded: ${cacheKey}`);
  return data;
}

export function setDocument<
  C extends Extract<keyof Schema, string>,
  D extends Schema[C]['docId'],
  T extends Schema[C]['data']
>(collection: C, docId: D, data: T, options = { persistent: false }) {
  const cacheKey = `${collection}/${docId}`;
  set<T>(cacheKey, data, options.persistent);
  queueWrite(collection, docId, data);
}

export async function mergeDocument<
  C extends Extract<keyof Schema, string>,
  D extends Schema[C]['docId'],
  T extends Schema[C]['data']
>(collection: C, docId: D, data: Partial<T>) {
  const cacheKey = `${collection}/${docId}`;
  const prev = await getDocument<C, D, T>(collection, docId);

  if (!prev) {
    set<Partial<T>>(cacheKey, data);
  } else {
    set<T>(cacheKey, { ...prev, ...data });
  }
  queueWrite(collection, docId, data, true);
}
