import type { AppState, DebtInterestEvent, DebtSchedule, Distribution } from "./data.ts";
import { ACTUAL_365_FIXED, actual365MonthlyInterest } from "./actual365.ts";
import { nextNumericId } from "./issuerModule01.ts";
import type { MockResult } from "./issuerModule03.ts";
import { splitBySnapshot } from "./issuerModule04.ts";

const noChange = (state: AppState, error?: string): MockResult => ({ state, changed: false, error });
const yesChange = (state: AppState): MockResult => ({ state, changed: true });
const dayBefore = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
const nextMonth = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  return `${year + (month === 12 ? 1 : 0)}-${String(month === 12 ? 1 : month + 1).padStart(2, "0")}`;
};

function fixedDebt(state: AppState, offeringId: string) {
  const offering = state.offerings.find(row => row.id === offeringId);
  const instrument = offering?.confirmationSnapshot?.instrument;
  if (!offering || !offering.confirmed || offering.publicationStatus !== "Sandbox 已发布"
    || !instrument || instrument.type !== "债权" || instrument.id !== offering.instrumentId
    || instrument.version !== offering.instrumentVersion) return undefined;
  const terms = instrument.terms;
  const principal = Number(terms?.principal);
  const annualRate = Number(terms?.annualRate);
  const startDate = String(terms?.startDate || "");
  const maturityDate = String(terms?.maturityDate || "");
  if (terms?.interestMethod !== ACTUAL_365_FIXED || terms?.frequency !== "每月付息"
    || !String(terms?.repayment || "").includes("到期一次还本")
    || !Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate <= 0
    || principal !== offering.tokens * offering.price || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
    || !/^\d{4}-\d{2}-\d{2}$/.test(maturityDate) || startDate >= maturityDate) return undefined;
  return { offering, instrument, principal, annualRate, startDate, maturityDate };
}

export function createDebtSchedule(state: AppState, offeringId: string, at: string): MockResult {
  const debt = fixedDebt(state, offeringId);
  if (!debt) return noChange(state, "债权须已 Sandbox 发布，且固定条款为每月付息、到期一次还本及 Actual/365 Fixed");
  if (state.debtSchedules.some(row => row.offeringId === offeringId)) return noChange(state, "本 Offering 已生成固定付息计划");
  const id = `DSC-${offeringId}`;
  const events: DebtInterestEvent[] = [];
  let period = debt.startDate.slice(0, 7);
  for (let guard = 0; period <= debt.maturityDate.slice(0, 7) && guard < 600; guard++, period = nextMonth(period)) {
    let interest;
    try { interest = actual365MonthlyInterest({ principal: debt.principal, annualRate: debt.annualRate,
      period, startDate: debt.startDate, maturityDate: debt.maturityDate }); }
    catch { return noChange(state, "债权计息日期无效；请核对已确认条款"); }
    if (interest.days <= 0) continue;
    events.push({ id: `DIE-${offeringId}-${period}`, scheduleId: id, offeringId, period,
      accrualFrom: interest.from, accrualTo: interest.to, recordDate: dayBefore(interest.to),
      dueDate: interest.to, days: interest.days, amount: interest.amount, environment: "Sandbox" });
  }
  if (!events.length || events.at(-1)?.accrualTo !== debt.maturityDate) return noChange(state, "付息计划未覆盖完整合同期限");
  const schedule: DebtSchedule = { id, offeringId, instrumentId: debt.instrument.id,
    instrumentVersion: debt.instrument.version, startDate: debt.startDate, maturityDate: debt.maturityDate,
    principal: debt.principal, annualRate: debt.annualRate, dayCountBasis: ACTUAL_365_FIXED,
    environment: "Sandbox", createdAt: at };
  return yesChange({ ...state, debtSchedules: [...state.debtSchedules, schedule],
    debtInterestEvents: [...state.debtInterestEvents, ...events] });
}

function fixedSnapshot(state: AppState, offeringId: string, recordDate: string, version: string) {
  const snapshot = state.holderSnapshots.find(row => row.offeringId === offeringId && row.recordDate === recordDate);
  return snapshot?.environment === "Sandbox" && snapshot.instrumentVersion === version && snapshot.lines.length > 0
    ? snapshot : undefined;
}

function completeSchedule(state: AppState, schedule: DebtSchedule) {
  const events = state.debtInterestEvents.filter(row => row.scheduleId === schedule.id)
    .sort((a, b) => a.accrualFrom.localeCompare(b.accrualFrom));
  if (!events.length || events[0].accrualFrom !== schedule.startDate
    || events.at(-1)?.accrualTo !== schedule.maturityDate) return false;
  return events.every((event, index) => event.offeringId === schedule.offeringId && event.days > 0
    && (index === 0 || event.accrualFrom === events[index - 1].accrualTo)
    && event.accrualFrom < event.accrualTo);
}

export function createDebtInterestBatch(state: AppState, eventId: string): MockResult {
  const event = state.debtInterestEvents.find(row => row.id === eventId);
  const schedule = state.debtSchedules.find(row => row.id === event?.scheduleId);
  const debt = event && fixedDebt(state, event.offeringId);
  if (!event || !schedule || !debt || schedule.offeringId !== event.offeringId
    || schedule.instrumentVersion !== debt.instrument.version) return noChange(state, "债权计划或固定条款引用失效");
  if (state.debtCompletions.some(row => row.offeringId === event.offeringId)) return noChange(state, "债权已模拟清偿完成，不再产生正常利息");
  if (state.sandboxClock < event.dueDate) return noChange(state, `本期应付日 ${event.dueDate} 尚未到达`);
  let expected;
  try { expected = actual365MonthlyInterest({ principal: schedule.principal, annualRate: schedule.annualRate,
    period: event.period, startDate: schedule.startDate, maturityDate: schedule.maturityDate }); }
  catch { return noChange(state, "债权计划日期无效"); }
  if (event.days <= 0 || event.accrualTo > schedule.maturityDate || event.amount <= 0
    || event.days !== expected.days || event.amount !== expected.amount
    || event.accrualFrom !== expected.from || event.accrualTo !== expected.to
    || event.recordDate !== dayBefore(event.dueDate) || event.dueDate !== expected.to)
    return noChange(state, "到期后或零天数不得生成正常利息");
  if (state.distributions.some(row => row.offeringId === event.offeringId && row.eventType === "债权利息"
    && row.period === event.period && row.status !== "已作废")) return noChange(state, "本期债权利息批次已存在");
  const snapshot = fixedSnapshot(state, event.offeringId, event.recordDate, schedule.instrumentVersion);
  if (!snapshot) return noChange(state, `请先固定 ${event.recordDate} 的持有人快照`);
  let items: NonNullable<Distribution["items"]>;
  try { items = splitBySnapshot(event.amount, snapshot.lines); }
  catch (error) { return noChange(state, String(error)); }
  const batch: Distribution = { id: nextNumericId("DST", state.distributions, 1000),
    offeringId: event.offeringId, period: event.period, recordDate: event.recordDate,
    gross: event.amount, status: "待复核", recipients: items.length, eventType: "债权利息",
    instrumentId: schedule.instrumentId, holderSnapshotId: snapshot.id, debtScheduleId: schedule.id,
    interestEventId: event.id, calculationStatus: "已计算", paymentStatus: "未发起",
    accrualFrom: event.accrualFrom, accrualTo: event.accrualTo, interestDays: event.days,
    dayCountBasis: ACTUAL_365_FIXED, sourceCurrency: "U", items };
  return yesChange({ ...state, distributions: [...state.distributions, batch] });
}

export function createDebtPrincipalBatch(state: AppState, offeringId: string): MockResult {
  const schedule = state.debtSchedules.find(row => row.offeringId === offeringId);
  const debt = fixedDebt(state, offeringId);
  if (!schedule || !debt || schedule.instrumentVersion !== debt.instrument.version) return noChange(state, "请先生成固定债权计划");
  if (state.debtCompletions.some(row => row.offeringId === offeringId)) return noChange(state, "债权已模拟清偿完成");
  if (state.sandboxClock < schedule.maturityDate) return noChange(state, `尚未到达本金到期日 ${schedule.maturityDate}`);
  if (state.distributions.some(row => row.offeringId === offeringId && row.eventType === "债权本金" && row.status !== "已作废"))
    return noChange(state, "本债权已有有效本金偿还批次");
  const snapshot = fixedSnapshot(state, offeringId, schedule.maturityDate, schedule.instrumentVersion);
  if (!snapshot) return noChange(state, `请先固定到期日 ${schedule.maturityDate} 的持有人快照`);
  let items: NonNullable<Distribution["items"]>;
  try { items = splitBySnapshot(schedule.principal, snapshot.lines); }
  catch (error) { return noChange(state, String(error)); }
  const batch: Distribution = { id: nextNumericId("DST", state.distributions, 1000), offeringId,
    period: schedule.maturityDate.slice(0, 7), recordDate: schedule.maturityDate,
    gross: schedule.principal, status: "待复核", recipients: items.length, eventType: "债权本金",
    instrumentId: schedule.instrumentId, holderSnapshotId: snapshot.id, debtScheduleId: schedule.id,
    calculationStatus: "已计算", paymentStatus: "未发起", sourceCurrency: "U", items };
  return yesChange({ ...state, distributions: [...state.distributions, batch] });
}

export function confirmDebtBatch(state: AppState, batchId: string): MockResult {
  const batch = state.distributions.find(row => row.id === batchId);
  if (!batch || !["债权利息", "债权本金"].includes(batch.eventType || "") || !batch.debtScheduleId
    || !batch.holderSnapshotId || batch.status !== "待复核") return noChange(state, "债权批次不存在或不可确认");
  const schedule = state.debtSchedules.find(row => row.id === batch.debtScheduleId);
  const snapshot = state.holderSnapshots.find(row => row.id === batch.holderSnapshotId);
  const event = batch.eventType === "债权利息" ? state.debtInterestEvents.find(row => row.id === batch.interestEventId) : undefined;
  if (!schedule || !snapshot || snapshot.offeringId !== batch.offeringId || snapshot.recordDate !== batch.recordDate
    || snapshot.instrumentVersion !== schedule.instrumentVersion || schedule.offeringId !== batch.offeringId
    || (event && (event.amount !== batch.gross || event.period !== batch.period || event.recordDate !== batch.recordDate))
    || (batch.eventType === "债权利息" && !event)
    || (batch.eventType === "债权本金" && batch.gross !== schedule.principal)
    || !batch.items?.length || batch.items.length !== snapshot.lines.length
    || batch.items.some(line => !snapshot.lines.some(holder => holder.holderId === line.holderId
      && holder.investorId === line.investorId && holder.rights === line.basis))
    || Math.round(batch.items.reduce((sum, line) => sum + line.amount, 0) * 1e6) !== Math.round(batch.gross * 1e6))
    return noChange(state, "债权计划、固定快照或分配明细不一致");
  return yesChange({ ...state, distributions: state.distributions.map(row => row.id === batchId
    ? { ...row, status: "已确认", items: row.items?.map(line => ({ ...line, status: "待支付" })) } : row) });
}

export function settleDebtRegistry(state: AppState, offeringId: string): MockResult {
  const schedule = state.debtSchedules.find(row => row.offeringId === offeringId);
  const principal = state.distributions.find(row => row.offeringId === offeringId && row.eventType === "债权本金" && row.debtScheduleId === schedule?.id);
  if (!schedule || !completeSchedule(state, schedule) || principal?.status !== "支付完成" || hasUnsettledDebtObligation(state, offeringId) || !state.debtInterestEvents.filter(row => row.scheduleId === schedule.id)
    .every(event => state.distributions.some(batch => batch.interestEventId === event.id && batch.status === "支付完成")))
    return noChange(state, "尚有未结清的利息或本金模拟付款");
  const holders = state.holders.filter(row => row.offeringId === offeringId && row.environment === "Sandbox");
  if (!holders.length || holders.some(row => row.registration !== "登记有效")) return noChange(state, "模拟名册未处于可结清状态");
  return yesChange({ ...state, holders: state.holders.map(row => row.offeringId === offeringId
    ? { ...row, rights: 0, registration: "模拟已清偿", reconciliation: "待 Token 处置" } : row) });
}

export function disposeDebtTokens(state: AppState, offeringId: string, at: string): MockResult {
  const holders = state.holders.filter(row => row.offeringId === offeringId && row.environment === "Sandbox");
  if (!holders.length || holders.some(row => row.registration !== "模拟已清偿" || row.tokens <= 0))
    return noChange(state, "请先结清本息并更新模拟持有人登记");
  let tokens = state.tokens;
  for (const holder of holders) {
    if (tokens.some(row => row.orderId === holder.orderId && row.operation === "到期模拟处置"))
      return noChange(state, "存在重复 Token 处置记录");
    tokens = [...tokens, { id: nextNumericId("TOK", tokens, 3000), offeringId, orderId: holder.orderId,
      operation: "到期模拟处置", amount: holder.tokens, status: "模拟完成", time: at,
      tx: `SANDBOX-DISPOSE-${holder.orderId}` }];
  }
  return yesChange({ ...state, tokens, holders: state.holders.map(row => row.offeringId === offeringId
    ? { ...row, tokens: 0, lock: "已结束", reconciliation: "一致" } : row) });
}

export function completeDebt(state: AppState, offeringId: string, at: string): MockResult {
  const schedule = state.debtSchedules.find(row => row.offeringId === offeringId);
  const principal = state.distributions.find(row => row.offeringId === offeringId && row.eventType === "债权本金" && row.debtScheduleId === schedule?.id);
  const holders = state.holders.filter(row => row.offeringId === offeringId && row.environment === "Sandbox");
  if (!schedule || !completeSchedule(state, schedule) || !principal || principal.status !== "支付完成" || state.debtCompletions.some(row => row.offeringId === offeringId))
    return noChange(state, "本金未清偿或已有完成记录");
  if (!state.debtInterestEvents.filter(row => row.scheduleId === schedule.id).every(event => state.distributions
    .some(batch => batch.interestEventId === event.id && batch.status === "支付完成")))
    return noChange(state, "仍有未支付的月度利息义务");
  if (!holders.length || holders.some(row => row.registration !== "模拟已清偿" || row.rights !== 0 || row.tokens !== 0
    || !state.tokens.some(token => token.orderId === row.orderId && token.operation === "到期模拟处置" && token.status === "模拟完成")))
    return noChange(state, "模拟持有人登记或 Token 后续处置未完成");
  if (hasUnsettledDebtObligation(state, offeringId))
    return noChange(state, "仍有未结分配批次");
  return yesChange({ ...state, debtCompletions: [...state.debtCompletions, {
    id: `DCO-${offeringId}`, offeringId, scheduleId: schedule.id, principalBatchId: principal.id,
    environment: "Sandbox", completedAt: at }] });
}

function hasUnsettledDebtObligation(state: AppState, offeringId: string): boolean {
  return state.distributions.some(row => row.offeringId === offeringId
    && (row.eventType === "债权利息" || row.eventType === "债权本金")
    && row.status !== "支付完成" && row.status !== "已作废");
}
