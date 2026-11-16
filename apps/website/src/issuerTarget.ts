// Frontend prototype handoff only. A production session must come from the auth service.
export function issuerHomeUrl(): string {
  const configured = import.meta.env.VITE_ISSUER_ORIGIN?.trim();
  const origin = configured || 'http://127.0.0.1:5174';
  return new URL('/', origin).href;
}
