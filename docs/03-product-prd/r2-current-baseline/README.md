# R2 当前有效产品基线索引（Draft PR 待合并）
> 2026-11-11｜RWA SaaS｜本目录维护 R2 最新产品决策、模块产品设计、页面流程字段与 UI 设计依据。历史开发交接和验收记录仅供背景追溯，不作为当前产品设计任务。分支 docs/r2-current-product-baseline；PR #8 保持 Draft / Open / Unmerged，未经用户单独批准不合并。

## 统一产品总入口（2026-11-10）

**[《RWA SaaS 产品总体架构与产品设计基线》](RWA-SaaS-PRODUCT-ARCHITECTURE-AND-DELIVERY-BASELINE-2026-11-09.md)** 是当前产品架构与产品/UI 工作的统一入口；[《V1 产品完整性收口与产品/UI 设计现状审计》](RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md) 记录当前范围、官网/U01/U02 审计结论和待完成设计。V1 157 项范围已批准，但不代表所有模块已完成规划、页面字段设计或 UI。USDable 参考功能取舍以 DEC-058 为准；预期年化信息披露与债权周期付息的 V1 范围以 DEC-059 为准，权益结构具体字段和 UI 规则以 DEC-071/U02-08 为准；投资者统一 KYC 与企业端脱敏管理以 DEC-069 为准；资产列表、资产相关方和房地产四模板控件 UI-Ready 以 DEC-070/U02-07 为准；Offering 模块完整 UI-Ready 以 DEC-072/U02-09 为准；认购记录只读查询视图以 DEC-073/U02-10 为准；投资者管理模块 UI-Ready 以 DEC-074/U02-11 为准；认购订单模块 UI-Ready 以 DEC-075/U02-12 为准；配售与持有人 UI-Ready 以 DEC-076/U02-13 为准；资金与结算 UI-Ready 以 DEC-077/U02-14 为准；Token 管理 UI-Ready 以 DEC-078 及 Token 管理 UI-Ready 最终规格为准。新对话/新任务优先读取这两份文件；专项文件继续作为已批准业务规则权威来源，不覆盖历史 DEC、Frozen 与 193 项主表。

## V1.0 最新批准范围（截至 2026-11-11）

- **V1 产品范围已由 DEC-057 批准为五端：W 官网、I Issuer SaaS、V Issuer 独立投资者门户、M 平台统一投资端、P 平台运营后台；X 为外部责任主体泳道。**
- M 统一投资端是跨 Issuer 的一级发行聚合与分发，不是二级交易市场。M23/M24 共 11 项已正式纳入 V1；Issuer 按 Offering 自愿申请上架，P 独立审核，M/V 共享唯一订单、支付、配售、法定登记、Token 和收益主账。
- 当前有效功能追踪为 **204 项：V1.0 157 项（原 146 + M23/M24 新增 11）、V2.0 22 项、V3.0 20 项、TBD 5 项**。DEC-017 原 193 项主表及历史版号不改写；M23/M24 以 DEC-057 追加。
- 五端页面组 IA 为 125 组（官网 14、Issuer 工作台 63、统一投资端 16、Issuer 投资者门户 15、平台运营后台 17）；页面组纳入 V1 范围不代表模块规划、页面/字段设计或 UI 完成。
- [DEC-057｜V1 五端完整范围与 M23/M24 新增功能批准](../../../decisions/DEC-057-v1-five-surface-scope-and-unified-marketplace-approved.md)
- [DEC-058｜USDable 功能参考审计后的 V1 功能取舍与详细设计批准](../../../decisions/DEC-058-usdable-feature-reference-v1-scope-approved.md)
- [DEC-059｜预期年化信息披露与债权周期付息纳入 V1（范围批准）](../../../decisions/DEC-059-expected-annualized-range-and-periodic-debt-coupon-v1-approved.md)
- [DEC-060｜官网 V1 内容、入口与用户流程对齐（W-V1-R01～R06 全部 A）](../../../decisions/DEC-060-website-v1-content-and-entry-flow-alignment-approved.md)
- [DEC-061｜W-01～W-06 页面内容与交互收口（W-UI-R07～R12 全部 A）](../../../decisions/DEC-061-website-w01-w06-ui-content-and-interaction-approved.md)
- [DEC-062｜企业注册入口并入统一邮箱登录](../../../decisions/DEC-062-website-registration-entry-unified-with-email-login-approved.md)
- [DEC-063｜历史注册/邮箱验证链接直接进入统一登录，不展示迁移说明](../../../decisions/DEC-063-legacy-registration-and-email-verification-links-direct-to-unified-login-approved.md)
- [DEC-064｜企业邮箱验证码登录页面设计批准](../../../decisions/DEC-064-enterprise-email-login-page-approved.md)
- [DEC-065｜登录后企业创建与 KYB 引导页面批准](../../../decisions/DEC-065-enterprise-onboarding-and-kyb-entry-guidance-approved.md)
- [DEC-066｜五步企业认证页面字段与交互批准](../../../decisions/DEC-066-enterprise-kyb-five-step-ui-fields-and-interactions-approved.md)
- [DEC-067｜待补件与未通过统一载入原资料、编辑并重新提交](../../../decisions/DEC-067-kyb-supplement-and-rejected-states-share-one-edit-and-resubmit-flow-approved.md)
- [DEC-068｜企业钱包管理页面结构与核心业务规则批准](../../../decisions/DEC-068-enterprise-wallet-management-ui-and-business-rules-approved.md)
- [DEC-069｜投资者统一 KYC、Issuer 脱敏管理与 V1 资格流程简化](../../../decisions/DEC-069-investor-kyc-centralization-and-issuer-masked-view-v1-approved.md)
- [DEC-070｜资产管理列表、资产相关方与房地产模板控件 UI-Ready 收口](../../../decisions/DEC-070-asset-management-related-parties-ui-ready-v1-approved.md)
- [DEC-071｜V1 权益结构单页 UI-Ready 详细规则收口](../../../decisions/DEC-071-instrument-ui-ready-v1-approved.md)
- [DEC-072｜V1 Offering 发行方案模块 UI-Ready 收口](../../../decisions/DEC-072-offering-module-ui-ready-v1-closeout-approved.md)
- [DEC-073｜V1 认购记录与认购订单入口分工及 UI-Ready 收口](../../../decisions/DEC-073-subscription-records-read-only-view-v1-approved.md)
- [DEC-074｜V1 投资者管理模块 UI-Ready 收口](../../../decisions/DEC-074-investor-management-ui-ready-v1-closeout-approved.md)
- [DEC-075｜V1 认购订单模块 UI-Ready 收口](../../../decisions/DEC-075-subscription-orders-ui-ready-v1-closeout-approved.md)
- [DEC-076｜配售与持有人 UI-Ready 收口](../../../decisions/DEC-076-allocation-and-holders-ui-ready-v1-closeout-approved.md)
- [DEC-077｜资金与结算 UI-Ready 收口](../../../decisions/DEC-077-funds-and-settlement-ui-ready-v1-closeout-approved.md)
- [DEC-078｜Token 管理 UI-Ready 收口](../../../decisions/DEC-078-token-management-ui-ready-v1-closeout-approved.md)
- [U02-07｜资产列表、相关方与房地产模板控件 UI-Ready](U02-07-ASSET-RELATED-PARTIES-AND-LIST-UI-READY-2026-11-11.md)
- [USDable V1 功能采纳与模块产品设计补充](USDABLE-V1-FUNCTION-ADOPTION-AND-UI-READY-ADDENDUM-2026-11-09.md)
- [V1 产品完整性收口与产品/UI 设计现状审计](RWA-SaaS-V1-PRODUCT-COMPLETENESS-AND-UI-DESIGN-STATUS-2026-11-09.md)
- [V1.0 产品基线与 157 项功能清单](RWA-SaaS-V1-PRODUCT-BASELINE-AND-FUNCTION-SCOPE-2026-11-09.md)
- [USDable 整体产品功能差距审计（排除二级交易）](../RWA-SaaS-USDABLE-COMPETITIVE-GAP-ANALYSIS-2026-11-09.md)

## 官网 V1 内容与流程设计（2026-11-10）

- [DEC-060｜官网 V1 内容、入口与用户流程对齐](../../../decisions/DEC-060-website-v1-content-and-entry-flow-alignment-approved.md)：W-V1-R01～R06 **全部 A，6/6 Approved，B=0**。
- [DEC-061｜W-01～W-06 页面内容与交互收口批准](../../../decisions/DEC-061-website-w01-w06-ui-content-and-interaction-approved.md)：W-UI-R07～R12 **全部 A，6/6 Approved，B=0**。
- [W-01～W-14 官网 V1 内容、CTA 与跨端入口对齐方案](W-01-W-14-V1-CONTENT-AND-ENTRY-FLOW-ALIGNMENT-2026-11-10.md)：全站范围和主流程 Approved；具体页面状态见 DEC-060/061 与页面规格。
- [W-01～W-06 页面内容与交互规格](W-01-W-06-V1-UI-CONTENT-AND-INTERACTION-SPEC-2026-11-10.md)：第一批页面内容结构与核心交互 Approved；最终视觉稿、响应式和实现验收待后续收口。
- [W-07～W-14 与 M 统一投资端介绍页面规格](W-07-W-14-AND-M-V1-UI-CONTENT-INTERACTION-SPEC-2026-11-10.md)：第二批页面级 Candidate；**W-08/W-09 历史入口已由 DEC-062/063 批准直接进入统一邮箱登录，不再显示独立说明页；W-10 邮箱登录页已由 DEC-064 批准，W-11 企业创建/KYB 引导页已由 DEC-065 批准；五步 KYB 字段及页面交互已由 DEC-066 批准；待补件与未通过统一载入完整原提交资料、允许任意字段编辑并重新提交，按 DEC-067 执行；详细规则以 U01 v0.3 为准；W-07、W-13、W-14 与 M 介绍页仍逐页待审核，W-12 历史入口兼容待审核。
- **用户确认的产品/UI 顺序**：先功能范围和流程、再模块与页面/字段/状态、最后 UI；V1 简化、易用，不将技术开发作为本阶段工作。

## 读取顺序及优先级
1. 当前最新已批准的 R2 产品决策（V1 五端范围及 M23/M24 新增 11 项以 DEC-057 为准；USDable 参考功能采纳/后置/排除以 DEC-058 为准；预期年化信息披露与债权周期付息的具体字段规则以 DEC-071/U02-08 为准；Offering 页面与字段规则以 DEC-072/U02-09 为准；投资者统一 KYC、Issuer 脱敏管理及 V1 资格流程简化以 DEC-069 为准；资产管理列表、资产相关方、房地产模板控件及 Offering 级相关方披露以 DEC-070/U02-07 为准；U01 企业 KYB 五步与动态规则以 [U01-KYB-V03-APPROVED-2026-11-06.md](U01-KYB-V03-APPROVED-2026-11-06.md) 和 U01 PRD 的 B01～B08 **v0.3** 为准，覆盖旧五步字段版本；企业钱包管理页面结构及五项核心规则以 DEC-068 和 U01 PRD 的 D 企业钱包章节为准；U02 资产与发行结构采用 [U02-02 批准记录](U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md)，资产分类与五步创建向导采用 [U02-03 批准记录](U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md)；[U01-UI-Ready-PRD.md](U01-UI-Ready-PRD.md) 的 E09 最新套餐能力矩阵与 [U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md) 优先于同目录或历史文件中的旧 Free 完整模拟闭环表述）。
2. 本轮产品工作优先读取《V1 产品完整性收口与产品/UI 设计现状审计》及对应 U01/U02 专项文件；不把历史开发交接或验收文档当作产品需求。
3. 旧 Master PRD 与历史 DEC、Frozen：仅在未被 R2 明确覆盖且不冲突时引用；历史仍保留原始事实，不静默重写。
4. 旧代码与 Mock 仅是现状证据，不是需求权威。法定合规、安全控制、Provider/Signer/资金/链上生产准入门从不因产品规则覆盖而免除。

## 交付范围
- [RWA-SaaS-V1-PRODUCT-BASELINE-AND-FUNCTION-SCOPE-2026-11-09.md](RWA-SaaS-V1-PRODUCT-BASELINE-AND-FUNCTION-SCOPE-2026-11-09.md)：V1 五端完整产品范围与 157 项 V1 功能清单；整体产品设计尚未完成。
- [../RWA-SaaS-USDABLE-COMPETITIVE-GAP-ANALYSIS-2026-11-09.md](../RWA-SaaS-USDABLE-COMPETITIVE-GAP-ANALYSIS-2026-11-09.md)：基于 2026-11-05 原始 USDable 审计报告更新的整体功能目录、V1 采纳项和版本取舍；功能对照已完成，不重复进行竞品对照。
- [USDABLE-V1-FUNCTION-ADOPTION-AND-UI-READY-ADDENDUM-2026-11-09.md](USDABLE-V1-FUNCTION-ADOPTION-AND-UI-READY-ADDENDUM-2026-11-09.md)：M04 资产相关方、M12 持有人管理、M13 收益上报和清退/兑付的模块产品设计补充；M04 资产相关方字段与页面细节以 DEC-070/U02-07 为准；Instrument 预期年化和债权周期付息字段/规则已按 DEC-071/U02-08 收口。
- [U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md](U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md)：权益结构历史详细设计稿，保留原 Candidate 形成过程；当前执行细则以 [DEC-071](../../../decisions/DEC-071-instrument-ui-ready-v1-approved.md) 与 [U02-08](U02-08-INSTRUMENT-UI-READY-CLOSEOUT-2026-11-11.md) 为准。
- [U01-UI-Ready-PRD.md](U01-UI-Ready-PRD.md)：A 邮箱登录、B 企业入驻/KYB、C 未认证工作台、D 企业钱包（五项核心规则已由 DEC-068 批准）、E 订阅及 E09 最新 Free/Standard 权益矩阵；页面字段、流程、状态、校验、提示、异常。
- [U01-KYB-V03-APPROVED-2026-11-06.md](U01-KYB-V03-APPROVED-2026-11-06.md)：**R01～R10 均批准**：新版五步 KYB、UBO 控制路径、授权代表、动态文件要求和旧草稿/已提交版本保留；正式 UI 以 U01 B01～B08 v0.3 为准。
- [U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md](U01-FREE-STANDARD-ENTITLEMENT-DEC-2026-11-06.md)：最新用户确认的套餐权限变更决策与待定项，供 U02 流程/导航设计引用。
- [U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md](U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md)：**U02-02 R01～R08 全部批准**：集中式资产管理、三二级导航、资产四 TAB、Offering 内嵌发行准备、投资者端预览与 Free 发布升级拦截；后续 U02-07 已补齐资产列表、相关方与房地产模板控件的 UI-Ready 细节。
- [U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md](U02-03-ASSET-CLASSIFICATION-APPROVED-2026-11-06.md)：**U02-03 R01～R20 已批准**：8 大类 / 24 子类、五步创建、三级字段继承；房地产六类子模板和首批开放范围以后续 U02-04 批准文件为准。
- [U02-03-REAL-ESTATE-COMMON-FIELDS-UI-READY-APPROVED-2026-11-06.md](U02-03-REAL-ESTATE-COMMON-FIELDS-UI-READY-APPROVED-2026-11-06.md)：**R15～R20 房地产公共字段详情**、控件、必填与草稿/Ready 门槛、固定必需文件逐行上传和其他文件按需添加、第五步检查与预览。
- [U02-04-REAL-ESTATE-SUBTYPES-APPROVED-2026-11-06.md](U02-04-REAL-ESTATE-SUBTYPES-APPROVED-2026-11-06.md)：**U02-04 R21～R27 全部批准**：六个房地产子类精简字段，首批四个模板（住宅、写字楼、商铺、工业园／仓储物流）；酒店、土地暂缓。
- [U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md](U02-04-REAL-ESTATE-UI-READY-APPROVED-2026-11-06.md)：**R28～R33 页面流程规则已批准**：五步向导、草稿/Ready、换类保护、文件交互、预览与下一步；房地产子类单位、精度和资产相关方细节已由 DEC-070/U02-07 后续收口。
- [U02-04-ASSET-FILE-REFERENCE-CLOSEOUT-APPROVED-2026-11-06.md](U02-04-ASSET-FILE-REFERENCE-CLOSEOUT-APPROVED-2026-11-06.md)：**资产字段对比最终收口**：授权/委托关系文件可按需添加、Asset 文书在 Instrument/Offering 内固定版本引用；未授权新通用必需文件或自动法律批准。
- [U02-05-INSTRUMENT-FOUNDATION-APPROVED-2026-11-06.md](U02-05-INSTRUMENT-FOUNDATION-APPROVED-2026-11-06.md)：**U02-05 R01～R06 全部批准，R01/R03/R05 后续正式修订**：Asset 详情「权益结构」TAB，**MVP 一项 Asset 最多一项有效 Instrument、三类权益三选一、允许多期 Offering，共享同一权益容量**；**权益结构改用单页面三区域、用户填写权益总量＋Token 份数，系统计算每份权益**；Asset 文件固定版本引用；多 Instrument/混合分层推迟 V2.0，技术精度/真实生产准入仍待审。
- [U02-05-INSTRUMENT-FIELD-GROUPS-APPROVED-2026-11-06.md](U02-05-INSTRUMENT-FIELD-GROUPS-APPROVED-2026-11-06.md)：**U02-05 R07～R12 全部 A（字段组级 Approved）**：公共与三类专属字段、后台授权容量/Token 映射、资产文件固定版本引用；**后续 R13～R18 已批准基础字段条件、核心文件与计算交互**，只有生产精度/额外法定证明/复杂版本状态仍待审。
- [U02-05-INSTRUMENT-SINGLE-PAGE-AUTO-SPLIT-APPROVED-2026-11-07.md](U02-05-INSTRUMENT-SINGLE-PAGE-AUTO-SPLIT-APPROVED-2026-11-07.md)：**2026-11-07 用户批准的最新 Instrument UX**：覆盖原 R03 四步向导为单页三区域；R05/R11 保留后台容量，用户只填总权益规模＋Token 拆分份数，系统算每份权益；**后续 R13～R18 已确认字段与基本校验，生产级精度/额外法定证明/版本规则仍 Draft**。
- [U02-05-INSTRUMENT-FIELDS-R13-R18-APPROVED-2026-11-07.md](U02-05-INSTRUMENT-FIELDS-R13-R18-APPROVED-2026-11-07.md)：**U02-05 R13～R18 全部 A**：公共/三类型字段 Ready 条件、Token 总份数与自动每份权益计算、无可批准精度时拒绝静默取整、三类核心权益法律文件、Draft/资料已完备与 Offering 历史权利保护。
- [U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md](U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md)：历史细节稿；主体选择、收益参与期限、类型切换/版本保护、权益精度及 DEC-059 两项能力已由 DEC-071/U02-08 完成 V1 设计收口。
- [U02-08｜权益结构单页 UI-Ready 最终细化规格](U02-08-INSTRUMENT-UI-READY-CLOSEOUT-2026-11-11.md)：当前 V1 权益结构唯一权威详细设计，覆盖三类权益字段、主体选择、债权付息、预期年化披露、Token 精确拆分、文件、Ready 与版本保护。
- [U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md](U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md)：**U02-06 R01～R06 全部 Approved（USDable Offering 实测对照后修订）**：资产/权益确定版本自动关联，单页分区编辑，本期数量×单价 U 自动计算募集上限，最低认购与时间、历史初始投资者准入（后续由 DEC-069 收敛为平台统一 KYC）及锁仓、OP Mainnet USDT 投资者支付范围、发行前预览与受控发布。**此处为第一批历史批准口径**；后续 R13～R36 已确认单期开放互斥、企业结算钱包和 UI 状态原则；真实资金/合约/分账生产执行仍 Open，Codex DEV-03/04 不包含 Offering 开发。
- [U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md](U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md)：**U02-06 R07～R12 用户全部 A**：发行名自动建议/简介、Token 数量与单价 U/单笔最低认购额及自动募集上限、含时区认购起止及未来开售状态、历史初始投资者类型/地区/KYC 字段（后续已由 DEC-069 收敛为平台统一 KYC 固定规则，不提供 Issuer 配置）、不锁仓或固定天数、只读 OP Mainnet USDT 支付配置；**后续 R13～R18 已获批基础容量/状态及企业收款账户规则；实际合约付款/Mint/分账、技术精度、退款及完整状态机仍 Open，暂不开发 Offering**。
- [U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md](U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md)：**R13～R18 全部 Approved（含用户收款钱包补充）**：同一 Instrument 同时最多一轮开放认购、发布时预留份额、完成分配转已发行、关闭释放无待处理义务的未分配预留、支付与 Token 配售分层、等待开始/在售/暂停/结束/关闭状态、资料/协议及投资者最终预览；企业在 Offering 中选择已绑定 MPC 或自连接钱包作为**最终结算收款账户**。投资者向认购合约支付→Mint/交付→资金分账是**优先研究候选（非生产批准）**；收款/退款/费用/Provider/Signer/DvP 精确路径仍 Open，注意 2026-09 OP USDT 合约迁移核验风险。
- [U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md](U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md)：**U02-06 R19～R24 全部 A**：投资者按 Token 份数创建唯一认购订单、OP Mainnet USDT 支付、优先可审查的同链原子 DvP / 备选受控收款与后续交付、支付和 Token 均确认后才显示认购完成、向发布时锁定的企业收款钱包结算、失败/退款恢复及订单/资金/Token 对账；本期额度不重复扣减。**具体合约、生产钱包/资金控制、费率、技术实现及状态机细节继续 Open**，未授权 Codex 开发 Offering。
- [U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md](U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md)：**U02-06 R25～R30 全部 A**：发行草稿/待开始/认购中/暂停/结束/关闭的业务状态区分、暂停恢复和到期/受控关闭、发售前资产/权益/本期参数/文件/钱包/投资者准入检查、业务资料与生产准入分层、实时投资者预览和发布前确认、发布关键配置/文件及企业收款钱包固定快照与受控变更；**完整字段级 UI-Ready、全状态迁移、实际付款/Token/法律生产门未批准**，Offering 尚未授权 Codex 实现。
- [U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md](U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md)：**U02-06 R31～R36 用户全部 A**：Offering 单页三区域、继承资产/权益与固定钱包选择、整数份数和金额/最低认购换算、两层发行准备检查、操作状态和二次确认、投资者端实际映射预览、异常与真实浏览器验收原则。**R01～R36 产品规则累计全部 Approved**。
- [U02-06-OFFERING-UI-READY-PRD-2026-11-08.md](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)：历史字段级候选稿，保留 R01～R36 与 DEC-069/070 的形成过程；当前最终页面执行规格以 [DEC-072](../../../decisions/DEC-072-offering-module-ui-ready-v1-closeout-approved.md) / [U02-09](U02-09-OFFERING-MODULE-UI-READY-CLOSEOUT-2026-11-11.md) 为准。
- [U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md](U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md)：**历史状态/订单/资金/Token/容量与异常交接候选**，包含迁移前置守卫、份额不变量、关停与退款在途保护；当前 Offering 页面状态与用户操作以 U02-09 为准；精确事件、合约资金权责及链上参数仍 Open。
- [U02-09｜Offering 发行方案模块 UI-Ready 最终规格](U02-09-OFFERING-MODULE-UI-READY-CLOSEOUT-2026-11-11.md)：当前唯一权威执行规格，覆盖发行管理列表、创建/编辑单页、字段校验、两层准备检查、投资者端预览、最终发布确认、详情、生命周期、异常与跨模块关系。
- [U02-10｜认购记录页面 UI-Ready 最终规格](U02-10-SUBSCRIPTION-RECORDS-UI-READY-CLOSEOUT-2026-11-11.md)：已完成认购的跨资产只读历史视图；与投资者与认购下的全生命周期「认购订单」明确分工，复用同一订单主账。
- [U02-11｜投资者管理模块 UI-Ready 最终规格](U02-11-INVESTOR-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：本企业投资者关系脱敏只读视图，包含列表、详情、统一 KYC 状态、业务关联、授权隔离和异常处理。
- [U02-12｜认购订单模块 UI-Ready 最终规格](U02-12-SUBSCRIPTION-ORDERS-UI-READY-CLOSEOUT-2026-11-11.md)：覆盖订单列表、详情六分组、报价/签署/内部预留、付款/配售/登记/Token 独立状态、基础取消、到期、退款异常与跨模块责任。
- [U02-13｜配售与持有人 UI-Ready 最终规格](U02-13-ALLOCATION-AND-HOLDERS-UI-READY-CLOSEOUT-2026-11-11.md)：共享权益容量、合法基础配售、法定持有人登记三模式、精确 Token 映射对账、差异与受权限制申请的完整页面规格。
- [U02-14｜资金与结算 UI-Ready 最终规格](U02-14-FUNDS-AND-SETTLEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：收款方案、付款指令、到账最终性/订单对账、退款与异常、募集款受限/释放资格、受权划拨与真实到账核验。
- [Token 管理 UI-Ready 最终规格](TOKEN-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：Token 方案、合约部署申请、Mint/交付、限制与暂停、条件性 Burn、链上事件、配售/法定登记对账及异常处理。
- [U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md](U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md)：**DEV-05 T01～T36 待执行验收矩阵**，覆盖 Browser/Route/UX/权限/边界/Mock 支付异常及跨期容量；全部 NOT RUN，不代表已授权开始 DEV-05 或生产通过。
- [U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md](U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md)：**DEV-05 规格本身 CONDITIONAL GO（仅前端 Offering Draft/内部预览/隔离 Mock），真实发行/支付/Token NO-GO**。已校正 T02/T23；后续收到 DEV-03/04 独立 Audit Only 报告，发现文件换版后 Instrument Ready 未复核的 P1，故当前 DEV-05 被阻断，须先完成 P1 修复与独立复验。
- [U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md](U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md)：**用户 2026-11-08 选择 A 并正式批准：当前 Asset 的 Instrument 必须 Ready，才允许创建 Offering Draft**；无 Instrument/Draft/检查失败/文件待扫描或失败/Ready 失效均禁止新建，创建动作服务层复核并固定 InstrumentVersion。
- [R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md](R2-DEV03-04-P1-FILE-VERSION-READINESS-REMEDIATION-2026-11-08.md)：**DEV-03/04 独立审计 P1 修复交接**：Asset 权属文件换版后，固定引用旧版本的 Instrument 必须识别影响并重新复核 Ready；同时收口无效 Token 份数误导与关键验收证据覆盖。包含验收标准和完整 Codex 提示词，待执行/独立复验。
- [R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md](R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md)：**DEV-05A/B 已获用户明确授权启动**，包含 Offering 前端业务准备、单页 A/B/C、Free/Standard、Instrument Ready 前置门、内部投资者预览、隔离 Mock 与 T01～T36 验收。DEV-03/04 整体阶段验收仍非 A，但按用户决定不再作为本次 DEV-05A/B 的启动阻断；DEV-05C 真实生产发行/资金/Token 继续 NO-GO。
- [R2-DEV-05A-B-INDEPENDENT-AUDIT-HANDOFF-2026-11-09.md](R2-DEV-05A-B-INDEPENDENT-AUDIT-HANDOFF-2026-11-09.md)：**2026-11-09 DEV-05A/B 开发方报告已实现与自测（尚未独立复核、未验收 A）**：31 Chrome PASS/0 FAIL；T01～T36=25 PASS/11 BLOCKED；回归 40 PASS/1 BLOCKED。包含 11 项 BLOCKED 分类、核心风险源码/浏览器审计门、独立 GitHub 证据归档要求。产品源码仍本地未提交；**不得把自测通过记成阶段验收通过**。
- [DELIVERY-AND-ACCEPTANCE.md](DELIVERY-AND-ACCEPTANCE.md)：开发分层、技术门、测试矩阵、交付顺序。
- [MOCK-CONTROL-CONSOLE-UI-SPEC.md](MOCK-CONTROL-CONSOLE-UI-SPEC.md)：R2 独立 Mock 控制台，M01～M12 全部批准。
- [SUPERSEDED-RULES-AND-CODE-GAPS.md](SUPERSEDED-RULES-AND-CODE-GAPS.md)：明确废止旧规则、远端源码抽样证据、仍需 Codex 本地详审的未知项。

- **Instrument MVP 最新收敛规则**：单 Asset 最多一项当前有效权益结构，可有多期 Offering 共享其容量；三种类型只可选择其一，多权益结构推迟 V2.0（不改历史版本主表）。

## DEV-05A/B 开发报告（2026-11-09）
- Codex 报告 Offering 前端/内部预览/独立 Mock 已实现，TypeScript/ESLint/Build 及 Chrome 主用例自测通过；报告和本地证据均未在本次 GitHub 文档写入中直接核验。
- **当前状态：Reported Implemented / Independent Audit Pending / 未验收 A**。须先将本地 DEV-05 源码差异、测试脚本、原始结果和截图按 [独立审计交接](R2-DEV-05A-B-INDEPENDENT-AUDIT-HANDOFF-2026-11-09.md) 上传隔离审计分支，再由 ChatGPT 复核 25 PASS、11 BLOCKED 的真实范围。
- DEV-01～04 整体验收仍按用户决定暂缓；DEV-05C 生产支付、部署/Mint、资金分账与公开门户仍 NO-GO。

## DEV-05 当前执行门（2026-11-08）
- DEV-03/04 初始独立 Audit Only 发现的 P1 文件版本/Ready 联动与 P2 Token 输入展示问题，已修复并由 ChatGPT 对两个独立审计归档进行定向复核；编辑页 Ready 徽标一致性 follow-up 也已复核通过。相关审计证据见上方归档链接。
- **DEV-03/04 整体阶段验收仍未判 A**，U01～DEV-04 整体浏览器验收与用户人工验收暂缓。用户于 2026-11-08 明确决定跳过当前整体验收，直接启动 DEV-05A/B；这是开发顺序决定，不代表 DEV-03/04 阶段验收通过。
- [DEV-05 开发交接](R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md)已更新为当前授权版本：DEV-05A Offering 前端业务准备、内部投资者预览，以及 DEV-05B 隔离 Mock/Fixture 可以启动；执行前仍须核实本地真实分支/HEAD/未提交修改并保护原有探针文件。
- **DEV-05C 真实生产发行、OP Mainnet USDT 支付、合约部署/Mint、分账/退款、公开 Investor Portal、生产 KYC/Signer/Provider 继续 NO-GO**；DEV-05A/B 的 PASS 不等于生产准入。

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


## 资产管理 UI-Ready 收口（2026-11-11）

- [DEC-070｜资产管理列表、资产相关方与房地产模板控件 UI-Ready 收口](../../../decisions/DEC-070-asset-management-related-parties-ui-ready-v1-approved.md)：资产列表、资产概览唯一下一步、相关方角色/字段/文件/Ready/披露及四个开放房地产模板控件已完成产品设计收口。
- [U02-07｜资产列表、相关方与房地产模板控件 UI-Ready](U02-07-ASSET-RELATED-PARTIES-AND-LIST-UI-READY-2026-11-11.md)：当前资产管理列表与相关方 UI-Ready 权威细则。
- 资产相关方不新增导航；并入资产创建第三步「法律与估值」及资产详情「资产资料」。Offering 级披露按每期单独选择，并进入该期最终投资者预览。
- 本次仅表示产品/UI 规格完成，不代表代码实现、浏览器验收、产权/牌照核验或生产发行准入完成。



## 权益结构 UI-Ready 收口（2026-11-11）

- [DEC-071｜V1 权益结构单页 UI-Ready 详细规则收口](../../../decisions/DEC-071-instrument-ui-ready-v1-approved.md)：收敛三类权益字段、债权周期付息、预期年化披露、权益拆分精度、文件、Ready 与版本规则。
- [U02-08｜权益结构单页 UI-Ready 最终细化规格](U02-08-INSTRUMENT-UI-READY-CLOSEOUT-2026-11-11.md)：当前 UI-Ready 详细设计依据；资产详情四 TAB 和单页三区域不变。
- 资产管理、权益结构、Offering、认购记录、投资者管理和认购订单均已完成独立 UI-Ready 收口；下一模块进入「资金与结算」。
- 本次仅表示产品/UI 规格完成，不代表 Codex 开发、Build、浏览器验收或生产发行准入完成。


## Offering 发行方案 UI-Ready 收口（2026-11-11）

- [DEC-072｜V1 Offering 发行方案模块 UI-Ready 收口](../../../decisions/DEC-072-offering-module-ui-ready-v1-closeout-approved.md)：依据用户对列表方案 A 的明确批准及产品负责人独立完成 MVP 闭环的授权，收口 Offering 模块页面设计。
- [U02-09｜Offering 发行方案模块 UI-Ready 最终规格](U02-09-OFFERING-MODULE-UI-READY-CLOSEOUT-2026-11-11.md)：当前权威详细设计，覆盖列表、创建/编辑、发行准备、投资者预览、最终确认、详情与生命周期。
- Offering 模块产品/UI 规格已达到 UI-Ready；开发、Build、Browser、Route、真实支付/Mint 与生产准入仍独立。
- Offering 模块产品/UI 规格已达到 UI-Ready；认购记录与投资者管理随后完成独立收口，认购订单随后也已完成；当前下一模块进入「资金与结算」。



## 认购记录页面 UI-Ready 收口（2026-11-11）

- [DEC-073｜认购记录与认购订单入口分工](../../../decisions/DEC-073-subscription-records-read-only-view-v1-approved.md)：认购记录仅查询已完成认购；认购订单承载全生命周期。
- [U02-10｜认购记录页面 UI-Ready 最终规格](U02-10-SUBSCRIPTION-RECORDS-UI-READY-CLOSEOUT-2026-11-11.md)：覆盖列表、详情、脱敏信息、付款/Token/法定登记事实分离、导出、权限、空态与异常。
- 认购记录页面已达到 UI-Ready；认购订单工作台随后也按 DEC-075/U02-12 完成 UI-Ready；两者仍共用同一订单主账。
- 投资者管理与认购订单随后完成独立 UI-Ready 收口；当前下一模块为「资金与结算」。



## 投资者管理模块 UI-Ready 收口（2026-11-11）

- [DEC-074｜V1 投资者管理模块 UI-Ready 收口](../../../decisions/DEC-074-investor-management-ui-ready-v1-closeout-approved.md)：将投资者管理定位为本企业投资者关系的脱敏只读视图，执行 DEC-069 统一 KYC 和租户隔离规则。
- [U02-11｜投资者管理模块 UI-Ready 最终规格](U02-11-INVESTOR-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：覆盖投资者列表、详情、KYC 状态及历史、本企业认购/持有人关系、隐私授权、套餐、空态和异常。
- 企业端不承担人工 KYC 审核；投资者本人在投资者端完成 KYC、补件和重新核验。企业端只查看当前 Tenant 授权范围内的脱敏状态。
- 投资者管理模块产品/UI 规格已达到 UI-Ready；真实 Provider、法律合规、生产核验和源码开发仍独立。
- 认购订单全生命周期工作台随后已按 DEC-075/U02-12 收口；配售与持有人已按 DEC-076/U02-13 完成；当前下一模块：资金与结算。


## 认购订单模块 UI-Ready 收口（2026-11-11）

- [DEC-075｜V1 认购订单模块 UI-Ready 收口](../../../decisions/DEC-075-subscription-orders-ui-ready-v1-closeout-approved.md)：按用户授权收口 Issuer 全生命周期订单工作台，保留资金、容量、配售、法定登记和 Token 独立事实。
- [U02-12｜认购订单模块 UI-Ready 最终规格](U02-12-SUBSCRIPTION-ORDERS-UI-READY-CLOSEOUT-2026-11-11.md)：列表、详情、报价/签署、预留、真实付款、配售/登记/交付、取消/到期、退款异常、权限、空态与跨模块跳转。
- 订单模块已达到产品/UI 设计 UI-Ready；真实付款/退款、配售/法定登记、Token 执行及代码/浏览器验收未因此完成或获得授权。
- 配售与持有人、资金与结算完成 UI-Ready 后，Token 管理已按 DEC-078 完成 UI-Ready；当前下一项：**资产与发行 → 锁仓记录**。

## 配售与持有人 UI-Ready 收口（2026-11-11）

- [DEC-076｜配售与持有人 UI-Ready 收口](../../../decisions/DEC-076-allocation-and-holders-ui-ready-v1-closeout-approved.md)：在既有「投资者与认购 → 配售与持有人」内形成配售管理、持有人登记、差异与限制三个视图，不改变二级导航。
- [U02-13｜配售与持有人 UI-Ready 最终规格](U02-13-ALLOCATION-AND-HOLDERS-UI-READY-CLOSEOUT-2026-11-11.md)：容量与基础配售、登记结果/有权责任主体、持有人列表详情、非 1:1 Token 权益映射、法定与链对账、限制/解除复核、状态、弹窗、异常与权限。
- 模块产品/UI 规格完成，不代表实际法定登记、资金或 Token 执行权限获得批准，不表示代码或浏览器验收通过。
- 资金与结算已按 DEC-077/U02-14 完成 UI-Ready；Token 管理已按 DEC-078 完成 UI-Ready。**下一项：资产与发行 → 锁仓记录**，仍作为独立待收口页面。

## 资金与结算 UI-Ready 收口（2026-11-11）

- [DEC-077｜资金与结算 UI-Ready 收口](../../../decisions/DEC-077-funds-and-settlement-ui-ready-v1-closeout-approved.md)：固定现有「收款与对账｜退款与异常｜募集款结算」三个二级入口，不改变九个一级导航和正式功能 ID。
- [U02-14｜资金与结算 UI-Ready 最终规格](U02-14-FUNDS-AND-SETTLEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：完整覆盖 Offering 收款安排、OP Mainnet USDT 付款指令、真实到账/FinalMatched、退款与异常、募集款受限/释放资格、受权划拨、实际出款及受领到账核验。
- V1 投资者支付仅 USDT / OP Mainnet；M11-F011 法币/多通道仍为 V3.0；多方比例分账仍为 V2。M01 SaaS 订阅、M11 认购资金、M13 收益/本息资金分离。
- 本次仅完成企业端产品/UI 规格；真实收款、退款、托管、Signer、募集款释放和生产执行未因此获准，代码/浏览器验收未执行。
- **下一模块：Token 管理**；「资产与发行 → 锁仓记录」仍作为独立待收口页面。

## Token 管理 UI-Ready 收口（2026-11-11）

- [DEC-078｜Token 管理 UI-Ready 收口](../../../decisions/DEC-078-token-management-ui-ready-v1-closeout-approved.md)：承接既有批准的 Token 方案、合约部署、Mint/交付、限制/暂停、条件性 Burn 和链上对账原则，不新增正式功能 ID。
- [Token 管理 UI-Ready 最终规格](TOKEN-MANAGEMENT-UI-READY-CLOSEOUT-2026-11-11.md)：固定「合约管理｜Token 操作｜链上记录与对账」三个二级入口，完整覆盖字段、表单、状态、异常、权限、跨模块关系和 28 项 UI 验收目标。
- Token 发行网络与投资者支付网络分离；OP Mainnet USDT 仅为 V1 投资者支付范围，不自动成为 Token 部署网络。
- Free 可准备 Token 方案资料但不能真实部署/Mint/Burn；Standard 订阅、KYB 通过也不自动等于生产授权。真实操作仍需合法主体、受权 Signer、安全/网络/模板和生产准入。
- Token 数量与法律权益映射继承 InstrumentVersion；资金、配售/法定登记、Token 链上事实彼此独立；锁仓业务记录仍归「资产与发行 → 锁仓记录」。
- 本次只完成企业端产品/UI 规格；源码、Build、Browser、真实合约/Signer/链上执行和人工 UAT 未执行。
- **下一项：资产与发行 → 锁仓记录**；不将其并入 Token 管理或重复创建锁仓主账。
