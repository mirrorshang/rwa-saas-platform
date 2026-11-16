import { useState } from 'react';
import { Button, ServiceUnavailable, isDemoPreview } from '../site';
import { useDemoControls } from '../demoControls';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';
import { beginNewTenantDraft, getActiveTenantIntent, getAuthorizedTenants, getDemoAccount, getDemoAuth, selectDemoTenant, type DemoTenant } from '../issuerDemo';

export function Organizations() {
  const demo = isDemoPreview();
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const intent = entryIntent();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const entryResult = useDemoControls(state => state.controls.access);
  if (!demo) return <ServiceUnavailable title="企业选择暂未开放" description="当前没有真实企业授权服务。" />;
  if (!auth) return <main className="issuer-block"><h1>请先登录企业账号</h1><p>当前登录已失效，无法查看企业列表。</p><Button href={entryPath(paths.login, intent)}>返回企业登录</Button></main>;
  const authorized = getAuthorizedTenants().slice(0, 1);
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
  return <main className="mvp-entry-page mvp-organizations"><section className="mvp-entry-card">
    <div className="mvp-card-head"><div><span className="eyebrow">企业工作台</span><h1>我的企业</h1><p>一个账号对应一个企业。</p></div>{!authorized.length && account?.canCreate && <button className="button button-outline" type="button" onClick={create}>创建企业</button>}</div>
    {intent === 'standard' && <p className="mvp-hint">Standard 订阅意向已保留，请先选择对应企业。</p>}
    {account?.invitationPending && <p role="status">您有待处理的企业邀请，请联系企业管理员确认。</p>}
    {authorized.length > 3 && <label>查找企业<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索企业名称" /></label>}
    {authorized.length === 0 ? <div className="mvp-empty"><h2>尚未创建企业</h2><p>创建企业后即可继续完成认证。</p>{account?.canCreate && <button className="button button-primary" type="button" onClick={create}>创建企业</button>}</div> : filtered.length ? <div className="mvp-org-list">{filtered.map(tenant => <article key={tenant.id}><div><h2>{tenant.name}</h2><p>当前套餐：{tenant.plan}</p></div><button className="button button-primary" type="button" onClick={() => enter(tenant)}>进入工作台</button></article>)}</div> : <div className="mvp-empty"><p>未找到匹配的企业。</p><button type="button" onClick={() => setQuery('')}>清除搜索</button></div>}
    {notice && <div className="organization-feedback" role="alert"><p>{notice}</p>{recover && <Button href={entryPath(paths.onboarding, intent)} variant="outline">查看原创建申请</Button>}</div>}
  </section></main>;
}
