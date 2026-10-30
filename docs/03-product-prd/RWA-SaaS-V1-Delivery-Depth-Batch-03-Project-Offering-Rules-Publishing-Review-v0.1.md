# RWA SaaS｜Issuer V1 交付深度 Batch 03：Project、Offering 与发行规则/发布审核 v0.1

> **Batch 03 M05/M19 共 19 项的产品最低交付深度原则 SCOPE-168～175 已获 Approved；具体 UI/API/技术实现、法域执行和真实 V1 全局范围仍 Draft/TBD。** 产品负责人 2026-10-22 明确全部同意。见[正式决策](../../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md)。
>
> 更新：2026-10-22。依据：[已批准 Batch 02](../../decisions/SCOPE-160-167-batch02-asset-instrument-documents-review.md)、[187 功能范围](RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)、[五类交付候选](RWA-SaaS-Issuer-V1-Delivery-Candidate-Categorization-v0.1.md)、[第 04 份 Frozen 核心 WF-04/05、WF-08/09、09 节转换/Guard](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[样本 A 债权](RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)、[样本 B SPV 权益](RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md)。
>
> **现有功能与等级不变**：M05 共 12 项（P0 10/P1 1/P2 1）；M19 共 7 项（P0 5/P1 1/P2 1）；合计 **19 项（P0 15 / P1 2 / P2 2）**。本轮为**产品业务/交互需求规格草案**；实际首发法域/工具、收款/签名/登记责任主体和 187 项全局 V1 深度仍独立待决。继续执行“完整 PRD 后统一 UI”。

## 一、主要业务问题与明确边界

**Project 是发行工作与存续管理容器，Offering 是有确定条款/受权方式的一次发行轮次。**

- 一个 Issuer 可以管理多个 Project，一个 Project 可以有多个 **Offering**；同一 Project 可同时有已完成认购但仍在存续的轮次，以及正处于筹备或持续销售中的其它轮次。
- **Project 状态不等于 Offering 状态**，Offering Open 不等于其订单或 Token 已全部完成；Offering Completed 也不自动终结相关债权/股权的合法存续义务。
- Offering 必须引用 **M04 经授权内部审查的 InstrumentVersion**、M06 文件/签署、M09 投资资格、M11 合法收款、M12 唯一发行额度/法定登记、M07 Token 实际执行等。**内部审核完成不代表满足生产合法发行门**。
- 首选 **持续一级认购（ContinuousPurchase）**，但若实际合法 Instrument/公司批准/融资条款要求 **BatchAllocation（封闭募集与统一配售）**，最低必要业务闭环才触发原 M05-F011 条件性 P1。
- **M19 的版本化规则与强制 Guard** 必须由 API 统一执行；不用 V1 先建全量拖拽规则引擎。投资者间受控转让 M14 仍 V2。

## 二、用户角色、逻辑页面组和业务任务

| 角色 | 主要操作 | 权限和审批底线 |
|---|---|---|
| Issuer 项目负责人 | 建 Project、关联 Asset/Instrument、创建 Offering、设定销售/披露/准入条款、提交审批 | 组织、Project/Offering 作用域与合法实体授权；不能自创法定发行权 |
| Issuer 发行审批人 | 审核发行条款与必要文件、发布前 Guard，按权责批准或退回 | 高风险分权，审批版本不可被草稿编辑绕过 |
| Issuer 财务/业务运营 | 查看受权收款方案、订单资金状态/募集额度，申请暂停、协助异常 | 不能人工伪造真实支付确认/退款或法定登记 |
| 平台 SaaS 运营/风控 | 管理商业授权和强制安全规则、受控冻结风险操作 | 不默认代 Issuer 决定公司法发行权、签名或出款 |
| 投资者 | 仅接触已授权、真实 Open 且资格满足的 Offering 和条款 | 不能直接改价格、容量或获取未发行草稿敏感文件 |
| 受权外部主体 | 必要法律发行、资金/登记/Token 签名执行与真实响应 | 权责按 Instrument/法域/服务商配置，SaaS 不自动成为该主体 |

| 逻辑页面组（非正式 UI 路由） | 需要有的最小业务操作 | 显示/决策依据 |
|---|---|---|
| Project 列表与工作区 | 新建、筛选、查看项目状态、负责人/资产/轮次、未结任务及存续摘要 | Tenant + Role + Project scope；不将全部 Offering 状态简化成单一 Project 成功 |
| Project 详情及关联 | 管理 Asset/Instrument 版本引用、项目资料、Offering 多轮次、存续入口 | 版本引用、法定主体和资产权利区分，M04/M06 更新影响可见 |
| Offering 创建/详情 | 参数/额度/价格/资格/币种与链、支付/登记/Token 受权方案、草稿保存及重新提交 | Quote/Terms 快照、法定最小单位、容量与文书/资格版本 |
| 发布前置检查/审批 | 缺项清单、风险/专业证据、申请发布、审批/退回、批准与实际开放分开 | M19 Guard + 专业/法定许可依据；未满足不得 Open |
| 销售和在途交割监控 | Open/Paused/Close、受权销售额度、订单/支付/配售/登记/Token 状态分开展示 | M10～M12/M07/M13 各自权威数据，不能直接修改外部事实 |
| 规则与审计配置 | 受权查看平台强制限制、Offering 规则版本、审批生效与变更影响 | 强制平台/法律安全 Guard 高于可选机构自定义；高级动态规则编辑器后置 |

## 三、19 个正式功能 ID：最低交付深度候选（全部 Draft）

| 功能 ID / 原功能名 | 原等级 / 原交付分类 | 用户可执行操作、数据与最小 UI 结果 | 核心受权规则/异常保护 | 验收设计 |
|---|---|---|---|---|
| M05-F001 Project 创建及项目工作空间 | P0／共享界面/简化实现 | Project 列表、新建/概览、关联人员和工作事项；必要数据：project_id/tenant_id/issuer_entity_ref/负责人/项目名称/资产关联/项目状态；最低行为：项目是一组发行轮次与后续存续工作的管理容器；一项目可有多轮 Offering | 不能因一轮销售结束就将整个 Project 关闭，关闭前检查未结义务 | B03-01 |
| M05-F002 Asset 与 Instrument 关联 | P0／共享界面/简化实现 | 在 Project 引用经受权审核的 AssetVersion 和 InstrumentVersion；必要数据：asset_ref/instrument_ref/approved_rights_version/适用 legal_issuer 与关联证据；最低行为：仅引用 M04/M06 有效版本；变更时重新校验资格及相关 Offering 影响 | 不得凭 Tenant 购买权限或 Asset 已上传就认定 Instrument 可以合法发行 | B03-02 |
| M05-F003 Offering 创建与轮次关系 | P0／共享界面/简化实现 | Project 详情创建/查看多个 Offering，按轮次筛选；必要数据：offering_id/project_id/instrument_version/发行主体/发行模式/轮次状态/起止时间；最低行为：Project 1:N Offering；轮次、Token 供应限制与注册权威关系保持可追溯 | 一个 Offering 的 Published/Open 或 Completed 不能隐式改变整个 Project 的生命周期 | B03-03 |
| M05-F004 发行总量价格与精度 | P0／共享业务核心需实现 | 输入总发行额度、单份单位、认购价、费用、币种和精度；必要数据：issuer_authorized_capacity/Instrument unit/price/fees/min_lot/max_order/decimal_policy/币种；最低行为：M12 唯一核对实际可配额度与跨 Offering cap；A 与 B 使用不同法律单位/价格适用规则 | 不能混用债权名义本金、股份单位、Token 数量、认购价及真实支付 USDT/USDC 精度 | B03-04 |
| M05-F005 持续购买与开放窗口 | P0／共享业务核心需实现 | 持续一级认购窗口设置、开售/暂停/结束规则；必要数据：sale_start/end/持续认购或批次方式/在途订单政策/支付观察窗口；最低行为：ContinuousPurchase 仅在具体 Instrument 法律上允许时启用；已完成单笔订单不代表整轮 Offering Completed | 已发起但未完成的付款/预留/配售在暂停或关闭销售时不能凭界面状态删除 | B03-05 |
| M05-F006 Offering 资格和限额配置 | P0／共享界面/简化实现 | 选择 Offering-specific 资格、地域/类别、最小最大单、受让钱包约束；必要数据：eligibility_rule_version/investor_type/jurisdiction/min_max_investment/lockup_ref；最低行为：复用 M09 法域和投资者资格引擎，记录批准规则版本；必要时交易前复核 | KYC Verified 不等于对该 Offering Eligible；不得绕过适格/转让限制 | B03-06 |
| M05-F007 链币种及受权收款方案引用 | P0／共享业务核心需实现 | 在发布前引用受权网络/币种/合约/收款和退款及 Token 交付方案；必要数据：chain_id/payment_token_contract/receiver_authority/refund_authority/registrar_ref/token_execution_ref；最低行为：M05 保留指向受权 M11/M22/M07/M12 方案的快照与有效性 Guard | SaaS 不默认收款、持钥或法定登记权限；缺证明不得进入正式销售 | B03-07 |
| M05-F008 发布审核与前置检查 | P0／共享界面/简化实现 | 发行发布前检查清单、提交审核/退回/批准与发布操作分开；必要数据：document_version/approval_ref/eligible_rule_ref/payment_plan_ref/Token/ref/version/production_readiness；最低行为：草稿→提交→审批，ApprovedNotPublished 与实际 Open 分开；阻断缺少法律及服务商等必要条件 | 审批人员不能仅凭 Tenant admin 身份绕过公司法定授权或真实执行资格 | B03-08 |
| M05-F009 发布暂停关闭和存续衔接 | P0／共享界面/简化实现 | 受权发布、延期开售、暂停、恢复、停止新认购、清算中/完成、项目存续入口；必要数据：Offering state + project state + 未结认购/退款/登记/Token/收益义务摘要；最低行为：Offering Open 可以同时有已完成与未完成订单；ClosedForSubscriptions 停新单但仍处理在途；Project Closed 要检查后续义务 | 发布成功≠收款开始；暂停/取消不得抹除真实已到账和债权/股份 | B03-09 |
| M05-F010 条款变更在途订单影响 | P0／共享业务核心需实现 | 重要条款变更影响分析、草案/新版本/重新审批、通知和在途订单处理；必要数据：old_version/new_version、已签署数量、在途订单、资金/配售/登记/收益影响、合法后果；最低行为：改价格/条款/限制后，已接受 Quote/签字旧版不能覆盖；必要时停止新单/重新签署或依法处置 | 不能因为 UI 修改一个字段就改变投资者既有权利、已付款订单或供应量 | B03-10 |
| M05-F011 集中募集与批次配售模式 | P1／条件性必需（需参考工具裁决） | 合法集中募集或统一配售条件触发最低 BatchAllocation；必要数据：funding_target/期限/批次状态/配售时间/失败退款规则（若法域要求）；最低行为：原 P1 条件性：若参考真实 A/B 工具必须集中募资或统一授股，则最低批次流程必需；不默认做复杂融资市场 | 不可为了 V1 持续购买的默认模式绕过法律募集结构；失败资金不得丢失 | B03-11 |
| M05-F012 动态定价和高级发行策略 | P2／暂不计入 Issuer V1 首期 | P2 后置：动态竞价/多策略自动定价/高阶发行优化；必要数据：oracle/动态策略、自动多轮报价、复杂发行策略；最低行为：基础受权静态/版本化定价与法律授权仍属于 P0 最低底线 | 不默认多资产 AMM、复杂收益优化或无审批算法定价 | B03-12 |
| M19-F001 产品线权限和能力配置版本 | P0／共享业务核心需实现 | 校验购买 SaaS 套餐授权和 Issuer/业务环境能力的可用版本；必要数据：tenant_entitlement/version/环境权限/可用功能/截止期/停用时点；最低行为：API 服务端按适用软件许可执行，不能用界面隐藏替代；金融发行合法 Gate 另查 | 已购 SaaS ≠合法证券发行；过期/停权不得越权继续新发 | B03-13 |
| M19-F002 Instrument/Offering 条款版本 | P0／共享业务核心需实现 | 锁定 InstrumentVersion 与 Offering 条款、Quote/签署的规则引用；必要数据：instrument_rights_version/offering_terms_version/effective_at/冻结主体/变更原因；最低行为：Snapshot 按批准生效时间绑定，旧签署/订单历史保留，不静默重新定价 | 系统新规则不能改写历史发行权益、名义本金额或法律文件 | B03-14 |
| M19-F003 投资者资格规则版本 | P0／共享业务核心需实现 | 定义法域/投资者类别/Offering-specific Eligibility 的可审计规则版本；必要数据：rule_version/jurisdiction/investor_type/limits/restrictions/批准人与时间；最低行为：M09 在购买/重大变化时按批准版本核验，低权限无法覆盖限制 | 制裁/AML/法定合格投资者判断需要真实适格规则来源 | B03-15 |
| M19-F004 额度付款自动配售规则 | P0／共享业务核心需实现 | 认购额度/真实付款/受权自动配售/登记及 Token 执行的条件规则；必要数据：capacity_guard/authority_ref/payment_matched/refund_policy/allocation_guard/signing_rules；最低行为：API-First Guard，在预批自动化范围内逐笔独立核验；不跨模块伪造结果 | 付款到账不触发无条件 Mint；Token 已确认也不代表法定登记有效 | B03-16 |
| M19-F005 规则审批生效停用与审计 | P0／共享业务核心需实现 | 业务规则审批/版本生效/回滚或停用/完整审计；必要数据：draft_rule/approval_ref/effective_window/disabled_at/impacted_offerings；最低行为：由适格批准者控制，版本变更保留历史和受影响 Offering/用户任务 | 停用危险规则不自动取消已发生真实支付、登记或已生效法律权利 | B03-17 |
| M19-F006 平台租户项目配置优先级 | P1／条件性必需（需参考工具裁决） | 平台强制风险/法域规则优于 Tenant/Project 的可配置规则；必要数据：platform_constraints/tenant_specific/project_specific/priority_version/forced_pause_reason；最低行为：原 P1：**强制安全/法定 Guard 底线始终要具备**；复杂配置 UI 可延期 | 客户不可绕过 AML、支付/合约限制和法律强制资格 | B03-18 |
| M19-F007 通用可视化规则引擎 | P2／暂不计入 Issuer V1 首期 | P2 后置：自由拼装的可视化复杂规则引擎/脚本编排；必要数据：拖拽节点/自定义 DSL/跨产品扩展包等；最低行为：V1 使用受权且受控的有限规则和版本/审批，无需任意表达式编辑器 | 不为了可视化规则搭建而允许无法审计的动态执行 | B03-19 |

## 四、Project / Offering 生命周期、领域事实与 API-First 命令

以下是**产品命令、页面交互和业务事实**，不是已批准的 URL/schema 或新状态机；遵守 Frozen WF-04/05，禁止通过本草案改写旧版业务规则。

| 对象 | 受权限控制的命令/动作（逻辑级） | 已有/候选状态及不可合并的事实 | Guard 或异常处理 |
|---|---|---|---|
| Project | createDraft / updateProject / attachReviewedInstrument / activate / suspend / resume / requestClose / archive | Draft → Preparing → Active ↔ Suspended → Closing → Closed → Archived | 关联轮次/资金/法定登记/Token 与存续义务未合法结清或移交时不得 Closed |
| Offering | createDraft / setIssueTerms / linkRuleVersions / submitForReview / approve / publish / open / pause / resume / closeForSubscriptions / settle / complete / cancelWithResolution | Draft → SubmittedForReview → ApprovedNotPublished → PublishedNotOpen → Open ↔ Paused → ClosedForSubscriptions → SettlementInProgress → Completed；NeedsChanges/Rejected/Cancelled 受控分支 | 已批准不等于真实开售。批次或持续模式切换、关闭后的在途交易处理独立审查 |
| OfferingTermsVersion | proposeChange / compareVersions / approveVersion / activateWhenLegal / retire | Draft/UnderReview/Approved/Active/Superseded 是**文书/规则版本概念**，非对 Frozen Offering 状态强加新枚举 | 在途 Quote/Subscription/已签文书绑定旧版；重要变更需法律影响判断 |
| OfferingEligibilityRules | configure / requestApproval / activate / disable / evaluate | 以批准生效的 eligibility_rule_version 供 M09 决策；身份 KYC 和发行资格不是一个状态 | 直接请求支付/配售时也必须重新执行资格 Guard |
| PaymentAndDeliveryPlan | linkAuthorizedPayment / linkRegistrar / linkTokenExecution / validateReadiness | 只记录受权方案/引用/就绪检查，不由 M05 宣告实际收款或法定登记确认 | 链、合约、实际收款地址、退款责任和签名授权缺失时正式发布 Guard 不通过 |
| RuleVersion / Approval | proposeRule / reviewRule / approveRule / activate / disable / evaluateGuard | M19 保留版本、生效时点、审批/停用与受影响业务范围 | 规则停用不改写已发生真实付款/登记/Token 事实 |

**典型业务变化**：
1. Project Active，Offering A 已配售/Token 完成且处于债权持续付息，Offering B 尚在准备：Project **不能**因 A 完成自动 Closed，B 也不能被自动发布。
2. Offering Open 中一笔订单全部交付，仍能接纳依法允许的新订单；**订单 Completed≠Offering Completed**。
3. Offering 已停止新认购，但仍有付款 Unknown、差额退款、待配售、权威登记 Unknown、Token 交付失败：保留相应处理通道，最终状态必须有合法证据。
4. 调整法定股份发行容量、债务 Series 价格/应计规则或签署文件时，旧订单/Token/法律权利不因版本更新重写。

## 五、发布前置条件/阻断策略（业务级候选）

| Gate | 条件及权威来源 | 未满足时产品行为 |
|---|---|---|
| **P-01 软件与角色权限** | 有效 Tenant 商业能力、发行机构及项目范围、可审计发布审批人 | 允许编辑受权限的草稿，不允许 Open |
| **P-02 法律权利与文件** | M04 InstrumentVersion ReviewedForUse、M06 必需披露/签署版本/真实专业意见引用；额外真实发行许可按法域验证 | 阻断生产发布，显示待补全/待专业审核原因 |
| **P-03 Offering 合法模式/额度** | A1 同 Series 合法增发和计价；B1 公司获准股本/优先权/稀释；必要 B2 集中募集；M12 唯一容量 | 禁止超发/采用非法持续销售，必要时改为获批 Batch |
| **P-04 投资者准入** | M09 适格/法域/类别、钱包/锁定、Offering 条款规则及版本 | 不向不合格投资者开放交易；不得用 KYC 替代资格 |
| **P-05 受权真实收款** | M11/M22 收款、退款责任方、链/币种合约/最终性/对账规则具备合法授权 | 不产生可执行付款指令，不模拟已收到资金 |
| **P-06 法定登记和 Token** | M12 权威登记主体/时序、M07 受权合约/链/密钥签名与资产权益映射和转让限制 | 禁止假定 Token Mint 产生法定权利，不允许未批准时开始生产交付 |
| **P-07 存续和审计** | M13 债权本息或 B 适用分红/法定义务，M17～M22 必需异常、日志、通知与合法退出 | 必需义务不能承接则不允许对外发行或必须依法配置补救方案 |

**平台默认行为**：发布申请时返回**按责任方分类的具体待办清单**，不允许“审核通过”按钮绕过缺少法律/第三方生产授权。可在产品设计和前端 Mock 内演示 P-01～P-07 的结果，但不据此声称合法真实发行已获批准。

## 六、报价、募集方式与版本变更的跨业务约束

- **A**：同一 Series 参考样本可持续销售，但必须具备合法后入场定价/应计利息/付息记录日，不默认每一笔以本金面额购买；Series 总额度和合法时间限制受 Guard。
- **B**：持有 SPV 股份或成员权益不是拥有底层物业，B1 只有合法资本和公司机关授权才可分轮次认购；优先认购权及豁免和稀释需要有效证据；如果公司法/组织文件要求合并决议则走 B2，不能用 B1 跳过。
- **M05 的价格/数量**以被批准的法律单位和精度记录，**M10 QuoteSnapshot、M11 付款实收、M12 配售/注册、M07 Token**各自保存不同权威数量；一张列表可以展示聚合进度，但不可把它们当成单一业务完成事实。
- **在途变更**：原 Quote/合同/支付不应无声转为新价格；需依据条款决定老订单继续、停止新增、重签/补件、合法退款或受权纠正。没有法域及服务商结论时保持待决，不预设统一合法动作。

## 七、B03-01～B03-19 验收设计卡（全部 Not Executed）

| 测试 ID | 输入或异常操作 | 产品预期 / 不应发生的结果 | 关联功能 | 状态 |
|---|---|---|---|---|
| **B03-01** | Project 的 Offering A 进入存续、Offering B 仍草稿 | 项目与两轮状态分别正确，不因某一轮完成而关闭项目 | M05-F001 | Not Executed |
| **B03-02** | 创建 Offering 引用未获内部批准的 Instrument | 禁止进入正式发布，保留有效版本要求与文件补正 | M05-F002 | Not Executed |
| **B03-03** | 同 Project 建立多个 Offering 并查看轮次列表 | Project 1:N 关联/法定工具一致，状态和容量无互相覆盖 | M05-F003 | Not Executed |
| **B03-04** | 两个 Offering 同时接近总法定额度上限 | 共同引用 M12 唯一容量，不能同时超卖或超铸 | M05-F004 | Not Executed |
| **B03-05** | 销售期内单笔认购完成而 Offering 仍 Open | 单笔订单完成不改变整体轮次 Open 或新单准入规则 | M05-F005 | Not Executed |
| **B03-06** | 投资者 KYC Verified 但该 Offering 禁止其类别 | 不允许认购/配售；资格按本轮规则及版本审查 | M05-F006 | Not Executed |
| **B03-07** | Issuer 无有效收款和退款授权却申请发布 | 阻断生产 Open；不能因设置钱包地址就认定 SaaS 有资金控制权 | M05-F007 | Not Executed |
| **B03-08** | 审批通过但生产发布条件仍缺签名或法定登记 | 保持 ApprovedNotPublished/未 Open，显示具体阻断与责任 | M05-F008 | Not Executed |
| **B03-09** | 关闭销售窗口时有链上确认中款项 | 阻止新认购，但保留在途资金与退配/交割合法处理 | M05-F009 | Not Executed |
| **B03-10** | Offering 已接受订单后调整收益/股份条款 | 旧合同/Quote 保留旧权利版本，必要暂停/重确认 | M05-F010 | Not Executed |
| **B03-11** | B SPV 章程要求截止统一授股但配置持续认购 | 阻止非法 ContinuousPurchase，提示经批准 Batch 模式必需 | M05-F011 | Not Executed |
| **B03-12** | UI 尝试启用未经批准的动态竞价定价 | P2 增强不应成为默许可生产报价的后门 | M05-F012 | Not Executed |
| **B03-13** | Tenant 商业许可已过期但还试图 Open 新 Offering | 服务端拒绝发行新业务，已有存续和退款义务不删除 | M19-F001 | Not Executed |
| **B03-14** | 项目变更 InstrumentVersion 后投资者沿用旧 Quote | 必须核验旧已签条款/有效期和影响分析，不静默变更 | M19-F002 | Not Executed |
| **B03-15** | Investor 符合 KYC 但在另一法域规则中不适格 | 应按 Offering/法域批准版本失败或人工复核，不能复用上轮 Eligible | M19-F003 | Not Executed |
| **B03-16** | 款项已对账但本 Offering 自动配售批准被撤销 | 阻断分配/Token，保留钱已到账事实及调查路径 | M19-F004 | Not Executed |
| **B03-17** | 规则自动化经审批后又被暂停/失效 | 新业务使用当前有效规则；历史审计和旧权利不覆盖 | M19-F005 | Not Executed |
| **B03-18** | Issuer 试图配置比平台制裁/发行限制更宽的规则 | 平台强制 Guard 必须阻断，P1 的高级 UI 可以延后但规则不可绕过 | M19-F006 | Not Executed |
| **B03-19** | 高级可视化规则引擎尚未上线 | 受控有限规则版本/审批与发布 Guard 正常，P2 不作为 V1 已完成 | M19-F007 | Not Executed |

## 八、本批已批准的八项产品原则（SCOPE-168～175，**Approved**）

| 决策 | 已批准产品原则（不代表 UI、法律实施及研发测试完成） |
|---|---|
| **SCOPE-168** | 以 **M05 12 项 + M19 7 项 = 19 项**（P0 15 / P1 2 / P2 2）作为 Batch 03 逐功能交付深度审核范围；不新增正式功能 ID、不改原分级和 187 项全部范围。 |
| **SCOPE-169** | Project 是业务工作与存续容器，**1:N Offering**；Offering、Subscription/Quote、Payment、Allocation、法定登记、Token 与 Lifecycle 独立状态。关闭 Project 必须受控核验各轮未结事项。 |
| **SCOPE-170** | M05 创建/发布 Offering 必须关联受权 Asset/Instrument/文件版本、适格 Issuer、合法发行数量/价格/精度、投资资格以及经批准的收款/退款/登记/Token 方案；具体真实法域/第三方责任仍独立待决。 |
| **SCOPE-171** | 合法条件下优先持续一级认购；单笔交易完成不自动结束 Offering；关闭新销售不能删除在途资金/配售/登记/Token。**M05-F011 BatchAllocation** 原 P1 仅在真实工具/法域/合同要求时触发最小闭环。 |
| **SCOPE-172** | 保持 Frozen WF-04/05 的 Project/Offering 生命周期以及批准/发布/开售分离；发布 Gate 不满足则阻断 Open，且具体说明缺项，不可用 SaaS 管理权限代替发行法定授权。 |
| **SCOPE-173** | M19 的能力、Instrument/Offering 条款、投资者资格、自动配售/支付/Token 操作等规则必须**版本化、受权审批、生效/停用可追溯**；在途 Quote/签署/已配权益不因变更被静默覆盖。 |
| **SCOPE-174** | **M19-F006 强制安全/法域优先级 Guard** 是 V1 不可省略的底层安全能力，复杂规则配置 UI 属条件增强；**M05-F012 动态定价与 M19-F007 可视化规则引擎仍 P2 后置**，不等于放弃基本受控规则。 |
| **SCOPE-175** | 本批 19 项功能及 **B03-01～19 全部 Not Executed**，仅批准时形成产品深度原则；实际 V1 最终冻结、首发法域及合法授权、UI/技术实现、真实资金/链 E2E 与 PR #6 合并均须另行批准。 |

## 九、后续推进及治理边界

产品负责人已确认 [**SCOPE-168～175**](../../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md) 的产品最低交付深度原则。下一步建立 Batch 04（M08～M12 投资者准入/认购/实际付款/配售与法定登记）**详细 PRD Draft 并等待单独审批**。待六批全部完成后统一审查全量 187 功能真实交付深度、角色/字段/异常/页面交互规格，然后再进入 UI。

**当前状态：SCOPE-168～175 产品最低交付原则 Approved；B03-01～19 全部 Not Executed、A/B 187 功能 Not Tested；具体 UI/API、服务商/合法发行与 V1 全局实施深度仍 Draft。PR #6 Draft/Open/Unmerged，冻结第 02～04 份产品文档原文不变。**
