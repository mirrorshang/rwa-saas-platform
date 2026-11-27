# DEV-09 投后资金与领取安全修复验收报告

| 项目 | 内容 |
| --- | --- |
| 仓库 | `mirrorshang/rwa-saas-platform` |
| 工作分支 | `fix/vm-post-investment-safety-dev09` |
| 基线 | PR #17 HEAD `b4fc70db4d76dfa3559884b58e35ecb7d3fd1f6d` |
| 上游 PR | #17、#18 均保持 Draft / Open / Unmerged，本次未改动 |
| 验收日期 | 2026-11-27 |
| 运行环境 | Windows / Node v24.22.3 / Chrome 158.0.8127.37 / Vite 6.4.5 |
| 运行地址 | `http://127.0.0.1:5188`（干净 DEV-09 工作树，Mock 数据） |
| 测试账户 | `dev09.audit@rwa.test`（Mock）；订单 `mock-dev09-debt-order` |

## 1. 结论摘要

三项审计 FAIL 均已在源码、自动化测试和真实浏览器三层复核：

| 缺陷 | 修复状态 | 浏览器实测 | 说明 |
| --- | --- | --- | --- |
| DEV09-01 Claim 连点产生多个请求 ID | 已修复 | PASS | 双击只产生 1 个 requestId，刷新后保持 `processing` |
| DEV09-02 异常持仓仍可领取已有事件 | 已修复 | PASS | 业务函数内重新核验原订单，异常时拒绝并说明原因 |
| DEV09-03 债权本金无依据仍可标记已支付 | 已修复 | PASS | 无依据统一「待核实」并拒绝；有依据时按剩余本金累计校验 |

仍存在未解决或未验证事项，见第 8 节。本报告不把 Mock 行为等同于生产资金、法律或合规结论。

## 2. 原始缺陷表现（来自 PR #18 审计）

以下为 `docs/INVESTOR-PLATFORMS/audits/V-M-PC-WEB-UX-AUDIT-20261127.md` I 节在 PR #17 HEAD 上的实测记录，本次以其为修复输入。

### DEV09-01

对同一可领取债息事件快速连续点击「模拟发起领取」，浏览器写入两个不同请求 ID `a97bfef9-10a0-4e7b-86e3-afd974b0d14c` 与 `febccdfa-3a09-4cdf-9bca-f915cdd092eb`，后者覆盖前者，界面只保留后者。

根因：`claim` 回调读取的是 React state 里的旧 `item`，`beginMockClaim` 只做状态判断，没有同步互斥；两次点击在同一个事件循环内都通过检查并各自写入存储。

### DEV09-02

先创建 9 U 可领取债息，再把来源订单设为「履约异常，退款未核实」。持仓页提示「分配资格待核实」，但事件详情仍显示可领取，按钮可点，点击后转为 `processing` 并生成请求 ID。

根因：`beginMockClaim` 只接收 `item`，未重新核验关联订单；`holdingNeedsReview` 只用于创建事件和持仓页提示，未进入领取路径。

### DEV09-03

对已登记债权持仓创建 `principal` 事件后直接应用 `paid`：无本金依据也能标记已支付；600 U 事件被接受，累计已偿 850 U，页面没有应偿、已偿、未偿或部分偿还口径。

根因：本金与收益共用 `applyDemoDistributionState`，没有独立本金账本，也不存在可核对的 Mock 本金依据；认购金额被误当作可用上限的隐含参照。

## 3. 修复文件与内容

| 文件 | 修改内容 |
| --- | --- |
| `apps/investor-portal/src/postInvestment.ts` | 新增本金依据模型与校验；新增 `claimBlockReason`；新增模块级同步锁 `activeClaimOperations` 与 `startMockClaim`；新增 `payMockPrincipal`；收紧 `applyDemoDistributionState`；`readAllDistributions` 降级无效本金记录 |
| `apps/investor-portal/src/PostInvestmentPage.tsx` | 新增 `PrincipalSummary` 本金核对面板；领取前展示阻断原因并禁用按钮；Demo 控件接入本金依据、本金偿还与同步 Claim；新增稳定的测试用 `id` |
| `apps/investor-portal/src/postInvestment.test.mjs` | 适配 `beginMockClaim` 新签名；明确通用状态更新不能把本金置为 `paid` |
| `apps/investor-portal/src/postInvestmentSafety.test.mjs` | 新增 DEV-09 安全测试 41 项 |
| `apps/investor-portal/package.json` | `test` 脚本纳入新测试文件 |

### 3.1 Claim 同步锁与请求复用

`startMockClaim`（`postInvestment.ts:117`）的行为：

1. 以 `渠道基路径 + 事件 ID` 作为锁键，在模块级 `Set` 中同步占位；命中即返回「原领取请求正在处理」，不生成请求 ID。
2. 锁内从 `localStorage` 重新读取事件和原订单，重新构造持仓，再调用 `claimBlockReason` 复核。
3. 只有复核通过才调用 `beginMockClaim` 写入 `processing` 与 requestId；`finally` 释放锁。

由于锁是模块级同步结构，双击、回车连发、同一事件的两个按钮回调都只会有一个进入写入路径，不依赖 React 的异步 setState。已有 `requestId` 的事件由 `claimBlockReason` 拦截，不会被覆盖。`processing` 状态不提供任何重建请求的入口；`unknown` 也不生成新请求，符合「失败重试规则未获批准」的边界。

### 3.2 异常持仓复核

`claimBlockReason`（`postInvestment.ts:103`）按顺序检查：

1. 事件归属当前账户与当前渠道，且持仓订单、Offering、权益类型一致；
2. 原订单 `payment === 'matched'` 且 `registration === 'confirmed'`；
3. `holdingNeedsReview` 为假（履约异常、退款审核、退款处理中等未决状态）；
4. 毛额、扣项为有效整数，净额大于 0；
5. 不存在已有 `requestId`；
6. 本批方式为 `claim` 且状态为 `claimable`。

页面在事件详情用同一函数渲染原因并 `disabled` 按钮，实际领取仍在 `startMockClaim` 内二次校验，不依赖按钮状态。异常解除后不修改历史事件，只按当时订单状态重新判断。

### 3.3 独立本金依据与偿还

`MockPrincipalBasis`（`postInvestment.ts:36`）字段：对应债权与原始来源、Mock 测试本金、已偿还、剩余、最近一次偿还、核对时点，并带 `mock: true`。校验要求正数安全整数、`repaid + remaining === testPrincipal`、`lastRepayment <= repaid`、来源非空、核对时点可解析。

`payMockPrincipal`（`postInvestment.ts:143`）：

1. 事件必须是 `principal`，属于当前账户、渠道与 Offering，且 Offering 权益为债权；
2. 原订单付款、登记、异常状态重新核验；
3. 必须有与账户、渠道、Offering、订单一致的有效依据，否则返回「缺少有效 Mock 本金依据；本金待核实，不能标记已支付」；
4. 已付本金事件总额必须等于依据的 `repaidCents`，防止绕过账本直接改状态；
5. 同一事件已付且依据一致时幂等返回，不重复累计；
6. 扣项必须为 0，金额不得超过 `remainingCents`；
7. 成功后同时更新依据与事件，`principalBasisId` 绑定依据。

`applyDemoDistributionState`（`postInvestment.ts:134`）禁止：已付回退、带 requestId 回 `claimable`、本金通过通用路径置为 `paid`。`readAllDistributions` 对缺少匹配依据的历史已付本金记录统一降级为 `unknown`，避免旧数据继续显示为已核实。

页面新增「债权本金核对」面板，展示关联债权、来源、测试本金、已偿、剩余、本次金额、核对时点与依据状态；缺少依据时全部显示「待核实」，并明确「不代表真实法定本金」。

## 4. 修复后的业务规则

- 同一渠道同一收益事件最多存在一个有效 Mock 领取请求；处理中只查询原请求。
- 领取必须在业务函数内重新核验账户、渠道、订单、付款、法定登记与未决异常；按钮禁用只是提示。
- 工单关闭不改变订单金融状态，也不恢复领取资格。
- 本金偿还与收益事件分开记账；本金不计入投资收益汇总。
- 本金 `paid` 只能通过 `payMockPrincipal` 且必须存在有效 Mock 依据。
- 本金依据只按订单独立记录，不做跨事件去重，不推断多个事件是否属于同一法定偿还义务。
- 认购金额、底层借款合同原始金额均不作为本金依据或上限。

判断依据：`V-M-DEV-08-FINAL-PRODUCT-PRD-20261127.md` P11、第 8 节资金与履约、第 6 节异常与通信。PRD 明确「异常/退款待核持仓不应形成可支付资格」「处理中只能查询原请求」「本金偿还不得加进投资收益」，并要求本金单列应偿、已偿、未偿。PRD 未批准统一 Claim 重试规则，本次不实现重试。

## 5. 自动化测试

命令（与项目脚本等价，`pnpm` 在本机 Corepack 缺少 `pnpm.js`，改用 Node 直接执行）：

```
node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs \
  src/orders.test.mjs src/postInvestment.test.mjs src/postInvestmentSafety.test.mjs
```

| 项目 | 结果 |
| --- | --- |
| 测试总数 | 64 |
| 通过 | 64 |
| 失败 | 0 |
| 跳过 / 待办 | 0 / 0 |
| 新增安全测试 | 41 |
| 耗时 | 约 215 ms |

覆盖矩阵：

| 要求 | 用例 |
| --- | --- |
| 正常 Claim 一次 | `normal Claim creates exactly one request` |
| 快速连续点击 | `rapid repeated clicks create only the first request` |
| 同步重复调用 | `a reentrant call inside request creation is rejected by the synchronous lock` |
| processing 再次 Claim | `an event already in processing cannot create another request` |
| 刷新恢复 | `refreshing the page restores processing from storage` |
| 原请求不被覆盖 | `an existing request ID is never overwritten` |
| 失败/未知不新发请求 | `no unauthorized retry is issued from processing/paid/unknown/failed`（4 条） |
| 异常持仓拦截 | 履约异常、退款审核、退款处理中各一条，含「已有可领取事件」 |
| 工单关闭不恢复 | `closing a support ticket does not restore claim eligibility` |
| 跨账户事件 | `a claimable event owned by another account cannot be claimed` |
| 无依据不能 paid | `principal payment without a Mock basis is rejected` |
| 有效依据部分偿还 | `principal payment with a valid basis ... accumulates` |
| 超额拒绝 | `a repayment above the remaining principal is rejected` |
| 重复 paid 不累计 | `marking the same principal event paid twice does not double count` |
| 改状态绕过 | `principal paid state cannot be forged through the generic state update` |
| 旧记录降级 | `a paid principal record without a matching basis is shown as unknown` |
| 损坏依据 | 7 组：核对时点非法、无 mock 标记、剩余为负、余额不平、非整数、来源为空、绑定他单 |
| 本金/利息独立 | `principal repayment stays out of income totals`、`invalid claimable amount` |

## 6. 浏览器实测

环境：干净工作树启动 Vite，独立 Chrome 配置（CDP，headless），1440×1000；全程通过页面控件操作，未修改源码或存储注入业务数据。截图位于 [dev09](./dev09/)，步骤与结果同时记录在 `.audit-dev09/run-log.json`（临时文件，不提交）。

| # | 场景与操作步骤 | 预期（PRD / 修复规则） | 实际结果 | 判定 | 证据 |
| --- | --- | --- | --- | --- | --- |
| 1 | `/demo` 对债权持仓创建 `principal` 100 U 事件，直接选 `paid` 应用 | 无依据不得标记已付，显示待核实 | 提示「缺少有效 Mock 本金依据；本金待核实，不能标记已支付」，事件保持原状态 | PASS | [02](./dev09/02-principal-without-basis-rejected.png) |
| 2 | 建立 Mock 依据：来源 `QA-09 / 杉岸设备租赁 2026-01`，本金 300 U | 依据独立录入，显示应偿/已偿/剩余 | 300.00 / 0.00 / 300.00 U，标注 Mock | PASS | [03](./dev09/03-principal-basis-created.png) |
| 3 | 对 100 U 本金事件应用 `paid` | 允许偿还并累计 | 本次 100 U，已偿 100 U，剩余 200 U | PASS | [04](./dev09/04-principal-paid-partial.png) |
| 4 | 对同一事件再次应用 `paid` | 幂等，不重复累计 | 仍为 100 / 200 U | PASS | [05](./dev09/05-principal-repeat-no-double-count.png) |
| 5 | 新建 150 U 本金事件并应用 `paid` | 部分偿还继续累计 | 已偿 250 U，剩余 50 U | PASS | [06](./dev09/06-principal-second-payment.png) |
| 6 | 新建 60 U 本金事件并应用 `paid` | 超过剩余本金必须拒绝 | 提示「本次偿还金额超过 Mock 剩余本金」，依据仍为 250 / 50 U | PASS | [07](./dev09/07-principal-overpay-rejected.png) |
| 7 | 创建 8 U 债息 Claim 可领取事件，双击「执行 Mock Claim」 | 只产生一个请求 | 仅 1 个 requestId `8373c6f1-e06f-4cd3-8560-a12f51a0dc94`，状态 `processing` | PASS | [08](./dev09/08-claim-rapid-double-click.png) |
| 8 | 刷新页面并重新进入事件详情 | `processing` 与 requestId 恢复，不再展示领取入口 | 状态与 `8373c6f1-…` 均保留；可领取 0.00 U；按钮消失 | PASS | [09](./dev09/09-claim-processing-after-reload.png) · [10](./dev09/10-distribution-detail-processing.png) |
| 9 | 先建 12 U 可领取债息，再把订单设为「履约异常」后尝试领取 | 异常持仓不得形成可支付资格 | 拒绝：「原订单存在异常或退款待核状态，分配资格待核实，不能领取」；事件保持 `claimable` 且无 requestId | PASS | [11](./dev09/11-order-exception-applied.png) · [12](./dev09/12-claim-blocked-exception.png) · [13](./dev09/13-distribution-detail-blocked.png) |
| 10 | 清除异常后重新进入事件详情领取 | 按当时状态重新判断，不修改历史事件 | 复核通过，可领取并生成新请求 `c72acb58-7167-4701-91da-868599dd7278` | PASS | [14](./dev09/14-claim-restored-after-clear.png) |
| 11 | 打开收益与本金页 | 已付收益与已偿本金独立 | 已支付收益 0.00 U；已偿债权本金 250.00 U；标注「不计入投资收益」 | PASS | [15](./dev09/15-returns-summary.png) |
| 12 | 打开债权持仓详情 | 展示本金核对与依据状态 | 显示「债权本金核对」面板与 Mock 测试金额 | PASS | [16](./dev09/16-holding-principal-summary.png) |
| 13 | 打开 M 首页 1280 / 1440 / 1920 | 版式不溢出、不重叠 | 三档宽度均正常渲染 | PASS（视觉抽查） | [17](./dev09/17-m-home-1280.png) · [18](./dev09/18-m-home-1440.png) · [19](./dev09/19-m-home-1920.png) |
| 14 | 分别打开两个 V 企业首页 | 品牌与渠道隔离 | 海港、杉衡首页独立渲染 | PASS（视觉抽查） | [20](./dev09/20-v-harbor-home.png) · [21](./dev09/21-v-cedar-home.png) |
| 15 | 打开 M 投资机会列表 | 列表正常，不泄漏跨渠道项目 | 正常渲染 | PASS（视觉抽查） | [22](./dev09/22-m-opportunities.png) |

说明：第 5 步截图 05 与第 4 步截图 04 字节一致，因为重复执行未改变任何金额与核对时点，页面内容本就应当相同。该步的判定依据是 run-log 中金额保持 100 / 200 U、无新增事件，以及幂等单测；不以两张相同图片冒充状态变化。

补充说明：

- 领取后金额不会回到可领取：`distributionAmounts` 只在 `claimable` 计入可领；`processing` 与 `paid` 均为 0，`paid` 计入已实付。浏览器在第 8 步验证 `processing`，`paid` 分支由单测覆盖。
- 「领取失败后重试」未实现：模型没有 `failed` 状态，失败重试规则未获产品批准。`unknown` 不能盲发新请求，判定为 **NOT VERIFIED**，不计入 PASS。
- 浏览器控制台错误为空（`consoleErrors: []`）。

## 7. 工程质量检查

| 检查 | 命令 | 结果 |
| --- | --- | --- |
| 类型检查 | `tsc --noEmit` | PASS，退出码 0 |
| 测试 | `node --test`（6 个测试文件） | PASS，64/64 |
| 构建 | `vite build` | PASS，48 modules，约 1.0 s |
| 空白检查 | `git diff --check` | PASS（仅 CRLF 提示） |

## 8. 未解决事项与生产限制

1. **重试规则未定**：Claim 失败、Unknown 后的重试或撤单条件需产品与合规批准；本版只保证不重复发起。
2. **无跨事件本金去重**：不同事件是否对应同一法定偿还义务未建立规则，仍可能对同一笔真实债务生成多个 Mock 事件；需权威本金台账解决。
3. **无真实法定本金映射**：每 Token 名义本金、底层合同未偿余额、扣项与凭证均未接入；页面统一标注 Mock 与待核实。
4. **客户端存储可被篡改**：所有限制在 Mock 前端函数内生效；具备开发者工具的用户可改写 localStorage。生产必须由服务端与资金系统强制校验。
5. **并发范围**：同步锁只在单页面实例内有效；多标签页、多设备同时操作需服务端幂等键与唯一约束。
6. **真实支付未验证**：`processing` 只是 Mock 状态，没有支付回调、对账或到账凭证。
7. **视觉抽查范围**：首页三档宽度与两个 V 首页仅做基本渲染确认，未做逐像素视觉验收；PR #18 的完整视觉审计仍独立进行。

## 9. 截图索引

目录：[docs/INVESTOR-PLATFORMS/audits/dev09](./dev09/)

| 编号 | 文件 | 内容 |
| --- | --- | --- |
| 01 | `01-demo-console.png` | Demo 收益与本金控制台 |
| 02 | `02-principal-without-basis-rejected.png` | 无依据拒绝标记已付 |
| 03 | `03-principal-basis-created.png` | 建立 Mock 本金依据 |
| 04 | `04-principal-paid-partial.png` | 首次部分偿还 |
| 05 | `05-principal-repeat-no-double-count.png` | 重复执行不累计 |
| 06 | `06-principal-second-payment.png` | 二次部分偿还 |
| 07 | `07-principal-overpay-rejected.png` | 超额偿还拒绝 |
| 08 | `08-claim-rapid-double-click.png` | 连点后单一请求 |
| 09 | `09-claim-processing-after-reload.png` | 刷新后 processing |
| 10 | `10-distribution-detail-processing.png` | 事件详情处理中 |
| 11 | `11-order-exception-applied.png` | 订单异常设置 |
| 12 | `12-claim-blocked-exception.png` | 异常持仓领取拦截 |
| 13 | `13-distribution-detail-blocked.png` | 详情页阻断原因 |
| 14 | `14-claim-restored-after-clear.png` | 异常解除后恢复 |
| 15 | `15-returns-summary.png` | 收益与本金独立汇总 |
| 16 | `16-holding-principal-summary.png` | 持仓本金核对面板 |
| 17–19 | `17-m-home-1280.png` 等 | M 首页 1280 / 1440 / 1920 |
| 20–21 | `20-v-harbor-home.png`、`21-v-cedar-home.png` | V 两企业首页 |
| 22 | `22-m-opportunities.png` | M 投资机会列表 |

## 10. 复核方法

1. 检出分支 `fix/vm-post-investment-safety-dev09`，安装依赖后运行 `pnpm --filter investor-portal test`（或上文 `node --test` 命令）。
2. 启动 `vite`，以任意 Mock 账户登录 M 渠道，进入 `/demo`。
3. 按第 6 节步骤复现；清除站点 localStorage 后可重放全部场景。

本轮交付保持 Draft / Open / Unmerged，等待产品负责人审核。
