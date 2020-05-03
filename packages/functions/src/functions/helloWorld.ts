import * as functions from 'firebase-functions';

import { getLocaleStrings } from '../utils/locale';

export default functions.https.onRequest(async (request, response) => {
  let lang = request.headers['Accept-Language'];

  if (typeof lang !== 'string') {
    lang = 'en_US';
  }

  const localeStrings = await getLocaleStrings('hello_world');

  response.send(localeStrings[lang] || localeStrings.en_US);
});
