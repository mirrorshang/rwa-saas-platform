import type { Offering } from './domain.ts';

export const mockDocumentText = (offering: Offering, name: string): string[] => {
  const common = `本文件仅为 ${offering.title} 的前端 Mock 演示内容，不构成真实发行文件、法律意见、有效电子签署或付款指令。`;
  if (name === '风险披露') return [
    common,
    `底层资产：${offering.category}；投资者权益：${offering.right}。投资可能损失全部或部分本金，Token 显示不能代替法定持有人登记。`,
    offering.risk || '项目经营、合同履行、估值、流动性和法律合规状况均存在不确定性。',
    '请在真实投资前阅读经授权的完整文件并由合格专业人士核对。'
  ];
  if (name.includes('条款')) return [
    common,
    ...offering.terms.map(([key,value]) => `${key}：${value}。`),
    '本 Mock 文本不创设股权、债权或收益参与的法律权利。'
  ];
  return [
    common,
    `发行企业（演示）：${offering.issuerName}；Offering：${offering.id}；权益类型：${offering.right}。`,
    `演示单价：${(offering.priceCents/100).toFixed(2)} U / Token；最低认购额：${(offering.minimumCents/100).toFixed(2)} U。实际报价、容量和资格须由正式系统重新核验。`,
    '模拟确认仅用于展示文件阅读与订单步骤，不产生法律约束力；真实签署必须由获准服务生成可核验证据。'
  ];
};
