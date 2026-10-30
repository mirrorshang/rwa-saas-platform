# DEC-015｜Step 03 XCHK-01～10 十项审核原则批准 A

> **Approved — 2026-10-23。** 产品负责人明确指示：“**Step 03 的 XCHK-01～10 全部同意 A**”。本决策基于已形成的 [Step 03 187项交叉矩阵](../docs/03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md)及 [XCHK 十项原 A/B 方案](../docs/03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)，**将十项缺口处置、权威边界及审核方法原则批准为 A**。
>
> **本次不等于新增正式功能ID，不等于已批准全部187条具体开发版本，不等于 V1.0 正式产品范围冻结，更不代表可以开发、操作真实资金或部署真实 Token 合约。** DEC-012/013/014 和原 Batch01～06 Approved 原样延续，原四份Frozen不被修改。

## 一、十项全部 A Approved
| 决策ID | 已批准的处理原则 | 正式采用 A 的内容 |
|---|---|---|
| XCHK-01 | 将原187项保留为历史唯一主账，不删除、改号；Step03先解决V1闭环缺口再批准各ID的V1.0/V2.0/V3.0唯一归属 | **A Approved：**按原记录维护+另立差距/版本审批 |
| XCHK-02 | Issuer最小独立Portal（唯一URL/基础品牌/授权展示）与M15高级白标解耦 | **A Approved：**基础门户列V1并建立可验收独立单元；M15高级白标维持V2候选 |
| XCHK-03 | 投资者嵌入式Wallet生命周期不能由KYC或收币钱包校验替代 | **A Approved：**按CR-06明确创建/恢复/签署/绑定独立交付单元，技术类型保持TBD |
| XCHK-04 | 募集资金结算与认购退款及收益出款必须是三种用途 | **A Approved：**为Issuer受权释放/划拨与实际到账设独立交付单元，分开事实和责任 |
| XCHK-05 | 收益分配至少具备合法事件、快照、应付、注资/足额、触发与实付/未领历史 | **A Approved：**单独定义Funding/Distribution Batch与Investor Claim/Push交付单元（执行模式仍TBD） |
| XCHK-06 | 合约Factory、A/B受控模板与发行审批 | **A Approved：**扩深原M04-F008、M07-F002及M22集成边界，必要新Deployment任务功能再立项；不设默认三合约 |
| XCHK-07 | 确认8组重叠属于分权、权威和展示复用，保留有不同业务职责的原ID | **A Approved：**仅调整字段级主责/只读/引用，不合并删掉法律资金/Token的不同事实 |
| XCHK-08 | A债权本息、B SPV合法可选分红和条件回购分开，未定法域/真实执行方时不能假定技术默认 | **A Approved：**保留CR/Batch安全原则，自动支付与法定权益时点在字段级和实际法域单独核 |
| XCHK-09 | 对V1覆盖深度不足项采用‘现有ID扩深’和‘真正新增功能单元’两个处理路线 | **A Approved：**先产建议功能候选，不发新的正式Mxx-Fxxx ID；产品批准后再编号并修正187分母 |
| XCHK-10 | 按用户希望的简洁审查方式，先批准差距归属与V1目标；187条版本归属逐模块后续集中审核 | **A Approved：**保留11步主线 Approved，完成Step03核验后按模块批量确认版本，再做Step04清单和字段级PRD |

## 二、产品负责人实际批准的边界
1. 原 **187** 个 Mxx-Fxxx ID及历史P0/P1/P2/V2/待定分级保留在原文件，不删除、不静默重新编号、也不因表述看似重复就合并不同法律/资金/Token权威。Step 03 的 187×11双向纸面核验记录保持 Draft，并非测试执行完成。
2. **V1.0 核心能力必须清楚归属**：Issuer基础独立投资者门户（与M15高级White-label分开）、投资者合法嵌入式Wallet生命周期、Issuer合法募集资金释放与划拨、收益事件与实际资金注入以及一种合法的Push或Claim领取/到账闭环。
3. SaaS 商业订阅费、投资者认购款、发行方募集资金结算款、投资者认购退款、票息/股息/本金实际支付，分别建立有权实体、原始付款Intent、资金状态与权威回执；不能复用一个“提现/退款按钮”或复制出多套资金权威。
4. 合约Factory的自动部署、A债权/B SPV权益模板、Issuer Portal 最小能力及投资者钱包要按功能责任**扩深现有ID或提出独立可验收交付单元**；[旧11个 PROP](../docs/03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)是**候选单元**，仍不得自动派生为11个新正式ID。
5. **投资者与法定权益必须分离**：KYC与法律持有人、认购订单/真实支付/合法配售与持有人名册/链上Token、基金/房租现金流与已合法分配的公司股息，以及实际到期清偿与Token Burn不能混为一个成功状态。
6. 保留 **DEC-014 Approved的11步核心流程**；用户后续审核看人能理解的“第一版做什么/第二版做什么”，详细状态/技术异常在 PRD 完成，不再强制读完全部泳道才进行版本范围审核。
7. **真实法域、具体金融服务/登记责任主体、钱包架构、智能合约协议与生产签名权限、实际资金托管/合法结算和收益Claim法律效果继续待决。**
8. **未来版本治理**：已经批准的 DEC-012规定 V1.0＝第一版最终必须完整交付的内容，V2.0和V3.0各有具体计划版本；当前按187旧项的 **140/22/25**只是 **Draft建议**，经 Step 03 按模块/功能集中审批后才能逐项转换成 Approved。高级M15白标、M16商业OpenAPI、M14受控二级转让不得因主流程11步自动进入V1。
9. 只允许在新版本规划/功能完整清单经过**产品负责人明确批准**后，将确属新增业务职责的PROP候选编为新的正式功能ID并重算总数，已经在原功能ID中扩深的不能重复计数。
10. 开发/UI/测试/生产金融与链上执行都未获本次批准；[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)保持Draft/Open/Unmerged。

## 三、后续交付
- 以审定原则更新[差距及重叠审计文件](../docs/03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)的**XCHK状态**（已 Approved A，D01～12及PROP-01～11具体交付明细仍是 Draft）。
- 输出可供产品负责人审阅的**V1.0 / V2.0 / V3.0版本能力分组及功能清单候选**，链接回原 [187逐条目标版本建议](../docs/03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md)，明确首发完整闭环和每个待新ID/扩深的功能归属。
- 后续如有新决策，继续按DEC追溯历史批准，保持旧Frozen不改写；最终V1.0唯一功能清单与字段级PRD在 Step04～06 另行确认。

**状态：XCHK-01～10全部 A Approved；187逐项交付版本、功能新增/扩深最终编号、首版范围及实现明细仍 Draft/TBD。**
