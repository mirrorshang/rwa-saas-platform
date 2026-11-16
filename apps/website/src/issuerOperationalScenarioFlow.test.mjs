import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';

const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
globalThis.window = { Event: class {}, dispatchEvent() {} };
globalThis.crypto ||= { randomUUID };
const tenant = { id: 'operator', name: '云岱发行有限公司', plan: 'Standard', role: '企业管理员' };
const demo = { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => tenant };
const load = (path, requireModule) => { const exports = {}; new Function('require', 'exports', compile(path))(requireModule, exports); return exports; };
const taxonomy = load('src/assetTaxonomyV1.ts', () => ({}));
const portfolio = load('src/issuerPortfolioV1.ts', name => name === './issuerDemo' ? demo : taxonomy);
const fakeDocuments = { ...portfolio, addExampleDocument: async (_tenant, owner, ownerId, kind) => {
  const key = 'wdex-issuer-portfolio-v1';
  const all = JSON.parse(memory.get(key));
  const record = all['owner@example.com/operator'][`${owner}s`].find(item => item.id === ownerId);
  const doc = { id: randomUUID(), kind, name: `${kind}.pdf`, version: 1, size: 1024, mime: 'application/pdf', status: 'passed', order: Date.now(), createdAt: Date.now() };
  record.documents.push(doc);
  memory.set(key, JSON.stringify(all));
  return doc;
} };
const orders = load('src/issuerOrdersV1.ts', () => demo);
const investors = load('src/issuerInvestorsV1.ts', name => name === './issuerDemo' ? demo : portfolio);
const allocation = load('src/issuerAllocationV1.ts', name => name === './issuerDemo' ? demo : name === './issuerInvestorsV1' ? investors : name === './issuerOrdersV1' ? orders : portfolio);
const scenario = load('src/issuerOperationalScenarioV1.ts', name => name === './issuerDemo' ? demo : name === './issuerOrdersV1' ? orders : name === './issuerAllocationV1' ? allocation : name === './issuerInvestorsV1' ? investors : fakeDocuments);

test('one tenant Sandbox chain creates valid linked portfolio and preserves it on repeat', async () => {
  await scenario.ensureSandboxOperationalChain(tenant);
  const data = portfolio.readPortfolio(tenant);
  const placed = orders.readOrders(tenant);
  const result = allocation.readAllocationData(tenant);
  assert.equal(data.assets.length, 1);
  assert.equal(data.assets[0].status, 'ready');
  assert.equal(data.instruments.length, 1);
  assert.equal(data.instruments[0].status, 'ready');
  assert.equal(data.offerings.length, 1);
  assert.equal(data.offerings[0].status, 'draft');
  assert.equal(portfolio.offeringIssues(portfolio.latest(data.offerings[0]).fields, data.assets[0], data.instruments[0], data.offerings[0].documents, data.wallets, data.offerings[0]).length, 0);
  assert.equal(placed.length, 5);
  assert.ok(placed.every(item => item.assetId === data.assets[0].id && item.offeringId === data.offerings[0].id));
  assert.equal(result.allocations.length, 2);
  assert.equal(result.holders.length, 2);
  assert.equal(allocation.reconciliationState(result.holders[1], data.instruments[0]), 'consistent');
  await scenario.ensureSandboxOperationalChain(tenant);
  assert.equal(portfolio.readPortfolio(tenant).assets.length, 1);
  assert.equal(orders.readOrders(tenant).length, 5);
  assert.equal(allocation.readAllocationData(tenant).allocations.length, 2);
});

test('concurrent page visits share one preparation and do not duplicate source records', async () => {
  memory.clear();
  await Promise.all([scenario.ensureSandboxOperationalChain(tenant), scenario.ensureSandboxOperationalChain(tenant)]);
  assert.equal(portfolio.readPortfolio(tenant).assets.length, 1);
  assert.equal(orders.readOrders(tenant).length, 5);
  assert.equal(allocation.readAllocationData(tenant).holders.length, 2);
});

test('corrupted browser records are preserved during automatic preparation', async () => {
  memory.clear();
  memory.set('wdex-issuer-orders-v1', '{invalid');
  await assert.rejects(scenario.ensureSandboxOperationalChain(tenant), /本地业务记录无法读取/);
  assert.equal(memory.get('wdex-issuer-orders-v1'), '{invalid');
  assert.equal(memory.get('wdex-issuer-portfolio-v1'), undefined);
});

test('lost Offering reference stops regeneration without changing existing orders', async () => {
  memory.clear();
  await scenario.ensureSandboxOperationalChain(tenant);
  const before = memory.get('wdex-issuer-orders-v1');
  const all = JSON.parse(memory.get('wdex-issuer-portfolio-v1'));
  all['owner@example.com/operator'].offerings = [];
  memory.set('wdex-issuer-portfolio-v1', JSON.stringify(all));
  await assert.rejects(scenario.ensureSandboxOperationalChain(tenant), /引用不可用/);
  assert.equal(memory.get('wdex-issuer-orders-v1'), before);
});
