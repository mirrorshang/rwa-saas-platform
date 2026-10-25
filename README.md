# RWA SaaS Platform｜产品规划与项目交接总览

> **更新日期：2026-10-26** · **项目阶段：Step04 146/146逐ID Approved；Step05五场景29项历史产品规则Approved，旧Trial时限由DEC-037正式替代为永久免费Free/付费Standard；Step06字段及状态Draft；X-01～X-13仍13/13 Open、V1整体未Frozen** · **文档用途：开发、运营、产品及管理团队统一了解项目现状**
>
> **先看结论：** 我们已完成战略/总体原则、22模块、11步核心流程与**193个正式功能ID的首次交付版号审核（DEC-017）**：**V1.0 146项、V2.0 22项、V3.0 20项、待规划TBD 5项**。**Step04九批146/146项唯一V1.0功能产品设计Approved，静态11步覆盖有条件认可；Step05-01～05-05五场景共29项R产品级Approved（7+4+6+6+6，DEC-029～034）。Step06冻结前五场景总体审计与X-01～X-13风险对照仅Draft、全部13项Open；字段/schema/API、商业价格、具体法域、真实资金/Signer及全部实际测试仍Draft/Not Executed。Step05产品业务规则完成不等于开发交接包Ready或V1 Frozen**；字段级PRD、V1.0整体Frozen、UI/研发及生产运营均未完成。S04-04还获准**Issuer依法自管登记优先、必须时外部登记合作**及**法律文书和Token地址后置依法绑定**的产品原则；实际首发法域法律效力仍须另审。
>
> 本README是可独立阅读的**项目交接摘要**。文中的“批准/完成”主要指**产品规划与文档审查**，**不表示软件已开发、服务已部署、金融活动已获许可或合约已经在链上执行**。核心资料链接放在文末，日常了解项目无需先跳转。

## 2026-10-26 最新商业产品正式决定：DEC-037｜永久免费Free + Standard（现行权威）

**产品负责人Step06-R05=A Approved。** SaaS商业权益采用**永久免费Free（无14天/336小时到期）+付费Standard**。Free让Issuer长期使用绝大部分V1技术能力，在受控Sandbox/可选测试网模拟资产→Offering→测试Token→模拟投资者认购→付款→配售→收益与退出；**不得实际发行有法律权益的主网Token或接受真实投资者购买/实际募集款**。Standard是正式业务的商业使用资格，**不是合法发行许可**；需具体Issuer/Offering合法授权、P平台自身受监管活动RG、合法X资金/Signer及安全/技术条件才可真实生产。

**原DEC-019/029/030及历史Trial PRD仍留档，但旧336小时Trial和后续720小时恢复窗口明确被DEC-037替代**；不再作为现行Free超时/只读/删除条件。Free→Standard始终沿用原Tenant与可复用草稿；模拟资金/Token/登记/收益等事实不能通过变更状态变生产。Standard欠费/停用不能消灭已有真实投资者权利和合法资金义务。

| 最新交接入口 | 正式批准范围 / 未决内容 |
|---|---|
| [DEC-037商业产品正式变更](decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md) | **永久Free/付费Standard商业规则Approved**，历史旧时限被接续；未批准价格、额度、技术方案 |
| [现行Step05-01 Free/Standard PRD v0.4](docs/03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md) | 现行七步客户旅程与商业/真实生产分离；具体schema/API Draft |
| [现行Step05-01四端状态与异常v0.3](docs/03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Cross-Lane-States-Exceptions-Approved-v0.3.md) | Free/Standard权益、Sandbox及RG独立状态；英文enum与UAT仍Draft/Not Executed |
| [22模块Free/Standard能力矩阵 Draft](docs/03-product-prd/RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md) | 明确哪些V1功能能Sandbox模拟、哪些真实执行另需RG；具体资源额度TBD |
| [原65行字段转Free/Standard逐行审查Draft](docs/03-product-prd/RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md) | 65/65原字段行映射，旧时限禁作Free Guard，新字段与迁移实现尚未签收 |

**对开发/运营的约束**：任何下方历史段落出现“试用14天”“336h/720h”为**历史时点文档内容、现已被DEC-037局部废止**。当前Step06先以Free/Standard更新B01字段，再完成B02～B05、跨端状态/权限/API和146项验收；193项版本**146/22/20/TBD5**不变，X-01～13全部Open，V1未Frozen，PR #6 Draft/Open/Unmerged。**本轮未启动UI/研发/真实发行。**

## 2026-10-26 最新正式产品方向：DEC-036｜通用技术SaaS优先（Step06-R04=A）

**产品负责人正式批准**[DEC-036：SaaS技术服务与Issuer发行合规责任划分](decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)。我们的主营交付是多资产发行、Token管理、机构门户、认购订单、收益/存续与技术接口等**软件能力**；**Issuer自行对具体发行资产、法律工具、招揽和发行合规负责**。P平台仍须独立核查**自身实际参与的受监管活动、支付/托管/Signer控制、数据安全等义务**，不能只靠“SaaS声明”免除。

**对产品工作的实际改变**：**不再要求先选日本/ADGM/新加坡或单一Instrument，才能设计、审核和冻结通用V1产品需求**。原[Step06-01A法域候选比较](docs/03-product-prd/RWA-SaaS-Step-06-01A-Jurisdiction-Instrument-Candidate-Comparison-Draft-v0.1.md)保留为**可选/历史研究Draft**，不作为当前强制审批题。平台的**PG产品规格冻结**与真实发行/Token销售/钱包/资金的**RG生产启用审查**分开，PG不自动通过RG；实际金融执行缺有权主体、Signer或证据时必须阻断。

| 当前优先顺序 | 目前进度/入口 | 完成标准 |
|---|---|---|
| **通用SaaS字段级产品PRD** | [Step06当前执行计划 Draft](docs/00-governance/RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md)＋[首批B01/B02字段／状态／权限／API Draft](docs/03-product-prd/RWA-SaaS-Step-06-04-Generic-SaaS-B01-B02-Field-States-Permissions-API-Draft-v0.1.md) | 五场景146 V1正式ID逐项字段、作用域与来源/状态/逻辑接口/未知恢复可核查 |
| **通用资金、全局状态与权限** | [Step06-02募集款专项Draft](docs/03-product-prd/RWA-SaaS-Step-06-02-M11-Funds-Release-Settlement-Field-Cross-Lane-PRD-Draft-v0.1.md)、[Step06-03统一矩阵Draft](docs/03-product-prd/RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md) | I授权发起、X真实执行、P技术最小支持；资金/法定名册/Token不同真值；权限/接口可验收 |
| **跨端一致性/产品冻结前审核** | [X01～13对照](docs/00-governance/RWA-SaaS-Step-06-X01-X13-Audit-Gate-Crosswalk-Draft-v0.1.md)，目前13/13 Open | 146ID×11步×P/I/V/X与领域PRD双向验收；V1正式Frozen另需用户批准 |
| **独立的真实金融生产RG** | 法域/发行人/平台自身受监管行为/实际持款/Signer/安全/实测，全部待专业核证 | **没有RG批准不得将真实Token销售、收款/放款、托管或Signer生产执行标为可用** |

**不变底线**：四份Frozen与历史DEC/SCOPE不改；DEC-017 **193项：V1 146 / V2 22 / V3 20 / TBD 5**；Step04 146/146与Step05 29条仅产品级Approved；**DEC-028 X-01～13全部Open、V1未Frozen、PR #6 Draft/Open/Unmerged**。UI、代码研发和真实生产仍未在本轮启动。

## Step06新增研究成果（2026-10-26，仍Draft）

- **[Step06-01A 候选监管对照与产品影响报告](docs/03-product-prd/RWA-SaaS-Step-06-01A-Jurisdiction-Instrument-Candidate-Comparison-Draft-v0.1.md)**：使用同类“私募Token化债权”对比日本、ADGM（与迪拜DIFC/UAE其余法域不同）及新加坡，列出权威监管资料、V1发行/真实资金/法定登记/Token/收益差异及证据缺口。**仅建议优先研究ADGM，不是用户已选首发法域/Instrument，更非监管批准**；其他法域和Instrument仍可配置且待验证。下一决策只选择首个**纸面研究锚点**，不改变当前批准边界。

## 2026-10-26 最新工作决定与交接重点（DEC-035）

**产品负责人已明确批准Step06下一轮三项工作方向R01=A、R02=A、R03=A；这是工作方法Approved，而不是法域、真实资金或字段API方案Approved。**

| 当前新增成果 | 对业务与交接意味着什么 | 下一轮还缺什么 |
|---|---|---|
| [DEC-035 Step06工作方向正式决策](decisions/DEC-035-step06-r01-r03-pre-freeze-workstream-method-approved.md) | 已批准以“单个法域×单个Instrument”合规验证锚点、M11募集款释放独立PRD、分层字段/权限/API审核推进 | 三个方向的具体法律与技术选择仍待审核 |
| [Step06-01 法域×Instrument合规验证锚点 Draft](docs/03-product-prd/RWA-SaaS-Step-06-01-Jurisdiction-Instrument-Legal-Validation-Anchor-Draft-v0.1.md) | 系统列出J0首发主适用法域、I0法律Instrument、关联法域、Issuer/资金/登记/Token/收益与法律证据门；**目前J0和I0均未选择** | 由产品负责人选调研锚点，再取得有权主体法律证据；如依法必须集中募集须单独复核V2四项 |
| [Step06-02 M11-F012/F013募集款释放和划拨专项Draft](docs/03-product-prd/RWA-SaaS-Step-06-02-M11-Funds-Release-Settlement-Field-Cross-Lane-PRD-Draft-v0.1.md) | 11步中的**第08步**独立形成资金来源、受限余额/Eligible、审批、真实TransferIntent、部分/Unknown、四端权限、14项异常 | 真正资金持款方、释放合同/法域、Signer、付款/到账与完整实测仍Draft |
| [Step06-03 五场景字段/状态/权限/API矩阵 Draft](docs/03-product-prd/RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md) | 不再要求产品负责人逐行审核上百字段：先按对象、唯一真值、状态、P/I/V/X与逻辑接口对账，之后专家审核，最后只审批重大差异 | Schema、API路径、权限码、真实服务商和测试仍未批准 |

**给开发、运营的当前结论**：已具备146项功能与29条跨端产品规则的文字权威，但**没有可直接开发或运营真实金融业务的完整冻结包**。募资款的“真实收款→受限→可释放→独立审批→实际划拨→真实到账”必须独立于SaaS商业收费、配售/Token以及收益Claim；P SaaS运营不得默认成为发行资金/Signer控制者。Step06新三份文件全部是Draft；X-01～X-13仍为**9 High＋3 Medium＋1 Low、13/13 Open**；193正式ID版本**146/22/20/5**不变；四份Frozen及历史DEC/SCOPE保持，PR #6 **Draft/Open/Unmerged**，不开始UI/研发/真实资金/链上生产。

## 1. 一分钟了解当前项目

| 项目 | 当前结论 |
|---|---|
| 产品定位 | 面向全球市场设计的**标准化、可配置、多资产RWA Tokenization ToB SaaS**，首先服务有持续资产发行需求的机构 |
| 核心客户 | **A类优先**：资产管理机构、资产发行企业；**B类**：White-label运营商；**C类**：商业Open API/SDK客户 |
| 当前优先产品 | **Issuer SaaS发行机构工作台** + 每家发行机构独立的**投资者门户** + SaaS平台管理后台 |
| 核心业务 | 企业购买SaaS → 配置组织/门户 → 准备资产和法律文件 → 发行链上Token → 投资者准入与认购 → 合法募集款结算 → 收益/本息分配 → 存续和依法退出 |
| 整体规划 | **6大能力域、22个功能模块、193个唯一正式功能ID**（原187项 + 2026-10-23批准新增6项） |
| 已完成的规划 | 战略/总体PRD/功能树/状态机四份基线，Batch01～06业务原则，11步核心流程、原187纸面交叉核验；DEC-016新增功能编号及**DEC-017对193项逐ID首次交付版号的批准** |
| 当前还缺什么 | **Step04已批准146/146项，剩余13项审计门继续跟踪**、Step05字段级PRD与实际法域/合法执行主体确认、Step06全局一致性验收与整体V1.0需求冻结 |
| UI / 工程 / 上线 | **均未启动**：当前仓库以文档为主，未发现可运行的前后端/合约业务源码；未进行系统集成测试或真实金融、链上生产执行 |
| 项目状态 | **产品设计推进中，V1.0尚未Frozen，不是可直接开发的已验收产品需求包** |

**术语约定**：**Approved**＝用户明确批准了指定产品决策/原则；**Frozen**＝指定文档的约定基线已冻结；**Draft**＝仍待评审；**TBD**＝依赖法域、主体、服务商或技术选型的未决事项。**“业务流程审核通过”不等于“实际系统测试PASS”。**

## 2. 产品将卖给谁、提供什么

### 2.1 三类客户与商业方向

| 客户/产品线 | 目标与能力 | 当前规划 |
|---|---|---|
| **A：Issuer SaaS（优先）** | 发行机构购买SaaS，管理机构成员、资产/金融工具、Offering、投资者、认购和发行后事务；发行机构自行拓展投资者 | **首要产品，V1.0必须形成完整闭环** |
| **B：专业White-label运营商** | 多机构运营、独立品牌/域名、运营商级授权、跨客户协作和数据隔离 | 高级能力拟V2.0；**基础Issuer独立门户已属于V1.0目标** |
| **C：商业Open API/SDK** | 向外部机构/开发者输出受控API、SDK、Webhook、开发者及Sandbox能力 | 商业化开放能力拟V3.0；**内部API-First设计原则已确认，不等于对外商业API上线** |

**我们现阶段不做什么**：不以“RWA资产聚合交易市场、公开撮合交易所”作为第一版主要形态；不把高级White-label、商业API平台和复杂公开二级市场强行塞进V1.0；不把平台默认设定为客户资金托管人、法定登记人、律师或受监管投资服务提供商。

**全球化的含义**是同一套底层业务对象和流程可配置适配不同法域、资产/金融权利类型、发行资格和外部服务。**不等于全球任何地点无需本地许可就可发行。**首发法域、资产工具和实际业务主体仍须确定。

### 2.2 四个业务责任视角

| 责任端 | 谁来使用或执行 | 主要职责 |
|---|---|---|
| **P｜SaaS平台后台** | 我们的平台商业运营、审核和技术运维人员 | 客户企业入驻/KYB、SaaS订阅与授权、Tenant生命周期、平台规则、外部服务配置、审计与异常升级 |
| **I｜发行机构工作台（Issuer SaaS）** | 购买SaaS的发行企业/资产管理机构的管理员、业务、法务和财务 | 组织与权限、资产/Offering创建、法律资料与审批、门户发布、募资结算申请、收益管理、报表和存续运营 |
| **V｜Issuer独立投资者门户** | 各发行机构自己拓展的投资者 | 注册/KYC、钱包、查看获准发行项目、签署认购与付款、查询订单/持仓/Token状态、依法领取或接收收益 |
| **X｜外部有权主体（不是我们的第四套默认产品）** | KYC/KYB、律师/评估/SPV、资金收付与托管方、法定登记者、合约签名方等 | 执行各自依法有权处理的身份核验、法律、金融、链上签名、资金到账及登记活动；平台与Issuer只能按授权编排和读取证据 |

**重要区分**：Tenant是购买和使用SaaS的客户机构空间；Issuer是发行法律主体（需要根据合同和法域校验是否与购买方相同）；Investor是参与某Issuer发行活动的投资者。一个Issuer的投资者门户**不是我们默认统一运营的公开投资市场**。

## 3. 已认可的V1.0核心业务：11步完整客户旅程

以下 **11步的“业务目标与覆盖”已经通过 DEC-014 审核**；并不表示每个页面、技术异常、金融权限和系统实现已经完成。为方便交接，按实际角色连续叙述：

| 步骤 | 操作主体 | 要完成的业务与关键结果 |
|---:|---|---|
| **01** | 企业 / 平台 | 企业官网申请、注册、KYB、在线SaaS订阅收费（允许受控人工合同例外），获批后创建并启用Tenant |
| **02** | Issuer | 配置企业组织、管理员和RBAC权限；拥有**标准独立投资者门户URL、基础品牌及受控项目可见性** |
| **03** | Issuer / 专业服务方 | 创建Asset和法律Instrument；采用受控权利模板，提交法律主体、权属、估值、律师/评估等所需凭证 |
| **04** | Issuer / 受权链执行方 | 创建Project/Offering，定义额度、价格、期限、收益与退出条款；审批合约参数，受权Contract Factory部署并按合法规则发布 |
| **05** | Investor | 进入所属Issuer门户、注册、KYC/资格核验，连接外部钱包或使用一种安全的嵌入式钱包，浏览允许访问的发行项目 |
| **06** | Investor / 资金方 | 选择认购数量与报价，签署必要法律文件，创建订单/额度预留，按适用方案使用USDT/USDC等渠道实际付款并对账 |
| **07** | Issuer / Investor / 登记与链执行方 | 合法配售、必要法定持有人登记及Token铸造/交付分别确认；投资者可查看**订单状态、待交割与真实持仓** |
| **08** | Issuer财务 / 资金方 | 查看销售与认购实收、退款准备金、受限和可结算金额，提出合法划拨申请，核对外部资金方的真实到账回执 |
| **09** | Issuer / 合法分配执行方 | 对适用债息、股息等形成收益事件，按法律权益记录日确定权利人，核算/审批应付，真实注资并验证资金足额及分配日期条件 |
| **10** | Investor / 资金方 | 按最终批准的一种合法**Push（执行方主动支付）或Claim（投资者主动领取）**方式取得收益，查询可领、未领、处理中、已付、失败等记录 |
| **11** | Issuer / 法律和链执行方 | 存续披露、异常处理、A债权到期本息清偿；B类SPV股权仅在合法适用时分红、回购或注销；法定名册/实际付款/Token变更分别对证 |

可记作七段：**买SaaS → 配置企业和门户 → 准备及发行资产 → 投资者购买 → 募资合法结算 → 收益/本息分配 → 存续与依法退出。**

**当前参考工具**：A＝债权/固定或约定票息、本金到期偿还；B＝SPV股权/股份权益、依法可分红及条件性回购。它们是产品模板与规则审核的参考，不代表首发法域已选定或股权被保证回购、保证收益。

### 所有端必须遵守的业务事实边界

- **SaaS服务费**与**投资者认购款**是不同资金用途；投资者退款、Issuer募集资金合法划拨、收益/本金出款是三条不同付款责任链。
- **认购订单创建 ≠ 付款到账 ≠ 合法配售 ≠ 法定登记完成 ≠ Token实际交付**。持仓显示必须如实区分这些状态。
- **链上Token数量不是任何法域下法定股权或债权登记的自动唯一依据**；应明确实际法律权利文件、登记及链上证据各自来源。
- **分配计划/应付获批 ≠ 真实资金已注入 ≠ 投资者已领取/已到账**。不足额、冻结、失败或Unknown均需要独立状态和恢复流程。
- **合约部署、代持密钥、资金释放或链上付款**只能由具体获授权的主体和安全机制执行，不能因SaaS界面存在按钮就认为平台具备相应许可。

## 4. 已完成的产品规划主要有哪些

### 4.1 四份已形成的稳定基线

| 基线文档 | 已确认的核心内容 | 状态 |
|---|---|---|
| **02《产品战略与商业模式》** | 全球标准化ToB定位、A/B/C客户顺序、Issuer优先、White-label与API方向、产品商业与监管边界 | **有条件Frozen**；首发市场、资产、定价、具体法律责任保留决策门 |
| **03《总体产品需求PRD》** | 产品主体/角色、核心业务对象、交付线、生命周期、跨模块原则、非功能及验收基线 | **Frozen（总体层）** |
| **《产品功能树与模块责任矩阵》** | 6大能力域、22模块，以及Tenant、Offering、Investor、支付、Token等职责边界 | **Frozen（模块层）** |
| **04《业务流程与状态机原则》** | WF-01～18及资金、法律权益、Token、身份和异常状态的独立权威/守卫原则 | **Frozen（原则层）** |

**说明**：Frozen是这些旧文件明确标示的范围，并不是V1.0全部193个功能、字段、页面或技术生产方案已经冻结。后续DEC的已批方向按正式生效决策衔接，不追溯篡改冻结原文。

### 4.2 六批已审核通过的业务需求

| 批次 | 已完成的规划内容（精简） |
|---|---|
| **Batch 01：企业和SaaS商业开通** | 企业资料与KYB、合同/订阅、Tenant与使用额度、组织/成员权限及平台管理 |
| **Batch 02：资产、Instrument和法律资料** | 多资产工具、权利条款、外部律师/评估、文件审核及合法证据留存 |
| **Batch 03：发行Project与Offering** | 发行配置、条款与版本、额度/价格/适格/风险披露、审批与发布规则 |
| **Batch 04：投资者与认购资金** | 投资者账户、KYC/Offering准入、钱包/订单、认购支付和退款、Allocation及必要登记 |
| **Batch 05：Token与合约执行** | 发行合约/Token、受权部署/铸造/交付、链交易核验、外部签名权限与失败处理 |
| **Batch 06：发行后生命周期及公共控制** | 收益/本息/退出、工作流与人工异常、通知、审计、报表、安全/数据治理及外部适配 |

**审核结论**：六批业务原则 Approved，细到字段、页面、状态枚举、接口及测试条件的 PRD **尚未完成**。

### 4.3 已批准的后续产品决策

- **DEC-012：版本管理方式**改为V1.0/V2.0/V3.0；V1.0就是第一版完整必交范围，不再在V1内部划P0/P1作为“可不做”。
- **DEC-013：CR-01～10 全部A**，明确SaaS线上订阅、标准Issuer Portal、A/B模板、Contract Factory、钱包、资金结算、收益分配、合法退出等产品方向。
- **DEC-014：核心11步完整业务流程 Approved**；四泳道详细图仍只是后续详细PRD参考。
- **DEC-015：XCHK-01～10 全部A**，完成原187项×核心流程纸面交叉审核和缺口/权威边界处理原则。
- **DEC-016：PROP-01～11 全部A**，批准**5项扩深原功能**、**6项独立新增并赋予正式ID**；现共有193个唯一功能编号。原187的功能名称、ID、历史分级均保留，不把旧P0/P1/P2当作现行版本范围。
- **DEC-017：R-01～R-06 全部A**，**正式批准193项逐ID首次交付版本**：V1.0 146、V2.0 22、V3.0 20、TBD 5；原V3草案中5项改列TBD。此决定**不等于V1.0整体需求Frozen**，也不授权开发、资金托管、合约生产签名或上线。

- **DEC-018：S04-01-01～06 全部A**，批准Issuer基础16项Step04功能设计；**DEC-019：S04-01-R01～R05 全部A**，后续明确邮箱注册即试用14天、正式付费前KYB、单一Standard套餐、试用到期只读及30天恢复、已投产业务合法义务保护；**DEC-020：S04-02-01～06 全部A**，批准M04资产/Instrument 8项及M06文件/专业审查6项，总计再增14项。**DEC-021：S04-03-01～07全部A**，新增M05 Project/Offering 10项与M07 Token 9项Step04正式批准；**DEC-022：S04-04七项A**，M09投资者8项、M10认购8项、M12配售登记8项批准，追加依法Issuer自管优先登记与合约地址文书绑定产品原则。**DEC-023：S04-05-01～07全部A，R01/R02全部A**，新增M11认购资金12项与M13收益存续8项Step04 Approved；收款合约优先评估、依法允许其他收款通道，以及实际预注资Claim优先/Push合法替代均为产品方向，未批准具体合约、托管、资金执行。以上DEC均不代表V1.0整体Frozen。

- **DEC-034：Step05-05-R01～R06全部A**，批准P后台商业与金融角色分权、服务端Tenant/本人/合法代理与高敏访问守卫、M17原Intent异常受权恢复、M18通知/阅读/法律送达区分、M19/M20/M21规则审计和只读报表、M22 Provider凭证及Sandbox/生产隔离和退租法定责任交接。**仅产品级规则Approved，字段/API/法域/真实资金Signer仍Draft。**
- **DEC-033：Step05-04-R01～R06全部A**，批准存续义务不断档、法定RecordDate快照引用M12、A债权/B SPV权益收益分离、合法应付审批后核真实注资并按条件启用Claim或Push/外部付款、投资者分阶段展示真实收益、到期清偿/名册变化/Token处置各留证。**仅产品行为Approved，真实资金/Signer/税务/法域/API仍Draft。**
- **DEC-032：Step05-03-R01～R06全部A**，批准KYC/Offering资格与钱包身份分离、Quote/合同签署及原子预留的真钱前置、M11稳定币最终性/实收匹配、M12合法配售容量守卫、法定登记与M07 Token交付独立确认、订单/退款/迟到账/Unknown各端多状态显示。**仅产品业务规则Approved，技术/法域/持款/Signer/API继续Draft。**
- **DEC-031：Step05-02-R01～R04全部A**，批准投资者Offering合法可见与允许认购分离、Issuer七类缺项式发布Gate且须明确发布、投资者详情先合法Instrument权益后Token技术内容、重大条款/法律文书/地址变更保留旧版本并按法域评估在途订单/通知。**仅产品业务规则Approved，法域/资金Signer/接口仍Draft**。
- **DEC-030：Step05-01-R04～07全部A**，批准14×24小时Trial/30×24小时恢复（UTC瞬间判定）、KYB原案补件与合法拒绝后受权复核、合法草稿再核验后正式发行、商业付款和Tenant授权两个独立展示状态。连同DEC-029形成Step05-01七条产品业务规则全部Approved。**具体字段/接口/法域/供应商依然Draft**。
- **DEC-029：Step05-01-R01～03全部A**，正式批准Trial转Paid保留同Tenant及合法草稿/不提升模拟事实、KYB未通过保留受限Tenant与合法复核、实付但未开通恢复同Tenant且不重复收费。**仅三项规则Approved，字段/状态/API/测试仍Draft**。
- **DEC-028：静态四端×11步功能覆盖有条件认可**、13项审计风险未关闭；历史Step02入驻顺序已在v0.4勘误，Step05-01企业入驻可视化PRD Draft已建，不代表审计全文Approved或V1 Frozen。
- **DEC-027：S04-09-01～06全部A**，批准M22-F001～F008八项外部适配产品设计，**Step04逐ID146/146 Approved、0待审**；[全量146项×四端×11步静态审计Draft](docs/03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)发现13项待跟踪决策门，**尚未审核通过，V1.0整体未Frozen**。
- **DEC-026：S04-08-01～03全部A**，批准M03-F001/F002/F005三项平台运营P端产品功能设计（商业KYB、Tenant开停与恢复、受控敏感资料访问）；Step04累计**138/146 Approved、剩余M22 8项**。商业Tenant真值仍由M01负责，真实金融及链签名不受本DEC授权。
- **DEC-025：S04-07-01～07全部A**，批准M08投资者门户11个V1 ID的完整Step04产品设计，覆盖账户、Offering、资格引导、认购支付、订单持仓、钱包及收益中心，累计**135/146 Approved、剩余11项待审**。M08-F010高级营销仍TBD，V1整体Frozen与生产授权未批。
- **DEC-024：S04-06-01～09全部A**，批准M17工作流异常6项＋M18通知5项＋M19规则6项＋M20安全审计8项＋M21只读报表6项，共31个唯一V1.0 ID；Step04累计**124/146 Approved，余22项**。本批准不修改193项版号、任何Frozen/历史决定、UI/开发/真实生产授权。

此外，**Step 03.5已完成文档治理**：建立现行权威目录、压缩过时导航、标记11份历史工作稿，保留正式DEC/SCOPE及四份Frozen，并验证原187功能编号与历史数据未被改写。

## 5. 版本规划：首次交付归属已Approved，但尚非最终详细开发包

| 首次交付版本 | 主要产品能力 | 已批准功能ID数 | 范围状态 |
|---|---|---:|---|
| **V1.0** | **Issuer SaaS完整闭环**：企业订阅/Portal/资产发行/Token/投资者认购/真实结算/收益与合法到期管理，配平台必要审批、安全、审计和外部服务 | **146** | **DEC-017版号Approved；整体PRD未Frozen** |
| **V2.0** | **发行与运营增强**：受控二级转让、高级White-label、多机构运营、批次/协作增强 | **22** | **DEC-017版号Approved；未承诺开发排期** |
| **V3.0** | **高级与生态能力**：商业Open API/SDK、多链/复杂工具、服务商市场、高级规则和数据分析 | **20** | **DEC-017版号Approved；未承诺开发排期** |
| **TBD待规划** | 高级推荐、跨机构KYC网络、公开撮合/AMM、多级代理、开发者应用商店 | **5** | **编号保留，DEC-017批准暂不承诺交付版号** |
| **总计** | 22模块下共193个正式功能ID，**不是193个已开发页面或研发任务** | **193** | **交付范围未Frozen** |

**五项待规划ID**：M08-F010（高级推荐）、M09-F009（跨机构KYC共享网络）、M14-F007（公开订单簿/AMM）、M15-F008（多级代理）、M16-F008（开发者应用商店）；它们**不是V3.0已批准交付功能**，须另行确认市场/法域/商业依据。 

**V1重要条件门（R-05）**：首版以**合法适用的持续认购与基础配售**为主。如果确定的首发Instrument/法域依法必须集中募集，则整体V1冻结前重新审M05-F011、M10-F009、M12-F009、M12-F010及相关功能的跨版范围，不得擅自绕过法定流程。

**新增六项正式功能**（DEC-016已批准功能身份/编号，**DEC-017已批准均归V1.0**，字段/技术仍待详细PRD）：

| 正式ID | 功能 |
|---|---|
| **M01-F009** | 标准Issuer独立投资者门户实例开通与发布 |
| **M08-F011** | 外部/嵌入式钱包生命周期管理 |
| **M08-F012** | 投资者收益领取中心与实付记录 |
| **M11-F012** | 募集资金释放条件与可结算余额 |
| **M11-F013** | 募集资金受权划拨与真实到账核验 |
| **M13-F009** | 收益/本息分配批次与真实注资 |

**版本数字解释**：原187项初步版本提案为140/22/25，DEC-016新增6项全部归V1.0，形成原193项候选146/22/25；随后**DEC-017正式批准146/22/20/TBD5**，五项从V3转为不承诺特定版本。**这193项有唯一且获批准的首次交付归属，但整体V1.0的页面、权限、字段、异常和验收范围尚未Frozen**。V1.0内不再使用P0/P1区分可选开发。

## 6. 项目进度：完成与未完成要分开看

| 交付事项 | 当前状态 | 对开发/运营意味着什么 |
|---|---|---|
| 产品战略与商业模式 | **已完成原则基线（有条件Frozen）** | 可理解客户、商业定位和非目标；不能将价格/首发市场当最终结论 |
| 总体PRD、22模块功能树、WF01～18原则 | **已Frozen** | 作为设计上游规则与对象边界，具体字段/接口仍未定 |
| Batch01～06业务原则 | **已Approved** | 可用于业务讨论及PRD设计，不等同于最终需求包 |
| 11步主流程（四端） | **已Approved核心业务覆盖** | 可据此讨论流程与职责，不表示实测11个场景成功 |
| 原187项双向功能核验、缺口处理 | **纸面核验完成、XCHK原则Approved** | 问题已识别并分类，尚需分端和字段规格 |
| PROP01～11分类与6项正式ID | **DEC-016 Approved** | **193项功能编号已成立**，不是版号/页面/成本批准 |
| 193项首次交付版号/待规划归属 | **DEC-017 Approved** | **146/22/20/TBD5已批准**；不等于146项已完成字段级设计、上线或研发验收 |
| 各端完整菜单、页面组、操作权限与功能清单 | **Step04九批146/146逐IDApproved；跨端11步审计Draft待审核** | [DEC-018/019](decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)批准基础16项及试用补充；[DEC-020](decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)批准M04/M06 14项；[DEC-021](decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)批准M05/M07 19项；[DEC-022](decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)批准M09/M10/M12 24项及两条跨模块产品原则；[DEC-023](decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)批准M11/M13 20项及R01/R02两条资金合约/Claim产品原则；[DEC-024](decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md)共享31项、[DEC-025](decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md)门户11项也已批准；[DEC-026](decisions/DEC-026-step04-s0408-platform-operations-approved.md)批准平台后台M03 3项；[DEC-027](decisions/DEC-027-step04-s0409-external-authority-services-approved.md)最后M22八项逐ID批准，[全量交叉审计](docs/03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)仍Draft待用户审核；整体不能启动正式全套UI验收 |
| 逐模块字段级PRD、状态机细化、验收标准 | **Step05-01～05-05产品级规则共29条已Approved，五份对应详细PRD/跨端状态异常产品语义已收口；Step06冻结前五场景总体静态交叉审核与13审计风险逐项对照已形成Draft，13项全Open；具体字段/schema/API、资金释放第08步、法域/钱包Signer/生产方案及测试仍待审** | 不能据此认定后端API、数据库、链合约、计费与异常规则已定 |
| 最终全局一致性核验与V1.0交付范围冻结 | **未完成（Step06）** | 尚未完成“版本功能↔业务流程↔页面↔状态/责任↔验收”的最终闭环 |
| UI/UX原型与前端、后端、合约开发 | **未启动** | 仓库没有现成业务应用源码；项目仍处于产品设计阶段 |
| 服务商对接、真实资金/Token生产、系统测试与上线 | **未执行** | 无生产实例、真实金融流程或已通过测试的依据 |

## 7. 开发及运营都必须知道的未决事项

| 决策门（未解决） | 当前可以确定什么 | 未获批准、不能默认什么 |
|---|---|---|
| **首发法域/业务资质** | 产品设计面向全球、按法域参数化 | 哪个国家可发行、谁持有具体许可、哪些投资者可参与 |
| **首发资产/金融Instrument** | A债权/B SPV股权为受控参考工具 | 它们均可在首发法域合法上线、SPV股权必定分红/保本回购 |
| **合同/定价/SaaS商业支付** | SaaS在线订阅方向Approved，允许人工合同例外 | 最终套餐价格、收费商、合同/开票税务及退款责任 |
| **KYC/KYB与投资者资格** | Issuer KYB、Investor KYC、Offering Eligibility分开 | 平台自动有权处理所有敏感数据或一处KYC全法域通行 |
| **钱包与合约** | 外部钱包+一种安全嵌入式方案、受权Contract Factory是产品目标 | MPC必选、谁持有密钥/控制Gas、指定链/协议/Signer以及合约审计通过 |
| **真实资金收付/托管/释放** | 认购退款、Issuer募集款划拨、收益/本金支付必须分开；需真实到账对证 | SaaS自己可持款、自动冻结/解冻、替任何主体打款或放款 |
| **收益分配/Claim法律效果** | 真实注资、足额核验、按批准的合法Push或Claim记录状态 | 定时器到期即合法清偿；投资者“可Claim”即已收款；股权应当固定兑付 |
| **法定权益/登记/Token同步** | 支付、配售、法律登记、Token最终性分别管理 | 仅凭链上钱包余额就推导法定股权已取得或已转让 |
| **上线与数据安全** | 多Tenant隔离、RBAC、审计、密钥与环境隔离为原则 | 已有选型、渗透测试、安全审计、故障演练和生产上线批准 |

所有TBD都要在后续产品/法务/技术审批中落实到**具体责任方、方案、状态、验收方式和证据**。不应因为本README中描述了“支持”的目标能力，就向客户承诺它现在可用。

## 8. 下一阶段工作顺序与交付门槛

| 阶段 | 工作任务 | 必须得到的可审核成果 |
|---|---|---|
| **Step 03 首次交付版本归属** | **DEC-017已批准全部193项唯一首次交付版本或TBD** | **Step04已批准S04-01～06合计124项；V1整体Frozen仍需Step06另行批准** |
| **Step 04：分端完整功能设计** | **进行中：S04-01～07已Approved（135项）**，其余11项分批；覆盖平台后台、Issuer工作台、投资者门户及外部责任 | **[146项分端追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)**；批次获批≠整体完成 |
| **Step 05：字段级详细PRD** | 梳理真实对象、字段、状态、计算、权限、合同/资金/Token守卫、外部适配、失败与恢复 | **可供技术和UI准确设计的字段级PRD+业务规则/验收附录** |
| **Step 06：全局交叉审核并决定冻结** | 以11步主流程反查功能、页面、字段、权限、合规Gate与测试场景 | **V1.0明确的范围冻结决定、未决风险/依赖清单及变更记录** |
| **之后 UI/UX** | IA、导航/页面、交互状态、组件规范、原型/可运行UI | **待产品负责人批准后启动**；UI通过后再确定工程实施节奏和真实服务端集成计划 |

**进入正式UI/研发的原则**：至少应先明确要做的V1.0功能、各端承载位置、关键用户动作与状态、可接受异常、受权责任与验收标准。生产环境上线还必须另过技术、安全、监管/法律与运营审批，不由“UI已完成”自动触发。

## 9. 面向开发和运营同事：现阶段可以做什么

**开发/技术同事**可以先熟悉四端责任划分、22模块、11步核心旅程和**DEC-017已批准版号的193项统一主表**；评估资金/登记/签名、钱包、租户隔离及规则设计风险，为Step04/05提供依据。**V1.0的146项是已批准的首版功能归属，但字段/状态/界面/验收与合规依赖还没有冻结，不能直接当作开发完备的工单或已上线能力**。

**运营/商务同事**可以根据A类Issuer客户优先策略开展客户访谈，研究实际企业入驻、商业订阅、发行法域、可能的法律/评估/KYC/收付款合作伙伴、Issuer自拓投资者及项目上线准备；向产品团队反馈套餐、开户、募集资金实际流转、收益支付/存续的真实操作差异。**不要对外宣称平台已上线、已取得资质、某法域可销售或已确定收费方案**。

**产品负责人及决策流程**：产品原则、功能编号、版号归属、字段PRD、UI、生产上线是不同审批门。新决定应明确记录其覆盖的旧版本/范围；原DEC/SCOPE及四份Frozen保留历史证据，不静默覆盖。版本功能总数不是页面数、开发任务数或预算估算。

## 10. 仓库、文件与版本治理

- **仓库**：私有GitHub仓库 \`mirrorshang/rwa-saas-platform\`；当前工作分支 \`docs/regulated-activity-boundaries-v01\`。
- **合并状态**：[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) 为 **Draft / Open / Unmerged**；其目标分支为 \`docs/initial-asset-scope-v01\`，**不是直接面向main的已批准发布**。未经用户明确授权，不合并。
- **当前功能主账**：[193项统一编号及首次交付归属（DEC-017 Approved）](docs/03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)。文件名沿用历史Draft链接，但正文版号已批准；原187项表和旧草案只作历史对照，**不再与193表并列作为当前版号主表**。
- **当前业务流程**：[Step02四泳道v0.3](docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)：11步产品主线 Approved、详细执行仍 Draft。
- **批准与权威**：[DEC-016](decisions/DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md)新增6个正式ID；[DEC-017](decisions/DEC-017-step03-r01-06-approved-193-release-assignments.md)批准193个ID的首次交付版号；[文档状态与所有DEC/SCOPE索引](docs/Document-Status-Index.md)与[权威/历史关系](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)可供深查。
- **参考审计**：[Step03.5整理验收](docs/00-governance/RWA-SaaS-Step-03.5-Non-Destructive-Cleanup-Verification-v0.1.md)；旧流程与优先级草案仅作历史记录。

**README维护规则**：每次产品负责人批准新功能版号、分端PRD或范围冻结，须更新本文件的进度、数量、审批和未决门，避免开发及运营看到过时信息。**截至2026-10-24，项目仍处于产品设计阶段，不是软件开发完成或已可上线。**

## 11. Step04最新进展：S04-01首批已批准（2026-10-24）

**审批记录**：[DEC-018｜S04-01六项全部A](decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)；**当前有效产品设计阅读入口**：[Issuer基础工作台与试用订阅整合v0.2](docs/03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)；**全部V1功能逐ID审核账**：[146项分端追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **本批仅16/146项Step04功能设计Approved**：M01-F001～F009（企业申请/机构资料/商业合同/订阅、Tenant、额度、暂停和退租、标准Issuer投资者门户实例）与M02-F001～F007（组织、邀请、登录、角色、项目作用域、敏感分权、撤权与移交）。
- **开发/运营应如何理解**：买SaaS/商业收费≠获准发行；平台后台受权审核/创建Tenant，Issuer管理员配置团队及标准Portal，投资者门户消费已合法发布信息；同一业务事实只认一个主责模块，跨端页面复用不重复记录真实资金、法定持有人或Token事实。
- **本批只记录交互边界，不宣布其完整功能已审**：M03平台端和M17～M22共享模块本轮只作依赖说明；其V1功能留后续对应批次细审。其中S04-02/S04-03依次又获批14/19项后，全项目尚余97项V1功能待审，其他V2/V3/TBD版号照DEC-017保留。
- **后续状态**：S04-02 M04/M06依DEC-020批准、S04-03 M05/M07依DEC-021批准、S04-04 M09/M10/M12依DEC-022批准、S04-05 M11/M13依DEC-023批准；后续还有共享能力、门户、平台后台及外部合法主体责任。
- **审批边界**：DEC-018仅批准角色、页面组、功能操作与状态异常分类，不冻结字段/API/UI、V1.0整体需求或真实法域资金/Token生产；四份Frozen和历史DEC/SCOPE不修改，PR #6继续Draft/Open/Unmerged。

## 12. Step04 S04-01后续生效补充：企业自助试用与标准订阅

**正式后续决定**：[DEC-019｜R01～R05全部A](decisions/DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)，并与原[DEC-018](decisions/DEC-018-step04-s0401-issuer-foundation-approved.md)合并理解；当前有效功能设计为[S04-01 v0.2](docs/03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)，原v0.1审批历史保留不改。

**面向开发、运营和商务的默认企业旅程**：

1. 企业联系人**邮箱注册并验证**，立即获得**受限试用Tenant**，不要求先提交完整KYB或约销售沟通。
2. 14个自然日免费试用，无需预绑付款方式、不会自动收费；仅使用受控草稿、门户私有预览、模拟/测试发行能力。**真实资金、真实投资者认购、生产Token与法定登记均禁止**。
3. 试用中可预选Issuer Standard；在**正式商业在线付款前完成企业KYB**，保留DEC-013 CR-01的正式商用准入原则。KYB与真实发行法域/Instrument资格是两回事。
4. 首期**1个Issuer Standard正式付费套餐**，Growth仅留研究位置；价格、金额、精确席位/项目/KYC额度以及第三方收费未定。KYB与商业合同/支付有效后**在同一个Tenant上升级商业权限**，不重复创建第二租户。
5. 试用到期未付费进入**只读与转化模式**：保留登录、查看/允许导出、补KYB及付费操作，暂停新建/编辑/测试；暂设30天恢复窗口，之后按合法、已通知的数据政策处理，不直接硬删。
6. **已有真实发行与投资者权益的正式客户**订阅欠费/到期时仅限制新的商业操作；必要投资者查询、资金退款/兑付/清偿、合法外部执行和责任交接须独立保护，不能随试用到期规则一键锁死。

这些规则由DEC-019在Step04产品层正式批准，尚未代表**试用产品已开发、商业支付服务商/KYB服务商已签约、资金链上生产授权或整体V1 Frozen**。DEC-019补充本身没有新增ID，批准时仍为16/146；**其后S04-02～S04-06由DEC-020～024批准，最新146/146逐ID已批准；全量审计Draft待审**，参见下节。

## 13. Step04 S04-02已批准：资产、Instrument、文件与专业审查（2026-10-24）

**正式决策**：[DEC-020｜S04-02-01～06全部A](decisions/DEC-020-step04-s0402-issuer-asset-instrument-documents-review-approved.md)；**现行功能设计**：[S04-02 M04/M06完整功能设计 v0.1](docs/03-product-prd/RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)；**逐项进度权威**：[146项分端追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- 本次**M04资产与Instrument 8项＋M06文件与专业审查6项**，14/14项Step04产品功能设计Approved。与S04-01原16项无重叠，**S04-02批准当时累计30/146、余116项**；后续S04-03新增19项、S04-04新增24项、S04-05新增20项，最新146/146（审计Draft）见第20节。
- Issuer资产建档/权属证据→受控A债权或B SPV实体权益模板→实际发行与债务/SPV主体关联→权利义务和收益/偿付条款→独立复核、正式文书版本→自行委托适格专业方并引用审查成果→M05后续引用批准版本。内部ReviewedForUse不等于合法发行许可。
- Investor Portal的必要条款展示/签署由M06管理正式文书和签署证据，M08承载体验、M10校验认购前置，M22接电子签。M05/M08/M10/M17～M22仍只是跨模块依赖，**不能重复记为已审**。
- 版本边界：**M04-F008受控A/B基础模板已属于V1**，但M04-F009复杂资产组合属V3、M06-F007外部专业协作属V2、M06-F008服务商市场属V3。早期SCOPE的历史P1文字保留，由较新的DEC-013/017明确当前V1归属。
- **后续审批已完成**：S04-03 Project/Offering与Token（M05/M07）已由DEC-021批准。S04-02本身依旧不冻结字段、正式UI、开发或真实金融/链生产。四份Frozen及历史DEC/SCOPE不动，PR #6维持Draft/Open/Unmerged。

## 14. Step04 S04-03已批准：Project、Offering、Token（2026-10-25）

**正式决定**：[DEC-021｜S04-03-01～07全部A](decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)；**当前设计**：[S04-03 Issuer Project/Offering与Token完整19项设计v0.1](docs/03-product-prd/RWA-SaaS-Step-04-S04-03-Issuer-Project-Offering-Token-Approved-v0.1.md)；**唯一逐ID进度**：[146项分端追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **M05 Project/Offering 10项＋M07 Token 9项**本轮Step04功能设计全部Approved，与之前M01/M02/M04/M06无交叠，截至S04-03累计**49/146已审、97待审**；随后S04-04获批24项、S04-05获批20项，现146/146逐ID已审、0待审。这仍是产品需求审查，不是已开发、已上线或法域许可。
- Issuer通过Project工作空间选择经审Instrument、创建独立Offering、配置受控价格/数量/持续销售条件、引用真正合法收款/登记/Token方案、经过具体发布Gate，再独立执行受权发布与暂停/关闭；真实资金与法定权利的状态归M11/M12及有权主体，不由Offering界面伪造。
- Token采用受控链/标准与权利单位映射、经批准的合约模板和部署意图、实际有权Signer执行与链上Finality；M07负责接收钱包条件、Mint/链事件、必要禁转与依法适用的Burn，M12的配售/法定登记、M11实收及M13偿付各保留独立权威。
- **仍不进V1的功能**：M05-F011集中募集/批次配售（V2）、M05-F012动态定价（V3）、M07-F010复杂多链/升级（V3）。如果首发法域或Instrument依法必须集中募集，按DEC-017在V1整体冻结前重新审核相关M05/M10/M12版号，不能暗中绕过。**M07-F009必要Token赎回/销毁已为V1**，但不代表SPV股份自动具有回购义务。
- M03、M08～M13、M17～M22在S04-03中只是接口与主责边界引用，**不得计入已完成审核**；S04-04 M09/M10/M12随后已按DEC-022获批，已于S04-05按DEC-023批准资金与收益存续20项；S04-06共享工作台能力随后按DEC-024已批准。Step05字段/法域/服务商/合约、Step06整体Frozen与UI/开发均尚未启动。四份Frozen、历史DEC/SCOPE原文保留，PR #6继续Draft/Open/Unmerged。


## 15. Step04 S04-04已批准：Issuer投资者、认购、配售及登记（2026-10-25）

**正式决定**：[DEC-022｜S04-04-01～07七项全部A](decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)；**现行功能设计**：[S04-04 M09/M10/M12完整24项设计v0.1](docs/03-product-prd/RWA-SaaS-Step-04-S04-04-Issuer-Investor-Subscription-Allocation-Approved-v0.1.md)；**跨模块后续生效原则**：[权威登记责任与法律文件—合约地址绑定](docs/03-product-prd/RWA-SaaS-Step-04-Legal-Register-Authority-Token-Address-Binding-Approved-v0.1.md)；**唯一ID进度**：[146项分端追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **已审24项**：M09投资者档案、KYC/KYB、AML、每Offering资格、补件/复核/审计共8项；M10唯一认购订单、报价/文书、额度预留请求、付款待核保护、签署、取消异常共8项；M12唯一发行额度、合法预留与基础配售、法定登记证据及Token差异核对共8项。与前批无重叠，S04-04批准时累计**73/146 Approved、73项待审核**；后续DEC-023新增20项，最新146/146逐ID已批准；审计Draft。
- **发行机构合法登记能力（DEC-022 C01）**：产品默认允许**发行机构依法自管**的登记责任模型，通过本平台管理受权持有人名册/配售/证据/版本/审计。发行人依法委托合作方时支持结果记录或接口；**只有特定法域/Instrument依法强制特定登记或许可主体时才启用强制外部门槛**。Issuer/其合法代理对实际登记有效性负责；平台不默认取得法定登记权，也不能通过合同免除自身可能存在的法定义务。M22-F004只是必要外部登记服务集成能力，不是所有客户必须购买的独立审核机构。
- **法律文件与Token地址绑定（DEC-022 C02）**：M04/M06可先准备并审查合法权利结构、发行条款及文书；按适用授权经M07取得真实合约地址，若某最终生效文件依法必须载明地址，再由M06形成经授权附件、补充文件/必要重签，M05完成最终文书与部署合约一致性发布Gate。**已签署旧文件不可后台补填覆盖；单纯部署合约也不等于允许募集、发行或Mint**。是否合法先部署、哪些文书必须载明地址与其法律效力，仍由具体法域/Instrument决定。
- **四端唯一主责**：M09对每Offering资格决策负责，M10对订单/Quote负责，M12对额度、配售和合法登记**结果引用及核对**负责，M11/实际资金方对真实款项负责，M07/受权执行方对Token事实负责，M06对已签文书版本负责，Investor Portal只展示受权派生视图。
- **仍不进V1**：M09-F009 TBD；M10-F009与M12-F009/F010属V2，M10-F010属V3。若首发法律工具强制集中募集，须在V1整体Frozen前重新正式审核相关版号。
- **后续进展**：S04-05 M11募集款真实收款/退款/划拨与M13合法收益/存续20项已于DEC-023批准；M08完整门户已按DEC-025批准，M03平台管理已按DEC-026批准，M22外部适配已按DEC-027批准（仅真实服务商/法域生产待定）；M17～M21共享能力已按DEC-024批准。字段PRD、真实法律责任/合约/资金生产、UI研发、V1整体Frozen与PR #6合并均未批准。

## 16. Step04 S04-05已批准：认购资金、募集款结算、收益与存续（2026-10-25）

**正式决策**：[DEC-023｜S04-05-01～07和R01/R02全部A](decisions/DEC-023-step04-s0405-funds-lifecycle-approved.md)；**本批完整产品设计**：[S04-05 Issuer资金和收益存续20项 v0.1](docs/03-product-prd/RWA-SaaS-Step-04-S04-05-Issuer-Funds-Lifecycle-Approved-v0.1.md)；**逐ID权威进度**：[146项追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **审核范围**：M11投资者认购收款、链最终性/精确对账、异常/退款、募集款受限/可结算和合法划拨**12项**（M11-F001～F010、F012/F013）；M13存续档案、法律持有人记录日、披露、合法票息/股息/本金计算、分配批次与真实注资、Claim/Push实际出款、到期与逾期**8项**（M13-F001～F007、F009）；本批**20/20 Step04 Approved**。
- **补充R01批准**：链上稳定币认购**优先评估受控智能合约收款**，保留依法适用的Issuer授权钱包/第三方合法支付主体；钱包模式也可在真实合法签名授权下自动/半自动退款。收款合约不能自动充当法律托管，SaaS不默认控制私钥或客户资金。认购Token合约与收款合约职责分开。
- **补充R02批准**：链上收益**优先评估独立预注资Claim合约**，完成M12法定权利快照、M13计算/审批、真实合法付款人和足额注资核验后开放领取；保留法律要求的Push/外部付款。**已注资≠投资者已收款；已领取≠法律债务当然解除**。分配合约与认购收款、Token发行合约分别定位。
- **核心权威**：SaaS商业订阅费M01、投资者认购款及退款/募集划拨M11、存续收益及本息付款M13三条资金责任链不能混用；M12法律持有人、M07 Token执行、M17异常、M21只读统计各负其责。
- **规划保留**：M11-F011法币/多通道投资者认购和M13-F008复杂公司行动仍为V3.0，不能偷入V1。S04-05批准当时累计**93/146 Approved、53/146待审核**；随后DEC-024批准共享能力31项，DEC-025后最新**135/146 Approved、11/146待审**，余M03 3项＋M22 8项。
- **下一步**：S04-06已按DEC-024获批，S04-07投资者门户已按DEC-025批准，S04-08平台后台已批准，S04-09已按DEC-027批准；下一为Draft审计结果审核；具体合约架构/合法资金主体/字段、接口、Gas、未领金额处理和真实生产签名在Step05与法域决策门审议。

**边界不变**：S04-05的Approved只覆盖功能和业务归属，V1.0整体仍未Frozen；不修改四份Frozen和既有正式决策/SCOPE正文，不批准UI/开发或真实资金、Token、智能合约生产执行，也不合并PR #6。


## 17. Step04 S04-06已批准：Issuer共享工作台、通知、规则、安全审计和报表（2026-10-25）

**正式决策**：[DEC-024｜S04-06-01～09全部A](decisions/DEC-024-step04-s0406-shared-workflows-rules-audit-reports-approved.md)；**本批完整设计**：[S04-06 M17～M21 31项批准设计](docs/03-product-prd/RWA-SaaS-Step-04-S04-06-Shared-Workflows-Rules-Audit-Reports-Approved-v0.1.md)；**逐ID进度权威**：[146项追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **M17（6项）**统一Issuer工作中心的跨模块任务、补件、异常、可恢复性授权、分级和时限升级；任务审批通过不等于真实支付/登记/Token成功，Unknown必须查询原不可逆执行。
- **M18（5项）**负责站内必要业务通知、补件提醒、邮件模板和失败重试；已发/已读/依法有效送达分开。
- **M19（6项）**负责SaaS权限、Instrument/Offering条款、资格和自动配售规则的版本、审批、生效及安全强制优先级，不建设任意可视化规则引擎。
- **M20（8项）**负责Tenant与敏感字段隔离、追加审计、金额/时间统一规则、原始外部证据、KYC最小访问、合法保留/退租交接、受控导出和安全事件。
- **M21（6项）**形成项目、投资者认购、资金/异常、配售登记/Token、存续收益等按权限只读报表；不另建法定登记、真实资金或Token账本。
- **S04-06批准当时进度**：S04-01～S04-06六批共**124/146唯一ID Step04 Approved（84.9%）**；当时剩余M08投资者门户11项、M03平台后台3项、M22外部服务适配8项，合计22项；此后S04-07已按DEC-025批准，S04-07已完成，S04-08已在DEC-026批准，S04-09已按DEC-027完成，待全量一致性审计审核。V1.0整体未Frozen，Step05字段PRD/Step06终审尚未完成。

**保持边界**：四份Frozen、既有DEC/SCOPE正文和DEC-017 193项版号原样保留；PR #6 Draft/Open/Unmerged，不授权UI/代码研发、资金/Token生产执行或上线。


## 18. Step04 S04-07已批准：Issuer独立投资者门户11项（2026-10-25）

**正式决策**：[DEC-025｜S04-07七项A](decisions/DEC-025-step04-s0407-issuer-investor-portal-approved.md)；**完整产品设计**：[S04-07 M08投资者门户批准设计](docs/03-product-prd/RWA-SaaS-Step-04-S04-07-Issuer-Investor-Portal-Approved-v0.1.md)；**逐ID权威**：[146项追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **门户和账户**：Issuer拥有M01-F009标准独立URL和基础品牌；M08支持投资者邮箱注册、依法可见Offering、风险与条款、KYC/资格补件、个人与机构代表账户。不是平台自营全球资产市场，跨Tenant隔离敏感数据。
- **认购支付**：M08展示合法Quote/签署和USDT/USDC指令；M10订单、M11真实收退款、M12额度及登记、M07 Token交付均保持独立权威。广播不等于实收，Token余额不等于法定权益。
- **钱包**：外部钱包及一种经安全审查的嵌入式钱包均纳入V1.0产品目标；资金来源地址、Token接收钱包、登录账户、投资者身份和法定持有人不同；具体供应商、密钥责任、Gas及恢复规则留Step05。
- **收益**：M08收益中心显示合法应付、实际注资、可Claim/未领、已实付及异常；M13负责收益事实，保留预注资Claim优先/合法Push或外部付款替代；普通消息不代表法定送达。
- **S04-07批准当时计数**：S04-01～07共**135/146 Approved（92.5%）**，当时余M03 SaaS运营后台3项＋M22外部服务接入8项＝**11项待审**；随后DEC-026批准M03三项，**现138/146 Approved、仅M22八项待审**。M08-F010个性化营销继续TBD、M15-F004高级白标仍V2。Step05字段级PRD、Step06全局V1冻结与UI研发均未完成。

**硬边界**：保持DEC-017版号、四份Frozen及历史DEC/SCOPE原文不变；PR #6 Draft/Open/Unmerged，真实资金或Token生产操作未批准。


## 19. Step04 S04-08已批准：SaaS平台运营后台M03三项（2026-10-25）

**正式决策**：[DEC-026｜S04-08-01～03全部A](decisions/DEC-026-step04-s0408-platform-operations-approved.md)；**完整产品设计**：[S04-08 M03平台运营后台批准设计](docs/03-product-prd/RWA-SaaS-Step-04-S04-08-Platform-Operations-Approved-v0.1.md)；**当前146项逐ID追踪权威**：[Step04追踪台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **M03-F001商业客户申请/KYB**：SaaS客户邮箱注册即受限14天Trial，正式商业付款前审核合法企业KYB；SaaS KYB不替代真实Issuer/Instrument发行合规审核。
- **M03-F002 Tenant受权开通、暂停与恢复**：M01仍是Tenant生命周期/商业授权权威，M03为P端操作入口；Trial到期只读及30天恢复与Paid存在真实发行义务时的必要保全分开。
- **M03-F005敏感资料受控访问**：默认不任意跨Tenant读取原始KYC；合法必要时按目的、最小范围、审批、限时授权及M20审计执行，不能用普通客服权限读取私钥。
- **版本及进度**：本批新增3个唯一ID，**S04-08批准时138/146 Approved（94.5%），M22 8项待审**；随后DEC-027批准M22全部8项，当前**146/146唯一功能逐ID Approved**，跨端审计仍Draft。M03-F003/F004仍V2、F006仍V3。S04-09及四端×11步×146项交叉核验尚未完成；Step05字段PRD、Step06整体V1 Frozen、UI研发/真实金融生产均未获授权。

**纪律**：DEC-017 193项正式ID/版本归属、历史DEC/SCOPE与四份Frozen正文不修改；PR #6继续Draft/Open/Unmerged。


## 20. Step04 S04-09已批准：M22外部合法服务适配8项＋全量一致性审计Draft（2026-10-25）

**本次正式决策**：[DEC-027｜S04-09-01～06六项全部A](decisions/DEC-027-step04-s0409-external-authority-services-approved.md)。**完整批准版功能设计**：[S04-09 M22 F001～F008](docs/03-product-prd/RWA-SaaS-Step-04-S04-09-External-Authority-Service-Adapters-Approved-v0.1.md)。**全量审核草案（尚未批准）**：[146项×P/I/V/X四端×11步审计Draft](docs/03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)。唯一ID权威：[Step04 146项台账](docs/03-product-prd/RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)。

- **Step04真实进度**：S04-01～09九批逐ID设计全部批准，**146/146 V1功能已获Approved、0待审**；跨端及11步一致性审计是新的**Draft**，尚未获产品负责人认可，也不表示V1整体冻结。
- **M22八项覆盖**：商业/投资者KYC/KYB/AML外部核验、稳定币收款监测、钱包节点和链上事件、按法律必要接入法定登记者、电子签署证据、Webhook安全与幂等、服务健康及异常升级、Tenant与Sandbox/生产凭证分离。**M22-F009智能多服务商切换仍V3.0**。
- **静态审计已完成基础对账**：193正式ID仍为V1 146/V2 22/V3 20/TBD 5；146项已批准唯一ID与主表完全对应，无重名/缺号/版号越界；11步均有V1功能覆盖，按四端责任标记全量146行。**13项建议待跟踪**（高9、中3、低1），包括首发法域/合法持款及登记责任、条件性集中募集V2跨版门、付款/退款/收益Claim合约方案、法律文件与Token地址绑定、Signer/钱包、Webhook Unknown、未领收益和退出义务等。具体解决优先级需你审核。
- **下一阶段不自动开始**：先审核Draft交叉审计的结论与13项待决门，再进入Step05字段级PRD。Step06另行决定V1.0整体Frozen/合法生产门。产品文档已审核不等于完成UI、代码、测试、实际服务商签约或真实金融执行。

**纪律**：四份Frozen及旧DEC/SCOPE正文不改，PR #6 Draft/Open/Unmerged，未授权UI、开发、真实资金/法定登记/Mint或链上生产。


## 21. 最新阶段衔接：DEC-028条件认可与Step05可视化审核（2026-10-25）

[DEC-028｜静态覆盖有条件认可及可视化审核方式](decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)记录用户“基本确认、按你的建议”，其范围仅为**146/146功能在P/I/V/X四端和11步业务主线的静态覆盖基本合理**。原[Step04完整交叉审计Draft](docs/03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md)仍为Draft，**X-01～X-13全部待跟踪**，不表示审计全文无条件通过或V1.0 Frozen。

**入驻时序已勘误**：历史[Step02 v0.3](docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)的L0/L1-A先KYB/付款再创建Tenant与正式DEC-019冲突；保留旧图原文，创建[Step02四端流程v0.4勘误Draft](docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-DEC019-Onboarding-Corrected-v0.4-Draft.md)作为现行入驻流程参考。正确顺序为**邮箱验证→立即开14天受限Trial Tenant→试用期间KYB→KYB通过后Standard合同/实际商业付款→在原Tenant升Paid**；试用到期只读并有30天恢复；正式Offering/真资金/Token依独立合法执行Gate。

**先图后字段的新审法**：已建立[Step05-01企业注册/Trial/KYB/订阅可视化PRD Draft](docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)，通过一张图＋四端页面交接表＋对象状态草案分段评审。后续逐段为发行→投资者合法披露、认购→登记Token、收益及退出、平台安全异常；每段经用户审核再进入详细字段/验收。Step05-01未批准，Step06 V1.0 Frozen、UI/开发及真实生产未批准，PR #6仍Draft/Open/Unmerged。


## 22. Step05-01细化产品决定已批准、字段/状态仍Draft（DEC-029，2026-10-25）

**本批明确批准**：[DEC-029｜Step05-01-R01～R03全部A](decisions/DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)。产品负责人决定：**R01**同一Tenant可保留合法试用草稿，但模拟付款/投资者/法定登记/Token/收益绝不自动变为生产事实；**R02**商业KYB未通过时不立即删除Tenant，按合法Trial/到期规则受限运营与适用复核，不绕过正式商业准入；**R03**商业实付已确认但Tenant开通失败时先核实原付款/执行，恢复原Tenant，绝不重复扣款或新建Tenant。

**开发与运营的现行阅读顺序**：①[Step05-01可视化v0.1历史Draft](docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)了解流程；②[字段级PRD v0.2 Draft](docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Field-PRD-Draft-v0.2.md)（8类实体、65个字段候选、四端页面/事件来源）；③[跨端状态异常规范v0.1 Draft](docs/03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-States-Exceptions-Draft-v0.1.md)（10类独立对象状态、10条迁移建议、15类异常及未来验收）。**只有DEC-029三项业务规则已获批**，字段名字/可空性、状态枚举、API、服务商、价格、时区/计费周期和测试全部尚未冻结，不可直接当已批准开发任务。

**Step05整体下一步**：产品负责人审核Step05-01字段/状态候选的少量关键决策门，明确真实商业资金、授权恢复与生产环境隔离的精确方案，再进入Step05-02资产/Offering发行与投资者端展示。Step04 146/146和DEC-017版号不变、13项跨端审计风险仍Open，V1整体未Frozen，PR #6 Draft/Open/Unmerged，不进入UI/开发/真实资金或Token执行。


## 23. Step05-01产品级PRD收口Approved、Step05-02发行到投资者披露可视化Draft（2026-10-25）

**最新正式DEC**：[DEC-030 Step05-01 R04～R07全部A](decisions/DEC-030-step05-01-r04-07-product-rule-closure-approved.md)。连同[DEC-029 R01～R03](decisions/DEC-029-step05-01-r01-03-trial-data-kyb-payment-recovery-approved.md)，**Step05-01七条产品级业务规则全部Approved**；其他历史DEC/Frozen原文不修改。

| 最新有效文档 | 实际批准范围 | 不得当作已冻结的内容 |
|---|---|---|
| [Step05-01 产品级详细PRD Approved v0.3](docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Product-PRD-Approved-v0.3.md) | 企业注册/受限Trial、KYB、合同/商业收费、Tenant商业权益，R01～R07产品行为、端侧职责及保护性异常 | 内含65项技术字段候选、数据库Schema、API、定价/税票、商户、法域及生产环境配置仍Draft |
| [Step05-01 跨端状态与异常规范 Approved v0.2](docs/03-product-prd/RWA-SaaS-Step-05-01-Cross-Lane-Product-States-Exceptions-Approved-v0.2.md) | 10类对象的产品级状态语义、R01～R07行为守卫、双状态展示、受权恢复、15项异常类型的业务保护 | 精确实现enum/迁移字段、自动重试算法、测试记录全部Draft/Not Executed |
| [Step05-02 Asset→Instrument→Offering→Token→投资者门户 可视化PRD Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md) | **下一场景待产品负责人审核**：跨端发行、法律证据、Token地址绑定与门户信息同步；R01～R04四项候选尚未批准 | Step05-02尚无正式Approved决策或产品冻结 |

R04计时按336小时受限Trial＋到期后720小时受限恢复，UTC实际时点判定、前端本地转换；R05 KYB补件沿原案、正式拒绝须有合法新证据/复核依据由有权人受理；R06同Tenant合法资产/Instrument/Offering草稿续用但正式发行前重核；R07付款已确认不等于Tenant权限已开通，需双状态展示及不重复收款的原Tenant恢复。**Step04仍146/146、13项审计门Open；V1.0整体未Frozen；PR #6继续Draft/Open/Unmerged；不进入UI/开发/真实资金Token生产。**


## 24. Step05-02产品级收口：Offering发行→投资者门户展示（DEC-031，2026-10-25）

**正式决定**：[DEC-031｜Step05-02-R01～R04全部A](decisions/DEC-031-step05-02-r01-04-offering-visibility-publishing-disclosure-versioning-approved.md)。本批只批准四项产品行为：**R01**依法授权披露与允许有效认购独立；**R02**Issuer在P-01～P-07必要合法条件按缺项/主责展示审核并由受权人明确执行发布；**R03**投资者详情先法定Instrument权益、收益风险/合法条款，再Token技术，A债权与B SPV权益不能误导；**R04**发行条件/法律文件/实际合约地址的重大变化保留旧版本/旧Quote与签署引用，依法处理在途影响和必要再确认。

**当前阅读入口**：[Step05-02产品级详细PRD Approved v0.2](docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)、[Step05-02跨端产品状态异常Approved v0.1](docs/03-product-prd/RWA-SaaS-Step-05-02-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)。历史[可视化Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-02-Issuer-Asset-Instrument-Offering-Token-Investor-Visibility-Visual-PRD-Draft-v0.1.md)原文保留。最新状态：**Step05-01七项＋Step05-02四项产品级规则Approved**，下游Step05-03投资者KYC→认购付款→配售登记/Token交付尚待分场景审核。

**必须提醒开发/运营**：Approved仅覆盖明确批准的产品流程、展示语义、权限/异常保护；精确字段和状态enum、真实合同/价格、各法域金融合法性、资金持有/退款及Token Signer技术控制、API、测试与UI均继续Draft/Not Executed。Step04 146/146、193版号146/22/20/TBD5、13项审计风险Open不变；四份Frozen及旧DEC/SCOPE未改，PR #6 Draft/Open/Unmerged，V1.0整体未Frozen，不进入UI或研发。


## 25. 当前Step05-03投资者购买到合法持仓审核已启动（2026-10-25）

**新草案**：[Step05-03投资者KYC至合法持仓可视化产品PRD Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-03-Investor-KYC-Subscription-Payment-Allocation-Register-Token-Visual-PRD-Draft-v0.1.md)。本轮只建立跨端使用场景和六组**待审批建议A**，**不生成DEC-032、不将Step05-03规则标记Approved**。

**五条必须分别保留真实状态的交易链**：M09投资者KYC/Offering专属资格和钱包身份映射→M10 Quote/签署/唯一订单与M12容量预留→M11真实USDT/USDC链收款最终性及认购匹配/受权退款→M12唯一合法配售与依法有效登记证据→M07经授权Mint及真实链Finality；M08仅展示本人订单/合法持仓/Token差异，不独立捏造资金或法律事实。已广播Tx≠已实付，实付≠配售，配售≠登记，Token余额≠合法权利，客户Paid≠证券发行许可。

**六项待产品负责人审核**：R01投资者资格与支付/接收钱包身份分离，R02报价签署订单预留的付款前Guard，R03真实支付最终性和少多付错链Unknown，R04独立配售/容量守卫，R05法定登记与Token交付分离，R06取消迟到账退款及四端多状态展示。草案附16类异常处理待审核，所有测试Not Executed。**已Approved文档保持Step05-01与02现行版，Step05-03仍Draft**，13项Step04审计风险Open、193版本归属不变、V1整体未Frozen，Frozen及历史DEC/SCOPE不改，PR #6 Draft/Open/Unmerged、无UI或研发或真实资金Token生产。


## 26. Step05-03认购→法定持仓已产品级Approved；Step05-04收益/退出可视化Draft（2026-10-25）

**正式批准**：[DEC-032](decisions/DEC-032-step05-03-r01-06-investor-subscription-legal-holdings-product-rules-approved.md)记录六项R01～R06全部A，补充意见无；核心原则为**资格/KYC/法定持有人/钱包分离、Quote与签署/订单/预留各自可追、真实资金M11最终性匹配、M12合法容量配售、法定名册和M07 Token真实交付独立确认、V端并列进度及有权异常/退款处理**。

**现行交付阅读顺序**：[Step05-03产品级PRD Approved v0.2](docs/03-product-prd/RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)、[Step05-03 P/I/V/X状态与异常规范 Approved v0.1](docs/03-product-prd/RWA-SaaS-Step-05-03-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)。原可视化Step05-03 v0.1为历史Draft，不代表现今六项仍待批；产品规则Approved不等于工程字段、API、合法实际收款、法域/登记、嵌入式钱包、资金/Signer/合约生产执行获准。16类异常和15项验收断言尚未测试，不能记录PASS。

**下一场景**：[Step05-04收益、合法分红/债权本息与到期退出可视化PRD Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)，六项新建议R01～R06目前**全部待用户审核，不生成DEC-033或Approved文件**。展示重点：RecordDate权益快照、A债权与B SPV股权分别处理、实际注资后Claim优先/合法Push替代、应付/已付/未领取区别、资金清偿/法定名册/Token处置三方核对。Step05-05/Step06尚未完成，DEC-017原193项V1 146/V2 22/V3 20/TBD5不变，Step04审计13项仍Open，四份Frozen/历史DEC/SCOPE不改，PR #6 Draft/Open/Unmerged，V1整体未Frozen、不启动UI/研发或真实金融生产。


## 27. 当前最新状态：DEC-033批准Step05-04，Step05-05平台全局管控仅Draft（2026-10-25）

**已批准产品行为**：[DEC-033 Step05-04-R01～R06全部A](decisions/DEC-033-step05-04-r01-06-post-issuance-yield-maturity-exit-product-approved.md)。分离存续义务、RecordDate权威权益快照、A债权与B SPV股权分红、本息应付批次与实际注资、依法Claim/Push实付、到期清偿/名册与Token合法退出。它只批准产品行为及业务守卫，**不批准实际付款方、法域、计算/税费规则、Signer/合约、Schema/API或任何生产执行**。

**开发与运营当前权威阅读入口**：[Step05-04产品级详细PRD Approved v0.2](docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)、[Step05-04跨端产品状态及异常规范 Approved v0.1](docs/03-product-prd/RWA-SaaS-Step-05-04-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md)。有11类独立业务状态、15种异常及15项未来验收断言，**测试Not Executed**；原[Step05-04可视化v0.1](docs/03-product-prd/RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Visual-PRD-Draft-v0.1.md)保留历史Draft，旧“六项待审核”仅是旧时点文字，不覆盖DEC-033。

**下一阶段待批准**：[Step05-05平台运营、工作流、权限、外部适配可视化Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)：六组新建议R01～R06**全部待审核**。包含P端商业权限及Tenant操作与Issuer真实金融权威分离、RBAC敏感信息、M17异常、M18通知、M19～M21规则/审计/报表、M22环境凭证与真实Provider最终性。**不创建DEC-034或提前将Step05-05标Approved**。

**治理**：Step04 146/146、DEC-017 193项版本V1 146/V2 22/V3 20/TBD5不变；DEC-028跨端静态审计13项仍Open、Step06整体V1需求冻结未批准；四份Frozen及旧DEC/SCOPE不改、PR #6 Draft/Open/Unmerged，无UI、代码/合约开发或真实资金Token生产授权。


## 28. 当前权威：Step05五场景29项产品规则Approved；Step06冻结前总审核Draft（2026-10-25）

**最新正式DEC**：[DEC-034｜Step05-05-R01～R06全部A](decisions/DEC-034-step05-05-r01-06-platform-global-controls-product-rules-approved.md)。它明确批准P后台商业和运营边界、跨端Tenant和敏感权限、M17原Intent异常恢复、M18投递/阅读/法定送达分离、M19/M20/M21规则审计/只读报表、M22第三方服务凭证环境与合法退租交接。产品业务规则Approved不能替代法定资金持管、钱包Signer和法律/技术安全许可。

| 读者应先看 | 最新当前权威 | 准确状态 |
|---|---|---|
| Step05-05本场景详细需求 | [产品级详细PRD Approved v0.2](docs/03-product-prd/RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Product-PRD-Approved-v0.2.md) | 仅R01～R06及已批Step04原则的业务行为Approved；实际技术字段/接口等仍Draft |
| Step05-05跨端状态 | [P/I/V/X状态与异常规范 Approved v0.1](docs/03-product-prd/RWA-SaaS-Step-05-05-Cross-Lane-Product-States-Exceptions-Approved-v0.1.md) | 已整理15项异常与15项未来验收断言，全部测试Not Executed |
| Step05五场景与11步主链 | [五场景总体一致性暨Step06冻结前审核 Draft v0.1](docs/03-product-prd/RWA-SaaS-Step-05-Five-Scenarios-Consistency-and-Step-06-Pre-Freeze-Audit-Draft-v0.1.md) | **Draft，不是整体Step05字段完成/Step06冻结批准**；含11步、四端、14组字段技术缺口 |
| DEC-028十三门 | [X-01～X-13逐项证据/Owner建议/决策门 Draft v0.1](docs/00-governance/RWA-SaaS-Step-06-X01-X13-Audit-Gate-Crosswalk-Draft-v0.1.md) | **High9/Medium3/Low1，13/13继续Open**；没有获准关闭任何风险 |

**开发/运营必须知道的缺口**：Step05-01的65项字段候选具体Schema/API仍Draft，Step05-02～05未提交全套字段/权限/接口契约；**11步第08步“M11募集款可释放余额、合法划拨/实际到账”虽在Step04覆盖，已有Step06-02专项Draft，仍需专业证据与字段级签收**。具体法域/Instrument、强制集中募集时M05/M10/M12四项V2版号条件复审、合法登记/实际资金持管/钱包Signer、Claim/Push、法律通知、真实测试均不可省略。

**最新状态覆盖历史材料**：原Step05-05可视化v0.1中的“六项未批准”仅为历史时点。本批仅新建DEC-034及其现行PRD/状态规格和Step06冻结前Draft，不修改四份Frozen、过去DEC/SCOPE及DEC-017原193功能版号（V1 146、V2 22、V3 20、TBD 5），Step04 146/146和DEC-028有条件认可不变，PR #6保持Draft/Open/Unmerged。**不进入UI、研发或任何真实金融/Token生产。**
