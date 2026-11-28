import test from "node:test";
import assert from "node:assert/strict";
import { v11InstrumentMissing } from "./v11Instrument.ts";

const file = (category = "核心协议") => ({ id: "F1", name: "Mock.pdf", category, version: 1, status: "可引用" });
const asset = { id: "AST", status: "Ready" };
const base = (type, terms) => ({ id: "INS", type, assetId: "AST", status: "Draft", termsSchemaVersion: 2,
  totalRights: 100, tokenCap: 100, files: [file()], spvMode: "不涉及", terms: { responsibleParty: "发行人", rightsDescription: "权利", startDate: "2026-12-01", tokenLegalMapping: "1 Token = 1 单位", ...terms } });

test("新版普通股不以收益参与比例或到期日代替股权条款", () => {
  const instrument = base("股权", { shareIssuer: "企业", shareClass: "普通股", shareCount: "100", votingRights: "按文件", dividendRights: "按决议", liquidationRights: "按文件", exitArrangement: "受限转让", termArrangement: "无固定期限" });
  assert.deepEqual(v11InstrumentMissing(instrument, asset), []);
  assert.ok(v11InstrumentMissing({ ...instrument, terms: { ...instrument.terms, shareCount: "99" } }, asset).some(x => x.includes("股份数量")));
  assert.ok(v11InstrumentMissing({ ...instrument, terms: { ...instrument.terms, votingRights: "" } }, asset).includes("表决权"));
});

test("债权仍须有效投资者本金、利率、计息与精准映射", () => {
  const instrument = base("债权", { maturityDate: "2028-12-01", principal: "100", annualRate: "12", interestMethod: "Actual/365 Fixed", frequency: "每月付息", repayment: "到期一次还本金", debtor: "债务人" });
  assert.deepEqual(v11InstrumentMissing(instrument, asset), []);
  assert.ok(v11InstrumentMissing({ ...instrument, terms: { ...instrument.terms, principal: "99" } }, asset).some(x => x.includes("名义本金")));
});

test("已有 SPV 缺法律主体或证明时不能 Ready", () => {
  const instrument = base("收益参与权", { maturityDate: "2027-12-01", revenueSource: "租金", distributableBasis: "净额", participationRate: "50", frequency: "每月", expiryArrangement: "到期终止" });
  const spv = { id: "SPV", legalName: "测试主体", jurisdiction: "中国", registrationNumber: "0012", role: "收益责任主体", assetRelationship: "授权", issuerRelationship: "关联", registrationFile: file(), assetAuthorityFile: file(), rightsFile: file() };
  assert.deepEqual(v11InstrumentMissing({ ...instrument, spvMode: "已有SPV", spv }, asset), []);
  assert.ok(v11InstrumentMissing({ ...instrument, spvMode: "已有SPV", spv: { ...spv, registrationFile: { ...file(), status: "待扫描" } } }, asset).some(x => x.includes("SPV 注册")));
});

test("旧权益记录保留原校验语义且不推断新版股权字段", () => {
  const historical = base("收益参与权", { maturityDate: "2027-12-01", revenueSource: "租金", participationRate: "100", frequency: "每月", expiryArrangement: "到期终止" });
  delete historical.termsSchemaVersion;
  delete historical.spvMode;
  delete historical.terms.tokenLegalMapping;
  assert.deepEqual(v11InstrumentMissing(historical, asset), []);
});
