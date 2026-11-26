# V/M 投资者平台 DEV-01R PC Web 原型

基于产品分支 `docs/vm-investor-ui-ready-20261124` 与产品负责人选定的橙黑极简参考图完成 DEV-01R 视觉及认购体验重设计。V/M 共用一套 React 页面；`/v/:issuerSlug` 显示单企业范围，`/m` 只显示有效 Mock Listing。所有企业、资产、地址、合同与交易信息均为演示数据，不执行真实投资业务。

## 本批入口

- `/v/harbor`：V 海岚资产首页；`/v/cedar`：V 杉衡资本首页。
- `/m`：M 投资平台首页。
- `/v/harbor/opportunities/residence-01`、`/m/opportunities/debt-01`：同一详情页面模板的住宅与债权案例。
- `/v/harbor/subscribe/residence-01/quote`：四步认购视觉样板，可前后切换、校验整数份数、查看演示金额与独立履约状态。
- `/demo`：独立 Mock 场景控制台，可切换登录/KYC、认购状态、M 无有效 Listing，以及付款、登记、交付待核实状态。

`/demo` 仅供开发验收直接输入访问，不出现在 V/M 投资页面的导航和页脚。M 企业信息页只有在该企业存在当前 M 渠道可公开的有效 Listing 时才展示。认购演示草稿保存在当前标签页的 `sessionStorage`，按渠道、企业和 Offering 区分；不代表真实账户草稿。

首页分类以**底层资产**为维度（房地产、企业股权、企业借款）；列表页另设**权益类型**、地区、状态及 M 发行企业筛选。项目卡与详情按债权、收益参与权、股权分别展示相关指标。当前 M 仅有住宅与债权两项有效 Mock Listing，首页用两列卡片，不为凑三列虚构有效项目。

账户、KYC、钱包、真实签署、付款、订单、持仓和收益功能未在 DEV-01R 实现；相关入口显示后续阶段说明。Step 3 的付款按钮不可执行。演示身份状态仅通过 `/demo` 切换，不代表认证结果。

## 运行

项目采用 React 19、TypeScript 5.8、Vite 6。正常开发环境安装依赖后执行：

```powershell
pnpm install
pnpm run typecheck
pnpm test
pnpm build
pnpm dev
```

本机本轮未下载依赖：`npm` 命令不可用，`pnpm` 安装器损坏，E 盘不存在。验证使用已有的 `prototypes/website-ui-preview/node_modules` 目录链接，并以 `node node_modules/typescript/bin/tsc --noEmit`、`node --test src/domain.test.mjs`、`node node_modules/vite/bin/vite.js build` 实际运行。该链接与构建产物被 `.gitignore` 排除。尚无锁文件，全新环境安装可复现性 **NOT EXECUTED**。

## 文件说明

- `src/domain.ts`：渠道、可见性、资产分类、权益指标、筛选、行动状态、份数与 U 金额规则。
- `src/data.ts`：两个 Issuer、住宅/债权及未上架股权 Mock fixture。
- `src/redesign.tsx`：DEV-01R 当前入口，V/M 共用页面、路由、筛选、认购样板与独立 Mock 控制台。
- `src/redesign.css` 与 `src/assets/dev01r-*.png`：橙黑视觉系统与内置图像生成的无文字资产示意配图。
- `src/main.tsx`、`src/styles.css`：保留的 DEV-01 历史实现，当前 HTML 不加载。
- `src/domain.test.mjs`：渠道权限、分类与权益区分、金额、行动状态及草稿隔离测试。
- `qa/DEV-01-ACCEPTANCE-20261125.md`：首批实际测试和剩余限制。
- `qa/DEV-01-FIX-ACCEPTANCE-20261125.md`：PR #17 审核后的定向修复、浏览器截图与补验结果。
- `qa/DEV-01R-ACCEPTANCE.md`：本次视觉、交互、测试及截图验收结果。
