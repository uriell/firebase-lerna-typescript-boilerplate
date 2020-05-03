import * as admin from 'firebase-admin';

import { toObject, DocumentData } from './firestore';

interface LocaleStrings extends DocumentData {
  en_US: string;
  pt_BR: string;
  [key: string]: string;
}

export const getLocaleStrings = (key: string) =>
  admin
    .firestore()
    .collection('locale')
    .doc(key)
    .get()
    .then((doc) => toObject<LocaleStrings>(doc));
