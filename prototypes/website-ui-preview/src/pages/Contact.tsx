import { useState, type FormEvent } from 'react';
import { Button, DemoNotice, SectionHeading } from '../site';
import { paths } from '../config';

const topics = ['产品功能与演示', '商业合作', '注册与账户访问', 'Sandbox使用支持', 'Standard订阅与账单', '其他问题'];
const topicFromSource: Record<string, string> = { product: topics[0], business: topics[1], account: topics[2], sandbox: topics[3], standard: topics[4] };
const cards = [
  ['产品与合作咨询', '了解多资产发行、Token管理、独立投资者门户等产品能力，或探讨适合企业的使用场景与商业合作。', '产品演示 · 业务适用性 · 企业合作'],
  ['账户与产品支持', '如果您在注册、登录、企业工作台访问或Sandbox模拟操作过程中遇到问题，可以向我们反馈。', '账户访问 · 操作疑问 · 测试模式'],
  ['订阅与账单协助', 'Standard可以在线自助订阅。若您对商业KYB、USDT网络选择、账单状态或权益开通存在疑问，可以在此寻求人工协助。', '商业KYB · 账单异常 · 订阅权益'],
];
const quickLinks = [
  ['Free体验', '免费创建企业工作台，体验Sandbox业务流程。', '免费开始', paths.register],
  ['Standard订阅', '查看Standard商业方案，准备好后在线自助订阅。', '查看套餐', paths.pricing],
  ['帮助中心', '查阅常见问题、新手教程和使用说明。', '浏览帮助', paths.help],
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
    if (!fields.privacy) next.privacy = '请先确认隐私政策';
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) { document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    if (!demoMode) { setStatus('暂时无法提交，请稍后重试。咨询接收服务尚未接通；您的信息未发送。'); return; }
    if (outcome === 'success') { setReceipt({ topic: fields.topic, email: fields.email.trim() }); sessionStorage.removeItem(draftKey); setStatus(''); return; }
    setStatus(outcome === 'network' ? '网络连接异常，请检查后重试。演示状态：未发送。' : outcome === 'unknown' ? '暂时无法确认提交结果。演示状态：不会自动重复发送。' : outcome === 'rate' ? '提交过于频繁，请稍后再试。演示状态：未发送。' : '暂时无法提交，请稍后重试。咨询接收服务尚未接通；您的信息未发送。');
  };
  return <main className="contact-page">
    <section className="contact-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">CONTACT · 联系我们</span><h1>有问题？<br /><em>我们愿意提供帮助</em></h1><p>如果您希望进一步了解WDEX SaaS、探讨业务合作，或在注册和使用过程中遇到问题，可以通过下方表单联系我们。</p><div className="contact-hero-note">Standard支持在线自助订阅，无需事先联系销售。如果您希望直接开通，请前往套餐页面。</div><div className="button-row"><Button href={paths.pricing}>查看套餐并订阅</Button><Button href={paths.help} variant="outline">浏览帮助中心</Button></div></div></section>
    <section className="section contact-content"><div className="container contact-layout"><div className="contact-aside"><span className="eyebrow">HOW CAN WE HELP / 咨询场景</span><h2>找到适合您的<br />咨询方式</h2><div className="contact-cards">{cards.map(([title, body, tags], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p><small>{tags}</small></article>)}</div><p className="contact-boundary">本咨询入口不是USDT付款页面。咨询文字、截图或交易哈希不能作为商业付款成功或Standard开通的授权证据；须经原企业工作台独立核验。</p></div>
    <div className="contact-form-panel">{receipt ? <div className="contact-success" role="status"><span className="eyebrow">DEMO RECEIPT / 演示回执</span><h2>咨询已提交</h2><p>感谢您联系我们。您的咨询已经成功提交，我们的团队将根据咨询内容进行人工处理。</p><div><span>提交结果</span><strong>成功（仅演示）</strong></div><div><span>咨询类型</span><strong>{receipt.topic}</strong></div><div><span>联系邮箱</span><strong>{receipt.email}</strong></div><p className="inline-notice">当前仅为前端模拟回执，未连接受控接收服务，信息未实际发送。</p><div className="button-row"><Button href={paths.home}>返回首页</Button><Button href={paths.help} variant="outline">查看帮助中心</Button></div></div> : <><span className="eyebrow">SEND AN INQUIRY / 在线咨询</span><h2>给我们留言</h2><p className="form-intro">请填写您的联系方式及问题，我们的团队将根据咨询内容进行人工查看和处理。</p><form noValidate onSubmit={submit}>
      <label>咨询类型 <i>*</i><select name="topic" value={fields.topic} onChange={e => update('topic', e.target.value)}><option value="">请选择咨询类型</option>{topics.map(x => <option key={x}>{x}</option>)}</select>{errors.topic && <small className="field-error">{errors.topic}</small>}</label>
      <div className="form-two"><label>联系人姓名 <i>*</i><input name="name" maxLength={100} value={fields.name} onChange={e => update('name', e.target.value)} placeholder="请输入您的姓名" />{errors.name && <small className="field-error">{errors.name}</small>}</label><label>工作邮箱 <i>*</i><input name="email" type="email" maxLength={254} value={fields.email} onChange={e => update('email', e.target.value)} placeholder="name@company.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label></div>
      <div className="form-two"><label>企业/机构名称<input name="company" maxLength={150} value={fields.company} onChange={e => update('company', e.target.value)} placeholder="请输入企业或机构名称" /></label><label>所在国家/地区<input name="country" value={fields.country} onChange={e => update('country', e.target.value)} placeholder="请选择所在国家或地区" /></label></div>
      <label>联系电话<input name="phone" maxLength={32} value={fields.phone} onChange={e => update('phone', e.target.value)} placeholder="请输入联系电话（含区号）" /></label>
      <label>咨询内容 <i>*</i><textarea name="message" maxLength={2000} value={fields.message} onChange={e => update('message', e.target.value)} placeholder="请描述您需要了解或解决的问题" rows={6} /><small className="field-counter">{fields.message.length} / 2000</small>{errors.message && <small className="field-error">{errors.message}</small>}</label>
      <label className="privacy-check"><input name="privacy" type="checkbox" checked={fields.privacy} onChange={e => update('privacy', e.target.checked)} /><span>我已阅读<a href={paths.policies + '/privacy'}>《隐私政策》</a>，了解所提交的信息将用于处理本次咨询。</span></label>{errors.privacy && <small className="field-error">{errors.privacy}</small>}
      {demoMode && <label className="contact-demo-choice">演示提交结果<select value={outcome} onChange={e => setOutcome(e.target.value)}><option value="unavailable">接收服务未接通</option><option value="success">模拟成功回执</option><option value="network">模拟网络中断</option><option value="unknown">模拟结果未知</option><option value="rate">模拟频繁提交</option></select></label>}
      {status && <p className="inline-notice" role="alert">{status}</p>}<div className="button-row contact-actions"><button className="button button-primary" type="submit">提交咨询<span aria-hidden="true">↗</span></button><Button href={paths.help} variant="outline">返回帮助中心</Button></div><small className="form-hint">当前为UI预览；正式咨询接收渠道尚未接通，请勿输入真实敏感资料。</small>
    </form></>}</div></div></section>
    <section className="section contact-quick"><div className="container"><SectionHeading center eyebrow="SELF SERVICE / 自助入口" title="您也可以直接开始" /><div className="contact-quick-grid">{quickLinks.map(([title, body, label, href]) => <article key={title}><h3>{title}</h3><p>{body}</p><Button variant="text" href={href}>{label}</Button></article>)}</div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
