import { useEffect, useRef, useState } from 'react';
import { paths } from './config';

const key = 'wdex-storage-notice-v1';
const isAcknowledged = () => { try { return localStorage.getItem(key) === 'acknowledged'; } catch { return false; } };

const isStored = (storage: 'local' | 'session', storageKey: string) => {
  try { return (storage === 'local' ? localStorage : sessionStorage).getItem(storageKey) !== null; }
  catch { return false; }
};

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
    {!acknowledged && !open && <div className="cookie-banner" role="region" aria-label="本地存储提示"><div><strong>本地存储说明</strong><p>本站使用本地存储记住说明确认及演示角色；模拟流程可能用会话存储暂存咨询草稿、邮箱账号辅助状态及企业工作台演示上下文。当前未启用分析或营销追踪。</p><a href={paths.policies + '/cookies'}>查看政策发布状态</a></div><div className="cookie-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button><button type="button" onClick={() => setOpen(true)}>查看说明</button></div></div>}
    {open && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}><div className="modal-card cookie-preferences-card" role="dialog" aria-modal="true" aria-labelledby="cookie-title" ref={dialogRef} tabIndex={-1}>
      <div className="modal-top"><span className="eyebrow">隐私与偏好</span><button className="icon-button" type="button" aria-label="关闭说明" onClick={() => setOpen(false)}>×</button></div>
      <h2 id="cookie-title">本地存储说明</h2>
      <p>以下仅显示本站使用的浏览器存储项目及是否已有记录，不展示草稿或账户内容。当前未启用分析、营销追踪或完整Cookie同意管理。</p>
      <div className="cookie-option"><div><strong>本地存储 · 说明确认</strong><small>记录您已阅读本说明；清除站点数据后会重置。</small></div><span>{isAcknowledged() ? '已确认' : '未确认'}</span></div>
      <div className="cookie-option"><div><strong>本地存储 · 演示角色</strong><small>仅用于UI预览中的访客与企业授权场景切换，不代表真实账户权限。</small></div><span>{isStored('local', 'wdex-demo-role') ? '已保存' : '未保存'}</span></div>
      <div className="cookie-option"><div><strong>会话存储 · 模拟咨询草稿</strong><small>演示表单可能暂存您输入的字段；请勿填写真实敏感资料。</small></div><span>{isStored('session', 'wdex-contact-draft') ? '已保存' : '未保存'}</span></div>
      <div className="cookie-option"><div><strong>会话存储 · 注册与验证演示状态</strong><small>仅供模拟开户和邮箱验证页面展示，不构成真实注册或验证。</small></div><span>{isStored('session', 'wdex-registration-demo') || isStored('session', 'wdex-verification-demo') ? '已保存' : '未保存'}</span></div>
      <div className="cookie-option"><div><strong>会话存储 · 邮箱账号辅助状态</strong><small>临时保存模拟邮箱及条款确认进度；不显示邮箱内容，不构成真实认证。</small></div><span>{isStored('session', 'wdex-auth-pending-account') ? '已保存' : '未保存'}</span></div>
      <div className="cookie-option"><div><strong>会话存储 · 工作台演示上下文</strong><small>仅保存模拟授权场景及所选示例企业，不代表真实权限。</small></div><span>{isStored('session', 'wdex-issuer-demo-auth') || isStored('session', 'wdex-issuer-demo-tenant') ? '已保存' : '未保存'}</span></div>
      <div className="cookie-option"><div><strong>分析与营销追踪</strong><small>当前未启用；未来如启用，须先发布正式政策并提供适用的选择方式。</small></div><span>未启用</span></div>
      <a className="cookie-policy-link" href={paths.policies + '/cookies'}>查看Cookie政策发布状态 ↗</a>
      <div className="modal-actions"><button className="solid" type="button" onClick={acknowledge}>知道了</button></div>
      {message && <p className="cookie-save-status" role="status">{message}</p>}
    </div></div>}
  </>;
}
