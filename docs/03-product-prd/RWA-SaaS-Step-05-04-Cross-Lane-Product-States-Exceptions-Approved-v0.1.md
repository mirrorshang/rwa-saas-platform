# RWA SaaS｜Step05-04 P/I/V/X跨端产品状态与异常规范（Approved v0.1｜仅产品层）

> **2026-10-25｜[DEC-033](../../decisions/DEC-033-step05-04-r01-06-post-issuance-yield-maturity-exit-product-approved.md)正式批准R01～R06六项产品行为的独立状态语义、权限守卫与异常保护。** 表格中的英文标签是便于理解的**候选状态**，不是冻结的实际enum/API/schema。真实法域、税费/计息计算、资金付款义务方、Claim/Push合约、外部持款与Signer、所有测试仍Draft / Not Executed。

主PRD：[Step05-04产品级PRD Approved v0.2](RWA-SaaS-Step-05-04-Post-Issuance-Yield-Maturity-Exit-Product-PRD-Approved-v0.2.md)；前序Step05-03真实合法持仓由M12/M07等分别记录，M13快照引用M12权威权益。M08只展示本人有权查看的权益/收益，M17/M18/M20/M22只负责工作流/投递/审计/适配。

## 一、11种产品事实各自独立（精确状态enum仍Draft）

| 业务对象 | 唯一真值来源 | 便于沟通的状态语义（非代码） | 不能混淆 |
|---|---|---|---|
| Instrument/Series生效存续 | M04合同＋M13存续责任 | Active / UnderReview / Disputed / Transferred / LegallyClosed | 已停售或SaaS欠费不能改变真实债务或股权权利 |
| 公司收益/清偿事件 | M13与合法Issuer/SPV/X | Scheduled / ConditionPending / LegalDue / PartDue / Overdue / Cancelled | A按合同；B分红必须有合法决议，不能默认固定收益 |
| 法定权益快照 | M12权威登记＋M13快照 | RecordDatePending / Verified / Disputed / CorrectedWithHistory | 仅Token余额不能确定法定受益人，争议不覆写旧版 |
| 收益计量与扣项 | M13与有权复核、合法税务依据 | Calculated / ReviewPending / Approved / NeedsCorrection / Disputed | 计算通过不等于真实可分配款、已注资或实付 |
| 分配批次及付款义务 | M13＋真实Issuer/SPV/有权债务人 | BatchDraft / BatchApproved / FundingPending / PartFunded / Funded / Cancelled | 不得把批准或部分注资解释为全体可领取 |
| 受益人Claim合法条件 | M13批准权利与M12法定快照、X真实付款方 | NotEligible / Eligible / Enabled / Restricted / Suspended | 必须有合法权益、真实可用资金及受权签名，不允许双领 |
| Claim/Push/外部实际付款 | M13实际付款事实、X合法持款/Signer | NotStarted / Submitted / Unknown / PartialPaid / FinalPaid / Failed / Unclaimed | Submitted与Funded均不是FinalPaid，Unknown先查原意图 |
| 未领取与逾期义务 | M13义务账本/合法受益人 | Unclaimed / ClaimWindowExpired / Due / Overdue / Disputed / Satisfied | 界面过期/商业退租不能擅自消灭或改归资金 |
| 法定权益终止/名册 | M12与有权法定Issuer/登记人 | Effective / TransferPending / TerminationPending / LegallyEnded / Unknown | Token Burn不能独立证明法定名册或股权合法注销 |
| Token锁定、Burn/退出 | M07真实链记录、X合法Signer | NotAuthorized / Submitted / Confirming / Final / Reorged / Unknown | 链操作成功不等于未偿本息消灭或法定权益已终止 |
| Investor收益和退出视图 | M08只引用M13/M12/M07 | Expected / Payable / Funded / Claimable / Processing / Paid / Overdue / Reconciliation | 派生展示不能反向写权威收益/付款/法律权益 |

关键不等式：**Projected≠Payable；Calculated≠ApprovedBatch；ApprovedBatch≠Funded；Funded≠Paid；Claim/PushSubmitted≠FinalPaid；TokenBurn≠LegalDischarge**。真实逾期/未领取与法定权益继续存在，不能靠更新前端标签冲销。

## 二、四端业务流转/动作与权威映射（R01～R06产品级Approved）

| 编号 | 操作/事件 | 必要业务Guard | 可被确认的唯一业务结果 | 四端展示和异常动作 | 权威主责 |
|---|---|---|---|---|---|
| T04-01 | Issuer为合法Series建立存续档案 | 已生效Instrument版本/发行证据与合法义务主体 | M13保留持续任务、费用/收益/本金及档案版本 | I存续工作台待办；V依法可见的存续事实 | M04/M13/M17 |
| T04-02 | 触发A债权票息/本金或B合法股息事件 | A真实合同权利或B法定董事/股东决议及条件 | M13记录合规收益事件与义务人 | I区分预估/条件/真实应付，V不误展示保底 | M04/M13/X |
| T04-03 | 法定RecordDate冻结权益快照 | M12合法登记生效证据及适用记录日 | M13关联快照版本和受益人/权利凭证 | I争议需复核；V本人合法资格进度 | M12/M13 |
| T04-04 | 合法事件收益计算和审查 | 有效合同、快照、法定税费扣项及经受权审批人 | M13形成合法应付及修订历史 | 计算已完成但未审批时不得给V“已可领取” | M13/M17 |
| T04-05 | 批准分配批次及真实付款责任 | 有权合同/公司权利、合法权益、批次金额与受益人确认 | M13唯一批次与相应应付/实际付款责任 | I批次Approved，V应付不等于已注资 | M13 |
| T04-06 | Issuer/X依法注资并核实可用性 | 合法付款义务方、受权账户/合约及币种/资金最终性 | M13依实际证据记录Funded/PartFunded/Unknown | I显示真实准备资金；V仅依法可领的已核批次 | M13/X/M22 |
| T04-07 | 启用经足额注资Claim或依法Push/外部付款 | 合法受益人/钱包、实际足额可用资金、受权Signer与必要审批 | M13分别开启合法领取/受权付款轨道 | 未足额默认不开放整批Claim | M13/X |
| T04-08 | 投资者Claim、X Push或外部实际付款 | 原付款Intent、合法收款权、外部事件和链最终性 | M13唯一真实Paid/Partial/Unknown与留未领余额 | V付款实际处理中/到账；I追款差异 | M13/M17/M20/M22 |
| T04-09 | 到期清偿或依法允许提前退出 | A债务合约已到期/依法提前偿还或B合法回购/公司行动 | M13分别确认真实清偿/部分逾期/权利保留 | I不能仅点击Burn视作全部偿还 | M13/M04/X |
| T04-10 | 法定权益修改与受权Token处置 | M13真钱证据、M12合法权利生效、M07链Signer授权及法定先后 | M12/M07各自记生效和Unknown差异、合法完成时才视为结清 | V分开查询现金/权益/Token实际状态 | M13/M12/M07 |
| T04-11 | Issuer欠费/退租或Provider故障 | 既有资金/名册/投资者合法权益继续存在 | M01/M17/M20保障必要查询、移交、复核与审计 | V保留法律允许的义务和权益查询/追偿 | M01/M13/M17/M20 |

## 三、六条获批准的跨端产品不变量

### R01｜Issuer存续义务不能随Offering或SaaS租约退出

M13维护真实Instrument/Series的合法债务人、合同/公司权益版本、募集后持续披露、合法分红/付息/本金和责任交接。Offering停售只是停止新认购；Tenant退租、欠费、受限也不能抹除真实已有法定持有人、未领款及合法清偿义务。P平台权限应限制新业务但依法保障必要查询/导出/移交。

### R02｜RecordDate以M12真实法定登记为起点

M13依据适用RecordDate和M12合法权益与持有人名册证据做冻结快照，Token链余额只做核验/差异提示；法定转让、钱包更换、补录、争议必须经有权程序做有版本的修订。原Snapshot/计算/审批/分配证据不可无痕覆盖。

### R03｜A债权/B SPV权益绝不共用保证收益规则

A仅按生效合同真正计算本金、利息、支付日期、部分偿还及逾期；B在真实公司决议、可分配利润和法域条件成立后才产生合法已批准股息、适用回购或其他公司行动。预估、已计算、已依法应付、到期、逾期和实际支付独立呈现；不得将B自动承诺固定APR、保本或到期必偿。

### R04｜收益审批→真正注资→合法领取

M13从有权权益快照计算、按合法税费/扣项经有权审查确认应付，创建唯一分配批次及合法付款义务方。真实外部付款人注资证据、足额和Signer/付款权限合规前不得开启Claim；Claim优先候选但依法可以采用Push/第三方。仅部分注资默认不能开放整批领取；依法允许例外必须有独立合法批准的可付款子批次与公平规则。

### R05｜投资者收益中心分开显示真实钱款状态

M08引用M13合法权利与实付结果显示依法允许的预计、应付、已注资、可领、未领、领取处理中、部分已付、已付、失败和Unknown。Claim使用受权合法受益人/钱包，不以点击按钮标实际付款；Push/第三方同样根据真实资金Finality判Paid。未领权利不因页面/钱包失效被清零。

### R06｜债务清偿、法定权利调整与Token处置三方验证

A到期/提前本息按法定实际清偿核对，B只在法定公司行动及条件成立时才有回购、公司注销等权益变更；M13实际支付/清偿与M12合法名册终止/变更、M07 Token Lock/Burn为三份独立证据。适用Instrument所有合法退出条件成立前不得宣布“已全部结清”。已Burn未付、已付尚未登记、名册已终止而链Unknown，都须作为未完成事实受权修复。

## 四、15类异常及用户/Issuer应看到的正确后果

| 编号 | 真实业务异常 | 必须遵守的产品保护及有权处理 |
|---|---|---|
| E04-01 | B SPV没有有效利润分配决议 | M13只能记录合法预测/条件，不生成可领已应付；Issuer有权主体补合法决议 |
| E04-02 | A债权到期资金不足 | M13应付/部分已偿/逾期分离，合法追偿义务不被置零 |
| E04-03 | RecordDate钱包余额与名册冲突 | M12权威登记为准，M13快照争议/纠正留历史，不盲向钱包持有人付款 |
| E04-04 | 钱包恢复/法定权利在记录日前后转让 | 核实际法定生效时点和受益人，不因接收地址变更自动改RecordDate |
| E04-05 | 税费或收益计算有错 | 原版本+有权更正审批和差额引用并保留原始证据 |
| E04-06 | 分配批次Approved但真实资金未注入 | I/V显示义务已审批未注资，不开放Claim，不冒充已实际付款 |
| E04-07 | 真实只部分注资 | 默认阻断整批Claim；依法允许合法分批需单独正式批准 |
| E04-08 | Claim已提交、链未知或重组 | 原ClaimIntent/事件先查证，不重复付款，不宣布已领取 |
| E04-09 | Push/外部出款部分失败 | M13记录PartialPaid/Failed/Unknown，剩余合法应付款继续存在 |
| E04-10 | 账户或窗口到期仍有Unclaimed | 保留合法未领权益、付款责任及受权领取或法域处置 |
| E04-11 | B提前回购/股权注销申请 | 有真实法定公司行动与对价及受权批准前不可默认为B应兑付 |
| E04-12 | 本金实付，但名册/Token没有合法完成退出 | M13真实清偿、M12登记与M07链事实分别可见，禁止单状态完全结清 |
| E04-13 | Token Burn成功、债务仍未付 | Burn不冲销M13合法债务或M12仍有效法定权利 |
| E04-14 | Tenant退租或Issuer欠费后仍有未领/逾期 | 保留必要Investor查询、实际义务、法定证据与移交 |
| E04-15 | 重复Webhook或出款Unknown | 同一经济事件受控去重、不同真实支付都保存；不可逆动作先查原Intent |

## 五、业务责任与通知/审计边界

| 操作 | I发行方与合法X执行者 | V投资者本人 | P平台运维 | 唯一事实拥有者 |
|---|---|---|---|---|
| RecordDate与收益资格 | Issuer/依法有权登记人确认名单和法律时点 | 查看本人受权资格/合法更正 | 最小系统故障摘要 | M12合法登记、M13快照 |
| 分配计算与审批 | 有权财务/公司行动负责人及合法委托人审查 | 见合法应付/预计区别 | 仅受权技术异常 | M13计算/批次 |
| 真实注资与付款 | 真实义务人/持款人/Signer证明注资和实际出款 | 合法Claim或查看Push/外部付款 | 不代客户持款/Signer | M13真正注资与实际Paid |
| 逾期与未领 | 合法义务方通知、催办、资金及权利交接 | 本人查看未结权益和追偿状态 | 受限退租与证据交接支持 | M13未偿/Unclaimed |
| 到期合法退出 | M13清偿义务人、M12登记者、M07受权Signer分别操作 | 三项状态分别可见 | 禁止一键强行改法律事实 | M13/M12/M07 |
| 必要法定通知 | Issuer制定合法内容，适格X按法域送达 | 查看有权公告及适用确认 | M18技术投递与M20审计摘要 | M13业务通知、M18投递，法律送达X |

## 六、未来验证情形（U04-01～15，全部Not Executed）

| 测试编号 | 未来实际系统必须展示的业务结果 |
|---|---|
| U04-01 | Issuer终止商业订阅但已有合法发行权利与到期应付仍不丢失 |
| U04-02 | 法定RecordDate快照以M12有效名册为主、Token余额冲突不自动改权利人 |
| U04-03 | A债权合同到期与B公司决议股息产生应付条件不同，B不保底 |
| U04-04 | B未合法产生分红决议时不得显示应付/Claim可用 |
| U04-05 | 已计算Approved、批次Approved、Funded和FinalPaid有独立证据状态 |
| U04-06 | 未注资/部分注资无法无审批开启整批Claim |
| U04-07 | 合法受益人和受益钱包在领取前受控校验，不允许重复Claim |
| U04-08 | Push/第三方付款Submitted/Unknown/Partial不能显示全部Paid |
| U04-09 | Unclaimed到期后真实合法权利不被静默归零 |
| U04-10 | A到期仅部分实际还本须保留逾期和未清余额 |
| U04-11 | Token Burn先成功、M13债务仍在时不标已合法结清 |
| U04-12 | M13钱已付、M12/M07权利或Token退出尚待核时分别呈现 |
| U04-13 | 事后纠错保留RecordDate、旧计算、批准、实付历史 |
| U04-14 | 重复同一Webhook不双付，两笔实际不同资金交易均被记录 |
| U04-15 | 平台员工不得以SaaS超级管理员身份代Issuer批准股息、持款或Signer |

没有软件/区块链/资金真实测试，本表不可标PASS。异常代码、字段名、金额/日期精度、时区、权益计算公式、分配合约方法、签名权限、现实付款截止时点和法定送达效力需在独立技术/法律阶段确认。

## 七、独立未决门与后续

- 合法Issuer/SPV债务人、可分配股息决议及真实受益名册/RecordDate法域、税费预提与资产性质、未领款处置、到期清算与合同偿付顺序；
- 真实付款持有人/Signer、Claim经真实注资合约的适用性、Push/外部资金轨道、实际交易Finality/部分执行/Unknown查询/是否允许补偿；
- 状态enum、领域字段、审核审批码、幂等键、API/事件与安全/监控/日志、实际UAT与E2E；
- [Step05-05跨端平台管理可视化Draft](RWA-SaaS-Step-05-05-Platform-Operations-Global-Controls-Visual-PRD-Draft-v0.1.md)尚未审核，Step06 V1总体Frozen未批准；193项版本、Step04 146/146和13项审计Open不变，Frozen/历史DEC/SCOPE不改，PR #6 Draft/Open/Unmerged，禁止UI/研发或真实金融生产。

**Step05-04状态与异常规范仅产品语义Approved；工程enum、技术、实际法域与资金执行仍Draft/Not Executed。**
