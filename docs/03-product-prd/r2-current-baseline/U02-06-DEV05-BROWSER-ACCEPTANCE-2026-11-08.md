# RWA SaaS R2 U02-06｜DEV-05 Offering 浏览器与异常验收矩阵（候选 v0.1）

> 2026-11-08。根据已批准 R01～R36、[字段级 UI-Ready](U02-06-OFFERING-UI-READY-PRD-2026-11-08.md)和[状态及异常矩阵](U02-06-OFFERING-STATE-EXCEPTION-MATRIX-2026-11-08.md)编制。**本文件只是待执行的测试计划，全部用例初始为 NOT RUN；没有真实 DEV-05 构建、代码或浏览器测试证据。**具体智能合约与合规资金系统独立准入，不能以 Mock PASS 代替生产测试。

## 1. 测试基线与方法
- 产品基线：docs/r2-current-product-baseline 当前 Approved 规则；历史 Draft Master 与旧源码不可覆盖新 R2。PR #8 继续 Draft/Open/Unmerged。
- 用户最后报告的源码工作树：D:\RWA-SAAS-Issuer-R2，feat/issuer-r2-rebuild，DEV-03/04 本地 commit 39e200c7df40647eed66eb579b4cc7e164e28acd。Codex 开始任何工作前须重查真实 HEAD、分支、git status 与未提交文件，不能假定仍处于该提交。
- 场景基于隔离测试 Tenant/独立 Mock 控制台；测试支付、认购、Token 数据绝不写成真实 Free 套餐客户的资金或 Token。
- 每个用例记录：当前 HEAD、输入 fixture、真实 Chrome 操作步骤、浏览器 URL、预期、实际、结果（PASS/FAIL/BLOCKED/NOT RUN）、trace/screenshot 路径及边界。
- TypeScript、ESLint、正式/演示 build、路由和真实截图应独立复测。未运行时结果必须 NOT RUN，不能因先前 Codex 报告而自动 PASS。
- 产品前端验收与真实钱包、链上支付、Mint、法律签署/Provider、安全审计为两条独立的结论。

## 2. UI/字段与草稿 T01～T16
| ID | 实操场景 | 必须断言 | 当前 |
|---|---|---|---|
| T01 | Asset 详情「发行管理」从无 Offering 到新建 | 唯一创建入口；无独立 Project/发行准备左侧二级菜单 | NOT RUN |
| T02 | 没 Instrument 或未 Ready 的 Asset 进入该 TAB | 清楚显示阻断和「先完成权益结构」，不能伪造可发行 | NOT RUN |
| T03 | 创建 Offering 查看所有分区 | 单页 A 发行信息、B 投资者认购条件、C 发行准备；Asset/InstrumentVersion 只读继承 | NOT RUN |
| T04 | 自动建议名称后用户改名，保存刷新 | 用户改名保留；不覆盖历史期次 | NOT RUN |
| T05 | 输入 3,000 Token、每 Token 120 U | 计划最高募集显示 360,000 U，而非 3,000 U；不是已募集金额 | NOT RUN |
| T06 | 价格 120 U、单笔最低 200 U | 至少 2 Token、实际最低付款 240 U；不允许分数 Token 隐式截断 | NOT RUN |
| T07 | Token 数量空、0、负数、小数、超过可用量 | 字段错误贴近输入；禁止通过检查；不显示 NaN/Infinity | NOT RUN |
| T08 | 单价、最低认购额输入 0、负数和非法文本 | 对应定位报错；不可计算虚假募资金额 | NOT RUN |
| T09 | 开始/截止时间倒置、同刻、跨时区显示 | 时间必须开始早于结束，时区明确；未来开售不得显示在售 | NOT RUN |
| T10 | 投资者类型/地区/KYC、锁仓模式切换 | 不默认全球开放；只允许无锁仓或固定天数；法律转让限制保留 | NOT RUN |
| T11 | 支付币种网络区域 | 只读 OP Mainnet · USDT，不出现自由切换或旧 USDT 地址生产承诺 | NOT RUN |
| T12 | 同 Tenant 已绑定 MPC、自绑定钱包、任意外部钱包 | 仅可选符合绑定控制权条件的钱包作为最终结算账户 | NOT RUN |
| T13 | Draft 保存、刷新、退出重登后打开 | 已存字段与固定文件版本恢复；Draft 不预留 Token、不生成链资金 | NOT RUN |
| T14 | 缺协议、风险披露、收款钱包、权益 Ready 时检查 | 两组检查分别显示业务完整性与生产准入；缺项能定位而不丢草稿 | NOT RUN |
| T15 | 文件上传失败/扫描中/引用资产文件新版 | 旧 file_id + version_id 引用不漂移；失败后正确阻断和重试 | NOT RUN |
| T16 | 草稿中预览与最终预览 | 映射资产卡片/详情、权益/价格/条件、风险文件；缺项标注，不造虚假收益、持仓或订单 | NOT RUN |

## 3. 权限、发行生命周期及容量 T17～T30
| ID | 实操场景 | 必须断言 | 当前 |
|---|---|---|---|
| T17 | KYB 通过的新 Free 保存/预览/点击发布 | 可创建正式 Draft 与内部只读预览；发布转升级说明且零生产写入 | NOT RUN |
| T18 | Standard 且生产 Provider/Signer 未通过 | 禁止真实发布、Mint、收款或对外上架，不允许 Mock 伪造成功 | NOT RUN |
| T19 | 隔离 fixture：已发布但未来才开始 | 显示等待开始，禁止新认购；到时需实际持续准入检查 | NOT RUN |
| T20 | 隔离 fixture：在售暂停并尝试新订单 | 新单必须阻断，已有支付/退款/交付任务与额度保留 | NOT RUN |
| T21 | 已暂停后到了截止时间再点击恢复 | 不能恢复并显示原因 | NOT RUN |
| T22 | 已到期但仍有支付、Token 交付或退款在途 | 停止新单，保留全部历史；不得直接关闭并释放相关额度 | NOT RUN |
| T23 | 预留 3,000，已交付 1,800，在途 200，清洁未售 1,000，受控关闭 | 已交付继续占权利；在途保留；仅无义务的 1,000 释放 | NOT RUN |
| T24 | 一个 Instrument 已在售，另一 Offering Draft 尝试同时开放 | Draft 可建；不得第二期同时实际开放认购或超发 | NOT RUN |
| T25 | 已发布后改钱包、InstrumentVersion 或法律文件 | 固定发布快照和已生成订单不受篡改；未经批准的变更入口阻断 | NOT RUN |
| T26 | Standard 宽限及降级 Free 历史用户 | 按 U01 宽限与降级只读处理，不等于新 Free 的准备权限 | NOT RUN |
| T27 | 篡改 URL/对象 ID 访问其他 Tenant Asset、Wallet、File 或 Offering | 可信服务层阻断，不泄露或更新其他企业数据 | NOT RUN |
| T28 | Mock 支付授权拒绝、余额不足、交易失败 | 不能显示付款/交付完成，不重复扣减或造 Token | NOT RUN |
| T29 | Mock 非原子支付成功而 Mint 失败 | 订单异常可追踪，企业未提前结算；存在合规退款/恢复提示 | NOT RUN |
| T30 | 双标签重复提交/并发更新、重复订单事件 | 不重复占用额度/订单/Mint/退款；无可信服务端则 BLOCKED，不虚报并发安全 | NOT RUN |

## 4. 构建/浏览器/回归 T31～T36
| ID | 检查 | 断言 | 当前 |
|---|---|---|---|
| T31 | TypeScript / ESLint / 正式 build / 演示 build | 最终 HEAD 各命令、退出码与日志可复核 | NOT RUN |
| T32 | 浏览器直接进入关键路由、刷新/后退/空状态 | 页面路由正确，没有重定向回旧 Issuer 或破坏官网 | NOT RUN |
| T33 | Chrome 桌面、窄屏、手机宽度 | 单页分区、长地址、文件行、错误提示、底部 CTA 均可读可点 | NOT RUN |
| T34 | 四房地产模板 + 三 Instrument 类型跨模块继承 | 权利映射/文件版本/额度不重复填写、不跨类型串值 | NOT RUN |
| T35 | 独立 Mock 场景切换与复位 | 各测试 Tenant/场景隔离，不混合正式 Free 与模拟投资订单 | NOT RUN |
| T36 | 用户体验终审 | 每个关键视图都有「当前状态、缺项、下一步主动作」；不暴露 PRD 内部代号 | NOT RUN |

## 5. 真实生产系统必须单列 BLOCKED / NOT VERIFIED
| 门槛 | 未获授权事项 |
|---|---|
| 法律与投资者资格 | 适用法域、受监管活动边界、资产和权益法律证明、KYC/AML、投资协议真实签署 |
| OP Mainnet USDT 真实支付 | 2026-09 USDT 合约迁移后的官方支持、实际 Token 地址/decimals、合约风险/冻结及钱包兼容 |
| DvP/资金托管/退款 | 真实合约验证、原子 Mint 权限或异步安全托管、退款权、资金保管责任、安全审计 |
| 企业钱包和 Signer | 真正控制权验证、密钥管理、平台是否能动用资金、变更记录 |
| 订单/资金/Token 权威账本 | 真实网络确认、并发幂等、回滚、链上/链下对账、事故恢复 |

以上门槛不因 T01～T36 前端 Mock PASS 而自动放行。

## 6. 最终验收报告输出模板
- 基线：真实工作树/分支/HEAD/git status/PRD SHA 与未跟踪文件
- 运行：tsc、lint、build、demo build 的完整命令与退出码
- Browser：T01～T36 每项 PASS/FAIL/BLOCKED/NOT RUN、截图与 trace 证据
- P0/P1/P2 问题：复现步骤、受影响状态、是否出现假成功/资金权利被错误修改
- 残余 Open：真实合约、USDT、钱包、支付、法律签署和资产类差异
- 结论：仅对已验证范围是否可进入用户人工验收；**不得单凭 Codex 的 PASS 宣称总控或生产验收通过**

## 7. 执行边界
本验收矩阵只是候选交付资料。当前未授权 DEV-05 开发，不触碰源码、主网、旧 Master/Frozen、193 项历史版本表、历史 DEC/SCOPE、根 README、PR #6，PR #8 仍 Draft/Open/Unmerged。
