export type DemoProject = { name: string; asset: string; offering: string; status: string };
export type DemoOverview = { assets: number; projects: DemoProject[]; tasks: string[]; issues: string[] };
export const samples: Record<string, DemoOverview> = {
  assetco: { assets: 3, projects: [{ name: '示例项目 · 仓储资产', asset: '仓储设施 A', offering: '演示轮次 01', status: '资料准备中' }, { name: '示例项目 · 应收账款', asset: '应收账款 B', offering: '演示轮次 02', status: '内部审核中' }], tasks: ['核对项目资料完整性', '检查发行方案披露草稿'], issues: ['一项模拟文件待补充'] },
  issuerco: { assets: 1, projects: [{ name: '示例项目 · 设备资产', asset: '设备资产 C', offering: '演示轮次 03', status: '草稿' }], tasks: ['确认项目基础资料'], issues: [] },
  operator: { assets: 2, projects: [{ name: '示例项目 · 运营资产', asset: '运营资产 D', offering: '演示轮次 04', status: '内部审核中' }], tasks: ['复核门户展示内容'], issues: ['生产发行许可尚未核实'] },
};
export const emptyOverview: DemoOverview = { assets: 0, projects: [], tasks: [], issues: [] };
