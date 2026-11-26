# DEV-03 账户、KYC 与钱包 Mock 验收（2026-11-26）

## 基线

- PR #17 已推送 DEV-02 HEAD：`31b4f7d9bb0a255f7af0273fd0bd0cbfb2556ee4`。本阶段依据已批准 `V-M-SHARED-UI-READY-PRD-v0.1.md` 第 4 节。
- 仅前端 Mock；不发送邮件、不收集真实证件、不创建真实钱包或签名。

## 实现

- `/m/account`、`/v/:issuer/account`：邮箱格式校验、六位页面可见的 Mock OTP、30 秒重发间隔、5 分钟有效期、一次性校验。首次验证创建当前渠道账户；M/V 相同邮箱存储键和会话相互隔离。
- 新账户 MPC 状态初始为“创建中”，保留唯一操作 ID；原操作结果模拟就绪后才生成 Mock 地址并预设默认。失败、未知、待服务准入可在 `/demo` 查看。
- 账户概览、基本资料、KYC、钱包管理、账户安全、工单入口。KYC 有未开始、认证中、待补件、已通过、未通过、过期、结果待核实。查询未知结果不会自行改成“通过”。
- 自有钱包连接、Mock 挑战、模拟验证、默认钱包切换；未验证地址不能设默认。默认切换幂等并维护本地版本号，仅影响后续新操作预选。
- 原项目 `from` 返回链接限定当前 V/M 渠道，并防止 `..` 路径逃逸。登录和 KYC 不改变其他渠道账户。
- `/demo` 增加按渠道账户切换 KYC/MPC Mock 结果的独立控制区，不出现在正常投资页导航。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 自动化测试 | `node --test src/domain.test.mjs src/account.test.mjs`：15/15 PASS；覆盖 OTP、超时、重放、V/M 隔离、MPC 状态与幂等、默认钱包、KYC 门槛、返回路径 |
| TypeScript | `tsc --noEmit`：PASS |
| 生产构建 | `vite build`：PASS |
| 实际浏览器 | 本地 `127.0.0.1:5183`：无效邮箱、错误 OTP、Mock 注册、初始 KYC/MPC、提交认证、钱包操作、挑战验证、默认切换、V/M 同邮箱隔离、补件/失败及 Unknown 查询均实际点击验证；PASS |
| Console Error | 本轮账户流程浏览器日志 `levels:['error']`：0 |
| Chrome 截图 | 5 张 1440px PNG，尺寸校验 PASS；截图专用合成账户仅写入临时浏览器资料，临时 QA 注入页已删除 |

## 截图

- `screenshots/dev03-m-login.png`
- `screenshots/dev03-m-overview.png`
- `screenshots/dev03-m-kyc-supplement.png`
- `screenshots/dev03-m-wallets.png`
- `screenshots/dev03-v-account.png`

## 限制

- Mock OTP 固定显示在页面，不构成真实身份认证；真实 OTP 限流、Provider 反重放、会话时效和法定协议接受留待后续正式服务。
- KYC 及钱包结果由前端 `/demo` 模拟，不能视为真实 Provider 回执。真实付款、订单及资金状态均未实现，属于 DEV-04 及后续阶段。
- 全新环境依赖安装仍为 NOT EXECUTED，DEV-07 需单独解决和复验。
