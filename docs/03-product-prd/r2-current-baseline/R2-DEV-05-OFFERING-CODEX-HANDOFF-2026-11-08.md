# RWA SaaS R2｜DEV-05 Offering 开发交接包（待独立验收完成后启用）

> **编制日期：2026-11-08｜交接状态：Prepared / Not Started**  
> U02-06 R01～R36 已批准；DEV-05-01「Instrument 必须 Ready 才能创建 Offering」已批准。此文档用于交接 Codex，不等于已启动开发。DEV-03/04 独立 Audit Only 结果目前尚未在本轮获得，**不得与该审计任务并发修改同一工作树**。真实发行/资金/合约生产能力不在本次授权范围。

## 0. 启动门（必须按顺序）
1. 用户已于 2026-11-07 报告 DEV-03/04 开发完成，源码工作区 `D:\RWA-SAAS-Issuer-R2`，分支 `feat/issuer-r2-rebuild`，报告时 HEAD 为 `39e200c7df40647eed66eb579b4cc7e164e28acd`；此前用户已将 DEV-03/04 **独立 Audit Only** 任务发送给 Codex。
2. **当前独立 Audit Only 结果尚未在本轮对话中收到/复核。** 在拿到该结果前，不发送本交接包要求 Codex 开始编码。不能假定审计已经结束。
3. 审计报告回来后，先检查 P0/P1 问题：若有影响数据完整性、跨 Tenant、文件/权益版本、Ready 状态、权限或核心业务流程的未解决问题，先停止 DEV-05 编码，提交问题与最小修复建议给用户；不得自己修改 DEV-03/04 来“顺手修复”。
4. 还须用户明确授权开始 DEV-05A/B。准备本交接包不等于代码开发授权。
5. 真正开始时 Codex 必须重新读取本地真实 worktree 的分支、HEAD、git status、所有 tracked/untracked 改动及正在运行的任务；不得以历史 HEAD 当作当前值。

## 一、正式产品基线

### 1.1 最新已批准的核心决策
- [U02-02 资产与发行流程/导航](U02-02-ASSET-ISSUANCE-FLOW-IA-APPROVED-2026-11-06.md)：一级「资产与发行」；二级「资产管理、认购记录、锁仓记录」；Asset 详情四 TAB：资产概览、资产资料、权益结构、发行管理。Offering 从 Asset 详情进入；不新增独立「权益结构、项目管理、发行方案、发行准备」左侧导航。
- [U02-05 Instrument 单页 UI-Ready](U02-05-INSTRUMENT-SINGLE-PAGE-UI-READY-2026-11-07.md)：每 Asset 一套当前有效 Instrument；三类权益三选一；单页三区域；Token 权益映射和容量；确定版本与文件引用。
- [DEV-05-01 Instrument Ready 前置条件](U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md)：**当前 Asset 的 Instrument 必须 Ready，才能创建 Offering Draft**。无 Instrument、Draft、检查失败、文件扫描中/失败或 Ready 失效均不允许新建；Ready 才开放入口；创建动作必须服务层复核。
- [U02-06 R01～R36 Approved](U02-06-OFFERING-FOUNDATION-R01-R06-APPROVED-2026-11-07.md)、[R07～R12](U02-06-OFFERING-FIELDS-R07-R12-APPROVED-2026-11-07.md)、[R13～R18](U02-06-OFFERING-LIFECYCLE-R13-R18-APPROVED-2026-11-07.md)、[R19～R24](U02-06-SUBSCRIPTION-SETTLEMENT-R19-R24-APPROVED-2026-11-07.md)、[R25～R30](U02-06-STATE-READINESS-R25-R30-APPROVED-2026-11-07.md)、[R31～R36](U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md)。
- [Offering 字段级 UI-Ready](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)、[状态/异常矩阵](U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md)、[T01～T36 验收矩阵](U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md)、[开发前规格审计](U02-06-DEV05-PREDEV-SPEC-AUDIT-2026-11-08.md)作为实施与验收依据；其中 Candidate/Open 不能擅自改写为 Approved。

### 1.2 产品对象流程
```text
企业 KYB 通过
  → Asset 创建/完成资料
  → Asset 详情「权益结构」创建唯一 Instrument
  → Instrument 完成 Ready 检查
  → Asset 详情「发行管理」出现「新建发行方案」
  → 创建 Offering Draft（固定引用当前 Ready InstrumentVersion）
  → 单页 A/B/C 配置与保存
  → 业务资料完整性检查 + 真实生产准入独立检查
  → 编辑中随时内部预览 / 发布前最终预览与确认
  → 真实发布（本 DEV-05 不实现；生产门未获准时必须阻断）
```

### 1.3 DEV-05-01 前置门（必须实现）
| Instrument 当前状态 | 发行管理 TAB | Offering 创建请求 |
|---|---|---|
| 不存在 | 显示先创建权益结构 | 拒绝 |
| Draft | 显示待补信息及继续编辑 | 拒绝 |
| 检查失败/核心文件扫描中或失败/Ready 失效 | 显示明确缺项/修复路径 | 拒绝 |
| 当前确定版本 Ready | 显示「新建发行方案」 | 允许创建 Draft，并绑定该 Ready 版本 |

- 该规则不只是隐藏按钮：创建命令/可信业务服务必须再次检查 Tenant、Asset、Instrument 当前版本、Ready 状态。
- 已创建 Offering 固定引用 InstrumentVersion；后续修改 Instrument 不得静默改写既有 Offering。
- Instrument Ready 只代表已完成当前产品定义的资料检查，不代表法律许可、生产发行准入、Token 已部署或可认购。

## 二、DEV-05 开发范围（前端与隔离测试）

### DEV-05A｜Offering 正式业务准备前端
1. Asset 详情「发行管理」TAB：
   - 资产关联 Offering 列表、空状态、期次、状态、计划份数和计划募集额。
   - 不创建新的独立左侧导航；不新建用户手动维护 Project 的流程。
   - 无 Instrument / 未 Ready 时按 DEV-05-01 展示下一步引导，不出现可绕过的创建按钮。
2. Offering 新建/编辑单页，三个区域（不是三步向导）：
   - **A 发行信息**：发行名称（建议值可编辑）、投资者简介、本期 Token 正整数份数、每 Token 固定价格 U、最低认购金额 U、系统计算的计划最高募集金额（份数×价格）、认购开始/截止时间和时区。
   - **B 投资者认购条件**：个人/机构类型、地区条件（不得默认全球开放）、基础 KYC 要求（无真实来源不宣称通过）、无锁仓/固定天数、只读 OP Mainnet · USDT。
   - **C 发行准备**：企业最终结算钱包（仅本 Tenant 已绑定且完成验证的 MPC 或企业自连接钱包）、认购协议、风险披露、引用 Asset/Instrument 固定文件版本；业务资料完整性与真实生产准入两组分开显示。
3. 只读继承：Asset、InstrumentVersion、权益类型/权利说明、每 Token 对应权益、当前可发行 Token 份数；不允许在 Offering 重新录入或更改权益池。
4. 草稿/检查/预览：
   - 保存 Offering Draft；刷新/重登后恢复已保存数据。
   - 检查资料缺项并提供定位/修复入口；检查不改变生命周期、不预留 Token。
   - 编辑过程中可预览投资者端；预览必须复用或对应未来投资者端实际数据映射，缺失信息如实标记。
   - 发布前提供最终预览和明确确认层。
5. 详情/列表呈现：状态、准备缺项、下一步主动作；有可信数据时显示计划份数/金额与真实已募集/已交付事实，绝不以空值伪造「已募集 0」运营数据。
6. 认购/锁仓记录从既有全局二级导航和权威模块链接；Offering 详情只提供关联入口，不复制订单/资金/Token/收益主账。

### DEV-05B｜隔离 Mock 状态与验收夹具
- 仅复用现有独立 Mock 控制台/隔离测试机制；先检查已有能力，不重复造一套客户可见 Mock。
- 仅测试 Tenant/Fixture 可模拟 Waiting、Active、Paused、Ended、Closed、订单/支付/交付/退款异常及容量变动，以覆盖 UI 与测试矩阵。
- 测试数据与正式客户业务完全隔离；正式客户页面不能出现模拟支付、Mint、募集、持仓或假「已发布」。
- 如果现有 Mock 控制台无法安全承载某用例，先报告差距，不将控制台权限暴露给普通用户。

## 三、Free / Standard 权限（必须遵守 U01）

| 能力 | 新开通 Free（KYB 通过） | 有效 Standard（KYB 通过） |
|---|---|---|
| Asset / Instrument / Offering 正式资料 | 可创建/编辑/保存，且 Instrument Ready 后才能创建 Offering Draft | 可创建/编辑/保存 |
| Offering 内部投资者端预览 | 标准模板、只读、内部使用 | 按已开放范围 |
| 配置/生成/发布公开投资者门户 | 无 | 按 U01 与独立准入范围 |
| 真实发行发布、合约部署、Mint、上架、投资者认购/募资 | 无 | 只有所有生产门通过后才可能允许；本 DEV-05 不接真实生产服务 |
| 收益/持仓/锁仓/运营报表 | 无 | 不在本次开发范围 |
| Standard 到期降级的历史业务 | 按 U01 历史只读与必要存续规则，不按新 Free 权限重新放开 | 按订阅状态与生产门 |

## 四、明确禁止（DEV-05C 不在本次范围）
- 不连接真实 OP Mainnet RPC，不构造真实 USDT 转账、不请求钱包签名、不创建真实支付订单。
- 不部署合约、不 Mint/转让 Token、不操作真实收款钱包、不结算/分账、不发起退款。
- 不实现生产 Provider/Signer/KYC/AML/法律签署/托管服务；不把本地 Mock 结果显示成真实生产准入通过。
- 不公开发布 Investor Portal、不生成外部可访问资产页、不开放真实认购入口。
- 不改变 U01、DEV-03/04 已验收行为；不修改官网 W-01～W-14 或旧 Issuer；不重建业务主账/Instrument/文件管理。
- 不更改旧 Master、Frozen、193 项历史版本归属、历史 DEC/SCOPE、根 README；不合并 PR #8；未经另行批准不 push、不 merge。

## 五、实施前代码审查要求
- 先读取本地真实代码和已完成的 DEV-03/04：Asset 详情四 TAB、Asset/Instrument 数据模型、Ready 校验来源、版本/文件引用、Tenant 隔离、钱包选择、订阅权限、Mock 控制台、路由、现有预览组件。
- 优先复用既有模型、组件和样式，不重复实现或引入复杂抽象；不因 Offering 新建一个「项目管理」用户菜单。
- 对任何模型缺口、跨模块 API 不存在、无法可靠保存版本引用等问题，先给最小方案与风险，不假造生产服务。
- 任何 Candidate/Open 字段/状态若与实际代码冲突，先保持阻断并报告，不擅自选择法务/资金/合规政策。
- 保持中文 UI；页面应让用户一眼看懂当前状态、缺什么、下一步做什么；响应式布局回归桌面与移动宽度。

## 六、验收要求

### 必测关键场景
- Instrument Ready 前置门：无 Instrument、Draft、检查失败、核心文件待扫描/失败、Ready 失效均不能创建；只有当前 Ready 版本允许创建；服务层/深链不可绕过。
- Ready 后创建 Offering Draft：正确绑定 InstrumentVersion；已有 Offering 的历史引用不会随 Instrument 更新而漂移。
- 单页 A/B/C、字段与数量×价格计算、最低认购整数份数解释、时间与时区、地区/KYC/锁仓、OP Mainnet USDT 只读显示。
- 收款钱包只列同 Tenant 已绑定/验证的钱包；文件固定 file_id + version_id。
- Draft 保存、刷新、重新登录、网络失败、文件上传/扫描失败、预览未保存变更。
- 业务资料完整与生产准入分开；Free 点击发布必须阻断并说明 Standard；Standard 在无生产门时同样阻断。
- 暂停/到期/关闭：到期停止新单；在途付款/交付/退款未结清时不得 Closed；关闭不得误释放容量。
- 跨 Tenant ID 篡改、双标签重复创建、过期 InstrumentVersion、移动端溢出。
- 运行 TypeScript、ESLint、正式 build、演示 build、Playwright/真实 Chrome；T01～T36 按适用项记录 PASS/FAIL/BLOCKED/NOT RUN。无真实生产后端的用例明确 BLOCKED，不以 Mock PASS 代替。
- 截图、trace、测试 Fixture、完整命令/退出码、最终 HEAD、git diff 与未跟踪文件列表全部归档。

### 交付报告
- 开发前：分支、HEAD、git status、未跟踪探针、独立 Audit Only 结果、P0/P1 遗留、目标变更文件清单。
- 开发后：实现范围、数据模型/路由、Instrument Ready 前置守卫、状态流、Free/Standard 权限、未实现项。
- 验收：每项测试结果、实际输入/步骤/断言、截图/trace 路径；构建日志；已知问题和生产 BLOCKED 清单。
- 最终状态：本地 commit SHA（如已获准 commit）；不得声称已推送/合并，除非确实执行且有用户授权。

## 七、可交给 Codex 的完整任务提示词（**仅在 DEV-03/04 独立 Audit Only 已完成并由用户确认后发送**）

```text
任务：RWA SaaS R2｜DEV-05 Offering 发行管理前端与隔离 Mock
模型要求：使用 Codex 当前可用的最高能力模型，推理强度 High/最高可用档。
工作区：D:\RWA-SAAS-Issuer-R2
预期分支：feat/issuer-r2-rebuild
GitHub 产品文档分支：docs/r2-current-product-baseline
本任务状态：开发交接已准备；只有用户在 DEV-03/04 独立 Audit Only 报告复核后明确授权，才开始编码。

【第 0 阶段：硬性启动门，先只读】
1. 确认 DEV-03/04 独立 Audit Only 已结束，并取得完整报告/文件；若仍运行、未提供结果或用户尚未确认，立即停止。只报告「等待独立审计结果」，不得改源码、文档、测试、commit 或启动并发任务。
2. 检查是否仍有 Codex 任务/进程正在操作同一工作树；有则停止，不并发修改。
3. 读取真实分支、HEAD、git status、所有 tracked/untracked 改动；不得 reset/clean/stash/checkout 覆盖任何用户文件。特别保留已有未跟踪探针文件。若不是预期工作区/分支，先报告。
4. 基线 HEAD 39e200c7... 仅为 2026-11-07 用户报告的历史值，不可假设仍是当前值。重新核实。
5. 读取本交接文档引用的当前 Approved 规则与 Candidate/Open 文件；以 GitHub 当前 docs/r2-current-product-baseline 为产品源，不用过时快照 953454b...，不读旧 Issuer 当作需求权威。
6. 复核独立审计的 P0/P1；任何影响 Tenant 隔离、Asset/Instrument 数据、Ready、文件版本、钱包/权限或核心业务状态的未解决项，先停止并报告，不自行扩展修复。

【第 1 阶段：确认当前代码可承接】
7. 只读审计 DEV-03/04 实际源码：Asset 详情四 TAB、Instrument Ready 检查、InstrumentVersion、权益容量、固定文件版本、Tenant 权限、U01 订阅权限、企业钱包绑定状态、独立 Mock 控制台和投资者预览组件。
8. 对照本交接文档，列出现有能力可复用、缺口、冲突和最小实现计划。如果需要新增后端服务/数据库迁移/权限策略而当前项目没有对应基础，先报告，不假造生产能力。
9. 只有在独立 Audit Only 完成、无未解决阻断项且用户已明确授权 DEV-05A/B 后，才能进入编码。否则停在报告。

【第 2 阶段：实现范围（用户授权后）】
10. 实现 Asset 详情「发行管理」TAB 中 Offering 列表/空态/详情入口；不增加独立二级导航。
11. 严格实现 DEV-05-01：当前 Asset 的 Instrument 必须 Ready 才能创建 Offering Draft。无 Instrument / Draft / 检查失败 / 核心文件待扫描或失败 / Ready 失效均拒绝；只有 Ready 的确定版本可创建。创建时在可信业务层再次核验 Tenant、Asset、InstrumentVersion、Ready，不可仅隐藏按钮或依赖客户端状态。
12. Offering 创建/编辑为单页 A 发行信息、B 投资者认购条件、C 发行准备；不是三步向导。Asset/InstrumentVersion/权利/当前可用份数只读继承，禁止重新配置权益池。
13. 实现字段、控件、校验、数量×单价 U 计算、最低认购金额的整数 Token 解释、时间及时区、个人/机构/地区/KYC/锁仓、只读 OP Mainnet·USDT、企业收款钱包选择、协议/风险披露与文件固定版本引用，严格按 UI-Ready 和 Approved/Open 分层。
14. 允许 KYB 通过的新 Free 与有效 Standard 创建/编辑正式业务资料；Free 只允许内部只读预览，不能配置/生成公开门户或真实发布、上架、认购、收款、Mint。Standard 在任何生产门未通过时同样阻断真实发布。
15. 发行准备区分业务资料完整性与真实生产准入；Unknown/Blocked 不可伪造绿灯。保存/检查/预览不改变生命周期、不预留 Token。
16. 投资者端预览尽量复用真实展示映射/共享组件；仅内部预览，不生成公开 URL/外部门户；缺项如实显示，不虚构募集/收益/持仓数据。
17. DEV-05B 只在独立 Mock 控制台/隔离 Fixture 内做状态演示；不得把模拟支付、订单、Mint、资金或持仓呈现为真实客户数据。生产业务页不出现 Mock 控制入口。
18. 不实现任何真实 OP Mainnet RPC、USDT 转账、钱包签名、合约部署、Mint、资金托管/分账/退款、生产 KYC/AML/法律签署或公开 Investor Portal。

【第 3 阶段：测试与交付】
19. 按 T01～T36 执行适用的真实 Browser/Route/State/Permission/Responsive 测试；未实现生产后端的场景标 BLOCKED，不能伪报 PASS。
20. 运行 TypeScript、ESLint、正式 Build、Demo Build 和 Playwright/Chrome；记录命令、退出码、日志。
21. 验证 DEV-03/04 回归，无官网 W-01～W-14 或旧 Issuer 变更。
22. 输出完整差异、测试结果、截图/trace、最终 HEAD、git status、未跟踪文件；不得删除或覆盖用户探针。
23. 未经用户明确授权不 push、不 merge PR #8、不修改产品文档/旧 Master/Frozen/193 项/历史 DEC/SCOPE/根 README。
24. 开发报告完成后停下等待用户人工验收；不得自行宣布总控验收或生产验收通过。
```

## 八、当前交接状态

| 项目 | 状态 |
|---|---|
| U02-06 R01～R36 | Approved |
| DEV-05-01 Instrument Ready 前置门 | Approved |
| 字段级 UI-Ready / 状态矩阵 / T01～T36 | 已准备，T02 已同步批准规则 |
| DEV-03/04 独立 Audit Only | **等待结果；尚未复核** |
| Codex DEV-05 提示词 | 已准备，**暂不发送** |
| DEV-05A/B 编码 | 未开始、未授权 |
| DEV-05C 真实生产资金/Token | NO-GO |
| PR #8 | Draft / Open / Unmerged |

