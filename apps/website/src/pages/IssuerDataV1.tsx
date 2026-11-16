import { useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { readPortfolio, latest } from '../issuerPortfolioV1';
import { readOrders, orderBusinessDate } from '../issuerOrdersV1';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { readFundsData } from '../issuerFundsV1';
import { readAllocationData } from '../issuerAllocationV1';
import { readTokenData } from '../issuerTokenV1';
import { readSettlementData } from '../issuerSettlementV1';
import { readYieldDrafts } from '../issuerYieldDraftV1';
import { getKybRecord } from '../issuerKybFlow';
import { getDemoAuth } from '../issuerDemo';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type Props = { tenant: DemoTenant; query: string; view: 'reports' | 'audit'; detailId?: string };
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at: number) => new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）';
type AuditRow = { id: string; at: number; module: string; action: string; objectId: string; objectName: string; by: string; path: string };
function auditRows(tenant: DemoTenant): AuditRow[] {
  const portfolio = readPortfolio(tenant);
  const kyb = getKybRecord(tenant);
  const operational = tenant.plan === 'Standard' || tenant.subscriptionState === 'downgraded';
  const token = operational ? readTokenData(tenant) : null;
  const orders = operational ? readOrders(tenant) : null;
  const allocation = operational ? readAllocationData(tenant) : null;
  const funds = operational ? readFundsData(tenant) : null;
  const settlement = operational ? readSettlementData(tenant) : null;
  const yieldDrafts = operational ? readYieldDrafts(tenant) : null;
  const rows: AuditRow[] = [];
  for (const version of kyb.versions) rows.push({ id: `KYB-${tenant.id}-V${version.number}`, at: version.submittedAt,
    module: '企业管理', action: `提交企业认证资料 V${version.number}`, objectId: tenant.id, objectName: tenant.name,
    by: getDemoAuth()?.email || '', path: '/issuer/company' });
  for (const item of portfolio.assets) item.events.forEach((event, index) => rows.push({ id: `A-${item.id}-${index}`, at: event.at,
    module: '资产与发行', action: event.label, objectId: item.id, objectName: latest(item).fields.name, by: event.by, path: `/issuer/assets/${item.id}` }));
  for (const item of portfolio.instruments) item.events.forEach((event, index) => rows.push({ id: `I-${item.id}-${index}`, at: event.at,
    module: '资产与发行', action: event.label, objectId: item.id, objectName: latest(item).fields.name, by: event.by, path: `/issuer/instruments/${item.id}` }));
  for (const item of portfolio.offerings) item.events.forEach((event, index) => rows.push({ id: `O-${item.id}-${index}`, at: event.at,
    module: '资产与发行', action: event.label, objectId: item.id, objectName: latest(item).fields.name, by: event.by, path: `/issuer/offerings/${item.id}` }));
  for (const item of token?.plans || []) item.events.forEach((event, index) => rows.push({ id: `T-${item.id}-${index}`, at: event.at,
    module: 'Token 管理', action: event.label, objectId: item.id, objectName: item.id, by: event.by, path: `/issuer/token-contracts/${item.id}` }));
  for (const item of orders || []) item.events.forEach((event, index) => rows.push({ id: `OR-${item.id}-${index}`, at: event.at,
    module: '投资者与认购', action: event.label, objectId: item.id, objectName: item.number, by: event.source, path: `/issuer/orders/${item.id}` }));
  for (const item of allocation?.allocations || []) item.events.forEach((event, index) => rows.push({ id: `AL-${item.id}-${index}`, at: event.at,
    module: '投资者与认购', action: event.label, objectId: item.id, objectName: item.id, by: event.source, path: `/issuer/allocation-holders/allocation/${item.id}` }));
  for (const item of funds?.receipts || []) item.events.forEach((event, index) => rows.push({ id: `FR-${item.id}-${index}`, at: event.at,
    module: '资金与结算', action: event.label, objectId: item.id, objectName: item.eventRef, by: event.source, path: `/issuer/receipts/receipt/${item.id}` }));
  for (const item of funds?.refunds || []) item.events.forEach((event, index) => rows.push({ id: `RF-${item.id}-${index}`, at: event.at,
    module: '资金与结算', action: event.label, objectId: item.id, objectName: item.id, by: '内部业务记录', path: `/issuer/refunds/refund/${item.id}` }));
  for (const item of settlement?.transfers || []) item.events.forEach((event, index) => rows.push({ id: `ST-${item.id}-${index}`, at: event.at,
    module: '资金与结算', action: event.label, objectId: item.id, objectName: item.id, by: '内部业务记录', path: `/issuer/settlement/${item.id}` }));
  for (const item of yieldDrafts || []) item.versions.forEach(version => rows.push({ id: `Y-${item.id}-${version.number}`, at: version.at,
    module: '收益与分配', action: `保存收益上报资料草稿 V${version.number}`, objectId: item.id,
    objectName: `${version.fields.periodStart} 至 ${version.fields.periodEnd}`, by: version.by, path: '/issuer/distributions' }));
  return rows.sort((a, b) => b.at - a.at);
}

function Audit({ tenant, query, detailId }: Omit<Props, 'view'>) {
  const allRows = auditRows(tenant);
  const rows = tenant.plan === 'Free' && tenant.subscriptionState !== 'downgraded' ? allRows.filter(item => ['资产与发行', '企业管理'].includes(item.module)) : allRows;
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const dateError = Boolean(fromDate && toDate && fromDate > toDate);
  const filtered = rows.filter(item => !dateError && (!module || item.module === module) &&
    (!search || `${item.id} ${item.action} ${item.objectId} ${item.objectName}`.toLowerCase().includes(search.toLowerCase())) &&
    (!fromDate || orderBusinessDate(item.at) >= fromDate) && (!toDate || orderBusinessDate(item.at) <= toDate));
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const detail = detailId ? rows.find(item => item.id === detailId) : undefined;
  if (detailId) return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer/audit-records', query)}>审计记录</a> / 操作详情</nav><h1>{detail ? detail.action : '记录不存在或无权访问'}</h1></header>{detail ? <><div className="investor-fixture">本地操作来源摘要；外部证据与正式审计服务尚未接入。</div><section className="issuer-card investor-panel"><dl className="investor-facts"><div><dt>来源编号</dt><dd>{detail.id}</dd></div><div><dt>操作时间</dt><dd>{when(detail.at)}</dd></div><div><dt>来源模块</dt><dd>{detail.module}</dd></div><div><dt>关联对象</dt><dd>{detail.objectName} · {detail.objectId}</dd></div><div><dt>记录账号</dt><dd>{detail.by || '待核对'}</dd></div><div><dt>外部证据</dt><dd>待原业务服务核验</dd></div></dl><a href={link(detail.path, query)}>查看原业务对象</a></section></> : <a href={link('/issuer/audit-records', query)}>返回列表</a>}</section>;
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 数据与报表 / 审计记录</nav><h1>审计记录</h1><p>按当前企业查看可追溯的操作来源；正式审计回执与外部证据另行核验。</p></header><div className="investor-fixture">当前显示本地业务版本与操作摘要，不代表已接入正式审计存证服务。</div>
    <section className="issuer-card investor-filters"><label>搜索事件或对象<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="编号、操作或对象名称" /></label><label>业务模块<select value={module} onChange={event => { setModule(event.target.value); setPage(1); }}><option value="">全部模块</option><option value="企业管理">企业管理</option><option value="资产与发行">资产与发行</option><option value="投资者与认购">投资者与认购</option><option value="资金与结算">资金与结算</option><option value="Token 管理">Token 管理</option><option value="收益与分配">收益与分配</option></select></label><label>日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setModule(''); setFromDate(''); setToDate(''); setPage(1); }}>重置筛选</button></section>{dateError && <p className="issuer-feedback" role="alert">起始日期不能晚于结束日期。</p>}
    <section className="issuer-card investor-table-wrap"><h2>业务操作来源</h2>{filtered.length ? <div className="funds-list">{filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => <article key={item.id}><strong>{item.id}</strong><span>{when(item.at)}</span><span>{item.module}</span><span>{item.action}</span><span>{item.objectName}</span><a href={link(`/issuer/audit-records/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{rows.length ? '没有符合当前筛选条件的操作记录。' : '当前权限范围没有可查看的本地操作记录。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {filtered.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    <p className="funds-asof">原始 KYC、Signer 凭证和生产资金证据不在此页展示或导出。</p>
  </section>;
}

const categories = [
  { id: 'portfolio', name: '项目与发行进度', path: '/issuer/assets' },
  { id: 'investors', name: '投资者与认购', path: '/issuer/orders' },
  { id: 'funds', name: '资金与结算', path: '/issuer/receipts' },
  { id: 'allocation', name: '配售、登记与 Token', path: '/issuer/allocation-holders' },
  { id: 'yield', name: '收益与存续', path: '/issuer/servicing' },
] as const;
function Reports({ tenant, query }: Omit<Props, 'view'>) {
  const portfolio = readPortfolio(tenant);
  const operational = tenant.plan === 'Standard' || tenant.subscriptionState === 'downgraded';
  const investors = operational ? readInvestorRelations(tenant) : null;
  const orders = operational ? readOrders(tenant) : null;
  const funds = operational ? readFundsData(tenant) : null;
  const allocation = operational ? readAllocationData(tenant) : null;
  const token = operational ? readTokenData(tenant) : null;
  const yieldDrafts = operational ? readYieldDrafts(tenant) : null;
  const availableCategories = tenant.plan === 'Free' && tenant.subscriptionState !== 'downgraded' ? categories.filter(item => item.id === 'portfolio') : categories;
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('portfolio');
  const [assetId, setAssetId] = useState('');
  const [refreshAt, setRefreshAt] = useState(0);
  const selected = availableCategories.find(item => item.id === category) || availableCategories[0];
  const assets = portfolio.assets.filter(item => !assetId || item.id === assetId);
  const offerings = portfolio.offerings.filter(item => !assetId || item.assetId === assetId);
  const orderRows = (orders || []).filter(item => !assetId || item.assetId === assetId);
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 数据与报表 / 业务报表</nav><h1>业务报表</h1><p>按业务来源查看当前企业的准备与处理摘要；报表不代替资金、法定登记或 Token 主账。</p></header><div className="investor-fixture">当前汇总本地 Sandbox 业务资料；真实资金、链上与收益运营指标须以各责任模块的权威来源为准。</div>
    <section className="issuer-card investor-filters"><label>报表类别<select value={category} onChange={event => setCategory(event.target.value as (typeof categories)[number]['id'])}>{availableCategories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>资产<select value={assetId} onChange={event => setAssetId(event.target.value)}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={() => { setCategory('portfolio'); setAssetId(''); }}>重置筛选</button><button type="button" className="issuer-secondary" onClick={() => setRefreshAt(Date.now())}>刷新本地摘要</button></section>
    <section className="issuer-card investor-panel"><h2>{selected.name}</h2><p>数据截至：{refreshAt ? when(refreshAt) : '当前本地读取'} · 状态：内部资料；真实来源待核。</p>{selected.id === 'portfolio' && <dl className="investor-facts"><div><dt>资产资料</dt><dd>{assets.length} 项（含草稿）</dd></div><div><dt>权益结构</dt><dd>{portfolio.instruments.filter(item => !assetId || item.assetId === assetId).length} 套</dd></div><div><dt>发行方案</dt><dd>{offerings.length} 期，均为内部草稿</dd></div><div><dt>真实已发布数量</dt><dd>生产来源待核</dd></div></dl>}{selected.id === 'investors' && <dl className="investor-facts"><div><dt>脱敏投资者关系</dt><dd>{investors ? investors.length : '来源暂不可用'}</dd></div><div><dt>内部订单情景</dt><dd>{orders ? orderRows.length : '来源暂不可用'}</dd></div><div><dt>真实已完成认购</dt><dd>付款与 Token 交付来源待核</dd></div></dl>}{selected.id === 'funds' && <dl className="investor-facts"><div><dt>内部到账观察</dt><dd>{funds ? funds.receipts.filter(item => !assetId || orderRows.some(order => order.offeringId === item.offeringId)).length : '来源暂不可用'}</dd></div><div><dt>真实最终匹配实收</dt><dd>生产资金来源待核</dd></div><div><dt>真实退款／划拨</dt><dd>有权执行与受领来源待核</dd></div></dl>}{selected.id === 'allocation' && <dl className="investor-facts"><div><dt>内部配售情景</dt><dd>{allocation ? allocation.allocations.filter(item => !assetId || item.assetId === assetId).length : '来源暂不可用'}</dd></div><div><dt>法定登记</dt><dd>有权登记来源待核</dd></div><div><dt>真实 Token 交付</dt><dd>{token?.chainEvents.some(item => item.kind === 'mint' && item.finality === 'final') ? '需逐项核对原链事件' : '权威链上来源待核'}</dd></div></dl>}{selected.id === 'yield' && <dl className="investor-facts"><div><dt>内部收益上报资料草稿</dt><dd>{yieldDrafts ? yieldDrafts.filter(item => !assetId || item.assetId === assetId).length : '来源暂不可用'}</dd></div><div><dt>合法应付／真实注资</dt><dd>尚无可核验来源</dd></div><div><dt>实际支付／未领取</dt><dd>尚无可核验来源</dd></div><div><dt>逾期与未结义务</dt><dd>待存续责任模块核验</dd></div></dl>}<p>Token 数量、法律权益单位和 U 金额属于不同口径，不直接相加。Unknown 不按零处理。</p><div className="c08-actions"><a href={link(selected.path, query)}>查看原业务模块</a><a href={link('/issuer/audit-records', query)}>查看操作来源</a></div></section>
  </section>;
}

export function IssuerDataV1({ view, ...props }: Props) { return view === 'audit' ? <Audit {...props} /> : <Reports {...props} />; }
