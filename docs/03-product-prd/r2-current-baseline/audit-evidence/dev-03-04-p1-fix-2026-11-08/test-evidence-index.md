# 原始浏览器证据逐项索引

原始 [`evidence-manifest.json`](evidence-manifest.json) 记录运行时 HEAD、时间、Fixture、浏览器上下文、命令与逐项状态。其计数是 **40 PASS / 0 FAIL / 1 BLOCKED**：聚焦测试 13 PASS + 1 BLOCKED，隔离 Ready 矩阵 7 PASS，DEV-03/04 回归各 10 PASS。原始脚本、JSON、截图、构建日志与 trace 均逐字节复制至 `browser-evidence/`，未重写原始材料。下表的「断言」是脚本中实际检查的摘要；无专属 PNG 的测试明确标注，不能把相邻截图当作该项的单独视觉证据。

## P1 / P2 聚焦测试

脚本：`browser-evidence/verify.cjs`；结果：`browser-evidence/results.json`；全部交互可由 `browser-evidence/trace.zip` 复核。

| 项目 | 结果 | 主要断言 | 专属 PNG |
| --- | --- | --- | --- |
| P1-01 | PASS | 初始 Ready 时 CTA 可见 | 无；trace |
| P1-02 | PASS | 上传 V2 后历史含 V1/V2，固定引用仍为 V1，CTA 阻断 | 无；trace |
| P1-03 | PASS | 待扫描 V2 无法使 Asset Ready | 无；trace |
| P1-04 | PASS | Asset 再次 Ready 后 Instrument 仍阻断，显示 V1/V2 | `browser-evidence/01-affected.png` |
| P1-05 | PASS | 刷新、TAB、直接路由后 CTA 仍阻断 | 无；trace |
| P1-06 | PASS | 取消旧版复核后 CTA 仍阻断 | 无；trace |
| P1-07 | PASS | 明确确认 V1 后固定引用未变、V2 复核戳已保存、CTA 恢复 | `browser-evidence/02-old-version-reviewed.png` |
| P1-08 | PASS | V3 再触发阻断；显式选 V3 后历史保留、CTA 恢复 | `browser-evidence/03-new-version-reviewed.png` |
| P2-01 | PASS | 输入 0 时容量不可计算且显示错误 | 无；trace |
| P2-02 | PASS | 输入负数时容量不可计算且显示错误 | 无；trace |
| P2-03 | PASS | 输入小数时容量不可计算且显示错误 | 无；trace |
| P2-04 | PASS | 输入空值、非数字时容量不可计算且显示错误 | 无；trace |
| P2 recovery | PASS | 改回有效整数后计算恢复 | 无；trace |
| New browser context | BLOCKED | 新隔离上下文未登录时被拦截，不能据此判断同账号重登数据 | 无；专项 A～F 另测 |

## Ready 矩阵

脚本：`browser-evidence/ready-matrix.cjs`；结果：`browser-evidence/matrix-results.json`。每项使用独立 Chrome Context；预置已通过 **Mock** 扫描的隔离 Fixture，在真实 UI 点击「完成资料检查」，断言持久 Ready 状态。Instrument 还断言固定引用复核戳和 CTA。Fixture 的邮箱、ID、模板、类型和运行时间见 JSON。

| 项目 | 结果 | 截图 |
| --- | --- | --- |
| ASSET-1 住宅 | PASS | `browser-evidence/matrix-ASSET-1.png` |
| ASSET-2 写字楼 | PASS | `browser-evidence/matrix-ASSET-2.png` |
| ASSET-3 商铺 | PASS | `browser-evidence/matrix-ASSET-3.png` |
| ASSET-4 工业园／仓储物流 | PASS | `browser-evidence/matrix-ASSET-4.png` |
| INSTRUMENT-1 股权 | PASS | `browser-evidence/matrix-INSTRUMENT-1.png` |
| INSTRUMENT-2 债权 | PASS | `browser-evidence/matrix-INSTRUMENT-2.png` |
| INSTRUMENT-3 收益参与 | PASS | `browser-evidence/matrix-INSTRUMENT-3.png` |

## DEV-03 回归

脚本：`browser-evidence/regression-dev-03/verify.cjs`；结果：同目录 `results.json`。断言详情与准确步骤见脚本各 `run()` 块。

| 项目 / 断言主题 | 结果 | 专属截图 |
| --- | --- | --- |
| U01 认证进入资产列表及空状态 | PASS | `01-empty.png` |
| 8 大类、24 子类、四模板开放 | PASS | `02-categories.png` |
| 住宅草稿保存与刷新恢复 | PASS | `03-draft.png` |
| Draft 换子类确认及公共字段保留 | PASS | 无专属截图 |
| 非法面积阻止保存 | PASS | 无专属截图 |
| 缺项、扫描、Ready 检查 | PASS | `04-ready.png` |
| 四 TAB 和发行管理空状态 | PASS | `05-offering-empty.png` |
| Ready 换类限制及文件版本历史 | PASS | `06-file-version.png` |
| 其他三模板动态字段及缺项 | PASS | `07-subtypes.png` |
| 多图添加、排序、移除、恢复 | PASS | `08-gallery.png` |

## DEV-04 回归

脚本：`browser-evidence/regression-dev-04/verify.cjs`；结果：同目录 `results.json`。断言详情与准确步骤见脚本各 `run()` 块。

| 项目 / 断言主题 | 结果 | 专属截图 |
| --- | --- | --- |
| Asset Ready 后创建权益结构 | PASS | `01-single-page.png` |
| 三种权益类型动态字段和单页结构 | PASS | 无专属截图 |
| 精确拆分及非法数值阻止 Ready | PASS | 无专属截图 |
| Draft 保存、刷新、重复创建阻止 | PASS | `02-draft.png` |
| 固定文件引用及核心文件扫描 | PASS | `03-file-reference.png` |
| Ready、一资产一结构、发行空状态 | PASS | `04-ready.png`、`05-offering-empty.png` |
| Free / Standard 及降级历史只读 | PASS | `06-downgraded.png` |
| Ready 类型限制及文件引用不漂移 | PASS | `07-fixed-version.png` |
| 官网和旧 Issuer 基本路由 | PASS | 无专属截图 |
| 移动端无横向溢出 | PASS | `08-mobile.png` |

上述 40 PASS 是原始开发批次的测试结果，**不是本次独立产品阶段验收结论**。新增 sessionStorage A～F 结果另见 `session-storage-review.md`，不回写原始 40/0/1 清单。
