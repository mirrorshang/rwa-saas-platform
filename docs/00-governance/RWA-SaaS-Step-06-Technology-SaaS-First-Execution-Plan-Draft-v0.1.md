# RWA SaaS｜Step06 通用技术SaaS优先：字段级PRD、跨端一致性与V1冻结执行计划（Draft v0.1）

> **2026-10-26｜执行优先顺序依据[DEC-036 Step06-R04 A](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md) Approved；本文具体排期、文档与字段/状态/API工作包仍Draft。** 对DEC-035 R01作后续优先级调整：**无需先选择首发法域×Instrument，即可继续通用SaaS产品需求的设计与评审。** Issuer具体发行法律合规由该Issuer/有权专业机构负责；平台自身受监管活动与真实金融功能RG生产门独立审查。**不可推定软件上线或真实销售无需合法审查。**

## Step06-6.1 最新评审收口｜I端局部信息架构DEC-040

[DEC-040 I-R01～I-R06全部A（含I-R05多资产并行管理）](../../decisions/DEC-040-step06-issuer-i-r01-r06-information-architecture-multiasset-approved.md)已确认I端左侧一级导航＋顶部全局栏、首页业务总览与待办、Free/Standard统一工作台和生产授权隔离、企业设置归类、**以Project为业务中心管理多Asset类型、多资产、多并行Project/Offering**、按业务职能组织投资者/订单/配售/资金/Token/收益/报表，支持按资产/项目/轮次受权筛选；不得按资产类别拆顶级菜单。更新结果已同步[Step06-6.1四端页面地图](../03-product-prd/RWA-SaaS-Step-06-09-Four-Surface-IA-Page-Inventory-Draft-v0.1.md)、根README和权威索引。

**下步**：I-R07～I-R12二级导航/项目创建/Offering管理页面分组审核，随后B01→B02→B03～B05逐页PRD。**一Project同时关联多个底层Asset的条件和关联基数仍Draft**。现有I61/W14/V15/P14=104候选页面组未改、146项映射仍仅静态；V1整体Frozen、字段/API、UI/生产不因本次局部批准而获得授权；历史DEC/SCOPE/Frozen、193项版号及X01～13 Open/PR #6 Draft/Open/Unmerged不变。

## 最新产品设计方法接续（2026-10-26）：先四端页面清单，再逐页面PRD

**产品负责人最新要求**：①增加W官网（产品介绍、套餐Free/Standard、企业注册/订阅/进入I端入口）作为实际产品端；②不要再将系统字段或逻辑API当作主要产品经理交付物；③B01、B02各自完成**真正页面级详细产品PRD并审核**后再进入B03，随后B04/B05。这是现行工作顺序，后文旧版“先领域字段/API”的执行排序**降为辅助资料准备，不再作为阶段完成口径**。

- **Step06-6.1（当前）**：[W/I/V/P四端全局页面地图（104个候选页面组）Draft](../03-product-prd/RWA-SaaS-Step-06-09-Four-Surface-IA-Page-Inventory-Draft-v0.1.md)与[146项V1功能静态映射Draft](../03-product-prd/RWA-SaaS-Step-06-09A-V1-146-Function-to-Page-Coverage-Audit-Draft-v0.1.md)。必须先由产品负责人审核导航/范围/页面增删合并；104个页面组不是最后工程URL数。
- **Step06-6.2 B01**：W官网获客/注册/登录/I入口、I组织Free/Standard/KYB/订阅、P商业KYB/Tenant，逐页面PRD（中文内容、布局、展示/输入字段、校验、按钮、不同状态与操作、提示、权限、成功/失败流转、跨端联动、验收）；已有65行字段与其他逻辑Schema稿作为辅助，**不会再反复要求产品负责人审核`xxxRef`**。
- **Step06-6.3 B02**：I Asset、Instrument、Project、Offering、法律文书、Token及对应V端可见披露，逐页面完成和单独审核，原M04/M05/M06/M07 33项ID关联只用于检漏。
- **Step06-6.4～6.6 B03～B05**：V投资者认购/KYC/钱包、I真实资金和收益、P运营/共享功能，页面/交互/异常逐批审核。
- **Step06-6.7/6.8**：全146正式功能ID×11步四端页面、状态、权限、已批业务与UAT的双向审计；用户另行批准V1产品需求Frozen。原X法域/真实生产RG门仍独立；**官网新增营销CMS/CRM/客服新能力不能自动升V1**。
- **后续建议Step07/08**：高保真UI/交互原型、最终统一产品设计交付包（PRD+页面+交互+流程+验收+产品→开发交接），**不等于本次已批准新工程阶段**。

**现有文档状态**：DEC-036/037已批准部分业务规则继续有效；旧的Step06-07 B01系统字段和Step06-08 B02静态字段草案仍Draft且仅为辅助；尚未有任何已Approved的完整逐页面PRD。没有更改原Step04/05业务、任何历史DEC/SCOPE/Frozen、193正式ID或PR #6。X01～13仍全Open。

## 2026-10-26最新执行变更｜DEC-037 Step06-R05永久Free/Standard（商业规则Approved）

[DEC-037](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)已正式将商业产品从**14天Trial＋720h恢复**改为**永久免费Free（Sandbox覆盖11步）＋付费Standard（有条件Production-eligible）**。因此本计划B01中全部“试用倒计时、到期转只读、30天恢复”的旧陈述**仅属于历史材料，不是现行工作**。现行B01必须使用[Step05-01新版产品PRD v0.4](../03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)、[跨端状态v0.3](../03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Cross-Lane-States-Exceptions-Approved-v0.3.md)、[22模块能力矩阵Draft](../03-product-prd/RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)及[65行迁移映射Draft](../03-product-prd/RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)。原[Step06-05历史65行审计](../03-product-prd/RWA-SaaS-Step-06-05-B01-65-Field-Line-Crosswalk-Gap-Audit-Draft-v0.1.md)不被删除但336/720时限结论已由新DEC接续。

**当前优先次序调整**：①先收口Free/Standard商业权益与Sandbox/Production环境/配额、原Tenant升级及历史义务；②同步保留B02 Issuer/Offering，继续B03～B05；③跨端权限、状态、逻辑API和146功能ID×11步审计；④用户另行决定V1整体Frozen。**Free永久免费不等于无限免费资源或放开真实Token销售；Standard付费不等于真正法律/Signer/支付生产权限。**价格/配额/周期、测试网、迁移代码和QA仍Draft，RG独立未完成。X-01～13全部Open，原193版号不变。

## 当前执行进度｜B01详细PRD与B02 33个V1正式ID字段草案已建立（2026-10-26）

- **[Step06-07 B01 Free/Standard深度字段PRD](../03-product-prd/RWA-SaaS-Step-06-07-B01-Free-Standard-Domain-Field-State-Permission-API-PRD-Draft-v0.1.md)**：永久Free无时间限制、配额/模拟/Standard升级、已发行客户订阅失效保护，字段、权限、状态、逻辑API与待测UAT全部Draft；旧Trial336h/720h不得进入现行实现。
- **[Step06-08 B02正式V1 33ID静态逐项映射](../03-product-prd/RWA-SaaS-Step-06-08-B02-33-V1-Functions-Field-State-Permission-API-Crosswalk-Draft-v0.1.md)**：M04/M05/M06/M07合计33个ID各有候选字段及四端/逻辑接口/异常。**这不是33个功能的字段签收，只是覆盖率33/33的静态审计结果**。
- **下一批顺序**：B01配额/账期的少量高价值商业决策门（仍待决定），B02字段技术化、B03投资者/KYC/钱包/认购、B04资金收益退出、B05平台运维；146项×11步双向验收与独立产品Frozen提案。**产品PG与真实发行/平台RG分离，X01～13全Open。**

## 0. 前序产品设计已经具备的事实

- **Step01总体产品战略与4份Frozen原则**：适用全球的标准化多资产ToB技术SaaS方向；四份Frozen原文不改。
- **Step02**：11步四端流程，DEC-014主要业务主线Approved。
- **Step03**：DEC-017首次版本归属193项：**V1.0 146 / V2.0 22 / V3.0 20 / TBD 5**；不增减正式ID。
- **Step04**：146/146 V1项功能级Approved，非可执行代码或全字段批准。
- **Step05**：五场景29条产品行为Approved，**7+4+6+6+6**，非技术schema/API/法域及真实测试批准。
- **Step06审计现状**：DEC-028的X-01～X-13**High9/Medium3/Low1，13/13 Open**；已存在Step06-02募集款专项与Step06-03统一矩阵Draft，法域候选比较为**可选参考**而非必须先决。

## 一、已批准的新执行顺序与两类Gate

**先做产品、后审真实启用条件**，不是“完全不考虑产品所需法律/合规守卫”。通用字段保留JurisdictionRuleRef、LegalIssuer、InstrumentVersion、IssuerComplianceEvidence、AuthPolicy、ExternalActor、ExecutionPermission、ProductionEnablementGate等**候选数据能力**；实际法域取值和合法决议由具体Issuer及有权方提供，平台自身可能受监管的行为由另立RG Gate评估。

| 顺序 | 工作包 | 本轮唯一主要目标 | 交付物与验收口径 | 本次状态 |
|---|---|---|---|---|
| **S06-01 当前首要** | 146项V1通用业务对象与字段PRD | 五场景按实体、状态、来源及唯一权威补足字段/校验/必填/敏感级别/版本/异步证据、未知状态 | 领域分批字段字典 + ID/11步/端引用；技术类型和实际法域可标TBD但**必须注明谁可配置及Fail-Closed行为** | **Draft待完成** |
| **S06-02** | P/I/V/X权限、批准人/Signer分权 | 独立明确“平台技术人员≠Issuer发行审批人≠X资金签名/持管方”，组织/项目/本人/代理作用域和有权外部服务接入 | 角色×对象×读写批准、资金/敏感数据高权限审计、Tenant隔离矩阵；服务端授权候选 | **Draft待完成** |
| **S06-03** | 状态迁移、真实Money/Token/Legal Truth与逻辑API | 为每领域约束Unknown/Partial/幂等/补证/补核/重放、输入输出、版本和错误类别 | 领域状态迁移表、逻辑API/事件契约、异常恢复用例；真实API路径与实现需工程审 | **Draft待完成** |
| **S06-04** | 募集款第08步专项收口（与01～03并行） | 将M11-F012/F013抽象为Issuer申请/X按合法授权真实执行、P技术连接与只读证据，不绑定特定国家、银行/链 | 既有[Step06-02募集款专项](../03-product-prd/RWA-SaaS-Step-06-02-M11-Funds-Release-Settlement-Field-Cross-Lane-PRD-Draft-v0.1.md)增强适用Guard、Issuer配置、X接入、异常及测试断言 | **Draft已建立** |
| **S06-05** | 146ID×五场景×11步×P/I/V/X 双向验收 | 避免遗漏、重复、越权和版本越界；区分产品可验收与需真实发行条件事项 | 146项追踪总表（各ID与字段/状态/权限/接口/测试、依赖及Draft/Approved状态），冲突/阻断事项 | **待完成** |
| **S06-06** | V1.0产品冻结决策准备 | 审核产品规格完整性、所有合法/真实生产限制如何配置与禁用、X风险原样Open或单独审批的状态 | 产品缺口、残余风险、变更控制、产品冻结提案；**只有用户另行批准才能Frozen** | **未启动** |
| **RG（独立，不强迫作为S06-01的先决）** | 平台自身实际受监管活动与Issuer具体发行生产审查 | 针对实际国家、Issuer、发行、销售/撮合、资金托管、签名及数据处理核实法律/安全权限与可执行证据 | Issuer法律审核和平台活动责任分开评估，部署/功能开关/生产准入/外部持款人/链上实测；**不因PG完成自动启用真钱功能** | **未批准、未执行** |

**产品PG与生产RG关系**：S06-01～06只构建**可配置、可控制、可测试、在不确定时能阻断真实业务**的产品规格；不要求某个实际客户的债券/不动产Token发行首先取得法律意见才开始通用产品字段设计。**产品Draft字段/Guards未成熟时仍不可直接Frozen**。RG完成仍须单独实际法律/安全/运维与生产审批，且可能迫使未来客户使用不同的已规划版本能力。

### 2026-10-26已开始的首批字段工作

[Step06-04 通用SaaS B01商业Tenant/KYB/Trial/Standard × B02 Issuer/Asset/Instrument/Offering字段/状态/权限/逻辑API Draft v0.1](../03-product-prd/RWA-SaaS-Step-06-04-Generic-SaaS-B01-B02-Field-States-Permissions-API-Draft-v0.1.md)已建立，**属于字段草案首版、不等于B01 65字段复核已完成、不代表任何API/RBAC/真实生产批准**。下一步先完成B01逐65字段对照和B02全V1 ID逐项补齐，然后B03→B05并开展146项完整双向验收。

## 二、五场景字段收口批次与唯一责任

| 批次 | 对应场景 | 优先领域对象/字段组（候选，名称非工程定稿） | 必须解决的业务事实 |
|---|---|---|---|
| **B01** | 05-01 SaaS订阅/KYB | Tenant、Owner、EmailVerify、CommercialKYB、Trial/Subscription、PaymentProvider、AccessExpiry、ServiceSuspension | **M01 SaaS商业款**与M11发行认购款分离，Trial与实际金融义务分轨；既有65条候选字段需统一审 |
| **B02** | 05-02 发行准备 | LegalIssuer、Asset、InstrumentVersion、IssuerComplianceEvidence、ExternalLegalServiceRef、LegalDocumentVersion、OfferingRule、PublicationSnapshot、TokenPlan | Issuer提供发行声明与证据；系统版本/授权/受众Guard；**平台声明不等于监管背书** |
| **B03** | 05-03 投资者/订单/Token | Investor、Representative、OfferingEligibility、WalletController、Quote、Signature、Order、Reservation、PaymentIntent、Allocation、LegalRegisterRef、MintIntent | KYC≠Eligible；钱包≠法定持有人；M10订单、M11真钱、M12法定持有、M07链事实严格分离 |
| **B04** | 第08步及05-04收益/退出 | RestrictedFunds、ReleaseCase、Approval、TransferIntent、SettlementEvidence、RecordDate、DistributionDecision、PaymentBatch、Unclaimed、Discharge、BurnRef | **Issuer作业务与审批决定，X真实资金执行**；募集款≠分红款；Paid≠法律清偿 |
| **B05** | 05-05平台运营 | Task、Notification、PolicyVersion、AccessGrant、AuditProof、ReportSnapshot、ProviderConnection、ServiceEnablementGate | 平台管理技术与Tenant，不能借“支持工单、规则、报表、Provider ACK”改领域唯一事实 |

## 三、每个模块需要写明的最小字段/状态/权限/API规格（质量门）

- **数据与归属**：OfficialFunctionIDs、ScenarioID、FlowStep、Tenant/Issuer/Investor scope、OwnerDomain、ObjectID、ObjectVersion、ExternalEvidenceRef、Privacy/Retention、CreatedAt/LegalEffectiveAt/FinalizedAt。
- **字段**：字段说明/来源/必填条件/用户输入/只读/受权写入/敏感级别/可修改状态/合法版本和历史；金额使用精确数值，法域条件以配置/外部证明引用而非全球统一默认。
- **状态与Guard**：SourceState、Event、Actor、Eligibility/Authorization/Consent、GuardReason、TargetState、Unknown/Failed/Partial恢复；不可逆真金融动作需授权+独立实际主体。
- **权限**：P/I/V/X对每个敏感领域有 Read/Propose/Approve/Execute/Investigate/Export 的合法职责；P后台高权不得自动拥有Issuer真实资金/法定名册/Signer权限；V仅本人或合法代理视图。
- **接口/外部服务**：LogicalOperation、Input/Output contract Draft、API error categories、Idempotency by original Intent、Retry/Callback correlation、Provider source-of-truth、dispute reconciliation。
- **验收**：Normal path、Unknown、late/duplicate, wrong wallet/chain, partial, version change, suspended Tenant, illegal actor, missing evidence, forbidden irreversible action，每条可追溯到正式ID与页面/端；**只生成用例不冒充实际测试PASS**。
- **平台RG预警字段**：平台是否触碰销售营销、订单路由、收款或托管、投资者资产/私钥、实际付款指令或Token Signer。**这些是运营事实调查项目，不能靠免责声明或Issuer声明消除平台自身合规义务。**

## 四、优先级调整后，原法域与Instrument专项如何处理

- [Step06-01 法域×Instrument验证模板](../03-product-prd/RWA-SaaS-Step-06-01-Jurisdiction-Instrument-Legal-Validation-Anchor-Draft-v0.1.md)与[Step06-01A 日本/ADGM/新加坡候选比较](../03-product-prd/RWA-SaaS-Step-06-01A-Jurisdiction-Instrument-Candidate-Comparison-Draft-v0.1.md)均**保留为可选、非阻断的历史研究草案**，不改动其客观记录；若具体客户/平台行为需要实际启用再启用法域专业审查。
- DEC-035 R02/R03继续，且**R03字段审查是当前第一优先级**；产品负责人当前不必选择A/B/C监管案例，也无需“先挑房地产/债券”才可继续。
- 没有修改DEC-017四个既有V2编号：**M05-F011、M10-F009、M12-F009、M12-F010**。如果某具体客户的法定发行必须集中募集，则其所需能力要走另行版本/交付差异审核，不代表产品自动支持。

## 五、保留的13个审计门，按PG/RG处理（不是关门）

| 类别 | 主要对应X | 当前处理方式 |
|---|---|---|
| 通用产品字段、权限、接口与测试设计（PG） | X-04/05/06/08/10/11/12/13 | 先完成可配置及状态/证据接口设计；实际QA运行证据独立补充 |
| 具体Issuer发行合规/首发Instrument（RG） | X-01/02及X-04/05/09的特定司法结论 | 不阻断通用字段设计，实际客户发行/Token销售时必须核验 |
| 平台自身监管活动与真实资金/Signer/安全（RG并影响PG Guard） | X-03/06/07以及X-01/09/10 | 设计阶段保留阻断和授权，生产必须有实际责任方、技术安全和法律审查 |

**X-01～X-13仍13/13 Open（9 High/3 Medium/1 Low），本计划不调低优先级、不修改原风险ID或历史DEC。**

## 六、下一项执行工作（不要求用户补问题）

从现行[Step06-03对象/状态/权限/API矩阵](../03-product-prd/RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md)和Step05业务规则提取B01→B05产品字段；优先交付**B01 SaaS客户/Trial/KYB**、**B02 Issuer/Offering/法律证据**两批通用字段草案以及B01/B02最小状态/权限/逻辑API，再继续B03～B05；碰到真实金融依赖以Draft/Gate标注，**不预选发行法域或实际Signer**。向用户仅提交影响产品商业/法律责任、跨版本归属、关键资源权威或必要前置Guard的少量决定。

**最终状态**：Step06-R04=A的SaaS优先顺序已Approved；本计划是Draft路线/交付描述，不批字段、技术或生产；146/193版本、四份Frozen、所有历史DEC/SCOPE未变，13项X全Open，V1整体未Frozen，PR #6 Draft/Open/Unmerged。
