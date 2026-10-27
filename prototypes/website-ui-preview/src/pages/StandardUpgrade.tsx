import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, useDemoRole } from '../site';
import { paths } from '../config';

const differences = [
  ['使用期限', '永久免费', '按有效商业订阅'],
  ['资产与项目', 'Sandbox模拟', '受权正式业务管理'],
  ['Offering与Token', '模拟配置、受控测试', '符合条件后使用正式执行能力'],
  ['投资者门户', 'Sandbox模拟门户', '获授权的机构门户'],
  ['认购与资金', '模拟数据', '满足独立授权条件后进行正式业务'],
  ['收益与存续', '模拟流程', '受权的实际管理流程'],
  ['商业KYB', 'Free开通不要求完整商业KYB', '订阅开通须满足商业审核要求'],
  ['费用', '永久免费', '付费订阅，正式价格待定'],
];
const steps = [
  ['选择企业与Standard', '登录RWA SaaS，选择您有权管理订阅的企业工作台，进入Standard升级流程。', '确定目标Tenant及有权申请升级的用户。'],
  ['完成企业商业审核', '根据业务要求提交企业商业资料和必要代表信息，完成商业KYB审核。', '符合商业订阅准入要求。'],
  ['确认套餐与合同', '确认Standard的正式订阅方案、价格、计费周期和适用的SaaS合同条款。', '形成有效商业订阅订单。'],
  ['选择USDT网络并付款', '根据商业账单选择支持的USDT支付网络，使用钱包转账完成单次订阅付款。', '对应商业账单付款得到核实。'],
  ['激活Standard权益', '当商业KYB、合同和真实SaaS付款均满足条件后，原企业工作台将获得Standard商业权益。', 'Standard商业权益生效。'],
];
const networks = [
  ['TRON', 'TRC-20', '使用TRON网络转账USDT'],
  ['BNB Smart Chain', 'BEP-20', '使用BNB Smart Chain网络转账USDT'],
  ['Ethereum', 'ERC-20', '使用Ethereum网络转账USDT'],
];
const billFields = [
  ['订阅套餐', 'Standard'], ['订阅企业', '当前已授权Tenant'], ['订阅周期', '实际批准的计费周期'],
  ['订单金额', '实际批准并生成的应付金额'], ['支付资产', 'USDT'], ['支付网络', '用户选择的已经实际开放网络'],
  ['收款地址', '与当前账单/网络/USDT合约匹配的有效地址'], ['二维码', '与同一地址/网络匹配'],
  ['订单有效期', '以正式付款规则为准'], ['支付状态', '待付款、检测到账、链确认中、核验完成或异常等真实状态'],
];
const preparation = [
  ['企业账户与权限', '您需要拥有企业工作台，并获得该企业的订阅管理权限。'],
  ['企业商业资料', '根据审核要求准备企业登记信息及必要的授权代表资料。'],
  ['商业条款与订阅选择', '确认正式套餐价格、计费周期、合同及相关商业费用。'],
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
  ['升级Standard需要联系销售吗？', '不需要。Standard支持企业自助订阅。您可以登录企业工作台，完成商业KYB、合同确认和订阅付款。'],
  ['升级后原来的Free企业工作台还在吗？', '在。Standard升级沿用原Tenant，符合要求的企业资料及配置可以继续使用。'],
  ['Free里的模拟订单和Token会自动变成真实记录吗？', '不会。Sandbox模拟订单、资金、Token和权益不能因为订阅升级而直接成为真实金融事实。'],
  ['Standard支持哪些付款方式？', '目前批准的首期产品方案为USDT账单付款，目标支持TRON、BNB Smart Chain及Ethereum网络。实际开放网络以正式支付服务接入结果为准。'],
  ['可以使用其他网络的USDT付款吗？', '只有账单页面明确列为可用的网络才能用于付款。不要自行切换网络或将其他网络的地址直接复用。'],
  ['Standard是否自动续费？', '首期采用账单续费与到期提醒，不采用钱包长期自动扣款授权。实际计费周期和具体费用将在商业方案正式批准后公布。'],
  ['付款后能否立即正式发行Token？', '不能。Standard商业权益与真实发行授权相互独立，具体Offering仍需通过法律、发行主体、资金和Token执行等相关条件检查。'],
  ['付款已经发出，但系统尚未开通Standard怎么办？', '请先在原企业工作台查看账单与付款核验状态，不要立即重复付款。如有异常，可通过支持入口寻求人工协助。'],
];

const demoStages = [
  ['ready', '有权升级的Free企业'],
  ['member', '普通成员，无订阅管理权限'],
  ['kyb-review', '商业KYB审核中'],
  ['kyb-supplement', '商业KYB需补充资料'],
  ['kyb-rejected', '商业KYB未通过'],
  ['contract', '商业合同待确认'],
  ['bill', '原账单已生成、尚未支付'],
  ['confirming', '付款已广播、确认中'],
  ['unknown', '付款结果Unknown'],
  ['activating', '付款已核实、权益开通中'],
  ['unavailable', '定价或支付通道暂不可用'],
  ['expired', 'Standard到期、暂停或欠费'],
] as const;
type DemoStage = typeof demoStages[number][0];
const stageCopy: Record<DemoStage, string> = {
  ready: '价格待公布，当前无法实付。正式上线后，受权管理员可在原企业工作台发起商业KYB、合同与订阅流程。',
  member: '您没有该企业的订阅管理权限。请联系企业管理员；已有的正常企业模块仍依您的权限可用。',
  'kyb-review': '商业审核正在进行。请在原企业工作台查看原申请进度，避免重复提交。',
  'kyb-supplement': '请在原企业工作台按原申请指引补充资料，继续受权复核流程。',
  'kyb-rejected': '请查看受权的拒绝或复核路径，不能跳过商业KYB直接付款。',
  contract: '请在原企业工作台继续确认原订阅意图的合同条款。',
  bill: '请返回原订阅订单；恢复同一有效账单，不重复生成付款订单。',
  confirming: '付款确认中。请查看原订单，确认标准达成前不会提前激活Standard。',
  unknown: '付款结果尚不明确。请查看原Intent与真实收款证据，不要再次付款。',
  activating: '商业付款已核实，但权益仍在处理中。请在原企业工作台查看开通状态。',
  unavailable: '价格待公布，当前暂无法实付，也不会生成真实付款订单。',
  expired: '请在有权企业工作台按正式规则恢复或续费；既有合法权益不会被直接抹除。',
};

export function StandardUpgrade() {
  const [role] = useDemoRole();
  const demo = new URLSearchParams(location.search).get('demo') === '1';
  const effectiveRole = demo ? role : 'visitor';
  const [stage, setStage] = useState<DemoStage>('ready');
  const [notice, setNotice] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const href = effectiveRole === 'visitor' ? paths.register + '?intent=standard' :
    effectiveRole === 'multiple' || effectiveRole === 'none' ? paths.organizations + '?intent=standard&demo=1' : '';
  const label = effectiveRole === 'standard' ? '管理订阅' : effectiveRole === 'upgrading' ? '查看升级状态' : '开始升级Standard';
  const action = () => setNotice(effectiveRole === 'no-subscription' || stage === 'member' ? stageCopy.member :
    effectiveRole === 'standard' ? '该企业的Standard已生效。请由有权限的管理员在原企业工作台管理订阅；演示预览不包含真实I端。' :
      effectiveRole === 'upgrading' ? '请返回原企业工作台查看原升级申请，不重新发起订阅或付款。演示预览不包含真实I端。' :
        stageCopy[stage]);
  const actionButton = () => href ? <Button href={href}>{label}</Button> :
    <button type="button" className="button button-primary" onClick={action}>{label}<span aria-hidden="true">↗</span></button>;
  const explainException = (index: number) => setNotice(`${exceptions[index][0]}：请在原企业工作台查看受权的原申请或订单；当前演示不连接I端，也不会创建新账单。`);
  return <main className="standard-upgrade-page">
    <section className="upgrade-hero"><div className="network-grid" /><div className="container upgrade-hero-grid"><div><span className="eyebrow">STANDARD · 自助升级</span><h1>升级Standard，<br /><em>开启企业商业使用</em></h1><p>从永久免费Free Sandbox升级至Standard，在同一企业工作台中管理您的正式商业业务。在线完成必要的企业审核、合同确认及订阅付款，无需先联系销售。</p><div className="upgrade-hero-caution">升级Standard并不代表自动获得真实资产发行、Token主网操作或投资者资金执行权限。具体业务仍须满足相应法律与授权要求。</div><div className="button-row">{actionButton()}<Button href={paths.pricing} variant="outline">查看套餐对比</Button></div><span className="upgrade-price">Standard · 价格待公布</span></div><div className="upgrade-flow-visual"><span>商业订阅路径 · 流程示意</span>{['企业工作台', '商业KYB', '订阅合同', 'USDT账单', 'Standard权益'].map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, '0')}</b><strong>{item}</strong><i>→</i></div>)}<small>在原企业工作台升级，不必重新创建企业。<br />演示流程不表示审核或付款已经完成。</small></div></div></section>
    <section className="section upgrade-difference"><div className="container"><SectionHeading eyebrow="FREE → STANDARD" title="从Sandbox体验到商业使用" description="Free帮助您熟悉发行流程，Standard提供企业商业使用资格。" /><div className="compare-wrap"><table><thead><tr><th>能力类别</th><th>Free</th><th>Standard</th></tr></thead><tbody>{differences.map(([type, free, standard]) => <tr key={type}><th>{type}</th><td>{free}</td><td>{standard}</td></tr>)}</tbody></table></div><p className="compare-note">Standard提供商业SaaS权益。真实Offering发布、投资者准入、合法资金操作和Token执行，还需分别满足适用的生产条件。</p><Button href={paths.pricing} variant="outline">查看完整套餐功能</Button></div></section>
    <section className="section upgrade-process"><div className="container"><SectionHeading eyebrow="SELF-SERVICE / 五步升级" title="五个步骤，完成Standard商业开通" description="所有步骤围绕您已有的企业工作台进行，无需通过销售人员代为下单。" /><div className="upgrade-process-grid">{steps.map(([title, body, result], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p><small>步骤结果：{result}</small></article>)}</div><div className="upgrade-process-note"><p>已有Free企业在原Tenant升级。多Tenant先选择目标企业；普通成员不能代企业管理员升级。商业KYB并非具体发行法律许可，真实付款须经账单核验，模拟数据不会自动转为真实记录。</p>{actionButton()}</div></div></section>
    <section className="section upgrade-payment"><div className="container"><SectionHeading eyebrow="USDT / SaaS订阅费用" title="使用USDT支付SaaS订阅费用" description="Standard采用账单式付款。根据实际开放的网络选择USDT完成付款，系统核实后处理商业权益。" /><div className="upgrade-networks">{networks.map(([name, type, body]) => <article key={name}><span>首期目标网络</span><h3>{name}</h3><strong>{type}</strong><p>{body}</p></article>)}</div><p className="upgrade-network-note">以上为已批准的首期目标网络，并不代表商户通道已接通。具体可支付网络必须以正式上线后实际验证可用的网络为准。</p><div className="upgrade-payment-grid"><article><h3>有权企业工作台中的账单信息</h3><p>以下仅说明未来受权I端的显示规则，本页不生成账单、收款地址或二维码。</p><dl>{billFields.map(([field, value]) => <div key={field}><dt>{field}</dt><dd>{value}</dd></div>)}</dl></article><div><article className="upgrade-safety"><h3>付款前，请确认网络与账单信息</h3><p>USDT可能运行在不同区块链网络。付款时请严格核对选择的网络、收款地址及实际应付金额。使用错误网络转账可能导致付款无法自动识别，甚至产生不可恢复的资产损失。</p><ul><li>只使用当前官方账单信息，不复用其他网络的同形地址。</li><li>绝不向客服提供钱包私钥或助记词。</li><li>Tx Hash或截图不等于核实入账；须真实收款并达到确认标准。</li></ul></article><article className="upgrade-renewal"><h3>按账单续费，费用清晰可控</h3><p>Standard首期采用账单式付款和到期提醒。订阅即将到期时，企业可以在工作台查看新的续费账单，并自行完成付款。</p><strong>首期不要求钱包长期授权自动扣款。</strong></article></div></div><p className="upgrade-payment-boundary">USDT仅用于企业购买平台SaaS商业服务费，不是投资者认购或Offering募集资金。正式价格、周期、商户通道及支付网络仍待批准与验证。</p></div></section>
    <section className="section upgrade-prepare"><div className="container"><SectionHeading eyebrow="PREPARATION / 升级准备" title="升级前，您可以先准备以下信息" /><div className="upgrade-prep-grid">{preparation.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="upgrade-prepare-note">Free用户可以先使用Sandbox体验产品，不需要为了浏览升级说明而提交真实KYB资料或进行USDT转账。</p></div></section>
    <section className="section upgrade-exceptions"><div className="container"><SectionHeading eyebrow="STATUS / 异常与恢复" title="升级过程中遇到问题？" /><div className="upgrade-exception-grid">{exceptions.map(([title, body, cta], index) => <article key={title}><span>情形 0{index + 1}</span><h3>{title}</h3><p>{body}</p><button type="button" onClick={() => explainException(index)}>{cta} ↗</button></article>)}</div><p className="upgrade-network-note">Unknown、少付、多付、错网络、订单超时或链上确认不足均不代表付款完成。原账单与受权工作台是恢复依据，不重复扣款或越权开通。</p></div></section>
    <section className="section upgrade-status"><div className="container"><SectionHeading eyebrow="ACCESS / 状态分流" title="按当前企业状态继续" description="官网仅提供说明和安全入口。身份、商业KYB、合同、收款及权益以受权企业工作台的实际状态为准。" /><div className="upgrade-status-panel"><div><h3>当前演示状态</h3><p>{effectiveRole === 'visitor' ? '未登录访客可先创建Free企业；已有账户可先使用邮箱验证码登录。' : effectiveRole === 'multiple' ? '多企业用户先选择目标企业，再核对订阅管理权限。' : effectiveRole === 'standard' ? 'Standard已生效，入口将用于管理订阅。' : stageCopy[stage]}</p><div className="button-row">{actionButton()}{effectiveRole === 'visitor' && <Button href={paths.login + '?intent=standard'} variant="outline">已有账户，先登录</Button>}</div>{notice && <p className="inline-notice" role="status">{notice}</p>}</div><div><span className="eyebrow">演示状态检查</span><label>选择模拟商业状态<select value={stage} onChange={event => { setStage(event.target.value as DemoStage); setNotice(''); }} disabled={!demo}>{demoStages.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><small>仅在网址包含 ?demo=1 时可切换状态；这里不连接真实Tenant、KYB、合同或付款服务。</small></div></div></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="了解Standard升级" /><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'active' : ''}`} key={question}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>{question}<span>{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p>{answer}</p>}</div>)}</div><div className="section-action"><Button href={paths.help} variant="text">查看更多常见问题</Button></div></div></section>
    <section className="final-cta upgrade-final"><div className="container"><span className="eyebrow">STANDARD / 下一步</span><h2>准备好升级您的企业工作台了吗？</h2><p>通过自助订阅获取Standard商业权益，继续使用熟悉的企业工作台，无需重新创建企业。</p><div className="button-row">{actionButton()}<Button href={paths.pricing} variant="outline">返回套餐与价格</Button></div><a href={paths.contact + '?topic=standard'}>订阅遇到问题？联系我们</a></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
