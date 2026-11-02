import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { useDemoControls } from '../demoControls';
import { listInstruments, statusLabels, typeLabels } from '../issuerInstruments';
import {
  assetCategories, assetFieldErrors, assetMissing, blankAssetFields, canReadAssets, canWriteAssets,
  checkAssetSaveIntent, findAsset, getAssetSaveIntent, listAssets, saveAsset,
  type Asset, type AssetFields, type AssetMaterial, type SaveResult,
} from '../issuerAssets';
import '../assets.scss';

type Props = {
  tenant: DemoTenant; query: string;
  onDirtyChange: (dirty: boolean) => void;
  onRequestDiscard: (action: () => void) => void;
  onSavedNavigate: (url: string) => void;
};
const assetRoot = '/issuer/assets';
const href = (path: string, query: string) => `${path}?${query}`;
const latest = (asset: Asset) => asset.versions.at(-1)!;
const displayDate = (value: number) => new Date(value).toLocaleString('zh-CN');
const status = (asset: Asset) => asset.state === 'archived' ? '已归档' : assetMissing(latest(asset).fields).length ? '资料待补充' : '资料较完整';

function PageHead({ title, tenant, query, children }: { title: string; tenant: DemoTenant; query: string; children?: React.ReactNode }) {
  return <header className="asset-page-head"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台</a><span> / </span><a href={href(assetRoot, query)}>资产与发行 · 资产库</a>{title !== '资产库' && <><span> / </span><span>{title}</span></>}</nav><div className="asset-heading"><div><h1>{title}</h1><p>{tenant.name} · {tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'} · 资产资料由发行机构自行提供和声明</p></div>{children}</div></header>;
}
function NoAccess({ query }: { query: string }) {
  return <section className="issuer-card asset-state" role="alert"><h1>无法访问该资产</h1><p>当前企业或账号没有有效的资产访问权限，请返回工作台核对授权。</p><a className="issuer-secondary" href={href('/issuer', query)}>返回工作台</a></section>;
}
function AssetLibrary({ tenant, query }: Props) {
  const controls = useDemoControls(state => state.controls);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [sort, setSort] = useState('newest');
  const [revision, setRevision] = useState(0);
  const assets = useMemo(() => listAssets(tenant) || [], [tenant, revision, controls.assetAccess]);
  const filtered = useMemo(() => assets.filter(asset => {
    const fields = latest(asset).fields;
    return (!search || `${fields.name} ${asset.number}`.toLowerCase().includes(search.trim().toLowerCase()))
      && (!category || fields.category === category) && (!state || status(asset) === state);
  }).sort((a, b) => sort === 'oldest' ? latest(a).savedAt - latest(b).savedAt : latest(b).savedAt - latest(a).savedAt), [assets, search, category, state, sort]);
  if (!canReadAssets(tenant)) return <NoAccess query={query} />;
  const clear = () => { setSearch(''); setCategory(''); setState(''); setSort('newest'); };
  return <div className="asset-page"><PageHead title="资产库" tenant={tenant} query={query}>{canWriteAssets(tenant) ? <a className="issuer-action" href={href(`${assetRoot}/new`, query)}>新建资产</a> : <span className="asset-muted">您可查看资产，暂无编辑权限</span>}</PageHead>
    <section className="issuer-card asset-library-head"><div><h2>当前有权资产</h2><strong>{controls.assetList === 'ready' ? assets.length : '待查询'}</strong><p>统一管理企业的资产资料、相关主体及文件记录。分类仅用于资料整理，不代表真实发行许可。</p></div><p>资料完整性是系统字段检查，不代表WDEX已核验权属或法律有效性。</p></section>
    <section className="issuer-card asset-filter" aria-label="资产检索与筛选"><label>搜索资产名称或内部编号<input value={search} onChange={event => setSearch(event.target.value)} placeholder="输入名称或编号" /></label><label>资产类别<select value={category} onChange={event => setCategory(event.target.value)}><option value="">全部类别</option>{assetCategories.map(item => <option key={item}>{item}</option>)}</select></label><label>资料状态<select value={state} onChange={event => setState(event.target.value)}><option value="">全部状态</option><option>资料待补充</option><option>资料较完整</option><option>已归档</option></select></label><label>更新时间<select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">最近更新优先</option><option value="oldest">较早更新优先</option></select></label><button className="issuer-secondary" type="button" onClick={clear}>清除筛选</button></section>
    {controls.assetList !== 'ready' ? <section className="issuer-card asset-state" role={controls.assetList === 'failed' ? 'alert' : 'status'}><h2>{controls.assetList === 'loading' ? '正在加载资产…' : controls.assetList === 'failed' ? '资产查询暂不可用' : '资产查询结果待确认'}</h2><p>当前不展示未经确认的资产结果。请稍后重新查询原记录。</p><button className="issuer-secondary" onClick={() => setRevision(value => value + 1)}>重新查询</button></section>
      : !assets.length ? <section className="issuer-card asset-state"><h2>还没有资产，先创建一项资产</h2><p>新建后可逐步补充控制主体和证明信息；Free Sandbox 不产生真实发行记录。</p>{canWriteAssets(tenant) && <a className="issuer-action" href={href(`${assetRoot}/new`, query)}>创建首个资产</a>}</section>
        : !filtered.length ? <section className="issuer-card asset-state"><h2>当前条件下没有匹配资产</h2><p>已保存的资产不会因筛选条件而删除。</p><button className="issuer-secondary" onClick={clear}>清除筛选</button></section>
          : <section className="issuer-card asset-list"><div className="asset-table-wrap"><table><thead><tr><th>资产名称 / 内部编号</th><th>类别</th><th>资产控制主体</th><th>资料状态 / 缺项</th><th>最近更新 / 版本</th><th>操作</th></tr></thead><tbody>{filtered.map(asset => { const current = latest(asset); const missing = assetMissing(current.fields); return <tr key={asset.id}><td><strong>{current.fields.name || '未命名资产'}</strong><small>{asset.number}</small></td><td>{current.fields.category || '待补充'}</td><td>{current.fields.controller || '待补充'}</td><td><span className="asset-pill">{status(asset)}</span><small>{missing.length ? `缺少 ${missing.join('、')}` : '无字段缺项'}</small></td><td>{displayDate(current.savedAt)}<small>版本 {current.number}</small></td><td><a href={href(`${assetRoot}/${asset.id}`, query)}>查看详情</a>{canWriteAssets(tenant) && asset.state !== 'archived' && <a href={href(`${assetRoot}/${asset.id}/edit`, query)}>继续编辑</a>}</td></tr>; })}</tbody></table></div></section>}
  </div>;
}

const steps = ['资产基础信息', '控制与权属主体', '描述与参考价值', '材料与证明信息', '核对与保存'];
function AssetEditor({ tenant, query, onDirtyChange, onRequestDiscard, onSavedNavigate, asset }: Props & { asset?: Asset }) {
  const originalIntent = getAssetSaveIntent(tenant);
  const relevantIntent = originalIntent && (!asset || originalIntent.assetId === asset.id) ? originalIntent : null;
  const [fields, setFields] = useState<AssetFields>(() => relevantIntent?.snapshot || (asset ? latest(asset).fields : blankAssetFields()));
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const previous = asset ? latest(asset).number : 0;
  const similar = fields.name.trim() && listAssets(tenant)?.some(item => item.id !== asset?.id && latest(item).fields.name.trim().toLowerCase() === fields.name.trim().toLowerCase());
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const change = (key: keyof Omit<AssetFields, 'materials'>, value: string) => { setFields(current => ({ ...current, [key]: value })); setDirty(true); setFeedback(''); };
  const changeMaterial = (id: string, key: keyof Omit<AssetMaterial, 'id'>, value: string) => { setFields(current => ({ ...current, materials: current.materials.map(item => item.id === id ? { ...item, [key]: value } : item) })); setDirty(true); };
  const saveResult = (result: SaveResult) => {
    setBusy(false);
    if (result.status === 'saved' && result.asset) { setDirty(false); onDirtyChange(false); onSavedNavigate(href(`${assetRoot}/${result.asset.id}`, query)); return; }
    setFeedback(({ failed: '保存未完成，您的输入仍在本页。请核对后重试。', unknown: '保存结果待确认。请查询原保存申请，勿重复创建资产。', conflict: '资产已有新版本，请核对差异后再编辑。', denied: '当前无权保存该资产，或表单结构无效。' } as Record<string, string>)[result.status] || '保存未完成。');
  };
  const save = () => {
    const issues = assetFieldErrors(fields);
    setErrors(issues);
    if (issues.length || busy) return;
    setBusy(true); setFeedback('');
    const snapshot = structuredClone(fields);
    window.setTimeout(() => saveResult(saveAsset(tenant, snapshot, asset?.id, previous, relevantIntent?.id)), 400);
  };
  const queryOriginal = () => { setBusy(true); window.setTimeout(() => saveResult(checkAssetSaveIntent(tenant)), 400); };
  const next = () => {
    if (step === 0 && (!fields.name.trim() || !fields.category)) { setErrors(['请补充资产名称和资产类别，或先保存草稿。']); return; }
    setErrors([]); setStep(value => Math.min(4, value + 1));
  };
  const cancel = () => {
    const target = href(asset ? `${assetRoot}/${asset.id}` : assetRoot, query);
    const go = () => { onDirtyChange(false); location.href = target; };
    if (dirty) onRequestDiscard(go); else go();
  };
  if (!canWriteAssets(tenant) || asset?.state === 'archived') return <NoAccess query={query} />;
  return <div className="asset-page"><PageHead title={asset ? '编辑资产' : '新建资产'} tenant={tenant} query={query} /><section className="issuer-card asset-wizard"><p className="asset-muted">{asset ? `${asset.number} · 当前版本 ${previous}，保存修改将形成新版本。` : '内部资产编号将在首次保存后生成。'}您可随时保存未完成的草稿。</p><ol className="asset-steps" aria-label="资产资料填写进度">{steps.map((name, index) => <li key={name} className={step === index ? 'active' : ''} aria-current={step === index ? 'step' : undefined}><span>{index + 1}</span>{name}</li>)}</ol>
    <form onSubmit={(event: FormEvent) => { event.preventDefault(); save(); }}><fieldset disabled={busy || relevantIntent?.status === 'unknown'}><legend className="asset-step-title">第 {step + 1} 步 · {steps[step]}</legend>
      {step === 0 && <div className="asset-fields"><label>资产名称<input value={fields.name} maxLength={120} onChange={event => change('name', event.target.value)} placeholder="填写企业使用的资产名称" /></label><label>资产类别<select value={fields.category} onChange={event => change('category', event.target.value)}><option value="">请选择资料类别</option>{assetCategories.map(item => <option key={item}>{item}</option>)}</select></label><label>资产所在地或适用地区（如适用）<input value={fields.region} onChange={event => change('region', event.target.value)} placeholder="按资产情况填写" /></label><label className="wide">资产简述<textarea value={fields.summary} onChange={event => change('summary', event.target.value)} /></label><p className="asset-hint wide">类别仅用于资料分类，不代表该资产或地区已获真实发行许可。</p></div>}
      {step === 1 && <div className="asset-fields"><label>资产控制主体名称<input value={fields.controller} onChange={event => change('controller', event.target.value)} /></label><label>主体类型或关系<input value={fields.controllerType} onChange={event => change('controllerType', event.target.value)} placeholder="如产权主体、受托管理方等" /></label><label>与当前企业的关系<input value={fields.tenantRelation} onChange={event => change('tenantRelation', event.target.value)} placeholder="请按实际关系说明" /></label><label className="wide">权属或控制关系说明<textarea value={fields.ownershipNote} onChange={event => change('ownershipNote', event.target.value)} /></label><p className="asset-hint wide">当前企业、资产控制主体、法定发行机构及其他相关主体可能不同，请依据实际资料填写。</p></div>}
      {step === 2 && <div className="asset-fields"><label className="wide">资产详细描述<textarea value={fields.detail} onChange={event => change('detail', event.target.value)} /></label><label>参考价值<input value={fields.referenceValue} inputMode="decimal" onChange={event => change('referenceValue', event.target.value)} placeholder="不适用可留空" /></label><label>计价币种<input value={fields.currency} onChange={event => change('currency', event.target.value)} placeholder="如有参考价值，请说明币种" /></label><label>参考日期<input type="date" value={fields.referenceDate} onChange={event => change('referenceDate', event.target.value)} /></label><label className="wide">价值来源说明<textarea value={fields.valueSource} onChange={event => change('valueSource', event.target.value)} /></label><p className="asset-hint wide">参考价值仅为企业记录，不等于发行价格、募集金额或法定估值结论。</p></div>}
      {step === 3 && <div className="asset-materials"><p className="asset-hint">这里只记录材料名称及证明信息，不接收文件上传，不表示文件已经核验或权属有效。</p>{fields.materials.map((item, index) => <div className="asset-material" key={item.id}><h3>材料 {index + 1}</h3><div className="asset-fields"><label>材料类别<select value={item.category} onChange={event => changeMaterial(item.id, 'category', event.target.value)}><option value="">待确定</option><option>权属证明信息</option><option>控制关系信息</option><option>其他参考材料</option></select></label><label>材料名称<input value={item.name} onChange={event => changeMaterial(item.id, 'name', event.target.value)} /></label><label className="wide">已有证明信息或待补充说明<textarea value={item.reference} onChange={event => changeMaterial(item.id, 'reference', event.target.value)} /></label></div><button className="issuer-secondary" type="button" onClick={() => { setFields(current => ({ ...current, materials: current.materials.filter(record => record.id !== item.id) })); setDirty(true); }}>移除材料记录</button></div>)}<button className="issuer-secondary" type="button" onClick={() => { setFields(current => ({ ...current, materials: [...current.materials, { id: crypto.randomUUID(), category: '', name: '', reference: '' }] })); setDirty(true); }}>添加材料信息</button></div>}
      {step === 4 && <div className="asset-review"><h2>核对资产资料</h2><dl><div><dt>资产</dt><dd>{fields.name || '待补充'} · {fields.category || '类别待补充'}</dd></div><div><dt>控制主体</dt><dd>{fields.controller || '待补充'}</dd></div><div><dt>与当前企业关系</dt><dd>{fields.tenantRelation || '待补充'}</dd></div><div><dt>参考价值</dt><dd>{fields.referenceValue ? `${fields.referenceValue} ${fields.currency}` : '未填写'}</dd></div><div><dt>材料信息</dt><dd>{fields.materials.filter(item => item.name.trim()).map(item => item.name).join('、') || '待补充'}</dd></div></dl><h3>资料完整性结果</h3><p>{assetMissing(fields).length ? `仍需补充：${assetMissing(fields).join('、')}。` : '当前字段已较完整。'}</p><p className="asset-hint">这只是字段检查，不代表WDEX核验资料真实性、权属效力或真实发行资格。保存后仍为企业内部草稿。</p></div>}
    </fieldset>{similar && <p className="asset-warning" role="status">可能存在相似资产，请人工核对。系统不会自动合并不同权属关系的资产。</p>}{errors.length > 0 && <div className="asset-errors" role="alert">{errors.map(item => <p key={item}>{item}</p>)}</div>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}{relevantIntent?.status === 'unknown' && <p className="asset-warning">原保存申请结果待确认。请先查询原申请，当前不能再次保存。</p>}
    <div className="asset-actions"><button type="button" className="issuer-secondary" onClick={cancel}>取消</button>{step > 0 && <button type="button" className="issuer-secondary" onClick={() => { setErrors([]); setStep(value => value - 1); }}>上一步</button>}{step < 4 && <button type="button" className="issuer-secondary" onClick={next}>下一步</button>}<button type="submit" className="issuer-action" disabled={busy || relevantIntent?.status === 'unknown'}>{busy ? '正在保存…' : '保存草稿'}</button>{relevantIntent?.status === 'unknown' && <button type="button" className="issuer-action" disabled={busy} onClick={queryOriginal}>查询原保存申请</button>}</div></form>
    {asset && <p className="asset-hint">历史版本始终保留；本批尚无发行项目或发行轮次引用，不生成虚构关联。</p>}
  </section></div>;
}

const detailTabs = ['概览', '控制与权属', '关联权益结构/项目', '文件与材料', '版本与审核历史'] as const;
function AssetDetail({ tenant, query, asset }: Props & { asset: Asset }) {
  const controls = useDemoControls(state => state.controls);
  const [tab, setTab] = useState<(typeof detailTabs)[number]>('概览');
  const current = latest(asset);
  const fields = current.fields;
  return <div className="asset-page"><PageHead title="资产详情" tenant={tenant} query={query}><a className="issuer-secondary" href={href(assetRoot, query)}>返回资产库</a><button className="issuer-secondary" type="button" onClick={() => setTab('版本与审核历史')}>查看历史版本</button>{canWriteAssets(tenant) && asset.state !== 'archived' && <a className="issuer-action" href={href(`${assetRoot}/${asset.id}/edit`, query)}>编辑资产</a>}</PageHead>
    <section className="issuer-card asset-detail-head"><div><h2>{fields.name || '未命名资产'}</h2><p>{asset.number} · {fields.category || '类别待补充'} · {status(asset)}</p></div><div><span>当前版本 {current.number}</span><small>最近更新 {displayDate(current.savedAt)}</small></div></section>
    <nav className="asset-tabs" aria-label="资产详情">{detailTabs.map(item => <button type="button" key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => setTab(item)}>{item}</button>)}</nav>
    {tab === '概览' && <section className="issuer-card asset-detail"><h2>资产概览</h2><dl><div><dt>资产名称</dt><dd>{fields.name || '待补充'}</dd></div><div><dt>内部编号</dt><dd>{asset.number}</dd></div><div><dt>资产类别</dt><dd>{fields.category || '待补充'}</dd></div><div><dt>地区</dt><dd>{fields.region || '未填写'}</dd></div><div><dt>资产简述</dt><dd>{fields.summary || '未填写'}</dd></div><div><dt>参考价值</dt><dd>{fields.referenceValue ? `${fields.referenceValue} ${fields.currency}` : '未填写'}</dd></div><div><dt>参考日期与来源</dt><dd>{[fields.referenceDate, fields.valueSource].filter(Boolean).join(' · ') || '未填写'}</dd></div></dl><p className="asset-hint">资料由发行机构自行提供。参考价值不是Token价格、募集金额或法定估值结论。</p></section>}
    {tab === '控制与权属' && <section className="issuer-card asset-detail"><h2>控制与权属关系</h2><dl><div><dt>资产控制主体</dt><dd>{fields.controller || '待补充'}</dd></div><div><dt>主体类型或关系</dt><dd>{fields.controllerType || '待补充'}</dd></div><div><dt>与当前企业的关系</dt><dd>{fields.tenantRelation || '待补充'}</dd></div><div><dt>权属或控制说明</dt><dd>{fields.ownershipNote || '待补充'}</dd></div></dl><p className="asset-hint">发行机构对资料及其声明负责。WDEX仅提供字段、格式和版本管理，不实质核验资产权属或法律有效性。</p></section>}
    {tab === '关联权益结构/项目' && <section className="issuer-card asset-state"><h2>关联权益结构</h2>{(listInstruments(tenant) || []).filter(item => item.versions.some(version => version.fields.assetId === asset.id)).length ? <ul className="asset-material-list">{(listInstruments(tenant) || []).filter(item => item.versions.some(version => version.fields.assetId === asset.id)).map(item => <li key={item.id}><strong>{item.versions.at(-1)!.fields.name || '未命名权益结构'}</strong><span>{typeLabels[item.versions.at(-1)!.fields.type as 'debt' | 'spv'] || '类型待选择'} · {statusLabels[item.status]}</span><a href={href(`/issuer/instruments/${item.id}`, query)}>查看详情</a></li>)}</ul> : <p>当前资产尚无关联权益结构。</p>}<p className="asset-hint">发行项目管理尚未开放；关联资产不表示已完成法律审核或真实发行。</p></section>}
    {tab === '文件与材料' && <section className="issuer-card asset-detail"><h2>材料信息</h2>{fields.materials.length ? <ul className="asset-material-list">{fields.materials.map(item => <li key={item.id}><strong>{item.name || '待补充材料'}</strong><span>{item.category || '类别待确定'}</span><p>{item.reference || '证明信息待补充'}</p></li>)}</ul> : <p>权属资料仍待补充。</p>}<p className="asset-hint">这里只保存材料元数据；文件中心、真实上传、扫描、签署及专业意见尚未接入。</p></section>}
    {tab === '版本与审核历史' && <section className="issuer-card asset-detail"><h2>版本与保存历史</h2>{controls.assetHistory !== 'ready' ? <p role={controls.assetHistory === 'failed' ? 'alert' : 'status'}>{controls.assetHistory === 'loading' ? '正在读取版本记录…' : controls.assetHistory === 'failed' ? '版本记录暂不可用，请稍后查询。' : '版本查询结果待确认。'}</p> : <ol className="asset-version-list">{[...asset.versions].reverse().map(version => <li key={version.number}><strong>版本 {version.number}</strong><span>{displayDate(version.savedAt)} · 保存人 {version.savedBy}</span><p>{version.fields.name || '未命名资产'} · {version.fields.category || '类别待补充'} · {version.fields.controller || '控制主体待补充'}</p></li>)}</ol>}<p className="asset-hint">这里只记录企业内部保存历史，尚未建立内部审核结论；历史版本不可在本页修改，也不代表WDEX认证权属。</p></section>}
  </div>;
}

export function IssuerAssets(props: Props) {
  const readState = useDemoControls(state => state.controls.assetList);
  const path = location.pathname;
  const segments = path.split('/').filter(Boolean);
  const isNew = segments[2] === 'new';
  const assetId = !isNew && segments[2] ? decodeURIComponent(segments[2]) : '';
  const editing = segments[3] === 'edit';
  const asset = assetId ? findAsset(props.tenant, assetId) : null;
  useEffect(() => { document.title = `${isNew ? '新建资产' : assetId ? editing ? '编辑资产' : '资产详情' : '资产库'}｜WDEX SaaS`; }, [path, assetId, editing, isNew]);
  if (!canReadAssets(props.tenant)) return <NoAccess query={props.query} />;
  if (assetId && readState !== 'ready') return <section className="issuer-card asset-state" role={readState === 'failed' ? 'alert' : 'status'}><h1>{readState === 'loading' ? '正在加载资产…' : readState === 'failed' ? '资产详情暂不可用' : '资产详情结果待确认'}</h1><p>当前不展示未经确认的资产资料，请稍后查询原记录。</p><a className="issuer-secondary" href={href(assetRoot, props.query)}>返回资产库</a></section>;
  if (assetId && !asset) return <NoAccess query={props.query} />;
  if (isNew || editing) return <AssetEditor key={`${props.tenant.id}-${assetId || 'new'}`} {...props} asset={asset || undefined} />;
  if (asset) return <AssetDetail {...props} asset={asset} />;
  return <AssetLibrary {...props} />;
}
