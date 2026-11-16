import { useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { deriveFundsIssues, refundRequestRoom, readFundsData, submitRefundRequest, updateRefundApproval,
  type RefundReason, type RefundRecord } from '../issuerFundsV1';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { orderBusinessDate, readOrders } from '../issuerOrdersV1';
import { readPortfolio } from '../issuerPortfolioV1';
import { useIssuerFundsScenario } from './useIssuerFundsScenario';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type Props = { tenant: DemoTenant; query: string; detailKind?: 'refund' | 'issue'; detailId?: string };
const base = '/issuer/refunds';
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at?: number) => at ? new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）' : '待核对';
const reasonLabel: Record<RefundReason, string> = { 'offering-failed': '未达到发行条件', 'order-cancelled': '订单依法取消', overpayment: '超额／重复收款', 'wrong-payment': '错款／异常收款', 'other-approved': '其他受权原因' };
const approvalLabel: Record<RefundRecord['approval'], string> = { requested: '待有权核对', 'needs-info': '需补充资料', rejected: '已拒绝', 'approved-scoped': '内部情景已记录受权结果', unknown: '无法确认' };
const executionLabel: Record<RefundRecord['execution'], string> = { 'not-submitted': '未执行', submitted: '已提交待核', pending: '执行中', unknown: '无法确认', partial: '部分退款', settled: '已核实完成', failed: '失败／退回' };

function RefundDetail({ tenant, query, id }: Props & { id: string }) {
  const [, setRevision] = useState(0);
  const [approvalRef, setApprovalRef] = useState('');
  const [feedback, setFeedback] = useState('');
  const data = readFundsData(tenant);
  const refund = data?.refunds?.find(item => item.id === id);
  if (!refund) return <section className="asset-page issuer-investors"><h1>退款记录不存在或无权访问</h1><a href={link(base, query)}>返回退款与异常</a></section>;
  const order = (readOrders(tenant) || []).find(item => item.id === refund.orderId);
  const receipt = data?.receipts.find(item => item.id === refund.receiptId);
  const eligibility = data?.refundEligibility?.find(item => item.id === refund.eligibilityId);
  const investor = (readInvestorRelations(tenant) || []).find(item => item.id === order?.investorId);
  const change = (next: 'needs-info' | 'rejected' | 'approved-scoped' | 'unknown') => {
    try {
      updateRefundApproval(tenant, refund.id, next, approvalRef);
      setRevision(value => value + 1);
      setFeedback('内部复核结果已记录；真实退款执行与投资者到账状态未改变。');
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '复核结果未保存。'); }
  };
  return <section className="asset-page issuer-investors issuer-funds"><nav className="issuer-crumb"><a href={link(base, query)}>退款与异常</a> / {refund.id}</nav><header className="asset-page-head"><h1>退款申请 · {refund.id}</h1><p>申请、授权、实际出款和受领到账分别核对。</p></header>
    <div className="investor-fixture" role="status">内部 Sandbox 情景申请；没有真实退款、Signer 指令或投资者到账结果。</div>
    <section className="issuer-card investor-panel"><h2>订单与原实收</h2><dl className="investor-facts"><div><dt>订单</dt><dd>{order ? <a href={link(`/issuer/orders/${order.id}`, query)}>{order.number}</a> : '原订单待核'}</dd></div><div><dt>投资者引用</dt><dd>{investor?.displayName || order?.investorRef || '待核'}</dd></div><div><dt>Offering / 版本</dt><dd>{order?.offeringNumber || refund.offeringId} · V{order?.offeringVersion || '待核'}</dd></div><div><dt>原到账事件</dt><dd><a href={link(`/issuer/receipts/receipt/${refund.receiptId}`, query)}>{receipt?.eventRef || refund.receiptId}</a></dd></div><div><dt>原最终匹配实收</dt><dd>{receipt?.matchedAmount || '待核'} U</dd></div><div><dt>申请金额</dt><dd>{refund.amount} U</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>依据与受益人</h2><dl className="investor-facts"><div><dt>退款原因</dt><dd>{reasonLabel[refund.reason]}</dd></div><div><dt>原因说明</dt><dd>{refund.note}</dd></div><div><dt>固定依据版本</dt><dd>{refund.basisRef}</dd></div><div><dt>合法受益主体引用</dt><dd>{refund.beneficiaryRef}</dd></div><div><dt>受权目标引用</dt><dd>{refund.targetRef} · {refund.targetVerified ? '本地情景已核验' : '待核验'}</dd></div><div><dt>原付款来源</dt><dd>{receipt?.sourceRef || '待核'}；不会自动成为退款目标</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>授权与实际执行</h2><dl className="investor-facts"><div><dt>审批状态</dt><dd>{approvalLabel[refund.approval]}</dd></div><div><dt>受权决定引用</dt><dd>{refund.approvalRef || '待有权主体确认'}</dd></div><div><dt>执行状态</dt><dd>{executionLabel[refund.execution]}</dd></div><div><dt>已实际划出</dt><dd>{refund.actualOut} U</dd></div><div><dt>已核实受领</dt><dd>{refund.actualReceived} U</dd></div><div><dt>最近更新</dt><dd>{when(refund.updatedAt)}</dd></div></dl><p className="asset-warning">已申请或已获受权，不表示实际退款成功。真实执行通道未接入。</p>
      {tenant.plan === 'Standard' && refund.approval !== 'rejected' && refund.execution === 'not-submitted' && <div className="funds-review-control"><label>受权决定引用（记录批准时必填）<input value={approvalRef} maxLength={120} onChange={event => setApprovalRef(event.target.value)} placeholder="固定决定或证据版本" /></label><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => change('needs-info')}>要求补件</button><button type="button" className="issuer-secondary" onClick={() => change('rejected')}>记录拒绝</button><button type="button" className="issuer-secondary" onClick={() => change('unknown')}>设为无法确认</button><button type="button" className="issuer-secondary" onClick={() => change('approved-scoped')}>记录受权结果</button></div></div>}
      {feedback && <p className="issuer-feedback" role="status">{feedback}</p>}
    </section>
    <section className="issuer-card investor-panel"><h2>事件与异常历史</h2><ol className="investor-timeline">{refund.events.map((item, index) => <li key={`${item.at}-${index}`}>{when(item.at)} · {item.label}{item.ref && ` · ${item.ref}`}</li>)}</ol><p>申请资格快照：{eligibility?.id || '待核'} · {when(eligibility?.checkedAt)}。</p></section>
  </section>;
}

export function IssuerRefundsV1({ tenant, query, detailKind, detailId }: Props) {
  const { data, state, error, retry } = useIssuerFundsScenario(tenant);
  const [, setRevision] = useState(0);
  const [view, setView] = useState<'refunds' | 'issues'>(() => new URLSearchParams(location.search).get('view') === 'issues' ? 'issues' : 'refunds');
  const [eligibilityId, setEligibilityId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<RefundReason>('offering-failed');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<RefundRecord['approval'] | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  if (detailId && state === 'preparing') return <section className="asset-page issuer-investors"><h1>退款与异常</h1><p>正在核对当前企业资金记录…</p></section>;
  if (detailKind === 'refund' && detailId) return <RefundDetail tenant={tenant} query={query} id={detailId} />;
  if (!data) return <section className="asset-page issuer-investors"><h1>退款与异常</h1><p>当前资金资料不可读取，请保留本地记录并重试。</p></section>;
  const orders = readOrders(tenant) || [];
  const portfolio = readPortfolio(tenant);
  const issues = deriveFundsIssues(data);
  const issue = detailKind === 'issue' && detailId ? issues.find(item => item.id === detailId) : undefined;
  if (detailKind === 'issue' && detailId) return issue ? <section className="asset-page issuer-investors issuer-funds"><nav className="issuer-crumb"><a href={link(base, query)}>退款与异常</a> / {issue.id}</nav><header className="asset-page-head"><h1>资金异常 · {issue.id}</h1><p>{issue.title}</p></header><div className="investor-fixture">内部 Sandbox 情景记录；处理事项不更改原资金事件。</div><section className="issuer-card investor-panel"><h2>异常来源</h2><dl className="investor-facts"><div><dt>金额</dt><dd>{issue.amount} U</dd></div><div><dt>关联订单</dt><dd>{issue.orderId || '未归属'}</dd></div><div><dt>发现与核对</dt><dd>{when(issue.updatedAt)}</dd></div><div><dt>下一步</dt><dd>{issue.nextStep}</dd></div></dl><div className="c08-actions"><a href={link(`/issuer/receipts/receipt/${issue.receiptId}`, query)}>查看原到账事件</a>{issue.orderId && <a href={link(`/issuer/orders/${issue.orderId}`, query)}>查看原订单</a>}</div><p className="asset-warning">Unknown 时先核对原事件，不能重复支付、退款或直接标记已到账。</p></section></section> : <section className="asset-page issuer-investors"><h1>异常不存在或无权访问</h1><a href={link(base, query)}>返回退款与异常</a></section>;
  const eligibility = data.refundEligibility?.find(item => item.id === eligibilityId) || data.refundEligibility?.[0];
  const room = eligibility ? refundRequestRoom(data, eligibility) : null;
  const order = orders.find(item => item.id === eligibility?.orderId);
  const receipt = data.receipts.find(item => item.id === eligibility?.receiptId);
  const dateError = fromDate && toDate && fromDate > toDate;
  const rows = (data.refunds || []).filter(item => {
    const original = orders.find(record => record.id === item.orderId);
    const date = orderBusinessDate(item.updatedAt);
    return !dateError && (!search || `${item.id} ${original?.number || ''} ${item.receiptId}`.toLowerCase().includes(search.trim().toLowerCase())) &&
      (!approvalFilter || item.approval === approvalFilter) && (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  }).sort((a, b) => b.updatedAt - a.updatedAt);
  const issueRows = issues.filter(item => !dateError && (!search || `${item.id} ${item.title} ${item.orderId || ''}`.toLowerCase().includes(search.trim().toLowerCase())) &&
    (!fromDate || orderBusinessDate(item.updatedAt) >= fromDate) && (!toDate || orderBusinessDate(item.updatedAt) <= toDate));
  const total = view === 'refunds' ? rows.length : issueRows.length;
  const pages = Math.max(1, Math.ceil(total / 20));
  const slice = <T,>(items: T[]) => items.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20);
  const fill = () => { if (!eligibility || !room || room === '0') return;
    setEligibilityId(eligibility.id); setAmount(room); setReason('offering-failed');
    setNote('请按已批准的发行及退款条款核对本次退款义务。'); setConfirmed(false); setReview(false); setFeedback(''); };
  const submit = () => {
    if (!eligibility) { setFeedback('当前没有可申请的受权退款资格。'); return; }
    if (!confirmed || note.trim().length < 10 || !amount) { setFeedback('请填写金额、10–500 字说明并确认申请边界。'); return; }
    if (!review) { setReview(true); setFeedback(''); return; }
    try { const result = submitRefundRequest(tenant, eligibility.id, { amount, reason, note, basisRef: eligibility.basisRef, confirmed });
      setReview(false); setRevision(value => value + 1);
      setFeedback(`退款申请 ${result.id} 已保存；批准、实际出款与投资者受领仍待分别核对。`);
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '退款申请未保存。'); }
  };
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 资金与结算 / 退款与异常</nav><h1>退款与异常</h1><p>退款申请、受权批准、实际出款与投资者受领不是同一状态。</p></header>
    {state === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程资料…</p>}
    {state === 'failed' && <div className="asset-warning" role="alert">资金资料暂不可用：{error} <button type="button" className="issuer-secondary" onClick={retry}>重新核对</button></div>}
    {(data.receipts.length > 0 || (data.refunds || []).length > 0) && <div className="investor-fixture" role="status">内部 Sandbox 情景记录；不代表真实退款或到账。</div>}
    {tenant.plan === 'Free' && <div className="investor-fixture">当前套餐不发起真实退款；历史资金与法定义务仍需按原受权流程核对。</div>}
    <section className="issuer-card investor-summary"><div><span>待有权核对</span><strong>{(data.refunds || []).filter(item => item.approval === 'requested' || item.approval === 'needs-info').length}</strong></div><div><span>已记录受权但未执行</span><strong>{(data.refunds || []).filter(item => item.approval === 'approved-scoped' && item.execution === 'not-submitted').length}</strong></div><div><span>资金异常待核</span><strong>{issues.length}</strong></div></section>
    <nav className="issuer-funds-tabs" aria-label="退款与异常视图"><button type="button" aria-pressed={view === 'refunds'} onClick={() => { setView('refunds'); setPage(1); }}>退款申请</button><button type="button" aria-pressed={view === 'issues'} onClick={() => { setView('issues'); setPage(1); }}>资金异常</button></nav>
    {view === 'refunds' && <section className="issuer-card investor-panel"><h2>发起受控退款申请</h2>{tenant.plan === 'Standard' && eligibility && room && room !== '0' ? <><p>当前仅保存内部申请，不发起真实出款。可申请额度来自固定资格快照，不从钱包余额推算。</p><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={fill}>填入示例数据</button></div><label>退款资格（必选）<select value={eligibilityId || eligibility.id} onChange={event => { setEligibilityId(event.target.value); setAmount(''); setReview(false); }}><option value={eligibility.id}>{eligibility.id} · {order?.number || '订单待核'}</option></select></label><dl className="investor-facts"><div><dt>原最终实收</dt><dd>{receipt?.matchedAmount || '待核'} U</dd></div><div><dt>本地可申请剩余额度</dt><dd>{room} U</dd></div><div><dt>合法受益主体</dt><dd>{eligibility.beneficiaryRef}</dd></div><div><dt>已核验目标引用</dt><dd>{eligibility.targetRef}；不自动使用原付款来源</dd></div><div><dt>固定依据</dt><dd>{eligibility.basisRef}</dd></div><div><dt>资格核对时间</dt><dd>{when(eligibility.checkedAt)}</dd></div></dl><label>本次申请金额 U（必填）<input value={amount} inputMode="decimal" onChange={event => { setAmount(event.target.value); setReview(false); }} placeholder="例如 1000.00" /></label><label>退款原因（必选）<select value={reason} onChange={event => { setReason(event.target.value as RefundReason); setReview(false); }}>{eligibility.reasons.map(item => <option key={item} value={item}>{reasonLabel[item]}</option>)}</select></label><label>原因说明（必填，10–500 字）<textarea value={note} maxLength={500} onChange={event => { setNote(event.target.value); setReview(false); }} placeholder="说明订单、原实收与合同依据" /></label><label className="funds-confirm"><input type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setReview(false); }} />我确认申请不等于已批准或已完成退款，实际出款须由有权主体执行并核验。</label>{review && <p className="asset-warning">请确认：{order?.number} · 原实收 {receipt?.matchedAmount} U · 本次 {amount} U · 受益主体 {eligibility.beneficiaryRef} · 目标 {eligibility.targetRef} · 依据 {eligibility.basisRef}。</p>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}<div className="c08-actions"><button type="button" onClick={submit}>{review ? '确认提交退款申请' : '核对申请'}</button><button type="button" className="issuer-secondary" onClick={() => { setAmount(''); setNote(''); setConfirmed(false); setReview(false); setFeedback(''); }}>清空</button></div></> : <p>{tenant.plan === 'Free' ? '当前套餐仅可查询适用的历史记录。' : '当前没有可申请的受权退款资格；请先核对原订单、实收事件、合法受益人及生产准入。'}</p>}</section>}
    <section className="issuer-card investor-filters"><label>搜索<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="退款编号、订单或异常引用" /></label>{view === 'refunds' && <label>审批状态<select value={approvalFilter} onChange={event => { setApprovalFilter(event.target.value as RefundRecord['approval'] | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(approvalLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}<label>日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setApprovalFilter(''); setFromDate(''); setToDate(''); setPage(1); }}>重置筛选</button></section>
    {dateError && <p className="issuer-feedback" role="alert">起始日期不能晚于结束日期。</p>}
    <section className="issuer-card investor-table-wrap"><h2>{view === 'refunds' ? '退款申请与处理' : '资金异常调查'}</h2>{view === 'refunds' ? rows.length ? <div className="funds-list">{slice(rows).map(item => <article key={item.id}><strong>{item.id}</strong><span>{orders.find(row => row.id === item.orderId)?.number || item.orderId}</span><span>{item.amount} U</span><span>{approvalLabel[item.approval]}</span><span>{executionLabel[item.execution]}</span><a href={link(`${base}/refund/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{(data.refunds || []).length ? '没有符合当前筛选条件的退款记录。' : '暂无退款申请；提交申请不会产生真实退款。'}</p> : issueRows.length ? <div className="funds-list">{slice(issueRows).map(item => <article key={item.id}><strong>{item.id}</strong><span>{item.title}</span><span>{item.amount} U</span><span>{item.orderId || '待关联'}</span><span>{when(item.updatedAt)}</span><a href={link(`${base}/issue/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{issues.length ? '没有符合当前筛选条件的异常。' : '当前没有已记录的资金异常；真实来源未同步时不能据此认定无风险。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {total} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    <section className="issuer-card investor-panel"><h2>发行与法律依据</h2><p>退款受益主体与原付款来源分别核对；已形成有效法定持有人权益的退出由收益与分配承接。</p><div className="c08-actions"><a href={link('/issuer/receipts', query)}>查看原收款</a><a href={link('/issuer/exits', query)}>查看到期与退出</a>{portfolio.offerings[0] && <a href={link(`/issuer/offerings/${portfolio.offerings[0].id}`, query)}>查看发行方案</a>}</div></section>
  </section>;
}
