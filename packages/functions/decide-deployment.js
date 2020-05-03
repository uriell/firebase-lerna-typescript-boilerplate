const ts = require('typescript');
const fetch = require('node-fetch');
const path = require('path');
const glob = require('glob');

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
    .map((file) => file.filename.replace(/^packages\/functions\//, ''))
    .filter((filename) => codeFilesRegex.test(filename));
}

function findFunctionsChanged(originPaths, references) {
  const functionsChanged = [];
  const functionFileRegex = /src\/functions/;

  const dependents = originPaths
    .map((filepath) => references[filepath])
    .filter(Boolean)
    .reduce((acc, arr) => acc.concat(arr), [])
    .filter((item, index, arr) => arr.indexOf(item) === index);

  const nonFunctionDependents = dependents.filter(
    (filepath) => !functionFileRegex.test(filepath)
  );

  functionsChanged.push(
    ...dependents.filter((filepath) => functionFileRegex.test(filepath))
  );

  console.info(nonFunctionDependents);
  console.info(functionsChanged);

  if (nonFunctionDependents.length) {
    functionsChanged.push(
      ...findFunctionsChanged(nonFunctionDependents, references)
    );
  }

  const functionNames = functionsChanged
    .map((filepath) => path.basename(filepath, path.extname(filepath)))
    .filter((item, index, arr) => arr.indexOf(item) === index);

  console.info(functionNames);

  return functionNames;
}

function processChangedFiles(filepaths) {
  const completeDeploymentRegex = /^(package\.json|yarn\.lock|tsconfig\.json|src\/index\.ts|src\/functions\/index\.ts)$/;

  if (filepaths.some((filepath) => completeDeploymentRegex.test(filepath)))
    return '';

  const changedFilepaths = filepaths.map((filepath) => path.resolve(filepath));
  const functionFiles = glob.sync('src/functions/!(index).ts');
  const tsProgram = ts.createProgram(functionFiles, {});
  const refFileMap = tsProgram.getRefFileMap();
  const relativeReferences = [...refFileMap.entries()]
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
    console.info(changedFunctionNames);

    if (!changedFunctionNames.length) {
      return console.log('');
    }

    console.log(':' + changedFunctionNames.join(','));
  })
  .catch(() => {});
