import type { AppState, Asset, Instrument, ReadinessGroup, ReadinessReport } from "./data.ts";
import { ACTUAL_365_FIXED } from "./actual365.ts";

export type IssuanceResult = { state: AppState; changed: boolean; error?: string };

const group = (key: number, title: string, reasons: string[], route: string): ReadinessGroup => ({
  key, title, passed: reasons.length === 0, reasons, route,
});
const fileReady = (files: { category: string; status: string }[] | undefined, category: string) =>
  files?.some(file => file.category === category && file.status === "可引用") || false;
export const sandboxBusinessDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  ? value
  : new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const dateOnly = sandboxBusinessDate;
const assetTerms = (asset: Asset | undefined) => asset && ({
  id: asset.id, name: asset.name, code: asset.code, category: asset.category, subtype: asset.subtype,
  value: asset.value, location: asset.location, address: asset.address, details: asset.details,
  files: asset.files, version: asset.version,
});
const instrumentTerms = (instrument: Instrument | undefined) => instrument && ({
  id: instrument.id, assetId: instrument.assetId, name: instrument.name, type: instrument.type,
  version: instrument.version, totalRights: instrument.totalRights, unit: instrument.unit,
  tokenCap: instrument.tokenCap, terms: instrument.terms, files: instrument.files,
});

export function readinessFingerprint(state: AppState, id: string): string {
  const offering = state.offerings.find(item => item.id === id);
  return JSON.stringify({
    company: state.company?.name, kyb: state.kybStatus, plan: state.plan, planEnd: state.planEnd,
    asset: state.assets.find(item => item.id === offering?.assetId),
    instrument: state.instruments.find(item => item.id === offering?.instrumentId),
    project: state.projects.find(item => item.id === offering?.projectId),
    offering: offering && { ...offering, status: undefined, contractStatus: undefined, publicationStatus: undefined, subscriptionStatus: undefined, tokenIssuanceStatus: undefined },
    wallet: state.wallets.find(item => item.id === offering?.walletId),
  });
}

export function checkIssuanceReadiness(state: AppState, id: string, checkedAt: string): ReadinessReport {
  const off = state.offerings.find(item => item.id === id);
  const asset = state.assets.find(item => item.id === off?.assetId);
  const instrument = state.instruments.find(item => item.id === off?.instrumentId);
  const project = state.projects.find(item => item.id === off?.projectId);
  const wallet = state.wallets.find(item => item.id === off?.walletId);
  const snap = off?.confirmationSnapshot;
  const assetFiles = asset?.subtype === "住宅物业" ? ["权属证明", "估值依据", "租赁合同"]
    : asset?.subtype === "单笔企业借款债权" ? ["借款合同", "债权证明", "余额证明", "估值依据"] : [];
  const groups = [
    group(1, "企业 KYB 与 Standard 演示准入", [
      state.kybStatus !== "已通过" ? "KYB 尚未通过" : "",
      state.plan !== "Standard" ? "Mock Standard 尚未生效" : "",
      !state.planEnd || state.planEnd < dateOnly(checkedAt) ? "Mock Standard 已到期或缺少有效期" : "",
      !state.company ? "企业资料缺失" : "",
    ].filter(Boolean), "company"),
    group(2, "Asset 资料、文件与 Ready", [
      !asset || asset.status !== "Ready" ? "Asset 未 Ready" : "",
      ...assetFiles.filter(category => !fileReady(asset?.files, category)).map(category => `缺少可引用文件：${category}`),
      asset?.missing?.length ? `资产资料仍缺：${asset.missing.join("、")}` : "",
      !snap || snap.asset.id !== asset?.id || snap.asset.version !== asset?.version || off?.assetVersion !== asset?.version ? "Asset 版本与确认快照不一致" : "",
      snap && JSON.stringify(assetTerms(asset)) !== JSON.stringify(assetTerms(snap.asset)) ? "Asset 内容与固定快照不一致" : "",
    ].filter(Boolean), "assets"),
    group(3, "Instrument 条款、容量与版本", [
      !instrument || instrument.status !== "Ready" ? "Instrument 未 Ready" : "",
      instrument?.missing?.length ? `权益条款仍缺：${instrument.missing.join("、")}` : "",
      !snap || snap.instrument.id !== instrument?.id || snap.instrument.version !== instrument?.version || off?.instrumentVersion !== instrument?.version ? "Instrument 版本与确认快照不一致" : "",
      snap && JSON.stringify(instrumentTerms(instrument)) !== JSON.stringify(instrumentTerms(snap.instrument)) ? "Instrument 条款与固定快照不一致" : "",
      !project || project.id !== snap?.project.id || project.instrumentVersion !== instrument?.version ? "Project 关联或版本不一致" : "",
      !instrument || !off || instrument.used < off.tokens || instrument.used > instrument.tokenCap ? "权益容量预留不一致或超额" : "",
      instrument?.type === "债权" && instrument.terms?.interestMethod !== ACTUAL_365_FIXED ? "债权计息口径必须为 Actual/365 Fixed" : "",
    ].filter(Boolean), "assets"),
    group(4, "Offering 条款、数量、价格与认购时间", [
      !off?.confirmed || !snap ? "Offering 尚未确认或缺少确认快照" : "",
      !off || !Number.isInteger(off.tokens) || off.tokens <= 0 || !Number.isFinite(off.price) || off.price <= 0 ? "发行数量或价格无效" : "",
      !off?.start || !off?.end || off.start >= off.end || Number.isNaN(Date.parse(off.start)) || Number.isNaN(Date.parse(off.end)) ? "认购时间窗口无效" : "",
      !snap || !off || JSON.stringify(snap.offeringTerms) !== JSON.stringify({ name: off.name, round: off.round, tokens: off.tokens, price: off.price, start: off.start, end: off.end, summary: off.summary, riskDisclosure: off.riskDisclosure, minimum: off.minimum }) ? "Offering 条款与固定版本不一致" : "",
    ].filter(Boolean), "assets"),
    group(5, "企业钱包、网络与收款配置", [
      !wallet || !wallet.status.includes("已验证") ? "收款钱包未验证" : "",
      wallet?.network !== "OP Mainnet" ? "钱包网络须与当前演示收款网络 OP Mainnet 一致" : "",
      !wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet.address) ? "钱包地址无效" : "",
      !snap || snap.walletId !== wallet?.id || snap.walletAddress !== wallet?.address ? "钱包与确认快照不一致" : "",
    ].filter(Boolean), "company"),
    group(6, "披露文件、风险说明与责任依据", [
      !fileReady(off?.disclosureFiles, "发行披露") ? "缺少可引用的发行披露文件" : "",
      !off?.summary?.trim() ? "发行摘要与风险说明缺失" : "",
      !instrument?.terms?.responsibleParty ? "权益条款未列明责任主体" : "",
      !fileReady(instrument?.files, "核心协议") ? "缺少可引用的核心协议签署依据" : "",
      !snap || JSON.stringify(snap.disclosureFiles) !== JSON.stringify(off?.disclosureFiles || []) ? "披露文件与确认快照不一致" : "",
      off?.disclosureSchemaVersion === 2 && JSON.stringify(snap?.returnDisclosure) !== JSON.stringify(off?.returnDisclosure) ? "回报披露与确认快照不一致" : "",
    ].filter(Boolean), "assets"),
    group(7, "Sandbox 执行与环境安全", [
      !snap ? "缺少可执行的固定确认快照" : "",
      (state.issuanceTasks || []).filter(task => task.offeringId === id).length > 1 ? "同一 Offering 存在多个发行任务，需人工核对" : "",
      (state.publications || []).filter(publication => publication.offeringId === id).length > 1 ? "同一 Offering 存在多个发布快照，需人工核对" : "",
      off?.publicationStatus === "Sandbox 已发布" ? "已发布 Offering 不可再次发起" : "",
    ].filter(Boolean), "assets"),
  ];
  return { offeringId: id, checkedAt, fingerprint: readinessFingerprint(state, id), groups };
}

export function submitSandboxIssuance(state: AppState, id: string, declarationAccepted: boolean, now: string): IssuanceResult {
  if (!declarationAccepted) return { state, changed: false, error: "请由当前企业账号阅读并确认发行责任声明" };
  if ((state.issuanceTasks || []).some(task => task.offeringId === id)) return { state, changed: false, error: "发行任务已存在，请查看或查询原任务" };
  if ((state.publications || []).some(item => item.offeringId === id)) return { state, changed: false, error: "已存在发布快照，不得重复发行" };
  const report = (state.readinessReports || []).find(item => item.offeringId === id);
  const fresh = checkIssuanceReadiness(state, id, now);
  if (!report || report.fingerprint !== fresh.fingerprint) return { state, changed: false, error: "发行准备结果已过期，请重新检查" };
  const failure = fresh.groups.find(item => !item.passed);
  if (failure) return { state, changed: false, error: `${failure.title}：${failure.reasons.join("；")}` };
  return {
    changed: true,
    state: {
      ...state,
      issuanceTasks: [...(state.issuanceTasks || []), {
        id: `ISS-${id}`, offeringId: id, environment: "Sandbox", status: "已提交", submittedAt: now,
        updatedAt: now, readinessFingerprint: report.fingerprint,
        attempts: 1,
        declaration: "当前企业账号已确认发行资料、风险披露及 Sandbox 模拟执行责任",
      }],
    },
  };
}

export function advanceSandboxIssuance(state: AppState, id: string, now: string): IssuanceResult {
  const task = (state.issuanceTasks || []).find(item => item.offeringId === id);
  if (!task || task.status !== "已提交") return { state, changed: false, error: "只有已提交任务可进入执行；Unknown 须查询原任务" };
  if (task.readinessFingerprint !== readinessFingerprint(state, id)) return { state, changed: false, error: "提交后关键资料或版本已变化；请核对原任务" };
  return { changed: true, state: {
    ...state,
    issuanceTasks: state.issuanceTasks.map(item => item.id === task.id ? { ...item, status: "执行中", updatedAt: now } : item),
    offerings: state.offerings.map(item => item.id === id ? { ...item, contractStatus: "部署处理中" } : item),
  } };
}

export function retryFailedSandboxIssuance(state: AppState, id: string, now: string): IssuanceResult {
  const task = state.issuanceTasks.find(item => item.offeringId === id);
  if (!task || task.status !== "失败") return { state, changed: false, error: "只有失败的原任务可以重试；Unknown 须先查询结果" };
  const report = state.readinessReports.find(item => item.offeringId === id);
  const fresh = checkIssuanceReadiness(state, id, now);
  if (!report || report.fingerprint !== fresh.fingerprint || fresh.groups.some(item => !item.passed))
    return { state, changed: false, error: "请先重新完成七组发行准备检查" };
  return { changed: true, state: {
    ...state,
    issuanceTasks: state.issuanceTasks.map(item => item.id === task.id ? { ...item, status: "已提交", updatedAt: now, reason: undefined, attempts: (item.attempts || 1) + 1, readinessFingerprint: fresh.fingerprint } : item),
    offerings: state.offerings.map(item => item.id === id ? { ...item, contractStatus: "未申请" } : item),
  } };
}

export function refreshSandboxSale(state: AppState, date: string): AppState {
  const day = dateOnly(date);
  return { ...state, sandboxClock: day, offerings: state.offerings.map(off => {
    if (off.publicationStatus !== "Sandbox 已发布") return off;
    const subscriptionStatus = day < off.start ? "未开放" : day > off.end ? "已结束" : "Sandbox 认购中";
    const status = subscriptionStatus === "未开放" ? "待开始" : subscriptionStatus === "已结束" ? "已结束" : "认购中";
    return { ...off, subscriptionStatus, status };
  }) };
}

export function resolveSandboxIssuance(state: AppState, id: string, result: "success" | "failed" | "unknown", now: string, failureReason = "Sandbox 模拟合约部署返回失败（测试注入）"): IssuanceResult {
  const task = (state.issuanceTasks || []).find(item => item.offeringId === id);
  if (!task || !["执行中", "Unknown"].includes(task.status)) return { state, changed: false, error: "请先执行原任务；已核验任务不可重复发布" };
  if (result === "success" && task.readinessFingerprint !== readinessFingerprint(state, id)) return { state, changed: false, error: "关键资料或版本已变化，原任务不得核验发布" };
  if (result === "success" && (!state.offerings.find(item => item.id === id)?.confirmationSnapshot || state.publications.some(item => item.offeringId === id)))
    return { state, changed: false, error: "固定确认快照缺失或发布快照已存在" };
  const status = result === "success" ? "已核验" : result === "failed" ? "失败" : "Unknown";
  const reference = `SANDBOX-CONTRACT-${id}`;
  const next: AppState = {
    ...state,
    issuanceTasks: state.issuanceTasks.map(item => item.id === task.id ? { ...item, status, updatedAt: now, reason: result === "failed" ? failureReason.trim() || "Sandbox 模拟执行失败（测试注入）" : result === "unknown" ? "Sandbox 模拟执行结果未返回；请查询原任务" : undefined, mockContractReference: result === "success" ? reference : item.mockContractReference } : item),
    offerings: state.offerings.map(item => item.id !== id ? item : result === "success" ? { ...item, publicationStatus: "Sandbox 已发布", contractStatus: "模拟已部署", tokenIssuanceStatus: "未发行" } : result === "failed" ? { ...item, contractStatus: "部署失败" } : item),
    publications: result === "success" ? [...state.publications, {
      id: `PUB-${id}`, offeringId: id, taskId: task.id, environment: "Sandbox",
      publishedAt: now, confirmedOffering: structuredClone(state.offerings.find(item => item.id === id)!.confirmationSnapshot!), mockContractReference: reference,
    }] : state.publications,
  };
  return { changed: true, state: result === "success" ? refreshSandboxSale(next, state.sandboxClock || now) : next };
}
