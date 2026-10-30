import { useState } from 'react';
import { Button, DemoNotice, ServiceUnavailable, demoRoute, useDemoRole, isDemoPreview } from '../site';
import { paths } from '../config';
import { demoTenants, getDemoAuth, selectDemoTenant } from '../issuerDemo';

type ExampleOrg = { name: string; role: string; plan: 'Free' | 'Standard'; environment: string; subscription: boolean; short: string };
const examples: ExampleOrg[] = [
  { name: '示例资产管理公司', role: '企业管理员', plan: 'Free', environment: 'Sandbox / 测试模式', subscription: true, short: '示例工作台 A' },
  { name: '示例发行企业', role: '普通成员', plan: 'Free', environment: 'Sandbox / 测试模式', subscription: false, short: '示例工作台 B' },
  { name: '示例运营机构', role: '企业管理员', plan: 'Standard', environment: '正式能力仍受业务授权限制', subscription: true, short: '示例工作台 C' },
  { name: '新注册演示企业', role: '企业管理员', plan: 'Free', environment: 'Sandbox / 测试模式', subscription: true, short: '首次使用 · 空工作台' },
];
function mask(value?: string) { const [local, domain] = (value || '').split('@'); return local && domain ? `${local[0]}***@${domain}` : '演示账户'; }

export function Organizations() {
  const [role] = useDemoRole();
  const demoMode = isDemoPreview();
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  const registration = (() => { try { return JSON.parse(sessionStorage.getItem('wdex-registration-demo') || '{}') as { email?: string }; } catch { return {}; } })();
  const [query, setQuery] = useState('');
  const [entryResult, setEntryResult] = useState('unavailable');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState('');
  if (!demoMode) return <ServiceUnavailable title="企业工作台访问暂未开放" description="当前无法核验企业授权或加载工作台列表。账户服务开放后，用户可按权限选择企业。" />;
  const auth = getDemoAuth();
  const authorized = demoMode && auth?.role === role ? role === 'multiple' ? examples : role === 'none' || role === 'visitor' ? [] : role === 'standard' ? examples.slice(2, 3) : examples.slice(0, 1) : [];
  const filtered = authorized.filter(org => org.name.includes(query.trim()));
  const enter = (org: ExampleOrg, subscribe: boolean) => {
    setSelected(org.name);
    if (entryResult === 'allowed') {
      const target = demoTenants.find(item => item.name === org.name);
      if (getDemoAuth() && target && (!subscribe || target.canSubscribe) && selectDemoTenant(target.id)) {
        location.href = paths.issuer + '?demo=1' + (standardIntent ? '&intent=standard' : '');
        return;
      }
      setNotice('模拟登录或企业授权已失效，请从企业登录重新验证。');
      return;
    }
    setNotice(!demoMode || entryResult === 'unavailable' ? '暂时无法确认进入结果，请重试。当前没有受控企业空间会话与企业工作台工作台，不会切换企业。' : entryResult === 'revoked' ? '您已失去该企业的访问权限。不会自动选择其他企业。' : entryResult === 'restricted' ? '该企业目前无法访问。不会进入工作台。' : entryResult === 'expired' ? '登录会话已失效，请重新登录后核验企业授权。' : subscribe && !org.subscription ? '您没有该企业的订阅管理权限，请联系企业管理员。' : subscribe ? '模拟核验通过：正式服务将进入所选企业企业工作台自助Standard订阅。当前预览不创建账单，也不更改商业权益。' : '模拟核验通过：正式服务将进入所选企业企业工作台。当前预览不提供真实企业空间或企业业务数据。');
  };
  return <main className="organizations-page"><section className="organizations-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">WORKSPACE SELECTION</span><h1>选择您要进入的企业</h1><p>您的账户可以访问多个企业工作台。请选择本次需要管理的企业。</p><div className="organizations-account"><span>当前账户</span><strong>{mask(registration.email)}</strong><span>{demoMode ? `演示：您当前可以访问 ${authorized.length} 个企业工作台。` : '授权企业数量待服务端确认'}</span></div><p className="organizations-boundary">不同企业的业务数据和操作权限相互独立。切换企业不会改变其他企业的数据。</p></div></section><section className="section organizations-content"><div className="container">{standardIntent && <div className="register-intent">请选择需要订阅Standard的企业工作台。订阅仅对选中的企业生效；仍需核验该企业的订阅管理权限。</div>}{!demoMode ? <div className="organization-empty"><h2>暂时无法加载企业列表，请重试</h2><p>当前预览未接通认证会话和企业授权服务，无法确认任何企业的访问权限。</p><div className="button-row"><Button href={demoRoute(paths.login)}>重新登录</Button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div></div> : authorized.length === 0 ? <div className="organization-empty"><h2>暂无可访问的企业工作台</h2><p>当前账户暂时没有获得有效的企业访问权限。您可以检查企业邀请或联系相关管理员。</p><div className="button-row"><Button href={paths.home}>返回官网首页</Button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div></div> : <><div className="organizations-list-header"><div><span className="eyebrow">AUTHORIZED WORKSPACES / 演示列表</span><h2>您的企业工作台</h2><p>仅显示模拟的当前可访问工作台；不代表真实客户或企业授权记录。</p></div><label>查找企业<input type="search" placeholder="搜索企业名称" value={query} onChange={e => setQuery(e.target.value)} /></label></div>{filtered.length === 0 ? <div className="organization-empty"><h2>未找到匹配的企业</h2><p>请更换关键词，或清除搜索条件。</p><button className="button button-outline" onClick={() => setQuery('')}>清除搜索 <span aria-hidden="true">↗</span></button></div> : <div className="organization-grid">{filtered.map(org => <article key={org.name}><div className="organization-card-top"><span className="organization-avatar">▰</span><span className="organization-state">演示 · 当前可访问</span></div><h3>{org.name}</h3><p className="organization-short">{org.short} · 非法定企业名称</p><div className="organization-facts"><div><span>我的角色</span><strong>{org.role}</strong></div><div><span>当前方案</span><strong>{org.plan}</strong></div><div><span>工作环境</span><strong>{org.environment}</strong></div></div>{standardIntent && org.plan === 'Free' && org.subscription ? <button className="button button-primary" onClick={() => enter(org, true)}>继续订阅Standard <span aria-hidden="true">↗</span></button> : standardIntent && org.plan === 'Standard' && org.subscription ? <button className="button button-primary" onClick={() => enter(org, true)}>管理订阅 <span aria-hidden="true">↗</span></button> : <button className="button button-primary" onClick={() => enter(org, false)}>进入工作台 <span aria-hidden="true">↗</span></button>}{standardIntent && !org.subscription && <p className="organization-permission">您没有该企业的订阅管理权限，请联系企业管理员。</p>}</article>)}</div>}{notice && <div className="organization-feedback" role="status"><strong>{selected}</strong><p>{notice}</p>{entryResult === 'expired' && <Button href={demoRoute(paths.login + (standardIntent ? '?intent=standard' : ''))} variant="outline">重新登录</Button>}</div>}{demoMode && <div className="organization-demo"><label>演示进入结果<select value={entryResult} onChange={e => { setEntryResult(e.target.value); setNotice(''); }}><option value="unavailable">服务端不可用 / Unknown</option><option value="allowed">模拟再次鉴权通过</option><option value="revoked">成员资格已撤销</option><option value="restricted">企业访问受限</option><option value="expired">登录会话失效</option></select></label><small>演示控件不建立真实企业空间上下文，也不授予任何企业权限。</small></div>}</> }</div></section><div className="preview-strip"><DemoNotice /></div></main>;
}
