export type Channel = { kind: 'm' } | { kind: 'v'; issuerSlug: string };
export type Offering = {
  id: string; issuerId: string; issuerSlug: string; issuerName: string; title: string;
  category: string; place: string; right: string; status: string; priceCents: number;
  minimumCents: number; maxUnits: number; listing: 'active' | 'pending';
  image: string; yieldLine: string; summary: string; features: [string, string][];
  terms: [string, string][]; documents: { name: string; version: string; id?: string; category?: string; source?: string }[];
  listedAt?: string; opensAt?: string; closesAt?: string; supplyUnits?: number; availableUnits?: number;
  lockup?: string; assetVersion?: string; instrumentVersion?: string; offeringVersion?: string;
  risk?: string;
  spv?: { legalName: string; jurisdiction: string; role: string; assetRelationship: string; issuerRelationship: string; registrationNumber?: string } | null;
  returnMethodology?: { priceAtCalculation: number; calculatedAt: string; period: string; incomeBasis: string; includesAppreciation: boolean; assumptions: string; feesAndTaxes: string; evidence: string; risks: string };
  sourcePublicationId?: string;
  sourceSchemaVersion?: string;
};
export const priceU = (cents: number) => (cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' U';
export const parseChannel = (path: string): Channel | null => {
  if (path === '/m' || path.startsWith('/m/')) return { kind: 'm' };
  const match = /^\/v\/([a-z0-9-]+)(?:\/|$)/.exec(path);
  return match ? { kind: 'v', issuerSlug: match[1] } : null;
};
export const basePath = (channel: Channel) => channel.kind === 'm' ? '/m' : '/v/' + channel.issuerSlug;
export const visibleOfferings = (all: Offering[], channel: Channel, noListings = false) =>
  all.filter(o => channel.kind === 'v' ? o.issuerSlug === channel.issuerSlug : !noListings && o.listing === 'active');
export const canShowCompany = (all: Offering[], channel: Channel, issuerId: string, noListings = false) =>
  channel.kind === 'v' ? channel.issuerSlug === issuerId :
    visibleOfferings(all, channel, noListings).some(o => o.issuerId === issuerId);
export const draftStorageKey = (channel: Channel, offering: Pick<Offering, 'issuerId' | 'id'>, field: 'quantity' | 'read' | 'list-ack' | 'visited' | 'documents-read' | 'request-id' | 'order-id') =>
  ['rwa-dev01-draft', encodeURIComponent(basePath(channel)), encodeURIComponent(offering.issuerId), encodeURIComponent(offering.id), field].join(':');
export const stepDisplayState = (index: number, current: number, visited: readonly number[]): 'current' | 'viewed' | 'not-viewed' =>
  index === current ? 'current' : visited.includes(index) ? 'viewed' : 'not-viewed';
export const documentListState = (acknowledged: boolean) => ({ canPreviewNext: acknowledged, legallySigned: false });
export const visibleCategories = (all: Offering[], channel: Channel, noListings = false) =>
  Array.from(new Set(visibleOfferings(all, channel, noListings).map(o => assetGroup(o))));
export const assetGroup = (o: Pick<Offering, 'category'>) =>
  ['住宅物业','写字楼','商铺','工业园/仓储物流'].includes(o.category) ? '房地产' : o.category === '企业借款债权' ? '企业借款' : o.category === '非上市普通股权' ? '企业股权' : '其他资产';
export type OpportunityFilters = { search?: string; category?: string; subcategory?: string; right?: string; place?: string; status?: string; issuer?: string; sort?: 'latest' | 'closing' };
export const filterOfferings = <T extends Offering>(all: T[], filters: OpportunityFilters): T[] => {
  const q = (filters.search || '').trim().toLocaleLowerCase('zh-CN');
  const filtered = all.filter(o =>
    (!q || [o.title, o.category].some(value => value.toLocaleLowerCase('zh-CN').includes(q))) &&
    (!filters.category || assetGroup(o) === filters.category) &&
    (!filters.subcategory || o.category === filters.subcategory) &&
    (!filters.right || o.right === filters.right) &&
    (!filters.place || o.place === filters.place) &&
    (!filters.status || o.status === filters.status) &&
    (!filters.issuer || o.issuerName === filters.issuer));
  return filtered.sort((a,b) => filters.sort === 'closing'
    ? (a.closesAt || '9999').localeCompare(b.closesAt || '9999')
    : (b.listedAt || '').localeCompare(a.listedAt || ''));
};
export const investmentFacts = (o: Pick<Offering, 'right' | 'terms' | 'yieldLine'>): [string, string][] => {
  const term = (name: string) => o.terms.find(([key]) => key === name)?.[1] || '以项目文件为准';
  if (o.right === '债权') return [['合同固定年利率', term('合同固定年利率')], ['付息频率', term('付息方式')], ['到期安排', term('本金偿还')]];
  if (o.right === '收益参与权') return [['收益来源', term('收益来源')], ['分配周期', term('分配频率')], ['参与比例', term('参与比例')]];
  return [['法律权益', term('投资者法律权利')], ['股息安排', term('股息安排')], ['退出与锁仓', term('退出与锁仓')]];
};
export const investmentPeriod = (o: Pick<Offering, 'right' | 'terms'>) => {
  const value = (key: string) => o.terms.find(([name]) => name === key)?.[1];
  if (o.right === '债权') return [value('合同期限'), value('付息方式')].filter(Boolean).join(' · ') || '以项目文件为准';
  if (o.right === '收益参与权') return value('分配频率') || '以项目文件为准';
  return value('退出与锁仓') || '无固定期限；以项目文件为准';
};
export const actionState = (status: string, identity: 'guest' | 'kyc' | 'ready' = 'guest') => {
  if (status === '即将开放') return { label: '当前未开放认购', reason: '开放时间以正式披露为准', enabled: false };
  if (status === '已结束' || status === '暂停') return { label: '当前不可认购', reason: status === '暂停' ? '项目认购已暂停' : '本期认购已结束', enabled: false };
  if (status !== '认购中') return { label: '状态待核实', reason: '认购状态待核实，请稍后查看', enabled: false };
  return { label: '开始认购', reason: identity === 'guest' ? '继续时将引导登录' : identity === 'kyc' ? '提交前需完成身份认证' : '可进入认购演示', enabled: true };
};
export const minimumUnits = (offering: Offering) => Math.ceil(offering.minimumCents / offering.priceCents);
export const quantityError = (value: string, offering: Offering) => {
  if (!/^[1-9]\d*$/.test(value)) return '请输入正整数 Token 份数';
  const units = Number(value);
  if (!Number.isSafeInteger(units)) return '份数超出可处理范围';
  if (units < minimumUnits(offering)) return '最低认购 ' + minimumUnits(offering) + ' 份';
  if (units > offering.maxUnits) return '演示可选上限为 ' + offering.maxUnits + ' 份';
  return '';
};
export const totalCents = (value: string, offering: Offering) => {
  if (!/^[1-9]\d*$/.test(value)) return 0;
  const n = BigInt(value) * BigInt(offering.priceCents);
  return n > BigInt(Number.MAX_SAFE_INTEGER) ? 0 : Number(n);
};
