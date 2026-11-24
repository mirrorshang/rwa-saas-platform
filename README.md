# RWA SaaS V1.0 工程交付与产品文档

工程交付分支 `release/v1-engineering-handover-20261116` 最初基于前端固定提交 `05bda87a32de34e0324f480901b9024ab676f3d7`。2026-11-20 已合并 Issuer V1.0 五模块 Sandbox Mock 闭环（PR #12）及 Platform Admin V1.0 UI-Ready 产品设计与审计（PR #13 → PR #10）。当前正式交付包括 Web 官网演示入口、`apps/issuer` 的 Mock 业务闭环及 Platform Admin 文档；生产后端、独立 V/M/P 前台尚未开发。源码中的 Mock 数据、验证码、钱包、资金、登记、Token 和收益状态不得当作真实业务事实。

## 目录与文档入口

| 路径 | 用途 |
|---|---|
| `apps/website` | React 19、TanStack Router、Vite 6 官网和演示邮箱登录；正式路由见 `src/main.tsx` |
| `apps/issuer` | React 19、Vite 8、Tailwind 4 独立 Issuer 后台；九模块、详情和本地状态见 `src/App.tsx` / `src/data.ts` |
| [V1.0 实际产品基线](docs/V1.0/V1.0-PRODUCT-BASELINE.md) | 页面、交互、Mock 与限制 |
| [Issuer 完整操作手册](docs/Issuer%20SaaS%20V1.0%20全流程操作手册.md) | 住宅与债权双案例逐页操作 |
| [四端业务流程泳道图](docs/RWA%20四端业务流程泳道图.md) | Issuer Mock 与 V/M/Platform 待接入边界 |
| [Issuer 闭环历史实施方案](docs/Issuer%20SaaS%20V1.0%20核心业务闭环修复实施方案.md) | 2026-11-19 批准的规划记录；现行参数以实施记录和验收报告为准 |
| [Issuer 交付验收报告](docs/RWA%20SaaS%20V1.0%20功能完整性与交付验收报告.md) | 页面、测试、风险和未完成项 |
| [Platform Admin 文档索引](docs/PLATFORM-ADMIN/README.md) | P-01～P-18 UI-Ready 产品设计与历史审核 |
| [V/M 投资者平台 UI-Ready 产品设计索引](docs/INVESTOR-PLATFORMS/README.md) | 2026-11-24 通过六批产品审核：V/M 共用 PC Web UI、M 独有页面、合约支付与工单及五端审计（仅文档，非代码） |
| [Platform Admin 完整性审计报告](docs/Platform%20Admin%20V1.0%20产品设计完整性审计报告.md) | 逐页审计、跨端边界与生产决策门 |
| [Backend Developer PRD](docs/V1.0/V1.0-BACKEND-DEVELOPER-PRD.md) | 架构、实体、接口、状态机、外部服务和验收 |
| [OpenAPI 3.1 草案](docs/V1.0/openapi.yaml) | 与 Developer PRD 同步的 85 个接口和请求/响应 Schema |
| [193 项及专项功能追溯矩阵](docs/V1.0/V1.0-FEATURE-TRACEABILITY-MATRIX.csv) | 历史版号与当前归属；193 原项 + 11 后续批准项 |
| [V1.5 需求与验收](docs/V1.5/V1.5-REQUIREMENTS-AND-ACCEPTANCE.md) | 原 V1 前端未证实完整的功能及范围冲突 |
| [V2 统一需求池](docs/V2/V2-UNIFIED-REQUIREMENTS-POOL.md) | 原 V2/V3/TBD 47 项，保留原版号 |

历史批准文档在远端 `archive/docs-before-final-handover-20261116`（源于 `docs/r2-current-product-baseline` @ `ae9762cf48f5130846f57edc6b64e3e4416ad271`）；源分支 `codex/v1-final-frontend-integration-20261116` 保留原始前端及旧说明。Frozen、DEC、SCOPE 原文未修改。先读本 README、V1.0 产品基线和 Backend Developer PRD，再按追溯矩阵查历史决策。旧 R2 文档的 W/I/V/M/P 范围、目录和模板与本轮三部分交付有冲突，已在 PRD 第 16 节列为待产品确认。

## 本地运行

要求 Node.js 与 pnpm；两个应用独立安装、启动、构建，不能把 `apps/website` 的旧 Issuer 原型页面当作正式后台。安装前按本机下载/依赖缓存策略选择路径。

```powershell
cd apps/issuer
pnpm install --frozen-lockfile
pnpm dev -- --host 127.0.0.1 --port 5174
# 另一个终端：
cd apps/website
pnpm install --frozen-lockfile
pnpm dev -- --host 127.0.0.1 --port 5175
```

官网构建时可按 `apps/website/.env.example` 设置 `VITE_ISSUER_ORIGIN=http://127.0.0.1:5174`。本地演示验证码 `123456` 只在演示模式使用；网站登录后只是导航到 Issuer，**没有安全会话交换**。Issuer 状态写入当前浏览器源的 localStorage；清除存储会丢失 Mock 资料。独立部署需配置 SPA 路由回退和两个应用的可信源。

```powershell
cd apps/issuer
pnpm build
cd ../website
pnpm build
node --test src/*.test.mjs
```

Issuer 现有 45 项 Node 自动化测试（`node --test src/*.test.mjs`）；website 测试包含旧 Issuer 原型逻辑，不能替代正式 `apps/issuer` 的业务验收。请以实际构建和测试输出为准，不能把未运行项标为 PASS。

## 后端开发起点与生产前置

先实现安全邮箱 OTP、一次性跨应用会话交换、单账号单企业与租户隔离，再建 KYB/订阅/Entitlement、Asset/Instrument/Project/Offering 和版本主账。随后接投资者 KYC、订单、OP Mainnet USDT 付款与最终性、配售/法定名册、Token、收益与资金结算。所有外部接入采用可替换 Adapter；未选定 Provider、法域/法律责任、托管与合约审计、钱包/Signer、真实密钥、环境及生产准入均须确认。未经独立授权不得运行真实支付、法定登记或链上写操作。

本分支是工程资料交付，不代表业务代码、生产环境或整体产品 Frozen。变更须在独立分支和 PR 审查；不得直接修改 main、历史批准原文或现有 PR 状态。

## 2026-11-20 Issuer 内部 Sandbox Mock 闭环（已并入 release）

上文为 `release/v1-engineering-handover-20261116` 的历史交付说明；其中“Issuer 没有独立测试”和“Project 尚无独立对象”等只适用于旧固定前端。[PR #12](https://github.com/mirrorshang/rwa-saas-platform/pull/12) 已并入本 release；正式 `apps/issuer` 已完成五模块内部演示：Asset/Instrument/自动 Project/Offering、七组发行准备、唯一 Sandbox 发布、Mock 投资者至持有人、住宅租金与债权 Actual/365 Fixed 本息。当前 `apps/issuer/src/*.test.mjs` 45 项通过；TypeScript 和 Vite Build 通过。V/M/Platform、生产支付与链上服务尚未接入。

| 当前文档 | 用途 |
| --- | --- |
| [Issuer SaaS V1.0 全流程操作手册](docs/Issuer%20SaaS%20V1.0%20全流程操作手册.md) | 双案例逐页按钮和结果 |
| [RWA 四端业务流程泳道图](docs/RWA%20四端业务流程泳道图.md) | Issuer 当前 Mock 与 V/M/Platform 待接入边界 |
| [功能完整性与交付验收报告](docs/RWA%20SaaS%20V1.0%20功能完整性与交付验收报告.md) | 浏览器、测试和未完成项 |
| [现行 Mock 状态](docs/V1.0/V1.0-ISSUER-MOCK-BUSINESS-FLOW-AND-STATES.md) | 对象分态、守卫和生产边界 |
| [增量功能追溯](docs/V1.0/V1.0-ISSUER-MOCK-TRACEABILITY.md) | 历史矩阵 ID 到新页面及证据 |
| [工程交接](docs/V1.0/V1.0-ISSUER-MOCK-HANDOVER.md) | 运行、测试、恢复及代码位置 |

本地验证在 `apps/issuer` 下运行：`node --test src/*.test.mjs`、`node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`、`node node_modules/vite/bin/vite.js build`。Mock 案例仅通过页面和独立演示控制台操作，不能直接改浏览器存储来伪造验收。

## 当前合并与范围记录（2026-11-20）

- Issuer PR #12 已合并；Platform 审计 PR #13 已并入产品设计 PR #10，PR #10 已并入同一 release。合并提交与当前分支 HEAD 以 GitHub 记录为准。
- Platform Admin 本轮只交付 P-01～P-18 设计和审计文档，不代表独立后台、V/M 交易前台或真实跨端上架已开发。
- 原型工作区的未提交页面改动和早期操作手册副本未并入正式代码；正式 Issuer 主实现只在 `apps/issuer`。V1.5/V2 及历史研究 PR 保持各自版本和审查流程，不作为本次 V1.0 release 的已完成业务代码。


## 2026-11-24 V/M 投资者平台新一轮产品规格（文档 PR 候选）

已获用户批准的六批 V/M 产品决定，拟通过 [V/M 投资者平台产品索引](docs/INVESTOR-PLATFORMS/README.md) 形成 PC Web UI-Ready 规格。共同流程含六底层资产/三类法律权益、自动 MPC 默认钱包、认购前 KYC、仅 OP Mainnet USDT Offering 合约认购、无投资者自助取消/退款、人工客服工单以及持仓/收益/本金分列；P-07/M17 与 Issuer 原资金域保持责任边界。**此文档增量不代表 V/M 前端代码、P 后台、合约/退款/MPC Provider 或真实生产业务已交付**，不修改 2026-11-16 冻结实际代码结论。审核 PR 保持 Draft，未经明确批准不合并。
