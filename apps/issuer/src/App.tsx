import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Coins as Token,
  Copy,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Globe2,
  HelpCircle,
  Home,
  Landmark,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  PackageCheck,
  PanelLeftClose,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Upload,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import {
  AppState,
  Asset,
  BusinessFile,
  Instrument,
  Offering,
  categories,
  companyDemo,
  demoState,
  emptyState,
  formatU,
} from "./data";
import {
  ISSUER_STORAGE_KEY,
  confirmIssuerOffering,
  ensureProjects,
  loadIssuerState,
  nextNumericId,
  parseIssuerState,
  persistIssuerState,
  serializeIssuerState,
  type StorageIssue,
} from "./issuerModule01";
import { ACTUAL_365_FIXED, actual365MonthlyInterest } from "./actual365";
import { advanceSandboxIssuance, checkIssuanceReadiness, readinessFingerprint, refreshSandboxSale, resolveSandboxIssuance, retryFailedSandboxIssuance, sandboxBusinessDate, submitSandboxIssuance } from "./issuerModule02";
import { allocateMockOrder, approveMockInvestorKyc, createHolderSnapshot, createMockInvestor, createMockOrder, deliverMockTokens, recordMockPayment, registerMockHolder } from "./issuerModule03";
import { confirmRentBatch, confirmRentReport, createRentBatch, createRentReport, payMockDistributionLine, splitBySnapshot } from "./issuerModule04";
import { completeDebt, confirmDebtBatch, createDebtInterestBatch, createDebtPrincipalBatch, createDebtSchedule, disposeDebtTokens, settleDebtRegistry } from "./issuerModule05";

type ModuleId =
  | "dashboard"
  | "assets"
  | "portal"
  | "investors"
  | "funds"
  | "token"
  | "revenue"
  | "reports"
  | "company";
type Drawer = null | { type: string; id?: string; eventId?: string };

const nowLabel = () =>
  new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-").replace(/\s/g, " ");
const formatU6 = (amount: number) => `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 6 }).format(amount)} U`;
const paidDebtPrincipal = (state: AppState, offeringId: string, holderId?: string) => {
  const batches = state.distributions.filter(row => row.offeringId === offeringId && row.eventType === "债权本金");
  const paidMock = state.distributionPayments.filter(payment => payment.status === "已支付"
    && (!holderId || payment.holderId === holderId) && batches.some(batch => batch.id === payment.batchId && batch.calculationStatus))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const legacy = batches.filter(batch => !batch.calculationStatus && batch.status === "支付完成")
    .flatMap(batch => batch.items || []).filter(line => line.status === "支付完成" && (!holderId || line.holderId === holderId))
    .reduce((sum, line) => sum + line.amount, 0);
  return paidMock + legacy;
};

const newActivity = (
  module: string,
  object: string,
  action: string,
  result = "成功",
): AppState["activities"][number] => ({
  id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  time: nowLabel(),
  module,
  object,
  action,
  result,
});

const visibleMessages = (state: AppState) =>
  state.messages.filter(
    (message) =>
      !(
        state.kybStatus === "已通过" &&
        message.target === "company" &&
        /创建企业|完成 KYB|欢迎使用/.test(`${message.title}${message.detail}`)
      ),
  );

const assetAgreedValueU = (asset: Asset) =>
  asset.subtype === "住宅物业"
    ? Number(asset.details?.agreedPriceCny || 0) / 8
    : Number(asset.details?.outstanding || asset.value || 0);

const assetAppraisalLabel = (asset: Asset) =>
  asset.subtype === "住宅物业"
    ? `¥${Number(asset.details?.appraisalCny || 0).toLocaleString("zh-CN")}`
    : formatU(Number(asset.details?.valuation || asset.value || 0));

const offeringRaised = (state: AppState, offeringId: string) => {
  const orderIds = state.orders
    .filter((order) => order.offeringId === offeringId)
    .map((order) => order.id);
  return state.payments
    .filter((payment) => orderIds.includes(payment.orderId) && payment.status === "最终匹配")
    .reduce((sum, payment) => sum + payment.received, 0);
};

const operationRows = (state: AppState): AppState["activities"] => [
  ...state.activities,
  ...state.mockEvents.map((event) => ({
    id: `MOCK-${event.id}`,
    time: event.time,
    module: "演示控制台",
    object: event.detail.match(/ORD-[A-Z0-9-]+/)?.[0] || event.offeringId,
    action: event.type,
    result: event.result,
  })),
];

type InitialRoute = { module: ModuleId; tab: string; workspace: Drawer };

function parseRoute(): InitialRoute {
  const parts = window.location.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const detailRoutes: Record<string, { module: ModuleId; tab: string; type: string }> = {
    assets: { module: "assets", tab: "资产管理", type: "asset-detail" },
    instruments: { module: "assets", tab: "权益结构", type: "instrument-detail" },
    offerings: { module: "assets", tab: "发行管理", type: "offering-detail" },
    "issuance-readiness": { module: "assets", tab: "发行管理", type: "issuance-readiness" },
  };
  const detail = detailRoutes[parts[0]];
  if (detail && parts[1]) {
    return {
      module: detail.module,
      tab: detail.tab,
      workspace: { type: detail.type, id: parts[1] },
    };
  }
  if (!parts.length) {
    try {
      const restored = JSON.parse(
        sessionStorage.getItem("rwa-issuer-detail-route") || "null",
      ) as InitialRoute | null;
      if (restored?.workspace?.type.endsWith("-detail") && restored.workspace.id) return restored;
    } catch {
      sessionStorage.removeItem("rwa-issuer-detail-route");
    }
  }
  const matched = nav.find((item) => item.id === parts[0]);
  const routeModule = matched?.id || "dashboard";
  const queryTab = new URLSearchParams(window.location.search).get("tab");
  return {
    module: routeModule,
    tab: queryTab || tabDefaults[routeModule],
    workspace: null,
  };
}

function routeFor(module: ModuleId, tab = tabDefaults[module]) {
  const query = tab && tab !== tabDefaults[module] ? `?tab=${encodeURIComponent(tab)}` : "";
  return module === "dashboard" ? "/" : `/${module}${query}`;
}

function detailRoute(surface: NonNullable<Drawer>) {
  const base =
    surface.type === "asset-detail"
      ? "assets"
      : surface.type === "instrument-detail"
        ? "instruments"
        : surface.type === "offering-detail"
          ? "offerings"
          : surface.type === "issuance-readiness"
            ? "issuance-readiness"
          : "";
  return base && surface.id ? `/${base}/${encodeURIComponent(surface.id)}` : "";
}

const requiredFileReady = (files: BusinessFile[] | undefined, categories: string[]) =>
  categories.every((category) =>
    files?.some((file) => file.category === category && file.status === "可引用"),
  );

function assetMissing(asset: Asset): string[] {
  const details = asset.details || {};
  if (asset.subtype === "住宅物业") {
    const fields: [string, string][] = [
      ["address", "物业地址"],
      ["propertyLayout", "户型"],
      ["area", "建筑面积"],
      ["use", "住宅用途"],
      ["occupancy", "当前使用状态"],
      ["owner", "登记权利人"],
      ["rightNature", "权利性质"],
      ["relation", "与发行企业关系"],
      ["agreedPriceCny", "资产约定价格"],
      ["appraisalCny", "第三方评估金额"],
      ["appraisalDate", "评估日期"],
      ["appraiser", "估值机构"],
      ["monthlyRentCny", "合同月租金"],
      ["leaseStart", "租约开始日期"],
      ["leaseEnd", "租约结束日期"],
      ["operator", "运营方"],
    ];
    const missing = fields.filter(([key]) => !details[key]).map(([, label]) => label);
    if (Number(details.area) <= 0) missing.push("建筑面积必须大于 0");
    if (Number(details.agreedPriceCny) <= 0) missing.push("资产约定价格必须大于 0");
    if (Number(details.appraisalCny) <= 0) missing.push("第三方评估金额必须大于 0");
    if (Number(details.monthlyRentCny) <= 0) missing.push("合同月租金必须大于 0");
    if (
      details.leaseStart &&
      details.leaseEnd &&
      new Date(String(details.leaseStart)) >= new Date(String(details.leaseEnd))
    )
      missing.push("租约结束日期必须晚于开始日期");
    if (!requiredFileReady(asset.files, ["权属证明", "估值依据", "租赁合同"])) {
      missing.push("权属、估值及租赁合同文件须可引用");
    }
    return missing;
  }
  if (asset.subtype === "单笔企业借款债权") {
    const fields: [string, string][] = [
      ["contractNumber", "合同编号"],
      ["signedDate", "合同签订日"],
      ["creditor", "当前债权权利人"],
      ["debtor", "债务人"],
      ["principal", "合同本金"],
      ["outstanding", "未偿本金"],
      ["annualRate", "合同利率"],
      ["interestStart", "起息日"],
      ["maturity", "底层合同到期日"],
      ["repayment", "还本方式"],
      ["performance", "履约状态"],
      ["valuation", "债权估值"],
      ["valuationDate", "估值基准日"],
    ];
    const missing = fields.filter(([key]) => !details[key]).map(([, label]) => label);
    if (Number(details.outstanding) > Number(details.principal)) {
      missing.push("未偿本金不得超过合同本金");
    }
    if (Number(details.principal) <= 0) missing.push("合同本金必须大于 0");
    if (Number(details.outstanding) <= 0) missing.push("未偿本金必须大于 0");
    if (Number(details.annualRate) <= 0) missing.push("合同年利率必须大于 0");
    if (
      details.interestStart &&
      details.maturity &&
      new Date(String(details.interestStart)) >= new Date(String(details.maturity))
    )
      missing.push("底层合同到期日必须晚于起息日");
    if (details.performance === "已清偿") missing.push("已清偿债权不能作为当前发行资产");
    if (!requiredFileReady(asset.files, ["借款合同", "债权证明", "余额证明", "估值依据"])) {
      missing.push("借款合同、债权、余额及估值文件须可引用");
    }
    return missing;
  }
  return asset.name && asset.value > 0 ? [] : ["资产名称与规模"];
}

function instrumentMissing(instrument: Instrument, asset?: Asset): string[] {
  const terms = instrument.terms || {};
  const common: [string, string][] = [
    ["responsibleParty", "法律责任主体"],
    ["rightsDescription", "权利描述"],
    ["startDate", "权益起始日"],
    ["maturityDate", "权益到期日"],
  ];
  const typeFields: [string, string][] =
    instrument.type === "债权"
      ? [
          ["principal", "投资者本金总额"],
          ["annualRate", "投资者固定年利率"],
          ["interestMethod", "计息方式"],
          ["frequency", "付息频率"],
          ["repayment", "本金偿还方式"],
        ]
      : [
          ["revenueSource", "收益来源"],
          ["participationRate", "收益参与比例"],
          ["frequency", "分配频率"],
          ["expiryArrangement", "到期安排"],
        ];
  const missing = [...common, ...typeFields]
    .filter(([key]) => !terms[key])
    .map(([, label]) => label);
  if (!asset || asset.status !== "Ready") missing.push("上游 Asset 尚未 Ready");
  if (!requiredFileReady(instrument.files, ["核心协议"])) missing.push("核心协议须可引用");
  if (
    instrument.totalRights <= 0 ||
    instrument.tokenCap <= 0 ||
    instrument.totalRights % instrument.tokenCap !== 0
  ) {
    missing.push("权益总量必须与 Token 份数精确映射");
  }
  if (
    terms.startDate &&
    terms.maturityDate &&
    new Date(String(terms.startDate)) >= new Date(String(terms.maturityDate))
  )
    missing.push("投资者权益到期日必须晚于起始日");
  if (instrument.type === "债权") {
    if (Number(terms.principal) <= 0) missing.push("投资者本金必须大于 0");
    if (Number(terms.annualRate) <= 0) missing.push("投资者利率必须大于 0");
    if (Number(terms.principal) !== instrument.totalRights)
      missing.push("投资者本金总额必须与授权债权权益总量一致");
    if (terms.interestMethod !== ACTUAL_365_FIXED)
      missing.push("计息方式必须为 Actual/365 Fixed");
  } else if (Number(terms.participationRate) <= 0 || Number(terms.participationRate) > 100) {
    missing.push("收益参与比例必须大于 0 且不超过 100%");
  }
  return missing;
}

const nav: { id: ModuleId; label: string; icon: typeof Home; tabs?: string[] }[] = [
  { id: "dashboard", label: "工作台首页", icon: LayoutDashboard },
  { id: "assets", label: "资产与发行", icon: Landmark, tabs: ["资产管理", "权益结构", "发行管理"] },
  { id: "portal", label: "投资者门户", icon: Globe2 },
  {
    id: "investors",
    label: "投资者与认购",
    icon: UsersRound,
    tabs: ["投资者管理", "认购订单", "持有人管理"],
  },
  {
    id: "funds",
    label: "资金与结算",
    icon: CircleDollarSign,
    tabs: ["收款与对账", "退款与异常", "募集款结算"],
  },
  {
    id: "token",
    label: "Token 管理",
    icon: Token,
    tabs: ["合约管理", "Token 操作", "链上记录与对账"],
  },
  {
    id: "revenue",
    label: "收益与分配",
    icon: BarChart3,
    tabs: ["存续管理", "收益分配", "到期与退出"],
  },
  { id: "reports", label: "数据与报表", icon: TableProperties, tabs: ["业务报表", "操作记录"] },
  {
    id: "company",
    label: "企业管理",
    icon: Building2,
    tabs: ["企业资料与 KYB", "钱包管理", "套餐订阅"],
  },
];

const tabDefaults: Record<ModuleId, string> = {
  dashboard: "",
  assets: "资产管理",
  portal: "",
  investors: "投资者管理",
  funds: "收款与对账",
  token: "合约管理",
  revenue: "存续管理",
  reports: "业务报表",
  company: "企业资料与 KYB",
};

function Status({ value }: { value: string }) {
  const tone = /Ready|已通过|有效|完成|最终|一致|认购中|Standard|已验证|可用/.test(value)
    ? "success"
    : /异常|失败|未通过|到期|差异|Unknown|暂停/.test(value)
      ? "danger"
      : /待|处理中|审核|核验|草稿|Draft|宽限|未起算/.test(value)
        ? "warning"
        : "neutral";
  return (
    <span className={`status ${tone}`}>
      <i />
      {value}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      className={`btn ${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}

function Empty({
  icon: Icon = Database,
  title,
  text,
  action,
}: {
  icon?: typeof Database;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function Toolbar({
  search,
  setSearch,
  filter,
  setFilter,
  filters = [],
  action,
}: {
  search: string;
  setSearch: (v: string) => void;
  filter?: string;
  setFilter?: (v: string) => void;
  filters?: string[];
  action?: React.ReactNode;
}) {
  return (
    <div className="toolbar">
      <label className="search">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索名称或编号"
        />
      </label>
      {setFilter && (
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>全部状态</option>
          {filters.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      )}
      <div className="toolbar-spacer" />
      {action}
    </div>
  );
}

function Restricted({ state, goKyb }: { state: AppState; goKyb: () => void }) {
  const step = state.company ? (state.kybStatus === "已通过" ? 3 : 2) : 1;
  return (
    <div className="restricted">
      <div className="restricted-visual">
        <ShieldCheck size={38} />
        <div className="orbit o1" />
        <div className="orbit o2" />
      </div>
      <div className="eyebrow">企业准入</div>
      <h2>{state.company ? "完成企业认证后继续" : "先建立您的企业工作空间"}</h2>
      <p>
        为保护业务数据，资产发行及运营模块需在企业 KYB 通过后启用。您仍可查看全部导航和当前进度。
      </p>
      <div className="stepper compact">
        {["创建企业", "提交 KYB", "启用 Free"].map((x, i) => (
          <div className={i + 1 < step ? "done" : i + 1 === step ? "active" : ""} key={x}>
            <span>{i + 1 < step ? <Check size={14} /> : i + 1}</span>
            <b>{x}</b>
          </div>
        ))}
      </div>
      <Button onClick={goKyb}>
        {state.company ? "继续 KYB 认证" : "创建并认证企业"}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

function App() {
  const initialRoute = parseRoute();
  const [initialLoad] = useState(() => loadIssuerState(localStorage, emptyState));
  const lastStoredRaw = useRef<string | null>(initialLoad.source === "v4" ? initialLoad.readRaw || null : null);
  const [state, setState] = useState<AppState>(() => refreshSandboxSale(initialLoad.state, initialLoad.state.sandboxClock || sandboxBusinessDate(new Date().toISOString())));
  const [storageIssue, setStorageIssue] = useState<StorageIssue | undefined>(initialLoad.issue);
  const [importError, setImportError] = useState("");
  const [module, setModule] = useState<ModuleId>(initialRoute.module);
  const [tab, setTab] = useState(initialRoute.tab);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [workspace, setWorkspace] = useState<Drawer>(initialRoute.workspace);
  const [demoOpen, setDemoOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (storageIssue) return;
    const result = persistIssuerState(localStorage, state, lastStoredRaw.current);
    if (result.error) {
      let raw = "";
      try { raw = localStorage.getItem(ISSUER_STORAGE_KEY) || localStorage.getItem("rwa-issuer-state-v3") || ""; } catch { /* 读取也不可用 */ }
      setStorageIssue({ source: "write", raw, reasons: [result.error] });
    } else {
      lastStoredRaw.current = result.raw || serializeIssuerState(state);
    }
  }, [state, storageIssue]);
  useEffect(() => {
    if (!tab) setTab(tabDefaults[module]);
  }, [module, tab]);
  useEffect(() => {
    const restoreRoute = () => {
      const route = parseRoute();
      setModule(route.module);
      setTab(route.tab);
      setWorkspace(route.workspace);
      setDrawer(null);
    };
    window.addEventListener("popstate", restoreRoute);
    return () => window.removeEventListener("popstate", restoreRoute);
  }, []);
  useEffect(() => {
    if (workspace?.type.endsWith("-detail") && workspace.id) {
      sessionStorage.setItem(
        "rwa-issuer-detail-route",
        JSON.stringify({ module, tab, workspace } satisfies InitialRoute),
      );
    }
  }, [module, tab, workspace]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const go = (id: ModuleId, nextTab?: string, replace = false) => {
    const targetTab = nextTab ?? tabDefaults[id];
    setModule(id);
    setTab(targetTab);
    setMobileNav(false);
    setDrawer(null);
    setWorkspace(null);
    sessionStorage.removeItem("rwa-issuer-detail-route");
    window.history[replace ? "replaceState" : "pushState"]({}, "", routeFor(id, targetTab));
  };
  const openSurface = (surface: Drawer) => {
    if (!surface) {
      setDrawer(null);
      return;
    }
    const pageTypes = [
      "asset-create",
      "asset-edit",
      "instrument-create",
      "offering-create",
      "offering-edit",
      "distribution-create",
    ];
    if (pageTypes.includes(surface.type) || surface.type.endsWith("-detail") || surface.type === "issuance-readiness") {
      setWorkspace(surface);
      setDrawer(null);
      const url = detailRoute(surface);
      if (url) window.history.pushState({}, "", url);
    } else {
      setDrawer(surface);
    }
  };
  const closeWorkspace = () => {
    if (workspace?.type === "issuance-readiness" && workspace.id) {
      openSurface({ type: "offering-detail", id: workspace.id });
      return;
    }
    if (workspace?.type === "asset-detail" || workspace?.type === "asset-edit") {
      go("assets", "资产管理");
      return;
    }
    if (workspace?.type === "instrument-detail") {
      go("assets", "权益结构");
      return;
    }
    if (
      workspace?.type === "offering-detail" ||
      workspace?.type === "offering-edit" ||
      workspace?.type === "offering-create"
    ) {
      go("assets", "发行管理");
      return;
    }
    if (workspace?.type === "distribution-detail" || workspace?.type === "distribution-create") {
      go("revenue", "收益分配");
      return;
    }
    setWorkspace(null);
  };
  const unread = visibleMessages(state).filter((m) => !m.read).length;
  const restricted = state.kybStatus !== "已通过";
  const activeMeta = nav.find((n) => n.id === module)!;

  if (storageIssue) {
    const exportOriginal = () => {
      const blob = new Blob([storageIssue.raw], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `issuer-original-${storageIssue.source}.json`;
      link.click();
      URL.revokeObjectURL(url);
    };
    return (
      <main className="business-workspace" style={{ maxWidth: 780, margin: "64px auto" }}>
        <PageHeader eyebrow="DATA RECOVERY" title="本地数据需要核对" description="原始记录已保留，当前页面停止业务写入。请导出原始数据，修复冲突后导入有效 JSON。" />
        <div className="card" style={{ padding: 24 }}>
          <p>来源：{storageIssue.source}</p>
          {storageIssue.reasons.map((reason, index) => <p key={index}>· {reason}</p>)}
          {importError && <p className="banner danger">导入失败：{importError}</p>}
          <div className="control-row">
            <Button onClick={exportOriginal} disabled={!storageIssue.raw}>下载原始数据</Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>重新读取本地数据</Button>
            <label className="field">
              <span>导入修复后的数据</span>
              <input type="file" accept=".json,application/json" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  const raw = await file.text();
                  let source: "v3" | "v4" = "v3";
                  try { source = JSON.parse(raw)?.schemaVersion === 4 ? "v4" : "v3"; } catch { /* 交由统一解析器报告 */ }
                  const result = parseIssuerState(raw, source, emptyState);
                  if (result.issue) { setImportError(result.issue.reasons.join("；")); return; }
                  if (storageIssue.raw) {
                    const backupKey = `rwa-issuer-recovery-backup-${Date.now()}-${crypto.randomUUID()}`;
                    localStorage.setItem(backupKey, storageIssue.raw);
                  }
                  setImportError("");
                  try { lastStoredRaw.current = localStorage.getItem(ISSUER_STORAGE_KEY); } catch { lastStoredRaw.current = null; }
                  setState(result.state);
                  setStorageIssue(undefined);
                } catch (error) { setImportError(String(error)); }
              }} />
            </label>
          </div>
          <p className="body-copy">旧存储不会自动删除；若原始文件无法修复，请保留导出文件并交由工程师核对。</p>
        </div>
      </main>
    );
  }

  return (
    <div className={`app ${collapsed ? "collapsed" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Layers3 size={20} />
          </div>
          <div>
            <strong>
              RWA<span>OS</span>
            </strong>
            <small>Issuer workspace</small>
          </div>
        </div>
        <button className="collapse" onClick={() => setCollapsed(!collapsed)}>
          <PanelLeftClose size={17} />
        </button>
        <nav>
          <div className="nav-label">业务工作区</div>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  className={`nav-item ${module === item.id ? "active" : ""}`}
                  onClick={() => go(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.tabs && <ChevronRight className="nav-chevron" size={14} />}
                </button>
                {module === item.id && item.tabs && !collapsed && (
                  <div className="subnav">
                    {item.tabs.map((t) => (
                      <button
                        className={tab === t ? "active" : ""}
                        key={t}
                        onClick={() => go(item.id, t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="demo-entry" onClick={() => setDemoOpen(true)}>
            <Sparkles size={17} />
            <span>
              <b>演示控制台</b>
              <small>{state.scenario}</small>
            </span>
          </button>
          <div className="user">
            <div className="avatar">DE</div>
            <div>
              <b>demo@rwa.example</b>
              <small>{state.company?.name || "尚未创建企业"}</small>
            </div>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      <main>
        <div className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}>
            <Menu size={20} />
          </button>
          <div className="crumb">
            <span>RWA Issuer</span>
            <ChevronRight size={13} />
            <b>{activeMeta.label}</b>
            {tab && (
              <>
                <ChevronRight size={13} />
                <b>{tab}</b>
              </>
            )}
          </div>
          <div className="environment">
            <i /> 演示环境 · 非生产
          </div>
          <button className="icon-btn help">
            <HelpCircle size={18} />
          </button>
          <button className="icon-btn notification" onClick={() => setMessagesOpen(!messagesOpen)}>
            <Bell size={18} />
            {unread > 0 && <em>{unread}</em>}
          </button>
          {messagesOpen && (
            <Messages
              state={state}
              setState={setState}
              go={go}
              close={() => setMessagesOpen(false)}
            />
          )}
        </div>
        <div className={`page ${workspace ? "has-workspace" : ""}`}>
          {workspace ? (
            <WorkspaceRouter
              workspace={workspace}
              state={state}
              setState={setState}
              close={closeWorkspace}
              openSurface={openSurface}
              go={go}
              toast={setToast}
            />
          ) : (
            <>
              {module === "dashboard" && (
                <Dashboard state={state} go={go} openDemo={() => setDemoOpen(true)} />
              )}
              {module !== "dashboard" && restricted && module !== "company" ? (
                <Restricted state={state} goKyb={() => go("company", "企业资料与 KYB")} />
              ) : (
                <>
                  {module === "assets" && (
                    <AssetsPage
                      state={state}
                      tab={tab}
                      setState={setState}
                      setDrawer={openSurface}
                      toast={setToast}
                    />
                  )}
                  {module === "portal" && (
                    <PortalPage
                      state={state}
                      setState={setState}
                      setDrawer={openSurface}
                      toast={setToast}
                    />
                  )}
                  {module === "investors" && (
                    <InvestorsPage state={state} tab={tab} setDrawer={openSurface} />
                  )}
                  {module === "funds" && (
                    <FundsPage state={state} tab={tab} setDrawer={openSurface} toast={setToast} />
                  )}
                  {module === "token" && (
                    <TokenPage state={state} tab={tab} setDrawer={openSurface} toast={setToast} />
                  )}
                  {module === "revenue" && (
                    <RevenuePage
                      state={state}
                      tab={tab}
                      setState={setState}
                      setDrawer={openSurface}
                      toast={setToast}
                    />
                  )}
                  {module === "reports" && <ReportsPage state={state} tab={tab} />}
                  {module === "company" && (
                    <CompanyPage
                      state={state}
                      tab={tab}
                      setState={setState}
                      setDrawer={openSurface}
                      toast={setToast}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      {drawer && (
        <DrawerPanel
          drawer={drawer}
          state={state}
          setState={setState}
          setDrawer={openSurface}
          close={() => setDrawer(null)}
          go={go}
          toast={setToast}
        />
      )}
      {demoOpen && (
        <DemoConsole
          state={state}
          setState={setState}
          close={() => setDemoOpen(false)}
          go={go}
          toast={setToast}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
      {mobileNav && <div className="backdrop mobile" onClick={() => setMobileNav(false)} />}
    </div>
  );
}

function WorkspaceRouter({
  workspace,
  state,
  setState,
  close,
  openSurface,
  go,
  toast,
}: {
  workspace: NonNullable<Drawer>;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  openSurface: (surface: Drawer) => void;
  go: (module: ModuleId, tab?: string) => void;
  toast: (message: string) => void;
}) {
  const titles: Record<string, [string, string]> = {
    "asset-create": ["创建资产", "选择资产模板并建立权属、估值和业务资料"],
    "asset-edit": ["编辑资产资料", "修改后重新运行资料检查；历史发行引用不会被覆盖"],
    "instrument-create": ["配置权益结构", "定义投资者取得的法律权利、现金流与 Token 映射"],
    "offering-create": ["创建发行方案", "配置本期发行参数、认购规则、钱包与披露资料"],
    "offering-edit": ["编辑发行方案", "保留 Asset 与 Instrument 固定引用，仅修改未确认草稿参数"],
    "distribution-create": ["创建债权应付批次", "按固定付息计划或到期本金分别建立批次"],
  };
  const meta = titles[workspace.type];
  const returnToList = () => {
    if (
      ["asset-edit", "offering-edit"].includes(workspace.type) &&
      !confirm("离开编辑页面将放弃尚未保存的修改，确认返回列表？")
    )
      return;
    close();
  };
  if (!meta) {
    return (
      <div className="business-workspace detail-workspace">
        <DrawerPanel
          inline
          drawer={workspace}
          state={state}
          setState={setState}
          setDrawer={openSurface}
          close={close}
          go={go}
          toast={toast}
        />
      </div>
    );
  }
  return (
    <div className="business-workspace">
      <div className="workspace-header">
        <button onClick={returnToList}>
          <ArrowLeft size={17} />
          返回列表
        </button>
        <div>
          <div className="eyebrow">业务工作区</div>
          <h1>{meta[0]}</h1>
          <p>{meta[1]}</p>
        </div>
      </div>
      <div className="workspace-form">
        {workspace.type === "asset-create" && (
          <CreateAsset state={state} setState={setState} close={close} toast={toast} />
        )}
        {workspace.type === "asset-edit" && (
          <CreateAsset
            state={state}
            setState={setState}
            close={close}
            toast={toast}
            existing={state.assets.find((asset) => asset.id === workspace.id)}
          />
        )}
        {workspace.type === "instrument-create" && (
          <CreateInstrument state={state} setState={setState} close={close} toast={toast} preferredAssetId={workspace.id} />
        )}
        {workspace.type === "offering-create" && (
          <CreateOffering state={state} setState={setState} close={close} toast={toast} preferredAssetId={workspace.id} />
        )}
        {workspace.type === "offering-edit" && (
          <CreateOffering
            state={state}
            setState={setState}
            close={close}
            toast={toast}
            existing={state.offerings.find((offering) => offering.id === workspace.id)}
          />
        )}
        {workspace.type === "distribution-create" && (
          <CreateDebtBatch state={state} setState={setState} close={close} toast={toast} kind="interest" />
        )}
      </div>
    </div>
  );
}

function Dashboard({
  state,
  go,
  openDemo,
}: {
  state: AppState;
  go: (m: ModuleId, t?: string) => void;
  openDemo: () => void;
}) {
  if (!state.company)
    return (
      <div>
        <div className="welcome-top">
          <span>demo@rwa.example</span>
          <Status value="已登录" />
        </div>
        <section className="onboarding-hero">
          <div className="hero-copy">
            <div className="eyebrow">RWA ISSUANCE WORKSPACE</div>
            <h1>
              把真实世界资产，转化为
              <br />
              <em>清晰、可控的发行流程</em>
            </h1>
            <p>从企业认证到资产准备、发行、资金对账与存续管理，在一个工作区建立完整业务链路。</p>
            <div className="hero-actions">
              <Button onClick={() => go("company", "企业资料与 KYB")}>
                创建并认证企业 <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" onClick={openDemo}>
                <Sparkles size={16} />
                载入演示场景
              </Button>
            </div>
            <div className="trust-row">
              <span>
                <ShieldCheck size={15} />
                五步 KYB
              </span>
              <span>
                <LockKeyhole size={15} />
                本地持久化
              </span>
              <span>
                <Activity size={15} />
                全链路可追溯
              </span>
            </div>
          </div>
          <div className="hero-orb">
            <div className="orb-core">
              <Layers3 size={34} />
            </div>
            <div className="ring r1">
              <i />
              <i />
              <i />
            </div>
            <div className="ring r2">
              <i />
              <i />
            </div>
            <div className="float-card fc1">
              <WalletCards size={18} />
              <span>
                资金对账<small>独立状态</small>
              </span>
            </div>
            <div className="float-card fc2">
              <Token size={18} />
              <span>
                Token 交付<small>受控模拟</small>
              </span>
            </div>
            <div className="float-card fc3">
              <FileText size={18} />
              <span>
                权益结构<small>精确映射</small>
              </span>
            </div>
          </div>
        </section>
        <div className="onboarding-grid">
          <div className="card journey-card">
            <div className="card-title">
              <span>
                <Gauge size={18} />
                开始您的发行旅程
              </span>
              <small>0 / 4</small>
            </div>
            {[
              ["01", "创建企业工作空间", "填写企业基本资料，约 2 分钟"],
              ["02", "完成企业 KYB", "五步提交，支持补件与重提"],
              ["03", "准备首项资产", "选择六种 V1 开放资产模板"],
              ["04", "配置权益与 Offering", "精确拆分 Token 授权容量"],
            ].map((x, i) => (
              <button
                key={x[0]}
                onClick={() => (i < 2 ? go("company", "企业资料与 KYB") : go("assets"))}
              >
                <span>{x[0]}</span>
                <div>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </div>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
          <div className="card account-card">
            <div className="card-title">
              <span>
                <UserRoundCheck size={18} />
                当前账户
              </span>
              <Status value="待创建企业" />
            </div>
            <div className="account-email">
              DE
              <div>
                <small>已登录账号</small>
                <b>demo@rwa.example</b>
              </div>
            </div>
            <div className="info-note">
              <AlertCircle size={17} />
              <p>
                <b>为什么需要企业认证？</b>
                <br />
                企业 KYB 是进入资产准备与发行模块的必要前置步骤。此原型不会向外部服务提交资料。
              </p>
            </div>
          </div>
        </div>
      </div>
    );

  const raised = state.payments
    .filter((p) => p.status === "最终匹配")
    .reduce((n, p) => n + p.received, 0);
  const matchedPayments = state.payments.filter((payment) => payment.status === "最终匹配");
  const maxMatchedPayment = Math.max(...matchedPayments.map((payment) => payment.received), 0);
  const completion = state.assets.length
    ? Math.round(
        (state.assets.filter((a) => a.status === "Ready").length / state.assets.length) * 100,
      )
    : 0;
  return (
    <div>
      <PageHeader
        eyebrow={`${state.scenario} · ${new Date().toLocaleDateString("zh-CN")}`}
        title={`早上好，${state.company.name}`}
        description="这里是企业发行与运营的证据化摘要。每项数字都可回到对应业务记录。"
        actions={
          <>
            <Button variant="secondary" onClick={openDemo}>
              <Sparkles size={16} />
              切换场景
            </Button>
            <Button onClick={() => go("assets", "发行管理")}>
              <Plus size={16} />
              新建 Offering
            </Button>
          </>
        }
      />
      {state.plan !== "Standard" && (
        <div className="banner warning">
          <AlertCircle size={18} />
          <div>
            <b>
              {state.plan === "Free"
                ? "当前为 Free：可准备资料与内部预览"
                : `Standard ${state.plan}：历史数据已转为只读`}
            </b>
            <p>对外门户、认购与后续运营仅作为受控演示，不代表生产权限。</p>
          </div>
          <button onClick={() => go("company", "套餐订阅")}>
            查看套餐 <ArrowRight size={14} />
          </button>
        </div>
      )}
      <div className="metric-grid">
        <div className="metric">
          <div className="metric-icon cyan">
            <Landmark size={19} />
          </div>
          <span>资产总数</span>
          <strong>{state.assets.length}</strong>
          <small>
            <b>{state.assets.filter((a) => a.status === "Ready").length}</b> 项已 Ready ·{" "}
            {completion}%
          </small>
        </div>
        <div className="metric">
          <div className="metric-icon purple">
            <Zap size={19} />
          </div>
          <span>进行中 Offering</span>
          <strong>
            {
              state.offerings.filter((o) => ["认购中", "待开始", "准备就绪"].includes(o.status))
                .length
            }
          </strong>
          <small>共 {state.offerings.length} 个发行期次</small>
        </div>
        <div className="metric">
          <div className="metric-icon green">
            <CircleDollarSign size={19} />
          </div>
          <span>已确认到账</span>
          <strong>{formatU(raised).replace(" U", "")}</strong>
          <small>U · 仅模拟最终匹配</small>
        </div>
        <div className="metric">
          <div className="metric-icon amber">
            <UsersRound size={19} />
          </div>
          <span>有效持有人</span>
          <strong>{state.holders.filter((h) => h.registration === "登记有效").length}</strong>
          <small>
            {state.holders.filter((h) => h.reconciliation.includes("差异")).length} 项差异待处理
          </small>
        </div>
      </div>
      <div className="dashboard-layout">
        <div className="card overview-card">
          <div className="card-title">
            <span>发行运营概览</span>
            <small>与“已确认到账”使用同一付款数据源</small>
          </div>
          {matchedPayments.length ? (
            <>
              <div className="chart">
                <div className="y-labels">
                  <span>{formatU(maxMatchedPayment)}</span>
                  <span>{formatU(maxMatchedPayment / 2)}</span>
                  <span>0 U</span>
                </div>
                <div className="bars">
                  {matchedPayments.slice(-6).map((payment) => (
                    <div key={payment.id}>
                      <i
                        style={{
                          height: `${maxMatchedPayment ? Math.max(8, (payment.received / maxMatchedPayment) * 100) : 0}%`,
                        }}
                        title={`${payment.id} · ${formatU(payment.received)}`}
                      />
                      <span>{payment.time.slice(5, 10) || payment.id.slice(-4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-legend">
                <span>
                  <i className="blue" />
                  最终匹配到账 · 共 {formatU(raised)}
                </span>
              </div>
            </>
          ) : (
            <Empty
              title="暂无确认到账数据"
              text="付款完成最终匹配后，此处才会按真实业务记录生成图表；当前不会展示示例数值。"
            />
          )}
        </div>
        <div className="card task-card">
          <div className="card-title">
            <span>需要关注</span>
            <b>
              {visibleMessages(state).filter((m) => !m.read).length +
                state.orders.filter((o) => o.status === "异常").length}
            </b>
          </div>
          {state.orders
            .filter((o) => o.status === "异常")
            .map((o) => (
              <button key={o.id} onClick={() => go("funds", "退款与异常")}>
                <span className="task-icon danger">
                  <AlertCircle size={17} />
                </span>
                <div>
                  <b>付款金额需要核对</b>
                  <small>{o.id} · 金额不符</small>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
          {state.tokens
            .filter((t) => t.status === "处理中")
            .map((t) => (
              <button key={t.id} onClick={() => go("token", "Token 操作")}>
                <span className="task-icon warning">
                  <RefreshCcw size={17} />
                </span>
                <div>
                  <b>Token 交付处理中</b>
                  <small>{t.orderId} · 等待最终性</small>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
          {state.distributions
            .filter((d) => d.status === "待注资")
            .map((d) => (
              <button key={d.id} onClick={() => go("revenue", "收益分配")}>
                <span className="task-icon cyan">
                  <CreditCard size={17} />
                </span>
                <div>
                  <b>收益批次待注资</b>
                  <small>
                    {d.period} · {formatU(d.gross)}
                  </small>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
          {!state.orders.some((o) => o.status === "异常") &&
            !state.tokens.some((t) => t.status === "处理中") &&
            !state.distributions.some((d) => d.status === "待注资") && (
              <Empty
                title="暂无运营待办"
                text="当前没有异常订单、处理中 Token 或待注资收益批次。"
              />
            )}
        </div>
      </div>
      <div className="card recent">
        <div className="card-title">
          <span>最近动态</span>
          <button onClick={() => go("reports", "操作记录")}>
            全部记录 <ArrowRight size={14} />
          </button>
        </div>
        {state.activities.slice(0, 4).map((a) => (
          <div className="activity-row" key={a.id}>
            <span className="activity-dot" />
            <div>
              <b>{a.action}</b>
              <small>
                {a.module} · {a.object}
              </small>
            </div>
            <Status value={a.result} />
            <time>{a.time}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsPage({
  state,
  tab,
  setState,
  setDrawer,
  toast,
}: {
  state: AppState;
  tab: string;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("全部状态");
  if (tab === "资产管理") {
    const rows = state.assets.filter(
      (a) =>
        (a.name + a.code + a.subtype).toLowerCase().includes(search.toLowerCase()) &&
        (filter === "全部状态" || a.status === filter),
    );
    return (
      <div>
        <PageHeader
          eyebrow="ASSET CATALOG"
          title="资产管理"
          description="以独立资产档案沉淀权属、估值、相关方与版本证据。"
          actions={
            <Button onClick={() => setDrawer({ type: "asset-create" })}>
              <Plus size={16} />
              创建资产
            </Button>
          }
        />
        <div className="summary-strip">
          <span>
            <b>{state.assets.length}</b> 全部资产
          </span>
          <span>
            <b>{state.assets.filter((a) => a.status === "Ready").length}</b> Ready
          </span>
          <span>
            <b>{formatU(state.assets.reduce((n, a) => n + assetAgreedValueU(a), 0))}</b> 约定价格 /
            债权规模
          </span>
          <button onClick={() => setDrawer({ type: "catalog" })}>
            查看 7×23 分类目录 <ArrowRight size={14} />
          </button>
        </div>
        <div className="card table-card">
          <Toolbar
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            filters={["Draft", "Ready"]}
          />
          {rows.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>资产</th>
                    <th>分类</th>
                    <th>资产约定价格 / 债权规模</th>
                    <th>第三方评估</th>
                    <th>资料状态</th>
                    <th>权益结构</th>
                    <th>Offering</th>
                    <th>最近更新</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const ins = state.instruments.find((i) => i.assetId === a.id);
                    const count = state.offerings.filter((o) => o.assetId === a.id).length;
                    return (
                      <tr key={a.id} onClick={() => setDrawer({ type: "asset-detail", id: a.id })}>
                        <td>
                          <b>{a.name}</b>
                          <small>{a.code}</small>
                        </td>
                        <td>
                          {a.category}
                          <small>{a.subtype}</small>
                        </td>
                        <td>
                          <b>{formatU(assetAgreedValueU(a))}</b>
                          <small>
                            {a.subtype === "住宅物业"
                              ? "按测试汇率 1 U = 8 元换算"
                              : "未偿本金口径"}
                          </small>
                        </td>
                        <td>
                          <b>{assetAppraisalLabel(a)}</b>
                          <small>
                            评估日{" "}
                            {String(
                              a.details?.appraisalDate || a.details?.valuationDate || "尚未填写",
                            )}
                          </small>
                        </td>
                        <td>
                          <Status value={a.status} />
                        </td>
                        <td>
                          {ins ? (
                            <Status value={ins.status} />
                          ) : (
                            <span className="muted">未配置</span>
                          )}
                        </td>
                        <td>{count} 个期次</td>
                        <td>{a.updated}</td>
                        <td>
                          <ChevronRight size={15} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="没有匹配的资产" text="调整关键词或状态筛选，或创建一项新资产。" />
          )}
        </div>
      </div>
    );
  }
  if (tab === "权益结构") {
    const rows = state.instruments.filter(
      (i) =>
        (i.name + i.id + i.type).toLowerCase().includes(search.toLowerCase()) &&
        (filter === "全部状态" || i.status === filter),
    );
    return (
      <div>
        <PageHeader
          eyebrow="INSTRUMENTS"
          title="权益结构"
          description="每项 Asset 仅保留一套当前有效 Instrument；历史 Offering 始终引用冻结版本。"
          actions={
            <Button onClick={() => setDrawer({ type: "instrument-create" })}>
              <Plus size={16} />
              配置权益结构
            </Button>
          }
        />
        <div className="info-bar">
          <ShieldCheck size={17} />
          <span>
            <b>精确映射守卫已启用</b> Token 份数必须与法定权益总量精确对应，共享容量不可重复占用。
          </span>
        </div>
        <div className="card table-card">
          <Toolbar
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            filters={["Draft", "Ready"]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>权益结构</th>
                  <th>所属资产</th>
                  <th>类型 / 版本</th>
                  <th>法定权益总量</th>
                  <th>Token 容量</th>
                  <th>占用 / 剩余</th>
                  <th>状态</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const a = state.assets.find((a) => a.id === i.assetId);
                  return (
                    <tr
                      key={i.id}
                      onClick={() => setDrawer({ type: "instrument-detail", id: i.id })}
                    >
                      <td>
                        <b>{i.name}</b>
                        <small>{i.id}</small>
                      </td>
                      <td>{a?.name}</td>
                      <td>
                        {i.type}
                        <small>{i.version} · 当前有效</small>
                      </td>
                      <td>
                        <b>{i.totalRights.toLocaleString()}</b>
                        <small>{i.unit}</small>
                      </td>
                      <td>{i.tokenCap.toLocaleString()} Token</td>
                      <td>
                        <div className="capacity">
                          <span style={{ width: `${(i.used / i.tokenCap) * 100}%` }} />
                        </div>
                        <small>
                          {i.used.toLocaleString()} / {(i.tokenCap - i.used).toLocaleString()}
                        </small>
                      </td>
                      <td>
                        <Status value={i.status} />
                      </td>
                      <td>
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && (
              <Empty
                title="暂无权益结构"
                text="当前没有 Instrument。请先准备 Asset，再配置法律条款、经济条款和精确 Token 映射。"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  const rows = state.offerings.filter(
    (o) =>
      (o.name + o.id).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "全部状态" || o.status === filter),
  );
  return (
    <div>
      <PageHeader
        eyebrow="OFFERINGS"
        title="发行管理"
        description="创建独立发行期次，绑定确定的资产、权益版本、容量与收款钱包。"
        actions={
          <>
            <Button variant="secondary" onClick={() => {
              const first = state.offerings.find((item) => item.confirmed);
              if (first) setDrawer({ type: "issuance-readiness", id: first.id });
              else toast("请先打开 Offering 详情并确认发行方案");
            }}>
              <ClipboardCheck size={16} />
              查看发行准备资料
            </Button>
            <Button onClick={() => setDrawer({ type: "offering-create" })}>
              <Plus size={16} />
              新建 Offering
            </Button>
          </>
        }
      />
      <div className="card table-card">
        <Toolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={["草稿", "准备就绪", "待开始", "认购中", "暂停", "已结束"]}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Offering</th>
                <th>关联资产 / 权益</th>
                <th>发行规模</th>
                <th>单价 / 募集目标</th>
                <th>已募集 / 剩余</th>
                <th>时间窗口</th>
                <th>状态</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const a = state.assets.find((a) => a.id === o.assetId);
                const i = state.instruments.find((i) => i.id === o.instrumentId);
                const orderIds = state.orders
                  .filter((order) => order.offeringId === o.id)
                  .map((order) => order.id);
                const raised = state.payments
                  .filter(
                    (payment) =>
                      orderIds.includes(payment.orderId) && payment.status === "最终匹配",
                  )
                  .reduce((sum, payment) => sum + payment.received, 0);
                const target = o.tokens * o.price;
                return (
                  <tr key={o.id} onClick={() => setDrawer({ type: "offering-detail", id: o.id })}>
                    <td>
                      <b>{o.name}</b>
                      <small>
                        {o.id} · {o.round}
                      </small>
                    </td>
                    <td>
                      {a?.name}
                      <small>
                        {i?.type} · {i?.version}
                      </small>
                    </td>
                    <td>
                      <b>{o.tokens.toLocaleString()}</b>
                      <small>Token</small>
                    </td>
                    <td>
                      {formatU(o.price)}
                      <small>募集目标 {formatU(target)}</small>
                    </td>
                    <td>
                      <b>{formatU(raised)}</b>
                      <small>剩余 {formatU(Math.max(0, target - raised))}</small>
                    </td>
                    <td>
                      {o.start}
                      <small>至 {o.end} · UTC+8</small>
                    </td>
                    <td>
                      <Status value={o.subscriptionStatus || o.status} />
                    </td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <Empty
              title="暂无发行方案"
              text="当前没有 Offering。需先让 Asset 与 Instrument 达到 Ready，再创建发行草稿。"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PortalPage({
  state,
  setState,
  setDrawer,
  toast,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  const [form, setForm] = useState({ ...state.portal });
  const [dirty, setDirty] = useState(false);
  const valid =
    /^(?!-)(?!.*--)[a-z0-9-]{3,32}(?<!-)$/.test(form.slug) &&
    !["admin", "api", "login", "support", "system"].includes(form.slug);
  const standard = state.plan === "Standard";
  const save = () => {
    if (!standard) return toast("Free 仅支持 Sandbox 预览，请先升级 Standard");
    if (!form.name || !valid) return toast("请检查必填字段和 URL 前缀");
    setState((s) => ({ ...s, portal: { ...form, saved: true } }));
    setDirty(false);
    toast("门户配置已保存");
  };
  return (
    <div>
      <PageHeader
        eyebrow="INVESTOR PORTAL"
        title="投资者门户"
        description="配置企业展示信息与平台域名下的专属站点，并进入只读投资者视角预览。"
        actions={
          <Button variant="secondary" onClick={() => setDrawer({ type: "portal-preview" })}>
            <ExternalLink size={16} />
            打开完整预览
          </Button>
        }
      />
      {!standard && (
        <div className="banner warning">
          <LockKeyhole size={18} />
          <div>
            <b>Free Sandbox 模式</b>
            <p>
              您可以编辑并预览，但保存公开配置需要 Standard。预览不提供真实 KYC、支付或持仓操作。
            </p>
          </div>
        </div>
      )}
      <div className="portal-layout">
        <div className="card form-card">
          <div className="section-heading">
            <div>
              <h3>网站配置</h3>
              <p>品牌信息仅应用于本企业的只读演示站点。</p>
            </div>
            <Status value={state.portal.saved ? "配置已保存" : "未创建"} />
          </div>
          <div className="logo-upload">
            <div className="logo-preview">{form.logo || "星"}</div>
            <div>
              <b>企业 Logo</b>
              <small>PNG、JPG 或 SVG，建议 1:1</small>
              <Button
                variant="secondary"
                onClick={() => {
                  setForm({ ...form, logo: form.logo ? "" : "星" });
                  setDirty(true);
                }}
              >
                <Upload size={15} />
                {form.logo ? "移除" : "选择文件"}
              </Button>
            </div>
          </div>
          <label className="field">
            <span>网站展示名称 *</span>
            <input
              value={form.name}
              placeholder="例如：星河资产投资者门户"
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setDirty(true);
              }}
            />
          </label>
          <label className="field">
            <span>企业专属 URL 前缀 *</span>
            <div className="url-field">
              <input
                value={form.slug}
                placeholder="galaxy-assets"
                onChange={(e) => {
                  setForm({ ...form, slug: e.target.value.toLowerCase() });
                  setDirty(true);
                }}
              />
              <em>.issuer.rwa-demo.local</em>
            </div>
            <small className={form.slug && !valid ? "error" : ""}>
              {form.slug
                ? valid
                  ? "格式有效 · 本地模拟可用"
                  : "需为 3–32 位小写字母、数字或中划线，且不可使用保留词"
                : "仅支持平台统一域名，不是自定义顶级域名"}
            </small>
          </label>
          <div className="form-actions">
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => {
                setForm({ ...state.portal });
                setDirty(false);
              }}
            >
              取消修改
            </Button>
            <Button disabled={!dirty} onClick={save}>
              保存配置
            </Button>
          </div>
        </div>
        <div className="card preview-mini">
          <div className="browser-bar">
            <i />
            <i />
            <i />
            <span>{form.slug || "your-company"}.issuer.rwa-demo.local</span>
          </div>
          <div className="mini-site">
            <div className="mini-nav">
              <b>{form.logo || "星"}</b>
              <span>{form.name || "您的企业门户"}</span>
              <small>发行项目　关于企业</small>
            </div>
            <div className="mini-hero">
              <span>REAL-WORLD ASSET ACCESS</span>
              <h2>
                发现透明、可追溯的
                <br />
                真实资产机会
              </h2>
              <p>所有内容均为只读演示，不构成投资建议。</p>
            </div>
            <div className="mini-cards">
              {state.offerings
                .filter((o) => ["认购中", "待开始"].includes(o.status))
                .slice(0, 2)
                .map((o) => (
                  <div key={o.id}>
                    <small>{o.status}</small>
                    <b>{o.name}</b>
                    <span>
                      募集目标 {formatU(o.tokens * o.price)} · 已募集{" "}
                      {formatU(offeringRaised(state, o.id))}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <button className="preview-link" onClick={() => setDrawer({ type: "portal-preview" })}>
            进入投资者视角完整预览 <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InvestorsPage({
  state,
  tab,
  setDrawer,
}: {
  state: AppState;
  tab: string;
  setDrawer: (d: Drawer) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("全部状态");
  if (tab === "投资者管理") {
    const rows = state.investors.filter(
      (i) =>
        (i.name + i.id).toLowerCase().includes(search.toLowerCase()) &&
        (filter === "全部状态" || i.kyc === filter),
    );
    return (
      <div>
        <PageHeader
          eyebrow="INVESTORS"
          title="投资者管理"
          description="仅展示平台授权的脱敏投资者引用和 KYC 状态；企业不能编辑真实身份。"
          actions={
            <Button variant="secondary">
              <Upload size={16} />
              导出脱敏列表
            </Button>
          }
        />
        <div className="info-bar">
          <ShieldCheck size={17} />
          <span>投资者 KYC 由平台统一处理。KYC 通过不等于自动具备每项 Offering 的认购资格。</span>
        </div>
        <div className="card table-card">
          <Toolbar
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            filters={["有效通过", "核验中", "需补件", "Unknown"]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>投资者引用</th>
                  <th>类型</th>
                  <th>KYC 当前状态</th>
                  <th>关联 Offering</th>
                  <th>订单</th>
                  <th>最近业务</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} onClick={() => setDrawer({ type: "investor-detail", id: i.id })}>
                    <td>
                      <b>{i.name}</b>
                      <small>{i.id}</small>
                      {i.environment === "Sandbox" && <small>Sandbox Mock · {i.source}</small>}
                    </td>
                    <td>{i.type}</td>
                    <td>
                      <Status value={i.kyc} />
                    </td>
                    <td>{i.offeringIds.length} 个</td>
                    <td>{state.orders.filter((o) => o.investorId === i.id).length} 笔</td>
                    <td>{i.last}</td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && (
              <Empty
                title="暂无投资者记录"
                text="当前企业尚无授权投资者引用。Standard 演示场景产生认购后，脱敏身份与 KYC 状态会显示在这里。"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  if (tab === "认购订单") {
    const rows = state.orders.filter(
      (o) =>
        (o.id + state.investors.find((i) => i.id === o.investorId)?.name)
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === "全部状态" || o.status === filter),
    );
    return (
      <div>
        <PageHeader
          eyebrow="SUBSCRIPTIONS"
          title="认购订单"
          description="订单报价、付款、配售、登记与 Token 交付分别记录；最终付款匹配 + Token 最终交付才算完成。"
          actions={
            <Button variant="secondary">
              <Upload size={16} />
              导出已完成订单
            </Button>
          }
        />
        <div className="card table-card">
          <Toolbar
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            filters={["待付款", "待配售", "待登记", "待交付", "已完成", "异常"]}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>订单 / 投资者</th>
                  <th>Asset / Offering</th>
                  <th>申请 / 确认</th>
                  <th>报价金额</th>
                  <th>订单状态</th>
                  <th>付款</th>
                  <th>交付</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const inv = state.investors.find((i) => i.id === o.investorId);
                  const off = state.offerings.find((x) => x.id === o.offeringId);
                  return (
                    <tr key={o.id} onClick={() => setDrawer({ type: "order-detail", id: o.id })}>
                      <td>
                        <b>{o.id}</b>
                        <small>
                          {inv?.name} · {inv?.id}
                        </small>
                        {o.environment === "Sandbox" && <small>Sandbox Mock · {state.allocations.some(row => row.orderId === o.id) ? "已配售" : "未配售"} · {state.holders.some(row => row.orderId === o.id) ? "已登记" : "未登记"}</small>}
                      </td>
                      <td>
                        {off?.name}
                        <small>{o.offeringId}</small>
                      </td>
                      <td>
                        {o.requested.toLocaleString()} / {o.confirmed.toLocaleString()}
                        <small>Token</small>
                      </td>
                      <td>
                        <b>{formatU(o.amount)}</b>
                        <small>固定报价快照</small>
                      </td>
                      <td>
                        <Status value={o.status} />
                      </td>
                      <td>
                        <Status value={o.payment} />
                      </td>
                      <td>
                        <Status value={o.delivery} />
                      </td>
                      <td>
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && (
              <Empty
                title="暂无认购订单"
                text="当前没有投资者认购记录。需先有已确认 Offering，并在 Standard 演示场景中模拟认购。"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  const rows = state.holders.filter(
    (h) =>
      (h.id + state.investors.find((i) => i.id === h.investorId)?.name)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "全部状态" || h.registration === filter),
  );
  return (
    <div>
      <PageHeader
        eyebrow="HOLDER REGISTER"
        title="持有人管理"
        description="法定权益、Token 持有、登记与锁仓批次独立展示，避免把链上余额等同于法定名册。"
        actions={
          <Button variant="secondary">
            <RefreshCcw size={16} />
            运行差异对账
          </Button>
        }
      />
      <div className="card table-card">
        <Toolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={["登记有效", "登记处理中", "模拟已清偿"]}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>持有人</th>
                <th>Asset / Offering</th>
                <th>法定权益</th>
                <th>Token 持有</th>
                <th>法定登记</th>
                <th>锁仓状态</th>
                <th>对账</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const inv = state.investors.find((i) => i.id === h.investorId);
                const off = state.offerings.find((o) => o.id === h.offeringId);
                return (
                  <tr key={h.id} onClick={() => setDrawer({ type: "holder-detail", id: h.id })}>
                    <td>
                      <b>{inv?.name}</b>
                      <small>{h.id}</small>
                      {h.environment === "Sandbox" && <small>Sandbox Mock · {h.source}</small>}
                    </td>
                    <td>
                      {off?.name}
                      <small>{h.offeringId}</small>
                    </td>
                    <td>
                      <b>{h.rights.toLocaleString()}</b>
                      <small>权益单位</small>
                    </td>
                    <td>
                      <b>{h.tokens.toLocaleString()}</b>
                      <small>Token</small>
                    </td>
                    <td>
                      <Status value={h.registration} />
                    </td>
                    <td>
                      <Status value={h.registration === "模拟已清偿" && h.tokens === 0 ? "已结束" : h.lock} />
                      {h.registration !== "模拟已清偿" && <small>至 {h.lockUntil || "—"}</small>}
                    </td>
                    <td>
                      <Status value={h.reconciliation} />
                    </td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <Empty
              title="暂无持有人记录"
              text="认购订单完成付款匹配与配售后，还需完成法定登记才会形成持有人记录。"
            />
          )}
        </div>
      </div>
      <div className="info-bar"><ShieldCheck size={17} /><span>Record Date 快照：{state.holderSnapshots.length} 份；仅纳入登记生效且日期不晚于 Record Date 的 Sandbox 持有人。快照一经固定不随当前名单变化。</span></div>
      {state.holderSnapshots.length > 0 && <div className="card" style={{ padding: 20 }}><h3>已固定的持有人快照</h3>{state.holderSnapshots.map(snapshot => <p key={snapshot.id} className="body-copy">{snapshot.id} · {snapshot.offeringId} · Record Date {snapshot.recordDate} · {snapshot.lines.length} 人 · 权益合计 {snapshot.lines.reduce((sum, line) => sum + line.rights, 0).toLocaleString()} · Sandbox Mock</p>)}</div>}
    </div>
  );
}

function FundsPage({
  state,
  tab,
  setDrawer,
  toast,
}: {
  state: AppState;
  tab: string;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  const [search, setSearch] = useState("");
  if (tab === "收款与对账")
    return (
      <div>
        <PageHeader
          eyebrow="FUNDS & RECONCILIATION"
          title="收款与对账"
          description="投资者付款网络固定为 OP Mainnet / USDT；到账不等于已完成企业结算。"
          actions={
            <Button variant="secondary" onClick={() => toast("对账任务已运行，无记录被自动更改")}>
              <RefreshCcw size={16} />
              运行对账
            </Button>
          }
        />
        <div className="metric-grid small">
          <div className="metric">
            <span>应收总额</span>
            <strong>{formatU(state.payments.reduce((n, p) => n + p.expected, 0))}</strong>
          </div>
          <div className="metric">
            <span>实收总额</span>
            <strong>{formatU(state.payments.reduce((n, p) => n + p.received, 0))}</strong>
          </div>
          <div className="metric">
            <span>最终匹配</span>
            <strong>{state.payments.filter((p) => p.status === "最终匹配").length}</strong>
          </div>
          <div className="metric">
            <span>异常待处理</span>
            <strong>{state.payments.filter((p) => p.status === "金额不符").length}</strong>
          </div>
        </div>
        <div className="card table-card">
          <Toolbar search={search} setSearch={setSearch} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>付款引用</th>
                  <th>订单</th>
                  <th>应收</th>
                  <th>实收</th>
                  <th>网络 / 资产</th>
                  <th>付款状态</th>
                  <th>时间</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.payments
                  .filter((p) => (p.id + p.orderId).includes(search))
                  .map((p) => (
                    <tr key={p.id} onClick={() => setDrawer({ type: "payment-detail", id: p.id })}>
                      <td>
                        <b>{p.id}</b>
                        <small>模拟交易引用</small>
                      </td>
                      <td>{p.orderId}</td>
                      <td>{formatU(p.expected)}</td>
                      <td>
                        <b>{formatU(p.received)}</b>
                      </td>
                      <td>
                        OP Mainnet<small>USDT</small>
                      </td>
                      <td>
                        <Status value={p.status} />
                      </td>
                      <td>{p.time}</td>
                      <td>
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!state.payments.length && (
              <Empty
                title="暂无收款记录"
                text="当前没有投资者付款。需先有 Standard 套餐下的认购订单，再由 Mock 控制台模拟付款事件。"
              />
            )}
          </div>
        </div>
      </div>
    );
  if (tab === "退款与异常")
    return (
      <div>
        <PageHeader
          eyebrow="REFUNDS & EXCEPTIONS"
          title="退款与异常"
          description="异常先回到原始付款与订单核查；Unknown 状态不会直接重试以避免重复退款。"
        />
        <div className="card table-card">
          {state.payments.filter((p) => !["最终匹配", "待付款"].includes(p.status)).length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>异常编号</th>
                    <th>关联订单</th>
                    <th>异常来源</th>
                    <th>应退 / 差额</th>
                    <th>处理状态</th>
                    <th>建议动作</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.payments
                    .filter((p) => !["最终匹配", "待付款"].includes(p.status))
                    .map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setDrawer({ type: "payment-detail", id: p.id })}
                      >
                        <td>
                          <b>EXC-{p.id.slice(-4)}</b>
                          <small>{p.id}</small>
                        </td>
                        <td>{p.orderId}</td>
                        <td>
                          <Status value={p.status} />
                        </td>
                        <td>{formatU(Math.abs(p.expected - p.received))}</td>
                        <td>
                          <Status value="待人工核对" />
                        </td>
                        <td>查询原付款处理</td>
                        <td>
                          <ChevronRight size={15} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="暂无退款或异常" text="异常付款、迟到账与退款记录会显示在这里。" />
          )}
        </div>
      </div>
    );
  const settlement = state.offerings.map((o) => {
    const ops = state.orders.filter((x) => x.offeringId === o.id);
    const ps = state.payments.filter(
      (p) => ops.some((x) => x.id === p.orderId) && p.status === "最终匹配",
    );
    return { o, amount: ps.reduce((n, p) => n + p.received, 0) };
  });
  return (
    <div>
      <PageHeader
        eyebrow="SETTLEMENT"
        title="募集款结算"
        description="按 Offering 汇总确认到账、受限金额和可结算金额，并独立跟踪结算批次。"
      />
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Offering</th>
                <th>确认到账</th>
                <th>受限金额</th>
                <th>可结算</th>
                <th>最终收款钱包</th>
                <th>结算状态</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {settlement.map(({ o, amount }) => (
                <tr key={o.id} onClick={() => setDrawer({ type: "offering-detail", id: o.id })}>
                  <td>
                    <b>{o.name}</b>
                    <small>{o.id}</small>
                  </td>
                  <td>{formatU(amount)}</td>
                  <td>{formatU(amount * 0.1)}</td>
                  <td>
                    <b>{formatU(amount * 0.9)}</b>
                  </td>
                  <td>{state.wallets.find((w) => w.id === o.walletId)?.name || "未选择"}</td>
                  <td>
                    <Status value={amount ? "可申请结算" : "等待资金"} />
                  </td>
                  <td>
                    <ChevronRight size={15} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!settlement.length && (
            <Empty
              title="暂无募集款结算"
              text="当前没有 Offering。先完成 Asset、Instrument 和 Offering 草稿准备；最终匹配到账后才会出现可结算金额。"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TokenPage({
  state,
  tab,
  setDrawer,
  toast,
}: {
  state: AppState;
  tab: string;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  if (tab === "合约管理")
    return (
      <div>
        <PageHeader
          eyebrow="TOKEN CONTRACTS"
          title="合约管理"
          description="Token 部署网络与投资者 USDT 付款网络相互独立；所有地址均为虚构演示标识。"
          actions={
            <Button
              disabled={state.plan !== "Standard"}
              onClick={() =>
                toast(
                  state.plan === "Standard"
                    ? "模拟部署申请已创建，不会发起真实链上交易"
                    : "Free 不允许执行模拟部署；可继续准备 Asset、Instrument 和 Offering",
                )
              }
            >
              <Plus size={16} />
              模拟部署申请
            </Button>
          }
        />
        <div className="contract-grid">
          {state.offerings.map((o, i) => {
            const ins = state.instruments.find((x) => x.id === o.instrumentId);
            return (
              <div className="card contract" key={o.id}>
                <div className="contract-top">
                  <div className="token-symbol">{["BJO", "BJ2", "NWH", "YHD"][i] || "RWA"}</div>
                  <Status value={o.contractStatus || "未申请"} />
                </div>
                <h3>{o.name} Token</h3>
                <p>
                  {o.id} · {ins?.id}
                </p>
                <div className="contract-stats">
                  <span>
                    <small>标准</small>
                    <b>ERC-3643 · 演示</b>
                  </span>
                  <span>
                    <small>授权总量</small>
                    <b>{o.tokens.toLocaleString()}</b>
                  </span>
                  <span>
                    <small>模拟网络</small>
                    <b>{o.contractStatus === "模拟已部署" ? "Polygon PoS · 模拟" : "尚未部署"}</b>
                  </span>
                  <span>
                    <small>已交付</small>
                    <b>
                      {state.tokens
                        .filter((t) => t.offeringId === o.id && t.status === "最终确认")
                        .reduce((n, t) => n + t.amount, 0)
                        .toLocaleString()}
                    </b>
                  </span>
                </div>
                <button onClick={() => setDrawer({ type: "offering-detail", id: o.id })}>
                  查看关联发行 <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
          {!state.offerings.length && (
            <Empty
              icon={Token}
              title="暂无 Token 合约记录"
              text="当前没有 Offering。先完成 Asset、Instrument 与 Offering 准备并通过发行确认，才可申请模拟部署。"
            />
          )}
        </div>
      </div>
    );
  if (tab === "Token 操作")
    return (
      <div>
        <PageHeader
          eyebrow="CONTROLLED OPERATIONS"
          title="Token 操作"
          description="Mint、交付、Burn 与限制操作受配售、付款和容量守卫控制，不允许从此页面伪造业务前置状态。"
          actions={
            <Button
              variant="secondary"
              disabled={state.plan !== "Standard"}
              onClick={() => toast("请选择已满足守卫的订单发起操作")}
            >
              <Zap size={16} />
              新建受控操作
            </Button>
          }
        />
        <div className="card table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>操作记录</th>
                  <th>类型</th>
                  <th>业务来源</th>
                  <th>Token 数量</th>
                  <th>模拟链状态</th>
                  <th>事件时间</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.tokens.map((t) => (
                  <tr key={t.id} onClick={() => setDrawer({ type: "token-detail", id: t.id })}>
                    <td>
                      <b>{t.id}</b>
                      <small>{t.tx}</small>
                    </td>
                    <td>{t.operation}</td>
                    <td>
                      {t.orderId}
                      <small>{t.offeringId}</small>
                    </td>
                    <td>
                      <b>{t.amount.toLocaleString()}</b>
                    </td>
                    <td>
                      <Status value={t.status} />
                    </td>
                    <td>{t.time}</td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!state.tokens.length && (
              <Empty
                icon={Token}
                title="暂无 Token 操作"
                text="当前没有 Mint 或交付记录。需先完成 Standard 下的认购、最终付款匹配和配售，再执行受控 Mock 操作。"
              />
            )}
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <PageHeader
        eyebrow="ON-CHAIN RECONCILIATION"
        title="链上记录与对账"
        description="将业务 Intent、模拟链最终性和持有人登记差异放在同一视图中，但不自动合并状态。"
      />
      <div className="info-bar">
        <AlertCircle size={17} />
        <span>交易哈希与网络结果均为演示虚构标识，不代表任何真实链上事实。</span>
      </div>
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>交易 / Intent</th>
                <th>来源</th>
                <th>网络</th>
                <th>最终性</th>
                <th>登记 / Token 对账</th>
                <th>结果</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.tokens.map((t) => {
                const h = state.holders.find((h) => h.orderId === t.orderId);
                return (
                  <tr key={t.id}>
                    <td>
                      <b>{t.tx}</b>
                      <small>{t.id}</small>
                    </td>
                    <td>{t.orderId}</td>
                    <td>
                      Polygon PoS<small>模拟 Token 网络</small>
                    </td>
                    <td>
                      <Status value={t.status} />
                    </td>
                    <td>
                      {h ? `${h.rights.toLocaleString()} / ${h.tokens.toLocaleString()}` : "待登记"}
                    </td>
                    <td>
                      <Status value={h?.reconciliation || "待确认"} />
                    </td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!state.tokens.length && (
            <Empty
              title="暂无链上对账记录"
              text="模拟 Token 操作产生最终性记录后，才会在此与法定登记和持有人余额进行对账。"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RevenuePage({
  state,
  tab,
  setState,
  setDrawer,
  toast,
}: {
  state: AppState;
  tab: string;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  const startDistribution = () => {
    if (state.plan !== "Standard")
      return toast(
        `当前套餐为 ${state.plan}：Free 可准备 Asset / Instrument / Offering，但不能进行收益运营`,
      );
    setDrawer({ type: tab === "存续管理" ? "rent-report-create" : "rent-batch-create" });
  };
  if (tab === "存续管理")
    return (
      <div>
        <PageHeader
          eyebrow="LIFECYCLE"
          title="存续管理"
          description="按权益类型管理应披露事项、实际收益上报与到期提醒；预期年化不参与实际计算。"
          actions={
            <Button onClick={startDistribution}>
              <Plus size={16} />
              上报住宅净租金
            </Button>
          }
        />
        <div className="lifecycle-grid">
          {state.offerings
            .filter((o) => o.status !== "草稿")
            .map((o) => {
              const ins = state.instruments.find((i) => i.id === o.instrumentId);
              return (
                <div className="card lifecycle" key={o.id}>
                  <div>
                    <Status value={o.status} />
                    <span>{ins?.type}</span>
                  </div>
                  <h3>{o.name}</h3>
                  <p>
                    {ins?.type === "债权"
                      ? `${ins.terms?.frequency || "付息频率未设置"} · ${ins.terms?.repayment || "还本方式未设置"}`
                      : ins?.type === "股权"
                        ? "合法股息 · 依公司决议"
                        : `租金收益参与 · ${ins?.terms?.frequency || "频率未设置"}`}
                  </p>
                  <div className="progress-row">
                    <span>存续进度</span>
                    <b>{o.status === "已结束" ? "68%" : "24%"}</b>
                  </div>
                  <div className="thin-progress">
                    <i style={{ width: o.status === "已结束" ? "68%" : "24%" }} />
                  </div>
                  <button onClick={() => setDrawer({ type: "offering-detail", id: o.id })}>
                    查看存续详情 <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          {!state.offerings.some((offering) => offering.status !== "草稿") && (
            <Empty
              title="暂无存续项目"
              text="当前没有已确认的 Offering。完成发行确认后，项目期限、收益事件和到期事项会显示在这里。"
            />
          )}
        </div>
        <div className="card table-card"><h3 style={{ padding: 20 }}>住宅租金上报</h3><div className="table-wrap"><table><thead><tr><th>上报编号</th><th>Offering／周期</th><th>Record Date</th><th>可分配净额</th><th>证明</th><th>状态／下一步</th></tr></thead><tbody>{state.rentReports.map(report => <tr key={report.id}><td>{report.id}</td><td>{report.offeringId} · {report.period}</td><td>{report.recordDate}</td><td>{formatU(report.netU)}</td><td>{report.proofFile.name} · {report.proofFile.status}</td><td><Status value={report.status} /> {report.status === "待确认" && <Button variant="secondary" onClick={() => setState(current => { const result = confirmRentReport(current, report.id, new Date().toISOString()); queueMicrotask(() => toast(result.error || (result.changed ? "租金上报已确认；可创建分配批次" : "该上报已确认"))); return result.state; })}>确认租金上报</Button>}{report.status === "资料待扫描" && <small>下一步：测试控制区扫描证明文件</small>}</td></tr>)}</tbody></table>{!state.rentReports.length && <Empty title="暂无住宅租金上报" text="先上传实际租金收入证明并上报本期可分配净额。" />}</div></div>
        <DebtLifecyclePanel state={state} setState={setState} setDrawer={setDrawer} toast={toast} />
      </div>
    );
  if (tab === "收益分配")
    return (
      <div>
        <PageHeader
          eyebrow="DISTRIBUTIONS"
          title="收益分配"
          description="以 Record Date 法定名册为基准，按实际合法权益数量进行可解释的模拟计算。"
          actions={
            <Button onClick={startDistribution}>
              <Plus size={16} />
              创建住宅租金批次
            </Button>
          }
        />
        <div className="card table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>分配批次</th>
                  <th>Offering / 周期</th>
                  <th>Record Date</th>
                  <th>收益总额</th>
                  <th>收款人数</th>
                  <th>注资 / 支付状态</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.distributions.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setDrawer({ type: "distribution-detail", id: d.id })}
                  >
                    <td>
                      <b>{d.id}</b>
                      <small>{d.eventType || "历史收益"} · 模拟批次</small>
                    </td>
                    <td>
                      {state.offerings.find((o) => o.id === d.offeringId)?.name}
                      <small>{d.period}</small>
                    </td>
                    <td>{d.recordDate}</td>
                    <td>
                      <b>{formatU6(d.gross)}</b>
                    </td>
                    <td>{d.recipients} 名</td>
                    <td>
                      <Status value={d.status} />{d.paymentStatus && <small>支付：{d.paymentStatus}</small>}
                    </td>
                    <td>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!state.distributions.length && (
              <Empty
                title="暂无收益分配批次"
                text="需先有已确认 Offering、有效法定持有人和 Record Date 快照；租金批次还需实际收入证明。"
              />
            )}
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <PageHeader
        eyebrow="MATURITY & EXIT"
        title="到期与退出"
        description="分别呈现债权还本、股权退出与收益权到期，不把 Burn 自动视为法律义务履行。"
      />
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>权益 / Offering</th>
                <th>退出类型</th>
                <th>预计到期</th>
                <th>原始本金 / 权益</th>
                <th>已偿还本金</th>
                <th>剩余未偿本金</th>
                <th>授权状态</th>
                <th>资金执行</th>
                <th>Token 处置</th>
              </tr>
            </thead>
            <tbody>
              {state.offerings.map((o) => {
                const ins = state.instruments.find((i) => i.id === o.instrumentId);
                const originalPrincipal =
                  ins?.type === "债权"
                    ? Number(ins.terms?.principal || ins.totalRights || 0)
                    : 0;
                const paidPrincipal =
                  ins?.type === "债权"
                    ? paidDebtPrincipal(state, o.id)
                    : 0;
                const outstandingPrincipal = Math.max(0, originalPrincipal - paidPrincipal);
                const principalStatus =
                  ins?.type !== "债权"
                    ? "按权益条款"
                    : outstandingPrincipal === 0 && originalPrincipal > 0
                      ? "已结清"
                      : paidPrincipal > 0
                        ? "部分偿还"
                        : "未开始";
                return (
                  <tr key={o.id}>
                    <td>
                      <b>{o.name}</b>
                      <small>{ins?.type}</small>
                    </td>
                    <td>{ins?.type === "债权" ? "到期还本付息" : "权益退出 / 续期"}</td>
                    <td>{String(ins?.terms?.maturityDate || "权益到期日未设置")}</td>
                    <td>
                      {ins?.type === "债权"
                        ? formatU(originalPrincipal)
                        : `${ins?.totalRights.toLocaleString()} ${ins?.unit}`}
                    </td>
                    <td>{ins?.type === "债权" ? formatU(paidPrincipal) : "—"}</td>
                    <td>
                      {ins?.type === "债权" ? (
                        <b>{formatU(outstandingPrincipal)}</b>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <Status value={principalStatus} />
                    </td>
                    <td>
                      {ins?.type === "债权" ? principalStatus : "未开始"}
                    </td>
                    <td>{ins?.type === "债权" ? state.debtCompletions.some(row => row.offeringId === o.id)
                      ? "Sandbox 清偿完成" : state.tokens.some(row => row.offeringId === o.id && row.operation === "到期模拟处置")
                        ? "Sandbox 已处置" : "待模拟处置" : "未开始"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <DebtMaturityPanel state={state} setDrawer={setDrawer} toast={toast} />
    </div>
  );
}

function DebtLifecyclePanel({ state, setState, setDrawer, toast }: {
  state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (d: Drawer) => void; toast: (s: string) => void;
}) {
  const debts = state.offerings.filter(offering => state.instruments.some(instrument =>
    instrument.id === offering.instrumentId && instrument.type === "债权"));
  if (!debts.length) return null;
  return <div className="card table-card" style={{ marginTop: 20 }}>
    <h3 style={{ padding: 20 }}>债权月度付息计划 · Actual/365 Fixed</h3>
    {debts.map(offering => {
      const schedule = state.debtSchedules.find(row => row.offeringId === offering.id);
      const events = state.debtInterestEvents.filter(row => row.offeringId === offering.id);
      return <div key={offering.id} style={{ padding: 20 }}>
        <p className="body-copy"><b>{offering.id} · {offering.name}</b> · 当前：{schedule ? `固定计划 ${schedule.id}，${events.length} 期` : "未生成付息计划"}；下一步：{schedule ? "按应付日固定快照并创建月息批次" : "生成固定计划"}</p>
        {!schedule && <Button variant="secondary" onClick={() => setState(current => {
          const result = createDebtSchedule(current, offering.id, new Date().toISOString());
          queueMicrotask(() => toast(result.error || (result.changed ? "债权付息计划已生成；每期应付事件可查询" : "计划已有记录")));
          return result.state;
        })}>生成债权付息计划</Button>}
        {schedule && <div className="table-wrap"><table><thead><tr><th>周期／计息天数</th><th>应付日／Record Date</th><th>应付利息</th><th>快照</th><th>批次／支付</th><th>下一步</th></tr></thead><tbody>
          {events.map(event => {
            const batch = state.distributions.find(row => row.interestEventId === event.id);
            const snapshot = state.holderSnapshots.find(row => row.offeringId === offering.id && row.recordDate === event.recordDate);
            return <tr key={event.id}><td>{event.period} · {event.days} 天</td><td>{event.dueDate}<small>Record Date {event.recordDate}</small></td>
              <td>{formatU6(event.amount)}</td><td>{snapshot?.id || "未固定"}</td><td>{batch ? `${batch.id} · ${batch.status} · ${batch.paymentStatus || "未发起"}` : "尚无批次"}</td>
              <td>{batch ? <Button variant="secondary" onClick={() => setDrawer({ type: "distribution-detail", id: batch.id })}>查看批次</Button>
                : <Button variant="secondary" onClick={() => setDrawer({ type: "debt-interest-create", id: offering.id, eventId: event.id })}>创建月息批次</Button>}</td></tr>;
          })}
        </tbody></table></div>}
      </div>;
    })}
  </div>;
}

function DebtMaturityPanel({ state, setDrawer, toast }: { state: AppState; setDrawer: (d: Drawer) => void; toast: (s: string) => void }) {
  const debts = state.debtSchedules;
  if (!debts.length) return null;
  return <div className="card table-card" style={{ marginTop: 20, padding: 20 }}>
    <h3>独立本金偿还与模拟清偿</h3>
    {debts.map(schedule => {
      const batch = state.distributions.find(row => row.offeringId === schedule.offeringId && row.eventType === "债权本金" && row.debtScheduleId === schedule.id);
      const completion = state.debtCompletions.find(row => row.offeringId === schedule.offeringId);
      const settled = state.holders.filter(row => row.offeringId === schedule.offeringId && row.registration === "模拟已清偿");
      const disposed = state.tokens.filter(row => row.offeringId === schedule.offeringId && row.operation === "到期模拟处置");
      return <div key={schedule.id} className="body-copy" style={{ marginTop: 16 }}>
        <b>{schedule.offeringId}</b> · 到期 {schedule.maturityDate} · 本金 {formatU6(schedule.principal)} · 本金批次 {batch ? `${batch.id}／${batch.status}／${batch.paymentStatus || "未发起"}` : "未创建"} · 名册已更新 {settled.length} 人 · Token 已处置 {disposed.length} 笔 · {completion ? "Sandbox 模拟清偿完成" : "尚有未结事项"}
        <div className="control-row">{!batch ? <Button variant="secondary" onClick={() => setDrawer({ type: "debt-principal-create", id: schedule.offeringId })}>创建到期本金偿还批次</Button>
          : <Button variant="secondary" onClick={() => setDrawer({ type: "distribution-detail", id: batch.id })}>查看本金批次</Button>}</div>
        {!completion && <small>下一步：付清全部月息与本金；在演示控制台更新名册、处置 Token、确认模拟清偿。{state.sandboxClock < schedule.maturityDate ? `当前测试日期 ${state.sandboxClock} 早于到期日。` : ""}</small>}
      </div>;
    })}
    <p className="body-copy">本金偿还不计入投资者累计收益；Sandbox 结果不代表真实资金清偿。</p>
  </div>;
}

function ReportsPage({ state, tab }: { state: AppState; tab: string }) {
  const [search, setSearch] = useState("");
  if (tab === "操作记录")
    return (
      <div>
        <PageHeader
          eyebrow="AUDIT LOG"
          title="操作记录"
          description="记录草稿保存、编辑、检查、确认和关键企业操作；纯浏览、筛选和取消不会写入记录。"
          actions={
            <Button variant="secondary">
              <Upload size={16} />
              导出脱敏记录
            </Button>
          }
        />
        <div className="info-bar">
          <ShieldCheck size={17} />
          <span>
            操作记录来自当前浏览器本地状态。场景预置记录会明确标记，不能作为真实生产审计证据。
          </span>
        </div>
        <div className="card table-card">
          <Toolbar search={search} setSearch={setSearch} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>模块</th>
                  <th>业务对象</th>
                  <th>动作</th>
                  <th>结果</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
                {operationRows(state)
                  .filter((a) => (a.object + a.module + a.action).includes(search))
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.time}</td>
                      <td>{a.module}</td>
                      <td>
                        <b>{a.object}</b>
                      </td>
                      <td>{a.action}</td>
                      <td>
                        <Status value={a.result} />
                      </td>
                      <td>
                        demo@rwa.example
                        <small>
                          {a.id.startsWith("MOCK-")
                            ? "Mock 业务事件"
                            : /^ACT-0\d+$/.test(a.id)
                              ? "演示场景预置"
                              : "浏览器本地操作"}
                        </small>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!operationRows(state).length && (
              <Empty
                title="暂无操作记录"
                text="保存企业、资产、权益或 Offering 草稿，或执行检查与确认后，记录会出现在这里。"
              />
            )}
          </div>
        </div>
      </div>
    );
  const raised = state.payments
    .filter((p) => p.status === "最终匹配")
    .reduce((n, p) => n + p.received, 0);
  const categoryColors = ["#2856c7", "#6d54c7", "#d58a2d", "#2f8b69", "#8b5d48"];
  const categoryCounts = Object.entries(
    state.assets.reduce<Record<string, number>>((counts, asset) => {
      counts[asset.category] = (counts[asset.category] || 0) + 1;
      return counts;
    }, {}),
  );
  let categoryCursor = 0;
  const categoryGradient = categoryCounts.length
    ? `conic-gradient(${categoryCounts
        .map(([, count], index) => {
          const start = categoryCursor;
          categoryCursor += (count / state.assets.length) * 100;
          return `${categoryColors[index % categoryColors.length]} ${start}% ${categoryCursor}%`;
        })
        .join(",")})`
    : "#edf0f4";
  const orderCount = state.orders.length;
  const funnelRows = [
    ["提交订单", orderCount],
    ["付款最终匹配", state.payments.filter((p) => p.status === "最终匹配").length],
    ["完成配售", state.holders.length],
    ["Token 最终交付", state.tokens.filter((t) => t.status === "最终确认").length],
  ] as const;
  return (
    <div>
      <PageHeader
        eyebrow="BUSINESS INTELLIGENCE"
        title="业务报表"
        description="基于当前企业业务记录聚合，不创建第二份账本。"
        actions={
          <Button variant="secondary">
            <Upload size={16} />
            导出脱敏报表
          </Button>
        }
      />
      <div className="report-filters">
        <select>
          <option>全部 Asset</option>
          {state.assets.map((a) => (
            <option key={a.id}>{a.name}</option>
          ))}
        </select>
        <select>
          <option>全部 Offering</option>
          {state.offerings.map((o) => (
            <option key={o.id}>{o.name}</option>
          ))}
        </select>
        <select>
          <option>最近 12 个月</option>
        </select>
      </div>
      <div className="metric-grid">
        <div className="metric">
          <span>约定价格 / 债权规模</span>
          <strong>
            {formatU(state.assets.reduce((n, asset) => n + assetAgreedValueU(asset), 0))}
          </strong>
          <small>{state.assets.length} 项资产 · 不等于第三方评估</small>
        </div>
        <div className="metric">
          <span>目标募资总额</span>
          <strong>{formatU(state.offerings.reduce((n, o) => n + o.tokens * o.price, 0))}</strong>
          <small>{state.offerings.length} 个期次</small>
        </div>
        <div className="metric">
          <span>最终匹配资金</span>
          <strong>{formatU(raised)}</strong>
          <small>有付款证据</small>
        </div>
        <div className="metric">
          <span>已交付 Token</span>
          <strong>
            {state.tokens
              .filter((t) => t.status === "最终确认")
              .reduce((n, t) => n + t.amount, 0)
              .toLocaleString()}
          </strong>
          <small>模拟最终确认</small>
        </div>
      </div>
      <div className="report-grid">
        <div className="card donut-card">
          <div className="card-title">
            <span>资产类别分布</span>
          </div>
          <div className="donut" style={{ background: categoryGradient }}>
            <div>
              <b>{state.assets.length}</b>
              <small>资产</small>
            </div>
          </div>
          <div className="donut-legend">
            {categoryCounts.map(([category, count], index) => (
              <span key={category}>
                <i style={{ background: categoryColors[index % categoryColors.length] }} />
                {category}{" "}
                <b>{state.assets.length ? Math.round((count / state.assets.length) * 100) : 0}%</b>
              </span>
            ))}
          </div>
        </div>
        <div className="card funnel">
          <div className="card-title">
            <span>认购转化漏斗</span>
          </div>
          {funnelRows.map((x) => (
            <div className="funnel-row" key={String(x[0])}>
              <span>{x[0]}</span>
              <div>
                <i
                  style={{
                    width: `${orderCount ? Math.min(100, (Number(x[1]) / orderCount) * 100) : 0}%`,
                  }}
                />
              </div>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyPage({
  state,
  tab,
  setState,
  setDrawer,
  toast,
}: {
  state: AppState;
  tab: string;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (d: Drawer) => void;
  toast: (s: string) => void;
}) {
  if (tab === "企业资料与 KYB") return <Kyb state={state} setState={setState} toast={toast} />;
  if (tab === "钱包管理")
    return (
      <div>
        <PageHeader
          eyebrow="TREASURY WALLETS"
          title="钱包管理"
          description="管理原型 MPC 钱包与自有钱包验证；不会请求私钥、助记词或真实签名。"
          actions={
            <Button onClick={() => setDrawer({ type: "wallet-create" })}>
              <Plus size={16} />
              绑定自有钱包
            </Button>
          }
        />
        <div className="info-bar">
          <ShieldCheck size={17} />
          <span>每个 Offering 固定引用选定的钱包。切换企业默认钱包不会改写历史 Offering。</span>
        </div>
        <div className="wallet-grid">
          {state.wallets.map((w) => (
            <div className="card wallet-card" key={w.id}>
              <div className="wallet-head">
                <div className="wallet-icon">
                  <WalletCards size={20} />
                </div>
                <div>
                  <b>{w.name}</b>
                  <small>{w.type}</small>
                </div>
                {w.isDefault && <span className="default">默认</span>}
              </div>
              <div className="address">
                {w.address.slice(0, 10)}••••{w.address.slice(-8)}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(w.address);
                    toast("演示钱包地址已复制");
                  }}
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="wallet-meta">
                <span>
                  <small>网络</small>
                  <b>{w.network}</b>
                </span>
                <span>
                  <small>验证状态</small>
                  <Status value={w.status} />
                </span>
              </div>
              <div className="wallet-actions">
                <Button
                  variant="ghost"
                  onClick={() => setDrawer({ type: "wallet-detail", id: w.id })}
                >
                  查看详情
                </Button>
                {!w.isDefault && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setState((s) => ({
                        ...s,
                        wallets: s.wallets.map((x) => ({ ...x, isDefault: x.id === w.id })),
                        activities: [
                          newActivity("企业管理", w.id, "设为企业默认钱包"),
                          ...s.activities,
                        ],
                      }));
                      toast("默认钱包已切换，不影响现有 Offering");
                    }}
                  >
                    设为默认
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!state.wallets.length && (
            <Empty
              icon={WalletCards}
              title="尚无企业钱包"
              text="KYB 通过后可模拟生成 MPC 钱包，或绑定自有钱包。"
              action={
                <Button onClick={() => setDrawer({ type: "wallet-create" })}>创建原型钱包</Button>
              }
            />
          )}
        </div>
      </div>
    );
  return <Subscription state={state} setState={setState} toast={toast} />;
}

function Kyb({
  state,
  setState,
  toast,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  toast: (s: string) => void;
}) {
  const [step, setStep] = useState(state.kybStep || 1);
  const [company, setCompany] = useState(
    state.company || {
      name: "",
      type: "有限公司",
      country: "",
      registration: "",
      address: "",
      website: "",
      industry: "房地产",
      description: "",
      representative: "",
      contact: "",
      email: "",
    },
  );
  const [checks, setChecks] = useState([false, false]);
  const labels = ["企业基本信息", "企业业务信息", "关联人员", "证明材料", "预览确认"];
  const save = (msg = "草稿已保存") => {
    setState((s) => ({
      ...s,
      company: { ...company },
      kybStatus: s.kybStatus === "未创建" ? "草稿" : s.kybStatus,
      kybStep: step,
      activities: [
        newActivity("企业管理", company.registration || "企业草稿", "保存企业 / KYB 草稿"),
        ...s.activities,
      ],
    }));
    toast(msg);
  };
  const next = () => {
    if (
      step === 1 &&
      (!company.name || !company.country || !company.registration || !company.address)
    )
      return toast("请完成本步骤所有必填字段");
    if (step === 2 && (!company.industry || !company.description))
      return toast("请填写行业与主营业务简介");
    if (step === 3 && (!company.representative || !company.contact || !company.email))
      return toast("请至少填写一位授权代表和业务联系人");
    if (step === 4 && state.kybFiles.length === 0) return toast("请上传企业注册证明");
    save("进度已自动保存");
    setStep(Math.min(5, step + 1));
  };
  const fill = () => {
    const merged = Object.fromEntries(
      Object.entries(companyDemo).map(([key, value]) => [
        key,
        company[key as keyof typeof company] || value,
      ]),
    ) as typeof company;
    setCompany(merged);
    setState((s) => ({
      ...s,
      company: merged,
      kybFiles: s.kybFiles.length
        ? s.kybFiles
        : [
            "DEMO_Business_License.pdf",
            "DEMO_Company_Registration.pdf",
            "DEMO_UBO_Declaration.pdf",
          ],
      kybStatus: "草稿",
    }));
    toast("已仅填充空字段，现有企业资料未被覆盖");
  };
  const submit = () => {
    if (!checks.every(Boolean)) return toast("请勾选两项声明后提交");
    setState((s) => ({
      ...s,
      company: { ...company },
      kybStatus: "审核中",
      kybStep: 5,
      kybApplication: `KYB-DEMO-${Date.now().toString().slice(-6)}`,
      activities: [
        newActivity("企业管理", company.registration, "提交 KYB 模拟审核", "审核中"),
        ...s.activities,
      ],
    }));
    toast("模拟 KYB 已提交，可在演示控制台切换审核结果");
  };
  if (state.kybStatus === "已通过")
    return (
      <div>
        <PageHeader
          eyebrow="COMPANY & KYB"
          title="企业资料与 KYB"
          description="查看企业主体资料、认证状态与已提交版本。"
        />
        <div className="kyb-approved">
          <div className="approved-icon">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="eyebrow">KYB VERIFIED · DEMO</div>
            <h2>{state.company?.name}</h2>
            <p>
              模拟审核已通过，当前套餐为 {state.plan}
              。此状态仅用于原型业务演示，不代表真实合规认证或生产准入。
            </p>
            <div className="approved-meta">
              <span>
                <small>申请编号</small>
                <b>{state.kybApplication}</b>
              </span>
              <span>
                <small>注册国家 / 地区</small>
                <b>{state.company?.country}</b>
              </span>
              <span>
                <small>注册编号</small>
                <b>{state.company?.registration}</b>
              </span>
              <span>
                <small>认证状态</small>
                <Status value="已通过" />
              </span>
            </div>
          </div>
        </div>
        <div className="card submitted">
          <div className="card-title">
            <span>已提交资料摘要</span>
            <Button
              variant="secondary"
              onClick={() => toast("已载入新版本草稿；历史提交不会被覆盖")}
            >
              创建更正版本
            </Button>
          </div>
          <div className="detail-grid">
            <span>
              <small>企业类型</small>
              <b>{state.company?.type}</b>
            </span>
            <span>
              <small>所属行业</small>
              <b>{state.company?.industry}</b>
            </span>
            <span>
              <small>授权代表</small>
              <b>{state.company?.representative}</b>
            </span>
            <span>
              <small>业务联系人</small>
              <b>{state.company?.contact}</b>
            </span>
            <span>
              <small>注册地址</small>
              <b>{state.company?.address}</b>
            </span>
            <span>
              <small>证明材料</small>
              <b>{state.kybFiles.length} 份</b>
            </span>
          </div>
        </div>
      </div>
    );
  return (
    <div>
      <PageHeader
        eyebrow="COMPANY ONBOARDING"
        title={state.company ? "继续企业认证" : "创建并认证企业"}
        description="五步完成企业 KYB；草稿自动保存在当前浏览器，可随时返回修改。"
        actions={
          <Button variant="secondary" onClick={fill}>
            <Sparkles size={16} />
            一键填充演示资料
          </Button>
        }
      />
      {["待补件", "未通过", "审核中"].includes(state.kybStatus) && (
        <div className={`banner ${state.kybStatus === "未通过" ? "danger" : "warning"}`}>
          <AlertCircle size={18} />
          <div>
            <b>当前申请：{state.kybStatus}</b>
            <p>
              {state.kybStatus === "待补件"
                ? "请补充股权控制资料并重新提交。"
                : state.kybStatus === "未通过"
                  ? "登记信息与证明材料不一致，请更正后重新提交。"
                  : "申请已提交，您可通过演示控制台模拟审核结果。"}
            </p>
          </div>
          {state.kybApplication && <span>{state.kybApplication}</span>}
        </div>
      )}
      <div className="kyb-layout">
        <div className="kyb-steps">
          {labels.map((l, i) => (
            <button
              key={l}
              className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}
              onClick={() => setStep(i + 1)}
            >
              <span>{step > i + 1 ? <Check size={14} /> : i + 1}</span>
              <div>
                <small>步骤 {i + 1}</small>
                <b>{l}</b>
              </div>
            </button>
          ))}
        </div>
        <div className="card kyb-form">
          <div className="step-title">
            <span>0{step}</span>
            <div>
              <h2>{labels[step - 1]}</h2>
              <p>
                {
                  [
                    "确认企业法定登记信息。",
                    "描述主营业务及监管情况。",
                    "识别授权代表、联系人和最终控制人。",
                    "上传本地演示文件，不会发送到外部服务。",
                    "核对全部资料并完成授权声明。",
                  ][step - 1]
                }
              </p>
            </div>
          </div>
          {step === 1 && (
            <div className="fields two">
              <label className="field">
                <span>法定企业名称 *</span>
                <input
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                />
              </label>
              <label className="field">
                <span>企业类型 *</span>
                <select
                  value={company.type}
                  onChange={(e) => setCompany({ ...company, type: e.target.value })}
                >
                  <option>有限公司</option>
                  <option>有限责任公司</option>
                  <option>股份公司</option>
                  <option>合伙</option>
                  <option>基金或投资主体</option>
                  <option>其他</option>
                </select>
              </label>
              <label className="field">
                <span>注册国家 / 地区 *</span>
                <input
                  value={company.country}
                  onChange={(e) => setCompany({ ...company, country: e.target.value })}
                />
              </label>
              <label className="field">
                <span>注册编号 *</span>
                <input
                  value={company.registration}
                  onChange={(e) => setCompany({ ...company, registration: e.target.value })}
                />
              </label>
              <label className="field full">
                <span>注册地址 *</span>
                <input
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                />
              </label>
              <label className="field full">
                <span>企业官网（选填）</span>
                <input
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                />
              </label>
            </div>
          )}
          {step === 2 && (
            <div className="fields">
              <label className="field">
                <span>所属行业 *</span>
                <select
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                >
                  <option>房地产</option>
                  <option>房地产与资产管理</option>
                  <option>金融投资</option>
                  <option>贸易供应链</option>
                  <option>能源基础设施</option>
                  <option>科技专业服务</option>
                  <option>工业制造</option>
                  <option>其他</option>
                </select>
              </label>
              <label className="field">
                <span>主营业务简介 *</span>
                <textarea
                  rows={5}
                  value={company.description}
                  onChange={(e) => setCompany({ ...company, description: e.target.value })}
                />
              </label>
              <label className="field">
                <span>是否从事受监管金融业务 *</span>
                <select>
                  <option>否</option>
                  <option>是</option>
                  <option>不确定</option>
                </select>
              </label>
            </div>
          )}
          {step === 3 && (
            <div className="fields two">
              <label className="field">
                <span>授权代表姓名 / 职务 *</span>
                <input
                  value={company.representative}
                  onChange={(e) => setCompany({ ...company, representative: e.target.value })}
                />
              </label>
              <label className="field">
                <span>授权依据 *</span>
                <select>
                  <option>董事会决议</option>
                  <option>公司章程</option>
                  <option>授权委托书</option>
                </select>
              </label>
              <label className="field">
                <span>业务联系人 *</span>
                <input
                  value={company.contact}
                  onChange={(e) => setCompany({ ...company, contact: e.target.value })}
                />
              </label>
              <label className="field">
                <span>联系人邮箱 *</span>
                <input
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                />
              </label>
              <label className="field full">
                <span>UBO 识别方式 *</span>
                <div className="segmented">
                  <button className="active">持股控制</button>
                  <button>其他控制</button>
                  <button>无法识别</button>
                </div>
              </label>
              <label className="field">
                <span>UBO 自然人</span>
                <input defaultValue="林海（演示）" />
              </label>
              <label className="field">
                <span>持股比例</span>
                <input defaultValue="62%" />
              </label>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className="upload-zone">
                <Upload size={23} />
                <b>选择本地演示文件</b>
                <p>PDF、PNG 或 JPG · 不会上传云端或进行真实扫描</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const names = Array.from(e.target.files || []).map((file) => file.name);
                    setState((s) => ({ ...s, kybFiles: [...new Set([...s.kybFiles, ...names])] }));
                  }}
                />
              </label>
              <div className="file-list">
                {state.kybFiles.map((f, i) => (
                  <div key={f}>
                    <FileText size={18} />
                    <span>
                      <b>{f}</b>
                      <small>
                        {i === 0 ? "企业注册证明 · 必需" : "关联证明材料 · 可选"} · 本地模拟
                      </small>
                    </span>
                    <Status value="已选择" />
                    <button
                      onClick={() =>
                        setState((s) => ({ ...s, kybFiles: s.kybFiles.filter((x) => x !== f) }))
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="review">
              <div className="review-section">
                <h3>企业与业务</h3>
                <div className="detail-grid">
                  <span>
                    <small>法定名称</small>
                    <b>{company.name || "未填写"}</b>
                  </span>
                  <span>
                    <small>注册地 / 编号</small>
                    <b>
                      {company.country} · {company.registration}
                    </b>
                  </span>
                  <span>
                    <small>行业</small>
                    <b>{company.industry}</b>
                  </span>
                  <span>
                    <small>企业类型</small>
                    <b>{company.type}</b>
                  </span>
                </div>
              </div>
              <div className="review-section">
                <h3>人员与材料</h3>
                <div className="detail-grid">
                  <span>
                    <small>授权代表</small>
                    <b>{company.representative || "未填写"}</b>
                  </span>
                  <span>
                    <small>业务联系人</small>
                    <b>{company.contact || "未填写"}</b>
                  </span>
                  <span>
                    <small>证明材料</small>
                    <b>{state.kybFiles.length} 份</b>
                  </span>
                  <span>
                    <small>数据保存</small>
                    <b>仅当前浏览器</b>
                  </span>
                </div>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={checks[0]}
                  onChange={(e) => setChecks([e.target.checked, checks[1]])}
                />
                <span>我确认以上资料真实、准确、完整，并知悉当前仅为原型模拟。</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={checks[1]}
                  onChange={(e) => setChecks([checks[0], e.target.checked])}
                />
                <span>我确认已获得代表该企业提交本申请的合法授权。</span>
              </label>
            </div>
          )}
          <div className="kyb-actions">
            <Button variant="ghost" onClick={() => save()}>
              保存草稿
            </Button>
            <div>
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={15} />
                  上一步
                </Button>
              )}
              {step < 5 ? (
                <Button onClick={next}>
                  保存并继续
                  <ArrowRight size={15} />
                </Button>
              ) : (
                <Button onClick={submit}>
                  提交模拟审核
                  <ShieldCheck size={15} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Subscription({
  state,
  setState,
  toast,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  toast: (s: string) => void;
}) {
  const upgrade = () => {
    setState((s) => ({
      ...s,
      plan: "Standard",
      planEnd: "2027-11-13",
      autoRenew: false,
      activities: [
        {
          id: `ACT-${Date.now()}`,
          time: "刚刚",
          module: "企业管理",
          object: "SUBSCRIPTION",
          action: "模拟升级 Standard",
          result: "成功",
        },
        ...s.activities,
      ],
    }));
    toast("Standard 已模拟激活，不代表生产服务授权");
  };
  return (
    <div>
      <PageHeader
        eyebrow="PLANS & BILLING"
        title="套餐订阅"
        description="Standard 升级仅用于本地 Sandbox 演示，不会产生真实扣款。"
      />
      <div className="current-plan">
        <div>
          <span>当前套餐</span>
          <h2>{state.plan}</h2>
          <p>
            {state.plan === "Free"
              ? "资产与发行资料准备 · 内部只读预览"
              : `Mock 演示有效期至 ${state.planEnd || "—"} · 不会自动扣款`}
          </p>
        </div>
        <Status value={state.plan} />
      </div>
      <div className="plan-grid">
        <div className="card plan">
          <span>FREE</span>
          <h3>免费开始</h3>
          <p>完成企业认证，建立可审阅的发行准备资料。</p>
          {["资产 / 权益 / Offering 草稿", "内部只读 Sandbox 预览", "本地文件与版本记录"].map(
            (x) => (
              <div className="feature" key={x}>
                <Check size={15} />
                {x}
              </div>
            ),
          )}
          <Button variant="secondary" disabled={state.plan === "Free"}>
            当前套餐
          </Button>
        </div>
        <div className="card plan featured">
          <div className="popular">推荐</div>
          <span>STANDARD</span>
          <h3>完整业务演示</h3>
          <p>Mock Standard 演示准入；不会扣款或创建真实订阅。</p>
          {["企业门户配置与演示预览", "投资者 / 订单 / 资金联动", "Token 与收益受控模拟"].map(
            (x) => (
              <div className="feature" key={x}>
                <Check size={15} />
                {x}
              </div>
            ),
          )}
          <Button onClick={upgrade} disabled={state.plan === "Standard"}>
            {state.plan === "Standard" ? "已激活 Standard" : "确认模拟升级"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
      <div className="card history">
        <div className="card-title">
          <span>订阅历史</span>
        </div>
        <div className="history-row">
          <span className="history-icon">
            <CreditCard size={17} />
          </span>
          <div>
            <b>{state.plan === "Standard" ? "Standard 模拟订阅已激活" : "Free 套餐已激活"}</b>
            <small>
              {state.plan === "Standard"
                ? `Sandbox Mock · 演示有效期至 ${state.planEnd}`
                : "KYB 通过后自动启用"}
            </small>
          </div>
          <Status value="已确认" />
        </div>
      </div>
    </div>
  );
}

function Messages({
  state,
  setState,
  go,
  close,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  go: (m: ModuleId, t?: string) => void;
  close: () => void;
}) {
  return (
    <div className="messages-pop">
      <div className="pop-head">
        <b>消息通知</b>
        <button
          onClick={() =>
            setState((s) => ({ ...s, messages: s.messages.map((m) => ({ ...m, read: true })) }))
          }
        >
          全部标为已读
        </button>
      </div>
      {visibleMessages(state).map((m) => (
        <button
          className={!m.read ? "unread" : ""}
          key={m.id}
          onClick={() => {
            setState((s) => ({
              ...s,
              messages: s.messages.map((x) => (x.id === m.id ? { ...x, read: true } : x)),
            }));
            go(m.target as ModuleId);
            close();
          }}
        >
          <i />
          <div>
            <b>{m.title}</b>
            <p>{m.detail}</p>
          </div>
          <ChevronRight size={14} />
        </button>
      ))}
      {!visibleMessages(state).length && (
        <div className="pop-empty">当前没有与企业状态相关的未处理通知。</div>
      )}
      <small className="pop-foot">已读仅代表查看，不等于业务处理完成或法定送达。</small>
    </div>
  );
}

function DemoConsole({
  state,
  setState,
  close,
  go,
  toast,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  go: (m: ModuleId, t?: string) => void;
  toast: (s: string) => void;
}) {
  const [selectedOfferingId, setSelectedOfferingId] = useState(
    state.offerings.find((offering) => offering.confirmed)?.id || state.offerings[0]?.id || "",
  );
  const [sandboxResult, setSandboxResult] = useState<"success" | "failed" | "unknown">("success");
  const [sandboxDate, setSandboxDate] = useState(state.sandboxClock || sandboxBusinessDate(new Date().toISOString()));
  const [sandboxFailureReason, setSandboxFailureReason] = useState("Sandbox 模拟合约部署返回失败（测试注入）");
  const [paymentOutcome, setPaymentOutcome] = useState<"success" | "failed" | "unknown">("success");
  const [paymentAttempt, setPaymentAttempt] = useState("1");
  const [snapshotDate, setSnapshotDate] = useState("2026-12-31");
  const [selectedPayoutBatchId, setSelectedPayoutBatchId] = useState("");
  const [selectedPayoutHolderId, setSelectedPayoutHolderId] = useState("");
  const [distributionOutcome, setDistributionOutcome] = useState<"success" | "failed" | "unknown">("success");
  const [distributionAttempt, setDistributionAttempt] = useState("1");
  const executeSandboxTask = () => {
    setState((current) => {
      const result = advanceSandboxIssuance(current, selectedOfferingId, new Date().toISOString());
      queueMicrotask(() => toast(result.error || "原 Sandbox 发行任务进入执行中"));
      return result.state;
    });
  };
  const settleSandboxTask = () => {
    setState((current) => {
      const result = resolveSandboxIssuance(current, selectedOfferingId, sandboxResult, new Date().toISOString(), sandboxFailureReason);
      queueMicrotask(() => toast(result.error || (sandboxResult === "success" ? "Sandbox 模拟发行已核验并生成唯一发布快照" : sandboxResult === "unknown" ? "原任务结果 Unknown；请查询原任务" : "原任务模拟执行失败，未发布")));
      return result.state;
    });
  };
  const load = (mode: "free" | "standard" | "operations" | "exception") => {
    setState(ensureProjects(demoState(mode)));
    toast("演示场景已载入并保存到本地");
  };
  const setKyb = (status: AppState["kybStatus"]) => {
    setState((s) => ({
      ...s,
      company: s.company || { ...companyDemo },
      kybStatus: status,
      kybStep: 5,
      kybApplication: s.kybApplication || "KYB-DEMO-260018",
      plan: status === "已通过" ? "Free" : s.plan,
      wallets:
        status === "已通过" && s.wallets.length === 0 ? demoState("free").wallets : s.wallets,
    }));
    toast(`KYB 已切换为：${status}`);
  };
  const importCaseTemplates = (kind: "residential" | "debt" | "both") => {
    const includeResidential = kind !== "debt";
    const includeDebt = kind !== "residential";
    setState((s) => {
      const currentEntity = s.company?.name || companyDemo.name;
      const wallet =
        s.wallets.find((item) => item.status.includes("已验证")) ||
        ({
          id: "WAL-CASE-01",
          name: "双案例企业结算钱包",
          type: "MPC 钱包（模拟）",
          address: "0x1111111111111111111111111111111111111111",
          network: "OP Mainnet",
          status: "已验证",
          isDefault: true,
        } as const);
      const residentialAsset: Asset = {
        id: "AST-CASE-RES-001",
        name: "北京朝阳住宅租金收益项目",
        code: "AST-DEMO-RES-001",
        category: "房地产",
        subtype: "住宅物业",
        value: 250000,
        status: "Ready",
        updated: "刚刚",
        location: "中国北京市朝阳区",
        address: "北京市朝阳区建国路虚构测试小区1号楼1201室",
        details: {
          address: "北京市朝阳区建国路虚构测试小区1号楼1201室",
          propertyLayout: "两室一厅一卫",
          area: 80,
          use: "普通住宅",
          occupancy: "已出租",
          owner: currentEntity,
          rightNature: "所有权（仅演示，尚未经核验）",
          relation: "同一主体",
          agreedPriceCny: 2000000,
          appraisalCny: 1900000,
          appraisalDate: "2026-10-31",
          appraiser: "北京示例不动产评估有限公司（虚构）",
          monthlyRentCny: 8000,
          frequency: "按月",
          leaseStart: "2026-10-01",
          leaseEnd: "2027-09-30",
          operator: currentEntity,
        },
        files: [
          ["DEMO_Property_Ownership.pdf", "权属证明"],
          ["DEMO_Property_Appraisal.pdf", "估值依据"],
          ["DEMO_Rental_Agreement.pdf", "租赁合同"],
        ].map(([name, category], index) => ({
          id: `FILE-RES-${index + 1}`,
          name,
          category,
          status: "可引用",
        })),
        missing: [],
      };
      const debtAsset: Asset = {
        id: "AST-CASE-DEBT-001",
        name: "华北物流企业借款债权",
        code: "AST-DEMO-DEBT-001",
        category: "债权与应收款",
        subtype: "单笔企业借款债权",
        value: 400000,
        status: "Ready",
        updated: "刚刚",
        location: "中国北京市朝阳区",
        details: {
          contractNumber: "DEMO-LOAN-2026-001",
          signedDate: "2026-10-01",
          creditor: currentEntity,
          debtor: "华北物流科技有限公司（示例）",
          principal: 400000,
          outstanding: 400000,
          annualRate: 12,
          interestStart: "2026-12-01",
          maturity: "2028-12-01",
          repayment: "到期一次还本",
          performance: "正常履约",
          guarantee: "无",
          restriction: "无",
          valuation: 400000,
          valuationDate: "2026-10-01",
        },
        files: [
          ["DEMO_Loan_Agreement.pdf", "借款合同"],
          ["DEMO_Debt_Ownership.pdf", "债权证明"],
          ["DEMO_Outstanding_Balance.pdf", "余额证明"],
          ["DEMO_Debt_Valuation.pdf", "估值依据"],
        ].map(([name, category], index) => ({
          id: `FILE-DEBT-${index + 1}`,
          name,
          category,
          status: "可引用",
        })),
        missing: [],
      };
      const residentialInstrument: Instrument = {
        id: "INS-CASE-RES-V1",
        assetId: residentialAsset.id,
        name: "朝阳住宅租金收益参与权",
        type: "收益参与权",
        version: "v1",
        totalRights: 25000,
        unit: "收益参与份额",
        tokenCap: 25000,
        used: 25000,
        status: "Ready",
        updated: "刚刚",
        terms: {
          responsibleParty: currentEntity,
          rightsDescription: "住宅租赁合同下实际收到的可分配租金收益参与权，不转移房产产权",
          revenueSource: "该住宅租赁合同下实际收到的可分配租金",
          participationRate: 100,
          frequency: "每月",
          startDate: "2026-10-01",
          maturityDate: "2027-09-30",
          expiryArrangement: "权益期限终止，待合法清算；不承诺返还本金",
        },
        files: [
          {
            id: "FILE-RES-INS-1",
            name: "DEMO_Rental_Revenue_Participation_Agreement.pdf",
            category: "核心协议",
            status: "可引用",
          },
        ],
        missing: [],
      };
      const debtInstrument: Instrument = {
        id: "INS-CASE-DEBT-V1",
        assetId: debtAsset.id,
        name: "华北物流债权收益发行权益",
        type: "债权",
        version: "v1",
        totalRights: 400000,
        unit: "U 本金",
        tokenCap: 4000,
        used: 4000,
        status: "Ready",
        updated: "刚刚",
        terms: {
          responsibleParty: currentEntity,
          rightsDescription: "发行企业对投资者承担独立的固定利率债权偿付义务",
          principal: 400000,
          annualRate: 12,
          interestMethod: ACTUAL_365_FIXED,
          frequency: "每月付息",
          startDate: "2026-12-01",
          maturityDate: "2028-12-01",
          repayment: "到期一次还本金",
        },
        files: [
          {
            id: "FILE-DEBT-INS-1",
            name: "DEMO_Investor_Debt_Agreement.pdf",
            category: "核心协议",
            status: "可引用",
          },
        ],
        missing: [],
      };
      const residentialOffering: Offering = {
        id: "OFF-CASE-RES-001",
        assetId: residentialAsset.id,
        instrumentId: residentialInstrument.id,
        name: "朝阳住宅租金收益参与权首期",
        round: "第 1 期",
        tokens: 25000,
        price: 10,
        start: "2026-11-01",
        end: "2026-11-30",
        status: "准备就绪",
        walletId: wallet.id,
        summary: "住宅租赁合同实际可分配租金的 100% 收益参与安排，不代表房产产权或本金返还。",
        minimum: 1000,
        disclosureFiles: [
          {
            id: "FILE-RES-OFF-1",
            name: "DEMO_Residential_Offering_Disclosure.pdf",
            category: "发行披露",
            status: "可引用",
          },
        ],
        confirmed: true,
        contractStatus: "未申请",
      };
      const debtOffering: Offering = {
        id: "OFF-CASE-DEBT-001",
        assetId: debtAsset.id,
        instrumentId: debtInstrument.id,
        name: "华北物流投资者债权首期",
        round: "第 1 期",
        tokens: 4000,
        price: 100,
        start: "2026-11-01",
        end: "2026-11-30",
        status: "准备就绪",
        walletId: wallet.id,
        summary: "发行企业承担 12% 固定年利率、每月付息、到期还本的独立投资者债权义务。",
        minimum: 1000,
        disclosureFiles: [
          {
            id: "FILE-DEBT-OFF-1",
            name: "DEMO_Debt_Offering_Disclosure.pdf",
            category: "发行披露",
            status: "可引用",
          },
        ],
        confirmed: true,
        contractStatus: "未申请",
      };
      const nextAssets = [
        ...(includeResidential ? [residentialAsset] : []),
        ...(includeDebt ? [debtAsset] : []),
      ].filter((item) => !s.assets.some((existing) => existing.id === item.id));
      const nextInstruments = [
        ...(includeResidential ? [residentialInstrument] : []),
        ...(includeDebt ? [debtInstrument] : []),
      ].filter((item) => !s.instruments.some((existing) => existing.id === item.id));
      const nextOfferings = [
        ...(includeResidential ? [residentialOffering] : []),
        ...(includeDebt ? [debtOffering] : []),
      ].filter((item) => !s.offerings.some((existing) => existing.id === item.id));
      return ensureProjects({
        ...s,
        company: s.company || { ...companyDemo },
        kybStatus: "已通过",
        plan: "Standard",
        planEnd: s.planEnd || "2027-11-13",
        wallets: s.wallets.length ? s.wallets : [wallet],
        assets: [...nextAssets, ...s.assets],
        instruments: [...nextInstruments, ...s.instruments],
        offerings: [...nextOfferings, ...s.offerings],
        scenario:
          kind === "both"
            ? "双案例资料模板"
            : kind === "debt"
              ? "债权案例资料模板"
              : "住宅案例资料模板",
      });
    });
    toast("案例资料模板已幂等导入；未生成投资者、付款、登记、合约、Token 或收益");
  };
  const scanPendingFiles = () => {
    setState((s) => {
      const assets = s.assets.map((asset) => {
        const hadPending = asset.files?.some((file) => file.status === "待扫描");
        const next = {
          ...asset,
          files: asset.files?.map((file) => ({ ...file, status: "可引用" as const })),
        };
        const missing = assetMissing(next);
        return { ...next, missing, status: hadPending ? ("Draft" as const) : asset.status };
      });
      const instruments = s.instruments.map((instrument) => {
        const hadPending = instrument.files?.some((file) => file.status === "待扫描");
        const next = {
          ...instrument,
          files: instrument.files?.map((file) => ({ ...file, status: "可引用" as const })),
        };
        const missing = instrumentMissing(
          next,
          assets.find((asset) => asset.id === next.assetId),
        );
        return { ...next, missing, status: hadPending ? ("Draft" as const) : instrument.status };
      });
      return ensureProjects({
        ...s,
        assets,
        instruments,
        offerings: s.offerings.map((offering) => ({
          ...offering,
          disclosureFiles: offering.disclosureFiles?.map((file) => ({
            ...file,
            status: "可引用" as const,
          })),
        })),
        distributions: s.distributions.map((distribution) =>
          distribution.proofFile?.status === "待扫描"
            ? {
                ...distribution,
                proofFile: { ...distribution.proofFile, status: "可引用" as const },
                status: distribution.blockedReason ? "草稿·待补充" : "待复核",
              }
            : distribution,
        ),
        rentReports: s.rentReports.map(report => report.proofFile.status === "待扫描"
          ? { ...report, proofFile: { ...report.proofFile, status: "可引用" as const }, status: "待确认" as const } : report),
        mockEvidenceFiles: s.mockEvidenceFiles.map(file => file.status === "待扫描" ? { ...file, status: "可引用" as const } : file),
        mockEvents: [
          {
            id: `EVT-${Date.now()}`,
            offeringId: selectedOfferingId || "DOCUMENTS",
            type: "文件扫描",
            result: "模拟可引用",
            time: "刚刚",
            detail: "将当前待扫描的本地文件标记为可引用",
          },
          ...s.mockEvents,
        ],
      });
    });
    toast("Mock 文件扫描已完成；请回到详情运行 Asset / Instrument 资料检查");
  };
  const verifyPendingWallets = () => {
    if (!state.wallets.some((wallet) => wallet.status === "待验证" || wallet.status === "生成中"))
      return toast("没有待处理的钱包");
    setState((s) => ({
      ...s,
      wallets: s.wallets.map((wallet) =>
        wallet.status === "待验证" || wallet.status === "生成中"
          ? { ...wallet, status: "已验证" }
          : wallet,
      ),
      mockEvents: [
        {
          id: `EVT-${Date.now()}`,
          offeringId: "WALLET",
          type: "钱包 Provider",
          result: "模拟已验证",
          time: "刚刚",
          detail: "完成待处理钱包的模拟 Provider / 签名验证",
        },
        ...s.mockEvents,
      ],
    }));
    toast("待处理钱包已模拟验证，可供 Offering 选择");
  };
  const createMockRentEvidence = () => {
    setState(current => {
      if (current.mockEvidenceFiles.some(file => file.id === "FILE-MOCK-RENT-202612")) {
        queueMicrotask(() => toast("Sandbox 收益证明引用已存在，未重复创建"));
        return current;
      }
      queueMicrotask(() => toast("Sandbox 收益证明引用已创建；请在上报表单选择并执行 Mock 扫描"));
      return { ...current, mockEvidenceFiles: [...current.mockEvidenceFiles, {
        id: "FILE-MOCK-RENT-202612", name: "DEMO_Rental_Income_Statement.pdf",
        category: "收益依据", status: "待扫描" as const, version: 1,
      }] };
    });
  };
  const requireStandard = () => {
    if (state.plan === "Standard") return true;
    toast(
      `当前套餐为 ${state.plan}：Free 仅支持资料准备与内部预览，Mock 认购、资金、部署、Mint 和收益运营需要 Standard`,
    );
    return false;
  };
  const scenarioPeople = (current: AppState) => {
    const offering = current.offerings.find(row => row.id === selectedOfferingId);
    const instrument = current.instruments.find(row => row.id === offering?.instrumentId);
    return instrument?.type === "债权"
      ? [{ name: "投资者甲（虚构）", ratio: 0.625, type: "自然人" as const }, { name: "投资者丙（虚构）", ratio: 0.375, type: "自然人" as const }]
      : [{ name: "张先生（虚构）", ratio: 0.5, type: "自然人" as const }, { name: "李女士（虚构）", ratio: 0.3, type: "自然人" as const }, { name: "某投资机构（虚构）", ratio: 0.2, type: "机构" as const }];
  };
  const runScenarioStep = (title: string, step: (current: AppState) => { state: AppState; changed: boolean; error?: string }) => {
    if (!requireStandard()) return;
    setState(current => {
      const result = step(current);
      queueMicrotask(() => toast(result.error || (result.changed ? `${title}完成（仅 Sandbox Mock）` : `${title}已有记录，未重复生成`)));
      if (!result.changed) return current;
      return { ...result.state, mockEvents: [{ id: `EVT-M03-${Date.now()}-${Math.random()}`, offeringId: selectedOfferingId,
        type: title, result: "Sandbox Mock", time: "刚刚", detail: title }, ...result.state.mockEvents] };
    });
  };
  const applyAll = (current: AppState, action: (next: AppState, index: number) => { state: AppState; changed: boolean; error?: string }, count: number) => {
    let next = current;
    let changed = false;
    for (let index = 0; index < count; index++) {
      const result = action(next, index);
      if (result.error) return { state: current, changed: false, error: result.error };
      changed ||= result.changed;
      next = result.state;
    }
    return { state: next, changed };
  };
  const createCaseInvestors = () => runScenarioStep("创建模拟投资者", current => applyAll(current, (next, index) => {
    const person = scenarioPeople(next)[index];
    return createMockInvestor(next, selectedOfferingId, person.name, person.type, `case:${selectedOfferingId}:${index}`);
  }, scenarioPeople(current).length));
  const approveCaseKyc = () => runScenarioStep("Mock KYC 审核", current => applyAll(current, (next, index) => {
    const investor = next.investors.find(row => row.requestKey === `case:${selectedOfferingId}:${index}`);
    return approveMockInvestorKyc(next, investor?.id || "");
  }, scenarioPeople(current).length));
  const createCaseOrders = () => runScenarioStep("提交模拟认购订单", current => applyAll(current, (next, index) => {
    const investor = next.investors.find(row => row.requestKey === `case:${selectedOfferingId}:${index}`);
    const offering = next.offerings.find(row => row.id === selectedOfferingId);
    if (!investor || !offering) return { state: next, changed: false, error: "请先创建模拟投资者" };
    const quantity = Math.round(offering.tokens * scenarioPeople(next)[index].ratio);
    return createMockOrder(next, selectedOfferingId, investor.id, quantity, `case-order:${selectedOfferingId}:${index}`, next.sandboxClock);
  }, scenarioPeople(current).length));
  const finalMatchPayments = () => runScenarioStep("模拟支付结果", current => {
    const orders = current.orders.filter(row => row.offeringId === selectedOfferingId && row.environment === "Sandbox");
    if (!orders.length) return { state: current, changed: false, error: "请先提交模拟订单" };
    return applyAll(current, (next, index) => recordMockPayment(next, orders[index].id,
      `case-payment:${orders[index].id}:${paymentAttempt}`, paymentOutcome, new Date().toISOString()), orders.length);
  });
  const allocate = () => runScenarioStep("逐笔配售", current => {
    const orders = current.orders.filter(row => row.offeringId === selectedOfferingId && row.environment === "Sandbox");
    if (!orders.length) return { state: current, changed: false, error: "请先提交模拟订单" };
    return applyAll(current, (next, index) => allocateMockOrder(next, orders[index].id, `${next.sandboxClock}T12:00:00+08:00`), orders.length);
  });
  const registerHolders = () => runScenarioStep("模拟法定登记", current => {
    const orders = current.orders.filter(row => row.offeringId === selectedOfferingId && row.environment === "Sandbox");
    if (!orders.length) return { state: current, changed: false, error: "请先完成配售" };
    return applyAll(current, (next, index) => registerMockHolder(next, orders[index].id, `${next.sandboxClock}T12:00:00+08:00`), orders.length);
  });
  const deliverTokens = () => runScenarioStep("模拟 Token 交付", current => {
    const orders = current.orders.filter(row => row.offeringId === selectedOfferingId && row.environment === "Sandbox");
    if (!orders.length) return { state: current, changed: false, error: "请先完成模拟登记" };
    return applyAll(current, (next, index) => deliverMockTokens(next, orders[index].id, new Date().toISOString()), orders.length);
  });
  const recordHolderSnapshot = () => runScenarioStep("固定持有人快照", current => createHolderSnapshot(current,
    selectedOfferingId, snapshotDate, new Date().toISOString()));
  const simulateRemainingDebtCoupons = () => runScenarioStep("逐期模拟剩余债权月息", current => {
    const schedule = current.debtSchedules.find(row => row.offeringId === selectedOfferingId);
    if (!schedule) return { state: current, changed: false, error: "请先在存续管理生成债权付息计划" };
    if (current.sandboxClock < schedule.maturityDate) return { state: current, changed: false, error: `请先将 Sandbox 测试日期推进至 ${schedule.maturityDate}` };
    let next = current;
    let changed = false;
    for (const event of current.debtInterestEvents.filter(row => row.scheduleId === schedule.id)) {
      let batch = next.distributions.find(row => row.interestEventId === event.id);
      if (batch?.status === "支付完成") continue;
      if (!next.holderSnapshots.some(row => row.offeringId === selectedOfferingId && row.recordDate === event.recordDate)) {
        const result = createHolderSnapshot(next, selectedOfferingId, event.recordDate, `${next.sandboxClock}T12:00:00+08:00`);
        if (result.error) return { state: current, changed: false, error: result.error };
        next = result.state; changed ||= result.changed;
      }
      if (!batch) {
        const result = createDebtInterestBatch(next, event.id);
        if (result.error) return { state: current, changed: false, error: result.error };
        next = result.state; changed ||= result.changed;
        batch = next.distributions.find(row => row.interestEventId === event.id);
      }
      if (!batch) return { state: current, changed: false, error: "利息批次未生成" };
      if (batch.status === "待复核") {
        const result = confirmDebtBatch(next, batch.id);
        if (result.error) return { state: current, changed: false, error: result.error };
        next = result.state; changed ||= result.changed;
      }
      for (const line of batch.items || []) {
        if (next.distributions.find(row => row.id === batch!.id)?.items?.find(row => row.holderId === line.holderId)?.status === "支付完成") continue;
        const result = payMockDistributionLine(next, batch.id, line.holderId,
          `debt-coupon:${batch.id}:${line.holderId}:1`, "success", `${next.sandboxClock}T12:00:00+08:00`);
        if (result.error) return { state: current, changed: false, error: result.error };
        next = result.state; changed ||= result.changed;
      }
    }
    return { state: next, changed };
  });
  const payConfirmedDistribution = () => {
    if (!requireStandard()) return;
    const selectedBatch = state.distributions.find(item => item.id === selectedPayoutBatchId && item.offeringId === selectedOfferingId)
      || state.distributions.find(item => item.offeringId === selectedOfferingId && item.status === "已确认" && item.calculationStatus);
    if (selectedBatch?.calculationStatus) {
      const line = selectedBatch.items?.find(item => item.holderId === selectedPayoutHolderId)
        || selectedBatch.items?.find(item => item.status !== "支付完成");
      if (!line) return toast("当前批次没有待支付明细");
      if (!/^\d+$/.test(distributionAttempt)) return toast("请输入有效的支付意图尝试编号");
      setState(current => {
        const result = payMockDistributionLine(current, selectedBatch.id, line.holderId,
          `distribution:${selectedBatch.id}:${line.holderId}:${distributionAttempt}`, distributionOutcome, `${current.sandboxClock}T12:00:00+08:00`);
        queueMicrotask(() => toast(result.error || (result.changed ? `已记录 ${line.holderId} 的 Sandbox 支付结果；请核对批次与投资者收益` : "已有原支付结果，未重复生成")));
        return result.state;
      });
      return;
    }
    const distribution = state.distributions.find(
      (item) => item.offeringId === selectedOfferingId && item.status === "待注资",
    );
    if (!distribution) return toast("当前 Offering 没有已确认且待注资的批次");
    setState((s) => ({
      ...s,
      distributions: s.distributions.map((item) =>
        item.id === distribution.id
          ? {
              ...item,
              status: "支付完成",
              paidAt: "刚刚",
              items: item.items?.map((line) => ({ ...line, status: "支付完成" })),
            }
          : item,
      ),
      mockEvents: [
        {
          id: `EVT-${Date.now()}`,
          offeringId: selectedOfferingId,
          type: `${distribution.eventType || "收益"}付款`,
          result: "模拟支付完成",
          time: "刚刚",
          detail: `${distribution.id} 共 ${formatU(distribution.gross)}，不代表真实资金清偿`,
        },
        ...s.mockEvents,
      ],
    }));
    toast(`${distribution.eventType || "收益"}已逐笔模拟支付；重试不会生成重复付款`);
  };
  return (
    <div className="modal-layer">
      <div className="backdrop" onClick={close} />
      <div className="demo-console">
        <div className="demo-head">
          <div className="demo-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <span>INTERNAL DEMO TOOLS</span>
            <h2>演示控制台</h2>
          </div>
          <button onClick={close}>
            <X size={20} />
          </button>
        </div>
        <div className="demo-notice">
          <AlertCircle size={17} />
          <p>
            以下操作只修改浏览器本地 Mock 数据。资金、登记、支付与链上结果均不代表真实生产执行。
          </p>
        </div>
        <div className="demo-body">
          <section>
            <h3>
              <span>01</span>场景快照
            </h3>
            <div className="scenario-grid">
              <button onClick={() => load("free")}>
                <FileText size={18} />
                <b>Free 资料准备</b>
                <small>KYB 通过 · 6 个资产 · 准备资料</small>
              </button>
              <button onClick={() => load("standard")}>
                <Zap size={18} />
                <b>Standard 已激活</b>
                <small>钱包 · 资产 · 权益 · Offering</small>
              </button>
              <button onClick={() => load("operations")} className="recommended">
                <span>推荐</span>
                <PackageCheck size={18} />
                <b>完整发行运营</b>
                <small>投资者、订单、资金、Token、收益</small>
              </button>
              <button onClick={() => load("exception")}>
                <AlertCircle size={18} />
                <b>异常与降级</b>
                <small>付款差异 · 交付中 · 套餐到期</small>
              </button>
              <button onClick={() => importCaseTemplates("residential")}>
                <Landmark size={18} />
                <b>新建住宅案例</b>
                <small>导入双资产规格中的住宅资料模板，不创建运营事实</small>
              </button>
              <button onClick={() => importCaseTemplates("debt")}>
                <FileText size={18} />
                <b>新建债权案例</b>
                <small>导入借款债权资料模板，不创建运营事实</small>
              </button>
              <button onClick={() => importCaseTemplates("both")}>
                <Layers3 size={18} />
                <b>两者均导入</b>
                <small>稳定 ID、幂等导入，后续事件仍需逐步执行</small>
              </button>
            </div>
          </section>
          <section>
            <h3>
              <span>02</span>KYB 审核模拟
            </h3>
            <div className="control-row">
              <Button
                variant="secondary"
                onClick={() => {
                  setState((s) => ({
                    ...s,
                    company: { ...companyDemo },
                    kybStatus: "草稿",
                    kybFiles: ["DEMO_Business_License.pdf", "DEMO_UBO_Declaration.pdf"],
                  }));
                  go("company", "企业资料与 KYB");
                  close();
                  toast("KYB 演示资料已填充");
                }}
              >
                填充资料
              </Button>
              {(["审核中", "待补件", "未通过", "已通过"] as const).map((x) => (
                <Button variant="ghost" key={x} onClick={() => setKyb(x)}>
                  {x}
                </Button>
              ))}
            </div>
          </section>
          <section>
            <h3>
              <span>03</span>套餐状态
            </h3>
            <div className="control-row">
              {(["Free", "Standard", "宽限期", "已到期"] as const).map((x) => (
                <Button
                  variant={state.plan === x ? "primary" : "ghost"}
                  key={x}
                  onClick={() => {
                    setState((s) => ({
                      ...s,
                      plan: x,
                      planEnd: x === "Standard" ? "2027-11-13" : s.planEnd,
                    }));
                    toast(`套餐已切换为 ${x}`);
                  }}
                >
                  {x}
                </Button>
              ))}
            </div>
          </section>
          <section>
            <h3>
              <span>04</span>资料扫描与业务事件
            </h3>
            <label className="field">
              <span>作用于 Offering</span>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
              >
                <option value="">请选择已创建的 Offering</option>
                {state.offerings.map((offering) => (
                  <option value={offering.id} key={offering.id}>
                    {offering.name} · {offering.status}
                  </option>
                ))}
              </select>
            </label>
            <div className="info-note"><ShieldCheck size={17} /><p>Sandbox 发行测试控制区：只处理当前 Offering 的原发行任务；不会连接生产合约、钱包私钥或资金。</p></div>
            <label className="field">
              <span>Sandbox 测试日期</span>
              <input type="date" value={sandboxDate} onChange={(event) => setSandboxDate(event.target.value)} />
            </label>
            <Button variant="secondary" onClick={() => {
              if (!sandboxDate) return toast("请选择 Sandbox 测试日期");
              setState((current) => refreshSandboxSale(current, sandboxDate));
              toast("Sandbox 认购状态已按测试日期刷新");
            }}>刷新 Sandbox 认购窗口</Button>
            <div className="mock-step-list">
              <button onClick={executeSandboxTask}>
                <span>发</span><div><b>执行已提交的 Sandbox 任务</b><small>仅将原任务从已提交推进至执行中</small></div>
              </button>
            </div>
            <label className="field">
              <span>原任务模拟结果／Unknown 查询结果</span>
              <select value={sandboxResult} onChange={(event) => setSandboxResult(event.target.value as typeof sandboxResult)}>
                <option value="success">Sandbox 成功并核验</option>
                <option value="failed">执行失败</option>
                <option value="unknown">Unknown：仍无法核验</option>
              </select>
            </label>
            {sandboxResult === "failed" && <label className="field"><span>模拟失败原因</span><input value={sandboxFailureReason} onChange={(event) => setSandboxFailureReason(event.target.value)} /></label>}
            <Button variant="secondary" onClick={settleSandboxTask}>记录或查询原任务结果</Button>
            {state.issuanceTasks.find((item) => item.offeringId === selectedOfferingId)?.status === "失败" && <Button variant="secondary" onClick={() => setState((current) => {
              const result = retryFailedSandboxIssuance(current, selectedOfferingId, new Date().toISOString());
              queueMicrotask(() => toast(result.error || "原失败任务已重新提交，未创建第二任务"));
              return result.state;
            })}>重试原失败任务</Button>}
            <p className="body-copy">当前任务：{state.issuanceTasks.find((item) => item.offeringId === selectedOfferingId)?.status || "未发起"}；发布快照：{state.publications.find((item) => item.offeringId === selectedOfferingId)?.id || "无"}</p>
            <div className="mock-step-list">
              <button onClick={verifyPendingWallets}>
                <span>00</span>
                <div>
                  <b>验证待处理钱包</b>
                  <small>模拟 Provider / 签名结果，不请求私钥</small>
                </div>
              </button>
              <button onClick={scanPendingFiles}>
                <span>01</span>
                <div>
                  <b>扫描当前待处理文件</b>
                  <small>更新 Asset / Instrument / 披露文件可引用状态</small>
                </div>
              </button>
              <button onClick={createMockRentEvidence}><span>01A</span><div><b>创建 Sandbox 租金证明引用</b><small>仅文件元数据，无真实租金收款；上报时从列表选择</small></div></button>
              <button onClick={createCaseInvestors}>
                <span>02</span>
                <div>
                  <b>创建模拟投资者</b>
                  <small>住宅 3 人，债权 2 人；新建后 KYC 待审核</small>
                </div>
              </button>
              <button onClick={approveCaseKyc}>
                <span>03</span>
                <div>
                  <b>Mock KYC 审核通过</b>
                  <small>仅适用于 Sandbox 模拟投资者</small>
                </div>
              </button>
              <button onClick={createCaseOrders}>
                <span>04</span>
                <div>
                  <b>提交模拟认购订单</b>
                  <small>按已确认价格与当前认购窗口生成固定报价订单</small>
                </div>
              </button>
              <label className="field"><span>Mock 支付结果</span><select value={paymentOutcome} onChange={event => setPaymentOutcome(event.target.value as typeof paymentOutcome)}><option value="success">最终匹配</option><option value="failed">失败</option><option value="unknown">Unknown（查询原支付意图）</option></select></label>
              <label className="field"><span>支付意图尝试编号（失败后可递增；Unknown 保持原编号）</span><input type="number" min="1" value={paymentAttempt} onChange={event => setPaymentAttempt(event.target.value)} /></label>
              <button onClick={finalMatchPayments}>
                <span>05</span>
                <div>
                  <b>记录或查询 Mock 支付</b>
                  <small>付款结果独立记录；Unknown 不创建第二个支付意图</small>
                </div>
              </button>
              <button onClick={allocate}>
                <span>06</span>
                <div>
                  <b>执行逐笔配售</b>
                  <small>最终匹配后生成配售记录；此时尚无持有人</small>
                </div>
              </button>
              <button onClick={registerHolders}>
                <span>07</span>
                <div>
                  <b>模拟持有人登记</b>
                  <small>按配售结果建立明确标识的 Sandbox 持有人记录</small>
                </div>
              </button>
              <button onClick={deliverTokens}><span>08</span><div><b>模拟 Token 交付</b><small>与登记分开，按订单逐笔记录并防重复</small></div></button>
              <label className="field"><span>持有人快照 Record Date</span><input type="date" value={snapshotDate} onChange={event => setSnapshotDate(event.target.value)} /></label>
              <button onClick={recordHolderSnapshot}><span>09</span><div><b>固定持有人快照</b><small>按登记生效时间读取有效持有人，固定本期权益</small></div></button>
              <label className="field"><span>待处理分配批次</span><select value={selectedPayoutBatchId} onChange={event => { setSelectedPayoutBatchId(event.target.value); setSelectedPayoutHolderId(""); }}><option value="">选择当前 Offering 最新待支付批次</option>{state.distributions.filter(item => item.offeringId === selectedOfferingId && item.status === "已确认").map(item => <option key={item.id} value={item.id}>{item.id} · {item.eventType} · {item.paymentStatus || "未发起"}</option>)}</select></label>
              <label className="field"><span>逐笔支付对象</span><select value={selectedPayoutHolderId} onChange={event => setSelectedPayoutHolderId(event.target.value)}><option value="">自动选择下一笔待支付明细</option>{(state.distributions.find(item => item.id === selectedPayoutBatchId) || state.distributions.find(item => item.offeringId === selectedOfferingId && item.status === "已确认"))?.items?.map(item => <option key={item.holderId} value={item.holderId}>{item.holderId} · {formatU6(item.amount)} · {item.status}</option>)}</select></label>
              <label className="field"><span>Mock 分配支付结果</span><select value={distributionOutcome} onChange={event => setDistributionOutcome(event.target.value as typeof distributionOutcome)}><option value="success">模拟已支付</option><option value="failed">失败</option><option value="unknown">Unknown（查询原意图）</option></select></label>
              <label className="field"><span>分配支付尝试编号</span><input type="number" min="1" value={distributionAttempt} onChange={event => setDistributionAttempt(event.target.value)} /></label>
              <button onClick={payConfirmedDistribution}>
                <span>10</span>
                <div>
                  <b>模拟收益 / 本金支付</b>
                  <small>仅处理已确认批次；逐笔模拟支付、查询 Unknown 和失败重试</small>
                </div>
              </button>
              <button onClick={simulateRemainingDebtCoupons}><span>11</span><div><b>逐期模拟剩余债权月息</b><small>仅 Sandbox：逐期固定快照、创建并确认独立批次、逐笔记录模拟到账；已有 Unknown 需先手工查询</small></div></button>
              <button onClick={() => runScenarioStep("更新债权模拟名册", current => settleDebtRegistry(current, selectedOfferingId))}><span>12</span><div><b>更新清偿后模拟持有人登记</b><small>全部月息和本金支付完成后，法律权益数量归零</small></div></button>
              <button onClick={() => runScenarioStep("处置债权模拟 Token", current => disposeDebtTokens(current, selectedOfferingId, `${current.sandboxClock}T12:00:00+08:00`))}><span>13</span><div><b>模拟到期 Token 处置</b><small>与名册清偿分开，逐持有人留存模拟处置记录</small></div></button>
              <button onClick={() => runScenarioStep("确认债权模拟清偿", current => completeDebt(current, selectedOfferingId, `${current.sandboxClock}T12:00:00+08:00`))}><span>14</span><div><b>确认 Sandbox 债权清偿完成</b><small>仅在本息、名册、Token 和所有义务均结清后产生唯一完成记录</small></div></button>
            </div>
          </section>
          <section>
            <h3>
              <span>05</span>事件历史
            </h3>
            <div className="mock-event-log">
              {state.mockEvents.slice(0, 6).map((event) => (
                <div key={event.id}>
                  <Status value={event.result} />
                  <span>
                    <b>{event.type}</b>
                    <small>
                      {event.offeringId} · {event.detail}
                    </small>
                  </span>
                  <time>{event.time}</time>
                </div>
              ))}
              {!state.mockEvents.length && <p>尚未执行 Mock 生产事件。</p>}
            </div>
          </section>
          <section>
            <h3>
              <span>06</span>当前数据
            </h3>
            <div className="data-counts">
              <span>
                <b>{state.assets.length}</b>资产
              </span>
              <span>
                <b>{state.offerings.length}</b>Offering
              </span>
              <span>
                <b>{state.investors.length}</b>投资者
              </span>
              <span>
                <b>{state.orders.length}</b>订单
              </span>
              <span>
                <b>{state.tokens.length}</b>Token 记录
              </span>
            </div>
          </section>
        </div>
        <div className="demo-footer">
          <div>
            <b>当前：{state.scenario}</b>
            <small>刷新页面后仍会保留当前状态</small>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm("确认清除全部本地演示数据并恢复首次进入状态？")) {
                setState({ ...emptyState, messages: emptyState.messages.map((x) => ({ ...x })) });
                go("dashboard");
                close();
                toast("已重置当前演示副本；旧版原始记录仍保留");
              }
            }}
          >
            <RefreshCcw size={15} />
            重置全部数据
          </Button>
        </div>
      </div>
    </div>
  );
}

function DrawerPanel({
  drawer,
  state,
  setState,
  setDrawer,
  close,
  go,
  toast,
  inline = false,
}: {
  drawer: NonNullable<Drawer>;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setDrawer: (drawer: Drawer) => void;
  close: () => void;
  go: (m: ModuleId, t?: string) => void;
  toast: (s: string) => void;
  inline?: boolean;
}) {
  const [confirmAction, setConfirmAction] = useState<"offering" | "distribution" | null>(null);
  const [declarationFor, setDeclarationFor] = useState("");
  const requestClose = () => {
    if (drawer.type === "wallet-create" && !confirm("关闭将放弃尚未保存的钱包信息，确认继续？"))
      return;
    close();
  };
  const titleMap: Record<string, string> = {
    "asset-detail": "资产详情",
    "asset-create": "创建资产",
    "asset-edit": "编辑资产资料",
    "instrument-detail": "权益结构详情",
    "instrument-create": "配置权益结构",
    "offering-detail": "Offering 详情",
    "issuance-readiness": "发行准备资料",
    "offering-create": "新建 Offering",
    "investor-detail": "投资者详情",
    "order-detail": "订单详情",
    "holder-detail": "持有人详情",
    "payment-detail": "付款详情",
    "token-detail": "Token 操作详情",
    "wallet-detail": "钱包详情",
    "wallet-create": "绑定钱包",
    "distribution-detail": "分配批次详情",
    "distribution-create": "创建分配批次",
    "rent-report-create": "上报住宅净租金",
    "rent-batch-create": "创建住宅租金分配批次",
    "debt-interest-create": "创建债权月息批次",
    "debt-principal-create": "创建到期本金偿还批次",
    catalog: "资产分类目录",
  };
  if (drawer.type === "portal-preview") return <PortalPreview state={state} close={close} />;
  const asset = state.assets.find((x) => x.id === drawer.id);
  const ins = state.instruments.find((x) => x.id === drawer.id);
  const off = state.offerings.find((x) => x.id === drawer.id);
  const readinessReport = state.readinessReports.find((item) => item.offeringId === off?.id);
  const readinessStale = !!off && !!readinessReport && readinessReport.fingerprint !== readinessFingerprint(state, off.id);
  const issuanceTask = state.issuanceTasks.find((item) => item.offeringId === off?.id);
  const publication = state.publications.find((item) => item.offeringId === off?.id);
  const runReadiness = (current: Offering) => {
    setState((latest) => {
      const report = checkIssuanceReadiness(latest, current.id, new Date().toISOString());
      queueMicrotask(() => toast(report.groups.every((item) => item.passed) ? "七组发行准备检查全部通过" : "发行准备仍有未完成事项；请按每组原因返回修改"));
      return { ...latest, readinessReports: [...latest.readinessReports.filter((item) => item.offeringId !== current.id), report] };
    });
  };
  const submitReadiness = (current: Offering) => {
    setState((latest) => {
      const result = submitSandboxIssuance(latest, current.id, declarationFor === current.id, new Date().toISOString());
      queueMicrotask(() => toast(result.error || "Sandbox 发行任务已提交；请在独立测试控制区执行并查询结果"));
      return result.state;
    });
  };
  const investor = state.investors.find((x) => x.id === drawer.id);
  const order = state.orders.find((x) => x.id === drawer.id);
  const holder = state.holders.find((x) => x.id === drawer.id);
  const payment = state.payments.find((x) => x.id === drawer.id);
  const token = state.tokens.find((x) => x.id === drawer.id);
  const wallet = state.wallets.find((x) => x.id === drawer.id);
  const dist = state.distributions.find((x) => x.id === drawer.id);
  const orderRelatedIds = order
    ? [
        order.id,
        ...state.payments.filter((item) => item.orderId === order.id).map((item) => item.id),
        ...state.holders.filter((item) => item.orderId === order.id).map((item) => item.id),
        ...state.tokens.filter((item) => item.orderId === order.id).map((item) => item.id),
      ]
    : [];
  const orderHistory = order
    ? operationRows(state).filter((activity) => orderRelatedIds.includes(activity.object))
    : [];
  const holderOffering = holder
    ? state.offerings.find((offering) => offering.id === holder.offeringId)
    : undefined;
  const holderInstrument = holderOffering
    ? state.instruments.find((instrument) => instrument.id === holderOffering.instrumentId)
    : undefined;
  const holderDistributions = holder
    ? state.distributions.filter((distribution) =>
        distribution.items?.some((item) => item.holderId === holder.id),
      )
    : [];
  const holderPaidIncome = holder
    ? state.investorIncomes.filter(income => income.holderId === holder.id).reduce((sum, income) => sum + income.amount, 0)
      + holderDistributions
        .filter(
          (distribution) =>
            !distribution.calculationStatus && distribution.status === "支付完成" && distribution.eventType !== "债权本金",
        )
        .flatMap((distribution) => distribution.items || [])
        .filter((item) => item.holderId === holder.id && item.status === "支付完成")
        .reduce((sum, item) => sum + item.amount, 0)
    : 0;
  const holderPaidPrincipal = holder ? paidDebtPrincipal(state, holder.offeringId, holder.id) : 0;
  const holderOriginalPrincipal = holder && holderInstrument?.type === "债权"
    ? state.allocations.find(row => row.orderId === holder.orderId)?.rights
      || state.holderSnapshots.find(row => row.offeringId === holder.offeringId && row.lines.some(line => line.holderId === holder.id))
        ?.lines.find(line => line.holderId === holder.id)?.rights || holder.rights
    : 0;
  const invalidCoreDetail =
    (drawer.type === "asset-detail" && !asset) ||
    (drawer.type === "instrument-detail" && !ins) ||
    ((drawer.type === "offering-detail" || drawer.type === "issuance-readiness") && !off);
  const runAssetCheck = (current: Asset) => {
    const missing = assetMissing(current);
    setState((s) => ensureProjects({
      ...s,
      assets: s.assets.map((item) =>
        item.id === current.id
          ? { ...item, missing, status: missing.length ? "Draft" : "Ready", updated: "刚刚" }
          : item,
      ),
      activities: [
        newActivity(
          "资产与发行",
          current.id,
          "运行资产资料检查",
          missing.length ? "未通过" : "成功",
        ),
        ...s.activities,
      ],
    }));
    toast(
      missing.length
        ? `资料检查未通过：${missing.slice(0, 3).join("、")}`
        : "资产资料检查通过，状态已更新为 Ready",
    );
  };
  const runInstrumentCheck = (current: Instrument) => {
    const parent = state.assets.find((item) => item.id === current.assetId);
    const missing = instrumentMissing(current, parent);
    setState((s) => ensureProjects({
      ...s,
      instruments: s.instruments.map((item) =>
        item.id === current.id
          ? { ...item, missing, status: missing.length ? "Draft" : "Ready", updated: "刚刚" }
          : item,
      ),
      activities: [
        newActivity(
          "资产与发行",
          current.id,
          "运行权益结构检查",
          missing.length ? "未通过" : "成功",
        ),
        ...s.activities,
      ],
    }));
    toast(
      missing.length
        ? `权益检查未通过：${missing.slice(0, 3).join("、")}`
        : "权益结构检查通过，状态已更新为 Ready",
    );
  };
  const confirmOffering = (current: Offering) => {
    setState((latest) => {
      const result = confirmIssuerOffering(latest, current.id, current.revision || 1, new Date().toISOString());
      queueMicrotask(() => toast(result.error
        ? `无法确认发行：${result.error}`
        : result.changed
          ? "已完成内部发行确认并预留容量；请进入发行准备"
          : "该 Offering 已确认，未重复预留容量"));
      return result.changed
        ? { ...result.state, activities: [newActivity("资产与发行", current.id, "确认 Offering 并预留容量"), ...latest.activities] }
        : latest;
    });
  };
  const confirmDistribution = (current: NonNullable<typeof dist>) => {
    if (current.eventType === "租金收益" && current.reportId) {
      setState(latest => {
        const result = confirmRentBatch(latest, current.id);
        queueMicrotask(() => toast(result.error || (result.changed ? "住宅租金批次已确认；下一步在测试控制区逐笔 Mock 支付" : "该批次已确认，未重复操作")));
        return result.state;
      });
      return;
    }
    if (current.debtScheduleId) {
      setState(latest => {
        const result = confirmDebtBatch(latest, current.id);
        queueMicrotask(() => toast(result.error || (result.changed ? "债权批次已确认；下一步在测试控制区逐笔 Mock 支付" : "该批次已确认")));
        return result.state;
      });
      return;
    }
    const duplicate = state.distributions.find(
      (distribution) =>
        distribution.id !== current.id &&
        distribution.offeringId === current.offeringId &&
        distribution.eventType === current.eventType &&
        distribution.period === current.period &&
        distribution.recordDate === current.recordDate &&
        distribution.instrumentId === current.instrumentId &&
        ["待注资", "支付完成"].includes(distribution.status),
    );
    if (duplicate)
      return toast(
        `不能确认重复批次：相同 Offering、类型、周期和 Record Date 已存在 ${duplicate.id}`,
      );
    const validHolders = state.holders.filter(
      (holder) => holder.offeringId === current.offeringId && holder.registration === "登记有效",
    );
    if (!validHolders.length)
      return toast(
        `不能确认分配：${current.blockedReason || "Record Date 没有有效持有人或权益快照"}`,
      );
    if (current.proofFile && current.proofFile.status !== "可引用")
      return toast("收益依据文件尚未完成 Mock 扫描");
    if (current.eventType === "租金收益" && !current.proofFile)
      return toast("不能确认分配：缺少实际租金收入证明");
    if (current.status === "待注资" || current.status === "支付完成")
      return toast("该批次已经确认，不会重复确认");
    const totalBasis = validHolders.reduce((sum, holder) => sum + holder.rights, 0);
    const items = validHolders.map((holder) => ({
      holderId: holder.id,
      investorId: holder.investorId,
      basis: holder.rights,
      amount: Number(((current.gross * holder.rights) / totalBasis).toFixed(2)),
      status: "待支付",
    }));
    setState((s) => ({
      ...s,
      distributions: s.distributions.map((item) =>
        item.id === current.id
          ? {
              ...item,
              status: "待注资",
              recipients: validHolders.length,
              items,
              blockedReason: undefined,
            }
          : item,
      ),
      activities: [newActivity("收益与分配", current.id, "确认收益分配批次"), ...s.activities],
    }));
    toast("合法批次已确认；确认不等于已支付");
  };
  return (
    <div className={`drawer-layer ${inline ? "inline" : ""}`}>
      {!inline && <div className="backdrop" onClick={requestClose} />}
      <aside className={`drawer ${inline ? "inline" : ""}`}>
        <div className="drawer-head">
          <div>
            <div className="eyebrow">RWA ISSUER · DEMO</div>
            <h2>{titleMap[drawer.type] || "业务详情"}</h2>
          </div>
          <button onClick={requestClose}>
            {inline ? <ArrowLeft size={20} /> : <X size={20} />}
          </button>
        </div>
        <div className="drawer-body">
          {invalidCoreDetail && (
            <div className="invalid-detail">
              <AlertCircle size={30} />
              <div className="eyebrow">对象未找到</div>
              <h3>无法加载此业务对象</h3>
              <p>
                ID「{drawer.id || "Unknown"}
                」不存在、已失效或不属于当前企业。系统没有将您静默返回工作台。
              </p>
              <Button onClick={close}>返回对应列表</Button>
            </div>
          )}
          {drawer.type === "catalog" && (
            <div className="catalog">
              {categories.map(([cat, items]) => (
                <section key={cat}>
                  <h3>
                    {cat}
                    <span>{items.length} 个子类</span>
                  </h3>
                  <div>
                    {items.map((x) => (
                      <span className={x.endsWith("★") ? "open" : ""} key={x}>
                        {x.replace("★", "")}
                        {x.endsWith("★") ? <b>V1 可创建</b> : <small>暂未开放</small>}
                      </span>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          {drawer.type === "asset-create" && (
            <CreateAsset state={state} setState={setState} close={close} toast={toast} />
          )}
          {drawer.type === "asset-edit" && asset && (
            <CreateAsset
              state={state}
              setState={setState}
              close={close}
              toast={toast}
              existing={asset}
            />
          )}
          {drawer.type === "instrument-create" && (
            <CreateInstrument state={state} setState={setState} close={close} toast={toast} />
          )}
          {drawer.type === "offering-create" && (
            <CreateOffering state={state} setState={setState} close={close} toast={toast} preferredAssetId={drawer.id} />
          )}
          {drawer.type === "wallet-create" && (
            <CreateWallet setState={setState} close={close} toast={toast} />
          )}
          {drawer.type === "distribution-create" && (
            <CreateDebtBatch state={state} setState={setState} close={close} toast={toast} kind="interest" />
          )}
          {drawer.type === "rent-report-create" && <CreateRentReport state={state} setState={setState} close={close} toast={toast} />}
          {drawer.type === "rent-batch-create" && <CreateRentBatch state={state} setState={setState} close={close} toast={toast} />}
          {drawer.type === "debt-interest-create" && <CreateDebtBatch state={state} setState={setState} close={close} toast={toast} kind="interest" preferredOfferingId={drawer.id} preferredEventId={drawer.eventId} />}
          {drawer.type === "debt-principal-create" && <CreateDebtBatch state={state} setState={setState} close={close} toast={toast} kind="principal" preferredOfferingId={drawer.id} />}
          {asset && drawer.type === "asset-detail" && (
            <>
              <DetailHero title={asset.name} id={asset.code} status={asset.status} />
              <div className="detail-grid">
                <D label="资产类别" value={`${asset.category} / ${asset.subtype}`} />
                <D label="约定价格 / 债权规模" value={formatU(assetAgreedValueU(asset))} />
                <D label="第三方评估价值" value={assetAppraisalLabel(asset)} />
                <D label="所在地区" value={asset.location || "不适用"} />
                <D
                  label="评估日期"
                  value={String(
                    asset.details?.appraisalDate || asset.details?.valuationDate || "尚未填写",
                  )}
                />
                <D
                  label="评估机构"
                  value={String(asset.details?.appraiser || "债权估值依据见归档文件")}
                />
              </div>
              {asset.subtype === "住宅物业" && asset.details && (
                <Section title="住宅与租约事实">
                  <div className="detail-grid">
                    <D label="物业地址" value={String(asset.details.address || "未填写")} />
                    <D
                      label="户型 / 面积"
                      value={`${asset.details.propertyLayout || "—"} / ${asset.details.area || "—"}㎡`}
                    />
                    <D label="权利人" value={String(asset.details.owner || "未填写")} />
                    <D label="权利性质" value={String(asset.details.rightNature || "未填写")} />
                    <D
                      label="资产约定价格"
                      value={`¥${Number(asset.details.agreedPriceCny || 0).toLocaleString()}`}
                    />
                    <D
                      label="第三方评估"
                      value={`¥${Number(asset.details.appraisalCny || 0).toLocaleString()}`}
                    />
                    <D label="评估机构" value={String(asset.details.appraiser || "未填写")} />
                    <D
                      label="合同月租金"
                      value={`¥${Number(asset.details.monthlyRentCny || 0).toLocaleString()} / 月`}
                    />
                    <D
                      label="租赁期间"
                      value={`${asset.details.leaseStart || "—"} 至 ${asset.details.leaseEnd || "—"}`}
                    />
                  </div>
                  <p className="body-copy">
                    资产约定价格、第三方评估、租赁合同金额与 Token 募集额分别记录，不互相替代。
                  </p>
                </Section>
              )}
              {asset.subtype === "单笔企业借款债权" && asset.details && (
                <Section title="底层借款债权事实">
                  <div className="detail-grid">
                    <D label="合同编号" value={String(asset.details.contractNumber || "未填写")} />
                    <D
                      label="债权人 / 债务人"
                      value={`${asset.details.creditor || "—"} / ${asset.details.debtor || "—"}`}
                    />
                    <D
                      label="合同 / 未偿本金"
                      value={`${formatU(Number(asset.details.principal || 0))} / ${formatU(Number(asset.details.outstanding || 0))}`}
                    />
                    <D label="合同利率" value={`${asset.details.annualRate || "—"}%`} />
                    <D
                      label="起息 / 到期"
                      value={`${asset.details.interestStart || "—"} / ${asset.details.maturity || "—"}`}
                    />
                    <D
                      label="还本与履约"
                      value={`${asset.details.repayment || "—"} · ${asset.details.performance || "—"}`}
                    />
                  </div>
                  <p className="body-copy">
                    底层债务人及合同利率不会自动成为 Instrument 下发行企业对投资者的债务条款。
                  </p>
                </Section>
              )}
              <Section title="权属与估值">
                <p className="body-copy">
                  文件由用户在本地选择，只有内部 Mock 扫描事件完成后才可用于 Ready 检查。
                </p>
                {asset.files?.length ? (
                  asset.files.map((file) => (
                    <div className="file-box" key={file.id}>
                      <FileText size={18} />
                      <span>
                        <b>{file.name}</b>
                        <small>
                          {file.category} · {file.id}
                        </small>
                      </span>
                      <Status value={file.status} />
                    </div>
                  ))
                ) : (
                  <Empty
                    title="尚未上传资料"
                    text="当前资产没有任何本地文件记录，不能显示已归档或 Ready。"
                  />
                )}
                {asset.missing?.length ? (
                  <div className="missing-list">
                    <b>当前缺项</b>
                    {asset.missing.map((item) => (
                      <span key={item}>· {item}</span>
                    ))}
                  </div>
                ) : null}
                <Button variant="secondary" onClick={() => runAssetCheck(asset)}>
                  <ClipboardCheck size={15} />
                  完成资料检查
                </Button>
              </Section>
              <Section title="关联业务">
                <LinkRow
                  label="当前权益结构"
                  value={state.instruments.find((i) => i.assetId === asset.id)?.name || "尚未配置"}
                  onClick={() => {
                    close();
                    go("assets", "权益结构");
                  }}
                />
                <LinkRow
                  label="发行期次"
                  value={`${state.offerings.filter((o) => o.assetId === asset.id).length} 个 Offering`}
                  onClick={() => {
                    close();
                    go("assets", "发行管理");
                  }}
                />
                {!state.instruments.some((item) => item.assetId === asset.id) && asset.status === "Ready" && (
                  <Button onClick={() => setDrawer({ type: "instrument-create", id: asset.id })}>配置该资产的权益结构</Button>
                )}
                {state.instruments.some((item) => item.assetId === asset.id && item.status === "Ready") && (
                  <Button onClick={() => setDrawer({ type: "offering-create", id: asset.id })}>新建该资产的 Offering</Button>
                )}
              </Section>
              <Button
                variant="secondary"
                disabled={state.offerings.some(
                  (offering) => offering.assetId === asset.id && offering.confirmed,
                )}
                onClick={() => setDrawer({ type: "asset-edit", id: asset.id })}
              >
                {state.offerings.some(
                  (offering) => offering.assetId === asset.id && offering.confirmed,
                )
                  ? "已被确认 Offering 引用，禁止覆盖"
                  : "继续编辑资产草稿"}
              </Button>
            </>
          )}
          {ins && (
            <>
              <DetailHero title={ins.name} id={ins.id} status={ins.status} />
              <div className="detail-grid">
                <D label="权益类型" value={ins.type} />
                <D label="当前版本" value={ins.version} />
                <D label="权益总量" value={`${ins.totalRights.toLocaleString()} ${ins.unit}`} />
                <D label="Token 最大份数" value={ins.tokenCap.toLocaleString()} />
              </div>
              <Section title="容量分配">
                <div className="capacity large">
                  <span style={{ width: `${(ins.used / ins.tokenCap) * 100}%` }} />
                </div>
                <div className="capacity-labels">
                  <span>
                    已占用 <b>{ins.used.toLocaleString()}</b>
                  </span>
                  <span>
                    剩余 <b>{(ins.tokenCap - ins.used).toLocaleString()}</b>
                  </span>
                </div>
                <div className="formula">
                  <span>每 Token 对应权益</span>
                  <b>
                    {ins.totalRights / ins.tokenCap} {ins.unit}
                  </b>
                  <Status value="精确可整除" />
                </div>
              </Section>
              <Section title="法律权利与现金流条款">
                <div className="detail-grid">
                  <D
                    label="责任 / 偿付主体"
                    value={String(ins.terms?.responsibleParty || "未填写")}
                  />
                  <D
                    label="权益期间"
                    value={`${ins.terms?.startDate || "—"} 至 ${ins.terms?.maturityDate || "—"}`}
                  />
                  <D
                    label={ins.type === "债权" ? "固定年利率" : "收益参与比例"}
                    value={
                      ins.type === "债权"
                        ? `${ins.terms?.annualRate || "—"}%`
                        : `${ins.terms?.participationRate || "—"}%`
                    }
                  />
                  <D label="分配 / 付息频率" value={String(ins.terms?.frequency || "未填写")} />
                </div>
                <p className="body-copy">
                  {String(ins.terms?.rightsDescription || "尚未填写权利描述")}
                </p>
              </Section>
              <Section title="版本守卫">
                <p className="body-copy">
                  历史 Offering 已冻结引用 {ins.version}
                  。创建新版本不会静默覆盖既有订单、条款或交易快照。
                </p>
                {ins.files?.map((file) => (
                  <div className="file-box" key={file.id}>
                    <FileText size={18} />
                    <span>
                      <b>{file.name}</b>
                      <small>{file.category}</small>
                    </span>
                    <Status value={file.status} />
                  </div>
                ))}
                {ins.missing?.length ? (
                  <div className="missing-list">
                    <b>当前缺项</b>
                    {ins.missing.map((item) => (
                      <span key={item}>· {item}</span>
                    ))}
                  </div>
                ) : null}
                <Button variant="secondary" onClick={() => runInstrumentCheck(ins)}>
                  <ClipboardCheck size={15} />
                  完成权益检查
                </Button>
              </Section>
            </>
          )}
          {off && drawer.type === "issuance-readiness" && (
            <>
              <DetailHero title={off.name} id={`${off.id} · 发行准备`} status={off.publicationStatus || issuanceTask?.status || (off.confirmed ? "方案已确认" : "方案未确认")} />
              <div className="info-note"><FileText size={17} /><p>当前为 Sandbox 模拟发行。确认快照固定 Asset、Instrument、Project、钱包和文件引用；此处的合约、发布和认购状态均不代表真实链上或真实收款。</p></div>
              {!off.confirmed && <div className="banner warning">请先在 Offering 详情完成内部发行确认。</div>}
              {off.confirmed && !off.confirmationSnapshot && <div className="banner warning">旧版已确认记录缺少历史确认快照；已保留原记录，需核对版本证据后才能继续执行。</div>}
              <Section title="发行对象与固定引用">
                <div className="detail-grid">
                  <D label="Offering" value={`${off.id} · ${off.round}`} />
                  <D label="Project" value={state.projects.find((item) => item.id === off.projectId)?.name || "关联待核对"} />
                  <D label="Asset" value={`${off.confirmationSnapshot?.asset.name || state.assets.find((item) => item.id === off.assetId)?.name || "缺失"} · ${off.confirmationSnapshot?.asset.version ? `v${off.confirmationSnapshot.asset.version}` : "旧记录未版本化"}`} />
                  <D label="Instrument" value={`${off.confirmationSnapshot?.instrument.name || state.instruments.find((item) => item.id === off.instrumentId)?.name || "缺失"} · ${off.instrumentVersion || "版本待核对"}`} />
                  <D label="容量预留" value={`${off.confirmationSnapshot?.reservedTokens ?? off.tokens} Token`} />
                  <D label="确认时间" value={off.confirmationSnapshot?.confirmedAt || "旧版未记录"} />
                  <D label="收款钱包" value={off.confirmationSnapshot?.walletAddress || state.wallets.find((item) => item.id === off.walletId)?.address || "缺失"} />
                </div>
              </Section>
              <Section title="固定文件引用">
                {[...(off.confirmationSnapshot?.asset.files || state.assets.find((item) => item.id === off.assetId)?.files || []), ...(off.confirmationSnapshot?.instrument.files || state.instruments.find((item) => item.id === off.instrumentId)?.files || []), ...(off.confirmationSnapshot?.disclosureFiles || off.disclosureFiles || [])].map((file) => (
                  <div className="file-box" key={file.id}><FileText size={18} /><span><b>{file.name}</b><small>{file.category} · {file.id} · {file.version ? `v${file.version}` : "旧记录未版本化"}</small></span><Status value={file.status} /></div>
                ))}
              </Section>
              <Section title="七组发行准备检查">
                <p className="body-copy">逐组核对当前业务数据。资料或版本变化后，原检查结果作废，需重新检查。</p>
                <Button variant="secondary" onClick={() => runReadiness(off)}><RefreshCcw size={15} />重新检查七组条件</Button>
                {!readinessReport && <div className="banner warning">尚未执行检查；下一步：点击“重新检查七组条件”。</div>}
                {readinessStale && <div className="banner warning">资料或状态已变化，检查结果过期；请重新检查。</div>}
                {readinessReport?.groups.map((item) => (
                  <div className="file-box" key={item.key}>
                    <ClipboardCheck size={18} />
                    <span><b>{item.key}. {item.title}</b><small>{item.passed ? "已通过" : item.reasons.join("；")}</small></span>
                    <Status value={readinessStale ? "需重检" : item.passed ? "通过" : "未通过"} />
                    {!item.passed && <Button variant="ghost" onClick={() => {
                      if (item.key === 1) { close(); go("company", "企业资料与 KYB"); }
                      else if (item.key === 2) setDrawer({ type: "asset-detail", id: off.assetId });
                      else if (item.key === 3) setDrawer({ type: "instrument-detail", id: off.instrumentId });
                      else if (item.key === 5) { close(); go("company", "钱包管理"); }
                      else setDrawer({ type: "offering-detail", id: off.id });
                    }}>返回修改</Button>}
                  </div>
                ))}
              </Section>
              <Section title="责任确认与 Sandbox 发行">
                <p className="body-copy">当前企业账号须确认发行资料、风险披露和模拟执行责任。发行任务提交后，在“内部 Mock 控制台”执行并核验原任务；Unknown 不得重新提交。</p>
                <label className="field"><span><input type="checkbox" checked={declarationFor === off.id} onChange={(event) => setDeclarationFor(event.target.checked ? off.id : "")} /> 我已阅读并确认本期发行资料、风险披露及 Sandbox 模拟执行责任</span></label>
                <Button onClick={() => submitReadiness(off)} disabled={!!issuanceTask || !!publication || !readinessReport || readinessStale || !readinessReport.groups.every((item) => item.passed) || declarationFor !== off.id}>确认并发起发行</Button>
                <div className="detail-grid">
                  <D label="执行任务" value={issuanceTask ? `${issuanceTask.id} · ${issuanceTask.status}` : "未发起"} />
                  <D label="Sandbox 发布" value={off.publicationStatus || "未发布"} />
                  <D label="Contract" value={off.contractStatus || "未申请"} />
                  <D label="Token" value={off.tokenIssuanceStatus || "未发行"} />
                  <D label="认购销售" value={off.subscriptionStatus || "未开放"} />
                  <D label="Sandbox 测试日期" value={state.sandboxClock || "未设置"} />
                  <D label="发布快照" value={publication?.id || "无"} />
                </div>
                {issuanceTask?.reason && <div className="banner warning">{issuanceTask.reason}</div>}
                <p className="body-copy">{!issuanceTask ? "下一步：完成七组检查并由本人确认责任声明。" : issuanceTask.status === "已提交" ? "下一步：打开内部 Mock 控制台，执行该已提交任务。" : issuanceTask.status === "执行中" || issuanceTask.status === "Unknown" ? "下一步：在内部 Mock 控制台记录或查询原任务结果。" : issuanceTask.status === "失败" ? "执行失败；保留原任务和原因，待人工核对。" : off.subscriptionStatus === "Sandbox 认购中" ? "Sandbox 认购窗口已开放。" : "模拟发布已完成；请在测试控制区核对认购时间窗口。"}</p>
                <Button variant="secondary" onClick={() => setDrawer({ type: "offering-detail", id: off.id })}>返回 Offering 详情</Button>
              </Section>
            </>
          )}
          {off && drawer.type === "offering-detail" && (
            <>
              {(() => {
                const orderIds = state.orders
                  .filter((order) => order.offeringId === off.id)
                  .map((order) => order.id);
                const raised = state.payments
                  .filter(
                    (payment) =>
                      orderIds.includes(payment.orderId) && payment.status === "最终匹配",
                  )
                  .reduce((sum, payment) => sum + payment.received, 0);
                const target = off.tokens * off.price;
                return (
                  <>
                    <DetailHero
                      title={off.name}
                      id={`${off.id} · ${off.round}`}
                      status={off.subscriptionStatus || off.status}
                    />
                    <div className="detail-grid">
                      <D label="Token 发行份数" value={off.tokens.toLocaleString()} />
                      <D label="每 Token 价格" value={formatU(off.price)} />
                      <D label="募集目标" value={formatU(target)} />
                      <D label="已募集金额" value={formatU(raised)} />
                      <D label="剩余募集金额" value={formatU(Math.max(0, target - raised))} />
                      <D label="最低认购" value={formatU(off.minimum || 0)} />
                      <D label="时区" value="UTC+8" />
                      <D label="模拟合约" value={off.contractStatus || "未申请"} />
                      <D label="Sandbox 发布" value={off.publicationStatus || "未发布"} />
                      <D label="Token" value={off.tokenIssuanceStatus || "未发行"} />
                      {off.publicationStatus === "Sandbox 已发布" && <D label="Sandbox 测试日期" value={state.sandboxClock || "未设置"} />}
                    </div>
                    {off.summary && (
                      <div className="info-note">
                        <FileText size={17} />
                        <p>{off.summary}</p>
                      </div>
                    )}
                    <Section title="发行时间">
                      <div className="timeline-simple">
                        <span>
                          <i />
                          <small>开始</small>
                          <b>{off.start}</b>
                        </span>
                        <em />
                        <span>
                          <i />
                          <small>结束</small>
                          <b>{off.end}</b>
                        </span>
                      </div>
                    </Section>
                    <Section title="关联与守卫">
                      <D label="内部 Project" value={state.projects.find((item) => item.id === off.projectId)?.name || "待核对"} />
                      <D label="引用版本" value={`Asset v${off.assetVersion || 1} · Instrument ${off.instrumentVersion || "待核对"} · Offering r${off.revision || 1}`} />
                      <LinkRow
                        label="资产档案"
                        value={state.assets.find((a) => a.id === off.assetId)?.name || ""}
                        onClick={() => {
                          close();
                          go("assets", "资产管理");
                        }}
                      />
                      <LinkRow
                        label="权益版本"
                        value={state.instruments.find((i) => i.id === off.instrumentId)?.name || ""}
                        onClick={() => {
                          close();
                          go("assets", "权益结构");
                        }}
                      />
                      <LinkRow
                        label="企业收款钱包"
                        value={state.wallets.find((w) => w.id === off.walletId)?.name || "未选择"}
                        onClick={() => {
                          close();
                          go("company", "钱包管理");
                        }}
                      />
                      <LinkRow
                        label="发行披露"
                        value={
                          off.disclosureFiles?.[0]
                            ? `${off.disclosureFiles[0].name} · ${off.disclosureFiles[0].status}`
                            : "未上传"
                        }
                        onClick={() =>
                          toast("发行披露文件只能通过创建/编辑草稿选择，并由 Mock 控制台扫描")
                        }
                      />
                    </Section>
                    <Section title="最终发行确认">
                      <div className="guard-list">
                        <span>
                          <Check size={15} />
                          Asset Ready
                        </span>
                        <span>
                          <Check size={15} />
                          Instrument 固定版本
                        </span>
                        <span>
                          <Check size={15} />
                          唯一容量池
                        </span>
                        <span>
                          <Check size={15} />
                          企业结算钱包
                        </span>
                      </div>
                      <p className="body-copy">
                        确认只会冻结本期引用并预留授权容量，不会自动部署、收款、配售、登记或 Mint。
                      </p>
                      <Button onClick={() => setConfirmAction("offering")} disabled={off.confirmed}>
                        {off.confirmed ? "已完成内部发行确认" : "确认发行并运行准入检查"}
                      </Button>
                      {off.confirmed && (
                        <Button onClick={() => setDrawer({ type: "issuance-readiness", id: off.id })}>进入发行准备</Button>
                      )}
                    </Section>
                    {!off.confirmed && off.status === "草稿" && (
                      <Button
                        variant="secondary"
                        onClick={() => setDrawer({ type: "offering-edit", id: off.id })}
                      >
                        编辑 Offering 草稿
                      </Button>
                    )}
                    <div className="info-note">
                      <AlertCircle size={17} />
                      <p>
                        <b>受控演示提示</b>
                        <br />
                        即使 Standard 有效，公开发行、支付、法律登记与链上交易仍未接入生产服务。
                      </p>
                    </div>
                  </>
                );
              })()}
            </>
          )}
          {investor && (
            <>
              <DetailHero title={investor.name} id={investor.id} status={investor.kyc} />
              <div className="privacy">
                <LockKeyhole size={18} />
                <p>身份信息由平台统一管理，Issuer 仅查看获授权脱敏字段。</p>
              </div>
              <div className="detail-grid">
                <D label="投资者类型" value={investor.type} />
                <D label="KYC 状态" value={investor.kyc} />
                <D label="关联 Offering" value={`${investor.offeringIds.length} 个`} />
                <D
                  label="关联订单"
                  value={`${state.orders.filter((o) => o.investorId === investor.id).length} 笔`}
                />
              </div>
              <Section title="下一步">
                <p className="body-copy">
                  {investor.kyc === "有效通过"
                    ? "当前 KYC 有效；是否可认购仍需检查 Offering 规则、合同与容量。"
                    : investor.kyc === "Unknown"
                      ? "平台 KYC 状态暂无法确认，不可直接重试或允许认购。"
                      : "需由投资者本人在平台侧完成后续动作，Issuer 不可代为修改。"}
                </p>
              </Section>
            </>
          )}
          {order && (
            <>
              <DetailHero
                title={order.id}
                id={`${state.investors.find((i) => i.id === order.investorId)?.name} · ${order.created}`}
                status={order.status}
              />
              <div className="quote">
                <span>固定订单报价快照</span>
                <strong>{formatU(order.amount)}</strong>
                <small>
                  {order.requested.toLocaleString()} Token ×{" "}
                  {formatU(order.amount / order.requested)}
                </small>
              </div>
              <div className="detail-grid">
                <D
                  label="投资者"
                  value={`${state.investors.find((i) => i.id === order.investorId)?.name || "Unknown"} · ${order.investorId}`}
                />
                <D
                  label="所属 Offering"
                  value={`${state.offerings.find((offering) => offering.id === order.offeringId)?.name || "Unknown"} · ${order.offeringId}`}
                />
                <D
                  label="申请 / 确认数量"
                  value={`${order.requested} / ${order.confirmed} Token`}
                />
                <D label="认购金额" value={formatU(order.amount)} />
              </div>
              <div className="event-flow">
                {[
                  ["订单", "已提交"],
                  ["付款", order.payment],
                  ["配售", order.confirmed ? "已确认" : "未开始"],
                  [
                    "登记",
                    state.holders.find((h) => h.orderId === order.id)?.registration || "未开始",
                  ],
                  ["Token", order.delivery],
                ].map((x, i) => (
                  <div
                    key={String(x[0])}
                    className={i === 0 || !String(x[1]).includes("未") ? "active" : ""}
                  >
                    <span>{i + 1}</span>
                    <b>{x[0]}</b>
                    <small>{x[1]}</small>
                  </div>
                ))}
              </div>
              <Section title="独立业务记录">
                <LinkRow
                  label="付款记录"
                  value={state.payments.find((p) => p.orderId === order.id)?.id || "尚无"}
                  onClick={() => {
                    close();
                    go("funds", "收款与对账");
                  }}
                />
                <LinkRow
                  label="持有人 / 登记"
                  value={state.holders.find((h) => h.orderId === order.id)?.id || "尚未形成"}
                  onClick={() => {
                    close();
                    go("investors", "持有人管理");
                  }}
                />
                <LinkRow
                  label="Token 操作"
                  value={state.tokens.find((t) => t.orderId === order.id)?.id || "尚未发起"}
                  onClick={() => {
                    close();
                    go("token", "Token 操作");
                  }}
                />
              </Section>
              <Section title="异常与操作历史">
                <div className="detail-grid">
                  <D
                    label="异常原因"
                    value={
                      order.status === "异常"
                        ? state.payments.find((payment) => payment.orderId === order.id)?.status ||
                          "需要人工核查"
                        : "当前无异常"
                    }
                  />
                  <D label="订单创建时间" value={order.created} />
                </div>
                {orderHistory.length ? (
                  orderHistory.map((activity) => (
                    <div className="history-line" key={activity.id}>
                      <span>{activity.time}</span>
                      <b>
                        {activity.action}
                        <small>
                          {activity.module} · {activity.object}
                        </small>
                      </b>
                      <Status value={activity.result} />
                    </div>
                  ))
                ) : (
                  <p className="body-copy">当前没有与此订单、付款、登记或 Token 记录关联的操作日志。</p>
                )}
              </Section>
            </>
          )}
          {holder && (
            <>
              <DetailHero
                title={holder.id}
                id={state.investors.find((i) => i.id === holder.investorId)?.name || ""}
                status={holder.reconciliation}
              />
              <div className="compare">
                <div>
                  <span>法定权益</span>
                  <strong>{holder.rights.toLocaleString()}</strong>
                  <small>权益单位 · {holder.registration}</small>
                </div>
                <ArrowRight size={19} />
                <div>
                  <span>Token 持有</span>
                  <strong>{holder.tokens.toLocaleString()}</strong>
                  <small>链状态独立记录</small>
                </div>
              </div>
              <div className="detail-grid">
                <D
                  label="投资者"
                  value={`${state.investors.find((investor) => investor.id === holder.investorId)?.name || "Unknown"} · ${holder.investorId}`}
                />
                <D
                  label="所属 Offering"
                  value={`${state.offerings.find((offering) => offering.id === holder.offeringId)?.name || "Unknown"} · ${holder.offeringId}`}
                />
                <D label="持仓状态" value={holder.registration} />
                <D label="来源订单" value={holder.orderId} />
              </div>
              <Section title="业务锁仓">
                <div className="detail-grid">
                  <D label="锁仓状态" value={holder.registration === "模拟已清偿" && holder.tokens === 0 ? "已结束" : holder.lock} />
                  <D label="锁仓到期" value={holder.lockUntil} />
                  <D label="起算依据" value="Token 实际最终交付" />
                  <D label="法律 / 管理冻结" value="无记录" />
                </div>
                <p className="body-copy">业务锁仓到期不等于真实链上解锁，也不代表法律冻结解除。</p>
              </Section>
              <Section title="历史变动与收益">
                <div className="detail-grid">
                  <D
                    label="Token 操作记录"
                    value={`${state.tokens.filter((record) => record.orderId === holder.orderId).length} 笔`}
                  />
                  <D
                    label="累计已支付收益"
                    value={formatU(holderPaidIncome)}
                  />
                  <D
                    label="关联分配批次"
                    value={`${
                      holderDistributions.length
                    } 个`}
                  />
                  <D label="当前对账" value={holder.reconciliation} />
                  {holderInstrument?.type === "债权" && (
                    <>
                      <D label="原始本金" value={formatU(holderOriginalPrincipal)} />
                      <D label="已偿还本金" value={formatU(holderPaidPrincipal)} />
                      <D
                        label="剩余未偿本金"
                        value={formatU(Math.max(0, holderOriginalPrincipal - holderPaidPrincipal))}
                      />
                      <D
                        label="本金状态"
                        value={
                          Math.max(0, holderOriginalPrincipal - holderPaidPrincipal) === 0
                            ? "已结清"
                            : holderPaidPrincipal > 0
                              ? "部分偿还"
                              : "未偿还"
                        }
                      />
                    </>
                  )}
                </div>
                {state.investorIncomes.filter(income => income.holderId === holder.id).map(income => <p className="body-copy" key={income.id}>{income.id} · {income.batchId} · {formatU6(income.amount)} · {income.status} · {income.at}</p>)}
                {state.distributionPayments.filter(payment => payment.holderId === holder.id && payment.status === "已支付"
                  && state.distributions.some(batch => batch.id === payment.batchId && batch.eventType === "债权本金"))
                  .map(payment => <p className="body-copy" key={payment.id}>{payment.id} · {payment.batchId} · {formatU6(payment.amount)} · Sandbox 模拟本金到账 · {payment.at}</p>)}
                <p className="body-copy">
                  累计收益仅包含实际支付的利息和租金，不包含已偿还本金。历史仅来自当前订单、Token
                  操作和收益批次。
                </p>
              </Section>
            </>
          )}
          {payment && (
            <>
              <DetailHero title={payment.id} id={payment.orderId} status={payment.status} />
              <div className="money-compare">
                <div>
                  <span>应收</span>
                  <b>{formatU(payment.expected)}</b>
                </div>
                <div>
                  <span>实收</span>
                  <b>{formatU(payment.received)}</b>
                </div>
                <div>
                  <span>差额</span>
                  <b>{formatU(payment.received - payment.expected)}</b>
                </div>
              </div>
              <Section title="付款证据">
                <div className="detail-grid">
                  <D label="网络 / 资产" value="OP Mainnet / USDT" />
                  <D label="记录时间" value={payment.time} />
                  <D label="来源" value="模拟链监听" />
                  <D label="最终匹配" value={payment.status === "最终匹配" ? "是" : "否"} />
                </div>
              </Section>
              <div className="info-note">
                <AlertCircle size={17} />
                <p>本页不提供手工伪造付款入口。异常需回到原交易证据核查。</p>
              </div>
            </>
          )}
          {token && (
            <>
              <DetailHero title={token.id} id={token.tx} status={token.status} />
              <div className="detail-grid">
                <D label="操作类型" value={token.operation} />
                <D label="Token 数量" value={token.amount.toLocaleString()} />
                <D label="来源订单" value={token.orderId} />
                <D label="事件时间" value={token.time} />
              </div>
              <Section title="受控守卫">
                <div className="guard-list">
                  <span>
                    <Check size={15} />
                    订单已确认
                  </span>
                  <span>
                    <Check size={15} />
                    付款最终匹配
                  </span>
                  <span>
                    <Check size={15} />
                    授权容量充足
                  </span>
                  <span>
                    <Check size={15} />
                    配售决定存在
                  </span>
                </div>
              </Section>
              <div className="banner warning">
                <AlertCircle size={17} />
                <div>
                  <b>模拟链上记录</b>
                  <p>交易标识为虚构演示内容，不代表真实链部署或资产交付。</p>
                </div>
              </div>
            </>
          )}
          {wallet && (
            <>
              <DetailHero title={wallet.name} id={wallet.id} status={wallet.status} />
              <div className="address full">
                {wallet.address}
                <button onClick={() => toast("演示钱包地址已复制")}>
                  <Copy size={14} />
                </button>
              </div>
              <div className="detail-grid">
                <D label="钱包类型" value={wallet.type} />
                <D label="网络" value={wallet.network} />
                <D label="默认钱包" value={wallet.isDefault ? "是" : "否"} />
                <D label="绑定时间" value="2026-08-18" />
              </div>
              <Section title="引用检查">
                <p className="body-copy">
                  当前有 {state.offerings.filter((o) => o.walletId === wallet.id).length} 个
                  Offering 引用此钱包。有引用或属于最后一个默认钱包时不可解绑。
                </p>
              </Section>
            </>
          )}
          {dist && (
            <>
              <DetailHero title={dist.id} id={dist.period} status={dist.status} />
              <div className="quote">
                <span>{dist.eventType || "收益分配"}候选总额</span>
                <strong>{formatU6(dist.gross)}</strong>
                <small>Record Date · {dist.recordDate}</small>
              </div>
              {dist.calculationStatus && <div className="detail-grid"><D label={dist.reportId ? "租金上报" : "债权计划"} value={dist.reportId || dist.debtScheduleId || "—"} /><D label="固定持有人快照" value={dist.holderSnapshotId || "缺失"} /><D label="计算状态" value={dist.calculationStatus} /><D label="支付状态" value={dist.paymentStatus || "未发起"} /></div>}
              {dist.eventType === "债权利息" && dist.dayCountBasis && (
                <div className="detail-grid">
                  <D label="计息口径" value={dist.dayCountBasis} />
                  <D label="实际天数" value={`${dist.interestDays || 0} 天`} />
                  <D label="计息日期" value={`${dist.accrualFrom || "—"} 至 ${dist.accrualTo || "—"}`} />
                </div>
              )}
              {dist.blockedReason && (
                <div className="banner warning">
                  <AlertCircle size={17} />
                  <div>
                    <b>当前批次不可确认</b>
                    <p>{dist.blockedReason}</p>
                  </div>
                </div>
              )}
              <Section title="分配试算">
                {(dist.items || []).map((line) => {
                  const h = state.holders.find((holder) => holder.id === line.holderId);
                  return (
                    <div className="split-row" key={line.holderId}>
                      <span>
                        {state.investors.find((i) => i.id === line.investorId)?.name}
                        <small>
                          {h?.id} · {line.basis.toLocaleString()} 权益单位 · {line.status}
                        </small>
                      </span>
                      <b>{formatU6(line.amount)}</b>
                    </div>
                  );
                })}
              </Section>
              <Section title="确认与支付">
                <p className="body-copy">
                  同一 Offering、事件类型、期间、Record Date 与 Instrument
                  版本只允许一个有效批次。确认与支付是两个独立动作。
                </p>
                <div className="control-row">
                  <Button variant="secondary" onClick={() => setConfirmAction("distribution")} disabled={dist.status === "已确认" || dist.status === "支付完成"}>
                    确认合法批次
                  </Button>
                  <Button disabled>付款由 Mock 控制台执行</Button>
                </div>
              </Section>
              <div className="info-note">
                <AlertCircle size={17} />
                <p>分配金额为可解释的模拟计算，不代表真实资金清偿。</p>
              </div>
            </>
          )}
        </div>
        {!["catalog", "portal-preview"].includes(drawer.type) && (
          <div className="drawer-footer">
            <Button variant="ghost" onClick={requestClose}>
              关闭
            </Button>
          </div>
        )}
      </aside>
      {confirmAction && (
        <div className="confirm-layer">
          <div className="backdrop" onClick={() => setConfirmAction(null)} />
          <div className="confirm-dialog">
            <div className="confirm-icon">
              <ShieldCheck size={22} />
            </div>
            <h3>{confirmAction === "offering" ? "确认本期发行方案？" : "确认收益分配批次？"}</h3>
            <p>
              {confirmAction === "offering"
                ? "系统将检查企业认证、套餐、资产与权益资料、容量、收款钱包和披露文件，并冻结本期引用。该操作不会自动部署、收款或 Mint。"
                : "系统将固定当前 Record Date 的有效持有人快照和候选应付明细。确认不等于已支付，付款仍只能在内部 Mock 控制台执行。"}
            </p>
            <div className="confirm-object">
              {confirmAction === "offering"
                ? off?.name
                : `${dist?.eventType || "收益"} · ${dist?.period}`}
            </div>
            <div className="confirm-actions">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                取消
              </Button>
              <Button
                onClick={() => {
                  if (confirmAction === "offering" && off) confirmOffering(off);
                  if (confirmAction === "distribution" && dist) confirmDistribution(dist);
                  setConfirmAction(null);
                }}
              >
                {confirmAction === "offering" ? "运行检查并确认" : "确认分配批次"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailHero({ title, id, status }: { title: string; id: string; status: string }) {
  return (
    <div className="detail-hero">
      <div>
        <h3>{title}</h3>
        <p>{id}</p>
      </div>
      <Status value={status} />
    </div>
  );
}
function D({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <small>{label}</small>
      <b>{value}</b>
    </span>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="drawer-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function LinkRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button className="link-row" onClick={onClick}>
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
      <ArrowRight size={15} />
    </button>
  );
}

function CreateAsset({
  state,
  setState,
  close,
  toast,
  existing,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  toast: (s: string) => void;
  existing?: Asset;
}) {
  const [newAssetId] = useState(() => nextNumericId("AST", state.assets, 1000));
  const [form, setForm] = useState({
    name: existing?.name || "",
    category: existing?.category || "房地产",
    subtype: existing?.subtype || "住宅物业",
    location: existing?.location || state.company?.country || "",
    details: Object.fromEntries(
      Object.entries(existing?.details || {}).map(([key, value]) => [key, String(value)]),
    ) as Record<string, string>,
    files: existing?.files?.map((file) => ({ ...file })) || ([] as BusinessFile[]),
  });
  const setDetail = (key: string, value: string) =>
    setForm((current) => ({ ...current, details: { ...current.details, [key]: value } }));
  const addFiles = (category: string, list: FileList | null) => {
    if (!list?.length) return;
    const next = Array.from(list).map((file, index) => ({
      id: `FILE-${Date.now()}-${index}`,
      name: file.name,
      category,
      status: "待扫描" as const,
      version: 1,
    }));
    setForm((current) => ({
      ...current,
      files: [...current.files.filter((file) => file.category !== category), ...next],
    }));
  };
  const save = () => {
    if (!form.name || !form.location) return toast("请至少填写资产名称和所在地后保存草稿");
    if (
      existing &&
      state.offerings.some((offering) => offering.assetId === existing.id && offering.confirmed)
    )
      return toast("该 Asset 已被确认发行的 Offering 引用，不能静默覆盖；请保留历史版本");
    const id = existing?.id || newAssetId;
    const a: Asset = {
      id,
      name: form.name,
      code: existing?.code || `AST-DEMO-${id.slice(4)}`,
      category: form.category,
      subtype: form.subtype,
      value:
        form.subtype === "住宅物业"
          ? Number(form.details.agreedPriceCny || 0) / 8
          : Number(form.details.outstanding || form.details.valuation || 0),
      status: "Draft",
      updated: "刚刚",
      location: form.location,
      address: form.details.address,
      details: { ...form.details },
      files: form.files,
      version: existing ? (existing.version || 1) + 1 : 1,
    };
    a.missing = assetMissing(a);
    setState((s) => {
      const latest = existing && s.assets.find((item) => item.id === existing.id);
      if ((!existing && s.assets.some((item) => item.id === id)) ||
          (existing && (!latest || latest.version !== existing.version || s.offerings.some((item) => item.assetId === existing.id && item.confirmed)))) {
        queueMicrotask(() => toast("资产已保存或版本已变化，请返回列表核对；未重复创建或覆盖"));
        return s;
      }
      queueMicrotask(() => {
        toast(a.missing?.length
          ? `资产${existing ? "修改" : ""}草稿已保存，尚缺 ${a.missing?.length || 0} 项；请按缺项补充`
          : "资产资料已保存，请重新运行资料检查");
        close();
      });
      return ensureProjects({
        ...s,
        assets: existing ? s.assets.map((asset) => asset.id === existing.id ? a : asset) : [a, ...s.assets],
        instruments: existing
          ? s.instruments.map((instrument) => instrument.assetId === existing.id
              ? { ...instrument, status: "Draft", missing: [...new Set([...(instrument.missing || []), "上游 Asset 修改后需重新检查"])] }
              : instrument)
          : s.instruments,
        activities: [newActivity("资产与发行", a.id, existing ? "编辑资产草稿" : "创建资产草稿"), ...s.activities],
      });
    });
  };
  const fillCase = () => {
    if (form.name && !confirm("当前已有输入。仅填充空字段并保留现有内容？")) return;
    const debt = form.subtype === "单笔企业借款债权";
    const currentEntity = state.company?.name || "";
    const sample = debt
      ? {
          contractNumber: "DEMO-LOAN-2026-001",
          signedDate: "2026-10-01",
          creditor: currentEntity,
          debtor: "华北物流科技有限公司（示例）",
          principal: "400000",
          outstanding: "400000",
          annualRate: "12",
          interestStart: "2026-12-01",
          maturity: "2028-12-01",
          repayment: "到期一次还本",
          performance: "正常履约",
          guarantee: "无",
          restriction: "无",
          valuation: "400000",
          valuationDate: "2026-10-01",
        }
      : {
          address: "北京市朝阳区建国路虚构测试小区1号楼1201室",
          propertyLayout: "两室一厅一卫",
          area: "80",
          use: "普通住宅",
          occupancy: "已出租",
          owner: currentEntity,
          rightNature: "所有权（仅演示，尚未经核验）",
          relation: "同一主体",
          agreedPriceCny: "2000000",
          appraisalCny: "1900000",
          appraisalDate: "2026-10-31",
          appraiser: "北京示例不动产评估有限公司（虚构）",
          monthlyRentCny: "8000",
          frequency: "按月",
          leaseStart: "2026-10-01",
          leaseEnd: "2027-09-30",
          operator: currentEntity,
        };
    setForm((current) => ({
      ...current,
      name: current.name || (debt ? "华北物流企业借款债权" : "北京朝阳住宅租金收益项目"),
      location: current.location || state.company?.country || "中国",
      details: Object.fromEntries(
        Object.entries(sample).map(([key, value]) => [key, current.details[key] || value]),
      ),
    }));
    toast("已填充明确标记的示例空字段；现有手工内容未覆盖，证明文件仍需选择");
  };
  const residential = form.subtype === "住宅物业";
  const debt = form.subtype === "单笔企业借款债权";
  const mockFileNames: Record<string, string> = {
    权属证明: "DEMO_Property_Ownership.pdf",
    估值依据: debt ? "DEMO_Debt_Valuation.pdf" : "DEMO_Property_Appraisal.pdf",
    租赁合同: "DEMO_Rental_Agreement.pdf",
    房产图片: "DEMO_Property_Image.jpg",
    借款合同: "DEMO_Loan_Agreement.pdf",
    债权证明: "DEMO_Debt_Ownership.pdf",
    余额证明: "DEMO_Outstanding_Balance.pdf",
  };
  const addMockFile = (category: string) =>
    setForm((current) => ({
      ...current,
      files: [
        ...current.files.filter((file) => file.category !== category),
        {
          id: `FILE-MOCK-${Date.now()}-${category}`,
          name: mockFileNames[category] || `DEMO_${category}.pdf`,
          category,
          status: "待扫描",
          version: 1,
        },
      ],
    }));
  const upload = (label: string, category: string, required = true) => (
    <div className="field file-upload-field">
      <span>
        {label} {required ? "*" : ""}
      </span>
      <div className="mock-file-actions">
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => addFiles(category, e.target.files)}
        />
        <Button variant="secondary" onClick={() => addMockFile(category)}>
          模拟添加文件
        </Button>
      </div>
      <small>{form.files.find((file) => file.category === category)?.name || "尚无文件记录"}</small>
    </div>
  );
  return (
    <div className="create-form">
      <div className="form-progress">
        <span className="active">1 分类</span>
        <i />
        <span className="active">2 资料</span>
        <i />
        <span>3 法律/估值</span>
        <i />
        <span>4 预览</span>
      </div>
      <div className="info-note">
        <Sparkles size={17} />
        <p>
          V1
          支持住宅、写字楼、商铺、工业仓储、普通股权与单笔借款债权六种模板。“填充示例”只补空字段，法定主体读取当前企业且不会覆盖手工修改。
        </p>
      </div>
      <label className="field">
        <span>资产类别 *</span>
        <select
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
              subtype: e.target.value === "房地产" ? "住宅物业" : "单笔企业借款债权",
              details: {},
              files: [],
            })
          }
        >
          <option>房地产</option>
          <option>债权与应收款</option>
        </select>
      </label>
      <label className="field">
        <span>开放模板 *</span>
        <select
          value={form.subtype}
          onChange={(e) => setForm({ ...form, subtype: e.target.value })}
        >
          {form.category === "房地产" ? (
            <>
              <option>住宅物业</option>
              <option>写字楼</option>
              <option>商业商铺</option>
              <option>工业园/仓储物流物业</option>
            </>
          ) : (
            <option>单笔企业借款债权</option>
          )}
        </select>
      </label>
      <label className="field">
        <span>资产名称 *</span>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={debt ? "例如：华北物流企业借款债权" : "例如：北京朝阳住宅租金收益项目"}
        />
      </label>
      <label className="field">
        <span>所在地 *</span>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
      </label>
      {residential && (
        <>
          <div className="form-section-title">
            <b>物业与租赁资料</b>
            <small>Asset 记录合同事实，不记录每月实际收租</small>
          </div>
          <label className="field">
            <span>物业详细地址 *</span>
            <input
              value={form.details.address || ""}
              onChange={(e) => setDetail("address", e.target.value)}
            />
          </label>
          <div className="fields two">
            <label className="field">
              <span>户型 *</span>
              <input
                value={form.details.propertyLayout || ""}
                onChange={(e) => setDetail("propertyLayout", e.target.value)}
              />
            </label>
            <label className="field">
              <span>建筑面积（㎡）*</span>
              <input
                type="number"
                value={form.details.area || ""}
                onChange={(e) => setDetail("area", e.target.value)}
              />
            </label>
            <label className="field">
              <span>住宅用途 *</span>
              <input
                value={form.details.use || ""}
                onChange={(e) => setDetail("use", e.target.value)}
              />
            </label>
            <label className="field">
              <span>当前使用状态 *</span>
              <select
                value={form.details.occupancy || ""}
                onChange={(e) => setDetail("occupancy", e.target.value)}
              >
                <option value="">请选择</option>
                <option>已出租</option>
                <option>空置</option>
                <option>自用</option>
              </select>
            </label>
            <label className="field">
              <span>登记权利人 *</span>
              <input
                value={form.details.owner || ""}
                onChange={(e) => setDetail("owner", e.target.value)}
              />
            </label>
            <label className="field">
              <span>权利性质 *</span>
              <input
                value={form.details.rightNature || ""}
                onChange={(e) => setDetail("rightNature", e.target.value)}
              />
            </label>
            <label className="field">
              <span>与发行企业关系 *</span>
              <input
                value={form.details.relation || ""}
                onChange={(e) => setDetail("relation", e.target.value)}
              />
            </label>
            <label className="field">
              <span>运营方 *</span>
              <input
                value={form.details.operator || ""}
                onChange={(e) => setDetail("operator", e.target.value)}
              />
            </label>
          </div>
          <div className="form-section-title">
            <b>价格、估值与租约</b>
            <small>资产价格、估值、合同租金和 Token 募集额分别记录</small>
          </div>
          <div className="fields two">
            <label className="field">
              <span>资产约定价格（人民币）*</span>
              <input
                type="number"
                value={form.details.agreedPriceCny || ""}
                onChange={(e) => setDetail("agreedPriceCny", e.target.value)}
              />
            </label>
            <label className="field">
              <span>第三方评估（人民币）*</span>
              <input
                type="number"
                value={form.details.appraisalCny || ""}
                onChange={(e) => setDetail("appraisalCny", e.target.value)}
              />
            </label>
            <label className="field">
              <span>评估日期 *</span>
              <input
                type="date"
                value={form.details.appraisalDate || ""}
                onChange={(e) => setDetail("appraisalDate", e.target.value)}
              />
            </label>
            <label className="field">
              <span>估值机构 *</span>
              <input
                value={form.details.appraiser || ""}
                onChange={(e) => setDetail("appraiser", e.target.value)}
              />
            </label>
            <label className="field">
              <span>合同月租金（人民币）*</span>
              <input
                type="number"
                value={form.details.monthlyRentCny || ""}
                onChange={(e) => setDetail("monthlyRentCny", e.target.value)}
              />
            </label>
            <label className="field">
              <span>租金频率 *</span>
              <select
                value={form.details.frequency || ""}
                onChange={(e) => setDetail("frequency", e.target.value)}
              >
                <option value="">请选择</option>
                <option>按月</option>
              </select>
            </label>
            <label className="field">
              <span>租约开始 *</span>
              <input
                type="date"
                value={form.details.leaseStart || ""}
                onChange={(e) => setDetail("leaseStart", e.target.value)}
              />
            </label>
            <label className="field">
              <span>租约结束 *</span>
              <input
                type="date"
                value={form.details.leaseEnd || ""}
                onChange={(e) => setDetail("leaseEnd", e.target.value)}
              />
            </label>
          </div>
          {upload("房产权属证明", "权属证明")}
          {upload("第三方估值依据", "估值依据")}
          {upload("租赁合同", "租赁合同")}
          {upload("房产图片", "房产图片", false)}
        </>
      )}
      {debt && (
        <>
          <div className="form-section-title">
            <b>借款合同与债权事实</b>
            <small>底层合同条款不自动成为投资者权益条款</small>
          </div>
          <div className="fields two">
            <label className="field">
              <span>合同编号 *</span>
              <input
                value={form.details.contractNumber || ""}
                onChange={(e) => setDetail("contractNumber", e.target.value)}
              />
            </label>
            <label className="field">
              <span>合同签订日 *</span>
              <input
                type="date"
                value={form.details.signedDate || ""}
                onChange={(e) => setDetail("signedDate", e.target.value)}
              />
            </label>
            <label className="field">
              <span>当前债权权利人 *</span>
              <input
                value={form.details.creditor || ""}
                onChange={(e) => setDetail("creditor", e.target.value)}
              />
            </label>
            <label className="field">
              <span>债务人 *</span>
              <input
                value={form.details.debtor || ""}
                onChange={(e) => setDetail("debtor", e.target.value)}
              />
            </label>
            <label className="field">
              <span>合同本金 U *</span>
              <input
                type="number"
                value={form.details.principal || ""}
                onChange={(e) => setDetail("principal", e.target.value)}
              />
            </label>
            <label className="field">
              <span>未偿本金 U *</span>
              <input
                type="number"
                value={form.details.outstanding || ""}
                onChange={(e) => setDetail("outstanding", e.target.value)}
              />
            </label>
            <label className="field">
              <span>固定年利率（%）*</span>
              <input
                type="number"
                value={form.details.annualRate || ""}
                onChange={(e) => setDetail("annualRate", e.target.value)}
              />
            </label>
            <label className="field">
              <span>起息日 *</span>
              <input
                type="date"
                value={form.details.interestStart || ""}
                onChange={(e) => setDetail("interestStart", e.target.value)}
              />
            </label>
            <label className="field">
              <span>底层合同到期日 *</span>
              <input
                type="date"
                value={form.details.maturity || ""}
                onChange={(e) => setDetail("maturity", e.target.value)}
              />
            </label>
            <label className="field">
              <span>还本方式 *</span>
              <select
                value={form.details.repayment || ""}
                onChange={(e) => setDetail("repayment", e.target.value)}
              >
                <option value="">请选择</option>
                <option>到期一次还本</option>
              </select>
            </label>
            <label className="field">
              <span>履约状态 *</span>
              <select
                value={form.details.performance || ""}
                onChange={(e) => setDetail("performance", e.target.value)}
              >
                <option value="">请选择</option>
                <option>正常履约</option>
                <option>逾期</option>
                <option>争议中</option>
              </select>
            </label>
            <label className="field">
              <span>担保情况</span>
              <input
                value={form.details.guarantee || ""}
                onChange={(e) => setDetail("guarantee", e.target.value)}
              />
            </label>
            <label className="field">
              <span>转让 / 质押限制</span>
              <input
                value={form.details.restriction || ""}
                onChange={(e) => setDetail("restriction", e.target.value)}
              />
            </label>
            <label className="field">
              <span>债权估值 U *</span>
              <input
                type="number"
                value={form.details.valuation || ""}
                onChange={(e) => setDetail("valuation", e.target.value)}
              />
            </label>
            <label className="field">
              <span>估值基准日 *</span>
              <input
                type="date"
                value={form.details.valuationDate || ""}
                onChange={(e) => setDetail("valuationDate", e.target.value)}
              />
            </label>
          </div>
          {Number(form.details.outstanding) > Number(form.details.principal) && (
            <div className="banner danger">
              <AlertCircle size={17} />
              <div>
                <b>未偿本金不能超过合同本金</b>
                <p>请更正后再运行资料检查。</p>
              </div>
            </div>
          )}
          {upload("借款合同", "借款合同")}
          {upload("债权权利证明", "债权证明")}
          {upload("未偿余额证明", "余额证明")}
          {upload("债权估值依据", "估值依据")}
        </>
      )}
      {!residential && !debt && (
        <div className="info-note">
          <AlertCircle size={17} />
          <p>该开放模板沿用原通用资料草稿能力；本批完整校验重点为住宅与单笔企业借款债权。</p>
        </div>
      )}
      <div className="sticky-actions">
        <Button variant="secondary" onClick={fillCase}>
          <Sparkles size={15} />
          填充示例空字段
        </Button>
        <Button onClick={save}>保存资产草稿</Button>
      </div>
    </div>
  );
}

function CreateInstrument({
  state,
  setState,
  close,
  toast,
  preferredAssetId,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  toast: (s: string) => void;
  preferredAssetId?: string;
}) {
  const available = state.assets.filter((a) => !state.instruments.some((i) => i.assetId === a.id));
  const [newInstrumentId] = useState(() => `INS-${crypto.randomUUID()}-V1`);
  const [assetId, setAssetId] = useState(available.find((item) => item.id === preferredAssetId)?.id || available[0]?.id || "");
  const selectedAsset = available.find((asset) => asset.id === assetId);
  const suggestedType: Instrument["type"] =
    selectedAsset?.subtype === "单笔企业借款债权" ? "债权" : "收益参与权";
  const [type, setType] = useState<Instrument["type"]>(suggestedType);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [cap, setCap] = useState("");
  const [terms, setTerms] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<BusinessFile[]>([]);
  const setTerm = (key: string, value: string) =>
    setTerms((current) => ({ ...current, [key]: value }));
  const chooseCoreFile = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setFiles([
      {
        id: `FILE-${Date.now()}`,
        name: file.name,
        category: "核心协议",
        status: "待扫描",
        version: 1,
      },
    ]);
  };
  const fillCase = () => {
    const debt = type === "债权";
    const currentEntity = state.company?.name || "";
    setName((current) => current || (debt ? "华北物流债权收益发行权益" : "朝阳住宅租金收益参与权"));
    setTotal((current) => current || (debt ? "400000" : "25000"));
    setCap((current) => current || (debt ? "4000" : "25000"));
    const sample = debt
      ? {
          responsibleParty: currentEntity,
          rightsDescription: "发行企业对投资者承担独立的固定利率债权偿付义务",
          principal: "400000",
          annualRate: "12",
          interestMethod: ACTUAL_365_FIXED,
          frequency: "每月付息",
          startDate: "2026-12-01",
          maturityDate: "2028-12-01",
          repayment: "到期一次还本金",
        }
      : {
          responsibleParty: currentEntity,
          rightsDescription: "住宅租赁合同下实际收到的可分配租金收益参与权，不转移房产产权",
          revenueSource: "该住宅租赁合同下实际收到的可分配租金",
          participationRate: "100",
          frequency: "每月",
          startDate: "2026-10-01",
          maturityDate: "2027-09-30",
          expiryArrangement: "权益期限终止，待合法清算；不承诺返还本金",
        };
    setTerms((current) =>
      Object.fromEntries(
        Object.entries(sample).map(([key, value]) => [key, current[key] || value]),
      ),
    );
    toast("已填充示例空条款；法律责任主体来自当前企业，手工内容未覆盖");
  };
  const save = () => {
    if (!assetId) return toast("每项 Asset 只能有一套当前有效 Instrument");
    if (
      Number(total) <= 0 ||
      Number(cap) <= 0 ||
      !Number.isInteger(Number(cap)) ||
      Number(total) % Number(cap) !== 0
    )
      return toast("权益总量必须能被 Token 份数精确整除");
    const a = state.assets.find((x) => x.id === assetId)!;
    const i: Instrument = {
      id: newInstrumentId,
      assetId,
      name: name || `${a.name}${type}`,
      type,
      version: "v1",
      totalRights: Number(total),
      unit: type === "股权" ? "普通股" : type === "债权" ? "U 本金" : "收益权单位",
      tokenCap: Number(cap),
      used: 0,
      status: "Draft",
      updated: "刚刚",
      terms,
      files,
    };
    i.missing = instrumentMissing(i, a);
    setState((s) => {
      if (s.instruments.some((item) => item.id === i.id || item.assetId === assetId)) {
        queueMicrotask(() => toast("该资产已有权益结构草稿，未重复创建"));
        return s;
      }
      queueMicrotask(() => {
        toast(i.missing?.length
          ? `权益草稿已保存，尚缺 ${i.missing.length} 项；核心协议需完成 Mock 扫描`
          : "权益结构已保存");
        close();
      });
      return { ...s, instruments: [i, ...s.instruments], activities: [newActivity("资产与发行", i.id, "创建权益结构草稿"), ...s.activities] };
    });
  };
  return (
    <div className="create-form">
      {available.length ? (
        <>
          <label className="field">
            <span>选择已有 Asset *</span>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              {available.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name} · {a.subtype}
                </option>
              ))}
            </select>
          </label>
          {selectedAsset?.status !== "Ready" && (
            <div className="banner warning">
              <AlertCircle size={17} />
              <div>
                <b>上游 Asset 尚未 Ready</b>
                <p>允许保存 Instrument 草稿，但不能进入 Offering 最终确认。</p>
              </div>
            </div>
          )}
          <label className="field">
            <span>权益模板 *</span>
            <div className="choice-cards">
              {(["股权", "债权", "收益参与权"] as const).map((x) => (
                <button className={type === x ? "active" : ""} onClick={() => setType(x)} key={x}>
                  <b>{x}</b>
                  <small>
                    {x === "股权"
                      ? "整数股精确映射"
                      : x === "债权"
                        ? "本金、利率与到期"
                        : "按合法收益口径参与"}
                  </small>
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>权益结构名称 *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入独立法律权利名称"
            />
          </label>
          <div className="form-section-title">
            <b>法律权利与现金流条款</b>
            <small>不得把底层 Asset 事实自动复制为投资者权利</small>
          </div>
          <label className="field">
            <span>法律责任 / 偿付主体 *</span>
            <input
              value={terms.responsibleParty || ""}
              onChange={(e) => setTerm("responsibleParty", e.target.value)}
            />
          </label>
          <label className="field">
            <span>投资者取得的权利描述 *</span>
            <textarea
              rows={3}
              value={terms.rightsDescription || ""}
              onChange={(e) => setTerm("rightsDescription", e.target.value)}
            />
          </label>
          {type === "债权" ? (
            <div className="fields two">
              <label className="field">
                <span>投资者本金总额 U *</span>
                <input
                  type="number"
                  value={terms.principal || ""}
                  onChange={(e) => setTerm("principal", e.target.value)}
                />
              </label>
              <label className="field">
                <span>固定年利率（%）*</span>
                <input
                  type="number"
                  value={terms.annualRate || ""}
                  onChange={(e) => setTerm("annualRate", e.target.value)}
                />
              </label>
              <label className="field">
                <span>计息方式 *</span>
                <select
                  value={terms.interestMethod || ""}
                  onChange={(e) => setTerm("interestMethod", e.target.value)}
                >
                  <option value="">请选择</option>
                  <option>{ACTUAL_365_FIXED}</option>
                </select>
              </label>
              <label className="field">
                <span>付息频率 *</span>
                <select
                  value={terms.frequency || ""}
                  onChange={(e) => setTerm("frequency", e.target.value)}
                >
                  <option value="">请选择</option>
                  <option>每月付息</option>
                </select>
              </label>
              <label className="field">
                <span>本金偿还方式 *</span>
                <select
                  value={terms.repayment || ""}
                  onChange={(e) => setTerm("repayment", e.target.value)}
                >
                  <option value="">请选择</option>
                  <option>到期一次还本金</option>
                </select>
              </label>
            </div>
          ) : (
            <>
              <label className="field">
                <span>收益来源 *</span>
                <textarea
                  rows={2}
                  value={terms.revenueSource || ""}
                  onChange={(e) => setTerm("revenueSource", e.target.value)}
                />
              </label>
              <div className="fields two">
                <label className="field">
                  <span>收益参与比例（%）*</span>
                  <input
                    type="number"
                    value={terms.participationRate || ""}
                    onChange={(e) => setTerm("participationRate", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>分配频率 *</span>
                  <select
                    value={terms.frequency || ""}
                    onChange={(e) => setTerm("frequency", e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option>每月</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>到期安排 *</span>
                <textarea
                  rows={2}
                  value={terms.expiryArrangement || ""}
                  onChange={(e) => setTerm("expiryArrangement", e.target.value)}
                />
              </label>
            </>
          )}
          <div className="fields two">
            <label className="field">
              <span>投资者权益起始日 *</span>
              <input
                type="date"
                value={terms.startDate || ""}
                onChange={(e) => setTerm("startDate", e.target.value)}
              />
            </label>
            <label className="field">
              <span>投资者权益到期日 *</span>
              <input
                type="date"
                value={terms.maturityDate || ""}
                onChange={(e) => setTerm("maturityDate", e.target.value)}
              />
            </label>
          </div>
          <div className="fields two">
            <label className="field">
              <span>法定权益总量 *</span>
              <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
            </label>
            <label className="field">
              <span>Token 最大份数 *</span>
              <input type="number" value={cap} onChange={(e) => setCap(e.target.value)} />
            </label>
          </div>
          <div className={`formula ${Number(total) % Number(cap) === 0 ? "ok" : "bad"}`}>
            <span>每 Token 对应权益量</span>
            <b>
              {Number(total) && Number(cap)
                ? `${Number(total) / Number(cap)} ${type === "债权" ? "U 本金" : "份权益"}`
                : 0}
            </b>
            <Status value={Number(total) % Number(cap) === 0 ? "精确可整除" : "不可整除"} />
          </div>
          <label className="field file-upload-field">
            <span>{type === "债权" ? "投资者债权核心协议" : "租金收益参与核心协议"} *</span>
            <div className="mock-file-actions">
              <input type="file" accept=".pdf" onChange={(e) => chooseCoreFile(e.target.files)} />
              <Button
                variant="secondary"
                onClick={() =>
                  setFiles([
                    {
                      id: `FILE-MOCK-${Date.now()}`,
                      name:
                        type === "债权"
                          ? "DEMO_Investor_Debt_Agreement.pdf"
                          : "DEMO_Rental_Revenue_Participation_Agreement.pdf",
                      category: "核心协议",
                      status: "待扫描",
                      version: 1,
                    },
                  ])
                }
              >
                模拟添加文件
              </Button>
            </div>
            <small>{files[0]?.name || "未选择；选择后需在 Mock 控制台完成扫描"}</small>
          </label>
          <div className="sticky-actions">
            <Button variant="secondary" onClick={fillCase}>
              <Sparkles size={15} />
              填充示例空条款
            </Button>
            <Button onClick={save}>保存权益草稿</Button>
          </div>
        </>
      ) : (
        <Empty title="暂无可配置资产" text="现有资产均已有当前 Instrument。请先创建新 Asset。" />
      )}
    </div>
  );
}

function CreateOffering({
  state,
  setState,
  close,
  toast,
  existing,
  preferredAssetId,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  toast: (s: string) => void;
  existing?: Offering;
  preferredAssetId?: string;
}) {
  const ready = state.instruments.filter(
    (i) =>
      (i.status === "Ready" || i.id === existing?.instrumentId) &&
      state.assets.find((asset) => asset.id === i.assetId)?.status === "Ready",
  );
  const [instrumentId, setInstrumentId] = useState(existing?.instrumentId || ready.find((item) => item.assetId === preferredAssetId)?.id || ready[0]?.id || "");
  const [newOfferingId] = useState(() => nextNumericId("OFF", state.offerings, 3000));
  const ins = ready.find((i) => i.id === instrumentId);
  const [name, setName] = useState(existing?.name || "");
  const [tokens, setTokens] = useState(String(existing?.tokens || 1000));
  const [price, setPrice] = useState(String(existing?.price || 100));
  const [summary, setSummary] = useState(existing?.summary || "");
  const [minimum, setMinimum] = useState(String(existing?.minimum || 1000));
  const [start, setStart] = useState(existing?.start || "2026-12-01");
  const [end, setEnd] = useState(existing?.end || "2027-02-28");
  const [disclosureFiles, setDisclosureFiles] = useState<BusinessFile[]>(
    existing?.disclosureFiles?.map((file) => ({ ...file })) || [],
  );
  const [walletId, setWalletId] = useState(
    existing?.walletId || state.wallets.find((w) => w.isDefault)?.id || "",
  );
  const remaining = ins ? ins.tokenCap - ins.used : 0;
  const dirty =
    name !== (existing?.name || "") ||
    tokens !== String(existing?.tokens || 1000) ||
    price !== String(existing?.price || 100) ||
    summary !== (existing?.summary || "") ||
    minimum !== String(existing?.minimum || 1000) ||
    start !== (existing?.start || "2026-12-01") ||
    end !== (existing?.end || "2027-02-28") ||
    walletId !== (existing?.walletId || state.wallets.find((w) => w.isDefault)?.id || "") ||
    JSON.stringify(disclosureFiles) !== JSON.stringify(existing?.disclosureFiles || []);
  const safeClose = () => {
    if (dirty && !confirm("存在未保存的发行方案修改，确认放弃并返回？")) return;
    close();
  };
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const save = () => {
    if (existing && (existing.confirmed || existing.status !== "草稿"))
      return toast("只有未确认的 Offering 草稿可以编辑；历史发行及容量引用不能覆盖");
    if (!ins || !name || !walletId || !summary) return toast("请完成发行名称、摘要和收款钱包");
    if (!Number.isInteger(Number(tokens)) || Number(tokens) <= 0)
      return toast("发行 Token 份数必须为正整数");
    if (Number(price) <= 0 || Number(minimum) <= 0) return toast("价格与最低认购金额必须大于 0");
    if (new Date(start) >= new Date(end)) return toast("认购结束时间必须晚于开始时间");
    if (Number(tokens) > remaining)
      return toast(`发行份数超过剩余授权容量 ${remaining.toLocaleString()}`);
    const o: Offering = {
      id: existing?.id || "",
      assetId: existing?.assetId || ins.assetId,
      instrumentId: existing?.instrumentId || ins.id,
      name,
      round: existing?.round || "",
      tokens: Number(tokens),
      price: Number(price),
      start,
      end,
      status: existing?.status || "草稿",
      walletId,
      summary,
      minimum: Number(minimum),
      disclosureFiles,
      confirmed: false,
      contractStatus: "未申请",
      projectId: existing?.projectId,
      assetVersion: existing?.assetVersion || state.assets.find((asset) => asset.id === ins.assetId)?.version || 1,
      instrumentVersion: existing?.instrumentVersion || ins.version,
      revision: existing?.revision || 1,
    };
    setState((s) => {
      if (!existing && s.offerings.some((item) => item.id === newOfferingId)) {
        queueMicrotask(() => { toast("同一创建请求已保存，未重复创建 Offering"); close(); });
        return s;
      }
      const latestInstrument = s.instruments.find((item) => item.id === ins.id);
      const latestAsset = s.assets.find((item) => item.id === ins.assetId);
      const current = existing && s.offerings.find((item) => item.id === existing.id);
      if (!latestInstrument || !latestAsset || latestInstrument.status !== "Ready" || latestAsset.status !== "Ready" || Number(tokens) > latestInstrument.tokenCap - latestInstrument.used ||
          (existing && (!current || current.confirmed || current.revision !== (existing.revision || 1)))) {
        queueMicrotask(() => toast("草稿已变化或剩余容量不足，请刷新后重试"));
        return s;
      }
      const previousRounds = s.offerings.filter((item) => item.assetId === ins.assetId && item.instrumentId === ins.id)
        .map((item) => Number(/^第 (\d+) 期$/.exec(item.round)?.[1] || 0));
      const saved: Offering = {
        ...o,
        id: existing?.id || newOfferingId,
        round: existing?.round || `第 ${Math.max(0, ...previousRounds) + 1} 期`,
        assetVersion: latestAsset.version || 1,
        instrumentVersion: latestInstrument.version,
        projectId: existing?.instrumentVersion && existing.instrumentVersion !== latestInstrument.version ? undefined : existing?.projectId,
        revision: existing ? (existing.revision || 1) + 1 : 1,
      };
      const next = ensureProjects({
        ...s,
        offerings: existing
          ? s.offerings.map((item) => item.id === existing.id ? saved : item)
          : [saved, ...s.offerings],
        activities: [newActivity("资产与发行", saved.id, existing ? "编辑 Offering 草稿" : "创建 Offering 草稿"), ...s.activities],
      });
      queueMicrotask(() => { toast(existing ? "Offering 草稿已保存；Project 与版本引用保持不变" : "Offering 草稿已创建并自动关联 Project；尚未预留容量"); close(); });
      return next;
    });
  };
  return (
    <div className="create-form">
      <label className="field">
        <span>Ready Instrument *</span>
        <select
          value={instrumentId}
          onChange={(e) => setInstrumentId(e.target.value)}
          disabled={Boolean(existing)}
        >
          {ready.map((i) => (
            <option value={i.id} key={i.id}>
              {i.name} · 剩余 {(i.tokenCap - i.used).toLocaleString()}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Offering 名称 *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：滨江物业收益权第三期"
        />
      </label>
      <label className="field">
        <span>投资者展示摘要 *</span>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="说明本期权益、主要现金流与风险，不构成收益承诺"
        />
      </label>
      <div className="fields two">
        <label className="field">
          <span>发行 Token 份数 *</span>
          <input type="number" value={tokens} onChange={(e) => setTokens(e.target.value)} />
          <small>可用授权容量 {remaining.toLocaleString()}</small>
        </label>
        <label className="field">
          <span>每 Token 价格 U *</span>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
      </div>
      <div className="target">
        <span>计划募资目标</span>
        <strong>{formatU(Number(tokens) * Number(price))}</strong>
      </div>
      <label className="field">
        <span>单笔最低认购金额 U *</span>
        <input type="number" value={minimum} onChange={(e) => setMinimum(e.target.value)} />
        <small>
          对应最少 {price ? Math.ceil(Number(minimum) / Number(price)) : 0}{" "}
          Token，按整数份向上取整。
        </small>
      </label>
      <label className="field">
        <span>企业收款钱包 *</span>
        <select value={walletId} onChange={(e) => setWalletId(e.target.value)}>
          <option value="">请选择有效钱包</option>
          {state.wallets
            .filter((w) => w.status === "已验证")
            .map((w) => (
              <option value={w.id} key={w.id}>
                {w.name} · {w.address.slice(0, 8)}…
              </option>
            ))}
        </select>
      </label>
      <div className="fields two">
        <label className="field">
          <span>开放时间</span>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="field">
          <span>结束时间</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <label className="field file-upload-field">
        <span>发行风险披露文件 *</span>
        <div className="mock-file-actions">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file)
                setDisclosureFiles([
                  {
                    id: `FILE-${Date.now()}`,
                    name: file.name,
                    category: "发行披露",
                    status: "待扫描",
                    version: 1,
                  },
                ]);
            }}
          />
          <Button
            variant="secondary"
            onClick={() =>
              setDisclosureFiles([
                {
                  id: `FILE-MOCK-${Date.now()}`,
                  name: "DEMO_Offering_Risk_Disclosure.pdf",
                  category: "发行披露",
                  status: "待扫描",
                  version: 1,
                },
              ])
            }
          >
            模拟添加文件
          </Button>
        </div>
        <small>{disclosureFiles[0]?.name || "未选择；草稿可保存，确认发行前必须可引用"}</small>
      </label>
      <div className="info-note">
        <ShieldCheck size={17} />
        <p>
          {existing
            ? `固定引用：${existing.assetId} / ${existing.instrumentId}。编辑不会改变既有容量占用、版本或历史订单。`
            : "系统将固定 Asset / Instrument 版本、条款与钱包快照。创建后历史订单不会随编辑静默变化。"}
        </p>
      </div>
      <div className="sticky-actions">
        <Button variant="ghost" onClick={safeClose}>
          取消
        </Button>
        <Button onClick={save}>{existing ? "保存修改" : "保存 Offering 草稿"}</Button>
      </div>
    </div>
  );
}

function CreateWallet({
  setState,
  close,
  toast,
}: {
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  toast: (s: string) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const safeClose = () => {
    if ((name || address) && !confirm("存在未保存的钱包信息，确认放弃？")) return;
    close();
  };
  const save = () => {
    if (!name || !/^0x[a-fA-F0-9]{40}$/.test(address))
      return toast("请填写名称和有效的 0x 钱包地址");
    setState((s) => {
      const id = `WAL-${s.wallets.length + 1}`;
      return {
        ...s,
        wallets: [
          ...s.wallets,
          {
            id,
            name,
            type: "自有钱包",
            address,
            network: "OP Mainnet",
            status: "待验证",
            isDefault: s.wallets.length === 0,
          },
        ],
        activities: [newActivity("企业管理", id, "绑定自有钱包", "待验证"), ...s.activities],
      };
    });
    toast("钱包已绑定为待验证；请在内部 Mock 控制台模拟签名结果");
    close();
  };
  return (
    <div className="create-form">
      <div className="info-note">
        <LockKeyhole size={17} />
        <p>不会请求真实签名、私钥或助记词。验证结果仅为原型模拟。</p>
      </div>
      <label className="field">
        <span>钱包名称 *</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：募集资金备用钱包"
        />
      </label>
      <label className="field">
        <span>钱包地址 *</span>
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x…" />
      </label>
      <label className="field">
        <span>网络</span>
        <select>
          <option>OP Mainnet</option>
        </select>
      </label>
      <div className="sticky-actions">
        <Button variant="ghost" onClick={safeClose}>
          取消
        </Button>
        <Button onClick={save}>模拟签名并绑定</Button>
      </div>
    </div>
  );
}

function CreateRentReport({ state, setState, close, toast }: {
  state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; close: () => void; toast: (message: string) => void;
}) {
  const offerings = state.offerings.filter(offering => offering.publicationStatus === "Sandbox 已发布" && state.instruments.find(row => row.id === offering.instrumentId)?.type === "收益参与权");
  const [offeringId, setOfferingId] = useState(offerings[0]?.id || "");
  const [period, setPeriod] = useState("2026-12");
  const [recordDate, setRecordDate] = useState("2026-12-31");
  const [sourceAmount, setSourceAmount] = useState("8000");
  const [exchangeRate, setExchangeRate] = useState("8");
  const [deductions, setDeductions] = useState("0");
  const [proofFile, setProofFile] = useState<BusinessFile>();
  const net = Number(sourceAmount) / Number(exchangeRate) - Number(deductions);
  const save = () => {
    if (!proofFile) return toast("请上传实际租金收入证明 PDF");
    const input = { offeringId, period, recordDate, sourceAmountCny: Number(sourceAmount), exchangeRate: Number(exchangeRate), deductionsU: Number(deductions), proofFile, at: new Date().toISOString() };
    const preview = createRentReport(state, input);
    if (preview.error) return toast(preview.error);
    setState(current => createRentReport(current, input).state);
    toast("住宅租金已上报；下一步在测试控制区扫描证明，再确认上报");
    close();
  };
  return <div className="create-form">
    <label className="field"><span>住宅 Offering *</span><select value={offeringId} onChange={event => setOfferingId(event.target.value)}>{offerings.map(offering => <option key={offering.id} value={offering.id}>{offering.name} · {offering.id}</option>)}</select></label>
    {!offerings.length && <div className="banner warning">请先完成住宅 Offering 的 Sandbox 发布。</div>}
    <div className="fields two"><label className="field"><span>收益周期 *</span><input value={period} onChange={event => setPeriod(event.target.value)} placeholder="YYYY-MM" /></label><label className="field"><span>Record Date *</span><input type="date" value={recordDate} onChange={event => setRecordDate(event.target.value)} /></label></div>
    <div className="fields two"><label className="field"><span>本期实际净租金（人民币）*</span><input type="number" min="0" value={sourceAmount} onChange={event => setSourceAmount(event.target.value)} /></label><label className="field"><span>演示换算：1 U = 人民币 *</span><input type="number" min="0" value={exchangeRate} onChange={event => setExchangeRate(event.target.value)} /></label><label className="field"><span>费用／扣除 U</span><input type="number" min="0" value={deductions} onChange={event => setDeductions(event.target.value)} /></label></div>
    <p className="body-copy">1 U = 8 元仅为本住宅案例的手工测试换算，不是生产汇率。</p>
    <label className="field"><span>Sandbox 测试证明引用</span><select value={proofFile?.id || ""} onChange={event => setProofFile(state.mockEvidenceFiles.find(file => file.id === event.target.value))}><option value="">不使用测试证明；从本地上传 PDF</option>{state.mockEvidenceFiles.map(file => <option key={file.id} value={file.id}>{file.name} · {file.status} · Sandbox Mock</option>)}</select><small>测试证明由独立测试控制区创建，不代表真实租金收款。</small></label>
    <label className="field"><span>实际租金收入证明 PDF *</span><input type="file" accept=".pdf" onChange={event => { const file = event.target.files?.[0]; if (file) setProofFile({ id: `FILE-${Date.now()}`, name: file.name, category: "收益依据", status: "待扫描" }); }} /><small>{proofFile?.name || "未选择文件"} · 上传后在测试控制区执行 Mock 扫描</small></label>
    <div className="target"><span>本期可分配净额</span><strong>{Number.isFinite(net) && net > 0 ? formatU(net) : "—"}</strong></div>
    <Button onClick={save}>保存租金上报</Button>
  </div>;
}

function CreateRentBatch({ state, setState, close, toast }: {
  state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; close: () => void; toast: (message: string) => void;
}) {
  const reports = state.rentReports.filter(report => report.status === "已确认");
  const [reportId, setReportId] = useState(reports[0]?.id || "");
  const report = reports.find(row => row.id === reportId);
  const snapshot = state.holderSnapshots.find(row => row.offeringId === report?.offeringId && row.recordDate === report?.recordDate);
  let preview: ReturnType<typeof splitBySnapshot> = [];
  try { if (report && snapshot) preview = splitBySnapshot(report.netU, snapshot.lines); } catch { /* 显示缺失快照 */ }
  const save = () => {
    const result = createRentBatch(state, reportId, new Date().toISOString());
    if (result.error) return toast(result.error);
    setState(current => createRentBatch(current, reportId, new Date().toISOString()).state);
    toast("住宅租金分配批次已计算；请核对明细并确认批次");
    close();
  };
  return <div className="create-form">
    <label className="field"><span>已确认的租金上报 *</span><select value={reportId} onChange={event => setReportId(event.target.value)}>{reports.map(row => <option key={row.id} value={row.id}>{row.id} · {row.offeringId} · {row.period} · {formatU(row.netU)}</option>)}</select></label>
    {!reports.length && <div className="banner warning">尚无已确认的住宅租金上报，请先到「存续管理」完成上报和证明扫描。</div>}
    <p className="body-copy">Record Date：{report?.recordDate || "—"}；固定快照：{snapshot?.id || "缺失，请在测试控制区固定快照"}。金额保留六位小数，尾差分配给权益最多的持有人。</p>
    {preview.map(line => <div className="split-row" key={line.holderId}><span>{state.investors.find(row => row.id === line.investorId)?.name || line.investorId}<small>{line.basis.toLocaleString()} 权益单位</small></span><b>{formatU6(line.amount)}</b></div>)}
    <Button onClick={save}>创建分配批次</Button>
  </div>;
}

function CreateDebtBatch({ state, setState, close, toast, kind, preferredOfferingId, preferredEventId }: {
  state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void; toast: (s: string) => void; kind: "interest" | "principal"; preferredOfferingId?: string; preferredEventId?: string;
}) {
  const debtOfferings = state.offerings.filter(offering => state.instruments.some(instrument =>
    instrument.id === offering.instrumentId && instrument.type === "债权"));
  const [offeringId, setOfferingId] = useState(preferredOfferingId || debtOfferings[0]?.id || "");
  const events = state.debtInterestEvents.filter(event => event.offeringId === offeringId);
  const [selectedEventId, setSelectedEventId] = useState(preferredEventId || "");
  const event = events.find(row => row.id === selectedEventId) || events.find(row =>
    !state.distributions.some(batch => batch.interestEventId === row.id)) || events[0];
  const schedule = state.debtSchedules.find(row => row.offeringId === offeringId);
  const recordDate = kind === "interest" ? event?.recordDate : schedule?.maturityDate;
  const snapshot = state.holderSnapshots.find(row => row.offeringId === offeringId && row.recordDate === recordDate);
  const preview = snapshot && (kind === "interest" ? event?.amount : schedule?.principal)
    ? splitBySnapshot(kind === "interest" ? event!.amount : schedule!.principal, snapshot.lines) : [];
  const save = () => {
    const result = kind === "interest"
      ? createDebtInterestBatch(state, event?.id || "") : createDebtPrincipalBatch(state, offeringId);
    if (result.error) return toast(result.error);
    setState(current => (kind === "interest"
      ? createDebtInterestBatch(current, event!.id) : createDebtPrincipalBatch(current, offeringId)).state);
    toast(kind === "interest" ? "债权月息批次待复核；请进入详情确认" : "到期本金偿还批次待复核；请进入详情确认");
    close();
  };
  return <div className="create-form">
    <label className="field"><span>债权 Offering *</span><select value={offeringId} onChange={e => { setOfferingId(e.target.value); setSelectedEventId(""); }}>
      {debtOfferings.map(offering => <option key={offering.id} value={offering.id}>{offering.id} · {offering.name}</option>)}
    </select></label>
    {kind === "interest" && <label className="field"><span>应付利息事件 *</span><select value={event?.id || ""} onChange={e => setSelectedEventId(e.target.value)}>
      {events.map(row => <option key={row.id} value={row.id}>{row.period} · {row.days} 天 · {formatU6(row.amount)} · 应付 {row.dueDate}</option>)}
    </select></label>}
    <div className="detail-grid"><D label="固定付息计划" value={schedule?.id || "缺失，请到存续管理生成"} />
      <D label="Record Date" value={recordDate || "—"} /><D label="持有人快照" value={snapshot?.id || "缺失，请在演示控制台固定"} />
      <D label="Sandbox 测试日期" value={state.sandboxClock || "未设置"} /></div>
    {kind === "interest" && event && <p className="body-copy">Actual/365 Fixed：{schedule?.principal.toLocaleString()} U × {schedule?.annualRate}% × {event.days} 天 ÷ 365；{event.accrualFrom} 至 {event.accrualTo}。到期后不生成正常利息。</p>}
    <div className="target"><span>{kind === "interest" ? "本期应付利息" : "到期应偿本金"}</span><strong>{formatU6(kind === "interest" ? event?.amount || 0 : schedule?.principal || 0)}</strong></div>
    <h3>固定快照分配预览</h3>{preview.map(line => <div className="split-row" key={line.holderId}><span>{state.investors.find(row => row.id === line.investorId)?.name || line.investorId}<small>{line.basis.toLocaleString()} 权益单位</small></span><b>{formatU6(line.amount)}</b></div>)}
    <Button onClick={save}>创建{kind === "interest" ? "月息" : "本金偿还"}批次</Button>
  </div>;
}

function CreateDistribution({
  state,
  setState,
  close,
  toast,
}: {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  close: () => void;
  toast: (s: string) => void;
}) {
  const eligible = state.offerings.filter((offering) =>
    state.instruments.find(instrument => instrument.id === offering.instrumentId)?.type === "债权" &&
    state.holders.some(
      (holder) => holder.offeringId === offering.id && holder.registration === "登记有效",
    ),
  );
  const [offeringId, setOfferingId] = useState(eligible[0]?.id || state.offerings[0]?.id || "");
  const offering = state.offerings.find((item) => item.id === offeringId);
  const instrument = state.instruments.find((item) => item.id === offering?.instrumentId);
  const debt = instrument?.type === "债权";
  const [eventType, setEventType] = useState<"租金收益" | "债权利息" | "债权本金">(
    debt ? "债权利息" : "租金收益",
  );
  const [period, setPeriod] = useState(debt ? "2026-12" : "2026-11");
  const [recordDate, setRecordDate] = useState(debt ? "2027-01-01" : "2026-11-30");
  const [sourceAmount, setSourceAmount] = useState("8000");
  const [exchangeRate, setExchangeRate] = useState("8");
  const [deductions, setDeductions] = useState("0");
  const [proofFile, setProofFile] = useState<BusinessFile | undefined>();
  const holders = state.holders.filter(
    (holder) => holder.offeringId === offeringId && holder.registration === "登记有效",
  );
  const contractualPrincipal = Number(instrument?.terms?.principal || instrument?.totalRights || 0);
  const paidPrincipal = state.distributions
    .filter(
      (distribution) =>
        distribution.offeringId === offeringId &&
        distribution.eventType === "债权本金" &&
        distribution.status === "支付完成",
    )
    .reduce((sum, distribution) => sum + distribution.gross, 0);
  const outstandingPrincipal = Math.max(0, contractualPrincipal - paidPrincipal);
  let interest: ReturnType<typeof actual365MonthlyInterest> | undefined;
  let interestError = "";
  if (eventType === "债权利息" && instrument?.terms?.interestMethod === ACTUAL_365_FIXED) {
    try {
      interest = actual365MonthlyInterest({
        principal: outstandingPrincipal,
        annualRate: Number(instrument.terms.annualRate || 0),
        period,
        startDate: String(instrument.terms.startDate || ""),
        maturityDate: String(instrument.terms.maturityDate || ""),
      });
    } catch (error) {
      interestError = String(error);
    }
  }
  const interestBlockedReason =
    eventType !== "债权利息"
      ? ""
      : outstandingPrincipal <= 0
        ? "投资者债权本金已全部清偿，实际未偿本金为 0 U，不能继续产生正常利息"
        : instrument?.terms?.interestMethod !== ACTUAL_365_FIXED
          ? "权益条款未采用 Actual/365 Fixed，请核对历史版本"
          : interestError || (!interest?.days ? "所选月份没有有效计息天数；到期后不生成正常利息" : "");
  const gross =
    eventType === "租金收益"
      ? Math.max(0, Number(sourceAmount) / Number(exchangeRate || 1) - Number(deductions))
      : eventType === "债权利息"
        ? interest?.amount || 0
        : outstandingPrincipal;
  const save = () => {
    if (interestBlockedReason) return toast(`无法创建正常利息批次：${interestBlockedReason}`);
    if (!offeringId || gross <= 0) return toast("请选择 Offering 并生成大于 0 的应付金额");
    const duplicate = state.distributions.find(
      (distribution) =>
        distribution.offeringId === offeringId &&
        distribution.eventType === eventType &&
        distribution.period === period &&
        distribution.recordDate === recordDate &&
        distribution.instrumentId === instrument?.id &&
        distribution.status !== "已作废" &&
        !distribution.status.startsWith("草稿"),
    );
    if (duplicate) return toast(`相同期间的有效批次已存在：${duplicate.id}`);
    const blockers = [
      !holders.length ? "Record Date 没有有效法定持有人或权益快照" : "",
      eventType === "租金收益" && !proofFile ? "缺少实际租金收入证明" : "",
    ].filter(Boolean);
    const totalBasis = holders.reduce((sum, holder) => sum + holder.rights, 0);
    const items = totalBasis
      ? holders.map((holder) => ({
          holderId: holder.id,
          investorId: holder.investorId,
          basis: holder.rights,
          amount: Number(((gross * holder.rights) / totalBasis).toFixed(2)),
          status: "待确认",
        }))
      : [];
    setState((s) => {
      const id = `DST-${1001 + s.distributions.length}`;
      return {
        ...s,
        distributions: [
          {
            id,
            offeringId,
            period,
            recordDate,
            gross,
            status: blockers.length
              ? "草稿·待补充"
              : proofFile?.status === "待扫描"
                ? "资料待扫描"
                : "待复核",
            recipients: holders.length,
            eventType,
            instrumentId: instrument?.id,
            sourceAmount: Number(sourceAmount),
            sourceCurrency: eventType === "租金收益" ? "CNY" : "U",
            exchangeRate: eventType === "租金收益" ? Number(exchangeRate) : 1,
            proofFile,
            items,
            blockedReason: blockers.join("；") || undefined,
            ...(eventType === "债权利息" && interest ? {
              accrualFrom: interest.from,
              accrualTo: interest.to,
              interestDays: interest.days,
              dayCountBasis: ACTUAL_365_FIXED as "Actual/365 Fixed",
            } : {}),
          },
          ...s.distributions,
        ],
        activities: [
          newActivity("收益与分配", id, "创建收益分配草稿", blockers.length ? "待补充" : "成功"),
          ...s.activities,
        ],
      };
    });
    toast(
      blockers.length
        ? `${eventType}草稿已保存，不能确认：${blockers.join("；")}`
        : `${eventType}批次已创建并完成候选试算；尚未确认或支付`,
    );
    close();
  };
  return (
    <div className="create-form">
      <label className="field">
        <span>存续 Offering *</span>
        <select
          value={offeringId}
          onChange={(e) => {
            const nextId = e.target.value;
            const nextOffering = state.offerings.find((item) => item.id === nextId);
            const nextInstrument = state.instruments.find(
              (item) => item.id === nextOffering?.instrumentId,
            );
            setOfferingId(nextId);
            setEventType(nextInstrument?.type === "债权" ? "债权利息" : "租金收益");
          }}
        >
          {state.offerings.filter(o => state.instruments.find(instrument => instrument.id === o.instrumentId)?.type === "债权").map((o) => (
            <option value={o.id} key={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>事件类型 *</span>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value as typeof eventType)}
        >
          {debt ? (
            <>
              <option>债权利息</option>
              <option>债权本金</option>
            </>
          ) : (
            <option>租金收益</option>
          )}
        </select>
        <small>租金、利息和本金分别建批次、确认和支付。</small>
      </label>
      <div className="fields two">
        <label className="field">
          <span>收益周期 *</span>
          <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" />
        </label>
        <label className="field">
          <span>Record Date *</span>
          <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} />
        </label>
      </div>
      {eventType === "租金收益" ? (
        <>
          <div className="fields two">
            <label className="field">
              <span>实际租金收入（人民币）*</span>
              <input
                type="number"
                value={sourceAmount}
                onChange={(e) => setSourceAmount(e.target.value)}
              />
            </label>
            <label className="field">
              <span>演示换算：1 U = 人民币 *</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
            </label>
            <label className="field">
              <span>费用 / 扣除 U</span>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
              />
            </label>
          </div>
          <label className="field file-upload-field">
            <span>实际租金收入证明 *</span>
            <div className="mock-file-actions">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    setProofFile({
                      id: `FILE-${Date.now()}`,
                      name: file.name,
                      category: "收益依据",
                      status: "待扫描",
                    });
                }}
              />
              <Button
                variant="secondary"
                onClick={() =>
                  setProofFile({
                    id: `FILE-MOCK-${Date.now()}`,
                    name: "DEMO_Rental_Income_Statement.pdf",
                    category: "收益依据",
                    status: "待扫描",
                  })
                }
              >
                模拟添加文件
              </Button>
            </div>
            <small>{proofFile?.name || "未选择；选择后需在 Mock 控制台扫描"}</small>
          </label>
        </>
      ) : (
        <div className="info-note">
          <ShieldCheck size={17} />
          <p>
            {eventType === "债权利息"
              ? `Actual/365 Fixed：实际未偿本金 ${formatU(outstandingPrincipal)} × 年利率 ${instrument?.terms?.annualRate || 0}% × ${interest?.days || 0} 天 ÷ 365；计息日期 ${interest?.from || "—"} 至 ${interest?.to || "—"}。计息边界以正式合同为准。`
              : `本金按 Instrument 条款单独处理；当前实际未偿本金 ${formatU(outstandingPrincipal)}，不与当期利息合并。`}
          </p>
        </div>
      )}
      {interestBlockedReason && (
        <div className="banner danger">
          <AlertCircle size={17} />
          <div>
            <b>不能生成正常利息</b>
            <p>{interestBlockedReason}</p>
          </div>
        </div>
      )}
      <div className="target">
        <span>{eventType}候选应付总额</span>
        <strong>{formatU(gross)}</strong>
      </div>
      <div className="target">
        <span>名册收款人数</span>
        <strong>{holders.length} 名</strong>
      </div>
      {holders.length > 0 && (
        <div className="distribution-preview">
          {holders.map((holder) => {
            const total = holders.reduce((sum, item) => sum + item.rights, 0);
            return (
              <div key={holder.id}>
                <span>
                  {state.investors.find((investor) => investor.id === holder.investorId)?.name}
                  <small>{holder.rights.toLocaleString()} 权益单位</small>
                </span>
                <b>{formatU((gross * holder.rights) / total)}</b>
              </div>
            );
          })}
        </div>
      )}
      <div className="sticky-actions">
        <Button variant="ghost" onClick={close}>
          取消
        </Button>
        <Button onClick={save}>创建候选批次</Button>
      </div>
    </div>
  );
}

function PortalPreview({ state, close }: { state: AppState; close: () => void }) {
  return (
    <div className="portal-full">
      <header>
        <button className="back-admin" onClick={close}>
          <ArrowLeft size={15} />
          返回 Issuer 后台
        </button>
        <div className="portal-brand">
          <span>{state.portal.logo || "星"}</span>
          <b>{state.portal.name || state.company?.name}</b>
        </div>
        <nav>发行项目　资产披露　关于企业</nav>
        <div className="demo-tag">只读演示站</div>
      </header>
      <main>
        <section className="portal-hero">
          <div>
            <span>REAL-WORLD ASSETS · VERIFIED DISCLOSURE</span>
            <h1>
              让优质真实资产
              <br />
              更透明地被看见
            </h1>
            <p>{state.company?.description}</p>
            <button
              onClick={() =>
                document.getElementById("portal-offerings")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              浏览发行项目 <ArrowRight size={16} />
            </button>
          </div>
          <div className="portal-art">
            <div className="building">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="portal-stat">
              <small>当前展示项目</small>
              <b>{state.offerings.filter((o) => ["认购中", "待开始"].includes(o.status)).length}</b>
              <span>所有数据均为模拟</span>
            </div>
          </div>
        </section>
        <section className="portal-trust">
          <span>
            <ShieldCheck size={20} />
            <b>企业资料</b>
            <small>模拟 KYB 已通过</small>
          </span>
          <span>
            <FileText size={20} />
            <b>资产披露</b>
            <small>版本化材料与证据</small>
          </span>
          <span>
            <Activity size={20} />
            <b>持续更新</b>
            <small>独立业务状态记录</small>
          </span>
        </section>
        <section className="portal-offerings" id="portal-offerings">
          <div className="portal-section-title">
            <span>FEATURED OFFERINGS</span>
            <h2>当前发行项目</h2>
            <p>以下内容仅用于只读产品演示，不构成投资建议或真实认购邀请。</p>
          </div>
          <div className="offering-showcase">
            {state.offerings
              .filter((o) => ["认购中", "待开始"].includes(o.status))
              .map((o, i) => (
                <article key={o.id}>
                  <div className={`property p${i + 1}`}>
                    <div className="property-shape" />
                    <Status value={o.status} />
                  </div>
                  <div>
                    <small>
                      {state.assets.find((a) => a.id === o.assetId)?.subtype} · {o.round}
                    </small>
                    <h3>{o.name}</h3>
                    <p>
                      {state.assets.find((a) => a.id === o.assetId)?.location || "Asia Pacific"} ·
                      资产资料已披露
                    </p>
                    <div className="offer-numbers">
                      <span>
                        <small>目标规模</small>
                        <b>{formatU(o.tokens * o.price)}</b>
                      </span>
                      <span>
                        <small>已募集 / 剩余</small>
                        <b>
                          {formatU(offeringRaised(state, o.id))} /{" "}
                          {formatU(Math.max(0, o.tokens * o.price - offeringRaised(state, o.id)))}
                        </b>
                      </span>
                      <span>
                        <small>每 Token</small>
                        <b>{formatU(o.price)}</b>
                      </span>
                    </div>
                    <button onClick={() => alert("只读演示：不提供真实 KYC、支付或认购操作。")}>
                      查看项目详情 <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </section>
      </main>
      <footer>
        <div>
          <div className="portal-brand">
            <span>{state.portal.logo || "星"}</span>
            <b>{state.portal.name || state.company?.name}</b>
          </div>
          <p>演示环境 · 非生产服务 · 不构成投资建议</p>
        </div>
        <small>Powered by RWA OS · Issuer Sandbox</small>
      </footer>
    </div>
  );
}

export default App;
