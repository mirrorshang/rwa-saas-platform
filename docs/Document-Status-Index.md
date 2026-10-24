# RWA SaaS Platform｜现行文档状态和决策索引

> **更新：2026-10-24｜DEC-017 193项首次交付版号Approved；DEC-018＋DEC-019批准S04-01基础16项及14天试用/KYB/标准订阅补充设计，余130项待审；整体V1.0未Frozen/未获真实生产授权。**
>
> **读这份索引之前**：如遇到不同文件对同一事情的旧/新描述，先查[当前权威与后续生效覆盖矩阵](00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)。正式DEC、ARCH、SCOPE按各自批准范围适用；四份Frozen原文不更改。历史文件上看到的“待批准”可能是过去时点，不可取代更新的正式决策。项目总览见[README](../README.md)。

## 一、当前真实进度（以本表为当前状态权威入口）

| 工作成果 | 状态 | 说明/入口 |
|---|---|---|
| 产品定位、总体PRD、模块责任、WF01～18原则 | **4份 Frozen（战略有条件）** | 见第二节 |
| 六批Issuer业务最低交付深度 | **Batch01～06产品原则 Approved** | 见第三节；不是逐字段PRD与生产授权 |
| Step02企业买SaaS至结算/收益/退出的11步闭环 | **DEC-014 核心业务 Approved** | [最新v0.3](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)；技术实现和细部异常Draft |
| Step03原187×11步双向纸面核验 | **187/187已关联，XCHK01～10 A Approved** | [187交叉矩阵](03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md)、[DEC-015](../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md)；非软件PASS |
| PROP功能分类及正式6个新ID | **DEC-016 Approved（5项扩深＋6项独立编号）** | [DEC-016 正式决策](../decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md)；原187保留，193个正式功能ID已确认 |
| **193项首次交付版号/待规划TBD归属** | **DEC-017 R-01～R-06 Approved（146/22/20/TBD5）** | [DEC-017](../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md)、[193项有效主表](03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)、[可读版](03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md)；**仅版号Approved，V1.0整体PRD尚未Frozen** |
| Step03.5文档治理 | **非破坏性整理与重点交叉核验已完成；不代表V1产品冻结** | [权威目录](00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)、[首轮审计](00-governance/RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md)、[第二轮验收报告](00-governance/RWA-SaaS-Step-03.5-Non-Destructive-Cleanup-Verification-v0.1.md) |
| Step04分端功能清单、Step05字段PRD、Step06交叉核验及最终V1冻结 | **Step04进行中（S04-01 Approved 16/146，余130待审）；Step05/06未完成** | [DEC-018](../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)、[DEC-019](../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)、[S04-01当前整合设计v0.2](03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)、[146项追踪表](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)；尚未冻结字段/生产/UI |
| 真实法域/资金持款和签名方/钱包合约/收益支付授权 | **TBD** | 不因产品方向批准而默许有权生产执行 |

## 二、四份已Frozen基线（正文不可静默覆盖）

| 文件 | 当前批准边界 |
|---|---|
| [战略与商业模式](02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md) | **有条件Frozen**；首发市场/资产/价格/法律责任仍待验证 |
| [总体产品PRD](03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md) | **Frozen**；产品总体需求，不等于187正式交付范围 |
| [六能力域/22模块功能树](03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md) | **Frozen**；模块职责及业务边界 |
| [WF01～18 跨域流程与状态机原则](04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md) | **Frozen**；守卫与责任原则，不等于实际智能合约或资金签名实现 |

## 三、六批业务深度需求（**原则 Approved / 详细字段 Draft**）

| 批次 | 业务范围 | 当前承载文档 | 正式批准依据 |
|---|---|---|---|
| Batch 01 | M01～M03 商业/Tenant/RBAC | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-01-Commercial-Tenant-Access-v0.1.md) | SCOPE-152～159 Approved |
| Batch 02 | M04/M06 Asset、Instrument/法律 | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-02-Asset-Instrument-Documents-Review-v0.1.md) | SCOPE-160～167 Approved |
| Batch 03 | M05/M19 Project/Offering规则 | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-03-Project-Offering-Rules-Publishing-Review-v0.1.md) | SCOPE-168～175 Approved |
| Batch 04 | M08～M12 投资者、USDT/USDC支付与登记 | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-04-Investor-Eligibility-Subscription-Payment-Registration-v0.1.md) | SCOPE-176～185 Approved |
| Batch 05 | M07/M22 Token、合约/合法外部执行 | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-05-Token-Contracts-External-Execution-v0.1.md) | SCOPE-186～193 Approved |
| Batch 06 | M13/M17～M21 生命周期/通知/审计/报表 | [原长篇需求](03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-06-Lifecycle-Workflows-Notifications-Audit-Reports-v0.1.md) | SCOPE-194～205 Approved |

**重点**：部分早期Batch正文含“先暂停下一批”“在线计费可以后置”等**当时审核阶段**表述。后续SCOPE与DEC-013（CR）对产品方向有明确推进，按第四节的正式决策与[覆盖矩阵](00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md#4-关键决策的有效范围与历史覆盖矩阵)理解，不倒改原文。

## 四、正式决策账（38份DEC/ARCH/SCOPE Markdown）

### 4.1 DEC-001～019（各DEC只批准自己明确列出的范围）

| 文件 | 已批准的主题及有限范围 |
|---|---|
| [DEC-001](../decisions/DEC-001-independent-customer-portals.md) | 机构门户与授权分发 |
| [DEC-002](../decisions/DEC-002-customer-hierarchy-and-delivery-model.md) | 客户层级与SaaS/白标/API产品线 |
| [DEC-003](../decisions/DEC-003-multi-asset-and-initial-scope.md) | 多资产架构与首批工具原则 |
| [DEC-004](../decisions/DEC-004-regulated-activity-responsibility-boundaries.md) | 受监管活动与责任边界 |
| [DEC-005](../decisions/DEC-005-target-customer-priorities.md) | 客户优先级 |
| [DEC-006](../decisions/DEC-006-global-product-and-market-selection.md) | 全球标准化与首发市场选择 |
| [DEC-007](../decisions/DEC-007-investor-identity-and-kyc-data-reuse.md) | 投资者身份与KYC复用边界 |
| [DEC-008](../decisions/DEC-008-subscription-funds-settlement-and-refund-principles.md) | 认购资金结算、退款分离 |
| [DEC-009](../decisions/DEC-009-v1-secondary-transfer-boundaries.md) | 受控二级转让的监管边界 |
| [DEC-010](../decisions/DEC-010-commercial-packaging-and-pricing-principles.md) | 商业套餐及定价原则 |
| [DEC-011](../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md) | 一级认购优先、下一版受控转让 |
| [DEC-012](../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md) | 交付版本改为V1.0/V2.0/V3.0 |
| [DEC-013](../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md) | CR-01～10 A：首版完整闭环产品方向 |
| [DEC-014](../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md) | 11步业务主流程已批准 |
| [DEC-015](../decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md) | XCHK-01～10 A：功能缺口处理原则 |
| [DEC-016](../decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md) | PROP-01～11 A：扩深5项、正式新增6项编号 |
| [DEC-017](../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md) | R-01～R-06 A：**193项版本归属 V1.0 146、V2.0 22、V3.0 20、TBD 5 Approved**；总体V1仍未Frozen |
| [DEC-018](../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md) | S04-01-01～06 A：Issuer基础M01 9项＋M02 7项Step04设计Approved（16/146）；历史原文保留 |
| [DEC-019](../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md) | S04-01-R01～R05 A：邮箱注册即受限试用14天、KYB在正式付费前、1个Standard套餐、30天试用恢复、Paid到期金融义务保护；整合稿v0.2生效，不增ID/不冻结V1整体 |

**特别注意**：DEC-011对受控转让版本范围的明确决定接续DEC-009的早期建议；DEC-012改为统一版号；DEC-013对首版在线订阅/标准门户/模板/受权Factory/钱包/募集款划拨/收益和退出作方向补充，**不代表已经修改过去的Frozen历史正文或正式冻结187项范围**。

### 4.2 ARCH-001与18组SCOPE审批记录

| 形式 | 正式材料 | 适用边界 |
|---|---|---|
| 技术产品原则 | [ARCH-001](../decisions/ARCH-001-api-first-unified-business-core.md) | API-First、共享核心、Issuer API-Ready；不代表对外商业API已生产 |
| 分批产品决策 | [SCOPE-059-062](../decisions/SCOPE-059-062-issuer-v1-delivery-and-validation-decisions.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-063-070](../decisions/SCOPE-063-070-core-ui-cross-module-simplification.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-071-077](../decisions/SCOPE-071-077-external-execution-authority-controls.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-078-085](../decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-086-095](../decisions/SCOPE-086-095-nondefault-issuer-v1-scope-and-product-milestones.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-096-100](../decisions/SCOPE-096-100-reference-instrument-validation-selection.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-101-108](../decisions/SCOPE-101-108-instrument-families-and-extensibility.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-109-116](../decisions/SCOPE-109-116-cde-extension-gap-review.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-117-125](../decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-126-133](../decisions/SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-134-142](../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-143-151](../decisions/SCOPE-143-151-AB-scope-comparison-and-v1-freeze-gates.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-152-159](../decisions/SCOPE-152-159-batch01-commercial-tenant-access-depth.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-160-167](../decisions/SCOPE-160-167-batch02-asset-instrument-documents-review.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-168-175](../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-176-185](../decisions/SCOPE-176-185-batch04-investor-payments-registration-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-186-193](../decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |
| 分批产品决策 | [SCOPE-194-205](../decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md) | 对应主题的**已批原则**；不是全部V1开发、字段PRD或资金/链生产授权 |

以上决定均在 `decisions/` 保留原路径；旧 V1 P0/P1/P2 的含义按当时阶段记录，不能代替现在V1.0实际交付版本。

## 五、Instrument产品权益样本与长期扩展

| 文档组 | 当前状态与边界 |
|---|---|
| [Instrument A～E权利家族及扩展边界](03-product-prd/RWA-SaaS-Instrument-Families-and-Extensibility-Boundaries-v0.1.md) | SCOPE-101～108家族原则Approved；具体产品化/法域仍Draft |
| [C/D/E 18差距评估](03-product-prd/RWA-SaaS-CDE-Instrument-Extension-Gap-Assessment-v0.1.md)、[正式审查](03-product-prd/RWA-SaaS-CDE-18-Gaps-Formal-Product-Review-v0.1.md) | SCOPE-109～116原则Approved，CDE生产支持并未获批 |
| [A债权工具场景](03-product-prd/RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)、[A1息票到期/异常](03-product-prd/RWA-SaaS-Debt-A1-Coupon-Maturity-and-Exception-Validation-v0.1.md) | SCOPE-117～133产品原则Approved；法律计息模型与所有场景实际执行均未完成 |
| [B SPV股份工具场景](03-product-prd/RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md) | SCOPE-134～142 Approved；合法股权、真实现金流和具体技术方案未确定 |
| [A/B与187项必要性核对](03-product-prd/RWA-SaaS-AB-187-Function-Need-and-V1-Freeze-Gates-Review-v0.1.md)、[功能验证底表](03-product-prd/RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md) | SCOPE-143～151原则 Approved，187功能仍Not Tested；不是实际投资工具许可或V1范围冻结 |

## 六、历史工作稿和正式文档编号

- 原四份外部RWA V2 PRD已存在 [只读历史归档](00-reference-archive/README.md)：**不具备本项目批准效力**。
- 原Step02 v0.1/v0.2、旧P1/P2和非默认范围研究等11份材料已在原路径标记 `Historical / Superseded as current reading entry`；可在[权威索引完整历史清单](00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md#5-历史已接续草案名单本轮仅打标签不移动)找到，**历史已获批SCOPE仍有效**。
- 本项目原“十份核心文档”目录编号是初始结构框架，不表示十份产品文档都已编写。05合规、06UI、07架构、08法律、09商业、10研发交付目录仍含占位；实际产品详细PRD需按Step04/05形成，不可借目录名称制造完成状态。
- [Step03.5首轮95项逐文件建议](00-governance/RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md)保留完整旧状态与材料溯源；README不再复制大量历史审核长表。

## 七、持续未决的实施门与后续计划

1. **首发市场/法域、Issuer/SPV责任、首发法律Instrument，合法发行/托管/支付主体及许可**：仍需法务/实际业务主体证据，不在本轮文档整理中擅定。
2. **真实商业计费、钱包模型/密钥恢复、合约审计与Signer、资金收付与合法释放、收益Push/Claim法律完成时点**：产品方向部分Approved，但真正生产技术/法律方案TBD。
3. **Step03已完成逐ID版本归属审批（DEC-017）**：193项每个功能已有唯一正式版号或TBD。**Step04已审核首批16项，余130项继续分批→Step05字段级PRD→Step06跨文件一致性及V1整体冻结→UI**。若首发工具依法要求集中募集，则Step06冻结前必须单独复审M05-F011、M10-F009、M12-F009/F010等交付版本。
4. **仓库与审批状态**：PR #6 **Draft/Open/Unmerged**，base `docs/initial-asset-scope-v01`；未经产品负责人明确授权，不合并、不改写任何Frozen/DEC/SCOPE、不进行真实资金或链上发行执行。

**本索引只管理已有文档状态与引用。任何后续变更继续通过独立产品决策与新的PRD版本记录。**

## 八、Step04分端功能设计（持续更新）

- **已批准**：[DEC-018](../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)确认S04-01-01～06全部A，[DEC-019](../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)确认R01～R05全部A；[S04-01 Issuer基础＋试用订阅v0.2](03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)现行整合稿覆盖M01-F001～009、M02-F001～007这16个正式V1.0 ID的角色、逻辑页面组、操作、状态异常类别和跨端主责。
- **进度权威**：[V1.0 146项Step04分端追踪表](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)：16 Approved，130待审；M03与M17～M22在本批仅作依赖引用，不算其自身设计已通过。
- **下一审核批次**：S04-02 M04/M06 Issuer资产与Instrument、法律和专业文件。完整分端/外部服务与跨流程追溯需在S04-09收口。
- **审批纪律**：DEC-017逐ID版号不变，详细字段/接口和生产外部执行仍TBD；Step04单批Approved≠Step04整体完成、更不等于V1.0 Frozen。PR #6 Draft/Open/Unmerged，不触碰历史Frozen正文。

**DEC-019后续生效说明**：原S04-01 v0.1（DEC-018批准）作为历史审批证据原样保留；当前应按v0.2理解“邮箱注册先进入14天试用、正式付费前KYB、一款Standard、试用到期只读30天、Paid客户金融义务保护”。DEC-010关于价格及免费试用此前未决的状态已被DEC-019**就试用长度与正式套餐数量局部决定**接续；金额、额度、服务商与实际法律/工程方案仍TBD。未启动S04-02。
