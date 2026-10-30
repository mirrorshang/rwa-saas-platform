# DEC-030｜Step05-01产品级收口：R04～R07全部A

> **Approved（仅已明确审核的产品级业务规则）｜2026-10-25**。承接[DEC-029](DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)已批准R01～R03及[DEC-019](DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)。本DEC批准Step05-01产品行为和状态语义收口，**不批准具体价格、第三方服务商、法域结论、数据库schema、实际API、技术签名/执行或V1.0整体Frozen**。

## 1. 用户原始审批与授权边界

> “Step05-01-R04：A；R05：A；R06：A；R07：A。补充意见：无。请仅将明确批准的规则形成正式DEC，完成Step05-01产品级详细PRD与跨端状态异常规范的收口，更新GitHub及README索引。未批准的技术、价格、服务商和法域事项保留Draft及决策门。完成后进入Step05-02可视化产品审核；不修改Frozen、不合并PR #6、不进入UI或开发。”

| 编号 | 审核结论 | 产品级准确含义 | 未批准内容 |
|---|---|---|---|
| **R04** | **A** | 试用从真实激活瞬间起持续**14×24小时（336小时）**；到期后的受限恢复窗口持续**30×24小时（720小时）**；服务端统一按UTC时间点记录并判断，各端按用户适用时区显示，不因注册处于当天晚间而损失整天 | 具体技术时钟、任务调度、边界秒级算法、业务展示地区推断、数据删除政策 |
| **R05** | **A** | KYB补件继续原案件；正式拒绝后有合法新证据/有效复核依据才可申请重新受理，由有权人员决定；Unknown不能自动判通过。不统一规定全球所有法域固定复核次数，具体合法期限另审 | 不限次数自动重试、把补件直接改已通过、具体法域申诉次数和法定时限 |
| **R06** | **A** | 原Tenant内合法Asset/Instrument/Offering**草稿可以续用**，但是在进入真实发行/正式发布前，必须按当前文书版本、法律主体、商业授权、规则与生产权限重新校验；模拟的投资者、资金、Token、法定登记等绝不能直接转为真实事实 | 自动正式发布、自动创建真实Token/交易、所有演示资产资料无条件转为法定凭证、生产执行权限 |
| **R07** | **A** | 商业付款结果与Tenant权益开通为**两个独立的用户可见状态**；付款真实已确认但升权失败/处理中时企业端显示类似“付款已确认，服务开通处理中”，平台后台生成受权恢复任务；核验原结果，在**原Tenant**恢复、不重复扣款；Paid不等于具体Offering已获合法发行许可 | 具体消息文案冻结、自动重试算法、自动退款策略、支付商集成、付款Unknown强制视为Paid |

## 2. 当前Step05-01批准范围

- 前序[DEC-029](DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)已批准R01同Tenant草稿留存且模拟事实不变生产、R02商业KYB未通过仍依Trial政策受限并可依法复核、R03实际商业付款已确认但开通失败仅核实原付款后在同一Tenant恢复授权而不重复收费。
- 本次DEC-030新增**R04～R07四项**，形成**Step05-01 R01～R07七项产品业务规则全部Approved**。DEC-019还明确了先注册邮箱、无需预绑支付、14天受限Trial、正式商业付款前KYB、唯一Standard、到期只读与30天恢复及Paid金融义务保护；不重复改变其文字。
- [Step05-01产品级详细PRD Approved v0.3](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md)与[跨端业务状态及异常规范 Approved v0.2](../docs/03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md)仅**已批准的产品行为、业务状态语义与保护性Guard**具有Approved效力。它们引用的**65条字段候选、工程枚举/精度、API/错误码、服务实现、自动化测试和验收结果**继续Draft/Not Executed。
- 已有[字段级PRD v0.2 Draft](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)及[状态异常 v0.1 Draft](../docs/03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-States-Exceptions-Draft-v0.1.md)原文保留，可追溯尚待技术审定的字段细节。

## 3. 产品收口并非技术冻结

- **已可用作下一场景输入**：角色/页面逻辑、业务对象唯一事实拥有者、流程与双状态展示、计时产品规则、R01～R07行为、必要异常阻断原则、未来验收断言。
- **继续Draft或独立决策门**：Standard价格/套餐计费周期与额度/税票、商业支付服务商/币种/退款规则、适用KYB法域与代表证明/保留期限、14天与30天实现边界算法、正式API和数据库字段/唯一键、服务可用性指标与审计日志schema、实际Signer与生产资金/Token等。
- Step04的**146/146唯一V1.0功能逐IDApproved**、DEC-028的静态全链路覆盖有条件认可及13项审计风险Open不变；**Step05-02**只进入下一场景的**可视化产品Draft审核**，不自动批准其任何产品细节。
- 不修改四份Frozen、历史DEC/SCOPE及已批准Step04正文；**PR #6 Draft/Open/Unmerged**；不进入UI、代码、智能合约开发、实际支付或Token生产执行，也不宣告V1.0整体Frozen。

**状态：DEC-030正式Approved（Step05-01 R04～R07）；Step05-01产品业务层R01～R07已收口；字段技术执行层、Step05-02与Step06待单独批准。**
