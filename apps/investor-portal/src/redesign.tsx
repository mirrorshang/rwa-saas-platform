import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { actionState, assetGroup, basePath, canShowCompany, filterOfferings, investmentFacts, investmentPeriod, minimumUnits, parseChannel, priceU, visibleOfferings, type Channel, type Offering, type OpportunityFilters } from './domain';
import { offerings, issuers, publishedDisclosureError } from './data';
import { activeAccount, saveAccount, withMpcResult, type KycStatus, type MpcStatus } from './account';
import { AccountPage } from './AccountPage';
import { SubscriptionPage } from './SubscriptionPage';
import { readAllOrders, remainingUnits } from './subscription.ts';
import { DemoBusinessControls, InvestmentsPage, OrderDetailPage, SupportPage, TicketDetailPage } from './OrdersPage';
import { DemoDistributionControls, DistributionDetailPage, HoldingDetailPage } from './PostInvestmentPage';
import { AnnouncementDetailPage, DisclosureDocumentPage, DisclosuresPage, MessageDetailPage, MessagesPage } from './InvestorContentPage';
import heroImage from './assets/dev01r-hero.png';
import residenceImage from './assets/dev01r-residence.png';
import debtImage from './assets/dev01r-debt.png';
import './redesign.css';
import './postInvestment.css';

const path = location.pathname.replace(/\/$/, '') || '/';
const channel = parseChannel(path);
const scenarioKey = 'rwa-investor-dev01-scenario';
const scenario = sessionStorage.getItem(scenarioKey) || 'normal';
const noListings = scenario === 'no-listings';
const safeDecode = (value:string) => { try { return decodeURIComponent(value); } catch { return ''; } };
const identityFor = (c: Channel): 'guest' | 'kyc' | 'ready' => {
  const account = activeAccount(c);
  if (account) return account.kyc === 'approved' ? 'ready' : 'kyc';
  return scenario === 'ready' ? 'ready' : scenario === 'kyc-required' ? 'kyc' : 'guest';
};
const root = (c: Channel) => basePath(c);
const url = (c: Channel, suffix = '') => root(c) + suffix;
const assetUrl = (c: Channel, o: Offering) => url(c, '/opportunities/' + o.id);
const companyUrl = (c: Channel, o: Offering) => url(c, '/issuers/' + o.issuerId) + '?from=' + encodeURIComponent(assetUrl(c, o));
const brand = (c: Channel) => c.kind === 'm' ? 'RWA Invest' : (issuers[c.issuerSlug as keyof typeof issuers]?.name || offerings.find(o => o.issuerSlug === c.issuerSlug)?.issuerName || '企业投资平台');
const visual = (o: Offering) => o.category === '住宅物业' || o.id === 'residence-01' ? residenceImage : debtImage;
const publicVersion = (value?: string) => value ? value.replace(/^Mock\s*/i, '示例资料 ') : '待披露';
const publicTerm = (value: string) => value.replaceAll('每 Token 名义本金', '每份对应名义本金').replaceAll('Token', '份额');
const present = (o: Offering): Offering => {
  const status = o.id === 'residence-01' ? ({ upcoming: '即将开放', paused: '暂停', ended: '已结束', unknown: '待核实' } as Record<string, string>)[scenario] : undefined;
  return status ? { ...o, status } : o;
};
const publicOfferings = (c: Channel) => visibleOfferings(offerings, c, noListings).map(present);
const safeReturn = (c: Channel) => { const from = new URLSearchParams(location.search).get('from'); return from?.startsWith(root(c) + '/') && !from.includes('//') ? from : url(c, '/opportunities'); };

function Button({ href, children, secondary = false, disabled = false }: { href?: string; children: React.ReactNode; secondary?: boolean; disabled?: boolean }) {
  return href && !disabled ? <a className={'button' + (secondary ? ' button-secondary' : '')} href={href}>{children}</a> : <button className={'button' + (secondary ? ' button-secondary' : '')} type="button" disabled={disabled}>{children}</button>;
}
function Header({ c }: { c: Channel }) {
  return <header className="site-header"><div className="header-inner"><a className="brand" href={root(c)} aria-label={brand(c) + ' 首页'}>{c.kind === 'm' ? <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span> : <span className="issuer-mark" aria-hidden="true">{brand(c).slice(0,1)}</span>}<strong>{brand(c)}</strong></a><nav aria-label="主导航"><a className={path === root(c) ? 'active' : ''} href={root(c)}>首页</a><a className={path.includes('/opportunities') ? 'active' : ''} href={url(c, '/opportunities')}>投资机会</a><a href={url(c, '/investments')}>我的投资</a></nav><div className="header-actions"><a href={url(c, '/support')}>帮助</a><a href={url(c, '/messages')}>消息</a><a className="login-link" href={url(c, '/account')}>{activeAccount(c) ? '我的账户' : '登录'}</a></div></div></header>;
}
function Footer({ c }: { c: Channel }) {
  return <footer className="footer"><div className="container footer-main"><div><strong>{brand(c)}</strong><p>真实世界资产项目信息</p></div><nav aria-label="页脚"><a href={url(c, '/disclosures')}>风险提示</a><a href={url(c, '/support')}>帮助中心</a><a href={url(c, '/terms')}>使用条款</a><a href={url(c, '/privacy')}>隐私政策</a></nav></div><p className="container footer-note">当前项目、企业与交易记录为示例资料，尚不提供真实发行或交易服务；图片仅作示意，不构成投资建议或收益承诺。</p></footer>;
}
function Notice({ children }: { children: React.ReactNode }) { return <div className="notice" role="note"><span aria-hidden="true">!</span>{children}</div>; }
function Status({ value }: { value: string }) { return <span className={'status status-' + (value === '认购中' ? 'open' : 'closed')}>{value}</span>; }
function AssetVisual({ o, large = false }: { o: Offering; large?: boolean }) {
  const template = o.listing === 'pending' && !o.sourcePublicationId;
  return <div className={'asset-visual' + (large ? ' asset-visual-large' : '')}>{template ? <div className="template-visual" role="img" aria-label={o.category + '资产类型示意，暂无项目实拍'}><b>{assetGroup(o)}</b><strong>{o.category}</strong><small>ASSET PREVIEW</small></div> : <img src={visual(o)} alt={o.category + '示意配图，非项目实拍'} />}<span>{template ? '资产类型示意' : '配图仅作示意'}</span></div>;
}
function Card({ c, o }: { c: Channel; o: Offering }) {
  const facts = investmentFacts(o);
  const template = o.listing === 'pending' && !o.sourcePublicationId;
  return <article className="offering-card">
    <a className="card-image-link" href={assetUrl(c,o)}><AssetVisual o={o} /><Status value={o.status} /></a>
    <div className="card-content">
      <h3><a href={assetUrl(c,o)}>{o.title}</a></h3>
      {c.kind === 'm' && <p className="issuer-line">发行企业 · {o.issuerName}</p>}
      <p className="card-type">{assetGroup(o)} / {o.category} <span>·</span> {o.right} <span>·</span> {o.place}</p>
      {template ? <p className="template-note">尚未开放。以下仅介绍资产和可能的权益结构，认购条件以未来正式披露为准。</p> : <><div className="card-finance"><div><small>披露最低认购额</small><strong>{priceU(o.minimumCents)}</strong><small>单价 {priceU(o.priceCents)} / 投资份额</small></div><div><small>核心回报指标</small><strong>{o.yieldLine}</strong></div></div><p className="card-period"><span>期限 / 分配</span>{investmentPeriod(o)} · {facts[0]?.[0]} {facts[0]?.[1]}</p></>}
      <a className="card-action" href={assetUrl(c,o)}>{template ? '了解资产类型' : '查看项目详情'} <span aria-hidden="true">→</span></a>
    </div>
  </article>;
}
const cardGridClass = (count: number) => 'card-grid' + (count === 1 ? ' card-grid-single' : count === 2 ? ' card-grid-two' : '');
function Empty({ c, title, detail, clear }: { c: Channel; title: string; detail: string; clear?: () => void }) {
  return <div className="empty"><h3>{title}</h3><p>{detail}</p>{clear ? <button type="button" className="button button-secondary" onClick={clear}>清空筛选</button> : <Button href={url(c,'/opportunities')} secondary>浏览投资机会</Button>}</div>;
}
function Breadcrumb({ c, tail, from }: { c: Channel; tail: string; from?: string }) {
  return <div className="breadcrumb"><a href={root(c)}>首页</a><span>/</span><a href={from || url(c,'/opportunities')}>投资机会</a><span>/</span><span>{tail}</span></div>;
}
function Home({ c }: { c: Channel }) {
  const all = publicOfferings(c);
  const listed = filterOfferings(all.filter(o => o.listing === 'active' || o.sourcePublicationId), { sort: 'latest' }).slice(0,3);
  const previews = all.filter(o => o.listing === 'pending' && !o.sourcePublicationId);
  const categories = ['全部资产', ...new Set(all.map(assetGroup))];
  return <main>
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg,#fff 0%,#fffffff2 26%,#ffffffb0 47%,#ffffff00 72%),url("${heroImage}")` }}><div className="container hero-content"><p className="hero-kicker">REAL WORLD ASSETS</p><h1>{c.kind === 'm' ? '浏览不同企业的资产项目' : '探索本企业的资产项目'}</h1><p>{c.kind === 'm' ? '按发行企业、资产类型与投资者权益比较公开项目。' : '查看本企业公开项目及待开放的资产类型。'}</p><Button href={url(c,'/opportunities')}>浏览项目 <span aria-hidden="true">→</span></Button><small>当前项目及企业为示例资料；配图仅作示意，真实交易服务尚未开放。</small></div></section>
    {publishedDisclosureError && <div className="container"><Notice>新版发行披露数据无法读取：{publishedDisclosureError}。相关项目已暂时隐藏。</Notice></div>}
    <section className="container home-categories"><h2>按底层资产浏览</h2><div className="category-links">{categories.map(name => <a key={name} href={name === '全部资产' ? url(c,'/opportunities') : url(c,'/opportunities?category=' + encodeURIComponent(name))}>{name}</a>)}</div></section>
    <section className="container home-opportunities"><div className="section-head"><div><p className="eyebrow">PROJECTS</p><h2>{c.kind === 'm' ? '不同企业的公开项目' : '当前公开项目'}</h2><p>{c.kind === 'm' ? '比较发行企业、底层资产与权益安排。' : '以下项目属于当前企业渠道。'}</p></div><a className="text-link" href={url(c,'/opportunities')}>查看全部 →</a></div>{listed.length ? <div className={cardGridClass(listed.length)}>{listed.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <div className="empty"><h3>暂无公开项目</h3><p>当前没有可查看的公开上架项目。待开放资产在下方单独展示。</p></div>}</section>
    {c.kind === 'v' && previews.length > 0 && <section className="container home-opportunities preview-section"><div className="section-head"><div><p className="eyebrow">ASSET PREVIEW</p><h2>待开放资产类型</h2><p>以下为资产方向预览，尚无可认购项目或有效报价。</p></div></div><div className={cardGridClass(previews.length)}>{previews.map(o => <Card key={o.id} c={c} o={o} />)}</div></section>}
    <section className="container trust-strip"><div><span>◇</span><strong>底层资产</strong><p>查看资产信息与披露资料</p></div><div><span>✓</span><strong>权益说明</strong><p>以有效项目文件为准</p></div><div><span>◌</span><strong>风险提示</strong><p>投资可能导致本金损失</p></div></section>
  </main>;
}
function List({ c }: { c: Channel }) {
  const all = publicOfferings(c).filter(o => o.listing === 'active' || Boolean(o.sourcePublicationId));
  const previews = c.kind === 'v' ? publicOfferings(c).filter(o => o.listing === 'pending' && !o.sourcePublicationId) : [];
  const query = new URLSearchParams(location.search);
  const [filters,setFilters] = useState<OpportunityFilters>(() => ({
    search: query.get('search') || '', category: query.get('category') || '', subcategory: query.get('subcategory') || '',
    right: query.get('right') || '', place: query.get('place') || '', status: query.get('status') || '',
    issuer: query.get('issuer') || '', sort: query.get('sort') === 'closing' ? 'closing' : 'latest'
  }));
  const [page,setPage] = useState(1);
  useEffect(() => {
    const params = new URLSearchParams();
    for (const [key,value] of Object.entries(filters)) if (value && !(key === 'sort' && value === 'latest')) params.set(key,value);
    history.replaceState(null,'',url(c,'/opportunities') + (params.size ? '?' + params.toString() : ''));
  }, [c,filters]);
  const update = (key: keyof OpportunityFilters, value: string) => {
    setPage(1);
    setFilters(previous => ({ ...previous, [key]: value, ...(key === 'category' ? { subcategory: '' } : {}) }));
  };
  const list = filterOfferings(all, filters);
  const subcategories = [...new Set(all.filter(o => !filters.category || assetGroup(o) === filters.category).map(o => o.category))];
  const select = (label: string, key: keyof OpportunityFilters, options: string[]) => <label><span>{label}</span><select value={filters[key] || ''} onChange={event => update(key,event.target.value)}><option value="">全部</option>{options.map(value => <option key={value} value={value}>{value}</option>)}</select></label>;
  return <main className="container inner-page">
    <Breadcrumb c={c} tail="投资机会" />
    {publishedDisclosureError && <Notice>新版发行披露数据无法读取：{publishedDisclosureError}。相关项目已暂时隐藏。</Notice>}
    <div className="page-head"><div><p className="eyebrow">PROJECTS</p><h1>公开项目</h1><p>按底层资产、权益类型与发行企业浏览当前渠道的示例项目。真实认购服务尚未开放。</p></div><strong>{list.length} 个项目</strong></div>
    <div className="filters">
      <label className="search-field"><span>搜索项目或资产</span><input value={filters.search || ''} onChange={event => update('search',event.target.value)} placeholder="项目或资产名称" /></label>
      {select('资产大类','category',[...new Set(all.map(assetGroup))])}
      {select('资产子类','subcategory',subcategories)}
      {select('权益类型','right',[...new Set(all.map(o => o.right))])}
      {select('地区','place',[...new Set(all.map(o => o.place))])}
      {select('认购状态','status',[...new Set(all.map(o => o.status))])}
      {c.kind === 'm' && select('发行企业','issuer',[...new Set(all.map(o => o.issuerName))])}
      <label><span>排序</span><select value={filters.sort || 'latest'} onChange={event => update('sort',event.target.value)}><option value="latest">最新上架</option><option value="closing">认购截止时间</option></select></label>
      <button type="button" className="clear-filter" onClick={() => { setFilters({ sort: 'latest' }); setPage(1); }}>清空筛选</button>
    </div>
    {list.length ? <><div className={cardGridClass(Math.min(list.length,20))}>{list.slice((page-1)*20,page*20).map(o => <Card c={c} o={o} key={o.id} />)}</div>{list.length > 20 && <nav className="pagination" aria-label="投资机会分页"><button disabled={page === 1} onClick={() => setPage(page-1)}>上一页</button><span>{page} / {Math.ceil(list.length/20)}</span><button disabled={page >= Math.ceil(list.length/20)} onClick={() => setPage(page+1)}>下一页</button></nav>}</> : <Empty c={c} title="没有符合条件的投资机会" detail="请调整筛选条件，或清空筛选查看当前可公开项目。" clear={() => { setFilters({ sort: 'latest' }); setPage(1); }} />}
    {previews.length > 0 && <section className="preview-section"><div className="section-head"><div><p className="eyebrow">ASSET PREVIEW</p><h2>待开放资产类型</h2><p>仅作方向介绍，没有有效报价或认购入口。</p></div></div><div className={cardGridClass(previews.length)}>{previews.map(o => <Card c={c} o={o} key={o.id} />)}</div></section>}
  </main>;
}
function Detail({ c, o }: { c: Channel; o: Offering }) {
  const facts = investmentFacts(o);
  const currentRemaining = remainingUnits(o,readAllOrders(),Date.now());
  const action = actionState(o.status, identityFor(c));
  const actionUrl = url(c,'/subscribe/' + o.id + '/quote');
  const previewOnly = o.listing === 'pending' && !o.sourcePublicationId;
  const capacityReady = currentRemaining != null && currentRemaining >= minimumUnits(o);
  return <main className="container inner-page">
    <Breadcrumb c={c} tail={o.title} />
    <div className="detail-heading"><div><p className="eyebrow">{previewOnly ? 'ASSET PREVIEW' : 'PROJECT DETAILS'}</p><h1>{o.title}</h1><p>发行企业 · <a href={companyUrl(c,o)}>{o.issuerName} ↗</a></p></div><Status value={o.status} /></div>
    <div className="detail-grid"><div className="detail-main">
      <AssetVisual o={o} large />
      <div className="detail-facts"><div><small>底层资产</small><strong>{assetGroup(o)} · {o.category}</strong></div><div><small>投资者取得的权益</small><strong>{o.right}</strong></div><div><small>{previewOnly ? '开放状态' : '最低认购额'}</small><strong>{previewOnly ? '尚未开放' : priceU(o.minimumCents)}</strong></div></div>
      {!previewOnly && <div className="content-panel return-highlight"><small>核心投资回报指标</small><h2>{o.yieldLine}</h2><p>以已披露权益版本与风险文件为准；预期回报不构成实际应付收益。</p></div>}
      {previewOnly && <Notice>此资产类型尚无公开上架项目。认购条件与法律文件待正式披露，目前不可认购。</Notice>}
      <nav className="detail-tabs" aria-label="详情章节"><a href="#overview">资产概览</a><a href="#rights">权益与收益</a><a href="#offering">发行与认购</a><a href="#issuer">发行企业</a><a href="#documents">法律文件与风险</a></nav>
      <section className="content-panel" id="overview"><h2>资产概览</h2><p>{o.summary}</p><div className="info-grid">{o.features.map(([key,value]) => <div key={key}><small>{publicTerm(key)}</small><strong>{publicTerm(value)}</strong></div>)}</div><div className="version-note">底层资产版本：{previewOnly ? '待披露' : publicVersion(o.assetVersion)}</div></section>
      <section className="content-panel" id="rights"><h2>投资者权益与收益安排</h2><p>下面四项分别说明：投资什么项目、取得多少份额、支付多少示例金额、获得什么合同权益。</p><div className="rights-chain"><div><small>项目</small><strong>{o.title}</strong><span>发行企业 {o.issuerName}</span></div><div><small>投资份额</small><strong>{previewOnly ? '待披露' : minimumUnits(o) + ' 份起'}</strong><span>{previewOnly ? '认购条件未开放' : '每份 ' + priceU(o.priceCents) + ' · 示例'}</span></div><div><small>认购金额</small><strong>{previewOnly ? '待披露' : priceU(o.minimumCents) + ' 起'}</strong><span>示例金额，不含后续费用</span></div><div><small>取得的合同权益</small><strong>{o.right}</strong><span>以有效合同、法定登记与披露文件为准</span></div></div><p className="rights-note">份额凭证与链上记录是权益的技术形式，不自动等于企业股东身份或完整法律权利；认购金额也不等于债权本金或可分配收益。</p><div className="info-grid">{(previewOnly ? facts : o.terms).map(([key,value]) => <div key={key}><small>{publicTerm(key)}</small><strong>{previewOnly ? '待披露' : publicTerm(value)}</strong></div>)}</div><div className="version-note">权益条款版本：{previewOnly ? '待披露' : publicVersion(o.instrumentVersion)}</div></section>
      {o.returnMethodology && <section className="content-panel" id="return-basis"><h2>回报测算依据</h2><div className="info-grid"><div><small>测算价格与日期</small><strong>{o.returnMethodology.priceAtCalculation} U · {o.returnMethodology.calculatedAt}</strong></div><div><small>期间与口径</small><strong>{o.returnMethodology.period} · {o.returnMethodology.incomeBasis}</strong></div><div><small>资本增值</small><strong>{o.returnMethodology.includesAppreciation ? '包含' : '不包含'}</strong></div><div><small>费用与税费</small><strong>{o.returnMethodology.feesAndTaxes}</strong></div><div><small>主要假设</small><strong>{o.returnMethodology.assumptions}</strong></div><div><small>测算依据</small><strong>{o.returnMethodology.evidence}</strong></div></div><Notice>{o.returnMethodology.risks}</Notice></section>}
      {o.sourcePublicationId && o.spv && <section className="content-panel" id="legal-entities"><h2>SPV 与法律主体</h2><div className="info-grid"><div><small>SPV 法定名称</small><strong>{o.spv.legalName}</strong></div><div><small>注册地区</small><strong>{o.spv.jurisdiction}</strong></div>{o.spv.registrationNumber && <div><small>获准公开注册编号</small><strong>{o.spv.registrationNumber}</strong></div>}<div><small>发行中角色</small><strong>{o.spv.role}</strong></div><div><small>与底层资产关系</small><strong>{o.spv.assetRelationship}</strong></div><div><small>与发行企业关系</small><strong>{o.spv.issuerRelationship}</strong></div></div><a className="text-link" href="#documents">查看主体与权益文件 →</a></section>}
      <section className="content-panel" id="offering"><h2>发行与认购</h2>{previewOnly ? <p>当前仅展示资产类型，认购价格、容量和时间尚未正式披露。</p> : <div className="info-grid">
        <div><small>项目状态</small><strong>{o.status}</strong></div><div><small>公开上架</small><strong>当前渠道可见</strong></div>
        <div><small>认购开始 · UTC+8</small><strong>{o.opensAt || '待披露'}</strong></div><div><small>认购截止 · UTC+8</small><strong>{o.closesAt || '待披露'}</strong></div>
        <div><small>发行容量</small><strong>{o.supplyUnits == null ? '待核实' : o.supplyUnits + ' 份 · 示例'}</strong></div><div><small>可售容量</small><strong>{currentRemaining == null ? '待核实' : currentRemaining + ' 份 · 示例'}</strong></div>
        <div><small>每份价格</small><strong>{priceU(o.priceCents)}</strong></div><div><small>最低认购额</small><strong>{priceU(o.minimumCents)}</strong></div>
      </div>}<div className="version-note">项目披露版本：{previewOnly ? '待披露' : publicVersion(o.offeringVersion)} · 资产估值不等于募集额</div></section>
      <section className="content-panel company-panel" id="issuer"><div className="company-avatar">{o.issuerName.slice(0,1)}</div><div><small>发行企业</small><h2>{o.issuerName}</h2><p>企业认证不代表资产安全或收益担保。</p><a className="text-link" href={companyUrl(c,o)}>查看企业信息 →</a></div></section>
      <section className="content-panel" id="documents"><h2>法律文件与风险</h2><p>{previewOnly ? '正式文件待披露，以下不构成有效法律文件。' : '当前文件为示例资料；阅读或确认不构成有效签署。'}</p><div className="document-list">{o.documents.map((d,index) => <div key={d.id || d.name}><span>{d.name}</span><small>{previewOnly ? '待披露' : publicVersion(d.version)}</small>{!previewOnly && <a className="text-link" href={url(c, '/disclosures/' + o.id + '/' + index)}>查看文件版本 →</a>}</div>)}</div><Notice>{o.risk || '请以完整法律文件和风险披露为准；本金可能损失。'}</Notice></section>
    </div><aside className="summary-card action-panel"><p className="eyebrow">{previewOnly ? 'PREVIEW' : 'INVESTMENT TERMS'}</p><h2>{previewOnly ? '开放状态' : '认购信息'}</h2><Status value={o.status} />{previewOnly ? <><p>项目尚未开放，价格、容量与认购时间待正式披露。</p><a className="button button-secondary" href={url(c,'/opportunities')}>返回公开项目</a></> : <><div className="summary-price"><small>示例最低认购额</small><strong>{priceU(o.minimumCents)}</strong></div><div className="summary-row"><span>期限 / 分配</span><strong>{investmentPeriod(o)}</strong></div>{facts.map(([key,value]) => <div className="summary-metric" key={key}><small>{key}</small><strong>{value}</strong></div>)}<p className="action-reason">{action.enabled && !capacityReady ? '可售容量不足或待核实，暂不可认购' : '真实认购服务尚未开放；可先了解流程与条件。'}</p><Button href={action.enabled && capacityReady ? actionUrl : undefined} disabled={!action.enabled || !capacityReady}>{action.enabled && !capacityReady ? '暂不可认购' : action.enabled ? '了解认购流程' : action.label} <span aria-hidden="true">→</span></Button><p className="summary-foot">确认金额 → 阅读文件 → 付款状态 → 查看进度<br />真实认购与付款服务尚未开放。</p></>}</aside></div>
  </main>;
}function Company({ c, issuerId }: { c: Channel; issuerId: string }) {
  const publishedIssuer = offerings.find(o => o.issuerId === issuerId && o.sourcePublicationId);
  const company = issuers[issuerId as keyof typeof issuers] || (publishedIssuer ? { name: publishedIssuer.issuerName, legal: publishedIssuer.issuerName, region: publishedIssuer.place, business: '以获准公开的发行资料为准', disclosure: '仅展示已授权公开的项目资料', intro: '发行企业信息以已发布的披露版本为准。' } : undefined);
  if (!company || !canShowCompany(offerings,c,issuerId,noListings)) return <NotFound c={c} />;
  const list = publicOfferings(c).filter(o => o.issuerId === issuerId && (o.listing === 'active' || o.sourcePublicationId));
  const previews = c.kind === 'v' ? publicOfferings(c).filter(o => o.issuerId === issuerId && o.listing === 'pending' && !o.sourcePublicationId) : [];
  return <main className="container inner-page"><div className="breadcrumb"><a href={safeReturn(c)}>返回来源页面</a><span>/</span>企业信息</div>
    <div className="company-hero"><div className="company-avatar large">{company.name.slice(0,1)}</div><div><p className="eyebrow">ISSUER PROFILE</p><h1>{company.name}</h1><p>{company.legal}</p></div></div>
    <section className="content-panel"><h2>企业介绍</h2><p>{company.intro}</p><div className="info-grid"><div><small>注册国家 / 地区</small><strong>{company.region}</strong></div><div><small>业务方向</small><strong>{company.business}</strong></div><div><small>经授权公开资料</small><strong>{company.disclosure}</strong></div><div><small>企业与底层资产权利人</small><strong>可能不同；以各项目资产文件为准</strong></div></div><Notice>企业认证不代表资产安全或收益担保。</Notice></section>
    <div className="section-head"><h2>当前公开项目</h2></div>{list.length ? <div className={cardGridClass(list.length)}>{list.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <Empty c={c} title="暂无当前渠道公开项目" detail="该企业目前没有公开上架项目。" />}{previews.length > 0 && <section className="preview-section"><div className="section-head"><h2>待开放资产类型</h2></div><div className={cardGridClass(previews.length)}>{previews.map(o => <Card key={o.id} c={c} o={o} />)}</div></section>}
  </main>;
}const stepSlugs = ['quote','documents','payment','progress'] as const;
function Subscribe({ c, o, step }: { c: Channel; o: Offering; step: number }) {
  return <SubscriptionPage channel={c} offering={o} step={step} scenario={scenario} />;
}
function Placeholder({ c, name }: { c: Channel; name: string }) {
  const from = new URLSearchParams(location.search).get('from');
  const back = from?.startsWith(root(c) + '/') && !from.includes('//') ? from : url(c,'/opportunities');
  return <main className="container inner-page"><Breadcrumb c={c} tail={name} /><div className="empty"><h1>{name}</h1><p>此功能将在后续阶段实现。当前页面不展示虚构账户或业务数据。</p><Button href={back} secondary>返回原项目或投资机会</Button></div></main>;
}
function NotFound({ c }: { c: Channel }) { return <main className="container inner-page"><Empty c={c} title="页面或资产不可访问" detail="链接无效，或当前渠道未获准公开此内容。" /></main>; }
function Demo() {
  const set = (value: string, dest = '/m') => { sessionStorage.setItem(scenarioKey,value); location.href = dest; };
  const [scope,setScope] = useState('/m');
  const [kyc,setKyc] = useState<KycStatus>('approved');
  const [mpc,setMpc] = useState<MpcStatus>('ready');
  const selected: Channel = scope === '/m' ? { kind:'m' } : { kind:'v', issuerSlug:scope === '/v/harbor' ? 'harbor' : 'cedar' };
  const demoAccount = activeAccount(selected);
  const applyAccount = () => {
    if (!demoAccount) return;
    const next = mpc === 'ready' ? withMpcResult(demoAccount,'ready') : { ...demoAccount, mpc, defaultWallet:demoAccount.defaultWallet === 'mpc' ? (demoAccount.ownVerified ? 'own' as const : undefined) : demoAccount.defaultWallet, walletVersion:demoAccount.walletVersion + (demoAccount.defaultWallet === 'mpc' ? 1 : 0) };
    saveAccount(selected,{ ...next, kyc, kycUpdatedAt:new Date().toISOString() });
    location.href = scope + '/account';
  };
  const items: [string,string,string][] = [['normal','未登录 · 正常项目','/m/opportunities/residence-01'],['ready','已登录且 KYC 已通过 · Mock','/m/opportunities/residence-01'],['kyc-required','已登录但需 KYC · Mock','/m/subscribe/residence-01/documents'],['upcoming','即将开放','/m/opportunities/residence-01'],['paused','暂停认购','/m/opportunities/residence-01'],['ended','认购已结束','/m/opportunities/residence-01'],['unknown','状态待核实','/m/opportunities/residence-01'],['no-listings','M 无有效 Listing','/m'],['mock-loading','加载状态预览','/m/opportunities'],['mock-error','异常状态预览','/m/opportunities'],['v-asset-harbor','V 海岚 · 四类房地产模板','/v/harbor/opportunities'],['v-asset-cedar','V 杉衡 · 债权及股权模板','/v/cedar/opportunities'],['payment-pending','付款待核实','/m/subscribe/residence-01/progress'],['payment-failed','付款失败','/m/subscribe/residence-01/progress'],['payment-unknown','付款状态未知','/m/subscribe/residence-01/progress'],['registration-pending','法定登记待核实','/m/subscribe/residence-01/progress'],['delivery-pending','Token 交付待核实','/m/subscribe/residence-01/progress']];
  return <main className="container inner-page"><p className="eyebrow">MOCK CONTROL</p><h1>独立演示控制台</h1><p>只改变本机前端 Mock 场景；不会产生真实登录、KYC、付款或登记事实。</p><div className="demo-controls">{items.map(([value,label,dest]) => <button key={value} onClick={() => set(value,dest)}>{label}</button>)}</div><p>当前页面场景：{scenario}</p><section className="content-panel demo-account"><h2>账户 / KYC / MPC 状态模拟</h2><p>先在对应渠道建立本地示例账户，再在此切换服务结果。状态变化仅影响该渠道账户。</p><div className="demo-account-controls"><label>账户渠道<select value={scope} onChange={event => setScope(event.target.value)}><option value="/m">M 平台</option><option value="/v/harbor">V 海岚</option><option value="/v/cedar">V 杉衡</option></select></label><label>KYC 结果<select value={kyc} onChange={event => setKyc(event.target.value as KycStatus)}>{(['not-started','processing','supplement','approved','failed','expired','unknown'] as KycStatus[]).map(value => <option key={value} value={value}>{value}</option>)}</select></label><label>MPC 结果<select value={mpc} onChange={event => setMpc(event.target.value as MpcStatus)}>{(['creating','ready','failed','unknown','service-gated'] as MpcStatus[]).map(value => <option key={value} value={value}>{value}</option>)}</select></label><button className="button" type="button" disabled={!demoAccount} onClick={applyAccount}>应用 Mock 结果</button></div><p>{demoAccount ? '当前账户：'+demoAccount.email : '该渠道当前标签未登录。'} <a className="text-link" href={scope + '/account?demo=1'}>打开本地账户模拟 →</a></p><p><a className="text-link" href={scope + '/subscribe/' + (selected.kind === 'v' && selected.issuerSlug === 'cedar' ? 'debt-01' : 'residence-01') + '/quote?demo=1'}>打开四步认购模拟 →</a></p></section><DemoBusinessControls channel={selected} /><DemoDistributionControls channel={selected} /><a className="text-link" href="/m">进入 M 首页 →</a></main>;
}
function App() {
  if (path === '/demo') return <Demo />;
  if (!channel) return <main className="container inner-page"><h1>选择投资者平台演示入口</h1><div className="entry-links"><Button href="/v/harbor">V · 海岚资产</Button><Button href="/v/cedar" secondary>V · 杉衡资本</Button><Button href="/m" secondary>M · RWA Invest</Button></div></main>;
  const c = channel;
  const tail = path.slice(root(c).length) || '/';
  const detailMatch = /^\/opportunities\/([^/]+)$/.exec(tail);
  const companyMatch = /^\/issuers\/([^/]+)$/.exec(tail);
  const stepMatch = /^\/subscribe\/([^/]+)\/(quote|documents|payment|progress)$/.exec(tail);
  const orderMatch = /^\/investments\/orders\/([^/]+)$/.exec(tail);
  const holdingMatch = /^\/investments\/holdings\/([^/]+)$/.exec(tail);
  const distributionMatch = /^\/investments\/returns\/([^/]+)$/.exec(tail);
  const ticketMatch = /^\/account\/tickets\/([^/]+)$/.exec(tail);
  const messageMatch = /^\/messages\/([^/]+)$/.exec(tail);
  const documentMatch = /^\/disclosures\/([^/]+)\/(\d+)$/.exec(tail);
  const announcementMatch = /^\/disclosures\/announcements\/([^/]+)$/.exec(tail);
  const accountMatch = /^\/account(\/profile|\/kyc|\/wallets|\/security|\/tickets)?$/.exec(tail);
  const visible = publicOfferings(c);
  let content: React.ReactNode;
  if (scenario === 'mock-loading' && (tail === '/opportunities' || detailMatch)) content = <main className="container inner-page"><div className="empty" role="status"><h1>正在加载项目</h1><p>正在获取当前渠道的公开项目信息。</p><Button href={root(c)} secondary>返回首页</Button></div></main>;
  else if (scenario === 'mock-error' && (tail === '/opportunities' || detailMatch)) content = <main className="container inner-page"><div className="empty" role="alert"><h1>项目暂时无法显示</h1><p>当前无法核实项目信息，请稍后重试。</p><Button href={root(c)} secondary>返回首页</Button></div></main>;
  else if (tail === '/') content = <Home c={c} />;
  else if (tail === '/opportunities') content = <List c={c} />;
  else if (detailMatch) { const o = visible.find(item => item.id === detailMatch[1]); content = o ? <Detail c={c} o={o} /> : <NotFound c={c} />; }
  else if (companyMatch) content = <Company c={c} issuerId={companyMatch[1]} />;
  else if (stepMatch) { const o = visible.find(item => item.id === stepMatch[1]); content = o && o.status === '认购中' ? <Subscribe c={c} o={o} step={stepSlugs.indexOf(stepMatch[2] as typeof stepSlugs[number])} /> : <NotFound c={c} />; }
  else if (orderMatch) content = <OrderDetailPage channel={c} id={safeDecode(orderMatch[1])} />;
  else if (holdingMatch) content = <HoldingDetailPage channel={c} id={safeDecode(holdingMatch[1])} />;
  else if (distributionMatch) content = <DistributionDetailPage channel={c} id={safeDecode(distributionMatch[1])} />;
  else if (ticketMatch) content = <TicketDetailPage channel={c} id={safeDecode(ticketMatch[1])} />;
  else if (messageMatch) content = <MessageDetailPage channel={c} id={safeDecode(messageMatch[1])} noListings={noListings} />;
  else if (announcementMatch) content = <AnnouncementDetailPage channel={c} id={safeDecode(announcementMatch[1])} noListings={noListings} />;
  else if (documentMatch) content = <DisclosureDocumentPage channel={c} offeringId={safeDecode(documentMatch[1])} index={Number(documentMatch[2])} noListings={noListings} />;
  else if (accountMatch) content = <AccountPage channel={c} section={accountMatch[1] || ''} />;
  else if (tail === '/investments') content = <InvestmentsPage channel={c} />;
  else if (tail === '/support') content = <SupportPage channel={c} />;
  else if (tail === '/messages') content = <MessagesPage channel={c} noListings={noListings} />;
  else if (tail === '/disclosures') content = <DisclosuresPage channel={c} noListings={noListings} />;
  else if (['/terms','/privacy'].includes(tail)) content = <Placeholder c={c} name={{ '/terms':'使用条款','/privacy':'隐私政策' }[tail]!} />;
  else content = <NotFound c={c} />;
  return <><Header c={c} />{content}<Footer c={c} /></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
