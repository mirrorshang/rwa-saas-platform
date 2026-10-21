# RWA SaaS Platform｜第 04 份《核心业务流程与状态机》

**文档编号：04/10｜版本：v0.1｜编制日期：2026-10-21｜冻结日期：2026-10-21｜状态：Frozen（跨模块业务流程与状态机原则基线；非最终工程实施规格）。不构成研发或真实金融业务授权。**

**已获产品负责人原则确认**：第 04-01～04-42 项（其中 04-13～04-18 使用用户修订确认的版本），WF-01～WF-18 流程范围，优先「一次必要 KYC → 直接购买 → 指定链 USDT/USDC 支付 → 条件满足后自动分配 RWA Token」，INV-01～03 跨模块不变量，V1 只支持一级认购、V2 再规划受控转让。

**上游冻结资料**：[第 02 份战略](../02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)；[第 03 份总体 PRD](../03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)；[产品功能树与模块责任矩阵 v0.1](../03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)。关联 DEC-001～011，重点参见 [DEC-004](../../decisions/DEC-004-regulated-activity-responsibility-boundaries.md)、[DEC-007](../../decisions/DEC-007-investor-identity-and-kyc-data-reuse.md)、[DEC-008](../../decisions/DEC-008-subscription-funds-settlement-and-refund-principles.md)、[DEC-009](../../decisions/DEC-009-v1-secondary-transfer-boundaries.md)、[DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)。

> **冻结边界**：已冻结 WF-01～WF-18 的流程范围与责任、状态独立性、必要转换守卫与审批责任类别、INV-01～03 与异常控制原则、持续购买及在批准条件下自动交付方向、DEC-011 的 V1 一级认购/V2 受控转让版本边界。状态名称/代码、部分具体转换示例、角色阈值、额度账本技术实现与 E2E 自动化代码仍为后续详细规格候选；具体法域、金融工具、法律效力、资金责任、链与合约、生产环境及完整 V1 交付清单均未冻结。PR #6 不得合并。

## 1. 总体设计原则

1. SaaS 面向资产发行机构、White-label 运营商及 API 客户；投资者访问发行机构或获授权运营商门户，不默认建立 SaaS 厂商自营全球投资商城。
2. **默认投资体验**：浏览获授权 Offering → 首次完成必要 KYC → 每次购买由后台自动评估 Offering 资格 → 报价/额度预留/条款确认 → 稳定币链上付款 → 付款事实与对账 → 根据**发行前已批准**的规则自动配售 → 适用登记与链上 Token 交付 → 显示确认的持仓。符合条件不默认逐笔人工审批，不等募集期结束。
3. **Offering 双模式**：ContinuousPurchase（持续购买、满足条件后即时交付，优先）与 BatchAllocation（集中募集、统一配售，作为可配置扩展）。批准条款须包括模式、价格、额度、资格、支付轨道及适用的登记/Token 执行权限；条款生效后不得静默影响在途订单。
4. 每项业务对象有独立权威状态与记录；跨模块工作流只是编排，不能把 KYC、Eligibility、Subscription、Payment、Reconciliation、Allocation、Register、Token 和 Refund 混为一个成功/失败。
5. **自动化不等于跳过审批**：在发布 Offering 前由适用责任主体批准自动业务规则及执行权限，执行每笔订单时仍独立核验所有前置条件；依法或按合同要求逐笔审批的场景仍进入人工流程。
6. **责任与法律边界**：SaaS 不默认控制投资者资金、钱包私钥、法定权威登记或监管职责。真实发行、招揽、收款/托管、配售、法定登记、收益支付等须根据具体业务法域及合作方落实许可与责任。
7. **V1/V2**：依据 DEC-011，V1 交易能力聚焦一级发行认购；M14/WF-14 受控转让规划在 V2，V1 仍必须考虑合约级必要转让限制，避免通过外部钱包绕过适用规则。

## 2. 流程目录及主责任

| ID | 流程 | 主责任模块 | 版本/优先级定位 |
|---|---|---|---|
| WF-01 | 客户申请、合同、Tenant 开通/暂停 | M01 | 主线 |
| WF-02 | 组织、邀请、角色、权限撤销 | M02 | 主线 |
| WF-03 | Asset 与 Instrument 独立建档/审核 | M04 | 主线 |
| WF-04 | Issuance Project 创建、运行与结束 | M05 | 主线 |
| WF-05 | Offering 配置、审核、发布/关闭与条款变更 | M05 | 主线 |
| WF-06 | 投资者 KYC/KYB 核验 | M09 | 主线 |
| WF-07 | Offering 资格自动判定/人工例外 | M09 | 主线 |
| WF-08 | 即时购买、Subscription、报价与额度预留 | M10（预留请求），M12（配售额度核算） | 主线 |
| WF-09 | USDT/USDC 付款、到账与对账 | M11 | 主线 |
| WF-10 | 自动及集中配售 | M12 | 主线 |
| WF-11 | 权威持有人登记与 RWA Token 执行 | M12 / M07 各管独立事实 | 主线 |
| WF-12 | 退款、迟到账、异常资金处置 | M11 | 核心异常 |
| WF-13 | 发行后收益、还本、赎回、披露及异常 | M13 | 核心生命周期，工具适用性待定 |
| WF-14 | 受控转让申请至交割 | M14 | **V2 规划，V1 不交付转让工作流** |
| WF-15 | SaaS 暂停、退出、数据及责任迁移 | M01/M20 | 治理必需 |
| WF-16 | White-label 运营商及授权发行方 | M15 | 原则已定，具体交付批次待定 |
| WF-17 | Open API/SDK、凭证及业务 Webhook | M16 | 独立商业产品，交付批次待定 |
| WF-18 | 跨模块异常、补偿、人工纠正 | M17 | 共用控制 |

### 状态事件通用记录（建议字段）

entity_id、tenant_id、organization_id、project_id、offering_id、investor_id（适用时）、旧状态、新状态、动作、actor_id/角色、审批人、terms_version、rule_version、外部引用、chain_id、token_contract、tx_hash、event_at、received_at、原因、异常编号、审计证据、idempotency_key。不是所有对象都具有所有字段；涉及 PII 时采用最小化可见和必要脱敏。

每次转换必须定义**触发者、允许操作、Guard 条件、失败/Unknown 路径、审计证据和责任模块**。以下为本阶段建议状态词，产品负责人已批准原则，**状态枚举与实现细节尚未冻结**。

## 3. WF-01～WF-05：发行机构端及 Offering 状态机

### WF-01｜SaaS 客户开通、授权与暂停

- CustomerApplication：Submitted → Reviewing → Approved / NeedsInfo / Rejected；客户申请审核拒绝无需创建 Tenant。
- Tenant：PendingActivation → Activating → Active ↔ Suspended → Exiting → Terminated；Activating 可进入 ActivationFailed 后受控重试。
- **进入 Active**：客户/合同及适用订阅授权有效、Tenant 隔离、初始管理员、必要配置完成；可人工完成 B2B 合同/开通，不强制自动在线付费。
- **Guard**：Tenant Active、购买 SaaS 的产品线 Entitlement 有效、特定发行市场/业务许可和生产环境就绪，是四种不同条件，不能用登录成功代替发行许可。
- **暂停/退出**：禁止不适用的新业务，但保留对在途认购、退款、登记、存续责任的合法处理；Exiting 必须有责任接替、数据导出/依法留存及访问撤销清单。
- **异常/验收**：开通失败不得假报 Active；合同终止不得直接删除已发生资金和持有人记录。

### WF-02｜组织成员与权限

- Invite：Issued → Accepted / Expired / Revoked；Membership：Active ↔ Suspended → Revoked；权限和角色配置单独版本化。
- **角色与 Guard**：机构管理员可邀请成员；项目经理能准备/提交但不默认批准自己的 Offering；需要审核、配售、密钥执行、资金等权限的操作按受批准职责分离。
- **异常**：撤销账号不删除历史审批；待处理任务要重新分配；唯一管理员失效需要受控接替，不能扩大 SaaS 平台客服的越权权限。

### WF-03｜Asset 与 Instrument

- Asset：Draft → PendingReview → ReviewedForUse，或 NeedsSupplement → Draft；可 Suspended/Archived。
- Instrument：Draft → PendingReview → ReviewedForUse，或 NeedsRevision → Draft；可 Suspended/Retired。
- **Guard**：底层资产与投资者取得的法律权利分离；资料「已内部审核」不自动等于法律权属已确认或发行可启用。Offering 引用受批准 Instrument/条款版本。
- **异常**：已关联 Offering 的关键文书变化需评估影响，保留历史和通知/重签/取消等合法处理路径，禁止无痕覆盖已签认购条款。

### WF-04｜Issuance Project 生命周期

- Project 工作容器：Draft → Preparing → Active ↔ Suspended → Closing → Closed → Archived；受控取消/异常分支独立。
- **关系**：Project 1:N Offering；项目可同时存在一轮已交付且存续、另一轮筹备/销售。Project 显示项目管理状态，另显示由 Offering 和存续事件**派生**的业务阶段视图。
- **关闭 Guard**：检查所有轮次、未结资金/退款、登记差异、链上结果及存续义务和接任责任。不能因一个 Offering 关闭或售完就关闭 Project。
- **一致性**：第 03 份总体 PRD 的准备、审核、待发行、发行中、发行完成、存续、结束等阶段，映射到独立 Offering 状态、项目工作任务与存续期视图；不强制将多个同时存在的阶段挤入 Project 单个状态。

### WF-05｜Offering 配置、发布、销售及交割

- Draft → SubmittedForReview → ApprovedNotPublished → PublishedNotOpen → Open ↔ Paused → ClosedForSubscriptions → SettlementInProgress → Completed；NeedsChanges/Rejected/Cancelled 是需记录理由及在途业务处置的分支。
- **发布前 Guard**：发行组织授权、Asset/Instrument、披露/签署、发行规模/价格、投资者资格规则、付款资产/网络/合约/收款安排、托管/登记及 RWA Token 方案、适用的专业审查、法律许可、规则版本/自动执行范围及生产就绪已按本工具批准。
- **模式**：ContinuousPurchase 优先，支持每笔资金符合条件后即时自动配售与交付，**Offering 可以仍 Open 而某笔订单已经完成**；BatchAllocation 按条款截止募集后或其他规定时点统一配售。
- **关闭**：CloseForSubscriptions 只阻止新单，未结付款、配售、登记和退款继续按合法规则处理；Offering Completed 是整轮终结状态，不是每笔订单交付成功的别名。
- **变更**：已对外生效价格、规则、期限、模式等不能静默切换；保留适用条款快照、生效时点、审批、影响分析，已签署或已付款订单依法决定沿用旧版本/重新确认/退款。
- **暂停**：停止新购买和被阻断的自动交付，但已有稳定币付款必须继续入账/核对，不得丢弃。

## 4. WF-06～WF-12：投资者直接购买与链上支付核心闭环

### WF-06｜KYC/KYB

- Verification：NotStarted → Collecting → Processing → Verified；NeedsInfo、ManualReview、Failed、Expired/Revoked 分支。
- **体验**：首次购买前按适用要求完成必要 KYC；同一合法授权范围内有效资料尽量复用，购买其他 Offering 不默认再次填写整套资料。用户浏览公开的 Offering 是否先认证由门户规则决定。
- **限制**：原始敏感材料不默认跨租户共享；KYC 通过≠该 Offering 资格通过。旧核验失效要评估在途单据，而非删除历史权益。

### WF-07｜Offering Eligibility

- NotEvaluated → Evaluating → Eligible / Ineligible / NeedsMoreInfo / ManualReview；Eligible 可 Expired/Invalidated 后重评。
- **默认后台静默规则**：用户点击购买时，系统检查 KYC 有效、法域、投资者类别、Instrument/Offering 限制、风险标记及规则版本；全满足直接进报价。缺资料只补缺失项，有法定/风险例外再人工复核。
- **交易时复核**：付款过程中资格发生重大变化，需在不可逆配售/交付前再次按批准规则判断，阻断仅影响相关自动操作，不擦除链上支付事实。

### WF-08｜Subscription、Quote 与 Reservation

- Subscription 业务申请：Draft → Quoted → Reserved → AwaitingPayment → Processing，独立记录 Accepted/Rejected/Cancelled/Expired；**投资者端 Completed 为汇总视图，不可替代 Subscription 的业务事实**。
- QuoteSnapshot 必须保留：Offering、Instrument/条款与资格版本、投资者、Token 数量、价格/支付币种、网络及合约、精度、收款方案、费用、失效时间。不能付款中静默变价。
- Reservation：Active → Consumed（获准配售转换占用）或 ReleasePending → Released；已观察到付款/状态未知时 Held/PendingReconciliation，不能因倒计时结束直接释放。
- **Guard**：Offering Open、资格有效、报价及条款确认、合法额度和适用签署完成后才展示有效付款信息。两人争抢最后额度不得双重预留。
- **额度主责任**：M10 发起订单及预留请求；M12 负责配售权威和统一可分配量。已配售、有效预留、风险冻结采用**互斥口径**，跨轮次如共用 Instrument/Token 总量亦需核对上限；技术实现由第 07 份设计。
- **异常**：迟到账且预留已合法释放时不得自动超售，必须进入资金异常/可能退款流程。

### WF-09｜USDT/USDC 链上付款与对账（PAY-001）

| 独立对象 | 建议状态 | 重要事实 |
|---|---|---|
| PaymentInstruction | PendingSetup / AwaitingPayment / Active / Expired / Cancelled | 付款要求、报价及到期时间 |
| OnchainTransfer/Receipt | NotSeen / Detected / Confirming / Confirmed / Unknown / Failed / NeedsReview | 链上交易及按批准安排认可的到账事实 |
| Reconciliation | NotStarted / Matching / Matched / Mismatch / Investigating / Resolved | 与报价/订单匹配后的业务对账 |

- 每次支付精确校验 **chain_id + Token contract + decimals + 收款地址 + 实收金额 + 匹配凭证**；同名假 USDT/USDC、错误链和交易所热钱包来源不能自动当作有效支付或投资者 Token 接收地址。
- 分清付款发送地址、发行方/服务商收款地址、投资者 RWA Token 接收钱包、实际法定持有人身份；根据适用要求核验接收钱包的控制与资格。
- 不足额、超额、分笔支付、重复真付款、重复回调、无订单到账、迟到账、链重组、服务商不可用、交易最终性不明都有独立状态/调查路径；是否补款、合并、改配或退款按 Offering 已批准规则处理。
- **Matched 才可进入后续允许的自动配售检查，但不会直接把 Allocation/Register/Token 设成成功。**
- SaaS 不默认接收或保管真实资金/私钥；生产收款主体、托管和退款责任另行批准。

### WF-10｜Allocation（持续购买与集中募集）

- NotStarted → RuleCheck → AutoAuthorized / PendingApproval → Allocated / PartiallyAllocated；Rejected / Failed / NeedsReview / ControlledCorrection 分支。
- **持续购买自动化**：Offering 发布前由获授权责任人批准价格/规模、购买资格、自动配售规则、配售限额和 Token/登记自动执行范围。每笔校验 Offering 有效、KYC/资格与条款、有效预留、付款已确认/对账、额度/授权未失效；系统记录 approval_id、rule_version、allocation_id、数量和理由。依法需逐笔人工批准的仍用 PendingApproval。
- **集中募集**：认购期结束或条款指定条件达到后确定配售、可能的最终定价/超额申请/部分配售；付款前后时序按批准 Instrument/Offering 规则，不假设必在集中配售前付款。
- **部分配售**：未获配额与相应资金余款分开记录，必要退款转 WF-12，不由 Allocation 伪造退款成功。

### WF-11｜权威登记与 RWA Token 交付

| 对象 | 建议状态 | 权责 |
|---|---|---|
| RegisterUpdate | NotStarted / Pending / Submitted / Confirmed / Failed / Unknown / NeedsReconciliation | M12，权威登记源依金融工具确认 |
| TokenExecution | NotAuthorized / Ready / Submitted / Confirming / Confirmed / Failed / Unknown / NeedsReconciliation | M07，合约、网络、执行权限及链上证据 |
| DeliveryReconciliation | NotStarted / Matched / Mismatch / Investigating / Resolved | M12 协调 M07，依法核对最终权益 |

- 登记与 Token 的先后由金融工具法律结构确定；不能一概规定先登记或先铸造，也不能仅凭 Token 到账认定法律权利已完成。
- 同一 Allocation 只能触发其**批准数量与次数**的交付；交易提交后结果 Unknown 必须查询链、nonce、链上事件和执行凭证，禁止盲目再次 Mint。
- 配售已确认但 Token 失败时保持支付、配售事实；登记/Token 不一致进入隔离、核对和受控纠正。
- 对投资者显示「购买完成」须满足该工具全部适用权益登记/交割条件；否则显示「付款已确认，资产交付处理中」。
- **V1 没有用户间转让页面，也必须对要求限制流转的 RWA Token 规划并实现必要链上非授权转移控制**；这是发行合约约束而非开放二级市场。

### WF-12｜Refund 与资金异常

- Requested/Triggered → PendingApproval → ApprovedPendingExecution → Processing → OnchainConfirming → Confirmed；Failed / Unknown / Returned / Investigation 是独立路径。
- 触发：购买撤回或 Offering 取消（适用时）、部分配售余款、超额付款、迟到账、无效币种等；引用原资金交易、规则、责任人及批准记录。
- **已配售/登记/交付后不能直接普通取消并退款**：应先执行该金融工具合法允许的纠正/赎回/权利处理路径。
- 真实退款只能由获授权资金责任方执行；不默认退至原发送地址（可能为交易所/第三方）；应核验适用合法收款对象、网络与地址。
- 退款请求、授权、外部出款、链上最终性与对账分别记录；Unknown 时查询原结果，不能以超时、重复回调或后台按钮直接再次退款。

### 投资者订单汇总视图（派生，不替代后台事实）

| 投资者显示 | 从业务对象判断 | 禁止误导 |
|---|---|---|
| 请完成身份认证 | KYC/Offering 资格缺失 | 不要求每单重做完整 KYC |
| 待确认订单 | 价格/签署/额度预留未完成 | 不显示“已购买” |
| 等待支付 | 有效支付要求、尚未确认入账 | Tx 广播不等于到账 |
| 购买处理中 | 付款/对账/配售/登记/Token 任一步骤待完成 | 已付款待交付须明确表达 |
| 购买完成 | 已满足该 Instrument 全部交割与法律权益条件 | Token 与登记事实分别保留 |
| 需要处理 | 资料、资金、额度、登记或 Token 异常 | 明确是用户补件还是运营处理中 |
| 退款处理中 / 已退款 | 独立 Refund 状态及外部证据 | 退款请求不能当成功 |

## 5. WF-13～WF-18：存续、产品扩展与治理

### WF-13｜存续期与权益/收益支付
LifecycleEvent：Draft → CalculationPending → Calculated → ReviewPending → Approved → Processing → Completed；NeedsCorrection / Disputed / Failed / Cancelled 分支。持有人权益以已定义快照时间、权威持有人和 Instrument 规则计算，不以任意钱包当前余额代替法定权益。收益计算与复核、授权、外部稳定币/法币付款、链上/资金确认、对账分离；适用时预留 USDT/USDC 收益、还本和赎回。具体事件和币种按首发 Instrument 裁剪，SaaS 不默认控制支付钱包。

### WF-14｜受控转让（V2 规划）
TransferRequest Draft → Submitted → Eligibility/LockupCheck → IssuerConsent/ROFR（如适用）→ ConsiderationSettlement（如适用）→ RegisterUpdate + TokenExecution → Reconciled/Completed；拒绝/撤销/过期/争议/状态未知均独立。**V1 不提供该用户间转让业务/界面/API**；V2 按 DEC-009 的资格、同意、资金、登记/Token 分离原则另行详细 PRD 与法律/上线审核。公开订单簿、撮合、AMM 和自营流动性不因 V2 自动包含。

### WF-15｜客户暂停退出与数据迁移
Active → Suspended → ExitPlanning → ResponsibilityAndDataTransfer → Terminated；对于未结 Offering、付款/退款、登记、Token、存续期责任建立交接清单，保留必要处理权限，依法导出/限制/删除资料，撤销 API Key 与成员权限并保留审计。合同到期不自动取消投资者 Token/法定权益。

### WF-16｜White-label 多发行机构
运营商签约获授权 → 配置品牌/门户 → 关联多家依法获准的发行机构 → 按授权范围展示各自 Offering → 投资者按门户/发行方/资格访问 → 撤销或终止授权/迁移。各发行方资产、业务数据和 KYC 原始资料默认隔离；无多级代理。DEC-002 的 V1 **客户层级模式**保持，不在此确认具体交付工期。

### WF-17｜Open API/SDK 及 Webhook
API 客户授权 → 开发者应用/最小权限凭证 → Sandbox 测试 → 生产访问审核 → 受控 API 调用 → 已签名 Webhook（重复、延迟、乱序）→ 客户可查询权威业务状态 → 凭证撤销/版本迁移。网页与 API 共享业务资格、认购、资金、配售和 Token 规则；Webhook 不冒充链上或法律权威事实。完整 API 商业产品的 V1 交付范围另议。

### WF-18｜异常、恢复、人工更正
ExceptionCase：Detected → Classified → Assigned → Investigating → RemediationApproved → Recovering → Reconciled/Closed；Blocked / Escalated / Reopened 分支。记录责任模块、影响的订单/资金/配售/登记/Token、来源、时间、原新状态、操作者/审批人和证据。按影响范围限流/冻结，不无依据全平台停机；M17 只管理异常工作流，M11/M12/M07 各自持有资金、登记、链上业务事实。

## 6. 不变量及跨模块守卫

| 编号 | 已确认原则或衍生控制 | 验收底线 |
|---|---|---|
| **INV-01** | 额度一致性 | 已确认配售、有效预留和异常冻结份额使用互斥口径，单轮及有共同上限的多轮不得超发/重复配售 |
| **INV-02** | 资金事实独立 | 订单取消/退款申请/交付失败不覆盖已发生链上付款事实；金额、币种、链、时间与来源可追溯 |
| **INV-03** | 权益交付一致性 | 一笔合法配售不得重复 Mint/交付；登记与 Token 差异可查询、阻断、纠正与审计 |
| 守卫 A | 执行授权持续有效 | AutoAllocation、TokenExecution 在每笔执行时复核 Offering、规则版本、资格/权限与必要法律/业务条件 |
| 守卫 B | 外部 Unknown 非 Failed | 链上提交/退款/登记返回未知时先调查、对账，不盲目重复不可逆操作 |
| 守卫 C | 权利终态独立 | Token 链上确认、权威登记及投资者最终权益按该 Instrument 已批准法定规则分别确认 |
| 守卫 D | 交易与操作幂等 | 真实两笔付款分别记账；单笔回调重复不创建两次配售、退款或铸造 |
| 守卫 E | 变更与退出不覆盖历史 | Offering 条款变更、资格失效、权限撤销和合同结束不得擦除原决定与已发生权威事实 |

INV-01～03 已由用户认可；守卫 A～E 是已确认原则的详细化执行建议，具体技术实现仍待第 07 份和详细 PRD。

## 7. 场景化验收矩阵（建议，尚非获批完整 V1 清单）

| ID | 输入与异常场景 | 必要结果 |
|---|---|---|
| E2E-01 | Tenant 开通，但金融业务权限未就绪 | 软件可用不代表真实发行已获准 |
| E2E-02 | Project 中 Offering A 已发行、B 筹备 | Project 不因 A 完成而误归档 |
| E2E-03 | 同投资者 KYC 有效，购买另一 Offering | 静默独立资格判断，默认不重填全部资料 |
| E2E-04 | 缺某项目特定必需证据 | 只补缺失项，资格未通过不放行 |
| E2E-05 | 剩余 1,000，双用户同时购买各 800 | 额度不会双重预留或超发 |
| E2E-06 | 预留期限届满，链上付款确认中 | 不凭计时器盲目释放，进入核对 |
| E2E-07 | 预留已合法释放后资金迟到账 | 保留资金事实，走退款/重新授权路径而非超额交付 |
| E2E-08 | 应付 500 USDC，收到 450/550 | 对账差异，按批准规则补款/退余 |
| E2E-09 | 错误链/假 USDC Token | 不标记有效付款；调查是否可处理 |
| E2E-10 | 交易所热钱包付款，用户用独立钱包收 RWA Token | 来源、收款、接收、法定持有人分离 |
| E2E-11 | 同一链上交易回调重复 | 仅一次业务付款匹配及必要后续执行 |
| E2E-12 | 同一投资者确实付款两笔不同 Tx | 两笔记录都保留，不误当重复 |
| E2E-13 | 配售规则授权失效但已付款 | 不继续自动配售；保留资金并复核 |
| E2E-14 | Token Mint 已提交，回执 Unknown | 先查询链上/nonce/事件，不重复 Mint |
| E2E-15 | 登记成功，Token 交付失败（或反向） | 不假报购买完成，异常对账与合法纠正 |
| E2E-16 | Offering 暂停期间先前订单到账 | 资金继续记录/对账，新执行按暂停规则 |
| E2E-17 | 已交付 Token 后投资者要求退款 | 不能直接取消记录，需适用合法纠正/赎回方案 |
| E2E-18 | 退款提交后回执超时、重复请求 | 不重复出款，独立 Unknown/对账状态 |
| E2E-19 | V1 投资者发起二级转让 | 无转让流程/API；必要合约级限制生效 |
| E2E-20 | 客户退出但仍有持有人和欠付义务 | 留存并移交，禁止直接清除 |
| E2E-21 | White-label 未授权访问其他发行方 KYC/Offering | 阻断并审计 |
| E2E-22 | API 重复认购、Webhook 乱序 | 与门户同规则，幂等且可查询业务权威状态 |

所有与真实资金、生产合约/Token 或法律登记有关的测试必须在明确测试/生产隔离及适用法律/安全/运营授权下执行；模拟通过不能直接作为生产启用批准。

## 8. 审批一致性核对与开放决策门

| 上游决策/冻结基线 | 此稿的对应实现 | 仍待确认的内容 |
|---|---|---|
| DEC-001/002/005/006、战略 | 发行机构优先、独立投资者门户、White-label 授权多发行方、全球配置 | 首发市场、产品包/交付阶段 |
| 冻结 6 领域 22 模块 | WF-01～18 对应既有 M01～M22，不新增模块；Project 1:N Offering | 首发金融工具与业务实体关系的具体基数 |
| DEC-004 | 法律、资金、登记与链上分别认定，并设上线 Gate | 经营许可、责任主体、法律意见、服务商合同 |
| DEC-007 | KYC 可合法复用，但每个 Offering 静默独立判断资格 | KYC 服务商及有效期、特定法域规则 |
| DEC-008 + PAY-001 | USDT/USDC 优先；支付/对账/配售/登记/退款独立；自动执行基于事先批准 | 首发链/稳定币合约、钱包控制、资金与退款规则 |
| 第 03 份总体 PRD | 自动配售不得越过法定决定；独立状态、版本、例外/审计 | 执行审批配置与各工具要求 |
| DEC-009 + DEC-011 | DEC-009 转让安全原则保留；DEC-011 取代其转让业务“建议 V1”交付时间 | V2 转让详细范围、V1 合约限制技术规格 |

**开放决策门**：首发市场/法律适格性；首发 1–2 类 Instrument 与权利结构；正式链、发行 Token 协议及合约权限；USDT/USDC 网络及具体合约；收款/退款资金责任和可信外部权威事实来源；Register 法律地位及 Token 与登记顺序；自动配售/收益等可适用的授权范围；V1 逐功能交付范围与验收；White-label/API 具体排期与定价。

**冻结后变更纪律**：本文件已批准的业务流程、状态分离及守卫原则约束后续模块详细 PRD、UI/UX 与架构。具体状态码、法域/资产专属执行次序及技术实现仍须细化。实质性突破冻结原则须提交产品负责人变更评审，不能改写已冻结第 02/03 份正文。PR #6 必须仍为 Draft / Open / Unmerged。

## 9. 正式评审补强：04-43～04-48（2026-10-21）

产品负责人已认可 04-43～04-48 六项修订要求，并于 2026-10-21 选择 **A：冻结跨模块业务流程与状态机原则基线**。本节的业务对象分离、转换必要条件类别、额度与资金守卫、角色权限责任原则、异常恢复和验收目标属于已冻结原则；状态名及逐行转换示例、角色模板与测试代码**不代表最终已确定的法域/技术枚举**。本节业务守卫优先于第 3～5 节的状态简写。

### 9.1 状态字典：每个对象保持独立（04-43）

状态规范：
- DRAFT/PENDING 是内部工作流；EXTERNAL_UNKNOWN 是外部执行结果未确定；FAILED 是有证据的失败；CONFIRMED 是按该事实源达到规定确认条件。不得以超时把 UNKNOWN 静默改为 FAILED。
- FINAL/COMPLETED 必须明确是哪个对象的终态，不能跨对象传播。已发生资金、链上和法定登记事实使用事件追加/纠正，不以直接改写历史消除矛盾。
- 以下为**逻辑英文状态码候选**，具体枚举/转移版本仍需在首发金融工具与技术设计中确定；这份规范定义的是业务意义、转换边界和不可跳过的检查。

| 对象 | 主要状态（简化候选） | 独立事实/边界 | 主责 |
|---|---|---|---|
| CustomerApplication | Submitted / Reviewing / NeedsInfo / Approved / Rejected | 批准申请不等于 Tenant 生效 | M01 |
| Tenant | PendingActivation / Activating / Active / Suspended / Exiting / Terminated / ActivationFailed | SaaS 授权不等于发行许可 | M01 |
| Membership | Invited / Active / Suspended / Revoked / Expired | 权限事件不覆盖历史审批 | M02 |
| Asset | Draft / PendingReview / NeedsSupplement / ReviewedForUse / Suspended / Archived | 内部审核不是法定产权结论 | M04 |
| Instrument | Draft / PendingReview / NeedsRevision / ReviewedForUse / Suspended / Retired | 权利及条款版本独立 | M04 |
| Project | Draft / Preparing / Active / Suspended / Closing / Closed / Archived | 同时容纳多个 Offering 和存续义务 | M05 |
| Offering | Draft / SubmittedForReview / NeedsChanges / ApprovedNotPublished / PublishedNotOpen / Open / Paused / ClosedForSubscriptions / SettlementInProgress / Completed / Cancelled | Open 可伴随若干已完成的订单；Cancelled 仍可有未结退款 | M05 |
| Verification | NotStarted / Collecting / Processing / NeedsInfo / ManualReview / Verified / Failed / Expired / Revoked | KYC 身份结果，不是 Offering 资格 | M09 |
| Eligibility | NotEvaluated / Evaluating / Eligible / Ineligible / NeedsMoreInfo / ManualReview / Expired / Invalidated | 每个 Offering 独立判断，存规则版本/时点 | M09 |
| QuoteSnapshot | Created / Offered / Accepted / Expired / Withdrawn | 数量价格、网络、币种合约、条款快照不可静默变更 | M10 |
| Subscription | Draft / Submitted / Accepted / AwaitingPayment / InProcess / Closed / Rejected / Cancelled / Expired / NeedsReview | Accepted 仅指业务受理，Closed 也不自动等于取得权利 | M10 |
| Reservation | Active / HeldPendingReconciliation / ConvertedToAllocation / ReleasePending / Released / ExceptionFrozen | 预留、冻结与已分配使用互斥额度核算口径 | M10 请求，M12 额度权威 |
| PaymentInstruction | PendingSetup / AwaitingPayment / Active / Expired / Cancelled | 支付要求，不构成真实付款事实 | M11 |
| OnchainTransferReceipt | NotSeen / Detected / Confirming / Confirmed / Unknown / Failed / NeedsReview | 链、合约、事件/交易、最终性和可信收款方事实 | M11 |
| Reconciliation | NotStarted / Matching / Matched / Mismatch / Investigating / Resolved / Escalated | 匹配结果是规则化决策，与链上事实独立 | M11 |
| Allocation | NotStarted / RuleCheck / PendingApproval / AutoAuthorized / Allocated / PartiallyAllocated / Rejected / NeedsReview / ControlledCorrection | 批准份额、批准依据及余款处理；不等于 Token 到账 | M12 |
| RegisterUpdate | NotStarted / Pending / Submitted / Confirmed / Failed / Unknown / NeedsReconciliation | 法定权威由 Instrument/法域确定 | M12 |
| TokenExecution | NotAuthorized / Ready / Submitted / Confirming / Confirmed / Failed / Unknown / NeedsReconciliation | 单次授权执行、链上结果和交易最终性 | M07 |
| DeliveryReconciliation | NotStarted / Matching / Matched / Mismatch / Investigating / Resolved | 权利登记及 Token 是否符合各自法律/技术要求 | M12 与 M07 |
| Refund | Triggered / Requested / PendingApproval / ApprovedPendingExecution / Processing / OnchainConfirming / Confirmed / Failed / Unknown / Returned / Investigating | 独立资金退回事实；不因取消订单自动完成 | M11 |
| LifecycleEvent | Draft / CalculationPending / Calculated / ReviewPending / Approved / Processing / Completed / Failed / Disputed / Cancelled | 已批收益事件与外部支付结果不得混同 | M13 |
| ExceptionCase | Detected / Classified / Assigned / Investigating / RemediationApproved / Recovering / Reconciled / Closed / Escalated / Reopened | 仅协调，不能越权改写模块权威事实 | M17 |
| TransferRequest | Draft / Submitted / UnderReview / Approved / Rejected / Cancelled / Unknown / Completed | **仅 V2 规划，V1 不暴露投资者间转让业务** | M14 |
| InvestorPurchaseView | KycRequired / QuotePending / AwaitingPayment / Processing / Completed / ActionRequired / RefundProcessing / Refunded / Cancelled | **派生展示**，不是可直接写入的独立金融权威状态 | M08 |

### 9.2 核心状态转换矩阵（04-43、04-44）

下表定义**允许的核心转换**；未列出的直接跳转默认禁止，例外需引用正式批准的特定 Instrument/Offering 流程版本。所有转换需记录事件 ID、前后状态、决策主体、规则版本、业务时间、权威来源及必要审计。

| 转换 ID | 对象：从 → 到 | 触发及必须满足的 Guard | 执行/批准角色（示例） | 不满足时/证据 |
|---|---|---|---|---|
| T01 | Tenant PendingActivation → Activating → Active | 合同/产品授权、工作空间隔离、管理员与配置就绪 | M01 受权运营；客户管理员接受授权 | 缺项保持开通中或 ActivationFailed；开通清单与操作日志 |
| T02 | Tenant Active ↔ Suspended；Suspended/Active → Exiting | 暂停/恢复/终止符合合同和安全规则；未结业务有处理通道 | 受权客户/平台服务管理员，必要合规批准 | 未结事项独立保留；退出及交接证据 |
| T03 | Asset/Instrument Draft → PendingReview → ReviewedForUse | 适用资料、审核角色、法律权利结构、文件版本满足内部使用要求 | 发行方资料提交人、指定审核人 | 补件/需修订，审核依据；不冒称法定认可 |
| T04 | Project Draft → Preparing → Active | 有合法组织权限、项目关联对象、有效工作任务 | 发行项目经理；指定审核人（适用时） | 未满足准备条件不启动，项目工作日志 |
| T05 | Project Active → Closing → Closed | 所有关联轮次及未结资金/登记/Token/存续职责已结清或已完成有效责任移交 | 项目负责人提交、授权关闭人批准 | 有未处理义务则阻断；关闭清单 |
| T06 | Offering Draft → SubmittedForReview → ApprovedNotPublished | 资产/工具/条款、准入、收款与交付规则和必要审批满足 | 项目经理提交、获授权发行审批人批准 | NeedsChanges/Rejected；批准版本证据 |
| T07 | Offering ApprovedNotPublished → PublishedNotOpen → Open | 发布许可、法律/服务商、支付配置、风险/执行授权及开放时点均有效 | 授权发布角色；调度器仅按受权版本触发 | 不满足则不得销售；发布门槛清单与版本 |
| T08 | Offering Open ↔ Paused → ClosedForSubscriptions | 经批准的暂停/恢复/关闭触发；正在途订单有归属规则 | 发行方授权角色/受控自动触发 | 暂停后不新收单，但到账仍必须记录 |
| T09 | Offering ClosedForSubscriptions → SettlementInProgress → Completed | 不再新建认购，全部适用订单/退款/配售/登记/Token/交割差异按规则结清或合法移交 | 发行方收尾负责人及适用审核 | 缺未结项则不能 Completed；整轮收尾清单 |
| T10 | Verification Processing → Verified / NeedsInfo / ManualReview / Failed | 有有效核验事实、服务商结果与尽调责任认定 | KYC 服务/获权合规责任方 | 证据不全不可 Verified；保留事实引用 |
| T11 | Eligibility Evaluating → Eligible / Ineligible / NeedsMoreInfo / ManualReview | 特定 Offering 资格规则、有效 KYC/AML 和适用要求满足 | M09 规则自动判断或获授权审核人 | 失败阻止报价/新不可逆操作；规则版本 |
| T12 | Quote Offered → Accepted | 报价有效、条款/必要签署确认、投资者关联钱包和额度检查完成 | 投资者确认，M10 原子校验 | 过期则重报；不可静默沿用旧价格 |
| T13 | Reservation Active → HeldPendingReconciliation / ConvertedToAllocation | 存在有效付款观察/资金对账状态或已批准配售 | M10 发起，M12 额度核算决定 | Unknown 不盲目释放；订单、链上、额度事件 |
| T14 | Reservation Active → ReleasePending → Released | 到期、取消或规则允许；已按批准方法调查未结支付和重复入账 | M10 触发，M11 核实，M12 原子释放 | 支付可疑→Held；释放/查询证据 |
| T15 | PaymentInstruction AwaitingPayment → Active / Expired / Cancelled | 按报价/规则安排付款有效期；不修改链上既有事实 | M11 系统或适用责任方 | 到期后实际到账进入独立异常识别 |
| T16 | Receipt Detected → Confirming → Confirmed | 正确 chain_id、Token 合约/精度、地址、事件、最终性、可信到账证据满足 | M11 + M22 链/付款数据源 | Unknown/NeedsReview，不把广播当完成 |
| T17 | Reconciliation Matching → Matched / Mismatch / Investigating | 真实到账与订单金额/资产/网络/期限/身份规则可合法匹配 | M11 自动规则或授权财务复核 | 不匹配保留原实收并派生差异 |
| T18 | Allocation RuleCheck → AutoAuthorized / PendingApproval → Allocated / PartiallyAllocated | 额度仍占用、资金已按必要条件对账、资格与执行许可有效、已批准自动规则，或逐笔批准有效 | M12 规则授权服务 / 配售批准人 | NeedsReview，不以到账直接视为配售 |
| T19 | Register Pending → Submitted → Confirmed | 经过相关法定登记责任方或获确认的权威记录源 | M12 与授权登记机构 | Unknown/Failed/NeedsReconciliation；外部登记引用 |
| T20 | Token Ready → Submitted → Confirming → Confirmed | 对应唯一获准配售、有效合约/权限/收款钱包、必要登记时序、链上最终性 | M07 的获授权执行主体/服务商 | Unknown 先查结果再决定补偿；链上凭证 |
| T21 | DeliveryReconciliation Matching → Matched / Mismatch | 此 Instrument 所需权利登记及 Token 结果均满足且份额/人/钱包一致 | M12 + M07 核验规则 | Mismatch 阻止投资者最终完成展示 |
| T22 | Refund Requested/Triggered → PendingApproval → ApprovedPendingExecution | 存在合法退款原因、金额上限、收款人/地址核验及必要资金责任方审批 | 发行方财务/授权资金控制方 | 拒绝/调查并保留原收款事实；审批证据 |
| T23 | Refund Processing → OnchainConfirming → Confirmed | 真实执行及到账/渠道最终状态经获批准权威源核对 | 资金责任方 + M11 对账 | Unknown/Failed/Returned，禁止盲目二次出款 |
| T24 | Exception Detected → Assigned → Investigating → RemediationApproved → Recovering → Closed | 主责任模块确认事实，必要审批、补偿/重试结果和复核证据齐备 | M17 协调、原模块及授权审核人决定 | 证据不足保持调查/升级，绝不写假状态 |
| T25 | Lifecycle Approved → Processing → Completed | 权益快照/计算、适用审批与支付/登记等外部结果按规则得到确认 | 发行方/登记/资金责任方，M13 编排 | 支付未知/部分则不视为全量完成 |
| T26 | TransferRequest ... | V1 **禁止创建用户间转让申请及对应业务 API**；V2 单独审查 | V1 不适用 | 必要合约级转让限制仍需校验（DEC-011） |

**核心对象状态与投影关系（04-44）**：
- Project 可以 Active，Offering A 已 Completed、Offering B 仍 Draft，同时 A 有持续期义务；不能只用 Project 一个状态表达所有业务。
- Offering Open **不要求**所有订单未完成；单笔 InvestorPurchaseView=Completed 可以在 Offering Open 时成立。售罄为可售额度/关闭触发条件（依批准规则），**不是**替代交割状态的独立法律成功状态。
- Subscription Accepted、Payment Confirmed、Reconciliation Matched、Allocation Allocated、Register Confirmed、Token Confirmed、Offering Completed **互不等价**。
- InvestorPurchaseView=Completed 仅当**该 Instrument 所要求的全部最终交割/登记与 Token 交付条件已满足**，且无阻断性差异；投资者视图来自各对象的可信派生规则，不允许任意后台手工设为已完成。
- Offering Cancelled 不代表退款已完成；客户合同 Terminated 不代表 Token 权利或存续义务消灭。

### 9.3 额度账本与原子转换（04-45）

**业务唯一核算责任：M12 为 Offering 批准额度、可配额度、已配额度、异常冻结额度的主责任模块；M10 负责认购、报价和提交预留/释放请求；M11 负责付款核对；M07 链上发行量作为独立事实核对。** M10/M12 不得分别独立认定两个互不一致的剩余额度。

推荐模型：每一单位受限发行容量在**同一瞬间只能归属于一个互斥桶**，例如 Free、Reserved、Frozen、Allocated。Reserved→Allocated 为**一个原子业务转换**，而非先释放再配售；如果异常只是为某笔订单冻结，需先从 Reserved 转 Frozen，不能同时重复扣减。发行总上限应按 Instrument/Token/Offering 已批准关系核算，对共享上限的多个 Offering 进行跨轮次检查。

**示意不变量**（同单位口径、互斥分桶条件下）：ApprovedCap = Free + Reserved + Frozen + Allocated。发生销毁、赎回、再销售或供应量调整时需要新增**受审批的变动事件**并维护账本版本，不能未经规则直接把链上余额变化当作新可售份额。

| 操作 | 账本前置守卫 | 原子结果 | 失败/迟到处理 |
|---|---|---|---|
| 创建预留 | Offering Open；报价/资格有效；Free≥需求；唯一购买 ID | Free→Reserved，创建 reservation_id、expire_at、版本 | 容量不足不生成可付款订单；竞争失败重新报价 |
| 付款被观察到 | 匹配订单或形成未匹配入账事实 | Reserved→Frozen/Held（若需阻断释放）或保持受保护 Reserved | 不能仅按倒计时清除付款 |
| 预留到期释放 | 截止规则满足，M11 按批准窗口检查了在途/未知支付，无法律占用障碍 | Reserved→Free（带可核验释放凭证） | UNKNOWN/潜在迟到账→Frozen，待核对 |
| 付款合法确认并配售 | 有效预留/冻结、完成必要对账/准入/批准规则、容量有效 | Reserved/Frozen→Allocated，仅一次 | 配售失败保持可追踪占用；不先释放 |
| 迟到账且已释放或售罄 | 原订单预留已合法终结，资金事实新确认 | 资金独立入账；不开自动新配售 | 依据获批准新订单/调额/退款决策，防重复配售 |
| 异常纠正/额度调整 | 明确责任方授权、Legal/Instrument 允许、链上/登记事实核验 | 追加补偿与额度版本，不无痕改账 | 权益已生效时不能单靠退款或销毁数据库记录回售 |

配售确认与 Token 已铸造数量不是同一指标。交付失败不会自动释放已确认配售份额。若一个 Instrument 允许多轮 Offering 共享总发行上限，必须核对合约授权铸造上限、已交付数量与独立权利登记总量；同时定义报价的最小份额单位、精度及溢出/舍入规则。

### 9.4 链上付款、确认变化、迟到账与可恢复性（04-46）

| 事件 | 资金/订单状态动作 | 额度与交付动作 | 权威证据及处理责任 |
|---|---|---|---|
| 钱包刚广播 Tx | 记录可查询的交易提交线索，Receipt 不得直接 Confirmed | 保持订单 AwaitingPayment/Processing，不进行最终配售 | M11/M22：chain_id、Tx、币种/收款信息 |
| 交易被观察到但确认不足 | Receipt=Detected/Confirming | Reservation 保留或 Held，受批准超时策略治理 | M11：链上交易事件、确认要求/区块信息 |
| 达到规定链上确认 | 只产生链上确认事实；再做入账归属及金额/Token/网络匹配 | Reconciliation 必须 Matched 才可进一步校验自动配售 | M11 及适用服务商收款权威来源 |
| 交易确认后发生重组/权威反转 | **追加 Reversal/Dispute 事实事件**，打开新的调查/对账版本，不能抹去旧确认记录 | 阻断尚未完成的交付；若已交付按法律/合约授权的补偿/风险程序处理 | M11、M07、M12 与资金/登记责任方共同调查 |
| 到期未见支付 | PaymentInstruction Expired；核对节点延迟、未知支付和观察窗口 | 可证明安全后 ReleasePending→Released；否则 Held/Frozen | M11 核验，M12 决定额度释放 |
| 预留释放后迟到账 | 原订单状态与新资金事实独立保存 | 不自动重新占用他人额度；进入异常/可能退款 | M11 异常资金记录与有权责任人决定 |
| 少付/多付/分笔/错合约/错链 | Receipt 全量记录；对账 Mismatch/Investigating | 默认不满足自动配售 Guard；依法获准时补款、重报或退差 | M11 保留最小单位精度/事件；M10/M12 处理业务后果 |
| 相同付款 Webhook 重复 | 同一事件 ID 仅更新一次状态事实 | 不重复认购、对账或配售 | M22 接入去重；M11 业务级幂等 |
| 同一投资者确实发出多笔不同 Tx | 每笔收款凭证分别记录并关联 | 只能依订单和支付条款批准合并/转新单/退款 | M11 金额、Tx、事件索引、订单映射 |
| 外部服务超时、返回 Unknown | Unknown 保持开放，记录最近查询时间、原因和升级 SLA | 不启动同一不可逆出款或铸造的第二次执行 | 对应模块查询原外部指令、链上 nonce/日志、人工升级 |

**业务级幂等键建议**：购买请求关联 tenant/Offering/investor/client_request_id；区块链事件识别使用 chain_id + tx_hash + log_index + 被批准的事件来源；Allocation 关联 allocation_decision_id/批准版本；TokenExecution 关联 allocation_id + execution_intent_id + 授权数量与链上执行引用；Refund 关联 refund_case_id + payout_intent_id。具体数据库唯一性、事件观察和最终性阈值属第 07 份技术方案，产品侧必须强制“一项真实业务决定不因重复投递而重复执行”。

### 9.5 操作、审批与责任矩阵（04-47）

此表表达**必须满足的责任/授权类别**，不是声称 SaaS 拥有发行、资金托管、法定登记或链上密钥操作的法定权力。角色模板与是否允许同人双岗、双人复核门槛需由具体法域/Instrument/客户风险配置决定。

| 动作/转换 | 申请/发起 | 审批或事前规则授权 | 执行与事实确认 | 分权与审计要求 |
|---|---|---|---|---|
| Tenant 开通/暂停/退出 | 客户及授权 SaaS 运营 | 合同/服务权限责任人 | M01/M03 按许可操作 | 平台支持人员不因此取得客户交易更改权 |
| Asset/Instrument 内部审核 | 发行方资料提交人 | 发行方适格审核/专业机构（适用时） | M04 引用 M06 证据 | 资料上传者不能自证法定权属 |
| Offering 发布及模式切换 | 项目负责人 | 发行方获授权审批 + 必要法律/服务商就绪 Gate | M05 发布 | 必要分权；发布后变更版本/影响分析 |
| KYC 与例外资格 | 投资者、核验提供方 | 授权 KYC/合规责任方 | M09 读取 M22 事实并留痕 | 客服无权覆盖拒绝/制裁风险事实 |
| 购买报价/预留 | 投资者 | 已批准 Offering 规则 | M10 请求、M12 核算 | 并发可用量、可追溯订单/报价 |
| 付款信息与资金对账 | 投资者发起外部付款 | 授权收款主体/支付规则 | M11 对账，资金事实来自批准的外部权威 | 运营手填不可伪造资金到账 |
| 自动配售 | 受理购买的系统事件 | **发行前获授权责任主体批准的规则和适用逐笔 Guard** | M12 生成不可重复配售决定 | 规则授权可撤销；符合逐笔法定审批时禁自动跳过 |
| 人工配售例外 | 授权发行运营人员 | 指定配售审批人/必要双人复核 | M12 执行决定 | 不得由无权客服直接配售 |
| 权威登记更新 | 已批准配售/登记请求 | 法定登记责任方/授权登记规则 | M12 记录外部权威响应 | 不能用内部“完成”冒充权威登记 |
| RWA Token 部署、Mint、转移/销毁 | 经授权发行操作或已批准自动流程 | 合约/密钥操作授权，按风险必要双人复核 | M07 + 适格签名/执行主体 | 不以 M03 管理员权限绕过密钥/资格控制 |
| 退款批准与出款 | 合法退款原因触发 | 发行方财务、资金控制方及必要审批人 | 获授权资金控制方实际出款，M11 核对 | 收款地址核验；出款 Unknown 不盲目重试 |
| 重要异常人工更正 | M17 工单、原模块提出 | 原业务责任方和必要独立复核人 | 原业务模块追加合法补偿记录 | 原值、新值、依据、身份、时间和外部证据 |
| 存续期收益/还本 | 发行机构/获授权管理人 | 金额/权益快照/支付计划适用复核 | 资金责任主体，M13 引用权威结果 | 计算审批与出款执行分离 |
| White-label 跨发行方展示 | 运营商申请 | 每家有权发行机构/渠道批准 | M15 授权，M08 展示 | 不因为品牌统一就共享敏感 KYC |
| API 生产凭证和关键操作 | 客户开发管理员 | 租户及环境最小必要权限，真实交易仍需业务批准 | M16 调用共同业务核心 | API 不得绕过门户 Guard，所有关键调用审计 |

**紧急处理**：发生异常时可以依据获批准的安全措施暂停受影响自动执行，但强制发布、释放额度、配售、补铸或退款的越权“紧急按钮”不得默认存在。合法紧急覆盖方案需事先确定适用角色、双人复核、事后报告和审计；对不可逆外部动作不承诺普通软件回滚。

### 9.6 E2E-01～E2E-22 可执行验收卡（04-48）

**统一测试规范**：每条验收卡均记录 TestID、给定状态与对象版本、触发动作、断言各权威对象状态、不能发生的副作用、所需日志/外部证据。下面各条提供预置数据、执行动作、必要断言和证据；真正的自动化脚本、模拟服务商及首发法域阈值留第 07/10 份实施设计。**业务测试通过不等于法律审查或生产上线批准。**

| TestID | 前置状态/条件 | 触发动作 | 预期状态与不可发生的副作用 | 必需可核验的证据 |
|---|---|---|---|---|
| E2E-01 | Tenant Active，生产发行 Gate 未批准 | 客户点击正式发布/开放 | Offering 不得 Open；Tenant 可保留合法工作台访问；不得触发真实链上交易 | Gate 版本、拒绝原因、审计 |
| E2E-02 | Project Active；A=Completed 且有存续义务，B=Preparing | 关闭 A 或尝试关闭 Project | Project 不误变 Closed；B 不被关闭；存续义务仍存在 | Project/Offering/存续快照及阻断原因 |
| E2E-03 | 投资者已 Verified，Offering B 资格规则另有要求 | 点击 B 购买 | 自动重新评估 Eligibility；满足则报价，不要求整套 KYC 重填 | Verification ID、Eligibility 规则版本与决定 |
| E2E-04 | KYC 有效但 B 额外证明缺失 | 点击购买 B | Eligibility=NeedsMoreInfo；不得生成有效付款指令；仅要求缺失资料 | 缺项清单、受控补件事件 |
| E2E-05 | Free=1000，两购买者同一时刻各需 800 | 并发提交预留 | 至多一笔全额预留成功（无部分规则时）；Free≥0，Reserved≤ApprovedCap | 预留事务/版本、额度账本 |
| E2E-06 | 预留 500 即将到期，付款已 Detected/Confirming | 触发超时处理 | Reservation HeldPendingReconciliation 或等效保护；不盲目释放/配售 | Tx 查询、超时/等待规则、额度事件 |
| E2E-07 | 预留合法 Released，额度已再次售出，旧单新确认到账 | 发送迟到链上确认事件 | 资金记录存在，旧单不得直接复活配售/超额 Mint；创建异常/可退款工单 | 旧预留释放、Tx、ExceptionCase |
| E2E-08 | 报价 500 USDC | 分别输入实收 450 与 550 | 各自 Reconciliation=MISMATCH（或批准的部分支付规则处理）；不得直接完成订单 | 最小单位金额、Token 合约、规则版本 |
| E2E-09 | Offering 仅接收批准链/合约 USDC | 支付另一链或假 USDC | 不作为有效匹配支付；状态 NeedsReview/Mismatch；不触发配售 | chain_id、contract、收款账户、Tx |
| E2E-10 | 投资者使用交易所来源地址，提供另一个合资格接收钱包 | 提交付款及接收钱包 | 四类身份/地址分别留存；接收钱包满足控制/资格要求后才准交付 | 钱包绑定/控制证明、风险规则、付款来源 |
| E2E-11 | 同一个 Tx 已被业务确认 | 重放 3 次同一个 Webhook | 唯一有效收款/配售/交付记录，不重复执行 | event_id、幂等命中、下游调用计数 |
| E2E-12 | 同一用户提交两个真实不同 Tx | 接收两个链上事件 | 两笔收款事实独立；仅依已批准订单/分批规则合并或处置 | 各 Tx+logIndex、支付匹配记录 |
| E2E-13 | Payment 已 Matched，自动配售授权已被撤销 | 再次触发配售引擎 | Allocation 不得进入 Allocated；保持资金事实，进入 NeedsReview/授权补救路径 | 授权撤销版本、阻断原因和工单 |
| E2E-14 | Token 执行链上已提交，响应 Unknown | 对原操作进行系统重试 | 先查链上 Tx/nonce/合约事件；未知时不提交第二次 Mint | 原 execution_intent_id、链上查询与重试决定 |
| E2E-15 | 配售已确认，登记 Confirmed 但 Token Failed（反向再测） | 同步交割状态 | DeliveryReconciliation=MISMATCH；PurchaseView≠Completed；保持配售和资金事实 | 登记证据、Token 事件、异常调查 |
| E2E-16 | Offering Open，付款已发起 | 暂停 Offering 后接收到账事件 | M11 仍识别/对账；新购买禁用；后续分配按暂停 Guard 决定 | 暂停审批、付款、被阻断操作 |
| E2E-17 | Token/权威登记已完成，投资者要求撤销购买 | 申请退款 | 不直接改写配售/Token 或出款；进入适用法定纠正/赎回/审核 | 原权益、请求理由、审批/法定处理依据 |
| E2E-18 | Refund 已提交外部出款，响应超时 Unknown | 重发退款请求/重复回调 | 不会二次出款；仍待查询和外部对账 | payout_intent_id、外部查询、重复请求日志 |
| E2E-19 | 当前版本=V1，钱包存在 Token | 调用转让页面/API；尝试链上不合规转移 | 用户间转让业务入口和 API 不可用；依法要求的合约限制阻断未经授权流转 | API 响应、合约测试、转让规则版本 |
| E2E-20 | Tenant 退出，有在途退款及存续义务 | 尝试直接 Terminated/删除数据 | 未达到有效责任交接不得结束/删权威记录；保留授权处理路径 | 退出清单、责任承接证据、访问日志 |
| E2E-21 | White-label 管理 A/B，未授权访问 B 的敏感 KYC | A 的运营员查询 B | 全入口拒绝，包括 API/搜索/导出；不泄露字段或存在性 | RBAC/租户校验、拒绝审计 |
| E2E-22 | API 重复提交同一个购买意图，Webhook 乱序 | 重放请求及回调 | 一个受理/预留事实；业务状态以权威查询为准，不被旧事件回退 | client_request_id、Webhook ID、业务事件序列 |

**补充覆盖建议（不新增已批准需求）**：对 E2E-05～18 分别加上正常成功对照组、审批权限撤销、系统重启/服务商超时、金额精度/舍入、区块链重组、投资者最终权益可追溯等断言；按首发工具调整测试链、币种、阈值、角色和签署证据。

### 9.7 仍不得直接冻结的实施变量与正式评审结果

**本次已落实 04-43～04-48 的规格要求**：标准状态字典、主要转换/Guard、项目与订单终态映射、唯一额度核算责任和原子占用、链上确认变化与资金事实分离、权限/审批矩阵、22 个可验证 E2E 验收卡。

**严格保留的决策门**：首发法域及金融工具；KYC/AML 与真实准入规则；自动配售是否获法定允许及审批形式；稳定币链/具体合约/收款方/确认阈值；权威登记和 Token 法律效力及执行时序；V1 其他逐功能深度、White-label/API 交付计划；系统字段、数据库、环境、签名与服务商选型。这些由后续正式法域/产品/架构决策确定，不得被此 Draft 假定为已批准。

**正式冻结决定（2026-10-21，产品负责人选择 A）**：本文冻结为「跨模块业务流程与状态机原则基线」，但具体状态代码、技术机制、法域/Instrument 专属条件继续细化。**不意味着已达到所有核心状态可直接编码的唯一工程规格**。PR #6 继续 Draft / Open / Unmerged，不得擅自合并。

## 10. 冻结记录与变更控制（2026-10-21）

- **正式决策**：产品负责人已完成第 04-01～04-48 项原则评审，在正式评审与冻结前复核后明确选择 **A**，批准本文件 **v0.1 Frozen｜跨模块业务流程与状态机原则基线**。本次为产品原则基线冻结，并非正式业务研发或真实金融业务授权。
- **冻结范围**：WF-01～WF-18 的业务范围与跨模块主责任；Project 1:N Offering，Project/Offering/Subscription/Payment/Allocation/Register/Token/Refund 独立状态和终态语义；合法复用 KYC 并对 Offering 独立自动资格判断；ContinuousPurchase 优先、BatchAllocation 保留；指定链 USDT/USDC 支付，经确认与对账后依据预先批准和逐笔守卫自动配售、登记与 Token 交付；INV-01～03，主要转换 Guard 类别、权限/审计/幂等/异常恢复原则；22 个 E2E 场景表达的业务验收意图；V1 一级认购与 V2 受控转让边界（DEC-011）。
- **仍未冻结**：示例英文状态枚举及非唯一转换细节、具体分权阈值、E2E 自动化实现、额度账本/事务技术结构、首发法域及 Instrument/法律登记与权利效力、稳定币链/合约/确认条件、资金/密钥责任方、实际生产流程、White-label/API 交付时点、最终逐功能 V1 范围。第 9 节 T01～T26 是具体产品实现的**细化基准示例**，不是在所有资产/法域均已确定的唯一状态代码。
- **上游与后续约束**：第 02 份战略、第三份总体 PRD、功能树的原冻结记录及内容保持不变；DEC-009 的转让业务 V1 交付建议按 DEC-011 的后续明确版本决定处理，其余安全/合规原则继续有效。详细模块 PRD 必须引用此版本的流程 ID 与已冻结规则；改变原则需单独批准和记录影响。
- **GitHub 约束**：只更新文档工作分支并同步状态索引；PR #6 保持 Draft / Open / Unmerged，不进行合并。真实业务、代码开发、资金、链上生产启用均需另行授权。

**本版结论：v0.1 已由产品负责人选择 A，正式冻结为跨模块业务流程与状态机原则基线。完整工程实施规格、具体法域/资产/资金/登记方案及逐功能 V1 交付范围仍未冻结；不构成研发或生产授权。**
