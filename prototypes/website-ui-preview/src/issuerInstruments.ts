import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { assetMissing, findAsset, listAssets, type Asset } from './issuerAssets';

// Browser-only demonstration records. Production authorization and legal review require server services.
export const instrumentStorageKey = 'wdex-issuer-instruments';
export type InstrumentType = '' | 'debt' | 'spv';
export type InstrumentStatus = 'draft' | 'reviewing' | 'changes' | 'completed' | 'paused' | 'archived';
export type InstrumentMaterial = { id: string; name: string; reference: string };
export type InstrumentFields = {
  name: string; type: InstrumentType; assetId: string; assetVersion: number; purpose: string;
  issuer: string; debtor: string; debtorRelation: string; debtNature: string; rightsContent: string;
  spv: string; spvRole: string; spvAssetRelation: string; equityNature: string; holderRights: string;
  economicSummary: string; principal: string; currency: string; interest: string; interestPayment: string; repayment: string; maturity: string; priority: string;
  equitySource: string; equityShare: string; distribution: string; governance: string; exitTerms: string;
  qualification: string; transfer: string; disclosure: string; buyback: string; risks: string; materials: InstrumentMaterial[];
};
export type InstrumentVersion = { number: number; fields: InstrumentFields; savedAt: number; savedBy: string; assetName: string; assetNumber: string };
export type InstrumentEvent = { id: string; version: number; kind: 'saved' | 'submitted' | 'returned' | 'completed' | 'paused' | 'archived'; at: number; actor: string; note: string };
export type Instrument = { id: string; tenantId: string; number: string; status: InstrumentStatus; versions: InstrumentVersion[]; events: InstrumentEvent[]; submittedBy?: string; submittedAt?: number };
export type InstrumentIntent = { id: string; kind: 'save' | 'submit' | 'review'; tenantId: string; instrumentId: string; expectedVersion: number; actor: string; status: 'processing' | 'failed' | 'unknown'; snapshot?: InstrumentFields; decision?: 'completed' | 'changes'; note?: string };
type TenantData = { records: Instrument[]; intent: InstrumentIntent | null };
type Store = { accounts: Record<string, Record<string, TenantData>> };
export type InstrumentResult = { status: 'saved' | 'completed' | 'changes' | 'failed' | 'unknown' | 'conflict' | 'denied' | 'invalid'; record?: Instrument; intent?: InstrumentIntent; errors?: string[] };

export const typeLabels: Record<Exclude<InstrumentType, ''>, string> = { debt: '债权型', spv: 'SPV权益型' };
export const statusLabels: Record<InstrumentStatus, string> = { draft: '草稿', reviewing: '审核中', changes: '待修改', completed: '内部复核完成', paused: '已暂停', archived: '已归档' };
export const blankInstrumentFields = (): InstrumentFields => ({
  name: '', type: '', assetId: '', assetVersion: 0, purpose: '', issuer: '', debtor: '', debtorRelation: '', debtNature: '', rightsContent: '',
  spv: '', spvRole: '', spvAssetRelation: '', equityNature: '', holderRights: '', economicSummary: '', principal: '', currency: '', interest: '', interestPayment: '', repayment: '', maturity: '', priority: '',
  equitySource: '', equityShare: '', distribution: '', governance: '', exitTerms: '', qualification: '', transfer: '', disclosure: '', buyback: '', risks: '', materials: [],
});
const clone = <T,>(value: T): T => structuredClone(value);
const empty = (): Store => ({ accounts: {} });
const read = (): Store => {
  if (!isDemoPreview()) return empty();
  try { const value = JSON.parse(sessionStorage.getItem(instrumentStorageKey) || 'null') as Store; return value?.accounts && typeof value.accounts === 'object' ? value : empty(); }
  catch { return empty(); }
};
const write = (value: Store) => sessionStorage.setItem(instrumentStorageKey, JSON.stringify(value));
const scope = (tenant: DemoTenant, edit = false) => {
  if (!isDemoPreview()) return null;
  const auth = getDemoAuth(); const selected = getDemoTenant(); const controls = useDemoControls.getState().controls;
  if (!auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.instrumentAccess !== 'allowed') return null;
  if (edit && selected.role !== '企业管理员') return null;
  return { email: auth.email, tenantId: selected.id };
};
const data = (value: Store, email: string, tenantId: string): TenantData => value.accounts[email]?.[tenantId] || { records: [], intent: null };
const put = (value: Store, email: string, tenantId: string, next: TenantData) => { value.accounts[email] ||= {}; value.accounts[email][tenantId] = next; write(value); };
const event = (version: number, kind: InstrumentEvent['kind'], actor: string, note = ''): InstrumentEvent => ({ id: crypto.randomUUID(), version, kind, at: Date.now(), actor, note });
const latest = (record: Instrument) => record.versions.at(-1)!;

export const canReadInstruments = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditInstruments = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listInstruments(tenant: DemoTenant): Instrument[] | null {
  const current = scope(tenant); return current ? clone(data(read(), current.email, current.tenantId).records.filter(item => item.tenantId === tenant.id)) : null;
}
export function findInstrument(tenant: DemoTenant, id: string): Instrument | null { return listInstruments(tenant)?.find(item => item.id === id) || null; }
export function eligibleAssets(tenant: DemoTenant): Asset[] {
  return (listAssets(tenant) || []).filter(item => item.state !== 'archived' && item.versions.length && !assetMissing(item.versions.at(-1)!.fields).length);
}
export function instrumentErrors(tenant: DemoTenant, fields: InstrumentFields, forReview = false): string[] {
  const errors: string[] = [];
  if (fields.name.length > 120) errors.push('权益结构名称不能超过120字。');
  if (fields.type !== '' && fields.type !== 'debt' && fields.type !== 'spv') errors.push('权益类型暂不支持。');
  if (fields.principal && (!/^\d+(?:\.\d+)?$/.test(fields.principal) || Number(fields.principal) <= 0)) errors.push('本金说明中的数值必须大于0。');
  if (fields.principal && !fields.currency.trim()) errors.push('填写本金数值时，请说明币种。');
  if (forReview) {
    if (!fields.name.trim()) errors.push('请填写权益结构名称。');
    if (!fields.type) errors.push('请选择权益类型。');
    if (!fields.assetId) errors.push('请选择关联资产。');
    if (!fields.purpose.trim()) errors.push('请说明结构用途。');
    if (fields.type === 'debt' && (!fields.issuer.trim() || !fields.debtor.trim() || !fields.debtNature.trim() || !fields.rightsContent.trim() || !fields.economicSummary.trim())) errors.push('债权型请补充发行主体、债务人、债权性质、权利内容和经济条款说明。');
    if (fields.type === 'spv' && (!fields.spv.trim() || !fields.spvAssetRelation.trim() || !fields.equityNature.trim() || !fields.holderRights.trim() || !fields.economicSummary.trim())) errors.push('SPV权益型请补充SPV主体、底层资产关系、权益性质、持有人权利和经济条款说明。');
  }
  if (fields.assetId) {
    const asset = findAsset(tenant, fields.assetId);
    const current = asset?.versions.at(-1);
    if (!asset || asset.state === 'archived' || !current || assetMissing(current.fields).length || current.number !== fields.assetVersion) errors.push('关联资产已失效或版本已更新，请重新核对资产资料。');
  }
  return errors;
}
export function getInstrumentIntent(tenant: DemoTenant): InstrumentIntent | null {
  const current = scope(tenant, true); return current ? clone(data(read(), current.email, current.tenantId).intent) : null;
}
function commitSave(value: Store, email: string, tenantId: string, intent: InstrumentIntent): InstrumentResult {
  const current = data(value, email, tenantId);
  const existing = current.records.find(item => item.id === intent.instrumentId);
  if ((existing?.versions.length || 0) !== intent.expectedVersion || !intent.snapshot) return { status: 'conflict', intent: clone(intent) };
  const asset = findAsset(getDemoTenant()!, intent.snapshot.assetId);
  const version: InstrumentVersion = { number: intent.expectedVersion + 1, fields: clone(intent.snapshot), savedAt: Date.now(), savedBy: email, assetName: asset?.versions.at(-1)?.fields.name || '待补充', assetNumber: asset?.number || '' };
  const next: Instrument = existing ? { ...existing, status: 'draft', versions: [...existing.versions, version], events: [...existing.events, event(version.number, 'saved', email)], submittedBy: undefined, submittedAt: undefined }
    : { id: intent.instrumentId, tenantId, number: `RS-${intent.instrumentId.slice(0, 8).toUpperCase()}`, status: 'draft', versions: [version], events: [event(1, 'saved', email)] };
  current.records = existing ? current.records.map(item => item.id === next.id ? next : item) : [...current.records, next];
  current.intent = null; put(value, email, tenantId, current);
  return { status: 'saved', record: clone(next) };
}
export function saveInstrument(tenant: DemoTenant, fields: InstrumentFields, id?: string, expectedVersion = 0, retryId?: string): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const errors = instrumentErrors(tenant, fields); if (errors.length) return { status: 'invalid', errors };
  const value = read(); const bucket = data(value, current.email, current.tenantId);
  if (bucket.intent?.status === 'processing' || bucket.intent?.status === 'unknown') return { status: bucket.intent.status === 'unknown' ? 'unknown' : 'denied', intent: clone(bucket.intent) };
  const existing = id ? bucket.records.find(item => item.id === id && item.tenantId === tenant.id) : undefined;
  if (id && (!existing || existing.status === 'archived' || existing.status === 'paused' || existing.status === 'reviewing')) return { status: 'denied' };
  if ((existing?.versions.length || 0) !== expectedVersion || useDemoControls.getState().controls.instrumentVersion === 'conflict') return { status: 'conflict' };
  const retry = bucket.intent?.status === 'failed' && bucket.intent.kind === 'save' && bucket.intent.id === retryId && (!id || bucket.intent.instrumentId === id) ? bucket.intent : null;
  const intent: InstrumentIntent = { id: retry?.id || crypto.randomUUID(), kind: 'save', tenantId: tenant.id, actor: current.email, instrumentId: id || retry?.instrumentId || crypto.randomUUID(), expectedVersion, snapshot: clone(fields), status: 'processing' };
  bucket.intent = intent; put(value, current.email, current.tenantId, bucket);
  const outcome = useDemoControls.getState().controls.instrumentSave;
  if (outcome === 'success') return commitSave(value, current.email, current.tenantId, intent);
  intent.status = outcome; put(value, current.email, current.tenantId, bucket);
  return { status: outcome, intent: clone(intent) };
}
export function checkInstrumentIntent(tenant: DemoTenant): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, current.tenantId); const intent = bucket.intent;
  if (!intent || intent.status !== 'unknown') return { status: 'denied' };
  if (intent.kind === 'review') return settleReview(tenant, value, current.email, bucket, intent);
  if (intent.kind === 'submit') return settleSubmit(tenant, value, current.email, bucket, intent);
  const outcome = useDemoControls.getState().controls.instrumentSave;
  if (outcome === 'success') return commitSave(value, current.email, current.tenantId, intent);
  if (outcome === 'failed') { intent.status = 'failed'; put(value, current.email, current.tenantId, bucket); return { status: 'failed', intent: clone(intent) }; }
  return { status: 'unknown', intent: clone(intent) };
}
function settleSubmit(tenant: DemoTenant, value: Store, email: string, bucket: TenantData, intent: InstrumentIntent): InstrumentResult {
  const record = bucket.records.find(item => item.id === intent.instrumentId && item.tenantId === tenant.id);
  if (!record || record.versions.length !== intent.expectedVersion || !['draft', 'changes'].includes(record.status)) return { status: 'conflict', intent: clone(intent) };
  const errors = instrumentErrors(tenant, latest(record).fields, true);
  if (errors.length) { intent.status = 'failed'; put(value, email, tenant.id, bucket); return { status: 'invalid', intent: clone(intent), errors }; }
  const outcome = useDemoControls.getState().controls.instrumentSubmit;
  if (outcome !== 'success') { intent.status = outcome; put(value, email, tenant.id, bucket); return { status: outcome, intent: clone(intent), record: clone(record) }; }
  record.status = 'reviewing'; record.submittedBy = email; record.submittedAt = Date.now();
  record.events.push(event(intent.expectedVersion, 'submitted', email, '提交企业内部复核'));
  bucket.intent = null; put(value, email, tenant.id, bucket);
  return { status: 'saved', record: clone(record) };
}
export function submitInstrument(tenant: DemoTenant, id: string, expectedVersion: number, confirmed: boolean): InstrumentResult {
  const current = scope(tenant, true); if (!current || !confirmed) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, current.tenantId);
  if (bucket.intent?.status === 'unknown' || bucket.intent?.status === 'processing') return { status: 'unknown', intent: clone(bucket.intent) };
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.versions.length !== expectedVersion || !['draft', 'changes'].includes(record.status)) return { status: 'denied' };
  const errors = instrumentErrors(tenant, latest(record).fields, true); if (errors.length) return { status: 'invalid', errors };
  const retry = bucket.intent?.kind === 'submit' && bucket.intent.status === 'failed' && bucket.intent.instrumentId === id && bucket.intent.expectedVersion === expectedVersion ? bucket.intent : null;
  const intent: InstrumentIntent = { id: retry?.id || crypto.randomUUID(), kind: 'submit', tenantId: tenant.id, instrumentId: id, expectedVersion, actor: current.email, status: 'processing' };
  bucket.intent = intent; put(value, current.email, tenant.id, bucket);
  return settleSubmit(tenant, value, current.email, bucket, intent);
}
const reviewer = (tenant: DemoTenant, submitter: string): string | null => {
  const current = scope(tenant, true); if (!current) return null;
  const identity = useDemoControls.getState().controls.instrumentReviewer;
  if (identity !== 'independent') return null;
  const actor = `internal-reviewer:${tenant.id}`;
  return actor !== submitter ? actor : null;
};
export function canReviewInstrument(tenant: DemoTenant, record: Instrument): boolean { return record.status === 'reviewing' && Boolean(reviewer(tenant, record.submittedBy || '')); }
function settleReview(tenant: DemoTenant, value: Store, email: string, bucket: TenantData, intent: InstrumentIntent): InstrumentResult {
  const record = bucket.records.find(item => item.id === intent.instrumentId && item.tenantId === tenant.id);
  if (!record || record.status !== 'reviewing' || latest(record).number !== intent.expectedVersion || !intent.decision || !reviewer(tenant, record.submittedBy || '')) return { status: 'denied' };
  const outcome = useDemoControls.getState().controls.instrumentReview;
  if (outcome !== 'success') { intent.status = outcome; put(value, email, tenant.id, bucket); return { status: outcome, intent: clone(intent) }; }
  record.status = intent.decision;
  record.events.push(event(intent.expectedVersion, intent.decision === 'completed' ? 'completed' : 'returned', intent.actor, intent.note || ''));
  bucket.intent = null; put(value, email, tenant.id, bucket);
  return { status: intent.decision, record: clone(record) };
}
export function reviewInstrument(tenant: DemoTenant, id: string, expectedVersion: number, decision: 'completed' | 'changes', note: string): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, current.tenantId); const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || !canReviewInstrument(tenant, record) || record.versions.length !== expectedVersion || !note.trim()) return { status: 'denied' };
  if (bucket.intent?.status === 'unknown' || bucket.intent?.status === 'processing') return { status: 'unknown', intent: clone(bucket.intent) };
  const intent: InstrumentIntent = { id: crypto.randomUUID(), kind: 'review', tenantId: tenant.id, actor: reviewer(tenant, record.submittedBy || '')!, instrumentId: id, expectedVersion, decision, note: note.trim(), status: 'processing' };
  bucket.intent = intent; put(value, current.email, tenant.id, bucket);
  return settleReview(tenant, value, current.email, bucket, intent);
}
export function setInstrumentState(tenant: DemoTenant, id: string, next: 'paused' | 'archived'): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, tenant.id); const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.status === 'archived' || (next === 'paused' && record.status === 'paused') || bucket.intent?.status === 'unknown') return { status: 'denied' };
  record.status = next; record.events.push(event(latest(record).number, next, current.email, next === 'paused' ? '暂停内部使用' : '归档'));
  put(value, current.email, tenant.id, bucket); return { status: 'saved', record: clone(record) };
}
