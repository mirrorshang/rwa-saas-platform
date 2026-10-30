import { useState } from 'react';
import { paths } from '../config';
import { beginNewTenantDraft, clearDemoContext, getAuthorizedTenants, getDemoAccount, getDemoAuth, getDemoTenant, selectDemoTenant, type DemoTenant } from '../issuerDemo';

const nav = ['工作台首页', '资产与发行', '投资者门户', '投资者与认购', '资金与结算', 'Token管理', '收益与分配', '数据与报表', '企业设置'];
type Panel = 'ready' | 'loading' | 'failed' | 'unknown';
const samples: Record<string, { assets: number; projects: { name: string; asset: string; offering: string; status: string }[]; tasks: string[]; issues: string[] }> = {
  assetco: { assets: 3, projects: [{ name: '示例项目 · 仓储资产', asset: '仓储设施 A', offering: '演示轮次 01', status: '资料准备中' }, { name: '示例项目 · 应收账款', asset: '应收账款 B', offering: '演示轮次 02', status: '内部审核中' }], tasks: ['核对项目资料完整性', '检查发行方案披露草稿'], issues: ['一项模拟文件待补充'] },
  issuerco: { assets: 1, projects: [{ name: '示例项目 · 设备资产', asset: '设备资产 C', offering: '演示轮次 03', status: '草稿' }], tasks: ['确认项目基础资料'], issues: [] },
  operator: { assets: 2, projects: [{ name: '示例项目 · 运营资产', asset: '运营资产 D', offering: '演示轮次 04', status: '内部审核中' }], tasks: ['复核门户展示内容'], issues: ['生产发行许可尚未核实'] },
  newco: { assets: 0, projects: [], tasks: [], issues: [] },
};

function StateCard({ title, state, onRetry }: { title: string; state: Panel; onRetry: () => void }) {
  return <section className="issuer-card issuer-state" role="status"><h2>{title}</h2><p>{state === 'loading' ? '正在加载该区块的模拟数据…' : state === 'failed' ? '该数据暂不可用，其他信息仍可查看。' : '结果暂无法核实；请查询原记录，不会将未知结果显示为成功。'}</p>{state !== 'loading' && <button className="issuer-link" onClick={onRetry}>重试该区块</button>}</section>;
}
function NotBuilt({ label }: { label: string }) { return <section className="issuer-card issuer-empty"><h2>{label} · 尚未实现</h2><p>本批仅实现 I-01 工作台首页。该业务模块正在设计中，当前不会创建或更改任何业务记录。</p><a href={paths.help}>查看帮助中心</a></section>; }

function Dashboard({ tenant, state, onRetry }: { tenant: DemoTenant; state: Panel; onRetry: () => void }) {
  const data = samples[tenant.id] || { assets: 0, projects: [], tasks: [], issues: [] };
  return <>
    <div className="issuer-intro"><div><p className="issuer-kicker">I-01 / 企业工作台首页</p><h1>{tenant.empty ? '您的企业工作台已准备就绪' : '工作台首页'}</h1><p>当前企业：{tenant.name} · {tenant.role} · {tenant.plan === 'Free' ? 'Free · Sandbox（模拟）' : 'Standard · 商业订阅（模拟）'}</p></div><span className="issuer-badge">Mock 数据 · 非生产</span></div>
    <section className="issuer-card issuer-welcome"><div><strong>{tenant.empty ? '先完善企业资料，再开始准备发行项目。' : '今天的工作，从已授权的项目开始。'}</strong><p>资产、发行项目与发行方案分别管理；当前界面每个发行项目仅展示一项主要资产。</p></div><button className="issuer-link" onClick={() => document.getElementById('issuer-next')?.scrollIntoView()}>查看业务下一步 →</button></section>
    <div className="issuer-section-title"><h2>我的工作概况</h2><small>仅当前演示 企业空间 · 数量不代表真实业务</small></div>
    {state === 'ready' ? <div className="issuer-metrics"><article><span>资产</span><strong>{data.assets}</strong><small>当前企业已授权范围</small></article><article><span>发行项目</span><strong>{data.projects.length}</strong><small>多项目独立管理</small></article><article><span>进行中发行轮次</span><strong>{data.projects.length}</strong><small>每项隶属明确发行项目</small></article><article><span>认购订单</span><strong>—</strong><small>订单来源未接入</small></article><article><span>实际匹配实收</span><strong>—</strong><small>资金来源未接入</small></article><article><span>配售结果</span><strong>—</strong><small>配售结果待核</small></article><article><span>法定登记</span><strong>—</strong><small>名册来源未接入</small></article><article><span>Token 链结果</span><strong>—</strong><small>链来源未接入</small></article></div> : <StateCard title="工作概况" state={state} onRetry={onRetry} />}
    <div className="issuer-grid"><section className="issuer-card issuer-projects"><div className="issuer-card-head"><div><h2>进行中的发行项目与发行轮次</h2><p>资产、项目、发行轮次逐级关联</p></div><span>Mock 列表</span></div>{state === 'ready' ? data.projects.length ? <div className="issuer-table-wrap"><table><thead><tr><th>发行项目</th><th>主要资产</th><th>关联发行轮次</th><th>模拟状态</th></tr></thead><tbody>{data.projects.map(item => <tr key={item.name}><td>{item.name}</td><td>{item.asset}</td><td>{item.offering}</td><td><span className="issuer-status">{item.status}</span></td></tr>)}</tbody></table></div> : <div className="issuer-empty"><h3>还没有发行项目</h3><p>先建立资产档案，再准备第一个发行项目；新建页面尚未实现。</p></div> : <StateCard title="项目与发行概况" state={state} onRetry={onRetry} />}</section><div className="issuer-side"><section className="issuer-card"><h2>我的待办</h2>{data.tasks.length ? <ul>{data.tasks.map(x => <li key={x}>{x}<small>模拟待办 · 不代表审批完成</small></li>)}</ul> : <p>当前没有演示待办。</p>}</section><section className="issuer-card"><h2>异常与待核</h2>{data.issues.length ? <ul>{data.issues.map(x => <li key={x}>{x}<small>请回原业务核实；本页不改变业务真值</small></li>)}</ul> : <p>当前没有已知演示异常；真实状态未接入。</p>}</section></div></div>
    <div className="issuer-grid issuer-bottom"><section id="issuer-next" className="issuer-card"><h2>新手引导 / 业务下一步</h2><ol><li>建立资产及权益结构档案 <span>页面尚未实现</span></li><li>创建发行项目，选择一项主要资产 <span>页面尚未实现</span></li><li>在发行项目下准备发行方案 <span>页面尚未实现</span></li></ol><p>这些步骤仅供导航设计评审，不会保存或提交真实业务。</p></section><section className="issuer-card issuer-plan"><h2>订阅与环境</h2><strong>{tenant.plan === 'Free' ? 'Free · 永久 Sandbox' : 'Standard · 商业订阅'}</strong><p>{tenant.plan === 'Free' ? '模拟资金、Token、订单与权益均不产生真实效力。' : '已开通 Standard 不代表真实发行、资金执行、Token 操作或 WDEX投资者平台展示获准。'}</p><a href={paths.pricing}>查看官网订阅说明 →</a></section></div>
  </>;
}

export function IssuerWorkspace() {
  const [section, setSection] = useState(nav[0]);
  const [panel, setPanel] = useState<Panel>('ready');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setTenantId] = useState(() => getDemoTenant()?.id || '');
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const access = new URLSearchParams(location.search).get('access');
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  const baseQuery = '?demo=1' + (standardIntent ? '&intent=standard' : '');
  const auth = getDemoAuth();
  const account = getDemoAccount();
  const authorized = getAuthorizedTenants();
  const tenant = demo && auth ? getDemoTenant() : null;
  if (!demo || !auth || !tenant || access === 'expired' || access === 'revoked' || access === 'inactive') return <main className="issuer-block"><h1>无法进入企业工作台</h1><p>{access === 'expired' ? '演示会话已过期。' : access === 'revoked' ? '企业成员授权已撤销。' : access === 'inactive' ? '企业当前不可访问。' : '未核验到有效的模拟企业授权。'} 不展示原企业数据。</p><a className="button button-primary" href={paths.login + '?demo=1'}>返回企业登录</a><a href={paths.home}>返回官网</a></main>;
  const switchTenant = (id: string) => { if (!selectDemoTenant(id)) { setTenantId(''); return; } setSection(nav[0]); setPanel('ready'); setMobileOpen(false); setTenantId(id); };
  const display = tenant;
  const requested = new URLSearchParams(location.search).get('state');
  const state: Panel = requested === 'loading' || requested === 'failed' || requested === 'unknown' ? requested : panel;
  return <main className="issuer-shell"><aside className={`issuer-sidebar ${mobileOpen ? 'open' : ''}`}><a className="issuer-brand" href={paths.home}><span className="brand-mark"><i /><i /><i /></span> WDEX <b>SaaS</b></a><button className="issuer-sidebar-close" aria-label="关闭业务导航" onClick={() => setMobileOpen(false)}>×</button><span className="issuer-nav-label">发行机构工作台</span><nav aria-label="发行机构业务导航">{nav.map((item, index) => <button key={item} className={section === item ? 'active' : ''} aria-current={section === item ? 'page' : undefined} onClick={() => { setSection(item); setMobileOpen(false); }}>{String(index + 1).padStart(2, '0')} <span>{item}</span>{index > 0 && <small>待开发</small>}</button>)}</nav><div className="issuer-sidebar-foot">UI 演示 · 无真实认证或金融操作</div></aside><div className="issuer-main"><header className="issuer-topbar"><button className="issuer-menu" aria-label="打开业务导航" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>☰</button><label>当前企业 <select value={display.id} onChange={e => switchTenant(e.target.value)}>{authorized.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="issuer-top-plan">{display.plan} · {display.plan === 'Free' ? 'Sandbox' : '商业订阅'} · {display.role}</span><div className="issuer-top-actions">{account?.canCreate && <a href={paths.onboarding + baseQuery} onClick={event => { if (!beginNewTenantDraft()) event.preventDefault(); }}>创建新企业</a>}<a href={paths.help}>帮助</a><span title="通知模块待开发">通知 · 待开发</span><details><summary>演示账户 ▾</summary><div><span>{auth.email}</span><span>{display.role}</span><button onClick={() => { clearDemoContext(); location.href = paths.login + '?demo=1'; }}>退出演示</button></div></details></div></header><div className="issuer-content"><p className="issuer-crumb">工作台 / {section}</p>{standardIntent && display.plan === 'Free' && <section className="issuer-card issuer-intent" role="status"><strong>Standard订阅意向已保留</strong><p>当前企业仍为Free。登录与选择企业不会生成账单、收款或Standard权益；订阅操作页面尚未实现。</p></section>}{section === nav[0] ? <Dashboard key={display.id} tenant={display} state={state} onRetry={() => { history.replaceState(null, '', paths.issuer + baseQuery); setPanel('loading'); window.setTimeout(() => setPanel('ready'), 400); }} /> : <NotBuilt label={section} />}{demo && <div className="issuer-testbar"><label>Mock 区块状态 <select value={state} onChange={e => { history.replaceState(null, '', paths.issuer + baseQuery); setPanel(e.target.value as Panel); }}><option value="ready">正常</option><option value="loading">Loading</option><option value="failed">Failed</option><option value="unknown">Unknown</option></select></label><a href={paths.issuer + '?demo=1&access=expired'}>会话过期预览</a><a href={paths.issuer + '?demo=1&access=revoked'}>撤权预览</a></div>}</div></div></main>;
}
