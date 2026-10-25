# RWA SaaS｜Step06-07 B01永久免费Free／Standard：领域字段、配额、迁移、权限与逻辑API详细PRD（Draft v0.1）

> **2026-10-26｜全篇字段、精确权限/状态名、接口、资源数量、商业收费细则、迁移与测试均Draft / Not Executed。** 业务方向只依据[DEC-037正式商业改版](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)及[现行Step05-01产品PRD](RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)：Free永久、绝大部分V1业务可Sandbox模拟、Standard商业开通与真钱执行严格分离、同Tenant升级、历史真金融义务保护。本文**不新增Mxx-Fxxx编号、版本或套餐**。对[旧65行逐项迁移结果](RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)做候选逻辑对象加深，**不是声明65字段最终批准**。

## 一、交付范围：B01八组对象及唯一业务权威

| B01聚合/既有模块 | 推荐逻辑对象（名称Draft） | 唯一真值 | Free与Standard的分界 |
|---|---|---|---|
| 账户、组织 M01/M02 | Account、CommercialCustomer、Tenant、Membership | M01商业账户与Tenant；M02访问/法人/角色 | Free可安全注册与组织协作；升级沿用原Tenant，不复用别人的企业资料 |
| 产品Plan M01 | PlanCatalogVersion、CommercialEntitlement、Subscription | M01商业权益、商约、订阅；M19读取权限版本 | Free不产收费账/到期倒计时；Standard按合同授权、账期另审 |
| 功能/资源 M01/M19 | EntitlementPolicy、QuotaRule、UsageMeter、QuotaDecision | M01授套餐/权益，M19执行受控能力和限额，M20留审计 | Free并非无限资源，超额可限制**新增消耗**，不默默删现有数据 |
| 模拟资源 M01/M05/M07/M20 | WorkspaceEnvironment、SimulationScenario、ResourceTruthRef | 各业务域保留其模拟事实；M19隔离，M20审计 | Free完成11步演练，不得开启真实认购/生产Signer/真实资金 |
| 商业KYB M01/M03/M22 | CommercialKYBCase、ReviewEvidence | M01商业准入结论；P/M03审；X提供核验证据 | Free不以KYB作为体验前置；Standard升级按适用KYB门 |
| 订阅商约及收费 M01 | SaaSContract、SubscriptionIntent、CommercialPaymentIntent、PaymentProof | M01 SaaS商业款，不能混M11认购款 | Free无支付；Standard商约/应付/VerifiedPaid与授权益独立 |
| 升级与降级 M01/M17/M19 | UpgradeCase、EntitlementActivation、RestrictionCase | M01写商权，M17任务，M19执行权限 | 钱已收但激活失败原Tenant恢复；Standard失效后旧真实义务继续受权处理 |
| 门户及服务连续 M01/M05/M20 | PortalInstance、ServiceContinuityCase、HandoverEvidence | M01门户实例/商业关停，M05真Offering发布，M20审计 | Free仅Sandbox门户；Standard真门需M05和RG；旧权益不能因订阅失效抹除 |

## 二、候选数据字典：对象身份、必填条件、版本、敏感级别和写入者

下表为**业务契约候选**，`必填条件`描述应校验何时存在，**不是数据库NOT NULL或固定工程类型决定**；所有外部/法定时间点及状态名称由后续架构、法域和安全审核。

| 对象 | 候选字段组（类型示例，非Schema） | 业务何时必需 | 来源与写入权限 | 敏感与版本校验 |
|---|---|---|---|---|
| Account/Customer | `accountRef`, `verifiedEmailRef`, `registrationIntentRef`, `commercialCustomerRef`, `representativeAuthorityRef` | 创建Free Tenant前邮箱及唯一Intent；主体/代表信息随Standard请求按需要补全 | I自己/组织代表提交，M02校验，P仅适法访问 | 邮箱PII，代表身份证明加密引用；跨Tenant身份不可默认共用授权 |
| Tenant | `tenantRef`, `customerRef`, `ownerRef`, `tenantRevision`, `createdAt`, `operationalRestrictionRef` | Free创建即必有唯一Tenant；付费不得新建另一个替代原Tenant | M01创建与经营状态，I仅读写受权本组织设置 | Tenant隔离服务端判定；`trialExpiresAt`不得控制当前Free资格 |
| Plan/Entitlement | `planCode`（Free/Standard）、`planVersion`, `entitlementRef`, `entitlementRevision`, `effectiveAt`, `commercialContractRef` | Free初始自动获商业权益；Standard只有商用前置满足后授予 | M01商用权威；M19按受权版本消费 | Free无自动到期`expiresAt`；Standard账期依合法合同另审 |
| QuotaPolicy | `policyRef`, `resourceKind`, `environmentScope`, `maxAllowed`, `unit`, `windowKind`, `counterScope`, `policyVersion` | 对启用配额的Free/Standard资源必有规则/适用范围；若未配置须阻断有成本/风险操作而非默认无限 | P合法SaaS运营审批规则、M19执行；I可查询本租户剩余额度 | 规则历史生效时点/版本；不能覆盖已有业务事实 |
| UsageMeter/QuotaDecision | `usageRef`, `tenantRef`, `resourceRef`, `consumptionIntent`, `observedAmount`, `reservedAmount`, `decisionAsOf`, `quotaPolicyVersion`, `releaseRef` | 受计量动作预留/消费/取消时写入 | M19配额服务/相应领域；I读摘要，P有权排查 | 原Intent去重、并发、回滚释放和Unknown；计量不变更M11真钱 |
| SandboxObject | `environmentRef`, `truthClass`, `simulationScenarioRef`, `sourceDraftVersion`, `testnetNetworkRef`, `objectRef` | 创建模拟订单、Token、资金、名册及收益时强制存在环境标记 | Issuer I模拟操作、相应业务领域，M19/M20只执行隔离/审计 | Testnet上真Tx不表示真实法定权益；生产凭证不复用于Sandbox |
| KYBCase | `kybCaseRef`, `tenantRef`, `submittedEvidenceVersion`, `commercialKYBDecision`, `reviewerAuthorityRef`, `providerEvidenceRef`, `recheckReason` | Free可没有；升级Standard的商业准入检查时必核 | I上传，M03受权商业审核，M01持最后商业结论，X独立回执 | PII/企业高敏、合法保留与申请复审条件，Unknown不能当Verified |
| StandardContract | `contractVersion`, `planRef`, `quotedAmountAndCurrency`, `quoteVersion`, `signerAuthorityRef`, `acceptanceEvidenceRef` | Standard订阅请求按适用商约；Free仅记录必要平台服务条款版本 | I合法签约代表；P/M01管理商业合同 | 价格/周期/税费TBD；M01商约不可改写M06金融文书 |
| SaaSPayment | `commercialPaymentIntentRef`, `originalProviderRef`, `currencyAndPrecision`, `observedStatus`, `verifiedPaidEvidenceRef`, `reconciliationCaseRef` | Standard发生真实商业支付时才存在 | 商用X实际付款事实→M01核实，P仅受权对账；V无权 | 绝不复用M11/M13真钱账户或状态；重放/两笔款分开 |
| Upgrade/Activation | `upgradeIntentRef`, `tenantRef`, `kybCaseRef`, `contractVersion`, `commercialPaidEvidenceRef`, `activationIntentRef`, `activationState`, `entitlementRevision` | Free申请升级后按阶段填入；激活必须有证据/合法例外 | I申请，M01唯一写权益，M17/P异常恢复 | 商用款VerifiedPaid≠已赋Standard；原Intent恢复不能重复收款 |
| Restricted/Continuity | `serviceRestrictionKind`, `effectiveAt`, `activeFinancialObligationsRef`, `authorizedContinuityActionsRef`, `handoverEvidenceRef` | Standard暂停/退租且有真在途业务/合法权利时必须管理 | P/M01服务经营，I合法金融责任人，X真实资金/Signer执行 | 不得删除M07/M11/M12/M13真值；安全封禁需明确合法最低继续渠道 |
| Issuer production gate（仅引用） | `issuerOfferingRef`, `issuerLegalEvidenceVersion`, `productionOperationType`, `platformRGRef`, `authorizedExternalExecutorRef` | 真主网、真订单、真持款/支付与名册等不可逆动作前核验 | M05/M09/M07/M11/M12/M13业务权威＋Issuer/X，P仅自身RG | **不等于StandardActive**，仍然条件性Fail-Closed |

**待定数量**：Free项目数、模拟投资者、测试Token额度、席位、存储、第三方模拟/测试请求、并发、超配额申诉机制、Standard资源上限等全部**TBD**，不得由本PRD直接赋默认数值。

## 三、Quota决策：不会到期、可以控成本但不误删已形成事实

| 状态/场景 | 建议产品规则（Draft） | 必需的证据或后续决策 |
|---|---|---|
| Free正常使用 | 检查套餐和规则版本、Tenant归属、当前用量、环境；允许新增可用模拟资源 | 每个资源的单位/累积窗口/系统限流和反滥用规则TBD |
| 已达到免费Quota | 返回明确ResourceLimitReached＋可升级/调整资源说明；**阻断本次新增/额外调用**，保留已存在草稿/模拟历史和合法导出 | 额度实际值、Grace、计费和用户提示文案另审 |
| 超额请求并发/Provider超时 | 原`consumptionIntent`幂等复核，防重复预留/扣资源；Unknown先查证据 | 事务一致性/最终计费控制由技术审 |
| 资源删减/撤回 | 依资源属性调整用量；如果外部实际付费请求已发生须留足审计/财务证据 | 是否允许用户自助清理、资源恢复/补偿TBD |
| P因安全/滥用限制Free | 明确SuspensionReason、范围、期限/复核者与受影响对象；不生成“Free因使用太久到期” | 安全事件标准、申诉/日志保存须专业审 |
| Standard失效后高于Free资源上限 | 已有数据不自动删；停止新增超出新权限的业务，不得以Quota覆盖真实义务处置 | 超量存储/访问、商业数据导出和长期留存策略TBD |

## 四、商业权益、环境和生产执行：三个彼此独立的状态轴

| 轴 | 候选状态（Draft） | 严格产品断言 |
|---|---|---|
| ① 商业权益 M01 | FreeActive、UpgradeRequested、StandardApplying、StandardActive、StandardRestricted | 没有FreeExpired；商业VerifiedPaid不等于StandardActive |
| ② 功能权限/环境 M19 | SandboxEnabled、QuotaBlocked、TestnetAllowed、ProductionCommerciallyEligible、SecuritySuspended | 模拟测试环境凭证与生产凭证独立；Quota不等于付费未确认 |
| ③ 真实金融业务领域＋RG | NotAuthorized、AwaitingEvidence、AuthorizedForScopedOperation、Suspended、Unknown | StandardActive仅是商业必要条件，不授Issuer金融发行许可，也不授P后台Signer/持款权 |

**建议严格请求判定顺序（Draft）**：Authenticated → TenantBound/RoleScoped → PlanEntitlementChecked → EnvironmentAndTruthClassMatched → QuotaIfApplicable → (若生产) Issuer/Offering与特定动作Guard、RG及X授权核实 → 原Intent幂等 → 执行或受权出证。**安全/法律/实际金融缺证据时Fail-Closed，Free仍可进行合法Sandbox工作**。

## 五、P/I/V/X角色×操作候选矩阵（非最终RBAC）

| 操作 | I企业合法用户 | P SaaS运营 | V投资者 | X外部 |
|---|---|---|---|---|
| 创建Free、成员/资产草稿 | 自己Tenant受权范围允许 | 按技术/安全身份最小只读及诊断 | 无Issuer权限 | 邮件验证等 |
| 查看Free额度/模拟业务 | 本Tenant查看并模拟 | 查看合法运营用量、受限高敏日志 | 仅Sandbox/模拟身份 | 经受控测试Provider |
| 配置全平台Quota规则 | 仅查看本Tenant权益、无法编辑全局 | 有权M19商业/安全审批，分权留痕 | 无 | 不获得跨Tenant权限 |
| 商业KYB/升级Standard | 有权企业代表提交、查看可披露结果与签署 | P/M03有权审/M01赋商权 | 不接触商约/企业KYB | 合法商业KYB/PSP |
| 商用付款异常与恢复 | 查自己的Intent/申请恢复 | 受权M01/M17查原商款、原Tenant；不得补造真钱回执 | 无 | X真实商用付款证据 |
| 真Offering/Token/资金 | I依法授权人员提出并由实际业务权威审批 | **不能因套餐管理员身份代发行/持管/Signer** | 仅真实Eligible受权行为 | 依法持款/登记/Signer执行 |
| Standard到期且在途真钱 | 合法继续履约/导出/移交申请 | 业务不中断必要通道及审计，停新增未获授权业务 | 仍依法查询原持仓/款项 | 按法定责任继续实际履约 |

## 六、逻辑接口契约：输入、证据、错误、幂等（不是实际URL）

| Draft Operation | 输入/证据 | 输出或异常类别 | Owner与恢复 |
|---|---|---|---|
| `CreateFreeTenant` | AccountVerified、OriginalRegistrationIntent | ExistingTenantRef/FreeActive；DuplicateIntent/Unauthorized | M01/M02，重复创建返回同原Tenant |
| `ReadCommercialEntitlement` | TenantScope、EffectivePolicyVersion | Free/Standard当前权威＋受限原因；StaleVersion | M01权威、M19读取；不得用旧缓存放真钱 |
| `EvaluateCapabilityAndQuota` | Tenant、ActionType、Environment、QuotaPolicyVersion、ConsumptionIntent | Allow/QuotaBlocked/EnvironmentMismatch/Unknown | M19；不据此创造M11真钱 |
| `SimulateIssuerFlow` | SandboxSession、OwnerScope、模拟各领域对象Ref | Simulated result/Testnet technical evidence；NoProductionRights | 各领域，M19隔离；明确仅模拟 |
| `SubmitOrReviewCommercialKYB` | CaseRef、EvidenceVersion、ActorAuthority | NeedsInfo/Reviewed/Unknown/Rejected | I提交、M03有权审、M01商用结论；X证据 |
| `RequestStandardUpgrade` | OriginalTenant、KYB/合同版本、UpgradeIntent | Pending/NeedsEvidence/EligibleToPay | M01；不提前产生真钱Intent |
| `ReconcileCommercialPayment` | OriginalPaymentIntent、X实际收款回执 | VerifiedPaid/Unknown/Disputed | 商用X→M01，不能重复扣费 |
| `ActivateStandardSameTenant` | KYB/合同/VerifiedPaid或合法例外＋原激活Intent | StandardActive/ActivationUnknown/NeedsInfo | M01改商权，M17异常，不能改Issuer真发行 |
| `RestrictOrResumeCommercialService` | ContractScope、Reason、AuthorizedPActor、ExistingObligationsRef | Restricted/ContinuityRequired/Restored | M01/M19与有权运营，真实历史义务另轨 |
| `EvaluateProductionExecution` | Issuer+Offering+ActionType+Actor/Signer+PlatformRG+EvidenceVersion | NotEnabled/ScopedAllowed/Unknown | 各真业务领域＋X，P不得单凭Standard写“Approved” |

## 七、关键异常与未来UAT草案（全部Not Executed）

| ID | 测试前提 | 应证明的产品结果 |
|---|---|---|
| B01-UT01 | Free注册后长期未付款 | 无336h/720h自动只读、账号年龄不影响已允许Sandbox |
| B01-UT02 | 同一注册Intent并发请求 | 只获得原Tenant/权益一次 |
| B01-UT03 | Free连续模拟从资产到退出11步 | 各模拟对象显著标Sandbox，没真钱/正式名册/主网Signer |
| B01-UT04 | Free测试网Token已被链上确认 | 只能认定技术Testnet事实，不能宣称有合法资产Token权益 |
| B01-UT05 | Free达到用户配额 | 拒绝新增耗费操作，已有草稿/模拟历史保留 |
| B01-UT06 | 两个同步资源申请冲突 | 资源预留原Intent正确去重/回退，不能超限或误扣 |
| B01-UT07 | 商业KYB Missing/Rejected/Unknown | Free仍按安全配额可用，不可升级Standard；原案受权补证 |
| B01-UT08 | 收了真正SaaS商业款却升权Failed/Unknown | 原Tenant/原支付证据恢复，不重扣、不重复开租户 |
| B01-UT09 | M01商款与M11发行认购款同时存在 | 两种账、收款主体和业务状态互不替代 |
| B01-UT10 | 已开Standard但Issuer没有Signer或真实资金Guard | 不能真主网Mint/发行/认购，允许有权配置Draft |
| B01-UT11 | Standard失效仍存在真实持有人/应付款 | 停新的未授权行为，但保留合法查询/受权履约与交接 |
| B01-UT12 | P客服请求客户钱包私钥或试图真实划拨 | 无默认权限，拒绝并记录审计 |
| B01-UT13 | 原Free模拟订单试图“升级成Production订单” | 阻断状态翻转，真实Intent需合法独立新建 |
| B01-UT14 | V投资者被Free演示账户混为真实投资者 | 演示与生产身份不可跨域自动继承 |
| B01-UT15 | Standard商用订阅争议/退款，Offer有待付真钱 | 商用争议不擦除合法金融主账，职责交接必须有证据 |
| B01-UT16 | P修改免费Quota生效版本 | 只对适用对象与时点生效，历史计量保留，旧客户端缓存不得越权 |

## 八、尚需高价值产品决策的内容（只列门，不当作已批准）

- **Q-B01-01｜免费配额设计**：哪些资源应有“硬限制”、哪些仅限流、哪些可按历史计费；所有具体阈值仍TBD。**不以任何数值作为默认业务事实**。
- **Q-B01-02｜Standard商业计划**：订阅账期、定价、自动续费/是否允许人工企业合同例外、支付币种及税票由商业责任人另定。
- **Q-B01-03｜Sandbox链执行策略**：仅模拟 or 可选择受控测试网；一旦选测试网需单独评估真实Gas/免费成本/链上资产误导。
- **Q-B01-04｜Standard受限后的数据与存续义务**：对仍有真实金融义务的客户，保留最低查询、授权支付/移交的合法责任具体执行路径；**不能因为欠费禁止履行法律义务**。
- **技术/安全门**：全对象Schema、RBAC/ABAC、限流算法与配额并发、迁移脚本、生产双Guard及实际测试，全部Draft。

**下一工作包**：[B02 M04/M05/M06/M07 共33项正式V1逐ID字段、状态、权限和接口映射](RWA-SaaS-Step-06-08-B02-33-V1-Functions-Field-State-Permission-API-Crosswalk-Draft-v0.1.md)，随后B03～B05及146项双向覆盖。**四份Frozen、历史DEC/SCOPE原文、193项版号146/22/20/5不变；DEC-028 X01～13全部Open；V1未Frozen、PR #6 Draft/Open/Unmerged。**
