import React, { useState } from 'react';
import { activeAccount, type AccountRecord } from './account.ts';
import { offerings } from './data.ts';
import { basePath, priceU, type Channel } from './domain.ts';
import { orderDetailUrl } from './orders.ts';
import { applyDemoDistributionState, claimBlockReason, createDemoDistribution, createMockPrincipalBasis, distributionAmounts, distributionKindLabel, distributionMethodLabel, distributionStateLabel, holdingNeedsReview, kindForRight, maskedHolder, ownDistributions, ownHoldings, paidIncomeCents, paidPrincipalCents, payMockPrincipal, principalBasisKey, readAllDistributions, readPrincipalBasis, saveDistribution, savePrincipalBasis, startMockClaim, type DistributionKind, type DistributionMethod, type DistributionState, type Holding, type MockDistribution } from './postInvestment.ts';
import { readAllOrders } from './subscription.ts';

const formatted = (value?:string) => value ? new Date(value).toLocaleString('zh-CN') : '待核实';
const money = (value:number|null|undefined) => value==null?'待核实':priceU(value);
const holdingUrl = (channel:Channel,id:string) => basePath(channel)+'/investments/holdings/'+encodeURIComponent(id);
const distributionUrl = (channel:Channel,id:string) => basePath(channel)+'/investments/returns/'+encodeURIComponent(id);
const holdingsFor = (channel:Channel,account:AccountRecord|null) => ownHoldings(readAllOrders(),account,channel,offerings);
const distributionsFor = (channel:Channel,account:AccountRecord|null,holdings:Holding[]) => ownDistributions(readAllDistributions(),account,channel,holdings);
const rightGuidance = (right:string) => right==='债权'?'利息依有效合同及实际未偿本金核实；本金偿还另列，不计入收益。':right==='股权'?'股息须以适格决议、可分配利润及法律权益快照核实；不保证分配。':'收益参与须以实际合法可分配金额和有效持有人份额核实；历史收入不等于应付。';
const field = (label:string,value:React.ReactNode) => <div><small>{label}</small><strong>{value}</strong></div>;
const parseAmount = (value:string) => /^\d+(?:\.\d{1,2})?$/.test(value)?Math.round(Number(value)*100):NaN;

function PrincipalSummary({holding,event}:{holding:Holding;event?:MockDistribution}) {
  const basis=readPrincipalBasis(holding.order.id);
  const amount=event?distributionAmounts(event).net:null;
  return <section className="content-panel principal-summary"><h2>债权本金核对</h2>
    <p>当前未接入权威债权本金与付款凭证。认购金额和底层原合同金额均不能替代当前有效未偿本金；下列金额仅为独立录入的 Mock 测试依据，不代表真实法定本金。</p>
    <div className="info-grid">
      {field('关联债权',holding.offering.title+' · '+holding.offering.id)}
      {field('原始债权来源',basis?.originalDebtSource||'待核实')}
      {field('测试本金 · Mock',money(basis?.testPrincipalCents))}
      {field('已偿还本金 · Mock',money(basis?.repaidCents))}
      {field('剩余本金 · Mock',money(basis?.remainingCents))}
      {field('本次偿还金额',amount==null?'请在偿还记录中查看':money(amount))}
      {field('核对时点',formatted(basis?.asOf))}
      {field('依据状态',basis?'Mock 测试依据已建立':'待核实；缺少依据时不能标记已支付')}
    </div>
  </section>;
}

export function HoldingsPanel({channel,account}:{channel:Channel;account:AccountRecord}) {
  const holdings=holdingsFor(channel,account);
  return <section><div className="section-head"><div><p className="eyebrow">LEGAL RIGHTS / TOKEN</p><h2>我的持仓</h2></div></div>{holdings.length?<div className="record-list">{holdings.map(({order,offering})=><article className="content-panel holding-card" key={order.id}><div><p className="eyebrow">{offering.issuerName} · {offering.category}</p><h2>{offering.title}</h2><p>{offering.right} · 来源订单 {order.id}</p></div>{holdingNeedsReview({order,offering})&&<p className="blocked-note">原订单存在异常或退款状态；法定登记记录保留供核查，当前权益及分配资格待核实。</p>}<div className="holding-metrics"><div><small>法定权益单位 · Mock</small><strong>{order.units} · 登记已确认</strong></div><div><small>Token 交付</small><strong>{order.delivery==='confirmed'?order.units+' Token · Mock':order.delivery==='unknown'?'待核实 · Mock':'未交付 · Mock'}</strong></div><div><small>当前可核余额</small><strong>待核实</strong></div><div><small>对账</small><strong>{order.delivery==='confirmed'?'Mock 数量匹配；法定对账待核实':'登记与 Token 交付待对账'}</strong></div></div><a className="text-link" href={holdingUrl(channel,order.id)}>查看持仓详情 →</a></article>)}</div>:<div className="empty"><h2>暂无已登记的 Mock 持仓</h2><p>只有当前账户已确认登记的订单才进入此列表；付款或 Token 状态本身不能代替法定登记。</p><a className="button button-secondary" href={basePath(channel)+'/investments?tab=orders'}>查看认购订单</a></div>}</section>;
}

export function HoldingDetailPage({channel,id}:{channel:Channel;id:string}) {
  const root=basePath(channel),account=activeAccount(channel);
  const holding=holdingsFor(channel,account).find(item=>item.order.id===id);
  if(!account) return <main className="container inner-page"><div className="empty"><h1>请登录查看持仓</h1><a className="button" href={root+'/account?from='+encodeURIComponent(holdingUrl(channel,id))}>前往登录</a></div></main>;
  if(!holding) return <main className="container inner-page"><div className="empty"><h1>持仓不可访问</h1><p>当前账户未有该项目的有效 Mock 登记记录。</p><a className="button button-secondary" href={root+'/investments?tab=holdings'}>返回持仓列表</a></div></main>;
  const {order,offering}=holding;
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/investments?tab=holdings'}>我的持仓</a><span>/</span><span>持仓详情</span></div><div className="page-head"><div><p className="eyebrow">HOLDING DETAIL · MOCK</p><h1>{offering.title}</h1><p>{offering.issuerName} · {offering.category} · {offering.right}</p></div><a className="text-link" href={root+'/support?order='+encodeURIComponent(order.id)}>联系支持 →</a></div>{holdingNeedsReview(holding)&&<div className="notice"><span>!</span>原订单存在异常或退款状态。此处仅保留既有 Mock 登记记录供核查；当前经济权益、Token 余额与分配资格均待核实。请查看来源订单。</div>}<div className="record-layout"><div><section className="content-panel"><h2>法定权益登记</h2><div className="info-grid"><div><small>权利人（脱敏）</small><strong>{maskedHolder(account)}</strong></div><div><small>登记状态</small><strong>已确认 · Mock；不构成真实法定登记</strong></div><div><small>权益单位 / 数量</small><strong>{offering.right} · {order.units}</strong></div><div><small>生效日期</small><strong>{formatted(order.registeredAt)}</strong></div><div><small>登记证据引用</small><strong>{order.registrationEvidence||'待核实'}</strong></div><div><small>权益版本</small><strong>{offering.instrumentVersion||'待核实'}</strong></div></div></section><section className="content-panel"><h2>Token 与对账</h2><div className="info-grid"><div><small>网络 / 合约</small><strong>网络待核实 / 合约待核实</strong></div><div><small>交付状态</small><strong>{order.delivery==='confirmed'?'已交付 · Mock':order.delivery==='unknown'?'待核实 · Mock':'未交付 · Mock'}</strong></div><div><small>已交付数量</small><strong>{order.delivery==='confirmed'?order.units+' Token · Mock':'待核实'}</strong></div><div><small>当前可核余额</small><strong>待核实</strong></div><div><small>Token 接收地址</small><strong>{order.tokenReceiver||'待核实'}</strong></div><div><small>交付交易引用</small><strong>{order.deliveryReference||'待核实'}</strong></div><div><small>交付时间</small><strong>{formatted(order.deliveredAt)}</strong></div><div><small>对账结果</small><strong>{order.delivery==='confirmed'?'Mock 数量匹配；法定对账待核实':'登记与 Token 交付待对账'}</strong></div></div><div className="notice"><span>!</span>法定持有人记录和 Token 显示独立；当前余额及法定对账没有权威来源，不能推断为一致。</div></section><section className="content-panel"><h2>锁仓与限制</h2><div className="info-grid"><div><small>合同锁仓</small><strong>{offering.lockup||'以权益文件为准'}</strong></div><div><small>链上转让限制</small><strong>待核实</strong></div><div><small>法定转让限制</small><strong>待核实</strong></div><div><small>状态更新时间</small><strong>{formatted(order.updatedAt)}</strong></div></div><p>{rightGuidance(offering.right)}</p></section>{offering.right==='债权'&&<PrincipalSummary holding={holding}/>}</div><aside className="summary-card"><p className="eyebrow">SOURCE RECORD</p><h2>来源与文件</h2><a className="text-link" href={orderDetailUrl(channel,order.id)}>来源订单 {order.id} →</a><div className="document-list">{order.documents.map(document=><div key={document.name}><span>{document.name}</span><small>{document.version}</small></div>)}</div><a className="text-link" href={root+'/disclosures'}>查看公告与披露 →</a></aside></div></main>;
}

export function ReturnsPanel({channel,account}:{channel:Channel;account:AccountRecord}) {
  const holdings=holdingsFor(channel,account),events=distributionsFor(channel,account,holdings);
  const income=events.filter(item=>item.kind!=='principal'),principal=events.filter(item=>item.kind==='principal');
  const list=(rows:MockDistribution[])=>rows.length?<div className="record-list">{rows.map(item=>{const offering=offerings.find(o=>o.id===item.offeringId);return <article className="content-panel distribution-card" key={item.id}><div><p className="eyebrow">{offering?.issuerName||'发行企业待核实'} · {distributionKindLabel(item.kind)}</p><h2>{offering?.title||item.offeringId}</h2><p>{item.period} · {distributionMethodLabel(item.method)}</p></div><div className="record-metrics"><strong>{money(distributionAmounts(item).confirmed)}</strong><em>{distributionStateLabel(item.state)}</em></div><a className="text-link" href={distributionUrl(channel,item.id)}>查看事件详情 →</a></article>})}</div>:<p className="hint">暂无与本人有效持仓关联的 Mock 事件。</p>;
  return <section><div className="return-summary"><div><small>已支付收益 · Mock</small><strong>{events.length?priceU(paidIncomeCents(events)):'待核实'}</strong><p>不含本金偿还</p></div><div><small>已偿债权本金 · Mock</small><strong>{events.length?priceU(paidPrincipalCents(events)):'待核实'}</strong><p>不计入投资收益</p></div></div><section><div className="section-head"><h2>收益与分配</h2></div>{list(income)}</section><section><div className="section-head"><h2>债权本金偿还</h2></div>{holdings.filter(item=>item.offering.right==='债权').map(item=><PrincipalSummary key={item.order.id} holding={item}/>)}{list(principal)}</section><section className="content-panel"><h2>适用权益说明</h2>{holdings.length?holdings.map(item=><p key={item.order.id}><strong>{item.offering.title}：</strong>{rightGuidance(item.offering.right)}</p>):<p>当前无已登记 Mock 持仓，不能生成收益或还本事件。</p>}<div className="notice"><span>!</span>已确认、已注资、可领取、处理中与已支付分别记录。预计金额不等于应付；领取方式须按每批获准规则确定。</div></section></section>;
}

export function DistributionDetailPage({channel,id}:{channel:Channel;id:string}) {
  const root=basePath(channel),account=activeAccount(channel),holdings=holdingsFor(channel,account);
  const found=distributionsFor(channel,account,holdings).find(item=>item.id===id);
  const [item,setItem]=useState(found);
  const [note,setNote]=useState('');
  if(!account) return <main className="container inner-page"><div className="empty"><h1>请登录查看分配事件</h1><a className="button" href={root+'/account?from='+encodeURIComponent(distributionUrl(channel,id))}>前往登录</a></div></main>;
  if(!item) return <main className="container inner-page"><div className="empty"><h1>事件不可访问</h1><p>当前账户没有关联持仓或该 Mock 事件。</p><a className="button button-secondary" href={root+'/investments?tab=returns'}>返回收益与本金</a></div></main>;
  const holding=holdings.find(value=>value.order.id===item.orderId)!;
  const amounts=distributionAmounts(item);
  const blockReason=item.method==='claim'?claimBlockReason(item,account,channel,holding):null;
  const claim=()=>{
    const result=startMockClaim(activeAccount(channel),channel,holding.offering,item.id,new Date().toISOString(),()=>crypto.randomUUID());
    if(result.item) setItem(result.item);
    setNote(result.error||'Mock 领取已进入处理中；原请求：'+(result.item?.requestId||'待核实'));
  };
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/investments?tab=returns'}>收益与本金</a><span>/</span><span>事件详情</span></div><div className="page-head"><div><p className="eyebrow">DISTRIBUTION · MOCK</p><h1>{distributionKindLabel(item.kind)}</h1><p>{holding.offering.title} · {distributionStateLabel(item.state)}</p></div></div><div className="record-layout"><section className="content-panel"><h2>事件与金额</h2><div className="info-grid"><div><small>Offering / 权益</small><strong>{item.offeringId} · {holding.offering.right}</strong></div><div><small>事件类型</small><strong>{distributionKindLabel(item.kind)}</strong></div><div><small>收益期间</small><strong>{item.period}</strong></div><div><small>Record Date</small><strong>{item.recordDate||'待核实'}</strong></div><div><small>合同应付日 / 计划日</small><strong>{item.dueDate||'待核实'}</strong></div><div><small>实际到账日</small><strong>{formatted(item.actualAt)}</strong></div><div><small>毛额</small><strong>{money(item.grossCents)}</strong></div><div><small>扣项</small><strong>{money(item.deductionsCents)}</strong></div><div><small>净应付</small><strong>{money(amounts.confirmed)}</strong></div><div><small>已注资</small><strong>{money(amounts.funded)}</strong></div><div><small>可领取</small><strong>{money(amounts.claimable)}</strong></div><div><small>已实付</small><strong>{money(amounts.paid)}</strong></div><div><small>未支付</small><strong>{money(amounts.unpaid)}</strong></div><div><small>支付方式</small><strong>{distributionMethodLabel(item.method)}</strong></div><div><small>交易凭证</small><strong>{item.transactionReference||'待核实'}</strong></div><div><small>原领取请求</small><strong>{item.requestId||'无'}</strong></div></div><div className="notice"><span>!</span>{item.legalBasis}。{item.kind==='principal'?'本金偿还不计入累计收益。':rightGuidance(holding.offering.right)}</div>{blockReason&&<p className="blocked-note">{blockReason}</p>}{item.method==='claim'&&item.state==='claimable'&&<button className="button" type="button" disabled={!!blockReason} onClick={claim}>模拟发起领取</button>}{item.state==='processing'&&<p className="blocked-note">原 Mock 领取/支付请求处理中；请查询原结果，不要重复发起。</p>}{note&&<p role="status">{note}</p>}</section>{item.kind==='principal'&&<PrincipalSummary holding={holding} event={item}/>}<aside className="summary-card"><h2>关联权益</h2><a className="text-link" href={holdingUrl(channel,item.orderId)}>查看本人持仓 →</a><p>事件状态不能替代法定权益登记、真实注资或到账凭证。</p><a className="text-link" href={root+'/support?order='+encodeURIComponent(item.orderId)}>联系支持 →</a></aside></div></main>;
}

export function DemoDistributionControls({channel}:{channel:Channel}) {
  const account=activeAccount(channel),holdings=holdingsFor(channel,account),events=distributionsFor(channel,account,holdings);
  const [holdingId,setHoldingId]=useState(holdings[0]?.order.id||'');
  const selected=holdings.find(item=>item.order.id===holdingId);
  const allowed=kindForRight(selected?.offering.right||'收益参与权');
  const [kind,setKind]=useState<DistributionKind>(allowed[0]);
  const [method,setMethod]=useState<DistributionMethod>('undecided');
  const [amount,setAmount]=useState('10.00');
  const [eventId,setEventId]=useState(events[0]?.id||'');
  const [state,setState]=useState<DistributionState>('confirmed');
  const [principalSource,setPrincipalSource]=useState('');
  const [principalAmount,setPrincipalAmount]=useState('');
  const [note,setNote]=useState('');
  const basis=selected?readPrincipalBasis(selected.order.id):null;
  const currentEvent=events.find(item=>item.id===eventId);
  const create=()=>{
    const cents=parseAmount(amount);
    if(!Number.isSafeInteger(cents)){setNote('请输入有效的非负演示金额，最多两位小数。');return;}
    const fresh=holdingsFor(channel,activeAccount(channel)).find(item=>item.order.id===holdingId);
    const result=createDemoDistribution(activeAccount(channel),channel,fresh,allowed.includes(kind)?kind:allowed[0],method,cents,0,new Date().toISOString(),'mock-dist-'+crypto.randomUUID());
    if(!result.item){setNote(result.error||'事件未创建');return;}
    saveDistribution(result.item);setEventId(result.item.id);setNote('已创建计划待核实的 Mock 事件；金额不构成合同应付。');
  };
  const createBasis=()=>{
    if(!selected) return;
    if(localStorage.getItem(principalBasisKey(selected.order.id))!==null){setNote('已有 Mock 本金依据记录，不能覆盖；损坏记录须另行核查。');return;}
    const result=createMockPrincipalBasis(activeAccount(channel),channel,selected,principalSource,parseAmount(principalAmount),new Date().toISOString(),null,readAllDistributions());
    if(!result.basis){setNote(result.error||'本金依据未建立');return;}
    savePrincipalBasis(result.basis);setNote('已建立独立 Mock 测试本金依据；不代表真实法定本金。');
  };
  const update=()=>{
    const event=readAllDistributions().find(item=>item.id===eventId);
    const offering=offerings.find(item=>item.id===event?.offeringId);
    if(!event||!offering) return;
    if(event.kind==='principal'&&state==='paid'){
      const result=payMockPrincipal(activeAccount(channel),channel,offering,event.id,new Date().toISOString());
      setNote(result.error||'本金已核对：本次 '+money(distributionAmounts(result.item!).net)+'，已偿 '+money(result.basis?.repaidCents)+'，剩余 '+money(result.basis?.remainingCents));
      return;
    }
    const next=applyDemoDistributionState(event,state,new Date().toISOString());
    if(next===event){setNote('状态变更被拒绝：已支付本金不能回退；本金支付须通过本金依据校验。');return;}
    saveDistribution(next);setNote('已应用 Mock 事件状态：'+distributionStateLabel(next.state));
  };
  const claim=()=>{
    const event=readAllDistributions().find(item=>item.id===eventId);
    const offering=offerings.find(item=>item.id===event?.offeringId);
    if(!event||!offering) return;
    const result=startMockClaim(activeAccount(channel),channel,offering,event.id,new Date().toISOString(),()=>crypto.randomUUID());
    setNote(result.error||'Mock 领取已进入处理中；原请求：'+(result.item?.requestId||'待核实'));
  };
  return <section className="content-panel demo-business"><h2>收益与本金事件模拟</h2><p>只在当前账户已登记且无未决异常的 Mock 持仓上创建。金额和支付方式仅供场景测试，不是收益承诺或已获准的统一 Claim 规则。</p><div className="demo-account-controls"><label>本人持仓<select id="demo-holding" value={holdingId} onChange={event=>{setHoldingId(event.target.value);setKind(kindForRight(holdings.find(item=>item.order.id===event.target.value)?.offering.right||'收益参与权')[0]);}}><option value="">选择持仓</option>{holdings.map(item=><option key={item.order.id} value={item.order.id}>{item.offering.title} · {item.order.id}</option>)}</select></label><label>事件类型<select id="demo-kind" value={allowed.includes(kind)?kind:allowed[0]} onChange={event=>setKind(event.target.value as DistributionKind)}>{allowed.map(value=><option key={value} value={value}>{distributionKindLabel(value)}</option>)}</select></label><label>本批路径<select id="demo-method" value={method} onChange={event=>setMethod(event.target.value as DistributionMethod)}><option value="undecided">待核实</option><option value="claim">Claim · Mock</option><option value="push">Push · Mock</option><option value="external">外部付款 · Mock</option></select></label><label>演示毛额 U<input id="demo-amount" value={amount} onChange={event=>setAmount(event.target.value)} inputMode="decimal" /></label><button id="demo-create-event" className="button" disabled={!holdingId} onClick={create}>创建 Mock 事件</button></div>{selected?.offering.right==='债权'&&<section className="demo-principal"><h3>独立 Mock 测试本金依据</h3><p>对应债权：{selected.offering.title} · {selected.offering.id}。金额必须显式输入，不采用认购金额或原合同金额。</p><div className="demo-account-controls"><label>Mock 原始债权来源<input id="demo-principal-source" value={principalSource} onChange={event=>setPrincipalSource(event.target.value)} /></label><label>Mock 测试本金 U<input id="demo-principal-amount" value={principalAmount} onChange={event=>setPrincipalAmount(event.target.value)} inputMode="decimal" /></label><button id="demo-create-basis" className="button button-secondary" disabled={!selected} onClick={createBasis}>建立 Mock 本金依据</button></div><dl><dt>来源</dt><dd>{basis?.originalDebtSource||'待核实'}</dd><dt>应偿 / 已偿 / 剩余本金</dt><dd>{money(basis?.testPrincipalCents)} / {money(basis?.repaidCents)} / {money(basis?.remainingCents)}</dd><dt>最近一次偿还 / 核对时点</dt><dd>{money(basis?.lastRepaymentCents)} / {formatted(basis?.asOf)}</dd></dl></section>}<div className="demo-account-controls"><label>本人事件<select id="demo-event" value={eventId} onChange={event=>setEventId(event.target.value)}><option value="">选择事件</option>{events.map(item=><option key={item.id} value={item.id}>{distributionKindLabel(item.kind)} · {item.id}</option>)}</select></label><label>结果状态<select id="demo-result" value={state} onChange={event=>setState(event.target.value as DistributionState)}>{(['planned','confirmed','funded','claimable','processing','paid','unknown'] as DistributionState[]).map(value=><option key={value} value={value}>{distributionStateLabel(value)}</option>)}</select></label><button id="demo-apply" className="button" disabled={!eventId} onClick={update}>应用事件 Mock 结果</button><button id="demo-claim" className="button button-secondary" disabled={!eventId} onClick={claim}>执行 Mock Claim</button></div>{currentEvent&&<p data-testid="claim-record">当前事件：{currentEvent.id} · {currentEvent.state} · 原请求：{currentEvent.requestId||'无'} · 本次金额 {money(distributionAmounts(currentEvent).net)}<br /><a href={distributionUrl(channel,currentEvent.id)}>查看投资者页面</a></p>}{note&&<p id="demo-note" role="status">{note}</p>}</section>;
}
