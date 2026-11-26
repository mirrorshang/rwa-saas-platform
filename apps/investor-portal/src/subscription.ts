import { basePath, minimumUnits, totalCents, type Channel, type Offering } from './domain.ts';
import type { AccountRecord } from './account.ts';

export type MockPayment = 'not-started' | 'broadcast' | 'matched' | 'failed' | 'unknown';
export type MockStage = 'pending' | 'confirmed' | 'unknown';
export type MockException = 'none' | 'rollback' | 'fulfillment-failed' | 'reorg';
export type MockRefund = 'none' | 'under-review' | 'processing' | 'confirmed';
export type MockOrder = {
  id: string; requestId: string; accountId: string; channelPath: string; issuerId: string; offeringId: string;
  units: number; priceCents: number; amountCents: number; createdAt: string; updatedAt: string; expiresAt: string;
  documents: {name:string;version:string}[]; mockConfirmedAt: string; legalSignatureValid: false;
  payment: MockPayment; paymentWallet?: string; tokenReceiver?: string; paymentReference?: string;
  allocation: MockStage; registration: MockStage; delivery: MockStage;
  exception?: MockException; refund?: MockRefund; refundReference?: string;
};
export type OrderResult = { order: MockOrder; error?: never } | { order?: never; error: string };
export const orderKey = (id: string) => 'rwa-mock-order:' + encodeURIComponent(id);
export const orderVisibleTo = (order: MockOrder, account: AccountRecord, channel: Channel) =>
  order.accountId === account.id && order.channelPath === basePath(channel);
export const orderIsExpired = (order: MockOrder, now: number) => order.payment === 'not-started' && Date.parse(order.expiresAt) <= now;
export const remainingUnits = (offering: Offering, orders: readonly MockOrder[], now: number) => {
  if (offering.availableUnits == null) return null;
  const reserved = orders.filter(order => order.offeringId === offering.id && order.payment !== 'failed' && !orderIsExpired(order,now)).reduce((total,order) => total + order.units,0);
  return Math.max(0,offering.availableUnits - reserved);
};
export const createOrder = (offering: Offering, account: AccountRecord | null, channel: Channel, units: number, requestId: string, orders: readonly MockOrder[], now: number, mockDocumentsConfirmed: boolean): OrderResult => {
  const existing = orders.find(order => order.requestId === requestId);
  if (existing) return account && orderVisibleTo(existing,account,channel) && existing.offeringId === offering.id ? { order: existing } : { error:'请求标识已关联其他认购' };
  if (!account) return { error:'请先登录当前渠道账户' };
  if (account.kyc !== 'approved') return { error:'正式提交前需完成当前渠道 KYC' };
  if (!mockDocumentsConfirmed) return { error:'请查看全部 Mock 文件正文并确认' };
  if (offering.status !== '认购中' || (channel.kind === 'm' && offering.listing !== 'active') || (channel.kind === 'v' && offering.issuerSlug !== channel.issuerSlug)) return { error:'当前渠道项目不可认购' };
  if (!Number.isSafeInteger(units) || units < minimumUnits(offering) || units > offering.maxUnits) return { error:'认购份数不符合最低额或单笔上限' };
  const remaining = remainingUnits(offering,orders,now);
  if (remaining == null) return { error:'可售容量待核实，无法创建待付款订单' };
  if (units > remaining) return { error:'当前可售容量不足' };
  const createdAt = new Date(now).toISOString();
  return { order: {
    id:'mock-'+requestId, requestId, accountId:account.id, channelPath:basePath(channel), issuerId:offering.issuerId, offeringId:offering.id,
    units, priceCents:offering.priceCents, amountCents:totalCents(String(units),offering), createdAt, updatedAt:createdAt,
    expiresAt:new Date(now+15*60_000).toISOString(), documents:offering.documents.map(document => ({...document})), mockConfirmedAt:createdAt, legalSignatureValid:false,
    payment:'not-started', allocation:'pending', registration:'pending', delivery:'pending', exception:'none', refund:'none'
  } };
};
export const beginPayment = (order: MockOrder, wallet: string, receiver: string, now: string): OrderResult => {
  if (order.payment !== 'not-started') return { error:'原付款操作已存在，请先核对状态' };
  if (!wallet || !receiver) return { error:'请分别确认付款钱包和 Token 接收地址' };
  if (Date.parse(order.expiresAt) <= Date.parse(now)) return { error:'未付款订单已过期，请重新报价' };
  return { order:{ ...order, payment:'broadcast', paymentWallet:wallet, tokenReceiver:receiver, paymentReference:'Mock-TX-'+order.requestId, updatedAt:now } };
};
export const resolvePayment = (order: MockOrder, result: 'matched' | 'failed' | 'unknown', now: string): MockOrder =>
  order.payment === 'broadcast' ? { ...order, payment:result, updatedAt:now } : order;
export const advanceFulfillment = (order: MockOrder, now: string): MockOrder => {
  if (order.payment !== 'matched' || (order.exception && order.exception !== 'none')) return order;
  if (order.allocation !== 'confirmed') return { ...order, allocation:'confirmed', updatedAt:now };
  if (order.registration !== 'confirmed') return { ...order, registration:'confirmed', updatedAt:now };
  if (order.delivery !== 'confirmed') return { ...order, delivery:'confirmed', updatedAt:now };
  return order;
};
export const orderComplete = (order: MockOrder) => (!order.exception || order.exception === 'none') && order.payment === 'matched' && order.allocation === 'confirmed' && order.registration === 'confirmed' && order.delivery === 'confirmed';
export const readAllOrders = (): MockOrder[] => {
  const result: MockOrder[] = [];
  for (let index=0; index<localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith('rwa-mock-order:')) continue;
    try { const order = JSON.parse(localStorage.getItem(key) || 'null') as MockOrder | null; if (order?.id && order?.offeringId) result.push(order); } catch { /* Ignore corrupt local Mock records. */ }
  }
  return result;
};
export const saveOrder = (order: MockOrder) => localStorage.setItem(orderKey(order.id),JSON.stringify(order));
export const reserveOrder = async (offering: Offering, account: AccountRecord | null, channel: Channel, units: number, requestId: string, mockDocumentsConfirmed: boolean): Promise<OrderResult> => {
  if (!navigator.locks) return { error:'当前浏览器不支持 Mock 容量锁，无法安全创建订单' };
  return navigator.locks.request('rwa-mock-capacity:'+offering.id,() => {
    const result = createOrder(offering,account,channel,units,requestId,readAllOrders(),Date.now(),mockDocumentsConfirmed);
    if (result.order) saveOrder(result.order);
    return result;
  });
};
