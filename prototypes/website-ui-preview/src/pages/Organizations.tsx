import { useState } from 'react';
import { Button, DemoNotice, ServiceUnavailable, isDemoPreview } from '../site';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';
import { beginNewTenantDraft, getActiveTenantIntent, getAuthorizedTenants, getDemoAccount, getDemoAuth, selectDemoTenant, type DemoTenant } from '../issuerDemo';

function mask(value: string) { const [name, domain] = value.split('@'); return name && domain ? `${name[0]}***@${domain}` : '***'; }
export function Organizations() {
  const demo = isDemoPreview();
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const intent = entryIntent();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [entryResult, setEntryResult] = useState('allowed');
  if (!demo) return <ServiceUnavailable title="企业选择暂未开放" description="当前没有真实企业授权服务。" />;
  if (!auth) return <main className="issuer-block"><h1>请先登录企业账号</h1><p>没有有效Mock会话，不展示企业列表。</p><Button href={entryPath(paths.login, intent)}>返回企业登录</Button></main>;
  const authorized = getAuthorizedTenants();
  const active = getActiveTenantIntent();
  const recover = active && ['processing', 'unknown', 'partial'].includes(active.status);
  const filtered = authorized.filter(tenant => tenant.name.includes(query.trim()));
  const create = () => {
    if (recover) { setNotice(active?.status === 'partial' ? '原申请中的企业已创建，Free权益仍待确认。请查看原创建申请。' : active?.status === 'unknown' ? '原创建申请结果未知。请查询原申请，避免重复创建。' : '原创建申请正在处理中，请查看原申请状态。'); return; }
    if (!account?.canCreate || !beginNewTenantDraft()) { setNotice('当前账号无法开始新的企业创建申请。'); return; }
    location.href = entryPath(paths.onboarding, intent);
  };
  const enter = (tenant: DemoTenant) => {
    if (entryResult !== 'allowed') { setNotice(entryResult === 'expired' ? '会话已过期，请重新登录。' : entryResult === 'revoked' ? '成员权限已撤销，不能进入该企业。' : '企业访问结果无法确认，不会切换企业。'); return; }
    if (!getDemoAuth() || !getAuthorizedTenants().some(item => item.id === tenant.id) || !selectDemoTenant(tenant.id)) { setNotice('当前企业授权已失效，请重新登录核实。'); return; }
    location.href = entryPath(paths.issuer, intent);
  };
  return <main className="organizations-page"><section className="organizations-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">W-12 / WORKSPACE SELECTION</span><h1>选择您要进入的企业</h1><p>仅显示当前演示账号有权访问的企业工作台。</p><div className="organizations-account"><span>当前账号</span><strong>{mask(auth.email)}</strong><span>{authorized.length} 家有效企业</span></div><p className="organizations-boundary">企业之间的数据和权限相互隔离；选择企业不会创建订阅或授予额外权限。</p></div></section><section className="section organizations-content"><div className="container">{intent === 'standard' && <p className="register-intent">Standard意向已保留。仅有该企业订阅管理权限的成员可以继续申请；当前不会生成账单。</p>}{account?.invitationPending && <p className="register-intent">您有待处理的企业邀请。当前演示不会自动接受邀请或授予企业成员权限。</p>}
    {authorized.length === 0 ? <div className="organization-empty"><h2>您还没有创建或加入企业工作台</h2><p>{account?.canCreate ? '请明确创建第一家Free Sandbox企业。' : '当前账号没有企业访问或创建资格，请联系企业管理员或支持。'}</p><div className="button-row">{account?.canCreate && <button className="button button-primary" type="button" onClick={create}>创建企业 ↗</button>}<Button href={paths.help} variant="outline">查看帮助中心</Button></div></div> : <><div className="organizations-list-header"><div><span className="eyebrow">AUTHORIZED WORKSPACES / Mock</span><h2>您的企业工作台</h2><p>当前浏览器会话中的示例记录，不代表真实企业或商业权益。</p></div><label>查找企业<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索企业名称" /></label></div>{filtered.length ? <div className="organization-grid">{filtered.map(tenant => <article key={tenant.id}><div className="organization-card-top"><span className="organization-avatar">▰</span><span className="organization-state">演示 · 当前可访问</span></div><h3>{tenant.name}</h3><p className="organization-short">{tenant.empty ? '新建空工作台' : '示例工作台'} · 非法定企业名称</p><div className="organization-facts"><div><span>我的角色</span><strong>{tenant.role}</strong></div><div><span>当前方案</span><strong>{tenant.plan}</strong></div><div><span>工作环境</span><strong>{tenant.plan === 'Free' ? 'Sandbox / 测试模式' : '商业订阅Mock；生产权限另行核验'}</strong></div></div><button className="button button-primary" type="button" onClick={() => enter(tenant)}>{intent === 'standard' && tenant.canSubscribe ? tenant.plan === 'Standard' ? '进入工作台管理订阅 ↗' : '进入工作台继续升级 ↗' : '进入企业工作台 ↗'}</button>{intent === 'standard' && <p className="organization-permission">{tenant.canSubscribe ? '可在工作台继续查看升级意向；订阅页面尚未实现。' : '您没有该企业的订阅管理权限。'}</p>}</article>)}</div> : <div className="organization-empty"><h2>未找到匹配的企业</h2><button className="button button-outline" type="button" onClick={() => setQuery('')}>清除搜索 ↗</button></div>}<div className="organization-create"><h2>还需要管理另一家企业？</h2><p>新企业会有独立的Free权益、成员关系和业务数据。</p>{account?.canCreate ? <button className="button button-outline" type="button" onClick={create}>创建新企业 ↗</button> : <p>当前账号没有创建资格。</p>}</div></>}{notice && <div className="organization-feedback" role="alert"><p>{notice}</p>{recover && <Button href={entryPath(paths.onboarding, intent)} variant="outline">查看原创建申请</Button>}</div>}<div className="organization-demo"><label>Mock进入结果<select value={entryResult} onChange={event => setEntryResult(event.target.value)}><option value="allowed">再次鉴权通过</option><option value="revoked">成员被撤权</option><option value="expired">会话过期</option><option value="unknown">结果未知</option></select></label><small>演示控件不能授予真实企业权限。</small></div></div></section><div className="preview-strip"><DemoNotice /></div></main>;
}
