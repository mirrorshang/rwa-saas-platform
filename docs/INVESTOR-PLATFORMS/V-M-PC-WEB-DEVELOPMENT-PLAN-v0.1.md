# RWA SaaS｜V/M 投资者平台 PC Web 开发总流程与工程交接计划（2026-11-24）

> **状态**：开发准备方案｜已批准产品设计之后的工程执行建议；尚未授权实际源码开发。与 `AGENTS.md` 一致，开发任务须得到明确工程授权再执行。此文件仅作为 PR #16 评审/开发交接依据，不代表任何 DEV 阶段完成。
>
> **范围**：V 单 Issuer 企业专属投资者门户 + M 多 Issuer 统一投资者平台；优先 PC Web。H5/APP、真实生产支付、实际 MPC Provider/KYC/Signer/合约接入独立后续阶段。产品依据：本目录 [README](README.md)、[V/M 共用 PRD](V-M-SHARED-UI-READY-PRD-v0.1.md)、[M 独有页面](M-UNIQUE-PAGES-UI-READY-PRD-v0.1.md)、[跨端审计/验收](CROSS-PLATFORM-CONSISTENCY-AND-ACCEPTANCE-v0.1.md)。
>
> **当前已核实仓库**：正式 release 分支只有 `apps/website`、`apps/issuer` 两个 Vite 应用；未发现独立 V/M 源码。Issuer React 19 / Vite 8 / Tailwind 4，Website React 19 / TanStack Router / Vite 6，依赖版本不同；根目录无工作区声明。Issuer 已有 Mock 45 项测试的历史交付记录，但 V/M 不能直接引用 Issuer localStorage 为权威主账。PR #16 Draft/Open/Unmerged，需先独立审文档，不自动合并。

## 0. 开发目标与成功条件

目标：交付 **一套 PC Web 前端代码，两个受控渠道体验**，按已审核规则能通过真实浏览器执行“公开浏览→邮箱 OTP Mock 注册→自动 MPC Mock→按需 KYC Mock→Offering 认购→OP Mainnet USDT 合约支付 Mock 状态→配售/登记/Token 状态→持仓→收益/本金→异常工单”的演示闭环。至少包含住宅收益参与与企业借款债权两个贯穿案例，另验证六底层资产模板和三权益类型的动态字段与非法组合阻断；不凭 Mock 声称真实交易发生。

完成定义：页面全部存在且有实际交互；PC 产品视觉通过人工验收；全部路由可直达/刷新；对象引用/快照/状态转换和异常保护由 Mock 服务层验证；自动化单测/端到端测试与截图真实执行，未执行必须标 Not Executed；开发文档可让另一工程师复现。正式接生产是**单独项目阶段**。

## 1. 推荐代码架构（开发前的设计选择）

建议新增 `apps/investor-portal` 作为**单一 React/TypeScript/Vite PC 前端**。先使用其自身锁定依赖和测试，避免立即改造根目录为 Monorepo 或与 `apps/issuer` 强耦合。优先对齐现有 Tailwind/React 风格，但不要复制 Issuer 模拟账本/过期页面，也不直接读取 Issuer localStorage。不要把 `apps/website` 中旧 Issuer 代码误作主实现。

建议目录（具体可按前端代码评估微调）：

```text
apps/investor-portal/
  src/
    app/                 # Router、可信 PortalContext、layout、全局错误/权限状态
    components/          # UI primitives、cards、tables、stepper、modal、feedback
    features/
      discovery/         # V/M 首页、列表、详情、Issuer Profile
      account/           # OTP、个人/机构资料、KYC、安全
      wallet/            # MPC 和自有钱包
      subscription/      # 四步认购与真实状态表达
      orders/            # 订单、异常/退款只读
      holdings/          # M12 法定权益和 M07 Token 双视图
      distributions/     # 股息、债息、本金、收益参与；Claim/Push
      disclosure/        # 公告、报告、通知
      support/           # M17 工单和 M18 回复
    domain/              # Asset/Instrument/Offering/Account/Order 等强类型模型
    adapters/
      mock/              # Mock data/state/event/Provider simulator
      contracts/         # 将来接后端的接口契约（无真实外网调用）
    fixtures/            # 住宅/股权/债权、异常链状态、V/M 授权
    tests/               # 单测、RTL/Playwright、截图证据与结果
```

开发态可使用受控演示路径（例如 `/demo/v/:issuerSlug`、`/demo/m`）展示两个品牌和授权范围；正式域名部署时 PortalContext **必须由受信配置/服务端域名解析获得**，生产权限始终在 API 后端重新判断，不以可修改的 URL 参数、localStorage 标记或 CSS 隐藏当作授权控制。渠道数据隔离：V Account scope = 当前 Issuer；M Account scope = 总投资端。即使相同邮箱/自有钱包，历史交易不会无条件合并。

### 共用与差异准则

- 共用同一个 OfferingCard、AssetDetailShell、AssetTemplateFields、InstrumentTerms、IssuerProfilePage、OTPLogin、KYCStatus、WalletManager、SubscribeStepper、OrderStatus、Holding、Distribution、Ticket 组件。
- V 专属：Issuer Logo 与门户品牌、单 Issuer 发布范围、V 账户 scope。
- M 专属：跨 Issuer 搜索/筛选、M23 Listing Gate、M 账户 scope、企业信息聚合。
- 不复制各自独立价格/份额/合约/订单/收益计算主账；Mock 同一 Offering 容量在 V/M 测试中必须共享权威模型。

## 2. 阶段与交付 / 验收门

| 阶段 | 名称与主要任务 | 阶段交付 | 必须通过的验收门 |
|---|---|---|---|
| DEV-00 | 基线与工程方案：核对 PR #16、AGENTS.md、Issuer 真实源码、路由清单、模型/权限矩阵、可重置 Mock 场景、设计令牌及 QA 契约；先不写业务 UI | 工程任务清单、架构图、字段契约、Demo 数据方案、状态图、可复现测试说明 | V-01～15/M-01～16 映射不遗漏；明确产品确认 vs 技术/法务决策门；真实操作均未接入 |
| DEV-01 | 前端脚手架、PC 视觉系统、V/M PortalContext、顶栏/页签、路由、空态/加载/错误/权限、演示渠道切换（仅开发） | 可运行 V/M 双壳，3 个关键空页面的设计候选：V 首页、资产详情、认购步骤 | React Build/typecheck/test 通过；V/M 公共框架一致；PC 横向导航；浏览器截图人工审视觉方向 |
| DEV-02 | 公共发现：V/M 首页、Offering 列表、筛选、六种 Asset 公开字段、三类 Instrument 动态字段、Issuer 信息页、详情认购卡；加入 M Listing Gate | 访客从首页→列表→详情→企业资料完整可浏览 | V/M 详情和企业页组件一致；六模板均能加载；收益不假设都固定；M 无 Listing 时不展示 |
| DEV-03 | 注册/账户/KYC/MPC：OTP Mock、首次建号、自动 MPC 状态机、自有钱包签名验证 Mock、默认切换、KYC 认购前阻断与恢复 | 可从当前 Offering 触发登录/KYC，再返回继续购买；账户钱包中心可操作 | 首登幂等；Provider Pending/Failed/Unknown 可恢复；默认切换不改历史；不在注册后强制 KYC |
| DEV-04 | 交易四步：报价/容量校验、必要文件签署 Mock、钱包 USDT 授权/付款 Mock、付款/配售/登记/Token 分段状态、独立订单状态；V/M 同 Offering 共享容量 | 两个端可从同一 Offering 演示正常认购闭环与失败/Unknown | 无真实交易/Signer；份数及 U 精度正确；未签约不可付款；交易 rollback 不伪造退款；Unknown 不重复扣款；法定登记未核验不宣称完成 |
| DEV-05 | 订单、合约自动退款状态演示、人工工单：订单列表详情、超期/迟到账、退款只读进度、客服与我的工单、I/P 授权协作的 Mock 事件 | 异常订单 → 工单 → 有权部门处理状态 → 投资者查看回复闭环 | 投资者无主动取消/手动退款；客服关闭工单不能改金融主账；I/P 查看最小权限 |
| DEV-06 | 持仓、收益/本金与披露：M12 法定持仓 vs M07 Token；股息、债息、收益参与动态模板；债权本金分列；Claim/Push/外部收款状态；消息披露历史 | 两个案例的持仓与投后动态完整演示 | 本金不算收益；预期不等于应付；Claim 只有可领取时出现；文件版本保留且受权访问 |
| DEV-07 | 全端浏览器/交叉验收：手动与 Playwright 真实测试、路由/刷新、账户跨 scope、双渠道并发容量、全部 22 个 VM 用例、可访问性/响应及截图 | 逐项 PASS/FAIL/NOT EXECUTED 证据与可复现问题清单 | 无严重逻辑/权限/UI 崩溃；不足项有缺口与优先级；不得只口头宣称 Done |
| DEV-08 | 交付收口：整理开发手册、业务演示数据与重置脚本、路由页表、截图、变更清单、源码 PR 与产品基线追溯 | 独立代码 PR（Draft）、PC 演示及工程交接，文档不改历史 Frozen/DEC | PR 源文件/测试/浏览器证据独立审核，明确 Mock 与真实服务区别；不自动合并 |

**发布顺序**：先提交/审 PR #16 产品文档（不强制在开发准备时合并），其后另建代码工作分支和独立 PR。避免把 V/M 开发写进已经冻结的 `apps/issuer`、`apps/website` 或旧研究原型。代码 PR 基于稳定 release 基线，新文档可从 PR #16 独立检出引用；正式工程启动前由产品负责人明确授权，不把“已同意开发准备”误作真实金融交易开发授权。

## 3. 测试数据与固定案例

演示 Fixture 必须有可重置入口，可测试而不依赖真实钱包/第三方服务。至少：

| Case | 底层资产 | 权益与路径 | 必须显示 |
|---|---|---|---|
| FIX-01 | 北京朝阳住宅（历史双案例之一） | 收益参与：按被批准的实际可分配净租金计收益；发行价/份数/合同版本的示例快照 | Asset 估值≠发行募集额；按 Record Date 计算收益，不能用“预期年化”当实际收益 |
| FIX-02 | 单笔企业借款债权（历史双案例之一） | 固定年利率 12%、按月付息、到期还本；采用现行 approved day-count（示例 Actual/365 Fixed） | 每期利息计算、真实已偿本金独立、到期与逾期 |
| FIX-03 | 非上市普通股权 | 股权与法律条款，可含公司合法股息决议或无分红 | 股息不保证，普通股不能被当固定债息 |
| FIX-04 | 写字楼/商铺/工业园仓储 | 三个公开 Asset 专属字段样例，可组合合法 Instrument | 字段/文件按资产动态，未提供租金不显示虚构收益 |
| FIX-05 | V 已发布/M 未 Listing；M Listing 已批准但同步 Unknown/暂停/下架 | 渠道权限 | V 可公开不代表 M 可公开；M Listing 有效才展示 |
| FIX-06 | 注册时 MPC Pending/Failed/Unknown；自有钱包已验证/未验证 | 钱包与登录 | 账户完成不假装 MPC 已建；幂等重试，避免错误覆盖默认 |
| FIX-07 | 交易 rollback / Pending / FinalMatched / 多付/少付/错链/迟到/退款 Unknown | 资金异常与客服 | 不虚构退款到账、不双扣、不提前完成 |
| FIX-08 | Token 已交付但法定登记 Unknown；或已登记 Token 尚未交付 | 持仓登记差异 | 两类权威状态分开，工单可受权跟进 |
| FIX-09 | 股息无合法决议、收益参与无收益声明、债权本金部分偿付 | 投后差异 | 不自动生成非法收益；累计收益不含本金 |
| FIX-10 | 同邮箱 V/M 各自账户与钱包；同 Offering 两端并发认购 | 跨端隔离与容量 | 不自动合并历史、容量不超额 |

历史测试财务参数可能存在不同币种换算示例，“1 U=8 CNY”等仅作为历史 Fixture 的演示值，不是生产汇率。所有 Mock 操作显示明显测试标识，真实合约/收款地址不填虚构可支付地址。

## 4. 每批 Codex 工程任务的规范

每个 DEV-* 单独可合并/可回退的开发切片（可按阶段内进一步拆分），统一采用：

1. **任务输入**：固定本轮 PRD 文件/引用的 SHA、页面 ID、功能和禁止事项、验收场景。
2. **影响边界**：仅 `apps/investor-portal` 及直接相关开发测试/必要文档；不改 Frozen Issuer/Website、其他无关 PR。
3. **交付**：改动文件和可观察页面/按钮/状态机、不新增范围、Mock 与生产状态区分。
4. **自动化**：Node Test/类型检查/Vite Build/Playwright 实测；附真实命令和 PASS/FAIL/NOT EXECUTED；不将无工具/跳过项目记为通过。
5. **浏览器证据**：关键页面 PC 宽屏截图、DOM/动作/URL、数据场景及失败路径、Console 和崩溃记录。
6. **独立审计**：ChatGPT/产品负责人对照 GitHub 代码 Diff、业务数据和截图/用例；未达 Gate 的阶段不能标记已完成。
7. **源代码提交**：独立 Git 分支、清晰 commit、Draft PR；不要在没有用户授权的情况下合并或真实部署。
8. **问题处理**：已确认规则冲突 → 阻断/记录到产品待决清单，不让 Codex 默默改需求或扩 V2 功能。

模型建议：复杂工程实现、代码审计与跨端状态机选择 Codex 可用的高推理档（High）；简单视觉组件和局部样式可采用 Medium。具体模型版本取决于当时 Codex 客户端可用档，不强制指定不可验证名称。

## 5. 开发与生产严格分离

本轮 DEV-00～08 只开发 **PC Web 前端＋受控 Mock Adapter**。不直接创建生产合约，不要求付费 MPC/KYC API，不收真实用户 USDT，不接真实商业数据，不提供客户可访问的未经授权生产门户。

**单独后续生产集成阶段（INT）**：安全邮箱 OTP 会话/跨域登录→合法 KYC Provider→MPC custody/signing 恢复/审计→后端真实 Asset/Instrument/Offering/Listing/Investor/Order/Payment/Holder/Token/Distribution/M17/M18 Adapter→合约付款/重组/退款生产审计与真实监听→法律文件/法定名册/资金授权→受限测试网络演练→真实业务法务/安全/审计 Gate 和上线决策。当前 PRD 存在的未决事实只能在此阶段批准；DEV Mock 不以模拟成功代替生产条件。

## 6. 冻结代码、PR 与审批策略

- PR #16 文档：Draft/Open/Unmerged，在完成独立内容检查前不合并。
- 新代码开发需单独用户授权；可建立 `feat/vm-investor-pc` 类分支，基于当时经确认的稳定 release，读取 PR #16 快照作为设计依据。不得将产品 PR、代码 PR 和已冻结 Issuer V1.0 主实现混作同一提交。
- 当前 AGENTS.md 第 7 条声明“当前阶段仅研究/规划/UI 工作，正式业务代码需另行授权”；待用户明确批准开始工程阶段，再另行更新开发授权记录或在代码 PR 中标注授权依据。**本计划仅属于开发准备，不构成自动授权真实业务代码开发**。
- 无开发完成就不能更新现有 [V1.0 实际产品基线](../V1.0/V1.0-PRODUCT-BASELINE.md) 为已交付 V/M，原 P UI-Ready 文档也不能写 P 后台已经运行。
- 原有历史 DEC、SCOPE、PR、冻结和法定/资金/Token 数据权威必须保留。

## 7. 开工前阻断项 vs 可后置项

| 条目 | 启动 Mock PC 前 | 生产集成前 |
|---|---|---|
| V/M 导航、页面复用、六资产+三权益、R03 企业页 | 必须锁定，并通过视觉审查 | 保持符合批准基线 |
| 权限/PortalContext、账号 scope、Mock 对象映射 | 必须有明确 Mock 契约和测试 | 实际服务端鉴权与安全审计 |
| React/Vite/包管理、设计令牌、测试工具 | 必须评估并固定 | 发布构建、监控、生产配置 |
| 合约自动退款可达性、Gas 与签名 | 可模拟独立状态并明确未实现 | 必须经过合约/法务/权限审计 |
| KYC Provider 与 MPC Provider 真实选型 | 无需选定、不能伪装已接入 | 法规/技术/密钥/隐私批准 |
| 法定登记与真实收益/本金支付 | 用权威 Mock 事件区分实际状态语义 | 法定主体/资金及外部回执必须接入 |
| H5/APP、复杂客服 CRM、V2 资产种类 | 本轮禁止扩展 | 独立后续版本决策 |

## 8. DEV-00 交接与“停止点”

第一个 Codex 任务应为 **AUDIT/PLAN ONLY（开发准备）**：从 release 和 PR #16 读真实文档/源码，核实路由/依赖/Mock 模型，形成《DEV-00 工程准备与分阶段工作单》，列出建议架构和可复现测试命令；禁止修改任何业务源码/自动创建生产钱包、签名、合约交易或外部 Provider。DEV-00 交付经核验后，用户明确授权才开始 DEV-01 代码。
