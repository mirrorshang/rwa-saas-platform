# R2 当前有效产品基线索引（Draft PR 待合并）
> 2026-11-06｜RWA SaaS｜U01 产品决策已获用户逐批批准；2026-11-06 Free/Standard 功能边界经用户最新确认并覆盖旧 Free 完整模拟发行定义；文档为新设计权威候选基线，不代表代码或生产服务已实现。分支 docs/r2-current-product-baseline；未经用户单独批准不合并、不开发生产代码。

## 读取顺序及优先级
1. 当前最新已批准的 R2 产品决策（U01 企业KYB五步与动态规则以 [U01-KYB-V03-APPROVED-2026-11-06.md](U01-KYB-V03-APPROVED-2026-11-06.md) 和 U01 PRD 的 B01～B08 **v0.3** 为准，覆盖旧五步字段版本；U02 资产与发行结构采用 [U02-02 批准记录](U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md)，资产分类与五步创建向导采用 [U02-03 批准记录](U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md)；[U01-UI-Ready-PRD.md](U01-UI-Ready-PRD.md) 的 E09 最新套餐能力矩阵与 [U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md) 优先于同目录或历史文件中的旧 Free 完整模拟闭环表述）。
2. 本目录 DELIVERY-AND-ACCEPTANCE.md 开发任务和验收；SUPERSEDED-RULES-AND-CODE-GAPS.md 旧规则废止与证据。
3. 旧 Master PRD 与历史 DEC、Frozen：仅在未被 R2 明确覆盖且不冲突时引用；历史仍保留原始事实，不静默重写。
4. 旧代码与 Mock 仅是现状证据，不是需求权威。法定合规、安全控制、Provider/Signer/资金/链上生产准入门从不因产品规则覆盖而免除。

## 交付范围
- [U01-UI-Ready-PRD.md](U01-UI-Ready-PRD.md)：A 邮箱登录、B 企业入驻/KYB、C 未认证工作台、D 企业钱包、E 订阅及 E09 最新 Free/Standard 权益矩阵；页面字段、流程、状态、校验、提示、异常。
- [U01-KYB-V03-APPROVED-2026-11-06.md](U01-KYB-V03-APPROVED-2026-11-06.md)：**R01～R10 均批准**：新版五步 KYB、UBO 控制路径、授权代表、动态文件要求和旧草稿/已提交版本保留；正式 UI 以 U01 B01～B08 v0.3 为准。
- [U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md)：最新用户确认的套餐权限变更决策与待定项，供 U02 流程/导航设计引用。
- [U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md](U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md)：**U02-02 R01～R08 全部批准**：集中式资产管理、三二级导航、资产四 TAB、Offering 内嵌发行准备、投资者端预览与 Free 发布升级拦截；资产字段/模板/Offering 细项留待 U02 后续审核。
- [U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md](U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md)：**U02-03 R01～R20 已批准**：8 大类 / 24 子类、五步创建、三级字段继承；六类房地产子模板及实际开放范围仍待审核。
- [U02-03-REAL-ESTATE-COMMON-FIELDS-UI-READY-APPROVED-2026-11-06.md](U02-03-REAL-ESTATE-COMMON-FIELDS-UI-READY-APPROVED-2026-11-06.md)：**R15～R20 房地产公共字段详情**、控件、必填与草稿/Ready 门槛、固定必需文件逐行上传和其他文件按需添加、第五步检查与预览。
- [U02-04-REAL-ESTATE-SUBTYPES-APPROVED-2026-11-06.md](U02-04-REAL-ESTATE-SUBTYPES-APPROVED-2026-11-06.md)：**U02-04 R21～R27 全部批准**：六个房地产子类精简字段，首批四个模板（住宅、写字楼、商铺、工业园／仓储物流）；酒店、土地暂缓。
- [U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md](U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md)：**U02-04 R28～R33 全部批准**：五步向导与资产创建的 UI-Ready 规范，涵盖开放类别、草稿保存/恢复、Draft 换类保护、Ready 完整性校验、文件上传/异常/历史、四 TAB 下一步及最低验收矩阵；并不授权开发或真实生产执行。
- [U02-04-ASSET-FILE-REFERENCE-CLOSEOUT-APPROVED-2026-11-06.md](U02-04-ASSET-FILE-REFERENCE-CLOSEOUT-APPROVED-2026-11-06.md)：**资产字段对比最终收口**：授权/委托关系文件可按需添加、Asset 文书在 Instrument/Offering 内固定版本引用；未授权新通用必需文件或自动法律批准。
- [U02-05-INSTRUMENT-FOUNDATION-APPROVED-2026-11-06.md](U02-05-INSTRUMENT-FOUNDATION-APPROVED-2026-11-06.md)：**U02-05 R01～R06 全部批准，R01/R03/R05 后续正式修订**：Asset 详情「权益结构」TAB，**MVP 一项 Asset 最多一项有效 Instrument、三类权益三选一、允许多期 Offering，共享同一权益容量**；**权益结构改用单页面三区域、用户填写权益总量＋Token 份数，系统计算每份权益**；Asset 文件固定版本引用；多 Instrument/混合分层推迟 V2.0，技术精度/真实生产准入仍待审。
- [U02-05-INSTRUMENT-FIELD-GROUPS-APPROVED-2026-11-06.md](U02-05-INSTRUMENT-FIELD-GROUPS-APPROVED-2026-11-06.md)：**U02-05 R07～R12 全部 A（字段组级 Approved）**：公共与三类专属字段、后台授权容量/Token 映射、资产文件固定版本引用；**后续 R13～R18 已批准基础字段条件、核心文件与计算交互**，只有生产精度/额外法定证明/复杂版本状态仍待审。
- [U02-05-INSTRUMENT-SINGLE-PAGE-AUTO-SPLIT-APPROVED-2026-11-07.md](U02-05-INSTRUMENT-SINGLE-PAGE-AUTO-SPLIT-APPROVED-2026-11-07.md)：**2026-11-07 用户批准的最新 Instrument UX**：覆盖原 R03 四步向导为单页三区域；R05/R11 保留后台容量，用户只填总权益规模＋Token 拆分份数，系统算每份权益；**后续 R13～R18 已确认字段与基本校验，生产级精度/额外法定证明/版本规则仍 Draft**。
- [U02-05-INSTRUMENT-FIELDS-R13-R18-APPROVED-2026-11-07.md](U02-05-INSTRUMENT-FIELDS-R13-R18-APPROVED-2026-11-07.md)：**U02-05 R13～R18 全部 A**：公共/三类型字段 Ready 条件、Token 总份数与自动每份权益计算、无可批准精度时拒绝静默取整、三类核心权益法律文件、Draft/资料已完备与 Offering 历史权利保护。
- [U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md](U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md)：单页三区域 UI-Ready 字段/控件、状态、文件版本引用、错误文案、权限及 **T01～T20 待执行测试矩阵**；类型切换/版本迁移/Token 技术精度等例外仍 Candidate/Open；**可进入 U02-06 Offering 产品设计，不代表代码或生产就绪**。
- [U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md](U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md)：**U02-06 R01～R06 全部 Approved（USDable Offering 实测对照后修订）**：资产/权益确定版本自动关联，单页分区编辑，本期数量×单价 U 自动计算募集上限，最低认购与时间、基础投资者准入及锁仓、OP Mainnet USDT 投资者支付范围、发行前预览与受控发布。**此处为第一批历史批准口径**；后续 R13～R36 已确认单期开放互斥、企业结算钱包和 UI 状态原则；真实资金/合约/分账生产执行仍 Open，Codex DEV-03/04 不包含 Offering 开发。
- [U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md](U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md)：**U02-06 R07～R12 用户全部 A**：发行名自动建议/简介、Token 数量与单价 U/单笔最低认购额及自动募集上限、含时区认购起止及未来开售状态、个人/机构/地区/KYC 基础准入、不锁仓或固定天数、只读 OP Mainnet USDT 支付配置；**后续 R13～R18 已获批基础容量/状态及企业收款账户规则；实际合约付款/Mint/分账、技术精度、退款及完整状态机仍 Open，暂不开发 Offering**。
- [U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md](U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md)：**R13～R18 全部 Approved（含用户收款钱包补充）**：同一 Instrument 同时最多一轮开放认购、发布时预留份额、完成分配转已发行、关闭释放无待处理义务的未分配预留、支付与 Token 配售分层、等待开始/在售/暂停/结束/关闭状态、资料/协议及投资者最终预览；企业在 Offering 中选择已绑定 MPC 或自连接钱包作为**最终结算收款账户**。投资者向认购合约支付→Mint/交付→资金分账是**优先研究候选（非生产批准）**；收款/退款/费用/Provider/Signer/DvP 精确路径仍 Open，注意 2026-09 OP USDT 合约迁移核验风险。
- [U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md](U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md)：**U02-06 R19～R24 全部 A**：投资者按 Token 份数创建唯一认购订单、OP Mainnet USDT 支付、优先可审查的同链原子 DvP / 备选受控收款与后续交付、支付和 Token 均确认后才显示认购完成、向发布时锁定的企业收款钱包结算、失败/退款恢复及订单/资金/Token 对账；本期额度不重复扣减。**具体合约、生产钱包/资金控制、费率、技术实现及状态机细节继续 Open**，未授权 Codex 开发 Offering。
- [U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md](U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md)：**U02-06 R25～R30 全部 A**：发行草稿/待开始/认购中/暂停/结束/关闭的业务状态区分、暂停恢复和到期/受控关闭、发售前资产/权益/本期参数/文件/钱包/投资者准入检查、业务资料与生产准入分层、实时投资者预览和发布前确认、发布关键配置/文件及企业收款钱包固定快照与受控变更；**完整字段级 UI-Ready、全状态迁移、实际付款/Token/法律生产门未批准**，Offering 尚未授权 Codex 实现。
- [U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md](U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md)：**U02-06 R31～R36 用户全部 A**：Offering 单页三区域、继承资产/权益与固定钱包选择、整数份数和金额/最低认购换算、两层发行准备检查、操作状态和二次确认、投资者端实际映射预览、异常与真实浏览器验收原则。**R01～R36 产品规则累计全部 Approved**。
- [U02-06-OFFERING-UI-READY-PRD-2026-11-08.md](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)：**字段级 UI-Ready 交接候选**，具体控件、Draft/检查条件、按钮文案、文件固定引用、权限矩阵；上游 Approved 与新增 Candidate/Open 明确分离，未声明完整细节已审批或实现。
- [U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md](U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md)：**状态/订单/资金/Token/容量与异常交接候选**，包含迁移前置守卫、份额不变量、关停与退款在途保护；精确事件、合约资金权责及链上参数仍 Open。
- [U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md](U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md)：**DEV-05 T01～T36 待执行验收矩阵**，覆盖 Browser/Route/UX/权限/边界/Mock 支付异常及跨期容量；全部 NOT RUN，不代表已授权开始 DEV-05 或生产通过。
- [U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md](U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md)：**DEV-05 规格本身 CONDITIONAL GO（仅前端 Offering Draft/内部预览/隔离 Mock），真实发行/支付/Token NO-GO**。已校正 T02/T23；后续收到 DEV-03/04 独立 Audit Only 报告，发现文件换版后 Instrument Ready 未复核的 P1，故当前 DEV-05 被阻断，须先完成 P1 修复与独立复验。
- [U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md](U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md)：**用户 2026-11-08 选择 A 并正式批准：当前 Asset 的 Instrument 必须 Ready，才允许创建 Offering Draft**；无 Instrument/Draft/检查失败/文件待扫描或失败/Ready 失效均禁止新建，创建动作服务层复核并固定 InstrumentVersion。
- [R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md](R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md)：**DEV-03/04 独立审计 P1 修复交接**：Asset 权属文件换版后，固定引用旧版本的 Instrument 必须识别影响并重新复核 Ready；同时收口无效 Token 份数误导与关键验收证据覆盖。包含验收标准和完整 Codex 提示词，待执行/独立复验。
- [R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md](R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md)：**DEV-05 Codex 开发交接包已准备，但当前被 DEV-03/04 P1 阻断**，包含开发范围、A/B/C 单页、Free/Standard、Ready 前置门、T01～T36 验收与完整提示词。必须先完成 P1/P2 修复与独立复验、用户阶段验收及 DEV-05 明确授权后再发送；DEV-05A/B 未开始，DEV-05C 生产真实发行 NO-GO。
- [DELIVERY-AND-ACCEPTANCE.md](DELIVERY-AND-ACCEPTANCE.md)：开发分层、技术门、测试矩阵、交付顺序。
- [MOCK-CONTROL-CONSOLE-UI-SPEC.md](MOCK-CONTROL-CONSOLE-UI-SPEC.md)：R2 独立 Mock 控制台，M01～M12 全部批准。
- [SUPERSEDED-RULES-AND-CODE-GAPS.md](SUPERSEDED-RULES-AND-CODE-GAPS.md)：明确废止旧规则、远端源码抽样证据、仍需 Codex 本地详审的未知项。

- **Instrument MVP 最新收敛规则**：单 Asset 最多一项当前有效权益结构，可有多期 Offering 共享其容量；三种类型只可选择其一，多权益结构推迟 V2.0（不改历史版本主表）。

## 开发前现行门（2026-11-08）
- [DEV-05 规格审计](U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md) 已核对 R01～R36 批准原则及三个候选交接材料；已校正验收用例 T02/T23。**纯前端与隔离 Mock 原本可条件进入，但 DEV-03/04 独立审计现已发现未关闭 P1**，须先完成 [P1 修复与复验](R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md)，再确认本地最新 HEAD/未提交改动，并经用户独立授权 DEV-05 开发。
- 真实公开发行、资金/合约 USDT 支付、Mint/自动分账及生产 Investor Portal **NO-GO**；使用测试 Fixture 不能出示生产批准的虚假绿灯。

## DEV-03/04 与 DEV-05 当前交接门（2026-11-08）
- DEV-03/04 独立 Audit Only 已收到：无 P0，但发现 P1「Asset 文件换版后 Instrument Ready 未重新复核」；阶段验收暂不为 A。P2 数值误导与证据覆盖也需收口。
- [P1 修复交接](R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md)已准备；Codex 执行与独立复验完成前，不启动 DEV-05。
- 用户已批准 DEV-05-01：Instrument Ready 才能创建 Offering。DEV-05 交接包已准备，但必须等 DEV-03/04 P1/P2 修复复验、用户阶段验收及 DEV-05 明确授权后再开始。
- 真实链上发行、USDT 资金支付、合约部署/Mint、分账/退款、生产 KYC/Signer/Provider 继续 NO-GO。

## 适用约束
- V1 中文 UI；V2 多语言及法域语言/资料适配；V1 账号仅一个 Tenant、一个账户操作，无团队角色配置。
- **Free 是真实业务准备版**：完成 KYB 后可保存正式 Asset、权益结构和 Offering 方案，内部只读预览投资者门户；不允许发布真实发行、部署/Mint、公开上架、配置/生成投资者门户、认购募资、Token 持仓或收益运营。**Standard 是真实发行/运营版**，仅在满足独立生产准入后开放相应业务；白标/API 的 Standard 交付范围仍待决策。
- 企业 KYB 审核通过后自动分配的 MPC 钱包必须是真实有效钱包（仅独立测试环境可由 Mock 控制台生成模拟地址，不属于 Free 订阅权益）。
- Free/Standard 钱包管理能力相同；真实钱包存在不代表 Free 可进行真实募资。Free 业务资料升级 Standard 后保留但不自动发布；Standard 降级 Free 的历史业务依 U01 七天宽限、降级只读和投资者存续保障规则处理，**不等同新开通的可编辑 Free**。
- V1 业务金额 UI 使用 U（按 USDT）；投资者付款仅 OP Mainnet USDT；SaaS 订阅可用 USDT 或法币，渠道和实际结算待准入。
- U02 已决定「资产与发行」保留资产管理、认购记录、锁仓记录三个二级菜单，资产详情采用四 TAB；**U02-06 Offering R01～R06 于 2026-11-07 获批基础字段、单页结构、投资者准入与预览/发布原则**，R07～R12 的基础字段和必要交互已于 2026-11-07 全部批准；**R13～R18 的基础生命周期、开放认购互斥、预留与有条件释放、企业收款钱包绑定、披露及预览已于 2026-11-07 获批**；**R19～R24 于 2026-11-07 已获批认购/USDT 付款、Token 交付、企业结算、失败退款、容量和资金/订单/Token 对账的产品规则与 DvP 优先方向**；**R25～R30 于 2026-11-07 已获批基础状态生命周期、发行准备检查、投资者预览及发布快照变更保护**；**R31～R36 于 2026-11-08 已全部批准单页字段分区、基础校验、两层准备检查、预览、操作及异常验收原则**。字段级 UI-Ready、状态异常表和 T01～T36 验收表已作为**候选交付材料**编制，新增细节尚未逐项批准或实际测试；具体资金合约、精度、法定/Provider/Signer 生产门继续 Open。旧四份 Frozen、193 项历史版本归属及 PR #6 不在本次变更范围。新 R2 决策优先适用于冲突的现行产品需求，不篡改历史。

- **KYB 修订边界**：旧 DEV-02A/B 已开发的五步表单须以后续独立开发任务调整；本次更新仅为产品文档，未代表本地代码更新或真实 KYB 验证准入。

## 合并/实施关口
当前只允许审查文档。正式合并该 Draft PR、修改生产或演示代码、外部真实支付/钱包集成及发布均需用户单独授权。不同分支可能存在更新；正式开发前必须核实真实工作分支和未提交改动，禁止基于旧快照覆盖。
