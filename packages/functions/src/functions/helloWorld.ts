import * as functions from 'firebase-functions';

export default functions.https.onRequest((request, response) => {
  response.send('안녕하세요 세계');
});
