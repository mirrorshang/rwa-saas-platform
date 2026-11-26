import { basePath, type Channel, type Offering } from './domain.ts';
import type { AccountRecord } from './account.ts';
import { orderVisibleTo, type MockOrder } from './subscription.ts';

export type Holding = { order:MockOrder; offering:Offering };
export const ownHoldings = (orders:readonly MockOrder[], account:AccountRecord|null, channel:Channel, offerings:readonly Offering[]):Holding[] =>
  account ? orders.filter(order=>orderVisibleTo(order,account,channel)&&order.registration==='confirmed').map(order=>({order,offering:offerings.find(item=>item.id===order.offeringId)})).filter((item):item is Holding=>!!item.offering).sort((a,b)=>b.order.updatedAt.localeCompare(a.order.updatedAt)) : [];
export const holdingReconciliation = (holding:Holding) =>
  holding.order.delivery==='confirmed' ? 'Mock 数量匹配；法定对账待核实' : '登记与 Token 交付待对账';
export const holdingNeedsReview = (holding:Holding) =>
  (!!holding.order.exception && holding.order.exception!=='none') || (!!holding.order.refund && holding.order.refund!=='none');
export const maskedHolder = (account:AccountRecord) => {
  const [name,domain]=account.email.split('@');
  return name.slice(0,2)+'***@'+domain;
};

export type DistributionKind = 'dividend'|'interest'|'principal'|'participation';
export type DistributionState = 'planned'|'confirmed'|'funded'|'claimable'|'processing'|'paid'|'unknown';
export type DistributionMethod = 'undecided'|'claim'|'push'|'external';
export type MockDistribution = {
  id:string; accountId:string; channelPath:string; orderId:string; offeringId:string; issuerId:string;
  kind:DistributionKind; state:DistributionState; method:DistributionMethod;
  period:string; recordDate?:string; dueDate?:string; actualAt?:string;
  grossCents:number|null; deductionsCents:number|null; legalBasis:string;
  requestId?:string; transactionReference?:string; createdAt:string; updatedAt:string;
};

export const distributionKey = (id:string) => 'rwa-mock-distribution:'+encodeURIComponent(id);
export const distributionKindLabel = (kind:DistributionKind) => ({dividend:'股权股息',interest:'债权利息',principal:'债权本金偿还',participation:'收益参与分配'})[kind];
export const distributionStateLabel = (state:DistributionState) => ({planned:'计划待核实',confirmed:'金额已确认 · Mock',funded:'已注资 · Mock',claimable:'可领取 · Mock',processing:'领取/支付处理中 · Mock',paid:'已支付 · Mock',unknown:'结果待核实 · Mock'})[state];
export const distributionMethodLabel = (method:DistributionMethod) => ({undecided:'待核实',claim:'Claim · Mock',push:'Push · Mock',external:'外部付款 · Mock'})[method];
export const kindForRight = (right:string):DistributionKind[] => right==='债权'?['interest','principal']:right==='股权'?['dividend']:['participation'];
export const distributionVisibleTo = (item:MockDistribution,account:AccountRecord,channel:Channel) => item.accountId===account.id&&item.channelPath===basePath(channel);
export const readAllDistributions = ():MockDistribution[] => {
  const result:MockDistribution[]=[];
  for(let index=0;index<localStorage.length;index++) {
    const key=localStorage.key(index);
    if(!key?.startsWith('rwa-mock-distribution:')) continue;
    try { const item=JSON.parse(localStorage.getItem(key)||'null') as MockDistribution|null; if(item?.id&&item?.accountId) result.push(item); } catch { /* Ignore corrupt local Mock record. */ }
  }
  return result;
};
export const saveDistribution = (item:MockDistribution) => localStorage.setItem(distributionKey(item.id),JSON.stringify(item));
export const ownDistributions = (items:readonly MockDistribution[],account:AccountRecord|null,channel:Channel,holdings:readonly Holding[]) =>
  account ? items.filter(item=>distributionVisibleTo(item,account,channel)&&holdings.some(holding=>holding.order.id===item.orderId&&holding.offering.id===item.offeringId)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)) : [];
export const createDemoDistribution = (account:AccountRecord|null,channel:Channel,holding:Holding|undefined,kind:DistributionKind,method:DistributionMethod,grossCents:number|null,deductionsCents:number|null,now:string,id:string):{item?:MockDistribution;error?:string} => {
  if(!account||!holding||!orderVisibleTo(holding.order,account,channel)) return {error:'当前账户无关联有效 Mock 持仓'};
  if(holding.order.payment!=='matched'||holding.order.registration!=='confirmed'||(holding.order.exception&&holding.order.exception!=='none')||(holding.order.refund&&holding.order.refund!=='none')) return {error:'原订单权益状态待核实，不能创建分配演示'};
  if(!kindForRight(holding.offering.right).includes(kind)) return {error:'事件类型与权益结构不匹配'};
  if(grossCents!==null&&(!Number.isSafeInteger(grossCents)||grossCents<0)) return {error:'演示金额无效'};
  if(deductionsCents!==null&&(!Number.isSafeInteger(deductionsCents)||deductionsCents<0||grossCents===null||deductionsCents>grossCents)) return {error:'扣项金额无效'};
  return {item:{id,accountId:account.id,channelPath:basePath(channel),orderId:holding.order.id,offeringId:holding.offering.id,issuerId:holding.offering.issuerId,kind,state:'planned',method,period:'待核实',grossCents,deductionsCents,legalBasis:'仅 Mock 演示；决议、合同及实际可分配金额须另行核实',createdAt:now,updatedAt:now}};
};
export const distributionAmounts = (item:MockDistribution) => {
  const net=item.grossCents==null||item.deductionsCents==null?null:item.grossCents-item.deductionsCents;
  const confirmed=item.state==='planned'?null:net;
  const funded=item.state==='unknown'?null:['funded','claimable','processing','paid'].includes(item.state)?net:0;
  const claimable=item.state==='claimable'&&item.method==='claim'?net:0;
  const paid=item.state==='paid'?net:item.state==='unknown'?null:0;
  const unpaid=confirmed==null||paid==null?null:confirmed-paid;
  return {net,confirmed,funded,claimable,paid,unpaid};
};
export const beginMockClaim = (item:MockDistribution,now:string,requestId:string):{item?:MockDistribution;error?:string} => {
  if(item.method!=='claim'||item.state!=='claimable') return {error:'当前事件没有可执行的 Mock 领取'};
  return {item:{...item,state:'processing',requestId,updatedAt:now}};
};
export const applyDemoDistributionState = (item:MockDistribution,state:DistributionState,now:string):MockDistribution => {
  if(state!=='planned'&&state!=='unknown'&&distributionAmounts(item).net==null) return item;
  if(state==='claimable'&&item.method!=='claim') return item;
  return {...item,state,actualAt:state==='paid'?now:undefined,transactionReference:state==='paid'?'Mock-PAY-'+item.id:item.transactionReference,updatedAt:now};
};
export const paidIncomeCents = (items:readonly MockDistribution[]) => items.filter(item=>item.kind!=='principal'&&item.state==='paid').reduce((total,item)=>total+(distributionAmounts(item).paid||0),0);
export const paidPrincipalCents = (items:readonly MockDistribution[]) => items.filter(item=>item.kind==='principal'&&item.state==='paid').reduce((total,item)=>total+(distributionAmounts(item).paid||0),0);
