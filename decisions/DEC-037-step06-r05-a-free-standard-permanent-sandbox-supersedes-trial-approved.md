# DEC-037｜Step06-R05 A：永久Free／Standard双版本与Sandbox/Production能力分离（正式变更决定）

> **2026-10-26｜Approved：仅本DEC中明确列出的商业产品模式及必要产品行为。** 技术字段、具体资源额度、定价/账期、状态enum、测试网选择、支付商/API/合约/部署/风控实现、实际生产合法性、迁移实施与QA均**Draft / Not Executed**。**此决定接续覆盖旧Trial时限，不回写历史DEC/Frozen；不改193项正式版本归属。**

## 一、产品负责人明确批准的决定

> “RWA SaaS Step06-R05：选择A。请按此次明确选择继续产品设计。若批准新商业版本模型，请形成正式变更DEC，调整Step05-01与Step06现行PRD、字段/状态/权限、Free/Standard能力矩阵及GitHub索引；保留历史Frozen/DEC/SCOPE，不改193项版本归属，不关闭X-01～X-13，不冻结V1，PR #6保持Draft/Open/Unmerged。”

本审批对应上一轮**R05-A：永久免费Free + 付费Standard**；Free供客户长期体验/配置绝大部分SaaS与完整模拟发行闭环，只有Standard在完成适用Guard及平台自身生产启用审查后才有资格调用真实链/真实募资与投资者真实购买能力。

## 二、正式产品决定（Approved，仅业务语义）

| 编号 | 已Approved规则 | 明确没有批准 |
|---|---|---|
| **R05-01 产品版本** | V1商业权益仅区分**永久Free**与**付费Standard**；Free不按14天/336小时自然/固定时限失效，不要求“试用到期转只读” | 不批准任何收费价格、周期、免费资源数量、未来高阶商业方案 |
| **R05-02 Free范围** | Free开放**绝大部分Issuer技术功能**，包括组织/资产/Instrument/Project/Offering/文件/Token参数/门户/订单/资金/配售/收益/退出等**Sandbox配置和可追溯模拟**，完整演练原11步；必要的技术资源额度、滥用及安全限制可配置 | 不批准Free上主网真实发行、真实投资者购买/支付/法定登记或资产收益实付；不承诺每项外部有成本的服务免费 |
| **R05-03 测试Token/模拟投资者** | Free可使用**模拟Token或经批准的测试环境/测试网Token**，模拟投资者KYC/认购/付款/交割/收益必须显著标记为测试，**不能产生真实认购、法定权利或真钱** | 不决定具体链/测试网、测试币发放或任何生产Signer安排 |
| **R05-04 Standard商业授权与生产分离** | Standard订阅符合商业KYB、合同与真实商业付款等现行必要条件后，可获得**生产级功能的商业权益**；每个Issuer/Offering的真实发布、主网Token、销售、认购款、法定登记及外部付款/Signer仍须另行满足适用法律、受权执行、平台自身活动审查、安全与业务Guards（PG产品门≠RG真实生产门） | 不允许将“Standard已付费”视为某资产合法发行、平台已获许可或X执行权限已经批准 |
| **R05-05 原Tenant升级与数据隔离** | Free→Standard**沿用原Tenant及组织/账号、允许复用并重审的草稿/配置**；模拟KYC/投资者/订单/收付款/Token/法定名册/收益/退出等**不得通过改Status直接变成正式生产事实**，要以合法真实业务Intent及证据另建/执行 | 不批准复制测试数据库、测试Token变主网Token、将Sandbox模拟订单转换真钱订单 |
| **R05-06 服务到期与义务保护** | Free长期有效（仍受合理安全、资源、滥用及合法合同限制）；Standard欠费/暂停/到期**不得删除或否定既有真实投资者权益、真钱、登记和链事实**。可将**新建及新启动的真实金融动作**限制至Free能力，但在途真实义务必须走必要的查询、对账、受权履约、数据导出与交接流程 | 不批准具体违约宽限天数、自动退款、原已发行产品的非法停服、断开真正必须履约的外部执行渠道、退租技术迁移算法 |
| **R05-07 三权威分离** | M01管理`Plan/Subscription/Entitlement`**商业真实状态**；M19依据有效版本控制Free/Sandbox与Standard/Production能力；M05/M07/M09/M11/M12/M13及X保留**各自独立真实发行/Token/资金/权利状态**；M03/M17/M20负责受权异常/审计而不重写领域真钱真值 | 不批准P平台以套餐订阅状态代Issuer发行批准、收款/Signer/Token操作；不重复构造业务主账 |
| **R05-08 KYB与商业付款异常** | Free开户不强制先做完整商业KYB；Standard正式商业订阅按既有适用KYB→合同→实付/有权合同例外→原Tenant受权开通规则；KYB补件/复核保留原案，Unknown不得冒充Verified；付款VerifiedPaid≠权益Active、原Intent核验幂等恢复、不得重复扣款/建Tenant | 不批准取消必要商业KYB、支付服务商、定价、法域特定签署和拒绝复核政策 |

**语义限制**：本次批准Free功能“绝大部分”与“完整模拟11步”的方向，**没有逐模块承诺所有真实第三方API在Free免费生产可用**。详见[Free/Standard能力矩阵 Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)按模块映射；任何新增例外、数量、合同与升级技术仍另审。

## 三、与原已Approved决定的非破坏性接续/覆盖（精确列示）

| 历史权威（原文不动） | 本次精确覆盖/仍保留 |
|---|---|
| **DEC-019 S04-01-R01**：邮箱核验后生成受限Trial Tenant | 改成邮箱核验后生成**Free Tenant**；最小安全/角色、开户不先KYB及Sandbox隔离原则保留 |
| **DEC-019 S04-01-R02**：14自然日Trial、不预绑付款 | **仅14自然日有效期和Trial命名被Free永久替代**；Free不必预绑付款和不得真钱/主网执行保留 |
| **DEC-019 S04-01-R03**：先Trial后KYB，唯一Standard及付款前KYB | 改成**先Free后按需商业KYB再Standard**；唯一Standard、必要商用KYB/合同/付款前置保留 |
| **DEC-019 S04-01-R04**：Trial期满只读，30天恢复窗口 | **取消Free自身基于336h/720h的到期/只读与自动恢复窗口**；安全封禁、资源限额、Standard欠费时已有真实义务的合法持续处理仍保留 |
| **DEC-019 S04-01-R05**：已发行正式业务的服务/退出保护 | **完全保留并继续适用于Standard→受限Free/退出**，包括不得抹除真钱/登记/收益 |
| **DEC-029 R01**：原Tenant及合法草稿升级、模拟真值不能变生产 | **保留**，只是Trial→Paid更名Free→Standard |
| **DEC-029 R02**：KYB未通过仍受限服务与补件 | 继续保留**Free正常Sandbox使用**（按安全/额度/合同规则），不因“14天Trial过期”失去体验；拒绝/Unknown不能获Standard |
| **DEC-029 R03**：款付但未开通，查原Intent/原Tenant恢复 | **完全保留**，更新状态名Free→Standard |
| **DEC-030 R04**：Trial336h+只读恢复720h | **明确废止旧商业模式下这两项时间触发对Free的适用**；原DEC历史不删；不能继续在现行PRD写“现行Approved336/720h” |
| **DEC-030 R05**：KYB补件、拒绝复核和Unknown | **保留**，与永久Free并行 |
| **DEC-030 R06**：原Trial草稿继承和Paid生产Guard重审 | **保留**，改Free→Standard仍须按实际Issuer/Offering重新核验 |
| **DEC-030 R07**：商业实付与Tenant权益两状态 | **保留**，换成Standard付款确认≠Standard Active，恢复原Tenant并不重复扣费 |

其他Step04 146项功能批准及Step05其余业务规则不改；**Step05 29条历史已批准规则仍可追溯，其中被本DEC明确替代的Trial时限与命名不再是现行可执行规则**，不能把“29 Approved”误读为29条旧表述均完全不变。

## 四、状态与安全硬边界

- **独立状态轴**：`CommercialPlan`（Free / Standard）、`CommercialPayment`（None/Pending/Unknown/VerifiedPaid/Disputed）、`Entitlement`（FreeActive/UpgradePending/StandardActive/StandardRestricted等候选）、`Environment`（Sandbox/Testnet/Production）、`IssuerOfferingProductionGate`（独立、默认无授权时禁止真钱动作）；技术enum均Draft。
- **不为Free建立倒计时**；若历史表已有`trialExpiresAt`和`recoveryWindowEndsAt`，应只保留为历史兼容/来源记录，不再驱动当前Free权限或数据删除。
- **升级不混真值**：原Tenant下可以保留可审查配置草稿；真实投资者/法定持仓/Token/收付款由相应业务权威重新形成受权生产Intent，不允许模拟转正。
- **Standard失效**：默认停止**新增**真实发行、真实认购、新的不可逆金融动作；历史真实义务在有权主体与合同/法域约束下继续合法履约/移交，不能无权停止法定还款/退款或链上历史查询。
- **生产启用**：Standard商业订阅是必要商业条件之一而**非充分条件**，每个真实Issuer/Offering与平台自身运营RG还须满足独立受权/合法主体/业务Guard和工程安全测试。

## 五、现行文件与交付优先级

- [Step05-01 Free/Standard现行产品级PRD v0.4](../docs/03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)——**仅本DEC商业产品规则Approved，字段/接口Draft**。
- [Step05-01 Free/Standard跨端状态与异常规范 v0.3](../docs/03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Cross-Lane-States-Exceptions-Approved-v0.3.md)——**仅产品语义Approved，enum/测试Draft**。
- [Free/Standard全模块能力矩阵 Draft](../docs/03-product-prd/RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)及[Step06 B01字段重映射 Draft](../docs/03-product-prd/RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)。
- [Step06技术SaaS优先执行计划](../docs/00-governance/RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md)接续重排B01优先工作；原[Step06-05 65行审计](../docs/03-product-prd/RWA-SaaS-Step-06-05-B01-65-Field-Line-Crosswalk-Gap-Audit-Draft-v0.1.md)保留历史时点结论，其336/720事项由新DEC替代。

**治理与红线**：历史DEC-019/029/030及其历史Approved PRD均不删、不改原文；四份Frozen、历史SCOPE、DEC-017 193项版号**V1 146 / V2 22 / V3 20 / TBD 5**不改；DEC-028 X-01～13**13/13 Open**；V1.0总体未Frozen；PR #6保持**Draft/Open/Unmerged**；不启动UI、研发、正式收费/募资、Token真实发行或链上生产操作。
