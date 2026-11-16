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
    {!acknowledged && !open && <div className="cookie-banner" role="region" aria-label="本地存储提示"><div><strong>本地存储说明</strong><p>本站使用浏览器存储保存说明确认、页面偏好及会话中的表单信息。当前未启用分析或营销追踪。</p><a href={paths.policies + '/cookies'}>查看政策发布状态</a></div><div className="cookie-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button><button type="button" onClick={() => setOpen(true)}>查看说明</button></div></div>}
    {open && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><div className="modal-card cookie-preferences-card" role="dialog" aria-modal="true" aria-labelledby="cookie-title" ref={dialogRef} tabIndex={-1}>
      <div className="modal-top"><span className="eyebrow">隐私与偏好</span><button className="icon-button" type="button" aria-label="关闭说明" onClick={() => setOpen(false)}>×</button></div>
      <h2 id="cookie-title">本地存储说明</h2>
      <p>本站使用浏览器存储记住您已阅读本说明，并在当前会话中保留您填写的表单和企业工作台所需信息。您可以通过浏览器设置清除站点数据；清除后可能需要重新填写资料或登录。</p>
      <p>当前未启用分析或营销追踪，也未提供完整的 Cookie 同意管理。这里不会展示您填写的内容。</p>
      <div className="cookie-option"><div><strong>本地存储说明</strong><small>记录您是否已确认本说明。</small></div><span>{isAcknowledged() ? '已确认' : '未确认'}</span></div>
      <a className="cookie-policy-link" href={paths.policies + '/cookies'}>查看Cookie政策发布状态 ↗</a>
      <div className="modal-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button></div>
      {message && <p className="cookie-save-status" role="status">{message}</p>}
    </div></div>}
  </>;
}
