import { useEffect, useRef, useState } from 'react';
import { paths } from './config';

type SavedPreference = {
  version: 1;
  scope: 'website-preview';
  necessary: true;
  functional: false;
  analytics: false;
  marketing: false;
  action: 'accept-available' | 'reject-optional' | 'save-selection';
  savedAt: string;
};
const key = 'wdex-cookie-preferences-v1';
const noOptionalTools = { functional: false, analytics: false, marketing: false } as const;
function readPreference(): SavedPreference | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SavedPreference>;
    if (value.version !== 1 || value.scope !== 'website-preview' || value.necessary !== true ||
      value.functional !== false || value.analytics !== false || value.marketing !== false ||
      !value.savedAt || !['accept-available', 'reject-optional', 'save-selection'].includes(value.action || '')) return null;
    return value as SavedPreference;
  } catch { return null; }
}

export function CookiePreferences({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const [saved, setSaved] = useState(readPreference);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const close = () => { if (saving) return; setOpen(false); };
  useEffect(() => {
    if (open || status !== '您的Cookie偏好已保存') return;
    const timer = window.setTimeout(() => setStatus(''), 5000);
    return () => window.clearTimeout(timer);
  }, [open, status]);
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('wdex-open-cookie-preferences', handler);
    return () => window.removeEventListener('wdex-open-cookie-preferences', handler);
  }, [setOpen]);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (!saving) setOpen(false); }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previousFocus.current?.focus(); };
  }, [open, saving, setOpen]);
  const save = async (action: SavedPreference['action']) => {
    if (saving) return;
    setSaving(true);
    setStatus('正在保存偏好…');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const next: SavedPreference = { version: 1, scope: 'website-preview', necessary: true, ...noOptionalTools, action, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(key, JSON.stringify(next));
      if (localStorage.getItem(key) !== JSON.stringify(next)) throw new Error('存储未确认');
      setSaved(next);
      setStatus('您的Cookie偏好已保存');
      setOpen(false);
    } catch {
      setStatus('暂时无法保存偏好，请重试');
    } finally {
      setSaving(false);
    }
  };
  return <>
    {!saved && !open && <div className="cookie-banner" role="region" aria-label="Cookie提示条"><div><strong>我们重视您的隐私</strong><p>我们使用必要的Cookie保障网站正常运行。在您允许的情况下，我们也可能使用其他Cookie来改善使用体验、分析网站表现或提供相关内容。您可以接受、拒绝非必要Cookie，或自行管理偏好。</p><a href={paths.policies + '/cookies'}>了解更多</a><small>当前UI预览未接入分析、营销或其他非必要追踪工具。</small></div><div className="cookie-actions"><button className="solid" type="button" onClick={() => void save('accept-available')} disabled={saving}>接受全部</button><button type="button" onClick={() => void save('reject-optional')} disabled={saving}>拒绝非必要</button><button type="button" onClick={() => setOpen(true)}>管理偏好</button></div></div>}
    {open && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}><div className="modal-card cookie-preferences-card" role="dialog" aria-modal="true" aria-labelledby="cookie-title" ref={dialogRef} tabIndex={-1}><div className="modal-top"><span className="eyebrow">隐私与偏好</span><button className="icon-button" type="button" aria-label="关闭Cookie偏好" onClick={close}>×</button></div><h2 id="cookie-title">管理Cookie偏好</h2><p>您可以根据需要选择允许的Cookie类别。必要Cookie用于保障网站基本功能，其他类别可根据实际使用情况进行选择。</p><a className="cookie-policy-link" href={paths.policies + '/cookies'}>阅读完整Cookie政策 ↗</a><div className="cookie-option"><div><strong>必要Cookie</strong><small>这些技术对于网站的基本运行、安全及必要服务不可或缺，因此不能通过本设置关闭。实际哪些Cookie属于必要用途，需经技术清单与适用法律确认。</small></div><span>始终开启</span></div><div className="cookie-unavailable-heading">以下可选类别当前未部署，仅作页面说明</div><div className="cookie-option"><div><strong>功能与偏好Cookie</strong><small>这些Cookie帮助网站记住您主动选择的可选偏好。关闭后，部分非必要个性化设置可能无法保留。</small></div><span>未启用</span></div><div className="cookie-option"><div><strong>分析与统计Cookie</strong><small>这些Cookie帮助我们了解网站的整体使用情况，以改进页面和产品体验。</small></div><span>未启用</span></div><div className="cookie-option"><div><strong>营销与推广Cookie</strong><small>如果平台实际使用营销或推广相关技术，您可以在此决定是否允许相应非必要处理。</small></div><span>未启用</span></div><p className="cookie-scope-note">当前只有官网前端本地预览偏好记录。接受全部仅覆盖实际可用且合法应询问的类别；此预览中没有可启用的非必要工具。此选择不适用于其他企业工作台或投资者门户。</p>{saved && <p className="cookie-saved-note">当前已保存：{saved.action === 'accept-available' ? '接受当前可用类别' : '拒绝非必要类别'} · {new Date(saved.savedAt).toLocaleString('zh-CN')}</p>}{status && <p className="cookie-save-status" role="status">{status}</p>}<div className="modal-actions"><button className="solid" type="button" onClick={() => void save('save-selection')} disabled={saving}>保存我的选择</button><button type="button" onClick={() => void save('reject-optional')} disabled={saving}>拒绝非必要</button><button type="button" onClick={() => void save('accept-available')} disabled={saving}>接受全部</button></div></div></div>}
    {!open && status && <div className="cookie-toast" role="status">{status}</div>}
  </>;
}
