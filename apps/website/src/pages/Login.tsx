import { useEffect, useState, type FormEvent } from 'react';
import { ServiceUnavailable, isDemoPreview } from '../site';
import { paths } from '../config';
import { useDemoControls } from '../demoControls';
import { entryIntent } from '../authDemo';
import { issuerHomeUrl } from '../issuerTarget';

type Ticket = { email: string; code: string; expiresAt: number; resendAt: number; used: boolean };
const ticketKey = 'wdex-local-email-code';
const sampleEmail = 'sample.issuer@wdex.example';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function readTicket(): Ticket | null {
  try { return JSON.parse(sessionStorage.getItem(ticketKey) || 'null') as Ticket | null; } catch { return null; }
}

export function Login() {
  const demo = isDemoPreview();
  const controls = useDemoControls(state => state.controls);
  const intent = entryIntent();
  const initialTicket = readTicket();
  const [step, setStep] = useState<'email' | 'code'>(initialTicket && !initialTicket.used && initialTicket.expiresAt > Date.now() ? 'code' : 'email');
  const [email, setEmail] = useState(initialTicket?.email || '');
  const [code, setCode] = useState('');
  const [sampleReady, setSampleReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { document.getElementById(step === 'email' ? 'login-email' : 'login-code')?.focus(); }, [step]);
  if (!demo) return <ServiceUnavailable title="企业登录暂未开放" description="邮箱认证服务尚未启用。请稍后再试。" />;

  const sendCode = (event?: FormEvent, resend = false) => {
    event?.preventDefault();
    if (busy) return;
    const normalized = email.trim().toLowerCase();
    if (!emailPattern.test(normalized) || normalized.length > 254) { setError('请输入有效的邮箱地址。'); return; }
    const prior = readTicket();
    if (prior?.email === normalized && Date.now() < prior.resendAt) { setError('发送过于频繁，请稍后重新获取。'); return; }
    setBusy(true); setError(''); setFeedback('');
    window.setTimeout(() => {
      setBusy(false);
      const mail = useDemoControls.getState().controls.mail;
      if (mail !== 'accepted') { setError(mail === 'rate' ? '发送过于频繁，请稍后重试。' : mail === 'network' ? '网络连接异常，请重试。' : '验证码发送失败，请稍后重试。'); return; }
      sessionStorage.setItem(ticketKey, JSON.stringify({ email: normalized, code: '123456', expiresAt: Date.now() + 10 * 60_000, resendAt: Date.now() + 5_000, used: false } satisfies Ticket));
      setEmail(normalized); setCode(sampleReady ? '123456' : ''); setStep('code'); setFeedback(resend ? '新验证码已发送。' : '验证码已发送。');
    }, 250);
  };
  const verify = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(code)) { setError('请输入 6 位数字验证码。'); return; }
    const ticket = readTicket();
    const scenario = controls.code;
    if (!ticket || ticket.email !== email || ticket.used) { setError('验证码已使用或无效，请重新获取。'); return; }
    if (ticket.expiresAt <= Date.now() || scenario === 'expired') { setError('验证码已过期，请重新获取。'); return; }
    if (scenario === 'used') { setError('验证码已使用，请重新获取。'); return; }
    if (scenario === 'network' || scenario === 'unknown') { setError('验证暂时失败，请稍后重试。'); return; }
    if (scenario === 'restricted') { setError('当前账号暂无法访问，请联系支持。'); return; }
    if (scenario === 'wrong' || code !== ticket.code) { setError('验证码错误，请重新输入。'); return; }
    if (!termsAccepted) { setError('请先阅读并同意服务条款及隐私政策。'); return; }
    setBusy(true); setError('');
    sessionStorage.setItem(ticketKey, JSON.stringify({ ...ticket, used: true } satisfies Ticket));
    location.href = issuerHomeUrl();
  };
  const sample = () => {
    setEmail(sampleEmail); setCode('123456'); setSampleReady(true); setError('');
    if (step === 'code' && email !== sampleEmail) { setStep('email'); setTermsAccepted(false); setFeedback('请先获取该邮箱的验证码。'); }
  };
  return <main className="login-page login-center"><section className="login-card" aria-labelledby="login-title">
    <a className="login-brand" href={paths.home}>WDEX <strong>SaaS</strong></a>
    <h1 id="login-title">企业登录</h1><p>当前为本地演示验证码；正式身份认证将由服务端提供。</p>
    {intent && <p className="register-intent">{intent === 'free' ? 'Free' : 'Standard'} 意向已保留。</p>}
    {step === 'email' ? <form noValidate onSubmit={sendCode}><label htmlFor="login-email">邮箱地址（必填）</label><input id="login-email" type="email" autoComplete="email" value={email} maxLength={254} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder="name@company.com" aria-invalid={!!error} aria-describedby="login-email-help" /><small id="login-email-help">请输入可接收验证码的邮箱。</small>{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" disabled={busy}>{busy ? '正在获取…' : '获取验证码'}</button></form> : <><p>验证码已发送至 <strong>{email}</strong></p><form noValidate onSubmit={verify}><label htmlFor="login-code">邮箱验证码（必填）</label><input id="login-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, '')); setError(''); }} placeholder="请输入 6 位数字" aria-invalid={!!error} disabled={busy} /><label className="login-terms"><input type="checkbox" checked={termsAccepted} onChange={event => { setTermsAccepted(event.target.checked); setError(''); }} />我已阅读并同意<a href={paths.policies + '/terms'} target="_blank" rel="noreferrer">服务条款</a>和<a href={paths.policies + '/privacy'} target="_blank" rel="noreferrer">隐私政策</a>（必选）</label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" disabled={busy}>{busy ? '正在登录…' : '登录'}</button></form><div className="login-links"><button type="button" disabled={busy} onClick={() => sendCode(undefined, true)}>重新获取验证码</button><button type="button" disabled={busy} onClick={() => { setStep('email'); setCode(''); setError(''); setFeedback(''); setTermsAccepted(false); }}>修改邮箱</button></div></>}
    <button className="login-help-link" type="button" onClick={sample}>填入示例信息</button>
    {feedback && <p role="status">{feedback}</p>}
    <nav className="login-legal" aria-label="账户帮助"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a></nav>
  </section></main>;
}
