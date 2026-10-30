import { useState, type FormEvent } from 'react';
import { DemoNotice, demoRoute, useDemoRole, isDemoPreview } from '../site';
import { paths } from '../config';

const values = [
  ['永久免费使用', 'Free没有固定试用到期时间。您可以持续使用Sandbox体验主要SaaS功能。'],
  ['完整流程模拟', '在测试环境中创建资产、配置发行轮次、模拟认购、Token操作与收益管理。'],
  ['按需升级Standard', '当您准备开展正式商业使用时，可以通过企业工作台自助订阅Standard。'],
];
const faqs = [
  ['注册Free需要付款吗？', '不需要。Free永久免费，无须预先绑定付款方式。'],
  ['是否需要先提交企业营业执照？', '使用Free Sandbox不要求先完成完整商业KYB。正式升级及实际业务可能需要企业审核。'],
  ['Free可以发行真实Token吗？', 'Free只提供Sandbox模拟及受控测试能力，不产生真实发行或投资者法定权益。'],
];

export function Register() {
  const [role] = useDemoRole();
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; accepted?: string }>({});
  const [status, setStatus] = useState('');
  const [outcome, setOutcome] = useState('unavailable');
  const demoMode = isDemoPreview();
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    const cleaned = email.trim();
    if (!cleaned) next.email = '请输入邮箱地址';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) next.email = '请输入有效的邮箱地址';
    if (!accepted) next.accepted = '请先阅读并同意服务条款';
    setErrors(next);
    if (next.email) { document.querySelector<HTMLInputElement>('#registration-email')?.focus(); return; }
    if (next.accepted) { document.querySelector<HTMLInputElement>('#registration-terms')?.focus(); return; }
    if (role !== 'visitor') { location.href = demoRoute(role === 'multiple' ? paths.organizations : role === 'none' ? paths.organizations : paths.onboarding); return; }
    if (!demoMode || outcome === 'unavailable') { setStatus('注册服务暂时不可用，请稍后再试。正式服务条款与账户、邮件服务尚未发布；没有创建账户或发送邮件。'); return; }
    if (outcome === 'accepted') {
      sessionStorage.removeItem('wdex-verification-demo');
      sessionStorage.setItem('wdex-registration-demo', JSON.stringify({ email: cleaned, standardIntent }));
      location.href = paths.verify + '?demo=1' + (standardIntent ? '&intent=standard' : '');
      return;
    }
    setStatus(outcome === 'mail' ? '暂时无法发送验证指引，请重试。' : outcome === 'network' ? '网络连接异常，请检查后重试。' : outcome === 'unknown' ? '暂时无法确认请求结果，请稍后重试。' : '操作过于频繁，请稍后再试。');
  };
  return <main className="register-page"><div className="register-shell"><section className="register-story"><div className="register-story-inner"><span className="eyebrow">FREE WORKSPACE</span><h1>{demoMode ? <>免费创建您的<br /><em>资产发行工作台</em></> : <>面向发行机构的<br /><em>企业工作台</em></>}</h1><p className="register-lead">从第一个项目开始，探索多资产管理、Token发行配置、投资者门户、认购与发行后管理。</p><div className="register-values">{values.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><p className="register-boundary">Free为Sandbox测试模式，不产生真实投资者付款、法定权益或生产Token发行结果。</p><div className="register-faq">{faqs.map(([question, answer]) => <p key={question}><strong>Q：{question}</strong><br />{answer}</p>)}</div></div></section><section className="register-form-side"><div className="register-form-card"><span className="eyebrow">企业账户</span><h2>{demoMode ? '创建免费账户' : '企业账户开通'}</h2><p>{demoMode ? '使用邮箱体验注册与验证流程。' : 'Free工作台开通暂未开放。您可先了解订阅方案及产品能力。'}</p>{standardIntent && <div className="register-intent">完成注册与企业授权后，可继续原企业工作台的Standard自助订阅流程。此处不会发起付款。</div>}{role !== 'visitor' && <div className="register-intent">当前为已登录演示场景，不会重复注册。继续后将按企业授权状态进入工作台或企业选择。</div>}
      {demoMode ? <form noValidate onSubmit={submit}><label htmlFor="registration-email">工作邮箱</label><input id="registration-email" type="email" maxLength={254} value={email} placeholder="name@company.com" onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: undefined })); setStatus(''); }} />{errors.email && <small className="field-error">{errors.email}</small>}
      <label className="register-terms"><input id="registration-terms" type="checkbox" checked={accepted} onChange={e => { setAccepted(e.target.checked); setErrors(x => ({ ...x, accepted: undefined })); setStatus(''); }} /><span>我已阅读并同意<a href={paths.policies + '/terms'}>《SaaS服务条款》</a>。</span></label>{errors.accepted && <small className="field-error">{errors.accepted}</small>}
      <p className="register-privacy">我们将按照<a href={paths.policies + '/privacy'}>《隐私政策》</a>处理您的注册信息。</p>{demoMode && <label className="register-demo">演示请求结果<select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="unavailable">正式注册不可用</option><option value="accepted">模拟验证指引已受理</option><option value="mail">模拟邮件失败</option><option value="network">模拟网络断开</option><option value="unknown">模拟结果未知</option><option value="rate">模拟频繁提交</option></select></label>}{status && <p className="inline-notice" role="alert">{status}</p>}<button type="submit" className="button button-primary register-submit">继续并验证邮箱 <span aria-hidden="true">↗</span></button></form> : <div className="register-intent" role="status">企业账户开通暂未开放。正式服务条款及邮箱验证服务发布后，本页将提供注册入口。</div>}
      {demoMode && <div className="register-login">已经有账户？<a href={paths.login + (standardIntent ? '?intent=standard&demo=1' : '?demo=1')}>登录</a></div>}<p className="register-assist">Free开放后无需预先绑定付款方式，也无需先完成完整商业KYB。</p></div><nav className="register-legal" aria-label="注册帮助与政策"><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a><a href={paths.policies + '/cookies'}>Cookie政策</a><a href={paths.help}>帮助中心</a></nav></section></div><div className="preview-strip"><DemoNotice /></div></main>;
}
