export type IssuerNavItem = { label: string; path: string };
export type IssuerNavSection = IssuerNavItem & { icon: string; children?: IssuerNavItem[] };

// R2 V1 product architecture. Internal Asset, Instrument, Project and Offering routes remain available.
export const issuerNavigation: IssuerNavSection[] = [
  { label: '工作台首页', path: '/issuer', icon: 'M3 10.5 12 3l9 7.5V21H3z M9 21v-7h6v7' },
  { label: '资产与发行', path: '/issuer/assets', icon: 'M4 5h16v14H4z M4 10h16 M9 10v9', children: [
    { label: '资产管理', path: '/issuer/assets' },
    { label: '认购记录', path: '/issuer/subscription-records' },
    { label: '锁仓记录', path: '/issuer/lockups' },
  ] },
  { label: '投资者门户', path: '/issuer/portal', icon: 'M4 20V5h16v15 M4 9h16 M8 15h3 M14 15h3' },
  { label: '投资者与认购', path: '/issuer/investors', icon: 'M16 20v-2a4 4 0 0 0-8 0v2 M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M3 20h18', children: [
    { label: '投资者管理', path: '/issuer/investors' },
    { label: '认购订单', path: '/issuer/orders' },
    { label: '配售与持有人', path: '/issuer/allocation-holders' },
  ] },
  { label: '资金与结算', path: '/issuer/receipts', icon: 'M3 7h18v12H3z M3 10h18 M16 15h2', children: [
    { label: '收款与对账', path: '/issuer/receipts' }, { label: '退款与异常', path: '/issuer/refunds' }, { label: '募集款结算', path: '/issuer/settlement' },
  ] },
  { label: 'Token 管理', path: '/issuer/token-contracts', icon: 'M12 2 20 7v10l-8 5-8-5V7z M4 7l8 5 8-5 M12 12v10', children: [
    { label: '合约管理', path: '/issuer/token-contracts' }, { label: 'Token 操作', path: '/issuer/token-operations' }, { label: '链上记录与对账', path: '/issuer/chain-records' },
  ] },
  { label: '收益与分配', path: '/issuer/servicing', icon: 'M4 19h16 M6 16l4-5 3 2 5-7 M16 6h2v2', children: [
    { label: '存续管理', path: '/issuer/servicing' }, { label: '收益分配', path: '/issuer/distributions' }, { label: '到期与退出', path: '/issuer/exits' },
  ] },
  { label: '数据与报表', path: '/issuer/reports', icon: 'M4 20V4h16v16z M8 16v-4 M12 16V8 M16 16v-6', children: [
    { label: '业务报表', path: '/issuer/reports' }, { label: '审计记录', path: '/issuer/audit-records' },
  ] },
  { label: '企业管理', path: '/issuer/company', icon: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M18.4 5.6l-2.1 2.1 M7.7 16.3l-2.1 2.1 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8', children: [
    { label: '企业资料与认证', path: '/issuer/company' },
    { label: '钱包管理', path: '/issuer/wallets' },
    { label: '套餐与订阅', path: '/issuer/plan' },
    { label: '规则设置', path: '/issuer/rules' },
    { label: '外部服务', path: '/issuer/external-services' },
  ] },
];

export const issuerPendingPagePaths = new Set<string>([
]);

const issuerFreeLockedPrefixes = [
  '/issuer/subscription-records', '/issuer/lockups',
  '/issuer/investors', '/issuer/orders', '/issuer/allocation-holders',
  '/issuer/receipts', '/issuer/refunds', '/issuer/settlement',
  '/issuer/token-operations', '/issuer/chain-records',
  '/issuer/servicing', '/issuer/distributions', '/issuer/exits',
];
export const issuerFreeLockedPage = (path: string): boolean => issuerFreeLockedPrefixes.some(prefix =>
  path === prefix || path.startsWith(`${prefix}/`));

export const issuerLegacyRedirects: Record<string, string> = {
  '/issuer/eligibility': '/issuer/investors',
  '/issuer/allocations': '/issuer/allocation-holders',
  '/issuer/holders': '/issuer/allocation-holders',
};

export const issuerRouteTitle: Record<string, string> = Object.fromEntries(
  issuerNavigation.flatMap(section => [section, ...(section.children || [])]).map(item => [item.path, item.label]),
);

export const navPathIsActive = (current: string, target: string) => current === target ||
  (target === '/issuer/investors' && current.startsWith('/issuer/investors/')) ||
  (target === '/issuer/orders' && current.startsWith('/issuer/orders/')) ||
  (target === '/issuer/allocation-holders' && current.startsWith('/issuer/allocation-holders/')) ||
  (target === '/issuer/receipts' && current.startsWith('/issuer/receipts/')) ||
  (target === '/issuer/refunds' && current.startsWith('/issuer/refunds/')) ||
  (target === '/issuer/settlement' && current.startsWith('/issuer/settlement/')) ||
  (target === '/issuer/token-contracts' && current.startsWith('/issuer/token-contracts/')) ||
  (target === '/issuer/chain-records' && current.startsWith('/issuer/chain-records/')) ||
  (target === '/issuer/audit-records' && current.startsWith('/issuer/audit-records/')) ||
  (target === '/issuer/assets' && current.startsWith('/issuer/assets/')) ||
  (target === '/issuer/assets' && (
    current.startsWith('/issuer/instruments') || current.startsWith('/issuer/projects') ||
    current.startsWith('/issuer/offerings') || current === '/issuer/issuance-check' || current === '/issuer/files'
  )) ||
  (target === '/issuer/company' && (
    current === '/issuer/settings' || current === '/issuer/profile' ||
    current === '/issuer/kyb' || current === '/issuer/kyb-review'
  )) ||
  (target === '/issuer/plan' && (
    current === '/issuer/subscription' || current === '/issuer/upgrade' ||
    current === '/issuer/contract' || current === '/issuer/payment' || current === '/issuer/billing'
  ));

export function activeSection(current: string): IssuerNavSection | undefined {
  return issuerNavigation.find(section => section.children?.some(item => navPathIsActive(current, item.path)) || navPathIsActive(current, section.path));
}
