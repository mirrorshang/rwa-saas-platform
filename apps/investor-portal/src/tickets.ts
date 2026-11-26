import { basePath, type Channel } from './domain.ts';
import type { AccountRecord } from './account.ts';
import { orderVisibleTo, type MockOrder } from './subscription.ts';

export const ticketCategories = ['订单付款','钱包','KYC','收益持仓','披露','其他'] as const;
export type TicketCategory = typeof ticketCategories[number];
export type TicketStatus = 'pending' | 'processing' | 'awaiting-user' | 'resolved';
export type TicketReply = { author:'investor'|'support-mock'; message:string; at:string };
export type MockTicket = {
  id:string; accountId:string; channelPath:string; email:string;
  category:TicketCategory; orderId?:string; offeringId?:string;
  description:string; transactionHash?:string; screenshotName?:string;
  status:TicketStatus; replies:TicketReply[]; createdAt:string; updatedAt:string;
};

export const ticketKey = (id:string) => 'rwa-mock-ticket:' + encodeURIComponent(id);
export const ticketVisibleTo = (ticket:MockTicket, account:AccountRecord, channel:Channel) =>
  ticket.accountId === account.id && ticket.channelPath === basePath(channel);
export const ticketStatusLabel = (status:TicketStatus) => ({pending:'待处理',processing:'处理中','awaiting-user':'待用户回复',resolved:'已解决'})[status];
export const ownTickets = (tickets:readonly MockTicket[],account:AccountRecord|null,channel:Channel) =>
  account ? tickets.filter(ticket => ticketVisibleTo(ticket,account,channel)).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
export const readAllTickets = ():MockTicket[] => {
  const result:MockTicket[] = [];
  for(let index=0;index<localStorage.length;index++) {
    const key=localStorage.key(index);
    if(!key?.startsWith('rwa-mock-ticket:')) continue;
    try { const ticket=JSON.parse(localStorage.getItem(key)||'null') as MockTicket|null; if(ticket?.id&&ticket?.accountId) result.push(ticket); } catch { /* Ignore invalid local Mock records. */ }
  }
  return result;
};
export const saveTicket = (ticket:MockTicket) => localStorage.setItem(ticketKey(ticket.id),JSON.stringify(ticket));

export const createTicket = (account:AccountRecord|null,channel:Channel,category:TicketCategory,description:string,orders:readonly MockOrder[],now:string,id:string,orderId?:string,offeringId?:string,transactionHash?:string,screenshotName?:string): {ticket?:MockTicket;error?:string} => {
  if(!account) return {error:'请先登录当前渠道账户'};
  if(!description.trim()) return {error:'请填写问题描述'};
  if(description.trim().length>2000) return {error:'问题描述不能超过 2000 字'};
  if(orderId && !orders.some(order => order.id===orderId && orderVisibleTo(order,account,channel))) return {error:'关联订单不属于当前账户'};
  if(transactionHash && !/^0x[0-9a-fA-F]{64}$/.test(transactionHash.trim())) return {error:'交易哈希格式不正确'};
  return {ticket:{id,accountId:account.id,channelPath:basePath(channel),email:account.email,category,orderId,offeringId,description:description.trim(),transactionHash:transactionHash?.trim()||undefined,screenshotName:screenshotName||undefined,status:'pending',replies:[],createdAt:now,updatedAt:now}};
};
export const replyToTicket = (ticket:MockTicket,account:AccountRecord,channel:Channel,message:string,now:string): {ticket?:MockTicket;error?:string} => {
  if(!ticketVisibleTo(ticket,account,channel)) return {error:'工单不属于当前账户'};
  if(!message.trim()) return {error:'请填写回复内容'};
  if(ticket.status==='resolved') return {error:'已解决的工单不可直接回复，请提交新工单'};
  return {ticket:{...ticket,replies:[...ticket.replies,{author:'investor',message:message.trim(),at:now}],status:'pending',updatedAt:now}};
};
export const applyDemoTicketStatus = (ticket:MockTicket,status:TicketStatus,now:string,reply?:string):MockTicket => ({
  ...ticket,status,updatedAt:now,replies:reply?.trim()?[...ticket.replies,{author:'support-mock',message:reply.trim(),at:now}]:ticket.replies
});
