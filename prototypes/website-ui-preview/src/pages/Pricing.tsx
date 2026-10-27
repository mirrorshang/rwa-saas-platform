import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, useDemoRole } from '../site';
import { paths } from '../config';

const freeBenefits = [
  '免费创建企业工作台', '管理模拟资产与金融工具', '创建Sandbox项目与发行轮次',
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
  ['金融权利工具', '模拟配置', '按适用条件管理'],
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
  ['选择企业', '在已有工作台中选择有权管理订阅的企业。'],
  ['完成商业审核', '提交企业资料并确认适用协议。'],
  ['确认订阅账单', '核对正式公布的周期、价格及账单信息。'],
  ['按账单付款', '使用实际开放的网络完成指定USDT付款。'],
  ['等待核验开通', '到账和账单匹配后，方可激活商业权益。'],
];
const faqs = [
  ['使用Free需要绑定付款方式吗？', 'Free无需预先绑定付款方式。额外服务的费用以正式公布的商业方案为准。'],
  ['Standard具体多少钱？', 'Standard价格与计费周期待公布。正式方案发布后，有权限的企业管理员可在企业工作台查看并办理订阅。'],
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
  const freeHref = role === 'visitor' ? paths.register : role === 'multiple' || role === 'none' ? paths.organizations : paths.onboarding;
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
    <section className="pricing-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">PRICING · 套餐与价格</span><h1>从免费体验开始，<br /><em>按业务需要升级</em></h1><p>使用永久免费Free体验主要资产发行管理功能。当企业准备将平台用于正式业务时，可申请升级至Standard，获得相应的商业SaaS使用权益。</p><div className="pricing-hero-note">Free用于Sandbox模拟，不设固定试用到期时间。Standard的实际生产能力仍受法律、业务授权及安全条件限制。</div></div></section>
    <section className="section pricing-plans"><div className="container"><div className="pricing-grid"><article className="plan-card free"><div className="plan-top"><span className="eyebrow">SANDBOX / 模拟体验</span><h2>Free</h2><strong className="plan-price">永久免费</strong><p>适合希望了解WDEX SaaS、准备发行方案或进行流程测试的企业。</p></div><a className="button button-outline plan-main" href={freeHref}>{role === 'single' ? '进入工作台' : '查看开通状态'}<span aria-hidden="true">↗</span></a><div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{freeBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Free始终运行在受控Sandbox/测试环境中。模拟投资者、订单、资金、Token及权益不产生真实法律效力。</p><small>永久免费不代表无资源限制。具体配额以正式公布的套餐说明为准。</small></article>
    <article className="plan-card standard"><div className="plan-top"><span className="eyebrow">COMMERCIAL / 商业订阅</span><h2>Standard</h2><strong className="plan-price">价格待公布</strong><p>适合准备将WDEX SaaS应用于实际发行业务，并需要正式商业订阅与生产能力的机构。</p></div>{standardHref ? <a className="button button-primary plan-main" href={standardHref}>{standardLabel}<span aria-hidden="true">↗</span></a> : <button className="button button-primary plan-main" type="button" onClick={subscribe}>{standardLabel}<span aria-hidden="true">↗</span></button>}<div className="plan-secondary"><a href={paths.contact + '?topic=standard'}>有疑问？查看联系渠道</a>{role === 'visitor' && <a href={paths.login + '?intent=standard'}>已有账号？先登录</a>}</div>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{standardBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Standard订阅并不自动开通真实Token发行、资金操作或投资者购买权限。实际业务需要完成适用的法律、业务与生产授权。</p><small>价格、计费周期、资源配额及外部服务费用以正式商业方案为准。</small></article></div></div></section>
    <section className="section pricing-comparison"><div className="container"><SectionHeading eyebrow="PLAN COMPARISON / 功能对比" title="选择适合当前业务阶段的套餐" description="两种套餐基于统一的SaaS产品架构。Free用于完整业务模拟，Standard为真实商业使用提供授权基础。" /><div className="compare-wrap"><table><thead><tr><th>功能类别</th><th>Free</th><th>Standard</th></tr></thead><tbody>{comparison.map(([feature, free, standard]) => <tr key={feature}><th>{feature}</th><td>{free}</td><td>{standard}</td></tr>)}</tbody></table></div><p className="compare-note">真实业务操作需要相应发行机构、发行项目、合法执行主体及平台生产条件均满足要求。套餐对比不构成金融服务承诺。</p><p className="compare-note">成员、资产、项目、文件与第三方服务配额以正式方案为准；Standard价格与计费周期待公布。实际可用的付款网络以正式订阅账单为准。</p></div></section>
    <section className="section pricing-upgrade"><div className="container"><SectionHeading eyebrow="SELF-SERVICE UPGRADE / 自助升级" title="Standard升级需要哪些步骤？" description="沿用已有企业工作台，按商业审核与实际业务条件逐步开通。" /><div className="upgrade-steps">{upgradeSteps.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="upgrade-warning">升级过程中，原企业工作台及允许复用的草稿和配置可保留；Sandbox模拟资金、模拟认购、模拟Token及模拟权益不会直接转换为真实记录。</p>{standardHref ? <Button href={standardHref}>了解升级条件</Button> : <button className="button button-primary" onClick={subscribe}>了解升级条件<span aria-hidden="true">↗</span></button>}</div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="关于套餐，您可能想了解" /><PricingFaq /><div className="section-action"><Button variant="text" href={paths.help}>查看更多常见问题</Button></div></div></section>
    <section className="final-cta"><div className="cta-network" /><div className="container final-cta-inner"><div><span className="eyebrow">GET STARTED</span><h2>选择适合企业阶段的<br />资产发行管理方案</h2><p>从Free Sandbox了解产品能力，再评估Standard商业使用条件。</p><div className="button-row"><Button href={paths.register}>查看Free开通状态</Button><Button variant="outline" href={paths.upgrade}>了解Standard升级流程</Button></div></div><div className="cta-diagram"><span className="node n1">资产</span><span className="node n2">项目</span><span className="node n3">投资者</span><span className="node n4">发行后</span></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
