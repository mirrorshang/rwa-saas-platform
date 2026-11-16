import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';

export type PaymentFact = 'none' | 'awaiting' | 'pending' | 'final-matched' | 'difference' | 'refund-pending' | 'refunded' | 'unknown';
export type CapacityFact = 'none' | 'pending' | 'reserved' | 'protected' | 'allocated' | 'released' | 'unknown';
export type RegistrationFact = 'none' | 'pending' | 'effective' | 'difference' | 'unknown';
export type DeliveryFact = 'none' | 'pending' | 'confirmed' | 'failed' | 'unknown';
export type OrderProgress = 'pending-confirmation' | 'awaiting-payment' | 'payment-review' | 'fulfilling' | 'completed' | 'cancelled' | 'expired' | 'exception';
export type OrderQuickView = 'all' | 'attention' | 'processing' | 'completed' | 'closed';
export type OrderFilters = { search: string; assetId: string; offeringId: string; progress: OrderProgress | ''; payment: PaymentFact | ''; onlyIssues: boolean; quick: OrderQuickView; fromDate: string; toDate: string };
export type OrderEvent = { at: number; label: string; source: string; ref?: string };
export type CancellationReason = 'investor-withdrew' | 'duplicate' | 'other';
export type CancellationRequest = { id: string; reason: CancellationReason; note: string; at: number; status: 'pending' };
export type OrderQuoteSnapshot = {
  assetName: string; offeringName: string; instrumentName: string;
  minOrder: string; maxOrderTokens: string; investorCap: string; walletId: string;
  subscriptionDocument?: { id: string; name: string; version: number };
  riskDocuments: { id: string; name: string; version: number }[];
};
export type OrderRecord = {
  id: string; number: string; tenantId: string; investorId: string; investorRef: string;
  assetId: string; offeringId: string; offeringNumber: string; offeringVersion: number; instrumentVersion: number;
  quantity: string; unitPrice: string; amount: string; currency: 'U'; network: 'OP Mainnet'; createdAt: number; timezone: string;
  quoteStatus: 'pending' | 'valid' | 'expired' | 'unknown'; signatureStatus: 'pending' | 'signed' | 'failed' | 'unknown';
  payment: PaymentFact; capacity: CapacityFact; registration: RegistrationFact; delivery: DeliveryFact;
  paymentRef?: string; capacityRef?: string; registrationRef?: string; deliveryRef?: string;
  quoteSnapshot?: OrderQuoteSnapshot;
  cancelledAt?: number; expiredAt?: number; cancellationRequest?: CancellationRequest;
  anomaly?: { code: string; category: string; module: string; status: string; at: number };
  canCancelAuthoritative: boolean; events: OrderEvent[]; source: 'internal-sandbox';
  scenarioOfferingStatus?: 'hypothetical-sandbox';
};

const key = 'wdex-issuer-orders-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const readAll = (): Record<string, OrderRecord[]> | null => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, OrderRecord[]> : null;
  } catch { return null; }
};
export function readOrders(tenant: DemoTenant): OrderRecord[] | null {
  const id = scope(tenant);
  if (!id) return null;
  const all = readAll();
  const bucket = all?.[id];
  if (!all || (bucket !== undefined && !Array.isArray(bucket))) return null;
  return structuredClone((bucket || []).filter(item => item && item.tenantId === tenant.id));
}
export function addSandboxOrders(tenant: DemoTenant, records: OrderRecord[]): OrderRecord[] {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard') throw Error('当前企业不能准备认购流程示例。');
  if (records.some(item => item.tenantId !== tenant.id || item.source !== 'internal-sandbox' || exactOrderAmount(item.quantity, item.unitPrice) !== item.amount)) throw Error('认购流程示例引用或金额无效。');
  const all = readAll();
  if (!all || (all[id] !== undefined && !Array.isArray(all[id]))) throw Error('原订单资料无法读取，未写入新记录。');
  const existing = all[id] || [];
  const known = new Set(existing.map(item => item.id));
  all[id] = [...existing, ...records.filter(item => !known.has(item.id))];
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(all[id].filter(item => item.tenantId === tenant.id));
}
export function findOrder(tenant: DemoTenant, id: string): OrderRecord | null {
  return readOrders(tenant)?.find(item => item.id === id && item.tenantId === tenant.id) || null;
}
export function exactOrderAmount(quantity: string, price: string): string | null {
  if (!/^[1-9]\d*$/.test(quantity) || !/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(price)) return null;
  const [whole, fraction = ''] = price.split('.');
  const scaled = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
  if (scaled <= 0n) return null;
  const result = BigInt(quantity) * scaled;
  return `${result / 1_000_000n}${result % 1_000_000n ? `.${String(result % 1_000_000n).padStart(6, '0').replace(/0+$/, '')}` : ''}`;
}
export function orderBusinessDate(timestamp: number, timezone = 'Asia/Shanghai'): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
  const value = (kind: string) => parts.find(part => part.type === kind)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function filterOrders(records: OrderRecord[], filters: OrderFilters): OrderRecord[] {
  if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) return [];
  const search = filters.search.trim().toLowerCase();
  return records.filter(order => {
    const state = orderProgress(order);
    const quick = filters.quick === 'all' || (filters.quick === 'attention' && orderNeedsAttention(order)) ||
      (filters.quick === 'processing' && ['pending-confirmation', 'awaiting-payment', 'fulfilling'].includes(state)) ||
      (filters.quick === 'completed' && state === 'completed') || (filters.quick === 'closed' && ['cancelled', 'expired'].includes(state));
    const date = orderBusinessDate(order.createdAt, order.timezone);
    return quick && (!search || `${order.number} ${order.investorRef}`.toLowerCase().includes(search)) &&
      (!filters.assetId || order.assetId === filters.assetId) && (!filters.offeringId || order.offeringId === filters.offeringId) &&
      (!filters.progress || state === filters.progress) && (!filters.payment || order.payment === filters.payment) &&
      (!filters.onlyIssues || Boolean(order.anomaly) || ['unknown', 'difference'].includes(order.payment)) &&
      (!filters.fromDate || date >= filters.fromDate) && (!filters.toDate || date <= filters.toDate);
  }).sort((a, b) => b.createdAt - a.createdAt);
}
export function orderProgress(order: OrderRecord): OrderProgress {
  if (order.anomaly?.status === 'open' || order.payment === 'difference' || order.delivery === 'failed') return 'exception';
  if (order.payment === 'unknown' || order.payment === 'pending') return 'payment-review';
  if (order.cancelledAt) return 'cancelled';
  if (order.expiredAt) return 'expired';
  if (order.payment === 'final-matched' && order.delivery === 'confirmed') return 'completed';
  if (order.payment === 'final-matched') return 'fulfilling';
  if (order.quoteStatus === 'valid' && order.signatureStatus === 'signed' && order.capacity === 'reserved' && order.payment === 'awaiting') return 'awaiting-payment';
  return 'pending-confirmation';
}
export const orderProgressLabel: Record<OrderProgress, string> = {
  'pending-confirmation': '待确认', 'awaiting-payment': '待付款', 'payment-review': '付款核对中',
  fulfilling: '履约处理中', completed: '已完成', cancelled: '已取消', expired: '已过期', exception: '异常处理中',
};
export type OrderNextStep = { label: string; description: string; section: 'order-summary' | 'order-payment' | 'order-capacity' | 'order-registration' | 'order-delivery' | 'order-exception' };
export function orderNextStep(order: OrderRecord): OrderNextStep {
  const progress = orderProgress(order);
  if (progress === 'exception') return { label: '查看异常事项', description: '先核对原异常和责任模块，保留未确认的付款与权益状态。', section: 'order-exception' };
  if (progress === 'payment-review') return { label: '查看付款核对', description: '资金结果未最终确认，请查询原资金事件。', section: 'order-payment' };
  if (progress === 'cancelled' || progress === 'expired') return { label: '查看关闭与退款记录', description: '继续核对容量释放及迟到账风险。', section: 'order-exception' };
  if (progress === 'completed') return order.registration === 'effective'
    ? { label: '查看完成记录', description: '付款和 Token 交付已确认，法定登记另有有效记录。', section: 'order-exception' }
    : { label: '查看法定登记', description: '认购进度已完成，法定登记仍须独立核对。', section: 'order-registration' };
  if (order.payment === 'final-matched') return order.capacity === 'allocated'
    ? { label: '查看 Token 交付', description: '实收已确认，核对交付及其独立结果。', section: 'order-delivery' }
    : { label: '查看配售进度', description: '实收已确认，配售或容量仍需核对。', section: 'order-capacity' };
  if (progress === 'awaiting-payment') return { label: '查看付款进度', description: '等待投资者按有效指引完成付款，企业仅查看状态。', section: 'order-payment' };
  return { label: '查看订单前置条件', description: '核对报价、签署与容量预留的独立结果。', section: 'order-summary' };
}
export function orderNeedsAttention(order: OrderRecord): boolean {
  const state = orderProgress(order);
  return state === 'exception' || state === 'payment-review' || Boolean(order.cancellationRequest) ||
    order.capacity === 'protected' || order.capacity === 'unknown' ||
    (state === 'completed' && order.registration !== 'effective') ||
    order.registration === 'difference' || order.registration === 'unknown' || order.delivery === 'unknown';
}
export function canRequestOrderCancellation(tenant: DemoTenant, order: OrderRecord): boolean {
  return tenant.plan === 'Standard' && order.tenantId === tenant.id && order.canCancelAuthoritative &&
    orderProgress(order) === 'awaiting-payment' && order.payment === 'awaiting' && order.capacity === 'reserved' &&
    order.registration === 'none' && order.delivery === 'none' && !order.cancelledAt && !order.expiredAt && !order.cancellationRequest;
}
export function requestSandboxCancellation(tenant: DemoTenant, id: string, reason: CancellationReason, note: string, acknowledged: boolean): CancellationRequest {
  const bucket = scope(tenant);
  if (!bucket) throw Error('当前企业访问权限已失效，请重新登录。');
  if (!['investor-withdrew', 'duplicate', 'other'].includes(reason)) throw Error('请选择取消原因。');
  if (note.trim().length > 200) throw Error('备注最多 200 字。');
  if (!acknowledged) throw Error('请确认已核对当前订单状态。');
  const all = readAll();
  if (!all || (all[bucket] !== undefined && !Array.isArray(all[bucket]))) throw Error('原订单资料无法读取，取消申请未保存。');
  const record = all[bucket]?.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record) throw Error('订单不存在或无权访问。');
  if (record.cancellationRequest) return structuredClone(record.cancellationRequest);
  if (!canRequestOrderCancellation(tenant, record)) throw Error('订单状态已变化，请先核对最新付款、预留和权益状态。');
  const request: CancellationRequest = { id: crypto.randomUUID(), reason, note: note.trim(), at: Date.now(), status: 'pending' };
  record.cancellationRequest = request;
  record.events.push({ at: request.at, label: '本地记录取消申请，等待订单服务确认', source: '订单', ref: request.id });
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(request);
}
