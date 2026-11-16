import { useEffect, useMemo, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import { canRequestOrderCancellation, filterOrders, findOrder, orderNeedsAttention, orderNextStep, orderProgress, orderProgressLabel, readOrders, requestSandboxCancellation, type CancellationReason, type OrderProgress, type OrderQuickView, type OrderRecord, type PaymentFact } from '../issuerOrdersV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';
import { ensureSandboxFunds, readFundsData, receiptStatusText } from '../issuerFundsV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerOrdersV1.scss';

type Props = { tenant: DemoTenant; query: string; id?: string };
const href = (path: string, query: string) => `${path}?${query}`;
const when = (value?: number) => value ? new Date(value).toLocaleString('zh-CN') : '待同步';
const paymentLabel: Record<string, string> = { none: '未发起', awaiting: '待付款', pending: '待确认', 'final-matched': '实收已确认', difference: '差异／异常', 'refund-pending': '退款处理中', refunded: '已退款', unknown: '暂不可确认' };
const capacityLabel: Record<string, string> = { none: '未开始', pending: '待确认', reserved: '已预留', protected: '待核保护', allocated: '已转配售', released: '已释放', unknown: '无法确认' };
const registrationLabel: Record<string, string> = { none: '未开始', pending: '待登记／核验', effective: '已有效', difference: '差异／更正中', unknown: '无法确认' };
const deliveryLabel: Record<string, string> = { none: '未开始', pending: '待交付／核验', confirmed: '已交付', failed: '交付异常', unknown: '暂不可确认' };

function OrderAnomalyDialog({ anomaly, query, orderId, onClose }: { anomaly: NonNullable<OrderRecord['anomaly']>; query: string; orderId: string; onClose: () => void }) {
  return <div className="issuer-order-modal-backdrop" onKeyDown={event => { if (event.key === 'Escape') onClose(); }}>
    <section className="issuer-order-modal issuer-card" role="dialog" aria-modal="true" aria-labelledby="order-anomaly-title">
      <div className="issuer-order-dialog-head"><h2 id="order-anomaly-title">异常详情</h2><button type="button" className="issuer-secondary" autoFocus onClick={onClose}>关闭</button></div>
      <dl className="investor-facts"><div><dt>异常编号</dt><dd>{anomaly.code}</dd></div><div><dt>业务类别</dt><dd>{anomaly.category}</dd></div><div><dt>首次发现</dt><dd>{when(anomaly.at)}</dd></div><div><dt>处理状态</dt><dd>{anomaly.status === 'open' ? '待核对' : anomaly.status}</dd></div><div><dt>责任模块</dt><dd>{anomaly.module}</dd></div></dl>
      <p>请在原责任模块核对事件与最新结果。关闭此窗口不会解决异常，也不会改变付款、容量、登记或 Token 状态。</p>
      <a className="issuer-action" href={href('/issuer/refunds', `${query}&orderId=${encodeURIComponent(orderId)}`)}>查看责任模块</a>
    </section>
  </div>;
}

function OrderDetail({ tenant, query, id }: Props & { id: string }) {
  const order = findOrder(tenant, id);
  const [feedback, setFeedback] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancellationReason | ''>('');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelAcknowledged, setCancelAcknowledged] = useState(false);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  if (!order) return <div className="asset-page issuer-investors"><h1>订单不存在或无权访问</h1><a href={href('/issuer/orders', query)}>返回认购订单</a></div>;
  const investor = (readInvestorRelations(tenant) || []).find(item => item.id === order.investorId);
  const portfolio = readPortfolio(tenant);
  const asset = portfolio.assets.find(item => item.id === order.assetId);
  const offering = portfolio.offerings.find(item => item.id === order.offeringId);
  const progress = orderProgress(order);
  const next = orderNextStep(order);
  const funds = readFundsData(tenant);
  const receipt = funds?.receipts.find(item => item.orderId === order.id && item.finality === 'final' && item.match === 'matched') ||
    funds?.receipts.find(item => item.orderId === order.id);
  const instruction = funds?.instructions.find(item => item.orderId === order.id);
  const copy = async () => { try { await navigator.clipboard.writeText(order.number); setFeedback('订单编号已复制。'); } catch { setFeedback('复制失败，请手动选择编号。'); } };
  const submitCancellation = () => {
    try {
      requestSandboxCancellation(tenant, order.id, cancelReason as CancellationReason, cancelNote, cancelAcknowledged);
      setCancelOpen(false);
      setFeedback('取消申请已在当前流程中记录，订单取消结果、退款与容量释放仍待各责任模块确认。');
    } catch (error) { setFeedback(error instanceof Error ? error.message : '取消申请未记录，请核对当前订单状态。'); }
  };
  return <div className="asset-page issuer-investors issuer-orders"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer/orders', query)}>认购订单</a><span> / </span>{order.number}</nav><header className="asset-page-head"><div className="asset-heading"><div><h1>认购订单 {order.number}</h1><p>{when(order.createdAt)} · {orderProgressLabel[progress]}</p><small>订单进度、真实付款、配售、法定登记、Token 交付与退款分别核对。</small></div><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => void copy()}>复制编号</button><button type="button" className="issuer-secondary" onClick={() => setFeedback('已重新读取当前企业的本地订单记录；外部结果仍须权威服务核验。')}>刷新状态</button></div></div></header><div className="investor-fixture" role="status">内部 Sandbox 情景记录，基于发行方案草稿独立生成；当前方案并未公开发布，页面状态不构成真实资金、配售、登记或 Token 交付结果。</div>
    <section className="issuer-card issuer-order-next"><div><strong>{orderProgressLabel[progress]} · 下一步</strong><p>{next.description}</p></div><a className="issuer-action" href={`#${next.section}`}>{next.label}</a></section>
    {(order.payment === 'unknown' || order.registration === 'unknown' || order.delivery === 'unknown' || order.anomaly) && <div className="asset-warning">当前存在待核实事实；不得按已到账、已登记或已交付处理。{order.anomaly ? <button type="button" className="issuer-link-button" onClick={() => setAnomalyOpen(true)}>查看异常详情</button> : <a href="#order-exception">查看异常与历史</a>}</div>}
    <nav className="pv-anchor" aria-label="订单进度"><a href="#order-summary">订单与条款</a><a href="#order-payment">付款</a><a href="#order-capacity">配售</a><a href="#order-registration">法定登记</a><a href="#order-delivery">Token 交付</a><a href="#order-exception">取消与异常</a></nav>
    <section className="issuer-card investor-panel" id="order-summary">
      <h2>订单概要与认购条款</h2>
      <dl className="investor-facts">
        <div><dt>投资者</dt><dd>{investor?.state === 'unavailable' ? '授权资料不可用' : investor?.displayName || order.investorRef} · {order.investorRef}</dd></div>
        <div><dt>KYC 当前状态</dt><dd>{investor ? '查看投资者管理中的最新脱敏状态' : '待同步'}</dd></div>
        <div><dt>资产</dt><dd>{order.quoteSnapshot?.assetName || order.assetId}</dd></div>
        <div><dt>Offering</dt><dd>{order.quoteSnapshot?.offeringName || order.offeringNumber} · V{order.offeringVersion}</dd></div>
        <div><dt>权益结构</dt><dd>{order.quoteSnapshot?.instrumentName || '权益结构'} · V{order.instrumentVersion}</dd></div>
        <div><dt>数量与报价快照</dt><dd>{order.quantity} Token × {order.unitPrice} U</dd></div>
        <div><dt>应付金额</dt><dd>{order.amount} U；不等于实收</dd></div>
        <div><dt>报价状态</dt><dd>{order.quoteStatus === 'valid' ? '有效' : order.quoteStatus === 'expired' ? '已失效' : order.quoteStatus === 'pending' ? '待确认' : '无法确认'}</dd></div>
        <div><dt>签署状态</dt><dd>{order.signatureStatus === 'signed' ? '已完成' : order.signatureStatus === 'pending' ? '待签署' : order.signatureStatus === 'failed' ? '失败' : '无法确认'}</dd></div>
      </dl>
      <details><summary>查看下单时的规则与文件版本</summary>{order.quoteSnapshot ? <dl className="investor-facts">
        <div><dt>单笔最低金额</dt><dd>{order.quoteSnapshot.minOrder ? `${order.quoteSnapshot.minOrder} U` : '未设置'}</dd></div>
        <div><dt>单笔最高份数</dt><dd>{order.quoteSnapshot.maxOrderTokens ? `${order.quoteSnapshot.maxOrderTokens} Token` : '未设置'}</dd></div>
        <div><dt>单投资者本期上限</dt><dd>{order.quoteSnapshot.investorCap ? `${order.quoteSnapshot.investorCap} U` : '未设置'}</dd></div>
        <div><dt>认购协议</dt><dd>{order.quoteSnapshot.subscriptionDocument ? `${order.quoteSnapshot.subscriptionDocument.name} V${order.quoteSnapshot.subscriptionDocument.version}` : '未取得固定引用'}</dd></div>
        <div><dt>风险披露</dt><dd>{order.quoteSnapshot.riskDocuments.length ? order.quoteSnapshot.riskDocuments.map(item => `${item.name} V${item.version}`).join('、') : '未取得固定引用'}</dd></div>
        <div><dt>结算钱包配置</dt><dd>{order.quoteSnapshot.walletId || '未取得固定引用'}；不是投资者付款地址</dd></div>
      </dl> : <p>该历史订单尚无固定规则及文件快照；请核对原订单来源，不采用当前发行方案覆盖历史条件。</p>}</details>
      <div className="c08-actions"><a href={href(`/issuer/investors/${order.investorId}`, query)}>查看投资者</a>{asset && <a href={href(`/issuer/assets/${asset.id}`, query)}>查看资产</a>}{offering && <a href={href(`/issuer/offerings/${offering.id}`, query)}>查看 Offering</a>}</div>
    </section>
    <section className="issuer-card investor-panel" id="order-capacity"><h2>订单预留与配售</h2><p>订单份数只在本期 Offering 预留内占用；不再次扣减权益结构总容量。</p><dl className="investor-facts"><div><dt>申请预留</dt><dd>{order.quantity} Token</dd></div><div><dt>容量状态</dt><dd>{capacityLabel[order.capacity]}</dd></div><div><dt>容量引用</dt><dd>{order.capacityRef || '未提供'}</dd></div></dl><a href={href('/issuer/allocation-holders', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看配售与容量记录</a></section>
    <section className="issuer-card investor-panel" id="order-payment"><h2>真实付款</h2><dl className="investor-facts"><div><dt>网络与币种</dt><dd>OP Mainnet · USDT</dd></div><div><dt>订单应付</dt><dd>{order.amount} U</dd></div><div><dt>付款状态</dt><dd>{paymentLabel[order.payment]}</dd></div><div><dt>已确认实收</dt><dd>{order.payment === 'final-matched' ? '以资金模块核验金额为准' : '待确认'}</dd></div><div><dt>付款引用</dt><dd>{order.paymentRef || '未提供'}</dd></div></dl><a href={href('/issuer/receipts', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看收款与对账</a></section>
    <section className="issuer-card investor-panel"><h2>资金来源核对</h2><dl className="investor-facts"><div><dt>付款条件引用</dt><dd>{instruction?.id || '待生成'}</dd></div><div><dt>到账事件引用</dt><dd>{receipt?.eventRef || '待观察'}</dd></div><div><dt>最终性／匹配</dt><dd>{receipt ? receiptStatusText(receipt.finality, receipt.match) : '待核对'}</dd></div><div><dt>内部已匹配金额</dt><dd>{receipt?.finality === 'final' && receipt.match === 'matched' ? `${receipt.matchedAmount} U` : '待核对'}</dd></div></dl><p>订单付款状态与资金事件分别保留；请以原资金来源核验，不从付款地址推断投资者身份。</p><div className="c08-actions">{receipt && <a href={href(`/issuer/receipts/receipt/${receipt.id}`, query)}>查看到账事件</a>}{instruction && <a href={href(`/issuer/receipts/instruction/${instruction.id}`, query)}>查看付款条件</a>}</div></section>
    <section className="issuer-card investor-panel" id="order-registration"><h2>法定登记</h2><dl className="investor-facts"><div><dt>登记状态</dt><dd>{registrationLabel[order.registration]}</dd></div><div><dt>登记引用</dt><dd>{order.registrationRef || '未提供'}</dd></div></dl>{progress === 'completed' && order.registration !== 'effective' && <p className="asset-warning">认购进度已完成，法定登记仍待确认；Token 交付不代替法定名册。</p>}<a href={href('/issuer/allocation-holders', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看持有人登记</a></section>
    <section className="issuer-card investor-panel" id="order-delivery"><h2>Token 交付</h2><dl className="investor-facts"><div><dt>交付状态</dt><dd>{deliveryLabel[order.delivery]}</dd></div><div><dt>交付引用</dt><dd>{order.deliveryRef || '未提供'}</dd></div></dl><a href={href('/issuer/token-operations', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看 Token 操作</a></section>
    <section className="issuer-card investor-panel" id="order-exception"><h2>取消、退款、异常与历史</h2><dl className="investor-facts"><div><dt>取消／到期</dt><dd>{order.cancelledAt ? `已取消 · ${when(order.cancelledAt)}` : order.expiredAt ? `已过期 · ${when(order.expiredAt)}` : '无'}</dd></div><div><dt>退款</dt><dd>{order.payment === 'refund-pending' ? '处理中' : order.payment === 'refunded' ? '资金模块已确认' : '无已确认退款'}</dd></div><div><dt>异常</dt><dd>{order.anomaly ? `${order.anomaly.category} · ${order.anomaly.status}` : '无未结清异常'}</dd></div></dl>{order.anomaly && <a href={href('/issuer/refunds', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看责任模块</a>}<p className="asset-hint">{canRequestOrderCancellation(tenant, order) ? '当前具备取消申请前置条件；真实受理仍须由订单服务确认。' : '当前不可直接取消，请先核对付款、预留及权益状态。'}取消不等于退款或容量释放。</p>{canRequestOrderCancellation(tenant, order) && <button type="button" className="issuer-secondary" onClick={() => { setCancelReason(''); setCancelNote(''); setCancelAcknowledged(false); setFeedback(''); setCancelOpen(true); }}>申请取消</button>}{order.cancellationRequest && <p role="status">取消申请已记录，等待订单服务核验；申请编号 {order.cancellationRequest.id}。付款与容量仍按原状态保护。</p>}<details><summary>查看业务事件</summary><ol className="investor-timeline">{[...order.events].reverse().map((event, index) => <li key={`${event.at}-${index}`}>{when(event.at)} · {event.label} · {event.source} {event.ref || ''}</li>)}</ol></details></section>{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}{cancelOpen && <div className="issuer-order-modal-backdrop" onKeyDown={event => { if (event.key === 'Escape') setCancelOpen(false); }}><section className="issuer-order-modal issuer-card" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title"><h2 id="cancel-order-title">取消认购订单？</h2><p>{order.number} · {order.investorRef} · {order.quantity} Token · {order.amount} U</p><p>取消申请不代表已退款，也不保证额度已释放。存在付款或其他在途义务时，须先核对原记录。</p><label>取消原因（必选）<select autoFocus value={cancelReason} onChange={event => setCancelReason(event.target.value as CancellationReason | '')}><option value="">请选择原因</option><option value="investor-withdrew">投资者已放弃</option><option value="duplicate">订单重复需核对</option><option value="other">其他业务原因</option></select></label>{cancelReason === 'other' && <label>备注（选填，最多 200 字）<textarea maxLength={200} value={cancelNote} onChange={event => setCancelNote(event.target.value)} placeholder="简要说明业务原因" /></label>}<label className="issuer-order-confirm"><input type="checkbox" checked={cancelAcknowledged} onChange={event => setCancelAcknowledged(event.target.checked)} />我已核对当前状态，理解取消申请不能替代付款、退款、配售或 Token 处理。</label><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => setCancelOpen(false)}>返回订单</button><button type="button" className="issuer-action" disabled={!cancelReason || !cancelAcknowledged} onClick={submitCancellation}>提交取消申请</button></div></section></div>}
    {anomalyOpen && order.anomaly && <OrderAnomalyDialog anomaly={order.anomaly} query={query} orderId={order.id} onClose={() => setAnomalyOpen(false)} />}
  </div>;
}

export function IssuerOrdersV1({ tenant, query, id }: Props) {
  const [scenarioState, setScenarioState] = useState<'idle' | 'preparing' | 'ready' | 'failed'>('idle');
  const [scenarioError, setScenarioError] = useState('');
  useEffect(() => {
    if (tenant.plan !== 'Standard') return;
    let active = true;
    setScenarioState('preparing');
    void ensureSandboxOperationalChain(tenant).then(() => ensureSandboxFunds(tenant)).then(() => { if (active) setScenarioState('ready'); }).catch(cause => {
      if (active) { setScenarioError(cause instanceof Error ? cause.message : '业务示例数据暂不可用。'); setScenarioState('failed'); }
    });
    return () => { active = false; };
  }, [tenant.id, tenant.plan]);
  const records = readOrders(tenant);
  const [search, setSearch] = useState(() => new URLSearchParams(location.search).get('investorRef') || '');
  const [asset, setAsset] = useState(() => new URLSearchParams(location.search).get('assetId') || '');
  const [offering, setOffering] = useState(() => new URLSearchParams(location.search).get('offeringId') || '');
  const [progress, setProgress] = useState<OrderProgress | ''>('');
  const [payment, setPayment] = useState<PaymentFact | ''>('');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [quick, setQuick] = useState<OrderQuickView>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const portfolio = readPortfolio(tenant);
  const investors = readInvestorRelations(tenant) || [];
  const dateError = fromDate && toDate && fromDate > toDate ? '起始日期不能晚于结束日期。' : '';
  const filtered = useMemo(() => filterOrders(records || [], { search, assetId: asset, offeringId: offering, progress, payment, onlyIssues, quick, fromDate, toDate }), [records, search, asset, offering, progress, payment, onlyIssues, quick, fromDate, toDate]);
  const reset = () => { setSearch(''); setAsset(''); setOffering(''); setProgress(''); setPayment(''); setOnlyIssues(false); setQuick('all'); setFromDate(''); setToDate(''); setPage(1); };
  if (id && tenant.plan === 'Standard' && (scenarioState === 'idle' || scenarioState === 'preparing')) return <div className="asset-page issuer-investors"><h1>认购订单</h1><p>正在准备当前企业的内部流程数据…</p></div>;
  if (id) return <OrderDetail tenant={tenant} query={query} id={id} />;
  if (!records) return <div className="asset-page issuer-investors"><h1>认购订单</h1><p>订单数据暂不可用，请重新登录后重试。</p></div>;
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  return <div className="asset-page issuer-investors issuer-orders"><header className="asset-page-head"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台首页</a><span> / </span>投资者与认购 / 认购订单</nav><div className="asset-heading"><div><h1>认购订单</h1><p>跟踪本企业各发行方案的认购、付款与交付进度。</p></div><button type="button" className="issuer-secondary" onClick={() => { setOnlyIssues(true); setPage(1); }}>查看待处理</button></div></header>
    {scenarioState === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程数据…</p>}
    {scenarioState === 'failed' && <p className="asset-warning" role="alert">内部流程数据暂不可用：{scenarioError}</p>}
    {records.length > 0 && <div className="investor-fixture" role="status">内部 Sandbox 情景记录，基于发行方案草稿独立生成；不代表该方案已公开发布，也不构成真实资金、配售、登记或 Token 交付结果。</div>}
    <section className="issuer-card investor-summary"><div><span>当前筛选订单</span><strong>{filtered.length}</strong></div><div><span>需要关注</span><strong>{filtered.filter(orderNeedsAttention).length}</strong></div><div><span>已完成</span><strong>{filtered.filter(item => orderProgress(item) === 'completed').length}</strong></div></section>
    <nav className="issuer-order-quick" aria-label="订单快捷筛选">{([["all","全部"],["attention","待处理"],["processing","处理中"],["completed","已完成"],["closed","已取消／过期"]] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={quick === value} onClick={() => { setQuick(value); setPage(1); }}>{label}</button>)}</nav>
    <section className="issuer-card investor-filters"><label>搜索订单<input value={search} maxLength={120} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="订单号或本企业投资者编号" /></label><label>资产<select value={asset} onChange={event => { setAsset(event.target.value); setOffering(''); setPage(1); }}><option value="">全部</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>发行方案<select value={offering} onChange={event => { setOffering(event.target.value); setPage(1); }}><option value="">全部</option>{portfolio.offerings.filter(item => !asset || item.assetId === asset).map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>订单进度<select value={progress} onChange={event => { setProgress(event.target.value as OrderProgress | ''); setPage(1); }}><option value="">全部</option>{Object.entries(orderProgressLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>付款状态<select value={payment} onChange={event => { setPayment(event.target.value as PaymentFact | ''); setPage(1); }}><option value="">全部</option>{Object.entries(paymentLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>创建时间起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>创建时间止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label><label className="investor-toggle"><input type="checkbox" checked={onlyIssues} onChange={event => { setOnlyIssues(event.target.checked); setPage(1); }} />仅看异常</label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>{dateError && <p className="issuer-feedback" role="alert">{dateError}</p>}
    {filtered.length ? <section className="issuer-card investor-table-wrap"><table className="issuer-order-table"><thead><tr><th>订单</th><th>投资者</th><th>资产 / Offering</th><th>数量 / 应付</th><th>进度</th><th>付款</th><th>法定登记</th><th>交付</th><th>创建时间</th><th>操作</th></tr></thead><tbody>{filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => { const investor = investors.find(row => row.id === item.investorId); const assetRecord = portfolio.assets.find(row => row.id === item.assetId); const offer = portfolio.offerings.find(row => row.id === item.offeringId); return <tr key={item.id}><td><strong>{item.number}</strong></td><td>{investor?.state === 'unavailable' ? '授权资料不可用' : investor?.displayName || item.investorRef}<small>{item.investorRef}</small></td><td>{assetRecord ? latest(assetRecord).fields.name : item.assetId}<small>{offer ? latest(offer).fields.name : item.offeringNumber}</small></td><td>{item.quantity} Token<small>{item.amount} U</small></td><td>{orderProgressLabel[orderProgress(item)]}{item.cancellationRequest && <small>取消申请待核</small>}{orderProgress(item) === 'completed' && item.registration !== 'effective' && <small>法定登记待确认</small>}</td><td>{paymentLabel[item.payment]}</td><td>{registrationLabel[item.registration]}</td><td>{deliveryLabel[item.delivery]}</td><td>{when(item.createdAt)}</td><td><a href={href(`/issuer/orders/${item.id}`, query)}>查看详情</a></td></tr>; })}</tbody></table><div className="issuer-order-cards">{filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => <article key={item.id}><strong>{item.number}</strong><p>{investors.find(row => row.id === item.investorId)?.displayName || item.investorRef} · {item.investorRef}</p><p>{portfolio.offerings.find(row => row.id === item.offeringId)?.versions.at(-1)?.fields.name || item.offeringNumber}</p><dl><div><dt>数量／应付</dt><dd>{item.quantity} Token · {item.amount} U</dd></div><div><dt>进度</dt><dd>{orderProgressLabel[orderProgress(item)]}{item.cancellationRequest && <small>取消申请待核</small>}{orderProgress(item) === 'completed' && item.registration !== 'effective' && <small>法定登记待确认</small>}</dd></div><div><dt>付款</dt><dd>{paymentLabel[item.payment]}</dd></div><div><dt>法定登记</dt><dd>{registrationLabel[item.registration]}</dd></div><div><dt>交付</dt><dd>{deliveryLabel[item.delivery]}</dd></div></dl><a href={href(`/issuer/orders/${item.id}`, query)}>查看详情</a></article>)}</div><div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {filtered.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section> : <section className="issuer-card investor-empty"><h2>{records.length ? '没有符合当前筛选条件的订单' : tenant.plan === 'Free' ? 'Free 套餐不开放真实认购订单' : '还没有认购订单'}</h2><p>{records.length ? '请清除筛选后重试。' : tenant.plan === 'Free' ? '完成发行资料准备与内部预览后，可查看 Standard 套餐。' : '投资者在已开放的发行方案中完成认购确认后，订单将显示在这里。'}</p><div className="c08-actions">{records.length ? <button className="issuer-secondary" onClick={reset}>清除筛选</button> : <a className="issuer-action" href={href(tenant.plan === 'Free' ? '/issuer/plan' : '/issuer/assets', query)}>{tenant.plan === 'Free' ? '查看套餐' : '查看发行方案'}</a>}</div></section>}
  </div>;
}
