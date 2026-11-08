const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/82623/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = __dirname;
const origin = 'http://127.0.0.1:4178';
const email = 'storage-review-' + Date.now() + '@example.com';
const assetId = 'asset-session-review';
const instrumentId = 'instrument-session-review';
const results = [];
const note = (id, status, details, page, screenshot = null) => { results.push({ id, status, at: new Date().toISOString(), account: email, browserContext: page.context().__reviewName, url: page.url(), details, screenshot }); console.log(id, status, details); };
const assert = (condition, message) => { if (!condition) throw Error(message); };

async function login(page) {
  await page.goto(origin + '/issuer-r2/login');
  await page.locator('#r2-email').fill(email);
  await page.getByRole('button', { name: /获取验证码/ }).click();
  await page.locator('#r2-code').fill('123456');
  await page.getByRole('button', { name: /验证并继续/ }).click();
  if (await page.getByRole('checkbox', { name: /我已阅读/ }).count()) {
    await page.getByRole('checkbox', { name: /我已阅读/ }).check();
    await page.getByRole('button', { name: /确认并进入工作台/ }).click();
  }
  await page.waitForURL(origin + '/issuer-r2');
}

async function seed(page) {
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByRole('button', { name: '生成完整企业认证场景' }).click();
  await page.waitForURL(origin + '/issuer-r2/settings/kyb');
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByLabel('企业认证审核结果').selectOption('approved');
  await page.getByRole('button', { name: /关闭测试工具/ }).click();
  await page.evaluate(({ email, assetId, instrumentId }) => {
    const at = new Date().toISOString();
    const version = id => ({ id, version: 1, name: id + '.png', size: 100, mime: 'image/png', uploadedAt: at, uploadedBy: email, scan: 'passed' });
    const doc = (id, category, label) => ({ id, category, label, versions: [version(id + '-v1')], currentVersionId: id + '-v1' });
    const fields = { description: '', country: 'CN', city: '上海', address: '示例路 1 号', usage: '出租', usageOther: '', registeredOwner: '资产持有人', rightNature: '所有权', rightNatureOther: '', rightRegistration: '', issuerRelation: '同一主体', relationNote: '', operator: '', encumbrance: '无', encumbranceNote: '', valuation: '100000', valuationDate: '2026-10-01', valuationBasis: '近期成交价', valuer: '', valuationNote: '', residenceForm: '整栋', residenceCount: '', propertyForm: '', buildingArea: '100', rentableArea: '', occupancy: '' };
    const asset = { id: assetId, tenant: email, number: 'AST-SESSION-01', category: '房地产', subtype: '住宅', name: '会话恢复测试资产', status: 'ready', savedStep: 4, fields, documents: [doc('owner-file', 'ownership', '资产权属证明'), doc('value-file', 'valuation', '资产估值依据文件')], version: 1, updatedAt: at, history: [], instrumentId };
    const rights = { obligor: '权利主体', rights: '普通股权益', legalEntity: '对应实体', holderRights: '股东权利', debtor: '', interest: '', rate: '', interestStart: '', maturity: '', incomeSource: '', incomeBasis: '', incomeTerm: '', incomeFrequency: '' };
    const instrument = { id: instrumentId, tenant: email, assetId, type: 'equity', name: '会话恢复测试权益', status: 'ready', fields: rights, totalRights: '100', tokenCount: '10', documents: [doc('core-file', 'core-equity', '股权权益协议或适用权利证明')], assetReferences: [{ fileId: 'owner-file', versionId: 'owner-file-v1', label: '资产权属证明' }], reviewedAssetVersions: { 'owner-file': 'owner-file-v1' }, version: 1, updatedAt: at, history: [], linkedOfferings: [] };
    sessionStorage.setItem('wdex-issuer-r2-assets-v1', JSON.stringify({ [email]: [asset] }));
    sessionStorage.setItem('wdex-issuer-r2-instruments-v1', JSON.stringify({ [email]: [instrument] }));
  }, { email, assetId, instrumentId });
}

async function records(page) {
  return page.evaluate(email => {
    const assets = JSON.parse(sessionStorage.getItem('wdex-issuer-r2-assets-v1') || '{}');
    const instruments = JSON.parse(sessionStorage.getItem('wdex-issuer-r2-instruments-v1') || '{}');
    return { asset: assets[email]?.[0]?.id || null, instrument: instruments[email]?.[0]?.id || null };
  }, email);
}
async function visible(page) {
  await page.goto(origin + '/issuer-r2/assets/' + assetId + '?tab=instrument');
  await page.getByRole('heading', { name: '会话恢复测试资产' }).waitFor();
  await page.getByRole('heading', { name: '会话恢复测试权益' }).waitFor();
  const state = await records(page);
  assert(state.asset === assetId && state.instrument === instrumentId, 'asset/instrument store did not recover');
  return state;
}

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const first = await browser.newContext({ viewport: { width: 1365, height: 900 } }); first.__reviewName = 'original isolated context';
  const page = await first.newPage(); page.setDefaultTimeout(8000); page.on('dialog', dialog => dialog.accept());
  const output = { account: email, origin, startedAt: new Date().toISOString(), fixture: { assetId, instrumentId, method: 'Mock KYB approval and direct sessionStorage fixture seed; actual UI used for every read assertion' }, results };
  try {
    await login(page); await seed(page); await visible(page);
    await page.reload(); await visible(page);
    await page.screenshot({ path: path.join(out, 'session-A-refresh.png'), fullPage: true });
    note('A same-context refresh', 'PASS', 'asset and instrument store plus UI restored after reload', page, 'session-A-refresh.png');
    await page.getByRole('navigation', { name: '资产详情' }).getByRole('link', { name: '资产概览' }).click();
    await page.getByRole('navigation', { name: '资产详情' }).getByRole('link', { name: '权益结构' }).click();
    await page.getByRole('heading', { name: '会话恢复测试权益' }).waitFor();
    assert((await records(page)).instrument === instrumentId, 'instrument absent after tab return');
    await page.screenshot({ path: path.join(out, 'session-B-tab-return.png'), fullPage: true });
    note('B same-context TAB return', 'PASS', 'asset and instrument still present', page, 'session-B-tab-return.png');
    await visible(page);
    await page.screenshot({ path: path.join(out, 'session-C-direct-route.png'), fullPage: true });
    note('C same-context direct route', 'PASS', 'direct detail route shows same asset and instrument', page, 'session-C-direct-route.png');
    await page.getByRole('button', { name: '退出', exact: true }).click();
    await page.waitForURL(origin + '/issuer-r2/login');
    const afterLogout = await records(page);
    assert(afterLogout.asset === assetId && afterLogout.instrument === instrumentId, 'logout unexpectedly cleared business data');
    await page.goto(origin + '/issuer-r2/assets/' + assetId + '?tab=instrument');
    await page.waitForURL(origin + '/issuer-r2/login');
    assert((await records(page)).asset === assetId, 'unauthenticated redirect unexpectedly cleared stored asset');
    await login(page); await visible(page);
    await page.screenshot({ path: path.join(out, 'session-D-same-context-relogin.png'), fullPage: true });
    note('D same-context logout and relogin', 'PASS', 'same account and same context restored business data', page, 'session-D-same-context-relogin.png');

    const second = await browser.newContext({ viewport: { width: 1365, height: 900 } }); second.__reviewName = 'new isolated context';
    const page2 = await second.newPage(); page2.setDefaultTimeout(8000);
    await login(page2); const fresh = await records(page2);
    const eStatus = fresh.asset === assetId && fresh.instrument === instrumentId ? 'PASS' : 'FAIL';
    await page2.screenshot({ path: path.join(out, 'session-E-new-context.png'), fullPage: true });
    note('E new isolated context same account', eStatus, 'after login: ' + JSON.stringify(fresh), page2, 'session-E-new-context.png');
    await second.close();

    await first.close();
    const third = await browser.newContext({ viewport: { width: 1365, height: 900 } }); third.__reviewName = 'reopened after original closed';
    const page3 = await third.newPage(); page3.setDefaultTimeout(8000);
    await login(page3); const reopened = await records(page3);
    const fStatus = reopened.asset === assetId && reopened.instrument === instrumentId ? 'PASS' : 'FAIL';
    await page3.screenshot({ path: path.join(out, 'session-F-reopened-context.png'), fullPage: true });
    note('F close and reopen context same account', fStatus, 'after login: ' + JSON.stringify(reopened), page3, 'session-F-reopened-context.png');
    await third.close();
  } catch (error) {
    output.fatal = String(error);
    console.error(error);
    process.exitCode = 1;
  } finally {
    output.finishedAt = new Date().toISOString();
    fs.writeFileSync(path.join(out, 'session-storage-browser-results.json'), JSON.stringify(output, null, 2));
    if (results.some(item => item.status === 'FAIL')) process.exitCode = 1;
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
