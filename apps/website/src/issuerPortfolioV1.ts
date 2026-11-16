import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { assetType, type AssetSubtype } from './assetTaxonomyV1';

// The three issuer modules share one tenant-scoped browser record so references and versions stay consistent.
export type PropertyKind = 'residential' | 'office' | 'shop' | 'industrial' | 'hotel' | 'land';
export const propertyKinds: { id: PropertyKind; label: string; enabled: boolean }[] = [
  { id: 'residential', label: '住宅', enabled: true }, { id: 'office', label: '写字楼', enabled: true },
  { id: 'shop', label: '商铺', enabled: true }, { id: 'industrial', label: '工业园／仓储物流', enabled: true },
  { id: 'hotel', label: '酒店', enabled: false }, { id: 'land', label: '土地', enabled: false },
];
export type DocumentKind = 'title' | 'valuation' | 'encumbrance' | 'photo' | 'floorplan' | 'legal' | 'subscription' | 'risk' | 'other' | 'equity_title' | 'company_registration' | 'equity_valuation' | 'equity_restriction' | 'equity_authorization' | 'loan_contract' | 'loan_ownership' | 'loan_balance' | 'loan_valuation' | 'loan_security' | 'loan_restriction';
export type DocumentRecord = { id: string; kind: DocumentKind; name: string; version: number; size: number; mime: string; status: 'pending' | 'passed' | 'failed'; order: number; removed?: boolean; createdAt: number };
export type Party = { id: string; role: string; name: string; type: 'enterprise' | 'person' | 'public' | 'other'; country: string; registration: string; relation: string; duties: string };
export type AssetFields = {
  name: string; subtype: AssetSubtype | ''; summary: string; country: string; province: string; city: string; address: string;
  area: string; areaUnit: 'm²' | 'ft²'; owner: string; ownerType: Party['type']; ownerCountry: string; ownerRegistration: string;
  tenantRelation: string; operationStatus: string; builtYear: string; valuation: string; valuationDate: string; valuationAgency: string;
  encumbered: 'unknown' | 'no' | 'yes'; relatedParties: Party[]; subtypeFields: Record<string, string>;
};
export type InstrumentType = 'equity' | 'debt' | 'income';
export type InstrumentFields = {
  name: string; type: InstrumentType; subjectName: string; subjectType: Party['type']; subjectCountry: string; subjectRegistration: string;
  subjectRelation: string; subjectRelationOther: string; rights: string; total: string; tokenSupply: string;
  interestMode: 'none' | 'fixed'; fixedRate: string; startDate: string; endDate: string; couponMode: 'maturity' | 'periodic';
  couponFrequency: string; firstCouponDate: string; dayCount: string; dayCountOther: string; businessDayRule: string;
  incomeSource: string; incomeCalculation: string; distributionFrequency: string;
  yieldMin: string; yieldMax: string; yieldBasis: string; legalDocId: string; assetDocIds: string[];
};
export type OfferingFields = {
  name: string; intro: string; quantity: string; price: string; minOrder: string; maxOrderTokens: string; investorCap: string;
  startsAt: string; endsAt: string; timezone: string; lockMode: '' | 'none' | 'days'; lockDays: string;
  walletId: string; subscriptionDocId: string; riskDocIds: string[]; partyIds: string[]; noPartyDisclosure: boolean;
};
export type Revision<T> = { number: number; fields: T; at: number; by: string };
export type Event = { at: number; label: string; by: string };
export type AssetRecord = { id: string; number: string; status: 'draft' | 'ready'; versions: Revision<AssetFields>[]; documents: DocumentRecord[]; events: Event[] };
export type InstrumentRecord = { id: string; assetId: string; number: string; status: 'draft' | 'ready'; versions: Revision<InstrumentFields>[]; documents: DocumentRecord[]; events: Event[] };
export type OfferingRecord = { id: string; assetId: string; instrumentId: string; instrumentVersion: number; assetVersion: number; number: string; status: 'draft'; versions: Revision<OfferingFields>[]; documents: DocumentRecord[]; events: Event[] };
export type Wallet = { id: string; name: string; source: 'MPC' | '自连接'; network: 'OP Mainnet'; address: string; verified: boolean };
export type Portfolio = { assets: AssetRecord[]; instruments: InstrumentRecord[]; offerings: OfferingRecord[]; wallets: Wallet[] };
const key = 'wdex-issuer-portfolio-v1';
const empty = (): Portfolio => ({ assets: [], instruments: [], offerings: [], wallets: [] });
const clone = <T,>(value: T): T => structuredClone(value);
const actor = () => getDemoAuth()?.email || '';
const bucketKey = (tenant: DemoTenant) => `${actor().toLowerCase()}/${tenant.id}`;
const allowed = (tenant: DemoTenant) => Boolean(actor() && getDemoTenant()?.id === tenant.id);
const readAll = (): Record<string, Portfolio> => { try { return JSON.parse(localStorage.getItem(key) || '{}') as Record<string, Portfolio>; } catch { return {}; } };
export function readPortfolio(tenant: DemoTenant): Portfolio {
  if (!allowed(tenant)) return empty();
  const data = readAll()[bucketKey(tenant)] || empty();
  return clone({ assets: data.assets || [], instruments: data.instruments || [], offerings: data.offerings || [], wallets: data.wallets || [] });
}
function update(tenant: DemoTenant, fn: (data: Portfolio) => void): Portfolio | null {
  if (!allowed(tenant) || tenant.role !== '企业管理员' || getDemoTenant()?.subscriptionState === 'downgraded') return null;
  const all = readAll(); const id = bucketKey(tenant); const data = clone(all[id] || empty()); fn(data); all[id] = data;
  localStorage.setItem(key, JSON.stringify(all)); window.dispatchEvent(new window.Event('wdex-portfolio-changed')); return clone(data);
}
const revision = <T,>(fields: T, number: number): Revision<T> => ({ number, fields: clone(fields), at: Date.now(), by: actor() });
const event = (label: string): Event => ({ label, at: Date.now(), by: actor() });
export const latest = <T,>(record: { versions: Revision<T>[] }) => record.versions.at(-1)!;
export const blankAsset = (): AssetFields => ({ name: '', subtype: '', summary: '', country: '', province: '', city: '', address: '', area: '', areaUnit: 'm²', owner: '', ownerType: 'enterprise', ownerCountry: '', ownerRegistration: '', tenantRelation: '', operationStatus: '', builtYear: '', valuation: '', valuationDate: '', valuationAgency: '', encumbered: 'unknown', relatedParties: [], subtypeFields: {} });
export const blankInstrument = (): InstrumentFields => ({ name: '', type: 'equity', subjectName: '', subjectType: 'enterprise', subjectCountry: '', subjectRegistration: '', subjectRelation: '', subjectRelationOther: '', rights: '', total: '', tokenSupply: '', interestMode: 'none', fixedRate: '', startDate: '', endDate: '', couponMode: 'maturity', couponFrequency: '', firstCouponDate: '', dayCount: '', dayCountOther: '', businessDayRule: '', incomeSource: '', incomeCalculation: '', distributionFrequency: '', yieldMin: '', yieldMax: '', yieldBasis: '', legalDocId: '', assetDocIds: [] });
export const blankOffering = (): OfferingFields => ({ name: '', intro: '', quantity: '', price: '', minOrder: '', maxOrderTokens: '', investorCap: '', startsAt: '', endsAt: '', timezone: 'Asia/Shanghai', lockMode: '', lockDays: '', walletId: '', subscriptionDocId: '', riskDocIds: [], partyIds: [], noPartyDisclosure: false });
export const exampleAsset = (): AssetFields => ({ ...blankAsset(), name: '滨江办公楼', subtype: 'office', summary: '位于城市核心商务区的成熟办公物业，当前持续运营。', country: '中国', province: '上海市', city: '上海市', address: '浦东新区滨江大道 88 号', area: '12800', owner: '滨江资产管理有限公司', ownerCountry: '中国', ownerRegistration: '91310000EXAMPLE01', tenantRelation: '受托管理', operationStatus: '运营中', builtYear: '2019', valuation: '120000000', valuationDate: '2026-10-31', valuationAgency: '华信资产评估有限公司', encumbered: 'no', subtypeFields: { propertyForm: '独栋办公楼', buildingArea: '12800', rentableArea: '11600', occupancyRate: '89.5' }, relatedParties: [{ id: crypto.randomUUID(), role: '资产管理人', name: '滨江资产管理有限公司', type: 'enterprise', country: '中国', registration: '91310000EXAMPLE01', relation: '受托管理', duties: '负责物业日常管理与运营。' }] });
export function exampleAssetFor(subtype: AssetSubtype): AssetFields {
  if (subtype === 'private_equity') return { ...blankAsset(), subtype, name: '华辰智能制造普通股权', summary: '记录已持有的非上市企业普通股权及其权利依据。', country: '中国', owner: '华辰投资管理有限公司', ownerCountry: '中国', tenantRelation: '受托／授权', valuation: '12000000', valuationDate: '2026-10-31', valuationAgency: '华信资产评估有限公司', subtypeFields: { companyName: '华辰智能制造有限公司', companyCountry: '中国', companyRegistration: '91310000MA1K12345X', industry: '智能制造', issuedShares: '1000000', involvedShares: '100000', restricted: 'no', acquiredAt: '2024-06-18', ownerRelationDetail: '发行企业依据现有授权管理本项股权。', valuationMethod: 'third_party', valuationBasis: '以独立估值报告作为估值依据。' }, relatedParties: [] };
  if (subtype === 'corporate_loan') return { ...blankAsset(), subtype, name: '宏远设备制造借款债权', summary: '记录一笔既有企业借款合同项下的债权资产。', country: '中国', owner: '澜序资产管理有限公司', ownerCountry: '中国', tenantRelation: '同一主体', valuation: '380000', valuationDate: '2026-10-31', subtypeFields: { contractNo: 'HY-LOAN-2025-018', signedAt: '2025-07-01', creditor: '澜序资产管理有限公司', debtor: '宏远设备制造有限公司', debtorCountry: '中国', debtorRegistration: '91310115MA1K67890P', contractPrincipal: '500000', outstandingPrincipal: '380000', interestMode: 'fixed', fixedRate: '8', interestStart: '2025-07-01', maturityDate: '2028-07-01', debtStatus: 'normal', secured: 'no', valuationBasis: '依据未偿本金、合同及履约记录评估。', transferRestricted: 'no' }, relatedParties: [] };
  const base = exampleAsset();
  if (subtype === 'residential') return { ...base, subtype, name: '滨江住宅社区', summary: '位于城市核心区域的成熟住宅社区，当前持续运营。', subtypeFields: { propertyForm: '住宅社区', buildingArea: '12800', units: '120' } };
  if (subtype === 'shop') return { ...base, subtype, name: '滨江商业商铺', summary: '位于成熟商业街区的临街商铺，当前持续运营。', subtypeFields: { propertyForm: '临街商铺', buildingArea: '12800', rentableArea: '11600' } };
  if (subtype === 'industrial') return { ...base, subtype, name: '滨江仓储物流园', summary: '已投入运营的仓储物流物业，具备可出租建筑面积。', subtypeFields: { propertyForm: '物流设施', buildingArea: '12800', rentableArea: '11600' } };
  return { ...base, subtype };
}
export function sharePercentage(fields: AssetFields): string {
  const total = fields.subtypeFields.issuedShares || ''; const involved = fields.subtypeFields.involvedShares || '';
  if (!/^\d+$/.test(total) || !/^\d+$/.test(involved) || BigInt(total) === 0n) return '待计算';
  const numerator = BigInt(involved) * 1_000_000n; const denominator = BigInt(total);
  return `${numerator % denominator ? '约 ' : ''}${format(numerator / denominator, 4)}%（${involved} / ${total} 股）`;
}
export function requiredAssetDocumentKinds(fields: AssetFields): DocumentKind[] {
  const p = fields.subtypeFields;
  if (fields.subtype === 'private_equity') return ['equity_title', 'company_registration', 'equity_valuation', ...(p.restricted === 'yes' ? ['equity_restriction' as const] : []), ...(fields.tenantRelation && fields.tenantRelation !== '同一主体' ? ['equity_authorization' as const] : [])];
  if (fields.subtype === 'corporate_loan') return ['loan_contract', 'loan_ownership', 'loan_balance', 'loan_valuation', ...(p.secured === 'yes' ? ['loan_security' as const] : []), ...(p.transferRestricted === 'yes' ? ['loan_restriction' as const] : [])];
  return ['title', ...(fields.valuation ? ['valuation' as const] : []), ...(fields.encumbered === 'yes' ? ['encumbrance' as const] : [])];
}
export const exampleInstrument = (asset: AssetRecord, type: InstrumentType): InstrumentFields => ({ ...blankInstrument(), type, name: `${latest(asset).fields.name}${type === 'equity' ? '股权权益' : type === 'debt' ? '债权权益' : '收益参与权'}`, subjectName: type === 'equity' && latest(asset).fields.subtype === 'private_equity' ? latest(asset).fields.subtypeFields.companyName : type === 'debt' && latest(asset).fields.subtype === 'corporate_loan' ? latest(asset).fields.subtypeFields.debtor : latest(asset).fields.owner, subjectCountry: type === 'equity' && latest(asset).fields.subtype === 'private_equity' ? latest(asset).fields.subtypeFields.companyCountry : type === 'debt' && latest(asset).fields.subtype === 'corporate_loan' ? latest(asset).fields.subtypeFields.debtorCountry : latest(asset).fields.ownerCountry, subjectRelation: (type === 'equity' && latest(asset).fields.subtype === 'private_equity') || (type === 'debt' && latest(asset).fields.subtype === 'corporate_loan') ? '其他' : '资产登记权利人', subjectRelationOther: (type === 'equity' && latest(asset).fields.subtype === 'private_equity') || (type === 'debt' && latest(asset).fields.subtype === 'corporate_loan') ? '底层主体与投资者权益的关系以核心权益协议为准。' : '', rights: type === 'equity' ? '持有人按协议享有对应普通股经济权益及信息披露权。' : type === 'debt' ? '持有人按债权协议享有本金偿还及约定利息权益。' : '持有人按协议享有约定比例的可分配经营收益。', total: type === 'equity' ? latest(asset).fields.subtype === 'private_equity' ? '50000' : '100000' : type === 'debt' ? latest(asset).fields.subtype === 'corporate_loan' ? '100000' : '1000000' : '20', tokenSupply: type === 'equity' ? '10000' : type === 'debt' ? '10000' : '10000', interestMode: type === 'debt' ? 'fixed' : 'none', fixedRate: type === 'debt' ? '5.5' : '', startDate: '2026-12-01', endDate: '2028-12-01', couponMode: 'periodic', couponFrequency: 'quarterly', firstCouponDate: '2027-03-01', dayCount: 'Actual/365 Fixed', incomeSource: latest(asset).fields.subtype === 'private_equity' ? '已实际取得的股权分配收入' : latest(asset).fields.subtype === 'corporate_loan' ? '借款合同项下已实际取得的回款' : '物业租金收入', incomeCalculation: '按权益协议约定的收入范围与费用扣除口径计算可分配金额。', distributionFrequency: 'quarterly', yieldMin: type === 'debt' ? '' : '4', yieldMax: type === 'debt' ? '' : '6', yieldBasis: type === 'debt' ? '' : latest(asset).fields.subtype === 'private_equity' ? '依据被投资企业历史经营与财务资料测算。' : latest(asset).fields.subtype === 'corporate_loan' ? '依据合同回款及履约资料测算。' : '依据历史租金收入和当前出租率测算。' });
export const exampleOffering = (asset: AssetRecord, round: number): OfferingFields => ({ ...blankOffering(), name: `${latest(asset).fields.name}第 ${round} 期`, intro: '本期发行对应已披露的资产权益，认购前请阅读相关协议和风险披露。', quantity: '1000', price: '120', minOrder: '200', maxOrderTokens: '100', investorCap: '12000', startsAt: '2026-12-15T09:00', endsAt: '2027-01-15T18:00', timezone: 'Asia/Shanghai', lockMode: 'days', lockDays: '365' });
const decimal = (raw: string, places: number): bigint | null => {
  if (!new RegExp(places === 0 ? '^\\d+$' : `^\\d+(?:\\.\\d{1,${places}})?$`).test(raw)) return null;
  const [whole, fraction = ''] = raw.split('.'); return BigInt(whole) * 10n ** BigInt(places) + BigInt(fraction.padEnd(places, '0'));
};
const format = (value: bigint, places: number) => { const scale = 10n ** BigInt(places); const frac = (value % scale).toString().padStart(places, '0').replace(/0+$/, ''); return `${value / scale}${frac ? `.${frac}` : ''}`; };
export function tokenMapping(fields: InstrumentFields): { value: string; error: string; unit: string } {
  const unit = fields.type === 'equity' ? '股' : fields.type === 'debt' ? 'U' : '%';
  const scale = fields.type === 'equity' ? 0 : 6;
  const total = decimal(fields.total, scale); const supply = /^\d+$/.test(fields.tokenSupply) ? BigInt(fields.tokenSupply) : 0n;
  if (total === null || total <= 0n || supply <= 0n) return { value: '', error: '请填写有效的权利总规模和正整数 Token 总份数。', unit };
  if (fields.type === 'income' && total > 100000000n) return { value: '', error: '授权参与比例不能超过 100%。', unit };
  if (total % supply !== 0n) return { value: '', error: '无法按允许精度整除 Token 总份数，请调整总规模或份数。', unit };
  return { value: format(total / supply, scale), error: '', unit };
}
export function money(raw: string): bigint | null { return decimal(raw, 6); }
export function moneyText(value: bigint): string { return format(value, 6); }
export function offeringMath(fields: OfferingFields) {
  const quantity = /^\d+$/.test(fields.quantity) ? BigInt(fields.quantity) : 0n;
  const price = money(fields.price); const min = money(fields.minOrder); const cap = fields.investorCap ? money(fields.investorCap) : null;
  const maximum = quantity > 0n && price !== null ? quantity * price : null;
  const minimumTokens = price !== null && price > 0n && min !== null ? (min + price - 1n) / price : null;
  const minimumPayment = minimumTokens !== null && price !== null ? minimumTokens * price : null;
  const capTokens = cap !== null && price !== null && price > 0n ? cap / price : null;
  return { maximum, minimumTokens, minimumPayment, capTokens, capRemainder: cap !== null && price !== null && price > 0n ? cap % price : null };
}
const positive = (value: string, places: number) => { const n = decimal(value, places); return n !== null && n > 0n; };
function corporateAssetIssues(fields: AssetFields, docs: DocumentRecord[], ready: boolean): string[] {
  const errors: string[] = []; const p = fields.subtypeFields;
  const required = (label: string, value?: string) => { if (!value?.trim()) errors.push(`请补充${label}。`); };
  const has = (kind: DocumentKind) => docs.some(doc => !doc.removed && doc.kind === kind && doc.status === 'passed');
  if (fields.subtype === 'private_equity') {
    for (const [label, raw] of [['已发行普通股总数', p.issuedShares], ['本资产涉及股数', p.involvedShares]] as const) if (raw && !positive(raw, 0)) errors.push(`${label}须为正整数。`);
    if (p.issuedShares && p.involvedShares && /^\d+$/.test(p.issuedShares) && /^\d+$/.test(p.involvedShares) && BigInt(p.involvedShares) > BigInt(p.issuedShares)) errors.push('本资产涉及股数不能超过企业已发行普通股总数。');
    if (ready) {
      required('资产简介', fields.summary); required('所在国家或地区', fields.country); required('被投资企业名称', p.companyName); required('企业注册国家或地区', p.companyCountry);
      if (!p.companyRegistration?.trim() && !p.companyRegistrationAlternative?.trim()) errors.push('请填写企业注册编号，或说明所在法域的替代登记依据。');
      required('已发行普通股总数', p.issuedShares); required('本资产涉及股数', p.involvedShares);
      if (!['yes', 'no'].includes(p.restricted)) errors.push('请确认股权是否附带限制。');
      if (p.restricted === 'yes') required('股权限制说明', p.restrictionDetail);
      required('当前股权登记权利人', fields.owner); required('权利人与发行企业关系', fields.tenantRelation);
      if (fields.tenantRelation !== '同一主体') required('非同一主体关系说明', p.ownerRelationDetail);
      if (!['third_party', 'recent', 'other'].includes(p.valuationMethod)) errors.push('请选择估值方式。');
      if (p.valuationMethod === 'third_party') required('估值机构', fields.valuationAgency);
      required('估值基准日', fields.valuationDate); if (!positive(fields.valuation, 6)) errors.push('估值金额须大于 0，最多 6 位小数。'); required('估值依据说明', p.valuationBasis);
    }
  }
  if (fields.subtype === 'corporate_loan') {
    for (const [label, raw] of [['合同本金', p.contractPrincipal], ['当前未偿本金', p.outstandingPrincipal]] as const) if (raw && (money(raw) === null || (label === '合同本金' && !positive(raw, 6)))) errors.push(`${label}须为有效 U 金额，最多 6 位小数。`);
    if (p.contractPrincipal && p.outstandingPrincipal && money(p.contractPrincipal) !== null && money(p.outstandingPrincipal) !== null && money(p.outstandingPrincipal)! > money(p.contractPrincipal)!) errors.push('当前未偿本金不能超过合同本金。');
    if (p.interestMode === 'fixed' && p.fixedRate && (!positive(p.fixedRate, 4) || Number(p.fixedRate) > 100)) errors.push('合同固定年利率须大于 0 且不超过 100%，最多 4 位小数。');
    if (p.signedAt && p.maturityDate && p.maturityDate < p.signedAt) errors.push('合同到期日不能早于签订日期。');
    if (p.interestStart && p.maturityDate && p.maturityDate <= p.interestStart) errors.push('到期日须晚于起息日。');
    if (ready) {
      required('资产简介', fields.summary); required('所在国家或地区', fields.country); required('借款合同编号', p.contractNo); required('合同签订日期', p.signedAt);
      required('债权人名称', p.creditor); required('债务人名称', p.debtor); required('债务人注册国家或地区', p.debtorCountry); required('合同本金', p.contractPrincipal); required('当前未偿本金', p.outstandingPrincipal);
      if (!['none', 'fixed'].includes(p.interestMode)) errors.push('请选择合同利息类型。');
      if (p.interestMode === 'fixed') { required('合同固定年利率', p.fixedRate); required('起息日', p.interestStart); }
      required('到期日', p.maturityDate); if (!['normal', 'overdue', 'repaid', 'disputed'].includes(p.debtStatus)) errors.push('请选择目前债权状态。');
      if (['overdue', 'disputed'].includes(p.debtStatus)) required('逾期或争议说明', p.debtStatusDetail);
      if (p.debtStatus === 'repaid' || p.outstandingPrincipal === '0') errors.push('已清偿债权可保留历史记录，但不能标记为可配置发行的资产。');
      if (!['yes', 'no'].includes(p.secured)) errors.push('请确认是否存在担保。'); if (p.secured === 'yes') required('担保摘要', p.securitySummary);
      required('当前债权权利人', fields.owner); required('权利人与发行企业关系', fields.tenantRelation);
      if (fields.tenantRelation !== '同一主体') required('非同一主体关系说明', p.ownerRelationDetail);
      required('估值依据', p.valuationBasis); required('估值日期', fields.valuationDate); if (!positive(fields.valuation, 6)) errors.push('资产估值金额须大于 0，最多 6 位小数。');
      if (!['yes', 'no'].includes(p.transferRestricted)) errors.push('请确认权利转让或质押限制。'); if (p.transferRestricted === 'yes') required('权利限制说明', p.transferRestrictionDetail);
    }
  }
  if (ready) {
    for (const party of fields.relatedParties) if (!party.role.trim() || !party.name.trim() || !party.relation.trim() || !party.duties.trim() || (party.type !== 'person' && !party.country.trim())) errors.push(`请完善资产相关方“${party.name || '未命名'}”的信息。`);
    if (fields.subtype === 'corporate_loan' && fields.relatedParties.some(party => party.name.trim() && party.name.trim() === p.debtor?.trim())) errors.push('底层债务人请填写在债务人字段，不作为普通资产相关方重复登记。');
    for (const kind of requiredAssetDocumentKinds(fields)) if (!has(kind)) errors.push(`请提供检查通过的${documentKindLabel[kind]}。`);
  }
  return errors;
}
export const documentKindLabel: Record<DocumentKind, string> = { title: '权属证明', valuation: '估值报告', encumbrance: '权利负担材料', photo: '资产照片', floorplan: '物业平面图', legal: '核心权益文件', subscription: '认购协议', risk: '风险披露', other: '其他材料', equity_title: '股权权属或股东名册证明', company_registration: '公司主体登记文件', equity_valuation: '估值依据文件', equity_restriction: '股权限制文件', equity_authorization: '授权或委托证明', loan_contract: '借款合同或债权形成证明', loan_ownership: '当前债权归属证明', loan_balance: '余额或履约依据', loan_valuation: '估值依据文件', loan_security: '担保依据', loan_restriction: '权利限制依据' };
export function assetIssues(fields: AssetFields, docs: DocumentRecord[] = [], ready = false): string[] {
  const errors: string[] = [];
  if (!fields.subtype || !assetType(fields.subtype)?.enabled) errors.push('请选择已开放的资产类型。');
  if (!fields.name.trim() || fields.name.length > 120) errors.push('资产名称为必填，最多 120 字。');
  if (fields.subtype === 'private_equity' || fields.subtype === 'corporate_loan') return [...errors, ...corporateAssetIssues(fields, docs, ready)];
  if (fields.area && !positive(fields.area, 2)) errors.push('面积须大于 0，最多 2 位小数。');
  if (fields.valuation && !positive(fields.valuation, 6)) errors.push('估值金额须大于 0，最多 6 位小数。');
  if (fields.builtYear && !/^\d{4}$/.test(fields.builtYear)) errors.push('建成年份须为四位年份。');
  for (const [label, value] of [['楼宇面积', fields.subtypeFields.buildingArea], ['可出租面积', fields.subtypeFields.rentableArea]] as const) if (value && !positive(value, 2)) errors.push(`${label}须大于 0，最多 2 位小数。`);
  if (fields.subtypeFields.buildingArea && fields.subtypeFields.rentableArea && decimal(fields.subtypeFields.buildingArea, 2) !== null && decimal(fields.subtypeFields.rentableArea, 2) !== null && decimal(fields.subtypeFields.rentableArea, 2)! > decimal(fields.subtypeFields.buildingArea, 2)!) errors.push('可出租面积不能超过建筑面积。');
  if (fields.subtypeFields.units && !positive(fields.subtypeFields.units, 0)) errors.push('住宅套数须为正整数。');
  if (fields.subtypeFields.occupancyRate && (!/^(?:\d+)(?:\.\d{1,2})?$/.test(fields.subtypeFields.occupancyRate) || Number(fields.subtypeFields.occupancyRate) > 100)) errors.push('出租率须在 0～100% 之间，最多 2 位小数。');
  if (ready) {
    for (const [label, value] of [['资产描述', fields.summary], ['国家或地区', fields.country], ['城市', fields.city], ['详细地址', fields.address], ['主要面积', fields.area], ['登记权利人', fields.owner], ['企业与资产关系', fields.tenantRelation], ['运营状态', fields.operationStatus]] as const) if (!value?.trim()) errors.push(`请补充${label}。`);
    if (fields.ownerType !== 'person' && !fields.ownerCountry.trim()) errors.push('请补充登记权利人注册国家或地区。');
    if (fields.valuation && (!fields.valuationDate || !fields.valuationAgency.trim())) errors.push('填写估值后，请补充估值日期与机构。');
    for (const party of fields.relatedParties) if (!party.role || !party.name.trim() || !party.relation.trim() || !party.duties.trim() || (party.type !== 'person' && !party.country.trim())) errors.push(`请完善资产相关方“${party.name || '未命名'}”的信息。`);
    if (fields.subtype === 'residential' && (!fields.subtypeFields.propertyForm || !fields.subtypeFields.buildingArea)) errors.push('请补充住宅形态及建筑面积。');
    if (fields.subtype === 'office' && !fields.subtypeFields.buildingArea) errors.push('请补充写字楼建筑面积。');
    if (fields.subtype === 'shop' && (!fields.subtypeFields.propertyForm || !fields.subtypeFields.buildingArea)) errors.push('请补充商铺形态及建筑面积。');
    if (fields.subtype === 'industrial' && (!fields.subtypeFields.propertyForm || !fields.subtypeFields.buildingArea)) errors.push('请补充工业物业形态及建筑面积。');
    if (fields.encumbered === 'unknown') errors.push('请确认资产权利负担情况。');
    const has = (kind: DocumentKind) => docs.some(doc => !doc.removed && doc.kind === kind && doc.status === 'passed');
    if (!has('title')) errors.push('请提供状态有效的权属证明。');
    if (fields.valuation && !has('valuation')) errors.push('请提供状态有效的估值报告。');
    if (fields.encumbered === 'yes' && !has('encumbrance')) errors.push('请提供权利负担材料。');
  }
  return errors;
}
export function instrumentIssues(fields: InstrumentFields, asset: AssetRecord, docs: DocumentRecord[] = [], ready = false): string[] {
  const errors: string[] = []; const mapping = tokenMapping(fields);
  if (!fields.name.trim() || fields.name.length > 120) errors.push('权益结构名称为必填，最多 120 字。');
  if (ready && mapping.error) errors.push(mapping.error);
  if (fields.type === 'debt' && fields.fixedRate && (!positive(fields.fixedRate, 4) || Number(fields.fixedRate) > 100)) errors.push('固定年利率须大于 0 且不超过 100%，最多 4 位小数。');
  if (ready && (fields.yieldMin || fields.yieldMax || fields.yieldBasis)) {
    const low = decimal(fields.yieldMin, 4), high = decimal(fields.yieldMax, 4);
    if (low === null || high === null || high < low || !fields.yieldBasis.trim()) errors.push('预期年化须同时填写上下限及测算依据，最高值不得低于最低值。');
  }
  if (ready) {
    if (asset.status !== 'ready') errors.push('关联资产尚未达到资料就绪。');
    if (!fields.subjectName.trim() || (fields.subjectType !== 'person' && !fields.subjectCountry.trim()) || !fields.subjectRelation.trim() || (fields.subjectRelation === '其他' && !fields.subjectRelationOther.trim())) errors.push('请完善权利责任主体信息。');
    if (!fields.rights.trim() || fields.rights.length > 2000) errors.push('请填写投资者获得的权利，最多 2,000 字。');
    if (fields.type === 'debt') {
      if (!fields.endDate || (fields.interestMode === 'fixed' && (!fields.fixedRate || !fields.startDate || !fields.couponMode || (fields.couponMode === 'periodic' && (!fields.couponFrequency || !fields.firstCouponDate)) || !fields.dayCount))) errors.push('请完善债权期限、利率与付息条款。');
      if (fields.startDate && fields.endDate && fields.endDate <= fields.startDate) errors.push('到期日须晚于起息日。');
      if (fields.couponMode === 'periodic' && fields.firstCouponDate && (fields.firstCouponDate <= fields.startDate || fields.firstCouponDate > fields.endDate)) errors.push('首个付息日须晚于起息日且不晚于到期日。');
    }
    if (fields.type === 'income' && (!fields.incomeSource.trim() || !fields.incomeCalculation.trim() || !fields.startDate || !fields.endDate || !fields.distributionFrequency || fields.endDate <= fields.startDate)) errors.push('请完善收益来源、计算口径、期限及分配频率。');
    if (!fields.legalDocId || !docs.some(doc => doc.id === fields.legalDocId && doc.kind === 'legal' && doc.status === 'passed' && !doc.removed)) errors.push('请关联状态有效的核心权益文件。');
  }
  return errors;
}
export function offeringIssues(fields: OfferingFields, asset: AssetRecord, instrument: InstrumentRecord, docs: DocumentRecord[], wallets: Wallet[], pinned?: Pick<OfferingRecord, 'assetVersion' | 'instrumentVersion'>): string[] {
  const errors: string[] = []; const amount = offeringMath(fields); const supply = latest(instrument).fields.tokenSupply;
  if (asset.status !== 'ready' || instrument.status !== 'ready') errors.push('资产或权益结构资料尚未就绪。');
  const assetFields = latest(asset).fields;
  if (assetFields.subtype === 'corporate_loan' && ['overdue', 'disputed', 'repaid'].includes(assetFields.subtypeFields.debtStatus)) errors.push('底层债权处于逾期、争议或已清偿状态，需由有权主体确认可发行性。');
  if (assetFields.subtype === 'corporate_loan' && assetFields.subtypeFields.maturityDate && assetFields.subtypeFields.maturityDate < new Date().toISOString().slice(0, 10)) errors.push('底层借款合同已到期，需由有权主体确认可发行性。');
  if (pinned && (latest(asset).number !== pinned.assetVersion || latest(instrument).number !== pinned.instrumentVersion)) errors.push('关联资产或权益结构已有新版本，请核对并更新引用版本。');
  if (!fields.name.trim() || fields.name.length > 120) errors.push('请填写发行名称，最多 120 字。');
  if (!fields.intro.trim() || fields.intro.length > 2000) errors.push('请填写投资者展示简介，最多 2,000 字。');
  if (!/^\d+$/.test(fields.quantity) || BigInt(fields.quantity || '0') <= 0n || BigInt(fields.quantity || '0') > BigInt(supply || '0')) errors.push('本期发行数量须为正整数，且不能超过权益结构总 Token 份数。');
  if (!positive(fields.price, 6)) errors.push('每 Token 认购价格须大于 0，最多 6 位小数。');
  if (!positive(fields.minOrder, 6)) errors.push('单笔最低认购金额须大于 0，最多 6 位小数。');
  if (amount.minimumTokens !== null && amount.minimumTokens > BigInt(fields.quantity || '0')) errors.push('最低可购买份数超过本期发行数量。');
  if (fields.maxOrderTokens && (!/^\d+$/.test(fields.maxOrderTokens) || BigInt(fields.maxOrderTokens || '0') < (amount.minimumTokens || 1n) || BigInt(fields.maxOrderTokens || '0') > BigInt(fields.quantity || '0'))) errors.push('单笔最高份数须介于最低可购买份数与本期发行数量之间。');
  if (fields.investorCap && (amount.maximum === null || amount.minimumPayment === null || money(fields.investorCap) === null || money(fields.investorCap)! < amount.minimumPayment || money(fields.investorCap)! > amount.maximum)) errors.push('单个投资者累计上限须介于实际最低应付金额与本期计划募集额之间。');
  if (!fields.startsAt || !fields.endsAt || fields.endsAt <= fields.startsAt || !fields.timezone) errors.push('请填写有效的认购起止时间和时区。');
  if (!fields.lockMode || (fields.lockMode === 'days' && (!/^\d+$/.test(fields.lockDays) || Number(fields.lockDays) < 1 || Number(fields.lockDays) > 36500))) errors.push('请选择锁仓方式；固定锁仓须为 1～36,500 天。');
  if (!wallets.some(wallet => wallet.id === fields.walletId && wallet.verified && wallet.network === 'OP Mainnet')) errors.push('请选择当前企业已验证的 OP Mainnet 收款钱包。');
  if (!docs.some(doc => doc.id === fields.subscriptionDocId && doc.kind === 'subscription' && doc.status === 'passed' && !doc.removed)) errors.push('请提供认购协议。');
  if (!fields.riskDocIds.some(id => docs.some(doc => doc.id === id && doc.kind === 'risk' && doc.status === 'passed' && !doc.removed))) errors.push('请提供风险披露文件。');
  if (!fields.partyIds.length && !fields.noPartyDisclosure) errors.push('请选择披露的资产相关方，或确认本期无需披露。');
  return errors;
}
export function saveAsset(tenant: DemoTenant, fields: AssetFields, id?: string, expected?: number): AssetRecord {
  const errors = assetIssues(fields); if (errors.length) throw Error(errors.join('\n'));
  let saved: AssetRecord | undefined;
  const result = update(tenant, data => { const current = data.assets.find(item => item.id === id); if (id && (!current || latest(current).number !== expected)) throw Error('资产版本已变化，请刷新后核对。');
    if (current && current.status === 'ready' && latest(current).fields.subtype !== fields.subtype) throw Error('资料就绪后不可更改资产分类。');
    if (current && data.instruments.some(item => item.assetId === current.id) && latest(current).fields.subtype !== fields.subtype) throw Error('已有权益结构引用，不能更改资产分类。');
    if (current) { current.versions.push(revision(fields, latest(current).number + 1)); current.status = 'draft'; current.events.push(event('保存资产版本')); saved = current;
      data.instruments.filter(item => item.assetId === current.id).forEach(item => { if (item.status === 'ready') { item.status = 'draft'; item.events.push(event('关联资产资料变更，需重新检查')); } });
    } else { const next: AssetRecord = { id: crypto.randomUUID(), number: `AS-${String(data.assets.length + 1).padStart(4, '0')}`, status: 'draft', versions: [revision(fields, 1)], documents: [], events: [event('创建资产草稿')] }; data.assets.push(next); saved = next; }
  }); if (!result || !saved) throw Error('当前账号不能保存资产。'); return clone(saved);
}
export function setAssetReady(tenant: DemoTenant, id: string): AssetRecord {
  let saved: AssetRecord | undefined; const result = update(tenant, data => { const record = data.assets.find(item => item.id === id); if (!record) throw Error('资产不存在。'); const issues = assetIssues(latest(record).fields, record.documents, true); if (issues.length) throw Error(issues.join('\n')); record.status = 'ready'; record.events.push(event('资产资料就绪')); saved = record; }); if (!result || !saved) throw Error('无法更新资产。'); return clone(saved);
}
export function saveInstrument(tenant: DemoTenant, assetId: string, fields: InstrumentFields, id?: string, expected?: number): InstrumentRecord {
  let saved: InstrumentRecord | undefined; const result = update(tenant, data => { const asset = data.assets.find(item => item.id === assetId); if (!asset) throw Error('关联资产不存在。'); const current = data.instruments.find(item => item.assetId === assetId);
    if (current && current.id !== id) throw Error('当前资产已有一套权益结构，请继续编辑原记录。'); if (id && (!current || latest(current).number !== expected)) throw Error('权益结构版本已变化，请刷新后核对。');
    const errors = instrumentIssues(fields, asset, current?.documents); if (errors.length) throw Error(errors.join('\n'));
    if (current) { const old = latest(current).fields; if (data.offerings.some(item => item.instrumentId === current.id) && (old.type !== fields.type || old.subjectName !== fields.subjectName || old.total !== fields.total || old.tokenSupply !== fields.tokenSupply)) throw Error('该权益结构已被发行方案引用，不能修改类型、责任主体、总规模或 Token 份数。'); current.versions.push(revision(fields, latest(current).number + 1)); current.status = 'draft'; current.events.push(event('保存权益结构版本')); saved = current; }
    else { const next: InstrumentRecord = { id: crypto.randomUUID(), assetId, number: `IN-${String(data.instruments.length + 1).padStart(4, '0')}`, status: 'draft', versions: [revision(fields, 1)], documents: [], events: [event('创建权益结构草稿')] }; data.instruments.push(next); saved = next; }
  }); if (!result || !saved) throw Error('当前账号不能保存权益结构。'); return clone(saved);
}
export function setInstrumentReady(tenant: DemoTenant, id: string): InstrumentRecord {
  let saved: InstrumentRecord | undefined; const result = update(tenant, data => { const record = data.instruments.find(item => item.id === id); const asset = record && data.assets.find(item => item.id === record.assetId); if (!record || !asset) throw Error('关联记录不存在。'); const issues = instrumentIssues(latest(record).fields, asset, record.documents, true); if (issues.length) throw Error(issues.join('\n')); record.status = 'ready'; record.events.push(event('权益结构资料就绪')); saved = record; }); if (!result || !saved) throw Error('无法更新权益结构。'); return clone(saved);
}
export function createOffering(tenant: DemoTenant, assetId: string): OfferingRecord {
  let saved: OfferingRecord | undefined; const result = update(tenant, data => { const asset = data.assets.find(item => item.id === assetId); const instrument = data.instruments.find(item => item.assetId === assetId); if (!asset || asset.status !== 'ready' || !instrument || instrument.status !== 'ready') throw Error('资产与权益结构资料就绪后才能创建发行方案。');
    const round = data.offerings.filter(item => item.assetId === assetId).length + 1; const fields = { ...blankOffering(), name: `${latest(asset).fields.name}第 ${round} 期` };
    const next: OfferingRecord = { id: crypto.randomUUID(), assetId, instrumentId: instrument.id, assetVersion: latest(asset).number, instrumentVersion: latest(instrument).number, number: `OF-${String(data.offerings.length + 1).padStart(4, '0')}`, status: 'draft', versions: [revision(fields, 1)], documents: [], events: [event('创建发行方案草稿')] }; data.offerings.push(next); saved = next;
  }); if (!result || !saved) throw Error('无法创建发行方案。'); return clone(saved);
}
export function saveOffering(tenant: DemoTenant, id: string, fields: OfferingFields, expected: number): OfferingRecord {
  let saved: OfferingRecord | undefined; const result = update(tenant, data => { const record = data.offerings.find(item => item.id === id); if (!record || latest(record).number !== expected) throw Error('发行方案版本已变化，请刷新后核对。'); record.versions.push(revision(fields, expected + 1)); record.events.push(event('保存发行方案草稿')); saved = record; }); if (!result || !saved) throw Error('无法保存发行方案。'); return clone(saved);
}
export function refreshOfferingReferences(tenant: DemoTenant, id: string): OfferingRecord {
  let saved: OfferingRecord | undefined; const result = update(tenant, data => { const record = data.offerings.find(item => item.id === id); const asset = record && data.assets.find(item => item.id === record.assetId); const instrument = record && data.instruments.find(item => item.id === record.instrumentId); if (!record || !asset || !instrument || asset.status !== 'ready' || instrument.status !== 'ready') throw Error('请先完成资产与权益结构的最新资料检查。'); record.assetVersion = latest(asset).number; record.instrumentVersion = latest(instrument).number; record.versions.push(revision(latest(record).fields, latest(record).number + 1)); record.events.push(event('更新资产与权益结构引用版本')); saved = record; }); if (!result || !saved) throw Error('无法更新关联版本。'); return clone(saved);
}
export function seedWallet(tenant: DemoTenant): Wallet {
  let saved: Wallet | undefined; const result = update(tenant, data => { const old = data.wallets.find(item => item.id === 'sample-receipt-wallet'); if (old) { saved = old; return; } const wallet: Wallet = { id: 'sample-receipt-wallet', name: '企业收款钱包', source: 'MPC', network: 'OP Mainnet', address: '0x8F3a91D0F9e2B47eA3e7e75b8C342a90d0B8c19A', verified: true }; data.wallets.push(wallet); saved = wallet; }); if (!result || !saved) throw Error('无法设置示例钱包。'); return clone(saved);
}
export function setWalletVerified(tenant: DemoTenant, id: string, verified: boolean) { update(tenant, data => { const wallet = data.wallets.find(item => item.id === id); if (wallet) wallet.verified = verified; }); }
const dbName = 'wdex-portfolio-v1-files';
function openFiles(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open(dbName, 1); request.onupgradeneeded = () => request.result.createObjectStore('files'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
export async function filePayload(tenant: DemoTenant, id: string): Promise<Blob | null> { const db = await openFiles(); try { return await new Promise((resolve, reject) => { const request = db.transaction('files').objectStore('files').get(`${bucketKey(tenant)}/${id}`); request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null); request.onerror = () => reject(request.error); }); } finally { db.close(); } }
async function storePayload(tenant: DemoTenant, id: string, file: Blob) { const db = await openFiles(); try { await new Promise<void>((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(file, `${bucketKey(tenant)}/${id}`); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } finally { db.close(); } }
export async function addDocument(tenant: DemoTenant, owner: 'asset' | 'instrument' | 'offering', ownerId: string, kind: DocumentKind, file: File): Promise<DocumentRecord> {
  if (file.size > 20 * 1024 * 1024) throw Error('文件不能超过 20 MB。');
  if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('仅支持 PDF、PNG、JPG 或 WebP 文件。');
  const doc: DocumentRecord = { id: crypto.randomUUID(), kind, name: file.name, size: file.size, mime: file.type, status: 'pending', version: 1, order: Date.now(), createdAt: Date.now() };
  const result = update(tenant, data => { const record = data[`${owner}s` as 'assets' | 'instruments' | 'offerings'].find(item => item.id === ownerId) as AssetRecord | InstrumentRecord | OfferingRecord | undefined; if (!record) throw Error('关联记录不存在。'); const previous = record.documents.filter(item => item.kind === kind && item.name === file.name); doc.version = previous.length ? Math.max(...previous.map(item => item.version)) + 1 : 1; record.documents.push(doc); record.events.push(event(`上传${file.name}`)); }); if (!result) throw Error('无法上传文件。');
  await storePayload(tenant, doc.id, file); return doc;
}
export function changeDocument(tenant: DemoTenant, owner: 'asset' | 'instrument' | 'offering', ownerId: string, docId: string, patch: Partial<Pick<DocumentRecord, 'status' | 'order' | 'removed'>>) {
  update(tenant, data => {
    const record = data[`${owner}s` as 'assets' | 'instruments' | 'offerings'].find(item => item.id === ownerId) as AssetRecord | InstrumentRecord | OfferingRecord | undefined;
    const doc = record?.documents.find(item => item.id === docId);
    if (!record || !doc) throw Error('文件不存在。');
    Object.assign(doc, patch);
    record.events.push(event(patch.removed ? '移除文件关联' : patch.status ? '更新文件状态' : '调整图片顺序'));
    if (owner === 'asset') { const asset = record as AssetRecord; if (asset.status === 'ready' && assetIssues(latest(asset).fields, asset.documents, true).length) { asset.status = 'draft'; data.instruments.filter(item => item.assetId === asset.id && item.status === 'ready').forEach(item => { item.status = 'draft'; item.events.push(event('关联资产文件状态变化，需重新检查')); }); } }
    if (owner === 'instrument') { const instrument = record as InstrumentRecord; const asset = data.assets.find(item => item.id === instrument.assetId); if (asset && instrument.status === 'ready' && instrumentIssues(latest(instrument).fields, asset, instrument.documents, true).length) instrument.status = 'draft'; }
  });
}
export function examplePdfFile(name: string): File {
  const stream = 'BT /F1 18 Tf 40 180 Td (Example document for product review) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 240] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let content = '%PDF-1.4\n'; const offsets = [0]; for (let index = 0; index < objects.length; index++) { offsets.push(content.length); content += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`; }
  const xref = content.length; content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(value => `${String(value).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new File([content], name, { type: 'application/pdf' });
}
export async function addExampleDocument(tenant: DemoTenant, owner: 'asset' | 'instrument' | 'offering', ownerId: string, kind: DocumentKind): Promise<DocumentRecord> {
  const doc = await addDocument(tenant, owner, ownerId, kind, examplePdfFile(`${kind}-${ownerId.slice(0, 6)}.pdf`));
  changeDocument(tenant, owner, ownerId, doc.id, { status: 'passed' });
  return { ...doc, status: 'passed' };
}
