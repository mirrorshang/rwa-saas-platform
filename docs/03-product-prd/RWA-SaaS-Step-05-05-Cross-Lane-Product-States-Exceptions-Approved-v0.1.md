# RWA SaaS｜Step05-05 P/I/V/X跨端产品状态与异常规范（Approved v0.1｜仅产品层）

> **2026-10-25｜[DEC-034](../../decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md)批准R01～R06产品行为与异常保护原则。** 此处候选英文状态不是工程enum；权限码/schema/API、实际供应商/密码学实现、法域数据授权/法律送达、实际资金/Signer或生产运行和全部测试均Draft/Not Executed；不批准Step06整体V1 Frozen。

阅读：[Step05-05产品级详细PRD v0.2 Approved](RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md)｜[原可视化Draft](RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)｜[DEC-028全量13项风险Open](../../decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)。

## 一、13组不可互相取代的状态/事实

| 状态与业务对象 | 独立事实主责 | 业务语义候选（不是enum） | 不可错误等同 |
|---|---|---|---|
| 商业租户与Tenant服务授权 | M01权威；P/M03受控操作 | TrialActive, ExpiredReadOnly, RestoreWindow, PaidActive, PaidRestricted, Suspended, Unknown | 商业已开通/平台停服≠证券发行许可或资金合法义务结束 |
| Issuer角色、投资者本人及合法代理 | M02组织RBAC、M09投资者资格、M20访问隔离 | ValidGrant, PendingCheck, Expired, Revoked, NotAuthorized | P管理员角色≠Issuer资金Signer或投资者代理 |
| 高敏信息有权访问 | M03-F005操作、M20权限审计 | AccessRequested, ApprovedScoped, ActiveLimited, Expired, Revoked, Denied | 审批必须与合法目的/敏感级别/时限一致，默认不读原始KYC |
| 原域真正业务状态 | M01/M04～M13相关唯一领域 | Pending, Effective, Failed, Unknown, Disputed按域独立 | 任何跨域任务或外部回调不写另一套“已付款/登记”账 |
| 待办任务与审批记录 | M17 | Pending, NeedsInfo, InReview, ApprovedTask, RejectedTask, Escalated, ClosedTask | 任务Closed≠付款、Mint、LegalRegistration实际完成 |
| 业务通知和投递 | M18 | Created, Sent, ProviderAccepted, Viewed, DeliveryFailed, Unknown | Send/Read≠法定有效送达 |
| 法律送达效果 | Issuer/适格X法定责任，M18只关联证据 | ApplicableLegalProofPending, EffectiveAsApplicable, Disputed | 法域合法渠道/送达方式需专业确定 |
| 规则配置与生效版本 | M19 | Draft, PendingApproval, Effective, Disabled, Superseded | 版本切换不可追溯修改旧Quote和法定已发生权益 |
| 不可变证据与安全/隐私 | M20 | Captured, AppendCorrection, SecurityAlert, UnderInvestigation | 日志不是原金融/法律真值，权限撤销后不能缓存继续读 |
| 报表及导出视图 | M21引用原业务领域 | AsOfCurrent, Lagging, Restricted, Generated, Exported | 报表只读/可能延时，不能反向覆盖M11/M12/M13 |
| 第三方连接与事件 | M22/X | Healthy, Degraded, Outage, ProviderUnknown, Reconciled | Webhook/Provider200≠业务Final |
| 凭证与环境安全 | M22/M20、X合法Owner | SandboxOnly, ProductionAuthorized, Rotating, Revoked, Compromised | 平台API节点钥匙≠Issuer真实资金/Token私钥 |
| 业务退出、责任继续与移交 | M01/M03服务状态；M10～M13原合法义务 | RestrictedAccess, HandoverPending, LegallyRetained, CompletedAsApplicable | Tenant停服不能让投资者既得权利或真实债务消失 |

## 二、四端操作与跨域事件的责任顺序

| ID | 事件 | 守卫条件 | 必须达到的业务后置结果 | 独立主责 |
|---|---|---|---|---|
| T05-01 | 商业KYB/Trial/Standard/Tenant暂停恢复 | M01独立商业合同/付款与KYB结果有效 | P/M03受权执行，I看到业务真实服务状态，V合法在途权益不删除 | M01/M03/M17/M20 |
| T05-02 | Issuer用户或平台员工请求敏感资源 | Tenant/Issuer/Role/本人或代理/合法目的/授权未过期 | M02/M20服务端许可；高敏需M03-F005独立审批，拒绝留痕 | M02/M03/M20/M09 |
| T05-03 | 各域发生付款、登记、Mint、收益、签署Unknown | 原DomainIntent/Tx/Provider ID可核验 | M17生成工单，M22技术观察，I/X合法主体按原事实查证再作受权处置 | M17/M22/M01/M07/M10～M13 |
| T05-04 | 工单审批、退回、补证、结案 | 审批与真正合法业务条件独立 | M17只负责协调审批留痕；业务裁决须原领域记录，不得把Done当成功 | M17/M20/原领域 |
| T05-05 | 真值发生受权变更后通知I/V | 收件人仍有Tenant/Offering/本人权限，通知内容与真实状态匹配 | M18记录发送/阅读等不同事实，依法需送达则X补合法证明 | M18/M20/X |
| T05-06 | 合规与产品规则更新 | M19合法强制规则优先、旧版本/订单/法定事实保存 | 受权审批生效后新行为引用新规则；旧Quote和文件沿原合法版本 | M19/M20/M04～M13 |
| T05-07 | Issuer查看统计及导出 | 只读来源、数据基准时点和最小访问授权有效 | M21展示口径、延迟、币种和单位，原业务账不被报告写回 | M21/M20/原领域 |
| T05-08 | Webhook重复或外部Provider不健康 | 来源可信/签名/去重/环境权限核验、原意图可查 | M22记录技术状态，M17按受影响业务升级，领域单独核真实结果 | M22/M17/M20/原领域 |
| T05-09 | 运营试用环境误碰真实Signer/资金 | 当前Token、环境和Provider凭证与合法目的不匹配 | M22/M20强阻断并安全留痕，不能让Trial模拟事实进入生产 | M22/M19/M20 |
| T05-10 | Tenant欠费、暂停或退租但实际金融义务尚在 | 原M10/M11/M12/M07/M13有效未结权益或争议 | 保留依法必要Investor查询、履约接口、责任人移交与审计，限制新增非必要SaaS操作 | M01/M03/M13/M17/M20 |
| T05-11 | 跨Tenant访问、权限撤销或缓存过期 | 服务端实时重新校验Tenant/资源/期限 | 拒绝敏感访问或导出、记录事件并依法处置；P和I/V权限分轨 | M02/M03/M20 |

## 三、DEC-034六项已批准业务不变量

### R01｜商业运营与真实金融法律执行权分离

P/M03依据商业合同和实际KYB验证管理M01原Tenant/Standard权限，只能查看必要摘要或合法受权敏感内容。I机构自己的真实发行/资格/持款/登记/Signer/收益决策仍由M04～M13各域及依法有权Issuer/X执行。Paid不等于金融生产已批准，暂停并不能自动消灭既存投资者债权或股权。

### R02｜所有端的Tenant隔离、合法业务目的和高敏访问审批

M02/M20服务端按Issuer/组织/Tenant、本人或代理、角色/目的/期限、具体资源进行裁决。P读高敏材料要合法必要目的、有权审批、最小字段时间范围、到期撤权与不可静默修改审计。跨Tenant/Issuer共享KYC或名册须合法依据；前端隐藏不能代替服务端验证。

### R03｜M17只拥有任务与异常意图，原业务真值不被覆盖

M17以DomainId/原Intent/当时版本关联审批、补件、差错、升级和合法纠正，ClosedTask只是任务事实。M22/真实外部X返回Unknown时核原执行结果；资金退款、收益Claim、Mint、法定登记、商业付款不得盲重试不可逆动作。更正必须由原M01/M07/M11/M12/M13等有权主体决定并保留旧证据。

### R04｜消息投递与法定送达四种不同事实

M18向合法有权收件人发送与原领域状态一致的消息；Send、ProviderAccepted、Read和法定有效送达必须各自可见/留证。邮件/站内链接打开再次服务端鉴权。必要法律送达由有权Issuer/X按实际Instrument法域完成，不能凭邮件发送成功证明法律有效。

### R05｜M19/M20/M21只提供规则/审计/只读分析

M19强制法域规则优先于Tenant与Offering可配置规则；批准/生效/废止与旧合法文件/订单/报价版本可追溯。M20追加审计/必要合法脱敏访问；M21按有权导出只读报表并显示基准时点/精度/延迟；报表不反写收款、法定持有或收益账户。

### R06｜M22 Provider凭证/健康及法定退租交接

不同Tenant/业务目的/Provider和Sandbox/真实生产隔离凭证、来源验证与Webhook重放/去重；故障升级M17/M18/M20并保存Unknown，Provider恢复也要按原业务查证。退租/停服依法保留真实金融权益、必要Investor查询、数据/责任移交，P无默认资金托管、签名或法定名册权。

## 四、15项跨端异常目录（业务保护Approved；技术实现Draft）

| ID | 场景 | 应遵守的业务保护 |
|---|---|---|
| E05-01 | P错误暂停具有发行后义务的Tenant | 保留合法存续资金/收益/名册及必要Investor访问，P受权恢复并审计 |
| E05-02 | Trial调用生产真实资金、KYC或Token Signer | 环境与凭证校验阻断，触发安全告警及隔离 |
| E05-03 | P客服跨Issuer请求Investor原始KYC | 按合法目的/高敏审批缺失拒绝，记录安全审计 |
| E05-04 | 企业普通管理员冒充法定Issuer/Signer | 服务端角色与实际法定授权双Guard拒绝 |
| E05-05 | M17任务Done但真实支付仍Unknown | 工单结果与原领域独立，不得标资金已到账/已退/收益已发 |
| E05-06 | 重复Webhook与两个真实Tx被混淆 | 签名防重放/幂等；同Tx事件唯一，不吞掉第二笔不同真实资金 |
| E05-07 | 外部KYC/登记/支付服务Unavailable | 受影响不可逆行为暂缓，M17升级与原Provider恢复后查询 |
| E05-08 | 权限撤销但页面缓存仍有已开按钮 | 服务端权限必须重新判定，拒绝、审计和必要访问撤权 |
| E05-09 | 规则/文书变更影响旧Order或签署 | 保留法定旧版本，实际有权审核是否通知/重签 |
| E05-10 | 邮件发出/用户已读但不满足合法送达 | M18保留不同投递事实，Issuer/X按法域补受权法定渠道 |
| E05-11 | 报告时效落后于原账 | 标明ReportAsOf/延时，只读不改M11/M12/M13 |
| E05-12 | 跨Tenant搜索/缓存/导出泄露 | 服务端Tenant隔离、审计事件与依法必要处理 |
| E05-13 | Outage/Unknown后自动重复Mint或出款 | 查原Intent/Tx与业务领域真值，无证据不盲重试 |
| E05-14 | 退出Tenant但存在未清偿资金与权利 | 依法保留合法受益人查询、履约路径和数据/责任移交 |
| E05-15 | Provider凭证泄漏/误用于生产 | 最小权限撤权轮换、隔离环境、受权调查，不能接触Issuer客户资金私钥 |

## 五、四端消息/异常体验及实际权限

| 情形 | P平台后台 | I Issuer工作台 | V投资者端 | X真正合法服务主体 |
|---|---|---|---|---|
| 商业Tenant暂停 | M03仅受权恢复/限流、M20记录；不操作客户Token | 查看商业限制与必要合法服务入口 | 依法必要查询旧订单、未领收益及通知仍可访问 | 适格付款/登记者照法定责任处理 |
| 钱/Token/登记 Unknown | M17异常任务＋M22技术健康最小摘要 | 原业务领域核真实意图/适格复核及有权补偿 | 显示“待核”而非虚假成功/失败 | 实际持款/Signer/登记者核证明 |
| 受限高敏访问 | 必须发起有权审批、短时最小范围 | 机构内RBAC按合法目的和对象授权 | 仅本人材料及依法有权共享内容 | KYC/X依法提供必要证据引用 |
| 通知及合法送达 | M18技术投递/错误及渠道健康 | 准备合法内容和受众、依法处理正式送达 | 查看本人有权通知/受权链接 | 适格法律送达/电子签等主体证明实际效力 |
| 报表规则变更 | M19/M20保障规则审计，M21只读和隔离 | 管理合法Issuer配置、可查旧生效版本 | 合法订单和认购合同版本不被改写 | 外部监管/审计根据实际合同法域取证 |
| Provider失败和恢复 | M22标明技术健康/回调真实性，M17升级 | 业务领域核原状态再执行有权恢复 | 不凭服务恢复显示已收款/已交付 | 真实服务记录和法定完成证据 |

## 六、15项未来验收断言（全部Not Executed）

| ID | 未来系统必须证明 |
|---|---|
| U05-01 | P管理员不能通过超级权限访问另一Tenant原始Investor KYC或真正Signer密钥 |
| U05-02 | 搜索/直链/缓存/导出均在服务端按Tenant及合法资源鉴权，失败留证 |
| U05-03 | 高敏访问到期/撤销后缓存页面不能继续拉取或导出 |
| U05-04 | Trial/沙箱无法调用生产真实资金/Signer/法定登记权限 |
| U05-05 | 商业Paid不自动授Offering发布、法定登记或真实资金权限 |
| U05-06 | M17已结案而退款/Claim Unknown时，V/I仍看到真实待核 |
| U05-07 | 不可逆动作Unknown不得自动重付/重Mint/重登记 |
| U05-08 | 同一Webhook重复去重，不同真实Tx/Log分别处理 |
| U05-09 | M18 Sent/ProviderAccepted/Read与法定有效送达清晰区分 |
| U05-10 | 撤销本人/代理访问后通知深链被服务端阻断 |
| U05-11 | 规则生效不静默覆盖原Quote/法律文件/旧配售与收益版本 |
| U05-12 | M21报告展示数据基准/币种/延时且只读，不修改金融真值 |
| U05-13 | Provider恢复后原Unknown需重查，不能直接置Success |
| U05-14 | Tenant停服/退租不删已有资金、登记、Token、收益和必要投资者查询 |
| U05-15 | 各Tenant与试用/生产凭证隔离且泄漏可撤权/轮换/审计 |

这里列出的是受权产品规则对应的**未来测试预期**，没有真实运行浏览器、后端、Provider Sandbox、安全渗透、钱包/链上或法域测试。不得说“已PASS”。

## 七、风险与技术字段仍独立待审

- **X-11邮件归属**仍需明确：M18-F004/F005可负责最低发送/失败重试，M22-F001～008没有单独邮件功能ID；外部邮件SDK及M22可复用健康/凭证如何对接尚待字段/接口明确，不能擅自增加V1模块。
- **X-06安全运行**：原Intent/TxLog/回调事件键、去重、时序、重放、签名、用户角色与校验失败码仍需工程验收；Unknown原则虽Approved但没有可执行证据。
- **X-08隐私/身份**：实际跨Issuer KYC复用合法目的、同意/撤回与最小范围；实现仍Draft；**X-10退租**实际移交期限、数据保留法域、付款/名册和Issuer义务仍待确认。
- **X-13交付**：字段级PRD/状态枚举、权限矩阵、API/外部契约、异常恢复可执行步骤、UI前置和真实验收均未Ready。并且**X-01～X-13全部Open**，本文件不代为关闭。
- DEC-017 193项版号V1 146/V2 22/V3 20/TBD5与四份Frozen/历史DEC/SCOPE不变；PR #6 Draft/Open/Unmerged。不进行UI/代码开发或资金/Token生产。

**结论：Step05-05 R01～R06对应跨端产品状态语义和异常保护Approved；实际技术/法律/测试未批准，Step06仍为冻结前审核Draft。**
