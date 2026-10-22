# RWA SaaS｜Issuer V1 交付深度 Batch 05：Token、合约与外部受权执行 v0.1

> **Detailed Functional Scope / Draft — SCOPE-186～SCOPE-193 全部尚待产品负责人评审，M07/M22 共 19 个原功能 ID 的最低交付深度为产品候选。** 不代表真实合约已部署、合约合法性已确认、真实签名/登记可执行、软件已完成、验收已测试或 Issuer V1 交付范围已冻结。更新日期：2026-10-22。
>
> 依据：[Batch 04 已批准最低产品原则](../../decisions/SCOPE-176-185-batch04-investor-payments-registration-principles.md)、[Batch 03 已批准](../../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md)、[原 187 项功能和等级](RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)、[187 项五类交付候选](RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md)、[已冻结 WF-09/11/12/13/18](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[ARCH-001](../../decisions/ARCH-001-api-first-unified-business-core.md)、[A 固定票息债权](RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)、[B SPV 股份权益](RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md)。
>
> **原功能/等级不变**：M07 **10 项**（P0 8、P1 1、P2 1），M22 **9 项**（P0 8、P1 0、P2 1），合计 **P0 16 / P1 1 / P2 2 = 19 项**。不新增正式 Mxx-Fxxx，也不因本批批准商业 M16 Open API 或 M14 二级转让。Batch 04 的真实付款/资格/配售、M12 法定登记和 M13 生命周期仍各自维护法律/资金权威。

## 一、本批要解决的真实业务问题

**核心不是“页面上点击发行 Token”，而是：某一真实法律 Instrument 对应的受控 Token，如何在得到合法发行与配售批准后，由有权主体安全签署上链、取得可验证最终性，并与权威法定持有人及资金事实持续保持可追溯的一致性。**

Issuers 购买 SaaS 不意味着 SaaS 自动成为资产发行人、投资者法定证券登记机关、真实收款/退款主体或 Token 合约私钥保管人。真实生产执行主体、监管/法域、合约、支付 Token/发行 Token、登记与 Mint 顺序、私钥方案均仍须在生产门 G-01～G-06 由合法责任方另行确认。

**五个独立事实面**：

| 事实源 | 最低业务权威 | 不能由谁的状态代替 |
|---|---|---|
| **权利/发行依据** | 受权发行人及法律文件，M04 InstrumentVersion/M05 OfferingVersion/M06 证据 | 不能由 SaaS Tenant Active 或“合约部署完成”代替 |
| **真实支付与退款** | M11 及实际资金/链权威，USDT/USDC 的网络/合约/精确金额/Finality | 钱包弹窗成功、TxHash 或 Node 回调不必然等于合法收款对账 Matched |
| **合法配售/权威登记** | M12 发行容量及适用法定登记主体 | Token Mint 成功不代表登记/股东身份有效 |
| **Token 上链/持有人接收钱包** | M07 受权签名与链上 Finality、独立链合约/网络证据 | 配售批准、法定登记回执不代表 Mint 已成功 |
| **存续权益及清偿/注销** | M13 真实债务/公司权益文件、外部实付方、M12 登记及 M07 Token | 付息/分红计算或 Burn 均不能取代真实付款和法定权利终结 |

## 二、四端/主体与权限划分（业务设计，不是 UI 最终菜单）

| 角色/端 | 主要动作 | 不应获得的默认权力 |
|---|---|---|
| **Issuer 企业 SaaS 用户**（项目/发行负责人） | 配置已批准链/合约方案、关联合法 Instrument/Offering、查看 Mint/登记差异、提交申请及受权审批任务 | 不能因为是租户管理员，就取得法律持有人登记、收款或链上密钥真实签名权限 |
| **Issuer 风控/合规/专职审批人** | 审核高风险合约版本、钱包资格、例外处置与冻结/恢复权限 | 不能越过真实法域合规义务、适格执行方授权或伪造签名回执 |
| **机构投资者端** | 绑定许可钱包、核验交付地址、查看受权 Token/法律权益/订单交付状态、必要异常通知 | 钱包余额不能被当成唯一法定持有人及股东权威 |
| **SaaS 平台运营后台** | 租户环境技术管理、第三方接入健康监控、受限故障升级、日志与密钥权限治理 | 不默认托管投资者或发行人资产，不能自行调用真实 Mint/Burn/退款或变更合法权利 |
| **外部依法适格执行者** | 身份/法律签署、资金及出款、法定登记、合约审查与链签名/RPC 按角色分别执行 | 单一服务商成功回调不自动等于所有跨系统法定/资金/链条件成立 |

## 三、最小用户/业务操作步骤与逻辑页面组

| 业务步骤与页面组（逻辑，未开展正式 UI） | 企业端发起与平台/外部责任 | 成功业务证据 | 必须显示/处理的异常 |
|---|---|---|---|
| **T-01 链与发行 Token 方案**：Instrument/Offering 详情、Token 配置 | Issuer 选受权网络、标准、合约映射、Token 数量/合法份额精度、接收限制，法律/技术审批 | 已获批准且可追溯的 TokenContractPlanVersion | 不支持网络、错误标准、法定单位↔Token 份额不一致、未授权链 |
| **T-02 合约版本和部署审批**：受控合约管理/高风险任务 | Issuer 提交参数/代码哈希及限制规则；受权执行/签名方审核并部署 | 有审批链、实际链上合约地址和已确认部署 Tx | 测试/生产隔离错误、合约参数被改、部署 Unknown/失败、签名撤权 |
| **T-03 投资者接收地址**：投资者钱包绑定、Issuer 受限查询 | 投资者证明钱包控制并核验与身份/法定权益人及发行限制一致 | 许可交付钱包及资格证据引用 | 付款来源地址和接收钱包混淆、交易所热钱包、白名单缺失 |
| **T-04 已配售份额的受权 Mint**：发行交付任务/单笔订单状态 | M12 提供唯一合法 Allocation；受权签名方依法完成所需登记/Mint 顺序 | MintIntent 唯一引用、实际合约 Mint 事件与 Finality | 重复命令、网络超时、nonce 冲突、配售/Token 数量差异 |
| **T-05 法律登记/链上 Token 对账**：发行交割与异常面板 | 适格法定登记者返回法律生效事实、M07 返回链事实，M12 组织差异核对 | 成对保留权威回执、独立 Token/登记/付款状态 | 登记成功但 Mint 失败、Mint 成功但登记拒绝/Unknown、链重组 |
| **T-06 最小 Token 转移安全**：合约限制与审批/暂停入口 | 受权合约控制禁转/白名单/锁定期与必要紧急冻结 | 可审计的合约级强制规则及执行证据 | 直接钱包转账绕过门户、受让资格丧失、密钥滥用 |
| **T-07 条件性赎回/销毁**：M13 还本/公司行动与 M07 Token 处置关联 | 合法清偿或股权回购/注销发生时，受权法律/资金/链方分别提供事实 | 支付、法定注销/变更、Burn/冻结各有真实有效证据 | Burn 成功但债务未清偿、注销 Unknown、重复销毁、股权被误作可随时赎回 |
| **T-08 外部适配器与健康/安全**：平台运营技术台、Issuer 只读风险提示 | 每个适格 Provider 按最小权限/环境/API 签名向原领域模块传事实 | 签名验证、事件幂等、Secret 管理、查询恢复、告警与人工责任工单 | 伪造 Webhook、Provider 失联、测试调用生产、签名 Key 泄漏、多服务商强行替换 |

**逻辑页面不等于正式 UI 方案**：一个详情页可以集中展示配售/名册/Token 状态，但数据写权威必须分别属于 M11/M12/M07/M13 和受权外部主体。正式导航、IA、组件/路由按六批完成后用户选定的全局流程图与字段级 PRD 再设计。

## 四、19 个正式功能的逐项最低交付深度候选（**全部 Draft**）

| 功能 ID / 原名 | 旧等级／交付类型 | 谁做什么／必要字段或引用 | 最低规则和阻断条件 | 验收设计 |
|---|---|---|---|---|
| M07-F001 发行链与 Token 标准配置 | P0／共享业务核心需实现 | 为一个已依法批准的 Instrument/Offering 指定发行网络、RWA Token 标准、合约角色与最小精度；区分环境及发行 Token 与支付 USDT/USDC。 最低信息：chain_id、network_env、token_standard_ref、instrument_version、legal_unit、unit_to_token_ratio、decimals、transfer_policy_version、approved_at | 必须由项目/发行主体及受权部署/监管要求批准；系统只能从真实支持的网络/合约配置中选择，不宣称全链/所有标准已经生产可用。 | B05-01 |
| M07-F002 合约参数版本和部署批准 | P0／受权外部执行 + SaaS 核验 | 基于经审权利版本草拟合约参数，进行差异校验、风险审批，交由真正授权的签名/部署主体执行并追踪部署回执。 最低信息：contract_intent、artifact_hash、parameter_version、implementation_ref、deploy_authority、signer_policy、approval_chain、chain_id、deployment_receipt | 审批通过≠部署成功；合约代码/版本必须与批准的权利映射、转让限制、网络和审计证据一致；生产密钥不交给普通 Issuer 编辑员或 SaaS 客服。 | B05-02 |
| M07-F003 钱包接收地址登记与校验 | P0／共享业务核心需实现 | 投资者维护 RWA Token 接收钱包，完成适用的控制权证明、身份关联、白名单/黑名单及准入、锁定限制校验。 最低信息：investor_ref、legal_holder_ref、delivery_wallet、wallet_control_evidence、chain_id、wallet_policy_version、eligibility_ref、approval_expiry | 付款来源地址、交易所提现热钱包、RWA Token 接收钱包和依法登记持有人必须分别记录；钱包绑定不意味着法定权益已登记。 | B05-03 |
| M07-F004 获批准 Mint 与交付 | P0／受权外部执行 + SaaS 核验 | 通过唯一已获批准 Allocation 生成 Token Mint/交付意图，经授权签名主体签发链上指令并关联正确持有人接收钱包。 最低信息：allocation_id、registered_holder_ref、rights_version、token_quantity、unit_ratio、mint_intent_id、delivery_wallet、approval_ref、external_signer_ref | 一次配售只执行允许的数量/次数；预执行复核合法发行权、资格、法定登记及法律上规定的执行时序；SaaS 不以自身权限绕过多签或私钥授权。 | B05-04 |
| M07-F005 链上提交确认与 Unknown 查询 | P0／受权外部执行 + SaaS 核验 | 追踪合约执行 Tx 的 Submitted、Confirming、Confirmed、Unknown、Failed 与链重组，支持查询原交易/nonce/事件和受权恢复。 最低信息：execution_intent_id、chain_id、tx_hash、nonce_ref、block_hash、log_index、confirmations、finality_policy_ref、last_observed_at | 广播≠最终确认；Unknown 不能直接重发不可逆 Mint/Burn；链重组可令之前的观察结果失效并触发重核。 | B05-05 |
| M07-F006 Token 与登记配售核对 | P0／共享业务核心需实现 | 比对原获配份额、依法成立的持有人名册与链上 Token 供应/持有及合法映射规则，生成差异与处理任务。 最低信息：allocation_ref、legal_register_ref、legal_effective_at、registered_units、token_minted_units、contract_total_supply、mapping_ratio、discrepancy_case | M12 法定登记、M07 Token 和 M11 支付款项各自独立权威；允许业务只读统一进度，但账目/权利差异不能被手工直接改绿。 | B05-06 |
| M07-F007 必要合约级转让限制 | P0／共享业务核心需实现 | 为 V1 Token 启用法域及合法权利要求的最小接收资格/白名单、转移冻结、锁定期和受控暂停规则。 最低信息：transfer_rule_version、qualified_wallets、lockup_until、jurisdiction_guard、pause_ref、authorized_operator、contract_event_evidence | V1 不提供 M14 用户间二级转让产品/交易页面；即便链直接 transfer，也不得绕过必须强制的合约及法定受让限制。 | B05-07 |
| M07-F008 高风险密钥操作权限与暂停 | P0／受权外部执行 + SaaS 核验 | 管理部署/Mint/Burn/暂停/授权升级等高风险命令的申请-批准-实际签名分离、最小权限、紧急停用和审计追踪。 最低信息：operator_policy、signer_role、multi_approval_refs、contract_admin_ref、emergency_pause_reason、revocation_event、audit_log | 真实生产签名主体、私钥托管方式及多签门限由独立适格责任方批准；平台技术人员不默认掌握可动用资产的密钥。 | B05-08 |
| M07-F009 赎回销毁与授权调整 | P1／条件性必需（需参考工具裁决） | 仅在债务到期合法清偿或股权依法回购/注销、更正等工具条件触发时，发起受权 Token Burn/冻结/数量调整流程。 最低信息：redemption_or_corporate_action_ref、legal_discharge_or_cancel_ref、outbound_payment_ref、register_update_ref、burn_intent_id、finality | 原 P1 条件性必需，A 到期可能需要销毁/冻结，B 股权不自动可随时赎回；法定债务/股权终结、真实资金支付、登记和 Token Burn 先后依批准工具规则决定。 | B05-09 |
| M07-F010 复杂多链部署与合约升级 | P2／暂不计入 Issuer V1 首期 | 后置的多网络统一发行、自动跨链供应、复杂合约升级与迁移策略，不作为单一受权网络/合约的首期前置。 最低信息：multiple_chain_support、proxy_upgrade_plan、crosschain_supply、migration_rights_mapping（后置） | 原 P2 非默认 Issuer V1；基础合约版本/证据/暂停及审计仍必须能够安全工作，不能以 P2 延期代替修补高风险缺口。 | B05-10 |
| M22-F001 KYC KYB AML 服务适配 | P0／共享业务核心需实现 | 以受权 Provider Adapter 向 M09 提供 KYC/KYB/AML 请求、主体绑定、补件、回调/查询证据与核验版本。 最低信息：provider_case_id、subject_ref、tenant_scope、consent_basis、request_id、provider_result、review_evidence、expiry_at | 外部核验结果、Issuer 的Offering资格、软件 Tenant 管理权限不同；接入方调用成功≠ Verified，跨租户敏感资料须隔离。 | B05-11 |
| M22-F002 稳定币收款监测集成 | P0／共享业务核心需实现 | 接入批准的稳定币/网络链上转账观察或合法支付服务，回传 M11 所需真实事件及对账来源。 最低信息：payment_intent_ref、chain_id、stablecoin_contract、tx_hash、log_index、recipient、payer、raw_amount、provider_finality_ref | 只能向 M11 提供可核对的原始链/实际收款事实，不默认托管资金/退款；真实两笔付款不得误去重，同一事件重复回调不得重复计款。 | B05-12 |
| M22-F003 节点钱包和链上事件集成 | P0／共享业务核心需实现 | 对接受权 RPC/节点/钱包观察服务，获取 Token 合约事件、链区块/最终性、重组检测与交易查询。 最低信息：node_provider_id、chain_id、event_id、tx_hash、block_number、block_hash、log_index、finality_status | 事件真实性必须交叉核验网络与合约/地址、适用确认策略、链重组；外部服务可观察链事件，不等于代执行私钥签名。 | B05-13 |
| M22-F004 权威持有人登记服务集成 | P0／受权外部执行 + SaaS 核验 | 通过经法域认可的法定登记主体/系统提交/查询债权人或 SPV 股东/成员名册变化、回执、有效时点和更正记录。 最低信息：register_authority_ref、legal_holder_ref、rights_class、registration_intent_id、registered_units、effective_at、proof_version | 具体登记法律权威因 Instrument/法域而异；Submitted/Accepted/Unknown/LegallyEffective 不得简单合并，名册与钱包 Token 独立核验。 | B05-14 |
| M22-F005 电子签署证据服务接口 | P0／受权外部执行 + SaaS 核验 | 将适用认购合同、风险文件及必要电子签外部请求/回执与 M06/M10 有效文书版本绑定。 最低信息：document_version、signer_legal_identity、signing_request_id、provider_receipt、signature_validity_ref、signed_at | 签署请求已发送、Provider 返回成功、依法有效签署三个判断分别记录；受限交易前检查合法签署要求。 | B05-15 |
| M22-F006 Webhook 签名去重和重试 | P0／共享业务核心需实现 | 对所有第三方回调/Webhook 校验来源签名/授权、事件唯一标识、乱序/重复、可重试查询与安全审计。 最低信息：provider_id、event_id、signature_verified、timestamp、idempotency_key、correlation_id、retry_count、event_schema_version | 回调是候选事件而非金融法律的唯一权威；同一事件重复不触发重复付款/退款/配售/Mint，多个真实事件不因相似而丢失。 | B05-16 |
| M22-F007 服务健康及失败升级 | P0／共享业务核心需实现 | 监控身份/支付/签署/登记/链等集成的可用性、延迟和故障；给 Issuer/平台受权人员生成升级与恢复工作项。 最低信息：provider_health、incident_id、business_impact、service_owner、last_success_at、retry_policy、alert_ref | 服务不可达/超时仅是 Unknown 或待查询，不得自动把已发生真实交易标失败，更不能重复不可逆动作。 | B05-17 |
| M22-F008 外部凭证及环境隔离 | P0／共享业务核心需实现 | 为外部服务 API Key/Webhook Secret/签名授权和模拟/沙盒/生产环境建立隔离、权限撤销、最小可用范围与变更审计。 最低信息：environment_id、provider_credential_ref、secret_version、key_owner、access_scope、rotation_at、audit_ref | 测试 Token、模拟回调和生产链/真实付款必须物理及权限隔离；不把原始密钥暴露在普通 UI/日志/客服工单中。 | B05-18 |
| M22-F009 多服务商智能切换市场 | P2／暂不计入 Issuer V1 首期 | 后置的多服务商报价/择优自动切换、供应商 Marketplace 和智能路由；V1 仅需所选合格服务的可靠集成及故障处理。 最低信息：provider_switch_rule、marketplace_offer、multi_vendor_selection（后置） | 原 P2 后置；替换服务商可能改变资金/登记/法律责任，不允许失败时不经授权把在途交易自动转给另一个执行主体。 | B05-19 |

## 五、关键状态与外部执行契约（与 Frozen WF-11/18 保持一致）

以下是需要 UI/领域层**分别表示的业务阶段**，不在本批新增冻结状态机枚举或具体 API 路径；所有外部请求应记录 `correlation_id`、`idempotency_key`、环境、授权/批准版本、执行主体与真实回执引用。

| 业务对象/权威 | 状态/业务事实（参考已冻结业务原则） | 允许的下一步与必须阻断的误操作 |
|---|---|---|
| **TokenContractPlan**（M07） | 方案草案、审核中、批准待部署、已部署待验证、可用于受权发行、暂停/弃用（产品视图） | 方案批准≠部署成功；实际部署环境/合约/代码哈希必须核验后使用 |
| **TokenExecution**（M07/外部真实链） | **NotAuthorized → Ready → Submitted → Confirming → Confirmed**，Failed/Unknown/NeedsReconciliation 分支（Frozen WF-11） | Unknown 先查链/原 Tx/nonce，不立即重 Mint；区块重组需重核 |
| **RegisterUpdate**（M12/法定登记者） | **NotStarted → Pending → Submitted → Confirmed**，Failed/Unknown/NeedsReconciliation 分支（Frozen WF-11） | 实际法定登记生效可能与 Confirmed 回执还存在合同条件，必须保留适用法域凭证 |
| **DeliveryReconciliation**（M12） | **NotStarted → Matched / Mismatch → Investigating → Resolved**（Frozen WF-11） | 未合法 Matched 前不能把所有交付显示完全完成；争议保留谁负责 |
| **ExceptionCase**（M17） | Detected → Classified → Assigned → Investigating → RemediationApproved → Recovering → Reconciled/Closed；Blocked/Escalated/Reopened | M17 只协调异常，不能取代 M11/M12/M07 的真实事实写入 |
| **Provider Event**（M22） | 接收、验签/识别、去重、领域核验、入账/拒绝、异步查询/重试及隔离（候选技术中立视图） | Webhook success 只是外部消息；需查询领域权威及幂等执行结果 |

**四项不可合并**：①发行许可/金融权利 ②资金最终性/对账 ③合法配售和名册 ④真实 Token Mint/Finality。既有 WF-09/11/12/13/18 与 INV-01～03 不得被本批单状态“成功”覆盖。

## 六、债权 A 与 SPV 股权 B 两种真实 Token 表达差异

| 主题 | A 固定利息到期债权样本 | B SPV 股份/成员权益样本 |
|---|---|---|
| **发行权益单位** | 债权法定单位、名义本金、Series、期次同权与合理价格/利息口径 | 法定类别股份或成员权益、批准资本/公司决议、受益人/登记人差异 |
| **Token 映射** | Token 数量与名义本金、已登记债务分开，映射比率和精度需明文审核 | 1 Token 不天然代表公司固定百分比，需明确股数/类别与其他 Offering 稀释 |
| **登记权威** | 债权人/实际受益人权威依真实债务工具确定 | SPV 公司股东或成员名册及合法生效事件，不能用钱包地址取代 |
| **转让限制** | 债权适格受让、锁定、发行合约限制与证据 | 公司章程、优先认购、成员资格、禁转/批准等权利限制 |
| **赎回/Burn** | 到期本金/提前赎回合法清偿后，适用时依规则销毁/冻结；Burn 不代替实际还款 | 只有依法通过回购、注销、公司行动等才触发；不能预设普通投资者“随时提现” |
| **V1 范围** | 真实 Token 与必要禁转/名单规则，首期不支持自由 P2 跨链升级 | 同上；SPV 股权不能因为 Token 可 transfer 就绕过公司法或直接成为法定股东 |

首发真实金融工具、链/标准、合约和单位比率依发行主体/适格专业方另行确定；A/B 仅为**已批准的产品需求验证样本**，不是生产法律类型已经确认。

## 七、19 个对应验收案例设计（**全部 Not Executed**）

| 案例 ID | 输入/异常条件 | 正确结果及禁止的副作用 | 关联 ID | 状态 |
|---|---|---|---|---|
| **B05-01** | 为一个已依法批准的 Instrument/Offering 指定发行网络、RWA Token 标准、合约角色与最小精度；区分环境及发行 Token 与支付 USDT/USDC。 | 在测试链/错误标准或未获合法工具批准时，不能发布生产 Token 方案。 | M07-F001 | Not Executed |
| **B05-02** | 基于经审权利版本草拟合约参数，进行差异校验、风险审批，交由真正授权的签名/部署主体执行并追踪部署回执。 | 管理员改参数后未重新审批就部署；或真实部署失败却显示合约 Active。 | M07-F002 | Not Executed |
| **B05-03** | 投资者维护 RWA Token 接收钱包，完成适用的控制权证明、身份关联、白名单/黑名单及准入、锁定限制校验。 | 资金来自交易所汇总地址但 Token 误发回该发送地址，或未授权受让地址拿到限制性 Token。 | M07-F003 | Not Executed |
| **B05-04** | 通过唯一已获批准 Allocation 生成 Token Mint/交付意图，经授权签名主体签发链上指令并关联正确持有人接收钱包。 | 重复回调、错误数量/接收钱包或资格失效导致双 Mint、错发或越权发行。 | M07-F004 | Not Executed |
| **B05-05** | 追踪合约执行 Tx 的 Submitted、Confirming、Confirmed、Unknown、Failed 与链重组，支持查询原交易/nonce/事件和受权恢复。 | 外部 RPC 超时即重新铸造，造成重复 Token，或链重组后仍显示成功。 | M07-F005 | Not Executed |
| **B05-06** | 比对原获配份额、依法成立的持有人名册与链上 Token 供应/持有及合法映射规则，生成差异与处理任务。 | 法定股份名册记录 99 股、链上 Mint 100 时投资者门户仍显示法律权益全部完成。 | M07-F006 | Not Executed |
| **B05-07** | 为 V1 Token 启用法域及合法权利要求的最小接收资格/白名单、转移冻结、锁定期和受控暂停规则。 | V1 没有交易市场就允许通过钱包对任意未适格地址随意转移受限 RWA Token。 | M07-F007 | Not Executed |
| **B05-08** | 管理部署/Mint/Burn/暂停/授权升级等高风险命令的申请-批准-实际签名分离、最小权限、紧急停用和审计追踪。 | 单个客服账号自行 Mint 或撤销所有限制，密钥撤销后旧权限仍可签名。 | M07-F008 | Not Executed |
| **B05-09** | 仅在债务到期合法清偿或股权依法回购/注销、更正等工具条件触发时，发起受权 Token Burn/冻结/数量调整流程。 | Token Burn 已成功但本金未实付，却被当成债务完全清偿；或股权被当普通订单退款随时 Burn。 | M07-F009 | Not Executed |
| **B05-10** | 后置的多网络统一发行、自动跨链供应、复杂合约升级与迁移策略，不作为单一受权网络/合约的首期前置。 | 未提供复杂多链部署时不应影响在唯一批准网络上合法执行或必要暂停。 | M07-F010 | Not Executed |
| **B05-11** | 以受权 Provider Adapter 向 M09 提供 KYC/KYB/AML 请求、主体绑定、补件、回调/查询证据与核验版本。 | Provider 回调丢失/重放、过期结果复用或同一投资者跨租户证件泄露。 | M22-F001 | Not Executed |
| **B05-12** | 接入批准的稳定币/网络链上转账观察或合法支付服务，回传 M11 所需真实事件及对账来源。 | 只有回调 success 但实际为假 USDC 或错误链，系统却误判到账。 | M22-F002 | Not Executed |
| **B05-13** | 对接受权 RPC/节点/钱包观察服务，获取 Token 合约事件、链区块/最终性、重组检测与交易查询。 | RPC 节点返回过期确认，或 reorg 后重复 Mint 仍被计入完成。 | M22-F003 | Not Executed |
| **B05-14** | 通过经法域认可的法定登记主体/系统提交/查询债权人或 SPV 股东/成员名册变化、回执、有效时点和更正记录。 | Token Mint 成功却自动将登记标成已取得股权，或回调 Unknown 时重复公司授股。 | M22-F004 | Not Executed |
| **B05-15** | 将适用认购合同、风险文件及必要电子签外部请求/回执与 M06/M10 有效文书版本绑定。 | 投资者仅打开签署链接即自动配售，或协议更新覆盖旧签署版。 | M22-F005 | Not Executed |
| **B05-16** | 对所有第三方回调/Webhook 校验来源签名/授权、事件唯一标识、乱序/重复、可重试查询与安全审计。 | 攻击者伪造 Webhook 将付款标成功，或不同付款合并为一笔。 | M22-F006 | Not Executed |
| **B05-17** | 监控身份/支付/签署/登记/链等集成的可用性、延迟和故障；给 Issuer/平台受权人员生成升级与恢复工作项。 | 登记服务宕机后系统自动判全部登记拒绝并重新发法律发行命令。 | M22-F007 | Not Executed |
| **B05-18** | 为外部服务 API Key/Webhook Secret/签名授权和模拟/沙盒/生产环境建立隔离、权限撤销、最小可用范围与变更审计。 | 测试环境调用真实 Mint/退款接口、生产私钥被打印在日志或租户间共用。 | M22-F008 | Not Executed |
| **B05-19** | 后置的多服务商报价/择优自动切换、供应商 Marketplace 和智能路由；V1 仅需所选合格服务的可靠集成及故障处理。 | 签署/登记中服务商不明导致系统盲切第三方重新执行不可逆命令。 | M22-F009 | Not Executed |

## 八、建议产品负责人审核的八项决策（**SCOPE-186～193 全部 Draft、未批准**）

| 编号 | 本批推荐方案 |
|---|---|
| **SCOPE-186** | Batch 05 严格以 **M07/M22 共 19 项原 ID**开展产品最低交付深度审核（**P0 16 / P1 1 / P2 2**）；五类交付分类与原 187 项分级不变，不新增业务 ID。 |
| **SCOPE-187** | M07 保留独立 TokenContractPlan/Version、批准链/标准/单位↔Token 映射、环境区分和真实链上事件；**实际合约部署/Mint/签名由受权主体执行**，Issuer/平台前后台仅有其合法职责范围内的申请、批准及核验。 |
| **SCOPE-188** | **M12 Allocation/法定登记、M11 实付、M07 Mint/Finality** 独立留证，Mint/登记时序依法定 Instrument 确认；执行 Unknown 查询原意图/Tx/nonce，合法交割前不显示所有权益交付完成，禁止重复 Mint/伪造登记。 |
| **SCOPE-189** | 投资者账户与**付款来源地址、Token 接收钱包、法定持有人身份**分开管理；接收钱包按合法条件验证控制权、资格、禁转与锁定。**V1 强制合约级必要转让限制**，但不实现 M14 的二级转让/撮合市场。 |
| **SCOPE-190** | 对部署、Mint/Burn、密钥、暂停及敏感授权实行**职责分离、审批、最小权限、审计、可撤销和测试/生产严格隔离**；SaaS 运营不默认掌管生产资产私钥、受监管支付或法律登记权威。 |
| **SCOPE-191** | M22 的**KYC/KYB/AML、USDT/USDC 付款观察、链上事件、权威登记、电子签、Webhook 验签/幂等、健康监测及凭证环境隔离**必须能够支持首发合法外部执行者；Provider 成功响应不自动是法律/资金/链最终事实。 |
| **SCOPE-192** | **M07-F009 Token Burn/赎回/受权调整保持原 P1 条件性**：债权依法到期清偿、股权合法回购/注销等实际工具要求时具备最低受权流程。**M07-F010 多链/复杂升级、M22-F009 多服务商智能切换维持原 P2 后置**；必要安全 Guard 不后置。 |
| **SCOPE-193** | 本批 19 项最低深度与 B05-01～19 均仅为**产品审核草案**；如获批准也不等于实际法域许可、合同/合约已审、金融资产/私钥/资金授权、研发实现、测试 PASS、V1 实施范围全冻结或 PR #6 可合并；之后继续 Batch 06 长篇详细文字+SCOPE 审核。 |

## 九、下阶段与边界保护

- 本批 **SCOPE-186～193 仍为待审批**，不能自动沿用上一批“全部同意”。
- 下一批 Batch 06：M13 存续权益和 A 票息/本金、B 合法可选分红/公司行动，M17/M18 异常/通知，M20/M21 审计/报表（原 **37 项功能**）仍须同样的逐 ID 文字需求与 SCOPE 正式审核。
- 六批最低交付原则全部审核完成后，正式开展**全平台四泳道详细业务流程图 → 187 项交叉核验 → 按端详细功能清单 → 字段级真正详细 PRD → 产品一致性冻结 → 统一 UI**，不直接跳到 UI。
- 保留第 02～04 份 Frozen 和原 187 项功能优先级。真实首发 Instrument/法域、合约/链、法定登记/资金/签名主体、依法批准募集模式、条件性 P1、真实工程测试与上线须独立履行 G-01～G-06。

**当前：Batch 05 Draft / SCOPE-186～193 未批准；B05-01～19 Not Executed；A/B 187 个原功能全部 Not Tested；PR #6 Draft/Open/Unmerged。**
