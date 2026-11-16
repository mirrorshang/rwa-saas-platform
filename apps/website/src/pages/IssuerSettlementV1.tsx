import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { readFundsData } from '../issuerFundsV1';
import { orderBusinessDate } from '../issuerOrdersV1';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import { ensureSandboxSettlement, readSettlementData, releaseSnapshotIssues, submitTransferRequest, transferCommitted, transferRoom, updateTransferApproval,
  type ReleaseSnapshot, type TransferRequest } from '../issuerSettlementV1';
import { useIssuerFundsScenario } from './useIssuerFundsScenario';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';

type Props = { tenant: DemoTenant; query: string; detailId?: string };
const base = '/issuer/settlement';
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at?: number) => at ? new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）' : '待核对';
const releaseLabel: Record<ReleaseSnapshot['state'], string> = { restricted: '受限', 'evidence-pending': '证据待核', eligible: '可申请', blocked: '已阻断', unknown: '无法确认' };
const approvalLabel: Record<TransferRequest['approval'], string> = { requested: '申请待核', 'needs-info': '需补充资料', 'approved-scoped': '内部授权范围已记录', rejected: '未通过', revoked: '已撤销', expired: '已过期', unknown: '无法确认' };
const executionLabel: Record<TransferRequest['execution'], string> = { 'not-submitted': '未执行', submitted: '已提交待核', 'pending-finality': '最终性待核', unknown: '无法确认', partial: '部分完成待核', settled: '已结算', failed: '执行失败', returned: '已退回或争议' };

function Detail({ tenant, query, detailId }: Props) {
  const [result, setResult] = useState<TransferRequest['approval']>('needs-info');
  const [evidence, setEvidence] = useState('');
  const [feedback, setFeedback] = useState('');
  const [, rerender] = useState(0);
  const data = readSettlementData(tenant);
  const item = data?.transfers.find(row => row.id === detailId);
  const snapshot = data?.snapshots.find(row => row.id === item?.snapshotId);
  if (!item) return <section className="asset-page issuer-funds"><h1>划拨申请不存在或无权访问</h1><a href={link(base, query)}>返回募集款结算</a></section>;
  const record = () => {
    try { updateTransferApproval(tenant, item.id, result, evidence); rerender(value => value + 1); setFeedback('内部核对结果已记录；实际付款与受领仍未发生。'); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : '结果未保存。'); }
  };
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / <a href={link(base, query)}>募集款结算</a> / 划拨详情</nav><h1>划拨申请 {item.id}</h1><p>申请、受权、实际出款及受领到账分开核对。</p></header>
    <div className="investor-fixture">内部 Sandbox 记录；不代表真实资金划拨或生产授权。</div>
    <section className="issuer-card investor-panel"><h2>1. 释放资格</h2><dl className="investor-facts"><div><dt>资金池</dt><dd>{item.poolId}</dd></div><div><dt>资格状态</dt><dd>{snapshot ? releaseLabel[snapshot.state] : '待核'}</dd></div><div><dt>快照与有效期</dt><dd>{when(snapshot?.asOf)} / {when(snapshot?.validUntil)}</dd></div><div><dt>规则与来源</dt><dd>{snapshot?.ruleVersion || '待核'} / {snapshot?.sourceRef || '待核'}</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>2. 划拨申请</h2><dl className="investor-facts"><div><dt>申请金额</dt><dd>{item.amount} U</dd></div><div><dt>用途</dt><dd>发行人募集款释放</dd></div><div><dt>接收主体</dt><dd>{item.beneficiaryRef}</dd></div><div><dt>批准账户引用</dt><dd>{item.accountRef}</dd></div><div><dt>资产与网络</dt><dd>{item.token} / {item.network}</dd></div><div><dt>法律依据与授权范围</dt><dd>{item.legalBasisRef} / {item.authorityRef}</dd></div><div><dt>申请说明</dt><dd>{item.note}</dd></div></dl></section>
    <section className="issuer-card investor-panel"><h2>3. 审批与授权核对</h2><p>当前：{approvalLabel[item.approval]}。内部结果只改变本地申请状态，不能作为生产付款批准。</p>{item.approvalRef && <p>依据：{item.approvalRef}</p>}{tenant.plan === 'Standard' && item.execution === 'not-submitted' && ['requested', 'needs-info', 'unknown'].includes(item.approval) && <><label>核对结果<select value={result} onChange={event => setResult(event.target.value as TransferRequest['approval'])}><option value="needs-info">要求补充资料</option><option value="rejected">未通过</option><option value="unknown">结果无法确认</option><option value="approved-scoped">记录受权范围</option></select></label><label>依据引用（必填）<input value={evidence} onChange={event => setEvidence(event.target.value)} placeholder="输入已核对的授权依据引用" /></label><button type="button" onClick={record}>记录内部核对结果</button></>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}</section>
    <section className="issuer-card investor-panel"><h2>4. 实际执行</h2><p>{executionLabel[item.execution]} · 实际出款 {item.actualOut} U。当前未连接受权付款或 Signer 服务，不提供执行入口。Unknown 时先查询原 Intent。</p></section>
    <section className="issuer-card investor-panel"><h2>5. 受领到账核验</h2><p>已核实受领 {item.actualReceived} U；真实到账证据未接入，不能认定 Settled。</p><details><summary>操作历史</summary>{item.events.map((event, index) => <p key={`${event.at}-${index}`}>{when(event.at)} · {event.label} {event.ref}</p>)}</details></section>
  </section>;
}

export function IssuerSettlementV1({ tenant, query, detailId }: Props) {
  const { state, error, retry } = useIssuerFundsScenario(tenant);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [review, setReview] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [settlementError, setSettlementError] = useState('');
  const [, rerender] = useState(0);
  useEffect(() => {
    if (state !== 'ready') return;
    try { ensureSandboxSettlement(tenant); rerender(value => value + 1); setSettlementError(''); }
    catch (cause) { setSettlementError(cause instanceof Error ? cause.message : '结算资料暂不可用。'); }
  }, [state, tenant.id, tenant.plan, tenant]);
  if (detailId) return <Detail tenant={tenant} query={query} detailId={detailId} />;
  const data = readSettlementData(tenant);
  const funds = readFundsData(tenant);
  const portfolio = readPortfolio(tenant);
  const snapshot = data?.snapshots[0];
  const room = data && snapshot ? transferRoom(data, snapshot) : null;
  const snapshotIssues = snapshot ? releaseSnapshotIssues(snapshot, funds) : [];
  const canApply = tenant.plan === 'Standard' && snapshot && !snapshotIssues.length && room !== null && room !== '0';
  const dateError = Boolean(fromDate && toDate && fromDate > toDate);
  const rows = (data?.transfers || []).filter(item => !dateError &&
    (!search || `${item.id} ${item.poolId} ${item.beneficiaryRef}`.toLowerCase().includes(search.toLowerCase())) &&
    (!status || item.approval === status) && (!fromDate || orderBusinessDate(item.updatedAt) >= fromDate) &&
    (!toDate || orderBusinessDate(item.updatedAt) <= toDate)).sort((a, b) => b.updatedAt - a.updatedAt);
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  const slice = rows.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20);
  const offering = portfolio.offerings.find(item => item.id === snapshot?.offeringId);
  const submit = () => {
    if (!snapshot) { setFeedback('释放资格尚未取得。'); return; }
    if (!review) { setReview(true); setFeedback(''); return; }
    try { const result = submitTransferRequest(tenant, snapshot.id, { amount, purpose: 'issuer-proceeds',
      beneficiaryRef: snapshot.beneficiaryRef, accountRef: snapshot.accountRef,
      legalBasisRef: snapshot.legalBasisRef, authorityRef: snapshot.authorityRef, note, confirmed });
      rerender(value => value + 1); setReview(false); setFeedback(`申请 ${result.id} 已保存；尚未批准或实际划拨。`);
    } catch (cause) { setReview(false); setFeedback(cause instanceof Error ? cause.message : '申请未保存。'); }
  };
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 资金与结算 / 募集款结算</nav><h1>募集款结算</h1><p>释放资格、授权批准、实际划拨与受领到账按各自证据核对。</p></header>
    {state === 'preparing' && <p className="issuer-feedback" role="status">正在准备当前企业的内部流程资料…</p>}
    {state === 'failed' && <div className="asset-warning" role="alert">资金资料暂不可用：{error} <button type="button" className="issuer-secondary" onClick={retry}>重新核对</button></div>}
    {settlementError && <div className="asset-warning" role="alert">{settlementError} <button type="button" className="issuer-secondary" onClick={() => { try { ensureSandboxSettlement(tenant); setSettlementError(''); rerender(value => value + 1); } catch (cause) { setSettlementError(cause instanceof Error ? cause.message : '结算资料暂不可用。'); } }}>重新核对</button></div>}
    {snapshot && <div className="investor-fixture">内部 Sandbox 资格快照；不代表真实募集款可释放或真实付款授权。</div>}
    {tenant.plan === 'Free' && <div className="investor-fixture">Free 可查看准备信息；不发起真实划拨申请或资金执行。</div>}
    <section className="issuer-card investor-panel"><h2>募集资金概览</h2>{snapshot ? <><p className="funds-asof">数据截至 {when(snapshot.asOf)} · 来源 {snapshot.sourceRef} · 规则 {snapshot.ruleVersion} · 内部核对</p><dl className="investor-facts"><div><dt>资金池</dt><dd>{snapshot.poolId}</dd></div><div><dt>Offering</dt><dd>{offering ? latest(offering).fields.name : snapshot.offeringId}</dd></div><div><dt>最终匹配实收</dt><dd>{snapshot.finalMatched} U</dd></div><div><dt>未匹配／待核资金</dt><dd>{snapshot.unmatched}</dd></div><div><dt>已确认退款义务</dt><dd>{snapshot.refundObligation} U</dd></div><div><dt>争议／冻结资金</dt><dd>{snapshot.disputed}</dd></div><div><dt>受限资金</dt><dd>{snapshot.restricted} U</dd></div><div><dt>本地已承诺未划拨</dt><dd>{data ? transferCommitted(data, snapshot.poolId) || '待核实' : '待核实'} U</dd></div><div><dt>剩余可申请候选</dt><dd>{room === null ? '待核实' : `${room} U`}</dd></div><div><dt>已批准待执行</dt><dd>{data?.transfers.filter(item => item.approval === 'approved-scoped' && item.execution === 'not-submitted').length || 0} 笔（内部记录）</dd></div><div><dt>实际划拨／受领到账</dt><dd>生产数据待接入</dd></div></dl></> : <p>当前无可用的权威释放资格快照。实收、钱包余额或登记状态不能单独作为划拨依据。</p>}</section>
    <section className="issuer-card investor-panel"><h2>释放资格与受限依据</h2>{snapshot ? <><dl className="investor-facts"><div><dt>当前资格</dt><dd>{releaseLabel[snapshot.state]}</dd></div><div><dt>合法资金持有人／收款主体</dt><dd>{snapshot.legalHolderRef} / {snapshot.collectorRef}</dd></div><div><dt>Instrument / Offering 版本</dt><dd>V{snapshot.instrumentVersion} / V{snapshot.offeringVersion}</dd></div><div><dt>募集条款</dt><dd>{snapshot.termsRef}</dd></div><div><dt>快照有效期</dt><dd>{when(snapshot.validUntil)}</dd></div><div><dt>阻断事项</dt><dd>{snapshotIssues.length ? snapshotIssues.join('；') : '当前内部快照无阻断'}</dd></div></dl><div className="c08-actions"><a href={link(`/issuer/receipts/receipt/${snapshot.sourceRef}`, query)}>查看实收来源</a><a href={link(`/issuer/offerings/${snapshot.offeringId}`, query)}>查看发行依据</a></div></> : <p>当前没有可核验的释放资格；需取得合法持有人、条款、限制、退款义务及资金来源证据。</p>}</section>
    <section className="issuer-card investor-panel"><h2>提交划拨申请</h2>{canApply && snapshot ? <><p>本次仅记录内部申请。资格可申请并不代表已经批准，也不发起真实付款。</p><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => { setAmount(room || ''); setNote('请依据已核验募集条款与授权范围核对本次发行人募集款释放申请。'); setConfirmed(false); setReview(false); setFeedback(''); }}>填入示例数据</button></div><dl className="investor-facts"><div><dt>申请企业／资金池</dt><dd>{tenant.name} / {snapshot.poolId}</dd></div><div><dt>资格快照／剩余额度</dt><dd>{when(snapshot.asOf)} / {room} U</dd></div><div><dt>用途／受款主体</dt><dd>发行人募集款释放 / {snapshot.beneficiaryRef}</dd></div><div><dt>批准账户</dt><dd>{snapshot.accountRef}</dd></div><div><dt>网络／资产</dt><dd>OP Mainnet / USDT</dd></div><div><dt>法律依据／授权范围</dt><dd>{snapshot.legalBasisRef} / {snapshot.authorityRef}</dd></div></dl><label>申请金额 U（必填）<input inputMode="decimal" value={amount} onChange={event => { setAmount(event.target.value); setReview(false); }} placeholder="例如 1000.00" /></label><label>申请说明（必填，10–500 字）<textarea value={note} maxLength={500} onChange={event => { setNote(event.target.value); setReview(false); }} placeholder="说明资金池、用途及固定法律依据" /></label><label className="funds-confirm"><input type="checkbox" checked={confirmed} onChange={event => { setConfirmed(event.target.checked); setReview(false); }} />我确认 Eligible 不等于付款批准；实际执行由有权主体完成，须核验真实出款与受领到账。</label>{review && <p className="asset-warning">请确认：{snapshot.poolId} · {amount} U · {snapshot.beneficiaryRef} · {snapshot.accountRef} · OP Mainnet / USDT · {snapshot.legalBasisRef} · {snapshot.authorityRef}。</p>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}<div className="c08-actions"><button type="button" onClick={submit}>{review ? '提交划拨申请' : '核对申请'}</button><button type="button" className="issuer-secondary" onClick={() => { setAmount(''); setNote(''); setConfirmed(false); setReview(false); setFeedback(''); }}>清空</button></div></> : <p>{tenant.plan === 'Free' ? '当前套餐仅可查看准备信息。' : '当前没有可申请额度或资格尚未核实；请核对来源、限制、退款义务及有效期。'}</p>}</section>
    <section className="issuer-card investor-filters"><label>搜索<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="申请编号、资金池或受款主体" /></label><label>审批状态<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">全部状态</option>{Object.entries(approvalLabel).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>日期起<input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} /></label><label>日期止<input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} /></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setStatus(''); setFromDate(''); setToDate(''); setPage(1); }}>重置筛选</button></section>
    {dateError && <p className="issuer-feedback" role="alert">起始日期不能晚于结束日期。</p>}
    <section className="issuer-card investor-table-wrap"><h2>划拨申请与执行跟踪</h2>{slice.length ? <div className="funds-list">{slice.map(item => <article key={item.id}><strong>{item.id}</strong><span>{item.amount} U</span><span>{approvalLabel[item.approval]}</span><span>{executionLabel[item.execution]}</span><span>{when(item.updatedAt)}</span><a href={link(`${base}/${item.id}`, query)}>查看详情</a></article>)}</div> : <p>{data?.transfers.length ? '没有符合筛选条件的划拨申请。' : '暂无划拨申请；真实来源或资格未核实前不能发起。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {rows.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    {funds && <p className="funds-asof">当前企业收款记录 {funds.receipts.length} 条。所有金额与资格仅用于内部 Sandbox 情景核对。</p>}
  </section>;
}
