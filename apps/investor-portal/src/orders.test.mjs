import test from 'node:test';
import assert from 'node:assert/strict';
import { newAccount } from './account.ts';
import { applyDemoOrderScenario, orderStatus, ownOrders, refundStatus } from './orders.ts';
import { beginPayment, createOrder, orderComplete, resolvePayment } from './subscription.ts';
import { applyDemoTicketStatus, createTicket, ownTickets, replyToTicket, ticketStatusLabel } from './tickets.ts';

const m={kind:'m'};
const v={kind:'v',issuerSlug:'harbor'};
const now=Date.parse('2026-11-26T08:00:00Z');
const stamp=new Date(now).toISOString();
const offering={id:'residence-01',issuerId:'harbor',issuerSlug:'harbor',issuerName:'海岚资产',title:'住宅收益计划',category:'住宅物业',right:'收益参与权',status:'认购中',listing:'active',priceCents:10000,minimumCents:100000,maxUnits:500,availableUnits:25,documents:[{name:'认购协议',version:'Mock v1'}],terms:[]};
const account={...newAccount(m,'one@example.test',stamp,'op1'),kyc:'approved'};
const other={...newAccount(m,'two@example.test',stamp,'op2'),kyc:'approved'};
const vAccount={...newAccount(v,'one@example.test',stamp,'op3'),kyc:'approved'};
const order=createOrder(offering,account,m,10,'order-one',[],now,true).order;

test('order list and detail scope stay with account and channel',()=>{
  assert.deepEqual(ownOrders([order],account,m).map(item=>item.id),[order.id]);
  assert.deepEqual(ownOrders([order],other,m),[]);
  assert.deepEqual(ownOrders([order],vAccount,v),[]);
  assert.equal(orderStatus(order,now),'待付款 · Mock');
  assert.equal(orderStatus(order,now+16*60_000),'已过期 · Mock');
});

test('payment failure, rollback, unknown and refund remain distinct facts',()=>{
  const broadcast=beginPayment(order,'payer','receiver',stamp).order;
  assert.equal(orderStatus(broadcast,now),'付款核对中 · Mock');
  assert.equal(orderStatus(resolvePayment(broadcast,'unknown',stamp),now),'付款状态待核实 · Mock');
  const failed=resolvePayment(broadcast,'failed',stamp);
  assert.equal(orderStatus(failed,now),'付款失败 · Mock');
  assert.equal(refundStatus(failed),'无已核实退款事实');
  const rollback=applyDemoOrderScenario(broadcast,'rollback',stamp);
  assert.equal(rollback.payment,'failed');
  assert.equal(refundStatus(rollback),'无已核实退款事实');
  assert.equal(rollback.allocation,'pending');
  assert.equal(applyDemoOrderScenario(failed,'refund-confirmed',stamp),failed);
  const matched=resolvePayment(broadcast,'matched',stamp);
  const processing=applyDemoOrderScenario(matched,'refund-processing',stamp);
  assert.equal(orderStatus(processing,now),'退款处理中 · Mock');
  assert.equal(orderComplete(processing),false);
  const confirmed=applyDemoOrderScenario(matched,'refund-confirmed',stamp);
  assert.equal(orderStatus(confirmed,now),'退款已核实到账 · Mock');
  assert.equal(confirmed.refundReference,'Mock-REF-order-one');
});

test('ticket creation validates account, description, order ownership and transaction hash',()=>{
  assert.match(createTicket(null,m,'订单付款','问题',[order],stamp,'ticket-one').error,/登录/);
  assert.match(createTicket(account,m,'订单付款','  ',[order],stamp,'ticket-one').error,/描述/);
  assert.match(createTicket(other,m,'订单付款','问题',[order],stamp,'ticket-one',order.id).error,/不属于/);
  assert.match(createTicket(account,m,'订单付款','问题',[order],stamp,'ticket-one',order.id,offering.id,'invalid').error,/哈希/);
  const result=createTicket(account,m,'订单付款',' 原交易待核实 ',[order],stamp,'ticket-one',order.id,offering.id,undefined,'screen.png');
  assert.equal(result.ticket.description,'原交易待核实');
  assert.equal(result.ticket.screenshotName,'screen.png');
  assert.deepEqual(ownTickets([result.ticket],account,m).map(item=>item.id),['ticket-one']);
  assert.deepEqual(ownTickets([result.ticket],other,m),[]);
  assert.deepEqual(ownTickets([result.ticket],vAccount,v),[]);
});

test('ticket reply and closure never mutate financial order',()=>{
  const ticket=createTicket(account,m,'订单付款','请核对',[order],stamp,'ticket-two',order.id,offering.id).ticket;
  const original=structuredClone(order);
  const replied=replyToTicket(ticket,account,m,'补充交易时间',stamp).ticket;
  assert.equal(replied.status,'pending');
  assert.equal(replied.replies.length,1);
  const handled=applyDemoTicketStatus(replied,'awaiting-user',stamp,'请补充原交易引用');
  assert.equal(ticketStatusLabel(handled.status),'待用户回复');
  const closed=applyDemoTicketStatus(handled,'resolved',stamp);
  assert.match(replyToTicket(closed,account,m,'再次回复',stamp).error,/新工单/);
  assert.deepEqual(order,original);
});
