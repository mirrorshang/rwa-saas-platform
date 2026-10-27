import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, useDemoRole } from '../site';
import { paths } from '../config';
import { helpQuestions, helpTutorials } from './helpData';

const categories = ['全部问题', '账户与企业', '套餐与订阅', '资产与发行', '投资者与Token'];
const shortcuts = [
  ['01', '开始使用', '第一次使用？了解如何注册和创建企业工作台。', '#tutorials'],
  ['02', '常见问题', '关于套餐、投资者门户与Token发行的常见疑问。', '#questions'],
  ['03', '联系支持', '没找到答案？查看联系渠道的开放状态。', '#support'],
];

export function Help() {
  const [role] = useDemoRole();
  const [category, setCategory] = useState('全部问题');
  const [openQuestion, setOpenQuestion] = useState(() => {
    const match = location.hash.match(/^#question-(\d+)$/);
    return match ? Number(match[1]) : 1;
  });
  const [openTutorial, setOpenTutorial] = useState(-1);
  const questions = category === '全部问题' ? helpQuestions : helpQuestions.filter(item => item.category === category);
  const workspaceHref = role === 'visitor' ? paths.register : role === 'multiple' || role === 'none' ? paths.organizations : paths.onboarding;
  const tutorialHref = (index: number) => index === 5 ? paths.pricing : index === 0 ? paths.register : workspaceHref;
  return <main className="help-page">
    <section className="help-hero"><div className="network-grid" /><div className="container"><span className="eyebrow">HELP CENTER · 帮助中心</span><h1>需要帮助？<br /><em>从这里开始</em></h1><p>了解WDEX SaaS的注册、套餐、资产发行管理和Sandbox使用方法，快速找到常见问题的答案。</p></div></section>
    <section className="help-shortcuts"><div className="container"><div className="help-shortcuts-grid">{shortcuts.map(([number, title, body, href]) => <a href={href} key={number}><span>{number} / 快捷入口</span><h2>{title}<b aria-hidden="true">↗</b></h2><p>{body}</p></a>)}</div></div></section>
    <section className="section help-faq-section" id="questions"><div className="container"><SectionHeading eyebrow="FAQ / 常见问题" title="常见问题与解答" description="根据您的使用场景选择分类，查看具体说明。" /><div className="help-categories" role="tablist" aria-label="问题分类">{categories.map(item => <button type="button" role="tab" aria-selected={category === item} className={category === item ? 'active' : ''} key={item} onClick={() => { setCategory(item); setOpenQuestion(item === '全部问题' ? 1 : helpQuestions.find(q => q.category === item)?.id ?? -1); }}>{item}</button>)}</div>{questions.length ? <div className="faq-list">{questions.map(item => <div className={`faq-item ${openQuestion === item.id ? 'active' : ''}`} id={`question-${item.id}`} key={item.id}><button type="button" aria-expanded={openQuestion === item.id} onClick={() => setOpenQuestion(openQuestion === item.id ? -1 : item.id)}><span><small>{String(item.id).padStart(2, '0')} / {item.category}</small>{item.question}</span><span>{openQuestion === item.id ? '−' : '+'}</span></button>{openQuestion === item.id && <p>{item.answer}</p>}</div>)}</div> : <div className="help-empty">当前分类暂无相关内容 <button type="button" onClick={() => { setCategory('全部问题'); setOpenQuestion(1); }}>返回全部问题</button></div>}</div></section>
    <section className="section help-tutorial-section" id="tutorials"><div className="container"><SectionHeading eyebrow="GETTING STARTED / 新手教程" title="从零开始使用WDEX SaaS" description="按照以下指南熟悉企业工作台，逐步体验资产发行管理流程。" /><div className="tutorial-grid">{helpTutorials.map((item, index) => <article className={`tutorial-card ${openTutorial === index ? 'expanded' : ''}`} key={item.number}><button type="button" className="tutorial-trigger" aria-expanded={openTutorial === index} onClick={() => setOpenTutorial(openTutorial === index ? -1 : index)}><span className="tutorial-index">{item.number}</span><span><strong>{item.title}</strong><small>{item.intro}</small></span><b>{openTutorial === index ? '−' : '+'}</b></button>{openTutorial === index && <div className="tutorial-detail"><span className="eyebrow">操作步骤</span><ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="tutorial-note"><strong>注意：</strong>{item.note}</p><Button href={tutorialHref(index)}>{item.cta}</Button></div>}</article>)}</div></div></section>
    <section className="section help-support-section" id="support"><div className="container"><SectionHeading center eyebrow="SUPPORT / 联系支持" title="仍然需要帮助？" description="如果常见问题和新手教程没有解决您的疑问，可查看联系渠道的开放状态。" /><div className="support-grid"><article><span className="support-symbol">◫</span><h3>产品使用咨询</h3><p>适合注册、工作台访问、Sandbox使用和操作方面的问题。</p><Button href={paths.contact + '?topic=account'} variant="outline">查看联系状态</Button></article><article><span className="support-symbol">◇</span><h3>商业与套餐咨询</h3><p>适合商业合作、订阅疑问或需要人工协助的问题；正式方案发布后可由有权限的管理员办理订阅。</p><div className="button-row"><Button href={paths.contact + '?topic=standard'} variant="outline">查看联系状态</Button><Button href={paths.pricing} variant="text">查看Standard方案</Button></div></article></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
