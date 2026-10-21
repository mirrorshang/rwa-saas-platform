# RWA SaaS Platform｜第 04 份《核心业务流程与状态机》

**文档编号：04/10｜版本：v0.1 Draft｜编制日期：2026-10-21｜状态：完整草案，待正式评审，不冻结、不构成研发或真实金融业务授权。**

**已获产品负责人原则确认**：第 04-01～04-42 项（其中 04-13～04-18 使用用户修订确认的版本），WF-01～WF-18 流程范围，优先「一次必要 KYC → 直接购买 → 指定链 USDT/USDC 支付 → 条件满足后自动分配 RWA Token」，INV-01～03 跨模块不变量，V1 只支持一级认购、V2 再规划受控转让。

**上游冻结资料**：[第 02 份战略](../02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md)；[第 03 份总体 PRD](../03-product-prd/RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)；[产品功能树与模块责任矩阵 v0.1](../03-product-prd/RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)。关联 DEC-001～011，重点参见 [DEC-004](../../decisions/DEC-004-regulated-activity-responsibility-boundaries.md)、[DEC-007](../../decisions/DEC-007-investor-identity-and-kyc-data-reuse.md)、[DEC-008](../../decisions/DEC-008-subscription-funds-settlement-and-refund-principles.md)、[DEC-009](../../decisions/DEC-009-v1-secondary-transfer-boundaries.md)、[DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)。

> **边界说明**：本文定义跨模块业务状态、转换条件、权责、异常及验收，不决定最终具体法域、金融工具、法律效力、托管收款方、链/Token 协议、生产密钥控制、生产上线或完整 V1 逐功能交付清单。示例状态名是 Draft 建议，尚须按首发 Instrument 与法律安排收敛。不得修改上游冻结文档，也不得合并 PR #6。

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

**修订纪律**：已批准原则与详细 Draft 建议分层存储。本文件暂不冻结、不得并入已冻结第 02/03 份正文；待产品负责人对本 Draft 正式评审后，才作冻结决策。PR #6 必须仍为 Draft / Open / Unmerged。

**本版结论：第 04 份 v0.1 完整 Draft 已编制，待产品负责人正式评审，未冻结，未授权开发或生产发行。**
