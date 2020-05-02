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

async function getCodeFilesChanged() {
  const compareUrl = getCompareUrl(COMPARE_URL, BEFORE_SHA, AFTER_SHA);
  const { files } = await fetchGithub(compareUrl, GITHUB_TOKEN);

  const codeFilesRegex = /^(src|package\.json|yarn\.lock|tsconfig\.json)/;

  return files
    .map((file) => file.filename.replace(/^packages\/functions\/?/, ''))
    .filter((filename) => codeFilesRegex.test(filename));
}

function processChangedFiles(filepaths) {
  const completeDeploymentRegex = /^(package\.json|yarn\.lock|tsconfig\.json|src\/index\.ts)$/;

  if (filepaths.some(filepath => completeDeploymentRegex.test(filepath))) return '';

  for (let filepath of filepaths) {
    if (completeDeploymentRegex.test())
  }
}

console.log(getCodeFilesChanged().then(console.log).catch(console.error));

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
