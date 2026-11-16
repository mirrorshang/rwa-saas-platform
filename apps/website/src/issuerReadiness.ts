import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { assetFieldErrors, assetMissing, findAsset, propertyLabels } from './issuerAssets';
import { capacitySummary, findInstrument, getTokenDefinition, instrumentErrors, markInstrumentPublished, reservationsForOffering, tokenMapping } from './issuerInstruments';
import { assetFileReadiness, effectiveVisibility, listFiles, type FileRef, type FileVersion } from './issuerFiles';
import { findOffering, findProject, latest, offeringFields, pauseOffering, publishOfferingFromSandboxTask, recordAuthoritativeOfferingEvent, tokenIdentity, type Offering, type OfferingFields, type PublicationSnapshot } from './issuerIssuance';
import { offeringAmounts, subscriptionLimits } from './offeringDomain';

// Isolated browser-session Sandbox ledger. No Provider, Signer, RPC, payment or real investor API is called.
export const readinessStorageKey = 'wdex-issuer-readiness';
export const sandboxDeclarationVersion = 'SANDBOX-RESPONSIBILITY-v1';
export const sandboxDeclarationText = '我已阅读本轮资产、权益、发行参数及披露预览，并确认由当前企业对其所填资料负责。本操作仅生成 Sandbox 模拟发行记录，不构成正式法律协议、真实募资或链上发行。';
export type ReadinessMode = 'sandbox' | 'production';
export type CheckStatus = 'PASS' | 'PENDING' | 'BLOCKED' | 'UNKNOWN';
export type ReadinessCheck = { code: string; label: string; status: CheckStatus; items: string[]; reason: string; source: string; reference: string; checkedAt: number; fixHref: string; stale?: boolean };
export type CheckRun = { id: string; tenantId: string; offeringId: string; offeringVersion: number; mode: ReadinessMode; fingerprint: string; checkedAt: number; checks: ReadinessCheck[]; stale?: boolean };
export type ResponsibilityDeclaration = { id: string; operationId: string; version: string; text: string; actor: string; tenantId: string; offeringId: string; offeringVersion: number; assetId: string; assetVersion: number; instrumentId: string; instrumentVersion: number; legalFile?: { refId: string; fileId: string; version: number }; disclosureRefs: { refId: string; fileId: string; version: number }[]; mode: ReadinessMode; fingerprint: string; confirmedAt: number };
export type TaskStatus = 'submitted' | 'pending-admission' | 'running' | 'failed' | 'unknown' | 'verified';
export type TaskStep = { name: string; status: 'pending' | 'running' | 'failed' | 'unknown' | 'passed'; at: number; detail: string };
export type ExecutionTask = { id: string; key: string; intentId: string; tenantId: string; actor: string; offeringId: string; offeringVersion: number; projectId: string; assetId: string; assetVersion: number; instrumentId: string; instrumentVersion: number; tokenDefinitionId: string; tokenMappingVersion: number; checkRunId: string; checkCodes: string[]; declarationId: string; declarationVersion: string; mode: ReadinessMode; fingerprint: string; createdAt: number; status: TaskStatus; steps: TaskStep[]; simulationResult?: 'passed' | 'failed' | 'unknown'; contractId?: string; snapshotId?: string; error?: string };
export type SandboxContract = { id: string; tenantId: string; instrumentId: string; tokenDefinitionId: string; mappingVersion: number; version: number; status: 'simulated' | 'failed' | 'unknown'; createdAt: number; taskIds: string[]; note: string };
export type ChannelStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'unknown';
export type ChannelApplication = { id: string; tenantId: string; offeringId: string; offeringVersion: number; snapshotId: string; disclosureRefs: PublicationSnapshot['disclosureRefs']; actor: string; appliedAt: number; status: ChannelStatus; reason?: string; events: { status: ChannelStatus; at: number; actor: string; reason?: string }[] };
type Bucket = { runs: CheckRun[]; declarations: ResponsibilityDeclaration[]; tasks: ExecutionTask[]; contracts: SandboxContract[]; snapshots: PublicationSnapshot[]; applications: ChannelApplication[] };
type Store = { accounts: Record<string, Record<string, Bucket>> };
export type ReadinessResult<T> = { status: 'saved' | 'denied' | 'invalid' | 'conflict' | 'failed' | 'unknown'; record?: T; errors?: string[] };
const clone = <T,>(value: T): T => structuredClone(value);
const emptyBucket = (): Bucket => ({ runs: [], declarations: [], tasks: [], contracts: [], snapshots: [], applications: [] });
const empty = (): Store => ({ accounts: {} });
const read = (): Store => { if (!isDemoPreview()) return empty(); try { const stored = JSON.parse(sessionStorage.getItem(readinessStorageKey) || 'null') as Store; return stored?.accounts ? stored : empty(); } catch { return empty(); } };
const bucket = (store: Store, email: string, tenantId: string) => store.accounts[email]?.[tenantId] || emptyBucket();
const put = (store: Store, email: string, tenantId: string, value: Bucket) => { store.accounts[email] ||= {}; store.accounts[email][tenantId] = value; sessionStorage.setItem(readinessStorageKey, JSON.stringify(store)); };
const scope = (tenant: DemoTenant, edit = false) => {
  const auth = getDemoAuth(); const selected = getDemoTenant(); const controls = useDemoControls.getState().controls;
  if (!isDemoPreview() || !auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.issuanceAccess !== 'allowed') return null;
  if (edit && selected.role !== '企业管理员') return null;
  return { email: auth.email, tenantId: tenant.id };
};
const status = (blocked: string[], unknown: string[], pending: string[]): CheckStatus => blocked.length ? 'BLOCKED' : unknown.length ? 'UNKNOWN' : pending.length ? 'PENDING' : 'PASS';
const check = (code: string, label: string, source: string, reference: string, fixHref: string, items: string[], blocked: string[] = [], unknown: string[] = [], pending: string[] = []): ReadinessCheck => ({ code, label, status: status(blocked, unknown, pending), items, reason: [...blocked, ...unknown, ...pending].join('；') || '当前 Sandbox 适用检查通过；不代表生产或法律事实已获核准。', source, reference, checkedAt: Date.now(), fixHref });
const assetLink = (id: string) => `/issuer/assets/${id}`;
const instrumentLink = (id: string) => `/issuer/instruments/${id}`;
const offeringLink = (id: string) => `/issuer/offerings/${id}`;

export function readinessFingerprint(tenant: DemoTenant, offeringId: string, mode: ReadinessMode): string | null {
  if (!scope(tenant)) return null;
  const offering = findOffering(tenant, offeringId); if (!offering) return null;
  const fields = offeringFields(offering); const asset = findAsset(tenant, fields.assetId); const instrument = findInstrument(tenant, fields.instrumentId);
  const docs = listFiles(tenant); const owners = new Set([`asset/${fields.assetId}`, `instrument/${fields.instrumentId}`, `offering/${offeringId}`]);
  const refs = (docs?.refs || []).filter(ref => owners.has(`${ref.owner}/${ref.ownerId}`));
  const files = refs.map(ref => ({ ref, record: docs?.records.find(file => file.id === ref.fileId) || null }));
  const controls = useDemoControls.getState().controls;
  return JSON.stringify({ tenant: { id: tenant.id, plan: tenant.plan, role: tenant.role }, mode, asset, instrument, project: findProject(tenant, fields.projectId), offering, token: getTokenDefinition(tenant, fields.instrumentId), capacity: capacitySummary(tenant, fields.instrumentId), reservations: reservationsForOffering(tenant, offeringId), files, checkService: controls.readinessCheck, riskGuard: controls.readinessRiskGuard });
}

function findPinnedFile(tenant: DemoTenant, ref: { refId: string; fileId: string; version: number }): { ref: FileRef; version: FileVersion; latest: number } | null {
  const files = listFiles(tenant); const link = files?.refs.find(item => item.id === ref.refId && item.fileId === ref.fileId && item.version === ref.version);
  const record = files?.records.find(item => item.id === ref.fileId); const version = record?.versions.find(item => item.number === ref.version);
  return link && record && version ? { ref: link, version, latest: record.versions.at(-1)!.number } : null;
}

export function evaluateReadiness(tenant: DemoTenant, offeringId: string, mode: ReadinessMode = 'sandbox'): ReadinessCheck[] | null {
  const current = scope(tenant); if (!current) return null;
  const offering = findOffering(tenant, offeringId); if (!offering) return null;
  const fields = offeringFields(offering); const fixed = offering.confirmed;
  const asset = findAsset(tenant, fields.assetId); const instrument = findInstrument(tenant, fields.instrumentId); const project = findProject(tenant, fields.projectId);
  const token = getTokenDefinition(tenant, fields.instrumentId); const identity = tokenIdentity(tenant, fields.instrumentId);
  const capacity = capacitySummary(tenant, fields.instrumentId); const reservations = reservationsForOffering(tenant, offeringId);
  const controls = useDemoControls.getState().controls; const timeout = controls.readinessCheck === 'timeout' ? ['Sandbox 检查服务超时，请重新检查原记录。'] : [];
  const production = mode === 'production'; const result: ReadinessCheck[] = [];
  result.push(check('P01', '企业与发行环境', 'Tenant／账号／订阅 Sandbox Mock', `Tenant ${tenant.id} · ${tenant.plan} · ${mode}`, offeringLink(offeringId), ['Tenant归属', '企业账号权限', 'Sandbox与Standard环境'], production ? ['Standard真实生产许可、KYB和法域准入尚未获批准；仅可使用Sandbox模拟。'] : scope(tenant, true) ? [] : ['当前账号无企业操作权限。'], timeout));
  const assetMissingItems = asset ? assetMissing(latest(asset).fields) : ['Asset不存在'];
  const assetFieldItems = asset ? assetFieldErrors(latest(asset).fields) : [];
  const assetFileItems = asset ? assetFileReadiness(tenant, asset.id, latest(asset).fields) : [];
  result.push(check('P02', 'Asset与文件', 'DEV-01 Asset／文件模型', `Asset ${fields.assetId} V${fields.assetVersion}`, assetLink(fields.assetId), ['Ready状态', '房地产必填字段', '资产文件扫描与版本'], asset && ['restricted', 'archived'].includes(asset.state) ? [`Asset 当前为 ${asset.state}，禁止发布。`] : [], timeout, [...(!asset || asset.state !== 'ready' || latest(asset).number !== fields.assetVersion ? ['Asset不是固定的最新Ready版本。'] : []), ...assetMissingItems, ...assetFieldItems, ...assetFileItems]));
  const legal = fixed?.instrumentLegalFile && findPinnedFile(tenant, fixed.instrumentLegalFile);
  const legalInvalid = !legal || legal.version.scan !== 'passed' || legal.latest !== legal.version.number || effectiveVisibility(legal.ref, legal.version) === 'internal';
  const instrumentIssues = instrument ? instrumentErrors(tenant, latest(instrument).fields, true, instrument.id) : ['Instrument不存在'];
  const mapping = instrument && tokenMapping(latest(instrument).fields);
  result.push(check('P03', 'Instrument及权益容量', 'DEV-02 Instrument／容量仓库', `Instrument ${fields.instrumentId} V${fields.instrumentVersion} · Token ${token?.id || '未知'}`, instrumentLink(fields.instrumentId), ['权益类型与权利', '法律文件固定版本', 'Token映射', '授权／分配／预留／剩余量'], instrument && ['suspended', 'terminating', 'terminated'].includes(instrument.status) ? [`Instrument 当前为 ${instrument.status}。`] : [], timeout, [...(!instrument || !['ready', 'active'].includes(instrument.status) || latest(instrument).number !== fields.instrumentVersion ? ['Instrument不是固定的最新Ready／Active版本。'] : []), ...instrumentIssues, ...(legalInvalid ? ['法律文件版本、扫描或可见范围无效。'] : []), ...(!mapping?.valid || !token || !capacity || !identity ? ['Token映射或容量不可核实。'] : [])]));
  const amounts = mapping?.valid ? offeringAmounts(fields.maxRights, mapping.perToken, fields.unitPrice) : null;
  const limits = subscriptionLimits(fields.minSubscription, fields.maxSubscription, fields.unitPrice, fields.maxRaise);
  const opens = Date.parse(`${fields.opensAt}:00+08:00`); const closes = Date.parse(`${fields.closesAt}:00+08:00`);
  const onlyReservation = reservations?.length === 1 ? reservations[0] : null;
  const fixedValid = Boolean(fixed && fixed.assetId === fields.assetId && fixed.assetVersion === fields.assetVersion && fixed.instrumentId === fields.instrumentId && fixed.instrumentVersion === fields.instrumentVersion && fixed.projectId === fields.projectId && fixed.projectVersion === fields.projectVersion && fixed.tokenDefinitionId === token?.id && fixed.tokenMappingVersion === token?.mappingVersion && JSON.stringify(fixed.fields) === JSON.stringify(fields));
  const linksValid = Boolean(project && instrument && (project.assetId || latest(project).fields.assetId) === fields.assetId && latest(instrument).fields.assetId === fields.assetId);
  result.push(check('P04', 'Offering发行方案', 'DEV-03 Offering Confirmed／容量预留', `Offering ${offeringId} V${latest(offering).number}`, offeringLink(offeringId), ['Confirmed固定对象', '唯一容量预留', '精确Token量与募集额', '窗口及认购限额'], offering.status !== 'confirmed' || offering.pause ? ['Offering不是可发起的Confirmed状态，或已暂停。'] : [], timeout, [...(!fixedValid || !linksValid ? ['Project、Asset、Instrument或Token固定版本不一致。'] : []), ...(!onlyReservation || onlyReservation.status !== 'active' || onlyReservation.instrumentId !== fields.instrumentId || onlyReservation.amount !== fields.maxRights ? ['必须恰好存在一笔匹配的有效容量预留。'] : []), ...(!amounts?.valid || amounts.tokens !== fields.maxTokens || amounts.raise !== fields.maxRaise ? ['Token数量或募集金额与固定映射不一致。'] : []), ...(!Number.isFinite(opens) || !Number.isFinite(closes) || closes <= opens || closes <= Date.now() ? ['认购窗口无效或已结束。'] : []), ...limits]));
  const disclosures = fixed?.disclosureRefs || [];
  const disclosureIssues = disclosures.flatMap(ref => { const file = findPinnedFile(tenant, ref); return !file || file.version.scan !== 'passed' || file.latest !== file.version.number || effectiveVisibility(file.ref, file.version) === 'internal' ? [`披露文件 ${ref.fileId} V${ref.version} 不可用于投资者预览。`] : []; });
  result.push(check('P05', '投资者展示与准入机制', '固定披露文件／Sandbox风险守卫模拟', `Offering V${latest(offering).number} · ${disclosures.length}份固定文件`, offeringLink(offeringId), ['投资者可见披露', '风险摘要', 'KYC及强制守卫机制模拟'], controls.readinessRiskGuard === 'blocked' ? ['强制风险守卫模拟阻断。'] : [], [...timeout, ...(controls.readinessRiskGuard === 'unknown' ? ['风险守卫结果Unknown。'] : [])], [...(!disclosures.length ? ['缺少可披露的条款文件。'] : []), ...disclosureIssues, ...(!instrument?.versions.find(item => item.number === fields.instrumentVersion)?.fields.risks?.trim() ? ['Instrument风险披露摘要缺失。'] : [])]));
  result.push(check('P06', '支付及Token技术准备', 'Sandbox模拟服务／生产技术Gate', `环境 ${mode} · OP Mainnet USDT仅为未来真实支付方式`, offeringLink(offeringId), ['Sandbox模拟支付路径', '逻辑Token与模拟Contract', '真实Provider／Signer／合约／资金Gate'], production ? ['真实生产服务尚未完成技术及法律准入，当前仅支持Sandbox模拟。'] : [], timeout));
  const fingerprint = readinessFingerprint(tenant, offeringId, mode);
  const declaration = bucket(read(), current.email, tenant.id).declarations.filter(item => item.offeringId === offeringId && item.mode === mode).at(-1);
  const declarationValid = declaration && declaration.version === sandboxDeclarationVersion && declaration.fingerprint === fingerprint && declaration.actor === current.email && declaration.offeringVersion === latest(offering).number;
  result.push(check('P07', '企业最终责任声明', '当前账号明确确认的声明事实', `声明 ${sandboxDeclarationVersion} · Offering V${latest(offering).number}`, offeringLink(offeringId), ['主动阅读', '版本一致', '账号／Tenant／对象及文件快照'], production ? ['真实生产声明版本尚未获法律批准。'] : [], timeout, declarationValid ? [] : ['请阅读并确认当前模拟责任声明；对象或声明版本变化需重新确认。']));
  return timeout.length ? result.map(item => ({ ...item, status: 'UNKNOWN' as const, reason: timeout[0] })) : result;
}

export function runReadinessChecks(tenant: DemoTenant, offeringId: string, mode: ReadinessMode = 'sandbox'): ReadinessResult<CheckRun> {
  const current = scope(tenant); if (!current) return { status: 'denied' };
  const checks = evaluateReadiness(tenant, offeringId, mode); const fingerprint = readinessFingerprint(tenant, offeringId, mode); const offering = findOffering(tenant, offeringId);
  if (!checks || !fingerprint || !offering) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id);
  const record: CheckRun = { id: crypto.randomUUID(), tenantId: tenant.id, offeringId, offeringVersion: latest(offering).number, mode, fingerprint, checkedAt: Date.now(), checks };
  data.runs.push(record); put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
export function listCheckHistory(tenant: DemoTenant, offeringId: string): CheckRun[] | null { const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).runs.filter(item => item.offeringId === offeringId)) : null; }
export function latestCheckRun(tenant: DemoTenant, offeringId: string, mode: ReadinessMode = 'sandbox'): CheckRun | null {
  const record = listCheckHistory(tenant, offeringId)?.filter(item => item.mode === mode).at(-1); if (!record) return null;
  const currentChecks = evaluateReadiness(tenant, offeringId, mode);
  if (record.fingerprint === readinessFingerprint(tenant, offeringId, mode) && currentChecks?.length === record.checks.length && currentChecks.every((item, index) => item.status === record.checks[index].status)) return record;
  return { ...record, stale: true, checks: record.checks.map(item => ({ ...item, status: 'UNKNOWN', stale: true, reason: `原检查${item.status}已失效：对象、文件、容量或服务状态发生变化；请重新检查。` })) };
}
export function confirmResponsibility(tenant: DemoTenant, offeringId: string, acknowledged: boolean, mode: ReadinessMode = 'sandbox'): ReadinessResult<ResponsibilityDeclaration> {
  const current = scope(tenant, true); const offering = findOffering(tenant, offeringId); const run = latestCheckRun(tenant, offeringId, mode);
  if (!current || !offering) return { status: 'denied' };
  if (!acknowledged || mode !== 'sandbox' || offering.status !== 'confirmed' || !offering.confirmed || !run || run.stale || run.checks.slice(0, 6).some(item => item.status !== 'PASS')) return { status: 'invalid', errors: ['请先完成当前版本前六组Sandbox检查，并主动阅读确认声明。'] };
  const fixed = offering.confirmed; const value = read(); const data = bucket(value, current.email, tenant.id);
  const record: ResponsibilityDeclaration = { id: crypto.randomUUID(), operationId: crypto.randomUUID(), version: sandboxDeclarationVersion, text: sandboxDeclarationText, actor: current.email, tenantId: tenant.id, offeringId, offeringVersion: latest(offering).number, assetId: fixed.assetId, assetVersion: fixed.assetVersion, instrumentId: fixed.instrumentId, instrumentVersion: fixed.instrumentVersion, legalFile: clone(fixed.instrumentLegalFile), disclosureRefs: clone(fixed.disclosureRefs), mode, fingerprint: run.fingerprint, confirmedAt: Date.now() };
  data.declarations.push(record); put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}

export function taskForOffering(tenant: DemoTenant, offeringId: string): ExecutionTask | null {
  const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).tasks.find(item => item.offeringId === offeringId) || null) : null;
}
export function contractForInstrument(tenant: DemoTenant, instrumentId: string): SandboxContract | null {
  const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).contracts.find(item => item.instrumentId === instrumentId) || null) : null;
}
export function publicationForOffering(tenant: DemoTenant, offeringId: string): PublicationSnapshot | null {
  const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).snapshots.find(item => item.offeringId === offeringId) || null) : null;
}
export function channelApplicationForOffering(tenant: DemoTenant, offeringId: string): ChannelApplication | null {
  const current = scope(tenant); return current ? clone(bucket(read(), current.email, tenant.id).applications.find(item => item.offeringId === offeringId) || null) : null;
}
export function createExecutionTask(tenant: DemoTenant, offeringId: string, intentId: string, mode: ReadinessMode = 'sandbox'): ReadinessResult<ExecutionTask> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const offering = findOffering(tenant, offeringId); if (!offering) return { status: 'denied' };
  const key = `${tenant.id}/${offeringId}/v${latest(offering).number}/${mode}`;
  const value = read(); const data = bucket(value, current.email, tenant.id);
  const prior = data.tasks.find(item => item.key === key);
  if (prior) return { status: prior.status === 'unknown' ? 'unknown' : 'saved', record: clone(prior) };
  const run = latestCheckRun(tenant, offeringId, mode);
  const declaration = data.declarations.filter(item => item.offeringId === offeringId && item.mode === mode).at(-1);
  const fingerprint = readinessFingerprint(tenant, offeringId, mode);
  if (mode !== 'sandbox' || offering.status !== 'confirmed' || !offering.confirmed || !run || run.stale || !fingerprint || run.fingerprint !== fingerprint || run.checks.length !== 7 || run.checks.some(item => item.status !== 'PASS') || evaluateReadiness(tenant, offeringId, mode)?.some(item => item.status !== 'PASS') || !declaration || declaration.version !== sandboxDeclarationVersion || declaration.fingerprint !== fingerprint || declaration.offeringVersion !== latest(offering).number || declaration.actor !== current.email) return { status: 'invalid', errors: ['七组检查、责任声明、当前对象版本或Sandbox路径不满足发起条件。请重新检查。'] };
  const fixed = offering.confirmed; const reservations = reservationsForOffering(tenant, offeringId);
  if (reservations?.length !== 1 || reservations[0].status !== 'active' || reservations[0].instrumentId !== fixed.instrumentId || reservations[0].amount !== fixed.fields.maxRights) return { status: 'conflict', errors: ['Confirmed权益容量预留已变化，拒绝创建任务。'] };
  const outcome = useDemoControls.getState().controls.readinessTaskCreate;
  const record: ExecutionTask = { id: crypto.randomUUID(), key, intentId: intentId || crypto.randomUUID(), tenantId: tenant.id, actor: current.email, offeringId, offeringVersion: latest(offering).number, projectId: fixed.projectId, assetId: fixed.assetId, assetVersion: fixed.assetVersion, instrumentId: fixed.instrumentId, instrumentVersion: fixed.instrumentVersion, tokenDefinitionId: fixed.tokenDefinitionId, tokenMappingVersion: fixed.tokenMappingVersion, checkRunId: run.id, checkCodes: run.checks.map(item => item.code), declarationId: declaration.id, declarationVersion: declaration.version, mode, fingerprint, createdAt: Date.now(), status: outcome === 'success' ? 'submitted' : outcome === 'unknown' ? 'unknown' : 'failed', steps: [{ name: '创建唯一发行执行任务', status: outcome === 'success' ? 'passed' : outcome === 'unknown' ? 'unknown' : 'failed', at: Date.now(), detail: outcome === 'success' ? 'Sandbox任务已提交，尚未部署或发布。' : '保留原Task及Intent；请查询或在失败核实后重试。' }], error: outcome === 'success' ? undefined : 'Sandbox任务创建结果异常，原Task已保留。' };
  data.tasks.push(record); put(value, current.email, tenant.id, data);
  return { status: outcome === 'unknown' ? 'unknown' : outcome === 'failed' ? 'failed' : 'saved', record: clone(record) };
}

function snapshotForTask(tenant: DemoTenant, task: ExecutionTask, offering: Offering, contractId: string): PublicationSnapshot {
  const fixed = offering.confirmed!;
  const instrument = findInstrument(tenant, fixed.instrumentId);
  const refs = listFiles(tenant)?.refs || [];
  const riskDisclosureRefs = fixed.disclosureRefs.filter(item => refs.some(ref => ref.id === item.refId && ref.fileId === item.fileId && ref.version === item.version && /风险|risk/i.test(ref.category)));
  return { id: crypto.randomUUID(), taskId: task.id, tenantId: task.tenantId, offeringId: task.offeringId, offeringVersion: task.offeringVersion, projectId: fixed.projectId, projectVersion: fixed.projectVersion, assetId: fixed.assetId, assetVersion: fixed.assetVersion, instrumentId: fixed.instrumentId, instrumentVersion: fixed.instrumentVersion, tokenDefinitionId: fixed.tokenDefinitionId, tokenMappingVersion: fixed.tokenMappingVersion, terms: clone(fixed.fields), riskSummary: instrument?.versions.find(item => item.number === fixed.instrumentVersion)?.fields.risks || '', riskDisclosureRefs: clone(riskDisclosureRefs), legalFile: clone(fixed.instrumentLegalFile), disclosureRefs: clone(fixed.disclosureRefs), contractId, environment: 'sandbox', publishedAt: Date.now() };
}

export function executeSandboxTask(tenant: DemoTenant, taskId: string): ReadinessResult<ExecutionTask> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const task = data.tasks.find(item => item.id === taskId && item.tenantId === tenant.id);
  if (!task || task.mode !== 'sandbox') return { status: 'denied' };
  if (task.status === 'verified') return { status: 'saved', record: clone(task) };
  if (task.status === 'unknown') return { status: 'unknown', record: clone(task), errors: ['原执行任务Unknown，先查询原Intent，不再启动新模拟部署。'] };
  if (!['submitted', 'failed', 'pending-admission'].includes(task.status)) return { status: 'denied', errors: ['原任务仍在执行中，请先查询结果。'] };
  const run = latestCheckRun(tenant, task.offeringId, task.mode); const offering = findOffering(tenant, task.offeringId);
  const declaration = data.declarations.filter(item => item.offeringId === task.offeringId && item.mode === task.mode).at(-1);
  const validNow = Boolean(run && !run.stale && run.checks.length === 7 && run.checks.every(item => item.status === 'PASS') && evaluateReadiness(tenant, task.offeringId, task.mode)?.every(item => item.status === 'PASS') && offering && offering.status === 'confirmed' && latest(offering).number === task.offeringVersion && declaration?.version === sandboxDeclarationVersion && declaration.fingerprint === run.fingerprint && declaration.offeringVersion === task.offeringVersion);
  if (!validNow || !run || !declaration || !offering) {
    task.status = 'pending-admission'; task.error = '对象或检查已变化；保留原任务，请回源修复、重新检查及确认声明。';
    task.steps.push({ name: '重新核对发行准入', status: 'pending', at: Date.now(), detail: task.error });
    put(value, current.email, tenant.id, data); return { status: 'conflict', record: clone(task), errors: [task.error] };
  }
  if (task.status === 'pending-admission' || run.id !== task.checkRunId || run.fingerprint !== task.fingerprint) {
    task.checkRunId = run.id; task.fingerprint = run.fingerprint; task.declarationId = declaration.id; task.declarationVersion = declaration.version; task.status = 'submitted'; task.error = undefined;
    task.steps.push({ name: '重新核对发行准入', status: 'passed', at: Date.now(), detail: '原任务使用当前七组检查和最新声明继续，未创建新Task。' });
    put(value, current.email, tenant.id, data);
  }
  let contract = data.contracts.find(item => item.instrumentId === task.instrumentId);
  if (contract && (contract.tokenDefinitionId !== task.tokenDefinitionId || contract.mappingVersion !== task.tokenMappingVersion)) return { status: 'conflict', errors: ['模拟Contract与逻辑Token或映射版本不一致。'] };
  if (contract?.status === 'unknown') return { status: 'unknown', record: clone(task), errors: ['原模拟Contract仍Unknown，禁止重复创建。'] };
  if (!contract) {
    contract = { id: crypto.randomUUID(), tenantId: tenant.id, instrumentId: task.instrumentId, tokenDefinitionId: task.tokenDefinitionId, mappingVersion: task.tokenMappingVersion, version: 1, status: 'unknown', createdAt: Date.now(), taskIds: [], note: 'Sandbox模拟记录，非真实链上合约' };
    data.contracts.push(contract);
  }
  if (!contract.taskIds.includes(task.id)) contract.taskIds.push(task.id);
  const outcome = contract.status === 'simulated' ? 'success' : useDemoControls.getState().controls.sandboxExecution;
  if (outcome !== 'success') {
    contract.status = outcome === 'unknown' ? 'unknown' : 'failed'; task.status = outcome === 'unknown' ? 'unknown' : 'failed'; task.simulationResult = outcome === 'unknown' ? 'unknown' : 'failed'; task.contractId = contract.id;
    task.error = outcome === 'unknown' ? '模拟部署结果Unknown；只能核对原任务和Contract。' : '模拟部署失败；Offering仍为Confirmed。';
    task.steps.push({ name: 'Sandbox模拟Contract部署或复用', status: outcome === 'unknown' ? 'unknown' : 'failed', at: Date.now(), detail: task.error });
    put(value, current.email, tenant.id, data); return { status: outcome, record: clone(task), errors: [task.error] };
  }
  contract.status = 'simulated'; task.status = 'running'; task.simulationResult = 'passed'; task.contractId = contract.id; task.error = undefined;
  task.steps.push({ name: 'Sandbox模拟Contract部署或复用', status: 'passed', at: Date.now(), detail: contract.taskIds.length > 1 ? `复用模拟Contract ${contract.id}` : `模拟Contract ${contract.id} 已核验；无真实链地址。` });
  put(value, current.email, tenant.id, data);
  const snapshot = snapshotForTask(tenant, task, offering, contract.id);
  const published = publishOfferingFromSandboxTask(tenant, snapshot);
  if (published.status !== 'saved') {
    task.status = published.status === 'unknown' ? 'unknown' : 'failed'; task.error = (published.errors || []).join('；') || '模拟发布失败。';
    task.steps.push({ name: 'Sandbox模拟Offering发布', status: task.status === 'unknown' ? 'unknown' : 'failed', at: Date.now(), detail: task.error });
    put(value, current.email, tenant.id, data); return { status: task.status === 'unknown' ? 'unknown' : 'failed', record: clone(task), errors: [task.error] };
  }
  const instrument = findInstrument(tenant, task.instrumentId);
  if (instrument?.status === 'ready' && markInstrumentPublished(tenant, task.instrumentId, task.offeringId).status !== 'saved') {
    task.status = 'unknown'; task.error = 'Offering模拟发布已记录，但Instrument状态同步待核查。';
    put(value, current.email, tenant.id, data); return { status: 'unknown', record: clone(task), errors: [task.error] };
  }
  const actualSnapshot = (published.record?.publicationSnapshot as PublicationSnapshot | undefined) || snapshot;
  task.status = 'verified'; task.snapshotId = actualSnapshot.id; task.steps.push({ name: 'Sandbox模拟Offering发布', status: 'passed', at: Date.now(), detail: `Publication Snapshot ${actualSnapshot.id}；非真实公开发行。` });
  if (!data.snapshots.some(item => item.id === actualSnapshot.id)) data.snapshots.push(actualSnapshot);
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(task) };
}

export function reconcileSandboxTask(tenant: DemoTenant, taskId: string): ReadinessResult<ExecutionTask> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const task = data.tasks.find(item => item.id === taskId && item.tenantId === tenant.id);
  if (!task) return { status: 'denied' };
  if (task.status === 'verified') return { status: 'saved', record: clone(task) };
  const offering = findOffering(tenant, task.offeringId);
  if (offering?.status === 'published' && (offering.publicationSnapshot as PublicationSnapshot | undefined)?.taskId === task.id) {
    const snapshot = offering.publicationSnapshot as PublicationSnapshot;
    const instrument = findInstrument(tenant, task.instrumentId);
    if (instrument?.status === 'ready' && markInstrumentPublished(tenant, task.instrumentId, task.offeringId).status !== 'saved') return { status: 'unknown', record: clone(task), errors: ['Instrument状态同步仍待核查。'] };
    if (!data.snapshots.some(item => item.id === snapshot.id)) data.snapshots.push(snapshot);
    task.status = 'verified'; task.snapshotId = snapshot.id; task.simulationResult = 'passed'; task.error = undefined;
    put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(task) };
  }
  if (task.status !== 'unknown') return { status: 'saved', record: clone(task) };
  const outcome = useDemoControls.getState().controls.sandboxExecution;
  if (outcome === 'unknown') return { status: 'unknown', record: clone(task) };
  const contract = task.contractId ? data.contracts.find(item => item.id === task.contractId) : undefined;
  if (contract?.status === 'unknown') contract.status = outcome === 'success' ? 'simulated' : 'failed';
  task.status = outcome === 'success' ? 'submitted' : 'failed'; task.simulationResult = outcome === 'success' ? undefined : 'failed';
  task.steps.push({ name: '查询原模拟执行意图', status: outcome === 'success' ? 'passed' : 'failed', at: Date.now(), detail: outcome === 'success' ? '原Contract结果已核实，继续原任务。' : '原模拟执行失败，可在修复后重试原任务。' });
  put(value, current.email, tenant.id, data);
  return outcome === 'success' ? executeSandboxTask(tenant, task.id) : { status: 'failed', record: clone(task) };
}

export function applyForMChannel(tenant: DemoTenant, offeringId: string): ReadinessResult<ChannelApplication> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const offering = findOffering(tenant, offeringId); const snapshot = publicationForOffering(tenant, offeringId);
  const asset = snapshot && findAsset(tenant, snapshot.assetId); const instrument = snapshot && findInstrument(tenant, snapshot.instrumentId);
  if (!offering || !snapshot || !['published', 'active'].includes(offering.status) || offering.pause || snapshot.offeringId !== offeringId || snapshot.tenantId !== tenant.id || asset?.state !== 'ready' || !instrument || !['ready', 'active'].includes(instrument.status) || useDemoControls.getState().controls.readinessRiskGuard !== 'simulated-ready') return { status: 'invalid', errors: ['仅已模拟发布、资料有效且无整体风险暂停的本轮Offering可申请M渠道。'] };
  const value = read(); const data = bucket(value, current.email, tenant.id); const prior = data.applications.find(item => item.offeringId === offeringId && item.offeringVersion === snapshot.offeringVersion);
  if (prior) return { status: 'saved', record: clone(prior) };
  const record: ChannelApplication = { id: crypto.randomUUID(), tenantId: tenant.id, offeringId, offeringVersion: snapshot.offeringVersion, snapshotId: snapshot.id, disclosureRefs: clone(snapshot.disclosureRefs), actor: current.email, appliedAt: Date.now(), status: 'pending', events: [{ status: 'pending', at: Date.now(), actor: current.email }] };
  data.applications.push(record); put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}
// Fixture-only P result receiver. It is absent from the Issuer UI and disabled outside local Sandbox preview.
export function receivePlatformReviewFixture(tenant: DemoTenant, applicationId: string, decision: 'approved' | 'rejected' | 'suspended' | 'unknown', reason: string, source: 'platform-test-fixture'): ReadinessResult<ChannelApplication> {
  const current = scope(tenant); if (!current || source !== 'platform-test-fixture' || (decision !== 'approved' && !reason.trim())) return { status: 'denied' };
  const value = read(); const data = bucket(value, current.email, tenant.id); const record = data.applications.find(item => item.id === applicationId && item.tenantId === tenant.id);
  if (!record) return { status: 'denied' };
  record.status = decision; record.reason = reason.trim(); record.events.push({ status: decision, at: Date.now(), actor: 'P-SANDBOX-FIXTURE', reason: record.reason });
  put(value, current.email, tenant.id, data); return { status: 'saved', record: clone(record) };
}

export function investorPreview(tenant: DemoTenant, offeringId: string) {
  if (!scope(tenant)) return null;
  const offering = findOffering(tenant, offeringId); if (!offering) return null;
  const published = publicationForOffering(tenant, offeringId); const fixed = offering.confirmed;
  const terms: OfferingFields = published?.terms || fixed?.fields || offeringFields(offering);
  const asset = findAsset(tenant, terms.assetId); const instrument = findInstrument(tenant, terms.instrumentId);
  const assetFields = asset?.versions.find(item => item.number === (published?.assetVersion || fixed?.assetVersion))?.fields;
  const rights = instrument?.versions.find(item => item.number === (published?.instrumentVersion || fixed?.instrumentVersion))?.fields;
  const refs = published?.disclosureRefs || fixed?.disclosureRefs || [];
  const documents = refs.flatMap(ref => { const found = findPinnedFile(tenant, ref); return found && found.version.scan === 'passed' && effectiveVisibility(found.ref, found.version) !== 'internal' ? [{ id: ref.fileId, version: ref.version, name: found.version.name, category: found.ref.category, visibility: effectiveVisibility(found.ref, found.version) }] : []; });
  return { simulated: true, publiclyAvailable: false, asset: assetFields ? { name: assetFields.name, description: assetFields.summary, property: assetFields.propertySubtype ? propertyLabels[assetFields.propertySubtype] : '房地产', city: assetFields.city, country: assetFields.country, area: assetFields.area, areaUnit: assetFields.areaUnit, areaBasis: assetFields.areaBasis } : null, rights: rights ? { name: rights.name, type: rights.type, summary: rights.economicSummary, risks: rights.risks, mapping: tokenMapping(rights).label } : null, offering: { name: terms.name, number: offering.number, maxRights: terms.maxRights, maxTokens: terms.maxTokens, unitPrice: terms.unitPrice, maxRaise: terms.maxRaise, opensAt: terms.opensAt, closesAt: terms.closesAt, minSubscription: terms.minSubscription, maxSubscription: terms.maxSubscription, tokenName: terms.tokenName, symbol: terms.symbol }, documents, purchaseConditions: '后续认购须KYC通过且有效，并通过必要AML、制裁、法域、窗口、额度及文件签署守卫；当前没有真实订单入口。' };
}

export function sandboxAvailability(tenant: DemoTenant, offeringId: string, at = Date.now()) {
  const offering = findOffering(tenant, offeringId); if (!offering) return { visible: false, eligibleForNewOrder: false, reason: 'Offering不可访问。' };
  const fields = offeringFields(offering); const start = Date.parse(`${fields.opensAt}:00+08:00`); const end = Date.parse(`${fields.closesAt}:00+08:00`);
  const published = Boolean(publicationForOffering(tenant, offeringId));
  const visible = published && ['published', 'active', 'ended', 'settling', 'completed'].includes(offering.status) && !offering.pause;
  const fieldsAsset = findAsset(tenant, fields.assetId); const fieldsInstrument = findInstrument(tenant, fields.instrumentId);
  const eligibleForNewOrder = visible && offering.status === 'active' && at >= start && at < end && fieldsAsset?.state === 'ready' && Boolean(fieldsInstrument && ['ready', 'active'].includes(fieldsInstrument.status)) && useDemoControls.getState().controls.readinessRiskGuard === 'simulated-ready';
  return { visible, eligibleForNewOrder, reason: eligibleForNewOrder ? '仅Sandbox条件视图；本批不创建订单。' : !visible ? '未发布或风险暂停，不可作为公开认购入口。' : '未进入有效认购窗口或未通过风险守卫。' };
}

// Called when the Issuer views a published round; no investor order or production scheduler is implied.
export function synchronizeSandboxWindow(tenant: DemoTenant, offeringId: string): ReadinessResult<Offering> {
  const current = scope(tenant, true); const offering = findOffering(tenant, offeringId); const snapshot = publicationForOffering(tenant, offeringId);
  if (!current || !offering || !snapshot || !['published', 'active'].includes(offering.status)) return { status: 'denied' };
  if (offering.pause) return { status: 'denied', errors: ['Offering已暂停，不能自动恢复或开放。'] };
  const asset = findAsset(tenant, snapshot.assetId); const instrument = findInstrument(tenant, snapshot.instrumentId);
  const risk = useDemoControls.getState().controls.readinessRiskGuard;
  if (asset?.state !== 'ready' || !instrument || !['ready', 'active'].includes(instrument.status) || risk === 'blocked') {
    const stopped = pauseOffering(tenant, offeringId, 'Asset、Instrument或Sandbox风险守卫阻断', 'system');
    return { status: stopped.status === 'saved' ? 'saved' : 'denied', record: stopped.record, errors: stopped.errors };
  }
  if (risk === 'unknown') return { status: 'unknown', errors: ['Sandbox风险守卫Unknown，禁止开放认购。'] };
  const fields = offeringFields(offering); const start = Date.parse(`${fields.opensAt}:00+08:00`); const end = Date.parse(`${fields.closesAt}:00+08:00`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return { status: 'invalid', errors: ['认购窗口无效。'] };
  if (Date.now() >= end) {
    const ended = recordAuthoritativeOfferingEvent(tenant, offeringId, 'end', { source: 'system' });
    return { status: ended.status === 'saved' ? 'saved' : 'denied', record: ended.record, errors: ended.errors };
  }
  if (offering.status === 'published' && Date.now() >= start) {
    const reservations = reservationsForOffering(tenant, offeringId);
    if (reservations?.length !== 1 || reservations[0].status !== 'active') return { status: 'conflict', errors: ['权益容量预留异常，不能进入Active。'] };
    const opened = recordAuthoritativeOfferingEvent(tenant, offeringId, 'open', { source: 'system' });
    return { status: opened.status === 'saved' ? 'saved' : 'denied', record: opened.record, errors: opened.errors };
  }
  return { status: 'saved', record: offering };
}
