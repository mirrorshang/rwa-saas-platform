import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';

export const commercialSteps = [
  ['I-03 订阅管理', paths.issuerSubscription], ['I-04 升级总览', paths.issuerUpgrade],
  ['I-05 商业KYB资料', paths.issuerKyb], ['I-06 KYB进度', paths.issuerKybReview],
  ['I-07 SaaS合同', paths.issuerContract], ['I-08 Standard付款', paths.issuerPayment],
  ['I-09 账单与开通', paths.issuerBilling],
] as const;
export function CommercialIntro({ number, title, tenant }: { number: string; title: string; tenant: DemoTenant }) {
  return <div className="issuer-intro"><div><p className="issuer-kicker">{number} / {title}</p><h1>{title}</h1><p>当前企业：{tenant.name} · {tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard演示标签'} · {tenant.role}</p></div><span className="issuer-badge">仅本地Mock · 非生产</span></div>;
}
export function CommercialFlow({ current }: { current: string }) {
  return <nav className="issuer-commercial-flow" aria-label="商业订阅流程">{commercialSteps.map(([label, path]) => <a key={path} href={path + '?demo=1'} aria-current={path === current ? 'step' : undefined}>{label}</a>)}</nav>;
}
export function CommercialBoundary() {
  return <p className="issuer-note">本页不接入真实KYB、法定签署、支付Provider、钱包、Signer或生产权益。模拟状态不构成法律、金融或生产事实。</p>;
}
export function FactRows({ rows }: { rows: [string, string][] }) {
  return <dl className="issuer-facts">{rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>;
}
