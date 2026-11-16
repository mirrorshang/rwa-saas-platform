import { useEffect, useState } from 'react';
import { DsBadge, DsCard, DsEmpty } from '../design-system/components';
import { getKybRecord } from '../issuerKybFlow';
import type { DemoTenant } from '../issuerDemo';
import { readPortfolio } from '../issuerPortfolioV1';
import { readOrders } from '../issuerOrdersV1';
import { readInvestorRelations } from '../issuerInvestorsV1';
import { deriveFundsIssues, ensureSandboxFunds, readFundsData } from '../issuerFundsV1';
import { readAllocationIssues } from '../issuerAllocationV1';
import { ensureSandboxTokenPlan, readTokenData } from '../issuerTokenV1';
import { ensureSandboxYieldDraft, readYieldDrafts } from '../issuerYieldDraftV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';

const statusLabels = { draft: '待完成', submitted: '已提交', reviewing: '审核中', supplement: '待补件', rejected: '未通过', passed: '已通过' };

export function IssuerDashboard({ tenant, query, panel }: { tenant: DemoTenant; query: string; panel: 'ready' | 'loading' | 'failed' | 'unknown' }) {
  const kyb = getKybRecord(tenant);
  const link = (path: string) => `${path}?${query}`;
  const passed = kyb.status === 'passed';
  const downgraded = tenant.subscriptionState === 'downgraded';
  const canPrepare = passed && tenant.plan === 'Standard';
  const operational = passed && (canPrepare || downgraded);
  const [sampleError, setSampleError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [, refresh] = useState(0);
  useEffect(() => {
    if (!canPrepare) return;
    let active = true;
    setPreparing(true);
    void ensureSandboxOperationalChain(tenant).then(() => {
      ensureSandboxFunds(tenant);
      ensureSandboxTokenPlan(tenant);
      ensureSandboxYieldDraft(tenant);
      if (active) { setPreparing(false); refresh(value => value + 1); }
    }).catch(cause => {
      if (active) { setSampleError(cause instanceof Error ? cause.message : '企业资料暂不可读取。'); setPreparing(false); }
    });
    return () => { active = false; };
  }, [tenant.id, tenant.plan, tenant.role, canPrepare]);
  const action = kyb.status === 'draft' ? '继续企业认证' : kyb.status === 'submitted' || kyb.status === 'reviewing' ? '查看认证进度' : kyb.status === 'passed' ? '查看认证资料' : '修改资料并重新提交';
  const prompt = downgraded ? '当前为降级后的存续服务状态。请查看历史记录和未结事项；普通新增及编辑已停止。' : kyb.status === 'draft' ? '完成五步企业认证后，可开始准备资产、权益结构和发行方案。' : kyb.status === 'submitted' || kyb.status === 'reviewing' ? '企业认证资料已提交，请等待审核结果。' : kyb.status === 'supplement' || kyb.status === 'rejected' ? '请查看审核意见，修改资料后重新提交。' : '企业认证已通过，可按当前套餐使用业务功能。';
  const portfolio = passed ? readPortfolio(tenant) : null;
  const orders = operational ? readOrders(tenant) : null;
  const investors = operational ? readInvestorRelations(tenant) : null;
  const funds = operational ? readFundsData(tenant) : null;
  const allocationIssues = operational ? readAllocationIssues(tenant) : null;
  const token = passed ? readTokenData(tenant) : null;
  const yieldDrafts = operational ? readYieldDrafts(tenant) : null;
  const fundIssues = funds ? deriveFundsIssues(funds) : [];
  const attention = [
    ...(!downgraded ? portfolio?.assets.filter(item => item.status === 'draft').slice(0, 2).map(item => ({ label: `资产资料待完成 · ${item.number}`, path: `/issuer/assets/${item.id}` })) || [] : []),
    ...(!downgraded ? portfolio?.instruments.filter(item => item.status === 'draft').slice(0, 2).map(item => ({ label: `权益结构待核 · ${item.number}`, path: `/issuer/instruments/${item.id}` })) || [] : []),
    ...fundIssues.slice(0, 2).map(item => ({ label: `资金待核 · ${item.title}`, path: `/issuer/receipts/receipt/${item.receiptId}` })),
    ...(allocationIssues || []).slice(0, 2).map(item => ({ label: `配售与登记 · ${item.title}`, path: `/issuer/allocation-holders/issue/${item.id}` })),
  ];
  return <div className="issuer-home">
    <div className="issuer-home-head"><div><span className="issuer-home-kicker">发行机构工作台</span><h1>工作台首页</h1><p>查看企业状态与业务入口</p></div><DsBadge tone={tenant.plan === 'Standard' ? 'success' : 'info'}>{downgraded ? '已降级 · 存续服务' : tenant.plan}</DsBadge></div>
    {panel !== 'ready' && <div className="issuer-home-state" role={panel === 'failed' ? 'alert' : 'status'}>{panel === 'loading' ? '正在读取企业概况…' : panel === 'failed' ? '企业概况暂不可用，请稍后重试。' : '企业概况结果待确认，请稍后查询。'}</div>}
    {preparing && <div className="issuer-home-state" role="status">正在准备当前企业的业务资料…</div>}
    {sampleError && <div className="issuer-home-state" role="alert">业务资料暂不可用：{sampleError}</div>}
    <div className="issuer-home-grid">
      <DsCard title="企业状态"><dl className="issuer-home-facts"><div><dt>企业名称</dt><dd>{tenant.name}</dd></div><div><dt>企业认证</dt><dd><DsBadge tone={passed ? 'success' : kyb.status === 'rejected' ? 'danger' : kyb.status === 'supplement' ? 'warning' : 'info'}>{statusLabels[kyb.status]}</DsBadge></dd></div><div><dt>当前套餐</dt><dd>{tenant.plan}</dd></div></dl><a className="issuer-home-link" href={link('/issuer/company') + '&tab=kyb'}>查看企业资料与认证 →</a></DsCard>
      <DsCard title="当前需要处理"><p>{prompt}</p>{kyb.reviewNotes && <p>审核意见：{kyb.reviewNotes}</p>}<a className="issuer-home-link" href={link('/issuer/company') + '&tab=kyb'}>{action} →</a></DsCard>
    </div>
    <div className="issuer-home-grid issuer-home-lower"><DsCard title={passed ? '业务入口' : '认证后可用能力'}>{passed ? <><div className="issuer-home-actions"><a href={link('/issuer/assets')}>资产管理 <span>→</span></a><a href={link('/issuer/plan')}>套餐与订阅 <span>→</span></a><a href={link('/issuer/reports')}>业务报表 <span>→</span></a></div><p>权益结构与发行方案请从对应资产详情进入。</p></> : <p>认证通过后，Free 可创建并保存资产、权益结构及发行方案。真实发行另需满足适用准入条件。</p>}</DsCard><DsCard title="待办与异常">{passed && attention.length ? <div className="issuer-home-actions">{attention.map(item => <a key={`${item.path}-${item.label}`} href={link(item.path)}>{item.label}<span>→</span></a>)}</div> : <DsEmpty title="暂无可显示的事项" detail={passed ? '当前本地来源没有新的待核事项；外部服务状态另行核验。' : '完成企业认证后，在此查看业务待办。'} />}<div className="issuer-home-actions"><a href={link('/issuer/tasks')}>查看全部待办 <span>→</span></a>{operational && <a href={link('/issuer/issues')}>查看异常来源 <span>→</span></a>}</div></DsCard></div>
    {passed && <div className="issuer-home-grid"><DsCard title="资产与发行"><dl className="issuer-home-facts"><div><dt>资产资料</dt><dd>{portfolio?.assets.length ?? '待核'}</dd></div><div><dt>权益结构</dt><dd>{portfolio?.instruments.length ?? '待核'}</dd></div><div><dt>发行方案草稿</dt><dd>{portfolio?.offerings.length ?? '待核'}</dd></div></dl><a className="issuer-home-link" href={link('/issuer/assets')}>查看资产与发行 →</a></DsCard>{operational && <DsCard title="投资者与认购"><dl className="issuer-home-facts"><div><dt>脱敏投资者关系</dt><dd>{investors?.length ?? '待核'}</dd></div><div><dt>内部订单情景</dt><dd>{orders?.length ?? '待核'}</dd></div><div><dt>真实已完成认购</dt><dd>权威来源待核</dd></div></dl><a className="issuer-home-link" href={link('/issuer/orders')}>查看认购订单 →</a></DsCard>}{operational && <DsCard title="资金与结算"><dl className="issuer-home-facts"><div><dt>内部到账观察</dt><dd>{funds?.receipts.length ?? '待核'}</dd></div><div><dt>资金异常待核</dt><dd>{funds ? fundIssues.length : '待核'}</dd></div><div><dt>真实资金执行</dt><dd>权威来源待核</dd></div></dl><a className="issuer-home-link" href={link('/issuer/receipts')}>查看收款与对账 →</a></DsCard>}<DsCard title={operational ? "Token 与收益" : "Token 业务准备"}><dl className="issuer-home-facts"><div><dt>Token 方案草稿</dt><dd>{token?.plans.length ?? '待核'}</dd></div><div><dt>真实链上交付</dt><dd>{operational ? '权威来源待核' : '当前套餐未开放'}</dd></div>{operational && <><div><dt>收益上报资料草稿</dt><dd>{yieldDrafts?.length ?? '待核'}</dd></div><div><dt>实际收益与清偿</dt><dd>权威来源待核</dd></div></>}</dl><a className="issuer-home-link" href={link('/issuer/token-contracts')}>查看 Token 管理 →</a>{operational && <a className="issuer-home-link" href={link('/issuer/distributions')}>查看收益分配 →</a>}</DsCard></div>}
  </div>;
}
