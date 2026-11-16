import { useEffect, useState, type FormEvent } from 'react';
import { ServiceUnavailable, isDemoPreview } from '../site';
import { useDemoControls } from '../demoControls';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';
import { countryOptions, isCountryCode } from '../countries';
import { getDemoAuth, getDemoAccount, getActiveTenantIntent, getAuthorizedTenants, getDemoTenant, getTenantDraft, saveTenantDraft, submitTenantCreate, resolveTenantCreate, type DemoTenant, type TenantDraft, type TenantCreateIntent } from '../issuerDemo';
import { emptyKybValue, exampleKybValue, getKybRecord, saveKybRecord, validateKyb, type KybValue } from '../issuerKybFlow';

type EnrollmentDraft = TenantDraft & Pick<KybValue, 'entityType' | 'entityOther' | 'registrationId' | 'address' | 'website'>;
const empty: EnrollmentDraft = { name: '', country: '', description: '', entityType: '', entityOther: '', registrationId: '', address: '', website: '' };
const entityTypes = ['有限责任公司', '股份有限公司', '合伙企业', '基金或投资主体', '其他'];
export function FreeOnboarding({ embedded = false }: { embedded?: boolean }) {
  const demo = isDemoPreview();
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const intent = entryIntent();
  const [draft, setDraft] = useState<EnrollmentDraft>(() => ({ ...empty, ...getTenantDraft() }));
  const [record, setRecord] = useState<TenantCreateIntent | null>(() => getActiveTenantIntent());
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const outcome = useDemoControls(state => state.controls.create);
  useEffect(() => { if (!embedded && demo && auth) location.replace(entryPath('/issuer/company', intent)); }, [embedded, demo, auth, intent]);
  if (!demo) return <ServiceUnavailable title="企业创建暂未开放" description="当前未接入企业创建服务。" />;
  if (!auth) return <main className="mvp-entry-page"><section className="mvp-entry-card"><h1>请先登录</h1><p>登录后即可创建企业。</p><a className="button button-primary" href={entryPath(paths.login, intent)}>前往登录</a></section></main>;
  if (!embedded) return <main className="mvp-entry-page"><section className="mvp-entry-card"><h1>进入企业资料与认证</h1><p>正在打开企业工作台。</p></section></main>;
  const existing = getAuthorizedTenants()[0];
  const nextPath = () => {
    const target = new URL(entryPath('/issuer/company', intent), location.origin);
    target.searchParams.set('tab', 'kyb');
    return target.pathname + target.search;
  };
  const continueKyb = (source: EnrollmentDraft) => {
    const tenant = getDemoTenant();
    if (!tenant) { setError('企业资料暂未建立，请重试。'); return; }
    const current = getKybRecord(tenant);
    if (current.status === 'draft' && !current.savedAt && !current.versions.length) {
      const saved = saveKybRecord(tenant, { ...current, step: 1, savedAt: Date.now(), value: { ...current.value,
        legalName: source.name.trim(), country: source.country, entityType: source.entityType, entityOther: source.entityOther,
        registrationId: source.registrationId.trim(), address: source.address.trim(), website: source.website.trim() } });
      if (!saved) { setError('认证资料保存失败，请重试。'); return; }
    }
    location.href = nextPath();
  };
  const change = (next: EnrollmentDraft) => { setDraft(next); saveTenantDraft(next); setError(''); setFieldErrors({}); };
  const fillExample = () => {
    const tenant: DemoTenant = { id: 'new', name: '澜序资产管理有限公司', country: 'HK', contactEmail: auth.email, description: '', empty: true, plan: 'Free', role: '企业管理员', canSubscribe: true };
    const example = exampleKybValue(tenant);
    change({ ...empty, name: example.legalName, country: example.country, entityType: example.entityType,
      entityOther: example.entityOther, registrationId: example.registrationId, address: example.address, website: example.website });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = draft.name.trim();
    const provisional: DemoTenant = { id: 'new', name, country: draft.country, contactEmail: auth.email, description: '', empty: true, plan: 'Free', role: '企业管理员', canSubscribe: true };
    const value = { ...emptyKybValue(provisional), legalName: name, ...draft };
    const errors = validateKyb(value).filter(item => item.step === 0);
    if (!name || [...name].length > 80) errors.push({ step: 0, field: 'legalName', message: '请输入 1–80 个字符的企业法定名称。' });
    if (draft.country && !isCountryCode(draft.country)) errors.push({ step: 0, field: 'country', message: '请选择有效的注册国家或地区。' });
    if (errors.length) { setFieldErrors(Object.fromEntries(errors.map(item => [item.field, item.message]))); setError('请完善企业基本信息。'); return; }
    setBusy(true); setError('');
    const created = submitTenantCreate({ ...draft, name });
    if (!created) { setBusy(false); setError('当前账号已有企业，或无法创建企业。'); return; }
    setRecord(created);
    window.setTimeout(() => {
      const resolved = resolveTenantCreate(created.id, outcome);
      setRecord(resolved); setBusy(false);
      if (resolved?.status === 'success') continueKyb(resolved.draft as EnrollmentDraft);
      else setError(outcome === 'failed' ? '创建失败，已保留填写内容，请重试。' : '创建结果待确认，请先查询原申请。');
    }, 250);
  };
  const queryOriginal = () => {
    if (!record) return;
    const resolved = resolveTenantCreate(record.id, outcome);
    setRecord(resolved);
    if (resolved?.status === 'success') continueKyb(resolved.draft as EnrollmentDraft);
    else setError('创建结果仍待确认，请稍后再查。');
  };
  const content = <>
    <span className="issuer-home-kicker">企业认证 · 第 1 步，共 5 步</span>{embedded ? <h2>企业基本信息</h2> : <h1>企业基本信息</h1>}
    <p>填写一次企业基础信息，后续步骤无需重复录入。</p>
    {existing ? <><h3>企业已建立</h3><p>{existing.name}</p><a className="button button-primary" href={nextPath()}>继续企业认证</a></> : record && record.status !== 'failed' ? <div role="status"><h3>{record.status === 'success' ? '企业资料已保存' : '正在确认保存结果'}</h3><p>{record.status === 'success' ? '请继续填写企业业务信息。' : '请查询原申请，避免重复提交。'}</p><button className="button button-primary" type="button" onClick={record.status === 'success' ? () => continueKyb(record.draft as EnrollmentDraft) : queryOriginal}>{record.status === 'success' ? '继续企业认证' : '查询原申请'}</button></div> : <form className="kyb-enrollment-form" noValidate onSubmit={submit}>
      <label className="kyb-field" htmlFor="tenant-name">企业法定名称（必填）<input id="tenant-name" value={draft.name} maxLength={80} onChange={event => change({ ...draft, name: event.target.value })} placeholder="与注册证明一致的企业名称" />{fieldErrors.legalName && <small className="field-error" role="alert">{fieldErrors.legalName}</small>}</label>
      <label className="kyb-field" htmlFor="tenant-type">企业类型（必填）<select id="tenant-type" value={draft.entityType} onChange={event => change({ ...draft, entityType: event.target.value })}><option value="">请选择企业类型</option>{entityTypes.map(item => <option key={item} value={item}>{item}</option>)}</select>{fieldErrors.entityType && <small className="field-error" role="alert">{fieldErrors.entityType}</small>}</label>
      {draft.entityType === '其他' && <label className="kyb-field" htmlFor="tenant-type-other">企业类型说明（必填）<input id="tenant-type-other" value={draft.entityOther} onChange={event => change({ ...draft, entityOther: event.target.value })} placeholder="请写明具体类型" />{fieldErrors.entityOther && <small className="field-error" role="alert">{fieldErrors.entityOther}</small>}</label>}
      <label className="kyb-field" htmlFor="tenant-country">注册国家或地区（必填）<select id="tenant-country" value={draft.country} onChange={event => change({ ...draft, country: event.target.value })}><option value="">请选择注册地</option>{countryOptions.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>{fieldErrors.country && <small className="field-error" role="alert">{fieldErrors.country}</small>}</label>
      <label className="kyb-field" htmlFor="tenant-registration">企业注册编号（必填）<input id="tenant-registration" value={draft.registrationId} onChange={event => change({ ...draft, registrationId: event.target.value })} placeholder="请输入登记编号" />{fieldErrors.registrationId && <small className="field-error" role="alert">{fieldErrors.registrationId}</small>}</label>
      <label className="kyb-field" htmlFor="tenant-address">注册地址（必填）<textarea id="tenant-address" value={draft.address} onChange={event => change({ ...draft, address: event.target.value })} placeholder="请输入完整注册地址" />{fieldErrors.address && <small className="field-error" role="alert">{fieldErrors.address}</small>}</label>
      <label className="kyb-field" htmlFor="tenant-website">企业官网（选填）<input id="tenant-website" value={draft.website} onChange={event => change({ ...draft, website: event.target.value })} placeholder="https://example.com" />{fieldErrors.website && <small className="field-error" role="alert">{fieldErrors.website}</small>}</label>
      <p className="mvp-hint">企业登录邮箱：{auth.email} · 填写内容自动保存</p>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="kyb-enrollment-actions"><button className="button button-outline" type="button" onClick={fillExample}>填入示例信息</button><button className="button button-primary" type="submit" disabled={busy || !account?.canCreate}>{busy ? '正在保存…' : '下一步'}</button></div>
    </form>}
  </>;
  return embedded ? <section className="issuer-card kyb-wizard kyb-enrollment">{content}</section> : <main className="mvp-entry-page"><section className="mvp-entry-card">{content}</section></main>;
}
