# RWA SaaS Platform｜文档状态与决策索引

> 更新日期：2026-10-20｜性质：文档治理索引（非新的产品决策、冻结文件或研发授权）
>
> 本索引描述本工作分支的现有产品资料与已批准边界；如与冻结正文或正式决策文件有差异，以对应的已批准 DEC 及冻结文档为准。索引更新不改变其审批状态。

## 当前基线与工作边界

- 项目：从零规划、面向全球市场的多资产 RWA Tokenization ToB SaaS；独立于 WDEX，不预设代码或业务系统复用。
- 商业产品线：Issuer SaaS、White-label、Open API/SDK；配套投资者门户、平台运营端、开发者门户。优先设计 Issuer SaaS 发行工作台及核心流程。
- 当前工作分支：`docs/regulated-activity-boundaries-v01`；[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) 必须保持 Draft / Open / Unmerged，未经另行明确授权不得合并。
- [第 02 份战略 v1.0](02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)：2026-10-19 **有条件冻结**，仅战略原则基线；[冻结复核记录](02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md)。
- [第 03 份总体 PRD v0.1](03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)：2026-10-19 **Frozen（总体需求基线）**，冻结提交 `aacbd1c40d8fd41ff8b9e0fc27263b9570048ba3`；“建议纳入 V1”的候选功能不自动成为已批准的 V1 交付承诺。
- [《产品功能树与模块责任矩阵 v0.1》](03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)：2026-10-20 **Frozen（产品功能架构基线）**，批准六能力域、22 个模块、三级功能范围、责任边界及 PAY-001 稳定币认购支付优先方向；**逐功能 V1 范围、排期、技术/法律和生产启用均尚未冻结**。
- 项目仍处产品规划阶段；不构成正式开发、生产链上执行、真实资金业务、市场开放或其他受监管金融活动的授权。

## 十份核心文档登记

| 编号 | 主责任 | 当前资料与状态 |
|---|---|---|
| 01 | 竞品研究与可追溯证据 | [旧 PRD 适配审查](01-competitor-research/Legacy-PRD-Alignment-Review-v01.md) 为 Review、非冻结。Brickken 第一轮实测报告在独立 [PR #2](https://github.com/mirrorshang/rwa-saas-platform/pull/2)（Open / Unmerged），不在本分支，也未被视为正式冻结或完整实测闭环 |
| 02 | 产品定位、三条商业产品线、战略原则与未决商业假设 | [v1.0 有条件冻结](02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)；仅已明确批准的原则作为基线 |
| 03 | 总体产品需求、功能架构、详细模块 PRD 和验收要求 | [总体 PRD v0.1 Frozen](03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)；[功能树/责任矩阵 v0.1 Frozen](03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)；模块详细 PRD 尚未编制，逐功能 V1 范围待细化 |
| 04 | 跨模块流程、状态机、异常与责任 | [目录占位](04-business-workflows/)；尚未编制 |
| 05 | 多资产、投资者资格、法域规则与配置边界 | [目录占位](05-compliance/)；尚未编制，不代替法律意见 |
| 06 | 信息架构、页面交互和设计系统 | [目录占位](06-ui-ux/)；尚未编制 |
| 07 | 技术架构、数据、API、链上方案、安全和集成 | [目录占位](07-architecture/)；尚未编制 |
| 08 | 法律问题、许可及受监管活动责任清单 | [目录占位](08-legal/)；尚未编制，最终结论须经适用法域的合资格专业人士核验 |
| 09 | 商业化、套餐、计费、客户发现与运营 | [目录占位](09-commercial/)；尚未编制 |
| 10 | 分阶段研发、测试、客户交付与验收 | [目录占位](10-delivery/)；尚未编制 |

[四份历史 RWA V2 PRD 原文](00-reference-archive/README.md) 仅供参考，旧项目“已确认”不自动迁移为本项目已批准需求。

## 已批准决策索引

以下决策均须按**各自文件明确范围**适用，不能把原则批准扩大成具体实现、法律许可或上线授权。

| 决策 | 已确认范围（摘要） | 仍未由该决策确定 |
|---|---|---|
| [DEC-001](../decisions/DEC-001-independent-customer-portals.md) | 客户独立资产门户、跨发行方经授权分发 | 具体跨门户业务与实现 |
| [DEC-002](../decisions/DEC-002-customer-hierarchy-and-delivery-model.md) | Issuer SaaS、White-label V1 多发行机构但无多级代理、API 独立商业线 | 详细套餐、部署与法律职责 |
| [DEC-003](../decisions/DEC-003-multi-asset-and-initial-scope.md) | 多资产扩展设计；首批交付聚焦 1–2 类；候选类别 | 最终首发资产/金融工具 |
| [DEC-004](../decisions/DEC-004-regulated-activity-responsibility-boundaries.md) | SaaS 技术定位；受监管活动责任须依法域及合作方确定 | 具体许可、法律责任主体 |
| [DEC-005](../decisions/DEC-005-target-customer-priorities.md) | A 类持续发行机构优先，B 类白标重点跟进，C 类 API 独立拓展 | 市场规模、需求强度及付费意愿 |
| [DEC-006](../decisions/DEC-006-global-product-and-market-selection.md) | 全球标准化产品与全球客户发现，首发市场基于证据选择 | 日本、阿联酋或其他市场的优先级 |
| [DEC-007](../decisions/DEC-007-investor-identity-and-kyc-data-reuse.md) | KYC 事实与项目资格分离；跨租户复用有条件、默认隔离 | 具体数据复用机制、法律条件 |
| [DEC-008](../decisions/DEC-008-subscription-funds-settlement-and-refund-principles.md) | 认购、付款、到账、对账、配售、登记、退款分离 | 真实资金轨道、服务商、责任及启用 |
| [DEC-009](../decisions/DEC-009-v1-secondary-transfer-boundaries.md) | V1 默认无公开订单簿/撮合市场；优先研究受控转让 | 具体真实转让范围及资金/登记责任 |
| [DEC-010](../decisions/DEC-010-commercial-packaging-and-pricing-principles.md) | 三条商业线分别包装，以订阅/许可及少量计费维度为原则 | 价格、额度、SLA、实际收费与商业假设 |

第 02 份战略文档引用 DEC-001 至 DEC-010；第 03 份总体 PRD 落实各决策的总体原则，但仍需在未来模块责任矩阵和详细规格中建立逐条需求追踪关系。本索引不替代该详细追踪工作。

## 持续开放的决策门

1. 首发市场、司法辖区、经营主体及业务准入；
2. 首发 1–2 类资产/金融工具及权利结构；
3. 许可/法律责任与合格服务商、合同和资金路径；
4. 具体价格、套餐、额度、SLA 与商业可行性；
5. 产品功能架构已冻结，但 V1 **逐功能**范围、交付优先级、详细权限/流程、技术选型与实际交付计划仍待决。

当前建议的下一项产品工作：以已冻结的《产品功能树与模块责任矩阵 v0.1》为依据，推进第 04 份核心业务流程与状态机及分模块详细 PRD，并在首发资产/市场/合作方决策门下细化 V1 逐功能范围与可提前开展的 UI/UX。**冻结产品架构不等于冻结全部模块的 V1 交付范围或批准生产金融活动。**
