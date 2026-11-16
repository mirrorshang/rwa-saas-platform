import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { readOrders, type OrderRecord } from './issuerOrdersV1';
import { readAllocationData } from './issuerAllocationV1';
import { latest, readPortfolio, type OfferingRecord } from './issuerPortfolioV1';

export type FundsInstruction = {
  id: string; tenantId: string; orderId: string; offeringId: string; offeringVersion: number;
  amount: string; currency: 'U'; network: 'OP Mainnet'; token: 'USDT'; targetRef: string;
  state: 'internal-preview' | 'expired' | 'unknown'; createdAt: number; expiresAt: number;
  source: 'internal-sandbox';
};
export type ReceiptFinality = 'observed' | 'pending-finality' | 'final' | 'unknown' | 'invalid';
export type ReceiptMatch = 'unmatched' | 'partial' | 'matched' | 'underpaid' | 'overpaid' | 'disputed';
export function receiptStatusText(finality: ReceiptFinality, match: ReceiptMatch): string {
  const finalityText: Record<ReceiptFinality, string> = { observed: '已观察', 'pending-finality': '最终性待核', final: '最终确认', unknown: '结果无法确认', invalid: '无效待调查' };
  const matchText: Record<ReceiptMatch, string> = { unmatched: '未匹配', partial: '部分匹配', matched: '已匹配', underpaid: '少付待核', overpaid: '多付待核', disputed: '争议中' };
  return `${finalityText[finality]} / ${matchText[match]}`;
}
export type ReceiptRecord = {
  id: string; tenantId: string; orderId?: string; instructionId?: string; offeringId: string;
  eventRef: string; amount: string; matchedAmount: string; currency: 'U';
  network: 'OP Mainnet' | 'other'; token: 'USDT' | 'unverified'; targetRef: string;
  sourceRef: string; sourceLink: 'verified' | 'unmatched' | 'unknown';
  evidenceVersions?: { ref: string; label: string; status: 'passed' | 'pending' | 'failed' }[];
  finality: ReceiptFinality; match: ReceiptMatch;
  occurredAt: number; receivedAt: number; checkedAt: number;
  events: { at: number; label: string; source: string; ref?: string }[];
  source: 'internal-sandbox';
};
export type MatchReview = {
  id: string; tenantId: string; receiptId: string; orderId: string; reason: string; evidenceRef: string;
  state: 'submitted' | 'checking' | 'needs-info' | 'rejected' | 'unknown';
  createdAt: number; updatedAt: number; source: 'internal-sandbox';
};
export type RefundReason = 'offering-failed' | 'order-cancelled' | 'overpayment' | 'wrong-payment' | 'other-approved';
export type RefundEligibility = {
  id: string; tenantId: string; orderId: string; receiptId: string; amountCap: string;
  beneficiaryRef: string; targetRef: string; targetVerified: boolean;
  basisRef: string; partialAllowed: boolean; reasons: RefundReason[]; checkedAt: number;
  source: 'internal-sandbox';
};
export type RefundRecord = {
  id: string; tenantId: string; orderId: string; receiptId: string; offeringId: string; eligibilityId: string;
  amount: string; reason: RefundReason; note: string; basisRef: string;
  beneficiaryRef: string; targetRef: string; targetVerified: boolean;
  approval: 'requested' | 'needs-info' | 'rejected' | 'approved-scoped' | 'unknown';
  approvalRef?: string; execution: 'not-submitted' | 'submitted' | 'pending' | 'unknown' | 'partial' | 'settled' | 'failed';
  actualOut: string; actualReceived: string; createdAt: number; updatedAt: number;
  events: { at: number; label: string; ref?: string }[]; source: 'internal-sandbox';
};
export type FundsData = { instructions: FundsInstruction[]; receipts: ReceiptRecord[]; matchReviews: MatchReview[];
  refundEligibility?: RefundEligibility[]; refunds?: RefundRecord[] };
export type FundsIssue = {
  id: string; tenantId: string; receiptId: string; orderId?: string; offeringId: string;
  category: 'unknown' | 'invalid-target' | 'underpaid' | 'overpaid' | 'unmatched' | 'source';
  title: string; nextStep: string; amount: string; state: 'open' | 'checking' | 'unknown'; updatedAt: number;
};

const key = 'wdex-issuer-funds-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const empty = (): FundsData => ({ instructions: [], receipts: [], matchReviews: [], refundEligibility: [], refunds: [] });
export function parseU(value: string): bigint | null {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
}
export function formatU(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const abs = value < 0n ? -value : value;
  const fraction = (abs % 1_000_000n).toString().padStart(6, '0').replace(/0+$/, '');
  return `${sign}${abs / 1_000_000n}${fraction ? `.${fraction}` : ''}`;
}
export function readFundsData(tenant: DemoTenant): FundsData | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  try {
    const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>;
    const data = all[bucket] || empty();
    return structuredClone({
      instructions: (data.instructions || []).filter(item => item.tenantId === tenant.id),
      receipts: (data.receipts || []).filter(item => item.tenantId === tenant.id),
      matchReviews: (data.matchReviews || []).filter(item => item.tenantId === tenant.id),
      refundEligibility: (data.refundEligibility || []).filter(item => item.tenantId === tenant.id),
      refunds: (data.refunds || []).filter(item => item.tenantId === tenant.id),
    });
  } catch { return null; }
}
export function collectionPlan(tenant: DemoTenant, offering: OfferingRecord) {
  const portfolio = readPortfolio(tenant);
  const fields = latest(offering).fields;
  const wallet = portfolio.wallets.find(item => item.id === fields.walletId);
  return { offeringId: offering.id, offeringVersion: latest(offering).number,
    walletId: wallet?.id, walletName: wallet?.name, walletVerified: Boolean(wallet?.verified && wallet.network === 'OP Mainnet'),
    legalCollectorRef: '', targetType: 'dedicated-contract' as const, targetRef: '', network: 'OP Mainnet' as const,
    token: 'USDT' as const, state: 'production-blocked' as const,
    reason: offering.status !== 'draft' ? '收款责任主体、目标及生产准入待核。' : '发行方案尚未发布；不能生成真实付款指令。' };
}
export function buildSandboxFunds(tenant: DemoTenant, orders: OrderRecord[], now = Date.now()): FundsData {
  if (tenant.plan !== 'Standard' || orders.some(item => item.tenantId !== tenant.id || item.source !== 'internal-sandbox'))
    throw Error('当前企业不能准备资金流程数据。');
  const instructions: FundsInstruction[] = orders.map((order, index) => ({
    id: `${tenant.id}-sandbox-instruction-${index + 1}`, tenantId: tenant.id, orderId: order.id,
    offeringId: order.offeringId, offeringVersion: order.offeringVersion,
    amount: order.amount, currency: 'U', network: 'OP Mainnet', token: 'USDT', targetRef: 'SB-TARGET-001',
    state: 'internal-preview', createdAt: order.createdAt, expiresAt: order.createdAt + 24 * 3600000,
    source: 'internal-sandbox',
  }));
  const receiptFor = (order: OrderRecord, index: number, finality: ReceiptFinality, match: ReceiptMatch, amount: string): ReceiptRecord => ({
    id: `${tenant.id}-sandbox-receipt-${index}`, tenantId: tenant.id, orderId: order.id,
    instructionId: instructions.find(item => item.orderId === order.id)?.id, offeringId: order.offeringId,
    eventRef: `SB-FUND-EVENT-${index}`, amount,
    matchedAmount: match === 'matched' ? amount : '0', currency: 'U', network: 'OP Mainnet', token: 'USDT',
    targetRef: 'SB-TARGET-001', sourceRef: `SB-SOURCE-${index}`, sourceLink: 'unknown',
    evidenceVersions: [{ ref: `SB-MATCH-EVIDENCE-${index}-V1`, label: '到账核对依据 V1', status: 'passed' }],
    finality, match, occurredAt: now - index * 3600000, receivedAt: now - index * 3600000 + 30000,
    checkedAt: now, events: [{ at: now - index * 3600000, label: '内部资金情景事件已记录', source: 'Sandbox 资金', ref: `SB-FUND-EVENT-${index}` }],
    source: 'internal-sandbox',
  });
  const receipts: ReceiptRecord[] = [];
  const byPayment = (state: OrderRecord['payment']) => orders.find(item => item.payment === state);
  const matched = orders.filter(item => item.payment === 'final-matched');
  matched.forEach((order, index) => receipts.push(receiptFor(order, index + 1, 'final', 'matched', order.amount)));
  const unknown = byPayment('unknown');
  if (unknown) receipts.push(receiptFor(unknown, 3, 'unknown', 'unmatched', unknown.amount));
  const difference = byPayment('difference');
  if (difference) {
    const quoted = parseU(difference.amount);
    if (!quoted || quoted <= 1_000_000n) throw Error('示例订单金额不足以构造差额。');
    receipts.push(receiptFor(difference, 4, 'final', 'underpaid', formatU(quoted - 1_000_000n)));
  }
  const eligibleOrder = matched.find(item => item.registration !== 'effective');
  const eligibleReceipt = receipts.find(item => item.orderId === eligibleOrder?.id && item.match === 'matched');
  const refundEligibility: RefundEligibility[] = eligibleOrder && eligibleReceipt ? [{
    id: `${tenant.id}-sandbox-refund-eligibility-1`, tenantId: tenant.id, orderId: eligibleOrder.id,
    receiptId: eligibleReceipt.id, amountCap: eligibleReceipt.matchedAmount,
    beneficiaryRef: `${eligibleOrder.investorRef}-BENEFICIARY`, targetRef: 'SB-REFUND-TARGET-001', targetVerified: true,
    basisRef: 'SB-REFUND-TERMS-V1', partialAllowed: true,
    reasons: ['offering-failed', 'order-cancelled', 'overpayment', 'wrong-payment', 'other-approved'],
    checkedAt: now, source: 'internal-sandbox',
  }] : [];
  return { instructions, receipts, matchReviews: [], refundEligibility, refunds: [] };
}
export function ensureSandboxFunds(tenant: DemoTenant): FundsData | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  const current = readFundsData(tenant);
  if (!current) throw Error('本地资金记录无法读取，请保留原数据并核对存储状态。');
  if (tenant.plan !== 'Standard') return current;
  if (current.instructions.length || current.receipts.length) {
    if (current.refundEligibility?.length) return current;
    const order = (readOrders(tenant) || []).find(item => item.payment === 'final-matched' && item.registration !== 'effective');
    const receipt = current.receipts.find(item => item.id === `${tenant.id}-sandbox-receipt-1` &&
      item.orderId === order?.id && item.eventRef === 'SB-FUND-EVENT-1' && item.finality === 'final' && item.match === 'matched');
    if (!order || !receipt) return current;
    let all: Record<string, FundsData>;
    try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>; }
    catch { throw Error('原资金记录无法读取，退款资格未补充。'); }
    const target = all[bucket];
    if (!target || target.refundEligibility?.length) return current;
    target.refundEligibility = [{ id: `${tenant.id}-sandbox-refund-eligibility-1`, tenantId: tenant.id,
      orderId: order.id, receiptId: receipt.id, amountCap: receipt.matchedAmount,
      beneficiaryRef: `${order.investorRef}-BENEFICIARY`, targetRef: 'SB-REFUND-TARGET-001', targetVerified: true,
      basisRef: 'SB-REFUND-TERMS-V1', partialAllowed: true,
      reasons: ['offering-failed', 'order-cancelled', 'overpayment', 'wrong-payment', 'other-approved'],
      checkedAt: receipt.checkedAt, source: 'internal-sandbox' }];
    localStorage.setItem(key, JSON.stringify(all));
    return readFundsData(tenant);
  }
  const orders = readOrders(tenant) || [];
  if (!orders.length) return current;
  const sample = buildSandboxFunds(tenant, orders);
  let all: Record<string, FundsData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>; }
  catch { throw Error('本地资金记录无法读取，未写入新情景。'); }
  all[bucket] = { ...sample, matchReviews: current.matchReviews,
    refundEligibility: current.refundEligibility?.length ? current.refundEligibility : sample.refundEligibility,
    refunds: current.refunds || [] };
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(all[bucket]);
}
export function deriveFundsIssues(data: FundsData): FundsIssue[] {
  const issues: FundsIssue[] = [];
  for (const receipt of data.receipts) {
    const issue = receipt.finality === 'unknown' ? { category: 'unknown' as const, title: '到账结果无法确认', nextStep: '查询原资金事件', state: 'unknown' as const } :
      receipt.finality === 'invalid' || receipt.network !== 'OP Mainnet' || receipt.token !== 'USDT' ? { category: 'invalid-target' as const, title: '支付网络或资产不符合本期安排', nextStep: '调查原始事件', state: 'open' as const } :
      receipt.match === 'underpaid' ? { category: 'underpaid' as const, title: '实收少于订单义务', nextStep: '核对差额与原订单', state: 'open' as const } :
      receipt.match === 'overpaid' ? { category: 'overpaid' as const, title: '实收高于订单义务', nextStep: '核对超额与合法退款依据', state: 'open' as const } :
      receipt.match === 'unmatched' ? { category: 'unmatched' as const, title: '到账尚未匹配唯一订单', nextStep: '提交受控匹配复核', state: 'checking' as const } : null;
    if (issue) issues.push({ id: `FI-${receipt.id}`, tenantId: receipt.tenantId, receiptId: receipt.id,
      orderId: receipt.orderId, offeringId: receipt.offeringId, amount: receipt.amount, updatedAt: receipt.checkedAt, ...issue });
  }
  return issues.sort((a, b) => (a.state === 'checking' ? 1 : 0) - (b.state === 'checking' ? 1 : 0) || b.updatedAt - a.updatedAt);
}
export function submitMatchReview(tenant: DemoTenant, receiptId: string, orderId: string, reason: string, evidenceRef: string): MatchReview {
  const bucket = scope(tenant);
  if (!bucket || tenant.plan !== 'Standard') throw Error('当前企业不能提交匹配复核。');
  const data = readFundsData(tenant);
  const receipt = data?.receipts.find(item => item.id === receiptId);
  const order = (readOrders(tenant) || []).find(item => item.id === orderId);
  if (!receipt || !order || receipt.offeringId !== order.offeringId || receipt.finality !== 'final' ||
    receipt.network !== 'OP Mainnet' || receipt.token !== 'USDT' || receipt.match === 'matched')
    throw Error('原到账事件与订单条件待核，不能提交匹配复核。');
  if (reason.trim().length < 10 || reason.trim().length > 500) throw Error('请填写 10–500 字复核原因。');
  if (!receipt.evidenceVersions?.some(item => item.ref === evidenceRef && item.status === 'passed'))
    throw Error('请选择已核验的固定证据版本。');
  const existing = data?.matchReviews.find(item => item.receiptId === receiptId && item.orderId === orderId && item.state !== 'rejected');
  if (existing) return existing;
  let all: Record<string, FundsData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>; }
  catch { throw Error('原资金记录无法读取，未提交复核。'); }
  const target = all[bucket];
  if (!target?.receipts.some(item => item.id === receiptId && item.tenantId === tenant.id)) throw Error('原到账事件已变化，请刷新核对。');
  const now = Date.now();
  const review: MatchReview = { id: `${tenant.id}-match-review-${now}-${(target.matchReviews || []).length + 1}`,
    tenantId: tenant.id, receiptId, orderId, reason: reason.trim(), evidenceRef: evidenceRef.trim(), state: 'submitted',
    createdAt: now, updatedAt: now, source: 'internal-sandbox' };
  target.matchReviews = [...(target.matchReviews || []), review];
  localStorage.setItem(key, JSON.stringify(all));
  return review;
}
export function refundRequestRoom(data: FundsData, eligibility: RefundEligibility): string | null {
  const cap = parseU(eligibility.amountCap);
  if (cap === null) return null;
  let committed = 0n;
  for (const request of data.refunds || []) {
    if (request.eligibilityId !== eligibility.id || request.approval === 'rejected') continue;
    const amount = parseU(request.amount);
    if (amount === null) return null;
    committed += amount;
  }
  return committed <= cap ? formatU(cap - committed) : null;
}
export function submitRefundRequest(tenant: DemoTenant, eligibilityId: string, input: {
  amount: string; reason: RefundReason; note: string; basisRef: string; confirmed: boolean;
}): RefundRecord {
  const bucket = scope(tenant);
  const data = readFundsData(tenant);
  if (!bucket || tenant.plan !== 'Standard' || !data) throw Error('当前企业不能发起退款申请。');
  const eligibility = data.refundEligibility?.find(item => item.id === eligibilityId && item.tenantId === tenant.id);
  const order = (readOrders(tenant) || []).find(item => item.id === eligibility?.orderId);
  const receipt = data.receipts.find(item => item.id === eligibility?.receiptId);
  if (!eligibility || !order || !receipt || receipt.orderId !== order.id || receipt.finality !== 'final' ||
    receipt.match !== 'matched' || receipt.network !== 'OP Mainnet' || receipt.token !== 'USDT' ||
    receipt.source !== 'internal-sandbox' || eligibility.source !== 'internal-sandbox')
    throw Error('原订单或最终匹配实收尚未核实，不能申请退款。');
  const allocationData = readAllocationData(tenant);
  const holder = allocationData?.holders.find(item => item.tenantId === tenant.id &&
    allocationData.allocations.find(allocation => allocation.id === item.allocationId)?.orderId === order.id);
  if (order.registration === 'effective' || holder?.registration === 'effective')
    throw Error('法定持有人登记已有效，请到到期与退出处理；不能使用普通认购退款。');
  if (!eligibility.targetVerified || !eligibility.beneficiaryRef || !eligibility.targetRef ||
    !eligibility.basisRef || input.basisRef !== eligibility.basisRef)
    throw Error('合法退款受益人、目标或固定法律依据尚未核验。');
  if (!eligibility.reasons.includes(input.reason)) throw Error('所选退款原因不在当前受权范围内。');
  if (input.note.trim().length < 10 || input.note.trim().length > 500) throw Error('退款原因说明须为 10–500 字。');
  if (!input.confirmed) throw Error('请确认申请不等于已批准或已实际退款。');
  const duplicate = data.refunds?.find(item => item.eligibilityId === eligibility.id && item.amount === input.amount &&
    item.reason === input.reason && item.note === input.note.trim() && item.approval !== 'rejected');
  if (duplicate) return duplicate;
  const amount = parseU(input.amount);
  const room = refundRequestRoom(data, eligibility);
  const remaining = room && parseU(room);
  if (!amount || !remaining || amount <= 0n || amount > remaining) throw Error('申请金额须为正数且不得超过当前受权申请额度。');
  if (!eligibility.partialAllowed && amount !== remaining) throw Error('当前规则仅允许全额退款申请。');
  let all: Record<string, FundsData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>; }
  catch { throw Error('原资金记录无法读取，退款申请未保存。'); }
  const target = all[bucket];
  if (!target?.receipts.some(item => item.id === receipt.id && item.tenantId === tenant.id)) throw Error('原实收记录已变化，请刷新核对。');
  const now = Date.now();
  const request: RefundRecord = {
    id: `${tenant.id}-refund-${now}-${(target.refunds || []).length + 1}`, tenantId: tenant.id,
    orderId: order.id, receiptId: receipt.id, offeringId: order.offeringId, eligibilityId: eligibility.id,
    amount: input.amount, reason: input.reason, note: input.note.trim(), basisRef: eligibility.basisRef,
    beneficiaryRef: eligibility.beneficiaryRef, targetRef: eligibility.targetRef, targetVerified: true,
    approval: 'requested', execution: 'not-submitted', actualOut: '0', actualReceived: '0',
    createdAt: now, updatedAt: now, events: [{ at: now, label: '内部退款申请已提交', ref: eligibility.id }],
    source: 'internal-sandbox',
  };
  target.refunds = [...(target.refunds || []), request];
  localStorage.setItem(key, JSON.stringify(all));
  return request;
}
export function updateRefundApproval(tenant: DemoTenant, refundId: string,
  next: 'needs-info' | 'rejected' | 'approved-scoped' | 'unknown', approvalRef?: string): RefundRecord {
  const bucket = scope(tenant);
  if (!bucket || tenant.plan !== 'Standard') throw Error('当前企业不能更新退款复核情景。');
  if (!['needs-info', 'rejected', 'approved-scoped', 'unknown'].includes(next)) throw Error('退款复核进度无效。');
  let all: Record<string, FundsData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, FundsData>; }
  catch { throw Error('原资金记录无法读取，退款复核未更新。'); }
  const record = all[bucket]?.refunds?.find(item => item.id === refundId && item.tenantId === tenant.id);
  if (!record || record.source !== 'internal-sandbox') throw Error('退款记录不存在或无权访问。');
  if (record.approval === 'rejected' || record.execution !== 'not-submitted') throw Error('原退款事项已进入终态或执行核对，请先查看历史。');
  if (next === 'approved-scoped' && (!approvalRef?.trim() || approvalRef.trim().length > 120))
    throw Error('受权批准必须填写固定决定依据引用。');
  record.approval = next;
  record.approvalRef = next === 'approved-scoped' ? approvalRef!.trim() : undefined;
  record.updatedAt = Date.now();
  record.events.push({ at: record.updatedAt, label: next === 'approved-scoped' ? '内部情景受权结果已记录；未执行退款' :
    next === 'needs-info' ? '等待补充退款依据' : next === 'rejected' ? '退款申请已拒绝' : '退款复核结果无法确认', ref: record.approvalRef });
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(record);
}
