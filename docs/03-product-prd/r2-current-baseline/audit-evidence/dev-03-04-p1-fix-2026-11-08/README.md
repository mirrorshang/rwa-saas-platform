# DEV-03/04 P1 修复独立复核材料

此目录仅归档本地未提交修复的源码快照和原始验收证据，供独立审计。它**不是**产品需求更新、源码合并或阶段验收 A。原开发工作区：`D:\RWA-SAAS-Issuer-R2`，分支 `feat/issuer-r2-rebuild`，采集时 HEAD `39e200c7df40647eed66eb579b4cc7e164e28acd`。本审计分支从最新远端 `docs/r2-current-product-baseline` 的 `ef1ef6239d36bafb4b7dcdd2c2da19c0279fffeb` 建立独立 worktree；PR #8 未改动。

## 主文件索引

| 文件 | 内容 |
| --- | --- |
| `source-diff.patch` | `git diff HEAD --` 两份指定源码的完整原始输出 |
| `InstrumentPage.tsx` | 当前工作区完整源码快照，仅放在审计目录 |
| `instruments.ts` | 当前工作区完整源码快照，仅放在审计目录 |
| `evidence-manifest.json` | 原始完整 40 PASS / 0 FAIL / 1 BLOCKED 测试清单，逐字节复制 |
| `git-status.txt` | porcelain v2、short、全部已修改 tracked 和逐文件 untracked 清单 |
| `git-diff-check.txt` | `git diff --check` 完整输出及退出码 |
| `git-summary.txt` | 原分支、HEAD、`git diff --stat HEAD`、变更文件及 trace 哈希 |
| `session-storage-review.md` | A～F 独立浏览器持久化复核及判读 |
| `source-review-notes.md` | 关键 Ready、文件引用、CTA、Token 判断的源码行号 |
| `test-evidence-index.md` | 40/0/1 每项测试到脚本、断言、截图或 trace 的映射 |

## 原始浏览器材料

`browser-evidence/` 是原工作区 `evidence/dev-03-04-p1-fix-2026-11-08/` 的完整原样副本，包含原始 `results.json`、`matrix-results.json`、`verify.cjs`、`ready-matrix.cjs`、DEV-03/04 各 10 项回归脚本与结果、截图、构建日志和 `trace.zip`。完整逐文件路径与 SHA256 见 `file-inventory.txt`。`trace.zip` 为 **2,787,826 字节**，SHA256：`25808f8c5caed86eb1067b9d9e820cf8bb2f2625de0a241f5cae33a3614bdc13`。

本次新增专项原始材料：`session-storage-review.cjs`、`session-storage-browser-results.json`、`session-A-refresh.png` 至 `session-F-reopened-context.png`。采集脚本 `capture-git-evidence.cjs` 只读取原工作区并将 Git 输出写入本审计目录。所有原始材料均保留在开发工作区；本分支没有修改产品源码路径。

目录内 `.gitattributes` 仅用于保留两份原始构建日志的 CRLF 字节。归档的 `source-diff.patch` 和 Git 原始输出保留了源文件固有空白，因此对**归档新增文件**执行 `git diff --cached --check` 会报告原始文本中的空白；原开发工作区执行的 `git diff --check` 退出码为 0，详见 `git-diff-check.txt`。

**证据边界：** 40/0/1 是既有开发批次的实际浏览器结果，非本包重新执行的全部用例。新增 A～F 为 4 PASS / 2 FAIL；E/F 反映 `sessionStorage` 跨上下文不共享，同邮箱重新登录后原资料不可恢复。Mock 扫描不代表真实扫描，前端 Ready/CTA 不代表生产服务端准入。
