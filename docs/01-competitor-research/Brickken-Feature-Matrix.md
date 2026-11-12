# Brickken 功能矩阵（Issuer、Investor、White-label、API）

> 2026-10-16；对应 [Issue #1](https://github.com/mirrorshang/rwa-saas-platform/issues/1)。A=本轮账号交互，B=Brickken 官方资料，C=第三方，D=待核实。**“可见”只说明界面/入口存在，不表示完成业务动作。**逐页事实见 [Interaction Audit](Brickken-Sandbox-Interaction-Audit.md)。

## 状态定义

- **A-可见**：本轮 Sandbox 或公开示例站实际打开页面/控件。
- **A-受限**：打开后见锁定、禁用、空态、加载中或登录门槛。
- **B-文档**：仅官方资料证实。
- **D-未验证**：无足够直接证据；不判定“没有”。

| 端/角色 | 功能 | 入口/页面 | 本轮状态 | 证据 | 可确认内容与限制 |
|---|---|---|---|---|---|
| 发行方 | Sandbox 登录 | [Sandbox DApp](https://dapp.sandbox.brickken.com/) | A-可见 | A | 用户本人完成登录；未记录凭据 |
| 发行方 | 全局 Overview | [overview](https://dapp.sandbox.brickken.com/en/dashboard/overview) | A-可见 | A | 资产/Store/Offering/TVL/投资者统计卡，本账号值 0 |
| 发行方 | 全局 Digital Assets | [digital-assets](https://dapp.sandbox.brickken.com/en/dashboard/digital-assets) | A-受限 | A | 搜索/筛选/排序/CSV 可见，列表空 |
| 发行方 | 全局 Offerings | [offerings](https://dapp.sandbox.brickken.com/en/dashboard/offerings) | A-受限 | A | 搜索/筛选/排序/CSV 可见，列表空 |
| 发行方 | 全局 Investors | [investors](https://dapp.sandbox.brickken.com/en/dashboard/investors) | A-受限 | A | 搜索/筛选/排序/CSV 可见，列表空 |
| 发行方 | 单资产切换 | [overview](https://dapp.sandbox.brickken.com/en/dashboard/overview) 资产选择器 | A-可见 | A | All/Equity、ASSET、Add new；选 ASSET 进单资产空间 |
| 发行方 | 新建资产完整向导 | Add new → [pricing-plans](https://dapp.sandbox.brickken.com/en/account-management/pricing-plans) | A-受限 | A + [B 图](evidence/sandbox-assets.jpeg) | 当前账号跳套餐页；官方旧图仅见资产类型第一步，不可补造后续字段 |
| 发行方 | Token 类型和参数 | [My digital asset](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-company-token) | A-局部 + B-文档 | A + [API](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) | 当前资产显示 Equity、合约和供应指标；新建 Token Web 参数未实测；API 字段不可视作 Web 字段 |
| 发行方 | 法律文件 | 同上 | A-局部 | A | 两个合约内文件链接可见；上传/审批/发布动作未验证 |
| 发行方 | 单资产 Dashboard | [home](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/home) | A-受限 | A | “activate license”、Get started now 禁用、View plans |
| 发行方 | Offering 列表 | [my-token-offerings](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-token-offerings) | A-受限 | A + [B 图](evidence/issuer-offering.webp) | 本账号空列表；旧官方图有金额/价格/期限/状态卡 |
| 发行方 | 创建 Offering 空表单 | My offerings → Create new offering | A-可见 | A | 名称、数量、起止日期、募集及投资额上下限、USDT 价格/接受币种；未提交、未验证校验 |
| 发行方 | 多轮 STO 规则 | [官方 STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) | B-文档 | B | 同 Token 同时只有一轮 ongoing；Web 端未实测 |
| 发行方 | KYC 请求审核 | [kyc-requests](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/kyc-requests) | A-受限 | A | 搜索/筛选/排序；无请求，审核详情未见 |
| 发行方 | 白名单用户及批量邀请 | [whitelisted-users](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/whitelisted-users) | A-局部 | A | Invite users、CSV、最多 50 行显示、Wallet 可空；未邀请 |
| 发行方 | 邀请并发送 Token | 同上 → Invite + Send | A-局部 | A | Email、Amount、Name、Surname、Wallet；未发送 |
| 发行方 | 投资交易/转账审核 | [investment-requests](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/investment-requests) | A-受限 | A | 五个状态 Tab 与交易表列可见，当前空，Review request 禁用 |
| 发行方 | Cap table / 持有人 | [cap-table](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/cap-table) | A-受限 | A + [B 图](evidence/issuer-investors.webp) | 募集/分配/持有人指标及 Invite investor；当前 0 |
| 发行方 | Send earnings | 同上 | A-受限 + B-文档 | A + [官方指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) | 按钮禁用；API 有 dividendDistribution；Web 分配向导及税务未验证 |
| 发行方 | P2P 配置 | [private-sales](https://dapp.sandbox.brickken.com/en/ASSET/private-sales) | A-局部 | A | P2P/ROFR 开关、24h 响应时间、30天到期默认值可见；未保存 |
| 发行方 | P2P Orders | 同页 Orders Tab | A-受限 | A | Search/Status/Scope/高级筛选，订单空 |
| 发行方 | ROFR | [ROFR](https://dapp.sandbox.brickken.com/en/ASSET/private-sales/ROFR) | A-受限 | A + [官方文章](https://www.brickken.com/post/introducing-p2p-digital-asset-transfers-private-secondary-markets) | 统计和搜索可见、订单空；匹配/结算未验证 |
| 发行方 | Investment Portal 设置 | [my-tokens-store](https://dapp.sandbox.brickken.com/en/ASSET/dashboard/my-tokens-store) | A-局部 | A + [B 图](evidence/sandbox-portal.png) | Go/Edit/Connect 可见；无发行，提示需法律文件 |
| 发行方 | Portal 编辑/预览/发布 | Edit investment portal | A-受限 | A | Preview/Publish 入口可见，主体持续加载；未见编辑字段、未发布 |
| 平台/白标 | Domain management | [domain-management](https://dapp.sandbox.brickken.com/en/editor/domain-management) | A-受限 | A | 无 domain credits；不联系支持、不购买 |
| 平台/白标 | 多资产门户编辑 | 全局侧栏 | A-受限 | A | 当前账号菜单禁用，后台页面未见 |
| 平台/白标 | 白标 Admin、多租户/转售 | [White-label](https://www.brickken.com/whitelabel)、[Plans](https://www.brickken.com/plans) | B-文档/D | B | 官网宣传和价格表可见；实际后台、权限和隔离未验证 |
| 平台/白标 | 域名、邮件、品牌配置 | Domain management 与官网 | A-锁定/B | A/B | 当前无法进入配置；具体字段未见 |
| 平台 | 套餐展示 | [内部套餐页](https://dapp.sandbox.brickken.com/en/account-management/pricing-plans)、[公开 Plans](https://www.brickken.com/plans) | A/B 冲突 | A/B | 月价可见；专业档额度有冲突，合同价不确定 |
| 平台 | 账单/发票/用量/超额扣费 | 无已进入页面 | D-未验证 | D | 不能从套餐表推定有完整运营计费后台 |
| 投资者 | 公开资产介绍页 | [示例 Store](https://asset.store.brickken.com/en/store) | A-可见 | A + [B 图](evidence/sandbox-investors.jpeg) | 示例 SKIS 营销内容、文件及合约链接；“Awaiting upcoming offerings” |
| 投资者 | 注册/身份类型 | [register](https://asset.store.brickken.com/en/register) | A-局部 | A | Person/Business/Accredited Investor/Public Entity；未创建账户、未同意条款 |
| 投资者 | Invest / Private Sale 入口 | 示例 Store 底部链接 | A-受限 | A | 均跳登录页；未进入认购/订单 |
| 投资者 | KYC、白名单状态 | 注册后或账户内 | B-文档/D | [官方 Sandbox 文档](https://docs.brickken.com/get-started/sandbox) | 规则有文档，当前 Web 状态/异常未验证 |
| 投资者 | 认购、持仓、Claim、收益 | 登录后 | B-文档/D | [官方 STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) | API 流程可见，投资者 Web 页面未验证 |
| 开发者 | API Key / 环境 | [认证](https://docs.brickken.com/get-started/authentication)、[申请](https://docs.brickken.com/get-started/request-api-key) | B-文档 | B | 手工签发 Key，环境分离；未申请或使用 |
| 开发者 | Tokenization、STO、投资与分红 API | [API 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto) | B-文档 | B | 是接口能力，不证明本账号 Web UI 或商业额度 |
| 日本/阿联酋 | 本地化、支付、KYC/KYB、合规交付 | 无直接证据 | D-未验证 | D | 需后续官方合同/地区材料，不从全球营销文案推定 |

**统计：**23 个 A 类页面或独立视图；5 张 B 类官方截图；0 张登录态导出截图；0 条完整端到端交易链。A 类数量只统计实际打开的 UI，不把 API 文档或旧图算入。