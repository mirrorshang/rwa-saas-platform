import React, { useState } from 'react';
import { activeAccount, type AccountRecord } from './account.ts';
import { offerings } from './data.ts';
import { basePath, priceU, type Channel } from './domain.ts';
import { orderDetailUrl } from './orders.ts';
import { readAllOrders } from './subscription.ts';
import { applyDemoDistributionState, startMockClaim, claimBlockReason, createDemoDistribution, createMockPrincipalBasis, distributionAmounts, distributionKindLabel, distributionStateLabel, holdingNeedsReview, kindForRight, maskedHolder, ownDistributions, ownHoldings, paidIncomeCents, paidPrincipalCents, payMockPrincipal, principalBasisKey, readPrincipalBasis, readAllDistributions, saveDistribution, savePrincipalBasis, type DistributionKind, type DistributionMethod, type DistributionState, type Holding, type MockDistribution } from './postInvestment.ts';

const formatted = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('zh-CN') : '待核实';
const money = (value: number | null | undefined) => value == null ? '待核实' : priceU(value);
const holdingUrl = (channel: Channel, id: string) => basePath(channel) + '/investments/holdings/' + encodeURIComponent(id);
const distributionUrl = (channel: Channel, id: string) => basePath(channel) + '/investments/returns/' + encodeURIComponent(id);
const holdingsFor = (channel: Channel, account: AccountRecord | null) => ownHoldings(readAllOrders(), account, channel, offerings);
const distributionsFor = (channel: Channel, account: AccountRecord | null, holdings: Holding[]) => ownDistributions(readAllDistributions(), account, channel, holdings);
const rightGuidance = (right: string) => right === '债权' ? '利息依据有效合同与实际未偿本金核算；本金偿还单独记录，不计入收益。' : right === '股权' ? '股息以有效决议、可分配利润与法律权益为依据，不保证分配。' : '分配以实际合法可分配金额与有效持有人份额为依据，历史收入不等于应付收益。';
const stateLabel = (state: DistributionState) => ({ planned: '计划待核实', confirmed: '应付金额已确认', funded: '资金已备付', claimable: '可领取', processing: '处理中', paid: '已支付', unknown: '结果待核实' })[state] || '待核实';
const methodLabel = (method: DistributionMethod) => ({ undecided: '待核实', claim: '投资者领取', push: '直接支付', external: '外部付款' })[method];
const publicReason = (reason: string) => reason.replaceAll('Mock ', '').replace('原领取请求已存在，请查询原请求，不能覆盖或重复发起', '已有领取申请，请先核对原申请结果。');
const parseAmount = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value) ? Math.round(Number(value) * 100) : NaN;

function ExampleNotice() { return <p className="notice">以下为示例记录，仅供了解页面流程，不代表真实投资、法定登记或资金到账。</p>; }
function Metric({ label, children }: { label: string; children: React.ReactNode }) { return <div><small>{label}</small><strong>{children}</strong></div>; }
function Empty({ title, detail, href, action }: { title: string; detail: string; href: string; action: string }) {
  return <div className="empty"><h1>{title}</h1><p>{detail}</p><a className="button button-secondary" href={href}>{action}</a></div>;
}

function PrincipalSummary({ holding, event }: { holding: Holding; event?: MockDistribution }) {
  const basis = readPrincipalBasis(holding.order.id);
  const amount = event ? distributionAmounts(event).net : null;
  const source = basis?.originalDebtSource.replace(/Mock\s*/gi, '').trim();
  return <section className="content-panel principal-summary"><h2>本金核对</h2>
    <p>当前未接入权威债权本金与付款凭证。认购金额和底层原合同金额均不能替代当前有效未偿本金；以下金额为本地示例记录，不代表法定本金已到账。</p>
    <div className="info-grid">
      <Metric label="关联债权">{holding.offering.title}</Metric>
      <Metric label="原始债权来源">{source || '待核实'}</Metric>
      <Metric label="示例本金（非真实法定本金）">{money(basis?.testPrincipalCents)}</Metric>
      <Metric label="已偿还（示例）">{money(basis?.repaidCents)}</Metric>
      <Metric label="剩余本金（示例）">{money(basis?.remainingCents)}</Metric>
      <Metric label="本次偿还">{amount == null ? '请在偿还记录中查看' : money(amount)}</Metric>
      <Metric label="核对时点">{formatted(basis?.asOf)}</Metric>
      <Metric label="依据状态">{basis ? '本地示例依据，非法定确认' : '待核实，暂不能标记支付'}</Metric>
    </div>
  </section>;
}

export function HoldingsPanel({ channel, account }: { channel: Channel; account: AccountRecord }) {
  const holdings = holdingsFor(channel, account);
  return <section><div className="section-head"><h2>我的持仓</h2></div><ExampleNotice />
    {holdings.length ? <div className="record-list">{holdings.map(holding => <article className="content-panel holding-card" key={holding.order.id}>
      <p className="eyebrow">{holding.offering.issuerName} · {holding.offering.right}</p><h2>{holding.offering.title}</h2>
      {holdingNeedsReview(holding) && <p className="blocked-note">原订单有未决异常，当前权益和分配资格待核实。请查看订单或联系客服。</p>}
      <div className="holding-metrics"><Metric label="登记份额（示例）">{holding.order.units}</Metric><Metric label="凭证交付">{holding.order.delivery === 'confirmed' ? '示例交付记录已确认' : '待核实'}</Metric><Metric label="当前可核余额">待核实</Metric><Metric label="法定权益对账">待核实</Metric></div>
      <a className="text-link" href={holdingUrl(channel, holding.order.id)}>查看持仓详情 →</a>
    </article>)}</div> : <Empty title="暂无持仓" detail="完成法定权益登记后，您可在这里查看持仓。付款和凭证交付不能代替登记。" href={basePath(channel) + '/investments?tab=orders'} action="查看认购订单" />}
  </section>;
}

export function HoldingDetailPage({ channel, id }: { channel: Channel; id: string }) {
  const root = basePath(channel), account = activeAccount(channel);
  const holding = holdingsFor(channel, account).find(value => value.order.id === id);
  if (!account || !holding) return <main className="container inner-page"><Empty title={account ? '持仓不可访问' : '请登录查看持仓'} detail="请确认当前账户有权查看此记录。" href={root + (account ? '/investments?tab=holdings' : '/account?from=' + encodeURIComponent(holdingUrl(channel, id)))} action={account ? '返回持仓' : '前往登录'} /></main>;
  const { order, offering } = holding;
  const events = distributionsFor(channel, account, [holding]);
  return <main className="container inner-page"><div className="breadcrumb"><a href={root + '/investments?tab=holdings'}>我的持仓</a><span>/</span><span>持仓详情</span></div>
    <div className="page-head"><div><p className="eyebrow">{offering.issuerName} · {offering.right}</p><h1>{offering.title}</h1></div></div><ExampleNotice />
    {holdingNeedsReview(holding) && <p className="blocked-note">原订单存在异常或退款待核状态，暂不能领取收益。历史记录保留供核查；客服工单关闭不会改变权益状态。</p>}
    <div className="record-layout"><div><section className="content-panel"><h2>法定权益</h2><div className="info-grid"><Metric label="持有人">{maskedHolder(account)}</Metric><Metric label="登记状态">示例登记记录已确认；真实登记待核实</Metric><Metric label="登记份额（示例）">{order.units}</Metric><Metric label="记录日期">{formatted(order.registeredAt)}</Metric></div><p>{rightGuidance(offering.right)}</p></section>
      <section className="content-panel"><h2>权益凭证与对账</h2><p>Token 是权益凭证的技术交付形式，不自动等于完整法律权益。登记与凭证交付分别核对。</p><div className="info-grid"><Metric label="凭证交付">{order.delivery === 'confirmed' ? '示例交付记录已确认' : '待核实'}</Metric><Metric label="当前可核余额">待核实</Metric><Metric label="网络与合约">待核实</Metric><Metric label="法定权益对账">待核实</Metric><Metric label="锁定安排">{offering.lockup || '以项目文件为准'}</Metric><Metric label="转让限制">待核实，以有效权益文件为准</Metric></div></section>
      {offering.right === '债权' && <PrincipalSummary holding={holding} />}
      <section className="content-panel"><h2>关联收益与偿还</h2>{events.length ? events.map(event => <p key={event.id}><a className="text-link" href={distributionUrl(channel, event.id)}>{distributionKindLabel(event.kind)} · {stateLabel(event.state)} →</a></p>) : <p>暂无关联分配记录。后续以有效分配依据为准。</p>}</section>
    </div><aside className="summary-card"><h2>下一步</h2><p><a className="text-link" href={orderDetailUrl(channel, order.id)}>查看来源订单 →</a></p><p><a className="text-link" href={root + '/disclosures'}>查看文件与披露 →</a></p><a className="button button-secondary" href={root + '/support?order=' + encodeURIComponent(order.id)}>联系客户支持</a></aside></div>
  </main>;
}

export function ReturnsPanel({ channel, account }: { channel: Channel; account: AccountRecord }) {
  const holdings = holdingsFor(channel, account), events = distributionsFor(channel, account, holdings);
  const list = (principal: boolean) => {
    const rows = events.filter(item => (item.kind === 'principal') === principal);
    return rows.length ? <div className="record-list">{rows.map(item => <article className="content-panel distribution-card" key={item.id}><div><p className="eyebrow">{distributionKindLabel(item.kind)}</p><h3>{offerings.find(value => value.id === item.offeringId)?.title || '项目信息待核实'}</h3><p>{methodLabel(item.method)} · {item.period}</p></div><div className="record-metrics"><strong>{money(distributionAmounts(item).confirmed)}</strong><em>{stateLabel(item.state)}</em></div><a className="text-link" href={distributionUrl(channel, item.id)}>查看分配详情 →</a></article>)}</div> : <p className="hint">暂无{principal ? '本金偿还' : '收益分配'}记录。</p>;
  };
  return <section><ExampleNotice /><div className="return-summary"><div><small>已支付收益（示例）</small><strong>{events.length ? priceU(paidIncomeCents(events)) : '待核实'}</strong><p>不含本金偿还</p></div><div><small>已偿本金（示例）</small><strong>{events.length ? priceU(paidPrincipalCents(events)) : '待核实'}</strong><p>独立于投资收益</p></div></div>
    <section><div className="section-head"><h2>收益分配</h2></div>{list(false)}</section><section><div className="section-head"><h2>债权本金偿还</h2></div>{holdings.filter(holding => holding.offering.right === '债权').map(holding => <PrincipalSummary key={holding.order.id} holding={holding} />)}{list(true)}</section>
    <p className="notice">预计收益不等于应付金额，可领取不等于已到账。请以有效合同、分配依据和实际付款凭证为准。</p>
  </section>;
}

export function DistributionDetailPage({ channel, id }: { channel: Channel; id: string }) {
  const root = basePath(channel), account = activeAccount(channel), holdings = holdingsFor(channel, account);
  const item = distributionsFor(channel, account, holdings).find(value => value.id === id);
  if (!account || !item) return <main className="container inner-page"><Empty title={account ? '分配记录不可访问' : '请登录查看分配记录'} detail="请确认当前账户和记录归属。" href={root + (account ? '/investments?tab=returns' : '/account?from=' + encodeURIComponent(distributionUrl(channel, id)))} action={account ? '返回收益与本金' : '前往登录'} /></main>;
  const holding = holdings.find(value => value.order.id === item.orderId)!;
  const amounts = distributionAmounts(item);
  const reason = item.method === 'claim' ? claimBlockReason(item, account, channel, holding) : null;
  return <main className="container inner-page"><div className="breadcrumb"><a href={root + '/investments?tab=returns'}>收益与本金</a><span>/</span><span>分配详情</span></div><div className="page-head"><div><p className="eyebrow">{holding.offering.title}</p><h1>{distributionKindLabel(item.kind)}</h1><p>{reason ? '待核实 · 分配资格受限' : stateLabel(item.state)}</p></div></div><ExampleNotice />
    <div className="record-layout"><div><section className="content-panel"><h2>分配金额</h2><div className="info-grid"><Metric label="权益类型">{holding.offering.right}</Metric><Metric label="收益期间">{item.period}</Metric><Metric label="权益登记基准日">{item.recordDate || '待核实'}</Metric><Metric label="应付日或计划日">{item.dueDate || '待核实'}</Metric><Metric label="毛额（示例）">{money(item.grossCents)}</Metric><Metric label="扣项（示例）">{money(item.deductionsCents)}</Metric><Metric label="净应付（示例）">{money(amounts.confirmed)}</Metric><Metric label="已备付（示例）">{money(amounts.funded)}</Metric><Metric label="可领取（示例）">{money(reason ? 0 : amounts.claimable)}</Metric><Metric label="已支付（示例）">{money(amounts.paid)}</Metric><Metric label="未支付（示例）">{money(amounts.unpaid)}</Metric><Metric label="支付方式">{methodLabel(item.method)}</Metric></div><p>{rightGuidance(holding.offering.right)}</p></section>
      {item.kind === 'principal' && <PrincipalSummary holding={holding} event={item} />}
      <section className="content-panel"><h2>当前待办</h2>{reason && <p className="blocked-note">{publicReason(reason)}</p>}{item.state === 'unknown' && <p>结果尚未核实，请查询原申请。未核实前不要再次发起领取。</p>}<p>真实领取服务尚未开放。此页面不提交资金指令，示例记录不能证明实际到账。</p><a className="button button-secondary" href={root + '/support?order=' + encodeURIComponent(item.orderId)}>查询原记录或联系支持</a></section>
    </div><aside className="summary-card"><h2>关联记录</h2><p><a className="text-link" href={holdingUrl(channel, item.orderId)}>查看持仓 →</a></p><a className="text-link" href={orderDetailUrl(channel, item.orderId)}>查看来源订单 →</a></aside></div>
  </main>;
}

// Developer-only controls. These never appear in the investor navigation or ordinary business pages.
export function DemoDistributionControls({ channel }: { channel: Channel }) {
  const account = activeAccount(channel), holdings = holdingsFor(channel, account), events = distributionsFor(channel, account, holdings);
  const [holdingId, setHoldingId] = useState(holdings[0]?.order.id || '');
  const selected = holdings.find(item => item.order.id === holdingId);
  const allowed = kindForRight(selected?.offering.right || '收益参与权');
  const [kind, setKind] = useState<DistributionKind>(allowed[0]);
  const [method, setMethod] = useState<DistributionMethod>('undecided');
  const [amount, setAmount] = useState('10.00');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [state, setState] = useState<DistributionState>('confirmed');
  const [source, setSource] = useState('');
  const [principal, setPrincipal] = useState('');
  const [note, setNote] = useState('');
  const basis = selected ? readPrincipalBasis(selected.order.id) : null;
  const currentEvent = events.find(item => item.id === eventId);
  const create = () => {
    const cents = parseAmount(amount);
    if (!Number.isSafeInteger(cents)) { setNote('请输入有效金额，最多两位小数。'); return; }
    const fresh = holdingsFor(channel, activeAccount(channel)).find(item => item.order.id === holdingId);
    const result = createDemoDistribution(activeAccount(channel), channel, fresh, allowed.includes(kind) ? kind : allowed[0], method, cents, 0, new Date().toISOString(), 'mock-dist-' + crypto.randomUUID());
    if (!result.item) { setNote(result.error || '事件未创建'); return; }
    saveDistribution(result.item); setEventId(result.item.id); setNote('已创建计划待核实的 Mock 事件。');
  };
  const createBasis = () => {
    if (!selected) return;
    if (localStorage.getItem(principalBasisKey(selected.order.id)) !== null) { setNote('已有本金依据记录，不能覆盖；损坏记录须另行核查。'); return; }
    const fresh = holdingsFor(channel, activeAccount(channel)).find(item => item.order.id === holdingId);
    const result = createMockPrincipalBasis(activeAccount(channel), channel, fresh, source, parseAmount(principal), new Date().toISOString(), null, readAllDistributions());
    if (!result.basis) { setNote(result.error || '本金依据未建立'); return; }
    savePrincipalBasis(result.basis); setNote('已建立独立 Mock 测试本金依据，不是法定本金映射。');
  };
  const update = () => {
    const event = readAllDistributions().find(item => item.id === eventId);
    const offering = offerings.find(item => item.id === event?.offeringId);
    if (!event || !offering) return;
    if (event.kind === 'principal' && state === 'paid') {
      const result = payMockPrincipal(activeAccount(channel), channel, offering, event.id, new Date().toISOString());
      setNote(result.error || '本金支付已核对：已偿 ' + money(result.basis?.repaidCents) + '，剩余 ' + money(result.basis?.remainingCents)); return;
    }
    const next = applyDemoDistributionState(event, state, new Date().toISOString());
    if (next === event) { setNote('状态变更被拒绝：已支付本金不能回退；支付须通过本金依据校验。'); return; }
    saveDistribution(next); setNote('已应用 Mock 事件状态：' + distributionStateLabel(next.state));
  };
  const claim = () => {
    const event = readAllDistributions().find(item => item.id === eventId);
    const offering = offerings.find(item => item.id === event?.offeringId);
    if (!event || !offering) return;
    const result = startMockClaim(activeAccount(channel), channel, offering, event.id, new Date().toISOString(), () => crypto.randomUUID());
    setNote(result.error || 'Mock 领取已进入 processing；原请求：' + result.item?.requestId);
  };
  return <section className="content-panel demo-business" data-testid="distribution-controls"><h2>收益与本金事件模拟</h2><p>仅修改当前渠道本机 Mock 记录，不产生真实付款或法定本金依据。</p>
    <div className="demo-account-controls"><label>本人持仓<select id="demo-holding" value={holdingId} onChange={event => { setHoldingId(event.target.value); setKind(kindForRight(holdings.find(item => item.order.id === event.target.value)?.offering.right || '收益参与权')[0]); }}><option value="">选择持仓</option>{holdings.map(item => <option key={item.order.id} value={item.order.id}>{item.offering.title} · {item.order.id}</option>)}</select></label><label>事件类型<select id="demo-kind" value={allowed.includes(kind) ? kind : allowed[0]} onChange={event => setKind(event.target.value as DistributionKind)}>{allowed.map(value => <option key={value} value={value}>{distributionKindLabel(value)}</option>)}</select></label><label>本批路径<select id="demo-method" value={method} onChange={event => setMethod(event.target.value as DistributionMethod)}><option value="undecided">待核实</option><option value="claim">Claim · Mock</option><option value="push">Push · Mock</option><option value="external">外部付款 · Mock</option></select></label><label>演示毛额 U<input id="demo-amount" value={amount} onChange={event => setAmount(event.target.value)} inputMode="decimal" /></label><button className="button" disabled={!holdingId} onClick={create}>创建 Mock 事件</button></div>
    {selected?.offering.right === '债权' && <section className="demo-principal"><h3>独立 Mock 测试本金依据</h3><p>对应债权：{selected.offering.title} · {selected.offering.id}。以下金额必须显式输入，不采用认购金额或原合同金额。</p><div className="demo-account-controls"><label>Mock 原始债权来源<input id="demo-principal-source" value={source} onChange={event => setSource(event.target.value)} /></label><label>Mock 测试本金 U<input id="demo-principal-amount" value={principal} onChange={event => setPrincipal(event.target.value)} inputMode="decimal" /></label><button className="button button-secondary" onClick={createBasis}>建立 Mock 本金依据</button></div><dl><dt>来源</dt><dd>{basis?.originalDebtSource || '待核实'}</dd><dt>应偿 / 已偿 / 剩余本金</dt><dd>{money(basis?.testPrincipalCents)} / {money(basis?.repaidCents)} / {money(basis?.remainingCents)}</dd><dt>最近一次偿还 / 核对时点</dt><dd>{money(basis?.lastRepaymentCents)} / {formatted(basis?.asOf)}</dd></dl></section>}
    <div className="demo-account-controls"><label>本人事件<select id="demo-event" value={eventId} onChange={event => setEventId(event.target.value)}><option value="">选择事件</option>{events.map(item => <option key={item.id} value={item.id}>{distributionKindLabel(item.kind)} · {item.id}</option>)}</select></label><label>结果状态<select id="demo-result" value={state} onChange={event => setState(event.target.value as DistributionState)}>{(['planned', 'confirmed', 'funded', 'claimable', 'processing', 'paid', 'unknown'] as DistributionState[]).map(value => <option key={value} value={value}>{distributionStateLabel(value)}</option>)}</select></label><button className="button" disabled={!eventId} onClick={update}>应用事件 Mock 结果</button><button id="demo-claim" className="button button-secondary" disabled={!eventId} onClick={claim}>执行 Mock Claim</button></div>
    {currentEvent && <p data-testid="claim-record">当前事件：{currentEvent.id} · {currentEvent.state} · 原请求：{currentEvent.requestId || '无'} · 本次金额 {money(distributionAmounts(currentEvent).net)}<br /><a href={distributionUrl(channel, currentEvent.id)}>查看投资者页面</a></p>}{note && <p role="status">{note}</p>}
  </section>;
}
