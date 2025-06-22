import { getDocument, mergeDocument, setDocument } from './firestore';

export const db = {
  get: getDocument,
  set: setDocument,
  merge: mergeDocument,
};
