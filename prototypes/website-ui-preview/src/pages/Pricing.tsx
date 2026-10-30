import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, demoRoute, isLocalPreview, useDemoRole } from '../site';
import { paths } from '../config';

const freeBenefits = [
  '免费创建企业工作台', '管理模拟资产与权益结构', '创建Sandbox项目与发行轮次',
  '模拟Token配置及相关流程', '使用模拟投资者门户', '模拟投资者资格、认购与资金处理',
  '模拟配售、收益和发行后管理', '保留测试环境中的工作记录及允许复用的配置',
];
const standardBenefits = [
  '企业SaaS商业订阅', '多资产、多项目及发行轮次管理', '企业团队与权限管理',
  '标准独立投资者门户', '投资者资格、认购与配售管理', 'Token与链上记录管理',
  '资金对账及受权结算流程', '法定持有人登记关联', '收益、存续及退出管理',
  '满足独立条件后使用获授权的生产能力',
];
const comparison = [
  ['企业工作台', '免费开通', '商业订阅使用'],
  ['多资产管理', 'Sandbox配置与模拟', '正式业务管理能力'],
  ['权益结构', '模拟配置', '按适用条件管理'],
  ['多项目与发行轮次', 'Sandbox模拟', '正式项目及发行管理'],
  ['文件与审批', '模拟业务流程', '受权正式工作流'],
  ['Token管理', '模拟Token或批准的测试环境', '满足条件后可使用受权生产操作'],
  ['独立投资者门户', '模拟门户', '获授权的正式机构门户'],
  ['投资者资格', '模拟KYC与资格流程', '受权真实身份及资格流程'],
  ['认购订单', '模拟认购和订单', '符合条件的真实认购流程'],
  ['支付和资金', '模拟付款、退款及结算', '受权真实资金执行与对账'],
  ['配售及登记', '模拟配售和名册', '依法受权的配售与登记'],
  ['收益和存续', '模拟分配及退出', '受权的实际业务管理'],
  ['数据与报表', 'Sandbox数据', '授权真实业务数据'],
];
const upgradeSteps = [
  ['确认权限与企业', '由有订阅管理权限的管理员在原企业工作台发起。'],
  ['完成商业审核', '确认企业资料、正式方案与适用合同。'],
  ['账单核验后开通', '正式支付开放后按有效账单付款，核实后激活权益。'],
];
const faqs = [
  ['使用Free需要绑定付款方式吗？', 'Free无需预先绑定付款方式。额外服务的费用以正式公布的商业方案为准。'],
  ['Standard具体多少钱？', 'Standard价格与计费周期待公布。正式方案发布后，有权限的企业管理员可在企业工作台查看并办理商业订阅。'],
  ['升级Standard后，需要重新创建企业和项目吗？', '不需要重新创建企业工作台。符合条件的原账号、企业资料和可复用配置可以保留，但模拟交易与权益不能直接转为真实业务数据。'],
  ['支付Standard费用后可以立即发行Token吗？', '不能。商业付费与实际发行资格相互独立。真实发行仍需完成相应法律、业务授权、资金和生产安全检查。'],
  ['如果Standard到期，历史投资者权益会被删除吗？', '不会因为商业订阅到期就删除或否定已经合法形成的真实投资者权益、资金记录和法定登记。后续服务限制、持续履约及数据交接必须依照适用的合同与法律规则处理。'],
];

function PricingFaq() {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${open === index ? 'active' : ''}`} key={question}>
    <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>{question}<span>{open === index ? '−' : '+'}</span></button>
    {open === index && <p>{answer}</p>}
  </div>)}</div>;
}

export function Pricing() {
  const [role] = useDemoRole();
  const [notice, setNotice] = useState('');
  const freeHref = demoRoute(paths.login + '?intent=free');
  const standardHref = role === 'visitor' ? paths.upgrade : role === 'multiple' || role === 'none' ? paths.organizations + '?intent=standard&demo=1' : undefined;
  const subscribe = () => setNotice(role === 'no-subscription'
    ? '当前演示角色没有订阅管理权限。请联系所属企业管理员；不能越权升级。'
    : role === 'standard'
      ? '当前企业已开通Standard。正式服务中，有权限的管理员可在原企业工作台管理订阅；此处不重复开通或生成账单。'
      : role === 'upgrading'
        ? '当前企业升级申请处理中。请在原企业工作台查看原申请进度，不重复创建申请或扣款。'
        : 'Standard价格与计费周期尚未公布，当前不能生成订阅账单。您可以先了解升级条件。');
  const standardLabel = role === 'standard' ? '管理订阅' : role === 'upgrading' ? '查看升级进度' : '了解升级条件';
  return <main className="pricing-page">
    <section className="pricing-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">SUBSCRIPTION / 订阅方案</span><h1>从免费Sandbox开始，<br /><em>按业务需要升级</em></h1><p>Free永久免费，适合熟悉发行管理流程。Standard为准备开展正式业务的企业提供商业SaaS订阅，价格与计费周期待公布。</p><div className="pricing-hero-note">订阅Standard不自动取得真实Token发行、资金执行或WDEX投资者平台发行方案上架资格。</div></div></section>
    <section className="section pricing-plans"><div className="container"><div className="pricing-grid"><article className="plan-card free"><div className="plan-top"><span className="eyebrow">SANDBOX / 模拟体验</span><h2>Free</h2><strong className="plan-price">永久免费</strong><p>适合希望了解WDEX SaaS、准备发行方案或进行流程测试的企业。</p></div>{isLocalPreview() ? <a className="button button-outline plan-main" href={freeHref}>免费开始<span aria-hidden="true">↗</span></a> : <span className="button button-outline plan-main" aria-disabled="true">Free开通暂未开放</span>}<div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{freeBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Free始终运行在受控Sandbox/测试环境中。模拟投资者、订单、资金、Token及权益不产生真实法律效力。</p><small>永久免费不代表无资源限制。具体配额以正式公布的订阅方案说明为准。</small></article>
    <article className="plan-card standard"><div className="plan-top"><span className="eyebrow">COMMERCIAL / 商业订阅</span><h2>Standard</h2><strong className="plan-price">价格待公布</strong><p>适合准备将WDEX SaaS应用于实际发行业务，并需要正式商业订阅与生产能力的机构。</p></div>{standardHref ? <a className="button button-primary plan-main" href={standardHref}>{standardLabel}<span aria-hidden="true">↗</span></a> : <button className="button button-primary plan-main" type="button" onClick={subscribe}>{standardLabel}<span aria-hidden="true">↗</span></button>}<div className="plan-secondary"><a href={paths.contact + '?topic=standard'}>有疑问？查看联系渠道</a><a href={demoRoute(paths.login + '?intent=standard')}>申请升级？先验证企业账号</a></div>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{standardBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Standard订阅并不自动开通真实Token发行、资金操作或投资者购买权限。实际业务需要完成适用的法律、业务与生产授权。</p><small>价格、计费周期、资源配额及外部服务费用以正式商业方案为准。</small></article></div></div></section>
    <section className="section pricing-comparison"><div className="container"><SectionHeading eyebrow="PLAN COMPARISON / 方案对比" title="按业务阶段比较两种方案" description="Free用于Sandbox模拟；Standard提供商业SaaS使用基础。" /><div className="compare-wrap"><table><thead><tr><th>功能类别</th><th>Free</th><th>Standard</th></tr></thead><tbody>{comparison.map(([feature, free, standard]) => <tr key={feature}><th>{feature}</th><td>{free}</td><td>{standard}</td></tr>)}</tbody></table></div><p className="compare-note">真实业务操作仍须满足发行主体、项目、合法执行及生产条件。Standard订阅支持使用USDT付款，具体支持的区块链网络及付款信息，以实际订阅账单页面显示为准。</p></div></section>
    <section className="section pricing-upgrade"><div className="container"><SectionHeading eyebrow="STANDARD / 升级摘要" title="沿用原企业工作台升级" description="订阅页说明选择差异；详细审核、账单和异常状态请查看升级说明。" /><div className="upgrade-steps">{upgradeSteps.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="upgrade-warning">Sandbox中的模拟资金、认购、Token及权益不会直接转为真实记录。</p><Button href={paths.upgrade} variant="outline">查看Standard升级流程</Button></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading eyebrow="FAQ / 常见问题" title="订阅常见问题" /><PricingFaq /><div className="section-action"><Button variant="text" href={paths.help}>查看帮助中心</Button></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
