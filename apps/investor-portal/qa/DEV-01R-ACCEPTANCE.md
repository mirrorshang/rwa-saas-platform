# DEV-01R 视觉与交互验收记录

日期：2026-11-26。代码基线：PR #17 的 `533bcc6cb7b16f322d24a53e90509230419101f3`。产品基线：PR #16 的 `cd4665976f5e2c1d7f4862894655130490c17cad`；两 PR 在实施前均为 Draft / Open / Unmerged。依据 V/M 共用 UI-Ready PRD、M 独有页面 PRD，以及产品负责人本轮明确选定的橙黑极简首页参考图。未更改 PR #16 文档。

## 范围与视觉

- V/M 共用横向导航、卡片、列表、资产详情、企业资料和四步认购；M 展示有效 Mock Listing，V 按 Issuer 展示。V 左上角使用当前企业名称及首字标识，M 显示 RWA Invest。
- 暖白底、黑灰文字、少量珊瑚橙强调，建筑实景式 Hero、横向底层资产分类和简化平台说明。没有使用参考图中虚构的三个项目或收益数字；当前 M 仅有两项有效 Listing，采用双列卡片。
- 首页、列表、详情按“底层资产、法律权益、最低认购、收益机制、期限/周期、认购状态”组织信息。债权展示合同固定年利率与付息频率，收益参与权展示收益来源与分配周期；固定利率明确“非保证兑付”。列表将资产类别和权益类型分成独立筛选维度，另有搜索、地区、状态和 M 发行企业筛选。
- 详情首屏展示关键条件，右侧行动面板按认购中、即将开放、暂停、已结束、待核实状态变更主动作或禁用原因。登录引导保留原项目 URL；KYC 在文件确认后的继续动作前以 Mock 规则阻断，公开浏览不受限。
- 四步认购显示份数与金额校验、文件阅读确认、不可执行的 Mock 付款信息，以及付款/配售/法定登记/Token 交付分立时间线。阅读确认不冒充签署，不发送交易或生成订单。

配图由内置 imagegen 生成后纳入 `src/assets/`：提示分别为“右侧建筑、左侧留白的现代建筑日光摄影”“城市住宅物业与庭院的中性建筑摄影”“企业借款经营场景的物流设施摄影”；三者均要求无文字、Logo、UI、水印。配图明确标为非项目实拍。

## 变更文件

- `index.html`、`src/redesign.tsx`、`src/redesign.css`、`src/assets/dev01r-*.png`：新入口、共用页面、视觉系统与示意配图。
- `src/domain.ts`、`src/domain.test.mjs`：分类、筛选、权益指标、行动状态及回归测试；`src/main.tsx` 仅同步旧入口的分类标签以通过全源码类型检查。
- `README.md`：入口、运行方式和 Mock 边界；`qa/DEV-01R-ACCEPTANCE.md`、`qa/capture-chrome.ps1`、`qa/capture-receiver.mjs`、`qa/screenshots/dev01r-*`：验收记录、截图工具与实际浏览器截图。

## 实际验证

| 项目 | 结果 |
| --- | --- |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit` PASS |
| 自动测试 | `node --test src/domain.test.mjs`：6/6 PASS；覆盖 V/M 可见性、M 企业守卫、底层资产与权益筛选、两权益指标、金额/份数、行动状态及草稿键隔离 |
| 生产构建 | `node node_modules/vite/bin/vite.js build` PASS；35 modules transformed |
| 浏览器 | 本地 Vite 页面由 IAB Playwright 接口实际访问 V/M 首页、列表、两类详情、企业守卫及四步认购；1280/1440/1920 宽均未出现横向溢出。另以独立 Chrome Headless 从生产预览 `127.0.0.1:5183` 渲染 13 张整页 PNG 截图，尺寸已核对 |
| 筛选 | M 列表 2 项；企业借款筛后 1 项，叠加股权后空态，清空后搜索住宅得 1 项；PASS |
| 认购 | 未登录点击“开始认购”进入账户说明并保留原 Offering；12 Token 更新为 1,200.00 U；1.5 份提示正整数且禁用下一步；阅读确认前不能继续；Step 3 付款按钮禁用；Step 4 四阶段分立；PASS |
| 渠道与历史修复 | M 无 Listing 时企业资料直接访问受控；M 无法访问未上架股权而 V cedar 可见；V 住宅草稿默认 10 份、M 已改为 12 份仍独立；正常页 `a[href="/demo"]` 为 0；PASS |
| Mock 状态 | 即将开放、暂停、待核实禁购及原因提示；未 KYC 阻断继续；付款、法定登记、Token 交付待核实各自显示；PASS |
| Console Error | 本轮访问页面的 `tab.dev.logs({levels:['error']})` 均为空数组；PASS（仅覆盖本次会话） |
| 全新安装 | **NOT EXECUTED**：E 盘不存在，`npm` 不可用，`pnpm` 安装器损坏；当前依赖是指向旧 Website 原型 `node_modules` 的 Junction，无锁文件。没有用该环境冒充全新安装验证 |
| 独立 Chrome | Chrome Headless 整页渲染与截图 PASS；独立 Chrome 中的交互测试 **NOT EXECUTED**，交互由 IAB Playwright 完成 |

## 实际截图

均为浏览器实际渲染，直接存于 `qa/screenshots/`，可在 GitHub 查看。常规页面 PNG 来自 Chrome Headless 生产预览；状态图 JPEG 来自 IAB 浏览器：

- 1440px 首页与列表：[V 首页](screenshots/dev01r-v-home-1440.png)、[M 首页](screenshots/dev01r-m-home-1440.png)、[M 投资机会列表](screenshots/dev01r-m-list-1440.png)
- 1440px 详情：[住宅收益参与](screenshots/dev01r-residence-detail-1440.png)、[企业借款债权](screenshots/dev01r-debt-detail-1440.png)
- 1440px 四步：[确认认购](screenshots/dev01r-step1-1440.png)、[文件确认](screenshots/dev01r-step2-1440.png)、[钱包付款](screenshots/dev01r-step3-1440.png)、[交易进度](screenshots/dev01r-step4-1440.png)
- 1440px 行动状态：[即将开放](screenshots/dev01r-action-upcoming-1440.jpg)、[暂停](screenshots/dev01r-action-paused-1440.jpg)、[待核实](screenshots/dev01r-action-unknown-1440.jpg)；需 KYC 的阻断已做交互检查
- 1280px：[V 首页](screenshots/dev01r-v-home-1280.png)、[住宅详情](screenshots/dev01r-residence-detail-1280.png)
- 1920px：[M 首页](screenshots/dev01r-m-home-1920.png)、[债权详情](screenshots/dev01r-debt-detail-1920.png)

## 尚未实现

当前仍是前端 Mock 原型。真实账户/KYC、签署、报价与容量核验、钱包、合约付款、订单、持仓、收益及生产法定登记均未接入。旧 DEV-01 `src/main.tsx` 与 `src/styles.css` 保留为未使用的历史实现；当前入口为 `src/redesign.tsx`，后续可在代码审查通过后清理。DEV-02 六类资产完整动态模板不在本轮范围内。
