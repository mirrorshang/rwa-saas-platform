import test from 'node:test';
import assert from 'node:assert/strict';
import { canShowCompany, draftStorageKey, parseChannel, visibleOfferings, visibleCategories, minimumUnits, quantityError, totalCents } from './domain.ts';
const offerings = [
  { id: 'residence-01', issuerId: 'harbor', issuerSlug: 'harbor', listing: 'active', category: '住宅物业', priceCents: 10000, minimumCents: 100000, maxUnits: 500 },
  { id: 'debt-01', issuerId: 'cedar', issuerSlug: 'cedar', listing: 'active', category: '企业借款债权' },
  { id: 'private-01', issuerId: 'cedar', issuerSlug: 'cedar', listing: 'pending', category: '非上市普通股权' }
];

test('V/M route and scope', () => {
  assert.deepEqual(parseChannel('/v/harbor/opportunities'), { kind: 'v', issuerSlug: 'harbor' });
  assert.deepEqual(parseChannel('/m/opportunities'), { kind: 'm' });
  assert.equal(parseChannel('/v/'), null);
  assert.deepEqual(visibleOfferings(offerings, { kind: 'v', issuerSlug: 'harbor' }).map(x => x.id), ['residence-01']);
  assert.deepEqual(visibleOfferings(offerings, { kind: 'm' }).map(x => x.id), ['residence-01', 'debt-01']);
  assert.equal(visibleOfferings(offerings, { kind: 'm' }, true).length, 0);
  assert.deepEqual(visibleCategories(offerings, { kind: 'm' }), ['房地产', '企业借款债权']);
  assert.deepEqual(visibleCategories(offerings, { kind: 'm' }, true), []);
});
test('quantity and precise U cents', () => {
  const o = offerings[0];
  assert.equal(minimumUnits(o), 10);
  assert.match(quantityError('1.5', o), /正整数/);
  assert.match(quantityError('9', o), /最低/);
  assert.match(quantityError('501', o), /上限/);
  assert.equal(quantityError('10', o), '');
  assert.equal(totalCents('11', o), 110000);
});

test('M company profile requires a currently public listing', () => {
  const m = { kind: 'm' };
  assert.equal(canShowCompany(offerings, m, 'harbor'), true);
  assert.equal(canShowCompany(offerings, m, 'cedar'), true);
  assert.equal(canShowCompany(offerings, m, 'harbor', true), false);
  assert.equal(canShowCompany(offerings, m, 'unknown'), false);
  assert.equal(canShowCompany(offerings.filter(o => o.id === 'private-01'), m, 'cedar'), false);
  assert.equal(canShowCompany(offerings, { kind: 'v', issuerSlug: 'cedar' }, 'cedar'), true);
  assert.equal(canShowCompany(offerings, { kind: 'v', issuerSlug: 'harbor' }, 'cedar'), false);
});

test('draft fields are isolated by channel, issuer and offering', () => {
  const v = { kind: 'v', issuerSlug: 'harbor' };
  const m = { kind: 'm' };
  const residence = offerings[0];
  const keys = [
    draftStorageKey(v, residence, 'quantity'),
    draftStorageKey(m, residence, 'quantity'),
    draftStorageKey({ kind: 'v', issuerSlug: 'cedar' }, residence, 'quantity'),
    draftStorageKey(v, { ...residence, issuerId: 'cedar' }, 'quantity'),
    draftStorageKey(v, { ...residence, id: 'residence-02' }, 'quantity'),
    draftStorageKey(v, residence, 'read')
  ];
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(draftStorageKey(v, residence, 'quantity'), keys[0]);
});
