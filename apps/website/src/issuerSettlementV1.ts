import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { formatU, parseU, readFundsData, type FundsData } from './issuerFundsV1';
import { readOrders } from './issuerOrdersV1';

export type ReleaseState = 'restricted' | 'evidence-pending' | 'eligible' | 'blocked' | 'unknown';
export type ReleaseSnapshot = {
  id: string; tenantId: string; poolId: string; offeringId: string; instrumentVersion: number; offeringVersion: number;
  legalHolderRef: string; collectorRef: string; termsRef: string; ruleVersion: string; sourceRef: string;
  asOf: number; validUntil: number; state: ReleaseState; finalMatched: string; unmatched: string;
  refundObligation: string; disputed: string; restricted: string; candidateAmount: string | null;
  beneficiaryRef: string; accountRef: string; accountVerified: boolean;
  legalBasisRef: string; authorityRef: string; purpose: 'issuer-proceeds';
  sourceComplete: boolean; blockers: string[]; source: 'internal-sandbox';
};
export type TransferRequest = {
  id: string; tenantId: string; poolId: string; offeringId: string; snapshotId: string;
  amount: string; purpose: 'issuer-proceeds'; beneficiaryRef: string; accountRef: string;
  network: 'OP Mainnet'; token: 'USDT'; legalBasisRef: string; authorityRef: string;
  note: string; approval: 'requested' | 'needs-info' | 'approved-scoped' | 'rejected' | 'revoked' | 'expired' | 'unknown';
  approvalRef?: string; execution: 'not-submitted' | 'submitted' | 'pending-finality' | 'unknown' | 'partial' | 'settled' | 'failed' | 'returned';
  actualOut: string; actualReceived: string; createdAt: number; updatedAt: number;
  events: { at: number; label: string; ref?: string }[]; source: 'internal-sandbox';
};
export type SettlementData = { snapshots: ReleaseSnapshot[]; transfers: TransferRequest[] };

const key = 'wdex-issuer-settlement-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const empty = (): SettlementData => ({ snapshots: [], transfers: [] });
export function readSettlementData(tenant: DemoTenant): SettlementData | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  try {
    const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, SettlementData>;
    const data = all[bucket] || empty();
    return structuredClone({ snapshots: (data.snapshots || []).filter(item => item.tenantId === tenant.id),
      transfers: (data.transfers || []).filter(item => item.tenantId === tenant.id) });
  } catch { return null; }
}
export function buildSandboxSettlement(tenant: DemoTenant, funds: FundsData, now = Date.now()): SettlementData {
  if (tenant.plan !== 'Standard') throw Error('当前套餐不能准备募集款结算情景。');
  const orders = readOrders(tenant) || [];
  const matched = funds.receipts.filter(item => item.tenantId === tenant.id && item.finality === 'final' && item.match === 'matched' && item.orderId &&
    orders.some(order => order.id === item.orderId && order.payment === 'final-matched'));
  const eligibleReceipt = matched.find(item => orders.find(order => order.id === item.orderId)?.registration === 'effective');
  if (!eligibleReceipt) return empty();
  const order = orders.find(item => item.id === eligibleReceipt.orderId)!;
  let total = 0n;
  for (const receipt of matched.filter(item => item.offeringId === order.offeringId)) {
    const amount = parseU(receipt.matchedAmount);
    if (amount === null) throw Error('实收金额证据无法核对。');
    total += amount;
  }
  const released = parseU(eligibleReceipt.matchedAmount);
  if (!released || released > total) throw Error('释放资格来源无法核对。');
  const changedFunds = (funds.refunds || []).some(item => item.offeringId === order.offeringId) ||
    funds.matchReviews.some(item => funds.receipts.some(receipt => receipt.id === item.receiptId && receipt.offeringId === order.offeringId));
  // This is a fixed, explicitly sourced Sandbox policy snapshot, not a wallet-balance calculation.
  const snapshot: ReleaseSnapshot = {
    id: `${tenant.id}-sandbox-release-1`, tenantId: tenant.id, poolId: `${tenant.id}-pool-${order.offeringId}`,
    offeringId: order.offeringId, instrumentVersion: order.instrumentVersion, offeringVersion: order.offeringVersion,
    legalHolderRef: 'SB-LEGAL-HOLDER-001', collectorRef: 'SB-COLLECTOR-001', termsRef: 'SB-FUND-TERMS-V1',
    ruleVersion: 'SB-RELEASE-RULE-V1', sourceRef: eligibleReceipt.id, asOf: now, validUntil: now + 24 * 3600000,
    state: changedFunds ? 'evidence-pending' : 'eligible', finalMatched: formatU(total), unmatched: '内部异常资金隔离核查',
    refundObligation: changedFunds ? '待核实' : '0', disputed: '0',
    restricted: formatU(total - released), candidateAmount: changedFunds ? null : formatU(released),
    beneficiaryRef: 'SB-ISSUER-BENEFICIARY-001', accountRef: 'SB-APPROVED-ACCOUNT-001', accountVerified: true,
    legalBasisRef: 'SB-RELEASE-TERMS-V1', authorityRef: 'SB-AUTHORITY-SCOPE-V1', purpose: 'issuer-proceeds',
    sourceComplete: !changedFunds, blockers: changedFunds ? ['资金或退款记录已有变化，需重新核验释放资格'] : [], source: 'internal-sandbox',
  };
  return { snapshots: [snapshot], transfers: [] };
}
export function ensureSandboxSettlement(tenant: DemoTenant): SettlementData | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  const existing = readSettlementData(tenant);
  if (!existing) throw Error('原结算资料无法读取；未覆盖本地记录。');
  if (tenant.plan !== 'Standard' || existing.snapshots.length || existing.transfers.length) return existing;
  const funds = readFundsData(tenant);
  if (!funds) throw Error('原资金资料无法读取。');
  const sample = buildSandboxSettlement(tenant, funds);
  if (!sample.snapshots.length) return existing;
  let all: Record<string, SettlementData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, SettlementData>; }
  catch { throw Error('原结算资料无法读取；未写入新情景。'); }
  all[bucket] = sample;
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(sample);
}
export function transferRoom(data: SettlementData, snapshot: ReleaseSnapshot): string | null {
  const cap = snapshot.candidateAmount === null ? null : parseU(snapshot.candidateAmount);
  if (cap === null) return null;
  let committed = 0n;
  for (const transfer of data.transfers) {
    if (transfer.poolId !== snapshot.poolId || ['rejected', 'revoked', 'expired'].includes(transfer.approval) && transfer.execution === 'not-submitted') continue;
    const amount = parseU(transfer.amount);
    if (amount === null) return null;
    committed += amount;
  }
  return committed <= cap ? formatU(cap - committed) : null;
}
export function transferCommitted(data: SettlementData, poolId: string): string | null {
  let committed = 0n;
  for (const transfer of data.transfers) {
    if (transfer.poolId !== poolId || (['rejected', 'revoked', 'expired'].includes(transfer.approval) && transfer.execution === 'not-submitted')) continue;
    const amount = parseU(transfer.amount);
    if (amount === null) return null;
    committed += amount;
  }
  return formatU(committed);
}
export function releaseSnapshotIssues(snapshot: ReleaseSnapshot, funds: FundsData | null, now = Date.now()): string[] {
  const issues = [...snapshot.blockers];
  if (snapshot.state !== 'eligible' || !snapshot.sourceComplete || !snapshot.accountVerified) issues.push('资格或来源尚未核实');
  if (snapshot.validUntil <= now) issues.push('资格快照已过期');
  const source = funds?.receipts.find(item => item.id === snapshot.sourceRef && item.offeringId === snapshot.offeringId &&
    item.finality === 'final' && item.match === 'matched' && item.tenantId === snapshot.tenantId);
  if (!source) issues.push('最终匹配实收来源已变化');
  if (funds && ((funds.refunds || []).some(item => item.offeringId === snapshot.offeringId && item.updatedAt >= snapshot.asOf) ||
    funds.matchReviews.some(item => item.updatedAt >= snapshot.asOf && funds.receipts.some(receipt => receipt.id === item.receiptId && receipt.offeringId === snapshot.offeringId))))
    issues.push('资金或退款记录晚于资格快照，需重新核验');
  if (!funds) issues.push('资金来源暂不可用');
  return issues;
}
export function submitTransferRequest(tenant: DemoTenant, snapshotId: string, input: {
  amount: string; purpose: 'issuer-proceeds'; beneficiaryRef: string; accountRef: string;
  legalBasisRef: string; authorityRef: string; note: string; confirmed: boolean;
}): TransferRequest {
  const bucket = scope(tenant);
  const data = readSettlementData(tenant);
  if (!bucket || tenant.plan !== 'Standard' || !data) throw Error('当前企业不能提交划拨申请。');
  const snapshot = data.snapshots.find(item => item.id === snapshotId && item.tenantId === tenant.id);
  const funds = readFundsData(tenant);
  if (!snapshot || snapshot.source !== 'internal-sandbox' || releaseSnapshotIssues(snapshot, funds).length)
    throw Error('释放资格已过期或资金来源待核，不能提交划拨申请。');
  if (input.purpose !== snapshot.purpose || input.beneficiaryRef !== snapshot.beneficiaryRef ||
    input.accountRef !== snapshot.accountRef || input.legalBasisRef !== snapshot.legalBasisRef ||
    input.authorityRef !== snapshot.authorityRef) throw Error('受款主体、账户、用途或固定授权依据与资格快照不一致。');
  if (input.note.trim().length < 10 || input.note.trim().length > 500) throw Error('请填写 10–500 字申请说明。');
  if (!input.confirmed) throw Error('请确认资格不等于付款批准，实际出款与受领须分别核验。');
  const duplicate = data.transfers.find(item => item.snapshotId === snapshotId && item.amount === input.amount &&
    item.note === input.note.trim() && !['rejected', 'revoked', 'expired'].includes(item.approval));
  if (duplicate) return duplicate;
  const amount = parseU(input.amount);
  const room = transferRoom(data, snapshot);
  const remaining = room === null ? null : parseU(room);
  if (!amount || remaining === null || amount <= 0n || amount > remaining)
    throw Error('申请金额须为正数且不得超过扣除有效占用后的候选额度。');
  let all: Record<string, SettlementData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, SettlementData>; }
  catch { throw Error('原结算资料无法读取；申请未保存。'); }
  const target = all[bucket];
  if (!target?.snapshots.some(item => item.id === snapshot.id && item.sourceRef === snapshot.sourceRef))
    throw Error('释放资格快照已变化，请刷新核对。');
  const now = Date.now();
  const request: TransferRequest = {
    id: `${tenant.id}-transfer-${now}-${(target.transfers || []).length + 1}`, tenantId: tenant.id,
    poolId: snapshot.poolId, offeringId: snapshot.offeringId, snapshotId: snapshot.id, amount: input.amount,
    purpose: input.purpose, beneficiaryRef: input.beneficiaryRef, accountRef: input.accountRef,
    network: 'OP Mainnet', token: 'USDT', legalBasisRef: input.legalBasisRef, authorityRef: input.authorityRef,
    note: input.note.trim(), approval: 'requested', execution: 'not-submitted', actualOut: '0', actualReceived: '0',
    createdAt: now, updatedAt: now, events: [{ at: now, label: '内部划拨申请已提交', ref: snapshot.id }],
    source: 'internal-sandbox',
  };
  target.transfers = [...(target.transfers || []), request];
  localStorage.setItem(key, JSON.stringify(all));
  return request;
}
export function updateTransferApproval(tenant: DemoTenant, id: string,
  state: TransferRequest['approval'], evidenceRef: string): TransferRequest {
  const bucket = scope(tenant);
  if (!bucket || tenant.plan !== 'Standard') throw Error('当前企业不能记录核对结果。');
  if (!['needs-info', 'rejected', 'approved-scoped', 'unknown'].includes(state) || evidenceRef.trim().length < 5)
    throw Error('请选择适用结果并填写核对依据。');
  let all: Record<string, SettlementData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, SettlementData>; }
  catch { throw Error('原结算资料无法读取。'); }
  const item = all[bucket]?.transfers.find(row => row.id === id && row.tenantId === tenant.id);
  if (!item || item.execution !== 'not-submitted' || !['requested', 'needs-info', 'unknown'].includes(item.approval))
    throw Error('当前申请状态不能记录该核对结果。');
  item.approval = state;
  item.approvalRef = evidenceRef.trim();
  item.updatedAt = Date.now();
  item.events.push({ at: item.updatedAt, label: `内部授权核对：${state}`, ref: item.approvalRef });
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(item);
}
