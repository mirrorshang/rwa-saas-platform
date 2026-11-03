import { isDemoPreview } from './demoEnvironment';
import { useDemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';

export const fileStorageKey = 'wdex-issuer-files';
export type FileOwner = 'asset' | 'instrument' | 'project' | 'offering';
export type FileRef = { id: string; owner: FileOwner; ownerId: string; fileId: string; version: number; category: string; note: string; linkedAt: number };
export type FileVersion = { number: number; name: string; size: number; type: string; addedAt: number; addedBy: string; status: 'received' };
export type FileRecord = { id: string; tenantId: string; versions: FileVersion[] };
type Bucket = { records: FileRecord[]; refs: FileRef[] };
type Store = { accounts: Record<string, Record<string, Bucket>> };
const payload = new Map<string, File>();
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
  if (edit && selected.role !== '企业管理员') return null;
  return { email: auth.email, tenantId: selected.id };
};
const bucket = (value: Store, email: string, id: string): Bucket => value.accounts[email]?.[id] || { records: [], refs: [] };
const put = (value: Store, email: string, id: string, data: Bucket) => { value.accounts[email] ||= {}; value.accounts[email][id] = data; write(value); };
export const canReadFiles = (tenant: DemoTenant) => Boolean(scope(tenant));
export const canEditFiles = (tenant: DemoTenant) => Boolean(scope(tenant, true));
export function listFiles(tenant: DemoTenant): { records: FileRecord[]; refs: FileRef[] } | null {
  const current = scope(tenant); if (!current) return null;
  return structuredClone(bucket(read(), current.email, current.tenantId));
}
export function refsFor(tenant: DemoTenant, owner: FileOwner, ownerId: string) {
  const data = listFiles(tenant); return data ? data.refs.filter(ref => ref.owner === owner && ref.ownerId === ownerId).map(ref => ({ ref, file: data.records.find(item => item.id === ref.fileId)! })).filter(item => item.file?.versions.some(version => version.number === item.ref.version)) : [];
}
export function addFile(tenant: DemoTenant, owner: FileOwner, ownerId: string, file: File, category: string, note: string) {
  const current = scope(tenant, true); if (!current || !ownerId || !file.name || file.size === 0 || file.size > 10 * 1024 * 1024) return { ok: false, message: '请选择不超过10 MB的非空文件。' };
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  const id = crypto.randomUUID(); const version = { number: 1, name: file.name, size: file.size, type: file.type || 'application/octet-stream', addedAt: Date.now(), addedBy: current.email, status: 'received' as const };
  data.records.push({ id, tenantId: tenant.id, versions: [version] });
  data.refs.push({ id: crypto.randomUUID(), owner, ownerId, fileId: id, version: 1, category, note, linkedAt: Date.now() });
  payload.set(`${current.email}/${tenant.id}/${id}/1`, file); put(value, current.email, current.tenantId, data);
  return { ok: true, message: '文件已接收于当前浏览器会话。安全扫描、专业审核和法律效力均未确认。' };
}
export function addFileVersion(tenant: DemoTenant, fileId: string, file: File) {
  const current = scope(tenant, true); if (!current || !file.name || !file.size || file.size > 10 * 1024 * 1024) return false;
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  const record = data.records.find(item => item.id === fileId && item.tenantId === tenant.id); if (!record) return false;
  const number = record.versions.length + 1;
  record.versions.push({ number, name: file.name, size: file.size, type: file.type || 'application/octet-stream', addedAt: Date.now(), addedBy: current.email, status: 'received' });
  payload.set(`${current.email}/${tenant.id}/${fileId}/${number}`, file); put(value, current.email, current.tenantId, data); return true;
}
export function linkFile(tenant: DemoTenant, owner: FileOwner, ownerId: string, fileId: string, version: number, category: string, note: string) {
  const current = scope(tenant, true); if (!current || !ownerId) return false;
  const value = read(); const data = bucket(value, current.email, current.tenantId);
  if (!data.records.some(item => item.id === fileId && item.tenantId === tenant.id && item.versions.some(entry => entry.number === version))) return false;
  if (data.refs.some(item => item.owner === owner && item.ownerId === ownerId && item.fileId === fileId && item.version === version)) return true;
  data.refs.push({ id: crypto.randomUUID(), owner, ownerId, fileId, version, category, note, linkedAt: Date.now() }); put(value, current.email, current.tenantId, data); return true;
}
export function getFilePayload(tenant: DemoTenant, fileId: string, version: number): File | null {
  const current = scope(tenant); if (!current) return null;
  const data = bucket(read(), current.email, current.tenantId);
  if (!data.records.some(item => item.id === fileId && item.tenantId === tenant.id && item.versions.some(entry => entry.number === version))) return null;
  return payload.get(`${current.email}/${tenant.id}/${fileId}/${version}`) || null;
}
export function clearFilePayloads() { payload.clear(); }
