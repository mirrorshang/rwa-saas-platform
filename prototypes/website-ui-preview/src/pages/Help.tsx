import { useState } from 'react';
import { Button, DemoNotice, SectionHeading, demoRoute } from '../site';
import { paths } from '../config';
import { getDemoAuth } from '../issuerDemo';
import { helpQuestions, helpTutorials } from './helpData';

const categories = ['全部问题', '账户与企业', '订阅与账单', '资产与发行', '投资者与Token'];

export function Help() {
  const [category, setCategory] = useState('全部问题');
  const [openQuestion, setOpenQuestion] = useState(() => {
    const match = location.hash.match(/^#question-(\d+)$/);
    return match ? Number(match[1]) : 1;
  });
  const [openTutorial, setOpenTutorial] = useState(-1);
  const questions = category === '全部问题' ? helpQuestions : helpQuestions.filter(item => item.category === category);
  const tutorialHref = (index: number) => index === 0 || index === 5 ? paths.pricing : index >= 2 ? paths.features : demoRoute(getDemoAuth() ? paths.issuer : paths.login);
  return <main className="help-page">
    <section className="help-hero"><div className="container"><span className="eyebrow">SUPPORT / 使用指南</span><h1>帮助中心</h1><p>查找注册、企业工作台、发行管理和订阅相关指引。</p><div className="help-hero-links"><a href="#questions">常见问题 ↓</a><a href="#tutorials">使用教程 ↓</a><a href="#support">联系支持 ↓</a></div></div></section>
    <section className="section help-faq-section" id="questions"><div className="container"><SectionHeading eyebrow="FAQ / 常见问题" title="按问题查找答案" description="现有18条常见问题，按业务主题筛选。" /><div className="help-categories" aria-label="问题分类">{categories.map(item => <button type="button" aria-pressed={category === item} className={category === item ? 'active' : ''} key={item} onClick={() => { setCategory(item); setOpenQuestion(item === '全部问题' ? 1 : helpQuestions.find(q => q.category === item)?.id ?? -1); }}>{item}</button>)}</div>{questions.length ? <div className="faq-list">{questions.map(item => <div className={`faq-item ${openQuestion === item.id ? 'active' : ''}`} id={`question-${item.id}`} key={item.id}><button type="button" aria-expanded={openQuestion === item.id} onClick={() => setOpenQuestion(openQuestion === item.id ? -1 : item.id)}><span><small>{String(item.id).padStart(2, '0')} / {item.category}</small>{item.question}</span><span>{openQuestion === item.id ? '−' : '+'}</span></button>{openQuestion === item.id && <p>{item.answer}</p>}</div>)}</div> : <div className="help-empty">当前分类暂无相关内容 <button type="button" onClick={() => { setCategory('全部问题'); setOpenQuestion(1); }}>返回全部问题</button></div>}</div></section>
    <section className="section help-tutorial-section" id="tutorials"><div className="container"><SectionHeading eyebrow="GETTING STARTED / 新手教程" title="从零开始了解WDEX SaaS" description="六篇教程说明企业工作台的主要流程；实际开通以服务状态为准。" /><div className="tutorial-grid">{helpTutorials.map((item, index) => <article className={`tutorial-card ${openTutorial === index ? 'expanded' : ''}`} key={item.number}><button type="button" className="tutorial-trigger" aria-expanded={openTutorial === index} onClick={() => setOpenTutorial(openTutorial === index ? -1 : index)}><span className="tutorial-index">{item.number}</span><span><strong>{item.title}</strong><small>{item.intro}</small></span><b>{openTutorial === index ? '−' : '+'}</b></button>{openTutorial === index && <div className="tutorial-detail"><span className="eyebrow">操作步骤</span><ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="tutorial-note"><strong>注意：</strong>{item.note}</p><Button href={tutorialHref(index)}>{item.cta}</Button></div>}</article>)}</div></div></section>
    <section className="section help-support-section" id="support"><div className="container"><SectionHeading eyebrow="SUPPORT / 联系支持" title="还需要帮助？" description="咨询接收服务尚未开放，可先查看对应主题的联系状态。" /><div className="support-grid"><article><span className="support-symbol">◫</span><h3>企业账户与使用</h3><p>注册、登录、工作台访问及Sandbox操作问题。</p><Button href={paths.contact + '?topic=account'} variant="outline">查看联系状态</Button></article><article><span className="support-symbol">◇</span><h3>商业订阅</h3><p>Standard方案、企业审核与订阅流程问题。</p><Button href={paths.contact + '?topic=standard'} variant="outline">查看联系状态</Button></article></div></div></section><div className="preview-strip"><DemoNotice /></div>
  </main>;
}
