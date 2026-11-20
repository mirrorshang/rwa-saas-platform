import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "./data.ts";
import { confirmIssuerOffering, ensureProjects, parseIssuerState, serializeIssuerState, validateIssuerState } from "./issuerModule01.ts";
import { advanceSandboxIssuance, checkIssuanceReadiness, refreshSandboxSale, resolveSandboxIssuance, submitSandboxIssuance } from "./issuerModule02.ts";
import { allocateMockOrder, approveMockInvestorKyc, createHolderSnapshot, createMockInvestor, createMockOrder, deliverMockTokens, recordMockPayment, registerMockHolder } from "./issuerModule03.ts";

function publishedFixture() {
  let state = structuredClone(emptyState);
  state.company = { name: "测试企业" };
  state.kybStatus = "已通过";
  state.plan = "Standard";
  state.planEnd = "2028-12-31";
  state.assets = [{ id: "AST-1", name: "朝阳住宅", code: "A-1", category: "房地产", subtype: "住宅物业", value: 250000, status: "Ready", updated: "today", version: 1, missing: [], files: ["权属证明", "估值依据", "租赁合同"].map((category, i) => ({ id: `FA-${i}`, name: `${i}.pdf`, category, status: "可引用" })) }];
  state.instruments = [{ id: "INS-1", assetId: "AST-1", name: "租金权益", type: "收益参与权", version: "v1", totalRights: 25000, unit: "Token", tokenCap: 25000, used: 0, status: "Ready", updated: "today", missing: [], terms: { responsibleParty: "测试企业" }, files: [{ id: "FI-1", name: "条款.pdf", category: "核心协议", status: "可引用" }] }];
  state.wallets = [{ id: "WAL-1", name: "模拟钱包", type: "Mock", address: "0x1111111111111111111111111111111111111111", network: "OP Mainnet", status: "已验证", isDefault: true }];
  state.offerings = [{ id: "OFF-3001", assetId: "AST-1", instrumentId: "INS-1", name: "住宅首期", round: "第 1 期", tokens: 25000, price: 10, minimum: 100, start: "2026-12-01", end: "2027-02-28", status: "草稿", walletId: "WAL-1", summary: "租金收益及风险说明", disclosureFiles: [{ id: "FO-1", name: "披露.pdf", category: "发行披露", status: "可引用" }], revision: 1 }];
  state = confirmIssuerOffering(ensureProjects(state), "OFF-3001", 1, "2026-11-19T00:00:00Z").state;
  state.readinessReports = [checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z")];
  state = submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:01:00Z").state;
  state = advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:02:00Z").state;
  state = resolveSandboxIssuance(state, "OFF-3001", "success", "2026-11-19T00:03:00Z").state;
  return refreshSandboxSale(state, "2026-12-15");
}

test("Sandbox 投资者、KYC 和订单逐步生成，报价和容量固定", () => {
  let state = publishedFixture();
  assert.equal(createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").changed, false);
  state = createMockInvestor(state, "OFF-3001", "甲", "自然人", "i1").state;
  assert.equal(createMockInvestor(state, "OFF-3001", "甲", "自然人", "i1").changed, false);
  assert.equal(createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").changed, false);
  state = approveMockInvestorKyc(state, "INV-3001").state;
  assert.equal(createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-11-30").changed, false);
  state = createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").state;
  assert.equal(state.orders[0].amount, 125000);
  assert.equal(state.orders[0].quotedPrice, 10);
  assert.equal(createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").changed, false);
  state = createMockInvestor(state, "OFF-3001", "乙", "自然人", "i2").state;
  state = approveMockInvestorKyc(state, "INV-3002").state;
  assert.match(createMockOrder(state, "OFF-3001", "INV-3002", 13000, "o2", "2026-12-15").error, /容量/);
  state.offerings[0].price = 11;
  assert.match(createMockOrder(state, "OFF-3001", "INV-3002", 100, "o2", "2026-12-15").error, /版本/);
});

test("Unknown 支付须查询原意图；付款、配售、登记、交付各有独立记录", () => {
  let state = publishedFixture();
  state = createMockInvestor(state, "OFF-3001", "甲", "自然人", "i1").state;
  state = approveMockInvestorKyc(state, "INV-3001").state;
  state = createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").state;
  assert.equal(allocateMockOrder(state, "ORD-3001", "2026-12-15").changed, false);
  state = recordMockPayment(state, "ORD-3001", "pay1", "unknown", "2026-12-15").state;
  assert.equal(recordMockPayment(state, "ORD-3001", "pay2", "success", "2026-12-15").changed, false);
  state = recordMockPayment(state, "ORD-3001", "pay1", "success", "2026-12-15").state;
  assert.equal(state.payments.length, 1);
  assert.equal(state.holders.length, 0);
  state = allocateMockOrder(state, "ORD-3001", "2026-12-15").state;
  assert.equal(state.allocations.length, 1);
  assert.equal(state.holders.length, 0);
  assert.equal(allocateMockOrder(state, "ORD-3001", "2026-12-15").changed, false);
  state = registerMockHolder(state, "ORD-3001", "2026-12-16T00:00:00Z").state;
  assert.equal(state.holders[0].environment, "Sandbox");
  assert.equal(state.holders[0].tokens, 0);
  assert.equal(registerMockHolder(state, "ORD-3001", "2026-12-16T00:00:00Z").changed, false);
  state = deliverMockTokens(state, "ORD-3001", "2026-12-16T01:00:00Z").state;
  assert.equal(state.tokens.length, 1);
  assert.equal(state.orders[0].status, "已完成");
  assert.equal(deliverMockTokens(state, "ORD-3001", "2026-12-16T01:00:00Z").changed, false);
  assert.deepEqual(validateIssuerState(state), []);
});

test("Record Date 固定快照且本地旧版本安全补齐新集合", () => {
  let state = publishedFixture();
  state = createMockInvestor(state, "OFF-3001", "甲", "自然人", "i1").state;
  state = approveMockInvestorKyc(state, "INV-3001").state;
  state = createMockOrder(state, "OFF-3001", "INV-3001", 12500, "o1", "2026-12-15").state;
  state = recordMockPayment(state, "ORD-3001", "pay1", "success", "2026-12-15").state;
  state = allocateMockOrder(state, "ORD-3001", "2026-12-15").state;
  state = registerMockHolder(state, "ORD-3001", "2026-12-16T00:00:00Z").state;
  assert.equal(createHolderSnapshot(state, "OFF-3001", "2026-12-15", "2026-12-17").changed, false);
  state = createHolderSnapshot(state, "OFF-3001", "2026-12-31", "2027-01-01").state;
  assert.equal(state.holderSnapshots[0].lines[0].rights, 12500);
  state.holders[0].rights = 1000;
  assert.equal(state.holderSnapshots[0].lines[0].rights, 12500);
  assert.equal(createHolderSnapshot(state, "OFF-3001", "2026-12-31", "2027-01-01").changed, false);
  const olderState = publishedFixture();
  delete olderState.allocations;
  delete olderState.holderSnapshots;
  const loaded = parseIssuerState(serializeIssuerState(olderState), "v4", emptyState);
  assert.equal(loaded.source, "v4");
  assert.deepEqual(loaded.state.allocations, []);
  assert.deepEqual(loaded.state.holderSnapshots, []);
});

test("失败支付可用新意图重试，Unknown 只能核对原意图", () => {
  let state = publishedFixture();
  state = createMockInvestor(state, "OFF-3001", "甲", "自然人", "i1").state;
  state = approveMockInvestorKyc(state, "INV-3001").state;
  state = createMockOrder(state, "OFF-3001", "INV-3001", 100, "o1", "2026-12-15").state;
  state = recordMockPayment(state, "ORD-3001", "attempt-1", "failed", "2026-12-15").state;
  assert.equal(state.payments.length, 1);
  state = recordMockPayment(state, "ORD-3001", "attempt-2", "success", "2026-12-15").state;
  assert.equal(state.payments.length, 2);
  assert.equal(state.orders[0].payment, "最终匹配");
  assert.equal(recordMockPayment(state, "ORD-3001", "attempt-3", "success", "2026-12-15").changed, false);
  assert.deepEqual(validateIssuerState(state), []);
});

test("损坏的配售和快照数据隔离并保留原始字节", () => {
  const state = publishedFixture();
  const raw = JSON.stringify({ ...state, schemaVersion: 4, allocations: [{ id: "ALL-1", offeringId: "OFF-3001", quantity: "bad" }] });
  const result = parseIssuerState(raw, "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.equal(result.issue.raw, raw);
  const badSnapshot = JSON.stringify({ ...state, schemaVersion: 4, holderSnapshots: [{ id: "HSP-1", offeringId: "OFF-3001", recordDate: "2026-12-31", instrumentVersion: "v1", environment: "Sandbox", lines: "bad" }] });
  assert.equal(parseIssuerState(badSnapshot, "v4", emptyState).source, "blocked");
});
