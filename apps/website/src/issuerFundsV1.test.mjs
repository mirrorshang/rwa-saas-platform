import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'tenant-a', plan: 'Standard' };
const other = { id: 'tenant-b', plan: 'Standard' };
let selected = tenant;
const storage = new Map();
let orders = [];
let allocationData = { allocations: [], holders: [] };
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const source = ts.transpileModule(readFileSync('src/issuerFundsV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = {};
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
  if (name === './issuerOrdersV1') return { readOrders: () => orders };
  if (name === './issuerAllocationV1') return { readAllocationData: () => allocationData };
  if (name === './issuerPortfolioV1') return { readPortfolio: () => ({ wallets: [] }), latest: item => item.versions.at(-1) };
  throw Error(name);
}, module);

const makeOrder = (index, payment) => ({ id: `order-${index}`, number: `SO-${index}`, tenantId: tenant.id,
  source: 'internal-sandbox', offeringId: 'offering-1', offeringVersion: 1, amount: `${index * 10}`, createdAt: index * 1000, payment });

test('U arithmetic remains exact to six decimals', () => {
  assert.equal(module.parseU('12.000001'), 12_000_001n);
  assert.equal(module.formatU(module.parseU('12.000001') - 1n), '12');
  assert.equal(module.parseU('1.0000001'), null);
  assert.equal(module.parseU('-1'), null);
});

test('Sandbox funds keep instructions, observations and order payment facts independent', () => {
  selected = tenant;
  orders = [makeOrder(1, 'awaiting'), makeOrder(2, 'unknown'), makeOrder(3, 'final-matched'),
    makeOrder(4, 'final-matched'), makeOrder(5, 'difference')];
  const built = module.buildSandboxFunds(tenant, orders, 100000);
  assert.equal(built.instructions.length, 5);
  assert.equal(built.receipts.length, 4);
  assert.equal(built.receipts.filter(item => item.match === 'matched').length, 2);
  assert.equal(built.receipts.find(item => item.match === 'underpaid').amount, '49');
  assert.equal(built.receipts.find(item => item.finality === 'unknown').matchedAmount, '0');
  assert.equal(built.instructions[0].state, 'internal-preview');
  assert.equal(orders[0].payment, 'awaiting');
  const issues = module.deriveFundsIssues(built);
  assert.deepEqual(issues.map(item => item.category).sort(), ['underpaid', 'unknown']);
});

test('funds preparation is tenant scoped, idempotent and preserves malformed storage', () => {
  storage.delete('wdex-issuer-funds-v1');
  selected = tenant;
  const first = module.ensureSandboxFunds(tenant);
  const second = module.ensureSandboxFunds(tenant);
  assert.deepEqual(second, first);
  const old = JSON.parse(storage.get('wdex-issuer-funds-v1'));
  delete old['owner@example.com/tenant-a'].refundEligibility;
  storage.set('wdex-issuer-funds-v1', JSON.stringify(old));
  const migrated = module.ensureSandboxFunds(tenant);
  assert.equal(migrated.refundEligibility.length, 1);
  assert.deepEqual(migrated.receipts, first.receipts);
  selected = other;
  assert.equal(module.readFundsData(other).receipts.length, 0);
  selected = tenant;
  storage.set('wdex-issuer-funds-v1', '{bad');
  assert.throws(() => module.ensureSandboxFunds(tenant), /无法读取/);
  assert.equal(storage.get('wdex-issuer-funds-v1'), '{bad');
});

test('manual matching only submits review and never changes finality or matched amount', () => {
  selected = tenant;
  storage.delete('wdex-issuer-funds-v1');
  const data = module.ensureSandboxFunds(tenant);
  const receipt = data.receipts.find(item => item.match === 'underpaid');
  const order = orders.find(item => item.id === receipt.orderId);
  const evidenceRef = receipt.evidenceVersions[0].ref;
  assert.throws(() => module.submitMatchReview(tenant, receipt.id, order.id, '太短', evidenceRef), /10–500/);
  assert.throws(() => module.submitMatchReview(tenant, receipt.id, order.id, '请核对该笔实收与订单应付款差额。', 'other-version'), /固定证据/);
  const review = module.submitMatchReview(tenant, receipt.id, order.id, '请核对该笔实收与订单应付款差额。', evidenceRef);
  assert.equal(review.state, 'submitted');
  assert.equal(module.submitMatchReview(tenant, receipt.id, order.id, '请核对该笔实收与订单应付款差额。', evidenceRef).id, review.id);
  assert.equal(module.readFundsData(tenant).receipts.find(item => item.id === receipt.id).match, 'underpaid');
  assert.equal(order.payment, 'difference');
  const unknown = data.receipts.find(item => item.finality === 'unknown');
  assert.throws(() => module.submitMatchReview(tenant, unknown.id, unknown.orderId, '请核对当前到账结果和订单。', unknown.evidenceVersions[0].ref), /条件待核/);
  selected = other;
  assert.throws(() => module.submitMatchReview(other, receipt.id, order.id, '请核对当前到账结果和订单。', evidenceRef), /条件待核/);
});

test('refund request uses verified original receipt and keeps approval and execution separate', () => {
  selected = tenant;
  allocationData = { allocations: [], holders: [] };
  storage.delete('wdex-issuer-funds-v1');
  const data = module.ensureSandboxFunds(tenant);
  const eligibility = data.refundEligibility[0];
  assert.equal(eligibility.orderId, 'order-3');
  const input = { amount: '5', reason: 'offering-failed', note: '请按固定发行条款核对本次退款申请。', basisRef: eligibility.basisRef, confirmed: true };
  const request = module.submitRefundRequest(tenant, eligibility.id, input);
  assert.equal(request.approval, 'requested');
  assert.equal(request.execution, 'not-submitted');
  assert.equal(request.actualOut, '0');
  assert.equal(module.submitRefundRequest(tenant, eligibility.id, input).id, request.id);
  assert.equal(module.refundRequestRoom(module.readFundsData(tenant), eligibility), '25');
  assert.throws(() => module.submitRefundRequest(tenant, eligibility.id, { ...input, amount: '26' }), /额度/);
  assert.throws(() => module.updateRefundApproval(tenant, request.id, 'approved-scoped'), /固定决定依据/);
  const approved = module.updateRefundApproval(tenant, request.id, 'approved-scoped', 'SB-REFUND-AUTH-V1');
  assert.equal(approved.approval, 'approved-scoped');
  assert.equal(approved.execution, 'not-submitted');
  assert.equal(module.readFundsData(tenant).receipts.find(item => item.id === eligibility.receiptId).match, 'matched');
  assert.equal(orders.find(item => item.id === eligibility.orderId).payment, 'final-matched');
});

test('refund blocks effective holder and unverified target without rewriting source data', () => {
  selected = tenant;
  storage.delete('wdex-issuer-funds-v1');
  const data = module.ensureSandboxFunds(tenant);
  const eligibility = data.refundEligibility[0];
  const input = { amount: '1', reason: 'order-cancelled', note: '请按原受权订单及收款事件核对退款。', basisRef: eligibility.basisRef, confirmed: true };
  allocationData = { allocations: [{ id: 'allocation-1', orderId: eligibility.orderId }], holders: [{ allocationId: 'allocation-1', tenantId: tenant.id, registration: 'effective' }] };
  assert.throws(() => module.submitRefundRequest(tenant, eligibility.id, input), /到期与退出/);
  allocationData = { allocations: [], holders: [] };
  const raw = JSON.parse(storage.get('wdex-issuer-funds-v1'));
  raw['owner@example.com/tenant-a'].refundEligibility[0].targetVerified = false;
  storage.set('wdex-issuer-funds-v1', JSON.stringify(raw));
  assert.throws(() => module.submitRefundRequest(tenant, eligibility.id, input), /目标/);
  assert.equal(module.readFundsData(tenant).refunds.length, 0);
});
