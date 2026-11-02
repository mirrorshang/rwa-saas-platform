import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react';
import { type DemoTenant } from '../issuerDemo';
import { getProfileDraft, saveProfileDraft, getUpgradeIntent } from '../issuerB03Demo';
import { getKybCase, getKybDraft, kybCountryOptions, kybEntityOptions, saveKybDraft, validateKybSubmission, getCommercialPreview, type KybDraft, type SavedKybDraft } from '../issuerB04Demo';
import { useDemoControls } from '../demoControls';

type Props = { tenant: DemoTenant; onDirtyChange: (dirty: boolean) => void; onRequestDiscard: (action: () => void) => void };
const countries: Record<string, string> = { HK: '中国香港', SG: '新加坡', GB: '英国', US: '美国' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IssuerInfo({ tenant, onDirtyChange, onRequestDiscard }: Props) {
  const [saved, setSaved] = useState(() => getProfileDraft(tenant));
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const outcome = useDemoControls(state => state.controls.profile);
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(saved);
  useLayoutEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const cancel = () => { const leave = () => { setDraft(saved); setEditing(false); setMessage(''); }; if (dirty) onRequestDiscard(leave); else leave(); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = { ...draft, displayName: draft.displayName.trim(), contactEmail: draft.contactEmail.trim(), description: draft.description.trim() };
    if (!next.displayName || [...next.displayName].length > 80) { setMessage('企业名称须为1～80个字符。'); return; }
    if (!emailPattern.test(next.contactEmail)) { setMessage('请输入有效的企业联系邮箱。'); return; }
    if (outcome !== 'saved') { setMessage(outcome === 'unknown' ? '保存结果待确认，您填写的信息已保留。' : outcome === 'conflict' ? '资料版本已变化，请核对后重试。' : '保存失败，您填写的信息已保留。'); return; }
    if (!saveProfileDraft(tenant, next)) { setMessage('您没有修改企业信息的权限。'); return; }
    setSaved(next); setDraft(next); setEditing(false); setMessage('企业信息已保存。');
  };
  return <section className="issuer-card mvp-settings-card"><div className="issuer-card-head"><div><h2>企业信息</h2><p>管理企业工作台的基本资料。</p></div>{tenant.role === '企业管理员' && !editing && <button className="issuer-action" onClick={() => setEditing(true)}>编辑</button>}</div>
    {editing ? <form onSubmit={save} className="mvp-settings-form"><label>企业名称<input value={draft.displayName} maxLength={80} onChange={event => setDraft({ ...draft, displayName: event.target.value })} /></label><label>注册国家或地区<input value={countries[tenant.country] || tenant.country} readOnly /></label><label>企业联系邮箱<input type="email" value={draft.contactEmail} onChange={event => setDraft({ ...draft, contactEmail: event.target.value })} /></label><label>基础业务信息<textarea value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} maxLength={500} /></label><div className="issuer-form-actions"><button className="issuer-action" type="submit">保存</button><button className="issuer-secondary" type="button" onClick={cancel}>取消</button></div></form> : <dl className="issuer-facts"><div><dt>企业名称</dt><dd>{saved.displayName || tenant.name}</dd></div><div><dt>注册国家或地区</dt><dd>{countries[tenant.country] || tenant.country}</dd></div><div><dt>企业联系邮箱</dt><dd>{saved.contactEmail || tenant.contactEmail}</dd></div><div><dt>基础业务信息</dt><dd>{saved.description || '尚未填写'}</dd></div></dl>}
    {tenant.role !== '企业管理员' && <p>您可以查看企业信息，修改请联系企业管理员。</p>}{message && <p className="issuer-feedback" role="status">{message}</p>}
  </section>;
}

const kybFields: [keyof KybDraft, string][] = [
  ['legalName', '法定企业名称'], ['displayName', '企业显示名称'], ['country', '注册地区'], ['entityType', '企业类别'],
  ['registrationId', '登记编号'], ['address', '注册地址'], ['contactEmail', '联系邮箱'], ['contactRole', '联系人职责'],
  ['representative', '签约代表'], ['authority', '授权依据'], ['beneficialControl', '受益控制声明（适用时）'],
];
export function IssuerCertification({ tenant, onDirtyChange, onRequestDiscard }: Props) {
  const [saved, setSaved] = useState<SavedKybDraft>(() => getKybDraft(tenant));
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('营业登记证明');
  const controls = useDemoControls(state => state.controls);
  const record = getKybCase(tenant);
  const dirty = editing && JSON.stringify(saved) !== JSON.stringify(draft);
  useLayoutEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const status = record?.status || null;
  const statusLabels = { reviewing: '审核中', supplement: '需要补件', rejected: '审核未通过', unknown: '结果待确认', 'passed-preview': '认证完成' };
  const update = (key: keyof KybDraft, value: string) => setDraft(previous => ({ ...previous, value: { ...previous.value, [key]: value } }));
  const save = (event: FormEvent) => { event.preventDefault(); const next = { ...draft, savedAt: Date.now() }; if (!saveKybDraft(tenant, next)) { setMessage('您没有保存企业认证资料的权限。'); return; } setSaved(next); setDraft(next); setEditing(false); setMessage('认证资料已保存。'); };
  const cancel = () => { const leave = () => { setDraft(saved); setEditing(false); setMessage(''); }; if (dirty) onRequestDiscard(leave); else leave(); };
  const previewSubmit = () => { const check = validateKybSubmission(draft); setMessage(check.invalidFields.length ? '请完善必填资料。' : check.blockers.join(' ') || '当前申请可进入提交确认。'); };
  const upload = () => { if (controls.kybUpload === 'failed') { setMessage('材料上传失败，请重试。'); return; } const previous = draft.materials.find(item => item.name === selectedMaterial); setDraft({ ...draft, materials: [...draft.materials.filter(item => item.name !== selectedMaterial), { name: selectedMaterial, version: (previous?.version || 0) + 1, status: '模拟已上传' }] }); setMessage('材料已加入待提交资料。'); };
  return <div className="mvp-settings-stack"><section className="issuer-card mvp-settings-card"><div className="issuer-card-head"><div><h2>企业认证</h2><p>{status ? statusLabels[status] : '暂无企业认证申请'}</p></div>{tenant.role === '企业管理员' && !editing && (!record || record.status === 'supplement') && <button className="issuer-action" onClick={() => setEditing(true)}>{record ? '补充资料' : '填写认证资料'}</button>}</div>
    {controls.kybRead === 'loading' && <p role="status">正在查询原申请…</p>}{controls.kybRead === 'failed' && <p role="alert">原申请暂时无法读取，请稍后重试。</p>}{controls.kybRead === 'unknown' && <p role="status">原申请查询结果待确认，请勿重复提交。</p>}
    {record && controls.kybRead === 'ready' && <dl className="issuer-facts"><div><dt>申请状态</dt><dd>{statusLabels[record.status]}</dd></div><div><dt>最近提交</dt><dd>{new Date(record.versions.at(-1)!.submittedAt).toLocaleString('zh-CN')}</dd></div><div><dt>材料版本</dt><dd>{record.versions.length}</dd></div></dl>}
    {status === 'unknown' && <p>操作结果待确认，请查询原申请，勿重复提交。</p>}{status === 'supplement' && <p>请在原申请下补充所需材料。</p>}{status === 'rejected' && <p>认证未通过。请联系支持了解可披露的后续步骤。</p>}
    {editing && <form className="mvp-settings-form" onSubmit={save}><div className="mvp-kyb-grid">{kybFields.map(([key, label]) => <label key={key}>{label}{key === 'country' ? <select value={draft.value.country} onChange={event => update(key, event.target.value)}><option value="">请选择</option>{kybCountryOptions.map(item => <option key={item.value} value={item.value}>{item.label.replace('（演示资料）', '')}</option>)}</select> : key === 'entityType' ? <select value={draft.value.entityType} onChange={event => update(key, event.target.value)}><option value="">请选择</option>{kybEntityOptions.map(item => <option key={item} value={item}>{item.replace('（演示分类）', '')}</option>)}</select> : <input value={draft.value[key]} onChange={event => update(key, event.target.value)} type={key === 'contactEmail' ? 'email' : 'text'} />}</label>)}</div><div className="mvp-materials"><h3>证明材料</h3><label>材料类别<select value={selectedMaterial} onChange={event => setSelectedMaterial(event.target.value)}><option>营业登记证明</option><option>签约授权说明</option><option>受益控制说明</option></select></label><button className="issuer-secondary" type="button" onClick={upload}>添加材料</button><ul>{draft.materials.map(item => <li key={item.name}>{item.name.replace('（演示）', '')} · 版本 {item.version}</li>)}</ul></div><div className="issuer-form-actions"><button className="issuer-action" type="submit">保存资料</button><button className="issuer-secondary" type="button" onClick={previewSubmit}>核对提交条件</button><button className="issuer-secondary" type="button" onClick={cancel}>取消</button></div></form>}
    {!editing && !record && <p>请先填写认证资料。您可以保存草稿；适用材料要求确定后才可提交申请。</p>}{message && <p className="issuer-feedback" role="status">{message}</p>}
  </section>{record && <section className="issuer-card mvp-settings-card"><button className="issuer-link" aria-expanded={showHistory} onClick={() => setShowHistory(!showHistory)}>{showHistory ? '收起申请历史' : '查看申请历史'}</button>{showHistory && <><h3>材料版本</h3><ol>{record.versions.map(version => <li key={version.number}>版本 {version.number} · {version.materials.map(item => item.name.replace('（演示）', '')).join('、') || '暂无材料'}</li>)}</ol><h3>状态记录</h3><ol>{record.events?.map((event, index) => <li key={index}>{event.kind === 'submission' ? `提交版本 ${event.version}` : statusLabels[event.status]}</li>)}</ol></>}</section>}</div>;
}

export function IssuerPlan({ tenant }: { tenant: DemoTenant }) {
  const [confirming, setConfirming] = useState(false);
  const controls = useDemoControls(state => state.controls);
  const intent = getUpgradeIntent(tenant);
  const preview = getCommercialPreview(tenant);
  const paymentLabels = { unavailable: '暂无账单', unknown: '付款结果待确认', observed: '交易已观察', matching: '实收待核实', matched: '核款已确认' };
  const entitlementLabels = { unavailable: '未开通', pending: '权益开通中', 'activated-preview': '已开通' };
  const payment = controls.payment === 'unavailable' ? preview.payment : controls.payment;
  const entitlement = tenant.plan === 'Standard' ? (controls.entitlement === 'pending' ? 'pending' : 'activated-preview') : (controls.entitlement === 'pending' ? 'pending' : 'unavailable');
  const upgradeLabels = { preparing: '准备中', processing: '处理中', failed: '申请未完成', unknown: '结果待确认', 'mock-complete': '权益状态待核实' };
  const upgradeStatus = intent?.status || controls.upgrade;
  const billingMessage = controls.billingRead === 'loading' ? '正在查询账单…' : controls.billingRead === 'failed' ? '账单暂时无法读取，请稍后重试。' : controls.billingRead === 'unknown' ? '账单查询结果待确认，请勿重复付款。' : '暂无账单';
  return <div className="mvp-settings-stack"><section className="issuer-card mvp-settings-card"><div className="issuer-card-head"><div><h2>订阅管理</h2><p>{tenant.name} · {tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'}</p></div></div><dl className="issuer-facts"><div><dt>当前套餐</dt><dd>{tenant.plan}</dd></div><div><dt>订阅状态</dt><dd>{intent?.status === 'unknown' ? '结果待确认' : tenant.plan === 'Free' ? '永久免费' : '已开通'}</dd></div><div><dt>账期与价格</dt><dd>待公布</dd></div></dl><div className="mvp-plan-compare"><div><h3>Free Sandbox</h3><p>永久免费，用于准备和测试。不支持真实发行或募集资金。</p></div><div><h3>Standard</h3><p>商业订阅权益。生产能力仍须符合业务审核及准入要求。</p></div></div>{tenant.plan === 'Free' && tenant.canSubscribe && <button className="issuer-action" onClick={() => setConfirming(!confirming)}>升级到 Standard</button>}{!tenant.canSubscribe && <p>您没有管理本企业订阅的权限。</p>}</section>
    {confirming && <section className="issuer-card mvp-settings-card"><h2>确认升级</h2><dl className="issuer-facts"><div><dt>当前企业</dt><dd>{tenant.name}</dd></div><div><dt>套餐</dt><dd>Standard</dd></div><div><dt>价格与周期</dt><dd>待正式公布</dd></div></dl><p>SaaS服务协议尚未发布，当前无法提交升级申请。<a href="/policies/terms" target="_blank" rel="noreferrer">查看服务条款状态</a></p><label className="mvp-check"><input type="checkbox" disabled />我已阅读并同意《WDEX SaaS服务协议》</label><button className="issuer-action" disabled>提交升级申请</button></section>}
    <section className="issuer-card mvp-settings-card"><h2>付款与账单</h2>{intent ? <p role="status">升级申请：{upgradeLabels[upgradeStatus]}</p> : controls.upgrade !== 'preparing' && <p role="status">暂无升级申请。</p>}{controls.contract !== 'unpublished' && <p role="status">服务协议尚未发布，暂不能确认签署状态。</p>}<dl className="issuer-facts"><div><dt>付款状态</dt><dd>{paymentLabels[payment]}</dd></div><div><dt>商业权益</dt><dd>{entitlementLabels[entitlement]}</dd></div></dl>{payment === 'unknown' && <p>付款结果待确认，请勿重复付款。</p>}<p role={controls.billingRead === 'failed' ? 'alert' : 'status'}>{billingMessage}</p><h3>订阅历史</h3><p>暂无订阅记录</p></section></div>;
}
