# 双前端本地运行

两个 Vite 应用分别安装依赖、启动和构建。

1. apps/issuer：执行 pnpm install --frozen-lockfile，再执行 pnpm exec vite --host 127.0.0.1 --port 5174；构建执行 pnpm build。
2. apps/website：执行 pnpm install --frozen-lockfile，再执行 pnpm exec vite --host 127.0.0.1 --port 5175；构建执行 pnpm build。

官网本地演示验证码为 123456，验证后跳转 http://127.0.0.1:5174/。构建时可用 VITE_ISSUER_ORIGIN 指定 Issuer 站点，示例见 apps/website/.env.example。真实认证服务尚未接入；演示登录不建立跨应用会话。Issuer Mock 数据保存在当前浏览器源的 localStorage，不能作为生产数据库。独立部署时需配置 SPA 路由回退。
