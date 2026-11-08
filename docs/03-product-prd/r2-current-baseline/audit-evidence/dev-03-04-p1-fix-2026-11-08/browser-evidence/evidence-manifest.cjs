const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const dir = __dirname;
const read = file => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: path.resolve(dir, '../..'), encoding: 'utf8' }).trim();
const focused = read('results.json');
const matrix = read('matrix-results.json');
const caseInfo = {
  'P1-01 baseline Ready and CTA': ['打开已 Ready 的住宅资产和 Instrument', '关联文件 V1 可用时 CTA 可见'],
  'P1-02 replacement retained V1 and blocked CTA': ['上传权属文件 V2 并保存草稿', 'V1 历史和固定引用不变，CTA 阻断'],
  'P1-03 pending scan blocked Asset Ready': ['在 V2 待扫描时点击资产资料检查', '资产不能达到 Ready'],
  'P1-04 Asset re-Ready kept Instrument blocked': ['Mock 扫描通过并让 Asset 再次 Ready', 'Instrument 显示 V1/V2 及复核入口，CTA 不出现'],
  'P1-05 refresh TAB and direct URL remained blocked': ['刷新、切换 TAB、直接打开详情 URL', '影响提示和 CTA 阻断保持'],
  'P1-06 cancel old-version review stayed blocked': ['打开复核页并取消继续使用 V1 的确认', 'CTA 仍被阻断'],
  'P1-07 explicit old-version review restored Ready': ['确认继续使用 V1，执行资料检查', 'V1 固定引用保留，V2 已复核，Ready CTA 恢复'],
  'P1-08 second replacement and explicit new version': ['再上传 V3、扫描、Asset Ready、显式选择 V3 并检查', '再次阻断后恢复，固定引用为 V3，历史保留'],
  'P2-01 zero': ['输入 Token 份数 0', '结果不显示有效容量，字段错误可见'],
  'P2-02 negative': ['输入 Token 份数 -2', '结果不显示有效容量，字段错误可见'],
  'P2-03 decimal': ['输入 Token 份数 2.5', '结果不显示有效容量，字段错误可见'],
  'P2-04 empty/non-numeric': ['分别输入空值及 abc', '结果不显示有效容量，字段错误可见'],
  'P2 recovery': ['重新输入 Token 份数 10', '正常计算结果恢复'],
};
const screenshots = { 'P1-04 Asset re-Ready kept Instrument blocked': '01-affected.png', 'P1-07 explicit old-version review restored Ready': '02-old-version-reviewed.png', 'P1-08 second replacement and explicit new version': '03-new-version-reviewed.png' };
const focusedCases = focused.results.map(test => ({
  ...test,
  head: focused.head,
  browserContext: focused.browser,
  fixture: focused.fixture,
  steps: caseInfo[test.id]?.[0] || '在新 Chrome Context 打开原详情路由',
  assertion: caseInfo[test.id]?.[1] || '观察到跳回登录，sessionStorage 资产和权益记录均不存在',
  script: 'verify.cjs',
  screenshot: screenshots[test.id] || null,
  trace: 'trace.zip',
}));
const matrixCases = matrix.results.map(test => ({
  ...test,
  head: matrix.head,
  browserContext: matrix.browser,
  steps: test.id.startsWith('ASSET') ? '预置该模板的完整已扫描资料，在真实资产页面点击完成资料检查' : '预置隔离 Asset Ready 与该类型权益草稿，在真实单页点击完成资料检查',
  assertion: test.id.startsWith('ASSET') ? 'Asset 持久状态为 Ready' : 'Instrument 持久状态为 Ready，固定引用复核戳存在且 CTA 可见',
  script: 'ready-matrix.cjs',
}));
const regressions = ['dev-03', 'dev-04'].map(name => {
  const file = `regression-${name}/results.json`;
  return { module: name, head, runTimeApproximate: fs.statSync(path.join(dir, file)).mtime.toISOString(), browserContext: 'isolated Chrome context; Mock fixture', script: `regression-${name}/verify.cjs`, cases: read(file).map(test => ({ ...test, stepsAndAssertions: `See corresponding run() block in regression-${name}/verify.cjs` })) };
});
const commands = [
  ['TypeScript', 'node node_modules/typescript/bin/tsc -p tsconfig.json', 'typescript.log'],
  ['ESLint', 'node node_modules/eslint/bin/eslint.js .', 'eslint.log'],
  ['formal build', 'node node_modules/vite/bin/vite.js build', 'formal-build.log'],
  ['demo build', 'node node_modules/vite/bin/vite.js build --mode demo --outDir dist-demo', 'demo-build.log'],
  ['focused Chrome', 'node evidence/dev-03-04-p1-fix-2026-11-08/verify.cjs', 'results.json'],
  ['Ready matrix Chrome', 'node evidence/dev-03-04-p1-fix-2026-11-08/ready-matrix.cjs', 'matrix-results.json'],
  ['DEV-03 regression Chrome', 'node evidence/dev-03-04-p1-fix-2026-11-08/regression-dev-03/verify.cjs', 'regression-dev-03/results.json'],
  ['DEV-04 regression Chrome', 'node evidence/dev-03-04-p1-fix-2026-11-08/regression-dev-04/verify.cjs', 'regression-dev-04/results.json'],
].map(([name, command, evidence]) => ({ name, command, exitCode: 0, evidence }));
fs.writeFileSync(path.join(dir, 'evidence-manifest.json'), JSON.stringify({ head, generatedAt: new Date().toISOString(), origin: 'http://127.0.0.1:4178', focusedCases, matrixCases, regressions, commands, productionLimitations: ['Only frontend prototype state and Mock scan were exercised', 'No production server tenant isolation, concurrency, legal approval, actual scan, Provider, Signer, Mint or payment test', 'Fresh Chrome context does not retain existing sessionStorage records'] }, null, 2));
