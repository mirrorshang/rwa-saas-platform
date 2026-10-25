# RWA SaaS｜Step05-02 跨端产品状态与异常规范（Approved v0.1｜仅产品层）

> **2026-10-25｜DEC-031批准R01～R04产品级跨端状态语义、业务异常保护与权限责任。** **精确后端enum、事件/API、数据库字段、确认阈值、技术重试算法、法域法律效力、真实持款与Signer权限、UI稿与实际测试仍Draft/Not Executed**。本文件并不为R01～R04之外的其他新提议提供自动Approved或V1整体Frozen。

阅读入口：[DEC-031正式决策](../../decisions/DEC-031-step05-02-r01-04-offering-visibility-publishing-disclosure-versioning-approved.md)｜[Step05-02产品级详细PRD Approved v0.2](RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)｜[DEC-022法律文书及地址后绑定](../../decisions/DEC-022-step04-s0404-investor-subscription-allocation-registration-approved.md)。

## 一、11类业务事实与唯一权威，禁止合并为一个状态

| 业务事实 | 唯一领域拥有者 | 建议业务状态类别（技术编码仍Draft） | 不可错误等同 |
|---|---|---|---|
| Tenant商业授权 | M01/M19 | Trial模拟、Paid授权、受限、退出 | Paid≠合法金融发行资格；Trial→Paid不自动发布 |
| Asset/Instrument审核 | M04/M06 | Draft、InReview、NeedsInfo、ReviewedForUse、NeedsRevision | 内部Review成功≠证券/合同合法生效或可公开 |
| 正式文件与法律签署 | M06＋实际受权X | Draft、ReviewPending、LegallyEffectiveAsApplicable、Superseded/Unknown | 已上传/签署服务回执≠生效；旧签文件不可覆盖 |
| Token方案与链部署 | M07/M22及X真实Signer | PlanDraft、AwaitingAuthorization、Submitted/Unknown、ChainVerified | 链地址验证≠M06合法文书已绑定/Offering已Open |
| Project总生命周期 | M05 | Draft、Preparing、Active、Suspended、Closing等 | Project Active不代表多个Offering均Open |
| Offering内部审核 | M05 | Draft、SubmittedForReview、ApprovedNotPublished、Rejected/NeedsChanges | 内部ApprovedNotPublished≠已经对V正式展示 |
| Offering可见性/受众 | M05 | Unpublished、AuthorizedPublic、AuthorizedTargeted、Restricted | 可合法披露≠可购买；直链按权限查验 |
| Offering销售窗口 | M05 | PublishedNotOpen、Open、Paused、ClosedForSubscriptions、Completed等 | 已发布不代表Open；停售不抹除在途订单 |
| 投资者Offering-specific资格 | M09/M19 | NotChecked、NeedsInfo、Eligible、NotEligible、Unknown/Expired | KYC Verified≠该Offering Eligible |
| 当前披露/订单适用版本 | M05/M06/M04/M10 | CurrentEffective、PriorSigned/Quoted、PendingMaterialChangeReview | 变更不能直接覆写旧Quote、签署和历史权益 |
| 投资者实际认购后事实（下游） | M10/M11/M12/M07/M13 | OrderPending、PaymentUnknown、Registered、TokenFinality、BenefitOutstanding等独立事实 | 本阶段不会批准真实支付/配售/Mint实现 |

**四端最小责任**：I企业受权发行者创建/审核/发布；P后台只负责SaaS Tenant与受权安全运营，不以平台客服权限替Issuer批准金融工具；V仅访问可依法披露的Offering和本人适格动作；X分别是适格法律/评估、登记、持款/付款主体、电子签与链Signer，各有独立合法责任，M22技术连接不会授予平台新的资金/Token私钥控制权。

## 二、跨端完整业务流转（已批准产品行为，精确迁移与API仍Draft）

| 场景 | 事件 | 必须验证的现有Gate | 产品级后置行为 | 企业/投资者端呈现 | 唯一主责 |
|---|---|---|---|---|---|
| V02-01 | I创建Asset/Instrument并附权属/文书 | 商业权限及草稿创建权有效 | M04/M06留受控版本、请求合法审查 | I编辑与补件；V无公众披露 | M01/M02/M04/M06 |
| V02-02 | I关联InstrumentVersion创建Offering | Asset/Instrument合规引用、项目角色有效 | M05新建Project/Offering草稿，保存权利和条款快照 | I看到Draft与缺项；V仍不可看 | M04/M05 |
| V02-03 | I准备链/Token方案和适用文书 | 合法部署资格待独立审核 | M07真实链证据（如已合法受权）；M06决定生效文件/地址绑定 | I显示Token计划/链执行真实进度；V不得假报已部署 | M07/M06/X |
| V02-04 | I请求发布前置核验 | P-01～P-07逐项判断且有真实证据 | M05展示已满足/待补/不适用/阻断及权责人 | I可修复缺项，不能直接上架 | M05＋原各域权威 |
| V02-05 | 受权审批通过发布要求 | 适用7类Gate已满足 | 进入ApprovedNotPublished，等待有权发布动作 | I显示内部批准未发布；V无无权访问信息 | M05 |
| V02-06 | Issuer受权人员明确执行正式发布 | 商业Tenant/发行许可、文件版本/受众和Gate仍有效 | M05生成正式Published版本和可见受众 | I已发布，V仅可看自己合法授权信息 | M05/M08/M20 |
| V02-07 | 销售窗口Open且Investor申请购买 | Offering公开/定向访问合法、M09 Eligible、M06/M10相关条件有效 | 允许进入后续Step05-03报价/签署/有效订单Gate | V可购买提示，不等于M10订单/真实付款已完成 | M05/M09/M06/M10 |
| V02-08 | Offering暂停、停止新认购或未到窗口 | M05真实销售状态不是Open | 保留合法可披露页面，禁止新有效认购 | V显示已暂停/未开售/停售及合法公告 | M05/M08/M10 |
| V02-09 | 法律文件/条款/Token地址重大变更 | 需要合法影响判定，保留旧版 | M05/M06保存旧新版本及影响对象，决定审批/通知/重签或暂停 | I查看差异/在途受影响；V见合法新公告/必要确认 | M04/M05/M06/M17/M18/X |
| V02-10 | 试用草稿升级后拟用作真实发行 | 原Tenant Paid但正式法律/签名/资金Gate未全部满足 | 各域重新确认草稿和生产权限，模拟事实仍模拟 | I可续草稿不可自动发布；V不可真实申购 | M01/M04/M05/M06/M07 |

## 三、DEC-031 R01～R04四项Approved业务不变量

### R01｜Disclosure/Visibility与New Subscription Allowed独立

1. **第一道检查是访问者对该Offering及特定资料是否依法有访问权限**。Draft、ApprovedNotPublished、未获目标受众授权的定向Offering既不得经列表展示，也不得通过直链或API越权阅读。
2. **第二道检查才是能否有效认购**：M05销售窗口Open、真实Offering已发布且未受适用暂停/停售阻断，M09当前Offering-specific Eligible以及必要文件/额度/签署/合法付款守卫均满足，才可以进入Step05-03订单流程。
3. 已发布但尚未开售、暂停、停售后的受权披露可保留，但不得产生有效新认购；停售不等于既有订单/法定债务和在途资金消失。文书合法披露的保留内容依Instrument及法域定义。
4. **KYC Verified≠投资者Eligible，已发布≠可购买、已购≠合法交付**。M08只是门户呈现，不创建另一套发布/资金/登记事实。

### R02｜七项缺项式发布Guard与明确发布动作

Issuer工作台按M05已确认**P-01商业组织、P-02法律文件、P-03合法销售/额度、P-04投资者资格、P-05真实收款、P-06权威登记/Token、P-07存续与审计**逐项显示适用结果、责任域和需完成事项。未满足任何强制适用Gate均不得执行“Open/合法对外发布”；内部完成发行审核后仍须指定有权人员明确发布，不能让Paid、InstrumentReviewed或Token Deployed自动隐性触发。

展示只说明**产品检查能力已获批准**；具体首发法域是否满足法律许可、资金持有人/Signer合同签约和生产执行并未获批准。

### R03｜投资者详情先Instrument权益，后Token实现

投资者详情的**业务信息优先级**：法律发行主体与权益（M04）、收益义务/风险及正式文件（M04/M06）、Offering条款及销售状态（M05）、真实受权Token说明（M07）。A债权需反映真实本金/利息/到期等合同事实；B SPV权益需明确法律股份/份额、分红/回购条件与底层资产产权不是同一概念，不能作保本或固定收益保证。**视觉排版与语言版未批准**，此处只冻结产品信息语义和顺序原则。

### R04｜保留历史快照、影响分类、必要通知及重签

1. 变更时明确原InstrumentVersion、Offering条款/价格/额度版本、DocumentVersion、有效签署/Quote引用以及真实合约地址/版本；不能覆盖受权旧资料或旧法定权益。
2. Issuer与真实法定/合同有权主体对受影响投资者和在途订单做可继续、待合法再确认/必要重签、暂停/退款等影响判断；不同Instrument/法域需要的法律动作**仍待专项确认**。
3. M05正式发布新生效版本与M06法律文书、M07实际合约引用必须一致，不能凭链部署、签署服务“completed”或邮件“sent”自动证明法律效果。
4. 本规则不允许未经审查直接替换已售证券的实际合约或迁移Token，不给P客服签名、持款或法定文件变更权。

## 四、错误、Unknown和异常统一处理目录（E02-01～15）

| 编号 | 触发/事实 | 业务阻断与受权恢复 |
|---|---|---|
| E02-01 | Asset内部批准、专业证据仍缺失 | P-02显示法域/主体/文书缺项；不得正式发布 |
| E02-02 | Issuer自己输入已部署合约地址 | M07链证据及X受权Signer须核实，不能仅凭手填绕过P-06 |
| E02-03 | 真实地址已拿到但正式文件依法须补充/重签 | M06文件合法绑定状态独立阻断发布，不能静默补填历史签名 |
| E02-04 | Offering内部已批准但未发布 | 无受权读者不得查询/购买，项目负责人应明确执行发布 |
| E02-05 | 定向/隐藏Offering通过直链或跨Tenant访问 | 服务端按发布及受众权限拒绝，不能泄露任何非受权法律资料 |
| E02-06 | 已正式发布但未开售/已暂停/已停售 | 对合法受众保留依法披露资料，不允许新有效订单或不可逆支付请求 |
| E02-07 | Investors KYC Verified但某Offering不合适格限制 | M09 Offering-specific Eligible必须独立；不得形成受权有效订单 |
| E02-08 | Token节点Unknown/重组、可能已部署 | 先查同一执行Intent/链事件，不自动重复合约执行或公告成功 |
| E02-09 | Instrument权利或文书版本发生重大变化 | 保留旧有效文件/签署快照，评估受影响Offering并阻断非法自动变更 |
| E02-10 | Offering价格/销售条款变更影响旧Quote | M10旧Quote及M06签署关联不改写，按合法方案决定再确认/暂停/退款 |
| E02-11 | 已发布Token地址需要依法调整 | 不能自动把旧合约/持仓映射迁移；M06/M07/M12与有权X复核 |
| E02-12 | Issuer Trial草稿转Paid | Asset/Instrument/Offering草稿重新核合法发布Gate；模拟资产结果与法定登记/资金/Token不自动变真 |
| E02-13 | 某Investor看到的文件早于当前批准版 | 核引用的Offering/Document合法生效版本，旧签署证据只按受权历史显示 |
| E02-14 | 停售/退租但已有待收退款/已配售持仓 | M10/M11/M12/M13各保留未了权利义务，V依法可必要查询 |
| E02-15 | 首发Instrument法域强制集中募集 | DEC-017版号另审，不能把V2 Batch机制偷偷写进V1 |

## 五、异常受权恢复与跨端显示（产品原则Approved，工程规则Draft）

| 原因类别 | I工作台显示 | V投资者门户显示 | 真实操作责任 | 禁止行为 |
|---|---|---|---|---|
| 法律/Instrument不完整 | 具体法律文件/专业意见缺项、指定补件人 | 仅已合法受权公开的资料，否则不显示 | Issuer合规及适格X；M04/M06 | 自动上架、用上传成功替代法律合规 |
| 合约部署Unknown/文件绑定未完成 | M07链状态和M06文书状态分开显示 | 真实Token信息仅能显示受权可核事实 | M07/X受权Signer、M06法律负责人 | 自动重复部署、宣称权益已交付 |
| 已发布但未Open/暂停/关闭 | 展示销售原因与在途订单待办 | 已有合法访问者可查必要公告，不允许新购买 | M05、M10/11/12既有义务方 | 新有效订单、删除已付/在途权益 |
| 投资者不适格 | 依法必要的资格摘要 | KYC/资格补充或受限提示 | M09/Issuer合规＋X适格核验 | 资格未确认却允许创建有效购买指令 |
| 披露重大变更 | 历史/当前差异、影响订单及有权审批 | 查看其合法可见的公告及必要重新确认 | M05/M06/M17/M18及法定X | 覆盖旧Quote/签署、将通知发送视作法律生效 |
| Trial数据拟升级 | 正式发布缺项、非生产事实保持模拟 | 没有真实可购买Offering | M01/M04/M05/M06/M07 | 演示KYC/付款/Token变成正式持仓 |

**执行记录**：M17负责受权待办，M18通知投递，M20审计，M19必要规则版本；它们均不替代M04/M05/M06/M07/M09/M10/M11/M12/M13的唯一法律、资金与Token权威。

## 六、产品验收断言（均Not Executed）

| 编号 | 必须证明的未来业务验收 |
|---|---|
| U02-01 | 未发布或未授权Targeted项目的URL、列表和接口都不得泄露 |
| U02-02 | 已PublishedNotOpen、Paused、ClosedForSubscriptions允许依法披露，但不能形成新有效订单 |
| U02-03 | Published/Open但投资者KYC或Offering Eligibility不满足时拒绝有效下单 |
| U02-04 | P-01～P-07任一必要Gate阻断时Issuer看到准确缺项/责任人并不能发布 |
| U02-05 | M05内部批准之后必须另有权发布动作，不能凭Token部署或商业Paid自动Published |
| U02-06 | A债权/B SPV产品详情法定权益表述准确，Token技术信息不替代实际法律权利 |
| U02-07 | 修改正式文件或合约地址保留先前Signed/Quoted与在途订单适用版本 |
| U02-08 | Token部署Unknown先查原链上Intent，不能错误宣称已部署或重复部署 |
| U02-09 | Trial资源Paid升级保留合法草稿但不迁移模拟KYC、付款、Token或登记 |
| U02-10 | Issuance关闭或Tenant受限不自动抹除在途订单、实际收款及权益/披露义务 |

没有运行实际代码、供应商Sandbox、链上交易、浏览器或资金集成测试，不能将上述任何用例标记PASS或Done。

## 七、待定的Step05字段与专业决策门

- **Draft技术**：各对象唯一ID、版本引用、文书哈希、M05发布事件、权限读模型、匿名/定向缓存、Token RPC/Signer、确定性状态码/日志/错误码/API与重试机制；后续设计必须维持Approved业务语义。
- **Draft法律/执行**：首发法域/Instrument、合法销售方式和集中募集要求、实际合约是否可先部署、文书地址后绑定合法方式、真实资金持有人/退款与登记责任、Token私钥控制权与必要外部服务合约。
- **Draft设计/UI**：详情页面视觉布局、交互控件、通知文案、多语言、前端状态实现；只能在以后授权UI阶段实施。
- **阶段边界**：DEC-031只批准四项产品细化，旧Step05-02 Visual Draft原文保留；Step04全量146/146逐IDApproved、13项审计门Open，Step05-03/04/05未审，Step06 V1整体未Frozen，PR #6 Draft/Open/Unmerged。

**产品层结果：R01～R04的跨端业务状态语义及异常保护已Approved；技术enum/API/真实法律和链资金方案仍Draft，全部测试Not Executed。**
