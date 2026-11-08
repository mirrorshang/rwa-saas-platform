const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/82623/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin = 'http://127.0.0.1:4178';
const results = [];
const out = __dirname;
const run = async (name, fn) => { try { await fn(); results.push({ name, result: 'PASS' }); console.log('PASS', name); } catch (error) { results.push({ name, result: 'FAIL', error: String(error) }); console.error('FAIL', name, error); } };
const field = (page, label) => page.locator('.r2-asset-step .r2-kyb-field').filter({ has: page.locator('span', { hasText: label }) }).first().locator('input,select,textarea').first();
const assets = page => page.evaluate(() => JSON.parse(sessionStorage.getItem('wdex-issuer-r2-assets-v1') || '{}'));
async function loginAndApprove(page) {
  await page.goto(origin + '/issuer-r2/login');
  await page.locator('#r2-email').fill('asset-' + Date.now() + '@example.com');
  await page.getByRole('button', { name: /获取验证码/ }).click();
  await page.locator('#r2-code').fill('123456');
  await page.getByRole('button', { name: /验证并继续/ }).click();
  await page.getByRole('checkbox', { name: /我已阅读/ }).check();
  await page.getByRole('button', { name: /确认并进入工作台/ }).click();
  await page.waitForURL(origin + '/issuer-r2');
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByRole('button', { name: '生成完整企业认证场景' }).click();
  await page.waitForURL(origin + '/issuer-r2/settings/kyb');
  await page.getByRole('button', { name: /测试工具/ }).click();
  await page.getByLabel('企业认证审核结果').selectOption('approved');
  await page.getByRole('button', { name: /关闭测试工具/ }).click();
  await page.goto(origin + '/issuer-r2/assets');
}
async function upload(page, label) {
  const bytes = await page.evaluate(() => { const canvas = document.createElement('canvas'); canvas.width = 350; canvas.height = 180; const c = canvas.getContext('2d'); c.fillStyle = 'white'; c.fillRect(0,0,350,180); c.fillStyle = 'black'; c.font = '24px Arial'; c.fillText('ASSET FILE',30,90); return canvas.toDataURL('image/png').split(',')[1]; });
  await page.locator('input[aria-label="上传' + label + '"]').setInputFiles({ name: label + '.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') });
}
async function go(page, step) { await page.locator('.r2-steps button').nth(step).click(); }
async function fillReady(page) {
  await go(page, 1);
  await field(page, '国家或地区').selectOption('CN'); await field(page, '城市或行政区域').fill('上海'); await field(page, '详细地址').fill('上海市测试路 88 号'); await field(page, '当前使用情况').selectOption('出租');
  await go(page, 2);
  await field(page, '登记权利人').fill('权利人甲'); await field(page, '权利性质').selectOption('所有权'); await field(page, '与发行企业的关系').selectOption('同一主体'); await field(page, '抵押及其他权利限制').selectOption('无'); await field(page, '参考估值').fill('1000000'); await field(page, '估值基准日期').fill('2026-10-01'); await field(page, '估值依据').selectOption('近期成交价');
  await upload(page, '资产权属证明'); await upload(page, '资产估值依据文件');
  await go(page, 3); await field(page, '住宅形态').selectOption('单套'); await field(page, '建筑面积').fill('100');
  await page.getByRole('button', { name: '保存草稿' }).click();
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage(); page.on('dialog', dialog => dialog.accept());
  await run('U01 认证进入资产列表与空状态', async () => { await loginAndApprove(page); await page.getByRole('heading', { name: '暂无资产' }).waitFor(); await page.screenshot({ path: path.join(out, '01-empty.png'), fullPage: true }); });
  await run('8 大类 24 子类与四模板开放', async () => { await page.getByRole('link', { name: /创建资产/ }).first().click(); await page.waitForURL(origin + '/issuer-r2/assets/new'); if (await page.locator('.r2-category-groups button').count() !== 8) throw Error('group count'); let count=0; for(const name of ['房地产','金融资产','企业资产','商品','基础设施','自然资源','艺术与收藏','其他资产']) { await page.getByRole('button',{name,exact:true}).click(); count+=await page.locator('.r2-subtype-grid button').count(); } if(count!==24) throw Error('subtype count '+count); await page.getByRole('button',{name:'房地产',exact:true}).click(); if(await page.locator('.r2-subtype-grid button:not([disabled])').count()!==4) throw Error('open count'); await page.screenshot({path:path.join(out,'02-categories.png'),fullPage:true}); });
  await run('住宅草稿保存与刷新恢复', async () => { await page.getByRole('button',{name:/住宅 可创建/}).click(); await page.getByRole('button',{name:/下一步/}).click(); await field(page,'资产名称').fill('浦东住宅资产'); await page.getByRole('button',{name:'保存草稿'}).click(); await page.reload(); if(!(await page.locator('input[value="浦东住宅资产"]').count())) throw Error('draft lost'); await page.screenshot({path:path.join(out,'03-draft.png'),fullPage:true}); });
  await run('Draft 改子类确认及公共字段保留', async () => { await go(page,3); await field(page,'建筑面积').fill('80'); await go(page,0); const before=await page.locator('.r2-subtype-grid button.chosen').innerText(); page.removeAllListeners('dialog'); page.on('dialog', dialog=>dialog.dismiss()); await page.getByRole('button',{name:/写字楼 可创建/}).click(); if((await page.locator('.r2-subtype-grid button.chosen').innerText())!==before) throw Error('cancel changed'); page.removeAllListeners('dialog'); page.on('dialog', dialog=>dialog.accept()); await page.getByRole('button',{name:/写字楼 可创建/}).click(); await go(page,1); if(await field(page,'资产名称').inputValue()!=='浦东住宅资产') throw Error('common lost'); await go(page,3); if(await field(page,'建筑面积').inputValue()) throw Error('subtype stale'); await go(page,0); await page.getByRole('button',{name:/住宅 可创建/}).click(); await go(page,3); });
  await run('已输入非法面积阻止保存', async () => { await field(page,'建筑面积').fill('-3'); await page.getByRole('button',{name:'保存草稿'}).click(); if(!await page.getByText(/请输入大于 0 的数值/).count()) throw Error('invalid saved'); await field(page,'建筑面积').fill('100'); });
  await run('资料缺项定位、文件待扫描、Mock 扫描、Ready', async () => { await go(page,4); await page.getByRole('button',{name:/完成资料检查/}).click(); if(!await page.getByText(/资料待补充/).count()) throw Error('no issues'); await fillReady(page); await go(page,4); await page.getByRole('button',{name:/完成资料检查/}).click(); if(!await page.getByText(/待安全扫描/).count()) throw Error('pending accepted'); await page.getByRole('button',{name:/测试工具/}).click(); await page.getByLabel('资产扫描结果').selectOption('passed'); await page.getByRole('button',{name:'处理待扫描文件'}).click(); await page.getByRole('button',{name:/关闭测试工具/}).click(); await page.reload(); await go(page,4); await page.getByRole('button',{name:/完成资料检查/}).click(); await page.waitForURL(/\/issuer-r2\/assets\/[^/]+$/); await page.getByText('资料已完备').first().waitFor(); await page.screenshot({path:path.join(out,'04-ready.png'),fullPage:true}); });
  await run('资产四 TAB 与发行管理空状态', async () => { for(const tab of ['资产概览','资产资料','权益结构','发行管理']) { await page.getByRole('navigation',{name:'资产详情'}).getByRole('link',{name:tab}).click(); await page.getByRole('heading',{name:tab}).last().waitFor(); } await page.getByText(/暂无发行方案/).waitFor(); await page.screenshot({path:path.join(out,'05-offering-empty.png'),fullPage:true}); });
  await run('Ready 禁止换类及文件版本更换', async () => { const id=page.url().match(/assets\/([^/?]+)/)[1]; await page.goto(origin+'/issuer-r2/assets/'+id+'/edit'); await go(page,0); await page.getByRole('button',{name:/写字楼 可创建/}).click(); if(!await page.getByText(/不能直接切换类别/).count()) throw Error('ready subtype switch'); await go(page,2); await upload(page,'资产权属证明'); await page.getByRole('button',{name:'保存草稿'}).click(); const store=await assets(page); const record=Object.values(store)[0].find(a=>a.id===id).documents.find(d=>d.category==='ownership'); if(record.versions.length!==2 || record.versions[0].id===record.versions[1].id) throw Error('version lost'); await page.screenshot({path:path.join(out,'06-file-version.png'),fullPage:true}); });
  await run('写字楼、商铺、工业园模板动态字段与 Ready 缺项', async () => {
    for (const [name, specific] of [['写字楼', '出租率'], ['商铺', '商铺形态'], ['工业园／仓储物流', '物业形态']]) {
      await page.goto(origin+'/issuer-r2/assets/new'); await page.getByRole('button',{name:new RegExp(name+' 可创建')}).click(); await go(page,3);
      await field(page,'建筑面积').waitFor(); await field(page,specific).waitFor();
      await go(page,4); await page.getByRole('button',{name:/完成资料检查/}).click();
      if (!await page.getByText('建筑面积：请填写大于 0 的建筑面积。').count()) throw Error(name+' Ready gate');
    }
    await page.screenshot({path:path.join(out,'07-subtypes.png'),fullPage:true});
  });
  await run('资产多图添加、排序、移除及草稿恢复', async () => {
    await page.goto(origin+'/issuer-r2/assets/new'); await page.getByRole('button',{name:/住宅 可创建/}).click(); await go(page,1);
    await field(page,'资产名称').fill('多图测试资产');
    await page.getByRole('button',{name:/添加图片/}).click(); await upload(page,'资产图片 1');
    await page.getByRole('button',{name:/添加图片/}).click(); await upload(page,'资产图片 2');
    await page.waitForFunction(() => document.querySelectorAll('.r2-gallery-item').length === 2);
    await page.locator('.r2-gallery-item').nth(1).getByRole('button',{name:'上移'}).click();
    if(!(await page.locator('.r2-gallery-item').first().innerText()).includes('资产图片 2')) throw Error('order');
    await page.locator('.r2-gallery-item').nth(1).getByRole('button',{name:'移除'}).click();
    await page.getByRole('button',{name:'保存草稿'}).click(); await page.reload();
    if(await page.locator('.r2-gallery-item').count()!==1) throw Error('gallery not restored');
    await page.screenshot({path:path.join(out,'08-gallery.png'),fullPage:true});
  });
  await context.close(); await browser.close(); fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2)); if(results.some(x=>x.result==='FAIL')) process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
