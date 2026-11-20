import test from "node:test";
import assert from "node:assert/strict";
import { demoState, emptyState } from "./data.ts";
import {
  ISSUER_STORAGE_KEY,
  LEGACY_ISSUER_STORAGE_KEY,
  confirmIssuerOffering,
  ensureProjects,
  loadIssuerState,
  parseIssuerState,
  persistIssuerState,
  serializeIssuerState,
} from "./issuerModule01.ts";
import { actual365MonthlyInterest } from "./actual365.ts";

const sample = () => {
  const state = structuredClone(emptyState);
  state.kybStatus = "已通过";
  state.plan = "Standard";
  state.assets = [{ id: "AST-A", name: "住宅", code: "A", category: "房地产", subtype: "住宅物业", value: 250000, status: "Ready", updated: "today", version: 1, files: [{ id: "F-A", name: "a.pdf", category: "权属证明", status: "可引用" }] }];
  state.instruments = [{ id: "INS-A", assetId: "AST-A", name: "权益", type: "收益参与权", version: "v1", totalRights: 100, unit: "份", tokenCap: 100, used: 0, status: "Ready", updated: "today", terms: { responsibleParty: "企业" } }];
  state.wallets = [{ id: "W-A", name: "钱包", type: "Mock", address: "0x1111111111111111111111111111111111111111", network: "OP", status: "已验证", isDefault: true }];
  state.offerings = [{ id: "OFF-A", assetId: "AST-A", instrumentId: "INS-A", name: "首期", round: "第 1 期", tokens: 60, price: 100, minimum: 100, start: "2026-12-01", end: "2027-01-01", status: "草稿", walletId: "W-A", disclosureFiles: [{ id: "F-O", name: "o.pdf", category: "发行披露", status: "可引用" }] }];
  return ensureProjects(state);
};

test("损坏 JSON 保留原字节且不写入或删除", () => {
  const writes = [];
  const raw = "{broken";
  const result = loadIssuerState({ getItem: (key) => key === LEGACY_ISSUER_STORAGE_KEY ? raw : null, setItem: (...args) => writes.push(args), removeItem: (...args) => writes.push(args) }, emptyState);
  assert.equal(result.source, "blocked");
  assert.equal(result.issue.raw, raw);
  assert.deepEqual(writes, []);
});

test("关键集合缺失被隔离，不静默清空订单", () => {
  const legacy = sample();
  delete legacy.orders;
  const result = parseIssuerState(JSON.stringify(legacy), "v3", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /orders/);
});

test("旧 v3 迁移、重复装载均保留 ID、文件和唯一 Project", () => {
  const legacy = sample();
  delete legacy.projects;
  const raw = JSON.stringify(legacy);
  const result = parseIssuerState(raw, "v3", emptyState);
  assert.equal(result.source, "v3");
  assert.equal(result.state.offerings[0].id, "OFF-A");
  assert.equal(result.state.assets[0].files[0].id, "F-A");
  assert.equal(result.state.projects.length, 1);
  const current = parseIssuerState(serializeIssuerState(result.state), "v4", emptyState);
  assert.equal(current.source, "v4");
  assert.deepEqual(current.state.projects, result.state.projects);
  assert.equal(current.state.offerings.length, 1);
});

test("优先读取 v4，v4 损坏时不退回旧数据并覆写", () => {
  const result = loadIssuerState({ getItem: (key) => key === ISSUER_STORAGE_KEY ? "bad" : JSON.stringify(sample()) }, emptyState);
  assert.equal(result.source, "blocked");
  assert.equal(result.issue.source, "v4");
});

test("写入失败保留原有 v4 字节，调用方可阻断后续写入", () => {
  const previous = "{old data}";
  const storage = { current: previous, getItem() { return this.current; }, setItem() { throw new Error("quota"); } };
  const result = persistIssuerState(storage, sample(), previous);
  assert.match(result.error, /quota/);
  assert.equal(storage.current, previous);
});

test("多标签页写入版本冲突时不覆盖较新的记录", () => {
  const storage = { current: "newer", getItem() { return this.current; }, setItem(_key, value) { this.current = value; } };
  const result = persistIssuerState(storage, sample(), "stale");
  assert.match(result.error, /另一个页面已更新/);
  assert.equal(storage.current, "newer");
});

test("重复 ID 与断裂引用必须隔离", () => {
  const state = sample();
  state.offerings.push({ ...state.offerings[0] });
  const result = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /重复 ID/);
});

test("Offering 与 Project 的权益版本不一致时停止迁移", () => {
  const state = sample();
  state.offerings[0].instrumentVersion = "v2";
  const result = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /关联冲突/);
});

test("资产编号冲突被隔离，不生成替代编号覆盖旧记录", () => {
  const state = sample();
  state.assets.push({ ...state.assets[0], id: "AST-B" });
  const result = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /资产编号重复/);
});

test("上游资料重新检查后，内部 Project 状态随之更新", () => {
  const state = sample();
  state.assets[0].status = "Draft";
  const blocked = ensureProjects(state);
  assert.equal(blocked.projects[0].status, "Draft");
  blocked.assets[0].status = "Ready";
  assert.equal(ensureProjects(blocked).projects[0].status, "Ready");
});

test("损坏的集合成员被隔离而不会令页面初始化崩溃", () => {
  const state = sample();
  state.offerings.push(null);
  const result = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /损坏的对象/);
});

test("损坏的钱包状态被隔离，确认按钮不会因非字符串状态崩溃", () => {
  const state = sample();
  state.wallets[0].status = null;
  const result = parseIssuerState(serializeIssuerState(state), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /钱包字段损坏/);
});

test("正式应用现有四种演示场景仍可迁移且保留业务记录", () => {
  for (const mode of ["free", "standard", "operations", "exception"]) {
    const original = demoState(mode);
    const result = parseIssuerState(JSON.stringify(original), "v3", emptyState);
    assert.equal(result.source, "v3", `${mode}: ${result.issue?.reasons.join("，")}`);
    assert.equal(result.state.offerings.length, original.offerings.length);
    assert.equal(result.state.orders.length, original.orders.length);
  }
});

test("重复确认幂等，确认快照与容量保持一致", () => {
  const state = sample();
  const first = confirmIssuerOffering(state, "OFF-A", 1, "2026-11-19T00:00:00Z");
  assert.equal(first.changed, true);
  assert.equal(first.state.instruments[0].used, 60);
  assert.equal(first.state.offerings[0].confirmationSnapshot.reservedTokens, 60);
  assert.equal(first.state.offerings[0].confirmationSnapshot.instrument.version, "v1");
  assert.equal(first.state.offerings[0].confirmationSnapshot.offeringTerms.price, 100);
  const again = confirmIssuerOffering(first.state, "OFF-A", 1, "2026-11-19T00:00:01Z");
  assert.equal(again.changed, false);
  assert.equal(again.state.instruments[0].used, 60);
  assert.equal(state.instruments[0].used, 0);
});

test("已确认条款被静默改写时，重新载入会隔离冲突", () => {
  const confirmed = confirmIssuerOffering(sample(), "OFF-A", 1, "2026-11-19T00:00:00Z").state;
  confirmed.offerings[0].price = 200;
  const result = parseIssuerState(serializeIssuerState(confirmed), "v4", emptyState);
  assert.equal(result.source, "blocked");
  assert.match(result.issue.reasons.join(" "), /快照或发行条款冲突/);
});

test("不同 Offering 共享容量时拒绝超额且失败不留预留", () => {
  let state = sample();
  state.offerings.push({ ...state.offerings[0], id: "OFF-B", round: "第 2 期", tokens: 50 });
  state = confirmIssuerOffering(state, "OFF-A", 1, "2026-11-19T00:00:00Z").state;
  const second = confirmIssuerOffering(state, "OFF-B", 1, "2026-11-19T00:00:01Z");
  assert.match(second.error, /容量不足/);
  assert.equal(second.state.instruments[0].used, 60);
  assert.equal(second.state.offerings[1].confirmed, undefined);
});

test("Offering 版本冲突和上游版本冲突均不确认", () => {
  const state = sample();
  assert.match(confirmIssuerOffering(state, "OFF-A", 2, "now").error, /版本已变化/);
  state.assets[0].version = 2;
  assert.match(confirmIssuerOffering(state, "OFF-A", 1, "now").error, /版本已变化/);
  assert.equal(state.instruments[0].used, 0);
});

test("Actual/365 Fixed 按实际 31 天计算，年分母固定 365", () => {
  const result = actual365MonthlyInterest({ principal: 400000, annualRate: 12, period: "2026-12", startDate: "2026-12-01", maturityDate: "2028-12-01" });
  assert.equal(result.days, 31);
  assert.equal(result.amount, 4076.712329);
  const leap = actual365MonthlyInterest({ principal: 400000, annualRate: 12, period: "2028-02", startDate: "2028-01-01", maturityDate: "2028-12-01" });
  assert.equal(leap.days, 29);
  assert.equal(leap.amount, 3813.69863);
});

test("到期后的正常月息为零", () => {
  const result = actual365MonthlyInterest({ principal: 400000, annualRate: 12, period: "2029-01", startDate: "2026-12-01", maturityDate: "2028-12-01" });
  assert.equal(result.days, 0);
  assert.equal(result.amount, 0);
});
