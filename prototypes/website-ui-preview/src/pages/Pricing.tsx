import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, useDemoRole } from '../site';
import { paths } from '../config';

const freeBenefits = [
  '免费创建企业工作台', '管理模拟资产与金融工具', '创建Sandbox项目与Offering',
  '模拟Token配置及相关流程', '使用模拟投资者门户', '模拟投资者资格、认购与资金处理',
  '模拟配售、收益和发行后管理', '保留测试环境中的工作记录及允许复用的配置',
];
const standardBenefits = [
  '企业SaaS商业订阅', '多资产、多项目及Offering管理', '企业团队与权限管理',
  '标准独立投资者门户', '投资者资格、认购与配售管理', 'Token与链上记录管理',
  '资金对账及受权结算流程', '法定持有人登记关联', '收益、存续及退出管理',
  '满足独立条件后使用获授权的生产能力',
];
const comparison = [
  ['企业工作台', '免费开通', '商业订阅使用'],
  ['多资产管理', 'Sandbox配置与模拟', '正式业务管理能力'],
  ['金融权利工具', '模拟配置', '按适用条件管理'],
  ['多项目与Offering', 'Sandbox模拟', '正式项目及发行管理'],
  ['文件与审批', '模拟业务流程', '受权正式工作流'],
  ['Token管理', '模拟Token或批准的测试环境', '满足条件后可使用受权生产操作'],
  ['独立投资者门户', '模拟门户', '获授权的正式机构门户'],
  ['投资者资格', '模拟KYC与资格流程', '受权真实身份及资格流程'],
  ['认购订单', '模拟认购和订单', '符合条件的真实认购流程'],
  ['支付和资金', '模拟付款、退款及结算', '受权真实资金执行与对账'],
  ['配售及登记', '模拟配售和名册', '依法受权的配售与登记'],
  ['收益和存续', '模拟分配及退出', '受权的实际业务管理'],
  ['数据与报表', 'Sandbox数据', '授权真实业务数据'],
  ['高级白标', '当前V1不包含', '当前V1不包含'],
  ['商业OpenAPI/SDK', '当前V1不包含', '当前V1不包含'],
];
const upgradeSteps = [
  ['选择Standard', '从本页点击「立即订阅」：未注册者先开通Free，已有账号先登录；通过认证及企业授权后，由有订阅管理权限者进入原企业工作台自助订阅入口。'],
  ['企业商业KYB与协议', '按要求自行提交企业资料，完成必要商业KYB与合同确认；需人工复核或补件时保留受限等待状态。'],
  ['确认账单周期与金额', '选择已正式批准的套餐周期并查看明确的价格、币种USDT及账单有效期；周期和金额未定时不得生成实际账单。'],
  ['选择USDT网络并付款', '在经验证可用的TRON（TRC-20）、BNB Smart Chain（BEP-20）或Ethereum（ERC-20）网络中选择其一，按该网络专用账单单次付款。'],
  ['核实到账并激活权益', '真实到账及链上确认经账单、币种和网络匹配后，才可激活原企业的Standard商业权益。到期后由用户再次手动续费。'],
];
const faqs = [
  ['Free版本真的永久免费吗？', '是的。Free没有固定试用到期时间，可以长期在Sandbox环境中体验主要产品能力，但须遵守资源限制、安全及服务规则。'],
  ['使用Free需要绑定付款方式吗？', '免费开通Free不要求预先绑定付款方式。未来如使用需付费的额外服务，应由正式产品规则和协议明确说明。'],
  ['Free可以模拟完整发行流程吗？', '可以。Free支持主要V1业务的模拟演练，包括资产、Offering、投资者、认购、Token、资金及收益等流程，但不会产生真实资金或法定权益。'],
  ['Standard具体多少钱？', 'Standard价格与计费周期目前尚未公布。正式价格发布后可在套餐页面查看，并由有权企业管理员直接自助订阅；无需联系销售才能购买。'],
  ['升级Standard后，需要重新创建企业和项目吗？', '不需要重新创建企业Tenant。符合条件的原账号、企业资料和可复用配置可以保留，但模拟交易与法律权益不能直接转为真实业务数据。'],
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
  const standardHref = role === 'visitor' ? paths.register + '?intent=standard' : role === 'multiple' || role === 'none' ? paths.organizations + '?intent=standard' : undefined;
  const subscribe = () => setNotice(role === 'no-subscription'
    ? '当前演示角色没有订阅管理权限。请联系所属企业管理员；不能越权升级。'
    : role === 'standard'
      ? '当前企业已开通Standard。正式服务中，有权限的管理员可在原企业工作台管理订阅；此处不重复开通或生成账单。'
      : role === 'upgrading'
        ? '当前企业升级申请处理中。请在原企业工作台查看原申请进度，不重复创建申请或扣款。'
        : '价格与计费周期尚未公布，当前无法生成真实账单。正式上线后，有订阅管理权限的企业管理员可在原企业工作台自助完成商业KYB、合同、指定网络USDT账单及权益开通。此处仅为UI演示。');
  const standardLabel = role === 'standard' ? '管理订阅' : role === 'upgrading' ? '查看升级进度' : '立即订阅';
  return <main className="pricing-page">
    <section className="pricing-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">PRICING · 套餐与价格</span><h1>从免费体验开始，<br /><em>按业务需要升级</em></h1><p>使用永久免费Free体验主要资产发行管理功能。当企业准备将平台用于正式业务时，可申请升级至Standard，获得相应的商业SaaS使用权益。</p><div className="pricing-hero-note">Free用于Sandbox模拟，不设固定试用到期时间。Standard的实际生产能力仍受法律、业务授权及安全条件限制。</div></div></section>
    <section className="section pricing-plans"><div className="container"><div className="pricing-grid"><article className="plan-card free"><div className="plan-top"><span className="eyebrow">SANDBOX / 模拟体验</span><h2>Free</h2><strong className="plan-price">永久免费</strong><p>适合希望了解WDEX SaaS、准备发行方案或进行流程测试的企业。</p></div><a className="button button-outline plan-main" href={freeHref}>{role === 'single' ? '进入工作台' : '免费开始'}<span aria-hidden="true">↗</span></a><div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{freeBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Free始终运行在受控Sandbox/测试环境中。模拟投资者、订单、资金、Token及权益不产生真实法律效力。</p><small>永久免费不代表无资源限制。具体使用配额与第三方测试服务额度待确定。</small></article>
    <article className="plan-card standard"><div className="plan-top"><span className="eyebrow">COMMERCIAL / 商业订阅</span><h2>Standard</h2><strong className="plan-price">价格待公布</strong><p>适合准备将WDEX SaaS应用于实际发行业务，并需要正式商业订阅与生产能力的机构。</p></div>{standardHref ? <a className="button button-primary plan-main" href={standardHref}>{standardLabel}<span aria-hidden="true">↗</span></a> : <button className="button button-primary plan-main" type="button" onClick={subscribe}>{standardLabel}<span aria-hidden="true">↗</span></button>}<div className="plan-secondary"><a href={paths.upgrade}>了解升级流程</a><a href={paths.contact + '?topic=standard'}>订阅遇到问题？联系我们</a>{role === 'visitor' && <a href={paths.login + '?intent=standard'}>已有账号？先登录</a>}</div>{notice && <p className="inline-notice" role="status">{notice}</p>}<div className="plan-divider" /><span className="plan-subtitle">包含能力</span><ul>{standardBenefits.map(item => <li key={item}>{item}</li>)}</ul><p className="plan-boundary">Standard订阅并不自动开通真实Token发行、资金操作或投资者购买权限。实际业务需要完成适用的法律、业务与生产授权。</p><small>具体价格、计费周期、资源配额及外部服务费用以正式商业方案为准，目前待确定。</small></article></div></div></section>
    <section className="section pricing-comparison"><div className="container"><SectionHeading eyebrow="PLAN COMPARISON / 功能对比" title="选择适合当前业务阶段的套餐" description="两种套餐基于统一的SaaS产品架构。Free用于完整业务模拟，Standard为真实商业使用提供授权基础。" /><div className="compare-wrap"><table><thead><tr><th>功能类别</th><th>Free</th><th>Standard</th></tr></thead><tbody>{comparison.map(([feature, free, standard]) => <tr key={feature}><th>{feature}</th><td>{free}</td><td>{standard}</td></tr>)}</tbody></table></div><p className="compare-note">真实业务操作需要相应发行机构、Offering、合法执行主体及平台生产条件均满足要求。套餐对比不构成金融服务承诺。</p><p className="compare-note">成员、资产、项目、文件及第三方服务额度待确定；Standard价格、计费周期和外部费用待公布。首期USDT目标网络已确定，但不代表已接通商户服务。</p></div></section>
    <section className="section pricing-upgrade"><div className="container"><SectionHeading eyebrow="SELF-SERVICE UPGRADE / 自助升级" title="准备开展正式业务？按步骤升级Standard" description="沿用已有企业工作台，按商业审核与实际业务条件逐步开通。" /><div className="upgrade-steps">{upgradeSteps.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div><p className="upgrade-warning">升级过程中，原企业工作台及允许复用的草稿和配置可保留；Sandbox模拟资金、模拟认购、模拟Token及模拟权益不会直接转换为真实记录。</p>{standardHref ? <Button href={standardHref}>立即订阅</Button> : <button className="button button-primary" onClick={subscribe}>立即订阅<span aria-hidden="true">↗</span></button>}</div></section>
    <section className="section production-section"><div className="container"><SectionHeading center eyebrow="SANDBOX & PRODUCTION / 环境边界" title="商业订阅和真实发行，是两件不同的事" /><div className="production-grid"><article><span>01 / FREE</span><h3>Sandbox模拟</h3><p>Free支持使用测试数据演练主要发行流程，便于客户了解产品、准备配置及熟悉操作。模拟状态不能作为真实资金到账、法定持有人登记或链上实际交付的证明。</p></article><article><span>02 / STANDARD</span><h3>正式生产</h3><p>企业订阅Standard后，仍需根据具体业务完成发行合法性、授权、资金执行、Token签名及必要安全条件的检查。只有全部适用条件满足后，相关真实业务操作才能被授权使用。</p></article></div><p className="production-note">平台提供技术SaaS与业务管理工具，不默认代发行机构提供法律许可、募集资金、资产担保或收益保证。</p></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="关于套餐，您可能想了解" /><PricingFaq /><div className="section-action"><Button variant="text" href={paths.help}>查看更多常见问题</Button></div></div></section>
    <section className="final-cta"><div className="cta-network" /><div className="container final-cta-inner"><div><span className="eyebrow">GET STARTED</span><h2>免费开启您的<br />资产发行工作台</h2><p>先体验主要SaaS功能，再根据实际业务需要选择商业订阅方案。</p><div className="button-row"><Button href={paths.register}>免费开始</Button><Button variant="outline" href={paths.upgrade}>了解Standard升级流程</Button></div></div><div className="cta-diagram"><span className="node n1">资产</span><span className="node n2">项目</span><span className="node n3">投资者</span><span className="node n4">发行后</span></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
