# RWA SaaS｜C08-R2-04 Project、Offering、Token/Contract UI-Ready 产品 PRD v0.1

> **状态：Approved Product Decisions / UI-Ready Product Specification；技术/法律/生产执行 Gate 保持 Draft/Open**
>
> 整理日期：2026-11-04  
> 适用端：Issuer SaaS Web；投资者展示/认购只定义必要跨端接口事实，不重做投资者端全量PRD  
> 审核依据：[R2-04-01～05与C01～C08全部A的决策记录](RWA-SaaS-C08-R2-04-Project-Offering-Token-Decision-Log-Draft-v0.1.md)  
> 上游：[R2产品基线](RWA-SaaS-C08-R2-Product-Design-Baseline-v0.1.md)、[R2-02 Asset UI-Ready](RWA-SaaS-C08-R2-02-Asset-Management-Real-Estate-UI-Ready-PRD-v0.1.md)、[R2-03 Instrument UI-Ready](RWA-SaaS-C08-R2-03-Rights-Structure-UI-Ready-PRD-v0.1.md)  
> 范围：[MVP/V2.0延后范围](RWA-SaaS-C08-MVP-V2-Deferred-Scope-v0.1.md)、[V2.0需求池](RWA-SaaS-V2-0-Requirements-Backlog-and-Planning-Pool-v0.1.md)

---

## 1. 完成状态、适用范围及责任

### 1.1 用户明确审核结果

| 批次 | 主题 | 结果 |
|---|---|---|
| R2-04-01 | Project定义、生成、归属、轮次与归档 | R01～R08全部A |
| R2-04-02 | Offering基础参数、数量/单价/容量预留及版本 | R01～R10全部A；1U=1USDT |
| R2-04-03 | KYC简化、最低/累计上限、单一窗口、版本保护 | 修订版全部确认 |
| R2-04-04 | Offering七个正常状态、暂停/恢复/结束、Unknown | R01～R10全部A |
| R2-04-05 | 逻辑Token、复用、最大供应、合约/部署/Mint/Burn | R01～R10全部A |
| 一致性审核 | C01～C08对象、轮次、账本、暂停、快照、Gate、KYC、存续 | C01～C08全部A |

本文件只把已确认的业务规则具体化为当前MVP页面、操作、校验、空态和验收。字段的数据库名称、Token标准/Decimals、合约架构、链上网络、外部Provider/Signer/API及法域批准仍是独立技术/法律决策，不视为本文件已完成。

### 1.2 三个核心业务职责

- **Project（项目管理）**：自动生成的Asset发行生命周期容器；查看资产、权益结构、发行轮次和进度，不再手动建立空项目，也不复制Offering配置表单。
- **Offering（发行方案）**：一轮具体发行、认购条件和销售窗口；确认后预留权益容量，发布后才进入投资者披露/认购生命周期。
- **Token（逻辑凭证）/Contract（部署实例）**：每个Instrument一个逻辑Token，多个Offering引用同一个Token身份；一个生产主合约是产品目标，不是已获技术验证或部署权限。

### 1.3 MVP总体约束

- 当前Asset模板仅支持已建成单一房地产物业，支持住宅/办公/商业/工业物流四类；底层可扩展多资产。
- Instrument仅支持Equity、Debt、Income Participation三类基础权益。
- 每家企业一个操作账号，不做企业成员/角色分权/内部审核。
- 一个Project一个Asset；一个Asset默认一个Project；一个Project可有多个顺序Offering。
- 一个Offering仅引用一个Project、一个Asset、一个明确Instrument版本和其逻辑Token。
- 同一Project只有一个可发布/已发布/开放认购/暂停待恢复的当前轮次；后续轮次可保存Draft，不并行开放。
- 金额单位U，**1U=1USDT**；投资者支付固定**OP Mainnet USDT**；支付网络不推导Token部署网络。
- KYC**审核通过且有效**后获得基础认购资格；Issuer不另设Offering级投资者分类、白名单、地区列表或资格审批；强制AML/制裁、法域、生产准入仍必须验证。
- Free Sandbox仅模拟；Standard不自动获真实发行许可。

## 2. 对象关系、身份和唯一性

### 2.1 权威关系图（业务意义）

`Enterprise → Asset → Instrument → Logical Token`

`Asset → default Project → Offering 01 / Offering 02 / ...`

`Offering → fixed Instrument Version → logical Token identity / mapping version → optional approved Contract Deployment`

- Asset可有多个Instrument，各Instrument容量池、权益单位及逻辑Token互相独立。
- 同一Asset首次创建Offering时系统自动创建一个默认Project；后续发起Offering自动匹配复用该Project。
- Project存在时不能因点击多次“创建发行方案”而产生重复项目；操作幂等。
- Project归属唯一Asset，Offering归属唯一Project，且Offering的Asset必须与Project Asset一致。
- 同一Project允许不同时期对不同Instrument独立发行；但单次Offering不能混合Instrument。
- 一个Instrument固定一个逻辑Token身份。版本更新不得暗中改变既有Token代表的历史权利；是否可以复用原Token承载发生实质变化的Instrument新版本，应进行影响检查，不通过则不得继续新Offering。

### 2.2 项目自动生成/复用

| 触发 | 系统行为 |
|---|---|
| 从符合条件的Instrument详情点击“创建发行方案”，Asset尚无Project | 原子性新建Project、绑定Asset、创建Offering Draft |
| Asset已有Project | 复用现有Project，新建对应Offering Draft |
| 从项目详情点击“新建发行方案” | 预填只读Asset，选择该Asset下可用Instrument版本，创建Offering Draft |
| 重复点击/网络重试 | 返回原成功结果或提供安全去重；不得创建重复Project/Offering |
| Instrument不Ready或已Suspended/Terminated，或Asset Restricted/Archived | 禁止创建可正式确认的Offering，展示关联阻断原因 |
| 企业切换Tenant | 当前数据严格按Tenant过滤，不跨企业暴露Project、资产或Token |

项目名称可采用Asset名称及系统ID显示，唯一身份以系统ID为准。企业不需要先填写独立项目资料；避免在Project和Asset重复维护同一字段。

### 2.3 轮次排他与时序（C02）

- 一个Project可存在历史Completed/Ended/Settling及未来Draft，但同一时刻仅有一个**当前可发布/已发布/开放认购/暂停后可恢复**的轮次。
- 后续轮次可提前创建Draft并编辑；未取得当前轮次使用资格时不能抢先进入对外发布或开放认购。
- 当前轮次认购关闭后，允许下一轮进入准备路径的前提是相关容量已按权威事实核对、未被未知结果锁住，不存在违法或技术冲突；不强制等整个Asset生命周期终结。
- 数据库/API层必须阻断并发请求导致的重复当前轮次；仅隐藏按钮不满足排他要求。

## 3. 页面地图与导航

一级导航：**资产与发行**。二级菜单固定：
1. 资产管理
2. 权益结构
3. 项目管理
4. 发行方案
5. 发行准备

本模块只开发Project、Offering以及Offering内的Token摘要/配置，不增加独立“Token配置中心”必经导航。

| 页面/区域 | 入口 | 页面目的 |
|---|---|---|
| Project列表 | 资产与发行 → 项目管理 | 企业所有自动生成的项目，进入详情 |
| Project详情 | Project列表 → 点击项目 | 资产/权益结构关联、发行轮次、项目总览与归档 |
| Offering列表 | 资产与发行 → 发行方案 | 全企业发行轮次检索、状态、核心发行金额与操作 |
| Offering创建/编辑 | Instrument详情或Project详情 → 创建发行方案；列表编辑 | 简单三步填写、保存、确认 |
| Offering详情 | Offering列表/Project详情 | 版本、发行参数、认购数据、生命周期和Token结果 |
| Token摘要与执行状态 | Offering详情内部区域 | 显示复用身份、供应/分配/Mint差异、映射/技术Gate；非独立业务流程 |
| 版本/操作记录 | Offering详情页签或侧栏 | 查看条件、披露、操作、额度、Token事件的历史 |
| 发行准备入口 | Confirmed Offering详情 → 发行准备 | 跳转R2-05检查和发布；此文件不提前冻结R2-05 UI细节 |

## 4. Project列表和详情：UI-Ready

### 4.1 Project列表

列与交互：
- 项目名称/系统编号（点击详情）；
- 对应Asset名称与物业类型；
- 关联Instrument数量/摘要；
- Offering总轮次及当前轮次状态；
- 最近更新；
- 查看项目操作。

筛选：项目名称/Asset关键词、当前发行状态。空态：“尚无发行项目，请先创建资产及权益结构，然后发起发行方案，系统将自动创建项目。”不提供“新建空项目”按钮。

### 4.2 Project详情

固定分区：
1. 项目概览：项目名、系统编号、Asset名称/类型/状态、当前发行进度。
2. 关联权益结构：列表显示Instrument名称、类型、状态、版本及权益容量链接。
3. 发行轮次：Offering编号、名称、状态、认购开始/结束、最大发行权益量、最大Token量、募集规模、已确认分配及Mint摘要。
4. 历史记录：项目创建时间、关联与状态变化。

主要按钮：
- “查看资产”“查看权益结构”“查看发行方案”；
- “新建发行方案”：满足Asset/Instrument和同轮排他守卫后允许创建Draft，存在当前活动轮次时可只允许保存下一轮草稿；
- “归档”：必须无未完结发行及存续义务且符合档案规则；展示关联影响，二次确认。

归档不删除Asset、Instrument、Offering、投资者持仓、账本、文件快照或Token历史；项目删除不提供为常规操作。

### 4.3 Project异常

- 不存在Asset或Asset已Restricted/Archived：显示相关状态，禁止发起新正式发行。
- Instrument不可用：显示缺失条件与返回权益结构入口，不允许悄然选择无效版本。
- 与历史Offering存在不可消除的引用：禁止删除/归档或提示未结事项。
- 项目重复创建并发：保证单一默认Project，安全返回可访问的已有记录。
- 服务失败/无权限：保留筛选、显示可理解错误、支持安全重试；不显示其他企业信息。

## 5. Offering创建/编辑：单一三步骤

### 5.1 第一步：基本信息与对象引用

| 字段 | 来源/规则 |
|---|---|
| Offering名称 | 企业输入；必填 |
| Offering轮次编号 | 系统自动生成，不可改 |
| Project | 根据Asset自动关联，展示只读名称/ID |
| Asset | Project唯一Asset，只读，显示状态/版本 |
| Instrument | 从该Asset的可用Instrument中选择，必填 |
| Instrument Version | 根据已选Instrument确定并锁定待引用版本 |
| 逻辑Token身份 | 由Instrument自动取得或首轮自动生成，显示摘要 |
| Token名称及Symbol | 由Instrument继承/系统生成，首次正式确认前可按规则调整，确认后锁定 |

创建Offering草稿允许未完成的参数留空；但不能产生与其他Asset、Instrument、Project的非法交叉引用。

### 5.2 第二步：本轮发行数量与价格

| 字段 | 控件/来源 | 规则 |
|---|---|---|
| 当前权益总授权容量 | 系统只读 | 继承Instrument容量池，不可直接在Offering修改 |
| 已确认分配量 | 系统只读 | 对应同一权益计量口径 |
| 其他有效Offering预留 | 系统只读 | 不能与订单内部预留重复计数 |
| 当前剩余可发行权益额度 | 系统只读 | 按R2-03权威公式计算 |
| 本轮最大发行权益量 | 企业输入，必填 | 单位继承权益类型（股/U/固定比例）；必须>0且不超过当前权威可用额度 |
| 固定Token映射 | 系统只读 | 继承Instrument明确版本，不接受Offering修改 |
| 本轮Token最大发行数量 | 系统自动计算 | 按权益数量及映射比例计算，不得静默舍入 |
| Token最大供应量 | 系统只读 | Instrument总授权容量与Token映射计算 |
| Token单价 | 企业输入，必填，U/Token | 必须>0；一轮固定一个单价 |
| 最大募集金额 | 系统自动计算 | 本轮Token最大数量×固定单价，单位U；1U=1USDT |
| 投资者支付方式 | 系统只读 | OP Mainnet USDT；不提供其他币种/网络选项 |

三种Instrument分别展示正确单位：
- Equity：股份数量；
- Debt：本金U；
- Income Participation：固定收益参与比例（不可把百分比与U或股份数相加）。

### 5.3 第三步：基础认购规则与确认

| 字段 | 规则 |
|---|---|
| 开始时间 | 必填，展示明确时区；系统按统一时间事实处理 |
| 结束时间 | 必填，必须晚于开始时间 |
| 单笔最低认购金额 | 企业输入，U，正数，不能大于本轮最大募集额 |
| 每位投资者累计最高认购金额 | 可选，U；设置后不得低于单笔最低额，不得大于本轮最大募集额 |
| 必要条款/披露信息 | 引用Instrument、Offering适用文件版本；保留独立披露控制 |
| 投资者资格配置 | **不提供企业配置字段**；有效KYC自动基础准入，强制受控规则仍校验 |

固定三个页面步骤：**基本信息 → 发行参数 → 认购规则与确认**。MVP不额外增加Issuer自定义KYC类型/地区、白名单、优先级、Soft Cap、批次、动态价格或企业审批步骤。

### 5.4 保存、确认与撤销

| 按钮 | 条件与结果 |
|---|---|
| 保存草稿 | 可缺少完整字段；Offering为Draft；不占用权益池；不发布 |
| 上一步/下一步 | 保存当前输入并做当前步骤基本校验；允许返回修改 |
| 确认发行方案 | 完整业务校验通过，固定Asset/Instrument/映射/条款版本；权威服务以事务/幂等形式预留本轮全部权益容量，进入Confirmed |
| 撤销确认并重新编辑 | 仅在没有有效认购、没有不可撤销下游业务事实且容量可按权威记录安全释放时允许；版本和撤销原因留痕，不能覆盖历史 |
| 进入发行准备 | Confirmed状态时跳转R2-05；不允许直接跳过准备检查发布 |
| 发布 | 只能由R2-05受控流程执行；本页面不提供绕过准备检查的直接生产发行入口 |

### 5.5 金额、数量与精度校验

- 权益量、Token量、Token单价、募集金额分别保存/展示，不用一个“发行总额”字段代替。
- 权益剩余额度在确认时必须重新从权威服务读取；草稿页面显示的实时提示不是占用承诺。
- Token量 = 权益量÷每Token代表的权益单位，或按Instrument明确的等价固定映射表达；不得臆定1:1。
- 最大募集金额 = 本轮Token最大发行数量×每Token固定价格；V1统一U，无外汇换算。
- 业务层必须检验映射数量可被经批准的Token精度/权益最小单位准确表达；无法表达或精度超出已核准模型时Fail-Closed，不进行自动丢弃/四舍五入。
- 当前未冻结真实Token Decimals、合约标准和支付资产技术精度；不在UI中伪造默认技术结论。Free Sandbox可模拟已明示的映射，真实生产须经独立Gate核验。
- 最低认购金额及可选累计上限必须能转化为有效的Token数量和权利单位；不可形成不可分配的碎额。

## 6. Offering列表、详情及版本记录

### 6.1 Offering列表

展示字段：Offering名称/轮次、所属Project/Asset、Instrument及类型、状态（含暂停阻断）、本轮权益量、Token最大发行数、Token单价、最大募集额、认购窗口、当前认购进度、更新时间、查看/编辑/发行准备入口。

筛选：关键词、Project/Asset、Offering状态。状态不可用颜色单独表达，应同时显示明确文字。列表不提供跨轮“统一配售”或“多轮一键发布”。

空态：尚未创建发行方案，提示从有效Instrument或Project进入；查询无结果与访问失败分别显示。

### 6.2 Offering详情

六个固定内容区域：
1. **发行概览**：名称、编号、Project、Asset、Instrument版本、当前主状态及暂停/风险标记、轮次时间。
2. **发行参数**：权益最大数量/单位、Token最大数量、Token单价U/Token、最大募集额U、固定映射。
3. **认购配置**：窗口、单笔最低、可选每人累计上限；没有企业资格配置分区。
4. **容量与进度**：总授权/已确认分配/有效预留/剩余可发行；当前轮订单使用、已承诺、已确认分配、已Mint分开。
5. **Token及Contract信息**：逻辑Token名、Symbol、最大供应、分配/Mint差异、Contract是否仅模拟/等待准入/已部署及相关已获准信息；不把未部署状态写成已上链。
6. **文件、披露快照及操作历史**：版本、预览、订单条款引用、状态事件、原因、外部Intent及结果（按权限）。

### 6.3 发布与合同条款快照（C05）

- Confirmed冻结Offering核心参数和当时Asset、Instrument、Token映射、法律文件等关键版本引用。
- Published建立投资者可见的Publication Snapshot，保存实际发布的资产摘要、权益条款、价格、数量、窗口与披露文档版本。
- 历史报价、订单、签署、支付、配售及Token记录应引用创建时的对应快照。
- 企业后续改动当前Asset/Instrument/文件不自动改写已发布Offering或历史认购事实。
- 已确认且有订单的核心配置不可原地覆盖；不得为了“继续编辑”而抹除已发生事实。
- 重大规则变化可能需要暂停新认购、重新检查和形成新发布版本；不能静默替换原订单依据。

## 7. Offering状态机：主状态+阻断标记

### 7.1 七个正常主状态

`Draft → Confirmed → Published → Active → Ended → Settling → Completed`

| 状态 | 进入条件 | 企业操作/系统守卫 |
|---|---|---|
| Draft | 新建且未确认 | 编辑、保存、删除无引用空草稿（须检查无下游记录）、确认 |
| Confirmed | 资料校验通过，权益容量成功预留 | 进入R2-05发行准备；若无下游事实可安全撤销确认 |
| Published | R2-05准备通过且企业明确发布 | 等待认购开始；显示发布快照；允许按规则撤回 |
| Active | 已到开始时间，所有必需规则仍满足，且未暂停 | 允许KYC通过且满足强制守卫的投资者创建订单；企业可暂停 |
| Ended | 到期或有效发行量售罄 | 禁止新订单；在途订单继续处理、核对 |
| Settling | 本轮结束，正处理订单、到账、配售、登记、Token分配与异常 | 展示待处理数量及独立状态，不把Unknown判成功 |
| Completed | 必要本轮发行事实均完成或已按规则关账 | 本轮只读为主，进入持有、收益及存续业务入口；保留历史 |

### 7.2 暂停为叠加阻断状态（C04）

- 用户可见“已暂停”，内部同时保留原主生命周期状态、暂停来源（企业/系统）、原因及时间。
- 企业主动暂停时要求原因；暂停后禁止创建新认购，但保留已存在订单、金额及容量占用。
- 合规/法域、Asset Restricted、Instrument Suspended、Provider/Signer等系统风险阻断，不能由企业普通恢复按钮直接解除。
- 恢复先验证根因已解决、认购窗口有效、容量与平台生产Gate全部通过；不能从过期窗口跳回Active，也不能绕过R2-05发布条件。
- 暂停不释放权益容量；不得误将暂停计为Offering失败/终止。
- 已有交易时撤回/终止必须走受控流程，订单、款项、Token/法定权益均单独处理。

### 7.3 自动行为与状态独立性

- Published到达开始时间后，在守卫全部满足且无暂停阻断时自动进入Active，否则继续阻断并展示原因。
- Active到达结束时间或权威可售额度归零时转Ended并拒绝新订单；在途订单不自动作废。
- Ended后进入Settling，资金状态、订单状态、配售状态、Token执行状态必须分别可查询。
- Completed不代表持仓消失、法定登记完成、资产归档、收益义务或债权到期履行结束。
- 状态更新、容量预留、发起支付/链上Intent及回调均需幂等；重复提交不得产生重复结果。

## 8. 容量池、Token供应量和订单记账

### 8.1 权威容量公式

**权益剩余可发行量 = Instrument总授权容量 − 已确认分配量 − 尚未完成Offering的有效预留量。**

权益计量单位按Equity/ Debt/Income Participation分别独立。Offering确认时建立有效预留；本轮订单预留在Offering内部计算，不再对Instrument重复扣减。已承诺从预留转化，不重复扣；Mint成功只记链上执行事实，不再次扣权益池。

### 8.2 额度转换与释放

| 事件 | 必须保留的事实 |
|---|---|
| 保存Draft | 无权益占用 |
| 确认Offering | 以本轮最大发行权益量生成一笔幂等有效预留 |
| 投资者下单 | Offering内部订单预留；不重复占用Instrument权益池 |
| 付款确认/配售 | 订单、资金与权益已承诺/已确认分配各自记录并转换占用 |
| 暂停Offering | 有效预留保留 |
| 到期/售罄/关闭 | 只有在订单及资金事实可核对后释放未承诺的剩余预留；Unknown不提前释放 |
| Mint成功 | 记录Token执行结果；不重复扣权益 |
| Mint失败/Unknown | 记录异常并按原Intent核对；不删除已确认分配 |
| Burn | 默认不自动恢复权益总授权或剩余可发行额度 |

### 8.3 Token四组数量

- Token最大供应量（Instrument总授权映射）；
- 本轮Offering计划最大发行Token量；
- 本轮/全部已确认分配Token量；
- 实际Mint成功Token量。

四者口径独立：已分配不等于Mint；不同Offering同一逻辑Token供应上限共享，必须校验累计不超上限；订单Unknown不得被当作额度已经释放。

## 9. 逻辑Token身份与合约生产边界

### 9.1 Token元数据

| 字段 | 来源/编辑 |
|---|---|
| 逻辑Token ID | 系统唯一生成 |
| 关联Instrument ID及版本 | 系统关联/固定 |
| Token名称 | 默认继承Instrument，初次确认前允许调整 |
| Symbol | 系统生成，初次确认前允许调整，之后锁定 |
| 权益单位→Token映射比例 | Instrument固定版本，只读 |
| 最大供应Token量 | 依据总授权容量与固定映射自动计算 |
| 本轮发行Token量 | Offering自动计算，只读 |
| 实际Mint总量/本轮Mint量 | 链上权威结果核对后展示 |
| Token发行网络/标准/Decimals | 平台技术准入配置；未批准时标记“待技术确认”，不开放企业选择 |
| Contract部署实例/地址 | 仅成功部署并完成链上核验后记录，Sandbox仅模拟标识 |

### 9.2 单生产主合约技术验证门（C06）

**产品批准目标：V1一个生产主合约，支持各Instrument对应不同逻辑Token。**

它**并不等于**ERC-20/721/1155标准已批准；采用单主合约却服务多个互不相同的法律权利、Token供应池，必须由技术团队就Token区分方式、可转让性、网络/合约安全、升级/权限和法律效力另行论证。若目标方案无法安全满足各Instrument隔离，不允许因该产品目标直接上线，应独立重新审议架构，不能由开发私自变更业务含义。

真实部署、Mint/Burn、Signer、Provider、链网络及执行权限均受既有X-01～X-13 / 生产Gate；当前文档不批准生产执行。

### 9.3 Token执行事实

- 允许提交Mint意图的前提是资金确认、必要权威配售/权益分配及正式生产Gate均已满足；不能在保存Offering或确认额度时直接Mint。
- Mint/Burn命令和状态应有独立Intent、交易标识、状态（未发起、进行中、成功、失败、Unknown等产品视图），不能把“请求已发送”展示为“完成”。
- Burn需独立权利与授权依据；默认不恢复权益容量，不等于投资者法定权利自动终止。
- 在Free Sandbox仅展示明确的模拟结果，不生成真实链上Token或真实投资者权利。

## 10. 操作权限、页面交互与异常

### 10.1 企业操作权限

MVP企业仅一个操作账号，无多角色审批、复核或企业内部权限矩阵。但服务器端仍要校验Tenant归属、对象状态及生产门，企业不能越权操作其他企业、解除平台风险阻断或调用真实合约生产命令。

### 10.2 关键异常处理清单

| 异常 | 用户可见行为/系统处理 |
|---|---|
| Asset不Ready或Restricted/Archived | 阻止新正式Offering确认或发布，提供资产详情修复入口 |
| Instrument不Ready/Active，或Suspended/Terminated | 阻止不适用操作，展示权益结构状态及容量 |
| Project对应Asset与Instrument关联Asset不一致 | 阻止创建/确认，不能静默改绑 |
| 同Project已有当前可发布/认购轮次 | 允许后续草稿，不允许重复抢占发布/可售位置 |
| 权益剩余额度不足 | 阻止确认，展示最新权威余额、已分配和有效预留 |
| 并发确认/重复提交 | 幂等去重，后提交发现容量变化时拒绝超额预留 |
| Token固定映射不合法或不可准确表示 | 阻止确认，显示权益单位、映射比例、Token精度依赖 |
| 最大募集金额计算不合法/数量或价格无效 | 阻止确认，标记字段及计算错误 |
| 最低额高于可募集额、累计上限低于最低额 | 阻止确认，定位规则字段 |
| 结束时间早于/等于开始时间 | 阻止确认，展示明确时区 |
| KYC未通过或失效 | 投资者不能创建有效订单；Issuer不获得逐笔人工覆盖按钮 |
| 强制AML/制裁/法域准入失败 | Fail-Closed，不允许真实订单或生产发行 |
| Offering已发布但尚未到开放时间 | 允许按披露查看；禁止下单 |
| 已到期/售罄 | 关闭新认购，不删除已有有效订单 |
| 企业暂停 | 展示原因，停止新单，保留容量和已存在订单 |
| 系统风险暂停 | 禁止企业自行解除，显示必要的恢复指引 |
| 版本冲突或已引用核心条款变更 | 禁止覆盖历史，提示新版本/重新检查及可能暂停 |
| 文件扫描失败或版本引用失效 | 阻止需要该文件的发布准备检查；不将文件默认为有效 |
| 支付/Mint/链结果Unknown | 先对原Intent查询和核对，保留业务事实与锁定额度，禁止盲目重试 |
| UI保存失败、网络断开 | 保留已填写字段、明确失败并支持安全重试，不声称已成功 |
| 无权限/Tenant切换 | 服务端禁止读取或写入其他Tenant对象 |

### 10.3 版本与操作日志

记录操作人/来源、时间、前后主状态、暂停阻断、理由、Offering Version、Asset/Instrument/文件/映射版本引用、订单/支付/Token事件指针；投资者历史条款不得因企业后续修改而静默变化。

## 11. UI布局与体验验收

- 1440px：左侧导航与列表/详情完整展示；三步Offering表单有明确步骤提示，权益容量及Token映射只读摘要可读。
- 1280px：不出现页面级水平溢出；表格可局部横向滚动，核心操作、状态及错误信息始终可用。
- 单页项目管理不引入多套审核流程；Offering配置只有三步和必要字段。
- “权益量”“Token量”“Token单价”“最大募集金额”必须分别展示，并展示各自单位。
- “已确认分配”“已Mint”“合约已部署”必须分别展示，不以统一“发行成功”掩盖未完成事实。
- 操作按钮依据当前主状态、暂停阻断、权限与生产Gate正确启用/禁用。
- 空态、无结果、保存失败、暂停/风险阻断、版本冲突、Unknown均有明确中文文案与修复/查询入口。

### 11.1 功能验收场景

1. 有效Asset/Instrument首次创建Offering时自动建立Project，后续重试不重复建立。
2. 同Asset后续Offering自动复用Project；新轮次可Draft，不能抢占当前认购轮次。
3. 非Ready Asset、Suspended Instrument、跨Asset关联、跨Tenant访问均阻断。
4. 三类Instrument权益单位和Token映射正确，Token数量自动计算；不同权益单位不可混算。
5. Token名称/Symbol首轮确认前可按规则调整，确认后锁定；后续轮次复用逻辑Token。
6. Draft可保存不完整表单且不占用容量；Confirmed仅在权威额度足够时预留一次。
7. 订单内部预留/已承诺/已分配/Mint各自独立，不对Instrument权益容量重复扣减。
8. 1U=1USDT、固定Token单价、单笔最低/可选累计上限、单一窗口均正确。
9. Issuer Offering无投资者类别/地区白名单/企业人工资格审批；KYC通过自动基础资格但强制风险守卫仍生效。
10. Confirmed没有发布或真实收款/Mint权限；Published/Active必须经R2-05和受控生产Gate。
11. Published在到达开始时间且无阻断才自动Active；到期/售罄停止新订单，旧订单可继续处理。
12. 企业暂停/系统风险暂停保留原生命周期阶段及容量；企业不能解除平台强制阻断。
13. Confirmed、Published及历史报价/订单/披露文件快照按节点固定；已引用核心条款不可原地覆盖。
14. 结束后处理在途订单、资金和Token；只有本轮必要事实收口才Completed；后续持仓收益义务保留。
15. 外部执行Unknown时不得重复支付/Mint、不得释放未核明容量；Token Burn不自动恢复权益容量。
16. 两个并发确认及重复点击不会重复预留或生成重复Offering。
17. 不可精确映射权益/Token的数量被阻断；未冻结Decimals/主合约标准不得伪装为生产可用。
18. 1440px与1280px执行Project列表/详情、Offering三步创建/编辑、详情、暂停/恢复、历史和异常验收。

## 12. 复杂能力后置和正式版本保护

延后至V2补充候选（非DEC-017正式22项新增）：企业内部多角色与审批、Offering独立投资者资格/白名单、多阶段窗口、复杂分层限额、同Project多轮并行发行、多资产/多Instrument组合发行、复杂状态编排、复杂终止补偿、企业自定义Token配置、多链及复合Token。

如某能力在DEC-017已正式归入V3/TBD（如复杂资产组合、动态定价、复杂超额、公开AMM或商业API），仍维持原版号。本文件不修改193项主表。与旧V1 M09资格功能ID的交付深度冲突依照V2需求池保留，待独立DEC分离基础强制守卫与企业高级自定义资格能力。

## 13. 开发移交顺序与非授权事项

建议按最小闭环拆分：
1. Project自动创建/复用及列表/详情；
2. Offering三步创建、编辑、权威容量预留及版本；
3. Offering列表/详情、生命周期和暂停；
4. Token逻辑身份/供应摘要、固定映射与异常记录（先Mock和权威业务状态，不触发生产链）；
5. R2-05发行准备与发布入口联通；
6. 跨模块Playwright/Route/Build/Test及各项边界验收。

R2-05尚需明确逐项发行准备清单、页面预览、最终声明、发布动作、合法生产Gate反馈。本文件只定义其前置/后续关系，不提前冻结R2-05的具体页面字段或合法性审批。

**禁止从本PRD推断Provider、Signer、合约标准/多Token主合约实现、合约部署、Mint/Burn、真实收款、真实法定登记或平台监管许可已获准入。PR #6/#7保持Draft/Open/Unmerged，四份Frozen、历史DEC/SCOPE、193项版本归属、Master旧正文和README不改。**

---

**结论：R2-04五批+一致性审核C01～C08已全部批准，本UI-Ready PRD提供Project、Offering及逻辑Token/Contract的MVP开发交接规格。真实生产技术与合规Gate、R2-05发行准备及整体跨端集成验收不因该设计完成而自动通过。**
