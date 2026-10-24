# DEC-020｜Step 04 S04-02：Issuer 资产、Instrument、文件与专业审查六项方案批准

> **Approved — 2026-10-24（Step04功能设计层；不代表V1.0整体Frozen、法域/资金/Token生产许可、UI或研发授权）。**

产品负责人明确回复：

> “S04-02-01：A；S04-02-02：A；S04-02-03：A；S04-02-04：A；S04-02-05：A；S04-02-06：A。补充意见：无。请按审核结论更新GitHub正式决策、S04-02产品文档和146项追踪台账；不修改Frozen，不合并PR #6。”

本决定仅批准[Step04 S04-02当前有效完整产品设计 v0.1](../docs/03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)的角色、功能层级、逻辑页面组、操作入口、状态/异常类别、跨端唯一主责及规划边界。正式ID与目标版本以[193项统一主表](../docs/03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)和[DEC-017](DEC-017-step03-r01-06-approved-193-release-assignments.md)为准，不产生新ID或新版本归属。

## 一、六项明确批准（全部A）

| 审核号 | 已批准方案A | 正式V1.0 ID |
|---|---|---|
| **S04-02-01** | Asset独立建档、分类及证据关联；先保存草稿，按实际Instrument和法域要求分步补齐适用来源/权属证据；上传不等于法定产权确认。 | M04-F001、M04-F002 |
| **S04-02-02** | Instrument与Asset独立；V1提供A债权/B SPV实体权益两类受控基础模板和创建向导；发行人、债务人、SPV、资产控制主体等责任分别关联；模板不自动形成法定权利或许可。 | M04-F003、M04-F004、M04-F008 |
| **S04-02-03** | 权利、义务、转让限制及收益、偿付、赎回条件按实际法律Instrument管理；A债权和B实体权益不得使用同一默认固定收益/保本模型；未决定全球通用公式。 | M04-F005、M04-F006 |
| **S04-02-04** | 独立审核Asset/Instrument及正式文书版本；已被Offering、认购或签署引用的重要变化必须新版本、影响分析与适用复审，旧权利/签署记录不可无痕覆盖。 | M04-F007、M06-F003 |
| **S04-02-05** | V1以Issuer自聘适格律师、评估及其他合法主体为默认，建立文件分类/权限、适用清单/补件、受权内部审核和专业成果引用；不启动完整第三方工作区或服务商竞价。 | M06-F001、M06-F002、M06-F004、M06-F006 |
| **S04-02-06** | M06统一管理适用认购文书/签署证据，M08独立投资者门户呈现与引导、M10核验认购前置、M22衔接外部电子签；请求、回执、证据及法定效力须区分。 | M06-F005 |

**唯一计数：M04-F001～F008共8项，M06-F001～F006共6项，合计14项V1.0。** S04-01由[DEC-018](DEC-018-step04-s0401-issuer-foundation-approved.md)与[DEC-019](DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)已批准16项，本决定生效后Step04累计**30/146 Approved，116/146待审**。M05/M08/M10/M17～M22仅属本批引用依赖，不因交互被描述而计入已审。

## 二、与上游业务原则及新旧版本的有效关系

1. 四份Frozen、已批准[WF-03](../docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[SCOPE-160～167](SCOPE-160-167-batch02-asset-instrument-documents-review.md)、Step02十一项核心流程和正式193主表继续有效；本次不修改历史正文。
2. 历史Batch02曾以P1把**M04-F008基础模板**写为“非默认首期”。后续[DEC-013 CR-03](DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)确认受控A/B最小模板进入V1目标，[DEC-017](DEC-017-step03-r01-06-approved-193-release-assignments.md)已批准M04-F008归V1.0；本次只细化其受控基础创建向导，不把高级模板市场或复杂资产模型提前。
3. **M04-F009复杂资产组合=V3.0**，**M06-F007完整外部专业协作=V2.0**，**M06-F008复杂服务商市场及竞价=V3.0**。已有旧SCOPE的证据、角色及专业审查边界继续保持，但这三项不计入S04-02 14项V1。
4. 继续遵守[DEC-019](DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)：邮箱验证即14天受限Trial Tenant，试用只允许私有草稿/模拟和预览；KYB后商业付款才能进入Standard正式商业授权；试用资料不自动变为正式权属或有效签署证据；Paid欠费也不能消灭真实投资者及发行义务。
5. Asset及Instrument事实由M04负责；文件/证据/文书版本由M06负责；Offering发布由M05负责；适用法律结论由实际负有责任的合法主体形成；法定登记M12/实际登记主体、真实资金M11/实际资金主体、Token及链上执行M07/实际签名主体分离，禁止把内部ReviewedForUse当作法定发行许可。
6. M17工作流任务、M19规则版本、M20安全审计、M22外部签署接口等只是跨模块依赖；这些模块仍需其自身Step04批次逐ID审核。

## 三、当前审批边界和后续动作

- **Approved**：S04-02-01～06全部A，14个唯一V1 ID的Step04分端产品设计完成；在[146项追踪台账](../docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)逐项登记。
- **仍Draft/TBD**：字段字典、详细状态迁移、具体路由/UI、全量角色动作矩阵、法律条款效力与法域、实际专业/登记/支付/链服务商、验收执行和恢复算法，留Step05；Step06决定整体V1.0是否Frozen。
- **不授权**：新增正式功能ID、擅改DEC-017目标版号、把V2/V3/TBD提前、变更Frozen原文、开发UI/前后端/合约、生产资金或Token动作、合并[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)。
- **后续顺序**：如用户另行同意，进入S04-03 Project/Offering、Token（M05/M07）；本次审批不自动开始下一批。

**最终状态：DEC-020六项A Approved；S04-02 14/14功能获Step04层批准；全项目Step04累计30/146，剩余116；V1.0整体未Frozen。**
