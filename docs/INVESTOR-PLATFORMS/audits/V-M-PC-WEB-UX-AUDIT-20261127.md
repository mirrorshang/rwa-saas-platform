# V/M PC Web 投资者体验专项审计

日期：2026-11-27。性质：Audit Only，改进建议，非已批准的产品规则或开发授权。

## A. 结论与依据

**结论：尚未达到面向普通投资者的正式展示标准。** 原型已具备可走通的浏览、登录、认购与投后 Mock 结构，金融状态也刻意分开；但首页差异弱、待开放模板像可投资项目、普通页面充满内部名词和测试提示，用户难以快速判断自己取得什么权益、下一步要做什么。此结论是产品体验判断，不表示真实金融服务可用。

基线：PR #17 Draft/Open、HEAD `b4fc70db4d76dfa3559884b58e35ecb7d3fd1f6d`；PR #16 为产品设计依据。核对了 `AGENTS.md`、[共用 PRD](../V-M-SHARED-UI-READY-PRD-v0.1.md)、[M 独有页 PRD](../M-UNIQUE-PAGES-UI-READY-PRD-v0.1.md)、[最终 PRD](../V-M-DEV-08-FINAL-PRODUCT-PRD-20261127.md)、[DEV-07 验收](../../../apps/investor-portal/qa/DEV-07-ACCEPTANCE.md)、[运行手册](../../../apps/investor-portal/README.md)及 PR #17 既有评审。既有 DEV-07 的 27/27 测试和 Console Error 0 是**历史记录**，本审计未把它们冒充本次重跑。

本次在指定 HEAD 的本地独立工作树启动现有 Vite 依赖，IAB 实操 M 首页→房地产分类→住宅详情→邮箱 Mock 首登→返回原项目→金额→KYC 阻断→`/demo` 切换资格→逐份阅读 3 个文件→创建订单→模拟付款、配售、法定登记、Token 交付→我的投资；继续打开两个 V 首页、账户/订单/持仓/收益/客服/消息/披露/占位等页面，创建关联工单与收益事件，并模拟履约异常。另以已入库 1280/1440/1920 PNG 复核视觉。浏览器中的本机订单及邮箱均为演示数据。

| 维度 | 判断 | 依据 |
| --- | --- | --- |
| 视觉层级 | P2，需系统整合 | 首页 Hero、分类、卡片标题轴线和内容宽度关系松散；1920 仅两张卡，却与“最新上架”标题错位。 |
| 文案专业度 | P1 | `M 总投资者平台`、`Offering`、`not-started` 等内部语言直出。 |
| 投资信息 | P1 | 待开放模板仍以“最低认购额/收益来源/查看项目详情”同构卡片出现；住宅的期限与分配口径主要是“以合同为准”。 |
| 浏览链路 | 基本可用 | 分类可筛选，项目可看，登录能返回来源。 |
| 认购链路 | P1 | 路径可走通，但 KYC 需离开正式页面到独立 `/demo` 才可模拟通过；Step 4 完成后缺明显“查看订单/持仓”后续按钮。 |
| 投后链路 | 部分可用 | 本次打开订单、持仓、收益事件、工单及消息详情；履约异常未被当作已退款，关闭工单不改原订单，异常持仓被阻止创建收益。债权本金与 Claim 重复领取未独立复测。 |
| V/M 一致性 | P1 | 共用组件和渠道守卫存在，V 首页品牌名虽不同，Hero 与 M 完全同文案和配图。 |

## B. 问题清单与首页重排

证据等级：**实操**为本次浏览器重现；**截图**为当前 HEAD 已入库图片；**源码**为静态定位。以下 URL 均为本地 `http://127.0.0.1:5186`，复现时可用 README 的实际端口替换。截图路径见 H。

| ID/级别 | 页面/URL、证据 | 用户影响与复现 | 建议及验收标准 |
| --- | --- | --- | --- |
| UX-01 P1 | V 首页 `/v/harbor`；截图 V1440；`redesign.tsx` 首页 | 首页把写字楼、商铺等“即将开放”模板做成与认购中项目同尺寸卡片，仍列最低认购额与收益来源；新用户可能当作当前可投项目。 | 待开放模板独立于“当前可投资机会”区，显著标明“资料预览，暂不可认购”；不把模板价格当可执行报价。验收：首次浏览可清楚分辨可认购与预览。 |
| UX-02 P1 | `/m/account`、`/m/account/kyc`；实操；[AccountPage.tsx](../../../apps/investor-portal/src/AccountPage.tsx) | 首登显示“M 总投资者平台”，KYC 状态直接呈 `not-started`，还指导访问 `/demo`；用户必须理解系统角色和测试工具。 | 渠道用品牌名；状态映射“未开始”；统一的演示环境标识放页面边缘，KYC 主文案说明“完成身份认证后继续认购”。验收：无内部英文状态、无正式旅程中寻找控制台的指示。 |
| UX-03 P1 | 详情 `/m/opportunities/residence-01`，认购 `/m/subscribe/residence-01/quote|documents`；实操；[SubscriptionPage.tsx](../../../apps/investor-portal/src/SubscriptionPage.tsx) | `Offering`、`residence-01`、`Token`、`Mock` 反复出现在首屏摘要及正文；金额与法律权益的关系反而不突出。 | 主层用“项目、投资份额、本次认购金额、取得的合同权益”；技术标识放折叠“演示记录详情”。Token 仍在需要解释份额和交付的二级内容保留。验收：不懂 RWA 的用户能复述取得的法律权益与风险。 |
| UX-04 P1 | `/m/subscribe/residence-01/progress`；实操 | 4 阶段模拟确认后停留在进度页，只能靠顶部“我的投资”找订单；下一步不贴近结果。 | 结果下给“查看本次订单”主操作，“查看持仓”在法定登记后作为次操作；异常则给查询原记录/联系支持。验收：无需重新寻找导航即可继续。 |
| UX-05 P1 | `/v/harbor`、`/m`；V1440/M1920 截图；[redesign.tsx](../../../apps/investor-portal/src/redesign.tsx) | V/M 同 Hero 标题、配图与“全球投资者”叙述，V 的单企业属性只能从 Logo 得知。 | 保持统一视觉与流程，V Hero 聚焦本企业公开机会，M Hero 聚焦跨发行企业比较；不新增入口或市场。验收：遮住 Logo 仍能辨认定位。 |
| UX-06 P2 | `/m`；M1920、M1280 截图 | 1920 内容区域标题起点在 x≈280，两个卡片从 x≈520 开始；Hero、分类、卡片区的横向轴线不统一，卡片上方与两侧空白不成体系。 | 定一个内容最大宽度和左对齐网格；机会区标题与首卡同轴。1 项用有限宽度左对齐，2 项用两列有限宽度，3 项才三列，图片比例/卡片高统一；勿为填满行制造项目。验收：1280/1440/1920 不出现孤立卡与视觉重心漂移。 |
| UX-07 P2 | `/m/opportunities/residence-01`；实操截图、[redesign.tsx](../../../apps/investor-portal/src/redesign.tsx) | 右栏“期限/分配”与“分配周期”重复，均为“按合同约定；不保证分配”；核心经济条件需往下找。 | 右栏只保留三项最关键且已披露的权益指标；缺失项目明确“待披露”，避免重复占位。债权突出合同利率、还本与风险，收益参与突出来源、分配依据和不保证。验收：首屏 10 秒内找到最低额、权益、主要风险与期限信息状态。 |
| UX-08 P2 | `/m`、`/m/opportunities`；实操 | “合规、透明、可追溯”像已验证的产品承诺；债权示意图片呈仓库外观，可能被误读成抵押资产。 | 未经验证的资质词改为可证实的信息描述；图片旁清楚说“非项目资产实拍，不能证明担保”，债权卡主视觉优先中性而非厂房。验收：没有未经证实的安全、合规或抵押暗示。 |
| UX-09 P2 | `/m/disclosures`、消息/工单/账户页；源码 [InvestorContentPage.tsx](../../../apps/investor-portal/src/InvestorContentPage.tsx)、[OrdersPage.tsx](../../../apps/investor-portal/src/OrdersPage.tsx) | 每行都显示 Mock/ID/版本/权限术语，真实重要状态被测试说明淹没。 | 统一演示环境条 + 关键动作就地风险提示；版本与追踪 ID 放“记录详情”。验收：用户主任务可扫读，仍不会误认为真实付款、签署或登记。 |

逐项复现与定位（“未新增截图”表示本次浏览器已观察但没有可提交的 PNG；既有截图的完整相对路径在 H）：

| ID | 复现操作 | 截图 | 源码定位 | 产品规则判断 |
| --- | --- | --- | --- | --- |
| UX-01 | 直达 `/v/harbor`，比较第一张可认购卡与后两张待开放模板卡；`/v/cedar` 同类。 | `dev07-v-harbor-home-1440.png` | `src/redesign.tsx` 首页卡片、`src/data.ts` 模板资料 | 保留 V 模板展示，但不应让预览与可执行认购混同。 |
| UX-02 | 从住宅详情点击开始认购，首次登录，再从文件页点击认证状态。 | 未新增截图 | `src/AccountPage.tsx:56-62`、`src/SubscriptionPage.tsx` 文件步骤 | 认证门槛保留，改变呈现语言与返回体验。 |
| UX-03 | 打开住宅详情、金额及文件步骤，读取右栏和正文中的对象 ID/内部名。 | `dev07-m-detail-1920.png`；认购未新增截图 | `src/redesign.tsx` 详情、`src/SubscriptionPage.tsx` | Asset/Instrument/Offering/Token 的法律含义保留；用户主层按权益组织。 |
| UX-04 | 完成四阶段 Mock 推进后停留 `/progress`，寻找订单和持仓入口。 | 未新增截图 | `src/SubscriptionPage.tsx` 进度步骤 | 不改变阶段定义，只补结果后的明确去向。 |
| UX-05 | 分别直达 `/m`、`/v/harbor`、`/v/cedar`，遮住 Logo 比较 Hero。 | `dev07-m-home-1280.png`、`dev07-v-harbor-home-1440.png` | `src/redesign.tsx` 首页 | V 单企业、M 多企业定位已冻结；改文案与视觉表达即可。 |
| UX-06 | 对照 `/m` 的 1280 与 1920 截图，观察机会标题与首卡左边缘。 | `dev07-m-home-1280.png`、`dev07-m-home-1920.png` | `src/redesign.css` 首页/卡片网格 | 两项 Listing 的真实数量不得通过造卡补齐。 |
| UX-07 | 打开住宅详情，比较右栏“期限/分配”和“分配周期”，向下查权益说明。 | `dev07-m-detail-1920.png` | `src/redesign.tsx` 详情、`src/domain.ts` 权益摘要 | 缺披露不能推算收益；重复字段可重排。 |
| UX-08 | 直达 M 首页，读 Hero 资质词；对照债权卡片图片与底层“企业借款”。 | `dev07-m-home-1280.png` | `src/redesign.tsx` 首页、`src/assets/dev01r-debt.png` | 不新增担保或合规承诺；图片只能作示意。 |
| UX-09 | 打开 `/m/messages`、一条消息详情、`/m/disclosures`、工单详情，记录 Mock/ID 密度。 | 未新增截图 | `src/InvestorContentPage.tsx`、`src/OrdersPage.tsx` | 演示与金融风险提示必须保留，位置和层级可优化。 |

**首页具体重排**：页头与 Hero 共同用同一内容网格；Hero 高度按 1280 首屏能露出类别与机会区标题控制。类别区采用统一宽高的 3 个入口，左端与下方卡片轴线相同。机会卡保留“状态→项目名→权益类型→最低额→回报机制/期限→发行企业→查看详情”，单价及地区降为次级；1/2/3 张卡分别限宽排 1/2/3 列。V 的“待开放模板”另设资料预览区，卡面不呈可执行报价。底部风险教育与页脚保持一段有节奏的间隔。具体像素值需下一阶段设计稿和新版截图决定，本审计不冻结设计令牌。

## C. 三类用户旅程

| 用户 | 本次已证实路径/关键动作 | 卡点与建议 |
| --- | --- | --- |
| A 首次访问 | M 首页→房地产分类→结果 1 项→住宅详情→企业、风险、认购条件；约 4 页面、3 次关键点击，实操通过。债权与住宅的卡片结构可比较。 | 首页未解释 RWA/份额与合同权益关系；详情重复术语且住宅期限不明确。优先在首屏明确权益与信息缺口，比较时以权益差异为主。 |
| B 准备认购 | 详情→登录→验证码→返回详情→金额→文件→KYC→`/demo`→文件→付款→进度，至少 8 页面/多次往返，Mock 路径实操通过。 | 登录返回位置有效；KYC 阻断说明有内部状态，并迫使测试者进入控制台。正式体验应在原认购上下文显示认证状态和可返回入口；不建议用另一页覆盖法律资格规则。 |
| C 已投资 | 进度→顶部“我的投资”→订单→持仓；另从收益列表进入事件详情，从订单关联客服工单，再从消息返回工单。本次模拟履约异常后，订单显示“退款无已核实事实”；工单改“已解决”后原订单仍异常；异常持仓创建收益被阻断。债权本金与 Claim 重复领取未复测。 | 进度页无结果 CTA；订单、持仓、收益三层需要显式关联“这笔投资当前在哪一步”。未复测节点不判 PASS。 |

流程简化建议均不改变权威状态：浏览→筛选→详情→认购最多保留列表/详情两个决策页；登录/KYC 完成后返回原项目和已填份数；订单→文件→付款→进度保持必要金融步骤，减少重复输入与“去别处找进展”；异常→工单关联原订单；收益从持仓直达相应事件。任何删页合并涉及正式产品决策，须先确认法律文件、资格、签署与资金要求。

## D. 用户可见文案替换

下表是**页面主层建议**，演示环境必须保留统一明确标识；真实付款、签署、登记、收益承诺等关键风险仍在动作附近就地提示。

| 当前原句/页面 | 问题 | 建议文案 |
| --- | --- | --- |
| “M 总投资者平台独立演示账户”/登录 | 内部代号 | “RWA Invest 账户。登录后可继续查看本次认购。” |
| “V 企业投资者平台”/登录 | 内部代号 | “海岚资产账户”或对应企业品牌 |
| “获取 Mock 验证码”/登录 | 测试词抢占动作 | “获取验证码”；旁注“演示环境：验证码显示在本页，不发送邮件” |
| “KYC 状态：not-started”/账户、文件 | 原始枚举 | “身份认证：未开始”；“完成认证后可继续提交认购” |
| “本页只演示身份认证状态，不连接真实 KYC Provider”/认证 | 实现细节 | “当前为演示环境，身份认证结果不用于真实投资。” |
| “Offering 状态”“Offering 快照版本”/详情 | 内部对象 | “认购状态”“本期项目资料版本” |
| “认购 Token 份数”/金额 | 份额与技术记账混淆 | “认购份数”；二级解释“Token 用于交付展示，法律权益以登记和文件为准” |
| “同一 Offering 的 V/M Mock 预留共用容量”/金额 | 开发说明 | “可认购份数会在提交时再次核对”；技术规则留验收文档 |
| “模拟确认文件并创建待付款订单”/文件 | CTA 过长 | “确认已阅读并继续”；动作旁保留“演示确认不构成有效签署” |
| “Mock MPC 钱包”“Token 接收地址”/付款 | 技术与用户动作混合 | “付款钱包”“权益凭证接收地址”；解释付款钱包与接收地址可不同 |
| “暂无 Mock 工单/消息”/空态 | 测试词 | “暂无工单/消息”；统一演示环境标识仍可见 |
| “关联 Offering”/消息、工单 | 内部对象 | “关联项目” |

“Issuer”“Asset”“Instrument”只在必要的文件/法律解释层出现，首页分别用“发行企业、底层资产、投资者取得的权益”。“Token”不能简单删除：用于解释份数、交付与法定登记的区别。所有替换须经产品/法务核对最终含义。

## E. 逐页审计矩阵

判定：✓ 本次浏览器看到核心结构；S 源码/历史截图核对；— 本次未独立实测。页面存在不代表 UX 合格。

| 页 | 判定 | 目的、字段、动作与待改重点 |
| --- | --- | --- |
| 1 M 首页 | ✓/截图 | 主动作为浏览机会；Hero 资质式宣称和 2 卡轴线需调整。 |
| 2 V 首页 | 截图 | 品牌可见；Hero 应体现单企业，待开放模板与可投项目分区。 |
| 3 投资机会列表 | ✓ | 筛选有效且 URL 保留类别；标签/字段密度高。 |
| 4 资产详情 | ✓ | 权益、风险、认购 CTA 齐；重复占位及内部版本词过多。 |
| 5 企业资料 | ✓ | M 已上架企业直达可见；需用普通用户语言解释企业身份与风险。 |
| 6 登录 | ✓ | 验证后返回来源；内部渠道名与 Mock 词应收敛。 |
| 7 账户概览 | ✓ | KYC/MPC/默认钱包状态并列；技术简称需解释。 |
| 8 KYC | ✓ | 阻断成立；原始英文状态和 `/demo` 指令外露。 |
| 9 钱包管理 | ✓ | MPC、自有钱包区分；技术操作 ID 应折叠，实际绑钱包交互未复测。 |
| 10 账户安全 | ✓ | 退出入口清楚；演示会话说明保留，退出动作未执行。 |
| 11 认购 Step 1 | ✓ | 金额核对有效；内部 ID/Token 文案须重写。 |
| 12 认购 Step 2 | ✓ | 逐份正文和勾选有效；KYC 往返成本高。 |
| 13 认购 Step 3 | ✓ | 付款与接收地址分开；目标未核实提示有效。 |
| 14 认购 Step 4 | ✓ | 四业务阶段独立；完成后缺订单/持仓 CTA。 |
| 15 我的订单 | ✓ | 订单可见；长 ID 优先级过高。 |
| 16 订单详情 | ✓ | 履约异常时退款仍显示“无已核实退款事实”；建议突出“当前待办”。 |
| 17 我的持仓 | ✓ | 法定登记与 Token 分开；待核余额提示需保留。 |
| 18 持仓详情 | ✓ | 对账、限制、来源分列；需联系原订单/收益。 |
| 19 收益与本金 | ✓ | 本金与收益独立汇总；债权本金事件未在本次创建。 |
| 20 收益事件详情 | ✓ | 创建了计划待核实的收益参与 Claim 事件；不默认统一规则，后续领取未复测。 |
| 21 客服与工单表单 | ✓ | 本次关联订单提交工单；“仅文件名”上传限制须说清。 |
| 22 工单详情 | ✓ | 本次关闭工单后原订单异常与退款未核实状态不变；内部 ID 降级。 |
| 23 消息 | ✓ | 本次出现工单/订单通知；已读交互未复测，Mock 词密度需降。 |
| 24 消息详情 | ✓ | 本次从工单消息进入详情，关联业务 CTA 返回原工单。 |
| 25 公告与披露 | ✓ | 本次打开列表；文件详情与下载动作未复测，术语/版本显示需整理。 |
| 26 文件详情 | S | 可读 Mock；正式法律文本不可借用。 |
| 27 条款/隐私占位 | ✓ | 本次直达两个页面；仅占位，不能作为正式注册同意依据。 |
| 28 空/异常/加载/权限态 | S | 现有受控空态；异常需要明确查原记录/联系支持。 |

## F. 优先级与先前评审复核

- **P0：本次未证实可复现的 P0**。不能以未发现推断生产安全；本机 Mock 不具备真实资金、身份、法定登记和合约权限。
- **P1：UX-01～05**。先解决待开放模板与可投项目区分、内部语言、完整路径下一步、V/M 定位，再做纯视觉微调。
- **P2：UX-06～09**。统一网格、卡片层级、详情字段、资质与图片提示、全站演示文案策略。
- **P3：**卡片图标和局部微间距，在 P1/P2 验收后处理。

PR #17 早期评审所提 `/demo` 公共入口、M 企业直达守卫、跨渠道草稿、Step 4 误报已完成、文件无正文，当前源码与本次路径显示已有相应隔离/正文/“已查看”修复；本次不重复报成未修复缺陷。此前“首页卡片密度与 Hero 差异”仍可由当前截图复核。异常退款本次抽样复核：履约异常的订单未显示已退款，关闭工单后原订单仍异常；异常持仓创建收益被阻断。收益重复领取和债权本金校验仅有源码与 DEV-07 历史验收佐证，待下一轮专项实操，不能宣称本次通过。

## G. 下一阶段 Goal 修复计划（待审批）

1. **产品/法务先确认**：统一演示环境提示的位置与措辞；V 待开放模板是否显示价格；资质词能否使用；合同权益与 Token 的用户解释；KYC、签署、付款的生产边界。涉及冻结口径时记录变更原因、影响与审批结果。
2. **设计一轮**：按 UX-01/05/06/07 出 1280、1440、1920 首页/列表/详情/账户/认购关键稿；1/2/3 卡状态和 V/M 两种 Hero 分别验收。冻结网格与组件规则后再开发。
3. **集中实施**：业务代码在另一授权 Goal 与独立分支处理，不直接改 PR #17；先统一文案与环境标识，再整理首页卡片和详情，最后补进度/投后 CTA。保留所有金融状态与渠道权限。
4. **验收**：A/B/C 三类用户按文档逐项浏览；无内部术语直出；金融事项不误报真实；同一项目 V/M 不串账户和草稿；1280/1440/1920 截图对照；必要自动化回归后提交 Draft PR 供产品审查。

## H. 截图与复现证据索引

当前 HEAD 的既有真实截图：[M 首页 1280](../../../apps/investor-portal/qa/screenshots/dev07-m-home-1280.png)、[M 列表 1280](../../../apps/investor-portal/qa/screenshots/dev07-m-list-1280.png)、[V 海岚首页 1440](../../../apps/investor-portal/qa/screenshots/dev07-v-harbor-home-1440.png)、[V 杉衡列表 1440](../../../apps/investor-portal/qa/screenshots/dev07-v-cedar-list-1440.png)、[M 详情 1920](../../../apps/investor-portal/qa/screenshots/dev07-m-detail-1920.png)、[M 首页 1920](../../../apps/investor-portal/qa/screenshots/dev07-m-home-1920.png)。这些截图为 DEV-07 留存，**非本次新采集**。本次浏览器实操观察了 M 首页、列表、住宅详情及认购各阶段，但当前浏览器截图工具未提供可提交的本地文件路径；故不伪称已交付新截图。待具备截图持久化后补本次路径截图，至少包括首页 3 宽度、V/M 首页、列表、住宅/债权详情、登录/KYC、认购四步、订单/持仓/收益及异常态。

复现命令（使用已有依赖）：在 PR #17 原工作树 `apps/investor-portal` 运行 `node_modules/.bin/vite.cmd --host 127.0.0.1 --port 5186 --strictPort`；访问上述 URL。首次登录用任意演示邮箱和页面显示的固定演示码；`/demo` 仅供测试资格与状态。该流程不会连接真实服务。当前审计分支没有更改运行依赖、源代码或业务数据。

## I. PR #18 补充验收（2026-11-27，本轮新证据）

本节补足 H 节当时缺少的截图和 F 节列为“未复测”的投后场景；**H 节对原审计阶段的描述仍保留，不能把 DEV-07 截图算成本轮证据**。运行源为干净的 PR #17 工作树，HEAD `b4fc70db4d76dfa3559884b58e35ecb7d3fd1f6d`；本轮在独立 Chrome 浏览器配置中访问 `http://127.0.0.1:5186`，通过页面完成 M 渠道 Mock 邮箱登录、`/demo` 设置 KYC/MPC、债权 `debt-01` 四步认购、订单付款/配售/法定登记/交付，得到 10 Token、认购金额 500.00 U 的独立演示订单 `mock-c6e7eb08-1532-40db-9c0c-9bf3c3cdba78`。该金额是**认购金额，不是已核准的投资者名义本金**。测试账户为 `vm-audit-20261127@example.test`；没有触碰用户原浏览器账户或真实服务。

判断依据：[最终 PRD P11](../V-M-DEV-08-FINAL-PRODUCT-PRD-20261127.md#p11-收益与债权本金事件详情)要求本金与收益独立汇总、异常/退款待核持仓不形成可支付资格、Claim 仅对本批 Claim 且可领取事件开放、处理中不重复领取；[共用 PRD 第 8 节](../V-M-SHARED-UI-READY-PRD-v0.1.md#8-收益本金和领取v-14m-15)要求债权本金单列应偿/已偿/未偿、按实际未偿本金计息，并处理原 Claim Unknown。每 Token 名义本金映射与生产 Claim/重试条件仍待正式确认，以下不据认购金额自行推定法定本金上限或生产重试规则。**PASS 只表示下表所述 Mock 行为本轮实际复现。**

### I.1 本金偿还专项

截图均在本轮运行的 Chrome 中采集，路径位于下表；源码定位均指向上述 PR #17 HEAD。

| 场景与操作步骤 | 预期结果（现行 PRD） | 实际结果 | 判定 | 截图证据 | 关联源码 | 对原审计结论的影响 |
| --- | --- | --- | --- | --- | --- | --- |
| 正常还本：在 `/demo` 对已登记债权持仓创建 `principal`/Push/100 U 事件，应用 `paid`，打开收益页。 | 本金单列，不计入收益。 | “已偿债权本金”100.00 U，“已支付收益”0.00 U；事件详情列明已实付。 | **PASS**（仅 Mock 分账） | [100 U 还本](screenshots/20261127-supplement/m-principal-paid-100-1440.png) | [postInvestment.ts：创建、汇总](../../../apps/investor-portal/src/postInvestment.ts)、[PostInvestmentPage.tsx：收益页](../../../apps/investor-portal/src/PostInvestmentPage.tsx) | 原“本金/收益独立汇总”的静态判断得到实操支持。 |
| 同一事件重复执行：对同一事件 ID `mock-dist-b58e36f3-4a9e-45f8-b74f-df96d329e589` 再应用一次 `paid`，刷新收益页。 | 同一事件不重复累计。 | 汇总仍为 100.00 U，仅一条事件；按同一 ID 覆写保存。 | **PASS**（仅相同事件 ID） | [重复后汇总仍为 100 U](screenshots/20261127-supplement/m-principal-paid-100-1440.png) | [postInvestment.ts：distributionKey、saveDistribution、paidPrincipalCents](../../../apps/investor-portal/src/postInvestment.ts) | 补实同 ID 幂等表象；不同 ID 但同一真实还本指令的去重 **NOT VERIFIED**，源码无业务事件键。 |
| 多次还本与利息：再创建 150 U 本金和 5 U 债息，均应用 `paid`，打开收益页。 | 多笔已偿本金可累计；债息独立。按共用 PRD 还应有应偿、未偿及部分偿还口径。 | 已偿本金 250.00 U、已支付收益 5.00 U，页面无本债权的应偿/未偿本金或部分偿还字段。 | **PASS**（累计分账）；**FAIL**（剩余本金展示） | [两次还本与利息](screenshots/20261127-supplement/m-principal-two-interest-1440.png) | [postInvestment.ts：两类汇总](../../../apps/investor-portal/src/postInvestment.ts)、[PostInvestmentPage.tsx：ReturnsPanel](../../../apps/investor-portal/src/PostInvestmentPage.tsx) | 原“本金事件未创建”已补测；新增明确的本金余额信息缺口。真实剩余本金数值因法定本金映射缺失为 **NOT VERIFIED**。 |
| 超额试探：在上述 250 U 已偿后，再创建单笔 600 U 本金并应用 `paid`；比较 500 U 认购金额及页面汇总。 | 应以获核实的应偿/未偿本金判断可付金额，不能无依据宣告合法余额；缺权威值应待核实。 | 控件接受 600 U 并标“已支付”，累计已偿 850 U；无本金上限、未偿余额或权威本金核对。**500 U 仅是认购金额，不能据此证明法定超偿。** | **FAIL**（缺余额校验与依据仍可标已支付）；**NOT VERIFIED**（是否超过法定剩余本金） | [850 U 汇总](screenshots/20261127-supplement/m-principal-over-order-1440.png)、[600 U 事件详情](screenshots/20261127-supplement/m-principal-over-event-1440.png)、[500 U 订单](screenshots/20261127-supplement/m-orders-1440.png) | [postInvestment.ts：createDemoDistribution、applyDemoDistributionState](../../../apps/investor-portal/src/postInvestment.ts)、[SubscriptionPage.tsx：认购金额](../../../apps/investor-portal/src/SubscriptionPage.tsx) | 补充原审计未覆盖的本金校验风险；不将演示金额误写为法定债权本金。 |

### I.2 收益 Claim 专项

| 场景与操作步骤 | 预期结果（现行 PRD） | 实际结果 | 判定 | 截图证据 | 关联源码 | 对原审计结论的影响 |
| --- | --- | --- | --- | --- | --- | --- |
| 可领取与普通领取：创建 10 U 债息 Claim 事件，设为 `claimable`，从详情点击“模拟发起领取”。 | 本批为 Claim 且可领取时允许发起，随后为处理中。 | 初始可领取 10 U、已实付 0；点击后为 `processing`，可领取 0，显示原请求。 | **PASS**（单次 Mock 状态转换） | [领取前](screenshots/20261127-supplement/m-claim-ready-1440.png)、[处理中](screenshots/20261127-supplement/m-claim-processing-1440.png) | [PostInvestmentPage.tsx：DistributionDetailPage](../../../apps/investor-portal/src/PostInvestmentPage.tsx)、[postInvestment.ts：beginMockClaim](../../../apps/investor-portal/src/postInvestment.ts) | 将原“领取未复测”改为已实操；不推断真实支付成功。 |
| 连续点击同一按钮：在一次浏览器任务中对可领取按钮快速连续触发两次，并记录本轮页面存储写入。 | 同一收益事件处理中不得形成第二个领取请求。 | 同一事件先后写入请求 ID `a97bfef9-10a0-4e7b-86e3-afd974b0d14c` 与 `febccdfa-3a09-4cdf-9bca-f915cdd092eb`；后者覆盖前者，界面只留后者。该操作用浏览器 DOM 连点并临时观测 `Storage.setItem` 写入，未修改源码。 | **FAIL** | [连点后处理态与最终请求](screenshots/20261127-supplement/m-claim-processing-1440.png)；两次写入 ID 见本行实测记录 | [PostInvestmentPage.tsx：claim 回调](../../../apps/investor-portal/src/PostInvestmentPage.tsx)、[postInvestment.ts：beginMockClaim、saveDistribution](../../../apps/investor-portal/src/postInvestment.ts) | 新增可复现的重复请求 P1 风险；原“未复测”结论被实测失败替代。 |
| 处理中再次进入、刷新：连点后刷新详情，再找领取入口并比对请求 ID。 | 处理中只查询原请求，不再展示领取入口。 | 仍为 `processing`，原请求保持第二个 ID；领取按钮已消失。 | **PASS**（刷新后的界面守卫）；不抵消上一行连点失败 | [刷新后处理态](screenshots/20261127-supplement/m-claim-processing-refresh-1440.png) | [PostInvestmentPage.tsx：按钮条件](../../../apps/investor-portal/src/PostInvestmentPage.tsx)、[postInvestment.ts：状态持久化](../../../apps/investor-portal/src/postInvestment.ts) | 确认持久化后的守卫有效，但事件处理函数的瞬时竞态仍在。 |
| 已领取金额重入：通过 `/demo` 把 10 U 事件应用为 `paid`，刷新详情。 | 已支付金额不再计入可领取，不可再发 Claim。 | 已实付 10 U、可领取 0、未支付 0；无领取按钮。 | **PASS**（当前 `paid` 状态的 UI） | [已支付事件](screenshots/20261127-supplement/m-claim-paid-1440.png) | [postInvestment.ts：distributionAmounts](../../../apps/investor-portal/src/postInvestment.ts)、[PostInvestmentPage.tsx：按钮条件](../../../apps/investor-portal/src/PostInvestmentPage.tsx) | 支持原“已付与可领分离”判断；真实到账未验证。 |
| 领取失败后重试：将另一个 7 U Claim 事件设为 `unknown`，查看详情是否提供重试；查找 `/demo` 结果枚举。 | 原 Claim Unknown 应先核原请求；失败及重试条件需按批准规则判定。 | Unknown 时可领取 0、已实付待核实、无领取按钮；当前演示无 `failed` 事件结果及可执行的失败后重试路径。 | **NOT VERIFIED**（失败重试）；Unknown 阻止盲点符合当前页面表现 | [Unknown 事件](screenshots/20261127-supplement/m-claim-unknown-1440.png) | [postInvestment.ts：DistributionState、distributionAmounts](../../../apps/investor-portal/src/postInvestment.ts)、[PostInvestmentPage.tsx：演示状态控件](../../../apps/investor-portal/src/PostInvestmentPage.tsx) | 原审计仍不得给“失败后重试”PASS；需产品确认失败定义与原请求查询规则。 |
| 异常持仓与已有事件：先创建 9 U 可领取债息；再在 `/demo` 把来源订单设“履约异常，退款未核实”，回到事件详情点击领取。 | 最终 PRD P11：异常/退款待核持仓不应形成可支付资格。 | 持仓页明确提示“分配资格待核实”，但已有事件仍显示可领取 9 U，按钮可点，状态转为 `processing` 并生成请求 ID。 | **FAIL** | [异常持仓](screenshots/20261127-supplement/m-holding-exception-1440.png)、[仍可领取](screenshots/20261127-supplement/m-claim-abnormal-holding-ready-1440.png)、[领取已发起](screenshots/20261127-supplement/m-claim-abnormal-holding-processing-1440.png) | [postInvestment.ts：holdingNeedsReview、ownDistributions、beginMockClaim](../../../apps/investor-portal/src/postInvestment.ts)、[PostInvestmentPage.tsx：详情领取](../../../apps/investor-portal/src/PostInvestmentPage.tsx) | 原“异常持仓不能**创建**收益”仍成立，但不能延伸为已有 Claim 被阻断；新增 P1 缺口。 |
| 异常持仓新建事件：保持同一订单异常，从 `/demo` 再点“创建 Mock 事件”。 | 异常/退款待核持仓不得形成新分配事件。 | 事件数 7→7，提示“原订单权益状态待核实，不能创建分配演示”。 | **PASS** | [新建被阻止](screenshots/20261127-supplement/m-demo-abnormal-event-blocked-1440.png) | [postInvestment.ts：createDemoDistribution](../../../apps/investor-portal/src/postInvestment.ts) | 证实原报告既有结论仅在创建路径成立。 |

### I.3 本轮浏览器视觉证据索引

所有下列 PNG 均由本轮在实际运行的独立 Chrome 中以页面视口捕获，非 DEV-07 留存图；PC 视口高度为 1000/1100 px。截图记录页面当时状态，金融状态均为本机 Mock。

| 页面/状态 | 本轮截图 |
| --- | --- |
| M 首页 1280 / 1440 / 1920 | [1280](screenshots/20261127-supplement/m-home-1280.png) · [1440](screenshots/20261127-supplement/m-home-1440.png) · [1920](screenshots/20261127-supplement/m-home-1920.png) |
| V 首页两企业 | [海岚](screenshots/20261127-supplement/v-harbor-home-1440.png) · [杉衡](screenshots/20261127-supplement/v-cedar-home-1440.png) |
| M 投资机会与详情 | [机会列表](screenshots/20261127-supplement/m-opportunities-1440.png) · [住宅详情](screenshots/20261127-supplement/m-residence-detail-1440.png) · [债权详情](screenshots/20261127-supplement/m-debt-detail-1440.png) |
| 登录与 KYC | [登录](screenshots/20261127-supplement/m-login-1440.png) · [KYC 未开始](screenshots/20261127-supplement/m-kyc-1440.png) · [KYC Mock 通过](screenshots/20261127-supplement/m-kyc-approved-1440.png) |
| 债权认购四步、完成 | [Step 1](screenshots/20261127-supplement/m-debt-subscribe-step1-1440.png) · [Step 2](screenshots/20261127-supplement/m-debt-subscribe-step2-1440.png) · [Step 3](screenshots/20261127-supplement/m-debt-subscribe-step3-1440.png) · [Step 4](screenshots/20261127-supplement/m-debt-subscribe-step4-1440.png) · [完成](screenshots/20261127-supplement/m-debt-subscribe-complete-1440.png) |
| 投后及主要异常 | [订单](screenshots/20261127-supplement/m-orders-1440.png) · [持仓](screenshots/20261127-supplement/m-holdings-1440.png) · [收益空态](screenshots/20261127-supplement/m-returns-empty-1440.png) · [本金及利息](screenshots/20261127-supplement/m-principal-two-interest-1440.png) · [异常持仓](screenshots/20261127-supplement/m-holding-exception-1440.png) · [Claim Unknown](screenshots/20261127-supplement/m-claim-unknown-1440.png) |

**补充结论：**A 节“尚未达到正式展示标准”不变。本轮证明部分 Mock 分账和刷新守卫有效，也复现了快速连点覆盖原 Claim 请求、异常持仓仍可领取已有事件、本金偿还缺权威余额与校验。它们是审计发现，**不是本 PR 的 UI 修复授权或生产规则变更**。PR #18 保持 Draft/Open/Unmerged，交产品负责人审核。
