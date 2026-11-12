# RWA SaaS Platform｜产品规划与项目交接总览

> **更新日期：2026-11-12**  
> **当前工作范围：Issuer 企业 SaaS V1 产品与 UI 设计**  
> **当前阶段：Issuer 页面规格 UI-Ready、功能映射及产品文档一致性审计完成；进入统一视觉规范与可点击 Web Mock 原型规划。**

## 1. 项目当前结论

RWA SaaS 是面向发行企业与资产管理机构的标准化多资产 RWA SaaS。V1 产品范围及五端总体方向按正式 DEC 保留；**当前实际产品设计和原型工作聚焦 Issuer 企业 SaaS**，不在本阶段扩展 V 投资者前台、M 统一投资端或 P 平台运营后台的页面设计。

Issuer 企业 SaaS 当前完成：
- 九个一级导航、23 个二级入口；单账号对应单企业，不做企业内部成员/角色配置。
- 企业登录、创建、KYB、企业管理、钱包与订阅。
- 资产管理、权益结构、Offering、投资者与认购、资金与结算、Token、锁仓、收益与分配、数据与共享能力、标准投资者门户管理。
- 157 项 V1 正式功能逐 ID 页面双向映射；其中 132 项属于 Issuer 业务/可见共享责任，25 项属于其他产品端。
- 模块级全局一致性、导航页面覆盖、端到端业务流程与字段完整性产品文档审计均已完成。

**审计通过的含义仅为产品文档/UI-Ready 深度通过（有外部依赖）**，不代表视觉稿、可点击原型、源码、Build、Browser/UAT、真实 Provider/Signer、资金、法定登记、Token 生产或整体 V1 Frozen 已完成。

## 2. 当前权威阅读顺序

| 顺序 | 文档 | 责任 |
|---|---|---|
| 1 | [产品总体架构与交付基线](docs/03-product-prd/r2-current-baseline/RWA-SaaS-PRODUCT-ARCHITECTURE-AND-DELIVERY-BASELINE-2026-11-09.md) | 当前产品架构、范围、导航、责任边界和协作原则 |
| 2 | [V1 产品完整性与 UI 设计现状](docs/03-product-prd/r2-current-baseline/RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md) | 当前设计完成度、仍开放的事项和后续工作 |
| 3 | [R2 专项 UI-Ready 文档索引](docs/03-product-prd/r2-current-baseline/README.md) | 每个模块的最终字段、页面、交互与状态规格 |
| 4 | [Issuer 全局一致性审计](docs/03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-GLOBAL-CONSISTENCY-AUDIT-2026-11-11.md) | 九导航、唯一主账、套餐和跨模块一致性 |
| 5 | [Issuer 157 项功能—页面双向映射](docs/03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-FUNCTION-TO-PAGE-BIDIRECTIONAL-CROSSWALK-2026-11-11.md) | 正式功能 ID、页面责任及其他产品端边界 |
| 6 | [端到端流程与字段完整性审计](docs/03-product-prd/r2-current-baseline/END-TO-END-ISSUER-FLOW-AND-FIELD-COMPLETENESS-AUDIT-2026-11-11.md) | 从企业入驻到发行后管理的正向/异常链路 |
| 7 | [DEC-083](decisions/DEC-083-issuer-v1-payment-default-and-continuity-servicing-approved.md) | 默认合约收款与降级存续服务的最新批准规则 |
| 8 | [文档状态索引](docs/Document-Status-Index.md) / [权威与覆盖索引](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md) | 查找当前有效文件、审批来源及历史覆盖关系 |

## 3. Issuer 当前九个一级导航

1. 工作台首页
2. 资产与发行
3. 投资者门户
4. 投资者与认购
5. 资金与结算
6. Token 管理
7. 收益与分配
8. 数据与报表
9. 企业管理

二级入口共 23 项。具体页面责任和横向入口以总体架构及全局一致性审计为准。

## 4. 版本与范围口径

- 当前全版本追踪：**204 项 = V1 157 / V2 22 / V3 20 / TBD 5**。
- DEC-017 原 193 项正式主表首次交付归属：**V1 146 / V2 22 / V3 20 / TBD 5**，保持原样。
- DEC-057 后续追加 11 项至 V1；不得把 193 项原主表与 204 项当前追踪口径混为一张历史统计。
- 当前仅推进 V1；V2/V3/TBD 不在本阶段展开设计。

## 5. 当前不代表已完成的事项

- 统一视觉规范、可点击 Web Mock 原型及视觉体验验收。
- 源码实现、Build、Browser/UAT 和真实环境回归。
- InvestorRef 与 M08/M07 钱包验证结果的跨端数据映射独立验收。
- 法域、法律责任、资金控制/托管、Provider/Signer、法定登记、合约与 Token 生产准入。
- V/M/P 其他产品端的页面级设计与验收。

以上外部生产准入与跨端依赖仍需独立核验；X-01～X-13 保持 Open。

## 6. GitHub 治理

- 仓库：[`mirrorshang/rwa-saas-platform`](https://github.com/mirrorshang/rwa-saas-platform)
- 当前维护分支：`docs/r2-current-product-baseline`
- PR [#8](https://github.com/mirrorshang/rwa-saas-platform/pull/8)：Draft / Open / Unmerged。
- PR [#6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)：Draft / Open / Unmerged。
- 未经用户明确授权，不合并 PR，不改写 Frozen、DEC、ARCH、SCOPE 或历史功能版本主表。

## 7. 文档治理记录

- [2026-11-12 文档清理记录](docs/00-governance/RWA-SaaS-GitHub-Document-Cleanup-2026-11-12.md)：逐文件清理范围、保留规则和验证结果。
- [2026-11-12 文档体系完整性复核](docs/00-governance/RWA-SaaS-Document-System-Integrity-Review-2026-11-12.md)：入口冲突、状态过期问题与修复说明。
- [历史根 README 归档](docs/00-governance/HISTORICAL-ROOT-README-ARCHIVE-2026-11-12.md)：仅用于追溯，不作为当前交接依据。
