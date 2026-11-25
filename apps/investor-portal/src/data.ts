import type { Offering } from './domain';
import residence from './assets/residence.svg';
import debt from './assets/debt.svg';

export const offerings: Offering[] = [
  {
    id: 'residence-01', issuerId: 'harbor', issuerSlug: 'harbor', issuerName: '海岚资产',
    title: '城市住宅收益参与计划', category: '住宅物业', place: '中国 · 上海',
    right: '收益参与权', status: '认购中', priceCents: 10000, minimumCents: 100000,
    maxUnits: 500, listing: 'active', image: residence,
    yieldLine: '收益按合同及实际可分配金额确定',
    summary: '以城市住宅物业为底层资产的收益参与演示案例。资产经营结果和投资者实际分配均以有效文件及核实结果为准。',
    features: [['资产类型', '住宅 · 单栋'], ['所在地区', '中国 · 上海'], ['建筑面积', '约 2,400 ㎡（演示）'], ['使用状态', '运营中（演示）']],
    terms: [['权益类型', '收益参与权'], ['参与比例', '每 Token 对应合同约定的参与份额'], ['收益来源', '核实后的资产净收益'], ['分配频率', '按合同约定；不保证分配']],
    documents: [{ name: '认购协议', version: 'Mock v1.0' }, { name: '权益条款', version: 'Mock v1.0' }, { name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'debt-01', issuerId: 'cedar', issuerSlug: 'cedar', issuerName: '杉衡资本',
    title: '企业借款债权投资计划', category: '企业借款债权', place: '中国 · 深圳',
    right: '债权', status: '认购中', priceCents: 5000, minimumCents: 50000,
    maxUnits: 800, listing: 'active', image: debt,
    yieldLine: '合同固定年利率 12% · 非保证兑付',
    summary: '单笔企业借款债权的合同权益演示案例。利息按合同条款计算，本金到期偿还；借款人存在信用和延期风险。',
    features: [['底层类型', '单笔企业借款债权'], ['债务人', '演示企业 A'], ['合同金额', '500,000 U（演示）'], ['合同期限', '12 个月（演示）']],
    terms: [['权益类型', '债权'], ['合同固定年利率', '12%（非保证兑付）'], ['付息方式', '按月付息'], ['本金偿还', '到期一次还本；本金不计入投资收益']],
    documents: [{ name: '认购协议', version: 'Mock v1.0' }, { name: '债权条款', version: 'Mock v1.0' }, { name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'private-01', issuerId: 'cedar', issuerSlug: 'cedar', issuerName: '杉衡资本',
    title: '企业普通股权观察项目', category: '非上市普通股权', place: '中国 · 深圳',
    right: '股权', status: '即将开放', priceCents: 20000, minimumCents: 200000,
    maxUnits: 100, listing: 'pending', image: debt,
    yieldLine: '未提供预期年化',
    summary: '仅用于演示 V 可见而 M Listing 未生效的渠道差异，不可认购。',
    features: [['资产类型', '非上市普通股权']], terms: [['权益类型', '股权']],
    documents: [{ name: '风险披露', version: 'Mock v1.0' }]
  }
];
export const issuers = {
  harbor: { name: '海岚资产', legal: '海岚资产管理有限公司（演示）', intro: '专注于住宅物业资产管理与长期运营。本页企业信息为虚构 Mock 示例。' },
  cedar: { name: '杉衡资本', legal: '杉衡资本管理有限公司（演示）', intro: '关注企业融资与资产权益项目。本页企业信息为虚构 Mock 示例。' }
};
