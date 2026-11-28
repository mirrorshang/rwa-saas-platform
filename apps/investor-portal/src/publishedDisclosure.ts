import type { Offering } from './domain.ts';

const object = (value: unknown): Record<string, unknown> | null => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const requiredText = (row: Record<string, unknown>, key: string) => {
  const value = row[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`披露数据缺少 ${key}`);
  return value;
};
const optionalText = (value: unknown) => typeof value === 'string' && value.trim() ? value : null;
const cents = (value: unknown, label: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(Math.round(value * 100))) throw new Error(`${label}无效`);
  return Math.round(value * 100);
};
const category = (subtype: string) => subtype === '商业商铺' ? '商铺' : subtype === '工业园/仓储物流物业' ? '工业园/仓储物流' : subtype === '非上市企业普通股权' ? '非上市普通股权' : subtype === '单笔企业借款债权' ? '企业借款债权' : subtype;
const pair = (label: string, value: unknown): [string,string] | null => optionalText(value) ? [label, String(value)] : null;

/** The JSON is produced by Issuer's published snapshot exporter; no financial term is recreated here. */
export function loadPublishedDisclosures(raw: unknown, images: { residence: string; debt: string }, approvedMListingIds: readonly string[] = []): Offering[] {
  if (!Array.isArray(raw)) throw new Error('披露数据根结构无效');
  const seen = new Set<string>();
  return raw.map((value, index) => {
    const dto = object(value), source = object(dto?.source), asset = object(dto?.asset), issuer = object(dto?.issuer), right = object(dto?.right), returned = object(dto?.return), offering = object(dto?.offering), channels = object(dto?.channels);
    if (!dto || dto.schemaVersion !== '1.1.0' || !source || !asset || !issuer || !right || !returned || !offering || !channels || dto.status !== 'Sandbox 已发布') throw new Error(`第 ${index + 1} 条披露 schema 或状态无效`);
    const id = requiredText(source, 'offeringId');
    if (seen.has(id)) throw new Error(`披露数据重复 Offering ${id}`);
    seen.add(id);
    const slug = requiredText(issuer, 'slug');
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('发行企业渠道标识无效');
    if (channels.v !== true || typeof channels.mListingApproved !== 'boolean') throw new Error('渠道披露权限无效');
    const type = requiredText(right, 'type');
    if (!['股权', '债权', '收益参与权'].includes(type)) throw new Error('权益类型无效');
    const kind = requiredText(returned, 'kind');
    if (!['未提供', '合同固定年利率', '发行方预期年化收益率', '发行方预期年化回报率'].includes(kind)) throw new Error('回报类型无效');
    if (kind !== '未提供' && (typeof returned.minPercent !== 'number' || !Number.isFinite(returned.minPercent) || returned.minPercent <= 0 || (returned.maxPercent !== undefined && (typeof returned.maxPercent !== 'number' || returned.maxPercent < returned.minPercent)))) throw new Error('回报数值无效');
    const methodology = object(returned.methodology);
    if (kind.startsWith('发行方预期') && (!methodology || typeof methodology.priceAtCalculation !== 'number' || methodology.priceAtCalculation !== offering.unitPriceU || !optionalText(methodology.calculatedAt) || !optionalText(methodology.period) || !optionalText(methodology.evidence) || !optionalText(methodology.risks))) throw new Error('回报测算依据或价格无效');
    const unitPrice = cents(offering.unitPriceU, '发行单价');
    const minimum = offering.minimumU === null ? unitPrice : cents(offering.minimumU, '最低认购金额');
    if (!Number.isSafeInteger(offering.totalUnits) || (offering.totalUnits as number) <= 0) throw new Error('发行份数无效');
    if (!Array.isArray(asset.facts) || !Array.isArray(right.terms) || !Array.isArray(dto.documents) || !Array.isArray(dto.risks)) throw new Error('披露字段列表无效');
    const facts: [string,string][] = asset.facts.map((item: unknown) => { const row = object(item); if (!row) throw new Error('资产公开字段无效'); return [requiredText(row, 'label'), requiredText(row, 'value')]; });
    const terms: [string,string][] = right.terms.map((item: unknown) => { const row = object(item); if (!row) throw new Error('权益条款无效'); const label = requiredText(row, 'label'); const value = requiredText(row, 'value'); return [label, label === '参与比例' && /^\d+(?:\.\d+)?$/.test(value) ? `${value}%` : value]; });
    const normalizedTerms = [pair('投资者法律权利', right.description), pair('每 Token 权益映射', right.tokenMapping), ...terms].filter((item): item is [string,string] => item !== null);
    const term = (label: string) => terms.find(([key]) => key === label)?.[1];
    if (type === '债权') normalizedTerms.push(...[pair('合同固定年利率', kind === '合同固定年利率' ? `${returned.minPercent}%（非保证兑付）` : null), pair('付息方式', term('付息周期')), pair('本金偿还', term('本金偿还'))].filter((item): item is [string,string] => item !== null));
    const documents = dto.documents.map((item: unknown) => { const row = object(item); if (!row || !Number.isSafeInteger(row.version) || (row.version as number) <= 0) throw new Error('公开文件版本无效'); if (row.visibility !== '公开') throw new Error('文件未授权公开'); return { id: requiredText(row, 'id'), name: requiredText(row, 'name'), category: requiredText(row, 'category'), source: requiredText(row, 'source'), version: `v${row.version}` }; });
    if (!documents.some(d => d.source === 'Instrument') || !documents.some(d => d.source === 'Offering')) throw new Error('缺少公开权益或发行文件');
    const returnLine = kind === '未提供' ? '未提供预期年化' : `${kind} ${returned.minPercent}${typeof returned.maxPercent === 'number' ? `–${returned.maxPercent}` : ''}% · ${kind === '合同固定年利率' ? '非保证兑付' : '非承诺'}`;
    const spv = object(dto.spv);
    const approvedListing = channels.mListingApproved === true && approvedMListingIds.includes(id);
    return {
      id, issuerId: slug, issuerSlug: slug, issuerName: optionalText(issuer.legalName) || '发行企业待核实',
      title: requiredText(offering, 'name'), category: category(requiredText(asset, 'subtype')), place: optionalText(asset.location) || '地区待披露',
      right: type, status: '即将开放', priceCents: unitPrice, minimumCents: minimum, maxUnits: 0,
      supplyUnits: offering.totalUnits as number, listing: approvedListing ? 'active' : 'pending',
      image: requiredText(asset, 'subtype') === '单笔企业借款债权' ? images.debt : images.residence,
      yieldLine: returnLine, summary: optionalText(offering.summary) || '以获准公开的发行文件为准',
      features: [['资产类别', requiredText(asset, 'subtype')], ['所在地区', optionalText(asset.location) || '待披露'], ...facts],
      terms: normalizedTerms, documents,
      listedAt: requiredText(source, 'publishedAt'), opensAt: requiredText(offering, 'subscriptionStart'), closesAt: requiredText(offering, 'subscriptionEnd'),
      assetVersion: `Asset v${source.assetVersion ?? '待核实'}`,
      instrumentVersion: `Instrument ${source.instrumentVersion ?? '待核实'}`, offeringVersion: '披露 v1.1',
      risk: dto.risks.filter((item): item is string => typeof item === 'string').join('；') || '以完整风险披露文件为准',
      spv: spv ? { legalName: requiredText(spv, 'legalName'), jurisdiction: requiredText(spv, 'jurisdiction'), role: requiredText(spv, 'role'), assetRelationship: requiredText(spv, 'assetRelationship'), issuerRelationship: requiredText(spv, 'issuerRelationship'), ...(optionalText(spv.registrationNumber) ? { registrationNumber: String(spv.registrationNumber) } : {}) } : null,
      returnMethodology: methodology ? { priceAtCalculation: methodology.priceAtCalculation as number, calculatedAt: requiredText(methodology, 'calculatedAt'), period: requiredText(methodology, 'period'), incomeBasis: requiredText(methodology, 'incomeBasis'), includesAppreciation: methodology.includesAppreciation === true, assumptions: requiredText(methodology, 'assumptions'), feesAndTaxes: requiredText(methodology, 'feesAndTaxes'), evidence: requiredText(methodology, 'evidence'), risks: requiredText(methodology, 'risks') } : undefined,
      sourcePublicationId: requiredText(source, 'publicationId'), sourceSchemaVersion: '1.1.0',
    } satisfies Offering;
  });
}
