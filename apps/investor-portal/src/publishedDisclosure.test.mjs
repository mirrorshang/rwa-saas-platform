import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPublishedDisclosures } from './publishedDisclosure.ts';
import { visibleOfferings, actionState } from './domain.ts';

const dto = () => ({
  schemaVersion: '1.1.0', status: 'Sandbox 已发布',
  source: { publicationId: 'PUB-1', offeringId: 'OFF-1', assetVersion: 2, instrumentVersion: 'v2', publishedAt: '2026-11-28T10:00:00Z' },
  asset: { name: '住宅', subtype: '住宅物业', location: '北京', facts: [{ key: 'address', label: '物业位置', value: '公开地点' }] },
  issuer: { legalName: '测试发行人', jurisdiction: '中国', slug: 'test-issuer' },
  right: { type: '收益参与权', description: '合法收益参与', tokenMapping: '1 Token = 1 单位', terms: [{ label: '收益来源', value: '核实净收入' }, { label: '分配周期', value: '每月' }, { label: '参与比例', value: '50' }] },
  spv: null, return: { kind: '未提供', warning: '未提供预期年化回报' },
  offering: { name: '住宅首期', round: '第 1 期', unitPriceU: 100, minimumU: 1000, totalUnits: 500, subscriptionStart: '2026-12-01', subscriptionEnd: '2027-02-28', summary: '资料示例' },
  documents: [{ id: 'FI', name: '权益文件', category: '核心协议', source: 'Instrument', version: 1, visibility: '公开' }, { id: 'FO', name: '风险文件', category: '发行披露', source: 'Offering', version: 1, visibility: '公开' }],
  risks: ['空置风险'], channels: { v: true, mListingApproved: false },
});
const images = { residence: 'residence.svg', debt: 'debt.svg' };

test('V 读取 Issuer 版本数据，M 未获独立上架不显示且认购保持关闭', () => {
  const [offering] = loadPublishedDisclosures([dto()], images);
  assert.equal(offering.sourcePublicationId, 'PUB-1');
  assert.equal(offering.priceCents, 10000);
  assert.deepEqual(offering.features.find(([k]) => k === '物业位置'), ['物业位置', '公开地点']);
  assert.equal(visibleOfferings([offering], { kind: 'v', issuerSlug: 'test-issuer' }).length, 1);
  assert.equal(visibleOfferings([offering], { kind: 'm' }).length, 0);
  assert.equal(actionState(offering.status).enabled, false);
});

test('未知 schema、重复 ID、损坏价格及文件版本一律拒绝', () => {
  assert.throws(() => loadPublishedDisclosures([{ ...dto(), schemaVersion: '2.0' }], images), /schema/);
  assert.throws(() => loadPublishedDisclosures([dto(), dto()], images), /重复/);
  assert.throws(() => loadPublishedDisclosures([{ ...dto(), offering: { ...dto().offering, unitPriceU: -1 } }], images), /单价/);
  assert.throws(() => loadPublishedDisclosures([{ ...dto(), documents: [{ ...dto().documents[0], version: 0 }] }], images), /文件版本/);
});

test('M 的单独许可仍不能把 Sandbox 项目变成可认购', () => {
  const item = dto(); item.channels.mListingApproved = true;
  const [offering] = loadPublishedDisclosures([item], images, ['test-issuer--OFF-1']);
  assert.equal(visibleOfferings([offering], { kind: 'm' }).length, 1);
  assert.equal(offering.status, '即将开放');
  assert.equal(actionState(offering.status).enabled, false);
});

test('同一 Offering 编号在不同发行企业隔离，M 许可不能跨企业复用', () => {
  const first = dto(); first.channels.mListingApproved = true;
  const second = dto(); second.issuer = { ...second.issuer, slug: 'other-issuer', legalName: '另一发行企业' }; second.channels.mListingApproved = true;
  const rows = loadPublishedDisclosures([first, second], images, ['test-issuer--OFF-1']);
  assert.deepEqual(rows.map(row => row.id), ['test-issuer--OFF-1', 'other-issuer--OFF-1']);
  assert.equal(visibleOfferings(rows, { kind: 'm' }).length, 1);
  assert.equal(visibleOfferings(rows, { kind: 'm' })[0].issuerSlug, 'test-issuer');
});
