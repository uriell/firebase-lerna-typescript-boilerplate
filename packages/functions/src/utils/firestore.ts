import { firestore } from 'firebase-admin';

export type Document =
  | firestore.DocumentSnapshot
  | firestore.QueryDocumentSnapshot;
export type DocumentData = { id: string };

export const toObject = <T extends DocumentData>(doc: Document) =>
  ({ id: doc.id, ...doc.data() } as T);
export const toObjects = <T extends DocumentData>(
  snapshot: firestore.QuerySnapshot
) => snapshot.docs.map((doc: Document) => toObject<T>(doc)) as T[];
