import { getDemoAuth, getDemoTenant, simulateStandardEntitlement, type DemoTenant } from './issuerDemo';

export type ProfileDraft = { displayName: string; commercialName: string; commercialCountry: string; registrationId: string; registeredAddress: string; contactEmail: string; contactName: string; contactRole: string; description: string };
export type UpgradeStatus = 'preparing' | 'processing' | 'failed' | 'unknown' | 'mock-complete';
export type UpgradeIntent = { id: string; tenantId: string; email: string; status: UpgradeStatus; createdAt: number };
const profileKey = 'wdex-issuer-b03-profile';
const upgradeKey = 'wdex-issuer-b03-upgrade';
type Scoped<T> = { email: string; tenants: Record<string, T> };

function current(tenant: DemoTenant) {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? auth : null;
}
function read<T>(key: string, email: string): Record<string, T> {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null') as Scoped<T> | null;
    return value?.email === email ? value.tenants : {};
  } catch { return {}; }
}
function save<T>(key: string, email: string, tenants: Record<string, T>) {
  sessionStorage.setItem(key, JSON.stringify({ email, tenants } satisfies Scoped<T>));
}
export function defaultProfile(tenant: DemoTenant): ProfileDraft {
  return { displayName: tenant.name, commercialName: '', commercialCountry: '', registrationId: '', registeredAddress: '', contactEmail: tenant.contactEmail, contactName: '', contactRole: '', description: tenant.description };
}
export function getProfileDraft(tenant: DemoTenant): ProfileDraft {
  const auth = current(tenant);
  return { ...defaultProfile(tenant), ...(auth ? read<ProfileDraft>(profileKey, auth.email)[tenant.id] : null) };
}
export function saveProfileDraft(tenant: DemoTenant, draft: ProfileDraft) {
  const auth = current(tenant);
  if (!auth || tenant.role !== '企业管理员') return false;
  const records = read<ProfileDraft>(profileKey, auth.email);
  records[tenant.id] = draft;
  save(profileKey, auth.email, records);
  return true;
}
export function getUpgradeIntent(tenant: DemoTenant): UpgradeIntent | null {
  const auth = current(tenant);
  if (!auth) return null;
  const stored = read<UpgradeIntent>(upgradeKey, auth.email)[tenant.id];
  if (stored?.tenantId === tenant.id && stored.email === auth.email) return stored;
  return auth.role === 'upgrading' ? { id: `scenario-${tenant.id}`, tenantId: tenant.id, email: auth.email, status: 'processing', createdAt: Date.now() } : null;
}
export function beginUpgradeIntent(tenant: DemoTenant): UpgradeIntent | null {
  const auth = current(tenant);
  if (!auth || !tenant.canSubscribe || tenant.plan === 'Standard') return null;
  const prior = getUpgradeIntent(tenant);
  if (prior) return prior;
  const record: UpgradeIntent = { id: crypto.randomUUID(), tenantId: tenant.id, email: auth.email, status: 'preparing', createdAt: Date.now() };
  const records = read<UpgradeIntent>(upgradeKey, auth.email);
  records[tenant.id] = record;
  save(upgradeKey, auth.email, records);
  return record;
}
export function setUpgradeDemoStatus(tenant: DemoTenant, status: UpgradeStatus): UpgradeIntent | null {
  const auth = current(tenant);
  const prior = getUpgradeIntent(tenant);
  if (!auth || !tenant.canSubscribe || !prior) return null;
  if (status === 'mock-complete' && !simulateStandardEntitlement(tenant.id)) return null;
  const record = { ...prior, status };
  const records = read<UpgradeIntent>(upgradeKey, auth.email);
  records[tenant.id] = record;
  save(upgradeKey, auth.email, records);
  return record;
}
