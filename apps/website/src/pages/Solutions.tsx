import { DemoNotice, SectionHeading } from '../site';
import { marketplaceIsOpen, paths } from '../config';

const managerProblems = [
  ['资产资料分散', '不同资产的权属文件、权益结构、发行信息和相关材料需要分别管理，难以形成统一的资料体系。'],
  ['多个发行项目并行', '多个项目和发行轮次可能处于不同业务阶段，需要清晰区分发行参数、审核进度和投资者认购情况。'],
  ['发行后事务持续增加', '发行完成后，仍需要跟踪持有人、收益事件、信息披露和到期义务。'],
];
const managerAnswers = [
  ['减少资料分散', '减少跨资产查找与重复整理资料。'],
  ['看清并行项目', '按项目识别负责人、进度和待办，及时处理阻塞。'],
  ['分清认购进度', '区分资格、订单、付款、配售与登记中尚未完成的环节。'],
  ['持续履行义务', '提前识别信息披露、收益和到期履约事项。'],
];
const issuerSteps = [
  ['创建企业工作台', '注册企业账号，免费进入Sandbox'],
  ['准备资产和法律资料', '建立资产、权益结构及法律文件'],
  ['配置发行项目', '设置发行轮次条款、Token参数及必要审核'],
  ['配置投资者门户', '建立机构专属入口，管理获授权的发行展示'],
  ['管理认购与交付', '跟踪资格、订单、付款、配售、登记及Token交付'],
  ['发行后持续管理', '跟踪收益事件、存续义务及到期退出'],
];
const managerSteps = [
  ['汇集多类资产', '为不同资产建立清晰档案与权益结构关系'],
  ['安排发行项目与发行轮次', '分别查看每个项目和轮次的条款及进度'],
  ['协调团队审核', '按企业权限处理资料、待办与发布检查'],
  ['跟踪投资者与交付', '对照资格、认购、配售和登记状态'],
  ['持续履行存续义务', '管理收益事件、披露与到期事项'],
];
function ProblemAndAnswer({ problems, answers }: { problems?: string[][]; answers: string[][] }) {
  return <>{problems && <><div className="solution-subhead"><span>01 / 业务挑战</span><h3>资产管理机构面临的挑战</h3></div><div className="problem-grid">{problems.map(([title, body], i) => <article key={title}><span>0{i + 1}</span><h4>{title}</h4><p>{body}</p></article>)}</div></>}<div className="solution-subhead"><span>{problems ? '02' : '01'} / 解决方案</span><h3>实际管理价值</h3></div><div className="answer-grid">{answers.map(([title, body], i) => <article key={title}><span className="answer-symbol">{['▰','▤','◇','◫'][i]}</span><h4>{title}</h4><p>{body}</p></article>)}</div></>;
}

function ProcessPanel({ title, steps, preview }: { title: string; steps: string[][]; preview: string }) {
  return <div className="solution-process"><div className="process-list"><h3>{title}</h3>{steps.map(([name, body], i) => <div className="process-step" key={name}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{name}</strong><p>{body}</p></div></div>)}</div><div className="process-preview"><div className="process-preview-top"><span>WDEX SaaS</span><em>Sandbox示意</em></div><h4>{preview}</h4><div className="process-preview-tabs"><span>项目概览</span><span>发行进度</span><span>待办事项</span></div>{steps.slice(0, 4).map(([name], i) => <div className="process-preview-row" key={name}><i>{String(i + 1).padStart(2, '0')}</i><span>{name}</span><b /></div>)}<small>界面示意 · 无真实客户或金融数据</small></div></div>;
}

export function Solutions() {
  return <main>
    <section className="page-hero solutions-hero"><div className="network-grid" /><div className="container page-hero-inner"><div><span className="eyebrow">SOLUTIONS / 解决方案</span><h1>先从发行机构的业务场景出发，<br /><em>选择合适的合作路径</em></h1><p>当前优先服务资产管理机构与发行企业。白标运营和API合作属于后续拓展方向，开放范围将另行确认。</p></div><div className="solutions-hero-visual"><div className="s-visual-title">两类客户路径 <span>Sandbox示意</span></div><div className="s-visual-overview"><div><b>持续管理</b><i /><i /></div><div><b>首次发行</b><i /><i /></div></div><div className="s-visual-flow"><span>资产</span><em>→</em><span>项目</span><em>→</em><span>发行方案</span><em>→</em><span>运营</span></div><small>界面示意 · 不代表真实业务进度</small></div></div></section>
    <section className="section solution-selector"><div className="container"><SectionHeading eyebrow="CHOOSE YOUR PATH / 客户场景" title="当前优先：发行机构" description="资产管理机构与发行企业都使用Issuer SaaS，但日常管理重点不同。" /><div className="selector-grid"><a href="#asset-manager"><span className="eyebrow">01 / 资产管理机构</span><div className="selector-icon">▰</div><h3>持续管理多个资产与项目</h3><p>把并行项目、团队待办和发行后义务放在同一个工作空间。</p><strong>查看管理路径 ↗</strong></a><a href="#issuer"><span className="eyebrow">02 / 发行企业</span><div className="selector-icon">▤</div><h3>从首个发行方案建立流程</h3><p>依次完成资产准备、发行配置、投资者入口和后续管理。</p><strong>查看发行路径 ↗</strong></a></div></div></section>
    <section className="section solution-detail" id="asset-manager"><div className="container"><div className="solution-intro"><span className="eyebrow">SOLUTION 01 / ASSET MANAGERS</span><h2>多资产并行时，<br />让项目与责任保持清晰</h2><div><p>资产管理机构往往同时推进不同资产、项目和发行轮次。资料版本、团队待办和存续义务需要按项目持续追踪。</p><p>在同一企业工作台中组织这些关系，减少跨项目查找与重复录入。</p></div></div><ProblemAndAnswer problems={managerProblems} answers={managerAnswers} /><ProcessPanel title="多资产持续管理路径" steps={managerSteps} preview="多项目工作空间" /></div></section>
    <section className="section solution-detail alternate" id="issuer"><div className="container"><div className="solution-intro"><span className="eyebrow">SOLUTION 02 / 发行机构</span><h2>从首个发行方案开始，<br />逐步建立发行管理流程</h2><div><p>发行企业需要衔接资产和法律资料、发行参数、Token配置、投资者准入及后续交付。</p><p>工作台把各阶段状态分开记录，便于团队识别下一步所需的审核与授权。</p></div></div><ProcessPanel title="一次发行的管理路径" steps={issuerSteps} preview="发行项目工作空间" /><div className="marketplace-channel-inline"><span className="eyebrow">OPTIONAL CHANNEL / 可选展示渠道</span><h3>两类投资者入口各有边界</h3><p>机构独立投资者门户服务本机构投资者。发行机构可按发行方案申请WDEX投资者平台展示；渠道上架、法域和投资者资格需单独审核，不随Standard订阅自动获得。</p><p className="marketplace-inline-status">{marketplaceIsOpen ? 'WDEX投资者平台仅在获批范围开放。' : 'WDEX投资者平台筹备中，目前无真实上架或认购入口。'}</p><a href={paths.investorPlatform}>查看投资者平台开放状态 ↗</a></div></div></section>
    <section className="section solution-selector future-collaboration"><div className="container"><SectionHeading eyebrow="FUTURE COLLABORATION / 后续合作方向" title="白标与API合作方向" description="以下方向仍需单独确定产品范围、交付条件和开放时间，不代表当前已提供完整服务。" /><div className="answer-grid"><article><span className="answer-symbol">◇</span><h4>白标运营商</h4><p>适合希望以自身品牌服务投资者的合作方。具体品牌配置、运营边界与交付范围需另行评估，当前不承诺完整白标平台已开放。</p></article><article><span className="answer-symbol">▤</span><h4>API客户</h4><p>适合需要将发行管理能力接入既有系统的机构。接口范围、权限、安全要求和服务等级尚未公布，当前不提供可调用的生产API承诺。</p></article></div></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
