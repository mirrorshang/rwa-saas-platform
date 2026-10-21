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
- [《Issuer SaaS V1 73+42 项交叉审核 v0.1》](docs/03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md)：**Audit / Draft**，已审计 115 项 P0 候选、8 类跨模块边界与 15 个逻辑页面群，提出 SCOPE-063～070 **待批准建议**；没有更改既有范围等级或宣布 V1 冻结。
- **下一步产品工作**：审核 V1 最小交付功能清单及未决决策门，评审 P0 实现深度、首发 Instrument 必需 P1 及 White-label/API 商业交付批次；完成范围冻结评审后再编制 Issuer SaaS 核心模块**详细功能 PRD**，逐步明确页面、字段、状态和验收。正式开发授权仍需另行批准。
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
