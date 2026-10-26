# WDEX SaaS 官网 UI 执行范围

本预览项目依据用户于 2026-10-27 直接授权的 W-01～W-14 中文 Web 官网 UI 任务开发。唯一视觉基线为同时上传的方案 C 首页长图。

- 产品依据：`docs/03-product-prd/RWA-SaaS-Master-Product-PRD-Development-Handoff-Draft-v0.1.md` 第 6.3～6.16 节，来源分支 `docs/regulated-activity-boundaries-v01`。
- 开发分支：`ui/wdex-saas-website-v1`。
- 暂用品牌：`WDEX SaaS`，通过 `src/config.ts` 集中配置。
- 只开发官网中文 Web 前端及显著标示的 Mock 演示交互。不接真实后端、邮件、企业 KYB、USDT 收款、投资者资金、钱包或链上执行。
- 不修改 PRD、README、Frozen、193 项版本归属、风险状态、PR #6 或其他产品端。
- 每页：核对对应 PRD → 实现 → Build/Lint → 浏览器检查 → 更新进度和 QA 证据 → 提交并推送。全部 14 页后执行跨页验收。

本文件是任务范围索引，不取代正式 PRD。法律正文、正式价格、品牌主体和生产服务尚未批准的内容保持待定或演示状态。
