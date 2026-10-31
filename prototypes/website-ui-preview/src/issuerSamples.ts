export type DemoAsset = { id: string; name: string };
export type DemoOffering = { id: string; name: string; status: '进行中' | '筹备中' | '已暂停'; detail: string };
export type DemoProject = { id: string; name: string; primaryAssetId: string; status: string; offerings: DemoOffering[] };
export type DemoOverview = { assets: DemoAsset[]; projects: DemoProject[]; tasks: string[]; issues: string[] };
export const samples: Record<string, DemoOverview> = {
  assetco: {
    assets: [{ id: 'warehouse-a', name: '仓储设施 A' }, { id: 'receivable-b', name: '应收账款 B' }, { id: 'reserve-c', name: '储备资产 C' }],
    projects: [
      { id: 'warehouse-project', name: '示例项目 · 仓储资产', primaryAssetId: 'warehouse-a', status: '资料准备中', offerings: [
        { id: 'warehouse-01', name: '演示轮次 01', status: '进行中', detail: '资料准备' },
        { id: 'warehouse-02', name: '演示轮次 02', status: '筹备中', detail: '方案草稿' },
      ] },
      { id: 'receivable-project', name: '示例项目 · 应收账款', primaryAssetId: 'receivable-b', status: '内部审核中', offerings: [
        { id: 'receivable-01', name: '演示轮次 03', status: '进行中', detail: '内部审核' },
      ] },
    ],
    tasks: ['核对项目资料完整性', '检查发行方案披露草稿'], issues: ['一项模拟文件待补充'],
  },
  issuerco: {
    assets: [{ id: 'equipment-c', name: '设备资产 C' }],
    projects: [{ id: 'equipment-project', name: '示例项目 · 设备资产', primaryAssetId: 'equipment-c', status: '草稿', offerings: [{ id: 'equipment-01', name: '演示轮次 04', status: '筹备中', detail: '方案草稿' }] }],
    tasks: ['确认项目基础资料'], issues: [],
  },
  operator: {
    assets: [{ id: 'operations-d', name: '运营资产 D' }, { id: 'reserve-e', name: '储备资产 E' }],
    projects: [{ id: 'operations-project', name: '示例项目 · 运营资产', primaryAssetId: 'operations-d', status: '内部审核中', offerings: [{ id: 'operations-01', name: '演示轮次 05', status: '进行中', detail: '门户展示待复核' }] }],
    tasks: ['复核门户展示内容'], issues: ['生产发行许可尚未核实'],
  },
};
export const emptyOverview: DemoOverview = { assets: [], projects: [], tasks: [], issues: [] };
export const offeringsOf = (overview: DemoOverview) => overview.projects.flatMap(project => project.offerings);
export const primaryAssetOf = (overview: DemoOverview, project: DemoProject) => overview.assets.find(asset => asset.id === project.primaryAssetId);
