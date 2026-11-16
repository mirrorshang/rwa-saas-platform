import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { assetMissing, findAsset, listAssets, type Asset } from './issuerAssets';
import { refsFor } from './issuerFiles';
import { exactMapping, fieldChanges, formatAmount, legalVersionReady, nextRightsState, parseAmount, remainingCapacity } from './instrumentDomain';

// Browser-only demonstration records. Production authorization and legal review require server services.
export const instrumentStorageKey = 'wdex-issuer-instruments';
export type InstrumentType = '' | 'equity' | 'debt' | 'income' | 'spv';
export type InstrumentStatus = 'draft' | 'preparing' | 'ready' | 'active' | 'suspended' | 'terminating' | 'terminated' | 'reviewing' | 'changes' | 'completed' | 'paused' | 'archived';
export type InstrumentMaterial = { id: string; name: string; reference: string };
export type InstrumentFields = {
  name: string; type: InstrumentType; assetId: string; assetVersion: number; purpose: string;
  issuer: string; debtor: string; debtorRelation: string; debtNature: string; rightsContent: string;
  spv: string; spvRole: string; spvAssetRelation: string; equityNature: string; holderRights: string;
  economicSummary: string; principal: string; currency: string; structureCap: string; structureCapCurrency: string; structureCapBasis: string; interest: string; interestPayment: string; repayment: string; maturity: string; priority: string;
  equitySource: string; equityShare: string; distribution: string; governance: string; exitTerms: string;
  qualification: string; transfer: string; disclosure: string; buyback: string; risks: string; materials: InstrumentMaterial[];
  rightsOwner?: string; sourceName?: string; capacityPoolId?: string; capacityTotal?: string; tokenSupply?: string; rightsPerToken?: string; legalFileRefId?: string;
  equityEntity?: string; shareCount?: string; shareRights?: string; equityDocument?: string;
  interestMode?: 'fixed' | 'none'; fixedRate?: string; startDate?: string; collateral?: string; debtDocument?: string;
  incomeSource?: string; incomeBasis?: 'gross' | 'net'; incomeRatio?: string; endDate?: string; frequency?: 'monthly' | 'quarterly' | 'yearly'; incomeDocument?: string;
};
export type InstrumentVersion = { number: number; fields: InstrumentFields; savedAt: number; savedBy: string; assetName: string; assetNumber: string; changes?: { field: string; before: string; after: string }[] };
export type InstrumentEvent = { id: string; version: number; kind: 'saved' | 'submitted' | 'returned' | 'completed' | 'paused' | 'archived' | 'ready' | 'suspended' | 'resumed' | 'terminating' | 'terminated'; at: number; actor: string; note: string };
export type Instrument = { id: string; tenantId: string; number: string; assetId?: string; rightsType?: InstrumentType; currentVersionId?: string; status: InstrumentStatus; versions: InstrumentVersion[]; events: InstrumentEvent[]; submittedBy?: string; submittedAt?: number; capacityPoolId?: string; tokenDefinitionId?: string; readyVersionNumber?: number };
export type CapacityPool = { id: string; tenantId: string; source: string; unit: string; totalCapacity: string };
export type TokenDefinition = { id: string; tenantId: string; instrumentId: string; totalSupply: string; unitMapping: string; mappingVersion: number };
export type InstrumentIntent = { id: string; kind: 'save' | 'submit' | 'review'; tenantId: string; instrumentId: string; expectedVersion: number; actor: string; status: 'processing' | 'failed' | 'unknown'; snapshot?: InstrumentFields; decision?: 'completed' | 'changes'; note?: string };
export type CapacityAllocation = { id: string; instrumentId: string; offeringId: string; amount: string; kind: 'reservation' | 'confirmed' | 'minted'; status: 'active' | 'unknown' | 'released'; tenantId: string; committed?: string };
type TenantData = { records: Instrument[]; intent: InstrumentIntent | null; pools?: CapacityPool[]; tokens?: TokenDefinition[]; allocations?: CapacityAllocation[]; completedIntents?: Record<string, string> };
type Store = { accounts: Record<string, Record<string, TenantData>> };
export type InstrumentResult = { status: 'saved' | 'completed' | 'changes' | 'failed' | 'unknown' | 'conflict' | 'denied' | 'invalid'; record?: Instrument; intent?: InstrumentIntent; requestId?: string; errors?: string[] };

export const typeLabels: Record<Exclude<InstrumentType, ''>, string> = { equity: '股权权益', debt: '债权权益', income: '收益参与权', spv: 'SPV权益型（历史）' };
export const statusLabels: Record<InstrumentStatus, string> = { draft: '草稿', preparing: '准备中', ready: '资料就绪', active: '使用中', suspended: '已暂停', terminating: '终止处理中', terminated: '已终止', reviewing: '历史审核中', changes: '历史待修改', completed: '历史复核完成', paused: '历史已暂停', archived: '历史已归档' };
export const blankInstrumentFields = (): InstrumentFields => ({
  name: '', type: '', assetId: '', assetVersion: 0, purpose: '', issuer: '', debtor: '', debtorRelation: '', debtNature: '', rightsContent: '',
  spv: '', spvRole: '', spvAssetRelation: '', equityNature: '', holderRights: '', economicSummary: '', principal: '', currency: 'U', structureCap: '', structureCapCurrency: '', structureCapBasis: '', interest: '', interestPayment: '', repayment: '', maturity: '', priority: '',
  equitySource: '', equityShare: '', distribution: '', governance: '', exitTerms: '', qualification: '', transfer: '', disclosure: '', buyback: '', risks: '', materials: [],
  rightsOwner: '', sourceName: '', capacityPoolId: '', capacityTotal: '', tokenSupply: '', rightsPerToken: '', legalFileRefId: '', equityEntity: '', shareCount: '', shareRights: '', equityDocument: '', interestMode: 'none', fixedRate: '', startDate: '', collateral: '', debtDocument: '', incomeSource: '', incomeBasis: 'gross', incomeRatio: '', endDate: '', frequency: 'quarterly', incomeDocument: '',
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
  if (edit && (selected.role !== '企业管理员' || selected.subscriptionState === 'downgraded')) return null;
  return { email: auth.email, tenantId: selected.id };
};
const data = (value: Store, email: string, tenantId: string): TenantData => value.accounts[email]?.[tenantId] || { records: [], intent: null };
const put = (value: Store, email: string, tenantId: string, next: TenantData) => { value.accounts[email] ||= {}; value.accounts[email][tenantId] = next; write(value); };
const event = (version: number, kind: InstrumentEvent['kind'], actor: string, note = ''): InstrumentEvent => ({ id: crypto.randomUUID(), version, kind, at: Date.now(), actor, note });
const latest = (record: Instrument) => record.versions.at(-1)!;
const coreKeys: (keyof InstrumentFields)[] = ['type', 'assetId', 'rightsOwner', 'economicSummary', 'sourceName', 'capacityPoolId', 'capacityTotal', 'structureCap', 'structureCapBasis', 'shareCount', 'principal', 'incomeRatio', 'startDate', 'maturity', 'endDate', 'rightsPerToken', 'tokenSupply', 'legalFileRefId'];
function hasPublishedOffering(email: string, tenantId: string, instrumentId: string, offeringId?: string): boolean {
  try {
    const store = JSON.parse(sessionStorage.getItem('wdex-issuer-issuance') || 'null') as { accounts?: Record<string, Record<string, { offerings?: { id: string; status: string; versions: { fields: { instrumentId: string } }[] }[] }>> } | null;
    return Boolean(store?.accounts?.[email]?.[tenantId]?.offerings?.some(item => (!offeringId || item.id === offeringId) && ['sandbox-published', 'published', 'active'].includes(item.status) && item.versions.some(version => version.fields.instrumentId === instrumentId)));
  } catch { return false; }
}
function hasOpenOffering(email: string, tenantId: string, instrumentId: string): boolean {
  try {
    const store = JSON.parse(sessionStorage.getItem('wdex-issuer-issuance') || 'null') as { accounts?: Record<string, Record<string, { offerings?: { status: string; versions: { fields: { instrumentId: string } }[] }[] }>> } | null;
    return Boolean(store?.accounts?.[email]?.[tenantId]?.offerings?.some(item => ['sandbox-published','sandbox-paused', 'confirmed', 'published', 'active', 'ended', 'settling'].includes(item.status) && item.versions.some(version => version.fields.instrumentId === instrumentId)));
  } catch { return true; }
}
const decimal = parseAmount;
const display = formatAmount;
const unitFor = (type: InstrumentType) => type === 'equity' ? '股' : type === 'debt' ? 'U' : type === 'income' ? '%' : '';
const typeFields = {
  equity: ['equityEntity', 'shareCount', 'equityShare', 'shareRights', 'equityDocument'],
  debt: ['debtor', 'principal', 'interestMode', 'fixedRate', 'maturity', 'interestPayment', 'collateral', 'debtDocument'],
  income: ['incomeSource', 'incomeBasis', 'incomeRatio', 'endDate', 'frequency', 'incomeDocument'],
} as const;
function normalizedFields(fields: InstrumentFields): InstrumentFields {
  const result = clone(fields);
  for (const type of ['equity', 'debt', 'income'] as const) if (type !== fields.type) for (const key of typeFields[type]) Object.assign(result, { [key]: '' });
  if (fields.type === 'equity') result.startDate = '';
  return result;
}
export function tokenMapping(fields: InstrumentFields): { valid: boolean; label: string; supply: string; perToken: string } {
  let perToken = fields.rightsPerToken || '';
  if (!perToken && fields.tokenSupply && /^\d+$/.test(fields.tokenSupply) && BigInt(fields.tokenSupply) > 0n) {
    const total = decimal(fields.structureCap || ''); const supply = BigInt(fields.tokenSupply);
    if (total !== null && total > 0n && total % supply === 0n) perToken = display(total / supply);
  }
  const result = exactMapping(fields.structureCap || '', perToken);
  return { valid: result.valid, label: result.valid ? `1 Token = ${perToken} ${unitFor(fields.type)}权益` : result.error, supply: result.supply, perToken };
}
export function listCapacityPools(tenant: DemoTenant): CapacityPool[] | null {
  const current = scope(tenant); return current ? clone(data(read(), current.email, tenant.id).pools || []) : null;
}
export function getTokenDefinition(tenant: DemoTenant, instrumentId: string): TokenDefinition | null {
  const current = scope(tenant); return current ? clone(data(read(), current.email, tenant.id).tokens?.find(item => item.instrumentId === instrumentId && item.tenantId === tenant.id) || null) : null;
}
export function capacitySummary(tenant: DemoTenant, instrumentId: string): { total: string; confirmed: string; reserved: string; remaining: string; committed: string; minted: string } | null {
  const record = findInstrument(tenant, instrumentId); if (!record) return null;
  const total = decimal(latest(record).fields.structureCap || ''); if (total === null) return null;
  // No production Offering reservation authority exists in the browser. Only confirmed local records may be counted here.
  const current = scope(tenant); if (!current) return null;
  const allocations = data(read(), current.email, tenant.id).allocations || [];
  const confirmed = allocations.filter(item => item.instrumentId === instrumentId && item.kind === 'confirmed' && item.status !== 'released').reduce((sum, item) => sum + (decimal(item.amount) || 0n), 0n);
  const reserved = allocations.filter(item => item.instrumentId === instrumentId && item.kind === 'reservation' && item.status !== 'released').reduce((sum, item) => sum + (decimal(item.amount) || 0n), 0n);
  const committed = allocations.filter(item => item.instrumentId === instrumentId && item.kind === 'reservation' && item.status !== 'released').reduce((sum, item) => sum + (decimal(item.committed || '0') || 0n), 0n);
  const minted = allocations.filter(item => item.instrumentId === instrumentId && item.kind === 'minted' && item.status !== 'released').reduce((sum, item) => sum + (decimal(item.amount) || 0n), 0n);
  return { total: display(total), confirmed: display(confirmed), reserved: display(reserved), remaining: remainingCapacity(display(total), display(confirmed), display(reserved))!, committed: display(committed), minted: display(minted) };
}

export const canReadInstruments = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditInstruments = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listInstruments(tenant: DemoTenant): Instrument[] | null {
  const current = scope(tenant); return current ? clone(data(read(), current.email, current.tenantId).records.filter(item => item.tenantId === tenant.id).map(item => ({ ...item, assetId: latest(item).fields.assetId, rightsType: latest(item).fields.type, currentVersionId: `${item.id}:v${latest(item).number}` }))) : null;
}
export function findInstrument(tenant: DemoTenant, id: string): Instrument | null { return listInstruments(tenant)?.find(item => item.id === id) || null; }
export function eligibleAssets(tenant: DemoTenant): Asset[] {
  return (listAssets(tenant) || []).filter(item => ['preparing', 'ready'].includes(item.state) && item.versions.length);
}
export function instrumentErrors(tenant: DemoTenant, fields: InstrumentFields, forReview = false, editingId?: string): string[] {
  const errors: string[] = [];
  if (fields.name.length > 120) errors.push('权益结构名称不能超过120字。');
  if (fields.type !== '' && !['equity', 'debt', 'income'].includes(fields.type)) errors.push('MVP 仅支持股权、债权和收益参与权。');
  if (['equity', 'debt', 'income'].includes(fields.type)) {
    const amount = decimal(fields.structureCap || '');
    if (fields.structureCap && (amount === null || amount <= 0n)) errors.push('权益额度须为大于0、最多12位小数的数字。');
    if (fields.capacityTotal && (decimal(fields.capacityTotal) === null || decimal(fields.capacityTotal)! <= 0n)) errors.push('权益来源总额度无效。');
    const pools = listCapacityPools(tenant) || [];
    const selected = fields.capacityPoolId ? pools.find(item => item.id === fields.capacityPoolId && item.tenantId === tenant.id) : pools.find(item => item.source === fields.sourceName?.trim());
    const unit = unitFor(fields.type);
    if (fields.capacityPoolId && !selected) errors.push('所选权益来源已失效。');
    if (selected && fields.sourceName?.trim() !== selected.source) errors.push('已有权益来源名称不能在此修改。');
    if (selected && fields.capacityTotal && fields.capacityTotal !== selected.totalCapacity) errors.push('已有权益来源总额度不能在此修改。');
    if (selected && selected.unit !== unit) errors.push('相同权益来源的计量单位不一致，不能共享额度。');
    if (selected && amount !== null) {
      const used = (listInstruments(tenant) || []).filter(item => item.capacityPoolId === selected.id && item.id !== editingId).reduce((sum, item) => sum + (decimal(item.versions.at(-1)?.fields.structureCap || '') || 0n), 0n);
      if (used + amount > (decimal(selected.totalCapacity) || 0n)) errors.push('同一权益来源的结构额度合计不能超过总额度。');
    } else if (!selected && amount !== null && fields.capacityTotal && amount > (decimal(fields.capacityTotal) || 0n)) errors.push('权益结构额度不能超过来源总额度。');
    if (editingId && amount !== null) {
      const summary = capacitySummary(tenant, editingId);
      const remaining = summary && remainingCapacity(fields.structureCap, summary.confirmed, summary.reserved);
      if (remaining?.startsWith('-')) errors.push('授权总量不能低于已确认分配与有效 Offering 预留之和。');
    }
    if ((fields.rightsPerToken || fields.tokenSupply) && !tokenMapping(fields).valid) errors.push(tokenMapping(fields).label);
  }
  if (fields.principal && (decimal(fields.principal) === null || decimal(fields.principal)! <= 0n)) errors.push('本金说明中的数值必须大于0、最多12位小数。');
  if (fields.principal && !fields.currency.trim()) errors.push('填写本金数值时，请说明币种。');
  if (fields.structureCap && !['equity', 'debt', 'income'].includes(fields.type) && (!/^\d+(?:\.\d{1,8})?$/.test(fields.structureCap) || Number(fields.structureCap) <= 0)) errors.push('权益结构额度参考须为大于0、最多8位小数的数字。');
  if (fields.structureCap && !['equity', 'debt', 'income'].includes(fields.type) && !fields.structureCapCurrency?.trim()) errors.push('填写权益结构额度参考时，请说明币种。');
  if (fields.structureCap && !['equity', 'debt', 'income'].includes(fields.type) && !fields.structureCapBasis?.trim()) errors.push('填写权益结构额度参考时，请说明依据。');
  if (fields.type === 'equity' && fields.shareCount && (decimal(fields.shareCount) === null || decimal(fields.shareCount)! <= 0n)) errors.push('股份数量无效。');
  if (fields.type === 'equity' && fields.shareCount && !/^\d+$/.test(fields.shareCount)) errors.push('股份数量须为整数。');
  if (fields.type === 'equity' && fields.shareCount && fields.structureCap && decimal(fields.shareCount) !== decimal(fields.structureCap)) errors.push('权益结构额度须与普通股股份数量一致。');
  if (fields.type === 'debt' && fields.principal && fields.structureCap && decimal(fields.principal) !== decimal(fields.structureCap)) errors.push('权益结构额度须与债权本金一致。');
  if (fields.type === 'income' && fields.incomeRatio && fields.structureCap && decimal(fields.incomeRatio) !== decimal(fields.structureCap)) errors.push('权益结构额度须与收益参与比例一致。');
  if (fields.type === 'equity' && fields.equityShare && (decimal(fields.equityShare) === null || decimal(fields.equityShare)! <= 0n || decimal(fields.equityShare)! > decimal('100')!)) errors.push('适用持股比例须大于0且不超过100%。');
  if (fields.type === 'debt' && fields.fixedRate && decimal(fields.fixedRate) === null) errors.push('固定年利率无效。');
  if (fields.type === 'income' && fields.incomeRatio && (decimal(fields.incomeRatio) === null || decimal(fields.incomeRatio)! <= 0n || decimal(fields.incomeRatio)! > decimal('100')!)) errors.push('收益参与比例须大于0且不超过100%。');
  if (fields.type === 'income' && fields.capacityTotal && decimal(fields.capacityTotal) !== null && decimal(fields.capacityTotal)! > decimal('100')!) errors.push('同一收益来源的参与比例总额度不能超过100%。');
  if (fields.startDate && fields.type === 'debt' && fields.maturity && fields.maturity <= fields.startDate) errors.push('到期日期须晚于起始日期。');
  if (fields.startDate && fields.type === 'income' && fields.endDate && fields.endDate <= fields.startDate) errors.push('权益结束日期须晚于起始日期。');
  if (forReview) {
    if (!fields.name.trim()) errors.push('请填写权益结构名称。');
    if (!fields.type) errors.push('请选择权益类型。');
    if (!fields.assetId) errors.push('请选择关联资产。');
    if (!['equity', 'debt', 'income'].includes(fields.type) && !fields.purpose.trim()) errors.push('请说明结构用途。');
    if (['equity', 'debt', 'income'].includes(fields.type)) {
      if (!fields.rightsOwner?.trim() || !fields.economicSummary?.trim() || !fields.sourceName?.trim() || !fields.structureCap || !tokenMapping(fields).perToken || !fields.structureCapBasis?.trim()) errors.push('请补充权利主体与定义、权益来源、授权额度依据和 Token 映射。');
      if (!selectedCapacityPool(tenant, fields) && !fields.capacityTotal) errors.push('请填写新权益来源的总额度。');
      if (!tokenMapping(fields).valid) errors.push(tokenMapping(fields).label);
      if (fields.type === 'equity' && (!fields.equityEntity?.trim() || !fields.shareCount || !fields.shareRights?.trim() || !fields.equityShare?.trim())) errors.push('请补充普通股主体、股份数量、适用持股比例及股份权利。');
      if (fields.type === 'debt' && (!fields.debtor.trim() || !fields.principal || !fields.startDate || !fields.maturity || !fields.interestMode || (fields.interestMode === 'fixed' && !fields.fixedRate))) errors.push('请补充债务人、本金、期限及固定或无息条款。');
      if (fields.type === 'income' && (!fields.incomeSource?.trim() || !fields.incomeRatio || !fields.startDate || !fields.endDate || !fields.frequency || !fields.incomeBasis)) errors.push('请补充收益来源、计算基础、比例、期限及分配频率。');
      const legal = editingId && refsFor(tenant, 'instrument', editingId);
      const category = fields.type === 'equity' ? '股权法律文件' : fields.type === 'debt' ? '债权协议' : '权益协议';
      if (!legal || !legalVersionReady(fields.legalFileRefId, editingId!, legal) || !legal.some(({ ref }) => ref.id === fields.legalFileRefId && ref.category === category)) errors.push(`请选择属于当前权益结构、分类为“${category}”且 Sandbox 模拟扫描通过的最新文件固定版本。`);
      if (editingId) { const summary = capacitySummary(tenant, editingId); const remaining = summary && remainingCapacity(fields.structureCap, summary.confirmed, summary.reserved); if (remaining !== null && remaining !== undefined && remaining.startsWith('-')) errors.push('权益授权容量不足，已确认分配与有效预留超过总额度。'); }
    }
    if (fields.type === 'debt' && !fields.sourceName && (!fields.issuer.trim() || !fields.debtor.trim() || !fields.debtNature.trim() || !fields.rightsContent.trim() || !fields.economicSummary.trim())) errors.push('债权型请补充发行主体、债务人、债权性质、权利内容和经济条款说明。');
    if (fields.type === 'spv' && (!fields.spv.trim() || !fields.spvAssetRelation.trim() || !fields.equityNature.trim() || !fields.holderRights.trim() || !fields.economicSummary.trim())) errors.push('SPV权益型请补充SPV主体、底层资产关系、权益性质、持有人权利和经济条款说明。');
  }
  if (fields.assetId) {
    const asset = findAsset(tenant, fields.assetId);
    const current = asset?.versions.at(-1);
    if (!asset || !['preparing', 'ready'].includes(asset.state) || !current || (forReview && (asset.state !== 'ready' || assetMissing(current.fields).length)) || current.number !== fields.assetVersion) errors.push('关联资产未进入准备或就绪状态，或版本已更新，请重新核对资产资料。');
  }
  return errors;
}
export function getInstrumentIntent(tenant: DemoTenant): InstrumentIntent | null {
  const current = scope(tenant, true); return current ? clone(data(read(), current.email, current.tenantId).intent) : null;
}
const selectedCapacityPool = (tenant: DemoTenant, fields: InstrumentFields) => (listCapacityPools(tenant) || []).find(item => item.id === fields.capacityPoolId || item.source === fields.sourceName?.trim());
function commitSave(value: Store, email: string, tenantId: string, intent: InstrumentIntent): InstrumentResult {
  const current = data(value, email, tenantId);
  const existing = current.records.find(item => item.id === intent.instrumentId);
  if ((existing?.versions.length || 0) !== intent.expectedVersion || !intent.snapshot) return { status: 'conflict', intent: clone(intent) };
  const snapshot = clone(intent.snapshot);
  if (['equity', 'debt', 'income'].includes(snapshot.type)) snapshot.structureCapCurrency = unitFor(snapshot.type);
  if (tokenMapping(snapshot).valid) { snapshot.rightsPerToken = tokenMapping(snapshot).perToken; snapshot.tokenSupply = tokenMapping(snapshot).supply; }
  let pool: CapacityPool | undefined;
  if (['equity', 'debt', 'income'].includes(snapshot.type) && snapshot.sourceName?.trim() && snapshot.structureCap && (snapshot.capacityTotal || current.pools?.some(item => item.source === snapshot.sourceName?.trim()))) {
    current.pools ||= [];
    pool = current.pools.find(item => item.source === snapshot.sourceName?.trim());
    if (pool && (pool.unit !== unitFor(snapshot.type) || (snapshot.capacityPoolId && snapshot.capacityPoolId !== pool.id))) return { status: 'conflict', intent: clone(intent) };
    const amount = decimal(snapshot.structureCap); const total = pool ? decimal(pool.totalCapacity) : decimal(snapshot.capacityTotal || '');
    const used = current.records.filter(item => item.capacityPoolId === pool?.id && item.id !== intent.instrumentId).reduce((sum, item) => sum + (decimal(item.versions.at(-1)?.fields.structureCap || '') || 0n), 0n);
    if (amount === null || total === null || amount + used > total) return { status: 'conflict', intent: clone(intent) };
    if (!pool) { pool = { id: crypto.randomUUID(), tenantId, source: snapshot.sourceName.trim(), unit: unitFor(snapshot.type), totalCapacity: snapshot.capacityTotal! }; current.pools.push(pool); }
    snapshot.capacityPoolId = pool.id;
    snapshot.capacityTotal = pool.totalCapacity;
  }
  const asset = findAsset(getDemoTenant()!, snapshot.assetId);
  const changes = existing ? fieldChanges(latest(existing).fields, snapshot) : [];
  const version: InstrumentVersion = { number: intent.expectedVersion + 1, fields: snapshot, savedAt: Date.now(), savedBy: email, assetName: asset?.versions.at(-1)?.fields.name || '待补充', assetNumber: asset?.number || '', changes };
  const coreChanged = existing && coreKeys.some(key => JSON.stringify(latest(existing).fields[key]) !== JSON.stringify(snapshot[key]));
  const next: Instrument = existing ? { ...existing, assetId: snapshot.assetId, rightsType: snapshot.type, currentVersionId: `${existing.id}:v${version.number}`, status: existing.status === 'ready' && coreChanged ? 'preparing' : existing.status, versions: [...existing.versions, version], events: [...existing.events, event(version.number, 'saved', email, changes.map(item => item.field).join('、') || '无字段变化')], capacityPoolId: pool?.id || existing.capacityPoolId, submittedBy: undefined, submittedAt: undefined }
    : { id: intent.instrumentId, tenantId, number: `RS-${intent.instrumentId.slice(0, 8).toUpperCase()}`, assetId: snapshot.assetId, rightsType: snapshot.type, currentVersionId: `${intent.instrumentId}:v1`, status: 'draft', versions: [version], events: [event(1, 'saved', email)], capacityPoolId: pool?.id };
  if (tokenMapping(snapshot).valid && ['equity', 'debt', 'income'].includes(snapshot.type)) {
    current.tokens ||= [];
    const old = current.tokens.find(item => item.instrumentId === next.id);
    const token: TokenDefinition = old ? { ...old, totalSupply: snapshot.tokenSupply!, unitMapping: tokenMapping(snapshot).label, mappingVersion: old.mappingVersion + (old.totalSupply !== snapshot.tokenSupply || old.unitMapping !== tokenMapping(snapshot).label ? 1 : 0) } : { id: crypto.randomUUID(), tenantId, instrumentId: next.id, totalSupply: snapshot.tokenSupply!, unitMapping: tokenMapping(snapshot).label, mappingVersion: 1 };
    current.tokens = old ? current.tokens.map(item => item.id === token.id ? token : item) : [...current.tokens, token];
    next.tokenDefinitionId = token.id;
  }
  current.records = existing ? current.records.map(item => item.id === next.id ? next : item) : [...current.records, next];
  current.completedIntents ||= {}; current.completedIntents[intent.id] = next.id;
  current.intent = null; put(value, email, tenantId, current);
  return { status: 'saved', record: clone(next), requestId: intent.id };
}
export function saveInstrument(tenant: DemoTenant, fields: InstrumentFields, id?: string, expectedVersion = 0, retryId?: string): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const completedId = retryId && data(read(), current.email, current.tenantId).completedIntents?.[retryId];
  if (completedId) { const completed = findInstrument(tenant, completedId); return completed ? { status: 'saved', record: completed } : { status: 'conflict' }; }
  const normalized = normalizedFields(fields);
  const errors = instrumentErrors(tenant, normalized, false, id); if (errors.length) return { status: 'invalid', errors };
  const value = read(); const bucket = data(value, current.email, current.tenantId);
  if (bucket.intent?.status === 'processing' || bucket.intent?.status === 'unknown') return { status: bucket.intent.status === 'unknown' ? 'unknown' : 'denied', intent: clone(bucket.intent) };
  const existing = id ? bucket.records.find(item => item.id === id && item.tenantId === tenant.id) : undefined;
  if (id && (!existing || !['draft', 'preparing', 'ready'].includes(existing.status))) return { status: 'denied' };
  if (existing && hasPublishedOffering(current.email, tenant.id, existing.id) && coreKeys.some(key => JSON.stringify(latest(existing).fields[key]) !== JSON.stringify(normalized[key]))) return { status: 'invalid', errors: ['该权益结构已有已发布的发行方案引用，核心法律与经济权益不能直接覆盖。请创建新的权益结构。'] };
  if ((existing?.versions.length || 0) !== expectedVersion || useDemoControls.getState().controls.instrumentVersion === 'conflict') return { status: 'conflict' };
  const retry = bucket.intent?.status === 'failed' && bucket.intent.kind === 'save' && bucket.intent.id === retryId && (!id || bucket.intent.instrumentId === id) ? bucket.intent : null;
  const intent: InstrumentIntent = { id: retry?.id || crypto.randomUUID(), kind: 'save', tenantId: tenant.id, actor: current.email, instrumentId: id || retry?.instrumentId || crypto.randomUUID(), expectedVersion, snapshot: normalized, status: 'processing' };
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
  if (intent.kind !== 'save') { bucket.intent = null; put(value, current.email, current.tenantId, bucket); return { status: 'denied', errors: ['旧版内部复核流程已停用。'] }; }
  const outcome = useDemoControls.getState().controls.instrumentSave;
  if (outcome === 'success') return commitSave(value, current.email, current.tenantId, intent);
  if (outcome === 'failed') { intent.status = 'failed'; put(value, current.email, current.tenantId, bucket); return { status: 'failed', intent: clone(intent) }; }
  return { status: 'unknown', intent: clone(intent) };
}
export function prepareInstrument(tenant: DemoTenant, id: string): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, tenant.id);
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || nextRightsState(record.status as 'draft', 'prepare') !== 'preparing' || bucket.intent?.status === 'unknown') return { status: 'denied' };
  record.status = 'preparing'; record.events.push(event(latest(record).number, 'saved', current.email, '进入准备中'));
  put(value, current.email, tenant.id, bucket); return { status: 'saved', record: clone(record) };
}
export function completeInstrument(tenant: DemoTenant, id: string): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, tenant.id);
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || nextRightsState(record.status as 'preparing', 'ready') !== 'ready' || bucket.intent?.status === 'unknown') return { status: 'denied' };
  const errors = instrumentErrors(tenant, latest(record).fields, true, id);
  if (errors.length) return { status: 'invalid', errors };
  record.status = 'ready'; record.readyVersionNumber = latest(record).number; record.events.push(event(latest(record).number, 'ready', current.email, '完成权益资料检查；不代表法律或发行许可'));
  put(value, current.email, tenant.id, bucket); return { status: 'saved', record: clone(record) };
}
export function recheckInstrumentReady(tenant: DemoTenant, id: string): void {
  const current = scope(tenant); if (!current) return;
  const value = read(); const bucket = data(value, current.email, tenant.id);
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (record?.status === 'ready' && instrumentErrors(tenant, latest(record).fields, true, id).length) {
    record.status = 'preparing';
    record.events.push(event(latest(record).number, 'saved', current.email, '文件或关联资料变化，Ready 重新检查未通过'));
    put(value, current.email, tenant.id, bucket);
  }
}
// Called only after a formal Offering publication. The enterprise UI has no Active control.
export function markInstrumentPublished(tenant: DemoTenant, id: string, offeringId: string): InstrumentResult {
  const current = scope(tenant, true); if (!current || !offeringId) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, tenant.id);
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || nextRightsState(record.status as 'ready', 'publish') !== 'active') return { status: 'denied' };
  const errors = instrumentErrors(tenant, latest(record).fields, true, id); if (errors.length) return { status: 'invalid', errors };
  if (!hasPublishedOffering(current.email, tenant.id, id, offeringId)) return { status: 'denied', errors: ['未找到正式发布的关联 Offering。'] };
  record.status = 'active'; record.events.push(event(latest(record).number, 'saved', current.email, `关联 Offering ${offeringId} 正式发布`));
  put(value, current.email, tenant.id, bucket); return { status: 'saved', record: clone(record) };
}
export function changeRightsStatus(tenant: DemoTenant, id: string, action: 'suspend' | 'resume' | 'terminate' | 'finalize'): InstrumentResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = read(); const bucket = data(value, current.email, tenant.id);
  const record = bucket.records.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || bucket.intent?.status === 'unknown') return { status: 'denied' };
  if (action === 'suspend' && record.status !== 'active') return { status: 'denied' };
  if (action === 'resume' && record.status !== 'suspended') return { status: 'denied' };
  if (action === 'terminate' && record.status !== 'suspended') return { status: 'denied' };
  if (action === 'finalize' && record.status !== 'terminating') return { status: 'denied' };
  if (action === 'finalize' && (hasOpenOffering(current.email, tenant.id, id) || bucket.allocations?.some(item => item.instrumentId === id && ['reservation', 'confirmed'].includes(item.kind) && item.status !== 'released'))) return { status: 'denied', errors: ['仍有关联发行或未核销的预留、已分配权益；请先核查未完成义务。'] };
  if (action === 'resume') { const errors = instrumentErrors(tenant, latest(record).fields, true, id); if (errors.length) return { status: 'invalid', errors }; }
  record.status = action === 'suspend' ? 'suspended' : action === 'resume' ? 'active' : action === 'terminate' ? 'terminating' : 'terminated';
  record.events.push(event(latest(record).number, action === 'suspend' ? 'suspended' : action === 'resume' ? 'resumed' : action === 'terminate' ? 'terminating' : 'terminated', current.email, action === 'terminate' ? '待核查在途发行及投资者权益，不自动终止' : action === 'finalize' ? '终止新发行；历史分配及投资者权益保持' : '更新内部使用状态；既有发行不自动改变'));
  put(value, current.email, tenant.id, bucket); return { status: 'saved', record: clone(record) };
}

// Frontend repository contract for test-only capacity simulation. Production concurrency needs a server transaction.
export interface CapacityRepository {
  reserve(tenant: DemoTenant, instrumentId: string, offeringId: string, amount: string, stage: 'draft' | 'confirmed'): boolean;
  commit(tenant: DemoTenant, offeringId: string, amount: string): boolean;
  confirm(tenant: DemoTenant, offeringId: string, amount: string): boolean;
  recordMint(tenant: DemoTenant, offeringId: string, amount: string): boolean;
  markUnknown(tenant: DemoTenant, offeringId: string): boolean;
  release(tenant: DemoTenant, offeringId: string): boolean;
}
export function reservationForOffering(tenant: DemoTenant, offeringId: string): CapacityAllocation | null {
  const current = scope(tenant); if (!current) return null;
  return clone((data(read(), current.email, tenant.id).allocations || []).find(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status !== 'released') || null);
}
export function reservationsForOffering(tenant: DemoTenant, offeringId: string): CapacityAllocation[] | null {
  const current = scope(tenant); if (!current) return null;
  return clone((data(read(), current.email, tenant.id).allocations || []).filter(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status !== 'released'));
}
export const mockCapacityRepository: CapacityRepository = {
  reserve(tenant, instrumentId, offeringId, amount, stage) {
    const current = scope(tenant, true); const instrument = findInstrument(tenant, instrumentId);
    if (!current || stage !== 'confirmed' || !offeringId || !instrument || !['ready', 'active'].includes(instrument.status) || decimal(amount) === null || decimal(amount)! <= 0n) return false;
    const value = read(); const bucket = data(value, current.email, tenant.id); bucket.allocations ||= [];
    if (bucket.allocations.some(item => item.offeringId === offeringId && item.status !== 'released')) return false;
    const available = capacitySummary(tenant, instrumentId); if (!available || decimal(amount)! > (decimal(available.remaining) || 0n)) return false;
    bucket.allocations.push({ id: crypto.randomUUID(), tenantId: tenant.id, instrumentId, offeringId, amount, kind: 'reservation', status: 'active' });
    put(value, current.email, tenant.id, bucket); return true;
  },
  commit(tenant, offeringId, amount) {
    const current = scope(tenant, true); const value = read(); if (!current || decimal(amount) === null || decimal(amount)! <= 0n) return false;
    const bucket = data(value, current.email, tenant.id); const reservation = bucket.allocations?.find(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status === 'active');
    if (!reservation || (decimal(reservation.committed || '0') || 0n) + decimal(amount)! > (decimal(reservation.amount) || 0n)) return false;
    reservation.committed = display((decimal(reservation.committed || '0') || 0n) + decimal(amount)!); put(value, current.email, tenant.id, bucket); return true;
  },
  confirm(tenant, offeringId, amount) {
    const current = scope(tenant, true); if (!current || decimal(amount) === null || decimal(amount)! <= 0n) return false;
    const value = read(); const bucket = data(value, current.email, tenant.id);
    const reservation = bucket.allocations?.find(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status === 'active');
    if (!reservation || decimal(amount)! > (decimal(reservation.amount) || 0n)) return false;
    const remaining = decimal(reservation.amount)! - decimal(amount)!;
    reservation.amount = display(remaining);
    reservation.committed = display((decimal(reservation.committed || '0') || 0n) > decimal(amount)! ? (decimal(reservation.committed || '0') || 0n) - decimal(amount)! : 0n);
    bucket.allocations!.push({ id: crypto.randomUUID(), tenantId: tenant.id, instrumentId: reservation.instrumentId, offeringId, amount, kind: 'confirmed', status: 'active' });
    put(value, current.email, tenant.id, bucket); return true;
  },
  recordMint(tenant, offeringId, amount) {
    const current = scope(tenant, true); if (!current || decimal(amount) === null || decimal(amount)! <= 0n) return false;
    const value = read(); const bucket = data(value, current.email, tenant.id);
    const allocated = bucket.allocations?.filter(item => item.offeringId === offeringId && item.kind === 'confirmed' && item.status !== 'released') || [];
    const minted = bucket.allocations?.filter(item => item.offeringId === offeringId && item.kind === 'minted').reduce((sum, item) => sum + (decimal(item.amount) || 0n), 0n) || 0n;
    if (!allocated.length || minted + decimal(amount)! > allocated.reduce((sum, item) => sum + (decimal(item.amount) || 0n), 0n)) return false;
    bucket.allocations!.push({ id: crypto.randomUUID(), tenantId: tenant.id, instrumentId: allocated[0].instrumentId, offeringId, amount, kind: 'minted', status: 'active' }); put(value, current.email, tenant.id, bucket); return true;
  },
  markUnknown(tenant, offeringId) {
    const current = scope(tenant, true); if (!current) return false;
    const value = read(); const bucket = data(value, current.email, tenant.id); const reservation = bucket.allocations?.find(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status === 'active');
    if (!reservation) return false; reservation.status = 'unknown'; put(value, current.email, tenant.id, bucket); return true;
  },
  release(tenant, offeringId) {
    const current = scope(tenant, true); if (!current) return false;
    const value = read(); const bucket = data(value, current.email, tenant.id);
    const reservation = bucket.allocations?.find(item => item.offeringId === offeringId && item.kind === 'reservation' && item.status === 'active');
    if (!reservation) return false;
    reservation.status = 'released'; put(value, current.email, tenant.id, bucket); return true;
  },
};
