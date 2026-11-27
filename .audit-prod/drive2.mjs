import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = 'D:/360MoveData/Users/82623/Documents/ChatGPT/RWA SAAS/.worktrees/vm-investor-platform-productization';
const SHOTS = path.join(ROOT, 'docs', 'INVESTOR-PLATFORMS', 'audits', 'productization');
const PROFILE = path.join(os.tmpdir(), 'vm-audit-profile-prod2');
const DOWNLOADS = path.join(os.tmpdir(), 'vm-audit-downloads');
const BASE = 'http://127.0.0.1:5189';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(SHOTS, { recursive: true });
fs.rmSync(DOWNLOADS, { recursive: true, force: true });
fs.mkdirSync(DOWNLOADS, { recursive: true });

const log = [];
const pages = [];
const note = (entry) => { log.push(entry); console.log(JSON.stringify(entry)); };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-debugging-port=9445', `--user-data-dir=${PROFILE}`, '--window-size=1440,1000', 'about:blank'
], { stdio: 'ignore' });

async function endpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:9445/json/version');
      if (response.ok) return (await response.json()).webSocketDebuggerUrl;
    } catch { }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

await endpoint();
const target = await (await fetch('http://127.0.0.1:9445/json/new?about:blank', { method: 'PUT' })).json();
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

async function clickLastEnabled(label) {
  const found = await evaluate(`(() => {
    const items = Array.from(document.querySelectorAll('button, a')).filter(item => item.innerText.trim() === ${JSON.stringify(label)} && !item.disabled);
    const el = items[items.length - 1];
    if (!el) return false;
    el.scrollIntoView({block:'center'});
    el.click();
    return true;
  })()`);
  if (!found) throw new Error('Missing enabled element with text ' + label);
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
    for (const word of ['Mock', 'MOCK', 'mock-', 'requestId', 'request ID', 'DEV-', '控制台']) if (body.includes(word)) mock.push(word);
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
try {
  await setWidth(1440, 1000);
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
    const debtCreated = subscription.createOrder(debt, record, channel, 10, 'prod-debt-order', [], Date.now(), true);
    if (!debtCreated.order) throw new Error('debt order: ' + debtCreated.error);
    let debtOrder = debtCreated.order;
    debtOrder = subscription.beginPayment(debtOrder, record.mpcAddress, record.mpcAddress, stamp).order;
    debtOrder = subscription.resolvePayment(debtOrder, 'matched', stamp);
    for (let i = 0; i < 4; i += 1) debtOrder = subscription.advanceFulfillment(debtOrder, new Date(Date.now() + 1000 * (i + 1)).toISOString());
    subscription.saveOrder(debtOrder);
    const holding = { order: debtOrder, offering: debt };
    const basis = post.createMockPrincipalBasis(record, channel, holding, 'Mock 原始债权 QA-PROD / 杉岸设备租赁 2026', 30000, stamp, null, []).basis;
    post.savePrincipalBasis(basis);
    const interest = post.createDemoDistribution(record, channel, holding, 'interest', 'claim', 800, 0, stamp, 'prod-interest-1').item;
    post.saveDistribution(post.applyDemoDistributionState(interest, 'claimable', stamp));
    return { account: record.email, debtOrder: debtOrder.id, event: 'prod-interest-1', basis: basis.remainingCents };
  })()`);
  note({ seeded });
  const debtOrderId = seeded.debtOrder;

  // 1. Wallet binding (demo-only interaction)
  await goto(BASE + '/m/account/wallets?demo=1');
  await waitFor('#own-address');
  await checkPage('63-wallet-binding-form-1440');
  await setInput('#own-address', '0x123');
  await clickText('创建演示挑战');
  const invalidNote = await text('.form-error');
  note({ step: 'wallet invalid address', invalidNote });
  const ownAddress = '0x8f3a4c2b1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f40';
  await setInput('#own-address', ownAddress);
  await clickText('创建演示挑战');
  await clickText('模拟签名验证');
  await clickLastEnabled('设为示例默认钱包');
  const walletBody = await text('.account-body');
  const walletState = await evaluate(`(() => {
    const raw = localStorage.getItem('rwa-mock-account:' + encodeURIComponent('/m') + ':' + encodeURIComponent('product.audit@rwa.test'));
    const value = JSON.parse(raw);
    return { ownAddress: value.ownAddress, ownVerified: value.ownVerified, defaultWallet: value.defaultWallet, walletVersion: value.walletVersion };
  })()`);
  note({ step: 'wallet bound and default', ownAddress, verified: walletBody.includes('示例验证记录'), walletState });
  await checkPage('64-wallet-verified-default-1440');

  await goto(BASE + '/m/account?demo=1');
  const overviewWallet = await text('.account-body');
  note({ step: 'account overview default wallet', showsOwn: overviewWallet.includes('已验证自有钱包') });

  // 2. Sign out on the ordinary (non-demo) page
  await goto(BASE + '/m/account/security');
  await checkPage('65-security-before-signout-1440', false);
  await clickText('退出当前渠道账户');
  await sleep(500);
  const afterSignOut = await evaluate(`(() => ({
    session: sessionStorage.getItem('rwa-mock-active:' + encodeURIComponent('/m')),
    path: location.pathname + location.search,
    body: document.body.innerText.slice(0, 200)
  }))()`);
  note({ step: 'sign out', afterSignOut });
  await checkPage('66-signout-result-1440', false);
  await goto(BASE + '/m/investments');
  const guestOrders = await text('main');
  note({ step: 'guest protected page', blocked: guestOrders.includes('请登录当前渠道账户') || guestOrders.includes('请登录') });
  await click('a.button');
  await sleep(400);
  note({ step: 'guest redirected to', url: await evaluate('location.pathname + location.search') });

  // restore the mock session for the remaining checks
  await evaluate(`sessionStorage.setItem('rwa-mock-active:' + encodeURIComponent('/m'), 'product.audit@rwa.test')`);

  // 3. Message read state
  await goto(BASE + '/m/messages');
  await waitFor('.message-list');
  const unreadHref = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('.message-list article'));
    const card = cards.find(item => (item.querySelector('.eyebrow')?.innerText || '').includes('未读'));
    return card ? card.querySelector('a.text-link')?.getAttribute('href') : null;
  })()`);
  note({ step: 'unread message found', unreadHref });
  await checkPage('67-messages-unread-1440');
  if (unreadHref) {
    await goto(BASE + unreadHref);
    const beforeRead = await text('.message-detail .eyebrow');
    await clickText('标为已读');
    const afterRead = await text('.message-detail .eyebrow');
    const readKey = await evaluate(`(() => { for (let i = 0; i < localStorage.length; i += 1) { const key = localStorage.key(i); if (key && key.startsWith('rwa-mock-message-read:')) return { key, value: localStorage.getItem(key) }; } return null; })()`);
    note({ step: 'message marked read', beforeRead, afterRead, readKey });
    await checkPage('68-message-marked-read-1440', false);
    await send('Page.reload');
    await sleep(900);
    const afterReload = await text('.message-detail .eyebrow');
    note({ step: 'message read after reload', afterReload });
    await goto(BASE + '/m/messages');
    const listState = await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.message-list article'));
      const card = cards.find(item => item.querySelector('a.text-link')?.getAttribute('href') === ${JSON.stringify(unreadHref)});
      return card ? card.querySelector('.eyebrow')?.innerText : null;
    })()`);
    note({ step: 'message list after read', listState });
    await checkPage('69-messages-read-after-reload-1440');
  }

  // 4. Disclosure detail and download
  await goto(BASE + '/m/disclosures');
  const docHref = await evaluate(`Array.from(document.querySelectorAll('.disclosure-list a')).map(a => a.getAttribute('href')).find(href => href && !href.includes('/announcements/')) ?? null`);
  note({ step: 'disclosure document link', docHref });
  if (docHref) {
    try { await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS.replaceAll('\\', '/'), eventsEnabled: true }); }
    catch { await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS.replaceAll('\\', '/') }); }
    await goto(BASE + docHref);
    await checkPage('70-disclosure-download-1440');
    const meta = await evaluate(`(() => {
      const link = document.querySelector('a[download]');
      return link ? { download: link.getAttribute('download'), scheme: link.getAttribute('href').slice(0, 24), visible: link.innerText.trim() } : null;
    })()`);
    await evaluate(`(() => { const link = document.querySelector('a[download]'); if (link) link.click(); return true; })()`);
    let files = [];
    for (let attempt = 0; attempt < 40; attempt += 1) {
      files = fs.readdirSync(DOWNLOADS).filter(name => name.endsWith('.txt'));
      if (files.length) break;
      await sleep(200);
    }
    const downloaded = files.length ? { file: files[0], head: fs.readFileSync(path.join(DOWNLOADS, files[0]), 'utf8').slice(0, 120) } : null;
    const payload = await evaluate(`(async () => {
      const link = document.querySelector('a[download]');
      if (!link) return null;
      const body = await (await fetch(link.getAttribute('href'))).text();
      return { length: body.length, head: body.slice(0, 80) };
    })()`);
    note({ step: 'disclosure download', meta, downloaded, payload });
  }

  // 5. Claim failure path: existing request must be preserved, no new request
  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await sleep(400);
  await setSelect('#demo-holding', debtOrderId);
  await setSelect('#demo-event', 'prod-interest-1');
  await click('#demo-claim');
  const firstClaim = await text('[data-testid="claim-record"]');
  const firstState = await evaluate(`(() => { const key = 'rwa-mock-distribution:' + encodeURIComponent('prod-interest-1'); const value = JSON.parse(localStorage.getItem(key)); return { state: value.state, requestId: value.requestId }; })()`);
  note({ step: 'claim prepared for failure check', firstClaim, firstState });
  await setSelect('#demo-result', 'unknown');
  await clickText('应用事件 Mock 结果');
  await setSelect('#demo-event', 'prod-interest-1');
  const unknownState = await evaluate(`(() => { const key = 'rwa-mock-distribution:' + encodeURIComponent('prod-interest-1'); const value = JSON.parse(localStorage.getItem(key)); return { state: value.state, requestId: value.requestId }; })()`);
  note({ step: 'result switched to unknown', unknownState });
  await click('#demo-claim');
  const refuseNote = await text('[data-testid="distribution-controls"] [role="status"]');
  const afterRefuse = await evaluate(`(() => { const key = 'rwa-mock-distribution:' + encodeURIComponent('prod-interest-1'); const value = JSON.parse(localStorage.getItem(key)); return { state: value.state, requestId: value.requestId }; })()`);
  note({ step: 'claim refused on unknown', refuseNote, afterRefuse, preserved: afterRefuse.requestId === firstState.requestId });
  await checkPage('71-claim-refused-unknown-1440', false);
  await goto(BASE + '/m/investments/returns/prod-interest-1');
  const unknownBody = await text('main');
  note({ step: 'unknown detail page', hasPending: unknownBody.includes('结果尚未核实'), hasNoRetry: !unknownBody.includes('重试') });
  await checkPage('72-distribution-unknown-detail-1440');

  // 6. KYC round trip keeps the subscription context
  const kycInjected = await evaluate(`(() => {
    const key = 'rwa-mock-account:' + encodeURIComponent('/m') + ':' + encodeURIComponent('product.audit@rwa.test');
    const value = JSON.parse(localStorage.getItem(key));
    const next = { ...value, kyc: 'processing', kycUpdatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(next));
    return { kyc: next.kyc };
  })()`);
  note({ step: 'kyc state injected for round trip', kycInjected, reason: 'no UI path downgrades an approved Mock account' });
  await goto(BASE + '/m/subscribe/debt-01/documents?demo=1');
  const blockedSubscribe = await text('main');
  const kycLink = await evaluate(`Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('查看认证状态'))?.getAttribute('href') ?? null`);
  note({ step: 'subscribe blocked by kyc', blocked: blockedSubscribe.includes('提交前需完成 KYC'), kycLink });
  if (kycLink) {
    await goto(BASE + kycLink);
    const kycPage = await text('main');
    const backHref = await evaluate(`Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('返回原项目'))?.getAttribute('href') ?? null`);
    note({ step: 'kyc page with return link', backHref, showsProcessing: kycPage.includes('认证中') });
    await checkPage('73-kyc-return-context-1440');
    await clickText('返回原项目 →');
    await sleep(400);
    const backUrl = await evaluate('location.pathname + location.search');
    note({ step: 'returned to subscription', backUrl, contextKept: backUrl.includes('/m/subscribe/debt-01/documents') });
    await checkPage('74-kyc-returned-to-subscribe-1440');
  }

  // 7. Order exception and ticket linkage
  await goto(BASE + '/demo');
  await waitFor('#demo-holding');
  await sleep(300);
  await setOrderScenario(debtOrderId, 'refund-review');
  const refundState = await evaluate(`(() => { const key = 'rwa-mock-order:' + encodeURIComponent(${JSON.stringify(debtOrderId)}); const value = JSON.parse(localStorage.getItem(key)); return { refund: value.refund, exception: value.exception, payment: value.payment, registration: value.registration }; })()`);
  note({ step: 'order set to refund review', refundState });
  await goto(BASE + '/m/investments/orders/' + debtOrderId);
  const orderBody = await text('main');
  const ticketHref = await evaluate(`Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('联系支持'))?.getAttribute('href') ?? null`);
  note({ step: 'order detail after exception', showsRefundReview: orderBody.includes('退款'), ticketHref });
  await checkPage('75-order-refund-review-1440');
  if (ticketHref) {
    await goto(BASE + ticketHref);
    const formState = await evaluate(`(() => {
      const selects = Array.from(document.querySelectorAll('.ticket-form select'));
      const category = selects[0];
      const order = selects[1];
      return { category: category?.value ?? null, orderValue: order?.value ?? null, orderDisabled: !!order?.disabled };
    })()`);
    note({ step: 'support form prefilled from order', formState });
    await evaluate(`(() => {
      const area = document.querySelector('.ticket-form textarea');
      const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      set.call(area, '订单显示退款资格待核实，请核查原付款与退款状态。');
      area.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    await clickText('保存本地咨询记录');
    await sleep(600);
    const ticketUrl = await evaluate('location.pathname + location.search');
    const ticketBody = await text('main');
    const linked = await evaluate(`(() => {
      const orderKey = 'rwa-mock-order:' + encodeURIComponent(${JSON.stringify(debtOrderId)});
      const order = JSON.parse(localStorage.getItem(orderKey));
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) if (localStorage.key(i).startsWith('rwa-mock-ticket:')) keys.push(localStorage.key(i));
      const tickets = keys.map(key => JSON.parse(localStorage.getItem(key)));
      return { orderRefundStillReview: order.refund, tickets: tickets.map(item => ({ orderId: item.orderId, status: item.status })) };
    })()`);
    note({ step: 'ticket created and order unchanged', ticketUrl, showsOrder: ticketBody.includes('关联订单'), linked });
    await checkPage('76-ticket-linked-order-1440');
  }

  const summary = {
    pages: pages.length,
    overflow: pages.filter(page => page.overflow > 1).map(page => ({ name: page.name, overflow: page.overflow })),
    mockLeaks: pages.filter(page => page.mock.length && !page.url.includes('demo')).map(page => ({ name: page.name, words: page.mock })),
    console: pages.filter(page => page.consoleErrors.length).map(page => ({ name: page.name, errors: page.consoleErrors })),
    pageList: pages.map(page => page.name)
  };
  note({ summary });
  fs.writeFileSync(path.join(SHOTS, 'run-log-supplement.json'), JSON.stringify({ log, pages }, null, 2));
} catch (error) {
  note({ error: String(error?.stack ?? error) });
  fs.writeFileSync(path.join(SHOTS, 'run-log-supplement.json'), JSON.stringify({ log, pages }, null, 2));
  process.exitCode = 1;
} finally {
  try { socket.close(); } catch { }
  chrome.kill();
}
