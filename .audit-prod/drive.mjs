import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = 'D:/360MoveData/Users/82623/Documents/ChatGPT/RWA SAAS/.worktrees/vm-investor-platform-productization';
const SHOTS = path.join(ROOT, 'docs', 'INVESTOR-PLATFORMS', 'audits', 'productization');
const PROFILE = path.join(os.tmpdir(), 'vm-audit-profile-prod');
const BASE = 'http://127.0.0.1:5189';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(SHOTS, { recursive: true });

const log = [];
const pages = [];
const note = (entry) => { log.push(entry); console.log(JSON.stringify(entry)); };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-debugging-port=9444', `--user-data-dir=${PROFILE}`, '--window-size=1440,1000', 'about:blank'
], { stdio: 'ignore' });

async function endpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9444/json/version');
      if (response.ok) return (await response.json()).webSocketDebuggerUrl;
    } catch { }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

await endpoint();
const target = await (await fetch('http://127.0.0.1:9444/json/new?about:blank', { method: 'PUT' })).json();
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

consoleErrors = [];
try {  await setWidth(1440, 1000);
  await goto(BASE + '/m');
  await evaluate('localStorage.clear(); sessionStorage.clear();');
  const seeded = await evaluate(`(async () => {
    const account = await import('/src/account.ts');
    const subscription = await import('/src/subscription.ts');
    const data = await import('/src/data.ts');
    const post = await import('/src/postInvestment.ts');
    const domain = await import('/src/domain.ts');
    const channel = { kind: 'm' };
    const stamp = new Date().toISOString();
    let record = account.newAccount(channel, 'product.audit@rwa.test', stamp, 'op-prod');
    record = { ...record, kyc: 'approved' };
    record = account.withMpcResult(record, 'ready');
    account.saveAccount(channel, record);
    const debt = data.offerings.find(item => item.id === 'debt-01');
    const debtCreated = subscription.createOrder(debt, record, channel, 10, 'prod-debt-order', [], Date.now(), true); if (!debtCreated.order) throw new Error('debt order: ' + debtCreated.error); let debtOrder = debtCreated.order;
    debtOrder = subscription.beginPayment(debtOrder, record.mpcAddress, record.mpcAddress, stamp).order;
    debtOrder = subscription.resolvePayment(debtOrder, 'matched', stamp);
    for (let i = 0; i < 4; i += 1) debtOrder = subscription.advanceFulfillment(debtOrder, new Date(Date.now() + 1000 * (i + 1)).toISOString());
    subscription.saveOrder(debtOrder);
    const residence = data.offerings.find(item => item.id === 'residence-01');
    const equityCreated = subscription.createOrder(residence, record, channel, domain.minimumUnits(residence), 'prod-equity-order', [debtOrder], Date.now(), true); if (!equityCreated.order) throw new Error('equity order: ' + equityCreated.error); let equity = equityCreated.order;
    equity = subscription.beginPayment(equity, record.mpcAddress, record.mpcAddress, new Date().toISOString()).order;
    equity = subscription.resolvePayment(equity, 'matched', new Date().toISOString());
    equity = subscription.advanceFulfillment(equity, new Date().toISOString());
    equity = subscription.advanceFulfillment(equity, new Date().toISOString());
    subscription.saveOrder(equity);
    const debt2Created = subscription.createOrder(debt, record, channel, 10, 'prod-debt-order-2', [debtOrder], Date.now(), true);
    if (!debt2Created.order) throw new Error('debt order 2: ' + debt2Created.error);
    let debt2 = debt2Created.order;
    debt2 = subscription.beginPayment(debt2, record.mpcAddress, record.mpcAddress, new Date().toISOString()).order;
    debt2 = subscription.resolvePayment(debt2, 'matched', new Date().toISOString());
    for (let i = 0; i < 4; i += 1) debt2 = subscription.advanceFulfillment(debt2, new Date(Date.now() + 2000 * (i + 1)).toISOString());
    subscription.saveOrder(debt2);
    sessionStorage.setItem(domain.draftStorageKey(channel, debt, 'order-id') + ':' + record.id, debtOrder.id);
    sessionStorage.setItem(domain.draftStorageKey(channel, debt, 'quantity'), '10');
    const holding = { order: debtOrder, offering: debt };
    const basis = post.createMockPrincipalBasis(record, channel, holding, 'Mock 原始债权 QA-PROD / 杉岸设备租赁 2026', 30000, stamp, null, []).basis;
    post.savePrincipalBasis(basis);
    const interest = post.createDemoDistribution(record, channel, holding, 'interest', 'claim', 800, 0, stamp, 'prod-interest-1').item;
    post.saveDistribution(post.applyDemoDistributionState(interest, 'claimable', stamp));
    const principal = post.createDemoDistribution(record, channel, holding, 'principal', 'push', 5000, 0, stamp, 'prod-principal-1').item;
    post.saveDistribution(principal);
    return { account: record.email, debtOrder: debtOrder.id, debtOrder2: debt2.id, equityOrder: equity.id, basis: basis.remainingCents };
  })()`);
  note({ seeded });

  await setWidth(1280, 900);
  await goto(BASE + '/m');
  await checkPage('01-m-home-1280', false);
  await setWidth(1440, 1000);
  await goto(BASE + '/m');
  await checkPage('02-m-home-1440', true);
  await setWidth(1920, 1080);
  await goto(BASE + '/m');
  await checkPage('03-m-home-1920', false);

  await setWidth(1440, 1000);
  await goto(BASE + '/m/opportunities');
  await checkPage('04-m-opportunities-1440');
  await goto(BASE + '/m/opportunities/residence-01');
  await checkPage('05-residence-detail-1440');
  const rightsText = await text('#rights');
  note({ rightsChain: rightsText?.includes('取得的合同权益'), rightsPreview: rightsText?.slice(0, 200) });
  await goto(BASE + '/m/opportunities/debt-01');
  await checkPage('06-debt-detail-1440');
  await goto(BASE + '/m/issuers/cedar');
  await checkPage('07-issuer-company-1440');

  await goto(BASE + '/v/harbor');
  await checkPage('08-v-harbor-home-1440');
  await goto(BASE + '/v/cedar');
  await checkPage('09-v-cedar-home-1440');
  await goto(BASE + '/v/harbor/opportunities');
  await checkPage('10-v-harbor-opportunities-1440');

  await setWidth(1280, 900);
  await goto(BASE + '/m/opportunities');
  await checkPage('11-m-opportunities-1280');
  await setWidth(1920, 1080);
  await goto(BASE + '/m/opportunities');
  await checkPage('12-m-opportunities-1920');

  await setWidth(1440, 1000);
  await evaluate(`sessionStorage.removeItem('rwa-mock-active:' + encodeURIComponent('/m'))`);
  await goto(BASE + '/m/account');
  await checkPage('13-login-service-closed-1440', false);
  await evaluate(`sessionStorage.setItem('rwa-mock-active:' + encodeURIComponent('/m'), 'product.audit@rwa.test')`);
  await goto(BASE + '/m/account?demo=1');
  await checkPage('14-account-overview-1440');
  await goto(BASE + '/m/account/kyc');
  await checkPage('15-kyc-1440');
  await goto(BASE + '/m/account/wallets');
  await checkPage('16-wallets-1440');
  await goto(BASE + '/m/account/profile');
  await checkPage('17-profile-1440');
  await goto(BASE + '/m/account/security');
  await checkPage('18-security-1440');

  await goto(BASE + '/m/subscribe/residence-01/quote');
  await checkPage('19-subscribe-quote-public-1440');
  await goto(BASE + '/m/subscribe/residence-01/documents');
  await checkPage('20-subscribe-documents-public-1440');
  await goto(BASE + '/m/subscribe/residence-01/payment');
  await checkPage('21-subscribe-payment-public-1440');
  await goto(BASE + '/m/subscribe/residence-01/progress');
  await checkPage('22-subscribe-progress-public-1440');

  await goto(BASE + '/m/subscribe/debt-01/quote?demo=1');
  await checkPage('23-subscribe-quote-demo-1440');
  await goto(BASE + '/m/subscribe/debt-01/documents?demo=1');
  await checkPage('24-subscribe-documents-demo-1440');
  await goto(BASE + '/m/subscribe/debt-01/payment?demo=1');
  await checkPage('25-subscribe-payment-demo-1440');
  await goto(BASE + '/m/subscribe/debt-01/progress?demo=1');
  await checkPage('26-subscribe-progress-demo-1440');
  const progressText = await text('main');
  note({ progressComplete: progressText?.includes('四个独立 Mock 状态均已确认'), entries: progressText?.includes('接下来可以做什么') });
  const debtOrderId = seeded.debtOrder;
  await goto(BASE + '/m/investments?tab=orders');
  await checkPage('27-orders-1440');
  await goto(BASE + '/m/investments/orders/' + debtOrderId);
  await checkPage('28-order-detail-1440', false);
  await goto(BASE + '/m/investments?tab=holdings');
  await checkPage('29-holdings-1440');
  await goto(BASE + '/m/investments/holdings/' + debtOrderId);
  await checkPage('30-holding-detail-1440');
  await goto(BASE + '/m/investments?tab=returns');
  await checkPage('31-returns-1440');
  await goto(BASE + '/m/investments/returns/prod-interest-1');
  await checkPage('32-distribution-interest-1440');
  await goto(BASE + '/m/investments/returns/prod-principal-1');
  await checkPage('33-distribution-principal-1440');

  await goto(BASE + '/m/messages');
  await checkPage('34-messages-1440');
  const messageHref = await evaluate(`document.querySelector('.message-list a')?.getAttribute('href') ?? null`);
  if (messageHref) {
    await goto(BASE + messageHref);
    await checkPage('35-message-detail-1440');
    const markVisible = await evaluate(`Array.from(document.querySelectorAll('button')).some(button => button.innerText.includes('标为已读'))`);
    if (markVisible) await click('button');
  }
  await goto(BASE + '/m/disclosures');
  await checkPage('36-disclosures-1440');
  const docHref = await evaluate(`Array.from(document.querySelectorAll('.disclosure-list a')).map(a => a.getAttribute('href')).find(href => href && /\\/disclosures\\/[^/]+\\/\\d+$/.test(href)) ?? null`);
  const noticeHref = await evaluate(`Array.from(document.querySelectorAll('.disclosure-list a')).map(a => a.getAttribute('href')).find(href => href && href.includes('/announcements/')) ?? null`);
  if (docHref) { await goto(BASE + docHref); await checkPage('37-disclosure-document-1440'); }
  if (noticeHref) { await goto(BASE + noticeHref); await checkPage('38-announcement-1440'); }

  await goto(BASE + '/m/support');
  await checkPage('39-support-1440', false);
  const ticketOk = await evaluate(`(() => {
    const area = document.querySelector('.ticket-form textarea');
    if (!area) return false;
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    set.call(area, '需要核对订单付款状态与后续登记进度，请协助查询原记录。');
    area.dispatchEvent(new Event('input', { bubbles: true }));
    const button = Array.from(document.querySelectorAll('button')).find(item => item.innerText.includes('保存本地咨询记录'));
    if (!button) return false;
    button.click();
    return true;
  })()`);
  note({ ticketCreated: ticketOk });
  await sleep(700);
  await checkPage('40-ticket-detail-1440', false);

  await goto(BASE + '/m/terms');
  await checkPage('41-terms-1440', false);
  await goto(BASE + '/m/privacy');
  await checkPage('42-privacy-1440', false);
  await goto(BASE + '/m/opportunities/not-exist');
  await checkPage('43-not-found-1440', false);

  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await sleep(400);
  await setSelect('#demo-holding', debtOrderId);
  await setSelect('#demo-event', 'prod-interest-1');
  await evaluate(`(() => { const button = document.querySelector('#demo-claim'); button.click(); button.click(); return true; })()`);
  await sleep(300);
  const claimRecord = await text('[data-testid="claim-record"]');
  const claimNote = await text('[data-testid="distribution-controls"] [role="status"]');
  const claimState = await evaluate(`(() => { for (let i = 0; i < localStorage.length; i += 1) { const key = localStorage.key(i); if (key && key.endsWith('prod-interest-1')) { const value = JSON.parse(localStorage.getItem(key)); return { state: value.state, requestId: value.requestId }; } } return null; })()`);
  note({ step: 'rapid double claim', claimRecord, claimNote, claimState });
  await shot('44-claim-rapid-double-click');

  await goto(BASE + '/demo');
  await waitFor('[data-testid="claim-record"]');
  await sleep(300);
  await setSelect('#demo-event', 'prod-interest-1');
  note({ step: 'after refresh', record: await text('[data-testid="claim-record"]') });
  await shot('45-claim-processing-after-reload');

  await setSelect('#demo-holding', debtOrderId);
  await setSelect('#demo-kind', 'interest');
  await setSelect('#demo-method', 'claim');
  await setInput('#demo-amount', '12.00');
  await clickText('创建 Mock 事件');
  const secondEvent = await evaluate(`document.querySelector('#demo-event')?.value ?? null`);
  await setSelect('#demo-event', secondEvent);
  await setSelect('#demo-result', 'claimable');
  await clickText('应用事件 Mock 结果');
  note({ step: 'claimable prepared before exception', record: await text('[data-testid="claim-record"]') });
  await setOrderScenario(debtOrderId, 'fulfillment-failed');
  await setSelect('#demo-event', secondEvent);
  await click('#demo-claim');
  const blockedNote = await text('[data-testid="distribution-controls"] [role="status"]');
  note({ step: 'claim blocked on abnormal holding', blockedNote, record: await text('[data-testid="claim-record"]') });
  await shot('46-claim-blocked-exception');
  await goto(BASE + '/m/investments/returns/' + secondEvent);
  await sleep(400);
  const blockedBody = await text('main');
  note({ step: 'blocked detail page', hasReason: blockedBody.includes('不能领取') });
  await shot('47-distribution-blocked-detail', true);

  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await setSelect('#demo-holding', debtOrderId);
  await setOrderScenario(debtOrderId, 'normal');
  await setSelect('#demo-event', secondEvent);
  await click('#demo-claim');
  note({ step: 'claim after exception cleared', note: await text('[data-testid="distribution-controls"] [role="status"]'), record: await text('[data-testid="claim-record"]') });
  await shot('48-claim-restored-after-clear');

  await goto(BASE + '/m');
  await evaluate(`sessionStorage.setItem('rwa-investor-dev01-scenario','upcoming')`);
  await goto(BASE + '/m/opportunities/residence-01');
  await checkPage('49-state-upcoming-detailed-1440', false);
  await goto(BASE + '/m');
  await evaluate(`sessionStorage.setItem('rwa-investor-dev01-scenario','no-listings')`);
  await goto(BASE + '/m');
  await checkPage('50-state-no-listings-1440', false);
  await evaluate(`sessionStorage.setItem('rwa-investor-dev01-scenario','mock-loading')`);
  await goto(BASE + '/m/opportunities');
  await checkPage('51-state-loading-1440', false);
  await evaluate(`sessionStorage.setItem('rwa-investor-dev01-scenario','mock-error')`);
  await goto(BASE + '/m/opportunities');
  await checkPage('52-state-error-1440', false);
  await evaluate(`sessionStorage.setItem('rwa-investor-dev01-scenario','normal')`);
  await evaluate(`sessionStorage.removeItem('rwa-mock-active:' + encodeURIComponent('/m'))`);
  await goto(BASE + '/m/account/kyc');
  await checkPage('53-state-guest-protected-1440', false);
  await evaluate(`sessionStorage.setItem('rwa-mock-active:' + encodeURIComponent('/m'), 'product.audit@rwa.test')`);

  await setWidth(1280, 900);
  await goto(BASE + '/m/opportunities/residence-01');
  await checkPage('54-residence-detail-1280', false);
  await setWidth(1920, 1080);
  await goto(BASE + '/m/opportunities/residence-01');
  await checkPage('55-residence-detail-1920', false);

  await setWidth(1440, 1000);
  const readBasis = () => evaluate(`(() => {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.includes('principal')) continue;
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.orderId === ${JSON.stringify(debtOrderId)}) return { test: value.testPrincipalCents, repaid: value.repaidCents, remaining: value.remainingCents };
    }
    return null;
  })()`);

  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await setSelect('#demo-holding', debtOrderId);
  await setSelect('#demo-event', 'prod-principal-1');
  await setSelect('#demo-result', 'paid');
  await clickText('应用事件 Mock 结果');
  await sleep(300);
  note({ step: 'principal partial repayment', note: await text('[data-testid="distribution-controls"] [role="status"]'), basis: await readBasis() });
  await shot('56-principal-partial-repayment');

  await setSelect('#demo-result', 'paid');
  await clickText('应用事件 Mock 结果');
  await sleep(300);
  note({ step: 'principal repeat same event', note: await text('[data-testid="distribution-controls"] [role="status"]'), basis: await readBasis() });
  await shot('57-principal-repeat-same-event');

  await setSelect('#demo-kind', 'principal');
  await setSelect('#demo-method', 'push');
  await setInput('#demo-amount', '999.00');
  await clickText('创建 Mock 事件');
  const overEvent = await evaluate(`document.querySelector('#demo-event')?.value ?? null`);
  await setSelect('#demo-event', overEvent);
  await setSelect('#demo-result', 'paid');
  await clickText('应用事件 Mock 结果');
  await sleep(300);
  note({ step: 'principal over remaining', event: overEvent, note: await text('[data-testid="distribution-controls"] [role="status"]'), basis: await readBasis() });
  await shot('58-principal-over-repayment-rejected');

  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await setSelect('#demo-holding', seeded.debtOrder2);
  await setSelect('#demo-kind', 'principal');
  await setSelect('#demo-method', 'push');
  await setInput('#demo-amount', '40.00');
  await clickText('创建 Mock 事件');
  const noBasisEvent = await evaluate(`document.querySelector('#demo-event')?.value ?? null`);
  await setSelect('#demo-event', noBasisEvent);
  await setSelect('#demo-result', 'paid');
  await clickText('应用事件 Mock 结果');
  await sleep(300);
  note({ step: 'principal without basis', event: noBasisEvent, note: await text('[data-testid="distribution-controls"] [role="status"]') });
  await shot('59-principal-without-basis-rejected');

  const interestState = await evaluate(`(() => {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.endsWith('prod-interest-1')) continue;
      const value = JSON.parse(localStorage.getItem(key));
      return { state: value.state, requestId: value.requestId };
    }
    return null;
  })()`);
  note({ step: 'interest and principal independent', interestState, principalBasis: await readBasis() });
  await shot('60-interest-principal-independent');
  await goto(BASE + '/m/investments/returns/prod-principal-1');
  await checkPage('61-principal-detail-after-repayment');
  await goto(BASE + '/m/investments/returns/prod-interest-1');
  await checkPage('62-claim-processing-1440', false);

  const summary = {
    pages: pages.length,
    overflow: pages.filter(page => page.overflow > 1).map(page => ({ name: page.name, overflow: page.overflow })),
    mockLeaks: pages.filter(page => page.mock.length && !page.name.includes('demo') && !page.url.includes('demo')).map(page => ({ name: page.name, words: page.mock })),
    console: pages.filter(page => page.consoleErrors.length).map(page => ({ name: page.name, errors: page.consoleErrors })),
    pageList: pages.map(page => page.name)
  };
  note({ summary });
  fs.writeFileSync(path.join(SHOTS, 'run-log.json'), JSON.stringify({ log, pages }, null, 2));
} catch (error) {
  note({ error: String(error?.stack ?? error) });
  fs.writeFileSync(path.join(SHOTS, 'run-log.json'), JSON.stringify({ log, pages }, null, 2));
  process.exitCode = 1;
} finally {
  try { socket.close(); } catch { }
  chrome.kill();
}
