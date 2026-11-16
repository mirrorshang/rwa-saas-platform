import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { getKybRecord } from '../issuerKybFlow';
import { ensureSharedNoticeHistory, markSharedNoticeRead, readSharedNotices, readSharedWork } from '../issuerSharedWorkV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';
import '../issuerSharedWorkV1.scss';

type View = 'tasks' | 'issues' | 'notifications' | 'service';
const title = { tasks: '我的待办', issues: '异常工单', notifications: '消息通知', service: '安全与服务状态' };
const stateLabel = { pending: '待处理', waiting: '等待外部处理', unknown: '待核实', done: '已完成' };
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at: number) => at ? new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）' : '时间待核';

export function IssuerSharedWorkV1({ tenant, query, view }: { tenant: DemoTenant; query: string; view: View }) {
  const work = readSharedWork(tenant);
  const notices = readSharedNotices(tenant);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [, rerender] = useState(0);
  useEffect(() => { if (view === 'notifications' && ensureSharedNoticeHistory(tenant)) rerender(value => value + 1); },
    [tenant.id, tenant.plan, view]);
  const kyb = getKybRecord(tenant);
  const rows = view === 'tasks' ? work?.tasks || [] : view === 'issues' ? work?.issues || [] : notices || [];
  const selected = rows.find(item => item.id === selectedId);
  const shown = rows.filter(item =>
    (view !== 'tasks' || tab === 'all' || tab === 'pending' && ['pending', 'unknown'].includes(item.state) ||
      tab === 'waiting' && item.state === 'waiting' || tab === 'done' && item.state === 'done') &&
    (view !== 'notifications' || tab === 'pending' && !('read' in item && item.read) || tab !== 'pending') &&
    (!module || item.module === module) &&
    (!search || `${item.title} ${item.id} ${item.sourceId}`.toLowerCase().includes(search.toLowerCase())));
  const markRead = (ids: string[]) => {
    try { markSharedNoticeRead(tenant, ids); rerender(value => value + 1); setFeedback('阅读状态已更新；原业务状态不受影响。'); }
    catch (cause) { setFeedback(cause instanceof Error ? cause.message : '阅读状态未保存。'); }
  };
  if (view === 'service') return <section className="asset-page issuer-investors issuer-funds issuer-shared-work"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / {title[view]}</nav><h1>{title[view]}</h1><p>查看当前企业访问状态与可核验的服务来源。</p></header><section className="issuer-card investor-panel"><h2>当前企业状态</h2><dl className="investor-facts"><div><dt>企业</dt><dd>{tenant.name}</dd></div><div><dt>当前套餐</dt><dd>{tenant.plan}</dd></div><div><dt>企业认证资料</dt><dd>{kyb.status === 'passed' ? '已通过' : kyb.status === 'reviewing' ? '审核中' : kyb.status === 'supplement' ? '待补件' : kyb.status === 'rejected' ? '未通过' : kyb.status === 'submitted' ? '已提交' : '草稿'}</dd></div><div><dt>外部服务健康</dt><dd>权威来源未接入</dd></div></dl><p>页面显示的企业认证状态来自当前本地业务资料，不代表外部服务连接健康或生产授权。</p></section><section className="issuer-card investor-empty"><h2>暂无可核验的外部服务告警</h2><p>当前未接入经授权的服务健康、投递回执或生产安全告警来源。业务结果仍以原模块和有权服务回执为准。</p><div className="c08-actions"><a href={link('/issuer/external-services', query)}>查看外部服务</a><a href={link('/issuer/issues', query)}>查看异常来源</a></div></section></section>;
  return <section className="asset-page issuer-investors issuer-funds issuer-shared-work"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / {title[view]}</nav><h1>{title[view]}</h1><p>{view === 'tasks' ? '待办从原业务状态汇总，处理请返回来源页面。' : view === 'issues' ? '集中查看资金、配售及登记异常；原业务事实由责任模块核对。' : '当前企业的站内业务提醒；阅读状态不代表业务完成或法律送达。'}</p></header>
    {(!work || view === 'notifications' && !notices) && <div className="asset-warning" role="alert">当前来源暂不可读取；已有本地记录未被清除。</div>}
    <div className="investor-fixture">{view === 'notifications' ? '当前仅显示站内业务提醒，未发送邮件或形成法律送达记录。' : view === 'issues' ? '当前显示原业务异常来源；没有正式工单服务时，不生成工单编号或调查完成结果。' : '当前待办按已保存的资料与异常来源汇总，不设置虚构截止日期。'}</div>
    <div className="issuer-shared-summary"><div className="issuer-card"><strong>{view === 'tasks' ? '待处理' : view === 'issues' ? '待核异常' : '未读提醒'}</strong><span>{view === 'tasks' ? rows.filter(item => item.state === 'pending' || item.state === 'unknown').length : view === 'issues' ? rows.length : (notices || []).filter(item => !item.read).length}</span></div><div className="issuer-card"><strong>{view === 'tasks' ? '等待外部' : view === 'issues' ? '状态未知' : '全部提醒'}</strong><span>{view === 'tasks' ? rows.filter(item => item.state === 'waiting').length : view === 'issues' ? rows.filter(item => item.state === 'unknown').length : rows.length}</span></div></div>
    {view !== 'issues' && <nav className="issuer-funds-tabs" aria-label={`${title[view]}筛选`}>{(view === 'tasks' ? [['pending', '待处理'], ['waiting', '我发起的'], ['done', '已完成'], ['all', '全部']] : [['pending', '未读'], ['all', '全部']]).map(([id, label]) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>}
    <section className="issuer-card investor-filters"><label>搜索事项<input value={search} onChange={event => setSearch(event.target.value)} placeholder="标题、来源编号" /></label><label>来源模块<select value={module} onChange={event => setModule(event.target.value)}><option value="">全部模块</option>{[...new Set(rows.map(item => item.module))].map(item => <option key={item} value={item}>{item}</option>)}</select></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setModule(''); setTab('pending'); }}>重置筛选</button>{view === 'notifications' && <button type="button" className="issuer-secondary" disabled={!notices?.some(item => !item.read)} onClick={() => markRead((notices || []).filter(item => !item.read).map(item => item.id))}>全部标记已读</button>}</section>
    {feedback && <p className="issuer-feedback" role="status">{feedback}</p>}
    <div className="issuer-shared-layout"><section className="issuer-card investor-table-wrap"><h2>{view === 'issues' ? '异常来源' : view === 'tasks' ? '业务事项' : '站内提醒'}</h2>{shown.length ? <div className="funds-list">{shown.map(item => <article key={item.id}><strong>{item.title}</strong><span>{item.module} · {item.kind}</span><span>{stateLabel[item.state]}</span><span>{when(item.updatedAt)}</span>{view === 'notifications' && <span>{'read' in item && item.read ? '已读' : '未读'}</span>}<button type="button" className="issuer-secondary" onClick={() => { setSelectedId(item.id); if (view === 'notifications' && 'read' in item && !item.read) markRead([item.id]); }}>查看详情</button></article>)}</div> : <p>{rows.length ? '没有符合条件的事项，请调整筛选。' : view === 'tasks' ? '当前没有需要处理的事项。' : view === 'issues' ? '当前没有可查看的异常来源。' : '当前没有消息。'}</p>}</section>
      {selected && <aside className="issuer-card investor-panel issuer-shared-detail" aria-label="事项详情"><div className="issuer-shared-detail-head"><h2>{selected.title}</h2><button type="button" className="issuer-secondary" onClick={() => setSelectedId('')}>关闭</button></div><dl className="investor-facts"><div><dt>来源编号</dt><dd>{selected.id}</dd></div><div><dt>来源模块</dt><dd>{selected.module}</dd></div><div><dt>当前状态</dt><dd>{stateLabel[selected.state]}</dd></div><div><dt>最近更新</dt><dd>{when(selected.updatedAt)}</dd></div><div><dt>截止时间</dt><dd>未设置明确截止日期</dd></div></dl><p>{selected.detail}</p><p>下一步：{selected.nextStep}</p><a href={link(selected.path, query)}>前往原业务页面 →</a></aside>}</div>
  </section>;
}
