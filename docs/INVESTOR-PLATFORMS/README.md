# RWA SaaS｜V/M 投资者平台 V1.0 产品/UI-Ready 设计索引

> 2026-11-24｜仅 PC Web 原型｜六批设计审核已获用户批准；本目录是正式化候选规格，需随独立 GitHub Draft PR 完成一致性复核。仅为产品/UI 交付，**并非 V/M 前端已开发或生产支付、KYC、合约、钱包和法定登记已接入**。

## 1. 最短阅读路径

1. [V/M 共用投资者端 UI-Ready PRD](V-M-SHARED-UI-READY-PRD-v0.1.md)：V-01～V-15 完整页面组、动态资产与权益模板、账户/KYC/MPC/钱包、合约认购、订单、投后、工单、状态与异常。
2. [M 总平台独有页面 UI-Ready PRD](M-UNIQUE-PAGES-UI-READY-PRD-v0.1.md)：M-01～M-16 差异页、跨 Issuer 发现、企业资料、M23 Listing Gate、M 账户安全。
3. [五端业务契约、一致性审计和验收矩阵](CROSS-PLATFORM-CONSISTENCY-AND-ACCEPTANCE-v0.1.md)：单一权威、历史冲突 C01～C12、15 页对应映射、VM-01～VM-22 设计用例与工程依赖。

关联历史生产/平台规格：
- [正式 Backend Developer PRD](../V1.0/V1.0-BACKEND-DEVELOPER-PRD.md)（本 PR 补“投资者端现行决策增量”，不将现有 Mock 改为生产事实）
- [Platform Admin 文档索引](../PLATFORM-ADMIN/README.md)
- [五端功能与流程总览](../PLATFORM-ADMIN/RWA-FOUR-PLATFORM-FUNCTIONAL-FLOW-OVERVIEW-FOR-ENGINEERING-DRAFT-v0.1.md)
- [P-07/08 运营任务/通知](../PLATFORM-ADMIN/PLATFORM-ADMIN-P07-P08-OPERATIONS-CENTER-UI-READY-PRD-DRAFT-v0.1.md)
- [V1.0 实际前端交付基线](../V1.0/V1.0-PRODUCT-BASELINE.md)：仅 W/I 真实 Mock 交付事实；V/M/P 独立前台仍未开发。

## 1.1 开发准备

- [V/M PC Web 开发总流程与工程交接](V-M-PC-WEB-DEVELOPMENT-PLAN-v0.1.md)：DEV-00～DEV-08 PC 原型实施、关键页面视觉验收、Mock 场景、浏览器验收及最终交付工程师的产品 PRD；不设计后端。

- [DEV-01 E 风格 PC Web 视觉与关键页面规格](V-M-DEV-01-E-STYLE-PC-VISUAL-SPEC-20261125.md)：用户已选择机构金融 × 资产投资商城，规定色彩/排版、V/M 首页、共用资产详情、四步认购样板和 PC 视觉验收。

## 2. 已审批决定摘要

| 主题 | V1.0 正式产品决定 |
|---|---|
| PC 风格 | 网站顶部横向主导航；不做 APP 底栏。当前只做 PC Web，后期适配 H5；APP 本轮不规划 |
| V/M 关系 | 共用同一资产详情、企业资料页、认购、订单、持仓、收益与客服组件；不同品牌/数据 scope |
| 首页 | V 强调 RWA、资产机会，企业仅左上角 Logo/名称品牌；M 跨 Issuer 发现 |
| 六种底层资产 | 住宅、写字楼、商铺、工业园/仓储物流、非上市普通股权、单笔企业借款债权 |
| 三种权益 | 股权、债权、收益参与权；字段/收益/本金根据 InstrumentVersion 动态显示 |
| 账户 | 邮箱 OTP 首次即建号；V/M 不自动合并账户；注册后自动请求分配 MPC 默认钱包 |
| KYC 与钱包 | KYC 认购前完成即可；可签名绑定自有钱包并切换默认 |
| 支付 | 仅 OP Mainnet USDT，面向 Offering 已核实合约；未真实确认不标付款成功 |
| 订单异常 | 不提供投资者主动取消、手动退款；允许安全自动过期、经过独立生产批准的自动退款、人工异常工单 |
| 工单 | V/M 提交/查进度；Issuer 与 P-07/P-17 按各自法定/运营权限处理 |
| 投后 | 法定持仓与 Token 分列；应付/可领/实付区分；债权本金不算投资收益 |

六批批准事实以本对话用户确认及此 PR 变更为准；历史 R2 文件仅作为来源追溯，不据此恢复过期 USDC/自助取消/多套页面。第五批已确认四项 A；第六批 R01～R06 已全部 A。

## 3. 验收与范围状态

- 产品设计：六批已确认；归档为本次 PR 审核稿。
- UI-Ready：已编写页面/字段/交互/状态/异常与共用映射；待 PR 合并审核。
- 源码/UI：未开发 V/M/P 独立应用；不得将组件名当成现有源码。
- 真实业务：Provider 账户和 KYC、合约/退款、USDT/Gas/Signer、法定登记、收益支付和授权工单仍需独立准入。
- 历史代码/DEC：保持冻结与追溯；不将 2026-11-16 交付事实编辑成 V/M 已交付。
- 设计 QA：`VM-01～VM-22` 为**待执行**验收用例，不能写 PASS。

## 4. 后续实施顺序

**产品 UI-Ready PR #16 审核 → Codex DEV-00 原型准备审计 → DEV-01 关键 PC 视觉样板审核 → DEV-02～06 分模块制作可运行前端 Mock 原型 → DEV-07 实际浏览器测试与修复 → DEV-08 依据最终页面生成交付开发工程师的完整产品 PRD，并将源码、手册、验收记录推送 GitHub。**真实后端、API、数据库、MPC/KYC 服务、智能合约和生产支付由后续开发工程师另行实施；本轮不设计其技术实现。H5 待 PC 原型定稿后另行适配。

> PR 保持 Draft/Open/Unmerged，除非用户另行批准合并；不主动改变历史 PR/Frozen/DEC。
