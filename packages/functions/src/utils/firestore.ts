import { firestore } from 'firebase-admin';

export type Document =
  | firestore.DocumentSnapshot
  | firestore.QueryDocumentSnapshot;
export type DocumentData = { id: string };

export const toObject = <T extends DocumentData>(doc: Document): T =>
  ({ id: doc.id, ...doc.data() } as T);
export const toObjects = <T extends DocumentData>(
  snapshot: firestore.QuerySnapshot
): T[] => snapshot.docs.map((doc) => toObject<T>(doc)) as T[];
