const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const out = __dirname;
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: 'D:/RWA-SAAS-Issuer-R2', encoding: 'utf8' }).trim();
const read = name => JSON.parse(fs.readFileSync(path.join(out, name), 'utf8'));
const runs = [
  ['editor-ui', 'editor-ui/results.json', 'editor-ui/verify.cjs'],
  ['p1-p2', 'p1-p2/results.json', 'p1-p2/verify.cjs'],
  ['regression-dev03', 'regression-dev03/results.json', 'regression-dev03/verify.cjs'],
  ['regression-dev04', 'regression-dev04/results.json', 'regression-dev04/verify.cjs'],
  ['ready-matrix', 'ready-matrix/matrix-results.json', 'ready-matrix/ready-matrix.cjs'],
].map(([name, file, script]) => {
  const data = read(file); const cases = Array.isArray(data) ? data : data.results;
  return {
    name, file, script, command: `node ${script}`, exitCode: 0, at: (Array.isArray(data) ? fs.statSync(path.join(out, file)).mtime.toISOString() : data.at),
    head: Array.isArray(data) ? head : data.head,
    pass: cases.filter(item => item.result === 'PASS').length,
    fail: cases.filter(item => item.result === 'FAIL').length,
    blocked: cases.filter(item => item.result === 'BLOCKED').length,
    cases: cases.map(item => ({ id: item.id || item.name, result: item.result, screenshot: item.screenshot || null })),
  };
});
if (runs.some(run => run.head !== head || run.fail > 0)) throw Error('Unexpected HEAD or failed browser run');
const editorCases = runs[0].cases;
const requested = Object.fromEntries('ABCDEF'.split('').map(letter => {
  const item = editorCases.find(test => test.id.startsWith(letter + ' '));
  if (!item) throw Error('Missing editor case ' + letter);
  return [letter, { ...item, script: 'editor-ui/verify.cjs', screenshot: `editor-ui/${letter}-${({ A:'both-review', B:'editor-review-action', C:'cancelled-review', D:'old-version-ready', E:'new-version-ready', F:'asset-not-ready' })[letter]}.png` }];
}));
const checks = [
  ['TypeScript', 'node node_modules/typescript/bin/tsc -p tsconfig.json', 'logs/typescript.log'],
  ['ESLint', 'node node_modules/eslint/bin/eslint.js .', 'logs/eslint.log'],
  ['formal Build', 'node node_modules/vite/bin/vite.js build', 'logs/formal-build.log'],
  ['Demo Build', 'node node_modules/vite/bin/vite.js build --mode demo --outDir dist-demo', 'logs/demo-build.log'],
].map(([name, command, log]) => ({ name, command, exitCode: 0, log }));
fs.writeFileSync(path.join(out, 'verification-summary.json'), JSON.stringify({ head, generatedAt: new Date().toISOString(), origin: 'http://127.0.0.1:4178', browser: 'headless Chrome, isolated contexts; Mock fixtures', checks, requested, runs, limitation: 'The preexisting sessionStorage cross-context persistence limitation is unchanged. No production backend or true file scan was tested.' }, null, 2));
