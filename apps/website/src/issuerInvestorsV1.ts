import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { readPortfolio } from './issuerPortfolioV1';

export type InvestorKyc = 'not_started' | 'reviewing' | 'supplement' | 'passed' | 'rejected' | 'expired' | 'unknown' | 'restricted';
export type InvestorRelationState = 'active' | 'historical' | 'unavailable';
export type InvestorEvent = { status: InvestorKyc; at: number; description: string };
export type InvestorRelation = {
  id: string; ref: string; displayName: string; kind: 'person' | 'organization'; state: InvestorRelationState;
  establishedAt: number; lastActivityAt: number; kyc: InvestorKyc; kycUpdatedAt: number;
  passedAt?: number; expiresAt?: number; events: InvestorEvent[]; assetIds: string[]; offeringIds: string[];
  source: 'internal-fixture';
};

const key = 'wdex-issuer-investors-v1';
const clone = <T,>(value: T): T => structuredClone(value);
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const readAll = (): Record<string, InvestorRelation[]> => {
  try { return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, InvestorRelation[]>; }
  catch { return {}; }
};
const sample = (tenant: DemoTenant): InvestorRelation[] => {
  const portfolio = readPortfolio(tenant);
  const asset = portfolio.assets[0];
  const offering = portfolio.offerings.find(item => item.assetId === asset?.id);
  const anchor = new Date('2026-11-10T10:00:00+08:00').getTime();
  const row = (index: number, displayName: string, kind: InvestorRelation['kind'], kyc: InvestorKyc, state: InvestorRelationState = 'active'): InvestorRelation => ({
    id: `${tenant.id}-investor-${index}`, ref: `IV-${String(index).padStart(4, '0')}`, displayName, kind, state,
    establishedAt: anchor - index * 86400000, lastActivityAt: anchor - index * 3600000,
    kyc, kycUpdatedAt: anchor - index * 3600000,
    passedAt: kyc === 'passed' || kyc === 'expired' ? anchor - 15 * 86400000 : undefined,
    expiresAt: kyc === 'passed' ? anchor + 350 * 86400000 : kyc === 'expired' ? anchor - 86400000 : undefined,
    events: [{ status: kyc, at: anchor - index * 3600000, description: kyc === 'supplement' ? '投资者需按平台提示自行补充资料' : kyc === 'unknown' ? '最新结果待平台确认' : '平台状态摘要已同步' }],
    assetIds: asset && index < 3 ? [asset.id] : [], offeringIds: offering && index < 3 ? [offering.id] : [], source: 'internal-fixture',
  });
  return [row(1, '陈*', 'person', 'passed'), row(2, 'M*** Holdings', 'organization', 'reviewing'),
    row(3, '林*', 'person', 'supplement'), row(4, '周*', 'person', 'expired', 'historical'),
    row(5, '授权不可用', 'person', 'unknown', 'unavailable')];
};
export function readInvestorRelations(tenant: DemoTenant): InvestorRelation[] | null {
  const id = scope(tenant);
  if (!id) return null;
  const all = readAll();
  if (!all[id] && tenant.plan === 'Standard') {
    all[id] = sample(tenant);
    localStorage.setItem(key, JSON.stringify(all));
  }
  return clone(all[id] || []);
}
export function findInvestorRelation(tenant: DemoTenant, id: string): InvestorRelation | null {
  return readInvestorRelations(tenant)?.find(item => item.id === id) || null;
}
export function linkSandboxInvestor(tenant: DemoTenant, id: string, assetId: string, offeringId: string): void {
  const bucket = scope(tenant);
  if (!bucket) throw Error('当前企业访问权限已失效。');
  const all = readAll();
  const record = all[bucket]?.find(item => item.id === id && item.source === 'internal-fixture');
  if (!record) throw Error('当前企业的投资者示例关系不可用。');
  if (!record.assetIds.includes(assetId)) record.assetIds.push(assetId);
  if (!record.offeringIds.includes(offeringId)) record.offeringIds.push(offeringId);
  record.lastActivityAt = Date.now();
  localStorage.setItem(key, JSON.stringify(all));
}
export const kycLabel: Record<InvestorKyc, string> = {
  not_started: '未开始', reviewing: '核验中', supplement: '需补充资料', passed: '已通过',
  rejected: '未通过', expired: '已失效／需重新核验', unknown: '暂不可确认', restricted: '平台限制',
};
export const kycGuidance: Record<InvestorKyc, string> = {
  not_started: '请投资者本人进入投资者门户，按平台指引开始核验。',
  reviewing: '投资者已提交身份资料；请等待平台核验结果。',
  supplement: '请投资者本人登录投资者门户并按平台提示补充资料；企业端不能代为处理。',
  passed: 'KYC 前置条件已满足；认购仍须符合 Offering 当前状态和其他交易条件。',
  rejected: '平台返回未通过结果；如需重新处理，应由投资者按平台指引操作。',
  expired: '当前结果不能用于新的认购；请投资者按平台指引重新核验。',
  unknown: '最新结果暂不可确认，确认前不能继续认购。',
  restricted: '当前暂不可继续认购；请联系平台支持。',
};
