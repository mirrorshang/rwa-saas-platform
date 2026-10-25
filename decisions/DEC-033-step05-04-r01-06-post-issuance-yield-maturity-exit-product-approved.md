# DEC-033｜Step05-04发行后存续、法定权益快照、收益、Claim/Push与合法退出六项产品规则批准

> **2026-10-25｜正式Approved：仅Step05-04-R01～R06六项A产品行为、业务权威与异常守卫**。不因此将数据库字段/API、实际付款义务人/法域、税务算法、Claim/Push合约/Signer/钱包/生产执行或Step05/Step06整体状态改为Frozen。

## 一、明确审批记录

> “Step05-04-R01：A；R02：A；R03：A；R04：A；R05：A；R06：A。补充意见：无。请仅将明确批准的六项产品规则形成正式DEC，完成Step05-04产品级详细PRD及跨端状态异常规范，更新GitHub及必要索引。技术字段/API、法域、实际资金付款方、Claim/Push合约与Signer方案继续Draft。完成后进入Step05-05可视化产品审核；不修改Frozen、不合并PR #6、不进入UI或开发。”

批准来源：[Step05-04可视化审核Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)第三节R01～R06。该草案作为历史保留，其旧“六项待审批”的文字不代表当前生效状态。继承[S04-05 M11/M13现行已批准原则](../docs/03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)、[S04-04 M12法定登记](../docs/03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)、[DEC-032合法持仓](DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md)、[S04-07 M08门户](../docs/03-product-prd/RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)。

## 二、正式批准的六项准确边界

| 编号 | 决策主题 | **仅产品级Approved A** | 仍然Draft／未授权 |
|---|---|---|---|
| **R01 | 发行后存续义务档案** | 每个合法Instrument/Series维护真正义务人、合同/法律版本、合法持有人权益关联、持续披露、付息/分红/到期任务；Offering停售和Tenant欠费/退出不消灭真实债务/股权权利，依法保留与交接。** | 没有批准任意法域的永久数据保存期限、法定义务移交契约或自动履约保证 |
| **R02 | 法定RecordDate快照** | M13以M12依法有效的持有人/权益登记及Instrument适用记录日生成受权冻结、留版本与纠错证据的权益快照；Token余额只能辅助核对。变更地址、补录、争议需依法复核并留历史。** | 没有批准链余额可以代替权利名册，或无审查自动重写已批准快照 |
| **R03 | 债权A与SPV权益B经济事件分开** | A债权按生效合同约定区分应计利息、应付利息、到期本金、逾期/部分偿付；B SPV权益在公司合法决议、可分配利润与法域条件成立后才产生已批准股息/回购等真实义务；预估、已计算、已应付、逾期不同步。** | B不默认固定APR、强制到期还本、保底或回购；具体税款/计息算法及企业决议模板未批准 |
| **R04 | 收益审批／真实注资／领取的顺序** | M13依据合法快照计算并经有权审批确定批次、实际付款主体、合法金额/扣税及受益人；实际合法注资、足额与Signer/付款权限经确认后才可开放Claim优先候选；保留依法适用Push/外部付款路径。资金不足默认禁止开放整批领取，合法部分批次须另获明确审批。** | 收益批次批准不等于真实注资；实际注资不等于已发给所有投资者；不授权真实合约部署或付款 |
| **R05 | 投资者收益的分状态展示** | V端按每笔M13真实权威分别展示依法可披露的预计/应付/已注资/可领取/领取中/部分/实付/未领取/Failed/Unknown；Claim需核合法权益人与钱包、真实链/外部出款Finality；M08只汇总，未领≠已付、已提交≠已付。** | 不冻结真实UI、钱包实现、付款Service/API或具体税务展示 |
| **R06 | 实际清偿、法定权益、Token合法处置分开** | 到期或适用提前退出时分别核M13真实本息/分红/赎回清偿、M12法定权益与名册变更、M07 Burn/冻结/交付链事实，并按Instrument及法域合法时序确认最终结清；A与B权利及退出条件不同，法定未清义务在Burn/退租后继续。** | 不保证所有B都有回购/退出，不将Burn当法律债务消灭，不授权Signer/真实转款 |

## 三、必须保留的独立业务真值

1. **M04**有效Instrument/Series法律条款与真实义务人；**M12**法定持有人、登记生效与权利变更；**M13**存续义务、RecordDate快照、应计/应付、批次真实注资、Claim/Push实际付款、到期逾期；**M07**链上Token/Burn/转移真实确认；**M08**只展示本人有权查看的汇总。
2. **M11投资者认购款和退款**、**M13收益/本息/股息付款**、**M01 SaaS商业订阅付款**分属独立法律与资金对象，不合并“付款成功”；M17/M18/M19/M20/M22提供审批任务、通知/法定送达引用、规则版本、安全审计及外部数据交换，不另建收益/登记真值。
3. **预计收益 ≠ 已依法应付；已计算 ≠ 批次批准；批次批准 ≠ 已真实注资；真实注资 ≠ 可领取（仍需受权Gate）；Claim发起 ≠ 实际Paid；Token Burn ≠ 合法债务已清偿**。存在逾期、部分实付、Unknown和未领取必须如实展示，不得用单一“已完成”覆盖。
4. Issuer及X实际付款人/公司董事或股东/登记人/Signer均须**各自依法/依合同有权**，不能因为SaaS Paid、平台管理员或Provider Webhook成功而自动取得这些权限。

## 四、文件与批准范围

- [Step05-04产品级PRD Approved v0.2](../docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)：当前R01～R06产品动作、状态语义、跨端职责、业务依赖及异常Guard Approved。可读字段名、日期与金额精度、接口与执行方式仍Draft。
- [Step05-04跨端产品状态与异常规范 Approved v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-04-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)：15项异常的**依R01～R06推导的产品保护义务**获准；技术状态enum/API/持款/法域处理与15项未来验收**Draft / Not Executed**。
- [Step05-05平台管理、全局工作流、通知/安全/外部服务可视化PRD Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)：只建立下一场景待审核提案，**不批准Step05-05任何新细化方案**。

## 五、不得越界的继续开放决策门

- **法域/Instrument**：真实法定登记/受益人RecordDate定义、合法分红与董事会/股东决议、债权计息与清偿、法定税费与受款资格、未领款法律处置、退租资产义务移交仍需具体法域/Instrument审核。
- **资金/合约/Signer**：合法资金义务人和实际持款方、Claim合约是否可安全合法适用、分配资金注资和余额核验、Push/外部实际付款、密钥/Signer权利、Gas/最终性/重组/退款均需独立技术与法律安全审批；无生产执行授权。
- **字段/研发**：精确业务对象ID、金额精度、时间戳与RecordDate时区、法定快照证据、实际付款幂等事件、审批门槛、合同版本、权限码、API/数据库Schema及E2E测试均仍Draft/Not Executed。
- **版本与治理**：DEC-017原193项版本归属（V1 146、V2 22、V3 20、TBD 5）和Step04 146/146已批准不改；DEC-028静态跨端有条件认可及13项Open风险继续跟踪；四份Frozen/历史DEC/SCOPE/原已Approved规则不改；PR #6维持Draft/Open/Unmerged。Step05-05仅进入可视化Draft，V1.0整体未冻结，不进入UI/研发/真实资金或Token生产。

**DEC-033效力：Step05-04-R01～R06六项产品级Approved；其余技术、法域、真实付款/Signer及上线许可仍Draft。**
