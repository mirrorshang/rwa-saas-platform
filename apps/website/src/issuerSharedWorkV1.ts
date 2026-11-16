import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { getKybRecord } from './issuerKybFlow';
import { latest, readPortfolio } from './issuerPortfolioV1';
import { deriveFundsIssues, readFundsData } from './issuerFundsV1';
import { readAllocationIssues } from './issuerAllocationV1';

export type SharedItem = { id: string; module: string; title: string; kind: string;
  state: 'pending' | 'waiting' | 'unknown' | 'done'; detail: string; nextStep: string;
  path: string; updatedAt: number; sourceId: string };
export type SharedNotice = SharedItem & { read: boolean };
const noticeKey = 'wdex-issuer-shared-notice-read-v1';
const noticeHistoryKey = 'wdex-issuer-shared-notice-history-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const portfolioItems = (tenant: DemoTenant): SharedItem[] => {
  const portfolio = readPortfolio(tenant);
  const items: SharedItem[] = [];
  for (const asset of portfolio.assets.filter(item => item.status === 'draft')) items.push({
    id: `asset-${asset.id}`, module: '资产与发行', title: `完善资产资料 · ${latest(asset).fields.name || asset.number}`,
    kind: '资产资料', state: 'pending', detail: '资产资料尚未完成就绪检查。', nextStep: '继续编辑并检查必需文件。',
    path: `/issuer/assets/${asset.id}`, updatedAt: asset.events.at(-1)?.at || 0, sourceId: asset.id,
  });
  for (const asset of portfolio.assets.filter(item => item.status === 'ready')) items.push({
    id: `asset-${asset.id}`, module: '资产与发行', title: `资产资料已就绪 · ${latest(asset).fields.name || asset.number}`,
    kind: '资产资料', state: 'done', detail: '资产资料已通过当前前端就绪检查；实际法律与发行条件仍需独立核验。',
    nextStep: '查看资产详情。', path: `/issuer/assets/${asset.id}`,
    updatedAt: asset.events.at(-1)?.at || 0, sourceId: asset.id,
  });
  for (const instrument of portfolio.instruments.filter(item => item.status === 'draft')) items.push({
    id: `instrument-${instrument.id}`, module: '资产与发行', title: `核对权益结构 · ${latest(instrument).fields.name || instrument.number}`,
    kind: '权益结构', state: 'pending', detail: '权益映射与法律依据仍需完成资料检查。', nextStep: '返回权益结构核对字段和文件。',
    path: `/issuer/instruments/${instrument.id}`, updatedAt: instrument.events.at(-1)?.at || 0, sourceId: instrument.id,
  });
  for (const instrument of portfolio.instruments.filter(item => item.status === 'ready')) items.push({
    id: `instrument-${instrument.id}`, module: '资产与发行', title: `权益结构资料已就绪 · ${latest(instrument).fields.name || instrument.number}`,
    kind: '权益结构', state: 'done', detail: '权益结构已通过当前前端资料检查；Token 部署与真实发行另需准入。',
    nextStep: '查看权益结构详情。', path: `/issuer/instruments/${instrument.id}`,
    updatedAt: instrument.events.at(-1)?.at || 0, sourceId: instrument.id,
  });
  for (const offering of portfolio.offerings.filter(item => item.status === 'draft')) items.push({
    id: `offering-${offering.id}`, module: '资产与发行', title: `核对发行方案 · ${latest(offering).fields.name || offering.number}`,
    kind: 'Offering 准备', state: 'pending', detail: '发行方案仍为内部草稿，不能作为已发布发行。', nextStep: '检查发行条款、文件及预览。',
    path: `/issuer/offerings/${offering.id}`, updatedAt: offering.events.at(-1)?.at || 0, sourceId: offering.id,
  });
  return items;
};
export function readSharedWork(tenant: DemoTenant): { tasks: SharedItem[]; issues: SharedItem[] } | null {
  if (!scope(tenant)) return null;
  const kyb = getKybRecord(tenant);
  const tasks: SharedItem[] = [];
  const issues: SharedItem[] = [];
  if (kyb.status !== 'passed') tasks.push({ id: `kyb-${tenant.id}`, module: '企业管理', title:
    kyb.status === 'draft' ? '继续企业认证' : kyb.status === 'supplement' ? '补充企业认证资料' :
      kyb.status === 'rejected' ? '修改企业认证资料' : '查看企业认证进度',
    kind: '企业认证', state: ['submitted', 'reviewing'].includes(kyb.status) ? 'waiting' : 'pending',
    detail: kyb.reviewNotes || '企业认证状态以当前提交记录为准。',
    nextStep: ['submitted', 'reviewing'].includes(kyb.status) ? '查看原提交进度。' : '返回认证资料继续填写。',
    path: '/issuer/company', updatedAt: kyb.savedAt || 0, sourceId: tenant.id });
  if (kyb.status !== 'passed') return { tasks, issues };
  tasks.push(...portfolioItems(tenant).filter(item => tenant.subscriptionState !== 'downgraded' || item.state === 'done'));
  if (tenant.plan === 'Standard' || tenant.subscriptionState === 'downgraded') {
    const funds = readFundsData(tenant);
    for (const item of funds ? deriveFundsIssues(funds).filter(issue => issue.tenantId === tenant.id) : []) {
      const projected: SharedItem = { id: item.id, module: '资金与结算', title: item.title, kind: '资金核对',
        state: item.state === 'unknown' ? 'unknown' : item.state === 'checking' ? 'waiting' : 'pending',
        detail: `关联到账 ${item.receiptId}；金额 ${item.amount} U。`, nextStep: tenant.subscriptionState === 'downgraded' ? '查看原业务与未结义务；普通业务编辑已停止。' : item.nextStep,
        path: `/issuer/receipts/receipt/${item.receiptId}`, updatedAt: item.updatedAt, sourceId: item.receiptId };
      issues.push(projected); tasks.push(projected);
    }
    for (const item of (readAllocationIssues(tenant) || []).filter(issue => issue.tenantId === tenant.id)) {
      const projected: SharedItem = { id: item.id, module: '投资者与认购', title: item.title, kind: '配售与登记',
        state: item.state === 'unknown' ? 'unknown' : item.state === 'checking' ? 'waiting' : 'pending',
        detail: item.reason, nextStep: tenant.subscriptionState === 'downgraded' ? '查看原业务与未结义务；普通业务编辑已停止。' : item.nextStep, path: `/issuer/allocation-holders/issue/${item.id}`,
        updatedAt: item.updatedAt, sourceId: item.offeringId };
      issues.push(projected); tasks.push(projected);
    }
  }
  const sort = (a: SharedItem, b: SharedItem) => (a.state === 'unknown' ? -1 : 0) - (b.state === 'unknown' ? -1 : 0) || b.updatedAt - a.updatedAt;
  return { tasks: tasks.sort(sort), issues: issues.sort(sort) };
}
function readNoticeState(tenant: DemoTenant): Record<string, string[]> | null {
  if (!scope(tenant)) return null;
  try {
    const all = JSON.parse(localStorage.getItem(noticeKey) || '{}') as Record<string, unknown>;
    const bucket = scope(tenant)!;
    if (!all || typeof all !== 'object' || Array.isArray(all) ||
      all[bucket] !== undefined && (!Array.isArray(all[bucket]) || !(all[bucket] as unknown[]).every(item => typeof item === 'string'))) return null;
    return all as Record<string, string[]>;
  }
  catch { return null; }
}
function readNoticeHistory(tenant: DemoTenant): Record<string, SharedItem[]> | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  try {
    const all = JSON.parse(localStorage.getItem(noticeHistoryKey) || '{}') as Record<string, unknown>;
    if (!all || typeof all !== 'object' || Array.isArray(all) ||
      all[bucket] !== undefined && (!Array.isArray(all[bucket]) || !(all[bucket] as unknown[]).every(item =>
        Boolean(item && typeof item === 'object' && 'id' in item && 'path' in item)))) return null;
    return all as Record<string, SharedItem[]>;
  } catch { return null; }
}
export function ensureSharedNoticeHistory(tenant: DemoTenant): boolean {
  const work = readSharedWork(tenant);
  const history = readNoticeHistory(tenant);
  const bucket = scope(tenant);
  if (!work || !history || !bucket) return false;
  const existing = history[bucket] || [];
  const next = work.tasks.map(item => ({ ...item, id: `${item.id}@${item.updatedAt}@${item.state}` }));
  const additions = next.filter(item => !existing.some(record => record.id === item.id));
  if (additions.length) {
    history[bucket] = [...existing, ...additions];
    localStorage.setItem(noticeHistoryKey, JSON.stringify(history));
  }
  return true;
}
export function readSharedNotices(tenant: DemoTenant): SharedNotice[] | null {
  const work = readSharedWork(tenant);
  const all = readNoticeState(tenant);
  const history = readNoticeHistory(tenant);
  const bucket = scope(tenant);
  if (!work || !all || !history || !bucket) return null;
  const existing = history[bucket] || [];
  const current = work.tasks.map(item => ({ ...item, id: `${item.id}@${item.updatedAt}@${item.state}` }));
  const combined = [...existing, ...current.filter(item => !existing.some(record => record.id === item.id))];
  return combined.map(item => ({ ...item,
    read: (all[bucket] || []).includes(item.id) || (all[bucket] || []).includes(item.id.split('@')[0]) }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
export function markSharedNoticeRead(tenant: DemoTenant, ids: string[]): void {
  const all = readNoticeState(tenant);
  const bucket = scope(tenant);
  const notices = readSharedNotices(tenant);
  if (!all || !bucket || !notices) throw Error('消息阅读状态暂不可保存，原记录已保留。');
  const permitted = new Set(notices.map(item => item.id));
  if (ids.some(id => !permitted.has(id))) throw Error('该消息不存在或无权访问。');
  all[bucket] = [...new Set([...(all[bucket] || []), ...ids])];
  localStorage.setItem(noticeKey, JSON.stringify(all));
}
