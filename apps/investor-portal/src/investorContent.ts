import { basePath, visibleOfferings, type Channel, type Offering } from './domain.ts';
import type { AccountRecord } from './account.ts';
import { orderVisibleTo, type MockOrder } from './subscription.ts';
import { distributionKindLabel, distributionStateLabel, type MockDistribution } from './postInvestment.ts';
import { orderStatus } from './orders.ts';
import { ticketStatusLabel, type MockTicket } from './tickets.ts';

export type MockAnnouncement = {id:string;offeringId:string;title:string;version:string;publishedAt:string;content:string};
export const announcements:MockAnnouncement[] = [
  {id:'residence-material-index',offeringId:'residence-01',title:'城市住宅项目资料索引 · Mock',version:'Mock v1.0',publishedAt:'2026-11-24',content:'本演示公告仅索引认购协议、权益条款及风险披露的 Mock 文件版本。不披露新的资产经营事实、收益金额或真实发行决定。'},
  {id:'debt-material-index',offeringId:'debt-01',title:'企业债权项目资料索引 · Mock',version:'Mock v1.0',publishedAt:'2026-11-23',content:'本演示公告仅索引认购协议、债权条款及风险披露的 Mock 文件版本。实际合同、债务履行和本息状态须以授权证据核实。'}
];
export const allowedContentOfferings = (all:readonly Offering[],channel:Channel,account:AccountRecord|null,orders:readonly MockOrder[],noListings=false):Offering[] => {
  const publicIds=new Set(visibleOfferings([...all],channel,noListings).map(item=>item.id));
  if(account) for(const order of orders) if(orderVisibleTo(order,account,channel)) publicIds.add(order.offeringId);
  return all.filter(item=>publicIds.has(item.id));
};
export type InvestorMessage = {id:string;title:string;category:string;summary:string;offeringId?:string;createdAt:string;updatedAt:string;link:string};
export const messageReadKey = (channel:Channel,account:AccountRecord,id:string) => 'rwa-mock-message-read:'+encodeURIComponent(basePath(channel))+':'+encodeURIComponent(account.id)+':'+encodeURIComponent(id);
export const messagesFor = (channel:Channel,account:AccountRecord|null,orders:readonly MockOrder[],tickets:readonly MockTicket[],distributions:readonly MockDistribution[],visible:readonly Offering[],now:number):InvestorMessage[] => {
  if(!account) return [];
  const root=basePath(channel),ids=new Set(visible.map(item=>item.id));
  const result:InvestorMessage[]=[];
  for(const order of orders) if(orderVisibleTo(order,account,channel)) result.push({id:'order:'+order.id,title:'认购订单状态 · Mock',category:'订单',summary:orderStatus(order,now),offeringId:order.offeringId,createdAt:order.createdAt,updatedAt:order.updatedAt,link:root+'/investments/orders/'+encodeURIComponent(order.id)});
  for(const ticket of tickets) if(ticket.accountId===account.id&&ticket.channelPath===root) result.push({id:'ticket:'+ticket.id,title:'客服工单更新 · Mock',category:'工单',summary:ticketStatusLabel(ticket.status),offeringId:ticket.offeringId,createdAt:ticket.createdAt,updatedAt:ticket.updatedAt,link:root+'/account/tickets/'+encodeURIComponent(ticket.id)});
  for(const item of distributions) if(item.accountId===account.id&&item.channelPath===root&&orders.some(order=>order.id===item.orderId&&order.offeringId===item.offeringId&&orderVisibleTo(order,account,channel)&&order.registration==='confirmed')) result.push({id:'distribution:'+item.id,title:distributionKindLabel(item.kind)+'状态 · Mock',category:item.kind==='principal'?'本金':'收益',summary:distributionStateLabel(item.state),offeringId:item.offeringId,createdAt:item.createdAt,updatedAt:item.updatedAt,link:root+'/investments/returns/'+encodeURIComponent(item.id)});
  for(const notice of announcements) if(ids.has(notice.offeringId)) result.push({id:'announcement:'+notice.id,title:notice.title,category:'公告',summary:notice.content,offeringId:notice.offeringId,createdAt:notice.publishedAt,updatedAt:notice.publishedAt,link:root+'/disclosures/announcements/'+notice.id});
  return result.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
};
