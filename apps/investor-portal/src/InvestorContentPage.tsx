import React, { useState } from 'react';
import { activeAccount } from './account.ts';
import { offerings } from './data.ts';
import { basePath, type Channel } from './domain.ts';
import { allowedContentOfferings, announcements, messageReadKey, messagesFor } from './investorContent.ts';
import { mockDocumentText } from './legalDocs.ts';
import { readAllDistributions } from './postInvestment.ts';
import { readAllOrders } from './subscription.ts';
import { readAllTickets } from './tickets.ts';

const date = (value:string) => value.slice(0,10);
const docUrl = (channel:Channel,offeringId:string,index:number) => basePath(channel)+'/disclosures/'+offeringId+'/'+index;
const noticeUrl = (channel:Channel,id:string) => basePath(channel)+'/disclosures/announcements/'+id;
const messageUrl = (channel:Channel,id:string) => basePath(channel)+'/messages/'+encodeURIComponent(id);

export function MessagesPage({channel,noListings=false}:{channel:Channel;noListings?:boolean}) {
  const root=basePath(channel),account=activeAccount(channel),orders=readAllOrders();
  const visible=allowedContentOfferings(offerings,channel,account,orders,noListings);
  const messages=messagesFor(channel,account,orders,readAllTickets(),readAllDistributions(),visible,Date.now());
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">MESSAGES · MOCK</p><h1>消息与通知</h1><p>订单、客服、收益及项目资料更新均按当前账户和渠道显示。</p></div></div>{!account?<div className="empty"><h2>请登录查看消息</h2><a className="button" href={root+'/account?from='+encodeURIComponent(root+'/messages')}>前往登录</a></div>:messages.length?<div className="record-list message-list">{messages.map(item=>{const read=localStorage.getItem(messageReadKey(channel,account,item.id))==='yes';return <article className="content-panel" key={item.id}><div><p className="eyebrow">{item.category} · {read?'已读':'未读'}</p><h2>{item.title}</h2><p>{item.summary}</p><small>{item.offeringId||'账户通知'} · 更新于 {date(item.updatedAt)}</small></div><a className="text-link" href={messageUrl(channel,item.id)}>查看消息 →</a></article>})}</div>:<div className="empty"><h2>暂无 Mock 消息</h2><p>当前账户尚无订单、工单或可见项目资料更新。</p></div>}<div className="notice"><span>!</span>消息已读只是本机阅读状态，不构成电子签署、法定送达或原业务状态变更。</div></main>;
}

export function MessageDetailPage({channel,id,noListings=false}:{channel:Channel;id:string;noListings?:boolean}) {
  const root=basePath(channel),account=activeAccount(channel),orders=readAllOrders();
  const visible=allowedContentOfferings(offerings,channel,account,orders,noListings);
  const item=messagesFor(channel,account,orders,readAllTickets(),readAllDistributions(),visible,Date.now()).find(message=>message.id===id);
  const [read,setRead]=useState(account?localStorage.getItem(messageReadKey(channel,account,id))==='yes':false);
  if(!account) return <main className="container inner-page"><div className="empty"><h1>请登录查看消息</h1><a className="button" href={root+'/account?from='+encodeURIComponent(messageUrl(channel,id))}>前往登录</a></div></main>;
  if(!item) return <main className="container inner-page"><div className="empty"><h1>消息不可访问</h1><p>该消息不存在，或当前账户无权查看。</p><a className="button button-secondary" href={root+'/messages'}>返回消息列表</a></div></main>;
  const mark=()=>{localStorage.setItem(messageReadKey(channel,account,id),'yes');setRead(true);};
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/messages'}>消息</a><span>/</span><span>消息详情</span></div><section className="content-panel message-detail"><p className="eyebrow">{item.category} · {read?'已读':'未读'}</p><h1>{item.title}</h1><p>{item.summary}</p><div className="info-grid"><div><small>关联 Offering</small><strong>{item.offeringId||'无'}</strong></div><div><small>创建 / 更新</small><strong>{date(item.createdAt)} / {date(item.updatedAt)}</strong></div></div><div className="notice"><span>!</span>本页仅为 Mock 通知摘要。请进入关联业务页面查看当前状态；阅读状态不改变原事实。</div><div className="message-actions">{!read&&<button className="button button-secondary" onClick={mark}>标为已读</button>}<a className="button" href={item.link}>查看关联业务 →</a></div></section></main>;
}

export function DisclosuresPage({channel,noListings=false}:{channel:Channel;noListings?:boolean}) {
  const root=basePath(channel),account=activeAccount(channel);
  const visible=allowedContentOfferings(offerings,channel,account,readAllOrders(),noListings);
  const ids=new Set(visible.map(item=>item.id));
  const notices=announcements.filter(item=>ids.has(item.offeringId));
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">DISCLOSURES · MOCK</p><h1>公告与披露文件</h1><p>仅展示当前渠道公开或本人历史订单可访问的 Mock 资料；版本单独保留。</p></div></div><section className="content-panel"><h2>项目公告</h2>{notices.length?<div className="disclosure-list">{notices.map(item=><div key={item.id}><div><strong>{item.title}</strong><small>{item.offeringId} · {item.version} · 发布 {item.publishedAt}</small></div><a className="text-link" href={noticeUrl(channel,item.id)}>查看公告 →</a></div>)}</div>:<p>当前渠道暂无可访问的项目公告。</p>}</section><section className="content-panel"><h2>法律与风险文件</h2>{visible.length?<div className="disclosure-list">{visible.flatMap(offering=>offering.documents.map((document,index)=><div key={offering.id+':'+index}><div><strong>{offering.title} · {document.name}</strong><small>{offering.id} · {document.version} · 权限：当前渠道可查看</small></div><a className="text-link" href={docUrl(channel,offering.id,index)}>查看文件 →</a></div>))}</div>:<p>当前渠道暂无可访问的 Mock 文件。</p>}</section><div className="notice"><span>!</span>演示文档不是经审核的法律或财务文件；未披露的财务与收益报告不以空白数据推断。</div><a className="text-link" href={root+'/opportunities'}>返回投资机会 →</a></main>;
}

export function DisclosureDocumentPage({channel,offeringId,index,noListings=false}:{channel:Channel;offeringId:string;index:number;noListings?:boolean}) {
  const root=basePath(channel),account=activeAccount(channel);
  const offering=allowedContentOfferings(offerings,channel,account,readAllOrders(),noListings).find(item=>item.id===offeringId);
  const document=offering?.documents[index];
  if(!offering||!document) return <main className="container inner-page"><div className="empty"><h1>文件不可访问</h1><p>文件不存在，或当前渠道及账户无权查看。</p><a className="button button-secondary" href={root+'/disclosures'}>返回公告与披露</a></div></main>;
  const lines=mockDocumentText(offering,document.name);
  const filename=offering.id+'-'+document.name+'-'+document.version.replace(/[^a-zA-Z0-9.-]/g,'')+'.txt';
  const download='data:text/plain;charset=utf-8,'+encodeURIComponent([offering.title,document.name+' · '+document.version,...lines].join('\n\n'));
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/disclosures'}>公告与披露</a><span>/</span><span>文件详情</span></div><section className="content-panel disclosure-detail"><p className="eyebrow">DOCUMENT · MOCK</p><h1>{document.name}</h1><p>{offering.title} · {offering.id} · {document.version}</p>{lines.map((line,i)=><p key={i}>{line}</p>)}<div className="notice"><span>!</span>查看或下载仅供演示；阅读不代表有效签署或法定送达。</div><a className="button button-secondary" href={download} download={filename}>下载 Mock 文本</a></section></main>;
}

export function AnnouncementDetailPage({channel,id,noListings=false}:{channel:Channel;id:string;noListings?:boolean}) {
  const root=basePath(channel),account=activeAccount(channel),visible=allowedContentOfferings(offerings,channel,account,readAllOrders(),noListings);
  const notice=announcements.find(item=>item.id===id&&visible.some(offering=>offering.id===item.offeringId));
  if(!notice) return <main className="container inner-page"><div className="empty"><h1>公告不可访问</h1><p>公告不存在，或当前渠道无权查看。</p><a className="button button-secondary" href={root+'/disclosures'}>返回公告与披露</a></div></main>;
  return <main className="container inner-page"><div className="breadcrumb"><a href={root+'/disclosures'}>公告与披露</a><span>/</span><span>公告详情</span></div><section className="content-panel disclosure-detail"><p className="eyebrow">ANNOUNCEMENT · MOCK</p><h1>{notice.title}</h1><p>Offering {notice.offeringId} · {notice.version} · 发布 {notice.publishedAt}</p><p>{notice.content}</p><div className="notice"><span>!</span>本演示公告不包含实际财务或募集结果；版本更新不会覆盖历史文件。</div></section></main>;
}
