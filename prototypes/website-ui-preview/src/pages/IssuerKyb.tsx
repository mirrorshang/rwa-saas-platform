import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getKybCase, getKybDraft, kybCountryOptions, kybEntityOptions, saveKybDraft, submitKybVersion, validateKybSubmission, type KybDraft, type MockMaterial, type SavedKybDraft } from '../issuerB04Demo';
import { CommercialBoundary, CommercialFlow, CommercialIntro, FactRows } from './IssuerCommercialShared';

type Outcome = 'reviewing' | 'unknown' | 'failed' | 'conflict';
const materials = ['营业登记证明（演示）', '签约授权说明（演示）', '受益控制说明（演示）'];
const fields: [keyof KybDraft, string, string][] = [
  ['legalName', '法定企业名称', '送审必填；可与工作台显示名称不同。'],
  ['displayName', '企业显示名称', '仅供识别，不判断法定主体一致。'],
  ['country', '注册国家或地区', '法域材料要求待核，不设置全球统一格式。'],
  ['entityType', '企业类别', '填写企业自身的类别描述；不推断许可。'],
  ['registrationId', '登记编号', '格式及适用必填条件待当地规则核实。'],
  ['address', '注册地址', '请输入用于商业核验的地址草稿。'],
  ['contactEmail', '联系邮箱', '仅检查基本邮箱格式，不发送邮件。'],
  ['contactRole', '联系人职责', '联系人不自动具有签约权。'],
  ['representative', '签约代表', '身份和代表权仍需外部核实。'],
  ['authority', '授权依据', '描述证据来源，不代表授权已获证实。'],
  ['beneficialControl', '受益控制声明（适用时）', '是否适用及比例由实际法域规则决定。'],
];
export function IssuerKyb({ tenant, onDirtyChange, onRequestDiscard }: {
  tenant: DemoTenant; onDirtyChange: (dirty: boolean) => void; onRequestDiscard: (action: () => void) => void;
}) {
  const [saved, setSaved] = useState<SavedKybDraft>(() => getKybDraft(tenant));
  const [draft, setDraft] = useState<SavedKybDraft>(saved);
  const [caseRecord, setCaseRecord] = useState(() => getKybCase(tenant));
  const [editing, setEditing] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>('reviewing');
  const [uploadOutcome, setUploadOutcome] = useState<'success' | 'failed'>('success');
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'failed'>('idle');
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<(keyof KybDraft)[]>([]);
  const [dialog, setDialog] = useState<'preview' | 'confirm' | null>(null);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const canManage = tenant.role === '企业管理员' && tenant.canSubscribe;
  const canSubmit = !caseRecord || caseRecord.status === 'supplement';
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(saved);
  useLayoutEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useEffect(() => {
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector('button')?.focus();
    return () => previous?.focus();
  }, [dialog]);

  const setField = (key: keyof KybDraft, value: string) => { if (!pendingRef.current) setDraft(previous => ({ ...previous, value: { ...previous.value, [key]: value } })); };
  const save = () => {
    if (pendingRef.current) return;
    const next = { ...draft, savedAt: Date.now() };
    if (!saveKybDraft(tenant, next)) { setMessage('当前角色无权保存商业KYB草稿。'); return; }
    setSaved(next); setDraft(next); setEditing(false); setMessage('本地Mock草稿已保存，尚未提交商业KYB审核。');
  };
  const cancel = () => {
    if (pendingRef.current) return;
    const discard = () => { setDraft(saved); setEditing(false); setErrors([]); setMessage('未保存修改已放弃。'); };
    if (dirty) onRequestDiscard(discard); else discard();
  };
  const beginSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (pendingRef.current) return;
    const validation = validateKybSubmission(draft);
    setErrors(validation.invalidFields);
    if (validation.invalidFields.length) { setMessage('请核对标记字段；演示选项不代表正式法域批准。'); document.querySelector<HTMLElement>('.issuer-kyb-form [aria-invalid="true"]')?.focus(); return; }
    if (validation.blockers.length) { setMessage(`当前申请仍缺必要资料或适用规则：${validation.blockers.join(' ')}`); return; }
    if (!canSubmit) { setMessage('原申请仍在；请先查看原Case结果，不重复建立申请。'); return; }
    setDialog('confirm');
  };
  const upload = () => {
    if (!editing || !canManage || pendingRef.current) return;
    setUploadState('uploading');
    window.setTimeout(() => {
      if (uploadOutcome === 'failed') { setUploadState('failed'); setMessage('模拟上传失败，可在原草稿中重试；未传输真实文件。'); return; }
      const previous = draft.materials.find(item => item.name === selectedMaterial);
      const item: MockMaterial = { name: selectedMaterial, version: (previous?.version || 0) + 1, status: '模拟已上传' };
      setDraft(current => ({ ...current, materials: [...current.materials.filter(entry => entry.name !== selectedMaterial), item] }));
      setUploadState('idle'); setMessage('演示材料已加入本地草稿；未上传真实文件，未经核验。');
    }, 350);
  };
  const confirm = () => {
    if (pendingRef.current || !canManage || !canSubmit) return;
    const snapshot: SavedKybDraft = { ...draft, value: { ...draft.value }, materials: draft.materials.map(item => ({ ...item })) };
    const validation = validateKybSubmission(snapshot);
    if (validation.invalidFields.length || validation.blockers.length) { setDialog(null); setErrors(validation.invalidFields); setMessage(`提交前核验未通过：${validation.blockers.join(' ') || '请检查标记字段。'}`); return; }
    const selectedOutcome = outcome;
    pendingRef.current = true;
    setDialog(null); setPending(true); setMessage('模拟提交处理中；重复提交已禁用。');
    window.setTimeout(() => {
      const next = submitKybVersion(tenant, snapshot, selectedOutcome);
      pendingRef.current = false;
      setPending(false);
      if (selectedOutcome === 'failed' || selectedOutcome === 'conflict') { setMessage(selectedOutcome === 'failed' ? 'Mock提交失败，当前编辑内容保留；未创建新Case。' : 'Mock版本冲突，当前编辑内容保留；未创建新版本。'); return; }
      if (!next) { setMessage('提交未完成，编辑内容仍保留；请检查当前企业权限与适用规则。'); return; }
      setCaseRecord(next); setSaved(snapshot); setDraft(snapshot); setEditing(false);
      setMessage(selectedOutcome === 'unknown' ? 'Mock提交结果未知；原Case已保留，请到I-06查询，不得重复创建。' : 'Mock版本已提交至原Case；这不代表商业KYB审核通过。');
    }, 450);
  };
  return <>
    <CommercialIntro number="I-05" title="商业KYB资料" tenant={tenant} />
    <CommercialFlow current={paths.issuerKyb} />
    <section className="issuer-card issuer-intent"><h2>当前企业与申请摘要</h2><FactRows rows={[
      ['当前Tenant', tenant.name], ['原Mock Case', caseRecord?.id.slice(0, 12) || '尚未提交'],
      ['申请状态', caseRecord ? ({ reviewing: 'Mock审核中', supplement: 'Mock需补件', rejected: 'Mock未通过', unknown: 'Mock结果未知' })[caseRecord.status] : '未提交'],
      ['资料来源', '首次预填自I-02商业资料草稿；后续独立保存'],
    ]} /><CommercialBoundary /></section>
    {canManage ? <section className="issuer-card issuer-commercial-section"><div className="issuer-card-head"><div><h2>商业身份草稿</h2><p>草稿独立于I-02与已提交版本；名称相似不能证明法人身份相同。</p></div>{!editing && <button className="issuer-action" onClick={() => { setDraft(saved); setEditing(true); setMessage(''); }}>编辑草稿</button>}</div>
      {editing ? <form className="issuer-kyb-form" onSubmit={beginSubmit} noValidate><fieldset disabled={pending} className="issuer-kyb-fieldset"><div className="issuer-form-grid">{fields.map(([key, label, hint]) => <label className="issuer-field" key={key}>{label}{key === 'country' ? <select value={draft.value.country} onChange={event => setField(key, event.target.value)} aria-invalid={errors.includes(key)}><option value="">请选择演示地区</option>{draft.value.country && !kybCountryOptions.some(option => option.value === draft.value.country) && <option value={draft.value.country}>原草稿地区：{draft.value.country}（未配置）</option>}{kybCountryOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : key === 'entityType' ? <select value={draft.value.entityType} onChange={event => setField(key, event.target.value)} aria-invalid={errors.includes(key)}><option value="">请选择演示类别</option>{draft.value.entityType && !kybEntityOptions.some(option => option === draft.value.entityType) && <option value={draft.value.entityType}>原草稿类别：{draft.value.entityType}（未配置）</option>}{kybEntityOptions.map(option => <option key={option} value={option}>{option}</option>)}</select> : <input value={draft.value[key]} onChange={event => setField(key, event.target.value)} aria-invalid={errors.includes(key)} aria-describedby={errors.includes(key) ? `kyb-error-${key}` : undefined} />}{errors.includes(key) && <small className="issuer-field-error" id={`kyb-error-${key}`}>请填写或核对{label}。</small>}<small>{hint}</small></label>)}</div>
        <div className="issuer-commercial-upload"><h3>材料清单与上传区域</h3><p>只选择内置演示材料名称；不接受或传输真实敏感文件。格式、大小及适用清单待法域规则确定。</p><label>模拟选择材料 <select value={selectedMaterial} onChange={event => setSelectedMaterial(event.target.value)}>{materials.map(name => <option key={name}>{name}</option>)}</select></label><label>Mock上传结果 <select value={uploadOutcome} onChange={event => setUploadOutcome(event.target.value as 'success' | 'failed')}><option value="success">模拟成功</option><option value="failed">模拟失败</option></select></label><button type="button" className="issuer-secondary" disabled={uploadState === 'uploading'} onClick={upload}>{uploadState === 'uploading' ? '模拟上传中…' : '模拟上传 / 重试'}</button>{uploadState === 'uploading' && <progress aria-label="模拟上传进度" value={50} max={100} />}{uploadState === 'failed' && <p role="alert">模拟上传失败，草稿未改变。</p>}</div>
        <ul className="issuer-simple-list">{draft.materials.map(item => <li key={item.name}>{item.name} · v{item.version} · {item.status}</li>)}</ul>
        <p className="issuer-note">登记编号适用条件与必要材料清单尚未获批；当前只能保存演示草稿，不能建立新Mock Case。</p>
        <div className="issuer-form-actions"><button type="button" className="issuer-secondary" onClick={save}>保存草稿</button><button type="button" className="issuer-secondary" onClick={() => setDialog('preview')}>预览草稿</button><button type="submit" className="issuer-action" disabled={!canSubmit}>{caseRecord?.status === 'supplement' ? '预览并提交补件' : '预览并提交Mock申请'}</button><button type="button" className="issuer-link" onClick={cancel}>取消编辑</button>{dirty && <span>有未保存的更改</span>}</div>
        <label className="issuer-mock-select">Mock提交结果 <select value={outcome} onChange={event => setOutcome(event.target.value as Outcome)}><option value="reviewing">模拟审核中</option><option value="unknown">结果未知</option><option value="failed">提交失败</option><option value="conflict">版本冲突</option></select></label>
      </fieldset></form> : <FactRows rows={fields.map(([key, label]) => [label, key === 'registrationId' ? (saved.value[key] ? '已保存演示草稿（编号已隐藏）' : '尚未填写') : saved.value[key] || '尚未填写'])} />}
    </section> : <section className="issuer-card issuer-commercial-section"><h2>只读访问</h2><p>当前角色没有商业KYB草稿管理权；仅显示申请状态，不展示登记号、联系人或材料内容。</p></section>}
    <section className="issuer-card issuer-commercial-section"><h2>材料版本与提交历史</h2>{caseRecord ? <ol className="issuer-simple-list">{caseRecord.versions.map(version => <li key={version.number}>Mock版本 v{version.number} · {new Date(version.submittedAt).toLocaleString('zh-CN')} · {version.materials.length} 项模拟材料；旧版只读保留</li>)}</ol> : <p>暂无已提交版本；保存草稿不创建Case。</p>}{caseRecord && !canSubmit && <p>原Case已存在。结果未知或审核中时不得重复提交；请先查看原申请。</p>}</section>
    <div className="issuer-quicklinks"><a href={paths.issuerKybReview + '?demo=1'}>查看原申请与审核进度 →</a><a href={paths.issuerUpgrade + '?demo=1'}>返回升级总览 →</a></div>
    {message && <p className="issuer-feedback" role="status">{message}</p>}
    {dialog && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-labelledby="kyb-dialog-title" ref={dialogRef} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); setDialog(null); return; }
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
      if (!buttons?.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
    }}><h2 id="kyb-dialog-title">{dialog === 'confirm' ? '确认提交当前Mock版本？' : '商业KYB草稿预览'}</h2><p>当前企业：{tenant.name}；法定名称草稿：{draft.value.legalName || '未填写'}；模拟材料：{draft.materials.length} 项。</p><p>{dialog === 'confirm' ? '提交后旧版本只读保留；提交不代表审核通过。是否提交当前版本供商业KYB演示审核？' : '此预览不是法定身份核实，也不会生成正式材料。'}</p><div><button type="button" className="issuer-secondary" onClick={() => setDialog(null)}>返回编辑</button>{dialog === 'confirm' && <button type="button" className="issuer-action" onClick={confirm} disabled={pending}>确认模拟提交</button>}</div></div></div>}
  </>;
}
