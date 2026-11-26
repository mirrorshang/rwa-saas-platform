# DEV-01R-FIX 定向修复验收

日期：2026-11-26。代码与审核基线：PR #17 `994c343747f44552a0c43f656c287fea9f614af9`；依据 [11 月 26 日 DEV-01R 独立产品/UI 审核](https://github.com/mirrorshang/rwa-saas-platform/pull/17#pullrequestreview-6069677973) 的 P1 第 1–3 项。实施前 PR #17 为 Draft / Open / Unmerged，HEAD 与本地独立工作树一致。未修改 PR #16、Issuer、Website 或已冻结产品文档。

## 修改与验收

1. `src/redesign.tsx`、`src/domain.ts`：步骤条读取按渠道、企业、Offering 隔离的页面访问记录，只显示“当前预览 / 已查看 / 未查看”，不再用 URL 步骤号推断完成。直达 Step 4 时明确标为 Mock 进度预览；付款、配售、登记、Token 交付继续由独立 Mock 场景显示，不由步骤条驱动。
2. `src/redesign.tsx`、`src/domain.ts`：Step 2 明确为**无正文的 Mock 文件清单演示**。勾选文案改为“已了解清单”，单独保存于 `list-ack` 草稿键，不继承旧 `read` 勾选。勾选前不能继续，勾选后也不构成阅读确认、电子签署或有效法律同意；原 Mock KYC 阻断保持。
3. `src/redesign.tsx`、`src/redesign.css`：首页、列表及企业页共用卡片降低图片高度、内边距和重复说明。项目名称、底层资产与权益、最低认购、核心收益依据、期限/分配、认购状态均保留；1 个项目居中 430px，2 个项目在 882px 内容区内均衡排列，没有新增 Offering。
4. `src/domain.test.mjs`：新增直达 Step 4 与文件清单语义测试，扩充草稿键隔离断言。`qa/capture-dev01r-fix.ps1` 用本机 Chrome Headless 实际渲染关键截图。

## 实际测试

| 检查 | 结果 |
| --- | --- |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit`：PASS |
| 自动化测试 | `node --test src/domain.test.mjs`：8/8 PASS；其中直达 Step 4 前序均 `not-viewed`，已浏览仅 `viewed`，文件清单勾选前后 `legallySigned` 始终为 `false` |
| 生产构建 | `node node_modules/vite/bin/vite.js build`：PASS，35 modules transformed |
| 真实浏览器 | 本地 Vite 生产预览 `127.0.0.1:5183`，IAB 浏览器实际直达 Step 4：前 3 步“未查看”，付款“未发起 · Mock”；Step 2 勾选前按钮禁用、勾选后可进入演示、撤销后再次禁用；PASS |
| 卡片 | 浏览器实测 M 首页与列表各 2 张 430×372px；V 首页 1 张 430×352px 居中。1280px 无横向溢出；页面仅展示原有有效项目；PASS |
| Console Error | 本轮测试浏览器会话 `tab.dev.logs({levels:['error']})` 为空数组；PASS（仅本次会话） |
| Chrome 截图 | Chrome Headless 捕获 7 张 PNG；1440px 的 M/V 首页、M 列表、Step 2、直达 Step 4，以及 V 首页 1280px、M 首页 1920px。输出尺寸全部验证；PASS |

## 截图

- 首页：[V 1440](screenshots/dev01r-fix-v-home-1440.png)、[M 1440](screenshots/dev01r-fix-m-home-1440.png)、[V 1280](screenshots/dev01r-fix-v-home-1280.png)、[M 1920](screenshots/dev01r-fix-m-home-1920.png)
- [M 列表 1440](screenshots/dev01r-fix-m-list-1440.png)
- [Step 2 文件清单 1440](screenshots/dev01r-fix-step2-list-1440.png)、[直达 Step 4 预览 1440](screenshots/dev01r-fix-step4-direct-1440.png)

## 保留的限制

当前文件仅有名称与 Mock 版本，没有可阅读正文；本次明确作为清单演示，不能用于正式文件确认或签署。进度与身份状态仍为本地 Mock，不产生真实订单、付款或法定事实。全新环境安装仍未执行，现有依赖为本机目录链接；本轮没有修改依赖策略。其他 P2 建议留待另行授权。
