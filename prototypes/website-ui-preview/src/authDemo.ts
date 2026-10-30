import { isDemoPreview } from './site';

export type EntryIntent = 'free' | 'standard' | null;
type PendingAccount = { email: string; intent: EntryIntent; expiresAt: number; termsConfirmed: boolean };
const key = 'wdex-auth-pending-account';

export function entryIntent(): EntryIntent {
  const value = new URLSearchParams(location.search).get('intent');
  return value === 'free' || value === 'standard' ? value : null;
}

export function entryPath(path: string, intent: EntryIntent = entryIntent()) {
  const query = new URLSearchParams();
  if (intent) query.set('intent', intent);
  if (isDemoPreview()) query.set('demo', '1');
  return `${path}${query.size ? `?${query}` : ''}`;
}

export function savePendingAccount(email: string, intent: EntryIntent) {
  if (!isDemoPreview()) return;
  const value: PendingAccount = { email, intent, expiresAt: Date.now() + 10 * 60 * 1000, termsConfirmed: false };
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function pendingAccount(): PendingAccount | null {
  if (!isDemoPreview()) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null') as PendingAccount | null;
    return value?.email && value.expiresAt > Date.now() ? value : null;
  } catch { return null; }
}

export function confirmDemoTerms() {
  const value = pendingAccount();
  if (!value) return false;
  sessionStorage.setItem(key, JSON.stringify({ ...value, termsConfirmed: true } satisfies PendingAccount));
  return true;
}

export function clearPendingAccount() { sessionStorage.removeItem(key); }
