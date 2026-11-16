import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'issuer-a', plan: 'Standard' };
const other = { id: 'issuer-b', plan: 'Standard' };
let selected = tenant;
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const source = ts.transpileModule(readFileSync('src/issuerOrdersV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const orders = {};
new Function('require', 'exports', source)(() => ({ getDemoAuth: () => ({ email: 'a@example.com' }), getDemoTenant: () => selected }), orders);
const base = { id: 'o-1', number: 'SO-1', tenantId: 'issuer-a', investorId: 'i-1', investorRef: 'IV-0001', assetId: 'a-1', offeringId: 'of-1', offeringNumber: 'OF-1', offeringVersion: 1, instrumentVersion: 1,
  quantity: '3', unitPrice: '1.234567', amount: '3.703701', currency: 'U', network: 'OP Mainnet', createdAt: 1, timezone: 'UTC', quoteStatus: 'valid', signatureStatus: 'signed', payment: 'awaiting', capacity: 'reserved', registration: 'none', delivery: 'none', canCancelAuthoritative: true, events: [], source: 'internal-sandbox' };

test('exact quote uses integer Token quantity and six-place U arithmetic', () => {
  assert.equal(orders.exactOrderAmount('3', '1.234567'), '3.703701');
  assert.equal(orders.exactOrderAmount('0', '1'), null);
  assert.equal(orders.exactOrderAmount('1.5', '1'), null);
});

test('payment and delivery are independent; completed does not imply legal registration', () => {
  assert.equal(orders.orderProgress(base), 'awaiting-payment');
  assert.equal(orders.orderProgress({ ...base, payment: 'final-matched' }), 'fulfilling');
  assert.equal(orders.orderProgress({ ...base, payment: 'final-matched', delivery: 'confirmed', registration: 'pending' }), 'completed');
  assert.equal(orders.orderProgress({ ...base, payment: 'unknown', expiredAt: 2 }), 'payment-review');
});

test('cancellation stays blocked on Unknown, confirmed payment and cross-tenant access', () => {
  assert.equal(orders.canRequestOrderCancellation(tenant, base), true);
  assert.equal(orders.canRequestOrderCancellation(tenant, { ...base, payment: 'unknown' }), false);
  assert.equal(orders.canRequestOrderCancellation(tenant, { ...base, payment: 'final-matched' }), false);
  assert.equal(orders.canRequestOrderCancellation(other, base), false);
  selected = other;
  assert.equal(orders.findOrder(other, 'o-1'), null);
});

test('order list excludes foreign tenant rows even if local storage bucket is mixed', () => {
  selected = tenant;
  storage.set('wdex-issuer-orders-v1', JSON.stringify({ 'a@example.com/issuer-a': [base, { ...base, id: 'foreign', tenantId: 'issuer-b' }] }));
  assert.deepEqual(orders.readOrders(tenant).map(item => item.id), ['o-1']);
});

test('sandbox cancellation records one pending request without declaring cancellation or releasing capacity', () => {
  selected = tenant;
  storage.set('wdex-issuer-orders-v1', JSON.stringify({ 'a@example.com/issuer-a': [base] }));
  assert.throws(() => orders.requestSandboxCancellation(tenant, 'o-1', 'other', '', false), /确认/);
  const request = orders.requestSandboxCancellation(tenant, 'o-1', 'other', '重复订单待核对', true);
  assert.equal(request.status, 'pending');
  assert.equal(orders.requestSandboxCancellation(tenant, 'o-1', 'other', '重复订单待核对', true).id, request.id);
  const saved = orders.findOrder(tenant, 'o-1');
  assert.equal(saved.cancelledAt, undefined);
  assert.equal(saved.capacity, 'reserved');
  assert.equal(saved.payment, 'awaiting');
  assert.equal(saved.events.length, 1);
  assert.equal(orders.canRequestOrderCancellation(tenant, saved), false);
});

test('order list filters use business timezone and keep independent status facts', () => {
  const first = { ...base, id: 'o-2', number: 'SO-2', createdAt: Date.parse('2026-11-12T16:30:00Z'), timezone: 'Asia/Shanghai' };
  const issue = { ...base, id: 'o-3', number: 'SO-3', createdAt: Date.parse('2026-11-12T15:30:00Z'), payment: 'unknown' };
  const filters = { search: 'IV-0001', assetId: '', offeringId: '', progress: '', payment: '', onlyIssues: false, quick: 'all', fromDate: '2026-11-13', toDate: '2026-11-13' };
  assert.equal(orders.orderBusinessDate(first.createdAt, first.timezone), '2026-11-13');
  assert.deepEqual(orders.filterOrders([first, issue], filters).map(item => item.id), ['o-2']);
  assert.deepEqual(orders.filterOrders([first, issue], { ...filters, fromDate: '', quick: 'attention' }).map(item => item.id), ['o-3']);
  assert.equal(orders.filterOrders([first], { ...filters, fromDate: '2026-11-14' }).length, 0);
});

test('attention view retains pending cancellation and completed orders with unresolved registration', () => {
  const cancellation = { ...base, id: 'cancel-request', cancellationRequest: { id: 'cr-1', status: 'pending' } };
  const legalPending = { ...base, id: 'legal-pending', payment: 'final-matched', delivery: 'confirmed', registration: 'pending' };
  const complete = { ...legalPending, id: 'fully-reconciled', registration: 'effective' };
  const filters = { search: '', assetId: '', offeringId: '', progress: '', payment: '', onlyIssues: false, quick: 'attention', fromDate: '', toDate: '' };
  assert.equal(orders.orderNeedsAttention(cancellation), true);
  assert.equal(orders.orderProgress(legalPending), 'completed');
  assert.equal(orders.orderNeedsAttention(legalPending), true);
  assert.equal(orders.orderNeedsAttention(complete), false);
  assert.deepEqual(orders.filterOrders([cancellation, legalPending, complete], filters).map(item => item.id), ['cancel-request', 'legal-pending']);
});

test('detail next step follows independent payment, capacity, delivery and registration facts', () => {
  assert.equal(orders.orderNextStep(base).section, 'order-payment');
  assert.equal(orders.orderNextStep({ ...base, payment: 'unknown' }).section, 'order-payment');
  assert.equal(orders.orderNextStep({ ...base, payment: 'difference' }).section, 'order-exception');
  assert.equal(orders.orderNextStep({ ...base, payment: 'final-matched', capacity: 'protected' }).section, 'order-capacity');
  assert.equal(orders.orderNextStep({ ...base, payment: 'final-matched', capacity: 'allocated', delivery: 'pending' }).section, 'order-delivery');
  assert.equal(orders.orderNextStep({ ...base, payment: 'final-matched', delivery: 'confirmed', registration: 'pending' }).section, 'order-registration');
  assert.equal(orders.orderNextStep({ ...base, payment: 'final-matched', delivery: 'confirmed', registration: 'effective' }).section, 'order-exception');
});

test('corrupt order storage is reported and never overwritten by scenario or cancellation', () => {
  selected = tenant;
  const broken = '{unfinished';
  storage.set('wdex-issuer-orders-v1', broken);
  assert.equal(orders.readOrders(tenant), null);
  assert.throws(() => orders.addSandboxOrders(tenant, [base]), /无法读取/);
  assert.throws(() => orders.requestSandboxCancellation(tenant, base.id, 'other', '', true), /无法读取/);
  assert.equal(storage.get('wdex-issuer-orders-v1'), broken);
});
