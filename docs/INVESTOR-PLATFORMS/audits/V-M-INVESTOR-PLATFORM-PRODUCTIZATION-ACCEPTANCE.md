# V/M 投资者平台产品化整改验收

状态：待产品负责人审核。分支与 PR 均为 Draft，未合并。
验收日期：2026-11-27
验收方式：源码核对 + 自动化测试 + 真实浏览器逐页采集与真实点击。

| 项目 | 值 |
| --- | --- |
| 基线 | PR #17 `b4fc70db4d76dfa3559884b58e35ecb7d3fd1f6d` |
| 审计依据 | PR #18 `f08389df5981592731c5868ba3854477857dfa5d`（A～I 节） |
| 工作分支 | `feat/vm-investor-platform-productization` |
| 工作树 | `.worktrees/vm-investor-platform-productization` |
| 前置安全修复 | DEV-09 分支 `fix/vm-post-investment-safety-dev09` / PR #19 |
| 本报告截图 | 62 张，全部为本轮同一浏览器会话采集 |

## 0. 结论

- 三项 FAIL（连点重复请求、异常持仓仍可领取、本金无依据可标记已付）已修复，业务函数内复核，页面按钮只是第二道提示。
- 自动化测试 64 项全部通过，0 失败、0 跳过；`tsc --noEmit` 与 `vite build` 均成功。
- 浏览器覆盖 52 个页面与 20 个交互场景，横向溢出 0、控制台错误 0、公开页面开发术语泄漏 0。
- 未验证项 9 条，集中在生产服务接入、移动端、跨浏览器、无障碍与两项产品尚未批准的业务规则。未验证不等于通过。
- 页面渲染层面 0 FAIL。真实资金、真实认证、真实登记一律没有接入，页面统一显示“待核实/尚未开放”。

## 1. 范围与边界

本轮只做投资者平台的产品化整改与审计验证：

- 不修改 PR #17、PR #18，不合并、不关闭任何 PR。
- 不修改冻结 PRD、DEC、Issuer SaaS、官网、Platform Admin。
- 不接入真实支付、钱包、KYC、合约、登记与收益支付。
- 不新设业务规则：Claim 失败重试规则、跨事件本金去重、法定本金映射均未实现，缺数据一律显示待核实。
- 普通投资者页面不出现 Mock、DEV、状态枚举、request ID、调试入口；上述内容只存在于 `/demo` 隔离开关后的路径。

## 2. 变更文件

修改 12 个文件（+390 / −175 行），新增 3 个路径。

| 文件 | 改动 |
| --- | --- |
| `apps/investor-portal/src/postInvestment.ts` | 同步领取锁、领取资格复核、Mock 本金依据账本、本金支付校验 |
| `apps/investor-portal/src/PostInvestmentPage.tsx` | 本金核对区读取真实依据、拒绝原因外显、公开文案去除 Mock 前缀 |
| `apps/investor-portal/src/postInvestmentSafety.test.mjs` | 新增 37 项安全测试 |
| `apps/investor-portal/src/postInvestment.test.mjs` | 适配本金独立账本，补充本金不计入收益的断言 |
| `apps/investor-portal/src/redesign.tsx` | 权益四格链、只展示有效上架项目、V 待开放分区、去 Token 术语、异常状态文案 |
| `apps/investor-portal/src/redesign.css` | `.card-grid-single`、`.rights-chain`、`.rights-note` |
| `apps/investor-portal/src/SubscriptionPage.tsx` | 公开路径说明页、Step 4“接下来可以做什么”入口 |
| `apps/investor-portal/src/OrdersPage.tsx` | 订单状态文案转公开表述、账户范围表述 |
| `apps/investor-portal/src/AccountPage.tsx` | 无账号时显示“服务暂不可用”；模拟认证与钱包操作只在 `?demo=1` 出现 |
| `apps/investor-portal/src/InvestorContentPage.tsx` | 披露列表与文件页改用项目标题，去除 offering.id 展示 |
| `apps/investor-portal/src/legalDocs.ts` | 文件正文去除 Token/Offering，改为“份额/项目” |
| `apps/investor-portal/src/data.ts` | 企业简介去除 Mock 字样 |
| `apps/investor-portal/package.json` | `test` 脚本纳入 `postInvestmentSafety.test.mjs` |
| `docs/INVESTOR-PLATFORMS/audits/` | 本报告、62 张截图、`run-log.json` |
| `.audit-prod/drive.mjs` | 浏览器采集脚本（可复现证据） |

## 3. 三项缺陷（另含 F04、F05）

### F01 快速连点生成两个 request ID

原始表现：同一可领取事件快速连点两次，产生两个不同 request ID，后一个覆盖前一个；刷新页面后 processing 状态丢失。
根本原因：领取入口只依赖 React 异步状态与按钮 disabled，两次点击读到同一快照；写入时直接覆盖 `requestId`，没有“已存在请求”的判定；页面刷新后不重读持久化状态。
修复：
- `postInvestment.ts:116-120` 模块级同步锁 `activeClaimOperations`，按键为“渠道 + 事件 ID”，在 `finally` 中释放。
- `postInvestment.ts:117-131` `startMockClaim` 每次从本地存储重读事件与订单，再调用资格检查；不再信任调用方传入的快照。
- `postInvestment.ts:108` 事件已有 `requestId` 时直接拒绝，不覆盖也不新建。
- 资格检查失败时返回原记录，状态保持 claimable，不写任何新请求。
现行规则：一个事件同时最多存在一个有效领取请求；processing 不能重复发起；已有请求只能查询原记录；失败或未知状态不自动重试（重试规则未获产品批准，本轮不设计）。
证据：自动化 10 项（正常领取、连点、重入、processing、刷新恢复、ID 不被覆盖、4 种状态不重试）；截图 `44-claim-rapid-double-click`、`45-claim-processing-after-reload`、`62-claim-processing-1440`；本轮 request ID `685fe669-9abb-442d-9aa0-794f47268588`，两次点击后仍为同一个。

### F02 异常持仓仍可领取已有可领取事件

原始表现：持仓转为履约异常或退款待核后，此前创建的可领取事件仍能发起 Claim。
根本原因：只有按钮 disabled，实际领取函数没有复核来源订单。
修复：
- `postInvestment.ts:103-111` `claimBlockReason` 统一复核：账户与渠道归属、订单与事件的项目匹配、付款为 matched、法定登记为 confirmed、无未决异常与退款、金额有效、请求不存在、事件为 claimable。
- `postInvestment.ts:124-127` 领取时重新读取订单与项目，不依赖页面持有的旧对象。
- `PostInvestmentPage.tsx:93` 事件详情页显示具体拒绝原因。
- 客服工单状态不参与金融资格判断，工单关闭不会恢复领取资格。
现行规则：任何未决履约异常、退款审核、退款处理、退款已确认、付款失败或未知、登记未确认、他人账户或他人渠道，均禁止领取；异常解除后按当时的订单状态重新判断，不改写历史事件。
证据：自动化 13 项（10 种持仓变更、工单关闭、他人账户、无效金额）；截图 `46-claim-blocked-exception`、`47-distribution-blocked-detail`、`48-claim-restored-after-clear`；异常期间事件保持 claimable 且无 request ID，解除后生成新 ID `73c6a4e9-52d6-40b1-9b29-4572212be7dc`。

### F03 债权本金缺少依据仍可标记已支付

原始表现：本金事件没有有效剩余本金依据也能进入 paid；认购金额或底层合同金额被当作当前未偿本金。
根本原因：本金与收益共用通用状态切换函数，没有独立的本金账本与余额校验。
修复：
- `postInvestment.ts:41-64` 新增 Mock 本金依据：对应债权、原始债权来源、测试本金、已偿还、剩余本金、本次偿还、核对时点、`mock` 标记；写入与读取均做合法性校验。
- `postInvestment.ts:143-164` `payMockPrincipal` 为唯一本金支付入口：校验依据归属、账面已付与依据一致、金额为正、不得超过剩余本金、同一事件重复支付不累计。
- `postInvestment.ts:138` 通用状态切换对本金事件禁用 paid，防止绕过余额校验。
- `PostInvestmentPage.tsx:27-44` 本金核对区展示依据字段与“本地示例依据，非法定确认”状态。
现行规则：本金与利息分开核算；认购金额不等于法定本金；无依据、依据损坏、依据属他人、超出剩余本金一律拒绝并显示待核实；同一事件重复标记不重复累计。
证据：自动化 9 项（无依据、有效部分偿还、超额、重复、伪造状态、无依据的已付记录降级为待核实、7 类损坏依据、本金独立汇总）；截图 `56-principal-partial-repayment`、`57-principal-repeat-same-event`、`58-principal-over-repayment-rejected`、`59-principal-without-basis-rejected`、`61-principal-detail-after-repayment`；账面 300.00 → 已偿 50.00 → 剩余 250.00，重复执行后数值不变。

### F04 未知与失败状态

规则：processing、paid、unknown、failed 四种状态均不自动生成新请求，原 request ID 保留。自动化 4 项覆盖；页面不提供“重试”按钮，避免在产品未批准前制造规则。

### F05 本金信息展示

本金详情页按依据展示关联债权、原始债权来源、示例本金、已偿还、剩余本金、本次偿还、核对时点与依据状态；无依据时全部为待核实，并明确“非法定确认”。截图 `61`。

## 4. UX 整改对照

| 编号 | 要求 | 结果 | 证据 |
| --- | --- | --- | --- |
| UX-01 | 模板与有效项目分区，模板不提供报价与认购 | 已完成 | V 首页分“当前公开项目”；M 仅列 active；待开放资产只在说明区出现（`50`）；模板详情无认购入口（`49`） |
| UX-02 | 账户、KYC、钱包不伪装真实服务 | 已完成（页面级） | 未登录显示“服务暂不可用”（`13`、`53`）；KYC 无 `?demo=1` 时没有提交按钮（`15`）；钱包页明确“真实钱包服务尚未开放”（`16`） |
| UX-03 | 权益解释口径一致 | 已完成 | 详情“权益与收益安排”四格：项目、份额、金额、合同权益；声明份额记录不等于股东身份（`05`，日志 `rightsChain=true`） |
| UX-04 | 认购结果页给出后续动作 | 已完成 | Step 4 增加“接下来可以做什么”，含订单、持仓、支持三个入口（`22`、`26`） |
| UX-05 | M/V 首页定位区分 | 已完成 | M“浏览不同企业的资产项目”；V“探索本企业的资产项目”（`02`、`08`、`09`） |
| UX-06 | 桌面 1280/1440/1920 网格无溢出 | 已完成 | 三档首页与列表全部 `overflow=0`（`01`、`02`、`03`、`11`、`12`、`54`、`55`） |
| UX-07 | 经济信息按权益类型展示 | 部分完成 | 债权显示利率与分配依据，股权显示决议与利润口径；未知字段显示待核实，未推算 |
| UX-08 | 去未经证实的宣传与图片误导 | 已完成 | 首页删除“合规、透明、可追溯”类表述；配图统一标注“仅作示意” |
| UX-09 | 全站产品语言 | 已完成（公开路径） | 公开页无 Token、Offering、Mock、DEV、枚举值、request ID；文件正文改为“份额/项目”（`37`）；4 个 `/demo` 页保留 `SUBSCRIPTION · MOCK` 隔离标识，属设计内 |

## 5. 页面逐页判定（28 类 / 52 个页面）

| # | 页面类 | 路径 | 截图 | 判定 |
| --- | --- | --- | --- | --- |
| 1 | M 首页 | `/m` | 01 / 02 / 03 | PASS |
| 2 | V 首页（海岚、杉衡） | `/v/harbor`、`/v/cedar` | 08 / 09 | PASS |
| 3 | 分类与列表 | `/m/opportunities`、`/v/harbor/opportunities` | 04 / 10 / 11 / 12 | PASS |
| 4 | 项目详情（住宅、债权） | `/m/opportunities/residence-01`、`/m/opportunities/debt-01` | 05 / 06 / 54 / 55 | PASS |
| 5 | 企业资料 | `/m/issuers/cedar` | 07 | PASS |
| 6 | 登录（服务关闭） | `/m/account` | 13 | PASS |
| 7 | 账户概览 | `/m/account?demo=1` | 14 | PASS（演示隔离） |
| 8 | 基本资料 | `/m/account/profile` | 17 | PASS |
| 9 | 钱包 | `/m/account/wallets` | 16 | PASS（真实服务未开放） |
| 10 | 安全与退出 | `/m/account/security` | 18 | PASS |
| 11 | 认购第 1 步 | `/m/subscribe/residence-01/quote` | 19 | PASS |
| 12 | 认购第 2 步 | `/m/subscribe/residence-01/documents` | 20 | PASS |
| 13 | 认购第 3 步 | `/m/subscribe/residence-01/payment` | 21 | PASS |
| 14 | 认购第 4 步 | `/m/subscribe/residence-01/progress` | 22 | PASS |
| 15 | 订单列表 | `/m/investments?tab=orders` | 27 | PASS |
| 16 | 订单详情 | `/m/investments/orders/mock-prod-debt-order` | 28 | PASS |
| 17 | 持仓列表 | `/m/investments?tab=holdings` | 29 | PASS |
| 18 | 持仓详情 | `/m/investments/holdings/mock-prod-debt-order` | 30 | PASS |
| 19 | 收益与本金汇总 | `/m/investments?tab=returns` | 31 | PASS |
| 20 | 收益事件详情 | `/m/investments/returns/prod-interest-1` | 32 / 62 | PASS |
| 21 | 本金事件详情 | `/m/investments/returns/prod-principal-1` | 33 / 61 | PASS |
| 22 | 消息列表 | `/m/messages` | 34 | PASS |
| 23 | 消息详情 | `/m/messages/order%3Amock-prod-debt-order-2` | 35 | PASS |
| 24 | 公告与披露 | `/m/disclosures` | 36 | PASS |
| 25 | 文件详情 | `/m/disclosures/residence-01/0` | 37 | PASS |
| 26 | 公告详情 | `/m/disclosures/announcements/residence-material-index` | 38 | PASS |
| 27 | 条款与隐私 | `/m/terms`、`/m/privacy` | 41 / 42 | PASS |
| 28 | 空、加载、错误、权限态 | 见说明 | 43 / 49 / 50 / 51 / 52 / 53 | PASS |

第 28 类包含：不存在的项目（404 文案）、待开放资产详情、无公开项目空态、加载态、错误态、未登录访问受保护子页（回到登录页）。每一页均检查横向溢出、开发术语泄漏与控制台错误。

## 6. 三条旅程

| 旅程 | 步骤 | 结果 |
| --- | --- | --- |
| A 发现到权益与风险 | 首页 → 列表 → 住宅详情 → 权益四格 → 披露 → 文件正文 → 条款 | PASS。页面可返回，权益口径一致，文件页声明不构成法律签署 |
| B 登录到认购 | 未登录账户页 → 演示登录四步 → 付款 → 进度 | 演示链路 PASS；真实登录、真实 KYC、真实付款 NOT VERIFIED（服务未接入） |
| C 投后 | 订单 → 持仓 → 收益与本金 → 领取 → 消息 → 客服 | PASS，含连点、刷新、异常持仓、本金偿还四类操作 |

说明：本轮以逐页加载真实路由加关键交互真实点击的方式取证；页面之间的链接地址与返回行为已核对，未对每一条旅程做人工逐字填写（真实表单服务不存在）。

## 7. KYC 专项

- 未登录访问 `/m/account/kyc` 会回到账户入口，不展示认证表单（截图 `53`）。
- 已登录但非演示模式：只显示当前记录、说明与“当前暂无可提交的认证申请”，没有提交按钮（截图 `15`）。
- 演示模式下才出现“模拟认证申请”，且按钮文案不承诺通过；提交后状态为认证中，不会自动变为已通过。
- 认购前置条件仍是 KYC 已通过，未通过时第 2 步按钮禁用并给出原因。
- 真实 KYC Provider、证件上传、结果回跳均未接入，标为 NOT VERIFIED。

## 8. 自动化测试

命令（项目未安装 pnpm，按实际配置执行等价命令）：

```
node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs \
  src/orders.test.mjs src/postInvestment.test.mjs src/postInvestmentSafety.test.mjs
```

结果：64 项，通过 64，失败 0，跳过 0，耗时约 0.38 秒。

| 模块 | 数量 | 覆盖内容 |
| --- | --- | --- |
| domain | 11 | 路由与渠道范围、资产分类、六类模板映射、排序、权益口径、金额精度、企业资料可见性、草稿隔离、第 4 步不推断前序完成 |
| account | 4 | 验证码校验与一次性、跨渠道邮箱隔离、MPC 与默认钱包前置条件、KYC 提交与回跳 |
| subscription | 4 | 文件正文语义、下单前置条件、四阶段独立、失败与未知付款不推断配售 |
| orders | 4 | 订单与详情范围、付款失败/回滚/未知/退款区分、工单校验、工单不改变金融状态 |
| postInvestment | 4 | 持仓需本人登记、分配类型随权益、状态互斥且本金不计收益、披露与消息的历史范围 |
| postInvestmentSafety | 37 | 见下 |

### 8.1 领取（10）

1. 正常领取只产生一个请求并进入 processing
2. 快速重复点击只保留第一个请求
3. 请求创建过程中的重入被同步锁拒绝
4. processing 状态不能再次创建请求
5. 刷新后从存储恢复 processing
6. 已有请求 ID 不被后续尝试覆盖
7-10. processing、paid、unknown、failed 四种状态均不发出未经批准的新请求

### 8.2 持仓资格（13）

1. 履约异常
2. 退款审核中
3. 退款处理中
4. 退款已确认
5. 付款未知
6. 付款失败
7. 登记未知
8. 登记未确认
9. 他人账户
10. 他人渠道
11. 仅关闭客服工单不恢复资格
12. 金额无效或非正数不进入 processing
13. 他人账户的可领取事件不能领取

### 8.3 本金（14）

1. 无本金依据时拒绝标记已支付
2. 有效依据下允许偿还并正确累计
3. 超过剩余本金被拒绝
4. 同一事件重复标记不重复累计
5. 通用状态切换不能伪造已支付
6. 已支付但缺依据的记录降级为待核实
7-13. 七类损坏依据被拒：核对时点非法、Mock 标记缺失、剩余本金为负、余额不相等、金额非整数、债权来源为空、依据绑定到其他订单
14. 本金还款不计入收益汇总，单独统计

## 9. 浏览器实测

环境：真实 Chrome（headless，独立用户目录），CDP 驱动，桌面视口 1280×900、1440×1000、1920×1080，设备像素比 1；本地 Vite `127.0.0.1:5189`。

采集结果：52 个页面，横向溢出 0，控制台错误 0，公开路径开发术语泄漏 0。4 个 `/demo` 演示页保留 `SUBSCRIPTION · MOCK` 标识，属于隔离设计，不计为泄漏。

| # | 场景 | 预期 | 实际 | 判定 |
| --- | --- | --- | --- | --- |
| 1 | M 首页 1280/1440/1920 | 三档无溢出、内容完整 | 均正常，溢出 0 | PASS |
| 2 | V 两个企业首页 | 只列本企业项目，待开放分区 | 海岚、杉衡均符合 | PASS |
| 3 | 列表三档 | 卡片排列正常、筛选可用 | 1280/1440/1920 均正常 | PASS |
| 4 | 住宅与债权详情 | 权益四格、风险提示、无认购误导 | 四格齐全，声明份额不等于股东身份 | PASS |
| 5 | 未登录账户页 | 不提供假验证码或假登录 | 显示“服务暂不可用” | PASS |
| 6 | 未登录访问 KYC | 回到账户入口 | 返回登录说明页，无表单 | PASS |
| 7 | KYC 页（非演示） | 说明服务未接入，无提交按钮 | 符合 | PASS |
| 8 | 钱包页 | 不展示可用私钥或真实地址 | 明确服务未开放，地址标示例 | PASS |
| 9 | 认购四步（公开） | 只做说明，不创建订单 | 四步说明一致，Step 4 给出去向 | PASS |
| 10 | 认购四步（演示） | 隔离标识、四阶段独立 | 显示 MOCK 标识，进度不互相推断 | PASS |
| 11 | 认购完成页 | 给出订单、持仓、支持入口 | 三个入口均在 | PASS |
| 12 | 订单、持仓、收益 | 归属当前账户与渠道 | 列表与详情一致 | PASS |
| 13 | 连点 Claim | 只产生一个请求 | 单一 ID `685fe669-9abb-442d-9aa0-794f47268588`，提示查询原请求 | PASS |
| 14 | 领取后刷新 | 保持 processing 与原 ID | 状态与 ID 均不变 | PASS |
| 15 | 异常持仓后领取 | 拒绝且不产生请求 | 事件仍 claimable、无 ID，提示“分配资格待核实” | PASS |
| 16 | 异常解除后领取 | 重新按当时状态判断 | 可领取，生成新 ID `73c6a4e9-52d6-40b1-9b29-4572212be7dc` | PASS |
| 17 | 本金部分偿还 | 300.00 → 已偿 50.00 → 剩余 250.00 | 一致 | PASS |
| 18 | 同一事件重复标记 | 不重复累计 | 数值保持 50.00 / 250.00 | PASS |
| 19 | 超过剩余本金 | 拒绝 | 提示超过剩余本金，状态不变 | PASS |
| 20 | 无本金依据 | 拒绝，显示待核实 | 提示缺少有效依据 | PASS |
| 21 | 利息与本金独立 | 利息状态不影响本金账 | 利息 processing，本金账不变 | PASS |
| 22 | 空、加载、错误、404、权限态 | 有明确文案与返回入口 | 全部符合 | PASS |

浏览器实测中未出现 FAIL。

## 10. 未验证事项

以下 9 条在本轮无法证明，标为 NOT VERIFIED，不计入通过：

1. 真实支付与链上交易：未接入，页面只做说明。
2. 真实钱包连接与签名：未接入，示例地址不代表持有权。
3. 真实 KYC Provider、证件上传与结果回跳：未接入。
4. 法定登记与权益凭证交付：无数据源，全部待核实。
5. 收益与本金真实到账：本地记录，不产生资金流。
6. 移动端与平板视口：本轮只覆盖桌面 1280/1440/1920。
7. Firefox、Safari 跨浏览器：本轮只测 Chrome。
8. 键盘操作与读屏专项：做了语义标签检查，未做完整无障碍走查。
9. 领取失败后的重试规则：产品未批准，本轮只保证不自动生成新请求，重试流程无法验证。

另有两项属于明确禁止范围，不实现也不验证：法定本金映射、跨事件本金去重。

## 11. 截图索引

目录：`docs/INVESTOR-PLATFORMS/audits/productization/`，共 62 张，均来自本轮同一会话。

首页与列表

- `01-m-home-1280.png` M 首页 1280
- `02-m-home-1440.png` M 首页 1440
- `03-m-home-1920.png` M 首页 1920
- `04-m-opportunities-1440.png` M 列表 1440
- `05-residence-detail-1440.png` 住宅详情
- `06-debt-detail-1440.png` 债权详情
- `07-issuer-company-1440.png` 企业资料
- `08-v-harbor-home-1440.png` V 海岚首页
- `09-v-cedar-home-1440.png` V 杉衡首页
- `10-v-harbor-opportunities-1440.png` V 海岚列表
- `11-m-opportunities-1280.png` M 列表 1280
- `12-m-opportunities-1920.png` M 列表 1920

账户与认购

- `13-login-service-closed-1440.png` 未登录账户页
- `14-account-overview-1440.png` 账户概览（演示）
- `15-kyc-1440.png` KYC
- `16-wallets-1440.png` 钱包
- `17-profile-1440.png` 基本资料
- `18-security-1440.png` 账户安全
- `19-subscribe-quote-public-1440.png` 认购第 1 步（公开）
- `20-subscribe-documents-public-1440.png` 认购第 2 步（公开）
- `21-subscribe-payment-public-1440.png` 认购第 3 步（公开）
- `22-subscribe-progress-public-1440.png` 认购第 4 步（公开）
- `23-subscribe-quote-demo-1440.png` 认购第 1 步（演示）
- `24-subscribe-documents-demo-1440.png` 认购第 2 步（演示）
- `25-subscribe-payment-demo-1440.png` 认购第 3 步（演示）
- `26-subscribe-progress-demo-1440.png` 认购第 4 步（演示）

投后与内容

- `27-orders-1440.png` 订单列表
- `28-order-detail-1440.png` 订单详情
- `29-holdings-1440.png` 持仓列表
- `30-holding-detail-1440.png` 持仓详情
- `31-returns-1440.png` 收益与本金
- `32-distribution-interest-1440.png` 债权利息事件
- `33-distribution-principal-1440.png` 债权本金事件
- `34-messages-1440.png` 消息列表
- `35-message-detail-1440.png` 消息详情
- `36-disclosures-1440.png` 公告与披露
- `37-disclosure-document-1440.png` 文件详情
- `38-announcement-1440.png` 公告详情
- `39-support-1440.png` 客服表单
- `40-ticket-detail-1440.png` 工单详情
- `41-terms-1440.png` 使用条款
- `42-privacy-1440.png` 隐私政策
- `43-not-found-1440.png` 不存在项目

关键交互

- `44-claim-rapid-double-click.png` 连点领取后单一请求
- `45-claim-processing-after-reload.png` 刷新后 processing 恢复
- `46-claim-blocked-exception.png` 异常持仓拒绝领取
- `47-distribution-blocked-detail.png` 事件详情页显示拒绝原因
- `48-claim-restored-after-clear.png` 异常解除后恢复领取
- `56-principal-partial-repayment.png` 本金部分偿还
- `57-principal-repeat-same-event.png` 同一事件重复执行不累计
- `58-principal-over-repayment-rejected.png` 超额偿还被拒
- `59-principal-without-basis-rejected.png` 无依据拒绝
- `60-interest-principal-independent.png` 利息与本金独立
- `61-principal-detail-after-repayment.png` 本金详情页依据
- `62-claim-processing-1440.png` 领取申请详情

状态与视口

- `49-state-upcoming-detailed-1440.png` 待开放资产详情
- `50-state-no-listings-1440.png` 无公开项目
- `51-state-loading-1440.png` 加载态
- `52-state-error-1440.png` 错误态
- `53-state-guest-protected-1440.png` 未登录访问受保护页
- `54-residence-detail-1280.png` 住宅详情 1280
- `55-residence-detail-1920.png` 住宅详情 1920

## 12. 复现方式

```
# 类型检查与构建
cd apps/investor-portal
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build

# 自动化测试
node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs \
  src/orders.test.mjs src/postInvestment.test.mjs src/postInvestmentSafety.test.mjs

# 本地启动与截图采集
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5189 --strictPort
node .audit-prod/drive.mjs
```

采集脚本会清空本地存储后写入种子数据（账号 `product.audit@rwa.test`、订单 `mock-prod-debt-order`、事件 `prod-interest-1` 与 `prod-principal-1`），再逐页加载并截图；`run-log.json` 记录每页路径、标题、溢出、术语检查与控制台错误。

## 13. 交付状态

- 分支：`feat/vm-investor-platform-productization`
- PR：[#20](https://github.com/mirrorshang/rwa-saas-platform/pull/20) `Improve: V/M Investor Platform Productization and Audit Remediation`，Draft / Open / Unmerged
- PR #17、PR #18、PR #19 均未修改、未合并。
- 等待产品负责人审核，不进入下一阶段。
