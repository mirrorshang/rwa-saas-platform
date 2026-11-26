import test from 'node:test';
import assert from 'node:assert/strict';
import { newAccount } from './account.ts';
import { advanceFulfillment, beginPayment, createOrder, orderComplete, orderVisibleTo, remainingUnits, resolvePayment } from './subscription.ts';
import { mockDocumentText } from './legalDocs.ts';

const m = {kind:'m'};
const v = {kind:'v',issuerSlug:'harbor'};
const now=Date.parse('2026-11-26T08:00:00Z');
const residence={id:'residence-01',issuerId:'harbor',issuerSlug:'harbor',issuerName:'海岚资产',title:'住宅收益计划',category:'住宅物业',right:'收益参与权',status:'认购中',listing:'active',priceCents:10000,minimumCents:100000,maxUnits:500,availableUnits:25,documents:[{name:'认购协议',version:'Mock v1'},{name:'权益条款',version:'Mock v1'},{name:'风险披露',version:'Mock v1'}],terms:[['收益来源','核实后的净收益']],risk:'经营收入存在波动'};
const mAccount={...newAccount(m,'same@example.test','now','op-m'),kyc:'approved'};
const otherMAccount={...newAccount(m,'other@example.test','now','op-m2'),kyc:'approved'};
const vAccount={...newAccount(v,'same@example.test','now','op-v'),kyc:'approved'};
test('readable legal Mock text keeps rights, risks and non-signature semantics',()=>{
  for(const document of residence.documents){
    const text=mockDocumentText(residence,document.name).join('\n');
    assert.ok(mockDocumentText(residence,document.name).length>=3);
    assert.match(text,/Mock/);
    assert.match(text,/不构成|不产生/);
  }
  assert.match(mockDocumentText(residence,'权益条款').join(''),/核实后的净收益/);
  assert.match(mockDocumentText(residence,'风险披露').join(''),/经营收入存在波动/);
});
test('order creation requires KYC, all documents, visibility and capacity',()=>{
  assert.match(createOrder(residence,null,m,10,'a',[],now,true).error,/登录/);
  assert.match(createOrder(residence,{...mAccount,kyc:'processing'},m,10,'a',[],now,true).error,/KYC/);
  assert.match(createOrder(residence,mAccount,m,10,'a',[],now,false).error,/文件/);
  assert.match(createOrder(residence,mAccount,m,26,'a',[],now,true).error,/容量/);
  assert.match(createOrder({...residence,listing:'pending'},mAccount,m,10,'a',[],now,true).error,/不可认购/);
  const first=createOrder(residence,mAccount,m,15,'first',[],now,true).order;
  assert.equal(first.legalSignatureValid,false);
  assert.equal(first.amountCents,150000);
  assert.equal(remainingUnits(residence,[first],now),10);
  assert.match(createOrder(residence,vAccount,v,11,'second',[first],now,true).error,/容量/);
  assert.equal(createOrder(residence,mAccount,m,15,'first',[first],now,true).order.id,first.id);
  assert.match(createOrder(residence,vAccount,v,15,'first',[first],now,true).error,/其他认购/);
  assert.equal(orderVisibleTo(first,mAccount,m),true);
  assert.equal(orderVisibleTo(first,vAccount,v),false);
  assert.equal(orderVisibleTo(first,otherMAccount,m),false);
  assert.match(createOrder(residence,otherMAccount,m,15,'first',[first],now,true).error,/其他认购/);
});
test('payment, allocation, registration and delivery advance independently',()=>{
  let order=createOrder(residence,mAccount,m,10,'flow',[],now,true).order;
  assert.equal(orderComplete(order),false);
  assert.match(beginPayment(order,'','receiver',new Date(now).toISOString()).error,/分别确认/);
  order=beginPayment(order,'payer','receiver',new Date(now).toISOString()).order;
  assert.equal(order.payment,'broadcast');
  assert.equal(order.allocation,'pending');
  assert.match(beginPayment(order,'payer','receiver',new Date(now).toISOString()).error,/原付款/);
  assert.deepEqual(advanceFulfillment(order,new Date(now).toISOString()),order);
  order=resolvePayment(order,'matched',new Date(now+1000).toISOString());
  assert.equal(order.delivery,'pending');
  for(const expected of ['allocation','registration','delivery']) {
    order=advanceFulfillment(order,new Date(now+2000).toISOString());
    assert.equal(order[expected],'confirmed');
    if(expected!=='delivery') assert.equal(orderComplete(order),false);
  }
  assert.equal(orderComplete(order),true);
  assert.deepEqual(advanceFulfillment(order,new Date(now+3000).toISOString()),order);
});
test('failed and unknown payment never imply allocation or delivery',()=>{
  const order=createOrder(residence,mAccount,m,10,'failure',[],now,true).order;
  const broadcast=beginPayment(order,'payer','receiver',new Date(now).toISOString()).order;
  for(const result of ['failed','unknown']) {
    const settled=resolvePayment(broadcast,result,new Date(now+1000).toISOString());
    assert.equal(settled.payment,result);
    assert.deepEqual(advanceFulfillment(settled,new Date(now+2000).toISOString()),settled);
    assert.equal(orderComplete(settled),false);
    assert.equal(remainingUnits(residence,[settled],now+2000),result==='failed'?25:15);
  }
  assert.equal(remainingUnits(residence,[order],now+16*60_000),25);
});
