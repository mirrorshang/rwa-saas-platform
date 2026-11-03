import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

declare const __WDEX_DEMO_BUILD__: boolean;

export type DemoControls = {
  mail: 'accepted' | 'unavailable' | 'network' | 'unknown' | 'rate';
  code: 'accepted' | 'wrong' | 'expired' | 'used' | 'network' | 'unknown' | 'restricted';
  account: 'existing' | 'new';
  create: 'success' | 'failed' | 'partial' | 'unknown';
  access: 'allowed' | 'revoked' | 'expired' | 'unknown';
  profile: 'saved' | 'failed' | 'unknown' | 'conflict';
  kybUpload: 'success' | 'failed';
  kybRead: 'ready' | 'loading' | 'failed' | 'unknown';
  kybResult: 'actual' | 'reviewing' | 'supplement' | 'rejected' | 'unknown';
  upgrade: 'preparing' | 'processing' | 'failed' | 'unknown' | 'mock-complete';
  contract: 'unpublished' | 'reading' | 'read-confirmed' | 'signature-unknown' | 'effective-preview';
  payment: 'unavailable' | 'unknown' | 'observed' | 'matching' | 'matched';
  entitlement: 'unavailable' | 'pending' | 'activated-preview';
  billingRead: 'ready' | 'loading' | 'failed' | 'unknown';
  panel: 'ready' | 'loading' | 'failed' | 'unknown';
  assetList: 'ready' | 'loading' | 'failed' | 'unknown';
  assetSave: 'success' | 'failed' | 'unknown';
  assetVersion: 'ready' | 'conflict';
  assetAccess: 'allowed' | 'denied';
  assetHistory: 'ready' | 'loading' | 'failed' | 'unknown';
  instrumentList: 'ready' | 'loading' | 'failed' | 'unknown';
  instrumentSave: 'success' | 'failed' | 'unknown';
  instrumentSubmit: 'success' | 'failed' | 'unknown';
  instrumentVersion: 'ready' | 'conflict';
  instrumentAccess: 'allowed' | 'denied';
  instrumentHistory: 'ready' | 'loading' | 'failed' | 'unknown';
  instrumentReviewer: 'same' | 'independent' | 'none';
  instrumentReview: 'success' | 'failed' | 'unknown';
  issuanceList: 'ready' | 'loading' | 'failed' | 'unknown';
  issuanceSave: 'success' | 'failed' | 'unknown';
  issuanceAccess: 'allowed' | 'denied';
  fileAccess: 'allowed' | 'denied';
};

export const defaultDemoControls: DemoControls = {
  mail: 'accepted', code: 'accepted', account: 'existing', create: 'success', access: 'allowed',
  profile: 'saved', kybUpload: 'success', kybRead: 'ready',
  kybResult: 'actual', upgrade: 'preparing', contract: 'unpublished', payment: 'unavailable',
  entitlement: 'unavailable', billingRead: 'ready', panel: 'ready',
  assetList: 'ready', assetSave: 'success', assetVersion: 'ready', assetAccess: 'allowed', assetHistory: 'ready',
  instrumentList: 'ready', instrumentSave: 'success', instrumentSubmit: 'success', instrumentVersion: 'ready', instrumentAccess: 'allowed',
  instrumentHistory: 'ready', instrumentReviewer: 'same', instrumentReview: 'success',
  issuanceList: 'ready', issuanceSave: 'success', issuanceAccess: 'allowed', fileAccess: 'allowed',
};

type Store = { controls: DemoControls; setControl: <K extends keyof DemoControls>(key: K, value: DemoControls[K]) => void; resetControls: () => void };
const productionState: Store = { controls: defaultDemoControls, setControl: () => undefined, resetControls: () => undefined };
export const useDemoControls = (import.meta.env.DEV || __WDEX_DEMO_BUILD__)
  ? create<Store>()(persist((set) => ({
  controls: defaultDemoControls,
  setControl: (key, value) => set(state => ({ controls: { ...state.controls, [key]: value } })),
  resetControls: () => set({ controls: defaultDemoControls }),
}), { name: 'wdex-demo-controls', version: 3, migrate: persisted => {
  const previous = (persisted as { controls?: Partial<DemoControls> })?.controls || {};
  return { controls: {
    ...defaultDemoControls, ...previous,
    kybResult: 'actual', contract: 'unpublished',
    payment: previous.payment === 'unknown' ? 'unknown' : 'unavailable',
    entitlement: previous.entitlement === 'pending' ? 'pending' : 'unavailable',
    upgrade: previous.upgrade === 'processing' || previous.upgrade === 'failed' || previous.upgrade === 'unknown' ? previous.upgrade : 'preparing',
  } };
}, storage: createJSONStorage(() => sessionStorage) }))
  : create<Store>()(() => productionState);
