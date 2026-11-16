import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { readPortfolio, latest } from '../issuerPortfolioV1';
import { readAllocationData } from '../issuerAllocationV1';
import { readOrders } from '../issuerOrdersV1';
import { ensureSandboxTokenPlan, readTokenData, saveTokenPlanDraft, tokenDeliveryCandidates, tokenPlanContext, tokenPlanIssues } from '../issuerTokenV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';
import { ensureSandboxFunds } from '../issuerFundsV1';
import '../portfolioV1.scss';
import '../issuerInvestorsV1.scss';
import '../issuerFundsV1.scss';
import '../issuerTokenV1.scss';

type Props = { tenant: DemoTenant; query: string; view: 'contracts' | 'operations' | 'chain'; detailId?: string };
const link = (path: string, query: string) => `${path}?${query}`;
const when = (at?: number) => at ? new Date(at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + '（北京时间）' : '待核对';
const kindLabel = { equity: '股权', debt: '债权', income: '收益参与权' };
const restrictionStateLabel = { submitted: '已提交待核', checking: '核对中', 'needs-info': '需补充资料', rejected: '未通过', unknown: '无法确认' };
const chainKindLabel = { deploy: '合约部署', mint: 'Token 交付', transfer: '转让', restrict: '限制', burn: '销毁' };
const chainFinalityLabel = { observed: '已观察', pending: '确认中', final: '最终确认', unknown: '状态未知', failed: '执行失败' };
const base = '/issuer/token-contracts';

function Contracts({ tenant, query, detailId }: Omit<Props, 'view'>) {
  const portfolio = readPortfolio(tenant);
  const data = readTokenData(tenant);
  const [assetId, setAssetId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new URLSearchParams(location.search).get('instrumentId') || '');
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [, rerender] = useState(0);
  const readOnly = tenant.subscriptionState === 'downgraded';
  const plan = data?.plans.find(item => item.id === detailId);
  const instrument = portfolio.instruments.find(item => item.id === (plan?.instrumentId || selected));
  const version = plan?.instrumentVersion || (instrument ? latest(instrument).number : 0);
  const context = instrument ? tokenPlanContext(tenant, instrument, version) : null;
  const current = instrument && data?.plans.find(item => item.instrumentId === instrument.id && item.instrumentVersion === version);
  const issues = instrument ? tokenPlanIssues(tenant, instrument, version) : [];
  const rows = (data?.plans || []).filter(item => {
    const fixed = portfolio.instruments.find(record => record.id === item.instrumentId);
    const asset = portfolio.assets.find(record => record.id === item.assetId);
    return (!assetId || item.assetId === assetId) && (!status || item.status === status) &&
      (!search || `${item.id} ${asset ? latest(asset).fields.name : ''} ${fixed ? latest(fixed).fields.name : ''}`.toLowerCase().includes(search.toLowerCase()));
  }).sort((a, b) => b.versions.at(-1)!.at - a.versions.at(-1)!.at);
  const pages = Math.max(1, Math.ceil(rows.length / 20));
  const save = () => {
    if (!instrument) { setFeedback('请先选择已就绪的权益结构。'); return; }
    try { const saved = saveTokenPlanDraft(tenant, instrument.id, version, note); rerender(value => value + 1);
      setEditing(false); setFeedback(`业务准备草稿已保存 · V${saved.versions.at(-1)?.number}。部署条件仍待核验。`);
    } catch (cause) { setFeedback(cause instanceof Error ? cause.message : '资料未保存。'); }
  };
  if (detailId && data && !plan) return <section className="asset-page issuer-funds"><h1>Token 方案不存在或无权访问</h1><a href={link(base, query)}>返回合约管理</a></section>;
  return <section className="asset-page issuer-investors issuer-funds issuer-token"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / Token 管理 / {detailId ? <a href={link(base, query)}>合约管理</a> : '合约管理'} {detailId && ` / ${plan?.id}`}</nav><h1>{detailId ? 'Token 方案详情' : '合约管理'}</h1><p>Token 份数和法律权益映射继承权益结构；合约部署须单独取得网络、模板与生产授权。</p></header>
    {!data && <div className="asset-warning" role="alert">Token 方案资料暂不可用。原本地记录已保留，请检查浏览器存储。</div>}
    <div className="investor-fixture">当前仅准备业务资料；没有已获准的生产 Token 网络、模板和执行主体，不生成真实合约或链上操作。</div>
    {!detailId && <><section className="issuer-card investor-filters"><label>搜索方案<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="资产、权益结构或方案编号" /></label><label>资产<select value={assetId} onChange={event => { setAssetId(event.target.value); setPage(1); }}><option value="">全部资产</option>{portfolio.assets.map(item => <option key={item.id} value={item.id}>{latest(item).fields.name}</option>)}</select></label><label>方案状态<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">全部状态</option><option value="draft">业务准备草稿</option><option value="evidence-pending">依据待核</option></select></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setAssetId(''); setStatus(''); setPage(1); }}>重置筛选</button></section>
      <section className="issuer-card investor-table-wrap"><h2>Token 方案</h2>{rows.length ? <div className="funds-list">{rows.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => { const fixed = portfolio.instruments.find(record => record.id === item.instrumentId); const asset = portfolio.assets.find(record => record.id === item.assetId); return <article key={item.id}><strong>{item.id}</strong><span>{asset ? latest(asset).fields.name : '资产待核'}</span><span>{fixed ? latest(fixed).fields.name : '权益待核'} · V{item.instrumentVersion}</span><span>草稿 V{item.versions.at(-1)?.number}</span><span>尚未部署</span><a href={link(`${base}/${item.id}`, query)}>查看详情</a></article>; })}</div> : <p>{data?.plans.length ? '没有符合筛选条件的 Token 方案。' : '当前没有 Token 方案。请先完成资产与权益结构，再准备业务草稿。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {rows.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section></>}
    <section className="issuer-card investor-panel"><h2>{detailId ? 'A. 权益与 Token 映射' : '准备 Token 方案'}</h2>{!detailId && !readOnly && <label>权益结构（必选）<select value={selected} onChange={event => { const id = event.target.value; setSelected(id); const existing = data?.plans.find(item => item.instrumentId === id); setNote(existing?.versions.at(-1)?.note || ''); setEditing(true); setFeedback(''); }}><option value="">请选择已就绪的权益结构</option>{portfolio.instruments.filter(item => item.status === 'ready').map(item => <option value={item.id} key={item.id}>{latest(item).fields.name} · V{latest(item).number}</option>)}</select></label>}{context ? <><dl className="investor-facts"><div><dt>资产</dt><dd>{latest(context.asset).fields.name} · {context.asset.number}</dd></div><div><dt>权益结构</dt><dd>{context.fixed.fields.name} · V{version}</dd></div><div><dt>权益类型／责任主体</dt><dd>{kindLabel[context.fixed.fields.type]} / {context.fixed.fields.subjectName || '待核'}</dd></div><div><dt>法律权益总规模</dt><dd>{context.fixed.fields.total} {context.mapping.unit}</dd></div><div><dt>Token 总份数</dt><dd>{context.fixed.fields.tokenSupply} Token</dd></div><div><dt>每 Token 法律权益</dt><dd>{context.mapping.error || !context.mapping.value ? '精确映射待核' : `${context.mapping.value} ${context.mapping.unit}`}</dd></div><div><dt>关联 Offering</dt><dd>{context.offerings.length ? context.offerings.map(item => latest(item).fields.name).join('；') : '暂无'}</dd></div></dl><div className="c08-actions"><a href={link(`/issuer/instruments/${instrument?.id}`, query)}>查看权益结构</a>{context.offerings.map(item => <a href={link(`/issuer/offerings/${item.id}`, query)} key={item.id}>查看 {latest(item).fields.name}</a>)}</div></> : <p>没有可用的权益结构版本。请先在资产与发行中完成资料检查。</p>}</section>
    {context && <><section className="issuer-card investor-panel"><h2>B. 网络、标准与模板</h2><dl className="investor-facts"><div><dt>Token 网络</dt><dd>当前无获准选项；支付网络不自动作为 Token 网络</dd></div><div><dt>标准与模板</dt><dd>待平台完成适用产品、法律和安全准入</dd></div><div><dt>环境</dt><dd>内部业务准备</dd></div><div><dt>链上精度与合约地址</dt><dd>尚无已确认来源</dd></div></dl><p>{readOnly ? '历史业务说明只读。' : '方案说明可编辑；Token 名称、符号与 decimals 将在获准模板要求下显示。'}</p>{readOnly ? <p>{current?.versions.at(-1)?.note || '没有历史业务说明。'}</p> : (editing || !current) ? <><label>方案说明（选填，最多 1,000 字）<textarea maxLength={1000} value={note} onChange={event => setNote(event.target.value)} placeholder="简要记录当前业务准备依据" /></label><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => setNote('请依据已确认的权益结构版本准备 Token 方案，等待适用网络与模板准入。')}>填入示例数据</button><button type="button" onClick={save}>保存草稿</button><button type="button" className="issuer-secondary" onClick={() => { setNote(current?.versions.at(-1)?.note || ''); setEditing(false); setFeedback(''); }}>取消编辑</button></div></> : <><p>{current.versions.at(-1)?.note || '尚无补充说明。'}</p><button type="button" className="issuer-secondary" onClick={() => { setNote(current.versions.at(-1)?.note || ''); setEditing(true); }}>编辑业务说明</button></>}{feedback && <p className="issuer-feedback" role="status">{feedback}</p>}</section>
      <section className="issuer-card investor-panel"><h2>C. 部署准备与证据</h2><ul className="issuer-allocation-checks">{issues.map(issue => <li key={issue}>{issue}</li>)}</ul><p>部署申请、批准、Signer 执行和链上最终确认均未取得权威来源；此处不提供提交部署或一键上链操作。</p>{current && <details><summary>查看方案版本与操作历史</summary>{current.versions.map(item => <p key={item.number}>V{item.number} · {when(item.at)} · {item.by} · {item.note || '业务准备资料'}</p>)}</details>}</section></>}
  </section>;
}

function Operations({ tenant, query }: Omit<Props, 'view'>) {
  const candidates = tokenDeliveryCandidates(tenant);
  const allocation = readAllocationData(tenant);
  const orders = readOrders(tenant) || [];
  const portfolio = readPortfolio(tenant);
  const [tab, setTab] = useState<'delivery' | 'restriction' | 'disposition'>('delivery');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const shown = candidates.filter(item => !search || `${item.allocationId} ${item.orderId}`.toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1, Math.ceil(shown.length / 20));
  return <section className="asset-page issuer-investors issuer-funds issuer-token"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / Token 管理 / Token 操作</nav><h1>Token 操作</h1><p>Mint、限制与销毁须以独立的资金、配售、法定登记及真实链上结果为依据。</p></header><div className="investor-fixture">当前没有已部署且最终核验的合约；不生成 Mint、Burn 或限制执行请求。</div>
    <nav className="issuer-funds-tabs" aria-label="Token 操作视图"><button type="button" aria-pressed={tab === 'delivery'} onClick={() => { setTab('delivery'); setPage(1); }}>Mint 与交付</button><button type="button" aria-pressed={tab === 'restriction'} onClick={() => setTab('restriction')}>限制与暂停</button><button type="button" aria-pressed={tab === 'disposition'} onClick={() => setTab('disposition')}>销毁与授权调整</button></nav>
    {tab === 'delivery' && <><section className="issuer-card investor-filters"><label>搜索配售或订单<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="配售编号、订单编号" /></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setPage(1); }}>清除筛选</button></section><section className="issuer-card investor-table-wrap"><h2>配售与交付条件</h2>{shown.length ? <div className="funds-list">{shown.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => { const order = orders.find(row => row.id === item.orderId); const instrument = portfolio.instruments.find(row => row.id === item.instrumentId); return <article key={item.allocationId}><strong>{item.allocationId}</strong><span>{order?.number || item.orderId}</span><span>{item.tokenQuantity} Token</span><span>{instrument ? latest(instrument).fields.name : '权益待核'}</span><span>交付前置待核</span><a href={link(`/issuer/allocation-holders/allocation/${item.allocationId}`, query)}>查看来源</a><details><summary>缺少的条件</summary><ul>{item.blockers.map(blocker => <li key={blocker}>{blocker}</li>)}</ul></details></article>; })}</div> : <p>{candidates.length ? '没有符合筛选条件的配售记录。' : '当前没有满足交付条件的配售记录。请先完成认购、资金核对和有权配售／登记流程。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {shown.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section></>}
    {tab === 'restriction' && <section className="issuer-card investor-panel"><h2>法律限制、合约控制与锁仓</h2><p>法律限制、合约暂停与 Offering 锁仓分别核对。当前没有已获准合约模板或受权执行主体，不能提交链上冻结、解除或暂停。</p>{(allocation?.restrictionRequests || []).length ? <div className="funds-list">{allocation?.restrictionRequests?.map(item => <article key={item.id}><strong>{item.id}</strong><span>{item.kind === 'restrict' ? '限制申请' : '解除申请'}</span><span>{item.tokenQuantity} Token</span><span>{restrictionStateLabel[item.state]}</span><span>{when(item.updatedAt)}</span><a href={link(`/issuer/allocation-holders/holder/${item.holderId}`, query)}>查看法律依据</a></article>)}</div> : <p>当前没有关联的受权限制申请。</p>}<div className="c08-actions"><a href={link('/issuer/allocation-holders', `${query}&view=holders`)}>查看持有人限制</a><a href={link('/issuer/lockups', query)}>查看业务锁仓</a></div></section>}
    {tab === 'disposition' && <section className="issuer-card investor-panel"><h2>依法到期或公司行动</h2><p>当前没有已核验的清偿、公司行动、登记调整与合约执行依据，不能申请 Burn 或授权调整。Token 销毁不代表资金已支付或法律权利已终止。</p><div className="c08-actions"><a href={link('/issuer/exits', query)}>查看到期与退出</a><a href={link('/issuer/allocation-holders', `${query}&view=holders`)}>查看法定登记</a></div></section>}
  </section>;
}

function Chain({ tenant, query, detailId }: Omit<Props, 'view'>) {
  const data = readTokenData(tenant);
  const chainEvent = data?.chainEvents.find(item => item.id === detailId);
  const allocation = readAllocationData(tenant);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [eventSearch, setEventSearch] = useState('');
  const [eventKind, setEventKind] = useState('');
  const eventRows = (data?.chainEvents || []).filter(item =>
    (!eventSearch || `${item.id} ${item.txHash}`.toLowerCase().includes(eventSearch.toLowerCase())) &&
    (!eventKind || item.kind === eventKind));
  const [eventPage, setEventPage] = useState(1);
  const eventPages = Math.max(1, Math.ceil(eventRows.length / 20));
  if (detailId) return <section className="asset-page issuer-investors issuer-funds issuer-token"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / Token 管理 / <a href={link('/issuer/chain-records', query)}>链上记录与对账</a> / 事件详情</nav><h1>链上事件详情</h1></header>
    {!data ? <div className="asset-warning" role="alert">链上记录暂不可读取。原本地记录已保留，请检查浏览器存储。</div> : !chainEvent ? <div className="issuer-card"><p>该链上事件不存在或无权访问。</p><a href={link('/issuer/chain-records', query)}>返回链上记录</a></div> : <><section className="issuer-card investor-panel"><h2>事件与最终性</h2><dl className="investor-facts"><div><dt>事件编号</dt><dd>{chainEvent.id}</dd></div><div><dt>事件类型</dt><dd>{chainKindLabel[chainEvent.kind]}</dd></div><div><dt>Token 方案</dt><dd><a href={link(`/issuer/token-contracts/${chainEvent.planId}`, query)}>{chainEvent.planId}</a></dd></div><div><dt>交易哈希</dt><dd>{chainEvent.txHash}</dd></div><div><dt>最终性</dt><dd>{chainFinalityLabel[chainEvent.finality]}</dd></div><div><dt>事件时间</dt><dd>{when(chainEvent.at)}</dd></div><div><dt>来源</dt><dd>权威链事件引用</dd></div></dl></section><section className="issuer-card investor-panel"><h2>关联与核对</h2><p>本事件仅证明其来源和当前最终性。资金、配售、法定登记和实际持有人状态需分别回源核对。</p><div className="c08-actions"><a href={link('/issuer/token-operations', query)}>查看 Token 操作</a><a href={link('/issuer/allocation-holders', query)}>查看配售与登记</a></div></section></>}
  </section>;
  const rows = (allocation?.holders || []).filter(item => !search || `${item.id} ${item.displayName} ${item.registrationRef || ''}`.toLowerCase().includes(search.toLowerCase()));
  const filtered = rows.filter(() => !state || state === 'unknown' || state === 'not-comparable');
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  return <section className="asset-page issuer-investors issuer-funds issuer-token"><header className="asset-page-head"><nav className="issuer-crumb"><a href={link('/issuer', query)}>工作台首页</a> / Token 管理 / 链上记录与对账</nav><h1>链上记录与对账</h1><p>真实链上事件与法定登记分别核对；没有链数据时不显示 Token 已确认数量。</p></header>
    {!data && <div className="asset-warning" role="alert">链上记录暂不可读取，请检查当前企业的本地资料。</div>}
    <section className="issuer-card investor-panel"><h2>链上事件</h2>{data?.chainEvents.length ? <><p>当前企业有 {data.chainEvents.length} 条有权链上事件。</p><div className="investor-filters"><label>搜索事件或交易哈希<input value={eventSearch} onChange={event => { setEventSearch(event.target.value); setEventPage(1); }} placeholder="事件编号、交易哈希" /></label><label>事件类型<select value={eventKind} onChange={event => { setEventKind(event.target.value); setEventPage(1); }}><option value="">全部类型</option><option value="deploy">部署</option><option value="mint">Mint</option><option value="transfer">Transfer</option><option value="restrict">限制</option><option value="burn">Burn</option></select></label><button type="button" className="issuer-secondary" onClick={() => { setEventSearch(''); setEventKind(''); setEventPage(1); }}>重置筛选</button></div>{eventRows.length ? <div className="funds-list">{eventRows.slice((eventPage - 1) * 20, eventPage * 20).map(item => <article key={item.id}><strong>{item.id}</strong><span>{chainKindLabel[item.kind]}</span><span>{item.txHash}</span><span>{chainFinalityLabel[item.finality]}</span><span>{when(item.at)}</span><a href={link(`/issuer/chain-records/${item.id}`, query)}>查看事件</a></article>)}</div> : <p>没有符合筛选条件的链上事件。</p>}<div className="pv-pagination"><span>第 {Math.min(eventPage, eventPages)} / {eventPages} 页 · 共 {eventRows.length} 条</span><button type="button" className="issuer-secondary" disabled={eventPage <= 1} onClick={() => setEventPage(eventPage - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={eventPage >= eventPages} onClick={() => setEventPage(eventPage + 1)}>下一页</button></div></> : <p>尚无经真实来源核验的部署、Mint、Transfer、限制或 Burn 事件。没有事件不代表链上余额为零。</p>}</section>
    <section className="issuer-card investor-filters"><label>搜索持有人或登记引用<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="持有人、登记编号" /></label><label>对账状态<select value={state} onChange={event => { setState(event.target.value); setPage(1); }}><option value="">全部</option><option value="unknown">链事实待核</option><option value="difference">存在差异</option><option value="not-comparable">暂不可比较</option></select></label><button type="button" className="issuer-secondary" onClick={() => { setSearch(''); setState(''); setPage(1); }}>重置筛选</button></section>
    <section className="issuer-card investor-table-wrap"><h2>Token 与法定登记核对</h2>{filtered.length ? <div className="funds-list">{filtered.slice((Math.min(page, pages) - 1) * 20, Math.min(page, pages) * 20).map(item => <article key={item.id}><strong>{item.displayName} · {item.id}</strong><span>{item.rightsQuantity ? `${item.rightsQuantity} ${item.rightsUnit || ''}` : '法律权益待核'}</span><span>{item.tokenQuantity ? `${item.tokenQuantity} Token（业务引用）` : 'Token 份数待核'}</span><span>链上 Mint 来源待核</span><span>真实链事实不可比较</span><a href={link(`/issuer/allocation-holders/holder/${item.id}`, query)}>查看来源</a></article>)}</div> : <p>{rows.length ? '没有符合筛选条件的登记记录。' : '暂无可核对的法定持有人登记。链上数据源未接入时不显示一致结论。'}</p>}<div className="pv-pagination"><span>第 {Math.min(page, pages)} / {pages} 页 · 共 {filtered.length} 条</span><button type="button" className="issuer-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button><button type="button" className="issuer-secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>下一页</button></div></section>
    <section className="issuer-card investor-panel"><h2>异常核对</h2><p>当前未接入真实链查询与最终性来源；Unknown 时应查询原 Intent 和原事件，不能重发 Mint、Burn 或限制操作。</p><div className="c08-actions"><a href={link('/issuer/token-operations', query)}>查看 Token 操作</a><a href={link('/issuer/allocation-holders', `${query}&view=issues`)}>查看配售差异</a><a href={link('/issuer/receipts', query)}>查看资金来源</a></div></section>
  </section>;
}

export function IssuerTokenV1({ view, ...props }: Props) {
  const [revision, setRevision] = useState(0);
  const [sampleError, setSampleError] = useState('');
  useEffect(() => {
    if (props.tenant.plan !== 'Standard') return;
    let active = true;
    ensureSandboxOperationalChain(props.tenant).then(() => {
      ensureSandboxFunds(props.tenant);
      ensureSandboxTokenPlan(props.tenant);
      if (active) setRevision(value => value + 1);
    }).catch(cause => {
      if (active) setSampleError(cause instanceof Error ? cause.message : '资料暂不可读取。');
    });
    return () => { active = false; };
  }, [props.tenant.id, props.tenant.plan, props.tenant.role]);
  return <div key={`${props.tenant.id}-${revision}`}>
    {sampleError && <div className="asset-warning" role="alert">{sampleError}</div>}
    {view === 'contracts' ? <Contracts {...props} /> : view === 'operations' ? <Operations {...props} /> : <Chain {...props} />}
  </div>;
}
