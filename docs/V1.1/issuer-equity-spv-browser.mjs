import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = 'D:/360MoveData/Users/82623/Documents/ChatGPT/RWA SAAS/.worktrees/v11-issuer';
const SHOTS = path.join(ROOT, "docs", "V1.1", "evidence", "issuer-equity-spv");
const PROFILE = path.join(os.tmpdir(), 'issuer-audit-profile-v11');
const BASE = 'http://127.0.0.1:5193';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(SHOTS, { recursive: true });

const log = [];
const pages = [];
const note = (entry) => { log.push(entry); console.log(JSON.stringify(entry)); };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-debugging-port=9446', `--user-data-dir=${PROFILE}`, '--window-size=1440,1000', 'about:blank'
], { stdio: 'ignore' });

async function endpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9446/json/version');
      if (response.ok) return (await response.json()).webSocketDebuggerUrl;
    } catch { }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

await endpoint();
const target = await (await fetch('http://127.0.0.1:9446/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });

let sequence = 0;
const pending = new Map();
let consoleErrors = [];
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error))); else resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(message.params.args.map(arg => arg.value ?? arg.description ?? '').join(' '));
  }
  if (message.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(message.params.exceptionDetails?.exception?.description ?? 'exception');
  }
};

const send = (method, params = {}) => new Promise((resolve, reject) => {
  sequence += 1;
  pending.set(sequence, { resolve, reject });
  socket.send(JSON.stringify({ id: sequence, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? 'evaluate failed');
  return result.result.value;
}

async function goto(url) {
  await send('Page.navigate', { url });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const ready = await evaluate('document.readyState');
    if (ready === 'complete') break;
    await sleep(100);
  }
  await sleep(350);
}

async function waitFor(selector, timeout = 8000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)) return;
    await sleep(100);
  }
  throw new Error('Missing element ' + selector);
}

async function text(selector) {
  return evaluate(`(document.querySelector(${JSON.stringify(selector)})?.innerText ?? null)`);
}

async function click(selector) {
  await waitFor(selector);
  await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); el.scrollIntoView({block:'center'}); el.click(); return true; })()`);
  await sleep(250);
}

async function clickText(label) {
  const found = await evaluate(`(() => {
    const el = Array.from(document.querySelectorAll('button, a')).find(item => item.innerText.trim() === ${JSON.stringify(label)});
    if (!el) return false;
    el.scrollIntoView({block:'center'});
    el.click();
    return true;
  })()`);
  if (!found) throw new Error('Missing element with text ' + label);
  await sleep(250);
}

async function setOrderScenario(orderId, scenario) {
  const found = await evaluate(`(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const orderSelect = selects.find(item => Array.from(item.options).some(option => option.value === ${JSON.stringify(orderId)}));
    const scenarioSelect = selects.find(item => Array.from(item.options).some(option => option.value === ${JSON.stringify(scenario)}));
    if (!orderSelect || !scenarioSelect) return false;
    const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    set.call(orderSelect, ${JSON.stringify(orderId)});
    orderSelect.dispatchEvent(new Event('change', { bubbles: true }));
    set.call(scenarioSelect, ${JSON.stringify(scenario)});
    scenarioSelect.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  if (!found) throw new Error('Missing order mock controls');
  await sleep(300);
  await clickText('应用订单 Mock 结果');
  await sleep(300);
}

async function setSelect(selector, value) {
  await waitFor(selector);
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el.value;
  })()`);
  await sleep(180);
}

async function setInput(selector, value) {
  await waitFor(selector);
  await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return el.value;
  })()`);
  await sleep(180);
}

async function shot(name, fullPage = false) {
  let params = { format: 'png' };
  if (fullPage) {
    const metrics = await send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize ?? metrics.contentSize;
    params = { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 } };
  }
  const result = await send('Page.captureScreenshot', params);
  const file = path.join(SHOTS, name + '.png');
  fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
  note({ shot: name, file });
  return file;
}

async function checkPage(name, fullPage = true) {
  const before = consoleErrors;
  consoleErrors = [];
  const report = await evaluate(`(() => {
    const body = document.body.innerText || '';
    const mock = [];
    for (const word of ['Mock', 'MOCK', 'requestId', 'request ID', 'DEV-', '控制台']) if (body.includes(word)) mock.push(word);
    return { title: document.title, overflow: document.documentElement.scrollWidth - window.innerWidth, mock, text: body.slice(0, 300) };
  })()`);
  const file = await shot(name, fullPage);
  pages.push({ name, url: await evaluate('location.pathname + location.search'), ...report, consoleErrors: [...before, ...consoleErrors], file });
  consoleErrors = [];
}

async function setWidth(width, height = 900) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
}

const norm = (value) => value.replace(/\s+/g, '');
async function press(label) {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('button')).find(b => b.innerText.replace(/\\s+/g,'') === ${JSON.stringify(norm(label))}); if(!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true; })()`);
  if (!ok) throw new Error('Button missing: ' + label);
  await sleep(220);
}
async function field(label, value) {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('label')).find(l => (l.querySelector('span')?.textContent || '').replace(/\\s+/g,'').includes(${JSON.stringify(norm(label))})); const input=el?.querySelector('input,select,textarea'); if(!input) return false; const set=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input),'value')?.set; set.call(input,${JSON.stringify(value)}); input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input',{bubbles:true})); return true; })()`);
  if (!ok) throw new Error('Field missing: ' + label);
  await sleep(150);
}
async function allFileButtons() {
  const count = await evaluate(`document.querySelectorAll('.file-upload-field button').length`);
  for (let index = 0; index < count; index += 1) {
    await evaluate(`document.querySelectorAll('.file-upload-field button')[${index}].click()`);
    await sleep(100);
  }
}
async function publicFile(label) { await setSelect(`select[aria-label="${label}"]`, '公开'); }
async function publicAssetFact(label) {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('label.field')).find(l => (l.querySelector('span')?.innerText || '').includes(${JSON.stringify(label + ' ·')})); const input=el?.querySelector('input[type="checkbox"]'); if(!input || input.disabled)return false; input.click(); return true; })()`);
  if (!ok) throw new Error('Asset public fact missing: ' + label);
  await sleep(100);
}
async function demo() {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('演示控制台')); if(!el)return false; el.click(); return true; })()`);
  if (!ok) throw new Error('Demo console missing');
  await sleep(200);
}
async function demoStep(label) {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('.demo-console .mock-step-list button')).find(b=>b.querySelector('b')?.textContent === ${JSON.stringify(label)}); if(!el)return false; el.click(); return true; })()`);
  if (!ok) throw new Error('Demo step missing: ' + label);
  await sleep(200);
}
async function closeDemo() { await click('.demo-head button'); }
async function row(fragment) {
  const ok = await evaluate(`(() => { const el=Array.from(document.querySelectorAll('table tbody tr')).find(r=>r.innerText.includes(${JSON.stringify(fragment)})); if(!el)return false; el.click(); return true; })()`);
  if (!ok) throw new Error('Table row missing: ' + fragment);
  await sleep(220);
}
async function state() { return evaluate(`JSON.parse(localStorage.getItem('rwa-issuer-state-v4'))`); }
async function capture(name) {
  await checkPage(name, true);
  const current = await state();
  note({ stage: name, state: {
    assets: current.assets.map(({ id, subtype, status, version }) => ({ id, subtype, status, version })),
    instruments: current.instruments.map(({ id, type, status, version, spvMode }) => ({ id, type, status, version, spvMode })),
    offerings: current.offerings.map(({ id, confirmed, status, publicationStatus, disclosureSchemaVersion }) => ({ id, confirmed, status, publicationStatus, disclosureSchemaVersion })),
    tasks: current.issuanceTasks.map(({ id, status }) => ({ id, status })),
    publications: current.publications.map(({ id, offeringId }) => ({ id, offeringId })),
  } });
}

try {
  await setWidth(1440, 1000);
  await goto(BASE + '/');
  await evaluate('localStorage.clear(); sessionStorage.clear();');
  await goto(BASE + '/');
  await demo(); await press('已通过'); await press('Standard'); await closeDemo();
  await press('资产与发行');
  await press('创建资产');
  await field('资产类别', '企业股权');
  await press('填充示例空字段');
  await field('资产名称', '示例普通股权资产');
  await field('被投资法律实体', '星河示例运营有限公司');
  await field('底层股份类别', '普通股');
  await field('底层股数', '10000');
  await field('权利限制', '转让以法律文件和登记为准');
  await field('估值日期', '2026-11-28');
  await allFileButtons();
  await capture('01-equity-asset-form-1440');
  await press('保存资产草稿');
  await demo(); await demoStep('扫描当前待处理文件'); await closeDemo();
  await press('资产管理');
  await row('示例普通股权资产');
  await press('完成资料检查');
  await capture('02-equity-asset-draft-gate-1440');
  await press('配置该资产的权益结构');
  await press('填充示例空条款');
  await capture('03-equity-right-form-1440');
  await click('.file-upload-field button');
  await publicFile('权益文件公开权限');
  await press('保存权益草稿');
  await demo(); await demoStep('扫描当前待处理文件'); await closeDemo();
  await press('权益结构');
  await row('普通股权权益草稿');
  await press('完成权益检查');
  await capture('04-equity-right-draft-gate-1440');
  await press('资产管理');
  await press('创建资产');
  await field('资产类别', '企业股权');
  await press('填充示例空字段');
  await field('资产名称', '示例 SPV 股权资产');
  await field('被投资法律实体', '星河资产持有有限公司');
  await field('底层股份类别', '普通股');
  await field('底层股数', '10000');
  await field('权利限制', '转让以法律文件和登记为准');
  await field('估值日期', '2026-11-28');
  await allFileButtons();
  await press('保存资产草稿');
  await demo(); await demoStep('扫描当前待处理文件'); await closeDemo();
  await press('资产管理');
  await row('示例 SPV 股权资产');
  await capture('05-spv-equity-asset-draft-1440');
  await press('配置该资产的权益结构');
  await press('填充示例空条款');
  await field('股份发行主体', '星河资产持有有限公司');
  await field('是否涉及已有 SPV', '已有SPV');
  await field('SPV 法定名称', '星河资产持有有限公司');
  await field('注册国家或地区', '中国');
  await field('公司注册编号', 'DEMO-SPV-2026-001');
  await field('与底层资产的关系', '经文件证明持有底层股权');
  await field('与发行企业的关系', '发行企业控制的既有法律主体');
  await allFileButtons();
  await publicFile('权益文件公开权限');
  await capture('06-spv-equity-right-form-1440');
  await press('保存权益草稿');
  await demo(); await demoStep('扫描当前待处理文件'); await closeDemo();
  await press('权益结构');
  await row('普通股权权益草稿');
  await capture('07-spv-equity-right-draft-1440');
  const configured = (await state()).instruments.find(item => item.spvMode === '已有SPV');
  note({ stage: 'spv-configured', exists: !!configured, legalName: configured?.spv?.legalName, type: configured?.type, status: configured?.status, proofs: [configured?.spv?.registrationFile?.status, configured?.spv?.assetAuthorityFile?.status, configured?.spv?.rightsFile?.status] });
  const current = await state();
  const ordinary = current.instruments.find(item => item.spvMode === '不涉及');
  if (!ordinary || ordinary.type !== '股权' || ordinary.terms.participationRate || configured?.type !== '股权' || configured?.status !== 'Draft' || configured?.spv?.legalName !== '星河资产持有有限公司' || current.offerings.length !== 0) throw new Error('股权独立字段、SPV 或发行门禁不一致');
  for (const [index, subtype] of ['写字楼', '商业商铺', '工业园/仓储物流物业'].entries()) {
    await press('资产管理');
    await press('创建资产');
    await field('开放模板', subtype);
    await press('填充示例空字段');
    await field('资产名称', `示例${subtype}资产`);
    await allFileButtons();
    await capture(`0${index + 8}-other-template-form-1440`);
    await press('保存资产草稿');
    const saved = (await state()).assets.find(item => item.name === `示例${subtype}资产`);
    note({ stage: 'template-saved', subtype, assetId: saved?.id, status: saved?.status });
    if (!saved || saved.subtype !== subtype || saved.status !== 'Draft') throw new Error(`${subtype} 模板草稿未正确保存`);
  }
} catch (error) {
  note({ error: String(error), pageText: await evaluate('document.body.innerText.slice(-1600)').catch(() => '') });
  await shot('failure', true).catch(() => {});
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(SHOTS, 'run-log.json'), JSON.stringify({ log, pages }, null, 2));
  socket.close();
  chrome.kill();
}
