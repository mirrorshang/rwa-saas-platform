export const site = {
  brand: 'WDEX SaaS',
  demoLabel: 'UI预览 / 模拟演示，不代表实际服务完成',
} as const;

// M端仍为规划中的独立网站。仅在正式部署与监管上线许可后开启。
export const marketplace = {
  status: 'prelaunch' as 'prelaunch' | 'open',
  opportunitiesUrl: '',
};

export const paths = {
  home: '/',
  features: '/features',
  solutions: '/solutions',
  pricing: '/pricing',
  help: '/help',
  contact: '/contact',
  policies: '/policies',
  register: '/register',
  verify: '/verify-email',
  login: '/login',
  onboarding: '/free-onboarding',
  organizations: '/organizations',
  upgrade: '/standard-upgrade',
} as const;

// 筹备期导向W站现有说明，不生成虚假的M端路由或外部URL。
export const marketplaceIsOpen = marketplace.status === 'open'
  && /^https:\/\//i.test(marketplace.opportunitiesUrl);
export const marketplaceLink = marketplaceIsOpen
  ? marketplace.opportunitiesUrl
  : `${paths.features}#portal`;
