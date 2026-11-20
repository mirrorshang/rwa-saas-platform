import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "./data.ts";
import { createRentReport, scanRentReportProof, confirmRentReport, createRentBatch, confirmRentBatch, payMockDistributionLine, splitBySnapshot } from "./issuerModule04.ts";
import { parseIssuerState, serializeIssuerState } from "./issuerModule01.ts";

function fixture() {
  const state = structuredClone(emptyState);
  state.assets = [{ id: "AST-1", code: "AST-1", name: "朝阳住宅", category: "房地产", subtype: "住宅物业", value: 250000, status: "Ready", updated: "today", version: 1 }];
  state.instruments = [{ id: "INS-1", assetId: "AST-1", name: "租金权益", type: "收益参与权", version: "v1", totalRights: 25000, unit: "Token", tokenCap: 25000, used: 25000, status: "Ready", updated: "today" }];
  state.projects = [{ id: "PRJ-1", assetId: "AST-1", instrumentId: "INS-1", instrumentVersion: "v1", name: "住宅项目", status: "Ready" }];
  state.offerings = [{ id: "OFF-3001", assetId: "AST-1", instrumentId: "INS-1", projectId: "PRJ-1", instrumentVersion: "v1", assetVersion: 1, name: "住宅发行", round: "1", tokens: 25000, price: 10, start: "2026-12-01", end: "2027-02-28", status: "认购中", walletId: "WAL-1", confirmed: true, revision: 2, publicationStatus: "Sandbox 已发布", subscriptionStatus: "Sandbox 认购中", confirmationSnapshot: { reservedTokens: 25000, offeringTerms: { name: "住宅发行", round: "1", tokens: 25000, price: 10, start: "2026-12-01", end: "2027-02-28" }, asset: state.assets[0], instrument: state.instruments[0], project: state.projects[0], walletId: "WAL-1", walletAddress: "0x1", disclosureFiles: [], confirmedAt: "2026-11-19" } }];
  state.holderSnapshots = [{ id: "HSP-3001", offeringId: "OFF-3001", recordDate: "2026-12-31", instrumentVersion: "v1", environment: "Sandbox", createdAt: "2027-01-01", lines: [{ holderId: "HOL-1", investorId: "INV-1", orderId: "ORD-1", rights: 12500, tokens: 12500 }, { holderId: "HOL-2", investorId: "INV-2", orderId: "ORD-2", rights: 7500, tokens: 7500 }, { holderId: "HOL-3", investorId: "INV-3", orderId: "ORD-3", rights: 5000, tokens: 5000 }] }];
  return state;
}

function confirmedBatch() {
  let state = fixture();
  const input = { offeringId: "OFF-3001", period: "2026-12", recordDate: "2026-12-31", sourceAmountCny: 8000, exchangeRate: 8, deductionsU: 0, proofFile: { id: "F-1", name: "rent.pdf", category: "收益依据", status: "待扫描" }, at: "2027-01-01" };
  state = createRentReport(state, input).state;
  state = scanRentReportProof(state, "RPT-3001").state;
  state = confirmRentReport(state, "RPT-3001", "2027-01-01").state;
  state = createRentBatch(state, "RPT-3001", "2027-01-01").state;
  return confirmRentBatch(state, "DST-1001").state;
}

test("住宅租金按固定快照形成 1000 U 和 500/300/200 U", () => {
  let state = fixture();
  const input = { offeringId: "OFF-3001", period: "2026-12", recordDate: "2026-12-31", sourceAmountCny: 8000, exchangeRate: 8, deductionsU: 0, proofFile: { id: "F-1", name: "rent.pdf", category: "收益依据", status: "待扫描" }, at: "2027-01-01" };
  state = createRentReport(state, input).state;
  assert.equal(state.rentReports[0].netU, 1000);
  assert.equal(state.rentReports[0].status, "资料待扫描");
  assert.equal(confirmRentReport(state, "RPT-3001", "2027-01-01").changed, false);
  assert.equal(createRentBatch(state, "RPT-3001", "2027-01-01").changed, false);
  state = scanRentReportProof(state, "RPT-3001").state;
  state = confirmRentReport(state, "RPT-3001", "2027-01-01").state;
  state = createRentBatch(state, "RPT-3001", "2027-01-01").state;
  assert.deepEqual(state.distributions[0].items.map(line => line.amount), [500, 300, 200]);
  assert.equal(state.distributions[0].paymentStatus, "未发起");
  assert.equal(createRentBatch(state, "RPT-3001", "2027-01-01").changed, false);
  state = confirmRentBatch(state, "DST-1001").state;
  assert.equal(state.distributions[0].status, "已确认");
  assert.equal(confirmRentBatch(state, "DST-1001").changed, false);
});

test("六位小数与尾差之和严格等于净额", () => {
  const lines = [{ holderId: "B", investorId: "I1", rights: 1 }, { holderId: "A", investorId: "I2", rights: 1 }, { holderId: "C", investorId: "I3", rights: 1 }];
  const split = splitBySnapshot(1, lines);
  assert.deepEqual(split.map(row => row.amount), [0.333333, 0.333334, 0.333333]);
  assert.equal(Math.round(split.reduce((sum, row) => sum + row.amount, 0) * 1e6), 1e6);
});

test("租金批次确认前重新核对报告与固定名册", () => {
  let state = fixture();
  const input = { offeringId: "OFF-3001", period: "2026-12", recordDate: "2026-12-31", sourceAmountCny: 8000, exchangeRate: 8, deductionsU: 0, proofFile: { id: "F-1", name: "rent.pdf", category: "收益依据", status: "可引用" }, at: "2027-01-01" };
  state = createRentReport(state, input).state;
  state = confirmRentReport(state, "RPT-3001", "2027-01-01").state;
  state = createRentBatch(state, "RPT-3001", "2027-01-01").state;
  assert.equal(confirmRentBatch({ ...state, rentReports: state.rentReports.map(row => ({ ...row, netU: 999 })) }, "DST-1001").changed, false);
  assert.equal(confirmRentBatch({ ...state, distributions: state.distributions.map(batch => ({ ...batch, items: batch.items.map(line => line.holderId === "HOL-1" ? { ...line, basis: 1 } : line) })) }, "DST-1001").changed, false);
  assert.equal(confirmRentBatch(state, "DST-1001").changed, true);
});

test("逐笔模拟支付区分部分成功、Unknown、失败与最终到账且防重", () => {
  let state = confirmedBatch();
  state = payMockDistributionLine(state, "DST-1001", "HOL-1", "p1", "success", "2027-01-02").state;
  assert.equal(state.distributions[0].status, "已确认");
  assert.equal(state.distributions[0].paymentStatus, "部分成功");
  assert.equal(state.investorIncomes.length, 1);
  assert.equal(payMockDistributionLine(state, "DST-1001", "HOL-1", "p1", "success", "2027-01-02").changed, false);
  state = payMockDistributionLine(state, "DST-1001", "HOL-2", "p2", "unknown", "2027-01-02").state;
  assert.equal(payMockDistributionLine(state, "DST-1001", "HOL-2", "p3", "success", "2027-01-02").changed, false);
  state = payMockDistributionLine(state, "DST-1001", "HOL-2", "p2", "success", "2027-01-03").state;
  state = payMockDistributionLine(state, "DST-1001", "HOL-3", "p4", "failed", "2027-01-02").state;
  state = payMockDistributionLine(state, "DST-1001", "HOL-3", "p5", "success", "2027-01-03").state;
  assert.equal(state.distributions[0].status, "支付完成");
  assert.equal(state.distributions[0].paymentStatus, "支付完成");
  assert.deepEqual(state.investorIncomes.map(row => row.amount), [500, 300, 200]);
  assert.equal(state.distributionPayments.length, 4);
});

test("旧 v4 补齐租金与支付集合；损坏的新记录隔离", () => {
  const state = fixture();
  delete state.rentReports;
  delete state.distributionPayments;
  delete state.investorIncomes;
  const migrated = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(migrated.source, "v4");
  assert.deepEqual(migrated.state.rentReports, []);
  const raw = JSON.stringify({ ...fixture(), schemaVersion: 4, rentReports: [{ id: "RPT-1", offeringId: "OFF-3001", period: "2026-12", netU: "bad" }] });
  const corrupt = parseIssuerState(raw, "v4", emptyState);
  assert.equal(corrupt.source, "blocked");
  assert.equal(corrupt.issue.raw, raw);
});
