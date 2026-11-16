import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { latest, readPortfolio } from '../issuerPortfolioV1';
import { readAllocationData } from '../issuerAllocationV1';
import { blankYieldDraft, ensureSandboxYieldDraft, exampleYieldDraftForOffering, previewSandboxYield, readYieldDrafts, saveYieldDraft, type YieldDraftFields, type YieldPreview } from '../issuerYieldDraftV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';
import '../issuerYieldV1.scss';

type Props = { tenant: DemoTenant; query: string; view: 'servicing' | 'distributions' | 'exits' };
const link = (path: string, query: string) => `${path}?${query}`;
const typeLabel = { equity: '股权', debt: '债权', income: '收益参与权' };

function YieldDraftPanel({ tenant, query, assetId }: { tenant: DemoTenant; query: string; assetId: string }) {
  const portfolio = readPortfolio(tenant);
  const [fields, setFields] = useState<YieldDraftFields>(blankYieldDraft);
  const [currentId, setCurrentId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [, rerender] = useState(0);
  const drafts = readYieldDrafts(tenant);
  const eligible = portfolio.offerings.filter(item => (!assetId || item.assetId === assetId) &&
    portfolio.instruments.some(instrument => instrument.id === item.instrumentId && instrument.status === 'ready' &&
      ['income', 'equity'].includes(instrument.versions.find(version => version.number === item.instrumentVersion)?.fields.type || '')));
  if (tenant.subscriptionState === 'downgraded') return <section className="issuer-card investor-panel"><h2>历史收益上报资料</h2><p>当前仅可查看既有版本；原合法应付、付款及存续义务须分别回源核对。</p>{drafts?.length ? drafts.filter(item => !assetId || item.assetId === assetId).map(item => <article key={item.id} className="issuer-yield-draft"><strong>{item.id} · {item.kind === 'equity' ? '股权股息' : '收益参与'}</strong><span>{item.versions.at(-1)?.fields.periodStart} 至 {item.versions.at(-1)?.fields.periodEnd} · {item.versions.at(-1)?.fields.amount} U · 草稿</span><a href={link(`/issuer/offerings/${item.versions.at(-1)?.fields.offeringId}`, query)}>查看原发行方案</a><details><summary>历史版本（{item.versions.length}）</summary>{item.versions.map(version => <p key={version.number}>V{version.number} · {new Date(version.at).toLocaleString('zh-CN')} · {version.fields.amount} U · {version.by}</p>)}</details></article>) : <p>没有可查看的历史收益资料。</p>}</section>;
  const change = <K extends keyof YieldDraftFields>(key: K, value: YieldDraftFields[K]) => setFields(previous => ({ ...previous, [key]: value }));
  const chooseOffering = (id: string) => {
    const offering = eligible.find(item => item.id === id);
    setFields(previous => ({ ...previous, offeringId: id, instrumentId: offering?.instrumentId || '',
      instrumentVersion: offering?.instrumentVersion || 0 })); setFeedback('');
  };
  const fill = () => {
    const offering = eligible.find(item => item.id === fields.offeringId) || eligible[0];
    const example = offering && exampleYieldDraftForOffering(tenant, offering.id);
    if (!example) { setFeedback('请先准备关联的收益参与权或股权发行方案。'); return; }
    setFields(example); setFeedback('已填入可编辑的完整资料；尚未形成合法应付。');
  };
  const save = () => {
    try { const result = saveYieldDraft(tenant, fields, currentId || undefined); setCurrentId(result.id);
      rerender(value => value + 1); setFeedback(`收益上报草稿已保存 · V${result.versions.at(-1)?.number}；Record Date 与金额仍待有权核验。`); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : '草稿未保存。'); }
  };
  const clear = () => { setFields(blankYieldDraft()); setCurrentId(''); setFeedback('已清空当前表单，已保存的历史版本仍保留。'); };
  return <><section className="issuer-card investor-panel"><h2>收益上报资料草稿</h2><p>仅对收益参与权或股权准备资料。债权付息按原权益结构计划生成；当前未形成真实收益事件或分配资格。</p><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={fill}>填入示例数据</button></div><label>关联发行方案（必选）<select value={fields.offeringId} disabled={Boolean(currentId)} onChange={event => chooseOffering(event.target.value)}><option value="">请选择</option>{eligible.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name} · V{item.instrumentVersion}</option>)}</select></label><div className="issuer-yield-fields"><label>收益期间开始（必填）<input type="date" value={fields.periodStart} onChange={event => change('periodStart', event.target.value)} /></label><label>收益期间结束（必填）<input type="date" value={fields.periodEnd} onChange={event => change('periodEnd', event.target.value)} /></label><label>Record Date（待核）<input type="date" value={fields.recordDate} onChange={event => change('recordDate', event.target.value)} /></label><label>本期金额 U（必填）<input inputMode="decimal" value={fields.amount} onChange={event => change('amount', event.target.value)} placeholder="最多 6 位小数" /></label></div><label className="funds-confirm"><input type="checkbox" checked={fields.noIncome} onChange={event => { change('noIncome', event.target.checked); if (event.target.checked) change('amount', '0'); }} />本期无可分配收益</label>{fields.noIncome && <label>无收益原因（必填）<textarea value={fields.noIncomeReason} onChange={event => change('noIncomeReason', event.target.value)} placeholder="说明本期没有可分配收益的依据" /></label>}<label>合同或决议依据引用（必填）<input value={fields.basisRef} onChange={event => change('basisRef', event.target.value)} placeholder="填写固定文件或条款引用" /></label>{portfolio.instruments.find(item => item.id === fields.instrumentId)?.versions.find(item => item.number === fields.instrumentVersion)?.fields.type === 'equity' && <label>有权公司决议引用（必填）<input value={fields.decisionRef} onChange={event => change('decisionRef', event.target.value)} placeholder="填写决议编号，正式效力待核" /></label>}<label>金额口径说明（必填，10–1,000 字）<textarea maxLength={1000} value={fields.calculationNote} onChange={event => change('calculationNote', event.target.value)} placeholder="说明合同范围、费用扣除与金额口径" /></label>{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}<div className="c08-actions"><button type="button" onClick={save}>保存资料草稿</button><button type="button" className="issuer-secondary" onClick={clear}>清空／新建</button>{currentId && <button type="button" className="issuer-secondary" onClick={() => { const saved = drafts?.find(item => item.id === currentId); if (saved) setFields(structuredClone(saved.versions.at(-1)!.fields)); setFeedback('已恢复最后保存的版本。'); }}>恢复已保存版本</button>}</div></section>
    <section className="issuer-card investor-panel"><h2>已保存的资料版本</h2>{drafts?.length ? drafts.map(item => <article key={item.id} className="issuer-yield-draft"><strong>{item.id} · {item.kind === 'equity' ? '股权股息' : '收益参与'}</strong><span>{item.versions.at(-1)?.fields.periodStart} 至 {item.versions.at(-1)?.fields.periodEnd} · {item.versions.at(-1)?.fields.amount} U · 草稿</span><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => { setCurrentId(item.id); setFields(structuredClone(item.versions.at(-1)!.fields)); setFeedback('已载入原草稿，可编辑后保存新版本。'); }}>编辑原草稿</button><a href={link(`/issuer/offerings/${item.versions.at(-1)?.fields.offeringId}`, query)}>查看发行方案</a></div><details><summary>历史版本（{item.versions.length}）</summary>{item.versions.map(version => <p key={version.number}>V{version.number} · {new Date(version.at).toLocaleString('zh-CN')} · {version.fields.amount} U · {version.by}</p>)}</details></article>) : <p>暂无收益上报资料草稿。</p>}</section></>;
}

function YieldPreviewPanel({ tenant, query, assetId }: { tenant: DemoTenant; query: string; assetId: string }) {
  const drafts = (readYieldDrafts(tenant) || []).filter(item => !assetId || item.assetId === assetId);
  const [selected, setSelected] = useState('');
  const [preview, setPreview] = useState<YieldPreview | null>(null);
  const [error, setError] = useState('');
  const currentId = drafts.some(item => item.id === selected) ? selected : drafts[0]?.id || '';
  const calculate = () => {
    const result = previewSandboxYield(tenant, currentId);
    setPreview(result);
    setError(result ? '' : '原资料或当前企业访问状态已变化，请返回收益上报资料核对。');
  };
  return <section className="issuer-card investor-panel"><h2>内部金额分摊试算</h2><p>读取当前企业已保存的收益资料和内部情景登记，只用于核对金额精度与关联关系。试算不生成合法应付、正式分配批次、注资或付款。</p>
    {drafts.length ? <><label>收益资料版本<select value={currentId} onChange={event => { setSelected(event.target.value); setPreview(null); setError(''); }}>{drafts.map(item => <option key={item.id} value={item.id}>{item.id} · V{item.versions.at(-1)?.number} · {item.versions.at(-1)?.fields.periodStart} 至 {item.versions.at(-1)?.fields.periodEnd}</option>)}</select></label><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={calculate}>核对内部分摊</button><a href={link('/issuer/allocation-holders', query)}>查看登记来源</a></div></> : <p>没有可试算的收益资料。先保存收益上报草稿，并核对关联发行方案。</p>}
    {error && <p className="asset-warning" role="alert">{error}</p>}
    {preview && preview.draftId === currentId && <><dl className="investor-facts"><div><dt>关联发行方案</dt><dd><a href={link(`/issuer/offerings/${preview.offeringId}`, query)}>{preview.offeringId}</a></dd></div><div><dt>权益结构版本</dt><dd><a href={link(`/issuer/instruments/${preview.instrumentId}`, query)}>V{preview.instrumentVersion}</a></dd></div><div><dt>待核 Record Date</dt><dd>{preview.recordDate}</dd></div><div><dt>上报金额</dt><dd>{preview.amount} U；不等于正式应付</dd></div><div><dt>纳入试算的权益单位</dt><dd>{preview.totalRights} {preview.rightsUnit}</dd></div><div><dt>未纳入的登记记录</dt><dd>{preview.excluded} 条</dd></div></dl>
      {preview.issues.length ? <div className="asset-warning" role="alert"><strong>当前无法试算</strong><ul>{preview.issues.map(item => <li key={item}>{item}</li>)}</ul></div> : <><div className="funds-list">{preview.lines.map(item => <article key={item.holderRef}><strong>{item.holderRef} · {item.displayName}</strong><span>情景权益 {item.rights} {preview.rightsUnit} / 总量 {preview.totalRights} {preview.rightsUnit}</span><span>内部分摊 {item.amount} U</span></article>)}</div><p className={preview.unallocated === '0' ? 'asset-hint' : 'asset-warning'}>{preview.unallocated === '0' ? '金额精度核对：没有尾差。' : `金额尾差 ${preview.unallocated} U，须人工复核，不能静默分配。`}</p></>}
      <p className="asset-hint">情景登记不构成有权 Record Date 名册；正式计算须取得有效事件、名册版本、合同或决议依据及受权复核。</p></>}
  </section>;
}

export function IssuerYieldV1({ tenant, query, view }: Props) {
  const [sampleError, setSampleError] = useState('');
  const [, rerender] = useState(0);
  useEffect(() => {
    if (tenant.plan !== 'Standard') return;
    let active = true;
    ensureSandboxOperationalChain(tenant).then(() => {
      ensureSandboxYieldDraft(tenant);
      if (active) rerender(value => value + 1);
    }).catch(cause => {
      if (active) setSampleError(cause instanceof Error ? cause.message : '资料暂不可读取。');
    });
    return () => { active = false; };
  }, [tenant.id, tenant.plan, tenant.role]);
  const portfolio = readPortfolio(tenant);
  const allocation = readAllocationData(tenant);
  const [assetId, setAssetId] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'events' | 'calculation' | 'payments'>('events');
  const records = portfolio.instruments.filter(item => (!assetId || item.assetId === assetId) &&
    (!type || latest(item).fields.type === type) && (!search || `${latest(item).fields.name} ${latest(item).fields.subjectName}`.toLowerCase().includes(search.toLowerCase())));
  const reset = () => { setAssetId(''); setType(''); setSearch(''); setPage(1); };
  const pages = Math.max(1, Math.ceil(records.length / 20));
  const title = view === 'servicing' ? '存续管理' : view === 'distributions' ? '收益分配' : '到期与退出';
  return <section className="asset-page issuer-investors issuer-funds"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / 收益与分配 / {title}</nav><h1>{title}</h1><p>{view === 'servicing' ? '按已生效的权益、合同与持有人事实跟踪存续义务。' : view === 'distributions' ? '收益事件、法定权益快照、应付计算、真实注资和投资者实付分别核对。' : '到期日期、真实清偿、法定权益变更和 Token 处置分别核对。'}</p></header>
    {sampleError && <div className="asset-warning" role="alert">{sampleError}</div>}
    <div className="investor-fixture">当前发行方案仍为内部草稿；尚无已生效的收益或清偿业务来源。以下权益条款仅供准备核对，不构成实际应付、注资或付款。</div>
    {view === 'servicing' && <section className="issuer-card investor-empty"><h2>暂无可确认的存续档案</h2><p>有效持有人权益、发行生效证据与合同义务主体仍须由有权来源核验。Offering 草稿和内部配售情景不能自动形成正式存续义务。</p><div className="c08-actions"><a href={link('/issuer/allocation-holders', `${query}&view=holders`)}>查看登记来源</a><a href={link('/issuer/assets', query)}>查看资产与权益</a></div></section>}
    {view === 'distributions' && <><nav className="issuer-funds-tabs" aria-label="收益分配视图"><button type="button" aria-pressed={tab === 'events'} onClick={() => setTab('events')}>权益快照与收益事件</button><button type="button" aria-pressed={tab === 'calculation'} onClick={() => setTab('calculation')}>收益计算与分配批次</button><button type="button" aria-pressed={tab === 'payments'} onClick={() => setTab('payments')}>领取与支付对账</button></nav><section className="issuer-card investor-empty"><h2>{tab === 'events' ? '暂无合法收益事件或 Record Date 快照' : tab === 'calculation' ? '暂无已核验的应付计算与分配批次' : '暂无真实注资或投资者实付记录'}</h2><p>{tab === 'events' ? '预期年化区间不产生实际应付。真实收益上报需合同／决议、法定记录日与 M12 名册版本。' : tab === 'calculation' ? '只有合法事件和已核验权益快照齐备，才能计算候选应付；已计算不等于已批准或已注资。' : 'Claim 或付款请求已提交不等于投资者已收到。认购款和 SaaS 订阅费不能作为收益资金。'}</p><div className="c08-actions"><a href={link('/issuer/allocation-holders', query)}>查看法定权益来源</a><a href={link('/issuer/receipts', query)}>查看独立认购资金</a></div></section></>}
    {view === 'exits' && <section className="issuer-card investor-empty"><h2>暂无已核验的到期清偿或退出事项</h2><p>合同到期日仅是义务核对依据。真实本金和收益清偿、持有人权益变更及 Token Burn 需要各自独立的有权证据。</p><div className="c08-actions"><a href={link('/issuer/token-operations', query)}>查看 Token 处置条件</a><a href={link('/issuer/allocation-holders', query)}>查看法定登记</a></div></section>}
    {view === 'distributions' && tab === 'events' && <YieldDraftPanel tenant={tenant} query={query} assetId={assetId} />}
    {view === 'distributions' && tab === 'calculation' && <YieldPreviewPanel tenant={tenant} query={query} assetId={assetId} />}
    <section className="issuer-card investor-filters"><label>搜索权益结构或责任主体<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="权益名称、责任主体" /></label><label>资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setPage(1); }}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>权益类型<select value={type} onChange={event => { setType(event.target.value); setPage(1); }}><option value="">全部类型</option><option value="equity">股权</option><option value="debt">债权</option><option value="income">收益参与权</option></select></label><button type="button" className="issuer-secondary" onClick={reset}>重置筛选</button></section>
    <section className="issuer-card investor-table-wrap"><h2>合同条款准备来源</h2>{records.length ? <div className="funds-list">{records.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => { const fields = latest(item).fields; const asset = portfolio.assets.find(row => row.id === item.assetId); const registered = allocation?.holders.filter(holder => holder.instrumentId === item.id && holder.registration === 'effective').length || 0; return <article key={item.id}><strong>{fields.name}</strong><span>{asset ? latest(asset).fields.name : '资产待核'}</span><span>{typeLabel[fields.type]}</span><span>{fields.subjectName || '责任主体待核'}</span><span>{fields.endDate ? `合同到期 ${fields.endDate}` : '期限待核或不适用'}</span><a href={link(`/issuer/instruments/${item.id}`, query)}>查看条款</a><details><summary>查看来源与阻断</summary><p>权益结构 V{latest(item).number} · {item.status === 'ready' ? '资料就绪' : '草稿'}；内部登记情景 {registered} 条。真实发行、法定名册、Record Date、收益依据和实际支付尚待权威核验。</p>{fields.type === 'debt' && <p>利率 {fields.fixedRate || '待核'}% · 付息方式 {fields.couponMode === 'periodic' ? '周期付息' : '到期付息'}。此处不自动生成应付事件。</p>}</details></article>; })}</div> : <p>{portfolio.instruments.length ? '没有符合当前筛选条件的权益条款。' : '当前没有权益结构资料；请先从资产管理创建。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {records.length} 条条款</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
  </section>;
}
