import { basePath, type Channel } from './domain.ts';

export type KycStatus = 'not-started' | 'processing' | 'supplement' | 'approved' | 'failed' | 'expired' | 'unknown';
export type MpcStatus = 'creating' | 'ready' | 'failed' | 'unknown' | 'service-gated';
export type WalletChoice = 'mpc' | 'own';
export type AccountRecord = {
  id: string; email: string; createdAt: string; kyc: KycStatus; kycUpdatedAt?: string;
  mpc: MpcStatus; mpcOperationId: string; mpcAddress?: string;
  ownAddress?: string; ownVerified: boolean; defaultWallet?: WalletChoice; walletVersion: number;
};

export const normalizeEmail = (value: string) => value.trim().toLocaleLowerCase('en-US');
export const emailError = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value)) ? '' : '请输入有效的邮箱地址';
export const otpError = (value: string, issuedAt: number, now: number, used = false) =>
  used ? '验证码已使用，请重新获取' : now - issuedAt > 5 * 60_000 ? '验证码已过期，请重新获取' : value !== '246810' ? '请输入页面显示的六位 Mock 验证码' : '';
export const accountKey = (channel: Channel, email: string) => 'rwa-mock-account:' + encodeURIComponent(basePath(channel)) + ':' + encodeURIComponent(normalizeEmail(email));
export const activeAccountKey = (channel: Channel) => 'rwa-mock-active:' + encodeURIComponent(basePath(channel));
export const newAccount = (channel: Channel, email: string, now: string, operationId: string): AccountRecord => ({
  id: basePath(channel) + ':' + normalizeEmail(email), email: normalizeEmail(email), createdAt: now,
  kyc: 'not-started', mpc: 'creating', mpcOperationId: operationId, ownVerified: false, walletVersion: 0
});
export const withMpcResult = (account: AccountRecord, result: 'ready' | 'failed' | 'unknown', address?: string): AccountRecord => {
  if (account.mpc === 'ready') return account;
  if (result !== 'ready') return { ...account, mpc: result };
  return { ...account, mpc: 'ready', mpcAddress: address || 'Mock MPC · 0xA1…E4', defaultWallet: account.defaultWallet || 'mpc' };
};
export const withOwnWallet = (account: AccountRecord, address: string, verified: boolean): AccountRecord => {
  const revoked = account.defaultWallet === 'own' && !verified;
  return { ...account, ownAddress: address.trim(), ownVerified: verified,
    defaultWallet: revoked ? undefined : account.defaultWallet,
    walletVersion: revoked ? account.walletVersion + 1 : account.walletVersion };
};
export const withDefaultWallet = (account: AccountRecord, choice: WalletChoice): AccountRecord => {
  if (choice === 'mpc' && account.mpc !== 'ready') return account;
  if (choice === 'own' && !account.ownVerified) return account;
  return account.defaultWallet === choice ? account : { ...account, defaultWallet: choice, walletVersion: account.walletVersion + 1 };
};
export const canSubmitSubscription = (account: AccountRecord | null) => account?.kyc === 'approved';
export const safeAccountReturn = (channel: Channel, from: string | null) => {
  const fallback = basePath(channel) + '/account';
  if (!from?.startsWith(basePath(channel) + '/') || from.includes('//')) return fallback;
  const parsed = new URL(from,'https://mock.local');
  return parsed.origin === 'https://mock.local' && parsed.pathname.startsWith(basePath(channel) + '/') ? parsed.pathname + parsed.search + parsed.hash : fallback;
};
export const readAccount = (channel: Channel, email: string): AccountRecord | null => {
  try {
    const raw = localStorage.getItem(accountKey(channel,email));
    const value = raw ? JSON.parse(raw) as AccountRecord : null;
    return value?.id === basePath(channel) + ':' + normalizeEmail(email) ? { ...value, walletVersion:value.walletVersion || 0 } : null;
  } catch { return null; }
};
export const activeAccount = (channel: Channel): AccountRecord | null => {
  const email = sessionStorage.getItem(activeAccountKey(channel));
  return email ? readAccount(channel,email) : null;
};
export const saveAccount = (channel: Channel, account: AccountRecord) => {
  localStorage.setItem(accountKey(channel,account.email),JSON.stringify(account));
  sessionStorage.setItem(activeAccountKey(channel),account.email);
};
export const signOut = (channel: Channel) => sessionStorage.removeItem(activeAccountKey(channel));
