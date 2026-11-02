import { useState } from 'react';
import { Button, SectionHeading, demoRoute, isDemoPreview } from '../site';
import { paths } from '../config';
import { getAuthorizedTenants, getDemoAccount, getDemoAuth, getDemoTenant } from '../issuerDemo';

const steps = [
  ['选择企业与Standard', '登录WDEX SaaS，选择您有权管理订阅的企业工作台，进入Standard升级流程。', '确认目标企业及订阅管理权限。'],
  ['完成企业商业审核', '根据业务要求提交企业商业资料和必要代表信息，完成商业KYB审核。', '符合商业订阅准入要求。'],
  ['确认订阅方案与合同', '确认Standard的正式订阅方案、价格、计费周期和适用的SaaS合同条款。', '形成有效商业订阅订单。'],
  ['选择USDT网络并付款', '根据商业账单选择支持的USDT支付网络，使用钱包转账完成单次订阅付款。', '对应商业账单付款得到核实。'],
  ['激活Standard权益', '当商业KYB、合同和真实SaaS付款均满足条件后，原企业工作台将获得Standard商业权益。', 'Standard商业权益生效。'],
];
const billFields = [
  ['订阅主体', '有权管理订阅的企业'], ['方案与周期', '以正式方案为准'],
  ['应付金额', '以有效账单为准'], ['支付资产与网络', '仅使用账单明确列出的USDT网络'],
  ['收款信息与有效期', '仅以企业工作台中的当前账单为准'],
];
const preparation = [
  ['企业账户与权限', '您需要拥有企业工作台，并获得该企业的订阅管理权限。'],
  ['企业商业资料', '根据审核要求准备企业登记信息及必要的授权代表资料。'],
  ['商业条款与订阅选择', '确认正式订阅价格、计费周期、合同及相关商业费用。'],
  ['USDT付款条件', '准备可在实际开放网络中完成付款的钱包和所需网络手续费。'],
];
const exceptions = [
  ['企业资料需要补充', '企业资料需要进一步确认，请根据工作台的审核指引补充信息。', '查看审核进度'],
  ['付款尚未确认', '您的付款正在核实中，请在原订阅订单中查看最新状态，避免重复付款。', '查看付款状态'],
  ['付款已确认，权益仍在开通', '我们已确认商业账单的付款结果，Standard权益仍在处理中，请返回订阅页面查看最新进度。', '查看开通状态'],
  ['付款网络或金额异常', '系统无法自动确认这笔付款。请保留您的交易信息，通过企业工作台查看处理进度或申请人工协助。', '查看订单详情'],
  ['升级暂不可用', 'Standard订阅暂时无法完成，请稍后查看升级状态。', '返回企业工作台'],
];
const faqs = [
  ['升级Standard需要联系销售吗？', '正式方案开放后，有订阅管理权限的企业管理员可在企业工作台办理商业审核、合同确认和订阅付款。'],
  ['升级后原来的Free企业工作台还在吗？', '在。Standard升级沿用原企业工作台，符合要求的企业资料及配置可以继续使用。'],
  ['Standard支持哪些付款方式？', 'Standard订阅支持使用USDT付款，具体支持的区块链网络及付款信息，以实际订阅账单页面显示为准。当前官网不提供真实付款。'],
  ['Standard是否自动续费？', '首期采用账单续费与到期提醒，不采用钱包长期自动扣款授权。实际计费周期和具体费用将在商业方案正式批准后公布。'],
  ['付款已经发出，但系统尚未开通Standard怎么办？', '请先在原企业工作台查看账单与付款核验状态，不要立即重复付款。如有异常，可通过支持入口寻求人工协助。'],
];


export function StandardUpgrade() {
  const demo = isDemoPreview();
  const auth = demo ? getDemoAuth() : null;
  const tenants = auth ? getAuthorizedTenants() : [];
  const selected = demo ? getDemoTenant() : null;
  const [openFaq, setOpenFaq] = useState(0);
  const href = !auth ? demoRoute(paths.login + '?intent=standard') :
    tenants.length === 0 ? getDemoAccount()?.canCreate ? paths.onboarding + '?intent=standard&demo=1' : paths.organizations + '?intent=standard&demo=1' :
      tenants.length > 1 || !selected ? paths.organizations + '?intent=standard&demo=1' : paths.issuerSettings + '?tab=subscription&intent=standard&demo=1';
  const label = !auth ? '登录后申请升级' : tenants.length > 1 || !selected ? '选择企业继续' : '查看企业订阅';
  const actionButton = () => <Button href={href}>{label}</Button>;
  return <main className="standard-upgrade-page">
    <section className="upgrade-hero"><div className="network-grid" /><div className="container upgrade-hero-grid"><div><span className="eyebrow">STANDARD / 升级流程</span><h1>沿用原企业工作台，<br /><em>完成商业升级</em></h1><p>正式服务开放后，可先在有权企业的工作台进入升级流程，再按适用要求办理商业KYB、合同、有效账单和付款核验。当前只说明流程，不生成订单或付款入口。</p><div className="upgrade-hero-caution">Standard不自动赋予真实发行、资金操作或WDEX投资者平台发行方案上架资格。</div><div className="button-row">{actionButton()}</div><span className="upgrade-price">Standard · 价格待公布</span></div><div className="upgrade-flow-visual"><span>商业订阅路径 · 流程示意</span>{['企业工作台', '商业KYB', '订阅合同', 'USDT账单', 'Standard权益'].map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, '0')}</b><strong>{item}</strong><i>→</i></div>)}<small>在原企业工作台升级，不必重新创建企业。<br />实际开通以正式审核与付款核验结果为准。</small></div></div></section>
    <section className="section upgrade-process" id="upgrade-process"><div className="container"><SectionHeading eyebrow="SELF-SERVICE / 五步升级" title="五个步骤，完成Standard商业开通" description="所有步骤围绕您已有的企业工作台进行，无需通过销售人员代为下单。" /><div className="upgrade-process-grid">{steps.map(([title, body, result], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p><small>步骤结果：{result}</small></article>)}</div><div className="upgrade-process-note"><p>已有Free企业在原企业工作台升级。管理多个企业的用户先选择目标企业；普通成员不能代企业管理员升级。商业KYB并非具体发行法律许可，付款须经有效账单核验。SaaS服务协议尚未发布，当前无法提交升级申请。</p>{actionButton()}</div></div></section>
    <section className="section upgrade-payment"><div className="container"><SectionHeading eyebrow="USDT / SaaS订阅费用" title="使用USDT支付SaaS订阅费用" description="Standard订阅支持使用USDT付款，具体支持的区块链网络及付款信息，以实际订阅账单页面显示为准。" /><p className="upgrade-network-note">当前官网不生成账单或付款入口；任何网络均未在此页面承诺正式开放。</p><div className="upgrade-payment-grid"><article><h3>正式账单应包含的信息</h3><p>订阅账单仅在有权企业工作台中显示；本页不生成账单、收款地址或二维码。</p><dl>{billFields.map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{value}</dd></div>)}</dl></article><div><article className="upgrade-safety"><h3>付款前，请确认网络与账单信息</h3><p>USDT可能运行在不同区块链网络。付款时请严格核对选择的网络、收款地址及实际应付金额。使用错误网络转账可能导致付款无法自动识别，甚至产生不可恢复的资产损失。</p><ul><li>只使用当前官方账单信息，不复用其他网络的同形地址。</li><li>绝不向客服提供钱包私钥或助记词。</li><li>Tx Hash或截图不等于核实入账；须真实收款并达到确认标准。</li></ul></article><article className="upgrade-renewal"><h3>按账单续费，费用清晰可控</h3><p>Standard首期采用账单式付款和到期提醒。订阅即将到期时，企业可以在工作台查看新的续费账单，并自行完成付款。</p><strong>首期不要求钱包长期授权自动扣款。</strong></article></div></div><p className="upgrade-payment-boundary">USDT仅用于企业购买平台SaaS商业服务费，不是投资者认购或发行轮次募集资金。正式价格、周期、商户通道及支付网络仍待批准与验证。</p></div></section>
    <section className="section upgrade-prepare"><div className="container"><SectionHeading eyebrow="PREPARATION / 升级准备" title="升级前，您可以先准备以下信息" /><div className="upgrade-prep-grid">{preparation.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="upgrade-prepare-note">Free用户可以先使用Sandbox体验产品，不需要为了浏览升级说明而提交真实KYB资料或进行USDT转账。</p></div></section>
    <section className="section upgrade-exceptions"><div className="container"><SectionHeading eyebrow="STATUS / 异常与恢复" title="升级过程中遇到问题？" /><div className="upgrade-exception-grid">{exceptions.map(([title, body], index) => <article key={title}><span>情形 0{index + 1}</span><h3>{title}</h3><p>{body}</p><a href={href}>查看企业订阅 ↗</a></article>)}</div><p className="upgrade-network-note">结果待核实、少付、多付、错网络、订单超时或链上确认不足均不代表付款完成。原账单与受权工作台是恢复依据，不重复扣款或越权开通。</p></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="了解Standard升级" /><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'active' : ''}`} key={question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>{question}<span>{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p>{answer}</p>}</div>)}</div><div className="section-action"><Button href={paths.help} variant="text">查看更多常见问题</Button></div></div></section>
  </main>;
}
