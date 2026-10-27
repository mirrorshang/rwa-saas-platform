import { useState } from 'react';
import { Button, DemoNotice, SectionHeading } from '../site';
import { paths } from '../config';

const managerProblems = [
  ['资产资料分散', '不同资产的权属文件、金融工具、发行信息和相关材料需要分别管理，难以形成统一的资料体系。'],
  ['多个发行项目并行', '多个项目和发行轮次可能处于不同业务阶段，需要清晰区分发行参数、审核进度和投资者认购情况。'],
  ['发行后事务持续增加', '发行完成后，仍需要跟踪持有人、收益事件、信息披露和到期义务。'],
];
const managerAnswers = [
  ['统一资产库', '集中管理不同类别资产、金融权利工具、证明材料和版本信息。'],
  ['多项目与发行轮次管理', '在同一家企业工作台管理多个项目及关联发行轮次，按项目查看进度和待办。'],
  ['投资者与认购管理', '按授权范围管理投资者资格、认购订单、配售、登记及交付状态。'],
  ['存续与收益管理', '跟踪不同项目的权益记录、收益批次、实际支付状态及到期安排。'],
];
const issuerAnswers = [
  ['发行准备与文件管理', '统一管理资产、权利工具、发行主体及相关文件，支持审核、补件与版本追踪。'],
  ['项目和Token配置', '创建项目及发行轮次，管理发行参数、Token方案和必要发布前检查。'],
  ['独立投资者门户', '为发行机构配置独立访问入口，展示获授权的发行项目，并支持投资者使用相关服务。'],
  ['认购与发行后管理', '跟踪投资者准入、认购与资金、配售登记、Token交付及发行后的收益事务。'],
];
const issuerSteps = [
  ['创建企业工作台', '注册企业账号，免费进入Sandbox'],
  ['准备资产和法律资料', '建立资产、金融工具及必要发行材料'],
  ['配置发行项目', '设置发行轮次条款、Token参数及必要审核'],
  ['配置投资者门户', '建立机构专属入口，管理获授权的发行展示'],
  ['管理认购与交付', '跟踪资格、订单、付款、配售、登记及Token交付'],
  ['发行后持续管理', '跟踪收益事件、存续义务及到期退出'],
];
const faq = [
  ['我们管理不同类型的资产，是否需要购买多套SaaS？', '不需要按资产类别分别建立不同的产品系统。同一企业工作台支持管理多种资产类别和多个项目，具体发行工具及法律要求需按实际业务确定。'],
  ['我们只有一个发行项目，也适合使用吗？', '适合。企业可以先从一个项目开始，建立资产档案、配置发行轮次和投资者门户，再逐步开展后续业务。'],
  ['平台会帮助我们寻找投资者吗？', '除了发行机构自己的独立门户，平台规划了可选的统一投资端。Issuer可按Offering申请展示，平台核查上架条件、法域与受众，合格投资者才能参与一级认购。平台不保证投资者数量、认购金额或募集成功；订阅Standard也不自动获得上架资格。'],
  ['使用Standard能否直接进行真实发行？', 'Standard提供SaaS商业使用资格，真实发行还必须符合适用法律、发行主体授权、资金及Token执行条件。订阅本身不代表自动具备正式发行资格。'],
];
function ProblemAndAnswer({ problems, answers }: { problems?: string[][]; answers: string[][] }) {
  return <>{problems && <><div className="solution-subhead"><span>01 / 业务挑战</span><h3>资产管理机构面临的挑战</h3></div><div className="problem-grid">{problems.map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h4>{title}</h4><p>{body}</p></article>)}</div></>}<div className="solution-subhead"><span>{problems ? '02' : '01'} / 解决方案</span><h3>对应的产品能力</h3></div><div className="answer-grid">{answers.map(([title, body], i) => <article key={title}><span className="answer-symbol">{['▰','▤','◇','◫'][i]}</span><h4>{title}</h4><p>{body}</p></article>)}</div></>;
}

function ProcessPanel({ title, steps, preview }: { title: string; steps: string[][]; preview: string }) {
  return <div className="solution-process"><div className="process-list"><h3>{title}</h3>{steps.map(([name, body], i) => <div className="process-step" key={name}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{name}</strong><p>{body}</p></div></div>)}</div><div className="process-preview"><div className="process-preview-top"><span>WDEX SaaS</span><em>Sandbox示意</em></div><h4>{preview}</h4><div className="process-preview-tabs"><span>项目概览</span><span>发行进度</span><span>待办事项</span></div>{steps.slice(0, 4).map(([name], i) => <div className="process-preview-row" key={name}><i>{String(i + 1).padStart(2, '0')}</i><span>{name}</span><b /></div>)}<small>界面示意 · 无真实客户或金融数据</small></div></div>;
}

function SolutionFaq() {
  const [active, setActive] = useState(0);
  return <div className="faq-list">{faq.map(([q, a], i) => <div className={`faq-item ${active === i ? 'open' : ''}`} key={q}><button type="button" onClick={() => setActive(active === i ? -1 : i)} aria-expanded={active === i}><span>{q}</span><span className="faq-chevron">{active === i ? '−' : '+'}</span></button>{active === i && <p>{a}</p>}</div>)}</div>;
}

export function Solutions() {
  return <main>
    <section className="page-hero solutions-hero"><div className="network-grid" /><div className="container page-hero-inner"><div><span className="eyebrow">SOLUTIONS · 解决方案</span><h1>为不同发行机构，<br />提供统一的<br /><em>资产发行管理工具</em></h1><p>无论您需要持续管理多个资产发行项目，还是正在筹备一项新的资产发行，都可以通过WDEX SaaS组织资产资料、发行流程、投资者门户与发行后管理。</p><div className="button-row"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.features}>查看产品功能</Button></div><div className="hero-note"><span className="note-line" />支持多资产、多项目与多轮发行管理。实际发行安排及相关金融活动须符合适用的法律与授权要求。</div></div><div className="solutions-hero-visual"><div className="s-visual-title">多项目工作台 <span>Sandbox示意</span></div><div className="s-visual-overview"><div><b>资产与项目</b><i /><i /></div><div><b>发行管理</b><i /><i /></div></div><div className="s-visual-flow"><span>资产</span><em>→</em><span>项目</span><em>→</em><span>发行轮次</span><em>→</em><span>投资者</span></div><small>界面示意 · 不代表真实业务进度</small></div></div></section>
    <section className="section solution-selector"><div className="container"><SectionHeading center eyebrow="CHOOSE YOUR PATH / 客户场景" title="选择更符合您业务需求的解决方案" description="针对不同业务阶段，我们提供统一且可灵活使用的发行管理能力。" /><div className="selector-grid"><a href="#asset-manager"><span className="eyebrow">持续发行 · 多资产管理</span><div className="selector-icon">▰</div><h3>管理多个资产和发行项目，<br />不必切换多套工具</h3><p>适用于需要长期管理不同资产、多个发行项目和发行轮次的资产管理机构。</p><div className="pills"><span>多资产管理</span><span>多项目协作</span><span>持续运营</span></div><strong>查看解决方案 ↗</strong></a><a href="#issuer"><span className="eyebrow">项目发行 · 全流程管理</span><div className="selector-icon">▤</div><h3>从一次发行开始，<br />建立可持续使用的管理流程</h3><p>适用于希望通过Token化开展资产发行，并需要管理投资者认购和发行后事务的企业。</p><div className="pills"><span>发行准备</span><span>投资者门户</span><span>认购与存续</span></div><strong>查看解决方案 ↗</strong></a></div></div></section>
    <section className="section solution-detail" id="asset-manager"><div className="container"><div className="solution-intro"><span className="eyebrow">SOLUTION 01 · ASSET MANAGERS</span><h2>多个资产、多个项目，<br />在同一个工作台统一管理</h2><div><p>随着资产和发行项目增加，资产资料、发行轮次、投资者记录及后续收益管理也会变得更加复杂。</p><p>WDEX SaaS帮助资产管理机构在统一工作台中管理不同类别的资产、项目与发行轮次，将业务进度和关键记录集中呈现。</p></div></div><ProblemAndAnswer problems={managerProblems} answers={managerAnswers} /><div className="button-row solution-buttons"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.features + '#assets'}>了解资产与发行功能</Button></div></div></section>
    <section className="section solution-detail alternate" id="issuer"><div className="container"><div className="solution-intro"><span className="eyebrow">SOLUTION 02 · ISSUERS</span><h2>从发行准备到投资者管理，<br />建立完整业务流程</h2><div><p>对于计划开展资产Token化发行的企业，从资产资料准备、法律权利工具设计、发行参数配置，到投资者认购及发行后管理，需要多个业务环节相互衔接。</p><p>WDEX SaaS提供统一工作台，帮助企业组织发行流程、管理必要资料并追踪各阶段的业务状态。</p></div></div><ProblemAndAnswer answers={issuerAnswers} /><div className="marketplace-channel-inline"><span className="eyebrow">OPTIONAL / 可选平台渠道</span><h3>为Offering申请统一投资端展示</h3><p>发行机构可继续使用自己的V独立门户，也可针对具体Offering申请WDEX统一投资端展示。平台审核渠道、合法受众和开放条件；通过审核不意味着保证认购、募集或全球公开发行。</p><p className="marketplace-inline-status">当前筹备中 · 上架申请与真实认购尚未开放。</p><a href={paths.features + '#portal'}>查看V/M渠道区别 ↗</a></div><ProcessPanel title="从第一个项目开始，逐步完成发行管理" steps={issuerSteps} preview="发行项目工作空间" /><div className="button-row solution-buttons"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.features + '#issuance'}>了解发行管理功能</Button></div></div></section>
    <section className="section faq-section"><div className="container narrow"><SectionHeading center eyebrow="FAQ / 常见问题" title="常见问题" /><SolutionFaq /><div className="section-action"><Button variant="text" href={paths.help}>查看更多常见问题</Button></div></div></section>
    <section className="final-cta"><div className="cta-network" /><div className="container final-cta-inner"><div><span className="eyebrow">WORKSPACE FOR ISSUERS</span><h2>为您的资产发行业务<br />建立统一工作台</h2><p>了解永久免费Free方案，在Sandbox中探索资产管理、发行配置、投资者门户及发行后运营流程。</p><div className="button-row"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.upgrade}>查看Standard方案</Button></div></div><div className="cta-diagram"><span className="node n1">资产</span><span className="node n2">项目</span><span className="node n3">投资者</span><span className="node n4">发行后</span></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
