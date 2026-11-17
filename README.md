# RWA SaaS V1 产品与前端交付

当前交付源码包含 Web 官网、邮箱验证码登录入口和 Issuer 企业 SaaS 九模块前端。当前产品工作聚焦页面、UI/UX、字段、交互、前端状态与 Mock 演示；**本阶段不开发服务端、数据库、API，也不接入真实支付、KYC、钱包或区块链服务**。源码中的 Mock 数据、验证码、钱包、资金、登记、Token 和收益状态不得当作真实业务事实。

## 目录与文档入口

| 路径 | 用途 |
|---|---|
| `apps/website` | React 19、TanStack Router、Vite 6 官网和演示邮箱登录；正式路由见 `src/main.tsx` |
| `apps/issuer` | React 19、Vite 8、Tailwind 4 独立 Issuer 后台；九模块、详情和本地状态见 `src/App.tsx` / `src/data.ts` |
| [V1.0 实际产品基线](docs/V1.0/V1.0-PRODUCT-BASELINE.md) | 已交付页面、可见交互、Mock 能力与限制 |
| [V1.5 Issuer 前端 PRD](docs/V1.5/V1.5-ISSUER-FRONTEND-PRD.md) | V1.5 唯一产品需求主文档；本阶段继续在此文档内细化字段、校验、页面状态、交互和验收，直至 UI-Ready |
| [V2 统一需求池](docs/V2/V2-UNIFIED-REQUIREMENTS-POOL.md) | 原 V2/V3/TBD 需求统一归档，保留原始 ID 和历史版号 |
| [193 项及专项功能追溯矩阵](docs/V1.0/V1.0-FEATURE-TRACEABILITY-MATRIX.csv) | 历史批准版号与功能 ID 追溯；用于查证历史来源，不替代当前产品 PRD |
| [Backend Developer PRD（技术参考）](docs/V1.0/V1.0-BACKEND-DEVELOPER-PRD.md) | 既有服务端设计草案，仅作历史技术参考；不属于当前产品与前端工作任务 |
| [OpenAPI 3.1 草案（技术参考）](docs/V1.0/openapi.yaml) | 既有 API 契约草案，仅作历史技术参考；不作为当前前端开发规格 |

历史批准文档保存在远端 `archive/docs-before-final-handover-20261116`（源于 `docs/r2-current-product-baseline` @ `ae9762cf48f5130846f57edc6b64e3e4416ad271`）；源分支 `codex/v1-final-frontend-integration-20261116` 保留原始前端及旧说明。Frozen、DEC、SCOPE 原文未修改。建议阅读顺序：本 README → V1.0 实际产品基线 → V1.5 Issuer 前端 PRD。需要核对历史功能 ID 时再查追溯矩阵。Backend Developer PRD 与 OpenAPI 仅供未来技术团队参考，若未来启动后端工作，应另行审查和确认，不代表本阶段要求实施。历史范围差异及待确认事项见 V1.5 PRD 的“证据与待确认”。

## 本阶段工作边界

**需要完成：**
- 页面信息架构、导航、布局、视觉样式和桌面 Web 体验。
- 各模块字段、控件、必填/选填规则、条件显示和输入校验。
- 按钮、弹窗、页面跳转、草稿保存、状态变化、异常反馈等前端交互。
- 可重复操作的 Mock 数据与演示流程，并明确标注模拟状态。
- 逐页面达到 UI-Ready，形成工程师可直接理解和实现的前端产品规格。

**不在本阶段实施：**
- 后端服务、数据库、API、账号/租户权威体系。
- 真实邮件发送、KYC/KYB 服务、文件扫描、钱包托管或签名。
- 真实支付、资金划拨、法定登记、Token 部署/Mint 和链上操作。

上述真实能力只在产品文档中说明其边界与未来依赖，不要求在本阶段开发或模拟成真实成功。

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

## 文档与版本维护

本分支用于产品文档与前端规格迭代，变更通过独立分支和 PR 审查；不得直接修改 main、历史批准原文或其他 PR 状态。V1.5 只维护一份正式主 PRD，不另建重复需求清单；后续 V1.5 细化、验收结论均回写该文档。V2 及更后续需求统一维护在 V2 需求池中。
