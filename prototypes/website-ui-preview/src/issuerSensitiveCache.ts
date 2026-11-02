// Browser-only Mock data. Never treat this cache as a server Case or entitlement.
export const b04StorageKeys = [
  'wdex-issuer-b04-commercial',
  'wdex-issuer-b04-contract-preview',
  'wdex-issuer-b04-payment-preview',
  'wdex-issuer-b04-entitlement-preview',
] as const;

export function clearB04TenantCache(email: string, tenantId: string) {
  for (const key of b04StorageKeys) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(key) || 'null') as { email: string; tenants: Record<string, unknown> } | null;
      if (stored?.email !== email || !stored.tenants || !Object.hasOwn(stored.tenants, tenantId)) continue;
      delete stored.tenants[tenantId];
      if (Object.keys(stored.tenants).length) sessionStorage.setItem(key, JSON.stringify(stored));
      else sessionStorage.removeItem(key);
    } catch { sessionStorage.removeItem(key); }
  }
}

export function clearB04AccountCache(email: string) {
  for (const key of b04StorageKeys) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(key) || 'null') as { email: string } | null;
      if (stored?.email === email) sessionStorage.removeItem(key);
    } catch { sessionStorage.removeItem(key); }
  }
}

export function clearAccountSensitiveCache(email: string) {
  clearB04AccountCache(email);
  const profileKey = 'wdex-issuer-b03-profile';
  try {
    const stored = JSON.parse(sessionStorage.getItem(profileKey) || 'null') as { email: string } | null;
    if (stored?.email === email) sessionStorage.removeItem(profileKey);
  } catch { sessionStorage.removeItem(profileKey); }
}
