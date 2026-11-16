declare const __WDEX_DEMO_BUILD__: boolean;

const demoSessionKey = 'wdex-local-demo-session';

export function isLocalPreview() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '[::1]';
}

export function canUseLocalDemo() {
  return isLocalPreview() && (import.meta.env.DEV || __WDEX_DEMO_BUILD__);
}

export function isDemoPreview() {
  if (!canUseLocalDemo()) return false;
  if (__WDEX_DEMO_BUILD__) return true;
  try {
    if (new URLSearchParams(location.search).get('demo') === '1') {
      sessionStorage.setItem(demoSessionKey, '1');
      return true;
    }
    return sessionStorage.getItem(demoSessionKey) === '1';
  } catch {
    return new URLSearchParams(location.search).get('demo') === '1';
  }
}

export function demoRoute(path: string) {
  if (!canUseLocalDemo()) return path;
  const target = new URL(path, location.origin);
  if (target.origin !== location.origin) return path;
  target.searchParams.set('demo', '1');
  return target.pathname + target.search + target.hash;
}

// Keep local demo navigation within one browser tab, including ordinary links and legacy routes.
export function preserveDemoLink(event: MouseEvent) {
  if (!isDemoPreview()) return;
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!(link instanceof HTMLAnchorElement)) return;
  const target = new URL(link.href);
  if (target.origin !== location.origin) return;
  target.searchParams.set('demo', '1');
  link.href = target.href;
}
