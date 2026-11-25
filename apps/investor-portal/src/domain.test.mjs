import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChannel, visibleOfferings, visibleCategories, minimumUnits, quantityError, totalCents } from './domain.ts';
const offerings = [
  { id: 'residence-01', issuerSlug: 'harbor', listing: 'active', category: '住宅物业', priceCents: 10000, minimumCents: 100000, maxUnits: 500 },
  { id: 'debt-01', issuerSlug: 'cedar', listing: 'active', category: '企业借款债权' },
  { id: 'private-01', issuerSlug: 'cedar', listing: 'pending', category: '非上市普通股权' }
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
