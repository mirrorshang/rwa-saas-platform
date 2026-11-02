import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DemoControls = {
  mail: 'accepted' | 'unavailable' | 'network' | 'unknown' | 'rate';
  code: 'accepted' | 'wrong' | 'expired' | 'used' | 'network' | 'unknown' | 'restricted';
  account: 'existing' | 'new';
  create: 'success' | 'failed' | 'partial' | 'unknown';
  access: 'allowed' | 'revoked' | 'expired' | 'unknown';
  profile: 'saved' | 'failed' | 'unknown' | 'conflict';
  kybUpload: 'success' | 'failed';
  kybSubmit: 'reviewing' | 'failed' | 'unknown' | 'conflict';
  kybRead: 'ready' | 'loading' | 'failed' | 'unknown';
  kybResult: 'reviewing' | 'supplement' | 'rejected' | 'unknown' | 'passed-preview';
  upgrade: 'preparing' | 'processing' | 'failed' | 'unknown' | 'mock-complete';
  contract: 'unpublished' | 'reading' | 'read-confirmed' | 'signature-unknown' | 'effective-preview';
  payment: 'unavailable' | 'unknown' | 'observed' | 'matching' | 'matched';
  entitlement: 'unavailable' | 'pending' | 'activated-preview';
  billingRead: 'ready' | 'loading' | 'failed' | 'unknown';
  panel: 'ready' | 'loading' | 'failed' | 'unknown';
};

export const defaultDemoControls: DemoControls = {
  mail: 'accepted', code: 'accepted', account: 'existing', create: 'success', access: 'allowed',
  profile: 'saved', kybUpload: 'success', kybSubmit: 'reviewing', kybRead: 'ready',
  kybResult: 'reviewing', upgrade: 'preparing', contract: 'unpublished', payment: 'unavailable',
  entitlement: 'unavailable', billingRead: 'ready', panel: 'ready',
};

type Store = { controls: DemoControls; setControl: <K extends keyof DemoControls>(key: K, value: DemoControls[K]) => void; resetControls: () => void };
export const useDemoControls = create<Store>()(persist((set) => ({
  controls: defaultDemoControls,
  setControl: (key, value) => set(state => ({ controls: { ...state.controls, [key]: value } })),
  resetControls: () => set({ controls: defaultDemoControls }),
}), { name: 'wdex-demo-controls', storage: createJSONStorage(() => sessionStorage) }));
