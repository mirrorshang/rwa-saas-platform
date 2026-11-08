const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');
const root = 'D:/RWA-SAAS-Issuer-R2';
const out = __dirname;
const paths = [
  'prototypes/website-ui-preview/src/issuer-r2/InstrumentPage.tsx',
  'prototypes/website-ui-preview/src/issuer-r2/data/instruments.ts',
];
const git = args => {
  const r = cp.spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.error) throw r.error;
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
};
const run = args => {
  const r = git(args);
  return `$ git ${args.join(' ')}\nexit_code=${r.code}\n${r.stdout}${r.stderr ? '\n[stderr]\n' + r.stderr : ''}\n`;
};

const diff = cp.spawnSync('git', ['diff', 'HEAD', '--', ...paths], { cwd: root, maxBuffer: 20 * 1024 * 1024 });
if (diff.status !== 0) throw Error('git diff failed: ' + diff.stderr.toString());
fs.writeFileSync(path.join(out, 'source-diff.patch'), diff.stdout);

fs.writeFileSync(path.join(out, 'git-status.txt'), [
  run(['status', '--porcelain=v2', '--branch']),
  run(['status', '--short']),
  run(['ls-files', '-m']),
  run(['ls-files', '--others', '--exclude-standard']),
].join('\n'));
fs.writeFileSync(path.join(out, 'git-diff-check.txt'), run(['diff', '--check']));

const trace = path.join(out, 'browser-evidence', 'trace.zip');
const traceBytes = fs.readFileSync(trace);
fs.writeFileSync(path.join(out, 'git-summary.txt'), [
  `capture_time_utc=${new Date().toISOString()}`,
  run(['rev-parse', 'HEAD']),
  run(['branch', '--show-current']),
  run(['diff', '--stat', 'HEAD']),
  run(['diff', '--name-only', 'HEAD']),
  `trace_path=browser-evidence/trace.zip\ntrace_size_bytes=${traceBytes.length}\ntrace_sha256=${crypto.createHash('sha256').update(traceBytes).digest('hex')}\n`,
].join('\n'));
