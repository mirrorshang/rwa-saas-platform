# RWA SaaS｜Step 03.5 全仓产品文档治理审计与整理建议 v0.1

> **Audit Only / Draft — 2026-10-23。首轮只读审查及处理建议，不是文档冻结或删除授权。** 快照：私有仓库 `mirrorshang/rwa-saas-platform`，分支 `docs/regulated-activity-boundaries-v01`，检视起始提交 `44025fca5dce189f11109d2d37292e0e24cc2c78`；本文件为该分支**唯一新增的审计报告**，除报告外不修改、移动、覆盖、删除任何现有文件，也不合并 [PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)。
>
> **用户批准的工作方法**：暂停 Step 03 的版本审批，先审现有文档、权威源、旧版本、重复/冲突和到 UI 前的缺口；首轮先交审核报告，**第二轮整理需产品负责人另行确认具体动作**。现有 [DEC-012 版本管理](../../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)、[DEC-013 十项产品方向](../../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)、[DEC-014 十一步业务主流程](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)、[DEC-015 XCHK十项处理原则](../../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md)均已批准，仅批准其各自明确范围。
>
> **注意**：这轮检查了仓库树上 **95/95 文件清单**、**81 份 Markdown 的可识别普通相对 Markdown 链接目标**（未发现缺失的仓库内相对文件/目录目标；**不代表绝对 GitHub URL、锚点、外部网站及原文语义全部验证通过**），对重点冻结基线、版本规划、流程图、187条矩阵、六批需求和决策证据作结构/状态/交叉内容审计。**本轮尚非所有81篇逐句法律/产品含义核对已完成**；下列每项内容差异在第二轮统一权威稿时需逐条归并校验。

## 一、仓库真实现状与数量

| 目录/类型 | 文件数（含占位） | 说明 |
|---|---:|---|
| 根目录 .gitignore / AGENTS.md / README.md | 3 | 规范、配置及产品入口 |
| `decisions/` | 35 | 15份DEC + 1份ARCH + 18份SCOPE = **34份决策Markdown**，另1占位 |
| `docs/` | 55 | **45份内容Markdown + 10个.gitkeep占位**；包括战略、PRD、调研、批次、流程、版本及状态索引 |
| `prototypes/` 和 `tasks/` | 2 | 占位符，不表示已有原型或工程任务 |
| **合计** | **95** | 其中 **81份 Markdown**（根目录2、决策34、docs45），另14个配置/占位文件 |

**当前有4份 Frozen 基线**（冻结的是相应文件**明示的范围**，不是V1.0逐项功能冻结）：
1. [战略与商业模式](../02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)：有条件冻结；首批市场/资产、具体定价及法律责任未定。
2. [总体PRD](../03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)：总体需求原则 Frozen。
3. [6能力域/22模块功能树及责任](../03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)：逻辑架构 Frozen。
4. [WF-01～18流程状态机原则](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)：跨域流程/权威原则 Frozen；不是技术实现规格。

**已 Approved 而不代表整篇完整PRD冻结**：Batch01～06六份深度原则（SCOPE-152～205）；DEC-012版本方法，DEC-013 CR01～10 A，DEC-014十一项核心客户路径，DEC-015 XCHK01～10 A；SCOPE与ARCH的其它原则。原187项保留ID且已全部完成纸面关联：106项直接核心、18项跨端、34项后续版本、29项需扩深/边界。**140/22/25仍是原187功能的V1/V2/V3草案计数，不包含经批准的新ID；11组PROP尚未正式编号。**

## 二、决策和文档权威优先级（建议下轮写入单一索引）

遇到“同一事实在多份文件出现”时，**先依具体主题的有效批准决策限定范围**，再阅读已冻结正文；后续获批的变更决策在其明确覆盖的业务内容上优先，但并不自动改变先前冻结文件的历史原文。产品、用户端、法务与技术的事实应各有唯一主责。

| 权威与文件层 | 推荐用途 | 现在不得做的事 |
|---|---|---|
| DEC-001～015、ARCH-001、18组SCOPE决定 | **审批证据永久保存**；按主题和生效时间标出继承/冲突覆盖关系 | 不因文件多而删除；不把所有 Approved 推断成生产或最终研发批准 |
| 4份Frozen | 稳定产品/流程原则上游 | 直接覆盖原文件、把新版本表塞进旧Frozen正文 |
| Batch01～06 + A/B权益、CDE规则专题 | 业务规则与必要验收素材，具体批准对应SCOPE | 不把最小深度原则当字段级详细PRD/实测PASS |
| Step02 v0.3 + DEC-014 | **当前唯一核心主流程阅读入口**，11/11已审核；技术图细节仍Draft | 不用v0.1/v0.2中的CR待决文字推翻DEC-013 |
| 原187清单 + Step03双向矩阵 | **历史原ID与当前差距对照的唯一底表** | 不按历史P0/P1/P2自动给当前开发版号，不因为功能名相似就删ID |
| 新三版本建议表 + 可读版 + PROP | **Draft提案**：V1.0完整闭环/V2.0运营增强/V3.0商业API及生态 | 不直接冻结140/22/25、不未经审批创建新ID |
| README / Document-Status-Index | 入口、导航、状态；**不能高于DEC/Frozen** | 不复制成为另一个“独立需求批准源” |

## 三、跨文档差异与清理任务单（有证据的事项）

| 编号/风险 | 已发现的具体情况 | 以哪个当前事实为准 | 二轮整理建议（非本轮执行） |
|---|---|---|---|
| **G-01 高** | [原187功能清单](../03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)部分历史段仍写“**SCOPE-134～142 尚待批准**”“**SCOPE-143～151 待批准**” | 实际已有 [134～142](../../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md)和[143～151](../../decisions/SCOPE-143-151-AB-scope-comparison-and-v1-freeze-gates.md)的 Approved 正式决定 | 不回写历史段；在当前主索引设置勘误/后续生效覆盖说明；旧功能源表标“历史审批时点切片” |
| **G-02 高** | [README](../../README.md)内部一处仍说“**下一步绘制四泳道详细流程图、核验187项**”，但Step02主流程已批准，Step03已做首轮187/187关联 | DEC-014/015与Step03审计 | 精简 README，只展示**当前步骤=Step03.5治理/Step03版本待审**；把历史工作记录移入日志与导航 |
| **G-03 高** | 原187范围、旧P0/P1/P2分类及旧Issuer“P1条件必需/46项非默认”专项审计与DEC-012新版本定义并存 | [DEC-012](../../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)：V1.0只表示完整实际研发交付承诺；旧分级只作历史 | 当前主功能清单只保留拟/获批V1.0/V2.0/V3.0；旧P0/P1/P2不删，但挪到历史对照区；避免以历史类别判断现在V1.0 |
| **G-04 高** | Step02 有v0.1/v0.2/v0.3三份，旧v0.2写CR-01～10“NEW REVIEW/待决”；已由DEC-013全部A批准 | [v0.3](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md) + DEC-013/014 | v0.3唯一当前入口；旧v0.1/v0.2**标Superseded/历史迁移候选**，保留提交记录与映射，不改旧Approved历史 |
| **G-05 高** | 现有 140/22/25 只为**187项候选版本**，并有11组PROP涉及门户、钱包、募资结算、收益注资/领取等；部分功能在原ID下尚缺独立验收单元 | DEC-013/015已批准业务方向，但**未批每个PROP具体归属与新编号** | Step03先拆分“原ID扩深/新增独立交付单元”；再经用户确认真实逐项版本与功能总数；拒绝此时“冻结完整V1” |
| **G-06 高** | [M08/M15](../03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)对独立Issuer基本门户/高级White-label有语义重叠，可能错误把高级自定义域名等整包搬入V1 | CR-02与XCHK-02：标准独立Portal是V1产品方向，M15高级运营商后置 | Step04建立最小Portal独立单元与M15高级权限/域名明确边界 |
| **G-07 高** | [M11退款、Issuer合法募资划拨、M13收益/本金支付](../03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)都被称作“出款”，不等于同一资金权威；同理法登/Mint/持仓不能互代 | DEC-008/013/014/015已批准事实独立原则 | 在字段级PRD分别设合法付款Intent、名册/权益、Token最终性、报表来源；跨端功能树不得形成双账本 |
| **G-08 中** | [Step01 Batch04～06收口草案](../03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md)开头仍称“Step01已启动尚未完成”；[Batch01文](../03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-01-Commercial-Tenant-Access-v0.1.md)记载曾“暂停Batch02”，随后六批均已Approved | 已有 SCOPE-152～205正式决策及Batch01～06终态 | 原文件保留历史现场，不作为项目现状；当前索引记录“历史草案/当时状态”，以后不再从这些句子判断项目进度 |
| **G-09 中** | [DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)指向WF-01～18的链接名曾称“v0.1 Draft”，该正文现在是Frozen | [WF Frozen正文](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md) | 留存DEC-011历史审批描述，索引给出“该文件后来冻结”的时间线勘误，不覆盖审批证据 |
| **G-10 中** | [策略冻结检查单](../02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md)、老版V1候选分类、多种条件P1/专项报告与新版可读版本计划内容重叠，但分别保存审批时依据 | 当前有效应为 Frozen策略/功能树、DEC-012～015与新范围审查稿 | 历史审核资料后续归档标Superseded/Reference，并在当前主文档链接证据来源；**不因重复名字直接合并删除** |
| **G-11 中** | [遗留4份RWA V2 PRD](../00-reference-archive/README.md)有“已确认”等旧项目标签但非本项目批准需求 | 已设有只读Reference Archive说明；本项目以自身DEC和Frozen为准 | 保留只读归档；不合并进当前产品PRD，也不改旧文本 |
| **G-12 中** | 第一版具体Instrument首发法域、钱包架构、真实募资托管/释放主体、收益Push/Claim的法律效果、合约Signer和模板审计仍TBD；部分原文“自动部署”“自动分配”不能推导获得执行许可 | DEC-004/008/013/014及Frozen核心WF的守卫规则 | 在V1范围表设**产品目标已Approved/真实生产Gate仍TBD**双状态；字段级PRD/合规矩阵保留有权主体，不能空编生产接口 |
| **G-13 中** | 仓库主阅读入口[README](../../README.md)与[文档状态索引](../Document-Status-Index.md)均过长，交错维护“当前进度/十份文档/历史审查与后续” | DEC + Frozen优先，索引不拥有需求权威 | README改短为产品简介+七段业务+当前版本+3～5个导航；唯一《状态索引》负责文档级元数据/决策覆盖 |
| **G-14 高** | [PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) 为 **Draft / Open / Unmerged**，**base是`docs/initial-asset-scope-v01`而不是main** | 用户持续禁止合并，PR上下游分支语义须单独验证 | 审计/整理只在当前工作分支进行；若未来准备并入main，单独审核base与历史差异，不把“合并PR#6”混作整理动作 |

**主要区别**：G-01/02/04/08/09是**状态/时点错位或历史版本陈述**，目前没有据此认定新的产品实质矛盾；G-03/05/06/07/12属于**需要通过Step03功能清单、Step05产品规格或法域责任门真正收敛**的事项，不得凭文档整理直接宣布“修复通过”。是否存在更多字段级矛盾，须待详细PRD完成并逐对象核验。

## 四、按原有路径给每个文件一项建议归属（**只分类、不执行移动**）

分类标记：**F**保留Frozen原文、**D**决策证据不可删改、**B**六批已批业务原则、**C**当前工作稿、**H**可考虑下一轮标记历史/归档、**R**既有外部历史归档、**S**研究/专项支撑、**N**导航待精简、**T**仓库工具/占位。

| 类别 | 数量 | 二轮操作总原则 |
|---|---:|---|
| B | 6 | 保留并建立引用 |
| C | 7 | 当前正文持续修改但不提前Frozen |
| D | 34 | 审批/权威历史保留 |
| F | 4 | 原样保留 |
| H | 11 | 产品负责人同意后归档标Superseded |
| N | 2 | 同意后精简，收敛入口 |
| R | 5 | 保留只读归档 |
| S | 11 | 保留研究，明确非生产事实 |
| T | 15 | 不参与产品文档去重 |
| **总计** | **95** | **当前不删除/移动任何文件** |

### 全仓95个文件处理提案清单（方便后续逐文件审核）

| 文件路径（均相对仓库根） | 类别 | 建议状态/动作 |
|---|:---:|---|
| `.gitignore` | T | 仓库占位或配置；保留 |
| `AGENTS.md` | T | 协作规则；保留 |
| `README.md` | N | 当前导航；第二轮精简去重 |
| `decisions/.gitkeep` | T | 仓库占位或配置；保留 |
| `decisions/ARCH-001-api-first-unified-business-core.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-001-independent-customer-portals.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-002-customer-hierarchy-and-delivery-model.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-003-multi-asset-and-initial-scope.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-004-regulated-activity-responsibility-boundaries.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-005-target-customer-priorities.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-006-global-product-and-market-selection.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-007-investor-identity-and-kyc-data-reuse.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-008-subscription-funds-settlement-and-refund-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-009-v1-secondary-transfer-boundaries.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-010-commercial-packaging-and-pricing-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-059-062-issuer-v1-delivery-and-validation-decisions.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-063-070-core-ui-cross-module-simplification.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-071-077-external-execution-authority-controls.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-086-095-nondefault-issuer-v1-scope-and-product-milestones.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-096-100-reference-instrument-validation-selection.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-101-108-instrument-families-and-extensibility.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-109-116-cde-extension-gap-review.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-143-151-AB-scope-comparison-and-v1-freeze-gates.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-152-159-batch01-commercial-tenant-access-depth.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-160-167-batch02-asset-instrument-documents-review.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-176-185-batch04-investor-payments-registration-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md` | D | 不可删改的审批/决策证据；保留 |
| `docs/00-governance/RWA-SaaS-Six-Step-Product-Design-Plan-and-Documentation-Audit-v0.1.md` | S | 方法/竞品与工作参考；保留并明确用途 |
| `docs/00-reference-archive/Legacy-RWA-V2-PRD-01-Identity-Primary.md` | R | 历史外部PRD参考；原样归档保留 |
| `docs/00-reference-archive/Legacy-RWA-V2-PRD-02-Secondary-Markets.md` | R | 历史外部PRD参考；原样归档保留 |
| `docs/00-reference-archive/Legacy-RWA-V2-PRD-03-Contracts.md` | R | 历史外部PRD参考；原样归档保留 |
| `docs/00-reference-archive/Legacy-RWA-V2-PRD-04-API-SaaS-WhiteLabel.md` | R | 历史外部PRD参考；原样归档保留 |
| `docs/00-reference-archive/README.md` | R | 历史外部PRD参考；原样归档保留 |
| `docs/01-competitor-research/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/01-competitor-research/Legacy-PRD-Alignment-Review-v01.md` | S | 方法/竞品与工作参考；保留并明确用途 |
| `docs/02-product-strategy/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md` | F | 已有冻结正文；原样保留 |
| `docs/02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/03-product-prd/RWA-SaaS-AB-187-Function-Need-and-V1-Freeze-Gates-Review-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-CDE-18-Gaps-Formal-Product-Review-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-CDE-Instrument-Extension-Gap-Assessment-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Debt-A1-Coupon-Maturity-and-Exception-Validation-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Instrument-Families-and-Extensibility-Boundaries-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md` | F | 已有冻结正文；原样保留 |
| `docs/03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md` | F | 已有冻结正文；原样保留 |
| `docs/03-product-prd/RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Reference-Instrument-Validation-Proposal-v0.1.md` | S | 专题审核与补充资料；后续交叉引用 |
| `docs/03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-01-Commercial-Tenant-Access-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-02-Asset-Instrument-Documents-Review-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-03-Project-Offering-Rules-Publishing-Review-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-04-Investor-Eligibility-Subscription-Payment-Registration-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-05-Token-Contracts-External-Execution-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-06-Lifecycle-Workflows-Notifications-Audit-Reports-v0.1.md` | B | 六批Approved产品原则承载文件；原样留证 |
| `docs/03-product-prd/RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/03-product-prd/RWA-SaaS-V1.0-Complete-Loop-CR-01-10-Decision-Proposals-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md` | C | 当前工作材料；保持现有状态 |
| `docs/04-business-workflows/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md` | F | 已有冻结正文；原样保留 |
| `docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md` | C | 当前工作材料；保持现有状态 |
| `docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-End-to-End-Workflow-Draft-v0.1.md` | H | 历史/已被当前材料继承；二轮待批准归档 |
| `docs/05-compliance/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/06-ui-ux/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/07-architecture/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/08-legal/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/09-commercial/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/10-delivery/.gitkeep` | T | 仓库占位或配置；保留 |
| `docs/Document-Status-Index.md` | N | 当前导航；第二轮精简去重 |
| `prototypes/.gitkeep` | T | 仓库占位或配置；保留 |
| `tasks/.gitkeep` | T | 仓库占位或配置；保留 |

> 上表中的 **H=拟归档候选**是审计操作建议，不代表文件内容无效或它们已经归档。旧阶段保留有意义的审计证据。对 H 类真正迁移前需用 Git 重命名方案、反向引用修复和用户的明确移动授权，必要时先仅加 Superseded 标记而不改变文件路径。**第一轮不覆盖旧审计或冻结正文**。

## 五、建议未来收敛的最少当前文档入口（结构方案，非创建指令）

1. **产品总入口**：README（精简） + 唯一《文档权威/状态索引》。
2. **稳定上游基线**：4 Frozen（02战略、03总体PRD、功能树、04 WF原则） + DEC/ARCH/SCOPE全量历史记录。
3. **核心操作旅程**：Step02 v0.3的DEC-014十一项主线和七段易读说明；技术Mermaid作为后续PRD证据。
4. **当前范围主表**：保留原187历史功能表一份；建立新的**待审/获批唯一版号功能主表**，每个功能的Owner/所属端/是否扩深或新ID/首次交付版号只能有一个主记录。现有Step03矩阵和版本草案作为审计追踪，不互相重建第二套权威源。
5. **按批已批原则**：Batch01～06及其SCOPE，后续在详细PRD引用，避免把每个Batch复制一整份新PRD。
6. **Step04/05新增最少完整规格**：分端功能清单（平台/Issuer/Investor/外部边界）、字段级PRD与角色/事实/状态/数据字典/金额与日期计算、关键业务通知、异常和验收附录；主数据/规则有且仅有一个定义位置。
7. **Step06冻结记录**：最终V1.0唯一功能清单、业务/角色/字段/验收追踪矩阵、未决法律/实际执行Gate与变更登记。**冻结后统一进入UI**，不需要先完成完整商业OpenAPI或智能合约代码。

## 六、审核后第二轮建议顺序（还未授权任何实质变更）

| 阶段 | 推荐执行动作 | 产出和必须检查的项 |
|---|---|---|
| R1：审核本报告 | 产品负责人确认G-01～14风险级别、各文件F/D/B/C/H/R/S/N/T分类及是否开始归档 | 批准**分类原则和允许变更的路径**，不是冻结全部文件 |
| R2：现行入口和勘误 | 新建/更新唯一现行文件权威索引；README收敛；写明DEC的旧版覆盖、新旧状态差异、版本方法转移 | 当前有效且**唯一**的入口；链接及相对路径复核 |
| R3：非破坏性归档 | 先对Step02 v0.1/v0.2、旧Issuer候选分类/旧草案标Superseded；有充分授权再物理移动到历史目录并改完全部引用 | 保留提交历史，不删除SCOPE/DEC/Frozen/历史用户资料 |
| R4：实体交叉核对 | 逐对象核主源：Tenant/Issuer、Investor/Wallet、Asset/Instrument、Offering/Reservation、Payment/Settlement/Refund、Register/Mint、Income/Distribution、Maturity；严格做资金/权利/Token分别守卫 | 在实际详细PRD形成后核字段与状态；此阶段不能伪称完成全量语义核验 |
| R5：接回Step03版本门 | 先对PROP独立新ID或旧ID扩深集中审批，再确定187原项与新增项的唯一V1.0/V2.0/V3.0版号 | **最终版号属于产品负责人明确批准的正式范围**；当前140/22/25 Draft不能冻结 |
| R6：再进入Step04～06 | 分端清单→字段级详细PRD→跨端一致性/UAT设计→单独范围冻结→UI | 所有开发前必需的产品/法域/资金Gate标明，PR#6仍独立授权 |

## 七、审计结论及冻结/PR状态

- **本轮已核**：95项文件树清单、81份Markdown可识别相对文件/目录链接目标（**0个未解析的目标**）、15个DEC/ARCH、18份SCOPE、6份Batch、四份Frozen、3版Step02、Step03的187主表与双向矩阵/版本草案的关键状态。链接检查只验证“当前树上存在”，**不代表锚点、语义或外部链接全部有效**。
- **确定的整理必要性**：若此时继续只新增详细PRD而不先收敛主索引与历史审批时点，会让“CR待决/已批准”“下一步Step02/已做Step03”“P0/P1与版号”“基础Portal与高级White-label”持续混淆。
- **不应本轮冻结**：原187逐项新版本、11组PROP功能正式新ID数量、具体法域/技术方案、真实生产结算及收益分配。**可稳定引用**DEC-014十一项客户业务主流程与DEC-015差距处理原则，但不等于所有Mermaid细则Frozen。
- **禁止破坏已有历史批准**：4 Frozen SHA经核实未变化；DEC/ARCH/SCOPE保留完整，原187 ID保持不变。此报告本身是 **Draft Audit**，没有对任何既有文件发出合并/冻结/删除许可。
- **PR #6**：审核时 Draft/Open/Unmerged，base `docs/initial-asset-scope-v01`；本轮不得合并。

**明确留待用户下轮授权**：是否接受H类归档及N类入口精简方案，是否仅先标Superseded、不移动Git路径；对未核完的字段/法域主数据依旧按Step04/05/06审查，不以本审计报告冒充最终“全部文档一致性PASS”。