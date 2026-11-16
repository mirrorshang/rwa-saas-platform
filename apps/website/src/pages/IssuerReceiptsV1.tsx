import { useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { collectionPlan, deriveFundsIssues, formatU, parseU, readFundsData, submitMatchReview,
  type FundsIssue, type ReceiptFinality, type ReceiptMatch } from '../issuerFundsV1';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { useIssuerFundsScenario } from './useIssuerFundsScenario';
import { orderBusinessDate, readOrders } from '../issuerOrdersV1';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type View = 'plans' | 'instructions' | 'receipts' | 'reconcile';
type DetailKind = 'plan' | 'instruction' | 'receipt' | 'issue';
type Props = { tenant: DemoTenant; query: string; detailKind?: DetailKind; detailId?: string };
const base = '/issuer/receipts';
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at?: number) => at ? new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）' : '待核对';
const finalityLabel: Record<ReceiptFinality, string> = { observed: '已观察', 'pending-finality': '待最终性确认', final: '内部情景最终确认', unknown: '无法确认', invalid: '无效／待调查' };
const matchLabel: Record<ReceiptMatch, string> = { unmatched: '未匹配', partial: '部分匹配', matched: '内部情景已匹配', underpaid: '少付待核', overpaid: '多付待核', disputed: '争议中' };
const issueLabel: Record<FundsIssue['category'], string> = { unknown: '无法确认', 'invalid-target': '网络／资产异常', underpaid: '少付', overpaid: '多付', unmatched: '未归属', source: '付款来源待核' };
const reviewLabel = { submitted: '已提交待核', checking: '核对中', 'needs-info': '需补充资料', rejected: '已拒绝', unknown: '无法确认' };

function Detail({ tenant, query, kind, id }: Props & { kind: DetailKind; id: string }) {
  const [reason, setReason] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [, setRevision] = useState(0);
  const data = readFundsData(tenant);
  const portfolio = readPortfolio(tenant);
  const orders = readOrders(tenant) || [];
  const plans = portfolio.offerings.map(item => ({ offering: item, plan: collectionPlan(tenant, item) }));
  const instruction = kind === 'instruction' ? data?.instructions.find(item => item.id === id) : undefined;
  const receipt = kind === 'receipt' ? data?.receipts.find(item => item.id === id) : undefined;
  const issue = kind === 'issue' && data ? deriveFundsIssues(data).find(item => item.id === id) : undefined;
  const plan = kind === 'plan' ? plans.find(item => item.offering.id === id) : undefined;
  if (!data || !(instruction || receipt || issue || plan)) return <section className="asset-page issuer-investors"><h1>记录不存在或无权访问</h1><a href={link(base, query)}>返回收款与对账</a></section>;
  const record = receipt || (issue && data.receipts.find(item => item.id === issue.receiptId));
  const order = orders.find(item => item.id === (instruction?.orderId || record?.orderId));
  const investor = (readInvestorRelations(tenant) || []).find(item => item.id === order?.investorId);
  const reviews = data.matchReviews.filter(item => item.receiptId === record?.id);
  const canReview = tenant.plan === 'Standard' && record?.finality === 'final' && record.network === 'OP Mainnet' &&
    record.token === 'USDT' && record.match !== 'matched' && Boolean(order);
  const submit = () => {
    if (!record || !order) return;
    if (!confirmed || reason.trim().length < 10 || !evidenceRef) { setFeedback('请填写 10–500 字原因、选择已核验证据并确认申请边界。'); return; }
    if (!review) { setReview(true); setFeedback(''); return; }
    try {
      const result = submitMatchReview(tenant, record.id, order.id, reason, evidenceRef);
      setFeedback(`复核事项 ${result.id} 已保存，原到账与订单付款状态未改变。`);
      setReview(false); setRevision(value => value + 1);
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '复核事项未保存。'); }
  };
  return <section className="asset-page issuer-investors issuer-funds"><nav className="issuer-crumb"><a href={link(base, query)}>收款与对账</a> / {id}</nav>
    <header className="asset-page-head"><h1>{kind === 'plan' ? '收款安排' : kind === 'instruction' ? '付款条件快照' : kind === 'issue' ? '资金异常' : '到账观察'} · {id}</h1><p>付款指令、最终到账、订单匹配和配售分别核对。</p></header>
    {(instruction || record) && <div className="investor-fixture" role="status">内部 Sandbox 情景记录，不构成真实付款指令、链上到账或订单实收确认。</div>}
    {plan && <><section className="issuer-card investor-panel"><h2>Offering 收款安排</h2><dl className="investor-facts"><div><dt>发行方案</dt><dd>{latest(plan.offering).fields.name} · V{plan.plan.offeringVersion}</dd></div><div><dt>企业收款钱包</dt><dd>{plan.plan.walletName || '未配置'} · {plan.plan.walletVerified ? '本地配置已核验' : '待核验'}</dd></div><div><dt>默认收款路径</dt><dd>Offering 专用收款合约；合同与合法主体待核</dd></div><div><dt>投资者付款目标</dt><dd>未生成</dd></div><div><dt>支付范围</dt><dd>USDT / OP Mainnet</dd></div><div><dt>生产状态</dt><dd>{plan.plan.reason}</dd></div></dl><p>企业钱包与投资者付款目标分别核对；当前不提供可用于真实付款的地址。</p><div className="c08-actions"><a href={link(`/issuer/offerings/${plan.offering.id}`, query)}>查看发行方案</a><a href={link('/issuer/wallets', query)}>查看钱包管理</a></div></section></>}
    {instruction && <><section className="issuer-card investor-panel"><h2>固定订单条件</h2><dl className="investor-facts"><div><dt>订单编号</dt><dd><a href={link(`/issuer/orders/${instruction.orderId}`, query)}>{order?.number || instruction.orderId}</a></dd></div><div><dt>投资者</dt><dd>{investor?.displayName || order?.investorRef || '待核对'}</dd></div><div><dt>Offering 版本</dt><dd>{instruction.offeringId} · V{instruction.offeringVersion}</dd></div><div><dt>应付金额</dt><dd>{instruction.amount} U</dd></div><div><dt>支付资产／网络</dt><dd>USDT / OP Mainnet</dd></div><div><dt>内部目标引用</dt><dd>{instruction.targetRef}；不可作为真实地址使用</dd></div><div><dt>创建／有效截止</dt><dd>{when(instruction.createdAt)} / {when(instruction.expiresAt)}</dd></div><div><dt>状态</dt><dd>仅供内部核对，不可用于真实付款</dd></div></dl></section><section className="issuer-card investor-panel"><h2>关联到账观察</h2>{data.receipts.filter(item => item.instructionId === instruction.id).map(item => <a key={item.id} href={link(`${base}/receipt/${item.id}`, query)}>{item.id} · {finalityLabel[item.finality]} · {matchLabel[item.match]}</a>)}{!data.receipts.some(item => item.instructionId === instruction.id) && <p>暂无关联到账；付款条件快照不表示已付款。</p>}</section></>}
    {record && <><section className="issuer-card investor-panel"><h2>资金事件与来源</h2><dl className="investor-facts"><div><dt>内部事件引用</dt><dd>{record.eventRef}；无真实交易哈希</dd></div><div><dt>网络／资产</dt><dd>{record.network === 'OP Mainnet' ? 'OP Mainnet' : '待调查网络'} / {record.token === 'USDT' ? 'USDT' : '未核验资产'}</dd></div><div><dt>资金来源引用</dt><dd>{record.sourceRef} · {record.sourceLink === 'verified' ? '已核验' : record.sourceLink === 'unknown' ? '来源待核' : '未关联'}</dd></div><div><dt>内部目标引用</dt><dd>{record.targetRef}</dd></div><div><dt>实际观察金额</dt><dd>{record.amount} U</dd></div><div><dt>事件发生／平台接收</dt><dd>{when(record.occurredAt)} / {when(record.receivedAt)}</dd></div><div><dt>最后核对</dt><dd>{when(record.checkedAt)}</dd></div></dl></section>
      <section className="issuer-card investor-panel"><h2>最终性与订单匹配</h2><dl className="investor-facts"><div><dt>最终性</dt><dd>{finalityLabel[record.finality]}</dd></div><div><dt>匹配进度</dt><dd>{matchLabel[record.match]}</dd></div><div><dt>订单义务</dt><dd>{order ? `${order.amount} U · ${order.number}` : '未关联唯一订单'}</dd></div><div><dt>已匹配金额</dt><dd>{record.matchedAmount} U</dd></div><div><dt>当前差额</dt><dd>{order && parseU(order.amount) !== null && parseU(record.amount) !== null ? `${formatU(parseU(order.amount)! - parseU(record.amount)!)} U` : '待核对'}</dd></div><div><dt>付款主体关联</dt><dd>{record.sourceLink === 'verified' ? '来源已核验' : '尚未确认证明；不能从来源引用推断投资者身份'}</dd></div></dl><div className="c08-actions">{order && <a href={link(`/issuer/orders/${order.id}`, query)}>查看原订单</a>}{record.instructionId && <a href={link(`${base}/instruction/${record.instructionId}`, query)}>查看付款条件</a>}</div></section>
      {issue && <section className="issuer-card investor-panel"><h2>异常与下一步</h2><p>{issueLabel[issue.category]} · {issue.title}</p><p>下一步：{issue.nextStep}</p><p className="asset-warning">未知或差异状态先核对原事件；不重复记账、退款或释放订单容量。</p></section>}
      {reviews.length > 0 && <section className="issuer-card investor-panel"><h2>匹配复核历史</h2><ol className="investor-timeline">{reviews.map(item => <li key={item.id}>{when(item.createdAt)} · {item.id} · {reviewLabel[item.state]} · {item.evidenceRef}</li>)}</ol></section>}
      {canReview && <section className="issuer-card investor-panel"><h2>提交匹配复核</h2><p>申请只进入受权核对，不会将到账或订单手动改为已付款。</p><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => { setReason('请核对该笔资金事件与订单金额、付款主体及目标依据。'); setEvidenceRef(record.evidenceVersions?.find(item => item.status === 'passed')?.ref || ''); setConfirmed(false); setReview(false); setFeedback(''); }}>填入示例数据</button></div><label>复核原因（必填，10–500 字）<textarea value={reason} maxLength={500} onChange={event => { setReason(event.target.value); setReview(false); }} placeholder="说明差额、来源或匹配依据" /></label><label>证据固定版本（必选）<select value={evidenceRef} onChange={event => { setEvidenceRef(event.target.value); setReview(false); }}><option value="">请选择已核验版本</option>{record.evidenceVersions?.map(item => <option key={item.ref} value={item.ref} disabled={item.status !== 'passed'}>{item.label} · {item.ref}</option>)}</select></label><label className="funds-confirm"><input type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setReview(false); }} />我确认提交复核不等于确认真实到账或订单已付款。</label>{review && <p className="asset-warning">请确认：事件 {record.id} → 订单 {order?.number}，证据 {evidenceRef}；提交后等待受权核对。</p>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}<div className="c08-actions"><button type="button" onClick={submit}>{review ? '确认提交复核' : '核对申请'}</button><button type="button" className="issuer-secondary" onClick={() => { setReason(''); setEvidenceRef(''); setConfirmed(false); setReview(false); setFeedback(''); }}>清空</button></div></section>}
      <section className="issuer-card investor-panel"><h2>事件历史</h2><ol className="investor-timeline">{record.events.map((item, index) => <li key={`${item.at}-${index}`}>{when(item.at)} · {item.label} · {item.source}</li>)}</ol></section>
    </>}
  </section>;
}

export function IssuerReceiptsV1({ tenant, query, detailKind, detailId }: Props) {
  const { data, state: scenarioState, error: scenarioError, retry } = useIssuerFundsScenario(tenant);
  const [view, setView] = useState<View>(() => { const saved = new URLSearchParams(location.search).get('view');
    return saved === 'instructions' || saved === 'receipts' || saved === 'reconcile' ? saved : 'plans'; });
  const [search, setSearch] = useState('');
  const [assetId, setAssetId] = useState('');
  const [offeringId, setOfferingId] = useState(new URLSearchParams(location.search).get('offeringId') || '');
  const [finality, setFinality] = useState<ReceiptFinality | ''>('');
  const [match, setMatch] = useState<ReceiptMatch | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  if (detailKind && detailId && scenarioState === 'preparing') return <section className="asset-page issuer-investors"><h1>收款与对账</h1><p>正在核对当前企业资料…</p></section>;
  if (detailKind && detailId) return <Detail tenant={tenant} query={query} kind={detailKind} id={detailId} />;
  const portfolio = readPortfolio(tenant);
  const orders = readOrders(tenant) || [];
  if (!data) return <section className="asset-page issuer-investors"><h1>收款与对账</h1><p>当前资金资料不可读取，请保留本地记录并重试。</p></section>;
  const issues = deriveFundsIssues(data);
  const dateError = fromDate && toDate && fromDate > toDate;
  const common = (offering: string, at: number, terms: string) => !dateError && (!offeringId || offering === offeringId) &&
    (!assetId || portfolio.offerings.find(item => item.id === offering)?.assetId === assetId) &&
    (!search || terms.toLowerCase().includes(search.trim().toLowerCase())) &&
    (!fromDate || orderBusinessDate(at) >= fromDate) && (!toDate || orderBusinessDate(at) <= toDate);
  const plans = portfolio.offerings.filter(item => common(item.id, latest(item).at, `${item.number} ${latest(item).fields.name}`));
  const instructions = data.instructions.filter(item => {
    const order = orders.find(row => row.id === item.orderId);
    return common(item.offeringId, item.createdAt, `${item.id} ${order?.number || ''}`);
  }).sort((a, b) => b.createdAt - a.createdAt);
  const receipts = data.receipts.filter(item => {
    const order = orders.find(row => row.id === item.orderId);
    return common(item.offeringId, item.checkedAt, `${item.id} ${item.eventRef} ${order?.number || ''}`) &&
      (!finality || item.finality === finality) && (!match || item.match === match);
  }).sort((a, b) => b.checkedAt - a.checkedAt);
  const issueRows = issues.filter(item => common(item.offeringId, item.updatedAt, `${item.id} ${item.title} ${item.orderId || ''}`));
  const total = view === 'plans' ? plans.length : view === 'instructions' ? instructions.length : view === 'receipts' ? receipts.length : issueRows.length;
  const pages = Math.max(1, Math.ceil(total / 20));
  const slice = <T,>(items: T[]) => items.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20);
  const matchedTotal = data.receipts.filter(item => item.finality === 'final' && item.match === 'matched')
    .reduce((sum, item) => sum + (parseU(item.matchedAmount) || 0n), 0n);
  const asOf = Math.max(0, ...data.receipts.map(item => item.checkedAt));
  const reset = () => { setSearch(''); setAssetId(''); setOfferingId(''); setFinality(''); setMatch(''); setFromDate(''); setToDate(''); setPage(1); };
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 资金与结算 / 收款与对账</nav><h1>收款与对账</h1><p>付款条件、到账观察、最终性与订单匹配分别核对；当前发行方案未具备真实收款准入。</p></header>
    {scenarioState === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程资料…</p>}
    {scenarioState === 'failed' && <div className="asset-warning" role="alert">资金资料暂不可用：{scenarioError} <button type="button" className="issuer-secondary" onClick={retry}>重新核对</button></div>}
    {(data.instructions.length > 0 || data.receipts.length > 0) && <div className="investor-fixture" role="status">内部 Sandbox 情景记录；无真实付款目标、交易哈希或资金执行结果。</div>}
    {tenant.plan === 'Free' && <div className="investor-fixture">Free 可查看发行收款准备状态；不生成真实付款指令或客户资金记录。</div>}
    <section className="issuer-card investor-summary"><div><span>待付款条件快照</span><strong>{data.instructions.filter(item => item.state === 'internal-preview').length}</strong></div><div><span>观察／最终性待核</span><strong>{data.receipts.filter(item => item.finality === 'observed' || item.finality === 'pending-finality' || item.finality === 'unknown').length}</strong></div><div><span>最终到账待匹配</span><strong>{data.receipts.filter(item => item.finality === 'final' && item.match !== 'matched').length}</strong></div><div><span>内部情景已匹配</span><strong>{formatU(matchedTotal)} U</strong></div><div><span>差额与异常</span><strong>{issues.length}</strong></div><div><span>数据截至</span><strong className="funds-asof">{when(asOf)}</strong></div></section>
    <nav className="issuer-funds-tabs" aria-label="收款与对账视图">{([['plans', '收款安排'], ['instructions', '付款条件'], ['receipts', '到账记录'], ['reconcile', '对账异常']] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={view === key} onClick={() => { setView(key); setPage(1); }}>{label}</button>)}</nav>
    <section className="issuer-card investor-filters"><label>搜索<input value={search} maxLength={120} placeholder="编号、Offering 或订单号" onChange={event => { setSearch(event.target.value); setPage(1); }} /></label><label>资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setOfferingId(''); setPage(1); }}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>发行方案<select value={offeringId} onChange={event => { setOfferingId(event.target.value); setPage(1); }}><option value="">全部期次</option>{portfolio.offerings.filter(item => !assetId || item.assetId === assetId).map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>
    {view === 'receipts' && <section className="issuer-card investor-filters"><label>最终性<select value={finality} onChange={event => { setFinality(event.target.value as ReceiptFinality | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(finalityLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>匹配进度<select value={match} onChange={event => { setMatch(event.target.value as ReceiptMatch | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(matchLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></section>}
    <section className="issuer-card investor-filters"><label>日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label></section>
    {dateError && <p className="issuer-feedback" role="alert">起始日期不能晚于结束日期。</p>}
    <section className="issuer-card investor-table-wrap"><h2>{view === 'plans' ? 'Offering 收款安排' : view === 'instructions' ? '付款条件快照' : view === 'receipts' ? '到账观察记录' : '对账异常'}</h2>
      {view === 'plans' && (plans.length ? <div className="funds-list">{slice(plans).map(item => { const plan = collectionPlan(tenant, item); return <article key={item.id}><strong>{latest(item).fields.name}</strong><span>{item.number} · V{plan.offeringVersion}</span><span>USDT / OP Mainnet</span><span>{plan.walletName || '企业钱包待配置'}</span><span>生产收款待准入</span><a href={link(`${base}/plan/${item.id}`, query)}>查看详情</a></article>; })}</div> : <p>暂无符合条件的发行收款安排。请先在资产与发行中准备 Offering。</p>)}
      {view === 'instructions' && (instructions.length ? <div className="funds-list">{slice(instructions).map(item => { const order = orders.find(row => row.id === item.orderId); return <article key={item.id}><strong>{item.id}</strong><span>{order?.number || '订单待核'}</span><span>{item.amount} U</span><span>USDT / OP Mainnet</span><span>仅内部条件快照</span><a href={link(`${base}/instruction/${item.id}`, query)}>查看详情</a></article>; })}</div> : <p>{tenant.plan === 'Free' ? '当前套餐不生成真实付款指令。' : '暂无付款条件快照；请核对订单与发行准入。'}</p>)}
      {view === 'receipts' && (receipts.length ? <div className="funds-list">{slice(receipts).map(item => <article key={item.id}><strong>{item.id}</strong><span>{item.amount} U · {item.orderId || '未关联订单'}</span><span>{finalityLabel[item.finality]}</span><span>{matchLabel[item.match]}</span><span>{when(item.checkedAt)}</span><a href={link(`${base}/receipt/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{data.receipts.length ? '没有符合筛选条件的到账记录。' : '暂无可核对的到账记录；未知来源不按零或已收款处理。'}</p>)}
      {view === 'reconcile' && (issueRows.length ? <div className="funds-list">{slice(issueRows).map(item => <article key={item.id}><strong>{item.id}</strong><span>{issueLabel[item.category]} · {item.title}</span><span>{item.amount} U</span><span>{item.orderId || '待关联'}</span><span>{when(item.updatedAt)}</span><a href={link(`${base}/issue/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{issues.length ? '没有符合筛选条件的异常。' : '当前没有已记录的对账异常；外部来源未接入时不能据此判断全部资金已核清。'}</p>)}
      <div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {total} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div>
    </section>
  </section>;
}
