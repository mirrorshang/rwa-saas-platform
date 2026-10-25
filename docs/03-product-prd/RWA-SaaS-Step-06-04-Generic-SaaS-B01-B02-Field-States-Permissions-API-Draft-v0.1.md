# RWA SaaS｜Step06-04 通用SaaS字段级产品PRD首批：B01入驻订阅 × B02 Issuer资产与Offering（Draft v0.1）

> **2026-10-26｜产品字段/状态/权限/逻辑API均Draft，Not Approved、Not Executed。** 依据[DEC-036 Step06-R04=A](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)与[技术SaaS优先执行计划](../00-governance/RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md)。本文件是**已经开始的通用产品字段级工作底稿**，不是将Step05原65字段或05-02上游业务规则重新批准。客户Issuer自行负责具体发行法律合规；平台实际受监管服务、真实资金与Signer需独立RG启用门，所有X-01～13保持Open。

## 0. 当前权威和覆盖范围

- **B01** 来源：[Step05-01 Approved PRD v0.3](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)、[既有65项字段候选Draft v0.2](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)、[跨端状态Approved v0.2](RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md)。本稿**引用而不复制/替代65字段主草案**，优先列出需要工程技术评审的缺口，保留Trial=336h、后续只读/受限窗口=720h（DEC-030 Approved），升级不新建Tenant。
- **B02** 来源：[Step05-02 Approved PRD v0.2](RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)及[跨端状态Approved v0.1](RWA-SaaS-Step-05-02-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)、S04-02/S04-03批准业务功能。通用字段允许A债权或B SPV权益等Instrument配置，不预选法域；实际法律有效性由Issuer/有权X提供，不允许平台假签发许可。
- **不覆盖**：B03投资者/资金/Token、B04募集款/收益退出、B05 M17～22；这些将在同一[Step06-03矩阵](RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md)基础上接续分批Draft。最终146项双向覆盖另审。
- **字段表示法**：以下英文为**候选业务字段名**，类型/唯一性/精度/空值/接口路径/加密和数据生命周期均尚未工程批准；任何表格“必须”指拟验收的**产品守卫或继承已批行为**，不是法域法律结论。

## 1. B01：商业客户与Tenant/商业KYB/Trial/Standard

### 1.1 继承65候选字段主草案的逻辑对象与首要依赖

| 逻辑对象和主责 | 关键业务字段候选/引用（不替代原65项） | 必须保持的产品不变量 | 技术/字段缺口 |
|---|---|---|---|
| **Account / Owner (M01/M02)** | AccountRef、EmailVerificationRef、OwnerUserRef、AuthorizedRepresentativeRef、IdempotencyIntent | 注册/邮箱已核不能等于商业KYB；不能一个账户获取所有Tenant权限 | 同邮箱多账号/代理、验证令牌过期、脱敏与重放 |
| **SaaSCommercialCustomer (M01)** | CommercialCustomerRef、EntityLegalName、IncorporationJurisdiction、RepresentativesRef、CommercialAgreementSignerRef | **购买SaaS主体**不等于**每个Instrument的法律发行人** | 企业实际受益人/法人引用与查验、合法留存 |
| **Tenant / TrialEntitlement (M01/M19)** | TenantRef、TenantMode、TrialActivatedAt、TrialExpiresAt、ReadOnlyRestoreDeadlineAt、AllowedCapabilities、RestrictionReason、EntitlementVersion | **336h Trial／其后720h只读受限窗口**，UTC瞬间运算；Trial→Paid同Tenant；模拟真钱永不迁移成真金融事实 | 时钟一致性、并发升级、边界时刻去重/权限缓存 |
| **CommercialKYBCase (M01/M03/X)** | KYBCaseRef、ApplicantRef、EvidenceSetVersion、SourceVerificationRef、ReviewDecisionRef、NeedsInfoReason、LastLegalRecheckAt | KYB补件沿原Case；Rejected需新合法证据复核；Unknown不升级，P有权商业审核不代Issuer项目金融合规 | 证件加密/最小访问、外部结果差异和敏感保留 |
| **SaaSContract / Standard (M01)** | CommercialContractVersion、OfferVersion、TermsAcceptanceEvidenceRef、SubscriptionIntentRef、PlanRef | 一款Standard、商业KYB＋合法合同＋真实商业付费才可有效升权；法定合法例外须受权留证 | 商业合同/费用版本与当前Intent一致，争议暂停规则 |
| **CommercialPayment / Subscription (M01/X)** | CommercialPaymentIntentRef、ProviderEvidenceRef、VerifiedCommercialAmount、CommercialCurrency、EntitlementActivationRef、OriginalTenantRef | **M01商业付款绝不与M11认购款混账**；真实实付≠已开通；原意图查询不二次扣款 | 支付回调幂等、重复真款、跨币种、时区与实际权益生效 |
| **PortalProvisioning / Audit (M01/M05/M20)** | TenantPortalRef、PortalPreviewAccess、SimulationEnvironmentRef、ProductionCapabilityGateRef、AuditRef | Trial只私有草稿/模拟；Paid≠真实Offering合法发行许可；SaaS后台日志不能成为法定持仓真值 | 端到端权限作用域、试用升级资源合法保留/隔离 |

### 1.2 B01候选状态与P/I/V/X权限

| 领域 | 状态路径（只是语义候选） | I Issuer商业用户 | P SaaS | V / X |
|---|---|---|---|---|
| Account | Unverified → Verified；可限制/撤销 | 本人邮箱与组织授权 | 账户安全最小权限 | V不继承I权限；X邮箱验证回执 |
| Tenant | TrialActive → ExpiredReadOnly / PaidActive / Restricted | I创建自己草稿、按合法窗口请求转正 | M01权益/技术运维；不能因为Paid审批而代Issuer发证券 | V Trial不公开真认购；X提供商业账或核验证据 |
| KYBCase | Submitted → NeedsInfo/InReview/Unknown → Verified/Rejected/Recheck | 补件/查询本人组织状态 | 有权M03审核，M01保存商业权威 | X提供核验结果但Provider200≠已Verified |
| CommercialPayment | IntentCreated → Pending/Unknown → VerifiedPaid / Disputed | 通过合法支付通道完成SaaS费用 | M01核原支付并同Tenant赋权，不二次扣费 | X商业支付提供真实收款，非M11认购资金 |

### 1.3 B01逻辑API候选（不是HTTP/API签收）

| 逻辑操作 | 需要校验与真正结果 | Unknown/异常 | 权威 |
|---|---|---|---|
| RequestTrialProvision | EmailVerified+OriginalIntent、Tenant唯一幂等 | 超时查原创建、不能盲建新Tenant | M01/M02 |
| SubmitOrSupplementCommercialKYB | 组织作用域、证据版本和合法复审条件 | ProviderUnknown不自动Verified，拒绝不删除合法Tenant草稿 | M01/M03/X |
| RequestStandardSubscription | KYB、合同版本、Plan与使用权限 | 合同版本过期/已取消必须重确认 | M01 |
| ConfirmCommercialPaymentThenActivate | 原付款Intent、真实商业款核验、同Tenant升级 | PaidButActivationUnknown查原Intent，禁止重复扣款 | M01/X |
| ReadTenantEntitlements | Tenant、Trial精确时限、P/I实际权限 | Paid并不授予真实募资、Mint、Signer生产权 | M01/M19 |

## 2. B02：Issuer、Asset、Instrument、Offering与投资者受权可见

### 2.1 法律/金融合规责任与技术平台对象边界（当前新增产品工作重点）

| 角色/概念 | 由谁依法负责 | SaaS字段与权限如何表达（候选） | 不得推断 |
|---|---|---|---|
| **SaaS Tenant客户** | 商业合同签约方及其组织 | TenantRef、CommercialCustomerRef | Tenant已Paid＝其每项资产合法可发行 |
| **LegalIssuer与Asset owner** | Issuer指定的真实发债/SPV/权利主体及其授权人员 | LegalIssuerRef、LegalEntityRole、AssetControllerRef、IssuerAuthorizedActorRef | SaaS商业客户＝法定Issuer＝SPV＝持款者 |
| **Instrument法律依据** | Issuer/有权律师、评估人、合规责任方 | InstrumentType、InstrumentVersion、LegalOpinionOrIssuerEvidenceRef、AuthorityActorRef | 选A债权或B SPV模板＝法律已批准 |
| **Token执行和合规收款** | Issuer与其依法有权X资金持款/登记/Signer | TokenPlanRef、ExternalSignerRef、ExternalFundHolderRef、ProductionExecutionGateRef | 计划上链或钱包Connected＝平台具托管/卖证券许可 |
| **P SaaS运营** | 我们对SaaS数据、安全、商业账户负责；自身实际受规管行为另审 | PlatformTechnicalApprovalRef（仅运维）、RegulatedActivityAssessmentRef、OperationAuditRef | P人员能借审核功能替Issuer作合法发行决定 |

### 2.2 B02逻辑字段草案（全部Draft）

| 对象/唯一真值领域 | 主要候选字段 | 产品输入/更新责任 | Guard、异常或版本要求 |
|---|---|---|---|
| **IssuerOrganization（M02/M04）** | TenantRef、LegalIssuerRef、LegalName、EntityJurisdictionRef、IssuerRepresentativeRef、LegalRoleEvidenceRef、RecordVersion | I创建并证明主体；P仅Tenant安全/商业权限，X提供真实证据 | 欠授权或Issuer变更→须重新确认合同、Signing和Offering影响；不得跨Tenant读 |
| **AssetRevision（M04）** | AssetRef、LegalControllerRef、AssetClass、AssetLocationRef、AssetDocumentSetRef、Revision、ReviewEvidenceRef | I填报，X可依法评估，Issuer批准真实声明 | 底层权属与估值未核不得由P伪造；审查与展示版本分离 |
| **InstrumentVersion（M04/M06）** | InstrumentRef、Version、TypeCode、LegalIssuerRef、RightDescription、EconomicTermsRef、RestrictionsRef、LegalBasisEvidenceRef、EffectiveConditionRef | I与有权法律X核对，SaaS留引用/版本 | Token不是法律权利本身；变更不得静默覆写旧报价/签名 |
| **IssuerComplianceCase（候选业务证据引用，M04/M05/M06/M20）** | CaseRef、InstrumentVersionRef、JurisdictionNexusConfigRef、IssuerDeclarationVersion、ComplianceEvidenceRefs、LegalReviewerActorRef、DecisionAuthorityRef、DecisionTime、ValidUntil、RevocationReason | **I Issuer为主提交/决定，X法律意见或外部证明；P不得签发法律许可证书** | Issuer自声明≠监管许可；有欠缺可保留Draft，真实发布/销售按必要Guard/生产RG Fail-Closed |
| **LegalDocumentBundle（M06）** | DocumentBundleRef、InstrumentVersionRef、DocumentVersionRefs、SignatureEvidenceRefs、AddressBindingPolicyRef、EffectiveAtCandidate、DisclosureAudienceRef | I/X法定签署责任；系统保存签署证据、不可变快照 | 需后置Token地址绑定/补签时明确在途订单影响；旧签名不被覆写 |
| **OfferingDraft / RuleVersion（M05）** | OfferingRef、AssetRef、InstrumentVersionRef、AudiencePolicyRef、OfferingTermsVersion、PriceOrUnitRuleRef、CapacityRuleRef、SubscriptionModeRef、WindowRef、IssuerReleaseApproverRef | I配置价格/可见/认购模式及有权批准；P不代证券发布 | 当前V1只含依法适用持续认购/基础配售；批次集中募集能力仍V2待独立变更 |
| **PublicationGateCheck（M05/M19）** | GateCaseRef、OfferingRef、RuleVersionRef、P01ToP07EvidenceRefs、MissingConditions、ReviewerAuthorityRefs、AssessmentAsOf、BlockReason | I及X提供项目真实合法证据；软件计算受权状态 | P-01～P-07未满足不发布；配置性检查不构成所有法域合法合规背书 |
| **PublishedOfferingSnapshot（M05/M06/M08读）** | PublicationVersion、AuthorizedPublisherRef、DisclosureSnapshotRef、AudienceVisibilityRef、IssuedAt、WithdrawnAt、OrderingEnabledRef、LegalTermsVersion | I有权发布，V只按资格/受众看有效版本 | Published/Visible≠OfferingSpecificEligible≠Purchasable；撤回历史版本保留 |
| **TokenPlan（M07）** | TokenPlanRef、ChainSelectionRef、ProtocolVersionRef、ContractIntentRef、LegalInstrumentBindingRef、AuthorizedSignerRef、WalletReceiverPolicyRef | I设置，X真Signer依法执行，P基础设施只监控 | Token部署计划/Provider ACK≠真实Mint Finality≠法律登记 |
| **ExternalProviderAccess（M22/M20）** | ProviderConnectionRef、IssuerServiceAuthorityRef、AccessScopeRef、ValidUntil、RegulatedActivityAssessmentRef、AuditRef | I依法授权自身有权X，P提供凭证隔离/健康；不同责任主体不混用 | 凭证设置≠实际法定资金/发行权；越权接入与撤权必须封锁 |

**与既有Step05/Step04产品权威的关系**：B02字段新增的IssuerComplianceCase等对象仅是产品**候选数据设计**，**不代表新增193正式功能ID**；如后续需新增独立功能必须申请正式版本范围决策。

### 2.3 B02跨端权限候选与服务端Guard

| 动作 | P | I | V | X |
|---|---|---|---|---|
| 创建/修改Asset或Instrument草稿 | 最小故障支持，不改金融法律事实 | 当前Tenant有权限者创建/版本化 | 不可见未授权草稿 | 受限专业审核、签署证据 |
| 提交法律意见/IssuerComplianceCase | P记录技术证据访问，不作法律有效性批准 | 合法代表或业务合规人员提交/审批 | 仅依法获准披露的文件 | 合法法律专业方签署、登记等职责 |
| 编辑Offering条款/目标受众 | 不代发行批准 | 本Issuer有权人员可编辑Draft、依版本重新审 | 不可改 | 提供必要外部审核证明 |
| 发布Offering或开放认购入口 | **无默认证券发布/销售批准权** | 有权Issuer人员且全部已批准Guard满足 | 按受众可见；可认购需另证Offering Eligible | 如业务/法域要求由X合法审查/放行 |
| 真Token部署/持款/实际销售 | 无默认Signer、私钥、托管和订单路由授权；若运营实控需RG | I依法授权真正执行方 | 只通过授权前台动作 | 有权Signer/资金/名册服务方真实执行，回传可验证证据 |

### 2.4 B02逻辑API候选

| 操作 | 请求/前置 | 输出及领域权威 | 异常与Fail-Closed |
|---|---|---|---|
| CreateIssuerAndAssetDraft | TenantScope+Issuer actor、唯一资产意图 | M04 Draft + VersionRef | 越Tenant/缺签权仅存Draft/Blocked |
| VersionInstrumentAndDocuments | Instrument与文书版本、合法签署责任引用 | M04/M06 immutable version references | 法律版本Unknown不得当有效 |
| AttachIssuerComplianceEvidence | Issuer有权角色、EvidenceRef、适用范围/有效期 | I证据记录、M20审计，非法律认可真值 | 自声明≠有权专业意见，Provider ACK≠许可 |
| EvaluateOfferingPublicationGates | Offering/Instrument/Docs/Token/Issuer/Audience规则版本 | M05 7类缺项、最新GuardAsOf、能否发起受权发布 | 缺法域适用规则/Issuer批准/Signer或真实资金条件→阻断相应不可逆动作 |
| AuthorizeIssuerPublication | 有权I发布人、有效P-01～07、版本Guard | M05 PublishedSnapshot + M08受众视图 | 重复事件幂等；旧Version拒绝/重确认；P运营不代Issuer签发 |
| EvaluateViewerEligibility | Viewer/ProxyRef + AudiencePolicy + M09 OfferingEligibility | 独立的Visible与CanOrder/Eligible | 深链/过期KYC/无权不给交易能力 |
| CheckProductionServiceEnablement | Issuer合法执行主体与X资金/Signer、平台自身RG评估、审批证据 | 独立的可否启用真实操作Gate（非Offering已合法的自动声明） | 缺关键证据→NoProductionExecution；不能用商业Paid覆盖 |

## 3. B01/B02衔接与跨端异常草案（全部未实际测试）

| E06-ID | 触发 | 产品预期保护／真值主责 |
|---|---|---|
| G06-01 | Trial到期边界、Commercial Payment成功但Tenant升权失败 | 原M01商业付款Intent核真后恢复同Tenant；不得二次扣款或新建第二Tenant |
| G06-02 | KYB已Verified，但Issuer资产没有法律审核证据 | 商业Paid可以管理草稿；不得因商业KYB当作金融发行批准 |
| G06-03 | Issuer声明有“法律意见”，但引用过期/撤销或无法验证 | 保留声明及证据版本，触发Missing/Unknown；不能标为平台保证合法；真生产按RG阻断 |
| G06-04 | Asset/Instrument法律主体与SaaS签约主体不相同 | 必须独立LegalIssuerRef和代表授权；不得照抄SaaS Tenant法律名 |
| G06-05 | Offering已发布，但当前投资者不Eligible | 按有效披露条件可见，禁止创建新有效认购；M05/M09各持真值 |
| G06-06 | Offering条款或签署文书重大修改，已有Quote/PaymentIntent | 保留旧Instrument/Offering/Document版本和在途订单引用，按条件暂停/重签，不静默覆盖 |
| G06-07 | 有Token合约地址，但Signer未核/法律文书无法后绑定 | M07链事实独立；M05真实认购/交付Guard Fail-Closed |
| G06-08 | 付了SaaS Standard费用就尝试由P后台代客户Mint或释放募集款 | P技术后台不取得资金/Token签名权；RG未通过真实执行必须禁止 |
| G06-09 | 发布接口超时、重复点击或Webhook重放 | 查询原PublishIntent、检查版本/幂等；技术Provider200不等于业务合法发布 |
| G06-10 | Tenant被暂停，已有真实投资者权利/未完资金义务 | M01商业服务受限不删除真实M11/M12/M13/M07事实；按授权保留、查询与移交证据 |

## 4. 下一轮仍需的核对和决策（此文不请求重新批准已批规则）

1. B01将[65候选字段](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)逐字段映射到本稿B01对象、权限、时间精度、来源/留存/恢复；**目前只完成候选对象和主要差异**，不能写“65/65字段通过”。
2. B02补全M04/M05/M06/M07/M08/M09各V1正式ID对应字段字典与业务Guard；此处字段列表是**覆盖主要对象的第一稿**，不是146项完整字段集。
3. B03～B05逐批形成同等粒度，另做146ID、11步、4端完整双向追踪；不新增法定主体批准流程为平台代审。
4. 技术/安全/合规评审需给字段类型、唯一键、RBAC/ABAC、精度/时区、回调幂等和外部Signer/资金执行的真实生产启用条件及用例；**测试均Not Executed**。
5. 若Issuer具体Instrument必须集中募集，DEC-017的M05-F011、M10-F009、M12-F009/F010保持V2；需要该能力的客户不可误用现有V1，须另行用户版本/范围变更决定。

**状态**：本稿全部Draft；DEC-036仅批准技术SaaS优先和职责边界；DEC-029～034共29条产品行为仍Approved，Step04 146/146不变。X-01～13 13/13 Open；193项首次版号146/22/20/5不变；V1整体未Frozen；PR #6 Draft/Open/Unmerged。无UI、研发、真实发行/销售/资金/Token操作。
