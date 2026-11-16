import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { readPortfolio, tokenMapping, type InstrumentRecord } from './issuerPortfolioV1';
import { readAllocationData } from './issuerAllocationV1';
import { readFundsData } from './issuerFundsV1';
import { readOrders } from './issuerOrdersV1';

export type TokenPlan = {
  id: string; tenantId: string; assetId: string; instrumentId: string; instrumentVersion: number;
  status: 'draft' | 'evidence-pending'; deployment: 'not-requested';
  versions: { number: number; note: string; at: number; by: string }[];
  events: { at: number; label: string; by: string }[];
};
export type TokenChainEvent = { id: string; tenantId: string; planId: string; kind: 'deploy' | 'mint' | 'transfer' | 'restrict' | 'burn';
  txHash: string; finality: 'observed' | 'pending' | 'final' | 'unknown' | 'failed'; at: number; source: 'authoritative' };
export type TokenData = { plans: TokenPlan[]; chainEvents: TokenChainEvent[] };
const key = 'wdex-issuer-token-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const empty = (): TokenData => ({ plans: [], chainEvents: [] });
export function readTokenData(tenant: DemoTenant): TokenData | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  try {
    const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, TokenData>;
    const data = all[bucket] || empty();
    return structuredClone({ plans: (data.plans || []).filter(item => item.tenantId === tenant.id),
      chainEvents: (data.chainEvents || []).filter(item => item.tenantId === tenant.id && item.source === 'authoritative') });
  } catch { return null; }
}
export function tokenPlanContext(tenant: DemoTenant, instrument: InstrumentRecord, version: number) {
  const portfolio = readPortfolio(tenant);
  const asset = portfolio.assets.find(item => item.id === instrument.assetId);
  const fixed = instrument.versions.find(item => item.number === version);
  if (!asset || !fixed) return null;
  const mapping = tokenMapping(fixed.fields);
  return { asset, instrument, fixed, mapping,
    offerings: portfolio.offerings.filter(item => item.instrumentId === instrument.id && item.instrumentVersion === version) };
}
export function tokenPlanIssues(tenant: DemoTenant, instrument: InstrumentRecord, version: number): string[] {
  const context = tokenPlanContext(tenant, instrument, version);
  if (!context) return ['资产或权益结构版本不存在。'];
  const issues: string[] = [];
  if (context.asset.status !== 'ready' || instrument.status !== 'ready') issues.push('请先完成资产及权益结构资料检查。');
  if (context.mapping.error) issues.push(context.mapping.error);
  if (!context.fixed.fields.subjectName || !context.fixed.fields.legalDocId) issues.push('法律责任主体或核心权益依据待核。');
  issues.push('适用 Token 网络、标准及合约模板尚未取得生产准入。');
  issues.push('法律、模板安全、执行主体及生产授权尚未核实。');
  return issues;
}
export function saveTokenPlanDraft(tenant: DemoTenant, instrumentId: string, version: number, note: string): TokenPlan {
  if (getDemoTenant()?.subscriptionState === 'downgraded') throw Error('当前仅可查看历史 Token 资料，无法新增或修改。');
  const bucket = scope(tenant);
  const instrument = readPortfolio(tenant).instruments.find(item => item.id === instrumentId);
  const context = instrument && tokenPlanContext(tenant, instrument, version);
  if (!bucket || !instrument || instrument.status !== 'ready' || !context || context.asset.status !== 'ready')
    throw Error('请先完成当前企业资产与权益结构的资料检查。');
  if (note.length > 1000) throw Error('方案说明最多 1,000 字。');
  let all: Record<string, TokenData>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, TokenData>; }
  catch { throw Error('原 Token 方案资料无法读取；未保存草稿。'); }
  const data = all[bucket] || empty();
  const existing = data.plans.find(item => item.instrumentId === instrumentId && item.instrumentVersion === version);
  if (existing?.versions.at(-1)?.note === note.trim()) return structuredClone(existing);
  const now = Date.now();
  const by = getDemoAuth()?.email || '';
  if (existing) {
    if (existing.deployment !== 'not-requested') throw Error('已部署版本不能覆盖；请走受控新版本流程。');
    existing.versions.push({ number: existing.versions.length + 1, note: note.trim(), at: now, by });
    existing.events.push({ at: now, label: '更新业务准备资料', by });
  } else {
    data.plans.push({ id: `${tenant.id}-token-plan-${instrumentId}-v${version}`, tenantId: tenant.id,
      assetId: instrument.assetId, instrumentId, instrumentVersion: version,
      status: 'draft', deployment: 'not-requested', versions: [{ number: 1, note: note.trim(), at: now, by }],
      events: [{ at: now, label: '创建业务准备草稿', by }] });
  }
  all[bucket] = data;
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(data.plans.find(item => item.instrumentId === instrumentId && item.instrumentVersion === version)!);
}
export function ensureSandboxTokenPlan(tenant: DemoTenant): TokenPlan | null {
  if (getDemoTenant()?.subscriptionState === 'downgraded') return null;
  const data = readTokenData(tenant);
  if (!data) throw Error('原 Token 方案资料无法读取；未准备示例数据。');
  const order = (readOrders(tenant) || []).find(item => item.tenantId === tenant.id && item.source === 'internal-sandbox');
  if (!order) return null;
  const portfolio = readPortfolio(tenant);
  const offering = portfolio.offerings.find(item => item.id === order.offeringId && item.assetId === order.assetId);
  const instrument = offering && portfolio.instruments.find(item => item.id === offering.instrumentId);
  if (!offering || !instrument || instrument.status !== 'ready' || !tokenPlanContext(tenant, instrument, offering.instrumentVersion)) return null;
  const existing = data.plans.find(item => item.instrumentId === instrument.id && item.instrumentVersion === offering.instrumentVersion);
  if (existing) return existing;
  return saveTokenPlanDraft(tenant, instrument.id, offering.instrumentVersion,
    '依据当前权益结构版本和发行安排准备 Token 方案；网络、标准、模板及受权执行主体尚待核验。');
}
export type DeliveryCandidate = { allocationId: string; orderId: string; offeringId: string; instrumentId: string;
  instrumentVersion: number; tokenQuantity: string; funds: 'final-matched' | 'pending' | 'unknown';
  registration: string; planId?: string; blockers: string[] };
export function tokenDeliveryCandidates(tenant: DemoTenant): DeliveryCandidate[] {
  const allocation = readAllocationData(tenant);
  const funds = readFundsData(tenant);
  const plans = readTokenData(tenant)?.plans || [];
  if (!allocation || !funds) return [];
  return allocation.allocations.filter(item => item.tenantId === tenant.id).map(item => {
    const receipt = funds.receipts.find(row => row.orderId === item.orderId && row.offeringId === item.offeringId && row.finality === 'final' && row.match === 'matched');
    const holder = allocation.holders.find(row => row.allocationId === item.id);
    const plan = plans.find(row => row.instrumentId === item.instrumentId && row.instrumentVersion === item.instrumentVersion);
    const blockers = [
      ...(item.state !== 'confirmed' || !item.decisionRef ? ['唯一有效配售决定待核。'] : []),
      ...(!receipt ? ['资金最终匹配结果待核。'] : []),
      ...(!holder || holder.registration !== 'effective' ? ['适用法定登记顺序与主体待核。'] : []),
      ...(!plan ? ['Token 方案尚未准备。'] : []),
      '真实合约部署、接收钱包、Signer 与生产准入尚未确认。',
    ];
    return { allocationId: item.id, orderId: item.orderId, offeringId: item.offeringId,
      instrumentId: item.instrumentId, instrumentVersion: item.instrumentVersion, tokenQuantity: item.tokenQuantity,
      funds: receipt ? 'final-matched' as const : 'unknown' as const, registration: holder?.registration || 'none',
      planId: plan?.id, blockers };
  });
}
