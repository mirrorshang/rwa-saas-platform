# SCOPE-101～SCOPE-108｜Instrument 权利类型体系与扩展边界

> **Approved — 长期通用多资产产品模型与扩展原则；非 C/D/E 生产交付或 Issuer V1 实施冻结**
>
> 日期：2026-10-22。产品负责人明确确认：**“SCOPE-101～SCOPE-108 全部同意”**。
>
> 依据：[Instrument 类型体系与扩展边界草案](../docs/03-product-prd/RWA-SaaS-Instrument-Families-and-Extensibility-Boundaries-v0.1.md)、[SCOPE-096～100 A/B 参考样本选定](SCOPE-096-100-reference-instrument-validation-selection.md)、[ARCH-001 API-First](ARCH-001-api-first-unified-business-core.md)、[187 项范围定位矩阵](../docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)。

## 一、八项明确批准原则

| 编号 | 批准结果 | 交付与法律边界 |
|---|---|---|
| **SCOPE-101** | 采用**五类长期产品能力家族**：A 债权，B 实体权益，C 基金/集合投资份额，D 合同收入/版税参与，E 特定资产权属/托管凭证 | 这是产品家族而非全球统一法定分类；监管定性由具体法域及文件决定 |
| **SCOPE-102** | **Asset 标的、Instrument 法律权利/载体、Offering 发行条款、Token 技术表示与权威登记相互分层**，允许组合权利、审查与版本化 | 底层房地产/黄金等资产类别不能自动推断投资者持有的法定权利 |
| **SCOPE-103** | 保持已确认的 **A 固定收益到期债权型 + B SPV 股份或类似权益型**为 V1 首批完整产品验证样本 | 不重开 SCOPE-096～100 的选样，不把 C/D/E 加入当前完整 V1 验证范围 |
| **SCOPE-104** | C/D/E **仅做当前总体权利模型、功能差距识别与 API 扩展边界规划** | 完整基金 NAV/申赎、合同收入结算、托管储备/实物赎回等生产能力、商用排期必须独立审查；模型存在不等于能发行 |
| **SCOPE-105** | 维持既有 **M01～M22 / 187 项功能 ID**，以及 P0 125、P1 21、P2 21、V2 6、批次待定 14 的原始范围基线 | 未来 C/D/E 需要专有功能时建立增量 PRD 与独立决策，不能暗中更改冻结功能树/既有 V1 承诺 |
| **SCOPE-106** | 同一底层资产可设计不同权利型 Instrument；同一 Instrument 可有组合权利和适用限制 | 法律形式、文件版本、法定登记、义务/托管主体、法域和相互冲突的权利需分别核验 |
| **SCOPE-107** | 碳信用/环境属性的登记与注销、储备支持稳定币/支付 Token **保留独立适用性、监管和产品线决策门** | 不强制塞入 A～E，不默认 Issuer SaaS V1 生产支持 |
| **SCOPE-108** | 后续详细 PRD 与技术规格应承接五类家族、家族可用状态、权限/法域守卫和 ARCH-001 的统一后端及 API-First 扩展原则 | A/B 的 187 项验证仍全部 **Not Tested**；真实 V1 范围、服务商、资金/登记/签名责任和上线另行批准 |

## 二、批准范围及特别说明

五类家族定义如下：A Debt Claim（约定债务/本金利息）；B Entity Equity（股权/实体权益）；C Fund / Collective Investment Interest（基金单位/集合投资权益）；D Contractual Revenue / Royalty Right（收入参与/版税合同）；E Title / Custodial Claim to Asset（权属/托管资产凭证）。**C 不等于任意基金必须是独立法律形式，D 不等于所有分成均非证券，E 不等于拥有 Token 自然有实物所有权**；必须保留具体法域/法律文件与权威登记的判定。

对五类采用同一个 Asset→Instrument→Project→Offering→Subscription→Payment/Reconciliation→Allocation/Register→On-chain Token→Lifecycle 共用业务核心。家族适配不得产生第二套付款/配售/法定登记权威，不得绕过租户、资格、幂等、授权签名、审计和外部结果核验。

**批准的是长期架构方向，不是一次性建设五套完整业务系统。** C/D/E 的专用 NAV、估值和申赎、收入源对账、托管储备证明和实物交付需要未来独立明确范围、客户及合规责任。可先规划通用字段组、权利片段、扩展契约、版本、安全关闭能力，但不能对外宣传已经生产支持。

## 三、后续工作与治理门

1. 新建 **C/D/E 与既有 187 项功能的复用及缺口分析 Draft**。指出哪些直接复用、哪些须可配置/扩展、哪些需要独立增量开发、哪些须法域/适格主体判定；缺口编号仅限分析引用，不立即新建 Mxx-Fxxx ID。
2. 完成缺口分析后回到**A/B 已批准验证样本**；后者现有 187 项仍 **Not Tested**，不得提前声称合规或 E2E 已通过。
3. 真实 Issuer SaaS V1 逐功能交付范围及开发授权、法律/资产权利效力、首发法域、生产 Token/链/资金/登记/签名主体、White-label 和 Open API 商业排期，均保持**独立待决策**。
4. 不追溯更改第 02/03/04 份 Frozen 文件、冻结功能树、DEC-001～011 和 ARCH-001；**PR #6 继续 Draft / Open / Unmerged**，未经产品负责人另行批准不合并。

**状态：SCOPE-101～108 Approved；具体 C/D/E 实现深度及 Issuer V1 必交清单 Draft/TBD。**
