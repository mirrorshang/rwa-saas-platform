import type { DemoRole } from './site';

export type DemoTenant = { id: string; name: string; plan: 'Free' | 'Standard'; role: string; canSubscribe: boolean; empty?: boolean };
export const demoTenants: DemoTenant[] = [
  { id: 'assetco', name: '示例资产管理公司', plan: 'Free', role: '企业管理员', canSubscribe: true },
  { id: 'issuerco', name: '示例发行企业', plan: 'Free', role: '普通成员', canSubscribe: false },
  { id: 'operator', name: '示例运营机构', plan: 'Standard', role: '企业管理员', canSubscribe: true },
  { id: 'newco', name: '新注册演示企业', plan: 'Free', role: '企业管理员', canSubscribe: true, empty: true },
];

type DemoAuth = { role: DemoRole; expiresAt: number };
const authKey = 'wdex-issuer-demo-auth';
const tenantKey = 'wdex-issuer-demo-tenant';

export function allowedTenants(role: DemoRole) {
  if (role === 'multiple') return demoTenants;
  if (role === 'standard') return demoTenants.filter(item => item.id === 'operator');
  if (role === 'single' || role === 'no-subscription' || role === 'upgrading') return demoTenants.filter(item => item.id === 'assetco');
  return [];
}
export function clearDemoContext() {
  sessionStorage.removeItem(authKey);
  sessionStorage.removeItem(tenantKey);
}
export function beginDemoAuth(role: DemoRole) {
  clearDemoContext();
  if (role === 'visitor' || role === 'none') return;
  sessionStorage.setItem(authKey, JSON.stringify({ role, expiresAt: Date.now() + 60 * 60 * 1000 } satisfies DemoAuth));
}
export function beginNewTenantDemo() {
  beginDemoAuth('single');
  sessionStorage.setItem(tenantKey, 'newco');
}
export function getDemoAuth(): DemoAuth | null {
  try {
    const auth = JSON.parse(sessionStorage.getItem(authKey) || 'null') as DemoAuth | null;
    if (!auth || (allowedTenants(auth.role).length === 0 && sessionStorage.getItem(tenantKey) !== 'newco') || auth.expiresAt <= Date.now()) return null;
    return auth;
  } catch { return null; }
}
export function selectDemoTenant(id: string) {
  const auth = getDemoAuth();
  sessionStorage.removeItem(tenantKey);
  if (!auth || !allowedTenants(auth.role).some(item => item.id === id)) return false;
  sessionStorage.setItem(tenantKey, id);
  return true;
}
export function getDemoTenant() {
  const auth = getDemoAuth();
  const id = sessionStorage.getItem(tenantKey);
  if (!auth || !id) return null;
  if (id === 'newco' && auth.role === 'single') return demoTenants[3];
  return allowedTenants(auth.role).find(item => item.id === id) || null;
}
