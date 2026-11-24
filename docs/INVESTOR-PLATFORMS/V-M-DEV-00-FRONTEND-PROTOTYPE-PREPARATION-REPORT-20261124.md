# V/M 投资者平台 DEV-00 前端原型工程准备报告

> 2026-11-24｜AUDIT + PLAN ONLY｜依据 PR #16 当前 Draft/Open/Unmerged 的 UI-Ready v0.1 文档。此报告是实施工作单，不代表 DEV-01 已启动或任何页面已实现。

## 1. 审计结论与版本

- 仓库：`mirrorshang/rwa-saas-platform`。正式工程基线：`release/v1-engineering-handover-20261116`；V/M 当前产品依据：`docs/vm-investor-ui-ready-20261124`，PR #16 head `3d95827aac848ad8f1181c14d035d5fe7a0833e4`，base `48e3e0b65b125d301975f7f25c3bb4c9321977d5`。PR 经 GitHub 查询为 Draft/Open/Unmerged。
- 本地 release worktree/跟踪引用均为 `8785e8eaa4f03075849746d664d0d90631d73c8c`，早于 PR #16 的 base。故本报告的 V/M 规则直接核对远端 PR 文档；DEV-01 开始前须重新同步远端并核对两分支 HEAD，不能把本地旧快照当最新 release。
- 当前主工作树在 `ui/issuer-asset-issuance-complete-v1`，存在大量已修改/未跟踪的 Issuer 原型文件；另有多个独立 worktree。未清理、覆盖、移动或提交这些工作。DEV-00 报告使用独立分支，未改官网、Issuer、Frozen/DEC/SCOPE 或 PR #16。
- 产品版本优先级：PR #16 六批已确认 V/M 规则和开发计划；历史候选 V/M 页面表只用于 ID 追溯；Issuer 金融与法定事实边界沿用当前已批准契约。此阶段仅产品、PC Web UI/UX、可运行前端 Mock 与最终产品 PRD；真实服务、API、数据库、KYC/MPC/合约/资金执行均排除。

## 2. 现有工程与复用判断

| 来源 | 实查现状 | DEV-01 使用方式 |
|---|---|---|
| `apps/website` | React 19、TypeScript、Vite 6、TanStack Router、Zustand；`src/main.tsx` 显式声明路由；`src/design-system/` 有 Button、Field、Select、Badge、Alert、Card、Empty、Loading、Error、Dialog、Drawer、Table、Pagination 及 token。 | 参考基础控件行为、可访问状态、路由和测试脚本。提取设计思路或复制后独立维护，避免从网站源码跨应用直接引用。 |
| `apps/issuer` | React 19、Vite 8、Tailwind 4、lucide-react；`src/App.tsx` 为九模块 Issuer 工作台，`src/data.ts` 含演示状态；远端 package 有 `test` 脚本。 | 参考字体、间距和状态表达；不移植侧边工作台导航、Issuer 管理权限或本地资金主账。 |
| 两应用运行 | 独立 package/lockfile，`apps/README.md` 说明分别安装、启动、构建。Website 的旧 Issuer 演示代码不是正式 Issuer 主实现。 | 新应用独立 package/lockfile，沿用 React+TS+Vite。路由建议使用现有 Website 的 TanStack Router 写法；Mock 状态留在新应用内。 |
| 不宜复用 | Issuer 工作台外壳、租户管理员动作、localStorage 金融状态，以及旧 USDC/取消/退款入口。 | 投资者站点采用顶部横向导航；共用 V/M 页面，按渠道配置品牌与可见数据。 |

推荐新目录 `apps/investor-portal/`，无需扩成复杂 monorepo。建议结构：`src/app`（路由/渠道上下文/页面外壳）、`src/pages`（单份共享页面）、`src/ui`（展示模块及 token）、`src/domain`（纯展示规则、金额/状态映射）、`src/mock`（fixtures、场景、状态推进、控制台）、`src/assets`。Mock 数据与 UI 通过一个小型场景接口连接：载入场景、读取当前快照、施加允许的演示事件、重置。该接口同时供页面和自动检查使用，避免每页各有一份状态。仅在需要真实变化的地方设模块接口；V/M 共用同一实现，不建立两套空壳适配层。

## 3. 页面、导航与路由工作单

建议演示前缀 `/v/:issuerSlug` 与 `/m`，共享路由内容以 `/:channelRoot` 表示；这只是 Mock 路由，不模拟真实域名或服务端授权。所有详情 ID 从同一 fixture 取数，刷新可恢复演示场景；未知 ID/无权查看给受控页面。登录保留 `returnTo`，只允许站内已知路径。公开页：首页、投资机会、详情、企业资料、帮助；“我的投资/账户/工单”要求演示登录。

| 共享路由模板 | V ID | M ID | 复用与差异 |
|---|---|---|---|
| `/` | V-01 | M-01 | 共用 Header/区域结构；V 企业品牌、RWA 介绍和本企业机会；M 多企业发现和有效 Listing |
| `/opportunities` | V-04 | M-02 | 同列表/卡片/筛选；M 加 Issuer 筛选，只有最终有效 Listing |
| `/opportunities/:offeringId` | V-05 | M-04 | **完全同一**详情模板和权益/资产动态字段；数据范围不同 |
| `/issuers/:issuerId` | V-05 关联 | M-03 | **完全同一**企业资料模板；V 只列本企业 V 可见机会，M 列本企业 M 有效 Listing |
| `/login` | V-01 关联 | M-05 | 同一 OTP/首登建号流程，账户 scope 独立 |
| `/account/profile` | V-02 | M-06/M-16 | 同一账户资料；M 安全/隐私归入账户内页，不设一级导航 |
| `/account/kyc` | V-03 | M-06/M-08 | 同一状态页；M-08 是认购前 Gate 提示，不另造资格向导 |
| `/account/wallets` | V-12 | M-07 | 同一 MPC/自有钱包状态与默认切换，历史地址不回写 |
| `/subscribe/:offeringId/quote` | V-06 | M-09 | 四步第 1 步；M 多验 Listing 有效 |
| `/subscribe/:offeringId/documents` | V-07 | M-10 | 第 2 步；文件版本与签署状态独立 |
| `/subscribe/:offeringId/payment` | V-08 | M-11 | 第 3 步；OP Mainnet USDT、合约付款 Mock |
| `/subscribe/:offeringId/progress` | V-09 | M-12 | 第 4 步；付款、配售、登记、Token 四事实分别展示 |
| `/investments/orders`、`/investments/orders/:id` | V-10/V-11 | M-13 | 订单/退款事实查询；无主动取消/手动退款表 |
| `/investments/holdings`、`/:id` | V-13 | M-14 | 法定权益与 Token 两列；M 聚合仅本 M 账户授权 |
| `/investments/distributions`、`/:id` | V-14 | M-15 | 股息、利息、参与收益、本金分型；本金单独统计 |
| `/messages`、`/disclosures` | V-15 | M-15 | 消息和文件按当前账户/渠道授权 |
| `/support`、`/support/tickets/:id` | V-10～15 关联 | M-13/M-16 关联 | 帮助、提交工单、查看/回复；关联原业务只读 |
| `/demo` | 演示工具 | 演示工具 | 独立控制台，开发/演示模式可见；正式投资页面无调试按钮 |

PC 顶部：Logo｜首页｜投资机会｜我的投资｜帮助与客服｜消息｜账户。我的投资用订单/持仓/收益页签；账户内部用局部左菜单。详情到企业页保留来源返回路径；四步认购和异常工单均可回原 Offering/订单。未知、下架、未授权与空态各有明确回退。

## 4. UI 模块及视觉方向

共用展示模块：SiteHeader/Footer、OfferingCard/SearchFilter、AssetDetailShell、AssetTemplateFields（六资产）、InstrumentTerms（三权益）、IssuerProfile、SubscriptionSummary/Stepper、OTPLogin、KYCStatus、WalletPicker、PaymentTimeline、OrderView、HoldingView、DistributionView、DisclosureList、SupportTicket。列表卡统一字段，权益收益摘要按合同类型动态展示，Unknown 不显示为 0；详情中资产资料、法律权益、Offering 价格三个版本分开。

三个可评审方向：
1. **推荐：可信投资产品站**。浅色留白、深蓝/灰正文、克制青蓝操作色、清晰表格与风险文案。V 的品牌色只用于 Logo/少量强调，M 使用统一平台色。适合两端共用、长流程与法律文件阅读。
2. 编辑式资产发现：大幅真实资产图、杂志式版面，适合首页；详情和流程必须回归高密度信息布局，制作成本较高。
3. 数据终端式：高密度卡片/指标，利于订单与持仓，但首页不够面向首次投资者，容易沿袭后台感。

DEV-01 先做 1440px 桌面视觉样板，核对 1280px 与 1920px；布局、字号、对比度、焦点、键盘操作与长文案真实检查。颜色不能承担唯一状态提示；收益/风险不使用营销式保证措辞。只规划 PC，不把 H5 适配当交付项。

## 5. Mock 数据与演示控制台

最小关联模型（仅前端 fixture）：Issuer → Asset → InstrumentVersion → OfferingSnapshot；M Listing 单独关联 Offering；V/M Account 分 scope；Order 固定 channel、报价/文件/钱包快照；Payment、Allocation、LegalHolding、TokenDelivery、Distribution、Principal、Ticket 各自独立状态/引用。一个 Offering 在 V/M 共用容量计数，不复制两份库存；页面只从同一场景快照读取。金额用精确十进制表示的演示值，禁止浮点展示错误；缺失为 Unknown。

预置六资产：住宅、写字楼、商铺、工业园/仓储、非上市普通股权、单笔企业借款；覆盖股权、债权、收益参与三权益。至少两个 Issuer，住宅收益参与、12% 固定债息按月付息到期还本、股权无股息决议三个主样例；其余房地产不编造租金/年化。M 有 V 可见但 Listing 未批准、已批准同步 Unknown、有效、下架四状态。同邮箱 V/M 两账户分别维护会话、钱包、私有订单。

状态场景：OTP 错误/过期/Unknown；KYC 未开始/处理中/补件/通过/拒绝/过期/Unknown；MPC 创建中/就绪/失败/Unknown及自有钱包未验证/已验证；报价失效/容量不足；文件未阅读/签署中/有效/Unknown；付款拒签、余额或 Gas 不足、交易回滚、已广播 Unknown、FinalMatched；配售、法定登记、Token 交付各有 Pending/Confirmed/Failed/Unknown；自动过期仅无在途款时可演示；退款只按符合条件的 Mock 事实模拟；收益无决议/无可分配额/部分还本/Claim 或 Push；工单四种投资者状态。Mock 控制台提供一键场景、单域切换、重置与当前状态摘要，施加事件时守卫阻止不可能组合，保留“矛盾事实待核”异常场景用于 UI 展示。所有支付/地址/TX 明显标记 Mock，绝不调用真实链或 Provider。

## 6. DEV-01～08 可执行分段计划

每批交付共同格式：变更文件、页面/状态、复用模块、运行命令及实际结果、Chrome/Playwright 截图、正常/异常操作记录、待决事项、下批依赖；未运行标 `NOT EXECUTED`。自动检查以用户可见行为与状态守卫为目标，浏览器验收覆盖导航、刷新、空态、错态及两渠道隔离。

| 阶段 | 页面/模块、交互与 Mock | 完成标准、验收与下批依赖 |
|---|---|---|
| DEV-01 | 新建独立工程、路由/渠道上下文、基础 token/Header/Footer/卡片/步骤条；V 首页、M 首页、资产详情、认购四步壳及必要状态文案。示例住宅收益参与+债权；Mock 控制台最小载入/重置。 | Build/TS、直接打开和刷新各路由、1440/1280/1920 截图；人工确认真实 PC 页面视觉、信息层级和风险表达后进入 DEV-02。 |
| DEV-02 | 机会列表、搜索筛选/URL 保留、六资产字段、三权益模板、V/M 共用企业页；M Listing 过滤。补齐六资产与多 Issuer fixture。 | 六资产/三权益动态字段、卡片收益摘要、V 可见 M 不可见、同详情同字段、企业页授权集合的浏览器检查；依赖 DEV-01 外壳确认。 |
| DEV-03 | OTP、资料、KYC、MPC、自有钱包/默认切换及登录返回。补账户隔离和 Provider Unknown 场景。 | 首登→MPC 请求→浏览→认购前 KYC→返回原详情可走通；跨 V/M 账户、错误 OTP、KYC 补件、MPC Unknown、钱包验证失败检查；依赖共享 Offering。 |
| DEV-04 | 整数份数/报价校验、文件阅读/签署、钱包付款 Mock、付款/配售/登记/Token 分态进度。 | 两条主案例连续走通；付款点击不能直达“完成”，Unknown 不盲重试，M Listing 再检查，协议版本和订单快照固定；依赖 DEV-03 账户状态。 |
| DEV-05 | 订单列表/详情、自动过期/受控退款与异常、帮助和工单提交/查看/回复。 | 无主动取消/手动退款入口；回滚不伪造退款，已到账履约失败不伪造完成，工单关闭不改资金；依赖 DEV-04 订单与支付分态。 |
| DEV-06 | 法定/Token 持仓、三权益收益与债权本金、Claim/Push、消息公告文件。 | 本金不计收益、无股息决议不生应付、无可分配额不生收益、登记与 Token 分开；消息/披露按授权；依赖 DEV-04/05 订单历史。 |
| DEV-07 | 全站 PC 回归、视觉一致性、双渠道与两条主案例、空态/异常/刷新/键盘与缺陷修复。 | 实际 Build/Test/Browser 清单、截图及缺陷闭环；有未测项明确标记，不能用构建成功代替浏览器验收；依赖 DEV-01～06 页面完成。 |
| DEV-08 | 依据已验收原型编写逐页最终产品 PRD、Mock 手册、路由与截图、V/M 差异/状态矩阵、验收报告及源码引用，在独立代码 PR 提交。 | PRD 与实际按钮/字段/路由/状态抽查一致；列工程待实现的业务结果，不输出 API/库表/合约设计；依赖 DEV-07 实测证据。 |

## 7. 产品与实施口径缺口

1. PR #16 仍 Draft，文档属于已批准方向的候选正式规格；DEV-01 前记录 PR head 与最后审阅结论，若产品修订只按新批准版本更新工作单，不暗改 Frozen。
2. PR #16 base 比本地 release 新；正式源码复用判断需在同步后的独立开发 worktree 复核，以免引用旧文件或误把 Website 旧 Issuer 代码当当前实现。
3. M 首页“精选”缺经批准排序规则；原型默认最新有效 Listing，不制造编辑精选。首页资产封面/企业 Logo 的授权素材与缺省占位规则需在视觉样板时确定，不能用未授权真实数据。
4. 六资产×三权益并非所有组合都有已批准真实 Offering；Mock 样例只演示合法、可说明的组合，未知适用性不得被前端推断为已开放。
5. Gas 承担、代付、Claim/Push、自动退款实际可用条件仍为生产待决；原型应显示条件状态，不暗示某种生产方式已获批准。
6. 账户跨 V/M 身份及额度聚合以授权主账决定；Mock 只能证明两个渠道账户不自动合并，并展示同一 Offering 容量不重复。不能将演示规则当最终身份判定。

## 8. 推荐立即执行的 DEV-01 工作单

在新独立代码分支（建议 `codex/vm-investor-dev-01`）同步最新 release 与 PR #16 文档版本；建立 `apps/investor-portal` 的 React/TS/Vite、独立锁文件、基础路由/品牌配置、共享页面壳和 Mock 标识；制作 V 首页、M 首页、资产详情、四步认购的可运行 PC 视觉样板。以住宅收益参与和单笔借款债权测试信息结构，附 1440/1280/1920 截图、Build/TS/浏览器结果与可复现步骤。完成后先进行视觉与信息结构审阅，再进 DEV-02。本 DEV-00 未执行这些代码、下载或浏览器测试。

## 9. 本轮实际验证与交付边界

已执行：本地 `git status`、remote/branch/worktree 列举、release 树和 README/应用 package/路由/设计系统源码只读检查；GitHub PR #16 状态和五份现行 V/M 规格远端回读；远端 release package 核对。未执行：依赖安装、Build、自动测试、浏览器页面验收、DEV-01 代码。报告仅文档；现有未提交工作未触碰。
