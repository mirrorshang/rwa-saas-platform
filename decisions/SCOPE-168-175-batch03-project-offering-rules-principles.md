# SCOPE-168～SCOPE-175｜Issuer V1 Batch 03：Project / Offering、发行与规则版本交付深度决策

> **Approved（产品需求级交付深度原则）**，不代表 Issuer V1 最终范围冻结、具体法域发行许可、UI/技术方案批准或真实软件/金融测试通过。  
> 日期：2026-10-22。产品负责人明确确认：**“SCOPE-168～SCOPE-175 全部同意”**。
>
> 依据：[Batch 03 详细规格](../docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-03-Project-Offering-Rules-Publishing-Review-v0.1.md)、[Batch 02 已批原则](SCOPE-160-167-batch02-asset-instrument-documents-review.md)、[187 项原功能范围](../docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)、[Frozen 业务流程与状态机](../docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)。

## 一、八项已批准原则

| 决策 | 已批准内容 | 不得延伸解释 |
|---|---|---|
| **SCOPE-168** | Batch 03 审核范围限定 **M05 12 项 + M19 7 项 = 19 项**（**P0 15、P1 2、P2 2**），以现有功能 ID 及五类交付定位审查最低实际产品规格。 | 不新增正式功能编号、不调整 187 项原优先级、不由本批批准全局 V1。 |
| **SCOPE-169** | **Project 为发行/存续工作容器，1:N Offering**；Offering、认购/Quote、真实付款、配售、法定登记、Token、生命周期分别拥有自己的状态/权威。结束 Project 前依法/依合同核验各轮未结义务。 | 某笔订单完成、Offering 关闭销售、Token Mint 成功，都不代表 Project/法律存续结束。 |
| **SCOPE-170** | M05 创建、审核及发布 Offering 要引用受权 Asset/Instrument/文件版本、合法 Issuer、额度/价格/精度、投资者资格、收款/退款/登记/Token 的依法批准方案。 | 不默认具体法域已允许发行或 SaaS 自己有收款、公司发行、法定登记与私钥签名权。 |
| **SCOPE-171** | 合法条件下优先**持续一级认购**；单笔完成不能自动终结销售窗口；停止新认购也不得删除在途资金/配售/登记/Token。**M05-F011 BatchAllocation** 原 P1，在实际法域/工具/公司批准/合同要求时触发最低集中募集配售闭环。 | 持续发行不能绕开合法募资或公司机关批准；不是要默认开发所有复杂融资功能。 |
| **SCOPE-172** | 遵守冻结 WF-04/WF-05 的 Project 与 Offering 生命周期，区分**提交审批、获批准、实际发布、Open、暂停、关闭销售及结算**；发布前置 Guard 不满足时阻断 Open 并显示实际原因。 | SaaS 商业管理员、内部 ReviewedForUse 不能充当金融发行合规许可。 |
| **SCOPE-173** | M19 的软件能力、Instrument/Offering 条款、投资者资格、支付/额度/配售/Token 规则必须**版本化、经受权审批、按生效时点执行，停用与历史可追溯**；已在途或已签 Quote/文件/已配权益不能被静默改写。 | 不批准用新版本直接改变投资者合法既有权利。 |
| **SCOPE-174** | **M19-F006 平台/强制法域安全 Guard 的优先级为必要底线**，高级规则 UI 可延后；**M05-F012 动态定价及 M19-F007 可视化规则引擎仍为 P2 后置**。 | 不能因延期高级编辑器而停用服务端强制资格、法域、额度和资金安全守卫。 |
| **SCOPE-175** | 接受 Batch 03 的 **19 项逐功能最小深度**及 **B03-01～B03-19 验收设计案例**作为已批准**产品原则**。全部 B03 卡 **Not Executed**；A/B 187 项源功能底表全部 **Not Tested**。 | 不授权真实资金/Token 测试、正式 UI、代码开发、合并 PR #6 或全局 V1 范围/商用冻结。 |

## 二、对后续 Batch 04 的直接要求

Batch 04 **M08～M12** 需以版本化 Offering/Eligibility/Quote 为源头，分别处理投资者账户及准入、认购/有效期、M12 唯一额度预留、M11 真实 USDT/USDC 到账/最终性/对账/退款、合法配售与权威登记。**M11 资金、M12 法定登记、M07 Token 永远不可由单一 UI 状态相互代替。**

## 三、原范围与协作纪律

- 第 02～04 份 Frozen、功能责任树、已批 DEC/ARCH 原文不变；**187 个正式功能 ID** 与原优先级（P0 125 / P1 21 / P2 21 / V2 6 / 商业批次待定 14）不变。
- Batch 01、02、03 的产品最低交付深度原则分别已批准；**Batch 04 仍需单独草案及审批**。
- 用户确定的工作顺序：**完整详细 PRD → V1 产品范围及跨模块规则冻结 → 统一 UI 设计 → 另行授权研发与真实金融执行**。
- **PR #6 必须 Draft / Open / Unmerged**；本决策仅批准产品原则。

**状态：SCOPE-168～175 Approved；Batch 03 具体 UI/API、法律/服务商与工程实现 Draft/TBD；B03 案例 Not Executed。**
