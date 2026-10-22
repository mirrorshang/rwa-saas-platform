# RWA SaaS｜Issuer V1 交付深度 Batch 06：存续权益、异常、通知、审计与报表 v0.1

> **SCOPE-194～205 共 12 项产品最低交付深度原则已 Approved（2026-10-23）**，见[正式决策](../../decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md)。**完整字段级 PRD、最终 V1 实施范围、法域/实际执行方、UI/API/技术实现仍 Draft/TBD**。 2026-10-23 编制。适用 M13/M17/M18/M20/M21 **37 个原功能**的最低产品交付深度设计；并非字段级完整 PRD、真实法律判断、UI/API/技术实施或生产上线授权。全部 B06 验收卡为 **Not Executed**，原 A/B 187 项为 **Not Tested**。
>
> 依据：[原 187 功能及版本源表](RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)｜[Batch 01～04 Approved 决策入口](../../decisions/)｜[Batch 05 SCOPE-186～193 Approved](../../decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md)｜[Frozen WF-01～18](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)｜[SCOPE-126～133 债权 A1](../../decisions/SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md)｜[SCOPE-134～142 SPV B](../../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md)｜[ARCH-001](../../decisions/ARCH-001-api-first-unified-business-core.md)｜[DEC-011](../../decisions/DEC-011-primary-issuance-v1-controlled-transfer-v2.md)。
>
> 本批 **P0 23 / P1 9 / P2 5 = 37 项**：M13 8（4/3/1）、M17 7（5/1/1）、M18 6（3/2/1）、M20 9（7/1/1）、M21 7（4/2/1）。**ID/原级别不改**，本轮不新增正式 Mxx-Fxxx，也不自动确定最终 Issuer V1 全量实施清单。
>
> **术语纪律**：以下字段组、引用、状态示例只是业务最低深度示意。真实字段类型、必填/枚举、校验、接口、角色矩阵、技术方案、服务商、适用法域和资金/公司责任均留待后续字段级 PRD 和法域评审。既有第 02～04 份 Frozen 不追溯重写。

## 一、本批产品目标和五个必须分开的事实面

Batch 06 的核心问题不是“发行以后提供一个收益图表”，而是：**发行方如何对每个已依法形成的债权/公司权益持续履行存续义务；谁有资格在什么记录日取得什么权利；票息/分红与到期本金如何核算、授权、由真正付款者支付；资金、登记、Token、异常、通知和报表如何各自保持可信证据；当发行机构退租或服务中断时如何不断链移交责任。**

| 独立事实 | 业务权威和主责任 | 禁止的状态偷换 |
|---|---|---|
| 法律存续权利/条款 | M04 Instrument 有效版本、M06 合法文件、依法授权债务人/SPV | Offering Closed、Tenant Terminated 不能使法律债务或股份自动终结 |
| 法定持有人及权益记录日 | M12 权威登记主体及适用实益持有人规则，M13 引用快照 | 钱包实时余额不等于记录日法定持有人 |
| 应付/核算/审核 | M13 LifecycleEvent、合法记录日快照、财务复核及公司决议（B） | Calculated、Approved 不等于已经实际兑付 |
| 外部实际出款、退款及债务清偿 | 依法授权付款方及外部支付/登记证据；M13 记录出款对账、M11 保持认购退款事实 | API success、出款 Submitted 或 Token Burn 不代替到账和法定清偿 |
| Token/登记/资金异常与告知 | M07 链上执行、M12 登记、M17 异常、M18 通知、M20 审计、M21 只读报表 | 客服“已关闭”或站内通知“已发送”不能冒充法律事实或权威外部回执 |

**不变约束**：M17 编排而不代各主权威写账；M18 发布/提醒而不执行资金；M20 保存证据与保护数据而不取得金融执行权；M21 只读聚合而非创建另一套账。Issuer A 债权的息票和还本、Issuer B SPV 股权的可选分配均按不同合法权利驱动，共用 API-First 的受权核心。

## 二、四端业务角色、权限与职责边界

| 端/角色 | 可执行操作 | 不可因本岗位自动获得 |
|---|---|---|
| **Issuer SaaS：发行/存续负责人** | 提交存续事件、对接文件/受益人快照、查看付款任务与披露义务、申请更正/退出 | 法律主体的公司决议权、外部支付私钥、法定登记者写权 |
| **Issuer SaaS：财务和合规审核人** | 独立复核本金/票息/可分配额、核算口径、付款意图、异常处置与送达计划 | 单人随意代替合法出款方，审批后直接制造“Paid”事实 |
| **发行机构投资者门户** | 经授权查看自身法律持有权利、记录日资格、应付/已付/逾期、合同与 Token 独立状态及必要通知 | 浏览其他投资者的收益/身份证，或随意修改应付本金 |
| **SaaS 平台运营后台** | 服务安全与接入健康、租户退租/责任移交监督、隔离风险、受控调查和审计 | 替 Issuer 宣告分红、调拨收益资金、判定法律消灭、强行抹除不利交易 |
| **外部合法执行者/权威方** | 债务人/公司机关决定依法应履行的义务，合法实付方付款，登记者依法更新名册，签名方链上执行，法定送达方按要求留证 | 单一服务商的 success 响应自动代表全部合法履行条件 |

**最小权限约束**：所有读写与导出须有 Tenant、主体、Project/Offering/Instrument、资源和字段级限制；客服账号只能执行明确委托的有限协助。审批、真实出款、回调读取、权限变更和人工更正均保留操作者、授权和不可无痕覆盖的证据链。

## 三、用户任务与跨端业务步骤（逻辑业务组，非正式 UI IA）

| 节点 | 主责任与操作 | 成功证据/正常衔接 | 必须处理的异常 |
|---|---|---|---|
| **L-01 存续档案及义务建立** | Issuer 存续负责人以已批准 Instrument/Series/ShareClass 与法定发行结果建立生命周期；M13 关联合同与责任主体 | 有权利版本、事件计划、档案负责人、对接权限 | 项目多轮 Offering 部分结束、文件版本变更、Tenant 暂停 |
| **L-02 持有人记录日及快照** | M12 外部合法登记引用；M13 取适用截止时点、权益类别/本金、合法受益人 | 快照核对后绑定事件版本 | 晚登记/回溯变动、钱包与名册不一致、争议持有人 |
| **L-03 A 债权票息/本金到期** | Issuer 依据 Series 权利版本、起息/记录日/到期计划确定应付；财务独立复核 | 受权应付计算、付款授权计划 | 晚入场应计、币种精度、提前偿付、部分兑付、到期违约 |
| **L-04 B SPV 合法公司分配** | 公司法定责任方确认可分配款/公司机关批准/类别优先与记录日；Issuer 发起合法分配计划 | 经审公司决议及符合法域分配额 | 公司未决议、无可分配资金、类别不一致、法定禁分 |
| **L-05 真实出款/付款对账** | 外部适格支付主体按授权指令付款；M13/M22 查询外部结果并归集证据 | 实付凭证、收款/Finality 核验、逐持有人对账 | Unknown、少/多付、错币、重复回调、赎回/退款混淆 |
| **L-06 偿付/注销/Token 处置** | M13 记债务清偿及公司退出；M12 法定登记变更；M07 按权限 Burn/冻结/更正 | 三个来源分别可核验，依批准先后完成合法收口 | Burn 已成但欠本金、已付本金但名册未注销、不可逆动作重放 |
| **L-07 异常调查与受权恢复** | M17 汇聚各领域异常，指定真正领域责任人与受权补偿方案 | 原始事实与新纠正关联、查询原指令后的合法恢复 | Provider 失联、待证实/争议、越权人工完成、工单重开 |
| **L-08 披露/通知/有效送达** | M18 按持有人、角色和法律事项生成通知及外部送达要求 | 消息投递凭据与需要时法定送达凭据分别入档 | 退信、错误收件人、法定期限超出、营销退订误用 |
| **L-09 只读报表/合规导出** | M21 按权威来源聚合，M20 校验资源和字段导出权限 | 标明统计口径、权威时间、来源与导出审计 | Pending 被算成功、跨租户汇总泄露、金额精度丢失 |
| **L-10 租户退出与合法责任移交** | Issuer/合法承接方和 SaaS 运营完成未结支付、登记、法定通知及数据/访问接力 | 可核验移交清单、合法保留数据、受限必要操作路径 | 退租立即删数据、终止服务无承接方、已分红未实付 |

**状态表达原则**：可以为用户设计“待审核、待支付、支付调查中、已实际到账、存续争议、已结束”等业务派生标签，但内部仍须分别保留 Instrument/Offering/LifecycleEvent/Payout/Register/Token/Exception/Notification 的领域状态。不得创造一个笼统的“Transaction Success”掩盖任何一项未满足的权威条件。

## 四、37 项原始功能逐项最低交付深度（**产品原则 Approved；字段级细节 Draft**）

### M13｜发行后存续与收益（8 项）

| 原功能 ID / 名称 | 原等级 / 推荐交付定位 | 业务操作与责任 | 最低业务字段/引用（非字段级规格） | 必须阻断/异常/授权约束 | 验收 |
|---|---|---|---|---|---|
| **M13-F001 存续档案与权益关联** | P0／共享核心或必要治理 | Issuer 存续负责人创建项目/Instrument 存续档案，关联每轮 Offering、合法发行权利版本、已登记持有人及负责履约主体；不能因募集结束自动关闭所有存续义务。 | tenant_id、instrument_version_ref、series_or_share_class、offering_refs、lifecycle_owner、obligation_refs、effective_at、archive_policy | 只允许适格 Issuer/授权管理人维护；必须保存审查历史。停止销售不取消到期还本、公司披露或权益维护；Tenant 被暂停时应有授权的存续处理路径。 | B06-01 |
| **M13-F002 权益快照与权威登记** | P0／共享核心或必要治理 | 以合法权威登记主体的记录日/生效时点，生成债权面值/股份类别的可复核权益快照；投资者钱包余额只作辅助核验。 | snapshot_id、instrument_version、record_date、cutoff_time、legal_holder_ref、register_proof_ref、rights_class、units、snapshot_version、dispute_refs | M12 负责权威登记，M13 消费引用并标明“待证实/已核验/争议”；登记迟到、回溯更正、份额精度冲突不得静默覆盖已经批准的快照。 | B06-02 |
| **M13-F003 披露报告及事件通知** | P0／共享核心或必要治理 | 发行机构按 Instrument/法域约定创建存续披露、偿付公告和适用报告任务，关联批准文书版本与通知责任；发布/法定送达分别记录。 | disclosure_event_id、document_version、audience_scope、approval_ref、publish_at、effective_date、delivery_rule、ack_evidence | 存在强制披露或需送达时，不能以发布站内消息自动完成法律公告；高敏报告按投资者/权限授权隔离。 | B06-03 |
| **M13-F004 利息收益还本事件定义** | P1／条件性最低深度 | P1 条件性：按真实 Instrument 权利生成 Coupon、MaturityPrincipal、Dividend、Distribution、Buyback 等合法事件计划；对 A 票息与到期本金属于样本最低闭环。 | event_type、series_or_class、schedule_version、due_at、record_date_rule、legal_basis_ref、expected_currency、payer_authority_ref、condition_refs | 到期日到来不等于已付款；B 不按债权固定年化自动生成分红。无合法 B 公司机关批准/可分配额时不产生应付股息。 | B06-04 |
| **M13-F005 收益计算与必要复核** | P1／条件性最低深度 | P1 条件性：引用已核验权益快照与有效计息/分配条款计算各受益人应付，设置人工复核、批准和更正新版本；A 应明确晚入场应计与 record date，B 应核法定分配额与类别优先级。 | calculation_version、snapshot_ref、rights_terms_version、nominal_due、currency、rounding_rule、withholding_ref、beneficiary_ref、approval_chain | 计算结果不自动触发外部转款；汇率/精度、部分权利、逾期余额、税费如适用须可复核；既有计算不可无痕改写。 | B06-05 |
| **M13-F006 外部支付与赎回结果对账** | P1／条件性最低深度 | P1 条件性：将经审核批准的票息、分红、还本付款意图交给依法授权的外部实付主体，独立跟踪每笔出款、到账/Finality 与差额、拒付、Unknown 和退款追索。 | payout_intent_id、external_payer_ref、beneficiary_authority、amount、currency、provider_instruction_ref、tx_ref、finality_ref、recon_result | SaaS 不默认控制支付私钥/实际资金；Approved、Submitted、Unknown、Paid 分开；超时先查询原指令，不能再次全额发钱；认购退款不得替代分红/偿还。 | B06-06 |
| **M13-F007 到期逾期与责任交接** | P0／共享核心或必要治理 | 监控本息/法定义务到期、逾期、部分偿付、争议、违约及租户暂停退出后的责任交接，保留本金余额/未履行义务和合法跟进。 | obligation_id、due_at、paid_total、outstanding_total、overdue_since、dispute_status、responsible_legal_entity、handover_ref | 未结债务/公司义务不能随 Issuer 停用 SaaS 自动注销；暂停或退租需保留合法处理、通知、审计和交接路径。 | B06-07 |
| **M13-F008 公司行动重组复杂处理** | P2／非默认首期 | P2 后置：复杂公司行动、重组、合并拆分、清算优先顺序/多层资产收益引擎不默认 V1；但真实 B 工具强制的基本公司授权/退出证据需最小流程处理。 | corporate_action_type、capital_action_ref、legal_resolution、affected_holder_classes、valuation_basis、migration_plan（后置） | 不得将复杂清算引擎延期误解为可以跳过法律必须的股份注销、披露和持有人调整；一旦成为首发工具硬性要求需走版本变更门。 | B06-08 |

### M17｜流程/人工例外/异常与恢复（7 项）

| 原功能 ID / 名称 | 原等级 / 推荐交付定位 | 业务操作与责任 | 最低业务字段/引用（非字段级规格） | 必须阻断/异常/授权约束 | 验收 |
|---|---|---|---|---|---|
| **M17-F001 跨模块审批与任务** | P0／共享核心或必要治理 | 为合同、资格、发布、配售、Token、收益与退出等跨模块高风险节点生成有责任主体的审核任务，执行申请-批准-执行职责分离。 | task_id、business_object_ref、task_type、required_role、assignee_ref、approval_policy_version、decision_at | 任务批准不能改变 M11/M12/M07/M13 权威事实；审批人不得自批强制分权的操作，租户与项目权限隔离。 | B06-09 |
| **M17-F002 补件例外及复核队列** | P0／共享核心或必要治理 | 把投资者补件、KYC 可疑项、法律文件争议、权益快照异议等送入复核队列，并保存补充材料、结论、触发规则版本。 | review_case_id、trigger_ref、required_documents、evidence_version、reviewer_ref、decision_reason、resubmission_at | 强制不合格/制裁阻断不得人工随意放行；补件批准只解除其授权范围内的阻断，不会自动标记资金/登记已完成。 | B06-10 |
| **M17-F003 资金配售 Token 异常工单** | P0／共享核心或必要治理 | 自动或人工建立资金少/多付、配售登记差异、Token Finality/供应异常、收益实际出款 Unknown 等可分类异常工单，链接原始权威证据。 | case_id、domain_owner、severity、affected_tenant_offering、original_intent_ref、evidence_refs、hold_scope | 按事件影响局部阻断而非盲目冻结整个租户；M17 负责归集协调，不能编造“Paid/Minted/Registered”。 | B06-11 |
| **M17-F004 恢复重试补偿的授权** | P0／共享核心或必要治理 | 所有重试、补偿、冲正、更正、重新发签或人工干预须基于原业务意图及授权证据形成恢复指令，先查实已发生的外部动作。 | recovery_id、original_intent_id、idempotency_key、external_query_ref、remediation_approval、rollback_or_compensation_ref | Unknown 不等于失败；不可逆链/资金/登记动作不得无条件再次调用。补偿若导致新的真实事件须新 ID 并可追溯关联。 | B06-12 |
| **M17-F005 异常分级与审计证据** | P0／共享核心或必要治理 | 定义资金、法律权利、隐私/安全、链执行的异常等级、处理时限责任、证据闭环及复开规则；保持事故原貌与补救历史。 | severity_level、detected_at、classification、owner_ref、incident_evidence、root_cause、closure_approval | 只有权威结果对账或合规责任明确后才能关闭；客服完成工单不等于真实法律和资金缺口已消除。 | B06-13 |
| **M17-F006 任务期限提醒和升级** | P1／条件性最低深度 | P1 条件性：对重要资金/收益/登记异常设置基本期限、升级、责任转派及逾期提醒；高级工单运营 SLA 可后置。 | due_at、escalation_policy、notify_owner、unresolved_age、handover_at | 对具有法定时限或资金安全要求的任务，最小升级机制不得因为高级提醒 UI 后置而缺失。 | B06-14 |
| **M17-F007 低代码可视化流程编辑器** | P2／非默认首期 | P2 后置：可视化拖拽低代码流程设计器、任意租户编程复杂流程不默认首期；基于已批准的固定模板和版本化工作流执行必要审核。 | designer_canvas、custom_nodes、tenant_workflow_marketplace（后置） | 规则版本权限和职责分离必须可靠，不能由自由编辑流程绕过法定禁令。 | B06-15 |

### M18｜站内通知、待办与送达（6 项）

| 原功能 ID / 名称 | 原等级 / 推荐交付定位 | 业务操作与责任 | 最低业务字段/引用（非字段级规格） | 必须阻断/异常/授权约束 | 验收 |
|---|---|---|---|---|---|
| **M18-F001 认购付款与交付状态通知** | P0／共享核心或必要治理 | 向获授权投资者展示订单/付款/Token 交割与收益处理进度的状态通知，从 M10/M11/M12/M07/M13 接受事实事件引用。 | notification_id、tenant_id、recipient_id、source_event_ref、business_status_snapshot、emitted_at | 站内通知只承载对原业务结果的呈现，不自行改变资金/法律权利状态；收件人须受租户与投资者级权限约束。 | B06-16 |
| **M18-F002 补件审核待办** | P0／共享核心或必要治理 | 为 Issuer 审批人、受限客服及投资者分别分发补件、文书复核、合约签名及资金异常待办，关联 M17 的责任任务。 | task_ref、recipient_role、visibility_scope、required_action、deadline_at、deep_link_permission | 未授权人员不能通过通知 URL 直接进入敏感材料或审批；任务完成受 M17 权威审核状态控制。 | B06-17 |
| **M18-F003 站内消息与通知事件记录** | P0／共享核心或必要治理 | 保留站内消息、事件生成、投递记录、查看/确认和必要内容版本；发送记录与依法有效的送达凭证分开。 | message_id、template_version、source_event_ref、delivery_attempt_ref、read_at、ack_at、legal_notice_flag | “已发送/已读”不天然等于法律有效送达，法域需要特定渠道或签收时必须保留外部有效凭证。 | B06-18 |
| **M18-F004 基础模板与邮件连接** | P1／条件性最低深度 | P1 条件性：最小批准模板与邮件/适格外部通知渠道适配；按真实 Instrument、合同与法域判断所需模板、语言及内容完整性。 | template_id、template_version、sender_authority、channel_id、recipient_class、legal_notice_ref | 法定公告/违约或分红通知若需要特定送达，不可因为邮件集成后置而丢失必要合法渠道；营销模板不属于该最低需求。 | B06-19 |
| **M18-F005 发送失败与提醒重试** | P1／条件性最低深度 | P1 条件性：对非交易型通知按幂等策略重试/升级，保留发送失败、退信、无响应、改道及告警。 | attempt_id、notification_id、provider_message_id、retry_count、failure_code、escalation_case | 重发通知不能重复触发支付、配售、Mint 或登记操作；对有法定期限的失败通知必须升级责任方。 | B06-20 |
| **M18-F006 营销通知与全渠道偏好** | P2／非默认首期 | P2 后置：营销推送、多渠道画像、增长活动和全量偏好中心不默认 Issuer V1；必须送达的交易/法律信息独立处理。 | marketing_segment、channel_preference、campaign_orchestration（后置） | 不得用营销退订一键取消依法或合同必须的持有人通知；遵守适用同意与隐私要求。 | B06-21 |

### M20｜安全审计、证据和数据治理（9 项）

| 原功能 ID / 名称 | 原等级 / 推荐交付定位 | 业务操作与责任 | 最低业务字段/引用（非字段级规格） | 必须阻断/异常/授权约束 | 验收 |
|---|---|---|---|---|---|
| **M20-F001 租户资源与敏感字段隔离** | P0／共享核心或必要治理 | Tenant/Org/Project/Offering 与持有人数据的服务端资源授权和敏感字段隔离，跨租户复用仅在合法权利和明确授权下开放。 | tenant_scope、object_owner、permission_policy、field_classification、access_reason | 不得仅依前端隐藏实现隔离；A/B 持有人/账户/证件敏感信息不同主体角色授权可见范围不同。 | B06-22 |
| **M20-F002 关键操作与审批追加审计** | P0／共享核心或必要治理 | 关键财务、法律、链上、审批、异常更正和权限变动记录以不可无痕覆盖的追加审计事件组织。 | audit_id、actor_ref、action、object_ref、before_hash、after_hash、approval_ref、occurred_at、source_ip_ref | 人工作废、更正与撤销必须保留原事件及原因，内部操作日志不冒充链上/法定外部事实。 | B06-23 |
| **M20-F003 金额币种精度与权威时间** | P0／共享核心或必要治理 | 金额、币种、Token 精度、债权本金单位、股份单位、精确时间、时区和舍入规则由权威版本控制，支持来源数值的无损比较及对账。 | currency_code、asset_contract、amount_in_minor_units、precision、rounding_rule_ref、effective_time_utc、source_tz | 不同货币/Token/合法份额不可默认 1:1；快照记录日与链上观察时间不得混为同一法定时间。 | B06-24 |
| **M20-F004 链上资金登记执行证据** | P0／共享核心或必要治理 | 保留支付、登记、Token、收益出款的原始外部回执、链事件/区块、版本哈希、最终性策略和后续校正关联。 | evidence_id、external_provider_ref、chain_network、tx_ref、register_proof_ref、content_hash、observed_at、verified_at | 第三方日志/回调不直接证明法定生效；链重组或原回执被撤销需重新核验并保留原历史。 | B06-25 |
| **M20-F005 KYC 文件最小访问** | P0／共享核心或必要治理 | 对 KYC/法律文书/投资者联系及收款账户实施最小访问、可审计授权、必要期限、脱敏导出及外部数据处理边界。 | subject_id、legal_basis_ref、purpose_scope、consent_or_exception、access_grant_id、expiry_at、redaction_policy | 不默认将投资者 KYC 证件跨 Tenant 转售或公开；法定持有人必要查阅权与证件敏感原件权限区分。 | B06-26 |
| **M20-F006 退出留存限制处理及删除** | P0／共享核心或必要治理 | Tenant 暂停/退出涉及权威数据留存、依法删改、持有人/外部执行责任接替、权限撤销、服务商和未结义务交接。 | exit_plan_id、open_obligations、retention_basis、data_export_ref、successor_ref、access_revocation_ref、handover_approval | 合同 Terminated 不自动消灭债权/股份或已发生真实付款；合法留存/删除请求要与必要记录责任协调并保持独立证据。 | B06-27 |
| **M20-F007 报表和数据受控导出** | P1／条件性最低深度 | P1 条件性：对法律/审计、资金对账、持有人或公司资料支持带授权理由和字段遮罩的基本导出；复杂合规包与自动数据湖可后置。 | export_request_id、permitted_scope、column_allowlist、reason、approver、expiry_at、download_audit | 报表读取权限不等于全量 KYC 导出权限；批量跨租户导出、高风险原件下载须额外阻断与批准。 | B06-28 |
| **M20-F008 安全事件及凭证撤销** | P0／共享核心或必要治理 | 监测管理员/签名/服务凭证滥用、越权、异常访问和资料外泄，支持凭证撤销、隔离、调查及责任升级。 | security_incident_id、affected_credentials、detection_signal、revocation_at、incident_owner、rotation_ref | 不得由 SaaS 普通客服在未授权下撤销法定登记或外部钱包控制权；测试生产密钥/Token 必须隔离。 | B06-29 |
| **M20-F009 高级数据安全自动化** | P2／非默认首期 | P2 后置：高级自动风险发现、跨域数据分类机器人、复杂行为评分等不作为首期必需交付；保留基本租户隔离、审计、告警和手动处置。 | risk_model_version、automated_classification、data_lineage_ai（后置） | 不因为高级自动化未实现就允许无审计操作、跨租户查询或明文密钥泄露。 | B06-30 |

### M21｜项目、资金、登记、收益报表（7 项）

| 原功能 ID / 名称 | 原等级 / 推荐交付定位 | 业务操作与责任 | 最低业务字段/引用（非字段级规格） | 必须阻断/异常/授权约束 | 验收 |
|---|---|---|---|---|---|
| **M21-F001 Issuer 项目和 Offering 概览** | P0／共享核心或必要治理 | 按租户/角色展示每个 Project/Offering 的发行阶段、募集额、配售、已确认资金、交付及未结存续任务的只读概览。 | tenant_id、project_id、offering_id、as_of_at、allocated_units、payment_reconciled、lifecycle_open_count | 从 M05/M10/M11/M12/M07/M13 受权源读取；不得把 Draft/Pending 等同于已结算成功，统计要标定义。 | B06-31 |
| **M21-F002 投资者及认购查询** | P0／共享核心或必要治理 | 按发行机构授权查看投资者与认购清单，支持资格/合同/报价/注册关联及必要敏感字段脱敏查询。 | investor_ref、offering_ref、subscription_status、eligibility_status、order_ref、masked_holder_ref | 投资者名单查询不能隐式提升 KYC 原件权限，也不允许租户横向搜索其他发行机构客户。 | B06-32 |
| **M21-F003 资金对账与异常报表** | P0／共享核心或必要治理 | 分别呈现已核验认购收款、退款、收益付款及对账差额，标示数据来源、区间、Finality 和 Unknown 调查状态。 | payment_type、external_payment_ref、amount、asset_ref、period、recon_state、mismatch_count | M21 不是新资金账本，不允许报表点击后改写付款完成事实；退款与收益出款分别统计。 | B06-33 |
| **M21-F004 配售登记及 Token 状态** | P0／共享核心或必要治理 | 对每个 Offering 显示 Allocation、法定登记、Token Mint/持仓与差异调查分别独立的只读统计，允许钻取来源证据。 | allocation_ref、register_state、registered_units、token_state、token_supply、mapping_ratio、evidence_links | 不得以链上余额或 Token 供应作为唯一股权法定持有人数，也不得把不同权威时点的数直接相减宣称已一致。 | B06-34 |
| **M21-F005 基本存续期查询** | P1／条件性最低深度 | P1 条件性：按 A 或 B 实际 Instrument 展示最小存续权益、应付/已付、本金余额、分红决议、记录日及投资者受权查询。 | series_or_class、snapshot_ref、due_amount、paid_amount、outstanding_amount、record_date、rights_status | 若首发 A 要付票息还本，基本查询应随必要功能交付；B 无合法分红事件则不生成应付收入或保本收益。 | B06-35 |
| **M21-F006 筛选及受控导出** | P1／条件性最低深度 | P1 条件性：受控筛选、必要审计/财务导出和追溯链接；复杂多维 BI 后置，但依法应提交的基本报表不可丢失。 | filter_spec、export_scope、requester_role、redaction_policy、source_version、generated_at | M20 统一许可检查和导出审计；同一报表不同角色可见字段不同，下载链接应有期限与撤销。 | B06-36 |
| **M21-F007 BI 预测和复杂分析** | P2／非默认首期 | P2 后置：BI 预测、跨资产智能分析、复杂指标建模及外部经营数据市场不默认 Issuer V1。 | forecast_model、cross_tenant_benchmark、advanced_dashboard（后置） | 不把未来预测误呈现为法定应付收益或已经实付金额；基础审计查询/报表必须可靠。 | B06-37 |

## 五、M13 发行后事件与金额的最低领域契约（业务字段组，非正式接口/数据库规格）

| 领域引用/对象 | 最低业务信息（示意） | 事件/状态视图与独立权威 |
|---|---|---|
| **LifecycleRegister** | issuer_ref、instrument_version、series_or_share_class、offering_refs、legal_obligation_ref、responsible_actor、obligation_status | 记录未结义务、期限、合法交接，**Offering 售罄/关闭不使其自动终结** |
| **HolderEntitlementSnapshot** | snapshot_id、record_date_and_cutoff、register_authority_ref、legal_holder_ref、rights_class、effective_units、evidence_version、dispute_ref | PendingEvidence / Verified / Disputed；M12 登记提供权威来源，M13 消费被确认版本 |
| **LifecycleEvent** | event_id、event_type、rights_terms_version、entitlement_snapshot、due_date、approved_distribution_basis、approval_ref | **Frozen WF-13 的 Draft → CalculationPending → Calculated → ReviewPending → Approved → Processing → Completed**，同时支持 Failed / Disputed / NeedsCorrection / Cancelled 适用分支；具体代码未冻结 |
| **PayoutIntent / ExternalPayoutResult** | payout_intent_id、currency_amount、payer_authority、beneficiary_ref、authorized_signer、external_instruction_id、payment_receipt、finality_ref | Created / Authorized / Submitted / Unknown / Confirmed / Failed（候选视图），与 LifecycleEvent Approved 不等价 |
| **DebtPrincipalOutstanding / DividendEntitlement** | initial_nominal、paid_principal、outstanding_principal、overdue_since 或 corporate_resolution_ref、share_class、distributable_amount、record_date | A 有债务本金/到期；B 仅有合法分配和实体权益，不能混用固定收益算法 |
| **LegalDischarge / RegisterUpdate / TokenDisposition** | legal_discharge_evidence、register_change_ref、burn_or_freeze_intent、chain_finality、reconciliation_case | M13 清偿、M12 名册、M07 链上各自独立；即使 Burn 先发生也不能据此宣告偿债完成 |
| **ExceptionCase** | severity、original_domain_intent、evidence_refs、assigned_owner、hold_scope、remediation_approval、closure_evidence | M17 归集恢复、批准和证据，不取得原始资金/法定登记改写权 |
| **Notification / LegalDelivery** | message_id、source_fact_ref、channel、recipient_scope、send_status、read_ack、legal_delivery_authority_ref | 已发送/已阅读/有效法律送达各自独立，M18 不因发信改变资金或持有人法定状态 |
| **AuditEvidence / ReportView** | tenant_scope、actor、field_policy、source_hash、observed_at、legal_effective_at、report_as_of、export_audit | M20 提供不可无痕覆盖证据与隔离；M21 只读聚合，导出权限另审 |

**金额与日期守卫**：批准的法定本金币种、实际稳定币付款、收益出款币种、税费/手续费（适用时）、计息日数基准、记录日、外部事件发生时间和系统观察时间都独立保留。汇率、合法纳税、通知法律效力和舍入参数不在本批推定某个全球通用值。

## 六、A 债权与 B SPV 权益的不同收益/退出模型

| 维度 | A：固定收益到期债权样本 | B：SPV 股份/实体权益样本 |
|---|---|---|
| **发行后基础事件** | 起息、票息记录日/付息日、到期本金、合法提前清偿/违约 | 公司事项披露、类别权益、公司依法批准的可选分红/分配、回购或清算 |
| **权益单位** | 生效债权人、Series、合法名义本金/债务余额；后入价格应计不直接等于票息 | 依法登记股份/成员权益类别及单位、合法分配优先级；Token 不直接代表股东身份 |
| **应付计算前提** | 适用有效合同利率、合法计息基础、记录日、权威快照、法定扣除；参数仍待真实工具批准 | 适用法律、公司章程/决议、可分配金额、类别优先权与记录日；没有批准不生成固定应付 |
| **外部支付** | 承担债务的合法主体履行票息和到期本金；多笔或部分偿付累计核对 | 经公司有效授权的付款主体履行依法批准的分红/回购/清算分配 |
| **法定终结** | 本金实际偿付与依法债务解除、登记减记/终结核对；可按合法规则联动 Token Burn | 合法回购/股权注销/变更与公司名册及受权 Token 处置；不能将 M11 普通认购退款当回购 |
| **必须见到的异常** | 迟登记、记录日争议、重复出款、未偿本金、违约、已 Burn 未清偿 | 无合法决议、股份类别错误、稀释争议、错分红、已支付但公司名册无效、回购手续不足 |
| **条件性 P1** | M13-F004/F005/F006 属**样本 A 最低必要闭环**，保持原 P1；M21-F005 等按实际需要最低披露 | 不默认定期派息；如果真实 B 合法工具规定现金分配/回购义务，则最低事件、复核和出款核验必须实现 |

A1 例外：同一 Series 可有多个 Offering/晚入场，但应严格按已批准的定价/权益版本、record date、clean/dirty/应计策略与合法债务名义单位处理；不能用前一次持有人的 Token 价格直接推定下一次票息。本批**不冻结** Actual/360、30/360 等具体日数算法，也不暗示 1 Token = 1 美元法定债权。

## 七、权限、事件通知、数据留存及跨模块业务异常

| 异常/边界 | 检测及领域责任 | 限制、调查及补救策略（业务建议） |
|---|---|---|
| 票息已 Calculated，但快照后来发现权威变更 | M13/M12 | 按批准记录日/名册规则标争议并形成新计算版本，不直接覆写历史或盲目出款 |
| 付款 Provider 失联或返回超时 | M13/M22/M17 | 保留原出款指令标 Unknown，先查询合法付款方与链结果，未证实前禁止重复汇款 |
| 已付本金但登记减记/Token Burn 失败 | M13/M12/M07 | 保留 Paid，登记与链单独 Unknown/Failed，针对相应环节批准恢复，不再次支付本金 |
| Token 已销毁但 A 本金未付 | M07/M13/M17 | 债权债务未当然消灭，异常高风险升级、合法更正/追偿，禁止报表显示已清偿 |
| B SPV 无利润/董事会或法定决议 | 公司/Issuer/M13 | 禁止生成应付固定分红或自动执行，依法保留披露与待审批事项 |
| 股份类别变更或有效记录日争议 | M12/M13 | 对有争议权利人限制相关分配，调取权威记录、保存快照/更正差异 |
| 一个持有人已实际收到部分收益 | M13/M21 | 分开应付、实付、未付及异常，不能以一笔部分付款标全部 Completed |
| 法定通知退信/地址无效 | M18/M17/适格送达方 | 保存送达失败记录、升级责任人并按适用法域启动补救；不要靠重复发送认定法律已送达 |
| webhook 重放同一付款成功事件 | M22/M13/M17 | 根据原指令+事件唯一性验证，不重复生成另一个付款；真实不同出款分别保留 |
| 事故关闭后权威发现新回执冲突 | M17/M20 | 允许 Reopened 并追加新事件和证据；不修改已核验原回执 |
| 财务报表把 Pending 当作 Paid | M21/M13 | 统计强制分列，来源、时间、币种和不一致记录显式可见 |
| 运营人员导出另一 Tenant 的股东/收益资料 | M20/M21 | 服务端拒绝、记录越权尝试、限制字段并触发必要安全处置 |
| Tenant 暂停但有未到期债权/退款 | M01/M03/M13/M20 | 有责任承接/合法查询及处置清单，防止资产权利和在途义务被错误终止 |
| 把租户删除请求等同于全部记录物理删除 | M20/合法数据控制方 | 依据法律保留义务区分删除、封存、受限访问与合法导出；不破坏法定名册或债权证据 |
| 应计利息、Token 精度、USDC 精度冲突 | M13/M20/M11 | 独立计量和舍入版本，金额差异入工单复核，不以 UI 格式化掩盖差额 |
| 部署/签名或支付凭证疑泄漏 | M20/M22/M17 | 受权停用/轮换、记录影响范围、隔离继续执行权限，既有合法权益与真实已发生外部事件不被删改 |
| 只有营销渠道但缺合法法定送达 | M18/法定责任人 | 依法确认必要外部渠道和回执；若未具备强制送达能力则触发生产门阻断 |
| 强制报表/披露被标注 P1 后整体省略 | M13/M18/M20/M21 | 判断 Instrument/法域强制最低内容与交付方式，必要项纳入真实 V1 决策门，后置高级可视化不后置必需义务 |

## 八、37 个最低业务验收设计（**全部 Not Executed**）

以下为业务审核卡，不是自动化测试/真实生产测试。执行时应准备 A/B 受权样本、有效法定权利文件、外部 Provider 沙盒/模拟数据、权限矩阵、幂等与 Unknown/重组回放以及可核验审计证据，再由真正验收负责方按证据更新状态。

| 案例 ID | 输入或异常条件 → 必须得到的行为/禁止的副作用 | 对应原功能 ID | 当前 |
|---|---|---|---|
| **B06-01** | 同 Project 两轮 Offering 一轮已关闭但债务未到期，尝试归档：保留有效存续任务及责任人，禁止把 Instrument 当作已清偿。 | M13-F001 | Not Executed |
| **B06-02** | A 票息记录日钱包已变但法律名册未变：仍用适用法律记录日和名册核实；证据冲突时暂停相关付款并建立差异。 | M13-F002 | Not Executed |
| **B06-03** | 披露报告版本更新后，已有投资者取得的旧版本记录必须留存；需要重发/重新确认时生成新任务而非删旧记录。 | M13-F003 | Not Executed |
| **B06-04** | B SPV 无分红决议但页面自动创建应付 8%：必须拦截；A 到期票息/本金建立两个各自可核验的义务事件。 | M13-F004 | Not Executed |
| **B06-05** | 同一 Series 晚入场债权人的应计利息价格不直接当作票息权益；计算版本被纠错时必须撤旧用新并留下差额依据。 | M13-F005 | Not Executed |
| **B06-06** | 分红转账接口超时但链上已扣款：保持 Unknown 调查；查询原付款后才能确认或走受权补救，禁止重复出款。 | M13-F006 | Not Executed |
| **B06-07** | A 到期只支付 40% 本金后租户终止合同：未付 60% 仍可追溯，拒绝直接标记已清偿或删除数据。 | M13-F007 | Not Executed |
| **B06-08** | 未上线复杂公司行动模块时，合法发行所需的基本登记/支付更正流程仍正常；未经许可的合并拆分自动执行被阻断。 | M13-F008 | Not Executed |
| **B06-09** | 同一人发起和批准 M13 真实出款高风险任务：按权限规则拒绝，并保留尝试审计。 | M17-F001 | Not Executed |
| **B06-10** | KYC 失效同时有合法已持有股权：拒绝新认购，既有权利和必须通知义务不自动清零。 | M17-F002 | Not Executed |
| **B06-11** | 股权名册登记 99 单位、Token 100 单位：开立差异案件并阻断完整交付展示，原 99 与 100 均留存。 | M17-F003 | Not Executed |
| **B06-12** | RPC/支付方 502 后操作员点击重试：系统必须先查询原 nonce/指令并阻止双 Mint/双付款。 | M17-F004 | Not Executed |
| **B06-13** | 调查完成但外部法定登记仍 Unknown：案件不能仅因为人工留言“已处理”而自动结案。 | M17-F005 | Not Executed |
| **B06-14** | 本息偿付失败的调查跨过合同期限：升级责任人并留存原因与通知事件，不自动标已付。 | M17-F006 | Not Executed |
| **B06-15** | 无低代码流程画布也能完成发布审批、外部 Unknown 调查和合法收益核算复核。 | M17-F007 | Not Executed |
| **B06-16** | 支付 Pending 被误写“已获股权”的通知要阻断或纠正；原通知及更正事件均留痕。 | M18-F001 | Not Executed |
| **B06-17** | 投资者收到另一租户补件提醒或链接：拒绝且不泄露标题、机构、证件。 | M18-F002 | Not Executed |
| **B06-18** | 投资者未读消息但系统将公司法定通知标送达：阻断该结论，转向合资格送达机制。 | M18-F003 | Not Executed |
| **B06-19** | B SPV 法定会议通知需受权指定渠道：站内消息可提醒，但不能单独作法律送达证据。 | M18-F004 | Not Executed |
| **B06-20** | 重复投递分红通知 3 次，不得生成 3 笔出款；发送失败要留痕并由受权人补救。 | M18-F005 | Not Executed |
| **B06-21** | 投资者关闭营销推送后，必要到期债务通知仍依有效送达规则发送。 | M18-F006 | Not Executed |
| **B06-22** | 两个租户拥有同一钱包地址：一个 Issuer 不得看到另一租户的收益、法定名册和 KYC 原件。 | M20-F001 | Not Executed |
| **B06-23** | 人工将 100 Token 错配改为 99：保留原差异证据、更正批准和链/登记实际变化，不允许直接覆盖历史。 | M20-F002 | Not Executed |
| **B06-24** | USDC 6 位精度与债权名义本金 2 位精度混算出现 0.01 差额：不能静默抹零并确认付款对账。 | M20-F003 | Not Executed |
| **B06-25** | 链重组后确认消失，旧“成功”凭证仍留存，但业务恢复待核状态并通知受权操作人员。 | M20-F004 | Not Executed |
| **B06-26** | Issuer 客服请求导出所有股东证件照片而无合法权限：应拒绝、留审计，不影响合法股东名册查询。 | M20-F005 | Not Executed |
| **B06-27** | Issuer 停用 SaaS 仍有未付票息和退款 Unknown：阻止删除权威数据并要求责任交接和必要只读/处置访问。 | M20-F006 | Not Executed |
| **B06-28** | 财务人员导出收益明细只能获取所属发行机构合法范围内数据，不能附带其它租户的身份证影像。 | M20-F007 | Not Executed |
| **B06-29** | Webhook 密钥疑泄露：暂停受影响接入、轮换与隔离，既有付款/持有人权利事实不能直接重写。 | M20-F008 | Not Executed |
| **B06-30** | 无 AI 行为评分也能阻止跨租户数据检索和记录敏感操作。 | M20-F009 | Not Executed |
| **B06-31** | 同 Project 两个 Offering 不同状态：项目总览不得仅标“已结束”而掩盖仍在进行中的债务存续。 | M21-F001 | Not Executed |
| **B06-32** | 运营人员只能看自己的 Offering 统计，不能通过筛选导出另一 Tenant 的持有人名单。 | M21-F002 | Not Executed |
| **B06-33** | 认购付款 100 成功、票息出款 30 Unknown 时，不能汇总为已实付收益 30。 | M21-F003 | Not Executed |
| **B06-34** | M12 法定权益 99、链 100：展示有差异和案件入口，不能用平均数显示 99.5 已交割。 | M21-F004 | Not Executed |
| **B06-35** | A 到期部分还本仅 40%，报表应展示未偿 60%；B 未宣告分红时不显示固定预期股息。 | M21-F005 | Not Executed |
| **B06-36** | 客户审计员合法导出原始资金对账摘要，但看不到敏感 KYC 原件；导出权限回收后链接失效。 | M21-F006 | Not Executed |
| **B06-37** | 没有预测引擎，Issuer 仍能查对账、持有人、票息到期以及异常任务。 | M21-F007 | Not Executed |

### 补充跨模块 E2E 设计（不新增正式功能 ID）

- **B06-E2E-A 债权到期**：同 Series 后入债权人/记录日快照 → 票息计算及批准 → 外部部分兑付 → 出款 Unknown 调查 → 本金实付 → 登记减记 → Token Burn/冻结（顺序由实际批准工具确定） → 未结差异清零/责任保留；验证每个阶段证据独立，任一 Unknown 不自动完成。
- **B06-E2E-B SPV 分红**：真实有效公司机关决议/可分配额 → 权益类别/记录日快照 → 复核 → 外部合法分配付款 → 通知和账报；没有决议时应阻断“固定应付”，不跨法域假定公司法律效力。
- **B06-E2E-C 租户退出**：SaaS Tenant 停用 → 在途退款/收益/登记/Token 义务筛查 → 法律及数据责任承接 → 外部凭证移交/撤销 → 必要持有人告知 → 合法保留/导出；不因退租让未到期法律债务被删除。
- **B06-E2E-D 权威差异/安全事件**：发现原始收款与对账不符、登记/Token 差异或泄密 → M17 升级、M20 审计及 M22 危险凭证限制 → 真正领域受权人调查、查询原指令 → 受权补偿 → M21 按事实刷新；禁止客服单点把全部阶段改绿。

## 九、已获产品负责人批准的十二项产品最低交付深度 SCOPE（**SCOPE-194～205 Approved**）

| 编号 | 决策主题 | 推荐产品原则 |
|---|---|---|
| **SCOPE-194** | 审核边界与 ID 守恒 | 本批仅覆盖 M13/M17/M18/M20/M21 共 37 个原功能 ID（P0 23/P1 9/P2 5），沿用现有五类交付候选、模块主责任及 187 项整体分级，不新增、删除、改级或直接冻结最终 V1 必交；必要公共控制由共享核心复用。 |
| **SCOPE-195** | 合法权益快照与存续责任 | M13 建立以 Instrument/Series/ShareClass 权利版本和 M12 权威持有人登记/record date 为依据的存续档案与权益快照；Token/钱包不是法定权益唯一来源。发行结束、Offering Closed 或 Tenant 暂停均不自动消灭存续义务。 |
| **SCOPE-196** | A 债权票息、到期本金与部分偿付 | A 债权固定票息/到期本金作为参考工具的最低业务闭环，M13-F004～F006 按生效权利/记录日/合法价格策略、名义本金与计息、审批和外部实付分别留证；晚入场、Partial Paid、逾期、违约及残余本金可追踪；计息算法具体参数仍待实际条款审批。 |
| **SCOPE-197** | B SPV 合法可选分配与公司行动 | B 类仅当有公司/法域合法批准、可分配权益和明确记录日时生成分红/分配、回购或注销相关事件，按份额类别和权利顺序计算；不默认固定 Coupon/到期保本；复杂公司行动 M13-F008 P2 后置不免除合法最低公司行动责任。 |
| **SCOPE-198** | 收益/本金出款与权威事实分离 | M13 的核算/审批/应付与依法授权外部主体实际付款、M12 登记变更、M07 Burn/Finality 分开建模与核验；分红/还本不是 M11 认购退款。付款/登记/链 Unknown 先查原指令与回执、不得盲重付或清偿债务。 |
| **SCOPE-199** | 终止、逾期、义务迁移 | 本金清偿、股权回购或权利终止须按实际 Instrument 的法定生效、付款/登记/链条件独立确认；逾期、未结退款、权益争议或 Issuer SaaS 退租时须保留持续责任、合法通知、数据保留、权威记录交接与可追溯接任方。 |
| **SCOPE-200** | M17 异常编排与受权恢复 | M17 统一跨模块审批/复核/异常案件、风险分级、责任人、受控重试/补偿和可追溯结案。M17 不修改 M07/M11/M12/M13 权威事实；Unknown/重复回调不触发第二次不可逆执行；对具法律/资金期限的工单必须有最低升级机制。 |
| **SCOPE-201** | M18 通知、待办与合法送达 | M18 提供跨端按权限通知、待办与投递历史；消息发送、阅读、签收、依法有效送达是不同事实。M18-F004/F005 保持 P1 条件性，但强制披露/法定通知若适用需具备有效渠道、送达证据和失败升级，不以营销偏好删除必要消息。 |
| **SCOPE-202** | M20 安全、原始证据与退租治理 | M20 管理多租户/字段级隔离、审计追加记录、金额/币种/时间/精度、外部资金/登记/Token/出款证据、KYC 最小权限、异常与凭证撤销、合法留存/删除与责任迁移；纠错保留原事实，不默认 SaaS 拥有财产权或法定登记权限。 |
| **SCOPE-203** | M21 权限化只读报表 | M21 提供项目、投资者、认购、资金/收益、配售/登记/Token、必要存续信息的按角色只读聚合与权威来源追溯；M20 审核筛选和导出；不得另建资金/股权权威账本、自动把 Pending/Unknown 显示为完成或跨租户泄露。 |
| **SCOPE-204** | 九项 P1 条件性与五项 P2 后置 | 原 P1：M13-F004/005/006、M17-F006、M18-F004/005、M20-F007、M21-F005/006 按实际 A/B 工具、法域/受权主体和最低法律财务要求判定首期深度，必要底线不能因 UI 裁剪丢失；原 P2：M13-F008/M17-F007/M18-F006/M20-F009/M21-F007 非默认 Issuer V1。不得改动原分级。 |
| **SCOPE-205** | 验收与阶段边界 | 本批 37 个 B06-01～37 验收卡及建议最低深度已由产品负责人批准为产品原则及验收设计基线；所有 B06 案例 Not Executed、A/B 187 项 Not Tested。审核完成后才进入四端流程图→187 交叉核验→分端功能清单→字段级 PRD→整体冻结→统一 UI；不授权金融/链上真实执行、开发或 PR #6 合并。 |

**正式审批记录**：产品负责人已于 2026-10-23 明确回复“**SCOPE-194～205 全部同意**”，正式归档为[Approved 决策](../../decisions/SCOPE-194-205-batch06-lifecycle-exceptions-notifications-audit-reports-principles.md)。批准范围仅为最低产品深度与验收设计原则；不把整个文档误标为 Frozen 或完整字段级 PRD。

## 十、最重要的未决门与下一步

1. A/B 为已批准**产品设计验证样本**而非生产首发合法 Instrument；必须落实真实法域、具体法律权利、合同/章程、债务人/SPV、持有人登记主体及各类责任。
2. A 的日数基准、税费、币种转换、清偿/逾期条款和可执行价格策略；B 的合法分配/公司批准与优先类别，均不得由 SaaS 自动假设。
3. 收款/退款、Coupon/本金/分红外部实付、通知法定送达、链签名、登记更正须单独确认合法执行者和真实证据，以及未知交易异常恢复方法。
4. 条件性 P1 根据参考工具/法域/最小强制业务控制最后定深度，保留 **P0 125/P1 21/P2 21/V2 6/商业待定 14 = 187** 原源表，不在本批改级或承诺全 P0 生产。
5. **Batch 01～06 六批最低交付深度原则均已 Approved（2026-10-23）**，按用户决定下一步进入：四端跨业务泳道流程图 → 原 187 项功能双向核验 → 按端/模块/二级模块/功能点/业务说明/流程节点/ID/版本形成清单 → 真正字段级 PRD → V1 一致性/范围审核冻结 → **最后统一 UI/UX**。本批逻辑任务组不是实际导航或视觉设计。
6. **PR #6 保持 Draft / Open / Unmerged**，不改第 02～04 份 Frozen、不做真实金融/链上执行、不授权 UI 与研发。所有业务验收卡 **Not Executed**，全量 A/B 原功能 **Not Tested**。

**当前：Batch 01～06 最低产品深度原则均 Approved；Batch 06 M13/M17/M18/M20/M21 37 项最低深度原则已由 SCOPE-194～205 正式归档；B06-01～37 全部 Not Executed，A/B 187 项 Not Tested。已进入 Step 02 四端泳道流程草案阶段；真实 Issuer V1 最终实施范围、字段级 PRD、UI 和研发均未冻结或开始。**
