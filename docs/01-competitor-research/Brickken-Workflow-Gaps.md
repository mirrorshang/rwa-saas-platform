# Brickken 业务流程、状态机证据与补测缺口

> 2026-10-16（Asia/Shanghai）。本文件属于 [Issue #1](https://github.com/mirrorshang/rwa-saas-platform/issues/1) 的竞品取证；仅描述 Brickken。本轮账号共打开 23 个页面/独立视图，完整发行—投资闭环为 0。逐页入口和字段见 [交互审计](Brickken-Sandbox-Interaction-Audit.md)，功能状态见 [矩阵](Brickken-Feature-Matrix.md)。

## 1. 端到端流程的证据级别

~~~mermaid
flowchart LR
  A["企业登录<br/>A: Sandbox 已登录"] --> B["资产/Token 创建<br/>A: Add new 跳套餐页<br/>B: 官方向导旧图+API"]
  B --> C["法律文件<br/>A: 已有文件链接/提示<br/>D: 发布动作未测"]
  C --> D["发行轮次<br/>A: 空表单可见<br/>B: API newSto 规则"]
  D --> E["门户发布<br/>A: Edit 持续加载<br/>D: 发布未测"]
  E --> F["投资者注册/KYC/白名单<br/>A: 示例注册字段<br/>B: 官方规则"]
  F --> G["认购/支付<br/>A: 点击 Invest 跳登录<br/>B: API 流程"]
  G --> H["关闭/退款/Claim<br/>B: API 状态规则<br/>D: Web 未测"]
  H --> I["持有人/收益<br/>A: 空 cap table 和禁用按钮<br/>B: 分红 API"]
~~~

这张图**不表示本轮走通整条路径**。A 类只覆盖登录、页面导航、空表单、限制提示；B 类 API 规则不是 A 类 Web 操作证据。

## 2. 可复现的本轮操作链

| 链 | 前置/步骤 | 实际结果 | 结论 |
|---|---|---|---|
| 发行工作台 | 用户本人登录 Sandbox → Overview → 资产选择器 ASSET → Home | 进入单资产空间；Home 提示激活 license | A；该账号可查看已有资产，不代表可新建 |
| 新资产 | 全局资产选择器 Add new | 跳 Plans and Pricing | A；向导后续步骤无法实测；原因不能超出许可证/页面提示推断 |
| 新发行 | ASSET → My offerings → Create new offering | 展示主要输入及 Back/Clear/Connect；未填/未提交 | A；字段可见，发行成功、校验与钱包要求未验证 |
| 白名单批量 | ASSET → Send assets → Invite users / Invite + Send | 两个不同表单、CSV 入口及 Wallet 可空提示 | A；未上传、未邀请、未发送；“0/50”只指当前表单显示 |
| 投资者管理 | ASSET → Investors → Invite investor | 跳 Invite + Send 表单；Send earnings 禁用 | A；没有持有人/收益记录，无法检验分红 |
| P2P | ASSET → Private sale → Settings/Orders/ROFR | 设置值可见，Save 禁用，订单/ROFR 全空 | A；未变更设置、未交易 |
| 门户 | ASSET → My investment portal → Edit | Preview/Publish 可见，主体持续加载 | A；编辑字段、预览、发布不可验证 |
| 前台链接 | ASSET → Go to investment portal | 通过 asset.store.vaultigix.com 到通用 Luxury Ski Resort / SKIS 示例页 | A；**不可将示例页认作 ASSET 的已发布投资门户** |
| 投资者入口 | 示例 Store → Invest 或 Private Sale | 跳独立 Sign In；Create Account 标签显示身份类型 | A；无投资者账户，后续 KYC/持仓/交易不可验证 |
| 域名 | Overview → Domain management | 0 credits，锁定并提示联系支持 | A；未联系支持或购买 |

## 3. 状态机证据与冲突

### Offering / 认购

- **A：**当前测试资产 My offerings 为无发行状态。Create new offering 空表单含名称、数量、开始/结束日期、募集上下限、接受 ERC-20 资产（显示 USDT）、USDT 单价、单笔投资上下限。Transfers 有 All/Pending/Accepted/Rejected/Invested 标签，但无记录，不能确定各状态触发条件或是否单线状态机。
- **B：**[官方 STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto)说明同 Token 仅一轮 ongoing、到期后关闭、达到 minRaiseUSD 成功并可 claim、未达软上限退款；投资操作需签名、白名单和支付授权。本文不把该接口规则写成已验证的 Web 向导。
- **口径冲突：**API newSto 示例由 maxRaiseUSD/tokenAmount 推导 Token 单价；本轮 Web 表单直接显示 Price of digital asset in USDT。需要通过真实测试发行或官方产品说明解释两者映射；**不自行断定计算公式在 Web 中如何执行**。

### KYC / 白名单 / 持有人

- **A：**KYC requests 空列表；Send assets 无白名单用户；Investors 指标 0；Invite users 和 Invite + Send 表单可见。
- **B：**[Sandbox 官方说明](https://docs.brickken.com/get-started/sandbox)区分邮箱 KYC 与每资产钱包白名单，且 needKyc=false 仅适用于 Sandbox。上述界面未显示真实申请/审核记录，不能复核关联机制。
- **D：**企业 KYB、投资者资格证据、审批角色/理由、拒绝后重试、批量失败回执、受益人/份额对账、税务与地域限制均无 Web 实测。

### P2P / ROFR

- **A：**开关和默认值可见，Orders/ROFR 没有数据；投资者站 Private Sale 点击后需登录。
- **B：**[Brickken P2P 官方说明](https://www.brickken.com/post/introducing-p2p-digital-asset-transfers-private-secondary-markets)有订单、KYC、托管、ROFR 概念。
- **D：**卖单创建、挂牌数量/价格/期限表单、撮合、撤销、手续费、托管结算、ROFR 通知/接受/超时规则的**Web 细节**均未验证。

### 收益

- **A：**Issuer 的 Send earnings 禁用；Distributed 指标为 0。
- **B：**[STO 指南](https://docs.brickken.com/api-reference/guides/tokenize-and-run-an-sto)提供 dividendDistribution API。
- **D：**Web 分配向导、快照日、分配对象、钱包/法币、税务、失败补发、投资者 Claim 或到账页面均未验证。

## 4. 商业、权限及 UI 缺口

| 缺口 | 当前证据 | 下一步所需条件 |
|---|---|---|
| 资产创建完整向导和 Token 参数 | A：Add new 跳套餐页；[官方旧图](evidence/sandbox-assets.jpeg)只见资产类型 | 拥有可新建资产的 Sandbox license/credits；仅测试网络、无真实资产 |
| 发行提交、钱包连接和链上确认 | A：仅空表单；Home 提示激活 license | 明确测试钱包与无真实资金授权；不索取私钥 |
| 法律文件上传/审批/发布 | A：已有文件链接及“先发布”提示 | 测试数据与相应权限；不提交真实法律/身份资料 |
| Portal 编辑/预览/发布 | A：持续加载 | Brickken 修复加载或开通配置；记录加载失败细节，勿伪称字段 |
| 投资者 KYC/认购/持仓/Claim | A：单独登录门槛 | 独立测试投资者账号与测试发行；由用户完成必要的注册/协议同意 |
| 收益分配 | A：按钮禁用、无持有人 | 测试持有人、测试收益资产和授权钱包；任何链上交易由用户本人执行 |
| P2P/ROFR 全状态 | A：开关及空表；B：官方说明 | 测试订单、授权身份与可转让资产；不执行真实金融交易 |
| Domain/White-label | A：credits 0 锁定；多资产编辑禁用 | 官方授权或演示账户；不购买、不联系支持 |
| 团队角色与权限 | 当前侧栏只代表本账号 | 至少不同角色测试账号或官方权限矩阵 |
| 套餐、账单与部署 | A 内部套餐页与 B 官网额度冲突 | 官方报价/合同、发票和超额计费文档；不要把营销表当合同 |
| API | B：官方开发文档，未实测 Key | 用户授权的 Sandbox API Key 与测试环境；Key 不入仓库/聊天 |
| 日本与阿联酋适用性 | D | 目标国家的监管、KYC/支付/语言/数据驻留官方证据；本轮不推断合规可用 |

## 5. 下一轮优先补测清单

1. **P0 可访问性：**由 Brickken 或用户提供可创建测试资产、可编辑门户的 Sandbox 权限；再次记录资产向导各步、校验、取消/保存草稿和权限错误。当前 Add new 跳套餐页与编辑器持续加载应先解决。
2. **P0 发行闭环：**用纯测试资产/测试网络，在用户授权的钱包操作范围内记录 Token 配置、法律文件状态、发行表单校验、提交、链上确认、Close/rollback。任何需签名的不可逆交易由用户本人完成。
3. **P0 投资者端：**用户本人完成独立测试投资者注册及条款同意；记录资格/KYC、白名单、认购金额与付款方式、失败态、持仓、Claim、收益和退款。发行方邮箱与投资者邮箱分开。
4. **P1 Portal/白标：**获得编辑器可加载账号后记录每个配置区、预览/发布版本、域名绑定、邮件、品牌和多资产导航；留去敏登录态截图。
5. **P1 P2P：**在测试身份与测试资产下记录卖单、买单、ROFR、撤销/过期、费用及异常提示。
6. **P1 商业/权限：**取得当前套餐合同或正式报价，核对内外价格差异、credits、席位、域名、API 额度与超额费；不同角色比较菜单和按钮。
7. **P2 区域适配事实：**再研究日本/阿联酋的可用法律结构、KYC/KYB 提供商、支付轨道、币种、语言、时区及数据驻留；单列来源与日期。

**人工授权阻塞点：**独立投资者账号注册及条款同意、测试钱包签名、任何真实/不可逆交易、可能的付费 license/域名 credits、API Key 申请。当前任务不要求也不执行这些动作。

## 6. 截图与取证缺口

仓库 [evidence/](evidence/) 有 5 张 Brickken 官方公开图像副本，均为 B，原图 URL 与说明在[交互审计截图索引](Brickken-Sandbox-Interaction-Audit.md#7-截图证据索引)。本轮 A 页面由浏览器实时查看，但**登录态截图无法在当前受限环境导出为仓库文件**；故 A 截图为 0。若产品总控需要逐页图证，需在获得安全导出途径后补存并逐页去敏；不能用官方旧图替代。