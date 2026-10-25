# RWA SaaS Platform｜产品需求总文档（Master PRD · 开发移交主入口）

> **编号：PRD-MASTER-001｜版本：Draft v0.1｜建立：2026-10-26｜文档负责人：产品负责人｜适用范围：W官网 / I企业SaaS / V机构投资者门户 / P平台运营后台及X外部责任接口**  
> **状态：总文档结构已建立、已确认业务规则已归集；逐页面交互、最终功能规格、UI、技术方案、测试及开发移交包均待完成。不可将本文存在视为“PRD已冻结”或研发可直接开工。**
>
> **本次任务是文档整理与同步（Documentation Only）**：用户明确暂停V/P信息架构审核与B01～B05页面详细设计。本次不新增业务DEC、不修改历史Frozen/DEC/SCOPE、不调整193项功能及版本归属，不关闭X-01～X-13。PR #6保持Draft/Open/Unmerged。
>
> **一条阅读原则**：**本文件是统一PRD交接导航和当前状态汇总，批准效力来自既有明确的DEC/Frozen范围。** 如某段标注“待完成／Draft”，不得由开发或运营据此推定需求通过。旧Trial、旧P0/P1/P2、历史案的旧状态不能取代新DEC。

## 0. 开发移交状态总览

| 内容/交付单元 | 当前可依赖内容与证据 | 产品交付状态 | 后续验收/负责人 |
|---|---|---|---|
| 产品战略、目标客户、产品架构 | 全球可配置ToB多资产技术SaaS；发行机构优先、白标/API按版本拓展；总体PRD与功能树已存在稳定基线 | **原则基线已形成/相关Frozen有效**；产品细项需遵守各DEC | 产品负责人维护变更 |
| 功能范围与版本 | **22模块、193正式唯一ID**；V1=146、V2=22、V3=20、TBD=5 | **DEC-017版号Approved**；不等于V1整体Frozen | 版本变更须新决策 |
| 核心业务流程 | 企业开通至存续退出的**11步主线**及五个Step05场景 | **DEC-014主流程Approved、Step05历史29项规则逐批Approved，旧Trial由DEC-037替代** | 细化页面/状态/异常 |
| 功能级产品规则 | Step04九批**146/146 V1功能级方向Approved**；Step05五场景已完成产品行为基线 | **已完成产品规则阶段**；字段技术和UAT未签收 | 各端页面PRD与跨模块审计 |
| W官网（14个候选组） | W顶部与W-R02～R13局部设计，DEC-038/039 | **局部IA Approved；14组逐页面PRD待完成** | W产品/品牌/法务/研发 |
| I企业SaaS（61个候选组） | **9个一级导航**及I-R01～R19局部规则，DEC-040～043；结构审计61/61条件通过 | **局部IA Approved、Audit Conditional Pass；61组详细PRD待完成** | I产品、业务/法务、研发 |
| V投资者门户（15个候选组） | M08 V1 11项已批业务；候选页面地图 | **功能级Approved；V端完整IA与15组逐页PRD待审核** | V产品、法务、身份/钱包/支付协作 |
| P平台运营（14个候选组） | M03与共享能力功能级规则、候选页面地图 | **功能级Approved；P端完整IA与14组逐页PRD待审核** | P产品、运营、权限/安全 |
| X外部服务/合法责任 | 外部法务、评估、KYC、资金、登记、Signer/链节点接口方向 | **业务责任原则Approved；具体提供方/证据/技术合同待完成** | Issuer/P/服务商/法务 |
| 角色权限、页面字段、操作、状态异常、数据字典、API | 已有Step05产品状态及Step06 B01 65行/B02 33项静态字段草案 | **仅产品原则/候选Draft；未完成可开发的逐页规格** | 产品→设计→工程→QA |
| 非功能、合规、安全、性能、运营、用户协议及真金融生产 | 存在原则和13个未决风险门 | **具体指标/技术证据待完成；X-01～X-13 13/13 Open** | 产品、技术、安全、法律/合规 |
| UI/UX、原型、验收测试、交付冻结/上线 | 页面PRD模板/验收原则已有，**无执行证明** | **待完成 / Not Executed / Not Frozen** | 产品/设计/QA/工程 |

**完成状态规范**：Approved＝用户明确批准的特定决策内容；Frozen＝用户另行正式冻结的特定基线；Draft/待完成＝有候选材料但尚未签收；Not Started＝尚未形成交付物；Not Executed＝用例/流程已拟定但未真正测试；Blocked＝存在必须先决的产品、法务、安全或技术Gate。**总体PRD“可移交开发”仅在指定功能和页面通过独立验收后才能标Ready。**

## 1. 文档目的、读者与交付责任

**目的**：将产品战略、11步旅程、22模块/193项功能、四端导航/页面、业务规则、跨端状态、角色权限、非功能、验收标准和未决门汇总为**一份长期维护的主PRD**，使开发、测试、设计、运营、法务能够识别**现在已定什么、尚缺什么、何时可实施**。附录A/B/C直接列出正式功能与104候选页面组，原则上无须为了“找编号/当前版本”跳很多文件；深入证据仍可通过链接回源。

**适用读者与签收职责**：产品负责人定义需求/页面/交互/验收并最终签收；UI/UX负责人提供设计系统、原型、响应状态和标注；技术负责人确定实现架构、接口、精度、环境与安全；QA负责人编制并执行测试；运营确定业务流程/支持/升级/异常SOP；Issuer及有权法务/X主体对实际发行、名册、资金和Signer各自法律行为负责。**本次仅整理文档，不表示上述角色已经签收。**

**修改纪律**：每项需求记录功能ID、页面ID、版本、责任角色、关联DEC、验收条件及状态；未获得批准的补充只标Draft，明确批准后再更新状态。本文不覆盖历史DEC本体；已有后续DEC与早期方案冲突时按具体后续生效主题执行。范围变更、新增正式ID、跨版本、法律风险变化需单独批准。

**权威来源**：[当前文档权威索引](../00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)；[现有总体PRD冻结基线](RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)；[产品功能树（22模块）](RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md)；[正式193版本主表](RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)；[现行四端页面地图](RWA-SaaS-Step-06-09-Four-Surface-IA-Page-Inventory-Draft-v0.1.md)。

## 2. 产品定义、目标用户与产品边界

### 2.1 定位与目标（已确认原则）

**RWA SaaS Platform是适用多资产发行场景的标准化ToB技术SaaS，优先为有持续发行需求的资产管理机构/发行企业提供发行机构工作台与其独立投资者门户。** 用户购买SaaS并不等于平台向投资者发行自己的资产，也不意味着SaaS平台可代替受监管的发行、投资建议、经纪、持款、法律登记或链上签名业务。机构负责拓展其投资者，Portal按Issuer/Tenant隔离；平台自身实施的任何可能受监管活动须另行审查。

商业目标客户次序：**A有持续发行需求的发行企业和资产管理机构优先；B白标运营商为后续商业产品；C API客户为独立拓展**。全球可配置为产品方向，具体生产法域与合法发行工具尚未确定；不可把可配置产品能力宣传成在所有法域均合法可用。

### 2.2 产品线与非目标

| 产品线 | 商业形态及责任 | 当前版本边界 |
|---|---|---|
| **Issuer SaaS（优先）** | 一个购买SaaS的企业/Tenant，多资产、多个并行Project及Offering，独立V投资者门户，受控全生命周期 | **V1 146项按DEC-017批准首交付归属，产品冻结待完成** |
| **White-label运营** | 后续扩展品牌/多Issuer商业运营/域名与分发，继承Tenant隔离及有权授权 | **M15整体非V1（以逐ID主表为准）**；基本Issuer Logo/标准独立URL **M01-F009 V1已有** |
| **商业OpenAPI/SDK** | 受权技术集成/API客户，仍需与网页同等鉴权/合法Gate | **M16非V1**，不得从内部逻辑API草案误读为V1商业API商品 |
| **平台自营聚合市场、无限制二级撮合/流动性** | 不是本轮Issuer SaaS V1默认交付；如独立推进需单独战略、版本与监管审查 | **未批准为V1** |

**明示非目标**：不能靠“软件服务”消除平台自身法律、安全与数据义务；不能以交易哈希等同合法持有人登记；不能直接让Free资产成为真实可交易Token；不能自动将历史SCOPE里的高优先级视为V1。

### 2.3 用户与组织（已确认概念；角色明细待完成）

- **SaaS购买者/Tenant**：签约、支付SaaS费用、管理订阅；商业客户与某次发行LegalIssuer/SPV、资产所有人可能不同。
- **Issuer/其有权员工**：创建Asset、Instrument、Project、Offering，提交法律材料、设规则、申请发行、管理自身投资者/收益/名册记录及业务审核；不同角色有不同可读写与批准范围。
- **Investor/有权代理人**：在**所属Issuer的V门户**查看允许披露的Offering、完成KYC/资格/签署/认购/支付，查看本人/受权代表的订单、权益、Token与收益。
- **P运营人员**：仅按权限审核SaaS客户商业KYB、Tenant权益、计费/支持/安全、审计与外部服务连接；不自动成为Issuer或资金/Token执行主体。
- **X受权外部主体**：律师、评估机构、KYC/AML服务商、合法持款/支付执行者、法定登记主体、签名/节点等。其权限与责任必须依合同和真实法域明确，不默认新建“X独立产品客户端”。

## 3. 交付范围、版本计划与22模块（DEC-017已批准首次版号）

| 首次版本归属 | 正式唯一功能数 | 业务含义与当前状态 |
|---|---:|---|
| **V1.0** | **146** | 九批Step04逐ID功能设计Approved；**不代表146个页面PRD或整体V1交付Ready** |
| **V2.0** | **22** | 按已批逐ID版本规划，详细PRD/工期/技术及是否启动均待后续决定 |
| **V3.0** | **20** | 同上；不是现行V1页面必须开发范围 |
| **TBD** | **5** | M08-F010、M09-F009、M14-F007、M15-F008、M16-F008；不得推入任何已定版本 |
| **合计** | **193** | 原187＋正式新增6ID（DEC-016），版本归属由DEC-017批准 |

**V1核心交付边界**：持续认购与基础配售按合法适用情形规划；如果具体Instrument/法域强制集中募集，需在V1冻结前另审既有V2的M05-F011、M10-F009、M12-F009、M12-F010等，不得自行移入V1或忽略法定流程。完整逐ID列表及名称/版本见**附录B**。22模块按正式M01～M22排列，按模块核对而不是按左侧导航菜单计算功能数；同一个功能可能对应多个端和页面。

### 3.1 五个详细PRD业务工作包（推进顺序已建立，尚未逐页签收）

| 工作包 | 模块/业务重点 | 应当交付的真实逐页PRD内容 | 当前 |
|---|---|---|---|
| **B01 SaaS商业开通** | W获客/注册登录；I组织/Free/Standard/KYB/商约/付费/门户基础；P商业KYB/Tenant | 注册验证、首进Free、套餐与资源、审核补件、商约付款及异常、原Tenant升级、门户基础配置、个人与安全、商业暂停退出 | **已有业务规则Approved与65行候选字段Draft；逐页面PRD待完成** |
| **B02 资产与发行准备** | Asset、Instrument、Project、Offering、法律证据、Token、V披露 | 资产/工具/项目/发行向导、P01～07检查、发布版本、链与法定登记条件、文件/专业服务、Token申请、可见和可购分离 | **33个正式V1 ID静态字段映射Draft；逐页面PRD待完成** |
| **B03 投资者与认购交付** | V投资者/KYC/钱包/Offering浏览/Quote/签署/订单；I资格、配售登记/Token交付 | 本人/代理权限、当前资格、认购/稳定币付款、到账匹配、登记与Token分开、退款/Unknown/迟到账 | **产品业务规则Approved；逐页面PRD待完成** |
| **B04 资金/收益/退出** | I募资款、退款、合法结算；收益、RecordDate、注资、Push/Claim、到期和退出；V收益 | 受限募集款和合法划拨、RecordDate快照、各Instrument权利、实际注资、应付与实付、退出/名册/Token独立 | **产品业务规则Approved；逐页面PRD待完成** |
| **B05 平台运营与共享** | P客户/KYB/Tenant/安全；I待办、消息、规则、报表、审计、外部服务 | 多租户权限、异常恢复/原Intent、通知送达层级、审计、报表导出、Provider健康/支持、凭证/环境隔离 | **产品业务规则Approved；逐页面PRD待完成** |

**注意**：B01～B05是PRD编写/验收工作包，不是新产品功能分级；正式版号只有上方V1/V2/V3/TBD。

## 4. 四端产品架构、导航及可见边界

| 端 | 核心用户与职责 | 导航/页面组现状 | 状态 |
|---|---|---|---|
| **W官网** | SaaS潜在客户：了解、套餐、注册、登录、联系销售、法律政策；引导进入I | 14组W-01～W-14。官网导航**首页｜产品功能｜解决方案｜价格｜帮助中心**；右侧**登录｜免费开始**。正式商业KYB/订阅付款主要在I | **W-NAV-R01、DEC-038/039局部Approved；完整页PRD待完成** |
| **I企业SaaS** | Issuer团队：多资产、多Project、多Offering、投资者门户管理、认购/资金/Token/发行后 | **9个一级导航**：工作台首页｜资产与发行｜投资者门户｜投资者与认购｜资金与结算｜Token管理｜收益与分配｜数据与报表｜企业设置；61组I候选页面 | **DEC-040～043局部IA Approved；61/61结构审计条件通过，详细PRD待完成** |
| **V机构投资者门户** | 由Issuer拓展及授权的投资者/代理人：浏览被授权产品，KYC/资格/钱包/认购/订单/权益/收益 | 15组V候选页面；**与W SaaS客户登录分离**，每个Issuer独立门户，不是跨Tenant聚合市场 | **M08功能级Approved；完整V导航/页PRD待审核** |
| **P平台运营后台** | SaaS提供方有权限员工：商业KYB、Tenant权益、必要技术支持、审计/外部服务 | 14组P候选页面；仅最小必要查看/操作 | **M03/共享能力功能级Approved；完整P导航/页PRD待审核** |
| **X外部责任方** | 律师评估、资金实际执行、KYC、法定登记与Signer等 | 四泳道协作与授权接口；默认**不建设额外X业务端** | **责任分界原则Approved；具体执行/接口/授权待完成** |

**I端已批二级导航**：资产与发行下设**资产库、金融工具、项目管理、发行管理、文件中心**；投资者与认购下设**投资者管理、资格审核、认购订单、配售管理、持有人登记**；资金与结算下设**收款与对账、退款与异常、募集款结算**；Token管理下设**合约管理、Token操作、链上记录与对账**；收益与分配下设**存续管理、收益分配、到期与退出**。全局消息/待办/审批/异常及受权规则、安全、外部服务跨模块可达。**I-13**是独立「投资者门户」一级下的现有V1基础管理入口；具体首页内容/导航/Banner模板编辑仍Draft，M15-F004高级白标域名V2、M08-F010个性化营销TBD。

**多资产原则**：同Tenant可并行管理多种资产类别、多个Asset、多个Project、多轮Offering；Asset、Instrument、Project、Offering概念分别管理，Project为工作中心，Offering必须归属明确Project。按资产、项目、发行轮次受权筛选，**不按类别拆一级导航**。**一个Project是否同时关联多个底层Asset仍待完成、不得擅自批准组合资产发行。**

**尚存两条I端文档勘误**：I-12个人登录安全应按DEC-040从顶部个人账户进入，而现候选页面分组暂归企业设置；I-13已独立但旧旅程表尚未串接门户配置路径。详见[61页面结构审计](RWA-SaaS-Step-06-09B-Issuer-IA-61-Page-Consistency-Audit-Draft-v0.1.md)，**本总文档明确指出正确已批方向，但不回写历史DEC/IA本体**。

## 5. 已批准的11步端到端业务旅程（主流程Approved，逐步骤页面和UAT待完成）

| 步骤 | 客户/用户任务 | 端侧交接与当前业务要求 | 页面/验收待完成 |
|---:|---|---|---|
| **01** | 企业找到产品、注册、购买SaaS | W注册验证开通**永久免费Free Sandbox**；I后续商业KYB、SaaS合同与Standard商业付款，P有权商业审核；保留原Tenant | W-08～12、I-02～09、P相关；跳转/校验/失败逐页待完成 |
| **02** | 配置团队权限及独立投资者门户 | I成员/角色/项目授权，I-13配置标准Issuer独立V入口与必要Logo/法务链接；P负责实例技术服务，V受权访问。门户Published≠Offering可买 | I-10～13→V-01；权限/预览/发布细节待完成 |
| **03** | 准备底层资产及法律权益工具 | Asset、Instrument、LegalIssuer/SPV、权属/法律/评估证据分开；Issuer选择合法有权专业方 | I-20～27；项目-多Asset基数/文件精确字段待完成 |
| **04** | 建项目/发行轮次并准备Token及披露 | Project/Offering参数及经济权利，合法发布P-01～P-07缺项清单，明确有权发布；Token链部署真实执行另授权 | I-28～40；完整发布规则/合约/Signer技术待完成 |
| **05** | 投资者访问Issuer门户，核资格/钱包 | V登录/身份KYC/KYB、AML与Offering-specific Eligible分别判断；钱包控制/付款与接收地址区分 | V-01～05/V-12，I-41～43；可用性及供应商待完成 |
| **06** | 报价、必要签署、认购和支付 | Quote/条款版本/订单与预留独立，真实稳定币付款经M11最终到账匹配，不以截图或广播代替到账 | V-06～09、I-44～45/I-49～51；币种链、异常与技术待完成 |
| **07** | 合法配售、登记及Token交付 | M12配售/法定名册与M07 Mint/链最终性独立，投资者权益只有满足适用所有交割条件才完整确认 | I-46～48/I-39～40、V-10～13；权威登记/执行待完成 |
| **08** | Issuer合法管理已募资金 | 已收、受限、可申请结算、审批和外部X实际划拨/到账分开；P技术支持不可自行提取 | I-50～53；X持款资格、流程/付款证据待完成 |
| **09** | 存续事件与收益计算/注资 | 法定名册RecordDate快照；A债权与B SPV经济权利条件不同；核应付、审批、真实注资 | I-54～56；精度/税费/法律决议/状态待完成 |
| **10** | 投资者领取或收到收益 | 对合法适用Push/Claim模式展示应付、可领、处理中、未领、实际支付与失败，Claim提交≠清偿 | V-14～15、I-57；实付及合约技术/合法性待完成 |
| **11** | 发行后维护/到期退出 | 逾期/部分偿还/法定注销或回购、名册变更与Token Burn各有独立证据；SaaS客户停服仍保留合法义务 | I-54～58、V订单/资产/收益；移交/法定效力待完成 |

**当前权威**：[DEC-014 11步Approved](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)＋[四端11步流程草案](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)，后者历史Trial条件由[DEC-037](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)替代；具体泳道细节不是新的执行批准。

## 6. 五大业务场景：已批准产品行为与仍缺的页面交付

### 6.1 S05-01：永久免费Free → Standard订阅（现行商业规则Approved）

**现行明确规则**：邮箱验证后可开通Free，**没有14天Trial或336小时倒计时/720小时恢复窗口**；Free可在严格标记的Sandbox中模拟11步，实际模拟钱包/资金/Token/合同/名册不能直接切换为生产真值。Standard需要有效商业KYB、签约与SaaS付款/批准例外、订阅权益生效；**付款成功≠订阅开通≠金融生产准入**。升级复用同Tenant有用的草稿，不把测试成交迁入正式业务；欠费/退出不能删除已成立的合法投资者义务。

**产品交接与未决**：B01须详细定义W注册/邮箱确认/错误重发、I-03/04～09商业向导与退款/Unknown、P KYB/权益状态、Free额度达上限/升级提示、Standard计费与对账、合同/开票、权限与受控历史查询。**Standard售价/账期/Free资源额度、支付供应商、税票规则、准确字段/状态/UI/测试＝待完成。**
来源：[现行Step05-01产品PRD](RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)。

### 6.2 S05-02：Asset/Instrument/Offering/Token与投资者披露（4项产品规则Approved）

**已批准业务要求**：①Offering**可见≠适格≠可认购**；②Issuer在有权人员明确发布前查看P-01～P-07必要缺项/修复入口；③V详情**先法定权益/主体/风险/有效文书后Token技术信息**，A债权和B SPV不得混为同一种保证收益；④披露和Offer条款发生变更时保留旧文书、Quote、签署及订单的版本证据，不覆盖历史。单独公布门户不等于Offering可买。

**待完成**：P-01～P-07适用法域逐项Guard和不同角色的按钮、合同变更对在途订单操作、页面中真实版次对比和法定披露文案、Token/Signer协议、UI/UAT。来源：[Step05-02现行产品规则](RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)。

### 6.3 S05-03：投资者资格/认购/付款/配售/登记/Token（6项产品规则Approved）

**已批准业务要求**：①Investor真实身份、KYC/AML、当前Offering Eligibility、代理授权、钱包控制权分开；②Quote、必要签署、唯一订单及受控预留不得重复；③付款页面仅在M11取得**FinalMatched**等权威证据时确认实收；④最后配售仍需重核资格、文件版本与可用额度；⑤法定名册与Token Mint分阶段、按Instrument适用先后；⑥迟到账、取消后到账、错误链、Unknown、退款均可追原Intent及有权外部执行证据。

**待完成**：V页面逐字段/按钮/报价有效期、KYC与钱包提供方/恢复、Stablecoin网络/精度、钱与登记分权、安全/技术/真实测试。来源：[Step05-03现行产品规则](RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)。

### 6.4 S05-04：发行后存续/收益/到期/退出（6项产品规则Approved）

**已批准业务要求**：①存续义务在停售、商业欠费/退出后继续；②RecordDate基于合法名册/持有人及有效历史证据，不把钱包余额当法律权益；③A债务本金/利息与B SPV合法分红/回购要求分别表达；④应付审批→真实注资→可Claim/Push的条件独立；⑤V收益展示预计/应付/注资/可领/处理中/实付/未领/失败/Unknown；⑥法定清偿、名册修改、Token Burn/锁定三事实分离。

**待完成**：金额精度、税费、时间/记录日时区、实际付款主体、Pay/Claim模式适法性、外部履约证据、详情与异常/可观察UAT。来源：[Step05-04现行产品规则](RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)。

### 6.5 S05-05：平台运营/任务/消息/审计/外部服务（6项产品规则Approved）

**已批准业务要求**：①P只处理SaaS商业Tenant/服务与安全，不成为Issuer高危资金/名册/Signer主体；②Tenant/Issuer/投资者本人或代表、角色和合法目的统一权限守卫；③M17任务与Unknown重试均回溯原业务Intent，Task Done≠业务最终成功；④M18消息发送/送达/阅读/法定有效送达分开；⑤M19版本规则/M20最小审计/M21只读报表不创第二本金融账；⑥M22外部服务凭证Sandbox/生产隔离、服务健康和退租合法交接。

**待完成**：P/I/V权限矩阵、敏感信息访问审批与有效期限、报表口径/下载/脱敏、通知模板及合法发送渠道、Provider接口/幂等/核验/故障SOP、真实安全/性能测试。来源：[Step05-05现行产品规则](RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md)。

## 7. 核心业务对象与唯一真值（已确认原则）

| 概念/事实 | 权威与产品职责 | 与其他领域不可混淆 |
|---|---|---|
| **Account / Tenant / 商业订阅** | M01/M02，商业KYB在P的M03，I提交/查看 | 购买SaaS不等于LegalIssuer获准发行 |
| **LegalIssuer/SPV、Asset、InstrumentVersion** | M04＋M06法律权利/文件；具体合法事实由Issuer/有权方 | 资产所有权不因Token发行直接转移；债权A/权益B条件不同 |
| **Project、Offering、发布/披露快照** | M05；Project可有多个Offering，合法发布须显式Gate | Project≠Offering；门户Published≠Offering Purchasable |
| **Investor/KYC/AML/Eligibility** | M09/依法有权X核验，V仅本人或授权代理 | KYC通过≠每次Offering Eligible；钱包≠法定身份 |
| **Quote/签署/Subscription/Reservation** | M10唯一订单，M06法律签署，M12合法容量/配售规则 | 订单提交≠实收≠配售成功 |
| **投资者付款/Refund/募集款结算** | M11记录外部X/链的真实到账/退款和合规释放证据 | 付款截图/txHash≠最终到账；SaaS订阅费独立 |
| **Allocation/Legal Holder Register** | M12及依法有权登记主体 | Mint/Token地址≠默认法定持有人登记 |
| **合约/Token Mint/Burn/链最终性** | M07与真实合法Signer/节点 | Chain Finality≠权利清偿或依法登记 |
| **RecordDate/收益应付/注资/实付/退出** | M13、M12权益快照及合法付款X | ClaimSubmitted≠Paid，Unclaimed≠已付，Burn≠合法清偿 |
| **任务/消息/规则/审计/报表** | M17/M18/M19/M20/M21负责呈现/证据/协作 | 不修改上述领域权威主账 |

**单一数据真值原则**：I/V/P/W可以重复“展示”同一事实（例如订单状态、Token状态、资金概况），却不得在多个模块建立可编辑的第二本订单/资金/法定名册。异常恢复以原Intent及外部权威证据重查，禁止在Unknown时盲重扣、重复Mint/登记/退款。具体字段、关系、并发与幂等规则全部待专业技术PRD/接口签收。

## 8. 全局产品交互与页面级PRD交付标准（待逐页填写）

**附录A列出全部104个逻辑页面/页面组；每个必须填完以下模板才能从Draft进入页面级Approved提案。** 列表候选“一个页面组”可能是列表＋详情＋向导/弹窗组合，最终物理URL/界面数尚未批准。

| 页面PRD必填项 | 开发、设计、QA真正需要的内容 | 当前完成情况 |
|---|---|---|
| **P-01 页面身份** | 页面ID、中文名称、端、一级/二级导航、流程步骤、模块/正式功能ID、版本、页面目标 | **104组现有候选目录/部分I/W已批方向；各页完整规格待完成** |
| **P-02 页面信息结构** | 页面区块、展示层级、列表/详情/摘要/页签、默认排序、筛选、空状态、复制/导出 | 待完成 |
| **P-03 用户可见字段** | 中文字段名与说明、输入控件、默认值、必填条件、枚举、单位/精度、校验、提示、脱敏/只读 | 待完成；领域Ref/字段字典草案仅参考 |
| **P-04 按钮与操作** | 可见/可点击/禁用条件；点击事件、确认弹窗、返回/取消、成功反馈、重复提交、回退策略 | 待完成 |
| **P-05 导航与跨端** | 入口/回链/深链、扫码/邮件跳转、跨Tenant无权访问、跨端状态回显、失效链接 | 待完成 |
| **P-06 用户与权限** | 发起人、查看/编辑/审批/执行/导出角色，Tenant/Project/Offering/本人与合法代理作用域 | 概念原则已批准；页面级矩阵待完成 |
| **P-07 商业/法律Guard** | Free/Standard与Sandbox/Production；当前Issuer/Offering合法准入、证据、外部Signer/持款条件 | 概念原则已批准；逐按钮/状态待完成 |
| **P-08 状态与异常** | Draft/Review/Approved/Rejected/Pending/Unknown/Failed/Partial等含义，显示、可继续/重试、处理中、无权、超时 | 五场景产品原则已批准；逐页表待完成 |
| **P-09 测试与验收** | Given/When/Then正/反向用例、边界与非法角色、重复/迟到回调、测试环境、证据链接、签收人 | 用例原则已存在；**真实UAT Not Executed** |
| **P-10 UI/工程交接** | Figma/原型/桌面端断点、组件/文案、接口契约引用、依赖及版本、缺口与开发阻断项 | 待完成 |

**每组PRD提交时的推荐记录格式（尚未签收）**：页面ID / 生效版本 / 上游DEC / 页面目标 / 入口 / 用户角色 / 信息分区及字段 / 交互按钮规则 / 状态与异常 / Free-Standard差异 / 关联页面/对外接口 / 数据与审计 / 验收用例 / 非范围 / 决策门 / 产品/设计/技术/QA签收。**禁止只贴系统字段表就将一组页面置为“完成”。**

### 8.1 统一页面体验原则（主要仍待细化）

- 列表：可按当前用户有权项目/Offering筛选，状态显示来源和更新时点；跨Tenant与无权深链服务端拒绝。
- 详情/向导：合法字段与版本可溯源；确认高危动作之前显示对象、权限、有效审批及不可逆影响。
- 空/错/无权/处理中：分别可观察，Unknown不得与成功/失败混写；允许有权人员查看原Intent和恢复入口。
- 全局通知/待办：同一来源消息/审批从首页、顶部或所属业务页进入，任务完成不代表业务事实完成。
- Free Sandbox：醒目模式及模拟标识贯穿I与V，导出、回执不能被误解成真实资产/实际付款。
- 文案规范：使用法律权利/实际付款/链状态的准确语言；不得笼统写“到账即拥有资产”。

## 9. 页面导航与工作区规范（部分IA Approved）

**W导航**：首页｜产品功能｜解决方案｜价格｜帮助中心；登录与免费开始；简单咨询表单人工跟进，不自动建CRM；页脚服务条款/隐私/Cookie政策/免责声明入口，正文及Cookie同意逻辑待法务与逐页审核。单一受权企业登录直达I，多企业选择受权Tenant，投资者不复用W企业登录。

**I导航**：见第4章九一级；**Asset、Instrument分别有列表/创建/详情**，统一Project列表/新建引导，Project详情概览/资产与工具/发行轮次/文件审批/进度，Offering可从Project内创建或在全企业发行列表查看，**每个Offering归属明确Project**；Offering详情按发行参数/投资者规则/收款Token配置/前检查/发布与状态管理分区。个人安全I-12以右上个人账户为主入口规则，旧页面归类勘误尚Open；门户I-13必须在旅程中承接到V真实/模拟入口。

**V/P导航与页面分组**：第4章仅给出候选一级，**尚未进行针对V/P的正式逐批页面架构审核**，不得标为最终冻结。投资者仅看本人/合法代理与Issuer授权公开Offering，P仅看技术商业管理所需最小字段。

## 10. 状态机、异常与恢复（业务规则部分Approved，工程实现待完成）

| 需要独立维护的状态轴 | 可观察产品含义 | 不得错误合并 |
|---|---|---|
| **商业套餐与Tenant** | Free永久、Standard商业有效、支付Pending/Unknown、暂停/退出及依法所需残余义务 | 商业有效≠Issuer合法发行 |
| **Sandbox/Production业务环境** | 模拟订单/Token/款项/钱包/名册 vs 真实合法事实，清楚标记 | 模拟成功≠真实成功；复制草稿≠转换模拟账 |
| **Asset/Instrument/Legal Documents** | 草稿、补件、审查、有效版本/更新/失效及引用 | 文件Uploaded≠依法生效 |
| **Offering访问与销售** | 内容是否披露、当前受众是否合法可见、资格、开售/关闭与可认购相互独立 | Published≠Visible to all≠Eligible≠Purchasable |
| **投资者KYC/代理与Offering资格** | 身份核验/AML/过期、当次资格、受权代理及钱包证据 | KYC Pass≠Eligible；Wallet Connected≠身份有效 |
| **认购订单与法律签署** | Quote、签署、订单/预留、批准/拒绝、撤回/过期 | Signed≠Paid≠Allocated |
| **资金、登记与Token** | 付款观察/确认/匹配/退款，法定Allocation/Register，链Broadcast/Finality/Mint/Burn | txHash≠实收；Token Mint≠名册更新 |
| **收益/清偿** | 应计/应付/批准/注资/可领/Claim/Push/真实实付/未领取/逾期/法定清偿 | ClaimSubmitted≠Paid；Burn≠债务结清 |
| **消息/异步外部服务** | 发送、服务商回执、已读、合法送达、Unknown/重试/证据更新 | Sent≠Read≠法律送达，Task Done≠实际支付 |

**最小异常目录（需落入各页UAT，现Not Executed）**：邮箱重复/失效、Tenant无权、套餐额度耗尽、商业支付Unknown、Issuer KYB拒绝、Offering法务缺证据/被暂停、订单重复提交、资格过期、Quote失效、签署版本变更、钱包控制权不足、Wrong Chain/假Token、少付/多付、迟到账、部分付款、预留超时、登记失败、Mint Unknown、外部服务Webhook重复/迟到、退款与收益付款Unknown、RecordDate争议、Token/名册差异、欠费时已形成真实义务、异常导出/越权访问。每项需定义**状态守卫+用户提示+原Intent+受权修复人+验收断言**。

## 11. 权限与多租户安全（原则Approved；角色×操作矩阵待完成）

| 权限层次 | 已确认原则 | 待实现的产品/技术检查 |
|---|---|---|
| SaaS商业Tenant | W/I/P登录与商业订阅、Tenant隔离、原Tenant Free→Standard | 企业切换授权、组织停用、角色失效、历史查询、安全日志 |
| Issuer组织与Project/Offering | 管理员分权，发起与批准高危业务按规则隔离 | **角色×I页×按钮×对象作用域**全部待完成 |
| Investor本人/合法代理 | 所属Issuer门户、资格和法定本人数据 | 本人/代表委托、KYC可视和跨Issuer复用合法证据待完成 |
| P后台受权支持 | 最小必要、敏感高权访问申请→批准→限时→撤权→审计 | 逐字段和导出脱敏、实际权限复核待完成 |
| X资金/登记/Token执行者 | 有权法律/业务执行与独立密钥/签名 | Provider身份、签名/授权、回调与证据审查待完成 |

**禁止**：前端仅隐藏按钮充当权限控制；任何角色跨Tenant拿KYC原件/他人持仓；P管理员未经合法授权用平台权限代客户真实划拨/Signer；合同或Quota变更擦除既有投资者法律权利。

## 12. 领域数据字典、API/外部服务与技术方案（待完成）

**产品要提供给开发的信息**：每个用户可见字段的含义、来源、输入校验、只读/编辑时机、重要枚举与状态、金额/时间精度、法定版本、隐私/保留等级、错误码类别、外部证据引用与回调相关性。**数据库字段、真实Schema、API路径、链实现和SDK版本由技术方案阶段定义，本轮未获批准。**

| 对象/依赖工作组 | 有哪些草案 | 还必须完成 |
|---|---|---|
| B01 Tenant、商业KYB、Free/Standard权益/Quota | 原65行候选字段、Free/Standard新版映射、8类领域对象Draft | 产品字段字典及页面校验；商业支付/账期/税票/Quota数值；Provider契约/幂等 |
| B02 Issuer/Asset/Instrument/Project/Offering/Token | 33项M04/05/06/07候选字段状态/权限/API草案 | Project多Asset决策；法律/合约/展示版本；逐页表单/证据/操作 |
| B03 投资者/KYC/钱包/Quote/Order/Allocation | Step05产品规则和候选领域状态 | KYC/代理/服务商、钱包控制/恢复、报价版本/容量、可观察订单和支付回调 |
| B04 实际资金/释放/收益/Claim/Exit | M11募集款专项、Step05业务规则 | 合法真实持款人/Signer/税费/精度、支付对账/退款/收益真实付款与时点 |
| B05 任务/通知/审计/规则/报表/外部连接 | Step05-05产品规则和Step06矩阵 | RBAC、证据保留、日志/导出、通知合法送达、Provider恢复与SLA |
| 实际生产RG（跨B01～05） | 原13项X风险与专业核验模板Draft | 每实际Issuer/Offering/法域、平台自身活动、资金和签名控制的法律/安全证据与审批 |

**已有参考但不得冒充Approved的字段文件**：[B01字段PRD Draft](RWA-SaaS-Step-06-07-B01-Free-Standard-Domain-Field-State-Permission-API-PRD-Draft-v0.1.md)、[B02 33ID字段对照Draft](RWA-SaaS-Step-06-08-B02-33-V1-Functions-Field-State-Permission-API-Crosswalk-Draft-v0.1.md)、[跨端统一字段/状态矩阵Draft](RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md)。

## 13. 非功能需求（NFR）与可交付技术验收指标（原则已有，指标待完成）

| NFR领域 | 必须提交/验证的产品要求 | 当前 |
|---|---|---|
| 账号安全与权限 | 登录恢复、MFA/会话风险、Tenant/Issuer隔离、最小权限与敏感导出控制、审计可追踪 | **原则已有；目标和技术实现待完成** |
| 隐私/KYC与数据保留 | 个人/机构敏感证据的收集最小化、受权用途、加密/脱敏/跨境、保留与法定删除限制 | 待法律/安全/页面PRD |
| 性能与容量 | 页面响应、列表分页、大量项目/Offering/投资者、报表导出、异步处理目标、资源额度 | **数值指标待完成，不编造QPS/SLA** |
| 稳定性与灾备 | 请求幂等、外部超时/Unknown/重复回调、补偿重放、事件终局状态、恢复/备份目标 | 业务原则已有；指标/方案/演练待完成 |
| 可访问性与国际化 | 中文网页首版文本可理解性、键盘导航/可读性、时区/金额精度；全球适用需法域内容配置 | **精确WCAG等级/语言/浏览器矩阵待完成** |
| 可观测与运营 | 业务/安全日志、异常预警、审计版本、SaaS计费/真实投资资金分离、事故处理 | 待完成 |
| 环境与密钥 | Sandbox与Production数据、模拟/真实钱包Token与Provider凭证分离；真实Signer授权和密钥持有责任 | 产品禁止混淆原则已有；安全设计和真实验证待完成 |
| UI/UX交付物 | 设计规范、颜色字体/栅格、交互原型、组件状态、表单和错误文案、响应式断点/浏览器支持 | **待完成；本轮未开始UI设计** |

## 14. UI/UX、内容、法务与运营文件（待完成）

**设计团队交付清单**：四端信息架构确认表；逐页低保真/高保真；桌面端栅格及响应策略；导航/列表/详情/表单/审批/文件上传/提示/确认/错误/空状态规范；Free Sandbox强标识；跨项目视图及统一角色权限；视觉组件/变量/设计标注；可用性核验记录。**所有这些项目目前为待完成**，不能引用逻辑页面组数量替代设计画板数量。

**文案与法律交付**：W首页产品价值与功能说明、价格套餐准确额度和告知、帮助/联系销售表单、SaaS服务条款、隐私/Cookie/免责声明、投资者法定风险/条款/份额权利披露、KYC告知/资金付款授权、拒绝与退款提示、服务中断/数据交接告知。**已批准仅页面入口和产品业务表达方向，正式法律正文、运营SOP、所有文案及司法适用仍待完成/专业审核。**

**运营移交**：Tenant审核与开通SOP、KYB补件、套餐账单/商业退款异常、客户支持升级、Issuer发行合法证明审查的责任转交、外部服务故障、敏感访问申请、生产禁用/退出及既有法定义务持续处理。**详细岗位SOP/值班SLA/证据清单均待完成**。

## 15. QA验收、产品冻结与研发移交

### 15.1 页面级完成定义（每页必须逐项满足）

- [ ] 页面ID与正式功能ID、目标版本和上游DEC准确一致；用户明确批准页面PRD。
- [ ] 页面分区、可读中文字段/表单校验、按钮/跳转/权限、Free/Standard/环境差异全部写清楚。
- [ ] Draft/Pending/Unknown/Partial/Failed、无数据/越权/超额及合法证据不足可展示并可按权限处理。
- [ ] 给出正向与边界Given/When/Then、可重复测试的测试数据、独立预期结果及归属测试环境。
- [ ] 设计原型和中文UI文案与PRD一致；技术接口/精度/供应商与法律责任冲突已记录并解决或作为明确Blocker。
- [ ] QA实际执行并记录通过/失败和证据，产品确认无影响主链的阻断缺陷。
- [ ] 本页状态方可从Draft转“产品PRD已批准”，**不能因一次静态对照PASS自动标实现/QA已通过**。

### 15.2 五个阶段验收门（尚未执行）

| Gate | 交付物与通过条件 | 当前 |
|---|---|---|
| **G1 四端IA/页面范围审定** | W/I/V/P一级二级导航、候选104页组增删/合并、门户配置归属及页面路径一致性 | **W/I局部Approved；I结构Conditional Pass；V/P待审核，不得写已全通过** |
| **G2 B01→B02逐页PRD** | W/I/P商业与Issuer资产发行、法律/Token相关页面完成且逐批获得用户明确批准 | 待完成 |
| **G3 B03→B05逐页PRD** | V/I投资者、资金/收益、P平台/共享页面与状态异常、权限/验收全部完成 | 待完成 |
| **G4 146×11步×四端全量双向审计** | 146个正式V1 ID无遗漏/错误归属；11步全任务路径、Free/Standard/异常/权限/UAT证据齐全 | 静态引用146/146已核；**完整UAT未执行** |
| **G5 产品冻结/正式开发移交与RG** | 明确范围差异、剩余Blocking门、设计/开发/测试签收、用户**单独批准V1产品Frozen**；真实金融/链上生产还需另行RG | **未获批准；Not Ready** |

**验收场景框架（样例，仍Not Executed）**：
- T01 企业邮箱验证→Free激活→同Tenant多Project建草稿→Sandbox全程没有真款/真实投资权益；
- T02 Free→Standard经KYB/合同/SaaS付款与有效权益生效，商业Unknown不会造成双扣或“有钱即生产”；
- T03 Issuer门户I-13名称Logo/法律链接/预览/模拟发布，在V端只显示已合法授权内容，不跨Tenant；
- T04 Asset/Instrument→Project→Offering完整流程，P-01～P-07缺项有阻断及责任人；
- T05 V投资者本人/代理身份、KYC/AML与Offering Eligible、钱包控制分别判定；
- T06 Quote/签署/订单/容量预留→稳定币真实付款FinalMatched→合法配售/登记→Token Mint分别确认；
- T07 WrongChain/少付/重复Callback/过期Quote/取消后迟到账按原Intent受权恢复，不复制金融事实；
- T08 募集款受限→有权申请→Issuer批准→X合法出款→真实到账回执与审计一致；
- T09 RecordDate、收益应付→合法注资→Claim/Push真实实付与未领/失败分别回显；
- T10 到期或逾期，实际清偿/名册更新/Token销毁不允许相互替代；
- T11 标准SaaS欠费/退出后旧投资者合法权利和支付义务仍能查询/履约/交接；
- T12 P越权跨Tenant敏感数据、错误Signer、错误发布受众、伪成功消息均遭到有效阻断。

## 16. 未完成事项、风险与产品决策门

### 16.1 决策门与缺口（需持续跟踪）

| 任务ID | 未完成事项 | 状态/责任交接 |
|---|---|---|
| **GAP-01** | V投资者端15页面组、P平台后台14页面组完整导航/信息架构审核 | **待完成**；产品负责人后续单独审 |
| **GAP-02** | W官网14页面逐页PRD；营销/帮助/联系销售/政策7页无既有正式V1功能ID的范围决策 | **待完成**；新CMS/CRM必须另审 |
| **GAP-03** | I端结构审计F01～F07：I-12顶栏个人入口、I-13旅程、横向入口、门户编辑深度、Project多Asset、双真值、UAT | **7/7 Open/Draft**；详见审计 |
| **GAP-04** | Project与多底层Asset关联基数/打包发行法律及页面行为 | **待完成**；不得解释为多Asset组合Offering Approved |
| **GAP-05** | I-13投资者门户页面模板可配置深度与正式功能归属；M15-F004/M08-F010守边界 | **待完成**；现已批只是独立导航与基本门户 |
| **GAP-06** | B01～B05全部104候选页组中需成为正式交付的逐页面PRD、原型、数据字典、权限及错误 | **待完成**，从未声称完整页面PRD已批准 |
| **GAP-07** | Free/Standard具体套餐价格、账期、配额、测试网/第三方耗用与续费规则 | **待完成**；不得虚构价格 |
| **GAP-08** | 法域×Instrument实际适用条件、Issuer/X合法主体、平台自身受监管活动、投资者身份和法定登记 | **RG/法务/专业证据待完成**；通用SaaS规格可先做，生产不得先开 |
| **GAP-09** | 真实资金收退款/募集款释放、Signer/合约、收益支付的技术及安全架构与外部服务商 | **待完成**；独立真实生产许可 |
| **GAP-10** | NFR定量指标、隐私/安全/灾备、真实API/Schema、钱包恢复、合约协议、生产配置 | **待完成**；工程审 |
| **GAP-11** | 全量146 ID×11步×W/I/V/P/X验收，实际QA运行证据、设计一致性与正式Frozen批准 | **Not Executed / Not Frozen** |
| **GAP-12** | 版本后续22＋20＋5项启动与具体页面PRD/开发里程碑 | **规划保留，未展开实施** |

### 16.2 13个冻结/生产审查风险X-01～X-13（均保持Open）

**截至本次同步：13/13 Open，其中9 High／3 Medium／1 Low**（来自现行Step06跨场景审计）；涉及首发法域与权利、发行募集机制是否强制集中募集、资金/托管、法定登记有效性、Token合约地址绑定、Signer、钱包/KYC跨租户、收益税费/Claim真实法律清偿、Tenant退出及权限安全、消息/证据、精度/接口等。**不凭此描述推定每个X的风险标题或分级，逐项原始证据仍以[Step05五场景/Step06冻结前审计](RWA-SaaS-Step-05-Five-Scenarios-Consistency-and-Step-06-Pre-Freeze-Audit-Draft-v0.1.md)和[DEC-028](../../decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)为准；X-01～X-13均不得关闭/降级。**

### 16.3 历史工作成果按“批准范围”读取

**Step01/02/03完成**：产品战略原则与总体功能框架；22模块功能树（Frozen范围遵守旧文件）；DEC-014核准11步；DEC-017批准193项版号。**Step04完成**：DEC-018～027分九批146项功能设计Approved；Step04最终跨端静态审计Conditional/Draft。**Step05完成**：五场景历史29条产品行为Approved；其商业Trial旧限被DEC-037覆盖；五场景一致性审计与技术字段仍Draft。**Step06进度**：DEC-036技术SaaS优先、DEC-037永久Free、DEC-038/039官网局部IA、DEC-040～043 I端局部IA，I端61组审计Conditional Pass；V/P端IA尚未逐批审核，B01～B05逐页PRD未完成。**不能因已有某份文件标题写“Approved”就推定其所有字段/按钮/API或真实法域已通过。**

## 17. 后续文档与开发交接的签收清单（全部待完成，附状态）

| 序号 | 开发团队需要的最终交付物 | 当前同步内容 | 状态 |
|---:|---|---|---|
| 01 | 正式总体PRD（本文件）及权威DEC/文档版本控制 | **已有框架和现行批准摘要；待持续整合** | **Draft，不是Frozen** |
| 02 | 产品分期范围/193项追踪及跨版本变化记录 | DEC-017版号已批准，附录B列193 | **版号Approved；交付清单审核待完成** |
| 03 | W/I/V/P正式导航、页面清单及逐页路由 | 附录A列104逻辑页面组；W/I局部IA批件 | **完整四端审核待完成** |
| 04 | B01～B05每个正式页面PRD与各角色交互/文案 | Step04/05业务规则本正文归集 | **待完成** |
| 05 | 角色×按钮×状态权限矩阵、个人/企业/跨Issuer访问 | 已归纳原则 | **待完成** |
| 06 | 流程/状态机/异常/跨端消息/外部回执 | 11步＋五场景业务行为已归纳 | **技术与逐页面状态待完成** |
| 07 | 字段与计算字典、隐私保留、法定版本与审计 | 原B01 65行、B02 33ID候选材料 | **待完成** |
| 08 | 第三方/链上/资金/Signer/登记实际接口契约及生产Gate | 原则与业务风险已归纳 | **待完成/须法务安全准入** |
| 09 | UI低高保真、设计系统、错误/空状态、内容与法律文案 | 导航和页面类型已归纳 | **待完成** |
| 10 | NFR/SLA/监控/备份/隐私安全/性能指标与运维SOP | 原则性要求已列 | **待完成** |
| 11 | 测试计划、测试数据、UAT用例、通过记录和回归证据 | 样例目录已列，未执行 | **Not Executed** |
| 12 | 最终范围冻结/技术签收/开发计划与版本上线审批 | 前置门已列；PR仍Draft | **Not Ready / 不得据此生产部署** |

## 18. 来源与变更记录（保留原文，不制造新DEC）

| 来源 | 此总文档引用的主要内容 |
|---|---|
| [产品战略与商业模式](../02-product-strategy/RWA-SaaS-Product-Strategy-Business-Model-v01.md) | 全球标准化技术SaaS、目标客户、商业方向与保留门 |
| [总体PRD基线](RWA-SaaS-Overall-Product-Requirements-PRD-v0.1.md)、[22模块功能树](RWA-SaaS-Product-Function-Tree-and-Module-Responsibility-Matrix-v0.1.md) | 组织主体、核心对象、模块/责任与NFR原则 |
| [DEC-014 11步主流程](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)、[Step02四泳道](../04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md) | 主业务旅程与责任，不继承失效Trial时限 |
| [DEC-017 正式版本](../../decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md)、[193 ID主表](RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md) | 193唯一ID首版号、V1 146 |
| [Step04 V1 146追踪台账](RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)、[DEC-018～027索引](../Document-Status-Index.md) | 146功能级Approved，仍须逐页PRD |
| [Step05-01现行商业PRD](RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)及[DEC-037](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md) | Free永久Sandbox、Standard付费及真实生产分离 |
| [Step05-02](RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)、[Step05-03](RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)、[Step05-04](RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)、[Step05-05](RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md) | 五场景当下可追溯的业务守卫、状态及交互原则 |
| [DEC-038官网](../../decisions/DEC-038-step06-website-w-r02-r07-navigation-content-entry-approved.md)、[DEC-039官网](../../decisions/DEC-039-step06-website-w-r08-r13-help-contact-policy-login-sandbox-approved.md) | W官网局部导航/入口/内容与Sandbox |
| [DEC-040企业I01～06](../../decisions/DEC-040-step06-issuer-i-r01-r06-information-architecture-multiasset-approved.md)、[DEC-041 I07～12](../../decisions/DEC-041-step06-issuer-i-r07-r12-secondary-navigation-project-offering-approved.md)、[DEC-042 I13～18](../../decisions/DEC-042-step06-issuer-i-r13-r18-business-operations-secondary-navigation-approved.md)、[DEC-043 I19](../../decisions/DEC-043-step06-issuer-i-r19-standalone-investor-portal-navigation-approved.md) | I端九一级菜单、61候选组方向及I-13门户 |
| [四端104候选清单](RWA-SaaS-Step-06-09-Four-Surface-IA-Page-Inventory-Draft-v0.1.md)、[146功能页面静态映射](RWA-SaaS-Step-06-09A-V1-146-Function-to-Page-Coverage-Audit-Draft-v0.1.md)、[I端61页审计](RWA-SaaS-Step-06-09B-Issuer-IA-61-Page-Consistency-Audit-Draft-v0.1.md) | 附录A/C的候选页面/引用数据以及I端未决F01～F07 |
| [Step06当前执行计划](../00-governance/RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md) | 先逐页PRD、后UI/技术/审计/独立冻结 |
| [当前文档状态索引](../Document-Status-Index.md)、[项目README](../../README.md) | 最新已批准与未批准内容的指引 |

**版本记录**：2026-10-26 创建Draft v0.1，整合已有Approved的业务规则和决策范围，逐页缺口显式列待完成；正式编号、页面清单和静态功能关联以仓库原文为准。未来任何更新须先同步DEC引用、功能ID/版本与页面状态，再更新本文和README。

<!-- APPENDIX_TO_BE_GENERATED -->
