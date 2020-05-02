import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { toObject } from '../utils/firestore';

export default functions.https.onRequest(async (request, response) => {
  const documentPath = request.path.substr(1);

  const document = await admin
    .firestore()
    .doc(documentPath)
    .get()
    .then(toObject);

  return response.status(200).json({
    meta: {
      status: 'ok',
    },
    data: {
      documentPath,
      document,
    },
  });
});
