# sessionStorage 专项复核

测试日期：2026-11-08。运行目标为本地演示构建 `http://127.0.0.1:4178`，源码运行时 HEAD 为 `39e200c7df40647eed66eb579b4cc7e164e28acd`，两份待审源码含未提交修改。使用独立 Chrome 上下文、唯一测试邮箱、Mock KYB 审核及隔离 Asset/Instrument Fixture。逐项原始结果、账号和时间见 [`session-storage-browser-results.json`](session-storage-browser-results.json)；操作与断言见 [`session-storage-review.cjs`](session-storage-review.cjs)。脚本退出码 **1**，因为 E、F 为 FAIL。

| 项目 | 结果 | 实际观察 | 截图 |
| --- | --- | --- | --- |
| A 同一上下文刷新 | PASS | Asset 和 Instrument 存储记录、详情 UI 均恢复 | `session-A-refresh.png` |
| B 同一上下文 TAB 往返 | PASS | 返回权益结构 TAB 后记录及详情仍在 | `session-B-tab-return.png` |
| C 同一上下文直接访问详情 | PASS | 直接路由显示原资产、权益结构 | `session-C-direct-route.png` |
| D 同一上下文退出并同邮箱重登 | PASS | 退出后业务记录仍在 `sessionStorage`；未登录直访详情被重定向至登录页；重登后资料仍可见 | `session-D-same-context-relogin.png` |
| E 全新隔离上下文同邮箱登录 | FAIL | 登录后资产与权益记录均不存在：`asset:null, instrument:null` | `session-E-new-context.png` |
| F 关闭原上下文，重开后同邮箱登录 | FAIL | 登录后资产与权益记录均不存在：`asset:null, instrument:null` | `session-F-reopened-context.png` |

未登录路由拦截 **不代表数据丢失**：D 中拦截前后原上下文的存储记录均存在。E、F 则在成功使用相同邮箱登录后检查存储，确实无法恢复原资料。现有账号、Asset 和 Instrument 均使用浏览器 `sessionStorage`；独立上下文之间不共享它。这是当前前端演示原型的跨会话持久化限制，**不是本次 P1 文件版本复核判断的回归失败**，但如产品要求跨上下文恢复同账号业务资料，仍须另行批准持久化方案及服务端验收。本次未修改存储方式。

本专项只验证前端 Mock 存储行为；未验证生产账号、服务端 Tenant 隔离、并发或真实文件扫描。
