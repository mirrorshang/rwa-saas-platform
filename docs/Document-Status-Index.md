# RWA SaaS Platform｜现行文档状态和决策索引

> **更新：2026-10-25｜DEC-017批准193项首次交付版号；DEC-018/019批准S04-01 16项及试用订阅，DEC-020批准S04-02 14项，DEC-021批准S04-03 19项，DEC-022批准S04-04 M09/M10/M12共24项及两条后续澄清，DEC-023批准S04-05 M11/M13共20项及R01/R02补充，DEC-024批准S04-06 M17～M21共31项，DEC-025批准S04-07 M08投资者门户11项，DEC-026批准S04-08 M03平台后台3项，DEC-027批准S04-09 M22外部服务8项；Step04九批146/146逐ID功能全部Approved、0待审；全量四端×11步静态一致性审计Draft待审核；整体V1.0未Frozen/未获真实生产授权。**
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
| Step04分端功能清单、Step05字段PRD、Step06交叉核验及最终V1冻结 | **Step04 146/146逐IDApproved、静态覆盖有条件认可；Step05-01～05五场景29条产品级R Approved（DEC-029～034），技术/法域仍Draft；五场景11步总体交叉审核与13项审计对照作为Step06冻结前Draft，X-01～X-13全Open，整体V1未Frozen** | [DEC-018](../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)、[DEC-019](../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)、[DEC-020](../decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)、[DEC-021](../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)、[DEC-022](../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)、[S04-04当前设计](03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)、[DEC-023](../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)、[S04-05批准设计](03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)、[跨批次批准澄清](03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md)、[146项追踪表](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)；字段/生产/UI未冻结 |
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

## 四、正式决策账（52份DEC/ARCH/SCOPE Markdown）

### 4.1 DEC-001～034（各DEC只批准自己明确列出的范围）

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
| [DEC-020](../decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md) | S04-02-01～06 A：M04 8项资产/Instrument、M06 6项文件/专业审核正式批准Step04端侧设计；批准时累计30/146，未冻结整体V1 |
| [DEC-021](../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md) | S04-03-01～07 A：Issuer M05 Project/Offering 10项＋M07 Token 9项端侧设计Approved，累计49/146；集中募集仍V2且依法需重审，生产授权未批准 |
| [DEC-022](../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md) | S04-04-01～07 A：M09投资者8项＋M10认购8项＋M12配售/登记8项（24）Approved，累计73/146；追加C01依法Issuer登记自管优先、C02合约地址与生效法律文书后置绑定原则，不代表法域法律效力已获准 |
| [DEC-023](../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md) | S04-05-01～07及R01/R02全部A：M11认购资金12项＋M13收益存续8项（20）Approved，累计93/146；链上收款合约优先评估/合法替代、真实预注资Claim优先/Push合法替代；生产资金/合约仍未获批 |
| [DEC-024](../decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md) | S04-06-01～09全部A：M17审批异常6＋M18通知5＋M19规则6＋M20安全审计8＋M21报表6，共31项；Step04累计124/146，余22待审，V1整体未Frozen |
| [DEC-025](../decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md) | S04-07-01～07七项全部A：M08投资者门户11项（账户/钱包、Offering、KYC引导、认购支付、订单持仓及收益）；累计135/146 Approved、余11项，未冻结V1或批准真实生产 |
| [DEC-026](../decisions/DEC-026-step04-s0408-platform-operations-approved.md) | S04-08-01～03全部A：M03客户商业KYB审核、Tenant受权开通暂停/恢复、敏感资料受控访问共3项；累计138/146 Approved、余M22 8项，未批准V1 Frozen或生产金融操作 |
| [DEC-027](../decisions/DEC-027-step04-s0409-external-authority-services-approved.md) | S04-09六组全部A：M22-F001～F008外部权威服务适配8项Approved；九批146/146逐ID全部批准，跨端/11步审计另为Draft且V1未Frozen |
| [DEC-028](../decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md) | Step04静态功能覆盖有条件认可，13项风险/法域/接口门仍Draft/Open；纠正历史企业入驻时序（先Trial后商业KYB）并建立Step05-01可视化Draft；无V1 Frozen/UI/开发 |
| [DEC-029](../decisions/DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md) | Step05-01-R01～03三项A正式批准：合法草稿原Tenant转正且模拟事实不变生产、KYB未通过保持受限与合法补件复核、已实付但授权失败核对原款后恢复原Tenant；字段PRD/接口/状态仍Draft |
| [DEC-030](../decisions/DEC-030-step05-01-r04-07-product-rule-closure-approved.md) | Step05-01-R04～R07四项A，连同DEC-029七条业务规则全部Approved；336/720小时UTC计时、KYB原案补件受权复核、草稿重核、双状态展示；技术字段/供应商/法域仍Draft |
| [DEC-031](../decisions/DEC-031-step05-02-r01-04-offering-visibility-publishing-disclosure-versioning-approved.md) | Step05-02-R01～R04四项A：Offering可见/可购买分离、Issuer七Gate发布前检查与受权发布、投资者合法权益优先详情、历史版本及在途影响处理；产品级PRD/状态异常Approved，具体技术法域Draft |
| [DEC-032](../decisions/DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md) | Step05-03-R01～R06全部A：投资者KYC/资格/钱包分离、Quote/签署/原子预留、稳定币真实匹配、合法配售、法定登记/Token分开确认、异常及退款多状态；仅产品规则Approved，技术/法域/持款/Signer仍Draft |
| [DEC-033](../decisions/DEC-033-step05-04-r01-06-post-issuance-yield-maturity-exit-product-approved.md) | Step05-04-R01～R06六项A：存续义务、法定记录日快照、A债权/B SPV权益收益分离、真实注资后Claim/Push、投资者实际付款分状态、到期清偿/名册/Token合法处置独立；仅产品规则Approved，真实资金/Signer/法域及API仍Draft |
| [DEC-034](../decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md) | Step05-05-R01～R06六项A：平台商业/Issuer真实金融角色分权、服务端Tenant及敏感权限、原Intent异常恢复、投递与法定送达分离、规则/审计/只读报表、外部环境凭证/合法退租交接；仅产品业务Approved，技术法域Draft，X-01～X-13未关闭 |

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
3. **Step03已完成逐ID版本归属审批（DEC-017）**：193项每个功能已有唯一正式版号或TBD。**Step04九批146/146唯一功能已批准、0项待逐ID审核；先审核全量交叉审计Draft→再Step05字段级PRD→Step06跨文件一致性及V1整体冻结→UI**。若首发工具依法要求集中募集，则Step06冻结前必须单独复审M05-F011、M10-F009、M12-F009/F010等交付版本。
4. **仓库与审批状态**：PR #6 **Draft/Open/Unmerged**，base `docs/initial-asset-scope-v01`；未经产品负责人明确授权，不合并、不改写任何Frozen/DEC/SCOPE、不进行真实资金或链上发行执行。

**本索引只管理已有文档状态与引用。任何后续变更继续通过独立产品决策与新的PRD版本记录。**

## 八、Step04分端功能设计（持续更新）

- **已批准**：[DEC-018](../decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)确认S04-01-01～06全部A，[DEC-019](../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)确认R01～R05全部A；[S04-01 Issuer基础＋试用订阅v0.2](03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)现行整合稿覆盖M01-F001～009、M02-F001～007这16个正式V1.0 ID的角色、逻辑页面组、操作、状态异常类别和跨端主责。
- **S04-02已批准**：[DEC-020](../decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)确认S04-02-01～06全部A，[S04-02 M04/M06完整设计v0.1](03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)覆盖8项Asset/Instrument和6项文件/专业审查；外部专业服务市场或高级协作未并入V1。
- **S04-03已批准**：[DEC-021](../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)确认S04-03-01～07全部A；[S04-03 M05/M07完整设计v0.1](03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)覆盖Project/Offering 10项与Token 9项，并保留M05-F011集中募集依法强制时V1冻结前重审。
- **S04-04已批准**：[DEC-022](../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)确认S04-04-01～07全部A；[S04-04 M09/M10/M12完整设计v0.1](03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)覆盖投资者准入、认购和配售登记24项；追加两条跨模块解释见[权威登记与合约地址绑定批准说明](03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md)。既有S04-02/03 Approved及四份Frozen正文不修改。
- **S04-05已批准**：[DEC-023](../decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)确认S04-05-01～07、R01/R02全部A；[S04-05资金与收益存续批准版](03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)覆盖M11/M13共20项，智能合约收款与预注资Claim是依法可行性/技术安全条件下的优先评估方向，保留合法其他通道，未批准真实生产。
- **S04-06已批准**：[DEC-024](../decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md)确认S04-06-01～09全部A；[S04-06共享工作台31项批准设计](03-product-prd/RWA-SaaS-Step-04-S04-06-Shared-Workflows-Rules-Audit-Reports-Approved-v0.1.md)覆盖M17～M21的审批/异常、通知、规则、安全/证据及只读报表。31个唯一ID首次计入Step04；不改变V1版号、不进入UI/开发。
- **S04-07已批准**：[DEC-025](../decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md)确认S04-07-01～07七项全部A；[S04-07 M08投资者门户11项批准设计](03-product-prd/RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)覆盖账户、Offering、KYC引导、认购支付、订单持仓、外部及嵌入式钱包与收益；M08-F010营销仍TBD。
- **S04-08已批准**：[DEC-026](../decisions/DEC-026-step04-s0408-platform-operations-approved.md)确认S04-08-01～03全部A；[S04-08 M03平台后台3项批准版](03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md)覆盖SaaS商业KYB、Tenant开停恢复、敏感资料最小权限；商业权威M01、共享安全M20不重复计ID。
- **S04-09已批准**：[DEC-027](../decisions/DEC-027-step04-s0409-external-authority-services-approved.md)批准M22外部权威适配八项；[S04-09完整批准版](03-product-prd/RWA-SaaS-Step-04-S04-09-External-Authority-Service-Adapters-Approved-v0.1.md)。
- **全量交叉审计仅Draft**：[146项×P/I/V/X×11步一致性审计Draft](03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)逐ID静态核验146行，列出13项待解决门，并**未得到产品负责人对审计结论的正式认可**；不可据此宣告整体V1 Frozen。
- **进度权威**：[V1.0 146项Step04分端追踪表](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)：146 Approved，0待审；各模块逐ID审核完毕，跨端审计Draft待审，不能因依赖引用而重复计数。
- **下一次产品负责人审核**：先评审上述Step04全量一致性审计Draft及13项待决事项；再决定Step05字段级PRD启动顺序，不自动进入Step06 Frozen。
- **审批纪律**：DEC-017逐ID版号不变，详细字段/接口和生产外部执行仍TBD；Step04单批Approved≠Step04整体完成、更不等于V1.0 Frozen。PR #6 Draft/Open/Unmerged，不触碰历史Frozen正文。

**DEC-019后续生效说明**：原S04-01 v0.1（DEC-018批准）作为历史审批证据原样保留；当前应按v0.2理解“邮箱注册先进入14天试用、正式付费前KYB、一款Standard、试用到期只读30天、Paid客户金融义务保护”。DEC-010关于价格及免费试用此前未决的状态已被DEC-019**就试用长度与正式套餐数量局部决定**接续；金额、额度、服务商与实际法律/工程方案仍TBD。此为历史S04-01补充说明；后续S04-02/03/04/05已依DEC-020/021/022/023批准；C01/C02是DEC-022对M12/M06/M07/M05适用责任与文书时序的后续解释，R01/R02是DEC-023对M11/M13资金通道/分配执行的后续解释，均不另增功能ID。


## 九、2026-10-25 S04-06正式批准后最新进度（DEC-024）

当前Step04**124/146 Approved，22/146待审**。M17～M21共31个V1 ID已按DEC-024逐ID完成端侧功能设计；其余M08 11项、M03 3项、M22 8项将在S04-07～09分别审查。具体权限阈值、字段、API/数据模型、法律责任、实测验收均未完成；V1.0整体不是Frozen。决策与正式设计见[DEC-024](../decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md)、[S04-06设计](03-product-prd/RWA-SaaS-Step-04-S04-06-Shared-Workflows-Rules-Audit-Reports-Approved-v0.1.md)与[146项追踪台账](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。


## 十、2026-10-25 S04-07正式批准后最新进度（DEC-025）

Step04当前为**135/146 Approved、剩余11项待审**（M03 3、M22 8）。[DEC-025](../decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md)批准S04-07七组A共11个M08 V1功能；[完整产品设计](03-product-prd/RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)、[146项主追踪台账](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)同步。上一节DEC-024之124/146为当时审批历史状态，不再代表当前最新进度。DEC-017版号、四份Frozen与既有DEC/SCOPE正文不修改；UI、研发、生产资金和链上执行及V1整体Frozen仍未获批准。


## 十一、2026-10-25 S04-08正式批准后当前状态（DEC-026）

Step04**138/146 Approved，8项待审**（仅M22-F001～F008）。本次[DEC-026](../decisions/DEC-026-step04-s0408-platform-operations-approved.md)批准M03-F001/F002/F005三项平台运营后台设计，对应[完整产品规格](03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md)和[146项追踪台账](03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)；DEC-025原135/146为当时已批准历史记录。不得修改193项版号/历史Frozen及DEC/SCOPE；具体法域、API、钱包/Signer、真实资金生产、UI研发与整体V1冻结尚未批准。


## 十二、2026-10-25 DEC-027与Step04全量静态审计（当前权威）

[S04-09 DEC-027正式批准](../decisions/DEC-027-step04-s0409-external-authority-services-approved.md)使Step04**146/146唯一V1.0功能逐IDApproved、0待审**；[M22批准详细设计](03-product-prd/RWA-SaaS-Step-04-S04-09-External-Authority-Service-Adapters-Approved-v0.1.md)生效。[四端×11步全量静态审计Draft](03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)执行193主表与146台账逐行对账、146功能与11步和P/I/V/X端映射，发现13项待解决事项（高9/中3/低1），尚未由产品负责人确认。因此**Step04逐功能审批覆盖完成，但全量交叉审核尚未签收，Step05/Step06及V1整体Frozen未完成**。不修改四份Frozen/历史DEC/SCOPE，不自动合并PR #6或进入UI研发、真实金融/链上生产。


## 十三、DEC-028后续：静态覆盖有条件认可及可视化Step05（2026-10-25）

[DEC-028](../decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)限定为146功能×四端×11步的静态覆盖有条件认可，[Step04完整审计Draft](03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)中X-01～X-13仍待跟踪，**不等于审计全文Approved或整体V1 Frozen**。依据DEC-019，先注册验证、自动开14天受限Trial，再试用期间商业KYB与Standard合同/真实付款，在原Tenant转正。历史[Step02 v0.3](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)不覆盖，新版[Step02 v0.4勘误图](04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-DEC019-Onboarding-Corrected-v0.4-Draft.md)作为有效时序参考。已创建[Step05-01企业入驻可视化PRD Draft](03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)，产品负责人后续按页面、角色、数据交接与异常审核，字段/API/生产许可仍未批准。PR #6 Draft/Open/Unmerged。


## 十四、Step05-01三项规则已批准、字段和状态规范仍Draft（2026-10-25）

- [DEC-029](../decisions/DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)仅将**Step05-01-R01/R02/R03三项业务规则Approved**，补充意见无。R01原Tenant和合法草稿保留、模拟事实不可转真实；R02商业KYB不通过不立即删除受限Tenant并按法定限制提供补件/复核；R03真实商业付款确认但Tenant升权失败时，核对原付款并恢复原Tenant，不重复扣款/建Tenant。
- [Step05-01字段级PRD Draft v0.2](03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)记录**8类业务对象、65项字段候选**，保留旧v0.1可视化草案；[独立跨端状态与异常规范 Draft v0.1](03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-States-Exceptions-Draft-v0.1.md)记录**10类业务状态、10条迁移建议、15项异常及未来验收**。这些新增字段、类型、精度、权限与接口仍**Draft，不自动Approved**。
- Step04继续**146/146逐IDApproved**且全量静态审计**13项Open**，DEC-017原193项首次版号不变，四份Frozen与既有DEC/SCOPE正文不修改，PR #6不合并，未进入UI/开发或真实金融生产。


## 十五、Step05-01产品级收口及Step05-02可视化Draft（2026-10-25，当前权威）

[DEC-030 R04～R07 Approved](../decisions/DEC-030-step05-01-r04-07-product-rule-closure-approved.md)接续DEC-029 R01～R03，使Step05-01**七项产品级业务规则全部Approved**。当前现行批准文档：[产品级详细PRD v0.3](03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)与[跨端状态/异常规范v0.2](03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md)；二者的具体字段/API/schema、供应商/商业价格、法域、测试仍Draft或Not Executed，旧v0.1/v0.2 Draft历史稿保留。下一场景[Step05-02发行与投资者披露可视化Draft](03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md)已提交，仅供审核，**R01～R04全部待决，不得误标Approved**。DEC-017版号、Step04 146/146、13项跨端审计门Open不变；四份Frozen/历史DEC/SCOPE未改，V1整体未Frozen，PR #6 Draft/Open/Unmerged。


## 十六、DEC-031：Step05-02发行至投资者披露产品级规则收口（2026-10-25）

[DEC-031正式四项A](../decisions/DEC-031-step05-02-r01-04-offering-visibility-publishing-disclosure-versioning-approved.md)批准Step05-02-R01～R04产品业务行为：合法Offering披露与当前投资者可认购分离、Issuer P-01～P-07缺项Guard和明确受权发布、合法Instrument权益优先展示、正式文书/条款/合约地址变更的历史快照和必要在途评估。现行产品阅读入口：[Step05-02产品级详细PRD Approved v0.2](03-product-prd/RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)及[跨端状态/异常规范 Approved v0.1](03-product-prd/RWA-SaaS-Step-05-02-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)；原[Step05-02可视化v0.1历史Draft](03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md)不静默更改。

**严格区分状态**：已批准的是四项产品级规则及其跨端业务状态/异常语义；字段API/Schema/实现enum、实际律师/Signer/资金方责任、披露法域与证券权利、合约部署及实测**全部Draft/Not Executed**。Step05-01七项产品规则仍Approved，Step05-03～05未审核，Step04共146/146，13项审计门继续Open，DEC-017 193项版号不变，V1整体未Frozen，不修改Frozen或历史DEC/SCOPE，不合并PR #6，不进入UI、开发或真实资金Token生产。


## 十七、Step05-03可视化产品审核已启动（2026-10-25）

[Step05-03投资者KYC→认购付款→配售/法定登记→Token交付可视化PRD Draft](03-product-prd/RWA-SaaS-Step-05-03-Investor-KYC-Subscription-Payment-Allocation-Register-Token-Visual-PRD-Draft-v0.1.md)为新建现行Draft；六组R01～R06均为推荐A但**待用户明确审核**，16项异常只是尚未测试的设计草案。上游Step04及Step05-01/02 Approved规则不变；Step05-03没有生成Approved DEC。法域/合法实际持款人、Issuer名册权威、嵌入式钱包与Signer、合约收款实际执行和法律文件，均待独立后续Gate；不得提前冻结V1.0或实施UI/真实金融生产。


## 十八、DEC-032已批准Step05-03；Step05-04六项待审（2026-10-25，最新）

- [DEC-032](../decisions/DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md)只批准Step05-03-R01～R06六项产品行为；正式产品文件为[Step05-03产品级PRD Approved v0.2](03-product-prd/RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)及[Step05-03跨端状态异常规范 Approved v0.1](03-product-prd/RWA-SaaS-Step-05-03-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)。原Step05-03视觉Draft作为历史保留。
- [Step05-04发行后收益/本息、Claim/Push和到期退出可视化Draft](03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)已新建，**R01～R06均待用户审核**；不应误标已批准或DEC-033已生效。
- 字段/schema/API、首发法域、适格收款/登记者、钱包及Signer/合约生产方案仍Draft，异常UAT Not Executed。Step05-05与Step06未完成，193项版本归属及Step04 146/146、13项审计风险Open不变，冻结原文/历史DEC/SCOPE无改动，PR #6不合并，V1整体未Frozen，不进入UI、开发和真实金融生产。


## 十九、DEC-033 Step05-04产品级收口，Step05-05 Draft（2026-10-25，最新现行）

- [DEC-033](../decisions/DEC-033-step05-04-r01-06-post-issuance-yield-maturity-exit-product-approved.md)正式批准Step05-04-R01～R06六项A；现行阅读入口：[Step05-04产品级PRD Approved v0.2](03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)及[跨端状态/异常规范 Approved v0.1](03-product-prd/RWA-SaaS-Step-05-04-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)。这两份仅产品行为/Guard Approved，真实法域/义务人、RecordDate/金额计算、税款、Claim/Push合约与Signer、技术API/schema及全部实际测试仍Draft/Not Executed。
- [Step05-05平台/工作流/外部服务可视化Draft](03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)已建立但**R01～R06全部待用户审核**，无DEC-034或该场景已批准PRD。Step05-01～04四场景的产品级规则Approved，Step05整体尚未完成；Step06 V1冻结另行审批。
- 193项版号与146项Step04 Approved不变，13项审计风险继续Open，四份Frozen/历史DEC/SCOPE原文不改，PR #6 Draft/Open/Unmerged，不进入UI/开发或真实金融执行。


## 二十、Step05五场景均产品级Approved，Step06冻结前13项风险仍Open（2026-10-25，现行）

[DEC-034正式决策](../decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md)批准Step05-05六项产品规则。现行产品需求：[Step05-05 PRD v0.2 Approved](03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md)、[跨端产品状态异常 v0.1 Approved](03-product-prd/RWA-SaaS-Step-05-05-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)，仅业务行为Approved、具体技术字段与UAT未批准或Not Executed；历史可视化Draft旧状态仅为历史记录。

[五场景总体一致性/11步与字段缺口冻结前审核Draft](03-product-prd/RWA-SaaS-Step-05-Five-Scenarios-Consistency-and-Step-06-Pre-Freeze-Audit-Draft-v0.1.md)、[DEC-028 X-01～X-13逐项对照Draft](00-governance/RWA-SaaS-Step-06-X01-X13-Audit-Gate-Crosswalk-Draft-v0.1.md)是**审计草案，不得自动冻结或关闭审计**。现五场景**29项R（7+4+6+6+6）**全部产品级Approved、Step04 146/146不变；13项审计风险仍Open（High9/Medium3/Low1），尤其法域/真实持款/钱包Signer、募集款实际释放、法律登记Token、API与UAT仍待专业证据与用户单独审核。四份Frozen、历史DEC/SCOPE和DEC-017 193项版号未修改，PR #6 Draft/Open/Unmerged，不进入UI、开发或真实金融/链上生产。
