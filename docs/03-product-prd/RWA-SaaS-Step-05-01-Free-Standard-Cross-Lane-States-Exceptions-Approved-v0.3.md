# RWA SaaS｜Step05-01 Free/Standard跨端产品状态、守卫与异常（产品语义 Approved v0.3；技术Draft）

> **2026-10-26｜当前阅读权威**：[DEC-037](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md) R05=A的Free/Standard、Sandbox/真实生产隔离、原Tenant升级与既存金融义务保护**产品语义已Approved**。以下英文状态名、迁移事件、异常码、重试、测试策略和权限码仍**Draft、Not Executed**。[旧Trial状态v0.2](RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md)保留历史审批证据，但336h/720h时限**已不再适用于现行Free**。

## 一、不可合并的六套状态权威

| 状态轴 | 业务真值Owner | 候选路径（**非工程enum**） | 产品不可变规则 |
|---|---|---|---|
| Account | M02账户/M01注册Intent | Unverified → Verified → Active/Restricted | Free注册只需邮箱与受权账户；不先强制商业KYB |
| CommercialPlan/Entitlement | M01；M19消费有效版本 | FreeActive → UpgradeRequested → StandardApplying → StandardActive / StandardRestricted / FreeOnlyRestricted | Free无注册后按时间失效；Standard付费权益≠金融发行生产门 |
| CommercialKYB | M01结果，M03有权审，X提供回执 | NotSubmitted → InReview/NeedsInfo/Unknown → Verified/Rejected/Recheck | KYB补件沿原案，未通过不得升级，Free可继续允许的Sandbox |
| SaaSPayment | M01/X合法商业PSP | NoPayment → IntentCreated → Pending/Unknown → VerifiedPaid/Failed/Disputed | 实收单独核验；两笔真钱与重复Webhook分开，禁止二次扣费 |
| Sandbox/Production事实 | M05/M07/M11/M12/M13各自真值，M19/M20环境Guard | Simulated/Sandbox/Testnet 与 Production 分离 | 模拟Token/支付/名册与真实生产对象不通过状态枚举直接转正 |
| OfferingProductionExecution | M05/M09及M07/M11/M12/M13和有权X | NotEnabled / EvidencePending / EnabledScoped / Suspended / Unknown | 当前Offering/投资者/操作类型条件性、受权及平台自身RG；StandardActive不直接代表Enabled |

**Free不设`TrialExpired`、`ExpiredReadOnlyBy14Days`或`RestoreWithin720h`产品迁移**。如软件因安全、配额、合法命令限制Free，应使用**独立SuspensionReason/QuotaState**而不是伪造免费资格过期。

## 二、P/I/V/X转移权限候选

| Event/场景 | I客户 | P平台 | V门户 | X | 服务端产品Guard |
|---|---|---|---|---|---|
| FreeProvisioned | 验邮箱/注册原Intent，获得同Tenant Sandbox | M01/M19开通免费权益/配额；M20审计 | 无真钱入口 | 邮箱验证 | EmailVerified、TenantUnique、SandboxOnly |
| FreeSandboxActivity | 受权创建资产/Offering/测试Token/模拟投资者/订单/分配/收益 | 防资源超限和真钱旁路，不代发行 | 仅标明演示/模拟 | 可选合法测试Provider | ResourceTruthClass不能变真钱；接口/环境双Guard |
| UpgradeRequested | 受权代表提交商业KYB/合同/付款意图 | M01开升级Intent，M03商业KYB评审 | 无变化 | 商用KYB/PSP回执 | Free继续可用，不要求Free到期 |
| KYBNeedsInfo/Rejected | 补件/复核（按条件）、继续Free Sandbox | 依法受权处理原案并最小披露 | 不变 | 外部事实 | 不开放Standard，Free不因KYB拒绝而按336h消失 |
| PaymentVerifiedActivationUnknown | 查询“付款确认/开通处理中”，同Tenant保留Free操作 | M01/M03/M17查原Payment/Activation Intent，受权恢复 | 无变化 | 商用真实付款证明 | 保留Money/Entitlement双状态、不得双扣费/新建Tenant |
| StandardActive | 可管理生产业务草稿并请求逐Offering合法生产权限 | M01商业权益+M19版本Guard，P不能自行Mint/募资 | 只可见依法开放Issuer Offering | 真实法人/资金/Signer | 商业Paid≠Issuer/平台RG已通过 |
| OfferProductionEnabled | I合法发布与授权实际执行，独立M05/M09/M07/M11/M12/M13前置 | 审查自己实际受监管行为并记录运营门 | 仅有资格者实际购买 | 真正X执行并回传证据 | 缺Issuer/法域/Signer/持款/登记证据Fail-Closed |
| StandardExpiredOrSuspended | 停新真实发行/新认购，依法处理既有未完义务与导出/移交 | M01不再新增商业生产权益，M17/M20保障依法必需的受权服务 | 既有真实持仓/收益状态不抹除 | 合法支付、登记、Signer继续按义务处理 | Free Sandbox可保留，**已有真实业务不能删除/任意中断** |

## 三、生产真实动作的双开关与数据隔离（产品Guard；实现Draft）

- **商业能力门**：Free允许`SandboxOnly`；Standard才可申请`ProductionEligible`，由M01商业合同与M19权限版本决定；Free中的显示按钮与模拟API**绝不引用生产凭据或真实下单端点**。
- **真实业务独立门**：按`TenantRef + LegalIssuerRef + OfferingRef + Actor/SignerRef + ActionType + Audience/Wallet + EvidenceVersion`校验当前授权、Issuer合规与平台自身RG所需证据及领域Guards；不以任何一个简单boolean保证“全球合法”。
- **测试Token**：如果选用真实区块链测试网，仍只作为测试环境技术事实；不得默认把测试Token等同法律份额、真实认购或合法结算，也不得在对公众可见处误标真实投资产品。
- **原Tenant继承**：CommercialCustomer、Tenant、组织成员及合法未定稿业务配置可继续编辑；模拟投资者/钱包/支付/名册/Token/收益及测试网链Tx保留测试标签/隔离空间，生产必须合法重新创建真实Intent与证据。
- **Standard停用**：需要区分订阅已到期、商业争议、安全冻结、合规生产撤销和Issuer合法履约义务；不能以通用套餐按钮改变M11资金、M12登记、M07链、M13应付款真值。

## 四、跨端异常E-FS-01～E-FS-15（未来UAT断言；全部Not Executed）

| ID | 触发 | 必须观察的产品行为 |
|---|---|---|
| E-FS-01 | Free开通已使用数月/几年 | 不因账号年龄自动只读、冻结或删除；仍受资源和安全规则 |
| E-FS-02 | Free资源配额触顶 | 指明Quota不足并受控阻断对应创建/调用，而非触发“TrialExpired” |
| E-FS-03 | Free模拟Token被提交到真实主网Mint API | 服务端拒绝、审计；演示与生产密钥/凭证隔离 |
| E-FS-04 | Free模拟投资者尝试真实认购 | 不产生真实Order/PaymentIntent/Allocation/持有人登记 |
| E-FS-05 | Free测试网Tx成功 | 仅标Sandbox/Testnet技术成功，不宣称真实Token法定交付 |
| E-FS-06 | Free不提交KYB | Sandbox继续按免费能力使用；禁止Standard商业正式激活 |
| E-FS-07 | KYB NeedsInfo/Rejected/Unknown | 原案补件/合法复核，不删Free Tenant，不让Unknown授予Standard |
| E-FS-08 | Standard付款VerifiedPaid但权益Applying超时 | 原Payment+Activation Intent核证后恢复同Tenant，不重扣/建Tenant |
| E-FS-09 | 相同商业Webhook重复/不同真实付款两笔 | 事件幂等但不同真款分录独立，Unknown先查原结果 |
| E-FS-10 | 由Free升级Standard | Tenant/成员/合法草稿保留；模拟Order、支付、登记、Token、收益不提升生产 |
| E-FS-11 | Standard付费已完成但Issuer未满足当前Offering/平台RG | 可以管理订阅与业务草稿，真实发行/售Token/收款行为保持阻断 |
| E-FS-12 | Standard当前Offering发行被暂停 | 只冻结需阻断的新实际行为，保留已发生资金/持有人/在途退款 |
| E-FS-13 | Standard到期仍有真实持有人/待付本息 | 不删历史持仓/真实义务，依法保留核对、受权履约/导出/移交 |
| E-FS-14 | P客服试图对Free或Standard代签名/划真钱 | 默认拒绝并审计，平台自身实控时需独立RG |
| E-FS-15 | 旧Trial用户迁移到永久免费Free（若历史生产用户存在） | 不按336/720再次过期，保留合法业务和历史Trial记录；迁移脚本另审，不能声称已实施 |

## 五、仍Draft与不变量继承

- **产品批准**：仅DEC-037新的永久Free/付费Standard与跨端商业/生产隔离；DEC-029 R01/R02/R03和DEC-030 R05/R06/R07未冲突部分保留；DEC-030 R04时间规则已被明确替代。
- **技术未决**：存储状态enum、商业费计费周期、Grace、AutoRenew/欠费、Free配额默认值、具体第三方Sandbox、真实资金/Signer/RG、跨Tenant角色细节、权限缓存与服务端控制、API错误码和所有E2E。
- [Step06商业能力矩阵 Draft](RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)、[Step06字段迁移审查 Draft](RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)为技术审阅底稿，不扩大Approval。13个X门全部Open；V1未Frozen，PR #6 Draft/Open/Unmerged。
