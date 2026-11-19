import type { AppState, BusinessFile, Distribution, RentReport } from "./data.ts";
import { nextNumericId } from "./issuerModule01.ts";
import type { MockResult } from "./issuerModule03.ts";

const noChange = (state: AppState, error?: string): MockResult => ({ state, changed: false, error });
const yesChange = (state: AppState): MockResult => ({ state, changed: true });
const round6 = (value: number) => Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;

export function createRentReport(state: AppState, input: {
  offeringId: string; period: string; recordDate: string; sourceAmountCny: number;
  exchangeRate: number; deductionsU: number; proofFile: BusinessFile; at: string;
}): MockResult {
  const offering = state.offerings.find(row => row.id === input.offeringId);
  const instrument = state.instruments.find(row => row.id === offering?.instrumentId);
  if (!offering || instrument?.type !== "收益参与权" || offering.publicationStatus !== "Sandbox 已发布") return noChange(state, "请选择已 Sandbox 发布的住宅收益 Offering");
  if (!/^\d{4}-\d{2}$/.test(input.period) || !/^\d{4}-\d{2}-\d{2}$/.test(input.recordDate) || input.recordDate.slice(0, 7) !== input.period)
    return noChange(state, "收益周期与 Record Date 不一致");
  if (state.rentReports.some(row => row.offeringId === input.offeringId && row.period === input.period)) return noChange(state, "本期租金已上报，不能重复创建");
  if (!Number.isFinite(input.sourceAmountCny) || input.sourceAmountCny <= 0 || !Number.isFinite(input.exchangeRate) || input.exchangeRate <= 0 || !Number.isFinite(input.deductionsU) || input.deductionsU < 0)
    return noChange(state, "租金、演示换算或扣除金额无效");
  const netU = round6(input.sourceAmountCny / input.exchangeRate - input.deductionsU);
  if (netU <= 0) return noChange(state, "本期可分配净额必须大于零");
  if (!input.proofFile?.name || input.proofFile.category !== "收益依据") return noChange(state, "缺少实际租金收入证明文件引用");
  const id = nextNumericId("RPT", state.rentReports, 3000);
  const report: RentReport = { id, offeringId: input.offeringId, period: input.period, recordDate: input.recordDate,
    sourceAmountCny: input.sourceAmountCny, exchangeRate: input.exchangeRate, deductionsU: input.deductionsU,
    netU, proofFile: structuredClone(input.proofFile), status: input.proofFile.status === "可引用" ? "待确认" : "资料待扫描",
    environment: "Sandbox", createdAt: input.at };
  return yesChange({ ...state, rentReports: [...state.rentReports, report] });
}

export function scanRentReportProof(state: AppState, reportId: string): MockResult {
  const report = state.rentReports.find(row => row.id === reportId);
  if (!report) return noChange(state, "租金上报不存在");
  if (report.proofFile.status === "可引用") return noChange(state);
  if (report.proofFile.status !== "待扫描") return noChange(state, "证明文件状态不可扫描");
  return yesChange({ ...state, rentReports: state.rentReports.map(row => row.id === reportId
    ? { ...row, proofFile: { ...row.proofFile, status: "可引用" }, status: "待确认" } : row) });
}

export function confirmRentReport(state: AppState, reportId: string, at: string): MockResult {
  const report = state.rentReports.find(row => row.id === reportId);
  if (!report) return noChange(state, "租金上报不存在");
  if (report.status === "已确认") return noChange(state);
  if (report.status !== "待确认" || report.proofFile.status !== "可引用") return noChange(state, "收益依据尚未可引用");
  return yesChange({ ...state, rentReports: state.rentReports.map(row => row.id === reportId
    ? { ...row, status: "已确认", confirmedAt: at } : row) });
}

export function splitBySnapshot(amount: number, lines: { holderId: string; investorId: string; rights: number }[]) {
  const totalMicro = Math.round(amount * 1_000_000);
  const totalRights = lines.reduce((sum, line) => sum + line.rights, 0);
  if (!Number.isSafeInteger(totalMicro) || totalMicro <= 0 || !Number.isFinite(totalRights) || totalRights <= 0 || lines.some(line => !Number.isFinite(line.rights) || line.rights <= 0))
    throw new Error("金额或快照权益无效");
  const shares = lines.map(line => Math.floor(totalMicro * line.rights / totalRights));
  const remainder = totalMicro - shares.reduce((sum, value) => sum + value, 0);
  const winner = lines.map((line, index) => ({ index, rights: line.rights, id: line.holderId }))
    .sort((a, b) => b.rights - a.rights || a.id.localeCompare(b.id))[0].index;
  shares[winner] += remainder;
  return lines.map((line, index) => ({ holderId: line.holderId, investorId: line.investorId,
    basis: line.rights, amount: shares[index] / 1_000_000, status: "待确认" }));
}

export function createRentBatch(state: AppState, reportId: string, at: string): MockResult {
  const report = state.rentReports.find(row => row.id === reportId);
  if (!report || report.status !== "已确认") return noChange(state, "请先确认实际租金上报");
  const offering = state.offerings.find(row => row.id === report.offeringId);
  const snapshot = state.holderSnapshots.find(row => row.offeringId === report.offeringId && row.recordDate === report.recordDate);
  if (!offering || !snapshot || snapshot.environment !== "Sandbox" || snapshot.instrumentVersion !== offering.instrumentVersion)
    return noChange(state, "缺少对应 Record Date 的固定持有人快照或权益版本不符");
  if (state.distributions.some(row => row.offeringId === report.offeringId && row.eventType === "租金收益" && row.period === report.period && row.status !== "已作废"))
    return noChange(state, "同一 Offering 和收益周期已有分配批次");
  let items: NonNullable<Distribution["items"]>;
  try { items = splitBySnapshot(report.netU, snapshot.lines); }
  catch (error) { return noChange(state, String(error)); }
  const id = nextNumericId("DST", state.distributions, 1000);
  const batch: Distribution = { id, offeringId: report.offeringId, period: report.period, recordDate: report.recordDate,
    gross: report.netU, status: "待复核", recipients: items.length, eventType: "租金收益", instrumentId: offering.instrumentId,
    reportId: report.id, holderSnapshotId: snapshot.id, calculationStatus: "已计算", paymentStatus: "未发起",
    sourceAmount: report.sourceAmountCny, sourceCurrency: "CNY", exchangeRate: report.exchangeRate,
    proofFile: structuredClone(report.proofFile), items };
  return yesChange({ ...state, distributions: [...state.distributions, batch] });
}

export function confirmRentBatch(state: AppState, batchId: string): MockResult {
  const batch = state.distributions.find(row => row.id === batchId);
  if (!batch || batch.eventType !== "租金收益" || !batch.reportId || !batch.holderSnapshotId) return noChange(state, "住宅租金批次不存在");
  if (batch.status === "已确认" || batch.status === "支付完成") return noChange(state);
  if (batch.status !== "待复核") return noChange(state, "批次状态不允许确认");
  const report = state.rentReports.find(row => row.id === batch.reportId);
  const snapshot = state.holderSnapshots.find(row => row.id === batch.holderSnapshotId);
  const offering = state.offerings.find(row => row.id === batch.offeringId);
  if (report?.status !== "已确认" || report.period !== batch.period || report.recordDate !== batch.recordDate
    || report.offeringId !== batch.offeringId || report.netU !== batch.gross
    || snapshot?.recordDate !== batch.recordDate || snapshot?.offeringId !== batch.offeringId
    || !offering || snapshot.instrumentVersion !== offering.instrumentVersion)
    return noChange(state, "收益上报或持有人快照引用失效");
  if (batch.items?.length !== snapshot.lines.length || batch.items.some(line => !snapshot.lines.some(holder =>
    holder.holderId === line.holderId && holder.investorId === line.investorId && holder.rights === line.basis)))
    return noChange(state, "分配明细与固定持有人快照不一致");
  if (round6(batch.items?.reduce((sum, line) => sum + line.amount, 0) || 0) !== batch.gross) return noChange(state, "分配明细与总额不一致");
  return yesChange({ ...state, distributions: state.distributions.map(row => row.id === batchId
    ? { ...row, status: "已确认", items: row.items?.map(line => ({ ...line, status: "待支付" })) } : row) });
}

export function payMockDistributionLine(state: AppState, batchId: string, holderId: string,
  intentId: string, outcome: "success" | "failed" | "unknown", at: string): MockResult {
  const batch = state.distributions.find(row => row.id === batchId);
  const line = batch?.items?.find(row => row.holderId === holderId);
  if (!batch || !line || !["已确认", "支付完成"].includes(batch.status)) return noChange(state, "批次尚未确认或收款明细不存在");
  if (line.status === "支付完成" || state.investorIncomes.some(row => row.batchId === batchId && row.holderId === holderId)) return noChange(state);
  if (!intentId.trim()) return noChange(state, "支付意图编号不能为空");
  const previous = state.distributionPayments.find(row => row.batchId === batchId && row.holderId === holderId && row.intentId === intentId);
  if (previous && previous.status !== "Unknown") return noChange(state);
  if (!previous && state.distributionPayments.some(row => row.batchId === batchId && row.holderId === holderId && row.status === "Unknown")) return noChange(state, "原支付结果 Unknown，必须查询原意图");
  if (previous && outcome === "unknown") return noChange(state);
  const paymentId = previous?.id || nextNumericId("DPA", state.distributionPayments, 3000);
  const status = outcome === "success" ? "已支付" : outcome === "failed" ? "失败" : "Unknown";
  const payment = { id: paymentId, batchId, holderId, intentId, amount: line.amount,
    status: status as "已支付" | "失败" | "Unknown", environment: "Sandbox" as const, at };
  const payments = previous ? state.distributionPayments.map(row => row.id === paymentId ? payment : row)
    : [...state.distributionPayments, payment];
  const updatedLines = batch.items!.map(row => row.holderId === holderId
    ? { ...row, status: outcome === "success" ? "支付完成" : status } : row);
  const paidCount = updatedLines.filter(row => row.status === "支付完成").length;
  const paymentStatus = paidCount === updatedLines.length ? "支付完成" : paidCount > 0 ? "部分成功"
    : updatedLines.some(row => row.status === "Unknown") ? "Unknown"
      : updatedLines.some(row => row.status === "失败") ? "失败" : "未发起";
  const incomes = outcome === "success" && batch.eventType !== "债权本金"
    ? [...state.investorIncomes, { id: nextNumericId("INC", state.investorIncomes, 3000), batchId,
      holderId, investorId: line.investorId, paymentId, amount: line.amount,
      status: "Sandbox 模拟到账" as const, at }] : state.investorIncomes;
  return yesChange({ ...state, distributionPayments: payments, investorIncomes: incomes,
    distributions: state.distributions.map(row => row.id === batchId
      ? { ...row, items: updatedLines, paymentStatus,
        status: paymentStatus === "支付完成" ? "支付完成" : "已确认",
        paidAt: paymentStatus === "支付完成" ? at : row.paidAt } : row) });
}
