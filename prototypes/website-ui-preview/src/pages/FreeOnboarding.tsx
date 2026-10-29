import { useState } from 'react';
import { Button, DemoNotice, ServiceUnavailable, useDemoRole } from '../site';
import { paths } from '../config';
import { beginNewTenantDemo } from '../issuerDemo';

type View = 'processing' | 'success' | 'failure' | 'auth';
const steps = ['确认账户与注册信息', '检查或创建企业工作台', '启用Free Sandbox权益', '准备进入工作台'];
const abilities = [
  ['管理资产与发行项目', '创建模拟资产、金融工具、项目和发行轮次，了解主要发行管理流程。'],
  ['配置投资者门户', '体验机构专属的模拟投资者门户及发行轮次展示。'],
  ['模拟认购与发行后管理', '演练投资者资格、认购、Token交付、资金状态和收益管理。'],
];
function mask(value?: string) { const [local, domain] = (value || '').split('@'); return local && domain ? `${local[0]}***@${domain}` : '未提供'; }

export function FreeOnboarding() {
  const [role] = useDemoRole();
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  const registration = (() => { try { return JSON.parse(sessionStorage.getItem('wdex-registration-demo') || '{}') as { email?: string }; } catch { return {}; } })();
  const verifiedDemo = demoMode && sessionStorage.getItem('wdex-verification-demo') === 'verified';
  const [view, setView] = useState<View>(verifiedDemo ? 'processing' : 'auth');
  const [notice, setNotice] = useState('');
  if (!demoMode) return <ServiceUnavailable title="Free工作台开通暂未开放" description="账户验证、企业授权及工作台开通服务尚未接入。您可以先了解Free与Standard方案。" />;
  const retry = () => setNotice('暂时无法确认开通结果，请重试查询。当前没有接通Tenant及Free权益服务，未新建工作台。');
  const enter = () => {
    if (view === 'success' && verifiedDemo) { beginNewTenantDemo(); location.href = paths.issuer + '?demo=1' + (standardIntent ? '&intent=standard' : ''); return; }
    if (role === 'visitor' || role === 'none') { location.href = paths.login + (standardIntent ? '?intent=standard' : ''); return; }
    if (role === 'multiple') { location.href = paths.organizations + (standardIntent ? '?intent=standard&demo=1' : '?demo=1'); return; }
    setNotice('当前仅为UI演示，尚未建立真实企业会话或I端工作台入口。进入正式工作台前必须核验Tenant及角色授权。');
  };
  return <main className="onboarding-page"><div className="onboarding-glow" /><div className="onboarding-card"><div className="onboarding-icon">{view === 'success' ? '✓' : view === 'processing' ? '▣' : view === 'auth' ? '◎' : '!'}</div><span className="eyebrow">FREE WORKSPACE / 工作台开通</span>
    {view === 'processing' && <><h1>正在为您开通工作台</h1><p>邮箱验证已完成。我们正在检查您的账户并准备永久免费Free工作台。</p><div className="onboarding-steps">{steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</div>)}</div><p className="onboarding-note">请勿重复注册。即使您刷新页面，系统也会检查原有开通进度。</p><button className="button button-outline" onClick={retry}>检查原开通进度 <span aria-hidden="true">↗</span></button></>}
    {view === 'success' && <><h1>您的免费工作台已准备就绪</h1><p>欢迎使用WDEX SaaS！您的Free工作台现已开通，可以开始探索资产发行管理流程。</p><div className="onboarding-summary"><div><span>账户邮箱</span><strong>{mask(registration.email)}</strong></div><div><span>当前方案</span><strong>Free</strong></div><div><span>工作环境</span><strong>Sandbox / 测试模式</strong></div><div><span>使用期限</span><strong>永久免费，无固定试用到期时间</strong></div><div><span>企业工作台</span><strong>演示工作台，无真实Tenant</strong></div><div><span>开通结果</span><strong>模拟已开通</strong></div></div><h2>开始探索您的Free工作台</h2><div className="onboarding-abilities">{abilities.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><p className="onboarding-boundary">Free为Sandbox测试环境。所有模拟投资者、订单、资金、Token和权益均不构成真实金融交易或法定权利。</p>{standardIntent && <p className="register-intent">您可以继续申请Standard订阅。完成相应商业KYB、合同确认和USDT账单付款后，才能获得Standard商业权益。</p>}<div className="button-row">{standardIntent ? <button className="button button-primary" onClick={enter}>继续订阅Standard <span aria-hidden="true">↗</span></button> : <button className="button button-primary" onClick={enter}>进入企业工作台 <span aria-hidden="true">↗</span></button>}{standardIntent ? <button className="button button-outline" onClick={enter}>先进入Free工作台 <span aria-hidden="true">↗</span></button> : <Button href={paths.features} variant="outline">了解产品功能</Button>}</div></>}
    {view === 'failure' && <><h1>暂时无法完成工作台开通</h1><p>我们暂时无法确认您的工作台开通结果。您可以重新检查当前状态，或联系支持团队获取帮助。</p><div className="button-row"><button className="button button-primary" onClick={retry}>重新检查开通状态 <span aria-hidden="true">↗</span></button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div></>}
    {view === 'auth' && <><h1>需要重新登录或确认授权</h1><p>{verifiedDemo ? '邮箱演示验证已完成，但尚无可用的企业授权会话。进入工作台前需重新登录并核验权限。' : '无法确认您的注册信息，请重新验证或登录。未经服务端验证与授权，不能开通或访问企业工作台。'}</p><div className="button-row"><Button href={paths.login + (standardIntent ? '?intent=standard' : '')}>企业账户登录</Button><Button href={paths.verify} variant="outline">返回邮箱验证</Button></div></>}
    {demoMode && <div className="onboarding-demo"><label>演示服务端结果<select value={view} onChange={e => { setView(e.target.value as View); setNotice(''); }}><option value="processing">处理中</option><option value="success">模拟Tenant与Free权益均已生效</option><option value="failure">失败 / 结果未知</option><option value="auth">无会话或无授权</option></select></label><small>仅供前端状态预览；页面切换不创建Tenant、账号或Free权益。</small></div>}{notice && <p className="inline-notice" role="status">{notice}</p>}{demoMode && <p className="verify-disclaimer">演示状态不构成真实开户证明；正式结果必须由账户、Tenant与Entitlement服务共同确认。</p>}</div><div className="preview-strip"><DemoNotice /></div></main>;
}
