import { Button, DemoNotice, ServiceUnavailable, isDemoPreview } from '../site';
import { paths } from '../config';
import { entryIntent, entryPath } from '../authDemo';

export function VerifyEmail() {
  if (!isDemoPreview()) return <ServiceUnavailable title="邮箱验证暂不可用" description="正式邮件与验证服务尚未开放；此页面不能确认真实邮箱身份。" />;
  return <main className="verify-page"><div className="verify-glow" /><div className="verify-card">
    <div className="verify-icon" aria-hidden="true">✉</div><span className="eyebrow">EMAIL VERIFICATION / 旧链接兼容</span>
    <h1>请返回统一邮箱认证</h1>
    <p className="verify-copy">WDEX SaaS 现以 W-10 的邮箱验证码界面作为企业账号统一入口。此旧验证链接不能证明邮箱已验证，也不会建立账号、企业或会话。</p>
    <div className="verify-actions"><Button href={entryPath(paths.login, entryIntent())}>返回企业登录</Button><Button href={paths.contact + '?topic=account'} variant="outline">联系支持</Button></div>
    <p className="verify-disclaimer">演示模式｜不会发送真实邮件，不建立真实企业或生产会话。若旧验证链接已过期或失效，请从统一入口重新开始。</p>
  </div><div className="preview-strip"><DemoNotice /></div></main>;
}
