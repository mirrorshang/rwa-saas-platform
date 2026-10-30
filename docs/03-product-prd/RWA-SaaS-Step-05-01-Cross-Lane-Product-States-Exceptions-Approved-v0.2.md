# RWA SaaS｜Step05-01 P/I/V/X跨端产品状态与异常规范（Approved v0.2：仅产品层）

> **状态：DEC-029 R01～R03与DEC-030 R04～R07的产品级状态语义、业务角色、阻断和异常恢复规则Approved。** 本文内状态英文标签、真正enum/API、重试次数、期限/技术字段、数据结构与测试仍Draft/Not Executed。详见[产品级PRD v0.3 Approved](RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)。整体Step05/Step06及V1.0不因此冻结。

## 零、DEC-030收口后的四项新增产品不变量（Approved）

| 审核项 | Approved业务语义与观察行为 | 具体执行仍Draft |
|---|---|---|
| **R04** | Trial自实际激活起**336小时**；到期后只读/受限转换窗口再持续**720小时**；服务端基于UTC瞬间比较，I与P端显示换算后适用时区及同一截止时刻 | 定时器任务、时间类型、时区选择来源、临界点并发 |
| **R05** | KYB需要补件时沿**原审核案件**继续；正式拒绝后有合法新证据或复核依据才可申请重新受理，由有权P端审核员决定；外部Unknown不能放行 | 各法域申诉次数/等待期、拒绝码、复核队列算法 |
| **R06** | 合法Asset、Instrument、Offering草稿可保留并在同Tenant继续编辑，但正式发行前重新检查法律主体、Instrument/文件版本、发行合法Gate与真实Signer/资金权限；模拟事实不自动转真 | 哪些字段可复用、各生产业务新建数据/迁移技术 |
| **R07** | 商业支付真实已确认而正式Tenant权限未生效，企业端并列展示“已确认付款/服务开通中”，平台后台应有受权异常恢复任务；先查询原结果再在原Tenant升权且不重复收费 | 接口返回码、真实交易结算机制、自动重试阈值 |

**四端状态控制**：M01独立持有商业付款证据引用、Tenant与订阅权益真值；P端M03审核/处置，M17异常任务；X外部商用支付与KYB提供真实核验证据，M22适配；I端只显示自身业务状态；V正式投资者门户不受Trial/Paid标识直接授予真实认购权限，须另经M05/M09等合法发行Guard。

**需要明确保留的双状态例子（Approved产品语义）**：

| 商业付款 | Tenant正式授权 | I端应显示 | 下一步 |
|---|---|---|---|
| 未付/Unknown | Trial或到期只读 | 未完成付款/付款待核，不能声明开通 | 查询原商用支付意图 |
| **VerifiedPaid** | **Applying/Unknown/Failed** | **付款已确认，服务开通处理中** | P端按原意图受权核实并恢复原Tenant |
| VerifiedPaid | PaidActive | 正式SaaS已开通 | Issuer仍单独做Offering合法发布前置 |
| 已退款/争议 | 可能仍有有效旧权益/未结权利义务 | 分别展示费用与服务状态，不自动抹账 | 按合法商业合同与存续责任处理 |

本表为状态的**已批准业务显示语义**，不是可直接复制的后端enum或订单付款接口定义。后续真实Web/App文案和技术验收未完成。

## 一、业务事实来源不可合并

| 对象 | 建议状态类别（均非最终enum） | 原始业务事实拥有者 | 禁止的错误映射 |
|---|---|---|---|
| Account/Email | PendingVerification → Verified → Active/Restricted | 邮件验证服务→M02/账户业务层 | 验证服务Unknown先查询；不将邮箱校验自动视为商业KYB；个人账户不能无授权关联所有Tenant |
| Tenant Trial | Provisioning → TrialActive → ExpiredReadOnly → RestorePending/PaidActive | M01唯一Tenant状态、M19权益Guard、M03受权操作 | R01保留同Tenant；KYB未通过Trial可按现行期限受限继续；14自然日/30天恢复精确算法Draft |
| KYBCase | NotSubmitted → Submitted → InReview/NeedsInfo/Unknown → Verified/Rejected/Expired/Recheck | M01商业准入结果；M03审批；M22适格外部核验 | R02拒绝不立即删Tenant；Provider200≠Verified；不保证无限重提；适用法域撤销另校验 |
| CommercialContract | Presented → PendingAcceptance → Accepted/Effective/Expired/Disputed | M01商业合同版本及合法签署人证据 | 签署回调≠合法生效；合同例外必须受权并留证 |
| CommercialPayment | NotInitiated → Submitted → Pending/Unknown → VerifiedPaid/Failed/RefundCase | 合法商业支付X供方与M01商业支付证据 | Unknown≠Failed或Paid；两笔真实款项独立核对，严禁盲重复扣费；不复用M11认购款主账 |
| Subscription | IntentCreated → AwaitingGuards → EligibleForActivation → Active/Restricted/Expired | M01唯一订阅状态 | 必须KYB、合同及真实合法商业付款或经批准合同例外满足；PaymentVerified不等于Tenant升权完成 |
| Entitlement Activation | NotRequested → Requested → Applying/Unknown → Active/FailedNeedsRecovery | M01写权益事实，M19鉴权读取，M03/M17异常受控恢复 | R03查看原Intent，付款已确认但授权未生效应在原Tenant恢复；不能重复商业收费或创建Tenant |
| ResourceTruthClass | DraftOrSimulation → RetainedDraft；RealFinancialFact需单独合法创建 | I端草稿归M04/M05相关业务；M20不可变证据与环境Guard | R01模拟付款/模拟KYC/模拟Token/模拟合法名册不可直接更新枚举当真实 |
| Portal/Offering | PrivatePreview → PublishedEligibleVisibility；Offering可独立Paused/Closed | M01门户实例+M05Offering批准版本，M09购买资格 | Trial无真实投资者正式开放，Paid也不直接放行Offering；权限检查在服务端 |
| Tenant Suspension/Handover | PaidActive → PaidRestricted → Restoring/ExitHandover | M01商业可用性，M20数据保留，M13法律存续，实际X资金方 | 已发行真实金融义务不能因商业欠费被静默删除，退租移交和法域另定 |

**跨系统最低原则**：P/M03只是受权审核/异常操作界面，M01才是Tenant及正式商业权益主账；X提供商业KYB/支付回执而非自动做最终商业合规决定；I在本租户按能力操作；V在Trial阶段不成为生产用户。模拟Asset草稿和真实金融Token/付款事实严格分域。X是多类合法服务提供方，商业SaaS付款服务与发行募集款M11绝不混淆。

## 二、已批准跨端操作原则；具体实现迁移矩阵仍Draft

| 触发事件 | 前置动作 | 必要Guard | 允许结果/后置状态 | 业务裁决人 | I端显示 | 必须阻断 |
|---|---|---|---|---|---|---|
| AccountVerified | I邮箱注册/验证完成 | 登录与邮箱核验结果真实有效 | M01幂等创建受限Trial并初始化组织管理员 | M02/M01 | 账号在I端可登录；P端仅摘要 | 邮箱不可证明商业KYB |
| TrialCreated | M01试用创建成功 | 同注册意图未有第二租户 | TrialActive、14天、允许模拟和私有门户 | M01/M19/M20 | I端显示剩余试用期 | 绝不可触发生产业务 |
| KYBSubmitted | I受权企业提交 | 所属Tenant、上传/版本、提交人权限有效 | M01记录商业申请，M03待办/外部X核验 | M01/M03/M22 | I显示待审或待补件 | 仅商业SaaS客户准入 |
| KYBReviewed | P适格审核/外部证据 | 资料有效/权限合法/无未知重大风险 | M01更新商用KYB结果 | M03审核、M01结果权威 | I可见合法可披露结果 | Rejected/Unknown不开Paid |
| StandardRequested | I请求正式套餐 | 商业KYB Verified或满足既有合法准入门 | M01形成唯一订阅意图和合同版本 | M01 | I看到唯一Standard与费用 | 不能视为已付费 |
| CommercialPaymentConfirmed | X商业支付证据到达 | 实际款与原Intent/合法合同/报价匹配且最终性足够 | M01认定商业实付并启动授权 | 商业X+M01 | I显示已付款、可能仍开通中 | 付款事实不同于开通事实 |
| ActivationVerified | M01原Tenant升权真实完成 | 同tenantId、kyb/合同/付费Guard满足 | 更新entitlementVersion和PaidActive | M01/M19 | I正式工作台能力打开 | M05真实Offering另Gate |
| ActivationFailed | 商业付费实收但Tenant升权Unknown/Failed | 必须找到原付款与订阅/升权Intent | M17/M03建立恢复任务，查原再恢复原Tenant | M01/M03/M17 | I显示付款已确认、开通处理中 | 不得二次扣款/建Tenant |
| TrialExpired | M01到期定时/合法边界 | Trial未升Paid且14自然日到期 | 进入ExpiredReadOnly、30天受限恢复窗口 | M01/M19 | I可查看、合法补件/转正 | 不删除、不能继续模拟写入 |
| KYBRejected | P受权结论 | 有理由与真实证据记录 | 保留当前Tenant受限服务，允许符合规则的合法申诉 | M03/M01 | I按许可看到拒绝/复核入口 | 不可无限重投或自助批准 |

## 三、DEC-029已正式批准的R01～R03业务不变量（与DEC-030并行生效）

### R01｜试用草稿继承和模拟/生产隔离

- `tenantId`在Trial→Paid期间恒定；账户和合法草稿/团队设置可按已批准规则保留。
- 对于付款、钱包签名、Token部署/Mint、持有人登记、投资者KYC和收益记录，**模拟结果不能通过修改状态字段直接变成真实业务事实**。
- 是否允许保留具体Asset/Instrument/Offering草稿及对应来源版本，要与Step05-02发行场景联合制定；一切生产执行独立法域与Signer/资金法律门。
- 不能以新的“生产”Tenant替代原Tenant回避试用/审核/付款记录。

### R02｜商业KYB未通过与受限继续服务

- `KYB != Verified`不得满足Standard合法商业付款前置或形成Paid有效授权。
- 资料待补、拒绝、外部结果Unknown时，不立即删除Tenant；仅在DEC-019规定的Trial/ExpiredReadOnly以及依法可用的复核/申诉范围内继续操作。
- 原驳回与补件记录保持不可无痕覆盖，重复申请条件、拒绝理由开放范围、敏感资料保留期限留独立法律/业务审议。
- P平台审核员不因此变成真实发行证券的法律批准主体。

### R03｜付款实付成功但授权失败的同Tenant恢复

- 商业付款“已核验真实成功”与“Tenant权益变更已生效”属于**两个独立事实和状态**。
- 当已真实商业支付且升Paid结果Failed/Unknown：按原`commercialPaymentIntentId`、`paymentProviderTransactionRef`、`subscriptionIntentId`、`activationIntentId`和原`tenantId`查询真实结果。
- 已确认付费而尚未授权生效时，启动受权恢复，使原Tenant最终取得合法权益；**不能重复扣费、不得盲建Tenant**。
- 如果付款本身仍Unknown，**必须保持待核状态**，不承诺已经付费、不在未经核验时直接赋Paid；不因未知结果要求用户再付一笔。
- 实际补偿次数、幂等锁/重试算法、退款及争议程序留Step05付款合同专项。

## 四、异常业务处理已按R01～R07收口；A01～A15执行用例Not Executed

| 编号 | 触发与场景 | 参与端 | 查验/证据 | 受权恢复/阻断 | 当前规则根据 |
|---|---|---|---|---|---|
| A01 | 注册邮箱验证成功，Tenant创建超时 | I/P | M01查询registrationIntent与原tenantId | 先标ProvisioningUnknown，查既有结果；不新建第二Tenant | R01/既有DEC-019 |
| A02 | Trial有账户但尚未KYB | I | M19仅开放试用权限 | 允许合法草稿/模拟使用；不能因为未KYB直接删除或强制生产审核 | DEC-019 |
| A03 | Trial创建模拟收款或Token后升级Paid | I/P | M20环境与事实标签核对 | 只保留允许的草稿，模拟交易/KYC/登记/Mint/收益不能翻转成生产 | R01 |
| A04 | 商业KYB材料缺失/未通过/需复核 | I/P/X | M03申请和审核记录、X真实服务证据 | 受限Tenant继续按试用/到期策略，按合法条件补件/复核，不给Paid | R02 |
| A05 | 商业KYB外部响应Unknown/超时 | P/X | M22查询原Provider case及签名证据 | 不假报Verified，不启动正式商业收款；任务升级M17 | R02/DEC-019 |
| A06 | KYB拒绝后企业重复大量提交 | I/P | M03原决策/审核历史 | 以合法复核规则决定可否提交；不自动重开审核、不跨Tenant规避 | R02 |
| A07 | 商业KYB Verified，但合同尚未有效 | I/P | M01合同版本及代表授权证据 | 不允许Paid，正常Trial仍可使用受限能力 | DEC-019 |
| A08 | 企业点击Standard付款后商户结果Unknown | I/P/X | 商业X查询原paymentIntent和原交易 | 不赋Paid；不能自动再扣费，显示核验中和受控恢复 | R03/DEC-019 |
| A09 | 商业实付经核验，Entitlement仍Failed/Unknown | I/P | 原paymentIntent、verifiedEvidence与activationIntent | 必须在原Tenant核验恢复权益；P不得凭备注重开新Tenant/再收款 | R03 |
| A10 | 重复点击升级/重复Webhook投递 | P/X | subscriptionIntentId、原商业收款外部事务唯一性 | 单一商业意图幂等；重复通知不重复扣款或多建Tenant | R03/M20 |
| A11 | 两笔确实发生的商业付款金额相同 | I/P/X | 不同真实外部交易ID及原资金证据 | 分别记为真实待对账事项；不能把第二笔按同金额丢弃 | R03/后续计费 |
| A12 | Trial到期，企业仍希望补KYB和转正 | I/P | M01 trialExpiresAt / recoveryWindowEndsAt | 只读但保留申请/付费合法转换能力，30天到期后依法处置 | DEC-019/R02 |
| A13 | 试用原草稿含真实个人信息或外部生产凭证 | I/P | M20敏感数据、环境与服务授权检查 | 不得直接迁入生产或对真实投资者展示；受控清理/隔离 | R01/M20 |
| A14 | 正式已发行Issuer欠费/暂停 | P/I/V/X | M01商业状态与M13/M11/M12独立义务状态 | 限制合法非必要新业务，保存投资者查询、实收退款、登记本息/交接 | DEC-019 R05 |
| A15 | 正式门户已建，但Offering未发布或访问不合法 | I/V | M05合法公开/定向资格，M09投资者Eligible | 服务端阻断真实公众看到不该访问文件或发起有效认购 | M01-F009/M05/M09 |

### 端侧展示状态要求（Draft）

| I企业端 | P平台后台 | V投资者门户 | X适格外部提供方 |
|---|---|---|---|
| 邮箱未验证/创建试用中/Trial剩余14天 | 注册与Tenant开通意图及异常 | 无生产投资者内容 | 邮件验证证据 |
| 企业KYB待审、补件、拒绝、复核 | 审核人员、合法KYB材料及外部结果、补件任务 | 不读取商业KYB原件 | KYB服务真实回执 |
| Standard合同待签、商业付款核验中 | 商业合同/付款及Tenant升权分别展示 | 不因Paid直接开放购买 | 合法签署与商业PSP真实收款 |
| 付款已确认，但商业权限开通处理中 | 显示PaymentVerified/ActivationUnknown两个事实、进入恢复队列 | 真实Offering另受M05准入 | 原商业付款/授权证据 |
| Trial到期只读/30天受限恢复 | 不丢历史账户/试用权限控制 | Trial门户仅私有模拟 | Sandbox与生产隔离 |
| Paid有效、仍需发行合法审核 | 查看Tenant生效与商业服务状态 | 仅能看到合法发布的Offering | 金融合规及Signer各自授权 |

## 五、产品异常恢复原则已Approved；技术接口与算法仍Draft

1. 标识对象、原始唯一意图、发起人、Tenant、原业务状态及外部参考ID；不得仅凭UI重复提交或重放一笔不可逆行为。
2. 若X外部结果Unknown，先向其受权接口查询并根据合法证据对账；必要时建立M17人工处理，M20留原证据及操作人员。
3. 保留`before/after`、时间戳、受权原因及操作责任方；不得跨Tenant借用其他公司的商业付款、KYB结果或试用实例。
4. 仅在**原商业付款与合法合同/KYB条件均经确认后**恢复Tenant，遵守R03同Tenant不重复付款。
5. 资金争议、合规拒绝、商业退款以及账户/资料删除须独立依法处理，不能用通用“异常已解决”覆盖真实法律状态。

## 六、未来验收断言（未测试，Not Executed）

| 验收维度 | 最低可测断言（设计阶段建议） | 所需证据 |
|---|---|---|
| 幂等Trial创建 | 同一个注册意图和已验证账户不会因超时/重复点击创建两个Tenant | 申请ID、Tenant创建操作历史 |
| 试用独立安全 | Trial不能调用真实KYC、认购收款、法定登记、Token/Claim的生产受权执行 | 环境权限日志及无生产交易证据 |
| R01草稿继承 | 升Paid后同tenantId与允许保留的草稿仍可用、模拟事实没有进入生产权益账 | 对象身份/来源版本与数据分区核对 |
| R02合法补件/复核 | KYB Rejected/NeedsInfo未删除Tenant、允许范围内显示复核入口，但不能开放Paid | KYB案卷/权限Guard对账 |
| R03真实商业付款 | 付款已验证而开通失败的同Intent在同Tenant恢复，不多收、不新建、审计完整 | PSP真实回执、订阅和Entitlement记录 |
| Unknown防重复 | 支付、开通结果未知时先查原交易/命令，不以无证据状态发布Paid | 原Intent+外部调用与M17案件 |
| Paid与Offering隔离 | Paid生效但Offering未批准时，投资者不能查看非公开信息或进行有效认购 | Tenant状态与M05权限规则 |
| 到期/退出合法保护 | Trial只读30天恢复；已发行Paid欠费不能丢失合法权益和实际资金证据 | 账户状态、权限和交接记录 |

**所有测试都是计划中的验收条件，没有实际执行，不可写PASS。**

## 七、产品状态语义收口后的技术/法律/商业待决门

- KYB法域、企业受益所有人资料、人工复核规则、保留与删除；Standard价格/税费、合同法律效力、商业付款商与实收最终性；
- 14天/30天精确时区与计时边界；租户唯一键、跨组织账户、管理员更换/授权、权限缓存与可用数据导出；
- 用户模拟草稿迁移的类型与环境保护；按真实Issuer的M04/M05发行合法Gate、实际出款/Signer/法定登记的权限；
- 跨端真实数据同步、Webhook签名、补偿重试、安全审计、详细API/错误码与自动化测试。

**完成状态：DEC-029+DEC-030七项Step05-01产品规则、跨端状态语义与保护性恢复行为Approved；10类对象状态的英文状态码、具体迁移字段/API、15个异常场景的测试实现与结果仍Draft/Not Executed。四份Frozen及历史DEC/SCOPE不改，PR #6 Draft/Open/Unmerged；Step05-02仅可视化Draft，不进入UI/开发或真实资金Token生产。**
