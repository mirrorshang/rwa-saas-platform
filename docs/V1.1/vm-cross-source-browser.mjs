import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = 'D:/360MoveData/Users/82623/Documents/ChatGPT/RWA SAAS/.worktrees/v11-vm';
const SHOTS = path.join(ROOT, "docs", "V1.1", "evidence", "vm-cross-source");
const PROFILE = path.join(os.tmpdir(), 'vm-cross-source-profile-v11');
const BASE = 'http://127.0.0.1:5194';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(SHOTS, { recursive: true });

const log = [];
const pages = [];
const note = (entry) => { log.push(entry); console.log(JSON.stringify(entry)); };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-debugging-port=9447', `--user-data-dir=${PROFILE}`, '--window-size=1440,1000', 'about:blank'
], { stdio: 'ignore' });

async function endpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9447/json/version');
      if (response.ok) return (await response.json()).webSocketDebuggerUrl;
    } catch { }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

await endpoint();
const target = await (await fetch('http://127.0.0.1:9447/json/new?about:blank', { method: 'PUT' })).json();
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

try {
  for (const width of [1280, 1440, 1920]) {
    await setWidth(width, 1000);
    await goto(BASE + '/v/galaxy-assets');
    const home = await evaluate(`({ hasProject: document.body.innerText.includes('朝阳住宅租金收益参与权首期'), hasReturn: document.body.innerText.includes('未提供预期年化'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
    note({ stage: 'v-home', width, ...home });
    await checkPage(`01-v-home-${width}`, true);
    if (!home.hasProject || !home.hasReturn || home.overflow > 0) throw new Error('V home source disclosure mismatch');
    await goto(BASE + '/v/galaxy-assets/opportunities/galaxy-assets--OFF-3001');
    const detail = await evaluate(`({ title: document.body.innerText.includes('朝阳住宅租金收益参与权首期'), fact: document.body.innerText.includes('建筑面积'), issuer: document.body.innerText.includes('北京朝阳城市资产管理有限公司'), risk: document.body.innerText.includes('租金可能波动'), noSpv: !document.body.innerText.includes('SPV 法定名称'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
    note({ stage: 'v-detail', width, ...detail });
    await checkPage(`02-v-detail-${width}`, true);
    if (!detail.title || !detail.fact || !detail.issuer || !detail.risk || !detail.noSpv || detail.overflow > 0) throw new Error('V detail source disclosure mismatch');
  }
  await setWidth(1440, 1000);
  await goto(BASE + '/v/galaxy-assets/opportunities/galaxy-assets--OFF-3002');
  const debt = await evaluate(`({ title: document.body.innerText.includes('华北物流投资者债权首期'), fixedRate: document.body.innerText.includes('合同固定年利率 12%'), debtor: document.body.innerText.includes('华北物流'), noSpv: !document.body.innerText.includes('SPV 法定名称'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
  note({ stage: 'v-debt-detail', ...debt });
  await checkPage('02-v-debt-detail-1440', true);
  if (!debt.title || !debt.fixedRate || !debt.debtor || !debt.noSpv || debt.overflow > 0) throw new Error('V debt source disclosure mismatch');
  await goto(BASE + '/v/galaxy-spv/opportunities/galaxy-spv--OFF-3001');
  const spv = await evaluate(`({ title: document.body.innerText.includes('朝阳 SPV 租金收益参与权首期'), legalName: document.body.innerText.includes('星河住宅持有有限公司'), role: document.body.innerText.includes('收益责任主体'), relationship: document.body.innerText.includes('依据资产授权文件运营该住宅租赁收益'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
  note({ stage: 'v-spv-detail', ...spv });
  await checkPage('02-v-spv-detail-1440', true);
  if (!spv.title || !spv.legalName || !spv.role || !spv.relationship || spv.overflow > 0) throw new Error('V SPV source disclosure mismatch');
  await goto(BASE + '/v/galaxy-debt-spv/opportunities/galaxy-debt-spv--OFF-3001');
  const spvDebt = await evaluate(`({ title: document.body.innerText.includes('华北物流 SPV 投资者债权首期'), legalName: document.body.innerText.includes('星河债权偿付有限公司'), role: document.body.innerText.includes('偿付主体'), fixedRate: document.body.innerText.includes('合同固定年利率 12%'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
  note({ stage: 'v-spv-debt-detail', ...spvDebt });
  await checkPage('02-v-spv-debt-detail-1440', true);
  if (!spvDebt.title || !spvDebt.legalName || !spvDebt.role || !spvDebt.fixedRate || spvDebt.overflow > 0) throw new Error('V SPV debt source disclosure mismatch');
  await goto(BASE + '/v/galaxy-assets/opportunities/galaxy-assets--OFF-3001');
  await click('#documents a');
  const file = await evaluate(`({ path: location.pathname, hasVersion: document.body.innerText.includes('v1'), hasSource: document.body.innerText.includes('权益文件'), noDownload: !document.body.innerText.includes('下载示例文本'), noInternalId: !document.body.innerText.includes('公开文件 ID') && !document.body.innerText.includes('对应发布快照'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
  note({ stage: 'v-public-file-version', ...file });
  await checkPage('02-v-public-file-version-1440', true);
  if (!file.path.includes('/disclosures/galaxy-assets--OFF-3001/0') || !file.hasVersion || !file.hasSource || !file.noDownload || !file.noInternalId || file.overflow > 0) throw new Error('V public file version route mismatch');
  await goto(BASE + '/m');
  const m = await evaluate(`({ hasUnapprovedListing: document.body.innerText.includes('朝阳住宅租金收益参与权首期') || document.body.innerText.includes('华北物流投资者债权首期') || document.body.innerText.includes('朝阳 SPV 租金收益参与权首期') || document.body.innerText.includes('华北物流 SPV 投资者债权首期') })`);
  note({ stage: 'm-listing-gate', ...m });
  await checkPage('03-m-listing-gate-1440', true);
  if (m.hasUnapprovedListing) throw new Error('M showed unapproved Listing');
  await goto(BASE + '/m/opportunities/galaxy-assets--OFF-3001');
  const direct = await evaluate(`({ exposesProject: document.body.innerText.includes('朝阳住宅租金收益参与权首期') })`);
  note({ stage: 'm-direct-gate', ...direct });
  await checkPage('04-m-direct-gate-1440', true);
  if (direct.exposesProject) throw new Error('M direct route exposed unapproved Listing');
  await goto(BASE + '/m/disclosures/galaxy-assets--OFF-3001/0');
  const deniedFile = await evaluate(`({ denied: document.body.innerText.includes('文件不可访问'), noTitle: !document.body.innerText.includes('Rental Revenue Participation Agreement'), overflow: document.documentElement.scrollWidth-window.innerWidth })`);
  note({ stage: 'm-file-gate', ...deniedFile });
  await checkPage('05-m-file-gate-1440', true);
  if (!deniedFile.denied || !deniedFile.noTitle || deniedFile.overflow > 0) throw new Error('M exposed unapproved file');
} catch (error) {
  note({ error: String(error), text: await evaluate('document.body.innerText.slice(0,1200)').catch(()=>'') });
  await shot('failure', true).catch(()=>{});
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(SHOTS, 'run-log.json'), JSON.stringify({ log, pages }, null, 2));
  socket.close();
  chrome.kill();
}
