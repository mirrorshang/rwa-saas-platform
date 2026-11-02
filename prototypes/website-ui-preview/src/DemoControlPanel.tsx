import { useEffect, useRef, useState } from 'react';
import { resetAuthDemoScenario } from './authDemo';
import { useDemoControls, type DemoControls } from './demoControls';
import { resetDemoScenario } from './issuerDemo';
import type { DemoRole } from './site';

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
    { key: 'kybSubmit', label: '申请提交', options: [['reviewing', '审核中'], ['failed', '失败'], ['unknown', '结果未知'], ['conflict', '版本冲突']] },
    { key: 'kybResult', label: '审核状态', options: [['reviewing', '审核中'], ['supplement', '需补件'], ['rejected', '未通过'], ['unknown', '结果未知'], ['passed-preview', '通过展示']] },
    { key: 'kybRead', label: '原申请读取', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] },
  ] },
  { title: '订阅与付款', controls: [
    { key: 'upgrade', label: '升级进度', options: [['preparing', '准备中'], ['processing', '处理中'], ['failed', '失败'], ['unknown', '结果未知'], ['mock-complete', '已开通展示']] },
    { key: 'contract', label: '协议状态', options: [['unpublished', '未发布'], ['reading', '阅读中'], ['read-confirmed', '已确认阅读'], ['signature-unknown', '结果未知'], ['effective-preview', '生效展示']] },
    { key: 'payment', label: '付款状态', options: [['unavailable', '暂无账单'], ['unknown', '结果未知'], ['observed', '交易已观察'], ['matching', '实收待核实'], ['matched', '核款成功']] },
    { key: 'entitlement', label: '商业权益', options: [['unavailable', '未开通'], ['pending', '开通中'], ['activated-preview', '已开通展示']] },
    { key: 'billingRead', label: '账单读取', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] },
  ] },
  { title: '通用状态', controls: [{ key: 'panel', label: '工作台数据', options: [['ready', '正常'], ['loading', '加载中'], ['failed', '失败'], ['unknown', '结果未知']] }] },
];
const roles: [DemoRole, string][] = [['visitor', '访客'], ['single', '已有单企业'], ['multiple', '已有多企业'], ['create', '新账号／无企业'], ['none', '无企业授权'], ['restricted', '受限账号'], ['invited', '待处理邀请'], ['no-subscription', '普通企业成员'], ['standard', 'Standard已开通'], ['upgrading', '升级处理中']];
const presets: [string, DemoRole, Partial<DemoControls>][] = [
  ['新用户首次进入', 'create', { account: 'new' }], ['已有单企业用户', 'single', {}], ['多企业用户', 'multiple', {}],
  ['普通企业成员', 'no-subscription', {}], ['KYB审核中', 'single', { kybResult: 'reviewing' }],
  ['KYB需要补件', 'single', { kybResult: 'supplement' }], ['Standard升级流程', 'upgrading', { upgrade: 'processing' }],
  ['付款结果未知', 'single', { payment: 'unknown' }], ['Standard已开通', 'standard', { entitlement: 'activated-preview' }],
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
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button,select')?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); setConfirmReset(false); button.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const choosePreset = (next: [string, DemoRole, Partial<DemoControls>]) => {
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
      <label>账号场景<select value={role} onChange={event => setRole(event.target.value as DemoRole)}>{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p className="demo-control-note">账号场景在下一次登录时生效；其他状态按当前页面展示。切换场景不会删除已填写资料。</p>
      <div className="demo-control-presets" aria-label="常用场景">{presets.map(item => <button key={item[0]} type="button" onClick={() => choosePreset(item)}>{item[0]}</button>)}</div>
      <div className="demo-control-groups" role="tablist" aria-label="状态类别">{groups.map((group, index) => <button type="button" role="tab" aria-selected={activeGroup === index} key={group.title} onClick={() => setActiveGroup(index)}>{group.title}</button>)}</div>
      {activeGroup === 2 && <p className="demo-control-note">认证状态仅用于页面展示；没有原申请或适用规则时，不能产生审核结论，也不能绕过提交校验。</p>}
      {activeGroup === 3 && <p className="demo-control-note">协议、账单和付款状态不会创建正式合同、账单或付款指令。</p>}
      <div className="demo-control-fields" role="tabpanel">{groups[activeGroup].controls.map(item => <label key={item.key}>{item.label}<select value={controls[item.key]} onChange={event => setControl(item.key, event.target.value as DemoControls[typeof item.key])}>{item.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div>
      <div className="demo-control-foot">{confirmReset ? <div role="alert"><p>重置将删除本地账号、企业及草稿数据。确定继续？</p><button type="button" onClick={() => setConfirmReset(false)}>取消</button><button type="button" onClick={reset}>确认重置</button></div> : <button type="button" onClick={() => setConfirmReset(true)}>重置演示数据</button>}</div>
    </div></div>}
  </div>;
}
