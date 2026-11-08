# RWA SaaS R2｜DEV-05 Offering 开发交接包（待独立验收完成后启用）

> **编制日期：2026-11-08｜最新状态：用户已授权启动 DEV-05A/B（前端业务准备 + 隔离 Mock）**  
> U02-06 R01～R36 与 DEV-05-01 均为 Approved。DEV-03/04 独立 Audit Only 发现的文件版本/Ready P1、Token 输入 P2 已修复；两个审计提交 `e8506cd2c8d8af614aa092bf6c8f788af62ded4f`、`82dac7fd897242c5b3c9140ee3dab3b5a74f540c` 已由 ChatGPT 独立复核，P1 修复与编辑页 Ready 徽标修复通过针对性复核。用户于 2026-11-08 明确决定**暂不进行 DEV-01～04 整体验收，直接进入 DEV-05**，据此授权 DEV-05A/B。**DEV-03/04 阶段验收仍非 A**；跳过整体验收不等于宣告其通过。只允许 Offering 前端业务准备、内部预览与隔离 Mock；真实发行/资金/合约/公开门户生产能力仍 NO-GO。

## 0. 启动门（必须按顺序）
1. 用户已于 2026-11-07 报告 DEV-03/04 开发完成，源码工作区 `D:\RWA-SAAS-Issuer-R2`，分支 `feat/issuer-r2-rebuild`，报告时 HEAD 为 `39e200c7df40647eed66eb579b4cc7e164e28acd`；此前用户已将 DEV-03/04 **独立 Audit Only** 任务发送给 Codex。
2. **独立 Audit Only 与修复复验已完成**：初始审计未发现 P0，发现 Asset 文件换版后 Instrument Ready 未复核的 P1，以及 Token 非法输入结果展示 P2。随后完成 P1/P2 修复；编辑页 Ready 徽标 follow-up 也已完成。ChatGPT 已直接复核两个独立审计提交（`e8506cd2...`、`82dac7fd...`）中的源码差异、状态逻辑、测试脚本、浏览器结果、截图与构建日志，针对性修复结论通过。审计材料：[P1 修复证据](https://github.com/mirrorshang/rwa-saas-platform/tree/e8506cd2c8d8af614aa092bf6c8f788af62ded4f/docs/03-product-prd/r2-current-baseline/audit-evidence/dev-03-04-p1-fix-2026-11-08)、[Ready 徽标 follow-up](https://github.com/mirrorshang/rwa-saas-platform/tree/82dac7fd897242c5b3c9140ee3dab3b5a74f540c/docs/03-product-prd/r2-current-baseline/audit-evidence/dev-03-04-p1-follow-up-2026-11-08)。
3. **DEV-03/04 整体验收状态仍非 A**：40 PASS/0 FAIL/1 BLOCKED 等局部与针对性测试，不等于 DEV-01～04 整体浏览器验收或用户人工验收。已知原型限制包括跨浏览器上下文 sessionStorage 不共享；不擅自更换持久化模型。本轮用户明确选择暂缓整体验收，不将此选择记录为 DEV-03/04 通过。
4. **最新启动授权**：用户于 2026-11-08 明确指示「先不进行验收，直接进入 DEV05」。据此现在授权 DEV-05A（Offering 前端业务准备）与 DEV-05B（独立隔离 Mock/Fixture）；无需等待 DEV-01～04 整体验收 A。Codex 仍须在当前工作区先做安全核对及只读承接审查；发现影响 DEV-05 的未解决 P0/P1 时停止报告，不扩大修复。
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

## 七、可交给 Codex 的完整任务提示词（**当前已获用户明确授权 DEV-05A/B，可发送**）

```text
任务：RWA SaaS R2｜DEV-05 Offering 发行管理前端与隔离 Mock
模型要求：使用 Codex 当前可用的最高能力模型，推理强度 High/最高可用档。
工作区：D:\RWA-SAAS-Issuer-R2
预期分支：feat/issuer-r2-rebuild
GitHub 产品文档分支：docs/r2-current-product-baseline
本任务状态：用户已明确授权 DEV-05A/B。DEV-03/04 整体阶段验收仍未判 A；本次授权不代表 DEV-03/04 通过，也不授权 DEV-05C 生产能力。

【第 0 阶段：硬性启动门，先只读】
1. 用户已明确授权 DEV-05A/B；DEV-03/04 的 P1/P2 定向修复及编辑页徽标 follow-up 已完成并经 ChatGPT 独立复核。不要要求用户先完成 DEV-01～04 整体验收。但必须在当前 worktree 现场检查相关修复代码是否仍存在、Ready 共享判断是否有效；若本地源码与审计快照不一致或发现影响 DEV-05 的 P0/P1，立即停止并报告，不自行扩大修复。
2. 检查是否仍有 Codex 任务/进程正在操作同一工作树；有则停止，不并发修改。
3. 读取真实分支、HEAD、git status、所有 tracked/untracked 改动；不得 reset/clean/stash/checkout 覆盖任何用户文件。特别保留已有未跟踪探针文件。若不是预期工作区/分支，先报告。
4. 基线 HEAD 39e200c7... 仅为 2026-11-07 用户报告的历史值，不可假设仍是当前值。重新核实。
5. 读取本交接文档引用的当前 Approved 规则与 Candidate/Open 文件；以 GitHub 当前 docs/r2-current-product-baseline 为产品源，不用过时快照 953454b...，不读旧 Issuer 当作需求权威。
6. 复核独立审计的 P0/P1；任何影响 Tenant 隔离、Asset/Instrument 数据、Ready、文件版本、钱包/权限或核心业务状态的未解决项，先停止并报告，不自行扩展修复。

【第 1 阶段：确认当前代码可承接】
7. 只读审计 DEV-03/04 实际源码：Asset 详情四 TAB、Instrument Ready 检查、InstrumentVersion、权益容量、固定文件版本、Tenant 权限、U01 订阅权限、企业钱包绑定状态、独立 Mock 控制台和投资者预览组件。
8. 对照本交接文档，列出现有能力可复用、缺口、冲突和最小实现计划。如果需要新增后端服务/数据库迁移/权限策略而当前项目没有对应基础，先报告，不假造生产能力。
9. 当前用户授权已经生效。完成上述只读承接审查后，如没有影响 Offering 创建前置门、Tenant 隔离、Asset/Instrument 固定版本与 Ready、钱包/套餐权限的未解决 P0/P1，即可直接进入 DEV-05A/B 编码；如有此类问题则停止报告。不得将 DEV-03/04 整体阶段验收标记为 A。

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
| DEV-03/04 独立 Audit Only | 已完成；未发现 P0；初始 P1/P2 已修复并针对性独立复核通过 |
| DEV-03/04 整体阶段验收 | **未完成，非 A；用户决定暂缓，不阻断本次 DEV-05A/B** |
| P1 文件换版/Ready 复核 | 已修复；审计提交 `e8506cd2...`，follow-up `82dac7fd...` |
| 编辑页 Ready 徽标一致性 | 已修复并独立复核通过；sessionStorage 跨上下文限制保留为已知原型边界 |
| DEV-05A Offering 前端业务准备 | **用户已授权启动** |
| DEV-05B 隔离 Mock / Fixture | **用户已授权启动** |
| DEV-05C 真实生产发行/支付/Token | **NO-GO，不在本次授权内** |
| DEV-05C 真实生产资金/Token | NO-GO |
| PR #8 | Draft / Open / Unmerged |

