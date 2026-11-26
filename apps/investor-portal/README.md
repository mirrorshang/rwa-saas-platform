# V/M 投资者平台 PC Web Mock 原型

基于已批准的 V/M UI-Ready PRD 和 DEV-01R 橙黑极简视觉，在一个 React 前端中演示 V 单 Issuer 平台与 M 多 Issuer 市场。所有身份、钱包、认购、付款、登记、Token、收益和客服结果均为本机 Mock；不会连接真实后端、钱包、KYC、链上交易或资金服务。

## 快速运行

需要 Node.js 20 或更新版本以及 pnpm 10.34.9。依赖版本由 pnpm-lock.yaml 锁定。在本目录执行：

~~~powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm build
pnpm dev
~~~

默认本地入口是 http://127.0.0.1:5173；若端口占用，以 Vite 输出为准。生产构建可用 pnpm exec vite preview --host 127.0.0.1 预览。本仓库不提交 node_modules 或 dist。

2026-11-26 DEV-07 已在 D 盘全新目录用 pnpm 10.34.9 和独立下载的 21 个依赖完成 --frozen-lockfile --ignore-scripts 安装、类型检查、27 项测试和生产构建。该目录没有复用原型项目的 node_modules 链接。安装方式、浏览器结果与限制见 qa/DEV-07-ACCEPTANCE.md。

## 入口与页面

- /m：M 平台首页；仅公开有效 Listing。
- /v/harbor、/v/cedar：V 海岚、杉衡企业入口；各自仅显示对应 Issuer 的项目或展示模板。
- 各渠道的 /opportunities、/opportunities/:offeringId、/issuers/:issuerSlug：投资机会、详情和企业信息。
- /account 及 /profile、/kyc、/wallets、/security、/tickets：账户 Mock。
- /subscribe/:offeringId/quote|documents|payment|progress：四步认购。文件含可阅读的最小 Mock 正文；确认不构成电子签署。付款、配售、法定登记和 Token 交付分别推进。
- /investments?tab=orders|holdings|returns：本人订单、法定持仓、收益与债权本金；详情从列表进入。
- /support、/messages、/disclosures：客服工单、通知、公告与披露 Mock。/terms、/privacy 目前为演示占位页。
- /demo：独立 Mock 控制台，只供开发验收直接访问，V/M 正常导航与页脚不提供入口。

所有账户、订单、工单和收益事件按账户及 V/M 渠道隔离；同一 Offering 的 V/M Mock 容量共用。M 直接访问无有效公开 Listing 的项目或企业时显示受控空态。展示模板不等于可投资 Offering。

## 演示路径

1. 从 M 或 V 首页进入有效项目，打开详情并检查权益、最低认购额、状态和风险。
2. 在对应渠道 /account 使用页面给出的 Mock 验证码登录；首次建号后 MPC 显示创建中，KYC 显示未开始。KYC 申请不会自动通过。
3. 到 /demo 选择当前账户渠道，模拟 KYC 已通过及 MPC 就绪，或在钱包页查询原 MPC 操作；返回项目进入认购。
4. 确认份数、展开并逐份阅读 Mock 文件、创建待付款订单；选择付款钱包与 Token 接收地址，模拟 OP Mainnet USDT 付款并分别推进配售、登记和交付。
5. 在“我的投资”查看本人订单和持仓。收益事件仅能由 /demo 对已登记且无未决异常的本人持仓创建；Claim、Push 与外部付款仅为分开的 Mock 场景，不能视为已批准的统一支付规则。
6. 在 /demo 切换付款失败、未知、异常、退款及客服状态，返回订单和工单核对。可切回“未登录 · 正常项目”复原页面场景；这不会清除本机账户或订单数据。若要重置全部演示记录，使用浏览器开发工具清除本站 localStorage 与 sessionStorage。

## 验收与限制

各阶段实测记录、截图和脚本位于 qa/；DEV-07 汇总见 qa/DEV-07-ACCEPTANCE.md。持仓登记与 Token 余额独立；本金偿还不计入收益。所有金额、文件、账户及业务状态均为演示资料，不构成真实发行、投资建议、法律签署、付款或收益承诺。真实服务接入与待决产品规则详见最终交接 PRD。