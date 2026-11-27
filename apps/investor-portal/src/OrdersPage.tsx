import React, { useState } from 'react';
import { activeAccount, type AccountRecord } from './account.ts';
import { offerings } from './data.ts';
import { basePath, priceU, type Channel } from './domain.ts';
import { applyDemoOrderScenario, exceptionStatus, orderDetailUrl, orderStatus, ownOrders, refundStatus, type DemoOrderScenario } from './orders.ts';
import { readAllOrders, saveOrder, type MockOrder } from './subscription.ts';
import { applyDemoTicketStatus, createTicket, ownTickets, readAllTickets, replyToTicket, saveTicket, ticketCategories, ticketStatusLabel, ticketVisibleTo, type MockTicket, type TicketCategory, type TicketStatus } from './tickets.ts';
import { HoldingsPanel, ReturnsPanel } from './PostInvestmentPage';

const formatDate = (value:string) => new Date(value).toLocaleString('zh-CN');
const publicStatus = (value:string) => value.replaceAll('Mock', '本地示例');
const publicOrderStatus = (order:MockOrder,now:number) => publicStatus(orderStatus(order,now));
const titleOf = (id:string) => offerings.find(offering => offering.id===id)?.title || id;
const issuerOf = (id:string) => offerings.find(offering => offering.id===id)?.issuerName || '发行企业待核实';
const loginLink = (channel:Channel,from:string) => basePath(channel)+'/account?from='+encodeURIComponent(from);
const ticketUrl = (channel:Channel,id:string) => basePath(channel)+'/account/tickets/'+encodeURIComponent(id);
const ticketLink = (channel:Channel,order?:MockOrder) => basePath(channel)+'/support'+(order?'?order='+encodeURIComponent(order.id):'');

export function InvestmentsPage({channel}:{channel:Channel}) {
  const root=basePath(channel);
  const account=activeAccount(channel);
  const tab=new URLSearchParams(location.search).get('tab')||'orders';
  const orders=ownOrders(readAllOrders(),account,channel);
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">MY INVESTMENTS</p><h1>我的投资</h1><p>{account?account.email+' · 当前渠道独立记录':'登录后查看当前渠道的投资记录'}</p></div></div><nav className="investment-tabs" aria-label="我的投资分类"><a className={tab==='orders'?'active':''} href={root+'/investments?tab=orders'}>认购订单</a><a className={tab==='holdings'?'active':''} href={root+'/investments?tab=holdings'}>我的持仓</a><a className={tab==='returns'?'active':''} href={root+'/investments?tab=returns'}>收益与本金</a></nav>
    {!account?<section className="empty"><h2>请登录当前渠道账户</h2><p>订单、持仓及收益记录按账户和渠道隔离。</p><a className="button" href={loginLink(channel,root+'/investments')}>前往登录</a></section>:tab==='holdings'?<HoldingsPanel channel={channel} account={account}/>:tab==='returns'?<ReturnsPanel channel={channel} account={account}/>:orders.length?<div className="record-list">{orders.map(order => <article className="content-panel record-card" key={order.id}><div><p className="eyebrow">{issuerOf(order.offeringId)}</p><h2>{titleOf(order.offeringId)}</h2><p>订单 {order.id} · 创建于 {formatDate(order.createdAt)}</p></div><div className="record-metrics"><span>{order.units} 份</span><strong>{priceU(order.amountCents)}</strong><em>{publicOrderStatus(order,Date.now())}</em></div><a className="text-link" href={orderDetailUrl(channel,order.id)}>查看订单详情 →</a></article>)}</div>:<section className="empty"><h2>暂无认购订单</h2><p>当前账户没有与此渠道关联的认购订单。</p><a className="button" href={root+'/opportunities'}>浏览投资机会</a></section>}
  </main>;
}

export function OrderDetailPage({channel,id}:{channel:Channel;id:string}) {
  const root=basePath(channel);
  const account=activeAccount(channel);
  const order=ownOrders(readAllOrders(),account,channel).find(item => item.id===id);
  if(!account) return <main className="container inner-page"><section className="empty"><h1>请登录查看订单</h1><a className="button" href={loginLink(channel,orderDetailUrl(channel,id))}>前往登录</a></section></main>;
  if(!order) return <main className="container inner-page"><section className="empty"><h1>订单不可访问</h1><p>该订单不存在，或不属于当前账户与渠道。</p><a className="button button-secondary" href={root+'/investments'}>返回我的投资</a></section></main>;
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/investments'}>我的投资</a><span>/</span><span>订单详情</span></div><div className="page-head"><div><p className="eyebrow">ORDER DETAIL</p><h1>{titleOf(order.offeringId)}</h1><p>{issuerOf(order.offeringId)} · {publicOrderStatus(order,Date.now())}</p></div><a className="text-link" href={ticketLink(channel,order)}>联系支持 →</a></div><div className="record-layout"><section className="content-panel"><h2>订单快照</h2><div className="info-grid"><div><small>订单编号</small><strong>{order.id}</strong></div><div><small>关联项目</small><strong>{titleOf(order.offeringId)}</strong></div><div><small>投资份额</small><strong>{order.units}</strong></div><div><small>认购金额</small><strong>{priceU(order.amountCents)}</strong></div><div><small>单价</small><strong>{priceU(order.priceCents)}</strong></div><div><small>创建时间</small><strong>{formatDate(order.createdAt)}</strong></div><div><small>待付款有效期</small><strong>{formatDate(order.expiresAt)}</strong></div><div><small>文件确认</small><strong>仅阅读了示例文件；尚无有效法律签署</strong></div></div><h2>业务进度</h2><p className="hint">以下为本地示例记录，不代表真实付款、配售、法定登记或权益凭证交付。</p><div className="timeline"><div><span className="timeline-dot"/><strong>付款</strong><small>{order.payment==='matched'?'实收已匹配':order.payment==='broadcast'?'交易已发起，待核实':order.payment==='failed'?'失败':order.payment==='unknown'?'状态未知':'未发起'}</small></div><div><span className="timeline-dot"/><strong>配售</strong><small>{order.allocation==='confirmed'?'已确认':order.allocation==='unknown'?'待核实':'未开始'}</small></div><div><span className="timeline-dot"/><strong>法定登记</strong><small>{order.registration==='confirmed'?'已登记':order.registration==='unknown'?'待核实':'未开始'}</small></div><div><span className="timeline-dot"/><strong>权益凭证交付</strong><small>{order.delivery==='confirmed'?'已交付':order.delivery==='unknown'?'待核实':'未开始'}</small></div></div><div className="info-grid"><div><small>付款钱包</small><strong>{(order.paymentWallet||'未选择').replace(/^Mock\s*/i, '示例 ')}</strong></div><div><small>权益凭证接收地址</small><strong>{(order.tokenReceiver||'未选择').replace(/^Mock\s*/i, '示例 ')}</strong></div><div><small>原交易引用</small><strong>{publicStatus(order.paymentReference||'尚无')}</strong></div><div><small>异常状态</small><strong>{publicStatus(exceptionStatus(order))}</strong></div><div><small>退款状态查询</small><strong>{publicStatus(refundStatus(order))}</strong></div><div><small>退款引用</small><strong>{order.refundReference||'尚无'}</strong></div></div><div className="notice"><span>!</span>当前退款状态仅为本地示例，不构成真实退款依据。付款失败、回滚或待核实均不自动表示退款完成；工单关闭也不改变订单事实。</div></section><aside className="summary-card"><p className="eyebrow">DOCUMENT SNAPSHOT</p><h2>文件版本</h2><div className="document-list">{order.documents.map(item=><div key={item.name}><span>{item.name}</span><small>{publicStatus(item.version)}</small></div>)}</div><a className="button button-secondary" href={ticketLink(channel,order)}>针对本订单提交工单</a></aside></div></main>;
}

export function SupportPage({channel}:{channel:Channel}) {
  const root=basePath(channel);
  const account=activeAccount(channel);
  const orders=ownOrders(readAllOrders(),account,channel);
  const requestedOrder=new URLSearchParams(location.search).get('order')||'';
  const matchedOrder=orders.find(order=>order.id===requestedOrder);
  const [category,setCategory]=useState<TicketCategory>(matchedOrder?'订单付款':'其他');
  const [orderId,setOrderId]=useState(matchedOrder?.id||'');
  const [description,setDescription]=useState('');
  const [transactionHash,setTransactionHash]=useState('');
  const [screenshotName,setScreenshotName]=useState('');
  const [error,setError]=useState('');
  const submit=()=>{
    const linked=orders.find(order=>order.id===orderId);
    const result=createTicket(account,channel,category,description,orders,new Date().toISOString(),'mock-ticket-'+crypto.randomUUID(),orderId||undefined,linked?.offeringId,transactionHash||undefined,screenshotName||undefined);
    if(!result.ticket){setError(result.error||'工单未创建');return;}
    saveTicket(result.ticket);location.href=ticketUrl(channel,result.ticket.id);
  };
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">SUPPORT</p><h1>帮助与客服</h1><p>订单、付款、钱包及持仓问题可关联当前账户记录保存本地咨询记录；尚无真实客服服务。</p></div></div><div className="record-layout"><section className="content-panel"><h2>提交工单</h2>{!account?<><p>登录后可创建当前渠道的独立工单。</p><a className="button" href={loginLink(channel,root+'/support')}>前往登录</a></>:<><p>联系邮箱：{account.email}。请勿填写私钥、助记词、验证码或真实敏感身份资料。</p><div className="ticket-form"><label>问题类型<select value={category} onChange={event=>setCategory(event.target.value as TicketCategory)}>{ticketCategories.map(value=><option key={value}>{value}</option>)}</select></label><label>关联订单<select value={orderId} onChange={event=>setOrderId(event.target.value)} disabled={!!matchedOrder}><option value="">不关联订单</option>{orders.map(order=><option key={order.id} value={order.id}>{titleOf(order.offeringId)} · {order.id}</option>)}</select></label><label>问题描述<textarea value={description} onChange={event=>setDescription(event.target.value)} maxLength={2000} rows={6} placeholder="请描述需要核查的事实与时间" /></label><label>交易哈希（可选）<input value={transactionHash} onChange={event=>setTransactionHash(event.target.value)} placeholder="0x…" /></label><label>截图（可选，仅记录文件名）<input type="file" accept="image/*" onChange={event=>setScreenshotName(event.target.files?.[0]?.name||'')} /></label>{screenshotName&&<p className="hint">已选择 {screenshotName}；当前仅记录文件名，不上传文件内容。</p>}{error&&<p className="form-error" role="alert">{error}</p>}<button className="button" type="button" onClick={submit}>保存本地咨询记录</button></div></>}</section><aside className="summary-card"><h2>处理说明</h2><p>咨询记录与订单、资金、登记、凭证状态独立。提交工单不会取消认购或申请退款。</p><p>付款状态未知时，请先查询原交易并附关联订单；不要重复发起付款。</p>{account&&<a className="text-link" href={root+'/account/tickets'}>查看我的工单 →</a>}</aside></div></main>;
}

export function TicketPanel({channel,account}:{channel:Channel;account:AccountRecord}) {
  const tickets=ownTickets(readAllTickets(),account,channel);
  return <section className="content-panel"><h2>我的工单</h2><p>处理状态只反映客服沟通，不修改原订单、付款或登记结果。</p><a className="button button-secondary" href={basePath(channel)+'/support'}>提交工单</a>{tickets.length?<div className="ticket-list">{tickets.map(ticket=><div key={ticket.id}><div><strong>{ticket.category} · {ticketStatusLabel(ticket.status)}</strong><small>{ticket.id} · {formatDate(ticket.updatedAt)}</small></div><a className="text-link" href={ticketUrl(channel,ticket.id)}>查看详情 →</a></div>)}</div>:<p className="hint">当前账户暂无咨询记录。</p>}</section>;
}

export function TicketDetailPage({channel,id}:{channel:Channel;id:string}) {
  const root=basePath(channel);
  const account=activeAccount(channel);
  const ticket=account?readAllTickets().find(item=>item.id===id&&ticketVisibleTo(item,account,channel)):undefined;
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [current,setCurrent]=useState<MockTicket|undefined>(ticket);
  if(!account) return <main className="container inner-page"><section className="empty"><h1>请登录查看工单</h1><a className="button" href={loginLink(channel,ticketUrl(channel,id))}>前往登录</a></section></main>;
  if(!current) return <main className="container inner-page"><section className="empty"><h1>工单不可访问</h1><p>该工单不存在，或不属于当前账户与渠道。</p><a className="button button-secondary" href={root+'/account/tickets'}>返回我的工单</a></section></main>;
  const reply=()=>{const result=replyToTicket(current,account,channel,message,new Date().toISOString());if(!result.ticket){setError(result.error||'回复失败');return;}saveTicket(result.ticket);setCurrent(result.ticket);setMessage('');setError('');};
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/account/tickets'}>我的工单</a><span>/</span><span>工单详情</span></div><div className="page-head"><div><p className="eyebrow">SUPPORT TICKET</p><h1>{current.category}</h1><p>{current.id} · {ticketStatusLabel(current.status)}</p></div></div><div className="record-layout"><section className="content-panel"><h2>问题与回复</h2><p>{current.description}</p><div className="info-grid"><div><small>联系邮箱</small><strong>{current.email}</strong></div><div><small>关联订单</small><strong>{current.orderId||'无'}</strong></div><div><small>关联项目</small><strong>{current.offeringId ? titleOf(current.offeringId) : '无'}</strong></div><div><small>交易哈希</small><strong>{current.transactionHash||'未提供'}</strong></div><div><small>截图文件名</small><strong>{current.screenshotName||'未提供'}</strong></div><div><small>更新时间</small><strong>{formatDate(current.updatedAt)}</strong></div></div><div className="ticket-thread">{current.replies.map((item,index)=><div key={index}><strong>{item.author==='investor'?'我的回复':'客服回复 · 示例'}</strong><small>{formatDate(item.at)}</small><p>{item.message}</p></div>)}</div>{current.status!=='resolved'&&<div className="ticket-form"><label>回复或补件说明<textarea value={message} onChange={event=>setMessage(event.target.value)} rows={4} /></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="button" onClick={reply}>保存本地回复</button></div>}</section><aside className="summary-card"><h2>原业务状态</h2><p>工单关闭不代表退款、付款、登记或权益凭证交付完成。</p>{current.orderId&&<a className="text-link" href={orderDetailUrl(channel,current.orderId)}>查看关联订单 →</a>}<div className="notice"><span>!</span>请以订单详情中的独立业务状态为准；当前记录仅为本地示例。</div></aside></div></main>;
}

export function DemoBusinessControls({channel}:{channel:Channel}) {
  const account=activeAccount(channel);
  const orders=ownOrders(readAllOrders(),account,channel);
  const tickets=ownTickets(readAllTickets(),account,channel);
  const [orderId,setOrderId]=useState(orders[0]?.id||'');
  const [orderScenario,setOrderScenario]=useState<DemoOrderScenario>('normal');
  const [ticketId,setTicketId]=useState(tickets[0]?.id||'');
  const [ticketStatus,setTicketStatus]=useState<TicketStatus>('processing');
  const [reply,setReply]=useState('');
  const [note,setNote]=useState('');
  const applyOrder=()=>{
    const order=orders.find(item=>item.id===orderId);
    if(!order) return;
    const next=applyDemoOrderScenario(order,orderScenario,new Date().toISOString());
    if(next===order){setNote('该模拟结果要求原订单已有已匹配付款；当前状态未改动。');return;}
    saveOrder(next);setNote('已应用订单 Mock 结果：'+orderStatus(next,Date.now()));
  };
  const applyTicket=()=>{
    const ticket=tickets.find(item=>item.id===ticketId);
    if(!ticket) return;
    const next=applyDemoTicketStatus(ticket,ticketStatus,new Date().toISOString(),reply);
    saveTicket(next);setNote('已应用工单 Mock 状态：'+ticketStatusLabel(next.status));setReply('');
  };
  return <section className="content-panel demo-business"><h2>订单异常、退款与工单结果模拟</h2><p>仅修改当前账户和渠道的本机 Mock 记录。退款核实到账仅是手动选定的演示结果，不推断生产自动退款。</p><div className="demo-account-controls"><label>本人订单<select value={orderId} onChange={event=>setOrderId(event.target.value)}><option value="">选择订单</option>{orders.map(order=><option key={order.id} value={order.id}>{titleOf(order.offeringId)} · {order.id}</option>)}</select></label><label>异常 / 退款结果<select value={orderScenario} onChange={event=>setOrderScenario(event.target.value as DemoOrderScenario)}><option value="normal">清除异常/退款演示标记</option><option value="rollback">交易回滚，无已收资金</option><option value="reorg">链上结果待核实</option><option value="fulfillment-failed">履约异常，退款未核实</option><option value="refund-review">退款资格待核实</option><option value="refund-processing">退款处理中</option><option value="refund-confirmed">退款已核实到账</option></select></label><button className="button" disabled={!orderId} onClick={applyOrder}>应用订单 Mock 结果</button></div><div className="demo-account-controls"><label>本人工单<select value={ticketId} onChange={event=>setTicketId(event.target.value)}><option value="">选择工单</option>{tickets.map(ticket=><option key={ticket.id} value={ticket.id}>{ticket.category} · {ticket.id}</option>)}</select></label><label>工单处理状态<select value={ticketStatus} onChange={event=>setTicketStatus(event.target.value as TicketStatus)}><option value="pending">待处理</option><option value="processing">处理中</option><option value="awaiting-user">待用户回复</option><option value="resolved">已解决</option></select></label><label>客服回复（可选）<input value={reply} onChange={event=>setReply(event.target.value)} /></label><button className="button" disabled={!ticketId} onClick={applyTicket}>应用工单 Mock 结果</button></div>{note&&<p role="status">{note}</p>}</section>;
}
