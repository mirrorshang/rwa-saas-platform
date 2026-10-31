import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getUpgradeIntent } from '../issuerB03Demo';
import { getCommercialPreview, getKybCase } from '../issuerB04Demo';
import { CommercialBoundary, CommercialFlow, CommercialIntro, FactRows } from './IssuerCommercialShared';
import { entitlementLabels, paymentLabels } from './IssuerPayment';

export function IssuerBilling({ tenant }: { tenant: DemoTenant }) {
  const [readState, setReadState] = useState<'ready' | 'loading' | 'failed' | 'unknown'>('ready');
  const [filter, setFilter] = useState<'all' | 'mock'>('all');
  const [showDetail, setShowDetail] = useState(false);
  const preview = getCommercialPreview(tenant);
  const kyb = getKybCase(tenant);
  const upgrade = getUpgradeIntent(tenant);
  const canManage = tenant.role === '企业管理员' && tenant.canSubscribe;
  return <>
    <CommercialIntro number="I-09" title="订阅账单与开通状态" tenant={tenant} /><CommercialFlow current={paths.issuerBilling} />
    <section className="issuer-card issuer-plan-summary"><div><h2>当前套餐与订阅生命周期</h2><strong>{tenant.plan === 'Free' ? 'Free · 永久Sandbox' : 'Standard · 仅演示标签'}</strong><p>{tenant.plan === 'Free' ? 'Free永久有效，没有14天试用、到期倒计时或自动扣费。' : '本地Mock套餐标签不是已核实的正式商业开通。'}</p></div><div className="issuer-plan-facts"><div><span>账期</span><strong>待批准</strong></div><div><span>到期状态</span><strong>无真实到期日</strong></div><div><span>手动续费</span><strong>待合同、价格与Provider开放</strong></div></div></section>
    <section className="issuer-card issuer-commercial-section"><h2>四项独立商业状态</h2><FactRows rows={[
      ['商业KYB', kyb ? `原Mock Case ${kyb.id.slice(0, 12)} · ${kyb.status === 'unknown' ? '结果未知' : kyb.status === 'supplement' ? '需补件' : kyb.status === 'rejected' ? '未通过' : '审核中'}` : '未提交'],
      ['SaaS商业合同', preview.contract === 'unpublished' ? '正式合同尚未发布' : `仅Mock预览：${preview.contract}`],
      ['商业付款核实', paymentLabels[preview.payment]], ['商业权益', entitlementLabels[preview.entitlement]],
      ['原升级准备申请', upgrade ? `Mock ${upgrade.id.slice(0, 12)} · ${upgrade.status}` : '未开始'],
    ]} /><p className="issuer-note">KYB、合同、实收和权益分别核实。付款完成不等于权益激活；权益激活也不赋予真实发行许可。</p><div className="issuer-quicklinks"><a href={paths.issuerKybReview + '?demo=1'}>KYB进度 →</a><a href={paths.issuerContract + '?demo=1'}>合同状态 →</a><a href={paths.issuerPayment + '?demo=1'}>付款说明 →</a></div></section>
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><div className="issuer-card-head"><div><h2>商业账单列表</h2><p>只包含当前Tenant的SaaS订阅费，不含投资者募集款或收益分配款。</p></div></div><label className="issuer-commercial-filter">筛选 <select value={filter} onChange={event => setFilter(event.target.value as 'all' | 'mock')}><option value="all">全部正式账单</option><option value="mock">Mock状态说明</option></select></label>{readState === 'ready' ? filter === 'all' ? <div className="issuer-empty"><h3>暂无商业账单</h3><p>价格与账期未批准，不生成金额、订单号或付款地址。</p></div> : <div className="issuer-empty"><h3>此条件下没有匹配账单</h3><p>当前仅有付款状态的Mock预览，没有真实Bill记录。</p></div> : <div className="issuer-empty" role="status"><h3>{readState === 'loading' ? '正在读取…' : readState === 'failed' ? '账单暂不可用' : '账单结果未知'}</h3><p>{readState === 'unknown' ? '只查询原记录；不重新生成账单或付款指令。' : '没有可用的正式账单数据。'}</p>{readState !== 'loading' && <button className="issuer-link" onClick={() => setReadState('ready')}>重试读取</button>}</div>}</section><section className="issuer-card"><h2>账单详情与订阅历史</h2><p>没有可查看的正式Bill详情、付款凭证、激活日期或历史版本。</p><button className="issuer-link" type="button" aria-expanded={showDetail} onClick={() => setShowDetail(!showDetail)}>{showDetail ? '收起账单说明' : '查看账单说明'}</button>{showDetail && <p>未来有效商业账单应分别列出用途、价格、周期、核款与权益状态；当前未批准，不能创建样例金额。</p>}<p>商业订阅历史：暂无可核实记录。</p></section></div>
    <section className="issuer-card issuer-commercial-section"><h2>手动续费与商业退出</h2><p>若未来获批，续费按有效账单单次手动办理；目前没有自动扣款、自动生成下一期账单或可执行的停用流程。</p><button className="issuer-secondary" disabled>手动续费 · 待开放</button><button className="issuer-link" type="button" onClick={() => setShowDetail(true)}>I-14 商业停用与退出 · 待开发</button>{!canManage && <p>当前角色只可查看允许的状态摘要，不能管理商业订阅。</p>}<CommercialBoundary /></section>
    <div className="issuer-testbar"><label>Mock账单读取 <select value={readState} onChange={event => setReadState(event.target.value as typeof readState)}><option value="ready">正常</option><option value="loading">Loading</option><option value="failed">Failed</option><option value="unknown">Unknown</option></select></label></div>
    <div className="issuer-quicklinks"><a href={paths.issuerSubscription + '?demo=1'}>查看资源使用 →</a><a href={paths.issuerUpgrade + '?demo=1'}>返回升级总览 →</a></div>
  </>;
}
