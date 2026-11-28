import type { Asset, Instrument } from "./data.ts";
import { ACTUAL_365_FIXED } from "./actual365.ts";

const has = (value: unknown) => typeof value === "string" ? value.trim().length > 0 : value !== undefined && value !== null && value !== "";

/** V1.1 terms are additive. Historical records are read as recorded and never inferred from another right type. */
export function v11InstrumentMissing(instrument: Instrument, asset?: Asset): string[] {
  const terms = instrument.terms || {};
  const v11 = instrument.termsSchemaVersion === 2;
  const fields: [string, string][] = [
    ["responsibleParty", "法律责任主体"],
    ["rightsDescription", "权利描述"],
    ["startDate", "权益起始日"],
  ];
  if (instrument.type === "股权" && v11) fields.push(
    ["shareIssuer", "股份发行主体"], ["shareClass", "股份类别"],
    ["shareCount", "股份数量"], ["votingRights", "表决权"],
    ["dividendRights", "股息安排"], ["liquidationRights", "清算安排"],
    ["exitArrangement", "退出或锁定安排"], ["termArrangement", "固定或无固定期限"],
    ["tokenLegalMapping", "Token 与法律股权映射"],
  );
  if (instrument.type === "债权") fields.push(
    ["maturityDate", "权益到期日"], ["principal", "投资者名义本金"],
    ["annualRate", "投资者固定年利率"], ["interestMethod", "计息方式"],
    ["frequency", "付息频率"], ["repayment", "本金偿还方式"],
  );
  if (instrument.type === "债权" && v11) fields.push(["debtor", "债务人"], ["tokenLegalMapping", "Token 与法律债权映射"]);
  if (instrument.type === "收益参与权") fields.push(
    ["maturityDate", "权益到期日"], ["revenueSource", "收益来源"],
    ["participationRate", "收益参与比例"],
    ["frequency", "分配周期"], ["expiryArrangement", "到期及退出安排"],
  );
  if (instrument.type === "收益参与权" && v11) fields.push(["distributableBasis", "可分配收益口径"], ["tokenLegalMapping", "Token 与法律权益映射"]);
  if (instrument.type === "股权" && !v11) fields.push(["maturityDate", "权益到期日"], ["revenueSource", "历史收益来源"], ["participationRate", "历史参与比例"], ["frequency", "历史分配频率"], ["expiryArrangement", "历史到期安排"]);
  const missing = fields.filter(([key]) => !has(terms[key])).map(([, label]) => label);
  if (!asset || asset.status !== "Ready") missing.push("上游 Asset 尚未 Ready");
  if (!instrument.files?.some(file => file.category === "核心协议" && file.status === "可引用")) missing.push("核心协议须可引用");
  if (!Number.isSafeInteger(instrument.totalRights) || !Number.isSafeInteger(instrument.tokenCap) ||
    instrument.totalRights <= 0 || instrument.tokenCap <= 0 || instrument.totalRights % instrument.tokenCap !== 0)
    missing.push("权益总量必须与 Token 份数精确映射");
  if (terms.startDate && terms.maturityDate && String(terms.startDate) >= String(terms.maturityDate))
    missing.push("投资者权益到期日必须晚于起始日");
  if (instrument.type === "股权" && v11) {
    if (!Number.isSafeInteger(Number(terms.shareCount)) || Number(terms.shareCount) <= 0 || Number(terms.shareCount) !== instrument.totalRights)
      missing.push("股份数量必须是正整数且与法律权益总量一致");
  }
  if (instrument.type === "债权") {
    if (!(Number(terms.principal) > 0) || Number(terms.principal) !== instrument.totalRights) missing.push("投资者名义本金必须与债权权益总量一致");
    if (!(Number(terms.annualRate) > 0) || !Number.isFinite(Number(terms.annualRate))) missing.push("投资者利率必须大于 0");
    if (terms.interestMethod !== ACTUAL_365_FIXED) missing.push("计息方式必须为 Actual/365 Fixed");
    if (v11 && (terms.frequency !== "每月付息" || terms.repayment !== "到期一次还本金")) missing.push("当前仅支持按月付息、到期一次还本金");
  }
  if (instrument.type !== "债权" && (!v11 || instrument.type === "收益参与权") && (!(Number(terms.participationRate) > 0) || Number(terms.participationRate) > 100))
    missing.push("收益参与比例必须大于 0 且不超过 100%");
  if (v11 && !instrument.spvMode) missing.push("SPV 关系未选择");
  if (instrument.spvMode === "已有SPV") {
    const spv = instrument.spv;
    if (!spv || !spv.id || !spv.legalName.trim() || !spv.jurisdiction.trim() || !spv.registrationNumber.trim() ||
      !spv.role || !spv.assetRelationship.trim() || !spv.issuerRelationship.trim()) missing.push("已有 SPV 法律主体信息不完整");
    if (!spv || [spv.registrationFile, spv.assetAuthorityFile, spv.rightsFile].some(file => !file?.id || file.status !== "可引用"))
      missing.push("SPV 注册、资产授权与权益文件须可引用");
  }
  return missing;
}
