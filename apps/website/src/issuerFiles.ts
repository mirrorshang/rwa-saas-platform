import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { findAsset, recheckAssetReady, type AssetFields } from './issuerAssets';
import { findInstrument, recheckInstrumentReady } from './issuerInstruments';
import { findOffering, findProject } from './issuerIssuance';

export const fileStorageKey = 'wdex-issuer-files';
export const fileChangeEvent = 'wdex-issuer-files-changed';
export type FileOwner = 'asset' | 'instrument' | 'project' | 'offering';
export type FileVisibility = 'public' | 'eligible' | 'internal';
export type FileMetadata = { issuer?: string; issuedAt?: string; effectiveAt?: string; expiresAt?: string; language?: string; visibility?: FileVisibility };
export type FileRef = { id: string; owner: FileOwner; ownerId: string; fileId: string; version: number; category: string; note: string; linkedAt: number; issuer?: string; issuedAt?: string; effectiveAt?: string; expiresAt?: string; language?: string; visibility?: FileVisibility };
export type FileVersion = { number: number; name: string; size: number; type: string; addedAt: number; addedBy: string; status: 'received'; scan?: 'pending' | 'failed' | 'passed' | 'unknown' };
export type FileRecord = { id: string; tenantId: string; versions: FileVersion[] };
type Bucket = { records: FileRecord[]; refs: FileRef[] };
type Store = { accounts: Record<string, Record<string, Bucket>> };
const payload = new Map<string, File>();
const databaseName = 'wdex-issuer-local-files';
const objectStore = 'payloads';
const fileKey = (email: string, tenantId: string, id: string, version: number) => `${email}/${tenantId}/${id}/${version}`;
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(objectStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function storePayload(key: string, file: File) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(objectStore, 'readwrite');
      transaction.objectStore(objectStore).put(file, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
async function loadPayload(key: string): Promise<File | null> {
  const db = await openDatabase();
  try {
    return await new Promise<File | null>((resolve, reject) => {
      const request = db.transaction(objectStore).objectStore(objectStore).get(key);
      request.onsuccess = () => resolve(request.result instanceof File ? request.result : null);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
async function deletePayloads(prefix: string) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(objectStore, 'readwrite');
      const request = transaction.objectStore(objectStore).openCursor();
      request.onsuccess = () => { const cursor = request.result; if (cursor) { if (String(cursor.key).startsWith(prefix)) cursor.delete(); cursor.continue(); } };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
const empty = (): Store => ({ accounts: {} });
const read = (): Store => {
  if (!isDemoPreview()) return empty();
  try { const value = JSON.parse(sessionStorage.getItem(fileStorageKey) || 'null') as Store; return value?.accounts && typeof value.accounts === 'object' ? value : empty(); }
  catch { return empty(); }
};
const write = (value: Store) => sessionStorage.setItem(fileStorageKey, JSON.stringify(value));
const scope = (tenant: DemoTenant, edit = false) => {
  if (!isDemoPreview()) return null;
  const auth = getDemoAuth(); const selected = getDemoTenant(); const controls = useDemoControls.getState().controls;
  if (!auth || !selected || selected.id !== tenant.id || controls.access !== 'allowed' || controls.fileAccess !== 'allowed') return null;
  if (edit && (selected.role !== '企业管理员' || selected.subscriptionState === 'downgraded')) return null;
  return { email: auth.email, tenantId: selected.id };
};
const bucket = (value: Store, email: string, id: string): Bucket => value.accounts[email]?.[id] || { records: [], refs: [] };
const put = (value: Store, email: string, id: string, data: Bucket) => {
  value.accounts[email] ||= {}; value.accounts[email][id] = data; write(value);
  const tenant = getDemoTenant();
  if (tenant?.id === id) for (const assetId of new Set(data.refs.filter(ref => ref.owner === 'asset').map(ref => ref.ownerId))) recheckAssetReady(tenant, assetId);
  if (tenant?.id === id) for (const instrumentId of new Set(data.refs.filter(ref => ref.owner === 'instrument').map(ref => ref.ownerId))) recheckInstrumentReady(tenant, instrumentId);
  window.dispatchEvent(new Event(fileChangeEvent));
};
const ownerExists = (tenant: DemoTenant, owner: FileOwner, id: string) => Boolean(owner === 'asset' ? findAsset(tenant, id) : owner === 'instrument' ? findInstrument(tenant, id) : owner === 'project' ? findProject(tenant, id) : findOffering(tenant, id));
export const canEditOwnerFiles = (tenant: DemoTenant, owner: FileOwner, id: string) => canEditFiles(tenant) && ownerExists(tenant, owner, id) && (owner !== 'asset' || findAsset(tenant, id)?.state !== 'archived') && (owner !== 'instrument' || findInstrument(tenant, id)?.status !== 'terminated');
export const defaultVisibility = (category: string): FileVisibility => category === '封面照片' ? 'public' : category === '其他支持文件' || category === '内部运营资料' ? 'internal' : 'eligible';
export const effectiveVisibility = (ref: FileRef, version: FileVersion): FileVisibility => version.scan === 'passed' ? ref.visibility || defaultVisibility(ref.category) : 'internal';
export const canReadFiles = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditFiles = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listFiles(tenant: DemoTenant): { records: FileRecord[]; refs: FileRef[] } | null {
  const current = scope(tenant); if (!current) return null;
  return structuredClone(bucket(read(), current.email, current.tenantId));
}
export function refsFor(tenant: DemoTenant, owner: FileOwner, ownerId: string) {
  const data = ownerExists(tenant, owner, ownerId) ? listFiles(tenant) : null; return data ? data.refs.filter(ref => ref.owner === owner && ref.ownerId === ownerId).map(ref => ({ ref, file: data.records.find(item => item.id === ref.fileId)! })).filter(item => item.file?.versions.some(version => version.number === item.ref.version)) : [];
}
export function assetFileReadiness(tenant: DemoTenant, assetId: string, fields: AssetFields): string[] {
  const refs = refsFor(tenant, 'asset', assetId);
  const current = refs.filter(({ ref }) => !refs.some(({ ref: other }) => other.fileId === ref.fileId && other.version > ref.version));
  const issues = current.flatMap(({ ref, file }) => {
    const scan = file.versions.find(version => version.number === ref.version)?.scan || 'unknown';
    return scan === 'passed' ? [] : [`文件“${file.versions.find(version => version.number === ref.version)?.name || '未知'}”扫描${scan === 'failed' ? '失败并已隔离' : scan === 'pending' ? '未完成' : '结果无法确认'}`];
  });
  if (fields.valuationEnabled && fields.valuationAgency?.trim() && !current.some(({ ref, file }) => ref.category === '估值报告' && file.versions.find(version => version.number === ref.version)?.scan === 'passed')) issues.push('独立评估的估值报告尚未上传并模拟扫描通过');
  return issues;
}
export function refreshFileScan(tenant: DemoTenant, fileId: string, version: number): boolean {
  const current = scope(tenant, true); if (!current) return false;
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  const entry = data.records.find(item => item.id === fileId && item.tenantId === tenant.id)?.versions.find(item => item.number === version);
  if (!entry) return false;
  entry.scan = useDemoControls.getState().controls.fileScan;
  put(value, current.email, tenant.id, data); return true;
}
export async function addFile(tenant: DemoTenant, owner: FileOwner, ownerId: string, file: File, category: string, note: string, metadata: FileMetadata = {}) {
  const current = scope(tenant, true); if (!current || !canEditOwnerFiles(tenant, owner, ownerId) || !file.name || file.size === 0 || file.size > 10 * 1024 * 1024) return { ok: false, message: '请选择不超过10 MB的非空文件，并核对当前业务对象。' };
  const id = crypto.randomUUID(); const version = { number: 1, name: file.name, size: file.size, type: file.type || 'application/octet-stream', addedAt: Date.now(), addedBy: current.email, status: 'received' as const, scan: 'pending' as const };
  try { await storePayload(fileKey(current.email, tenant.id, id, 1), file); }
  catch { return { ok: false, message: '当前浏览器无法保存文件，请检查存储空间或浏览器设置。' }; }
  if (!canEditOwnerFiles(tenant, owner, ownerId) || scope(tenant, true)?.email !== current.email) return { ok: false, message: '企业会话已变化，请重新选择文件。' };
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  data.records.push({ id, tenantId: tenant.id, versions: [version] });
  data.refs.push({ id: crypto.randomUUID(), owner, ownerId, fileId: id, version: 1, category, note, linkedAt: Date.now(), issuer: metadata.issuer, issuedAt: metadata.issuedAt, effectiveAt: metadata.effectiveAt, expiresAt: metadata.expiresAt, language: metadata.language, visibility: metadata.visibility || defaultVisibility(category) });
  payload.set(fileKey(current.email, tenant.id, id, 1), file); put(value, current.email, current.tenantId, data);
  return { ok: true, message: '文件已保存于当前浏览器。安全扫描、专业审核和法律效力均未确认。' };
}
export async function addFileVersion(tenant: DemoTenant, fileId: string, file: File) {
  const current = scope(tenant, true); if (!current || !file.name || !file.size || file.size > 10 * 1024 * 1024) return false;
  const initial = bucket(read(), current.email, current.tenantId);
  const record = initial.records.find(item => item.id === fileId && item.tenantId === tenant.id); if (!record) return false;
  const number = record.versions.length + 1;
  try { await storePayload(fileKey(current.email, tenant.id, fileId, number), file); }
  catch { return false; }
  if (!scope(tenant, true) || scope(tenant, true)?.email !== current.email) return false;
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  const latest = data.records.find(item => item.id === fileId && item.tenantId === tenant.id);
  if (!latest || latest.versions.length + 1 !== number) return false;
  latest.versions.push({ number, name: file.name, size: file.size, type: file.type || 'application/octet-stream', addedAt: Date.now(), addedBy: current.email, status: 'received', scan: 'pending' });
  payload.set(fileKey(current.email, tenant.id, fileId, number), file); put(value, current.email, current.tenantId, data); return true;
}
export function linkFile(tenant: DemoTenant, owner: FileOwner, ownerId: string, fileId: string, version: number, category: string, note: string, metadata: FileMetadata = {}) {
  const current = scope(tenant, true); if (!current || !canEditOwnerFiles(tenant, owner, ownerId)) return false;
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  if (!data.records.some(item => item.id === fileId && item.tenantId === tenant.id && item.versions.some(entry => entry.number === version))) return false;
  if (data.refs.some(item => item.owner === owner && item.ownerId === ownerId && item.fileId === fileId && item.version === version)) return true;
  data.refs.push({ id: crypto.randomUUID(), owner, ownerId, fileId, version, category, note, linkedAt: Date.now(), issuer: metadata.issuer, issuedAt: metadata.issuedAt, effectiveAt: metadata.effectiveAt, expiresAt: metadata.expiresAt, language: metadata.language, visibility: metadata.visibility || defaultVisibility(category) }); put(value, current.email, current.tenantId, data); return true;
}
export async function getFilePayload(tenant: DemoTenant, fileId: string, version: number): Promise<File | null> {
  const current = scope(tenant); if (!current) return null;
  const data = bucket(read(), current.email, current.tenantId);
  if (!data.records.some(item => item.id === fileId && item.tenantId === tenant.id && item.versions.some(entry => entry.number === version && entry.scan === 'passed'))) return null;
  const key = fileKey(current.email, tenant.id, fileId, version);
  const file = payload.get(key) || await loadPayload(key).catch(() => null);
  if (!scope(tenant) || scope(tenant)?.email !== current.email) return null;
  if (file) payload.set(key, file);
  return file;
}
export function clearFilePayloads() { payload.clear(); }
export function clearAccountFileCache(email: string) {
  payload.clear();
  const value = read(); delete value.accounts[email]; write(value);
  return deletePayloads(`${email}/`).catch(() => undefined);
}
export function clearAllFilePayloads() { payload.clear(); return deletePayloads('').catch(() => undefined); }
