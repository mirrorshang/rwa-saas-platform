# DEC-034｜Step05-05平台运营、权限、审批异常、通知、规则审计与外部连接六项产品规则批准

> **2026-10-25｜正式Approved：仅Step05-05-R01～R06六项产品业务行为A**。已批准Step04/Step05-01～04的领域事实、法定义务及其他DEC继续有效；**不批准字段/schema/API、具体法域、实际金融持款或Signer、供应商技术方案、UI/研发、真实金融链上生产或Step06 V1.0 Frozen**。

## 一、用户审批的原始边界

> “Step05-05-R01：A；R02：A；R03：A；R04：A；R05：A；R06：A。补充意见：无。请仅按明确批准的规则形成正式DEC并完善Step05-05产品级PRD、跨端状态与异常规范，更新GitHub及索引；其余保持Draft。随后开展Step05五场景总体一致性收口、字段级与技术决策门缺口汇总、DEC-028十三项审计问题的逐项对应，形成Step06冻结前审核Draft，不自动冻结或关闭问题。不修改Frozen、193项版本归属，不合并PR #6，不进入UI、开发或真实金融生产。”

审批来源：[Step05-05 Visual Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)第3节六条A方案，历史原文保留。现有S04-08 M03、S04-06 M17～M21、S04-09 M22分别由DEC-026/024/027批准，本决定仅产品层衔接细化，不新增V1功能ID。

## 二、正式Approved的六项产品规则

| 项 | 主题 | 产品行为、守卫及四端责任（Approved） | 保留Draft的事项 |
|---|---|---|---|
| **R01** | 平台后台只管理商业权限和受控服务 | P/M03可按批准角色操作商业KYB、Trial/Paid Tenant开停恢复、受控敏感访问与安全事件；真实资产/发行、投资者资格、资金、法定登记、Token、收益分别由I有权人、原业务模块及依法有权X裁决。SaaS平台运营不因管理员资格取得客户资金/Signer权限。 | 法域发行/持款身份、平台是否被委托特定持牌行为、生产Signer/资金权限仍待专项 |
| **R02** | Tenant/组织RBAC及高敏访问 | P/I/V所有业务读写需要服务端按Tenant/Issuer、角色、本人或受权代理、数据目的和时限鉴权；P敏感信息走合法申请、适格审批、必要最小范围、限时撤权及M20审计；跨Issuer/跨Tenant数据仅依法受权使用。 | 实际权限码、属性策略、身份共享同意/法域保存与实现尚未批准 |
| **R03** | 审批与Unknown恢复保留原业务权威 | M17以原Tenant、业务对象、原Intent和证据建立审批/补件/差错/升级任务；任务Done不改变领域完成结果，Unknown先查询原资金/登记/Mint/Claim/商业付款真实结果，有权I/X对原业务进行受控修复，不重复不可逆动作。 | 重试API/幂等键/操作超时/责任SLA和真实Signer授权仍Draft |
| **R04** | 消息发送/阅读/合法送达独立 | M18以原领域真实事件向有权I/V发送受控通知、补件、退款/登记/Token/收益/逾期提醒；Sent、ProviderAccepted、Read、适用法律下有效Delivered是独立事实，受权链接服务端强鉴权，必要正式送达由适格I/X依法执行。 | 邮件服务商SDK归属边界、法定送达渠道及法域、实际消息文案/API仍待决定 |
| **R05** | 规则版本、审计与只读报表共享权威 | M19规则合法强制约束优先、Tenant/Offering限权配置及审批版本生效；M20最小授权审计和证据追加修正；M21报表仅读业务真值，显示报告基准时间、数据延迟与原精度，不能作为另一套法律、资金、Token真值账。 | 具体报表字段、数据仓库/读模型延迟、日志留存与监管要求未定 |
| **R06** | 外部凭证/环境隔离与有权退出交接 | M22按Tenant、Provider、用途、Trial/Sandbox与生产隔离凭证和Webhook来源/重放防护；Provider故障触发M17受权升级、M18必要通知和M20审计，恢复后查询原事实；SaaS停服/退租时依法保障已有资金、法定权益、收益、Token和必要投资者查询/责任交接。 | 安全/外部供应商合同、实际凭证方案、密钥及Signer、法律交接期限、M22-F009高级切换均未批准 |

## 三、领域权威与不变量

- **M01** SaaS买方/Trial/KYB/Standard与Tenant商业真值；**M03 P端操作**而非另一套企业财务或真正Issuer证券合规审批权。
- **M02/M20** 企业组织角色、Tenant隔离和高敏访问审计；**M17**统一待办与异常，**M18**通知投递，**M19**规则版本，**M21**只读报表，**M22**Provider/Webhook/凭证与健康。任何这些协作模块不得代替**M04/M05/M06/M07/M09/M10/M11/M12/M13**拥有的法律权利、Token、资金和收益真值。
- **任务完成≠外部执行完成，Provider200≠合法登记/付款完成，通知已读≠法定送达，后台管理员≠Signer或合法资金托管主体。** Unknown按原意图查询与审批，证据不足不盲重试任何不可逆出款/Mint/登记。
- 对真实已经存在的资金、本息、配售、登记与Token权利，**Tenant停止商业订阅/运营误暂停不使合法义务消灭**；有权查询、救济和合法移交仍须保留。

## 四、唯一权威文件和后续审计

- [Step05-05产品级详细PRD Approved v0.2](../docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md)与[跨端产品状态/异常规范 Approved v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-05-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)只对**上述明确批准的产品行为/状态语义/保护Guard**赋予Approved效力。具体技术字段、状态enum、API、权限码、法定送达、Provider合同、事件重试策略和15条测试都仍Draft/Not Executed。
- [五场景总体交叉核验与Step06前置审核Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-Five-Scenarios-Consistency-and-Step-06-Pre-Freeze-Audit-Draft-v0.1.md)及[13项审计风险逐项证据/决策门对照Draft](../docs/00-governance/RWA-SaaS-Step-06-X01-X13-Audit-Gate-Crosswalk-Draft-v0.1.md)是审查文档，**没有批准关闭X-01～X-13，也没有自动批准Step06 V1.0范围或实施**。
- **先做可读全局检查、再补领域字段/合法/技术责任决定**。如需更改DEC-017 193项版本归属、冻结四份Frozen以外的整体V1、合并PR #6或实施生产资金/Token，必须另获用户明确批准。

## 五、持续保留的界限

- 193个正式ID版本归属维持**V1.0 146、V2.0 22、V3.0 20、TBD 5**，Step04 146/146逐ID设计已批准。M03-F003/F004在V2，M22-F009在V3，不能通过Step05-05隐式提前。
- **DEC-028**对静态P/I/V/X四端×11步覆盖仅有条件认可，**X-01～X-13全部Open**。某项有产品规则承接不等于法域已评估、字段/技术已批准或验证通过。
- 继续保留真实法律责任人/有效法域、资金/钱包/TokenSigner、法律通知及电签、技术方案和E2E测试独立Gate。四份Frozen、历史DEC/SCOPE/原已批准文档原文不修改；PR #6 Draft/Open/Unmerged；不进入UI、研发或金融链上生产。

**DEC-034结论：Step05-05-R01～R06全部A产品级Approved；其余全部保持原Draft/未决，Step06冻结前审核稿也为Draft。**
