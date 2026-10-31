import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getUpgradeIntent } from '../issuerB03Demo';
import { emptyOverview, offeringsOf, samples } from '../issuerSamples';

type ReadState = 'ready' | 'loading' | 'failed' | 'unknown';
const statusText = { preparing: '资料准备中', processing: '模拟处理中', failed: '模拟付款环节失败', unknown: '结果待确认', 'mock-complete': '演示Standard状态' };

export function IssuerSubscription({ tenant }: { tenant: DemoTenant }) {
  const [readState, setReadState] = useState<ReadState>('ready');
  const [notice, setNotice] = useState('');
  const intent = getUpgradeIntent(tenant);
  const overview = samples[tenant.id] || emptyOverview;
  const canManage = tenant.canSubscribe;
  const upgradeHref = `${paths.issuerUpgrade}?demo=1`;
  return <>
    <div className="issuer-intro"><div><p className="issuer-kicker">I-03 / 套餐与使用</p><h1>订阅管理</h1><p>仅查看当前企业 {tenant.name} 的演示权益、资源与升级申请。</p></div><span className="issuer-badge">{tenant.plan === 'Free' ? 'Free · 永久Sandbox' : 'Standard · 商业订阅Mock'}</span></div>
    <section className="issuer-card issuer-plan-summary"><div><h2>当前套餐与订阅状态</h2><strong>{tenant.plan === 'Free' ? 'Free · 永久Sandbox' : 'Standard · 演示商业权益'}</strong><p>{tenant.plan === 'Free' ? 'Free Sandbox 演示可用；不包含真实链上发行或募资。' : '此浏览器的Standard演示标签不代表商业KYB、合同、付款或生产发行已核实。'}</p></div><div className="issuer-plan-facts"><div><span>当前订阅状态</span><strong>{tenant.plan === 'Free' ? 'Free Sandbox · Mock' : 'Standard标签 · 仅本地Mock'}</strong></div><div><span>计费周期</span><strong>待确定</strong></div><div><span>到期日</span><strong>待确定</strong></div><div><span>商业权益核实</span><strong>权威服务未接入</strong></div><div><span>正式价格</span><strong>价格待公布</strong></div><div><span>生产执行许可</span><strong>独立审核，当前未开放</strong></div></div></section>
    <div className="issuer-section-title"><h2>资源使用概况</h2><small>Mock项目数据；配额与计量口径尚未批准</small></div>
    {readState === 'ready' ? <div className="issuer-metrics issuer-usage"><article><span>资产记录</span><strong>{overview.assets.length}</strong><small>当前Tenant演示数据 · 额度待确定</small></article><article><span>发行项目</span><strong>{overview.projects.length}</strong><small>当前Tenant演示数据 · 额度待确定</small></article><article><span>关联发行轮次</span><strong>{offeringsOf(overview).length}</strong><small>按Offering记录统计 · 额度待确定</small></article><article><span>成员与存储</span><strong>—</strong><small>计量来源未接入</small></article></div> : <section className="issuer-card issuer-state" role="status"><h2>资源用量</h2><p>{readState === 'loading' ? '正在读取当前企业演示用量…' : readState === 'failed' ? '用量暂不可用，请稍后重试。' : '用量结果暂无法确认，不会将未知值显示为零。'}</p>{readState !== 'loading' && <button className="issuer-link" type="button" onClick={() => setReadState('ready')}>重试读取</button>}</section>}
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>Free 与 Standard 权益</h2><div className="issuer-table-wrap issuer-benefit-table"><table><thead><tr><th>能力</th><th>Free Sandbox</th><th>Standard</th></tr></thead><tbody><tr><td>企业工作台与项目准备</td><td>演示数据可用</td><td>商业工作台；权限另核</td></tr><tr><td>真实募资与链上执行</td><td>不可用</td><td>需独立合规及生产审核</td></tr><tr><td>WDEX投资者平台展示</td><td>未开放</td><td>不自动获得上架资格</td></tr><tr><td>额度与价格</td><td>待公布</td><td>待公布</td></tr></tbody></table></div><button className="issuer-link" type="button" onClick={() => setNotice('项目、资产、成员、文件及Sandbox调用的正式计量口径和额度尚未确定；当前不绘制剩余额度或假进度条。')}>查看用量说明 →</button></section>
    <section className="issuer-card"><h2>当前企业订阅申请与账单</h2>{intent ? <dl className="issuer-facts"><div><dt>Mock申请编号</dt><dd>{intent.id.slice(0, 12)}</dd></div><div><dt>升级状态</dt><dd>{statusText[intent.status]}</dd></div><div><dt>订阅订单</dt><dd>正式来源未接入，未生成可支付订单</dd></div><div><dt>付款核实</dt><dd>{intent.status === 'failed' ? 'Mock异常：付款环节失败；没有真实资金转移' : intent.status === 'unknown' ? 'Mock结果待确认；请勿重复付款' : '未接入真实支付服务'}</dd></div></dl> : <p>当前企业暂无升级申请。没有正式账单或支付记录。</p>}<p className="issuer-note">金额、网络、地址、TxHash和付款证据均未生成。演示状态不能代替实际商业记录。</p><div className="issuer-quicklinks">{tenant.plan === 'Free' ? canManage ? <a className="issuer-action" href={upgradeHref}>升级 Standard →</a> : <><a className="issuer-secondary" href={upgradeHref}>查看升级流程</a><p>您没有该企业的订阅管理权限，请联系企业管理员。</p></> : null}<a className="issuer-secondary" href={`${paths.issuerBilling}?demo=1`}>查看订阅账单与开通状态 →</a></div></section></div>
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>订阅权益变化历史</h2><p>暂无可核实的正式权益变更记录。{intent?.status === 'mock-complete' ? '本地演示套餐标签已变更，不计入正式商业权益历史。' : 'Mock升级申请不等于已激活Standard权益。'}</p></section><section className="issuer-card"><h2>账单与付款历史</h2><p>暂无正式账单或真实付款记录。订阅申请状态仅用于演示；付款成功、到账和权益启用需要分别由权威服务核实。</p></section></div>
    {notice && <p className="issuer-feedback" role="status">{notice}</p>}<div className="issuer-testbar"><label>Mock用量读取 <select value={readState} onChange={event => setReadState(event.target.value as ReadState)}><option value="ready">正常</option><option value="loading">Loading</option><option value="failed">Failed</option><option value="unknown">Unknown</option></select></label></div>
  </>;
}
