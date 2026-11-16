import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync('src/issuerOperationalScenarioV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const scenario = {};
const latest = item => item.versions.at(-1);
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return {};
  if (name === './issuerOrdersV1') return { exactOrderAmount: (quantity, price) => String(Number(quantity) * Number(price)) };
  if (name === './issuerAllocationV1') return { legalRightsForTokens: (_instrument, _version, quantity) => ({ quantity: String(Number(quantity) * 0.002), unit: '%', perToken: '0.002' }) };
  if (name === './issuerInvestorsV1') return {};
  if (name === './issuerPortfolioV1') return { latest };
  throw Error(name);
}, scenario);

const tenant = { id: 'issuer-a', plan: 'Standard' };
const asset = { id: 'asset-a', versions: [{ number: 1, fields: { name: '滨江办公楼' } }] };
const instrument = { id: 'instrument-a', number: 'IN-0001', versions: [{ number: 1, fields: { name: '办公楼收益权', tokenSupply: '10000' } }] };
const offering = { id: 'offering-a', number: 'OF-0001', status: 'draft', documents: [
  { id: 'doc-sub', name: '认购协议', version: 2 }, { id: 'doc-risk', name: '风险披露', version: 3 },
], versions: [{ number: 2, fields: { name: '办公楼第 1 期', price: '120', quantity: '1000', minOrder: '240', maxOrderTokens: '100', investorCap: '12000', subscriptionDocId: 'doc-sub', riskDocIds: ['doc-risk'], walletId: 'wallet-a', timezone: 'Asia/Shanghai' } }] };
const investor = { id: 'investor-a', ref: 'IV-0001', displayName: '陈*', kind: 'person' };

test('linked Sandbox scenario preserves draft Offering and distinguishes every operational fact', () => {
  const orders = scenario.buildSandboxOrders(tenant, asset, instrument, offering, investor, 1000000);
  assert.equal(offering.status, 'draft');
  assert.equal(orders.length, 5);
  assert.equal(new Set(orders.map(item => item.id)).size, 5);
  assert.ok(orders.every(item => item.source === 'internal-sandbox' && item.scenarioOfferingStatus === 'hypothetical-sandbox'));
  assert.ok(orders.every(item => item.offeringId === offering.id && item.assetId === asset.id && item.instrumentVersion === 1));
  assert.equal(orders[0].amount, '600');
  assert.equal(orders[1].payment, 'unknown');
  assert.equal(orders[2].delivery, 'confirmed');
  assert.equal(orders[2].registration, 'pending');
  assert.equal(orders[0].quoteSnapshot.offeringName, '办公楼第 1 期');
  assert.equal(orders[0].quoteSnapshot.subscriptionDocument.version, 2);
  assert.equal(orders[0].quoteSnapshot.riskDocuments[0].version, 3);
  offering.versions.push({ number: 3, fields: { ...offering.versions[0].fields, name: '已修改的第 1 期', price: '150' } });
  assert.equal(orders[0].quoteSnapshot.offeringName, '办公楼第 1 期');
  assert.equal(orders[0].unitPrice, '120');
  offering.versions.pop();
});

test('capacity reconciles Offering reservation without deducting order tokens twice', () => {
  const orders = scenario.buildSandboxOrders(tenant, asset, instrument, offering, investor, 1000000);
  const data = scenario.buildSandboxAllocationData(tenant, asset, instrument, offering, orders, investor, 1000000);
  assert.equal(data.allocations.length, 2);
  assert.equal(data.holders.length, 2);
  assert.equal(data.holders[0].registration, 'submitted');
  assert.equal(data.holders[1].registration, 'effective');
  const cap = data.capacities[0];
  assert.equal(cap.maxTokens, '10000');
  assert.equal(cap.confirmedOccupied, '6');
  assert.equal(cap.effectiveReserved, '994');
  assert.equal(cap.protectedTokens, '5');
  assert.equal(cap.availableTokens, '9000');
  assert.equal(BigInt(cap.confirmedOccupied) + BigInt(cap.effectiveReserved) + BigInt(cap.availableTokens), BigInt(cap.maxTokens));
});
