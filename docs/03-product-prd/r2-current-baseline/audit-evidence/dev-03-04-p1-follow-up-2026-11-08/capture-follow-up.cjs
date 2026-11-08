const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');
const out = __dirname;
const sourceRoot = 'D:/RWA-SAAS-Issuer-R2';
const sourcePath = 'prototypes/website-ui-preview/src/issuer-r2/InstrumentPage.tsx';
const before = path.resolve(out, '../dev-03-04-p1-fix-2026-11-08/InstrumentPage.tsx');
const after = path.join(out, 'InstrumentPage.tsx');
fs.copyFileSync(path.join(sourceRoot, sourcePath), after);

const run = (args, cwd = sourceRoot) => {
  const r = cp.spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.error) throw r.error;
  return { exitCode: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
};
const text = args => {
  const r = run(args);
  return `$ git ${args.join(' ')}\nexit_code=${r.exitCode}\n${r.stdout}${r.stderr ? '[stderr]\n' + r.stderr : ''}\n`;
};
const patch = cp.spawnSync('git', ['diff', '--no-index', '--', before, after], { cwd: sourceRoot, maxBuffer: 5 * 1024 * 1024 });
if (patch.status !== 1) throw Error('Expected one changed source file; git diff --no-index exit=' + patch.status);
fs.writeFileSync(path.join(out, 'source-before-after.patch'), patch.stdout);
fs.writeFileSync(path.join(out, 'git-status.txt'), [
  text(['status', '--porcelain=v2', '--branch']),
  text(['status', '--short']),
  text(['ls-files', '-m']),
  text(['ls-files', '--others', '--exclude-standard']),
].join('\n'));
fs.writeFileSync(path.join(out, 'git-diff-check.txt'), text(['diff', '--check']));
fs.writeFileSync(path.join(out, 'git-summary.txt'), [
  `capture_time_utc=${new Date().toISOString()}`,
  text(['rev-parse', 'HEAD']),
  text(['branch', '--show-current']),
  text(['diff', '--stat', 'HEAD']),
  `before_snapshot=${before}\nbefore_sha256=${crypto.createHash('sha256').update(fs.readFileSync(before)).digest('hex')}\n`,
  `after_snapshot=${after}\nafter_sha256=${crypto.createHash('sha256').update(fs.readFileSync(after)).digest('hex')}\n`,
  'Only InstrumentPage.tsx was edited in this follow-up; preexisting uncommitted changes to instruments.ts remain untouched.\n',
].join('\n'));
