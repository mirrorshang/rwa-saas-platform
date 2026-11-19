# RWA SaaS｜Platform Admin V1.0 文档索引

> **状态：产品设计 Draft｜2026-11-20 复审增量待审核**
>
> 本目录用于平台总管理后台（P 端）V1.0 产品架构、UI-Ready 逐页规格和跨模块审计。当前仅完成产品规格，不代表原型、前端代码、后端服务或生产能力已开发/上线。

## 0. 开发工程师快速入口

- **[RWA 四端功能与业务流程总览（开发理解版）](RWA-FOUR-PLATFORM-FUNCTIONAL-FLOW-OVERVIEW-FOR-ENGINEERING-DRAFT-v0.1.md)**：先了解 Issuer SaaS、Platform Admin、企业投资者平台 V、总投资者平台 M 的定位、完整成功主流程、功能模块、跨端审核、数据权威、开发文档索引和端到端验收场景。本文是总览入口，不替代各端详细 PRD。

## 1. 总体架构

- [Platform Admin V1.0 产品设计完整性审计报告](../Platform%20Admin%20V1.0%20产品设计完整性审计报告.md)：逐页 UI-Ready 复核、P-15～P-17 跨端修正、缺口和生产决策门；2026-11-20 增量待产品负责人审核。
- [平台总管理后台总体架构与九个一级导航](PLATFORM-ADMIN-OVERALL-ARCHITECTURE-AND-NAVIGATION-DRAFT-v0.1.md)
- [P-01～P-18 跨模块一致性审计](PLATFORM-ADMIN-CROSS-MODULE-CONSISTENCY-AUDIT-DRAFT-v0.1.md)

## 2. 页面规格清单

| 一级导航 | 页面组 | 规格文档 | 状态 |
|---|---|---|---|
| 01 平台工作台 | P-01 | [P-01～P-06](PLATFORM-ADMIN-P01-P06-ISSUER-CUSTOMER-TENANT-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 02 发行机构管理 | P-02～P-06 | [P-01～P-06](PLATFORM-ADMIN-P01-P06-ISSUER-CUSTOMER-TENANT-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 03 统一投资渠道管理 | I-67/I-68、P-15～P-17 | [Issuer 申请与渠道运营](PLATFORM-ADMIN-I67-I68-P15-P17-UNIFIED-INVESTOR-CHANNEL-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 04 投资者管理 | P-18 | [M 统一投资者账户管理](PLATFORM-ADMIN-P18-UNIFIED-INVESTOR-ACCOUNT-MANAGEMENT-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 05 运营中心 | P-07～P-08 | [任务、异常、通知](PLATFORM-ADMIN-P07-P08-OPERATIONS-CENTER-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 06 平台规则与套餐 | P-09～P-10 | [平台权益与全局规则](PLATFORM-ADMIN-P09-P10-PLATFORM-ENTITLEMENTS-AND-GLOBAL-RULES-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 07 安全与审计 | P-11～P-12 | [敏感访问、安全与审计](PLATFORM-ADMIN-P11-P12-SECURITY-AND-AUDIT-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 08 外部服务管理 | P-13 | [外部服务管理](PLATFORM-ADMIN-P13-EXTERNAL-SERVICE-MANAGEMENT-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |
| 09 数据与报表 | P-14 | [平台数据与报表](PLATFORM-ADMIN-P14-PLATFORM-REPORTING-AND-ANALYTICS-UI-READY-PRD-DRAFT-v0.1.md) | UI-Ready Draft |

## 3. 已确认的关键产品规则

1. **总投资平台上架：**Issuer 对单个已正式发布且符合条件的 Offering 自愿提交申请；P-15 审核通过即由系统自动创建唯一 Listing 并上架 M。自动上架成功后 M 才展示；P-16 只管理已创建 Listing，不设首次人工发布。Issuer 当前 Sandbox 模拟发布不满足真实 M 申请 Gate。
2. **商业套餐：**现行为永久 Free + 付费 Standard；旧 14 天 Trial/30 天恢复窗口已由 DEC-037 覆盖。Free→Standard 沿用同一 Tenant。
3. **五端边界：**W 官网、I Issuer SaaS、V 企业专属投资者门户、M 统一投资者平台、P 平台总后台各有独立责任；P 不代 Issuer 批准合法发行或操作资金/Token/收益。
4. **投资者管理：**P-18 只管理 M 统一投资者账户与 KYC 服务状态，不建立所有 V 门户投资者的全局库。
5. **运营任务/通知：**M17/M18 是协作能力；任务关闭、消息发送或 Provider 接收不等于原业务完成或法律有效送达。
6. **安全与 Provider：**敏感资料最小化、限时授权、撤权、追加审计；P-13 不展示密钥或 Secret。
7. **报表：**P-01 当前快照；P-14 平台运营历史分析；Issuer M21 金融业务报表仍由 Issuer 授权用户使用。平台报表不建立第二本资金/权益账。
8. **金额：**平台金额展示遵循 U（USDT）基线；未经批准换算的其他币种不得混合汇总。

## 4. 当前完成状态与未完成事项

- **P-01～P-18 与 I-67/I-68：**全部已有逐页 UI-Ready 产品规格 Draft；五批集中审核 R01～R40 已全部完成。2026-11-20 再次复审后，补正 Issuer 内部 Project/版本引用、Sandbox 与正式发布 Gate、P-15～P-17 状态及 P-17 数据源，并补明部分页面入口/按钮；本轮增量待产品负责人审核。Platform Admin 仍未进入工程开发。
- **产品审核：**P-01～P-18 五批集中审核 R01～R40 已全部完成；最终一致性审计已记录。
- 平台实际角色码、RBAC、职责分离和敏感访问审批层级。
- M 渠道可申请地区/受众枚举及法务依据。
- Free/Standard 价格、资源配额、商业收费/税务细节。
- Provider 选型、生产连接、密钥托管、健康探测周期。
- P-14 指标字典、数据更新频率、小样本抑制阈值、导出保留期限。
- API、读模型、服务端鉴权、幂等和撤权实现规格。

上述未完成项属于后续法务/安全/商业/技术决策门，不应由 UI Mock 自行填入生产值。

## 5. 产品设计状态说明

- UI-Ready = 页面结构、字段、交互、状态、异常和桌面 Web 验收规格足以作为工程实现依据；实际后端/Provider/生产能力仍以技术契约及独立准入为准。
- Draft = 产品规格尚未被用户正式批准；不代表生产规则、角色权限、真实 Provider、法务地区清单或后端实现已获批准。
- P-15 审核通过自动上架是已确认产品规则；P-16 只管理已存在 Listing，展示状态与内容复核标记分列；P-17 只看渠道授权聚合数据，不读取 Issuer M21。

## 6. GitHub 状态

- PR：[#10 Platform Admin V1.0 architecture and UI-ready specifications](https://github.com/mirrorshang/rwa-saas-platform/pull/10)
- 分支：`docs/platform-admin-architecture-20261117`
- 状态：**Draft / Open / Unmerged**
- 本 PR 仅文档，不修改前端源码，不合并，不修改 Frozen、历史 DEC/SCOPE 或 DEC-017 原 193 项首次版本归属。


## 7. 集中审核记录

### 第一批（2026-11-19）

- R01 五端架构：同意 A。
- R02 九个一级导航：同意 A。
- R03 P 端管理范围：同意 A。
- R04 P-01 工作台：同意 A。
- R05 P-02/P-03 企业客户与商业 KYB：要求修正并明确边界。P-03 仅审核 SaaS 商业客户 KYB，不审核 Issuer 创建/准备/发行的资产；资产发行不需要 P 端逐项审批。只有企业自愿申请将已正式发布 Offering 上架 M 时，才进入 P-15 渠道审核。
- R06 P-04/P-05 Tenant 管理：同意 A。
- R07 P-06 SaaS 商业收费异常：同意 A。
- R08 敏感资料访问：同意 A。

该批审核已记录；P-03 的边界修正已同步至 P-01～P-06 PRD 和总体架构。


### 第二批（2026-11-19）

R09～R16 全部同意推荐方案 A，补充意见无。

- P-07 仅处理平台负责/正式指派的任务，不覆盖原业务状态。
- P-08 仅管理平台业务通知；投递状态不等于法定送达或业务完成，Unknown 不盲目重发。
- P-09 永久 Free + 付费 Standard；商业权益不等于生产权限。
- P-10 管理平台强制规则及 M 渠道展示范围规则，版本化审批生效；不建设独立投资者资格/投资限额引擎。

审核记录同步至 P-07/P-08、P-09/P-10 PRD 和总体架构。


### 第三批（2026-11-19）

R17～R24 全部同意推荐方案 A，补充意见无。

- P-11 敏感资料申请制、独立审批、最小范围和限时授权。
- P-12 审计原始事件不可覆盖；安全事件、留存和交接不得绕过未结义务。
- P-13 管理已批准外部服务连接、健康、Webhook 和凭证引用；不显示 Secret、不授予资金/Token 执行权限。
- P-14 四类只读聚合报表；不复制 Issuer M21，不开放无授权的逐笔数据；Unknown 不按 0，导出受控。

第三批审核记录已同步至 P-11/P-12、P-13、P-14 PRD 及总体架构。


### 第四批（2026-11-19）

R25～R32 全部同意推荐方案 A，补充意见无。

- P-15 按单个已正式发布 Offering 审核 M 渠道展示申请；不审核企业发行许可。
- 审核通过即系统自动创建唯一 Listing 并上架 M；成功确认后才展示，不需要 P-16 二次人工发布。
- 自动上架失败/Unknown 幂等核验，不重复创建。
- P-16 只管理既有 Listing；暂停/下架不改变 Issuer Offering 和历史交易权利事实，下架后需重新申请。
- P-17 管理渠道监控、投诉与异常协作；只消费 M23/M10/M11 授权聚合数据，不读取 Issuer M21。

第四批审核记录已同步至 I-67/I-68/P-15～P-17 PRD、总体架构和一致性审计。


### 第五批（2026-11-19）

R33～R40 全部同意推荐方案 A，补充意见无。

- P-18 仅管理 M 统一投资者账户；不建立 V 投资者全局库或自动合并 M/V。
- 第三方 Provider 实际核验，M 保存权威 KYC 结果；P-18 不人工覆盖 KYC。
- 允许基于明确依据限制/恢复 M 账户服务，但不影响 KYC、认购资格或既有投资者权利。
- 五端 W/I/V/M/P 职责独立；M 渠道申请与 V 门户运营分开。
- 订单、资金、配售、法定登记、Token、收益/本金保持原领域唯一权威，P 不复制主账。
- Tenant 暂停/退租/降级不自动删除 Listing、投资者账户或存续权利。
- 九个一级导航保持；最小权限，不在 V1 建复杂企业分权。
- 全局状态单一权威、Unknown 不当成功、缺失不当 0、幂等防重、重要历史保留。

## 8. 最终产品审核状态（2026-11-19）

- 五批集中审核 R01～R40：**40 项全部完成审核**；R05 按用户意见修正后确认，其余 39 项同意推荐方案 A。
- P-01～P-18 逐页 UI-Ready 产品规格均已形成 Draft 文档；I-67/I-68 作为 Issuer 申请端配套规格。
- 九个一级导航及五端职责边界完成最终产品一致性审计。
- 当前交付为产品设计基线，不代表原型/前端/后端/API/真实 Provider/生产能力已实现或验收。
- 开放决策门（法域与法律依据、角色码/审批人、数据留存期限、Provider 选型与生产连接、套餐价格/配额、自动上架技术可靠性与生产准入）继续开放，不得按已确认生产规则处理。
- 下一阶段：将已完成的产品规格与《四端功能与业务流程总览（开发理解版）》交由工程师直接开展 Platform Admin V1.0 工程开发；不安排额外原型开发阶段。


## 8. 2026-11-20 复审版本记录

本轮只修正本目录现有产品规格、架构与索引，并新增上方完整性审计报告；P-01～P-08、P-11/P-12、P-14 和四端总览经复核无需重复改写。Issuer PR #12 是未合并的 Sandbox Mock 候选实现，不能作为生产 M 上架已接通的证据。原 PR #10 仍保持 Draft/Open；本轮增量以独立审查分支提交，产品负责人审核后再决定并入原文档分支。历史 DEC、Frozen、R01～R40 原文不变。
