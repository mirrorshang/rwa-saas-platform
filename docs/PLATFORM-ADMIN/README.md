# RWA SaaS｜Platform Admin V1.0 文档索引

> **状态：产品设计 Draft｜2026-11-19**
>
> 本目录用于平台总管理后台（P 端）V1.0 产品架构、UI-Ready 逐页规格和跨模块审计。当前仅完成产品规格，不代表原型、前端代码、后端服务或生产能力已开发/上线。

## 1. 总体架构

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

1. **总投资平台上架：**Issuer 对单个已正式发布且符合条件的 Offering 自愿提交申请；P-15 审核通过即由系统自动创建唯一 Listing 并上架 M。自动上架成功后 M 才展示；P-16 只管理已上架 Listing，不设首次人工发布。
2. **商业套餐：**现行为永久 Free + 付费 Standard；旧 14 天 Trial/30 天恢复窗口已由 DEC-037 覆盖。Free→Standard 沿用同一 Tenant。
3. **五端边界：**W 官网、I Issuer SaaS、V 企业专属投资者门户、M 统一投资者平台、P 平台总后台各有独立责任；P 不代 Issuer 批准合法发行或操作资金/Token/收益。
4. **投资者管理：**P-18 只管理 M 统一投资者账户与 KYC 服务状态，不建立所有 V 门户投资者的全局库。
5. **运营任务/通知：**M17/M18 是协作能力；任务关闭、消息发送或 Provider 接收不等于原业务完成或法律有效送达。
6. **安全与 Provider：**敏感资料最小化、限时授权、撤权、追加审计；P-13 不展示密钥或 Secret。
7. **报表：**P-01 当前快照；P-14 平台运营历史分析；Issuer M21 金融业务报表仍由 Issuer 授权用户使用。平台报表不建立第二本资金/权益账。
8. **金额：**平台金额展示遵循 U（USDT）基线；未经批准换算的其他币种不得混合汇总。

## 4. 当前完成状态与未完成事项

- **P-01～P-18 与 I-67/I-68：**全部已有逐页 UI-Ready 产品规格 Draft；2026-11-19 已由产品负责人进行正文复核，并补齐 P-07～P-13 的状态/交互细节及 P-17 数据源边界。已完成第一轮全量一致性复核；当前等待用户集中确认，不代表原型或代码完成。
- **下一步：**完成 P-01～P-18 集中产品收口；通过后再启动独立前端原型任务。
- 平台实际角色码、RBAC、职责分离和敏感访问审批层级。
- M 渠道可申请地区/受众枚举及法务依据。
- Free/Standard 价格、资源配额、商业收费/税务细节。
- Provider 选型、生产连接、密钥托管、健康探测周期。
- P-14 指标字典、数据更新频率、小样本抑制阈值、导出保留期限。
- API、读模型、服务端鉴权、幂等和撤权实现规格。

上述未完成项属于后续法务/安全/商业/技术决策门，不应由 UI Mock 自行填入生产值。

## 5. 产品设计状态说明

- UI-Ready = 页面结构、字段、交互、状态、异常、Mock 和桌面 Web 验收规格可供原型/前端设计使用。
- Draft = 产品规格尚未被用户正式批准；不代表生产规则、角色权限、真实 Provider、法务地区清单或后端实现已获批准。
- P-15 审核通过自动上架是已确认产品规则；P-16 只管理已存在 Listing；P-17 只看渠道授权聚合数据，不读取 Issuer M21。

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
