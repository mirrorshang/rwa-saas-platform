import { Button, DemoNotice } from '../site';
import { paths } from '../config';

export function InvestorPlatform() {
  return <main className="investor-platform-page">
    <section className="investor-platform-intro"><div className="container investor-platform-layout">
      <div><span className="eyebrow">PLANNED CHANNEL / 规划中的渠道</span><h1>WDEX投资者平台</h1><span className="platform-status">筹备中</span><p>WDEX规划统一的投资者入口，为符合适用条件的投资者展示经平台审核的发行方案。具体开放地区、投资资格与认购功能以正式上线规则为准。</p></div>
      <div className="platform-boundary"><strong>当前开放状态</strong><p>本页仅说明规划与开放状态。当前没有可浏览的真实发行方案，也不提供投资者注册、资格审核、认购或付款服务。</p></div>
    </div></section>
    <section className="section platform-audiences"><div className="container"><div className="platform-audience-grid">
      <article><span>01 / 投资者</span><h2>未来按资格查看</h2><p>未来可查看符合相应地区与投资资格条件的发行方案。每项发行方案的参与资格、法律文件和实际认购安排均需独立确认。</p></article>
      <article><span>02 / 发行机构</span><h2>按发行方案申请展示</h2><p>发行机构可保留自己的独立投资者门户，并针对具体发行方案申请统一平台渠道展示。平台会单独审核，不保证上架、投资者数量或募集结果。</p></article>
    </div><p className="platform-footnote">Standard商业订阅不自动赋予WDEX投资者平台展示资格；企业登录仍使用WDEX SaaS企业账户，不与未来投资者身份混用。</p><Button href={paths.features + '#portal'} variant="text">了解两类投资者入口的区别</Button></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
