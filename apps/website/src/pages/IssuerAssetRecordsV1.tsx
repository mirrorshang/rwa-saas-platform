import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import { readOrders } from '../issuerOrdersV1';
import { readTokenData } from '../issuerTokenV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';
import { ensureSandboxFunds, readFundsData } from '../issuerFundsV1';
import { readAllocationData } from '../issuerAllocationV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type Props = { tenant: DemoTenant; query: string; view: 'subscriptions' | 'lockups' };
const link = (path: string, query: string) => `${path}?${query}`;

export function IssuerAssetRecordsV1({ tenant, query, view }: Props) {
  const [scenarioState, setScenarioState] = useState<'idle' | 'preparing' | 'ready' | 'failed'>('idle');
  const [scenarioError, setScenarioError] = useState('');
  useEffect(() => {
    if (tenant.plan !== 'Standard') return;
    let active = true;
    setScenarioState('preparing');
    void ensureSandboxOperationalChain(tenant).then(() => { ensureSandboxFunds(tenant); if (active) setScenarioState('ready'); }).catch(cause => {
      if (active) { setScenarioError(cause instanceof Error ? cause.message : '内部业务资料暂不可用。'); setScenarioState('failed'); }
    });
    return () => { active = false; };
  }, [tenant.id, tenant.plan]);
  const portfolio = readPortfolio(tenant);
  const orders = readOrders(tenant);
  const funds = readFundsData(tenant);
  const token = readTokenData(tenant);
  const allocation = readAllocationData(tenant);
  const [assetId, setAssetId] = useState('');
  const [offeringId, setOfferingId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const lockRules = portfolio.offerings.filter(item => latest(item).fields.lockMode === 'days' &&
    (!assetId || item.assetId === assetId) && (!offeringId || item.id === offeringId) &&
    (!search || `${item.number} ${latest(item).fields.name}`.toLowerCase().includes(search.toLowerCase())));
  const pages = Math.max(1, Math.ceil(lockRules.length / 20));
  const lockPreview = (allocation?.holders || []).filter(item => item.tenantId === tenant.id &&
    item.source === 'internal-sandbox' && lockRules.some(rule => rule.id === item.offeringId));
  const reset = () => { setAssetId(''); setOfferingId(''); setSearch(''); setPage(1); };
  const comparisonOrders = (orders || []).filter(item => item.source === 'internal-sandbox' && item.tenantId === tenant.id).slice(0, 5);
  if (view === 'subscriptions') return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 资产与发行 / 认购记录</nav><h1>认购记录</h1><p>跨资产查看付款与 Token 交付均得到真实确认的认购历史；法定登记单独核对。</p></header>
    {scenarioState === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程资料…</p>}{scenarioState === 'failed' && <p className="asset-warning" role="alert">内部流程资料暂不可用：{scenarioError}</p>}
    {funds === null && <p className="asset-warning" role="alert">资金来源暂不可读取，已保留原本地资料；请返回收款与对账核对。</p>}
    <section className="issuer-card investor-empty"><h2>暂无已核验完成的认购记录</h2><p>{tenant.plan === 'Free' ? 'Free 套餐不开放真实认购。完成资产、权益和发行资料准备后，可查看 Standard 套餐。' : '当前订单与资金情景仅供内部核对，尚无真实付款及链上 Token 交付证据。待付款、Unknown 和交付中的订单请前往认购订单。'}</p><div className="c08-actions"><a href={link(tenant.plan === 'Free' ? '/issuer/plan' : '/issuer/orders', query)}>{tenant.plan === 'Free' ? '查看套餐' : '查看认购订单'}</a><a href={link('/issuer/token-operations', query)}>查看 Token 交付条件</a></div></section>
    <section className="issuer-card investor-panel"><h2>完成记录的核对来源</h2><dl className="investor-facts"><div><dt>订单来源</dt><dd>{orders === null ? '暂不可读取' : '认购订单模块'}</dd></div><div><dt>真实付款</dt><dd>资金与结算的最终匹配结果待接入</dd></div><div><dt>Token 交付</dt><dd>{token === null ? '链上资料暂不可读取' : token.chainEvents.some(item => item.kind === 'mint' && item.finality === 'final') ? '需逐笔关联核对' : '尚无真实最终确认事件'}</dd></div><div><dt>法定登记</dt><dd>配售与持有人模块独立核验</dd></div></dl><p>内部 Sandbox 订单不会进入已完成历史；这里不另建订单或投资者主账。</p></section>
    {comparisonOrders.length > 0 && <section className="issuer-card investor-table-wrap"><h2>内部流程对照</h2><p>下列订单用于检查付款、交付和登记状态之间的关系，不属于真实已完成认购记录。</p><div className="funds-list">{comparisonOrders.map(item => { const receipt = funds?.receipts.find(row => row.orderId === item.id && row.offeringId === item.offeringId); return <article key={item.id}><strong>{item.number}</strong><span>{item.investorRef}</span><span>{item.amount} U</span><span>{receipt?.finality === 'final' && receipt.match === 'matched' ? '内部到账事件已匹配' : receipt?.finality === 'unknown' ? '到账结果待核' : receipt ? '到账金额或匹配待核' : funds === null ? '资金来源不可读取' : '尚无到账事件'}</span><span>{item.delivery === 'confirmed' ? '内部交付节点已记录' : '交付待核'}</span><a href={link(`/issuer/orders/${item.id}`, query)}>查看原订单</a>{receipt && <a href={link(`/issuer/receipts/receipt/${receipt.id}`, query)}>查看资金事件</a>}</article>; })}</div></section>}
  </section>;
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 资产与发行 / 锁仓记录</nav><h1>锁仓记录</h1><p>锁仓期限以已发布 Offering 的规则和真实 Token 交付事件为准；到期不代表链上或法律限制自动解除。</p></header>
    {scenarioState === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部规则资料…</p>}{scenarioState === 'failed' && <p className="asset-warning" role="alert">内部规则资料暂不可用：{scenarioError}</p>}
    <section className="issuer-card investor-empty"><h2>暂无真实锁仓记录</h2><p>当前没有已发布的锁仓规则与最终确认的 Token 交付事件。下方可核对发行方案中的锁仓规则草稿；草稿不是待交付事项，也不开始锁仓计时。</p><div className="c08-actions"><a href={link('/issuer/token-operations', query)}>查看 Token 交付</a><a href={link('/issuer/allocation-holders', query)}>查看配售与持有人</a></div></section>
    <section className="issuer-card investor-filters"><label>搜索发行方案<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="发行方案名称或编号" /></label><label>资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setOfferingId(''); setPage(1); }}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>发行方案<select value={offeringId} onChange={event => { setOfferingId(event.target.value); setPage(1); }}><option value="">全部发行方案</option>{portfolio.offerings.filter(item => !assetId || item.assetId === assetId).map(item => <option value={item.id} key={item.id}>{latest(item).fields.name}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>
    <section className="issuer-card investor-table-wrap"><h2>固定天数锁仓规则准备</h2>{lockRules.length ? <div className="funds-list">{lockRules.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => { const asset = portfolio.assets.find(row => row.id === item.assetId); const fields = latest(item).fields; return <article key={item.id}><strong>{fields.name}</strong><span>{asset ? latest(asset).fields.name : item.assetId}</span><span>{fields.lockDays} 天 · V{latest(item).number}</span><span>Offering 草稿</span><span>起算待真实交付</span><a href={link(`/issuer/offerings/${item.id}`, query)}>查看规则</a></article>; })}</div> : <p>{portfolio.offerings.some(item => latest(item).fields.lockMode === 'days') ? '没有符合当前筛选条件的固定天数规则。' : '当前没有设置固定天数锁仓的发行方案；可在新建 Offering 时选择不锁仓或固定天数。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {lockRules.length} 条规则草稿</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    {lockPreview.length > 0 && <section className="issuer-card investor-table-wrap"><h2>关联持有人核对</h2><p>以下内部情景仅用于核对 Offering 锁仓规则与配售关联，尚未形成正式锁仓记录或起算时间。</p><div className="funds-list">{lockPreview.map(item => { const offering = portfolio.offerings.find(row => row.id === item.offeringId)!; return <article key={item.id}><strong>{item.displayName}</strong><span>{latest(offering).fields.name}</span><span>{item.tokenQuantity} Token</span><span>{latest(offering).fields.lockDays} 天规则草稿</span><span>起算与到期待真实交付</span><a href={link(`/issuer/allocation-holders/holder/${item.id}`, query)}>查看持有人来源</a></article>; })}</div></section>}
    <section className="issuer-card investor-panel"><h2>状态与责任来源</h2><p>业务期限、链上限制与法律／管理限制分别核对。尚无真实交付时，锁仓起算、预计到期和链上可转让状态均保持待核。</p><div className="c08-actions"><a href={link('/issuer/chain-records', query)}>查看链上记录</a><a href={link('/issuer/allocation-holders', `${query}&view=issues`)}>查看法律限制与差异</a></div></section>
  </section>;
}
