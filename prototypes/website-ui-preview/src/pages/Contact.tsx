import { useState, type FormEvent } from 'react';
import { Button, DemoNotice } from '../site';
import { paths } from '../config';

const topics = ['产品功能与演示', '商业合作', '注册与账户访问', 'Sandbox使用支持', 'Standard订阅与账单', 'Offering平台渠道咨询', '其他问题'];
const topicFromSource: Record<string, string> = { product: topics[0], business: topics[1], account: topics[2], sandbox: topics[3], standard: topics[4], marketplace: topics[5] };
const cards = [
  ['产品与业务咨询', '了解WDEX的资产发行管理能力及企业使用场景。', '产品能力 · 业务适用性'],
  ['企业账户与产品支持', '查找注册、登录、工作台访问及Sandbox操作指引。', '账户访问 · 使用支持'],
  ['Standard与Offering渠道', '了解商业订阅条件，以及独立审核的M平台展示申请边界。', '商业订阅 · Offering渠道'],
];
type FormFields = { topic: string; name: string; email: string; company: string; country: string; phone: string; message: string; privacy: boolean };
const draftKey = 'wdex-contact-draft';
const initialFields = (): FormFields => {
  const empty: FormFields = { topic: '', name: '', email: '', company: '', country: '', phone: '', message: '', privacy: false };
  try { Object.assign(empty, JSON.parse(sessionStorage.getItem(draftKey) || '{}')); } catch { /* corrupted draft is ignored */ }
  empty.privacy = false;
  empty.topic = topicFromSource[new URLSearchParams(location.search).get('topic') || ''] || empty.topic;
  return empty;
};

export function Contact() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [status, setStatus] = useState('');
  const [outcome, setOutcome] = useState('unavailable');
  const [receipt, setReceipt] = useState<{ topic: string; email: string } | null>(null);
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const update = (key: keyof FormFields, value: string | boolean) => { setFields(current => { const next = { ...current, [key]: value }; const { privacy: _privacy, ...draft } = next; void _privacy; sessionStorage.setItem(draftKey, JSON.stringify(draft)); return next; }); setErrors(current => ({ ...current, [key]: undefined })); setStatus(''); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!fields.topic) next.topic = '请选择咨询类型';
    if (!fields.name.trim()) next.name = '请输入联系人姓名';
    if (!fields.email.trim()) next.email = '请输入工作邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = '请输入有效的邮箱地址';
    if (!fields.message.trim()) next.message = '请填写咨询内容';
    if (demoMode && !fields.privacy) next.privacy = '请确认演示说明';
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    if (!demoMode) { setStatus('暂时无法提交，请稍后重试。咨询接收服务尚未接通；您的信息未发送。'); return; }
    if (outcome === 'success') { setReceipt({ topic: fields.topic, email: fields.email.trim() }); sessionStorage.removeItem(draftKey); setStatus(''); return; }
    setStatus(outcome === 'network' ? '网络连接异常，请检查后重试。演示状态：未发送。' : outcome === 'unknown' ? '暂时无法确认提交结果。演示状态：不会自动重复发送。' : outcome === 'rate' ? '提交过于频繁，请稍后再试。演示状态：未发送。' : '暂时无法提交，请稍后重试。咨询接收服务尚未接通；您的信息未发送。');
  };
  return <main className="contact-page">
    <section className="contact-hero"><div className="container"><span className="eyebrow">CONTACT / 联系我们</span><h1>产品咨询与服务支持</h1><p>选择咨询主题并查看当前渠道状态。在线接收服务尚未开放；您可以先查阅使用指南。</p><a className="contact-help-link" href={paths.help}>前往帮助中心 ↗</a></div></section>
    <section className="section contact-content"><div className="container contact-layout"><div className="contact-aside"><span className="eyebrow">HOW CAN WE HELP / 咨询场景</span><h2>找到适合您的<br />咨询方式</h2><div className="contact-cards">{cards.map(([title, body, tags], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p><small>{tags}</small></article>)}</div><p className="contact-boundary">订阅付款应以有权企业工作台中的正式账单为准。请勿通过咨询信息发送付款凭证或敏感资料。</p></div>
    <div className="contact-form-panel">{receipt ? <div className="contact-success" role="status"><span className="eyebrow">演示回执</span><h2>模拟回执已生成</h2><p>这是一份页面状态预览，咨询信息没有发送给团队。</p><div><span>模拟状态</span><strong>已生成回执</strong></div><div><span>咨询类型</span><strong>{receipt.topic}</strong></div><div><span>联系邮箱</span><strong>{receipt.email}</strong></div><div className="button-row"><Button href={paths.home}>返回首页</Button><Button href={paths.help} variant="outline">查看帮助中心</Button></div></div> : <><span className="eyebrow">在线咨询</span><h2>联系我们</h2><p className="form-intro">咨询服务尚未开放。您可以先浏览常见问题与订阅方案说明；正式接收渠道开放后，本页将提供咨询提交。</p>{demoMode ? <form noValidate onSubmit={submit}>
      <label>咨询类型 <i>*</i><select name="topic" value={fields.topic} onChange={e => update('topic', e.target.value)}><option value="">请选择咨询类型</option>{topics.map(x => <option key={x}>{x}</option>)}</select>{errors.topic && <small className="field-error">{errors.topic}</small>}</label>
      <div className="form-two"><label>联系人姓名 <i>*</i><input name="name" maxLength={100} value={fields.name} onChange={e => update('name', e.target.value)} placeholder="请输入您的姓名" />{errors.name && <small className="field-error">{errors.name}</small>}</label><label>工作邮箱 <i>*</i><input name="email" type="email" maxLength={254} value={fields.email} onChange={e => update('email', e.target.value)} placeholder="name@company.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label></div>
      <div className="form-two"><label>企业/机构名称<input name="company" maxLength={150} value={fields.company} onChange={e => update('company', e.target.value)} placeholder="请输入企业或机构名称" /></label><label>所在国家/地区<input name="country" value={fields.country} onChange={e => update('country', e.target.value)} placeholder="请选择所在国家或地区" /></label></div>
      <label>联系电话<input name="phone" maxLength={32} value={fields.phone} onChange={e => update('phone', e.target.value)} placeholder="请输入联系电话（含区号）" /></label>
      <label>咨询内容 <i>*</i><textarea name="message" maxLength={2000} value={fields.message} onChange={e => update('message', e.target.value)} placeholder="请描述您需要了解或解决的问题" rows={6} /><small className="field-counter">{fields.message.length} / 2000</small>{errors.message && <small className="field-error">{errors.message}</small>}</label>
      {demoMode && <label className="privacy-check"><input name="privacy" type="checkbox" checked={fields.privacy} onChange={e => update('privacy', e.target.checked)} /><span>我了解此表单仅用于本地交互演示，信息不会发送。</span></label>}{errors.privacy && <small className="field-error">{errors.privacy}</small>}
      {demoMode && <label className="contact-demo-choice">演示提交结果<select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="unavailable">接收服务未接通</option><option value="success">模拟成功回执</option><option value="network">模拟网络中断</option><option value="unknown">模拟结果未知</option><option value="rate">模拟频繁提交</option></select></label>}
      {status && <p className="inline-notice" role="alert">{status}</p>}<div className="button-row contact-actions">{demoMode && <button className="button button-primary" type="submit">模拟提交<span aria-hidden="true">↗</span></button>}<Button href={paths.help} variant="outline">前往帮助中心</Button></div>{demoMode && <small className="form-hint">本地演示不会发送信息，请勿输入真实敏感资料。</small>}
    </form> : <div className="contact-unavailable"><strong>咨询入口暂未开放</strong><p>当前没有在线接收服务。请先查看产品功能、订阅方案与帮助中心。</p><Button href={paths.help}>查看帮助中心</Button></div>}</>}</div></div></section>
    <div className="preview-strip"><DemoNotice /></div>
  </main>;
}
