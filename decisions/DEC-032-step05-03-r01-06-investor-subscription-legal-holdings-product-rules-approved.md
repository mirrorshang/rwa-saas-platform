# DEC-032｜Step05-03投资者认购至合法持仓：R01～R06六项产品规则正式批准

> **2026-10-25｜Approved（仅Step05-03 R01～R06的产品行为、跨端责任与必要Guard）**。批准不等于任何实际证券发行、真实资金托管、Token部署、合法登记、钱包或Signer授权，也不代表产品字段API/数据库schema/工程状态枚举已Frozen或测试PASS。

## 1. 用户明确批准

> “Step05-03-R01：A；R02：A；R03：A；R04：A；R05：A；R06：A。补充意见：无。请仅将明确批准的六项产品规则形成正式DEC，完成Step05-03产品级详细PRD及跨端状态异常规范，更新GitHub及必要索引。技术字段/API、法域、实际资金持管、钱包/Signer/合约方案继续Draft。完成后进入Step05-04可视化产品审核；不修改Frozen、不合并PR #6、不进入UI或开发。”

本次批准源自[Step05-03可视化草案v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-03-Investor-KYC-Subscription-Payment-Allocation-Register-Token-Visual-PRD-Draft-v0.1.md)第四节六组“推荐A”。原草案保留为历史审阅记录，不能再用“六项待审”的历史状态替代本DEC。

## 2. 正式批准的产品行为

| 决策 | Approved准确范围 | 不得据此推断已获批准 |
|---|---|---|
| **R01 投资者身份/资格/钱包分离** | 在法域许可及可见权限内允许浏览获授权Offering；**认购前**要求自然人或机构KYC/KYB/AML、当前Offering-specific Eligible及合法代表权有效；支持外部钱包和依法安全可行的嵌入式钱包选项，**投资者账户、法定权利主体、付款来源钱包、Token接收钱包分开核验**，接收钱包另核控制权与法定限制。 | 任意匿名浏览均合法、跨Tenant自动共用KYC原件、钱包登录即获得证券资格、MPC/托管产品和真实钱包供应商已选择 |
| **R02 Quote/签署/唯一订单/预留** | 投资者按法律认购单位确认价格、费用、Instrument/正式文书/Quote版本、有效期限及风险；必要合法签署/确认有真实证据，M10对同一受权意图维持唯一订单、M12唯一原子预留；**真实不可逆付款指令下发前**必须重新核验资格、签署、合同版本、额度及合法收款Guard。适用法域的必要执行顺序允许合法调整。 | 全法域统一固定签约顺序、预留/签署/支付的技术原子算法或API已决定、Quote自动等于配售 |
| **R03 真款最终性与“已支付”展示** | V端明确受权USDT/USDC网络、币种合约、金额、收款法律主体/地址及期限；付款意图、钱包签署/广播、链观察、最终性及M11与订单匹配分别呈现；**只有M11依据合法资金证据确认FinalMatched时才可宣告认购款“实收已确认”**。少付、多付、错链、假币、迟到账及Unknown独立提示并进入受权复核。 | txHash/截图/钱包广播等于实收；合约收款已确定为唯一通道；SaaS拥有合法托管/签名权 |
| **R04 预留、最终守卫与合法配售** | M12统一跨Offering/Series/类别的发行容量与预留/冻结/释放；即使实收FinalMatched仍按当时有效M09资格、M10签署/Quote、M05合法销售条件、Instrument公司权限及容量复核；符合依法适用且事前批准的自动基础配售策略可自动执行，其他情形受权人工审批；唯一Allocation和证据不可重复。 | 付款即产生股权/债权，预留到期就等于没收到资金，V2集中募集方案自动进入V1 |
| **R05 法定登记/Token/最终持仓三者区分** | Allocation之后按照具体Instrument法域采用**Issuer依法自管、依法委托或强制特定登记者**三种合法路径确认登记（DEC-022 C01）；M07依获准Allocation、Token合法接收钱包及真实Signer授权执行Mint/交付并核最终性；两者**按Instrument适用合法时序**独立记录，只有该Instrument全部必要权利交割条件真实满足才能显示“合法持仓已完成”。 | Token余额就是法定名册、外部登记所有客户强制必需、Mint已批准真实执行、所有法域必须先登记后Mint |
| **R06 四端多状态、退款及异常独立处理** | V端对同一订单分别展示资格/签署、订单及预留、真实付款、配售、权威登记、Token交付和退款；少多付/错链/迟到账/资格变更/取消后真钱到账/登记或链Unknown须保留真实事实并经M17受权异常路径恢复，M11实际退款必须独立审批、由有权X执行并核实际出款；P仅作最小必要支持。**已成立合法权益不可普通取消/退款按钮撤销**。 | 退款批准=已退钱、客户服务人员能手工修改名册/资金/Token、暂停服务能抹除未清偿债务 |

## 3. 业务唯一权威（不新增功能ID或第二套事实账）

- **M09**自然人/机构KYC/AML及当前Offering资格；**M08**账户/钱包操作与本人视图；**M10**Quote/签署引用及唯一Subscription订单；
- **M11**稳定币真实付款观察/最终性/匹配及独立退款；**M12**唯一合法发行容量、预留、Allocation与有效登记结果引用；**M07**Token钱包资格/Mint/交付和链最终性；
- **M04/M05/M06**提供合法Instrument、Offering以及有效文件/签署版本；**M17/M18/M19/M20/M22**仅提供受权流程、通知、规则、审计、外部适配，不替代上述事实权威；**X**为实际适格KYC主体、合法持款/退款人、法定登记者、钱包Signer及签约方，不自动等于SaaS运营商。

**不得合并为“购买成功”的五个断言**：OrderCreated ≠ PaymentFinalMatched；FinalMatched ≠ AllocationConfirmed；AllocationConfirmed ≠ LegalRegisterEffective；LegalRegisterEffective ≠ TokenFinality；TokenTransferred ≠ 自动具有该Instrument的法定权益。差异和Unknown必须真实显示，允许法定先后顺序按具体工具设计。

## 4. 本DEC使哪些文件具有何种效力

- [Step05-03产品级详细PRD Approved v0.2](../docs/03-product-prd/RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)：**仅R01～R06对应的业务目标、跨端使用动作、守卫、独立数据权威及异常产品行为Approved**。
- [Step05-03跨端状态与异常规范 Approved v0.1（仅产品层）](../docs/03-product-prd/RWA-SaaS-Step-05-03-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)：上述产品状态语义及16类异常的业务保护边界Approved，**精确枚举/API/幂等实现/字段/正式验收仍Draft/Not Executed**。
- [Step05-04发行后收益/到期及退出可视化PRD Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)仅启动场景审核，**全部05-04细化提案均待单独批准**。

## 5. 持续有效的决策门与禁止事项

1. **实际法域与金融执行**：合法发行方、监管活动、真实资金持管与退款主体、法定登记者、A债权/B SPV权益权利时序及通知/签署法律效力未确定；平台商业客户与实际Instrument发行/持款责任人分离。
2. **钱包/Token/链上执行**：外部或嵌入式钱包技术模式、恢复与Gas、安全验证、生产Signer和密钥托管授权、收款合约/链最终性、合法Mint/Burn及可支持网络需单独技术/法律/安全批准。合约收款、法定登记及Claim的已批准“方向”不等于真实部署许可。
3. **完整字段/工程API**：法定金额/Token精度、时间、唯一Intent/交易事件及冲突解决、数据库/日志、权限角色码、Webhook、重试阈值、订单/退款/配售状态enum、性能指标和E2E测试均仍Draft/Not Executed。
4. **V1持续认购边界**：DEC-017仍是193项、V1 146/V2 22/V3 20/TBD 5；如首发法域依法**必须集中募集**，需在Step06冻结前单独正式重新审核M05-F011/M10-F009/M12-F009/F010等版号，不得通过本PRD隐式并入。
5. **仓库治理**：不更改四份Frozen、旧DEC/SCOPE和既有Step04 Approved原文；PR #6保持Draft/Open/Unmerged；不进入UI、软件/合约研发、真实KYC收款或Token生产执行。Step04 146/146 Approved、13项全量审计风险Open、Step06 V1整体Frozen未批准。

**DEC-032正式结论：Step05-03-R01～R06六项A全部产品级Approved；其余技术/法律/生产事项继续Draft/待决。**
