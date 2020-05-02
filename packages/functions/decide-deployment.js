const ts = require('typescript');
const fetch = require('node-fetch');

const { COMPARE_URL, BEFORE_SHA, AFTER_SHA, GITHUB_TOKEN } = process.env;

const getCompareUrl = (baseUrl, base, head) =>
  baseUrl
    .replace('{base}', base.substr(0, 7))
    .replace('{head}', head.substr(0, 7));

const fetchGithub = (url, authToken, options = {}) =>
  fetch(url, {
    headers: {
      ...(options.headers || {}),
      Authorization: 'Bearer' + authToken,
    },
  }).then((res) => res.json());

async function getFilesChanged() {
  const compareUrl = getCompareUrl(COMPARE_URL, BEFORE_SHA, AFTER_SHA);
  const { files } = await fetchGithub(compareUrl, GITHUB_TOKEN);

  return files.map((file) => file.filename);
}

console.log(getFilesChanged().then(console.log).catch(console.error));

function parse(code = '', filename = 'astExplorer.ts') {
  const host = {
    fileExists: () => true,
    getCanonicalFileName: (filename) => filename,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => 'lib.d.ts',
    getNewLine: () => '\n',
    getSourceFile: (filename) =>
      ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true),
    readFile: () => null,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => null,
  };

  const program = ts.createProgram([filename], {}, host);

  return program.getSourceFile(filename);
}
