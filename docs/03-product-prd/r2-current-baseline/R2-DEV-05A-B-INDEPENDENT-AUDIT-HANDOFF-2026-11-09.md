# RWA SaaS R2｜DEV-05A/B 独立审计与证据归档交接（2026-11-09）

> **当前状态：Codex 报告实现完成，待 ChatGPT 独立源码/证据复核，尚未判阶段验收 A。** 本文件记录用户提供的开发自测报告及下一步 Audit Only 取证要求，绝不将 Codex 的 PASS 当成独立验收结果。
>
> 依据 [DEV-05 授权/开发交接](R2-DEV-05-OFFERING-CODEX-HANDOFF-2026-11-08.md)、[U02-06 R01～R36](U02-06-OFFERING-UI-DETAIL-R31-R36-APPROVED-2026-11-08.md)、[DEV-05-01 创建门](U02-06-DEV05-01-INSTRUMENT-READY-GATE-APPROVED-2026-11-08.md)、[字段级 UI-Ready](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)及[T01～T36 浏览器验收矩阵](U02-06-DEV05-BROWSER-ACCEPTANCE-2026-11-08.md)；Candidate/Open 与正式生产门仍独立。

## 1. 开发方报告（未独立验证）
- 用户报告：本地 `D:\RWA-SAAS-Issuer-R2`、`feat/issuer-r2-rebuild`，HEAD `39e200c7df40647eed66eb579b4cc7e164e28acd`，存在未提交文件；产品文档快照 HEAD `90a7cb24d46191c2cc719e09553142eddbfcf25d`。
- DEV-05A/B 已实现：Asset 详情发行管理入口；Instrument Ready 创建门与版本关联；Offering A/B/C 单页、Draft、资料检查、企业钱包、内部投资者预览；独立 Mock 状态与一键填充。
- 主要新文件：`prototypes/website-ui-preview/src/issuer-r2/OfferingPage.tsx`、`data/offerings.ts`、`data/offeringMock.ts`、`styles/offerings.scss`；另有路由、Asset TAB、Mock 控制台承接改动。
- 开发方报告：TypeScript/ESLint/正式构建/演示构建 PASS；主 Chrome 测试 31 PASS / 0 FAIL；T01～T36=25 PASS / 11 BLOCKED；DEV-03/04、P1/P2、Ready 回归 40 PASS / 1 BLOCKED。
- 本地原始证据：`evidence/dev-05-2026-11-09-final-v4/acceptance-summary.json`、`T15.png`、`T16.png`、`X06-file-preview.png`、`chrome-trace.zip`。
- 11 项 BLOCKED 涉及真实服务端、并发、订单、支付/Token 等；另有既存跨浏览器上下文 sessionStorage 持久化限制。生产和独立验收均未通过。
- 上述数据全部作为**被审计的报告主张**，不能在取证前直接记为独立 PASS。

## 2. 审计判定门
1. **业务对象与创建门**：在 Ready 检查失败、旧文件版本待复核或 Asset 非 Ready 时，不能创建 Offering；命令层也要验证当前同 Tenant 的 Asset/Instrument/Ready 与确定版本。无真实服务端时仅声明原型层校验。
2. **Draft 和版本不变量**：Draft 不预留 Token；保存/预览/检查不能生成订单、资金、Mint 或公开页；Offering 与文件固定引用版本不静默漂移。
3. **容量与计算**：Token 数量正整数、剩余额度校验、价格与最低认购 U 的精确性和实际最小整数份额；多期共享容量；已发布/在途/关闭释放的 Mock 分层不把演示当主账。
4. **钱包与权限**：从本 Tenant 已绑定且经过既有绑定/验证流程的钱包中选择最终结算账户；区分认购合约支付入口；新 Free 的业务资料和内部预览允许，真实发布不允许；Standard 在无生产准入时同样不能发布；降级历史权限保持。
5. **Mock 隔离**：模拟 Waiting/Active/Paused/Ended/Closed、订单/支付/Mint/退款仅从独立测试 Fixture 驱动；普通业务客户不能借 Mock 控制台制造真实已发布/募资/持仓事实。
6. **预览一致性**：至少资产卡片/详情、权益说明、价格/时间/限制、支付网络币种、风险文件；区分当前编辑未保存状态与已保存快照；预览不得造收益、已售和订单。
7. **BLOCKED 逐项追踪**：11 项必须逐个给出 T ID、测试动作、阻断原因（生产范围未授权/本地服务缺失/测试环境缺陷/实际功能未实现），不得把范围内必需功能藏入 BLOCKED。
8. **兼容边界**：已知跨上下文 sessionStorage 不共享不要求本轮擅自修改持久化，但不等于通过生产级跨设备数据持久化验收。
9. **历史回归**：不改 U01、官网、旧 Issuer，保留 DEV-03/04 P1 修复，保留原 10 个未跟踪探针文件及全部证据。
10. **通过门**：只有源码差异、完整结果、关键测试源码和浏览器证据由 ChatGPT 复核后，才可建议进入用户人工 UI 验收；生产类永远另行准入。

## 3. 审计材料放置方式
采用独立的审计分支 `audit/dev-05a-b-review-2026-11-09`，基于**当前** `origin/docs/r2-current-product-baseline` 新建独立 worktree，归档到：
`docs/03-product-prd/r2-current-baseline/audit-evidence/dev-05a-b-2026-11-09/`。

需完整保留未修改的原始文件：
- `acceptance-summary.json`，T01～T36 逐项结果、主 Chrome/回归 JSON、原始测试脚本与其直接依赖、关键截图/trace（大文件不能上传时记录路径、字节数、SHA256和原因，不能假冒已归档）。
- 所有 DEV-05 新增/变更业务相关源码**审计快照**：OfferingPage.tsx、data/offerings.ts、data/offeringMock.ts、styles/offerings.scss，及实际改动涉及的 R2 路由、资产 TAB、Mock 控制台、权限/钱包适配文件；保存完整 `git diff HEAD` 和 `git diff --check`。
- `git-status.txt`、`git-summary.txt`、`source-review-notes.md`、`blocked-register.md`、`README.md`、`sha256-inventory.txt`。
- 可额外独立运行不修改源码的风险检查：未 Ready 强行直达创建、两期 Draft 份额、Free/Standard 发布阻断、文件换版后原 Offering 引用、失败上传后 Draft 保留、Mock 隔离。若不能运行，标 NOT RUN/原因，不抄原 PASS。
- 归档前检查任何钱包密钥、真实邮箱/手机号、企业身份证明、Token/密码或凭证内容，不得泄露，保留哈希/结构证据即可。

**绝不允许**在原 `feat/issuer-r2-rebuild` 工作树执行 `reset/clean/stash/checkout/restore`；不得自行 commit/push 原产品源码、删除 10 个探针或旧证据、变更 PR #8、提交新增生产代码、声称本轮产品已验收 A。仅可将脱敏后的原始审计证据作为文件提交/推送到独立审计分支，不能把需要保留的源代码路径当作开发分支产品提交。

## 4. Codex 审计取证任务结果格式
- 审计分支与 commit SHA、GitHub 审计目录 URL。
- 来源产品 HEAD、产品文档 HEAD、执行时 Git status 和实际文件差异。
- T01～T36 逐项真实状态，说明 31 主用例与 25/11 分配口径。
- 本轮对核心六项风险的独立检查结果（PASS/FAIL/BLOCKED/NOT RUN，截图/trace/代码引用）。
- P0/P1/P2/P3 发现与复现路径；特别明确业务功能阻断与生产范围阻断。
- 证据缺失/未归档原因，不宣称未上传文件已可供 ChatGPT 查看。
- 原工作区最后状态与保护清单，原产品源码是否有任何变更（应为否）。
