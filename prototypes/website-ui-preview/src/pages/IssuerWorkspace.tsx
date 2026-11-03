import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { paths } from '../config';
import { beginNewTenantDraft, clearDemoContext, getActiveTenantIntent, getAuthorizedTenants, getDemoAccount, getDemoAuth, getDemoTenant, selectDemoTenant, type DemoTenant } from '../issuerDemo';
import { getKybCase, getKybDraft } from '../issuerB04Demo';
import { getProfileDraft, getUpgradeIntent } from '../issuerB03Demo';
import { useDemoControls } from '../demoControls';
import { isDemoPreview } from '../demoEnvironment';
import { IssuerCertification, IssuerInfo, IssuerPlan } from './IssuerSettings';
import { IssuerAssets } from './IssuerAssets';
import { IssuerInstruments } from './IssuerInstruments';
import { IssuerBusinessTabs, IssuerIssuance } from './IssuerIssuance';
import { IssuerSidebarNav } from '../IssuerSidebarNav';
import { issuerBlankPaths } from '../issuerNavigation';

type Tab = 'info' | 'kyb' | 'subscription';
const oldTabs: Record<string, Tab> = {
  [paths.issuerProfile]: 'info', [paths.issuerKyb]: 'kyb', [paths.issuerKybReview]: 'kyb',
  [paths.issuerSubscription]: 'subscription', [paths.issuerUpgrade]: 'subscription',
  [paths.issuerContract]: 'subscription', [paths.issuerPayment]: 'subscription', [paths.issuerBilling]: 'subscription',
};
const tabs: [Tab, string][] = [['info', '企业信息'], ['kyb', '企业认证'], ['subscription', '订阅管理']];
const settingsHref = (tab: Tab, query: string) => paths.issuerSettings + '?' + query + '&tab=' + tab;

function Dashboard({ tenant, query, panel }: { tenant: DemoTenant; query: string; panel: 'ready' | 'loading' | 'failed' | 'unknown' }) {
  const profile = getProfileDraft(tenant);
  const kyb = getKybCase(tenant);
  const upgrade = getUpgradeIntent(tenant);
  return <div className="mvp-dashboard">
    <section className="issuer-card mvp-welcome"><span className="eyebrow">发行机构工作台</span><h1>欢迎回来，{tenant.name}</h1><p>当前套餐：{tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'} · 您的角色：{tenant.role}</p></section>
    <section className="issuer-card mvp-overview"><h2>企业概况</h2>{panel === 'loading' ? <p role="status">正在加载企业概况…</p> : panel === 'failed' ? <p role="alert">企业概况暂不可用，请稍后重试。</p> : panel === 'unknown' ? <p role="status">企业概况结果待确认，请稍后查询。</p> : <div className="mvp-overview-grid">
      <article><span>企业信息</span><strong>{profile.description ? '已完善' : '待完善'}</strong><a href={settingsHref('info', query)}>查看企业信息 →</a></article>
      <article><span>企业认证</span><strong>{kyb ? ({ reviewing: '审核中', supplement: '待补件', rejected: '未通过', unknown: '结果待确认' }[kyb.status]) : '未提交'}</strong><a href={settingsHref('kyb', query)}>查看企业认证 →</a></article>
      <article><span>订阅状态</span><strong>{upgrade?.status === 'unknown' ? '结果待确认' : tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'}</strong><a href={settingsHref('subscription', query)}>管理订阅 →</a></article>
    </div>}</section>
    <section className="issuer-card mvp-next"><h2>接下来可以做什么</h2><p>{tenant.empty ? '先完善企业信息，再按需要准备企业认证资料。' : '您可以查看企业信息、认证进度与订阅状态。'}</p><div className="issuer-quicklinks"><a href={settingsHref('info', query)}>完善企业信息</a><a href={settingsHref('kyb', query)}>查看企业认证</a><a href={settingsHref('subscription', query)}>管理订阅</a><a href={paths.issuerAssets + '?' + query}>进入资产库</a><a href={paths.issuerInstruments + '?' + query}>查看权益结构</a></div></section>
  </div>;
}

export function IssuerWorkspace() {
  const query = new URLSearchParams(location.search);
  const demo = isDemoPreview();
  const standard = query.get('intent') === 'standard';
  const sharedQuery = 'demo=1' + (standard ? '&intent=standard' : '');
  const oldTab = oldTabs[location.pathname];
  const isSettings = location.pathname === paths.issuerSettings || !!oldTab;
  const isAssets = location.pathname === paths.issuerAssets || location.pathname.startsWith(paths.issuerAssets + '/');
  const isInstruments = location.pathname === paths.issuerInstruments || location.pathname.startsWith(paths.issuerInstruments + '/');
  const isIssuance = ['/issuer/projects', '/issuer/offerings'].some(prefix => location.pathname === prefix || location.pathname.startsWith(prefix + '/')) || location.pathname === '/issuer/issuance-check' || location.pathname === '/issuer/files';
  const isBlank = issuerBlankPaths.has(location.pathname);
  const requestedTab = query.get('tab');
  const tab: Tab = oldTab || (requestedTab === 'kyb' || requestedTab === 'subscription' ? requestedTab : 'info');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<{ action: () => void; navigates: boolean; warning?: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const leaveApproved = useRef(false);
  const controls = useDemoControls(state => state.controls);
  const resetControls = useDemoControls(state => state.resetControls);
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const tenant = demo && auth ? getDemoTenant() : null;
  const hasSavedCertificationDraft = tenant ? getKybDraft(tenant).savedAt > 0 : false;
  const authorized = getAuthorizedTenants();
  const activeCreate = getActiveTenantIntent();
  const recoverCreate = activeCreate && ['processing', 'unknown', 'partial'].includes(activeCreate.status);

  useEffect(() => {
    if (oldTab && demo) location.replace(settingsHref(oldTab, sharedQuery));
  }, [oldTab, demo, sharedQuery]);
  useEffect(() => {
    if (!dirty) return;
    const onLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.dataset.issuerCreate !== undefined) return;
      const target = new URL(link.href);
      if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
      event.preventDefault(); event.stopPropagation();
      setPendingLeave({ action: () => { location.href = target.href; }, navigates: true });
    };
    const beforeUnload = (event: BeforeUnloadEvent) => { if (leaveApproved.current) return; event.preventDefault(); event.returnValue = ''; };
    document.addEventListener('click', onLink, true);
    window.addEventListener('beforeunload', beforeUnload);
    return () => { document.removeEventListener('click', onLink, true); window.removeEventListener('beforeunload', beforeUnload); };
  }, [dirty]);
  useEffect(() => {
    if (!pendingLeave) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector('button')?.focus();
    return () => previous?.focus();
  }, [pendingLeave]);
  const onDialogKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setPendingLeave(null); return; }
    if (event.key !== 'Tab') return;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
  };
  const requestLeave = (action: () => void, navigates: boolean, warning?: string) => setPendingLeave({ action, navigates, warning });
  const switchTenant = (id: string) => {
    const action = () => {
      if (!selectDemoTenant(id)) { setNotice('您已无法访问该企业，请重新选择。'); leaveApproved.current = false; return; }
      resetControls();
      location.href = paths.issuer + '?' + sharedQuery;
    };
    if (dirty || hasSavedCertificationDraft) requestLeave(action, true, hasSavedCertificationDraft ? '切换企业将清除当前企业已保存但尚未提交的认证资料。请确认已留存所需信息。' : undefined); else action();
  };
  const create = () => {
    if (recoverCreate) { setNotice('您有未完成的企业创建申请。请先查看原申请，避免重复创建。'); return; }
    if (!beginNewTenantDraft()) { setNotice('当前无法创建企业，请检查账号权限。'); return; }
    location.href = paths.onboarding + '?' + sharedQuery;
  };
  const signOut = () => {
    const action = () => { clearDemoContext(); location.href = paths.login + '?demo=1'; };
    if (dirty || hasSavedCertificationDraft) requestLeave(action, true, hasSavedCertificationDraft ? '退出账户将清除当前企业已保存但尚未提交的认证资料。请确认已留存所需信息。' : undefined); else action();
  };
  if (!demo || !auth || !tenant || controls.access !== 'allowed' || ['expired', 'revoked', 'inactive'].includes(query.get('access') || '')) {
    return <main className="issuer-block"><h1>无法进入企业工作台</h1><p>当前没有有效的企业访问权限。请重新登录或联系企业管理员。</p><a className="button button-primary" href={paths.login + '?demo=1'}>返回企业登录</a><a href={paths.home}>返回官网</a></main>;
  }
  if (oldTab) return null;
  return <main className="issuer-shell mvp-issuer-shell">
    <aside className={'issuer-sidebar ' + (mobileOpen ? 'open' : '')}>
      <a className="issuer-brand" href={paths.home}><span className="brand-mark"><i /><i /><i /></span> WDEX <b>SaaS</b></a>
      <button className="issuer-sidebar-close" aria-label="关闭业务导航" onClick={() => setMobileOpen(false)}>×</button>
      <span className="issuer-nav-label">发行机构工作台</span>
      <IssuerSidebarNav query={sharedQuery} />
      <div className="issuer-sidebar-foot">WDEX SaaS</div>
    </aside>
    <div className="issuer-main"><header className="issuer-topbar">
      <button className="issuer-menu" aria-label="打开业务导航" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      <label>当前企业 <select value={tenant.id} onChange={event => switchTenant(event.target.value)}>{authorized.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <span className="issuer-top-plan">{tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard'}</span>
      <div className="issuer-top-actions">{account?.canCreate && <button data-issuer-create type="button" onClick={() => dirty ? requestLeave(create, true) : create()}>创建新企业</button>}<a href={paths.help}>帮助</a><details><summary>账户 ▾</summary><div><span>{auth.email}</span><span>{tenant.role}</span><button onClick={signOut}>退出登录</button></div></details></div>
      {isBlank && notice && <div className="issuer-topbar-notice" role="alert">{notice}{recoverCreate && <a href={paths.onboarding + '?' + sharedQuery}>查看原创建申请 →</a>}</div>}
    </header>
    <div className={'issuer-content' + (isBlank ? ' issuer-content-blank' : '')}>{notice && !isBlank && <section className="issuer-card issuer-intent" role="alert"><p>{notice}</p>{recoverCreate && <a href={paths.onboarding + '?' + sharedQuery}>查看原创建申请 →</a>}</section>}
      {standard && tenant.plan === 'Free' && !isBlank && <section className="issuer-card issuer-intent" role="status"><strong>Standard 意向已保留</strong><p>请在当前企业的订阅管理中查看升级条件。</p><a href={settingsHref('subscription', sharedQuery)}>查看订阅管理 →</a></section>}
      {isBlank ? <div className="issuer-blank-workspace" /> : isSettings ? <><h1 className="mvp-settings-title">企业设置</h1><nav className="mvp-settings-tabs" aria-label="企业设置">{tabs.map(([id, label]) => <a key={id} href={settingsHref(id, sharedQuery)} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined}>{label}</a>)}</nav>
        {tab === 'info' ? <IssuerInfo key={tenant.id} tenant={tenant} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, false)} /> : tab === 'kyb' ? <IssuerCertification key={tenant.id} tenant={tenant} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, false)} /> : <IssuerPlan key={tenant.id} tenant={tenant} />}</> : isAssets ? <><IssuerBusinessTabs query={sharedQuery} current="assets" /><IssuerAssets key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, true)} onSavedNavigate={url => { leaveApproved.current = true; location.href = url; }} /></> : isInstruments ? <><IssuerBusinessTabs query={sharedQuery} current="instruments" /><IssuerInstruments key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, true)} onSavedNavigate={url => { leaveApproved.current = true; location.href = url; }} /></> : isIssuance ? <IssuerIssuance key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, true)} onSavedNavigate={url => { leaveApproved.current = true; location.href = url; }} /> : <Dashboard tenant={tenant} query={sharedQuery} panel={controls.panel} />}
    </div></div>
    {pendingLeave && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-labelledby="issuer-leave-title" ref={dialogRef} tabIndex={-1} onKeyDown={onDialogKey}><h2 id="issuer-leave-title">{pendingLeave.warning ? '确认离开当前企业？' : '放弃未保存的更改？'}</h2><p>{pendingLeave.warning || '离开后，未保存的信息将丢失。'}{pendingLeave.warning && dirty ? ' 未保存的更改也将丢失。' : ''}</p><div><button className="issuer-secondary" type="button" onClick={() => setPendingLeave(null)}>继续编辑</button><button className="issuer-action" type="button" onClick={() => { if (!pendingLeave) return; leaveApproved.current = pendingLeave.navigates; pendingLeave.action(); setPendingLeave(null); }}>{pendingLeave.warning ? '确认离开' : '放弃更改并离开'}</button></div></div></div>}
  </main>;
}
