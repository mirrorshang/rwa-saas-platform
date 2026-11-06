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
- [DELIVERY-AND-ACCEPTANCE.md](DELIVERY-AND-ACCEPTANCE.md)：开发分层、技术门、测试矩阵、交付顺序。
- [MOCK-CONTROL-CONSOLE-UI-SPEC.md](MOCK-CONTROL-CONSOLE-UI-SPEC.md)：R2 独立 Mock 控制台，M01～M12 全部批准。
- [SUPERSEDED-RULES-AND-CODE-GAPS.md](SUPERSEDED-RULES-AND-CODE-GAPS.md)：明确废止旧规则、远端源码抽样证据、仍需 Codex 本地详审的未知项。

- **Instrument MVP 最新收敛规则**：单 Asset 最多一项当前有效权益结构，可有多期 Offering 共享其容量；三种类型只可选择其一，多权益结构推迟 V2.0（不改历史版本主表）。

## 适用约束
- V1 中文 UI；V2 多语言及法域语言/资料适配；V1 账号仅一个 Tenant、一个账户操作，无团队角色配置。
- **Free 是真实业务准备版**：完成 KYB 后可保存正式 Asset、权益结构和 Offering 方案，内部只读预览投资者门户；不允许发布真实发行、部署/Mint、公开上架、配置/生成投资者门户、认购募资、Token 持仓或收益运营。**Standard 是真实发行/运营版**，仅在满足独立生产准入后开放相应业务；白标/API 的 Standard 交付范围仍待决策。
- 企业 KYB 审核通过后自动分配的 MPC 钱包必须是真实有效钱包（仅独立测试环境可由 Mock 控制台生成模拟地址，不属于 Free 订阅权益）。
- Free/Standard 钱包管理能力相同；真实钱包存在不代表 Free 可进行真实募资。Free 业务资料升级 Standard 后保留但不自动发布；Standard 降级 Free 的历史业务依 U01 七天宽限、降级只读和投资者存续保障规则处理，**不等同新开通的可编辑 Free**。
- V1 业务金额 UI 使用 U（按 USDT）；投资者付款仅 OP Mainnet USDT；SaaS 订阅可用 USDT 或法币，渠道和实际结算待准入。
- U02 已决定「资产与发行」保留资产管理、认购记录、锁仓记录三个二级菜单，资产详情采用四 TAB，Offering 含发行前检查与最终投资者端预览；其他具体字段与状态仍待审核。旧四份 Frozen、193 项历史版本归属及 PR #6 不在本次变更范围。新 R2 决策优先适用于冲突的现行产品需求，不篡改历史。

- **KYB 修订边界**：旧 DEV-02A/B 已开发的五步表单须以后续独立开发任务调整；本次更新仅为产品文档，未代表本地代码更新或真实 KYB 验证准入。

## 合并/实施关口
当前只允许审查文档。正式合并该 Draft PR、修改生产或演示代码、外部真实支付/钱包集成及发布均需用户单独授权。不同分支可能存在更新；正式开发前必须核实真实工作分支和未提交改动，禁止基于旧快照覆盖。
