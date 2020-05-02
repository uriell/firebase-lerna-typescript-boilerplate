import * as functions from 'firebase-functions';

export default functions.https.onRequest((request, response) => {
  const documentPath = request.path;

  return response.status(200).json({
    meta: {
      status: 'ok',
    },
    data: {
      documentPath,
    },
  });
});
