import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { readPortfolio } from './issuerPortfolioV1';
import { parseU } from './issuerFundsV1';
import { readOrders } from './issuerOrdersV1';
import { readAllocationData } from './issuerAllocationV1';

export type YieldDraftFields = {
  instrumentId: string; instrumentVersion: number; offeringId: string;
  periodStart: string; periodEnd: string; recordDate: string; amount: string;
  noIncome: boolean; noIncomeReason: string; basisRef: string; calculationNote: string; decisionRef: string;
};
export type YieldDraft = { id: string; tenantId: string; assetId: string; kind: 'income' | 'equity'; status: 'draft';
  versions: { number: number; fields: YieldDraftFields; at: number; by: string }[];
  source: 'internal-sandbox' };
export type YieldPreview = { draftId: string; offeringId: string; instrumentId: string; instrumentVersion: number;
  recordDate: string; amount: string; rightsUnit: string; totalRights: string; unallocated: string;
  excluded: number; lines: { holderRef: string; displayName: string; rights: string; amount: string }[];
  issues: string[]; source: 'internal-sandbox' };
const key = 'wdex-issuer-yield-draft-v1';
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export const blankYieldDraft = (): YieldDraftFields => ({ instrumentId: '', instrumentVersion: 0, offeringId: '',
  periodStart: '', periodEnd: '', recordDate: '', amount: '', noIncome: false, noIncomeReason: '',
  basisRef: '', calculationNote: '', decisionRef: '' });
export function exampleYieldDraftForOffering(tenant: DemoTenant, offeringId: string): YieldDraftFields | null {
  const portfolio = readPortfolio(tenant);
  const offering = portfolio.offerings.find(item => item.id === offeringId);
  const instrument = portfolio.instruments.find(item => item.id === offering?.instrumentId);
  const fixed = instrument?.versions.find(item => item.number === offering?.instrumentVersion)?.fields;
  if (!offering || !instrument || !fixed || !['income', 'equity'].includes(fixed.type)) return null;
  const start = fixed.startDate || '2027-01-01';
  const target = new Date(`${start}T00:00:00Z`);
  target.setUTCDate(target.getUTCDate() + 29);
  const end = fixed.endDate && fixed.endDate < target.toISOString().slice(0, 10) ? fixed.endDate : target.toISOString().slice(0, 10);
  return { instrumentId: instrument.id, instrumentVersion: offering.instrumentVersion, offeringId: offering.id,
    periodStart: start, periodEnd: end, recordDate: end, amount: '5000', noIncome: false, noIncomeReason: '',
    basisRef: `SB-TERMS-${instrument.id}`, calculationNote: '本期资料金额依据合同所载收益范围与费用扣除口径准备，正式应付仍待核验。',
    decisionRef: fixed.type === 'equity' ? 'SB-DECISION-PENDING-001' : '' };
}
export function readYieldDrafts(tenant: DemoTenant): YieldDraft[] | null {
  const bucket = scope(tenant);
  if (!bucket) return null;
  try {
    const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, YieldDraft[]>;
    return structuredClone((all[bucket] || []).filter(item => item.tenantId === tenant.id));
  } catch { return null; }
}
export function yieldDraftIssues(tenant: DemoTenant, fields: YieldDraftFields, currentId?: string): string[] {
  const portfolio = readPortfolio(tenant);
  const offering = portfolio.offerings.find(item => item.id === fields.offeringId);
  const instrument = portfolio.instruments.find(item => item.id === fields.instrumentId);
  const fixed = instrument?.versions.find(item => item.number === fields.instrumentVersion);
  const issues: string[] = [];
  if (!offering || !instrument || !fixed || offering.instrumentId !== instrument.id || offering.instrumentVersion !== fields.instrumentVersion ||
    !['income', 'equity'].includes(fixed.fields.type)) issues.push('请选择关联且版本一致的收益参与权或股权发行方案。');
  if (!validDate(fields.periodStart) || !validDate(fields.periodEnd) || fields.periodEnd < fields.periodStart)
    issues.push('请填写有效的收益期间，结束日不得早于开始日。');
  if (fixed?.fields.startDate && fields.periodStart < fixed.fields.startDate || fixed?.fields.endDate && fields.periodEnd > fixed.fields.endDate)
    issues.push('收益期间须落在当前权益结构的适用期限内。');
  if (!validDate(fields.recordDate)) issues.push('请填写有效的待核验 Record Date。');
  const amount = parseU(fields.amount);
  if (amount === null) issues.push('金额须为非负数，最多 6 位小数。');
  if (fields.noIncome && (fixed?.fields.type !== 'income' || amount !== 0n || fields.noIncomeReason.trim().length < 10))
    issues.push('无收益声明仅适用于收益参与权，金额须为 0 并填写至少 10 字原因。');
  if (!fields.noIncome && (amount === null || amount <= 0n)) issues.push('非无收益声明的本期金额须大于 0。');
  if (!fields.basisRef.trim()) issues.push('请填写合同或决议依据引用。');
  if (fields.calculationNote.trim().length < 10 || fields.calculationNote.length > 1000) issues.push('金额口径说明须为 10–1,000 字。');
  if (fixed?.fields.type === 'equity' && !fields.decisionRef.trim()) issues.push('股权股息草稿须填写有权公司决议引用。');
  const duplicates = readYieldDrafts(tenant)?.some(item => item.id !== currentId && item.status === 'draft' &&
    item.versions.at(-1)?.fields.offeringId === fields.offeringId && item.versions.at(-1)?.fields.periodStart === fields.periodStart &&
    item.versions.at(-1)?.fields.periodEnd === fields.periodEnd);
  if (duplicates) issues.push('同一发行方案与收益期间已有草稿，请编辑原记录。');
  return issues;
}
export function saveYieldDraft(tenant: DemoTenant, fields: YieldDraftFields, currentId?: string): YieldDraft {
  const bucket = scope(tenant);
  if (!bucket) throw Error('当前企业访问已失效，请重新登录。');
  if (getDemoTenant()?.plan !== 'Standard') throw Error('当前套餐仅可查看历史收益资料，无法新增或修改。');
  const issues = yieldDraftIssues(tenant, fields, currentId);
  if (issues.length) throw Error(issues.join('；'));
  let all: Record<string, YieldDraft[]>;
  try { all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, YieldDraft[]>; }
  catch { throw Error('原收益草稿无法读取；未保存新资料。'); }
  const list = all[bucket] || [];
  const current = currentId ? list.find(item => item.id === currentId && item.tenantId === tenant.id) : undefined;
  if (currentId && !current) throw Error('原收益草稿不存在或无权编辑。');
  if (current && (current.versions.at(-1)?.fields.instrumentId !== fields.instrumentId || current.versions.at(-1)?.fields.offeringId !== fields.offeringId))
    throw Error('已保存草稿的关联权益结构与发行方案不能更换；请另建草稿。');
  if (current && JSON.stringify(current.versions.at(-1)?.fields) === JSON.stringify(fields)) return structuredClone(current);
  const now = Date.now();
  const by = getDemoAuth()?.email || '';
  const portfolio = readPortfolio(tenant);
  const instrument = portfolio.instruments.find(item => item.id === fields.instrumentId)!;
  const kind = instrument.versions.find(item => item.number === fields.instrumentVersion)!.fields.type as 'income' | 'equity';
  if (current) current.versions.push({ number: current.versions.length + 1, fields: structuredClone(fields), at: now, by });
  else list.push({ id: `${tenant.id}-yield-draft-${now}-${list.length + 1}`, tenantId: tenant.id,
    assetId: instrument.assetId, kind, status: 'draft', versions: [{ number: 1, fields: structuredClone(fields), at: now, by }],
    source: 'internal-sandbox' });
  all[bucket] = list;
  localStorage.setItem(key, JSON.stringify(all));
  return structuredClone(current || list.at(-1)!);
}
export function ensureSandboxYieldDraft(tenant: DemoTenant): YieldDraft | null {
  if (getDemoTenant()?.plan !== 'Standard') return null;
  const existing = readYieldDrafts(tenant);
  if (!existing) throw Error('原收益草稿无法读取；未准备示例数据。');
  const order = (readOrders(tenant) || []).find(item => item.tenantId === tenant.id && item.source === 'internal-sandbox');
  if (!order) return null;
  const fields = exampleYieldDraftForOffering(tenant, order.offeringId);
  if (!fields) return null;
  return existing.find(item => item.versions.at(-1)?.fields.offeringId === order.offeringId) || saveYieldDraft(tenant, fields);
}

const sixPlaceUnits = (value: string): bigint | null => {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
};
const unitsText = (value: bigint): string => `${value / 1_000_000n}${value % 1_000_000n ? `.${String(value % 1_000_000n).padStart(6, '0').replace(/0+$/, '')}` : ''}`;

// Internal arithmetic preview only: no legal Record Date snapshot, payable, batch or payment is created.
export function previewSandboxYield(tenant: DemoTenant, draftId: string): YieldPreview | null {
  const draft = readYieldDrafts(tenant)?.find(item => item.id === draftId && item.tenantId === tenant.id && item.source === 'internal-sandbox');
  const fields = draft?.versions.at(-1)?.fields;
  if (!draft || !fields) return null;
  const portfolio = readPortfolio(tenant);
  const offering = portfolio.offerings.find(item => item.id === fields.offeringId && item.assetId === draft.assetId);
  const instrument = portfolio.instruments.find(item => item.id === fields.instrumentId && item.assetId === draft.assetId);
  const fixed = instrument?.versions.find(item => item.number === fields.instrumentVersion)?.fields;
  const issues: string[] = [];
  if (!offering || !fixed || offering.instrumentId !== instrument?.id || offering.instrumentVersion !== fields.instrumentVersion || !['income', 'equity'].includes(fixed.type))
    issues.push('关联发行方案或权益结构版本无法核对。');
  const amount = parseU(fields.amount);
  if (amount === null || amount < 0n) issues.push('本期金额精度或格式无效。');
  if (!validDate(fields.recordDate)) issues.push('Record Date 日期无效。');
  const allocation = readAllocationData(tenant);
  if (!allocation) issues.push('内部持有人资料无法读取。');
  const related = (allocation?.holders || []).filter(item => item.tenantId === tenant.id && item.source === 'internal-sandbox' &&
    item.offeringId === fields.offeringId && item.instrumentId === fields.instrumentId && item.instrumentVersion === fields.instrumentVersion);
  const cutoff = validDate(fields.recordDate) ? Date.parse(`${fields.recordDate}T23:59:59.999Z`) : 0;
  const eligible = related.filter(item => item.registration === 'effective' && item.effectiveAt && item.effectiveAt <= cutoff);
  const excluded = related.length - eligible.length;
  if (!eligible.length) issues.push('当前没有可用于内部试算的有效情景登记。');
  const holders = new Map<string, { displayName: string; rights: bigint }>();
  let rightsUnit = '';
  for (const item of eligible) {
    const rights = item.rightsQuantity && sixPlaceUnits(item.rightsQuantity);
    if (!rights || rights <= 0n || !item.rightsUnit || !item.legalSubjectRef) { issues.push('持有人权益单位或主体引用不完整。'); continue; }
    if (rightsUnit && rightsUnit !== item.rightsUnit) { issues.push('持有人权益单位不一致。'); continue; }
    rightsUnit = item.rightsUnit;
    const existing = holders.get(item.legalSubjectRef);
    holders.set(item.legalSubjectRef, { displayName: existing?.displayName || item.displayName, rights: (existing?.rights || 0n) + rights });
  }
  if (fixed && rightsUnit && rightsUnit !== (fixed.type === 'equity' ? '股' : '%')) issues.push('情景登记的权益单位与权益结构类型不一致。');
  const totalRights = [...holders.values()].reduce((sum, item) => sum + item.rights, 0n);
  if (totalRights <= 0n) issues.push('有效权益总量无法计算。');
  const canCalculate = amount !== null && amount >= 0n && totalRights > 0n && !issues.length;
  const lines = canCalculate ? [...holders].map(([holderRef, item]) => ({ holderRef,
    displayName: item.displayName, rights: unitsText(item.rights), amount: unitsText(amount * item.rights / totalRights) })) : [];
  const distributed = lines.reduce((sum, item) => sum + (sixPlaceUnits(item.amount) || 0n), 0n);
  return { draftId, offeringId: fields.offeringId, instrumentId: fields.instrumentId,
    instrumentVersion: fields.instrumentVersion, recordDate: fields.recordDate, amount: fields.amount,
    rightsUnit, totalRights: unitsText(totalRights), unallocated: canCalculate ? unitsText(amount - distributed) : '待核对',
    excluded, lines, issues, source: 'internal-sandbox' };
}
