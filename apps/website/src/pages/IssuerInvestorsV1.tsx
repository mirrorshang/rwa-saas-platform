import { useMemo, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { readPortfolio, latest } from '../issuerPortfolioV1';
import { findInvestorRelation, kycGuidance, kycLabel, readInvestorRelations, type InvestorKyc, type InvestorRelation } from '../issuerInvestorsV1';
import { readOrders } from '../issuerOrdersV1';
import { readAllocationData } from '../issuerAllocationV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';

type Props = { tenant: DemoTenant; query: string; id?: string };
const href = (path: string, query: string) => `${path}?${query}`;
const when = (value?: number) => value ? new Date(value).toLocaleString('zh-CN') : '未提供';
const relationLabel = { active: '正常', historical: '历史只读', unavailable: '授权不可用' };

function InvestorDetail({ tenant, query, record }: Props & { record: InvestorRelation }) {
  const [feedback, setFeedback] = useState('');
  const portfolio = readPortfolio(tenant);
  const orderCount = (readOrders(tenant) || []).filter(item => item.investorId === record.id).length;
  const holderCount = (readAllocationData(tenant)?.holders || []).filter(item => item.investorId === record.id).length;
  const assetMap = new Map(portfolio.assets.map(item => [item.id, item]));
  const offeringMap = new Map(portfolio.offerings.map(item => [item.id, item]));
  const copy = async () => { try { await navigator.clipboard.writeText(record.ref); setFeedback('投资者编号已复制。'); } catch { setFeedback('复制失败，请手动选择编号。'); } };
  const disclosedName = record.state === 'unavailable' ? '授权资料不可用' : record.displayName;
  return <div className="asset-page issuer-investors"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台首页</a><span> / </span><a href={href('/issuer/investors', query)}>投资者管理</a><span> / </span>{record.ref}</nav>
    <header className="asset-page-head"><div className="asset-heading"><div><h1>{disclosedName}</h1><p>{record.ref} · {record.kind === 'person' ? '自然人' : '机构'} · {kycLabel[record.kyc]}</p><small>仅显示本企业获授权的信息；身份核验由平台及其受权服务商负责。</small></div><button className="issuer-secondary" type="button" onClick={() => void copy()}>复制投资者编号</button></div></header>
    <div className="investor-fixture" role="status">内部示例关系 · 非平台实时核验结果，不用于真实认购判断</div>
    <section className="issuer-card investor-summary"><div><span>关联 Offering</span><strong>{record.offeringIds.length}</strong></div><a href={href('/issuer/orders', `${query}&investorRef=${encodeURIComponent(record.ref)}`)}><span>认购订单</span><strong>{orderCount}</strong></a><a href={href('/issuer/allocation-holders', `${query}&investorRef=${encodeURIComponent(record.ref)}`)}><span>持有人登记</span><strong>{holderCount}</strong></a></section>
    <section className="issuer-card investor-panel"><h2>本企业关系</h2><dl className="portal-facts investor-facts"><div><dt>本企业投资者编号</dt><dd>{record.ref}</dd></div><div><dt>展示名称</dt><dd>{disclosedName}</dd></div><div><dt>类型</dt><dd>{record.kind === 'person' ? '自然人' : '机构'}</dd></div><div><dt>建立时间</dt><dd>{when(record.establishedAt)}</dd></div><div><dt>最近业务活动</dt><dd>{when(record.lastActivityAt)}</dd></div><div><dt>关系状态</dt><dd>{relationLabel[record.state]}</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>KYC 状态</h2><div className="investor-status"><span className="asset-pill">{kycLabel[record.kyc]}</span><p>{kycGuidance[record.kyc]}</p></div><dl className="portal-facts investor-facts"><div><dt>最近状态更新时间</dt><dd>{when(record.kycUpdatedAt)}</dd></div><div><dt>最近通过时间</dt><dd>{when(record.passedAt)}</dd></div><div><dt>有效至</dt><dd>{when(record.expiresAt)}</dd></div><div><dt>状态来源</dt><dd>平台统一身份核验结果（当前为内部示例）</dd></div></dl><details><summary>状态历史</summary><ol className="investor-timeline">{[...record.events].reverse().map((event, index) => <li key={`${event.at}-${index}`}>{when(event.at)} · {kycLabel[event.status]} · {event.description}</li>)}</ol></details></section>
    <section className="issuer-card investor-panel"><h2>关联资产与 Offering</h2>{record.assetIds.length || record.offeringIds.length ? <div className="investor-relations">{record.assetIds.map(id => { const asset = assetMap.get(id); return <div key={id}><strong>资产</strong><span>{asset ? latest(asset).fields.name : '关联资产不可用'}</span>{asset && <a href={href(`/issuer/assets/${id}`, query)}>查看资产</a>}</div>; })}{record.offeringIds.map(id => { const offering = offeringMap.get(id); return <div key={id}><strong>Offering</strong><span>{offering ? latest(offering).fields.name : '关联发行方案不可用'}</span>{offering && <a href={href(`/issuer/offerings/${id}`, query)}>查看发行方案</a>}<small>订单、付款、法定登记与 Token 交付由各自模块维护。</small></div>; })}</div> : <p className="pv-empty">当前尚无本企业认购或持有人记录。</p>}<div className="c08-actions"><a href={href('/issuer/orders', `${query}&investorRef=${encodeURIComponent(record.ref)}`)}>查看认购订单</a><a href={href('/issuer/subscription-records', `${query}&investorRef=${encodeURIComponent(record.ref)}`)}>查看已完成认购</a><a href={href('/issuer/allocation-holders', `${query}&investorRef=${encodeURIComponent(record.ref)}`)}>查看持有人登记</a></div></section>
    {feedback && <p className="issuer-feedback" role="status">{feedback}</p>}
  </div>;
}

export function IssuerInvestorsV1({ tenant, query, id }: Props) {
  const records = readInvestorRelations(tenant);
  const portfolio = readPortfolio(tenant);
  const orders = readOrders(tenant) || [];
  const holders = readAllocationData(tenant)?.holders || [];
  const [search, setSearch] = useState('');
  const [kyc, setKyc] = useState<InvestorKyc | ''>('');
  const [kind, setKind] = useState('');
  const [assetId, setAssetId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState('');
  const record = id ? findInvestorRelation(tenant, id) : null;
  const assets = portfolio.assets.filter(item => records?.some(relation => relation.assetIds.includes(item.id)));
  const offerings = portfolio.offerings.filter(item => records?.some(relation => relation.offeringIds.includes(item.id)) && (!assetId || item.assetId === assetId));
  const filtered = useMemo(() => (records || []).filter(item => (!search || `${item.ref} ${item.state === 'unavailable' ? '' : item.displayName}`.toLowerCase().includes(search.trim().toLowerCase())) && (!kyc || item.kyc === kyc) && (!kind || item.kind === kind) && (!assetId || item.assetIds.includes(assetId)) && (!offeringId || item.offeringIds.includes(offeringId))).sort((a, b) => (b.lastActivityAt || b.establishedAt) - (a.lastActivityAt || a.establishedAt)), [records, search, kyc, kind, assetId, offeringId]);
  const reset = () => { setSearch(''); setKyc(''); setKind(''); setAssetId(''); setOfferingId(''); setPage(1); };
  if (id) return record ? <InvestorDetail tenant={tenant} query={query} record={record} /> : <div className="asset-page issuer-investors"><h1>记录不存在或无权访问</h1><p>请返回本企业投资者列表核对。</p><a href={href('/issuer/investors', query)}>返回投资者管理</a></div>;
  if (!records) return <div className="asset-page issuer-investors"><h1>投资者管理</h1><p className="pv-empty">投资者信息暂不可用，请重新登录后重试。</p></div>;
  const passed = records.filter(item => item.kyc === 'passed' && (!item.expiresAt || item.expiresAt > Date.now())).length;
  const pending = records.filter(item => ['not_started', 'reviewing', 'supplement', 'expired', 'unknown'].includes(item.kyc)).length;
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const visible = filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20);
  return <div className="asset-page issuer-investors"><header className="asset-page-head"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台首页</a><span> / </span>投资者与认购 / 投资者管理</nav><div className="asset-heading"><div><h1>投资者管理</h1><p>查看与本企业业务相关、已授权本企业查看的脱敏投资者信息。</p></div></div></header>
    {records.length > 0 && <div className="investor-fixture" role="status">内部示例关系 · 非平台实时核验结果，不用于真实认购判断</div>}
    {tenant.plan === 'Free' && <p className="asset-warning">Free 不开放真实投资者业务。已有历史关系仅供只读查询。</p>}
    <section className="issuer-card investor-summary"><div><span>关联投资者</span><strong>{records.length}</strong></div><div><span>KYC 已通过</span><strong>{passed}</strong></div><div><span>待投资者处理</span><strong>{pending}</strong></div></section>
    {records.length ? <><section className="issuer-card investor-filters"><label>关键词<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="本企业编号或脱敏名称" /></label><label>KYC 状态<select value={kyc} onChange={event => { setKyc(event.target.value as InvestorKyc | ''); setPage(1); }}><option value="">全部</option>{Object.entries(kycLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>投资者类型<select value={kind} onChange={event => { setKind(event.target.value); setPage(1); }}><option value="">全部</option><option value="person">自然人</option><option value="organization">机构</option></select></label><label>关联资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setOfferingId(''); setPage(1); }}><option value="">全部</option>{assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>关联 Offering<select value={offeringId} onChange={event => { setOfferingId(event.target.value); setPage(1); }}><option value="">全部</option>{offerings.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>
      {filtered.length ? <section className="issuer-card investor-table-wrap"><table><thead><tr><th>投资者</th><th>KYC 状态</th><th>有效期</th><th>关联发行</th><th>认购订单</th><th>持有人登记</th><th>最近业务活动</th><th>操作</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{item.ref}</strong><small>{item.state === 'unavailable' ? '授权资料不可用' : item.displayName} · {item.kind === 'person' ? '自然人' : '机构'}</small></td><td>{kycLabel[item.kyc]}</td><td>{when(item.expiresAt)}</td><td>{item.assetIds.length} 项资产 / {item.offeringIds.length} 期</td><td>{orders.filter(order => order.investorId === item.id).length}</td><td>{holders.filter(holder => holder.investorId === item.id).length}</td><td>{when(item.lastActivityAt)}</td><td><a href={href(`/issuer/investors/${item.id}`, query)}>查看详情</a><button type="button" className="investor-copy" onClick={() => { void navigator.clipboard.writeText(item.ref).then(() => setCopied(item.ref)).catch(() => setCopied('复制失败')); }}>复制编号</button></td></tr>)}</tbody></table><div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {filtered.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div>{copied && <p role="status" className="issuer-feedback">{copied === '复制失败' ? copied : `已复制 ${copied}`}</p>}</section> : <section className="issuer-card investor-empty"><h2>没有符合条件的投资者</h2><button className="issuer-secondary" type="button" onClick={reset}>清除筛选</button></section>}</> : <section className="issuer-card investor-empty"><h2>{tenant.plan === 'Free' ? '当前暂无投资者记录' : '还没有关联投资者'}</h2><p>{tenant.plan === 'Free' ? 'Free 不开放对外投资者门户和真实认购。升级 Standard 并满足企业认证及生产准入后，才能开展真实投资者业务。' : '投资者通过本企业门户建立授权业务关系或产生订单后，脱敏信息将在这里显示。'}</p><a className="issuer-action" href={href(tenant.plan === 'Free' ? '/issuer/plan' : '/issuer/portal', query)}>{tenant.plan === 'Free' ? '查看套餐' : '查看投资者门户'}</a></section>}
  </div>;
}
