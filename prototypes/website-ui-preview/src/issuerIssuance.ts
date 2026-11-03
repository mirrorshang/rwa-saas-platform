import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { findAsset } from './issuerAssets';
import { findInstrument } from './issuerInstruments';

// Browser-session drafts only. A production service must enforce authorization,
// financial limits, legal review and idempotency before any real issuance.
export const issuanceStorageKey = 'wdex-issuer-issuance';
export type ProjectFields = {
  name: string; summary: string; assetId: string; assetVersion: number;
  instrumentId: string; instrumentVersion: number; issuerName: string;
  authorizedCap: string; capCurrency: string; capBasis: string; riskNote: string;
};
export type OfferingFields = {
  name: string; projectId: string; projectVersion: number; summary: string;
  assetId: string; assetVersion: number; instrumentId: string; instrumentVersion: number;
  quantity: string; unitPrice: string; currency: string; plannedRaise: string;
  opensAt: string; closesAt: string; eligibility: string; minSubscription: string;
  maxSubscription: string; minQuantity: string; maxQuantity: string; regions: string;
  suitability: string; subscriptionRules: string; rightsUnit: string; rightsPerToken: string;
  tokenRights: string; riskNote: string;
};
export type Revision<T> = { number: number; fields: T; savedAt: number; savedBy: string };
export type Project = { id: string; tenantId: string; number: string; status: 'draft'; versions: Revision<ProjectFields>[] };
export type Offering = { id: string; tenantId: string; number: string; status: 'draft' | 'sandbox-published' | 'sandbox-paused' | 'sandbox-ended'; versions: Revision<OfferingFields>[]; events: { kind: string; at: number; actor: string }[] };
export type IssuanceIntent = { id: string; tenantId: string; actor: string; kind: 'project' | 'offering' | 'lifecycle'; recordId: string; expectedVersion: number; status: 'processing' | 'failed' | 'unknown'; snapshot?: ProjectFields | OfferingFields; action?: 'publish' | 'pause' | 'resume' | 'end' };
type Bucket = { projects: Project[]; offerings: Offering[]; intent: IssuanceIntent | null };
type Store = { accounts: Record<string, Record<string, Bucket>> };
export type Result<T> = { status: 'saved' | 'failed' | 'unknown' | 'conflict' | 'denied' | 'invalid'; record?: T; intent?: IssuanceIntent; errors?: string[] };
const empty = (): Store => ({ accounts: {} });
const clone = <T,>(value: T): T => structuredClone(value);
const read = (): Store => {
  if (!isDemoPreview()) return empty();
  try { const value = JSON.parse(sessionStorage.getItem(issuanceStorageKey) || 'null') as Store; return value?.accounts && typeof value.accounts === 'object' ? value : empty(); }
  catch { return empty(); }
};
const write = (store: Store) => sessionStorage.setItem(issuanceStorageKey, JSON.stringify(store));
const scope = (tenant: DemoTenant, edit = false) => {
  if (!isDemoPreview()) return null;
  const auth = getDemoAuth(); const selected = getDemoTenant(); const controls = useDemoControls.getState().controls;
  if (!auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.issuanceAccess !== 'allowed') return null;
  if (edit && selected.role !== '企业管理员') return null;
  return { email: auth.email, tenantId: selected.id };
};
const bucket = (store: Store, email: string, id: string): Bucket => store.accounts[email]?.[id] || { projects: [], offerings: [], intent: null };
const put = (store: Store, email: string, id: string, value: Bucket) => { store.accounts[email] ||= {}; store.accounts[email][id] = value; write(store); };
export const canReadIssuance = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditIssuance = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export const blankProject = (): ProjectFields => ({ name: '', summary: '', assetId: '', assetVersion: 0, instrumentId: '', instrumentVersion: 0, issuerName: '', authorizedCap: '', capCurrency: '', capBasis: '', riskNote: '' });
export const blankOffering = (): OfferingFields => ({ name: '', projectId: '', projectVersion: 0, summary: '', assetId: '', assetVersion: 0, instrumentId: '', instrumentVersion: 0, quantity: '', unitPrice: '', currency: '', plannedRaise: '', opensAt: '', closesAt: '', eligibility: '', minSubscription: '', maxSubscription: '', minQuantity: '', maxQuantity: '', regions: '', suitability: '', subscriptionRules: '', rightsUnit: '', rightsPerToken: '', tokenRights: '', riskNote: '' });
export const latest = <T,>(record: { versions: Revision<T>[] }): Revision<T> => record.versions.at(-1)!;
export function listProjects(tenant: DemoTenant): Project[] | null { const current = scope(tenant); return current ? clone(bucket(read(), current.email, current.tenantId).projects.filter(item => item.tenantId === tenant.id)) : null; }
export function listOfferings(tenant: DemoTenant): Offering[] | null { const current = scope(tenant); return current ? clone(bucket(read(), current.email, current.tenantId).offerings.filter(item => item.tenantId === tenant.id)) : null; }
export const findProject = (tenant: DemoTenant, id: string) => listProjects(tenant)?.find(item => item.id === id) || null;
export const findOffering = (tenant: DemoTenant, id: string) => listOfferings(tenant)?.find(item => item.id === id) || null;
export function getIssuanceIntent(tenant: DemoTenant) { const current = scope(tenant, true); return current ? clone(bucket(read(), current.email, current.tenantId).intent) : null; }

// Decimal values are kept as strings. No Number-based currency summation.
export function decimalUnits(raw: string, scale = 8): bigint | null {
  if (!/^(0|[1-9]\d*)(?:\.\d+)?$/.test(raw)) return null;
  const [whole, fractional = ''] = raw.split('.');
  if (fractional.length > scale) return null;
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(fractional.padEnd(scale, '0'));
}
export function displayUnits(units: bigint): string {
  const whole = units / 100_000_000n; const fractional = (units % 100_000_000n).toString().padStart(8, '0').replace(/0+$/, '');
  return fractional ? `${whole}.${fractional}` : whole.toString();
}
export function projectCapacity(tenant: DemoTenant, project: Project) {
  const fields = latest(project).fields; const cap = decimalUnits(fields.authorizedCap);
  const rounds = (listOfferings(tenant) || []).filter(item => latest(item).fields.projectId === project.id);
  const sameCurrency = rounds.filter(item => latest(item).fields.currency === fields.capCurrency);
  const otherCurrency = rounds.filter(item => latest(item).fields.currency !== fields.capCurrency);
  const occupied = sameCurrency.reduce((sum, item) => sum + (decimalUnits(latest(item).fields.plannedRaise) || 0n), 0n);
  return { cap, occupied, remaining: cap === null ? null : cap - occupied, otherCurrency: otherCurrency.length, currency: fields.capCurrency };
}
export function projectErrors(tenant: DemoTenant, fields: ProjectFields, complete = false): string[] {
  const errors: string[] = [];
  if (complete && !fields.name.trim()) errors.push('请填写发行项目名称。');
  if (fields.name.length > 120) errors.push('发行项目名称不能超过120字。');
  const asset = findAsset(tenant, fields.assetId);
  const instrument = findInstrument(tenant, fields.instrumentId);
  if ((complete || fields.assetId) && (!asset || !asset.versions.some(item => item.number === fields.assetVersion))) errors.push('请选择当前企业的有效资产及固定版本。');
  if ((complete || fields.instrumentId) && (!instrument || !instrument.versions.some(item => item.number === fields.instrumentVersion))) errors.push('请选择当前企业的有效权益结构及固定版本。');
  const instrumentVersion = instrument?.versions.find(item => item.number === fields.instrumentVersion);
  if (instrumentVersion && (instrumentVersion.fields.assetId !== fields.assetId || instrumentVersion.fields.assetVersion !== fields.assetVersion)) errors.push('权益结构版本与所选主要资产版本不一致。');
  if (fields.authorizedCap && (!decimalUnits(fields.authorizedCap) || decimalUnits(fields.authorizedCap)! <= 0n)) errors.push('授权发行上限须填写大于0、最多8位小数的数字。');
  if (fields.authorizedCap && !fields.capCurrency.trim()) errors.push('请填写授权发行上限的币种。');
  if (fields.authorizedCap && !fields.capBasis.trim()) errors.push('请填写项目上限依据或待确认说明。');
  return errors;
}
export function offeringErrors(tenant: DemoTenant, fields: OfferingFields, excludeId = '', complete = false): string[] {
  const errors: string[] = [];
  if (complete && !fields.name.trim()) errors.push('请填写发行方案名称。');
  if (fields.name.length > 120) errors.push('发行方案名称不能超过120字。');
  const project = findProject(tenant, fields.projectId);
  if ((complete || fields.projectId) && (!project || !project.versions.some(item => item.number === fields.projectVersion))) errors.push('请选择当前企业的有效发行项目及固定版本。');
  const pinned = project?.versions.find(item => item.number === fields.projectVersion)?.fields;
  if (pinned && (fields.assetId !== pinned.assetId || fields.assetVersion !== pinned.assetVersion || fields.instrumentId !== pinned.instrumentId || fields.instrumentVersion !== pinned.instrumentVersion)) errors.push('方案引用的资产或权益结构版本与固定项目版本不一致。');
  for (const [label, raw] of [['发行数量', fields.quantity], ['单位价格', fields.unitPrice], ['计划募集金额', fields.plannedRaise], ['最低认购额', fields.minSubscription], ['最高认购额', fields.maxSubscription], ['最低认购数量', fields.minQuantity], ['最高认购数量', fields.maxQuantity], ['每Token对应权益单位', fields.rightsPerToken]]) {
    if (raw && (!decimalUnits(raw) || decimalUnits(raw)! <= 0n)) errors.push(`${label}须填写大于0、最多8位小数的数字。`);
  }
  if (fields.opensAt && fields.closesAt && fields.opensAt >= fields.closesAt) errors.push('认购结束时间须晚于开始时间。');
  const minAmount = decimalUnits(fields.minSubscription); const maxAmount = decimalUnits(fields.maxSubscription);
  const minQuantity = decimalUnits(fields.minQuantity); const maxQuantity = decimalUnits(fields.maxQuantity); const totalQuantity = decimalUnits(fields.quantity);
  if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) errors.push('最低认购额不能大于最高认购额。');
  if (minQuantity !== null && maxQuantity !== null && minQuantity > maxQuantity) errors.push('最低认购数量不能大于最高认购数量。');
  if (totalQuantity !== null && maxQuantity !== null && maxQuantity > totalQuantity) errors.push('最高认购数量不能大于总发行数量。');
  if ((fields.quantity || fields.unitPrice || fields.plannedRaise) && !fields.currency.trim()) errors.push('请填写发行币种。');
  const quantity = decimalUnits(fields.quantity); const price = decimalUnits(fields.unitPrice); const raise = decimalUnits(fields.plannedRaise);
  if (quantity !== null && price !== null && raise !== null && quantity * price !== raise * 10n ** 8n) errors.push('发行数量 × 单位价格与计划募集金额不一致，请核对。');
  const cap = project?.versions.find(item => item.number === fields.projectVersion)?.fields;
  const asset = cap ? findAsset(tenant, cap.assetId)?.versions.find(item => item.number === cap.assetVersion)?.fields : null;
  const instrument = cap ? findInstrument(tenant, cap.instrumentId)?.versions.find(item => item.number === cap.instrumentVersion)?.fields : null;
  const allRounds = (listOfferings(tenant) || []).filter(item => item.id !== excludeId && latest(item).fields.plannedRaise);
  const checkedLimits: [string, string | undefined, string | undefined, (item: Offering) => boolean][] = [
    ['资产授权额度', asset?.authorizationLimit, asset?.authorizationCurrency, item => { const parent = findProject(tenant, latest(item).fields.projectId); return parent?.versions.some(version => version.fields.assetId === cap?.assetId) || false; }],
    ['权益结构额度参考', instrument?.structureCap, instrument?.structureCapCurrency, item => { const parent = findProject(tenant, latest(item).fields.projectId); return parent?.versions.some(version => version.fields.instrumentId === cap?.instrumentId) || false; }],
  ];
  if (raise !== null) for (const [label, limit, currency, matches] of checkedLimits) {
    if (!limit) continue;
    const limitUnits = decimalUnits(limit); if (limitUnits === null) { errors.push(`${label}格式无效，请核对原始记录。`); continue; }
    if (currency !== fields.currency) { errors.push(`${label}币种不同，不能自动换算，请核对依据。`); continue; }
    const related = allRounds.filter(matches);
    if (related.some(item => latest(item).fields.currency !== fields.currency)) { errors.push(`${label}关联其他币种方案，请人工核对，暂不自动计算剩余额度。`); continue; }
    const occupied = related.reduce((sum, item) => sum + (decimalUnits(latest(item).fields.plannedRaise) || 0n), 0n);
    if (occupied + raise > limitUnits) errors.push(`本轮目标与已有方案目标合计超过${label}记录，请核对。`);
  }
  if (cap?.authorizedCap && raise !== null && cap.capCurrency !== fields.currency) errors.push('项目上限与方案币种不同，不能自动换算；请先核对额度依据。');
  if (cap?.authorizedCap && raise !== null && cap.capCurrency === fields.currency) {
    const occupied = (listOfferings(tenant) || []).filter(item => item.id !== excludeId && latest(item).fields.projectId === fields.projectId && latest(item).fields.currency === fields.currency).reduce((sum, item) => sum + (decimalUnits(latest(item).fields.plannedRaise) || 0n), 0n);
    const projectLimit = decimalUnits(cap.authorizedCap);
    if (projectLimit === null || occupied + raise > projectLimit) errors.push('同币种发行方案合计超过所填项目上限，或上限格式无效，请核对。');
  }
  return errors;
}
function commit(store: Store, email: string, tenantId: string, intent: IssuanceIntent): Result<Project | Offering> {
  const data = bucket(store, email, tenantId);
  const collection = intent.kind === 'project' ? data.projects : data.offerings;
  const found = collection.find(item => item.id === intent.recordId);
  if ((found?.versions.length || 0) !== intent.expectedVersion || !intent.snapshot) return { status: 'conflict', intent: clone(intent) };
  const revision = { number: intent.expectedVersion + 1, fields: clone(intent.snapshot), savedAt: Date.now(), savedBy: email };
  if (intent.kind === 'project') {
    const next: Project = found ? { ...found as Project, versions: [...(found as Project).versions, revision as Revision<ProjectFields>] } : { id: intent.recordId, tenantId, number: `PR-${intent.recordId.slice(0, 8).toUpperCase()}`, status: 'draft', versions: [revision as Revision<ProjectFields>] };
    data.projects = found ? data.projects.map(item => item.id === next.id ? next : item) : [...data.projects, next];
    data.intent = null; put(store, email, tenantId, data); return { status: 'saved', record: clone(next) };
  }
  const next: Offering = found ? { ...found as Offering, versions: [...(found as Offering).versions, revision as Revision<OfferingFields>] } : { id: intent.recordId, tenantId, number: `OF-${intent.recordId.slice(0, 8).toUpperCase()}`, status: 'draft', versions: [revision as Revision<OfferingFields>], events: [] };
  data.offerings = found ? data.offerings.map(item => item.id === next.id ? next : item) : [...data.offerings, next];
  data.intent = null; put(store, email, tenantId, data); return { status: 'saved', record: clone(next) };
}
function save<T extends ProjectFields | OfferingFields>(tenant: DemoTenant, kind: 'project' | 'offering', fields: T, id = '', expectedVersion = 0, retryId = ''): Result<Project | Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const errors = kind === 'project' ? projectErrors(tenant, fields as ProjectFields) : offeringErrors(tenant, fields as OfferingFields, id);
  if (errors.length) return { status: 'invalid', errors };
  const store = read(); const data = bucket(store, current.email, current.tenantId);
  if (data.intent?.status === 'unknown' || data.intent?.status === 'processing') return { status: data.intent.status === 'unknown' ? 'unknown' : 'denied', intent: clone(data.intent) };
  const collection = kind === 'project' ? data.projects : data.offerings;
  const existing = id ? collection.find(item => item.id === id && item.tenantId === tenant.id) : undefined;
  if (id && !existing) return { status: 'denied' };
  if ((existing?.versions.length || 0) !== expectedVersion) return { status: 'conflict' };
  const retry = data.intent?.status === 'failed' && data.intent.kind === kind && data.intent.id === retryId && (!id || data.intent.recordId === id) ? data.intent : null;
  const intent: IssuanceIntent = { id: retry?.id || crypto.randomUUID(), tenantId: tenant.id, actor: current.email, kind, recordId: id || retry?.recordId || crypto.randomUUID(), expectedVersion, status: 'processing', snapshot: clone(fields) };
  data.intent = intent; put(store, current.email, current.tenantId, data);
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome === 'success') return commit(store, current.email, current.tenantId, intent);
  intent.status = outcome; put(store, current.email, current.tenantId, data); return { status: outcome, intent: clone(intent) };
}
export const saveProject = (tenant: DemoTenant, fields: ProjectFields, id?: string, version?: number, retryId?: string) => save(tenant, 'project', fields, id, version, retryId) as Result<Project>;
export const saveOffering = (tenant: DemoTenant, fields: OfferingFields, id?: string, version?: number, retryId?: string) => save(tenant, 'offering', fields, id, version, retryId) as Result<Offering>;
export function checkIssuanceIntent(tenant: DemoTenant): Result<Project | Offering> {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const store = read(); const data = bucket(store, current.email, current.tenantId); const intent = data.intent;
  if (!intent || intent.status !== 'unknown') return { status: 'denied' };
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome === 'success') return intent.kind === 'lifecycle' ? commitLifecycle(store, current.email, current.tenantId, intent) : commit(store, current.email, current.tenantId, intent);
  if (outcome === 'failed') { intent.status = 'failed'; put(store, current.email, current.tenantId, data); return { status: 'failed', intent: clone(intent) }; }
  return { status: 'unknown', intent: clone(intent) };
}
function commitLifecycle(store: Store, email: string, tenantId: string, intent: IssuanceIntent): Result<Offering> {
  const data = bucket(store, email, tenantId); const record = data.offerings.find(item => item.id === intent.recordId);
  const nextStatus = { publish: 'sandbox-published', pause: 'sandbox-paused', resume: 'sandbox-published', end: 'sandbox-ended' } as const;
  if (!record || !intent.action || record.versions.length !== intent.expectedVersion) return { status: 'conflict', intent: clone(intent) };
  record.status = nextStatus[intent.action]; record.events.push({ kind: intent.action, at: Date.now(), actor: email });
  data.intent = null; put(store, email, tenantId, data); return { status: 'saved', record: clone(record) };
}
export function preflight(tenant: DemoTenant, offering: Offering): { code: string; label: string; ready: boolean; detail: string }[] {
  const fields = latest(offering).fields; const project = findProject(tenant, fields.projectId);
  const projectFields = project?.versions.find(item => item.number === fields.projectVersion)?.fields;
  const checks = [
    ['P01', '企业及访问权限', canEditIssuance(tenant), '当前企业管理员可维护内部草稿；不代表生产授权。'],
    ['P02', '资产资料、授权额度与固定版本', Boolean(projectFields && findAsset(tenant, projectFields.assetId)?.versions.some(item => item.number === projectFields.assetVersion && item.fields.authorizationLimit && item.fields.authorizationBasis && item.fields.authorizationResponsible)), '资产额度依据与责任主体须明确；参考估值不能代替授权额度。'],
    ['P03', '权益结构额度与固定版本', Boolean(projectFields && findInstrument(tenant, projectFields.instrumentId)?.versions.some(item => item.number === projectFields.instrumentVersion && item.fields.structureCap && item.fields.structureCapBasis)), '权益结构额度依据及固定版本须明确。'],
    ['P04', '方案字段与额度', offeringErrors(tenant, fields, offering.id, true).length === 0 && Boolean(fields.quantity && fields.unitPrice && fields.plannedRaise && fields.eligibility && fields.tokenRights), '仅进行格式及同币种草稿上限核对。'],
    ['P05', '材料及法律文件', false, '安全扫描、法律效力和专业审查尚未接入。'],
    ['P06', '投资者资格及认购规则', false, '适用法域及资格规则尚未批准。'],
    ['P07', '生产服务与人工放行', false, '真实支付、Signer、Token和生产许可尚未接入。'],
  ] as const;
  return checks.map(([code, label, ready, detail]) => ({ code, label, ready, detail }));
}
export function sandboxLifecycle(tenant: DemoTenant, offeringId: string, action: 'publish' | 'pause' | 'resume' | 'end'): Result<Offering> {
  const current = scope(tenant, true); if (!current || tenant.plan !== 'Free') return { status: 'denied' };
  const store = read(); const data = bucket(store, current.email, current.tenantId);
  if (data.intent && (data.intent.status !== 'failed' || data.intent.kind !== 'lifecycle' || data.intent.recordId !== offeringId || data.intent.action !== action)) return { status: data.intent.status === 'unknown' ? 'unknown' : 'denied', intent: clone(data.intent) };
  const record = data.offerings.find(item => item.id === offeringId);
  const allowed = { publish: 'draft', pause: 'sandbox-published', resume: 'sandbox-paused', end: 'sandbox-paused' } as const;
  if (!record || record.status !== allowed[action]) return { status: 'denied' };
  if (action === 'publish' && preflight(tenant, record).slice(0, 4).some(item => !item.ready)) return { status: 'invalid', errors: ['请先完成内部字段检查。生产准入仍保持关闭。'] };
  const intent: IssuanceIntent = { id: data.intent?.id || crypto.randomUUID(), tenantId: tenant.id, actor: current.email, kind: 'lifecycle', recordId: offeringId, expectedVersion: record.versions.length, action, status: 'processing' };
  data.intent = intent; put(store, current.email, current.tenantId, data);
  const outcome = useDemoControls.getState().controls.issuanceSave;
  if (outcome === 'success') return commitLifecycle(store, current.email, current.tenantId, intent);
  intent.status = outcome; put(store, current.email, current.tenantId, data); return { status: outcome, intent: clone(intent) };
}
