import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const standard = { id: 'issuer-a', name: '甲公司', plan: 'Standard' };
const free = { id: 'issuer-b', name: '乙公司', plan: 'Free' };
let selected = standard;
let account = 'a@example.com';
const data = new Map();
globalThis.localStorage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
const transpile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const investors = {};
new Function('require', 'exports', transpile('src/issuerInvestorsV1.ts'))(name => name.includes('issuerPortfolioV1') ? { readPortfolio: () => ({ assets: [{ id: 'as-1' }], offerings: [{ id: 'of-1', assetId: 'as-1' }] }) } : { getDemoAuth: () => ({ email: account }), getDemoTenant: () => selected }, investors);

test('Standard prepares tenant-scoped masked relationships without personal evidence', () => {
  const rows = investors.readInvestorRelations(standard);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].displayName, '陈*');
  assert.deepEqual(rows[0].assetIds, ['as-1']);
  assert.deepEqual(rows[0].offeringIds, ['of-1']);
  assert.equal(rows[0].source, 'internal-fixture');
  assert.equal(JSON.stringify(rows).includes('documentNumber'), false);
  assert.equal(investors.findInvestorRelation(standard, rows[0].id).ref, rows[0].ref);
});

test('Free new tenant is empty; account and tenant boundaries prevent cross-reading', () => {
  selected = free;
  assert.deepEqual(investors.readInvestorRelations(free), []);
  assert.equal(investors.findInvestorRelation(free, 'issuer-a-investor-1'), null);
  selected = standard;
  account = 'other@example.com';
  assert.equal(investors.findInvestorRelation(standard, 'issuer-a-investor-1')?.source, 'internal-fixture');
  account = 'a@example.com';
  assert.equal(investors.readInvestorRelations(standard).length, 5);
});

test('KYC state is separate from relationship and expired result is not passed', () => {
  const rows = investors.readInvestorRelations(standard);
  assert.equal(rows.find(row => row.kyc === 'expired').state, 'historical');
  assert.equal(investors.kycLabel.expired, '已失效／需重新核验');
  assert.match(investors.kycGuidance.passed, /认购仍须/);
  assert.equal(rows.find(row => row.state === 'unavailable').displayName, '授权不可用');
});
