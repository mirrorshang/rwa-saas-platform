import { useState } from 'react';
import { Button, DemoNotice, SectionHeading } from '../site';
import { marketplaceIsOpen, marketplaceLink, paths } from '../config';

const capabilities = [
  { no: '01', icon: '▰', title: '多资产管理', body: '统一管理不同类别的底层资产、金融权利工具及相关法律资料。支持多资产、多项目的集中管理。', anchor: 'assets' },
  { no: '02', icon: '▤', title: '项目与发行管理', body: '按项目和发行轮次组织发行计划、条款配置、审核与发布流程。', anchor: 'issuance' },
  { no: '03', icon: '⬡', title: 'Token管理', body: '管理Token方案、合约配置、受权链上操作及相关交易状态，保持业务记录与链上信息可追溯。', anchor: 'token' },
  { no: '04', icon: '◇', title: '独立投资者门户', body: '为发行机构建立独立门户，配置基础品牌信息、授权展示内容及投资者访问入口。', anchor: 'portal' },
  { no: '05', icon: '▣', title: '认购与资金管理', body: '统一跟踪投资者资格、认购订单、付款、配售、登记、退款与募集款结算状态。', anchor: 'subscription' },
  { no: '06', icon: '◫', title: '发行后运营', body: '持续管理持有人信息、收益分配、存续事项、信息披露及到期退出流程。', anchor: 'lifecycle' },
];

const steps = [
  ['01', '创建企业工作台', '注册账号，免费建立属于企业的SaaS工作空间。', '企业设置'],
  ['02', '准备资产与权利工具', '录入资产资料，配置适用的金融工具并整理法律文件。', '资产档案'],
  ['03', '创建发行项目', '建立发行项目和发行轮次，配置发行参数、Token方案及发行前检查。', '发行项目'],
  ['04', '管理投资者认购', '通过机构独立门户管理获授权的投资者准入、认购与交付。', '投资者认购'],
  ['05', '开展发行后管理', '跟踪投资者权益、收益分配、存续事项与到期退出。', '发行后运营'],
];

const faqs = [
  ['Free版本真的永久免费吗？', '是的。Free没有固定试用到期时间，可持续使用Sandbox体验主要业务功能。部分资源和外部服务可能存在使用限制。'],
  ['使用Free需要先完成企业KYB吗？', '不需要先完成完整商业KYB。注册并完成邮箱验证后，可以进入Free工作台。升级Standard时需完成相应商业审核。'],
  ['一个企业可以管理多个发行项目吗？', '可以。同一企业工作台支持管理不同资产类别、多个发行项目和发行轮次，并按授权范围查看业务进度。'],
  ['订阅Standard就可以直接发行真实Token吗？', '不可以。Standard提供商业使用资格。真实发行、投资者购买、资金和Token操作还需要满足相应法律、业务和生产授权条件。'],
  ['投资者如何访问我们的发行项目？', '发行机构可通过独立投资者门户服务本机构投资者，也可按Offering申请在WDEX统一投资端展示。平台渠道上架及实际认购均受审核和适用资格限制，不保证投资者数量或募集结果。'],
];

function DashboardMock() {
  return <div className="dashboard-shell">
    <div className="dashboard-top"><strong>WDEX SaaS</strong><div className="dashboard-top-lines"><span /><span /><span /></div><span className="dashboard-avatar">◎</span></div>
    <div className="dashboard-body">
      <aside className="dashboard-side"><span className="selected">▦　工作台首页</span><span>▱　资产与发行</span><span>◇　投资者门户</span><span>▤　投资者与认购</span></aside>
      <div className="dashboard-main"><div className="dashboard-title"><div><small>企业工作空间</small><h3>项目概览</h3></div><span className="mock-tag">Sandbox示例</span></div>
        <div className="dashboard-metrics"><div><span>资产档案</span><b>▰</b><i /></div><div><span>发行项目</span><b>▤</b><i /></div><div><span>投资者门户</span><b>◇</b><i /></div><div><span>待办事项</span><b>☷</b><i /></div></div>
        <div className="dashboard-chart"><span>发行进度</span><div className="chart-track"><i /><i /><i /><i /></div><div className="chart-labels"><small>准备中</small><small>待审核</small><small>发布条件</small><small>后续管理</small></div></div>
        <div className="dashboard-lower"><div><span>资产与项目</span><div className="mock-row"><i /> <em /> <b /></div><div className="mock-row"><i /> <em /> <b /></div><div className="mock-row"><i /> <em /> <b /></div></div><div><span>认购 / Token / 收益</span><div className="mini-grid"><i /><i /><i /></div><div className="mock-line" /><div className="mock-line short" /></div></div>
      </div>
    </div>
    <span className="dashboard-caption">界面示意 · 不代表真实业务数据</span>
  </div>;
}

function StepVisual({ index, label }: { index: number; label: string }) {
  return <div className="step-visual"><div className="visual-head"><span>{label}</span><i>•••</i></div><div className="visual-body"><span className="visual-icon">{['▦', '▰', '▤', '◇', '◫'][index]}</span><div><i /><i /><i /></div><span className="visual-check">✓</span></div></div>;
}

function FaqList() {
  const [active, setActive] = useState(0);
  return <div className="faq-list">{faqs.map(([q, a], i) => <div className={`faq-item ${active === i ? 'open' : ''}`} key={q}><button type="button" onClick={() => setActive(active === i ? -1 : i)} aria-expanded={active === i}><span>{q}</span><span className="faq-chevron">{active === i ? '−' : '+'}</span></button>{active === i && <p>{a}</p>}</div>)}</div>;
}

export function Home() {
  return <main>
    <section className="hero-section"><div className="network-grid" /><div className="hero-halo" /><div className="container hero-inner">
      <div className="hero-copy"><div className="eyebrow-pill">面向发行机构的多资产Token化SaaS</div><h1>从资产发行到<br />投资者管理，<br /><em>在一个工作台完成</em></h1><p>为资产管理机构与发行企业提供统一的资产管理、Token发行、独立投资者门户、认购管理及发行后运营工具。轻松组织多资产、多项目和多轮发行。</p><div className="button-row"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.features}>了解产品功能</Button></div><div className="hero-note"><span className="note-line" />Free提供永久免费的Sandbox流程体验。<br />正式发行与实际资金操作须满足相应法律、授权及生产条件。</div></div>
      <div className="hero-product"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><DashboardMock /></div>
    </div></section>
    <section className="section capabilities-section"><div className="container"><SectionHeading center eyebrow="CAPABILITIES / 核心能力" title="一套SaaS，连接资产发行的每一步" description="从资产准备、发行配置到投资者管理与发行后运营，让复杂业务在统一工作台中有序开展。" /><div className="capabilities-grid">{capabilities.map(item => <a className="capability-card" href={paths.features + '#' + item.anchor} key={item.no}><div className="cap-top"><span>{item.no} / 06</span><span className="cap-icon">{item.icon}</span></div><h3>{item.title}</h3><p>{item.body}</p><span className="card-more">了解更多　↗</span></a>)}</div></div></section>
    <section className="section marketplace-section" aria-labelledby="marketplace-title"><div className="container"><div className="marketplace-layout"><div><span className="eyebrow">DISTRIBUTION CHANNELS / 展示渠道</span><h2 id="marketplace-title">独立门户之外，<br />增加一种合规展示选择</h2><p>发行机构可保留自己的投资者门户；符合条件的Offering也可申请在WDEX统一投资端展示。平台需单独审核上架、适用地区、受众及运营资格，实际认购还有独立的投资者资格要求。</p><a className="marketplace-text-link" href={marketplaceLink}>{marketplaceIsOpen ? '查看投资机会 ↗' : '了解统一投资端（筹备中） ↗'}</a></div><div className="marketplace-channel-grid"><article><span>V · 机构独立门户</span><strong>服务您的机构投资者</strong><p>面向本机构获授权的投资者，管理专属门户和发行信息。</p></article><article><span>M · WDEX统一投资端 <em>{marketplaceIsOpen ? '查看机会' : '筹备中'}</em></span><strong>按Offering申请平台展示</strong><p>自愿申请、单独审核；不随Standard订阅自动开放，也不保证募集成功。</p></article></div></div></div></section>
    <section className="section workflow-section"><div className="container"><SectionHeading center eyebrow="WORKFLOW / 使用流程" title="五步开启资产数字化发行管理" description="从免费建立工作台开始，逐步配置资产、发行和投资者管理流程。" /><div className="workflow-list">{steps.map(([no, title, body, label], index) => <div className="workflow-item" key={no}><div className="workflow-num">{no}</div><div className="workflow-text"><h3>{title}</h3><p>{body}</p></div><StepVisual index={index} label={label} /></div>)}</div><div className="section-action"><Button href={paths.pricing}>查看Free方案</Button><p>Free工作台为Sandbox模拟环境，不产生真实金融权益。</p></div></div></section>
    <section className="section audiences-section"><div className="container"><SectionHeading center eyebrow="FOR INSTITUTIONS / 目标客户" title="专为持续开展资产发行的机构设计" /><div className="audience-grid"><article className="audience-card"><div className="audience-scene architecture"><div className="building one" /><div className="building two" /><div className="building three" /></div><div className="audience-content"><span className="eyebrow">资产管理机构</span><h3>多资产、多项目统一管理</h3><p>在一个工作台中管理不同资产类别、多个发行项目和发行轮次，统一查看项目进展、投资者认购与发行后收益事项。</p><div className="pills"><span>多资产管理</span><span>多项目发行</span><span>投资者及存续管理</span></div><Button variant="outline" href={paths.solutions + '#asset-manager'}>查看解决方案</Button></div></article><article className="audience-card"><div className="audience-scene energy"><div className="energy-line" /><div className="energy-circle" /><div className="energy-bars"><i /><i /><i /><i /></div></div><div className="audience-content"><span className="eyebrow">发行企业与项目方</span><h3>从发行准备到持续运营</h3><p>通过标准化工具组织资产资料、金融工具、发行条款、Token配置与投资者门户，让发行准备和后续管理更有条理。</p><div className="pills"><span>发行流程管理</span><span>独立投资者门户</span><span>发行后管理</span></div><Button variant="outline" href={paths.solutions + '#issuer'}>查看解决方案</Button></div></article></div></div></section>
    <section className="section pricing-section"><div className="container"><SectionHeading center eyebrow="PRICING / 套餐预览" title="从免费体验开始，按业务需要升级" description="永久免费探索SaaS功能，准备开展正式业务时再选择适合的商业方案。" /><div className="plan-grid"><article className="plan-card featured"><div className="plan-kicker">探索与模拟</div><h3>Free</h3><div className="plan-price">永久免费</div><p>适合熟悉产品、准备发行流程和Sandbox模拟测试。</p><ul><li>主要V1业务模拟</li><li>模拟投资者门户</li><li>模拟认购与Token流程</li></ul><Button href={paths.pricing}>了解Free方案</Button></article><article className="plan-card"><div className="plan-kicker">商业使用方案</div><h3>Standard</h3><div className="plan-price">价格待公布</div><p>适合计划将SaaS用于正式发行业务的机构。</p><ul><li>商业订阅、企业KYB与合同</li><li>满足额外合法和生产条件后使用</li><li>获授权的真实业务能力</li></ul><Button variant="outline" href={paths.pricing}>了解Standard方案</Button></article></div><p className="plan-disclaimer">Standard商业订阅不代表自动获得金融发行、真实资金或链上生产执行许可。</p></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="常见问题" /><FaqList /><div className="section-action"><Button variant="text" href={paths.help}>查看更多问题</Button></div></div></section>
    <section className="final-cta"><div className="cta-network" /><div className="container final-cta-inner"><div><span className="eyebrow">BUILD YOUR WORKSPACE</span><h2>开始建立您的<br />资产发行工作台</h2><p>从永久免费Free开始，体验资产、发行项目和投资者管理的完整模拟流程。</p><div className="button-row"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.pricing}>查看Standard方案</Button></div></div><div className="cta-diagram"><span className="node n1">资产</span><span className="node n2">项目</span><span className="node n3">投资者</span><span className="node n4">发行后</span></div></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
