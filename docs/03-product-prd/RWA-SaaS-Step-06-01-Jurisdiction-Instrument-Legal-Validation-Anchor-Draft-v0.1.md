# RWA SaaS｜Step06-01 首发法域 × Instrument 合规验证锚点与证据矩阵（Draft v0.1）

> **2026-10-26｜Draft / Legal Research Planning Only / No Regulatory Conclusion**。依据[DEC-035 Step06-R01工作方法已Approved](../../decisions/DEC-035-step06-r01-r03-pre-freeze-workstream-method-approved.md)：先选择**一个拟首发法域×一种Instrument**作法律/运营可落地性验证锚点，但**本文件不选择任何具体法域、资产或发行工具**，也不构成法律意见、金融牌照或生产执行批准。X-01～X-13仍全部Open，V1.0未Frozen。

## 最新研究入口（2026-10-26，仅候选比较 Draft）

现已补充[Step06-01A：日本／ADGM／新加坡 × 私募Token化债权候选比较、监管依据与产品影响 Draft v0.1](RWA-SaaS-Step-06-01A-Jurisdiction-Instrument-Candidate-Comparison-Draft-v0.1.md)。其中A=ADGM、B=新加坡、C=日本是**待用户选择的研究方案**，不构成首发法域、Instrument、合规权利或实际执行方案确认。用户尚未作出 Step06-01A-R01 决策，J0/I0仍TBD；X-01～X-13仍全部Open。

## 一、验证锚点的目标与边界

- **目标**：用一个**可证据化的试点假设**反查全球标准化RWA SaaS的共同对象、可配置分叉和不得执行的法定Guard，使Step06有一个能验证的最小闭环，而不是将“适用全球”误当“全球合规”。
- **验证对象**：一组待定的 **候选发行活动主适用法域 J0 × 候选法律Instrument I0**，并必须记录发行人设立地、底层资产所在地、投资者居住/营销地、持款/登记地、结算链路、链与托管运营地等**其他法律连接点**。J0不代表其余连接点无需单独法律分析。
- **候选Instrument只用于比较，不能在本轮确定**：例如已有产品设计中的A类债权或B类SPV权益；具体证券/债权/公司法定性质须由适格法律责任方确认。技术Token不是Instrument合法类别。
- **不可变的产品基线**：P SaaS平台是技术/商业运营入口，不默认为发行人、支付托管方、法定登记者或Signer；I Issuer负责自己依法有权的发行决定；V投资者仅通过Issuer独立门户依法参与；X是依法有权执行的外部或Issuer自身指定主体。
- **关于V1发行方式**：DEC-017仅在依法适用时采用持续认购/基础配售。若特定J0×I0要求集中募集或法定批次分配，必须走X-02独立用户决策门，**不得把M05-F011、M10-F009、M12-F009/F010当前V2偷偷升V1**。

## 二、锚点填报卡（现在全部待决）

| 维度 | 必填调查值（占位，不是选择） | 哪个证据才能从Unknown变为可供审核 |
|---|---|---|
| J0 首发发行活动主适用法域 | **TBD（未选定）** | 候选理由：目标客户、可经营模式、法律评估安排、所涉监管活动与营销/发行边界 |
| I0 法律Instrument | **TBD（未选定）** | 合同/章程/发行条款、受益/债权/股权结构、法律关系和权益证明 |
| Asset / LegalIssuer / SPV / SaaS Tenant | **各主体均TBD** | 谁拥有资产、谁负债/发行、谁购买SaaS、SPV是否必要、控制与关联证明 |
| Investor 类别/所在辖区 | **TBD** | 合格/专业/零售资格、跨境推广与销售限制、信息披露、持续AML义务 |
| 募资发行方式 | **Unknown** | 持续认购与基础配售是否依法允许；窗口/起募/成功失败条件；是否触发X-02 |
| 真正资金持款/收款/退款/释放方 | **TBD** | 谁合法拥有或控制资金及钱包/账户、隔离条件、受限余额、提款批准/签名授权 |
| 法定持有人登记及变更效力 | **TBD** | Issuer依法自管还是需要适格外部登记；何时权益成立、转移、更正与争议 |
| Token与Signer合法执行 | **TBD** | Token与法定权利映射、合同签署/地址后绑定、资金与Mint等独立Signer责任 |
| 收益/本息、未领款和退出 | **TBD** | 债权A或SPV权益B适用的合法分配、税务与债务/权利终止证据 |
| 通知、KYC与投资者数据 | **TBD** | 合法披露/电子签署/法定送达、客户/代理、隐私与跨Tenant合法复用 |
| 法律评估责任与复核日期 | **未任命 / TBD** | 真实适格法律顾问及Issuer责任方、意见版本、适用前提、失效复核触发 |

**以上TBD绝不是新增193项功能TBD版号**；本表只表达法律验证输入未确定。

## 三、逐类法域验证Gate（建议核验，不是法律规则定稿）

| Gate | 必须证实的问题 | 与现有系统关系 | 可接受证据类型（由专业责任方判断） | 阻断策略 |
|---|---|---|---|---|
| **L01 / 权益和主体** | 何种法律工具，Issuer/SPV/资产权属及兑付责任由谁承担 | M04/M06/M12，05-02/03 | 法律结构图、合同/权属版本、专业意见 | 无有效法定权益基础不能进入真发行 |
| **L02 / 许可与销售** | 活动、目标投资者、可见与可买、营销/居住连接点是否可行 | M05/M08/M09，05-02/03 | 合法销售对象/披露/发行条件意见及适用前提 | 未确认Offering-specific Gate不得真销售 |
| **L03 / 募集模式** | 持续认购、基础配售是否适用；是否强制集中募集 | DEC-017、M05/M10/M12，X-02 | 书面适用性结论＋具体合同条款 | 如需集中募集，停在X-02独立变更审批；不调整193版号 |
| **L04 / 真实资金** | 收款、隔离/托管、退款、募集款释放与外部结算谁合法执行 | M11-F001～F013；**Step06-02专项**，X-01/03 | 持管主体、受限资金法定条件、审批权限/Signer及回执责任矩阵 | 未验证释放与资金持管不得放行真实出款 |
| **L05 / 合同与Token** | 文书何时生效、地址部署后绑定是否需附件或重签、法定持仓何时成立 | M06/M07/M12；X-04/05 | 有效文书/签名、地址版本及登记效力意见 | 不得以Mint或钱包余额代替登记和合同 |
| **L06 / 收益与退出** | 实付/债务清偿、RecordDate、未领款、税务及Token处置先后 | M13/M12/M07；X-09 | 合同或适用决议、分配与合法支付/清偿证据 | 未满足法定资金及权利条件不得宣称Paid/Terminated |
| **L07 / 身份/数据/送达** | KYC/AML、代理、跨Tenant隐私、正式法律通知及退租后义务 | M09/M18/M20/M01；X-08/10/11 | 合法处理依据、法定送达/留存及客户服务交接义务 | 不得把技术送达视为法律送达；不得非法复用原始KYC |

## 四、法律证据记录规则与结论状态（候选状态，不是enum）

每个Gate的记录建议包含：`AnchorCaseID`、`JurisdictionNexus`、`InstrumentVersion`、`ResponsibleLegalEntity`、`Question`、`SourceAuthorityOrOpinion`、`OpinionDate`、`EffectiveConditions`、`Assumptions`、`Reviewer`、`ExpiryOrChangeTrigger`、`AffectedFunctionIDs`、`AffectedStep05Rules`、`AffectedXGate`、`DecisionEscalation`。

- **Unknown**：未形成可靠来源/责任人；当前所有L01～L07均属此类。
- **ConditionallySupported（待证实条件）**：可列证据前提与限制，但在条件履行/专业核实之前不得放行。
- **NotSupported**：适格审查认为候选方式不能合法采用；应回到产品决策门考虑改变锚点或版本。
- **ReviewedForDecision**：材料可提交用户审批下一步方向；**不是监管许可或任何生产Go Live**。
- 法律适用连接点、Instrument或Issuer变动，应触发相关Gate复审，不能把旧法域结论无条件复制到新Tenant或Offering。

## 五、从锚点反推全球产品结构（只允许形成差异，不允许默认批准）

| 预计可保持共通的产品对象 | 必须有明确法域/Instrument条件化的变量 | 不得预置的真实执行承诺 |
|---|---|---|
| Tenant / LegalIssuer / Asset / InstrumentVersion / Offering / Investor / Order | 法律身份、合同权利、受众与发行Gate、签署与登记顺序 | SaaS不自动成为发行/受监管主体 |
| MoneyIntent / RestrictedFunds / ReleaseCase / TransferIntent / Evidence | 资金保管、法定冻结、退款、放款主体、Signer/受限钱包 | 平台后台不默认具有真实出款权限 |
| Register / Allocation / TokenMintIntent / HolderView | 登记法定效力、钱包控制、合法签署、Token交割条件 | Token链Finality不直接创造或清偿法定权利 |
| YieldEvent / PaymentBatch / Unclaimed / Exit | Debt A与SPV B差异、税费、付款人、RecordDate、合法清偿 | 不能将技术Claim Success等于清偿 |
| Notice / Audit / Access / Retention | 合规处理、法律送达、跨境存储与后续义务 | ProviderAccepted不等于法定送达 |

## 六、X审计门映射与待用户单独决定的问题

| 关联X门 | 本专项能提供的进展 | 为什么仍然Open |
|---|---|---|
| X-01 / X-02 | 给出首发J0×I0的法律责任与募集方式证据模板 | **尚未确定J0/I0、法律责任主体和适用性结论** |
| X-03 / X-04 / X-05 / X-07 | 给出收款/Token/Signer/合同绑定核验Gate | 无合法持款方案、真实密钥权责及文书生效意见 |
| X-08 / X-09 / X-10 / X-11 | 给出合规数据、收益、送达与服务连续性待评估项 | 缺实际法律合同、合法执行规则和交付验收 |
| X-06 / X-12 / X-13 | 给出法律结论与字段/接口/验收的引用方式 | 无工程契约、实测及正式读者签收 |

**下一轮只提请用户决定**：应以哪一个 **J0主法域×I0 Instrument类别**作为首份法律验证案例，以及采用哪位有权专业责任主体提供评估（可以先只批准候选研究，不视为实际发行批准）。具体主体未确定前，本Draft保留所有候选为Unknown。

**禁止事项**：不修改四份Frozen、历史DEC/SCOPE、DEC-017 193项主表，不关闭X-01～13，不冻结V1、不合并PR #6、不设计UI、不启动研发或真实资金/Token/Signer生产。
