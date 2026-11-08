# DEV-03/04 P1 编辑页 Ready 徽标修复复核包

本目录是对前一审计包 `../dev-03-04-p1-fix-2026-11-08/` 的独立 follow-up。前一审计提交为 `e8506cd2c8d8af614aa092bf6c8f788af62ded4f`；原始 40 PASS / 0 FAIL / 1 BLOCKED 证据未修改。产品工作区 `D:\RWA-SAAS-Issuer-R2` 仍在 `feat/issuer-r2-rebuild`、HEAD `39e200c7df40647eed66eb579b4cc7e164e28acd`，源码修复未提交或推送。

## 源码与 Git 证据

| 文件 | 内容 |
| --- | --- |
| `InstrumentPage.tsx` | 修复后完整源码快照，仅在审计目录归档 |
| `source-before-after.patch` | 前一审计快照与本轮源码的完整差异；仅编辑页徽标判定变化 |
| `git-status.txt` | 原产品工作区 porcelain v2、short、全部 tracked/untracked 清单 |
| `git-diff-check.txt` | 原产品工作区 `git diff --check` 输出与退出码 |
| `git-summary.txt` | 原分支、HEAD、变更统计及前后源码 SHA256 |
| `capture-follow-up.cjs` | 只读采集上述源码与 Git 材料的脚本 |
| `sha256-inventory.txt` | 本 follow-up 所有归档文件的路径和 SHA256（不含清单自身） |

修复使用原有 `instrumentReadyForNextStep(existing)` 作为编辑页徽标的共享 Ready 来源。未复核的历史 Ready 显示「资料需复核」；Asset 未 Ready 不显示绿色；普通 Draft 显示「资料草稿」。文件版本提示、旧版确认、新版显式选择和复核操作保持原逻辑。没有修改 `instruments.ts`、Offering 或持久化模型。

## 本轮实际验证

`verification-summary.json` 汇总命令、退出码、运行时 HEAD、逐项结果和脚本路径。TypeScript、ESLint、正式 Build、Demo Build **均退出码 0**，原始输出在 `logs/`。真实 Chrome 演示构建地址为 `http://127.0.0.1:4178`。

| 浏览器批次 | 结果 | 证据目录 |
| --- | --- | --- |
| 新增编辑页 A～F、普通 Draft G，连同原 P1/P2 场景 | 20 PASS / 0 FAIL / 1 BLOCKED | `editor-ui/`：`verify.cjs`、`results.json`、A～F/G 截图、`trace.zip` |
| P1/P2 独立复跑 | 13 PASS / 0 FAIL / 1 BLOCKED | `p1-p2/`：脚本、JSON、截图、trace |
| DEV-03 回归 | 10 PASS / 0 FAIL | `regression-dev03/` |
| DEV-04 回归 | 10 PASS / 0 FAIL | `regression-dev04/` |
| 四种 Asset、三种 Instrument Ready 矩阵 | 7 PASS / 0 FAIL | `ready-matrix/` |

两处 BLOCKED 是两份聚焦脚本重复记录的既有「全新浏览器上下文未登录」观察；它不属于新增 A～F 测试。原审计包中的 sessionStorage 专项 A～F 结论仍有效：同上下文恢复，跨上下文同邮箱登录不能恢复 Mock 资料。本轮没有改变 `sessionStorage`，也未验证生产服务端、并发、真实扫描或发行准入。

审计分支只新增本目录，未创建 PR、未修改 PR #8。此包供 ChatGPT 独立复核，**不代表 DEV-03/04 阶段验收 A**。
