import type { Offering } from './domain';
import residence from './assets/residence.svg';
import debt from './assets/debt.svg';

export const offerings: Offering[] = [
  {
    id: 'residence-01', issuerId: 'harbor', issuerSlug: 'harbor', issuerName: '海岚资产',
    title: '城市住宅收益参与计划', category: '住宅物业', place: '中国 · 上海',
    right: '收益参与权', status: '认购中', priceCents: 10000, minimumCents: 100000,
    maxUnits: 500, supplyUnits: 500, availableUnits: 500, listing: 'active', listedAt: '2026-11-24', opensAt: '2026-11-24', closesAt: '2027-02-28', image: residence,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0', lockup: '以项目文件为准',
    yieldLine: '收益按合同及实际可分配金额确定',
    summary: '以城市住宅物业为底层资产的收益参与演示案例。资产经营结果和投资者实际分配均以有效文件及核实结果为准。',
    features: [['住宅形态', '单栋（演示）'], ['住宅套数', '待披露'], ['所在地区', '中国 · 上海'], ['建筑面积', '约 2,400 ㎡（演示）'], ['使用状态', '运营中（演示）'], ['权利性质与权利人关系', '以获准披露的资产文件为准'], ['估值日期与依据', '待披露；不用于计算收益']],
    terms: [['权益类型', '收益参与权'], ['参与比例', '每 Token 对应合同约定的参与份额'], ['收益来源', '核实后的资产净收益'], ['分配依据', '实际收入扣除合同约定成本后核实'], ['参与期限', '以权益文件为准'], ['分配频率', '按合同约定；不保证分配'], ['收益责任主体', '以权益文件为准']],
    risk: '资产经营结果和可分配金额可能波动；估值及历史收入不等于投资收益。',
    documents: [{ name: '认购协议', version: 'Mock v1.0' }, { name: '权益条款', version: 'Mock v1.0' }, { name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'debt-01', issuerId: 'cedar', issuerSlug: 'cedar', issuerName: '杉衡资本',
    title: '企业借款债权投资计划', category: '企业借款债权', place: '中国 · 深圳',
    right: '债权', status: '认购中', priceCents: 5000, minimumCents: 50000,
    maxUnits: 800, supplyUnits: 800, availableUnits: 800, listing: 'active', listedAt: '2026-11-23', opensAt: '2026-11-23', closesAt: '2027-01-31', image: debt,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0', lockup: '合同到期前转让限制以文件为准',
    yieldLine: '合同固定年利率 12% · 非保证兑付',
    summary: '单笔企业借款债权的合同权益演示案例。利息按合同条款计算，本金到期偿还；借款人存在信用和延期风险。',
    features: [['底层类型', '单笔企业借款债权'], ['债务人', '演示企业 A'], ['原合同金额', '500,000 U（演示）'], ['有效未偿本金及核对时点', '待核实；不等于原合同金额'], ['原债权人及担保', '以获准披露文件为准'], ['合同日期与到期', '以有效借款合同为准'], ['合同期限', '12 个月（演示）'], ['履约状态', '以合同核对结果为准']],
    terms: [['权益类型', '债权'], ['每 Token 名义本金', '以权益文件的精准映射为准'], ['合同固定年利率', '12%（非保证兑付）'], ['计息规则', '以有效合同为准'], ['合同期限', '12 个月'], ['付息方式', '按月付息'], ['本金偿还', '到期一次还本；本金不计入投资收益'], ['法律债权主体', '以权益文件为准']],
    risk: '债务人存在违约或延期风险；底层借款利率不等于投资者合同利率。',
    documents: [{ name: '认购协议', version: 'Mock v1.0' }, { name: '债权条款', version: 'Mock v1.0' }, { name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'office-01', issuerId: 'harbor', issuerSlug: 'harbor', issuerName: '海岚资产',
    title: '写字楼收益参与展示案例', category: '写字楼', place: '中国 · 上海',
    right: '收益参与权', status: '即将开放', priceCents: 10000, minimumCents: 100000,
    maxUnits: 100, listing: 'pending', image: residence,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0',
    yieldLine: '仅依据核实后的合法可分配金额',
    summary: '写字楼底层资产字段展示案例。当前并非可认购项目，出租率和未来收益均未提供。',
    features: [['资产形态', '写字楼（演示）'], ['所在地区', '中国 · 上海'], ['建筑面积', '待披露'], ['可出租面积', '待披露'], ['出租率', '未提供；不得推断'], ['使用状态', '待披露'], ['权利性质与权利人关系', '待披露'], ['估值日期与依据', '待披露']],
    terms: [['权益类型', '收益参与权'], ['参与比例', '以权益文件为准'], ['收益来源', '核实后的合法可分配金额'], ['分配依据', '实际收入及合同约定扣项'], ['分配频率', '以权益文件为准'], ['收益责任主体', '以权益文件为准']],
    risk: '出租和运营结果可能变化；无公开租约或出租率时不得推算收益。',
    documents: [{ name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'shop-01', issuerId: 'harbor', issuerSlug: 'harbor', issuerName: '海岚资产',
    title: '商业铺位收益参与展示案例', category: '商铺', place: '中国 · 杭州',
    right: '收益参与权', status: '即将开放', priceCents: 10000, minimumCents: 100000,
    maxUnits: 100, listing: 'pending', image: residence,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0',
    yieldLine: '实际经营结果核实后按合同分配',
    summary: '商业铺位底层资产字段展示案例。当前仅用于模板检查，不代表发行或可认购。',
    features: [['铺位形态', '临街商铺（演示）'], ['所在地区', '中国 · 杭州'], ['建筑面积', '待披露'], ['可出租面积', '待披露'], ['使用状态', '待披露'], ['权利性质与权利人关系', '待披露'], ['估值日期与依据', '待披露']],
    terms: [['权益类型', '收益参与权'], ['参与比例', '以权益文件为准'], ['收益来源', '核实后的合法可分配金额'], ['分配依据', '实际收入及合同约定扣项'], ['分配频率', '以权益文件为准'], ['收益责任主体', '以权益文件为准']],
    risk: '历史经营数据不能代表未来可分配收益；成本与费用依合同扣除。',
    documents: [{ name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'industrial-01', issuerId: 'harbor', issuerSlug: 'harbor', issuerName: '海岚资产',
    title: '工业园仓储物流展示案例', category: '工业园/仓储物流', place: '中国 · 苏州',
    right: '收益参与权', status: '即将开放', priceCents: 10000, minimumCents: 100000,
    maxUnits: 100, listing: 'pending', image: debt,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0',
    yieldLine: '实际经营可分配金额以合同核实',
    summary: '工业园及仓储物流底层资产字段展示案例。图片为场景示意，不能作为具体资产或抵押物证明。',
    features: [['资产形态', '仓储物流设施（演示）'], ['所在地区', '中国 · 苏州'], ['建筑面积', '待披露'], ['可出租面积', '待披露'], ['使用状态', '待披露'], ['权利性质与权利人关系', '待披露'], ['估值日期与依据', '待披露']],
    terms: [['权益类型', '收益参与权'], ['参与比例', '以权益文件为准'], ['收益来源', '核实后的合法可分配金额'], ['分配依据', '实际收入及合同约定扣项'], ['分配频率', '以权益文件为准'], ['收益责任主体', '以权益文件为准']],
    risk: '园区运营、租赁及维护成本可能变化；不以示意图推断真实抵押或担保。',
    documents: [{ name: '风险披露', version: 'Mock v1.0' }]
  },
  {
    id: 'private-01', issuerId: 'cedar', issuerSlug: 'cedar', issuerName: '杉衡资本',
    title: '企业普通股权观察项目', category: '非上市普通股权', place: '中国 · 深圳',
    right: '股权', status: '即将开放', priceCents: 20000, minimumCents: 200000,
    maxUnits: 100, listing: 'pending', image: debt,
    assetVersion: 'Mock Asset v1.0', instrumentVersion: 'Mock Rights v1.0', offeringVersion: 'Mock Offering v1.0',
    yieldLine: '未提供预期年化',
    summary: '仅用于演示 V 可见而 M Listing 未生效的渠道差异，不可认购。',
    features: [['资产类型', '非上市普通股权'], ['被投资法律实体', '演示企业 B'], ['普通股类别', '待披露'], ['已纳入股数与比例', '待披露'], ['估值及权利限制', '待披露']],
    terms: [['权益类型', '股权'], ['投资者法律权利', '以有效权益文件为准；不默认直接成为底层公司股东'], ['每 Token 权益映射', '待披露，不可据此认购'], ['表决等权利', '以有效法律文件为准'], ['股息安排', '仅在有合法决议与可分配利润时适用'], ['退出与锁仓', '无固定到期日；转让限制以文件为准']],
    risk: '非上市权益流动性与估值风险；股息不保证分配，Token 不自动等于股东登记。',
    documents: [{ name: '风险披露', version: 'Mock v1.0' }]
  }
];
export const issuers = {
  harbor: { name: '海岚资产', legal: '海岚资产管理有限公司（演示）', region: '中国 · 上海（演示）', business: '不动产资产管理与运营（演示）', disclosure: '登记与 KYB 材料尚未授权公开', intro: '专注于住宅物业资产管理与长期运营。本页企业信息为虚构 Mock 示例。' },
  cedar: { name: '杉衡资本', legal: '杉衡资本管理有限公司（演示）', region: '中国 · 深圳（演示）', business: '企业融资与权益投资（演示）', disclosure: '登记与 KYB 材料尚未授权公开', intro: '关注企业融资与资产权益项目。本页企业信息为虚构 Mock 示例。' }
};
