import { useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { getKybRecord } from '../issuerKybFlow';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type Props = { tenant: DemoTenant; query: string; view: 'wallets' | 'rules' | 'services' };
const link = (path: string, query: string) => `${path}?${query}`;

function Wallets({ tenant, query }: Omit<Props, 'view'>) {
  const portfolio = readPortfolio(tenant);
  const [selected, setSelected] = useState('');
  const wallet = portfolio.wallets.find(item => item.id === selected);
  const linked = wallet ? portfolio.offerings.filter(item => latest(item).fields.walletId === wallet.id) : [];
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 企业管理 / 钱包管理</nav><h1>钱包管理</h1><p>查看企业钱包准备信息及发行方案引用；真实 MPC 开通和自有钱包签名核验由受权服务完成。</p></header>
    <div className="investor-fixture">当前为内部 Sandbox 配置。这里的地址与核验标记不代表真实 MPC 已开通、地址控制权已签名验证或生产收款准入。</div>
    <section className="issuer-card investor-panel"><h2>企业钱包状态</h2><dl className="investor-facts"><div><dt>企业</dt><dd>{tenant.name}</dd></div><div><dt>生产 MPC 开通</dt><dd>服务结果待接入</dd></div><div><dt>自有钱包签名核验</dt><dd>连接与服务端核验待接入</dd></div><div><dt>生产默认钱包</dt><dd>待真实受权结果</dd></div></dl><p>KYB 通过后由已准入服务执行真实 MPC 开通。服务失败不回滚企业认证；页面不会生成随机地址冒充成功。</p></section>
    <section className="issuer-card investor-table-wrap"><h2>发行准备中的钱包引用</h2>{portfolio.wallets.length ? <div className="funds-list">{portfolio.wallets.map(item => <article key={item.id}><strong>{item.name || item.id}</strong><span>{item.source}</span><span>{item.network}</span><span>仅本地配置</span><span>{portfolio.offerings.filter(offering => latest(offering).fields.walletId === item.id).length} 个方案引用</span><button type="button" className="issuer-secondary" onClick={() => setSelected(item.id)}>查看引用</button></article>)}</div> : <p>当前没有钱包配置。真实开通状态待受权服务同步；发行方案不能把未核验地址用于收款。</p>}</section>
    {wallet && <section className="issuer-card investor-panel"><h2>{wallet.name || wallet.id} · 关联范围</h2><dl className="investor-facts"><div><dt>钱包类型</dt><dd>{wallet.source}</dd></div><div><dt>网络</dt><dd>{wallet.network}</dd></div><div><dt>本地配置核验</dt><dd>{wallet.verified ? '已通过本地资料检查；生产签名与 Provider 结果待核' : '待核验'}</dd></div><div><dt>真实收款资格</dt><dd>待生产准入</dd></div></dl><p>现有 Offering 的钱包引用不会因为查看或切换页面而改变。</p><div className="c08-actions">{linked.map(item => <a key={item.id} href={link(`/issuer/offerings/${item.id}`, query)}>{latest(item).fields.name}</a>)}<button type="button" className="issuer-secondary" onClick={() => setSelected('')}>收起详情</button></div></section>}
  </section>;
}

type Rule = { id: string; name: string; category: string; scope: string; version: string; state: string; source: string; summary: string; path: string };
function Rules({ tenant, query }: Omit<Props, 'view'>) {
  const portfolio = readPortfolio(tenant);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState('');
  const [page, setPage] = useState(1);
  const rules: Rule[] = [
    { id: 'PLAN', name: '套餐与发行能力', category: '套餐', scope: tenant.name, version: '当前企业套餐', state: '适用', source: '套餐与订阅', summary: `${tenant.plan} 套餐。真实发行另需业务、法律和生产准入。`, path: '/issuer/plan' },
    ...portfolio.instruments.map(item => ({ id: `INS-${item.id}`, name: latest(item).fields.name, category: '权益条款', scope: item.assetId,
      version: `V${latest(item).number}`, state: item.status === 'ready' ? '资料就绪' : '草稿', source: '权益结构',
      summary: `Token 总份数 ${latest(item).fields.tokenSupply || '待核'}；法律权益规模 ${latest(item).fields.total || '待核'}。历史版本由原权益结构保留。`, path: `/issuer/instruments/${item.id}` })),
    ...portfolio.offerings.map(item => ({ id: `OFF-${item.id}`, name: latest(item).fields.name, category: 'Offering', scope: item.assetId,
      version: `V${latest(item).number}`, state: '草稿', source: '发行方案',
      summary: `本期数量 ${latest(item).fields.quantity || '待核'} Token；单价 ${latest(item).fields.price || '待核'} U；锁仓 ${latest(item).fields.lockMode === 'days' ? `${latest(item).fields.lockDays} 天` : '不锁仓或待确认'}。`, path: `/issuer/offerings/${item.id}` })),
    { id: 'PRODUCTION-GATE', name: '生产准入与有权执行', category: '强制规则', scope: tenant.name, version: '适用依据待核', state: '待核验', source: '平台与适用法域', summary: '套餐或 KYB 通过不等于真实部署、资金出款、Mint 或生产服务授权。', path: '/issuer/plan' },
  ];
  const filtered = rules.filter(item => (!category || item.category === category) && (!search || `${item.name} ${item.scope} ${item.version}`.toLowerCase().includes(search.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const detail = rules.find(item => item.id === selected);
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 企业管理 / 规则设置</nav><h1>规则设置</h1><p>查看当前企业适用规则的来源、版本与范围；变更请前往原业务页面。</p></header>
    <section className="issuer-card investor-filters"><label>搜索规则<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="名称、资产或版本" /></label><label>规则类别<select value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">全部类别</option><option value="套餐">套餐</option><option value="权益条款">权益条款</option><option value="Offering">Offering</option><option value="强制规则">强制规则</option></select></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setCategory(''); setPage(1); }}>重置筛选</button></section>
    <section className="issuer-card investor-table-wrap"><h2>适用规则目录</h2>{filtered.length ? <div className="funds-list">{filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => <article key={item.id}><strong>{item.name}</strong><span>{item.category}</span><span>{item.version}</span><span>{item.state}</span><span>{item.source}</span><button type="button" className="issuer-secondary" onClick={() => setSelected(item.id)}>查看详情</button></article>)}</div> : <p>没有符合筛选条件的规则。</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {filtered.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    {detail && <section className="issuer-card investor-panel"><h2>{detail.name}</h2><dl className="investor-facts"><div><dt>编号／类别</dt><dd>{detail.id} / {detail.category}</dd></div><div><dt>适用范围</dt><dd>{detail.scope}</dd></div><div><dt>版本与状态</dt><dd>{detail.version} · {detail.state}</dd></div><div><dt>来源</dt><dd>{detail.source}</dd></div><div><dt>内容摘要</dt><dd>{detail.summary}</dd></div></dl><p>新版本不会自动改写已签合同、历史订单或既有持有人权益。</p><div className="c08-actions"><a href={link(detail.path, query)}>前往规则来源</a><button type="button" className="issuer-secondary" onClick={() => setSelected('')}>收起详情</button></div></section>}
  </section>;
}

function Services({ tenant, query }: Omit<Props, 'view'>) {
  const kyb = getKybRecord(tenant);
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 企业管理 / 外部服务</nav><h1>外部服务</h1><p>仅列出当前企业实际使用或已批准可用的外部服务，以及各自的责任和连接状态。</p></header>
    <section className="issuer-card investor-empty"><h2>暂无已核验的服务连接</h2><p>当前尚未接入可核验的 Provider 合同、授权、环境和技术健康来源，因此不把身份核验、资金监测、链节点或签署能力标成已连接。</p><div className="c08-actions"><a href={link('/issuer/company', query)}>查看企业认证</a><a href={link('/issuer/wallets', query)}>查看钱包开通</a></div></section>
    <section className="issuer-card investor-panel"><h2>业务状态与服务状态分别核对</h2><dl className="investor-facts"><div><dt>当前企业</dt><dd>{tenant.name}</dd></div><div><dt>企业认证资料</dt><dd>{kyb?.status === 'passed' ? '已通过当前资料审核' : '认证资料尚待完成或审核'}</dd></div><div><dt>外部 KYB 服务连接</dt><dd>实际责任主体及健康状态待核</dd></div><div><dt>资金与链上生产服务</dt><dd>未取得当前企业的受权连接资料</dd></div><div><dt>生产凭证</dt><dd>不在企业页面展示</dd></div></dl><p>资料状态不代表 Provider 已连接；服务连接也不自动授予真实资金或 Token 执行权。</p><div className="c08-actions"><a href={link('/issuer/receipts', query)}>查看资金来源</a><a href={link('/issuer/chain-records', query)}>查看链上来源</a></div></section>
  </section>;
}
export function IssuerCompanySharedV1({ view, ...props }: Props) {
  return view === 'wallets' ? <Wallets {...props} /> : view === 'rules' ? <Rules {...props} /> : <Services {...props} />;
}
