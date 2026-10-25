# RWA SaaS｜Free永久免费Sandbox × Standard付费Production-eligible：22模块能力矩阵（Draft v0.1）

> **2026-10-26｜本矩阵全部具体资源门和功能映射Draft**；[DEC-037 R05=A](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)仅Approved「永久免费Free/付费Standard、Free几乎完整业务模拟、Standard商业与金融实际生产权限分离」，没有批准任何具体额度或外部服务。正式Mxx-Fxxx**193项初版号**不变；V1只覆盖146项，V2/V3/TBD功能**不因Free演示而提前成为V1交付**。本表按既有22模块示意产品权益，而不是新增正式功能。

## 一、判定代码（仅本Draft书写）

- **C**：Free中允许受控配置/草稿/浏览（原V1对应功能）。
- **S**：Sandbox模拟与可选、批准过的测试网功能；模拟订单/资金/Token/名册/收益无真实法定效力。
- **P?**：Standard订阅使其**有资格申请真实执行**；还需Issuer合法项目/平台自身RG/领域Guard与有权X，绝不代表付费即真发行许可。
- **A**：只有基础账户、可见或内部使用部分能力；不表明V2高级功能已交付。
- **—**：非V1.0正式交付，本表只记录未来归属/演示配置占位，不承诺Free或Standard上线。

## 二、全22模块能力边界（Draft）

| 正式模块 | Free 永久版 | Standard订阅版 | 生产权威/说明 |
|---|---|---|---|
| M01 SaaS客户/套餐/门户 | C＋免费Tenant，Sandbox Portal | 正式商业合同/费用、Issuer标准门户 | M01商业真值；门户真购买受M05/M09另Gate |
| M02 组织/账户/角色 | C，测试角色/组织授权 | C，真实Issuer组织最小权限 | P与Issuer/Signer不可越权 |
| M03 平台运营后台 | P提供Free成本/滥用/安全控制；I无P权限 | P提供Standard商业KYB/权益/异常 | Free不因时间失效；M03不代发行批准 |
| M04 资产与Instrument | C＋S经济条件/权益流程 | C＋P?真实资产、合法Instrument版本引用 | 法律资格由Issuer及有权X确定 |
| M05 Project/Offering/发行 | C＋S完整模拟窗口/价格/发布/订单 | C＋P?依法授权真实发布和认购 | 实际V1只有持续认购/基础配售；集中募集功能仍V2 |
| M06 法律文件/签署 | C＋S文书上传、草稿、模拟签署 | C＋P?正式签署与专业成果引用 | 客户上传≠平台认证合法 |
| M07 Token合约/链管理 | C＋S模拟部署/Mint/Burn或批准测试网 | C＋P?主网受权部署/Mint/Burn及链核验 | 真实Signer不是P后台默认账户 |
| M08 Issuer投资者门户 | S演示、模拟钱包/KYC/订单/收益 | C＋P?对授权真实受众门户/钱包展示 | Free不得提供真实证券购买入口 |
| M09 投资者准入 | S模拟KYC/Offering资格 | P?独立真实身份与当前Offering资格 | KYB商业≠KYC投资者≠Offering Eligible |
| M10 Quote与认购订单 | S模拟报价/签署/订单与容量预留 | P?真实签署、订单和预留 | 订单创建≠付款和配售 |
| M11 投资者支付/募集款 | S模拟收款、退款、受限余额与释放 | P?真实受权收款、退款、募集款合法释放与结算证据 | 不由P技术平台默认持管资金；与M01收费分账 |
| M12 配售/法定登记 | S模拟Allocation、名册和持仓 | P?合法配售与法定名册真值 | Token Mint≠法律登记生效 |
| M13 收益/存续/到期 | S模拟RecordDate、利息/分配/Claim/本金/退出 | P?真实经授权注资/支付/本息/退出 | M13เงินจริง≠M11认购款；Burn不等于合法清偿 |
| M14 受控转让 | —（现有V1必需禁转/限制由M07覆盖） | —（按现行V2/TBD） | 不将高级二级市场交易纳入V1 |
| M15 高级White-label | —（M01基础Issuer门户可用） | —（按现行V2/TBD） | 不把正式域名/多品牌高级能力提前 |
| M16 对外商业OpenAPI/SDK | —（内部逻辑API可用于Sandbox技术） | —（按现行V3/TBD） | 内部API设计≠V1对外API商业套餐 |
| M17 工作流任务 | S场景模拟任务/补件/审批 | C＋P?真实部门/受权外部事项工作流 | TaskDone≠领域事实完成 |
| M18 通知 | S测试邮件/站内/模板（需限频） | C＋P?真实客户通知及证据 | 收到/已读≠法定送达 |
| M19 规则与权益能力 | Free Sandbox配额与环境规则版本 | Standard商业额度＋真实执行前置规则 | M19执行Guard，不创造M11/M12真钱权利 |
| M20 审计与安全 | S也有最小安全审计/隔离 | 真实金融日志/授权审计增强 | Sandbox审计不得标生产签名 |
| M21 报表与查询 | S模拟数据报表，明确演示 | C＋P?依法授权真实数据报表 | 报表ReadOnly不修改领域真值 |
| M22 外部Provider适配 | 限测试凭证/限额、模拟回执 | P?独立经授权真实连接 | Provider200≠真收/付、链Finality或法定登记 |

**关于P平台**：M03等后台功能**不作为Issuer客户套餐的“解锁权益”交付**，P只依据平台商业、安全和数据职责为Free/Standard Tenant提供差别化运营；不能让I或V获取P运维权限。

## 三、候选资源管理与商业边界（值均TBD，不得擅自定价）

| 资源/配额 | Free | Standard | 守卫 |
|---|---|---|---|
| Tenant数量/受权团队成员数 | 可配置上限TBD | 更高的上限TBD | 反滥用、Tenant隔离 |
| 资产、Project、Offering草稿数量 | 可配置TBD | 更高TBD | 不到期，超额提示/限制新增 |
| 模拟投资者/模拟订单/模拟资金数 | 可配置TBD | 正式业务另按合同与执行Gate | Free绝不能转真实金融事实 |
| 测试Token部署次数/链调用频率 | 可配置TBD，纯模拟和测试网分开 | 主网资源/费用另按合法支付/运营责任 | 不预选测试网或Gas付款方 |
| 存储/文书/模拟报表 | 配额TBD | 配额TBD | 保留、隐私与删除规则另审 |
| 通知与第三方测试服务 | 免费或测试额度TBD | 按合同、实际Provider条款 | 避免不可控成本，不承诺外部免费 |
| 高级White-label/开放商业API | 不包含当前V1 | 也不作为V1 Standard自动承诺 | M15/M16原版本归属不变 |
| 订阅期限 | **永久免费**（安全/额度/合同受控） | 订阅计费周期及续费/宽限TBD | 商业状态≠项目法定资金权限 |

## 四、升级、过期与真实生产矩阵

| 事件 | 可保留资源 | 必须重新检查的内容 | 禁止的错误行为 |
|---|---|---|---|
| Free升级Standard | 原Tenant、账户、受权成员、资产/Instrument/Offering合法草稿及配置 | 商业KYB＋有效合同＋真实SaaS费或合法合同例外；另查每一真Issuer/Offering与P自身RG | Sandbox的模拟支付、钱包、Token、KYC、名册、收益/退出变真钱真权益 |
| Standard订阅续费/计费异常 | 真实既有订单、已持有权益、在途义务和审计历史 | M01原商业付款Intent/权益、合法继续服务范围 | Unknown当成付费、自动二次扣钱 |
| Standard到期/停用 | Free Sandbox及依法所需真实业务查询、履约、退款/收益责任移交 | 合法服务交接、真实X资金/登记/Signer权限与平台RG | 删除/冻结真实投资者持仓或已形成的债权 |
| Free资源超额/滥用 | 当前合法草稿、审计与受限访问 | 使用额度版本、安全与合同条件 | 伪造TrialExpired/清空所有模拟历史 |

## 五、审核与验收状态

本矩阵将用户已批的**方向**映射至22模块，但针对具体Free可以模拟哪些外部Provider、真实主网入口如何关停、配额限制、Standard资源限制与界面提示均**Draft**。下一步按[现行Step05-01 PRD](RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)及[Step06-06字段映射](RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)逐项完善，单独审实质变更。**所有执行测试Not Executed，X-01～13全部Open；V1未Frozen；PR #6 Draft/Open/Unmerged。**
