# RWA SaaS｜Step06冻结前：DEC-028 X-01～X-13审计问题 × Step05五场景证据/缺口/责任对照（Draft v0.1）

> **2026-10-25｜Draft / Audit Only / No Issue Closure / No V1 Freeze**。本表逐项**复用[DEC-028](../../decisions/DEC-028-step04-cross-audit-conditional-acceptance-and-step05-visual-review.md)及[原13项清单](../03-product-prd/RWA-SaaS-Step-04-146-Functions-Four-Lanes-11-Steps-Cross-Audit-Draft-v0.1.md#4-风险差异与待决策门登记本次审计发现尚未获批)的X-01～X-13真实编号及主题**，并不是新增13项已签收决策。全部**Open**；下列Owner是审计**建议角色，不是已获人事授权的指派或法域律师意见**。当前Step05-01～05-05产品级R全部批准，不等于任何X项关闭。

## 2026-10-26 DEC-036后续审计解释（所有X状态不变）

[DEC-036 R04=A](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)调整了X门的**审查阶段归属**：通用字段/状态/权限/接口的PG产品设计**不再必须先选一个首发法域×Instrument**；Issuer对每项实际发行负责自身法律合规，平台自身实际涉足销售、订单路由、资金、私钥/Signer、数据等活动则须独立RG审查。**PG与RG是不同门，未做法律评估和真实测试不得打开生产金融动作**。

本表所列X-01～X-13原内容和Open状态**一律保留**（High9/Medium3/Low1），不因此改成Resolved/Low/NotApplicable；X-02若某实际客户需强制集中募集，V2四项仍须单独决定，未经批准不能变更DEC-017。当前工作转为[Step06 SaaS优先计划](RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md)和[第一批B01/B02字段Draft](../03-product-prd/RWA-SaaS-Step-06-04-Generic-SaaS-B01-B02-Field-States-Permissions-API-Draft-v0.1.md)；本表以下截至10-25的“先法律后字段”建议属于旧审计排序，不再作为现行强制前置。

## DEC-037新商业版本引入的风险持续性说明（不关任何X门）

按[DEC-037 Free永久Sandbox＋Standard商业付费](../../decisions/DEC-037-step06-r05-a-free-standard-permanent-sandbox-supersedes-trial-approved.md)，原Step05-01 14天/336小时和720小时恢复时限**被正式覆盖**，不再是Free能力开关。**X-10**原商业欠费/退租与已发行真实金融义务保护持续Open，且新模型还须验收Standard失效→Free Sandbox但真实旧义务仍依法查询/履约/交接；**X-06/X-07/X-13**及其他X门须核对Sandbox/Testnet/Production不能旁路真实Signer、钱、名册、购买权限、字段/技术及E2E测试；X-08跨Tenant KYB仍Open。**这不是新X编号或严重度调整，13/13仍Open**。

最新产品输入：[Step05-01现行产品PRD](../03-product-prd/RWA-SaaS-Step-05-01-Free-Standard-Onboarding-Product-PRD-Approved-v0.4.md)、[全模块能力矩阵Draft](../03-product-prd/RWA-SaaS-Step-06-Free-Standard-Capability-Entitlement-Matrix-Draft-v0.1.md)、[65行迁移审查Draft](../03-product-prd/RWA-SaaS-Step-06-06-B01-Free-Standard-Field-Migration-Review-Draft-v0.1.md)。客户发行合规及平台自身实际受监管活动RG不可因Free或Standard标记免除。

## 一、全量13门当前可读总览

| 原审计ID | 原始风险级别 | 原有未决门 | 已有Step05产品规则/事实承接（非闭环） | 仍缺的证据或决策，为什么不能Close | 建议主责角色（未正式任命） | 最低下一步交付证据 | 门类别 | 状态 |
|---|---|---|---|---|---|---|---|---|
| **X-01** | High | 法域/Instrument真实资金持管及法定登记者未确定 | 05-02 R02、05-03 R04/R05、05-05 R01；M11/M12/M22；DEC-022 C01、DEC-023 R01 | 已明确Issuer依法可自管/法域强制外部登记的条件性模式、SaaS非默认托管方。**未确定实际首发工具/法域与合法付款/名册主体**。 | 产品/合规+首发Instrument法律负责人、Issuer实际资金/登记责任方（建议） | 每个首发法域×Instrument×Issuer的法律责任矩阵、真实持款/募集款释放/登记模式和有权法律意见或有效依据 | Legal / Production blocker | Open |
| **X-02** | High | 依法必须集中募集时V1/V2原版本分配冲突 | 05-02 R02、05-03 R02/R04；DEC-017；M05-F011、M10-F009、M12-F009/F010 V2 | 现行V1默认合法适用的持续认购/基础配售；**未确认首发法域/Instrument能否合法采用该模式**。 | 产品负责人+首发金融法律顾问（建议） | 书面适用性判断；如必须集中募集，另提独立DEC重新审核相关四项V2版号，未经批准不得改193主表 | Conditional scope blocker before V1 freeze | Open |
| **X-03** | High | 认购收款、合法划拨、退款及收益Claim/Push具体执行架构未决定 | 05-03 R02～R04/R06、05-04 R04/R05、05-05 R03/R06；M11/M13/X | FinalMatched、受权退款、资金释放、真实注资/整批足额后Claim的产品Guard已明确。**具体合法资金方、合约/钱包/外部支付、签名、余额/释放判定尚未批准**。 | 资金产品/安全架构+Issuer合法资金方（建议） | 逐法域资金控制与支付架构图、实际资金主体和Signer矩阵、合法收款/划拨/退款/Claim安全审查及原意图/资金调账协议 | Legal / Security / Technical blocker | Open |
| **X-04** | High | 合约链地址与生效签署文书后绑定的字段与法律时序 | 05-02 R02/R04、05-03 R02；DEC-022 C02；M06/M07/M22-F005 | 已批准旧文书/Token地址/生效Offering不静默覆盖、按法域附件或必要重签。**链ID、地址、合约版本、文书引用/法律效力与签署人权限的字段与决策未定**。 | Issuer法律负责人/Token产品/技术架构（建议） | InstrumentVersion/DocumentVersion/Chain/ContractAddress绑定契约及合法时序/签署证据、重签触发、在途Order影响可测清单 | Legal / Field / Interface gate | Open |
| **X-05** | High | 法定登记/Token交付和钱包更换的最终合法持仓判定 | 05-03 R01/R04/R05/R06、05-04 R02/R06；M12/M07/M08/M22-F004 | 已批准名册与Token双权威、Issuer可合法自管条件性、接收钱包独立证明。**何时成为法定持有人、纠错/换钱包、链失败时权益保全未按Instrument定稿**。 | 证券法律负责人+M12/M07业务架构+Issuer登记责任人（建议） | 逐Instrument合法权益生效门、登记人和钱包控制证据、Token最终性与法律名册双向对账、换钱包和争议处置字段/测试 | Legal / Field / Delivery blocker | Open |
| **X-06** | High | Finality/Webhook/幂等/Unknown恢复缺可测字段和运行证据 | 05-03 R02/R03/R06、05-04 R04/R05、05-05 R03/R06；M07/M11/M17/M20/M22 | 产品行为已要求按原Intent查Unknown、重复Webhook去重和不同真实Tx独立计账。**具体唯一键/链重组阈值/接口错误码/真实测试仍缺**。 | 技术架构/区块链及安全负责人+QA（建议） | 领域事件ID/TxLog/Provider ID/Intent字段级契约、幂等与回放用例、链重组与未知状态恢复Sandbox和自动化验证 | Interface / Security / Executable-test blocker | Open |
| **X-07** | High | 嵌入式钱包、Signer密钥、Gas和托管法域 | 05-03 R01/R05、05-05 R01/R02/R06；M08-F011/M07-F008/M20-F008/M22-F003/F008 | 已批准支持受合法条件约束的外部与嵌入式钱包入口及P/Issuer/Signer分权。**具体合法安全的钱包实现、恢复/Gas/密钥控制与审计未定**。 | 安全负责人+钱包工程/法律合规+Issuer有权Signer（建议） | 至少一种安全合法嵌入式钱包架构选型、Signer/密钥生命周期/Gas授权及隔离、威胁模型/恢复/渗透与真实合规责任确认 | Legal / Security / Production blocker | Open |
| **X-08** | Medium | 投资者跨Tenant复用KYC、持续AML/制裁及敏感资料最小授权 | 05-03 R01、05-05 R02/R05、05-01 R05；M09/M03/M20/M22 | 已批准KYC与Offering Eligibility分离、跨Tenant非法共享禁止、受控限时敏感访问。**合法同意、有效期、撤销、代理与实际数据保留规则未字段化**。 | 隐私合规/KYC业务负责人+安全架构（建议） | 跨Issuer身份复用合法依据/撤回流程、强制制裁阻断与持续审核、字段权限矩阵与隐私留存/访问测试 | Privacy / Field gate | Open |
| **X-09** | High | 收益本金、未领、逾期、法定清偿及Burn验收矩阵未落地 | 05-04 R01～R06；05-03 R05；M13/M12/M07/M08 | 已批准预计/应付/已批/实际注资/Claim/Push实付/未领/逾期、名册/Burn独立。**逐Instrument实付消灭条件、未领款法定保管/税务/计算/测试未定**。 | M13资金收益负责人+Issuer合法付款义务方+法律/QA（建议） | A/B合同条件与记录日权益/计算/税费、实付/逾期/Unclaimed/退出与Burn分离的领域验收矩阵和合法付款证明 | Legal / Field / Settlement-test blocker | Open |
| **X-10** | Medium | Paid停服/退租时SaaS能力与已有金融义务交接不完整 | 05-01 R01/R07、05-04 R01、05-05 R01/R06；M01/M03/M13/M20 | 已批准Trial与已发行Paid分轨、真实持仓/收益不能删除且可依法查询。**实际数据导出期限/移交接收方/服务存续SLA/合同法域未定**。 | SaaS商业/法律/运营+Issuer交接责任人（建议） | Trial/Paid退出权限与仍存续义务分轨、数据保留/下载/客户移交协议、法定履约和投资者查询最小功能/测试 | Contract / Business-continuity gate | Open |
| **X-11** | Medium | M18邮件服务与M22外部适配ID范围归属待定 | 05-05 R04/R06；M18-F004/F005、M22-F001～F008 | 已批准M18通知投递与法定送达区分、M22跨Provider凭证/健康。**邮件SDK/发送重试/运维责任是否落M18直接实现或复用M22尚未明确**，不得偷偷扩张M22正式ID。 | 通知工程Owner+架构/安全/法务（建议） | 邮件发送/重试/回执/健康职责RACI与接口清单，明确M18最低实现和M22共用基础设施边界及法定送达专项 | Interface-ownership gate | Open |
| **X-12** | Low | 历史分批已Approved文档包含过去时点‘其他待审’字样 | 05-01～05-05现行批准文件/DEC-034及README/Authority最新索引 | 已建立最新状态导航与有效来源，新文件可覆盖历史时点表述。**历史Approved原文不得静默修改；开发交接仍应识别现行版本和证据差异**。 | 产品文档治理Owner/交付负责人（建议） | Current Authority与README文档优先级/历史清单、冻结前阅读路径人工签收与链接核验 | Documentation-reading gate | Open |
| **X-13** | High | 146项已批但字段级、API、安全/法域及实际测试、跨端交付仍缺 | 05-01～05-05全部；DEC-017/027/028 | 五场景**产品行为级**29项R已明确审批（7+4+6+6+6）；05-01有65项候选字段，但技术schema仍Draft；其余场景字段/API、独立状态/用例仍未签收。 | 产品总控+研发架构/QA/安全/法律及Issuer交接方（建议） | 146 ID→五场景→11步→四端→字段字典→枚举/权限矩阵→API/错误码/异常→可执行E2E/Sandbox→法域生产门→正式冻结签收追踪，实测无证据不标PASS | Step06 product freeze / Execution acceptance blocker | Open |

**强制约束**：任何X项不得因为表格引用了产品Approved文件便自动标Resolved/Closed。**High 9项、Medium 3项、Low 1项，13/13仍Open。** 其中X-02是**条件性范围/法域门**，不是默认把V2四项加入V1；X-12可通过清晰有效入口缓解阅读误解，但本轮同样不关闭原X项。

## 二、按五场景查审计编号（防止漏掉同一风险）

| Step05现行产品级批准场景 | 现有正式DEC | 审计重点关联X项 | 精确的剩余产品/技术/法律差异 |
|---|---|---|---|
| **05-01** SaaS企业邮箱/Trial/KYB/Standard/原Tenant Paid | DEC-029/030 | X-08、X-10、X-12、X-13 | 商业价格/期限法域、65条字段候选Schema、商用付款Provider与KYB数据保留/访问；336h/720h按DEC-030产品规则，历史自然日文字不可逆向覆盖 |
| **05-02** Asset/Instrument/文件/Offering/Token计划/Investor披露 | DEC-031 | X-01、X-02、X-04、X-12、X-13 | Instrument与法律效力、文书/链地址后绑定、P-01～07法域真实Gate、定向可见/API权限和历史Quote引用 |
| **05-03** Investor KYC→唯一订单→真钱→配售→法定名册→Token | DEC-032 | X-01、X-02、X-03、X-05、X-06、X-07、X-08、X-13 | 真正X资金/登记者、幂等/链最终性、原子预留/超售、钱包Signer、合法权益生效时序 |
| **05-04** RecordDate→收益/本息→注资→Claim/Push→退出 | DEC-033 | X-03、X-05、X-06、X-09、X-10、X-13 | 分配资金方、合同与税费/名册快照、实际Paid/未领/逾期、Burn/名册/债务法律清偿 |
| **05-05** P后台/任务/通知/规则/审计/报表/Provider | DEC-034 | X-06、X-07、X-08、X-10、X-11、X-12、X-13 | 高敏资源权限、邮件SDK归属、真实供应商/环境凭证、测试与事故恢复/退租交接 |

## 三、明确的冻结前核验规则（均只是建议，不是新DEC）

1. **法域生产阻断门（X-01/02/03/04/05/07/09）**：涉及首发具体Instrument、Issuer主体、证券/公司法律及真实资金Signer，必须由实际适格法律/金融/安全责任方提供可采信意见或条件。不能用通用全球化产品说明取代某地发行许可。X-02如证实强制集中募集，必须单独请用户审核版本调整，现行193项分配保持原状。
2. **字段与权限接口门（X-04/05/06/08/10/11/13）**：应交付每一核心领域对象的唯一ID、状态和触发/Guard、读写角色、法定版本与证据引用、外部API/事件错误码/去重/恢复协议、精度/时区及数据保留。不能仅因Step05业务语义Approved而以Draft字段要求直接编码生产。
3. **测试/持续运营门（X-06/07/09/10/13）**：真实或可评估Sandbox中需要证明Unknown、重复事件、钱包丢失、链重组、付款/名册/Burn冲突、Claim部分注资和退租义务。**本轮没有运行任何测试，Not Executed**。
4. **文档导航（X-12）**：继续使用README当前状态、Document Status Index、Authority Index读取现行有效DEC；旧Step04/原可视化Draft过往“未审批”描述为历史证据，未经用户指令不回写历史。
5. **治理**：所有未解决门保留Open；如需将问题从Open改为Resolved/Closed、将Step06 Draft提升Approved/Frozen、改变历史DEC或193项版本，须分别有明确用户决定和所需专业证据。**PR #6不合并，不开展UI/研发或真实金融链生产**。

## 四、用户审核时只应决定什么

建议以后按**“法律/Instrument先定→资金/Signer/法律登记方案→领域字段与四端权限/API→实际安全及场景测试→十三门闭环签收→Step06最终V1冻结”**分门审查。当前只提交阅读和批准顺序的**建议草稿**，不自动批准X-01～X-13的关闭，不虚构具名责任人、服务商、代码/测试、律师结论或生产权限。

当前事实：**Step04 146/146 V1 ID产品功能设计Approved；Step05五场景共29项R产品规则Approved（7+4+6+6+6）；Step06冻结前材料Draft；13项审计Open；DEC-017 193项版号不变，四份Frozen及历史DEC/SCOPE不改，PR #6 Draft/Open/Unmerged。**
