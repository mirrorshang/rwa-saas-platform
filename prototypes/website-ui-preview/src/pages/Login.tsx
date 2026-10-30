import { useState, type FormEvent } from 'react';
import { Button, DemoNotice, ServiceUnavailable, demoRoute, useDemoRole } from '../site';
import { paths } from '../config';
import { beginDemoAuth, selectDemoTenant } from '../issuerDemo';

type Step = 'email' | 'code' | 'help' | 'result';
function masked(value: string) { const [name, domain] = value.split('@'); return name && domain ? `${name[0]}***@${domain}` : '***@***'; }

export function Login() {
  const [role] = useDemoRole();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState('unavailable');
  const [codeOutcome, setCodeOutcome] = useState('wrong');
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  if (!demoMode) return <ServiceUnavailable title="企业账户登录暂未开放" description="邮箱验证与企业授权服务尚未接入。当前无法登录或访问企业工作台。" />;
  const requestCode = (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) { setError('请输入邮箱地址'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError('请输入有效的邮箱地址'); return; }
    if (!demoMode || outcome === 'unavailable') { setError('暂时无法发送登录验证码，请稍后重试。当前认证邮件服务未接通。'); return; }
    if (outcome !== 'accepted') { setError(outcome === 'network' ? '网络连接异常，请检查后重试。' : outcome === 'rate' ? '操作过于频繁，请稍后再试。' : '暂时无法确认请求结果，请稍后重试。'); return; }
    setError(''); setStep('code');
  };
  const verifyCode = (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) { setError('请输入登录验证码'); return; }
    if (!demoMode || codeOutcome !== 'accepted') { setError(codeOutcome === 'expired' ? '验证码已过期，请重新获取' : codeOutcome === 'used' ? '该验证码已失效，请重新获取' : codeOutcome === 'network' ? '网络连接异常，请检查后重试' : '验证码错误，请检查后重试'); return; }
    beginDemoAuth(role);
    if (role !== 'multiple' && role !== 'none' && role !== 'visitor') selectDemoTenant(role === 'standard' ? 'operator' : 'assetco');
    setError(''); setStep('result');
  };
  const destination = role === 'multiple' ? paths.organizations + (standardIntent ? '?intent=standard&demo=1' : '?demo=1') : paths.issuer + (standardIntent ? '?intent=standard&demo=1' : '?demo=1');
  return <main className="login-page"><div className="login-layout"><section className="login-story"><div><span className="eyebrow">ENTERPRISE ACCESS</span><h1>欢迎回来</h1><p>登录WDEX SaaS，继续管理您的资产、发行项目和企业工作台。</p><div className="login-visual"><span>WDEX SaaS</span><div><b>资产</b><b>项目</b><b>发行轮次</b><b>投资者</b></div><small>一个账户，访问您获得授权的企业工作空间。</small></div><p className="login-security">验证码仅用于账户登录。我们不会通过登录邮件要求您转账USDT或提供钱包私钥。</p></div></section><section className="login-panel"><div className="login-card">{step === 'email' && <><span className="eyebrow">SIGN IN / 企业账户</span><h2>登录企业账户</h2><p>输入注册邮箱，我们将向您发送一次性登录验证码。</p>{standardIntent && <div className="register-intent">登录并核验企业授权后，继续Standard自助订阅流程；不会直接开通付费权益。</div>}<form noValidate onSubmit={requestCode}><label htmlFor="login-email">工作邮箱</label><input id="login-email" type="email" maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="name@company.com" />{demoMode && <label className="login-demo">演示邮件请求结果<select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="unavailable">邮件服务未接通</option><option value="accepted">模拟受理</option><option value="network">网络中断</option><option value="unknown">结果未知</option><option value="rate">频繁请求</option></select></label>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" type="submit">获取登录验证码 <span aria-hidden="true">↗</span></button></form><p className="login-other">还没有账户？<a href={demoRoute(paths.register)}>免费注册</a></p><button className="login-help-link" onClick={() => { setStep('help'); setError(''); }}>无法登录？</button></>}
    {step === 'code' && <><span className="eyebrow">ONE-TIME CODE / 登录验证</span><h2>输入邮箱验证码</h2><p>请输入发送至您邮箱的一次性登录验证码，完成身份验证。</p><div className="login-masked">邮箱地址：<strong>{masked(email)}</strong></div><form noValidate onSubmit={verifyCode}><label htmlFor="login-code">一次性登录验证码</label><input id="login-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="请输入验证码" />{demoMode && <label className="login-demo">演示验证结果<select value={codeOutcome} onChange={e => setCodeOutcome(e.target.value)}><option value="wrong">验证码错误</option><option value="accepted">模拟服务端认证成功</option><option value="expired">验证码过期</option><option value="used">验证码失效</option><option value="network">网络中断</option></select></label>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary login-submit" type="submit">验证并登录 <span aria-hidden="true">↗</span></button></form><div className="login-links"><button onClick={() => setError('暂时无法发送登录验证码，请稍后重试。当前邮件服务未接通。')}>重新发送验证码</button><button onClick={() => { setStep('email'); setCode(''); setError(''); }}>修改邮箱</button><button onClick={() => { setStep('email'); setError(''); }}>返回登录</button></div><small className="login-detail-note">验证码具有有效期，请使用最新且仍然有效的登录指引。具体有效期和重发频率由安全方案确定。</small></>}
    {step === 'help' && <><span className="eyebrow">ACCOUNT HELP / 账户恢复</span><h2>登录遇到问题？</h2><p>您可以重新获取登录验证码，或在无法访问原邮箱时联系支持团队。</p><div className="login-help-cases"><article><h3>没有收到验证码</h3><p>请检查邮箱地址和垃圾邮件文件夹。若仍未收到，可以在允许重新发送后重新获取验证码。</p><button onClick={() => { setStep('email'); setError(''); }}>重新获取验证码</button></article><article><h3>验证码失效或输入错误</h3><p>一次性验证码可能已过期或失效。请重新获取有效的登录验证码。</p><button onClick={() => { setStep('code'); setError(''); }}>返回登录验证</button></article><article><h3>无法访问原注册邮箱</h3><p>如果您无法继续访问注册邮箱，请联系支持团队寻求账户恢复帮助。</p><Button href={paths.contact + '?topic=account'} variant="text">联系支持</Button></article></div><p className="login-detail-note">人工咨询不会仅凭姓名、邮箱、付款记录或交易哈希更改绑定邮箱或企业管理员权限。</p></>}
    {step === 'result' && <><span className="eyebrow">AUTHORIZATION / 企业授权</span><h2>{role === 'none' || role === 'visitor' ? '当前没有可访问的企业工作台' : '登录验证已完成'}</h2><p>当前仅模拟认证服务返回结果。访问企业工作台仍需核验有效企业空间及角色授权，不能只凭邮箱验证码获取企业权限。</p><div className="register-intent">此处不建立真实登录会话，不授予企业权限，不处理Standard付款或投资者登录。</div>{role === 'none' || role === 'visitor' ? <div className="button-row"><Button href={demoRoute(paths.register)}>安全开通Free</Button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div> : <Button href={destination}>{role === 'multiple' ? '选择企业工作台' : '继续进入工作台'}</Button>}</>}
    </div><div className="login-legal"><a href={paths.help}>帮助中心</a><a href={paths.policies + '/terms'}>服务条款</a><a href={paths.policies + '/privacy'}>隐私政策</a></div></section></div><div className="preview-strip"><DemoNotice /></div></main>;
}
