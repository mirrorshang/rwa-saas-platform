# RWA SaaS Platform

独立于 WDEX、从零规划的**面向全球机构客户、标准化且可配置的多资产 RWA Tokenization SaaS**。本仓库当前用于研究、产品规划、UI/UX 设计与产品资料治理；**尚未授权正式业务代码开发或真实金融业务上线**。

## 产品定位与交付

- **Issuer SaaS**：优先规划发行机构工作台及从资产/金融工具准备、Offering、投资者准入和认购到发行后存续期的核心业务能力，配套基础投资者门户。
- **White-label**：V1 目标模式为一个白标运营商管理多家获授权的发行机构，提供自有品牌门户；不包含多级代理/转售层级。
- **Open API / SDK**：独立商业交付线；依据 [ARCH-001](decisions/ARCH-001-api-first-unified-business-core.md)，Issuer SaaS V1 采用 API-First / Contract-First、统一服务端业务核心（API-Ready），让未来 White-label/Open API 复用业务能力；商用 API 对外开放、开发者门户、SDK/Sandbox 与实际交付批次仍须独立批准。
- **平台级配套**：运营管理端、开发者门户、租户/权限、安全、审计与服务商集成等。

客户独立管理获授权的资产与投资者门户；不默认建设 SaaS 厂商自营的全球投资者聚合市场或公开二级交易市场。投资者原则上由发行方自行拓展，具体受监管活动责任以实际业务、法律意见及合作安排为准。

**市场原则（DEC-006）**：全球化产品设计、全球客户发现，首批市场由可追溯证据选择。日本与阿联酋仅为候选研究市场，并无已批准的优先级。首发资产/金融工具、具体价格/套餐/SLA、法律许可与资金责任仍为独立决策门。

## 当前阶段与已确认基线

- [第 02 份《产品战略与商业模式》](docs/02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)：**v1.0 有条件冻结**（2026-10-19），仅已批准的战略原则基线。
- [第 03 份《总体产品需求 PRD》](docs/03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)：**v0.1 Frozen**（2026-10-19），仅总体产品需求基线；“建议纳入 V1”不代表所有候选功能均已获准交付。
- [DEC-001 至 DEC-011](decisions/)：各自经批准的产品原则与未决边界。新增 [DEC-011](decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md) 明确 V1 一级认购优先、V2 规划受控转让；保留 DEC-009 原有安全与法律原则。
- [《产品功能树与模块责任矩阵 v0.1》](docs/03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)：**Frozen（产品功能架构基线，2026-10-20）**；确认六大能力域、22 个逻辑模块、核心责任、PAY-001 稳定币支付方向。**逐功能 V1 范围、排期和开发授权仍待后续确认。**
- [第 04 份《核心业务流程与状态机 v0.1》](docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)：**Frozen（跨模块业务流程与状态机原则基线，2026-10-21）**；已确认 WF-01～18、必要状态分离与守卫、权限/额度/异常原则及业务验收目标。**具体状态代码、法域/资产条款、技术实施与完整 V1 逐功能范围未冻结。**
- [《22 模块逐功能清单与 V1 范围建议 v0.1》](docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)：**Draft（187 项功能建议）**，SCOPE-001～SCOPE-008 范围原则已确认，SCOPE-009～SCOPE-052 已确认全部 187/187 项范围定位（P0 125、P1 21、P2 21、V2 6、批次待定 14），SCOPE-053～SCOPE-058 已确认最小实现原则；V1 真实必交范围仍未冻结，完整 V1 交付范围未冻结，不构成完整 V1 交付承诺。
- [《V1 最小交付功能建议与未决决策门 v0.1》](docs/03-product-prd/RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md)：**Draft（187 项功能的最小实现建议、G-01～G-07 决策门）**；仅建议实施形式及权责边界，尚未通过功能级交付批准。
- [ARCH-001｜统一业务核心 API-First 架构原则](decisions/ARCH-001-api-first-unified-business-core.md)：**Approved（2026-10-22）**。修订后的 SCOPE-060 确认 Issuer SaaS V1 即 API-Ready、对外 Open API 的商业交付独立排期；SCOPE-059、061、062 已在后续单独确认，参见下列正式决策。本决策不等于第 07 份技术方案冻结或正式研发授权。
- [SCOPE-059、061、062｜V1 交付与工具验证决策](decisions/SCOPE-059-062-issuer-v1-delivery-and-validation-decisions.md)：**Approved（2026-10-22）**；White-label 不强制与 Issuer V1 同期、独立里程碑；持续购买 V1 优先完整支持；通用 PRD 先行且冻结 V1 功能前选 1～2 类具体参考 Instrument。M15/M16 商业发布时间、真实首发法域仍未确定。
- [《Issuer SaaS V1 五类交付候选分组 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md)：**Draft（187 项全覆盖）**，按共享核心开发、共享界面简化、外部受权执行、条件性必需、暂不计入 Issuer 首期五类提出可审查的建议；M15/M16 独立商业产品上线批次仍待定，未获功能级交付批准。
- [《Issuer SaaS V1 73+42 项交叉审核 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md)：**Audit / Draft**，已审计 115 项 P0 候选、8 类跨模块边界与 15 个逻辑页面群，SCOPE-063～070 **已批准跨模块与共享 UI 规划原则**，但尚未冻结实际 UI 页面、接口或开发清单；没有更改既有范围等级。
- [SCOPE-063～070｜核心与共享 UI 审核决策](decisions/SCOPE-063-070-core-ui-cross-module-simplification.md)：**Approved**；统一租户、资格、金融权威事实及 API-First 复用；15 个页面群不是页面/路由冻结。
- [《10 项受权外部执行与权威核验审核 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md)：**Audit/Draft**，针对 M07/M11/M12/M22 全部 10 项，**SCOPE-071～077 安全和权威责任原则已批准**；具体执行主体、外部服务商和实现方案仍待审核。
- [SCOPE-071～077｜外部执行与权威事实控制决策](decisions/SCOPE-071-077-external-execution-authority-controls.md)：**Approved**。外部合法执行/观察与 SaaS 的受控请求、审计及独立事实核验分离；不可因 API-First 绕开退款、Token、登记的高风险守卫。
- [《16 项条件性 P1 必需性专项审核 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md)：**Audit**，**SCOPE-078～085 已批准判断原则**；需通过 1～2 类参考 Instrument 核实实际 V1 必交项目。
- [SCOPE-078～085｜条件性 P1 最低必要控制决策](decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md)：**Approved**，16 项不自动全量纳入开发；基础资金异常、规则优先级和必要数据移交不能删减。
- [《最后 46 项非默认 Issuer 首期候选审核 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md)：**Audit/Draft**，覆盖 P1 5/P2 21/V2 6/White-label & Open API 批次待定 14，SCOPE-086～095 的非默认 Issuer 核心首期边界**已批准**；White-label/Open API 实际商业发布批次尚未决定，V1 交付范围仍 Draft。
- [SCOPE-086～095｜46 项非默认 Issuer 首期交付范围决策](decisions/SCOPE-086-095-nondefault-issuer-v1-scope-and-product-milestones.md)：**Approved**，确认分类审查完成但不等于真实 V1 功能冻结。
- [《V1 参考 Instrument 选样与功能验证提案 v0.1》](docs/03-product-prd/RWA-SaaS-Reference-Instrument-Validation-Proposal-v0.1.md)：**A/B 样本选样已获 SCOPE-096～100 批准**，样本 A 为固定收益到期债权型，B 为 SPV 股份或类似权益型；实际法域/真实发行工具仍待定。
- [SCOPE-096～100｜参考 Instrument 选样决策](decisions/SCOPE-096-100-reference-instrument-validation-selection.md)：**Approved（2026-10-22）**，两类样本只用于需求验证，不批准真实发行或 V1 最终范围冻结。
- [《A/B 参考 Instrument 187 项功能验证底表 v0.1》](docs/03-product-prd/RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md)：**Draft / 187 项均 Not Tested**；待分别验证 A/B 业务闭环、必要权利、条件性 P1 及独立权威事实。
- [《样本 A 债权型 Instrument 参数与端到端业务规则审核 v0.1》](docs/03-product-prd/RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)：**Product Scenario / Draft**，包含 A1/A2 连续购买与到期规则、债权参数、11 个业务节点、16 张未执行的场景审核卡及 **SCOPE-117～125 待批准**；未授权真实发行或冻结 V1。
- [《Instrument 权利类型体系与多资产扩展边界 v0.1》](docs/03-product-prd/RWA-SaaS-Instrument-Families-and-Extensibility-Boundaries-v0.1.md)：**长期五类家族与扩展原则已批准**；C/D/E 目前仅规划可扩展权利模型，不新增 V1 开发承诺。
- [SCOPE-101～108｜Instrument 权利类型与扩展边界决策](decisions/SCOPE-101-108-instrument-families-and-extensibility.md)：**Approved（2026-10-22）**；五类产品家族不等于全球法定类别，A/B 验证与 187 项优先级仍有效。
- [《C/D/E 权利类型扩展与功能缺口评估 v0.1》](docs/03-product-prd/RWA-SaaS-CDE-Instrument-Extension-Gap-Assessment-v0.1.md)：**原始 Audit / Draft**；22 模块映射及 18 项候选 GAP，尚不作为正式功能 ID、开发或上市承诺。
- [《C/D/E 18 项缺口正式交叉审核 v0.1》](docs/03-product-prd/RWA-SaaS-CDE-18-Gaps-Formal-Product-Review-v0.1.md)：**SCOPE-109～116 产品审核原则已批准**，9 项共享配置/集成扩展及 9 项未来专有业务；作为长期参考，不增加 V1 开发承诺。
- [SCOPE-109～116｜C/D/E 扩展缺口审核决策](decisions/SCOPE-109-116-cde-extension-gap-review.md)：**Approved（2026-10-22）**；C/D/E 扩展阶段已收口，未来专用系统与法律责任仍须另审。
- **下一步产品工作**：先审核样本 A 债权型参数和业务规则（SCOPE-117～125，尤其 Series/利息/持续购买兼容）；然后验证样本 B 权益型差异，核对 187 项触发条件、权威证据与最低实现路径；评审 P0 实现深度、首发 Instrument 必需 P1 及 White-label/API 商业交付批次；完成范围冻结评审后再编制 Issuer SaaS 核心模块**详细功能 PRD**，逐步明确页面、字段、状态和验收。正式开发授权仍需另行批准。
- **尚未完成**：第 05～10 份核心规格、模块详细 PRD、第 04 份具体工具/法域实施细化及 V1 逐功能范围。产品基线冻结、前端演示开发、正式业务研发和生产启用是不同审批节点。

详见 **[文档状态与决策索引](docs/Document-Status-Index.md)**，其中包含十份核心文档进度、决策链接、未决事项及研究资料来源。

## 研究资料与分支

- 竞品核心参考为 Brickken，但竞品事实、产品建议和已批准我方需求必须区分。当前分支包含[历史 PRD 适配审查](docs/01-competitor-research/Legacy-PRD-Alignment-Review-v01.md)。
- Brickken Sandbox 第一轮交互审计存放在独立的 [PR #2](https://github.com/mirrorshang/rwa-saas-platform/pull/2)，该 PR **尚未合并**；其 23 个页面/视图访问记录不等于完整发行闭环实测。
- 当前产品文档工作分支：`docs/regulated-activity-boundaries-v01`；[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) 继续保持 **Draft / Open / Unmerged**，未经用户单独授权不得合并。
- 历史 RWA V2 PRD 仅保存在 [参考归档](docs/00-reference-archive/README.md)，不作为本项目冻结需求。

## 目录

- `docs/00-reference-archive/`：历史参考资料
- `docs/01-competitor-research/`：竞品研究
- `docs/02-product-strategy/`：产品战略
- `docs/03-product-prd/`：总体及后续模块详细 PRD
- `docs/04-business-workflows/`：流程与状态机
- `docs/05-compliance/`：多资产及合规规则
- `docs/06-ui-ux/`：UI/UX 与设计系统
- `docs/07-architecture/`：后续技术架构、数据、链上与集成；遵循已批准 ARCH-001 原则，具体工程技术栈待定
- `docs/08-legal/`：法律/许可/责任研究
- `docs/09-commercial/`：商业化与运营
- `docs/10-delivery/`：研发、验收与交付计划
- `decisions/`：已批准产品决策记录
- `prototypes/`：后续原型
- `tasks/`：后续任务

详细交付及协作纪律见 [AGENTS.md](AGENTS.md)。本文是导航与阶段说明，不能替代正式批准的决策与冻结文档。
