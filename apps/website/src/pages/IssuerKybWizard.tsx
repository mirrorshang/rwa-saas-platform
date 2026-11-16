import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { exampleKybValue, getKybRecord, saveKybRecord, setKybReview, submitKyb, validateKybRecord, type KybError, type KybMaterial, type KybPerson, type KybState, type KybValue } from '../issuerKybFlow';
import { countryOptions } from '../countries';

const steps = ['企业基本信息', '企业业务信息', '企业关联人员', '企业证明材料', '预览与确认提交'];
const entityTypes = ['有限责任公司', '股份有限公司', '合伙企业', '基金或投资主体', '其他'];
const industries = ['房地产', '金融与投资管理', '贸易与供应链', '能源与基础设施', '科技与专业服务', '工业制造', '其他'];
const materialKinds = [
  ['registration', '企业注册证明或营业执照', '常规必填'],
  ['control', '股权或控制关系证明', '按审核要求'],
  ['authority', '企业授权证明', '按情况提供'],
  ['license', '行业许可证明', '声称已持牌时必填'],
  ['other', '其他补充材料', '选填'],
] as const;
const statusLabel = { draft: '待完成', submitted: '已提交', reviewing: '审核中', supplement: '待补件', rejected: '未通过', passed: '已通过' };

export function IssuerKybWizard({ tenant, onStatusChange }: { tenant: DemoTenant; onStatusChange?: () => void }) {
  const [record, setRecord] = useState(() => getKybRecord(tenant));
  const [errors, setErrors] = useState<KybError[]>([]);
  const [notice, setNotice] = useState('');
  const [fileView, setFileView] = useState<KybMaterial | null>(null);
  const editable = ['draft', 'supplement', 'rejected'].includes(record.status);
  const value = record.value;
  useEffect(() => { if (editable) saveKybRecord(tenant, record); }, [tenant, record, editable]);
  const change = <K extends keyof KybValue>(key: K, next: KybValue[K]) => {
    setRecord(previous => ({ ...previous, value: { ...previous.value, [key]: next,
      ...(key === 'uboPath' ? { people: previous.value.people.map(item => ({ ...item, method: next === 'other' ? 'other' as const : item.method === 'other' ? 'direct' as const : item.method })) } : {}) }, savedAt: Date.now() }));
    setErrors(previous => previous.filter(item => item.field !== key)); setNotice('草稿已自动保存');
  };
  const message = (field: string) => errors.find(item => item.field === field)?.message;
  const field = (key: keyof KybValue, label: string, placeholder: string, optional = false, multiline = false) => <label className="kyb-field" htmlFor={`kyb-${key}`} key={key}>
    <span>{label} <small>{optional ? '选填' : '必填'}</small></span>
    {multiline ? <textarea id={`kyb-${key}`} value={String(value[key])} placeholder={placeholder} onChange={event => change(key, event.target.value)} aria-invalid={!!message(key)} /> : <input id={`kyb-${key}`} value={String(value[key])} placeholder={placeholder} onChange={event => change(key, event.target.value)} aria-invalid={!!message(key)} />}
    {message(key) && <em role="alert">{message(key)}</em>}
  </label>;
  const select = (key: keyof KybValue, label: string, choices: readonly (readonly [string, string])[], optional = false) => <label className="kyb-field" htmlFor={`kyb-${key}`} key={key}>
    <span>{label} <small>{optional ? '选填' : '必填'}</small></span><select id={`kyb-${key}`} value={String(value[key])} onChange={event => change(key, event.target.value)} aria-invalid={!!message(key)}><option value="">请选择</option>{choices.map(([id, text]) => <option value={id} key={id}>{text}</option>)}</select>{message(key) && <em role="alert">{message(key)}</em>}
  </label>;
  const updatePerson = (index: number, key: keyof KybPerson, next: string) => change('people', value.people.map((item, at) => at === index ? { ...item, [key]: next } : item));
  const addPerson = () => change('people', [...value.people, { id: crypto.randomUUID(), name: '', method: 'direct', share: '', explanation: '' }]);
  const upload = (kind: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) { setNotice('文件格式不支持，请选择 PDF、JPG 或 PNG。'); event.target.value = ''; return; }
    if (file.size > 20 * 1024 * 1024) { setNotice('单个文件不能超过 20MB。'); event.target.value = ''; return; }
    const old = value.materials.find(item => item.kind === kind);
    change('materials', [...value.materials.filter(item => item.kind !== kind), { kind, fileName: file.name, mime: file.type, size: file.size, addedAt: Date.now(), version: (old?.version || 0) + 1, status: 'ready' }]);
    setNotice('文件已加入认证资料。'); event.target.value = '';
  };
  const fillExample = () => {
    const example = exampleKybValue(tenant);
    const merged = { ...value };
    for (const key of Object.keys(example) as (keyof KybValue)[]) {
      const current = value[key];
      if (key === 'people' && value.people.every(item => !item.name.trim())) merged.people = example.people;
      else if (key === 'materials' && !value.materials.some(item => item.kind === 'registration')) merged.materials = [...value.materials, ...example.materials];
      else if (typeof current === 'string' && !current.trim()) (merged as unknown as Record<string, unknown>)[key] = example[key];
    }
    setRecord(previous => ({ ...previous, value: merged, savedAt: Date.now() })); setNotice('示例信息已填入空白字段，可继续编辑。'); setErrors([]);
  };
  const go = (step: number) => { setRecord(previous => ({ ...previous, step, value: step === 4 && previous.step !== 4 ? { ...previous.value, truthful: false, authorized: false } : previous.value })); setErrors([]); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const next = () => {
    const currentErrors = validateKybRecord(record).filter(item => item.step === record.step);
    if (currentErrors.length) { setErrors(currentErrors); setNotice('请先完善本步骤的必填信息。'); return; }
    go(Math.min(4, record.step + 1));
  };
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (record.step !== 4) { next(); return; }
    const all = validateKybRecord(record);
    if (all.length) { setErrors(all); go(all[0].step); setErrors(all); setNotice('请检查标出的字段和材料。'); return; }
    const submitted = submitKyb(tenant, record);
    if (!submitted) { setNotice('提交未完成，请核对资料后重试。'); return; }
    setRecord(submitted); setNotice('企业认证资料已提交。'); onStatusChange?.();
  };
  const review = (status: Exclude<KybState, 'draft' | 'submitted'>) => {
    const note = status === 'supplement' ? '请补充企业注册证明。' : status === 'rejected' ? '请核对注册地址。' : '';
    if (!setKybReview(tenant, status, note)) { setNotice('请先提交企业认证资料。'); return; }
    setRecord(getKybRecord(tenant)); setErrors([]); setNotice('审核状态已更新。'); onStatusChange?.();
  };
  const reviewFocus = () => go(/注册地址|法定名称|注册编号|企业类型/.test(record.reviewNotes) ? 0 : /业务信息|主营业务|行业/.test(record.reviewNotes) ? 1 : /代表|联系人|持股|实际控制人/.test(record.reviewNotes) ? 2 : /文件|证明|许可|执照/.test(record.reviewNotes) ? 3 : 0);
  return <section className="issuer-card kyb-wizard">
    <div className="kyb-head"><div><p className="issuer-home-kicker">企业资料与认证</p><h2>企业认证</h2><p>按步骤填写并核对资料。</p></div><span className="kyb-status">{statusLabel[record.status]}</span></div>
    {record.reviewNotes && <div className="kyb-review-note" role="status"><strong>审核意见</strong><p>{record.reviewNotes}</p>{editable && <button type="button" onClick={reviewFocus}>定位待补内容</button>}</div>}
    {!editable ? <div className="kyb-result"><h3>{record.status === 'passed' ? '企业认证已通过' : record.status === 'reviewing' ? '资料正在审核' : '资料已提交'}</h3><p>{record.status === 'passed' ? 'Free 企业业务资料准备能力已开放。真实发行仍需完成适用准入。' : '可查看本次提交记录，审核状态更新后将在此显示。'}</p>{record.status === 'passed' && <a className="issuer-action" href="/issuer?demo=1">返回工作台</a>}</div> : <>
      <ol className="kyb-steps" aria-label="企业认证步骤">{steps.map((name, index) => <li key={name} className={index === record.step ? 'current' : index < record.step ? 'done' : ''}><button type="button" aria-current={index === record.step ? 'step' : undefined} onClick={() => go(index)}><b>{index + 1}</b><span>{name}</span></button></li>)}</ol>
      <form noValidate onSubmit={submit}><div className="kyb-step-head"><span>第 {record.step + 1} 步，共 5 步</span><h3>{steps[record.step]}</h3></div>
        {record.step === 0 && <div className="kyb-grid">{field('legalName', '企业法定名称', '与注册证明一致的名称')}{select('entityType', '企业类型', entityTypes.map(item => [item, item] as const))}{value.entityType === '其他' && field('entityOther', '企业类型说明', '请写明具体类型')}{select('country', '注册国家或地区', countryOptions.map(item => [item.code, item.name] as const))}{field('registrationId', '企业注册编号', '请输入登记编号')}{field('address', '注册地址', '请输入完整注册地址', false, true)}{field('website', '企业官网', 'https://example.com', true)}</div>}
        {record.step === 1 && <div className="kyb-grid">{select('industry', '所属行业', industries.map(item => [item, item] as const))}{value.industry === '其他' && field('industryOther', '行业说明', '请写明具体行业')}{field('business', '主营业务简介', '简要描述主营业务', false, true)}{select('regulated', '是否从事受监管金融业务', [['yes', '是'], ['no', '否'], ['unsure', '不确定']])}{value.regulated === 'yes' && select('licenseStatus', '监管许可情况', [['licensed', '已持牌'], ['exempt', '豁免'], ['pending', '申请中'], ['none', '尚未取得'], ['unknown', '不确定']])}{value.licenseStatus === 'licensed' && value.regulated === 'yes' && <>{field('licenseAuthority', '监管机构', '请输入监管机构名称')}{field('licenseNumber', '许可证编号', '请输入许可证编号')}</>}</div>}
        {record.step === 2 && <div className="kyb-people"><h4>企业授权代表</h4><div className="kyb-grid">{field('representativeName', '姓名', '请输入姓名')}{field('representativeTitle', '职务', '例如：董事')}{select('representativeAuthority', '授权依据', [['registry', '登记或法定代表权限'], ['special', '专项授权']])}</div><h4>实际控制人识别</h4>{select('uboPath', '识别方式', [['share', '通过持股识别'], ['other', '通过其他方式控制'], ['none', '无法识别自然人']])}{value.uboPath === 'none' ? <div className="kyb-grid">{field('noUboReason', '无法识别原因', '请说明原因', false, true)}{field('seniorName', '高级管理人员姓名', '请输入姓名')}{field('seniorTitle', '高级管理人员职务', '请输入职务')}</div> : (value.uboPath === 'share' || value.uboPath === 'other') && <>{value.people.map((item, index) => <div className="kyb-person" key={item.id}><strong>自然人 {index + 1}</strong><div className="kyb-grid"><label className="kyb-field"><span>姓名 <small>必填</small></span><input value={item.name} placeholder="请输入姓名" onChange={event => updatePerson(index, 'name', event.target.value)} />{message(`person-${index}-name`) && <em role="alert">{message(`person-${index}-name`)}</em>}</label>{value.uboPath === 'share' ? <><label className="kyb-field"><span>控制方式 <small>必填</small></span><select value={item.method} onChange={event => updatePerson(index, 'method', event.target.value)}><option value="direct">直接持股</option><option value="indirect">间接持股</option></select></label><label className="kyb-field"><span>持股比例（%） <small>必填</small></span><input type="number" min="0.01" max="100" value={item.share} placeholder="例如：75" onChange={event => updatePerson(index, 'share', event.target.value)} />{message(`person-${index}-share`) && <em role="alert">{message(`person-${index}-share`)}</em>}</label></> : <label className="kyb-field"><span>控制关系说明 <small>必填</small></span><input value={item.explanation} placeholder="请说明控制方式" onChange={event => updatePerson(index, 'explanation', event.target.value)} />{message(`person-${index}-explanation`) && <em role="alert">{message(`person-${index}-explanation`)}</em>}</label>}</div>{value.people.length > 1 && <button type="button" className="issuer-secondary" onClick={() => change('people', value.people.filter((_, at) => at !== index))}>移除此人</button>}</div>)}<button type="button" className="issuer-secondary" onClick={addPerson}>添加自然人</button></>}{message('people') && <p role="alert">{message('people')}</p>}<h4>业务联系人</h4><div className="kyb-grid">{field('contactName', '姓名', '请输入姓名')}{field('contactEmail', '联系邮箱', 'name@company.com')}{field('contactPhone', '联系电话', '请输入联系电话', true)}</div></div>}
        {record.step === 3 && <div className="kyb-materials"><p>支持 PDF、JPG、PNG；单个文件不超过 20MB。文件仅保存在当前浏览器中。</p>{materialKinds.map(([kind, label, rule]) => { const item = value.materials.find(file => file.kind === kind); return <div className="kyb-material" key={kind}><div><strong>{label}</strong><small>{rule}</small>{item && <p>{item.fileName} · {(item.size / 1024).toFixed(0)} KB · 版本 {item.version} · 已加入</p>}{message(kind) && <em role="alert">{message(kind)}</em>}</div><div><label className="issuer-secondary">{item ? '替换文件' : '选择文件'}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={event => upload(kind, event)} /></label>{item && <><button type="button" className="issuer-secondary" onClick={() => setFileView(item)}>查看</button><button type="button" className="issuer-secondary" onClick={() => change('materials', value.materials.filter(file => file.kind !== kind))}>移除</button></>}</div></div>; })}</div>}
        {record.step === 4 && <div className="kyb-preview"><p>提交前请核对以下信息。点击分组可返回修改。</p>{steps.slice(0, 4).map((name, index) => <button className="kyb-preview-row" type="button" key={name} onClick={() => go(index)}><strong>{name}</strong><span>{index === 0 ? `${value.legalName} · ${value.registrationId}` : index === 1 ? value.business : index === 2 ? `${value.representativeName} · ${value.contactName}` : `${value.materials.length} 份文件`}</span><b>修改 →</b></button>)}<label className="kyb-check"><input type="checkbox" checked={value.truthful} onChange={event => change('truthful', event.target.checked)} />我确认提交的企业资料真实、准确。 <small>必填</small></label>{message('truthful') && <em role="alert">{message('truthful')}</em>}<label className="kyb-check"><input type="checkbox" checked={value.authorized} onChange={event => change('authorized', event.target.checked)} />我确认已获得企业授权提交本次认证资料。 <small>必填</small></label>{message('authorized') && <em role="alert">{message('authorized')}</em>}</div>}
        <div className="kyb-actions"><button type="button" className="issuer-secondary" onClick={fillExample}>填入示例信息</button><span className="kyb-save" role="status">{notice || (record.savedAt ? `草稿已保存 · ${new Date(record.savedAt).toLocaleTimeString('zh-CN')}` : '填写内容将自动保存')}</span><div>{record.step > 0 && <button className="issuer-secondary" type="button" onClick={() => go(record.step - 1)}>上一步</button>}{record.step < 4 ? <button className="issuer-action" type="button" onClick={next}>下一步</button> : <button className="issuer-action" type="button" disabled={!value.truthful || !value.authorized} onClick={() => submit()}>{record.versions.length ? '修改资料并重新提交' : '提交企业认证'}</button>}</div></div>
      </form></>}
    {!!record.versions.length && <section className="kyb-review-controls" aria-label="本地审核状态切换"><h3>审核状态切换</h3><p>仅用于本地流程验收，不连接认证服务。</p><div><button type="button" className="issuer-secondary" onClick={() => review('reviewing')}>审核中</button><button type="button" className="issuer-secondary" onClick={() => review('supplement')}>待补件</button><button type="button" className="issuer-secondary" onClick={() => review('rejected')}>未通过</button><button type="button" className="issuer-action" onClick={() => review('passed')}>通过认证</button></div>{notice && !editable && <p role="status">{notice}</p>}</section>}
    {!!record.versions.length && <details className="kyb-history"><summary>提交历史（{record.versions.length}）</summary><ol>{record.versions.map(item => <li key={item.number}>版本 {item.number} · {new Date(item.submittedAt).toLocaleString('zh-CN')} · {item.value.legalName}</li>)}</ol></details>}
    {fileView && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-label="文件信息"><h3>文件信息</h3><p>{fileView.fileName}</p><p>{(fileView.size / 1024).toFixed(0)} KB · 版本 {fileView.version}</p><button className="issuer-action" type="button" onClick={() => setFileView(null)}>关闭</button></div></div>}
  </section>;
}
