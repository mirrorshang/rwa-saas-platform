import { useEffect, useRef, useState } from 'react';
import { resetAuthDemoScenario } from './authDemo';
import { useDemoControls, type DemoControls } from './demoControls';
import { getDemoAuth, getDemoTenant, resetDemoScenario } from './issuerDemo';
import { getKybCase } from './issuerB04Demo';
import { getUpgradeIntent } from './issuerB03Demo';
import type { DemoRole } from './site';
import './demoControlPanel.scss';

const groups: { title: string; controls: { key: keyof DemoControls; label: string; options: [string, string][] }[] }[] = [
  { title: '账号与登录', controls: [
    { key: 'mail', label: '邮件请求', options: [['accepted', '成功'], ['unavailable', '服务不可用'], ['network', '网络异常'], ['unknown', '结果未知'], ['rate', '请求限频']] },
    { key: 'code', label: '验证码', options: [['accepted', '正确'], ['wrong', '错误'], ['expired', '过期'], ['used', '已使用'], ['network', '网络异常'], ['unknown', '结果未知'], ['restricted', '账号受限']] },
    { key: 'account', label: '账号识别', options: [['existing', '已有账号'], ['new', '新账号']] },
  ] },
  { title: '企业创建与访问', controls: [
    { key: 'create', label: '创建结果', options: [['success', '成功'], ['failed', '失败'], ['partial', '部分成功'], ['unknown', '结果未知']] },
    { key: 'access', label: '成员访问', options: [['allowed', '有效'], ['revoked', '已撤权'], ['expired', '会话过期'], ['unknown', '结果未知']] },
    { key: 'profile', label: '资料保存', options: [['saved', '成功'], ['failed', '失败'], ['unknown', '结果未知'], ['conflict', '版本冲突']] },
  ] },
  { title: '企业认证', controls: [
    { key: 'kybUpload', label: '材料上传', options: [['success', '成功'], ['failed', '失败']] },
    { key: 'kybResult', label: '原申请状态展示', options: [['actual', '原状态'], ['reviewing', '审核中'], ['supplement', '需补件'], ['rejected', '未通过'], ['unknown', '结果未知']] },
    { key: 'kybRead', label: '原申请读取', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] },
  ] },
  { title: '订阅与付款', controls: [
    { key: 'upgrade', label: '原升级申请', options: [['preparing', '原状态'], ['processing', '处理中'], ['failed', '未完成'], ['unknown', '结果未知']] },
    { key: 'payment', label: '付款记录查询', options: [['unavailable', '暂无账单'], ['unknown', '结果未知']] },
    { key: 'entitlement', label: '商业权益查询', options: [['unavailable', '原状态'], ['pending', '核实中']] },
    { key: 'billingRead', label: '账单读取', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] },
  ] },
  { title: '通用状态', controls: [{ key: 'panel', label: '工作台数据', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] }] },
];
const roles: [DemoRole, string][] = [['visitor', '访客'], ['single', '已有单企业'], ['multiple', '已有多企业'], ['create', '新账号／无企业'], ['none', '无企业授权'], ['restricted', '受限账号'], ['invited', '待处理邀请'], ['no-subscription', '普通企业成员'], ['standard', 'Standard已开通'], ['upgrading', '升级处理中']];
const presets: [string, DemoRole, Partial<DemoControls>][] = [
  ['新用户首次进入', 'create', { account: 'new' }], ['已有单企业用户', 'single', {}], ['多企业用户', 'multiple', {}],
  ['普通企业成员', 'no-subscription', {}], ['Standard升级流程', 'upgrading', { upgrade: 'processing' }],
  ['付款结果未知', 'single', { payment: 'unknown' }], ['Standard已开通', 'standard', {}],
];

export function DemoControlPanel({ role, setRole }: { role: DemoRole; setRole: (role: DemoRole) => void }) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const controls = useDemoControls(state => state.controls);
  const setControl = useDemoControls(state => state.setControl);
  const resetControls = useDemoControls(state => state.resetControls);
  const hasActiveAuth = Boolean(getDemoAuth());
  const currentTenant = getDemoTenant();
  const hasKybCase = currentTenant ? Boolean(getKybCase(currentTenant)) : false;
  const hasUpgradeIntent = currentTenant ? Boolean(getUpgradeIntent(currentTenant)) : false;
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button,select')?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); setConfirmReset(false); button.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const choosePreset = (next: [string, DemoRole, Partial<DemoControls>]) => {
    if (hasActiveAuth) return;
    resetControls();
    setRole(next[1]);
    for (const [key, value] of Object.entries(next[2])) setControl(key as keyof DemoControls, value as DemoControls[keyof DemoControls]);
    // A preset changes only test controls. Existing entered records are kept until explicit reset.
  };
  const reset = () => {
    resetDemoScenario(); resetAuthDemoScenario(); resetControls(); setRole('visitor'); setConfirmReset(false); setOpen(false);
    location.href = '/login?demo=1';
  };
  return <div className="demo-control-root">
    <button ref={button} className="demo-control-trigger" type="button" aria-label="打开演示控制" aria-expanded={open} onClick={() => setOpen(!open)}>⚙</button>
    {open && <div className="demo-control-backdrop" onClick={() => setOpen(false)}><div ref={panel} className="demo-control-panel" role="dialog" aria-modal="true" aria-label="演示控制" onClick={event => event.stopPropagation()}>
      <div className="demo-control-head"><div><strong>演示控制</strong><small>只调整本地测试场景</small></div><button type="button" aria-label="关闭演示控制" onClick={() => { setOpen(false); button.current?.focus(); }}>×</button></div>
      <label>账号场景<select value={role} disabled={hasActiveAuth} onChange={event => setRole(event.target.value as DemoRole)}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p className="demo-control-note">{hasActiveAuth ? '请先退出当前企业，再选择其他账号场景；已填写的企业资料不会因选择预设场景而清除。' : '账号场景在下一次登录时生效；其他状态按当前页面展示。切换场景不会删除已填写资料。'}</p>
      <div className="demo-control-presets" aria-label="常用场景">{presets.map(item => <button key={item[0]} type="button" disabled={hasActiveAuth} onClick={() => choosePreset(item)}>{item[0]}</button>)}</div>
      <div className="demo-control-groups" role="tablist" aria-label="状态类别">{groups.map((group, index) => <button type="button" role="tab" aria-selected={activeGroup === index} key={group.title} onClick={() => setActiveGroup(index)}>{group.title}</button>)}</div>
      {activeGroup === 2 && <p className="demo-control-note">材料上传可在认证资料编辑时测试。原申请状态仅在当前企业已有申请时可切换展示，不能创建申请或绕过提交校验。{!hasKybCase && '当前企业没有原申请。'}</p>}
      {activeGroup === 3 && <p className="demo-control-note">SaaS服务协议尚未发布，协议同意与付款确认不能在此切换。升级进度仅在当前企业已有申请时可预览；账单与权益查询不创建商业记录。</p>}
      <div className="demo-control-fields" role="tabpanel">{groups[activeGroup].controls.map(item => <label key={item.key}>{item.label}<select value={controls[item.key]} disabled={(item.key === 'kybResult' && !hasKybCase) || (item.key === 'upgrade' && !hasUpgradeIntent)} onChange={event => setControl(item.key, event.target.value as DemoControls[typeof item.key])}>{item.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div>
      <div className="demo-control-foot">{confirmReset ? <div role="alert"><p>重置将删除本地账号、企业及草稿数据。确定继续？</p><button type="button" onClick={() => setConfirmReset(false)}>取消</button><button type="button" onClick={reset}>确认重置</button></div> : <button type="button" onClick={() => setConfirmReset(true)}>重置演示数据</button>}</div>
    </div></div>}
  </div>;
}
