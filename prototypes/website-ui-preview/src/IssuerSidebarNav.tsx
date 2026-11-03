import { useState } from 'react';
import { activeSection, issuerNavigation, navPathIsActive } from './issuerNavigation';

export function IssuerSidebarNav({ query }: { query: string }) {
  const path = location.pathname;
  const selected = activeSection(path);
  const [expanded, setExpanded] = useState<string[]>(() => selected?.children ? [selected.label] : []);
  const toggle = (label: string) => setExpanded(current => current.includes(label) ? current.filter(item => item !== label) : [...current, label]);
  const link = (target: string) => `${target}?${query}`;
  return <nav className="issuer-navigation" aria-label="发行机构业务导航">{issuerNavigation.map(section => {
    const active = selected?.label === section.label;
    const open = expanded.includes(section.label);
    const childId = `issuer-nav-${section.path.split('/').at(-1)}`;
    return <div className="issuer-nav-section" key={section.label}>
      <div className="issuer-nav-row">
        <a href={link(section.path)} className={active ? 'active' : ''} aria-current={path === section.path ? 'page' : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={section.icon} /></svg><span>{section.label}</span>
        </a>
        {section.children && <button type="button" className="issuer-nav-toggle" aria-label={`${open ? '收起' : '展开'}${section.label}子菜单`} aria-expanded={open} aria-controls={childId} onClick={() => toggle(section.label)}><span aria-hidden="true">⌄</span></button>}
      </div>
      {section.children && <div id={childId} className="issuer-subnav" hidden={!open}>{section.children.map(item => <a href={link(item.path)} key={item.path} className={navPathIsActive(path, item.path) ? 'active' : ''} aria-current={navPathIsActive(path, item.path) ? 'page' : undefined}>{item.label}</a>)}</div>}
    </div>;
  })}</nav>;
}
