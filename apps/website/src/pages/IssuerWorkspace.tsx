import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { paths } from '../config';
import { clearDemoContext, getDemoAuth, getDemoTenant, type DemoTenant } from '../issuerDemo';
import { getKybRecord, type KybRecord } from '../issuerKybFlow';
import { useDemoControls } from '../demoControls';
import { isDemoPreview } from '../demoEnvironment';
import { IssuerInfo, IssuerPlan } from './IssuerSettings';
import { IssuerDashboard } from './IssuerDashboard';
import { IssuerKybWizard } from './IssuerKybWizard';
import { FreeOnboarding } from './FreeOnboarding';
import { IssuerPortfolioRouteV1 } from './IssuerPortfolioRouteV1';
import { IssuerPortalV1 } from './IssuerPortalV1';
import { IssuerInvestorsV1 } from './IssuerInvestorsV1';
import { IssuerOrdersV1 } from './IssuerOrdersV1';
import { IssuerAllocationV1 } from './IssuerAllocationV1';
import { IssuerReceiptsV1 } from './IssuerReceiptsV1';
import { IssuerRefundsV1 } from './IssuerRefundsV1';
import { IssuerSettlementV1 } from './IssuerSettlementV1';
import { IssuerTokenV1 } from './IssuerTokenV1';
import { IssuerAssetRecordsV1 } from './IssuerAssetRecordsV1';
import { IssuerCompanySharedV1 } from './IssuerCompanySharedV1';
import { IssuerDataV1 } from './IssuerDataV1';
import { IssuerYieldV1 } from './IssuerYieldV1';
import { IssuerSharedWorkV1 } from './IssuerSharedWorkV1';
import { IssuerSidebarNav } from '../IssuerSidebarNav';
import { activeSection, issuerFreeLockedPage, issuerLegacyRedirects, issuerPendingPagePaths, issuerRouteTitle } from '../issuerNavigation';
import { DsBreadcrumb } from '../design-system/components';
import '../issuerShellR2.css';

type Tab = 'info' | 'kyb' | 'subscription';
const oldTabs: Record<string, Tab> = {
  [paths.issuerProfile]: 'info', [paths.issuerKyb]: 'kyb', [paths.issuerKybReview]: 'kyb',
  [paths.issuerSubscription]: 'subscription', [paths.issuerUpgrade]: 'subscription',
  [paths.issuerContract]: 'subscription', [paths.issuerPayment]: 'subscription', [paths.issuerBilling]: 'subscription',
};
const settingsHref = (tab: Tab, query: string) => (tab === 'subscription' ? '/issuer/plan' : '/issuer/company') + '?' + query + (tab === 'kyb' ? '&tab=kyb' : '');

function AccessState({ tenant, record, title, query }: { tenant: DemoTenant | null; record: KybRecord | null; title: string; query: string }) {
  const status = record?.status;
  const message = !tenant ? '请在企业资料与认证中填写企业信息。' : status === 'draft' ? '完成企业认证后可使用业务功能。' : status === 'submitted' || status === 'reviewing' ? '企业资料已提交，审核通过后开放业务功能。' : status === 'supplement' ? '请根据审核意见补充资料并重新提交。' : status === 'rejected' ? '请查看审核意见，修改资料后重新提交。' : '请先完成企业认证。';
  const action = !tenant ? '开始企业认证' : status === 'draft' ? '继续企业认证' : status === 'submitted' || status === 'reviewing' ? '查看审核进度' : '修改资料并重新提交';
  const href = `/issuer/company?${query}&tab=kyb`;
  return <section className="issuer-route-surface issuer-access-state"><h1>{title}</h1><div className="issuer-card"><h2>{!tenant ? '尚未创建企业' : `企业认证 · ${status === 'supplement' ? '待补件' : status === 'rejected' ? '未通过' : status === 'reviewing' ? '审核中' : status === 'submitted' ? '已提交' : '待完成'}`}</h2><p>{message}</p>{record?.reviewNotes && <p>审核意见：{record.reviewNotes}</p>}<a className="issuer-action" href={href}>{action}</a></div></section>;
}

export function IssuerWorkspace() {
  const query = new URLSearchParams(location.search);
  const demo = isDemoPreview();
  const standard = query.get('intent') === 'standard';
  const sharedQuery = 'demo=1' + (standard ? '&intent=standard' : '');
  const legacyRedirect = issuerLegacyRedirects[location.pathname];
  const oldTab = oldTabs[location.pathname];
  const isSettings = [paths.issuerSettings, '/issuer/company', '/issuer/plan'].includes(location.pathname) || !!oldTab;
  const isAssets = location.pathname === paths.issuerAssets || location.pathname.startsWith(paths.issuerAssets + '/');
  const isInstruments = location.pathname === paths.issuerInstruments || location.pathname.startsWith(paths.issuerInstruments + '/');
  const isIssuance = ['/issuer/projects', '/issuer/offerings'].some(prefix => location.pathname === prefix || location.pathname.startsWith(prefix + '/')) || location.pathname === '/issuer/issuance-check' || location.pathname === '/issuer/files';
  const isInvestors = location.pathname === '/issuer/investors' || location.pathname.startsWith('/issuer/investors/');
  const isOrders = location.pathname === '/issuer/orders' || location.pathname.startsWith('/issuer/orders/');
  const isAllocation = location.pathname === '/issuer/allocation-holders' || location.pathname.startsWith('/issuer/allocation-holders/');
  const isReceipts = location.pathname === '/issuer/receipts' || location.pathname.startsWith('/issuer/receipts/');
  const isRefunds = location.pathname === '/issuer/refunds' || location.pathname.startsWith('/issuer/refunds/');
  const isSettlement = location.pathname === '/issuer/settlement' || location.pathname.startsWith('/issuer/settlement/');
  const isTokenContracts = location.pathname === '/issuer/token-contracts' || location.pathname.startsWith('/issuer/token-contracts/');
  const isTokenOperations = location.pathname === '/issuer/token-operations';
  const isChainRecords = location.pathname === '/issuer/chain-records' || location.pathname.startsWith('/issuer/chain-records/');
  const isSubscriptionRecords = location.pathname === '/issuer/subscription-records';
  const isLockups = location.pathname === '/issuer/lockups';
  const isWallets = location.pathname === '/issuer/wallets';
  const isRules = location.pathname === '/issuer/rules';
  const isExternalServices = location.pathname === '/issuer/external-services';
  const isReports = location.pathname === '/issuer/reports';
  const isAuditRecords = location.pathname === '/issuer/audit-records' || location.pathname.startsWith('/issuer/audit-records/');
  const isServicing = location.pathname === '/issuer/servicing';
  const isDistributions = location.pathname === '/issuer/distributions';
  const isExits = location.pathname === '/issuer/exits';
  const sharedView = location.pathname === '/issuer/tasks' ? 'tasks' : location.pathname === '/issuer/issues' ? 'issues' :
    location.pathname === '/issuer/notifications' ? 'notifications' : location.pathname === '/issuer/service-status' ? 'service' : null;
  const isPending = issuerPendingPagePaths.has(location.pathname);
  const requestedTab = query.get('tab');
  const tab: Tab = location.pathname === '/issuer/plan' ? 'subscription' : oldTab || (requestedTab === 'kyb' || requestedTab === 'subscription' ? requestedTab : 'info');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, refreshAccess] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<{ action: () => void; navigates: boolean; warning?: string } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const leaveApproved = useRef(false);
  const controls = useDemoControls(state => state.controls);
  const auth = getDemoAuth();
  const tenant = demo && auth ? getDemoTenant() : null;
  const kybRecord = tenant ? getKybRecord(tenant) : null;
  const kybPassed = kybRecord?.status === 'passed';
  const downgraded = tenant?.subscriptionState === 'downgraded';
  const freeLocked = tenant?.plan === 'Free' && !downgraded && issuerFreeLockedPage(location.pathname);
  const downgradedEdit = downgraded && (location.pathname.endsWith('/edit') ||
    ['/issuer/assets/new', '/issuer/offerings/new'].includes(location.pathname));
  const currentSection = activeSection(location.pathname);
  const currentTitle = issuerRouteTitle[location.pathname] || (sharedView === 'tasks' ? '我的待办' : sharedView === 'issues' ? '异常工单' : sharedView === 'notifications' ? '消息通知' : sharedView === 'service' ? '安全与服务状态' : isInvestors ? '投资者管理' : isOrders ? '认购订单' : isAllocation ? '配售与持有人' : isReceipts ? '收款与对账' : isRefunds ? '退款与异常' : isTokenContracts ? '合约管理' : isTokenOperations ? 'Token 操作' : isChainRecords ? '链上记录与对账' : isSettings ? '企业管理' : '资产与发行');
  const hasPageBreadcrumb = isAssets || isInstruments || isIssuance || location.pathname === '/issuer/portal' ||
    isInvestors || isOrders || isAllocation || isReceipts || isRefunds || isSettlement ||
    isTokenContracts || isTokenOperations || isChainRecords || isSubscriptionRecords || isLockups ||
    isWallets || isRules || isExternalServices || isReports || isAuditRecords ||
    isServicing || isDistributions || isExits || Boolean(sharedView);
  const crumbs = currentTitle === '工作台首页' ? [{ label: currentTitle }] : [
    { label: '工作台首页', href: `${paths.issuer}?${sharedQuery}` },
    { label: currentSection?.label || currentTitle, ...(currentTitle !== currentSection?.label ? { href: `${currentSection?.path || paths.issuer}?${sharedQuery}` } : {}) },
    ...(currentTitle !== currentSection?.label ? [{ label: currentTitle }] : []),
  ];

  useEffect(() => {
    if (oldTab && demo) location.replace(settingsHref(oldTab, sharedQuery));
  }, [oldTab, demo, sharedQuery]);
  useEffect(() => {
    if (legacyRedirect && demo) location.replace(`${legacyRedirect}?${sharedQuery}`);
  }, [legacyRedirect, demo, sharedQuery]);
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
  const signOut = () => {
    const action = async () => { await clearDemoContext(); location.href = paths.login + '?demo=1'; };
    if (dirty) requestLeave(action, true); else action();
  };
  if (!demo || !auth || controls.access !== 'allowed' || ['expired', 'revoked', 'inactive'].includes(query.get('access') || '')) {
    return <main className="issuer-block"><h1>无法进入企业工作台</h1><p>当前没有有效的企业访问权限。请重新登录或联系企业管理员。</p><a className="button button-primary" href={paths.login + '?demo=1'}>返回企业登录</a><a href={paths.home}>返回官网</a></main>;
  }
  if (oldTab || legacyRedirect) return null;
  const content = !tenant && location.pathname === '/issuer/company' ? <><h1 className="mvp-settings-title">企业资料与认证</h1><FreeOnboarding embedded /></>
    : !tenant ? <AccessState tenant={null} record={null} title={currentTitle} query={sharedQuery} />
    : location.pathname === paths.issuer ? <IssuerDashboard tenant={tenant} query={sharedQuery} panel={controls.panel} />
    : sharedView ? <IssuerSharedWorkV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view={sharedView} />
    : location.pathname === '/issuer/company' ? <><h1 className="mvp-settings-title">企业资料与认证</h1>{kybPassed && <nav className="mvp-settings-tabs" aria-label="企业资料与认证"><a href={settingsHref('info', sharedQuery)} aria-current={tab === 'info' ? 'page' : undefined}>企业资料</a><a href={settingsHref('kyb', sharedQuery)} aria-current={tab === 'kyb' ? 'page' : undefined}>企业认证</a></nav>}{kybPassed && tab === 'info' ? <IssuerInfo key={tenant.id} tenant={tenant} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, false)} /> : <IssuerKybWizard key={tenant.id} tenant={tenant} onStatusChange={() => refreshAccess(value => value + 1)} />}</>
    : !kybPassed ? <AccessState tenant={tenant} record={kybRecord} title={currentTitle} query={sharedQuery} />
    : freeLocked ? <section className="issuer-route-surface issuer-access-state"><h1>{currentTitle}</h1><div className="issuer-card"><h2>当前套餐未开放此业务</h2><p>Free 可准备资产、权益结构、发行方案和 Token 业务资料，并查看门户内部预览。当前运营能力需完成相应套餐与生产准入。</p><a className="issuer-action" href={`/issuer/plan?${sharedQuery}`}>查看套餐权益</a></div></section>
    : downgradedEdit ? <section className="issuer-route-surface issuer-access-state"><h1>历史资料只读</h1><div className="issuer-card"><h2>当前无法新增或编辑业务资料</h2><p>降级后保留现有记录和必要存续义务；新增资产、权益结构、发行方案及普通业务修改需恢复有效套餐并满足相应准入。</p><a className="issuer-action" href={`${location.pathname.replace(/\/(?:new|edit)$/, '') || '/issuer/assets'}?${sharedQuery}`}>返回历史记录</a></div></section>
    : location.pathname === '/issuer/portal' ? <IssuerPortalV1 key={tenant.id} tenant={tenant} query={sharedQuery} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, false)} />
    : isInvestors ? <IssuerInvestorsV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} id={location.pathname.split('/')[3]} />
    : isOrders ? <IssuerOrdersV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} id={location.pathname.split('/')[3]} />
    : isAllocation ? <IssuerAllocationV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} detailKind={location.pathname.split('/')[3] as 'candidate' | 'allocation' | 'holder' | 'issue' | undefined} detailId={location.pathname.split('/')[4]} />
    : isReceipts ? <IssuerReceiptsV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} detailKind={location.pathname.split('/')[3] as 'plan' | 'instruction' | 'receipt' | 'issue' | undefined} detailId={location.pathname.split('/')[4]} />
    : isRefunds ? <IssuerRefundsV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} detailKind={location.pathname.split('/')[3] as 'refund' | 'issue' | undefined} detailId={location.pathname.split('/')[4]} />
    : isSettlement ? <IssuerSettlementV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} detailId={location.pathname.split('/')[3]} />
    : isTokenContracts ? <IssuerTokenV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="contracts" detailId={location.pathname.split('/')[3]} />
    : isTokenOperations ? <IssuerTokenV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="operations" />
    : isChainRecords ? <IssuerTokenV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="chain" detailId={location.pathname.split('/')[3]} />
    : isSubscriptionRecords ? <IssuerAssetRecordsV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="subscriptions" />
    : isLockups ? <IssuerAssetRecordsV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="lockups" />
    : isWallets ? <IssuerCompanySharedV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="wallets" />
    : isRules ? <IssuerCompanySharedV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="rules" />
    : isExternalServices ? <IssuerCompanySharedV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="services" />
    : isReports ? <IssuerDataV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="reports" />
    : isAuditRecords ? <IssuerDataV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="audit" detailId={location.pathname.split('/')[3]} />
    : isServicing ? <IssuerYieldV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="servicing" />
    : isDistributions ? <IssuerYieldV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="distributions" />
    : isExits ? <IssuerYieldV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} view="exits" />
    : isPending ? <section className="issuer-route-surface"><h1>{currentTitle}</h1></section>
    : isSettings ? <><h1 className="mvp-settings-title">{currentTitle}</h1><IssuerPlan key={tenant.id} tenant={tenant} /></>
    : isAssets || isInstruments || isIssuance ? <IssuerPortfolioRouteV1 key={`${tenant.id}-${location.pathname}`} tenant={tenant} query={sharedQuery} onDirtyChange={setDirty} onRequestDiscard={action => requestLeave(action, true)} onSavedNavigate={url => { leaveApproved.current = true; location.href = url; }} />
    : <AccessState tenant={tenant} record={kybRecord} title={currentTitle} query={sharedQuery} />;
  return <main className="issuer-shell mvp-issuer-shell ds issuer-shell-r2">
    {mobileOpen && <button className="issuer-shell-scrim" type="button" aria-label="关闭业务导航" onClick={() => setMobileOpen(false)} />}
    <aside className={'issuer-sidebar ' + (mobileOpen ? 'open' : '')}>
      <a className="issuer-brand" href={paths.home}><span className="brand-mark"><i /><i /><i /></span> WDEX <b>SaaS</b></a>
      <button className="issuer-sidebar-close" aria-label="关闭业务导航" onClick={() => setMobileOpen(false)}>×</button>
      <span className="issuer-nav-label">发行机构工作台</span>
      <IssuerSidebarNav query={sharedQuery} onNavigate={() => setMobileOpen(false)} isLocked={path =>
        !tenant || !kybPassed ? path !== '/issuer' && path !== '/issuer/company' :
          tenant.plan === 'Free' && !downgraded && issuerFreeLockedPage(path)} />
      <div className="issuer-sidebar-foot" title={auth.email}>{auth.email}</div>
    </aside>
    <div className="issuer-main"><header className="issuer-topbar">
      <button className="issuer-menu" aria-label="打开业务导航" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      <span className="issuer-top-tenant">{tenant?.name || '尚未创建企业'}</span>
      <span className="issuer-top-plan">{downgraded ? '已降级 · 存续服务' : tenant?.plan || '未开通'}</span>
      <div className="issuer-top-actions"><a href={`/issuer/tasks?${sharedQuery}`}>待办</a><a href={`/issuer/notifications?${sharedQuery}`}>消息</a><a href={`/issuer/service-status?${sharedQuery}`}>服务状态</a><a href={paths.help}>帮助</a><details><summary title={auth.email}>{auth.email} ▾</summary><div><button onClick={signOut}>退出登录</button></div></details></div>
    </header>
    <div className="issuer-content">
      {(!hasPageBreadcrumb || !kybPassed || freeLocked) && <DsBreadcrumb items={crumbs} />}
      {downgraded && <section className="issuer-card issuer-intent" role="status"><strong>已降级 · 历史只读</strong><p>原业务记录仍可查看；普通新增、编辑及资金或 Token 执行已停止。既有合法存续义务仍需按原责任流程处理。</p><a href={settingsHref('subscription', sharedQuery)}>查看套餐与恢复条件 →</a></section>}
      {standard && tenant?.plan === 'Free' && kybPassed && !isPending && <section className="issuer-card issuer-intent" role="status"><strong>Standard 意向已保留</strong><p>请在当前企业的套餐与订阅中查看升级条件。</p><a href={settingsHref('subscription', sharedQuery)}>查看套餐与订阅 →</a></section>}
      {content}
    </div></div>
    {pendingLeave && <div className="issuer-modal-backdrop"><div className="issuer-modal" role="dialog" aria-modal="true" aria-labelledby="issuer-leave-title" ref={dialogRef} tabIndex={-1} onKeyDown={onDialogKey}><h2 id="issuer-leave-title">{pendingLeave.warning ? '确认离开当前企业？' : '放弃未保存的更改？'}</h2><p>{pendingLeave.warning || '离开后，未保存的信息将丢失。'}{pendingLeave.warning && dirty ? ' 未保存的更改也将丢失。' : ''}</p><div><button className="issuer-secondary" type="button" onClick={() => setPendingLeave(null)}>继续编辑</button><button className="issuer-action" type="button" onClick={() => { if (!pendingLeave) return; leaveApproved.current = pendingLeave.navigates; pendingLeave.action(); setPendingLeave(null); }}>{pendingLeave.warning ? '确认离开' : '放弃更改并离开'}</button></div></div></div>}
  </main>;
}
