import { useEffect, useState, type FormEvent } from 'react';
import { Button, DemoNotice, ServiceUnavailable, isDemoPreview, useDemoRole } from '../site';
import { paths } from '../config';
import { beginDemoAuth, selectDemoTenant } from '../issuerDemo';
import { clearPendingAccount, entryIntent, entryPath, pendingAccount, savePendingAccount } from '../authDemo';

type Step = 'email' | 'code' | 'checking' | 'new-account' | 'result' | 'restricted' | 'help';
type RequestResult = 'unavailable' | 'accepted' | 'network' | 'unknown' | 'rate';
type VerifyResult = 'wrong' | 'accepted' | 'expired' | 'used' | 'network' | 'unknown' | 'restricted';
function masked(value: string) { const [name, domain] = value.split('@'); return name && domain ? `${name[0]}***@${domain}` : '***@***'; }

export function Login() {
  const [role] = useDemoRole();
  const demoMode = isDemoPreview();
  const intent = entryIntent();
  const pending = pendingAccount();
  const [step, setStep] = useState<Step>(pending?.termsConfirmed ? 'checking' : 'email');
  const [email, setEmail] = useState(pending?.termsConfirmed ? pending.email : '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [requestResult, setRequestResult] = useState<RequestResult>('unavailable');
  const [verifyResult, setVerifyResult] = useState<VerifyResult>('wrong');
  const [accountResult, setAccountResult] = useState<'existing' | 'new'>('existing');

  useEffect(() => {
    if (!demoMode || step !== 'checking') return;
    const timer = window.setTimeout(() => {
      beginDemoAuth(role);
      if (role !== 'multiple' && role !== 'none' && role !== 'visitor') selectDemoTenant(role === 'standard' ? 'operator' : 'assetco');
      clearPendingAccount();
      setStep('result');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [demoMode, role, step]);

  useEffect(() => {
    if (step === 'email') document.getElementById('login-email')?.focus();
    if (step === 'code') document.getElementById('login-code')?.focus();
  }, [step]);

  if (!demoMode) return <ServiceUnavailable title="企业账户登录暂未开放" description="邮箱验证与企业授权服务尚未接入。当前无法发送真实验证码、登录或访问企业工作台。" />;

  const requestCode = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError('请输入有效的邮箱地址'); return; }
    setError(''); setNotice(''); setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (requestResult === 'accepted') { setEmail(value); setCode(''); setStep('code'); setNotice('模拟验证码请求已受理；没有发送真实邮件。'); return; }
      setError(requestResult === 'rate' ? '操作过于频繁，请稍后再试。' : requestResult === 'network' ? '网络连接异常，请检查后重试。' : requestResult === 'unknown' ? '请求结果暂无法确认，请勿将其视为已发送。' : '认证邮件服务未接通，无法发送验证码。');
    }, 400);
  };

  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!code.trim()) { setError('请输入一次性验证码'); return; }
    setError(''); setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (verifyResult !== 'accepted') {
        setError(verifyResult === 'expired' ? '验证码已过期，请重新获取。' : verifyResult === 'used' ? '验证码已使用，请重新获取。' : verifyResult === 'network' ? '网络连接异常，验证结果未确认。' : verifyResult === 'unknown' ? '验证结果暂无法确认，请查询原请求。' : verifyResult === 'restricted' ? '账号访问受限，请联系支持。' : '验证码错误或已失效。');
        if (verifyResult === 'restricted') setStep('restricted');
        return;
      }
      if (accountResult === 'new') { savePendingAccount(email.trim(), intent); setStep('new-account'); return; }
      setStep('checking');
    }, 400);
  };

  const resend = () => {
    if (busy) return;
    setCode(''); setError('');
    if (requestResult === 'accepted') setNotice('模拟重新受理验证码请求；没有发送真实邮件。');
    else setError(requestResult === 'rate' ? '操作过于频繁，请稍后再试。' : '重新发送未成功，请返回邮箱步骤重试。');
  };
  const destination = role === 'multiple' ? entryPath(paths.organizations, intent) : entryPath(paths.issuer, intent);

  return <main className="login-page"><div className="login-layout">
    <section className="login-story"><div><span className="eyebrow">ENTERPRISE ACCESS</span><h1>欢迎回来</h1><p>使用工作邮箱进入 WDEX SaaS，管理您有权访问的发行机构工作台。</p><div className="login-visual"><span>WDEX SaaS</span><div><b>资产</b><b>项目</b><b>发行方案</b><b>投资者</b></div><small>账号认证后仍需核实企业授权。</small></div><p className="login-security">验证码仅用于企业账号认证。我们不会通过登录邮件要求您转账 USDT 或提供钱包私钥。</p></div></section>
    <section className="login-panel"><div className="login-card">
      <span className="eyebrow">企业邮箱认证</span>
      <p className="register-intent" role="status">演示模式｜不会发送真实邮件，不建立真实企业或生产会话。</p>
      {intent && <p className="register-intent">{intent === 'free' ? 'Free Sandbox' : 'Standard 订阅'}意向已保留；此参数不授予企业权限或付费权益。</p>}
      {step === 'email' && <><h2>登录企业账户</h2><p>输入工作邮箱，使用一次性验证码继续。</p><form noValidate onSubmit={requestCode}><label htmlFor="login-email">工作邮箱</label><input id="login-email" type="email" autoComplete="email" maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="name@company.com" aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} /><label className="login-demo">模拟邮件请求结果<select value={requestResult} onChange={e => setRequestResult(e.target.value as RequestResult)}><option value="unavailable">邮件服务未接通</option><option value="accepted">模拟受理</option><option value="network">网络中断</option><option value="unknown">结果未知</option><option value="rate">频率限制</option></select></label>{error && <p id="login-error" className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" type="submit" disabled={busy}>{busy ? '请求处理中…' : '获取验证码'} <span aria-hidden="true">↗</span></button></form><p className="login-other">旧注册链接或新账号？<a href={entryPath(paths.register, intent)}>查看账号建立说明</a></p><button className="login-help-link" type="button" onClick={() => setStep('help')}>无法登录？</button></>}
      {step === 'code' && <><h2>输入邮箱验证码</h2><p>模拟请求对应邮箱：<strong>{masked(email)}</strong></p><form noValidate onSubmit={verifyCode}><label htmlFor="login-code">一次性验证码</label><input id="login-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="请输入验证码" aria-invalid={!!error} aria-describedby={error ? 'login-code-error' : undefined} /><label className="login-demo">模拟验证结果<select value={verifyResult} onChange={e => setVerifyResult(e.target.value as VerifyResult)}><option value="wrong">验证码错误</option><option value="accepted">模拟验证通过</option><option value="expired">验证码过期</option><option value="used">验证码已使用</option><option value="network">网络异常</option><option value="unknown">结果未知</option><option value="restricted">账号受限</option></select></label><label className="login-demo">模拟账号状态<select value={accountResult} onChange={e => setAccountResult(e.target.value as 'existing' | 'new')}><option value="existing">已有账号</option><option value="new">新账号，需确认条款</option></select></label>{error && <p id="login-code-error" className="field-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}<button className="button button-primary login-submit" type="submit" disabled={busy}>{busy ? '验证处理中…' : '验证并继续'} <span aria-hidden="true">↗</span></button></form><div className="login-links"><button type="button" onClick={resend}>重新发送</button><button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); setNotice(''); }}>修改邮箱</button></div><small className="login-detail-note">模拟控件不提供真实邮件或认证。正式验证码规则与重发限频由认证方案确定。</small></>}
      {step === 'checking' && <div role="status" aria-live="polite"><h2>正在核实您可访问的企业</h2><p>当前仅演示账号与企业权限查询阶段；没有连接真实 Tenant 服务。</p></div>}
      {step === 'new-account' && <><h2>需要完成新账号确认</h2><p>模拟邮箱验证已完成，但尚未创建账号或企业。请先查看条款确认辅助视图。</p><Button href={entryPath(paths.register, intent)}>继续账号确认</Button></>}
      {step === 'restricted' && <><h2>账号暂无法继续</h2><p role="alert">{error}</p><Button href={paths.contact + '?topic=account'}>联系支持</Button><button className="login-help-link" type="button" onClick={() => { setStep('email'); setError(''); }}>返回邮箱输入</button></>}
      {step === 'result' && <><h2>{role === 'none' || role === 'visitor' ? '当前没有可访问的企业工作台' : '模拟邮箱认证已完成'}</h2><p>演示模式正在使用预设企业授权场景；邮箱验证本身不创建企业，也不授予任何真实 Tenant 权限。</p>{role === 'none' || role === 'visitor' ? <div className="button-row"><Button href={paths.contact + '?topic=account'}>联系支持</Button><Button href={paths.home} variant="outline">返回官网</Button></div> : <Button href={destination}>{role === 'multiple' ? '查看模拟企业选择' : '进入模拟工作台'}</Button>}</>}
      {step === 'help' && <><h2>登录遇到问题？</h2><p>请检查邮箱地址；验证码过期、已使用或结果未知时，返回原邮箱流程重新核实。</p><p className="login-detail-note">支持团队不会仅凭邮箱、姓名或付款截图转移企业管理员权限。</p><div className="button-row"><button className="button button-primary" type="button" onClick={() => { setStep('email'); setError(''); }}>返回邮箱输入</button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div></>}
    </div><div className="login-legal"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款发布状态</a><a href={paths.policies + '/privacy'}>隐私政策发布状态</a></div></section>
  </div><div className="preview-strip"><DemoNotice /></div></main>;
}
