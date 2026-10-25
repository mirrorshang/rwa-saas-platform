# DEC-028｜Step04全量静态覆盖有条件认可；流程时序勘误及Step05可视化审核方法

> **2026-10-25｜Conditionally Accepted（仅146功能静态覆盖/四端11步主干）**。不是“Step04全量审计Approved”或“V1.0整体Frozen”，也不授权字段PRD自动批准、UI、前后端、合约研发或真实金融/链上生产。本文记录产品负责人的明确反馈“基本确认……好的，按你的建议”及建议范围，不将沉默解释为关闭13项审计门。

## 一、用户反馈与合理认可范围

产品负责人在查看Step04跨端审计总结后表述：

> “基本确认。但是这种全文字的审核，对我来说，有些困难，阅读起来也很麻烦。你自行交叉核验一下，从企业入驻，到SAAS平台管理，企业审核通过到发行，发行的流程，发行后全部信息到用户投资端，用户浏览信息，KYC购买，后买后持有收益等全部流程，各端关联信息等是否目前功能都能对应并合理，告诉我审核结果。”

在获得重新核验的概览、建议“**有条件认可Step04全链路静态覆盖、13项继续跟踪；先修正旧流程图；Step05采用可视化场景分段审核，不冻结V1**”后，明确回复：

> “好的 按你的建议”

**因此本DEC仅记录这三项执行授权/认可**：
1. **Step04范围/覆盖静态核验有条件认可**：DEC-027批准九批**146/146唯一V1功能Step04逐ID设计**，现阶段11步/P-I-V-X四端未见需要推翻22模块划分的结构性功能缺口；**这不是对整个审计Draft全部事实的无条件签收**，更不是字段接口/实测完成。
2. **13项审计风险/阶段门继续保持Draft/Open**：X-01～X-13的法律、资金、登记、Signer、Token、Claim、消息等门均未被自动通过或关闭；第X-02“首发Instrument依法须集中募集则需V2版号重审”为冻结前独立条件决策门。具体解决顺序与方案留Step05逐场景评审。
3. **按可视化场景启动Step05产品讨论**：先修订DEC-019后续生效的注册、14天Trial、企业KYB、Standard合同/商业收费、原Tenant升级Paid的旧流程图矛盾，再从企业开通场景开始形成图解、P/I/V/X责任、页面组和数据/状态草案给产品负责人审核。

## 二、已确认的唯一明确时序冲突与非破坏性处理

[Step02旧v0.3历史四泳道图](../docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)中的L0/L1-A把企业商业KYB/付款放在Tenant开通前，与后续生效[DEC-019](DEC-019-step04-s0401-trial-kyb-subscription-supplement-approved.md)和[S04-01 v0.2](../docs/03-product-prd/RWA-SaaS-Step-04-S04-01-Issuer-Foundation-Trial-Subscription-Approved-v0.2.md)存在时序矛盾。

本次新建[Step02 v0.4四端全流程勘误版（Draft，核心11步目标依DEC-014 Approved）](../docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-DEC019-Onboarding-Corrected-v0.4-Draft.md)：
**邮箱验证→14天受限Trial Tenant即开（KYB前）→在Trial期间可做KYB→KYB有效后确认单一Standard合同和真实商业付款/经批准合同例外→原Tenant幂等升级Paid→各Offering另审法域、法律/资金、Token Signer合法生产条件**。Trial到期只读＋30天恢复；已发行Paid合同义务保留独立合法责任/查询与交接。

v0.3作为历史图保留；不改DEC-014、DEC-019、已Approved Step04文档、原Frozen或历史SCOPE。

## 三、Step05方式（本次仅启动审阅，无字段批准）

先按照五段**业务可视化场景**分别审核“企业开户商业授权→资产/Offering和正式门户披露→投资者KYC认购/实收/法定登记和Token→收益本息分配/Claim→异常、平台支持和退出”。每段优先展示**P/I/V/X四端、页面入口、对象/状态传递、业务Guard、异常和遗漏决策门**，用户确认后再按需细化字段类型、权限码、API、状态enum、测试用例。既有批准的DEC不重复要求用户审核。

首份材料：[Step05-01 企业入驻与订阅可视化业务/字段PRD Draft](../docs/03-product-prd/RWA-SaaS-Step-05-01-Onboarding-Trial-KYB-Subscription-Visual-PRD-Draft-v0.1.md)。

## 四、边界与交付纪律

- 193项的首次交付归属**V1.0 146、V2.0 22、V3.0 20、TBD 5**依DEC-017不变；M08-F010 TBD、M22-F009 V3、M03-F003/F004 V2/F006 V3不提前并入V1。
- **不修改四份Frozen、DEC-014/019及旧SCOPE/DEC原文**；只有Step02新的v0.4 Draft勘误继承最新有效入驻顺序。
- Step04交叉审计报告本体**Draft / Conditionally Accepted for Static Coverage only**；13项风险清单仍Draft/Open，V1.0整体没有Frozen。
- **PR #6 Draft / Open / Unmerged**；不启动UI、研发、资金/Token合约真实生产或对外发布。

**本DEC不替代未来对13项具体解决方案、Step05各场景或Step06 V1范围冻结的正式审核。**
