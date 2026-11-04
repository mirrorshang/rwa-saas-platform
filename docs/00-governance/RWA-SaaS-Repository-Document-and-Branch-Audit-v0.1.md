# RWA SaaS｜GitHub 仓库文件、分支与文档权威审计 v0.1

> **审计性质：Read-only inventory + governance disposition（只读盘点、分类和清理处置建议）**
>
> 审计日期：2026-11-04  
> 仓库：mirrorshang/rwa-saas-platform（Private）  
> 当前产品文档基线：docs/regulated-activity-boundaries-v01  
> 当前文档工作分支：docs/c08-r2-product-redesign-v01  
> 关联PR：PR #6、PR #7

---

## 1. 审计结论

本轮已对仓库根目录、全部可见分支、Pull Requests、文档目录、历史归档、当前产品基线及UI代码分支进行盘点。

**结论：当前仓库存在“历史阶段文档多、多个工作分支并行、根README和状态索引更新不同步”的治理问题，但未发现可在不损害决策证据、PR依赖或代码工作的前提下直接物理删除的非空文件。**

本轮处置：
- 新增V2.0统一需求池；
- 新增本仓库审计报告；
- 更新现行文档状态索引和权威索引；
- 不删除历史DEC/SCOPE/Frozen、已标记Superseded的阶段文档或历史Legacy参考；
- 不删除分支、不关闭/合并PR、不修改代码；
- README仍按此前明确保护要求保持不变，并记录其内容已落后当前阶段。

**本轮物理删除文件：0。** 这不是遗漏清理，而是审计后没有满足“完全重复、无独立历史证据、无反向引用、无开放PR依赖”的安全删除条件。

## 2. 仓库与分支盘点

### 2.1 根目录与主分支

- 默认分支：main。
- main 当前只有16个文件，其中大部分是目录占位.gitkeep、根配置、AGENTS.md 和 README.md。
- main 是仓库基础骨架，不是当前完整产品文档基线；不能用 main 的文件数量判断产品文档是否缺失，也不能把现行文档分支内容直接删除后只保留 main。

### 2.2 当前产品文档分支

| 分支 | 审计时文件数 | 角色/状态 | 处置 |
|---|---:|---|---|
| docs/regulated-activity-boundaries-v01 | 195 | PR #6 的head / PR #7 的base；当前主要产品文档基线 | 保留 |
| docs/c08-r2-product-redesign-v01 | 199（本次新增前） | PR #7 head；承接C08-R2文档 | 保留并继续补充 |
| docs/initial-asset-scope-v01 | 25 | 上游历史文档分支，PR #5 仍Open | 保留 |
| docs/customer-hierarchy-v01 | 25 | 上游历史文档分支，PR #4 仍Open | 保留 |
| docs/reference-review-and-strategy-v01 | 24 | 上游历史文档分支，PR #3 仍Open | 保留 |

PR #7 以 docs/regulated-activity-boundaries-v01 为base，隔离新增文档，不直接把PR #6的历史差异合并进本次工作。

### 2.3 UI与代码工作分支

| 分支 | 最新提交时间（UTC） | 关系/内容判断 | 处置 |
|---|---|---|---|
| ui/issuer-asset-issuance-complete-v1 | 2026-11-03 | 当前最新Issuer UI工作分支；包含C08导航、资产、权益结构及发行页面后续增量 | 保留，作为当前Issuer UI代码检查入口 |
| ui/issuer-c08-navigation-shell-r1 | 2026-11-03 | 最新Issuer分支的祖先快照 | 保留历史里程碑 |
| ui/issuer-c08-02-instruments-i23-i25 | 2026-11-02 | 最新Issuer分支的祖先快照 | 保留历史里程碑 |
| ui/issuer-c08-01-assets-i20-i22 | 2026-11-02 | 最新Issuer分支的祖先快照 | 保留历史里程碑 |
| ui/issuer-entry-b04-commercial | 2026-11-02 | 最新Issuer分支的祖先快照；B04商业入口工作 | 保留历史里程碑 |
| ui/issuer-entry-b03-workspace | 2026-10-31 | 最新Issuer分支的祖先快照；B03工作台工作 | 保留历史里程碑 |
| ui/issuer-entry-b02-tenant | 2026-10-31 | 最新Issuer分支的祖先快照；B02 Tenant 工作 | 保留历史里程碑 |
| ui/issuer-entry-b01-auth | 较早 | 最新Issuer分支的祖先快照；B01认证入口工作 | 保留历史里程碑 |
| ui/issuer-entry-b01-b04-mvp-refinement | 2026-11-02 | 官网与入口MVP整合工作快照 | 保留 |
| ui/wdex-saas-website-v1 | 2026-10-28 | 官网初始开发快照，已被后续入口/MVP分支接续 | 保留历史里程碑 |
| codex/brickken-sandbox-audit | 2026-10-16 | Brickken竞品审计资料分支，PR #2仍Open | 保留 |

**Issuer UI分支祖先关系核验**：ui/issuer-asset-issuance-complete-v1 相比 ui/issuer-c08-navigation-shell-r1 前进3个提交；相比C08-02前进4个提交；相比C08-01前进5个提交；相比B04分支前进11个提交；相比B03/B02/B01分别前进13/15/17个提交。它是当前可见Issuer UI代码中最新的连续工作分支。

这些祖先分支虽已有更新分支承接，但记录了独立开发节点；在没有明确分支清理授权、没有完成PR/代码验收和本地工作区核对前，不删除分支。

### 2.4 Pull Request 状态

审计时仓库可见PR #2～#7，均未合并：

| PR | 内容 | 状态 | 处置 |
|---|---|---|---|
| #2 | Brickken Sandbox 竞品审计 | Open，非Draft | 保留 |
| #3 | 初期参考研究与战略 | Open / Draft | 保留 |
| #4 | 客户层级与交付模式 | Open / Draft | 保留 |
| #5 | 多资产范围原则 | Open / Draft | 保留 |
| #6 | 受监管活动责任边界（现行主文档链） | Open / Draft / Unmerged | 严格保留，不合并、不关闭、不改base |
| #7 | C08-R2产品基线、MVP范围及详细PRD | Open / Draft / Unmerged | 严格保留，不合并、不关闭、不改base |

PR #3～#7存在上游/下游分支依赖；不能通过删除上游分支或关闭PR来做“文件清理”。

## 3. 当前文件结构与文档数量

审计时：
- main：16个文件，基础骨架；
- docs/regulated-activity-boundaries-v01：195个文件；
- docs/c08-r2-product-redesign-v01：199个文件（本轮新增V2需求池和审计报告前）。

现行文档基线主要目录：
- decisions/：ARCH、DEC、SCOPE正式决策与审批证据；
- docs/00-governance/：文档权威、状态、审计与清理治理；
- docs/00-reference-archive/：四份历史Legacy V2 PRD及归档说明；
- docs/01-competitor-research/：竞品研究；
- docs/02-product-strategy/：产品战略；
- docs/03-product-prd/：Master PRD、功能主表、Step04/05、Step06及专题PRD；
- docs/04-business-workflows/：核心业务流程及历史版本；
- prototypes/website-ui-preview/：官网/Issuer原型代码和资源。

### 3.1 精确重复检查

- 对当前文档分支Git Tree中的Blob SHA进行比对，空的.gitkeep占位文件共享相同Blob属于正常目录占位。
- 未发现应作为“完全重复的非空文件”直接删除的对象。
- 同主题不同版本（例如Master PRD v0.1/v0.2、Step05-01不同批准版本）不等于重复文件；其内容和批准时间点不同，需保留历史追溯。

## 4. 当前权威文档的保留规则

### 4.1 必须原样保留

1. 四份Frozen基线：产品战略与商业模式、总体产品PRD、六能力域/22模块功能树、WF01～18跨域流程与状态机原则。
2. 全部ARCH/DEC/SCOPE原文，包括DEC-017正式193项版本归属及后续DEC-044～056。
3. 原始187项功能记录及DEC-016新增ID、DEC-017正式193项主表。
4. 现行Master PRD v0.2及其来源引用；Master v0.1作为历史版本保留。
5. Step04九批146项批准文件及Step05各场景已批准版本。
6. C08-R2基线、MVP/V2.0边界、R2-02资产管理、R2-03权益结构详细PRD。
7. 四份Legacy RWA V2参考PRD，继续留在docs/00-reference-archive/，明确其仅供历史参考。

### 4.2 已被替代但仍有历史价值

下列材料不再作为当前唯一阅读入口，但仍有历史决策/版本演进价值。此前Step03.5治理已将11份H类历史文件在原路径加上 Historical / Superseded as current reading entry 标记；本轮继续保留，不物理删除、不移动路径：

- 旧战略准备清单；
- 旧Step01/Batch整合工作稿；
- 早期V1范围与非默认范围研究；
- 旧Step02 v0.1/v0.2流程草稿；
- 早期PRD评估与路线图材料。

这些文件若要真正移动至历史归档目录，必须先制定Git重命名计划、检查所有反向引用、修复相对链接，并单独确认；不能把“已被替代”直接等同于“没有历史价值”。

### 4.3 当前阅读入口应保持唯一

| 领域 | 当前阅读/引用入口 | 历史文件处理 |
|---|---|---|
| 产品总体需求 | Master PRD v0.2 | v0.1保留为历史 |
| 193项版本归属 | DEC-017 + 193项统一主表 | 187项与旧版本计划保留历史 |
| 统一投资端与五端方向 | DEC-044～046 + Master v0.2及候选附表 | 旧四端104页地图作为历史基线保留 |
| MVP资产管理 | C08-R2-02房地产资产管理UI-Ready PRD | 旧资产模板研究保留 |
| MVP权益结构 | C08-R2-03权益结构UI-Ready PRD | A～E Instrument家族资料继续作为扩展参考 |
| V2.0需求规划 | V2.0产品需求池（本轮新增） | Legacy四份V2 PRD仅作参考，不作当前批准依据 |
| 文档状态 | Document-Status-Index + Current-Document-Authority | README保留原文，暂不改写 |

## 5. 本轮文件处置清单

| 类别 | 数量/范围 | 操作 |
|---|---|---|
| 新增V2.0需求池 | 1份 | 新建并纳入PR #7 |
| 新增仓库审计报告 | 1份 | 新建并纳入PR #7 |
| 文档状态索引 | 1份 | 更新最新入口、V2需求池和审计报告链接 |
| 当前权威索引 | 1份 | 增加C08-R2及V2需求池的后续生效说明 |
| Frozen/DEC/SCOPE/193主表 | 全部 | 不修改 |
| Master PRD v0.1/v0.2 | 全部 | 不删除、不覆盖；v0.2作为当前主入口 |
| Step04/05批准版本与历史版本 | 全部 | 当前批准版本作为阅读入口，历史版本保留 |
| README | 1份 | 不修改；现有更新时间为2026-10-26，已落后当前C08-R2阶段，列为后续单独更新事项 |
| 原型代码及图片资源 | 全部 | 不修改、不删除 |
| 旧文档分支及UI祖先分支 | 全部 | 不删除 |
| PR #2～#7 | 全部 | 不关闭、不合并；PR #6/#7继续Draft/Open/Unmerged |
| 物理删除 | **0** | 无满足安全删除标准的非空文件 |

## 6. 发现的问题与后续治理建议

### 6.1 README更新滞后

根README更新时间为2026-10-26，当前仍描述旧阶段的104页图、Step06状态等内容，没有完整反映：
- DEC-044～046五端统一投资端；
- Master PRD v0.2；
- C08-R2 R2-01～R2-03完成情况；
- 当前MVP单账号、房地产模板和三类权益结构；
- V2.0统一需求池；
- PR #7当前文档交付情况。

本轮遵循此前“README暂不修改”的明确约束，不直接更新README。建议后续单独授权更新，使其重新成为开发、运营和管理团队可独立阅读的当前项目总览。

### 6.2 状态索引与权威索引需要保持同一阅读顺序

本轮将C08-R2及V2需求池置于现行状态索引顶部，并在权威索引新增后续生效说明；下方历史阶段叙述保留，不倒改原文。

### 6.3 不建议用删除解决版本混乱

真正需要解决的是“唯一当前入口、历史文件状态标记、版本决策关系、相对链接和分支依赖”，不是单纯减少Markdown文件数量。已经Superseded的历史文件应保留原路径和证据；未来如确有无价值的临时文件，再按单文件审计处理。

---

## 7. 最终审计结论

1. 当前文档主线为docs/regulated-activity-boundaries-v01，C08-R2工作通过PR #7单独提交。
2. 当前Issuer UI最新代码工作分支为ui/issuer-asset-issuance-complete-v1；其余相关UI分支是可追溯的祖先/阶段快照。
3. 当前正式产品主入口为Master PRD v0.2；193项版号以DEC-017和193主表为准；本轮新增V2.0需求池作为未来需求集中管理入口。
4. 历史Frozen、ARCH、DEC、SCOPE、193项主表、Legacy参考和阶段性PRD均保留；已标记Superseded的历史文件不物理删除。
5. README内容已滞后，但本轮按既有保护要求不修改。
6. 没有发现可安全直接删除的非空重复文件；本轮不删除文件、不删除分支、不关闭/合并任何PR、不修改代码。

**本轮完成的是仓库权威关系、需求入口和清理策略的收敛，不代表V1整体冻结、代码已验收或V2.0已获开发授权。**
