import { isDemoPreview } from './demoEnvironment';
import { assetFileReadiness } from './issuerFiles';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { listInstruments, recheckInstrumentReady } from './issuerInstruments';

// Local demonstration records only. Production asset authority and ACL belong to a server.
export const assetStorageKey = 'wdex-issuer-assets';
export const assetCategories = ['房地产'] as const;
export type AssetCategory = typeof assetCategories[number] | '不动产' | '债权' | '实物资产' | '其他资产' | '';
export type PropertySubtype = '' | 'residential' | 'office' | 'commercial' | 'industrial';
export const propertyLabels: Record<Exclude<PropertySubtype, ''>, string> = { residential: '住宅房地产', office: '办公房地产', commercial: '商业房地产', industrial: '工业及物流房地产' };
export type AssetStatus = 'draft' | 'preparing' | 'ready' | 'restricted' | 'archived';
export const assetStatusLabels: Record<AssetStatus, string> = { draft: '草稿', preparing: '准备中', ready: '资料就绪', restricted: '受限', archived: '已归档' };
export type AssetMaterial = { id: string; category: string; name: string; reference: string };
export type AssetFields = {
  name: string; category: AssetCategory; region: string; summary: string;
  controller: string; controllerType: string; tenantRelation: string; ownershipNote: string;
  detail: string; referenceValue: string; currency: string; referenceDate: string; valueSource: string;
  authorizationLimit: string; authorizationCurrency: string; authorizationBasis: string; authorizationResponsible: string;
  materials: AssetMaterial[];
  propertySubtype?: PropertySubtype; propertyType?: string; propertyDescription?: string;
  country?: string; province?: string; city?: string; district?: string; address?: string;
  area?: string; areaUnit?: 'm²' | 'ft²'; areaBasis?: string; builtYear?: string;
  owner?: string; holder?: string; operator?: string; operationStatus?: string;
  valuationEnabled?: boolean; valuationAgency?: string;
  residential?: { kind: string; totalUnits: string; occupiedUnits: string; unitMix: string; rental: string };
  office?: { kind: string; floors: string; units: string; rentableArea: string; rentedArea: string };
  commercial?: { kind: string; totalShops: string; rentedShops: string; rentableArea: string; rentedArea: string; tenants: string };
  industrial?: { kind: string; use: string; totalArea: string; usedArea: string; floors: string };
};
export type AssetVersion = { number: number; fields: AssetFields; savedAt: number; savedBy: string };
export type Asset = { id: string; tenantId: string; number: string; assetType?: 'real-estate'; subtype?: PropertySubtype; state: AssetStatus; status?: AssetStatus; currentVersionId?: string; versions: AssetVersion[]; readyVersionNumber?: number; events?: { at: number; actor: string; action: string; summary: string }[] };
export type AssetSaveIntent = {
  id: string; tenantId: string; actor: string; assetId: string; expectedVersion: number;
  snapshot: AssetFields; status: 'processing' | 'failed' | 'unknown';
};
type TenantAssets = { assets: Asset[]; intent: AssetSaveIntent | null };
type AssetStore = { accounts: Record<string, Record<string, TenantAssets>> };
export type SaveResult = { status: 'saved' | 'failed' | 'unknown' | 'conflict' | 'denied'; asset?: Asset; intent?: AssetSaveIntent };

export const blankAssetFields = (): AssetFields => ({
  name: '', category: '', region: '', summary: '', controller: '', controllerType: '', tenantRelation: '', ownershipNote: '',
  detail: '', referenceValue: '', currency: '', referenceDate: '', valueSource: '', authorizationLimit: '', authorizationCurrency: '', authorizationBasis: '', authorizationResponsible: '', materials: [],
  propertySubtype: '', propertyType: '', propertyDescription: '', country: '', province: '', city: '', district: '', address: '', area: '', areaUnit: 'm²', areaBasis: '', builtYear: '', owner: '', holder: '', operator: '', operationStatus: '', valuationEnabled: false, valuationAgency: '',
  residential: { kind: '', totalUnits: '', occupiedUnits: '', unitMix: '', rental: '' }, office: { kind: '', floors: '', units: '', rentableArea: '', rentedArea: '' }, commercial: { kind: '', totalShops: '', rentedShops: '', rentableArea: '', rentedArea: '', tenants: '' }, industrial: { kind: '', use: '', totalArea: '', usedArea: '', floors: '' },
});
const clone = <T,>(value: T): T => structuredClone(value);
const readStore = (): AssetStore => {
  if (!isDemoPreview()) return { accounts: {} };
  try {
    const value = JSON.parse(sessionStorage.getItem(assetStorageKey) || 'null') as AssetStore | null;
    return value?.accounts && typeof value.accounts === 'object' ? value : { accounts: {} };
  } catch { return { accounts: {} }; }
};
const writeStore = (value: AssetStore) => sessionStorage.setItem(assetStorageKey, JSON.stringify(value));
const scope = (tenant: DemoTenant, write = false) => {
  if (!isDemoPreview()) return null;
  const auth = getDemoAuth();
  const selected = getDemoTenant();
  const controls = useDemoControls.getState().controls;
  if (!auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.assetAccess !== 'allowed') return null;
  if (write && (selected.role !== '企业管理员' || selected.subscriptionState === 'downgraded')) return null;
  return { email: auth.email, tenantId: selected.id };
};
const tenantData = (value: AssetStore, email: string, tenantId: string): TenantAssets =>
  value.accounts[email]?.[tenantId] || { assets: [], intent: null };
const putTenantData = (value: AssetStore, email: string, tenantId: string, data: TenantAssets) => {
  value.accounts[email] ||= {};
  value.accounts[email][tenantId] = data;
  writeStore(value);
  const tenant = getDemoTenant();
  if (tenant?.id === tenantId) for (const instrument of listInstruments(tenant) || []) {
    if (instrument.assetId && data.assets.some(asset => asset.id === instrument.assetId)) recheckInstrumentReady(tenant, instrument.id);
  }
};

export const canReadAssets = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canWriteAssets = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listAssets(tenant: DemoTenant): Asset[] | null {
  const current = scope(tenant);
  if (!current) return null;
  return clone(tenantData(readStore(), current.email, current.tenantId).assets.filter(item => item.tenantId === tenant.id).map(item => ({ ...item, assetType: item.versions.at(-1)?.fields.category === '房地产' ? 'real-estate' as const : undefined, subtype: item.versions.at(-1)?.fields.propertySubtype || '', status: item.state, currentVersionId: `${item.id}:v${item.versions.at(-1)?.number || 0}` })));
}
export function findAsset(tenant: DemoTenant, assetId: string): Asset | null {
  return listAssets(tenant)?.find(item => item.id === assetId && item.tenantId === tenant.id) || null;
}
export function getAssetSaveIntent(tenant: DemoTenant): AssetSaveIntent | null {
  const current = scope(tenant, true);
  return current ? clone(tenantData(readStore(), current.email, current.tenantId).intent) : null;
}
export function assetMissing(fields: AssetFields): string[] {
  if (fields.category === '房地产') {
    const missing: string[] = [];
    if (!fields.name.trim()) missing.push('资产名称');
    if (!fields.summary.trim()) missing.push('资产描述');
    if (!fields.propertySubtype) missing.push('物业分类');
    if (!fields.country?.trim()) missing.push('国家或地区');
    if (!fields.city?.trim()) missing.push('城市');
    if (!fields.address?.trim()) missing.push('详细地址');
    if (!fields.area?.trim()) missing.push('主要面积');
    if (!fields.areaUnit) missing.push('面积单位');
    if (!fields.areaBasis?.trim()) missing.push('面积口径');
    if (!fields.owner?.trim()) missing.push('资产登记所有人');
    if (!fields.tenantRelation.trim()) missing.push('企业与资产的关系');
    if (!fields.operationStatus?.trim()) missing.push('当前运营状态');
    if (fields.valuationEnabled && (!fields.referenceValue || !fields.referenceDate || !fields.valueSource?.trim())) missing.push('估值金额、日期及依据');
    if (fields.propertySubtype === 'residential') {
      if (!fields.residential?.kind.trim()) missing.push('住宅类型');
      if (fields.residential?.totalUnits && !fields.residential.occupiedUnits) missing.push('已入住套数');
    }
    if (fields.propertySubtype === 'office' && !fields.office?.rentableArea) missing.push('办公可出租面积');
    if (fields.propertySubtype === 'commercial' && !fields.commercial?.rentableArea) missing.push('商业可出租面积');
    if (fields.propertySubtype === 'industrial') {
      if (!fields.industrial?.use.trim()) missing.push('主要使用类型');
      if (!fields.industrial?.totalArea) missing.push('厂房或仓储面积');
    }
    return missing;
  }
  const missing: string[] = [];
  if (!fields.name.trim()) missing.push('资产名称');
  if (!fields.category) missing.push('资产类别');
  if (!fields.controller.trim()) missing.push('资产控制主体');
  if (!fields.tenantRelation.trim()) missing.push('与当前企业的关系');
  if (!fields.ownershipNote.trim()) missing.push('权属或控制关系说明');
  if (!fields.materials.some(item => item.name.trim())) missing.push('证明材料信息');
  return missing;
}
export function assetFieldErrors(fields: AssetFields): string[] {
  const errors: string[] = [];
  const nonnegative = (value?: string) => !value || (/^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)));
  const whole = (value?: string) => !value || (/^\d+$/.test(value) && Number.isSafeInteger(Number(value)));
  if (fields.category === '房地产') {
    if (fields.area && (!nonnegative(fields.area) || Number(fields.area) <= 0)) errors.push('主要面积须为大于0的数字。');
    if (fields.builtYear && (!/^\d{4}$/.test(fields.builtYear) || Number(fields.builtYear) > new Date().getFullYear())) errors.push('建成年份无效。');
    if (fields.propertySubtype === 'residential') { const p = fields.residential; if (!whole(p?.totalUnits) || !whole(p?.occupiedUnits) || Number(p?.occupiedUnits || 0) > Number(p?.totalUnits || 0)) errors.push('已入住套数不能超过住宅总套数，且套数须为整数。'); }
    if (fields.propertySubtype === 'office') { const p = fields.office; if (!whole(p?.floors) || !whole(p?.units) || !nonnegative(p?.rentableArea) || !nonnegative(p?.rentedArea) || Number(p?.rentedArea || 0) > Number(p?.rentableArea || 0)) errors.push('已出租面积不能超过可出租面积，请核对办公数据。'); }
    if (fields.propertySubtype === 'commercial') { const p = fields.commercial; if (!whole(p?.totalShops) || !whole(p?.rentedShops) || !whole(p?.tenants) || !nonnegative(p?.rentableArea) || !nonnegative(p?.rentedArea) || Number(p?.rentedShops || 0) > Number(p?.totalShops || 0) || Number(p?.rentedArea || 0) > Number(p?.rentableArea || 0)) errors.push('已出租商铺和面积不能超过总量，请核对商业物业数据。'); }
    if (fields.propertySubtype === 'industrial') { const p = fields.industrial; if (!whole(p?.floors) || !nonnegative(p?.totalArea) || !nonnegative(p?.usedArea) || Number(p?.usedArea || 0) > Number(p?.totalArea || 0)) errors.push('当前使用面积不能超过厂房或仓储面积。'); }
  }
  if (fields.name.length > 120) errors.push('资产名称不能超过120字。');
  if (fields.referenceValue && (!/^\d+(?:\.\d+)?$/.test(fields.referenceValue) || Number(fields.referenceValue) <= 0 || !Number.isFinite(Number(fields.referenceValue)))) errors.push('参考价值请输入大于0的有效数字。');
  if (fields.referenceValue && fields.category !== '房地产' && !fields.currency.trim()) errors.push('填写参考价值时，请说明计价币种。');
  if (fields.authorizationLimit && (!/^\d+(?:\.\d{1,8})?$/.test(fields.authorizationLimit) || Number(fields.authorizationLimit) <= 0)) errors.push('企业声明的授权发行额度须为大于0、最多8位小数的数字。');
  if (fields.authorizationLimit && (!fields.authorizationCurrency?.trim() || !fields.authorizationBasis?.trim() || !fields.authorizationResponsible?.trim())) errors.push('填写授权发行额度时，请同时说明币种、依据及责任主体。');
  return errors;
}
function commit(value: AssetStore, email: string, tenantId: string, intent: AssetSaveIntent): SaveResult {
  const data = tenantData(value, email, tenantId);
  const found = data.assets.find(item => item.id === intent.assetId);
  if ((found?.versions.length || 0) !== intent.expectedVersion) return { status: 'conflict', intent };
  const nextVersion: AssetVersion = { number: intent.expectedVersion + 1, fields: clone(intent.snapshot), savedAt: Date.now(), savedBy: email };
  const summary = found ? (Object.keys(intent.snapshot) as (keyof AssetFields)[]).filter(key => JSON.stringify(intent.snapshot[key]) !== JSON.stringify(found.versions.at(-1)?.fields[key])).join('、') : '新建资产';
  const next: Asset = found
    ? { ...found, assetType: intent.snapshot.category === '房地产' ? 'real-estate' : undefined, subtype: intent.snapshot.propertySubtype, state: found.state === 'ready' ? 'preparing' : found.state, status: found.state === 'ready' ? 'preparing' : found.state, currentVersionId: `${found.id}:v${nextVersion.number}`, versions: [...found.versions, nextVersion], events: [...(found.events || []), { at: nextVersion.savedAt, actor: email, action: '保存版本', summary }] }
    : { id: intent.assetId, tenantId, number: `AS-${intent.assetId.slice(0, 8).toUpperCase()}`, assetType: intent.snapshot.category === '房地产' ? 'real-estate' : undefined, subtype: intent.snapshot.propertySubtype, state: 'draft', status: 'draft', currentVersionId: `${intent.assetId}:v1`, versions: [nextVersion], events: [{ at: nextVersion.savedAt, actor: email, action: '创建草稿', summary }] };
  data.assets = found ? data.assets.map(item => item.id === next.id ? next : item) : [...data.assets, next];
  data.intent = null;
  putTenantData(value, email, tenantId, data);
  return { status: 'saved', asset: clone(next) };
}
export function saveAsset(tenant: DemoTenant, fields: AssetFields, assetId?: string, expectedVersion = 0, retryIntentId?: string): SaveResult {
  const current = scope(tenant, true);
  if (!current || assetFieldErrors(fields).length) return { status: 'denied' };
  const value = readStore();
  const data = tenantData(value, current.email, current.tenantId);
  if (data.intent?.status === 'unknown' || data.intent?.status === 'processing') return { status: data.intent.status === 'unknown' ? 'unknown' : 'denied', intent: clone(data.intent) };
  const actual = assetId ? data.assets.find(item => item.id === assetId) : undefined;
  if (assetId && (!actual || actual.tenantId !== tenant.id || actual.state === 'archived')) return { status: 'denied' };
  if ((actual?.versions.length || 0) !== expectedVersion || useDemoControls.getState().controls.assetVersion === 'conflict') return { status: 'conflict' };
  const retry = data.intent?.status === 'failed' && data.intent.id === retryIntentId && (!assetId || data.intent.assetId === assetId) ? data.intent : null;
  const intent: AssetSaveIntent = {
    id: retry?.id || crypto.randomUUID(),
    tenantId: tenant.id, actor: current.email,
    assetId: assetId || retry?.assetId || crypto.randomUUID(),
    expectedVersion, snapshot: clone(fields), status: 'processing',
  };
  data.intent = intent;
  putTenantData(value, current.email, current.tenantId, data);
  const outcome = useDemoControls.getState().controls.assetSave;
  if (outcome === 'success') return commit(value, current.email, current.tenantId, intent);
  intent.status = outcome;
  putTenantData(value, current.email, current.tenantId, data);
  return { status: outcome, intent: clone(intent) };
}
export function checkAssetSaveIntent(tenant: DemoTenant): SaveResult {
  const current = scope(tenant, true);
  if (!current) return { status: 'denied' };
  const value = readStore();
  const data = tenantData(value, current.email, current.tenantId);
  const intent = data.intent;
  if (!intent || intent.status !== 'unknown') return { status: 'denied' };
  const outcome = useDemoControls.getState().controls.assetSave;
  if (outcome === 'success') return commit(value, current.email, current.tenantId, intent);
  if (outcome === 'failed') { intent.status = 'failed'; putTenantData(value, current.email, current.tenantId, data); return { status: 'failed', intent: clone(intent) }; }
  return { status: 'unknown', intent: clone(intent) };
}
export function resetAssetDemoData() { sessionStorage.removeItem(assetStorageKey); }
export function changeAssetStatus(tenant: DemoTenant, id: string, next: AssetStatus): SaveResult {
  const current = scope(tenant, true); if (!current) return { status: 'denied' };
  const value = readStore(); const data = tenantData(value, current.email, tenant.id);
  const record = data.assets.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || data.intent?.status === 'unknown') return { status: 'denied' };
  const transitions: Record<AssetStatus, AssetStatus[]> = { draft: ['preparing'], preparing: ['ready', 'restricted', 'archived'], ready: ['preparing', 'restricted', 'archived'], restricted: ['preparing'], archived: ['preparing'] };
  if (!transitions[record.state].includes(next)) return { status: 'denied' };
  const fields = record.versions.at(-1)!.fields;
  if (next === 'ready' && (assetMissing(fields).length || assetFieldErrors(fields).length || assetFileReadiness(tenant, id, fields).length)) return { status: 'denied' };
  record.state = next;
  record.status = next;
  if (next === 'ready') record.readyVersionNumber = record.versions.at(-1)!.number;
  record.events = [...(record.events || []), { at: Date.now(), actor: current.email, action: assetStatusLabels[next], summary: `资产状态更新为${assetStatusLabels[next]}` }];
  putTenantData(value, current.email, tenant.id, data);
  return { status: 'saved', asset: clone(record) };
}
export function recheckAssetReady(tenant: DemoTenant, id: string): void {
  const current = scope(tenant, true); if (!current) return;
  const value = readStore(); const data = tenantData(value, current.email, tenant.id);
  const record = data.assets.find(item => item.id === id && item.tenantId === tenant.id);
  if (!record || record.state !== 'ready' || !assetFileReadiness(tenant, id, record.versions.at(-1)!.fields).length) return;
  record.state = 'preparing'; record.status = 'preparing';
  record.events = [...(record.events || []), { at: Date.now(), actor: current.email, action: '文件条件变化', summary: '适用文件未通过 Sandbox 模拟扫描，返回准备中' }];
  putTenantData(value, current.email, tenant.id, data);
}
