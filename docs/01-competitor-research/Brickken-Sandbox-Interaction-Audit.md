# Brickken Sandbox 交互式竞品审计

> 2026-10-16（Asia/Shanghai）。目的：为后续日本与中东多资产 RWA SaaS 的产品规划、页面功能和布局研究提供竞品事实。本文件只记录 Brickken，不提出我方 UI 或产品方案。对应 [Issue #1](https://github.com/mirrorshang/rwa-saas-platform/issues/1)。

## 1. 口径、范围和计数

- **A：亲自交互验证。** 已由用户登录 Brickken Sandbox 发行方账号；在 Codex 浏览器逐页查看。仅测试可见页面、按钮跳转和空表单，未创建资产/发行、未上传资料、未连接钱包、未执行交易。投资者演示站是另一个未登录账户环境。
- **B：官方网页、开发文档、截图或视频。** 仅按其实际展示内容引用；API 字段不等于 Web 表单字段。
- **C：第三方公开资料。** 本轮核心结论未依赖 C。
- **D：推断或未验证。** 明示缺口，不当作产品能力。
- **计数：A 类实际打开 23 个页面或可区分视图**，其中包括 3 个 P2P 标签页、2 个邀请表单和一个持续加载的门户编辑视图；不能把该数理解为 23 条完整业务流程。**A 类完整发行→认购→分配闭环为 0。** 5 张仓库截图均为 Brickken 官方公开图像副本，属 B，不冒充本次登录截图。
- **时间精度：**同一天 2026-10-16；原始浏览记录未逐页记录时分，故不补造分钟。环境如无另注均为 https://dapp.sandbox.brickken.com 的 Sandbox。

## 2. 产品体系与账户边界

| 产品端 | 定位与客户 | 访问入口/账户 | 关联与交付 | 证据 |
|---|---|---|---|---|
| Issuer Studio / DApp | 发行人与资产运营方 | [Sandbox DApp](https://dapp.sandbox.brickken.com/)、[正式 DApp](https://dapp.brickken.com/)；本轮仅 Sandbox 登录 | 资产、Offerings、准入、持有人、转账、门户设置；按 Issuer 套餐授权 | A/B |
| Investor Portal / 单资产 Store | 投资者 | 发行端的 Go to investment portal；本轮链接经重定向进入 [Luxury Ski Resort 示例 Store](https://asset.store.brickken.com/en/store)，Invest/P2P 进入单独登录页 | 与发行轮次、白名单、投资者身份关联；不能认定此示例就是账号内 ASSET 的已发布门户 | A |
| White-label | 机构及平台品牌化交付 | [官方介绍](https://www.brickken.com/whitelabel)；可见 Domain management，当前账号无 credits | 多资产、品牌域名与管理功能按商业套餐交付；具体租户后台未进入 | A/B |
| Dapp API / SDK / CLI | 技术团队 | [Developer Hub](https://devs.brickken.com/)、[Dapp API](https://docs.brickken.com/api-reference/introduction)；Key 需申请，Sandbox/生产分离 | 可操作 Token、STO、KYC、投资及分配等接口；未用 Key 实测 | B |
| Sandbox | 预生产测试环境 | [Sandbox 说明](https://www.brickken.com/sandbox) 与上述 DApp | 与生产身份、API Key、数据和合约隔离的规则见[官方说明](https://docs.brickken.com/get-started/sandbox) | A/B |
| 平台运营和计费 | Brickken 自身运营端 | 本轮未获得其内部后台入口 | 官网价格与当前账号套餐页可见，账单/发票/租户操作未实测 | B/D |

**账户边界：**发行方 Sandbox 已登录；示例投资门户的登录页仍独立出现，不能据此断定发行方账户必然不能用于投资端。官方 Sandbox 文档说明发行方邮箱不能同时作为投资者邮箱，这属于 B 类规则。正式 DApp 仅到登录页，未登录。白标独立身份库未验证。

## 3. 已实测页面目录与逐页记录（A）

所有下列页面均为 2026-10-16 浏览器可见状态。截图列的“未导出”表示本轮没有可提交的登录态图片；相邻 B 图像不能替代 A 图像。所有可见数字为当前测试账号/示例状态，不代表系统默认或套餐保证。表单和编辑器的独立 URL 若未记录，表内明确写触发页，不推测路径。

### 3.1 全局工作台（4 视图）

| # | 菜单路径和 URL | 页面布局、字段及操作 | 本轮点击结果 / 状态 / 限制 | 截图 |
|---:|---|---|---|---|
| 1 | Overview · [dashboard/overview](https://dapp.sandbox.brickken.com/en/dashboard/overview) | 总览卡片：digital assets、live stores、live offerings、TVL、offerings、investors；侧栏含 Overview、Digital Assets、Digital asset offerings、Investors、Domain management | 数值均为 0；资产选择器另能看到 Equity 测试资产 ASSET，因此总览“0”不能解释为账户无 Token | 未导出 |
| 2 | Digital Assets · [dashboard/digital-assets](https://dapp.sandbox.brickken.com/en/dashboard/digital-assets) | 搜索邮箱/Token、Filter、Newest 排序、Download CSV，空列表 | 空态“No requests found”；文案像授权名单复用，不能据此推断资产列表数据结构 | 未导出 |
| 3 | Digital asset offerings · [dashboard/offerings](https://dapp.sandbox.brickken.com/en/dashboard/offerings) | 搜索/筛选/排序/CSV | 无发行；空态同样为“No requests found” | 未导出 |
| 4 | Investors · [dashboard/investors](https://dapp.sandbox.brickken.com/en/dashboard/investors) | 搜索/筛选/排序/CSV | 无投资者；同样复用空态文案 | 未导出 |

全局资产选择器有 All/Equity、ASSET 和 Add new。选择 ASSET 到其单资产工作台；Add new 跳到套餐页，**未打开资产创建完整向导**。全局侧栏的 Multi-Assets portal editor 呈禁用态。

### 3.2 单资产发行方工作台（15 视图）

ASSET 为账号内可见 Equity 测试资产。本报告仅保留示例代号，不写入账号、邮箱或钱包信息。

| # | 菜单路径和 URL | 布局、字段、按钮、空态 | 点击/前置条件/结果；业务边界 | 截图 |
|---:|---|---|---|---|
| 5 | Home · [ASSET/dashboard/home](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/home) | Token 类型及合约链接；价格 0 USDT；Total Raised 0、Investors 0；“Get started by activating your license” | Get started now 禁用，View plans 可进入套餐页；不能断言所有功能都被同一许可证挡住 | 未导出 |
| 6 | My digital asset · [ASSET/dashboard/my-company-token](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-company-token) | Market Cap、Maximum Supply、Fully Diluted Market Cap、Circulating Supply 均 0；合约内法律文件两条 IPFS 链接 | 查看静态指标与文件入口；未打开文件内容 | 未导出 |
| 7 | My offerings · [ASSET/dashboard/my-token-offerings](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-token-offerings) | 无发行；提示需先发布法律文件，Create new offering / Create offering | 点击创建进入 #8；未完成发行 | 未导出；相关旧版官方图 [B-I1](evidence/issuer-offering.webp) |
| 8 | Create new offering · 由 #7 打开 | 表单可见 Name of offering、Amount of digital assets to offer、Start/End date、Min/Max raise USDT、Accepted ERC-20 assets（USDT）、Price USDT、Min/Max investment USDT；Back、Clear、Connect | 仅打开空表单；未填、未连接钱包、未提交。Back 跳回全局 Overview，是本次观察到的导航行为；不能据此推定创建成功前后的状态机 | 未导出 |
| 9 | Whitelist requests · [ASSET/dashboard/kyc-requests](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/kyc-requests) | “newest KYC Requests”、Connect、邮箱搜索、Filter、Newest、更多菜单 | 无请求；空态“No requests found”；KYC 审核详情未见 | 未导出 |
| 10 | Send assets · [ASSET/dashboard/whitelisted-users](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/whitelisted-users) | Invite users、Invite + Send、Send to selected (0) 禁用；搜索/筛选/排序；无白名单用户 | 两个邀请入口分别打开 #11/#12 | 未导出 |
| 11 | Invite users · 从 #10 打开 | 0/50 users、Upload CSV、Download example CSV、Add row；Email、Needs whitelist（默认选中）、Wallet address 可空；Connect | 提示 Wallet 留空可自动创建；CSV 列 email/needWhitelist/walletAddress；未导入或邀请。50 是**单次表单显示上限**，不能当套餐额度 | 未导出 |
| 12 | Invite + Send · 从 #10 或 #14 打开 | 0/50 users、Upload CSV、Email、Amount、Name、Surname、Wallet 可空；Connect | CSV 列 email/amount/wallet/name/surname；未发送资产；投资者页 Invite investor 也跳此表单 | 未导出 |
| 13 | Transfers · [ASSET/dashboard/investment-requests](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/investment-requests) | 募集/价格统计均 0；All/Pending/Accepted/Rejected/Invested；表列 Wallet Address、Status、Full Name、Date、Transfer Method、Amount、Offchain Transaction；邮箱搜索、Oldest、Review request (0) 禁用 | 无交易，无法验证状态转换、审核弹窗或银行/链上结算 | 未导出 |
| 14 | Investors · [ASSET/dashboard/cap-table](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/cap-table) | Total Raised 0 USDT、Company Holding -、Distributed 0、Holders 0；Invite investor；Send earnings 禁用；无门户活动 | Invite investor → #12；持有人详情、分红向导不可进入 | 未导出；相关旧版官方图 [B-I2](evidence/issuer-investors.webp) |
| 15 | Private sale → Settings · [ASSET/private-sales](https://dapp.sandbox.brickken.com/en/ASSET/private-sales) | Enable P2P marketplace、Enable ROFR 两开关；ROFR Response time 显示 24 Hours；Default offer expiration 显示 30 Days；Save 禁用 | 未切换或保存。只证明当前界面配置值，不证明市场已开通 | 未导出 |
| 16 | Private sale → Orders · 同 #15 的标签 | Search、Status、Scope、高级筛选；无结果 | 未创建买/卖单，不知道审核、撮合和费用 | 未导出 |
| 17 | Private sale → ROFR · [ASSET/private-sales/ROFR](https://dapp.sandbox.brickken.com/en/ASSET/private-sales/ROFR) | Total orders value、Active orders、Total orders 均 0；Search；无结果 | 无订单，优先购买权流程未执行 | 未导出 |
| 18 | My investment portal · [ASSET/dashboard/my-tokens-store](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-tokens-store) | Setup and publish、Go to investment portal、Edit investment portal、Connect；提示无发行及需法律文件 | Go to investment portal 指向 asset.store.vaultigix.com，浏览器最终到通用 Luxury Ski Resort 示例 Store；不能认作 ASSET 的成功发布前台 | 未导出；相关旧版官方图 [B-I5](evidence/sandbox-portal.png) |
| 19 | Portal editor · 从 #18 的 Edit 打开 | 可见 Preview、Publish 入口，主体持续加载 | 多次观察仍为加载状态；未得到字段或预览画面，未点击 Publish | 未导出 |

单资产侧栏实测层级：Home、My digital asset、My offerings、Whitelist requests、Send assets、Transfers、Investors、Private sale、My investment portal；底部还有 Support、Tutorials、升级套餐。此层级是本账号当前可见范围，不推断其他角色完全相同。

### 3.3 域名、价格与投资者演示端（4 视图）

| # | 环境/路径和 URL | 页面与交互 | 限制和结论 | 截图 |
|---:|---|---|---|---|
| 20 | Sandbox · Domain management · [editor/domain-management](https://dapp.sandbox.brickken.com/en/editor/domain-management) | Domains 0、Assigned assets 0、Email configured 0；“Domain management locked / You have no domain credits available. Contact support to add domain credits.” | 权限/credits 墙；未联系支持、未购买，白标域名配置不可验证 | 未导出 |
| 21 | Sandbox · Plans and Pricing · [account-management/pricing-plans](https://dapp.sandbox.brickken.com/en/account-management/pricing-plans) | Core €299、Advanced €499、Professional €899、Enterprise €1,999/月；多行额度；前三档 Contact us 禁用，Enterprise Get 通往外部表单 | 当前账号看到的表与官网 [Plans](https://www.brickken.com/plans) 不一致，如 Professional 募集额“<€1M”、KYC“<150*”与官网不限额/500。不能据其中任一页单独推断合同价或实际授权；未点 Get | 未导出 |
| 22 | 公共演示 Store · [asset.store.brickken.com/en/store](https://asset.store.brickken.com/en/store) | Luxury Ski Resort / SKIS；Home、About、Invest、Private Sale、Sign In；营销说明、Whitepaper、Invest now、Join whitelist、Information、法律文件、Escrow/Token 链接；“Awaiting upcoming offerings” | 公开页可浏览；没有可认购发行。此站经 #18 的链接重定向抵达，但身份与资产内容不匹配，应视为**示例门户** | 未导出 |
| 23 | 公共演示 Store · [en/register](https://asset.store.brickken.com/en/register) | Invest 与 Private Sale 点击均跳此登录页；Sign In：Email/Password、Show password、Forgot password；Create Account：Email/Password/Confirm、User type（Person/Business/Accredited Investor/Public Entity）、条款和隐私勾选、reCAPTCHA | 未创建投资者账户、未同意协议；持仓、Claim、收益、P2P 交易视图均未验证 | 未导出 |

## 4. 页面关系与已走通的交互链

~~~mermaid
flowchart TD
  L["Sandbox 发行方登录 A"] --> G["全局 Overview A"]
  G --> GA["资产选择器：ASSET A"]
  G --> GP["Add new → 套餐页 A"]
  GA --> H["单资产 Home A"]
  H --> O["My offerings A"]
  O --> OF["Create new offering 空表单 A"]
  H --> W["Send assets A"]
  W --> I1["Invite users A"]
  W --> I2["Invite + Send A"]
  H --> INV["Investors A"]
  INV --> I2
  H --> P["My investment portal A"]
  P --> E["Edit → 加载中 A"]
  P --> S["Go → 通用示例 Store A"]
  S --> R["Invest / Private Sale → 投资者登录 A"]
  H --> PS["Private sale Settings/Orders/ROFR A"]
~~~

**A 类已走通的是“页面跳转”，不是资产发行、交易或收益结算。** Portal 站点与发行账号资产不匹配，不能把两者连成已发布资产的真实业务闭环。

## 5. 业务规则：实测与官方资料分开

- **A 可见规则/状态：**创建发行空表单存在上述必填项；门户页提示法律文件先发布；当前账户无域名 credits；投资者示例的 Invest/P2P 要求登录；P2P Settings 显示 24 Hours 与 30 Days；空记录时审查/发收益按钮禁用。这些是当前界面状态，不等于后台全局校验或计费规则。
- **B API 规则：**[官方 STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto)描述 Token 创建、STO、投资、关闭、领取与收益接口。newSto 接口示例用 tokenAmount、min/maxRaiseUSD 等，Token 价格由募集上限和数量推导；**与本次 Web 表单“Price of digital asset in USDT”是不同层的字段口径，不能混同。**
- **B 准入规则：**[Sandbox 文档](https://docs.brickken.com/get-started/sandbox)将链下邮箱 KYC 和每 Token 钱包白名单分开；needKyc=false 仅 Sandbox；发行人与投资者邮箱角色有区别。当前 Web 无真实用户数据，未实测审核链。
- **B 发行状态：**[STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto)称同一 Token 同时只有一轮 ongoing STO、到期后关闭、达软上限可领取 Token、否则退款；这不是本轮 A 交互结论。
- **B P2P：**[官方文章](https://www.brickken.com/post/introducing-p2p-digital-asset-transfers-private-secondary-markets)描述固定价卖单、托管结算、KYC 与可选 ROFR。本轮 A 只见配置和空列表，未验证订单业务规则。

## 6. 商业模式与 UI/UX 观察

官网 [Plans](https://www.brickken.com/plans) 于 2026-10-16 可见：Issuer Core/Advanced/Professional/Enterprise 月价依次 €299/€499/€899/€1,999；White-label Standard/Premium 月价 €2,500/€5,000、Custom 议价；API Silver 和 Gold **均显示** €2,000/月，设置费分别 €2,000/€7,000。官网页首“No setup fees”与 API 设置费并列，内部套餐页与公开额度也冲突，应由商务确认；本报告不自行校正。更多官方额度：Core/Advanced/Professional/Enterprise KYC 年量 50/150/500/1,000；Silver/Gold 公开为每年 5,000 万次调用。额外 KYC、资产、法人实体及超额发行另列费用，适用档位以官网原表和合同为准。开发文档的 API Key credits 与商业 Silver/Gold 关系未披露。[官网价格](https://www.brickken.com/plans)、[认证说明](https://docs.brickken.com/get-started/authentication)

**UI/UX 可观察方法：**全局总览和单资产二级导航分离；单资产侧栏围绕生命周期安排资产、发行、准入、转账、持有人、门户；批量邀请支持逐行与 CSV 双入口；列表常用搜索/筛选/排序/导出；空态与禁用按钮直接呈现当前可操作性；P2P 用 Settings/Orders/ROFR 标签。以上是对竞品的描述，不是我方页面设计。

**明显问题：**全局不同列表复用“No requests found”导致语义不清；Invite investor 跳入 Invite + Send 而非纯邀请，可能增加理解成本；Offering 表单 Back 跳回全局 Overview，难以保持单资产上下文；门户编辑持续加载无法判断失败原因；内部与官网套餐额度冲突。这些均是本次 A 观察或可比 B 信息，不概括为所有 Brickken 账户必然如此。

## 7. 截图证据索引

仓库文件是**官方公开截图原图副本，均为 B；非本次登录态实测截图**。本轮浏览器截图虽可在工具中查看，但运行环境未允许导出登录态图像到仓库；因此 A 页截图数为 0，不能伪称已留证。截图不含本账号凭据或个人数据。

| 编号 | 文件 | 官方原图 / 页面 | 可证实范围 |
|---|---|---|---|
| B-I1 | [issuer-offering.webp](evidence/issuer-offering.webp) | [原图](https://cdn.prod.website-files.com/680a2df699085611f5f9221a/6971d8e414fc2b1a03e59cb6_launch_offering.webp) · [Issuer Studio](https://www.brickken.com/webapp-saas-platform) | 旧版发行卡片 |
| B-I2 | [issuer-investors.webp](evidence/issuer-investors.webp) | [原图](https://cdn.prod.website-files.com/680a2df699085611f5f9221a/6971d56f8c97c2807ae40e93_investors_platform.webp) · [Issuer Studio](https://www.brickken.com/webapp-saas-platform) | 旧版投资者管理 |
| B-I3 | [sandbox-assets.jpeg](evidence/sandbox-assets.jpeg) | [原图](https://cdn.prod.website-files.com/680a2df699085611f5f9221a/680a2df699085611f5f923a2_94416EFE-400A-49C7-8420-022E5E9E6306_1_201_a.jpeg) · [Sandbox](https://www.brickken.com/sandbox) | 资产类型向导静态图 |
| B-I4 | [sandbox-investors.jpeg](evidence/sandbox-investors.jpeg) | [原图](https://cdn.prod.website-files.com/680a2df699085611f5f9221a/680a2df699085611f5f923a5_A1A6A51B-B582-4EC9-83AB-EC3832F0B21F_1_201_a.jpeg) · [Sandbox](https://www.brickken.com/sandbox) | 投资者资产发行页静态图 |
| B-I5 | [sandbox-portal.png](evidence/sandbox-portal.png) | [原图](https://cdn.prod.website-files.com/680a2df699085611f5f9221a/680a2df699085611f5f923a3_dapp-investment-portal.png) · [Sandbox](https://www.brickken.com/sandbox) | 发行方导航与门户旧图 |

## 8. 来源与可信边界

- [官网](https://www.brickken.com/) · [Issuer Studio](https://www.brickken.com/webapp-saas-platform) · [Sandbox](https://www.brickken.com/sandbox) · [White-label](https://www.brickken.com/whitelabel) · [Plans](https://www.brickken.com/plans) · [Tutorials](https://www.brickken.com/tutorials) · [How to tokenize](https://www.brickken.com/how-to-tokenize)：2026-10-16 访问，B。
- [Developer Hub](https://devs.brickken.com/) · [API 入门](https://docs.brickken.com/api-reference/introduction) · [Sandbox](https://docs.brickken.com/get-started/sandbox) · [STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) · [认证](https://docs.brickken.com/get-started/authentication) · [API Key 申请](https://docs.brickken.com/get-started/request-api-key)：2026-10-16 访问，B。
- 上述带 Sandbox URL 的逐页目录：本轮账号交互，A，**需要发行方 Sandbox 登录；其他账号可见状态可能不同**。
- 关于日本/阿联酋的适配、计费后台、正式部署形态，目前没有足够页面或合同证据，均维持 D/待验证。

完整功能状态见 [Feature Matrix](Brickken-Feature-Matrix.md)，流程缺口与下一轮实测任务见 [Workflow Gaps](Brickken-Workflow-Gaps.md)。
