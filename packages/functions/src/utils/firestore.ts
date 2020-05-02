import { firestore } from 'firebase-admin';

type Document = firestore.DocumentSnapshot | firestore.QueryDocumentSnapshot;
type DocumentData = { id: string };

export const toObject = <T extends DocumentData>(doc: Document) =>
  ({ id: doc.id, ...doc.data() } as T);
export const toObjects = <T extends DocumentData>(
  snapshot: firestore.QuerySnapshot
) => snapshot.docs.map((doc) => toObject<T>(doc)) as T[];
