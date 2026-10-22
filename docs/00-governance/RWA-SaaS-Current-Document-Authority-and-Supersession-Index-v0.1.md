# RWA SaaS｜当前有效文档权威目录与历史状态勘误 v0.1

> **Current Navigation / Document Governance（2026-10-23）**。状态：**当前文档导航生效；不是新产品决策，也不表示全部产品范围冻结**。本索引整理由 [Step 03.5 首轮95文件审计](RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md)提出的非破坏性治理方案，并依据已经批准的 DEC/ARCH/SCOPE 和四份 Frozen 正文判断。历史文件仅标记 Superseded 的**当前入口资格**，不撤销其中曾获批准的业务事实和审批证据。旧路径不移动、不删除。
>
> **一条核心规则**：功能范围和法律事实以主题适用的 Approved DEC/SCOPE、Frozen正文及其后续明确的**变更决定**综合判断；导航索引不是批准权威。某项 Approved ≠ 整篇 PRD Frozen；用户版号规划 Draft ≠ 开发授权；纸面流程通过 ≠ 代码及资金通过。

## 1. 当前项目状态（一页速览）

- **当前阶段**：**Step 03.5 非破坏性文档治理整理；接下来返回 Step 03 的版本与新增功能审查**。Stage 01 Batch01～06产品规则原则已批准；Stage 02 **11/11核心业务主流程已批准**；Stage 03 **187/187原ID已完成纸面双向匹配**、XCHK01～10 A 已批准。还没有进行分端完整功能清单与字段级PRD，尚未进入UI/代码开发。
- **当前产品主线**：企业购买 SaaS → 企业配置工作台/标准Issuer投资者门户 → 合法资产权益/Offering与受权Token部署 → 投资者KYC/钱包认购/真实支付、配售登记与Token交付 → 募集款合法结算 → 条款适用的合法收益资金注资、分配/Claim → 存续/依法清偿或退出。
- **当前功能基数**：原 **187 个 ID**；[拟版本划分](../03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md) 为 **V1.0 140、V2.0 22、V3.0 25（全部Draft）**；[PROP-01～11](../03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md) 是跨端交付单元建议，尚未判断需新增多少正式ID，也未冻结真实V1.0范围。
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
| 缺口、职责和待拆功能 | [Step03 12缺口/8重叠/11 PROP](../03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md) + [DEC-015](../../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md) | XCHK十项原则Approved；PROP拆分与编号仍Draft |
| 逐项建议交付版号 | [187逐项迁移表](../03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md) | **Draft / 唯一当前版本映射建议表**，不是已冻结开发表 |
| 面向产品负责人的可读版号规划 | [V1.0/2.0/3.0七段业务规划](../03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md) | **Draft / 供批量评审**，须引用逐项表而不能自己创造第二套功能版本归属 |
| A/B债权及SPV权益、CDE拓展 | [Document-Status-Index](../Document-Status-Index.md)内权利体系/样本专题章节及对应Approved SCOPE | 产品工具家族原则Approved，具体实现/合法有效性/验证未完成 |
| 文档审计及归档建议 | [Step03.5全仓首轮审计](RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md) | 95项逐文件核查、14项治理风险；审计证据并非新产品需求 |

## 4. 关键决策的有效范围与历史覆盖矩阵

| 主题 | 老档案中可能看到的主张 | 当前适用批准决定 | 处理原则 |
|---|---|---|---|
| 版本治理 | 旧功能清单P0/P1/P2、SCOPE中“非默认首期”措辞 | [DEC-012](../../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)：改为 **V1.0/V2.0/V3.0唯一交付版本** | 历史分级保留，但不再用来断言现时V1开发范围；140/22/25Draft |
| 购买SaaS | [旧SCOPE-003](../03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)首期可人工合同且**不强制在线收费** | [DEC-013 / CR-01 A](../../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md) 已批准**V1.0在线订阅收费能力**与人工合同例外 | 新产品方向覆盖旧的“首期不强制”阶段建议，但不改变任何实际商业支付/法域审批门 |
| Issuer门户 vs高级白标 | 早期 DEC-002 中有White-label V1层级描述，M08门户页面与M15高级域名功能混合 | 后续 SCOPE-059 与 DEC-013 CR-02 + DEC-015 XCHK-02 | **标准Tenant唯一URL/基本品牌为V1产品目标**；独立White-label运营商完整交付后置，不能以早期层级概念默认为V1开发范围 |
| A/B模板与律师/评估 | 旧M04-F008 P1、复杂M06服务商协作/市场 | DEC-013 CR-03/04 | V1受控A债权/B SPV权利模板及外部合法资料，复杂服务商撮合后置 |
| Contract Factory | 旧M07合约审批/部署作为最低原则 | DEC-013 CR-05 / DEC-015 XCHK-06 | V1有受权Factory产品目标，不默认SaaS生产私钥控制/每资产3合约 |
| 嵌入式钱包 | 旧M08/M07只明确钱包关联与地址校验 | DEC-013 CR-06 / DEC-015 XCHK-03 | V1外部钱包+一种安全嵌入式方案；**MPC不是唯一批准技术** |
| 募集款提现 | 旧M11支付/退款/M21报表 | DEC-013 CR-07 / DEC-015 XCHK-04 | 募资款受限→可结算→受权划拨→真实到账，独立于退款和收益实付 |
| 收益分配 | 旧M13-F004～006历史P1条件最低深度 | DEC-013 CR-08 / DEC-015 XCHK-05 | V1需要**注资+至少一种合法Push或Claim**；Claim-first是推荐路线，实际方案待选 |
| 债权与SPV退出 | 旧M07-F009 Burn历史P1、M13统一存续概述 | DEC-013 CR-09 / DEC-015 XCHK-08 | A债权本息，B依法适用合法分红/公司回购，法定权利/实付/登记/Token各有来源 |
| 一级/受控二级 | 历史“V1/V2”的业务分类与新V1.0/V2.0版号可能混淆 | [DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)依旧控制交易边界，受控转让拟V2.0 | 不自动把受控转让延至V3，也不把V1认购改成市场撮合 |
| 全量审核及编号 | 旧187表部分段落将SCOPE-134～151标为待批准 | 已获批准的 [SCOPE-134～142](../../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md) 与 [SCOPE-143～151](../../decisions/SCOPE-143-151-AB-scope-comparison-and-v1-freeze-gates.md)，以及DEC-015 | 旧段落是历史时点陈述，不再代表当前待批；原187 ID不能擅自添加PROP条数 |

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
| Step03收口 | **V1.0/V2.0/V3.0正式功能范围与新增功能审批** | 原187逐项唯一交付版本、PROP需独立新增与否、逐版本非范围及依赖 |
| Step04 | **分端完整功能与页面组清单** | 平台后台/Issuer工作台/Investor Portal/外部操作边界；模块、二级模块、交互入口、状态、角色 |
| Step05 | **按端/模块字段级PRD** + 共享权限/对象/金额/状态/第三方职责/验收附录 | 字段、来源、枚举、精度、约束、守卫、状态转移、异常恢复、通知、验收 |
| Step06 | **全面跨文件一致性审核与V1.0范围冻结** | 业务11步×正式ID×页面×规则×责任×UAT可追踪，无不可解释阻断性差异 |
| 冻结后 | **统一UI/UX设计** | IA与页面交互/原型、可执行前端；技术/法域/开发许可另行独立审核 |

**截至本轮：只完成文档导航、状态勘误和已审原则对照，未完成全部81份逐条语义或未来字段级交叉测试。**

## 7. 保全规则和二轮完成核验

1. 不修改任何 Frozen/DEC/ARCH/SCOPE 正文；只更新导航 README、现有状态索引与本次11份历史草案**顶部“当前入口已接续”的导航提示**。
2. 不新增/删除正式功能ID；原187中名称、编号、历史分级不变。版本数字 V1.0 140/V2.0 22/V3.0 25 仍 Draft。
3. 每份历史 H 文件的新提示**必须引用本索引**，保留原 H1/旧历史结论/审批引用；不得抹除当时的审议证据。
4. 所有仓库内相对Markdown链接必须继续能解析原路径；检查新增索引、README、状态索引及历史头部。
5. 保留PR #6 Draft/Open/Unmerged，不修改其 base/合并状态；所有变动只在 `docs/regulated-activity-boundaries-v01` 工作分支。
6. 本索引不是范围冻结决定；日后做真实法域、对外API、钱包/分红/现金流/合约等详细方案，需要权限责任或实证，不得以产品文档名称推断已经通过。

**当前：Document authority map 已建立；四份Frozen保持；11份历史材料已经仅添加历史入口提示并保留原文；README/Document-Status-Index已精简与更新。版本规划/PROP以及字段级PRD仍待审，非产品V1冻结。**
