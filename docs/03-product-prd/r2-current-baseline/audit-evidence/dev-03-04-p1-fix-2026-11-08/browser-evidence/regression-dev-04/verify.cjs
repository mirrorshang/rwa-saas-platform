const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/82623/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = 'http://127.0.0.1:4178';
const out = __dirname;
const results = [];
const run = async (name, fn) => { try { await fn(); results.push({ name, result: 'PASS' }); console.log('PASS', name); } catch (error) { results.push({ name, result: 'FAIL', error: String(error) }); console.error('FAIL', name, error); } };
const field = (page, label, scope = '.r2-instrument-page') => page.locator(scope + ' .r2-kyb-field').filter({ hasText: label }).first().locator('input,textarea,select').first();
const store = (page, key) => page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || '{}'), key);
async function upload(page, label) {
  const data = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 320; c.height = 160; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 320, 160); x.fillStyle = '#111'; x.font = '22px Arial'; x.fillText('RIGHTS PROOF', 30, 90); return c.toDataURL('image/png').split(',')[1]; });
  await page.locator('input[aria-label="上传' + label + '"]').setInputFiles({ name: label + '.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
}
async function prepareAsset(page) {
  await page.goto(origin + '/issuer-r2/login');
  await page.locator('#r2-email').fill('instrument-' + Date.now() + '@example.com');
  await page.getByRole('button', { name: /获取验证码/ }).click(); await page.locator('#r2-code').fill('123456');
  await page.getByRole('button', { name: /验证并继续/ }).click(); await page.getByRole('checkbox', { name: /我已阅读/ }).check();
  await page.getByRole('button', { name: /确认并进入工作台/ }).click(); await page.waitForURL(origin + '/issuer-r2');
  await page.getByRole('button', { name: /测试工具/ }).click(); await page.getByRole('button', { name: '生成完整企业认证场景' }).click();
  await page.waitForURL(origin + '/issuer-r2/settings/kyb'); await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByLabel('企业认证审核结果').selectOption('approved'); await page.getByRole('button', { name: /关闭测试工具/ }).click();
  await page.goto(origin + '/issuer-r2/assets/new');
  await page.getByRole('button', { name: /住宅 可创建/ }).click(); await page.getByRole('button', { name: /下一步/ }).click();
  await field(page, '资产名称', '.r2-asset-step').fill('权益关联测试资产');
  await field(page, '国家或地区', '.r2-asset-step').selectOption('CN'); await field(page, '城市或行政区域', '.r2-asset-step').fill('上海');
  await field(page, '详细地址', '.r2-asset-step').fill('上海市示例路 28 号'); await field(page, '当前使用情况', '.r2-asset-step').selectOption('出租');
  await page.locator('.r2-steps button').nth(2).click();
  await field(page, '登记权利人', '.r2-asset-step').fill('测试资产持有人'); await field(page, '权利性质', '.r2-asset-step').selectOption('所有权');
  await field(page, '与发行企业的关系', '.r2-asset-step').selectOption('同一主体'); await field(page, '抵押及其他权利限制', '.r2-asset-step').selectOption('无');
  await field(page, '参考估值', '.r2-asset-step').fill('1000000'); await field(page, '估值基准日期', '.r2-asset-step').fill('2026-10-01');
  await field(page, '估值依据', '.r2-asset-step').selectOption('近期成交价');
  await upload(page, '资产权属证明'); await upload(page, '资产估值依据文件');
  await page.locator('.r2-steps button').nth(3).click(); await field(page, '住宅形态', '.r2-asset-step').selectOption('整栋'); await field(page, '建筑面积', '.r2-asset-step').fill('100');
  await page.getByRole('button', { name: '保存草稿' }).click(); await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByRole('button', { name: '处理待扫描文件' }).click(); await page.getByRole('button', { name: /关闭测试工具/ }).click();
  await page.reload(); await page.locator('.r2-steps button').nth(4).click(); await page.getByRole('button', { name: /完成资料检查/ }).click();
  await page.waitForURL(/\/issuer-r2\/assets\/[^/]+$/);
  const assetId = page.url().match(/assets\/([^/?]+)/)[1];
  await page.getByRole('navigation', { name: '资产详情' }).getByRole('link', { name: '权益结构' }).click();
  await page.getByRole('link', { name: /创建权益结构/ }).click();
  await page.waitForURL(origin + '/issuer-r2/assets/' + assetId + '/instrument');
  return assetId;
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await context.newPage(); page.setDefaultTimeout(8000);
  page.on('dialog', dialog => dialog.accept()); let assetId = '';
  await run('Asset Ready 后创建一项权益结构', async () => { assetId = await prepareAsset(page); await page.getByRole('heading', { name: '权益定义' }).waitFor(); await page.screenshot({ path: path.join(out, '01-single-page.png'), fullPage: true }); });
  if (!assetId) { await context.close(); await browser.close(); fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2)); process.exitCode = 1; return; }
  await run('三种权益类型动态字段与单页结构', async () => {
    if (await page.locator('.r2-instrument-page .r2-steps').count()) throw Error('old wizard');
    for (const title of ['权益定义', 'Token 拆分', '法律文件']) await page.getByRole('heading', { name: title }).waitFor();
    await page.getByRole('button', { name: '债权', exact: true }).click(); await field(page, '债务主体').waitFor();
    await field(page, '利息方式').selectOption('fixed'); await field(page, '固定年利率').waitFor();
    await field(page, '债权本金总额').fill('10'); await field(page, 'Token 总份数').fill('3'); await page.getByText(/无法按 Token 份数精确拆分/).waitFor();
    await field(page, 'Token 总份数').fill('4'); await page.getByText('2.5 U 名义本金').waitFor();
    await page.getByRole('button', { name: '收益参与权', exact: true }).click(); await field(page, '收益计算口径').waitFor();
    await field(page, '授权参与比例').fill('10'); await field(page, 'Token 总份数').fill('10000'); await page.getByText('0.001 % 合同收益参与比例').waitFor();
    await field(page, '授权参与比例').fill('101'); await page.getByText(/不超过 100%/).waitFor();
    await page.getByRole('button', { name: '股权', exact: true }).click(); await field(page, '对应法律实体').waitFor();
    if (await field(page, '募集金额').count() || await field(page, '认购价格').count()) throw Error('Offering fields visible');
  });
  await run('精确拆分及非法数值阻止 Ready', async () => {
    await field(page, '普通股数量').fill('3'); await field(page, 'Token 总份数').fill('2');
    await page.getByRole('button', { name: /完成资料检查/ }).click(); await page.getByText(/整股精确拆分/).first().waitFor();
    await field(page, '普通股数量').fill('1000'); await field(page, 'Token 总份数').fill('100');
    await page.getByText('10 股普通股').waitFor();
  });
  await run('Draft 保存、刷新恢复及重复创建防护', async () => {
    await page.getByRole('button', { name: '保存草稿' }).click(); await page.reload();
    if (await field(page, '普通股数量').inputValue() !== '1000') throw Error('draft lost');
    const items = await store(page, 'wdex-issuer-r2-instruments-v1'); if (Object.values(items)[0].length !== 1) throw Error('duplicate');
    await page.screenshot({ path: path.join(out, '02-draft.png'), fullPage: true });
  });
  await run('资产文件固定版本引用与核心文件扫描', async () => {
    await field(page, '权利责任主体').fill('权益责任主体'); await field(page, '投资者获得的权利').fill('取得协议约定的普通股相关权利');
    await field(page, '对应法律实体').fill('示例法律实体'); await field(page, '股东／持有人权利说明').fill('按协议享有表决与收益权');
    await page.locator('.r2-reference-row').first().locator('input').check(); await upload(page, '股权权益协议或适用权利证明');
    await page.locator('.r2-doc-row').filter({ hasText: '股权权益协议或适用权利证明' }).getByRole('button', { name: '查看' }).click();
    const preview = page.getByRole('dialog').locator('img'); await preview.waitFor();
    if (await preview.evaluate(img => img.naturalWidth) <= 0) throw Error('file content did not render');
    await page.getByRole('button', { name: '关闭预览' }).click();
    await page.getByRole('button', { name: /完成资料检查/ }).click(); await page.getByText(/核心文件待安全扫描/).first().waitFor();
    await page.getByRole('button', { name: '保存草稿' }).click(); await page.getByRole('button', { name: /测试工具/ }).click();
    await page.getByLabel('权益文件扫描结果').selectOption('failed');
    await page.getByRole('button', { name: '处理权益文件扫描' }).click(); await page.getByRole('button', { name: /关闭测试工具/ }).click();
    await page.reload(); await page.getByText(/扫描失败，请更换/).first().waitFor();
    await upload(page, '股权权益协议或适用权利证明'); await page.getByRole('button', { name: '保存草稿' }).click();
    await page.getByRole('button', { name: /测试工具/ }).click(); await page.getByLabel('权益文件扫描结果').selectOption('passed');
    await page.getByRole('button', { name: '处理权益文件扫描' }).click(); await page.getByRole('button', { name: /关闭测试工具/ }).click();
    await page.reload(); const items = await store(page, 'wdex-issuer-r2-instruments-v1'); const item = Object.values(items)[0][0];
    if (!item.assetReferences.length || !item.assetReferences[0].versionId) throw Error('fixed reference missing');
    await page.screenshot({ path: path.join(out, '03-file-reference.png'), fullPage: true });
  });
  await run('资料 Ready、一资产一结构与发行管理空状态', async () => {
    await page.getByRole('button', { name: /完成资料检查/ }).click(); await page.waitForURL(origin + '/issuer-r2/assets/' + assetId + '?tab=instrument');
    await page.getByText('资料已完备').first().waitFor(); if (await page.getByRole('link', { name: /创建权益结构/ }).count()) throw Error('second instrument offered');
    await page.screenshot({ path: path.join(out, '04-ready.png'), fullPage: true });
    await page.getByRole('link', { name: /前往发行管理/ }).click(); await page.getByText(/暂无发行方案/).waitFor();
    await page.screenshot({ path: path.join(out, '05-offering-empty.png'), fullPage: true });
  });
  await run('Free / Standard 及降级历史只读', async () => {
    await page.getByRole('button', { name: /测试工具/ }).click(); await page.getByLabel('套餐场景').selectOption('standard');
    await page.getByRole('button', { name: /关闭测试工具/ }).click(); await page.goto(origin + '/issuer-r2/assets/' + assetId + '?tab=instrument');
    await page.getByRole('link', { name: '编辑权益结构' }).waitFor();
    await page.getByRole('button', { name: /测试工具/ }).click(); await page.getByLabel('套餐场景').selectOption('downgraded');
    await page.getByRole('button', { name: /关闭测试工具/ }).click(); await page.reload();
    if (await page.getByRole('link', { name: '编辑权益结构' }).count()) throw Error('downgraded editable');
    await page.goto(origin + '/issuer-r2/assets/' + assetId + '/instrument'); await page.getByText(/历史权益结构仅可查看/).waitFor();
    await page.screenshot({ path: path.join(out, '06-downgraded.png'), fullPage: true });
    await page.getByRole('button', { name: /测试工具/ }).click(); await page.getByLabel('套餐场景').selectOption('standard');
    await page.getByRole('button', { name: /关闭测试工具/ }).click(); await page.reload();
    await page.getByRole('button', { name: '保存草稿' }).waitFor();
  });
  await run('Ready 类型保护与资产文件更换后引用不漂移', async () => {
    await page.goto(origin + '/issuer-r2/assets/' + assetId + '/instrument'); await page.getByRole('button', { name: '债权', exact: true }).click();
    await page.getByText(/不能直接切换类型/).waitFor();
    const before = (Object.values(await store(page, 'wdex-issuer-r2-instruments-v1'))[0][0]).assetReferences[0].versionId;
    await page.goto(origin + '/issuer-r2/assets/' + assetId + '/edit'); await page.locator('.r2-steps button').nth(2).click(); await upload(page, '资产权属证明'); await page.getByRole('button', { name: '保存草稿' }).click();
    const after = (Object.values(await store(page, 'wdex-issuer-r2-instruments-v1'))[0][0]).assetReferences[0].versionId;
    if (before !== after) throw Error('reference drift');
    await page.screenshot({ path: path.join(out, '07-fixed-version.png'), fullPage: true });
  });
  await run('官网与旧 Issuer 基本路由', async () => {
    await page.goto(origin + '/'); await page.locator('body').getByText(/WDEX/).first().waitFor();
    await page.goto(origin + '/issuer/assets'); await page.waitForURL(origin + '/issuer/assets');
    if (await page.getByText(/404|Not Found/).count()) throw Error('legacy route unavailable');
  });
  await run('移动端权益页面无横向溢出', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + '/issuer-r2/assets/' + assetId + '?tab=instrument');
    await page.getByRole('heading', { name: '权益关联测试资产 股权' }).waitFor();
    const width = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
    if (width.body > width.viewport + 2) throw Error('horizontal overflow ' + JSON.stringify(width));
    if (!await page.getByRole('navigation', { name: '资产详情' }).getByRole('link', { name: '发行管理' }).isVisible()) throw Error('fourth tab hidden');
    await page.screenshot({ path: path.join(out, '08-mobile.png'), fullPage: true });
  });
  await context.close(); await browser.close(); fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2)); if (results.some(item => item.result === 'FAIL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
