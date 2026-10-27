import { useEffect, useState, type ReactNode } from 'react';
import { Outlet } from '@tanstack/react-router';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { paths, site } from './config';
import { CookiePreferences } from './CookiePreferences';

export type DemoRole = 'visitor' | 'single' | 'multiple' | 'none' | 'no-subscription' | 'standard' | 'upgrading';

const useDemoStore = create<{ role: DemoRole; setRole: (role: DemoRole) => void }>()(
  persist(
    (set) => ({ role: 'visitor', setRole: (role) => set({ role }) }),
    { name: 'wdex-demo-role' },
  ),
);

export function useDemoRole(): [DemoRole, (role: DemoRole) => void] {
  const role = useDemoStore(state => state.role);
  const setRole = useDemoStore(state => state.setRole);
  return [new URLSearchParams(location.search).get('demo') === '1' ? role : 'visitor', setRole];
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  if (new URLSearchParams(location.search).get('demo') !== '1') return null;
  return <div className="demo-notice"><span className="status-dot" />{children || site.demoLabel}</div>;
}

export function Button({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: 'primary' | 'outline' | 'text'; className?: string }) {
  return <a className={`button button-${variant} ${className}`} href={href}>{children}<span aria-hidden="true">↗</span></a>;
}

export function SectionHeading({ eyebrow, title, description, center = false }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return <div className={`section-heading ${center ? 'center' : ''}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function ServiceUnavailable({ title, description }: { title: string; description: string }) {
  return <main className="service-unavailable"><div className="network-grid" /><div className="container"><span className="eyebrow">企业服务</span><h1>{title}</h1><p>{description}</p><div className="button-row"><Button href={paths.pricing}>了解套餐</Button><Button href={paths.help} variant="outline">查看帮助中心</Button></div></div></main>;
}

const nav = [
  ['首页', paths.home],
  ['产品功能', paths.features],
  ['解决方案', paths.solutions],
  ['套餐', paths.pricing],
  ['帮助中心', paths.help],
];

export function Header({ role }: { role: DemoRole }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const current = location.pathname;
  const workHref = role === 'multiple' ? paths.organizations : role === 'none' ? paths.register : paths.onboarding;
  return <header className="site-header">
    <div className="header-inner container">
      <a className="brand" href={paths.home} aria-label="WDEX SaaS 首页"><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a>
      <button className="menu-toggle" type="button" aria-label="切换导航" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="主导航">{nav.map(([label, href]) => <a key={href} className={current === href ? 'active' : ''} href={href}>{label}</a>)}</nav>
      <div className="header-actions"><a className="login-link" href={paths.login}>登录</a><Button href={role === 'visitor' ? paths.pricing : workHref}>{role === 'visitor' ? '了解套餐' : '进入工作台'}</Button></div>
    </div>
  </header>;
}

export function Footer({ onCookies }: { onCookies: () => void }) {
  return <footer className="site-footer"><div className="container footer-inner">
    <div className="footer-brand"><a className="brand" href={paths.home}><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a><p>面向发行机构的多资产Token化SaaS。<br />以有序的技术工作流连接资产、发行与投资者。</p></div>
    <div className="footer-column"><strong>产品</strong><a href={paths.features}>产品功能</a><a href={paths.solutions}>解决方案</a><a href={paths.pricing}>套餐</a></div>
    <div className="footer-column"><strong>支持</strong><a href={paths.help}>帮助中心</a><a href={paths.contact}>联系我们</a></div>
    <div className="footer-column"><strong>法律与政策</strong><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a><a href={paths.policies + '/cookies'}>Cookie政策</a><a href={paths.policies + '/disclaimer'}>免责声明</a><button type="button" onClick={onCookies}>本地存储说明</button></div>
  </div></footer>;
}

function AuthHeader() { return <header className="auth-header"><div className="container"><a className="brand" href={paths.home} aria-label="WDEX SaaS 首页"><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a></div></header>; }
function AuthFooter() { return <footer className="auth-footer"><div className="container"><span>WDEX SaaS · 企业账户</span><nav aria-label="验证帮助"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a></nav></div></footer>; }

export function App() {
  const [role, setRole] = useDemoRole();
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const compactAuth = location.pathname === paths.verify || location.pathname === paths.login || location.pathname === paths.onboarding || location.pathname === paths.organizations;
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      [paths.home]: '面向发行机构的多资产Token化SaaS',
      [paths.features]: '产品功能', [paths.solutions]: '解决方案', [paths.pricing]: '套餐与订阅',
      [paths.help]: '帮助中心', [paths.contact]: '联系我们', [paths.policies]: '法律与政策',
      [paths.register]: '创建企业账户', [paths.verify]: '验证邮箱', [paths.login]: '登录',
      [paths.onboarding]: '开通Free工作台', [paths.organizations]: '选择企业', [paths.upgrade]: '升级Standard',
    };
    const page = pageTitles[location.pathname] || (location.pathname.startsWith(`${paths.policies}/`) ? '法律与政策' : 'WDEX SaaS');
    document.title = `${page}｜${site.brand}`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = 'WDEX SaaS为发行机构提供资产、项目、投资者门户、认购、Token与发行后管理工具。';
  }, []);
  return <>
    {compactAuth ? <AuthHeader /> : <Header role={role} />}
    {demoMode && <div className="scenario-bar"><span>{site.demoLabel}</span><label>访客/授权场景：<select value={role} onChange={e => setRole(e.target.value as DemoRole)}><option value="visitor">访客</option><option value="single">单企业Free管理员</option><option value="multiple">多企业</option><option value="none">无有效企业授权</option><option value="no-subscription">Free无订阅权限</option><option value="standard">已开通Standard</option><option value="upgrading">升级处理中</option></select></label></div>}
    <Outlet />
    {compactAuth ? <AuthFooter /> : <Footer onCookies={() => setCookiesOpen(true)} />}
    <CookiePreferences open={cookiesOpen} setOpen={setCookiesOpen} />
  </>;
}
