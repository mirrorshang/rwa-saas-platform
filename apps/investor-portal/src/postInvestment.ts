import { basePath, type Channel, type Offering } from './domain.ts';
import type { AccountRecord } from './account.ts';
import { orderVisibleTo, readAllOrders, type MockOrder } from './subscription.ts';

export type Holding = { order: MockOrder; offering: Offering };
export const ownHoldings = (orders: readonly MockOrder[], account: AccountRecord | null, channel: Channel, offerings: readonly Offering[]): Holding[] =>
  account ? orders.filter(order => orderVisibleTo(order, account, channel) && order.registration === 'confirmed').map(order => ({ order, offering: offerings.find(item => item.id === order.offeringId) })).filter((item): item is Holding => !!item.offering).sort((a, b) => b.order.updatedAt.localeCompare(a.order.updatedAt)) : [];
export const holdingReconciliation = (holding: Holding) =>
  holding.order.delivery === 'confirmed' ? 'Mock 数量匹配；法定对账待核实' : '登记与 Token 交付待对账';
export const holdingNeedsReview = (holding: Holding) =>
  (!!holding.order.exception && holding.order.exception !== 'none') || (!!holding.order.refund && holding.order.refund !== 'none');
export const maskedHolder = (account: AccountRecord) => {
  const [name, domain] = account.email.split('@');
  return name.slice(0, 2) + '***@' + domain;
};

export type DistributionKind = 'dividend' | 'interest' | 'principal' | 'participation';
export type DistributionState = 'planned' | 'confirmed' | 'funded' | 'claimable' | 'processing' | 'paid' | 'unknown';
export type DistributionMethod = 'undecided' | 'claim' | 'push' | 'external';
export type MockDistribution = {
  id: string; accountId: string; channelPath: string; orderId: string; offeringId: string; issuerId: string;
  kind: DistributionKind; state: DistributionState; method: DistributionMethod;
  period: string; recordDate?: string; dueDate?: string; actualAt?: string;
  grossCents: number | null; deductionsCents: number | null; legalBasis: string;
  requestId?: string; transactionReference?: string; principalBasisId?: string; createdAt: string; updatedAt: string;
};

export const distributionKey = (id: string) => 'rwa-mock-distribution:' + encodeURIComponent(id);
export const distributionKindLabel = (kind: DistributionKind) => ({ dividend: '股权股息', interest: '债权利息', principal: '债权本金偿还', participation: '收益参与分配' })[kind];
export const distributionStateLabel = (state: DistributionState) => ({ planned: '计划待核实', confirmed: '金额已确认 · Mock', funded: '已注资 · Mock', claimable: '可领取 · Mock', processing: '领取/支付处理中 · Mock', paid: '已支付 · Mock', unknown: '结果待核实 · Mock' })[state];
export const distributionMethodLabel = (method: DistributionMethod) => ({ undecided: '待核实', claim: 'Claim · Mock', push: 'Push · Mock', external: '外部付款 · Mock' })[method];
export const kindForRight = (right: string): DistributionKind[] => right === '债权' ? ['interest', 'principal'] : right === '股权' ? ['dividend'] : ['participation'];
export const distributionVisibleTo = (item: MockDistribution, account: AccountRecord, channel: Channel) => item.accountId === account.id && item.channelPath === basePath(channel);

// This is an explicitly entered test ledger. The subscription price and the underlying loan amount never seed it.
export type MockPrincipalBasis = {
  id: string; mock: true; accountId: string; channelPath: string; orderId: string; offeringId: string;
  originalDebtSource: string; testPrincipalCents: number; repaidCents: number; remainingCents: number;
  lastRepaymentCents: number; asOf: string;
};
export const principalBasisKey = (orderId: string) => 'rwa-mock-principal-basis:' + encodeURIComponent(orderId);
export const validPrincipalBasis = (basis: MockPrincipalBasis | null | undefined): basis is MockPrincipalBasis =>
  !!basis && basis.mock === true && !!basis.id && !!basis.accountId && !!basis.channelPath && !!basis.orderId && !!basis.offeringId &&
  typeof basis.originalDebtSource === 'string' && !!basis.originalDebtSource.trim() && typeof basis.asOf === 'string' && Number.isFinite(Date.parse(basis.asOf)) &&
  Number.isSafeInteger(basis.testPrincipalCents) && basis.testPrincipalCents > 0 &&
  Number.isSafeInteger(basis.repaidCents) && basis.repaidCents >= 0 &&
  Number.isSafeInteger(basis.remainingCents) && basis.remainingCents >= 0 &&
  Number.isSafeInteger(basis.lastRepaymentCents) && basis.lastRepaymentCents >= 0 &&
  basis.repaidCents + basis.remainingCents === basis.testPrincipalCents && basis.lastRepaymentCents <= basis.repaidCents;
export const readPrincipalBasis = (orderId: string): MockPrincipalBasis | null => {
  try {
    const basis = JSON.parse(localStorage.getItem(principalBasisKey(orderId)) || 'null') as MockPrincipalBasis | null;
    return validPrincipalBasis(basis) && basis.id === orderId && basis.orderId === orderId ? basis : null;
  } catch { return null; }
};
export const savePrincipalBasis = (basis: MockPrincipalBasis) => localStorage.setItem(principalBasisKey(basis.orderId), JSON.stringify(basis));
export const createMockPrincipalBasis = (account: AccountRecord | null, channel: Channel, holding: Holding | undefined, source: string, cents: number, now: string, existing: MockPrincipalBasis | null, events: readonly MockDistribution[]): { basis?: MockPrincipalBasis; error?: string } => {
  if (!account || !holding || !orderVisibleTo(holding.order, account, channel) || holding.offering.id !== holding.order.offeringId || holding.offering.right !== '债权') return { error: '当前账户无有效债权 Mock 持仓' };
  if (holding.order.payment !== 'matched' || holding.order.registration !== 'confirmed' || holdingNeedsReview(holding)) return { error: '原订单权益状态待核实，不能建立本金测试依据' };
  if (existing || events.some(item => item.orderId === holding.order.id && item.kind === 'principal' && item.state === 'paid')) return { error: '已有本金依据或历史已付本金事件，不能覆盖' };
  if (!source.trim() || !Number.isSafeInteger(cents) || cents <= 0 || !Number.isFinite(Date.parse(now))) return { error: '请填写 Mock 原始债权来源、正数测试本金及核对时点' };
  return { basis: { id: holding.order.id, mock: true, accountId: account.id, channelPath: basePath(channel), orderId: holding.order.id, offeringId: holding.offering.id, originalDebtSource: source.trim(), testPrincipalCents: cents, repaidCents: 0, remainingCents: cents, lastRepaymentCents: 0, asOf: now } };
};

export const readAllDistributions = (): MockDistribution[] => {
  const result: MockDistribution[] = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith('rwa-mock-distribution:')) continue;
    try {
      const item = JSON.parse(localStorage.getItem(key) || 'null') as MockDistribution | null;
      if (!item?.id || !item?.accountId) continue;
      // Old or damaged principal records must not be presented as verified payments.
      if (item.kind === 'principal' && item.state === 'paid') {
        const basis = readPrincipalBasis(item.orderId);
        result.push(basis && item.principalBasisId === basis.id && item.accountId === basis.accountId && item.channelPath === basis.channelPath && item.offeringId === basis.offeringId ? item : { ...item, state: 'unknown' });
      } else result.push(item);
    } catch { /* Ignore corrupt local Mock record. */ }
  }
  return result;
};
export const saveDistribution = (item: MockDistribution) => localStorage.setItem(distributionKey(item.id), JSON.stringify(item));
export const ownDistributions = (items: readonly MockDistribution[], account: AccountRecord | null, channel: Channel, holdings: readonly Holding[]) =>
  account ? items.filter(item => distributionVisibleTo(item, account, channel) && holdings.some(holding => holding.order.id === item.orderId && holding.offering.id === item.offeringId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
export const createDemoDistribution = (account: AccountRecord | null, channel: Channel, holding: Holding | undefined, kind: DistributionKind, method: DistributionMethod, grossCents: number | null, deductionsCents: number | null, now: string, id: string): { item?: MockDistribution; error?: string } => {
  if (!account || !holding || !orderVisibleTo(holding.order, account, channel)) return { error: '当前账户无关联有效 Mock 持仓' };
  if (holding.order.payment !== 'matched' || holding.order.registration !== 'confirmed' || holdingNeedsReview(holding)) return { error: '原订单权益状态待核实，不能创建分配演示' };
  if (!kindForRight(holding.offering.right).includes(kind)) return { error: '事件类型与权益结构不匹配' };
  if (grossCents !== null && (!Number.isSafeInteger(grossCents) || grossCents < 0)) return { error: '演示金额无效' };
  if (deductionsCents !== null && (!Number.isSafeInteger(deductionsCents) || deductionsCents < 0 || grossCents === null || deductionsCents > grossCents)) return { error: '扣项金额无效' };
  return { item: { id, accountId: account.id, channelPath: basePath(channel), orderId: holding.order.id, offeringId: holding.offering.id, issuerId: holding.offering.issuerId, kind, state: 'planned', method, period: '待核实', grossCents, deductionsCents, legalBasis: '仅 Mock 演示；决议、合同及实际可分配金额须另行核实', createdAt: now, updatedAt: now } };
};
export const distributionAmounts = (item: MockDistribution) => {
  const net = item.grossCents == null || item.deductionsCents == null ? null : item.grossCents - item.deductionsCents;
  const confirmed = item.state === 'planned' ? null : net;
  const funded = item.state === 'unknown' ? null : ['funded', 'claimable', 'processing', 'paid'].includes(item.state) ? net : 0;
  const claimable = item.state === 'claimable' && item.method === 'claim' ? net : 0;
  const paid = item.state === 'paid' ? net : item.state === 'unknown' ? null : 0;
  const unpaid = confirmed == null || paid == null ? null : confirmed - paid;
  return { net, confirmed, funded, claimable, paid, unpaid };
};

export const claimBlockReason = (item: MockDistribution, account: AccountRecord | null, channel: Channel, holding: Holding | undefined): string | null => {
  if (!account || !distributionVisibleTo(item, account, channel) || !holding || !orderVisibleTo(holding.order, account, channel) || holding.order.id !== item.orderId || holding.offering.id !== item.offeringId || holding.order.offeringId !== item.offeringId) return '当前账户或渠道无关联有效 Mock 持仓';
  if (holding.order.payment !== 'matched' || holding.order.registration !== 'confirmed') return '原订单付款或法定登记状态待核实，不能领取';
  if (holdingNeedsReview(holding)) return '原订单存在异常或退款待核状态，分配资格待核实，不能领取';
  if (item.grossCents == null || item.deductionsCents == null || !Number.isSafeInteger(item.grossCents) || !Number.isSafeInteger(item.deductionsCents) || item.deductionsCents < 0 || item.grossCents <= item.deductionsCents) return '领取金额无效或待核实，不能领取';
  if (item.requestId) return '原领取请求已存在，请查询原请求，不能覆盖或重复发起';
  if (item.method !== 'claim' || item.state !== 'claimable') return '当前事件没有可执行的 Mock 领取';
  return null;
};
export const beginMockClaim = (item: MockDistribution, account: AccountRecord | null, channel: Channel, holding: Holding | undefined, now: string, requestId: string): { item?: MockDistribution; error?: string } => {
  const error = claimBlockReason(item, account, channel, holding);
  return error ? { error } : { item: { ...item, state: 'processing', requestId, updatedAt: now } };
};
const activeClaimOperations = new Set<string>();
export const startMockClaim = (account: AccountRecord | null, channel: Channel, offering: Offering, eventId: string, now: string, makeRequestId: () => string): { item?: MockDistribution; error?: string } => {
  const lockKey = basePath(channel) + ':' + eventId;
  if (activeClaimOperations.has(lockKey)) return { error: '原领取请求正在处理，请查询原请求' };
  activeClaimOperations.add(lockKey);
  try {
    const item = readAllDistributions().find(value => value.id === eventId);
    if (!item) return { error: '原收益事件待核实' };
    const order = readAllOrders().find(value => value.id === item.orderId);
    const holding = order && order.offeringId === offering.id ? { order, offering } : undefined;
    const error = claimBlockReason(item, account, channel, holding);
    if (error) return { item, error };
    const result = beginMockClaim(item, account, channel, holding, now, makeRequestId());
    if (result.item) saveDistribution(result.item);
    return result;
  } finally { activeClaimOperations.delete(lockKey); }
};

export const applyDemoDistributionState = (item: MockDistribution, state: DistributionState, now: string): MockDistribution => {
  if (item.state === 'paid' && state !== 'paid') return item;
  if (item.requestId && state === 'claimable') return item;
  // Principal settlement is only available through payMockPrincipal, which checks the Mock basis ledger.
  if (item.kind === 'principal' && (state === 'paid' || item.state === 'paid')) return item;
  if (state !== 'planned' && state !== 'unknown' && distributionAmounts(item).net == null) return item;
  if (state === 'claimable' && item.method !== 'claim') return item;
  return { ...item, state, actualAt: state === 'paid' ? now : undefined, transactionReference: state === 'paid' ? 'Mock-PAY-' + item.id : item.transactionReference, updatedAt: now };
};
export const payMockPrincipal = (account: AccountRecord | null, channel: Channel, offering: Offering, eventId: string, now: string): { item?: MockDistribution; basis?: MockPrincipalBasis; error?: string } => {
  const events = readAllDistributions();
  const item = events.find(value => value.id === eventId);
  if (!item || item.kind !== 'principal' || !account || !distributionVisibleTo(item, account, channel) || item.offeringId !== offering.id || offering.right !== '债权') return { error: '当前账户无有效债权本金事件' };
  const order = readAllOrders().find(value => value.id === item.orderId);
  const holding = order && order.offeringId === offering.id ? { order, offering } : undefined;
  if (!holding || !orderVisibleTo(holding.order, account, channel) || holding.order.payment !== 'matched' || holding.order.registration !== 'confirmed' || holdingNeedsReview(holding)) return { error: '原订单权益状态待核实，不能标记本金已付' };
  const basis = readPrincipalBasis(item.orderId);
  if (!basis || basis.accountId !== account.id || basis.channelPath !== basePath(channel) || basis.offeringId !== item.offeringId) return { error: '缺少有效 Mock 本金依据；本金待核实，不能标记已支付' };
  const paidEvents = events.filter(value => value.kind === 'principal' && value.orderId === item.orderId && value.state === 'paid');
  const paidTotal = paidEvents.reduce((total, value) => total + (distributionAmounts(value).paid || 0), 0);
  if (!Number.isSafeInteger(paidTotal) || paidTotal !== basis.repaidCents) return { error: 'Mock 本金账与已付事件不一致，需核对原记录' };
  if (item.state === 'paid') return item.principalBasisId === basis.id ? { item, basis } : { error: '已付事件缺少有效 Mock 本金依据' };
  const amount = distributionAmounts(item).net;
  if (!Number.isSafeInteger(amount) || amount == null || amount <= 0 || item.deductionsCents !== 0) return { error: '本次偿还金额无效或待核实' };
  if (amount > basis.remainingCents) return { error: '本次偿还金额超过 Mock 剩余本金，拒绝标记已支付' };
  const nextBasis: MockPrincipalBasis = { ...basis, repaidCents: basis.repaidCents + amount, remainingCents: basis.remainingCents - amount, lastRepaymentCents: amount, asOf: now };
  const nextItem: MockDistribution = { ...item, state: 'paid', principalBasisId: basis.id, actualAt: now, transactionReference: 'Mock-PAY-' + item.id, updatedAt: now };
  savePrincipalBasis(nextBasis);
  saveDistribution(nextItem);
  return { item: nextItem, basis: nextBasis };
};

export const paidIncomeCents = (items: readonly MockDistribution[]) => items.filter(item => item.kind !== 'principal' && item.state === 'paid').reduce((total, item) => total + (distributionAmounts(item).paid || 0), 0);
export const paidPrincipalCents = (items: readonly MockDistribution[]) => items.filter(item => item.kind === 'principal' && item.state === 'paid').reduce((total, item) => total + (distributionAmounts(item).paid || 0), 0);
