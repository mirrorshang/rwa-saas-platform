export type KybStatus = "未创建" | "草稿" | "审核中" | "待补件" | "未通过" | "已通过";
export type PlanStatus = "Free" | "Standard" | "宽限期" | "已到期";

export interface BusinessFile {
  id: string;
  name: string;
  category: string;
  status: "待扫描" | "可引用" | "失败";
  version?: number;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  category: string;
  subtype: string;
  value: number;
  status: "Draft" | "Ready";
  updated: string;
  location?: string;
  address?: string;
  details?: Record<string, string | number>;
  files?: BusinessFile[];
  missing?: string[];
  version?: number;
}

export interface Instrument {
  id: string;
  assetId: string;
  name: string;
  type: "股权" | "债权" | "收益参与权";
  version: string;
  totalRights: number;
  unit: string;
  tokenCap: number;
  used: number;
  status: "Draft" | "Ready";
  updated: string;
  terms?: Record<string, string | number>;
  files?: BusinessFile[];
  missing?: string[];
}

export interface Project {
  id: string;
  assetId: string;
  instrumentId: string;
  instrumentVersion: string;
  name: string;
  status: "Draft" | "Ready";
}

export interface OfferingSnapshot {
  confirmedAt: string;
  asset: Asset;
  instrument: Instrument;
  project: Project;
  walletId: string;
  walletAddress: string;
  disclosureFiles: BusinessFile[];
  reservedTokens: number;
  offeringTerms: {
    name: string;
    round: string;
    tokens: number;
    price: number;
    start: string;
    end: string;
    summary?: string;
    minimum?: number;
  };
}

export interface Offering {
  id: string;
  assetId: string;
  instrumentId: string;
  name: string;
  round: string;
  tokens: number;
  price: number;
  start: string;
  end: string;
  status: "草稿" | "准备就绪" | "待开始" | "认购中" | "暂停" | "已结束";
  walletId: string;
  summary?: string;
  minimum?: number;
  lockDays?: number;
  disclosureFiles?: BusinessFile[];
  confirmed?: boolean;
  contractStatus?: "未申请" | "部署处理中" | "模拟已部署" | "部署失败";
  projectId?: string;
  assetVersion?: number;
  instrumentVersion?: string;
  revision?: number;
  confirmationSnapshot?: OfferingSnapshot;
  publicationStatus?: "未发布" | "Sandbox 已发布";
  subscriptionStatus?: "未开放" | "Sandbox 认购中" | "已结束";
  tokenIssuanceStatus?: "未发行" | "模拟已发行";
}

export interface ReadinessGroup {
  key: number;
  title: string;
  passed: boolean;
  reasons: string[];
  route: string;
}

export interface ReadinessReport {
  offeringId: string;
  checkedAt: string;
  fingerprint: string;
  groups: ReadinessGroup[];
}

export interface IssuanceTask {
  id: string;
  offeringId: string;
  environment: "Sandbox";
  status: "已提交" | "执行中" | "已核验" | "失败" | "Unknown";
  submittedAt: string;
  updatedAt: string;
  readinessFingerprint: string;
  declaration: string;
  attempts?: number;
  reason?: string;
  mockContractReference?: string;
}

export interface PublicationSnapshot {
  id: string;
  offeringId: string;
  taskId: string;
  environment: "Sandbox";
  publishedAt: string;
  confirmedOffering: OfferingSnapshot;
  mockContractReference: string;
}

export interface Investor {
  id: string;
  name: string;
  type: "自然人" | "机构";
  kyc: string;
  offeringIds: string[];
  last: string;
  environment?: "Sandbox";
  source?: string;
  requestKey?: string;
}

export interface Order {
  id: string;
  investorId: string;
  offeringId: string;
  requested: number;
  confirmed: number;
  amount: number;
  status: string;
  payment: string;
  delivery: string;
  created: string;
  environment?: "Sandbox";
  requestKey?: string;
  termsRevision?: number;
  quotedPrice?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  expected: number;
  received: number;
  status: string;
  time: string;
  environment?: "Sandbox";
  intentId?: string;
}

export interface Allocation {
  id: string;
  orderId: string;
  offeringId: string;
  investorId: string;
  quantity: number;
  rights: number;
  status: "已配售";
  environment: "Sandbox";
  createdAt: string;
}

export interface Holder {
  id: string;
  investorId: string;
  orderId: string;
  offeringId: string;
  rights: number;
  tokens: number;
  registration: string;
  lock: string;
  lockUntil: string;
  reconciliation: string;
  environment?: "Sandbox";
  source?: string;
  effectiveAt?: string;
  allocationId?: string;
}

export interface HolderSnapshot {
  id: string;
  offeringId: string;
  recordDate: string;
  environment: "Sandbox";
  createdAt: string;
  instrumentVersion: string;
  lines: { holderId: string; investorId: string; orderId: string; rights: number; tokens: number }[];
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  address: string;
  network: string;
  status: string;
  isDefault: boolean;
}

export interface TokenRecord {
  id: string;
  offeringId: string;
  orderId: string;
  operation: string;
  amount: number;
  status: string;
  time: string;
  tx: string;
}

export interface Distribution {
  id: string;
  offeringId: string;
  period: string;
  recordDate: string;
  gross: number;
  status: string;
  recipients: number;
  eventType?: "租金收益" | "债权利息" | "债权本金";
  instrumentId?: string;
  sourceAmount?: number;
  sourceCurrency?: string;
  exchangeRate?: number;
  proofFile?: BusinessFile;
  items?: { holderId: string; investorId: string; basis: number; amount: number; status: string }[];
  paidAt?: string;
  blockedReason?: string;
  accrualFrom?: string;
  accrualTo?: string;
  interestDays?: number;
  dayCountBasis?: "Actual/365 Fixed";
  reportId?: string;
  holderSnapshotId?: string;
  debtScheduleId?: string;
  interestEventId?: string;
  calculationStatus?: "已计算";
  paymentStatus?: "未发起" | "部分成功" | "Unknown" | "失败" | "支付完成";
}

export interface RentReport {
  id: string;
  offeringId: string;
  period: string;
  recordDate: string;
  sourceAmountCny: number;
  exchangeRate: number;
  deductionsU: number;
  netU: number;
  proofFile: BusinessFile;
  status: "资料待扫描" | "待确认" | "已确认";
  environment: "Sandbox";
  createdAt: string;
  confirmedAt?: string;
}

export interface DistributionPayment {
  id: string;
  batchId: string;
  holderId: string;
  intentId: string;
  amount: number;
  status: "失败" | "Unknown" | "已支付";
  environment: "Sandbox";
  at: string;
}

export interface InvestorIncome {
  id: string;
  batchId: string;
  holderId: string;
  investorId: string;
  paymentId: string;
  amount: number;
  status: "Sandbox 模拟到账";
  at: string;
}

export interface DebtSchedule {
  id: string;
  offeringId: string;
  instrumentId: string;
  instrumentVersion: string;
  startDate: string;
  maturityDate: string;
  principal: number;
  annualRate: number;
  dayCountBasis: "Actual/365 Fixed";
  environment: "Sandbox";
  createdAt: string;
}

export interface DebtInterestEvent {
  id: string;
  scheduleId: string;
  offeringId: string;
  period: string;
  accrualFrom: string;
  accrualTo: string;
  recordDate: string;
  dueDate: string;
  days: number;
  amount: number;
  environment: "Sandbox";
}

export interface DebtCompletion {
  id: string;
  offeringId: string;
  scheduleId: string;
  principalBatchId: string;
  environment: "Sandbox";
  completedAt: string;
}

export interface MockEvent {
  id: string;
  offeringId: string;
  type: string;
  result: string;
  time: string;
  detail: string;
}

export interface Activity {
  id: string;
  time: string;
  module: string;
  object: string;
  action: string;
  result: string;
}

export interface AppState {
  company: null | {
    name: string;
    type: string;
    country: string;
    registration: string;
    address: string;
    website: string;
    industry: string;
    description: string;
    representative: string;
    contact: string;
    email: string;
  };
  kybStatus: KybStatus;
  kybStep: number;
  kybApplication: string;
  kybFiles: string[];
  plan: PlanStatus;
  billing: "月付" | "年付";
  planEnd: string;
  autoRenew: boolean;
  assets: Asset[];
  instruments: Instrument[];
  projects: Project[];
  offerings: Offering[];
  readinessReports: ReadinessReport[];
  issuanceTasks: IssuanceTask[];
  publications: PublicationSnapshot[];
  sandboxClock: string;
  investors: Investor[];
  orders: Order[];
  payments: Payment[];
  allocations: Allocation[];
  holders: Holder[];
  holderSnapshots: HolderSnapshot[];
  wallets: Wallet[];
  tokens: TokenRecord[];
  distributions: Distribution[];
  rentReports: RentReport[];
  distributionPayments: DistributionPayment[];
  investorIncomes: InvestorIncome[];
  debtSchedules: DebtSchedule[];
  debtInterestEvents: DebtInterestEvent[];
  debtCompletions: DebtCompletion[];
  mockEvidenceFiles: BusinessFile[];
  mockEvents: MockEvent[];
  portal: { name: string; slug: string; saved: boolean; logo: string };
  activities: Activity[];
  messages: { id: string; title: string; detail: string; read: boolean; target: string }[];
  scenario: string;
}

export const emptyState: AppState = {
  company: null,
  kybStatus: "未创建",
  kybStep: 1,
  kybApplication: "",
  kybFiles: [],
  plan: "Free",
  billing: "年付",
  planEnd: "",
  autoRenew: false,
  assets: [],
  instruments: [],
  projects: [],
  offerings: [],
  readinessReports: [],
  issuanceTasks: [],
  publications: [],
  sandboxClock: "",
  investors: [],
  orders: [],
  payments: [],
  allocations: [],
  holders: [],
  holderSnapshots: [],
  wallets: [],
  tokens: [],
  distributions: [],
  rentReports: [],
  distributionPayments: [],
  investorIncomes: [],
  debtSchedules: [],
  debtInterestEvents: [],
  debtCompletions: [],
  mockEvidenceFiles: [],
  mockEvents: [],
  portal: { name: "", slug: "", saved: false, logo: "" },
  activities: [],
  messages: [
    {
      id: "MSG-001",
      title: "欢迎使用 RWA OS",
      detail: "请先创建企业并完成 KYB 认证。",
      read: false,
      target: "company",
    },
  ],
  scenario: "初始状态",
};

export const companyDemo = {
  name: "北京朝阳城市资产管理有限公司",
  type: "有限责任公司",
  country: "中国北京市朝阳区",
  registration: "DEMO-CN-BJ-2026-001",
  address: "北京市朝阳区测试路88号12层（虚构）",
  website: "https://example.com",
  industry: "房地产与资产管理",
  description: "住宅资产持有运营、房地产租赁管理及依法开展的收益权业务。本企业及资料均为虚构演示。",
  representative: "王静 / 执行董事",
  contact: "李明",
  email: "contact@rwa.example",
};

const assets: Asset[] = [
  {
    id: "AST-1001",
    name: "滨江甲级写字楼",
    code: "AST-SG-001",
    category: "房地产",
    subtype: "写字楼",
    value: 12800000,
    status: "Ready",
    updated: "2026-11-12",
    location: "Singapore",
  },
  {
    id: "AST-1002",
    name: "北港智能仓储中心",
    code: "AST-SG-002",
    category: "房地产",
    subtype: "工业园/仓储物流物业",
    value: 6800000,
    status: "Ready",
    updated: "2026-11-10",
    location: "Singapore",
  },
  {
    id: "AST-1003",
    name: "星河科技普通股",
    code: "AST-EQ-001",
    category: "企业股权",
    subtype: "非上市企业普通股权",
    value: 4200000,
    status: "Ready",
    updated: "2026-11-08",
  },
  {
    id: "AST-1004",
    name: "远航贸易借款债权",
    code: "AST-DEBT-001",
    category: "债权与应收款",
    subtype: "单笔企业借款债权",
    value: 2000000,
    status: "Ready",
    updated: "2026-11-06",
  },
  {
    id: "AST-1005",
    name: "湖畔服务公寓 A 栋",
    code: "AST-RE-003",
    category: "房地产",
    subtype: "住宅物业",
    value: 3500000,
    status: "Draft",
    updated: "2026-11-13",
    location: "Hong Kong",
  },
  {
    id: "AST-1006",
    name: "中心商业街 08 号铺",
    code: "AST-RE-004",
    category: "房地产",
    subtype: "商业商铺",
    value: 1900000,
    status: "Draft",
    updated: "2026-11-03",
    location: "Singapore",
  },
];

const instruments: Instrument[] = [
  {
    id: "INS-2001-V2",
    assetId: "AST-1001",
    name: "滨江物业收益参与权",
    type: "收益参与权",
    version: "v2",
    totalRights: 100000,
    unit: "收益权单位",
    tokenCap: 100000,
    used: 64000,
    status: "Ready",
    updated: "2026-11-12",
  },
  {
    id: "INS-2002-V1",
    assetId: "AST-1002",
    name: "北港仓储收益参与权",
    type: "收益参与权",
    version: "v1",
    totalRights: 68000,
    unit: "收益权单位",
    tokenCap: 68000,
    used: 20000,
    status: "Ready",
    updated: "2026-11-10",
  },
  {
    id: "INS-2003-V1",
    assetId: "AST-1003",
    name: "星河科技普通股权益",
    type: "股权",
    version: "v1",
    totalRights: 100000,
    unit: "普通股",
    tokenCap: 100000,
    used: 0,
    status: "Ready",
    updated: "2026-11-08",
  },
  {
    id: "INS-2004-V1",
    assetId: "AST-1004",
    name: "远航借款债权",
    type: "债权",
    version: "v1",
    totalRights: 2000000,
    unit: "U 本金",
    tokenCap: 20000,
    used: 12000,
    status: "Ready",
    updated: "2026-11-06",
  },
  {
    id: "INS-2005-V1",
    assetId: "AST-1005",
    name: "湖畔公寓收益权",
    type: "收益参与权",
    version: "v1",
    totalRights: 35000,
    unit: "收益权单位",
    tokenCap: 35000,
    used: 0,
    status: "Draft",
    updated: "2026-11-13",
  },
];

const offerings: Offering[] = [
  {
    id: "OFF-3001",
    assetId: "AST-1001",
    instrumentId: "INS-2001-V2",
    name: "滨江写字楼收益权首期",
    round: "第 1 期",
    tokens: 40000,
    price: 100,
    start: "2026-10-01",
    end: "2026-12-31",
    status: "认购中",
    walletId: "WAL-01",
  },
  {
    id: "OFF-3002",
    assetId: "AST-1001",
    instrumentId: "INS-2001-V2",
    name: "滨江写字楼收益权二期",
    round: "第 2 期",
    tokens: 24000,
    price: 105,
    start: "2027-01-15",
    end: "2027-03-31",
    status: "待开始",
    walletId: "WAL-01",
  },
  {
    id: "OFF-3003",
    assetId: "AST-1002",
    instrumentId: "INS-2002-V1",
    name: "北港仓储设施发行",
    round: "第 1 期",
    tokens: 20000,
    price: 100,
    start: "2026-08-01",
    end: "2026-10-31",
    status: "已结束",
    walletId: "WAL-02",
  },
  {
    id: "OFF-3004",
    assetId: "AST-1004",
    instrumentId: "INS-2004-V1",
    name: "远航贸易债权 2026",
    round: "第 1 期",
    tokens: 12000,
    price: 100,
    start: "2026-11-20",
    end: "2027-01-20",
    status: "准备就绪",
    walletId: "WAL-01",
  },
];

const investors: Investor[] = [
  {
    id: "INV-0018",
    name: "陈**",
    type: "自然人",
    kyc: "有效通过",
    offeringIds: ["OFF-3001", "OFF-3003"],
    last: "完成 Token 交付",
  },
  {
    id: "INV-0024",
    name: "Aurora C****** Pte.",
    type: "机构",
    kyc: "有效通过",
    offeringIds: ["OFF-3001"],
    last: "付款最终匹配",
  },
  {
    id: "INV-0031",
    name: "林**",
    type: "自然人",
    kyc: "核验中",
    offeringIds: ["OFF-3001"],
    last: "提交 KYC",
  },
  {
    id: "INV-0042",
    name: "海***投资有限公司",
    type: "机构",
    kyc: "需补件",
    offeringIds: ["OFF-3002"],
    last: "等待本人补件",
  },
  {
    id: "INV-0055",
    name: "吴**",
    type: "自然人",
    kyc: "Unknown",
    offeringIds: ["OFF-3003"],
    last: "平台状态待确认",
  },
  {
    id: "INV-0067",
    name: "Pacific G***** Ltd.",
    type: "机构",
    kyc: "有效通过",
    offeringIds: ["OFF-3003"],
    last: "收益支付完成",
  },
];

const orders: Order[] = [
  {
    id: "ORD-6001",
    investorId: "INV-0018",
    offeringId: "OFF-3001",
    requested: 1200,
    confirmed: 1200,
    amount: 120000,
    status: "已完成",
    payment: "最终匹配",
    delivery: "最终交付",
    created: "2026-10-08",
  },
  {
    id: "ORD-6002",
    investorId: "INV-0024",
    offeringId: "OFF-3001",
    requested: 2500,
    confirmed: 2500,
    amount: 250000,
    status: "待交付",
    payment: "最终匹配",
    delivery: "处理中",
    created: "2026-10-18",
  },
  {
    id: "ORD-6003",
    investorId: "INV-0031",
    offeringId: "OFF-3001",
    requested: 500,
    confirmed: 0,
    amount: 50000,
    status: "待付款",
    payment: "未付款",
    delivery: "未开始",
    created: "2026-11-11",
  },
  {
    id: "ORD-6004",
    investorId: "INV-0055",
    offeringId: "OFF-3003",
    requested: 800,
    confirmed: 800,
    amount: 80000,
    status: "异常",
    payment: "金额不符",
    delivery: "已暂停",
    created: "2026-09-16",
  },
  {
    id: "ORD-6005",
    investorId: "INV-0067",
    offeringId: "OFF-3003",
    requested: 5000,
    confirmed: 5000,
    amount: 500000,
    status: "已完成",
    payment: "最终匹配",
    delivery: "最终交付",
    created: "2026-08-22",
  },
];

const payments: Payment[] = [
  {
    id: "PAY-7001",
    orderId: "ORD-6001",
    expected: 120000,
    received: 120000,
    status: "最终匹配",
    time: "2026-10-08 14:24",
  },
  {
    id: "PAY-7002",
    orderId: "ORD-6002",
    expected: 250000,
    received: 250000,
    status: "最终匹配",
    time: "2026-10-18 09:12",
  },
  {
    id: "PAY-7003",
    orderId: "ORD-6003",
    expected: 50000,
    received: 0,
    status: "待付款",
    time: "—",
  },
  {
    id: "PAY-7004",
    orderId: "ORD-6004",
    expected: 80000,
    received: 79200,
    status: "金额不符",
    time: "2026-09-17 20:44",
  },
  {
    id: "PAY-7005",
    orderId: "ORD-6005",
    expected: 500000,
    received: 500000,
    status: "最终匹配",
    time: "2026-08-22 16:08",
  },
];

const holders: Holder[] = [
  {
    id: "HOL-8001",
    investorId: "INV-0018",
    orderId: "ORD-6001",
    offeringId: "OFF-3001",
    rights: 1200,
    tokens: 1200,
    registration: "登记有效",
    lock: "锁仓中",
    lockUntil: "2027-04-09",
    reconciliation: "一致",
  },
  {
    id: "HOL-8002",
    investorId: "INV-0067",
    orderId: "ORD-6005",
    offeringId: "OFF-3003",
    rights: 5000,
    tokens: 5000,
    registration: "登记有效",
    lock: "已到期·待核",
    lockUntil: "2026-11-20",
    reconciliation: "一致",
  },
  {
    id: "HOL-8003",
    investorId: "INV-0024",
    orderId: "ORD-6002",
    offeringId: "OFF-3001",
    rights: 2500,
    tokens: 0,
    registration: "登记处理中",
    lock: "未起算",
    lockUntil: "—",
    reconciliation: "差异待处理",
  },
];

const wallets: Wallet[] = [
  {
    id: "WAL-01",
    name: "企业 MPC 主钱包",
    type: "MPC 钱包（模拟）",
    address: "0x71b8c9315a7efb88cD2e142b94C22a190aB7F126",
    network: "OP Mainnet",
    status: "已验证",
    isDefault: true,
  },
  {
    id: "WAL-02",
    name: "募集资金专用钱包",
    type: "自有钱包",
    address: "0x208aeD647aC4B58265bA9fB3473Ad1E9c39D1740",
    network: "OP Mainnet",
    status: "已验证",
    isDefault: false,
  },
];

const tokens: TokenRecord[] = [
  {
    id: "TOK-9001",
    offeringId: "OFF-3001",
    orderId: "ORD-6001",
    operation: "Mint / 交付",
    amount: 1200,
    status: "最终确认",
    time: "2026-10-09 10:20",
    tx: "0xdemo…a82f",
  },
  {
    id: "TOK-9002",
    offeringId: "OFF-3001",
    orderId: "ORD-6002",
    operation: "Mint / 交付",
    amount: 2500,
    status: "处理中",
    time: "2026-10-18 11:05",
    tx: "INT-DEMO-9921",
  },
  {
    id: "TOK-9003",
    offeringId: "OFF-3003",
    orderId: "ORD-6005",
    operation: "Mint / 交付",
    amount: 5000,
    status: "最终确认",
    time: "2026-08-23 08:40",
    tx: "0xdemo…90be",
  },
];

const distributions: Distribution[] = [
  {
    id: "DST-1001",
    offeringId: "OFF-3003",
    period: "2026 Q3",
    recordDate: "2026-09-30",
    gross: 42500,
    status: "支付完成",
    recipients: 4,
  },
  {
    id: "DST-1002",
    offeringId: "OFF-3001",
    period: "2026 Q4",
    recordDate: "2026-12-31",
    gross: 68000,
    status: "待注资",
    recipients: 2,
  },
];

export function demoState(
  mode: "free" | "standard" | "operations" | "exception" = "operations",
): AppState {
  const operational = mode === "operations" || mode === "exception";
  return {
    ...emptyState,
    company: { ...companyDemo },
    kybStatus: "已通过",
    kybStep: 5,
    kybApplication: "KYB-DEMO-260018",
    kybFiles: ["企业注册证明.pdf", "最终受益人结构图.pdf", "授权代表证明.pdf"],
    plan: mode === "free" ? "Free" : mode === "exception" ? "已到期" : "Standard",
    billing: "年付",
    planEnd: mode === "exception" ? "2026-10-31" : "2027-11-13",
    autoRenew: mode !== "exception",
    assets: assets.map((x) => ({ ...x })),
    instruments: instruments.map((x) => ({ ...x })),
    projects: [],
    offerings: offerings.map((x) => ({ ...x })),
    investors: operational ? investors.map((x) => ({ ...x })) : [],
    orders: operational ? orders.map((x) => ({ ...x })) : [],
    payments: operational ? payments.map((x) => ({ ...x })) : [],
    holders: operational ? holders.map((x) => ({ ...x })) : [],
    wallets: wallets.map((x) => ({ ...x })),
    tokens: operational ? tokens.map((x) => ({ ...x })) : [],
    distributions: operational ? distributions.map((x) => ({ ...x })) : [],
    mockEvents: [],
    portal: {
      name: "星河资产投资者门户",
      slug: "galaxy-assets-demo",
      saved: mode !== "free",
      logo: "星",
    },
    activities: [
      {
        id: "ACT-01",
        time: "2026-11-13 10:42",
        module: "资金与结算",
        object: "PAY-7004",
        action: "识别金额差异",
        result: "待处理",
      },
      {
        id: "ACT-02",
        time: "2026-11-13 09:18",
        module: "Token 管理",
        object: "TOK-9002",
        action: "提交交付 Intent",
        result: "处理中",
      },
      {
        id: "ACT-03",
        time: "2026-11-12 16:30",
        module: "资产与发行",
        object: "AST-1001",
        action: "更新资产资料",
        result: "成功",
      },
      {
        id: "ACT-04",
        time: "2026-11-12 11:04",
        module: "收益与分配",
        object: "DST-1002",
        action: "创建分配批次",
        result: "成功",
      },
    ],
    messages: [
      {
        id: "MSG-101",
        title: "付款金额存在差异",
        detail: "订单 ORD-6004 实收金额比应收少 800 U，请核对。",
        read: false,
        target: "funds",
      },
      {
        id: "MSG-102",
        title: "Token 交付处理中",
        detail: "ORD-6002 的交付 Intent 已提交，等待模拟最终确认。",
        read: false,
        target: "token",
      },
      {
        id: "MSG-103",
        title: "收益分配待注资",
        detail: "2026 Q4 分配批次已完成试算。",
        read: true,
        target: "revenue",
      },
    ],
    scenario:
      mode === "free"
        ? "Free 资料准备"
        : mode === "standard"
          ? "Standard 已激活"
          : mode === "exception"
            ? "异常与降级"
            : "完整发行运营",
  };
}

export const categories = [
  [
    "房地产",
    ["住宅物业★", "写字楼★", "商业商铺★", "工业园/仓储物流物业★", "土地", "酒店/服务式公寓"],
  ],
  ["企业股权", ["非上市企业普通股权★", "资产持有公司/SPV 股权"]],
  ["债权与应收款", ["单笔企业借款债权★", "应收账款", "供应链贸易债权", "资产支持债权"]],
  ["基金与投资份额", ["私募基金份额", "房地产基金份额", "信贷基金份额"]],
  ["实物与大宗商品", ["贵金属", "能源/农矿产品", "设备与存货"]],
  ["基础设施与能源项目", ["新能源项目", "交通/公共设施", "数据中心/通信设施"]],
  ["知识产权与合同收益", ["知识产权许可权益", "版权/版税及其他合同收益"]],
] as const;

export const formatU = (n: number) =>
  `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(n)} U`;
