# DEV-08 最终产品 PRD 与工程交接验收（2026-11-27）

## 交付与范围

- 以 PR #17 的 DEV-07 提交 `750f728f56d701065d4dbd8d0ffa99b3d8f4632d` 为基线，新增 [最终产品 PRD](../../../docs/INVESTOR-PLATFORMS/V-M-DEV-08-FINAL-PRODUCT-PRD-20261127.md)，更新 [产品文档索引](../../../docs/INVESTOR-PLATFORMS/README.md)。旧版批准文档保留历史原文。
- PRD 逐页核对 `src/redesign.tsx` 及账户、认购、订单、投后、消息/披露组件：覆盖根入口、M/V 首页、列表、详情、企业、账户 6 页、认购 4 步、订单/持仓/分配详情、客服工单、消息、披露、条款隐私占位与 `/demo`。路由、字段、可见性、校验、操作、空态和 Mock 限制有独立说明。
- 六种资产模板、三种权益、当前两项有效可认购 Offering、V/M 公开范围与 Listing 守卫均与 `src/data.ts`、`src/domain.ts` 一致；没有新增可投资项目、业务流程或生产集成。
- 生产交接按产品行为列出权威信息、真实身份/钱包/签署/资金/登记/分配及法律页需求，不制定 API、数据库或智能合约实现。全额配售、动态 Mint、统一 Claim 标为待决。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| PRD 相对附件链接 | 17 个链接逐一检查，缺失 0。 |
| `git diff --check` | PASS。 |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS。 |
| `node --test src/domain.test.mjs src/account.test.mjs src/subscription.test.mjs src/orders.test.mjs src/postInvestment.test.mjs` | 27/27 PASS，0 fail。 |
| `node node_modules/vite/bin/vite.js build` | PASS，Vite 6.4.5，48 modules。此为现有工作树工具链复核；独立冻结安装及构建见 [DEV-07](DEV-07-ACCEPTANCE.md)。 |
| PC 浏览器验收、Console Error、截图 | DEV-07 已执行，1280/1440/1920px 关键页截图与结果见 [DEV-07](DEV-07-ACCEPTANCE.md)；本阶段只改文档，未重复浏览器执行，不将其写为新的浏览器测试。 |

## 验收结论与未完成项

**DEV-08 文档交接 PASS**：PRD 以实际 Mock 原型为准，明确历史设计状态与现行代码状态，逐页可供后续研发和产品复核。原型为 PC Web 演示，不具备真实发行、身份、签署、付款、法定登记、Token 或收益事实；正式条款/隐私仍是占位。详情及操作手册见 [投资者前端 README](../README.md)。
