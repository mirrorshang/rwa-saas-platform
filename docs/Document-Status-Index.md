# RWA SaaS Platform｜文档状态与决策索引

> 更新日期：2026-10-23｜性质：文档治理索引（非新的产品决策、冻结文件或研发授权）
>
> 本索引描述本工作分支的现有产品资料与已批准边界；如与冻结正文或正式决策文件有差异，以对应的已批准 DEC 及冻结文档为准。索引更新不改变其审批状态。

## 版本治理更新与待评审材料（2026-10-23）

- [**DEC-012｜V1.0/V2.0/V3.0 版本规划方法**](../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)：**Approved（仅版本治理原则）**。V1.0 代表第一版真正承诺交付的完整功能集合，不再用 P0/P1/P2 作为当前交付范围的可选/必需判断。原187功能分级保留历史记录，不修改冻结正文。
- [**187项目标版本候选迁移表**](03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md)：**Draft / 187项具体版本未批准**。初步建议 V1.0 **140**、V2.0 **22**、V3.0 **25**；另外8个 CAND 仍是差距候选，没有增加原187数量；后续需审图+逐项版本审批。
- [**DEC-014：核心11步业务主流程对照审查通过**](../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)：**Approved（2026-10-23，仅 Step02 主流程）**，11/11覆盖企业购买SaaS、团队门户、模板与法律、合约部署、投资者KYC/钱包、认购支付、配售/持仓、募集资金结算、收益注资与Push/Claim、合法退出，v0.3的字段/技术/法域实施细则仍 Draft；不等于 V1.0 开发清单冻结。
- [**DEC-013：CR-01～10 全部选择 A**](../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)：**Approved（产品方向与版本目标，2026-10-23）**；[原A/B提案](03-product-prd/RWA-SaaS-V1.0-Complete-Loop-CR-01-10-Decision-Proposals-v0.1.md)同步 Approved。在线SaaS收费、标准 Issuer Portal、A/B受控模板、专业服务文件引用、受权Contract Factory、外部+嵌入式钱包、募集资金真实结算、收益注资与一种合法分配、A到期/B条件退出、历史187转版程序均已原则批准；**未批准逐项ID版本归属、法域/技术方案或生产操作**。
- 既有 DEC-011 受控二级转让为后续版本的已批原则保留，暂拟 V2.0，不用新治理方法自动将其移至 V3.0；White-label与商业 Open API 的完整产品交付版本仍待实际范围决策。
- 现有 [Batch 01～06](03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md)最低深度原则继续 Approved；DEC-013 十项A方向亦 Approved。**[DEC-014](../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md) 已确认 [Step02 v0.3](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md) 核心11步主流程 Approved，详细技术/异常细则 Draft**；下一步进入原187功能双向映射与新增功能批准，字段级PRD、UI、法域/技术与工程仍分别待审；PR #6保持 Draft/Open/Unmerged。

## Step 03 187项双向交叉核验（2026-10-23）

- [**187 项逐ID × 核心11步/四端主责任审核矩阵**](03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md)：**Draft（首轮纸面核验完成）**，187/187唯一码已关联并给出原名称、四端主责、业务步骤、版本候选及复核意见。标记：**106 项直接核心关联、18 项跨端底座、34 项未来版本关联、29 项需深化/边界核对**；这些均为纸面交叉审核状态，不是程序运行测试。
- [**Step03 差距、重复及XCHK-01～10原提案**](03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)：**XCHK-01～10产品原则 Approved A / 明细差距及新交付单元 Draft**，12个 D 主题、8组职责重叠、PROP-01～11建议交付单元均保留；不提前创建正式新增功能ID，也不因此更改原187总数。正式批复：[DEC-015](../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md)。
- **状态边界**：DEC-014 核心11步 Approved；DEC-013 CR-01～10 Approved；DEC-015 XCHK-01～10 全部 A Approved；Batch01～06历史原则原样保留。**V1.0/V2.0/V3.0逐行版本（建议140/22/25）和真正新ID数量仍 Draft**；真实法域/技术/资金/链签名及最终交付清单未冻结，PR#6 Draft/Open/Unmerged。

- [**V1.0/V2.0/V3.0 业务可读版本规划审查稿**](03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md)：**Draft / 待逐模块审查**。原187条按建议 V1.0 140 / V2.0 22 / V3.0 25 转换成企业实际能完成的业务清单；11组PROP去重/扩深/正式新ID未确定。V1所有必交范围仍需后续审批。
- [**DEC-015：Step03 XCHK-01～10全部A Approved**](../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md)：正式确认保留原ID、Issuer基础Portal与高级白标分开、钱包/募集结算/收益分配需独立可验收、保留金融法律及Token权威、逐模块批量版本审核。不批准技术方案或逐项版本冻结。

## 当前基线与工作边界

- 项目：从零规划、面向全球市场的多资产 RWA Tokenization ToB SaaS；独立于 WDEX，不预设代码或业务系统复用。
- 商业产品线：Issuer SaaS、White-label、Open API/SDK；配套投资者门户、平台运营端、开发者门户。优先设计 Issuer SaaS 发行工作台及核心流程。
- **[ARCH-001](../decisions/ARCH-001-api-first-unified-business-core.md)（2026-10-22 已批准）**：Issuer SaaS 首期按 API-First / Contract-First、统一服务端业务核心/API-Ready 设计；White-label 和 M16 商业 Open API 未来复用业务服务，但内部 API 不自动公开。M16 的商业交付批次仍待决定；修订后的 SCOPE-060 架构原则已确认；SCOPE-059、061、062 于后续另获明确批准，参见下方决策索引。
- 当前工作分支：`docs/regulated-activity-boundaries-v01`；[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) 必须保持 Draft / Open / Unmerged，未经另行明确授权不得合并。
- [第 02 份战略 v1.0](02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)：2026-10-19 **有条件冻结**，仅战略原则基线；[冻结复核记录](02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md)。
- [第 03 份总体 PRD v0.1](03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)：2026-10-19 **Frozen（总体需求基线）**，冻结提交 `aacbd1c40d8fd41ff8b9e0fc27263b9570048ba3`；“建议纳入 V1”的候选功能不自动成为已批准的 V1 交付承诺。
- [《产品功能树与模块责任矩阵 v0.1》](03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)：2026-10-20 **Frozen（产品功能架构基线）**，批准六能力域、22 个模块、三级功能范围、责任边界及 PAY-001 稳定币认购支付优先方向；**逐功能 V1 范围、排期、技术/法律和生产启用均尚未冻结**。
- 版本范围补充：依据 [DEC-011](../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)，V1 交易闭环聚焦一级认购，V2 规划受控转让；DEC-009 的其余安全与法律原则继续有效。
- [第 04 份流程与状态机 v0.1](04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)：2026-10-21 **Frozen（仅跨模块业务规则和状态机原则基线）**；包含 WF-01～18、INV-01～03、核心守卫及 22 个验收场景；具体枚举、实施设计与 V1 全量范围仍需细化。
- 项目仍处产品规划阶段；不构成正式开发、生产链上执行、真实资金业务、市场开放或其他受监管金融活动的授权。

## 最新执行方法与本轮文档缺口审计（2026-10-23）

产品负责人**正式认可**新的六步方法：**① Batch 04～06 业务规则收口 → ② 四端可编辑详细业务泳道图 → ③ 原 187 项功能逐项双向核验 → ④ 按端/模块/子模块/功能点建立完整清单 → ⑤ 字段级详细 PRD → ⑥ 一致性验收及正式产品冻结 → 统一 UI 设计**。不再把 Batch 01～06 的“最低交付深度原则”文档视作完整字段级 PRD。

- [**六步执行计划及标准产品文档缺口审计 v0.1**](00-governance/RWA-SaaS-Six-Step-Product-Design-Plan-and-Documentation-Audit-v0.1.md)：六步方法 **Approved**，具体文档差距/质量标准为工作基线 Draft。包括四泳道图、权限与 RACI、信息对象/字段、NFR、运营、合规、集成、验收与追踪要求。
- [**Step 02 v0.3：DEC-014核心11步业务流程已 Approved**](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)：**核心业务覆盖 Approved / Mermaid技术与字段细则 Draft**，1张L0四端总图 + 10张L1细图；新增7段通俗业务摘要。对照用户原11步全部覆盖，具体合约/钱包技术、法定权威及最终 V1.0范围未批准。
- [**Step 02 v0.2：根据企业购买SaaS至收益Claim/退出的历史11步流程草案**](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md)：**历史 Draft**，CR-01～10 当时待决，现已由 DEC-013 批准 A，后续按 v0.3审图稿，不把历史建议当成尚未批准的新决策。
- [**Step 02：四端端到端 L0/L1 业务泳道图 v0.1**](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-End-to-End-Workflow-Draft-v0.1.md)：**Draft / 待产品负责人审核**；已建立 GitHub 可编辑 Mermaid **L0 总图 + L1 五段细图**，串联 R-01～17 与 BR-01～18 异常，仍非 Frozen，未开展完整 187 ID 双向映射、UI 或实际测试。
- [**Step 01：Batch 04～06 跨端业务规则收口底稿 v0.1**](03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md)：**Draft / 待业务审核**；已列 Batch 04～06 主链路、**R-01～17 四端责任与交接、BRD-A～F 六条待审产品默认方案、BR-01～18 异常断点（Not Executed）**，不是已完成字段级 PRD；Step 02 已启动草案工作。
- 经原 187 个 ID 实际核对：**六批 Issuer 主线 164 项；M14/M15/M16 另外 23 项**的 V2/独立商业范围归属必须在 Step 03 审核，不能漏项或默认纳入 V1。
- **Batch 01～06 的最低交付深度原则均 Approved**，其中 Batch 04 [SCOPE-176～185](../decisions/SCOPE-176-185-batch04-investor-payments-registration-principles.md) 及 Batch 05 [SCOPE-186～193](../decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md) 已明确批准；**Batch 06 的 37 项 SCOPE-194～205 已批准最低产品深度原则**（[正式决策](../decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md)）；完整字段级 PRD 和真实 V1 实施范围仍 Draft。产品负责人明确要求 Batch 04～06 **延续长篇文字需求 + SCOPE 集中审批方式**；六批审核完成后才进入四端流程图、187 项核验、分端功能清单、字段级 PRD、整体冻结及 UI。A/B 187 项 Not Tested，验收卡 Not Executed；第 02～04 份 Frozen 与 PR #6 Draft/Open/Unmerged 不变。

## 十份核心文档登记

| 编号 | 主责任 | 当前资料与状态 |
|---|---|---|
| 01 | 竞品研究与可追溯证据 | [旧 PRD 适配审查](01-competitor-research/Legacy-PRD-Alignment-Review-v01.md) 为 Review、非冻结。Brickken 第一轮实测报告在独立 [PR #2](https://github.com/mirrorshang/rwa-saas-platform/pull/2)（Open / Unmerged），不在本分支，也未被视为正式冻结或完整实测闭环 |
| 02 | 产品定位、三条商业产品线、战略原则与未决商业假设 | [v1.0 有条件冻结](02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)；仅已明确批准的原则作为基线 |
| 03 | 总体产品需求、功能架构、详细模块 PRD 和验收要求 | [总体 PRD v0.1 Frozen](03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)；[功能树/责任矩阵 v0.1 Frozen](03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)；[全模块逐功能清单与 V1 范围建议 v0.1](03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md) 为 **Draft**，已分解 22 模块/187 项建议；SCOPE-001～058 已确认：五批 187/187 项范围定位（P0 125、P1 21、P2 21、V2 6、批次待定 14），以及 SCOPE-053～058 的最小实现/条件性 P1 复核原则；V1 真实必交清单仍需另行评审，完整 V1 交付范围未冻结，真正字段级详细 PRD 尚未完成（Batch 01～06 最低深度原则已批准；Step 02 四泳道图仍需正式评审）；[《V1 最小交付功能建议与未决决策门 v0.1》](03-product-prd/RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md) 已建立 **Draft**（187 项逐项最小实现提案和 G-01～G-07 未决门），新增实现建议尚未批准；依 ARCH-001 已增加 API-Ready/共用业务核心约束；SCOPE-059/061/062 已确认 White-label 独立里程碑、持续购买优先、冻结 V1 功能前选 1～2 类参考 Instrument；不等于商业 Open API 同期交付；[《Issuer V1 五类交付候选分组 Draft》](03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md) 已建立，187 项全部分类供评审（非已批准交付范围）；[《Issuer V1 73+42 功能交叉审核》](03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md) 的 SCOPE-063～070 核心/页面复用原则**已批准**（具体交付仍 Draft）；[《10 项外部执行专项审核》](03-product-prd/RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md) 的 SCOPE-071～077 原则**已批准**（服务商/法域责任及具体实现仍未决定）；[《16 项条件性 P1 必需性审核》](03-product-prd/RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md) 的 **SCOPE-078～085 必要性原则已批准**；[《最后 46 项非默认交付候选审核》](03-product-prd/RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md) 已完成，**SCOPE-086～095 的非默认 Issuer 首期交付边界获批准**；187/187 项五类分类审核原则均已确认，实际 V1 开发范围仍 Draft，须先选 1～2 类参考 Instrument |
| 04 | 跨模块流程、状态机、异常与责任 | [《核心业务流程与状态机 v0.1》](04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md) **Frozen（2026-10-21，跨模块流程与状态机原则基线）**；覆盖 WF-01～WF-18、INV-01～03、转换/权限/异常原则和 22 个业务验收场景；具体状态代码、法域/资产、技术及完整 V1 交付未冻结 |
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
| [DEC-011](../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md) | **V1 一级发行认购优先；V2 才规划受控转让产品**，保留 V1 必要 Token 转让限制。明确取代 DEC-009 中“建议 V1 交付转让工作流”的时间安排 | V2 详细功能/排期、首发工具下 V1 合约限制方案 |
| [ARCH-001](../decisions/ARCH-001-api-first-unified-business-core.md) | API-First / Contract-First、Issuer SaaS V1 API-Ready、共享业务服务复用于未来 White-label/Open API；修订的 SCOPE-060 架构原则获批准 | 商用 Open API/M16 的具体上线批次、架构实现技术选型 |
| [SCOPE-059、061、062](../decisions/SCOPE-059-062-issuer-v1-delivery-and-validation-decisions.md) | White-label 完整商业产品独立里程碑（不强制同期、非自动 V2）；Issuer V1 持续购买优先完整支持，集中募集依首发工具；通用 PRD 先行、V1 功能冻结前选 1～2 类参考 Instrument | White-label/API 实际日期、集中募集条件性必需范围、参考 Instrument 具体选择、首发法域/资金/登记责任 |
| [SCOPE-063～070](../decisions/SCOPE-063-070-core-ui-cross-module-simplification.md) | 已批准 115 项 P0 核心与简化界面的两轴复核、唯一业务权威、统一规则/任务/报表及 API-First，UI 按三类使用端/15 个逻辑页面群规划 | 具体 UI/接口和真实交付清单未冻结；10 项外部执行与 16 项条件性 P1 继续审查 |
| [SCOPE-071～077](../decisions/SCOPE-071-077-external-execution-authority-controls.md) | 已批准 10 项 P0 外部部署、Mint、付款事实观察、退款、法定登记与电子签证据的授权/独立核验/Unknown 幂等和审计控制 | 外部执行法律责任主体、服务商/链/接口、安全技术选型及 V1 真实交付清单未冻结 |
| [SCOPE-078～085](../decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md) | 已批准 16 项 P1 的条件性最低能力规则：连续购买优先、募集/赎回/收益/通知按首发工具判定；基本资金异常调查、强制规则优先级及必要数据交接不得删除 | 1～2 类参考 Instrument/法域/法定权利和真实 V1 实施深度尚待决定 |
| [SCOPE-086～095](../decisions/SCOPE-086-095-nondefault-issuer-v1-scope-and-product-milestones.md) | 已批准最后 46 项非默认 Issuer 核心首期交付的排除/独立商业里程碑口径（P1 5/P2 21/V2 6/White-label+API 批次待定 14）；五类 187 项均完成审核原则确认 | 真实 V1 交付清单与商业产品线具体交付批次、参考 Instrument/首发法域/适格主体仍未冻结 |
| [SCOPE-096～100](../decisions/SCOPE-096-100-reference-instrument-validation-selection.md) | 已批准两类产品需求验证样本：A 固定收益到期债权型；B SPV 股份或类似权益型，均遵循 ARCH-001 共享业务核心；187 项 A/B 验证底表已建立 | 全部 187 项仍 Not Tested；真正首发 Instrument/市场与法域法律权利、资金/登记/签名责任、实际 V1 功能交付冻结均待评审 |

第 02、03 份冻结正文形成时引用 DEC-001 至 DEC-010，**不因新增 DEC-011 而追溯改写**。DEC-011 作为后续已明确批准的版本范围决策，仅就 V1/V2 受控转让交付安排覆盖 DEC-009 原 V1 建议。第 04 份 v0.1 已经产品负责人选择 A，冻结为跨模块业务流程与状态机**原则基线**；具体实现、法域及产品功能交付范围仍保留后续决策门。**新增 ARCH-001 不追溯改写已冻结文档或原有 DEC**；本索引不替代细化追踪工作。

## Instrument 权利体系与长期扩展（家族原则 Approved / 实施 Draft）

- [《Instrument 权利类型体系与多资产扩展边界 v0.1》](03-product-prd/RWA-SaaS-Instrument-Families-and-Extensibility-Boundaries-v0.1.md)：**SCOPE-101～108 家族体系与边界原则已批准**；A/B 产品样本继续有效，C/D/E 不默认纳入 Issuer V1 专有业务开发；实际法域/资金/登记/托管主体尚待审批。
- [《C/D/E 扩展类型与现有 187 项功能缺口评估》](03-product-prd/RWA-SaaS-CDE-Instrument-Extension-Gap-Assessment-v0.1.md)：**原始 Audit / Draft**，22 模块交叉映射及 18 条临时 GAP 缺口，不产生正式 Mxx-Fxxx 功能或 V1 研发承诺。
- [《C/D/E 18 项缺口交叉审核》](03-product-prd/RWA-SaaS-CDE-18-Gaps-Formal-Product-Review-v0.1.md)：**SCOPE-109～116 审核原则已批准**，18 项按 9 项共享扩展、9 项未来专有能力归档为长期参考基线；没有新增正式 ID、C/D/E 产品生产支持或 V1 研发授权。

| [SCOPE-101～108](../decisions/SCOPE-101-108-instrument-families-and-extensibility.md) | 已批准 A 债权/B 实体权益/C 基金份额/D 合同收入参与/E 特定资产权属五类长期产品能力家族，权利与资产/Offering/Token 分层建模，ARCH-001 共用业务核心 | C/D/E 具体产品化、商用排期、法律分类/服务商责任、真实 V1 必交清单及 18 条 GAP 的实施优先级仍待决定 |
| [SCOPE-109～116](../decisions/SCOPE-109-116-cde-extension-gap-review.md) | 已批准 18 项 C/D/E 扩展缺口长期参考归档：9 项现有配置/集成复用、9 项未来专有业务，涉及基金 NAV/申赎、收入/版税结算及托管储备/实物交付等 | 不增加正式功能编号或 V1 研发范围；下一阶段回到 A/B 产品需求验证，具体法域及生产责任主体仍未冻结 |

## A/B 参考 Instrument 产品验证（样本选定 Approved / 实际验证 Draft）

- [《样本 A 债权型 Instrument 参数与端到端业务规则审核 v0.1》](03-product-prd/RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)：**SCOPE-117～125 产品验证原则已批准**；A1/A2 债权构型、Instrument 字段、11 个流程节点、16 个 **Not Executed** 审核案例。计息精确规则、真实法律效力及生产测试未完成。
- [SCOPE-117～125 正式决策记录](../decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md)：批准固定收益到期债权的 A1 同 Series 验证、财务/法定登记/Token 分离、票息与还本业务闭环，未批准实际开发与生产。
- [《债权 A1 计息、偿付及异常状态专项验证 v0.1》](03-product-prd/RWA-SaaS-Debt-A1-Coupon-Maturity-and-Exception-Validation-v0.1.md)：**SCOPE-126～133 专项产品原则已批准**；A-D01～D12 全部 Not Executed、具体合法算法与实施深度仍 Draft。
- [SCOPE-126～133 债权 A1 正式决策](../decisions/SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md)：已批准同权增发、晚入场价格/应计利息、Coupon 与本金实际支付/登记/Token 独立核验及受权恢复。
- [《样本 B：SPV 股份与实体权益产品验证 v0.1》](03-product-prd/RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md)：**SCOPE-134～142 产品原则已批准**；B-T01～T16 仍 Not Executed，公司授权、稀释、权益名册及条件分红具体实施仍 Draft。
- [SCOPE-134～142｜B 实体权益产品正式决策](../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md)：已批准 B 权利类别、法定公司决议/发行额度、法定名册与 Token 的权威分离、分红和合约限制原则。
- [《A/B 187 项功能必要性与 V1 冻结决策门交叉对照 v0.1》](03-product-prd/RWA-SaaS-AB-187-Function-Need-and-V1-Freeze-Gates-Review-v0.1.md)：**SCOPE-143～151 产品审核原则已批准**；逐 ID 对照与 16 条 P1 仍缺少真实法域/执行者/实施深度，A/B 187 项全部 Not Tested。
- [SCOPE-143～151 正式决策记录](../decisions/SCOPE-143-151-AB-scope-comparison-and-v1-freeze-gates.md)：Approved；统一 API-First、条件性 P1 分类及 V1 六项冻结前置门。
- [《Issuer V1 逐功能交付深度六批审核路线 v0.1》](03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md)：**Product Plan / Draft**，先做客户购买 SaaS、租户和组织权限，再做 Instrument/Offering、认购资金/登记、Token 与存续期。
- [《Batch 01：M01～M03 商业开通/Tenant/组织权限交付深度 v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-01-Commercial-Tenant-Access-v0.1.md)：**SCOPE-152～159 的最低产品交付原则 Approved，具体 UI 与工程仍 Draft**；22 个功能 ID（P0 17/P1 2/P2 3）、22 个 B01 案例 Not Executed；在线订阅和企业 SSO 不默认 V1。
- [SCOPE-152～159｜商业开通及角色权限正式决策](../decisions/SCOPE-152-159-batch01-commercial-tenant-access-depth.md)：**Approved（2026-10-22）**；Batch 01 原则已确认，后续按“完整 PRD 后统一 UI”推进。

- [《Batch 02：M04/M06 Asset、Instrument 与法律文件/专业审核详细 PRD v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-02-Asset-Instrument-Documents-Review-v0.1.md)：**SCOPE-160～167 产品最低交付原则 Approved**；17 个原功能 ID（P0 13/P1 2/P2 2），B02-01～17 全部 Not Executed；具体技术/UI/法域仍 Draft。
- [Batch 02 正式批准决策 SCOPE-160～167](../decisions/SCOPE-160-167-batch02-asset-instrument-documents-review.md)：产品最低交付深度原则 Approved，不代表完整 V1 或真实测试。
- [《Batch 03：M05/M19 Project/Offering 发行规则与发布审核详细 PRD v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-03-Project-Offering-Rules-Publishing-Review-v0.1.md)：**SCOPE-168～175 产品原则 Approved**；M05/M19 19 项（P0 15/P1 2/P2 2）、B03-01～19 仍 Not Executed。
- [SCOPE-168～175｜Batch 03 正式产品决策](../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md)：已批准 Project 1:N Offering、合法销售模式、发布前置与规则版本化原则。
- [《Batch 04：M08～M12 投资者准入、认购/USDT/USDC 资金与法定登记需求 v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-04-Investor-Eligibility-Subscription-Payment-Registration-v0.1.md)：**SCOPE-176～185 最低深度原则 Approved**，50 项（P0 41/P1 5/P2 4）、50 个 B04 案例 Not Executed，完整字段/实现仍 Draft。
- [Batch 04 正式批准决策 SCOPE-176～185](../decisions/SCOPE-176-185-batch04-investor-payments-registration-principles.md)：十项产品原则 Approved，资金/登记/Token 权威分离。
- [《Batch 05：M07/M22 Token、合约及外部受权执行需求 v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-05-Token-Contracts-External-Execution-v0.1.md)：**SCOPE-186～193 最低产品深度原则 Approved（2026-10-23）**，19 项（P0 16/P1 1/P2 2）、B05-01～19 均 Not Executed；字段级实现、V1 完整交付范围仍 Draft。
- [Batch 05 正式决策 SCOPE-186～193](../decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md)：**Approved**，保留链上 Token、M12 登记、M11 资金与合法执行授权的独立权威；真实 Mint、法律许可和测试仍未确认。
- [《Batch 06：M13/M17/M18/M20/M21 存续期、异常、通知、审计与报表需求 v0.1》](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-06-Lifecycle-Workflows-Notifications-Audit-Reports-v0.1.md)：**SCOPE-194～205 最低产品深度原则 Approved（2026-10-23）**，37 项（P0 23/P1 9/P2 5），B06-01～37 均 Not Executed；具体字段、法域、技术及真实实施仍 Draft。
- [Batch 06 正式决策 SCOPE-194～205](../decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md)：**Approved（2026-10-23，仅最低产品深度原则）**；原 ID 和 P0/P1/P2 分级不变，37 张 B06 案例全部 Not Executed，Issuer V1 真正实施范围仍 Draft。
- [仓库产品总览 README](../README.md)：面向技术/运营介绍产品结构、22 模块具体功能、版本规划与当前需求进度；每批确认/冻结后同步维护。

## 持续开放的决策门

1. 首发市场、司法辖区、经营主体及业务准入；
2. 真实首发资产/金融工具、发行法域及法律权利结构；A/B 两类参考 **产品验证样本已选定**，不等于实际发行工具已确定；
3. 许可/法律责任与合格服务商、合同和资金路径；
4. 具体价格、套餐、额度、SLA 与商业可行性；
5. 产品功能架构已冻结，但 V1 **逐功能**范围、交付优先级、详细权限/流程、技术选型与实际交付计划仍待决。

[《V1 参考 Instrument 选样与功能验证方案》](03-product-prd/RWA-SaaS-Reference-Instrument-Validation-Proposal-v0.1.md) 的 A/B 选样已获 **SCOPE-096～100** 批准；[《A/B 187 项功能验证底表》](03-product-prd/RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md) 已建立 **Draft / 187 项 Not Tested**，不是已获得法律认可或真实 V1 交付冻结。

**当前工作进度（2026-10-23）**：**Batch 01～06最低深度原则、DEC-012版本方法、DEC-013 CR-01～10产品方向、DEC-014核心11步业务主流程、DEC-015 XCHK-01～10缺口处理原则全部 Approved**。**Step 03 首轮187/187纸面交叉审查完成，已生成V1.0/V2.0/V3.0业务可读版本规划草案**；11组PROP拆分/扩深/是否新正式ID、187逐项归属、字段级PRD和最终V1范围未冻结。接着按模块确认版本与PROP处理→Step04分端功能清单→Step05字段级PRD→Step06全局冻结→统一UI。A/B187项Not Tested，案例Not Executed，无软件研发/真实资金或链上操作；PR#6 Draft/Open/Unmerged。
