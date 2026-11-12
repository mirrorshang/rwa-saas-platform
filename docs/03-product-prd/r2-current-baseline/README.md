# R2 当前有效产品基线索引｜Issuer 企业 SaaS V1

> 更新日期：2026-11-12｜维护分支：`docs/r2-current-product-baseline`｜PR #8 Draft / Open / Unmerged。  
> 本目录是 Issuer 企业 SaaS V1 当前页面级产品规格的直接入口。历史工作稿和开发交接记录只用于追溯，不作为当前产品规则或执行状态依据。

## 一、当前状态

- Issuer 企业 SaaS 九个一级导航、23 个二级入口已收口。
- Issuer 当前页面规格已达到 UI-Ready；具体字段、按钮、交互、状态、异常和跳转以各专项最终规格为准。
- 157 项 V1 正式功能已逐 ID 完成页面双向映射：132 项属于 Issuer 业务/可见共享责任，25 项属于其他产品端。
- 导航覆盖、模块级全局一致性和端到端产品文档/字段完整性审计均已完成；端到端审计结论为文档层面通过（有外部依赖）。
- 下一阶段：统一视觉规范与可点击 Web Mock 原型规划；尚不代表原型、源码、Browser/UAT 或真实生产完成。
- 本阶段只推进 Issuer 企业 SaaS 页面设计；V/M/P 其他端页面不在当前设计任务范围。

## 二、当前总入口

1. [产品总体架构与交付基线](RWA-SaaS-PRODUCT-ARCHITECTURE-AND-DELIVERY-BASELINE-2026-11-09.md)
2. [V1 产品基线与功能范围](RWA-SaaS-V1-PRODUCT-BASELINE-AND-FUNCTION-SCOPE-2026-11-09.md)
3. [V1 产品完整性与 UI 设计现状](RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md)
4. [Issuer 导航与页面覆盖审计](ISSUER-SAAS-V1-NAVIGATION-AND-PAGE-COVERAGE-AUDIT-2026-11-11.md)
5. [Issuer 157 项功能—页面双向映射](ISSUER-SAAS-V1-FUNCTION-TO-PAGE-BIDIRECTIONAL-CROSSWALK-2026-11-11.md)
6. [Issuer 全局一致性审计](ISSUER-SAAS-V1-GLOBAL-CONSISTENCY-AUDIT-2026-11-11.md)
7. [Issuer 端到端流程与字段完整性审计](END-TO-END-ISSUER-FLOW-AND-FIELD-COMPLETENESS-AUDIT-2026-11-11.md)
8. [DEC-083 默认合约收款与降级存续服务](../../../decisions/DEC-083-issuer-v1-payment-default-and-continuity-servicing-approved.md)

## 三、模块 UI-Ready 专项规格

| 模块 | 当前权威规格 |
|---|---|
| 企业登录、创建、KYB、钱包、订阅 | [U01 UI-Ready PRD](U01-UI-Ready-PRD.md)、[Free/Standard 权益决策](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md)、[KYB 补件规则](U01-KYB-V03-APPROVED-2026-11-06.md) |
| 资产管理、房地产模板、资产相关方 | [U02-07 资产与相关方 UI-Ready](U02-07-ASSET-RELATED-PARTIES-AND-LIST-UI-READY-2026-11-11.md)、[房地产模板最终规则](U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md) |
| 权益结构 | [U02-08 权益结构 UI-Ready](U02-08-INSTRUMENT-UI-READY-CLOSEOUT-2026-11-11.md) |
| Offering | [U02-09 Offering UI-Ready](U02-09-OFFERING-MODULE-UI-READY-CLOSEOUT-2026-11-11.md) |
| 认购记录 | [U02-10 认购记录 UI-Ready](U02-10-SUBSCRIPTION-RECORDS-UI-READY-CLOSEOUT-2026-11-11.md) |
| 投资者管理与 KYC 脱敏结果 | [U02-11 投资者管理 UI-Ready](U02-11-INVESTOR-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md) |
| 认购订单 | [U02-12 认购订单 UI-Ready](U02-12-SUBSCRIPTION-ORDERS-UI-READY-CLOSEOUT-2026-11-11.md) |
| 配售与持有人 | [U02-13 配售与持有人 UI-Ready](U02-13-ALLOCATION-AND-HOLDERS-UI-READY-CLOSEOUT-2026-11-11.md) |
| 资金与结算 | [U02-14 资金与结算 UI-Ready](U02-14-FUNDS-AND-SETTLEMENT-UI-READY-CLOSEOUT-2026-11-11.md) |
| Token 管理 | [Token 管理 UI-Ready](TOKEN-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md) |
| 锁仓记录 | [锁仓记录 UI-Ready](LOCKUP-RECORDS-UI-READY-CLOSEOUT-2026-11-11.md) |
| 收益与分配 | [收益与分配 UI-Ready](YIELD-AND-DISTRIBUTION-UI-READY-CLOSEOUT-2026-11-11.md) |
| 数据与共享能力 | [八页面组 UI-Ready](DATA-AND-SHARED-CAPABILITIES-UI-READY-CLOSEOUT-2026-11-11.md) |
| Issuer 投资者门户管理 | [I-13 门户管理 UI-Ready](I13-ISSUER-INVESTOR-PORTAL-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md) |

## 四、关键跨模块审计与治理

- [资产与发行跨模块一致性审计](ASSET-AND-ISSUANCE-CROSS-MODULE-CONSISTENCY-AUDIT-2026-11-11.md)
- [Issuer 全局一致性审计](ISSUER-SAAS-V1-GLOBAL-CONSISTENCY-AUDIT-2026-11-11.md)
- [端到端流程与字段完整性审计](END-TO-END-ISSUER-FLOW-AND-FIELD-COMPLETENESS-AUDIT-2026-11-11.md)
- [Mock 控制台 UI 规格](MOCK-CONTROL-CONSOLE-UI-SPEC.md)：仅内部测试工具，不是 Free/Standard 用户功能。
- [旧规则废止映射与代码差异抽样](SUPERSEDED-RULES-AND-CODE-GAPS.md)：历史差异参考；不代表当前本地源码或最新开发状态。
- [交付与验收门](DELIVERY-AND-ACCEPTANCE.md)：历史 U01 实施规划；不构成当前开发授权。
- [本目录清理前索引归档](../../00-governance/HISTORICAL-R2-BASELINE-README-ARCHIVE-2026-11-12.md)

## 五、版本与生产边界

- 当前追踪 204 项：V1 157 / V2 22 / V3 20 / TBD 5；DEC-017 原 193 项首次版本归属不变。
- 当前设计仅推进 V1 Issuer 页面；不以此改变五端总体范围或其他端未来责任。
- UI-Ready 不等于视觉稿、源码、Build、Browser/UAT 或真实生产通过。
- InvestorRef/钱包验证映射、法律资金、法定登记、Provider/Signer、合约及 Token 生产准入仍需独立核验；X-01～X-13 保持 Open。
