# SCOPE-160～SCOPE-167｜Issuer V1 Batch 02：Asset / Instrument、文件及专业审核交付深度决策

> **Approved — 产品规格原则（非实际 V1 总范围冻结、UI/技术实现签收或金融/法律许可）**  
> 日期：2026-10-22。产品负责人明确确认：**“SCOPE-160～SCOPE-167 全部同意。”**
>
> 正式依据：[Batch 02 M04/M06 详细产品规格](../docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-02-Asset-Instrument-Documents-Review-v0.1.md)、[已冻结 WF-03 主流程与状态机](../docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[功能树与 187 项范围](../docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)、[样本 A 债权](../docs/03-product-prd/RWA-SaaS-Reference-Instrument-A-Debt-Scenario-and-Product-Rules-Review-v0.1.md)、[样本 B SPV 权益](../docs/03-product-prd/RWA-SaaS-Reference-Instrument-B-Equity-Rights-and-Lifecycle-Review-v0.1.md)。

## 一、八项已批准产品原则

| 编号 | 已批准的产品需求原则 | 不表示已经确定或完成 |
|---|---|---|
| **SCOPE-160** | Batch 02 范围为 **M04（9 项）+ M06（8 项）= 17 个现有功能 ID**，原等级 **P0 13 / P1 2 / P2 2** 与既有五类交付定位原封不动；审查最低可交付深度，不新增功能 ID。 | 不自动冻结整个 Issuer V1 实施清单。 |
| **SCOPE-161** | **Asset、Instrument、Offering、Token 分别建模**。M04 允许 Asset 关联依法定义的 A 债权 / B SPV 实体权益 Instrument 及审核证据、权限和条款版本；C/D/E 预留可扩展模型，不自动生产化专有业务。 | 不能将资产所有权、法定债权/股权与钱包 Token 余额当作同一事实。 |
| **SCOPE-162** | **A** 记录债务人、Series、名义本金、票息/计息、记录日和到期等权利参数；**B** 记录 SPV 实体、法定股份/成员权益类别、授权资本、分配与限制等适用参数；重要合同或已关联 Offering/签署的权利条款变更必须**新版本与影响分析**。 | 不批准某个法域下的债务定价公式、公司法发行额度或标准法律文件为全球通用。 |
| **SCOPE-163** | 复用已冻结 **WF-03**：Asset Draft→PendingReview→ReviewedForUse / NeedsSupplement，Instrument Draft→PendingReview→ReviewedForUse / NeedsRevision，并保留暂停、归档及受控版本和不同审查职责。 | 内部 ReviewedForUse **不是**法定资产权属、法律有效发行或金融牌照确认。 |
| **SCOPE-164** | M06-F001～F006 的最低产品闭环包含资料分类上传/权限、必要材料清单/补件、文书与签署版本、适格专业审核意见与报告引用、投资者必要条款确认及签署结果证据；**上传/内部审核/真实专业法律结论/电子签最终有效分别记录**。 | SaaS/运营人员不默认拥有执业审查资格或法定文件签发权。 |
| **SCOPE-165** | **M04-F008、M06-F007 为 P1 非默认首期增强**；**M04-F009、M06-F008 为 P2 后置**。即使不交付高级模板、多机构协作门户、复杂资产池或服务商竞价，也必须保留最低资产/权利录入、文件与适用专业意见/补件记录。 | 不因为业务存在专业审核就宣称完整法律/评估服务商市场已上线。 |
| **SCOPE-166** | M05 Offering 使用经审查的 **InstrumentVersion**；Quote/认购/签署引用准确生效的条款/文书版本；重要变更需受权影响分析，必要时暂停发行、再审核、重确认/重签或依法更正，**不覆盖历史或既有投资者合法权益**。 | 不自动决定已在途订单、签署合同及法定登记的唯一跨法域处理顺序。 |
| **SCOPE-167** | 同意以 **17 项逐 ID 详细规格与 B02-01～B02-17 案例设计**作为 Batch 02 的产品原则基线；测试卡全部 **Not Executed**，原 A/B 187 项均 **Not Tested**。 | 不授权 UI、真实资金/链执行、开发、PR #6 合并或最终 Issuer V1 产品范围冻结。 |

## 二、设计完成程度及下一批工作

- **Batch 01 M01～M03**：SCOPE-152～159 产品最小深度原则已批准，共 22 项。
- **Batch 02 M04/M06**：本决策批准 17 项最低产品深度原则及其风险边界；**具体页面 IA、数据库/API schema、外部服务商与法律条款/实现仍 Draft/TBD**。
- **下一步**：起草 Batch 03（**M05 Project/Offering + M19 规则与版本控制**）详细 PRD，提交新批次 SCOPE-168～175 待审。该草案不能自动标为 Approved。
- **全局阶段**：遵循用户明确选择的 **“完成所有详细 PRD → V1 实际产品范围及跨模块规格收口 → 统一 UI 设计 → 另行授权开发”**。
- **治理保护**：不修改第 02～04 份 Frozen、原功能树和 DEC/ARCH 已冻结决策；M01～M22 共 187 项 ID 与等级保持 **P0 125 / P1 21 / P2 21 / V2 6 / 商业批次待定 14**，PR #6 必须 **Draft / Open / Unmerged**。

**当前：SCOPE-160～167 Approved（产品交付深度原则）；Batch 03 待评审；B02 验收设计未执行，A/B 功能无真实测试通过声明。**
