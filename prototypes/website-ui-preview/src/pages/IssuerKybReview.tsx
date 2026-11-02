import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getKybCase, simulateKybResult, type KybCase, type KybStatus } from '../issuerB04Demo';
import { CommercialBoundary, CommercialFlow, CommercialIntro, FactRows } from './IssuerCommercialShared';

const labels: Record<KybStatus, string> = { reviewing: 'Mock审核中', supplement: 'Mock需补件', rejected: 'Mock审核未通过', unknown: 'Mock结果未知' };
export function IssuerKybReview({ tenant }: { tenant: DemoTenant }) {
  const [record, setRecord] = useState<KybCase | null>(() => getKybCase(tenant));
  const [readState, setReadState] = useState<'ready' | 'loading' | 'failed' | 'unknown'>('ready');
  const [scenario, setScenario] = useState<KybStatus | 'passed-preview'>('reviewing');
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState('');
  const canManage = tenant.role === '企业管理员' && tenant.canSubscribe;
  const events = record?.events?.length ? record.events : record?.versions.map(version => ({ kind: 'submission' as const, version: version.number, materialNames: version.materials.map(item => item.name) })) || [];
  const refresh = () => {
    setReadState('loading');
    window.setTimeout(() => { setRecord(getKybCase(tenant)); setReadState('ready'); setNotice('已重新读取当前Tenant的原Mock Case；没有创建新申请。'); }, 350);
  };
  const simulate = () => {
    if (!canManage || !record) return;
    if (scenario === 'passed-preview') { setNotice('仅展示审核通过的UI预览；未写入原Case、合同、账单或Standard权益。'); return; }
    const next = simulateKybResult(tenant, scenario);
    if (next) { setRecord(next); setNotice('已模拟外部审核来源返回的状态；Issuer并未自行作出真实审核结论。'); }
  };
  return <>
    <CommercialIntro number="I-06" title="商业KYB审核进度" tenant={tenant} /><CommercialFlow current={paths.issuerKybReview} />
    {readState !== 'ready' ? <section className="issuer-card issuer-state" role="status"><h2>原申请读取</h2><p>{readState === 'loading' ? '正在读取原Mock Case…' : readState === 'failed' ? 'Mock读取失败，旧状态不视为最新结论。' : 'Mock结果未知，请查询原Case，不重复提交。'}</p>{readState !== 'loading' && <button className="issuer-link" onClick={refresh}>重试读取原申请</button>}</section> : !record ? <section className="issuer-card issuer-empty"><h2>尚无商业KYB申请</h2><p>Free Sandbox可继续使用。没有提交记录，也没有模拟审核结论。</p><a href={paths.issuerKyb + '?demo=1'}>准备商业KYB资料 →</a></section> : <>
      <section className="issuer-card issuer-commercial-section"><h2>原申请状态</h2><FactRows rows={[
        ['当前Tenant', tenant.name], ['原Mock Case', record.id.slice(0, 12)], ['当前状态', labels[record.status]],
        ['模拟提交时间', new Date(record.versions[0].submittedAt).toLocaleString('zh-CN')],
        ['材料版本', `${record.versions.length} 个已提交Mock版本`],
      ]} /><p>{record.status === 'supplement' ? '需补充演示材料；原因：模拟授权依据待核。补件沿用原Case。' : record.status === 'rejected' ? 'Mock审核未通过；仅显示可披露的演示说明，不提供未经批准的真实复核申请。' : record.status === 'unknown' ? '结果待核实。不可当作审核通过，也不可重复新建Case。' : '模拟审核进行中，暂无新的要求。'}</p><CommercialBoundary /></section>
      <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>审核事件历史（仅本地Mock）</h2><ol className="issuer-simple-list">{events.map((event, index) => <li key={index}>{event.kind === 'submission' ? `模拟提交 v${event.version} · ${event.materialNames.length} 项材料` : `${labels[event.status]} · 本地模拟状态变化`}</li>)}{!record.events?.length && <li>旧Mock记录未保存逐次状态事件；当前状态：{labels[record.status]}</li>}</ol><p>没有真实审核人员、决定时间或正式审批结论。</p></section><section className="issuer-card"><h2>补件与可披露说明</h2>{record.status === 'supplement' ? <p>模拟需件：签约授权说明。新增版本将与原Case关联，旧版保持只读。</p> : <p>当前没有可核实的真实补件通知或复核期限。</p>}{record.status === 'supplement' && canManage && <a className="issuer-action" href={paths.issuerKyb + '?demo=1&supplement=1'}>补充原申请资料 →</a>}{!canManage && <p>当前角色仅能查看申请摘要，不可编辑或提交材料。</p>}</section></div>
      <section className="issuer-card issuer-commercial-section"><h2>材料版本历史</h2><button className="issuer-link" aria-expanded={showHistory} onClick={() => setShowHistory(!showHistory)}>{showHistory ? '收起历史' : '查看历史'}</button>{showHistory && (canManage ? <ol className="issuer-simple-list">{record.versions.map(version => <li key={version.number}>v{version.number} · {new Date(version.submittedAt).toLocaleString('zh-CN')} · {version.materials.length} 项Mock材料：{version.materials.map(item => item.name).join('、') || '无'}；旧版不可覆盖</li>)}</ol> : <p>当前角色仅能查看申请摘要；材料明细不开放。</p>)}</section>
    </>}
    {record && canManage && <section className="issuer-card issuer-mock-panel"><h2>外部审核结果模拟器</h2><p>仅用于UI验收。Issuer不可自行作出真实KYB审核结论；“通过预览”不写入原Case。</p><label>模拟返回状态 <select value={scenario} onChange={event => setScenario(event.target.value as KybStatus | 'passed-preview')}><option value="reviewing">审核中</option><option value="supplement">需补件</option><option value="rejected">审核未通过</option><option value="unknown">结果未知</option><option value="passed-preview">审核通过预览（不保存）</option></select></label><button className="issuer-secondary" onClick={simulate}>模拟外部结果</button>{scenario === 'passed-preview' && <p>Mock通过预览：即使KYB已核实，合同、实收与权益仍须独立完成。</p>}</section>}
    <div className="issuer-testbar"><label>Mock读取状态 <select value={readState} onChange={event => setReadState(event.target.value as typeof readState)}><option value="ready">正常</option><option value="loading">Loading</option><option value="failed">Failed</option><option value="unknown">Unknown</option></select></label></div>
    <div className="issuer-quicklinks"><a href={paths.issuerKyb + '?demo=1'}>查看原申请资料 →</a><a href={paths.issuerUpgrade + '?demo=1'}>返回升级总览 →</a><a href={paths.issuerContract + '?demo=1'}>查看合同发布状态 →</a></div>{notice && <p className="issuer-feedback" role="status">{notice}</p>}
  </>;
}
