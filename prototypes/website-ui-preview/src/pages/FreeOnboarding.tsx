import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Button, ServiceUnavailable, isDemoPreview } from '../site';
import { useDemoControls } from '../demoControls';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';
import { getDemoAuth, getDemoAccount, getActiveTenantIntent, getTenantDraft, saveTenantDraft, clearTenantDraft, submitTenantCreate, resolveTenantCreate, type TenantDraft, type TenantCreateIntent, type CreateOutcome } from '../issuerDemo';

const regions = [['HK', '中国香港'], ['SG', '新加坡'], ['GB', '英国'], ['US', '美国']];
export function FreeOnboarding() {
  const demo = isDemoPreview();
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const intent = entryIntent();
  const [draft, setDraft] = useState<TenantDraft>(() => getTenantDraft() || { name: '', country: '', description: '' });
  const [record, setRecord] = useState<TenantCreateIntent | null>(() => getActiveTenantIntent());
  const outcome = useDemoControls(state => state.controls.create) as CreateOutcome;
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(() => !!getTenantDraft() && !getActiveTenantIntent());
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const leaveApproved = useRef(false);
  useEffect(() => {
    if (!dirty || record) return;
    const onLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || new URL(link.href).origin !== location.origin) return;
      event.preventDefault();
      event.stopPropagation();
      setLeaveTarget(link.href);
    };
    const beforeUnload = (event: BeforeUnloadEvent) => { if (leaveApproved.current) return; event.preventDefault(); event.returnValue = ''; };
    const pageHide = () => {
      const prior = getActiveTenantIntent();
      if (prior?.status === 'failed') saveTenantDraft(prior.draft);
      else clearTenantDraft();
    };
    document.addEventListener('click', onLink, true);
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('pagehide', pageHide);
    return () => { document.removeEventListener('click', onLink, true); window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('pagehide', pageHide); };
  }, [dirty, record]);
  useEffect(() => {
    if (!leaveTarget) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector('button')?.focus();
    return () => previousFocus?.focus();
  }, [leaveTarget]);
  if (!demo) return <ServiceUnavailable title="企业工作台创建暂未开放" description="当前未接入真实企业创建与授权服务。" />;
  if (!auth) return <ServiceUnavailable title="请先验证企业账号" description="创建企业工作台必须先经过邮箱认证；邮箱验证本身不会创建企业。" />;
  if (!account?.canCreate || account.restricted) return <main className="issuer-block"><h1>当前账号无法创建企业</h1><p>请联系支持核实企业创建权限。</p><Button href={paths.contact + '?topic=account'}>联系支持</Button></main>;
  const change = (next: TenantDraft) => { setDraft(next); saveTenantDraft(next); setDirty(true); setError(''); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || [...name].length > 80) { setError('企业工作台名称须为1～80个有效字符。'); return; }
    if (!regions.some(([code]) => code === draft.country)) { setError('请选择注册国家或地区。'); return; }
    if (!confirmed) { setError('请确认Free Sandbox使用范围。'); return; }
    const next = { ...draft, name, description: draft.description.trim() };
    change(next);
    const created = submitTenantCreate(next);
    if (!created) { setError('当前账号没有创建资格，请重新登录核实。'); return; }
    setDirty(false);
    setRecord(created);
    window.setTimeout(() => { const resolved = resolveTenantCreate(created.id, outcome); setRecord(resolved); if (resolved?.status === 'success') location.href = entryPath(paths.issuer, intent); }, 500);
  };
  const queryOriginal = () => {
    if (!record) return;
    setRecord(resolveTenantCreate(record.id, outcome));
  };
  const cancel = () => {
    if (dirty && !record) { setLeaveTarget(entryPath(paths.organizations, intent)); return; }
    location.href = entryPath(paths.organizations, intent);
  };
  const confirmLeave = () => {
    if (!leaveTarget) return;
    const prior = getActiveTenantIntent();
    if (prior?.status === 'failed') saveTenantDraft(prior.draft);
    else clearTenantDraft();
    leaveApproved.current = true;
    location.href = leaveTarget;
  };
  const dialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setLeaveTarget(null); return; }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
  };
  const complete = record?.status === 'success' && record.tenantCreated && record.freeActive && record.memberActive;
  return <main className="mvp-entry-page"><section className="mvp-entry-card">
    <span className="eyebrow">企业工作台</span><h1>创建企业</h1>
    <p>填写基本信息，创建后即可进入 Free Sandbox 工作台。</p>
    {intent === 'standard' && <p className="mvp-hint">Standard 升级意向已保留，创建企业不会自动开通订阅。</p>}
    {complete ? <><h2>企业创建成功</h2><p>{record.draft.name} · Free Sandbox</p><Button href={entryPath(paths.issuer, intent)}>进入工作台</Button></> : record ? <div role="status"><h2>{record.status === 'processing' ? '正在处理创建申请' : record.status === 'partial' ? '企业已创建，开通状态待确认' : record.status === 'unknown' ? '创建结果待确认' : '创建未完成'}</h2><p>请查询原申请结果，避免重复创建企业。</p><button className="button button-primary" type="button" onClick={queryOriginal}>查询原申请</button>{record.status === 'failed' && !record.tenantCreated && <button className="button button-outline" type="button" onClick={() => { setDraft(record.draft); saveTenantDraft(record.draft); setDirty(false); setRecord(null); }}>返回原草稿</button>}</div> : <form noValidate onSubmit={submit}>
      <label htmlFor="tenant-name">企业名称<input id="tenant-name" value={draft.name} maxLength={80} onChange={event => change({ ...draft, name: event.target.value })} /></label>
      <label htmlFor="tenant-country">注册国家或地区<select id="tenant-country" value={draft.country} onChange={event => change({ ...draft, country: event.target.value })}><option value="">请选择</option>{regions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
      <label htmlFor="tenant-email">企业联系邮箱<input id="tenant-email" type="email" value={auth.email} readOnly /></label>
      <label htmlFor="tenant-description">业务简介（选填）<textarea id="tenant-description" value={draft.description} maxLength={500} onChange={event => change({ ...draft, description: event.target.value })} /></label>
      <label className="mvp-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />我了解 Free Sandbox 不支持真实发行或募资。</label>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit">创建企业</button>
    </form>}
    <div className="mvp-entry-links"><button type="button" onClick={cancel}>返回</button><a href={entryPath(paths.organizations, intent)}>查看我的企业</a></div>
  </section>
  {leaveTarget && <div className="modal-backdrop"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="tenant-leave-title" ref={dialogRef} tabIndex={-1} onKeyDown={dialogKeyDown}><h2 id="tenant-leave-title">离开企业创建页面</h2><p>未保存的企业信息将被放弃，确定返回？</p><div className="tenant-leave-actions"><button className="button button-outline" type="button" onClick={() => setLeaveTarget(null)}>继续填写</button><button className="button button-primary" type="button" onClick={confirmLeave}>确认放弃并离开</button></div></div></div>}
  </main>;
}
