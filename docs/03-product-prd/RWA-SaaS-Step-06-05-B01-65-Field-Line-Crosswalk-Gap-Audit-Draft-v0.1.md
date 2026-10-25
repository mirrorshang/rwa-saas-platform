# RWA SaaS｜Step06-05 B01既有65行字段逐项审计、权威映射与待签收清单（Draft v0.1）

> **2026-10-26｜字段审计Draft，Not Approved / Not Executed。** 依据[DEC-036 R04 SaaS技术产品优先](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)；对原[Step05-01共65行候选字段草案](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)进行**完整逐行静态映射**。产品级规则依[Step05-01 Approved v0.3](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)与[跨端状态 Approved v0.2](RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md)、DEC-029/030。**该清单不是65行字段正式签收、不是Schema/权限码/API批准。**

## DEC-037晚于本稿：时间差异结论已由新决策接续（2026-10-26）

本稿曾对**旧Trial商业版本**的65行候选字段核对，以当时DEC-030批准的336h Trial＋720h恢复为核验依据。随后产品负责人已明确批准[DEC-037 Free/Standard永久Free新模式](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)。因此**本稿有关336h/720h“应继续实现”的结论现已失效**，不能被研发误认为新Free当期需求。65行原字段/正式ID对照仍可参考，但应以**[Step06-06逐行Free/Standard迁移映射Draft](RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)**及[现行Step05-01产品PRD](RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)为后续权威；**没有真的修改原字段Schema或迁移任何数据库**。X-01～13仍Open、V1未Frozen。

## 一、核验统计（程序解析原字段表物理行，不表示独立数据列数）

- 原草案**8组、65行**已全部读取，分别**账户5／商业客户6／Tenant11／模拟草稿6／商业KYB10／合同8／商业支付11／门户审计8**，总计65。
- **65行≠65个互不重复的Schema列名**：`commercialCustomerId`出现在商业客户对象（第06行）和Tenant对象（第13行）两处，应理解为**主键/引用外键**，不能产生两个独立商业客户事实。
- `operatorId/authorityRef`源草案是**一个含斜杠的复合字段标记**（第63行），需要工程字段拆解与权限审核；不能直接拿去当API字段名，也不能因拆解擅自增加正式功能ID。
- 仅识别出**可追溯字段行数65/65**、8/8分组；不等于字段准确性、产品/法域适用、实现完整性或QA结果通过。

## 二、完整逐行核对：旧候选字段 → V1正式功能ID → 业务权威/后续整改

下表中的F01编号是本稿**本地行号**，不是Mxx-Fxxx正式功能ID；“候选ID”用于后续业务主责核对，**没有重分配已批准功能归属**。

| 本地序号 | 原草案字段（候选） | 原组 | 候选归属V1功能（必要交叉引用） | 权限/处理边界与审核结论（均Draft） |
|---|---|---|---|---|
| B01-001 | `accountId` | 账户/注册 | M02-F003 | Account身份/认证; I自助注册；P仅安全处理；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-002 | `email` | 账户/注册 | M01-F001/M02-F003 | Account身份/认证; I自助注册；P仅安全处理；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-003 | `emailVerificationStatus` | 账户/注册 | M01-F001 | Account身份/认证; I自助注册；P仅安全处理；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-004 | `registrationIntentId` | 账户/注册 | M01-F004 | Account身份/认证; I自助注册；P仅安全处理；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-005 | `primaryAdminRoleId` | 账户/注册 | M02-F002/M02-F004 | Account身份/认证; I自助注册；P仅安全处理；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-006 | `commercialCustomerId` | 商业客户主体 | M01-F002 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-007 | `legalEntityName` | 商业客户主体 | M01-F002 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-008 | `incorporationJurisdiction` | 商业客户主体 | M01-F002 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-009 | `companyRegistryReference` | 商业客户主体 | M01-F002 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-010 | `representativeIdentityRef` | 商业客户主体 | M01-F002/M02-F001 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-011 | `businessContact` | 商业客户主体 | M01-F001 | CommercialCustomer商用签约主体; I提交，P商业审核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-012 | `tenantId` | Tenant/权益 | M01-F004 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-013 | `commercialCustomerId` | Tenant/权益 | M01-F004 | 引用关系：和序号06同名但不同实体（租户外键），不得按两份商业客户独立真值建表 |
| B01-014 | `tenantStatus` | Tenant/权益 | M01-F006 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-015 | `trialActivatedAt` | Tenant/权益 | M01-F004 | 冲突待修：原草案写14自然日；DEC-030以TrialActivatedAt+336小时作为现行Approved规则 |
| B01-016 | `trialExpiresAt` | Tenant/权益 | M01-F005 | 必须按激活起算336小时，不以自然日边界漂移（批准规则） |
| B01-017 | `recoveryWindowEndsAt` | Tenant/权益 | M01-F006 | 冲突待修：原草案写30天；DEC-030明确到期后720小时，不按自然月/自然日边界 |
| B01-018 | `entitlementVersion` | Tenant/权益 | M01-F005/M19-F001 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-019 | `allowedCapabilities` | Tenant/权益 | M01-F005/M19-F001 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-020 | `activationIntentId` | Tenant/权益 | M01-F006 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-021 | `suspensionReason` | Tenant/权益 | M01-F006 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-022 | `retentionHandoverRef` | Tenant/权益 | M01-F007 | Tenant/Entitlement商用权威; P技术/商业控权，I读自Tenant；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-023 | `resourceId` | 模拟资源与草稿 | M05-F001 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-024 | `resourceTenantId` | 模拟资源与草稿 | M01-F004 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-025 | `originEnvironment` | 模拟资源与草稿 | M01-F005 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-026 | `resourceTruthClass` | 模拟资源与草稿 | M01-F005 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-027 | `promotionDecisionRef` | 模拟资源与草稿 | M01-F006 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-028 | `sourceDraftRevision` | 模拟资源与草稿 | M05-F010 | Draft/Simulation隔离; I操作自己草稿，P仅稽核；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-029 | `kybCaseId` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-030 | `kybTenantId` | 企业商业KYB | M01-F004 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-031 | `submittedEntityVersion` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-032 | `providerReference` | 企业商业KYB | M03-F001/M22-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-033 | `kybDecisionStatus` | 企业商业KYB | M03-F001 | Unknown/NeedsInfo/Rejected不能授予Paid；结论是M01商业主权威，M03仅审核界面 |
| B01-034 | `reviewerId` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-035 | `decisionReason` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-036 | `decisionEffectiveUntil` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-037 | `evidenceBundleRef` | 企业商业KYB | M03-F005 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-038 | `reviewOrAppealCaseRef` | 企业商业KYB | M03-F001 | KYBCase商用结论由M01持有; P/M03有权审，X出证明；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-039 | `planCode` | 合同/Standard | M01-F005 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-040 | `planVersion` | 合同/Standard | M01-F005 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-041 | `quotedAmount` | 合同/Standard | M01-F008 | Commercial Standard定价/税费仍待商业审批；不得写死价格 |
| B01-042 | `quotedCurrency` | 合同/Standard | M01-F008 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-043 | `contractVersion` | 合同/Standard | M01-F003 | 商业SaaS合同主责M01，不移到M06发行文书法定主账；来源草案的M01/M06仅视引用关系 |
| B01-044 | `contractAcceptanceStatus` | 合同/Standard | M01-F003 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-045 | `signingAuthorityRef` | 合同/Standard | M01-F003 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-046 | `manualCommercialExceptionRef` | 合同/Standard | M01-F003 | M01 SaaS商用合同；不混M06发行文书；I合法合同签署；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-047 | `subscriptionId` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-048 | `subscriptionIntentId` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-049 | `commercialPaymentIntentId` | 商业付款/订阅/权益激活 | M01-F008 | 商业支付独立M01，与投资者认购M11、收益M13绝不共用业务账 |
| B01-050 | `paymentProviderTransactionRef` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-051 | `commercialPaymentStatus` | 商业付款/订阅/权益激活 | M01-F008 | VerifiedPaid仅真实商业款证据核验，不等于Tenant已升权 |
| B01-052 | `verifiedPaidEvidenceRef` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-053 | `entitlementActivationStatus` | 商业付款/订阅/权益激活 | M01-F006 | 必须与verifiedPaidEvidenceRef独立状态，原Tenant幂等恢复 |
| B01-054 | `subscriptionEffectiveAt` | 商业付款/订阅/权益激活 | M01-F006 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-055 | `activationResultEvidenceRef` | 商业付款/订阅/权益激活 | M01-F006 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-056 | `reconciliationCaseId` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-057 | `commercialReceiptRef` | 商业付款/订阅/权益激活 | M01-F008 | M01商用资金/订阅权益；X真实商业收款；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-058 | `portalInstanceId` | 门户和运营审计 | M01-F009 | M01 Portal实例/M05可见权威/M20审计；P不得代I发行；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-059 | `portalPreviewOnly` | 门户和运营审计 | M01-F009 | Trial门户仅授权私有预览；Paid也不能自行放行真实金融活动 |
| B01-060 | `offeringVisibilityRef` | 门户和运营审计 | M05-F009 | M01 Portal实例/M05可见权威/M20审计；P不得代I发行；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-061 | `offeringLegalGateRef` | 门户和运营审计 | M05-F008 | 链接M05 P-01～P-07与Issuer自负发行合规/平台RG门；不等于平台法律背书 |
| B01-062 | `operationIntentId` | 门户和运营审计 | M03-F002 | M01 Portal实例/M05可见权威/M20审计；P不得代I发行；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-063 | `operatorId/authorityRef` | 门户和运营审计 | M03-F002/M02-F006 | 原字段名含斜杠（operatorId/authorityRef）不是一个清晰的工程字段；拆成ActorRef及AuthorityEvidenceRef仍为候选，不因此改原65行 |
| B01-064 | `auditCorrelationId` | 门户和运营审计 | M20-F001 | M01 Portal实例/M05可见权威/M20审计；P不得代I发行；保留原草案来源说明，类型/必填/版本/留存待技术审 |
| B01-065 | `beforeAfterStateEvidence` | 门户和运营审计 | M20-F001 | M01 Portal实例/M05可见权威/M20审计；P不得代I发行；保留原草案来源说明，类型/必填/版本/留存待技术审 |

## 三、必须修正或补证的审计差异（不静默回写历史Draft）

| 发现ID | 原字段/产品表现 | 现行应遵守的已批准规则或产品边界 | 补充的技术/产品字段审核项目 | 状态 |
|---|---|---|---|---|
| B01-G01 | `trialActivatedAt`源注释称14自然日，`trialExpiresAt`仍写14天 | **DEC-030 R04：Trial激活瞬间起336小时（14×24h）**；严格后端时钟与边界时刻，I/P按适用时区展示同一瞬间 | UTC字段类型/精度、激活重放、计时冻结/夏令时显示与前后端缓存一致 | Open / Draft |
| B01-G02 | `recoveryWindowEndsAt`源注释称30天恢复 | **DEC-030 R04：试用到期后720小时**受限恢复，禁止以自然月长度或本地日期边界变换 | 720h截止时间独立生成与边界幂等、Tenant只读合法权限 | Open / Draft |
| B01-G03 | 第06与13行`commercialCustomerId`重名 | 实体间FK允许重名，但CommercialCustomer只保留一套M01权威；**65行不是65独立列名** | PK/FK作用域、Tenant链接唯一性、商用客户多Tenant关系法务/业务待审 | Open / Draft |
| B01-G04 | `operatorId/authorityRef`含斜杠 | P运营Actor和操作Authority必须可追溯，不能以一个合成字符串替代真实授权证据 | 候选拆解`operatorActorRef`+`operatorAuthorityEvidenceRef`及审计版本，**不是新官方功能** | Open / Draft |
| B01-G05 | 原合同小节标“M01/M06” | **M01商用SaaS合同/订阅权威，M06单独是Issuer法律发行/认购文书权威**；允许引用但不能互相覆写 | ContractDomainType、ContractVersion、SignerScope区分，不创造M06额外商用收费职能 | Open / Draft |
| B01-G06 | 各商用Payment/Activation可能合为“已付款”状态 | **M01真实商用付款VerifiedPaid≠Tenant PaidActive**；原Tenant恢复并引用原PaymentIntent/ActivationIntent，不能二次扣款或第二租户 | 回执去重/双真款、MoneyType、状态恢复/补偿、错账争议 | Open / Draft |
| B01-G07 | 试用草稿可能随Paid升为生产Offering | **模拟事实禁止提升为真金融事实**；Paid也不是Issuer某项发行已合法或平台RG通过 | ResourceTruthClass及SourceVersion，ProductionExecutionGate/IssuerEvidence/Signer独立引用 | Open / Draft |
| B01-G08 | KYB商业Verified可能被当作项目发行合规证明 | **商业KYB与Issuer资产发行法律审查分开**；客户负责具体发行，平台自身服务另有RG门 | CommercialKYBCase vs IssuerComplianceCase隔离，合法证据Source/Actor/有效期 | Open / Draft |
| B01-G09 | 65行没有穷尽可实施安全/运营契约 | 仍需唯一键/租户隔离、个人及企业材料合法保留、密钥/合同证据、回调幂等和异常调查 | 校验规则表、I/P角色读写、法域数据保留/撤回、M17任务/M18通知/M20日志/M22供应商 | Open / Draft |

## 四、B01分组事实×端侧权限×逻辑操作候选（非代码API）

| 8组 | 权威域和真实负责方 | P/I/V/X最小概念权限 | 逻辑操作（不写HTTP路径） |
|---|---|---|---|
| 账户/注册 | M01/M02账户、唯一原Tenant意图 | I注册/确认自邮箱，P最小安全支持，X邮件验证；V独立投资者账户 | `VerifyEmail`, `ProvisionTrialByOriginalIntent` |
| 商业客户主体 | M01 CommercialCustomer，M02法人关系引用 | I受权代表补证，P只核商业入驻；V不见，X可提供商业KYB来源 | `CreateCommercialCustomer`, `VerifyRepresentativeAuthority` |
| Tenant/权益 | M01 Tenant/商业权益，M19版本Guard | I查询自己租户与升权；P受权暂停恢复且留痕；V不因Paid自动得购买权 | `ReadEntitlements`, `ApplyTrialWindow`, `ActivateOriginalTenant` |
| 模拟资源与草稿 | M05业务草稿、M01环境保护、M20审计 | I写租户私有Draft；P审计，X模拟来源不得冒充真钱/Token | `RetainAllowedDraft`, `CheckTruthClassBoundary` |
| KYB | M01商业准入结果、M03有权审核、M22外部回执 | I提交/补件，P有权Review，X提供证明，V不访问 | `SubmitKYBOriginalCase`, `ReviewOrAppealKYB`, `ReconcileKYBUnknown` |
| 商用合同 | M01价格/合同/Standard意图 | I合法签约人确认，P仅合法商用合同审批，X签署证明 | `ConfirmCommercialContractVersion`, `RequestStandardIntent` |
| 商业付款 | M01钱与订阅，X商用收款 | I付款/看本人账，P实际受权对账，X商业收款，V不可见 | `ReconcileCommercialPayment`, `ActivatePaidSameTenant` |
| 门户与审计 | M01门户实例、M05 Offering发布、M20日志 | I私有预览与合法发布；P仅Tenant/审计/技术，不代Issuer发证券 | `ProvisionPortal`, `CheckIssuerPublicationAndProductionGates`, `AppendAuditEvidence` |

## 五、静态验收用例设计（全部Not Executed）

| 用例 | 输入/触发 | 应具备的可验收断言 |
|---|---|---|
| TB01-01 | 两次相同`registrationIntentId` | 只创建原Tenant一次，重复返回同一引用 |
| TB01-02 | UTC激活边界前后 | 336h时准确只读/受限，不被“第14个本地自然日”提前/延后改变 |
| TB01-03 | 试用结束后720h边界 | 恢复入口与过期行为有一致服务器Side Guard，无误扣款 |
| TB01-04 | 商业KYB NeedsInfo/Rejected/Unknown | 不自动转Paid，保留已批准可用的试用/受限操作，补件沿原Case |
| TB01-05 | 已确认商用付款但升Paid超时 | 查原MoneyIntent与ActivationIntent，同Tenant恢复，不重复收款或新建第二Tenant |
| TB01-06 | 真实两笔支付与同一Webhook两次 | 两笔真钱不丢、一笔重复事件不二次入账 |
| TB01-07 | Trial模拟Token/Money/Investor在升级Paid时存在 | 仅合法草稿按规则保留，模拟事实仍为模拟，不写生产链/钱/名册 |
| TB01-08 | P客服想读取其他Tenant KYB高敏原件 | 无授权拒绝，最小审计；V不能读Issuer商用KYB |
| TB01-09 | Paid已生效但Offering P01～P07/平台RG欠证 | 商用工作台可用，真实Issuer证券销售/钱包Signer/收款未获启用不得发生 |
| TB01-10 | P暂停Tenant但其真实投资者尚有权利/应付款 | M11/M12/M13/M07既有事实不能抹除，按适用权限保全/交接 |
| TB01-11 | 新商业客户与已有Tenant共享相同邮箱 | 账号邮箱≠无条件跨Tenant访问；需独立组织授权 |
| TB01-12 | M01商用合同版本变更，与M06认购文书并存 | 不混淆合同Domain，报价/证据历史引用不被覆盖 |

## 六、审核结论、仍缺事项与工作优先级

- **可静态确认**：65/65原表字段行都已逐项映射到候选权威/正式V1功能引用，8/8组覆盖；识别出1组同名跨对象引用（2行）、1行复合字段命名与上述9项需核对的差异；**未调整原字段表本身**。
- **不可宣布**：65个字段独立唯一、65项字段Approved、Schema完整、已实现精确时间与幂等、审计风险关闭或任何真实商业支付测试Pass。
- **下一步**：对B01-G01～G09逐项给出字段类型/主外键/逻辑读写与验证规格草案，若触及产品既有Rule（如“商业KYB与Issuer项目合规独立”）仅提交重大决策差异；B02逐33个正式V1 ID再补字段/状态/权限/API与异常映射。
- **全项目约束**：193正式功能ID版号**146/22/20/5**不动，Step04 146/146与Step05 29条业务规则不动，13风险Open，四份Frozen及历史DEC/SCOPE不回写，V1未Frozen、PR #6 Draft/Open/Unmerged。

