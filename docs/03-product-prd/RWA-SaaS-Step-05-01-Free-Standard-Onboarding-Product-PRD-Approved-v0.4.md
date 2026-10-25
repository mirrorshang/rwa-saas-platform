# RWA SaaS｜Step05-01 企业入驻、永久Free、商业KYB与Standard订阅（现行产品级PRD v0.4）

> **2026-10-26｜Approved仅限[DEC-037 R05=A](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)明确商业规则及未被覆盖的DEC-019/029/030产品原则；下文候选字段/状态enum/具体资源值/合同与真实生产技术全部Draft，全部测试Not Executed。** 本文作为Step05-01 **当前产品阅读入口**，取代旧[Trial PRD v0.3（历史Approved，当时有效）](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)的现行执行读取，不改其原文。V1整体未Frozen、PR #6 Draft/Open/Unmerged。

## 一、商业规则与产品定位

**商业商品只有两种：Free（永久Sandbox）与Standard（付费Production-eligible）**，不是“Trial→过期自动受限→Standard”。Free不需预绑付款工具、没有时间倒计时；完整体验11步Issuer业务，包含资产、Instrument、Offering、Token参数、测试Token/模拟链结果、机构门户、模拟投资者KYC/认购/支付/配售/收益/到期。Sandbox所有页面、导出、回执、链标识必须**显著标明测试**，不得产生真实财产/证券认购或隐含投资权益。外部昂贵的测试网服务或资源可限制使用，额度/禁用细则另审。

**Standard不是实际合法发行许可**：M01商业KYB、合同、实际SaaS付款/有效授权确定Standard商业权益；M05发行人合法发布Guard及M07/M11/M12/M13受权执行/平台自身RG生产门独立决定每个真实Offering能否使用主网Mint/真实投资者认购/资金收付/名册与收益。P平台提供软件，不凭套餐替Issuer审批证券发行、保管资金或握Signer；Issuer及有权X承担具体真实发行/持款/登记/签名责任。

## 二、四端用户流程（现行替代旧Trial七步）

| 次序 | I SaaS发行机构体验 | P/M01、M03、M19、M20 | V机构投资者门户 | X外部 |
|---|---|---|---|---|
| 1 注册 | 邮箱验证/授权组织管理员、创建唯一Free Tenant，无付款绑卡 | M01用原注册Intent幂等开通Free；M19启动Sandbox权益 | 无真实认购门户 | 邮件验证回执 |
| 2 Free持续使用 | 自由创建Asset/Instrument/Offering草稿、模拟Token/测试网可受控体验、模拟订单与收益；不倒计时 | M19按Free能力版本/资源配额/环境强制Guard；M20隔离模拟事实 | 只允许明确Sandbox/演示身份、测试流程，禁止真实投资者购买 | 可选测试环境与有限技术服务，均无真钱 |
| 3 申请升级 | 按需提交企业商业KYB与代表证明，确认唯一Standard套餐与商业合同 | M01保留原商业Tenant，M03有权审核KYB，M20留证 | 无变化 | KYB来源结果、电子签来源 |
| 4 商业订阅付款 | 企业受权人确认报价/合同，支付真实**SaaS费用** | M01商业费与M11投资者募集款分账；商业PSP结果Unknown查原Intent不二次扣款 | 无变化 | 合法商业支付方 |
| 5 Standard开通 | 付款经证实且KYB/合同Guard满足后，在**原Tenant**获得Standard权益，重用合法草稿 | M01记录商业付款与权益生效**两个独立状态**；M19刷新可用能力；异常M17恢复原意图 | 无自动真实购买资格 | 提供商业实收回执 |
| 6 申请真实发行 | I设置真实Issuer/Instrument、受众、法定文件、资金/Signer/登记人/收益责任方并提交受权发布申请 | P仅运营自身服务；M05 P-01～07及平台RG/外部有权执行Gate都应按相关真实动作检查 | 只有在Issuer授权且Offer/Viewer当前可见和可认购时才能真实购买 | 按真实合法职责提供必要法律、资金、登记、Token与最终性证据 |
| 7 Standard失效/退出 | 仅保留Free Sandbox新业务能力，停止新增未经授权的真实发行/认购；依法完成旧真实权益/款项后续查询、履约及移交 | M01订阅停用不得抹除M07/M11/M12/M13已形成事实；M03/M17/M20受权服务交接 | 已有合法持仓/收益视图不得直接消失 | 相关合法责任主体继续依法处理在途/存续义务 |

## 三、Free/Standard产品差异（已批准方向；细目仍Draft）

| 场景 | Free | Standard（**商业权益不等于生产授权**） |
|---|---|---|
| SaaS Tenant与成员/权限 | 常规管理、额度可限制 | 受控全量V1商业权益 |
| Asset/Instrument/文件/Offering | 可创建、编辑、校验和模拟审批；实际文件可保留为草稿 | 可通过Issuer合法审核与受权形成真实有效业务方案 |
| Token创建/部署/Mint | 模拟或获批准测试网Token，测试资产无真钱法定价值 | 有权Signer、合法Instrument与链安全审批后可以真主网执行 |
| Issuer标准投资者门户 | 私有/显著标识Sandbox演示，模拟账户及下单 | 可在依法授权范围面向真实受众发布；实际订单还需Offering与投资者独立资格 |
| KYC、认购、资金、配售、持仓 | 模拟KYC、订单、支付、名册及Token交付 | 合法真实KYB/KYC、真实受限资金、登记与链事实分别由领域主责和X提供 |
| 收益/本息/退出 | 端到端模拟计算、Claim/Push、未领款及到期 | 具体合同授权、合法持款/支付和登记/Signer生效与复核后执行 |
| SaaS订阅时间 | **永久，不根据注册时间到期** | 依商业合同账期（周期/价/续费机制Draft） |
| 项目/Token/测试人数/存储/调用配额 | 合理限额（全部值待定） | 更高的合法服务额度（全部值待定） |

[全模块逐项能力矩阵 Draft](RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)进一步拆分能力。

## 四、独立业务状态与唯一真值（产品不变量已批；英文标识Draft）

| 状态轴及主责 | 合法独立语义 | 为什么不可混成一个Paid |
|---|---|---|
| `CommercialPlan` M01 | Free或Standard及合同版本 | 计划名不是钱到账，也不是金融执行资格 |
| `SaaSPayment` M01＋商业X | NoPayment/Pending/Unknown/VerifiedPaid/Disputed | 免费无SaaS商用付款；真实实付要原Intent证据 |
| `CommercialEntitlement` M01/M19 | FreeActive / UpgradePending / StandardApplying / StandardActive / StandardRestricted；具体enumDraft | Paid已核≠已升Standard；同Tenant幂等恢复 |
| `Environment/TruthClass` M19/M20 | Sandbox/Simulated、Testnet、Production各自独立 | 测试订单/Mint/Claim不能直接变真实法律金融状态 |
| `IssuerOfferingExecutionGate` M05/M07/M09/M11/M12/M13＋X | 没有适用法律、授权、Signer、资金/登记及平台RG证据不启用对应真实动作 | StandardActive≠Offering发布/投资者Eligible/True Funds/Token Finality |
| `CommercialKYB` M01（P/M03审、X提供证据） | NotSubmitted/NeedsInfo/InReview/Verified/Rejected/Unknown | Free可用而无需KYB完成；升级条件不满足不能给予Standard |

**从现行能力模型删除**“Free自动到期336小时”“到期只读720小时恢复”逻辑；这两个时间仅是[DEC-030历史记录](../../decisions/DEC-030-step05-01-r04-07-product-rule-closure-approved.md)，不再驱动任何Free能力Guard。保留商业合同欠费、反滥用和安全处置守卫；真实存续义务独立交接。

## 五、端侧权限/异常/审核

| 操作 | I企业 | P后台 | V投资者 | X |
|---|---|---|---|---|
| Free开户及Sandbox发行配置 | 自助、团队受权 | M01/M19额度、安全、隔离和稽核 | 仅受控Sandbox演示 | 测试来源标识 |
| KYB/Standard合同与付款 | 授权企业代表提交/付款/查状态 | 合法商业KYB审核、权益/账单/支付异常；不能授金融合法性 | 不访问企业KYB | 商业KYB/PSP证明 |
| 真实Token、认购、真实收款/收益 | 依法发起/申请，按持款/登记/Signer分权 | 不默认批准Issuer金融业务、不能碰持款/私钥或代真钱签名；平台自身参与需RG | 依法Eligible才能真实购买/查询本人权益 | 被合法授权的执行/证明主体 |
| Standard欠费/退租的既有义务 | 查询/合法履约/交接；禁止新增未经许可的真发行 | 商业权益受限，但历史金融真值不删除 | 真实已形成的持仓/收益不得因商费状态被伪删除 | 继续有权处理真钱/法定权益 |

详见[新版四端状态与异常 v0.3](RWA-SaaS-Step-05-01-Free-Standard-Cross-Lane-States-Exceptions-Approved-v0.3.md)。需验证至少：永久Free长期使用、额度阻断而非超时退出、Free API越权尝试真Mint/真实购买、升级原Tenant与模拟不可生产、KYB补件、商业支付Unknown/已付款但开通失败、Standard过期仍有存续义务、相同环境权限服务端Guard、测试网Token对外防误导。用例**Not Executed**。

## 六、字段级候选与原65字段接续

原[65行字段v0.2](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)及[Step06-05历史审计](RWA-SaaS-Step-06-05-B01-65-Field-Line-Crosswalk-Gap-Audit-Draft-v0.1.md)继续作为历史候选与原审计证据，**含旧336/720意见的结论已被DEC-037替代**；现行映射请以[Step06-06 Free/Standard字段迁移逐行审查 Draft](RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)为准。建议新增独立字段/对象：`planCode` Free/Standard、`freeEntitlementVersion`、`sandboxEnvironmentRef`、`usageQuotaPolicyRef`、`actualUsageSnapshot`、`productionEnablementGateRef`、`subscriptionStatus`、`commercialPaymentEvidenceRef`、`tenantHistoricalObligationsRef`（**均Draft，不新增正式Mxx-F ID**）。`trialActivatedAt`、`trialExpiresAt`、`recoveryWindowEndsAt`若留兼容字段不得作为新Free权限依据。

## 七、产品级批准与仍待专项门

**Approved**：DEC-037中双版本、Free无时限/广泛模拟、Standard与生产权限分离、原Tenant升级/模拟真钱不可转真、KYB/商业费用与正式发行权责分离、已有真实义务保全。

**Draft**：免费/付费精确配额、标准订阅定价/账期/违约宽限、是否默认测试网或纯模拟、测试网络/Token模板、超过资源额度后的Grace设计、外部成本配额、Free账户滥用处置、字段Schema/API/RBAC、权限组合及金融生产RG证据门具体实现。若任何选项实质改变已批准R05方向，需独立审核。

**不变**：DEC-017 193正式ID V1 146/V2 22/V3 20/TBD5，Step04 146/146功能级原审批，Step05其他29条历史批准证据可追溯但Trial时限按本DEC新决定生效；X-01～13 13/13 Open；四份Frozen/历史DEC与SCOPE原文不动；V1整体未Frozen、PR #6 Draft/Open/Unmerged；没有开发或真实金融生产批准。
