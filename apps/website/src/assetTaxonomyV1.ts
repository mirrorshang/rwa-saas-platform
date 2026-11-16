export const assetCategories = [
  { id: 'real_estate', label: '房地产', types: [
    { id: 'residential', label: '住宅物业', enabled: true }, { id: 'office', label: '写字楼', enabled: true },
    { id: 'shop', label: '商业商铺', enabled: true }, { id: 'industrial', label: '工业园／仓储物流物业', enabled: true },
    { id: 'land', label: '土地', enabled: false }, { id: 'hotel', label: '酒店／服务式公寓', enabled: false },
  ] },
  { id: 'corporate_equity', label: '企业股权', types: [
    { id: 'private_equity', label: '非上市企业普通股权', enabled: true }, { id: 'spv_equity', label: '资产持有公司／SPV 股权', enabled: false },
  ] },
  { id: 'debt_receivables', label: '债权与应收款', types: [
    { id: 'corporate_loan', label: '单笔企业借款债权', enabled: true }, { id: 'accounts_receivable', label: '应收账款', enabled: false },
    { id: 'trade_receivable', label: '供应链贸易债权', enabled: false }, { id: 'asset_backed_debt', label: '资产支持债权', enabled: false },
  ] },
  { id: 'fund_interests', label: '基金与投资份额', types: [
    { id: 'private_fund', label: '私募基金份额', enabled: false }, { id: 'real_estate_fund', label: '房地产基金份额', enabled: false },
    { id: 'credit_fund', label: '信贷基金份额', enabled: false },
  ] },
  { id: 'physical_commodities', label: '实物与大宗商品', types: [
    { id: 'precious_metals', label: '贵金属', enabled: false }, { id: 'energy_minerals', label: '能源／农矿产品', enabled: false },
    { id: 'equipment_inventory', label: '设备与存货', enabled: false },
  ] },
  { id: 'infrastructure_energy', label: '基础设施与能源项目', types: [
    { id: 'renewable_energy', label: '新能源项目', enabled: false }, { id: 'transport_public', label: '交通／公共设施', enabled: false },
    { id: 'data_telecom', label: '数据中心／通信设施', enabled: false },
  ] },
  { id: 'ip_contract_income', label: '知识产权与合同收益', types: [
    { id: 'ip_licensing', label: '知识产权许可权益', enabled: false }, { id: 'royalties', label: '版权／版税及其他合同收益', enabled: false },
  ] },
] as const;

export type AssetSubtype = (typeof assetCategories)[number]['types'][number]['id'];
export const assetTypes = assetCategories.flatMap(category => category.types.map(type => ({ ...type, categoryId: category.id, categoryLabel: category.label })));
export const assetType = (id: string) => assetTypes.find(type => type.id === id);
export const assetTypeLabel = (id: string) => assetType(id)?.label || '历史分类';
export const isPropertySubtype = (id: string) => ['residential', 'office', 'shop', 'industrial', 'land', 'hotel'].includes(id);
export const isNewAssetTemplate = (id: string) => id === 'private_equity' || id === 'corporate_loan';
export const recommendedInstrument = (id: string): 'equity' | 'debt' | null => id === 'private_equity' ? 'equity' : id === 'corporate_loan' ? 'debt' : null;
