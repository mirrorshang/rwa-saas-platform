# 源码复核定位

完整原样快照为本目录 `InstrumentPage.tsx` 与 `instruments.ts`；完整未提交差异为 `source-diff.patch`。以下行号对应这两份**当前**源码快照，原仓库路径分别为 `prototypes/website-ui-preview/src/issuer-r2/InstrumentPage.tsx` 和 `prototypes/website-ui-preview/src/issuer-r2/data/instruments.ts`。

| 逻辑 | 文件及行号 | 实际行为 |
| --- | --- | --- |
| Asset 文件换版及历史 | 原仓库 `src/issuer-r2/data/assets.ts:107` | `appendDocument` 追加版本并更新 `currentVersionId`；既有版本保留。该文件本轮未修改。 |
| 固定引用及复核戳 | `instruments.ts:7-21` | 引用保存 `fileId + versionId`；可选 `reviewedAssetVersions[fileId]` 记录用户最后复核时见到的 Asset 当前版本。旧数据缺少该字段时以固定引用版本作为比较基准。 |
| 受影响检测 | `instruments.ts:14-23` | 当前 Asset 文件版本与复核基准不同，就返回文件名、原引用版本、当前版本和当前扫描状态；刷新后可从存储数据重算。 |
| Ready 检查 | `instruments.ts:47-86` | 原有字段、核心文件、Asset Ready、固定引用检查保留；当前被引用文件的新版本待扫描或失败也阻断。 |
| 对下一步可用的 Ready | `instruments.ts:88-90` | 共享派生函数同时要求持久 `status=ready`、无 Ready 问题、无受影响引用。持久 `status` 本身并不等于当前可进入下一步。 |
| 历史保存及复核完成 | `instruments.ts:98-119` | 草稿版本历史包含原引用与复核戳；显式执行 `markInstrumentReady` 且现有检查通过后，保存当时 Asset 当前版本的复核戳，固定引用不自动改写。 |
| 摘要与 CTA | `InstrumentPage.tsx:18-22` | 摘要展示原引用/当前版本及复核提示；「前往发行管理」只在共享派生函数为真时显示。只读状态由同一函数派生。 |
| 继续旧版或选择新版 | `InstrumentPage.tsx:41-49,54-55,63` | 勾选新版本会替换同一 `fileId` 的选中引用；继续旧版要求明确确认，然后保存并重新检查。新版本待扫描/失败不可勾选，原固定版本保持可见。 |
| Token 输入和结果卡 | `InstrumentPage.tsx:52,62`；`instruments.ts:25-45` | 正整数且在安全整数范围内才显示理论容量；0、负数、小数、空值、非数字显示错误和「暂无法计算」。精确拆分仍由 `exactSplit` 检查。 |
| 浏览器存储 | `instruments.ts:91-96`；原仓库 `data/assets.ts:63-66`、`data/preview.ts:5,67,83,208` | 当前为按浏览器上下文隔离的 `sessionStorage`；退出仅清除登录会话，未清除原上下文业务记录。 |

边界：共享 Ready 函数只服务当前前端原型及未来调用方；Offering 新业务尚未实现，没有服务端准入、并发保护、真实扫描、法律审批或链上授权。不能把前端 CTA 阻断解释为生产环境防绕过。
