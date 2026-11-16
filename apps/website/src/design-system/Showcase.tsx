import { useState } from 'react';
import { DsAlert, DsBadge, DsBreadcrumb, DsButton, DsCard, DsDialog, DsDrawer, DsEmpty, DsError, DsField, DsLoading, DsMetric, DsPagination, DsSelect, DsSidebar, DsTable, DsTopbar } from './components';
import './showcase.css';

const items = ['工作台首页', '资产与发行', '投资者门户', '投资者与认购', '资金与结算', 'Token 管理', '收益与分配', '数据与报表', '企业管理'].map(label => ({ label }));
const records = [
  { name: '浦东写字楼 A', type: '写字楼', state: '资料就绪', tone: 'success' as const, date: '2026-11-12' },
  { name: '虹桥物流园', type: '工业园 / 仓储', state: '待补充', tone: 'warning' as const, date: '2026-11-10' },
  { name: '滨江住宅 B', type: '住宅', state: '草稿', tone: 'neutral' as const, date: '2026-11-08' },
];
export function Showcase() {
  const [menu, setMenu] = useState(false);
  const [activeNav, setActiveNav] = useState('资产与发行');
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const [activeButton, setActiveButton] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<'empty' | 'loading' | 'error'>('empty');
  const visible = records.filter(item => item.name.includes(query) && (filter === 'all' || item.state === filter));
  return <div className="ds ds-showcase">
    <DsSidebar open={menu} onClose={() => setMenu(false)} active={activeNav} onSelect={setActiveNav} items={items} />
    <div className="ds-showcase-main"><DsTopbar onMenu={() => setMenu(true)} onNotify={() => setToast('暂无新通知。')} />
      <div className="ds-showcase-content">
        <DsBreadcrumb items={[{ label: 'Issuer SaaS', href: '/' }, { label: 'Design System' }]} />
        <div className="ds-page-heading"><div><span className="ds-kicker">WDEX / ISSUER UI</span><h1>Design System</h1><p>沿用 WDEX 品牌识别，面向 Issuer 工作台的浅色金融 SaaS 组件与状态。此页仅作视觉和交互展示。</p></div><DsBadge tone="info">V1 · 第一阶段</DsBadge></div>
        {toast && <div className="ds-toast" role="status">{toast}<button type="button" aria-label="关闭通知" onClick={() => setToast('')}>×</button></div>}
        <section className="ds-section"><div className="ds-section-head"><span>01 / Foundations</span><h2>设计变量</h2></div><div className="ds-token-grid">{[['品牌色', '#087A9B'], ['背景色', '#F3F7F9'], ['文字色', '#123047'], ['成功色', '#16765B'], ['警示色', '#A5620C'], ['错误色', '#B44242']].map(([label, value]) => <div className="ds-token" key={label}><span style={{ background: value }} /><strong>{label}</strong><small>{value}</small></div>)}</div><p className="ds-caption">字体：系统中文无衬线 · 页面标题 28 / 模块标题 19 / 正文及表格 14 / 辅助说明 12px · 控件高度 44px · 间距 4 / 8 / 12 / 16 / 24 / 32 · 圆角 7 / 10 / 16 · 断点 600 / 900px</p></section>
        <section className="ds-section"><div className="ds-section-head"><span>02 / Actions</span><h2>按钮与反馈</h2></div><DsCard><div className="ds-row"><DsButton onClick={() => setToast('主要操作已点击。')}>主要按钮</DsButton><DsButton variant="secondary" onClick={() => setToast('次要操作已点击。')}>次要按钮</DsButton><DsButton variant="quiet">文字按钮</DsButton><DsButton variant="secondary" aria-pressed={activeButton} onClick={() => setActiveButton(value => !value)}>{activeButton ? '已选中' : '点击查看选中态'}</DsButton><DsButton variant="danger" onClick={() => setConfirm(true)}>危险操作</DsButton><DsButton disabled>禁用状态</DsButton><DsButton loading>处理中</DsButton></div></DsCard></section>
        <section className="ds-section"><div className="ds-section-head"><span>03 / Forms</span><h2>表单控件</h2></div><DsCard><div className="ds-form-grid"><DsField label="资产名称" placeholder="输入资产名称" hint="建议使用便于识别的业务名称" /><DsField label="错误示例" defaultValue="未完成" error="请输入完整名称" /><DsSelect label="资产类型" defaultValue="office"><option value="office">写字楼</option><option value="residential">住宅</option></DsSelect><DsField label="目标日期" type="date" defaultValue="2026-11-12" /><DsField label="禁用字段" value="只读演示" disabled readOnly /></div></DsCard></section>
        <section className="ds-section"><div className="ds-section-head"><span>04 / Data</span><h2>表格、筛选与分页</h2></div><DsCard title="资产列表示例" actions={<DsBadge tone="info">{visible.length} 条</DsBadge>}><div className="ds-filterbar"><DsField label="搜索资产" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="名称关键字" /><DsSelect label="状态筛选" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="all">全部</option><option value="资料就绪">资料就绪</option><option value="待补充">待补充</option><option value="草稿">草稿</option></DsSelect></div>{visible.length ? <DsTable headings={['资产名称', '类型', '状态', '更新时间']} rows={visible.slice((page - 1) * 2, page * 2).map(item => [item.name, item.type, <DsBadge tone={item.tone}>{item.state}</DsBadge>, item.date])} /> : <DsEmpty title="无匹配结果" detail="请调整搜索词或筛选条件。" action={<DsButton variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>清除筛选</DsButton>} />}<DsPagination page={page} pages={Math.max(1, Math.ceil(visible.length / 2))} onChange={setPage} /></DsCard></section>
        <section className="ds-section"><div className="ds-section-head"><span>05 / Status</span><h2>状态、提示与统计</h2></div><div className="ds-metric-grid"><DsMetric label="当前资产" value="12" delta="+2 本月" /><DsMetric label="待补充资料" value="3" delta="需关注" /><DsMetric label="已完成检查" value="9" delta="仅示例数据" /></div><div className="ds-alert-grid"><DsAlert title="操作已保存" tone="success">草稿保留在当前演示状态。</DsAlert><DsAlert title="需要检查" tone="warning">请确认必填资料。</DsAlert><DsAlert title="服务暂不可用" tone="danger">稍后重试或查看原记录。</DsAlert><DsAlert title="信息提示">此页面不触发真实业务操作。</DsAlert></div></section>
        <section className="ds-section"><div className="ds-section-head"><span>06 / Overlays</span><h2>弹窗、确认框与抽屉</h2></div><DsCard><div className="ds-row"><DsButton onClick={() => setDialog(true)}>打开弹窗</DsButton><DsButton variant="secondary" onClick={() => setConfirm(true)}>打开确认框</DsButton><DsButton variant="secondary" onClick={() => setDrawer(true)}>打开抽屉</DsButton></div></DsCard></section>
        <section className="ds-section"><div className="ds-section-head"><span>07 / System states</span><h2>空、加载、错误状态</h2></div><div className="ds-row"><DsButton variant="quiet" onClick={() => setState('empty')}>空状态</DsButton><DsButton variant="quiet" onClick={() => setState('loading')}>加载状态</DsButton><DsButton variant="quiet" onClick={() => setState('error')}>错误状态</DsButton></div>{state === 'empty' ? <DsEmpty title="暂无记录" detail="新增内容后将显示在此处。" /> : state === 'loading' ? <DsLoading /> : <DsError onRetry={() => { setState('loading'); window.setTimeout(() => setState('empty'), 700); }} />}</section>
      </div>
    </div>
    <DsDialog open={dialog} title="弹窗示例" onClose={() => setDialog(false)} onConfirm={() => setToast('弹窗已确认。')}>这里承载轻量信息或表单说明。</DsDialog>
    <DsDialog open={confirm} title="确认操作？" onClose={() => setConfirm(false)} onConfirm={() => setToast('已确认示例操作。')} confirmLabel="确认">此确认框不会修改业务数据。</DsDialog>
    <DsDrawer open={drawer} title="详情抽屉" onClose={() => setDrawer(false)}><p>抽屉适合展示摘要、筛选条件或辅助详情。</p><DsField label="备注" placeholder="输入演示内容" /></DsDrawer>
  </div>;
}
