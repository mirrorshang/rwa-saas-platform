# RWA SaaS｜当前有效文档权威目录与历史状态勘误 v0.1

> **Current Navigation / Document Governance（2026-10-25）**。该索引记录当前权威与有效产品决策关系；**DEC-017已批准193项的首次目标交付版号（146/22/20/TBD5），但整体V1.0产品需求尚未Frozen，产品与技术生产授权仍未完成**。本索引依据此前Step03.5非破坏性文档治理建立，原Frozen及历史DEC/SCOPE不改写。
>
> **一条核心规则**：功能范围和法律事实以主题适用的 Approved DEC/SCOPE、Frozen正文及其后续明确的**变更决定**综合判断；导航索引不是批准权威。某项 Approved ≠ 整篇 PRD Frozen；用户版号规划 Draft ≠ 开发授权；纸面流程通过 ≠ 代码及资金通过。

## 1. 当前项目状态（一页速览）

- **当前阶段**：**Step03版本归属已按DEC-017 R-01～R-06 全部A Approved**；现193个正式ID均有首次交付版本或TBD。**Step04进行中：DEC-018/019批准S04-01 16项、DEC-020批准S04-02 14项、DEC-021批准S04-03 19项、DEC-022批准S04-04 24项及两条跨模块适用澄清，DEC-023批准S04-05 M11/M13 20项及R01/R02合约收款/Claim方向，DEC-024批准S04-06共享工作台31项，DEC-025批准S04-07投资者门户11项，DEC-026批准S04-08平台运营M03三项；当前累计138/146项，余8项待审（M22 8）**。Step05字段PRD及Step06整体V1冻结均未完成；未启动统一UI/研发或资金、Token、法定登记的真实生产操作。
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
| Step04 Issuer基础、资产/Instrument、Offering/Token、认购/登记与146项逐ID跟踪 | [S04-01 v0.2](../03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)＋[DEC-020/S04-02](../../decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)＋[DEC-021/S04-03](../../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)＋[DEC-022](../../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)＋[S04-04完整设计](../03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)＋[合法登记/地址绑定澄清](../03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md)＋[DEC-023 S04-05](../../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)＋[S04-05资金/收益存续批准设计](../03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)＋[146项追踪账](../03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)；S04-01仍由DEC-018/019共同批准 | **S04-01共16项＋S04-02共14项＋S04-03共19项＋S04-04共24项＋S04-05共20项，累计93/146 Step04设计Approved**；余53未审，非整体V1 Frozen；外部责任与文书法律效力仍按Instrument决定 |
| 面向产品负责人的可读版号规划 | [可读三版本业务规划](../03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md) | **依据DEC-017版号Approved的只读业务摘要**，以193逐ID主表为权威，不另造第二套版本分配 |
| A/B债权及SPV权益、CDE拓展 | [Document-Status-Index](../Document-Status-Index.md)内权利体系/样本专题章节及对应Approved SCOPE | 产品工具家族原则Approved，具体实现/合法有效性/验证未完成 |
| 文档审计及归档建议 | [Step03.5全仓首轮审计](RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md) | 95项逐文件核查、14项治理风险；审计证据并非新产品需求 |

**Step04生效顺序（截至2026-10-25）**：DEC-010保留订阅包装原则、DEC-013 CR-01～10保留首发产品方向；DEC-018批准S04-01基础16项，DEC-019接续14天Trial、Standard与付费前KYB；DEC-020批准S04-02 M04/M06 14项；DEC-021批准S04-03 M05/M07 19项；**DEC-022批准S04-04 M09/M10/M12 24项及C01/C02登记责任和合约地址绑定产品原则；DEC-023批准S04-05 M11/M13 20项和R01/R02链上收款/分配方向**。随后DEC-024批准31项共享能力，DEC-025批准M08门户11项，DEC-026批准M03平台后台3项；最新138/146已审，8未审。S04-01 v0.1等历史材料保留原文，S04-02 v0.1、S04-03 v0.1不改写；新增跨模块批准说明接续解释必要责任和门槛；DEC-023补充并未将智能合约收款、预注资Claim转变为实际资金、托管、链签名的生产授权。

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
| 权威登记由谁操作 | 旧文提及外部登记方，容易被理解成每家Issuer都必须采购第三方审核/登记 | [DEC-022 C01](../../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)＋[跨批次说明](../03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md) | **Issuer依法可以自管时优先支持自管；委托或法定强制时有权合作/登记方参与**；M12对配售和权威登记证据/核对负责，不创造法定资格，也不免除SaaS可能的自身义务 |
| 法律文书与合约地址先后 | M06文件预审在前、M07部署在后，正式地址当时可能尚不存在 | [DEC-022 C02](../../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)＋[跨批次说明](../03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md) | **先依法审结构/取得部署授权，再在允许时部署取得真实地址，按要求形成M06合法最终附件/补充/必要重签，M05最终发布Gate核验一致**；不覆盖旧签署文件，不假定任何法域统一允许该时序 |
| 投资者收款合约与法定持款责任 | S04-05讨论链上合约收款和授权钱包/第三方资金通道，不能默认合约就是法定托管 | [DEC-023 R01](../../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)＋[S04-05 Approved](../03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md) | **优先评估受控合约收款，保留其他依法适用通道；M11收款/退款/募集款事实主责，X真实合法持管/签名；实际资金法域和合约结构Step05另审** |
| 发行后收益的预注资Claim和实际清偿 | 不能把批准应付或合同/合约注资显示为投资者已收到、公司债务已消灭 | [DEC-023 R02](../../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)＋[S04-05 Approved](../03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md) | **独立预注资Claim优先、保留Push/外部付款；M13批次/注资/实付、M12权威持有人、M07 Token及X真实付款分别核验** |

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
| Step04 | **进行中：S04-01～08已Approved 138/146，待审8** | [S04-01 v0.2](../03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)、[S04-02 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)、[S04-03 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)、[S04-04 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)、[S04-05 v0.1](../03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)各管本批已批端侧设计；后台/Investor Portal/共享/外部责任仍待完整审核 |
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

**当前：Step03.5文档治理完成；DEC-016功能ID及DEC-017首次版号归属已批准（193项：146/22/20/TBD5）；**Step04已审138/146、余8待审（DEC-018～026），已有C01/C02跨模块责任/文书时序及R01/R02资金合约收款/Claim产品原则；后续Step05字段PRD、Step06整体V1冻结仍待评审。真实法域/资金责任/登记权威/合约签名/生产权限仍TBD；PR #6不得未经批准合并。


## 8. 2026-10-25 DEC-024/025后续批准（当前权威）

- [DEC-024](../../decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md)批准M17～M21共享工作台、异常、通知、规则、审计、报表共31项；不把共享任务/报表当作真实付款、登记或Token权威。
- [DEC-025](../../decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md)批准M08 Issuer独立投资者门户11项，以[批准产品设计](../03-product-prd/RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)为Step04现行规格；投资者端不另建资金/法定名册/Token/收益真值。
- 最新[146项追踪台账](../03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)及[文档状态索引](../Document-Status-Index.md)：**DEC-025时点135/146 Approved、11项待审（M03 3，M22 8）**，随后DEC-026新增M03三项，**最新138/146 Approved、M22八项待审**。本页旧段落中DEC-023累计93/146仅为当时历史状态。
- 不更改193项版号、任何Frozen、历史DEC/SCOPE；PR #6 Draft/Open/Unmerged，整体V1.0/生产金融与链上操作/UI/研发仍未批准。


## 9. 2026-10-25 DEC-026接续：S04-08平台后台3项（当前权威）

- [DEC-026 S04-08](../../decisions/DEC-026-step04-s0408-platform-operations-approved.md)批准M03-F001 SaaS商业KYB审核、M03-F002 Tenant开通暂停恢复、M03-F005受控敏感访问三项平台P端设计；[现行详细规格](../03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md)。[DEC-019](../../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)中14天受限Trial、KYB正式付费前、30天恢复、Paid未结金融义务保全继续有效。
- 现行唯一[146项台账](../03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)：**138/146 Approved、仅M22-F001～F008共8项待审**，其余ID跨端引用不重复计数。
- DEC-017版号、所有Frozen与原历史DEC/SCOPE不改；PR #6仍Draft/Open/Unmerged。Step05字段PRD、Step06整体Frozen、UI/研发及真实金融链上操作均尚未获批准。
