# RWA SaaS｜平台总后台总体架构与导航清单（Draft v0.1）

> **文档状态：Draft｜2026-11-19**
>
> 本目录文档索引见 [README](README.md)，逐页 UI-Ready 规格及跨模块审计见对应文档。
>
> 本文是下一阶段 Platform Admin 的总体产品架构与导航基线，不是 UI-Ready 逐页 PRD，不授权前端开发、服务端/API/数据库开发或真实业务操作。本文只整理现有已批准产品规则、历史页面组、候选范围与当前源码证据；不修改历史 DEC、Frozen、193 项正式功能版本归属。

## 0. 执行结论

RWA SaaS 由五个产品端组成：官网 W、发行企业 SaaS I、企业专属投资者门户 V、统一投资者平台 M、平台总后台 P。外部适格服务与有权执行主体 X 是跨端协作方，不是第五/第六个用户前台。

下一阶段优先完成 **P 平台总后台**。P 的定位是管理 SaaS 商业客户与 Tenant、平台统一投资渠道、M 统一投资者账户的必要运营视图，以及跨端工作流、安全、规则、外部服务和只读报表。

P 不是 Issuer 的超级管理员，也不是资金、法定名册、Token 或收益的控制台。平台总后台可以管理“谁能使用 SaaS、哪些 Offering 能在平台 M 渠道展示、平台统一投资者账户的必要服务状态、平台运营异常”，但不能代替 Issuer 或依法有权 X 决定资产发行、投资者权利、真实资金和链上执行。

**本轮总体导航建议：9 个一级模块。** P-01～P-17 沿用历史页面组；P-15～P-17 对应的 M23 V1 范围已由 DEC-057 批准。P-18 是为满足 M24 平台运营管理而提出的 P 端页面组扩展，不改变历史 125 页面组统计或新增 M 功能 ID。

## 1. 审查依据与证据等级

### 1.1 历史已批准产品规则

| 来源 | 已批准内容 | 本文采用方式 |
|---|---|---|
| [DEC-026｜S04-08 平台运营后台批准](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-026-step04-s0408-platform-operations-approved.md) | M03-F001 客户申请审核、M03-F002 Tenant 开通/暂停/恢复、M03-F005 敏感资料受控访问；批准的是逻辑页面组、操作边界与状态类别，不是 UI/字段级 PRD | 作为发行机构商业管理与 Tenant 管理的正式产品依据 |
| [S04-08 平台运营完整设计](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md) | 客户管理、Tenant 管理、安全审计、工作中心的原始产品归属 | 复用 P-01～P-06、P-11～P-12 的历史页面责任 |
| [DEC-034｜Step05-05 R01～R06](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md) | 平台商业权限与受控服务、Tenant/RBAC/敏感访问、原业务意图异常恢复、通知、规则/审计/只读报表、外部服务隔离六项产品规则全部批准 | 作为 P 与 I/V/X 的跨端责任和不可越权边界 |
| [Step05-05 平台后台产品级 PRD](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md) | R01～R06 的业务行为、Guard、异常保护与领域权威关系 | 作为运营中心、规则、安全、报表、外部服务模块的产品规则依据 |
| [Step05-05 跨端状态与异常规范](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-05-05-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md) | P/I/V/X 的状态事实独立、任务与业务结果分离、Unknown 处理、Tenant 退出后的真实义务保留 | 作为跨端流程、状态与异常设计依据 |

### 1.2 五端与统一投资渠道依据

| 来源 | 已确认内容 | 边界 |
|---|---|---|
| [DEC-044｜统一投资端战略](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-044-rwa-saas-unified-investor-platform-strategy-approved.md) | W/I/M/V/P 五端产品形态；M 是跨发行企业统一投资入口，V 是 Issuer 自有门户；Issuer 逐 Offering 自愿申请 M 渠道展示；P 审核平台渠道 | 不批准集中二级市场、订单簿、AMM 或平台自动持款/签名 |
| [DEC-045｜M23/M24 功能拆分与版本管理](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-045-rwa-saas-marketplace-function-scope-approved.md) | 2026-10-28 定义 M23 七项、M24 四项的功能边界、去重和共享主账原则；当时尚未批准版本归属 | 业务拆分继续有效；版本状态由后续 DEC-057 更新 |
| [DEC-046｜五端信息架构方向](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-046-rwa-saas-five-surface-information-architecture-approved.md) | 五端 125 组候选页面方向；P 原 14 组加 P-15～P-17 投资端运营组 | 只批准菜单/页面组方向，不代表 125 组已冻结或逐页 UI-Ready |
| [五端 125 页面组清单 Draft](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-06-Five-Surface-125-Page-Inventory-Draft-v0.1.md) | P-01～P-14 原有页面组、P-15～P-17 投资端运营页面组及跨端路径 | DEC-046 批准页面组方向；DEC-057 后续批准 M23 V1 范围。逐页 UI-Ready 仍需设计 |

| [DEC-057｜V1 五端范围及 M23/M24 纳入](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-057-v1-five-surface-scope-and-unified-marketplace-approved.md) | 2026-11-09 后续批准 M23/M24 共 11 项全部进入 V1；原 193 项历史台账不改，当前有效追踪总数 204、V1 统计 157 | **版本状态以 DEC-057 为准**；其明确覆盖 DEC-045 关于候选状态和版本归属未定的旧结论 |\n\n### 1.3 投资者身份与 KYC 边界依据

- [DEC-069｜投资者统一 KYC 与 Issuer 脱敏管理](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-069-investor-kyc-centralization-and-issuer-masked-view-v1-approved.md)：投资者在投资者端提交 KYC，第三方服务商实际核验，平台接收并维护权威核验状态；Issuer 只查看本企业授权范围内的脱敏资料与 KYC 状态。M 与 V 账户仍独立，KYC 结果复用不等于合并账户、钱包、订单历史或持仓。
- [DEC-074｜Issuer 投资者管理 UI-Ready 收口](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-074-investor-management-ui-ready-v1-closeout-approved.md)：范围是 **Issuer 企业 SaaS 的本企业投资者关系只读视图**，不是平台全局投资者库或平台 KYC 工作台。不得把该决策直接当作 P 端投资者管理 UI 已完成的证据。

## 2. 五端产品关系与责任

| 产品端 | 主要用户 | 核心责任 | 不负责的事项 |
|---|---|---|---|
| **W｜官网** | 潜在 SaaS 企业客户 | 产品介绍、套餐说明、企业邮箱登录入口、统一投资平台介绍入口 | 不承载发行企业的日常业务操作；演示登录不等于生产身份会话 |
| **I｜发行企业 SaaS** | 发行企业 | 企业资料与 KYB、资产、Instrument、Offering、企业投资者关系、认购订单、资金、配售/持有人、Token、收益与存续管理、企业门户配置 | 不管理其他 Issuer 的业务；不承担平台全局客户运营或跨 Issuer 投资者账户管理 |
| **V｜企业专属投资者门户** | 某一家 Issuer 的投资者 | 访问该 Issuer 获授权展示的资产/Offering，完成该 Issuer 业务要求的投资者流程，查看本人订单、持仓与收益 | 不展示其他 Issuer 的资产；不等同 M 统一投资者账户 |
| **M｜统一投资者平台** | 平台投资者 | 跨 Issuer 发现经平台审核的 Offering，使用 M 账户进行授权范围内的 KYC、认购与投后查询 | 不取代 Issuer 自有 V 门户；不建立第二套订单、资金、配售、法定登记、Token 或收益主账 |
| **P｜平台总后台** | SaaS 平台运营团队 | SaaS 客户/Tenant 管理、M 渠道上架运营、M 统一投资者账户必要管理、平台工作流、规则、安全、服务商与只读报表 | 不代 Issuer 批准合法发行、修改资产/权益条款、确认真实收款/退款、法定登记、Mint/Burn 或收益出款 |
| **X｜外部适格服务/有权主体** | KYC 服务商、电子签、合法资金方、登记主体、Signer 等 | 在适用法域与授权范围内执行真实核验、签署、持款/支付、法定登记或链上签名 | Provider 回调或 HTTP 成功不能自动等同业务完成；各 X 的责任不可混为一个“平台权限” |

### 2.1 关键业务关系

W 官网引导企业进入 I；Issuer 在 I 建立 Asset、Instrument 和 Offering。企业针对单个已正式发布且当前可用的 Offering 自愿申请 M 渠道：I-35 → I-67 → P-15 → P-16 → M-02/M-04；I-68 查询渠道状态。P-17 负责持续监控与异常协作。Issuer 同时可以独立配置 V 门户，V 只服务该 Issuer。M 与 V 可在合法依据和授权下引用平台 KYC 结果，但账户、钱包、订单、持仓不自动合并。P 通过 M17/M18/M19/M20/M22 提供跨端运营协作；P-14 仅汇总平台有权查看的商业、渠道、投资者服务与运营状态。Issuer M21-F001～F006 金融业务报表仍由 Issuer 授权用户使用，P 不因此取得跨 Issuer 订单、资金、登记、Token 或收益明细权限。

## 3. 必须明确的两类投资者入口

| 对比项 | V 企业专属投资者门户 | M 统一投资者平台 |
|---|---|---|
| 运营主体 | 单个发行企业 | SaaS 平台运营方 |
| 投资机会范围 | 仅该企业的 Offering | 多家 Issuer 获授权且通过平台渠道审核的 Offering |
| 投资者账户 | V 侧账户保持独立 | M 侧统一投资者账户 |
| KYC | 可在合法依据及授权下引用平台 KYC 结果 | 由平台统一身份/KYC 服务承接 |
| 投资者关系 | 与当前 Issuer/Tenant 建立的业务关系 | M 账户与多个 Issuer/Offering 的合法授权关系 |
| 认购与持仓 | 仅展示该 Issuer 相关业务 | 展示本人在 M 渠道获授权的业务；底层交易事实复用原业务领域 |
| 平台后台可见范围 | 不建立默认跨 Issuer 的 V 投资者总库；仅处理必要服务异常与受控支持 | 可以管理 M 账户的必要平台级状态，敏感身份资料仍受控访问 |

**禁止合并：**同一邮箱、姓名、证件或钱包不自动把 M 与 V 账户合并；KYC 结果可以在合法依据和必要授权下被引用，但不自动迁移钱包、订单历史、持仓或 Issuer 关系。

## 4. P 平台总后台定位

P 是平台运营方的管理与控制中心，管理四类对象：

1. **SaaS 商业客户与 Tenant**：谁是 SaaS 买方、KYB/订阅处于什么状态、Tenant 是否开通或受限。
2. **统一投资渠道**：某个 Issuer 的某个 Offering 是否获准在 M 平台展示、展示给哪些受众、渠道当前是否暂停。
3. **平台统一投资者账户**：M 账户的必要账户状态、KYC 结果引用和平台服务异常；不建立跨所有 V 门户的默认身份总库。
4. **平台运营与安全**：待办、异常、通知、规则、审计、外部服务健康和只读报表。

### 4.1 P 端权限与业务责任边界

| P 可管理/查看 | P 仅在合法授权和最小必要范围内查看 | P 不得直接执行 |
|---|---|---|
| SaaS 客户申请与商业 KYB 流程；Tenant/Free/Standard 服务状态；平台渠道审核与发布状态；平台 M 账户状态；平台服务连接健康；跨端运营任务与只读统计 | KYB/KYC 原始材料、投资者身份明细、跨 Issuer 关系、导出文件、敏感审计证据；必须具备具体业务目的、适格审批、字段/时间范围限制与审计 | 修改 Issuer Asset/Instrument/Offering 法律条款；代 Issuer 批准发行；直接收取/退款投资者资金；修改配售或法定持有人名册；代替实际 Signer Mint/Burn；批准或出款收益/本金 |

**平台管理员身份不自动赋予客户数据、客户钱包、真实资金或链上签名权限。** 前端按钮显示/隐藏只是 UI 呈现，真实授权由后续服务端权限机制承担；本项目当前仅设计前端产品，不开发该服务端机制。

## 5. 平台总后台建议导航（9 个一级模块）

以下为 P 平台总后台的 9 个一级导航。P-01～P-17 是 DEC-046/057 的历史页面组；P-15～P-17 对应的 M23 业务范围已由 DEC-057 批准进入 V1，逐页规格见本目录下的 M23 UI-Ready Draft。P-18 是本轮为满足 M24 平台运营管理而提出的 P 端页面组扩展，不改变历史 125 页面组数量或新增 M 功能 ID。

| 一级导航 | 二级页面/页面组 | 历史页面组/功能映射 | 核心责任 |
|---|---|---|---|
| **01 平台工作台** | 平台运营总览、待办摘要、异常预警、关键业务指标 | P-01；M03/M01/M17 只读聚合 | 让平台运营人员一眼看到企业、渠道、投资者服务与异常情况；所有指标注明数据来源/更新时间 |
| **02 发行机构管理** | SaaS 企业客户列表、商业 KYB 审核、Tenant 列表与详情、订阅/商业收费异常、暂停/恢复与交接 | P-02～P-06；M03-F001/F002、M01、M17 | 管理 SaaS 买方及商业服务关系；企业商业 KYB 不等于 Issuer 资产或证券发行获批 |
| **03 统一投资渠道管理** | 上架审核与补件（审核通过即自动上架）、已上架渠道管理（暂停/下架/恢复）、渠道监控/投诉异常/统计 | P-15～P-17；M23-F001～F007（V1 Approved） | 管理单个 Offering 在 M 渠道的展示授权；审核通过由系统自动创建 Listing 并上架，不设独立人工发布；不修改 Issuer 原 Offering，不代替真实认购与金融资格判断 |
| **04 投资者管理** | M 统一投资者账户列表、账户详情、KYC 状态与有效期、身份/授权引用记录、投资者服务异常 | **P-18（本轮 P 端页面组扩展建议）**；依赖 M24-F001/F002（V1 Approved）、M09、M20 | 仅管理 M 统一账户的必要平台状态与 KYC 结果引用；不创建跨所有 V 门户的投资者总库，不手工覆盖第三方 KYC 结论 |
| **05 运营中心** | 平台待办/审批/补件、异常工单与恢复跟踪、通知模板/发送历史/投递失败 | P-07、P-08；M17、M18 | 集中运营任务与通知；工单关闭不代表原业务付款、登记、Mint 或收益已经完成 |
| **06 平台规则与套餐** | Free/Standard 能力与配额、平台通用规则、规则版本/审批/停用 | P-09、P-10；M19、M01 | 管理平台商业能力与强制规则；不提供可视化低代码规则引擎，不替 Issuer 修改既有发行条款 |
| **07 安全与审计** | 敏感资料访问申请/授权记录、安全事件、凭证撤权、操作审计、受控导出 | P-11、P-12；M03-F005、M20 | 最小权限、限时访问、撤权、追加审计；不开放平台超级管理员任意读取 KYC 原件或客户私钥 |
| **08 外部服务管理** | 第三方服务连接、服务健康、凭证/环境状态、Webhook/Provider 异常 | P-13；M22-F001～F008 | 监控平台及 Issuer 授权连接；区分 Sandbox/生产环境；Provider 恢复后仍需核验原业务结果 |
| **09 数据与报表** | 商业经营、统一投资渠道、M 投资者服务、平台运营质量四类报表 | [P-14](PLATFORM-ADMIN-P14-PLATFORM-REPORTING-AND-ANALYTICS-UI-READY-PRD-DRAFT-v0.1.md)；M03/M01/M17/M18/M20/M22/M23/M24（受权只读） | 只读汇总平台有权查看的数据，显示统计口径、时间基准、延迟与币种/单位；不复制 Issuer M21 金融报表，不形成第二本资金/权益账 |

### 5.1 P-01～P-18 页面组归属

| 页面组 | 归属 | 本轮处理 |
|---|---|---|
| P-01 | 平台工作台 | 保留，纳入一级导航 01 |
| P-02～P-03 | SaaS 客户与商业 KYB | 保留，纳入一级导航 02 |
| P-04～P-06 | Tenant、订阅、收费异常与服务恢复 | 保留，纳入一级导航 02 |
| P-07～P-08 | 工作流、异常、消息与投递 | 合并到一个一级「运营中心」，保留两个职责清晰的二级页面组 |
| P-09～P-10 | Free/Standard 能力及业务规则 | 合并到一级「平台规则与套餐」，不合并规则事实 |
| P-11～P-12 | 敏感访问、安全事件与审计 | 合并到一级「安全与审计」，保留不同页面组 |
| P-13 | 外部服务连接/健康/凭证 | 保留，纳入一级导航 08 |
| P-14 | 平台报表 | 保留，纳入一级导航 09 |
| P-15～P-17 | 上架审核（通过即自动上架）、已上架渠道管理、渠道监控 | DEC-046/057 已批准页面组方向与 M23 V1 范围；审核通过由系统自动创建 Listing 并上架 M，P-16 不设首次人工发布 |
| **P-18（本轮扩展）** | **M 统一投资者账户管理** | **承接已批准的 M24-F001/F002；不新增 M 功能 ID，不计入历史 125 页面组** |

合并一级导航只是降低菜单复杂度，不代表把不同领域真值合并。P-07 与 P-08、P-09 与 P-10、P-11 与 P-12 仍保留各自的产品责任。

## 6. 投资者管理 P-18 的建议边界

历史 P-01～P-17 中没有独立的 P 端投资者账户管理页面组。DEC-069 规定平台维护统一 KYC 权威结果，DEC-074 规定 Issuer 只能查看本企业脱敏关系；这两项决策并未直接批准 P 端全局投资者管理 UI。为承接已批准 M24-F001/F002，P-18 已形成独立 UI-Ready Draft，范围严格限定为 M 统一投资者账户，不扩展到 V 门户投资者。

### 6.1 建议纳入

- M 统一投资者账户列表：平台 M 账户编号、脱敏展示名称/类型、账户状态、KYC 状态、KYC 状态更新时间/有效期（若服务提供）。
- M 投资者账户详情：平台账户基本状态、身份引用、KYC 结果摘要、必要授权记录、相关服务异常。
- KYC 状态异常处理：Provider 状态同步失败、Unknown、过期、需要投资者重新提交资料等运营事项；平台运营可发起核查/通知/工单，不可手工把未通过改成通过。
- 账户限制与恢复：只允许在平台自身合法权限范围内处理 M 账户的服务访问限制；限制理由、发起人、审批/依据、时间和恢复记录必须可见。
- 投资者支持问题：通过 M17 任务/异常机制关联，不另建完整 CRM 或高级客服工单系统。

### 6.2 明确不纳入

- 不建立一个可以检索所有 V 门户投资者的全局客户数据库。
- 不把 M 与 V 账户、钱包、订单、历史持仓自动合并。
- 不向普通运营人员展示完整身份证件、原始 KYC 报告、AML/制裁细节或 Provider 原始 Payload。
- 不提供人工覆盖第三方 KYC 结论、代替投资者补件、手工修改法定投资者资格的按钮。
- 不复制跨 Issuer 的订单、付款、配售、法定登记、Token 或收益主账；确有运营查询需求时只引用 M 渠道本人业务的受权只读状态。

**版本边界：**M24-F001/F002 已由 DEC-057 批准纳入 V1。P-18 是承接 M24 的 P 端运营管理 UI 页面组扩展，不是新增 M24 功能，也不改变历史 125 页面组统计。逐页规格见 [P-18 统一投资者账户管理 UI-Ready PRD](PLATFORM-ADMIN-P18-UNIFIED-INVESTOR-ACCOUNT-MANAGEMENT-UI-READY-PRD-DRAFT-v0.1.md)。

## 7. 六条跨端关键业务流程

### 7.1 SaaS 企业入驻与 Tenant 管理

1. 企业从 W 官网进入邮箱验证与企业 SaaS 入口。
2. I 创建/使用对应企业工作空间，提交商业 KYB、套餐及必要资料。
3. P 在「发行机构管理」查看客户申请与商业 KYB，按权限补件/复核。
4. M01 保持 Tenant、Free/Standard 商业权益与服务状态的唯一事实；P 仅通过受权操作入口查看或执行开通/暂停/恢复。
5. Standard 商业付款、Tenant Paid、Issuer 真实发行准入是不同事实；任一通过都不自动替代其他 Gate。

### 7.2 Issuer Offering 申请统一投资渠道展示

Issuer 的 Offering 发布状态、P 的渠道审核状态、M 的展示状态、M09 当前投资者资格、实际可认购状态必须分开。标准业务顺序为：

**I-35 Issuer Offering → I-67 平台上架申请 → P-15 渠道审核/补件 → P-15 审核通过后系统自动创建 Listing 并上架 M → M-02/M-04 投资者发现与详情 → P-16 已上架渠道管理（暂停/下架/恢复）→ P-17 渠道监控；I-68 查询渠道状态。**

- P 审核的是 WDEX 自身渠道展示条件，不替 Issuer 批准资产或金融工具合法性。
- P-15 审核通过即触发自动上架：审核确认时一并确认展示地区/受众和 P-10 规则 Gate；系统自动创建唯一 Listing 并使其在 M 展示。P-16 不承担首次发布，也不设置单独人工发布步骤。
- 自动上架结果 Unknown/失败时保留审核决定与原操作 ID，系统幂等核验/重试并转运营异常；不得创建重复 Listing 或由运营人员绕过审批手工发布。
- 渠道暂停/下架不等于 Issuer Offering 整体关闭，不删除历史订单、实收、配售、法定登记或 Token 事实。
- P-15～P-17 页面组方向由 DEC-046 批准，M23 七项 V1 范围由 DEC-057 批准；逐页 UI-Ready 规格见《统一投资渠道业务闭环与 I-67/I-68、P-15～P-17 UI-Ready 产品规格》。

### 7.3 M 统一投资者注册与 KYC

1. 投资者从 M 入口创建/使用 M 账户。
2. 投资者在投资者端完成 KYC；第三方适格服务商实际核验。
3. 平台接收并维护 KYC 权威结果，P-18 只展示必要摘要和运营异常。
4. Issuer I 端仅获得当前企业业务所需的脱敏状态；不得反向获取完整原始 KYC 材料。
5. KYC 通过只表示满足 KYC 这一前置条件，不自动表示某 Offering 可购买。

### 7.4 M 投资者认购与持仓

- M 投资端提供跨 Issuer 的投资机会发现和本人投资体验。
- 认购/付款/配售/法定登记/Token/收益仍复用 M10/M11/M12/M07/M13 等唯一业务权威。
- P 只在异常、投诉或平台运营需要时通过 M17/M20/M22 查看最小必要状态；不得手动修改交易事实。
- M24-F003/F004 跨 Issuer 订单、持仓与收益汇总已由 DEC-057 批准纳入 V1；底层事实仍复用 M10/M11/M12/M07/M13，不建立第二套主账。

### 7.5 V 企业专属门户

- Issuer 在 I-13 配置自己的门户展示信息、披露来源与 Offering 范围。
- V 是面向该 Issuer 投资者的独立访问端；门户内容和企业业务由 Issuer 管理。
- P 只在 Tenant/服务管理和外部服务健康范围查看门户实例状态；不替 Issuer 编辑 Logo、介绍、Offering 条款或投资者页面内容。
- V 账户与 M 账户保持独立；必要 KYC 结果复用必须具备合法依据与授权。

### 7.6 Tenant 暂停、退租与存续业务

- P 可受权限制 SaaS 商业服务，但不得以暂停 Tenant 删除真实订单、已收款、合法持有人登记、Token、未付收益/本金或法定义务。
- 已有真实权利的必要查询、履约、追偿、数据保留与受权责任交接必须继续。
- Provider 或支付结果 Unknown 时先查原 Intent/证据，不能因工单关闭、服务恢复或通知已发送就标记原业务完成。

## 8. 平台内部角色职责（逻辑职责，非最终权限矩阵）

| 角色职责 | 主要工作 | 不能默认拥有的权限 |
|---|---|---|
| 平台客户运营 | 企业客户资料、入驻进度、套餐服务问题 | 不能直接查看完整 KYC 原件或修改发行条款 |
| 商业 KYB 审核 | 商业买方资料补件、审核与复核记录 | 不能替代发行主体合法性/Offering 审核 |
| Tenant 运营 | Free/Standard、服务状态、暂停/恢复与退租交接 | 不能冻结客户真实资金、法定名册或 Token |
| 投资渠道审核 | 单个 Offering 上架资料、披露、授权、展示地区/受众与渠道 Gate；批准后触发系统自动上架 | 不能修改 Issuer Offering 经济/法律条款；不能将自动上架改为独立人工发布 |
| 投资者运营 | M 账户状态、KYC 服务状态、必要支持工单 | 不能手工覆盖 KYC 结论、访问所有 V 投资者 |
| 安全与审计 | 敏感访问审批、撤权、安全事件与审计证据 | 不能读取客户私钥或无目的导出高敏资料 |
| 平台规则运营 | Free/Standard 能力与平台级规则版本 | 不能改写已发生的合同/Quote/投资者权利 |
| 只读审计/管理层 | 受权范围内的报表与审计查询 | 不拥有业务写入、资金执行或权限自批能力 |

具体账号角色、权限码、审批人配置和职责分离规则属于后续 UI-Ready 详细设计；本阶段只确定职责边界。

## 9. 页面与交互设计统一原则

本项目当前只做桌面 Web 产品与前端原型。平台总后台沿用现有 Issuer 的设计语言，但按平台运营场景设计信息密度和操作效率。

1. **导航克制：**使用本文件建议的 9 个一级模块；二级页面按业务对象组织，不按功能 ID 堆菜单。
2. **列表优先：**企业、Tenant、Offering、M 投资者、任务、服务连接等使用统一列表/筛选/详情模式；常用状态和下一步操作清楚可见。
3. **详情聚合：**一个业务对象的基本信息、状态、关联记录、历史事件和操作入口集中在详情页，不拆成大量碎片页面。
4. **复杂流程用页面：**KYB 审核、Offering 上架审核、敏感访问申请、异常调查等复杂流程使用独立页面/工作区；短确认、删除/暂停等危险确认使用标准弹窗。
5. **不默认使用右侧 Drawer：**复杂新建、审核与配置流程不使用右侧弹出侧栏作为默认交互；优先标准页面或清晰弹窗，避免增加学习成本。
6. **状态分层：**商业 KYB、Tenant 服务状态、Offering 上架审核、M 展示、投资者 KYC、订单/资金/法定登记/Token 状态分别呈现，不用一个“审核通过/完成”覆盖多个事实。
7. **最小信息：**平台人员默认看到完成工作所需的最小信息；敏感原文通过明确申请、授权、限时访问与审计路径处理。
8. **操作有后果提示：**审核通过并自动上架、暂停、恢复、撤权、下架、导出等操作显示影响范围、原因和结果记录；不能用模糊的“确认”按钮。
9. **无效按钮不显示：**按钮必须对应明确动作、前置条件和反馈；暂不可操作时解释具体原因。
10. **不做移动端：**不设计移动端专属导航和手机页面；桌面窄窗口自然适配即可。

## 10. 当前前端源码审计结论

审计基准：GitHub 分支 release/v1-engineering-handover-20261116，提交 8785e8eaa4f03075849746d664d0d90631d73c8c。

| 对象 | 当前源码证据 | 结论 |
|---|---|---|
| W 官网 | apps/website/src/main.tsx 路由包含首页、产品、解决方案、套餐、帮助、联系、政策、注册/验证/登录、升级及 /investor-platform | 官网前端存在；演示邮箱验证码不是生产认证 |
| M 统一投资者平台 | apps/website/src/pages/InvestorPlatform.tsx 文案明确标记「规划中的渠道/筹备中」，没有投资者注册、KYC、Offering 列表、认购或付款页面 | 当前只有官网介绍页，不是实际 M 投资者平台 |
| I 发行企业 SaaS | apps/website/src/issuerNavigation.ts 与 apps/website/src/pages/IssuerIssuance.tsx 可见现有 Issuer 导航、Project/Offering/发行准备页面；导航源码仍保留旧认购记录/锁仓记录二级入口 | Issuer 前端已存在，但当前可审计源码未发现 I-67/I-68 入口、渠道申请页或渠道状态；须按 2026-11-13 精简导航在既有发行管理中补充，不重复 Offering 功能 |
| V 企业专属投资者门户 | I 内的「投资者门户」是 Issuer 配置与内部预览；源码显示真实门户服务/实例未连接、无对外地址、预览不可执行真实登录/KYC/认购/付款 | 不能把 Issuer 内部门户配置页当成已完成的独立 V 前台 |
| P 平台总后台 | 当前仓库 apps/ 只有 apps/website 与 apps/issuer 两个前端应用；没有独立 apps/admin、P 路由或 P-01～P-17 页面实现 | 平台总后台前端尚未建立 |
| 平台统一投资者管理 | DEC-057 已批准 M24-F001/F002；DEC-069 定义平台 KYC 权威结果，DEC-074 只覆盖 Issuer 本企业脱敏视图 | 现有 P 页面组未包含独立 M 账户运营页；P-18 是本轮 P 端 UI 扩展建议，不代表既有页面已完成 |

**当前实际端侧状态总结：**W 官网前端存在；I Issuer SaaS 前端存在，但当前可审计源码未发现 I-67/I-68；V 独立投资者前台尚未完成；M 统一投资者平台当前仅有官网介绍/筹备页面，完整投资者流程尚未建立；P 平台总后台尚未建立独立前端应用。本文与配套 PRD 均为产品设计，不把文档完成等同源码完成。

## 11. 版本、功能 ID 与文档治理边界

1. DEC-017 原 193 项首次版本归属保持 V1.0 146、V2.0 22、V3.0 20、TBD 5，不修改原始历史台账。
2. DEC-057 已追加批准 M23/M24 共 11 项进入 V1；当前 V1 统计 157 项，当前有效追踪总数 204 项。
3. P-15～P-17 对应 M23 V1 业务范围已批准；本轮新建的逐页 UI-Ready PRD 仍为 Draft，待审核。
4. P-18 是 P 端运营 UI 页面组扩展建议，映射已批准 M24-F001/F002；不新增正式 M 功能 ID，不改变历史 125 页面组数量。
5. M03-F003/F004 等高级客户服务仍按既有版本边界处理；不以平台后台完善为由提前纳入 V1。
6. Step05-05 R01～R06 的产品规则 Approved 不等于字段、UI、权限矩阵或生产实现完成。
7. 本文不修改 V1.0、V1.5、V2 文档，不修改历史 DEC/SCOPE/Frozen，不改 PR #9，不修改任何前端源码。

## 12. 下一阶段详细设计顺序

**当前推进状态（2026-11-19）：**P-01～P-06（已按 DEC-037 修正为永久 Free/Standard）、I-67/I-68 与 P-15～P-17（审核通过自动上架）、P-18、P-07～P-08、P-09～P-10、P-11～P-12、P-13、P-14 均已形成 UI-Ready 产品规格 Draft v0.1。上述文档均未进入前端开发。

平台总后台总体架构确认后，按依赖和业务优先级推进 UI-Ready 逐页 PRD：

| 顺序 | 模块 | 设计范围 | 原因 |
|---|---|---|---|
| 1 | 平台工作台 + 发行机构管理 | P-01～P-06 | UI-Ready Draft 已完成；Free/Standard 商业模式已按 DEC-037 清理，并纳入跨模块一致性审计 |
| 2 | 统一投资渠道管理 | I-67/I-68、P-15～P-17 | UI-Ready Draft 已完成；审核通过即自动上架，P-16 只管理已上架 Listing |
| 3 | 投资者管理 | P-18 | UI-Ready Draft 已完成；范围仅限 M 统一投资者账户与 KYC 服务状态 |
| 4 | 运营中心 | P-07～P-08 | UI-Ready Draft 已完成；仅处理平台有权负责的任务与受控通知 |
| 5 | 平台规则与套餐 | P-09～P-10 | UI-Ready Draft 已完成；永久 Free/Standard、平台强制规则与 M 渠道展示范围，不含独立资格引擎 |
| 6 | 安全与审计 | P-11～P-12 | UI-Ready Draft 已完成；敏感访问限时授权、追加审计、撤权与数据留存边界已明确 |
| 7 | 外部服务管理 | P-13 | UI-Ready Draft 已完成；只管理连接健康、环境隔离、Webhook 与凭证元数据 |
| 8 | 数据与报表 | P-14 | UI-Ready Draft 已完成；四类平台运营报表、口径/延迟和 M20 受控导出已明确 |

每个模块的 UI-Ready 交付均须包含：页面结构、字段、控件、必填/选填、筛选、按钮/弹窗、状态、异常、空状态、前后页面跳转、Mock 示例数据和可执行的前端验收用例。未实际运行的用例不得标记 PASS。P-01～P-18 及 I-67/I-68 已形成 Draft 规格；第一轮跨模块一致性审计已完成，见 [Platform Admin V1.0 跨模块一致性审计](PLATFORM-ADMIN-CROSS-MODULE-CONSISTENCY-AUDIT-DRAFT-v0.1.md)。下一步为集中产品审核/收口，确认后再安排前端原型开发。

---

## 附录 A｜本轮不做的事项

- 不执行 V1.5 Issuer 前端开发。
- 不开发 M 统一投资者前台或 V 企业独立门户。
- 不开发服务端、数据库、API、真实 KYC、真实资金、钱包签名、法定登记或区块链服务。
- 不修改 DEC-057 已批准的 M23/M24 V1 范围及 204 项有效追踪统计。
- 不修改任何已批准历史文件、Frozen、DEC/SCOPE 或 193 项版本归属。
- 不进行真实业务操作或生产准入判断。

## 附录 B｜核心历史文件索引

- [S04-08 平台运营 Approved v0.1](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md)
- [Step05-05 平台运营产品级 PRD Approved v0.2](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md)
- [Step05-05 跨端状态/异常规范 Approved v0.1](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/docs/03-product-prd/RWA-SaaS-Step-05-05-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)
- [DEC-026 平台运营三项功能批准](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-026-step04-s0408-platform-operations-approved.md)
- [DEC-034 平台后台六项规则批准](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md)
- [DEC-044 统一投资端战略](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-044-rwa-saas-unified-investor-platform-strategy-approved.md)
- [DEC-045 M23/M24 候选功能](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-045-rwa-saas-marketplace-function-scope-approved.md)
- [DEC-046 五端信息架构](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-046-rwa-saas-five-surface-information-architecture-approved.md)\n- [DEC-057 V1 五端范围及 M23/M24 纳入](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-057-v1-five-surface-scope-and-unified-marketplace-approved.md)\n- [I-67/I-68、P-15～P-17 统一投资渠道 UI-Ready PRD Draft](PLATFORM-ADMIN-I67-I68-P15-P17-UNIFIED-INVESTOR-CHANNEL-UI-READY-PRD-DRAFT-v0.1.md)
- [DEC-069 投资者统一 KYC 与 Issuer 脱敏视图](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-069-investor-kyc-centralization-and-issuer-masked-view-v1-approved.md)
- [DEC-074 Issuer 投资者管理 UI-Ready 收口](https://github.com/mirrorshang/rwa-saas-platform/blob/archive/docs-before-final-handover-20261116/decisions/DEC-074-investor-management-ui-ready-v1-closeout-approved.md)


## 14. 第一批集中产品审核记录（2026-11-19）

第一批 R01～R08 审核结果：

| 审核项 | 结果 | 记录 |
|---|---|---|
| R01 五端架构与责任边界 | 同意 A | 保留 |
| R02 九个一级导航 | 同意 A | 保留 |
| R03 P 端核心管理范围 | 同意 A | 保留 |
| R04 P-01 平台工作台 | 同意 A | 保留 |
| R05 P-02/P-03 企业客户与商业 KYB | 修改后确认 | P-03 仅审核 SaaS 商业客户 KYB，不审核 Issuer 发行资产 |
| R06 P-04/P-05 Tenant 管理 | 同意 A | 保留 |
| R07 P-06 SaaS 商业收费异常 | 同意 A | 保留 |
| R08 敏感资料访问边界 | 同意 A | 保留 |

### R05 的明确边界

1. P-03 只负责 SaaS 企业商业 KYB，即确认 SaaS 客户主体及商业准入资料。
2. Issuer 在企业 SaaS 中创建 Asset、Instrument、Offering、完成发行准备及满足发行 Gate 后进行资产发行，不需要平台总后台逐项审核。
3. P-15 只审核企业自愿提交到 M 统一投资者平台的 Offering 渠道展示申请；审核通过即自动创建 Listing 并上架 M。
4. 商业 KYB、Issuer 自身发行准入、M 渠道展示审核为三种不同状态，不得互相替代。

**审核结论：**第一批除 R05 的职责表述需要按以上边界修正外，其余七项全部按推荐方案 A 确认。此记录不改变历史 DEC/Frozen/功能版本归属，不批准前端开发。


## 15. 第二批集中产品审核记录（2026-11-19）

第二批 R09～R16 全部同意推荐方案 A，补充意见无。

- R09/R10：P-07 仅处理平台负责或正式指派的平台协作任务；任务状态不能覆盖原业务状态。
- R11/R12：P-08 仅管理平台业务通知模板及投递；通知投递不等于法定送达或业务完成，Unknown 不得盲目重发。
- R13/R14：P-09 保留永久 Free + 付费 Standard；商业权益不等于生产权限。
- R15/R16：P-10 仅管理平台强制规则及 M 渠道展示地区/受众等规则，采用版本化审批生效；不建设独立投资者资格/投资限额引擎。

本批确认不批准虚构套餐价格、资源配额数值、法域参数或生产技术实现；未决项继续保持开放。


## 16. 第三批集中产品审核记录（2026-11-19）

第三批 R17～R24 全部同意推荐方案 A，补充意见无。

- R17/R18：P-11 敏感资料采用申请制、独立审批、最小字段/用途/期限授权，到期或撤销后撤权；具体角色码保持开放。
- R19/R20：P-12 审计原始事件不可覆盖，只能追加更正；安全事件、数据留存与交接不得绕过未结法定义务、投资者权益或真实资金义务。
- R21/R22：P-13 仅管理平台批准的外部服务连接、健康、Webhook 与凭证安全引用；不显示 Secret、不授予资金/钱包/Token 执行权，环境隔离。
- R23/R24：P-14 保留四类只读聚合报表；不复制 Issuer M21 金融报表，不开放无授权的跨 Tenant 逐笔数据；Unknown 不得按 0，导出受控。

具体角色码、法定留存期限、Provider 选型与生产连接等决策门继续开放。


## 17. 第四批集中产品审核记录（2026-11-19）

第四批 R25～R32 全部同意推荐方案 A，补充意见无。

- R25/R26：P-15 对单个已正式发布 Offering 进行 M 渠道展示审核；审核快照固定关联 Asset、Instrument、Offering、披露文件和授权范围。审核不是资产发行许可。
- R27：P-15 审核通过即触发系统自动创建唯一 Listing 并上架 M；确认成功后 M 才展示，不需要 P-16 二次人工发布；失败/Unknown 必须幂等核验。
- R28/R29：P-16 仅管理已创建 Listing，支持受控暂停/下架/恢复；下架后需企业重新申请并经 P-15 审核。渠道操作不改写 Issuer Offering 及历史交易/权利事实。
- R30/R31：P-17 负责渠道访问/归因聚合、投诉、异常及 P-07 协作，不管理订单、资金、Token 或法定名册主账。
- R32：P-17 只使用 M23-F007 与 M10/M11 的授权聚合事实，不读取 Issuer M21；Unknown 不按 0，缺少数据源时明确待接入。

该批确认的是产品行为和页面规格，不等同真实生产自动上架技术方案或上线授权。


## 18. 第五批集中产品审核记录（2026-11-19）

第五批 R33～R40 全部同意推荐方案 A，补充意见无。

- R33：P-18 仅管理 M 统一投资者账户，不建立 V 门户投资者全局库，不自动合并 M/V 账户。
- R34：第三方 Provider 实际核验；M 平台维护权威 KYC 结果与同步状态；P-18 不允许人工覆盖核验结论。
- R35：平台可按明确依据限制/恢复 M 账户服务访问；不改变 KYC、Offering 资格或既有投资者权利。
- R36：W/I/V/M/P 五端职责独立；企业自愿申请 M 渠道时才进入 P-15；V 与 M 是不同投资入口，互不自动发布或授权。
- R37：订单、资金、配售、法定持有人登记、Token、收益/本金各由原业务领域维护唯一权威事实；P 仅访问最小授权摘要，不复制主账。
- R38：Tenant 暂停、退租、降级不自动删除 M Listing、M 投资者账户或既有投资者权利；企业新增受限 SaaS 操作可按规则停止，存续义务继续履行。
- R39：九个一级导航保持；遵循最小权限和敏感访问申请制；V1 不新增复杂企业分权系统。
- R40：跨端遵循单一状态权威、任务/通知与业务结果分离、Unknown 不当成功、缺失不当 0、幂等防重和历史留存。

第五批八项全部通过。本批及此前四批共 R01～R40 全部完成审核。该确认属于产品设计批准，不等同前端实现、后端/API、Provider、法务/安全准入或生产运行批准。


## 19. 2026-11-20 代码基线与跨端口径复核（待产品负责人审核）

第 10 节的 8785e8e 表记录的是 2026-11-16 release 基线，不能当成当前 Issuer 开发成果。后续 Issuer PR #12（codex/issuer-v1-module01，未合并）以 apps/issuer 为正式主实现，自动建立内部 Project，并保存 Asset/Instrument/Offering 的关联与确认快照；当前完成的是 Sandbox Mock 发行和认购，**不是**可供 I-67 申请 M 渠道的生产「正式已发布」。Platform Admin 设计继续将 I-67/P-15 的生产发行 Gate 保持阻断，待正式 Issuer 权威接口和生产准入接通后再开放。

P-15 仅审核单个已正式发布 Offering 的 M 展示申请；审核通过触发同一申请的自动 Listing 创建/核验，P-16 不承担首次发布。Listing 展示状态和已批准内容复核标记分列；P-17 只消费 M23 归因、M10/M11 授权聚合及 M17/M18 事件，不读取 Issuer M21。详细页面增量见本目录 I-67/I-68、P-15～P-17 规格与新的产品设计完整性审计报告。原 R01～R40 审核记录及 DEC/Frozen 结论不变。
