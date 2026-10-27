import { useEffect, useRef, useState } from 'react';
import { paths } from './config';

const key = 'wdex-storage-notice-v1';
const isAcknowledged = () => { try { return localStorage.getItem(key) === 'acknowledged'; } catch { return false; } };

export function CookiePreferences({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const [acknowledged, setAcknowledged] = useState(isAcknowledged);
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('wdex-open-cookie-preferences', show);
    return () => window.removeEventListener('wdex-open-cookie-preferences', show);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); return; }
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
  }, [open, setOpen]);

  const acknowledge = () => {
    try { localStorage.setItem(key, 'acknowledged'); setAcknowledged(true); setOpen(false); setMessage('说明已确认'); }
    catch { setMessage('无法保存到浏览器，您仍可继续浏览。'); }
  };

  return <>
    {!acknowledged && !open && <div className="cookie-banner" role="region" aria-label="本地存储提示"><div><strong>本地存储说明</strong><p>本网站使用浏览器本地存储保存必要的页面偏好。当前未启用分析或营销追踪；正式Cookie政策发布后可在此查看。</p><a href={paths.policies + '/cookies'}>查看政策发布状态</a></div><div className="cookie-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button><button type="button" onClick={() => setOpen(true)}>查看说明</button></div></div>}
    {open && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><div className="modal-card cookie-preferences-card" role="dialog" aria-modal="true" aria-labelledby="cookie-title" ref={dialogRef} tabIndex={-1}><div className="modal-top"><span className="eyebrow">隐私与偏好</span><button className="icon-button" type="button" aria-label="关闭说明" onClick={() => setOpen(false)}>×</button></div><h2 id="cookie-title">本地存储说明</h2><p>网站使用浏览器本地存储记住您是否已阅读本说明。当前没有可选择启用的分析、营销或其他非必要追踪类别。</p><div className="cookie-option"><div><strong>必要的页面偏好</strong><small>用于保留本说明的确认状态。清除浏览器站点数据后，该状态会被重置。</small></div><span>当前使用</span></div><div className="cookie-option"><div><strong>分析与营销追踪</strong><small>当前未启用。若未来启用，将先公布正式政策并提供适用的选择方式。</small></div><span>未启用</span></div><a className="cookie-policy-link" href={paths.policies + '/cookies'}>查看Cookie政策发布状态 ↗</a><div className="modal-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button></div>{message && <p className="cookie-save-status" role="status">{message}</p>}</div></div>}
  </>;
}
