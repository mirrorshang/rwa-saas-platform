import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { useDemoControls } from '../demoControls';
import { listAssets } from '../issuerAssets';
import {
  blankInstrumentFields, canEditInstruments, canReadInstruments, canReviewInstrument, checkInstrumentIntent,
  eligibleAssets, findInstrument, getInstrumentIntent, instrumentErrors, listInstruments, reviewInstrument,
  saveInstrument, setInstrumentState, statusLabels, submitInstrument, typeLabels,
  type Instrument, type InstrumentFields, type InstrumentResult, type InstrumentStatus,
} from '../issuerInstruments';
import '../assets.scss';
import '../instruments.scss';

type Props = { tenant: DemoTenant; query: string; onDirtyChange: (dirty: boolean) => void; onRequestDiscard: (action: () => void) => void; onSavedNavigate: (url: string) => void };
const root = '/issuer/instruments';
const href = (path: string, query: string) => `${path}?${query}`;
const latest = (record: Instrument) => record.versions.at(-1)!;
const date = (value: number) => new Date(value).toLocaleString('zh-CN');
const show = (value: string | number | undefined) => value || '未填写';
const fieldLabels: Partial<Record<keyof InstrumentFields, string>> = {
  name: '权益结构名称', type: '权益类型', purpose: '结构用途', issuer: '发行主体', debtor: '债务人', debtorRelation: '债务人与发行主体关系', debtNature: '债权性质', rightsContent: '权利内容',
  spv: 'SPV主体', spvRole: 'SPV角色', spvAssetRelation: 'SPV与底层资产关系', equityNature: '权益性质', holderRights: '持有人权利', economicSummary: '经济条款说明',
  principal: '本金数值', currency: '计价币种', interest: '计息或收益说明', repayment: '偿还安排', maturity: '到期安排', priority: '偿付顺位',
  equitySource: '权益来源', equityShare: '权益份额与计量单位', distribution: '分配安排', governance: '治理权说明', exitTerms: '结算及退出安排',
  qualification: '投资者资格与限制', transfer: '权益转让限制', disclosure: '信息披露说明', buyback: '回购或提前结束条件', risks: '风险说明',
};

function PageHead({ title, tenant, query, children }: { title: string; tenant: DemoTenant; query: string; children?: React.ReactNode }) {
  return <header className="asset-page-head"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台</a><span> / </span><a href={href(root, query)}>资产与发行 · 权益结构</a>{title !== '权益结构' && <><span> / </span><span>{title}</span></>}</nav><div className="asset-heading"><div><h1>{title}</h1><p>{tenant.name} · {tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'} · 企业自行提供权利与法律资料</p></div>{children}</div></header>;
}
function NoAccess({ query }: { query: string }) { return <section className="issuer-card asset-state" role="alert"><h1>无法访问该权益结构</h1><p>当前账号或企业没有有效访问权限，请核对企业授权。</p><a href={href('/issuer', query)}>返回工作台</a></section>; }
function Unavailable({ kind, query }: { kind: 'loading' | 'failed' | 'unknown'; query: string }) {
  return <section className="issuer-card asset-state" role={kind === 'failed' ? 'alert' : 'status'}><h2>{kind === 'loading' ? '正在加载权益结构…' : kind === 'failed' ? '权益结构查询暂不可用' : '权益结构查询结果待确认'}</h2><p>当前不展示未经确认的数据，请稍后重新查询原记录。</p><a className="issuer-secondary" href={href(root, query)}>返回列表</a></section>;
}
function Library({ tenant, query }: Props) {
  const controls = useDemoControls(state => state.controls);
  const [search, setSearch] = useState(''); const [type, setType] = useState(''); const [status, setStatus] = useState(''); const [sort, setSort] = useState('newest'); const [tick, setTick] = useState(0);
  const records = useMemo(() => listInstruments(tenant) || [], [tenant, tick]);
  const filtered = records.filter(item => {
    const current = latest(item);
    return (!search || `${current.fields.name} ${item.number}`.toLowerCase().includes(search.trim().toLowerCase())) && (!type || current.fields.type === type) && (!status || item.status === status);
  }).sort((a, b) => sort === 'newest' ? latest(b).savedAt - latest(a).savedAt : latest(a).savedAt - latest(b).savedAt);
  const readyAssets = eligibleAssets(tenant);
  const clear = () => { setSearch(''); setType(''); setStatus(''); setSort('newest'); };
  return <div className="asset-page instrument-page"><PageHead title="权益结构" tenant={tenant} query={query}>{canEditInstruments(tenant) && <a className="issuer-action" href={href(`${root}/new`, query)}>新建权益结构</a>}</PageHead>
    <section className="issuer-card asset-library-head"><div><strong>{records.length}</strong><span>当前企业权益结构</span></div><div className="instrument-summary"><span>草稿 {records.filter(item => item.status === 'draft').length}</span><span>审核中 {records.filter(item => item.status === 'reviewing').length}</span><span>内部复核完成 {records.filter(item => item.status === 'completed').length}</span></div></section>
    <section className="issuer-card asset-filter" aria-label="权益结构检索与筛选"><label>搜索名称或编号<input value={search} onChange={event => setSearch(event.target.value)} placeholder="输入名称或编号" /></label><label>权益类型<select value={type} onChange={event => setType(event.target.value)}><option value="">全部类型</option><option value="debt">债权型</option><option value="spv">SPV权益型</option></select></label><label>状态<select value={status} onChange={event => setStatus(event.target.value)}><option value="">全部状态</option>{(Object.keys(statusLabels) as InstrumentStatus[]).map(item => <option value={item} key={item}>{statusLabels[item]}</option>)}</select></label><label>保存时间<select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">最近保存优先</option><option value="oldest">较早保存优先</option></select></label><button type="button" className="issuer-secondary" onClick={clear}>清除筛选</button></section>
    {controls.instrumentList !== 'ready' ? <section className="issuer-card asset-state" role={controls.instrumentList === 'failed' ? 'alert' : 'status'}><h2>{controls.instrumentList === 'loading' ? '正在加载权益结构…' : controls.instrumentList === 'failed' ? '权益结构查询暂不可用' : '权益结构查询结果待确认'}</h2><p>请查询原记录，避免重复创建。</p><button className="issuer-secondary" onClick={() => setTick(value => value + 1)}>重新查询</button></section>
      : !records.length ? <section className="issuer-card asset-state"><h2>尚无权益结构</h2><p>{readyAssets.length ? '可从已保存且资料完整的资产开始创建。' : '请先在资产库补全可关联的资产资料。'}</p><a className="issuer-secondary" href={href('/issuer/assets', query)}>进入资产库</a>{readyAssets.length > 0 && canEditInstruments(tenant) && <a className="issuer-action" href={href(`${root}/new`, query)}>创建首项权益结构</a>}</section>
        : !filtered.length ? <section className="issuer-card asset-state"><h2>没有匹配结果</h2><p>筛选不会影响已保存记录。</p><button className="issuer-secondary" onClick={clear}>清除筛选</button></section>
          : <section className="issuer-card asset-list instrument-list"><div className="asset-table-wrap"><table><thead><tr><th>名称 / 编号</th><th>权益类型</th><th>版本与主体</th><th>关联资产</th><th>状态</th><th>最近保存</th><th>操作</th></tr></thead><tbody>{filtered.map(item => { const current = latest(item); return <tr key={item.id}><td><strong>{current.fields.name || '未命名权益结构'}</strong><small>{item.number}</small></td><td>{typeLabels[current.fields.type as 'debt' | 'spv'] || '待选择'}</td><td>版本 {current.number}<small>{current.fields.type === 'spv' ? show(current.fields.spv) : show(current.fields.issuer)}</small></td><td>{current.assetName}<small>{current.assetNumber} · 资产版本 {current.fields.assetVersion || '待选择'}</small></td><td><span className="asset-pill">{statusLabels[item.status]}</span></td><td>{date(current.savedAt)}</td><td><a href={href(`${root}/${item.id}`, query)}>查看详情</a>{canEditInstruments(tenant) && ['draft', 'changes', 'completed'].includes(item.status) && <a href={href(`${root}/${item.id}/edit`, query)}>编辑</a>}</td></tr>; })}</tbody></table></div></section>}
    <p className="asset-hint">权益结构由发行机构声明。企业内部复核完成不代表WDEX认可法律效力、真实发行许可或发行轮次已创建。</p>
  </div>;
}

const steps = ['基本信息', '权利主体', '经济条款', '限制与材料', '预览与保存'];
function Editor({ tenant, query, onDirtyChange, onRequestDiscard, onSavedNavigate, record }: Props & { record?: Instrument }) {
  const pending = getInstrumentIntent(tenant);
  const relevant = pending?.kind === 'save' && (!record || pending.instrumentId === record.id) ? pending : null;
  const [fields, setFields] = useState<InstrumentFields>(() => relevant?.snapshot || (record ? latest(record).fields : blankInstrumentFields()));
  const [step, setStep] = useState(0); const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false); const [errors, setErrors] = useState<string[]>([]); const [feedback, setFeedback] = useState(''); const [confirmSubmit, setConfirmSubmit] = useState(false);
  const previous = record?.versions.length || 0; const assets = eligibleAssets(tenant);
  const selectedAsset = assets.find(item => item.id === fields.assetId);
  const currentAssetVersion = selectedAsset?.versions.at(-1)?.number || 0;
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const change = (key: keyof Omit<InstrumentFields, 'materials' | 'assetVersion'>, value: string) => { setFields(current => ({ ...current, [key]: value })); setDirty(true); setFeedback(''); };
  const changeAsset = (id: string) => { const asset = assets.find(item => item.id === id); setFields(current => ({ ...current, assetId: id, assetVersion: asset?.versions.at(-1)?.number || 0 })); setDirty(true); setFeedback(''); };
  const changeMaterial = (id: string, key: 'name' | 'reference', value: string) => { setFields(current => ({ ...current, materials: current.materials.map(item => item.id === id ? { ...item, [key]: value } : item) })); setDirty(true); };
  const result = (outcome: InstrumentResult, submitting: boolean) => {
    setBusy(false);
    if (outcome.status === 'saved' && outcome.record) {
      if (submitting) {
        const submitted = submitInstrument(tenant, outcome.record.id, latest(outcome.record).number, true);
        if (submitted.status !== 'saved') { setErrors(submitted.errors || []); setFeedback('草稿已保存，内部复核提交未完成。请在详情页核对后重试。'); }
      }
      setDirty(false); onDirtyChange(false); onSavedNavigate(href(`${root}/${outcome.record.id}`, query)); return;
    }
    setErrors(outcome.errors || []);
    setFeedback(({ failed: '保存未完成，您的输入仍在本页，请核对后重试。', unknown: '保存结果待确认，请查询原申请，勿重复创建。', conflict: '记录已有新版本，请核对后重新编辑。', denied: '当前无权保存，或记录状态不允许编辑。', invalid: '请核对表单内容。' } as Record<string, string>)[outcome.status] || '操作未完成。');
  };
  const save = (submitting = false) => {
    if (busy || relevant?.status === 'unknown') return;
    const issues = instrumentErrors(tenant, fields, submitting); setErrors(issues); if (issues.length) { setConfirmSubmit(false); return; }
    const snapshot = structuredClone(fields); setBusy(true); setFeedback(''); setConfirmSubmit(false);
    window.setTimeout(() => result(saveInstrument(tenant, snapshot, record?.id, previous, relevant?.id), submitting), 350);
  };
  const check = () => { setBusy(true); window.setTimeout(() => result(checkInstrumentIntent(tenant), false), 350); };
  const cancel = () => { const action = () => { location.href = href(record ? `${root}/${record.id}` : root, query); }; if (dirty) onRequestDiscard(action); else action(); };
  const input = (key: keyof Omit<InstrumentFields, 'materials' | 'assetVersion' | 'type' | 'assetId'>, label = fieldLabels[key] || key, multiline = false) => <label className={multiline ? 'wide' : undefined}>{label}{multiline ? <textarea value={fields[key] as string} onChange={event => change(key, event.target.value)} /> : <input value={fields[key] as string} onChange={event => change(key, event.target.value)} />}</label>;
  return <div className="asset-page instrument-page"><PageHead title={record ? '编辑权益结构' : '新建权益结构'} tenant={tenant} query={query}><a className="issuer-secondary" href={href(root, query)}>返回列表</a></PageHead>
    <section className="issuer-card asset-wizard"><p className="asset-hint">当前仅提供债权型与SPV权益型结构模板。选择类型不代表法律认可或发行资格。</p>
      <ol className="asset-steps">{steps.map((item, index) => <li key={item} className={index === step ? 'active' : ''}><span>{index + 1}</span>{item}</li>)}</ol>
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); save(false); }}><fieldset disabled={busy || !canEditInstruments(tenant)}><h2 className="asset-step-title">{steps[step]}</h2>
        {step === 0 && <div className="asset-fields">{input('name')}
          <label>权益类型<select value={fields.type} onChange={event => change('type', event.target.value)}><option value="">请选择</option><option value="debt">债权型</option><option value="spv">SPV权益型</option></select></label>
          <label>关联底层资产<select value={fields.assetId} onChange={event => changeAsset(event.target.value)}><option value="">请选择已完成基础资料的资产</option>{assets.map(asset => { const version = asset.versions.at(-1)!; return <option value={asset.id} key={asset.id}>{version.fields.name} · {asset.number} · 版本 {version.number}</option>; })}</select></label>
          {input('purpose', '结构用途说明', true)}
          {!assets.length && <p className="asset-warning wide">当前没有可关联的完整资产。请先在<a href={href('/issuer/assets', query)}>资产库</a>补充资产资料。</p>}
          {fields.assetId && <div className="wide"><p className="asset-hint">保存时会引用所选资产的当前版本；资产资料更新后须重新核对关联版本。</p>{selectedAsset && fields.assetVersion !== currentAssetVersion && <div className="asset-warning"><p>关联资产已有新版本。请核对资产资料后明确更新引用。</p><a href={href(`/issuer/assets/${selectedAsset.id}`, query)}>查看资产版本</a><button type="button" className="issuer-secondary" onClick={() => { setFields(current => ({ ...current, assetVersion: currentAssetVersion })); setDirty(true); }}>引用当前资产版本 {currentAssetVersion}</button></div>}</div>}
        </div>}
        {step === 1 && <div className="asset-fields">{fields.type === 'debt' ? <>{input('issuer')}{input('debtor')}{input('debtorRelation', undefined, true)}{input('debtNature')}{input('rightsContent', undefined, true)}</> : fields.type === 'spv' ? <>{input('spv')}{input('spvRole')}{input('spvAssetRelation', undefined, true)}{input('equityNature')}{input('holderRights', undefined, true)}<p className="asset-hint wide">SPV权益不等于持有人直接拥有底层资产的所有权。</p></> : <p>请先在基本信息选择权益类型。</p>}</div>}
        {step === 2 && <div className="asset-fields">{input('economicSummary', '经济条款总体说明', true)}{fields.type === 'debt' ? <>{input('principal')}{input('currency')}{input('interest', '计息或收益说明', true)}{input('repayment', undefined, true)}{input('maturity')}{input('priority', undefined, true)}</> : fields.type === 'spv' ? <>{input('equitySource')}{input('equityShare')}{input('distribution', undefined, true)}{input('governance', undefined, true)}{input('exitTerms', undefined, true)}</> : <p>请先选择权益类型。</p>}<p className="asset-hint wide">此处由发行机构录入经济条款说明。系统不计算收益率，也不形成投资收益承诺。</p></div>}
        {step === 3 && <div className="asset-materials"><div className="asset-fields">{input('qualification', undefined, true)}{input('transfer', undefined, true)}{input('disclosure', undefined, true)}{input('buyback', undefined, true)}{input('risks', undefined, true)}</div><p className="asset-hint">这些说明由企业填写；系统不自动生成适用法域的限制或法律结论。这里只记录材料名称及说明，不接收真实文件上传。</p>{fields.materials.map((item, index) => <div className="asset-material" key={item.id}><h3>材料 {index + 1}</h3><div className="asset-fields"><label>材料名称<input value={item.name} onChange={event => changeMaterial(item.id, 'name', event.target.value)} /></label><label className="wide">材料编号或说明<textarea value={item.reference} onChange={event => changeMaterial(item.id, 'reference', event.target.value)} /></label></div><button className="issuer-secondary" type="button" onClick={() => { setFields(current => ({ ...current, materials: current.materials.filter(entry => entry.id !== item.id) })); setDirty(true); }}>移除材料记录</button></div>)}<button className="issuer-secondary" type="button" onClick={() => { setFields(current => ({ ...current, materials: [...current.materials, { id: crypto.randomUUID(), name: '', reference: '' }] })); setDirty(true); }}>添加材料信息</button></div>}
        {step === 4 && <div className="asset-review"><h2>权益结构摘要</h2><dl><div><dt>名称与类型</dt><dd>{show(fields.name)} · {fields.type ? typeLabels[fields.type as 'debt' | 'spv'] : '权益类型待选择'}</dd></div><div><dt>关联资产</dt><dd>{assets.find(asset => asset.id === fields.assetId)?.versions.at(-1)?.fields.name || '待选择'} · 资产版本 {fields.assetVersion || '待选择'}</dd></div><div><dt>权利主体</dt><dd>{fields.type === 'spv' ? show(fields.spv) : show(fields.issuer)}</dd></div><div><dt>权利内容</dt><dd>{fields.type === 'spv' ? show(fields.holderRights) : show(fields.rightsContent)}</dd></div><div><dt>经济条款</dt><dd>{show(fields.economicSummary)}</dd></div><div><dt>限制与风险</dt><dd>{show(fields.risks)}</dd></div><div><dt>材料信息</dt><dd>{fields.materials.map(item => item.name).filter(Boolean).join('、') || '未添加'}</dd></div></dl><p className="asset-hint">保存草稿可分步完成。提交仅供本企业内部复核，不代表WDEX实质审核法律效力或批准真实发行。</p></div>}
      </fieldset>{errors.length > 0 && <div className="asset-errors" role="alert">{errors.map(item => <p key={item}>{item}</p>)}</div>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}{relevant?.status === 'unknown' && <p className="asset-warning">原保存申请结果待确认。查询前不能再次保存。</p>}
      <div className="asset-actions"><button type="button" className="issuer-secondary" onClick={cancel}>取消</button>{step > 0 && <button type="button" className="issuer-secondary" onClick={() => { setErrors([]); setStep(value => value - 1); }}>上一步</button>}{step < 4 && <button type="button" className="issuer-secondary" onClick={() => { setErrors([]); setStep(value => value + 1); }}>下一步</button>}<button type="submit" className="issuer-action" disabled={busy || relevant?.status === 'unknown' || !canEditInstruments(tenant)}>{busy ? '正在保存…' : '保存草稿'}</button>{step === 4 && <button type="button" className="issuer-action" disabled={busy || relevant?.status === 'unknown' || !canEditInstruments(tenant)} onClick={() => { const issues = instrumentErrors(tenant, fields, true); setErrors(issues); if (!issues.length) setConfirmSubmit(true); }}>提交内部复核</button>}{relevant?.status === 'unknown' && <button type="button" className="issuer-secondary" disabled={busy} onClick={check}>查询原保存申请</button>}</div></form>
    </section>
    {confirmSubmit && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-labelledby="instrument-confirm-title"><h2 id="instrument-confirm-title">确认提交</h2><p>确认提交当前权益结构版本供本企业内部复核？WDEX不对权益法律效力作实质审核。</p><div><button className="issuer-secondary" type="button" onClick={() => setConfirmSubmit(false)}>继续编辑</button><button className="issuer-action" type="button" onClick={() => save(true)}>确认提交</button></div></div></div>}
  </div>;
}

const tabs = ['权益摘要', '经济条款', '主体与关系', '法律材料', '审核与版本历史'] as const;
function Detail({ tenant, query, record: initial }: Props & { record: Instrument }) {
  const controls = useDemoControls(state => state.controls); const [record, setRecord] = useState(initial); const [tab, setTab] = useState<(typeof tabs)[number]>('权益摘要'); const [notice, setNotice] = useState(''); const [note, setNote] = useState(''); const [confirm, setConfirm] = useState<'submit' | 'pause' | 'archive' | null>(null); const [busy, setBusy] = useState(false);
  const current = latest(record); const fields = current.fields; const intent = getInstrumentIntent(tenant); const asset = (listAssets(tenant) || []).find(item => item.id === fields.assetId);
  const refresh = (result: InstrumentResult) => { setBusy(false); if (result.record) setRecord(result.record); setNotice(({ saved: '操作已完成。', completed: '企业内部复核已完成；这不构成真实发行许可。', changes: '已退回修改，请核对意见。', failed: '操作未完成，请核对后重试。', unknown: '结果待确认，请查询原申请，勿重复提交。', conflict: '版本已变化，请刷新后核对。', denied: '当前身份或记录状态不允许此操作。', invalid: (result.errors || []).join('、') } as Record<string, string>)[result.status] || '操作未完成。'); };
  const act = (action: () => InstrumentResult) => { if (busy) return; setBusy(true); window.setTimeout(() => refresh(action()), 350); };
  const detailRows = (keys: (keyof InstrumentFields)[]) => <dl>{keys.map(key => <div key={key}><dt>{fieldLabels[key] || key}</dt><dd>{show(fields[key] as string)}</dd></div>)}</dl>;
  const isReviewer = canReviewInstrument(tenant, record);
  return <div className="asset-page instrument-page"><PageHead title="权益结构详情" tenant={tenant} query={query}><a className="issuer-secondary" href={href(root, query)}>返回列表</a>{canEditInstruments(tenant) && ['draft', 'changes', 'completed'].includes(record.status) && <a className="issuer-action" href={href(`${root}/${record.id}/edit`, query)}>编辑权益结构</a>}</PageHead>
    <section className="issuer-card asset-detail-head"><div><h2>{fields.name || '未命名权益结构'}</h2><p>{record.number} · {fields.type ? typeLabels[fields.type as 'debt' | 'spv'] : '类型待选择'} · <span className="asset-pill">{statusLabels[record.status]}</span></p></div><div><span>版本 {current.number}</span><small>最近保存 {date(current.savedAt)}</small></div></section>
    <nav className="asset-tabs" aria-label="权益结构详情">{tabs.map(item => <button key={item} type="button" aria-current={tab === item ? 'page' : undefined} onClick={() => setTab(item)}>{item}</button>)}</nav>
    {tab === '权益摘要' && <section className="issuer-card asset-detail"><h2>权益摘要</h2><dl><div><dt>权益结构名称</dt><dd>{show(fields.name)}</dd></div><div><dt>权益类型</dt><dd>{fields.type ? typeLabels[fields.type as 'debt' | 'spv'] : '待选择'}</dd></div><div><dt>关联资产</dt><dd>{current.assetName} · {current.assetNumber} · 资产版本 {fields.assetVersion || '待选择'}{asset ? <a className="instrument-inline-link" href={href(`/issuer/assets/${asset.id}`, query)}>查看资产</a> : <span>（当前资产不可访问，历史引用仍保留）</span>}</dd></div><div><dt>关联发行项目与发行轮次</dt><dd>目前没有已建立的关联记录。</dd></div><div><dt>结构用途</dt><dd>{show(fields.purpose)}</dd></div><div><dt>权利主体</dt><dd>{fields.type === 'spv' ? show(fields.spv) : show(fields.issuer)}</dd></div><div><dt>当前状态</dt><dd>{statusLabels[record.status]}</dd></div></dl><p className="asset-hint">发行机构对资产、权益及法律资料的声明负责；WDEX提供字段、格式、版本与一致性工具，不作实质法律审查。</p></section>}
    {tab === '经济条款' && <section className="issuer-card asset-detail"><h2>经济条款</h2>{detailRows(fields.type === 'spv' ? ['economicSummary', 'equitySource', 'equityShare', 'distribution', 'governance', 'exitTerms'] : ['economicSummary', 'principal', 'currency', 'interest', 'repayment', 'maturity', 'priority'])}<p className="asset-hint">本页不计算收益率，不生成价格、募集金额或真实分配记录。</p></section>}
    {tab === '主体与关系' && <section className="issuer-card asset-detail"><h2>主体与关系</h2>{detailRows(fields.type === 'spv' ? ['spv', 'spvRole', 'spvAssetRelation', 'equityNature', 'holderRights'] : ['issuer', 'debtor', 'debtorRelation', 'debtNature', 'rightsContent'])}<dl><div><dt>关联资产控制主体</dt><dd>{asset?.versions.find(version => version.number === fields.assetVersion)?.fields.controller || '原资产版本不可访问'}</dd></div></dl><p className="asset-hint">发行机构、当前企业、债务人和SPV主体是不同业务概念，不能仅凭账户身份推定其法律关系。</p></section>}
    {tab === '法律材料' && <section className="issuer-card asset-detail"><h2>限制与材料</h2>{detailRows(['qualification', 'transfer', 'disclosure', 'buyback', 'risks'])}{fields.materials.length ? <ul className="asset-material-list">{fields.materials.map(item => <li key={item.id}><strong>{item.name || '未命名材料'}</strong><p>{item.reference || '无补充说明'}</p></li>)}</ul> : <p>尚未添加材料信息。</p>}<p className="asset-hint">这里只展示企业录入的材料名称与说明；未接入真实文件上传、专业意见或法律文件签署。</p></section>}
    {tab === '审核与版本历史' && <section className="issuer-card asset-detail"><h2>内部复核与版本</h2>{controls.instrumentHistory !== 'ready' ? <p role={controls.instrumentHistory === 'failed' ? 'alert' : 'status'}>{controls.instrumentHistory === 'loading' ? '正在读取历史…' : controls.instrumentHistory === 'failed' ? '历史记录暂不可用' : '历史查询结果待确认'}</p> : <><ol className="asset-version-list">{[...record.versions].reverse().map(version => <li key={version.number}><strong>版本 {version.number}</strong><span>{date(version.savedAt)} · 保存人 {version.savedBy}</span><p>{version.fields.name || '未命名权益结构'} · 关联资产版本 {version.fields.assetVersion || '待选择'}</p>{version.number > 1 && <p>相对上一版变更：{Object.keys(version.fields).filter(key => JSON.stringify(version.fields[key as keyof InstrumentFields]) !== JSON.stringify(record.versions[version.number - 2].fields[key as keyof InstrumentFields])).map(key => fieldLabels[key as keyof InstrumentFields] || (key === 'assetId' ? '关联资产' : key === 'materials' ? '材料信息' : key)).join('、') || '无字段变化'}</p>}</li>)}</ol><h3>操作历史</h3><ol className="asset-version-list">{[...record.events].reverse().map(item => <li key={item.id}><strong>{({ saved: '保存草稿', submitted: '提交内部复核', returned: '退回修改', completed: '内部复核完成', paused: '暂停', archived: '归档' } as Record<string, string>)[item.kind]} · 版本 {item.version}</strong><span>{date(item.at)} · {item.actor.startsWith('internal-reviewer:') ? '企业内部独立复核角色' : item.actor}</span>{item.note && <p>{item.note}</p>}</li>)}</ol></>}<p className="asset-hint">内部复核只检查本企业录入资料的流程，不是WDEX法律审核，也不代表发行、Offering或Token已获批准。</p></section>}
    <section className="issuer-card instrument-actions"><h2>内部操作</h2>{notice && <p role="status" className="issuer-feedback">{notice}</p>}{intent?.status === 'unknown' && intent.instrumentId === record.id && <div className="asset-warning"><p>原{intent.kind === 'review' ? '复核' : '保存'}申请结果待确认，当前不能重复操作。</p><button className="issuer-secondary" disabled={busy} onClick={() => act(() => checkInstrumentIntent(tenant))}>查询原申请</button></div>}
      {canEditInstruments(tenant) && ['draft', 'changes'].includes(record.status) && <button className="issuer-action" disabled={busy || intent?.status === 'unknown'} onClick={() => { const errors = instrumentErrors(tenant, fields, true); if (errors.length) setNotice(errors.join('、')); else setConfirm('submit'); }}>提交内部复核</button>}
      {record.status === 'reviewing' && <p>{isReviewer ? '当前具备独立内部复核操作资格。' : '提交人不能复核自己的版本；请由有权限的其他内部复核角色处理。'}</p>}
      {isReviewer && <div className="instrument-review-actions"><label>内部复核意见<textarea value={note} onChange={event => setNote(event.target.value)} placeholder="通过或退回时均须填写复核意见；退回请说明原因" /></label><button className="issuer-secondary" disabled={busy || intent?.status === 'unknown' || !note.trim()} onClick={() => act(() => reviewInstrument(tenant, record.id, current.number, 'changes', note))}>退回修改</button><button className="issuer-action" disabled={busy || intent?.status === 'unknown' || !note.trim()} onClick={() => act(() => reviewInstrument(tenant, record.id, current.number, 'completed', note))}>确认内部复核完成</button></div>}
      {canEditInstruments(tenant) && record.status !== 'archived' && <div className="instrument-lifecycle"><button className="issuer-secondary" disabled={busy || record.status === 'paused'} onClick={() => setConfirm('pause')}>暂停使用</button><button className="issuer-secondary" disabled={busy} onClick={() => setConfirm('archive')}>归档</button></div>}
    </section>
    {confirm && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-labelledby="instrument-action-title"><h2 id="instrument-action-title">确认操作</h2><p>{confirm === 'submit' ? '确认提交当前权益结构版本供本企业内部复核？WDEX不对权益法律效力作实质审核。' : confirm === 'pause' ? '确认暂停使用当前权益结构？历史版本和操作记录仍会保留。' : '确认归档当前权益结构？历史版本和操作记录仍会保留。'}</p><div><button className="issuer-secondary" onClick={() => setConfirm(null)}>取消</button><button className="issuer-action" onClick={() => { const action = confirm; setConfirm(null); act(() => action === 'submit' ? submitInstrument(tenant, record.id, current.number, true) : setInstrumentState(tenant, record.id, action === 'pause' ? 'paused' : 'archived')); }}>确认</button></div></div></div>}
  </div>;
}

export function IssuerInstruments(props: Props) {
  const read = useDemoControls(state => state.controls.instrumentList);
  const path = location.pathname; const parts = path.split('/').filter(Boolean); const isNew = parts[2] === 'new'; const id = !isNew ? decodeURIComponent(parts[2] || '') : ''; const editing = parts[3] === 'edit';
  const record = id ? findInstrument(props.tenant, id) : null;
  useEffect(() => { document.title = `${isNew ? '新建权益结构' : id ? editing ? '编辑权益结构' : '权益结构详情' : '权益结构'}｜WDEX SaaS`; }, [path, id, editing, isNew]);
  if (!canReadInstruments(props.tenant)) return <NoAccess query={props.query} />;
  if (id && read !== 'ready') return <Unavailable kind={read} query={props.query} />;
  if (id && !record) return <NoAccess query={props.query} />;
  if (isNew || editing) {
    if (!canEditInstruments(props.tenant) || (editing && (!record || !['draft', 'changes', 'completed'].includes(record.status)))) return <NoAccess query={props.query} />;
    return <Editor {...props} record={record || undefined} />;
  }
  if (record) return <Detail {...props} record={record} />;
  return <Library {...props} />;
}
