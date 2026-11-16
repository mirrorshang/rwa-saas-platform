import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { readInvestorRelations, type InvestorRelation } from './issuerInvestorsV1';
import { readOrders, type OrderRecord } from './issuerOrdersV1';
import { readPortfolio, tokenMapping, type InstrumentRecord, type InstrumentType } from './issuerPortfolioV1';

export type AllocationState = 'candidate' | 'checking' | 'awaiting-authority' | 'confirmed' | 'blocked' | 'unknown';
export type RegistrationState = 'none' | 'submitted' | 'verifying' | 'effective' | 'difference' | 'unknown';
export type ReconciliationState = 'consistent' | 'pending-delivery' | 'difference' | 'unknown' | 'not-comparable';
export type LegalRights = { quantity: string; unit: '股' | 'U' | '%'; perToken: string; instrumentType: InstrumentType };
export type AllocationRecord = {
  id: string; tenantId: string; orderId: string; investorId: string; assetId: string; offeringId: string;
  instrumentId: string; instrumentVersion: number; tokenQuantity: string; state: AllocationState;
  decisionRef?: string; decisionAt?: number; decisionSource?: string; authorityRef?: string;
  lastCheckedAt?: number; events: { at: number; label: string; source: string; ref?: string }[];
  source: 'internal-sandbox';
};
export type HolderRecord = {
  id: string; tenantId: string; allocationId: string; investorId: string; legalSubjectRef: string;
  displayName: string; kind: 'person' | 'organization'; assetId: string; offeringId: string;
  instrumentId: string; instrumentVersion: number; registration: RegistrationState;
  registrationRef?: string; registrationMode?: 'self' | 'delegated' | 'statutory';
  authorityRef?: string; rightsQuantity?: string; rightsUnit?: LegalRights['unit']; effectiveAt?: number;
  tokenQuantity?: string; tokenConfirmedAt?: number; tokenSubjectRef?: string;
  legalAsOf?: number; tokenAsOf?: number;
  restrictionPolicy?: { allowed: boolean; requesterRef: string; authorityBasisRef: string; partialAllowed: boolean };
  restrictionFacts?: { ref: string; state: 'effective' | 'released' | 'unknown'; rightsQuantity: string; tokenQuantity: string; basisRef: string; at: number }[];
  registrationPolicy?: { submissionAllowed: boolean; responsibleRef: string; authorityBasisRef: string;
    evidenceVersions: { ref: string; label: string; status: 'passed' | 'pending' | 'failed' }[] };
  updatedAt: number; events: { at: number; label: string; source: string; ref?: string }[];
  source: 'internal-sandbox';
};
export type CapacitySnapshot = {
  tenantId: string; instrumentId: string; instrumentVersion: number; maxTokens: string;
  confirmedOccupied?: string; effectiveReserved?: string; protectedTokens?: string; availableTokens?: string;
  offeringReserved?: Record<string, string>; checkedAt?: number; source: 'internal-sandbox';
};
export type RestrictionRequest = {
  id: string; tenantId: string; holderId: string; kind: 'restrict' | 'release';
  state: 'submitted' | 'checking' | 'needs-info' | 'rejected' | 'unknown';
  rightsQuantity: string; rightsUnit: LegalRights['unit']; tokenQuantity: string;
  reasonCategory: 'legal' | 'contract' | 'dispute' | 'other'; reason: string;
  basisRef: string; authorityRef: string; requesterRef: string; originalRestrictionRef?: string;
  createdAt: number; updatedAt: number; source: 'internal-sandbox';
};
export type RegistrationRequest = {
  id: string; tenantId: string; holderId: string; allocationId: string; mode: 'delegated' | 'self'; kind?: 'materials' | 'correction';
  state: 'submitted' | 'checking' | 'needs-info' | 'rejected' | 'unknown';
  legalSubjectRef: string; instrumentId: string; instrumentVersion: number;
  rightsQuantity: string; rightsUnit: LegalRights['unit']; evidenceRef: string;
  authorityRef: string; authorityBasisRef: string; note?: string; originalRegistrationRef?: string;
  createdAt: number; updatedAt: number; source: 'internal-sandbox';
};
export type AllocationData = { allocations: AllocationRecord[]; holders: HolderRecord[]; capacities: CapacitySnapshot[];
  restrictionRequests?: RestrictionRequest[]; registrationRequests?: RegistrationRequest[] };
export type AllocationIssueCategory = 'funds' | 'capacity' | 'registration' | 'token' | 'identity' | 'restriction';
export type AllocationIssue = {
  id: string; category: AllocationIssueCategory; state: 'open' | 'checking' | 'unknown';
  tenantId: string; orderId?: string; holderId?: string; assetId: string; offeringId: string;
  title: string; reason: string; responsible: string; nextStep: string;
  sourceA: string; sourceB: string; tokenQuantity?: string; legalQuantity?: string;
  discoveredAt: number; updatedAt: number;
};

const key = 'wdex-issuer-allocation-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const empty = (): AllocationData => ({ allocations: [], holders: [], capacities: [], restrictionRequests: [], registrationRequests: [] });
export function readAllocationData(tenant: DemoTenant): AllocationData | null {
  const id = scope(tenant);
  if (!id) return null;
  try {
    const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>;
    const data = all[id] || empty();
    return structuredClone({
      allocations: (data.allocations || []).filter(item => item.tenantId === tenant.id),
      holders: (data.holders || []).filter(item => item.tenantId === tenant.id),
      capacities: (data.capacities || []).filter(item => item.tenantId === tenant.id),
      restrictionRequests: (data.restrictionRequests || []).filter(item => item.tenantId === tenant.id),
      registrationRequests: (data.registrationRequests || []).filter(item => item.tenantId === tenant.id),
    });
  } catch { return null; }
}
export function addSandboxAllocationData(tenant: DemoTenant, incoming: AllocationData): AllocationData {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') throw Error('当前企业不能准备配售流程示例。');
  if ([...incoming.allocations, ...incoming.holders, ...incoming.capacities].some(item => item.tenantId !== tenant.id || item.source !== 'internal-sandbox')) throw Error('配售流程示例的企业引用无效。');
  const all = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; } catch { return {} as Record<string, AllocationData>; } })();
  const existing = all[id] || empty();
  const merge = <T extends { id: string }>(old: T[], fresh: T[]) => {
    const seen = new Set(old.map(item => item.id));
    return [...old, ...fresh.filter(item => !seen.has(item.id))];
  };
  const capacities = [...(existing.capacities || [])];
  for (const item of incoming.capacities) if (!capacities.some(old => old.instrumentId === item.instrumentId && old.instrumentVersion === item.instrumentVersion)) capacities.push(item);
  all[id] = { allocations: merge(existing.allocations || [], incoming.allocations), holders: merge(existing.holders || [], incoming.holders), capacities,
    restrictionRequests: merge(existing.restrictionRequests || [], incoming.restrictionRequests || []),
    registrationRequests: merge(existing.registrationRequests || [], incoming.registrationRequests || []) };
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(all[id]);
}
export function findAllocation(tenant: DemoTenant, id: string): AllocationRecord | null {
  return readAllocationData(tenant)?.allocations.find(item => item.id === id) || null;
}
export function findHolder(tenant: DemoTenant, id: string): HolderRecord | null {
  return readAllocationData(tenant)?.holders.find(item => item.id === id) || null;
}
export function allocationCandidateOrders(tenant: DemoTenant): OrderRecord[] {
  const orders = readOrders(tenant) || [];
  const decided = new Set((readAllocationData(tenant)?.allocations || []).map(item => item.orderId));
  return orders.filter(item => !decided.has(item.id) && !item.cancelledAt && !item.expiredAt &&
    ['pending', 'reserved', 'protected', 'allocated', 'unknown'].includes(item.capacity));
}
export function legalRightsForTokens(instrument: InstrumentRecord, version: number, tokenQuantity: string): LegalRights | null {
  const fixed = instrument.versions.find(item => item.number === version);
  if (!fixed || !/^[1-9]\d*$/.test(tokenQuantity)) return null;
  const mapped = tokenMapping(fixed.fields);
  if (mapped.error || !mapped.value) return null;
  const [whole, fraction = ''] = mapped.value.split('.');
  const scaled = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
  const rights = scaled * BigInt(tokenQuantity);
  const tail = (rights % 1_000_000n).toString().padStart(6, '0').replace(/0+$/, '');
  return { quantity: `${rights / 1_000_000n}${tail ? `.${tail}` : ''}`, unit: mapped.unit as LegalRights['unit'], perToken: mapped.value, instrumentType: fixed.fields.type };
}
const scaled = (value: string): bigint | null => {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
};
export function restrictionTokenQuantity(holder: HolderRecord, instrument: InstrumentRecord | undefined, rightsQuantity: string): string | null {
  if (!instrument || holder.instrumentId !== instrument.id || !holder.rightsQuantity || !holder.rightsUnit) return null;
  const one = legalRightsForTokens(instrument, holder.instrumentVersion, '1');
  const requested = scaled(rightsQuantity);
  const available = scaled(holder.rightsQuantity);
  const perToken = one && scaled(one.perToken);
  if (!one || one.unit !== holder.rightsUnit || !requested || !available || !perToken || requested <= 0n || requested > available || requested % perToken !== 0n) return null;
  const tokens = requested / perToken;
  return tokens > 0n && holder.tokenQuantity && /^[1-9]\d*$/.test(holder.tokenQuantity) && tokens <= BigInt(holder.tokenQuantity) ? tokens.toString() : null;
}
export function ensureSandboxRestrictionPolicy(tenant: DemoTenant): void {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') return;
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { return; }
  const holder = all[id]?.holders?.find(item => item.id === `${tenant.id}-sandbox-holder-2`);
  if (!holder || holder.source !== 'internal-sandbox' || holder.registration !== 'effective' ||
    holder.authorityRef !== 'SB-REG-AUTH-001') return;
  let changed = false;
  if (!holder.restrictionPolicy) {
    holder.restrictionPolicy = { allowed: true, requesterRef: 'SB-REQUESTER-001', authorityBasisRef: 'SB-RESTRICTION-RULE-V1', partialAllowed: true };
    changed = true;
  }
  const existing = holder.restrictionFacts || [];
  const total = holder.rightsQuantity && scaled(holder.rightsQuantity);
  const tokenCount = holder.tokenQuantity && /^[1-9]\d*$/.test(holder.tokenQuantity) ? BigInt(holder.tokenQuantity) : null;
  if (!existing.length && total && tokenCount && tokenCount >= 2n && total % tokenCount === 0n) {
    const first = total / tokenCount;
    const fraction = (first % 1_000_000n).toString().padStart(6, '0').replace(/0+$/, '');
    holder.restrictionFacts = [{ ref: 'SB-REST-001', state: 'effective', rightsQuantity: `${first / 1_000_000n}${fraction ? `.${fraction}` : ''}`,
      tokenQuantity: '1', basisRef: 'SB-RESTRICTION-RULE-V1', at: holder.effectiveAt || holder.updatedAt }];
    changed = true;
  }
  if (changed) localStorage.setItem(key, JSON.stringify(all));
}
export function ensureSandboxRegistrationPolicy(tenant: DemoTenant): void {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') return;
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { return; }
  const pending = all[id]?.holders?.find(item => item.id === `${tenant.id}-sandbox-holder-1`);
  const effective = all[id]?.holders?.find(item => item.id === `${tenant.id}-sandbox-holder-2`);
  let changed = false;
  if (pending?.source === 'internal-sandbox' && pending.registration === 'submitted' &&
    pending.registrationMode === 'self' && !pending.authorityRef && !pending.registrationPolicy) {
    pending.registrationMode = 'delegated';
    pending.authorityRef = 'SB-DELEGATE-REG-001';
    pending.registrationPolicy = { submissionAllowed: true, responsibleRef: 'SB-DELEGATE-REG-001',
      authorityBasisRef: 'SB-DELEGATION-V1', evidenceVersions: [{ ref: 'SB-REG-DOC-V1', label: '登记材料版本 V1', status: 'passed' }] };
    changed = true;
  }
  if (effective?.source === 'internal-sandbox' && effective.registration === 'effective' &&
    effective.registrationMode === 'self' && effective.authorityRef === 'SB-REG-AUTH-001' && !effective.registrationPolicy) {
    effective.registrationPolicy = { submissionAllowed: true, responsibleRef: 'SB-REG-AUTH-001',
      authorityBasisRef: 'SB-REG-AUTH-V1', evidenceVersions: [{ ref: 'SB-REG-CORR-DOC-V1', label: '登记更正依据 V1', status: 'passed' }] };
    changed = true;
  }
  if (changed) localStorage.setItem(key, JSON.stringify(all));
}
export function submitRestrictionRequest(tenant: DemoTenant, holderId: string, instrument: InstrumentRecord | undefined, input: {
  kind: RestrictionRequest['kind']; rightsQuantity: string; reasonCategory: RestrictionRequest['reasonCategory'];
  reason: string; basisRef: string; originalRestrictionRef?: string; confirmed: boolean;
}): RestrictionRequest {
  const id = scope(tenant);
  const data = readAllocationData(tenant);
  const holder = data?.holders.find(item => item.id === holderId);
  if (!id || !data || tenant.plan !== 'Standard' || !holder || holder.source !== 'internal-sandbox') throw Error('当前企业无权提交此事项。');
  const policy = holder.restrictionPolicy;
  if (holder.registration !== 'effective' || !policy?.allowed || !policy.requesterRef || !policy.authorityBasisRef || !holder.authorityRef)
    throw Error('请先确认本权益结构的合法限制责任方及受权依据。');
  if (!input.confirmed) throw Error('请确认申请仅进入有权复核，不会立即改变法定登记或链上状态。');
  if (!['legal', 'contract', 'dispute', 'other'].includes(input.reasonCategory) || input.reason.trim().length < 10 || input.reason.trim().length > 500)
    throw Error('请选择原因类别，并填写 10–500 字说明。');
  if (!input.basisRef.trim() || input.basisRef.trim().length > 120) throw Error('请填写有效的法律或合同依据版本引用。');
  if (input.kind === 'release' && !input.originalRestrictionRef?.trim()) throw Error('解除限制必须引用原有效限制编号。');
  if (input.kind === 'restrict' && !policy.partialAllowed && input.rightsQuantity !== holder.rightsQuantity) throw Error('当前依据仅允许对全部法律权益申请限制。');
  const tokens = restrictionTokenQuantity(holder, instrument, input.rightsQuantity);
  if (!tokens) throw Error('申请数量须为可精确映射的法律权益量，且不得超过当前有效登记数量。');
  if (input.kind === 'release') {
    const original = holder.restrictionFacts?.find(item => item.ref === input.originalRestrictionRef && item.state === 'effective');
    if (!original || scaled(input.rightsQuantity)! > scaled(original.rightsQuantity)!) throw Error('原限制编号无有效记录，或申请解除数量超出原限制。');
  } else {
    const occupied = (holder.restrictionFacts || []).filter(item => item.state === 'effective').reduce((sum, item) => sum + (scaled(item.rightsQuantity) || 0n), 0n);
    if (scaled(input.rightsQuantity)! > scaled(holder.rightsQuantity!)! - occupied) throw Error('申请数量超出当前未受限的法律权益量。');
  }
  if (data.restrictionRequests?.some(item => item.holderId === holderId && item.kind === input.kind && item.state !== 'rejected'))
    throw Error('已有同类申请待核，请先查看原事项，避免重复提交。');
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { throw Error('原有记录无法读取，未提交新申请。'); }
  const target = all[id];
  if (!target?.holders?.some(item => item.id === holderId && item.tenantId === tenant.id)) throw Error('原持有人记录已变化，请刷新核对。');
  const now = Date.now();
  const request: RestrictionRequest = {
    id: `${tenant.id}-restriction-${input.kind}-${now}-${(target.restrictionRequests || []).length + 1}`, tenantId: tenant.id, holderId, kind: input.kind, state: 'submitted',
    rightsQuantity: input.rightsQuantity, rightsUnit: holder.rightsUnit!, tokenQuantity: tokens,
    reasonCategory: input.reasonCategory, reason: input.reason.trim(), basisRef: input.basisRef.trim(),
    authorityRef: policy.authorityBasisRef, requesterRef: policy.requesterRef,
    originalRestrictionRef: input.originalRestrictionRef?.trim() || undefined,
    createdAt: now, updatedAt: now, source: 'internal-sandbox',
  };
  target.restrictionRequests = [...(target.restrictionRequests || []), request];
  localStorage.setItem(key, JSON.stringify(all));
  return request;
}
export function updateRestrictionReview(tenant: DemoTenant, requestId: string,
  next: 'checking' | 'needs-info' | 'rejected' | 'unknown'): RestrictionRequest {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') throw Error('当前企业无权更新复核进度。');
  if (!['checking', 'needs-info', 'rejected', 'unknown'].includes(next)) throw Error('复核进度无效。');
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { throw Error('原有记录无法读取，复核进度未更新。'); }
  const request = all[id]?.restrictionRequests?.find(item => item.id === requestId && item.tenantId === tenant.id);
  if (!request || request.source !== 'internal-sandbox') throw Error('申请不存在或无权访问。');
  if (request.state === 'rejected') throw Error('已拒绝的事项不可直接改写，请查看历史。');
  request.state = next;
  request.updatedAt = Date.now();
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(request);
}
export function submitRegistrationMaterials(tenant: DemoTenant, holderId: string, instrument: InstrumentRecord | undefined,
  input: { evidenceRef: string; note: string; confirmed: boolean }): RegistrationRequest {
  const id = scope(tenant);
  const data = readAllocationData(tenant);
  const holder = data?.holders.find(item => item.id === holderId);
  const allocation = data?.allocations.find(item => item.id === holder?.allocationId);
  if (!id || !data || tenant.plan !== 'Standard' || !holder || holder.source !== 'internal-sandbox') throw Error('当前企业无权提交登记材料。');
  if (!allocation || allocation.state !== 'confirmed' || !allocation.decisionRef || !allocation.authorityRef ||
    allocation.instrumentId !== holder.instrumentId || allocation.instrumentVersion !== holder.instrumentVersion ||
    !holder.legalSubjectRef) throw Error('请先核对唯一有效配售决定与法定持有人主体。');
  const policy = holder.registrationPolicy;
  if ((holder.registrationMode !== 'self' && holder.registrationMode !== 'delegated') ||
    !policy?.submissionAllowed || !policy.responsibleRef || !policy.authorityBasisRef ||
    !holder.authorityRef || holder.authorityRef !== policy.responsibleRef)
    throw Error('请先确认本权益结构的合法登记责任方和受权依据。');
  if (holder.registration === 'effective') throw Error('已有效登记不可覆盖；更正须保留原结果并走受权复核。');
  if (holder.registration === 'unknown') throw Error('原登记结果无法确认，请先查询原请求与回执。');
  const rights = instrument && legalRightsForTokens(instrument, holder.instrumentVersion, allocation.tokenQuantity);
  if (!rights || instrument?.id !== holder.instrumentId) throw Error('固定权益结构版本无法精确映射配售数量。');
  const evidence = policy.evidenceVersions.find(item => item.ref === input.evidenceRef && item.status === 'passed');
  if (!evidence) throw Error('请选择已通过核验的登记材料固定版本。');
  if (input.note.trim().length > 500 || (holder.registration === 'difference' && !input.note.trim())) throw Error('差异或更正说明必填，最多 500 字。');
  if (!input.confirmed) throw Error('请确认提交材料不等于自动取得法定权益。');
  const existing = data.registrationRequests?.find(item => item.allocationId === allocation.id && item.state !== 'rejected');
  if (existing) return existing;
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { throw Error('原有记录无法读取，登记材料未提交。'); }
  const target = all[id];
  if (!target?.holders?.some(item => item.id === holderId && item.tenantId === tenant.id)) throw Error('原持有人记录已变化，请刷新核对。');
  const now = Date.now();
  const request: RegistrationRequest = { id: `${tenant.id}-registration-${now}-${(target.registrationRequests || []).length + 1}`, tenantId: tenant.id, holderId,
    allocationId: allocation.id, mode: holder.registrationMode, kind: 'materials', state: 'submitted',
    legalSubjectRef: holder.legalSubjectRef, instrumentId: holder.instrumentId, instrumentVersion: holder.instrumentVersion,
    rightsQuantity: rights.quantity, rightsUnit: rights.unit, evidenceRef: evidence.ref,
    authorityRef: policy.responsibleRef, authorityBasisRef: policy.authorityBasisRef,
    note: input.note.trim() || undefined, createdAt: now, updatedAt: now, source: 'internal-sandbox' };
  target.registrationRequests = [...(target.registrationRequests || []), request];
  localStorage.setItem(key, JSON.stringify(all));
  return request;
}
export function submitRegistrationCorrection(tenant: DemoTenant, holderId: string, instrument: InstrumentRecord | undefined,
  input: { rightsQuantity: string; evidenceRef: string; note: string; confirmed: boolean }): RegistrationRequest {
  const id = scope(tenant);
  const data = readAllocationData(tenant);
  const holder = data?.holders.find(item => item.id === holderId);
  const allocation = data?.allocations.find(item => item.id === holder?.allocationId);
  if (!id || !data || tenant.plan !== 'Standard' || !holder || holder.source !== 'internal-sandbox') throw Error('当前企业无权提交登记更正。');
  if (holder.registration !== 'effective' || !holder.registrationRef || !holder.effectiveAt || !holder.rightsQuantity || !holder.rightsUnit)
    throw Error('缺少原有效登记结果，不能申请更正。');
  if (!allocation || allocation.state !== 'confirmed' || !allocation.decisionRef || !allocation.authorityRef ||
    allocation.instrumentId !== holder.instrumentId || allocation.instrumentVersion !== holder.instrumentVersion)
    throw Error('原配售决定与固定权益版本需要核对。');
  const policy = holder.registrationPolicy;
  if ((holder.registrationMode !== 'self' && holder.registrationMode !== 'delegated') ||
    !policy?.submissionAllowed || !policy.responsibleRef || !policy.authorityBasisRef ||
    policy.responsibleRef !== holder.authorityRef) throw Error('请先确认有权更正责任方与适用授权依据。');
  const expected = instrument && legalRightsForTokens(instrument, holder.instrumentVersion, allocation.tokenQuantity);
  const proposed = scaled(input.rightsQuantity);
  const allowed = expected && scaled(expected.quantity);
  if (!expected || expected.unit !== holder.rightsUnit || !proposed || !allowed || proposed <= 0n || proposed > allowed)
    throw Error('拟更正法律权益量必须为正数，且不得超出固定配售依据。');
  const restricted = (holder.restrictionFacts || []).filter(item => item.state === 'effective').reduce((sum, item) => sum + (scaled(item.rightsQuantity) || 0n), 0n);
  if (proposed < restricted) throw Error('拟更正数量低于现有效限制范围，请先核对原限制事项。');
  if (input.note.trim().length < 10 || input.note.trim().length > 500) throw Error('更正原因须填写 10–500 字。');
  if (!policy.evidenceVersions.some(item => item.ref === input.evidenceRef && item.status === 'passed'))
    throw Error('请选择已通过核验的更正依据固定版本。');
  if (!input.confirmed) throw Error('请确认提交更正申请不会覆盖原有效登记。');
  const existing = data.registrationRequests?.find(item => item.holderId === holderId && item.kind === 'correction' && item.state !== 'rejected');
  if (existing) {
    if (existing.rightsQuantity === input.rightsQuantity && existing.evidenceRef === input.evidenceRef) return existing;
    throw Error(`已有更正事项 ${existing.id} 待核，请先查看原记录。`);
  }
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { throw Error('原有记录无法读取，更正申请未保存。'); }
  const target = all[id];
  if (!target?.holders?.some(item => item.id === holderId && item.tenantId === tenant.id)) throw Error('原登记记录已变化，请刷新核对。');
  const now = Date.now();
  const request: RegistrationRequest = { id: `${tenant.id}-registration-correction-${now}-${(target.registrationRequests || []).length + 1}`,
    tenantId: tenant.id, holderId, allocationId: allocation.id, mode: holder.registrationMode, kind: 'correction', state: 'submitted',
    legalSubjectRef: holder.legalSubjectRef, instrumentId: holder.instrumentId, instrumentVersion: holder.instrumentVersion,
    rightsQuantity: input.rightsQuantity, rightsUnit: holder.rightsUnit, evidenceRef: input.evidenceRef,
    authorityRef: policy.responsibleRef, authorityBasisRef: policy.authorityBasisRef,
    originalRegistrationRef: holder.registrationRef, note: input.note.trim(), createdAt: now, updatedAt: now, source: 'internal-sandbox' };
  target.registrationRequests = [...(target.registrationRequests || []), request];
  localStorage.setItem(key, JSON.stringify(all));
  return request;
}
export function updateRegistrationReview(tenant: DemoTenant, requestId: string,
  next: 'checking' | 'needs-info' | 'rejected' | 'unknown'): RegistrationRequest {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') throw Error('当前企业无权更新登记事项进度。');
  if (!['checking', 'needs-info', 'rejected', 'unknown'].includes(next)) throw Error('登记事项进度无效。');
  let all: Record<string, AllocationData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, AllocationData>; }
  catch { throw Error('原有记录无法读取，登记事项进度未更新。'); }
  const request = all[id]?.registrationRequests?.find(item => item.id === requestId && item.tenantId === tenant.id);
  if (!request || request.source !== 'internal-sandbox') throw Error('登记事项不存在或无权访问。');
  if (request.state === 'rejected') throw Error('已拒绝的事项不可直接改写，请查看历史。');
  request.state = next;
  request.updatedAt = Date.now();
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(request);
}
export function allocationReadiness(order: OrderRecord, investor: InvestorRelation | undefined): { state: AllocationState; reasons: string[] } {
  const reasons: string[] = [];
  if (!investor || investor.kyc === 'unknown') reasons.push('投资者身份核验暂不可确认。');
  else if (investor.kyc !== 'passed' || (investor.expiresAt && investor.expiresAt < Date.now())) reasons.push('投资者当前 KYC 未处于有效通过状态。');
  if (order.quoteStatus !== 'valid' || order.signatureStatus !== 'signed') reasons.push('报价或必要签署尚未有效确认。');
  if (order.payment !== 'final-matched') reasons.push('真实收款尚未最终匹配。');
  if (!['reserved', 'allocated'].includes(order.capacity)) reasons.push('订单容量预留尚未取得有效结果。');
  if (order.cancelledAt || order.expiredAt || order.cancellationRequest) reasons.push('订单取消、到期或取消申请仍需核对。');
  if (['unknown', 'difference'].includes(order.payment) || order.capacity === 'unknown') return { state: 'unknown', reasons };
  if (reasons.length) return { state: 'checking', reasons };
  return { state: 'awaiting-authority', reasons: ['基础前置条件具备；仍需核对合法销售限制、授权规则和有权主体结果。'] };
}
export function reconciliationState(holder: HolderRecord, instrument: InstrumentRecord | undefined): ReconciliationState {
  if (holder.registration === 'unknown') return 'unknown';
  if (holder.registration !== 'effective' || !holder.effectiveAt || !holder.registrationRef || !holder.authorityRef) return 'not-comparable';
  if (!holder.tokenQuantity || !holder.tokenConfirmedAt) return 'pending-delivery';
  if (!holder.tokenSubjectRef || holder.tokenSubjectRef !== holder.legalSubjectRef) return 'not-comparable';
  if (!holder.legalAsOf || !holder.tokenAsOf || holder.legalAsOf !== holder.tokenAsOf) return 'not-comparable';
  if (!instrument || holder.instrumentId !== instrument.id) return 'not-comparable';
  const rights = legalRightsForTokens(instrument, holder.instrumentVersion, holder.tokenQuantity);
  if (!rights || rights.unit !== holder.rightsUnit || !holder.rightsQuantity) return 'not-comparable';
  return rights.quantity === holder.rightsQuantity ? 'consistent' : 'difference';
}
export function deriveAllocationIssues(orders: OrderRecord[], data: AllocationData, instruments: InstrumentRecord[]): AllocationIssue[] {
  const issues: AllocationIssue[] = [];
  const holderByOrder = new Map(data.holders.map(holder => [data.allocations.find(item => item.id === holder.allocationId)?.orderId, holder]));
  const push = (order: OrderRecord, category: AllocationIssueCategory, title: string, reason: string, responsible: string, nextStep: string, state: AllocationIssue['state'], suffix: string, holder?: HolderRecord) => {
    issues.push({ id: `EX-${order.id}-${suffix}`, category, state, tenantId: order.tenantId,
      orderId: order.id, holderId: holder?.id, assetId: order.assetId, offeringId: order.offeringId,
      title, reason, responsible, nextStep, sourceA: order.number,
      sourceB: category === 'funds' ? order.paymentRef || '付款来源待核' : category === 'capacity' ? order.capacityRef || '容量来源待核' : holder?.registrationRef || holder?.id || '登记／Token 来源待核',
      tokenQuantity: order.quantity, legalQuantity: holder?.rightsQuantity && holder.rightsUnit ? `${holder.rightsQuantity} ${holder.rightsUnit}` : undefined,
      discoveredAt: order.anomaly?.at || holder?.updatedAt || order.createdAt,
      updatedAt: holder?.updatedAt || order.anomaly?.at || order.createdAt,
    });
  };
  for (const order of orders) {
    const holder = holderByOrder.get(order.id);
    if (order.payment === 'unknown' || order.payment === 'difference' || order.anomaly?.status === 'open')
      push(order, 'funds', order.anomaly?.category || '付款事实待核', '收款结果与订单报价尚未取得可确认的一致结果。', '资金与结算', '查看原付款与异常记录', order.payment === 'unknown' ? 'unknown' : 'open', 'funds');
    if (order.capacity === 'unknown' || order.capacity === 'protected')
      push(order, 'capacity', '订单额度待核保护', '容量权威尚未确认可释放或转配售，原占用继续保护。', '配售与容量', '核对原预留及订单', order.capacity === 'unknown' ? 'unknown' : 'checking', 'capacity');
    if (order.delivery === 'failed' || order.delivery === 'unknown')
      push(order, 'token', 'Token 交付待核', '交付结果尚未取得可核实的最终状态。', 'Token 管理', '查询原交付事件', order.delivery === 'unknown' ? 'unknown' : 'open', 'token');
    if (!holder && (order.registration === 'unknown' || order.registration === 'difference'))
      push(order, 'registration', '法定登记待核', '订单登记状态尚未取得有效的有权回执。', '有权登记主体', '核对原登记事项', order.registration === 'unknown' ? 'unknown' : 'open', 'registration');
    if (!holder) continue;
    const instrument = instruments.find(item => item.id === holder.instrumentId);
    const compare = reconciliationState(holder, instrument);
    if (holder.registration === 'submitted' || holder.registration === 'verifying' || holder.registration === 'unknown' || holder.registration === 'difference')
      push(order, 'registration', '法定登记结果待核', '配售和 Token 交付不能代替有权登记主体的有效结果。', '有权登记主体', '查看原登记回执', holder.registration === 'unknown' ? 'unknown' : 'checking', 'registration', holder);
    if (compare === 'difference')
      push(order, 'token', '法定权益与 Token 映射不一致', '同一主体、范围和时点的权益数量与 Token 精确映射结果不同。', '法定登记与 Token 管理', '核对两侧原始结果', 'open', 'reconciliation', holder);
    else if (compare === 'not-comparable' && holder.registration === 'effective' && holder.tokenConfirmedAt)
      push(order, 'identity', '主体或核对时点不可比较', '缺少同一法律主体、范围或时点的双侧核验依据。', '有权登记主体与 Token 管理', '补齐主体及核对时点依据', 'checking', 'identity', holder);
  }
  for (const request of data.restrictionRequests || []) {
    if (request.state === 'rejected') continue;
    const holder = data.holders.find(item => item.id === request.holderId);
    if (!holder || holder.tenantId !== request.tenantId) continue;
    const allocation = data.allocations.find(item => item.id === holder.allocationId);
    issues.push({ id: `EX-${request.id}`, category: 'restriction', state: request.state === 'unknown' ? 'unknown' : 'checking',
      tenantId: request.tenantId, holderId: holder.id, orderId: allocation?.orderId,
      assetId: holder.assetId, offeringId: holder.offeringId,
      title: request.kind === 'restrict' ? '限制申请待受权复核' : '解除限制申请待受权复核',
      reason: '申请已进入内部流程；法定登记与链上限制仍以各自有效结果为准。',
      responsible: '有权限制责任主体', nextStep: '查看原申请与受权结果',
      sourceA: request.id, sourceB: request.basisRef, tokenQuantity: request.tokenQuantity,
      legalQuantity: `${request.rightsQuantity} ${request.rightsUnit}`,
      discoveredAt: request.createdAt, updatedAt: request.updatedAt,
    });
  }
  for (const request of data.registrationRequests || []) {
    if (request.state === 'rejected') continue;
    const holder = data.holders.find(item => item.id === request.holderId && item.tenantId === request.tenantId);
    if (!holder) continue;
    const allocation = data.allocations.find(item => item.id === request.allocationId);
    issues.push({ id: `EX-${request.id}`, category: 'registration', state: request.state === 'unknown' ? 'unknown' : 'checking',
      tenantId: request.tenantId, holderId: holder.id, orderId: allocation?.orderId,
      assetId: holder.assetId, offeringId: holder.offeringId,
      title: request.kind === 'correction' ? '登记更正等待有权复核' : '登记材料等待有权核对',
      reason: request.kind === 'correction' ? '更正申请不覆盖原有效登记；请核对原结果、依据版本及有权回执。' : '材料提交并不使法定登记自动生效。请核对原请求与有权主体回执。',
      responsible: request.authorityRef, nextStep: '查看原登记事项与回执',
      sourceA: request.id, sourceB: request.evidenceRef, tokenQuantity: allocation?.tokenQuantity,
      legalQuantity: `${request.rightsQuantity} ${request.rightsUnit}`,
      discoveredAt: request.createdAt, updatedAt: request.updatedAt,
    });
  }
  return issues.sort((a, b) => (a.state === 'checking' ? 1 : 0) - (b.state === 'checking' ? 1 : 0) || b.updatedAt - a.updatedAt);
}
export function readAllocationIssues(tenant: DemoTenant): AllocationIssue[] | null {
  const data = readAllocationData(tenant);
  if (!data) return null;
  return deriveAllocationIssues(readOrders(tenant) || [], data, readPortfolio(tenant).instruments);
}
export function allocationSummary(tenant: DemoTenant) {
  const data = readAllocationData(tenant);
  const portfolio = readPortfolio(tenant);
  const investors = readInvestorRelations(tenant) || [];
  return { data, portfolio, investors, candidateOrders: allocationCandidateOrders(tenant) };
}
