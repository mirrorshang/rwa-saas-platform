import { useState } from 'react';
import { paths } from '../config';
import { type DemoTenant } from '../issuerDemo';
import { getCommercialPreview, setCommercialPreview, type CommercialPreview } from '../issuerB04Demo';
import { CommercialBoundary, CommercialFlow, CommercialIntro, FactRows } from './IssuerCommercialShared';

export const paymentLabels: Record<CommercialPreview['payment'], string> = {
  unavailable: '账单未生成 · 付款待开放', unknown: '付款结果未知（Mock）',
  observed: '已观察交易但未核实（Mock）', matching: '实收到账待核实（Mock）',
  matched: '核款成功预览；权益未必激活（Mock）',
};
export const entitlementLabels: Record<CommercialPreview['entitlement'], string> = {
  unavailable: '商业权益未激活', pending: '权益开通待核实（Mock）',
  'activated-preview': '权益激活预览（仅本地Mock）',
};
export function IssuerPayment({ tenant }: { tenant: DemoTenant }) {
  const [preview, setPreview] = useState(() => getCommercialPreview(tenant));
  const [selectedPayment, setSelectedPayment] = useState<CommercialPreview['payment']>('unavailable');
  const [selectedEntitlement, setSelectedEntitlement] = useState<CommercialPreview['entitlement']>('unavailable');
  const [notice, setNotice] = useState('');
  const canManage = tenant.role === '企业管理员' && tenant.canSubscribe;
  const apply = (field: 'payment' | 'entitlement') => {
    const next = { ...preview, [field]: field === 'payment' ? selectedPayment : selectedEntitlement };
    if (!setCommercialPreview(tenant, next)) { setNotice('当前角色没有更改Mock预览状态的权限。'); return; }
    setPreview(next); setNotice('仅更新当前Tenant的本地UI预览；没有真实付款、核款或Standard商业权益激活。');
  };
  return <>
    <CommercialIntro number="I-08" title="Standard订阅付款与结果" tenant={tenant} /><CommercialFlow current={paths.issuerPayment} />
    <section className="issuer-card issuer-intent"><h2>价格与商户支付暂未开放</h2><p>本页只涉及SaaS商业订阅费，与投资者募集款、收益分配款完全分离。正式价格、周期、合同、Provider和商户网络均未批准，不生成账单或付款指令。</p><CommercialBoundary /></section>
    <div className="issuer-grid issuer-bottom"><section className="issuer-card"><h2>商业付款条件</h2><FactRows rows={[
      ['当前企业', tenant.name], ['套餐', 'Standard商业订阅 · 申请说明'], ['商业账单', '未生成真实Bill或支付Intent'],
      ['正式价格/账期', '待公布；无应付金额'], ['付款资产', 'USDT · 仅规划说明'],
      ['实收核实', paymentLabels[preview.payment]], ['商业权益激活', entitlementLabels[preview.entitlement]],
      ['收款地址/二维码', '未提供；不能进行付款'],
    ]} /></section><section className="issuer-card"><h2>首期目标网络说明</h2><ul className="issuer-simple-list"><li>TRON / TRC-20</li><li>BNB Smart Chain / BEP-20</li><li>Ethereum / ERC-20</li></ul><p>以上只是目标网络，并非已开放通道。当前没有获批网络、USDT合约、商户地址或可复制的付款信息。</p><p className="issuer-note">无需预先绑定企业永久钱包。没有Provider时，请勿向任何示例地址转账。</p></section></div>
    <section className="issuer-card issuer-commercial-section"><h2>付款异常与核实</h2><p>{preview.payment === 'unknown' ? 'Mock付款结果未知：请核实原账单；本页面没有再次付款指令。' : preview.payment === 'observed' || preview.payment === 'matching' ? '模拟观察或到账待核实，不等于真实实收。' : preview.payment === 'matched' ? '仅Mock核款预览，商业权益仍独立核实。' : '尚无真实账单、交易或付款异常Case。'}</p><p>付款核实与商业权益是独立状态；即使Mock显示权益激活，也不等于获得发行许可、投资者平台上架或Token Signer权限。</p><button className="issuer-secondary" type="button" disabled>发起真实付款 · 未开放</button></section>
    {canManage && <section className="issuer-card issuer-mock-panel"><h2>Mock状态展示</h2><p>仅用于验收状态文案，不产生账单、地址、TxHash、资金或真实权益。Unknown时没有“重新付款”操作。</p><label>付款核实预览 <select value={selectedPayment} onChange={event => setSelectedPayment(event.target.value as CommercialPreview['payment'])}>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="issuer-secondary" onClick={() => apply('payment')}>展示付款状态</button><label>权益状态预览 <select value={selectedEntitlement} onChange={event => setSelectedEntitlement(event.target.value as CommercialPreview['entitlement'])}>{Object.entries(entitlementLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="issuer-secondary" onClick={() => apply('entitlement')}>展示权益状态</button></section>}
    <div className="issuer-quicklinks"><a href={paths.issuerUpgrade + '?demo=1'}>返回升级总览 →</a><a href={paths.issuerBilling + '?demo=1'}>查看账单与开通状态 →</a></div>{notice && <p className="issuer-feedback" role="status">{notice}</p>}
  </>;
}
