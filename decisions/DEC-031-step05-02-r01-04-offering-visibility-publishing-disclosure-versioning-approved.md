# DEC-031｜Step05-02四项产品级规则批准：Offering可见/可认购、发布缺项检查、投资者详情与变更版本

> **Approved（仅Step05-02-R01～R04四项A）｜2026-10-25**。对应产品负责人明确审批；本DEC不冻结未获单独评审的字段Schema、具体工程状态枚举、API、技术方案、法域、资金持有人或Token Signer，也不表示Step05全部完成、V1.0整体Frozen或获准开始UI/开发。

## 一、用户明确批准的原始指令

> “Step05-02-R01：A；R02：A；R03：A；R04：A。补充意见：无。请仅将明确批准的产品规则形成正式DEC，完善Step05-02产品级PRD及跨端状态异常规范，技术/法域/资金Signer事项继续Draft。更新GitHub及必要索引，不修改Frozen、不合并PR #6、不进入UI或开发。”

批准来源：[Step05-02可视化方案Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md)第六节四项A提案。此前[DEC-020](DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)批准M04/M06，[DEC-021](DEC-021-step04-s0403-issuer-offering-token-approved.md)批准M05/M07，[DEC-022](DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)明确合法登记主体与合约地址文书后绑定，[DEC-025](DEC-025-step04-s0407-issuer-investor-portal-approved.md)批准M08投资者门户。本DEC只是对上述功能的产品层使用与跨端呈现细化，不覆盖它们的既有法律前置。

## 二、四项正式批准的准确产品行为

| 决策项 | 正式结果 | Approved的使用规则 | 仍然未获批准的细节 |
|---|---|---|---|
| **Step05-02-R01** | **A** | **Offering“对该访问者可披露/可见”和“此时该投资者可有效认购”是两个独立判断**。经授权正式发布但未开售、暂停或关闭后，依法允许的文件/状态可供符合访问条件的用户浏览；不得创建新的有效认购。未发布、隐藏、定向或未获授受众不得通过搜索或直链越权查看。下单还需独立满足M09 Offering-specific资格及当前销售窗口。 | 各法域公开披露范围、URL/API字段、匿名可见规则的精确判断、缓存/搜索索引机制 |
| **Step05-02-R02** | **A** | **Issuer正式发布采用可解释的缺项式Gate检查**：展示适用法律文书、责任主体、Instrument/Offering与容量、受权收款/登记/Token条件、商业与安全权限等已满足/待核/被阻断的具体责任及处理入口；满足所有依法及合约适用条件且经过受权审批后，仍须**明确执行正式发布动作**。内部审核、Token部署或套餐Paid不自动发布。 | 法域/Instrument适用条件的7类Gate内部字段和校验函数、实际持牌责任、签名人、资金/合约部署权限 |
| **Step05-02-R03** | **A** | **投资者详情先讲法定/合同权益，再讲Token实现**。内容顺序为“法律权益主体与资产关系 → 合法收益/风险及适用限制 → 当前Offering认购条款、费用/披露文件 → 受权Token链/合约技术信息”。A债权按实际合同披露债权及本息/到期条件；B SPV权益披露SPV份额/股权、决议及分红/转让条件，**不得暗示必然直接持有底层资产、固定收益或保证回购**。 | UI布局、具体收益率计算/表述法律审定、国家级披露字段、图片和多语言 |
| **Step05-02-R04** | **A** | **Offering条款、有效文书及与之关联的实际合约地址发生需受控变更时，保留已发布版本及旧合同/Quote/投资者签署引用，不静默覆盖历史**；对当前投资者、在途订单、已认购者按适用法律和旧/新条款进行影响评估，分类为“可继续/需重新确认或必要重签/暂时暂停”等，执行有权审批及必要通知。生效及后续展示使用正确版本。 | 何种法域必须重签/重新披露、通知法律送达、区块链代理升级机制、技术事件同步和数据库历史存储策略 |

**四项批准不新增正式功能ID、也不重定义已有M04/M05/M06/M07/M08/M09/M10/M12/M17/M18/M19/M20/M22的独立业务权威。** 继承DEC-017 **193项唯一ID：V1 146、V2 22、V3 20、TBD 5**，全量静态审计13项门继续Open。

## 三、两个关键禁止混淆

1. **Asset/Instrument已通过内部审核 ≠ Offering已正式发布 ≠ 已开放认购 ≠ 当前投资者有资格购买**。M04管理权益/资产版本，M06管理文件，M05管理Offering/发布及销售窗口，M09管理当前投资者资格；V端M08只能消费有权版本。
2. **合约部署/链地址有效 ≠ 法定文件已生效绑定 ≠ 法定登记或Token已合法交付**。M07的链执行与M06文书绑定遵守DEC-022 C02的法域条件；受限Trial模拟草稿不因Paid自动变正式Offering（Step05-01 R06）。

## 四、批准范围与交付物

- [Step05-02产品级PRD v0.2 Approved](../docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)：仅R01～R04及其可追溯Step04原则下的产品职责、流程、展示语义和禁止越权规则Approved。
- [Step05-02跨端产品状态与异常规范 v0.1 Approved（仅产品层）](../docs/03-product-prd/RWA-SaaS-Step-05-02-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)：R01～R04对应独立事实、异常处理的**产品语义**Approved；字段命名、事件接口、权限具体实现、测试仍Draft/Not Executed。
- [Step05-02原始可视化Draft](../docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md)保留原样为历史审阅证据，不静默修改。
- **后续**：先按需要继续Step05-02字段/版本引用/技术接口专项细化，接着进入Step05-03“投资者KYC→合同签署/认购→真实付款→配售/法定登记→Token交付”可视化产品审核，只有另行用户审批才可标其规则Approved。

## 五、明确禁止与待决门

- **法域**：真实发行人及金融活动/公开与定向披露、持牌/登记责任、依法必须集中募集的适用性、合法电子签、文件/地址绑定方式、法律通知及再签规则仍待法律与Instrument专项。
- **资金与Token**：真实资金持有、收款/退款/划拨责任、Signer与密钥、可用链/合约/最终性、部署与生产Mint前置仍Draft/专项审核；不得把“产品审批”当生产金融许可。
- **技术与运营**：精确字段、数据库实体/schema、URL/权限接口、错误码、事件签名、异步幂等、通知送达法律效力、测试脚本与结果均未批准；不得以静态文档称测试PASS。
- 不修改四份Frozen及历史DEC/SCOPE/已Approved文件，不合并PR #6（保持Draft/Open/Unmerged），不进入UI、程序/合约开发或真实资金/Token生产；**V1整体不冻结**。

**生效结论：DEC-031仅批准Step05-02-R01～R04四项A产品业务规则，补充意见无。**
