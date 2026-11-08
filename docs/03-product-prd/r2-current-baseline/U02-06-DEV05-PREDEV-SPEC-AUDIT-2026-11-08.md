# RWA SaaS R2 U02-06｜DEV-05 开发前规格一致性审计（Audit Only）

> **审计日期：2026-11-08｜结论：CONDITIONAL GO — 仅 Offering 前端业务准备、投资者内部预览与隔离 Mock 状态展示；真实发行/资金/合约生产 NO-GO。** 本次复核的是 GitHub 文档而非用户 Windows 本地最终源码：不能据此宣称 DEV-03/04 独立验收已完成或 DEV-05 已执行。**不增加或批准任何新的产品规则，不代表用户已授权 Codex 编码。**

## 一、审计范围与优先级
- 2026-11-08 当前 R2 文档工作分支：`docs/r2-current-product-baseline`、[索引](README.md)，PR #8 Draft/Open/Unmerged。
- 上位产品约束 [R01～R06](U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md)、[R07～R12](U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md)、[R13～R18](U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md)、[R19～R24](U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md)、[R25～R30](U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md)、[R31～R36](U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md) 全部 **Approved 产品原则**。
- 三份候选交接文件：[UI-Ready 字段字典](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)、[状态和异常矩阵](U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md)、[T01～T36 浏览器验收](U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md)。三份文档所新增 Candidate/Open 细节不因文字写得详细就变成 Approved。
- U01 Free/Standard 与 KYB/钱包/降级边界继续优先适用；Instrument 固定版本与文件引用遵循 U02-05；对 USDable 2026-11-05 的 Mock 发行编辑/暂停/恢复/延期/关闭及已记录错误仅作竞品证据。

## 二、逐项一致性审计发现

| 编号 | 等级 | 发现与证据 | 审计处置 / 是否阻碍 DEV-05 纯前端 |
|---|---|---|---|
| **F01 关闭状态与在途订单** | **P1（已纠正候选验收用例）** | Approved **R27** 规定支付/Token/退款必要义务处理后才能 **Closed**；旧 T23 却要求“在途 200 Token 时受控关闭、释放 1,000”，与 T22 和状态矩阵的 `Ended→Closed` 守卫矛盾 | **已仅修改候选 T23**：在途 200 时仍是 Ended，关闭须阻断；结清并对账后才 Closed，释放最终无义务份额。不改变 Approved R14/R24/R27。此缺陷已处理，可继续前端准备 |
| **F02 Instrument Ready 的 Offering 创建前置门** | **已由用户决策关闭（Approved）** | 初审发现上位 R01/R31 没有明确是否允许 Instrument Draft 时创建 Offering Draft；用户于 2026-11-08 明确选择 **A**：当前有效 Instrument 必须 Ready 才能创建 Offering | 已记录 [DEV-05-01 正式决策](U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md)，并同步 UI-Ready、状态矩阵及 T02：无 Instrument / Draft / 检查失败 / 文件未扫描或失败 / Ready 失效均禁止新建；只有当前 Ready 确定版本开放入口。服务层也必须复核，不可只隐藏按钮。**该问题不再 Open** |
| **F03 投资者端实际预览的可复用对象** | **P1（实现依赖）** | Approved R29/R35 要求投资者端展示结构/数据映射一致；现有 DEV-03/04 报告并无完成真实对外投资者门户的证据 | **前端建议**：使用共享的只读展示组件/数据转换层呈现资产卡片、详情、权益、发行条件及披露；不新建对外可访问门户、不虚构交易入口。若未来真实门户已有组件，Codex 应先真实查源码并复用；不要把本地内部预览冒充正式发布。此项不阻碍内部预览开发，但后续门户一致性仍需验收 |
| **F04 Mock 业务状态与生产状态区分** | **P1（必须硬性隔离）** | R17/R21/R25/R28 要求业务资料 Ready != 合法生产发行。T19～T30 可经隔离 Fixture 演示“已发布/在售/付款/Mint”，但 Standard 当前未取得独立资金/Signer/合约准入 | 仅独立测试控制台可注入**模拟**生命周期/订单/份额/链上事件；普通 Free/Standard 客户操作不能把模拟「发布成功」写成真实发售。生产门默认 **Unknown/Blocked**；不得生成公开页、真实支付交易、Mint 或资金结算。是开发范围边界，前端可以 GO |
| **F05 合规选择器与代币精度没有生产来源** | **P1（生产阻断，前端候选）** | R10/R32 中地区许可/KYC 和固定价格/最小购买均需要合法规则、准确支付最小精度；UI 字典明确这些来源与 token decimals 仍 Open | 页面可表达个人/机构/条件/地区/锁仓以及整数 Token 最低份数，允许可配置的**测试样本**，但不能默认全球合法、KYC 已过或真实 USDT 合约地址已核实。可演示金额，真实支付不可 GO |
| **F06 多期 Waiting/Paused 时间窗和并发** | **P2（后端尚未决定）** | Approved R13 仅规定同一 Instrument 同时最多一轮**实际开放认购**；未来多个已发布 Waiting、Paused 的排他窗口和冲突守卫在状态矩阵仍 Open | DEV-05 先支持多期 Draft 及共享容量的独立模拟状态；不要擅自冻结“同一结构永远只能有一张已发布方案”；真实定时/并行发布事务后批专项实现 |
| **F07 钱包/文件真实性** | **P1（生产阻断）** | U01 真实 MPC / 签名绑定待 Provider/Signer 生产准入；U02-06 要求从企业已绑定钱包选收款方和固定文件版本，不意味着 Mock 地址被法律验证 | UI 优先复用 U01 已有钱包绑定状态和文件版本；仅显示可用于该 Tenant 的钱包。模拟地址标记为**仅内部测试数据**，不能对生产检查返回假通过；旧版引用不随新版本静默变化 |
| **F08 DEV-03/04 基线与独立审计** | **P1（开发启动前置）** | 用户报告 DEV-03/04 本地 HEAD `39e200c7...`、Chrome 自测 20 PASS，并已委托独立 Audit Only；本次没有访问 Windows 本地源码、审计 JSON 和截图 | 若独立审计仍在运行，不要并发修改同一 worktree；拿到真实报告后针对 P0/P1 修复/隔离，再在 **最新 HEAD** 上开始 DEV-05。不能使用过时 docs SHA `953454...` 冒充当前批准规则 |

### 兼容性结论
- **无需要推翻 R01～R36 已批准产品方向的根本冲突。** 用户随后补充批准 DEV-05-01，新增的 Instrument Ready 创建前置门已正式记录，不再作为未决项。
- **F01** 已纠正候选验收与 R27 的关闭守卫冲突；**F02** 初审时留为 Open，随后用户选择 A 正式批准 Instrument Ready 前置门，现已同步 UI-Ready、状态矩阵和 T02。均保留原有产品决策层级，不把审计推断当作用户批准。
- 后续细节（发布后变更白名单、付款订单超时、KYC 等级、可售 Token 技术精度、结算费用、退款责任、合约钱包资金控制）继续 **Open**，**不得推断被本次审计批准**。

## 三、DEV-05 可开发范围划线（建议，非自动授权）
| 工作包 | GO/NO-GO | 明确可做与禁止 |
|---|---|---|
| **DEV-05A Offering Draft 前端** | **CONDITIONAL GO** | 仅在当前 Asset 的 Instrument 确定版本 Ready 后开放新建 Offering；资产详情发行管理 TAB 列表/空态、Offering 单页 A/B/C、既有 Asset/InstrumentVersion 只读引用、名称建议、数量×价格 U、最小认购份数提示、时间/地区/KYC/锁仓字段、同 Tenant 企业钱包下拉、文件引用、资料检查、草稿保存恢复/错误、内部投资者预览；不能真实付款/发布 |
| **DEV-05B 隔离 Mock 状态/验证** | **CONDITIONAL GO** | 只在独立测试控制台/Fixture 中注入 Waiting/Active/Paused/Ended/Closed、订单失败/支付已确认待交付、退款/Token/份额数据，用于 UI 状态和 R14/R24 容量展示、T19～T30 验收；正式客户界面不得出现 Mock 场景操作或真实已发布假数据 |
| **DEV-05C 实际发行/认购/Mint/资金** | **NO-GO** | 真实 USDT 授权转账、部署/Mint、正式 Investor Portal 公开地址、自动分账/托管/退款、生产订单/账户系统；法务/技术安全/资金/合规/Signer/Provider 等独立准入及生产验收前不可实施 |

## 四、DEV-05 启动前实际检查门
1. 收到 DEV-03/04 的 **独立 Audit Only 报告**：确认最终代码/测试与可复现性，P0/P1 有闭环或明确隔离；用户人工验收可在后续完整浏览器回归时完成，不因 Codex 的 PASS 直接视为通过。
2. Codex 在本机先报告当前分支、HEAD、git status、未跟踪探针、是否有其他执行任务；防止冲突/覆盖。读取 GitHub 当前 Approved 与 Candidate/Open 的分层，保留旧官网和旧 Issuer 文件。
3. 只读核对 DEV-03/04 已有资产/权益/钱包/文件版本模型与路由；优先复用，不重建多套业务主账和独立多导航。
4. 如果本地业务模型无法支持已批准 Draft/同一权益容量/文件固定版本，先报告差距与**最小开发方案**；不能为了演示支付闭环虚构生产后台或替用户做新的合规决定。
5. 真实代码实现需用户另行**明确授权 DEV-05A/B**；后续 Build/Test/Browser 以 T01～T36 中适用范围为准，生产项独立 BLOCKED。

## 四A、后续收到的 DEV-03/04 独立审计结果（2026-11-08）
> 本节记录在本文件原始文档审计之后收到的本地源码独立验收结果；不改变本文件原有文档审计结论，也不新增产品规则。
- 用户提供的 DEV-03/04 独立 Audit Only 报告：本地审计基线 HEAD `39e200c7df40647eed66eb579b4cc7e164e28acd`；未发现 P0；发现 P1：Asset 权属文件换版、Asset 再次 Ready 后，Instrument 仍固定引用旧版本却继续显示 Ready 并开放发行管理入口，未重新复核。
- P2：无效 Token 份数仍显示在理论可发行结果卡；四种 Asset 模板/三种 Instrument 类型的 Ready 覆盖证据不足；生产服务端隔离/并发等未运行。
- **DEV-05 当前不得启动**。须先完成 [DEV-03/04 P1 修复与复验](R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md)，并收口 P2/证据覆盖，再由用户判定 DEV-03/04 阶段验收并独立授权 DEV-05A/B。

## 五、审计交付与版本保护
- 本次只进行 GitHub **文档审计与候选测试用例修正**，未访问 Windows 本地源码、未运行 Build/Test/Browser、未修改源代码、没有真实资金/合约操作。
- **审计结论：Offering 资料准备 + 内部预览 + 隔离 Mock 的前端实现可在前置门完成后进入 DEV-05；生产链上执行 NO-GO。**
- PR #8 Draft/Open/Unmerged，不改旧 Master、Frozen、193 项归属、DEC/SCOPE、根 README 或 PR #6。
