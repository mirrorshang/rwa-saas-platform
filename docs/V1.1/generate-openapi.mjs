import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(dir, '../V1.0/openapi.yaml');
const output = path.resolve(dir, 'V1.1-OPENAPI.yaml');
const spec = JSON.parse(fs.readFileSync(source, 'utf8'));
const ref = name => ({ $ref: `#/components/schemas/${name}` });
const str = { type: 'string' };
const requiredObject = (properties, required) => ({ type: 'object', properties, required, additionalProperties: false });
spec.info = { ...spec.info, title: 'RWA SaaS V1.1 Backend API candidate', version: '1.1.0', description: '增量候选契约；完整保留 V1.0 路径。真实后端实现、数据库迁移及生产金融服务均未验证。' };
spec['x-implementation-status'] = 'candidate-not-implemented';
const schemas = spec.components.schemas;

schemas.V11PublicFile = requiredObject({ id: str, name: str, category: str, version: { type: 'integer', minimum: 1 }, visibility: { const: '公开' }, source: { enum: ['Asset', 'Instrument', 'Offering'] } }, ['id', 'name', 'category', 'version', 'visibility', 'source']);
schemas.V11Spv = requiredObject({ id: str, legalName: str, jurisdiction: str, registrationNumber: str, role: { enum: ['权益发行主体', '底层资产持有人', '偿付主体', '收益责任主体'] }, assetRelationship: str, issuerRelationship: str, registrationFileId: str, assetAuthorityFileId: str, rightsFileId: str }, ['id', 'legalName', 'jurisdiction', 'registrationNumber', 'role', 'assetRelationship', 'issuerRelationship', 'registrationFileId', 'assetAuthorityFileId', 'rightsFileId']);
const commonRights = { responsibleParty: str, rightsDescription: str, startDate: { type: 'string', format: 'date' }, tokenLegalMapping: str, legalUnitsPerToken: { type: 'integer', minimum: 1 } };
const commonRequired = Object.keys(commonRights);
schemas.V11RightsTerms = { oneOf: [
  requiredObject({ type: { const: '股权' }, ...commonRights, shareIssuer: str, shareClass: str, shareCount: { type: 'integer', minimum: 1 }, votingRights: str, dividendRights: str, liquidationRights: str, exitArrangement: str, termArrangement: { enum: ['无固定期限', '固定期限'] }, maturityDate: { type: 'string', format: 'date' } }, ['type', ...commonRequired, 'shareIssuer', 'shareClass', 'shareCount', 'votingRights', 'dividendRights', 'liquidationRights', 'exitArrangement', 'termArrangement']),
  requiredObject({ type: { const: '债权' }, ...commonRights, debtor: str, principalU: { type: 'number', exclusiveMinimum: 0 }, annualRatePercent: { type: 'number', exclusiveMinimum: 0 }, interestMethod: { const: 'Actual/365 Fixed' }, frequency: { const: '每月付息' }, repayment: { const: '到期一次还本金' }, maturityDate: { type: 'string', format: 'date' } }, ['type', ...commonRequired, 'debtor', 'principalU', 'annualRatePercent', 'interestMethod', 'frequency', 'repayment', 'maturityDate']),
  requiredObject({ type: { const: '收益参与权' }, ...commonRights, revenueSource: str, distributableBasis: str, participationRatePercent: { type: 'number', exclusiveMinimum: 0, maximum: 100 }, frequency: str, expiryArrangement: str, maturityDate: { type: 'string', format: 'date' } }, ['type', ...commonRequired, 'revenueSource', 'distributableBasis', 'participationRatePercent', 'frequency', 'expiryArrangement', 'maturityDate']),
] };
schemas.V11ReturnDisclosure = { oneOf: [
  requiredObject({ kind: { const: '未提供' } }, ['kind']),
  requiredObject({ kind: { enum: ['发行方预期年化收益率', '发行方预期年化回报率'] }, minPercent: { type: 'number', exclusiveMinimum: 0 }, maxPercent: { type: 'number', exclusiveMinimum: 0 }, priceAtCalculationU: { type: 'number', exclusiveMinimum: 0 }, calculatedAt: { type: 'string', format: 'date' }, period: str, incomeBasis: { enum: ['净收益', '毛收益'] }, includesAppreciation: { type: 'boolean' }, assumptions: str, feesAndTaxes: str, evidence: str, risks: str }, ['kind', 'minPercent', 'priceAtCalculationU', 'calculatedAt', 'period', 'incomeBasis', 'includesAppreciation', 'assumptions', 'feesAndTaxes', 'evidence', 'risks']),
] };
schemas.V11AssetFact = requiredObject({ key: str, label: str, value: str }, ['key', 'label', 'value']);
schemas.PublishedOfferingDisclosure = requiredObject({
  schemaVersion: { const: '1.1.0' },
  source: requiredObject({ publicationId: str, offeringId: str, assetId: str, assetVersion: { type: ['integer', 'null'] }, instrumentId: str, instrumentVersion: { type: ['string', 'null'] }, confirmedAt: { type: 'string', format: 'date-time' }, publishedAt: { type: 'string', format: 'date-time' } }, ['publicationId', 'offeringId', 'assetId', 'assetVersion', 'instrumentId', 'instrumentVersion', 'confirmedAt', 'publishedAt']),
  asset: requiredObject({ name: str, category: str, subtype: str, location: { type: ['string', 'null'] }, facts: { type: 'array', items: ref('V11AssetFact') } }, ['name', 'category', 'subtype', 'location', 'facts']),
  issuer: requiredObject({ legalName: { type: ['string', 'null'] }, jurisdiction: { type: ['string', 'null'] }, slug: { type: ['string', 'null'] } }, ['legalName', 'jurisdiction', 'slug']),
  right: requiredObject({ type: { enum: ['股权', '债权', '收益参与权'] }, description: { type: ['string', 'null'] }, legalIssuer: { type: ['string', 'null'] }, tokenMapping: { type: ['string', 'null'] }, terms: { type: 'array', items: requiredObject({ label: str, value: str }, ['label', 'value']) } }, ['type', 'description', 'legalIssuer', 'tokenMapping', 'terms']),
  spv: { oneOf: [{ type: 'null' }, requiredObject({ legalName: str, jurisdiction: str, role: str, assetRelationship: str, issuerRelationship: str, registrationNumber: str }, ['legalName', 'jurisdiction', 'role', 'assetRelationship', 'issuerRelationship'])] },
  return: requiredObject({ kind: { enum: ['未提供', '合同固定年利率', '发行方预期年化收益率', '发行方预期年化回报率'] }, minPercent: { type: 'number' }, maxPercent: { type: 'number' }, methodology: { type: 'object' }, warning: str }, ['kind', 'warning']),
  offering: requiredObject({ name: str, round: str, unitPriceU: { type: 'number', exclusiveMinimum: 0 }, minimumU: { type: ['number', 'null'] }, totalUnits: { type: 'integer', minimum: 1 }, totalIssueAmountU: { type: 'number' }, subscriptionStart: str, subscriptionEnd: str, summary: { type: ['string', 'null'] } }, ['name', 'round', 'unitPriceU', 'minimumU', 'totalUnits', 'totalIssueAmountU', 'subscriptionStart', 'subscriptionEnd', 'summary']),
  risks: { type: 'array', items: str }, documents: { type: 'array', items: ref('V11PublicFile') },
  channels: requiredObject({ v: { const: true }, mListingApproved: { type: 'boolean' } }, ['v', 'mListingApproved']), status: { const: 'Sandbox 已发布' },
}, ['schemaVersion', 'source', 'asset', 'issuer', 'right', 'spv', 'return', 'offering', 'risks', 'documents', 'channels', 'status']);

const addProperty = (pathName, method, section, key, schema) => {
  const op = spec.paths[pathName][method];
  const target = section === 'request' ? op.requestBody.content['application/json'].schema : op.responses['200'].content['application/json'].schema;
  target.properties[key] = schema;
};
for (const section of ['request', 'response']) {
  addProperty('/api/v1/assets/{id}', section === 'request' ? 'patch' : 'get', section, 'public_fields_v1_1', { type: 'array', items: str, description: '仅允许六类模板白名单中经授权的公开字段；旧记录缺失表示待核实' });
  addProperty('/api/v1/instruments/{id}', section === 'request' ? 'patch' : 'get', section, 'rights_v1_1', ref('V11RightsTerms'));
  addProperty('/api/v1/instruments/{id}', section === 'request' ? 'patch' : 'get', section, 'spv_v1_1', { oneOf: [{ type: 'null' }, ref('V11Spv')] });
  addProperty('/api/v1/offerings/{id}', section === 'request' ? 'patch' : 'get', section, 'return_disclosure_v1_1', ref('V11ReturnDisclosure'));
  addProperty('/api/v1/offerings/{id}', section === 'request' ? 'patch' : 'get', section, 'risk_disclosure_v1_1', str);
}
addProperty('/api/v1/files/{id}', 'get', 'response', 'version_v1_1', { type: 'integer', minimum: 1 });
addProperty('/api/v1/files/{id}', 'get', 'response', 'visibility_v1_1', { enum: ['内部', '公开', '授权投资者'] });

const pathId = name => ({ name, in: 'path', required: true, schema: str });
const json = schema => ({ 'application/json': { schema } });
spec.paths['/api/v1/public-disclosures/{publicationId}'] = { get: { operationId: 'V11_DIS_01', summary: '读取已发布的 V1.1 公开披露快照；服务端按 V/M 渠道、Listing 和历史权限核验', tags: ['Investor Portal'], security: [{ SessionCookie: [] }], parameters: [pathId('publicationId'), { name: 'channel', in: 'query', required: true, schema: { enum: ['V', 'M'] } }], responses: { '200': { description: '固定版本公开字段白名单', content: json(ref('PublishedOfferingDisclosure')) }, '403': { description: '渠道、Listing 或投资者权限不足' }, '404': { description: '披露版本不存在或不可见' }, '422': { description: 'schema 不支持或数据缺损' } } } };
spec.paths['/api/v1/public-disclosures/{publicationId}/files/{fileId}'] = { get: { operationId: 'V11_DIS_02', summary: '授权读取固定版本公开文件；不得依赖可猜测的静态 URL', tags: ['Investor Portal', 'Files'], security: [{ SessionCookie: [] }], parameters: [pathId('publicationId'), pathId('fileId'), { name: 'version', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } }, { name: 'channel', in: 'query', required: true, schema: { enum: ['V', 'M'] } }], responses: { '200': { description: '临时受控文件读取引用；阅读、下载不构成签署', content: json(requiredObject({ file: ref('V11PublicFile'), accessUrl: { type: 'string', format: 'uri' }, expiresAt: { type: 'string', format: 'date-time' } }, ['file', 'accessUrl', 'expiresAt'])) }, '403': { description: '文件或当前渠道无权访问' }, '404': { description: '文件版本不存在' } } } };

fs.writeFileSync(output, JSON.stringify(spec, null, 2) + '\n');
console.log(`V1.1 candidate: ${Object.keys(spec.paths).length} paths; ${Object.keys(schemas).length} schemas; ${output}`);
