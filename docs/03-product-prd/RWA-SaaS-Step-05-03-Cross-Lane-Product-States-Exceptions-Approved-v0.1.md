# RWA SaaS｜Step05-03 P/I/V/X跨端产品状态与异常规范（Approved v0.1｜仅产品层）

> **2026-10-25｜依据[DEC-032](../../decisions/DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md)，R01～R06六项产品状态语义、权威分离、业务Guard及异常保护Approved。** 但下列英文状态名是可读候选，非实际后端enum；字段/schema/API、支付/Signer/合法登记法域、重试/确认数/退款算法均Draft，测试全部Not Executed；Step05-04仍未批准，V1整体未Frozen。

主PRD：[Step05-03产品级详细PRD Approved v0.2](RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)。真实合约/资金及身份服务的法域技术决策仍待审批；V端的一个汇总状态不能覆盖M09/M10/M11/M12/M07独立真值。

## 一、12组不可合并的事实及唯一权威

| 事实对象 | 唯一业务拥有者 | 供设计理解的状态类别（不是工程枚举） | 必须遵守的法律/产品边界 |
|---|---|---|---|
| InvestorAccount / LegalRepresentative | M08账户 + M09实际核验 | Registered, VerifiedEmail, AuthorizedRepresentative, Suspended | 登录≠KYC，授权代表可与实际法定持有人不同 |
| Investor KYC/KYB/AML | M09及适格X | NotSubmitted, Submitted, NeedsInfo, Verified, Rejected, Expired, Unknown, AMLBlocked | KYC Verified≠所有Offering都可认购；Unknown/禁止不能放行 |
| OfferingSpecificEligibility | M09＋M05有效条件 | NotChecked, Eligible, NotEligible, NeedsReview, Expired, Unknown | 必须按每轮Offering/有效时点，不能跨Tenant自动复用原件 |
| WalletControl / Receiver | M07 Token接收合法性＋M08钱包操作，适格X | Unbound, ProofPending, Verified, Invalid, Restricted | 付款来源地址≠合法持有人≠Token接收地址 |
| Quote / SubscriptionOrder | M10，M06有权签署版本 | Quoted, AwaitingSignature, OrderSubmitted, PendingPayment, Expired, CancelRequested | OrderCreated≠已付款/已配售，旧Quote和签名证据不可覆盖 |
| SeriesCapacity / Reservation | M12 | Available, Reserved, PendingUnknownProtected, Released, Frozen, Allocated | 容量跨轮次唯一，预留过期不代表没有已发送或迟到的真钱 |
| ActualInvestmentPayment | M11＋依法有权收款X | InstructionIssued, Submitted, Observed, PendingFinality, FinalMatched, Underpaid, Overpaid, WrongChain, Unknown | Tx广播/节点ACK≠FinalMatched，已收真钱事实不能手动删 |
| Allocation | M12＋Issuer受权审批权 | PendingGuard, PendingApproval, Allocated, Blocked, ReconciliationNeeded | FinalMatched≠合法配售；预批准Auto仅在有效守卫下执行 |
| LegalHolderRegistration | M12引用依法有权Issuer/适格X | AwaitingAuthority, Requested, InReview, EffectiveEvidence, Rejected, Unknown, Disputed | 上传/发起≠法律已登记；不一律强制外部登记者 |
| TokenMintDelivery | M07＋受权链Signer/X | NotAuthorized, Ready, Submitted, Confirming, Confirmed, Unknown, Failed, Reorged | Token提交与钱包余额均不等于法定权益交割 |
| InvestorHoldingsView | M08汇总引用M12＋M07＋M13 | PendingAllocation, PendingRegister, PendingToken, Reconciliation, LegallyDeliveredAsApplicable | 只是派生视图，不能另建资金/权利/Token账 |
| RefundCase / RealRefund | M11合法退款真值＋X真实执行 | Requested, Approved, Submitted, Unknown, PartiallyPaid, Paid, Rejected | 退款已批准或已广播≠实退；不得随便撤销已成立权益 |

**五个关键不等式**：KYC Verified ≠ Offering Eligible；OrderCreated ≠ PaymentFinalMatched；PaymentFinalMatched ≠ LegalAllocation；LegalAllocation ≠ LegalRegisterEffective；Token Mint/WalletBalance ≠ Instrument法定权益已交割。真实合法交割以**各Instrument适用的所有必要条件**为准，不对全球工具强制同一登记与Mint时序。

## 二、投资者实际操作→跨端主责→状态变更

| 场景ID | 触发事件 | 必须已满足的产品Guard | 应形成/展示的正确业务事实 | 必须阻断的错误结果 | 唯一主责 |
|---|---|---|---|---|---|
| S03-01 | 依法有权浏览/登录 | M05披露访问权限、M08 Tenant会话 | 允许本人受权资料的显示和账户操作 | 无权Targeted/跨Tenant深链不能访问 | M05/M08/M20 |
| S03-02 | KYC及当轮资格申请 | 合法代表权、M09服务结果和规则版本 | 分别记录KYC与Offering资格结果 | AML限制或Unknown禁止有效认购 | M09/X |
| S03-03 | 外部或嵌入式钱包连接/恢复 | 安全控制权、适用法域、接收钱包与法律持有人映射 | 保留钱包证明与接收资格 | 不得由登录邮箱/支付Tx自动推导Token接收人 | M07/M08/M09/X |
| S03-04 | Quote和必要签署确认 | M05正式条款、M06生效文书/签署、当轮M09资格 | M10固定QuoteSnapshot与合法签署引用 | 无合法必要签署不得发不可逆支付指令 | M10/M06/M09 |
| S03-05 | 唯一订单与原子预留 | 当前Offering窗口及M12合法容量，原Intent幂等 | M10唯一Order；M12一次Reservation | 并发抢最后额度不得超卖 | M10/M12 |
| S03-06 | 真实支付指令 | 合法资金持有人、批准链和币种/合约/金额/期限、适用全部付款前Guard | M11形成受权指令，V可见准确付款参数 | 客服不可任意替换合法收款地址 | M11/X |
| S03-07 | 链观察/最终匹配 | 原真实Tx+Log、网络/币种/Finality与订单金额/来源规则 | M11独立确认FinalMatched或记录Unknown/差额 | 不得用TxHash或发送成功宣称“已支付” | M11/M22 |
| S03-08 | 预留保护/释放及Allocation | M11真实最终匹配、M09当前资格、M10合同、M12容量及公司权限 | 受权Auto/Manual唯一Allocation或待审核 | 迟到账不能复活已释放额度；实付≠已配售 | M12 |
| S03-09 | 法定登记申请/确认 | Instrument法域、登记主体有权、合法Allocation及文件 | M12引用真实权威生效证据与时点 | 不得以Issuer/Provider普通回执冒充名册完成 | M12/X |
| S03-10 | Mint和Token接收 | 经授权Allocation、合法接收钱包、受权Signer和链证据 | M07记录实际Mint、链确认/Unknown并核配售名册 | Unknown先查原意图，不能重复Mint | M07/X |
| S03-11 | 持仓/退款与异常并列展示 | 当前真实M10/M11/M12/M07事实及Instrument必要交割条件 | M08按事实派生显示待交割/已交割及独立退款 | 不得用总状态覆盖已收真钱、合法权益或未偿付款 | M08/M17/M20 |

**角色权限分层（产品Approved）**：V是Issuer旗下受权真实投资者，可对本人身份/钱包/订单签署、查询及受权付款；I仅具备合同和法律授权的员工/公司批准人才能审核资格、配售、资金退回、登记或委托X；P仅按Tenant最小权限处理平台健康/安全和技术异常，不拥有真实认购款、法定名册或Mint私钥；X按实际法域分别作为持款人/登记者/钱包或电子签主体，Provider200/回调Success不自行让业务变Paid/Registered/Minted。

## 三、DEC-032已批准的R01～R06不变量

### R01｜投资者身份、钱包与法律主体隔离

账户、自然人/机构资格、公司代表、当前Offering资格、支付钱包和Token接收钱包分别建立合规关系。法域允许时可先看公开信息；实际有效下单/付款前核验M09及适用AML、M07钱包合法控制权。跨Tenant原始KYC不无授权共享，嵌入式钱包方案仍待安全和法域审批。

### R02｜唯一Quote/合同/签署/订单及M12原子Reservation

当前Offering有效报价固定法定认购单位、价格、费用、Instrument和法律文件版本、期限与必要受权签署证据。M10唯一订单、M12唯一容量预留；真实不可逆付款指令发出前全部实际Guard有效。签署与配售的步骤允许合法时序变化，不允许永久绕过法律前置。

### R03｜真钱Finality/Matched与展示分开

链上广播、服务节点Observed、确认数、最终性、M11合法订单匹配是不同业务事件。只有经M11确认**FinalMatched**才可以向V宣称认购款实收已确认；少多付、真实两笔与重复Webhook、错链假币和迟到账应准确记录。合约收款优先评估但不是法定持款或唯一收款强制架构。

### R04｜资金已实收仍须合法配售最终守卫

M12跨Series/Offering统一容量、预留、冻结、释放和配售。合法实收之后必须复核M09当前资格、M10原合同、M05 Instrument/销售授权及公司合法配售条件。经事前批准且依法可自动的基础策略可执行Auto，否则由合法受权人审核。已释放预留不能被迟到账复活占额。

### R05｜Allocation、法定登记与Token交付

M12 Allocation不能替代实际有权Issuer/登记者的合法权益确认，Issuer自管/委托/法定指定三模式依法适用。M07根据获批配售、合法接收钱包和Signer权限执行真实Mint，并核链Finality。全部必要交割条件成立才能派生最终持仓；Token余额本身不是名册。

### R06｜取消/退款/迟到账/Unknown的四端多状态

M08一笔订单并列展示本人资格/签署、M10订单和预留、M11实际款与退款、M12配售与名册、M07链交付。M17与M20跟踪异常审计，M22仅外部连接；退款是经法律审批后由X真实出款的一笔独立交易，不能把Cancelled/RefundApproved当实际钱已退。已产生有效权益不因普通取消或Tenant退租被撤销。

## 四、16类异常及真实恢复责任（产品行为Approved，工程执行Draft）

| ID | 触发场景 | 必须遵守的业务结果 |
|---|---|---|
| E03-01 | KYC有效但该Offering不Eligible | V只看合法范围信息，不得有效购买，M09留资格证据 |
| E03-02 | 付款后KYC/AML资格失效或撤销 | 保留M11实收、M12暂停不合法配售，由有权人退款/调查 |
| E03-03 | 跨Issuer引用KYC原件无授权 | 默认Tenant隔离、只在合法范围受权复用核验结果 |
| E03-04 | 付款钱包与接收钱包不同 | 核合法身份/控制权，不能从转账From推断Token Receiver |
| E03-05 | 并发抢购Series最后额度 | M12原子预留与唯一发行容量不可超卖 |
| E03-06 | 已广播/链Unknown或重组 | M11待核并保留真钱可能性，M12预留保护，禁盲退款/配售 |
| E03-07 | 少多付、假币及错链 | M11独立分类和受权调查，不承诺错链一定可追回 |
| E03-08 | 两笔真实转账/重复Webhook | 不同真实Tx分别记、同链TxLog重复通知只记一次 |
| E03-09 | 预留过期释放后迟到账 | 不能抢别人已合法容量，真实资金调查/退款受权处理 |
| E03-10 | 报价/合法签名版本付款中变化 | 旧Quote/签署不覆写，新条件需依法补充确认 |
| E03-11 | 已实际收款但禁止配售或取消订单 | 保留M11收款真值，冻结M12非法配售，退款需独立真正执行 |
| E03-12 | Mint链完成但合法登记Unknown | M07链真实完成可单独显示，M12法定权利不得假报 |
| E03-13 | 法定登记有效但Token Mint失败/Unknown | 保留法定权益，查原MintIntent、受权修复避免重复 |
| E03-14 | 钱包恢复或Receiver变更 | 需重新证明合法控制/持有人关系，不能自动搬迁合法名册 |
| E03-15 | 退款批准但出款Unknown | M11先查原RefundIntent，不显示已退、不盲重复出款 |
| E03-16 | Offering关闭或SaaS欠费/退租 | 原订单/真钱/登记/Token及未了义务按法律规则保存可交接 |

## 五、投资者与Issuer端如何同时展示各自的真值

| 场景 | V投资者应看到 | I Issuer应看到 | 严禁 |
|---|---|---|---|
| KYC通过但当前Offering不合格 | “该轮认购受限／依法允许补件” | M09资格决定版本和有权复核人员 | 自动发真钱付款指令 |
| 已签署/预留但尚未付 | 当前Quote、签署证据及支付截止 | M10订单与M12预留状态 | OrderCreated即成交 |
| Tx广播但未最终确认 | “交易处理中／资金待核” | M11原Tx/Log及Finality/Unknown、M12待核保护 | 提前配售/盲释放额度 |
| 真款FinalMatched、配售未完成 | “实收已确认、待配售” | M11真实实收与M12资格/额度/审批门 | 投资者端冒充已持仓 |
| 已配售但登记或Token待核 | 两项分别显示，必要条件未满足前“交割处理中” | M12有效名册证据、M07链结果差异任务 | Mint或提交登记即法律交割完成 |
| 退款已批准但出款Unknown | “退款处理中/核验中” | M11 RefundIntent及有权X实际出款结果 | 宣称钱已退或重复出款 |
| Issuer暂停或SaaS退租 | 依法允许继续查未结款/权益及通知 | M10/M11/M12/M07原事实与合法交接责任 | 删除真实金融义务 |

## 六、产品验收断言（均Not Executed）

| 编号 | 未来应验证的业务结果 |
|---|---|
| T03-01 | 身份核验与Offering-specific资格不混淆，KYC通过仍可被该轮拒绝 |
| T03-02 | 同人跨两家Issuer资料隔离且订单与名册互不可见 |
| T03-03 | 不同付款钱包/Token接收钱包可在合法约束下受权验证 |
| T03-04 | 同一Intent重复点击不能双订单、双Reservation、超卖 |
| T03-05 | 必要合法签署/报价/预留无效时禁止真实付款指令 |
| T03-06 | Tx广播/Observed/Unknown不得冒充FinalMatched或导致自动配售 |
| T03-07 | 错链、假币、少多付保留独立真实事件和受权待办 |
| T03-08 | 同Tx重复回调不会重复记款，不同真Tx可累计 |
| T03-09 | 已释放预留迟到账不得超发，真钱仍被记录 |
| T03-10 | 实付后资格失效不违法配售，不删除真实收款 |
| T03-11 | Allocation与名册生效、Mint Finality分别展示 |
| T03-12 | Mint成功但登记Unknown不得标完整法定权益 |
| T03-13 | Issuer合法自管、受托、法定强制外部登记者三模式按法域审查 |
| T03-14 | 退款批准/发送/Unknown不得标已退款，重复通知不多退 |
| T03-15 | 退出订阅、暂停Offering不抹除真实旧账/法定义务 |

目前没有进行浏览器E2E、真实服务Sandbox、签署、实际USDT/USDC、链Mint或法规验收测试。**不可将上表标PASS**。

## 七、后续实现及法域独立决策门（全部Draft）

- 具体KYC服务商、AML目的/共享/留存、法律主体和实际Signer权限；外部或嵌入式钱包的MPC/智能账户/恢复、Gas及付款与持有地址模型；
- 合法收款方/资金托管、USDT/USDC真实链与代币合约配置、最终性确认阈值、对账、退款与真实钱款争议解决；
- Instrument实质法律权益、Issuer登记权/强制登记机构、配售生效和Mint先后及Token标准、法定税费与转让限制；
- 领域schema、币种/Token金额精度、状态enum、幂等键、Quote/Reservation超时与Unknown处理算法、Webhook/API错误码和安全性能；
- V1依法可用持续认购和基础配售为现行范围，依法必需集中募集则Step06冻结前正式重审相关V2功能归属；
- **本规范只承接DEC-032六项A，Step05-04新增规则待用户审核、Step06整体V1 Frozen未批准**。四份Frozen、历史DEC/SCOPE、193项主表不改，PR #6 Draft/Open/Unmerged，不进入UI/软件开发或真实金融生产。

**业务状态Approved仅产品语义；英文状态名、API、技术字段、执行及测试仍Draft/Not Executed。**
