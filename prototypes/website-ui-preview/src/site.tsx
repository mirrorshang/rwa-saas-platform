import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Outlet } from '@tanstack/react-router';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { marketplaceIsOpen, marketplaceLink, paths, site } from './config';
import { CookiePreferences } from './CookiePreferences';
import { getAuthorizedTenants, getDemoAccount, getDemoAuth, getDemoTenant, resetDemoScenario } from './issuerDemo';

export type DemoRole = 'visitor' | 'single' | 'multiple' | 'none' | 'create' | 'restricted' | 'invited' | 'no-subscription' | 'standard' | 'upgrading';

const useDemoStore = create<{ role: DemoRole; setRole: (role: DemoRole) => void }>()(
  persist(
    (set) => ({ role: 'visitor', setRole: (role) => set({ role }) }),
    { name: 'wdex-demo-role' },
  ),
);

export function useDemoRole(): [DemoRole, (role: DemoRole) => void] {
  const role = useDemoStore(state => state.role);
  const setRole = useDemoStore(state => state.setRole);
  return [isDemoPreview() ? role : 'visitor', setRole];
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  if (!isDemoPreview()) return null;
  return <div className="demo-notice"><span className="status-dot" />{children || site.demoLabel}</div>;
}

export function Button({ href, children, variant = 'primary', className = '' }: { href: string; children: ReactNode; variant?: 'primary' | 'outline' | 'text'; className?: string }) {
  return <a className={`button button-${variant} ${className}`} href={href}>{children}<span aria-hidden="true">↗</span></a>;
}

export function SectionHeading({ eyebrow, title, description, center = false }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return <div className={`section-heading ${center ? 'center' : ''}`}>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function ServiceUnavailable({ title, description }: { title: string; description: string }) {
  return <main className="service-unavailable"><div className="network-grid" /><div className="container"><span className="eyebrow">企业服务</span><h1>{title}</h1><p>{description}</p><div className="button-row"><Button href={paths.help}>查看使用指南</Button><Button href={paths.pricing} variant="outline">查看订阅方案</Button></div></div></main>;
}

const nav = [
  ['产品功能', paths.features],
  ['解决方案', paths.solutions],
  ['订阅方案', paths.pricing],
  ['帮助中心', paths.help],
];

export function isLocalPreview() {
  return location.hostname === 'localhost' || /^127(?:\.\d{1,3}){3}$/.test(location.hostname) || location.hostname === '[::1]';
}

export function isDemoPreview() {
  return isLocalPreview() && new URLSearchParams(location.search).get('demo') === '1';
}

export function demoRoute(path: string) {
  return isLocalPreview() ? `${path}${path.includes('?') ? '&' : '?'}demo=1` : path;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const current = location.pathname;
  const auth = getDemoAuth();
  const tenants = getAuthorizedTenants();
  const workHref = tenants.length > 1 || (tenants.length === 1 && !getDemoTenant()) ? paths.organizations : tenants.length === 1 ? paths.issuer : getDemoAccount()?.canCreate ? paths.onboarding : paths.organizations;
  const enterpriseHref = demoRoute(auth ? workHref : paths.login);
  const enterpriseLabel = auth ? '进入工作台' : '企业登录';

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuToggle.current?.focus();
      }
    };
    const onResize = () => { if (window.innerWidth > 850) setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const navIsActive = (href: string) => current === href;

  return <header className="site-header">
    <div className="header-inner container">
      <a className="brand" href={paths.home} aria-label="WDEX SaaS 首页"><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a>
      <button ref={menuToggle} className="menu-toggle" type="button" aria-label="切换导航" aria-controls="site-main-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      <nav id="site-main-nav" className={'main-nav' + (menuOpen ? ' open' : '')} aria-label="主导航" onClick={event => { if (event.target instanceof Element && event.target.closest('a')) setMenuOpen(false); }}>
        {nav.map(([label, href]) => {
          const active = navIsActive(href);
          return <a key={label} className={active ? 'active' : ''} href={href} aria-current={active ? 'page' : undefined}>{label}</a>;
        })}
        <div className="mobile-nav-actions"><a className="login-link" href={enterpriseHref}>{enterpriseLabel}</a><Button href={paths.investorPlatform}>投资者平台</Button></div>
      </nav>
      <div className="header-actions"><a className="login-link" href={enterpriseHref}>{enterpriseLabel}</a><Button href={paths.investorPlatform}>投资者平台</Button></div>
    </div>
  </header>;
}

export function Footer({ onCookies }: { onCookies: () => void }) {
  return <footer className="site-footer"><div className="container footer-inner">
    <div className="footer-brand"><a className="brand" href={paths.home}><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a><p>面向发行机构的多资产Token化SaaS。<br />以有序的技术工作流连接资产、发行与投资者。</p></div>
    <div className="footer-column"><strong>产品</strong><a href={paths.features}>产品功能</a><a href={paths.solutions}>解决方案</a><a href={paths.pricing}>订阅方案</a><a href={marketplaceLink}>投资者平台{!marketplaceIsOpen ? '（筹备中）' : ''}</a></div>
    <div className="footer-column"><strong>支持</strong><a href={paths.help}>帮助中心</a><a href={paths.contact}>联系我们</a></div>
    <div className="footer-column"><strong>法律与政策</strong><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a><a href={paths.policies + '/cookies'}>Cookie政策</a><a href={paths.policies + '/disclaimer'}>免责声明</a><button type="button" onClick={onCookies}>本地存储说明</button></div>
  </div></footer>;
}

function AuthHeader() { return <header className="auth-header"><div className="container"><a className="brand" href={paths.home} aria-label="WDEX SaaS 首页"><span className="brand-mark"><i /><i /><i /></span>{site.brand}</a></div></header>; }
function AuthFooter() { return <footer className="auth-footer"><div className="container"><span>WDEX SaaS · 企业账户</span><nav aria-label="验证帮助"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a></nav></div></footer>; }

export function App() {
  const [role, setRole] = useDemoRole();
  const [cookiesOpen, setCookiesOpen] = useState(false);
  const demoMode = isDemoPreview();
  const compactAuth = location.pathname === paths.register || location.pathname === paths.verify || location.pathname === paths.login || location.pathname === paths.onboarding || location.pathname === paths.organizations;
  const issuerPage = location.pathname === paths.issuer;
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      [paths.home]: '面向发行机构的多资产Token化SaaS',
      [paths.features]: '产品功能', [paths.solutions]: '解决方案', [paths.pricing]: '订阅方案', [paths.investorPlatform]: '投资者平台筹备说明',
      [paths.help]: '帮助中心', [paths.contact]: '联系我们', [paths.policies]: '法律与政策',
      [paths.register]: '账号确认', [paths.verify]: '验证邮箱', [paths.login]: '登录',
      [paths.onboarding]: '创建企业工作台', [paths.organizations]: '选择企业', [paths.upgrade]: '升级Standard',
    };
    const page = pageTitles[location.pathname] || (location.pathname.startsWith(`${paths.policies}/`) ? '法律与政策' : 'WDEX SaaS');
    document.title = `${issuerPage ? '发行机构工作台' : page}｜${site.brand}`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = 'WDEX SaaS为发行机构提供资产、项目、投资者门户、认购、Token与发行后管理工具。';
  }, []);
  if (issuerPage) return isLocalPreview() ? <Outlet /> : <ServiceUnavailable title="企业工作台暂未开放" description="当前公开网站不提供模拟企业登录或真实工作台访问。" />;
  return <>
    {compactAuth ? <AuthHeader /> : <Header />}
    {demoMode && <div className="scenario-bar"><span>{site.demoLabel}</span><label>访客/授权场景：<select value={role} onChange={e => { resetDemoScenario(); setRole(e.target.value as DemoRole); }}><option value="visitor">访客</option><option value="single">单企业Free管理员</option><option value="multiple">多企业</option><option value="create">无企业，可创建</option><option value="restricted">受限账号</option><option value="invited">待处理邀请</option><option value="none">无有效企业授权</option><option value="no-subscription">Free无订阅权限</option><option value="standard">已开通Standard</option><option value="upgrading">升级处理中</option></select></label></div>}
    <Outlet />
    {compactAuth ? <AuthFooter /> : <Footer onCookies={() => setCookiesOpen(true)} />}
    <CookiePreferences open={cookiesOpen} setOpen={setCookiesOpen} />
  </>;
}
