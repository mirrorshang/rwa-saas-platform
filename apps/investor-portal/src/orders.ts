import { basePath, type Channel } from './domain.ts';
import type { AccountRecord } from './account.ts';
import { orderComplete, orderIsExpired, orderVisibleTo, type MockOrder, type MockException, type MockRefund } from './subscription.ts';

export const ownOrders = (orders: readonly MockOrder[], account: AccountRecord | null, channel: Channel) =>
  account ? orders.filter(order => orderVisibleTo(order,account,channel)).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) : [];

export const orderStatus = (order: MockOrder, now: number): string => {
  if (order.refund === 'confirmed') return '退款已核实到账 · Mock';
  if (order.refund === 'processing') return '退款处理中 · Mock';
  if (order.refund === 'under-review') return '退款资格待核实 · Mock';
  if (order.exception && order.exception !== 'none') return '异常处理中 · Mock';
  if (order.payment === 'failed') return '付款失败 · Mock';
  if (order.payment === 'unknown') return '付款状态待核实 · Mock';
  if (order.payment === 'not-started') return orderIsExpired(order,now) ? '已过期 · Mock' : '待付款 · Mock';
  if (orderComplete(order)) return '已完成 · Mock';
  if (order.payment === 'broadcast') return '付款核对中 · Mock';
  return '履约处理中 · Mock';
};

export const refundStatus = (order: MockOrder): string => ({
  none:'无已核实退款事实',
  'under-review':'退款资格待核实 · Mock',
  processing:'退款处理中 · Mock',
  confirmed:'退款已核实到账 · Mock'
})[order.refund || 'none'];

export const exceptionStatus = (order: MockOrder): string => ({
  none:'无已记录异常', rollback:'交易回滚 · Mock',
  'fulfillment-failed':'履约异常 · Mock', reorg:'链上结果待核实 · Mock'
})[order.exception || 'none'];

export const orderDetailUrl = (channel: Channel, orderId: string) =>
  basePath(channel) + '/investments/orders/' + encodeURIComponent(orderId);

export type DemoOrderScenario = 'normal' | 'rollback' | 'reorg' | 'fulfillment-failed' | 'refund-review' | 'refund-processing' | 'refund-confirmed';
export const applyDemoOrderScenario = (order: MockOrder, scenario: DemoOrderScenario, now: string): MockOrder => {
  if (scenario === 'normal') return { ...order, exception:'none', refund:'none', refundReference:undefined, updatedAt:now };
  if (scenario === 'rollback') return { ...order, payment:'failed', allocation:'pending', registration:'pending', delivery:'pending', exception:'rollback', refund:'none', refundReference:undefined, updatedAt:now };
  if (scenario === 'reorg') return { ...order, payment:'unknown', allocation:'pending', registration:'pending', delivery:'pending', exception:'reorg', refund:'none', refundReference:undefined, updatedAt:now };
  if (order.payment !== 'matched') return order;
  const refund: MockRefund = scenario === 'refund-review' ? 'under-review' : scenario === 'refund-processing' ? 'processing' : scenario === 'refund-confirmed' ? 'confirmed' : 'none';
  const exception: MockException = 'fulfillment-failed';
  return { ...order, exception, refund, delivery:'unknown', refundReference:refund === 'none' ? undefined : 'Mock-REF-'+order.requestId, updatedAt:now };
};
