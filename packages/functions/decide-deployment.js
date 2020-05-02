const ts = require('typescript');

console.log(typeof process.env.GITHUB_TOKEN);

function parse(code = '', filename = 'astExplorer.ts') {
  const program = ts.createProgram([filename], {}, {
    fileExists: () => true,
    getCanonicalFileName: filename => filename,
    getCurrentDirectory: () => '',
    getDefaultLibFileName: () => 'lib.d.ts',
    getNewLine: () => '\n',
    getSourceFile: filename => ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true),
    readFile: () => null,
    useCaseSensitiveFileNames: () => true,
    writeFile: () => null,
  });
  
  return program.getSourceFile(filename);
}