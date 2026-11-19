# Issuer SaaS V1.0 模块 02 实施记录

## 基线与范围

- 正式主实现：`apps/issuer`；开发工作树：`.worktrees/issuer-v1-module01`。
- 模块 01 本地检查点：`2f757e1`。模块 02 改动未提交、未推送。
- 本轮仅实现已确认 Offering 的发行准备、Sandbox 任务、模拟发布及认购时间窗口。无真实链上部署、Mint、支付、配售或投资者交易。

## 页面操作与数据

1. `发行管理 → Offering 详情 → 进入发行准备`。页面显示固定的 Project、Asset、Instrument、钱包、容量和文件引用。
2. 点击「重新检查七组条件」。每组显示通过或具体原因；不通过时提供「返回修改」。资料变化后旧检查标为需重检。
3. 当前企业账号阅读并勾选责任声明，点击「确认并发起发行」。系统仅创建该 Offering 的一个 `ISS-…` Sandbox 任务，状态为「已提交」。重复提交不能新建任务。
4. 在独立「演示控制台」选择该 Offering，点击「执行已提交的 Sandbox 任务」，原任务进入「执行中」，Contract 为「部署处理中」。
5. 在测试控制区记录模拟成功、失败或 Unknown。成功时原任务「已核验」，生成唯一 `PUB-…` 发布快照，Offering 标记「Sandbox 已发布」，Contract 标记「模拟已部署」，Token 仍「未发行」。失败和 Unknown 不发布。Unknown 只能查询原任务；失败可在重检后重试原任务。
6. Sandbox 测试日期按 UTC+8 判断认购窗口，分别显示「未开放」「Sandbox 认购中」「已结束」。发行管理列表与 Offering 详情均明确标注 Sandbox。

七组检查分别读取当前 KYB 与 Mock Standard 有效期、Asset Ready 及必需文件、Instrument Ready／容量／版本和债权 Actual/365 Fixed、Offering 固定条款和时间、已验证 OP Mainnet 收款钱包、披露文件／风险摘要／核心协议、Sandbox 唯一任务与发布环境约束。Asset 和 Instrument 的关键内容须与确认快照一致，即使版本号未变也不能静默改写。检查报告带业务数据指纹；提交和执行前复核，已提交后关键资料变化会阻断核验发布。

新增 `readinessReports`、`issuanceTasks`、`publications` 和 `sandboxClock`，沿用 v4 存储键。旧 v4 缺少这些字段时安全补空；字段损坏、重复任务或重复发布快照时隔离原始数据，不自动删除或覆写。发布快照保存模块 01 的固定 Offering 确认快照。

## 两组正式页面验收

| Offering | 发行内容 | 页面实操结果 |
| --- | --- | --- |
| `OFF-3001` | 北京朝阳住宅；25,000 Token × 10 U = 250,000 U | 七组均通过；`ISS-OFF-3001` 已核验；`PUB-OFF-3001` 唯一；Sandbox 已发布；测试日期 2026-12-15 为 Sandbox 认购中；Token 未发行；刷新后保留。重复核验提示不可重复发布。 |
| `OFF-3002` | 企业借款债权；4,000 Token × 100 U = 400,000 U；12%；Actual/365 Fixed | 七组均通过；`ISS-OFF-3002` 已核验；`PUB-OFF-3002` 唯一；Sandbox 已发布；测试日期 2026-12-15 为 Sandbox 认购中；Token 未发行；刷新后保留。 |

页面负例：`OFF-3003` 草稿在上游版本变化时点击确认，提示「Asset / Instrument 版本已变化」；编辑草稿更新引用后，Free 与 KYB 未通过分别显示准入原因。其 Sandbox 任务进入 Unknown 时没有快照，重复执行被拒绝；查询为失败后仍无快照，重试沿用 `ISS-OFF-3003`。该隔离测试任务最终停在「已提交」，不属于两个目标发行结果。

## 验证结果与边界

- 自动化测试：30 项通过，包括旧 v4 加载、损坏数据隔离、版本／文件／钱包／套餐阻断、重复提交、唯一快照、Unknown／失败恢复、固定快照内容一致性和 UTC+8 时间窗口。
- TypeScript `--noEmit`、Vite Build、`git diff --check` 通过。
- 浏览器：在 `http://localhost:5174` 实际点击检查、声明、提交、执行、核验、重复请求、时间窗口和刷新。两组发行管理列表显示「Sandbox 认购中」，Offering 详情显示模拟合约与 Token 独立状态。
- 当前状态仅为浏览器本地 Mock 业务记录，不是服务端权威发行或真实链上结果。独立投资者交易、订单／配售／持有人属于后续模块或跨端接入范围；本轮没有开发。
