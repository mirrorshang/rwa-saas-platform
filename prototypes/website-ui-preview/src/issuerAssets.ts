import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';

// Local demonstration records only. Production asset authority and ACL belong to a server.
export const assetStorageKey = 'wdex-issuer-assets';
export const assetCategories = ['不动产', '债权', '实物资产', '其他资产'] as const;
export type AssetCategory = typeof assetCategories[number] | '';
export type AssetMaterial = { id: string; category: string; name: string; reference: string };
export type AssetFields = {
  name: string; category: AssetCategory; region: string; summary: string;
  controller: string; controllerType: string; tenantRelation: string; ownershipNote: string;
  detail: string; referenceValue: string; currency: string; referenceDate: string; valueSource: string;
  materials: AssetMaterial[];
};
export type AssetVersion = { number: number; fields: AssetFields; savedAt: number; savedBy: string };
export type Asset = { id: string; tenantId: string; number: string; state: 'draft' | 'archived'; versions: AssetVersion[] };
export type AssetSaveIntent = {
  id: string; tenantId: string; actor: string; assetId: string; expectedVersion: number;
  snapshot: AssetFields; status: 'processing' | 'failed' | 'unknown';
};
type TenantAssets = { assets: Asset[]; intent: AssetSaveIntent | null };
type AssetStore = { accounts: Record<string, Record<string, TenantAssets>> };
export type SaveResult = { status: 'saved' | 'failed' | 'unknown' | 'conflict' | 'denied'; asset?: Asset; intent?: AssetSaveIntent };

export const blankAssetFields = (): AssetFields => ({
  name: '', category: '', region: '', summary: '', controller: '', controllerType: '', tenantRelation: '', ownershipNote: '',
  detail: '', referenceValue: '', currency: '', referenceDate: '', valueSource: '', materials: [],
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
  if (write && selected.role !== '企业管理员') return null;
  return { email: auth.email, tenantId: selected.id };
};
const tenantData = (value: AssetStore, email: string, tenantId: string): TenantAssets =>
  value.accounts[email]?.[tenantId] || { assets: [], intent: null };
const putTenantData = (value: AssetStore, email: string, tenantId: string, data: TenantAssets) => {
  value.accounts[email] ||= {};
  value.accounts[email][tenantId] = data;
  writeStore(value);
};

export const canReadAssets = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canWriteAssets = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listAssets(tenant: DemoTenant): Asset[] | null {
  const current = scope(tenant);
  if (!current) return null;
  return clone(tenantData(readStore(), current.email, current.tenantId).assets);
}
export function findAsset(tenant: DemoTenant, assetId: string): Asset | null {
  return listAssets(tenant)?.find(item => item.id === assetId && item.tenantId === tenant.id) || null;
}
export function getAssetSaveIntent(tenant: DemoTenant): AssetSaveIntent | null {
  const current = scope(tenant, true);
  return current ? clone(tenantData(readStore(), current.email, current.tenantId).intent) : null;
}
export function assetMissing(fields: AssetFields): string[] {
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
  if (fields.name.length > 120) errors.push('资产名称不能超过120字。');
  if (fields.referenceValue && (!/^\d+(?:\.\d+)?$/.test(fields.referenceValue) || Number(fields.referenceValue) <= 0 || !Number.isFinite(Number(fields.referenceValue)))) errors.push('参考价值请输入大于0的有效数字。');
  if (fields.referenceValue && !fields.currency.trim()) errors.push('填写参考价值时，请说明计价币种。');
  return errors;
}
function commit(value: AssetStore, email: string, tenantId: string, intent: AssetSaveIntent): SaveResult {
  const data = tenantData(value, email, tenantId);
  const found = data.assets.find(item => item.id === intent.assetId);
  if ((found?.versions.length || 0) !== intent.expectedVersion) return { status: 'conflict', intent };
  const nextVersion: AssetVersion = { number: intent.expectedVersion + 1, fields: clone(intent.snapshot), savedAt: Date.now(), savedBy: email };
  const next: Asset = found
    ? { ...found, versions: [...found.versions, nextVersion] }
    : { id: intent.assetId, tenantId, number: `AS-${intent.assetId.slice(0, 8).toUpperCase()}`, state: 'draft', versions: [nextVersion] };
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
  if (assetId && (!actual || actual.tenantId !== tenant.id)) return { status: 'denied' };
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
