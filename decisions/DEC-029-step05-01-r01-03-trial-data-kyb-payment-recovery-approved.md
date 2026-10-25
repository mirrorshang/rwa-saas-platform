# DEC-029｜Step05-01：试用数据、商业KYB受限访问及已付款开通恢复三项正式批准

> **Approved（仅Step05-01-R01～R03三项A产品规则）｜2026-10-25**。不得将本决定扩展解释为整份字段PRD、接口、状态枚举、实施方案、Step05或V1.0整体已Approved/Frozen。

## 一、用户原始明确决定

> “Step05-01-R01：A；Step05-01-R02：A；Step05-01-R03：A。补充意见：无。请仅按明确批准内容完善Step05-01字段级PRD与跨端状态/异常规范，更新GitHub必要决策与文档索引；未批准项保留Draft，不修改Frozen、不合并PR #6、不进入UI或开发。”

批准的来源：此前[Step05-01可视化业务草案v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)的05-01-R01～R03推荐A方案。当前衔接上游[DEC-019：14天受限Trial／商业付费前KYB／唯一Standard／30天恢复及Paid金融义务保护](DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)、[DEC-028：静态覆盖有条件认可](DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)，均不修改其原始正文。

## 二、三项逐条正式Approved的精确内容

| 审核编号 | 结果 | 本次获得批准的业务要求 | 不得扩大解释为 |
|---|---|---|---|
| **Step05-01-R01** | **A Approved** | **试用转正式时沿用原Tenant和允许保留的草稿及受权账户/组织设置**；模拟投资者、模拟收付款、模拟法定登记、模拟Token和模拟收益**不能自动转成真实生产业务数据或法定事实**，须按合法生产Gate另建或另经受权的真实业务流程。 | 所有Trial数据无条件可复制至生产；已经批准具体数据库迁移脚本、跨环境数据自动提升或演示Token变成真实Token |
| **Step05-01-R02** | **A Approved** | 企业商业KYB未通过、待补件或依法需要复核时，**不立即删除Tenant**；其可继续执行现行Trial/到期恢复规则允许的受限服务，依有权审核及适用法律条件提供补件/申诉/复核入口。**KYB未有效通过，不得绕过正式商业付款及生产授权前置条件。** | 可以无限申请、不受拒绝及制裁规则约束、客户永久免费保留；重新提交就自动通过；对发行金融工具的合法适用结论 |
| **Step05-01-R03** | **A Approved** | **真实商业付款已确认而正式Tenant开通或授权更新失败**：以原商业付款证据及唯一Tenant/订阅意图为基础先核验原执行结果，随后**恢复原Tenant合法商业权益**；不可因超时/重试重复扣费，不得重复创建Tenant。需要时进入受权异常升级与审计。 | 商业支付Unknown即视为成功，或无需核验强行授予Paid；已经选定支付商、定价、计费周期、退款方案或自动补偿机制 |

## 三、此次执行的文档范围（严格分离Approved与Draft）

- **批准规则正文**：本DEC为唯一Step05-01-R01～03规则审批记录；从未新增或修改任何正式M01/M02/M03功能ID和DEC-017首次版本归属。
- **详细字段PRD工作稿**：[Step05-01字段级PRD v0.2 Draft](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)：按四端和业务对象逐字段候选、可空性、来源、脱敏、状态守卫和数据隔离；**除引述本DEC与既有DEC的已批准业务原则外，具体字段名、类型、枚举、唯一键及接口建议均为Draft**。
- **跨端状态/异常工作稿**：[Step05-01状态与异常 v0.1 Draft](../docs/03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-States-Exceptions-Draft-v0.1.md)：P/I/V/X权限与展示语义、三项A的流程不变量、异常恢复和验收条件建议；状态enum、重试期限/算法、接口签名/错误码未最终冻结。
- [Step05-01原可视化业务草案v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)保留不改，当前详细设计阅读入口为v0.2及状态附录。

## 四、边界与后续审批门

- 无改动DEC-017：**193项／V1.0 146、V2.0 22、V3.0 20、TBD 5**；Step04现有**146/146逐IDApproved**、13项全量审计风险仍Open。
- **不授权**任何新的付费套餐、价格、KYB核验服务商、退款规则、密钥和金融生产接口、具体合同法域结论；特殊企业合同例外仍受现行Approved规则限制，不能绕开合法商业权利条件。
- **不修改**四份Frozen及历史DEC/SCOPE、已批准S04-01 v0.2、旧L0/L1图；PR #6 **Draft/Open/Unmerged**，不得合并。
- **不进入**UI/UX、软件开发、测试运行、真实身份核验、资金/Token生产执行或V1整体Frozen。Step05-01字段层的业务术语与剩余枚举、API仍应待下一轮审核；之后才进入Step05-02。

**DEC-029生效结论：R01/R02/R03三项A正式Approved；Step05-01具体字段、状态API及验收设计仍Draft。**
