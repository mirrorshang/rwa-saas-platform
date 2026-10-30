# RWA SaaS｜样本 B：SPV 股份与实体权益型 Instrument 产品规则、登记及存续验证 v0.1

> **Product Scenario — SCOPE-134～SCOPE-142 的样本 B 产品验证原则已获 Approved；具体法律效力、功能实现及测试仍 Draft/TBD。** 产品负责人 2026-10-22 明确全部同意，参见[正式决策](../../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md)。B-T01～T16 均为 Not Executed，不能代表 SPV 合法设立、法定股东资格、实际 Token 化股权生产就绪、真实资金/Token 测试或 Issuer V1 交付冻结。
>
> 依据：[SCOPE-096～100 参考 Instrument 已选样](../../decisions/SCOPE-096-100-reference-instrument-validation-selection.md)、[SCOPE-101～108 A～E 权利家族](../../decisions/SCOPE-101-108-instrument-families-and-extensibility.md)、[已批准 A 债权完整业务规则](../../decisions/SCOPE-117-125-debt-instrument-A-business-validation-principles.md)、[SCOPE-126～133 A1 专项规则](../../decisions/SCOPE-126-133-debt-A1-coupon-maturity-exception-principles.md)、[187 项 A/B 功能验证底表](RWA-SaaS-Reference-Instrument-AB-187-Function-Validation-Matrix-v0.1.md)、[SCOPE-078～085 条件性 P1](../../decisions/SCOPE-078-085-conditional-p1-v1-baseline-principles.md)、[冻结第 04 份流程](../04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)、[ARCH-001](../../decisions/ARCH-001-api-first-unified-business-core.md)。

## 一、样本 B 权利结构及不可混淆事项

B 假设为一个**依法成立的项目公司或特殊目的实体（SPV）**通过经批准的发行方式，向适格投资者发行股份或其他类似实体权益。底层资产可为房地产、能源设施等，但**持有 SPV 的权益不自动等于对底层物业/实物资产享有直接物权**；法律实体、股份/成员权益形式、投票权、分配权、转让限制与法定持有人记录必须取决于具体法域与组织文件。

| 领域 | 需求级原则 | 不得作出的错误推断 |
|---|---|---|
| **Asset** | SPV/项目公司实际持有或控制的标的与对应文件、负债和资产风险 | 投资者持 Token 就直接拥有该资产 |
| **Instrument** | 股份类别/成员权益类别、面值与溢价（适用时）、分配/投票/清算权、优先级、不可转让约束 | 所有名为“权益”的 Token 都是普通股或天然享有表决权 |
| **Offering** | 发行主体授权、资本额度及类别、受让资格、优先认购权（如适用）、价格/数量/签署与支付 | Issuer SaaS 可未经公司与法定批准自动增发或稀释 |
| **Legal Register** | 适用公司法/信托/会员名册的法定权利人记录及生效时点，可能区分 registered holder 与 beneficial owner | 钱包余额=法定股东名册；平台内部持仓可覆盖登记机构 |
| **Token** | Token 对 Instrument 的对应比率、分配/登记引用、转让限制和授权执行版本 | Mint 成功自动产生法律股东权利，Burn 自动合法注销公司股份 |
| **Lifecycle** | 是否可进行合法分红/分配、公司批准、记录日、实际出款及退出/清算；无到期还本的常规承诺 | 债权 A 的固定利息/到期本金/强制兑付可复制到 B |

**适用边界**：某些 SPV 为有限责任公司，其成员权益、受益权益的法律名称及权利不同于股份。B 是实体权益家族的**验证样本**，具体称谓和合法登记形式须后续由法域与文件决定。可转换证券、基金单位、直接共有产权等并非自动属于此 B 产品案例。

## 二、Instrument 权益参数及授权主责（Draft 字段组）

| 字段组 | 验证要素 | 主责与权威 |
|---|---|---|
| 实体法律结构 | spv_entity、incorporation_jurisdiction、legal_form、operating_or_articles_version、authorized_officers、obligor/issuer（如适用） | M04/M06；真实适格实体及章程/股东协议必须核验 |
| 权益类别与权利 | share_or_membership_class、rights_version、voting_rights_if_any、distribution_priority、liquidation_preference、transfer/lockup/ROFR、preemption_or_consent | M04 版本审查+M19 规则，类别内同权及各类别差异应显式 |
| 资本与单位 | authorized_shares/units、issued/outstanding、reserved/allocated、minimum_increment、nominal_or_par_value（适用）、token_per_legal_unit | M04/M05/M12 真实公司授权容量，Token 单位不自动=法律股份 |
| 价格与融资 | offering_currency、issue_price_per_unit、premium_rule、valuation_reference_if_any、funding_target/max、fee/FX/rounding、terms_effective_at | M05/M10 QuoteSnapshot；估值≠合法可执行发行价，也不默认完整 NAV |
| 治理与发行前置 | board/member/shareholder_approval_ref、new_issue_authority、preemptive_right_waiver_if_required、offering_legal_review、transfer_agent_authority | M06 审批证据/M05/M19 Guard；不能用普通 SaaS 管理员代替公司机关决议 |
| 投资资格与签署 | investor_KYC、Offering_eligibility、securities_restrictions、subscription_agreement_version、wallet_recipient_eligibility | M08/M09/M06/M07，KYC 与股东资格独立 |
| 权利生效与登记 | allotment_or_issue_decision_ref、register_authority、legal_effective_at、holder_identity、beneficial_owner_if_any、cap_table_snapshot | M12/M22 权威登记引用；区分配售、法定发行/登记和 Token 事实 |
| 分配/收益 | distributable_profit_or_cash_source、corporate_approval_ref、record_date_rule、eligible_units、distribution_formula/priority、currency、tax/withholding_if_required | M13 受权事件/复核与外部付款；**无合法可分配利润或决议时不默认应付** |
| 回购/注销/退出 | redemption_or_buyback_permission、issuer_approval、capital_maintenance_rules_if_applicable、legal_register_change、Token_freeze_or_burn | M13/M12/M07 依法执行，不能将 M11 订单退款当作已发行股份回购 |
| 资产退出/清算 | asset_sale_or_exit_proceeds、creditor_precedence、remaining_equity_distribution、holder_entitlement_and_claims | M13 基础存续归档；复杂公司行动/清算引擎可能属于未来另审增强 |

## 三、持续购买模式的公司授权与稀释风险

A1 债务 Series 可验证同一债权增量发行，但 **B 的“持续认购”每一次可能意味着新增法律股份/成员权益、资本结构或稀释**。即使价格和页面体验与 A 相似，也不能默认为 Issuer 任意追加供应。

| 构型 | 何时可能适用 | 必须有的 Guard | 默认不承诺 |
|---|---|---|---|
| **B1：批准额度内的持续/分次首次发行** | 公司依法批准一个有限的新发行额度及价格/定价规则，在有效期内分次受权配售，且适用法律和公司文件允许 | 授权资本/发行权限、受权人员、类别/价格、生效期、资格、优先认购权、总股本稀释/上限与实际法定登记一致 | “一键无限增发”、免董事会/股东批准及自动形成股东身份 |
| **B2：封闭认购期、审批后统一配售** | 法域、公司批准、股东权利或价格/融资条款要求募集合并决策 | M05-F011/M12-F010 条件性最低募集/失败款/统一配售闭环 | 当前 V1 自动具备全部复杂路演/募资和多轮股权融资功能 |

**推荐的产品验证主线：B1 只有在法域/公司/合同允许时作为 A 的 ContinuousPurchase 对照；B2 必须与其并行检查“是否被实际工具强制触发”。** 不应在没有公司决议和法定实体参数时断言 B1 一定成立。发行额度必须与真实注册/批准权益单位和其它 Offering 之间权威一致。公司出售**现有持有人股份**属于法律性质不同的转让业务，不能伪装成 Issuer 首次发行；依 DEC-011 投资者间受控转让仍为 V2。

## 四、与 A 债权样本的业务差异

| 比较 | A 固定到期债权 | B SPV 实体权益 | 引起的产品必需差异 |
|---|---|---|---|
| 核心财产权利 | 约定利息与到期偿还本金的债务请求权 | 股份/成员权益、剩余价值与可选分配、可能存在表决 | Instrument 家族驱动 M04 权利片段 |
| 时间 | 起息、记录日、付息和到期日 | 权利生效日、记录日、分红/退出事件，通常无统一到期还本 | M13 不强制对 B 安排 coupon+maturity |
| 募集与定价 | 同一债务 Series 后续增发的同权、计息和 clean/dirty | 授权权益单位、估值/发行价、稀释、优先认购及批准有效期 | M05 与 M12 的合法发行容量/防稀释风险 Guard |
| 法定名册 | 债权/受益权权威登记 | 法定股东/成员名册和权益类别及生效 | M12 权威登记适配不同权利，不能以同一钱包代替 |
| 存续回报 | 按条款应付票息/本金 | 依法、章程和公司决议可分配现金；可能长期不分配 | 分红事件需独立批准，不是自动约定债权收益 |
| 退出方式 | 到期清偿/提前赎回 | 股份回购、合规转让、股权处置/公司清算等（适用时） | 不把“提现/退单”包装成股权回购或投资者间转让 |
| Token 权利 | Token 与债务/债权额的映射 | Token 与 legal units/股份类别/名册映射 | 合约限制和法定权利适配，仍共用 M07 核心 |
| 定价与报告 | 本金/应计、到期风险 | 发行价、类别比例/稀释、分红资格与风险 | 门户展示不能承诺固定利润/保本 |

## 五、样本 B 端到端主线（产品设计案例）

| 节点 | 可复用核心流程 | B 独有检查与权威 | 异常阻断 |
|---|---|---|---|
| B-01 Issuer/实体资质 | M01/M02 客户组织/权限 | SPV 主体/股权发行权/适用法域与责任人；SaaS Tenant Active 不代表发行许可 | 权利主体/必要公司授权未明不得进入生产 Offering |
| B-02 Asset→Instrument | M04/M06/M19 版本/文件 | SPV 持有底层资产的证据、股份/成员权益类别、公司文件、拟发行额度/决议 | 不得把 SPV 底层房产归为投资者直接物权 |
| B-03 Offering 发布 | M05 条款与审核 | B1/B2 模式、价格、稀释/认购资格、优先权/豁免、董事/股东批准 | 没有合法可发行额度和有效决议不得 Open |
| B-04 投资者准入 | M08/M09/M06 | KYC、证券/法域适格资格、股份类别认购文件、钱包与法定权益持有人匹配 | 法定持有人资格不满足则拒绝配售 |
| B-05 认购和额度 | M10/M12 | 股份单位精度、认购/配售价和批准资本上限、各 Offering 并发防超售 | 不因 Token 可 Mint 就忽略法定资本及股东优先权 |
| B-06 真实稳定币付款 | M11/M22 | 按已批准币种/网络和收款人收款，对账后决定可配售，不混同银行/公司实收资本法定入账时点 | 广播、回调、法定资本入账及法律股份取得为独立事实 |
| B-07 配售与发行 | M12/M19 | 获授权的配售/公司发行决定、法定股份/成员名册回执、权利生效和类别数量 | 资金已到账但公司批准撤回/失败不能私自造股权 |
| B-08 Token Mint 交付 | M07/M12/M22 | legal_unit↔Token 比率、法定限制、冻结/授权签名和链上最终性 | Token 已 Mint 但股份/权利未生效须保留差异、禁止误显示股东 |
| B-09 存续/必要披露 | M13/M18/M21 | 法定权益名册、适用的通知、受权查询、资产/公司信息 | 平台不承担法定董事/股东职责 |
| B-10 可选分红/分配 | M13 分配与权益快照/外部支付 | 利润/可分配额核验、公司授权、记录日、股权类别优先顺序、独立支付证明 | 无合法决议或可分配额不得自动生成“固定应付” |
| B-11 股权变动/回购/退出 | M13/M12/M07 依法变更 | 受权股权回购/注销、资产出售/清算分配（适用）、Token 限制 | 禁止将 M11 认购退款当回购，V2 转让不自动进入 V1 |

## 六、股份/Token/稀释与持有人收益的权威核对

| 业务量 | 最低核对口径 | 不得自动推断 |
|---|---|---|
| 法律授权权益额度 | 公司决议/章程允许的发行类别、可发数、最低配售单位、有效时点 | Token 合约 cap 是全部公司法定已授权股本 |
| 已发行/在外股份或成员权益 | 公司法定权威名册与实际发行/注销证据，类目分开 | SaaS 内部 Allocation 已成功即法定发行成功 |
| 投资者权益比例 | 依条款和**准确权益类别/分母/时点**展示比例（如适用） | 任意一枚 Token 代表 SPV 的固定百分比；新增发行不会稀释 |
| Token 流通及受限余额 | 链上按受权合约统计，与法定持有人/类别和登记状态逐时点核对 | Token 可转出即法律允许转让或受让人已成股东 |
| 分红权利 | 已批准分配事项、有效 record date、权威持有人快照、类别优先权、实付证据 | 钱包余额 × 预计利润率自动成为合法分红或保底收益 |
| 股权回购/注销 | 公司合法批准、实际价款执行/证据、法定名册权益注销及 Token Burn/冻结 | Token Burn 自然等于股份已依法注销，或公司应随时按原价回购 |

## 七、条件性 P1 在样本 B 的触发判断（产品级建议）

| 原 P1 / 已批准规则 | B 的初步需求判断 | 安全底线及仍须确认 |
|---|---|---|
| **M05-F011 / M12-F010** 集中募集 | **条件性**：真实法域/章程/融资方案需要统一配售、收款条件时必须形成最低闭环 | B1 持续发行必须有授权，不允许因默认 ContinuousPurchase 规避 B2 必要性 |
| **M10-F009 / M12-F009** 部分接受 | **条件性**：股份最小单位/公司批准和实际配售可以允许部分接受 | 总价余款/额度、法定授股和退款准确，复杂交互 UI 可后置 |
| **M07-F009** Burn/受权调整 | **条件性**：回购/注销、法院/章程要求的股份消灭、法定更正时触发 | 不把普通投资者提出“赎回”当作 SPV 强制回购权 |
| **M13-F004～F006** 收益/兑付 | **不默认固定票息/本金到期**；若该 B 类别存在依法批准的分红或分配/退出付款，则应保留最小事件、权益快照、复核及外部出款核验 | “分配功能可选”不等于可伪造已分红；如首发 B 工具承诺存续分配，所需最低能力应进入该 Instrument 范围 |
| **M08-F009 / M21-F005** 必要披露 | **依法律/合同确定最低必要范围**，权益类别、持有人和重大事项应有受权查询 | 不向不合格对象披露私人法定股东信息 |
| **M11-F010** 财务异常调查 | **基础安全必需**，认购付款差异与退款判断不能删除 | 受权审批、不可覆盖证据 |
| **M18-F004/F005** 正式通知 | **条件性**，法定公司通知、分红通知等依法/章程需有效送达 | 站内信不必然构成公司法定通知 |
| **M19-F006** 强制规则优先级 | **底层 Guard 必需**，公司发行上限、法域/投资资格、平台安全限制不能被 Issuer 改写 | UI 规则编辑器仍不是 V1 必交 |
| **M20-F007/M21-F006** 数据/报告交接 | **法定/合同最低必要能力必需**，股东/成员登记、权益快照和合法退租数据移交 | 正式名册归适格权威负责，SaaS 不可把自己默认设为法定注册处 |

## 八、应开展的 16 个 B 样本场景设计（均 Not Executed）

| ID | 场景 | 必须满足的产品断言 | 主要模块 | 状态 |
|---|---|---|---|---|
| **B-T01** | SPV 上传房产所有权文件并发行权益 | 明确投资者持有 SPV 股份/成员权益，资产所有权与投资者证券权利不混同 | M04/M06/M08 | Not Executed |
| **B-T02** | 未经批准的股份类别/发行决议 | Offering 不得正式发行/配售，保留外部法律批准证据 | M04/M05/M19 | Not Executed |
| **B-T03** | B1 不断认购，法律授权发行容量不足 | M12 防超售，需适用增发授权而非通过 Token cap 绕过 | M05/M12/M07 | Not Executed |
| **B-T04** | 有法定优先认购权且尚未取得有效豁免 | 保护适用权利及公司决策程序，不向新投资者擅自配售 | M05/M06/M12 | Not Executed |
| **B-T05** | 投资者 KYC 通过但法域/权益类别受让资格不符 | 阻止订单配售，KYC/Eligibility 各自保留结论和版本 | M09/M10/M12 | Not Executed |
| **B-T06** | 股份单位/Token 数量精度不一致 | 法定单位、Token 映射和部分认购/配售须精确并受控退款 | M04/M10/M12/M07 | Not Executed |
| **B-T07** | 一次付款已对账，但公司配售授权失效 | 不自动生成法律股份，保留真实到账和合法退款/后续处置 | M11/M12/M17 | Not Executed |
| **B-T08** | 股份权威登记失败/Unknown 但 Token Mint 已成功 | 分开记录链/登记、冻结投资者“已拥有法定股份”展示并受权补救 | M12/M07/M22 | Not Executed |
| **B-T09** | 本轮发行后 SPV 总股份增加 | 按法律类别/分母和发行生效时点更新受权比例，不能假定每枚 Token 固定公司股权百分比 | M04/M12/M21 | Not Executed |
| **B-T10** | 没有可分配利润或有效公司决议 | 不自动生成应付分红或保证回报，保留合法经营信息披露 | M13/M18 | Not Executed |
| **B-T11** | 存在多种股份类别与分配优先级 | 按权益类别/法律条款及批准的分配记录日与快照分配，不按 Token 总量平摊 | M04/M12/M13 | Not Executed |
| **B-T12** | 分红核算已批准但外部实际出款 Unknown | 维护独立应付/支付/实付对账状态，查询原指令不盲目重复派付 | M13/M22/M17 | Not Executed |
| **B-T13** | 投资者申请把股份 Token 转给不适格接收地址 | V1 保留必要合约级限制与审批 Guard；不暗中开启 M14 V2 投资者间转让 | M07/M09/M14 | Not Executed |
| **B-T14** | SPV 回购/股权注销请求 | 须经合法公司决议、实际价款核验、法定名册和 Token 独立处置；不可当成普通退款 | M13/M12/M07/M11 | Not Executed |
| **B-T15** | SPV 出售底层资产后的收益分配 | 法律实体层面的偿债/费用及必要公司决议优先，不把房产出售款直接转成 Token 持有人法定收入 | M13/M06/M20 | Not Executed |
| **B-T16** | 机构退出/股权存续或争议未了 | 法定名册/公司责任、数据保留、托管/通知/持有人查询移交，不能因 SaaS 退租删除股东权利 | M01/M12/M13/M20 | Not Executed |

## 九、与样本 A 合并时的共用模块和必须分开的业务判定

| 归类 | 可复用现有 187 项中的共享核心 | 不能简单从 A 复制到 B |
|---|---|---|
| 权利/文件 | M04/M06 权利版本、外部意见、电子签与正式 Offering 文件 | B 新增公司决议、股份类别/法定资本、优先认购与稀释规则 |
| 资格/订单 | M08～M10 投资者门户、KYC/Eligibility、报价、份额与签署 | 股份类别、法定受让资格和发行/分配与权利生效顺序 |
| 真实付款/配售 | M11 钱包支付及对账、M12 原子额度、受权配售和登记 | 实收投资款与法定股份取得不自动同步；涉及公司机关决议 |
| Token | M07 合约/受权 Mint/Finality/必要转让限制 | Token 单位不天然拥有分红/投票权，也不代表对底层资产直接物权 |
| 存续/分配 | M13 事件、权利快照、计算复核和外部支付核验 | 无固定 coupon/maturity，只有有效的股东权利/公司授权时才分红或回购 |
| 异常/报告 | M17～M22 任务、版本化 Guard、必要通知/数据/外部回执 | 公司法定名册/成员权益、可分配现金、法定通知的权威主体与法律文件 |
| 独立商业线 | M15 White-label、M16 公共 Open API 保留发行后扩展契约 | B 模型存在不等于商用白标多发行机构平台或开放 API 已交付 |

## 十、已确认的 B 权益样本验证原则（**SCOPE-134～142 Approved**）

| 编号 | 已批准原则（具体实现/法域/软件测试仍未批准） |
|---|---|
| **SCOPE-134** | 样本 B 以 **依法成立的 SPV 股份/类似实体权益 Instrument** 为基础，底层房地产/项目资产与投资者法律实体权益严格分离；不假设持 Token 就具有股东身份或底层资产所有权 |
| **SCOPE-135** | Instrument 应描述**发行实体、股份/成员权益类别、合法份额单位、权利/分配/投票（适用时）、优先级、转让限制、法定名册、授权主体及版本**，并区分实际法律形式 |
| **SCOPE-136** | Offering 发布/配售前须核验公司发行批准、法定资本/权利类别、优先认购权/豁免、适格资格、签署与受权收款/登记/Token；B1 仅在合法允许的授权额度内持续发行，B2 集中募集视必要性触发 |
| **SCOPE-137** | 复用 M08～M12 的 KYC、Offering-specific eligibility、QuoteSnapshot、真实付款与对账、唯一容量/配售和法定登记；增加股份最小单位、价格、总发行量、发行稀释及 Token 比率校验 |
| **SCOPE-138** | M12 法定股份/成员权益持有人登记与 M07 Token 事实及受益人结构独立；不得以钱包余额代替股东名册，Mint/登记差异须阻断不实持仓与受权恢复 |
| **SCOPE-139** | B 不预设债权式固定利息或到期保本；仅在合法可分配现金及必要公司批准时，按权益类别、权威记录日及持有人快照处理分红/分配、复核、外部实付及失败对账 |
| **SCOPE-140** | V1 保留必要合约级转让限制/持有人适格 Guard；M14 受控二级转让继续 V2。股份回购/注销、法定退出和 Token Burn 仅在真实 B 工具触发时经受权合法流程实现，不把普通退款当回购 |
| **SCOPE-141** | SPV 发行超额、优先认购权冲突、法律登记/Token 差异、稀释、错误分红、付款 Unknown、回购及 SaaS 退出时都必须保留原始权威事实/版本、不可逆幂等和合法纠正路径 |
| **SCOPE-142** | 本批只批准 B 的产品需求级验证方向及 16 张 B-T 卡作为 **Not Executed** 设计；A/B 原 187 项仍 Not Tested，法域/合规主体/具体权利与 V1 实际交付及开发授权仍需另外批准，PR #6 继续 Draft/Open/Unmerged |

## 十一、专项差异验证完成后还有哪些决策门

- 已批准 [SCOPE-134～142](../../decisions/SCOPE-134-142-equity-B-SPV-rights-and-lifecycle-principles.md) 的 B 权利/Offering 设计原则。下一步建立**A/B 对照实际必需性矩阵 Draft**：按两样本分别判断共同 Guard、B 特有权利与法域门、16 项条件性 P1 的触发条件、简化实现和外部执行边界；不得直接改变 187 个原功能 ID/分级。
- 样本 A 已完成**规则草案及原则审批**，但 A-T16、A-D12 场景和 A/B 187 功能仍 **Not Executed / Not Tested**，不能伪称完成法律或 E2E 验收；B 同样没有实际测试。
- 需要针对真实发行业务独立评审首发工具及法域、SPV 真实法律形式和权利、适格发行/公司机关/登记、收款/退款及分红资金控制方、Token 链/合约与签名权限、客户数据/退出义务。
- 已批准的 ARCH-001、DEC-011、White-label/Open API 独立交付边界继续有效；**本次只是产品案例验证 Draft，不冻结 Issuer SaaS V1 逐项交付，不启动生产开发或合并 PR #6**。

**状态：SCOPE-134～142 样本 B 产品规则 Approved；详细条款、法律效力和实现仍 Draft，B-T01～T16 Not Executed，A/B 187 功能 Not Tested。**
