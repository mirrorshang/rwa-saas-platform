import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const standard = { id: 'tenant-a', plan: 'Standard' };
const free = { id: 'tenant-a', plan: 'Free' };
const other = { id: 'tenant-b', plan: 'Standard' };
let selected = standard;
let kyb = { status: 'passed', savedAt: 100, reviewNotes: '' };
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const portfolio = { assets: [{ id: 'asset-1', number: 'A-1', status: 'draft', events: [{ at: 200 }],
  versions: [{ fields: { name: '住宅资产' } }] }], instruments: [], offerings: [] };
const otherPortfolio = { assets: [{ id: 'asset-2', number: 'A-2', status: 'draft', events: [{ at: 220 }],
  versions: [{ fields: { name: '商业资产' } }] }], instruments: [], offerings: [] };
let fundIssues = [{ id: 'FI-receipt-1', tenantId: standard.id, receiptId: 'receipt-1', offeringId: 'offering-1',
  title: '到账结果无法确认', nextStep: '查询原事件', amount: '100', state: 'unknown', updatedAt: 300 }];
let allocationIssues = [{ id: 'AI-allocation-1', tenantId: standard.id, offeringId: 'offering-1',
  title: '登记资料待核', reason: '登记回执未确认', nextStep: '查看原配售', state: 'open', updatedAt: 250 }];
const source = ts.transpileModule(readFileSync('src/issuerSharedWorkV1.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const model = {};
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
  if (name === './issuerKybFlow') return { getKybRecord: () => kyb };
  if (name === './issuerPortfolioV1') return { readPortfolio: tenant => tenant.id === other.id ? otherPortfolio : portfolio,
    latest: item => item.versions.at(-1) };
  if (name === './issuerFundsV1') return { readFundsData: () => ({}), deriveFundsIssues: () => fundIssues };
  if (name === './issuerAllocationV1') return { readAllocationIssues: () => allocationIssues };
  throw Error(name);
}, model);

test('KYB guard and Free package omit operational tasks and anomalies', () => {
  selected = standard; kyb = { status: 'supplement', savedAt: 100, reviewNotes: '补充企业文件' };
  const blocked = model.readSharedWork(standard);
  assert.equal(blocked.tasks.length, 1);
  assert.equal(blocked.tasks[0].module, '企业管理');
  assert.equal(blocked.issues.length, 0);
  kyb = { status: 'passed', savedAt: 100, reviewNotes: '' };
  selected = free;
  const allowed = model.readSharedWork(free);
  assert.equal(allowed.tasks.length, 1);
  assert.equal(allowed.tasks[0].sourceId, 'asset-1');
  assert.equal(allowed.issues.length, 0);
});

test('downgraded tenant sees historical issues without ordinary draft editing tasks', () => {
  const downgraded = { ...free, subscriptionState: 'downgraded' };
  selected = downgraded;
  const work = model.readSharedWork(downgraded);
  assert.equal(work.tasks.some(item => item.id === 'asset-asset-1'), false);
  assert.equal(work.issues.length, 2);
  assert.match(work.issues[0].nextStep, /普通业务编辑已停止/);
});

test('Standard issues point to original business objects and notices only change read state', () => {
  storage.clear(); selected = standard;
  const work = model.readSharedWork(standard);
  assert.equal(work.issues.length, 2);
  assert.equal(work.issues[0].state, 'unknown');
  assert.equal(work.issues[0].path, '/issuer/receipts/receipt/receipt-1');
  const first = model.readSharedNotices(standard);
  assert.equal(first.filter(item => !item.read).length, work.tasks.length);
  model.markSharedNoticeRead(standard, [first[0].id]);
  assert.equal(model.readSharedNotices(standard).filter(item => item.read).length, 1);
  assert.deepEqual(model.readSharedWork(standard), work);
  assert.throws(() => model.markSharedNoticeRead(standard, ['foreign-id']), /无权访问/);
});

test('notice read state stays in account and tenant scope, corrupt storage is preserved', () => {
  selected = other;
  assert.equal(model.readSharedNotices(other).length, 1);
  assert.equal(model.readSharedNotices(other)[0].read, false);
  assert.equal(model.readSharedNotices(other)[0].sourceId, 'asset-2');
  selected = standard;
  storage.set('wdex-issuer-shared-notice-read-v1', '{broken');
  assert.equal(model.readSharedNotices(standard), null);
  assert.throws(() => model.markSharedNoticeRead(standard, ['asset-1']), /暂不可保存/);
  assert.equal(storage.get('wdex-issuer-shared-notice-read-v1'), '{broken');
  storage.set('wdex-issuer-shared-notice-read-v1', '{"owner@example.com/tenant-a":1}');
  assert.equal(model.readSharedNotices(standard), null);
  assert.throws(() => model.markSharedNoticeRead(standard, ['asset-1']), /暂不可保存/);
  fundIssues = []; allocationIssues = [];
});

test('notice history retains the earlier source state after the business item changes', () => {
  storage.clear(); selected = standard;
  assert.equal(model.ensureSharedNoticeHistory(standard), true);
  const initial = model.readSharedNotices(standard).filter(item => item.sourceId === 'asset-1');
  assert.equal(initial.length, 1);
  portfolio.assets[0].status = 'ready';
  portfolio.assets[0].events.push({ at: 400 });
  assert.equal(model.ensureSharedNoticeHistory(standard), true);
  const history = model.readSharedNotices(standard).filter(item => item.sourceId === 'asset-1');
  assert.equal(history.length, 2);
  assert.deepEqual(new Set(history.map(item => item.state)), new Set(['pending', 'done']));
  portfolio.assets[0].status = 'draft';
  portfolio.assets[0].events.pop();
});
