import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { actionState, assetGroup, basePath, canShowCompany, documentListState, draftStorageKey, filterOfferings, investmentFacts, investmentPeriod, minimumUnits, parseChannel, priceU, quantityError, stepDisplayState, totalCents, visibleOfferings, type Channel, type Offering, type OpportunityFilters } from './domain';
import { offerings, issuers } from './data';
import heroImage from './assets/dev01r-hero.png';
import residenceImage from './assets/dev01r-residence.png';
import debtImage from './assets/dev01r-debt.png';
import './redesign.css';

const path = location.pathname.replace(/\/$/, '') || '/';
const channel = parseChannel(path);
const scenarioKey = 'rwa-investor-dev01-scenario';
const scenario = sessionStorage.getItem(scenarioKey) || 'normal';
const noListings = scenario === 'no-listings';
const identity: 'guest' | 'kyc' | 'ready' = scenario === 'ready' ? 'ready' : scenario === 'kyc-required' ? 'kyc' : 'guest';
const root = (c: Channel) => basePath(c);
const url = (c: Channel, suffix = '') => root(c) + suffix;
const assetUrl = (c: Channel, o: Offering) => url(c, '/opportunities/' + o.id);
const companyUrl = (c: Channel, o: Offering) => url(c, '/issuers/' + o.issuerId) + '?from=' + encodeURIComponent(assetUrl(c, o));
const brand = (c: Channel) => c.kind === 'm' ? 'RWA Invest' : (issuers[c.issuerSlug as keyof typeof issuers]?.name || '企业投资平台');
const visual = (o: Offering) => o.id === 'residence-01' ? residenceImage : debtImage;
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
  return <header className="site-header"><div className="header-inner"><a className="brand" href={root(c)} aria-label={brand(c) + ' 首页'}>{c.kind === 'm' ? <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span> : <span className="issuer-mark" aria-hidden="true">{brand(c).slice(0,1)}</span>}<strong>{brand(c)}</strong></a><nav aria-label="主导航"><a className={path === root(c) ? 'active' : ''} href={root(c)}>首页</a><a className={path.includes('/opportunities') ? 'active' : ''} href={url(c, '/opportunities')}>投资机会</a><a href={url(c, '/investments')}>我的投资</a></nav><div className="header-actions"><a href={url(c, '/support')}>帮助</a><a href={url(c, '/messages')}>消息</a><a className="login-link" href={url(c, '/account')}>{identity === 'guest' ? '登录' : '我的账户'}</a></div></div></header>;
}
function Footer({ c }: { c: Channel }) {
  return <footer className="footer"><div className="container footer-main"><div><strong>{brand(c)}</strong><p>真实世界资产投资信息 · 前端 Mock 演示</p></div><nav aria-label="页脚"><a href={url(c, '/disclosures')}>风险提示</a><a href={url(c, '/support')}>帮助中心</a><a href={url(c, '/terms')}>使用条款</a><a href={url(c, '/privacy')}>隐私政策</a></nav></div><p className="container footer-note">项目、企业、图片及交易状态均为演示资料，不构成真实发行、投资建议或收益承诺。</p></footer>;
}
function Notice({ children }: { children: React.ReactNode }) { return <div className="notice" role="note"><span aria-hidden="true">!</span>{children}</div>; }
function Status({ value }: { value: string }) { return <span className={'status status-' + (value === '认购中' ? 'open' : 'closed')}>{value}</span>; }
function AssetVisual({ o, large = false }: { o: Offering; large?: boolean }) {
  return <div className={'asset-visual' + (large ? ' asset-visual-large' : '')}>{o.listing === 'pending' ? <div className="template-visual" role="img" aria-label={o.category + '资产模板，暂无项目实拍'}><b>{assetGroup(o)}</b><strong>{o.category}</strong><small>ASSET TEMPLATE · MOCK</small></div> : <img src={visual(o)} alt={o.category + '演示配图，非项目实拍'} />}<span>{o.listing === 'pending' ? '模板展示 · Mock' : '资产配图 · Mock'}</span></div>;
}
function Card({ c, o }: { c: Channel; o: Offering }) {
  const facts = investmentFacts(o);
  return <article className="offering-card">
    <a className="card-image-link" href={assetUrl(c,o)}><AssetVisual o={o} /><Status value={o.status} /></a>
    <div className="card-content">
      <h3><a href={assetUrl(c,o)}>{o.title}</a></h3>
      {c.kind === 'm' && <p className="issuer-line">发行企业 · {o.issuerName}</p>}
      <p className="card-type">{assetGroup(o)} / {o.category} <span>·</span> {o.right} <span>·</span> {o.place}</p>
      <div className="card-finance"><div><small>最低认购额</small><strong>{priceU(o.minimumCents)}</strong><small>单价 {priceU(o.priceCents)} / Token</small></div><div><small>{facts[0][0]}</small><strong>{facts[0][1]}</strong></div></div>
      <p className="card-period"><span>期限 / 分配</span>{investmentPeriod(o)}</p>
      <a className="card-action" href={assetUrl(c,o)}>查看项目详情 <span aria-hidden="true">→</span></a>
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
  const list = filterOfferings(all, { sort: 'latest' }).slice(0,3);
  const categories = ['全部资产', ...new Set(all.map(assetGroup))];
  return <main><section className="hero" style={{ backgroundImage: `linear-gradient(90deg,#fff 0%,#fffffff2 26%,#ffffffb0 47%,#ffffff00 72%),url("${heroImage}")` }}><div className="container hero-content"><p className="hero-kicker">REAL WORLD ASSETS</p><h1>连接真实资产与全球投资者</h1><p>合规、透明、可追溯的 RWA 投资平台</p><Button href={url(c,'/opportunities')}>浏览投资机会 <span aria-hidden="true">→</span></Button><small>Mock 演示 · 配图仅作视觉示意</small></div></section><section className="container home-categories"><h2>投资资产类型浏览</h2><div className="category-links">{categories.map(name => <a key={name} href={name === '全部资产' ? url(c,'/opportunities') : url(c,'/opportunities?category=' + encodeURIComponent(name))}>{name}</a>)}</div></section><section className="container home-opportunities"><div className="section-head"><div><p className="eyebrow">INVESTMENT OPPORTUNITIES</p><h2>{c.kind === 'm' ? '最新上架机会' : '投资机会'}</h2></div><a className="text-link" href={url(c,'/opportunities')}>查看更多 →</a></div>{list.length ? <div className={cardGridClass(list.length)}>{list.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <Empty c={c} title="暂无公开投资机会" detail="当前渠道没有可展示的有效项目。" />}</section><section className="container trust-strip"><div><span>◇</span><strong>真实资产</strong><p>底层资产与权益结构分别披露</p></div><div><span>✓</span><strong>权益披露</strong><p>关键条款以项目文件为准</p></div><div><span>◌</span><strong>风险提示</strong><p>投资可能导致本金损失</p></div></section></main>;
}
function List({ c }: { c: Channel }) {
  const all = publicOfferings(c);
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
    <div className="page-head"><div><p className="eyebrow">OPPORTUNITIES</p><h1>投资机会</h1><p>按底层资产、权益与认购条件浏览当前渠道公开的 Mock 项目。</p></div><strong>{list.length} 个项目</strong></div>
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
  </main>;
}
function Detail({ c, o }: { c: Channel; o: Offering }) {
  const facts = investmentFacts(o);
  const action = actionState(o.status, identity);
  const actionUrl = identity === 'guest' ? url(c,'/account?from=' + encodeURIComponent(assetUrl(c,o))) : url(c,'/subscribe/' + o.id + '/quote');
  const previewOnly = o.listing === 'pending';
  return <main className="container inner-page">
    <Breadcrumb c={c} tail={o.title} />
    <div className="detail-heading"><div><p className="eyebrow">INVESTMENT OPPORTUNITY · MOCK</p><h1>{o.title}</h1><p>发行企业 · <a href={companyUrl(c,o)}>{o.issuerName} ↗</a></p></div><Status value={o.status} /></div>
    <div className="detail-grid"><div className="detail-main">
      <AssetVisual o={o} large />
      <div className="detail-facts"><div><small>底层资产</small><strong>{assetGroup(o)} · {o.category}</strong></div><div><small>投资者权益</small><strong>{o.right}</strong></div><div><small>最低认购额</small><strong>{priceU(o.minimumCents)}</strong></div></div>
      {previewOnly && <Notice>此资产模板尚无 M 有效 Listing，当前不可认购。金额与条款仅用于 Mock 字段演示。</Notice>}
      <nav className="detail-tabs" aria-label="详情章节"><a href="#overview">资产概览</a><a href="#rights">权益与收益</a><a href="#offering">发行与认购</a><a href="#issuer">发行企业</a><a href="#documents">法律文件与风险</a></nav>
      <section className="content-panel" id="overview"><h2>资产概览</h2><p>{o.summary}</p><div className="info-grid">{o.features.map(([key,value]) => <div key={key}><small>{key}</small><strong>{value}</strong></div>)}</div><div className="version-note">底层资产版本：{o.assetVersion || '待核实'}</div></section>
      <section className="content-panel" id="rights"><h2>权益结构与收益安排</h2><div className="info-grid">{o.terms.map(([key,value]) => <div key={key}><small>{key}</small><strong>{value}</strong></div>)}</div><div className="version-note">权益条款版本：{o.instrumentVersion || '待核实'}</div></section>
      <section className="content-panel" id="offering"><h2>发行与认购</h2><div className="info-grid">
        <div><small>Offering 状态</small><strong>{o.status}</strong></div><div><small>公开上架</small><strong>{o.listing === 'active' ? '当前渠道可见' : 'M 未上架 · V 模板展示'}</strong></div>
        <div><small>认购开始 · UTC+8</small><strong>{o.opensAt || '待披露'}</strong></div><div><small>认购截止 · UTC+8</small><strong>{o.closesAt || '待披露'}</strong></div>
        <div><small>发行容量</small><strong>{o.supplyUnits == null ? '待核实' : o.supplyUnits + ' Token · Mock'}</strong></div><div><small>可售容量</small><strong>{o.availableUnits == null ? '待核实' : o.availableUnits + ' Token · Mock'}</strong></div>
        <div><small>Token 单价</small><strong>{priceU(o.priceCents)}</strong></div><div><small>最低认购额</small><strong>{priceU(o.minimumCents)}</strong></div>
      </div><div className="version-note">Offering 快照版本：{o.offeringVersion || '待核实'} · 资产估值不等于募集额</div></section>
      <section className="content-panel company-panel" id="issuer"><div className="company-avatar">{o.issuerName.slice(0,1)}</div><div><small>发行企业</small><h2>{o.issuerName}</h2><p>企业认证不代表资产安全或收益担保。</p><a className="text-link" href={companyUrl(c,o)}>查看企业信息 →</a></div></section>
      <section className="content-panel" id="documents"><h2>法律文件与风险</h2><p>以下为 Mock 文件清单，文件内容与模拟确认将在后续认购阶段提供；当前无有效签署。</p><div className="document-list">{o.documents.map(d => <div key={d.name}><span>{d.name}</span><small>{d.version}</small></div>)}</div><Notice>{o.risk || '请以完整法律文件和风险披露为准；本金可能损失。'}</Notice></section>
    </div><aside className="summary-card action-panel"><p className="eyebrow">INVESTMENT TERMS</p><h2>认购信息</h2><Status value={o.status} /><div className="summary-price"><small>最低认购额</small><strong>{priceU(o.minimumCents)}</strong></div><div className="summary-row"><span>Token 单价</span><strong>{priceU(o.priceCents)}</strong></div><div className="summary-row"><span>最低份数</span><strong>{minimumUnits(o)} Token</strong></div><div className="summary-row"><span>可售容量</span><strong>{o.availableUnits == null ? '待核实' : o.availableUnits + ' Token · Mock'}</strong></div><div className="summary-row"><span>期限 / 分配</span><strong>{investmentPeriod(o)}</strong></div>{facts.map(([key,value]) => <div className="summary-metric" key={key}><small>{key}</small><strong>{value}</strong></div>)}<p className="action-reason">{action.reason}</p><Button href={action.enabled && !previewOnly ? actionUrl : undefined} disabled={!action.enabled || previewOnly}>{action.label} <span aria-hidden="true">→</span></Button><p className="summary-foot">确认金额 → 阅读文件 → 钱包付款 → 查看进度<br />本页面不会执行真实交易。</p></aside></div>
  </main>;
}function Company({ c, issuerId }: { c: Channel; issuerId: string }) {
  const company = issuers[issuerId as keyof typeof issuers];
  if (!company || !canShowCompany(offerings,c,issuerId,noListings)) return <NotFound c={c} />;
  const list = publicOfferings(c).filter(o => o.issuerId === issuerId);
  return <main className="container inner-page"><div className="breadcrumb"><a href={safeReturn(c)}>返回来源页面</a><span>/</span>企业信息</div>
    <div className="company-hero"><div className="company-avatar large">{company.name.slice(0,1)}</div><div><p className="eyebrow">ISSUER PROFILE · MOCK</p><h1>{company.name}</h1><p>{company.legal}</p></div></div>
    <section className="content-panel"><h2>企业介绍</h2><p>{company.intro}</p><div className="info-grid"><div><small>注册国家 / 地区</small><strong>{company.region}</strong></div><div><small>业务方向</small><strong>{company.business}</strong></div><div><small>经授权公开资料</small><strong>{company.disclosure}</strong></div><div><small>企业与底层资产权利人</small><strong>可能不同；以各项目资产文件为准</strong></div></div><Notice>企业认证不代表资产安全或收益担保。</Notice></section>
    <div className="section-head"><h2>当前渠道可见项目</h2></div>{list.length ? <div className={cardGridClass(list.length)}>{list.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <Empty c={c} title="暂无当前渠道公开项目" detail="该企业目前没有可展示的项目。" />}
  </main>;
}const stepNames = ['确认认购','文件清单','钱包付款','交易进度'] as const;
const stepSlugs = ['quote','documents','payment','progress'] as const;
function Subscribe({ c, o, step }: { c: Channel; o: Offering; step: number }) {
  const quantityKey = draftStorageKey(c,o,'quantity');
  const listAckKey = draftStorageKey(c,o,'list-ack');
  const visitedKey = draftStorageKey(c,o,'visited');
  const [quantity,setQuantity] = useState(() => sessionStorage.getItem(quantityKey) ?? String(minimumUnits(o)));
  const [listAcknowledged,setListAcknowledged] = useState(() => sessionStorage.getItem(listAckKey) === 'yes');
  const [visited] = useState<number[]>(() => [...new Set([...(sessionStorage.getItem(visitedKey) || '').split(',').filter(Boolean).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < stepNames.length),step])]);
  useEffect(() => { sessionStorage.setItem(visitedKey,visited.join(',')); }, [visitedKey,visited]);
  const checklist = documentListState(listAcknowledged);
  const error = quantityError(quantity,o);
  const total = error ? 0 : totalCents(quantity,o);
  const stepUrl = (index: number) => url(c,'/subscribe/' + o.id + '/' + stepSlugs[index]);
  const updateQuantity = (value: string) => { setQuantity(value); sessionStorage.setItem(quantityKey,value); };
  const kycBlocked = identity !== 'ready';
  const progress = scenario === 'payment-pending' ? ['付款状态待确认','待付款核实','待付款核实','待付款核实'] : scenario === 'registration-pending' ? ['Mock 已核实','Mock 已配售','法定登记待核实','待登记核实'] : scenario === 'delivery-pending' ? ['Mock 已核实','Mock 已配售','Mock 已登记','Token 交付待核实'] : ['未发起 · Mock','未开始 · Mock','未开始 · Mock','未开始 · Mock'];
  return <main className="container inner-page"><Breadcrumb c={c} tail="认购演示" from={assetUrl(c,o)} /><div className="subscribe-head"><p className="eyebrow">SUBSCRIPTION · MOCK</p><h1>{o.title}</h1><p>四步认购演示 · 不生成真实订单、不连接钱包或付款</p></div><nav className="stepper" aria-label="认购步骤">{stepNames.map((name,index) => { const state = stepDisplayState(index,step,visited); const label = `${name}，${state === 'current' ? '当前预览' : state === 'viewed' ? '已查看' : '未查看'}`; return index <= step || state === 'viewed' ? <a key={name} href={stepUrl(index)} className={state} aria-label={label} aria-current={state === 'current' ? 'step' : undefined}><span>{index+1}</span>{name}</a> : <span key={name} className="locked" aria-label={label}><span>{index+1}</span>{name}</span>; })}</nav><p className="stepper-note">步骤条仅显示页面查看记录；不代表文件签署、付款、配售或登记完成。</p><div className="subscribe-grid"><section className="content-panel step-content"><p className="step-overline">STEP {step+1} / 04</p><h2>{stepNames[step]}</h2>
    {step === 0 && <><p>填写整数 Token 份数，核对本次演示金额。草稿不占用发行容量。</p><label className="field-label" htmlFor="quantity">认购 Token 份数</label><div className="quantity-control"><input id="quantity" inputMode="numeric" value={quantity} onChange={event => updateQuantity(event.target.value)} aria-invalid={!!error} aria-describedby="quantity-help" /><span>Token</span></div><small id="quantity-help" className={error ? 'error' : 'hint'}>{error || `最低 ${minimumUnits(o)} 份 · 演示上限 ${o.maxUnits} 份`}</small><div className="calculation"><div><span>Token 单价</span><strong>{priceU(o.priceCents)}</strong></div><div><span>认购份数</span><strong>{error ? '待修正' : quantity + ' Token'}</strong></div><div><span>认购金额</span><strong>{error ? '—' : priceU(total)}</strong></div></div><Notice>正式报价、可售容量与投资资格需由后续真实系统核验。</Notice></>}
    {step === 1 && <><p>以下仅为 Mock 文件名称与版本清单，当前没有可阅读正文。此页只演示认购流程中的文件检查位置。</p><div className="document-list">{o.documents.map(d => <div key={d.name}><span>{d.name}</span><small>{d.version}</small></div>)}</div><label className="check-row"><input type="checkbox" checked={listAcknowledged} onChange={event => { setListAcknowledged(event.target.checked); sessionStorage.setItem(listAckKey,event.target.checked ? 'yes' : 'no'); }} />我已了解上述文件清单仅供 Mock 演示，尚无正文供阅读</label><Notice>此勾选不是文件阅读确认、电子签署或有效法律同意；本阶段无法创建真实待付款订单。</Notice>{kycBlocked && <div className="blocked-note">需完成身份认证后继续；当前身份认证尚未接入，<a href={url(c,'/account?from=' + encodeURIComponent(stepUrl(step)))}>查看账户说明</a>。</div>}</>}
    {step === 2 && <><p>付款条件与收款对象仅作视觉演示，当前不能真实签名或付款。</p><div className="payment-card"><div><small>演示网络</small><strong>OP Mainnet</strong></div><div><small>计价与付款币种</small><strong>USDT · U</strong></div><div><small>付款钱包</small><strong>Mock 钱包 · 未连接</strong></div><div><small>Token 接收地址</small><strong>Mock 地址 · 未验证</strong></div><div><small>Offering 收款合约</small><strong>Mock 合约 · 未核实</strong></div></div><button type="button" className="button" disabled>付款不可执行</button><Notice>授权不等于付款，演示页面不会发送交易。可查看独立的交易进度样板。</Notice></>}
    {step === 3 && <><p className="progress-preview">Mock 交易进度预览 · 可直接查看。页面访问与清单勾选均不代表付款、签署或后续业务完成。</p><p>付款、配售、法定登记和 Token 交付分别核实；前一步完成不代表后续环节完成。</p><div className="timeline">{['付款','配售','法定登记','Token 交付'].map((name,index) => <div key={name}><span className="timeline-dot" /><strong>{name}</strong><small>{progress[index]}</small></div>)}</div><Notice>所有状态仅为独立 Mock 场景展示，不代表真实链上或法定事实。</Notice></>}
    <div className="step-actions"><Button href={step === 0 ? assetUrl(c,o) : stepUrl(step-1)} secondary>{step === 0 ? '返回项目详情' : '上一步'}</Button>{step < 3 && <Button href={stepUrl(step+1)} disabled={(step === 0 && !!error) || (step === 1 && (!checklist.canPreviewNext || kycBlocked))}>{['确认认购信息并查看清单','了解清单并查看付款演示','查看交易进度预览'][step]} →</Button>}</div></section><aside className="summary-card"><p className="eyebrow">ORDER SUMMARY · MOCK</p><h2>认购摘要</h2><div className="summary-row"><span>项目</span><strong>{o.title}</strong></div><div className="summary-row"><span>权益类型</span><strong>{o.right}</strong></div><div className="summary-row"><span>Token 单价</span><strong>{priceU(o.priceCents)}</strong></div><div className="summary-row"><span>份数</span><strong>{quantity || '—'}</strong></div><div className="summary-total"><span>演示总额</span><strong>{error ? '—' : priceU(total)}</strong></div><p className="summary-foot">不是有效报价或支付指令。</p></aside></div></main>;
}
function Placeholder({ c, name }: { c: Channel; name: string }) {
  const from = new URLSearchParams(location.search).get('from');
  const back = from?.startsWith(root(c) + '/') && !from.includes('//') ? from : url(c,'/opportunities');
  return <main className="container inner-page"><Breadcrumb c={c} tail={name} /><div className="empty"><h1>{name}</h1><p>{name === '我的账户' && identity === 'guest' ? '登录功能将在后续阶段接入。当前可公开浏览项目；认购上下文已保留在返回链接中。' : '此功能将在后续阶段实现。当前页面不展示虚构账户或业务数据。'}</p><Button href={back} secondary>返回原项目或投资机会</Button></div></main>;
}
function NotFound({ c }: { c: Channel }) { return <main className="container inner-page"><Empty c={c} title="页面或资产不可访问" detail="链接无效，或当前渠道未获准公开此内容。" /></main>; }
function Demo() {
  const set = (value: string, dest = '/m') => { sessionStorage.setItem(scenarioKey,value); location.href = dest; };
  const items: [string,string,string][] = [['normal','未登录 · 正常项目','/m/opportunities/residence-01'],['ready','已登录且 KYC 已通过 · Mock','/m/opportunities/residence-01'],['kyc-required','已登录但需 KYC · Mock','/m/subscribe/residence-01/documents'],['upcoming','即将开放','/m/opportunities/residence-01'],['paused','暂停认购','/m/opportunities/residence-01'],['ended','认购已结束','/m/opportunities/residence-01'],['unknown','状态待核实','/m/opportunities/residence-01'],['no-listings','M 无有效 Listing','/m'],['mock-loading','加载状态预览','/m/opportunities'],['mock-error','异常状态预览','/m/opportunities'],['v-asset-harbor','V 海岚 · 四类房地产模板','/v/harbor/opportunities'],['v-asset-cedar','V 杉衡 · 债权及股权模板','/v/cedar/opportunities'],['payment-pending','付款待核实','/m/subscribe/residence-01/progress'],['registration-pending','法定登记待核实','/m/subscribe/residence-01/progress'],['delivery-pending','Token 交付待核实','/m/subscribe/residence-01/progress']];
  return <main className="container inner-page"><p className="eyebrow">DEV-01R · MOCK CONTROL</p><h1>独立演示控制台</h1><p>只改变本标签页的前端场景；不会产生真实登录、KYC、付款或登记事实。</p><div className="demo-controls">{items.map(([value,label,dest]) => <button key={value} onClick={() => set(value,dest)}>{label}</button>)}</div><p>当前场景：{scenario}</p><a className="text-link" href="/m">进入 M 首页 →</a></main>;
}
function App() {
  if (path === '/demo') return <Demo />;
  if (!channel) return <main className="container inner-page"><h1>选择投资者平台演示入口</h1><div className="entry-links"><Button href="/v/harbor">V · 海岚资产</Button><Button href="/v/cedar" secondary>V · 杉衡资本</Button><Button href="/m" secondary>M · RWA Invest</Button></div></main>;
  const c = channel;
  const tail = path.slice(root(c).length) || '/';
  const detailMatch = /^\/opportunities\/([^/]+)$/.exec(tail);
  const companyMatch = /^\/issuers\/([^/]+)$/.exec(tail);
  const stepMatch = /^\/subscribe\/([^/]+)\/(quote|documents|payment|progress)$/.exec(tail);
  const visible = publicOfferings(c);
  let content: React.ReactNode;
  if (scenario === 'mock-loading' && (tail === '/opportunities' || detailMatch)) content = <main className="container inner-page"><div className="empty" role="status"><h1>正在加载投资机会</h1><p>Mock 加载状态预览；请在演示控制台切换场景。</p><Button href="/demo" secondary>返回演示控制台</Button></div></main>;
  else if (scenario === 'mock-error' && (tail === '/opportunities' || detailMatch)) content = <main className="container inner-page"><div className="empty" role="alert"><h1>投资机会暂时无法显示</h1><p>Mock 异常状态预览；未提供未经核实的资产或价格。</p><Button href="/demo" secondary>返回演示控制台</Button></div></main>;
  else if (tail === '/') content = <Home c={c} />;
  else if (tail === '/opportunities') content = <List c={c} />;
  else if (detailMatch) { const o = visible.find(item => item.id === detailMatch[1]); content = o ? <Detail c={c} o={o} /> : <NotFound c={c} />; }
  else if (companyMatch) content = <Company c={c} issuerId={companyMatch[1]} />;
  else if (stepMatch) { const o = visible.find(item => item.id === stepMatch[1]); content = o && o.status === '认购中' ? <Subscribe c={c} o={o} step={stepSlugs.indexOf(stepMatch[2] as typeof stepSlugs[number])} /> : <NotFound c={c} />; }
  else if (['/investments','/support','/messages','/account','/disclosures','/terms','/privacy'].includes(tail)) content = <Placeholder c={c} name={{ '/investments':'我的投资','/support':'帮助中心','/messages':'消息','/account':'我的账户','/disclosures':'风险提示','/terms':'使用条款','/privacy':'隐私政策' }[tail]!} />;
  else content = <NotFound c={c} />;
  return <><Header c={c} />{content}<Footer c={c} /></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
