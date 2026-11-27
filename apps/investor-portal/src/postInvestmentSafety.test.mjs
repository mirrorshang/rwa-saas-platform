import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDemoDistributionState, claimBlockReason, createDemoDistribution, createMockPrincipalBasis, distributionAmounts, paidIncomeCents, paidPrincipalCents, payMockPrincipal, principalBasisKey, readAllDistributions, readPrincipalBasis, saveDistribution, savePrincipalBasis, startMockClaim } from './postInvestment.ts';
import { saveOrder } from './subscription.ts';
import { saveTicket } from './tickets.ts';

const channel = { kind: 'm' };
const account = { id: 'safety-account', email: 'safety@example.test' };
const otherAccount = { id: 'other-account', email: 'other@example.test' };
const offering = { id: 'debt-01', issuerId: 'cedar', issuerName: '杉岸', title: '债权计划', category: '企业借款债权', right: '债权' };
const now = '2026-11-27T03:00:00Z';
const order = {
  id: 'safety-order', requestId: 'req-1', accountId: account.id, channelPath: '/m', issuerId: offering.issuerId, offeringId: offering.id,
  units: 10, priceCents: 5000, amountCents: 50000, createdAt: now, updatedAt: now, expiresAt: now,
  documents: [], mockConfirmedAt: now, legalSignatureValid: false,
  payment: 'matched', allocation: 'confirmed', registration: 'confirmed', delivery: 'pending',
  exception: 'none', refund: 'none'
};
const holding = { order, offering };

function setup() {
  const values = new Map();
  globalThis.localStorage = {
    get length() { return values.size; },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  saveOrder(order);
}

function event(id = 'event', kind = 'interest', amount = 1000) {
  const item = createDemoDistribution(account, channel, holding, kind, 'claim', amount, 0, now, id).item;
  saveDistribution(item);
  return item;
}

function claimable(item) {
  const next = applyDemoDistributionState(item, 'claimable', now);
  saveDistribution(next);
  return next;
}

function basis(cents = 30000) {
  const result = createMockPrincipalBasis(account, channel, holding, 'Mock 原始债权 QA-01', cents, now, null, []);
  savePrincipalBasis(result.basis);
  return result.basis;
}

function stored(id) {
  return readAllDistributions().find(item => item.id === id);
}

test('normal Claim creates exactly one request and enters processing', () => {
  setup();
  const item = claimable(event());
  const result = startMockClaim(account, channel, offering, item.id, now, () => 'request-1');
  assert.equal(result.error, undefined);
  assert.equal(result.item.state, 'processing');
  assert.equal(result.item.requestId, 'request-1');
  assert.equal(stored(item.id).requestId, 'request-1');
});

test('rapid repeated clicks create only the first request', () => {
  setup();
  const item = claimable(event());
  let calls = 0;
  const results = Array.from({ length: 8 }, () => startMockClaim(account, channel, offering, item.id, now, () => { calls += 1; return 'request-' + calls; }));
  assert.equal(calls, 1);
  assert.equal(results[0].item.state, 'processing');
  assert.equal(results.slice(1).filter(result => result.error).length, 7);
  assert.equal(stored(item.id).requestId, 'request-1');
});

test('a reentrant call inside request creation is rejected by the synchronous lock', () => {
  setup();
  const item = claimable(event());
  let nested;
  const first = startMockClaim(account, channel, offering, item.id, now, () => {
    nested = startMockClaim(account, channel, offering, item.id, now, () => assert.fail('nested call must not create a request'));
    return 'original-request';
  });
  assert.ok(nested.error);
  assert.equal(first.item.requestId, 'original-request');
});

test('an event already in processing cannot create another request', () => {
  setup();
  const item = claimable(event());
  startMockClaim(account, channel, offering, item.id, now, () => 'request-original');
  const repeated = startMockClaim(account, channel, offering, item.id, now, () => assert.fail('processing must not issue a request'));
  assert.ok(repeated.error);
  assert.equal(stored(item.id).requestId, 'request-original');
});

test('refreshing the page restores processing from storage', () => {
  setup();
  const item = claimable(event());
  startMockClaim(account, channel, offering, item.id, now, () => 'request-refresh');
  const persisted = stored(item.id);
  assert.equal(persisted.state, 'processing');
  assert.equal(persisted.requestId, 'request-refresh');
  assert.match(claimBlockReason(persisted, account, channel, holding), /原领取请求已存在/);
});

test('an existing request ID is never overwritten by a later attempt', () => {
  setup();
  const item = claimable(event());
  startMockClaim(account, channel, offering, item.id, now, () => 'request-original');
  startMockClaim(account, channel, offering, item.id, now, () => 'request-overwrite');
  assert.equal(stored(item.id).requestId, 'request-original');
});

for (const state of ['processing', 'paid', 'unknown', 'failed']) {
  test('no unauthorized retry is issued from ' + state, () => {
    setup();
    const item = event();
    saveDistribution({ ...item, state, requestId: 'keep-original' });
    const result = startMockClaim(account, channel, offering, item.id, now, () => assert.fail('retry is not approved'));
    assert.ok(result.error);
    assert.equal(stored(item.id).requestId, 'keep-original');
  });
}

for (const [label, change] of [
  ['fulfillment exception', { exception: 'fulfillment-failed' }],
  ['refund under review', { refund: 'under-review' }],
  ['refund processing', { refund: 'processing' }],
  ['refund confirmed', { refund: 'confirmed' }],
  ['unknown payment', { payment: 'unknown' }],
  ['failed payment', { payment: 'failed' }],
  ['unknown registration', { registration: 'unknown' }],
  ['pending registration', { registration: 'pending' }],
  ['other account', { accountId: otherAccount.id }],
  ['other channel', { channelPath: '/v/cedar' }]
]) {
  test('claimable event is blocked after holding changes to ' + label, () => {
    setup();
    const item = claimable(event());
    saveOrder({ ...order, ...change });
    const result = startMockClaim(account, channel, offering, item.id, now, () => assert.fail('ineligible holding must not issue a request'));
    assert.ok(result.error);
    assert.equal(stored(item.id).state, 'claimable');
    assert.equal(stored(item.id).requestId, undefined);
  });
}

test('closing a support ticket does not restore claim eligibility', () => {
  setup();
  const item = claimable(event());
  saveOrder({ ...order, exception: 'fulfillment-failed' });
  saveTicket({ id: 'ticket-1', accountId: account.id, channelPath: '/m', email: account.email, category: '收益持仓', orderId: order.id, offeringId: offering.id, description: '履约异常', status: 'resolved', replies: [], createdAt: now, updatedAt: now });
  assert.ok(startMockClaim(account, channel, offering, item.id, now, () => assert.fail('ticket closure must not restore claim')).error);
  assert.equal(stored(item.id).state, 'claimable');
});

test('a claimable amount that is invalid or non positive cannot enter processing', () => {
  setup();
  const item = event();
  for (const change of [{ grossCents: -100, deductionsCents: 0 }, { grossCents: 0, deductionsCents: 0 }, { grossCents: null, deductionsCents: null }, { grossCents: 1000, deductionsCents: 1000 }]) {
    saveDistribution({ ...item, state: 'claimable', ...change, requestId: undefined });
    const result = startMockClaim(account, channel, offering, item.id, now, () => assert.fail('invalid amount must not issue a request'));
    assert.ok(result.error);
    assert.equal(stored(item.id).state, 'claimable');
  }
});

test('principal payment without a Mock basis is rejected', () => {
  setup();
  event('principal-1', 'principal', 10000);
  const result = payMockPrincipal(account, channel, offering, 'principal-1', now);
  assert.match(result.error, /缺少有效 Mock 本金依据/);
  assert.notEqual(stored('principal-1').state, 'paid');
});

test('principal payment with a valid basis is allowed and accumulates partial repayments', () => {
  setup();
  event('principal-1', 'principal', 10000);
  const created = basis(30000);
  assert.equal(created.remainingCents, 30000);
  const first = payMockPrincipal(account, channel, offering, 'principal-1', now);
  assert.equal(first.error, undefined);
  assert.equal(first.basis.repaidCents, 10000);
  assert.equal(first.basis.remainingCents, 20000);
  assert.equal(first.basis.lastRepaymentCents, 10000);
  assert.equal(stored('principal-1').state, 'paid');
  event('principal-2', 'principal', 15000);
  const second = payMockPrincipal(account, channel, offering, 'principal-2', now);
  assert.equal(second.basis.repaidCents, 25000);
  assert.equal(second.basis.remainingCents, 5000);
  assert.equal(readPrincipalBasis(order.id).remainingCents, 5000);
});

test('a repayment above the remaining principal is rejected', () => {
  setup();
  event('principal-1', 'principal', 10000);
  basis(12000);
  assert.equal(payMockPrincipal(account, channel, offering, 'principal-1', now).basis.remainingCents, 2000);
  event('principal-2', 'principal', 5000);
  const result = payMockPrincipal(account, channel, offering, 'principal-2', now);
  assert.match(result.error, /超过 Mock 剩余本金/);
  assert.notEqual(stored('principal-2').state, 'paid');
  assert.equal(readPrincipalBasis(order.id).repaidCents, 10000);
});

test('marking the same principal event paid twice does not double count', () => {
  setup();
  event('principal-1', 'principal', 10000);
  basis(30000);
  const first = payMockPrincipal(account, channel, offering, 'principal-1', now);
  const second = payMockPrincipal(account, channel, offering, 'principal-1', now);
  assert.equal(second.item.state, 'paid');
  assert.equal(second.basis.repaidCents, 10000);
  assert.equal(second.basis.remainingCents, 20000);
  assert.equal(paidPrincipalCents(readAllDistributions()), 10000);
  assert.equal(first.basis.repaidCents, second.basis.repaidCents);
});

test('principal paid state cannot be forged through the generic state update', () => {
  setup();
  const item = event('principal-1', 'principal', 10000);
  assert.equal(applyDemoDistributionState(item, 'paid', now), item);
  assert.equal(applyDemoDistributionState({ ...item, state: 'paid' }, 'planned', now).state, 'paid');
});

test('a paid principal record without a matching basis is shown as unknown', () => {
  setup();
  const item = event('principal-1', 'principal', 10000);
  saveDistribution({ ...item, state: 'paid', principalBasisId: order.id });
  assert.equal(stored('principal-1').state, 'unknown');
});

for (const [label, mutate] of [
  ['invalid reconciliation time', value => ({ ...value, asOf: 'not-a-date' })],
  ['mock flag removed', value => ({ ...value, mock: false })],
  ['negative remaining balance', value => ({ ...value, remainingCents: -1 })],
  ['balances do not add up', value => ({ ...value, repaidCents: 1000, remainingCents: 1000 })],
  ['non integer amount', value => ({ ...value, testPrincipalCents: 1000.5 })],
  ['empty debt source', value => ({ ...value, originalDebtSource: '   ' })],
  ['basis bound to another order', value => ({ ...value, orderId: 'another-order' })]
]) {
  test('a corrupted basis is rejected: ' + label, () => {
    setup();
    event('principal-1', 'principal', 10000);
    const valid = basis(30000);
    localStorage.setItem(principalBasisKey(order.id), JSON.stringify(mutate(valid)));
    assert.equal(readPrincipalBasis(order.id), null);
    const result = payMockPrincipal(account, channel, offering, 'principal-1', now);
    assert.ok(result.error);
    assert.notEqual(stored('principal-1').state, 'paid');
  });
}

test('principal repayment stays out of income totals and keeps its own summary', () => {
  setup();
  event('interest-1', 'interest', 800);
  event('principal-1', 'principal', 10000);
  basis(30000);
  const interest = applyDemoDistributionState({ ...stored('interest-1'), state: 'claimable' }, 'paid', now);
  saveDistribution(interest);
  payMockPrincipal(account, channel, offering, 'principal-1', now);
  const items = readAllDistributions();
  assert.equal(paidIncomeCents(items), 800);
  assert.equal(paidPrincipalCents(items), 10000);
  assert.equal(distributionAmounts(stored('principal-1')).paid, 10000);
  assert.equal(distributionAmounts(stored('interest-1')).paid, 800);
});

test('a claimable event owned by another account cannot be claimed', () => {
  setup();
  const item = claimable(event());
  const result = startMockClaim(otherAccount, channel, offering, item.id, now, () => assert.fail('foreign event must not be claimed'));
  assert.ok(result.error);
  assert.equal(stored(item.id).state, 'claimable');
});
