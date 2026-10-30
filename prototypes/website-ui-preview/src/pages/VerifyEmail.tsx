import { useState } from 'react';
import { Button, DemoNotice, ServiceUnavailable, demoRoute, isDemoPreview } from '../site';
import { paths } from '../config';

type View = 'waiting' | 'processing' | 'success' | 'expired' | 'invalid' | 'used' | 'unknown';
const viewText: Record<View, { title: string; body: string }> = {
  waiting: { title: '模拟邮箱验证', body: '本地演示已模拟受理验证请求，不会发送真实邮件。请选择下方演示结果以继续体验流程。' },
  processing: { title: '正在验证您的邮箱', body: '正在确认验证链接，请勿重复操作。' },
  success: { title: '模拟邮箱验证成功', body: '本地演示验证已完成。接下来模拟检查Free企业工作台的开通状态。' },
  expired: { title: '验证链接已过期', body: '当前验证链接已失效。您可以申请新的验证邮件，继续完成注册。' },
  invalid: { title: '无法验证此链接', body: '该链接无效或无法用于当前注册。请返回注册页面重新获取有效的验证指引。' },
  used: { title: '该邮箱已完成验证', body: '当前邮箱已完成验证。您可以继续注册流程，或使用已有账户登录。' },
  unknown: { title: '暂时无法完成验证', body: '验证服务暂时不可用，请稍后重新尝试。' },
};
function maskEmail(value: string) { const [local, domain] = value.split('@'); return local && domain ? `${local[0]}***@${domain}` : '***@***'; }

export function VerifyEmail() {
  const demoMode = isDemoPreview();
  const standardIntent = new URLSearchParams(location.search).get('intent') === 'standard';
  const source = (() => { try { return JSON.parse(sessionStorage.getItem('wdex-registration-demo') || '{}') as { email?: string; standardIntent?: boolean }; } catch { return {}; } })();
  const [view, setView] = useState<View>(demoMode ? 'waiting' : 'invalid');
  const [notice, setNotice] = useState('');
  const [checkResult, setCheckResult] = useState('pending');
  const [resendResult, setResendResult] = useState('unavailable');
  if (!demoMode) return <ServiceUnavailable title="邮箱验证暂不可用" description="正式注册与邮件服务尚未开放，当前没有可验证的真实邮件请求。" />;
  const check = () => {
    if (!demoMode || checkResult === 'unknown') { setNotice('暂时无法确认验证状态，请稍后重试。没有服务端核验结果，邮箱不会被标记为已验证。'); return; }
    if (checkResult === 'pending') { setNotice('邮箱尚未完成验证，请前往邮箱操作。'); return; }
    if (checkResult === 'success') sessionStorage.setItem('wdex-verification-demo', 'verified');
    setNotice(''); setView(checkResult as View);
  };
  const resend = () => setNotice(!demoMode || resendResult === 'unavailable' ? '暂时无法发送验证邮件，请稍后重试。当前没有接通邮件服务。' : resendResult === 'rate' ? '操作过于频繁，请稍后再试。' : '新的验证邮件请求已受理，请前往邮箱查看。（仅演示，未实际发送）');
  const modifyHref = demoRoute(paths.register + (standardIntent || source.standardIntent ? '?intent=standard' : ''));
  const selected = viewText[view];
  return <main className="verify-page"><div className="verify-glow" /><div className="verify-card"><div className="verify-icon" aria-hidden="true">✉</div><span className="eyebrow">EMAIL VERIFICATION / 邮箱验证</span><h1>{selected.title}</h1><p className="verify-copy">{selected.body}</p>{view === 'waiting' && <><div className="verify-email">已填写邮箱：<strong>{maskEmail(source.email || '')}</strong></div><p className="verify-tip">没有找到邮件？您可以检查垃圾邮件文件夹，或在允许重新发送后获取新的验证指引。</p><div className="verify-actions"><button className="button button-primary" onClick={check}>我已完成验证 <span aria-hidden="true">↗</span></button><button className="button button-outline" onClick={resend}>重新发送验证邮件 <span aria-hidden="true">↗</span></button></div><a className="verify-text-link" href={modifyHref}>修改邮箱</a></>}
    {view === 'processing' && <div className="verify-spinner" role="status" aria-label="正在验证" />}
    {view === 'success' && <><p className="verify-tip">Free永久免费，工作台中的资产发行和投资者操作将以Sandbox测试模式运行。</p><div className="verify-actions"><Button href={paths.onboarding + '?demo=1' + (standardIntent ? '&intent=standard' : '')}>继续创建免费工作台</Button></div></>}
    {view === 'expired' && <div className="verify-actions"><button className="button button-primary" onClick={resend}>重新发送验证邮件 <span aria-hidden="true">↗</span></button><Button href={modifyHref} variant="outline">返回注册页面</Button></div>}
    {view === 'invalid' && <div className="verify-actions"><Button href={modifyHref}>返回注册页面</Button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div>}
    {view === 'used' && <div className="verify-actions"><Button href={demoRoute(paths.login)}>登录已有账户</Button>{demoMode && <Button href={paths.onboarding + '?demo=1'} variant="outline">继续注册流程</Button>}</div>}
    {view === 'unknown' && <div className="verify-actions"><button className="button button-primary" onClick={check}>重试验证 <span aria-hidden="true">↗</span></button><Button href={modifyHref} variant="outline">返回注册页面</Button></div>}
    {demoMode && <div className="verify-demo"><strong>演示状态控制</strong><label>页面状态<select value={view} onChange={e => { if (e.target.value === 'success') sessionStorage.setItem('wdex-verification-demo', 'verified'); setView(e.target.value as View); setNotice(''); }}><option value="waiting">等待验证</option><option value="processing">验证处理中</option><option value="success">模拟服务端验证成功</option><option value="expired">链接过期</option><option value="invalid">无效链接</option><option value="used">链接已使用</option><option value="unknown">服务异常</option></select></label><label>查询验证结果<select value={checkResult} onChange={e => setCheckResult(e.target.value)}><option value="pending">尚未验证</option><option value="success">模拟服务端已验证</option><option value="unknown">结果未知</option></select></label><label>重发结果<select value={resendResult} onChange={e => setResendResult(e.target.value)}><option value="unavailable">邮件服务不可用</option><option value="accepted">模拟已受理</option><option value="rate">频率限制</option></select></label><small>所有状态均为本地UI模拟；没有真实邮件、验证令牌或服务端确认。</small></div>}
    {notice && <p className="inline-notice" role="status">{notice}</p>}{demoMode && <p className="verify-disclaimer">模拟页面，不代表邮箱实际通过验证，也不建立登录会话或企业工作台。</p>}</div><div className="preview-strip"><DemoNotice /></div></main>;
}
