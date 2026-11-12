# RWA SaaS｜当前文档状态索引

> 更新日期：2026-11-12。本文只索引当前有效产品状态与阅读入口；旧阶段记录保留在历史归档，不作为当前执行顺序。

## 一、当前产品与设计状态

| 范围 | 状态 | 权威依据 |
|---|---|---|
| V1 产品范围 | 已批准；当前设计阶段聚焦 Issuer 企业 SaaS | DEC-057～059、V1 产品范围基线 |
| 官网 | 已完成既定 V1 页面与入口；仅按最新规则定向修正 | DEC-060～063、官网专项规格 |
| Issuer 企业 SaaS 导航 | 9 个一级导航、23 个二级入口 | 产品总体架构、DEC-040～043、全局一致性审计 |
| Issuer 页面规格 | 当前 Issuer 页面达到 UI-Ready | DEC-064～083、R2 专项规格 |
| 正式功能映射 | 157 项逐 ID 双向映射完成；132 项 Issuer 责任、25 项其他端 | Issuer 功能—页面双向映射 |
| 模块级一致性 | 已完成 | DEC-080～082、Issuer 全局一致性审计 |
| 端到端文档审计 | 2026-11-12 通过（有外部依赖） | 端到端流程与字段完整性审计 |
| 视觉规范/可点击原型 | 下一阶段，尚未完成 | 待建立独立视觉与原型交付规格 |
| 源码/Build/Browser/UAT | 不由 UI-Ready 文档审计代表 | 后续独立开发与验收证据 |
| 真实生产准入 | 仍开放 | X-01～X-13 及法律/资金/Provider/Signer/登记/Token 生产门 |

## 二、当前必读文件

1. [根 README：产品规划与项目交接总览](../README.md)
2. [产品总体架构与交付基线](03-product-prd/r2-current-baseline/RWA-SaaS-PRODUCT-ARCHITECTURE-AND-DELIVERY-BASELINE-2026-11-09.md)
3. [V1 产品完整性与 UI 设计现状](03-product-prd/r2-current-baseline/RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md)
4. [R2 专项 UI-Ready 文档索引](03-product-prd/r2-current-baseline/README.md)
5. [Issuer 导航与页面覆盖审计](03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-NAVIGATION-AND-PAGE-COVERAGE-AUDIT-2026-11-11.md)
6. [Issuer 157 项功能—页面双向映射](03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-FUNCTION-TO-PAGE-BIDIRECTIONAL-CROSSWALK-2026-11-11.md)
7. [Issuer 全局一致性审计](03-product-prd/r2-current-baseline/ISSUER-SAAS-V1-GLOBAL-CONSISTENCY-AUDIT-2026-11-11.md)
8. [端到端流程与字段完整性审计](03-product-prd/r2-current-baseline/END-TO-END-ISSUER-FLOW-AND-FIELD-COMPLETENESS-AUDIT-2026-11-11.md)
9. [DEC-083 默认收款与降级存续批准](../decisions/DEC-083-issuer-v1-payment-default-and-continuity-servicing-approved.md)

## 三、版本口径

- 当前追踪 204 项：V1 157 / V2 22 / V3 20 / TBD 5。
- DEC-017 原 193 项主表首次交付归属保持 V1 146 / V2 22 / V3 20 / TBD 5。
- DEC-057 后续新增 11 项进入 V1；不得重写原 193 项历史主表。
- 当前工作只推进 V1，不在此索引展开 V2/V3/TBD 设计。

## 四、历史与治理

- [文档权威与覆盖索引](00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)
- [文档清理记录](00-governance/RWA-SaaS-GitHub-Document-Cleanup-2026-11-12.md)
- [文档体系完整性复核报告](00-governance/RWA-SaaS-Document-System-Integrity-Review-2026-11-12.md)
- [清理前状态索引历史归档](00-governance/HISTORICAL-DOCUMENT-STATUS-INDEX-ARCHIVE-2026-11-12.md)

旧 Step04/05/06、104/125 候选页面组、146 项静态映射及旧 Master PRD 章节只用于追溯历史审批时点；如与当前 R2 基线冲突，以最新正式 DEC 和现行专项规格为准。

## 五、GitHub 状态

PR #6 与 PR #8 均保持 Draft / Open / Unmerged；V1 整体未 Frozen；X-01～X-13 保持 Open。
