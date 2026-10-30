# SCOPE-143～SCOPE-151｜A/B Instrument 187 项功能对照及 Issuer V1 范围冻结前置门

> **Approved — 产品审核方法、共享业务核心、条件性能力及冻结前证据门；并非 187 项最终交付深度、首发法律 Instrument、生产实施或工程验收批准。**
>
> 日期：2026-10-22。产品负责人明确确认：**“SCOPE-143～SCOPE-151 全部同意”**。
>
> 正式依据：[A/B 187 项必要性及 V1 冻结门对照](../docs/03-product-prd/RWA-SaaS-AB-187-Function-Need-and-V1-Freeze-Gates-Review-v0.1.md)、[SCOPE-134～142 B 权益原则](SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md)、[SCOPE-117～125 A 债权原则](SCOPE-117-125-debt-instrument-A-business-validation-principles.md)、[SCOPE-126～133 A1](SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md)、[SCOPE-078～085 条件性 P1](SCOPE-078-085-conditional-p1-v1-baseline-principles.md)、[ARCH-001 API-First](ARCH-001-api-first-unified-business-core.md)、[DEC-011 V1 一级发行/V2 受控转让](DEC-011-primary-issuance-v1-controlled-transfer-v2.md)。

## 一、九项已批准原则

| 决策 | 已批准原则 | 明确未授权 |
|---|---|---|
| **SCOPE-143** | 将完整 **187 项 A/B 需求必要性对照及 16 项条件性 P1 触发初审**作为真实 V1 范围冻结前的正式**产品审查工作底表**，所有行继续 Not Tested。 | 不是具体功能交付清单或 E2E PASS。 |
| **SCOPE-144** | A/B 必须复用 Tenant/权限、版本化 Asset/Instrument/Offering、KYC/Offering Eligibility、报价/额度、真实稳定币收款/退款及对账、受权配售、权威法律登记、真实 Token 与 M13 存续/审计的统一 **API-First 核心**；不按 Instrument 复制第二套权威业务。 | 不等于商用开放 API 以及真实资金托管、法律登记或合约签名由 SaaS 默认执行。 |
| **SCOPE-145** | 债权 A1 的 Series/晚入应计/票息/到期，以及 B 的公司发行授权、资本/份额、稀释/合法可选分红等，作为 M04/M05/M12/M13 的**权利家族适配**。 | 不自动增加 Mxx-Fxxx 功能编号、系统模块或 V1 默认实施深度。 |
| **SCOPE-146** | 16 项 P1 采用「始终必要的安全底线 / A 固定本息所需 / B 合法分配或退出触发 / 必须合法集中募集或部分配售时触发 / 高级 UI 可延后」分层裁定。 | 不将 P1 原等级改为 P0，不因无高级 UI 就取消底层 Guard。 |
| **SCOPE-147** | A/B 的真实资金、配售、法律权利生效/名册、链上 Token、分红/本息实际外部付款与 Unknown 结果均维持**分别授权、分别存证、幂等和受控恢复**。 | 不得以 Token Mint 或任一单一系统状态代替全部完成。 |
| **SCOPE-148** | 延续 SCOPE-071～077：真正收款/退款/兑付、法定登记与受权电子签/链上签名由适格主体执行，SaaS 维护合法前置校验、授权指令与可信结果核验；真实服务商和责任按法域独立批准。 | 不默认 SaaS 获监管许可、私钥/资金控制权或公司法定登记主体身份。 |
| **SCOPE-149** | 原 46 项非默认 Issuer V1 核心、M14 受控二级转让 V2、M15 White-label 与 M16 商用 Open API 独立交付批次、C/D/E 长期 Instrument GAP 的边界继续有效。 | 不因 A/B 审核自动纳入 V1 研发。 |
| **SCOPE-150** | 最终冻结 V1 必须满足 **G-01～G-06** 六个门：实际首发 Instrument/法域；法定与执行权威方；合法发行模式；16 项条件性 P1 深度；187 项逐功能交付深度；实际测试/验收和合法证据要求。 | 不以参考样本替代真实法域、公司决议、执行主体或技术验收。 |
| **SCOPE-151** | 批准的是**产品审核工作方法与候选范围边界**。A/B 187 项仍 Not Tested，A-T01～16、A-D01～12、B-T01～16 均 Not Executed。 | 不批准具体法域金融权利生效、生产交易、真实 V1 功能冻结、技术/API/UI 最终 PRD、研发实施或 PR #6 合并。 |

## 二、冻结前必须区分的三层“完成”

- **产品原则 Approved**：产品负责人同意业务模型、边界、功能审查方式；本批即处于该层。
- **功能规格/正式交付范围 Approved/Frozen（未来）**：逐功能确定最小 UI、字段、业务命令/查询、API 契约、角色、状态机、异常、证据、验收和实现深度，完成 G-01～G-06 所需的产品/法律适用性审批；需用户单独确认。
- **软件/金融执行 Tested/Live（未来）**：经过真实代码、外部适格服务、沙盒/测试链或依法生产环境验证的结果；与文档批准不能混为一谈。

## 三、下一阶段与长期不变约束

1. 编制**Issuer SaaS V1 具体交付深度分批评审计划 Draft**，以发行机构从购买 SaaS 起步的流程为序，说明每个业务环节的页面/API/权限/状态/异常/证据最低规格；先审通用 Issuer 工作台，不抢先确定法域/真实金融服务商。
2. 按已批准分类保留 **M01～M22 共 187 个 ID**（P0 125、P1 21、P2 21、V2 6、待定 14），以及 **73 共享核心 / 42 共享界面 / 10 受权外部执行 / 16 条件性 / 46 非默认 Issuer 首期**。不得擅自扩项。
3. A/B 的行业权利差异在 M04/M05/M12/M13 中以条件性规则处理；C/D/E 18 GAP 保留为长期参考而非首期专有系统。
4. 第 02～04 份 Frozen、冻结功能树、ARCH-001、DEC-011 维持原文。**PR #6 保持 Draft / Open / Unmerged；除用户另行授权，不合并、不启动代码实施或真实金融交易。**

**当前状态：SCOPE-143～151 Approved；真实 V1 具体交付深度、权限/法域执行主体、详细 UI/API/工程测试仍 Draft/TBD。**
