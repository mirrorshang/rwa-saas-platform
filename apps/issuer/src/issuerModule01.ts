import type { AppState, Asset, BusinessFile, Instrument, Offering, Project } from "./data.ts";
import { ACTUAL_365_FIXED } from "./actual365.ts";

export const ISSUER_STORAGE_KEY = "rwa-issuer-state-v4";
export const LEGACY_ISSUER_STORAGE_KEY = "rwa-issuer-state-v3";

type Collection = keyof Pick<
  AppState,
  | "assets" | "instruments" | "projects" | "offerings" | "investors" | "orders"
  | "payments" | "holders" | "wallets" | "tokens" | "distributions"
  | "mockEvents" | "activities" | "messages"
>;

const requiredLegacy: Collection[] = [
  "assets", "instruments", "offerings", "investors", "orders", "payments", "holders", "wallets", "tokens", "distributions",
];
const collections: Collection[] = [
  ...requiredLegacy, "projects", "mockEvents", "activities", "messages",
];

export interface StorageIssue {
  source: string;
  raw: string;
  reasons: string[];
}

export type LoadResult =
  | { state: AppState; issue?: never; source: "empty" | "v3" | "v4"; readRaw?: string | null }
  | { state: AppState; issue: StorageIssue; source: "blocked" };

export interface StorageReader {
  getItem(key: string): string | null;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const uniqueIds = (name: string, rows: { id: string }[], reasons: string[]) => {
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || !row.id) {
      reasons.push(`${name} 存在无效 ID`);
    } else if (seen.has(row.id)) {
      reasons.push(`${name} 存在重复 ID：${row.id}`);
    } else {
      seen.add(row.id);
    }
  }
};

export const projectIdFor = (assetId: string, instrumentId: string, version: string) =>
  `PRJ-${[assetId, instrumentId, version].map((part) => `${part.length}_${part}`).join("_")}`;

export function ensureProjects(state: AppState): AppState {
  const projects = [...(state.projects || [])];
  const offerings = state.offerings.map((offering) => {
    const instrument = state.instruments.find((item) => item.id === offering.instrumentId);
    const asset = state.assets.find((item) => item.id === offering.assetId);
    if (!instrument || !asset) return offering;
    const instrumentVersion = offering.instrumentVersion || instrument.version;
    const id = offering.projectId || projectIdFor(asset.id, instrument.id, instrumentVersion);
    if (!projects.some((item) => item.id === id)) {
      projects.push({
        id, assetId: asset.id, instrumentId: instrument.id, instrumentVersion,
        name: `${asset.name}发行项目`,
        status: asset.status === "Ready" && instrument.status === "Ready" ? "Ready" : "Draft",
      });
    }
    return {
      ...offering, projectId: id,
      assetVersion: offering.assetVersion || asset.version || 1,
      instrumentVersion,
      revision: offering.revision || 1,
    };
  });
  return {
    ...state,
    projects: projects.map((project) => {
      const asset = state.assets.find((item) => item.id === project.assetId);
      const instrument = state.instruments.find((item) => item.id === project.instrumentId);
      return { ...project, status: asset?.status === "Ready" && instrument?.status === "Ready" ? "Ready" as const : "Draft" as const };
    }),
    offerings,
  };
}

export function validateIssuerState(state: AppState): string[] {
  const reasons: string[] = [];
  for (const name of collections) uniqueIds(name, state[name] as { id: string }[], reasons);
  uniqueIds("issuanceTasks", state.issuanceTasks, reasons);
  uniqueIds("publications", state.publications, reasons);
  uniqueIds("allocations", state.allocations, reasons);
  uniqueIds("holderSnapshots", state.holderSnapshots, reasons);
  uniqueIds("rentReports", state.rentReports, reasons);
  uniqueIds("distributionPayments", state.distributionPayments, reasons);
  uniqueIds("investorIncomes", state.investorIncomes, reasons);
  uniqueIds("mockEvidenceFiles", state.mockEvidenceFiles, reasons);
  const rentPeriods = new Set<string>();
  for (const report of state.rentReports) {
    const key = `${report.offeringId}:${report.period}`;
    if (rentPeriods.has(key)) reasons.push(`${key} 重复租金上报`);
    rentPeriods.add(key);
    if (!state.offerings.some(row => row.id === report.offeringId)) reasons.push(`${report.id} 的 Offering 不存在`);
  }
  const rentBatches = new Set<string>();
  for (const batch of state.distributions.filter(row => row.eventType === "租金收益" && row.reportId && row.status !== "已作废")) {
    const key = `${batch.offeringId}:${batch.period}`;
    if (rentBatches.has(key)) reasons.push(`${key} 重复租金批次`);
    rentBatches.add(key);
    if (!state.rentReports.some(row => row.id === batch.reportId) || !state.holderSnapshots.some(row => row.id === batch.holderSnapshotId)) reasons.push(`${batch.id} 缺少收益上报或持有人快照`);
  }
  const incomeLines = new Set<string>();
  for (const income of state.investorIncomes) {
    const key = `${income.batchId}:${income.holderId}`;
    if (incomeLines.has(key)) reasons.push(`${key} 重复到账记录`);
    incomeLines.add(key);
    if (!state.distributionPayments.some(row => row.id === income.paymentId && row.status === "已支付")) reasons.push(`${income.id} 缺少成功的模拟支付`);
  }
  const allocatedOrders = new Set<string>();
  const allocatedCapacity = new Map<string, number>();
  for (const allocation of state.allocations) {
    const order = state.orders.find(row => row.id === allocation.orderId);
    if (allocatedOrders.has(allocation.orderId)) reasons.push(`${allocation.orderId} 重复配售`);
    allocatedOrders.add(allocation.orderId);
    if (!order || order.offeringId !== allocation.offeringId || order.investorId !== allocation.investorId || allocation.environment !== "Sandbox") reasons.push(`${allocation.id} 的订单关联或环境无效`);
    if (order && (order.confirmed !== allocation.quantity || !state.payments.some(row => row.orderId === order.id && row.status === "最终匹配"))) reasons.push(`${allocation.id} 缺少已匹配付款或确认数量不一致`);
    allocatedCapacity.set(allocation.offeringId, (allocatedCapacity.get(allocation.offeringId) || 0) + allocation.quantity);
  }
  for (const [offeringId, quantity] of allocatedCapacity) {
    const offering = state.offerings.find(row => row.id === offeringId);
    if (!offering || quantity > offering.tokens) reasons.push(`${offeringId} 配售容量超额`);
  }
  const holderOrders = new Set<string>();
  for (const holder of state.holders) {
    if (holderOrders.has(holder.orderId)) reasons.push(`${holder.orderId} 重复持有人登记`);
    holderOrders.add(holder.orderId);
    if (holder.environment === "Sandbox" && !state.allocations.some(row => row.id === holder.allocationId && row.orderId === holder.orderId)) reasons.push(`${holder.id} 缺少配售来源`);
  }
  const deliveredOrders = new Set<string>();
  for (const token of state.tokens.filter(row => row.operation === "Mint / 交付")) {
    if (deliveredOrders.has(token.orderId)) reasons.push(`${token.orderId} 重复 Token 模拟交付`);
    deliveredOrders.add(token.orderId);
  }
  const snapshotDates = new Set<string>();
  for (const snapshot of state.holderSnapshots) {
    const key = `${snapshot.offeringId}:${snapshot.recordDate}`;
    if (snapshotDates.has(key)) reasons.push(`${key} 重复持有人快照`);
    snapshotDates.add(key);
    if (!state.offerings.some(row => row.id === snapshot.offeringId) || snapshot.environment !== "Sandbox" || !Array.isArray(snapshot.lines)) reasons.push(`${snapshot.id} 的 Offering 或持有人明细无效`);
  }
  const taskOfferings = new Set<string>();
  for (const task of state.issuanceTasks) {
    if (taskOfferings.has(task.offeringId)) reasons.push(`${task.offeringId} 存在重复发行任务`);
    taskOfferings.add(task.offeringId);
    if (!state.offerings.some(item => item.id === task.offeringId) || task.environment !== "Sandbox") reasons.push(`${task.id} 的 Offering 或环境无效`);
  }
  const publishedOfferings = new Set<string>();
  for (const publication of state.publications) {
    if (publishedOfferings.has(publication.offeringId)) reasons.push(`${publication.offeringId} 存在重复发布快照`);
    publishedOfferings.add(publication.offeringId);
    if (!state.issuanceTasks.some(task => task.id === publication.taskId && task.offeringId === publication.offeringId && task.status === "已核验")) reasons.push(`${publication.id} 缺少已核验的原发行任务`);
  }
  const owners = new Map<string, string>();
  for (const [name, rows] of [["Asset", state.assets], ["Instrument", state.instruments], ["Project", state.projects], ["Offering", state.offerings]] as const) {
    for (const row of rows) {
      const owner = owners.get(row.id);
      if (owner) reasons.push(`${row.id} 同时属于 ${owner} 与 ${name}`);
      owners.set(row.id, name);
    }
  }
  const codes = new Set<string>();
  for (const asset of state.assets) {
    if (codes.has(asset.code)) reasons.push(`资产编号重复：${asset.code}`);
    codes.add(asset.code);
  }
  const assetIds = new Set(state.assets.map((item) => item.id));
  const instrumentIds = new Set(state.instruments.map((item) => item.id));
  const projectIds = new Set(state.projects.map((item) => item.id));
  const offeringIds = new Set(state.offerings.map((item) => item.id));
  const orderIds = new Set(state.orders.map((item) => item.id));
  for (const instrument of state.instruments) {
    if (!assetIds.has(instrument.assetId)) reasons.push(`${instrument.id} 的 Asset 不存在`);
  }
  for (const project of state.projects) {
    const instrument = state.instruments.find((item) => item.id === project.instrumentId);
    if (!assetIds.has(project.assetId) || !instrument || instrument.assetId !== project.assetId || instrument.version !== project.instrumentVersion)
      reasons.push(`${project.id} 的 Asset / Instrument 版本关联冲突`);
  }
  const rounds = new Set<string>();
  for (const offering of state.offerings) {
    const instrument = state.instruments.find((item) => item.id === offering.instrumentId);
    const project = state.projects.find((item) => item.id === offering.projectId);
    if (!assetIds.has(offering.assetId) || !instrument || instrument.assetId !== offering.assetId || !project || project.assetId !== offering.assetId || project.instrumentId !== instrument.id || project.instrumentVersion !== offering.instrumentVersion)
      reasons.push(`${offering.id} 的 Asset / Instrument / Project 关联冲突`);
    const roundKey = JSON.stringify([offering.projectId, offering.round]);
    if (rounds.has(roundKey)) reasons.push(`${offering.id} 的项目轮次重复`);
    rounds.add(roundKey);
    if (offering.confirmationSnapshot) {
      const terms = offering.confirmationSnapshot.offeringTerms;
      if (offering.confirmationSnapshot.reservedTokens !== offering.tokens ||
          !terms || terms.tokens !== offering.tokens || terms.price !== offering.price ||
          terms.start !== offering.start || terms.end !== offering.end || terms.round !== offering.round)
        reasons.push(`${offering.id} 的确认快照或发行条款冲突`);
    }
  }
  for (const order of state.orders) if (!offeringIds.has(order.offeringId)) reasons.push(`${order.id} 的 Offering 不存在`);
  for (const payment of state.payments) if (!orderIds.has(payment.orderId)) reasons.push(`${payment.id} 的订单不存在`);
  for (const holder of state.holders) if (!orderIds.has(holder.orderId) || !offeringIds.has(holder.offeringId)) reasons.push(`${holder.id} 的订单或 Offering 不存在`);
  for (const token of state.tokens) if (!orderIds.has(token.orderId) || !offeringIds.has(token.offeringId)) reasons.push(`${token.id} 的订单或 Offering 不存在`);
  for (const distribution of state.distributions) if (!offeringIds.has(distribution.offeringId)) reasons.push(`${distribution.id} 的 Offering 不存在`);
  for (const instrument of state.instruments) {
    const confirmed = state.offerings.filter((item) => item.instrumentId === instrument.id && item.confirmed).reduce((sum, item) => sum + item.tokens, 0);
    if (!Number.isFinite(instrument.used) || !Number.isFinite(instrument.tokenCap) || instrument.used < confirmed || instrument.used > instrument.tokenCap)
      reasons.push(`${instrument.id} 的容量预留与确认记录不一致`);
  }
  return reasons;
}

export function parseIssuerState(raw: string, source: "v3" | "v4", defaults: AppState): LoadResult {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { state: defaults, source: "blocked", issue: { source, raw, reasons: ["JSON 无法解析"] } };
  }
  if (!isObject(value))
    return { state: defaults, source: "blocked", issue: { source, raw, reasons: ["根对象格式错误"] } };
  const reasons: string[] = [];
  const required = source === "v3" ? requiredLegacy : collections;
  for (const name of required) if (!Array.isArray(value[name])) reasons.push(`${name} 集合缺失或格式错误`);
  if (source === "v4" && value.schemaVersion !== 4) reasons.push("版本标记不是 4");
  if (reasons.length)
    return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
  const hydrated = {
    ...defaults, ...value,
    portal: { ...defaults.portal, ...(isObject(value.portal) ? value.portal : {}) },
  } as unknown as AppState;
  for (const name of ["readinessReports", "issuanceTasks", "publications", "allocations", "holderSnapshots", "rentReports", "distributionPayments", "investorIncomes", "mockEvidenceFiles"] as const) {
    if (value[name] === undefined) hydrated[name] = [];
    else if (!Array.isArray(value[name])) reasons.push(`${name} 格式损坏`);
    else if (value[name].some((row: unknown) => !isObject(row) || (name !== "readinessReports" && (typeof row.id !== "string" || !row.id)) || (["allocations", "holderSnapshots", "rentReports", "issuanceTasks", "publications"].includes(name) && typeof row.offeringId !== "string"))) reasons.push(`${name} 包含损坏记录`);
  }
  if (reasons.length) return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
  for (const report of hydrated.readinessReports) {
    if (typeof report.fingerprint !== "string" || typeof report.checkedAt !== "string" || !Array.isArray(report.groups) || report.groups.some(group => !isObject(group) || typeof group.title !== "string" || typeof group.passed !== "boolean" || !Array.isArray(group.reasons))) reasons.push(`${report.offeringId} 的发行准备检查记录损坏`);
  }
  for (const task of hydrated.issuanceTasks) {
    if (!isObject(task) || !["已提交", "执行中", "已核验", "失败", "Unknown"].includes(task.status as string) || typeof task.readinessFingerprint !== "string" || task.environment !== "Sandbox") reasons.push(`${task?.id || "未知任务"} 的发行任务记录损坏`);
  }
  for (const publication of hydrated.publications) {
    if (!isObject(publication) || publication.environment !== "Sandbox" || typeof publication.taskId !== "string" || typeof publication.mockContractReference !== "string" || !isObject(publication.confirmedOffering)) reasons.push(`${publication?.id || "未知发布"} 的发布快照损坏`);
  }
  for (const allocation of hydrated.allocations) {
    if (typeof allocation.orderId !== "string" || typeof allocation.investorId !== "string" || !Number.isSafeInteger(allocation.quantity) || !Number.isFinite(allocation.rights) || allocation.environment !== "Sandbox") reasons.push(`${allocation.id} 的配售记录损坏`);
  }
  for (const snapshot of hydrated.holderSnapshots) {
    if (typeof snapshot.recordDate !== "string" || typeof snapshot.instrumentVersion !== "string" || snapshot.environment !== "Sandbox" || !Array.isArray(snapshot.lines) || snapshot.lines.some(line => !isObject(line) || typeof line.holderId !== "string" || !Number.isFinite(line.rights))) reasons.push(`${snapshot.id} 的持有人快照损坏`);
  }
  for (const report of hydrated.rentReports) {
    if (typeof report.period !== "string" || typeof report.recordDate !== "string" || !Number.isFinite(report.netU) || !isObject(report.proofFile) || report.environment !== "Sandbox") reasons.push(`${report.id} 的租金上报损坏`);
  }
  for (const payment of hydrated.distributionPayments) {
    if (typeof payment.batchId !== "string" || typeof payment.holderId !== "string" || typeof payment.intentId !== "string" || !Number.isFinite(payment.amount) || payment.environment !== "Sandbox") reasons.push(`${payment.id} 的分配支付记录损坏`);
  }
  for (const income of hydrated.investorIncomes) {
    if (typeof income.batchId !== "string" || typeof income.holderId !== "string" || typeof income.paymentId !== "string" || !Number.isFinite(income.amount)) reasons.push(`${income.id} 的投资者收益记录损坏`);
  }
  for (const file of hydrated.mockEvidenceFiles) {
    if (typeof file.name !== "string" || file.category !== "收益依据" || !["待扫描", "可引用"].includes(file.status)) reasons.push(`${file.id} 的 Mock 收益证明损坏`);
  }
  if (value.sandboxClock !== undefined && typeof value.sandboxClock !== "string") reasons.push("sandboxClock 格式损坏");
  if (reasons.length) return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
  for (const name of collections) {
    if (!Array.isArray(value[name])) (hydrated as unknown as Record<string, unknown>)[name] = defaults[name];
  }
  for (const name of collections) {
    const rows = hydrated[name] as unknown[];
    if (rows.some((row) => !isObject(row) || typeof row.id !== "string" || !row.id))
      reasons.push(`${name} 包含损坏的对象`);
  }
  if (reasons.length)
    return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
  for (const asset of hydrated.assets) {
    if (typeof asset.name !== "string" || typeof asset.code !== "string" || !["Draft", "Ready"].includes(asset.status))
      reasons.push(`${asset.id} 的资产字段损坏`);
  }
  for (const instrument of hydrated.instruments) {
    if (typeof instrument.assetId !== "string" || typeof instrument.version !== "string" ||
        !Number.isFinite(instrument.tokenCap) || !Number.isFinite(instrument.used) || !["Draft", "Ready"].includes(instrument.status))
      reasons.push(`${instrument.id} 的权益字段损坏`);
  }
  for (const offering of hydrated.offerings) {
    if (typeof offering.assetId !== "string" || typeof offering.instrumentId !== "string" ||
        typeof offering.walletId !== "string" || typeof offering.status !== "string" ||
        !Number.isFinite(offering.tokens) || !Number.isFinite(offering.price))
      reasons.push(`${offering.id} 的发行字段损坏`);
  }
  for (const wallet of hydrated.wallets) {
    if (typeof wallet.status !== "string" || typeof wallet.address !== "string")
      reasons.push(`${wallet.id} 的钱包字段损坏`);
  }
  if (reasons.length)
    return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
  try {
    const migrated = ensureProjects(hydrated);
    reasons.push(...validateIssuerState(migrated));
    if (reasons.length)
      return { state: defaults, source: "blocked", issue: { source, raw, reasons } };
    return { state: migrated, source, readRaw: source === "v4" ? raw : null };
  } catch (error) {
    return { state: defaults, source: "blocked", issue: { source, raw, reasons: [`对象迁移失败：${String(error)}`] } };
  }
}

export function loadIssuerState(storage: StorageReader, defaults: AppState): LoadResult {
  try {
    const current = storage.getItem(ISSUER_STORAGE_KEY);
    if (current !== null) return parseIssuerState(current, "v4", defaults);
    const legacy = storage.getItem(LEGACY_ISSUER_STORAGE_KEY);
    if (legacy !== null) return parseIssuerState(legacy, "v3", defaults);
    return { state: defaults, source: "empty", readRaw: null };
  } catch (error) {
    return { state: defaults, source: "blocked", issue: { source: "storage", raw: "", reasons: [`无法读取本地数据：${String(error)}`] } };
  }
}

export const serializeIssuerState = (state: AppState) => JSON.stringify({ ...state, schemaVersion: 4 });

export function persistIssuerState(storage: { getItem(key: string): string | null; setItem(key: string, value: string): void }, state: AppState, expectedRaw: string | null): { raw?: string; error?: string } {
  try {
    if (storage.getItem(ISSUER_STORAGE_KEY) !== expectedRaw)
      return { error: "另一个页面已更新本地业务记录；当前页面停止写入，请导出并核对" };
    const raw = serializeIssuerState(state);
    storage.setItem(ISSUER_STORAGE_KEY, raw);
    return { raw };
  } catch (error) {
    return { error: `无法保存当前数据：${String(error)}` };
  }
}

export function nextNumericId(prefix: string, rows: { id: string }[], floor: number): string {
  const expression = new RegExp(`^${prefix}-(\\d+)$`);
  const numbers = rows.map((item) => expression.exec(item.id)?.[1]).filter(Boolean).map(Number);
  let next = Math.max(floor, ...numbers) + 1;
  const ids = new Set(rows.map((item) => item.id));
  while (ids.has(`${prefix}-${next}`)) next += 1;
  return `${prefix}-${next}`;
}

export type ConfirmResult = { state: AppState; error?: string; changed: boolean };

export function confirmIssuerOffering(state: AppState, id: string, expectedRevision: number, confirmedAt: string): ConfirmResult {
  const offering = state.offerings.find((item) => item.id === id);
  if (!offering) return { state, error: "Offering 不存在", changed: false };
  if (offering.confirmed) return { state, changed: false };
  if (offering.status !== "草稿") return { state, error: "仅草稿 Offering 可以确认；历史状态须先核对", changed: false };
  if ((offering.revision || 1) !== expectedRevision) return { state, error: "Offering 版本已变化，请刷新后重试", changed: false };
  const asset = state.assets.find((item) => item.id === offering.assetId);
  const instrument = state.instruments.find((item) => item.id === offering.instrumentId);
  const project = state.projects.find((item) => item.id === offering.projectId);
  const wallet = state.wallets.find((item) => item.id === offering.walletId);
  const blockers = [
    state.kybStatus !== "已通过" ? "KYB 未通过" : "",
    state.plan !== "Standard" ? "Mock Standard 未生效" : "",
    asset?.status !== "Ready" ? "Asset 未 Ready" : "",
    instrument?.status !== "Ready" ? "Instrument 未 Ready" : "",
    instrument?.type === "债权" && instrument.terms?.interestMethod !== ACTUAL_365_FIXED ? "债权计息方式须为 Actual/365 Fixed" : "",
    !project || project.assetId !== asset?.id || project.instrumentId !== instrument?.id || project.instrumentVersion !== instrument?.version ? "Project 关联或版本冲突" : "",
    project?.status !== "Ready" ? "Project 未 Ready" : "",
    offering.assetVersion !== (asset?.version || 1) || offering.instrumentVersion !== instrument?.version ? "Asset / Instrument 版本已变化" : "",
    !wallet?.status.includes("已验证") ? "收款钱包未验证" : "",
    !offering.disclosureFiles?.some((file) => file.category === "发行披露" && file.status === "可引用") ? "发行披露文件不可引用" : "",
    !Number.isInteger(offering.tokens) || offering.tokens <= 0 ? "发行份数无效" : "",
    !Number.isFinite(offering.price) || offering.price <= 0 || !Number.isFinite(offering.minimum) || (offering.minimum || 0) <= 0 ? "价格或最低认购金额无效" : "",
    !offering.start || !offering.end || offering.start >= offering.end ? "认购时间窗口无效" : "",
    instrument && offering.tokens > instrument.tokenCap - instrument.used ? "授权容量不足" : "",
  ].filter(Boolean);
  if (blockers.length) return { state, error: blockers.join("、"), changed: false };
  const snapshot = {
    confirmedAt,
    asset: structuredClone(asset!), instrument: structuredClone(instrument!), project: structuredClone(project!),
    walletId: wallet!.id, walletAddress: wallet!.address,
    disclosureFiles: structuredClone(offering.disclosureFiles || []), reservedTokens: offering.tokens,
    offeringTerms: {
      name: offering.name, round: offering.round, tokens: offering.tokens, price: offering.price,
      start: offering.start, end: offering.end, summary: offering.summary, minimum: offering.minimum,
    },
  };
  return {
    changed: true,
    state: {
      ...state,
      offerings: state.offerings.map((item) => item.id === id ? { ...item, confirmed: true, status: "准备就绪", contractStatus: "未申请", confirmationSnapshot: snapshot, revision: expectedRevision + 1 } : item),
      instruments: state.instruments.map((item) => item.id === instrument!.id ? { ...item, used: item.used + offering.tokens } : item),
    },
  };
}
