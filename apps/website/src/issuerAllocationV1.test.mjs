import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'tenant-a', plan: 'Standard' };
const other = { id: 'tenant-b', plan: 'Standard' };
let selected = tenant;
let orderRows = [];
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const source = ts.transpileModule(readFileSync('src/issuerAllocationV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = {};
new Function('require', 'exports', source)(name => {
  if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
  if (name === './issuerInvestorsV1') return { readInvestorRelations: () => [] };
  if (name === './issuerOrdersV1') return { readOrders: () => orderRows };
  if (name === './issuerPortfolioV1') return { readPortfolio: () => ({ assets: [], instruments: [], offerings: [] }), tokenMapping: fields => ({ value: fields.type === 'equity' ? '5' : '0.25', unit: fields.type === 'equity' ? '股' : '%', error: '' }) };
  throw Error(name);
}, module);

const instrument = { id: 'in-1', versions: [{ number: 1, fields: { type: 'equity' } }, { number: 2, fields: { type: 'income' } }] };
const order = { id: 'o-1', quoteStatus: 'valid', signatureStatus: 'signed', payment: 'final-matched', capacity: 'reserved' };
const investor = { kyc: 'passed', expiresAt: Date.now() + 86400000 };

test('fixed Instrument version maps integer Token units to precise legal units', () => {
  assert.deepEqual(module.legalRightsForTokens(instrument, 1, '3'), { quantity: '15', unit: '股', perToken: '5', instrumentType: 'equity' });
  assert.deepEqual(module.legalRightsForTokens(instrument, 2, '3'), { quantity: '0.75', unit: '%', perToken: '0.25', instrumentType: 'income' });
  assert.equal(module.legalRightsForTokens(instrument, 3, '3'), null);
  assert.equal(module.legalRightsForTokens(instrument, 1, '1.5'), null);
});

test('payment and KYC prerequisites never create a confirmed allocation automatically', () => {
  assert.equal(module.allocationReadiness(order, investor).state, 'awaiting-authority');
  assert.equal(module.allocationReadiness({ ...order, payment: 'pending' }, investor).state, 'checking');
  assert.equal(module.allocationReadiness({ ...order, payment: 'unknown' }, investor).state, 'unknown');
  assert.equal(module.allocationReadiness(order, { ...investor, kyc: 'expired' }).state, 'checking');
});

test('holder comparison needs effective registration, same legal subject and aligned observation time', () => {
  const holder = { registration: 'effective', effectiveAt: 1, registrationRef: 'reg-1', authorityRef: 'auth-1', tokenQuantity: '3', tokenConfirmedAt: 2, tokenSubjectRef: 'person-1', legalSubjectRef: 'person-1', legalAsOf: 3, tokenAsOf: 3, instrumentId: 'in-1', instrumentVersion: 1, rightsUnit: '股', rightsQuantity: '15' };
  assert.equal(module.reconciliationState(holder, instrument), 'consistent');
  assert.equal(module.reconciliationState({ ...holder, rightsQuantity: '14' }, instrument), 'difference');
  assert.equal(module.reconciliationState({ ...holder, tokenSubjectRef: 'person-2' }, instrument), 'not-comparable');
  assert.equal(module.reconciliationState({ ...holder, tokenAsOf: 4 }, instrument), 'not-comparable');
  assert.equal(module.reconciliationState({ ...holder, registration: 'unknown' }, instrument), 'unknown');
});

test('allocation and holder stores remain tenant scoped', () => {
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [{ id: 'a-1', tenantId: 'tenant-a' }], holders: [{ id: 'h-1', tenantId: 'tenant-a' }], capacities: [] } }));
  selected = tenant;
  assert.equal(module.findAllocation(tenant, 'a-1').id, 'a-1');
  selected = other;
  assert.equal(module.findAllocation(other, 'a-1'), null);
  assert.equal(module.findHolder(other, 'h-1'), null);
});

test('released or closed orders do not become allocation candidates', () => {
  selected = tenant;
  storage.delete('wdex-issuer-allocation-v1');
  orderRows = [{ id: 'open', capacity: 'reserved' }, { id: 'released', capacity: 'released' }, { id: 'closed', capacity: 'reserved', cancelledAt: 3 }];
  assert.deepEqual(module.allocationCandidateOrders(tenant).map(item => item.id), ['open']);
});

test('issue projection preserves independent payment, capacity and legal registration blockers', () => {
  const payment = { id: 'o-unknown', number: 'SO-1', tenantId: 'tenant-a', assetId: 'asset-1', offeringId: 'of-1', quantity: '3', payment: 'unknown', capacity: 'protected', registration: 'none', delivery: 'none', createdAt: 1 };
  const legal = { ...payment, id: 'o-legal', number: 'SO-2', payment: 'final-matched', capacity: 'allocated', registration: 'pending', delivery: 'confirmed' };
  const holder = { id: 'holder-1', allocationId: 'allocation-1', registration: 'submitted', updatedAt: 2, instrumentId: 'in-1' };
  const data = { allocations: [{ id: 'allocation-1', orderId: legal.id }], holders: [holder], capacities: [] };
  const issues = module.deriveAllocationIssues([payment, legal], data, [instrument]);
  assert.deepEqual(issues.map(item => item.category).sort(), ['capacity', 'funds', 'registration']);
  assert.equal(issues.find(item => item.category === 'funds').state, 'unknown');
  assert.equal(issues.find(item => item.category === 'registration').holderId, 'holder-1');
});

test('rights mismatch becomes a Token reconciliation issue without changing registration', () => {
  const order = { id: 'o-1', number: 'SO-1', tenantId: 'tenant-a', assetId: 'asset-1', offeringId: 'of-1', quantity: '3', payment: 'final-matched', capacity: 'allocated', registration: 'effective', delivery: 'confirmed', createdAt: 1 };
  const holder = { id: 'h-1', allocationId: 'a-1', registration: 'effective', effectiveAt: 1, registrationRef: 'reg-1', authorityRef: 'auth-1', tokenQuantity: '3', tokenConfirmedAt: 2, tokenSubjectRef: 'person-1', legalSubjectRef: 'person-1', legalAsOf: 3, tokenAsOf: 3, instrumentId: 'in-1', instrumentVersion: 1, rightsUnit: '股', rightsQuantity: '14', updatedAt: 4 };
  const issues = module.deriveAllocationIssues([order], { allocations: [{ id: 'a-1', orderId: order.id }], holders: [holder], capacities: [] }, [instrument]);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].category, 'token');
  assert.match(issues[0].reason, /精确映射/);
  assert.equal(holder.registration, 'effective');
});

test('restriction request maps legal units exactly and never changes holder or chain facts', () => {
  selected = tenant;
  const holder = { id: 'h-restrict', tenantId: tenant.id, source: 'internal-sandbox', registration: 'effective',
    authorityRef: 'auth-1', instrumentId: instrument.id, instrumentVersion: 1, rightsQuantity: '15', rightsUnit: '股', tokenQuantity: '3',
    restrictionPolicy: { allowed: true, requesterRef: 'requester-1', authorityBasisRef: 'basis-v1', partialAllowed: true },
    restrictionFacts: [{ ref: 'old-restriction', state: 'effective', rightsQuantity: '5', tokenQuantity: '1' }] };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [], holders: [holder], capacities: [] } }));
  assert.equal(module.restrictionTokenQuantity(holder, instrument, '10'), '2');
  assert.equal(module.restrictionTokenQuantity(holder, instrument, '6'), null);
  assert.throws(() => module.submitRestrictionRequest(tenant, holder.id, instrument, { kind: 'restrict', rightsQuantity: '6', reasonCategory: 'contract', reason: '按合同限制相关权益转让。', basisRef: 'contract-v1', confirmed: true }), /精确映射/);
  const input = { kind: 'restrict', rightsQuantity: '10', reasonCategory: 'contract', reason: '按合同限制相关权益转让。', basisRef: 'contract-v1', confirmed: true };
  const request = module.submitRestrictionRequest(tenant, holder.id, instrument, input);
  assert.equal(request.state, 'submitted');
  assert.equal(request.tokenQuantity, '2');
  const issues = module.deriveAllocationIssues([], { allocations: [], holders: [holder], capacities: [], restrictionRequests: [request] }, [instrument]);
  assert.equal(issues[0].category, 'restriction');
  assert.equal(issues[0].state, 'checking');
  assert.equal(module.findHolder(tenant, holder.id).registration, 'effective');
  assert.equal(module.findHolder(tenant, holder.id).restrictionFacts[0].state, 'effective');
  assert.throws(() => module.submitRestrictionRequest(tenant, holder.id, instrument, input), /已有同类申请/);
  assert.throws(() => module.submitRestrictionRequest(tenant, holder.id, instrument, { ...input, kind: 'release', originalRestrictionRef: 'missing' }), /原限制编号/);
  const release = module.submitRestrictionRequest(tenant, holder.id, instrument, { ...input, kind: 'release', rightsQuantity: '5', originalRestrictionRef: 'old-restriction' });
  assert.equal(release.state, 'submitted');
  assert.equal(module.findHolder(tenant, holder.id).restrictionFacts[0].state, 'effective');
  assert.equal(module.updateRestrictionReview(tenant, request.id, 'needs-info').state, 'needs-info');
  assert.equal(module.updateRestrictionReview(tenant, request.id, 'rejected').state, 'rejected');
  assert.throws(() => module.updateRestrictionReview(tenant, request.id, 'checking'), /不可直接改写/);
  assert.equal(module.findHolder(tenant, holder.id).registration, 'effective');
});

test('existing Sandbox holder gains only missing restriction sample context', () => {
  selected = tenant;
  const original = { id: `${tenant.id}-sandbox-holder-2`, tenantId: tenant.id, source: 'internal-sandbox', registration: 'effective',
    authorityRef: 'SB-REG-AUTH-001', rightsQuantity: '0.5', tokenQuantity: '2', effectiveAt: 1, updatedAt: 2, events: [{ at: 1, label: '原有事件' }] };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [], holders: [original], capacities: [] } }));
  module.ensureSandboxRestrictionPolicy(tenant);
  const after = module.findHolder(tenant, original.id);
  assert.equal(after.restrictionFacts[0].rightsQuantity, '0.25');
  assert.equal(after.events[0].label, '原有事件');
  module.ensureSandboxRestrictionPolicy(tenant);
  assert.equal(module.findHolder(tenant, original.id).restrictionFacts.length, 1);
});

test('restriction application requires tenant, authorization and valid legal amount', () => {
  selected = other;
  assert.throws(() => module.submitRestrictionRequest(other, 'h-restrict', instrument, {}), /无权/);
  selected = tenant;
  const input = { kind: 'restrict', rightsQuantity: '5', reasonCategory: 'legal', reason: '依法申请限制相关权益。', basisRef: 'law-v1', confirmed: true };
  const holder = { id: 'h-restrict', tenantId: tenant.id, source: 'internal-sandbox', registration: 'effective',
    authorityRef: 'auth-1', instrumentId: instrument.id, instrumentVersion: 1, rightsQuantity: '15', rightsUnit: '股', tokenQuantity: '3' };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [], holders: [holder], capacities: [] } }));
  assert.throws(() => module.submitRestrictionRequest(tenant, holder.id, instrument, input), /合法限制责任方/);
});

test('delegated registration materials stay pending and preserve legal holder facts', () => {
  selected = tenant;
  const holder = { id: 'h-register', tenantId: tenant.id, source: 'internal-sandbox', registration: 'submitted',
    allocationId: 'a-register', legalSubjectRef: 'legal-1', instrumentId: instrument.id, instrumentVersion: 1,
    registrationMode: 'delegated', authorityRef: 'registrar-1',
    registrationPolicy: { submissionAllowed: true, responsibleRef: 'registrar-1', authorityBasisRef: 'delegation-v1',
      evidenceVersions: [{ ref: 'doc-passed', label: '登记材料', status: 'passed' }, { ref: 'doc-pending', label: '待扫描', status: 'pending' }] } };
  const allocation = { id: 'a-register', tenantId: tenant.id, state: 'confirmed', decisionRef: 'decision-1', authorityRef: 'rule-1',
    instrumentId: instrument.id, instrumentVersion: 1, tokenQuantity: '3' };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [allocation], holders: [holder], capacities: [] } }));
  assert.throws(() => module.submitRegistrationMaterials(tenant, holder.id, instrument, { evidenceRef: 'doc-pending', note: '', confirmed: true }), /已通过核验/);
  const input = { evidenceRef: 'doc-passed', note: '', confirmed: true };
  const request = module.submitRegistrationMaterials(tenant, holder.id, instrument, input);
  assert.equal(request.state, 'submitted');
  assert.equal(request.rightsQuantity, '15');
  assert.equal(request.rightsUnit, '股');
  assert.equal(module.findHolder(tenant, holder.id).registration, 'submitted');
  assert.equal(module.submitRegistrationMaterials(tenant, holder.id, instrument, input).id, request.id);
  assert.equal(module.updateRegistrationReview(tenant, request.id, 'needs-info').state, 'needs-info');
  assert.equal(module.updateRegistrationReview(tenant, request.id, 'unknown').state, 'unknown');
  assert.equal(module.updateRegistrationReview(tenant, request.id, 'rejected').state, 'rejected');
  assert.throws(() => module.updateRegistrationReview(tenant, request.id, 'checking'), /不可直接改写/);
  const issues = module.deriveAllocationIssues([], module.readAllocationData(tenant), [instrument]);
  assert.equal(issues.find(item => item.sourceA === request.id), undefined);
  const resubmission = module.submitRegistrationMaterials(tenant, holder.id, instrument, input);
  assert.notEqual(resubmission.id, request.id);
  assert.equal(module.deriveAllocationIssues([], module.readAllocationData(tenant), [instrument]).find(item => item.sourceA === resubmission.id).category, 'registration');
  assert.equal(module.findHolder(tenant, holder.id).registrationRef, undefined);
});

test('registration materials block unknown, effective and unauthorized modes', () => {
  selected = tenant;
  const data = module.readAllocationData(tenant);
  const input = { evidenceRef: 'doc-passed', note: '', confirmed: true };
  const holder = data.holders.find(item => item.id === 'h-register');
  const original = holder.registration;
  for (const state of ['unknown', 'effective']) {
    holder.registration = state;
    storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': data }));
    assert.throws(() => module.submitRegistrationMaterials(tenant, holder.id, instrument, input), state === 'unknown' ? /原登记结果/ : /不可覆盖/);
  }
  holder.registration = original; holder.registrationMode = 'statutory';
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': data }));
  assert.throws(() => module.submitRegistrationMaterials(tenant, holder.id, instrument, input), /合法登记责任方/);
});

test('registration correction keeps original effective result and creates a separate review item', () => {
  selected = tenant;
  const holder = { id: 'h-correction', tenantId: tenant.id, source: 'internal-sandbox', allocationId: 'a-correction',
    legalSubjectRef: 'legal-1', instrumentId: instrument.id, instrumentVersion: 1,
    registration: 'effective', registrationRef: 'reg-original', effectiveAt: 1, rightsQuantity: '15', rightsUnit: '股',
    registrationMode: 'self', authorityRef: 'registrar-1',
    restrictionFacts: [{ ref: 'restrict-original', state: 'effective', rightsQuantity: '5' }],
    registrationPolicy: { submissionAllowed: true, responsibleRef: 'registrar-1', authorityBasisRef: 'authority-v1',
      evidenceVersions: [{ ref: 'correction-doc-v1', status: 'passed' }] } };
  const allocation = { id: 'a-correction', tenantId: tenant.id, state: 'confirmed', decisionRef: 'decision-1', authorityRef: 'rule-1',
    instrumentId: instrument.id, instrumentVersion: 1, tokenQuantity: '3' };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [allocation], holders: [holder], capacities: [] } }));
  const input = { rightsQuantity: '10', evidenceRef: 'correction-doc-v1', note: '原登记数量需要依法复核并保留历史。', confirmed: true };
  assert.throws(() => module.submitRegistrationCorrection(tenant, holder.id, instrument, { ...input, rightsQuantity: '16' }), /不得超出/);
  assert.throws(() => module.submitRegistrationCorrection(tenant, holder.id, instrument, { ...input, rightsQuantity: '4' }), /低于现有效限制/);
  const request = module.submitRegistrationCorrection(tenant, holder.id, instrument, input);
  assert.equal(request.kind, 'correction');
  assert.equal(request.originalRegistrationRef, 'reg-original');
  assert.equal(request.state, 'submitted');
  assert.equal(module.findHolder(tenant, holder.id).rightsQuantity, '15');
  assert.equal(module.findHolder(tenant, holder.id).registrationRef, 'reg-original');
  assert.equal(module.submitRegistrationCorrection(tenant, holder.id, instrument, input).id, request.id);
  assert.equal(module.deriveAllocationIssues([], module.readAllocationData(tenant), [instrument]).find(item => item.sourceA === request.id).title, '登记更正等待有权复核');
});

test('existing effective sample receives correction evidence without replacing registration history', () => {
  selected = tenant;
  const holder = { id: `${tenant.id}-sandbox-holder-2`, tenantId: tenant.id, source: 'internal-sandbox',
    registration: 'effective', registrationMode: 'self', authorityRef: 'SB-REG-AUTH-001', registrationRef: 'SB-REG-2',
    rightsQuantity: '0.5', rightsUnit: '%', events: [{ at: 1, label: '原登记' }] };
  storage.set('wdex-issuer-allocation-v1', JSON.stringify({ 'owner@example.com/tenant-a': { allocations: [], holders: [holder], capacities: [] } }));
  module.ensureSandboxRegistrationPolicy(tenant);
  const after = module.findHolder(tenant, holder.id);
  assert.equal(after.registrationPolicy.evidenceVersions[0].ref, 'SB-REG-CORR-DOC-V1');
  assert.equal(after.registrationRef, 'SB-REG-2');
  assert.equal(after.events[0].label, '原登记');
});
