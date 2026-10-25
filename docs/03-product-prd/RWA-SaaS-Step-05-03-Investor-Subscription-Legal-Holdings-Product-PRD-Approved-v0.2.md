# RWA SaaS｜Step05-03 投资者KYC、认购、真实付款、配售登记及Token交付：产品级详细PRD（Approved v0.2）

> **2026-10-25｜产品级Approved：Step05-03-R01～R06已获[DEC-032](../../decisions/DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md)明确六项A批准。** 本文件仅业务流程、角色责任、状态语义和受权异常产品规则Approved；字段/schema、工程enum/API、法域与合法持款、钱包/Signer/合约及测试仍Draft/Not Executed。V1整体未Frozen，不进入UI/代码/真实金融生产。历史[Step05-03 v0.1可视化Draft](RWA-SaaS-Step-05-03-Investor-KYC-Subscription-Payment-Allocation-Register-Token-Visual-PRD-Draft-v0.1.md)保留不动。

**阅读依据**：[S04-04投资者/订单/配售登记Approved](RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)｜[S04-05资金/收益Approved](RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)｜[S04-03 Token Approved](RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)｜[S04-07投资者门户Approved](RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)｜[S04-09外部服务Approved](RWA-SaaS-Step-04-S04-09-External-Authority-Service-Adapters-Approved-v0.1.md)｜[DEC-022合法名册和地址后绑定](../../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)。

## 一、完整购买到合法持仓的产品级业务主流程（R01～R06 Approved）

```mermaid
flowchart TD
 A["V 当前Issuer受权Offering详情"] --> B["V 登录/建立合法投资者账户"]
 B --> C["M09 独立KYC/KYB/AML与本Offering资格判断"]
 C --> D{"资格和钱包控制/接收方案符合合法约束？"}
 D -- "补件/拒绝/Unknown" --> E["V受限提示，I合规受权处理"]
 D -- "有效" --> F["V 选择法律认购单位/金额"]
 F --> G["M10 固定Quote条款/费用/版本及必要M06签署"]
 G --> H["M12 原子容量Reservation + M10唯一Order"]
 H --> I{"所有付款前置Guard满足？"}
 I -- "否" --> J["原意图补件/重报价，不下发真实支付指令"]
 I -- "是" --> K["M11 受权USDT/USDC链/币种/收款对象/金额/期限"]
 K --> L["V 支付钱包发起真实交易，X适格持款/链服务观测"]
 L --> M{"M11真实最终性与订单Matched？"}
 M -- "Observed/Unknown/不足/错链等" --> N["资金待核/差额调查、M12预留保护，禁自动配售"]
 M -- "FinalMatched" --> O["M12复核最新Eligibility/合同/余额/发行授权"]
 O --> P{"依法可配且容量合法？"}
 P -- "否" --> Q["保留真钱事实，受权退款/差异处理"]
 P -- "是" --> R["M12受权Auto或Manual唯一Allocation"]
 R --> S["M12合法登记证据 / M07受权Signer Mint与链Finality"]
 S --> T{"本Instrument所需交割条件都已真实确认？"}
 T -- "否/Unknown" --> U["V按事实显示已配售/登记或Token待核，I异常升级"]
 T -- "是" --> V1["V合法持仓完成，独立显示Token与锁定状态"]
```

**重要**：上图用于让用户理解依赖关系，并不强制所有法域统一“先签署后创建订单”或“先登记后Mint”；必要法律签署须在不可逆付款前按适用条件满足，法定登记与Token的执行先后依Instrument合法时序决定。**真正的订单、资金、Allocation、登记与链执行必须各有独立事实来源。**

## 二、四端逻辑页面/动作与唯一权威（产品Approved，具体路由Draft）

| 页面/阶段 | 投资者或发行机构的实际操作 | 唯一领域真值 | 不能错误视为完成 |
|---|---|---|---|
| V01 入口/账户 | 合法获授权Offering详情 | M05发布及M08页面 | 按访问授权披露；尚未KYC可依法先阅读 |
| V02 认证/资格 | 自然人/机构、代表、补件、风险筛查与本Offering资格 | M09身份/AML/Eligible、M08导引、X适格核验 | 个人/机构KYC与Tenant商业KYB分离 |
| V03 钱包 | 外部钱包连接或经审核的嵌入式创建恢复、Token接收绑定 | M08钱包体验、M07接收地址守卫、X合法钱包服务 | 登录账户/法定持有人/付款来源/接收钱包不自动相同 |
| V04 确认认购 | 法律单位/金额、QuoteSnapshot、合同/风险版本、必要签署 | M10订单Quote、M06生效签署、M12容量预留 | 确认/签署/预留各自独立，失败不得显示可付指令 |
| V05 支付页面 | 合法链币、目标、金额、期限与钱包操作、查询 | M11受权PaymentInstruction/收款实际证据、M22链观察 | 钱包签名/广播≠实收，必须显示Unknown核查 |
| V06 我的订单 | 订单、实收/配售/登记/Token与退款多段进度 | M10汇总视图，M11/M12/M07独立事实 | 保留已付款但未配售、已配售未登记等真实状态 |
| V07 我的持仓 | 合法权益、登记生效条件、已交付Token和差异 | M12合法权益/名册，M07 Token执行，M08展示 | 仅Instrument规定必要条件满足时表示完整合法交割 |
| I01 投资者合规 | 实名核验、AML、当前Offering合规/人工复核 | M09＋X法定核验 | 合规人员不因权限自动越过制裁/法定限制 |
| I02 认购订单 | Quote/签署、唯一订单、预留、合法取消 | M10，M12容量，M06文件 | 运营不能手改实收或法定权益 |
| I03 资金对账/退款 | 链观察、真实最终性与匹配、付款差异与合法退款 | M11＋受权财务及X合法持款/Signer | 退款批准≠出款，Unknown要核原指令 |
| I04 配售登记交付 | 适用Auto/Manual Allocation、登记证据、Mint与差异对账 | M12容量配售/法律登记；M07链执行 | 受权配售/名册/链事实分别保全 |
| P01 平台运营支持 | 跨Tenant隔离下受权查看最少状态、异常升级、审计 | M03/M17/M20/M22 | 不得自行批准法定配售、登记、退款、Mint或读取私钥 |

**P/I/V/X分工**：P=SaaS商业/基础设施/安全最小权限支持；I=Issuer法定发行及合规、资金/配售/存续团队；V=Issuer自己拓展的合法受众，独立门户账户；X=受权身份核验、钱包/Signer、合法资金持有人、名册登记等实际主体，X可能是依法获准的Issuer自己或适格独立机构。P不是默认实际资金托管、登记者或Mint私钥管理者。

## 三、必须保留的10条独立业务事实和主责

| 独立事实 | 唯一主责 | 必须保持独立的理解 |
|---|---|---|
| Account与代表身份 | M08账户/M09投资者KYC | 注册≠KYC Verified≠合法代理人授权 |
| Offering适格决定 | M09核验版本、M05资格条件 | Verified≠Eligible；后续资格撤销不会覆盖历史判定 |
| 钱包控制与接收绑定 | M08入口/M07接收资格/X合法钱包服务 | 钱包Connection≠法律持有人资格；转账发送地址不必是Token接收地址 |
| Quote与认购订单 | M10 | OrderCreated≠Paid；Quote旧版本不因发行方改价被覆盖 |
| Series容量与预留/配售 | M12 | 有效预留、已配售、异常冻结不得重复计数；Token供应量≠法律上限 |
| 真实链收款与订单匹配 | M11与合法实际持款X | Tx广播/Observed/Unknown≠FinalMatched；多笔真正收款需累计 |
| 法定持有人登记 | M12与依法有权Issuer或X登记者 | Allocation Approved≠合法名册已生效 |
| Mint及Token交付 | M07链事实和X受权Signer | Submitted/Minted≠合法权益全部交付 |
| 退款与资金恢复 | M11及依法有权执行资金主体 | RefundApproved≠PaidRefund；不得按提现来源猜退款地址 |
| 最终订单/持仓视图 | M08展示/M10聚合，M12/M07提供权益与链事实 | 不得用单一bool宣称完整交割，Token余额≠法律权益 |

**投资者端产品级要求区分的最小业务状态（以下具体文案/enum仍Draft）**：\
①等待身份/资格 → ②报价/签署与预留 → ③待支付／实收待核 → ④实收已确认、待配售 → ⑤已配售、合法登记待核 → ⑥登记或Token执行待核 → ⑦满足该Instrument合法必要条件的持仓已交割；另有**退款申请→批准→实际已退款**独立轨道。上述为**给用户阅读的建议词**，不是系统已冻结enum，也不表示每个法域都遵循完全相同的法律时序。

## 四、DEC-032批准的R01～R06六项业务规则

| 已批准项 | Approved产品行为方案A | 不得越过的边界 |
|---|---|---|
| **Step05-03-R01｜投资者身份、当前Offering资格与钱包分离** | 合法公开资料按访问权限允许先看；点击购买前补齐自然人/机构KYC、AML、当次Offering-specific Eligible及本人/代理授权；外部钱包与至少一种安全合法嵌入式钱包都是入口选项，付款来源钱包、Token接收钱包与法定持有人不强制同一地址；钱包控制权另核。 | KYC通过不自动获得所有Offering资格；钱包Connected不代表实际持有人或能自动Mint。 |
| **Step05-03-R02｜一笔交易的Quote、文件签署、订单与唯一预留** | 投资者输入法律认购单位/金额后，确认价格/费用/版本/期限及风险；必要签署有真实有效证据后，才对M10唯一订单提出M12原子预留并生成M11已批准的付款指令；顺序在适用法域及发行工具约束下允许必要合法重排，但**任何不可逆付款前必须把相应Guard核实**。 | 一个订单并不自动证明钱已到账；Quote/签署/预留因超时和重试必须能引用原Intent。 |
| **Step05-03-R03｜真实稳定币付款与“已支付”展示** | 投资者看到已批准网络、Token合约、合法收款对象、应付金额和期限；付款发起/广播/到账观察/链最终性/合法订单匹配分阶段显示；只有M11确认FinalMatched时才展示“实收已确认”；少付、多付、错链、假币、迟到、Unknown独立提示和处理，不许凭截图或txHash跳过。 | M11资金事实与M10订单状态分离；不规定USDT/USDC必须由某一固定合约/托管商接收。 |
| **Step05-03-R04｜预留、配售及最后不可逆审核** | M12唯一跨Offering、跨Series/股类计算容量，受控预留、冻结和释放；M11实收最终匹配后仍复核M09当前资格、合同版本、法域发行/公司授权和剩余额度；适用预批准自动基础配售，否则需受权人工配售，产生唯一Allocation及可追踪决定。 | 付款成功并非自动配售；预留到期时链上Pending/Unknown应保护核查，已合法释放的迟到账不能抢回别人的容量。 |
| **Step05-03-R05｜合法名册、Token交付与持仓分别确认** | 配售后按实际法域由依法可自管的Issuer或合法受托/强制有权登记者记录及确认名册；M07按获批Allocation、合法钱包及Signer权限实际Mint、核链最终性；二者遵守Instrument适用顺序并单独显示，满足该Instrument的所有必要交割条件后才标“合法持仓已完成”。 | Token余额不是法律登记；已登记但Mint失败和Mint成功但登记Unknown都不是完整交割。 |
| **Step05-03-R06｜迟到账、取消、退款与四端异常同步** | V端同一订单详情分栏展示资格/签署、订单/预留、实际实收、配售/登记、Token交付及退款，不采用单个“购买成功”绿色状态。迟到账、资金匹配但资格变更、错链/多付/少付、取消后真款到账、Token或登记Unknown均由M17建立有权任务，M11合法退款需要独立审批/真实付款证据，P端只做最小权限故障支持；已产生合法权益的订单不能用普通取消或退款按钮撤销。 | 退款已批准不等于钱已退；在途业务/已持仓法律义务不能因Offering停售或Tenant退租消失。 |

这些属于对既有DEC-017/022/023/025业务事实的**跨端用户体验与业务状态细化**，而不是增加146项之外的新核心ID。**DEC-032已正式批准R01～R06全部A**。具体字段、API、实际KYB/KYC服务商、原子预留和链/签名方案仍Draft，不可擅自生产执行。

## 五、独立异常与受权修复（E03-01～E03-16；产品保护Approved，测试Not Executed）

| 编号 | 业务异常 | 用户/平台必须达到的安全结果 |
|---|---|---|
| E03-01 | KYC Verified但当前Offering不适格 | V可按法定范围阅读，不得生成有效新订单，M09留独立资格决定 |
| E03-02 | KYC被撤销/过期发生在已支付之后 | M11保持真实收款，M12冻结非法配售，走有权差异/退款处理 |
| E03-03 | 同账户跨两个Issuer使用旧证件与钱包 | Tenant隔离且核合法跨域授权；不同Issuer订单/名册不相互引用 |
| E03-04 | 付款来源钱包与Token接收地址不相同 | 依身份/控制权/法域独立绑定，不自动从付款Tx源地址Mint |
| E03-05 | 并发最后额度抢占 | M12原子预留，不得超总法律发行额度或重复占用 |
| E03-06 | 付款广播但链上Unknown或短重组 | M11待核，M12暂保护，禁止新配售或盲退款 |
| E03-07 | 少付/多付/错链/假币 | M11记录真实资金与差异，冻结自动配售及依法调查/受权退款 |
| E03-08 | 两笔真实转账或重复Webhook | 真实不同Tx按规则分别记账；同一Tx/Log重复回调幂等不重复计收 |
| E03-09 | 预留过期/合法释放后迟到账 | 不得重新抢占已售额度，必须记录真实收款并按受权流程处置 |
| E03-10 | Quote/签署文书变更但付款准备中 | 重新校验版本并依法必要再确认/重签，不重写旧证据 |
| E03-11 | 已付款但Allocation失败/遭禁止 | M11实收不消失、M12保留失败证据，依法退回/调查而非一键抹单 |
| E03-12 | 合法登记结果Unknown但Mint链上成功 | 分别显示链事实与权利待核；查询原登记请求、不得重复签名 |
| E03-13 | 法定登记已完成但Mint失败/Unknown | 保留合法权益，M07按原Intent核链后受权修复，不能多Mint |
| E03-14 | 钱包恢复或接收地址更换 | 重新校验控制权/法定持有人及必要法律限制，不自动迁移已登记权益 |
| E03-15 | 退款已Approved但实际出款Unknown | M11与X查原RefundIntent，不显示已退款、不重复出款 |
| E03-16 | Offering关闭、SaaS欠费/退租时仍有在途业务 | 保留M10/M11/M12/M07实际状态、投资者合法查询和法定义务/交接 |

## 六、跨模块一致性结论（静态产品设计，非运行验收）

**静态对账结论（仅依据现有已Approved功能文档）**：

1. **M08操作入口完整**：注册/登录、Offering披露、KYC引导、认购确认、稳定币支付、订单/退款、持仓/登记Token、外部和嵌入式钱包都有已批准的对应V1功能。
2. **订单→真钱→合法配售→法定登记→Token全部具有唯一主责**：M10、M11、M12、M07分别持有事实，M08只消费多业务源状态；M17/M20/M22提供任务、审计、技术适配，不另建立第二套法定资金或Token结果。
3. **两个结构性关键门尚未落地**：首发法域/具体Instrument确定资金持管、合法登记时点与权限；钱包/实际Signer及合约的部署/退款/Mint控制权需技术、法律与安全专项，不可说“已经能真实支付和Mint”。
4. **细化前需要标注的体验风险**：支付Pending时预留到期保护、错链/少多付及迟到账、不合规的已收真款、登记和Mint最终性不同步、合法持仓与Token钱包余额含义不同。
5. **V1默认合法适用持续一级认购/基础配售**；若首发法域/Instrument依法必须集中募集，须在Step06冻结前对M05-F011/M10-F009/M12-F009/F010等V2版号提出独立正式重审，不能在本场景擅自并入V1。

**DEC-032已批准本场景R01～R06六项产品行为；本v0.2是产品级Approved，而非仅视觉审核Draft。** 字段类型、原子预留算法、金额精度、KYC服务商、法域、实际链确认数/持款方案、合法登记模式、受权Signer、退款合约与真实生产执行仍Draft/待独立批准。16种异常的产品保护原则对应已批准业务规则，全部测试Not Executed。

## 七、产品级审批范围及尚未批准的技术/法域/执行责任

DEC-032已形成正式六项A决定。本产品级PRD只批准R01～R06业务规则；[Step05-03跨端状态与异常规范Approved v0.1（产品层）](RWA-SaaS-Step-05-03-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)承接独立业务事实/异常；[Step05-04收益到期退出可视化Draft](RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)将进入下一场景审核但新提案全部未Approved。V1整体Frozen需另行批准，Frozen、旧DEC/SCOPE及PR #6不修改。

**当前状态：Step05-03产品级PRD Approved v0.2（仅DEC-032 R01～R06产品规则和既有Step04原则），工程字段/schema、状态enum、接口、法律有效性/资金Signer/合约生产和全部实测仍Draft/Not Executed；Step05-04仍为未批准的可视化Draft。**


## 八、开发和运营阅读的唯一权威速查（R01～R06业务层Approved）

| 用户实际操作阶段 | 现有唯一业务主责 | 产品必须展示或执行的Guard | 禁止误解 |
|---|---|---|---|
| 注册/准入 | M08/09 | 账户、KYC/AML、Offering-specific Eligible分离；依法允许浏览时不必先全部KYC | KYC通过不代表任何Offering可买 |
| 钱包与法定主体 | M08/M07/M09/X | 法定投资者、代理人、实际付款钱包及Token接收钱包分开核准 | 不能按交易发出地址盲Mint |
| 报价/签署/合同 | M10/M06 | 锁定法律单位、价格/费用、有效Quote和文件版本；必要签署合法生效 | 合同Unknown/过期不允许非法真款指令 |
| 唯一订单/预留 | M10/M12 | 重复点击按原Intent幂等；M12统一Series类别的原子预留和冻结 | 不能跨Offering超卖 |
| 真钱付款/退款 | M11/X | 批准的链、币种、金额、收款方/期限；最终性＋合法匹配才能显示实收 | 广播/txHash/截图或退款批准不等于实付 |
| 最终配售 | M12/M09/M10/M11 | 实时重核资格、原合同Quote、实收和额度；适用批准自动策略或有权人工审核 | 实收≠已合法配售，不能双配 |
| 权威登记 | M12/X | Issuer依法自管或按要求委托/指定合法登记者，引用生效证据 | 上传/提交/Provider200不等于法定登记完成 |
| Token真实交付 | M07/X | 获批Allocation、钱包控制/资格/Signer以及链Finality独立核验 | Mint广播/钱包余额不等于完整法定权益 |
| 投资者最终持仓 | M08引用M12/M07/M10 | 依Instrument所有必要权利交割条件满足才显示完整合法持仓 | 登记Unknown或Mint失败不能把订单整体标成功 |
| 异常与恢复 | M17/M20/M22引用权威事实 | 真款迟到、金额不符、撤资格、交易Unknown和退款待核可查可追 | 客服不能凭主观改真款/法定登记/Token |

### 四端如何交接

- **V投资者端**：按法域和Offering访问权限浏览，提交个人或机构KYC及合法代理证据，连接外部或合法嵌入式钱包，Quote/签署/下单/支付，查本人多阶段真实进度与必要合法证明。
- **I发行机构端**：受权合规审核、订单预留/配售、资金实际最终性匹配/退款、法定登记证明与Token链证据对账，拥有真实职责或依法委托适格X；运营员工不能代行资金签名或法定名册决定。
- **P SaaS后台**：商业Tenant隔离、安全审计、外部服务技术健康和受权异常升级的最小访问；**不作为所有Issuer默认法定登记者、托管人、签名方或退款执行人**。
- **X受权外部/发行方有权主体**：身份/AML、电子签、依法受权资金持有与支付、法定登记、真实钱包与Token Signer分别承担自己的法域权限和结果；Webhook ACK不能直接改写M11/M12/M07真值。

## 九、跨端字段/状态关联：仅定义必要业务关系，**技术字段全部Draft**

| 关联对象的必要关系 | 真值归属 | 产品展示及证据要求 |
|---|---|---|
| InvestorIdentity↔OfferingEligibilityVersion | M09 | 每轮资格与核验版本独立，失效不改历史已批准时点 |
| InvestorLegalHolder↔PayWallet↔TokenReceiver | M09/M07/M08/X | 法定持有人与两类地址可不同，但必须具备受权合法控制及限制匹配 |
| QuoteSnapshot↔DocumentVersion↔SubscriptionIntent | M10/M06 | 旧合同、价格及签署引用不可因Issuer更新Offering被静默覆盖 |
| SeriesCapacity↔Reservation↔Allocation | M12 | 跨轮共享合法容量、预留/冻结/释放与已配售避免重计 |
| PaymentInstruction↔RealTxLog↔Finality↔MatchedFunds | M11 | 实收唯一，重复回调与两笔真正支付有区别，Unknown要调查 |
| Allocation↔LegalRegisterEvidence | M12/X | 合法登记主体、版本和实际生效证据，不能从Token余额推导 |
| Allocation↔MintIntent↔ChainFinality↔Receiver | M07/M12/X | Mint不超法定获配；依实际法域处理登记/Mint合法顺序 |
| Order↔RefundIntent↔ActualRefundEvidence | M10/M11/X | 退款批准、链发送与真实已退款分开，保留原实收证据 |

表中英文对象名是**模型候选**，未批准字段命名、类型、工程状态枚举、接口/幂等算法或钱包私钥管理。

## 十、未来产品验收断言（规则Approved，测试Not Executed）

| ID | 研发/QA未来需要验证的业务结果 |
|---|---|
| U03-01 | 有效KYC但当前Offering不Eligible，仍禁止有效下单 |
| U03-02 | 两个Issuer之间无授权不共享身份证件、订单或名册 |
| U03-03 | 外部与嵌入式钱包入口满足合法安全前置且与法定身份/付款钱包区分 |
| U03-04 | 同认购Intent双击或超时不会新增第二Order/Reservation |
| U03-05 | Quote/签署/预留未满足合法付款Gate不生成可执行支付指令 |
| U03-06 | Tx观察或Unknown时不标实收也不自动配售 |
| U03-07 | 少多付、错链假币进入受权异常调查，不消除真实已到账的证据 |
| U03-08 | 真实不同Tx各自保留，同Tx Log重复回调不会多记实收 |
| U03-09 | 预留保护与迟到账不导致已售份额超卖 |
| U03-10 | 实收FinalMatched而资格撤销时阻止违法配售并独立保留真钱 |
| U03-11 | 登记Unknown而Mint链完成时不显示交割全部完成 |
| U03-12 | 合法登记完成但Mint失败/Unknown时不丢法律权益 |
| U03-13 | 按法域允许Issuer自管/委托/强制登记者路径，拒绝无资格登记 |
| U03-14 | 退款已批准或出款Unknown不会冒充实际已退、不盲重发退款 |
| U03-15 | Offering关闭/Tenant欠费或退租不删除历史未结订单、真款与法定权益 |

**尚未执行任何测试，不能写PASS。** 适用法域、实际持款/法定登记及Signer、真实USDT/USDC链上最终性、钱包嵌入式安全架构、精确合同/Token协议、退款目的地址确认、工程API/字段/schema、自动配售算法及Gas均须独立后续审核。若首发依法强制集中募集，必须Step06冻结前重审DEC-017版本归属，不得私加V2功能。

**本稿不改变四份Frozen、任何旧DEC/SCOPE、193项V1 146/V2 22/V3 20/TBD5版本表，不合并PR #6或提前启动UI、研发及真实金融生产。**
