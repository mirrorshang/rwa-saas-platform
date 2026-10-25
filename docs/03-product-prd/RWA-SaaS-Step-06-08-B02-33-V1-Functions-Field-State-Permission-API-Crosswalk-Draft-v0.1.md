# RWA SaaS｜Step06-08 B02：资产、Instrument、发行、文书与Token的33项V1逐ID字段/状态/权限/API对照（Draft v0.1）

> **2026-10-26｜33/33仅指逐ID静态覆盖（功能ID的业务依据源自Step04 Approved），非33项字段级完成或技术签收；本表字段名、状态enum、API和权限均Draft，所有用例Not Executed。** 依[DEC-036 SaaS技术产品优先](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)、[DEC-037永久免费Free＋Standard](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)与[Step05-02四条产品级Approved](RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)。源自[Step04 S04-02 Approved（M04/M06）](RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)和[Step04 S04-03 Approved（M05/M07）](RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)；下面字段、错误、调用仅用于进一步技术/产品审查，不覆盖已批准业务行为。

## 一、静态审计结果、范围和非包含范围

- 真实V1功能：**M04 8个、M05 10个、M06 6个、M07 9个，共33个正式Mxx-Fxxx ID**，已从两份Step04已批准文件逐一提取并验证ID集合，全部在本文各占一行且无漏号。33/33是**字段候选关联映射完整性**，绝不是Schema、UAT通过率。
- 发行形态：V1完整业务输入含**A债权、B SPV权益**的基础Instrument模板，**不自动包含C/D/E资产模板或复杂金融模型**；具体某资产合法发行由Issuer/有权X自证与依法执行，P技术平台对其自身监管实际行为仍有RG审查。
- **Free永久Sandbox**：Issuer可以使用33项对应的配置、模拟审批、测试Token（或经批准Testnet）与模拟Offering/Investor循环，不能生产真钱订单、正式权益或主网Mint；**Standard商业权益也不直接通过M05 P01～P07及真实Signer/资金/登记/RG Gate**。
- **非本批**：M05-F011集中募集/批次配售在**V2**、M05-F012动态定价在V3；M06-F007外部专业协作V2/M06-F008竞价V3；M07-F010复杂多链升级V3；M04-F009复杂资产组合V3。M14二级市场、M15高级白标、M16对外OpenAPI的正式版号仍遵循DEC-017，本文不能借“逻辑API”将其放进V1。

## 二、B02领域对象和跨模块业务事实权威

| 领域对象（名称均Draft） | 唯一真值与受权产生方式 | 其他领域只能引用什么 | Free/Standard双环境 |
|---|---|---|---|
| Asset / AssetRevision | **M04**资产控制/审查与版本，I合法经办和X证据 | M05引用受控资产版本，M06存附件 | Free资产草稿/模拟审核，Standard合法业务草稿与经授权真流程 |
| Instrument / RightsTerms / ResponsibleLegalParties | **M04**权利类别(A/B)、权利义务、主体与经济条款版本 | M05报价与Offering关联，M12登记，M13收益分别读取 | Free仅模拟权利/现金流，无法创造法定证券 |
| DocumentBundle / SignatureEvidence | **M06**文书/受权签署/外部法律意见的来源与版本 | M05的P02、M10 Quote/订单/签署只能引用文书版本 | Free电子签演示模拟，Standard适法的X正式签署证明 |
| IssuerProject / Offering / Publication | **M05**项目、发行轮次、销售条款、发布可见、开放/停售与在途影响 | M08只读已授权展示；M09只决定本投资者资格 | Free演示只在Sandbox；Standard发布须P01～P07，P仍不代证券发布 |
| TokenContractPlan / ExecutionIntent / Finality / Restrictions | **M07**链上真实Token事实、Signer/Tx/Finality（需有权X实际执行） | M12为法定配售/登记真值，M11/M13为真钱，不能被链值覆写 | Free模拟/测试网与主网不同；Standard仍需独立Signer与真实业务Gate |

**产品态≠工程enum；真生产结果以有权领域与外部可核验证据为准，不得由Provider200、M17 TaskDone、M21报表或P管理员后台点选直接写成最终金融事实。**

## 三、正式33项V1功能逐项映射（每一行均为Draft字段/状态/权限/API建议）

| # | 正式V1功能及已批名称 | 核心候选字段/证据引用（非Schema） | 状态/Guard及受控异常 | P/I/V/X权责 | 逻辑操作草案（非HTTP API） | 负向验收断言候选（未测试） |
|---|---|---|---|---|---|---|
| 01 | **M04-F001** Asset 建档和分类 | `AssetRef / TenantRef / AssetClass / LegalControllerRef / Revision` | Draft→PendingReview；疑似重复标审查，不自动合并 | I资产经办写；P仅最小运维 | `CreateAssetDraft/DetectPossibleDuplicate` | 证据未附/跨Tenant禁止 |
| 02 | **M04-F002** 资产权属文件与来源证据 | `AssetRef / EvidenceRef / SourceType / DocVersion / ControlScope` | EvidenceLinked≠LegalOwnershipVerified；过期需补 | I受权上传，X提供产权证据 | `AttachAssetOwnershipEvidence/CheckEvidenceValidity` | 重复上传不覆盖原证据 |
| 03 | **M04-F003** Instrument 权利类型定义 | `InstrumentRef / AssetRef / InstrumentType(A / B) / RightsSummary / Version` | Draft/NeedsRevision/ReviewedForUse；A债权与B SPV分型 | I配置；X适格核验；P不发法律认可 | `CreateInstrumentDraft/ValidateInstrumentType` | C/D/E不宣称V1可生产 |
| 04 | **M04-F004** 发行及有关责任主体关联 | `LegalIssuerRef / DebtorRef / SPVRef / RegistrarRef / AuthorityEvidenceRef` | Issuer主体变更触发审查；Tenant≠LegalIssuer | I合法授权；X提供主体证明 | `BindLegalParties/ReviewPartyAuthority` | 无法确认合法主体真动作阻断 |
| 05 | **M04-F005** 权利义务及转让限制条款 | `RightsTermsRef / TransferRestrictionRef / HolderEligibility / InstrumentVersion` | 已被引用的重要修订必须新Version | I编辑草稿，X审法定限制 | `VersionRightsAndRestrictions/ImpactCheck` | 不得用Token余额代法律权利 |
| 06 | **M04-F006** 收益还本赎回参数 | `DebtSeriesRef / PrincipalTerms / MaturityOrSPVClass / DistributionTerms` | A债务还本不同B SPV分配；不默认保本 | I配置与审批；X适用法律/评估 | `ValidateEconomicTerms/PreviewObligation` | B SPV不强制利息与固定到期 |
| 07 | **M04-F007** Asset/Instrument 审核及版本 | `AssetReviewCase / InstrumentVersion / ReviewerRef / DecisionEvidence` | Draft→PendingReview→ReviewedForUse/NeedsSupplement | I受权独立复核；P不批合法发行 | `SubmitAssetInstrumentReview/RecordReviewOutcome` | 审核通过非证券发行许可 |
| 08 | **M04-F008** 基础金融工具模板 | `TemplateFamily(A / B) / TemplateVersion / PrefillEvidence / DisclaimerRef` | 模板仅预填Draft，不能自动LegalEffective | I选择并补填；X审法律依据 | `StartBasicInstrumentTemplate/ValidateTemplateFields` | 不创建高级模板市场 |
| 09 | **M05-F001** Project 创建及项目工作空间 | `ProjectRef / TenantRef / OwnerActorRef / ProjectState / Revision` | Draft→Preparing→Active/Paused→Closing→Archived；单轮完成不等Project关闭 | I本项目经理；P仅技术访问 | `CreateIssuerProject/AssignProjectOwner` | 有存续义务不能关闭归档 |
| 10 | **M05-F002** Asset 与 Instrument 关联 | `ProjectRef / AssetRevision / InstrumentVersion / LegalIssuerRef` | 引用已审版本，后续失效重新检查 | I关联并按权属审批；M04主权威 | `BindAssetInstrumentToProject/CheckVersionAuthority` | 不可通过关联自动合法化 |
| 11 | **M05-F003** Offering 创建与轮次关系 | `OfferingRef / ProjectRef / SeriesRef / RoundNumber / IssuerLegalRef` | Project1:N Offering，各轮独立Closed/Completed | I发行负责人创建/查看自己轮次 | `CreateOfferingRound/ReadRounds` | 同项目各轮容量不能混账 |
| 12 | **M05-F004** 发行总量价格与精度 | `OfferingTermsVersion / TargetAmount / LegalUnit / TokenQuantity / Price / CurrencyPrecision` | 报价版本与M12真实配售容量不同 | I财务/发行受权配置；M12额度主权威 | `QuoteOfferingTerms/ValidatePrecision` | 超发/货币单位错配阻断 |
| 13 | **M05-F005** 持续购买与开放窗口 | `WindowRef / StartsAt / EndsAt / OfferingStatus / SubscriptionMode` | 依法可用持续认购；暂停/关售不删除在途订单 | I合法发行人员；V只读开放状态 | `ConfigureOfferingWindow/CloseSubscriptions` | 法定必须集中募集时不假装V1支持 |
| 14 | **M05-F006** Offering 资格和限额配置 | `AudienceRuleVersion / JurisdictionScope / InvestorCategory / ConcentrationLimit` | Visible≠Eligible≠Purchasable；M09独立判资格 | I设受众限制，V本人受权查看，M09决策 | `VersionOfferingEligibilityRules/EvaluateAudience` | 深链无权与KYC已通过仍不可绕限制 |
| 15 | **M05-F007** 链币种及受权收款方案引用 | `PaymentSchemeRef / CollectionAuthorityRef / AllowedChainCurrency / RegistrarSignerRef` | 方案仅引用，不代表实际合法收款/Mint | I确认实际资金X，P无默认钱包/托管权 | `BindPaymentRegistrationAndChainPlans/VerifyAuthority` | 手填钱包地址不等合法收款 |
| 16 | **M05-F008** 发布审核与前置检查 | `GateCaseRef / P01ToP07Evidence / ReviewerAuthority / PublishIntent` | Draft→ApprovedNotPublished→Published；七Gate各自缺项 | I独立有权发布，P不代证券发布 | `EvaluatePublicationGates/AuthorizePublication` | 缺任一适用Gate不能真实Open |
| 17 | **M05-F009** 发布暂停关闭和存续衔接 | `OfferingStatus / StopNewOrdersAt / SettlementInFlight / ContinuityRef` | Published/Open→Paused/ClosedForSubscriptions→Settling/Completed | I按授权暂停/恢复；V依法可见状态 | `PauseOrCloseOffering/ReconcileInFlight` | 停售不删迟到账/退款/法定权益 |
| 18 | **M05-F010** 条款变更在途订单影响 | `ChangeCase / OldTermsVersion / NewTermsVersion / AffectedOrderRefs / ConsentRef` | 旧Quote/法律文件/PaymentIntent保持引用不覆写 | I发起与有权审批，V依法通知/重签 | `ProposeOfferingAmendment/AssessImpactedOrders` | 不默认全部重签或全部继续 |
| 19 | **M06-F001** 文件上传分类与权限 | `DocumentRef / Classification / OwnerScope / LinkedDomainRef / Version / AccessPolicy` | Uploaded≠Scanned≠Reviewed≠LegallyEffective | I有权上传；P不得批金融法律效力 | `UploadVersionedEvidence/AuthorizeDocumentRead` | 错误可见范围泄露拒绝 |
| 20 | **M06-F002** 必需材料清单及补件 | `RequiredEvidenceRuleRef / Applicability / ChecklistVersion / MissingItems` | 不适用与缺失区分；NeedsInfo沿原任务 | I补件；X适格审查 | `EvaluateDocumentChecklist/RequestSupplement` | 供应商无应答不当通过 |
| 21 | **M06-F003** 文书版本和签署版本 | `DocumentBundleVersion / SigningVersion / ReferencedOfferingQuotes / EffectScope` | 签署过旧版本不可静默覆盖；变更影响在途单 | I/X签署及合法文件审核 | `VersionLegalDocument/TraceSignerImpact` | 变更影响已签合同须评估 |
| 22 | **M06-F004** 审核意见任务与结果 | `EvidenceReviewCase / ReviewerAuthority / OpinionVersion / DecisionAt` | Requested→NeedsInfo/Reviewed/Unknown，任务Done≠法律通过 | I授权审；X独立专业意见；P仅工单支持 | `SubmitDocumentReview/RecordEvidenceDecision` | 同一人审批冲突需拦截 |
| 23 | **M06-F005** 认购条款展示及必要签署 | `OfferingTermsVersion / DisclosureRef / InvestorAcceptanceRef / SignerProof` | Presented≠Accepted≠Signed≠LegallyEffective | V受众/本人签；I配置；X e-sign证据 | `PresentSubscriptionTerms/VerifyAcceptance` | 外部签署Unknown先查原意图 |
| 24 | **M06-F006** 法律评估成果引用 | `ProfessionalReportRef / IssuerSubmittedBy / ProviderAuthority / Scope / Expiry` | 报告已存在≠法律合规通过；不符Scope阻断引用 | I提供自聘法律意见；X有权出具 | `AttachProfessionalOpinion/ValidateApplicability` | 平台不签发发行许可 |
| 25 | **M07-F001** 发行链与 Token 标准配置 | `TokenPlanRef / InstrumentVersion / ChainRef / TokenStandard / Decimals / RestrictionRef` | 链Token单位≠法定本金/SPV权益；方案Version | I配置，P只技术兼容，X后续Signer | `ConfigureTokenPlan/VerifyRightsUnitMapping` | 测试Token不可当主网真权利 |
| 26 | **M07-F002** 合约参数版本和部署批准 | `ContractVersion / DeploymentIntent / NetworkRef / CodeHash / Approval / SignerRef` | Requested→ApprovedScoped→Submitted/Finality/Unknown | I依法发起批准；X真正Signer | `ApproveContractDeployment/QueryDeploymentIntent` | Unknown不可盲重复部署 |
| 27 | **M07-F003** 钱包接收地址登记与校验 | `InvestorRef / ReceiverWalletRef / ControlProof / ChainRef / BindingVersion` | PaySourceWallet≠TokenReceiver≠LegalHolder | V本人/代理授权绑定，I摘要只读 | `BindReceivingWallet/VerifyControlProof` | 无法证实钱包控制则阻断 |
| 28 | **M07-F004** 获批准 Mint 与交付 | `MintIntentRef / AllocationRef / RegisterEvidenceRef / SignerAuthority / Amount` | M12批准名册/配售与M07真正Mint分别核验 | I业务提出；X真实Mint，P无签权 | `RequestAuthorizedMint/ConfirmTokenDelivery` | 原Intent重复Mint阻断 |
| 29 | **M07-F005** 链上提交确认与 Unknown 查询 | `ExecutionAttempt / TxHash / FinalityProof / UnknownReason / RetryRef` | Submitted≠Finality；Unknown先查原Tx | M07链权威，X真实节点/Signer | `ReadChainFinality/ReconcileUnknownTx` | 链重组/nonce冲突不可当成功 |
| 30 | **M07-F006** Token 与登记配售核对 | `AllocationRef / LegalRegisterVersion / MintActual / VarianceCase` | 链已Mint≠M12合法登记完成；差异不可涂绿 | I合法审核差额，M12/M07各自主账 | `CompareTokenAndLegalRegister/EscalateMismatch` | Token多/少铸不能默改名册 |
| 31 | **M07-F007** 必要合约级转让限制 | `RestrictionVersion / AllowlistPolicy / TransferLock / SignerProof` | 限制需链上执行与法定受让条件区分 | I合法审批；X合约实际执行 | `SetTransferRestriction/VerifyChainEnforcement` | 不暗含M14二级市场 |
| 32 | **M07-F008** 高风险密钥操作权限与暂停 | `HighRiskActionIntent / Proposer / Approver / Signer / RevocationProof` | 申请、审批、实际签名分离；紧急暂停审计 | I合法角色分权，P无默认私钥 | `RequestHighRiskAction/VerifySeparation/Revocation` | Owner角色不等Signer |
| 33 | **M07-F009** 赎回销毁与授权调整 | `ExitCaseRef / DischargeProof / LegalRegisterClose / AuthorizedBurnIntent` | 法定清偿/登记/Burn分别独立 | I有权退出责任人，X资金/登记/Signer | `RequestAuthorizedBurn/ConfirmBurnFinality` | Burn不得宣称资金已付/权利终结 |

## 四、跨场景发布前P01～P07必需的版本/证据Gate（产品原则已批，字段Draft）

**M05-F008已批的是七类缺项检查/用户受权发布，下面不替具体法域下法律意见、金融许可或生产Signer作批准。** 尤其在Free与Standard两个模式下：Free的`SimulationGate`只能标明模拟步骤是否完整，不能产生真实发布授权；Standard所付SaaS商业费只通过P01中M01商业权的部分，**其余P02～P07及平台自身RG必须独立通过**。

| Gate | 关联领域/候选字段 | Free Sandbox应如何展示 | Standard真实业务必须怎样处理 |
|---|---|---|---|
| P-01商业与组织 | M01商业EntitlementVersion、M02有权Actor/IssuerRole | 模拟通过展示“此为Free测试，无生产权” | 真实StandardActive＋发行有权Issuer人员 |
| P-02资产法律工具与文书 | M04 InstrumentVersion/LegalIssuer、M06 DocumentBundle/SignEvidence | 可模拟法律材料检查，不出具法定意见 | Issuer/X提供适用的法定权威证明、版本/资格及文件 |
| P-03发行方式/额度 | M05 OfferingTermsVersion/Mode、M12合法容量Ref | 模拟容量与订单、超额可报测试差异 | 真实V1仅在依法允许持续认购/基础配售时适用；需集中募集另走V2差异决策 |
| P-04投资者准入 | M05 AudienceRuleRef、M09 CurrentOfferingEligibilityRef | 模拟身份与资格 | 真实V投资者及销售范围、资格和限制独立按Offering规则判定 |
| P-05受权收款 | M05 PaymentSchemeRef、M11真实收退款/X合法Holder | 只能模拟付款地址/资金与提现 | 必须有合法持款/退款/实际可验证收款与X证明；P无默认收款权 |
| P-06法定名册/Token | M12 RegistrarAuthorityRef、M07 Signer/ContractPlan/FinalityRef | 模拟登记与测试Token，二者不生成法律权利 | 每一合法名册/交割与真实主网Signer、法律条款绑定条件独立验证 |
| P-07收益与存续/审计 | M13 ObligationPlan、M17～M22任务/通知/规则/审计/Provider | 可完成收益/到期模拟，不伪造实付 | 有合法本息/分红/清偿/退出义务承接与证据、异常安全通路 |

## 五、P/I/V/X职责及只读视图矩阵（具体权限字符串仍Draft）

| 操作域 | P SaaS | I Issuer | V投资者 | X有权外部 |
|---|---|---|---|---|
| Asset/Instrument/文件 | 技术最小访问、系统安全/审计，不代Issuer认定法律权利 | 受授权创建、补件、审查及批准自己Issuer的数据 | 仅受权披露快照 | 律师/评估/登记等各出适格真实证据 |
| Project/Offering价/受众/发布 | 提供M19规则/连接可用性，但不代法定Issuer发证券 | 分权配置/申请/独立发布，依适法发行方式 | 可见/可买分离，不能靠深链越权 | 如需依法外部审查或注册，回传其真实状态 |
| Token部署/Mint/Burn/禁转 | 不默认控制客户钱包、生产私钥或Signer；平台自身参与另RG | 向有权Signer提出合法Intent/审批，不直接宣称链Final | 绑定接收钱包与控制证明，自己合法可见 | 真Signer/节点执行并出Finality，法律登记者独立 |
| 生产关停及已有义务 | P商业安全限制不抹真实权利 | Issuer继续管理已发生真实订单/兑付/登记责任 | 依法查询己方已持权益 | 真实X资金、名册、Signer持续履约 |

## 六、候选状态迁移图谱（非执行状态机合同）

| 领域 | Draft状态路径 | 独立拦截/恢复 |
|---|---|---|
| Asset/Instrument | Draft→PendingReview→ReviewedForUse/NeedsSupplement→NewVersion | 内部审查通过非金融合法发行许可，旧引用版本保留 |
| Project/Offering | Project Draft→Preparing→Active/Suspended；Offering Draft→ApprovedNotPublished→PublishedNotOpen/Open→Paused/ClosedForSubscriptions→Settling/Completed | 发布与可售、投资者Eligible独立；停售不撤销已存在真钱/权利 |
| Documents | Uploaded→ScanPending/Reviewed→SubmittedForSigning→Signed/Unknown→LegalEffectValidated（需法定来源） | E-sign回调/链接点击≠法律有效；旧文书Quote不可无痕更新 |
| Token | PlanDraft→ApprovalRequested→ApprovedScoped→Submitted/Unknown→FinalityVerified→Reconciled | Mint/Burn与LegalRegister和实际资金不同，Unknown查原Intent、链重组重核 |
| Free/Standard外部环境 | FreeSandboxEnabled；StandardCommerciallyActive + ScopedProductionEnabled | 测试Token、订单、名册、金额不得改环境字段就变正式真值 |

## 七、跨模块风险与至少18组UAT场景（未执行）

| 用例 | 预期审计断言 |
|---|---|
| B02-UT01 | Free从Asset→Instrument→Offering→模拟Token→模拟投资者购买→收益退出完成全流程，零真实金融事实 |
| B02-UT02 | Standard已开通但Issuer/X的合法资金Signer未确认，P05/P06阻断真实Offering与真实主网执行 |
| B02-UT03 | P后台冒用Issuer或Signer实施资产法律审批、发布或Mint，服务端拒绝且审计 |
| B02-UT04 | 同一Asset疑似重复或权属文书过期，提示复核但不自动合并或确认合法 |
| B02-UT05 | Instrument在Quote/订单已引用后更新权益条款，旧Version/签名/在途订单保持可追溯 |
| B02-UT06 | SPV B权益配置没有固定票息/保证回购，不被模板强行补成债权义务 |
| B02-UT07 | Project有两轮Offering，单轮Closing不自动关闭整个Project |
| B02-UT08 | 已发布但未开售、暂停或停售，可合法披露但不能创建新有效订单 |
| B02-UT09 | V通过旧深链跨Tenant/受众访问定向Offer，内容与购买动作都按权限拒绝 |
| B02-UT10 | KYC通过但Offering资格/地域/额度不适用，仍不可以购买 |
| B02-UT11 | Document外部签署成功回执但合法签署效力未核，不能伪标发行条件满足 |
| B02-UT12 | 文书/Token地址后绑定改变，受影响已有签署者/订单单独重审 |
| B02-UT13 | Free测试Token在测试网上真正成功，但不视为主网已部署/合法名册生效 |
| B02-UT14 | 主网部署Unknown或Mint失败重试：必须查原Intent/Tx，不能盲重Mint |
| B02-UT15 | M07 Token多铸或M12登记未更新，显式显示差异、不得人工改成一致 |
| B02-UT16 | Token收款/收益主张与法定权利冲突，以对应领域X法定证据审核，不以Token余额覆写 |
| B02-UT17 | Token赎回Burn已最终确认但本息未实际清偿，仍不得标债权合法终结 |
| B02-UT18 | Standard到期时仍有真实Token/投资者及债务，关闭新行为但依法保留受权履约与历史数据 |
| B02-UT19 | 需要法域强制集中募集的Offering，不假称M05-F011已经V1实现，必须走独立版本/客户差异 |
| B02-UT20 | M15高级白标或M16对外API在Free模拟界面出现时，不可假冒已在V1正式交付 |

## 八、依赖与下一轮审查优先级（均Draft）

1. **B02-FD01｜逐对象精确Schema**：角色授权、类型/必填、主体关系、Instrument A/B差异、合约地址版本、销售额度精度、M06正式文书不可变快照、跨Tenant可见隔离。
2. **B02-FD02｜Offer P01～P07合同/法定依据配置**：Issuer上传的法律证明不等于平台认证；所需证据取决于真实Issuer/Instrument及平台自身行为RG，通用产品字段不预选法域。
3. **B02-FD03｜Free/Standard环境安全**：测试网真Tx与正式投资者合法权益严格分域；真实Signer/外部资金/名册权限与Standard商业Entitlement隔离。
4. **B02-FD04｜与B03/B04/05依赖**：Offering/M05→M09 Eligibility→M10 Order→M11 RealMoney→M12 Register→M07 Token→M13收益→M17～M22审计、异常；**此批不能宣称全146项已完成**。
5. **关键用户决策仅在业务范围实质变化时提交**：如要求Free也有部分真实商业发行执行、必须集中募集提前V1、Token合法权利来源发生根本变化；**当前均未授权**。
6. **后续报告**：把本33项的字段字典完整化、与旧65行B01、新B03～B05形成双向追踪，对金额精度/RBAC/外部资金和链回调做技术/安全审，真实Sandbox/E2E后才能记录执行测试结果。

**总边界：33/33正式ID静态映射，字段PRD Draft；Step04 146/146功能已Approved且Step05五场景29条历史决策可追溯（Trial已由DEC-037局部接续）；DEC-028 X-01～X-13全部Open、193项V1 146/V2 22/V3 20/TBD 5、四份Frozen/历史DEC/SCOPE均不改。V1整体未Frozen，PR #6 Draft/Open/Unmerged，未进行UI、研发或真实金融/Token生产。**
