import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { findAsset } from './issuerAssets';
import { capacitySummary, findInstrument, getTokenDefinition, instrumentErrors, mockCapacityRepository, reservationForOffering, reservationsForOffering, tokenMapping } from './issuerInstruments';
import { effectiveVisibility, refsFor, type FileRef } from './issuerFiles';
import { parseAmount } from './instrumentDomain';
import { nextOfferingStage, offeringAmounts, subscriptionLimits, type OfferingStage } from './offeringDomain';

// One browser-session Sandbox ledger for Project and Offering. Production requires server transactions.
export const issuanceStorageKey = 'wdex-issuer-issuance';
export type ProjectFields = { name: string; assetId: string; assetVersion: number; summary?: string; instrumentId?: string; instrumentVersion?: number };
export type OfferingFields = {
  name: string; projectId: string; projectVersion: number; assetId: string; assetVersion: number;
  instrumentId: string; instrumentVersion: number; maxRights: string; maxTokens: string;
  unitPrice: string; maxRaise: string; opensAt: string; closesAt: string;
  minSubscription: string; maxSubscription: string; tokenName: string; symbol: string;
  disclosureRefIds: string[];
};
export type Revision<T> = { number: number; fields: T; savedAt: number; savedBy: string; note?: string };
export type Project = { id: string; tenantId: string; number: string; assetId?: string; status: 'active' | 'archived' | 'draft'; versions: Revision<ProjectFields>[]; events?: IssuanceEvent[] };
export type OfferingPause = { source: 'enterprise' | 'system'; reason: string; at: number; resumedAt?: number; previousStage: OfferingStage };
export type OfferingFacts = { orderCount: number; fundState: 'none' | 'pending' | 'confirmed' | 'unknown'; allocatedRights: string; allocatedTokens: string; mintedTokens: string; mintState: 'none' | 'pending' | 'failed' | 'unknown' | 'passed'; obligationsCleared: boolean };
export type ConfirmedSnapshot = { confirmedAt: number; assetId: string; assetVersion: number; instrumentId: string; instrumentVersion: number; projectId: string; projectVersion: number; tokenDefinitionId: string; tokenMappingVersion: number; instrumentLegalRefId: string; instrumentLegalFile?: { refId: string; fileId: string; version: number }; disclosureRefs: { refId: string; fileId: string; version: number }[]; fields: OfferingFields };
export type PublicationSnapshot = { id: string; taskId: string; tenantId: string; offeringId: string; offeringVersion: number; projectId: string; projectVersion: number; assetId: string; assetVersion: number; instrumentId: string; instrumentVersion: number; tokenDefinitionId: string; tokenMappingVersion: number; terms: OfferingFields; riskSummary: string; riskDisclosureRefs: { refId: string; fileId: string; version: number }[]; legalFile?: { refId: string; fileId: string; version: number }; disclosureRefs: { refId: string; fileId: string; version: number }[]; contractId: string; environment: 'sandbox'; publishedAt: number };
export type IssuanceEvent = { kind: string; at: number; actor: string; note?: string; from?: string; to?: string };
export type Offering = { id: string; tenantId: string; number: string; round?: number; tokenDefinitionId?: string; status: OfferingStage | 'sandbox-published' | 'sandbox-paused' | 'sandbox-ended'; versions: Revision<OfferingFields>[]; events: IssuanceEvent[]; pause?: OfferingPause; pauseHistory?: OfferingPause[]; facts?: OfferingFacts; confirmed?: ConfirmedSnapshot; confirmedHistory?: ConfirmedSnapshot[]; publicationSnapshot?: PublicationSnapshot | unknown };
export type IssuanceIntent = { id: string; tenantId: string; actor: string; kind: 'save' | 'confirm'; recordId: string; expectedVersion: number; status: 'failed' | 'unknown'; snapshot?: OfferingFields };
type Bucket = { projects: Project[]; offerings: Offering[]; intent: IssuanceIntent | null; completedRequests?: Record<string, string> };
type Store = { accounts: Record<string, Record<string, Bucket>> };
export type Result<T> = { status: 'saved' | 'failed' | 'unknown' | 'conflict' | 'denied' | 'invalid'; record?: T; project?: Project; intent?: IssuanceIntent; requestId?: string; errors?: string[] };
const clone = <T,>(value: T): T => structuredClone(value);
const empty = (): Store => ({ accounts: {} });
const read = (): Store => { if (!isDemoPreview()) return empty(); try { const value = JSON.parse(sessionStorage.getItem(issuanceStorageKey) || 'null') as Store; return value?.accounts ? value : empty(); } catch { return empty(); } };
const write = (value: Store) => sessionStorage.setItem(issuanceStorageKey, JSON.stringify(value));
const scope = (tenant: DemoTenant, edit = false) => {
  if (!isDemoPreview()) return null;
  const auth = getDemoAuth(); const selected = getDemoTenant(); const controls = useDemoControls.getState().controls;
  if (!auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.issuanceAccess !== 'allowed') return null;
  if (edit && (selected.role !== '企业管理员' || selected.subscriptionState === 'downgraded')) return null;
  return { email: auth.email, tenantId: selected.id };
};
const bucket = (value: Store, email: string, tenantId: string): Bucket => value.accounts[email]?.[tenantId] || { projects: [], offerings: [], intent: null };
const put = (value: Store, email: string, tenantId: string, data: Bucket) => { value.accounts[email] ||= {}; value.accounts[email][tenantId] = data; write(value); };
const log = (kind: string, actor: string, note = '', from?: string, to?: string): IssuanceEvent => ({ kind, actor, note, from, to, at: Date.now() });
const defaultFacts = (): OfferingFacts => ({ orderCount: 0, fundState: 'none', allocatedRights: '0', allocatedTokens: '0', mintedTokens: '0', mintState: 'none', obligationsCleared: false });
export const canReadIssuance = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditIssuance = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export const latest = <T,>(record: { versions: Revision<T>[] }): Revision<T> => record.versions.at(-1)!;
export const blankOffering = (): OfferingFields => ({ name: '', projectId: '', projectVersion: 0, assetId: '', assetVersion: 0, instrumentId: '', instrumentVersion: 0, maxRights: '', maxTokens: '', unitPrice: '', maxRaise: '', opensAt: '', closesAt: '', minSubscription: '', maxSubscription: '', tokenName: '', symbol: '', disclosureRefIds: [] });
export const offeringFields = (record: Offering): OfferingFields => ({ ...blankOffering(), ...latest(record).fields });
export function listProjects(tenant: DemoTenant): Project[] | null { const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).projects.filter(item => item.tenantId === tenant.id)) : null; }
export function listOfferings(tenant: DemoTenant): Offering[] | null { const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).offerings.filter(item => item.tenantId === tenant.id)) : null; }
export const findProject = (tenant: DemoTenant, id: string) => listProjects(tenant)?.find(item => item.id === id) || null;
export const findOffering = (tenant: DemoTenant, id: string) => listOfferings(tenant)?.find(item => item.id === id) || null;
export const projectForAsset = (tenant: DemoTenant, assetId: string) => (listProjects(tenant) || []).find(item => (item.assetId || latest(item).fields.assetId) === assetId) || null;
export function getIssuanceIntent(tenant: DemoTenant) { const current = scope(tenant, true); return current ? clone(bucket(read(), current.email, tenant.id).intent) : null; }
export const suggestedSymbol = (instrumentId: string) => `R${instrumentId.replace(/[^a-z0-9]/gi, '').slice(0, 7).toUpperCase().padEnd(3, 'X')}`;
export function tokenIdentity(tenant: DemoTenant, instrumentId: string) {
  const definition = getTokenDefinition(tenant, instrumentId); if (!definition) return null;
  const original = (listOfferings(tenant) || []).find(item => item.confirmed?.instrumentId === instrumentId || item.confirmedHistory?.some(snapshot => snapshot.instrumentId === instrumentId));
  const instrument = findInstrument(tenant, instrumentId);
  const first = original?.confirmed?.fields || original?.confirmedHistory?.find(snapshot => snapshot.instrumentId === instrumentId)?.fields;
  return { id: definition.id, name: first?.tokenName || instrument?.versions.at(-1)?.fields.name || '逻辑Token', symbol: first?.symbol || suggestedSymbol(instrumentId), locked: Boolean(original), maxSupply: definition.totalSupply, mappingVersion: definition.mappingVersion };
}
function revision(fields: OfferingFields, number: number, email: string, note: string): Revision<OfferingFields> { return { number, fields: clone(fields), savedAt: Date.now(), savedBy: email, note }; }
function ownedProject(tenant: DemoTenant, projectId: string, assetId: string): Project | null {
  const project = findProject(tenant, projectId); return project && (project.assetId || latest(project).fields.assetId) === assetId && project.status !== 'archived' ? project : null;
}
function draftLinkErrors(tenant: DemoTenant, fields: OfferingFields): string[] {
  const errors: string[] = []; const project = ownedProject(tenant, fields.projectId, fields.assetId);
  if (!project || !project.versions.some(item => item.number === fields.projectVersion)) errors.push('Project 与 Asset 归属或固定版本不一致。');
  const asset = findAsset(tenant, fields.assetId);
  if (!asset || !asset.versions.some(item => item.number === fields.assetVersion)) errors.push('Asset 不属于当前企业或固定版本不存在。');
  if (fields.instrumentId) { const instrument = findInstrument(tenant, fields.instrumentId); const v = instrument?.versions.find(item => item.number === fields.instrumentVersion); if (!instrument || !v || v.fields.assetId !== fields.assetId) errors.push('Instrument 必须属于此 Asset，并引用明确版本。'); }
  return errors;
}
export function createOfferingDraft(tenant: DemoTenant, assetId: string, instrumentId = '', requestId = ''): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const key = requestId || crypto.randomUUID();
  const previous = data.completedRequests?.[key]; if (previous) { const record = data.offerings.find(item => item.id === previous); return record ? { status: 'saved', record: clone(record), project: clone(data.projects.find(item => item.id === offeringFields(record).projectId)!), requestId: key } : { status: 'conflict' }; }
  if (data.intent?.status === 'unknown') return { status: 'unknown', intent: clone(data.intent) };
  const asset = findAsset(tenant, assetId); if (!asset || ['restricted', 'archived'].includes(asset.state)) return { status: 'invalid', errors: ['Asset 不存在或已受限／归档，不能发起新方案。'] };
  const instrument = instrumentId ? findInstrument(tenant, instrumentId) : null;
  if (instrumentId && (!instrument || latest(instrument).fields.assetId !== assetId || !['ready', 'active'].includes(instrument.status))) return { status: 'invalid', errors: ['所选 Instrument 不属于该 Asset，或当前状态不可创建发行方案。'] };
  const existing = data.projects.find(item => (item.assetId || latest(item).fields.assetId) === assetId);
  if (existing?.status === 'archived') return { status: 'denied', errors: ['Project 已归档。'] };
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome !== 'success') return { status: outcome, requestId: key, errors: [outcome === 'unknown' ? '创建结果待确认，请使用原创建意图重试。' : 'Sandbox 创建失败，未写入 Project 或 Offering。'] };
  const projectId = existing?.id || crypto.randomUUID();
  const project: Project = existing || { id: projectId, tenantId: tenant.id, assetId, number: `PR-${projectId.slice(0, 8).toUpperCase()}`, status: 'active', versions: [{ number: 1, fields: { name: asset.versions.at(-1)?.fields.name || asset.number, assetId, assetVersion: asset.versions.at(-1)!.number }, savedAt: Date.now(), savedBy: current.email, note: '系统自动创建' }], events: [log('created', current.email, '首次创建 Offering 时自动建立')] };
  const id = crypto.randomUUID(); const identity = instrument ? tokenIdentity(tenant, instrument.id) : null;
  const fields: OfferingFields = { ...blankOffering(), projectId, projectVersion: latest(project).number, assetId, assetVersion: asset.versions.at(-1)!.number, instrumentId, instrumentVersion: instrument ? latest(instrument).number : 0, tokenName: identity?.name || '', symbol: identity?.symbol || '' };
  const round = data.offerings.filter(item => offeringFields(item).projectId === projectId).length + 1;
  const offering: Offering = { id, tenantId: tenant.id, number: `OF-${id.slice(0, 8).toUpperCase()}`, round, tokenDefinitionId: identity?.id, status: 'draft', versions: [revision(fields, 1, current.email, '创建草稿')], events: [log('created', current.email, `Project ${project.number} 第 ${round} 轮`)], facts: defaultFacts() };
  if (!existing) data.projects.push(project);
  else { existing.events ||= []; existing.events.push(log('offering-linked', current.email, offering.number)); }
  data.offerings.push(offering); data.completedRequests ||= {}; data.completedRequests[key] = id;
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(offering), project: clone(project), requestId: key };
}
export function saveOfferingDraft(tenant: DemoTenant, id: string, fields: OfferingFields, expectedVersion: number, requestId = ''): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id);
  const prior = requestId && data.completedRequests?.[requestId]; if (prior) { const result = data.offerings.find(item => item.id === prior); return result ? { status: 'saved', record: clone(result), requestId } : { status: 'conflict' }; }
  const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.status !== 'draft') return { status: 'denied', errors: ['只有 Draft 可编辑。'] };
  if (record.versions.length !== expectedVersion) return { status: 'conflict', errors: ['版本已变化，请重新打开当前草稿。'] };
  if (data.intent?.status === 'unknown') return { status: 'unknown', intent: clone(data.intent) };
  const original = offeringFields(record);
  if (fields.projectId !== original.projectId || fields.assetId !== original.assetId || fields.projectVersion !== original.projectVersion || fields.assetVersion !== original.assetVersion) return { status: 'invalid', errors: ['Project 和 Asset 已固定，不能改绑。'] };
  const errors = draftLinkErrors(tenant, fields); if (errors.length) return { status: 'invalid', errors };
  if (fields.name.length > 120) return { status: 'invalid', errors: ['Offering 名称不能超过 120 字。'] };
  const instrument = fields.instrumentId ? findInstrument(tenant, fields.instrumentId) : null;
  if (instrument && !['ready', 'active'].includes(instrument.status)) return { status: 'invalid', errors: ['Instrument 当前不可创建新发行。'] };
  const identity = instrument && tokenIdentity(tenant, instrument.id);
  if (identity?.locked && (fields.tokenName !== identity.name || fields.symbol !== identity.symbol)) return { status: 'invalid', errors: ['此 Instrument 的逻辑 Token 名称与 Symbol 已锁定。'] };
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome !== 'success') { const intent: IssuanceIntent = { id: requestId || crypto.randomUUID(), tenantId: tenant.id, actor: current.email, kind: 'save', recordId: id, expectedVersion, status: outcome, snapshot: clone(fields) }; data.intent = intent; put(value, current.email, tenant.id, data); return { status: outcome, intent: clone(intent) }; }
  record.versions.push(revision(fields, expectedVersion + 1, current.email, '保存 Draft 新版本'));
  record.tokenDefinitionId = instrument?.tokenDefinitionId;
  record.events.push(log('saved', current.email, `版本 ${expectedVersion + 1}`));
  data.intent = null; if (requestId) { data.completedRequests ||= {}; data.completedRequests[requestId] = id; }
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record), requestId };
}

const fileSnapshot = (ref: FileRef) => ({ refId: ref.id, fileId: ref.fileId, version: ref.version });
const parseWindow = (value: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? Date.parse(`${value}:00+08:00`) : NaN;
export function confirmationErrors(tenant: DemoTenant, record: Offering): string[] {
  const fields = offeringFields(record); const errors = draftLinkErrors(tenant, fields);
  const asset = findAsset(tenant, fields.assetId); const instrument = findInstrument(tenant, fields.instrumentId);
  const project = findProject(tenant, fields.projectId);
  if (!fields.name.trim()) errors.push('第一步：填写 Offering 名称。');
  if (asset?.state !== 'ready' || asset.versions.at(-1)?.number !== fields.assetVersion) errors.push('第一步：Asset 必须为最新 Ready 版本。');
  if (!instrument || !['ready', 'active'].includes(instrument.status) || instrument.versions.at(-1)?.number !== fields.instrumentVersion) errors.push('第一步：Instrument 必须为最新 Ready／Active 版本。');
  if (!project || project.status === 'archived') errors.push('第一步：Project 不可用。');
  const otherCurrent = (listOfferings(tenant) || []).some(item => item.id !== record.id && offeringFields(item).projectId === fields.projectId && item.status !== 'draft' && item.status !== 'completed');
  if (otherCurrent) errors.push('同一 Project 已有未完成的当前发行轮次；未来轮次可保留 Draft。');
  const identity = instrument && tokenIdentity(tenant, instrument.id);
  if (!identity || record.tokenDefinitionId && record.tokenDefinitionId !== identity.id) errors.push('第一步：逻辑 Token 身份无效。');
  if (!fields.tokenName.trim() || fields.tokenName.length > 64 || !/^[A-Z][A-Z0-9]{2,11}$/.test(fields.symbol)) errors.push('第一步：Token 名称或 Symbol 无效。');
  if (identity?.locked && (fields.tokenName !== identity.name || fields.symbol !== identity.symbol)) errors.push('此 Instrument 的逻辑 Token 名称和 Symbol 已由首轮确认锁定。');
  const source = instrument?.versions.find(item => item.number === fields.instrumentVersion)?.fields;
  const mapping = source && tokenMapping(source);
  if (!source || !mapping?.valid) errors.push('第二步：Instrument 固定 Token 映射不可用。');
  const perToken = mapping?.perToken || '';
  const amounts = offeringAmounts(fields.maxRights, perToken, fields.unitPrice);
  if (!amounts.valid) errors.push(`第二步：${amounts.error}`);
  if (amounts.valid && (fields.maxTokens !== amounts.tokens || fields.maxRaise !== amounts.raise)) errors.push('第二步：Token 数量或最大募集金额与精确计算结果不一致。');
  const capacity = instrument && capacitySummary(tenant, instrument.id);
  const requested = parseAmount(fields.maxRights); const remaining = capacity && parseAmount(capacity.remaining);
  if (!capacity || requested === null || remaining === null || requested <= 0n || requested > remaining) errors.push(`第二步：权益容量不足或无效；当前可发行 ${capacity?.remaining || '未知'} ${source?.type === 'equity' ? '股' : source?.type === 'debt' ? 'U' : '%'}。`);
  if (identity && amounts.valid && BigInt(amounts.tokens) > BigInt(identity.maxSupply)) errors.push('第二步：本轮 Token 数量超过 Instrument 最大供应量。');
  if (source && instrument && instrumentErrors(tenant, source, true, instrument.id).length) errors.push('Instrument 的权益、容量或法律文件条件已变化，请返回权益结构复核。');
  const opening = parseWindow(fields.opensAt); const closing = parseWindow(fields.closesAt);
  if (!Number.isFinite(opening) || !Number.isFinite(closing) || closing <= opening) errors.push('第三步：填写有效认购窗口，结束时间须晚于开始时间（UTC+08:00）。');
  errors.push(...subscriptionLimits(fields.minSubscription, fields.maxSubscription, fields.unitPrice, fields.maxRaise).map(item => `第三步：${item}`));
  const references = refsFor(tenant, 'offering', record.id);
  if (!fields.disclosureRefIds.length) errors.push('第三步：请选择必要条款及披露文件的固定版本。');
  for (const id of fields.disclosureRefIds) {
    const entry = references.find(item => item.ref.id === id); const version = entry?.file.versions.find(item => item.number === entry.ref.version);
    if (!entry || !version || version.scan !== 'passed' || entry.file.versions.at(-1)?.number !== version.number || effectiveVisibility(entry.ref, version) === 'internal') errors.push(`第三步：披露文件 ${id} 不属于本 Offering、不是最新模拟扫描通过版本，或不可向投资者披露。`);
  }
  if (fields.disclosureRefIds.length !== new Set(fields.disclosureRefIds).size) errors.push('第三步：披露文件引用不能重复。');
  return errors;
}
export function confirmOffering(tenant: DemoTenant, id: string, expectedVersion: number, requestId = ''): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record) return { status: 'denied' };
  if (record.status === 'confirmed' && record.confirmed && reservationForOffering(tenant, id)) return { status: 'saved', record: clone(record), requestId };
  if (record.status !== 'draft') return { status: 'denied' };
  if (record.versions.length !== expectedVersion) return { status: 'conflict', errors: ['版本已变化，请重新核对。'] };
  if (data.intent?.status === 'unknown') return { status: 'unknown', intent: clone(data.intent) };
  const errors = confirmationErrors(tenant, record); if (errors.length) return { status: 'invalid', errors };
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome !== 'success') { const intent: IssuanceIntent = { id: requestId || crypto.randomUUID(), tenantId: tenant.id, actor: current.email, kind: 'confirm', recordId: id, expectedVersion, status: outcome }; data.intent = intent; put(value, current.email, tenant.id, data); return { status: outcome, intent: clone(intent) }; }
  const fields = offeringFields(record); const instrument = findInstrument(tenant, fields.instrumentId)!; const definition = getTokenDefinition(tenant, instrument.id)!;
  if (!mockCapacityRepository.reserve(tenant, instrument.id, id, fields.maxRights, 'confirmed')) return { status: 'conflict', errors: [`容量预留冲突；当前剩余 ${capacitySummary(tenant, instrument.id)?.remaining || '未知'}，请重新核对。`] };
  const references = refsFor(tenant, 'offering', id);
  const legalRefId = instrument.versions.at(-1)!.fields.legalFileRefId || '';
  const legal = refsFor(tenant, 'instrument', instrument.id).find(item => item.ref.id === legalRefId);
  const snapshot: ConfirmedSnapshot = { confirmedAt: Date.now(), assetId: fields.assetId, assetVersion: fields.assetVersion, instrumentId: fields.instrumentId, instrumentVersion: fields.instrumentVersion, projectId: fields.projectId, projectVersion: fields.projectVersion, tokenDefinitionId: definition.id, tokenMappingVersion: definition.mappingVersion, instrumentLegalRefId: legalRefId, instrumentLegalFile: legal && fileSnapshot(legal.ref), disclosureRefs: references.filter(item => fields.disclosureRefIds.includes(item.ref.id)).map(item => fileSnapshot(item.ref)), fields: clone(fields) };
  record.confirmed = snapshot; record.status = 'confirmed'; record.tokenDefinitionId = definition.id; record.events.push(log('confirmed', current.email, '固定对象、文件和 Token 映射版本；权益容量预留一次', 'draft', 'confirmed'));
  data.intent = null; if (requestId) { data.completedRequests ||= {}; data.completedRequests[requestId] = id; }
  try { put(value, current.email, tenant.id, data); }
  catch { mockCapacityRepository.release(tenant, id); return { status: 'unknown', errors: ['确认记录写入失败；已尝试回滚预留，请核查原意图。'] }; }
  return { status: 'saved', record: clone(record), requestId };
}
export function checkIssuanceIntent(tenant: DemoTenant): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const intent = data.intent;
  if (!intent || intent.status !== 'unknown') return { status: 'denied' };
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome === 'unknown') return { status: 'unknown', intent: clone(intent) };
  data.intent = null; put(value, current.email, tenant.id, data);
  if (outcome === 'failed') return { status: 'failed', intent: clone(intent) };
  if (intent.kind === 'confirm') return confirmOffering(tenant, intent.recordId, intent.expectedVersion, intent.id);
  return intent.snapshot ? saveOfferingDraft(tenant, intent.recordId, intent.snapshot, intent.expectedVersion, intent.id) : { status: 'conflict' };
}
function hasExecutionTask(email: string, tenantId: string, offeringId: string): boolean {
  try {
    const data = JSON.parse(sessionStorage.getItem('wdex-issuer-readiness') || 'null') as { accounts?: Record<string, Record<string, { tasks?: { offeringId: string }[] }>> } | null;
    return Boolean(data?.accounts?.[email]?.[tenantId]?.tasks?.some(item => item.offeringId === offeringId));
  } catch { return true; }
}
export function cancelConfirmedOffering(tenant: DemoTenant, id: string, reason: string): Result<Offering> {
  const current = scope(tenant, true); if (!current || !reason.trim()) return { status: 'invalid', errors: ['请填写撤销确认原因。'] };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  const reservation = reservationForOffering(tenant, id); const facts = record?.facts || defaultFacts();
  if (!record || record.status !== 'confirmed' || !record.confirmed || !reservation || reservation.status !== 'active' || parseAmount(reservation.committed || '0')! > 0n || facts.orderCount || facts.fundState !== 'none' || parseAmount(facts.allocatedRights)! > 0n || parseAmount(facts.allocatedTokens)! > 0n || facts.mintState !== 'none' || data.intent?.status === 'unknown' || hasExecutionTask(current.email, tenant.id, id)) return { status: 'denied', errors: ['存在认购、资金、分配、Mint、执行任务或Unknown事实，不能安全撤销。'] };
  if (!mockCapacityRepository.release(tenant, id)) return { status: 'conflict', errors: ['容量释放失败，保持 Confirmed。'] };
  record.status = 'draft'; record.confirmedHistory ||= []; record.confirmedHistory.push(clone(record.confirmed)); record.confirmed = undefined;
  record.versions.push(revision(offeringFields(record), record.versions.length + 1, current.email, `撤销确认：${reason.trim()}`));
  record.events.push(log('confirmation-cancelled', current.email, reason.trim(), 'confirmed', 'draft'));
  try { put(value, current.email, tenant.id, data); }
  catch { const prior = record.confirmedHistory.at(-1)!; mockCapacityRepository.reserve(tenant, prior.instrumentId, id, prior.fields.maxRights, 'confirmed'); return { status: 'unknown', errors: ['撤销记录写入失败；预留状态待核对。'] }; }
  return { status: 'saved', record: clone(record) };
}
export function deleteEmptyDraftOffering(tenant: DemoTenant, id: string): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.status !== 'draft' || record.versions.length !== 1 || offeringFields(record).name || refsFor(tenant, 'offering', id).length || reservationForOffering(tenant, id)) return { status: 'denied', errors: ['只有无文件、无引用且未填写内容的初始空 Draft 可删除。'] };
  data.offerings = data.offerings.filter(item => item.id !== id);
  const project = data.projects.find(item => item.id === offeringFields(record).projectId); project?.events?.push(log('empty-draft-deleted', current.email, record.number));
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
export function archiveProject(tenant: DemoTenant, id: string): Result<Project> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.projects.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.status === 'archived') return { status: 'denied' };
  const rounds = data.offerings.filter(item => offeringFields(item).projectId === id);
  if (rounds.some(item => item.status !== 'completed' || !item.facts?.obligationsCleared || item.facts?.fundState === 'unknown' || item.facts?.mintState === 'unknown')) return { status: 'denied', errors: ['仍有未完成发行或未核清的资金、配售、存续义务，不能归档。'] };
  record.status = 'archived'; record.events ||= []; record.events.push(log('archived', current.email, '保留全部关联与历史'));
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
export function pauseOffering(tenant: DemoTenant, id: string, reason: string, source: 'enterprise' | 'system' = 'enterprise'): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || !['published', 'active'].includes(record.status) || record.pause || !reason.trim()) return { status: 'denied', errors: ['仅 Published／Active 可暂停，且必须填写原因。'] };
  record.pause = { source, reason: reason.trim(), at: Date.now(), previousStage: record.status as OfferingStage };
  record.events.push(log('paused', current.email, `${source}：${reason.trim()}`, record.status, record.status));
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
export function resumeOffering(tenant: DemoTenant, id: string, evidence?: { rootCauseResolved: boolean; readinessPassed: boolean }): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record?.pause || record.pause.source !== 'enterprise' || !['published', 'active'].includes(record.status) || !record.publicationSnapshot || !evidence?.rootCauseResolved || !evidence.readinessPassed) return { status: 'denied', errors: ['系统风险暂停或缺少发行准备复核证据，企业不能自行恢复。'] };
  const fields = offeringFields(record); const asset = findAsset(tenant, fields.assetId); const instrument = findInstrument(tenant, fields.instrumentId);
  if (asset?.state !== 'ready' || !instrument || !['ready', 'active'].includes(instrument.status) || Date.now() >= parseWindow(fields.closesAt)) return { status: 'invalid', errors: ['恢复前请检查 Asset、Instrument、窗口及发行准备 Gate。'] };
  record.pause.resumedAt = Date.now(); record.pauseHistory ||= []; record.pauseHistory.push(clone(record.pause)); record.events.push(log('resumed', current.email, '恢复前已重新核对 Sandbox 条件；正式生产 Gate 仍独立', record.status, record.status)); record.pause = undefined;
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
// DEV-04 must provide an authorized readiness/production result; no enterprise UI invokes this bridge.
export function recordAuthoritativeOfferingEvent(tenant: DemoTenant, id: string, event: 'publish' | 'open' | 'end' | 'settle' | 'complete', evidence: { source: 'readiness' | 'system'; publicationSnapshot?: unknown; obligationsVerified?: boolean }): Result<Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.offerings.find(item => item.id === id && item.tenantId === tenant.id);
  const next = record && nextOfferingStage(record.status as OfferingStage, event);
  if (!record || !next || record.pause) return { status: 'denied' };
  if (event === 'publish') return { status: 'denied', errors: ['DEV-04 发行准备权威接口尚未接入，当前不能发布或建立 Publication Snapshot。'] };
  if (evidence.source !== 'system') return { status: 'denied' };
  const fields = offeringFields(record);
  if (event === 'open' && (!record.publicationSnapshot || Date.now() < parseWindow(fields.opensAt) || Date.now() >= parseWindow(fields.closesAt))) return { status: 'denied', errors: ['未到有效认购窗口或缺少发布快照。'] };
  if (event === 'end' && Date.now() < parseWindow(fields.closesAt)) return { status: 'denied', errors: ['认购窗口尚未结束；售罄需另有权威证据。'] };
  if (event === 'complete' && (!evidence.obligationsVerified || record.facts?.orderCount || !['none', 'confirmed'].includes(record.facts?.fundState || 'none') || ['pending', 'unknown'].includes(record.facts?.mintState || 'none'))) return { status: 'denied', errors: ['订单、资金、配售及 Token 事实尚未核清。'] };
  const before = record.status; record.status = next; if (event === 'complete') { record.facts ||= defaultFacts(); record.facts.obligationsCleared = true; }
  record.events.push(log(event, current.email, '受控业务事实；Sandbox 不代表真实链或资金', before, next)); put(value, current.email, tenant.id, data);
  return { status: 'saved', record: clone(record) };
}
// Sandbox bridge: only a persisted, successful execution task can publish. Browser storage is not production authority.
export function publishOfferingFromSandboxTask(tenant: DemoTenant, snapshot: PublicationSnapshot): Result<Offering> {
  const current = scope(tenant, true); if (!current || snapshot.environment !== 'sandbox' || snapshot.tenantId !== tenant.id) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id);
  const record = data.offerings.find(item => item.id === snapshot.offeringId && item.tenantId === tenant.id);
  if (record?.status === 'published' && (record.publicationSnapshot as PublicationSnapshot | undefined)?.taskId === snapshot.taskId) return { status: 'saved', record: clone(record) };
  if (!record || record.status !== 'confirmed' || record.pause || !record.confirmed || latest(record).number !== snapshot.offeringVersion) return { status: 'denied', errors: ['Offering 已变化，不能发布旧确认版本。'] };
  const fixed = record.confirmed;
  if (fixed.assetId !== snapshot.assetId || fixed.assetVersion !== snapshot.assetVersion || fixed.instrumentId !== snapshot.instrumentId || fixed.instrumentVersion !== snapshot.instrumentVersion || fixed.projectId !== snapshot.projectId || fixed.projectVersion !== snapshot.projectVersion || fixed.tokenDefinitionId !== snapshot.tokenDefinitionId || fixed.tokenMappingVersion !== snapshot.tokenMappingVersion || JSON.stringify(fixed.fields) !== JSON.stringify(snapshot.terms) || JSON.stringify(fixed.disclosureRefs) !== JSON.stringify(snapshot.disclosureRefs) || JSON.stringify(fixed.instrumentLegalFile) !== JSON.stringify(snapshot.legalFile) || snapshot.riskDisclosureRefs.some(item => !fixed.disclosureRefs.some(ref => ref.refId === item.refId && ref.fileId === item.fileId && ref.version === item.version))) return { status: 'conflict', errors: ['Publication Snapshot 与 Confirmed 固定对象或文件版本不一致。'] };
  const asset = findAsset(tenant, fixed.assetId); const instrument = findInstrument(tenant, fixed.instrumentId);
  if (asset?.state !== 'ready' || asset.versions.at(-1)?.number !== fixed.assetVersion || !instrument || !['ready', 'active'].includes(instrument.status) || instrument.versions.at(-1)?.number !== fixed.instrumentVersion) return { status: 'conflict', errors: ['Asset 或 Instrument 状态／版本已变化。'] };
  if (snapshot.riskSummary !== (instrument.versions.find(item => item.number === fixed.instrumentVersion)?.fields.risks || '')) return { status: 'conflict', errors: ['风险披露摘要与固定Instrument版本不一致。'] };
  const reservations = reservationsForOffering(tenant, record.id);
  if (reservations?.length !== 1 || reservations[0].status !== 'active' || reservations[0].instrumentId !== fixed.instrumentId || reservations[0].amount !== fixed.fields.maxRights) return { status: 'conflict', errors: ['权益预留不是唯一有效的 Confirmed 记录。'] };
  try {
    const readyStore = JSON.parse(sessionStorage.getItem('wdex-issuer-readiness') || 'null') as { accounts?: Record<string, Record<string, { tasks?: { id: string; offeringId: string; offeringVersion: number; status: string; simulationResult?: string; contractId?: string }[]; contracts?: { id: string; status: string; instrumentId: string; tokenDefinitionId: string; mappingVersion: number }[] }>> } | null;
    const readiness = readyStore?.accounts?.[current.email]?.[tenant.id];
    const task = readiness?.tasks?.find(item => item.id === snapshot.taskId && item.offeringId === record.id && item.offeringVersion === snapshot.offeringVersion && item.status === 'running' && item.simulationResult === 'passed' && item.contractId === snapshot.contractId);
    const contract = readiness?.contracts?.find(item => item.id === snapshot.contractId && item.status === 'simulated' && item.instrumentId === fixed.instrumentId && item.tokenDefinitionId === fixed.tokenDefinitionId && item.mappingVersion === fixed.tokenMappingVersion);
    if (!task || !contract) return { status: 'denied', errors: ['未找到核验通过的原模拟执行任务及 Contract。'] };
  } catch { return { status: 'unknown', errors: ['执行任务记录无法核验。'] }; }
  record.status = 'published'; record.publicationSnapshot = clone(snapshot);
  record.events.push(log('sandbox-published', current.email, `Sandbox 模拟任务 ${snapshot.taskId} 已核验；非真实公开发行`, 'confirmed', 'published'));
  try { put(value, current.email, tenant.id, data); }
  catch { return { status: 'unknown', errors: ['模拟发布写入结果Unknown；请核查原任务和Offering。'] }; }
  return { status: 'saved', record: clone(record) };
}
