const ts = require('typescript');
const fetch = require('node-fetch');
const path = require('path');
const glob = require('glob');

const { COMPARE_URL, BEFORE_SHA, AFTER_SHA, GITHUB_TOKEN } = process.env;

const getCompareUrl = (baseUrl, base, head) =>
  baseUrl
    .replace('{base}', base.substr(0, 7))
    .replace('{head}', head.substr(0, 7));

const fetchGithub = (url, authToken) =>
  fetch(url, {
    headers: { Authorization: 'Bearer ' + authToken },
  }).then((res) => res.json());

async function getCodeFilesChanged() {
  const compareUrl = getCompareUrl(COMPARE_URL, BEFORE_SHA, AFTER_SHA);
  const { files } = await fetchGithub(compareUrl, GITHUB_TOKEN);

  // TODO: change this into a glob environment variable
  const codeFilesRegex = /^(src|package\.json|yarn\.lock|tsconfig\.json)/;
  const filePathPrefixRemoval = /^packages\/functions\//;

  return files
    .map((file) => file.filename.replace(filePathPrefixRemoval, ''))
    .filter((filename) => codeFilesRegex.test(filename));
}

function findFunctionsChanged(originPaths, references) {
  const functionsChanged = [];
  // TODO: change this into a glob environment variable
  const functionFileRegex = /src\/functions\/(?!index)/;

  const dependents = originPaths
    .map((filepath) => references[filepath])
    .filter(Boolean)
    .reduce((acc, arr) => acc.concat(arr), [])
    .filter((item, index, arr) => arr.indexOf(item) === index);

  // files that are not function exports
  const nonFunctionDependents = dependents.filter(
    (filepath) => !functionFileRegex.test(filepath)
  );

  functionsChanged.push(
    ...dependents.filter((filepath) => functionFileRegex.test(filepath)),
    ...originPaths.filter((filepath) => functionFileRegex.test(filepath))
  );

  if (nonFunctionDependents.length) {
    functionsChanged.push(
      ...findFunctionsChanged(nonFunctionDependents, references)
    );
  }

  const functionNames = functionsChanged
    .map((filepath) => path.basename(filepath, path.extname(filepath)))
    .filter((item, index, arr) => arr.indexOf(item) === index);

  return functionNames;
}

function processChangedFiles(filepaths) {
  // TODO: change this into a glob environment variable
  const completeDeploymentRegex = /^(package\.json|yarn\.lock|tsconfig\.json|src\/index\.ts|src\/functions\/index\.ts)$/;
  const functionExportsGlob = 'src/functions/*.ts';

  if (filepaths.some((filepath) => completeDeploymentRegex.test(filepath)))
    return '';

  const changedFilepaths = filepaths.map((filepath) => path.resolve(filepath));
  const tsProgram = ts.createProgram(glob.sync(functionExportsGlob), {});
  const relativeReferences = [...tsProgram.getRefFileMap().entries()]
    .filter((pair) =>
      pair[1].every(
        (ref) =>
          !ref.file.includes('node_modules') &&
          !ref.referencedFileName.includes('node_modules')
      )
    )
    .map(([origin, refFiles]) => [origin, refFiles.map((ref) => ref.file)])
    .reduce((acc, [origin, targets]) => ({ ...acc, [origin]: targets }), {});

  return findFunctionsChanged(changedFilepaths, relativeReferences);
}

getCodeFilesChanged()
  .then(processChangedFiles)
  .then((changedFunctionNames) => {
    if (!changedFunctionNames.length) {
      return console.log('');
    }

    console.log(':' + changedFunctionNames.join(','));
  })
  .catch(() => {});
