import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';

export type PortalLogo = { name: string; mime: string; size: number; dataUrl: string };
export type PortalDraft = { name: string; logo: PortalLogo | null; version: number; savedAt: number };
export type PreviewAction = 'publish' | 'pause' | 'resume';
export type PreviewState = 'idle' | 'published' | 'paused' | 'processing' | 'unknown' | 'failed';
export type PreviewIntent = { id: string; action: PreviewAction; previous: PreviewState; at: number; status: 'processing' | 'unknown' };
export type PortalEvent = { at: number; action: string; result: string; actor: string; source: '本地流程预览' };
export type PortalRecord = { draft: PortalDraft | null; previewState: PreviewState; intent: PreviewIntent | null; events: PortalEvent[] };

const key = 'wdex-issuer-portal-v1';
const empty = (): PortalRecord => ({ draft: null, previewState: 'idle', intent: null, events: [] });
const clone = <T,>(value: T): T => structuredClone(value);
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const readAll = (): Record<string, PortalRecord> => {
  try { return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, PortalRecord>; }
  catch { return {}; }
};
export const readPortal = (tenant: DemoTenant): PortalRecord => {
  const id = scope(tenant);
  return id ? clone(readAll()[id] || empty()) : empty();
};
const update = (tenant: DemoTenant, change: (record: PortalRecord, actor: string) => void) => {
  const id = scope(tenant);
  if (!id || tenant.plan !== 'Standard' || tenant.role !== '企业管理员') throw Error('当前企业无权修改门户配置。');
  const all = readAll();
  const record = clone(all[id] || empty());
  change(record, getDemoAuth()!.email);
  all[id] = record;
  localStorage.setItem(key, JSON.stringify(all));
  window.dispatchEvent(new Event('wdex-portal-changed'));
  return clone(record);
};
export function validatePortalName(value: string): string {
  const length = [...value.trim()].length;
  return length < 1 || length > 80 ? '门户展示名称须为 1～80 个字符。' : '';
}
export function validatePortalLogo(file: Pick<File, 'type' | 'size'>): string {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return 'Logo 仅支持 PNG、JPG 或 WebP。';
  if (file.size > 2 * 1024 * 1024) return '当前内部预览的 Logo 文件须不超过 2 MB。';
  if (file.size === 0) return '请选择非空图片文件。';
  return '';
}
export function savePortalDraft(tenant: DemoTenant, name: string, logo: PortalLogo | null, expectedVersion: number): PortalRecord {
  const error = validatePortalName(name);
  if (error) throw Error(error);
  return update(tenant, (record, actor) => {
    if ((record.draft?.version || 0) !== expectedVersion) throw Error('门户草稿版本已变化，请重新加载后核对。');
    record.draft = { name: name.trim(), logo, version: expectedVersion + 1, savedAt: Date.now() };
    record.events.unshift({ at: Date.now(), action: '保存基础展示草稿', result: '已保存，仅内部可见', actor, source: '本地流程预览' });
  });
}
const nextPreviewState: Record<PreviewAction, PreviewState> = { publish: 'published', pause: 'paused', resume: 'published' };
export function startPreviewAction(tenant: DemoTenant, action: PreviewAction): PortalRecord {
  return update(tenant, (record, actor) => {
    if (!record.draft) throw Error('请先保存门户展示草稿。');
    if (record.intent) throw Error('前一操作结果待确认，请先查询原操作，不要重复提交。');
    if ((action === 'publish' && record.previewState !== 'idle') ||
        (action === 'pause' && record.previewState !== 'published') ||
        (action === 'resume' && record.previewState !== 'paused')) throw Error('当前内部流程状态不支持此操作。');
    record.intent = { id: crypto.randomUUID(), action, previous: record.previewState, at: Date.now(), status: 'processing' };
    record.previewState = 'processing';
    record.events.unshift({ at: Date.now(), action: `${action} 流程预览`, result: '处理中', actor, source: '本地流程预览' });
  });
}
export function finishPreviewAction(tenant: DemoTenant, intentId: string, result: 'success' | 'failed' | 'unknown'): PortalRecord {
  return update(tenant, (record, actor) => {
    if (!record.intent || record.intent.id !== intentId) throw Error('原操作记录不存在，请刷新后核对。');
    const intent = record.intent;
    record.previewState = result === 'success' ? nextPreviewState[intent.action] : result === 'failed' ? intent.previous : 'unknown';
    record.intent = result === 'unknown' ? { ...intent, status: 'unknown' } : null;
    record.events.unshift({ at: Date.now(), action: `${intent.action} 流程预览`, result: result === 'success' ? '内部状态已更新，未对外生效' : result === 'failed' ? '失败，原状态保持' : '结果待确认', actor, source: '本地流程预览' });
  });
}
export function inspectPreviewIntent(tenant: DemoTenant): { intent: PreviewIntent | null; message: string } {
  const intent = readPortal(tenant).intent;
  return intent ? { intent, message: '原操作尚无可核验的服务端结果。请保留该记录，不要重复提交。' } :
    { intent: null, message: '当前没有待查询的原操作。' };
}
export type PortalOfferingView = { id: string; number: string; name: string; assetName: string; assetVersion: number; instrumentVersion: number; stage: string; startsAt: string; endsAt: string; timezone: string; disclosure: '有效' | '缺项' | '待核实'; source: '当前发行方案' | '既有发行记录' };
export function portalOfferingVisibility(row: PortalOfferingView): { label: '可展示' | '不可展示' | '待核实'; reason: string } {
  if (row.stage === '草稿' || row.stage.startsWith('Sandbox')) return { label: '不可展示', reason: '发行方案尚未完成真实对外发布。' };
  if (row.disclosure === '缺项') return { label: '不可展示', reason: '法律披露资料缺失，请返回发行方案补充。' };
  return { label: '待核实', reason: '尚无真实门户服务及披露授权核验结果。' };
}
