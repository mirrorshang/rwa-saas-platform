import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "./data.ts";
import { createHolderSnapshot } from "./issuerModule03.ts";
import { payMockDistributionLine } from "./issuerModule04.ts";
import { completeDebt, confirmDebtBatch, createDebtInterestBatch, createDebtPrincipalBatch, createDebtSchedule, disposeDebtTokens, settleDebtRegistry } from "./issuerModule05.ts";
import { parseIssuerState, serializeIssuerState, validateIssuerState } from "./issuerModule01.ts";

function fixture() {
  const state = structuredClone(emptyState);
  state.sandboxClock = "2026-12-15";
  const asset = { id: "AST-2", code: "AST-2", name: "企业借款债权", category: "债权与应收款", subtype: "单笔企业借款", value: 400000, status: "Ready", updated: "today", version: 1 };
  const instrument = { id: "INS-2", assetId: asset.id, name: "投资者债权", type: "债权", version: "v1", totalRights: 400000, unit: "U", tokenCap: 4000, used: 4000, status: "Ready", updated: "today", terms: { principal: 400000, annualRate: 12, interestMethod: "Actual/365 Fixed", frequency: "每月付息", repayment: "到期一次还本金", startDate: "2026-12-01", maturityDate: "2028-12-01" } };
  const project = { id: "PRJ-2", assetId: asset.id, instrumentId: instrument.id, instrumentVersion: "v1", name: "债权项目", status: "Ready" };
  state.assets = [asset]; state.instruments = [instrument]; state.projects = [project];
  state.offerings = [{ id: "OFF-3002", assetId: asset.id, instrumentId: instrument.id, projectId: project.id, instrumentVersion: "v1", assetVersion: 1, name: "企业债权首期", round: "1", tokens: 4000, price: 100, start: "2026-12-01", end: "2027-02-28", status: "认购中", walletId: "WAL-1", confirmed: true, revision: 2, publicationStatus: "Sandbox 已发布", subscriptionStatus: "Sandbox 认购中", confirmationSnapshot: { reservedTokens: 4000, offeringTerms: { name: "企业债权首期", round: "1", tokens: 4000, price: 100, start: "2026-12-01", end: "2027-02-28" }, asset, instrument, project, walletId: "WAL-1", walletAddress: "0x1", disclosureFiles: [], confirmedAt: "2026-11-19" } }];
  state.holders = [{ id: "HOL-4", investorId: "INV-4", orderId: "ORD-4", offeringId: "OFF-3002", rights: 250000, tokens: 2500, registration: "登记有效", lock: "锁定中", lockUntil: "", reconciliation: "一致", environment: "Sandbox", effectiveAt: "2026-12-15T12:00:00+08:00" }, { id: "HOL-5", investorId: "INV-5", orderId: "ORD-5", offeringId: "OFF-3002", rights: 150000, tokens: 1500, registration: "登记有效", lock: "锁定中", lockUntil: "", reconciliation: "一致", environment: "Sandbox", effectiveAt: "2026-12-15T12:00:00+08:00" }];
  return state;
}

function payBatch(state, batchId) {
  state = confirmDebtBatch(state, batchId).state;
  for (const line of state.distributions.find(row => row.id === batchId).items)
    state = payMockDistributionLine(state, batchId, line.holderId, `${batchId}:${line.holderId}:1`, "success", "2028-12-01").state;
  return state;
}

test("Actual/365 Fixed 固定 24 期；首期 31 天、到期后不再计息", () => {
  let state = fixture();
  state = createDebtSchedule(state, "OFF-3002", "2026-11-19").state;
  assert.equal(state.debtSchedules.length, 1);
  assert.equal(state.debtInterestEvents.length, 24);
  assert.deepEqual(state.debtInterestEvents[0], { id: "DIE-OFF-3002-2026-12", scheduleId: "DSC-OFF-3002", offeringId: "OFF-3002", period: "2026-12", accrualFrom: "2026-12-01", accrualTo: "2027-01-01", recordDate: "2026-12-31", dueDate: "2027-01-01", days: 31, amount: 4076.712329, environment: "Sandbox" });
  assert.equal(state.debtInterestEvents.at(-1).accrualTo, "2028-12-01");
  assert.equal(createDebtSchedule(state, "OFF-3002", "2026-11-19").changed, false);
  assert.equal(createDebtInterestBatch(state, state.debtInterestEvents[0].id).changed, false);
  state.sandboxClock = "2027-01-01";
  assert.equal(createDebtInterestBatch(state, state.debtInterestEvents[0].id).changed, false);
  state = createHolderSnapshot(state, "OFF-3002", "2026-12-31", "2027-01-01").state;
  state = createDebtInterestBatch(state, state.debtInterestEvents[0].id).state;
  assert.deepEqual(state.distributions[0].items.map(row => row.amount), [2547.945206, 1528.767123]);
  assert.equal(createDebtInterestBatch(state, state.debtInterestEvents[0].id).changed, false);
  assert.equal(confirmDebtBatch(state, state.distributions[0].id).changed, true);
});

test("所有月息和本金独立支付；本金不计收益，名册与 Token 处置后才能完成", () => {
  let state = createDebtSchedule(fixture(), "OFF-3002", "2026-11-19").state;
  state.sandboxClock = "2028-12-01";
  assert.equal(createDebtPrincipalBatch(state, "OFF-3002").changed, false);
  for (const event of state.debtInterestEvents) {
    state = createHolderSnapshot(state, "OFF-3002", event.recordDate, "2028-12-01").state;
    state = createDebtInterestBatch(state, event.id).state;
    state = payBatch(state, state.distributions.at(-1).id);
  }
  assert.equal(state.debtInterestEvents.length, state.distributions.length);
  assert.equal(settleDebtRegistry(state, "OFF-3002").changed, false);
  state = createHolderSnapshot(state, "OFF-3002", "2028-12-01", "2028-12-01").state;
  state = createDebtPrincipalBatch(state, "OFF-3002").state;
  const principal = state.distributions.at(-1);
  assert.equal(principal.eventType, "债权本金");
  assert.deepEqual(principal.items.map(row => row.amount), [250000, 150000]);
  assert.equal(createDebtPrincipalBatch(state, "OFF-3002").changed, false);
  assert.equal(completeDebt(state, "OFF-3002", "2028-12-01").changed, false);
  const incomesBefore = state.investorIncomes.length;
  state = confirmDebtBatch(state, principal.id).state;
  state = payMockDistributionLine(state, principal.id, "HOL-4", "principal:HOL-4:1", "success", "2028-12-01").state;
  assert.equal(state.distributions.at(-1).paymentStatus, "部分成功");
  assert.equal(state.investorIncomes.length, incomesBefore);
  assert.equal(settleDebtRegistry(state, "OFF-3002").changed, false);
  state = payMockDistributionLine(state, principal.id, "HOL-5", "principal:HOL-5:1", "success", "2028-12-01").state;
  assert.equal(state.investorIncomes.length, incomesBefore);
  assert.equal(state.distributionPayments.filter(row => row.batchId === principal.id).length, 2);
  assert.equal(completeDebt(state, "OFF-3002", "2028-12-01").changed, false);
  const legacyUnpaid = { ...state.distributions[0], id: "DST-LEGACY-UNPAID", period: "legacy", debtScheduleId: undefined, interestEventId: undefined, status: "已确认" };
  assert.equal(settleDebtRegistry({ ...state, distributions: [...state.distributions, legacyUnpaid] }, "OFF-3002").changed, false);
  state = settleDebtRegistry(state, "OFF-3002").state;
  assert.deepEqual(state.holders.map(row => row.rights), [0, 0]);
  assert.match(createHolderSnapshot(state, "OFF-3002", "2026-11-30", "2028-12-01").error, /不能事后补建历史 Record Date/);
  assert.equal(completeDebt(state, "OFF-3002", "2028-12-01").changed, false);
  state = disposeDebtTokens(state, "OFF-3002", "2028-12-01").state;
  assert.equal(state.tokens.filter(row => row.operation === "到期模拟处置").length, 2);
  assert.deepEqual(state.holders.map(row => row.lock), ["已结束", "已结束"]);
  assert.equal(completeDebt({ ...state, distributions: [...state.distributions, legacyUnpaid] }, "OFF-3002", "2028-12-01").changed, false);
  state = completeDebt(state, "OFF-3002", "2028-12-01").state;
  assert.equal(state.debtCompletions.length, 1);
  assert.equal(completeDebt(state, "OFF-3002", "2028-12-01").changed, false);
  assert.equal(createDebtInterestBatch(state, "DIE-OFF-3002-2028-12").changed, false);
});

test("未付款、Unknown、引用篡改不能推进债权批次和清偿", () => {
  let state = createDebtSchedule(fixture(), "OFF-3002", "2026-11-19").state;
  state.sandboxClock = "2028-12-01";
  state = createHolderSnapshot(state, "OFF-3002", "2026-12-31", "2028-12-01").state;
  state = createDebtInterestBatch(state, state.debtInterestEvents[0].id).state;
  const batch = state.distributions[0];
  assert.equal(confirmDebtBatch({ ...state, distributions: [{ ...batch, gross: 4000 }] }, batch.id).changed, false);
  const badEvent = { ...state, debtInterestEvents: state.debtInterestEvents.map(row => row.id === batch.interestEventId ? { ...row, amount: 4000 } : row) };
  assert.equal(createDebtInterestBatch({ ...badEvent, distributions: [] }, batch.interestEventId).changed, false);
  state = confirmDebtBatch(state, batch.id).state;
  state = payMockDistributionLine(state, batch.id, "HOL-4", "i-1", "unknown", "2028-12-01").state;
  assert.equal(payMockDistributionLine(state, batch.id, "HOL-4", "i-2", "success", "2028-12-01").changed, false);
  assert.equal(settleDebtRegistry(state, "OFF-3002").changed, false);
});


test("部分认购的债权不得按完整合同本金生成利息或本金批次", () => {
  let state = fixture();
  state.holders = [state.holders[0]];
  state = createDebtSchedule(state, "OFF-3002", "2026-11-19").state;

  state.sandboxClock = "2027-01-01";
  state = createHolderSnapshot(state, "OFF-3002", "2026-12-31", "2027-01-01").state;
  const interest = createDebtInterestBatch(state, state.debtInterestEvents[0].id);
  assert.equal(interest.changed, false);
  assert.match(interest.error, /未完成全额认购/);
  assert.equal(interest.state.distributions.length, 0);

  state.sandboxClock = "2028-12-01";
  state = createHolderSnapshot(state, "OFF-3002", "2028-12-01", "2028-12-01").state;
  const principal = createDebtPrincipalBatch(state, "OFF-3002");
  assert.equal(principal.changed, false);
  assert.match(principal.error, /未完成全额认购/);
  assert.equal(principal.state.distributions.length, 0);
});

test("旧状态安全补齐债权集合，损坏计划保留原始字节", () => {
  const old = fixture();
  old.holders = [];
  delete old.debtSchedules; delete old.debtInterestEvents; delete old.debtCompletions;
  const parsed = parseIssuerState(serializeIssuerState(old), "v4", emptyState);
  assert.equal(parsed.source, "v4");
  assert.deepEqual(parsed.state.debtSchedules, []);
  const raw = JSON.stringify({ ...fixture(), schemaVersion: 4, debtSchedules: [{ id: "DSC-1", offeringId: "OFF-3002", principal: "bad" }] });
  const bad = parseIssuerState(raw, "v4", emptyState);
  assert.equal(bad.source, "blocked");
  assert.equal(bad.issue.raw, raw);
});

test("债权重复事件、批次和清偿引用在装载前隔离", () => {
  let state = createDebtSchedule(fixture(), "OFF-3002", "2026-11-19").state;
  state.debtInterestEvents.push({ ...state.debtInterestEvents[0], id: "DIE-DUP" });
  assert.ok(validateIssuerState(state).some(reason => reason.includes("重复债权应付利息事件")));
  const raw = serializeIssuerState(state);
  assert.equal(parseIssuerState(raw, "v4", emptyState).source, "blocked");
});
