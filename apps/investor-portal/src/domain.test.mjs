import test from 'node:test';
import assert from 'node:assert/strict';
import { actionState, assetGroup, canShowCompany, draftStorageKey, filterOfferings, investmentFacts, parseChannel, visibleOfferings, visibleCategories, minimumUnits, quantityError, totalCents } from './domain.ts';
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
  assert.deepEqual(visibleCategories(offerings, { kind: 'm' }), ['房地产', '企业借款']);
  assert.deepEqual(visibleCategories(offerings, { kind: 'm' }, true), []);
});
test('asset categories and investor rights remain separate filters', () => {
  const sample = offerings.map((o, i) => ({ ...o, title: ['住宅收益', '企业借款', '股权观察'][i], right: ['收益参与权', '债权', '股权'][i], status: i === 2 ? '即将开放' : '认购中', place: i === 0 ? '上海' : '深圳', issuerName: i === 0 ? '海岚资产' : '杉衡资本' }));
  assert.equal(assetGroup(sample[0]), '房地产');
  assert.equal(assetGroup(sample[1]), '企业借款');
  assert.equal(assetGroup(sample[2]), '企业股权');
  assert.deepEqual(filterOfferings(sample, { category: '企业借款', right: '债权', place: '深圳', status: '认购中', issuer: '杉衡资本' }).map(o => o.id), ['debt-01']);
  assert.deepEqual(filterOfferings(sample, { search: '住宅' }).map(o => o.id), ['residence-01']);
  assert.equal(filterOfferings(sample, { category: '房地产', right: '债权' }).length, 0);
});
test('rights-specific facts and action states', () => {
  assert.deepEqual(investmentFacts({ right: '债权', yieldLine: '', terms: [['合同固定年利率','12%（非保证兑付）'],['付息方式','按月付息'],['本金偿还','到期一次还本']] }).map(([key]) => key), ['合同固定年利率','付息频率','到期安排']);
  assert.deepEqual(investmentFacts({ right: '收益参与权', yieldLine: '', terms: [['收益来源','实际可分配金额'],['分配频率','按合同约定'],['参与比例','合同约定份额']] }).map(([key]) => key), ['收益来源','分配周期','参与比例']);
  assert.equal(actionState('认购中','guest').label, '开始认购');
  assert.match(actionState('认购中','kyc').reason, /身份认证/);
  for (const status of ['即将开放','暂停','已结束','待核实']) assert.equal(actionState(status).enabled, false);
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
