# Platform Admin V1.0 产品设计完整性审计报告

> 版本：2026-11-20 复审稿，待产品负责人审核。范围：产品设计与文档，不涉及 Platform Admin 源码开发或生产上线。

## 1. 审计依据与结论

- 文档基线：GitHub mirrorshang/rwa-saas-platform 的 docs/platform-admin-architecture-20261117 分支，起点 5c742cf；原 [Platform Admin 文档索引](PLATFORM-ADMIN/README.md)及 P-01～P-18 逐页规格。原 PR #10 仍为 Draft/Open。
- 已批准规则：DEC-037/044/050/057/069/074；五批集中审核 R01～R40 已确认，其中 R05 按企业商业 KYB 与资产发行边界修正。历史 DEC、Frozen 和审核记录未修改。
- 实现对照：release/v1-engineering-handover-20261116 @ 8785e8e 是原发行基线；Issuer [PR #12](https://github.com/mirrorshang/rwa-saas-platform/pull/12) 在 apps/issuer 完成五模块 Sandbox Mock 闭环，当前仍 Open，尚非 release 的生产权威实现。仓库没有独立 Platform Admin、V、M 交易前台可供真实端到端操作验收。
- 结论：九个一级导航、P-01～P-18 页面组与主要操作已有可供桌面 Web UI 开发的 Draft 规格。此次补正 P-15～P-17 的 Project/版本、Listing/复核状态和统计来源，并补齐少量页面入口与返回路径。**UI-Ready 仅指文档级前端/Mock 实现依据；真实跨端上架、资金、KYC、Token、生产权限仍未验收。**

## 2. 完整文档索引与逐页检查

以下链接均指向现有规格；保留原文件，不新建重复 P 页文档。“可开发”表示页面目的、入口、字段/规则、按钮、状态、异常及跳转已足以制作桌面 Web UI；外部未定值必须显示待配置或禁用。

| 页面组 | 现有规格 | 已核对的页面、字段与交互 | 复审结果 |
|---|---|---|---|
| P-01 平台工作台 | [P-01～P-06](PLATFORM-ADMIN/PLATFORM-ADMIN-P01-P06-ISSUER-CUSTOMER-TENANT-UI-READY-PRD-DRAFT-v0.1.md) | 平台商业/运营摘要、待办、异常、数据时间；卡片跳各原业务页；Unknown 不作 0 | 可开发；无金融主账 |
| P-02 SaaS 企业客户 | 同上 | 申请队列、企业/申请筛选、状态与详情；商业 KYB 转 P-03 | 可开发；不是资产审核 |
| P-03 商业 KYB | 同上 | 主体资料、补件、审核决定、原因与证据；只决定 SaaS 企业准入 | 可开发；R05 已澄清发行不经 P-03 |
| P-04 Tenant 列表 | 同上 | Tenant 服务状态、检索、列表到详情；状态变更留 P-05 | 可开发；不删除投资者权利 |
| P-05 Tenant/订阅详情 | 同上 | Free/Standard、授权、暂停/恢复、变更历史与确认 | 可开发；生产价格/计费另定 |
| P-06 SaaS 商业收费异常 | 同上 | 商业 Intent、Unknown、异常处理与权益恢复；查原收款事实 | 可开发；不等于投资资金 |
| P-07 平台任务与异常 | [P-07～P-08](PLATFORM-ADMIN/PLATFORM-ADMIN-P07-P08-OPERATIONS-CENTER-UI-READY-PRD-DRAFT-v0.1.md) | 任务队列、分派、升级、关闭、原业务引用与结果反馈 | 可开发；关闭任务不改原业务状态 |
| P-08 平台通知 | 同上 | 模板、发送确认、投递/阅读/失败/Unknown、原消息幂等重试 | 可开发；发送不等于法律送达 |
| P-09 套餐权益 | [P-09～P-10](PLATFORM-ADMIN/PLATFORM-ADMIN-P09-P10-PLATFORM-ENTITLEMENTS-AND-GLOBAL-RULES-UI-READY-PRD-DRAFT-v0.1.md) | Free/Standard 版本、能力/配额、草稿→审批→生效、影响确认 | 补明列表→详情→编辑/审批入口；价格/配额仍待批准 |
| P-10 全局规则 | 同上 | 强制 Gate、地区/受众、版本、影响范围、审批及历史 | 补明规则目录到修订/生效去向；法域枚举待批准 |
| P-11 敏感访问 | [P-11～P-12](PLATFORM-ADMIN/PLATFORM-ADMIN-P11-P12-SECURITY-AND-AUDIT-UI-READY-PRD-DRAFT-v0.1.md) | 申请目的、范围、审批、限时授权、撤权与审计 | 可开发；实际 RBAC/审批层级待安全方案 |
| P-12 安全与审计 | 同上 | 审计事件、访问记录、安全事件、处置与证据引用 | 可开发；不替代业务主账 |
| P-13 外部服务管理 | [P-13](PLATFORM-ADMIN/PLATFORM-ADMIN-P13-EXTERNAL-SERVICE-MANAGEMENT-UI-READY-PRD-DRAFT-v0.1.md) | 连接、健康/事件、凭证元数据、探测/暂停/恢复/轮换 | 补明导航、配置入口、保存/验证按钮及结果；Provider 未选定 |
| P-14 平台数据与报表 | [P-14](PLATFORM-ADMIN/PLATFORM-ADMIN-P14-PLATFORM-REPORTING-AND-ANALYTICS-UI-READY-PRD-DRAFT-v0.1.md) | 四类授权聚合报表、查询、导出申请、口径/延迟/Unknown | 可开发；不能读取 Issuer M21 或导出逐笔金融主账 |
| P-15 上架审核 | [I-67/I-68、P-15～P-17](PLATFORM-ADMIN/PLATFORM-ADMIN-I67-I68-P15-P17-UNIFIED-INVESTOR-CHANNEL-UI-READY-PRD-DRAFT-v0.1.md) | 单 Offering 申请、快照、补件、审核、批准地区/受众、自动上架结果 | 补正内部 Project/版本、Sandbox 阻断和原操作恢复 |
| P-16 已上架 Listing | 同上 | Listing 列表/详情、暂停/下架/已暂停恢复、M 同步历史 | 展示状态与内容复核分列；未创建 Listing 的异常不进入此页 |
| P-17 渠道监控 | 同上 | 曝光、归因订单授权聚合、投诉/异常、跳 P-15/P-16 | 早期 M21 误引已改为 M23-F007 + M10/M11 聚合 |
| P-18 M 投资者账户 | [P-18](PLATFORM-ADMIN/PLATFORM-ADMIN-P18-UNIFIED-INVESTOR-ACCOUNT-MANAGEMENT-UI-READY-PRD-DRAFT-v0.1.md) | 脱敏账户、KYC 权威摘要、关系、通知、账户限制/恢复 | 明确正常↔受限；暂停/关闭只读；不代改 KYC |

补充入口：[总体架构](PLATFORM-ADMIN/PLATFORM-ADMIN-OVERALL-ARCHITECTURE-AND-NAVIGATION-DRAFT-v0.1.md)、[跨模块一致性审计](PLATFORM-ADMIN/PLATFORM-ADMIN-CROSS-MODULE-CONSISTENCY-AUDIT-DRAFT-v0.1.md)、[四端功能总览](PLATFORM-ADMIN/RWA-FOUR-PLATFORM-FUNCTIONAL-FLOW-OVERVIEW-FOR-ENGINEERING-DRAFT-v0.1.md)。I-67/I-68 属于 Issuer 申请和状态视图，规格收在 P-15～P-17 文件中，不能把它们当作现有可运行页面。

## 3. 已证实的设计缺口与处理

| 优先级 | 位置 | 问题及影响 | 本次文档处理 |
|---|---|---|---|
| P0 | I-67/I-68、P-15 | 旧稿称 Issuer 无 Project/通用版本；会让工程师丢失当前候选实现的内部 Project 与固定版本引用 | 改为 Project 自动创建、只读关联，不增加企业步骤；Asset/Instrument/Offering 按提交快照引用，正式接口待核验 |
| P0 | I-67、P-15 | 当前 Issuer 只有 Sandbox 模拟发布；若当作正式已发布，会误开放 M 渠道 | 明确展示阻断原因和「前往发行管理」，生产 Gate 未接通前不得真实提交 |
| P0 | P-17 | 早期统计章节仍写 M21 只读报表，与 R32/第 15 节冲突，可能越权 | 改成 M23-F007 归因 + M10/M11 授权聚合及 M17/M18；缺源显示待接入 |
| P1 | P-15/P-16 | 「待复核」混入 Listing 展示状态；审核通过、创建 Listing、M 已展示可能被合并成一个结果 | 分开申请审核、Listing/M 同步、展示、内容复核及认购状态；失败/Unknown 追原 Application/操作/幂等键 |
| P1 | P-16 | 无 Listing ID 的自动创建失败也被写入 P-16；已下架与已暂停共用「恢复」文案 | 未创建 Listing 留 P-15/P-07/P-17；P-16 仅管理已存在 Listing；恢复只适用于已暂停 |
| P1 | 已展示版本变化 | 旧稿只说待复核，未写如何退出；可能展示未批准的新内容或生成第二个 Listing | 沿 I-67 更新申请、P-15 复核，核验后受控更新原有效 Listing/清除标记；旧快照保留 |
| P2 | P-09/P-10、P-13、P-18 | 个别列表到编辑/审批入口、配置保存结果、账户「暂停」来源不明 | 补明入口、按钮/返回、异常提示和正常↔受限范围 |

以上仅补已批准能力的具体交互。未设计独立发行审核、人工首次上架、投资者资格引擎、新支付或 Token 主账。

## 4. P-15～P-17 跨端成功主流程

1. Issuer 对单个 Offering 完成**正式发行发布**。Sandbox「已发布」只在内部演示，不满足 I-67 真实渠道申请 Gate；企业在 I-67 选择披露、地区和授权并固定 Asset/Instrument/Project/Offering 版本快照。
2. I-67 提交后，I-68 展示申请编号/状态；P-15 接收并审核 M 渠道展示申请，可补件、拒绝或点击「审核通过并自动上架」。P-15 **不审核企业资产发行**，商业 KYB 由 P-03 负责。
3. 系统以原 Application/操作/幂等引用创建唯一有效 Listing 并同步 M；仅 M 确认展示成功，P-16/I-68 才显示「展示中」，M 才可见。Unknown/失败查原操作，不手工再建 Listing。Listing ID 未产生时不得显示虚构编号。
4. P-16 管理既有 Listing 的暂停、下架、已暂停恢复；已下架须企业重新申请并由 P-15 审核。重大版本变化单列「待复核」，旧批准快照与展示状态独立；复核通过后更新原有效 Listing，不抹除历史。
5. P-17 看渠道归因和授权聚合、投诉/异常，需调整展示时跳 P-16。M 投资者 KYC、认购、订单和支付由 M/原业务领域负责；P-15 批准与单个投资者可认购是两回事。Issuer/V/M/P 不互建重复订单、资金、登记、Token 或收益主账。

## 5. 跨模块一致性与权限

- **企业与商业准入：**P-02/P-03/P-04/P-05 管理 SaaS 客户、商业 KYB、Tenant、Free/Standard。Issuer 负责资产、权益、Offering、发行与存续；P-03/P-15 均不成为企业发行逐项许可。
- **投资者：**P-18 仅管理 M 账户访问及脱敏 KYC 服务状态；实际 KYC 来自适格 Provider/M 权威，V 账户与 M 账户不自动合并。P-18 不改 KYC 结论或 Offering 个体资格。
- **渠道：**Issuer 自愿申请 M；P-15 审核和自动上架；P-16 运营已创建 Listing；P-17 监控。V 门户配置/预览不等于完整独立交易前台，也不自动触发 M 上架。
- **资金与 Token：**P-06 仅 SaaS 商业收费异常；投资者订单、付款、配售、法定登记、Token、租金/利息/本金由原业务权威维护。P-07 任务、P-08 通知、P-13 Provider 恢复、P-14 统计不改写主账。
- **安全与数据：**P-11/P-12 最小权限和审计；Unknown 不当成功也不当 0。P-14/P-17 使用有权聚合事实，禁止将 Issuer M21 作为平台报表或逐笔穿透入口。

## 6. UI-Ready 判定与未决事项

| 层次 | 本次判定 | 开发时处理 |
|---|---|---|
| 页面/交互产品规格 | P-01～P-18 文档级 UI-Ready Draft；本次修正均待产品负责人确认 | 可按现有字段、按钮、弹窗、状态、异常和导航做桌面 Web UI；Mock 明示环境 |
| 真实 Platform/V/M 前端 | 本仓库未见独立可运行实现 | 不能宣称页面实际点击或跨端 E2E 通过 |
| Issuer 对接 | PR #12 为未合并 Sandbox Mock；正式发行、I-67/I-68 未接通 | 正式渠道申请按钮保持阻断；只读关联从权威接口取值 |
| 生产参数 | 实际角色码/RBAC与职责分离、法域/地区/受众法律依据、Free/Standard 价格/配额、Provider/密钥/健康阈值、P-14 指标字典和隐私阈值待批准 | 显示「待配置/无权/待接入」，不得填假值或自行放宽 Gate |
| 技术契约 | Channel Application/Listing 唯一键、自动上架幂等与 Unknown 对账、授权聚合 API、审计/撤权仍需实现方案 | UI 保留原 ID、结果待核实与重试查询；不可用前不展示生产成功 |

因此，**可交给工程师启动 UI/Mock 实现；不具备生产跨端上线验收条件。** 如产品负责人要求「UI-Ready」必须连生产枚举、真实权限和接口契约全部冻结，则该更严格口径目前未达到，需先完成上表决策门。

## 7. 本次文件与验收

- 更新现有 P-09/P-10、P-13、I-67/I-68/P-15～P-17、P-18 规格，以及总体架构、跨模块一致性审计和 PLATFORM-ADMIN/README 索引。
- 新增本报告；P-01～P-08、P-11/P-12、P-14 和四端总览经核对无需重复改写。历史 R01～R40、DEC、Frozen 均保持原文。
- 验证方法：逐页核对规格章节、按钮/字段/状态与跨模块口径；对修改后的链接、编号、旧术语和文档差异进行静态检查。本轮没有 Platform 页面浏览器验收或真实 M 上架。
- 版本记录：2026-11-20 首次完整性复审；结论待产品负责人审核。提交分支和 PR 见交付汇报；未经审核不合并原 PR #10 或 release。
