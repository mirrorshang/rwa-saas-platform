import React, { useEffect, useState } from 'react';
import { activeAccount, canSubmitSubscription, type WalletChoice } from './account.ts';
import { basePath, draftStorageKey, minimumUnits, priceU, quantityError, stepDisplayState, totalCents, type Channel, type Offering } from './domain.ts';
import { mockDocumentText } from './legalDocs';
import { advanceFulfillment, beginPayment, orderComplete, orderIsExpired, orderVisibleTo, readAllOrders, remainingUnits, reserveOrder, resolvePayment, saveOrder, type MockOrder } from './subscription.ts';

const names = ['确认认购','法律文件确认','钱包付款','交易进度'] as const;
const slugs = ['quote','documents','payment','progress'] as const;
const docId = (name:string,version:string) => name + '@' + version;
const stageText = (stage: 'pending'|'confirmed'|'unknown', done: string) => stage === 'confirmed' ? done+' · Mock' : stage === 'unknown' ? '待核实 · Mock' : '未开始 · Mock';

export function SubscriptionPage({ channel, offering, step, scenario }: { channel:Channel; offering:Offering; step:number; scenario:string }) {
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const account = activeAccount(channel);
  const root = basePath(channel);
  const detailUrl = root + '/opportunities/' + offering.id;
  const stepUrl = (index:number) => root + '/subscribe/' + offering.id + '/' + slugs[index] + (demoMode ? '?demo=1' : '');
  const quantityKey = draftStorageKey(channel,offering,'quantity');
  const readKey = draftStorageKey(channel,offering,'documents-read') + ':' + (account?.id || 'guest');
  const requestKey = draftStorageKey(channel,offering,'request-id') + ':' + (account?.id || 'guest');
  const orderIdKey = draftStorageKey(channel,offering,'order-id') + ':' + (account?.id || 'guest');
  const visitedKey = draftStorageKey(channel,offering,'visited');
  const [quantity,setQuantity] = useState(() => sessionStorage.getItem(quantityKey) || String(minimumUnits(offering)));
  const [read,setRead] = useState<Record<string,boolean>>(() => { try { return JSON.parse(sessionStorage.getItem(readKey) || '{}'); } catch { return {}; } });
  const [openDoc,setOpenDoc] = useState<string | null>(null);
  const [order,setOrder] = useState<MockOrder | null>(() => {
    const id = sessionStorage.getItem(orderIdKey);
    const found = id ? readAllOrders().find(item => item.id === id) : null;
    return found && account && orderVisibleTo(found,account,channel) && found.offeringId === offering.id ? found : null;
  });
  const [wallet,setWallet] = useState<WalletChoice>(account?.defaultWallet || 'mpc');
  const [receiver,setReceiver] = useState<WalletChoice>(account?.defaultWallet || 'mpc');
  const [addressesConfirmed,setAddressesConfirmed] = useState(false);
  const [working,setWorking] = useState(false);
  const [error,setError] = useState('');
  const [visited] = useState<number[]>(() => [...new Set([...(sessionStorage.getItem(visitedKey) || '').split(',').filter(Boolean).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<4),step])]);
  useEffect(() => { sessionStorage.setItem(visitedKey,visited.join(',')); },[visitedKey,visited]);
  const available = remainingUnits(offering,readAllOrders(),Date.now());
  const quantityProblem = quantityError(quantity,offering) || (available != null && Number(quantity) > available ? '当前可售容量不足' : '');
  const amount = quantityProblem ? 0 : totalCents(quantity,offering);
  const allRead = offering.documents.every(document => read[docId(document.name,document.version)]);
  const updateRead = (id:string,value:boolean) => { const next={...read,[id]:value}; setRead(next); sessionStorage.setItem(readKey,JSON.stringify(next)); };
  const addressFor = (choice:WalletChoice) => choice === 'mpc' ? (account?.mpc === 'ready' ? account.mpcAddress || '' : '') : (account?.ownVerified ? account.ownAddress || '' : '');
  const walletOptions = [{value:'mpc',label:'默认 MPC 钱包',enabled:account?.mpc === 'ready'},{value:'own',label:'已验证自有钱包',enabled:!!account?.ownVerified}] as const;
  const chooseWallet = (label:string,value:WalletChoice,onChange:(value:WalletChoice)=>void) => <label className="subscription-select"><span>{label}</span><select value={value} onChange={event => onChange(event.target.value as WalletChoice)}>{walletOptions.map(option => <option key={option.value} value={option.value} disabled={!option.enabled}>{option.label}{!option.enabled ? ' · 不可用' : ''}</option>)}</select><small>{addressFor(value) || '地址未就绪'}</small></label>;
  const create = async () => {
    if (working) return;
    setWorking(true); setError('');
    try {
      let requestId = sessionStorage.getItem(requestKey);
      const prior = requestId && readAllOrders().find(item => item.requestId === requestId);
      if (prior && (prior.payment === 'failed' || orderIsExpired(prior,Date.now()))) {
        requestId = null;
        sessionStorage.removeItem(requestKey);
        sessionStorage.removeItem(orderIdKey);
      }
      if (!requestId) { requestId = crypto.randomUUID(); sessionStorage.setItem(requestKey,requestId); }
      const result = await reserveOrder(offering,account,channel,Number(quantity),requestId,allRead);
      if (!result.order) { setError(result.error || 'Mock 订单创建失败'); return; }
      sessionStorage.setItem(orderIdKey,result.order.id);
      setOrder(result.order);
      location.href = stepUrl(2);
    } finally { setWorking(false); }
  };
  const startPayment = () => {
    if (!order || !account || !canSubmitSubscription(account) || !orderVisibleTo(order,account,channel)) return;
    const result = beginPayment(order,addressFor(wallet),addressFor(receiver),new Date().toISOString());
    if (!result.order) { setError(result.error || 'Mock 付款请求失败'); return; }
    saveOrder(result.order); setOrder(result.order); location.href = stepUrl(3);
  };
  const advance = () => {
    if (!order) return;
    const now = new Date().toISOString();
    const next = order.payment === 'broadcast'
      ? resolvePayment(order,scenario === 'payment-failed' ? 'failed' : scenario === 'payment-unknown' ? 'unknown' : 'matched',now)
      : advanceFulfillment(order,now);
    saveOrder(next); setOrder(next);
  };
  const paymentText = order?.payment === 'matched' ? '实收已匹配 · Mock' : order?.payment === 'broadcast' ? '交易已发起，待核实 · Mock' : order?.payment === 'failed' ? '付款失败 · Mock' : order?.payment === 'unknown' ? '付款状态未知 · Mock' : '未发起 · Mock';
  if (!demoMode) return <main className="container inner-page"><div className="breadcrumb"><a href={detailUrl}>项目详情</a><span>/</span><span>认购流程</span></div><div className="subscribe-head"><p className="eyebrow">SUBSCRIPTION</p><h1>{offering.title}</h1><p>了解认购的四个阶段；真实认证、签署、付款与登记服务尚未开放。</p></div><nav className="stepper" aria-label="认购步骤">{names.map((name,index) => <a key={name} href={stepUrl(index)} className={index === step ? 'current' : ''} aria-current={index === step ? 'step' : undefined}><span>{index+1}</span>{name}</a>)}</nav><div className="subscribe-grid"><section className="content-panel step-content"><p className="step-overline">步骤 {step+1} / 4</p><h2>{names[step]}</h2>
    {step === 0 && <><p>先核对项目、权益类型、每份价格和计划认购金额。当前价格仅用于示例展示，尚不能提交认购。</p><div className="rights-chain"><div><small>项目</small><strong>{offering.title}</strong><span>{offering.issuerName}</span></div><div><small>投资份额</small><strong>{minimumUnits(offering)} 份起</strong><span>每份 {priceU(offering.priceCents)} · 示例</span></div><div><small>认购金额</small><strong>{priceU(offering.minimumCents)} 起</strong><span>可售 {available == null ? '待核实' : available + ' 份 · 示例'}</span></div><div><small>取得的合同权益</small><strong>{offering.right}</strong><span>以有效合同与法定登记为准</span></div></div><p className="rights-note">份额凭证与链上记录不自动等于完整法律权利；认购金额不等于债权本金或可分配收益，实际应付金额与登记结果以有效文件为准。</p><a className="button button-secondary" href={stepUrl(1)}>了解文件确认 →</a></>}
    {step === 1 && <><p>认购前需要阅读有效法律文件，并完成正式电子签署。当前文件为示例内容，阅读记录不构成法律同意或有效签署。</p><div className="document-list">{offering.documents.map(document => <div key={document.name}><span>{document.name}</span><small>正式版本待披露</small></div>)}</div><p className="blocked-note">签署服务未开放，暂不能创建正式待付款订单。</p><a className="button button-secondary" href={stepUrl(2)}>了解付款阶段 →</a></>}
    {step === 2 && <><p>正式认购仅支持 OP Mainnet 网络上的 USDT。付款钱包与权益凭证接收地址需要分别确认。</p><div className="payment-card"><div><small>网络</small><strong>OP Mainnet</strong></div><div><small>币种</small><strong>USDT</strong></div><div><small>收款信息</small><strong>待核实</strong></div><div><small>付款状态</small><strong>尚未发起</strong></div></div><p className="blocked-note">真实钱包签名与付款服务尚未开放。查看本页不会发送交易或占用资金。</p><a className="button button-secondary" href={stepUrl(3)}>查看交易进度说明 →</a></>}
    {step === 3 && <><p>付款、配售、法定登记与权益凭证交付分别核对。发起付款不代表收款成功，配售不等于法定登记，登记也不等于凭证交付。</p><div className="timeline">{['付款','配售','法定登记','权益凭证交付'].map(name => <div key={name}><span className="timeline-dot"/><strong>{name}</strong><small>待核实</small></div>)}</div>{order && <p>本地示例订单可在订单页查询；其状态不代表真实交易完成。</p>}<h3>接下来可以做什么</h3><p>查看订单确认认购记录，查看有效持仓核对法定登记与凭证交付；如状态异常或待核实，可联系支持查询原记录。</p><div className="entry-links"><a className="button button-secondary" href={root+'/investments?tab=orders'}>查看订单</a><a className="button button-secondary" href={root+'/investments?tab=holdings'}>查看有效持仓</a><a className="button button-secondary" href={root+'/support'}>联系支持</a></div></>}
  </section><aside className="summary-card"><h2>当前状态</h2><p>真实认购服务暂不可用。您可以返回项目详情查看底层资产、权益安排和风险披露。</p><a className="text-link" href={detailUrl}>返回项目详情 →</a>{!account && <p><a className="text-link" href={root+'/account?from='+encodeURIComponent(stepUrl(step))}>查看账户服务 →</a></p>}</aside></div></main>;
  return <main className="container inner-page"><div className="breadcrumb"><a href={detailUrl}>投资机会</a><span>/</span><span>认购演示</span></div><div className="subscribe-head"><p className="eyebrow">SUBSCRIPTION · MOCK</p><h1>{offering.title}</h1><p>四步认购演示 · 不创建真实订单、不执行签名或资金交易</p></div>
    <nav className="stepper" aria-label="认购步骤">{names.map((name,index) => { const state=stepDisplayState(index,step,visited); const label=name+'，'+(state==='current'?'当前预览':state==='viewed'?'已查看':'未查看'); return index<=step || state==='viewed' ? <a key={name} href={stepUrl(index)} className={state} aria-label={label} aria-current={state==='current'?'step':undefined}><span>{index+1}</span>{name}</a> : <span key={name} className="locked" aria-label={label}><span>{index+1}</span>{name}</span>; })}</nav><p className="stepper-note">步骤查看记录不代表文件签署、付款、配售、登记或交付完成。</p>
    <div className="subscribe-grid"><section className="content-panel step-content"><p className="step-overline">STEP {step+1} / 04</p><h2>{names[step]}</h2>
      {step===0 && <><p>核对份数与金额。此报价仅为 Mock，不占用容量；创建待付款订单时将重新核验。</p><label className="field-label" htmlFor="quantity">认购 Token 份数</label><div className="quantity-control"><input id="quantity" inputMode="numeric" value={quantity} onChange={event => {setQuantity(event.target.value);sessionStorage.setItem(quantityKey,event.target.value);}} aria-invalid={!!quantityProblem} /><span>Token</span></div><small className={quantityProblem?'error':'hint'}>{quantityProblem || `最低 ${minimumUnits(offering)} 份 · 当前可售 ${available == null ? '待核实' : available+' 份 · Mock'}`}</small><div className="calculation"><div><span>Token 单价</span><strong>{priceU(offering.priceCents)}</strong></div><div><span>本次份数</span><strong>{quantityProblem?'待修正':quantity+' Token'}</strong></div><div><span>认购金额</span><strong>{quantityProblem?'—':priceU(amount)}</strong></div></div><p>本次认购须关联 {offering.id}；同一 Offering 的 V/M Mock 预留共用容量。</p><div className="step-actions"><a className="button button-secondary" href={detailUrl}>返回项目详情</a>{quantityProblem?<button className="button" disabled>核对法律文件 →</button>:<a className="button" href={stepUrl(1)}>核对法律文件 →</a>}</div></>}
      {step===1 && <><p>逐份打开并阅读以下可查看的 Mock 正文。文件版本固定关联本次 Offering；勾选仅确认演示阅读。</p><div className="legal-docs">{offering.documents.map(document => { const id=docId(document.name,document.version); return <div className="legal-doc" key={id}><button type="button" onClick={() => setOpenDoc(openDoc===id?null:id)} aria-expanded={openDoc===id}>{document.name} <small>{document.version}</small> <span>{openDoc===id?'收起':'查看正文'}</span></button>{openDoc===id && <div className="legal-body">{mockDocumentText(offering,document.name).map((line,index) => <p key={index}>{line}</p>)}<label className="check-row"><input type="checkbox" checked={!!read[id]} onChange={event => updateRead(id,event.target.checked)} />我已阅读本份 Mock 文件正文</label></div>}</div>; })}</div><div className="notice"><span>!</span>模拟确认不是有效电子签署或法律同意；订单与付款仅为本机演示。</div>{!account && <p className="blocked-note">请先<a href={root+'/account?from='+encodeURIComponent(stepUrl(1))+'&demo=1'}>登录当前渠道账户</a>。</p>}{account && !canSubmitSubscription(account) && <p className="blocked-note">提交前需完成 KYC。当前状态：{account.kyc}。<a href={root+'/account/kyc?from='+encodeURIComponent(stepUrl(1))+'&demo=1'}>查看认证状态</a></p>}{order && <p className="hint">已记录待付款 Mock 订单：{order.id}；法律签署有效性：否。</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="step-actions"><a className="button button-secondary" href={stepUrl(0)}>上一步</a><button className="button" disabled={!allRead || !canSubmitSubscription(account) || working || !!quantityProblem} onClick={create}>{working?'处理中':'模拟确认文件并创建待付款订单'} →</button></div></>}
      {step===2 && <>{!order ? <><p>尚无当前账户的待付款 Mock 订单，请先完成文件正文阅读与模拟确认。</p><a className="button button-secondary" href={stepUrl(1)}>返回文件确认</a></> : <><p>固定网络 OP Mainnet、币种 USDT。付款钱包与 Token 接收地址分别确认；本页不会调用真实钱包。</p><div className="payment-card"><div><small>网络</small><strong>OP Mainnet · Mock</strong></div><div><small>币种</small><strong>USDT · U</strong></div><div><small>目标</small><strong>Offering 收款合约 · Mock 未核实</strong></div><div><small>应付金额</small><strong>{priceU(order.amountCents)}</strong></div></div>{chooseWallet('USDT 付款钱包',wallet,setWallet)}{chooseWallet('Token 接收地址',receiver,setReceiver)}<label className="check-row"><input type="checkbox" checked={addressesConfirmed} onChange={event => setAddressesConfirmed(event.target.checked)} />我已分别核对付款与接收地址（仅 Mock）</label><div className="notice"><span>!</span>付款目标尚未真实核实；模拟发起只记录交易请求，不代表实收、配售或交付。</div>{!canSubmitSubscription(account) && <p className="blocked-note">当前账户 KYC 未通过，请先核对认证状态。</p>}{error && <p className="form-error" role="alert">{error}</p>}<div className="step-actions"><a className="button button-secondary" href={stepUrl(1)}>返回文件确认</a><button className="button" disabled={!canSubmitSubscription(account) || !addressesConfirmed || !addressFor(wallet) || !addressFor(receiver) || order.payment!=='not-started'} onClick={startPayment}>{order.payment==='not-started'?'模拟发起 USDT 付款':'付款请求已存在'} →</button></div></>}</>}
      {step===3 && <><p className="progress-preview">Mock 交易进度预览 · 可直接查看。页面访问本身不会改变任何业务状态。</p>{order ? <><p>订单 {order.id} · {order.units} Token · {priceU(order.amountCents)}；法律签署有效性：否。</p><div className="timeline"><div><span className="timeline-dot"/><strong>付款</strong><small>{paymentText}</small></div><div><span className="timeline-dot"/><strong>配售</strong><small>{stageText(order.allocation,'已确认')}</small></div><div><span className="timeline-dot"/><strong>法定登记</strong><small>{stageText(order.registration,'已登记')}</small></div><div><span className="timeline-dot"/><strong>Token 交付</strong><small>{stageText(order.delivery,'已交付')}</small></div></div>{order.paymentReference && <p className="hint">原付款引用：{order.paymentReference} · Mock；更新时间：{new Date(order.updatedAt).toLocaleString('zh-CN')}</p>}{orderComplete(order) ? <div className="notice"><span>✓</span>四个独立 Mock 状态均已确认；不构成真实法定登记或链上交付。</div> : <div className="notice"><span>!</span>仅完成已明确标记的阶段。未核实、失败或未开始均不得视为认购完成。</div>}{order.payment==='broadcast' || order.payment==='matched' && !orderComplete(order) ? <button className="button" type="button" onClick={advance}>{order.payment==='broadcast'?'模拟核实付款结果':order.allocation!=='confirmed'?'模拟确认配售':order.registration!=='confirmed'?'模拟确认法定登记':'模拟确认 Token 交付'}</button> : null}{(order.payment==='failed'||order.payment==='unknown') && <a className="text-link" href={root+'/support?from='+encodeURIComponent(stepUrl(3))}>联系支持并查询原交易 →</a>}{order.payment==='not-started' && <a className="button button-secondary" href={stepUrl(2)}>查看付款步骤</a>}<h3>接下来可以做什么</h3><p>查看订单确认认购记录，查看有效持仓核对法定登记与凭证交付；如状态异常或待核实，可联系支持查询原记录。</p><div className="entry-links"><a className="button button-secondary" href={root+'/investments?tab=orders'}>查看订单</a><a className="button button-secondary" href={root+'/investments?tab=holdings'}>查看有效持仓</a><a className="button button-secondary" href={root+'/support'}>联系支持</a></div></> : <><p>当前账户尚无与此 Offering 关联的 Mock 订单。付款、配售、法定登记与 Token 交付均为未开始。</p><div className="timeline">{['付款','配售','法定登记','Token 交付'].map(name => <div key={name}><span className="timeline-dot"/><strong>{name}</strong><small>未开始 · Mock</small></div>)}</div><h3>接下来可以做什么</h3><p>先完成文件确认与付款演示，再回到本页核对各阶段状态；如状态异常，可联系支持查询原记录。</p><div className="entry-links"><a className="button button-secondary" href={stepUrl(0)}>开始认购演示</a><a className="button button-secondary" href={root+'/support'}>联系支持</a></div></>}</>}
    </section><aside className="summary-card"><p className="eyebrow">ORDER SUMMARY · MOCK</p><h2>认购摘要</h2><div className="summary-row"><span>Offering</span><strong>{offering.id}</strong></div><div className="summary-row"><span>权益</span><strong>{offering.right}</strong></div><div className="summary-row"><span>Token 单价</span><strong>{priceU(offering.priceCents)}</strong></div><div className="summary-row"><span>份数</span><strong>{order?.units ?? (quantityProblem?'—':quantity)}</strong></div><div className="summary-total"><span>演示总额</span><strong>{order ? priceU(order.amountCents) : quantityProblem ? '—' : priceU(amount)}</strong></div><p className="summary-foot">非正式报价 · 非支付指令 · 法律签署无效</p></aside></div></main>;
}
