# DEV-06 持仓、收益与信息服务 Mock 验收（2026-11-26）

## 基线与范围

- 基于 PR #17 DEV-05 HEAD `6bae289968aba1b47dd71f22b0ab716cc60ee944` 和已批准的 V/M UI-Ready PRD；仅前端本机 Mock。
- 不新增可投资 Offering；股权模板目前不可投资，因此无虚构的股权持仓或股息事件。
- 全额配售、动态 Mint、统一 Claim 等近期简化建议未视为已批准规则。分配路径逐批标为待核实，`/demo` 只提供可区分的 Mock 场景。

## 实现与验收

- 本人持仓列表、详情由当前账户及渠道的已确认 Mock 法定登记订单产生。展示权利人脱敏信息、权益数量、登记时间和证据引用；Token 交付数量、引用、时间及余额独立展示。旧记录证据缺失时标为待核实；异常或退款中的来源订单保留记录供核查，同时提示经济权益与分配资格待核实。
- 收益与本金列表、事件详情按关联持仓、权益类型、账户及渠道限定。股息、债权利息、收益参与分配和债权本金偿还分别建模；已偿本金不计入已支付收益。计划、金额确认、注资、可领取、处理中、已支付及未知状态分开。Claim 只能在选择该批 Mock 路径且可领取时模拟一次；原请求处理中不能重复领取。
- 消息列表、详情和已读状态覆盖本人订单、工单、关联分配及公开项目公告；项目公告、披露文件索引和可读 Mock 文本由公开 Listing 或本人历史订单范围控制。消息已读不改变业务事实。
- 无真实持有人登记、Token 对账、收益决议、注资、付款、钱包或通知服务；金额与状态均为演示资料。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 自动化测试 | `node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs src/orders.test.mjs src/postInvestment.test.mjs`：27/27 PASS；覆盖登记与 Token 分离、异常持仓提示判定、类型/账户/渠道守卫、金额状态、本金排除及消息披露范围 |
| TypeScript | `tsc --noEmit`：PASS |
| 生产构建 | `vite build`：PASS，48 modules |
| 实际浏览器 | `127.0.0.1:5183`：M 本人持仓→详情、收益空态→`/demo` 创建收益参与事件→可领取→事件详情→模拟领取进入处理中且不可重复；消息详情已读；M 披露直达非公开项目受控。PASS |
| Console Error | 上述页面与操作浏览器日志 `levels:['error']`：0 |
| Chrome 截图 | 6 张 1440px PNG，尺寸及持仓详情、收益布局视觉检查 PASS；截图专用合成记录仅写入临时浏览器资料，临时 QA 注入页已删除 |
| 独立安装依赖 | NOT EXECUTED；DEV-07 需锁定依赖并在全新环境复验 |

## 截图

- `screenshots/dev06-holdings.png`
- `screenshots/dev06-holding-detail.png`
- `screenshots/dev06-returns.png`
- `screenshots/dev06-distribution-detail.png`
- `screenshots/dev06-messages.png`
- `screenshots/dev06-disclosures.png`

## 剩余问题

- 登记、Token 交付、合同金额与付款证据只有 Mock 数据；生产中须由权威来源核实。当前可核余额与法定对账保持待核实。
- 非公开 Offering 不会因本阶段新增公告成为可投资项目。历史已投资项目的本人文件访问不等于新的公开 Listing。
