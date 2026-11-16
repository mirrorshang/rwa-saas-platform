import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

const values = new Map();
globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
globalThis.location = { hostname: '127.0.0.1', search: '?demo=1', origin: 'http://127.0.0.1' };
globalThis.window = new EventTarget();
const email = 'demo@wdex.example';
const scope = data => ({ accounts: { [email]: { assetco: data } } });

test('Project/Offering Sandbox repository integration and safety guards', async t => {
  const vite = await createServer({ mode: 'demo', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const demo = await vite.ssrLoadModule('/src/issuerDemo.ts');
    const assets = await vite.ssrLoadModule('/src/issuerAssets.ts');
    const rights = await vite.ssrLoadModule('/src/issuerInstruments.ts');
    const files = await vite.ssrLoadModule('/src/issuerFiles.ts');
    const issuance = await vite.ssrLoadModule('/src/issuerIssuance.ts');
    const controls = await vite.ssrLoadModule('/src/demoControls.ts');
    assert.equal(demo.beginDemoAuth('single'), true);
    assert.equal(demo.selectDemoTenant('assetco'), true);
    const tenant = demo.getDemoTenant();
    const assetFields = { ...assets.blankAssetFields(), name: '住宅资产', category: '房地产', summary: '测试资产', propertySubtype: 'residential', country: 'HK', city: '香港', address: '示例地址', area: '100', areaBasis: '建筑面积', owner: '测试主体', tenantRelation: '持有', operationStatus: '运营中', residential: { kind: '公寓', totalUnits: '10', occupiedUnits: '8', unitMix: '', rental: '' } };
    sessionStorage.setItem(assets.assetStorageKey, JSON.stringify(scope({ assets: [
      { id: 'asset-1', tenantId: 'assetco', number: 'A-1', state: 'ready', versions: [{ number: 1, fields: assetFields, savedAt: Date.now(), savedBy: email }] },
      { id: 'asset-2', tenantId: 'assetco', number: 'A-2', state: 'ready', versions: [{ number: 1, fields: { ...assetFields, name: '第二资产' }, savedAt: Date.now(), savedBy: email }] },
    ], intent: null })));
    const equity = { ...rights.blankInstrumentFields(), name: '普通股', type: 'equity', assetId: 'asset-1', assetVersion: 1, rightsOwner: '测试持有人', economicSummary: '普通股收益与表决', equityEntity: '测试主体', equityShare: '10', shareCount: '100', shareRights: '分红与表决', sourceName: '独立股权来源', capacityTotal: '100', structureCap: '100', structureCapBasis: '股东名册', rightsPerToken: '0.5' };
    const savedRight = rights.saveInstrument(tenant, equity);
    assert.equal(savedRight.status, 'saved');
    const instrumentId = savedRight.record.id;
    const fileStore = scope({ records: [
      { id: 'legal-1', tenantId: 'assetco', versions: [{ number: 1, name: '股权协议.pdf', size: 100, type: 'application/pdf', addedAt: Date.now(), addedBy: email, status: 'received', scan: 'passed' }] },
    ], refs: [{ id: 'legal-ref', owner: 'instrument', ownerId: instrumentId, fileId: 'legal-1', version: 1, category: '股权法律文件', note: '', linkedAt: Date.now() }] });
    sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
    assert.equal(rights.saveInstrument(tenant, { ...equity, legalFileRefId: 'legal-ref' }, instrumentId, 1).status, 'saved');
    assert.equal(rights.prepareInstrument(tenant, instrumentId).status, 'saved');
    assert.equal(rights.completeInstrument(tenant, instrumentId).status, 'saved');
    const secondRight = rights.saveInstrument(tenant, { ...equity, name: '第二普通股', sourceName: '第二来源', capacityTotal: '100' });
    assert.equal(secondRight.status, 'saved');
    const secondInstrumentId = secondRight.record.id;
    fileStore.accounts[email].assetco.records.push({ id: 'legal-2', tenantId: 'assetco', versions: [{ number: 1, name: '第二股权协议.pdf', size: 100, type: 'application/pdf', addedAt: Date.now(), addedBy: email, status: 'received', scan: 'passed' }] });
    fileStore.accounts[email].assetco.refs.push({ id: 'legal-ref-2', owner: 'instrument', ownerId: secondInstrumentId, fileId: 'legal-2', version: 1, category: '股权法律文件', note: '', linkedAt: Date.now() });
    sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
    assert.equal(rights.saveInstrument(tenant, { ...equity, name: '第二普通股', sourceName: '第二来源', capacityTotal: '100', legalFileRefId: 'legal-ref-2' }, secondInstrumentId, 1).status, 'saved');
    assert.equal(rights.prepareInstrument(tenant, secondInstrumentId).status, 'saved');
    assert.equal(rights.completeInstrument(tenant, secondInstrumentId).status, 'saved');
    const create = issuance.createOfferingDraft(tenant, 'asset-1', instrumentId, 'create-1');
    await t.test('one Project per Asset, reuse across Instruments, duplicate intent', () => {
      assert.equal(create.status, 'saved');
      assert.equal(issuance.createOfferingDraft(tenant, 'asset-1', instrumentId, 'create-1').record.id, create.record.id);
      const another = issuance.createOfferingDraft(tenant, 'asset-1', secondInstrumentId, 'create-2');
      assert.equal(another.status, 'saved');
      assert.equal(another.project.id, create.project.id);
      assert.equal(issuance.offeringFields(another.record).instrumentId, secondInstrumentId);
      assert.equal(issuance.createOfferingDraft(tenant, 'asset-1', secondInstrumentId, 'create-2').record.id, another.record.id);
      assert.equal(issuance.listProjects(tenant).length, 1);
      assert.equal(issuance.listOfferings(tenant).length, 2);
      assert.equal(rights.capacitySummary(tenant, instrumentId).remaining, '100');
    });
    await t.test('failed creation leaves no orphan Project and retries once', () => {
      controls.useDemoControls.getState().setControl('issuanceSave', 'failed');
      assert.equal(issuance.createOfferingDraft(tenant, 'asset-2', '', 'retry-create').status, 'failed');
      assert.equal(issuance.listProjects(tenant).length, 1);
      controls.useDemoControls.getState().setControl('issuanceSave', 'success');
      const retried = issuance.createOfferingDraft(tenant, 'asset-2', '', 'retry-create');
      assert.equal(retried.status, 'saved');
      assert.equal(issuance.createOfferingDraft(tenant, 'asset-2', '', 'retry-create').record.id, retried.record.id);
      assert.equal(issuance.listProjects(tenant).length, 2);
    });
    await t.test('cross-Asset and cross-Tenant references fail closed', () => {
      const fields = issuance.offeringFields(create.record);
      assert.equal(issuance.saveOfferingDraft(tenant, create.record.id, { ...fields, assetId: 'asset-2' }, 1).status, 'invalid');
      assert.equal(issuance.saveOfferingDraft(tenant, create.record.id, { ...fields, instrumentId: secondInstrumentId, instrumentVersion: 99 }, 1).status, 'invalid');
      assert.equal(issuance.findOffering({ ...tenant, id: 'issuerco' }, create.record.id), null);
      assert.equal(issuance.findProject({ ...tenant, id: 'issuerco' }, create.project.id), null);
    });
    await t.test('failed save preserves input; stale version and Unknown lock', () => {
      const fields = { ...issuance.offeringFields(create.record), name: '第一轮发行' };
      controls.useDemoControls.getState().setControl('issuanceSave', 'failed');
      const failed = issuance.saveOfferingDraft(tenant, create.record.id, fields, 1);
      assert.equal(failed.status, 'failed');
      assert.equal(issuance.getIssuanceIntent(tenant).snapshot.name, '第一轮发行');
      controls.useDemoControls.getState().setControl('issuanceSave', 'success');
      const saved = issuance.saveOfferingDraft(tenant, create.record.id, fields, 1, failed.intent.id);
      assert.equal(saved.status, 'saved');
      assert.equal(issuance.saveOfferingDraft(tenant, create.record.id, fields, 1).status, 'conflict');
      controls.useDemoControls.getState().setControl('issuanceSave', 'unknown');
      assert.equal(issuance.saveOfferingDraft(tenant, create.record.id, { ...fields, name: '待确认输入' }, 2).status, 'unknown');
      assert.equal(issuance.saveOfferingDraft(tenant, create.record.id, fields, 2).status, 'unknown');
      controls.useDemoControls.getState().setControl('issuanceSave', 'failed');
      assert.equal(issuance.checkIssuanceIntent(tenant).status, 'failed');
      controls.useDemoControls.getState().setControl('issuanceSave', 'success');
    });
    await t.test('confirmed fixed snapshot, sole reservation, round exclusivity', () => {
      fileStore.accounts[email].assetco.records.push({ id: 'disclosure-1', tenantId: 'assetco', versions: [{ number: 1, name: '发行条款.pdf', size: 100, type: 'application/pdf', addedAt: Date.now(), addedBy: email, status: 'received', scan: 'passed' }] });
      fileStore.accounts[email].assetco.refs.push({ id: 'disclosure-ref', owner: 'offering', ownerId: create.record.id, fileId: 'disclosure-1', version: 1, category: '发行条款', note: '', visibility: 'eligible', linkedAt: Date.now() });
      sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
      const current = issuance.findOffering(tenant, create.record.id);
      const fields = { ...issuance.offeringFields(current), maxRights: '20', maxTokens: '40', unitPrice: '2', maxRaise: '80', opensAt: '2030-01-01T00:00', closesAt: '2030-02-01T00:00', minSubscription: '2', maxSubscription: '20', disclosureRefIds: ['disclosure-ref'] };
      assert.equal(issuance.saveOfferingDraft(tenant, current.id, fields, 2).status, 'saved');
      fileStore.accounts[email].assetco.records[2].versions[0].scan = 'failed';
      sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
      assert.equal(issuance.confirmOffering(tenant, current.id, 3).status, 'invalid');
      assert.equal(rights.capacitySummary(tenant, instrumentId).reserved, '0');
      fileStore.accounts[email].assetco.records[2].versions[0].scan = 'passed';
      sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
      const confirmed = issuance.confirmOffering(tenant, current.id, 3, 'confirm-1');
      assert.equal(confirmed.status, 'saved', (confirmed.errors || []).join('；'));
      assert.equal(confirmed.record.status, 'confirmed');
      assert.deepEqual(confirmed.record.confirmed.instrumentLegalFile, { refId: 'legal-ref', fileId: 'legal-1', version: 1 });
      assert.equal(confirmed.record.confirmed.disclosureRefs[0].version, 1);
      assert.equal(rights.capacitySummary(tenant, instrumentId).remaining, '80');
      assert.equal(issuance.confirmOffering(tenant, current.id, 3, 'confirm-1').record.id, current.id);
      assert.equal(rights.capacitySummary(tenant, instrumentId).reserved, '20');
      assert.equal(rights.mockCapacityRepository.reserve(tenant, instrumentId, 'overflow', '81', 'confirmed'), false);
      const cancelled = issuance.cancelConfirmedOffering(tenant, current.id, '无下游事实，修订发行安排');
      assert.equal(cancelled.status, 'saved');
      assert.equal(cancelled.record.confirmedHistory.length, 1);
      assert.equal(cancelled.record.confirmedHistory[0].fields.maxRights, '20');
      assert.equal(rights.capacitySummary(tenant, instrumentId).remaining, '100');
      assert.equal(issuance.tokenIdentity(tenant, instrumentId).locked, true);
      const reconfirmed = issuance.confirmOffering(tenant, current.id, 4, 'confirm-2');
      assert.equal(reconfirmed.status, 'saved', (reconfirmed.errors || []).join('；'));
      assert.equal(reconfirmed.record.confirmedHistory.length, 1);
      assert.equal(rights.capacitySummary(tenant, instrumentId).reserved, '20');
      const later = issuance.listOfferings(tenant).find(item => item.id !== current.id);
      const nextFields = { ...fields, name: '未来轮次', instrumentId, instrumentVersion: 2, projectId: later.versions[0].fields.projectId };
      assert.equal(issuance.saveOfferingDraft(tenant, later.id, nextFields, 1).status, 'saved');
      assert.equal(issuance.confirmOffering(tenant, later.id, 2).status, 'invalid');
      assert.equal(issuance.findOffering(tenant, later.id).status, 'draft');
      assert.equal(rights.capacitySummary(tenant, instrumentId).reserved, '20');
      assert.equal(issuance.tokenIdentity(tenant, instrumentId).id, rights.getTokenDefinition(tenant, instrumentId).id);
      fileStore.accounts[email].assetco.records[2].versions.push({ number: 2, name: '发行条款V2.pdf', size: 110, type: 'application/pdf', addedAt: Date.now(), addedBy: email, status: 'received', scan: 'passed' });
      sessionStorage.setItem(files.fileStorageKey, JSON.stringify(fileStore));
      assert.equal(issuance.findOffering(tenant, current.id).confirmed.disclosureRefs[0].version, 1);
      assert.equal(issuance.saveOfferingDraft(tenant, current.id, fields, 3).status, 'denied');
      assert.equal(issuance.recordAuthoritativeOfferingEvent(tenant, current.id, 'publish', { source: 'system' }).status, 'denied');
      assert.equal(issuance.recordAuthoritativeOfferingEvent(tenant, current.id, 'open', { source: 'system' }).status, 'denied');
      assert.equal(issuance.archiveProject(tenant, create.project.id).status, 'denied');
    });
    await t.test('Unknown allocation survives, no unsafe cancellation or real side effects', () => {
      assert.equal(rights.mockCapacityRepository.markUnknown(tenant, create.record.id), true);
      assert.equal(issuance.cancelConfirmedOffering(tenant, create.record.id, '复核').status, 'denied');
      assert.equal(rights.capacitySummary(tenant, instrumentId).remaining, '80');
      assert.equal(issuance.pauseOffering(tenant, create.record.id, '原因').status, 'denied');
      assert.equal(issuance.resumeOffering(tenant, create.record.id, { rootCauseResolved: true, readinessPassed: true }).status, 'denied');
      assert.equal(issuance.findOffering(tenant, create.record.id).facts.mintedTokens, '0');
      assert.equal(issuance.findOffering(tenant, create.record.id).publicationSnapshot, undefined);
    });
    await t.test('simulated system pause keeps the primary stage and reservation', () => {
      const store = JSON.parse(sessionStorage.getItem(issuance.issuanceStorageKey));
      const staged = store.accounts[email].assetco.offerings.find(item => item.id === create.record.id);
      staged.status = 'published';
      staged.publicationSnapshot = { simulatedForTestOnly: true };
      sessionStorage.setItem(issuance.issuanceStorageKey, JSON.stringify(store));
      const paused = issuance.pauseOffering(tenant, create.record.id, '风险核查', 'system');
      assert.equal(paused.status, 'saved');
      assert.equal(paused.record.status, 'published');
      assert.equal(paused.record.pause.source, 'system');
      assert.equal(rights.capacitySummary(tenant, instrumentId).reserved, '20');
      assert.equal(issuance.resumeOffering(tenant, create.record.id, { rootCauseResolved: true, readinessPassed: true }).status, 'denied');
    });
    await t.test('legacy records remain readable without automatic deletion', () => {
      const store = JSON.parse(sessionStorage.getItem(issuance.issuanceStorageKey));
      store.accounts[email].assetco.projects.push({ id: 'legacy-project', tenantId: 'assetco', number: 'PR-OLD', status: 'draft', versions: [{ number: 1, fields: { name: '旧项目', assetId: 'asset-2', assetVersion: 1, instrumentId, instrumentVersion: 1 }, savedAt: Date.now(), savedBy: email }] });
      store.accounts[email].assetco.offerings.push({ id: 'legacy-offering', tenantId: 'assetco', number: 'OF-OLD', status: 'sandbox-ended', versions: [{ number: 1, fields: { name: '旧方案', projectId: 'legacy-project', projectVersion: 1, assetId: 'asset-2', assetVersion: 1, instrumentId, instrumentVersion: 1, quantity: '5' }, savedAt: Date.now(), savedBy: email }], events: [] });
      sessionStorage.setItem(issuance.issuanceStorageKey, JSON.stringify(store));
      assert.equal(issuance.findProject(tenant, 'legacy-project').versions[0].fields.name, '旧项目');
      assert.equal(issuance.findOffering(tenant, 'legacy-offering').versions[0].fields.quantity, '5');
      assert.equal(issuance.offeringFields(issuance.findOffering(tenant, 'legacy-offering')).maxRights, '');
    });
    await t.test('downgrade preserves legacy references and rejects old write paths', () => {
      assert.equal(demo.simulateStandardEntitlement(tenant.id), true);
      assert.equal(demo.simulateDowngradedEntitlement(tenant.id), true);
      const historyTenant = demo.getDemoTenant();
      assert.equal(historyTenant.subscriptionState, 'downgraded');
      assert.equal(assets.canReadAssets(historyTenant), true);
      assert.equal(rights.canReadInstruments(historyTenant), true);
      assert.equal(issuance.canReadIssuance(historyTenant), true);
      assert.equal(files.canReadFiles(historyTenant), true);
      assert.equal(assets.findAsset(historyTenant, 'asset-1').id, 'asset-1');
      assert.equal(rights.findInstrument(historyTenant, instrumentId).id, instrumentId);
      assert.equal(issuance.findOffering(historyTenant, 'legacy-offering').id, 'legacy-offering');
      assert.equal(assets.canWriteAssets(tenant), false);
      assert.equal(rights.canEditInstruments(tenant), false);
      assert.equal(issuance.canEditIssuance(tenant), false);
      assert.equal(files.canEditFiles(tenant), false);
      assert.equal(assets.saveAsset(tenant, assetFields, 'asset-1', 1).status, 'denied');
      assert.equal(rights.saveInstrument(tenant, equity, instrumentId, 1).status, 'denied');
      assert.equal(issuance.createOfferingDraft(tenant, 'asset-1', instrumentId).status, 'denied');
    });
  } finally { await vite.close(); }
});
