import { useState } from 'react';
import { canUseLocalDemo } from '../demoEnvironment';
import { useDemoControls } from '../demoControls';
import { getDemoTenant, simulateDowngradedEntitlement, simulateStandardEntitlement } from '../issuerDemo';
import { getKybRecord, setKybReview, type KybState } from '../issuerKybFlow';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';

export function LocalPreviewControls() {
  const controls = useDemoControls(state => state.controls);
  const setControl = useDemoControls(state => state.setControl);
  const reset = useDemoControls(state => state.resetControls);
  const [note, setNote] = useState('请补充企业注册证明。');
  const [message, setMessage] = useState('');
  const tenant = getDemoTenant();
  if (!canUseLocalDemo()) return <main><h1>页面不可用</h1></main>;
  const review = (status: Exclude<KybState, 'draft' | 'submitted'>) => {
    if (!tenant || !setKybReview(tenant, status, status === 'supplement' || status === 'rejected' ? note : '')) { setMessage('请先提交企业认证资料。'); return; }
    setMessage(`认证状态已更新为${status === 'passed' ? '已通过' : status === 'supplement' ? '待补件' : status === 'rejected' ? '未通过' : '审核中'}。`);
  };
  return <main className="local-preview-controls"><a href="/issuer?demo=1">← 返回工作台</a><h1>本地验收控制</h1><p>仅用于本地交互验收，不连接外部服务。</p>
    <section><h2>邮箱与创建</h2><label>邮件发送<select value={controls.mail} onChange={event => setControl('mail', event.target.value as typeof controls.mail)}><option value="accepted">正常</option><option value="unavailable">发送失败</option><option value="rate">发送频繁</option><option value="network">网络异常</option></select></label><label>验证码<select value={controls.code} onChange={event => setControl('code', event.target.value as typeof controls.code)}><option value="accepted">正常</option><option value="wrong">错误</option><option value="expired">已过期</option><option value="used">已使用</option></select></label><label>企业创建<select value={controls.create} onChange={event => setControl('create', event.target.value as typeof controls.create)}><option value="success">正常</option><option value="failed">失败</option><option value="unknown">结果待确认</option><option value="partial">部分完成</option></select></label></section>
    <section><h2>企业认证</h2><p>{tenant ? `${tenant.name} · ${getKybRecord(tenant).status}` : '当前没有企业'}</p><label>审核意见<input value={note} onChange={event => setNote(event.target.value)} /></label><div className="local-control-actions"><button onClick={() => review('reviewing')}>审核中</button><button onClick={() => review('supplement')}>待补件</button><button onClick={() => review('rejected')}>未通过</button><button onClick={() => review('passed')}>已通过</button></div></section>
    <section><h2>套餐权益</h2><p>Standard 与降级仅用于前端权益差异验收，不代表付款、到期账单或生产准入。</p><div className="local-control-actions"><button disabled={!tenant || tenant.plan === 'Standard' || getKybRecord(tenant).status !== 'passed'} onClick={() => { if (tenant && simulateStandardEntitlement(tenant.id)) setMessage('当前企业已切换为 Standard 权益展示。'); }}>切换为 Standard</button><button disabled={!tenant || tenant.plan !== 'Standard' || getKybRecord(tenant).status !== 'passed'} onClick={() => { if (tenant && simulateDowngradedEntitlement(tenant.id)) setMessage('当前企业已切换为降级后的历史只读状态。'); }}>查看降级后历史</button></div></section>
    <section><h2>业务流程资料</h2><p>准备当前企业关联的资产、权益、发行草稿与认购运营情景。所有资金、登记和 Token 状态仅供本地流程核对。</p><button type="button" disabled={!tenant || tenant.plan !== 'Standard' || getKybRecord(tenant).status !== 'passed'} onClick={() => { if (tenant) void ensureSandboxOperationalChain(tenant).then(() => setMessage('当前企业的关联业务资料已准备。')).catch(cause => setMessage(cause instanceof Error ? cause.message : '业务资料准备失败。')); }}>准备关联示例数据</button><a href="/issuer/orders?demo=1">查看认购订单</a></section>
    <button type="button" onClick={() => { reset(); setMessage('验收状态已恢复默认。'); }}>恢复默认验收状态</button>{message && <p role="status">{message}</p>}
  </main>;
}
