import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import './tokens.css';
import './components.css';

export function DsButton({ variant = 'primary', loading = false, children, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; loading?: boolean }) {
  return <button className={`ds-button ds-button-${variant}`} type="button" disabled={disabled || loading} aria-busy={loading} {...props}>{loading && <span className="ds-spinner" aria-hidden="true" />}{children}</button>;
}
export function DsField({ label, hint, error, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const fieldId = id || `ds-${label.replace(/\s/g, '-')}`;
  return <label className="ds-field" htmlFor={fieldId}><span>{label}</span><input id={fieldId} aria-invalid={!!error} aria-describedby={error || hint ? `${fieldId}-help` : undefined} {...props} />{(error || hint) && <small id={`${fieldId}-help`} className={error ? 'ds-error-text' : ''}>{error || hint}</small>}</label>;
}
export function DsSelect({ label, children, id, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  const fieldId = id || `ds-${label.replace(/\s/g, '-')}`;
  return <label className="ds-field" htmlFor={fieldId}><span>{label}</span><select id={fieldId} {...props}>{children}</select></label>;
}
export function DsBadge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) { return <span className={`ds-badge ds-badge-${tone}`}>{children}</span>; }
export function DsAlert({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'danger'; title: string; children?: ReactNode }) { return <div className={`ds-alert ds-alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}><strong>{title}</strong>{children && <div>{children}</div>}</div>; }
export function DsCard({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) { return <section className="ds-card">{title && <div className="ds-card-head"><h3>{title}</h3>{actions}</div>}{children}</section>; }
export function DsMetric({ label, value, delta }: { label: string; value: string; delta?: string }) { return <div className="ds-metric"><span>{label}</span><strong>{value}</strong>{delta && <small>{delta}</small>}</div>; }
export function DsEmpty({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) { return <div className="ds-state"><span className="ds-state-icon" aria-hidden="true">◇</span><strong>{title}</strong><p>{detail}</p>{action}</div>; }
export function DsLoading({ label = '正在加载…' }: { label?: string }) { return <div className="ds-state" role="status"><span className="ds-spinner" aria-hidden="true" /><strong>{label}</strong></div>; }
export function DsError({ title = '加载失败', onRetry }: { title?: string; onRetry?: () => void }) { return <div className="ds-state" role="alert"><span className="ds-state-icon" aria-hidden="true">!</span><strong>{title}</strong><p>请稍后重试。</p>{onRetry && <DsButton variant="secondary" onClick={onRetry}>重试</DsButton>}</div>; }
export function DsBreadcrumb({ items }: { items: { label: string; href?: string }[] }) { return <nav className="ds-breadcrumb" aria-label="面包屑">{items.map((item, index) => <span key={`${item.label}-${index}`}>{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <a href={item.href}>{item.label}</a> : <strong aria-current="page">{item.label}</strong>}</span>)}</nav>; }
export function DsTable({ headings, rows }: { headings: string[]; rows: ReactNode[][] }) { return <div className="ds-table-scroll"><table className="ds-table"><thead><tr>{headings.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} data-label={headings[j]}>{cell}</td>)}</tr>)}</tbody></table></div>; }
export function DsPagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) { return <nav className="ds-pagination" aria-label="分页"><DsButton variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>上一页</DsButton><span aria-live="polite">{page} / {pages}</span><DsButton variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>下一页</DsButton></nav>; }
export function DsSidebar({ open, onClose, active, onSelect, items }: { open: boolean; onClose: () => void; active: string; onSelect: (label: string) => void; items: { label: string }[] }) { return <><div className={`ds-scrim ${open ? 'open' : ''}`} onClick={onClose} /><aside className={`ds-sidebar ${open ? 'open' : ''}`} aria-label="示例业务导航"><div className="ds-sidebar-brand"><span className="ds-brand-mark">◇</span> WDEX <b>SaaS</b><button type="button" className="ds-sidebar-close" aria-label="关闭导航" onClick={onClose}>×</button></div><span className="ds-sidebar-caption">发行机构工作台</span><nav>{items.map(item => <button type="button" key={item.label} className={active === item.label ? 'active' : ''} aria-current={active === item.label ? 'page' : undefined} onClick={() => { onSelect(item.label); onClose(); }}>{item.label}</button>)}</nav></aside></>; }
export function DsTopbar({ onMenu, onNotify }: { onMenu: () => void; onNotify: () => void }) { return <header className="ds-topbar"><button className="ds-menu" type="button" aria-label="打开导航" onClick={onMenu}>☰</button><span>Design System / 组件展示</span><div><button type="button" onClick={onNotify} aria-label="查看通知">♢<span className="ds-notify-dot" /></button><span className="ds-avatar" aria-label="演示账户">W</span></div></header>; }
export function DsDialog({ open, title, children, onClose, onConfirm, confirmLabel = '确认' }: { open: boolean; title: string; children: ReactNode; onClose: () => void; onConfirm?: () => void; confirmLabel?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = ref.current; if (!node) return; if (open && !node.open) node.showModal(); if (!open && node.open) node.close(); }, [open]);
  return <dialog ref={ref} className="ds-dialog" onClose={onClose}><form method="dialog" onSubmit={event => { event.preventDefault(); onClose(); }}><div className="ds-dialog-head"><h2>{title}</h2><button type="button" aria-label="关闭弹窗" onClick={onClose}>×</button></div><div>{children}</div><footer><DsButton variant="secondary" onClick={onClose}>取消</DsButton>{onConfirm && <DsButton onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</DsButton>}</footer></form></dialog>;
}
export function DsDrawer({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.querySelector('button')?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); previous?.focus(); };
  }, [open, onClose]);
  return <>{open && <div className="ds-drawer-scrim" onClick={onClose} />}<aside ref={ref} className={`ds-drawer ${open ? 'open' : ''}`} role="dialog" aria-modal={open} aria-hidden={!open} aria-label={title}><div className="ds-dialog-head"><h2>{title}</h2><button type="button" aria-label="关闭抽屉" onClick={onClose}>×</button></div>{children}</aside></>;
}
