import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const transpile = path => ts.transpileModule(readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const session = new Map();
globalThis.sessionStorage = {
  getItem: key => session.get(key) || null,
  setItem: (key, value) => session.set(key, value),
  removeItem: key => session.delete(key),
};
const local = new Map();
globalThis.localStorage = {
  getItem: key => local.get(key) || null,
  setItem: (key, value) => local.set(key, value),
};
globalThis.window = { dispatchEvent: () => {}, Event: class {} };
const demo = {};
new Function('require', 'exports', transpile('src/issuerDemo.ts'))(name => {
  if (name === './site') return { isDemoPreview: () => true };
  if (name === './issuerSensitiveCache') return { b04StorageKeys: [], clearAccountSensitiveCache: () => {}, clearB04TenantCache: () => {} };
  if (name === './issuerFiles') return { clearAccountFileCache: () => Promise.resolve(), clearAllFilePayloads: () => Promise.resolve(), clearFilePayloads: () => {}, fileStorageKey: 'file-key' };
  if (name === './issuerIssuance') return { issuanceStorageKey: 'issuance-key' };
  throw Error(name);
}, demo);
const taxonomy = {};
new Function('require', 'exports', transpile('src/assetTaxonomyV1.ts'))(() => ({}), taxonomy);
const portfolio = {};
new Function('require', 'exports', transpile('src/issuerPortfolioV1.ts'))(name =>
  name === './issuerDemo' ? demo : taxonomy, portfolio);

test('downgrade retains tenant and asset history, blocks edits, and restores only local entitlement', () => {
  session.clear(); local.clear();
  assert.equal(demo.beginDemoAuth('standard', 'owner@example.com'), true);
  const standard = demo.getDemoTenant();
  const asset = portfolio.saveAsset(standard, portfolio.exampleAsset());
  assert.equal(demo.simulateDowngradedEntitlement('another-tenant'), false);
  assert.equal(demo.simulateDowngradedEntitlement(standard.id), true);
  const downgraded = demo.getDemoTenant();
  assert.equal(downgraded.plan, 'Free');
  assert.equal(downgraded.subscriptionState, 'downgraded');
  assert.equal(portfolio.readPortfolio(downgraded).assets[0].id, asset.id);
  demo.clearDemoContext();
  assert.equal(demo.beginDemoAuth('standard', 'owner@example.com'), true);
  assert.equal(demo.getDemoTenant().subscriptionState, 'downgraded');
  assert.equal(portfolio.readPortfolio(demo.getDemoTenant()).assets[0].id, asset.id);
  assert.throws(() => portfolio.saveAsset(standard, { ...portfolio.exampleAsset(), name: '擅自修改历史资产' }, asset.id, 1), /不能保存资产/);
  assert.equal(portfolio.readPortfolio(downgraded).assets[0].versions.length, 1);
  assert.equal(demo.simulateStandardEntitlement(downgraded.id), true);
  assert.equal(demo.getDemoTenant().subscriptionState, 'active');
  assert.equal(portfolio.readPortfolio(demo.getDemoTenant()).assets[0].id, asset.id);
});
