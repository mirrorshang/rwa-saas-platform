# DEV-01-FIX 定向修复验收记录

日期：2026-11-25。依据 [PR #17 独立审核](https://github.com/mirrorshang/rwa-saas-platform/pull/17#pullrequestreview-6051473181) 的三个 P1 意见，仅修复 `apps/investor-portal/`。基线为 DEV-01 提交 `255cfa07ab80b6403b88afe24862eeb4043b3448`，PR base 仍为 `docs/vm-investor-ui-ready-20261124`。E 风格样式、首页与详情布局没有重构。

## 变更与验收

| 检查 | 实际结果 |
|---|---|
| Mock 控制台隔离 | V/M 页脚移除 `/demo` 链接；浏览器检查 M 首页及 V/M 认购页，`footer a[href="/demo"]` 均为 0；直接输入 `/demo` 仍可打开。PASS |
| M 企业页守卫 | M 企业 `cedar` 有有效 Listing 时直接访问 `/m/issuers/cedar` 可见资料和债权项目；`/demo` 切换 M 无有效 Listing 后直接访问同一路径，显示“页面或资产不可访问”，企业法定名称未渲染。PASS |
| 草稿隔离 | V `harbor/residence-01` 设为 12 份、勾选阅读后，M 同 Offering 显示默认 10 份/1,000.00 U、阅读未勾选且“下一步”不可用；返回 V 仍为 12 份/1,200.00 U、阅读已勾选。PASS |
| 自动测试 | `node --test src/domain.test.mjs`：4/4 PASS；新增 M 企业公开守卫、渠道/企业/Offering/字段草稿键隔离测试 |
| 类型检查 | 本机已有依赖下 `tsc --noEmit -p apps/investor-portal/tsconfig.json`：PASS |
| 生产构建 | 本机已有依赖下 `vite build`：PASS，32 modules transformed |
| 浏览器 Console Error | Codex in-app browser 的 `tab.dev.logs({levels:['error']})` 在上述 M 首页、企业页、无 Listing 空态、V/M 认购步骤的本次会话均返回空数组：PASS（仅覆盖本次访问的页面和会话） |
| 独立安装依赖与全新运行 | NOT EXECUTED：本机 `pnpm --version` 因 `corepack/dist/pnpm.js` 缺失而失败，E 盘不存在；未下载依赖，现有 `node_modules` 为与 Website 原型目录的临时链接。无锁文件，全新环境可复现性尚未证实 |

## 新截图

浏览器视口均为 1440 × 900，使用实际页面全页截图，存于 `qa/screenshots/`：

- `dev01-fix-m-home-1440.png`：M 正常首页与页脚无控制台入口。
- `dev01-fix-m-company-blocked-1440.png`：M 无有效 Listing 时直接访问企业页的受控空态。
- `dev01-fix-v-quote-1440.png`：V 住宅认购 12 份。
- `dev01-fix-m-quote-1440.png`：同一 Offering 的 M 住宅认购默认 10 份。

## 剩余问题与边界

全新依赖安装与锁文件仍需在有可用包管理器及已确认下载位置的环境补验；当前不将其标为 PASS。浏览器 Console 检查仅针对本次测试路径，不等于所有路由或其他浏览器的全覆盖。DEV-02 资产分类扩充、页面拆分等 P2 意见未在本修复中处理。没有接入真实账户、KYC、钱包、合约、付款或后端。
