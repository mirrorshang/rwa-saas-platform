# RWA SaaS｜Step05-01 企业入驻、14天Trial、KYB、Standard订阅字段级PRD（Draft v0.2）

> **状态：仅Step05-01-R01～R03的业务规则已按[DEC-029](../../decisions/DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)正式Approved。** 本文65个字段候选、精确状态枚举、API/验证算法及验收脚本**仍Draft，等待逐场景评审**；不代表Step05-01字段级规格Frozen、UI/代码或真实商业支付授权。

**历史资料与唯一权威**：[Step05-01可视化业务v0.1 Draft](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)保留原文；[DEC-019](../../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)继续批准14自然日免费受限Trial、无需预绑定支付、先Trial后KYB、商业付款前KYB、唯一Standard套餐、试用到期只读+30天恢复，以及已发行真实权利的留存交接。[Step02四泳道v0.4勘误版](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-DEC019-Onboarding-Corrected-v0.4-Draft.md)为当前入驻时序参考。

## 一、正式批准规则与Draft区分

| 决策 | 已批准（Approved，DEC-029） | 未批准（仍Draft） |
|---|---|---|
| **R01：Trial升级** | 原Tenant和允许保留的合法草稿/组织设置继续；模拟投资者、款项、Token、名册、收益**绝不自动变成生产事实** | 具体环境/记录标签、迁移字段、数据库操作和逐类草稿提升权限 |
| **R02：KYB未通过** | 不立即删除受限Tenant；依据Trial/到期规则受限使用，在合法条件下补件与复核，未通过不可绕过正式商业KYB Gate | 申诉期限、可重提次数、拒绝理由码、法域数据留存期限 |
| **R03：款付但未开通** | 查原商业付款与原升权意图，**仅在确认合法付费条件后恢复同一Tenant的授权**，不重复扣费或建立租户 | 自动重试策略、支付商、付款最终性规则、内部补偿算法 |

## 二、页面组与业务四端交接

| 顺序 | 企业I端操作/页面 | 平台P端与真实X服务 | V投资者门户实际行为 | 唯一业务结果 |
|---|---|---|---|---|
| ① 注册 | 邮箱注册、验证、已有账户找回 | M01创建Tenant、M02初始管理员；X邮件验证服务 | 不介入 | 同一Trial Tenant已验证 |
| ② Trial | 剩余14天、草稿、模拟发行与门户私有预览 | M19/M20受限权限与环境隔离 | 不对公众开放真实KYC/购买 | 模拟数据不生成生产资金/Token事实 |
| ③ 商业KYB | I提交企业/受权代表、补件、复核申请 | P/M03审核、X/M22适格核验 | 不共享投资者KYC | M01商业KYB有效/拒绝/Unknown |
| ④ 合同/Standard | I查看一款Standard、确认合法商业合同 | M01受权合同版本/合法企业例外 | 不介入 | 合同与当前订阅意图匹配 |
| ⑤ 商业付款 | I确认商业付款并查看原进度 | X商业支付、M01核验真实付款；非M11募集款 | 不介入 | 真实商业Paid Evidence |
| ⑥ 同Tenant升级 | I保留受权草稿和组织，正式工作台 | M01幂等授权、M03异常、M20审计 | Issuer标准门户继续按M05独立发布 | Paid权限 ≠ 真实发行生产许可 |
| ⑦ Offering合法发布 | I配置真实Instrument、Offering及Signer | 适格X与M04/M05/M06/M07/M11等实际Gate | M08仅展示依法允许的真实Offering | Paid+具体发行前置均满足才可合法购买 |

## 三、字段级数据字典（共65项字段候选，**全部Draft**）

字段候选不是数据库已经采用的列名，`enum`不是被批准的真实状态代码；精确必填、加密、唯一约束、时间精度、可空性等需要开发技术及实际法律责任人后续审查。**默认跨Tenant隔离、最小访问、引用敏感资料而不记录明文密钥**。实体/字段均必须带明确的owner（M01/M02/M03/M19/M20/M22）；P端不建立第二份Tenant/付款主账。

### 账户/注册（M01/M02）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `accountId` | string/UUID | 验证身份与租户管理员的稳定账户标识 |
| `email` | string/email | 待验证/已验证分开；同邮箱跨租户授权不可自动合并 |
| `emailVerificationStatus` | enum | 未验证不得认为注册已完成 |
| `registrationIntentId` | string/unique | 重复注册或超时先查原创建意图 |
| `primaryAdminRoleId` | string/ref | 初始受权管理员不等于法定签名人 |

### 商业客户主体（M01）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `commercialCustomerId` | string/UUID | 购买SaaS的商业实体，不等于每个Instrument的合法发行人 |
| `legalEntityName` | string | 真实企业注册名称及版本 |
| `incorporationJurisdiction` | region/string | 注册法域；不自动推断产品合法发行法域 |
| `companyRegistryReference` | string? | 法域条件性企业登记标识 |
| `representativeIdentityRef` | ref | 企业受权签约/审核代表 |
| `businessContact` | email/string | 受限于合法联络目的与可访问人 |

### Tenant/权益（M01/M19）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `tenantId` | string/unique | Trial至Paid始终同一个ID（R01/R03） |
| `commercialCustomerId` | FK | 与SaaS买方绑定 |
| `tenantStatus` | enum | Trial/只读恢复/Paid/受限/Unknown彼此不混淆 |
| `trialActivatedAt` | timestamp | 14自然日试用起算；具体计时规则Draft |
| `trialExpiresAt` | timestamp | 14天到期，不自动扣款 |
| `recoveryWindowEndsAt` | timestamp | 到期后30天受限恢复；时区/临界点Draft |
| `entitlementVersion` | int/ref | M19能力Guard读取版本，防止旧权限缓存 |
| `allowedCapabilities` | ruleset/ref | Trial不得生产KYC、真实付款、法定登记、Mint、Claim |
| `activationIntentId` | string/unique | 一次合法升Paid申请只对应原Tenant |
| `suspensionReason` | enum? | 按已发行义务保护与安全状态区分 |
| `retentionHandoverRef` | ref? | 已有真实金融权利依法保留/移交 |

### 模拟资源与草稿（M01/M05/M20）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `resourceId` | string/UUID | 资源自身身份及Tenant归属 |
| `resourceTenantId` | FK | 每次服务端按租户鉴权 |
| `originEnvironment` | enum | 模拟、Sandbox、Production来源不可默默互换 |
| `resourceTruthClass` | enum | 合法草稿与模拟资金/投资者/Token/登记等事实分离 |
| `promotionDecisionRef` | ref? | R01只保留合法草稿，生产事实必须重新授权创建 |
| `sourceDraftRevision` | ref/int | 保留草稿版本及更新审计 |

### 企业商业KYB（M01/M03/M22）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `kybCaseId` | string/UUID | 与投资者KYC完全不同的商业客户案件 |
| `kybTenantId` | FK | 案件跨Tenant数据隔离 |
| `submittedEntityVersion` | ref/hash | 原提交资料不可无痕覆盖 |
| `providerReference` | string? | X核验服务原案件回执 |
| `kybDecisionStatus` | enum | 待审/补件/复核/通过/拒绝/过期/Unknown独立 |
| `reviewerId` | ref? | P受权审查人员及操作历史 |
| `decisionReason` | code/ref? | 可披露原因和调查秘密分别控制 |
| `decisionEffectiveUntil` | timestamp? | 适用期限与重新审核条件 |
| `evidenceBundleRef` | hash/ref | 高敏文件受控访问及审计 |
| `reviewOrAppealCaseRef` | ref? | R02允许合法补件/复核但不承诺无限次数 |

### 合同/Standard（M01/M06）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `planCode` | enum=Standard | 首期唯一正式付费套餐 |
| `planVersion` | string/ref | 保留商业权益生效版本 |
| `quotedAmount` | decimal? | 价格未批准，精度/税费待专项 |
| `quotedCurrency` | currency? | 商业SaaS支付，不等于投资者USDT/USDC认购款 |
| `contractVersion` | ref/hash | 必须与报价/订阅意图关联 |
| `contractAcceptanceStatus` | enum | 提交/签署回执不自动等于法律有效 |
| `signingAuthorityRef` | ref | 企业合法受权合同签署人 |
| `manualCommercialExceptionRef` | ref? | 受权企业合同例外，不绕过KYB/合法条件 |

### 商业付款/订阅/权益激活（M01/M03）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `subscriptionId` | string/unique | 原Tenant+Standard版本 |
| `subscriptionIntentId` | string/unique | 防双订阅、双扣费 |
| `commercialPaymentIntentId` | string/unique | 与投资者认购资金分账及来源 |
| `paymentProviderTransactionRef` | ref? | 真实商业X回执来源 |
| `commercialPaymentStatus` | enum | Pending/Unknown不能当VerifiedPaid |
| `verifiedPaidEvidenceRef` | ref? | R03恢复时必须引用原实收证据 |
| `entitlementActivationStatus` | enum | 付款实收与租户升权是两个事实 |
| `subscriptionEffectiveAt` | timestamp? | 必须满足KYB/合同/合法付款条件 |
| `activationResultEvidenceRef` | hash/ref? | 原升权命令可查、幂等，不建新Tenant |
| `reconciliationCaseId` | ref? | 付款/授权Unknown必须受权对账 |
| `commercialReceiptRef` | ref? | 税票/收据规则未批准 |

### 门户和运营审计（M01/M03/M05/M20）

| 字段候选 | 类型候选 | 来源及当前设计约束 |
|---|---|---|
| `portalInstanceId` | string/UUID | Trial只允许企业私有预览 |
| `portalPreviewOnly` | boolean | 生产开放需商业与Offering独立Guard |
| `offeringVisibilityRef` | ref | M05唯一公开/定向/关闭事实 |
| `offeringLegalGateRef` | ref | Paid不替代真实金融发行许可 |
| `operationIntentId` | string/unique | P受控暂停/恢复/升权操作 |
| `operatorId/authorityRef` | ref | 职责分离、必要审批证据 |
| `auditCorrelationId` | string | 关联跨端KYB/商业付款/Tenant结果 |
| `beforeAfterStateEvidence` | hash/ref | M20追加留痕，不无痕改写 |

## 四、建议的关联键与事件契约（Draft）

| 事件/业务意图 | 发送与接收 | 推荐关联键 | 最低业务验证 |
|---|---|---|---|
| AccountEmailVerified / CreateTrial | I/M02→M01→I/P | `accountId,registrationIntentId,tenantId` | 已验证、一个Intent仅有一个原Tenant；创建超时先查原结果 |
| TrialDraftCreated / DraftRetained | I→M01/M05/M20 | `tenantId,resourceId,originEnvironment,resourceTruthClass` | R01允许草稿保留，禁止模拟资金/身份/Token自动转真 |
| KYBSubmitted / KYBDecisionChanged | I↔M03/M01↔X/M22 | `tenantId,kybCaseId,evidenceBundleRef` | Provider ACK不等于商业Verified；Rejected/Unknown不得升Paid |
| ContractAccepted / CommercialPaymentVerified | I→M01↔商业X | `subscriptionIntentId,contractVersion,commercialPaymentIntentId` | 合同与真实商业付款来源一致；Unknown不再收一笔 |
| ActivatePaid / ReconcileActivation | M01↔M03/M17→I | `tenantId,activationIntentId,verifiedPaidEvidenceRef` | R03同Tenant恢复原授权，幂等且留痕 |
| TrialExpired / RestorePending | M01→M19/M02/I | `tenantId,trialExpiresAt,recoveryWindowEndsAt` | 只读和30天恢复，保留合法归档/交接 |
| PortalPreview/Published | I→M01/M05→M08 | `tenantId,portalInstanceId,offeringVisibilityRef` | Trial仅私有模拟，Paid也须另经Offering发布Gate |

## 五、数据访问与实际权限（最小矩阵，Draft）

| 数据/操作 | I 企业用户 | P 运营/审核员 | X 外部 | V 投资者 |
|---|---|---|---|---|
| 本人账户与Trial计时 | 本人及本机构受权管理员 | 必要摘要、受权异常 | 邮件验证引用 | 不涉及 |
| 企业KYB原件及结果 | 企业合法授权主体 | M03/M20最小权限受控访问 | 适格KYB供方合法处理 | 不可见 |
| 套餐合同与商业付款 | 企业受权签约/财务人员 | 受权商业账单/审核摘要 | 商业PSP/合法签署方 | 不可见 |
| 同Tenant升权或暂停 | 发起/查看本机构状态 | M03受权操作，M01/M19真正执行 | 不接管Tenant | 不自动得到真实认购权 |
| 模拟数据、正式Offering | I拥有本租户草稿，受发行法律Gate控制 | 无跨租户原始数据读取权 | Sandbox/合法生产分环境 | 只看已依法公开或定向授权的真实项目 |

P普通客服不能因平台管理员身份读取Investor原始KYC、商业秘密文件或Token Signer私钥。变更管理员、撤销授权及高敏资料访问需要审计。

## 六、验证清单：必须不发生的五种混淆

1. **TrialActive ≠ PaidActive**：邮箱注册后无需KYB/银行卡；14天受限试用，无真实KYC募集、法定登记、Mint、Claim。
2. **CommercialKYB Verified ≠ Offering Eligible**：企业商业KYB不能替代具体发行法律主体和投资者适格性。
3. **PaymentSubmitted/Unknown ≠ CommercialPaid**：支付商未证实就不赋Paid；一笔真实商业付费只能对应一次合法授权意图。
4. **Paid成功 ≠ Issuer真实生产金融许可**：Offering、法域、Signer、资金持有人和登记主体均需要独立门槛。
5. **Demo事实 ≠ 真实法律/金融事实**：R01可以留草稿，不可将模拟投资者/钱款/Token/名册变成生产记录。

## 七、异常/恢复及拟定验收测试

跨端完整状态、谁触发/谁有权批准、A01～A15异常分配及取证要求见[Step05-01状态/异常规范Draft](RWA-SaaS-Step-05-01-Cross-Lane-States-Exceptions-Draft-v0.1.md)，此处不重复字段细节。验收只能在未来开发并具备真实外部服务沙箱测试后执行；目前**所有用例Not Executed**。

## 八、仍待后续审核的决策门

| 门 | 影响 |
|---|---|
| Standard定价、付款周期、币种、税票、超额、服务商 | 商业支付字段/真实收款方案无法最终Frozen |
| 14自然日与30天恢复精确起算/时区和自然日边界 | 倒计时、只读生效、重开Tenant的临界点 |
| KYB主体、最终受益人、公司代表及合法复核策略 | 表单字段/权限和服务商法律适用性 |
| 真实/模拟环境的数据保留和草稿转正清单 | R01的对象细分与合法生产创建流程 |
| 外部商业付款结果Unknown及例外企业合同 | R03的自动重试/退款/服务补偿规则 |
| 已发行Paid客户欠费/退出后合法金融义务保全 | 非法停服与投资者查询/债务交接风险 |

**最终状态：DEC-029仅批准R01～R03；本字段PRD v0.2仍Draft；Step05其他4个场景未审；V1.0整体未Frozen，PR #6未合并，没有UI/开发或真实资金Token生产授权。**
