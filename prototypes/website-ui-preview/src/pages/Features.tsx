import { useEffect, useState } from 'react';
import { Button, DemoNotice, SectionHeading } from '../site';
import { paths } from '../config';

type Feature = {
  id: string;
  nav: string;
  label: string;
  title: string;
  body: string;
  points: [string, string][];
  preview: string[];
  note?: string;
  cta: string;
};

const features: Feature[] = [
  {
    id: 'assets', nav: '资产管理', label: 'ASSET MANAGEMENT',
    title: '一个工作台，统一管理不同类别资产',
    body: '将底层资产、金融权利工具及相关法律资料进行统一管理。支持多个资产和项目并行开展业务，帮助发行机构建立清晰、可追踪的资产信息体系。',
    points: [
      ['资产建档与分类', '为不同类别资产建立独立档案，记录资产基础信息、所属主体及相关证明资料。'],
      ['金融权利工具管理', '管理与资产相关的债权、股权或其他适用权利工具，将底层资产与投资者依法取得的权利区分管理。'],
      ['资料与版本管理', '关联权属证明、法律文件、评估资料等，跟踪文件版本、审核及补件状态。'],
    ], preview: ['资产库', '资产类别', '关联项目', '资料状态'], cta: '免费体验资产管理',
  },
  {
    id: 'issuance', nav: '项目与发行', label: 'ISSUANCE MANAGEMENT',
    title: '从发行项目创建到发行轮次发布，统一组织整个流程',
    body: '以项目为业务管理中心，支持不同项目和多个发行轮次。集中配置发行参数、投资者范围、业务文件与发行状态，帮助机构有序完成发行准备和后续管理。',
    points: [
      ['多项目与多轮发行', '在同一家企业工作台中管理多个项目，每个发行轮次关联明确的发行项目。'],
      ['发行参数配置', '管理发行规模、价格、发行窗口、认购资格及适用的Token相关参数。'],
      ['发行审核与状态跟踪', '通过发行前检查了解必要条件和缺失事项，由有权人员执行受控发布、暂停与结束。'],
    ], preview: ['项目工作空间', '发行轮次轮次', '发行前检查', '状态跟踪'], cta: '免费体验发行管理',
  },
  {
    id: 'token', nav: 'Token管理', label: 'TOKEN MANAGEMENT',
    title: '连接发行管理与链上Token操作',
    body: '根据资产对应金融工具的要求配置Token方案，管理受权合约操作与链上记录，并保持Token状态与业务权利记录之间的关联和可追溯性。',
    points: [
      ['Token与合约配置', '管理网络、Token方案、合约参数及适用的发行配置。'],
      ['受权链上操作', '按业务授权及安全条件执行适用的部署、铸造、冻结、赎回或销毁等操作。'],
      ['链上记录与对账', '查询交易提交、确认与异常情况，关联合法配售、权利登记和Token交付记录。'],
    ], preview: ['Token方案', '合约配置', '操作审批', '链上记录'], note: '链上Token记录不自动等同于法定权利登记或合法交割完成。', cta: '体验Token管理',
  },
  {
    id: 'portal', nav: '投资者门户', label: 'INVESTOR PORTAL',
    title: '为发行机构建立独立的投资者访问入口',
    body: '为每一家发行机构提供独立投资者门户。企业可以管理基础品牌信息、必要法律链接及获授权展示的发行项目，投资者通过对应机构门户开展后续业务。',
    points: [
      ['机构专属门户', '配置独立门户入口、机构名称、Logo及必要法律信息。'],
      ['发行轮次展示管理', '控制可以面向相应投资者展示的发行信息，支持预览、发布与暂停。'],
      ['投资者自助服务', '投资者可以在授权范围内浏览发行项目、完成认购流程，并查看订单、持仓和收益信息。'],
    ], preview: ['企业端基础设置', '授权展示策略', '门户预览', '投资者访问入口'], note: '高级白标域名与完整可视化编辑器不在当前方案范围内。', cta: '免费体验投资者门户',
  },
  {
    id: 'subscription', nav: '投资者与认购', label: 'INVESTOR & SUBSCRIPTION',
    title: '从投资者准入到认购交付，全流程可追踪',
    body: '统一管理投资者身份、发行资格、认购订单与配售登记。将投资者申请、资金确认、法定权益登记和Token交付等业务阶段清晰区分。',
    points: [
      ['投资者身份与资格管理', '支持自然人和机构投资者资料管理、KYC/KYB以及具体发行轮次资格审核。'],
      ['认购订单管理', '管理报价确认、法律文件签署、认购订单、额度预留和订单状态。'],
      ['配售与持有人管理', '跟踪配售决策、持有人登记及Token交付，支持必要的异常处理。'],
    ], preview: ['投资者管理', '资格审核', '认购订单', '配售进度'], note: '订单提交或付款发起并不代表配售完成或投资者已经依法取得权利。', cta: '体验认购管理',
  },
  {
    id: 'funds', nav: '资金与结算', label: 'FUNDS & SETTLEMENT',
    title: '清晰跟踪认购资金、对账与结算进度',
    body: '连接认购订单与合法资金执行记录，支持付款状态追踪、到账匹配、异常退款以及募集款结算管理，让发行机构及时了解业务资金进度。',
    points: [
      ['付款跟踪与对账', '查看认购应付金额、付款观察结果、链上确认及真实到账匹配状态。'],
      ['退款与异常处理', '对不足额、多付、错误网络、迟到账等异常情况进行受控记录、审核与处理。'],
      ['募集款结算管理', '查询已收、受限和可结算金额，按权限提交合法划拨申请并跟踪执行结果。'],
    ], preview: ['付款观察', '对账摘要', '异常处理', '结算申请'], note: 'SaaS系统提供受权管理与记录能力，不默认直接持有或控制投资者资金。', cta: '了解资金管理流程',
  },
  {
    id: 'lifecycle', nav: '发行后管理', label: 'POST-ISSUANCE',
    title: '发行完成后，持续管理权益、收益与存续事项',
    body: '发行不仅是Token交付。平台帮助发行机构跟踪存续期间的持有人权益、收益事件、信息披露、到期履约与合法退出流程。',
    points: [
      ['存续事项管理', '按适用工具记录重要事项、义务主体、披露及到期安排。'],
      ['收益与分配管理', '管理合法记录日、权益快照、应付计算、分配审核及实际支付结果。'],
      ['到期与退出管理', '跟踪本金清偿、适用的回购或赎回、权利登记变化及Token处置。'],
    ], preview: ['存续事项', '收益批次', '披露安排', '到期履约'], note: '实际收益、清偿及退出条件取决于对应金融工具及有效法律文件，不代表平台保证收益或回购。', cta: '体验发行后管理',
  },
];

function FeaturePreview({ item, index }: { item: Feature; index: number }) {
  return <div className={`feature-preview feature-preview-${index + 1}`} aria-label={item.nav + '界面示意'}>
    <div className="feature-preview-top"><span className="brand-mini">WDEX SaaS</span><span>界面示意</span></div>
    <div className="feature-preview-inner"><div className="preview-sidebar"><i /><i /><i /><i /></div><div className="preview-content"><div className="preview-title"><span>{item.preview[0]}</span><small>Sandbox示例</small></div>
      {index === 0 && <div className="product-preview asset-preview"><div className="preview-table-head"><span>资产档案</span><span>关联项目</span><span>资料状态</span></div>{['资产信息', '权利工具', '法律资料'].map((label, i) => <div className="preview-table-row" key={label}><strong>{label}</strong><span>{i === 0 ? '项目关联' : '待关联'}</span><em>{i === 2 ? '待核对' : '已建档'}</em></div>)}</div>}
      {index === 1 && <div className="product-preview issuance-preview"><div className="preview-flow-row">{['项目准备', '发行配置', '条件检查', '授权发布'].map((label, i) => <div key={label}><b>0{i + 1}</b><strong>{label}</strong></div>)}</div><div className="preview-checklist"><span>发行前检查</span><i /><i /><i /></div></div>}
      {index === 2 && <div className="product-preview token-preview"><div className="preview-token-core">Token方案</div><div className="preview-token-links">{['合约配置', '操作审批', '链上记录'].map(label => <span key={label}>{label}</span>)}</div><p>业务记录与链上状态关联查看</p></div>}
      {index === 3 && <div className="product-preview portal-preview"><div className="preview-portal-header"><span>机构门户</span><small>授权展示</small></div><div className="preview-portal-hero"><strong>发行项目展示区</strong><span>品牌信息 · 法律链接 · 访问入口</span></div><div className="preview-portal-cards"><i /><i /></div></div>}
      {index === 4 && <div className="product-preview subscription-preview">{['投资者准入', '认购申请', '配售与登记'].map((label, i) => <div key={label}><span>0{i + 1}</span><strong>{label}</strong><small>状态独立跟踪</small></div>)}</div>}
      {index === 5 && <div className="product-preview funds-preview"><div className="preview-table-head"><span>认购订单</span><span>付款核验</span><span>结算状态</span></div>{['订单关联', '到账匹配', '异常处理'].map(label => <div className="preview-table-row" key={label}><strong>{label}</strong><span>独立记录</span><em>待核实</em></div>)}<p>此处不显示真实资金或支付数据</p></div>}
      {index === 6 && <div className="product-preview lifecycle-preview">{['存续事项', '信息披露', '收益安排', '到期履约'].map((label, i) => <div key={label}><b>0{i + 1}</b><span>{label}</span><i /></div>)}</div>}
    </div></div>
    <div className="preview-corner">0{index + 1} / 07</div>
  </div>;
}

export function Features() {
  const [active, setActive] = useState(() => location.hash.replace('#', '') || 'assets');
  useEffect(() => {
    const updateActive = () => {
      const sections = [...document.querySelectorAll<HTMLElement>('[data-feature-section]')];
      const current = sections.filter(el => el.getBoundingClientRect().top <= 180).at(-1);
      setActive(current?.id || 'assets');
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    updateActive();
    return () => window.removeEventListener('scroll', updateActive);
  }, []);
  return <main>
    <section className="page-hero features-hero"><div className="network-grid" /><div className="container page-hero-inner"><div><span className="eyebrow">PRODUCT CAPABILITIES / 产品功能</span><h1>覆盖资产发行全流程的<br /><em>SaaS管理平台</em></h1><p>从资产资料准备、发行项目配置到投资者认购、Token管理和发行后运营，将不同业务环节连接在统一工作台中。</p><div className="button-row"><Button href={paths.pricing}>查看Free方案</Button><Button variant="outline" href="#assets">浏览产品能力</Button></div><div className="hero-note"><span className="note-line" />永久免费的Free提供Sandbox流程体验。真实金融业务须满足适用的法律、授权与生产条件。</div></div><div className="feature-hero-visual"><div className="fhero-center">WDEX<br />SaaS</div>{['资产','发行','Token','门户','认购','资金','存续'].map((v, i) => <span className={`fhero-node fhero-node-${i}`} key={v}>{v}</span>)}</div></div></section>
    <nav className="feature-jump" aria-label="功能分类"><div className="container">{features.map(item => <a className={active === item.id ? 'active' : ''} href={'#' + item.id} key={item.id} onClick={() => setActive(item.id)}>{item.nav}</a>)}</div></nav>
    <div className="features-content">{features.map((item, index) => <section className={`feature-detail ${index % 2 ? 'alternate' : ''}`} id={item.id} data-feature-section key={item.id}><div className="container feature-detail-inner"><div className="feature-detail-copy"><span className="eyebrow">{item.label}</span><span className="feature-count">0{index + 1} / 07</span><h2>{item.title}</h2><p className="feature-lead">{item.body}</p><div className="feature-points">{item.points.map(([title, body]) => <div key={title}><span className="point-mark">✓</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div>{item.note && <div className="feature-note">{item.note}</div>}<Button href={paths.pricing}>查看相关套餐</Button></div><FeaturePreview item={item} index={index} /></div></section>)}</div>
    <section className="section sandbox-section"><div className="container"><SectionHeading center eyebrow="SANDBOX TO PRODUCTION / 环境边界" title="先在Sandbox探索，再按实际业务条件启用" /><div className="sandbox-grid"><div><span className="eyebrow">01 / 模拟体验</span><h3>Free Sandbox</h3><p>可模拟体验主要资产发行、认购、Token及收益流程，不产生真实投资者资金或法定权益。</p></div><div><span className="eyebrow">02 / 商业授权</span><h3>Standard</h3><p>提供付费商业授权。具体发行机构及发行项目仍须满足适用的法律、业务、资金执行与安全条件，才可开展获授权的真实操作。</p></div></div><div className="section-action"><Button variant="outline" href={paths.pricing}>查看套餐详情</Button></div></div></section>
    <section className="final-cta features-cta"><div className="container final-cta-inner"><div><span className="eyebrow">GET STARTED</span><h2>开始体验完整的<br />资产发行管理流程</h2><p>免费创建企业工作台，探索从资产管理到发行后运营的主要SaaS功能。</p><div className="button-row"><Button href={paths.pricing}>了解Free方案</Button><Button variant="outline" href={paths.pricing}>查看Standard方案</Button></div></div><div className="feature-cta-symbol">◎<span>多资产 · 多项目 · 多轮发行</span></div></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
