# DEC-021｜Step 04 S04-03：Issuer Project/Offering与Token七项完整功能设计批准

> **Approved — 2026-10-25（只批准Step04功能、角色、逻辑页面组、业务操作、状态/异常类别及跨端责任；不是V1.0整体Frozen或任何真实发行、资金、Token生产授权）。**

产品负责人明确确认：

> “S04-03-01：A；S04-03-02：A；S04-03-03：A；S04-03-04：A；S04-03-05：A；S04-03-06：A；S04-03-07：A。补充意见：无。请按审核结论形成正式DEC，更新GitHub的S04-03产品设计、146项追踪台账及必要索引；不修改Frozen，不合并PR #6，不进入UI或开发。”

**当前批准正文**：[S04-03 Issuer Project/Offering与Token完整功能设计v0.1](../docs/03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)。正式功能ID、名称与首版归属仅据[DEC-017](DEC-017-step03-r01-06-approved-193-release-assignments.md)及[193项唯一主表](../docs/03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)。

## 一、七项决定全部A

| 审核项 | 已批准A方案 | 正式V1.0功能ID |
|---|---|---|
| **S04-03-01** | Project作为发行与存续工作容器，引用经审核Asset/InstrumentVersion；一个Project可关联多个具有独立状态的Offering，不因单轮或订单完成而结束整个Project。 | M05-F001/F002/F003 |
| **S04-03-02** | 对Offering发行容量/合法单位/价格、依法适用的持续认购时间窗口、投资者类别/区域/限额实行受控设置与版本化；KYC不等于Offering Eligible。V1默认合法适用的持续认购及基础配售。 | M05-F004/F005/F006 |
| **S04-03-03** | Offering只引用获批准的链/币种/实际有权收款/退款、登记和Token方案；发布前集中检查合法权利/文书/资金/资格/Token等门槛，内部批准与真正Published/Open分离。 | M05-F007/F008 |
| **S04-03-04** | 发布、暂停、停止新认购、结算与存续独立；停止销售后保留已发生真实资金、认购/退款/登记/Token处置；重要条款变动必须新版本及旧订单/既有权益影响分析。 | M05-F009/F010 |
| **S04-03-05** | V1受控发行链与Token标准/法律单位映射、合约参数版本、部署审批与审计；仅由实际合法授权的Signer执行自动或半自动部署，不默认平台托管生产私钥。 | M07-F001/F002 |
| **S04-03-06** | 投资者合法Token接收钱包、唯一配售依据的Mint、真实链上Finality/Unknown查询、法定登记与Token交割差异核对分离；禁止付款=Mint=法定登记合为一事实。 | M07-F003/F004/F005/F006 |
| **S04-03-07** | V1落实必要合约级受让限制/锁定、敏感密钥与权限暂停、依法适用的债务清偿或公司行动后的Burn/冻结；V1不开放M14用户间二级转让。 | M07-F007/F008/F009 |

**唯一计数**：M05-F001～F010（10项V1.0）＋M07-F001～F009（9项V1.0）＝**19项**。此前[DEC-018/019](DEC-018-step04-s0401-issuer-foundation-approved.md)与[DEC-020](DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)覆盖16＋14共30个不同ID；本决定后Step04累计**49/146 Approved、97/146待审**。跨端及M03/M08～M13/M17～M22等模块只列依赖，不重复计入本次批准。

## 二、现行决策边界与历史批准关系

1. 已冻结四份基线、WF-04/05/11/18、[SCOPE-168～175](SCOPE-168-175-batch03-project-offering-rules-principles.md)、[SCOPE-186～193](SCOPE-186-193-batch05-token-contracts-external-execution-principles.md)、DEC-014 11步主线与先前S04-01/02仍有效；原有Frozen、DEC、SCOPE的历史正文不修改。
2. **M05-F011集中募集与批次配售=V2.0**，M05-F012高级动态定价=V3.0；M07-F010复杂多链/升级=V3.0。SCOPE-171历史按实际法域“条件性必需”的描述保留，但DEC-017已确认当前目标版号；**若首发工具依法必须集中募集，必须在V1整体冻结前对M05-F011、M10-F009、M12-F009/F010等另开正式重审**，不能静默混入本次V1。
3. **M07-F009赎回销毁/授权调整原P1现V1.0**，由DEC-013 CR-09及DEC-017后续决定形成最低合法债务/公司行动处置目标；不因此赋予B SPV权益随时回购或法定提前赎回权。
4. M05主管Project/Offering与发布/条款版本引用，M04法律Instrument、M06法律文件、M09资格、M10认购、M11真实收款/退款、M12配售及登记引用、M07实际Token链结果、M13存续/本息、M17跨模块异常、M19受控规则、M22外部事件各独立主责。
5. SaaS合同、Standard套餐/KYB与Tenant正式可用≠Issuer依法具有发行资格；M04内部ReviewedForUse≠监管/法律有效性；合约已部署≠可募集；到账≠配售/法定登记/Mint完成。真实法域、合约标准、外部持款、法定登记主体、生产签名、钱包恢复及法定Token效果均需独立确认。
6. DEC-019的14天无卡受限试用只允许草稿/私有演示/模拟，不授权生产部署、公开Offering真实认购、真实资金/Token；Trial与Paid产生的试用测试证据不得自动转为真实生产许可。

## 三、本次记录与不授权事项

- **Approved**：S04-03七项全部A、19个唯一V1 ID的Step04产品设计；相应进度记入[146项分端台账](../docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。
- **仍Draft/TBD**：字段/接口/算法/精度/具体状态枚举、路由/正式UI、真实首发Instrument法域与公司批准、资金托管责任、登记权威、合约/Signer/审计/恢复策略及实际验收测试，留Step05及独立批准门；Step06才决定V1整体是否Frozen。
- **不得实施**：擅改DEC-017逐ID版号、新增功能ID、改写Frozen或历史Approved正文、开启UI/前端/后端/合约开发、真实资金划拨、真实链部署/Mint/Burn，或合并[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)。
- **后续建议**：在产品负责人另行同意后，进入S04-04 Issuer投资者身份、认购、支付与基础配售；不因本次批准自动开启下一批。

**最终状态：DEC-021七项A Approved；Step04当前49/146已审、97待审；193项146/22/20/TBD5不变；PR #6 Draft/Open/Unmerged。**
