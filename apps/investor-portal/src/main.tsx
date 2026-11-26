import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { basePath, canShowCompany, draftStorageKey, minimumUnits, parseChannel, priceU, quantityError, totalCents, visibleCategories, visibleOfferings, type Channel, type Offering } from './domain';
import { issuers, offerings } from './data';
import './styles.css';

const path = window.location.pathname.replace(/\/$/, '') || '/';
const channel = parseChannel(path);
const scenarioKey = 'rwa-investor-dev01-scenario';
const scenario = sessionStorage.getItem(scenarioKey) || 'normal';
const noListings = scenario === 'no-listings';
const brand = (c: Channel) => c.kind === 'm' ? 'RWA Market' : (issuers[c.issuerSlug as keyof typeof issuers]?.name || '未知企业');
const root = (c: Channel) => basePath(c);
const url = (c: Channel, suffix = '') => root(c) + suffix;
const assetUrl = (c: Channel, o: Offering) => url(c, '/opportunities/' + o.id);
const companyUrl = (c: Channel, o: Offering) => url(c, '/issuers/' + o.issuerId) + '?from=' + encodeURIComponent(assetUrl(c, o));
const safeReturn = (c: Channel) => {
  const from = new URLSearchParams(location.search).get('from');
  return from?.startsWith(root(c) + '/') && !from.includes('//') ? from : url(c, '/opportunities');
};

function Button({ href, children, secondary = false, disabled = false }: { href?: string; children: React.ReactNode; secondary?: boolean; disabled?: boolean }) {
  return href && !disabled ? <a className={'button ' + (secondary ? 'button-secondary' : '')} href={href}>{children}</a> :
    <button className={'button ' + (secondary ? 'button-secondary' : '')} type="button" disabled={disabled}>{children}</button>;
}
function Header({ c }: { c: Channel }) {
  return <header className="site-header"><div className="header-inner"><a className="brand" href={root(c)} aria-label={brand(c) + ' 首页'}><span className="brand-mark">◈</span><span>{brand(c)}<small>{c.kind === 'm' ? 'INVESTOR MARKET' : 'INVESTOR PORTAL'}</small></span></a><nav aria-label="主导航"><a href={root(c)} className={path === root(c) ? 'active' : ''}>首页</a><a href={url(c, '/opportunities')} className={path.includes('/opportunities') ? 'active' : ''}>投资机会</a><a href={url(c, '/investments')}>我的投资</a></nav><div className="header-actions"><a href={url(c, '/support')}>帮助与客服</a><a href={url(c, '/messages')}>消息</a><a className="login-link" href={url(c, '/account')}>登录 / 我的账户</a></div></div></header>;
}
function Footer({ c }: { c: Channel }) {
  return <footer className="footer"><div className="container footer-grid"><div><strong>{brand(c)}</strong><p>现实世界资产投资信息演示原型</p></div><div><a href={url(c, '/support')}>帮助与客服</a><a href={url(c, '/disclosures')}>风险与披露</a></div></div><p className="container footer-note">本网站全部企业、资产、价格和交易信息均为 Mock 演示，不构成投资建议、收益承诺或真实认购入口。</p></footer>;
}
function Notice({ children }: { children: React.ReactNode }) { return <div className="notice" role="note"><span>i</span>{children}</div>; }
function AssetVisual({ o }: { o: Offering }) { return <div className="asset-visual"><img src={o.image} alt={o.category + '示意插画，非真实资产照片'} /><span>示意图 · 非真实资产</span></div>; }
function Card({ c, o }: { c: Channel; o: Offering }) {
  return <article className="offering-card"><a className="card-image-link" href={assetUrl(c, o)}><AssetVisual o={o} /></a><div className="card-content"><div className="card-topline"><span>{o.category} · {o.place}</span><span className="status">{o.status}</span></div><h3><a href={assetUrl(c, o)}>{o.title}</a></h3>{c.kind === 'm' && <p className="issuer-line">发行企业 · {o.issuerName}</p>}<div className="pills"><span>{o.right}</span><span>{o.yieldLine}</span></div><div className="card-metrics"><div><small>每 Token 单价</small><strong>{priceU(o.priceCents)}</strong></div><div><small>最低认购</small><strong>{priceU(o.minimumCents)}</strong></div></div><a className="text-link" href={assetUrl(c, o)}>查看资产详情 <span aria-hidden="true">↗</span></a></div></article>;
}
function Home({ c }: { c: Channel }) {
  const list = visibleOfferings(offerings, c, noListings);
  return <><section className="hero"><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow">{c.kind === 'm' ? '多元资产 · 清晰权益' : '现实资产 · 长期视角'}</div><h1>{c.kind === 'm' ? '探索多元 RWA\n投资机会' : '探索现实世界资产的\n投资机会'}</h1><p>{c.kind === 'm' ? '浏览不同发行企业的公开投资机会，了解底层资产、法律权益和认购条件。平台展示不代表投资担保。' : '从真实资产的信息出发，先了解投资者取得的合同权益、风险与认购条件，再作独立判断。'}</p><Button href={url(c, '/opportunities')}>浏览投资机会 <span aria-hidden="true">→</span></Button><div className="hero-facts"><span>资产信息清晰</span><span>权益条款可查</span><span>风险提示明确</span></div></div><div className="hero-illustration"><div className="hero-art-label">REAL WORLD ASSETS <span>01 / 02</span></div><div className="hero-image"><img src={offerings[0].image} alt="建筑示意插画，非真实资产照片" /></div><div className="hero-art-caption"><strong>从资产出发，理解每一项权益。</strong><small>Mock 演示 · 非真实发行材料</small></div></div></div></section>
    <section className="section container"><div className="section-head"><div><div className="eyebrow">DISCOVER</div><h2>{c.kind === 'm' ? '最新上架机会' : '当前投资机会'}</h2><p>{c.kind === 'm' ? '仅展示模拟有效上架的项目。' : '仅展示当前发行企业的模拟项目。'}</p></div><a className="text-link" href={url(c, '/opportunities')}>查看全部 <span aria-hidden="true">→</span></a></div>{list.length ? <div className="card-grid">{list.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <Empty title="目前暂无可展示的投资机会" detail="请稍后查看，或前往帮助页面了解产品流程。" c={c} />}</section>
    <section className="section section-soft"><div className="container"><div className="section-head"><div><div className="eyebrow">EXPLORE</div><h2>按资产类别了解投资</h2><p>资产类型与法律权益并不等同，详情以项目文件为准。</p></div></div><div className="category-grid">{visibleCategories(offerings, c, noListings).map(name => <a key={name} href={url(c, '/opportunities?category=' + encodeURIComponent(name))}><span className="category-icon">{name === '房地产' ? '⌂' : name === '企业股权' ? '◇' : '≋'}</span><strong>{name}</strong><small>查看相关机会 →</small></a>)}</div></div></section>
    <section className="section container education"><div><div className="eyebrow">HOW IT WORKS</div><h2>先理解，再决定</h2><p>每项投资都应从资产、合同权益和风险披露出发。</p></div><div className="steps-education">{[['01', '浏览资产', '了解底层资产与发行企业'], ['02', '理解权益', '阅读权利条款与风险文件'], ['03', '确认认购', '按项目条件进入认购流程']].map(([n,t,d]) => <div key={n}><span>{n}</span><strong>{t}</strong><p>{d}</p></div>)}</div></section><div className="container"><Notice>投资可能导致本金损失。收益、分配与 Token 交付取决于合同和实际业务结果；本页面仅为前端演示。</Notice></div></>;
}
function Empty({ title, detail, c }: { title: string; detail: string; c: Channel }) { return <div className="empty"><span>◇</span><h3>{title}</h3><p>{detail}</p><Button href={root(c)} secondary>返回首页</Button></div>; }
function List({ c }: { c: Channel }) {
  const raw = visibleOfferings(offerings, c, noListings);
  const category = new URLSearchParams(location.search).get('category');
  const list = category ? raw.filter(o => category === '房地产' ? o.category === '住宅物业' : o.category === category) : raw;
  return <main className="container inner-page"><div className="breadcrumb"><a href={root(c)}>首页</a><span>/</span>投资机会</div><div className="page-head"><div><div className="eyebrow">OPPORTUNITIES</div><h1>投资机会</h1><p>浏览已公开的演示项目，比较资产事实、合同权益与认购条件。</p></div><span className="result-count">{list.length} 个项目</span></div>{category && <p className="filter-pill">类别：{category} <a href={url(c, '/opportunities')}>清除 ×</a></p>}{list.length ? <div className="card-grid">{list.map(o => <Card key={o.id} c={c} o={o} />)}</div> : <Empty title="没有符合条件的投资机会" detail="可清除筛选或稍后查看；不会展示未经批准的资产。" c={c} />}</main>;
}
function Detail({ c, o }: { c: Channel; o: Offering }) {
  const eligible = o.status === '认购中';
  return <main className="container inner-page"><div className="breadcrumb"><a href={root(c)}>首页</a><span>/</span><a href={url(c, '/opportunities')}>投资机会</a><span>/</span>{o.title}</div><div className="detail-heading"><div><div className="eyebrow">ASSET DETAIL · MOCK</div><h1>{o.title}</h1><div className="detail-badges"><span>{o.category}</span><span>{o.right}</span><span>{o.place}</span><span className="status">{o.status}</span></div></div></div><div className="detail-grid"><div className="detail-main"><AssetVisual o={o} /><section className="content-panel"><h2>资产概览</h2><p>{o.summary}</p><div className="info-grid">{o.features.map(([k,v]) => <div key={k}><small>{k}</small><strong>{v}</strong></div>)}</div></section><section className="content-panel"><h2>投资者取得的权益</h2><p className="section-intro">资产事实、合同权益与本期发行价格分别展示。</p><div className="info-grid">{o.terms.map(([k,v]) => <div key={k}><small>{k}</small><strong>{v}</strong></div>)}</div></section><section className="content-panel company-panel"><div className="company-avatar">{o.issuerName.slice(0,1)}</div><div><small>发行企业</small><h2>{o.issuerName}</h2><p>企业认证不代表资产安全或收益担保。</p><a className="text-link" href={companyUrl(c,o)}>查看企业信息 →</a></div></section><section className="content-panel"><h2>法律文件与风险</h2><p>本演示文件仅展示名称与版本，无法替代正式披露或法律签署。</p><div className="document-list">{o.documents.map(d => <div key={d.name}><span>▤ {d.name}</span><small>{d.version}</small></div>)}</div><Notice>{o.right === '债权' ? '借款人可能违约或延期，本金偿还与利息收入分别核算。' : '资产经营结果存在波动，预期信息不代表已确认应付收益。'}</Notice></section></div><aside className="summary-card"><span className="summary-caption">认购摘要 · Mock</span><h2>了解认购条件</h2><div className="summary-price"><small>每 Token 单价</small><strong>{priceU(o.priceCents)}</strong></div><div className="summary-row"><span>最低认购</span><strong>{priceU(o.minimumCents)}</strong></div><div className="summary-row"><span>权益类型</span><strong>{o.right}</strong></div><div className="summary-row"><span>当前状态</span><strong>{o.status}</strong></div><div className="summary-row"><span>认购时间</span><strong>以正式文件为准</strong></div><Notice>本页面为模拟原型，资金、身份和可售份额均未接入真实系统。</Notice>{eligible ? <Button href={url(c, '/subscribe/' + o.id + '/quote')}>查看认购步骤 →</Button> : <Button disabled>暂不可认购</Button>}<p className="summary-foot">投资前请阅读全部法律文件与风险说明。</p></aside></div></main>;
}
function Company({ c, issuerId }: { c: Channel; issuerId: string }) {
  const company = issuers[issuerId as keyof typeof issuers];
  if (!company || !canShowCompany(offerings, c, issuerId, noListings)) return <NotFound c={c} />;
  const list = visibleOfferings(offerings, c, noListings).filter(o => o.issuerId === issuerId);
  return <main className="container inner-page"><div className="breadcrumb"><a href={safeReturn(c)}>返回来源页面</a><span>/</span>企业信息</div><div className="company-hero"><div className="company-avatar large">{company.name.slice(0,1)}</div><div><div className="eyebrow">ISSUER PROFILE · MOCK</div><h1>{company.name}</h1><p>{company.legal}</p></div></div><div className="content-panel"><h2>企业介绍</h2><p>{company.intro}</p><p className="muted">注册地区及认证材料：演示资料待核实。企业认证不代表资产安全或收益担保。</p></div><div className="section-head"><div><h2>当前渠道可见项目</h2><p>只展示此渠道已获准公开的 Mock 项目。</p></div></div>{list.length ? <div className="card-grid">{list.map(o => <Card c={c} o={o} key={o.id} />)}</div> : <Empty title="当前渠道暂无可展示项目" detail="历史资产和未获上架的项目不会在此公开。" c={c} />}</main>;
}
const stepNames = ['确认认购', '协议与风险', '钱包付款', '交易进度'] as const;
const stepSlugs = ['quote', 'documents', 'payment', 'progress'] as const;
function Subscribe({ c, o, step }: { c: Channel; o: Offering; step: number }) {
  const key = draftStorageKey(c, o, 'quantity');
  const [quantity, setQuantity] = useState(() => sessionStorage.getItem(key) ?? String(minimumUnits(o)));
  const readKey = draftStorageKey(c, o, 'read');
  const [read, setRead] = useState(() => sessionStorage.getItem(readKey) === 'yes');
  const error = quantityError(quantity, o);
  const total = error ? 0 : totalCents(quantity, o);
  const stepUrl = (n: number) => url(c, '/subscribe/' + o.id + '/' + stepSlugs[n]);
  const update = (v: string) => { setQuantity(v); sessionStorage.setItem(key, v); };
  return <main className="container inner-page"><div className="breadcrumb"><a href={assetUrl(c,o)}>返回资产详情</a><span>/</span>认购演示</div><div className="subscribe-head"><div className="eyebrow">SUBSCRIPTION · DEMO ONLY</div><h1>{o.title}</h1><p>四步视觉与交互样板 · 无真实账户、签署、钱包或付款能力</p></div><nav className="stepper" aria-label="认购步骤">{stepNames.map((name,i) => <a key={name} href={stepUrl(i)} aria-current={i === step ? 'step' : undefined} className={i === step ? 'current' : i < step ? 'done' : ''}><span>{i+1}</span>{name}</a>)}</nav><div className="subscribe-grid"><section className="content-panel step-content"><div className="step-overline">STEP {step+1} / 04</div><h2>{stepNames[step]}</h2>{step === 0 && <><p>确认份数和演示金额。正式价格、容量和投资资格仍需后续业务核验。</p><label className="field-label" htmlFor="quantity">认购 Token 份数</label><div className="quantity-control"><input id="quantity" inputMode="numeric" type="text" value={quantity} onChange={e => update(e.target.value)} aria-invalid={!!error} aria-describedby="quantity-help" /><span>Token</span></div><small id="quantity-help" className={error ? 'error' : 'hint'}>{error || '最低 ' + minimumUnits(o) + ' 份 · 演示上限 ' + o.maxUnits + ' 份'}</small><div className="calculation"><div><span>单价</span><strong>{priceU(o.priceCents)}</strong></div><div><span>数量</span><strong>{error ? '待修正' : quantity + ' Token'}</strong></div><div><span>总额</span><strong>{error ? '—' : priceU(total)}</strong></div></div><Notice>登录、KYC、报价与容量核验将在后续阶段补齐；这里没有形成有效订单。</Notice></>}
    {step === 1 && <><p>阅读项目文件版本和风险。阅读确认只用于本次界面演示，不构成法律签署。</p><div className="document-list">{o.documents.map(d => <div key={d.name}><span>▤ {d.name}</span><small>{d.version}</small></div>)}</div><label className="check-row"><input type="checkbox" checked={read} onChange={e => { setRead(e.target.checked); sessionStorage.setItem(readKey, e.target.checked ? 'yes' : 'no'); }} />我已阅读上述演示文件摘要</label><Notice>必要电子签署尚未接入；本阶段无法完成真实协议确认或有效待付款订单。</Notice></>}
    {step === 2 && <><p>下面是付款步骤的视觉占位。全部地址和状态均为 Mock，不会连接钱包或发起交易。</p><div className="payment-card"><div><small>演示网络</small><strong>OP Mainnet</strong></div><div><small>演示币种</small><strong>USDT</strong></div><div><small>付款钱包</small><strong>Mock 钱包 · 未连接</strong></div><div><small>Token 接收地址</small><strong>Mock 地址 · 未验证</strong></div><div><small>Offering 收款合约</small><strong>Mock 合约 · 未核实</strong></div></div><button type="button" className="button" disabled>模拟付款（DEV-04 开放）</button><Notice>点击授权不等于付款；本阶段没有真实 USDT 支付、签名或合约调用。</Notice></>}
    {step === 3 && <><p>以下履约事实保持独立。演示中没有任何已完成付款、登记或 Token 交付。</p><div className="timeline">{[['付款观察', '未发起 · Mock'], ['配售', '未开始 · Mock'], ['法定登记', '未开始 · Mock'], ['Token 交付', '未开始 · Mock']].map(([name,state]) => <div key={name}><span className="timeline-dot" /><strong>{name}</strong><small>{state}</small></div>)}</div><Notice>付款结果不自动代表配售、法定登记或 Token 交付成功。完整状态模拟留待 DEV-04。</Notice></>}<div className="step-actions"><Button href={step === 0 ? assetUrl(c,o) : stepUrl(step-1)} secondary>{step === 0 ? '返回资产详情' : '上一步'}</Button>{step < 3 && <Button href={stepUrl(step+1)} disabled={(step === 0 && !!error) || (step === 1 && !read)}>{step === 2 ? '查看演示进度' : '下一步'} →</Button>}</div></section><aside className="summary-card"><span className="summary-caption">项目摘要 · Mock</span><h2>{o.title}</h2><div className="summary-row"><span>权益类型</span><strong>{o.right}</strong></div><div className="summary-row"><span>Token 单价</span><strong>{priceU(o.priceCents)}</strong></div><div className="summary-row"><span>份数</span><strong>{quantity || '—'}</strong></div><div className="summary-total"><span>演示总额</span><strong>{error ? '—' : priceU(total)}</strong></div><p className="summary-foot">本摘要不是有效报价或支付指令。</p></aside></div></main>;
}
function Placeholder({ c, name }: { c: Channel; name: string }) { return <main className="container inner-page"><div className="breadcrumb"><a href={root(c)}>首页</a><span>/</span>{name}</div><div className="empty"><span>◇</span><h1>{name}</h1><p>此功能将在后续 DEV 阶段实现。DEV-01 仅提供明确的页面入口，不展示虚构账户或业务数据。</p><Button href={url(c,'/opportunities')} secondary>浏览投资机会</Button></div></main>; }
function NotFound({ c }: { c: Channel }) { return <main className="container inner-page"><Empty title="页面或资产不可访问" detail="链接可能无效，或当前渠道未获准展示此资产。" c={c} /></main>; }
function Demo() {
  const set = (s: string) => { sessionStorage.setItem(scenarioKey, s); location.href = s === 'debt' ? '/v/cedar/opportunities/debt-01' : s === 'no-listings' ? '/m' : '/v/harbor/opportunities/residence-01'; };
  return <main className="container inner-page"><div className="eyebrow">DEMO CONTROL · DEV-01</div><h1>Mock 场景控制台</h1><p>与投资者页面分离。仅改变前端演示场景，不发起真实业务操作。</p><div className="demo-controls"><button onClick={() => set('normal')}>载入住宅案例</button><button onClick={() => set('debt')}>载入债权案例</button><button onClick={() => set('no-listings')}>模拟 M 无有效 Listing</button><button onClick={() => { sessionStorage.removeItem(scenarioKey); location.href='/m'; }}>重置场景</button></div><div className="content-panel"><h2>当前 Mock 状态</h2><p>场景：{scenario} · V 企业：海岚资产 / 杉衡资本 · M Listing：{noListings ? '无有效项目' : '住宅和债权有效，股权待上架'}</p><p>资金、钱包、KYC、合同和企业资料均为演示；状态控制将在 DEV-03～06 扩展。</p></div><a className="text-link" href="/m">进入 M 首页 →</a></main>;
}
function App() {
  if (path === '/demo') return <><div className="demo-banner">DEV-01 · 纯前端 Mock 原型</div><Demo /></>;
  if (!channel) return <main className="container inner-page"><h1>选择演示入口</h1><p>当前仅提供 PC Web 前端原型。</p><div className="entry-links"><Button href="/v/harbor">V · 海岚资产</Button><Button href="/v/cedar" secondary>V · 杉衡资本</Button><Button href="/m" secondary>M · 投资平台</Button></div></main>;
  const c = channel;
  const tail = path.slice(root(c).length) || '/';
  const matchDetail = /^\/opportunities\/([^/]+)$/.exec(tail);
  const matchCompany = /^\/issuers\/([^/]+)$/.exec(tail);
  const matchStep = /^\/subscribe\/([^/]+)\/(quote|documents|payment|progress)$/.exec(tail);
  const list = visibleOfferings(offerings, c, noListings);
  let content: React.ReactNode;
  if (tail === '/') content = <Home c={c} />;
  else if (tail === '/opportunities') content = <List c={c} />;
  else if (matchDetail) { const o = list.find(x => x.id === matchDetail[1]); content = o ? <Detail c={c} o={o} /> : <NotFound c={c} />; }
  else if (matchCompany) content = <Company c={c} issuerId={matchCompany[1]} />;
  else if (matchStep) { const o = list.find(x => x.id === matchStep[1]); content = o && o.status === '认购中' ? <Subscribe c={c} o={o} step={stepSlugs.indexOf(matchStep[2] as typeof stepSlugs[number])} /> : <NotFound c={c} />; }
  else if (['/investments','/support','/messages','/account','/disclosures'].includes(tail)) content = <Placeholder c={c} name={{'/investments':'我的投资','/support':'帮助与客服','/messages':'消息','/account':'我的账户','/disclosures':'风险与披露'}[tail]!} />;
  else content = <NotFound c={c} />;
  return <><div className="demo-banner">DEV-01 · 纯前端 Mock 原型 · 不可进行真实投资</div><Header c={c} />{content}<Footer c={c} /></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
