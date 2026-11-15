# RWA SaaS｜当前文档权威与历史覆盖索引

> 更新日期：2026-11-12。本文定义当前文件的权威层级与冲突处理规则。历史原文已单独归档，不得把归档快照当作现行执行计划。

## 一、冲突处理优先级

1. 用户在当前阶段对具体事项作出的最新明确批准，以及其后形成的正式 DEC。
2. 适用主题的 Frozen 基线；未被后续明确决定覆盖的部分继续有效。
3. 当前 V1 产品基线、产品总体架构和已批准专项 UI-Ready 规格；这些文件负责汇总与展开，不得擅自提升 Draft 为 Approved。
4. 对应的全局一致性、导航覆盖、功能双向映射和端到端审计；审计报告负责验证覆盖与发现问题，不自行创设业务规则。
5. 历史 Master PRD、旧阶段清单、候选页面地图和历史工作稿；只作背景追溯，不能覆盖最新 DEC/专项规格。
6. 代码、Mock、自测和开发报告；描述实现证据，不反向决定产品需求，也不能替代独立验收或生产准入。

**关键规则：** 功能范围 Approved ≠ 页面规格 UI-Ready；UI-Ready ≠ 视觉稿/可点击原型完成；纸面流程审计通过 ≠ 源码、Browser/UAT 或真实生产通过；PR Draft ≠ 合并授权。

## 二、当前产品基线与权威入口

| 主题 | 当前权威来源 | 责任 |
|---|---|---|
| 总体产品架构、Issuer 导航、端职责 | [产品总体架构与交付基线](../03-product-prd/r2-current-baseline/RWA-SaaS-PRODUCT-ARCHITECTURE-AND-DELIVERY-BASELINE-2026-11-09.md) | 当前架构与范围总览 |
| V1 功能范围 | [V1 产品基线与功能范围](../03-product-prd/r2-current-baseline/RWA-SaaS-V1-PRODUCT-BASELINE-AND-FUNCTION-SCOPE-2026-11-09.md) + DEC-057 | 当前 157 项 V1 与全版本追踪口径 |
| 当前设计进度 | [V1 产品完整性与 UI 设计现状](../03-product-prd/r2-current-baseline/RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md) | 当前完成项与下一阶段 |
| 模块字段/页面/交互 | [R2 专项 UI-Ready 索引](../03-product-prd/r2-current-baseline/README.md) | 模块级详细规格入口 |
| 导航与页面覆盖 | [Issuer 导航与页面覆盖审计](../03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-NAVIGATION-AND-PAGE-COVERAGE-AUDIT-2026-11-11.md) | 9 个一级导航、23 个二级入口与页面责任 |
| 正式功能归属 | [157 项功能—页面双向映射](../03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-FUNCTION-TO-PAGE-BIDIRECTIONAL-CROSSWALK-2026-11-11.md) | 逐 ID 页面与产品端责任 |
| 模块一致性 | [Issuer 全局一致性审计](../03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-GLOBAL-CONSISTENCY-AUDIT-2026-11-11.md) | 唯一主账、套餐、跨模块状态 |
| 端到端完整性 | [端到端流程与字段审计](../03-product-prd/r2-current-baseline/END-TO-END-ISSUER-FLOW-AND-FIELD-COMPLETENESS-AUDIT-2026-11-11.md) | 正向流程、字段交接与异常守卫 |
| 收款与存续规则 | [DEC-083](../../decisions/DEC-083-issuer-v1-payment-default-and-continuity-servicing-approved.md) | 默认合约收款 A、降级存续模式 B |

## 三、版本数字必须分开使用

- **原始审批账：193 项**，DEC-017 批准首次交付归属 V1 146 / V2 22 / V3 20 / TBD 5。此主表及原始功能 ID 不得重写。
- **当前全版本追踪：204 项**，V1 157 / V2 22 / V3 20 / TBD 5。DEC-057 在原 193 项基础上追加 11 项 V1 功能。
- 当前实际产品设计工作聚焦 Issuer 企业 SaaS；其余 V/M/P 页面设计不因纳入 V1 范围而被视为已完成。
- 当前 Issuer 映射中 132 项属于 Issuer 业务/可见共享责任，25 项归属其他产品端；不可把 157 项误读为 157 个 Issuer 页面。

## 四、当前批准的 Issuer 页面架构

九个一级导航：
1. 工作台首页
2. 资产与发行
3. 投资者门户
4. 投资者与认购
5. 资金与结算
6. Token 管理
7. 收益与分配
8. 数据与报表
9. 企业管理

二级入口共 23 项；工作台首页无独立二级入口。具体页面责任以总体架构和全局一致性审计为准。历史 DEC-040 使用“企业设置”，后续现行页面与总体架构统一采用“企业管理”；不构成新增业务域或菜单变更。

## 五、仍然开放的事项

- 统一视觉规范、可点击 Web Mock 原型与视觉体验验收。
- 源码、Build、Browser/UAT 和真实环境测试。
- InvestorRef 与 M08/M07 钱包验证结果跨端映射的独立验证。
- 法域、法律责任、资金控制/托管、Provider/Signer、法定登记、合约和 Token 生产准入。
- X-01～X-13 保持 Open；V1 整体未 Frozen。
- PR #6、PR #8 均 Draft / Open / Unmerged。

## 六、历史文件效力

历史 Step04/05/06、旧 Master PRD、旧 104/125 页面组、旧 146 项静态映射及早期候选 IA，只记录其当时的审批与工作背景。与当前 DEC、R2 产品基线或专项 UI-Ready 规格冲突时，以现行来源为准。

- [清理前权威索引归档](HISTORICAL-DOCUMENT-AUTHORITY-INDEX-ARCHIVE-2026-11-12.md)
- [文档清理记录](RWA-SaaS-GitHub-Document-Cleanup-2026-11-12.md)
- [文档体系完整性复核报告](RWA-SaaS-Document-System-Integrity-Review-2026-11-12.md)
