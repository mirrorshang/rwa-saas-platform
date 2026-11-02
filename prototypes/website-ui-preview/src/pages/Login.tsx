import { useEffect, useState, type FormEvent } from 'react';
import { Button, ServiceUnavailable, isDemoPreview, useDemoRole } from '../site';
import { paths } from '../config';
import { useDemoControls } from '../demoControls';
import { beginDemoAuth, getAuthorizedTenants, getDemoAccount, selectDemoTenant } from '../issuerDemo';
import { entryIntent, entryPath } from '../authDemo';

type Step = 'email' | 'code' | 'checking' | 'new-account' | 'result' | 'restricted' | 'help';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const [role] = useDemoRole();
  const controls = useDemoControls(state => state.controls);
  const intent = entryIntent();
  const demo = isDemoPreview();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step !== 'checking' || !demo) return;
    const timer = window.setTimeout(() => {
      if (beginDemoAuth(role, email)) {
        const tenants = getAuthorizedTenants();
        if (tenants.length === 1 && selectDemoTenant(tenants[0].id)) { location.href = entryPath(paths.issuer, intent); return; }
        if (tenants.length > 1 || getDemoAccount()?.invitationPending) { location.href = entryPath(paths.organizations, intent); return; }
        if (getDemoAccount()?.canCreate) { location.href = entryPath(paths.onboarding, intent); return; }
      } else setError('当前邮箱的账号状态与所选入口不一致，请检查账号或联系支持。');
      setStep('result');
    }, 450);
    return () => clearTimeout(timer);
  }, [step, demo, role, email, intent]);
  useEffect(() => { document.getElementById(step === 'email' ? 'login-email' : 'login-code')?.focus(); }, [step]);

  if (!demo) return <ServiceUnavailable title="企业登录暂未开放" description="邮箱认证服务尚未启用。请稍后再试。" />;
  const request = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!emailPattern.test(email.trim())) { setError('请输入有效的工作邮箱。'); return; }
    setBusy(true); setError('');
    setTimeout(() => {
      setBusy(false);
      if (controls.mail === 'accepted') { setStep('code'); setCode(''); return; }
      setError(controls.mail === 'rate' ? '请求过于频繁，请稍后重试。' : controls.mail === 'network' ? '网络连接异常，请重试。' : controls.mail === 'unknown' ? '请求结果待确认，请勿重复操作。' : '暂时无法获取验证码。');
    }, 400);
  };
  const verify = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!code.trim()) { setError('请输入邮箱验证码。'); return; }
    setBusy(true); setError('');
    setTimeout(() => {
      setBusy(false);
      if (controls.code !== 'accepted') {
        setError(controls.code === 'expired' ? '验证码已过期，请重新获取。' : controls.code === 'used' ? '验证码已使用，请重新获取。' : controls.code === 'network' ? '网络异常，请稍后重试。' : controls.code === 'unknown' ? '验证结果待确认，请勿重复提交。' : controls.code === 'restricted' ? '账号访问受限，请联系支持。' : '验证码错误，请重新输入。');
        if (controls.code === 'restricted') setStep('restricted');
        return;
      }
      setStep(controls.account === 'new' ? 'new-account' : 'checking');
    }, 400);
  };

  return <main className="login-page login-center"><section className="login-card" aria-labelledby="login-title">
    <a className="login-brand" href={paths.home}>WDEX <strong>SaaS</strong></a>
    <h1 id="login-title">登录或创建企业账户</h1><p>使用工作邮箱继续访问您的企业工作台。</p>
    {intent && <p className="register-intent">{intent === 'free' ? 'Free Sandbox' : 'Standard'} 意向已保留。</p>}
    {step === 'email' && <form noValidate onSubmit={request}><label htmlFor="login-email">工作邮箱</label><input id="login-email" type="email" autoComplete="email" value={email} maxLength={254} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder="name@company.com" aria-invalid={!!error} />{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" disabled={busy}>{busy ? '正在处理…' : '继续'}</button></form>}
    {step === 'code' && <><p>验证码已发送至 <strong>{email}</strong></p><form noValidate onSubmit={verify}><label htmlFor="login-code">邮箱验证码</label><input id="login-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => { setCode(event.target.value); setError(''); }} placeholder="输入验证码" aria-invalid={!!error} />{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" disabled={busy}>{busy ? '正在验证…' : '验证并继续'}</button></form><div className="login-links"><button type="button" onClick={() => { setCode(''); setError(controls.mail === 'accepted' ? '' : '重新发送未成功，请稍后重试。'); }}>重新发送</button><button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}>修改邮箱</button></div></>}
    {step === 'checking' && <div role="status"><h2>正在核实企业访问权限</h2><p>请稍候。</p></div>}
    {step === 'new-account' && <div role="status"><h2>完成账号确认</h2><p>您的邮箱尚未关联企业账户。账号确认与创建企业是两个独立步骤。</p><form className="login-account-confirm" onSubmit={event => event.preventDefault()}><label htmlFor="account-email">工作邮箱</label><input id="account-email" value={email} readOnly /><p>服务条款正式版本发布后，可继续创建账号。<a href={paths.policies + '/terms'} target="_blank" rel="noreferrer">查看服务条款发布状态</a></p><label className="login-terms"><input type="checkbox" disabled />我已阅读并同意《WDEX SaaS服务条款》</label><button className="button button-primary login-submit" disabled>确认账号并继续</button></form><Button href={paths.contact + '?topic=account'} variant="text">联系支持</Button></div>}
    {step === 'restricted' && <div role="alert"><h2>账号暂无法访问</h2><p>{error}</p><Button href={paths.contact + '?topic=account'}>联系支持</Button></div>}
    {step === 'result' && <div role="status"><h2>无法进入企业工作台</h2><p>{error || '暂无可访问的企业，请联系企业管理员确认授权。'}</p><Button href={paths.contact + '?topic=account'}>联系支持</Button></div>}
    {step === 'help' && <><h2>需要帮助？</h2><p>请检查邮箱及验证码，或联系支持。</p><Button href={paths.contact + '?topic=account'}>联系支持</Button><button className="login-help-link" onClick={() => setStep('email')}>返回登录</button></>}
    {step === 'email' && <button className="login-help-link" type="button" onClick={() => setStep('help')}>无法登录？</button>}
    <nav className="login-legal" aria-label="账户帮助"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a></nav>
  </section></main>;
}
