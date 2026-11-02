import { isDemoPreview } from './site';
import { b04StorageKeys, clearAccountSensitiveCache, clearB04TenantCache } from './issuerSensitiveCache';

// Browser-session fixtures only. No server authentication or commercial entitlement is created.
type Plan = 'Free' | 'Standard';
type Status = 'active' | 'pending';
type Scenario = 'visitor' | 'single' | 'multiple' | 'none' | 'create' | 'restricted' | 'invited' | 'no-subscription' | 'standard' | 'upgrading';
type Account = { email: string; canCreate: boolean; restricted?: boolean; invitationPending?: boolean };
type Tenant = { id: string; name: string; country: string; contactEmail: string; description: string; empty: boolean };
type Member = { email: string; tenantId: string; role: string; canSubscribe: boolean; status: Status };
type Entitlement = { tenantId: string; plan: Plan; status: Status };
type Store = { accounts: Account[]; tenants: Tenant[]; members: Member[]; entitlements: Entitlement[] };
export type DemoTenant = Tenant & { plan: Plan; role: string; canSubscribe: boolean };
export type TenantDraft = Pick<Tenant, 'name' | 'country' | 'description'>;
export type CreateOutcome = 'success' | 'failed' | 'unknown' | 'partial';
export type TenantCreateIntent = { id: string; email: string; tenantId: string; draft: TenantDraft; status: 'processing' | CreateOutcome; tenantCreated: boolean; freeActive: boolean; memberActive: boolean; createdAt: number };
type DemoAuth = { email: string; role: Scenario; expiresAt: number };

const storeKey = 'wdex-issuer-demo-store';
const authKey = 'wdex-issuer-demo-auth';
const selectionKey = 'wdex-issuer-demo-tenant';
const intentKey = 'wdex-tenant-create-active';
const draftKey = 'wdex-tenant-create-draft';
const blank = (): Store => ({ accounts: [], tenants: [], members: [], entitlements: [] });
const read = <T,>(key: string): T | null => {
  if (!isDemoPreview()) return null;
  try { return JSON.parse(sessionStorage.getItem(key) || 'null') as T | null; } catch { return null; }
};
const save = (key: string, value: unknown) => sessionStorage.setItem(key, JSON.stringify(value));
const store = () => read<Store>(storeKey) || blank();

export function clearDemoContext() {
  const auth = read<DemoAuth>(authKey);
  if (auth) clearAccountSensitiveCache(auth.email);
  sessionStorage.removeItem(authKey);
  sessionStorage.removeItem(selectionKey);
}
export function resetDemoScenario() { [authKey, selectionKey, storeKey, intentKey, draftKey, 'wdex-issuer-b03-profile', 'wdex-issuer-b03-upgrade', ...b04StorageKeys].forEach(key => sessionStorage.removeItem(key)); }
export function getDemoAuth(): DemoAuth | null {
  const auth = read<DemoAuth>(authKey);
  if (!auth || auth.expiresAt <= Date.now()) { clearDemoContext(); return null; }
  return auth;
}
export function getDemoAccount(): Account | null {
  const auth = getDemoAuth();
  return auth ? store().accounts.find(item => item.email === auth.email) || null : null;
}
function seedScenario(role: Scenario, email: string) {
  const value = store();
  if (value.accounts.some(item => item.email === email)) return;
  value.accounts.push({ email, canCreate: !['none', 'restricted', 'visitor'].includes(role), restricted: role === 'restricted', invitationPending: role === 'invited' });
  const fixtures: Tenant[] = [
    { id: 'assetco', name: '示例资产管理公司', country: 'HK', contactEmail: email, description: '', empty: false },
    { id: 'issuerco', name: '示例发行企业', country: 'SG', contactEmail: email, description: '', empty: false },
    { id: 'operator', name: '示例运营机构', country: 'HK', contactEmail: email, description: '', empty: false },
  ];
  const ids = role === 'multiple' ? ['assetco', 'issuerco', 'operator'] : role === 'standard' ? ['operator'] :
    ['single', 'no-subscription', 'upgrading'].includes(role) ? ['assetco'] : [];
  ids.forEach(id => {
    const tenant = fixtures.find(item => item.id === id)!;
    if (!value.tenants.some(item => item.id === id)) value.tenants.push(tenant);
    if (!value.entitlements.some(item => item.tenantId === id)) value.entitlements.push({ tenantId: id, plan: id === 'operator' ? 'Standard' : 'Free', status: 'active' });
    value.members.push({ email, tenantId: id, role: id === 'issuerco' || role === 'no-subscription' ? '普通成员' : '企业管理员', canSubscribe: id !== 'issuerco' && role !== 'no-subscription', status: 'active' });
  });
  save(storeKey, value);
}
export function beginDemoAuth(role: Scenario, email = 'demo@wdex.example') {
  if (!isDemoPreview() || role === 'visitor') return false;
  const normalized = email.trim().toLowerCase();
  seedScenario(role, normalized);
  clearDemoContext();
  save(authKey, { email: normalized, role, expiresAt: Date.now() + 60 * 60 * 1000 } satisfies DemoAuth);
  return true;
}
export function beginNewDemoAccount(email: string) {
  if (!isDemoPreview()) return false;
  const normalized = email.trim().toLowerCase();
  const value = store();
  if (value.accounts.some(item => item.email === normalized)) return false;
  value.accounts.push({ email: normalized, canCreate: true });
  save(storeKey, value);
  clearDemoContext();
  save(authKey, { email: normalized, role: 'create', expiresAt: Date.now() + 60 * 60 * 1000 } satisfies DemoAuth);
  return true;
}
export function getAuthorizedTenants(): DemoTenant[] {
  const auth = getDemoAuth();
  if (!auth) return [];
  const value = store();
  return value.members.filter(item => item.email === auth.email && item.status === 'active').flatMap(member => {
    const tenant = value.tenants.find(item => item.id === member.tenantId);
    const entitlement = value.entitlements.find(item => item.tenantId === member.tenantId && item.status === 'active');
    return tenant && entitlement ? [{ ...tenant, plan: entitlement.plan, role: member.role, canSubscribe: member.canSubscribe }] : [];
  });
}
export function selectDemoTenant(id: string) {
  const previousId = sessionStorage.getItem(selectionKey);
  const auth = getDemoAuth();
  sessionStorage.removeItem(selectionKey);
  if (!getAuthorizedTenants().some(item => item.id === id)) return false;
  if (auth && previousId && previousId !== id) clearB04TenantCache(auth.email, previousId);
  sessionStorage.setItem(selectionKey, id);
  return true;
}
export function getDemoTenant() {
  const id = isDemoPreview() ? sessionStorage.getItem(selectionKey) : null;
  return getAuthorizedTenants().find(item => item.id === id) || null;
}
// Explicit UI-only scenario override. No KYB, invoice, payment, or production access is created.
export function simulateStandardEntitlement(id: string) {
  const tenant = getDemoTenant();
  if (!tenant || tenant.id !== id || !tenant.canSubscribe) return false;
  const value = store();
  const entitlement = value.entitlements.find(item => item.tenantId === id && item.status === 'active');
  if (!entitlement) return false;
  entitlement.plan = 'Standard';
  save(storeKey, value);
  return true;
}
export function getTenantDraft(): TenantDraft | null {
  const auth = getDemoAuth();
  const record = read<{ email: string; draft: TenantDraft }>(draftKey);
  return auth && record?.email === auth.email ? record.draft : null;
}
export function saveTenantDraft(draft: TenantDraft) {
  const auth = getDemoAuth();
  if (auth) save(draftKey, { email: auth.email, draft });
}
export function clearTenantDraft() { sessionStorage.removeItem(draftKey); }
export function getActiveTenantIntent(): TenantCreateIntent | null {
  const auth = getDemoAuth();
  const intent = read<TenantCreateIntent>(intentKey);
  return auth && intent?.email === auth.email ? intent : null;
}
export function beginNewTenantDraft() {
  if (!getDemoAccount()?.canCreate) return false;
  const prior = getActiveTenantIntent();
  if (prior && ['processing', 'unknown', 'partial'].includes(prior.status)) return false;
  sessionStorage.removeItem(intentKey);
  sessionStorage.removeItem(draftKey);
  return true;
}
export function submitTenantCreate(draft: TenantDraft): TenantCreateIntent | null {
  const account = getDemoAccount();
  if (!account?.canCreate || account.restricted) return null;
  const prior = getActiveTenantIntent();
  if (prior && prior.status !== 'failed') return prior;
  const id = prior?.id || crypto.randomUUID();
  const intent: TenantCreateIntent = prior ? { ...prior, draft: prior.tenantCreated ? prior.draft : draft, status: 'processing' } : {
    id, tenantId: `created-${id}`, email: account.email, draft, status: 'processing',
    tenantCreated: false, freeActive: false, memberActive: false, createdAt: Date.now(),
  };
  save(intentKey, intent);
  return intent;
}
export function resolveTenantCreate(id: string, outcome: CreateOutcome): TenantCreateIntent | null {
  const intent = getActiveTenantIntent();
  if (!intent || intent.id !== id || intent.status === 'success') return intent;
  if (outcome === 'unknown' || outcome === 'failed') {
    const result = { ...intent, status: outcome };
    save(intentKey, result);
    return result;
  }
  const value = store();
  if (!value.tenants.some(item => item.id === intent.tenantId)) value.tenants.push({
    id: intent.tenantId, name: intent.draft.name, country: intent.draft.country,
    contactEmail: intent.email, description: intent.draft.description, empty: true,
  });
  const entitlement = value.entitlements.find(item => item.tenantId === intent.tenantId);
  if (!entitlement) value.entitlements.push({ tenantId: intent.tenantId, plan: 'Free', status: outcome === 'success' ? 'active' : 'pending' });
  else entitlement.status = outcome === 'success' ? 'active' : 'pending';
  const member = value.members.find(item => item.tenantId === intent.tenantId && item.email === intent.email);
  if (!member) value.members.push({ tenantId: intent.tenantId, email: intent.email, role: '企业管理员', canSubscribe: true, status: outcome === 'success' ? 'active' : 'pending' });
  else member.status = outcome === 'success' ? 'active' : 'pending';
  save(storeKey, value);
  const result: TenantCreateIntent = { ...intent, status: outcome, tenantCreated: true, freeActive: outcome === 'success', memberActive: outcome === 'success' };
  save(intentKey, result);
  if (outcome === 'success') selectDemoTenant(intent.tenantId);
  return result;
}
