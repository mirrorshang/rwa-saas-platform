import type { Offering, Instrument, BusinessFile } from "./data.ts";

export const authorizedPublicFile = (file: BusinessFile) =>
  file.status === "可引用" && file.visibility === "公开" && Number.isSafeInteger(file.version) && (file.version || 0) > 0;

/** Expected returns are issuer disclosures, never an input to the income ledger. */
export function v11DisclosureIssues(offering: Pick<Offering, "disclosureSchemaVersion" | "returnDisclosure" | "riskDisclosure" | "price" | "disclosureFiles">, instrument?: Instrument): string[] {
  if (offering.disclosureSchemaVersion !== 2) return [];
  const issues: string[] = [];
  const disclosure = offering.returnDisclosure;
  if (!disclosure) issues.push("投资回报披露未选择");
  if (!offering.riskDisclosure?.trim()) issues.push("主要发行风险未披露");
  if (disclosure && disclosure.kind !== "未提供") {
    if (!(disclosure.minPercent > 0) || !Number.isFinite(disclosure.minPercent) ||
      (disclosure.maxPercent !== undefined && (!Number.isFinite(disclosure.maxPercent) || disclosure.maxPercent < disclosure.minPercent)))
      issues.push("预期年化数值或区间无效");
    if (disclosure.priceAtCalculation !== offering.price) issues.push("发行价格变化，须重新确认预期回报测算");
    for (const [value, label] of [
      [disclosure.calculatedAt, "测算日期"], [disclosure.period, "测算期间"],
      [disclosure.incomeBasis, "收益口径"], [disclosure.assumptions, "收益及估值假设"],
      [disclosure.feesAndTaxes, "费用税费处理"], [disclosure.evidence, "测算依据"],
      [disclosure.risks, "风险提示"],
    ]) if (!value?.trim()) issues.push(`${label}缺失`);
  }
  if (instrument?.type === "债权" && (!(Number(instrument.terms?.annualRate) > 0) || instrument.status !== "Ready"))
    issues.push("合同固定利率须取自确定的 Ready 债权权益版本");
  if (!offering.disclosureFiles?.some(authorizedPublicFile)) issues.push("缺少已授权公开的版本化发行披露文件");
  if (!instrument?.files?.some(authorizedPublicFile)) issues.push("缺少已授权公开的版本化权益文件");
  return issues;
}
