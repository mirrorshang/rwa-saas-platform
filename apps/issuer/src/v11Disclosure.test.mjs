import test from "node:test";
import assert from "node:assert/strict";
import { v11DisclosureIssues } from "./v11Disclosure.ts";
import { buildPublishedOfferingDisclosure, publicAssetFacts } from "./v11PublishedDisclosure.ts";
import { emptyState } from "./data.ts";
import { ensureProjects, confirmIssuerOffering } from "./issuerModule01.ts";

const file = (id, source, visibility = "公开") => ({ id, name: `${source}.pdf`, category: source, status: "可引用", version: 1, visibility });
const asset = { id: "AST", name: "住宅", category: "房地产", subtype: "住宅物业", version: 2, status: "Ready", location: "北京", details: { address: "公开地址", monthlyRentCny: 8000, owner: "内部权利人" }, publicFields: ["address"], files: [file("FA", "权属证明", "内部")] };
const instrument = { id: "INS", type: "收益参与权", status: "Ready", version: "v2", totalRights: 100, tokenCap: 100, termsSchemaVersion: 2, files: [file("FI", "核心协议")], terms: { responsibleParty: "发行企业", rightsDescription: "合法参与收益", startDate: "2026-12-01", maturityDate: "2027-12-01", tokenLegalMapping: "1 Token = 1 权益单位", revenueSource: "核实收入", distributableBasis: "净收益", participationRate: "50", frequency: "每月", expiryArrangement: "到期终止" }, spvMode: "不涉及" };
const offering = { id: "OFF", disclosureSchemaVersion: 2, price: 100, minimum: 100, tokens: 100, riskDisclosure: "经营波动风险", returnDisclosure: { kind: "未提供" }, disclosureFiles: [file("FO", "发行披露")] };

test("无预期回报可披露；未公开或未版本化文件阻断确认", () => {
  assert.deepEqual(v11DisclosureIssues(offering, instrument), []);
  assert.ok(v11DisclosureIssues({ ...offering, disclosureFiles: [file("FO", "发行披露", "内部")] }, instrument).some(x => x.includes("公开")));
  assert.ok(v11DisclosureIssues({ ...offering, disclosureFiles: [{ ...file("FO", "发行披露"), version: undefined }] }, instrument).some(x => x.includes("公开")));
});

test("预期回报数值、依据及改价失效均阻断确认", () => {
  const expected = { kind: "发行方预期年化收益率", minPercent: 8, priceAtCalculation: 100, calculatedAt: "2026-11-28", period: "12 个月", incomeBasis: "净收益", includesAppreciation: false, assumptions: "租约持续", feesAndTaxes: "扣税费", evidence: "估值文件 v1", risks: "空置风险" };
  assert.deepEqual(v11DisclosureIssues({ ...offering, returnDisclosure: expected }, instrument), []);
  assert.ok(v11DisclosureIssues({ ...offering, price: 120, returnDisclosure: expected }, instrument).some(x => x.includes("价格变化")));
  assert.ok(v11DisclosureIssues({ ...offering, returnDisclosure: { ...expected, maxPercent: 7 } }, instrument).some(x => x.includes("区间无效")));
  assert.ok(v11DisclosureIssues({ ...offering, returnDisclosure: { ...expected, evidence: "" } }, instrument).some(x => x.includes("依据缺失")));
});

test("公开 DTO 只含授权字段与文件，且冻结后不随原对象变化", () => {
  const publication = { id: "PUB", offeringId: "OFF", environment: "Sandbox", publishedAt: "2026-11-28T10:00:00Z", confirmedOffering: {
    confirmedAt: "2026-11-28T09:00:00Z", disclosureSchemaVersion: 2, asset: structuredClone(asset), instrument: structuredClone(instrument), issuer: { legalName: "发行企业", jurisdiction: "中国", slug: "test-issuer" }, disclosureFiles: [file("FO", "发行披露")],
    offeringTerms: { name: "住宅发行", round: "第 1 期", tokens: 100, price: 100, minimum: 100, start: "2026-12-01", end: "2027-01-01", summary: "风险自负", riskDisclosure: "空置风险" }, returnDisclosure: { kind: "未提供" },
  } };
  const dto = buildPublishedOfferingDisclosure(publication);
  assert.equal(dto.schemaVersion, "1.1.0");
  assert.equal(dto.asset.facts.length, 1);
  assert.equal(dto.asset.facts[0].value, "公开地址");
  assert.deepEqual(dto.documents.map(x => x.id), ["FI", "FO"]);
  assert.equal(dto.channels.mListingApproved, false);
  const json = JSON.stringify(dto);
  assert.ok(!json.includes("内部权利人"));
  assert.ok(!json.includes("monthlyRentCny"));
  const priorAddress = asset.details.address, priorPrice = offering.price;
  try {
    asset.details.address = "改后地址";
    offering.price = 999;
    assert.equal(buildPublishedOfferingDisclosure(publication).asset.facts[0].value, "公开地址");
    assert.equal(buildPublishedOfferingDisclosure(publication).offering.unitPriceU, 100);
  } finally { asset.details.address = priorAddress; offering.price = priorPrice; }
});

test("六类资产模板公开字段取白名单且未经授权不外泄", () => {
  for (const subtype of ["住宅物业", "写字楼", "商业商铺", "工业园/仓储物流物业", "非上市企业普通股权", "单笔企业借款债权"]) {
    assert.deepEqual(publicAssetFacts({ subtype, details: { secret: "不可见" }, publicFields: ["secret"] }), []);
  }
});

test("Offering 确认二次复核 V1.1 权益、公开文件和回报，并冻结快照", () => {
  const state = structuredClone(emptyState);
  state.company = { name: "Mock 发行企业", country: "中国" };
  state.portal.slug = "v11-demo";
  state.kybStatus = "已通过";
  state.plan = "Standard";
  state.assets = [{ ...asset, value: 10000 }];
  state.instruments = [{ ...instrument, assetId: "AST", name: "权益", totalRights: 100, tokenCap: 100, used: 0, termsSchemaVersion: 2, terms: { ...instrument.terms, startDate: "2026-12-01", maturityDate: "2027-12-01", frequency: "每月", expiryArrangement: "到期终止" } }];
  state.wallets = [{ id: "W", name: "Mock 钱包", address: "0x1111111111111111111111111111111111111111", network: "OP", status: "已验证", isDefault: true }];
  state.offerings = [{ ...offering, assetId: "AST", instrumentId: "INS", name: "住宅首期", round: "第 1 期", start: "2026-12-01", end: "2027-01-01", status: "草稿", walletId: "W", summary: "Mock 项目", assetVersion: 2, instrumentVersion: "v2", revision: 1 }];
  const prepared = ensureProjects(state);
  const blocked = confirmIssuerOffering({ ...prepared, offerings: prepared.offerings.map(o => ({ ...o, price: 120, returnDisclosure: { kind: "发行方预期年化收益率", minPercent: 8, priceAtCalculation: 100, calculatedAt: "2026-11-28", period: "12 个月", incomeBasis: "净收益", includesAppreciation: false, assumptions: "合同", feesAndTaxes: "税费", evidence: "文件", risks: "空置" } })) }, "OFF", 1, "2026-11-28T09:00:00Z");
  assert.equal(blocked.changed, false);
  assert.match(blocked.error, /价格变化/);
  const valid = confirmIssuerOffering(prepared, "OFF", 1, "2026-11-28T09:00:00Z");
  assert.equal(valid.changed, true, valid.error);
  const snapshot = valid.state.offerings[0].confirmationSnapshot;
  assert.equal(snapshot.disclosureSchemaVersion, 2);
  assert.equal(snapshot.issuer.slug, "v11-demo");
  assert.equal(snapshot.offeringTerms.price, 100);
  assert.equal(valid.state.instruments[0].used, 100);
  assert.equal(confirmIssuerOffering(valid.state, "OFF", 2, "2026-11-28T10:00:00Z").changed, false);
});
