# RWA SaaS｜Step06-01A 首发验证锚点候选比较（日本／ADGM／新加坡 × 私募Token化债权）（Draft v0.1）

> **2026-10-26｜Research / Product Options Draft，未形成法律意见、未批准首发法域、Instrument、Issuer、真实资金方案或实际运营安排。** 本文件执行[DEC-035 Step06-R01方向批准](../../decisions/DEC-035-step06-r01-r03-pre-freeze-workstream-method-approved.md)和[Step06-01法域×Instrument证据矩阵](RWA-SaaS-Step-06-01-Jurisdiction-Instrument-Legal-Validation-Anchor-Draft-v0.1.md)，用于让产品负责人在三组**纸面验证案例**中确定优先研究对象。**J0/I0目前仍TBD，法域审核和真实合法性不能从本比较推导为已获批准。** DEC-028 X-01～13全部Open，V1.0整体未Frozen。

## 较新正式方向声明（2026-10-26）

根据[DEC-036 Step06-R04=A](../../decisions/DEC-036-step06-r04-a-technology-saas-product-first-and-regulated-activity-production-gate-approved.md)，本表的日本/ADGM/新加坡及债务工具只作为**可选、历史研究证据与未来Issuer生产启用评估素材**，其A/B/C/D不再是V1通用SaaS产品设计、字段PRD或产品冻结的前置审核题。后文「推荐先研究ADGM」「下一轮选一组」保留以体现当时Draft方案，**已不代表现行推进建议，也没有获批J0/I0**。现行优先级改为[Step06产品字段优先执行计划](../00-governance/RWA-SaaS-Step-06-Technology-SaaS-First-Execution-Plan-Draft-v0.1.md)；客户具体发行合规与平台自身实际受监管行为由独立生产RG门审查。13个X门不关闭。

## 一、评估范围与统一比较基准

为避免「三个法域×多种完全不同资产」带来混淆，第一轮**三个候选都暂用“非公开/定向发行、具明确本金和合同现金流的Token化债务证券”作可比假设**，用以覆盖Offering、投资者资格、认购款、配售、法定权益、Token、利息/本金及退出的V1闭环。

- 该假设**不等于三地的公司债、私募票据、SPV债务证券在法律上同质**，各地到底用哪种Instrument由专业法律团队核实。亦不设定“任何房地产收益权/普通借款都天然可转为证券Token”。
- 第一案例**原则上先以专业/受限投资者、无公开二级市场撮合、Issuer自己组织合法融资为研究边界**；本条只是可控验证假设，不表示三地都准许且不免除招揽/销售许可。投资者可见/资格仍按各法域适用条件控制。
- 不预选**USDC/USDT、链、收款合约、托管机构、Signer、Token协议、法律登记方式或收益支付方式**；实际认购资金如何合法接收/退款/释放必须独立法律＋技术＋安全核验。
- 统一产品角色P/I/V/X：P SaaS技术服务方不自动获得证券发行、金融销售、资金保管、法定登记或Signer资格；I买SaaS的Issuer不自动等于法律发行人；X可能是依法有资格的Issuer本人或第三方。
- 即使选J0主适用法域，**Issuer设立地、资产地点、销售及投资者居住辖区、持款/登记/结算和平台实际经营地点**仍分别触发独立适用性审核。全球标准化＝有法域配置与依法阻断机制，不代表一个许可可全球发行。

## 二、三组候选的真实监管资料（事实与产品推断分离）

| 案例 | 可核的监管事实（官方来源） | 产品设计提示（推断，不是法律结论） | 未决法域Gate |
|---|---|---|---|
| **C1 日本 × Token化公司债/私募债权** | 日本金融厅(FSA)对**公司债、股票等第一项证券**及**电子记录转移权利**有区分说明，且公司债等即使变为链上可转Token也适用金融商品交易法的销售/中介、披露规则；2026-07更新的FSA FinTech FAQ可直接追踪 | 适合作为严格的证券类别、专业受众、合同/Token与服务商职责验证；需要独立明确证券销售活动由谁合法承担 | 私募路径/投资者对象与人数/广告限制、Issuer自身行为与中介是否受规管、是否可连续发行、资金持管、法定登记人与Token权益生效点、稳定币付款、跨境销售 |
| **C2 ADGM（阿布扎比国际金融中心）× Digital Debenture/私募债务证券** | ADGM FSRA设有独立**数字证券发行与活动指引**。其2020年数字证券活动指引描述了证券发售、公开说明书与条件性豁免发售；2024年招股书指引和ADGM现行规则/相关更新仍需进一步复核。**ADGM不等于阿联酋全国制度，也不等于DIFC** | 候选适合验证“证券Token发行 + Exempt Offer条件性Gate + 专业投资者 + 合法资金方/名册与Token分离”的产品架构；也是中东方向的一个具体辖区 | 是否满足现行Exempt Offer规则、FSRA对数字证券属性/申报程序要求、筹资与分销牌照、独立持款及出款职责、Token与法定债务人登记、跨境受众和付款币种 |
| **C3 新加坡 × Token化债券/私募债务证券** | 新加坡证券与期货法(SFA)有私募、小额发售、机构和认可投资者等**附条件规则**；MAS 2025年Project Guardian支持Token化债券等金融产品研究和固定收益发行/结算框架。MAS在2025-06说明**仅面向境外客户提供部分数字Token金融服务**同样可能触发牌照要求 | 候选适合验证固定收益发行、合规分销、法定登记/托管与高可复用数据对象；Project Guardian/行业框架不是个别Issuer或SaaS的生产牌照 | SFA私募/豁免具体对象与营销/转售限制、CMS/受监管行为划分、是否连续认购、合法资金与交割、跨境SaaS角色及DTSP适用、投资者法定登记与Token |

**严格证据界限**：上述仅说明有法规/监管资料可以调查，**不证明在任一地可以采用我们的既定“持续认购＋基础配售＋稳定币真钱付款”的V1流程**；尤其不能自动假设募资款可由智能合约自由提现。**三组案例的L01～L07尚未实际专业审查，均Unknown/Open。**

## 三、同一评估维度下的产品取舍（定性判断，不做伪精确打分）

| 维度 | C1 日本 | C2 ADGM | C3 新加坡 |
|---|---|---|---|
| 对现有产品的验证重点 | 不同证券法律类别、发行/销售角色、真实持有人/权利生效、严谨销售边界 | Token证券发行、发行文书、条件性豁免发售、Issuer/P技术方/合法持款方分离 | 私募/受众精细规则、固定收益生命周期、结算和跨境SaaS活动界线 |
| 与“标准化全球ToB SaaS”的学习价值 | 检验产品对高法规粒度配置的容纳能力 | 检验中东国际金融中心下的Issuer工作台标准业务对象 | 检验Institutional/Fixed-Income数据、事件和法定结算契约 |
| 对当前V1连续认购的兼容性 | **Unknown，必须法律判断** | **Unknown，必须法律判断** | **Unknown，必须法律判断** |
| 私募/发售豁免能否直接套用 | **不能推定；依具体条款** | **不能推定；现行FSRA规则与条件逐项核验** | **不能推定；SFA适用限制和豁免条件逐项核验** |
| SaaS平台能否自己募集/持款/托管/签名 | **未批准；按实际活动及持有人法律责任核验** | **未批准；按FSRA/有关支付与持管规则核验** | **未批准；按MAS/SFA/FSMA/PSA等实际活动核验** |
| 收益/本金/名册/Token合法清偿 | 逐Instrument合同/证据独立确定 | 逐Instrument合同/证据独立确定 | 逐Instrument合同/证据独立确定 |
| 实际合规成本、启动时间、可获得客户、是否更容易获批 | **无可信项目特定数据，待商业/法律访谈** | **无可信项目特定数据，待商业/法律访谈** | **无可信项目特定数据，待商业/法律访谈** |

## 四、三个方案对已Approved 11步业务链的主要条件影响

| 现有业务环节（不改获批规则） | C1/2/3都必须回答的法定或产品问题 | 需要承接的产品字段/Guard |
|---|---|---|
| Step01～03 企业SaaS/KYB/发行合法主体 | 谁买SaaS、谁发行法律债务、谁获得监管权限、谁对文件真实性负责 | TenantID ≠ LegalIssuerID；Issuer身份、授权代表、InstrumentVersion、法律评估证据 |
| Step04 资产/文书/Offering公开范围 | 是否可定向发行/招揽、是否使用豁免、受众与营销地点限制、法定文件/Token地址绑定 | OfferingMode、AudienceRule、DisclosureVersion、Contract/Chain Binding、EligibilityGuard |
| Step05～06 投资者/订单/真实收款 | 哪些投资者可以买；是否可以持续接受订单；真实认购款可否稳定币支付、由谁收/退 | KYC和OfferingEligible分开、Quote/Signature、唯一Order/Reservation、M11 FinalMatched及X证据 |
| Step07 配售、法定登记与Token | 谁对法律债权名册有权力；什么时候权益成立；与Mint法律时序为何 | Allocation、LegalRegisterEvidence、EffectiveAt、TokenIntent和链Finality分别记录 |
| **Step08 募集款释放/实际划拨** | 是否受托管、达标/募资成功、退款/争议限制、独立放款授权、真实出款/到账 | [M11-F012/F013专项Draft](RWA-SaaS-Step-06-02-M11-Funds-Release-Settlement-Field-Cross-Lane-PRD-Draft-v0.1.md)的受限余额、Eligible、Approval、TransferIntent、Unknown/Partial/Settled |
| Step09～11 利息/本息、到期和依法退出 | 谁欠款/付款，税费、到期条件、未领款及实付清偿是否先于登记变化/Burn | M13资金真值、M12法定权利、M07链事件各自独立；Instrument合同版本/法定清偿证据 |

**特别需要触发X-02的条件**：任何候选若经适格法律意见确认**必须集中募集或法定批次配售**，产品负责人必须另审 DEC-017 对 `M05-F011`、`M10-F009`、`M12-F009`、`M12-F010` 四项原V2的交付归属；**目前绝不调整V1 146/V2 22/V3 20/TBD 5**。

## 五、建议的研究优先顺序（只有工作建议，无首发决定）

**推荐纸面法律适用性核验顺序：C2 ADGM → C3 新加坡 → C1 日本**，*前提是假设最初优先检验中东国际金融中心下的专业投资者Token化债务发行*。理由不是“ADGM最易合规/成本最低”，而是它具备明确的数字证券发行/活动官方指引，可较早帮助暴露M05发行、M11受限募集款、M12名册、M07链执行间的业务责任差异。

**若实际首批发行客户、投资者和法律顾问主要在日本，则应把C1直接移为第一**；若目标是对接已具备合规服务商的机构级固定收益/代币化行业标准，则可优先C3。上述依赖尚未具备商业证据，因此**研究顺序不是商业落地排序，更不是任何法域监管可行性的高低排名**。

**产品负责人一次仅需选一组作为“第一份研究锚点”，不需要现在承诺落地该国家或放弃全球化。** 不应把这份选择理解为“公司一定在那个地区运营”或“首发只做债权资产”。

## 六、下一轮要获取的7类可审证据（目前均未完成）

| 证据编号 | 需要询问的实际问题 | 与原风险 |
|---|---|---|
| EV-01 | 法定Issuer的结构与债务债权的有效合同/投资者权利证据、是否允许Token对应和名册效力 | X-01/X-04/X-05 |
| EV-02 | 是否可按V1持续认购＋基础配售，发行/招揽/豁免/专业受众条件具体是什么，跨境如何限制 | X-02/X-08 |
| EV-03 | 真正的收款、持有、退款、分批释放、受益方、独立批准及Signer由谁合法执行 | X-01/X-03/X-07 |
| EV-04 | 合法文书签署和Token合约/链地址的后绑定，若版本或地址变化需重新签署吗 | X-04/X-06 |
| EV-05 | 投资者KYC/Wallet/名册与Token生命周期，若Mint/登记异步或失败合法持仓如何认定 | X-05/X-06/X-08 |
| EV-06 | 利息、RecordDate、本金还款、逾期、未领、债务消灭和Burn/名册更改合法时序 | X-09/X-10 |
| EV-07 | P SaaS服务/外部合规机构的实际牌照与责任矩阵、M18/22邮件/技术外包与通知 | X-07/X-10/X-11/X-13 |

收集需保留`EvidenceSourceURL/Date`、`RegulationVersion`、`LegalReviewer`（尚未任命）、`InstrumentHypothesis`、`JurisdictionNexus`、`Scope/Assumptions`、`UnresolvedDispute`和受影响功能ID。**规章链接是研究线索，未取得可据以执行的专业意见或真实发行授权。**

## 七、主要官方证据索引及时间局限（非法律意见）

| 来源/发布方 | 版本或观察时间 | 能支持的主张 | 绝不能据此推断 |
|---|---|---|---|
| [日本FSA FIEA金融工具分类与主体注册参考](https://www.fsa.go.jp/en/policy/marketentry/guidebook/reference1.html) | 查询于2026-10-26 | 公司债及电子记录转移权利在不同证券分类下 | 具体私募发行豁免及发行客户无需注册 |
| [日本FSA FinTech Support Desk FAQ](https://www.fsa.go.jp/en/news/2018/20180717.html) | 网页注明2026-07-13更新，2026-10-26查询 | Token化证券仍可能适用FIEA发行/销售/中介和披露义务 | 用链上Token取代证券和投资者法定义务 |
| [ADGM官方数字证券指引列表](https://www.adgm.com/legal-framework/guidance-and-policy-statements) | 2026-10-26查询；数字证券专门指引页面注明2020年发布 | FSRA有数字证券发行与活动的正式监管指引 | 专项指引必然等于2026全部最新生效规则 |
| [ADGM FSRA Guidance – Digital Securities Activities](https://www.adgm.com/documents/legal-framework/guidance-and-policy/fsra/guidance-on-regulation-of-digital-securities-activities-in-adgm.pdf) | 指引版本VER02.240220，需核现行FSMR/MKT | 官方指引以条件性豁免发售、数字证券发售/交易/结算及有权法律顾问说明合规要求 | 只要是私募就自动无需监管文件/许可、任何数字资产都是数字证券 |
| [ADGM FSRA Listing Authority](https://www.adgm.com/financial-services-regulatory-authority/listing-authority) | 2026-10-26查询 | Prospectus审查、证券挂牌与披露监管的真实职责 | SaaS客户或平台自动成为获准发行/持款者 |
| [新加坡Securities and Futures Act (SFA)](https://sso.agc.gov.sg/Act/SFA2001) | 官方现行法网站检索，2026-10-26查询；个别条款仍需核适用版本 | 272A/272B及274/275等存在不同有条件发售类别 | “少于某人数”单一条件足以满足全部监管豁免 |
| [MAS Project Guardian](https://www.mas.gov.sg/schemes-and-initiatives/project-guardian) | 网页日期2025-11-12，2026-10-26查询 | Token化债券、固定收益、DVP与结算等有监管推动的行业研究 | 任何参与者自动取得发行/募资/资金持管许可 |
| [MAS 2025 Digital Token Service Providers说明](https://www.mas.gov.sg/news/media-releases/2025/mas-clarifies-regulatory-regime-for-digital-token-service-providers) | 2025-06-06发布 | 仅服务境外客户的部分数字Token服务活动也可能受监管，且是否需许可依实际活动 | 面向海外客户的全球SaaS必然无许可义务 |

## 八、只提交一个实际产品方向问题（**尚未获用户批准**）

**Step06-01A-R01：批准哪一组进入下一步“单法域×单Instrument法域责任与资金流程纸面适用性核验”？**

- **A（建议）**：C2 ADGM × 条件性私募Token化债务证券。只批准作为研究案例，不认定可合法上线。
- **B**：C3 新加坡 × 条件性私募Token化债务证券。
- **C**：C1 日本 × 条件性私募Token化公司债/债务证券。
- **D**：暂不选，以三组候选的目标客户/合作法律机构可获得性访谈继续缩小范围。

**另一个未来Gate：** 若用户明确决定真实首发资产必须为SPV权益而不是债权，需要更改比较基准、独立提交产品差异；**当前不请求这个决定，也不假设A/B产品形态被冻结。**

**批准上限**：即使用户选择A/B/C，也只把一个“研究锚点”从Candidate变为Approved-For-Research，不等于J0/I0合法性Approved、不是项目必发该法域/该Instrument；所有法域/技术/资金/Signer/API仍Draft，DEC-028 13/13 Open，V1整体未Frozen，PR #6 Draft/Open/Unmerged；四份Frozen、历史DEC/SCOPE和193版号不变。
