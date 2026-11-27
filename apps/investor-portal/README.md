# V/M 投资者平台 PC Web Mock 原型

基于已批准的 V/M UI-Ready PRD 和 DEV-01R 橙黑极简视觉，在一个 React 前端中演示 V 单 Issuer 平台与 M 多 Issuer 市场。身份、钱包、认购、付款、法定登记、份额凭证、收益和客服结果均为本机 Mock；不会连接真实后端、钱包、KYC、链上交易或资金服务。

## 快速运行

需要 Node.js 20 或更新版本。包管理器为 pnpm，依赖版本由 pnpm-lock.yaml 锁定。在本目录执行：

~~~powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm build
pnpm dev
~~~

默认本地入口是 http://127.0.0.1:5173；若端口占用，以 Vite 输出为准。生产构建可用 `pnpm exec vite preview --host 127.0.0.1` 预览。本仓库不提交 node_modules 或 dist。

当前验收环境未安装 pnpm（Corepack 缺少 pnpm.js）。2026-11-27/28 的产品化验收直接调用已安装依赖，与上述脚本等价：

~~~powershell
node node_modules/typescript/bin/tsc --noEmit
node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs `
  src/orders.test.mjs src/postInvestment.test.mjs src/postInvestmentSafety.test.mjs
node node_modules/vite/bin/vite.js build
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5189 --strictPort
~~~

结果：64 项测试全部通过（0 失败、0 跳过），类型检查与生产构建成功。证据、截图与复现步骤见 [产品化验收报告](../../docs/INVESTOR-PLATFORMS/audits/V-M-INVESTOR-PLATFORM-PRODUCTIZATION-ACCEPTANCE.md)；DEV-07 的安装与浏览器记录见 qa/DEV-07-ACCEPTANCE.md。

## 入口与页面

- /m：M 平台首页；仅公开有效 Listing。
- /v/harbor、/v/cedar：V 海岚、杉衡企业入口；各自仅显示对应 Issuer 的项目或展示模板。
- 各渠道的 /opportunities、/opportunities/:offeringId、/issuers/:issuerSlug：投资机会、详情和企业信息。
- /account 及 /profile、/kyc、/wallets、/security、/tickets：账户、认证、钱包、安全与工单记录。
- /subscribe/:offeringId/quote|documents|payment|progress：四步认购。文件含可阅读的最小 Mock 正文；确认不构成电子签署。付款、配售、法定登记和份额凭证交付分别推进。
- /investments?tab=orders|holdings|returns：本人订单、法定持仓、收益与债权本金；详情从列表进入。
- /support、/messages、/disclosures：客服工单、通知、公告与披露资料。/terms、/privacy 为演示占位页。
- /demo：独立 Mock 验收控制台，只供开发验收直接访问，V/M 正常导航与页脚不提供入口。

所有账户、订单、工单和收益事件按账户及 V/M 渠道隔离；同一 Offering 的 V/M Mock 容量共用。M 直接访问无有效公开 Listing 的项目或企业时显示受控空态。展示模板不等于可投资 Offering。

## 公开页面与演示隔离

- 普通投资者页面不显示 Mock、DEV、内部状态枚举、request ID 和调试入口；订单与工单只显示 6 位参考编号，真实编号仅存在于本机存储与 URL。未接入的服务统一显示“尚未开放”“待核实”，不伪装成功。
- 账户页的模拟认证、平台钱包就绪、自有钱包绑定与默认钱包切换只在 `?demo=1` 出现；不带演示参数时只有状态说明，没有提交按钮。
- 退出登录、消息已读、披露文件查看与下载在任何模式可用，效果仅写入本机记录，不改变金融状态。
- Claim（领取）是隔离的演示动作，投资者页面只展示状态与核查入口；真实领取服务未接入。

## 投后与本金

收益与本金分开核算。债权本金必须已有显式标注的 Mock 测试本金依据（对应债权、原始债权来源、测试本金、已偿还、剩余本金、核对时点），否则显示待核实并拒绝标记已支付；认购金额与底层合同金额都不会被当作当前未偿本金。部分偿还按依据累计，超过剩余本金、依据损坏或依据属于他人时一律拒绝。本金偿还额不计入收益汇总。

## 演示路径

1. 从 M 或 V 首页进入有效项目，打开详情并检查权益、最低认购额、状态和风险。
2. 在对应渠道 /account 使用页面给出的演示验证码登录；首次建号后平台钱包显示创建中，认证显示未开始。认证申请不会自动通过。
3. 到 /demo 选择当前账户渠道，模拟认证已通过及平台钱包就绪，或在钱包页查询原 MPC 操作；返回项目进入认购。
4. 确认份数、展开并逐份阅读示例文件、创建待付款订单；选择付款钱包与份额凭证接收地址，模拟 OP Mainnet USDT 付款并分别推进配售、登记和交付。
5. 在“我的投资”查看本人订单和持仓。收益事件仅能由 /demo 对已登记且无未决异常的本人持仓创建；领取、直接支付与外部付款是分开的示例场景，不能视为已批准的统一支付规则。
6. 在 /demo 切换付款失败、未知、异常、退款及工单状态，返回订单和工单核对。工单关闭不会改变订单、付款、登记或退款事实。

## 验收与限制

各阶段实测记录、截图和脚本位于 qa/；下表为当前证据入口。

| 证据 | 位置 |
| --- | --- |
| 产品化整改与全站验收 | docs/INVESTOR-PLATFORMS/audits/V-M-INVESTOR-PLATFORM-PRODUCTIZATION-ACCEPTANCE.md |
| 本轮浏览器截图与运行日志 | docs/INVESTOR-PLATFORMS/audits/productization/ |
| 采集脚本 | .audit-prod/drive.mjs、.audit-prod/drive2.mjs |
| DEV-07 安装与综合验收 | qa/DEV-07-ACCEPTANCE.md |
| 交付工程师产品 PRD | docs/INVESTOR-PLATFORMS/V-M-DEV-08-FINAL-PRODUCT-PRD-20261127.md |

持仓登记与份额凭证余额独立；本金偿还不计入收益。所有金额、文件、账户及业务状态均为演示资料，不构成真实发行、投资建议、法律签署、付款或收益承诺。真实服务接入与待决产品规则详见最终交接 PRD。
