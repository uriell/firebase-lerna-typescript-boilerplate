import * as functions from 'firebase-functions';

export default functions.https.onRequest((request, response) => {
  response.send('Goodbye world');
});
