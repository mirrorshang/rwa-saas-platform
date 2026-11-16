import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
globalThis.window = { dispatchEvent: () => {} };
globalThis.Event = class { constructor(type) { this.type = type; } };
const standard = { id: 'issuer-one', name: '甲公司', plan: 'Standard', role: '企业管理员' };
const free = { ...standard, plan: 'Free' };
const other = { ...standard, id: 'issuer-two', name: '乙公司' };
let selected = standard;
let email = 'issuer@example.com';
const source = ts.transpileModule(readFileSync('src/issuerPortalV1.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const portal = {};
new Function('require', 'exports', source)(() => ({ getDemoAuth: () => ({ email }), getDemoTenant: () => selected }), portal);

test('Free cannot save configuration or start a publication preview', () => {
  selected = free;
  assert.equal(portal.readPortal(free).draft, null);
  assert.throws(() => portal.savePortalDraft(free, '甲公司门户', null, 0), /无权/);
  assert.throws(() => portal.startPreviewAction(free, 'publish'), /无权/);
});

test('Standard draft is versioned and isolated by tenant and account', () => {
  selected = standard;
  assert.match(portal.validatePortalName('   '), /1～80/);
  assert.match(portal.validatePortalLogo({ type: 'image/svg+xml', size: 100 }), /PNG/);
  const saved = portal.savePortalDraft(standard, '  甲公司门户  ', null, 0);
  assert.equal(saved.draft.name, '甲公司门户');
  assert.equal(saved.draft.version, 1);
  assert.throws(() => portal.savePortalDraft(standard, '旧版本', null, 0), /版本已变化/);
  selected = other;
  assert.equal(portal.readPortal(other).draft, null);
  selected = standard;
  email = 'another@example.com';
  assert.equal(portal.readPortal(standard).draft, null);
  email = 'issuer@example.com';
});

test('Unknown original intent blocks duplicate action and query does not create another', () => {
  selected = standard;
  const started = portal.startPreviewAction(standard, 'publish');
  assert.equal(started.previewState, 'processing');
  const unknown = portal.finishPreviewAction(standard, started.intent.id, 'unknown');
  assert.equal(unknown.previewState, 'unknown');
  assert.equal(portal.inspectPreviewIntent(standard).intent.id, started.intent.id);
  assert.throws(() => portal.startPreviewAction(standard, 'publish'), /前一操作结果待确认/);
  const finished = portal.finishPreviewAction(standard, started.intent.id, 'success');
  assert.equal(finished.previewState, 'published');
  assert.equal(portal.readPortal(standard).intent, null);
  const paused = portal.startPreviewAction(standard, 'pause');
  assert.equal(portal.finishPreviewAction(standard, paused.intent.id, 'failed').previewState, 'published');
});

test('Sandbox and draft Offerings never become publicly displayable from portal state', () => {
  const row = { id: 'of-1', number: 'OF-1', name: '一期', assetName: '资产', assetVersion: 1, instrumentVersion: 1,
    stage: '草稿', startsAt: '', endsAt: '', timezone: 'UTC', disclosure: '有效', source: '当前发行方案' };
  assert.equal(portal.portalOfferingVisibility(row).label, '不可展示');
  assert.equal(portal.portalOfferingVisibility({ ...row, stage: 'Sandbox 已发布' }).label, '不可展示');
  assert.equal(portal.portalOfferingVisibility({ ...row, stage: '已发布', disclosure: '缺项' }).label, '不可展示');
  assert.equal(portal.portalOfferingVisibility({ ...row, stage: '已发布', disclosure: '有效' }).label, '待核实');
});
