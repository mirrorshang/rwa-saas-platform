# RWA SaaS｜样本 A：固定收益到期债权型 Instrument 参数与端到端业务规则审核 v0.1

> **Product Scenario / SCOPE-117～125 产品验证原则已批准；具体利息定价、规则深度及实际测试仍 Draft / Not Executed。** 参见[正式决策](../../decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md)。不存在链上测试 PASS、法域法律认可、真实发行或 V1 最终范围冻结。
>
> 编制：2026-10-22。对应 [SCOPE-096～100：A/B 参考样本选样已批准](../../decisions/SCOPE-096-100-reference-instrument-validation-selection.md)；[第 04 份冻结核心流程](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[187 项五类范围矩阵](RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md)、[A/B 187 功能待验证底表](RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md)、[SCOPE-078～085 条件性 P1](../../decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md)、[SCOPE-071～077 受权外部执行](../../decisions/SCOPE-071-077-external-execution-authority-controls.md)、[ARCH-001](../../decisions/ARCH-001-api-first-unified-business-core.md)。
>
> **这里选择的是债权权利结构，不是实际资产、发行法域或生产可用证券。** 金融工具可能被适用法域认定为证券或其他受监管投资；许可、票据法律效力、持有人登记、收益支付、面向何种投资者及合约权利关系都必须由适格责任方及实际法律文件确认。本稿中称「应支持」均指**若该 Instrument 由适用法律/合同要求则应具备产品处理能力**，不是声称 SaaS 自身具有发行/托管/兑付资格。

## 1. 验证目标及样本限制

目标：在**相同 Issuer SaaS API-First 核心**上验证 A 债权从 Tenant→Asset/Instrument→Project/Offering→KYC/资格→认购/额度→真实稳定币到账和对账→受权配售→法定登记及真实 Token→利息/还本→到期赎回/结束的**完整逻辑**，并将每一步的**业务事实、事件版本、执行者、失败/Unknown**和条件性 P1 交付必要性标清。

样本 A 的**候选产品定义**：
- 合法适格发行/债务主体承诺按核准债权文件支付**固定利息**，并于**明确到期日偿还本金**；投资者的主张是对相应义务人的债权请求权，并非直接获得抵押/底层资产所有权。
- 必须明确：债务人、发行主体及付款责任主体是否相同；是否担保、受偿顺位、代理人/登记机构、提前赎回、违约及强制执行规则均未预设。
- 技术上 RWA Token 应真实上链；**Token 数量、链上持有人、合同债权权益人、法定登记/受益人记录**分别存证和核对，不能将任一个自动等同其他三个。
- 上述样本只覆盖一种**固定收益、到期还本**的债权家族路径，不推断覆盖零息债、浮息票据、贷款转让、资产证券化、永续/可转债和复杂债务重组等全部 A 家族变体。

## 2. 债权 Instrument 参数定义（产品字段草案，非数据库结构已冻结）

| 参数组 | 应有的业务字段或判定 | 权威责任/Guard | 决策状态 |
|---|---|---|---|
| Instrument 标识与归属 | instrument_id、asset_ref、issuer/obligor_id、legal_form、jurisdiction_context、security_id（适用）、series_id、instrument_version | M04；不由营销资产类型推断法定债权；真实实体和合同合法性待法律核对 | Draft |
| 债权经济条款 | face_value / nominal_amount、currency_of_obligation、unit_nominal、issue_price_rule、total_authorized_principal、max_units、min_lot、unit_precision | M04 + M05/M12；本金计价、实际发行支付币种与 Token 单位不可混同 | Draft |
| 利息与计量 | fixed_coupon_rate、rate_basis（年率等）、day_count_convention、accrual_start、coupon_frequency、payment_schedule、record_date、payable_currency、rounding_policy | M04/M13；不得不经规则版本同意而默认按钱包即时余额/简单日均计算 | Draft |
| 债务期限 | issue_date / effective_date、maturity_date、maturity_amount_rule、business_day_calendar、payment_due_adjustment | M04/M13；业务日历、时区/假日调整与按法域权利日期验证 | Draft |
| 系列/分笔认购 | series_id、cohort_or_lot_id、sale_window、pricing_effective_at、accrued_interest_treatment、remaining_term_exposure | M04/M05/M10/M13；连续购买晚入场者需明确应计利息和各批次的权利生效时点 | **待本批重点评审** |
| 利息/本金权利人 | legal_register_authority、registered_holder_key、beneficial_owner_ref（适用）、record_date_rule、legal_effective_time、rights_snapshot_id | M12/M13；真实法定登记权威和法律生效时点未定；不能仅按 Token 地址计算应付额 | Draft |
| 赎回/注销 | early_redemption_permitted、redemption_approval_required、redemption_price_rule、burn_or_freeze_policy、legal_discharge_evidence | M07/M13/M12；本金实付、法律债务解除、权威登记变更、Burn 顺序按具体工具决定 | Draft |
| 投资者限制与披露 | eligibility_rule_version、geography/type_limits、lockup/transfer_rules、offering_document_version、signature_requirements、formal_notice_channels | M05/M06/M07/M09/M18/M19；KYC≠Offering 资格≠债权法定归属；M14 转让仍 V2 | Draft |
| 受权资金和 Token 基础设施 | permitted_payments（chain_id、stablecoin_contract、decimals）、legal_collection_party、refund_party、principal/coupon_payer、token_contract、authorized_signer、evidence_source | M05/M07/M11/M13/M22；各角色合法受权及技术链/合约均另行审批；禁止用预设假 USDC/链作生产配置 | Draft |

**计价特别说明**：债权本金额度（例如 USD 计价的名义本金）、投资者实际支付资产（USDC/USDT）与 Token 数量可能使用三种不同单位；即便采用相同符号，也不得未经法律/合同和汇率/换算规则批准直接视为 1:1。明确交易报价/最低单位/利息归属、精度/舍入/余款及分币种收付，是安全必需条件。

## 3. 持续购买与固定到期债权的兼容门（高优先级）

当前已批准原则：**Issuer V1 优先完整支持 ContinuousPurchase**；但债权 Instrument 若依法/合同必须集中认购或统一配售，则需按 SCOPE-078 补齐必要 BatchAllocation，不能为满足产品默认而违反工具条款。

有两种应明确评审的债权构型，**不得在同一个 Offering 中偷偷混用**：

| 候选发行构型 | 经济含义 | 潜在优点 | 必须处理的风险 |
|---|---|---|---|
| **A1 同一债务 Series、统一到期日/付息日** | 投资者可在批准窗口分笔取得同一 Series 的债权单位 | 最符合“持续购买同一 Offering”的直觉；债权权利保持同一系列 | 后买投资者剩余期限更短，需显式规定**溢折价、应计利息、付息记录日和权利生效点**；固定价不一定公平/合法 |
| **A2 每次或每个 Cohort 独立起息/到期** | 一次购买对应独立债务批次/票据或分系列 | 单笔购买可有明确的独立利息期/偿还计划 | 增加独立 Instrument/Series、合约供应量、登记和兑付管理复杂度；不再天然是完全相同权利 Token |

**本稿推荐**：先用 **A1「统一 Series 和到期日」**作为第一条产品验证路径，**不预设购买价格永远等于票面本金**；在资料未确认计息起点和晚入场报价规则前，禁止将“持续购买已经可生产执行”标为通过。同时保留 A2 作为评审对照和未来/特定 Instrument 合同触发时的范围候选，**不默认加入 V1 完整开发承诺**。

**须回答的实际问题**：
1. 利息从债务法律生效、Series 起息、投资者获配/登记，还是具体交易交割日开始？如果发行期跨越计息日，购买价如何处理？
2. Coupon 的**record date**、ex-coupon、迟到账/迟登记、Token 链上交付延迟的收益归属如何确定？
3. 若发行窗口在首个付息日后还保持 Open，后入投资者是否享有下一次完整票息？何种定价/补偿和法律文件已预先批准？
4. 期限到期日固定时，报价时向投资者展示剩余期限及实际支付安排，避免误导为每单自动拥有完整约定年限。

## 4. 角色与主要业务权威

| 角色/主体 | 业务职责 | 不能代替的权威 |
|---|---|---|
| Issuer / Obligor（可能不同） | 提供债权法律文件、条件、债务责任、Offering 范围；按适用法律向授权方承担本金/利息义务 | SaaS Tenant Active 不等于发行资格；Issuer 不一定是实际受托资金控制方 |
| 发行项目负责人 | 提交资产、Instrument、Offering 参数及文件；申请发布、暂停、异常纠正 | 不因为“创建者”身份即可自审法定债权或资产权属 |
| 发行/合规/法律责任人 | 依据法域、客户和债务工具对条款、投资者适格、自动化 Guard 与必要专业意见审批 | 外部电子签返回成功不代替完整合法要件 |
| 投资者 | 完成身份、Offering 资格/文书、报价确认、从授权账户/钱包发起外部付款；绑定合法 Token 接收钱包 | 来源付款地址≠接收钱包≠债权法律持有人 |
| 收款/退款及兑付资金控制方 | 保有/核实真实到账、退款及后续本息付款的权威财务凭证 | SaaS 不能通过后台人工勾选伪造已到账/已付 |
| 债权法定登记/权利代理责任人 | 确认债权份额与生效时点、权益变更及到期/偿付登记要求 | 链上 Token Mint ≠自动完成权利登记 |
| Token 合约与签名执行人 | 依据授权进行合约部署、Mint/暂停/销毁等不可逆操作并提供链上可验回执 | SaaS 平台客服权限≠链上签名授权 |
| SaaS 平台与业务模块 | M01/M04/M05/M09/M10/M11/M12/M07/M13/M17/M19/M22 维护领域业务事实、Guard、幂等与审计 | 本平台不默认掌握资金/私钥，也不自动成为法定登记机构 |

## 5. 端到端主线与冻结 WF 对照（仅产品级案例）

| 节点 | 上游对象/Guard | 成功输出及权威对象 | 不能跳过的异常/冻结边界 | WF / 主要模块 |
|---|---|---|---|---|
| A-01 客户开通 | 合同/租户授权、机构角色有效 | Tenant Active、成员范围隔离 | 不等于法律发行许可 | WF-01/02；M01/M02/M03 |
| A-02 Asset 与债权条款 | 资产/项目关联、债务人、法律文件、Series 参数和审核证据齐全 | M04 Asset 和 Instrument 版本 ReviewedForUse（内部使用） | 条款变更必须留版本，内部 Reviewed 不等于合法可发行 | WF-03；M04/M06/M19 |
| A-03 Project / Offering | Approved Instrument 版本、系列额度/价格/利息、资格/签署、收款与登记/Token 方案、受权自动化全部就绪 | M05 Offering 从 Draft→SubmittedForReview→ApprovedNotPublished→Open（依据各 Gate） | 法定发行条件/执行主体未定不能真实 Open | WF-04/05；M05/M19 |
| A-04 投资者准入 | 身份/AML 完成、该 Offering 资格有效、合法签署与接收钱包合规 | KYC、Eligibility 各自独立有效；投资者可取得 Quote | KYC Verified 不自动代表 Eligible | WF-06/07；M08/M09/M06 |
| A-05 订单、报价、预留 | Offering Open、Series 版本/价格/应计利息/数量有效，预留可用 | M10 Subscription + QuoteSnapshot；M12 独占 Reserved | 两个并发订单不能超售；已发报价不能静默改价 | WF-08；M10/M12 |
| A-06 真实稳定币付款 | 已生成合法付款安排和链/资产/金额/收款地址 | M11 原始链上 Receipt Confirmed 与 Reconciliation Matched（两步独立） | 广播不等于到账；跨链/假币/迟到账/重组、不同真付款、重复回调隔离 | WF-09；M11/M22 |
| A-07 受权配售 | 付款对账、资格版本、额度锁定、条款和自动化批准仍有效 | M12 Allocation id/数量/法定权益引用；Reserved→Allocated 原子转换 | 规则撤销/资金未知→NeedsReview；不能无审批重复配售 | WF-10；M12/M19 |
| A-08 债权登记与 Token | 已配售数量、登记和执行顺序依法约定、接收钱包/合约及授权有效 | M12 权威登记结果及 M07 真实 Mint/Finality，DeliveryReconciliation 独立完成 | 登记和 Token 不一致/Unknown 不盲目再次 Mint；“交付完成”不是“付款已确认” | WF-11；M12/M07/M22 |
| A-09 存续期与票息 | 有效 Series 票息条款、权益记录日/债权登记快照、持有人资格与计算规则 | M13 计息事件、复核批准、外部出款回执/应付实付对账；必要披露/通知 | 计算完成≠钱已付，付款方和法定受益人必须核对 | WF-13；M13/M18/M21 |
| A-10 到期还本/赎回 | 到期条件和未结争议、法定权利/抵押担保要求、受权支付方/合约管理方 | 本金应付、外部实际偿付与对账、必要登记变更和受权 Burn/冻结/权利注销证据 | 偿付与 Burn 顺序必须依真实 Instrument 方案；Unknown 不盲目再转款/再 Burn | WF-13/11/18；M13/M12/M07/M17 |
| A-11 关闭与保留 | 现金、登记、Token、未结票息/本金和异常已结清或合法转交 | M13 存续档案与 M05 Offering/Project 独立收尾 | Offering 收单结束不等于债务到期/消灭，也不等于 Project 可终止 | WF-05/13/15；M05/M13/M20 |

**主线判定**：只有符合适用 Instrument 的**全部法律交割/权利登记与实际 Token 确认**后，投资者端才可显示「购买完成」。后续票息、还本是独立义务，不应要求待本金最终偿清才承认此前有效认购；也不能在未付本金时将债务业务标为已清偿。

## 6. 债权本金、份额、额度、收益的四种数量关系

| 业务量 | 示例业务口径 | 唯一业务权威与核对要求 |
|---|---|---|
| 名义本金/债务余额 | 本金额度（法定计价币种），扣除已发生且有效的债务解除或部分清偿事件 | M04 条款定义、M13 存续及合法偿付事实 |
| 发行可用容量 | Free / Reserved / Frozen / Allocated（同口径互斥分桶） | M12 唯一发行额度账本；Token 链上发行量只是交叉核对 |
| Token 数量及总供应 | 每个 unit 可能对应一固定面额债权；兑换比例必须依据合约/法律条款版本 | M07 真实链上供给量与合约事件；不能将销毁直接当作法律本金消失 |
| 持有人应付票息/本金 | 有效权益快照 × 票息/本金规则，按生效的记录日、单位精度、四舍五入和权利更正规则 | M13 计算/复核；M12 法定权利登记；外部实际支付事实单独核对 |

**反例**：一个 Investor 有 10 枚 RWA Token 不意味着其法定持有名义本金恰好是“10 美元”，也不意味着可忽略一张授权登记回执。名义本金、Token ↔债权单位映射和权益记录日必须被批准。

## 7. 样本 A 条件性 P1 必需性检查（仅按样本设计推演）

| 已批准 P1 功能 | 样本 A 需求级判断 | 何时必须作为 V1 的最低能力 | 审批/验证门 |
|---|---|---|---|
| **M05-F011 / M12-F010** 集中募集/配售 | **条件性** | 真实适用债权合同/法域需要统一募集截止或集中配售时 | 发行模式和资金-配售先后 |
| **M10-F009 / M12-F009** 部分认购/配售 | **条件性** | 条款允许或要求部分接受/分配、余款退款时；无论是否启用高级 UI，少付/多付必须安全处置 | 部分购买合法条件和精度 |
| **M07-F009** Token 赎回/销毁 | **工具触发，需重点验证** | 到期偿还后，法律/合约要求注销、Burn 或冻结时 | 债务清偿证据、登记时点及 Token 不可逆操作 |
| **M13-F004/F005/F006** 票息/还本事件、计算、外部支付 | **本样本权利义务必需** | 既然样本定义固定利息和到期本金债务，产品最低能力必须覆盖计息/应付、复核、外部实付核对 | 实际首发工具/法域责任主体仍待审，不在本稿冻结生产实现 |
| **M08-F009 / M21-F005** 债权持有人存续/披露 | **必要性依工具/披露要求；基本权利展示不可遗漏** | 条款或法域要求利息表、本金余额、记录日期、兑付与正式披露时 | 披露合法内容与可见权限 |
| **M11-F010** 付款差异人工调查 | **基础安全能力必需** | 任何真实认购到账引起少付、超额、迟到、链重组、关联疑点时 | SCOPE-082 已批准最低路径，P1 仅高级调查 UI |
| **M18-F004/F005** 法定通知与失败恢复 | **条件性** | 利息/到期/违约等必须通过特定渠道发出合法通知时 | 送达方式、凭证与人工补救 |
| **M19-F006** 平台强制规则优先级 | **基础安全能力必需** | 任何时候：平台安全/法定禁止规则不得被 Issuer Offering 覆盖 | SCOPE-084 底层 Guard 已批准 |
| **M20-F007 / M21-F006** 权利/报表/退出数据 | **最低合法或合同必要能力必需** | 法定登记、债权人名册、付息/本金凭证、租户合法数据移交时 | 责任主体、脱敏/授权/保留期限 |

**重要**：表中「本样本权利义务必需」仅为**设计需求判断**，不是将 P1 历史等级改为 P0、不是具体研发范围批准，更不是实际发行法域下的法律定性或 E2E 通过。

## 8. 必须检验的异常场景（需求级审核卡，均未执行测试）

| Case | 给定条件/触发事件 | 正确业务行为与不可发生的副作用 | 关联模块/WF | 状态 |
|---|---|---|---|---|
| **A-T01** | 同系列后一批债权认购，已开始计息 | 必须使用适用 Series/批次定价和起息条款快照；不能默默按首次票面价格或把历史期间利息自动给新持有人 | M04/M05/M10/M13 | Not Executed |
| **A-T02** | 投资者 KYC 已通过但 Offering 资格不符 | 拒绝有效购买指令及配售；保留资格原因/版本，不触发付款 | M09/M10 | Not Executed |
| **A-T03** | 同时争抢债权单位最后额度 | M12 唯一容量和原子预留；不得双售，Token 供应及总名义本金不可超限 | M10/M12/M07 | Not Executed |
| **A-T04** | 付款广播、未确认、网络超时 | 不等同 Matched；保护预留/查询真实转账，不直接释放或配售 | M10/M11/M12 | Not Executed |
| **A-T05** | 少付/多付、支付假 USDC、错链或迟到账 | 按独立资金事实/规则处理差异，不自动配售、改价或隐匿已收到资金 | M11/M12/M17 | Not Executed |
| **A-T06** | Webhook 重放同一 Tx；或确有两笔真实 Tx | 同一事件幂等，两个不同真实支付事件分别保留，不能重复认购/配售 | M11/M22/M12 | Not Executed |
| **A-T07** | 已到账、自动配售授权撤销或 Offering Paused | 保留有效资金对账、阻断不允许的配售/交付，并有人工批准/退款路径 | M05/M11/M12 | Not Executed |
| **A-T08** | M12 已配售，登记失败或外部登记 Unknown | 不假称债权已依法生效，不盲目 Mint/改写原配售；记录独立权威、按法律要求处置 | M12/M22/M07 | Not Executed |
| **A-T09** | Mint 已提交但回执 Unknown / 交易最终性变化 | 查询原 execution intent/链上 Tx/Event/nonce；禁止重复 Mint，受控更正与对账 | M07/M12/M22 | Not Executed |
| **A-T10** | 票息 record date 与 Token 链上交付延迟不一致 | 根据合法权威权益记录和批准的 record_date 规则计算，不靠当前钱包余额“猜”收款人 | M12/M13/M07 | Not Executed |
| **A-T11** | 票息算出但资金方尚未真实付款或失败 | Payment Due/Approved/Processing/Unknown/Confirmed 区分；不得将计算/审批等同已付 | M13/M22/M18 | Not Executed |
| **A-T12** | 已登记/交付后投资者要求普通退单 | 不直接退款和删债权；按法律允许的赎回、纠正或受控争议流程 | M11/M12/M07/M13 | Not Executed |
| **A-T13** | 到期本金已支付，但登记注销/Token Burn 失败 | 本金付款事实独立留存；法律债务消灭及 Token 状态依各自权威核对，不因为 Burn Failed 重新出款 | M13/M12/M07 | Not Executed |
| **A-T14** | 到期无法付款、出现逾期或债务违约 | 形成独立逾期/违约存续事件、受权责任升级、法定/合同披露和偿付证据；不能自动标 Done | M13/M17/M18 | Not Executed |
| **A-T15** | 多 Offering 共用某 Series 债务总额度 | 权威发行总名义本金、法定已登记债务总量、Token Mint 总量跨轮次核对，不能在两个工作区超发 | M05/M12/M07/M13 | Not Executed |
| **A-T16** | 客户暂停、Offering 收单结束但债务未到期 | 禁止新购买但仍履行/交接尚未到期的付息、到期本金、退款和报告；不能以租户退出抹去债务 | M01/M05/M13/M20 | Not Executed |

**验证类型**：上述 A-T01～T16 是产品审核卡（Test Design Only），尚未运行真实/模拟链、支付、合约、API、UI 或代码 E2E。全部 187 项 A/B 原验证底表仍应维持 Not Tested。本文的“验收期望”不是软件测试报告或真实金融法律意见。

## 9. 对 UI/UX、API 与模块详细 PRD 的直接输入

**Issuer 工作台**：Project/Offering 详情中按逻辑区展示 Instrument 法律权利版本、Series 票息/到期、募集价格与权利生效、正式文件/审核、资金安排、配售/登记/Token 和存续义务；不额外要求独立债券交易所 UI。资金/登记/Token 状态在同一详情页可汇总，但不能合并后台权威。

**投资者门户**：购买确认之前清晰区分票面本金、**实际应付金额（含可能应计利息/费用）**、固定年利率、剩余期限、付息日、风险与合同条款，展示支付币种和 Token 接收钱包。付款确认后显示「资产交付处理中」直到法律交割完成；持仓中展示持有债务单位、债权本金、下次应付及已付票息、到期还本状态，具体法律收益信息依适格权威记录。

**共享 API**：InstrumentVersion 与 SeriesVersion、OfferingTermsSnapshot、QuoteSnapshot、Reservation、PaymentReceipt/Reconciliation、Allocation、RegisterRef、TokenExecution、LifecycleEvent/DistributionPayment 的受权领域命令和事件可复用；外部 API 商业开放需后续独立审核，具体 endpoints/事件 schema、微服务架构和数据库设计不是本稿冻结内容。

**详细 PRD 的候选优先模块**：M04（债权参数/版本）→ M05（Offering 模式/条款）→ M10/M12（报价/预留/配售）→ M11（资金/退款）→ M12/M07（权威登记/Token）→ M13（利息/还本/赎回）；M09/M06/M17/M18/M19/M20/M22 为贯穿核心的合规和外部事实依赖。具体模块 PRD 开写及范围冻结另经产品负责人确认。

## 10. 已批准的九项产品验证原则（**SCOPE-117～125 Approved**）

| 编号 | 已批准原则（具体算法/法域和真实交付仍待定） |
|---|---|
| **SCOPE-117** | 将 A 参考 Instrument 定义为**合法债务人承诺固定利息、明确到期还本的债权型工具**，投资者权利按债权合同及权威登记判断；不假定 Token 自动产生债权，不默认有担保或资产所有权 |
| **SCOPE-118** | 以 **A1 同一 Series/统一到期及付息日**作为首条需求验证路径，并专门审核持续购买后加入者的应计利息、价格、记录日与剩余期限；A2 每笔/批次独立到期作为对照候选，不自动加入 V1 必交。真实发行依法须集中募集则遵守 SCOPE-078 |
| **SCOPE-119** | 建立 A 类 Instrument 的**名义本金/发行总额、Series、利率/计息基准、起息/付息日、到期日、合同与权威责任、转让/赎回限制、版本和生效时点**的最小产品参数规范；与 Token 单位、付款币种分离 |
| **SCOPE-120** | 确认 Offering 发布前完成债权条款/合法权利与专业审查、受权收款/签署/登记/Token、投资者资格/额度/持续购买自动配售规则的前置 Guard；已生效条款变更不能静默覆盖在途订单 |
| **SCOPE-121** | 沿用已批准 WF-06～10：KYC 与 Offering-specific Eligibility、QuoteSnapshot、原子预留、真实 USDT/USDC 付款与 Reconciliation 独立、依事前批准规则配售；补充债券晚入场应计利息/价格、名义本金与 Token 数量精度/对账 |
| **SCOPE-122** | M12 法定债权持有人登记引用、M07 Token Mint/交付和 M11 支付事实各自独立；配售和受权登记/链上执行遵守 Instrument 必要先后/最终性，Unknown 不盲目重复 Mint，购买完成视图不得提前 |
| **SCOPE-123** | 对 A 样本的固定票息、到期本金应明确按 **M13 事件/记录日/权益快照/计算复核/外部出款/对账**处理；赎回及 Burn、债权解除与登记注销的顺序依合法工具约定，逾期/违约和送达按适用义务触发 |
| **SCOPE-124** | A 案例的少付/多付、错误链、迟到账、并发超售、法定登记与 Token 不一致、已付但 Burn 失败、到期付款 Unknown、收益归属争议等须有受控恢复和可信证据；无证据不能伪造资金成功或法律完成 |
| **SCOPE-125** | 以上仅确认 A 样本的**产品设计与验证原则**；A-T01～T16 及已有 A/B 187 项均维持未执行，实际财务/法域/签名/登记主体、A/B 最终差异、V1 逐功能交付清单、技术/API/UI 详细规格和开发授权均须分别确认；PR #6 继续 Draft / Open / Unmerged |

## 11. 本轮结果与未决门

- **已完成（文档级）**：A 债权工具参数字段候选、A1/A2 两种构型风险、11 个主流程节点、16 张未执行的业务场景验收设计卡；**SCOPE-117～125 产品验证原则已由产品负责人全部批准**，详见[正式决策](../../decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md)。
- **仍未完成**：实际法域下的债权法律判断、债权 Series 定价与本息精确公式的后续具体审核、外部执行主体/链协议与适格受托方选择、187 项 A/B 证据级验证、软件 E2E、**真实 V1 开发交付范围的正式批准**。
- **下一批行动**：依据已批准 A1 Series 验证方向，进一步编制计息/票息权利、晚入场价格、到期偿付、登记/Token 差异及 Unknown 等的**专项验证 Draft**，之后对 B 权益型作差异验证，最终另审 V1 真实功能范围冻结。
- **不能直接变更**：第 02～04 份冻结基线、22 模块功能树、原 187 个 Mxx-Fxxx ID、SCOPE/ARCH/DEC 批准历史及独立商业 Open API/White-label 发布计划。

**文档状态：SCOPE-117～125 产品案例/验证原则 Approved；具体方案、软件测试、真实债权权利法律效力及 V1 功能交付仍 Draft/TBD。**
