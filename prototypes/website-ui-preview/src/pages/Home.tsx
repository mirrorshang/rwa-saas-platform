import { Button, DemoNotice, SectionHeading, canUseLocalDemo, demoRoute } from '../site';
import { marketplaceIsOpen, marketplaceLink, paths } from '../config';

const capabilities = [
  { no: '01', icon: '▰', title: '多资产管理', body: '为不同资产建立清晰档案，关联权益结构与法律文件。', anchor: 'assets' },
  { no: '02', icon: '▤', title: '发行项目与发行方案', body: '让不同发行项目和方案各有清晰进度。', anchor: 'issuance' },
  { no: '03', icon: '⬡', title: 'Token管理', body: '将Token方案与业务记录关联；真实操作另需授权。', anchor: 'token' },
  { no: '04', icon: '◇', title: '机构独立投资者门户', body: '为本机构投资者提供独立入口和获授权的发行方案展示。', anchor: 'portal' },
  { no: '05', icon: '▣', title: '认购与资金记录', body: '让投资者参与及发行交付的各阶段可分别核对。', anchor: 'subscription' },
  { no: '06', icon: '◫', title: '发行后运营', body: '持续关注持有人权益与发行后的履约事项。', anchor: 'lifecycle' },
];

const steps = [
  ['01', '建立企业工作空间', '从Free Sandbox熟悉企业工作台与角色权限。', '企业设置'],
  ['02', '准备资产与权益结构', '整理资产、权益结构及法律文件。', '资产档案'],
  ['03', '创建发行项目', '按项目准备发行方案，并识别发布前需要满足的条件。', '发行项目'],
  ['04', '管理投资者认购', '让团队分清投资者准入、认购和发行交付的进度。', '投资者认购'],
  ['05', '开展发行后管理', '按时跟进持有人权益、收益和存续义务。', '发行后运营'],
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

export function Home() {
  return <main>
    <section className="hero-section"><div className="network-grid" /><div className="hero-halo" /><div className="container hero-inner">
      <div className="hero-copy"><div className="eyebrow-pill">面向发行机构的多资产RWA发行管理平台</div><h1>让资产、发行与投资者管理<br /><em>在一个工作台衔接</em></h1><p>WDEX SaaS帮助资产管理机构与发行企业管理多种资产和权益结构，组织发行项目、投资者认购与发行后事务。</p><div className="button-row">{canUseLocalDemo() ? <Button href={demoRoute(paths.login + '?intent=free')}>免费开始 · Free Sandbox</Button> : <span className="button button-primary" aria-disabled="true">Free开通暂未开放</span>}<Button variant="outline" href={paths.features}>探索产品功能</Button></div><div className="hero-note"><span className="note-line" />Free为永久免费的Sandbox；真实发行、资金与Token操作须满足独立的法律及生产条件。</div></div>
      <div className="hero-product"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><DashboardMock /></div>
    </div></section>
    <section className="section capabilities-section"><div className="container"><SectionHeading eyebrow="CAPABILITIES / 核心能力" title="六项能力，贯穿发行管理" description="先了解平台能够解决哪些管理问题，再到产品功能页查看具体能力。" /><div className="capabilities-grid">{capabilities.map(item => <a className="capability-card" href={paths.features + '#' + item.anchor} key={item.no}><div className="cap-top"><span>{item.no} / 06</span><span className="cap-icon">{item.icon}</span></div><h3>{item.title}</h3><p>{item.body}</p><span className="card-more">了解能力　↗</span></a>)}</div></div></section>
    <section className="section marketplace-section" aria-labelledby="marketplace-title"><div className="container"><div className="marketplace-layout"><div><span className="eyebrow">INVESTOR ACCESS / 投资者入口</span><h2 id="marketplace-title">机构投资者门户独立运营，<br />平台渠道按需申请</h2><p>机构独立投资者门户服务发行机构自己的投资者。规划中的WDEX投资者平台支持发行机构按发行方案申请展示，仍须单独审核法域、受众与资格条件。</p><a className="marketplace-text-link" href={marketplaceLink}>{marketplaceIsOpen ? '查看投资者平台 ↗' : '了解投资者平台开放状态 ↗'}</a></div><div className="marketplace-channel-grid"><article><span>机构独立投资者门户</span><strong>管理机构自己的投资者入口</strong><p>展示获授权的发行信息，保留发行机构的独立服务关系。</p></article><article><span>WDEX投资者平台 <em>{marketplaceIsOpen ? '已开放' : '筹备中'}</em></span><strong>发行方案可选展示渠道</strong><p>申请需独立审核；Standard订阅不自动赋予上架资格。</p></article></div></div></div></section>
    <section className="section workflow-section"><div className="container"><SectionHeading eyebrow="WORKFLOW / 业务路径" title="从资产准备到发行后管理" description="五个环节帮助企业理解工作流；Sandbox演示不产生真实资金或法定权益。" /><div className="workflow-list">{steps.map(([no, title, body, label], index) => <div className="workflow-item" key={no}><div className="workflow-num">{no}</div><div className="workflow-text"><h3>{title}</h3><p>{body}</p></div><StepVisual index={index} label={label} /></div>)}</div></div></section>
    <section className="section audiences-section"><div className="container"><SectionHeading center eyebrow="FOR INSTITUTIONS / 目标客户" title="专为持续开展资产发行的机构设计" /><div className="audience-grid"><article className="audience-card"><div className="audience-scene architecture"><div className="building one" /><div className="building two" /><div className="building three" /></div><div className="audience-content"><span className="eyebrow">资产管理机构</span><h3>多资产、多项目统一管理</h3><p>适合长期并行管理多个资产和发行项目、需要持续跟进团队责任与发行后义务的机构。</p><div className="pills"><span>多资产管理</span><span>多项目发行</span><span>投资者及存续管理</span></div><Button variant="outline" href={paths.solutions + '#asset-manager'}>查看解决方案</Button></div></article><article className="audience-card"><div className="audience-scene energy"><div className="energy-line" /><div className="energy-circle" /><div className="energy-bars"><i /><i /><i /><i /></div></div><div className="audience-content"><span className="eyebrow">发行企业与项目方</span><h3>从发行准备到持续运营</h3><p>适合从首个发行方案起建立协作流程，并逐步承担投资者服务与发行后管理的企业。</p><div className="pills"><span>发行流程管理</span><span>独立投资者门户</span><span>发行后管理</span></div><Button variant="outline" href={paths.solutions + '#issuer'}>查看解决方案</Button></div></article></div></div></section>
    <section className="final-cta home-next"><div className="container final-cta-inner"><div><span className="eyebrow">NEXT STEP / 下一步</span><h2>选择适合当前阶段的<br />使用方案</h2><p>Free提供永久免费的Sandbox体验；Standard商业价格待公布，真实业务另需满足独立条件。</p><div className="button-row"><Button href={paths.pricing}>比较订阅方案</Button></div></div><div className="cta-diagram" aria-hidden="true"><span className="node n1">资产</span><span className="node n2">项目</span><span className="node n3">投资者</span><span className="node n4">运营</span></div></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
