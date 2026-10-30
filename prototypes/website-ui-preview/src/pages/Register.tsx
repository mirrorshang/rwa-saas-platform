import { useState, type FormEvent } from 'react';
import { Button, DemoNotice, ServiceUnavailable, isDemoPreview } from '../site';
import { paths } from '../config';
import { confirmDemoTerms, entryIntent, entryPath, pendingAccount } from '../authDemo';

const values = [
  ['永久免费使用', 'Free 没有固定试用到期时间，可在 Sandbox 中体验主要流程。'],
  ['账号与企业分离', '邮箱验证仅用于账号认证。企业工作台须在后续步骤中由您明确创建或获得授权。'],
  ['按需升级', 'Standard 订阅归属于选定企业，不因邮箱账号建立而自动开通。'],
];
function mask(value: string) { const [name, domain] = value.split('@'); return name && domain ? `${name[0]}***@${domain}` : '***@***'; }

export function Register() {
  const demo = isDemoPreview();
  const intent = entryIntent();
  const pending = pendingAccount();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  if (!demo) return <ServiceUnavailable title="企业账户开通暂未开放" description="正式条款、邮箱认证及账号服务尚未发布。当前不能提交真实注册。" />;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pending || pending.termsConfirmed) { setError('当前没有待确认的新账号请求，请返回统一邮箱入口。'); return; }
    if (!accepted) { setError('请先确认本地演示条款说明。'); document.getElementById('registration-terms')?.focus(); return; }
    if (!confirmDemoTerms()) { setError('模拟认证上下文已过期，请重新从邮箱入口开始。'); return; }
    location.href = entryPath(paths.login, pending.intent);
  };
  return <main className="register-page"><div className="register-shell">
    <section className="register-story"><div className="register-story-inner"><span className="eyebrow">ACCOUNT SETUP / 账号辅助</span><h1>确认企业账号<br /><em>再选择工作台</em></h1><p className="register-lead">W-08 仅用于新账号必要确认及旧注册链接兼容。账号建立与创建企业是两项独立操作。</p><div className="register-values">{values.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><p className="register-boundary">演示模式｜不会发送真实邮件，不建立真实企业或生产会话。</p></div></section>
    <section className="register-form-side"><div className="register-form-card"><span className="eyebrow">新账号辅助视图</span><h2>{pending && !pending.termsConfirmed ? '确认账号说明' : '请先验证工作邮箱'}</h2>
      {pending && !pending.termsConfirmed ? <><p>模拟已完成邮箱验证码步骤：<strong>{mask(pending.email)}</strong>。此处仅演示必要的新账号确认，不创建企业工作台。</p><form onSubmit={submit}><label className="register-terms"><input id="registration-terms" type="checkbox" checked={accepted} onChange={event => { setAccepted(event.target.checked); setError(''); }} /><span>我了解<a href={paths.policies + '/terms'}>《SaaS 服务条款》</a>尚未正式发布；本次勾选仅为本地 Mock 演示，不构成正式条款接受。</span></label>{error && <p className="field-error" role="alert">{error}</p>}<button className="button button-primary register-submit" type="submit">完成模拟账号确认 <span aria-hidden="true">↗</span></button></form></> : <><p>旧注册链接不会开启另一套邮箱认证。请返回统一入口获取验证码；若刚完成模拟确认，可直接返回继续查看企业授权阶段。</p><Button href={entryPath(paths.login, pending?.intent || intent)}>返回企业邮箱认证</Button></>}
      <p className="register-assist">正式注册须在已发布条款及真实认证服务就绪后开放；Free 无需预先绑定付款方式或完成商业 KYB。</p></div><nav className="register-legal" aria-label="账号帮助与政策"><a href={entryPath(paths.login, pending?.intent || intent)}>企业登录</a><a href={paths.policies + '/terms'}>条款发布状态</a><a href={paths.policies + '/privacy'}>隐私政策发布状态</a><a href={paths.help}>帮助中心</a></nav></section>
  </div><div className="preview-strip"><DemoNotice /></div></main>;
}
