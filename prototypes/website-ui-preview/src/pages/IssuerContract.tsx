import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getProfileDraft } from '../issuerB03Demo';
import { getCommercialPreview, setCommercialPreview, type CommercialPreview } from '../issuerB04Demo';
import { CommercialBoundary, CommercialFlow, CommercialIntro, FactRows } from './IssuerCommercialShared';

const labels: Record<CommercialPreview['contract'], string> = {
  unpublished: '正式合同尚未发布', reading: '阅读流程说明（Mock）',
  'read-confirmed': '仅确认已阅读流程说明', 'signature-unknown': '签署结果未知（Mock预览）',
  'effective-preview': '合同已生效（仅Mock状态预览）',
};
export function IssuerContract({ tenant }: { tenant: DemoTenant }) {
  const [preview, setPreview] = useState(() => getCommercialPreview(tenant));
  const [showProcess, setShowProcess] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [selected, setSelected] = useState<CommercialPreview['contract']>('unpublished');
  const [notice, setNotice] = useState('');
  const profile = getProfileDraft(tenant);
  const canManage = tenant.role === '企业管理员' && tenant.canSubscribe;
  const apply = () => {
    const next = { ...preview, contract: selected };
    if (!setCommercialPreview(tenant, next)) { setNotice('当前角色不能更改演示预览状态。'); return; }
    setPreview(next); setNotice('只更新当前Tenant浏览器中的Mock合同状态预览；没有签署意图、回执或有效合同。');
  };
  return <>
    <CommercialIntro number="I-07" title="SaaS商业合同" tenant={tenant} /><CommercialFlow current={paths.issuerContract} />
    <section className="issuer-card issuer-intent"><h2>正式合同尚未发布</h2><p>没有获批商业合同正文、版本、报价、签约代表权或签署服务。官网条款与投资者认购协议不能代替SaaS商业合同。</p><CommercialBoundary /></section>
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>签约对象与合同状态</h2><FactRows rows={[
      ['当前Tenant', tenant.name], ['商业签约主体草稿', canManage ? profile.commercialName || '尚未核实' : '仅管理员可查看'],
      ['签约代表及授权', '待核实；联系人不自动拥有代表权'], ['合同名称', 'SaaS商业合同 · 正式版本待发布'],
      ['合同版本', '无已发布版本'], ['合同发布状态', '正式合同尚未发布'],
      ['适用套餐', 'Standard（商业条件另核）'], ['正式价格与周期', '待批准及公布'],
      ['正式签署状态', '未发起；没有有效签署回执'], ['Mock状态预览', labels[preview.contract]],
    ]} /></section><section className="issuer-card"><h2>合同正文与历史版本</h2><p>正式合同正文尚未发布，不展示虚构条款。没有可阅读、下载或签署的正式版本。</p><button className="issuer-link" type="button" aria-expanded={showProcess} onClick={() => setShowProcess(!showProcess)}>{showProcess ? '收起流程说明' : '阅读签约流程说明'}</button>{showProcess && <ol className="issuer-simple-list"><li>阅读已发布正式合同及报价</li><li>核实当前Tenant与有权签约代表</li><li>确认阅读不等于签署</li><li>由合法签署服务发起签署</li><li>核实签署结果及有效回执</li></ol>}<p>历史合同版本：暂无可核实记录。</p></section></div>
    <section className="issuer-card issuer-commercial-section"><h2>阅读、签署与结果分别核实</h2><label className="issuer-commercial-check"><input type="checkbox" checked={readConfirmed} onChange={event => setReadConfirmed(event.target.checked)} /> 我已阅读以上流程说明（不是合同确认或签署）</label><p>{readConfirmed ? '流程说明已在当前页面确认；没有确认任何法律合同。' : '请先查看流程说明。'}</p><button type="button" className="issuer-action" disabled>发起正式签署 · 未开放</button><p>正式合同、合法代表权、报价及签署服务未具备；即使选择Mock“签署结果未知”或“已生效预览”，也不建立任何法律效力。</p></section>
    {canManage && <section className="issuer-card issuer-mock-panel"><h2>Mock签署状态预览</h2><p>仅切换UI状态，和KYB Case、商业账单、权益激活分开保存。</p><label>预览状态 <select value={selected} onChange={event => setSelected(event.target.value as CommercialPreview['contract'])}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="issuer-secondary" onClick={apply}>应用Mock预览</button></section>}
    <div className="issuer-quicklinks"><a href={paths.issuerUpgrade + '?demo=1'}>返回升级总览 →</a><a href={paths.issuerPayment + '?demo=1'}>查看付款开放说明 →</a></div>{notice && <p className="issuer-feedback" role="status">{notice}</p>}
  </>;
}
