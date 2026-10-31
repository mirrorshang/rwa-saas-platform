import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react';
import { type DemoTenant } from '../issuerDemo';
import { getProfileDraft, saveProfileDraft, type ProfileDraft } from '../issuerB03Demo';

type SaveOutcome = 'saved' | 'failed' | 'unknown' | 'conflict';
const countryNames: Record<string, string> = { HK: '中国香港', SG: '新加坡', GB: '英国', US: '美国' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function IssuerProfile({ tenant, onDirtyChange, onRequestDiscard }: {
  tenant: DemoTenant;
  onDirtyChange: (dirty: boolean) => void;
  onRequestDiscard: (action: () => void) => void;
}) {
  const [saved, setSaved] = useState<ProfileDraft>(() => getProfileDraft(tenant));
  const [draft, setDraft] = useState<ProfileDraft>(saved);
  const [editing, setEditing] = useState(false);
  const [outcome, setOutcome] = useState<SaveOutcome>('saved');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const canEdit = tenant.role === '企业管理员';
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(saved);
  useLayoutEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const cancel = () => {
    const discard = () => { setDraft(saved); setEditing(false); setErrors([]); setFeedback('未保存的修改已放弃。'); };
    if (dirty) onRequestDiscard(discard);
    else discard();
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      displayName: draft.displayName.trim(), commercialName: draft.commercialName.trim(),
      commercialCountry: draft.commercialCountry, registrationId: draft.registrationId.trim(), registeredAddress: draft.registeredAddress.trim(),
      contactEmail: draft.contactEmail.trim(), contactName: draft.contactName.trim(), contactRole: draft.contactRole.trim(), description: draft.description.trim(),
    };
    const validation = [
      !next.displayName && '请填写企业显示名称。',
      [...next.displayName].length > 80 && '企业显示名称不能超过80个字符。',
      !!next.contactEmail && !emailPattern.test(next.contactEmail) && '请填写有效的业务联系邮箱。',
    ].filter((item): item is string => !!item);
    setErrors(validation);
    if (validation.length) { setFeedback('请检查标记的字段。'); return; }
    if (outcome === 'failed') { setFeedback('Mock保存失败，草稿仍在当前页面，请重试。'); return; }
    if (outcome === 'unknown') { setFeedback('Mock保存结果待确认；草稿未标记为已保存，请勿重复提交正式审核。'); return; }
    if (outcome === 'conflict') { setFeedback('Mock版本冲突：资料已被更新，请核对最新版本后再提交。当前草稿仍保留。'); return; }
    if (!saveProfileDraft(tenant, next)) { setFeedback('当前账号没有修改此企业资料的权限。'); return; }
    setDraft(next); setSaved(next); setEditing(false);
    setFeedback('本地Mock草稿已保存，尚未生效；没有提交商业KYB或更改法定主体。');
  };
  const field = (key: keyof ProfileDraft, label: string, hint?: string) => {
    const message = key === 'displayName' ? errors.find(item => item.includes('企业显示名称')) : key === 'contactEmail' ? errors.find(item => item.includes('业务联系邮箱')) : undefined;
    const update = (value: string) => setDraft({ ...draft, [key]: value });
    return <label className="issuer-field" key={key}>{label}
      {key === 'commercialCountry' ? <select value={draft[key]} onChange={event => update(event.target.value)}><option value="">尚未选择</option>{Object.entries(countryNames).map(([code, name]) => <option key={code} value={code}>{name}（Mock候选）</option>)}</select> : key === 'description' || key === 'registeredAddress' ? <textarea value={draft[key]} maxLength={500} onChange={event => update(event.target.value)} /> : <input value={draft[key]} maxLength={key === 'registrationId' ? undefined : key === 'displayName' ? 80 : key === 'contactEmail' ? 160 : 120} type={key === 'contactEmail' ? 'email' : 'text'} aria-invalid={!!message} onChange={event => update(event.target.value)} />}
      {hint && <small>{hint}</small>}{message && <small className="issuer-field-error">{message}</small>}
    </label>;
  };
  return <>
    <div className="issuer-intro"><div><p className="issuer-kicker">I-02 / 企业资料</p><h1>企业资料</h1><p>当前企业：{tenant.name} · {tenant.plan} · 资料草稿与法定身份分别核对。</p></div><span className="issuer-badge">Mock 草稿 · 非生效资料</span></div>
    <div className="issuer-grid issuer-profile-grid"><section className="issuer-card"><div className="issuer-card-head"><div><h2>工作台身份与生效摘要</h2><p>W-11创建结果只属于当前Tenant；这里的商业资料草稿不会改写它。</p></div><span>当前记录</span></div><dl className="issuer-facts"><div><dt>工作台创建名称</dt><dd>{tenant.name}</dd></div><div><dt>创建时注册国家/地区</dt><dd>{countryNames[tenant.country] || tenant.country || '待核实'}</dd></div><div><dt>当前套餐</dt><dd>{tenant.plan === 'Free' ? 'Free · 永久Sandbox' : 'Standard · 商业订阅Mock'}</dd></div><div><dt>商业签约主体</dt><dd>尚未核实，不等同于工作台名称</dd></div></dl><p className="issuer-note">SaaS付费客户、发行方案的法定发行机构、资产持有/SPV主体不自动相同。此页不能修改已建立Tenant的ID或创建时身份记录。</p></section>
    <section className="issuer-card"><div className="issuer-card-head"><div><h2>企业资料草稿</h2><p>仅保存在当前浏览器演示会话；保存草稿不代表审核通过。</p></div>{canEdit && !editing && <button className="issuer-action" type="button" onClick={() => { setDraft(saved); setEditing(true); setFeedback(''); }}>编辑企业资料</button>}</div>
      {editing ? <form onSubmit={submit} noValidate>
        <div className="issuer-form-grid">
          {field('displayName', '企业显示名称 *', '只影响资料候选，不替代法定注册名称。')}
          {field('commercialName', '商业签约名称（草稿）', '实际法定名称需另行核对有权证据。')}
          {field('commercialCountry', '商业主体注册国家/地区（候选）', '仅为Mock候选，不代表该发行法域已获批准。')}
          {field('registrationId', '商业登记识别号（草稿）', '具体格式与必填条件由登记地及商业KYB确定。')}
          {field('registeredAddress', '商业登记地址（草稿）')}
          {field('contactEmail', '业务联系邮箱', '真实邮箱控制权验证尚未接入。')}
          {field('contactName', '联系人姓名（草稿）')}
          {field('contactRole', '联系人职责', '不授予代表或签字权限。')}
          {field('description', '业务说明')}
        </div>
        {errors.length > 0 && <div className="issuer-form-errors" role="alert"><strong>请修正以下问题</strong><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul></div>}
        <div className="issuer-form-actions"><button className="issuer-action" type="submit">保存本地草稿</button><button className="issuer-secondary" type="button" onClick={cancel}>取消编辑</button>{dirty && <span>有未保存的更改</span>}</div>
      </form> : <dl className="issuer-facts">
        <div><dt>企业显示名称草稿</dt><dd>{saved.displayName}</dd></div>
        <div><dt>商业签约名称草稿</dt><dd>{saved.commercialName || '尚未填写'}</dd></div>
        <div><dt>商业主体注册地区候选</dt><dd>{countryNames[saved.commercialCountry] || '尚未选择'}</dd></div>
        <div><dt>商业登记识别号草稿</dt><dd>{saved.registrationId ? (canEdit ? saved.registrationId : '••••' + saved.registrationId.slice(-4)) : '尚未填写'}</dd></div>
        <div><dt>商业登记地址草稿</dt><dd>{canEdit ? saved.registeredAddress || '尚未填写' : '仅企业管理员可查看'}</dd></div>
        <div><dt>业务联系邮箱草稿</dt><dd>{saved.contactEmail || '尚未填写'}</dd></div>
        <div><dt>联系人姓名草稿</dt><dd>{canEdit ? saved.contactName || '尚未填写' : '仅企业管理员可查看'}</dd></div>
        <div><dt>联系人职责</dt><dd>{saved.contactRole || '尚未填写'}</dd></div>
        <div><dt>业务说明</dt><dd>{saved.description || '尚未填写'}</dd></div>
      </dl>}
      {!canEdit && <p role="status">仅可查看，当前角色没有修改企业资料权限。</p>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}<label className="issuer-mock-select">Mock保存结果 <select value={outcome} onChange={event => setOutcome(event.target.value as SaveOutcome)}><option value="saved">本地草稿保存</option><option value="failed">保存失败</option><option value="unknown">结果未知</option><option value="conflict">版本冲突</option></select></label>
    </section></div>
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>法定代表人与授权关系</h2><p>暂无可核实的法定代表人、受托代表或签署授权记录。联系人草稿不构成代表权或签字权。</p><p className="issuer-note">法定发行机构应按发行方案及有权证据另行核实，不自动等于SaaS商业签约主体。</p></section><section className="issuer-card"><h2>营业登记与证明材料索引</h2><p>暂无正式登记证明或授权材料索引；文件上传和证据核验待接入，不在此页模拟已提交材料。</p></section><section className="issuer-card"><h2>商业KYB状态摘要</h2><p>待接入 I-05 / I-06 权威审核结果。当前资料草稿不代表KYB已提交或通过。</p></section><section className="issuer-card"><h2>资料变更历史</h2><p>暂无可核实的正式变更记录。本地Mock草稿保存不写入正式审计历史。</p></section><section className="issuer-card"><h2>企业关联钱包</h2><p>可选能力尚未开放。Free和Standard均不以钱包绑定为入口条件；Privy/MPC与Signer未接入，此页不会生成地址。</p><p className="issuer-note">资料草稿不改变现有发行项目、资产持有主体、合同或订阅账单。</p></section></div>
  </>;
}
