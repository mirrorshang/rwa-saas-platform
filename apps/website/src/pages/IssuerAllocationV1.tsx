import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { allocationCandidateOrders, allocationReadiness, legalRightsForTokens, readAllocationData, readAllocationIssues, reconciliationState, restrictionTokenQuantity, submitRegistrationCorrection, submitRegistrationMaterials, submitRestrictionRequest, updateRegistrationReview, updateRestrictionReview, type AllocationIssue, type AllocationIssueCategory, type AllocationRecord, type AllocationState, type HolderRecord, type ReconciliationState, type RegistrationState, type RestrictionRequest } from '../issuerAllocationV1';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { orderBusinessDate, readOrders, type PaymentFact } from '../issuerOrdersV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';
import { ensureSandboxFunds, readFundsData, receiptStatusText } from '../issuerFundsV1';
import { latest, readPortfolio, type InstrumentRecord } from '../issuerPortfolioV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerAllocationV1.scss';

type View = 'allocations' | 'holders' | 'issues';
type Props = { tenant: DemoTenant; query: string; detailKind?: 'candidate' | 'allocation' | 'holder' | 'issue'; detailId?: string };
const base = '/issuer/allocation-holders';
const route = (path: string, query: string) => `${path}?${query}`;
const when = (value?: number) => value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '待核对';
const allocationLabel = { candidate: '待核条件', checking: '核对中', 'awaiting-authority': '待有权处理', confirmed: '已确认', blocked: '受阻', unknown: '无法确认' };
const registrationLabel = { none: '未提交', submitted: '已提交待回执', verifying: '回执待核', effective: '已有效', difference: '差异／更正中', unknown: '无法确认' };
const reconciliationLabel = { consistent: '一致', 'pending-delivery': 'Token 待交付', difference: '存在差异', unknown: '无法确认', 'not-comparable': '待核对' };
const issueCategoryLabel: Record<AllocationIssueCategory, string> = { funds: '资金', capacity: '配售容量', registration: '法定登记', token: 'Token', identity: '主体关联', restriction: '法律限制' };
const issueStateLabel: Record<AllocationIssue['state'], string> = { open: '待处理', checking: '核对中', unknown: '无法确认' };
const paymentFilterLabel: Record<PaymentFact, string> = { none: '未发起', awaiting: '待付款', pending: '待确认', 'final-matched': '实收已确认', difference: '差异／异常', 'refund-pending': '退款处理中', refunded: '已退款', unknown: '无法确认' };
const reviewLabel = { submitted: '已提交待核', checking: '核对中', 'needs-info': '需补充资料', rejected: '已拒绝', unknown: '无法确认' };

function AllocationDetail({ tenant, query, kind, id }: Props & { kind: 'candidate' | 'allocation'; id: string }) {
  const data = readAllocationData(tenant);
  const orders = readOrders(tenant) || [];
  const portfolio = readPortfolio(tenant);
  const investors = readInvestorRelations(tenant) || [];
  const allocation = kind === 'allocation' ? data?.allocations.find(item => item.id === id) : undefined;
  const order = orders.find(item => item.id === (allocation?.orderId || id));
  if (!order || (kind === 'allocation' && !allocation)) return <section className="asset-page issuer-investors"><h1>记录不存在或无权访问</h1><a href={route(base, query)}>返回配售与持有人</a></section>;
  const investor = investors.find(item => item.id === order.investorId);
  const instrument = portfolio.instruments.find(item => item.id === (allocation?.instrumentId || portfolio.offerings.find(item => item.id === order.offeringId)?.instrumentId));
  const rights = instrument && legalRightsForTokens(instrument, order.instrumentVersion, order.quantity);
  const readiness = allocationReadiness(order, investor);
  const receipt = readFundsData(tenant)?.receipts.find(item => item.orderId === order.id);
  const asset = portfolio.assets.find(item => item.id === order.assetId);
  const offering = portfolio.offerings.find(item => item.id === order.offeringId);
  return <section className="asset-page issuer-investors issuer-allocation"><nav className="issuer-crumb"><a href={route(base, query)}>配售与持有人</a> / {allocation?.id || order.number}</nav><header className="asset-page-head"><h1>{allocation ? '配售记录' : '配售候选'} · {allocation?.id || order.number}</h1><p>候选核对不等于已确认配售；法律登记与 Token 交付分别以各自权威结果为准。</p></header><div className="investor-fixture" role="status">内部 Sandbox 情景记录；配售决定、资金及交付状态均非真实服务结果。</div>
    <section className="issuer-card investor-panel"><h2>订单与权益来源</h2><dl className="investor-facts"><div><dt>订单</dt><dd><a href={route(`/issuer/orders/${order.id}`, query)}>{order.number}</a></dd></div><div><dt>投资者</dt><dd>{investor?.state === 'unavailable' ? '授权资料不可用' : investor?.displayName || order.investorRef} · {order.investorRef}</dd></div><div><dt>资产</dt><dd>{asset ? latest(asset).fields.name : order.assetId}</dd></div><div><dt>发行方案</dt><dd>{offering ? latest(offering).fields.name : order.offeringNumber} · V{order.offeringVersion}</dd></div><div><dt>权益结构</dt><dd>{instrument ? latest(instrument).fields.name : '待核对'} · V{order.instrumentVersion}</dd></div><div><dt>申请数量</dt><dd>{order.quantity} Token</dd></div><div><dt>对应法律权益</dt><dd>{rights ? `${rights.quantity} ${rights.unit}（每 Token ${rights.perToken} ${rights.unit}）` : '权益版本或精确映射待核对'}</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>配售前置核对</h2><p>{allocation ? allocationLabel[allocation.state] : allocationLabel[readiness.state]}</p><ul className="issuer-allocation-checks">{allocation?.state === 'confirmed' ? <li>内部情景配售决定已形成；真实有权结果仍须由相应服务核验。</li> : readiness.reasons.length ? readiness.reasons.map(reason => <li key={reason}>{reason}</li>) : <li>基础条件已核对，仍须等待有权配售结果。</li>}</ul><div className="c08-actions"><a href={route(`/issuer/orders/${order.id}`, query)}>查看订单</a><a href={route('/issuer/receipts', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看资金匹配</a></div></section>
    <section className="issuer-card investor-panel"><h2>资金来源快照</h2><dl className="investor-facts"><div><dt>订单付款状态</dt><dd>{paymentFilterLabel[order.payment]}</dd></div><div><dt>到账事件引用</dt><dd>{receipt?.eventRef || '待核对'}</dd></div><div><dt>最终性与匹配</dt><dd>{receipt ? receiptStatusText(receipt.finality, receipt.match) : '待核对'}</dd></div><div><dt>内部已匹配金额</dt><dd>{receipt?.finality === 'final' && receipt.match === 'matched' ? `${receipt.matchedAmount} U` : '待核对'}</dd></div></dl><p>资金、配售决定与法定登记分别核对；到账观察不自动形成配售资格。</p>{receipt && <a href={route(`/issuer/receipts/receipt/${receipt.id}`, query)}>查看原到账事件</a>}</section>
    <section className="issuer-card investor-panel"><h2>有权决定、登记与交付</h2><dl className="investor-facts"><div><dt>配售决定</dt><dd>{allocation?.state === 'confirmed' && allocation.decisionRef && allocation.authorityRef ? `${allocation.decisionRef} · ${when(allocation.decisionAt)}` : '尚无已核验的有权配售决定'}</dd></div><div><dt>决定依据</dt><dd>{allocation?.authorityRef || '待有权主体确认'}</dd></div><div><dt>法定登记</dt><dd>{order.registration === 'effective' ? '已有效，查看权威登记记录' : '待有权登记主体核对'}</dd></div><div><dt>Token 交付</dt><dd>{order.delivery === 'confirmed' ? '已确认，查看 Token 记录' : '待核对'}</dd></div></dl><div className="c08-actions"><a href={route(base, `${query}&view=holders&orderId=${encodeURIComponent(order.id)}`)}>查看登记</a><a href={route('/issuer/token-operations', `${query}&orderId=${encodeURIComponent(order.id)}`)}>查看 Token 交付</a></div></section>
    <section className="issuer-card investor-panel"><h2>事件与异常</h2><ol className="investor-timeline">{[...(allocation?.events || order.events)].reverse().map((event, index) => <li key={`${event.at}-${index}`}>{when(event.at)} · {event.label} · {event.source}</li>)}</ol></section>
  </section>;
}

function RegistrationPanel({ tenant, holder, allocation, instrument }: { tenant: DemoTenant; holder: HolderRecord; allocation?: AllocationRecord; instrument?: InstrumentRecord }) {
  const [open, setOpen] = useState(false);
  const [correction, setCorrection] = useState(false);
  const [proposed, setProposed] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [revision, setRevision] = useState(0);
  const requests = (readAllocationData(tenant)?.registrationRequests || []).filter(item => item.holderId === holder.id);
  const policy = holder.registrationPolicy;
  const expected = allocation && instrument && legalRightsForTokens(instrument, holder.instrumentVersion, allocation.tokenQuantity);
  const canSubmit = tenant.plan === 'Standard' && allocation?.state === 'confirmed' && Boolean(expected) &&
    (holder.registrationMode === 'delegated' || holder.registrationMode === 'self') && policy?.submissionAllowed &&
    policy.responsibleRef === holder.authorityRef && holder.registration !== 'effective' && holder.registration !== 'unknown';
  const canCorrect = tenant.plan === 'Standard' && allocation?.state === 'confirmed' && Boolean(expected) &&
    holder.registration === 'effective' && Boolean(holder.registrationRef) &&
    (holder.registrationMode === 'delegated' || holder.registrationMode === 'self') && policy?.submissionAllowed &&
    policy.responsibleRef === holder.authorityRef;
  const start = (isCorrection: boolean) => { setCorrection(isCorrection); setProposed(holder.rightsQuantity || '');
    setEvidenceRef(policy?.evidenceVersions.find(item => item.status === 'passed')?.ref || '');
    setNote(''); setConfirmed(false); setReview(false); setFeedback(''); setOpen(true); };
  const submit = () => {
    if (!evidenceRef || !confirmed || note.length > 500 || (correction && (note.trim().length < 10 || !proposed)) ||
      (!correction && holder.registration === 'difference' && !note.trim())) {
      setFeedback('请选择已通过核验的材料版本，填写适用说明并确认提交边界。'); return;
    }
    if (!review) { setReview(true); setFeedback(''); return; }
    try {
      const result = correction ? submitRegistrationCorrection(tenant, holder.id, instrument, { rightsQuantity: proposed, evidenceRef, note, confirmed }) :
        submitRegistrationMaterials(tenant, holder.id, instrument, { evidenceRef, note, confirmed });
      setOpen(false); setReview(false); setRevision(value => value + 1);
      setFeedback(`登记事项 ${result.id} 已保存，等待有权主体核对；原法定登记状态与证据未改变。`);
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '登记材料未保存。'); }
  };
  return <section className="issuer-card investor-panel issuer-registration-panel" data-revision={revision}>
    <h2>登记事项</h2><p>配售决定与 Token 交付不会自动形成法定登记。登记责任方与材料版本按已确认的法律安排核对。</p>
    <dl className="investor-facts"><div><dt>登记模式</dt><dd>{holder.registrationMode === 'self' ? '发行企业依法自管' : holder.registrationMode === 'delegated' ? '依法委托登记' : holder.registrationMode === 'statutory' ? '法定强制登记机构' : '待确定'}</dd></div><div><dt>有权登记责任方</dt><dd>{policy?.responsibleRef || holder.authorityRef || '待确认'}</dd></div><div><dt>授权依据版本</dt><dd>{policy?.authorityBasisRef || '待确认'}</dd></div><div><dt>固定配售决定</dt><dd>{allocation?.decisionRef || '待确认'}</dd></div><div><dt>拟登记法律权益</dt><dd>{expected ? `${expected.quantity} ${expected.unit}` : '待精确映射'}</dd></div></dl>
    {requests.length > 0 && <details><summary>查看登记事项历史（{requests.length}）</summary><ol className="investor-timeline">{requests.map(item => <li key={item.id}>{when(item.createdAt)} · {item.kind === 'correction' ? '登记更正' : '登记材料'} · {item.id} · {item.evidenceRef} · {reviewLabel[item.state]}{item.originalRegistrationRef && ` · 原登记 ${item.originalRegistrationRef}`}{tenant.plan === 'Standard' && item.state !== 'rejected' && <label className="issuer-restriction-review">内部核对进度<select value={item.state} onChange={event => { try { updateRegistrationReview(tenant, item.id, event.target.value as 'checking' | 'needs-info' | 'rejected' | 'unknown'); setRevision(value => value + 1); setFeedback('登记事项进度已更新；法定结果仍待有权主体确认。'); } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '登记事项进度未更新。'); } }}><option value="submitted">已提交</option><option value="checking">回执待核</option><option value="needs-info">需补充资料</option><option value="rejected">已拒绝</option><option value="unknown">无法确认</option></select></label>}</li>)}</ol></details>}
    {canSubmit || canCorrect ? <div className="c08-actions">{canSubmit && <button type="button" className="issuer-secondary" onClick={() => start(false)}>{holder.registrationMode === 'delegated' ? '提交登记材料' : '提交权威结果记录供核对'}</button>}{canCorrect && <button type="button" className="issuer-secondary" onClick={() => start(true)}>申请登记更正复核</button>}</div> : <p className="asset-warning">{holder.registration === 'effective' ? '登记结果已有效；缺少受权更正依据时保持只读。' : holder.registration === 'unknown' ? '原登记结果无法确认，请先查询原请求与回执。' : '请先确认合法登记责任方、有效配售决定与材料版本。'}</p>}
    {feedback && !open && <p className="issuer-feedback" role="status">{feedback}</p>}
    {open && <aside className="issuer-restriction-drawer" role="dialog" aria-modal="true" aria-label={correction ? '申请登记更正复核' : '提交登记材料'} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <div className="issuer-restriction-drawer-card"><h3>{correction ? '申请登记更正复核' : holder.registrationMode === 'delegated' ? '提交登记材料' : '提交权威结果记录供核对'}</h3>
        <p>{holder.displayName} · {holder.legalSubjectRef} · {allocation?.decisionRef} · V{holder.instrumentVersion}</p>
        <p>{correction ? `原登记 ${holder.registrationRef}：${holder.rightsQuantity} ${holder.rightsUnit}` : `拟登记：${expected?.quantity} ${expected?.unit}`}；责任方：{policy?.responsibleRef}。提交后仅待有权核对。</p>
        {correction && <label>拟更正法律权益量（{holder.rightsUnit}，必填）<input value={proposed} onChange={event => { setProposed(event.target.value); setReview(false); }} inputMode="decimal" placeholder="例如 0.25" /></label>}
        <label>登记材料固定版本（必选）<select autoFocus value={evidenceRef} onChange={event => { setEvidenceRef(event.target.value); setReview(false); }}><option value="">请选择已核验版本</option>{(policy?.evidenceVersions || []).map(item => <option key={item.ref} value={item.ref} disabled={item.status !== 'passed'}>{item.label} · {item.ref}{item.status !== 'passed' ? '（不可引用）' : ''}</option>)}</select></label>
        <label>{correction ? '更正原因（必填，10–500 字）' : '变更说明（选填，差异时必填）'}<textarea value={note} maxLength={500} onChange={event => { setNote(event.target.value); setReview(false); }} placeholder="说明需受权复核的原因" /></label>
        <label className="issuer-restriction-confirm"><input type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setReview(false); }} />我确认已核对有权主体、材料版本及权益单位，提交资料不等于自动赋予法定权益。</label>
        {review && <div className="asset-warning">请确认向 {policy?.responsibleRef} 提交 {evidenceRef}，涉及 {correction ? proposed : expected?.quantity} {expected?.unit}；原登记 {holder.registrationRef || '待核'} 不会被覆盖。</div>}
        {feedback && <p className="issuer-feedback" role="alert">{feedback}</p>}
        <div className="c08-actions"><button type="button" onClick={submit}>{review ? correction ? '确认提交更正申请' : '确认提交材料' : correction ? '核对更正申请' : '核对材料'}</button><button type="button" className="issuer-secondary" onClick={() => { setOpen(false); setFeedback(''); }}>取消</button></div>
      </div>
    </aside>}
  </section>;
}

function RestrictionPanel({ tenant, holder, instrument }: { tenant: DemoTenant; holder: HolderRecord; instrument?: InstrumentRecord }) {
  const [kind, setKind] = useState<RestrictionRequest['kind'] | null>(null);
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<RestrictionRequest['reasonCategory']>('contract');
  const [reason, setReason] = useState('');
  const [basisRef, setBasisRef] = useState('');
  const [originalRef, setOriginalRef] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [revision, setRevision] = useState(0);
  const requests = (readAllocationData(tenant)?.restrictionRequests || []).filter(item => item.holderId === holder.id);
  const active = (holder.restrictionFacts || []).filter(item => item.state === 'effective');
  const allowed = tenant.plan === 'Standard' && Boolean(instrument) && holder.registration === 'effective' && holder.restrictionPolicy?.allowed &&
    holder.restrictionPolicy.requesterRef && holder.restrictionPolicy.authorityBasisRef && holder.authorityRef;
  const open = (next: RestrictionRequest['kind']) => {
    const original = next === 'release' ? active[0] : undefined;
    setKind(next); setQuantity(original?.rightsQuantity || (instrument && legalRightsForTokens(instrument, holder.instrumentVersion, '1')?.quantity) || '');
    setOriginalRef(original?.ref || ''); setBasisRef(original?.basisRef || holder.restrictionPolicy?.authorityBasisRef || '');
    setCategory('contract'); setReason(''); setConfirmed(false); setReview(false); setFeedback('');
  };
  const tokens = restrictionTokenQuantity(holder, instrument, quantity);
  const submit = () => {
    if (!kind) return;
    if (!tokens || reason.trim().length < 10 || reason.trim().length > 500 || !basisRef.trim() || !confirmed) {
      setFeedback('请核对权益数量、依据、10–500 字原因及申请确认。'); return;
    }
    if (!review) { setReview(true); setFeedback(''); return; }
    try {
      const request = submitRestrictionRequest(tenant, holder.id, instrument, { kind, rightsQuantity: quantity, reasonCategory: category,
        reason, basisRef, originalRestrictionRef: originalRef, confirmed });
      setKind(null); setReview(false); setRevision(value => value + 1);
      setFeedback(`内部流程申请 ${request.id} 已保存，等待受权复核；法定登记与链上限制状态未改变。`);
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '申请未保存，请核对原事项。'); }
  };
  return <div className="issuer-restriction-panel" data-revision={revision}>
    <h3>法律／管理限制</h3>
    <p>法定限制、业务锁仓和链上限制分别核对；申请只进入受权复核。</p>
    {active.length ? <ul>{active.map(item => <li key={item.ref}>{item.ref} · {item.rightsQuantity} {holder.rightsUnit} · 有效限制（内部情景）</li>)}</ul> : <p>当前无已核对的有效限制记录。</p>}
    {requests.length > 0 && <details><summary>查看申请历史（{requests.length}）</summary><ol className="investor-timeline">{requests.map(item => <li key={item.id}>{when(item.createdAt)} · {item.kind === 'restrict' ? '限制' : '解除限制'}复核 · {item.rightsQuantity} {item.rightsUnit} / {item.tokenQuantity} Token · {reviewLabel[item.state]} · {item.id}{tenant.plan === 'Standard' && item.state !== 'rejected' && <label className="issuer-restriction-review">内部复核进度<select value={item.state} onChange={event => { try { updateRestrictionReview(tenant, item.id, event.target.value as 'checking' | 'needs-info' | 'rejected' | 'unknown'); setRevision(value => value + 1); setFeedback('内部复核进度已更新；法定与链上状态未改变。'); } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '复核进度未更新。'); } }}><option value="submitted">已提交</option><option value="checking">核对中</option><option value="needs-info">需补充资料</option><option value="rejected">已拒绝</option><option value="unknown">无法确认</option></select></label>}</li>)}</ol></details>}
    {!allowed ? <p className="asset-warning">请先确认本权益结构的合法限制责任方、受权依据及有效登记；当前仅可查看历史。</p> : <div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => open('restrict')}>申请限制复核</button>{active.length > 0 && <button type="button" className="issuer-secondary" onClick={() => open('release')}>申请解除限制复核</button>}</div>}
    {feedback && !kind && <p className="issuer-feedback" role="status">{feedback}</p>}
    {kind && <aside className="issuer-restriction-drawer" role="dialog" aria-modal="true" aria-label={kind === 'restrict' ? '申请限制复核' : '申请解除限制复核'} onKeyDown={event => { if (event.key === 'Escape') setKind(null); }}>
      <div className="issuer-restriction-drawer-card"><h3>{kind === 'restrict' ? '申请限制复核' : '申请解除限制复核'}</h3>
        <p>{holder.displayName} · {holder.id} · V{holder.instrumentVersion} · {holder.offeringId}</p>
        <p>受权请求主体：{holder.restrictionPolicy?.requesterRef}；责任依据：{holder.restrictionPolicy?.authorityBasisRef}</p>
        <label>影响法律权益量（{holder.rightsUnit}，必填）<input autoFocus value={quantity} onChange={event => { setQuantity(event.target.value); setReview(false); }} placeholder="例如 0.25" inputMode="decimal" /></label>
        <p>精确映射：{tokens ? `${tokens} Token` : '数量不可精确拆分或超出有效登记'}。当前登记 {holder.rightsQuantity} {holder.rightsUnit}。</p>
        {kind === 'release' && <label>原有效限制编号（必填）<select value={originalRef} onChange={event => { setOriginalRef(event.target.value); setReview(false); }}>{active.map(item => <option key={item.ref} value={item.ref}>{item.ref}</option>)}</select></label>}
        <label>原因类别（必填）<select value={category} onChange={event => { setCategory(event.target.value as RestrictionRequest['reasonCategory']); setReview(false); }}><option value="legal">法定／司法要求</option><option value="contract">合同约定</option><option value="dispute">争议核查</option><option value="other">其他适用原因</option></select></label>
        <label>原因说明（必填，10–500 字）<textarea value={reason} maxLength={500} onChange={event => { setReason(event.target.value); setReview(false); }} placeholder="说明限制范围与依据，勿填写完整证件信息" /></label>
        <label>法律／合同依据版本（必填）<input value={basisRef} maxLength={120} onChange={event => { setBasisRef(event.target.value); setReview(false); }} placeholder="文件版本或有权决定引用" /></label>
        <label className="issuer-restriction-confirm"><input type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setReview(false); }} />我确认申请仅进入有权复核，不会立即改变法定登记或链上状态。</label>
        {review && <div className="asset-warning">请确认：{kind === 'restrict' ? '限制' : '解除限制'} {quantity} {holder.rightsUnit}（{tokens} Token），依据 {basisRef}，提交后待有权主体复核。</div>}
        {feedback && <p className="issuer-feedback" role="alert">{feedback}</p>}
        <div className="c08-actions"><button type="button" onClick={submit}>{review ? '确认提交复核申请' : '核对申请'}</button><button type="button" className="issuer-secondary" onClick={() => { setKind(null); setReview(false); setFeedback(''); }}>取消</button></div>
      </div>
    </aside>}
  </div>;
}

function HolderDetail({ tenant, query, id }: Props & { id: string }) {
  const holder = readAllocationData(tenant)?.holders.find(item => item.id === id);
  const portfolio = readPortfolio(tenant);
  if (!holder) return <section className="asset-page issuer-investors"><h1>记录不存在或无权访问</h1><a href={route(base, query)}>返回配售与持有人</a></section>;
  const instrument = portfolio.instruments.find(item => item.id === holder.instrumentId);
  const asset = portfolio.assets.find(item => item.id === holder.assetId);
  const allocation = readAllocationData(tenant)?.allocations.find(item => item.id === holder.allocationId);
  const compare = reconciliationState(holder, instrument);
  return <section className="asset-page issuer-investors issuer-allocation"><nav className="issuer-crumb"><a href={route(base, `${query}&view=holders`)}>持有人登记</a> / {holder.id}</nav><header className="asset-page-head"><h1>{holder.displayName} · {holder.id}</h1><p>法定登记：{registrationLabel[holder.registration]} · Token 对账：{reconciliationLabel[compare]}</p></header><div className="investor-fixture" role="status">内部 Sandbox 情景记录；法定登记与 Token 状态均非真实服务结果。</div>
    {compare === 'difference' && <div className="asset-warning">法律权益量与同一时点的 Token 映射存在差异；请核对有权登记与链上记录。</div>}
    <section className="issuer-card investor-panel"><h2>法定权益登记</h2><dl className="investor-facts"><div><dt>法律主体引用</dt><dd>{holder.legalSubjectRef}</dd></div><div><dt>资产</dt><dd>{asset ? latest(asset).fields.name : holder.assetId}</dd></div><div><dt>权益结构版本</dt><dd>V{holder.instrumentVersion}</dd></div><div><dt>登记状态</dt><dd>{registrationLabel[holder.registration]}</dd></div><div><dt>权威登记引用</dt><dd>{holder.registrationRef || '待核对'}</dd></div><div><dt>有权依据</dt><dd>{holder.authorityRef || '待确定'}</dd></div><div><dt>法定权益数量</dt><dd>{holder.registration === 'effective' && holder.rightsQuantity && holder.rightsUnit ? `${holder.rightsQuantity} ${holder.rightsUnit}` : '待确认'}</dd></div><div><dt>实际生效时间</dt><dd>{when(holder.effectiveAt)}</dd></div></dl></section>
    <RegistrationPanel tenant={tenant} holder={holder} allocation={allocation} instrument={instrument} /><section className="issuer-card investor-panel"><h2>Token 与交付</h2><dl className="investor-facts"><div><dt>已确认 Token 份数</dt><dd>{holder.tokenConfirmedAt ? holder.tokenQuantity || '待核对' : '待核对'}</dd></div><div><dt>交付核对时间</dt><dd>{when(holder.tokenConfirmedAt)}</dd></div><div><dt>映射核对</dt><dd>{reconciliationLabel[compare]}</dd></div></dl><a href={route('/issuer/token-operations', `${query}&holderId=${encodeURIComponent(holder.id)}`)}>查看 Token 记录</a></section>
    <section className="issuer-card investor-panel"><h2>来源与限制</h2><p>登记主体、付款钱包、Token 接收钱包和投资者账户分别核对，不从任一地址推断合法持有人。</p><div className="c08-actions">{allocation && <a href={route(`${base}/allocation/${allocation.id}`, query)}>查看配售</a>}<a href={route('/issuer/lockups', `${query}&holderId=${encodeURIComponent(holder.id)}`)}>查看锁仓记录</a></div><RestrictionPanel tenant={tenant} holder={holder} instrument={instrument} /><details><summary>查看登记历史</summary><ol className="investor-timeline">{holder.events.map((event, index) => <li key={`${event.at}-${index}`}>{when(event.at)} · {event.label} · {event.source}</li>)}</ol></details></section>
  </section>;
}

function IssueDetail({ tenant, query, id }: Props & { id: string }) {
  const issue = readAllocationIssues(tenant)?.find(item => item.id === id);
  if (!issue) return <section className="asset-page issuer-investors"><h1>事项不存在或无权访问</h1><a href={route(base, `${query}&view=issues`)}>返回差异与限制</a></section>;
  const responsibilityPath = issue.category === 'funds' ? '/issuer/receipts' : issue.category === 'token' ? '/issuer/token-operations' : base;
  return <section className="asset-page issuer-investors issuer-allocation"><nav className="issuer-crumb"><a href={route(base, `${query}&view=issues`)}>差异与限制</a> / {issue.id}</nav><header className="asset-page-head"><h1>{issue.title}</h1><p>{issue.id} · {issueCategoryLabel[issue.category]} · {issueStateLabel[issue.state]}</p></header>
    <div className="investor-fixture" role="status">内部 Sandbox 情景事项；核对页面不会改写原订单、资金、法定登记或 Token 事实。</div>
    <section className="issuer-card investor-panel"><h2>事项与来源</h2><dl className="investor-facts"><div><dt>首次发现</dt><dd>{when(issue.discoveredAt)}</dd></div><div><dt>最近更新</dt><dd>{when(issue.updatedAt)}</dd></div><div><dt>订单来源</dt><dd>{issue.sourceA}</dd></div><div><dt>责任来源</dt><dd>{issue.sourceB}</dd></div><div><dt>涉及 Token</dt><dd>{issue.tokenQuantity || '待核对'}</dd></div><div><dt>法律权益</dt><dd>{issue.legalQuantity || '待核对'}</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>差异与下一步</h2><p>{issue.reason}</p><p>责任方：{issue.responsible}</p><p>下一步：{issue.nextStep}</p><p className="asset-warning">请勿凭某一侧结果直接覆盖另一侧。Unknown 时先查询原操作，不能重复发起登记、退款或 Token 操作。</p><div className="c08-actions">{issue.orderId && <a href={route(`/issuer/orders/${issue.orderId}`, query)}>查看原订单</a>}{issue.holderId && <a href={route(`${base}/holder/${issue.holderId}`, query)}>查看登记记录</a>}<a href={route(responsibilityPath, `${query}&orderId=${encodeURIComponent(issue.orderId || '')}`)}>查看责任模块</a></div></section>
  </section>;
}

export function IssuerAllocationV1({ tenant, query, detailKind, detailId }: Props) {
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
  const [view, setView] = useState<View>(() => { const value = new URLSearchParams(location.search).get('view'); return value === 'holders' || value === 'issues' ? value : 'allocations'; });
  const [assetId, setAssetId] = useState(new URLSearchParams(location.search).get('assetId') || '');
  const [offeringId, setOfferingId] = useState(new URLSearchParams(location.search).get('offeringId') || '');
  const [orderId] = useState(new URLSearchParams(location.search).get('orderId') || '');
  const [investorRef] = useState(new URLSearchParams(location.search).get('investorRef') || '');
  const [search, setSearch] = useState('');
  const [allocationState, setAllocationState] = useState<AllocationState | ''>('');
  const [fundState, setFundState] = useState<PaymentFact | ''>('');
  const [holderKind, setHolderKind] = useState<'' | 'person' | 'organization'>('');
  const [registrationState, setRegistrationState] = useState<RegistrationState | ''>('');
  const [tokenCompare, setTokenCompare] = useState<ReconciliationState | ''>('');
  const [issueCategory, setIssueCategory] = useState<AllocationIssueCategory | ''>('');
  const [issueState, setIssueState] = useState<AllocationIssue['state'] | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const data = readAllocationData(tenant);
  const portfolio = readPortfolio(tenant);
  const investors = readInvestorRelations(tenant) || [];
  const linkedInvestor = investorRef ? investors.find(item => item.ref === investorRef) : undefined;
  const candidateOrders = allocationCandidateOrders(tenant);
  if (detailId && tenant.plan === 'Standard' && (scenarioState === 'idle' || scenarioState === 'preparing')) return <section className="asset-page issuer-investors"><h1>配售与持有人</h1><p>正在准备当前企业的内部流程数据…</p></section>;
  if (detailKind === 'candidate' && detailId) return <AllocationDetail tenant={tenant} query={query} kind="candidate" id={detailId} />;
  if (detailKind === 'allocation' && detailId) return <AllocationDetail tenant={tenant} query={query} kind="allocation" id={detailId} />;
  if (detailKind === 'holder' && detailId) return <HolderDetail tenant={tenant} query={query} id={detailId} />;
  if (detailKind === 'issue' && detailId) return <IssueDetail tenant={tenant} query={query} id={detailId} />;
  if (!data) return <section className="asset-page issuer-investors"><h1>配售与持有人</h1><p>当前核对结果不可确认。请刷新页面后重试。</p></section>;
  const currentInstrument = assetId ? portfolio.instruments.find(item => item.assetId === assetId) : undefined;
  const capacity = currentInstrument && data.capacities.find(item => item.instrumentId === currentInstrument.id && item.instrumentVersion === latest(currentInstrument).number);
  const rows = [...data.allocations.map(item => ({ type: 'allocation' as const, id: item.id, orderId: item.orderId, assetId: item.assetId, offeringId: item.offeringId, updatedAt: item.lastCheckedAt || 0, state: item.state })), ...candidateOrders.map(item => ({ type: 'candidate' as const, id: item.id, orderId: item.id, assetId: item.assetId, offeringId: item.offeringId, updatedAt: item.createdAt, state: allocationReadiness(item, investors.find(investor => investor.id === item.investorId)).state }))];
  const orders = readOrders(tenant) || [];
  const dateError = fromDate && toDate && fromDate > toDate ? '起始日期不能晚于结束日期。' : '';
  const allocationRows = rows.filter(item => {
    const order = orders.find(record => record.id === item.orderId);
    const date = orderBusinessDate(item.updatedAt || order?.createdAt || 0);
    return !dateError && (!assetId || item.assetId === assetId) && (!offeringId || item.offeringId === offeringId) &&
      (!orderId || item.orderId === orderId) && (!investorRef || Boolean(linkedInvestor && order?.investorId === linkedInvestor.id)) &&
      (!search || `${item.id} ${order?.number || ''} ${order?.investorRef || ''}`.toLowerCase().includes(search.trim().toLowerCase())) &&
      (!allocationState || item.state === allocationState) && (!fundState || order?.payment === fundState) &&
      (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  }).sort((a, b) => (a.state === 'confirmed' ? 1 : 0) - (b.state === 'confirmed' ? 1 : 0) || b.updatedAt - a.updatedAt);
  const holderRows = data.holders.filter(item => {
    const instrument = portfolio.instruments.find(record => record.id === item.instrumentId);
    const date = orderBusinessDate(item.updatedAt);
    return !dateError && (!assetId || item.assetId === assetId) && (!offeringId || item.offeringId === offeringId) &&
      (!investorRef || Boolean(linkedInvestor && item.investorId === linkedInvestor.id)) &&
      (!search || `${item.id} ${item.legalSubjectRef}`.toLowerCase().includes(search.trim().toLowerCase())) &&
      (!holderKind || item.kind === holderKind) && (!registrationState || item.registration === registrationState) &&
      (!tokenCompare || reconciliationState(item, instrument) === tokenCompare) &&
      (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  }).sort((a, b) => b.updatedAt - a.updatedAt);
  const allIssues = readAllocationIssues(tenant) || [];
  const issueRows = allIssues.filter(item => {
    const businessDate = orderBusinessDate(item.updatedAt);
    const linked = orders.find(order => order.id === item.orderId);
    return !dateError && (!assetId || item.assetId === assetId) && (!offeringId || item.offeringId === offeringId) &&
      (!orderId || item.orderId === orderId) && (!investorRef || Boolean(linkedInvestor && linked?.investorId === linkedInvestor.id)) &&
      (!search || `${item.id} ${item.sourceA} ${item.sourceB}`.toLowerCase().includes(search.trim().toLowerCase())) &&
      (!issueCategory || item.category === issueCategory) && (!issueState || item.state === issueState) &&
      (!fromDate || businessDate >= fromDate) && (!toDate || businessDate <= toDate);
  });
  const total = view === 'allocations' ? allocationRows.length : view === 'holders' ? holderRows.length : issueRows.length;
  const pages = Math.max(1, Math.ceil(total / 20));
  const slice = <T,>(items: T[]) => items.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20);
  const reset = () => { setAssetId(''); setOfferingId(''); setSearch(''); setAllocationState(''); setFundState(''); setHolderKind(''); setRegistrationState(''); setTokenCompare(''); setIssueCategory(''); setIssueState(''); setFromDate(''); setToDate(''); setPage(1); };
  return <section className="asset-page issuer-investors issuer-allocation"><header className="asset-page-head"><nav className="issuer-crumb"><a href={route('/issuer', query)}>工作台首页</a> / 投资者与认购 / 配售与持有人</nav><h1>配售与持有人</h1><p>配售、法定登记和 Token 交付是不同业务状态。仅在权威记录齐备时才能判定法律持有关系。</p></header>
    {scenarioState === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程数据…</p>}
    {scenarioState === 'failed' && <p className="asset-warning" role="alert">内部流程数据暂不可用：{scenarioError}</p>}
    {(data.allocations.length > 0 || data.holders.length > 0) && <div className="investor-fixture" role="status">内部 Sandbox 情景记录，仅用于核对流程；不构成真实配售、法定登记或 Token 交付结果。</div>}
    {tenant.plan === 'Free' && <div className="investor-fixture">{data.allocations.length || data.holders.length ? '当前套餐保留历史记录只读查询；既有权益与存续义务不会因套餐变化而消失。' : 'Free 支持资料准备与内部预览；真实配售及持有人运营需符合 Standard 与生产准入条件。'}</div>}
    {allIssues.length > 0 && <div className="asset-warning" role="status">有 {allIssues.length} 项待核对事项。<button type="button" className="issuer-secondary" onClick={() => { setView('issues'); setPage(1); }}>查看待处理</button></div>}
    <nav className="issuer-allocation-tabs" aria-label="页面视图">{([['allocations', '配售管理'], ['holders', '持有人登记'], ['issues', '差异与限制']] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={view === key} onClick={() => { setView(key); setPage(1); }}>{label}</button>)}</nav>
    <section className="issuer-card investor-filters"><label>搜索<input value={search} maxLength={120} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="订单、配售或持有人引用号" /></label><label>资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setOfferingId(''); setPage(1); }}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>发行方案<select value={offeringId} onChange={event => { setOfferingId(event.target.value); setPage(1); }}><option value="">全部期次</option>{portfolio.offerings.filter(item => !assetId || item.assetId === assetId).map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>
    {view === 'allocations' && <section className="issuer-card investor-filters"><label>配售进度<select value={allocationState} onChange={event => { setAllocationState(event.target.value as AllocationState | ''); setPage(1); }}><option value="">全部进度</option>{Object.entries(allocationLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>资金核验<select value={fundState} onChange={event => { setFundState(event.target.value as PaymentFact | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(paymentFilterLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></section>}
    {view === 'holders' && <section className="issuer-card investor-filters"><label>主体类型<select value={holderKind} onChange={event => { setHolderKind(event.target.value as '' | 'person' | 'organization'); setPage(1); }}><option value="">全部主体</option><option value="person">自然人</option><option value="organization">机构</option></select></label><label>登记状态<select value={registrationState} onChange={event => { setRegistrationState(event.target.value as RegistrationState | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(registrationLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Token 对账<select value={tokenCompare} onChange={event => { setTokenCompare(event.target.value as ReconciliationState | ''); setPage(1); }}><option value="">全部状态</option>{Object.entries(reconciliationLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></section>}
    {view !== 'issues' && <section className="issuer-card investor-filters"><label>更新日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>更新日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label></section>}
    {view !== 'issues' && dateError && <p className="issuer-feedback" role="alert">{dateError}</p>}
    {view === 'allocations' && <><section className="issuer-card investor-panel"><h2>权益容量</h2>{currentInstrument ? <dl className="investor-facts"><div><dt>权益结构</dt><dd>{latest(currentInstrument).fields.name} · V{latest(currentInstrument).number}</dd></div><div><dt>权益结构设定总量</dt><dd>{latest(currentInstrument).fields.tokenSupply} Token</dd></div><div><dt>容量核对上限</dt><dd>{capacity?.maxTokens ? `${capacity.maxTokens} Token` : '待核对'}</dd></div><div><dt>已确认占用</dt><dd>{capacity?.confirmedOccupied ?? '待核对'}</dd></div><div><dt>有效预留</dt><dd>{capacity?.effectiveReserved ?? '待核对'}</dd></div><div><dt>所选 Offering 本期预留</dt><dd>{offeringId ? capacity?.offeringReserved?.[offeringId] ?? '待核对' : '请选择发行方案'}</dd></div><div><dt>保护数量</dt><dd>{capacity?.protectedTokens ?? '待核对'}</dd></div><div><dt>可用份数</dt><dd>{capacity?.availableTokens ?? '待核对'}</dd></div><div><dt>最近核对</dt><dd>{when(capacity?.checkedAt)}</dd></div></dl> : <p>选择资产后查看权益结构容量。没有容量权威结果时，可用份数保持待核对。</p>}</section><section className="issuer-card investor-table-wrap"><h2>配售候选与决定</h2>{allocationRows.length ? <><div className="issuer-allocation-list">{slice(allocationRows).map(item => { const order = orders.find(row => row.id === item.orderId); const investor = investors.find(row => row.id === order?.investorId); return <article key={`${item.type}-${item.id}`}><strong>{item.type === 'candidate' ? '候选' : '配售'} · {item.id}</strong><span>{order?.number || '订单待核对'}</span><span>{investor?.displayName || order?.investorRef || '投资者资料待核对'}</span><span>{order?.quantity || '待核对'} Token</span><span>{allocationLabel[item.state]}</span><a href={route(`${base}/${item.type}/${item.id}`, query)}>查看详情</a></article>; })}</div></> : <p>{dateError ? '请先调整日期范围。' : rows.length ? '没有符合当前筛选条件的配售记录。' : tenant.plan === 'Free' ? '当前套餐没有真实配售记录。' : '当前没有配售记录。符合条件的订单将按有权规则进入配售。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {total} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section></>}
    {view === 'holders' && <section className="issuer-card investor-table-wrap"><h2>法定持有人登记</h2>{holderRows.length ? <div className="issuer-allocation-list">{slice(holderRows).map(item => { const instrument = portfolio.instruments.find(row => row.id === item.instrumentId); return <article key={item.id}><strong>{item.displayName} · {item.id}</strong><span>{registrationLabel[item.registration]}</span><span>{item.registration === 'effective' ? `${item.rightsQuantity || '待核对'} ${item.rightsUnit || ''}` : '法律权益待确认'}</span><span>{reconciliationLabel[reconciliationState(item, instrument)]}</span><span>{when(item.updatedAt)}</span><a href={route(`${base}/holder/${item.id}`, query)}>查看详情</a></article>; })}</div> : <p>{dateError ? '请先调整日期范围。' : data.holders.length ? '没有符合当前筛选条件的持有人记录。' : '暂无法确认有效持有人登记。请核对有权登记者及必要回执。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {total} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>}
    {view === 'issues' && <>
      <section className="issuer-card investor-filters">
        <label>事项类别<select value={issueCategory} onChange={event => { setIssueCategory(event.target.value as AllocationIssueCategory | ''); setPage(1); }}><option value="">全部类别</option>{Object.entries(issueCategoryLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>处理进度<select value={issueState} onChange={event => { setIssueState(event.target.value as AllocationIssue['state'] | ''); setPage(1); }}><option value="">全部进度</option>{Object.entries(issueStateLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>更新日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label>
        <label>更新日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label>
      </section>
      {dateError && <p className="issuer-feedback" role="alert">{dateError}</p>}
      <section className="issuer-card investor-table-wrap"><h2>差异与限制</h2>
        {issueRows.length ? <div className="issuer-allocation-list">{slice(issueRows).map(item => <article key={item.id}>
          <strong>{item.id}</strong><span>{issueCategoryLabel[item.category]} · {item.title}</span>
          <span>{issueStateLabel[item.state]}</span><span>{item.responsible}</span>
          <span>{when(item.updatedAt)}</span><a href={route(`${base}/issue/${item.id}`, query)}>查看详情</a>
        </article>)}</div> : <p>{dateError ? '请先调整日期范围。' : allIssues.length ? '没有符合筛选条件的待核事项。' : '当前没有可核对的差异事项；未取得权威来源时，不能据此认定全部状态一致。'}</p>}
        <div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {total} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div>
      </section>
    </>}
  </section>;
}
