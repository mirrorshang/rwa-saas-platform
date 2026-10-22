# RWA SaaS｜Issuer V1 交付深度 Batch 04：投资者、准入、认购、USDT/USDC 资金及法定配售登记 v0.1

> **Detailed Functional Scope / Draft — M08～M12 共 50 项最小交付深度和 SCOPE-176～SCOPE-185 均尚待产品负责人确认。** 仅为产品需求、角色/界面组及验收设计；不是实际链上付款、法定登记许可、开发完成、UI 正式启动或 Issuer V1 全局冻结。日期：2026-10-22。
>
> 正式依据：[Batch 03 已批准原则](../../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md)、[Batch 02 已批准原则](../../decisions/SCOPE-160-167-batch02-asset-instrument-documents-review.md)、[原 187 项功能范围](RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)、[原 187 项 A/B Not Tested 底表](RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md)、[条件性 P1 决策](../../decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md)、[第 04 份 Frozen 流程/状态机](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[ARCH-001](../../decisions/ARCH-001-api-first-unified-business-core.md)。
>
> **本批 50 项原 ID、原等级保持不变**：M08 10 / M09 9 / M10 10 / M11 11 / M12 10，合计 **P0 41、P1 5、P2 4**。其中 5 个 P1 是 M08-F009、M10-F009、M11-F010、M12-F009、M12-F010；需逐项区分“必要法律/财务底线”与“可后置增强”。本批不新增正式模块或功能 ID。

## 一、产品主线和权威事实

**Issuer 获取投资者 → 投资者进入发行机构门户 → 完成身份/Offering-specific 资格 → 查看法律权利与文件 → 确认报价/签署 → 订单/额度预留 → 真实 USDT/USDC 付款与独立对账 → 受权配售 → 权威法律登记 → 真实链上 Token 交付核对 → 后续查询与存续。**

这里不是一笔“原子交易成功”的单独状态，必须保留以下事实源：

| 权威事实 | 主责模块/外部主体 | 不得作为替代的事件 |
|---|---|---|
| 机构、投资者与钱包/法定受益人身份 | M08/M09、适格 KYC/KYB 方 | 登录成功≠KYC 合规通过；KYC 通过≠Offering Eligible |
| 投资者法律签署/报价与订单 | M06/M10、签署受权方 | Quote 点击确认≠资金到账或法定权益生效 |
| 发行总容量/预留和配售 | M12（唯一发行量权威） | M10 下单成功≠容量可用或配售完成 |
| 链上支付、回执、最终性和实际退款 | M11/M22、合法资金/链权威 | 钱包 txHash≠到账确认；已批准退款≠退款已出款 |
| 法定债权/股东登记与生效 | M12/M22、依法确定的受权登记机关或责任主体 | Allocation 完成或 Token Mint≠合法持有人登记完成 |
| Token 实际 Mint/受限转让/Finality | M07/M22、受权链上签名主体 | Token 已到账≠法定权益生效或正确付息分红 |
| 本息/分红/权益存续 | M13、适格实际出款方与法定权利文件 | 收益核算完成≠已实际支付，Token Burn≠合法债务消灭 |

**不可约的产品安全要求**：任何服务商 Unknown/异步回调、系统超时和并发处理都必须保留原请求 ID、版本、外部回执引用、幂等与受权修复；不盲目重付、重复授股、重复 Mint 或以内部手工“标绿”代替法律、资金、链权威。

## 二、业务角色与对应页面/功能组（非正式 UI IA 决议）

| 产品视角 | 核心逻辑界面组 | 需要展示、执行的产品动作 |
|---|---|---|
| **发行机构投资者门户** | 登录/账户、Offering 列表与详情、KYC/资格、报价和协议、支付指引、订单/退款、受权持仓/Token/合法权益 | 投资者只能访问本 Issuer 获授权的发行和自身资料；不可看到平台全市场、别的 Issuer 投资者或未发布 Offering |
| **发行机构 Issuer 工作台** | 投资者名单及资格、认购订单/额度、支付对账差异、配售和登记/Token 交付监控 | 发行机构授权业务/财务/合规人员按职责处理；分权审核；真实资金/法律登记者不是 SaaS 运营默认角色 |
| **SaaS 平台运营支持** | 跨模块任务/受限查看、不可逆指令的审批线索、投诉/差异升级 | 仅最小必要访问和受权支持，不能读写另一机构原始敏感资料、执行法定配售或确认外部资金 |
| **适格外部执行者** | KYC/KYB、签名/资金、登记、链签名等外部 API/事件结果 | 外部方仍保留法定/资金/链执行权威，SaaS 对回执、最终性、Unknown 和审批做受控核验 |

**不以 50 个功能对应 50 个独立页面**；允许共享账户、发行详情、订单列表/详情、审核台和差异工单等页面组。本轮界面为逻辑需求，整个 PRD 结束后才做正式 IA/视觉设计。

## 三、从投资者到合法权益的最小分步流程

| 步骤 | 合法触发条件 | 成功业务结果 | 异常及下一步 |
|---|---|---|---|
| A 门户访问 | 已发布且对其可见的 Offering，账户/角色合法 | 查阅适用风险和有效条款版本 | 未授权、已停售、定向未授权：不暴露敏感详情、不接受认购 |
| B KYC 与发行资格 | 同意及依法受权的身份服务，Offering 实时法域/类别限制 | 有效 KYC 证据 + 本次 Offering 的 Eligibility 决策 | AML/制裁触发强制拒绝或合法人工审查，过期补件 |
| C Quote 和签署 | Instrument/Offering/文书版本有效，额度合法，账户有权 | QuoteSnapshot 与受权 Subscription/order，必要协议完成 | 价格失效/版本变更或签署 Unknown 阻断受限制金融步骤 |
| D 容量预留与支付指示 | M12 唯一容量原子预留 + M11 合法收款方/链/币种 | reservation_id + payment_intent（**并非实际到款**） | 预留过期、有 tx Pending/Unknown 时不盲目释放 |
| E 真实稳定币到账及对账 | 批准的 USDT/USDC token contract/chain、外部 Finality、精确付款匹配 | 真实已匹配账款及受控配售候选 | 少/多付、错误链、重复回调、迟到账与误转必须保留处理 |
| F 受权配售 | KYC/Eligibility/付款/发行额度/公司机关或债权条款的法律 Gate 均通过 | 唯一 Allocation/已获配合法份额申请 | 仍可能法定登记未完成；错误超配要受控冻结与纠正 |
| G 权威登记与 Token 交付 | 受权登记方回执、受权链签名与合约限制、合法版本映射 | 各独立确认事实可对账，适当状态展示权利及 Token | 任何一方 Unknown/失败显示差异/限制，并受权恢复 |
| H 售后和存续 | 法定存续义务/合同与受权资金或支付方 | 订单、资金、权利、Token、本息或可选分红查询 | 投诉/退款/到期/退出不能因 SaaS Tenant 暂停而被删除 |

## 四、50 个正式功能 ID 的建议最低交付深度（**全部 Draft**）

| ID 与原功能名 | 原等级／五类交付定位 | 具体业务操作／最少字段与结果 | 资格、权威、异常或法律边界 | 验收设计 |
|---|---|---|---|---|
| M08-F001 注册登录及账户 | P0／共享界面/简化实现 | 投资者在机构受控门户注册登录，维护本人/机构账户与归属的法定持有人身份映射；必要信息：tenant/portal scope、account_id、investor_id、email/phone 或授权凭据、身份类型、登录状态 | 跨机构不可默认共享账户 KYC 明文；账户恢复不授予法律权益 | B04-01 |
| M08-F002 可访问 Offering 列表 | P0／共享界面/简化实现 | 只展示对当前投资者可访问的 Offering 清单，可按销售状态与资格过滤；必要信息：issuer_ref、offering_id、公开/定向范围、发行状态、eligibility_hint、披露版次 | 未发布、停售或定向未授权 Offering 不因直接 URL 被认购 | B04-02 |
| M08-F003 Offering 详情和风险条款 | P0／共享界面/简化实现 | Offering 详情展示 Instrument 经济/法律权利、价格、期限/股权类别、风险及有效文件；必要信息：terms_version、rights_version、sales_window、fee、currency/network、风险文书引用 | 不能把样本 A 债权固定回报叙述套给 B SPV 股份 | B04-03 |
| M08-F004 KYC/资格补充引导 | P0／共享界面/简化实现 | 引导投资者按当前缺口完成 KYC、法域资格及适用补件，而非重复填写全部信息；必要信息：kyc_state、eligibility_state、missing_requirements、review_ref | 禁止用 KYC 通过替代 Offering Eligibility 通过 | B04-04 |
| M08-F005 立即购买与订单确认 | P0／共享业务核心需实现 | 立即认购时显示投资数量/金额、报价版本/费用/协议摘要，受权提交订单；必要信息：quote_ref、units、gross/payable、investor_consent、order_id | 点击成功不等于真实付款、配售或权益登记完成 | B04-05 |
| M08-F006 USDT/USDC 钱包支付指引 | P0／共享业务核心需实现 | 展示批准的 USDT/USDC 网络、Token 合约、收款指令、支付期限与观察状态；必要信息：chain_id、token_contract、recipient_ref、amount、payment_intent、expiry | 链/收款地址不得仅凭客服编辑；发起钱包请求不代表到账 | B04-06 |
| M08-F007 订单状态异常及退款查询 | P0／共享业务核心需实现 | 展示订单、支付、少付/多付、退款申请/实际出款/Unknown 的分别状态；必要信息：order_id、payment_id、refund_intent、reconciliation_status、support_ref | 退款已批准不等于已出款；超时不能简单标成款项未收到 | B04-07 |
| M08-F008 持仓及登记/Token 状态 | P0／共享业务核心需实现 | 持仓详情区分受权配售、法定登记结果、Token Mint/交付与锁定及收益状态；必要信息：allocation_ref、legal_register_ref、token_tx、recorded_units、holder_status | Token 已 Mint 但名册 Unknown 不得显示已取得法定股东权益 | B04-08 |
| M08-F009 收益文件及基础通知 | P1／条件性必需（需参考工具裁决） | 依工具或法域条件显示票息、分红、权利文件/正式通知/收益记录与必要查询；必要信息：entitlement_snapshot、distribution_event、notice_ref、document_scope | P1 条件性，首发 A 要展示必要票息/到期信息，B 分红只有合法批准后显示 | B04-09 |
| M08-F010 高级推荐与个性化营销 | P2／暂不计入 Issuer V1 首期 | P2 高级推荐、交叉营销、行为画像和个人化资产推送后置；必要信息：高级 recommendation、营销细分和推荐模型 | 不能因此偷做自营全球 RWA marketplace/展示非授权 Offering | B04-10 |
| M09-F001 自然人机构投资者档案 | P0／共享业务核心需实现 | 自然人/机构投资者分型档案与权利人信息，明确代理关系（如适用）；必要信息：investor_type、legal_name、jurisdiction、beneficial_owner_ref、wallet_holder_ref | 个人/机构的法定注册身份不自动等于钱包唯一地址 | B04-11 |
| M09-F002 KYC/KYB 服务接入 | P0／共享业务核心需实现 | 受权发起 KYC/KYB、接收服务商状态、证据与补件请求；必要信息：provider_case_id、authorized_consent、verification_state、evidence_ref | 请求已提交与服务商 Verified 分离，外部结果 Unknown 待查询原请求 | B04-12 |
| M09-F003 必要 AML/制裁风险结果 | P0／共享业务核心需实现 | 适用 AML/制裁/高风险分类复核，保持法规来源与人工责任；必要信息：screening_ref、risk_status、jurisdiction_rule_version、reviewer | 法定高风险或禁止对象必须强制拦截，不能被租户覆盖 | B04-13 |
| M09-F004 合法授权范围内 KYC 复用 | P0／共享业务核心需实现 | 同一机构或依法授权数据域内复用有效 KYC 结果/证明版本；必要信息：consent_scope、subject_ref、verified_at、expires_at、legal_basis | 不得默认跨租户复制证件资料或把旧核验结果用于无关法域 | B04-14 |
| M09-F005 Offering 级资格自动判断 | P0／共享业务核心需实现 | 对每一 Offering 按投资者身份/法域/类别/限额和规则版本评估资格；必要信息：eligibility_rule_version、decision、reason、quota、effective_at | KYC Verified ≠ Offering Eligible；提交订单/配售前重新校验 | B04-15 |
| M09-F006 补件过期与复核 | P0／共享业务核心需实现 | 按适用规则处理补件、核验过期、信息变更及重新审查；必要信息：missing_docs、expiry_at、resubmission_ref、review_reason | 只补缺口但在资格失效后阻断新不可逆步骤，保留旧审查历史 | B04-16 |
| M09-F007 人工例外及禁止越权放行 | P0／共享业务核心需实现 | 受权处理人工异常与例外，保留申请、意见、审批、禁止覆盖平台强制限制；必要信息：manual_review_id、reviewer_role、decision_reason、guard_status | 例外只在法律允许且有资质批准时可用，禁止手动改成合格绕制裁 | B04-17 |
| M09-F008 资格版本决策及审计 | P0／共享业务核心需实现 | 保存每次资格决策与规则、事实数据、时间、审核主体及审计引用；必要信息：decision_version、rule_ref、inputs_hash、approved_at、expires_at | 允许后来资格失效但不能改写旧时点真实决策，重试要幂等 | B04-18 |
| M09-F009 跨机构共享 KYC 数据网络 | P2／暂不计入 Issuer V1 首期 | P2 跨发行机构共享 KYC 数据网络、全球可携带身份池后置；必要信息：跨租户资料共享授权、跨法域用户身份网络 | 无可验证法律依据不允许共享原始证件及 AML 敏感数据 | B04-19 |
| M10-F001 认购请求和唯一订单 | P0／共享业务核心需实现 | 生成唯一认购订单并引用投资者、Offering、报价与合法规则版本；必要信息：subscription_id、investor_ref、offering_ref、created_at、idempotency_key | 订单创建不等于付款到账，也不等于法定权益生效 | B04-20 |
| M10-F002 报价数量费用条款快照 | P0／共享业务核心需实现 | 持久化价格、单位数量、名义本金/股数、费用、应付币种及协议快照；必要信息：quote_snapshot、instrument_version、units、unit_price、accrued_interest（适用）、fees、payable | A 应计/后入价需有版本批准，B 股份单位/稀释不等同固定 Token 百分比 | B04-21 |
| M10-F003 资格和购买限制校验 | P0／共享业务核心需实现 | 订单创建与关键操作时再次确认 KYC/Eligibility、持有上限、份额/地区限制；必要信息：investor_eligibility_ref、limit_rule_ref、wallet_policy、restriction_ref | 前端符合资格标签不替代服务端执行的即时资格 Guard | B04-22 |
| M10-F004 额度预留申请 | P0／共享业务核心需实现 | 向 M12 申请原子容量预留并回执唯一 reservation_id；必要信息：reservation_intent、offering_cap、reserved_units、reservation_id | M10 不维护第二份权威剩余额度，两个订单并发不能超卖 | B04-23 |
| M10-F005 预留期限和链上待核保护 | P0／共享业务核心需实现 | 付款观察窗口、预留到期/冻结、链上 Pending/Unknown 与迟到账策略分开；必要信息：reserved_until、payment_watch_until、chain_pending_ref、release_guard | 过期不能立即释放已有链上广播/外部已到账 Unknown 的额度 | B04-24 |
| M10-F006 必要签署和确认 | P0／共享业务核心需实现 | 根据 M06 有效版本要求完成合同勾选或电子签及确认记录；必要信息：agreement_version、consent_at、signature_provider_ref、signature_result | 发送签署链接不等于已签；必要签署未确认不可进入禁止的交易步骤 | B04-25 |
| M10-F007 认购处理及订单汇总 | P0／共享业务核心需实现 | 发行机构运营及投资者各自查看受权订单列表、处理阶段与下一步操作；必要信息：order_summary、payment_status、allocation_status、legal_register_status、token_status | 聚合 UI 可以，但每个事实状态来自其自己权威，不显示虚假 Complete | B04-26 |
| M10-F008 取消到期及异常处理 | P0／共享业务核心需实现 | 取消、自动过期、拒绝与补救；区分未付、已付款、已配售订单；必要信息：cancel_reason、expiry_event、payment_facts、refund_request_ref、audit | 已付款取消不等于资金自动退回；法定已授股不能按订单退单撤销 | B04-27 |
| M10-F009 部分认购和订单调整 | P1／条件性必需（需参考工具裁决） | 原 P1 条件：合法允许部分认购/部分接受及订单调整；必要信息：partial_acceptance_ref、accepted_units、remaining_amount、new_quote_approval | 最小份额/金额、原订单/新价确认和余款受权退回，非法工具不开放 | B04-28 |
| M10-F010 批量认购复杂超额机制 | P2／暂不计入 Issuer V1 首期 | P2 复杂超额认购、批量申购、竞标排序等延后；必要信息：lottery/auction/oversubscription_policy | 基础唯一订单/额度/合规顺序必须完整，复杂资金募集按法域另审 | B04-29 |
| M11-F001 可用稳定币链合约配置 | P0／共享业务核心需实现 | 白名单化稳定币和链、发行网络及合约地址的批准配置；必要信息：chain_id、token_contract、decimals、issuer_payment_policy、version | USDT 与 USDC 不等于跨链可交换，假币/错合约不得被接受 | B04-30 |
| M11-F002 收款安排及支付指令 | P0／共享业务核心需实现 | 基于 Offering 的受权收款方生成支付指令，关联订单/资金源身份；必要信息：recipient_address/ref、payer_rule、approved_authority、payment_intent | SaaS 不默认托管资金或控制收款私钥，指令不是实付 | B04-31 |
| M11-F003 付款期限和订单关联 | P0／共享业务核心需实现 | 生成金额/链/币种/有效期与唯一订单支付关系，支持查询；必要信息：payment_intent、payable_amount、deadline、quote_ref、payer_wallet_ref | 付款期限和确认窗口分开，不因 UI 超时就断言未到账 | B04-32 |
| M11-F004 链上到账识别 | P0／受权外部执行 + SaaS 核验 | 读取链上节点/提供商真实转账事实，按 tx/event 精确归档；必要信息：tx_hash、log_index、chain_id、token_contract、from/to、raw_amount | 广播或截图≠链上到账；跨链/假 token/重复回调不算多次实付 | B04-33 |
| M11-F005 确认数最终性及 Unknown | P0／受权外部执行 + SaaS 核验 | 核验确认数、链最终性、链重组/Unknown 的外部证据与更新；必要信息：block_ref、finality_status、confirmations、provider_ref、last_observed_at | Pending/Unknown 不得算 MatchedConfirmed；失败/重组需重新查询真实权威 | B04-34 |
| M11-F006 付款认购匹配和对账 | P0／共享业务核心需实现 | 将实际符合标准的到账与唯一订单付款义务精确匹配并对账；必要信息：payment_obligation、receipt_refs、matched_amount、network、token、refund_credit | 允许在规则内多笔付款汇总，但订单应付和链上实际到账不可用浮点数估算 | B04-35 |
| M11-F007 少付多付错误链及迟到账 | P0／共享业务核心需实现 | 少付、多付、错链、错合约、迟到账及无法识别付款进入人工处置；必要信息：difference_case、expected_vs_actual、payment_orphan_ref、decision | 保留真实资金和法律资金归属，未获授权不得自动退给任意地址 | B04-36 |
| M11-F008 回调去重与多笔真实付款 | P0／共享业务核心需实现 | 回调去重、多个真实 Tx 的归集与对账修复；必要信息：provider_event_id、tx_unique_key、allocation_of_receipts、audit | 重复 webhook 不重复配售，两个不同 Tx 不能被 dedupe 掉 | B04-37 |
| M11-F009 退款申请批准出款核对 | P0／受权外部执行 + SaaS 核验 | 退款必须申请/审核、受权外部出款与链上实付核对；必要信息：refund_intent、approval_ref、destination_authority、outbound_tx、finality | 审批通过不等于退款已付，Unknown 查询原出款不能盲重付 | B04-38 |
| M11-F010 人工差异调查与审批 | P1／条件性必需（需参考工具裁决） | P1 条件：高级财务调查 UI 可简化为最小可审计工单/审批；必要信息：payment_dispute_ref、reviewer、original_evidence、resolution_ref | 资金差异和异常升级的风险底线无条件保留；不需要首期全量财务客服中心 | B04-39 |
| M11-F011 法币与多通道支付 | P2／暂不计入 Issuer V1 首期 | P2 法币支付/银行卡/其它多通道收款与自动 FX 后置；必要信息：fiat_rail/chargeback/PSP/FX_policy | Issuer V1 实付设计使用批准 USDT/USDC，不能假定银行/法币合规流程已有 | B04-40 |
| M12-F001 发行额度权威核算 | P0／共享业务核心需实现 | 记录法律可发行上限、已发行、预留、冻结与可配容量，跨 Offering 唯一权威；必要信息：instrument_series_or_class、authorized_units、free、reserved、frozen、allocated | A Series 与 B 股份类别合法容量不同，Token 供应 cap 不是唯一法律权威 | B04-41 |
| M12-F002 预留转配售额度转换 | P0／共享业务核心需实现 | 容量预留→有效配售的原子状态转换与释放/冻结；必要信息：reservation_id、units、atomic_version、expiry_guard、allocation_ref | 不得在未知付款状态提前释放或并发双用同一额度 | B04-42 |
| M12-F003 事前批准自动配售规则 | P0／共享业务核心需实现 | 仅在发行条款、资金、资格和受权审批规则满足时执行合法自动配售；必要信息：approved_allocation_rule、guard_evaluation_ref、actor_or_service_authority | 事前授权自动化不是无限自动 Mint/公司授股，不绕过实际法定登记 | B04-43 |
| M12-F004 资格及付款最终校验 | P0／共享业务核心需实现 | 配售前重新核验付款对账最终性、资格、生效条款及最小份额；必要信息：eligibility_decision、payment_reconciliation、instrument_version、max_units | 付款到账不等于合法可分配，发布条件/法域禁止时应留款项处置 | B04-44 |
| M12-F005 配售决定数量及幂等 | P0／共享业务核心需实现 | 受权配售决定与数量、金额和唯一 allocation_id，幂等回放可查询；必要信息：allocation_id、issued_units、source_reservation、approval_evidence、intent_key | 服务商重试不能多授法律份额，A 名义本金/B 股本量与 Token 数不同权威 | B04-45 |
| M12-F006 权威持有人登记结果引用 | P0／受权外部执行 + SaaS 核验 | 请求/读取法定持有人名册的真实登记回执及法律有效时点；必要信息：legal_holder_ref、register_provider、rights_version、registered_units、effective_at | A 债权人与 B 法定股东的权威不同；钱包余额不能代替法律登记 | B04-46 |
| M12-F007 登记与 Token 交付对账 | P0／共享业务核心需实现 | 对比依法生效份额、已获配数量和链上 Token 交付事实；必要信息：allocated_units、registered_units、token_units、mapping_ratio、discrepancy_case | 记录链与名册不同步的原因与受权限制，不能以 Token 送达视为全部完成 | B04-47 |
| M12-F008 差异纠正及重试审计 | P0／共享业务核心需实现 | 登记/交付失败、未知、重复指令与受权补偿恢复；必要信息：original_register_intent、callback_ref、correction_approval、retry_key、audit | 查询原指令，禁止重复登记/增发或用手工结果覆盖权威账 | B04-48 |
| M12-F009 部分配售及剩余款处理 | P1／条件性必需（需参考工具裁决） | P1 条件：合法部分配售和未获配款项/容量的后续处置；必要信息：accepted_units、rejected_units、refund_due、unreleased_capacity | 若公司授权/债权条款允许部分配售，则保留最小资金退款与权益事实，不必全量 UI | B04-49 |
| M12-F010 集中募集统一配售机制 | P1／条件性必需（需参考工具裁决） | P1 条件：集中募集结束后统一法定配售、失败返款与批次结算；必要信息：batch_id、funding_deadline、minimum_target、legal_approval、batch_allocation | 法域/公司融资条款强制时纳入；不把持续一级认购作为万能默认 | B04-50 |

## 五、最低数据/状态映射与外部回执契约（业务级，不预设技术 URL）

| 领域对象 | 必要标识／引用 | 最少应区分的状态/证据 | 写权威与复核点 |
|---|---|---|---|
| InvestorProfile | investor_id、tenant_id、legal_holder_ref、wallet_bind_ref | 草稿/身份结果/审核过期与法律持有人信息 | M09 只管理投资者核验/资格事实，法律持有人由真实法定机构确认 |
| VerificationCase | provider_case_id、evidence_version、legal_basis/consent | Submitted、InReview、Verified、Rejected、Expired、Unknown（候选视图映射） | 第三方 KYC 结果、AML/法域强制 Guard，未知不当作通过 |
| EligibilityDecision | investor/offering、rule_version、reviewer、effective/expires | Eligible、Ineligible、PendingReview、Expired（逻辑判断） | M09/M19 每次交易关键阶段复核，不跨 Offering 自动通过 |
| QuoteSnapshot | quote_id、offering/instrument/document/rule version、units、price、fees、currency、expiry | Draft、Presented、Accepted、Expired、Superseded（产品交互视图） | M10 写受权订单报价快照，旧法律文书/报价不可覆盖 |
| Subscription/Reservation | order_id、idempotency_key、reservation_id、reserved_units、expires_at | Created、AwaitingSignature、AwaitingPayment、PendingExternal、AcceptedForAllocation、Rejected/Cancelled（与 Frozen 状态映射须后续核对） | M10 订单与 M12 唯一额度分属不同权威，付款 Pending 不盲释放 |
| PaymentIntent/Receipt | payment_intent、approved chain/token contract/recipient、tx_hash/log_index、raw_amount | InstructionIssued、Observed、PendingFinality、Unknown、Finalized、Matched、Exception（逻辑视图） | M11 真实链回执和法定收款责任方；tx 广播/回调≠最终性 |
| RefundIntent | refund_id、original_receipt_refs、authorized_ref、outbound_tx | Requested、Approved、Executing、Unknown、Paid、Failed | 退款独立资金事实，查询原指令不二次付款 |
| Allocation/LegalRegister | reservation、allocation_id、register_intent、legal_holder、effective_at、units | Reserved、Allocated、RegistrationPending/Unknown、Registered/Rejected/CorrectionRequired | M12 额度/配售和外部法律登记独立，合法发行/公司机关授权不能由 SaaS 代行 |
| TokenDeliveryReference | token_tx、contract_ref、expected_mapped_units、finality | Submitted、PendingFinality、Confirmed、Unknown、Mismatch | M07/M22 外部链事实，M12 只对照不重写 Token 层 |

这些是页面交互/逻辑状态建议，**不修改 Frozen 第 04 份状态机中的权威枚举**。字段是产品需求候选，不是已批准的接口路径、数据库 Schema 或实际法律账户方案。

### 产品必须可识别的异常类别

- **身份和准入**：资料缺失、KYC 过期、Offering 资格失效、名单命中、外部结果 Unknown、跨租户资料复用被禁止。
- **合同/订单**：报价过期、应计/股权份额精度差异、重复点击、签署回调迟到、法定权利版本变化。
- **真实资金**：假合约/错误链、少付/多付、重复或多个真实 Tx、迟到款、链重组、Refund Unknown。
- **配售与权利**：容量并发超售、公司股份授权不足、法定持有人不匹配、权威登记延迟/拒绝、Token 余额/注册份额差异。
- **跨端/生命周期**：Issuer 关闭 Offering 或 Tenant 暂停时仍存在真实款项、已配售股份、未登记 Token、未结退款及后续合法收益。

## 六、A/B 权利差异如何影响本批交易（不得误用）

| 主题 | A 固定收益债权样本 | B SPV 股份/实体权益样本 | 共同产品约束 |
|---|---|---|---|
| 认购单位和价格 | 名义债务本金、债权单位、后入 clean/dirty/应计、付息记录日 | 合法股份/成员权益单位、批准发行价、实际稀释、必要优先认购及最低单位 | QuoteSnapshot 显式表示法律单位/币种与实际 Token 单位映射 |
| 法律持有人 | 债权人/债权受让资格、名册适用规则 | 法定股东/成员权益、实益持有人不同层级（如适用） | 钱包余额不能推断法定登记 |
| 资金权利 | 付款不等于已持有可获息债权 | 付款不等于公司已合法配售/登记股份 | M11 的收款事实与 M12 的权利生效独立 |
| 销售方式 | A1 合法 Series 后发与同权、晚入价格 | B1 获批可发行股本、B2 必要集中募集 | 法域/合同需要统一配售则条件性 P1 必须触发 |
| 发行后 | 固定票息/到期本金、有效权益记录日 | 无固定保本/票息，仅依法批准的分红/回购 | M13 的实际收益支付/登记/Burn 单独受权 |

## 七、50 个业务验收设计场景（**全部 Not Executed**）

每个 B04 卡与一个旧功能 ID 一一对应；断言聚焦**正常业务责任及一个高风险边界**。没有真实软件执行、金融支付/签名或链上测试，不得更改为 PASS。

| 场景编号 | 主要场景／待验证断言 | 关联旧 ID | 状态 |
|---|---|---|---|
| **B04-01** | 同钱包在两个租户门户登录时数据隔离且不泄露 | M08-F001 | Not Executed |
| **B04-02** | 未授权用户输入隐藏 Offering URL 时拒绝敏感信息 | M08-F002 | Not Executed |
| **B04-03** | SPV 持币被误写成直接拥有房产时展示必须纠正 | M08-F003 | Not Executed |
| **B04-04** | 身份已通过但本轮专业投资者资格不足时阻断购买 | M08-F004 | Not Executed |
| **B04-05** | 重复点击购买只创建一笔受权订单 | M08-F005 | Not Executed |
| **B04-06** | 投资者选错网络应提示/拒绝并保留真实误转调查 | M08-F006 | Not Executed |
| **B04-07** | 外部退款 Unknown 时页面显示调查中，不重复退款 | M08-F007 | Not Executed |
| **B04-08** | 链上代币已到账但合法登记失败时标示差异 | M08-F008 | Not Executed |
| **B04-09** | 未获分配决议的 B 股权不能显示固定应付股息 | M08-F009 | Not Executed |
| **B04-10** | 未上线推荐引擎也能完成全部必要认购步骤 | M08-F010 | Not Executed |
| **B04-11** | 公司钱包认购却缺法定实体身份时阻断配售 | M09-F001 | Not Executed |
| **B04-12** | 身份服务回调重复或结果 Unknown 时不生成虚假通过 | M09-F002 | Not Executed |
| **B04-13** | 名单匹配需复核时不能直接继续认购 | M09-F003 | Not Executed |
| **B04-14** | Investor 在另一 Tenant 请求复用未经授权 KYC 时拒绝 | M09-F004 | Not Executed |
| **B04-15** | 同一投资者对 A 债权合格不代表对 B 股权合格 | M09-F005 | Not Executed |
| **B04-16** | 投资者资格在 Quote 已确认后过期，付款前再次拦截 | M09-F006 | Not Executed |
| **B04-17** | 运营试图跳过法定投资限制，应被底层规则拒绝 | M09-F007 | Not Executed |
| **B04-18** | 投资者撤销资格时旧订单历史仍可追溯 | M09-F008 | Not Executed |
| **B04-19** | 第二家发行机构看不到第一家用户 KYC 原件 | M09-F009 | Not Executed |
| **B04-20** | 重复 submit/retry 不产生两笔独立不可撤销订单 | M10-F001 | Not Executed |
| **B04-21** | Offering 更新价格后旧订单实际 Quote 不被无声改写 | M10-F002 | Not Executed |
| **B04-22** | 投资者身份被禁止后复用旧报价购买被拒绝 | M10-F003 | Not Executed |
| **B04-23** | 最后一个份额在两个浏览器购买，最多一个拿到真实预留 | M10-F004 | Not Executed |
| **B04-24** | 订单过期同时链上有待确认 Tx，额度不得抢先回收 | M10-F005 | Not Executed |
| **B04-25** | 签署回调 Unknown 时不能直接标合同生效 | M10-F006 | Not Executed |
| **B04-26** | 订单有匹配到账但无登记回执时显示处理中 | M10-F007 | Not Executed |
| **B04-27** | 已配股份被直接 Cancel Order 时阻断或走合法处置 | M10-F008 | Not Executed |
| **B04-28** | B 股份最小单位不支持 0.5 股时拒绝部分接受 | M10-F009 | Not Executed |
| **B04-29** | 未做批量竞价 UI 仍能完成合规受控一级认购 | M10-F010 | Not Executed |
| **B04-30** | 同符号但假合约代币转入时不计作合法款 | M11-F001 | Not Executed |
| **B04-31** | 运营改收款地址未批准时不得出现在投资者支付界面 | M11-F002 | Not Executed |
| **B04-32** | 付款过期后有 Tx 应保留迟到款处理与真实证明 | M11-F003 | Not Executed |
| **B04-33** | 同一 tx/log 重复回调必须唯一归档 | M11-F004 | Not Executed |
| **B04-34** | 前端看见 txHash 但区块重组时不得继续配售 | M11-F005 | Not Executed |
| **B04-35** | 一订单两次付款组成足额支付，避免重复计付 | M11-F006 | Not Executed |
| **B04-36** | 错误链真实款项不能被显示为原单有效付款 | M11-F007 | Not Executed |
| **B04-37** | 同一 tx 重放不重复计款，两笔实际付款都被保留 | M11-F008 | Not Executed |
| **B04-38** | 退款广播后回调丢失，不允许再发第二笔 | M11-F009 | Not Executed |
| **B04-39** | 服务商说成功但系统付款 Unknown 时仍可受权调查 | M11-F010 | Not Executed |
| **B04-40** | 没有法币支付选项不影响真实稳定币发行逻辑设计 | M11-F011 | Not Executed |
| **B04-41** | 两 Offering 争同一 B 类别股本上限不允许双重销售 | M12-F001 | Not Executed |
| **B04-42** | 预留到期且付款 Pending：只允许受权合法冻结/决议 | M12-F002 | Not Executed |
| **B04-43** | KYC 过期但钱到账时仍应阻断自动配售 | M12-F003 | Not Executed |
| **B04-44** | 用户付款成功但该 Offering 被强制暂停，不能照常配售 | M12-F004 | Not Executed |
| **B04-45** | 配售请求网络超时再调用，不能重复配售 | M12-F005 | Not Executed |
| **B04-46** | Token 已铸但法定股东登记 Unknown，仍标法定权利未核验 | M12-F006 | Not Executed |
| **B04-47** | 股权名册仅 99 单位、链上 Mint 100：拒绝完全交付标识 | M12-F007 | Not Executed |
| **B04-48** | 登记回调丢失不得无条件再发法律发行决定 | M12-F008 | Not Executed |
| **B04-49** | 部分授股后未获配资金不得当作全部已交付 | M12-F009 | Not Executed |
| **B04-50** | 不足募集额时不得给投资者伪造已配权益或静默挪款 | M12-F010 | Not Executed |

## 八、待产品负责人评审的十项建议（**SCOPE-176～185，全部 Draft/未批准**）

| ID | 推荐产品原则 |
|---|---|
| **SCOPE-176** | 确认 Batch 04 严格覆盖 **M08～M12 50 项**（P0 41/P1 5/P2 4），按原功能 ID 与五类交付定位评审，**不改原 187 项编号和分级**。 |
| **SCOPE-177** | 发行机构投资者门户是机构自拓投资者的发行前台，不构成自营全球 RWA Marketplace；最小范围是受权账户/发行/资格、报价/签署、付款/订单、权益/Token 状态及适用收益/通知查询。 |
| **SCOPE-178** | KYC/KYB、AML/制裁及**Offering-specific Eligibility** 分开记录与定期/关键动作复核；合法授权内复用核验数据，**不默认跨租户共享原件**；不得通过人工例外覆盖平台强制禁令。 |
| **SCOPE-179** | M10 以有效 Instrument/Offering、权利/文书版本、单位/价格/费用与真实付款币种生成 QuoteSnapshot 和唯一订单；M12 负责原子预留额度，M10 负责订单状态，过期及链 Pending/Unknown 不能盲目释放或伪造已付款。 |
| **SCOPE-180** | M11 使用合法批准的 USDT/USDC 网络/合约与收款方案，独立记录真实 Tx、Finality、匹配/对账、少付多付/错链/迟到账和退款实际外部出款；**Unknown 时查询原意图，不盲重付或覆盖真实资金事实**。 |
| **SCOPE-181** | M12 作为法定发行额度/份额容量的唯一权威，按资格、合法发行权、匹配真实资金与事前授权规则作幂等配售；法定持有人登记、Token Mint/Delivery 各有外部权威，必须显示并受权处理不同步。 |
| **SCOPE-182** | A 债权的名义本金/应计/息权、B 股份类别/获批股本/稀释与可选分红，分别应用于 Quote、发行容量、法定登记和受限 Token 映射；不得用 Token 数量直接推断权益、收款或股权比例。 |
| **SCOPE-183** | 条件性 **M08-F009、M10-F009、M11-F010、M12-F009、M12-F010（P1）** 依真实 Instrument/法域/合法付款与配售模式决定最小实现深度；法定最低披露、异常人工调查及必要退款/转档 Guard 不能因高级 UI 后置而删除。 |
| **SCOPE-184** | M08-F010 个性化营销、M09-F009 跨租户 KYC 网络、M10-F010 复杂批量认购、M11-F011 法币与其它支付通道（四项 P2）不默认进入 Issuer V1；共享界面可以简化，但后端真实权限、资金与法律证据不可简化。 |
| **SCOPE-185** | 本批 50 项及 B04-01～B04-50 仅为**产品最低交付深度与 Not Executed 案例草案**；不得宣称软件/资金/法定登记/真实链已通过测试，A/B 原 187 项保持 Not Tested，具体法域主体、最终 V1 冻结、UI 和研发仍单独待批准。 |

## 九、后续与冻结前责任

- **批次目标**：如本批原则获得明确批准，再进入 Batch 05（M07/M22 Token、合约、签名与外部受权执行）详细 PRD；之后 Batch 06（M13/M17/M18/M20/M21）及跨批次整合。
- **G-01～G-06 不得漏掉**：真实 Instrument/法域、公司/法律权威/实际资金方和签名方、允许的一级销售结构、条件性 P1 的真实触发、187 项 V1 逐 ID 实施深度与证据验收，均属实际生产上线前独立决策。
- **治理纪律**：第 02～04 份 Frozen、M01～M22 正式 187 个 ID、ARCH-001/DEC-011 既有原则及 PR #6 Draft/Open/Unmerged 不变。本批不授权代码、真实资金/Token 操作或 UI。
- **UI 顺序**：用户明确选择完整 PRD 后统一 UI；本批页面组只提供产品操作范围而非 UI 样式和路由冻结。

**当前状态：Batch 04 Draft / SCOPE-176～185 全部未批准；B04-01～50 全部 Not Executed；A/B 187 功能全部 Not Tested；PR #6 Draft/Open/Unmerged。**
