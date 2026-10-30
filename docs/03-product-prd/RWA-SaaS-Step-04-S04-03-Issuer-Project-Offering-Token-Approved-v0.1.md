# RWA SaaS｜Step 04 S04-03：Issuer Project、Offering 与 Token 全部19项V1.0功能设计 v0.1

> **Current Approved — 2026-10-25（DEC-021：S04-03-01～07七项A）**。本文件记录M05-F001～F010（10项）及M07-F001～F009（9项）的Step04端侧功能、用户角色、逻辑页面组、操作、关键状态/异常与唯一事实主责。此前S04-01 16项、S04-02 14项已Approved，故当前**49/146已审，97/146待审**。本文件不是字段/API/正式UI、法域/合约/资金许可、验收执行或V1.0整体Frozen；PR #6保持Draft/Open/Unmerged。

**正式批准**：[DEC-021](../../decisions/DEC-021-step04-s0403-issuer-offering-token-approved.md)；**逐ID和版本权威**：[DEC-017 Approved的193主表](RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)；**业务基线**：[Frozen WF-04/05/11/18](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[SCOPE-168～175](../../decisions/SCOPE-168-175-batch03-project-offering-rules-principles.md)、[SCOPE-186～193](../../decisions/SCOPE-186-193-batch05-token-contracts-external-execution-principles.md)、[DEC-013](../../decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)、[11步核心闭环DEC-014](../../decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)、[S04-02已批设计](RWA-SaaS-Step-04-S04-02-Issuer-Asset-Instrument-Documents-Approved-v0.1.md)。

## 一、本批业务边界与端侧关系

- 直接衔接核心11步的**步骤04：发行项目/Offering条件、合约部署准备**，为后续步骤05～07投资者准入、认购真实付款、合法配售/登记及Token交付提供可追溯发行依据，并为步骤09～11本息/权益存续和Token处置提供版本及责任映射。
- **Project** 是发行与存续工作的容器，支持1:N Offering；**Offering** 是有独立价格/额度/资格/销售窗口/发布状态的一轮销售安排；**InstrumentVersion**（M04）是被发行法律权利依据；**TokenContractPlan/Execution**（M07）是相应链方案与真实链执行，不能代替法律权利、权威名册或真实资金。
- Issuer SaaS端 **I** 发起草稿、提交审批、查看跨模块进度。Issuer投资者门户 **V** 消费经M05授权发布的Offering并管理本人接收钱包/交付视图；平台后台 **P** 仅在受权范围技术管理、审计与风险支持；外部适格主体 **X** 按法域和合同承担资金、法定登记及Token签名/执行。
- SaaS企业14天Trial可模拟Project/Offering、私有预览、Token测试流程；完整KYB后Standard付费转正不代表真实合法发行。生产发布仍须额外的Instrument、法域、授权资金/Signer和登记前置。
- 本批只是M05/M07正式功能ID的端侧设计；M09/M10/M11/M12/M13/M17/M19/M20/M22作为依赖，**不因此获得Step04逐ID审核Approved**。

## 二、一级/二级逻辑功能、角色与页面组（非实际UI路由）

| 一级入口 | 二级页面组 | Issuer操作与其它端边界 | 覆盖功能 |
|---|---|---|---|
| 发行管理 | Project列表、新建、概览及任务 | 负责人建项目、成员按作用域查看；汇总但不覆盖各轮次状态 | M05-F001 |
| 发行管理 | Project关联资产及Offering轮次 | 选受控Asset/InstrumentVersion、管理轮次1:N | M05-F002/F003 |
| 发行管理 | Offering创建、发行条件及准入配置 | 发行量/价格、合法单位、持续购买窗口、Offering资格及限额 | M05-F004/F005/F006 |
| 发行管理 | 收款/Token/登记方案引用、发布检查 | 引用M11/M12/M07受权方案，显示按责任划分的阻断清单、审批与发布动作 | M05-F007/F008 |
| 发行管理 | Offering状态、在途销售/交割及变更 | 发布/暂停/停售与结算，受控价格/条款新版本和影响分析 | M05-F009/F010 |
| Token管理 | 发行链/标准/权益单位映射 | 引用合法Instrument、经批准发行链/合约方案 | M07-F001 |
| Token管理 | 合约版本、部署审批与回执 | 参数版本、签名授权、受控部署及实际链最终性 | M07-F002；M07-F008分权 |
| Token管理／投资者门户 | Token接收钱包 | V投资者绑定及证明合法接收钱包；I只查看必要许可状态 | M07-F003；M08钱包依赖 |
| Token管理 | Mint及链上交付执行 | 由获批准Allocation/登记条件及外部Signer执行、核验真实回执 | M07-F004/F005 |
| Token管理 | 配售、登记及Token差异 | 提供Token事实与差异；M12/实际登记主体保留其他独立权威 | M07-F006 |
| Token管理 | 限制、暂停、赎回及合法销毁 | 必要禁转、签名权限撤销、受权Burn/调整与历史留证 | M07-F007/F008/F009 |
| 共用待办/通知/安全 | 审批、异常任务、受控审计 | M17任务与M20审计；M22连接外部，不新建同名业务账本 | 上述功能依赖 |

## 三、角色与操作权限

| 角色 | 允许操作 | 禁止隐含权限 |
|---|---|---|
| Issuer企业管理员 | 设定团队及Project作用域，指定业务审批角色 | Tenant Admin不自动成为合法Issuer、资金控制方、登记机构或生产Signer |
| Issuer项目负责人/发行运营 | 建Project/Offering、编辑草稿、设置窗口、提交审核、查看已授权销售及在途进度 | 不绕开法域/额度/资格/法律文件/真实资金Gate |
| Issuer法务合规及发行审批人 | 复核适用Instrument/文件、法定发行条件、合约权限/发布审核或退回 | 业务审批不等于真实外部专业许可或链签名；敏感事项遵守职责分离 |
| Issuer财务 | 查看受权收款方案、待对账与募集情况、发起相关受权业务申请 | 不通过Offering界面自行改写M11实际收款/退款/出款 |
| Token方案/技术人员 | 创建合约方案、查看链配置/部署意图与状态、提出受权操作请求 | 不因职务获得生产私钥/合约无限管理权 |
| 投资者 | 只访问已获授权的Offering，管理本人合法接收钱包及查看交付状态 | 不能改变发行条件或跨Tenant访问内部资料 |
| SaaS平台运营 | 在最小权限内监控服务、处理风险与受权技术任务 | 不默认接管项目法定发行、客户资金或链Signer |
| 外部适格金融/登记/链执行方 | 在真实委托、法域及审批范围执行支付、法律登记或合约签名 | Provider回调/交易Hash不代替其他领域合法结果 |

## 四、M05 10项V1.0逐ID功能设计（S04-03-01～04）

| 正式ID与名称 | 具体功能、入口及主要操作 | 状态、守卫与关键异常 | 主责/跨模块依赖 |
|---|---|---|---|
| **M05-F001 Project 创建及项目工作空间** | Project列表/详情：受权创建、编辑项目、分配业务负责人、查询各Offering及存续任务 | Project Draft→Preparing→Active↔Suspended→Closing→Closed→Archived；一轮完成不自动关闭Project，未结义务阻断结束 | **M05 Project**；M02访问、M17待办、M13存续 |
| **M05-F002 Asset 与 Instrument 关联** | Project资产区：只引用M04 Asset/Instrument经受权审查的特定版本、适用主体及M06证明 | 已过期/不适用的版本不得被“绑定”即变为合法发行；后续修改触发Offering影响复核 | **M05 Project引用关系**；M04/M06各自主事实 |
| **M05-F003 Offering 创建与轮次关系** | Project详情→Offering：创建及管理独立轮次，查看各自条款、状态和在途义务 | Project 1:N Offering；Offering Closed/Completed与Project Closed分离，不自动扩展复杂高级发行策略 | **M05 Offering及轮次**；M12额度，M13存续 |
| **M05-F004 发行总量价格与精度** | Offering发行条件：设置拟发行总量、法律单位、基础价格及适用认购限制/费用，提交复核 | 不混淆债权名义本金、SPV股份、Token数量及USDT/USDC精度；M12权威容量与超发限制另行校验 | **M05销售条件版本**；M04权利、M12实际容量、M19规则 |
| **M05-F005 持续购买与开放窗口** | Offering销售窗口：依法允许时设置持续一级认购起止、开售/暂停/关闭规则及在途处理 | 单笔订单完成≠Offering完成；停售只禁止新单，不丢失已发生付款/预留/登记；实际法域强制集中募集需重审V1版号 | **M05销售窗口**；M10订单、M11收款、M12配售 |
| **M05-F006 Offering 资格和限额配置** | Offering资格设置：选择受权投资者类别、地域及单笔/持仓等适用限制并提交版本审批 | KYC Verified≠Offering Eligible；M09独立做资格决定；不得绕过必要锁定及Token受让限制 | **M05 Offering策略引用**；M09判定、M19规则 |
| **M05-F007 链币种及受权收款方案引用** | Offering收款/交付配置：引用获授权稳定币链/Token合约、实际合法收款/退款责任主体、Token与登记方案 | Issuer手填地址≠获许可收款；M05仅保留方案快照，不宣称实际收款/出款/登记/Mint完成 | **M05方案绑定**；M11资金、M12登记、M07链、M22外部 |
| **M05-F008 发布审核与前置检查** | Offering发布清单：展示商业授权、Instrument/文书、法域许可、额度、资格、合法收款、登记/Token和存续接任条件；提交审批后独立发布 | 不满足任何适用强制Gate不得Open；内部ApprovedNotPublished≠已经Published/Open；需逐项显示阻断原因与责任方 | **M05 Offering发布决策**；M04/M06/M09/M11/M12/M07/M13/M17/M19 |
| **M05-F009 发布暂停关闭和存续衔接** | Offering生命周期：受权发布/开售/暂停/恢复/停止新认购/结算中/完成，显示独立在途交割和存续摘要 | Open可存在已完成订单；ClosedForSubscriptions仍需处理真实迟到账/退款/登记/Token；单轮完成不结束合法存续义务 | **M05 Offering状态**；M10～13/M07提供独立事实 |
| **M05-F010 条款变更在途订单影响** | Offering条款变更：另存版本，显示旧Quote/合同、在途款项、配售/登记和持有权益的适用影响，提交审批并执行必要暂停/通知/重新确认等 | 不直接覆盖旧价、已经签约的权利或法定记录；何时重签/退款须依实际条款和法域判断 | **M05 Offering条款/影响决定**；M04/M06/M10/M11/M12/M19/M17 |

### M05状态原则：Frozen WF-04/WF-05

- **Project**：Draft → Preparing → Active ↔ Suspended → Closing → Closed → Archived，项目关闭必须检查各轮次和仍存续的责任。
- **Offering**：Draft → SubmittedForReview → ApprovedNotPublished → PublishedNotOpen → Open ↔ Paused → ClosedForSubscriptions → SettlementInProgress → Completed；NeedsChanges/Rejected/Cancelled是受控异常分支。
- 发布批准、实际公开、开放认购、投资者单笔已交割和Offering整轮完成为不同事实；当前英文词只作既有状态引用，不在本批冻结实现枚举或跳转细则。

### 发布前置检查（P-01～P-07）

| Gate | 关键核验 | 不满足时行为 |
|---|---|---|
| P-01 商业/组织权限 | M01付费商业授权、M02发行项目角色及主体资格 | 草稿可保留，不得真实Open |
| P-02 Instrument/文书与法律资格 | M04已审权利版本、M06专业成果及适用法定条件 | 标明具体缺项、必要专业或外部合法责任主体 |
| P-03 合法发行方式/容量 | M05销售方式及价格、M12权威容量、Instrument/公司批准 | 不允许超发或用持续认购绕过依法必须的集中募集 |
| P-04 投资者准入 | M09适用法域/类别/资格、签署和限制版本 | 仅向依法允许的投资者启用交易能力 |
| P-05 真实收款安排 | M11/M22合法币种链合约、受权收款/退款及对账责任 | 不构造可执行真实付款指令 |
| P-06 权威登记/Token | M12适用登记主体及顺序、M07合约/Signer/限制/环境授权 | 不得将合约部署或Mint单独当作合法交付 |
| P-07 存续与审计 | M13适用收益/偿付/披露能力、M17～M22必要异常及证据 | 必需义务无可行责任承接时阻断正式发行或依法补充方案 |

V1主要采用**依法适用的持续一级认购和基础配售**。**M05-F011集中募集/批次配售仍V2.0**，若首发法域/Instrument强制要求Batch，DEC-017 R-05规定必须在V1整体冻结前正式重审相关M05/M10/M12版号；本批绝不默改。M05-F012动态定价属V3.0。

## 五、M07 9项V1.0逐ID功能设计（S04-03-05～07）

| 正式ID与名称 | 具体功能、入口及主要操作 | 状态/异常守卫 | 主责/跨模块依赖 |
|---|---|---|---|
| **M07-F001 发行链与 Token 标准配置** | Token方案：Issuer受权人员选已经支持和审批的发行链、RWA Token标准与Instrument法律权益单位映射、精度及必要转让限制；保存受控版本 | 发行Token与支付USDT/USDC不同；Token份额与债权本金/SPV股数不天然相同；不宣称任意网络/标准已生产支持 | **M07 TokenContractPlan**；M04权利、M05Offering、M19规则 |
| **M07-F002 合约参数版本和部署批准** | 合约管理：准备受控模板参数/版本、受权审批、由真正Signer执行自动或半自动Factory部署，查询正式链上地址、代码/版本及结果证据 | 审批≠部署完成；网络/签名/参数或合约限制缺陷阻断生产；部署失败/Unknown不得无验证地重复不可逆动作 | **M07合约/部署意图与真实链事实**；X受权Signer、M17审批、M22节点 |
| **M07-F003 钱包接收地址登记与校验** | V投资者钱包入口绑定适用接收钱包、证明控制权，核验法律持有人/钱包/资格；I只读许可或异常摘要 | 付款来源、交易所提现地址、RWA Token接收钱包、法定权利人均分离；地址绑定≠法定登记 | **M07 Token接收地址/链合法交付守卫**；M08钱包体验、M09资格、M12法定登记 |
| **M07-F004 获批准 Mint 与交付** | Token交付任务：引用M12唯一获批Allocation、合法Token接收钱包、适用登记时序；有权Signer执行真实Mint及结果核验 | 不重复Mint、不超获配份额；登记是否前置依法Instrument决定，不能因Issuer按钮直接Mint | **M07 Mint意图/链上交付**；M12配售与名册，X签名 |
| **M07-F005 链上提交确认与 Unknown 查询** | 链上执行记录：显示待授权/已提交/确认中/最终确认/失败/Unknown；查询原Tx和受权恢复 | 广播/Provider返回不等于Finality；链重组或nonce冲突需复核；Unknown先查原意图，不盲目重Mint/Burn | **M07链交易执行状态**；M22链事件/查询，M17异常 |
| **M07-F006 Token 与登记配售核对** | Token交割对账：展示M07实际铸造/转交Token与M12配售/权威登记引用的差异，生成受权处理入口 | Token Mint成功≠法定权利登记；差异不得手动改绿；M12仍为合法配售/名册交付核验业务主责 | **M07 Token侧核对证据**；M12登记/配售，M17异常，M21报表 |
| **M07-F007 必要合约级转让限制** | 合约限制入口：配置及核对经批准的白名单、合法受让资格、锁定期、受控禁转与暂停规则 | V1不提供M14二级交易/撮合；即便直接链上transfer，也不能绕过Instrument必需的法律/合约限制 | **M07 Token合约强制限制**；M04权利、M09资格、M19规则 |
| **M07-F008 高风险密钥操作权限与暂停** | 受控高风险任务：部署、Mint/Burn、管理员权限、紧急暂停与撤权分别申请/审批/Signer执行，保留审计 | Tenant Admin、Issuer编辑、SaaS客服不天然控制私钥；测试生产严隔离，真实资产Signer责任待法域/服务商确认 | **M07链动作控制和受权事实**；M02分权、M17审批、M20审计、X密钥/Signer |
| **M07-F009 赎回销毁与授权调整** | 存续/Token处置：A债权到期合法清偿、B有真实公司授权回购/注销等需要时，受控发起Burn/冻结/合法更正并核验链结果 | Burn≠真实支付/法定权利终结；B不默认保本/随时赎回；支付、法定名册及Token变化必须各有证据且时序依法 | **M07 Token处置/链事实**；M13偿付/公司行动、M11实付、M12登记、X受权Signer |

### M07 状态与合法权威

- TokenContractPlan可有草稿/审核/批准待部署/真实已部署待验证/可用于受权发行/暂停或弃用的逻辑视图；这不是字段级枚举冻结。
- Frozen WF-11 TokenExecution：**NotAuthorized → Ready → Submitted → Confirming → Confirmed**，独立Failed/Unknown/NeedsReconciliation。
- 一笔投资者交易的**真实收款M11、获批准Allocation与权威登记M12、Token Mint/Finality M07、存续收益M13**必须分别留证。合法交付的先后条件由实际Instrument及法域决定，不统一预设“先Mint”或“先登记”。
- **M07-F009历史P1但已按DEC-013 CR-09/DEC-017归入V1.0**，属于必要合法退出/清偿的Token最低处置；M07-F010复杂多链/合约升级V3.0，不纳入本批。

## 六、跨端权威、共享能力与绝不可重复的业务账

| 业务事实 | 唯一业务主责 | 各端使用方式和边界 |
|---|---|---|
| 试用/Standard套餐/Tenant商业权限 | M01 | I检查商用能力，P受权审核；不成为法律发行许可 |
| 资产/Instrument法律权利条款 | M04、实际发行法律责任人 | M05仅引用明确版本；Token余额不成为法定股东名册 |
| 正式文件/专业成果/签署证据 | M06与实际外部专业法律主体 | M05引用，V展示M06批准文书；不由P客服批准专业法律结论 |
| Project/Offering销售安排与状态 | **M05** | I创建和受权发布，V只读展示合法Open内容，X不因收到请求即替代发行审批 |
| Offering投资者资格 | M09 | M05配置批准规则，M10在交易前复核；KYC不是Eligible |
| 报价/认购订单 | M10 | M05不另建成交单事实 |
| 资金真实到账、退款、募集款划拨 | M11与实际有权资金方 | M05只读资金和收款方案，不控制真款 |
| 唯一发行容量、配售及法定登记引用 | M12与实际法定登记方 | M07仅从获批结果Mint并核对Token事实 |
| Token合约/部署/Mint/Burn/Finality | **M07**与实际受权Signer | I发起受权申请，V显示本人交付状态，P受限技术支持，X合法执行 |
| 收益、到期、合法清偿/公司行动 | M13、实际义务/资金/公司主体 | M07条件性受权Token处置，不假定Burn完成债务偿还 |
| 跨模块待办、规则、审计与外部接入 | M17/M19/M20/M22各自独立 | 本批仅描述依赖；这些模块的Step04正式功能仍待审核 |

## 七、试用、异常与最小产品验收方向（Not Executed）

1. 14天Trial只允许草稿、私有门户和模拟Token方案；不得真实Open、生产Contract Factory部署、实收认购款或Mint。
2. 同Project多Offering有独立状态；单笔订单Completed、某轮OfferingClosed/Completed均不得自动关闭Project或全部法定义务。
3. 未通过法律Instrument/专业文件/许可、额度、资格、资金/登记/Signer任一适用强制Gate时，必须阻断Offering正式Open并显示实际责任和原因。
4. Offering暂停、停止新认购后，已发生真实支付、迟到账、退款、预留、配售、名册或Token仍要按独立法定流程处理，不删除不伪完成。
5. 对外已生效价格、法律权利/合同修改必须新版、审批及旧Quote/签署/付款/登记影响分析，不能静默改旧用户权利。
6. Token部署或Mint响应Unknown、链重组、Provider失败、nonce冲突时查询原意图/Tx/真实链结果，未经受权核查不得重复部署、Mint、Burn。
7. 投资者付款来源地址与RWA Token接收钱包不同；需要分别检查身份、资格、控制权、链和法定持有人关系。
8. 链上已Mint但登记Unknown或实际配售数量不足时不显示全部合法交割完成，不人工将差异改绿。
9. 即使没有M14二级交易入口，合约必需受让资格/锁定/禁转控制仍有效；SaaS客服不默认持有Signer生产密钥。
10. A债权清偿和B SPV依法回购/注销分别处理；Burn不代替资金实付或法定注销。

**以上为设计级测试方向，不是已执行PASS。** Step05另行确定字段、合法模型、真实提供商、时间精度、异常恢复、技术验收与UAT。

## 八、七项用户批准、计数与后续

| 审核号 | 审核结果 | 被覆盖的正式V1.0 ID |
|---|---|---|
| S04-03-01 | A | M05-F001、M05-F002、M05-F003 |
| S04-03-02 | A | M05-F004、M05-F005、M05-F006 |
| S04-03-03 | A | M05-F007、M05-F008 |
| S04-03-04 | A | M05-F009、M05-F010 |
| S04-03-05 | A | M07-F001、M07-F002 |
| S04-03-06 | A | M07-F003、M07-F004、M07-F005、M07-F006 |
| S04-03-07 | A | M07-F007、M07-F008、M07-F009 |
| **合计** | **7/7 A** | **19个唯一V1 ID** |

- [Step04 146项逐ID追踪台账](RWA-SaaS-Step-04-V1-146-Function-Terminal-Traceability-Register-v0.1.md)生效进度：16(S04-01)＋14(S04-02)＋19(S04-03)＝**49/146 Approved**；后续**97/146待审**。
- 当前S04-03没有批准M05-F011(V2)、M05-F012(V3)、M07-F010(V3)。**若首发Instrument依法必须集中募集，应在V1整体冻结前单独按DEC-017重审M05-F011及相关M10/M12版本**，不得默改193主表。
- 下一建议S04-04：Issuer投资者档案与适格、认购、支付及配售业务衔接；之后继续收益/存续、共享能力、独立投资者门户、平台后台、外部适格主体，最终核对146/146。
- **未批准**字段PRD、正式UI/代码、法域法律许可、第三方生产执行、真实资金/链操作或PR #6合并；四份Frozen及历史DEC/SCOPE正文不修改。

**最终状态：S04-03经DEC-021批准，19/19个正式V1功能已完成Step04级别分端设计；全项目累计49/146、余97，整体V1未Frozen。**
