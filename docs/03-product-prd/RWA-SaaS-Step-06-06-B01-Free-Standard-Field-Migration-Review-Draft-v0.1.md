# RWA SaaS｜Step06-06 B01 65行旧Trial字段迁移审查：永久Free/Standard（Draft v0.1）

> 2026-10-26。全部字段/enum/API/RBAC及迁移代码均Draft / Not Executed。依据DEC-037商业版本新决定。本稿不是65项字段Approved，也不更改原Step05-01字段Draft v0.2或旧DEC-019/029/030；现行产品规则以新的Step05-01 Free/Standard产品PRD v0.4为准。

## 一、逐行审计结果

原字段源文件：[65行字段草案](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)。共有**65个字段表物理行、8组**：账户/注册 5、商业客户主体 6、Tenant/权益 11、模拟资源与草稿 6、企业商业KYB 10、合同/Standard 8、商业付款/订阅/权益激活 11、门户和运营审计 8。**全部65/65行**都已在下表获得新商业模式处理建议；不代表独立列名、法域、工程或测试签收。

**需要废止的旧产品时限**：trialExpiresAt和recoveryWindowEndsAt不再参与Free权限判断；trialActivatedAt如保留仅作历史事件引用。336h Trial和720h恢复窗口均被[DEC-037](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)取代。

仍需区分同名主外键commercialCustomerId（在原65行中出现两次），以及复合候选名operatorId/authorityRef（拆为Actor与AuthorityRef待工程审）。

## 二、65行逐项映射（FS编号是本地行号，不是正式Mxx-Fxxx功能ID）

| 行 | 原候选字段 | 原分组 | 当前处理建议（Draft） | Free/Standard新规则解释 | 分类 |
|---|---|---|---|---|---|
| FS-001 | accountId | 账户/注册 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-002 | email | 账户/注册 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-003 | emailVerificationStatus | 账户/注册 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-004 | registrationIntentId | 账户/注册 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-005 | primaryAdminRoleId | 账户/注册 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-006 | commercialCustomerId | 商业客户主体 | 保留主外键关系 | 原表出现2行，分别商业客户主键与Tenant关联FK，非两个主账 | DATA-OWNER |
| FS-007 | legalEntityName | 商业客户主体 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-008 | incorporationJurisdiction | 商业客户主体 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-009 | companyRegistryReference | 商业客户主体 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-010 | representativeIdentityRef | 商业客户主体 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-011 | businessContact | 商业客户主体 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-012 | tenantId | Tenant/权益 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-013 | commercialCustomerId | Tenant/权益 | 保留主外键关系 | 原表出现2行，分别商业客户主键与Tenant关联FK，非两个主账 | DATA-OWNER |
| FS-014 | tenantStatus | Tenant/权益 | 修改 | 原Trial/ExpiredReadOnly状态换FreeActive/Standard等独立状态轴 | PLAN-STATE |
| FS-015 | trialActivatedAt | Tenant/权益 | 历史只读 | 原Trial起点不再驱动永久免费Free到期 | TIME-REPLACED |
| FS-016 | trialExpiresAt | Tenant/权益 | 弃用Free到期Guard | Free无到期时钟，不按336小时转只读 | TIME-REPLACED |
| FS-017 | recoveryWindowEndsAt | Tenant/权益 | 弃用Free恢复Guard | 720小时恢复窗口取消；仅历史旧Trial兼容数据 | TIME-REPLACED |
| FS-018 | entitlementVersion | Tenant/权益 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-019 | allowedCapabilities | Tenant/权益 | 修改 | M19按Plan、Sandbox、Quota和真实生产RG独立判定 | CAPABILITY |
| FS-020 | activationIntentId | Tenant/权益 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-021 | suspensionReason | Tenant/权益 | 修改 | Free不因注册时长过期，只按安全/滥用/资源等独立限制 | CAPABILITY |
| FS-022 | retentionHandoverRef | Tenant/权益 | 加强 | Standard失效后旧真实资金/名册/Token与合法义务不得抹除 | CONTINUITY |
| FS-023 | resourceId | 模拟资源与草稿 | 加强 | Free允许完整Sandbox模拟；绝不升级模拟真钱真权利 | SIMULATION |
| FS-024 | resourceTenantId | 模拟资源与草稿 | 加强 | Free允许完整Sandbox模拟；绝不升级模拟真钱真权利 | SIMULATION |
| FS-025 | originEnvironment | 模拟资源与草稿 | 修改 | Sandbox/Testnet/Production环境分离；测试网有技术事实但无真钱证券权利 | SIMULATION |
| FS-026 | resourceTruthClass | 模拟资源与草稿 | 修改 | 模拟资金、Token、投资者、名册和收益永不得状态翻转为生产 | SIMULATION |
| FS-027 | promotionDecisionRef | 模拟资源与草稿 | 修改 | Free转Standard可复用草稿，不提升模拟金融真值 | SIMULATION |
| FS-028 | sourceDraftRevision | 模拟资源与草稿 | 加强 | Free允许完整Sandbox模拟；绝不升级模拟真钱真权利 | SIMULATION |
| FS-029 | kybCaseId | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-030 | kybTenantId | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-031 | submittedEntityVersion | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-032 | providerReference | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-033 | kybDecisionStatus | 企业商业KYB | 条件保留 | Free可无商业KYB，Standard升级必须按原案合规判断；Unknown不可通过 | KYB |
| FS-034 | reviewerId | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-035 | decisionReason | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-036 | decisionEffectiveUntil | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-037 | evidenceBundleRef | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-038 | reviewOrAppealCaseRef | 企业商业KYB | 条件保留 | Free不强制KYB，Standard升级继续必要KYB与复核 | KYB |
| FS-039 | planCode | 合同/Standard | 修改 | 原仅Standard改为Free和Standard，价格仍未确定 | PLAN-STATE |
| FS-040 | planVersion | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-041 | quotedAmount | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-042 | quotedCurrency | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-043 | contractVersion | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-044 | contractAcceptanceStatus | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-045 | signingAuthorityRef | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-046 | manualCommercialExceptionRef | 合同/Standard | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-047 | subscriptionId | 商业付款/订阅/权益激活 | 条件保留 | Free可有Entitlement，无需虚构已付款Subscription | PLAN-STATE |
| FS-048 | subscriptionIntentId | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-049 | commercialPaymentIntentId | 商业付款/订阅/权益激活 | 条件保留 | 只有Standard实际商业付费需要；不能与M11募集资金混账 | COMMERCE |
| FS-050 | paymentProviderTransactionRef | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-051 | commercialPaymentStatus | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付款，Standard真实商业实付不等于已开通 | COMMERCE |
| FS-052 | verifiedPaidEvidenceRef | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-053 | entitlementActivationStatus | 商业付款/订阅/权益激活 | 修改 | FreeActive与StandardApplying/Active相分离 | PLAN-STATE |
| FS-054 | subscriptionEffectiveAt | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-055 | activationResultEvidenceRef | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-056 | reconciliationCaseId | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-057 | commercialReceiptRef | 商业付款/订阅/权益激活 | 条件保留 | Free不要求付费/Standard保留商用合同付款并与生产Gate分离 | COMMERCE |
| FS-058 | portalInstanceId | 门户和运营审计 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-059 | portalPreviewOnly | 门户和运营审计 | 修改 | Free明确Sandbox Portal，Standard门户开放受Offering与RG约束 | CAPABILITY |
| FS-060 | offeringVisibilityRef | 门户和运营审计 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-061 | offeringLegalGateRef | 门户和运营审计 | 加强 | Issuer具体发行合规与平台自身RG分离，Standard不自动开真实认购 | PRODUCTION |
| FS-062 | operationIntentId | 门户和运营审计 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-063 | operatorId/authorityRef | 门户和运营审计 | 待拆候选 | 原复合字段候选拆操作人和权限证明，工程类型未审 | SECURITY |
| FS-064 | auditCorrelationId | 门户和运营审计 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |
| FS-065 | beforeAfterStateEvidence | 门户和运营审计 | 保留并重审 | 仍按原Tenant/权限最小化处理，具体类型/必填/RBAC/API均Draft | GENERAL |

## 三、候选新增/拆分对象（全部Draft，不新增193正式功能ID）

| 逻辑域 | 候选字段示例 | 禁止的错误解释 |
|---|---|---|
| 商业Plan与权益 | commercialPlan=Free/Standard、entitlementVersion、subscriptionStatus、upgradeIntentRef | 不能从Free账户年龄推导过期，Standard付款不等于真实发行能力 |
| Free资源和安全 | freeQuotaPolicyRef、usageSnapshotRef、quotaBlockReason、securitySuspensionRef | 超配额不是TrialExpired，不能直接删除发行记录 |
| 模拟与环境 | sandboxEnvironmentRef、truthClass、testnetExecutionRef、sourceDraftVersionRef | 测试Token/资金/订单/名册不可通过状态变更成为真实法律权利 |
| Standard商业KYB/付款 | commercialKYBCaseRef、commercialPaymentIntentRef、verifiedPaidEvidenceRef、activationIntentRef | Free不强制实际付款；商用款与M11/M13发行真钱分账，原Tenant恢复 |
| 真实金融/平台自身生产门 | issuerComplianceEvidenceRef、offeringExecutionGuardRef、platformRegulatedActivityGateRef、externalSignerRef、externalFundHolderRef | 付费订阅不授予法域、发行、真实钱包/Signer或资金托管许可 |
| 欠费后义务与移交 | historicFinancialObligationsRef、serviceContinuityCaseRef、handoverEvidenceRef | 商业失效不能抹除已形成法律权利/实际真款 |
| 运营权限证据 | operatorActorRef、operatorAuthorityEvidenceRef | 原复合名拆分不等于新增功能编号 |

## 四、变更前后业务状态与迁移约束

| 旧状态及触发 | DEC-037后的现行语义 | 尚需审查的技术规格 |
|---|---|---|
| TrialActive→ExpiredReadOnly（336h） | 不再存在基于使用时间的Free到期 | 旧数据仅历史引用，新FreeActive状态与M19 Guard |
| Trial过期720h后不能恢复 | 永久Free持续可配置/模拟（安全/配额例外） | 旧Tenant数据接续、按合法留存保护 |
| Trial→Paid | Free→Standard同Tenant、成员/合法草稿可复用 | 原Intent、合同/KYB/商业实付、Entitlement独立幂等 |
| PaidActive立即真实上链/购买 | StandardActive仅商业权益；Offering+平台RG+X受权单独核验 | 环境、Issuer/Offering/投资者、资金/Token执行Guard |
| Trial模拟收/付款/持仓升级成真 | 模拟事实不得生产化，真实系统按合法新Intent/证据形成独立真值 | 数据分区、Testnet/Production凭证及权限隔离 |

## 五、下一步字段审查与验收（目前Not Executed）

完整数据类型、主外键唯一性、最小权限、敏感资料留存、Free资源用量/限额并发、Standard合同周期和价格、模拟Token测试网/主网隔离、旧Trial账户实际迁移与真实资金异常均未批准或测试。后续将本映射与[Step06-04首批B01/B02 PRD](RWA-SaaS-Step-06-04-Generic-SaaS-B01-B02-Field-States-Permissions-API-Draft-v0.1.md)及[Step06-05旧字段审计](RWA-SaaS-Step-06-05-B01-65-Field-Line-Crosswalk-Gap-Audit-Draft-v0.1.md)双向复核；旧审计的336/720h结论作为历史，不可当现行业务Rule。

193项版号V1 146/V2 22/V3 20/TBD5不变；DEC-028 X01～13仍13/13 Open；V1整体未Frozen，PR #6 Draft/Open/Unmerged。无真实收费/发行/链上执行及实测授权。
