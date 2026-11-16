import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { beginUpgradeIntent, getUpgradeIntent, setUpgradeDemoStatus, type UpgradeIntent, type UpgradeStatus } from '../issuerB03Demo';
import { getCommercialPreview, getKybCase } from '../issuerB04Demo';
import { CommercialFlow, FactRows } from './IssuerCommercialShared';

const steps = [
  ['企业与权限', '确认当前Tenant和订阅管理权限；升级不重新创建企业。', '已授权企业上下文'],
  ['商业KYB', 'I-05准备商业资料，I-06展示原Mock Case。真实审核仍待有权方或Provider。', '权威审核未接入'],
  ['SaaS商业合同', 'I-07展示合同发布与签署状态；正式合同及签署服务未开放。', '合同未发布'],
  ['USDT账单与到账核实', 'I-08付款说明、I-09账单空态。价格、Provider和商户收款未接入。', '不可付款'],
  ['商业权益启用', '仅在商业条件由权威服务核实后，才可真实启用Standard。', '独立核实'],
] as const;
const states: Record<UpgradeStatus, string> = {
  preparing: '资料准备中', processing: '模拟处理中', failed: '模拟异常：付款环节失败',
  unknown: '模拟结果待确认', 'mock-complete': '演示Standard标签已启用',
};

export function IssuerUpgrade({ tenant }: { tenant: DemoTenant }) {
  const [record, setRecord] = useState<UpgradeIntent | null>(() => getUpgradeIntent(tenant));
  const [outcome, setOutcome] = useState<UpgradeStatus>('processing');
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [notice, setNotice] = useState('');
  const canManage = tenant.canSubscribe;
  const kyb = getKybCase(tenant);
  const commercial = getCommercialPreview(tenant);
  const start = () => {
    const prior = record;
    const next = beginUpgradeIntent(tenant);
    if (!next) { setNotice('当前企业没有可用的模拟升级资格；不会创建账单。'); return; }
    setRecord(next);
    setNotice(prior ? `已恢复当前企业原Mock申请 ${next.id.slice(0, 12)}；未创建第二个申请。` : `已建立当前企业Mock准备申请 ${next.id.slice(0, 12)}；未提交KYB、合同或付款。`);
  };
  const apply = () => {
    const next = setUpgradeDemoStatus(tenant, outcome);
    if (!next) { setNotice('当前演示结果无法应用；请核实企业与订阅权限。'); return; }
    setRecord(next);
    if (outcome === 'mock-complete') { location.reload(); return; }
    setNotice(outcome === 'unknown' ? '模拟结果待确认；保留同一申请，不会重复付款。' : outcome === 'failed' ? '模拟付款环节失败；没有发生真实资金转移。' : '原Mock申请状态已更新，尚未产生真实商业权益。');
  };
  return <>
    <div className="issuer-intro"><div><p className="issuer-kicker">I-04 / Standard升级总览</p><h1>升级当前企业</h1><p>{tenant.name} · {tenant.plan === 'Free' ? 'Free Sandbox' : 'Standard演示状态'} · {tenant.role}</p></div><span className="issuer-badge">升级流程 Mock · 无真实付款</span></div>
    <section className="issuer-card issuer-upgrade-head"><div><h2>当前申请</h2><p>升级沿用此Tenant、现有项目与资料，不创建第二家企业。商业KYB、合同、真实付款和权益激活分别核实。</p><dl className="issuer-facts"><div><dt>订阅权限</dt><dd>{canManage ? '当前演示成员可管理本企业订阅' : '只读；联系当前企业管理员'}</dd></div><div><dt>当前套餐</dt><dd>{tenant.plan === 'Free' ? 'Free · 永久Sandbox' : 'Standard · 演示权益'}</dd></div><div><dt>Mock申请编号</dt><dd>{record?.id.slice(0, 12) || '尚未发起'}</dd></div><div><dt>Mock进度</dt><dd>{record ? states[record.status] : '未开始'}</dd></div></dl></div><div className="issuer-upgrade-actions">{tenant.plan === 'Free' && (canManage ? <button className="issuer-action" type="button" onClick={start}>{record ? '继续原升级申请' : '开始升级准备'}</button> : <p role="status">您没有该企业的订阅管理权限，请联系企业管理员。</p>)}<a className="issuer-secondary" href={`${paths.issuerSubscription}?demo=1`}>返回订阅管理</a><a className="issuer-secondary" href={`${paths.issuer}?demo=1`}>进入工作台</a></div></section>
    <div className="issuer-section-title"><h2>五阶段进度</h2><small>以下仅为前端流程说明；阶段2～5无权威服务结果</small></div><div className="issuer-upgrade-steps">{steps.map(([name, detail, status], index) => <section className="issuer-card" key={name}><div className="issuer-step-top"><span className="issuer-step-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{name}</h2><small>{index === 0 ? '当前Tenant已在演示会话中选择' : status}</small></div><button className="issuer-link" type="button" aria-expanded={openStep === index} onClick={() => setOpenStep(openStep === index ? null : index)}>{openStep === index ? '收起说明' : '查看说明'}</button></div>{openStep === index && <p>{detail}</p>}</section>)}</div>
    <section className="issuer-card issuer-commercial-section"><h2>当前Tenant的独立商业状态</h2><FactRows rows={[
      ['商业KYB', kyb ? `原Mock Case · ${kyb.status}` : '未提交'],
      ['SaaS合同', commercial.contract === 'unpublished' ? '正式合同尚未发布' : `仅Mock预览 · ${commercial.contract}`],
      ['商业实收', commercial.payment === 'unavailable' ? '无账单及支付Provider' : `仅Mock预览 · ${commercial.payment}`],
      ['Standard权益', commercial.entitlement === 'unavailable' ? '未由权威服务激活' : `仅Mock预览 · ${commercial.entitlement}`],
    ]} /><p>四项状态互不替代。即使浏览器显示Standard演示标签，也不代表KYB、合同、实收或生产发行许可已完成。</p></section>
    <CommercialFlow current={paths.issuerUpgrade} />
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>下一步与异常恢复</h2>{record?.status === 'failed' ? <p>模拟付款环节失败。原申请仍在；请核实原记录，不要重复发起付款。</p> : record?.status === 'unknown' ? <p>模拟结果待确认。原申请仍在；Unknown不能显示为已付款或已开通。</p> : record?.status === 'mock-complete' || tenant.plan === 'Standard' ? <p>仅演示已显示Standard标签。真实链上发行、募资、Token及投资者平台展示仍需独立审批。</p> : <p>可继续准备当前企业商业KYB草稿。正式KYB、合同、账单与支付服务未接入。</p>}<a className="issuer-secondary" href={`${paths.issuerProfile}?demo=1`}>查看企业资料</a></section><section className="issuer-card"><h2>商业报价与支付边界</h2><dl className="issuer-facts"><div><dt>正式价格与周期</dt><dd>待公布</dd></div><div><dt>支付网络与Provider</dt><dd>尚未批准及接入</dd></div><div><dt>真实账单/到账</dt><dd>暂无可核实记录</dd></div></dl><p className="issuer-note">不提供生产收款地址、二维码、TxHash或重复付款按钮。</p></section></div>
    {canManage && tenant.plan === 'Free' && record && <section className="issuer-card issuer-mock-panel"><h2>仅供UI验收的结果切换</h2><p>这里模拟外部服务可能返回的状态；不会发送付款或宣称KYB、合同、资金已真实核实。「演示完成」只更新此浏览器当前Tenant的Mock套餐标签。</p><label>Mock结果 <select value={outcome} onChange={event => setOutcome(event.target.value as UpgradeStatus)}><option value="processing">处理中</option><option value="failed">付款环节失败（Mock）</option><option value="unknown">结果待确认（Mock）</option><option value="mock-complete">演示完成，仅更新套餐标签</option></select></label><button className="issuer-action" type="button" onClick={apply}>应用演示结果</button></section>}
    {notice && <p className="issuer-feedback" role="status">{notice}</p>}
  </>;
}
