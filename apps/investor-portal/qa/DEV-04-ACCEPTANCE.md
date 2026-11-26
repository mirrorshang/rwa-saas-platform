# DEV-04 四步认购 Mock 闭环验收（2026-11-26）

## 基线与范围

- 基于 PR #17 DEV-03 HEAD `0cc1cdd5d37981a3761a2cd30bf7f54d92e707ed` 和已批准的 `V-M-SHARED-UI-READY-PRD-v0.1.md` 第 5 节。
- 仅 PC Web 前端 Mock。无真实订单、电子签署、钱包调用、USDT 转账、配售、法定登记或链上交付。

## 实现

- 四步：确认份数与金额 → 逐份阅读 Mock 文件并确认 → 分别选付款钱包与 Token 接收地址、模拟发起 OP Mainnet USDT 付款 → 查看独立付款、配售、法定登记和 Token 交付状态。
- 根据当前 Listing、认购状态、KYC、最小额、单笔上限及可售容量守卫订单创建。待付款 Mock 订单占用 Offering 容量 15 分钟；V/M 共用同一 Offering 容量。失败付款及过期待付款订单释放容量。创建操作由浏览器容量锁串行化；不支持该锁时拒绝创建。
- Mock 文件正文可展开查看，记录逐份阅读确认；订单始终标记 `legalSignatureValid: false`。文件阅读、步骤查看、付款发起与后续状态均相互区分。
- 订单请求标识及当前订单按账户、渠道、Issuer 和 Offering 隔离；重复创建返回同一有效 Mock 订单，失败或过期后可发起新请求。
- `/demo` 可切换付款失败、付款未知等场景；未知结果保持待核实，不推断为付款或交付成功。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 自动化测试 | `node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs`：19/19 PASS；覆盖文件内容、KYC、Listing、容量、V/M 与账户隔离、幂等、付款及四阶段状态、失败/未知 |
| TypeScript | `tsc --noEmit`：PASS |
| 生产构建 | `vite build`：PASS，40 modules |
| 实际浏览器 | 本地 `127.0.0.1:5183`：逐份展开文件并阅读、创建订单、独立选钱包/接收地址、发起付款、核实付款、逐一确认配售/登记/交付、无效份数禁用下一步、不可见项目直访受控，均实际点击验证；PASS |
| Console Error | 上述认购流程及无效输入的浏览器日志 `levels:['error']`：0 |
| Chrome 截图 | 4 张 1440px PNG，尺寸校验与视觉检查 PASS；截图专用合成账户和订单只注入临时浏览器资料，临时 QA 注入页已删除 |
| 独立安装依赖 | NOT EXECUTED；DEV-07 须提供锁定依赖并复验 |

## 截图

- `screenshots/dev04-quote.png`
- `screenshots/dev04-documents.png`
- `screenshots/dev04-payment.png`
- `screenshots/dev04-progress.png`

## 限制

- 所有状态仅在本机浏览器存储。浏览器数据可能被手动修改，不能作为真实订单、付款或法定持有人记录。
- 文件是最小可读 Mock 正文，不是经审核的正式法律文件；模拟确认没有法律签署效力。
- 真实付款失败、退款与追偿均由后续正式系统和授权流程处理；本阶段只展示 Mock 状态，不提供用户主动取消或手动退款操作。
