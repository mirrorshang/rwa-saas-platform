# RWA SaaS V1 工程交付

工程交付分支 `release/v1-engineering-handover-20261116` 基于前端固定提交 `05bda87a32de34e0324f480901b9024ab676f3d7`。当前正式交付为 Web 官网、邮箱验证码登录入口和 Issuer 企业 SaaS 九模块前端；生产后端尚未开发。源码中的 Mock 数据、验证码、钱包、资金、登记、Token 和收益状态不得当作真实业务事实。

## 目录与文档入口

本仓库当前审计范围为官网 Website + 企业 SaaS（Issuer）。SaaS V1.0/V1.5 为企业 SaaS 自身版本；V2.0 是跨产品端统一需求池。企业投资者平台、总投资者平台、平台总管理后台不在本轮版本决策范围，各自独立规划 V1.0。

| 路径 | 用途 |
|---|---|
| `apps/website` | React 19、TanStack Router、Vite 6 官网和演示邮箱登录；正式路由见 `src/main.tsx` |
| `apps/issuer` | React 19、Vite 8、Tailwind 4 独立 Issuer 后台；九模块、详情和本地状态见 `src/App.tsx` / `src/data.ts` |
| [V1.0 实际产品基线](docs/V1.0/V1.0-PRODUCT-BASELINE.md) | 页面、交互、Mock 与限制 |
| [Backend Developer PRD](docs/V1.0/V1.0-BACKEND-DEVELOPER-PRD.md) | 架构、实体、接口、状态机、外部服务和验收 |
| [OpenAPI 3.1 草案](docs/V1.0/openapi.yaml) | 与 Developer PRD 同步的 81 个接口和请求/响应 Schema |
| [SaaS 当前版本归属决策](docs/V1.0/SAAS-VERSION-ALIGNMENT-DECISIONS-2026-11-18.md) | 2026-11-18 已确认的 V1.0/V1.5/V2.0 边界及待决事项 |
| [193 项及专项功能追溯矩阵](docs/V1.0/V1.0-FEATURE-TRACEABILITY-MATRIX.csv) | 历史版号与当前交付归属；历史原版号不改写 |
| [V1.5 需求与验收](docs/V1.5/V1.5-REQUIREMENTS-AND-ACCEPTANCE.md) | 前端缺口审计候选与当前版本决策覆盖 |
| [V2 统一需求池](docs/V2/V2-UNIFIED-REQUIREMENTS-POOL.md) | 原 47 项历史追溯及本轮新增补充项 |

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

Issuer 没有独立自动化测试脚本；website 测试包含旧 Issuer 原型逻辑，不能替代最终 `apps/issuer` 的手工业务验收。请以实际构建和测试输出为准，不能把未运行项标为 PASS。

## 后端开发起点与生产前置

先实现安全邮箱 OTP、一次性跨应用会话交换、单账号单企业与租户隔离，再建 KYB/订阅/Entitlement、Asset/Instrument/Offering 基础主账（V1.0 不设独立 Project/业务版本历史）。随后接投资者强制 KYC、订单、OP Mainnet USDT 付款与最终性、配售/法定名册、Token、收益与资金结算；Project、版本历史和通用历史快照进入 V2.0 统一需求池。所有外部接入采用可替换 Adapter；未选定 Provider、法域/法律责任、托管与合约审计、钱包/Signer、真实密钥、环境及生产准入均须确认。未经独立授权不得运行真实支付、法定登记或链上写操作。

本分支是工程资料交付，不代表业务代码、生产环境或整体产品 Frozen。变更须在独立分支和 PR 审查；不得直接修改 main、历史批准原文或现有 PR 状态。
