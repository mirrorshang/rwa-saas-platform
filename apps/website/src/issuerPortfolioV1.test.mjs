import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';

const transpile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const taxonomy = {};
new Function('require', 'exports', transpile('src/assetTaxonomyV1.ts'))(() => ({}), taxonomy);
const domain = {};
new Function('require', 'exports', transpile('src/issuerPortfolioV1.ts'))(name => name.includes('assetTaxonomyV1') ? taxonomy : { getDemoAuth: () => null, getDemoTenant: () => null }, domain);

test('new taxonomy has 7 categories, 23 types and only 6 open templates', () => {
  assert.equal(taxonomy.assetCategories.length, 7);
  assert.equal(taxonomy.assetTypes.length, 23);
  assert.equal(taxonomy.assetTypes.filter(item => item.enabled).length, 6);
  assert.equal(taxonomy.assetType('office').categoryId, 'real_estate');
  assert.equal(taxonomy.assetType('private_equity').enabled, true);
  assert.equal(taxonomy.assetType('spv_equity').enabled, false);
});

test('Token mapping rejects fractional shares and non-terminating six-place rights', () => {
  const equity = { ...domain.blankInstrument(), type: 'equity', total: '100', tokenSupply: '3' };
  assert.match(domain.tokenMapping(equity).error, /整除/);
  assert.equal(domain.tokenMapping({ ...equity, tokenSupply: '20' }).value, '5');
  const debt = { ...equity, type: 'debt', total: '1', tokenSupply: '3' };
  assert.match(domain.tokenMapping(debt).error, /整除/);
  assert.equal(domain.tokenMapping({ ...debt, total: '1.000002' }).value, '0.333334');
  const income = { ...equity, type: 'income', total: '20', tokenSupply: '10000' };
  assert.equal(domain.tokenMapping(income).value, '0.002');
});

test('Offering uses exact U arithmetic and rejects quantity above capacity', () => {
  const fields = { ...domain.blankOffering(), quantity: '1000', price: '120', minOrder: '200', investorCap: '1000' };
  const values = domain.offeringMath(fields);
  assert.equal(domain.moneyText(values.maximum), '120000');
  assert.equal(values.minimumTokens, 2n);
  assert.equal(domain.moneyText(values.minimumPayment), '240');
  assert.equal(values.capTokens, 8n);
  assert.equal(domain.moneyText(values.capRemainder), '40');
  const asset = { status: 'ready', versions: [{ number: 1, fields: domain.blankAsset() }] };
  const instrument = { status: 'ready', versions: [{ number: 1, fields: { ...domain.blankInstrument(), tokenSupply: '1000' } }] };
  assert.ok(domain.offeringIssues({ ...fields, quantity: '1001' }, asset, instrument, [], []).some(issue => issue.includes('发行数量')));
  assert.ok(domain.offeringIssues(fields, asset, instrument, [], [], { assetVersion: 1, instrumentVersion: 2 }).some(issue => issue.includes('新版本')));
});

test('Asset Ready requires verified core files and supported subtype', () => {
  const fields = domain.exampleAsset();
  assert.ok(domain.assetIssues(fields, [], true).some(issue => issue.includes('权属证明')));
  const docs = [{ id: 'title', kind: 'title', status: 'passed' }, { id: 'valuation', kind: 'valuation', status: 'passed' }];
  assert.deepEqual(domain.assetIssues(fields, docs, true), []);
  assert.ok(domain.assetIssues({ ...fields, subtype: 'hotel' }, docs, true).some(issue => issue.includes('已开放')));
});

const verifiedDocuments = fields => domain.requiredAssetDocumentKinds(fields).map((kind, index) => ({ id: `${kind}-${index}`, kind, status: 'passed' }));

test('all six open templates pass their own Ready rules with complete examples', () => {
  for (const type of taxonomy.assetTypes.filter(item => item.enabled)) {
    const fields = domain.exampleAssetFor(type.id);
    assert.deepEqual(domain.assetIssues(fields, verifiedDocuments(fields), true), [], type.label);
  }
  const office = domain.exampleAssetFor('office');
  office.subtypeFields.rentableArea = '12801';
  assert.ok(domain.assetIssues(office).some(issue => issue.includes('不能超过建筑面积')));
});

test('private equity calculates ownership and validates share evidence and conditions', () => {
  const fields = domain.exampleAssetFor('private_equity');
  assert.equal(domain.sharePercentage(fields), '10%（100000 / 1000000 股）');
  assert.deepEqual(domain.assetIssues(fields, verifiedDocuments(fields), true), []);
  assert.ok(domain.assetIssues(fields, [], true).some(issue => issue.includes('股权权属')));
  assert.ok(domain.assetIssues({ ...fields, subtypeFields: { ...fields.subtypeFields, involvedShares: '1000001' } }, verifiedDocuments(fields)).some(issue => issue.includes('不能超过')));
  const restricted = { ...fields, subtypeFields: { ...fields.subtypeFields, restricted: 'yes', restrictionDetail: '章程限制转让' } };
  assert.ok(domain.assetIssues(restricted, verifiedDocuments(fields), true).some(issue => issue.includes('股权限制文件')));
});

test('corporate loan keeps outstanding balance distinct and blocks repaid readiness', () => {
  const fields = domain.exampleAssetFor('corporate_loan');
  assert.deepEqual(domain.assetIssues(fields, verifiedDocuments(fields), true), []);
  const excess = { ...fields, subtypeFields: { ...fields.subtypeFields, outstandingPrincipal: '500001' } };
  assert.ok(domain.assetIssues(excess).some(issue => issue.includes('不能超过合同本金')));
  const repaid = { ...fields, subtypeFields: { ...fields.subtypeFields, outstandingPrincipal: '0', debtStatus: 'repaid' } };
  assert.ok(domain.assetIssues(repaid, verifiedDocuments(repaid), true).some(issue => issue.includes('已清偿债权')));
  const secured = { ...fields, subtypeFields: { ...fields.subtypeFields, secured: 'yes', securitySummary: '保证担保' } };
  assert.ok(domain.assetIssues(secured, verifiedDocuments(fields), true).some(issue => issue.includes('担保依据')));
  const overdue = { ...fields, subtypeFields: { ...fields.subtypeFields, debtStatus: 'overdue', debtStatusDetail: '逾期 30 天' } };
  const asset = { status: 'ready', versions: [{ number: 1, fields: overdue }] };
  const instrument = { status: 'ready', versions: [{ number: 1, fields: { ...domain.blankInstrument(), tokenSupply: '1000' } }] };
  assert.ok(domain.offeringIssues(domain.blankOffering(), asset, instrument, [], []).some(issue => issue.includes('有权主体确认可发行性')));
});

test('equity asset revision keeps its ID and prior Offering reference while invalidating current readiness', () => {
  const tenant = { id: 'tenant-qa', role: '企业管理员' };
  const memory = new Map();
  globalThis.crypto ||= { randomUUID };
  globalThis.localStorage = { getItem: key => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
  globalThis.window = { Event: class {}, dispatchEvent() {} };
  const active = {};
  new Function('require', 'exports', transpile('src/issuerPortfolioV1.ts'))(name => name.includes('assetTaxonomyV1') ? taxonomy : { getDemoAuth: () => ({ email: 'qa@example.com' }), getDemoTenant: () => tenant }, active);
  const fields = active.exampleAssetFor('private_equity');
  const created = active.saveAsset(tenant, fields);
  const stored = JSON.parse(memory.get('wdex-issuer-portfolio-v1'));
  const bucket = stored['qa@example.com/tenant-qa'];
  bucket.assets[0].documents = verifiedDocuments(fields);
  memory.set('wdex-issuer-portfolio-v1', JSON.stringify(stored));
  active.setAssetReady(tenant, created.id);
  const instrumentFields = active.exampleInstrument(active.readPortfolio(tenant).assets[0], 'equity');
  const instrument = active.saveInstrument(tenant, created.id, instrumentFields);
  assert.throws(() => active.saveInstrument(tenant, created.id, instrumentFields), /已有一套权益结构/);
  const stored2 = JSON.parse(memory.get('wdex-issuer-portfolio-v1'));
  stored2['qa@example.com/tenant-qa'].instruments[0].documents = [{ id: 'legal-1', kind: 'legal', status: 'passed' }];
  memory.set('wdex-issuer-portfolio-v1', JSON.stringify(stored2));
  const savedInstrument = active.saveInstrument(tenant, created.id, { ...instrumentFields, legalDocId: 'legal-1' }, instrument.id, 1);
  active.setInstrumentReady(tenant, savedInstrument.id);
  const offering = active.createOffering(tenant, created.id);
  assert.equal(offering.assetVersion, 1);
  const revised = active.saveAsset(tenant, { ...fields, subtypeFields: { ...fields.subtypeFields, involvedShares: '90000' } }, created.id, 1);
  const current = active.readPortfolio(tenant);
  assert.equal(revised.id, created.id);
  assert.equal(current.assets[0].status, 'draft');
  assert.equal(current.instruments[0].status, 'draft');
  assert.equal(current.offerings[0].assetVersion, 1);
  assert.throws(() => active.refreshOfferingReferences(tenant, offering.id), /最新资料检查/);
});
