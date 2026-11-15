# RWA SaaS｜GitHub 文档清理记录（2026-11-12）

> 执行分支：`docs/r2-current-product-baseline`（PR #8）。本次仅清理当前分支文件树；不合并 PR #8，不修改 PR #6，不修改 Frozen、DEC、ARCH、SCOPE 或原 193 项首次交付版本归属记录。

## 清理原则

- 删除已被现行 V1 产品基线、专项 UI-Ready 规格和最新审计明确取代的旧工作稿、重复 PRD 与过期审计。
- 保留 DEC-001～083、ARCH、全部 SCOPE、四份 Frozen、原始 187 项功能源账、193 项正式版本归属主表及其审批证据、六批业务原则、必要参考资料。
- 当前 V1 口径以 157 项 V1 产品基线及专项规格为准；全版本追踪 204 项（V1 157 / V2 22 / V3 20 / TBD 5）。
- 删除旧 187 项版本迁移 Draft；V2/V3 依据回归 DEC-017、DEC-057 及后续正式决策，不从旧 Draft 推断或改写。
- 删除仅作用于当前分支最新树；Git 历史仍可追溯被删除文件。

## 逐文件删除清单

| # | 文件路径 | 删除原因 | 引用检查与处理 |
|---:|---|---|---|
| 1 | `docs/02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md` | 早期冻结准备检查表；已由正式战略基线、DEC 与现行 V1 产品基线承接。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 2 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md` | 旧 P1 候选审计；与现行 V1-only 范围及最新 157 项映射口径不一致。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 3 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md` | 早期核心/共享 UI 审计；已由现行页面规格、全局一致性及端到端审计取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 4 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md` | 旧交付候选分类；现行 V1 范围与版本依据已更新。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 5 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md` | 旧批次推进路线；当前模块已逐一 UI-Ready 收口，路线已失效。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 6 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md` | 旧外部执行责任审计；最新生产准入边界由现行基线与端到端审计承接。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 7 | `docs/03-product-prd/RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md` | 旧 46 项非默认功能排除审计；不再作为 V1 功能范围入口。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 8 | `docs/03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md` | 旧阶段收口工作稿；相关业务原则已进入正式 SCOPE 与六批成果。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 9 | `docs/03-product-prd/RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md` | 旧最小交付范围草案；已由当前 157 项 V1 基线及独立生产准入门取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 10 | `docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md` | 旧版扩展流程草稿；保留现行 v0.3 与 Frozen 状态机原则作为有效入口。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 11 | `docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-End-to-End-Workflow-Draft-v0.1.md` | 早期端到端流程草稿；已由现行流程基线与端到端产品审计取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 12 | `docs/03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md` | 旧 187 项 V1/V2/V3 迁移 Draft；与现行 204 项追踪口径不符，已明确批准删除。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 13 | `docs/03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md` | 旧 146 项四泳道静态审计；已由 157 项功能双向映射及当前全局/端到端审计取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 14 | `docs/03-product-prd/RWA-SaaS-Step-06-09-Four-Surface-IA-Page-Inventory-Draft-v0.1.md` | 旧四端 104 页面候选清单；已由后续五端架构及现行页面导航覆盖审计取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 15 | `docs/03-product-prd/RWA-SaaS-Step-06-09A-V1-146-Function-to-Page-Coverage-Audit-Draft-v0.1.md` | 旧 146 项功能页面映射；已由现行 157 项逐 ID 双向映射取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 16 | `docs/03-product-prd/RWA-SaaS-Step-06-09B-Issuer-IA-61-Page-Consistency-Audit-Draft-v0.1.md` | 旧 61 页面 IA 审计；已由现行九个一级导航、23 个二级入口及页面覆盖审计取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 17 | `docs/03-product-prd/RWA-SaaS-Master-Product-PRD-Development-Handoff-Draft-v0.1.md` | 早期 Master PRD 汇编稿；与当前权威架构、V1 范围总表和专项 UI-Ready 文档重复且部分口径过期。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |
| 18 | `docs/03-product-prd/RWA-SaaS-Master-Product-PRD-Development-Handoff-Draft-v0.2.md` | 后续旧 Master PRD 汇编稿；已由当前产品总体架构、V1 范围与专项规格取代。 | 现行 README / 文档状态索引 / 权威索引中的引用将改为清理说明；未发现需要保留为 DEC/Frozen/版本主账依据的直接引用。 |

## 保留的关键权威资料

- `decisions/` 下 DEC-001～083、ARCH-001 与全部 SCOPE：保留。
- 四份 Frozen：战略与商业模式、总体产品需求、功能树与模块责任、核心业务流程与状态机：保留原文。
- `RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md`：原 187 项历史功能源账保留。
- `RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md`：193 项首次交付版本归属主表保留；DEC-017 正式批准证据保留。
- `RWA-SaaS-Step-03-193-Function-Final-Release-Review-Proposal-v0.1.md` 与 `RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md`：DEC-017 引用的历史审批材料保留。
- 六批已批准业务原则、Step02 当前 v0.3、现行五端 125 页面候选参考、M23/M24 交叉表、现行 R2/V1 基线、157 项映射、全局一致性及端到端审计：保留。
- 旧字段/API 技术工作稿及法域研究稿：本轮不删除；它们不是当前 UI-Ready 权威，但仍可能作为后续工程/合规参考。

## 引用检查结论

- 已检查根 README、`docs/Document-Status-Index.md`、现行文档权威索引，以及 DEC-016/017/028/035/036/037/057/058/069/080/083 等相关决策文件中的直接引用。
- 旧 Master PRD、旧 146 项审计和旧 Step06 页面映射在入口文件中存在引用；清理前先将其改为纯文本清理记录，不留下失效 Markdown 链接。
- DEC-017 对 193 项正式版本审批材料的引用不删除；DEC-035～037 对仍保留的字段/资金工作稿引用不删除。
- 本次不宣称对外部 URL、历史 commit 中的旧链接或所有非 Markdown 引用进行全仓语义审计。

## 执行状态

- **执行完成**：18/18 个文件已从当前分支文件树删除；对应清理提交：`0a3f6a405c8087ab0089bdc6c83e4c6bca19d011`。
- **文件树复查**：18 个目标路径均已不存在；README、文档状态索引、权威索引、R2 当前基线索引均存在。上述四个入口的相对 Markdown 链接检查均为 0 个缺失目标。
- PR #8 必须保持 Draft / Open / Unmerged；PR #6 必须保持 Draft / Open / Unmerged。