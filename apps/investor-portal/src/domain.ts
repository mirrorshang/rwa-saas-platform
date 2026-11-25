export type Channel = { kind: 'm' } | { kind: 'v'; issuerSlug: string };
export type Offering = {
  id: string; issuerId: string; issuerSlug: string; issuerName: string; title: string;
  category: string; place: string; right: string; status: string; priceCents: number;
  minimumCents: number; maxUnits: number; listing: 'active' | 'pending';
  image: string; yieldLine: string; summary: string; features: [string, string][];
  terms: [string, string][]; documents: { name: string; version: string }[];
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
export const visibleCategories = (all: Offering[], channel: Channel, noListings = false) =>
  Array.from(new Set(visibleOfferings(all, channel, noListings).map(o => o.category === '住宅物业' ? '房地产' : o.category)));
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
