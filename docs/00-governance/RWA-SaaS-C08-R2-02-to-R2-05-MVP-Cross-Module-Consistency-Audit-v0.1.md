# RWA SaaS｜C08-R2-02～R2-05 MVP 跨模块一致性审计 v0.1

> **状态：Audit Completed（文档与产品规则交叉审阅）；未执行源码、Build、Playwright、真实交易或智能合约测试。**
>
> 核验时间：2026-11-04｜当前仓库文档分支：`docs/c08-r2-product-redesign-v01`，PR #7 Draft/Open/Unmerged。PR #6 Draft/Open/Unmerged。
>
> 目的：在转Codex开发之前，检查R2-02资产、R2-03权益结构、R2-04项目/Offering/Token、R2-05发行准备与DEC-044统一投资端之间的产品接口、权限、状态、容量、版本及真实执行边界；不给历史DEC和193项正式版本归属做未授权编辑。

## 1. 当前权威材料

1. [R2-02 Asset/房地产模板 UI-Ready PRD](../03-product-prd/RWA-SaaS-C08-R2-02-Asset-Management-Real-Estate-UI-Ready-PRD-v0.1.md)
2. [R2-03 Instrument/权益容量与Token映射 UI-Ready PRD](../03-product-prd/RWA-SaaS-C08-R2-03-Rights-Structure-UI-Ready-PRD-v0.1.md)
3. [R2-04 Project、Offering、Token/Contract UI-Ready PRD](../03-product-prd/RWA-SaaS-C08-R2-04-Project-Offering-Token-UI-Ready-PRD-v0.1.md)
4. [R2-05发行准备、发布及M渠道交接 UI-Ready PRD](../03-product-prd/RWA-SaaS-C08-R2-05-Issuance-Readiness-UI-Ready-PRD-v0.1.md)
5. [R2-05已批准决策记录](../03-product-prd/RWA-SaaS-C08-R2-05-Issuance-Readiness-Decision-Log-Draft-v0.1.md)
6. [DEC-044统一投资端批准记录](../../decisions/DEC-044-rwa-saas-unified-investor-platform-strategy-approved.md)
7. [Step05-02历史发行与披露产品规则](../03-product-prd/RWA-SaaS-Step-05-02-Issuer-Offering-Investor-Visibility-Product-PRD-Approved-v0.2.md)与[Step05-03历史认购法定持仓产品规则](../03-product-prd/RWA-SaaS-Step-05-03-Investor-Subscription-Legal-Holdings-Product-PRD-Approved-v0.2.md)

**文档有效性规则**：本轮产品修订已经通过R2-05-01～03和C01～C10全部A，但与历史正式DEC/功能ID存在冲突时仍须独立形成正式覆盖/范围变更，不可默许覆盖旧法定资格规则。Master/193项/Frozen及历史文件保持原文。

## 2. 核验结果

| 核验 | 跨模块比对 | 结果 | 工程交接要点 |
|---|---|---|---|
| A01 对象关系 | R2-02单物业Asset；R2-03一Asset多Instrument；R2-04一Asset默认Project、一Project多轮Offering、一Offering固定Instrument Version；逻辑Token按Instrument复用 | 一致 | 服务端跨Tenant、Project/Asset/Instrument关联不可错绑；重复创建幂等 |
| A02 资产/权益状态 | R2-02 Asset Draft/Preparing/Ready/Restricted/Archived；R2-03 Instrument Draft/Preparing/Ready/Active/Suspended/Terminating/Terminated；R2-04/05必须按独立状态守卫 | 一致 | Ready≠法律合规、Active≠可绕过新Offering容量/风险检查；Restricted/Suspended变更需影响评估 |
| A03 文件披露 | R2-02五类资产文件及扫描/可见/版本；R2-03权益法律文书固定版本；R2-04 Confirmed引用和Published快照；R2-05预览引用快照 | 一致 | 缺文件回源修复，不复制上传表单；不得读取企业最新文件覆写历史 |
| A04 权益容量 | R2-03剩余量=授权总量−已确认分配−有效Offering预留；R2-04 Confirmed预留一次；R2-05只检查不重复预留 | 一致 | 订单子预留不在Instrument重扣；Unknown不释放，Mint不再占第二份额度 |
| A05 Token数量/精度 | R2-03固定映射、权益类型独立单位；R2-04计算发行量/最大供应；R2-05部署结果与Mint分离 | 一致但技术Gate待定 | Decimals/最小单位/多逻辑Token主合约标准未获正式批准；不可精确表达时Fail-Closed |
| A06 Offering与准备 | R2-04 Draft→Confirmed→Published→Active→Ended→Settling→Completed、暂停为叠加阻断；R2-05 Confirmed进入单页准备、正式发布另守卫 | 一致 | 发行执行任务与Offering生命周期分开；暂停/到期不抹除旧订单 |
| A07 发行与M/V渠道 | DEC-044 Issuer逐Offering申请M、P单独审批、V独立门户、M/V共享权威；R2-05正式发布与M上架分离 | 一致 | 不要把Published当M已上架；P审核自己的渠道准入不是证券发行许可 |
| A08 资格与披露 | 新R2-04/05：KYC通过即MVP基础资格，不提供Issuer独立资格配置；旧Step05-03/DEC-032保留Offering-specific Eligible判定 | **正式版本/规则衔接待决** | 前端按本轮批准MVP交互，无Issuer白名单或人工审核；必要法定资格/AML必须Fail-Closed，旧M09/M19正式ID范围待单独DEC |
| A09 收款、配售、Mint | R2-04/05 Token部署≠Mint，配售≠已Mint；Step05-03 M10订单/M11实收/M12权益登记/M07链事实独立；V1 OP Mainnet USDT | 一致但技术法律Gate待定 | 绝不在UI确认时真部署/真收钱/真Mint；真实服务只在独立获准准入后接入 |
| A10 租户/企业角色 | MVP一个企业操作账号；系统Tenant隔离；P渠道审核是平台独立角色，X外部合法服务仍可能存在 | 一致 | 不将“企业无审批人”误写成“平台无渠道审查/法律专业核验” |
| A11 Free/Standard路径 | Free Sandbox模拟；Standard订阅不等于生产许可；R2-05分流 | 一致 | Mock生产任务、模拟地址/Token必须明显标注，无真实链副作用 |
| A12 UI导航 | 一级「资产与发行」二级「资产管理/权益结构/项目管理/发行方案/发行准备」 | 一致 | 按原框架建设，未开发其他页面骨架保持统一企业/顶部导航 |

## 3. 已确认但需要独立解决的差异/阻断

### G01 正式版本与资格优先级（治理门：Open）

- **事实**：用户明确批准当前MVP“KYC核验通过且有效就取得基础认购资格、无Issuer Offering独立资格配置”。历史Step05-03的正式产品级Approved规则曾要求Offering-specific Eligible；原DEC-017部分M09/M19 V1功能ID还包含准入及人工例外。
- **处理**：本轮UI实现按最新明确批准的Issuer简化交互；强制法律适格、制裁、法域禁止、平台金融生产门继续独立拦截。不能把“仅KYC”当作适用于所有证券工具/法域的法律断言。
- **未决**：需要另行批准DEC决定旧正式功能ID如何拆分为V1必须保留的强制守卫与V2高级Issuer自定义资格策略，并明确历史已批准细则的适用范围。当前不改193项分配。

### G02 单生产主合约、多Instrument逻辑Token（技术门：Open）

- R2-04批准的**一个生产主合约**是产品目标，不是已经冻结的ERC标准、Contract实例还是Token ID技术架构。
- 正式生产前必须由工程、安全与法律审议Token隔离、不同权益结构的权益表征、Decimals、供应量验证、网络、Signer、Provider、升级及权责。
- 未获批准时可实现Mock逻辑Token身份、上限、模拟合约状态，但不能部署真实合约/Mint。

### G03 真实资金、法定登记、服务商及M渠道牌照（生产/法律门：Open）

- 真实OP Mainnet USDT收款必须确定合法实际持款/收款主体、钱包地址控制、链上核验最终性、差额/错链/退款及M11权威。
- RWA的适用法域、法律文件生效/合约地址绑定、合法配售与登记主体/顺序、Signer授权都必须独立决策。
- M统一投资端渠道审核与平台自己的展示、招揽/认购路由责任须另外法律评估。P渠道审批不能自动授予金融发行许可。

### G04 跨端P/M/V独立开发范围（交付门：Open）

- Issuer R2-05 UI-Ready PRD已定义申请和状态接口，但不代表P运营审核、M统一投资端全量展示/认购、V企业门户所有页面已开发和验收。
- MVP可以先提供隔离Sandbox模拟渠道状态、页面预览和统一权威数据契约；完整正式跨端开发按后续工程分工实施。
- 不要因为Issuer端模拟流程PASS就宣称真实跨端上线可用。

## 4. 建议的开发移交顺序和硬性验收门

| 优先级 | 开发切片 | 最低证据 |
|---|---|---|
| P0 | 先审现有C07/C08源码、工作区状态、路由、重复对象与已实现I-20～25；保护现有可用版本 | Git状态、Build、Typecheck/Test、路由与实际浏览器截图；Audit Only，不动代码 |
| P1 | R2-02 房地产Asset与文件的真实前端交互/Mock和Asset Ready/Restricted | 四物业模板、文件扫描/版本、非法状态及空态浏览器验收 |
| P2 | R2-03 三权益结构与容量/Token映射Mock | 类型单位、固定映射、并发/异常容量规则及历史版本验收 |
| P3 | R2-04 Project/Offering/Token业务关系、三步创建与生命周期 | 自动Project、轮次唯一、唯一容量预留、7状态+暂停与Token分账测试 |
| P4 | R2-05单页七组检查、预览、声明、唯一发行任务、Sandbox模拟发布 | PASS/PENDING/BLOCKED/UNKNOWN、变化后失效、重试/幂等、模拟不触链 |
| P5 | Issuer按Offering申请M上架的模拟/集成契约，P/M/V需独立端任务 | 平台审核结果与Offering主状态分离、合法可见与可购买分离 |
| P6 | 跨模块回归/人工验收后冻结MVP UI；另立技术/法域生产门 | 实际Build/Test/Browser/Route/Screenshot、Edge Case；生产门不因UI通过而关闭 |

**审核结论**：R2-02～R2-05产品主流程可以作为下一阶段**Sandbox MVP UI/Mock开发交接基线**；无必要再逐批重做已批准产品基础规则。G01～G04在相应正式生产、版本或跨端开发决策前保持Open。本报告未声称已执行源码测试或真实金融生产验证。

## 5. 仓库保护

只允许在现行文档工作分支新增/更新本轮批准的PRD、决策及V2补充候选；不改Frozen、历史DEC/SCOPE、DEC-017的193项、旧Master、README，不合并PR #6或#7。V2正式22项与补充候选单独计数，正式V3/TBD能力不能通过“延后V2”偷换版本。产品/Mock测试不等于合约或资金生产准入。
