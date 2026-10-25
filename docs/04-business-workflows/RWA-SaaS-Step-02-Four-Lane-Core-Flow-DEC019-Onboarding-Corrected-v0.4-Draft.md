# RWA SaaS｜Step 02 四泳道完整客户业务流程 v0.4（**核心11步业务流程 Approved / 详细流程 Draft；DEC-019顺序勘误**）

> **核心业务主流程沿DEC-014 Approved，详细执行细节仍Draft（2026-10-25更新）**。本版继承v0.3历史内容，只对企业商业开通的L0/L1-A流程和现行阶段导航进行**DEC-019后续生效勘误**，不更改核心11步目标、不改DEC-014/019、任何Frozen或193项功能版号。本版由 [v0.2 审图草案](RWA-SaaS-Step-02-Four-Lane-Core-Flow-Expanded-v0.2-Draft.md)依据 [DEC-013：CR-01～10 全部 A Approved](../../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)生成 **1张L0四端总图+10张L1分段图**。经 [DEC-014：逐项11/11业务覆盖审查](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)，**Step 02 核心客户业务流程正式 Approved**；无需产品负责人逐条理解技术异常时序。**未批准的是本文件具体技术/法域/资金权威实施方式、187项版本归属与 V1.0最终开发冻结**。下一阶段进入 Step 03 原187项功能双向核验和新增缺口审查，再整理字段级PRD。
>
> **前置权威**：[DEC-012 版本治理原则](../../decisions/DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)；[Batch 01～06 产品最低深度 Approved](../Document-Status-Index.md)；[Frozen WF-01～18](RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)；[187项版本归属 Draft](../03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md)。
>
> **固定四泳道**：P＝SaaS 平台商业/技术运营；I＝Issuer 企业 SaaS；V＝每家 Issuer 独立投资者门户；X＝分立的外部有权主体（合法 KYC/KYB、律师/评估/SPV、资金收付与托管、法定持有人登记、合约签名与链执行、法律送达）。**X 是合并展示的多类角色，不授权任一主体越权代行全部金融/法律行为**。
>
> **关键用词**：图中“CR Approved A”表示产品目标已经产品负责人批准，非具体服务商/技术实现已定。“V1.0首发必需业务闭环”需达到受权资金、权益、Token真正合法可靠执行的条件；当前法域/生产主体、钱包MPC或其它嵌入式方案、合约Factory技术拓扑、收益Claim与Push、法定分配时点继续 TBD。A参考债权有本息和到期义务，B SPV股份只在合法决议/可分配资金及权利条款满足时分红/回购。

> **2026-10-25 现行解释优先级**：邮箱注册→验证→**即时幂等开通14天受限Trial Tenant（KYB前）**→试用期间可提交KYB→KYB有效后确认Standard合同与商业付款→**原Tenant**升级Paid权益→Offering/资金/Token另行履行法域和实际Signer等Gate。Trial到期只读并有30天恢复窗口；真实Paid金融存续义务不能随订阅停止而删除。详见[DEC-019](../../decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)及[S04-01 v0.2](../03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)。[Step04全量审计Draft](../03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)与13项决策门仍未Frozen。

## 00｜用户无需阅读技术时序的七段核心流程（DEC-014 Approved）

> **核心业务流程已审核通过，不要求逐个技术图节点确认。** 下列七段归纳自产品负责人最初的11步原始需求，详细 Mermaid 仅供后续 PRD、工程与合规处理异常时使用。

| 核心业务阶段 | 站在实际使用者角度要做的事情 | 原11步覆盖 |
|---|---|---|
| **01 购买 SaaS** | 企业邮箱注册验证即开14天受限Trial工作台，试用期间可KYB；KYB通过后确认Standard合同和实际商业付款，在原Tenant转正式权益 | 步骤1 |
| **02 配置工作台** | 配企业管理员/人员权限，初始化标准投资者门户，取得独立访问地址 | 步骤2 |
| **03 发行资产** | 选择资产权利类型/模板、准备律师评估和SPV等文件，配置发行额/价格/收益条件并受权部署合约 | 步骤3～4 |
| **04 投资者购买** | 投资者登录、KYC、绑定或创建钱包、浏览、认购、USDT/USDC付款；按合法配售/登记/Mint确认持仓 | 步骤5～7 |
| **05 管理募集资金** | 企业查看销售及资金明细、受限/可结算金额，申请合法划拨并核实际到账 | 步骤8 |
| **06 分配收益** | 依法计算收益/快照和复核、按合同注资、到分配日触发一种合法Push或Claim模式、查看实付/未领记录 | 步骤9～10 |
| **07 存续与退出** | 继续披露和运营，适用时到期清偿/合法回购/注销或冻结Token并追踪后续责任 | 步骤11 |

**关键提示**：企业付 SaaS 费不等于法定可发行，钱包付款成功不等于已经交割，分配到期不等于法律批准/实际资金充足，Claim 需要投资者主动领取；这些必要的安全/法定义务守卫不会因为简化流程图而删除。

## 01｜L0 四端完整客户旅程（总图）

```mermaid
flowchart LR
subgraph P["P — SaaS平台后台"]
 direction TB
 P1["邮箱验证→受限Trial Tenant（14天）"]
 P2["商业KYB→Standard合同/付款→原Tenant转正式权限"]
 P3["第三方连接/平台安全支持"]
 P4["退出/审计保留与责任交接"]
end
subgraph I["I — Issuer企业SaaS"]
 direction TB
 I1["Trial工作台/管理员团队RBAC（生产受限）"]
 I2["标准Investor Portal：Trial私有预览/正式URL受权发布"]
 I3["A债权/B股权模板 + Asset/Instrument + 合法文件"]
 I4["Project + Offering + 法定发行条件"]
 I5["合约Factory参数/审核/受权部署与链确认"]
 I6["销售/认购/法定配售与对账"]
 I7["募集资金受限/可结算/划拨及实际到账"]
 I8["法定收益事件/权威快照/真实注资/分配计划"]
 I9["债务清偿/回购及权利终结"]
end
subgraph V["V — Issuer投资者门户"]
 direction TB
 V1["访问发行方门户/注册/登录"]
 V2["KYC + 外部或嵌入式钱包 + Offering资格"]
 V3["浏览/报价/签署/认购"]
 V4["USDT/USDC钱包支付"]
 V5["法定权益/Token/订单持仓查询"]
 V6["收益实付/自动分配或Claim/未领取记录"]
end
subgraph X["X — 外部受权实际执行"]
 direction TB
 X1["商业/身份/法律/评估/SPV核验"]
 X2["合约审查/部署签名/链Finality"]
 X3["真实收款/退款/法定登记/Mint"]
 X4["募集资金合法结算/企业收款"]
 X5["分红合法决议/出款或Claim合约"]
 X6["清偿/登记调整/Burn/接替权利"]
end
P1-->I1-->P2-->X1-->I2-->I3-->I4-->I5-->X2
X2-->V1-->V2-->V3-->V4-->X3-->I6-->V5
I6-->I7-->X4
I7-->I8-->X5-->V6
V6-->I9-->X6-->P4
I4-.服务接入.->P3
I8-.异常升级.->P3
```

**总图口径**：P1注册成功先开受限Trial，**P2 KYB和商业付款只控制正式Paid升级**，X1为相应核验/商业支付凭证来源；未完成Paid也可进行受限草稿和私有门户预览，绝不能真实募资或Mint。Trial到期按30天受限恢复处理。一个发行项目可有多个 Offering，募集资金结算和收益付款不是单笔串行完成后才允许下一个 Offering；收益多次循环到期。这里主图只表示依赖关系，并不意味着购买 SaaS 后自动获得任何金融经营/发行合法性。



## 02｜L1-A 企业邮箱注册、先Trial、商业KYB及正式订阅（DEC-019后续生效）

> **重要勘误**：v0.3历史图里“企业KYB/付款先于Tenant创建”的顺序**已被DEC-019替代**。以下才是V1.0现行注册与商业开通顺序；本图只纠正后续商业授权门，不改变发行项目自身必须另审的法律/资金/Token生产前置。

```mermaid
sequenceDiagram
 autonumber
 participant I as I 企业用户/Issuer工作台
 participant P as P SaaS平台运营后台
 participant X as X 商业KYB/支付服务
 participant V as V 企业专属投资者门户
 I->>P: 邮箱注册并完成验证
 P->>P: 幂等建立同一个受限Trial Tenant（14自然日）
 P-->>I: TrialActive，进入企业试用工作台
 I->>I: 可建受限草稿/组织/模拟流程
 I->>V: 仅允许私有门户预览/模拟数据
 Note over P,V: KYB非首次Trial前置；禁止生产KYC、真实认购收款、法定登记、Mint或Claim
 opt 企业试用期间提交商业KYB
  I->>P: 递交企业主体/代表/必要文件
  P->>X: 受权核验商业SaaS买方
  X-->>P: Verified / NeedsInfo / Rejected / Unknown
  P-->>I: 商业KYB审核结果、补件或复核
 end
 I->>P: 选择唯一Standard套餐并申请正式开通
 P->>P: 检查KYB是否有效及适用合同授权
 alt KYB未满足
  P-->>I: 不启动合法正式商业收款/开通；可补件或复核
 else KYB有效
  I->>P: 确认Standard条款/商业合同
  alt 自助商业支付
   P->>X: 发起受权商业付款（与投资者募资完全分账）
   X-->>P: Paid / Failed / Unknown（据实复核）
  else 经批准的企业合同例外
   I->>P: 提交适用合同及线下履约凭证
   P->>P: 按受权人工审查验证商业授予条件
  end
  alt 商业合同/实际付款或合法例外未确认
   P-->>I: 保留Trial/受限恢复/付款待核；不赋Paid权限
  else 所有商业Guard满足
   P->>P: 在原Tenant幂等升级Standard商业权限
   P-->>I: 正式工作台与受授权限有效
   I->>V: 仅在Offering另通过合法发布条件后开放正式可见/认购
  end
 end
 opt Trial第14日到期仍未转正
  P-->>I: 到期只读并进入30天受限恢复窗口
  I->>P: 适用期间补KYB/合同与真实商业付款恢复原Tenant
 end
 Note over P,X: 企业商业KYB≠实际发行主体合法许可；Standard付费≠真实资金/Token生产授权
```

**有效范围**：一个客户一份原Tenant生命周期；Trial仅隔离演示；商业付费真实结果Unknown不得直接标记Paid；到期只读与30天恢复由DEC-019/S04-01 v0.2管理；Paid客户已经存在的法定权益、募集资金、退款、收益及本息义务不因欠费被抹除。商业KYB权威在M01，P端操作M03、外部核验适配M22，业务金额M01商业支付与M11募资严格分账。

**历史CR-01批准目标继续有效**：支持标准自助订阅与经批准的企业人工合同例外；本次更新的是**后续DEC-019先试用再商业KYB/付费的时序**，不把任何过去流程图描绘为现行事实。

## 03｜L1-B 团队权限与机构独立投资者门户（Batch 01/04、M15边界）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 域名/身份服务
 I->>I: 初始管理员配置法人/组织/成员/邀请/项目范围
 I->>I: 配RBAC角色:发行、法务、财务、合规、审批、只读
 I->>P: 使用Trial已获得的私有门户预览或请求正式门户发布
 P->>P: 校验Tenant能力、门户身份和租户数据隔离
 I->>I: 设置基础机构名称/Logo/法律隐私链接/公开范围
 P-->>I: 返还受限试用私有预览URL/正式Tenant受权标准URL和访问边界
 I->>I: Trial只允许私有预览；Paid且发行Gate通过后受权发布并管理公开/定向Offering
 Note over P,X: 自定义品牌域名/高级主题/运营商多发行机构独立排V2.0候选
 P-->>I: 回传独立访问地址与预览/发布控制
 I->>I: 配置Offering可见性、邀请策略、投资者运营人员
 I->>V: 公开合法批准的信息；定向Offering需额外访问资格
 V->>X: 注册登录可由安全身份系统协助
 X-->>V: 登录证据、会话/重置结果
 Note over P,X: Issuer基础专属URL不等于M15高级White-label品牌/多发行运营商版本
```

**CR-02 Approved A**：Trial只允许私有预览（DEC-019后续生效）；正式V1.0 标准独立Issuer Portal URL、Logo/信息、门户开关、公开/定向 Offering 访问和安全隔离是首版业务方向；M15-F004 原历史分类仍保持原文，独立自定义域名和高级 White-label 可按 V2.0 候选逐项核验。Issuer Tenant 管理员不自动取得真实发行、资金或合约签名权。



## 04｜L1-C Asset、Instrument、法律结构与适格服务协作（Batch 02）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 资产权属/律师/评估/SPV专业方
 I->>I: 创建Asset:资产类别、地域、控制主体、实际现金流来源
 I->>I: 选择CR-03已批准的V1.0 A债权或B SPV股份受控模板
 alt A 固定票息债权
  I->>I: 填债务人/Series/本金/利率/计息/到期/受偿次序
 else B SPV股份权益
  I->>I: 填SPV主体/股类/投票和分配权/已授权股本/限制
 else 其它如合同租金收益请求权
  I->>I: 未完成该法域权利模型审核，不默认B股份或可生产发行
 end
 I->>I: 关联Issuer/发行人/实际资产权属人与权利义务版本
 I->>X: 上传必要权属、财务/估值、投资者文件及公司证明
 opt 适用法律结构要求专业法律/评估或SPV事务
  I->>X: 企业自主委托适格律师/评估/公司服务主体
  X-->>I: 专业意见/签章/实体状态与材料版本
 end
 Note over P,X: 完整服务商Marketplace后置，平台不自动承担法律/设立公司责任
 I->>I: M06校验按Instrument和法域适用的材料清单
 alt 材料/专业意见/签名/合法发行主体不足
  I->>I: Draft/NeedsSupplement/再次审核；禁止后续非法发行
 else 内部审核可用且满足外部适用权利证明
  I->>I: 受权审核冻结引用的InstrumentVersion
  I-->>V: 待Offering获批准后才披露可投资文件
 end
 Note over P,X: 资料上传或内部审核Approved不等于SPV成立、产权确认或证券发行许可
```

**CR-03/04 Approved A**：有限的 A/B 受控发行字段向导纳入 V1.0 产品方向；M06-F007专业多机构工作台 P1 后置可以保持，最低上传、补件、受权专业意见引用已由 P0 覆盖。发行实体与持有的权利需独立判断，房屋SPV股票、合同租金请求权、债权不是一个“收益型”法定类别。



## 05｜L1-D Offering发行条款、Token合约工厂与正式发布（Batch 03/05）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 法定批准/合约安全/签名及链
 I->>I: 创建Project与Offering轮次;引用已审Asset/Instrument版本
 I->>I: 配法定发行容量、数量/单价/最小认购/募集目标/币种/时间窗
 I->>I: 配KYC/Eligibility、配售、退款、资金额度与披露版本
 I->>I: 选择A债息/到期或B合法可选分配规则及退出条件
 I->>I: 选择受控合约方案/链/Token精度/权利单位映射/禁转Guard
 alt V1.0 选择CR-05受控Contract Factory并经批准
  I->>I: 由模板与批准参数生成部署意图/合约校验计划
 else 需要受权外部已部署合约/特定非合约认购
  I->>I: 引用已批准合同/交付方案并核现有地址和部署证据
 end
 I->>X: 分离法律审核、风险、合约参数与真实签名审批
 alt 文件/发行资格/Token映射/权限不合格
  X-->>I: 审核失败/补件/禁止发布
 else 合法且合约版本已批准
  X->>X: 受权执行部署或确认合约已有地址，查询Unknown原交易
  X-->>I: 已部署地址、artifact hash、Tx最终性与角色权限证据
  I->>I: Pre-Launch Checklist：法律条件+付款/退款+配售+合约限制
  alt 必要前置条件仍缺失
   I-->>V: 仅必要受权预览，不允许新认购
  else 发布审核通过
   I-->>V: 发布可见Offering与合规材料、认购开始时点
  end
 end
 Note over P,X: 发行Token合约/链上认购合约/收益分配合约是可组合选择，不必固定三份，每单不是重新部署合约
```

**CR-05 Approved A｜重要边界**：V1.0目标支持Contract Factory的模板参数、差异校验、受权部署与结果查询；在满足合法授权的前提下可做到“点击发行→系统自动编排合约部署”，但不能预设 SaaS 自持 Mint/Burn 私钥。部署和 Mint 要分开：部署通常发生在有效发布或首次交付前，Mint按合法 Allocation/登记时序发生；链上认购和收益分配是否需要独立合约是技术/法域决策，不默认三合约必需。



## 06｜L1-E 投资者登录、EOA/嵌入式钱包、KYC与Eligible（Batch 04）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 身份/钱包/AML受权服务
 V->>V: 浏览公开许可Offering或获邀请查看定向Offering
 V->>X: 手机/邮箱/其它批准账户方式注册并进行安全登录
 X-->>V: 合法身份会话(不等于金融资格)
 alt 用户选择外部钱包
  V->>X: 连接EOA或合法支持的钱包，签控制权证明
 else CR-06批准的V1.0嵌入式钱包路径（具体架构待审）
  V->>X: 受控创建/恢复钱包，设置密钥恢复与签署权限
 end
 X-->>V: 独立钱包地址/链/控制权证据
 V->>X: 提交自然人或机构KYC/KYB与AML必要材料
 X-->>I: 身份Verified/Rejected/Expired/Unknown及法定范围内证明
 alt 身份不可用或政策禁止
  I-->>V: 补件/冻结或明确拒绝；不能因此销掉旧合法权益
 else KYC有效
  I->>I: 依当前Offering/法域/投资者类别执行Eligibility
  alt 不合资格或钱包未获批准
   I-->>V: 受控拒绝/人工审核或换合格接收地址
  else 合格
   I-->>V: 展示可投资Offering与合法风险/权利文件
  end
 end
 Note over P,X: 账户ID、合法持有人、付款来源钱包、Token接收钱包需分开映射;嵌入式MPC不是独立法定身份
```

**CR-06 Approved A**：V1.0 需可用外部钱包连接与至少一种安全、依法可行的嵌入式钱包；是否MPC/智能账户或其他方案仍由技术/法域 Gate 单独审查，必须详细定义创建/恢复/被盗/签名/Gas/用户与法律持有人绑定。钱包会话不能替代KYC。



## 07｜L1-F Quote、Subscription、预留、USDT/USDC付款与退款（Batch 04）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 受权签署/收款/链观察与退款方
 V->>I: 选择Offering与认购单位/金额
 I->>I: 实时再核Eligibility/有效文件/法定额度/认购窗
 I-->>V: QuoteSnapshot(单价/币种/费用/有效期/条款版本)
 V->>X: 阅读披露、必要合同电子签/同意
 X-->>I: 受权签署结果、版本与生效证据
 alt Quote/文件/资格无效或签署Unknown
  I-->>V: 拦截下单付款或查询原签名意图
 else 法定合规条件达成
  V->>I: 提交唯一Subscription Order
  I->>I: M12统一Series/股类原子Reservation
  alt 超售/预留失败/并发冲突
   I-->>V: 无效认购/重报价，不能凭倒计时占用超额份额
  else Reservation受控
   I-->>V: 受权链网络/USDT-USDC合约/金额/目标地址/期限
   V->>X: 调用外部或嵌入式钱包签实际付款
   X-->>I: 观察Tx/Finality/外部真实收款结果
   alt 错链/假币/部分付款/迟到账/Unknown
    I->>I: 保留原真实收款及Pending/异常，阻断自动配售
    I->>P: 仅必要基础设施或安全异常升级
    opt 依法应返款
     I->>X: M11核原受款方、批准合法退回地址与唯一RefundIntent
     X-->>I: 实际退款或Unknown
    end
   else 真实Matched且资格/额度/授权继续有效
    I->>I: 进入法定配售守卫
    I-->>V: 独立显示已付款待配售
   end
  end
 end
 Note over P,X: 钱包签名成功不是到账，Matched不是合法配售，过期订单也不删除真实迟到账
```



## 08｜L1-G Allocation、法律登记、Mint、持仓与交易记录（Batch 04/05）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 法定登记/受权合约签名/链Finality
 I->>I: 检查Matched收款、合法发行权、合同、投资者资格与容量
 alt 资格撤销/发行禁令/配售失败
  I-->>V: 保持已收款但未配售事实，提交退款或争议处置
 else 事前授权自动配售或批准人工Allocation
  I->>X: 取得适用法定名册登记或法律权利生效证据
  X-->>I: LegalRegister回执与生效时点或Unknown
  Note over I,X: Mint与法定登记的合法时序依Instrument/法域，不统一强制先登记
  I->>I: 受权检查Token映射/钱包资格/白名单/锁定/合约状态
  I->>X: 唯一MintIntent受权签名执行
  X-->>I: Mint Tx/Event/Finality或Unknown
  alt 登记/Token不符、重组、重复或Mint Unknown
   I->>P: 必要安全告警与技术协助
   I->>X: 查询原登记/MintIntent/Tx及受权更正
   I-->>V: 区分已配售/登记待确认/Token交付异常
  else 所有适用交割条件均成立
   I-->>V: 展示真实合法持仓/Token状态/认购订单及历史
   I->>I: 销售总览与认购清单取M21只读权威聚合
  end
 end
 Note over P,X: 不建立SaaS自有的第二套法律登记/资金/Token账本
```



## 09｜L1-H 募集资金结算与Issuer合法资金提取（CR-07 Approved A）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 真实收款/托管/结算/外部付款主体
 I->>I: 查询募集总额、真实已收、认购中、待退款、已配售
 I->>X: M11对账资金来源/受限余额/结算授权及真实余额
 X-->>I: 唯一收款主体的合法收款/冻结/可释放凭证
 alt 未达成功发行门/退款准备金不足/法域禁止放款
  I->>I: 可提现金额=不可用或不足，继续托管/释放限制
  I-->>V: 按法定约定显示未完成认购/退款或交割状态
 else 已满足合法募集结算/托管释放及审批
  I->>I: 申请Settlement/Disbursement，核受款企业主体与账户/地址
  I->>I: 独立有权财务/合规双人审批，保留净额、费用、币种
  I->>X: 唯一受权资金划拨意图(由真实资金控制方执行)
  X-->>I: Submitted / Partial / Paid / Unknown独立真实回执
  alt Unknown或部分划拨
   I->>P: 必要异常升级，查询原指令；不得再次直接提款
  else 合法已到账
   I->>I: 更新可结算/结算中/已实付视图、对账/报表
  end
 end
 Note over P,X: 认购资金不是平台SaaS收入；资金划拨合法性及控制主体待法域决策
```

**CR-07 Approved A｜高重要度实现缺口**：V1.0 必须具有募集款真实收款、受限/可结算、合法划拨申请、出款和到账核验的端到端视图；原 M11 与 M21 需在 Step 03 对应到该流程，缺少的独立能力另提正式ID。必须先确定是真正由Issuer可直接从自持钱包提取，还是第三方托管/独立收款主体受控划拨；没有法律确认之前不假定“SaaS平台余额可提现”。



## 10｜L1-I 收益事件、合法可分配额、注资、自动推送/Claim（CR-08 Approved A）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 法定公司机关/资金方/链分配合约
 I->>I: 创建LifecycleEvent: Coupon/Maturity/Dividend/Distribution
 I->>X: 核有效Instrument债务义务或SPV可分配利润与决议
 alt B权益无合法决议/禁止分红
  X-->>I: 禁止生成应付分红(保持权益信息)
 else A到期债息或B合法分红事件已有效
  X-->>I: 合法分配/应付依据和有效条款
  I->>X: R-14按record date请求权威持有人名单/类别/数量
  X-->>I: 已生效Register快照、权益争议/版本
  alt 快照争议或记录日无效
   I->>I: Hold受影响收款人，进入M17调查
  else 权威快照有效
   I->>I: M13计算应付与各人份额、舍入/费/残值、审批锁版
   I-->>V: 显示已批准应付/待资金，不声称已付
   I->>X: CR-08受权注资至合法分配账户/合约并逐币种核足额
   X-->>I: 真实已到账/Finality、余额不足或Unknown
   alt 收益资金未足额/Unknown
    I->>I: 分配暂停并催办，不允许虚假空转自动分红
   else 已足额锁定且法律受权生效
    I->>I: 核验计划分配时点/时区/到期触发Guard（调度策略在PRD细化）
    alt 经法域与技术批准采用Push推送（可选模式）
     I->>X: 调用合法出款/合约推送（执行账户受权）
     X-->>I: 每个收款人真实Paid/Partial/Unknown证据
    else 经法域与技术批准采用Claim-first领取（推荐）
     I->>X: 发布带snapshot版本、总额与资格守卫的领取凭证
     X-->>V: 查询可领取/已领取/失效或不可领
     V->>X: 受权钱包签名Claim(含gas/nonce限制)
     X-->>I: 独立链事件与到账Finality，未领取余额持续留档
    end
    I->>I: 区分Entitled/Calculated/Funded/Claimable/Submitted/Paid/Unclaimed
    I-->>V: 展示记录日、收益期、应付/实付/可领/已领/失败与交易凭证
   end
  end
 end
 Note over P,X: 提前注资不等于已经Paid；Claim触发前还要核钱包权限与法律受领人一致
```

**CR-08 Approved A｜高重要度实现缺口**：V1.0 至少支持一种合法可实际履约的收益分配方式，优先研究 Claim-first；并完整管理合法权益快照、应付、注资、资金确认、受权执行、实付、未领取及异常。原 M13-F004/005/006 的历史 P1 原则已具备部分业务底线，但未定义Escrow/Distribution Contract、Push/Claim、Gas、Unclaimed、重算与资金退回。**这可能是新功能，而不只是修改原描述。** 原批准的 B 股权必须先有合法分红决议；真实“房租收益权”若非SPV股权，应另设适格合同权利审核门。



## 11｜L1-J 到期本金、回购/赎回、法定登记变更与Token退出（CR-09 Approved A）

```mermaid
sequenceDiagram
 autonumber
 participant P as P 平台后台
 participant I as I Issuer SaaS
 participant V as V 投资者门户
 participant X as X 债务人/SPV/实付方/登记者/链签名
 I->>X: 审查工具合同/成熟日/受权回购或公司行为
 alt A债权到期或本息偿付
  X-->>I: 应付本金余额、先前部分还款和法定解除要求
 else B股权拟退出
  X-->>I: 合法公司回购/注销/第三方出售/清算适用性
  alt 无合法回购/分配基础
   I-->>V: 不保证到期回购或保本；继续合法权益存续
  end
 end
 I->>X: 核权威持有人、合法计算、资金准备与支付授权
 X-->>I: 真实支付完成/部分完成/逾期/Unknown
 alt 清偿未合法成立或真实支付Unknown
  I->>I: 保留债务/股权义务与余额/争议，不宣告结束
  I-->>V: 展示未付/逾期或处理中
 else 法定条件及支付证据符合
  I->>X: 依法进行登记变更、Token Burn/Freeze等有权操作
  X-->>I: 独立法定注销或变更回执与链最终性
  alt 支付/登记/Token步骤不同步
   I->>P: 异常受限升级与后续受权修复
  else 全部工具要求满足
   I-->>V: 展示合法退出历史与资金证明
  end
 end
 opt Issuer SaaS合同终止或退租
  I->>X: 移交未结退款/法律持有人/收益/数据和责任
  P->>I: 停止无授权新发行并维持法律必需查询
  X-->>V: 适用承接渠道/法定通知
 end
 Note over P,X: 公司回购不是原认购退款，Burn不等于法定债务已经清偿
```



## 12｜贯穿全业务的异常、人工恢复和通知（复用 BR-01～18）
| 错误/异常域 | 必须停下的动作 | 真正负责查证与恢复的主体 |
|---|---|---|
| 企业订阅已扣款但Tenant未Active | 不重复开通或二次扣款；查询原商业支付/ProvisioningIntent | P商业运营 + X商业支付服务 |
| 自定义域名DNS/TLS失败、门户权限串租户 | 不发布新门户/定向Offering；记录访客/域名安全证据 | P租户安全 + I管理员 + X域名服务 |
| 文件/法定发行主体/SPV/Instrument权利不足 | 不因模板默认值而通过法定发行审查 | I有权法务 + X专业/法律主体 |
| 合约部署/Mint签名权限失效或链Unknown | 不重新发不可逆交易；查原链、nonce、合约地址及已发生事件 | I审批 + X受权链签名执行；P限技术支持 |
| KYC通过但Offering Eligibility失败/撤销 | 不允许认购/交割，不删除真实历史权益 | I合规 + X身份/制裁信息提供方 |
| Quote/签名Unknown、在途订单/额度冲突 | 不自动接收非法交易、不得多次配售 | I发行/法务 + X签名；M12唯一额度权威 |
| 稳定币付款错误/重复/迟到/退款Unknown | 禁止直接认定到账/配售、查询原付款/RefundIntent | I财务 + X真实收款及退款责任方 |
| 登记Unknown但Mint已生效或链重组 | 不显示“所有权益已完成”，合法权益/Token分别查证 | X法定登记者 + X链执行 + I发行 |
| 募集资金未满足释放条件或提现Unknown | 不把总募资显示为可提；禁止盲重划拨 | X受权资金控制/托管 + I财务审批 |
| 收益快照有争议、房租收入未可分配 | 不因合约计算得到金额便默认可付 | X公司/债务法律主体 + M12权威登记 |
| 收益资金未注资、Claim未领取/调用失败 | 不能把应付/分配计划标Paid；留Unclaimed账与受权提醒 | I存续财务 + X受权资金/链服务 |
| 到期/回购/Burn不同步、Issuer退租未结义务 | 不删除法定权益或阻断依法应提供的兑付查询 | I法律主体/承接人 + P受限数据交接 |

跨模块：M17建审批/异常工单不改写M07/M11/M12/M13的真实事实；M18站内已送达 ≠ 法定通知完成；M20保证隔离、授权、审计/原始回执/数据保留，M21所有资金/持有人报表从权威只读映射。所有正向及恢复路径都须保留幂等/原意图ID、source及合法授权链。



## 13｜CR-01～10 正式产品方向与四泳道交叉引用（全部 Approved A）

| 正式批准 | V1.0 已批准业务方向（不等于具体ID冻结） | L1对应图 | 保留的技术/法域实施门 |
|---|---|---|---|
| CR-01 | 企业在线申请/KYB/自助商业订阅与人工合同例外 | L1-A | SaaS收费服务商、税票合同、退款及独立商业授权 |
| CR-02 | Issuer标准独立URL/Logo/门户状态与Offering受权展示，高级白标后置 | L1-B | Tenant隔离、公开/定向/法定披露、自定义域名版本单独决定 |
| CR-03 | A固定票息债权/B SPV股权受控字段模板与向导 | L1-C/D | 真实Instrument合法性、资产权利与法定许可 |
| CR-04 | 企业自找适格律师/评估/SPV服务并提供法律文件，Marketplace后置 | L1-C | 外部法律文件效力、SPV设立资格及评估独立 |
| CR-05 | 合约Factory配置→参数校验→授权审批→合法签名部署→链上核验 | L1-D/G | 智能合约审计、链标准、真实生产Signer和重试 |
| CR-06 | 外部钱包+一种嵌入式钱包的首购入口 | L1-E/F/G | 钱包类型/MPC、账户恢复、Gas、KYC和法律持有人绑定 |
| CR-07 | Issuer募集资金释放/受限/可结算/划拨申请/真实到账 | L1-F/G/H | 真实收款或托管方、法定释放条件、反洗钱/退款准备金 |
| CR-08 | 真实权益快照/应付/注资/足额核验/一种合法自动分配 | L1-I | Claim-first仅技术推荐、Push替代、Gas/未领与法律偿债事实 |
| CR-09 | A到期本息与B合法条件性退出、法定登记/Token处置 | L1-I/J | 法定债务解除、SPV决议、受权Burn/Freeze |
| CR-10 | 原187双向映射、拟 V1.0/2.0/3.0及候选新ID先审后定 | 本文全图 | 版本计划和最终V1功能清单Draft、字段级PRD未冻结 |

**注意**：以前 Batch 01～06 推荐的原P0/P1/P2非默认阶段结论作为历史审批事实保存；新 DEC-013 的业务交付目标覆盖与之不同的**产品方向**，但不修改老文件原文字、不自动批准每个Mxx-Fxxx的新版本归属。

## 14｜严格分开的真实业务权威与状态（v0.3审图控制）

| 独立权威事实 | 负责对象 | 不得凭什么提前认定完成 |
|---|---|---|
| SaaS商业收费/权限 | 真实商业收款主体、P/M01与Tenant | 已点击订阅≠付费；已付SaaS费用≠机构合法可发行 |
| Instrument法律权利 | Issuer/合法发行人、M04/M06与外部法定实体 | 选择A/B模板≠合法债权/SPV股权已经成立 |
| Offering及销售合法性 | Issuer受权方、M05/M19 | 表单填满/合约部署成功≠合法可销售 |
| 投资者KYC/Offering准入 | M09、受权身份/AML服务与Issuer合规 | KYC Verified≠这个Offering可认购 |
| 认购合同和额度预留 | M10/M12/适用签名服务 | 按钮成功≠合法签约、额度分配、认购成交 |
| 稳定币真实收款/退款 | M11 + 有权收款/退款主体与链Finality | txHash/webhook/支付请求成功≠Matched/Refund Paid |
| 合法Allocation与法定权益名册 | M12 + 适格法定登记者 | 款到或Token Mint≠股权法定登记完成 |
| Token部署/Mint/链状态 | M07/M22 + 受权签名与最终性 | Submitted/Unknown≠链上最终确认或权益生效 |
| 发行机构募集资金结算 | M11/M21 + 真正法定可释放收款/托管方 | 已募资总额≠可提现；审批≠出款到账 |
| 发行后收益/本息 | M13/M12 + 公司决议/资金方/链分配执行 | Calculated/Approved/Funded/Claimable≠Paid |
| 合法回购/终止 | M13/M07/M12+有权债务人/公司/登记者/链方 | Burn成功≠合法债务清偿/公司权益注销 |
| 安全审计与消息 | M17/M18/M20/M21 | 通知Sent/Read≠法律有效送达；报表不能制造真实账 |

### 全局异常中断要求
在每个状态转换守卫中必须保留：Unauthorized / Invalid / Pending / Unknown / Failed / Partial / Retry-After-Query / Manual-Review 的适当路径，按实际领域分别展示。**不盲目重付、不二次Mint、不重复退款/收益Claim、不重复企业资金划拨、不在有效公司批准前自动分红。**

**SaaS商业资金与投资者募集款、发行人业务收益资金分别有真实收款/支付权威。** 平台运营软件权限 ≠ 任何一方生产签名、托管、法定登记或股权/债务所有权。

## 15｜现行版本门、待完成工作与审批状态（v0.4后续导航）

1. **已批准不变**：DEC-013/DEC-014核心11步四泳道产品目标；DEC-017批准193项首次版号（V1 146、V2 22、V3 20、TBD 5）；DEC-018～027分别批准Step04九批**146/146唯一V1.0功能**。
2. **本版仅纠正DEC-019时序**：邮箱验证即自动Trial→商业KYB→Standard合同及实际商业付款→原Tenant升Paid；Trial仅受限模拟和私有门户预览，Trial过期30天恢复，Paid真实法定义务保全。
3. **待审核**：[146项四泳道×11步静态审计Draft](../03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)已有13项风险/实施决策门。用户于2026-10-25“基本确认，按建议”表示愿意**有条件认可静态覆盖并继续跟踪**；并未批准13项已经关闭或整体V1范围Frozen。
4. **Step05尚未完成**：字段级PRD、各端真实状态契约、法域/Instrument与实际持款/登记/Signer、合同/钱包/接口/异常/验收边界仍需设计与审核。
5. **Step06需要单独决策**：综合全量跨端审计、首发法域及持续/集中募集适用性之后，才考虑V1范围冻结。不得自动启动UI、前后端/合约开发、生产真实资金、KYC、Token或法律登记。
6. **仓库治理**：四份Frozen、旧正式DEC/SCOPE及v0.3历史图原文均不修改；PR #6 Draft/Open/Unmerged。

**本版文档状态：核心11步目标沿DEC-014 Approved，DEC-019企业入驻时序勘误已生效；其余详细L1图及真实执行方案继续Draft，V1.0整体未Frozen。**
