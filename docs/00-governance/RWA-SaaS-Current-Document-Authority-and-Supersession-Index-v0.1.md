# RWA SaaS｜当前有效文档权威目录与历史状态勘误 v0.1

> **Current Navigation / Document Governance（2026-10-25）**。该索引记录当前权威与有效产品决策关系；**DEC-017已批准193项的首次目标交付版号（146/22/20/TBD5），但整体V1.0产品需求尚未Frozen，产品与技术生产授权仍未完成**。本索引依据此前Step03.5非破坏性文档治理建立，原Frozen及历史DEC/SCOPE不改写。
>
> **一条核心规则**：功能范围和法律事实以主题适用的 Approved DEC/SCOPE、Frozen正文及其后续明确的**变更决定**综合判断；导航索引不是批准权威。某项 Approved ≠ 整篇 PRD Frozen；用户版号规划 Draft ≠ 开发授权；纸面流程通过 ≠ 代码及资金通过。

## 1. 当前项目状态（一页速览）

- **当前阶段**：**Step03版本归属已按DEC-017 R-01～R-06 全部A Approved**；现193个正式ID均有首次交付版本或TBD。**Step04进行中：DEC-018/019批准S04-01 16项、DEC-020批准S04-02 14项、DEC-021批准S04-03 19项；累计49/146项，余97项待审**，后续Step05字段PRD→Step06跨文档验收及整体V1.0范围冻结；尚未开始统一UI/研发或真实资金、链上Token生产。
- **当前产品主线**：企业购买 SaaS → 企业配置工作台/标准Issuer投资者门户 → 合法资产权益/Offering与受权Token部署 → 投资者KYC/钱包认购/真实支付、配售登记与Token交付 → 募集款合法结算 → 条款适用的合法收益资金注资、分配/Claim → 存续/依法清偿或退出。
- **当前功能基数**：原187历史ID+DEC-016新增6 ID=**193唯一ID/22模块**。[当前统一主表](../03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)的首次交付归属已由[DEC-017](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md)批准：**V1.0 146、V2.0 22、V3.0 20、TBD 5**。旧187草案与193的最初146/22/25仅做历史对照；现行版号Approved≠字段PRD或整体V1 Frozen。
- **技术/生产门**：具体首发法域/Instrument、真实法律与专业责任、托管/收款/资金释放执行方、合同/Token合约标准及生产Signer、嵌入式钱包架构和恢复、Push/Claim实际法律支付效力、退款/定价/时间精度等仍待法域或技术设计审核。不能由 SaaS 自动假定。
- **PR**：[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) **Draft/Open/Unmerged**，base `docs/initial-asset-scope-v01`；严禁未经批准合并。

## 2. 正式可引用的四份冻结业务基线

| 权威文档 | 明确冻结的范围 | 不属于已冻结的事项 |
|---|---|---|
| [战略与商业模式](../02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md) | **有条件Frozen**：标准化全球ToB、客户类别、两类商业方向等战略原则 | 定价/法域/首发市场/金融工具的实际选择 |
| [总体产品PRD](../03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md) | **Frozen**：产品总边界、主要对象/职责、业务原则 | 字段/研发验收/实际资金与合约方案 |
| [功能树与责任矩阵](../03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md) | **Frozen**：6大能力域、22模块、基本模块责任 | 原187每项的最终V1.0交付版本 |
| [WF-01～18状态机原则](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md) | **Frozen**：权限与独立事实、跨端状态/守卫原则 | 具体字段、算法、法域、服务商、合约和资金上线许可 |

**治理**：以上四份不在本轮改写；如后续获批的产品方向与旧文个别范围陈述不同，使用 DEC 的明确变更映射与新版本交付清单来接续，不能从历史 Frozen 中删除句子来假装从未改过方案。

## 3. 当前主题的唯一阅读入口（旧草案只作证据）

| 主题 | 当前默认入口 | 审核状态/用途 |
|---|---|---|
| 核心业务与产品背景 | 四份 Frozen + [README](../../README.md) | 原则 Frozen；README只作导览 |
| 六批详细业务原则 | [现行状态索引第三节](../Document-Status-Index.md)的六份 Batch 正文与对应 SCOPE；[旧六批路线](../03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md)为历史执行记录 | 六批 **原则Approved**；旧路线内阶段计划按历史时点解读 |
| 已批准11步核心主流程 | [Step02 v0.3](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md) + [DEC-014](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md) | **11/11核心业务Approved**；v0.3技术异常/字段仍Draft |
| 187历史ID源账 | [187原始功能清单](../03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md) | **功能编号保持**；P0/P1/P2仅历史，原文审批记录不重写 |
| 对应新流程的逐ID核验 | [Step03 187交叉审核矩阵](../03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md) | 纸面核验完成、处理原则Approved；非软件测试Pass |
| PROP-01～11 新旧功能分类和六项正式ID | [DEC-016](../../decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md) + [DEC-017](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md) | **DEC-016分类及新增编号Approved；DEC-017也批准新增六项首交付均归V1**，但实施PRD未冻结 |
| 缺口、职责和待拆功能 | [Step03历史12缺口/8重叠/11 PROP](../03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md) + [DEC-015](../../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md) + [DEC-016](../../decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md) | XCHK及PROP处理均已Approved；具体字段/接口/资金技术依旧需要Step05审核 |
| 逐项正式首次交付版号 | [193项当前主表](../03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md) + [DEC-017](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md) | **193/193项版号或TBD已Approved（146/22/20/TBD5）**；文件名仍沿用历史Draft-v0.1，内容已更新。非整体V1 Frozen。 |
| Step04 Issuer基础工作台、资产/Instrument、Offering/Token与146项逐ID跟踪 | [DEC-018](../../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md) + [DEC-019](../../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md) + [S04-01 v0.2](../03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md) + [DEC-020](../../decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md) + [S04-02 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md) + [DEC-021](../../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md) + [S04-03 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md) + [146项分端追踪账](../03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md) | **S04-01共16项＋S04-02共14项＋S04-03共19项，累计49/146 Step04设计Approved**；余97未审，非整体V1 Frozen |
| 面向产品负责人的可读版号规划 | [可读三版本业务规划](../03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md) | **依据DEC-017版号Approved的只读业务摘要**，以193逐ID主表为权威，不另造第二套版本分配 |
| A/B债权及SPV权益、CDE拓展 | [Document-Status-Index](../Document-Status-Index.md)内权利体系/样本专题章节及对应Approved SCOPE | 产品工具家族原则Approved，具体实现/合法有效性/验证未完成 |
| 文档审计及归档建议 | [Step03.5全仓首轮审计](RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md) | 95项逐文件核查、14项治理风险；审计证据并非新产品需求 |

**Step04生效顺序（截至2026-10-25）**：DEC-010保留订阅包装原则，DEC-013 CR-01～10保留首发产品方向；DEC-018批准S04-01基础16项，DEC-019接续14天Trial、Standard与付费前KYB；DEC-020批准S04-02 M04/M06 14项；**DEC-021批准S04-03 M05 Project/Offering与M07 Token 19项**。S04-01 v0.1保留历史，当前S04-01 v0.2、S04-02 v0.1、S04-03 v0.1各管本批Step04 Approved范围；不改旧DEC/SCOPE/Frozen原文，不改变DEC-017逐ID版号。

## 4. 关键决策的有效范围与历史覆盖矩阵

| 主题 | 老档案中可能看到的主张 | 当前适用批准决定 | 处理原则 |
|---|---|---|---|
| 版本治理 | 旧P0/P1/P2、SCOPE旧阶段建议及原193项版号Draft | [DEC-012](../../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md) + [DEC-017](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md) | **现193项逐ID归属146/22/20/TBD5 Approved**；旧P0/P1/P2仅历史，不意味着V1整个PRD和真实许可Frozen |
| 购买SaaS | [旧SCOPE-003](../03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)首期可人工合同且**不强制在线收费** | [DEC-013 / CR-01 A](../../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md) 已批准**V1.0在线订阅收费能力**与人工合同例外 | 新产品方向覆盖旧的“首期不强制”阶段建议，但不改变任何实际商业支付/法域审批门 |
| Issuer门户 vs高级白标 | 早期 DEC-002 中有White-label V1层级描述，M08门户页面与M15高级域名功能混合 | 后续 SCOPE-059 与 DEC-013 CR-02 + DEC-015 XCHK-02 | **标准Tenant唯一URL/基本品牌为V1产品目标**；独立White-label运营商完整交付后置，不能以早期层级概念默认为V1开发范围 |
| A/B模板与律师/评估 | 旧M04-F008 P1、复杂M06服务商协作/市场 | DEC-013 CR-03/04 | V1受控A债权/B SPV权利模板及外部合法资料，复杂服务商撮合后置 |
| Contract Factory | 旧M07合约审批/部署作为最低原则 | DEC-013 CR-05 / DEC-015 XCHK-06 | V1有受权Factory产品目标，不默认SaaS生产私钥控制/每资产3合约 |
| 嵌入式钱包 | 旧M08/M07只明确钱包关联与地址校验 | DEC-013 CR-06 / DEC-015 XCHK-03 | V1外部钱包+一种安全嵌入式方案；**MPC不是唯一批准技术** |
| 募集款提现 | 旧M11支付/退款/M21报表 | DEC-013 CR-07 / DEC-015 XCHK-04 | 募资款受限→可结算→受权划拨→真实到账，独立于退款和收益实付 |
| 收益分配 | 旧M13-F004～006历史P1条件最低深度 | DEC-013 CR-08 / DEC-015 XCHK-05 | V1需要**注资+至少一种合法Push或Claim**；Claim-first是推荐路线，实际方案待选 |
| 债权与SPV退出 | 旧M07-F009 Burn历史P1、M13统一存续概述 | DEC-013 CR-09 / DEC-015 XCHK-08 | A债权本息，B依法适用合法分红/公司回购，法定权利/实付/登记/Token各有来源 |
| 一级/受控二级 | 历史“V1/V2”的业务分类与新V1.0/V2.0版号可能混淆 | [DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)依旧控制交易边界，受控转让拟V2.0 | 不自动把受控转让延至V3，也不把V1认购改成市场撮合 |
| 全量审核及编号 | 原187清单和历史PROP候选 | [DEC-015](../../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md)、[DEC-016](../../decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md)、[DEC-017](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md) | 原187历史行保留，新增6项正式ID及全部193项版号已获批；任何新变更要另行审批 |

**事实优先级说明**：上表是“哪个产品方向后来有了明确变化”的索引，不意味着全部参数、合法责任及运营主体已经 Approved。假如新旧文件无法依据明确变更决策消解，必须新增待决门，而非擅自宣布旧文本错误并覆盖。

## 5. 历史/已接续草案名单（本轮仅打标签，不移动）

这些文件**继续存在于原路径**，其中审计证据、曾获批准的SCOPE引用继续有效；只是**当前阶段的阅读入口**已被更晚材料取代。勿再用其当时的“待批准”“下一步做什么”推断当前进度：

1. [`Strategy-Freeze-Readiness-Checklist-v01.md`](../../docs/02-product-strategy/Strategy-Freeze-Readiness-Checklist-v01.md) — `Historical / Superseded as current entry`
2. [`RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-Conditional-P1-Assessment-v0.1.md) — `Historical / Superseded as current entry`
3. [`RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-Core-and-Shared-UI-Audit-v0.1.md) — `Historical / Superseded as current entry`
4. [`RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md) — `Historical / Superseded as current entry`
5. [`RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-Delivery-Depth-Batch-Review-Roadmap-v0.1.md) — `Historical / Superseded as current entry`
6. [`RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-External-Execution-and-Authority-Audit-v0.1.md) — `Historical / Superseded as current entry`
7. [`RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Issuer-V1-Nondefault-46-Item-Exclusion-and-Roadmap-Audit-v0.1.md) — `Historical / Superseded as current entry`
8. [`RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md) — `Historical / Superseded as current entry`
9. [`RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md`](../../docs/03-product-prd/RWA-SaaS-V1-Minimum-Deliverable-Scope-and-Decision-Gates-v0.1.md) — `Historical / Superseded as current entry`
10. [`RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md`](../../docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md) — `Historical / Superseded as current entry`
11. [`RWA-SaaS-Step-02-Four-Lane-End-to-End-Workflow-Draft-v0.1.md`](../../docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-End-to-End-Workflow-Draft-v0.1.md) — `Historical / Superseded as current entry`

> 历史归档策略：本轮只在上述文件顶部加说明，与本权威索引双向链接。**不创建archive副本、不改名、不移动、不删除**。未来若批准物理迁移，要逐文件重新确认相对引用并一次性重写所有路径；在此之前旧文链接保持有效。

## 6. UI之前仍需形成并审核的实际产品交付物

| 顺序 | 待完成的主要文档 | 最小覆盖 |
|---|---|---|
| Step03已完成 | **DEC-017已批准193项功能首次交付版本/TBD** | 后续不得私下变更版号；仍需设计V1页面/字段/合法执行依赖 |
| Step04 | **进行中：S04-01～03已Approved 49/146，待审97** | [S04-01 v0.2](../03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)、[S04-02 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)、[S04-03 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)是已批各批次端侧设计；其它Issuer/后台/Investor Portal/外部责任未完成 |
| Step05 | **按端/模块字段级PRD** + 共享权限/对象/金额/状态/第三方职责/验收附录 | 字段、来源、枚举、精度、约束、守卫、状态转移、异常恢复、通知、验收 |
| Step06 | **全面跨文件一致性审核与V1.0范围冻结** | 业务11步×正式ID×页面×规则×责任×UAT可追踪，无不可解释阻断性差异 |
| 冻结后 | **统一UI/UX设计** | IA与页面交互/原型、可执行前端；技术/法域/开发许可另行独立审核 |

**截至本轮：只完成文档导航、状态勘误和已审原则对照，未完成全部81份逐条语义或未来字段级交叉测试。**

## 7. 保全规则和二轮完成核验

1. 不修改任何 Frozen/DEC/ARCH/SCOPE 正文；只更新导航 README、现有状态索引与本次11份历史草案**顶部“当前入口已接续”的导航提示**。
2. **后续明确产品授权优先**：原Step03.5审计限制在当时禁止未经批准新增功能。DEC-016明确批准新增六个正式ID，DEC-017明确批准193项唯一首次目标版本（146/22/20/TBD5）。旧187历史正文和四份Frozen均保持原状；**V1.0整体需求未Frozen**。
3. 每份历史 H 文件的新提示**必须引用本索引**，保留原 H1/旧历史结论/审批引用；不得抹除当时的审议证据。
4. 所有仓库内相对Markdown链接必须继续能解析原路径；检查新增索引、README、状态索引及历史头部。
5. 保留PR #6 Draft/Open/Unmerged，不修改其 base/合并状态；所有变动只在 `docs/regulated-activity-boundaries-v01` 工作分支。
6. 本索引不是范围冻结决定；日后做真实法域、对外API、钱包/分红/现金流/合约等详细方案，需要权限责任或实证，不得以产品文档名称推断已经通过。

**当前：Step03.5文档治理完成；DEC-016功能ID及DEC-017首次版号归属已批准（193项：146/22/20/TBD5）；**Step04已审49/146、余97待审（DEC-018/019/020/021），后续Step05字段PRD、Step06整体V1冻结仍待评审。真实法域/融资资金/合约签名/钱包与生产权限仍TBD；PR #6不得未经批准合并。
