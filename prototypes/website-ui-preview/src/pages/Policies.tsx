import { useEffect, useState } from 'react';
import { Button, DemoNotice } from '../site';
import { paths } from '../config';

const policies = [
  { slug: 'terms', title: 'SaaS服务条款', fullTitle: 'RWA SaaS 服务条款', action: '阅读服务条款', description: '了解RWA SaaS企业账户、工作台使用、套餐订阅、双方责任及服务限制等规则。', intro: '本文件用于说明企业客户使用RWA SaaS技术服务时适用的基本规则、账户责任、商业订阅安排及服务使用边界。请在注册、订阅及使用相关服务前阅读适用的正式条款。', sections: '服务提供方与适用主体｜术语定义与服务范围｜企业账户、Tenant与授权用户｜Free Sandbox的适用范围｜Standard商业订阅与权益｜商业KYB及必要资格审核｜USDT订阅付款、账单与续费｜费用异常、退款及取消规则｜客户数据与资料责任｜SaaS技术服务与真实金融业务的区别｜服务限制、中止与终止｜已成立业务义务的保护与数据交接｜责任承担、争议处理及其他法律条款'.split('｜') },
  { slug: 'privacy', title: '隐私政策', fullTitle: 'RWA SaaS 隐私政策', action: '阅读隐私政策', description: '了解平台如何收集、使用、保存和保护与SaaS服务有关的个人信息，以及用户可以如何提出相关请求。', intro: '本政策说明平台在提供网站、企业账户及SaaS服务过程中如何处理相关个人信息，以及适用的隐私权利和联系渠道。', sections: '数据处理主体及联系信息｜收集的信息类别｜账户注册和身份验证数据｜企业资料和商业KYB相关信息｜咨询表单与支持沟通数据｜服务运行、日志与安全数据｜数据处理目的及适用合法依据｜第三方服务商与必要共享｜跨境传输及数据保护措施｜保存期限、删除及法律保留义务｜用户可行使的隐私权利｜Cookie和类似技术｜政策更新与联系渠道'.split('｜') },
  { slug: 'cookies', title: 'Cookie政策', fullTitle: 'RWA SaaS Cookie政策', action: '查看Cookie政策', description: '了解网站及产品中Cookie和类似技术的用途，以及如何查看和调整适用的隐私偏好。', intro: '本政策用于介绍网站和SaaS产品可能使用的Cookie及类似技术的类别、目的、保存期限和偏好管理方式。', sections: '什么是Cookie及类似技术｜必要Cookie及安全用途｜偏好及功能性Cookie｜分析和统计技术（如实际使用）｜营销或第三方追踪技术（如实际使用）｜Cookie的保存期限与第三方｜用户如何管理偏好｜政策更新及联系信息'.split('｜') },
  { slug: 'disclaimer', title: '免责声明', fullTitle: 'RWA SaaS 免责声明', action: '阅读免责声明', description: '了解SaaS技术服务的适用边界、数字资产发行涉及的独立法律要求，以及平台不提供的服务和保证。', intro: '本页面说明RWA SaaS作为技术平台的业务边界，以及使用数字资产发行、Token管理及相关工具时应注意的事项。', sections: '技术SaaS服务的性质｜非自动金融发行或监管许可声明｜发行机构与有权主体的责任｜Token记录与法定权益的关系｜Sandbox数据与真实生产数据的区别｜外部钱包、网络与服务商风险｜实际资金、链上操作及交易风险｜非收益保证或投资结果承诺｜第三方信息和服务的适用责任｜其他依法需要披露的事项'.split('｜') },
];

export function Policies() {
  const slug = location.pathname.split('/')[2];
  const policy = policies.find(item => item.slug === slug);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  useEffect(() => {
    if (!policy) return;
    const onScroll = () => {
      let current = 0;
      policy.sections.forEach((_, index) => { const top = document.getElementById(`policy-section-${index}`)?.getBoundingClientRect().top ?? Infinity; if (top <= 160) current = index; });
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [policy]);
  if (slug && !policy) return <main className="section policy-unavailable"><div className="container"><span className="eyebrow">LEGAL & POLICIES</span><h1>该文件不可用</h1><p>请返回法律与政策中心查看现有文件入口。</p><Button href={paths.policies}>返回政策中心</Button></div></main>;
  if (!policy) return <main className="policies-page"><section className="policy-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">LEGAL & POLICIES · 法律与政策</span><h1>法律与政策</h1><p>在使用RWA SaaS之前，您可以在这里了解平台服务规则、个人信息处理方式、Cookie使用情况及相关风险说明。</p><small>具体服务及相关业务应遵守适用的法律规定。请阅读与您使用的产品和服务有关的政策文件。</small></div></section><section className="section policy-center"><div className="container"><div className="policy-warning">四份文件的正式法律正文、发布版本及生效日期尚未获法务审定。以下仅展示已批准的页面目录建议，不能作为正式生效文件。</div><div className="policy-card-grid">{policies.map((item, index) => <a className="policy-card" href={`${paths.policies}/${item.slug}`} key={item.slug}><span>0{index + 1} / 文件目录</span><h2>{item.title}</h2><p>{item.description}</p><div><small>正式版本：待发布<br />生效日期：待确定</small><strong>{item.action} ↗</strong></div></a>)}</div></div></section><div className="preview-strip"><DemoNotice /></div></main>;
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); } catch { setCopied(false); } };
  return <main className="policy-reader"><section className="policy-reader-hero"><div className="container"><a className="back-link" href={paths.policies}>← 返回政策中心</a><span className="eyebrow">LEGAL DOCUMENT / 政策阅读视图</span><h1>{policy.fullTitle}</h1><p>{policy.intro}</p><div className="policy-warning">仅供页面结构预览：下方为建议章节目录，正式法律正文未批准、未发布，不能作为合同、隐私告知或已生效政策使用。</div><div className="policy-meta"><span>发布主体<strong>待法律确认</strong></span><span>正式版本<strong>待发布</strong></span><span>生效日期<strong>待确定</strong></span><span>适用范围<strong>待法律确认</strong></span></div></div></section><div className="container policy-reader-layout"><aside className="policy-toc"><button type="button" className="toc-toggle" aria-expanded={tocOpen} onClick={() => setTocOpen(!tocOpen)}>建议章节目录 <span>{tocOpen ? '−' : '+'}</span></button><nav className={tocOpen ? 'open' : ''} aria-label="政策章节目录">{policy.sections.map((title, index) => <a className={active === index ? 'active' : ''} href={`#policy-section-${index}`} key={title}><span>{String(index + 1).padStart(2, '0')}</span>{title}</a>)}</nav></aside><div className="policy-body"><div className="policy-tools"><button type="button" onClick={copy}>{copied ? '链接已复制' : '复制当前文件链接'}</button><button type="button" disabled title="正式正文发布后可打印">打印／保存PDF（待正式发布）</button></div>{policy.sections.map((title, index) => <section id={`policy-section-${index}`} key={title}><span>第 {String(index + 1).padStart(2, '0')} 章 / 建议结构</span><h2>{title}</h2><p>本章节仅为已批准的法律文件结构建议。正式内容、适用法律与责任主体仍须经专业法务审定后发布。</p></section>)}{policy.slug === 'cookies' && <div className="policy-cookie-actions"><p className="policy-cookie-note">Cookie类别、保存期限和真实第三方清单待核验。您可从官网页脚打开当前UI演示的Cookie偏好。</p><button type="button" onClick={() => window.dispatchEvent(new Event("wdex-open-cookie-preferences"))}>管理Cookie偏好</button></div>}<div className="policy-reader-bottom"><Button href={paths.policies} variant="outline">返回法律与政策中心</Button><div><span>查看其他政策</span>{policies.filter(item => item.slug !== policy.slug).map(item => <a key={item.slug} href={`${paths.policies}/${item.slug}`}>{item.title} ↗</a>)}</div></div></div></div><div className="preview-strip"><DemoNotice /></div></main>;
}
