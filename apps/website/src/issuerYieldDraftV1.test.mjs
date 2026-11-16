import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'tenant-a', plan: 'Standard' };
const other = { id: 'tenant-b', plan: 'Standard' };
let selected = tenant;
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const instrument = { id: 'instrument-1', assetId: 'asset-1', versions: [{ number: 1, fields: { type: 'income', startDate: '2026-12-01', endDate: '2028-12-01' } }] };
const offering = { id: 'offering-1', assetId: instrument.assetId, instrumentId: instrument.id, instrumentVersion: 1 };
const portfolio = { instruments: [instrument], offerings: [offering] };
let orders = [];
let allocation = { holders: [] };
const source = ts.transpileModule(readFileSync('src/issuerYieldDraftV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const model = {};
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
  if (name === './issuerPortfolioV1') return { readPortfolio: () => portfolio };
  if (name === './issuerFundsV1') return { parseU: value => /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(value) ? BigInt(value.split('.')[0]) * 1_000_000n + BigInt((value.split('.')[1] || '').padEnd(6, '0') || '0') : null };
  if (name === './issuerOrdersV1') return { readOrders: () => orders };
  if (name === './issuerAllocationV1') return { readAllocationData: () => allocation };
  throw Error(name);
}, model);
const fields = () => ({ instrumentId: instrument.id, instrumentVersion: 1, offeringId: offering.id,
  periodStart: '2027-01-01', periodEnd: '2027-03-31', recordDate: '2027-03-31', amount: '5000.000001',
  noIncome: false, noIncomeReason: '', basisRef: 'SB-TERMS-V1',
  calculationNote: '本期可分配金额按已记录的合同范围和费用口径核对。', decisionRef: '' });

test('yield draft saves append-only versions without creating payable or payment state', () => {
  selected = tenant; storage.clear();
  const first = model.saveYieldDraft(tenant, fields());
  assert.equal(first.status, 'draft');
  assert.equal(first.versions.length, 1);
  const same = model.saveYieldDraft(tenant, fields(), first.id);
  assert.equal(same.versions.length, 1);
  const changed = model.saveYieldDraft(tenant, { ...fields(), amount: '5100' }, first.id);
  assert.equal(changed.versions.length, 2);
  assert.equal(changed.versions[0].fields.amount, '5000.000001');
  assert.equal(changed.versions[1].fields.amount, '5100');
  assert.equal(model.readYieldDrafts(tenant).length, 1);
  selected = other;
  assert.deepEqual(model.readYieldDrafts(other), []);
});

test('precision, period, zero-income declaration and duplicate guards are enforced', () => {
  selected = tenant; storage.clear();
  assert.match(model.yieldDraftIssues(tenant, { ...fields(), amount: '1.0000001' }).join('；'), /6 位小数/);
  assert.match(model.yieldDraftIssues(tenant, { ...fields(), periodEnd: '2026-01-01' }).join('；'), /结束日/);
  assert.match(model.yieldDraftIssues(tenant, { ...fields(), periodEnd: '2027-02-30' }).join('；'), /有效的收益期间/);
  assert.match(model.yieldDraftIssues(tenant, { ...fields(), recordDate: '2027-13-10' }).join('；'), /有效的待核验 Record Date/);
  assert.match(model.yieldDraftIssues(tenant, { ...fields(), noIncome: true, amount: '1' }).join('；'), /金额须为 0/);
  const zero = { ...fields(), noIncome: true, amount: '0', noIncomeReason: '本期没有可分配收益，仍需核对原合同和经营资料。' };
  assert.deepEqual(model.yieldDraftIssues(tenant, zero), []);
  model.saveYieldDraft(tenant, zero);
  assert.match(model.yieldDraftIssues(tenant, fields()).join('；'), /已有草稿/);
});

test('malformed storage stays untouched and cross-tenant edit is rejected', () => {
  selected = tenant; storage.clear();
  const first = model.saveYieldDraft(tenant, fields());
  selected = other;
  assert.throws(() => model.saveYieldDraft(other, fields(), first.id), /不存在或无权/);
  selected = tenant;
  storage.set('wdex-issuer-yield-draft-v1', '{bad');
  assert.equal(model.readYieldDrafts(tenant), null);
  assert.throws(() => model.saveYieldDraft(tenant, fields()), /无法读取/);
  assert.equal(storage.get('wdex-issuer-yield-draft-v1'), '{bad');
});

test('Sandbox yield example follows an existing offering and preserves edits', () => {
  selected = tenant; storage.clear();
  orders = [{ id: 'order-1', tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id }];
  const first = model.ensureSandboxYieldDraft(tenant);
  assert.equal(first.status, 'draft');
  assert.equal(first.source, 'internal-sandbox');
  assert.equal(first.versions[0].fields.offeringId, offering.id);
  const edited = model.saveYieldDraft(tenant, { ...first.versions[0].fields, amount: '5200' }, first.id);
  assert.equal(edited.versions.length, 2);
  assert.equal(model.ensureSandboxYieldDraft(tenant).versions.at(-1).fields.amount, '5200');
  assert.equal(model.readYieldDrafts(tenant).length, 1);
  selected = other;
  assert.equal(model.ensureSandboxYieldDraft(other), null);
  orders = [];
});

test('downgraded tenant retains draft history but cannot edit or prepare another draft', () => {
  selected = tenant; storage.clear();
  const saved = model.saveYieldDraft(tenant, fields());
  selected = { ...tenant, plan: 'Free' };
  assert.equal(model.readYieldDrafts(tenant)?.[0].id, saved.id);
  assert.throws(() => model.saveYieldDraft(tenant, { ...fields(), amount: '5200' }, saved.id), /仅可查看历史收益资料/);
  assert.equal(model.ensureSandboxYieldDraft(tenant), null);
  assert.equal(model.readYieldDrafts(tenant)?.[0].versions.length, 1);
});

test('Sandbox yield preview uses registered rights, keeps exact U remainder, and creates no batch', () => {
  selected = tenant; storage.clear();
  const saved = model.saveYieldDraft(tenant, { ...fields(), amount: '1' });
  allocation = { holders: [
    { tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id, instrumentId: instrument.id,
      instrumentVersion: 1, registration: 'effective', effectiveAt: Date.parse('2027-03-01'),
      legalSubjectRef: 'holder-a', displayName: '持有人 A', rightsQuantity: '2', rightsUnit: '%' },
    { tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id, instrumentId: instrument.id,
      instrumentVersion: 1, registration: 'effective', effectiveAt: Date.parse('2027-03-01'),
      legalSubjectRef: 'holder-b', displayName: '持有人 B', rightsQuantity: '1', rightsUnit: '%' },
    { tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id, instrumentId: instrument.id,
      instrumentVersion: 1, registration: 'submitted', legalSubjectRef: 'holder-c', displayName: '持有人 C' },
  ] };
  const preview = model.previewSandboxYield(tenant, saved.id);
  assert.deepEqual(preview.lines.map(item => item.amount), ['0.666666', '0.333333']);
  assert.equal(preview.unallocated, '0.000001');
  assert.equal(preview.totalRights, '3');
  assert.equal(preview.excluded, 1);
  assert.equal(preview.source, 'internal-sandbox');
  assert.equal(model.readYieldDrafts(tenant)[0].versions.length, 1);
});

test('yield preview blocks missing or invalid rights and keeps tenant isolation', () => {
  selected = tenant; storage.clear();
  const saved = model.saveYieldDraft(tenant, fields());
  allocation = { holders: [{ tenantId: tenant.id, source: 'internal-sandbox', offeringId: offering.id,
    instrumentId: instrument.id, instrumentVersion: 1, registration: 'effective', effectiveAt: Date.parse('2027-03-01'),
    legalSubjectRef: 'holder-a', displayName: '持有人 A', rightsQuantity: '0.0000001', rightsUnit: '%' }] };
  const blocked = model.previewSandboxYield(tenant, saved.id);
  assert.equal(blocked.lines.length, 0);
  assert.match(blocked.issues.join('；'), /权益单位/);
  allocation.holders[0].rightsQuantity = '1';
  allocation.holders[0].rightsUnit = '股';
  assert.match(model.previewSandboxYield(tenant, saved.id).issues.join('；'), /权益结构类型不一致/);
  selected = other;
  assert.equal(model.previewSandboxYield(other, saved.id), null);
  allocation = { holders: [] };
});
