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


## 后续已批准的精简版 UI 改造（待当前 Codex Goal 完成后执行）

- **[2026-11-13｜Issuer V1 精简导航、页面字段与交叉一致性 UI-Ready](ISSUER-V1-LEAN-NAVIGATION-AND-PAGE-UI-READY-2026-11-13.md)**：用户批准六项精简及「资产管理｜权益结构｜发行管理」三入口重组。覆盖认购/锁仓入口合并、门户网站配置与平台域名前缀、持有人管理、数据报表、企业管理及投资者管理精简；保留法定登记/链上/资金主账、安全守卫与历史追溯。
- **生效门**：本文件目前是**已批准、待前端实施的下一轮变更基线**。当前进行中的 Codex 全量 Goal 继续按启动时的现行规格执行；**不得中途切换、打断、要求重构或自动实施新规格**。待本轮 Goal 完成、成果保护及阶段验收后，再单独安排精简改造。
- 本节不改变下文原专项 UI-Ready 文件作为**当前进行中 Codex Goal**执行依据的地位；在新改造启动时，上述精简文档仅对冲突的导航/页面组织/展示字段优先级具有较新效力，未覆盖的业务边界继续继承原规格。

## 三、模块 UI-Ready 专项规格

| 模块 | 当前权威规格 |
|---|---|
| 企业登录、创建、KYB、钱包、订阅 | [U01 UI-Ready PRD](U01-UI-Ready-PRD.md)、[Free/Standard 权益决策](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md)、[KYB 补件规则](U01-KYB-V03-APPROVED-2026-11-06.md) |
| 资产分类（7 大类/23 子类）与股权、企业借款债权基础模板 | [2026-11-12 目录重构与新增基础模板 UI-Ready](ASSET-TAXONOMY-AND-EQUITY-DEBT-TEMPLATES-V1-2026-11-12.md)；V1 六个可创建模板（房地产四 + 股权一 + 债权一），其余目录保留未开放；不覆盖既有房地产详规 |\n| 资产管理、房地产模板、资产相关方 | [U02-07 资产与相关方 UI-Ready](U02-07-ASSET-RELATED-PARTIES-AND-LIST-UI-READY-2026-11-11.md)、[房地产模板最终规则](U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md) |
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


- **[2026-11-13｜Figma 验收与现行 PRD 交叉审计及整改规格](ISSUER-V1-FIGMA-ACCEPTANCE-PRD-CROSS-AUDIT-2026-11-13.md)**：对照 Figma 双资产验收报告与现行房地产、债权资产、Instrument、Offering、认购、持有人及收益 UI-Ready 规格；区分 Figma 实现缺陷与真实产品规格补充，作为下一轮分批原型整改依据。状态：交叉审计完成；用户已认可三项产品方向（2026-11-13），按批次推进 Figma 原型整改。

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
