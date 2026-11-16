import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'tenant-a', plan: 'Standard' };
const free = { id: 'tenant-a', plan: 'Free' };
const other = { id: 'tenant-b', plan: 'Standard' };
let selected = tenant;
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const asset = { id: 'asset-1', number: 'A-1', status: 'ready', versions: [{ number: 1, fields: { name: '住宅资产' } }] };
const instrument = { id: 'instrument-1', assetId: asset.id, status: 'ready', versions: [{ number: 1, fields: {
  name: '收益权益', type: 'income', subjectName: '发行责任主体', legalDocId: 'legal-1', total: '100', tokenSupply: '100',
} }] };
const offering = { id: 'offering-1', assetId: asset.id, instrumentId: instrument.id, instrumentVersion: 1 };
let portfolio = { assets: [asset], instruments: [instrument], offerings: [offering] };
let allocation = { allocations: [], holders: [] };
let funds = { receipts: [] };
let orders = [];
const source = ts.transpileModule(readFileSync('src/issuerTokenV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const model = {};
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
  if (name === './issuerPortfolioV1') return { readPortfolio: () => portfolio,
    tokenMapping: fields => fields.tokenSupply === '100' ? { value: '1', unit: '%', error: '' } : { value: '', unit: '%', error: '不能整除' } };
  if (name === './issuerAllocationV1') return { readAllocationData: () => allocation };
  if (name === './issuerFundsV1') return { readFundsData: () => funds };
  if (name === './issuerOrdersV1') return { readOrders: () => orders };
  throw Error(name);
}, model);

test('one instrument version has one tenant-scoped plan with append-only draft revisions', () => {
  storage.clear(); selected = tenant;
  const first = model.saveTokenPlanDraft(tenant, instrument.id, 1, ' 初始方案 ');
  assert.equal(first.versions.length, 1);
  assert.equal(first.versions[0].note, '初始方案');
  const same = model.saveTokenPlanDraft(tenant, instrument.id, 1, '初始方案');
  assert.equal(same.id, first.id);
  assert.equal(same.versions.length, 1);
  const changed = model.saveTokenPlanDraft(tenant, instrument.id, 1, '更新后的业务准备说明');
  assert.equal(changed.versions.length, 2);
  assert.equal(changed.deployment, 'not-requested');
  assert.equal(model.readTokenData(tenant).plans.length, 1);
  selected = other;
  assert.deepEqual(model.readTokenData(other), { plans: [], chainEvents: [] });
});

test('missing approved network and template block production while Free may prepare a draft', () => {
  selected = tenant;
  assert.match(model.tokenPlanIssues(tenant, instrument, 1).join('；'), /网络、标准及合约模板/);
  assert.equal(model.tokenPlanContext(tenant, instrument, 1).mapping.value, '1');
  selected = free;
  const draft = model.saveTokenPlanDraft(free, instrument.id, 1, 'Free 业务准备');
  assert.equal(draft.deployment, 'not-requested');
  selected = tenant;
  assert.throws(() => model.saveTokenPlanDraft(tenant, instrument.id, 1, 'x'.repeat(1001)), /1,000/);
  portfolio = { ...portfolio, instruments: [{ ...instrument, status: 'draft' }] };
  assert.throws(() => model.saveTokenPlanDraft(tenant, instrument.id, 1, '资料未就绪'), /资料检查/);
  portfolio = { assets: [asset], instruments: [instrument], offerings: [offering] };
});

test('Sandbox Token plan follows an existing offering and never overwrites user revisions', () => {
  storage.clear(); selected = tenant;
  orders = [{ id: 'order-1', tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id, assetId: asset.id }];
  const first = model.ensureSandboxTokenPlan(tenant);
  assert.equal(first.instrumentId, instrument.id);
  assert.equal(first.instrumentVersion, 1);
  assert.equal(first.deployment, 'not-requested');
  assert.equal(model.readTokenData(tenant).chainEvents.length, 0);
  model.saveTokenPlanDraft(tenant, instrument.id, 1, '用户修改后的方案');
  const again = model.ensureSandboxTokenPlan(tenant);
  assert.equal(again.versions.length, 2);
  assert.equal(again.versions.at(-1).note, '用户修改后的方案');
  assert.equal(model.readTokenData(tenant).plans.length, 1);
  orders = [];
  selected = other;
  assert.equal(model.ensureSandboxTokenPlan(other), null);
});

test('delivery candidates retain allocation and funds facts but never create Mint', () => {
  selected = tenant;
  allocation = { allocations: [{ id: 'allocation-1', tenantId: tenant.id, orderId: 'order-1', offeringId: 'offering-1',
    instrumentId: instrument.id, instrumentVersion: 1, tokenQuantity: '5', state: 'confirmed', decisionRef: 'decision-1' }],
  holders: [{ allocationId: 'allocation-1', registration: 'effective' }] };
  funds = { receipts: [{ orderId: 'order-1', offeringId: 'offering-1', finality: 'final', match: 'matched' }] };
  const candidates = model.tokenDeliveryCandidates(tenant);
  assert.equal(candidates[0].funds, 'final-matched');
  assert.equal(candidates[0].tokenQuantity, '5');
  assert.match(candidates[0].blockers.join('；'), /真实合约部署/);
  assert.equal(model.readTokenData(tenant).chainEvents.length, 0);
  selected = other;
  assert.equal(model.tokenDeliveryCandidates(other).length, 0);
});

test('malformed Token storage is preserved instead of replaced', () => {
  selected = tenant;
  storage.set('wdex-issuer-token-v1', '{broken');
  assert.equal(model.readTokenData(tenant), null);
  assert.throws(() => model.saveTokenPlanDraft(tenant, instrument.id, 1, '新方案'), /无法读取/);
  assert.equal(storage.get('wdex-issuer-token-v1'), '{broken');
});

test('chain events remain read only and isolated to the current tenant', () => {
  storage.clear(); selected = tenant;
  const valid = { id: 'event-1', tenantId: tenant.id, planId: 'plan-1', kind: 'mint', txHash: '0xabc', finality: 'final', at: 100, source: 'authoritative' };
  storage.set('wdex-issuer-token-v1', JSON.stringify({
    'owner@example.com/tenant-a': { plans: [], chainEvents: [valid, { ...valid, id: 'other-event', tenantId: other.id },
      { ...valid, id: 'sandbox-event', source: 'internal-sandbox' }] },
  }));
  assert.deepEqual(model.readTokenData(tenant).chainEvents, [valid]);
  selected = other;
  assert.deepEqual(model.readTokenData(other).chainEvents, []);
  assert.equal(model.ensureSandboxTokenPlan(other), null);
});
