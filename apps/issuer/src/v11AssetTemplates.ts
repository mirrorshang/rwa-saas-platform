export const assetTemplates = {
  "住宅物业": { category: "房地产", fields: { address: "物业位置", propertyLayout: "户型", area: "建筑面积", use: "用途", occupancy: "使用状态", owner: "资产权利人", rightNature: "权利性质", relation: "权利人关系", appraisalDate: "估值日期", appraiser: "估值机构" }, evidence: ["权属证明", "估值依据", "租赁合同"], closedLoop: true },
  "写字楼": { category: "房地产", fields: { address: "物业位置", area: "建筑面积", lettableArea: "可出租面积", occupancy: "使用状态", owner: "资产权利人", rightNature: "权利性质", appraisalDate: "估值日期" }, evidence: ["权属证明", "估值依据"], closedLoop: false },
  "商业商铺": { category: "房地产", fields: { address: "铺位位置", area: "建筑面积", lettableArea: "可出租面积", occupancy: "使用状态", owner: "资产权利人", rightNature: "权利性质", appraisalDate: "估值日期" }, evidence: ["权属证明", "估值依据"], closedLoop: false },
  "工业园/仓储物流物业": { category: "房地产", fields: { address: "设施位置", area: "建筑面积", lettableArea: "可出租面积", occupancy: "使用状态", owner: "资产权利人", rightNature: "权利性质", appraisalDate: "估值日期" }, evidence: ["权属证明", "估值依据"], closedLoop: false },
  "非上市企业普通股权": { category: "企业股权", fields: { investee: "被投资法律实体", shareClass: "底层股份类别", shareCount: "底层股数", restrictions: "权利限制", valuationDate: "估值日期" }, evidence: ["股权证明", "估值依据"], closedLoop: false },
  "单笔企业借款债权": { category: "债权与应收款", fields: { debtor: "底层债务人", creditor: "原债权人", outstanding: "核实未偿本金", outstandingCheckedAt: "余额核对时点", maturity: "底层合同到期日", performance: "履约状态", guarantee: "担保" }, evidence: ["借款合同", "债权证明", "余额证明", "估值依据"], closedLoop: true },
} as const;

export type AssetTemplateName = keyof typeof assetTemplates;
export const closedLoopSubtype = (subtype: string) => subtype === "住宅物业" || subtype === "单笔企业借款债权";
