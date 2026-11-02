import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { getProfileDraft } from './issuerB03Demo';
import { b04StorageKeys } from './issuerSensitiveCache';
import { countryOptions } from './countries';

export type KybDraft = {
  legalName: string; displayName: string; country: string; entityType: string;
  registrationId: string; address: string; contactEmail: string; contactRole: string;
  representative: string; authority: string; beneficialControl: string;
};
export type MockMaterial = { name: string; version: number; status: '模拟已选择' | '模拟上传失败' | '模拟已上传' };
export type KybVersion = { number: number; submittedAt: number; draft: KybDraft; materials: MockMaterial[] };
export type KybStatus = 'reviewing' | 'supplement' | 'rejected' | 'unknown';
export type KybEvent = { kind: 'submission'; version: number; materialNames: string[] } | { kind: 'result'; status: KybStatus };
export type KybCase = { id: string; tenantId: string; email: string; status: KybStatus; versions: KybVersion[]; events?: KybEvent[] };
export type SavedKybDraft = { value: KybDraft; materials: MockMaterial[]; savedAt: number };
export type CommercialPreview = {
  contract: 'unpublished' | 'reading' | 'read-confirmed' | 'signature-unknown' | 'effective-preview';
  payment: 'unavailable' | 'unknown' | 'observed' | 'matching' | 'matched';
  entitlement: 'unavailable' | 'pending' | 'activated-preview';
};
const key = 'wdex-issuer-b04-commercial';
const contractKey = 'wdex-issuer-b04-contract-preview';
const paymentKey = 'wdex-issuer-b04-payment-preview';
const entitlementKey = 'wdex-issuer-b04-entitlement-preview';
type Store = { email: string; tenants: Record<string, { draft?: SavedKybDraft; case?: KybCase }> };
type RecordForTenant = Store['tenants'][string];
const defaultPreview: CommercialPreview = { contract: 'unpublished', payment: 'unavailable', entitlement: 'unavailable' };
// Draft location choices are a data directory, never an approved KYB jurisdiction list.
export const kybCountryOptions = countryOptions.map(item => ({ value: item.code, label: item.name }));
export const kybEntityOptions = ['公司（演示分类）', '其他机构（演示分类）'] as const;
// Applicable registration-number and material rules remain TBD in Master PRD §§6.20.2/6.30.2.
const approvedKybPolicies: Record<string, { registrationIdRequired: boolean; requiredMaterials: string[] }> = {};
export function validateKybSubmission(draft: SavedKybDraft) {
  const required: (keyof KybDraft)[] = ['legalName', 'country', 'entityType', 'address', 'contactEmail', 'contactRole', 'representative', 'authority'];
  const invalidFields = required.filter(field => !draft.value[field].trim());
  if (draft.value.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value.contactEmail.trim())) invalidFields.push('contactEmail');
  if (draft.value.country && !kybCountryOptions.some(option => option.value === draft.value.country)) invalidFields.push('country');
  if (draft.value.entityType && !kybEntityOptions.some(option => option === draft.value.entityType)) invalidFields.push('entityType');
  const blockers: string[] = [];
  if (!draft.materials.some(item => item.status === '模拟已上传')) blockers.push('尚未添加证明材料。');
  const policy = approvedKybPolicies[draft.value.country];
  if (!policy) blockers.push('当前地区的登记编号适用条件与材料清单尚未获批，暂不能提交商业KYB申请。');
  else {
    if (policy.registrationIdRequired && !draft.value.registrationId.trim()) invalidFields.push('registrationId');
    if (policy.requiredMaterials.some(name => !draft.materials.some(item => item.name === name && item.status === '模拟已上传'))) blockers.push('适用的必要材料尚未齐全。');
  }
  return { invalidFields: [...new Set(invalidFields)], blockers };
}

function current(tenant: DemoTenant) {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? auth : null;
}
function read(email: string): Store {
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) || 'null') as Store | null;
    if (stored?.email === email && stored.tenants && typeof stored.tenants === 'object') return stored;
  } catch { /* Invalid browser demo data is ignored. */ }
  return { email, tenants: {} };
}
function getRecord(tenant: DemoTenant): RecordForTenant | null {
  const auth = current(tenant);
  if (!auth) return null;
  return read(auth.email).tenants[tenant.id] || {};
}
function update(tenant: DemoTenant, change: (previous: RecordForTenant) => RecordForTenant): boolean {
  const auth = current(tenant);
  if (!auth || tenant.role !== '企业管理员' || !tenant.canSubscribe) return false;
  const store = read(auth.email);
  store.tenants[tenant.id] = change(store.tenants[tenant.id] || {});
  sessionStorage.setItem(key, JSON.stringify(store));
  return true;
}
export function clearB04Scenario() { b04StorageKeys.forEach(item => sessionStorage.removeItem(item)); }
export function defaultKybDraft(tenant: DemoTenant): KybDraft {
  const profile = getProfileDraft(tenant);
  return {
    legalName: profile.commercialName, displayName: profile.displayName,
    country: profile.commercialCountry || tenant.country, entityType: '',
    registrationId: profile.registrationId, address: profile.registeredAddress,
    contactEmail: profile.contactEmail, contactRole: profile.contactRole,
    representative: '', authority: '', beneficialControl: '',
  };
}
export function getKybDraft(tenant: DemoTenant): SavedKybDraft {
  return getRecord(tenant)?.draft || { value: defaultKybDraft(tenant), materials: [], savedAt: 0 };
}
export function saveKybDraft(tenant: DemoTenant, draft: SavedKybDraft): boolean {
  return update(tenant, previous => ({ ...previous, draft }));
}
export function getKybCase(tenant: DemoTenant): KybCase | null {
  const record = getRecord(tenant)?.case;
  const auth = current(tenant);
  return record && record.tenantId === tenant.id && record.email === auth?.email ? record : null;
}
export function submitKybVersion(tenant: DemoTenant, draft: SavedKybDraft, outcome: 'reviewing' | 'unknown' | 'failed' | 'conflict'): KybCase | null {
  const auth = current(tenant);
  const validation = validateKybSubmission(draft);
  if (!auth || tenant.role !== '企业管理员' || !tenant.canSubscribe || outcome === 'failed' || outcome === 'conflict' || validation.invalidFields.length || validation.blockers.length) return null;
  const prior = getKybCase(tenant);
  if (prior && prior.status !== 'supplement') return prior;
  const version: KybVersion = { number: (prior?.versions.length || 0) + 1, submittedAt: Date.now(), draft: { ...draft.value }, materials: draft.materials.map(item => ({ ...item })) };
  const events: KybEvent[] = [...(prior?.events || []), { kind: 'submission', version: version.number, materialNames: version.materials.map(item => item.name) }];
  const next: KybCase = prior
    ? { ...prior, status: outcome, versions: [...prior.versions, version], events }
    : { id: crypto.randomUUID(), tenantId: tenant.id, email: auth.email, status: outcome, versions: [version], events };
  if (!update(tenant, previous => ({ ...previous, draft, case: next }))) return null;
  return next;
}
// This is an explicit external-result *simulation* for UI review; it never represents Issuer approval.
export function simulateKybResult(tenant: DemoTenant, status: KybStatus): KybCase | null {
  const prior = getKybCase(tenant);
  if (!prior) return null;
  const earlierEvents: KybEvent[] = prior.events || prior.versions.map(version => ({ kind: 'submission', version: version.number, materialNames: version.materials.map(item => item.name) }));
  const next: KybCase = { ...prior, status, events: [...earlierEvents, { kind: 'result', status }] };
  if (!update(tenant, previous => ({ ...previous, case: next }))) return null;
  return next;
}
export function getCommercialPreview(tenant: DemoTenant): CommercialPreview {
  const auth = current(tenant);
  if (!auth) return defaultPreview;
  const readField = <T extends string>(storageKey: string, fallback: T): T => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { email: string; tenants: Record<string, T> } | null;
      return stored?.email === auth.email && typeof stored.tenants?.[tenant.id] === 'string' ? stored.tenants[tenant.id] : fallback;
    } catch { return fallback; }
  };
  return {
    contract: readField(contractKey, defaultPreview.contract),
    payment: readField(paymentKey, defaultPreview.payment),
    entitlement: readField(entitlementKey, defaultPreview.entitlement),
  };
}

// This UI has no original invoice or payment record. Preview values never establish one.
export function hasOriginalPaymentRecord(_tenant: DemoTenant): boolean {
  void _tenant;
  return false;
}
export function setCommercialPreview(tenant: DemoTenant, preview: CommercialPreview): boolean {
  const auth = current(tenant);
  if (!auth || tenant.role !== '企业管理员' || !tenant.canSubscribe) return false;
  const writeField = (storageKey: string, value: string) => {
    let stored: { email: string; tenants: Record<string, string> } = { email: auth.email, tenants: {} };
    try {
      const existing = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as typeof stored | null;
      if (existing?.email === auth.email && existing.tenants) stored = existing;
    } catch { /* Ignore invalid demo storage. */ }
    stored.tenants[tenant.id] = value;
    sessionStorage.setItem(storageKey, JSON.stringify(stored));
  };
  writeField(contractKey, preview.contract);
  writeField(paymentKey, preview.payment);
  writeField(entitlementKey, preview.entitlement);
  return true;
}
