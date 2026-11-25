# DEV-01 前端原型实际验收记录

日期：2026-11-25。基线：`origin/docs/vm-investor-ui-ready-20261124@cd4665976f5e2c1d7f4862894655130490c17cad`；正式 release：`48e3e0b65b125d301975f7f25c3bb4c9321977d5`；DEV-00：`139d0f5a467ddf15978ed5b7cbe271ce3f952426`。PR #16 未改动。

## 实际完成

- 新建独立 `apps/investor-portal`，V/M 共用 Header、OfferingCard、AssetDetailShell 结构、企业资料和四步认购样板；渠道仅改变品牌与可见 Mock 数据。
- V 首页、M 首页、两种资产详情、最小企业页、机会列表、四步认购、后续功能说明页和 Mock 控制台均为真实可打开页面。
- 两 Issuer、住宅收益参与及单笔借款债权案例；第三个未上架股权仅供 V 渠道过滤检查。所有图像为本地原创 SVG 示意插画。
- 认购份数正整数/最低/演示上限校验，金额按整数分计算；Step 2 阅读确认后才启用“下一步”；Step 3 付款按钮禁用；Step 4 四项履约事实独立显示未开始。

## 实测结果

| 检查 | 实际结果 |
|---|---|
| TypeScript | `tsc --noEmit`：PASS |
| 自动测试 | `node --test src/domain.test.mjs`：2/2 PASS；覆盖 V/M 路由、Issuer 范围、M Listing 与有效类别、整数份数及 U 分金额 |
| Vite build | `vite build`：PASS，32 modules transformed |
| 浏览器路由 | IAB 实际点击 V 首页→资产详情→企业信息→返回、详情→认购 Step 1～4：PASS |
| 输入反馈 | 浏览器输入 1.5 后提示正整数且“下一步”禁用；输入 12 后总额与摘要为 1,200.00 U：PASS |
| 渠道隔离 | M 首页仅见两个有效 Mock Listing 及其类别；Mock 控制台切换无有效 Listing 后显示空态，刷新仍保持：PASS |
| 阅读确认 | Step 2 未勾选时“下一步”禁用，勾选后启用：浏览器复验 PASS；不代表法律签署 |
| 直接访问/错误 ID | 直接访问各截图 URL：PASS；浏览器打开 `/m/opportunities/unknown-asset` 显示受控提示和返回首页：PASS |
| PC 截图 | 本机 Chrome headless 实际生成 1280、1440、1920 宽图；人工检查 V/M 首页、住宅详情、Step 1：无明显遮挡 |
| Console Error | NOT EXECUTED：本轮浏览器工具未提供可核实的 Console Error 导出，不能写 PASS |
| 新环境依赖安装 | NOT EXECUTED：本机 `pnpm` 不可用且 E 盘不存在，未下载依赖 |

## 截图清单

1440px：`v-home-1440.png`、`m-home-1440.png`、`residence-detail-1440.png`、`debt-detail-1440.png`、`subscribe-step1-1440.png`、`subscribe-step2-1440.png`、`subscribe-step3-1440.png`、`subscribe-step4-1440.png`。

1280px：`v-home-1280.png`、`residence-detail-1280.png`。

1920px：`m-home-1920.png`、`debt-detail-1920.png`。

以上文件均在 `qa/screenshots/`。截图为浏览器渲染视口证据；顶部以外的视觉内容仅在 1440px 长图中覆盖。

## 留待后续

DEV-02 扩展六资产和三权益模板、完整列表筛选与企业信息；DEV-03 账户/KYC/钱包；DEV-04 完整 Mock 认购状态。当前四步仅为视觉与基础交互样板，可通过步骤导航查看后续演示画面，不产生有效订单或付款。

视觉上 E 风格的标题、主色、卡片、风险和两栏详情已落地；产品负责人仍需审阅截图与实际页面。此记录不将 DEV-01 标为完整 V/M 产品验收。
