# RWA SaaS｜Step 02：四端端到端业务流程及异常分支 v0.1


> **Step03.5 历史文件提示（2026-10-23）：Historical / Superseded as CURRENT READING ENTRY；原文内容及其历史批准证据继续保留。** Step02 v0.3 已按 DEC-014 获准作为现行11步核心流程。旧 v0.1 仅供追溯早期五段时序及异常素材，不再作为当前业务阶段或待决状态。 当前请以[文档权威目录](../00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)和[对应现行材料](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)为准。**本提示仅更新导航生效关系，不撤销任何历史正式决策，不冻结详细PRD，也不改变原正文。**

> **Draft / 待产品负责人审核（2026-10-23）**。GitHub Mermaid 可编辑业务流程；不是 Frozen 第 04 份状态机正文、技术时序/API、实际金融业务许可、UI/UX 设计或测试已执行。

> 基线：[WF-01～WF-18 Frozen](RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)｜[六批 SCOPE Approved 状态索引](../Document-Status-Index.md)｜[Step 01 R-01～17 与 BR-01～18](../03-product-prd/RWA-SaaS-Step-01-Batch-04-06-Business-Rules-Closure-v0.1.md)｜[原 187 项功能](../03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)。

**四泳道固定**：平台运营后台（P）、Issuer SaaS 企业工作台（I）、发行机构投资者门户（V）、依法受权的外部服务及法定权威（X）。X 是不同执行主体的集合，不能表示单个服务商可合法代理所有行为。主图仅描绘基线设计；合法登记与Token Mint 的顺序依批准的 Instrument 具体情况，不能由图自动决定。

## 1．L0｜四端整体业务主链路

```mermaid
flowchart LR
 subgraph P["平台运营后台"]
 direction TB
 P1["商业授权/审核 M01/M03"] --> P2["Tenant开通/租户权限 M01/M02"]
 P3["风险升级/受限技术支持 M17/M20/M22"]
 P4["SaaS暂停退租/交接审核 R-17"]
 end
 subgraph I["Issuer SaaS 企业工作台"]
 direction TB
 I1["Asset/Instrument/法律文书 M04/M06"] --> I2["Project/Offering/规则审核 M05/M19"]
 I3["投资者准入/Quote/容量 R-02~05"] --> I4["真实资金复核/配售 R-07~09"]
 I5["法定登记/Token核验 R-10~12"] --> I6["存续权益/实际收益/通知 R-13~16"]
 end
 subgraph V["机构投资者门户"]
 direction TB
 V1["R-01 获授权Offering访问"] --> V2["R-02~05 身份/资格/签署/认购"]
 V3["R-06~07 USDT/USDC付款"] --> V4["R-09~12 核验配售/登记/Token"]
 V5["R-13~17 存续收益/通知与持有记录"]
 end
 subgraph X["受权外部服务与法定权威"]
 direction TB
 X1["适格身份/专业审核/电子签"] --> X2["真实收款/退款与Finality"]
 X3["法定名册/签名及链上Mint"] --> X4["合法出款/权益/通知与承接"]
 end
 P2 --> I1
 I2 --> V1
 V2 --> X1
 X1 --> I3
 I3 --> V3
 V3 --> X2
 X2 --> I4
 I4 --> I5
 I5 --> X3
 X3 --> V4
 V4 --> I6
 I6 --> X4
 X4 --> V5
 I4 -.异常.-> P3
 I6 -.未结存续.-> P4
 P4 --> X4
```

## 2．L1-A｜客户购买SaaS至发行发布（WF-01～05）

```mermaid
sequenceDiagram
 autonumber
 participant P as 平台运营后台
 participant I as Issuer企业SaaS
 participant V as 投资者门户
 participant X as 外部受权主体
 I->>P: B2B客户申请、机构资料、商业合同 M01
 P->>X: 必要外部机构/法律主体核验
 X-->>P: 外部核验结果
 alt 资质/合同/能力授权不成立
   P-->>I: 补件或拒绝，Tenant不能金融执行
 else 商业准入完成
   P->>I: Tenant开通、管理员及套餐授权 M01/M02
   I->>I: 组织角色/双人审批/资源授权 M02
   I->>I: Asset与Instrument分层建档、权利版本 M04
   I->>X: 委托必要专业审查及权利文件核验 M06
   alt 文件过期/权利不明/审核Unknown
     X-->>I: 复核或补件，不自动发布
   else 具备受权合法文件
     X-->>I: 专业回执及相关法律证据
     I->>I: Project 1:N Offering、规则及容量检查 M05/M19
     alt 法定额度/销售模式/授权未通过
       I->>I: 阻断发布，保留版本
     else 已批准Offering
       I->>V: R-01 仅展示被批准的公开或定向信息
     end
   end
 end
 Note over P,X: SaaS商业开通不是金融经营许可或Token发行授权
```

## 3．L1-B｜投资者资格、报价与真实资金（WF-06～10/12）

```mermaid
sequenceDiagram
 autonumber
 participant P as 平台运营后台
 participant I as Issuer企业SaaS
 participant V as 投资者门户
 participant X as 外部KYC/签名/收款服务
 V->>X: R-02 申请KYC/KYB/AML必要验证
 X-->>I: 受权身份事实与有效期证据
 alt 身份Unknown/失败/法定禁止
   I-->>V: 阻断新认购或要求补件复核
 else 已获得有效身份事实
   I->>I: R-03 独立执行Offering Eligibility
   alt 本轮资格不满足
     I-->>V: 拒绝购买或进入受权审核
   else 资格符合且销售有效
     V->>I: R-04 获取有效Quote与合同版本
     I->>X: 必要电子签发起/查询
     X-->>I: 法律有效性待验的签署结果
     alt 报价到期/签署Unknown/权利版本变更
       I-->>V: 停止继续付款与配售，查询原请求
     else 有效条款和签署
       V->>I: R-05 提交唯一Subscription
       I->>I: M12同系列/同股类原子容量Reservation
       alt 并发容量超额/暂停/资格已失效
         I-->>V: 明确拒绝或等待调查，不超额配售
       else 有效预留
         I-->>V: R-06 批准网络/稳定币合约/地址/精度
         V->>X: 实际支付USDT或USDC至指定合法收款主体
         X-->>I: R-07 来源交易/链Finality/收款回执
         alt 错链/假币/少多付/迟到账/Unknown
           I->>I: M11保留真实事件，启动M17差异案件
           I->>P: 需要时升级受限技术故障
           I-->>V: 不显示已配售，状态为资金调查中
           opt 依法须退款
             I->>X: R-08 查询原退款意图并受权实际执行
             X-->>I: 独立退款实付证明或Unknown
           end
         else Matched且法定交易条件仍满足
           I->>I: R-09 进入受权配售守卫
         end
       end
     end
   end
 end
 Note over I,X: txHash不等于真实到账Matched，Matched不等于合法配售
```

## 4．L1-C｜法定登记、链上Token与交割异常（WF-10～12）

```mermaid
sequenceDiagram
 autonumber
 participant P as 平台运营后台
 participant I as Issuer企业SaaS
 participant V as 投资者门户
 participant X as 外部法定登记者/链执行者
 I->>I: R-09 核资格、配售授权、统一容量与真实Matched付款
 alt 配售不合法或Offering暂停
   I-->>V: 已收款但未获配，启动合法处置/退款
 else Allocation合法且幂等
   I->>X: R-10 登记权威要求与持有人证据
   X-->>I: 法定登记结果及生效时点或Unknown
   Note over I,X: 登记和Mint的执行先后依法定Instrument配置
   V->>I: R-11 绑定独立Token接收钱包并证明控制权
   I->>I: 验证Token单位映射、名单/锁定与签名权限
   I->>X: 唯一MintIntent与获授权签名请求
   X-->>I: 真实Tx/nonce/合约事件与链Finality
   alt Mint Unknown/重组/签名撤权或执行失败
     I->>P: 受限运维告警，不代签Mint
     I->>X: 查询原意图/Tx/nonce，受权补救
     I-->>V: 分别显示配售/登记/链进度与异常
   else Mint已达最终性
     I->>I: R-12 Allocation/法定登记/Token数量对账
     alt 名册与Token不符或权利争议
       I-->>V: 差异调查中，不宣称法律交割完成
       I->>X: 查询/依法受权更正，保留原事实
     else 所需登记、Token与法律条件均满足
       I-->>V: 经核验已交付，保持各事实独立可查
     end
   end
 end
 Note over P,X: Token Mint不等于法定股东身份，SaaS管理员不自动成为真实签名主体
```

## 5．L1-D｜A债权本息/B股权分红及权利终结（WF-13）

```mermaid
sequenceDiagram
 autonumber
 participant P as 平台运营后台
 participant I as Issuer企业SaaS
 participant V as 投资者门户
 participant X as 外部债务人/公司/支付/登记主体
 I->>X: R-13 请求真实有效债务或SPV公司权利/决议
 alt A固定到期债权
   X-->>I: Series债务条款与票息/到期义务
 else B SPV实体权益
   X-->>I: 类别及合法利润分配/董事公司授权
   alt B无合法分红决议
     I-->>V: 不生成固定应付或保本收益
   end
 end
 I->>X: R-14 查询记录日法定持有人和权利快照
 X-->>I: 有效登记证据与争议/修正
 alt 权益争议或快照Unknown
   I->>I: 保留争议并限制相应支付，M17调查
 else 合法权益快照Verified
   I->>I: M13计算、复核、批准金额及币种精度
   I-->>V: 显示应付而非实付
   I->>X: R-15 获授权实际票息/本金/分红付款
   X-->>I: 独立出款结果及证据
   alt 付款Unknown/部分付款/逾期
     I->>I: 分列已付/未付/逾期并查询原支付
     I->>P: 外部服务故障必要升级
     I-->>V: 保留债权或合法权益，不冒充已付
   else 实付对账完成
     I-->>V: 显示实付及必要合法通知
   end
 end
 opt A本金真正清偿或B合法股份回购注销
   I->>X: R-16 核法定清偿/名册变更与Token Burn/冻结
   X-->>I: 法定法律/支付/Token分别留证
   alt Burn成功但债务未清偿 或 已付但名册未注销
     I->>I: 继续跟踪不一致，禁止虚假结束
   end
 end
 Note over P,X: A的M13-F004～006虽为P1但为参考债权最低闭环，B不承诺定期固定票息
```

## 6．L1-E｜异常、通知、暂停退租及法律责任接力（WF-15/18）

```mermaid
sequenceDiagram
 autonumber
 participant P as 平台运营后台
 participant I as Issuer企业SaaS
 participant V as 投资者门户
 participant X as 外部执行/责任承接/合法送达方
 X-->>I: 外部回调或第三方异常、可能重复乱序
 I->>I: M22校验回调签名/租户/唯一事件
 alt 伪造/越权/密钥风险
   I->>P: M20安全事件与受限停用/撤权
 else 真实事件Unknown或权威差异
   I->>I: M17建案件、关联原意图、按域指派负责人
   I->>X: 查询原资金/登记/链动作
   X-->>I: 原回执及最新状态
   alt 仍Unknown
     I-->>V: 调查中及下一步；阻断重复不可逆动作
   else 需要补偿且已获受权批准
     I->>X: 独立补偿/合法更正，不抹除原事件
     X-->>I: 新外部回执，独立对账关闭或重开
   end
 end
 I-->>V: M18交易/收益/法律通知与待办记录
 opt 适用法域必须正式送达
   I->>X: 合法送达渠道与签收验证
   X-->>I: 有效送达证明或失败待升级
 end
 I->>P: R-17 SaaS暂停/终止计划
 P->>I: 禁止无权新增发行/交易，保留必要合法处理
 I->>I: 清点在途退款/登记/Token/票息/数据
 alt 存续未结或缺合法责任承接
   I-->>V: 继续提供法律必要查询/告知渠道
   P-->>I: 不得删除法定记录或直接终止责任
 else 承接合法完成及数据保留获批准
   I->>X: 移交债务/股权/资金/通知/档案责任
   X-->>I: 受权承接回执
   P->>P: 撤销普通凭证并审计保留合法记录
 end
 Note over P,X: SaaS退租不消灭投资者已有债权、股份、Token或未结真实资金
```

## 7．强制异常断点与图内入口（18项均是 Not Executed 业务设计）
| 异常 | 必须显示的分支 | 最小守卫/主责任 |
|---|---|---|
| BR-01、BR-12 | KYC有效但本轮资格不符/支付后资格撤销 | M09阻断新配售，M11保留真实钱，Issuer合规决定合法处置 |
| BR-02、BR-14 | 并发额度预留/同Series多个Offering股本冲突 | M12原子容量，付款Pending不可盲目释放 |
| BR-03、BR-04 | 假USDC/错误链、Tx无终局、迟到账、少/多付、退款Unknown | M11核原链/收款与外部退款证据，禁止盲重付 |
| BR-05 | 已收款但Offer暂停/配售失败 | M12不伪造Allocation，Issuer/合法资金方处理 |
| BR-06、BR-07 | 登记Unknown但已Mint/链重组与重复Mint | M12与M07独立留痕，原意图/nonce查询及受权恢复 |
| BR-08、BR-16 | 债券票息/本金或分红已核算但外部付款Unknown/部分付款 | M13分别追踪应付、已付、未付；M17升级，不再付第二笔 |
| BR-09 | SPV无合法分红却显示固定利息/回购当退款 | M13按真实公司授权，M11退款不同于M13合法退出 |
| BR-10、BR-18 | Tenant终止但有退款、票息、登记或法定通知 | M01/M20限制新交易，承接实体持续履约、留存和受权查询 |
| BR-11 | 电子签Unknown、Quote有效但法律合同未生效 | M06/M10按适用合法签署守卫阻断付款/配售并查原回执 |
| BR-13 | 付款来源钱包、Token接收钱包、法定持有人不同 | M07/M11/M12分别核验，不能向错误原地址自动退款 |
| BR-15 | 记录日后合法名册追溯更正或权利争议 | M12权威名册、M13新快照版本、M17受权纠错 |
| BR-17 | 合约暂停、冻结或实际签名权撤销 | M07受限，已有M12合法权利不消失，通知Issuer核验 |


## 8．临时流程节点与权威边界

| R编号 | 主业务 | 主责模块 | 对应WF | 必须独立核验 |
|---|---|---|---|---|
| R-01～03 | 门户访问、KYC、Offering资格 | M05/M08/M09/M19 | WF-05～07 | 身份Verified不等于本轮Eligibility |
| R-04～05 | Quote/签署/唯一订单与容量 | M06/M10/M12 | WF-08 | 订单不等于付款、容量预留不等于已配售 |
| R-06～08 | 指定稳定币支付/真实对账/退款 | M11/M22/M17 | WF-09/12 | txHash和回调不等于Matched，退款批准不等于实际出款 |
| R-09～10 | 配售/法定登记 | M12/M22 | WF-10～11 | 合法授权、法定名册及登记生效单独核验 |
| R-11～12 | Mint/接收钱包/链Finality/交割一致性 | M07/M12/M22 | WF-11 | Token不等于法律登记或已合法持有 |
| R-13～16 | 票息/本金、B合法分红、权益快照与注销 | M13/M07/M12/M17 | WF-13/18 | 应付、实付、名册更正、Burn互相独立 |
| R-17 | 暂停/退租/义务和数据移交 | M01/M03/M13/M20 | WF-15 | SaaS商业终止不取消法律权利 |

**范围例外**：WF-14/M14受控二级转让为V2，不进入Issuer V1链路；WF-16/M15 White-label和WF-17/M16 商业Open API/SDK是独立商业里程碑。它们与164项Issuer主线合成187项功能；真正的187项逐条核验是Step 03，当前不得提前说已完成。

**附加守卫**：INV-01 M12统一额度、INV-02 M11/M12的付款与配售独立、INV-03法定登记与Token执行独立；所有真实资金、外部签名/登记按合法授权由对应执行方承担。Unknown须查原意图、幂等和真实回执；M17异常工单不是金融事实权威；M18站内已读不是当然法定送达；M21报表只读不制造另一套账。

## 9．本轮审图待确认点（保持 Draft）

- 主链路和 BR-01～18 的断点是否足以覆盖成功/失败/Unknown/人工接管/恢复/取消/迟到/重复调用、公司合法分红与债务本息、退出后的持续责任？
- BRD-A～F（投资者入口、自动化程度、钱包/身份/支付分离、异常负责者、状态透明、退租责任）仍为 Step 01 参考草案；用户尚未单独批准这些默认选项作为最终图的冻结事项。
- 特定法域真实发行权、电子签法律效力、公司/登记生效顺序、受监管资金路径、链/合约、通知送达和受权签名者依G-01～G-06后续单独审查。图中任何箭头不能视为已通过法律许可或生产执行批准。
- 本版为 L0 总图 + L1 五段细图的首次可编辑草稿。需产品负责人逐节点审核后再决定修订/批准图稿；第04份Frozen原文不修改。
- Batch 01～06 的164项B01～B06验收案例仍 Not Executed；A/B 187个功能仍 Not Tested；不存在实际代码或金融环境验收PASS。后续按原规划 Step 03 187项双向核验→Step 04分端功能清单→Step 05字段级PRD→Step 06全局冻结→统一UI。PR #6保持 Draft/Open/Unmerged。