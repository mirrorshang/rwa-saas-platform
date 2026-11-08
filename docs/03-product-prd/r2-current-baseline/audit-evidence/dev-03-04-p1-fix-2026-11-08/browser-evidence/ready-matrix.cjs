const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { chromium } = require('C:/Users/82623/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = 'http://127.0.0.1:4178';
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: path.resolve(__dirname, '../..'), encoding: 'utf8' }).trim();
const results = [];
const stamp = () => new Date().toISOString();

async function prepare(page, email) {
  await page.goto(origin + '/issuer-r2/login');
  await page.locator('#r2-email').fill(email);
  await page.getByRole('button', { name: /获取验证码/ }).click();
  await page.locator('#r2-code').fill('123456');
  await page.getByRole('button', { name: /验证并继续/ }).click();
  await page.getByRole('checkbox', { name: /我已阅读/ }).check();
  await page.getByRole('button', { name: /确认并进入工作台/ }).click();
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByRole('button', { name: '生成完整企业认证场景' }).click();
  await page.waitForURL(origin + '/issuer-r2/settings/kyb');
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByLabel('企业认证审核结果').selectOption('approved');
  await page.getByRole('button', { name: /关闭测试工具/ }).click();
}

async function seed(page, fixture) {
  await page.evaluate(f => {
    const at = new Date().toISOString();
    const ver = id => ({ id, version: 1, name: id + '.png', size: 100, mime: 'image/png', uploadedAt: at, uploadedBy: f.email, scan: 'passed' });
    const doc = (id, category, label) => ({ id, category, label, versions: [ver(id + '-v1')], currentVersionId: id + '-v1' });
    const fields = { description: '', country: 'CN', city: '上海', address: '示例路 1 号', usage: '出租', usageOther: '', registeredOwner: '资产持有人', rightNature: '所有权', rightNatureOther: '', rightRegistration: '', issuerRelation: '同一主体', relationNote: '', operator: '', encumbrance: '无', encumbranceNote: '', valuation: '1000000', valuationDate: '2026-10-01', valuationBasis: '近期成交价', valuer: '', valuationNote: '', residenceForm: f.subtype === '住宅' ? '整栋' : '', residenceCount: '', propertyForm: ['商铺', '工业园／仓储物流'].includes(f.subtype) ? '独立产权' : '', buildingArea: '100', rentableArea: '', occupancy: '' };
    const asset = { id: f.assetId, tenant: f.email, number: 'AST-MATRIX-01', category: '房地产', subtype: f.subtype, name: f.subtype + '验收资产', status: f.instrumentType ? 'ready' : 'draft', savedStep: 4, fields, documents: [doc('owner-file', 'ownership', '资产权属证明'), doc('value-file', 'valuation', '资产估值依据文件')], version: 1, updatedAt: at, history: [], instrumentId: f.instrumentType ? f.instrumentId : null };
    sessionStorage.setItem('wdex-issuer-r2-assets-v1', JSON.stringify({ [f.email]: [asset] }));
    if (f.instrumentType) {
      const rights = { obligor: '权利义务主体', rights: '投资者取得的权益', legalEntity: '对应法律实体', holderRights: '股东可获得的权利', debtor: '债务主体', interest: 'fixed', rate: '5', interestStart: '2026-01-01', maturity: '2027-01-01', incomeSource: '租金收入', incomeBasis: '扣除费用后的净收入', incomeTerm: '五年', incomeFrequency: '年度' };
      const label = { equity: '股权权益协议或其他权益证明', debt: '债权协议或债权形成证明', income: '收益参与协议' }[f.instrumentType];
      const instrument = { id: f.instrumentId, tenant: f.email, assetId: f.assetId, type: f.instrumentType, name: f.instrumentType + '验收权益', status: 'draft', fields: rights, totalRights: f.instrumentType === 'income' ? '50' : '100', tokenCount: '10', documents: [doc('core-file', 'core-' + f.instrumentType, label)], assetReferences: [{ fileId: 'owner-file', versionId: 'owner-file-v1', label: '资产权属证明' }], version: 1, updatedAt: at, history: [], linkedOfferings: [] };
      sessionStorage.setItem('wdex-issuer-r2-instruments-v1', JSON.stringify({ [f.email]: [instrument] }));
    }
  }, fixture);
}

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const fixtures = [
    ...['住宅', '写字楼', '商铺', '工业园／仓储物流'].map((subtype, i) => ({ id: 'ASSET-' + (i + 1), subtype })),
    ...['equity', 'debt', 'income'].map((instrumentType, i) => ({ id: 'INSTRUMENT-' + (i + 1), subtype: '住宅', instrumentType })),
  ];
  for (const [index, entry] of fixtures.entries()) {
    const fixture = { ...entry, email: 'matrix-' + Date.now() + '-' + index + '@example.com', assetId: 'asset-matrix-' + index, instrumentId: 'instrument-matrix-' + index };
    const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    const page = await context.newPage(); page.setDefaultTimeout(8000);
    page.on('dialog', dialog => dialog.accept());
    try {
      await prepare(page, fixture.email);
      await seed(page, fixture);
      if (fixture.instrumentType) {
        await page.goto(origin + '/issuer-r2/assets/' + fixture.assetId + '/instrument');
        await page.getByRole('button', { name: /完成资料检查/ }).click();
        await page.waitForURL(origin + '/issuer-r2/assets/' + fixture.assetId + '?tab=instrument');
        const state = await page.evaluate(email => JSON.parse(sessionStorage.getItem('wdex-issuer-r2-instruments-v1'))[email][0], fixture.email);
        if (state.status !== 'ready' || !state.reviewedAssetVersions?.['owner-file']) throw Error('Instrument Ready/固定引用复核未保存');
        if (!await page.getByRole('link', { name: /前往发行管理/ }).count()) throw Error('Ready CTA missing');
      } else {
        await page.goto(origin + '/issuer-r2/assets/' + fixture.assetId + '/edit');
        await page.locator('.r2-steps button').nth(4).click();
        await page.getByRole('button', { name: /完成资料检查/ }).click();
        await page.waitForURL(origin + '/issuer-r2/assets/' + fixture.assetId);
        const state = await page.evaluate(email => JSON.parse(sessionStorage.getItem('wdex-issuer-r2-assets-v1'))[email][0], fixture.email);
        if (state.status !== 'ready') throw Error('Asset Ready 未保存');
      }
      await page.screenshot({ path: path.join(__dirname, 'matrix-' + fixture.id + '.png'), fullPage: true });
      results.push({ id: fixture.id, result: 'PASS', at: stamp(), fixture, url: page.url(), screenshot: 'matrix-' + fixture.id + '.png' });
      console.log('PASS', fixture.id, fixture.subtype, fixture.instrumentType || '');
    } catch (error) {
      results.push({ id: fixture.id, result: 'FAIL', at: stamp(), fixture, url: page.url(), error: String(error) });
      console.error('FAIL', fixture.id, error);
    } finally { await context.close(); }
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'matrix-results.json'), JSON.stringify({ head, at: stamp(), browser: 'isolated Chrome context per fixture', note: 'Preseeded Mock file scan=passed; Ready action executed through actual UI', results }, null, 2));
  if (results.some(item => item.result === 'FAIL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
