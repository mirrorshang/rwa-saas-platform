import { Button } from '../site';
import { paths } from '../config';

const policies = [
  { slug: 'terms', title: 'SaaS服务条款', description: '企业账户、商业订阅、服务范围与双方责任。' },
  { slug: 'privacy', title: '隐私政策', description: '个人信息的处理方式与相关权利。' },
  { slug: 'cookies', title: 'Cookie政策', description: '网站本地存储及Cookie的使用说明。' },
  { slug: 'disclaimer', title: '免责声明', description: '技术服务、真实发行与投资风险的适用边界。' },
];

export function Policies() {
  const slug = location.pathname.split('/')[2];
  const policy = policies.find(item => item.slug === slug);

  if (slug && !policy) return <main className="section policy-unavailable"><div className="container"><h1>找不到该文件</h1><Button href={paths.policies}>返回法律与政策</Button></div></main>;

  if (policy) return <main className="policy-reader">
    <section className="policy-reader-hero"><div className="container"><a className="back-link" href={paths.policies}>← 返回法律与政策</a><span className="eyebrow">法律与政策</span><h1>{policy.title}</h1><p>{policy.description}</p></div></section>
    <section className="section policy-center"><div className="container narrow"><div className="policy-warning"><h2>正式文件尚未发布</h2><p>当前无法提供经审定的{policy.title}正文、生效日期与适用主体。请在正式文件发布后阅读，再决定是否使用相应服务。</p></div>{policy.slug === 'cookies' && <div className="policy-cookie-actions"><p>当前网站仅保留必要的本地偏好记录，未启用分析或营销追踪。</p><button type="button" onClick={() => window.dispatchEvent(new Event('wdex-open-cookie-preferences'))}>查看本地存储说明</button></div>}<Button href={paths.policies} variant="outline">查看其他文件</Button></div></section>
  </main>;

  return <main className="policies-page">
    <section className="policy-hero"><div className="container"><span className="eyebrow">DOCUMENT STATUS / 文件状态</span><h1>法律与政策</h1><p>查看四类SaaS文件的发布状态。正式正文与生效日期尚待审核公布。</p></div></section>
    <section className="section policy-center"><div className="container"><div className="policy-warning"><h2>文件发布状态</h2><p>以下四份SaaS相关文件的正式正文尚未发布。在文件和相应服务完成必要审核前，注册、咨询及商业订阅不可实际提交。M统一投资端涉及的投资者服务条款、Offering法律披露与隐私告知需独立审核和发布，不能以SaaS条款替代。</p></div><div className="policy-card-grid">{policies.map((item, index) => <a className="policy-card" href={`${paths.policies}/${item.slug}`} key={item.slug}><span>0{index + 1} / 待发布</span><h2>{item.title}</h2><p>{item.description}</p><div><small>正式版本与生效日期待公布</small><strong>查看发布状态 ↗</strong></div></a>)}</div></div></section>
  </main>;
}
