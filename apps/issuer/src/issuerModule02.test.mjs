import test from "node:test";
import assert from "node:assert/strict";
import { emptyState } from "./data.ts";
import { ensureProjects, confirmIssuerOffering, parseIssuerState, serializeIssuerState } from "./issuerModule01.ts";
import { checkIssuanceReadiness, submitSandboxIssuance, advanceSandboxIssuance, resolveSandboxIssuance, refreshSandboxSale, retryFailedSandboxIssuance, sandboxBusinessDate } from "./issuerModule02.ts";

function fixture() {
  const state = structuredClone(emptyState);
  state.company = { name: "测试企业" };
  state.kybStatus = "已通过";
  state.plan = "Standard";
  state.planEnd = "2027-11-13";
  state.assets = [{ id: "AST-1", name: "北京朝阳住宅", code: "A-1", category: "房地产", subtype: "住宅物业", value: 250000, status: "Ready", updated: "today", version: 1, missing: [], files: ["权属证明", "估值依据", "租赁合同"].map((category, i) => ({ id: `FA-${i}`, name: `${i}.pdf`, category, status: "可引用" })) }];
  state.instruments = [{ id: "INS-1", assetId: "AST-1", name: "租金权益", type: "收益参与权", version: "v1", totalRights: 25000, unit: "Token", tokenCap: 25000, used: 0, status: "Ready", updated: "today", missing: [], terms: { responsibleParty: "测试企业" }, files: [{ id: "FI-1", name: "条款.pdf", category: "核心协议", status: "可引用" }] }];
  state.wallets = [{ id: "WAL-1", name: "模拟钱包", type: "Mock", address: "0x1111111111111111111111111111111111111111", network: "OP Mainnet", status: "已验证", isDefault: true }];
  state.offerings = [{ id: "OFF-3001", assetId: "AST-1", instrumentId: "INS-1", name: "住宅首期", round: "第 1 期", tokens: 25000, price: 10, minimum: 100, start: "2026-12-01", end: "2027-02-28", status: "草稿", walletId: "WAL-1", summary: "租金收益及风险说明", disclosureFiles: [{ id: "FO-1", name: "披露.pdf", category: "发行披露", status: "可引用" }], revision: 1 }];
  const ready = ensureProjects(state);
  return confirmIssuerOffering(ready, "OFF-3001", 1, "2026-11-19T00:00:00Z").state;
}

test("七组真实条件通过且每组给出返回入口", () => {
  const result = checkIssuanceReadiness(fixture(), "OFF-3001", "2026-11-19T00:00:00Z");
  assert.equal(result.groups.length, 7);
  assert.equal(result.groups.every(group => group.passed && group.route), true);
});

test("KYB、版本、文件、钱包和环境异常分别阻断", () => {
  const state = fixture();
  state.kybStatus = "草稿";
  state.assets[0].version = 2;
  state.offerings[0].disclosureFiles[0].status = "失败";
  state.wallets[0].status = "待验证";
  const report = checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z");
  assert.equal(report.groups[0].passed, false);
  assert.equal(report.groups[1].passed, false);
  assert.equal(report.groups[4].passed, false);
  assert.equal(report.groups[5].passed, false);
  assert.equal(submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:00:00Z").changed, false);
});

test("过期 Standard 和缺失核心协议阻断发行准备", () => {
  const state = fixture();
  state.planEnd = "2026-10-31";
  state.instruments[0].files[0].status = "失败";
  const report = checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z");
  assert.equal(report.groups[0].passed, false);
  assert.match(report.groups[0].reasons.join(" "), /已到期/);
  assert.equal(report.groups[5].passed, false);
  assert.match(report.groups[5].reasons.join(" "), /核心协议/);
});

test("认购日期按 UTC+8，而非 UTC 自然日", () => {
  assert.equal(sandboxBusinessDate("2026-11-30T17:00:00Z"), "2026-12-01");
});

test("声明、唯一任务、唯一发布快照和认购时间窗口", () => {
  let state = fixture();
  assert.equal(submitSandboxIssuance(state, "OFF-3001", false, "2026-11-19T00:00:00Z").changed, false);
  state.readinessReports = [checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z")];
  let result = submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:01:00Z");
  assert.equal(result.changed, true);
  state = result.state;
  assert.equal(state.issuanceTasks[0].status, "已提交");
  assert.equal(submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:02:00Z").changed, false);
  state = advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:03:00Z").state;
  assert.equal(state.issuanceTasks[0].status, "执行中");
  state = resolveSandboxIssuance(state, "OFF-3001", "success", "2026-11-19T00:04:00Z").state;
  assert.equal(state.issuanceTasks[0].status, "已核验");
  assert.equal(state.publications.length, 1);
  assert.equal(state.offerings[0].publicationStatus, "Sandbox 已发布");
  assert.equal(state.offerings[0].contractStatus, "模拟已部署");
  assert.equal(state.offerings[0].tokenIssuanceStatus, "未发行");
  assert.equal(state.offerings[0].subscriptionStatus, "未开放");
  state = refreshSandboxSale(state, "2026-12-15");
  assert.equal(state.offerings[0].subscriptionStatus, "Sandbox 认购中");
  state = refreshSandboxSale(state, "2027-03-01");
  assert.equal(state.offerings[0].subscriptionStatus, "已结束");
  assert.equal(resolveSandboxIssuance(state, "OFF-3001", "success", "2027-03-01").state.publications.length, 1);
});

test("Unknown 查询原任务，失败不发布且不得创建第二任务", () => {
  let state = fixture();
  state.readinessReports = [checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z")];
  state = submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:01:00Z").state;
  state = advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:02:00Z").state;
  state = resolveSandboxIssuance(state, "OFF-3001", "unknown", "2026-11-19T00:03:00Z").state;
  assert.equal(state.issuanceTasks[0].status, "Unknown");
  assert.equal(state.publications.length, 0);
  assert.equal(advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:04:00Z").changed, false);
  assert.equal(submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:05:00Z").changed, false);
  state = resolveSandboxIssuance(state, "OFF-3001", "failed", "2026-11-19T00:06:00Z").state;
  assert.equal(state.issuanceTasks[0].status, "失败");
  assert.match(state.issuanceTasks[0].reason, /测试注入/);
  assert.equal(state.publications.length, 0);
  state.readinessReports = [checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:07:00Z")];
  state = retryFailedSandboxIssuance(state, "OFF-3001", "2026-11-19T00:08:00Z").state;
  assert.equal(state.issuanceTasks.length, 1);
  assert.equal(state.issuanceTasks[0].status, "已提交");
  assert.equal(state.issuanceTasks[0].attempts, 2);
});

test("提交后关键资料变化时原任务不得执行或核验发布", () => {
  let state = fixture();
  state.readinessReports = [checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z")];
  state = submitSandboxIssuance(state, "OFF-3001", true, "2026-11-19T00:01:00Z").state;
  state.assets[0].version = 2;
  assert.equal(advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:02:00Z").changed, false);
  state.assets[0].version = 1;
  state = advanceSandboxIssuance(state, "OFF-3001", "2026-11-19T00:03:00Z").state;
  state.wallets[0].address = "0x2222222222222222222222222222222222222222";
  assert.equal(resolveSandboxIssuance(state, "OFF-3001", "success", "2026-11-19T00:04:00Z").changed, false);
  assert.equal(state.publications.length, 0);
});

test("即使版本号未变，已确认的资产和权益条款内容变化也需阻断", () => {
  const state = fixture();
  state.assets[0].value = 260000;
  state.instruments[0].terms.responsibleParty = "其他主体";
  const report = checkIssuanceReadiness(state, "OFF-3001", "2026-11-19T00:00:00Z");
  assert.match(report.groups[1].reasons.join(" "), /固定快照/);
  assert.match(report.groups[2].reasons.join(" "), /固定快照/);
});

test("旧 v4 记录补充模块 02 集合但不删除原数据", () => {
  const legacy = fixture();
  delete legacy.readinessReports;
  delete legacy.issuanceTasks;
  delete legacy.publications;
  delete legacy.sandboxClock;
  const loaded = parseIssuerState(JSON.stringify({ ...legacy, schemaVersion: 4 }), "v4", emptyState);
  assert.equal(loaded.source, "v4");
  assert.equal(loaded.state.offerings[0].id, "OFF-3001");
  assert.deepEqual(loaded.state.issuanceTasks, []);
  assert.equal(parseIssuerState(serializeIssuerState(loaded.state), "v4", emptyState).source, "v4");
});

test("损坏或重复的执行记录隔离并保留原始字节", () => {
  const state = fixture();
  state.issuanceTasks = [{ id: "ISS-1", offeringId: "OFF-3001", environment: "Sandbox", status: "已提交", submittedAt: "a", updatedAt: "a", readinessFingerprint: "x", declaration: "test" }];
  state.issuanceTasks.push({ ...state.issuanceTasks[0], id: "ISS-2" });
  const raw = serializeIssuerState(state);
  const duplicate = parseIssuerState(raw, "v4", emptyState);
  assert.equal(duplicate.source, "blocked");
  assert.equal(duplicate.issue.raw, raw);
  const corrupted = parseIssuerState(JSON.stringify({ ...fixture(), schemaVersion: 4, publications: [{ bad: 1 }] }), "v4", emptyState);
  assert.equal(corrupted.source, "blocked");
  const badReport = parseIssuerState(JSON.stringify({ ...fixture(), schemaVersion: 4, readinessReports: [{ offeringId: "OFF-3001", groups: "bad", fingerprint: "x" }] }), "v4", emptyState);
  assert.equal(badReport.source, "blocked");
});
