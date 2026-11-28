import type { Asset, PublicationSnapshot, ReturnDisclosure } from "./data.ts";
import { authorizedPublicFile, v11DisclosureIssues } from "./v11Disclosure.ts";
import { v11InstrumentMissing } from "./v11Instrument.ts";
import { assetTemplates, type AssetTemplateName } from "./v11AssetTemplates.ts";

export const DISCLOSURE_SCHEMA = "1.1.0" as const;

export function publicAssetFacts(asset: Asset): { key: string; label: string; value: string }[] {
  const labels: Record<string, string> = assetTemplates[asset.subtype as AssetTemplateName]?.fields || {};
  const allowed = new Set(asset.publicFields || []);
  return Object.entries(labels).filter(([key]) => allowed.has(key) && asset.details?.[key] !== undefined && asset.details[key] !== "")
    .map(([key, label]) => ({ key, label, value: String(asset.details![key]) }));
}

export interface PublishedOfferingDisclosure {
  schemaVersion: typeof DISCLOSURE_SCHEMA;
  source: { publicationId: string; offeringId: string; assetId: string; assetVersion: number | null; instrumentId: string; instrumentVersion: string | null; confirmedAt: string; publishedAt: string };
  asset: { name: string; category: string; subtype: string; location: string | null; facts: ReturnType<typeof publicAssetFacts> };
  issuer: { legalName: string | null; jurisdiction: string | null; slug: string | null };
  right: { type: "股权" | "债权" | "收益参与权"; description: string | null; legalIssuer: string | null; tokenMapping: string | null; terms: { label: string; value: string }[] };
  spv: null | { legalName: string; jurisdiction: string; role: string; assetRelationship: string; issuerRelationship: string; registrationNumber?: string };
  return: { kind: "合同固定年利率" | ReturnDisclosure["kind"]; minPercent?: number; maxPercent?: number; methodology?: Omit<Extract<ReturnDisclosure, { kind: "发行方预期年化收益率" | "发行方预期年化回报率" }>, "kind" | "minPercent" | "maxPercent">; warning: string };
  offering: { name: string; round: string; unitPriceU: number; minimumU: number | null; totalUnits: number; totalIssueAmountU: number; subscriptionStart: string; subscriptionEnd: string; summary: string | null };
  risks: string[];
  documents: { id: string; name: string; category: string; version: number; visibility: "公开"; source: "Asset" | "Instrument" | "Offering" }[];
  channels: { v: true; mListingApproved: false };
  status: "Sandbox 已发布";
}

const termKeys: Record<string, [string, string][]> = {
  "股权": [["shareIssuer", "股份发行主体"], ["shareClass", "股份类别"], ["shareCount", "股份数量"], ["votingRights", "表决权"], ["dividendRights", "股息安排"], ["liquidationRights", "清算安排"], ["exitArrangement", "退出与锁定"], ["termArrangement", "权益期限"]],
  "债权": [["principal", "投资者名义本金"], ["debtor", "债务人"], ["interestMethod", "计息规则"], ["frequency", "付息周期"], ["repayment", "本金偿还"], ["maturityDate", "权益到期日"]],
  "收益参与权": [["revenueSource", "收益来源"], ["distributableBasis", "可分配收益口径"], ["participationRate", "参与比例"], ["frequency", "分配周期"], ["expiryArrangement", "退出安排"]],
};

export function buildPublishedOfferingDisclosure(publication: PublicationSnapshot): PublishedOfferingDisclosure {
  const snap = publication.confirmedOffering;
  if (publication.environment !== "Sandbox" || snap.disclosureSchemaVersion !== 2 || !snap.asset || !snap.instrument)
    throw new Error("仅能导出已发布且符合 V1.1 schema 的披露快照");
  const { asset, instrument, offeringTerms: off } = snap;
  if (v11InstrumentMissing(instrument, asset).length || v11DisclosureIssues({ disclosureSchemaVersion: 2, returnDisclosure: snap.returnDisclosure, riskDisclosure: off.riskDisclosure, price: off.price, disclosureFiles: snap.disclosureFiles }, instrument).length)
    throw new Error("固定披露快照未通过 V1.1 权益或文件复核");
  const documents: PublishedOfferingDisclosure["documents"] = [];
  for (const [source, files] of [["Asset", asset.files], ["Instrument", instrument.files], ["Offering", snap.disclosureFiles]] as const)
    for (const file of files || []) if (authorizedPublicFile(file)) documents.push({ id: file.id, name: file.name, category: file.category, version: file.version!, visibility: "公开", source });
  if (instrument.spvMode === "已有SPV" && instrument.spv)
    for (const file of [instrument.spv.registrationFile, instrument.spv.assetAuthorityFile, instrument.spv.rightsFile])
      if (authorizedPublicFile(file)) documents.push({ id: file.id, name: file.name, category: file.category, version: file.version!, visibility: "公开", source: "Instrument" });
  if (!documents.some(doc => doc.source === "Instrument") || !documents.some(doc => doc.source === "Offering"))
    throw new Error("披露快照缺少授权公开的权益及发行文件");
  const expected = snap.returnDisclosure;
  const reportedReturn: PublishedOfferingDisclosure["return"] = expected && expected.kind !== "未提供"
    ? { kind: expected.kind, minPercent: expected.minPercent, maxPercent: expected.maxPercent,
        methodology: { priceAtCalculation: expected.priceAtCalculation, calculatedAt: expected.calculatedAt, period: expected.period, incomeBasis: expected.incomeBasis, includesAppreciation: expected.includesAppreciation, assumptions: expected.assumptions, feesAndTaxes: expected.feesAndTaxes, evidence: expected.evidence, risks: expected.risks },
        warning: "发行方预期测算，非承诺收益；实际收益以合法应付事件为准" }
    : instrument.type === "债权" && Number(instrument.terms?.annualRate) > 0
      ? { kind: "合同固定年利率", minPercent: Number(instrument.terms?.annualRate), warning: "合同利率不构成保证兑付" }
      : { kind: "未提供", warning: "未提供预期年化回报" };
  return {
    schemaVersion: DISCLOSURE_SCHEMA,
    source: { publicationId: publication.id, offeringId: publication.offeringId, assetId: asset.id, assetVersion: asset.version || null, instrumentId: instrument.id, instrumentVersion: instrument.version || null, confirmedAt: snap.confirmedAt, publishedAt: publication.publishedAt },
    asset: { name: asset.name, category: asset.category, subtype: asset.subtype, location: asset.location || null, facts: publicAssetFacts(asset) },
    issuer: { legalName: snap.issuer?.legalName || null, jurisdiction: snap.issuer?.jurisdiction || null, slug: snap.issuer?.slug || null },
    right: { type: instrument.type, description: String(instrument.terms?.rightsDescription || "") || null, legalIssuer: String(instrument.terms?.shareIssuer || instrument.terms?.responsibleParty || "") || null, tokenMapping: String(instrument.terms?.tokenLegalMapping || "") || null, terms: (termKeys[instrument.type] || []).filter(([key]) => instrument.terms?.[key] !== undefined && instrument.terms[key] !== "").map(([key, label]) => ({ label, value: String(instrument.terms![key]) })) },
    spv: instrument.spvMode === "已有SPV" && instrument.spv ? { legalName: instrument.spv.legalName, jurisdiction: instrument.spv.jurisdiction, role: instrument.spv.role, assetRelationship: instrument.spv.assetRelationship, issuerRelationship: instrument.spv.issuerRelationship, ...(authorizedPublicFile(instrument.spv.registrationFile) ? { registrationNumber: instrument.spv.registrationNumber } : {}) } : null,
    return: reportedReturn,
    offering: { name: off.name, round: off.round, unitPriceU: off.price, minimumU: off.minimum || null, totalUnits: off.tokens, totalIssueAmountU: off.tokens * off.price, subscriptionStart: off.start, subscriptionEnd: off.end, summary: off.summary || null },
    risks: off.riskDisclosure ? [off.riskDisclosure] : [],
    documents,
    channels: { v: true, mListingApproved: false },
    status: "Sandbox 已发布",
  };
}
