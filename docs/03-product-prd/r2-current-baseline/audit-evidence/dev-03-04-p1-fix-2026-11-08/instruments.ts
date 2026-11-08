import { useSyncExternalStore } from 'react';
import { attachInstrument, currentDocument, getAsset, type DocumentRecord, type Issue, type ScanState } from './assets';

export type InstrumentType = 'equity' | 'debt' | 'income';
export const typeLabel: Record<InstrumentType, string> = { equity: '股权', debt: '债权', income: '收益参与权' };
export const coreLabel: Record<InstrumentType, string> = { equity: '股权权益协议或适用权利证明', debt: '债权协议或债权形成证明', income: '收益参与协议' };
export type FileReference = { fileId: string; versionId: string; label: string };
export type InstrumentFields = { obligor: string; rights: string; legalEntity: string; holderRights: string; debtor: string; interest: string; rate: string; interestStart: string; maturity: string; incomeSource: string; incomeBasis: string; incomeTerm: string; incomeFrequency: string };
export type InstrumentSnapshot = { version: number; at: string; type: InstrumentType; name: string; fields: InstrumentFields; totalRights: string; tokenCount: string; documents: DocumentRecord[]; assetReferences: FileReference[]; reviewedAssetVersions?: Record<string, string>; status: 'draft' | 'ready' };
export type Instrument = { id: string; tenant: string; assetId: string; type: InstrumentType; name: string; status: 'draft' | 'ready'; fields: InstrumentFields; totalRights: string; tokenCount: string; documents: DocumentRecord[]; assetReferences: FileReference[]; reviewedAssetVersions?: Record<string, string>; version: number; updatedAt: string; history: InstrumentSnapshot[]; linkedOfferings: string[] };
const emptyFields = (): InstrumentFields => ({ obligor: '', rights: '', legalEntity: '', holderRights: '', debtor: '', interest: '', rate: '', interestStart: '', maturity: '', incomeSource: '', incomeBasis: '', incomeTerm: '', incomeFrequency: '' });
export const newInstrument = (tenant: string, assetId: string, type: InstrumentType = 'equity'): Instrument => ({ id: crypto.randomUUID(), tenant, assetId, type, name: '', status: 'draft', fields: emptyFields(), totalRights: '', tokenCount: '', documents: [], assetReferences: [], version: 0, updatedAt: '', history: [], linkedOfferings: [] });
export type AffectedReference = { fileId: string; label: string; referencedVersion: number | null; currentVersion: number | null; currentVersionId: string | null; currentScan: ScanState | null };
export function affectedAssetReferences(item: Instrument): AffectedReference[] {
  const asset = getAsset(item.tenant, item.assetId);
  return item.assetReferences.flatMap(ref => {
    const record = asset?.documents.find(doc => doc.id === ref.fileId);
    const current = record && currentDocument(record);
    const referenced = record?.versions.find(version => version.id === ref.versionId);
    const reviewed = item.reviewedAssetVersions?.[ref.fileId] || ref.versionId;
    return current?.id !== reviewed ? [{ fileId: ref.fileId, label: ref.label, referencedVersion: referenced?.version ?? null, currentVersion: current?.version ?? null, currentVersionId: current?.id ?? null, currentScan: current?.scan ?? null }] : [];
  });
}

type Split = { value?: string; error?: string };
export function exactSplit(total: string, count: string, type: InstrumentType): Split {
  if (!total.trim() || !count.trim()) return {};
  if (!/^(?:\d+)(?:\.\d+)?$/.test(total.trim()) || !/^\d+$/.test(count.trim())) return { error: '请输入有效的权益总量和 Token 正整数份数。' };
  const [whole, fraction = ''] = total.trim().split('.');
  const numerator = BigInt(whole + fraction); const denominator = BigInt(count.trim());
  if (numerator <= 0n || denominator <= 0n || denominator > BigInt(Number.MAX_SAFE_INTEGER)) return { error: '权益总量和 Token 份数须大于 0，份数不得超过安全整数范围。' };
  if (type === 'equity' && (fraction.length > 0 || numerator % denominator !== 0n)) return { error: '普通股须按整股精确拆分；请调整普通股数或 Token 份数。' };
  if (type === 'income' && numerator > 100n * 10n ** BigInt(fraction.length)) return { error: '收益参与比例须大于 0% 且不超过 100%。' };
  let a = numerator; let b = denominator * 10n ** BigInt(fraction.length);
  const gcd = (x: bigint, y: bigint): bigint => y === 0n ? x : gcd(y, x % y);
  const factor = gcd(a, b); a /= factor; b /= factor;
  let twos = 0; let fives = 0;
  while (b % 2n === 0n) { b /= 2n; twos++; }
  while (b % 5n === 0n) { b /= 5n; fives++; }
  if (b !== 1n) return { error: '当前总量无法按 Token 份数精确拆分；请调整两项数值。' };
  const scale = Math.max(twos, fives);
  const scaled = a * 2n ** BigInt(scale - twos) * 5n ** BigInt(scale - fives);
  const raw = scaled.toString().padStart(scale + 1, '0');
  return { value: scale ? raw.slice(0, -scale) + '.' + raw.slice(-scale).replace(/0+$/, '') : raw };
}
const add = (list: Issue[], field: string, message: string, step = 0) => list.push({ step, field, message });
export function instrumentIssues(item: Instrument, ready: boolean): Issue[] {
  const issues: Issue[] = []; const f = item.fields;
  if (!item.name.trim()) add(issues, '权益结构名称', '请填写权益结构名称。');
  if (item.totalRights && !exactSplit(item.totalRights, item.tokenCount || '1', item.type).value) add(issues, '权益总规模', exactSplit(item.totalRights, item.tokenCount || '1', item.type).error || '请输入有效权益总规模。', 1);
  if (item.tokenCount && !/^\d+$/.test(item.tokenCount.trim())) add(issues, 'Token 份数', 'Token 份数须为正整数。', 1);
  if (item.tokenCount && item.totalRights && exactSplit(item.totalRights, item.tokenCount, item.type).error) add(issues, 'Token 拆分', exactSplit(item.totalRights, item.tokenCount, item.type).error || '', 1);
  if (f.rate && (!/^\d+(?:\.\d+)?$/.test(f.rate) || Number(f.rate) < 0 || Number(f.rate) > 100)) add(issues, '固定年利率', '年利率须在 0%～100% 之间。');
  if (f.interestStart && f.maturity && f.interestStart >= f.maturity) add(issues, '到期日期', '到期日期须晚于起息日期。');
  if (!ready) return issues;
  if (!f.obligor.trim()) add(issues, '权利责任主体', '请填写权利责任主体。');
  if (!f.rights.trim()) add(issues, '投资者获得的权利', '请说明投资者获得的权利及范围。');
  if (item.type === 'equity') {
    if (!f.legalEntity.trim()) add(issues, '对应法律实体', '请填写对应法律实体。');
    if (!f.holderRights.trim()) add(issues, '股东／持有人权利说明', '请说明股东或持有人的权利。');
  } else if (item.type === 'debt') {
    if (!f.debtor.trim()) add(issues, '债务主体', '请填写债务主体。');
    if (!f.interest) add(issues, '利息方式', '请选择利息方式。');
    if (f.interest === 'fixed') { if (!f.rate) add(issues, '固定年利率', '请填写固定年利率。'); if (!f.interestStart) add(issues, '起息日期', '请选择起息日期。'); }
    if (!f.maturity) add(issues, '到期日期', '请选择到期日期。');
  } else {
    if (!f.incomeSource.trim()) add(issues, '收益来源', '请填写收益来源。');
    if (!f.incomeBasis.trim()) add(issues, '收益计算口径', '请说明收入和适用费用扣除范围。');
    if (!f.incomeTerm.trim()) add(issues, '权益期限', '请填写权益期限。');
    if (!f.incomeFrequency) add(issues, '分配频率', '请选择分配频率。');
  }
  if (!item.totalRights) add(issues, '权益总规模', '请填写纳入本权益结构的权益总规模。', 1);
  if (!item.tokenCount) add(issues, 'Token 份数', '请填写计划拆分的 Token 份数。', 1);
  const core = item.documents.find(record => record.category === 'core-' + item.type);
  const version = core && currentDocument(core);
  if (!version) add(issues, coreLabel[item.type], '请上传' + coreLabel[item.type] + '。', 2);
  else if (version.scan !== 'passed') add(issues, coreLabel[item.type], version.scan === 'pending' ? '核心文件待安全扫描。' : '核心文件扫描失败，请更换。', 2);
  const asset = getAsset(item.tenant, item.assetId);
  if (!asset || asset.status !== 'ready') add(issues, '关联资产', '关联资产资料须先达到完备状态。');
  for (const ref of item.assetReferences) {
    const record = asset?.documents.find(doc => doc.id === ref.fileId); const found = record?.versions.find(doc => doc.id === ref.versionId);
    if (!found || found.scan !== 'passed') add(issues, '资产文件引用', '引用的资产文件版本已不可用或未通过扫描。', 2);
    const current = record && currentDocument(record);
    if (current && current.scan !== 'passed') add(issues, '资产文件引用', '资产文件当前版本尚未通过安全扫描，请先处理后再复核。', 2);
  }
  return issues;
}
export function instrumentReadyForNextStep(item: Instrument): boolean {
  return item.status === 'ready' && instrumentIssues(item, true).length === 0 && affectedAssetReferences(item).length === 0;
}
const key = 'wdex-issuer-r2-instruments-v1';
const load = (): Record<string, Instrument[]> => { try { return JSON.parse(sessionStorage.getItem(key) || '{}') as Record<string, Instrument[]>; } catch { return {}; } };
let records = load(); const listeners = new Set<() => void>(); const empty: Instrument[] = [];
const emit = (tenant: string, next: Instrument[]) => { records = { ...records, [tenant]: next }; sessionStorage.setItem(key, JSON.stringify(records)); listeners.forEach(listener => listener()); };
export const listInstruments = (tenant: string) => records[tenant] || empty;
export const useInstruments = (tenant: string) => useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => listInstruments(tenant));
export const getInstrument = (tenant: string, assetId: string) => listInstruments(tenant).find(item => item.assetId === assetId);
export function saveInstrument(tenant: string, input: Instrument): { item?: Instrument; error?: string } {
  if (!tenant || input.tenant !== tenant) return { error: '企业关联无效。' };
  const asset = getAsset(tenant, input.assetId); if (!asset || asset.status !== 'ready') return { error: '请先完成关联资产的资料检查。' };
  const issues = instrumentIssues(input, false); if (issues.length) return { error: issues[0].message };
  const items = listInstruments(tenant); const existing = items.find(item => item.assetId === input.assetId);
  if (existing && existing.id !== input.id) return { error: '该资产已有一项权益结构，不能重复创建。' };
  if (existing?.linkedOfferings?.length) return { error: '该权益结构已有发行引用，关键条款需先完成版本变更审查。' };
  if (existing?.status === 'ready' && existing.type !== input.type) return { error: '已完备的权益结构不能直接切换权益类型。' };
  const unchanged = existing && JSON.stringify({ type: existing.type, name: existing.name, fields: existing.fields, totalRights: existing.totalRights, tokenCount: existing.tokenCount, documents: existing.documents, assetReferences: existing.assetReferences }) === JSON.stringify({ type: input.type, name: input.name.trim(), fields: input.fields, totalRights: input.totalRights, tokenCount: input.tokenCount, documents: input.documents, assetReferences: input.assetReferences });
  if (existing && unchanged) return { item: existing };
  const at = new Date().toISOString(); const version = (existing?.version || 0) + 1;
  const history = existing ? [...existing.history, { version: existing.version, at: existing.updatedAt, type: existing.type, name: existing.name, fields: structuredClone(existing.fields), totalRights: existing.totalRights, tokenCount: existing.tokenCount, documents: structuredClone(existing.documents), assetReferences: structuredClone(existing.assetReferences), reviewedAssetVersions: existing.reviewedAssetVersions && { ...existing.reviewedAssetVersions }, status: existing.status } as InstrumentSnapshot] : [];
  const item: Instrument = { ...input, name: input.name.trim(), version, updatedAt: at, history, status: 'draft', linkedOfferings: existing?.linkedOfferings || [] };
  if (!attachInstrument(tenant, input.assetId, item.id)) return { error: '该资产已有其他权益结构。' };
  emit(tenant, existing ? items.map(old => old.id === item.id ? item : old) : [...items, item]); return { item };
}
export function markInstrumentReady(tenant: string, assetId: string): Issue[] {
  const item = getInstrument(tenant, assetId); if (!item) return [{ step: 0, field: '权益结构', message: '权益结构不存在。' }];
  const issues = instrumentIssues(item, true); if (issues.length) return issues;
  const asset = getAsset(tenant, assetId);
  const reviewedAssetVersions = Object.fromEntries(item.assetReferences.map(ref => [ref.fileId, asset?.documents.find(doc => doc.id === ref.fileId)?.currentVersionId || ref.versionId]));
  emit(tenant, listInstruments(tenant).map(old => old.id === item.id ? { ...old, status: 'ready', reviewedAssetVersions } : old)); return [];
}
export function setInstrumentScan(tenant: string, assetId: string, scan: ScanState): boolean {
  const item = getInstrument(tenant, assetId); if (!item) return false;
  const documents = item.documents.map(record => ({ ...record, versions: record.versions.map(version => version.id === record.currentVersionId && version.scan === 'pending' ? { ...version, scan } : version) }));
  if (JSON.stringify(documents) === JSON.stringify(item.documents)) return false;
  emit(tenant, listInstruments(tenant).map(old => old.id === item.id ? { ...old, documents, status: 'draft' } : old)); return true;
}
