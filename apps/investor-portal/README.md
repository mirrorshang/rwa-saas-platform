# V/M 投资者平台 DEV-01 PC Web 原型

基于产品分支 `docs/vm-investor-ui-ready-20261124` 的 E 风格视觉规格制作。V/M 使用同一套 React 页面；`/v/:issuerSlug` 显示单企业范围，`/m` 只显示有效 Mock Listing。所有企业、资产、地址、合同与交易信息均为演示数据，不执行真实投资业务。

## 本批入口

- `/v/harbor`：V 海岚资产首页；`/v/cedar`：V 杉衡资本首页。
- `/m`：M 投资平台首页。
- `/v/harbor/opportunities/residence-01`、`/m/opportunities/debt-01`：同一详情页面模板的住宅与债权案例。
- `/v/harbor/subscribe/residence-01/quote`：四步认购视觉样板，可前后切换、修改整数份数、查看演示金额与分态进度。
- `/demo`：独立 Mock 场景控制台，可加载两案例、模拟 M 无有效 Listing、重置。

`/demo` 仅供开发验收直接输入访问，不出现在 V/M 投资页面的导航和页脚。M 企业信息页只有在该企业存在当前 M 渠道可公开的有效 Listing 时才展示。认购演示草稿保存在当前标签页的 `sessionStorage`，按渠道、企业和 Offering 区分；不代表真实账户草稿。

账户、KYC、钱包、真实签署、付款、订单、持仓和收益功能均未在 DEV-01 实现；相关入口显示后续阶段说明。Step 3 的付款按钮不可执行。

## 运行

项目采用 React 19、TypeScript 5.8、Vite 6。正常开发环境安装依赖后执行：

```powershell
pnpm install
pnpm run typecheck
pnpm test
pnpm build
pnpm dev
```

本机本轮未下载依赖：`pnpm` 命令不可用、E 盘不存在。验证使用已有的 `prototypes/website-ui-preview/node_modules` 临时目录链接；该链接、构建产物和 Chrome 临时配置均被 `.gitignore` 排除，不属于源码交付。新环境需自行安装依赖；当前未验证全新安装流程。

## 文件说明

- `src/domain.ts`：渠道、可见性、份数与 U 金额展示规则。
- `src/data.ts`：两个 Issuer、住宅/债权及未上架股权 Mock fixture。
- `src/main.tsx`：共用页面、路由、认购样板和场景控制台。
- `src/styles.css` 与 `src/assets/`：E 风格 token 与本地示意插画。
- `src/domain.test.mjs`：关键展示规则自动测试。
- `qa/DEV-01-ACCEPTANCE-20261125.md`：首批实际测试和剩余限制。
- `qa/DEV-01-FIX-ACCEPTANCE-20261125.md`：PR #17 审核后的定向修复、浏览器截图与补验结果。
