import test from 'node:test';
import assert from 'node:assert/strict';
import { newAccount } from './account.ts';
import { allowedContentOfferings, announcements, messageReadKey, messagesFor } from './investorContent.ts';
import { applyDemoDistributionState, beginMockClaim, createDemoDistribution, distributionAmounts, holdingNeedsReview, kindForRight, ownDistributions, ownHoldings, paidIncomeCents, paidPrincipalCents } from './postInvestment.ts';
import { advanceFulfillment, beginPayment, createOrder, resolvePayment } from './subscription.ts';
import { createTicket } from './tickets.ts';

const m={kind:'m'},v={kind:'v',issuerSlug:'harbor'},cedar={kind:'v',issuerSlug:'cedar'};
const now=Date.parse('2026-11-26T08:00:00Z'),stamp=new Date(now).toISOString();
const residence={id:'residence-01',issuerId:'harbor',issuerSlug:'harbor',issuerName:'海岚资产',title:'住宅收益计划',category:'住宅物业',right:'收益参与权',status:'认购中',listing:'active',priceCents:10000,minimumCents:100000,maxUnits:500,availableUnits:500,documents:[{name:'认购协议',version:'Mock v1'}],terms:[],lockup:'以项目文件为准'};
const debt={...residence,id:'debt-01',issuerId:'cedar',issuerSlug:'cedar',right:'债权',title:'债权计划',category:'企业借款债权',priceCents:5000,minimumCents:50000};
const equity={...residence,id:'private-01',right:'股权',status:'即将开放',listing:'pending'};
const account={...newAccount(m,'one@example.test',stamp,'op1'),kyc:'approved'};
const other={...newAccount(m,'two@example.test',stamp,'op2'),kyc:'approved'};
const vAccount={...newAccount(v,'one@example.test',stamp,'op3'),kyc:'approved'};
const registered=(offering,id)=>{
  let order=createOrder(offering,account,m,10,id,[],now,true).order;
  order=beginPayment(order,'payer','receiver',stamp).order;
  order=resolvePayment(order,'matched',stamp);
  order=advanceFulfillment(order,stamp);
  return advanceFulfillment(order,new Date(now+1000).toISOString());
};
const residenceOrder=registered(residence,'residence-order');
const debtOrder=registered(debt,'debt-order');

test('holdings require own legal registration; token balance remains independent',()=>{
  let pending=createOrder(residence,account,m,10,'pending',[],now,true).order;
  assert.deepEqual(ownHoldings([pending],account,m,[residence]),[]);
  const holdings=ownHoldings([residenceOrder],account,m,[residence]);
  assert.equal(holdings.length,1);
  assert.equal(holdings[0].order.registrationEvidence,'Mock-REG-residence-order');
  assert.equal(holdings[0].order.delivery,'pending');
  assert.equal(holdingNeedsReview(holdings[0]),false);
  assert.equal(holdingNeedsReview({...holdings[0],order:{...residenceOrder,refund:'processing'}}),true);
  assert.deepEqual(ownHoldings([residenceOrder],other,m,[residence]),[]);
  assert.deepEqual(ownHoldings([residenceOrder],vAccount,v,[residence]),[]);
  const delivered=advanceFulfillment(residenceOrder,new Date(now+2000).toISOString());
  assert.equal(delivered.deliveryReference,'Mock-DEL-residence-order');
  assert.equal(delivered.registrationEvidence,residenceOrder.registrationEvidence);
});

test('distribution kinds follow rights and unresolved orders cannot create events',()=>{
  assert.deepEqual(kindForRight('债权'),['interest','principal']);
  assert.deepEqual(kindForRight('股权'),['dividend']);
  assert.deepEqual(kindForRight('收益参与权'),['participation']);
  const holding=ownHoldings([residenceOrder],account,m,[residence])[0];
  assert.match(createDemoDistribution(account,m,holding,'dividend','claim',1000,0,stamp,'wrong').error,/不匹配/);
  assert.match(createDemoDistribution(other,m,holding,'participation','claim',1000,0,stamp,'other').error,/无关联/);
  const exceptional={...holding,order:{...holding.order,exception:'fulfillment-failed'}};
  assert.match(createDemoDistribution(account,m,exceptional,'participation','claim',1000,0,stamp,'exception').error,/待核实/);
  const event=createDemoDistribution(account,m,holding,'participation','claim',1000,0,stamp,'event-one').item;
  assert.equal(event.state,'planned');
  assert.equal(distributionAmounts(event).confirmed,null);
  assert.equal(ownDistributions([event],account,m,[holding]).length,1);
  assert.equal(ownDistributions([event],other,m,[holding]).length,0);
});

test('confirmed, funded, claimable, processing and paid stay separate; principal excluded from income',()=>{
  const debtHolding=ownHoldings([debtOrder],account,m,[debt])[0];
  const interest=createDemoDistribution(account,m,debtHolding,'interest','claim',1000,100,stamp,'interest-one').item;
  const principal=createDemoDistribution(account,m,debtHolding,'principal','push',5000,0,stamp,'principal-one').item;
  assert.equal(distributionAmounts(interest).net,900);
  assert.equal(distributionAmounts(interest).confirmed,null);
  const confirmed=applyDemoDistributionState(interest,'confirmed',stamp);
  assert.equal(distributionAmounts(confirmed).confirmed,900);
  assert.equal(distributionAmounts(confirmed).funded,0);
  const funded=applyDemoDistributionState(confirmed,'funded',stamp);
  assert.equal(distributionAmounts(funded).funded,900);
  assert.equal(distributionAmounts(funded).claimable,0);
  const claimable=applyDemoDistributionState(funded,'claimable',stamp);
  assert.equal(distributionAmounts(claimable).claimable,900);
  assert.match(beginMockClaim(funded,account,m,debtHolding,stamp,'request-one').error,/没有可执行/);
  const processing=beginMockClaim(claimable,account,m,debtHolding,stamp,'request-one').item;
  assert.equal(processing.state,'processing');
  assert.match(beginMockClaim(processing,account,m,debtHolding,stamp,'request-two').error,/原领取请求已存在/);
  assert.equal(distributionAmounts(processing).paid,0);
  const paid=applyDemoDistributionState(processing,'paid',stamp);
  const paidPrincipal=applyDemoDistributionState(principal,'paid',stamp);
  assert.equal(paidPrincipal.state,'planned');
  assert.equal(paidIncomeCents([paid,paidPrincipal]),900);
  assert.equal(paidPrincipalCents([paid,paidPrincipal]),0);
  assert.equal(applyDemoDistributionState(principal,'claimable',stamp),principal);
  assert.equal(distributionAmounts(applyDemoDistributionState(interest,'unknown',stamp)).paid,null);
});

test('disclosures and messages respect public listing and historical account scope',()=>{
  const all=[residence,debt,equity];
  assert.deepEqual(allowedContentOfferings(all,m,null,[],true),[]);
  assert.deepEqual(allowedContentOfferings(all,m,account,[residenceOrder],true).map(item=>item.id),['residence-01']);
  assert.deepEqual(allowedContentOfferings(all,m,other,[residenceOrder],true),[]);
  assert.deepEqual(allowedContentOfferings(all,v,vAccount,[],false).map(item=>item.id),['residence-01','private-01']);
  assert.deepEqual(allowedContentOfferings(all,cedar,null,[],false).map(item=>item.id),['debt-01']);
  const ticket=createTicket(account,m,'订单付款','请核对',[residenceOrder],stamp,'ticket-one',residenceOrder.id,residence.id).ticket;
  const holding=ownHoldings([residenceOrder],account,m,[residence])[0];
  const event=createDemoDistribution(account,m,holding,'participation','undecided',null,null,stamp,'event-one').item;
  const messages=messagesFor(m,account,[residenceOrder],[ticket],[event],[residence],now);
  assert.ok(messages.some(item=>item.id==='order:'+residenceOrder.id));
  assert.ok(messages.some(item=>item.id==='ticket:ticket-one'));
  assert.ok(messages.some(item=>item.id==='distribution:event-one'));
  assert.ok(messages.some(item=>item.id==='announcement:'+announcements[0].id));
  assert.deepEqual(messagesFor(m,other,[residenceOrder],[ticket],[event],[],now),[]);
  assert.notEqual(messageReadKey(m,account,'order:x'),messageReadKey(v,vAccount,'order:x'));
});
