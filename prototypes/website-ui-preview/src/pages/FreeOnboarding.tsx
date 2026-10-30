import { useState, type FormEvent } from 'react';
import { Button, DemoNotice, ServiceUnavailable, isDemoPreview } from '../site';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';
import { getDemoAuth, getDemoAccount, getActiveTenantIntent, getTenantDraft, saveTenantDraft, submitTenantCreate, resolveTenantCreate, beginNewTenantDraft, type TenantDraft, type TenantCreateIntent, type CreateOutcome } from '../issuerDemo';

const regions = [['HK', '中国香港（演示）'], ['SG', '新加坡（演示）'], ['GB', '英国（演示）'], ['US', '美国（演示）']];
export function FreeOnboarding() {
  const demo = isDemoPreview();
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const intent = entryIntent();
  const [draft, setDraft] = useState<TenantDraft>(() => getTenantDraft() || { name: '', country: '', description: '' });
  const [record, setRecord] = useState<TenantCreateIntent | null>(() => getActiveTenantIntent());
  const [outcome, setOutcome] = useState<CreateOutcome>('success');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  if (!demo) return <ServiceUnavailable title="企业工作台创建暂未开放" description="当前未接入真实企业创建与授权服务。" />;
  if (!auth) return <ServiceUnavailable title="请先验证企业账号" description="创建企业工作台必须先经过邮箱认证；邮箱验证本身不会创建企业。" />;
  if (!account?.canCreate || account.restricted) return <main className="issuer-block"><h1>当前账号无法创建企业</h1><p>没有有效的演示创建资格；不会建立企业或Free权益。</p><Button href={paths.contact + '?topic=account'}>联系支持</Button></main>;
  const change = (next: TenantDraft) => { setDraft(next); saveTenantDraft(next); setError(''); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || [...name].length > 80) { setError('企业工作台名称须为1～80个有效字符。'); return; }
    if (!regions.some(([code]) => code === draft.country)) { setError('请选择演示注册国家或地区。'); return; }
    if (!confirmed) { setError('请确认Free Sandbox说明。'); return; }
    const next = { ...draft, name, description: draft.description.trim() };
    change(next);
    const created = submitTenantCreate(next);
    if (!created) { setError('当前账号没有创建资格，请重新登录核实。'); return; }
    setRecord(created);
    window.setTimeout(() => setRecord(resolveTenantCreate(created.id, outcome)), 500);
  };
  const queryOriginal = () => {
    if (!record) return;
    setRecord(resolveTenantCreate(record.id, outcome));
  };
  const newDraft = () => {
    if (record && ['processing', 'unknown', 'partial'].includes(record.status)) return;
    if (!window.confirm('开始新的模拟企业创建申请？')) return;
    if (!beginNewTenantDraft()) return;
    setDraft({ name: '', country: '', description: '' }); setRecord(null); setConfirmed(false); setError('');
  };
  const complete = record?.status === 'success' && record.tenantCreated && record.freeActive && record.memberActive;
  return <main className="register-shell tenant-create-page">
    <section className="register-story"><div className="register-story-inner"><span className="eyebrow">W-11 / FREE SANDBOX</span><h1>创建企业<br /><em>工作台</em></h1><p>为您的发行机构建立独立的Free Sandbox工作区，开始准备资产资料与发行项目。</p><div className="tenant-create-benefits"><h2>永久免费Sandbox</h2><ul><li>模拟资产、发行项目与发行方案</li><li>独立的企业成员和数据上下文</li><li>后续可在同一企业申请Standard订阅</li></ul></div><p>工作台名称不等于法定企业名称；演示地区不代表发行法域已获批准。商业KYB会独立核对主体资料。Free无需钱包绑定、Privy、MPC或商业KYB，也不是14天试用。</p><p>模拟资产、订单、资金、Token和权益没有法律或金融效力。</p></div></section>
    <section className="register-form-side"><div className="register-form-card tenant-create-card"><span className="eyebrow">企业创建 · Mock</span><p className="register-intent" role="status">演示模式｜仅保存在当前浏览器会话，不创建真实企业或生产权限。</p>{intent === 'standard' && <p className="register-intent">Standard意向已保留；新企业首先开通Free，未生成账单或Standard权益。</p>}
      {complete ? <><h2>您的企业工作台已准备就绪</h2><p>三项模拟结果均已确认：Tenant、Free权益、初始企业管理员成员关系。</p><dl className="tenant-create-summary"><div><dt>企业工作台</dt><dd>{record.draft.name}</dd></div><div><dt>当前套餐</dt><dd>Free · 永久Sandbox</dd></div><div><dt>账号角色</dt><dd>企业管理员</dd></div><div><dt>创建结果</dt><dd>模拟成功</dd></div></dl><Button href={entryPath(paths.issuer, intent)}>进入企业工作台</Button><button className="tenant-text-button" type="button" onClick={newDraft}>创建另一家企业</button></> : record ? <><h2>{record.status === 'processing' ? '正在创建企业工作台' : record.status === 'partial' ? '企业已创建，Free权益待确认' : record.status === 'unknown' ? '创建结果暂无法确认' : '创建未完成'}</h2><p>申请编号：{record.id.slice(0, 8)} · 仅用于当前浏览器会话的Mock查询。</p><p>{record.status === 'partial' ? '不得进入工作台；请继续核实原申请的Free权益和成员授权。' : record.status === 'unknown' ? '请查询原申请，不要重复创建企业。' : record.status === 'failed' ? '可恢复原草稿并重试同一申请。' : '正在模拟处理，请勿重复提交或关闭页面。'}</p><label className="tenant-field">模拟原申请查询结果<select value={outcome} onChange={event => setOutcome(event.target.value as CreateOutcome)}><option value="success">三项均成功</option><option value="partial">Tenant已创建，Free待确认</option><option value="unknown">结果仍未知</option><option value="failed">创建失败</option></select></label><button className="button button-primary" type="button" onClick={queryOriginal}>查询原申请 ↗</button>{record.status === 'failed' && <button className="tenant-text-button" type="button" onClick={() => setRecord(null)}>返回原草稿</button>}</> : <><h2>填写企业基本信息</h2><p>账号邮箱：{auth.email}。账号认证与企业创建是两个独立步骤。</p><form noValidate onSubmit={submit}><label className="tenant-field" htmlFor="tenant-name">企业工作台名称<span aria-hidden="true"> *</span><input id="tenant-name" value={draft.name} maxLength={100} onChange={event => change({ ...draft, name: event.target.value })} aria-invalid={!!error && !draft.name.trim()} /></label><label className="tenant-field" htmlFor="tenant-country">注册国家或地区<span aria-hidden="true"> *</span><select id="tenant-country" value={draft.country} onChange={event => change({ ...draft, country: event.target.value })}><option value="">请选择演示选项</option>{regions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label><small>仅为演示选项，不代表真实支持的发行法域。</small><label className="tenant-field" htmlFor="tenant-email">商业联系邮箱<input id="tenant-email" value={auth.email} readOnly type="email" /></label><label className="tenant-field" htmlFor="tenant-description">业务类型或说明（选填）<textarea id="tenant-description" value={draft.description} maxLength={500} onChange={event => change({ ...draft, description: event.target.value })} /></label><label className="register-terms"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> 我确认创建的是永久免费的Sandbox演示工作台，不代表真实发行或商业订阅已获批准。</label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary tenant-submit" type="submit">确认创建企业 ↗</button></form></>}
      <div className="tenant-create-links"><Button href={entryPath(paths.organizations, intent)} variant="outline">查看我的企业</Button><Button href={paths.help} variant="text">帮助中心</Button></div><label className="tenant-field tenant-mock-control">Mock创建结果<select value={outcome} onChange={event => setOutcome(event.target.value as CreateOutcome)}><option value="success">三项均成功</option><option value="failed">创建失败</option><option value="unknown">结果未知</option><option value="partial">Tenant成功、Free待确认</option></select></label></div><div className="preview-strip"><DemoNotice /></div></section>
  </main>;
}
