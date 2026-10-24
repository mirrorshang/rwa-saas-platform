# DEC-017｜Step 03：193项功能首次交付版本归属正式批准

> **Approved — 2026-10-24（仅首次交付版本归属与审核规则；V1.0整体需求仍未Frozen）**。
>
> 产品负责人明确授权：“Step 03 R-01～R-06 全部同意 A。批准193项的首次交付版本归属：V1.0 146项、V2.0 22项、V3.0 20项、待规划TBD 5项（M08-F010、M09-F009、M14-F007、M15-F008、M16-F008）。V1以合法适用的持续认购与基础配售为主，如首发工具依法必须集中募集，冻结前单独重审相关功能。请形成正式DEC、更新193项统一版本主表及可读规划和README索引。本批准不代表V1.0整体范围冻结、不批准资金链上生产执行、不修改Frozen、不合并PR #6。”
>
> **本决策所批准的逐ID版号，以[Step03 193/193逐项审核提案](../docs/03-product-prd/RWA-SaaS-Step-03-193-Function-Final-Release-Review-Proposal-v0.1.md)第“五、全193项逐ID归属审核明细”中“本轮推荐归属”列为准。** 对应生效版号已记入[193项唯一正式功能编号和首次交付版号主表](../docs/03-product-prd/RWA-SaaS-Step-03-Unified-193-Function-Release-Assignment-Draft-v0.1.md)。主表路径保留旧 `Draft-v0.1` 文件名以免历史引用中断，**内部状态现为“首次交付版本 Approved / 功能实施详细PRD Draft / 整体V1 Frozen 未发生”**。

## 一、R-01～R-06批准结果（全部 A）

| 审核号 | 正式决定 | 批准范围 |
|---|---|---|
| **R-01** | **V1.0：146项** | 193主表原V1.0全部保留；六项由DEC-016新增的正式ID均属于V1.0 |
| **R-02** | **V2.0：22项** | 受控转让M14-F001～006、高级White-label M15-F001～007等原22项照原审议归属 |
| **R-03** | **V3.0：20项** | 保留高级技术与明确产品扩展，排除下面5个暂无充分商业、法域依据的独立业务 |
| **R-04** | **待规划TBD：5项，正式ID不删** | M08-F010、M09-F009、M14-F007、M15-F008、M16-F008由原V3.0草案转为TBD；后续单独论证、重新批准目标版号 |
| **R-05** | **V1以合法适用的持续认购与基础配售为主** | 若确定的首发Instrument或法域依法要求集中募集/批次配售，**必须在整体V1冻结前重新审核** M05-F011、M10-F009、M12-F009、M12-F010及相关Offering/配售功能，不得隐性按V1支持，也不得使核心11步断链 |
| **R-06** | **仅批准193项逐ID首次目标交付版本，不等于整体V1需求冻结或工程/生产授权** | Step04分端完整功能清单、Step05字段PRD与权威资金/Token/法域方案、Step06一致性校验和冻结决定均独立保留 |

## 二、被移入TBD的5项（均保留唯一正式ID）

| 正式ID | 功能 | 原Draft归属 | 生效状态 | 后续激活门 |
|---|---|---|---|---|
| M08-F010 | 高级推荐与个性化营销 | V3.0 Draft | **TBD Approved** | 独立客户需求、隐私与商业价值验证 |
| M09-F009 | 跨机构共享KYC数据网络 | V3.0 Draft | **TBD Approved** | 法域数据保护、合规授权与责任主体证明 |
| M14-F007 | 公开订单簿撮合和AMM | V3.0 Draft | **TBD Approved** | 与非目标战略及交易监管边界另行论证、可能独立立项 |
| M15-F008 | 多级代理经销管理 | V3.0 Draft | **TBD Approved** | 代理商业模式、客户需求与权限法律责任批准 |
| M16-F008 | 开发者应用商店 | V3.0 Draft | **TBD Approved** | 与商业API/SDK独立价值、开发者需求及生态模式验证 |

## 三、有效版本数量与上游关联

- **原187项ID + [DEC-016](DEC-016-prop01-11-six-formal-function-ids-approved-version-assignments-draft.md)新增6项 = 193项正式ID**；不新增或删除模块，依旧22模块。
- 生效逐ID**唯一首次交付版号/待规划状态**：**V1.0 146、V2.0 22、V3.0 20、TBD 5，共193**。
- [DEC-011](DEC-011-primary-issuance-v1-controlled-transfer-v2.md)受控转让规划归V2继续有效；[DEC-012](DEC-012-release-versioning-replaces-priority-as-delivery-commitment.md)的V1.0“纳入即首版全部必交”继续有效；[DEC-013](DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md)、[DEC-014](DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)、[DEC-015](DEC-015-step03-xchk01-10-approved-a-function-audit.md)及DEC-016的业务方向/权威边界仍有效。
- **版号归属Approved≠已开发/可上线/已完成字段级PRD**。V1.0全部146项虽已列为首版设计与交付目标，但各端页面、状态、字段、异常、验收、合法外部资金与Token执行路径未细化、未系统验收，**整体V1.0范围不能直接标Frozen**。若出现法规/依赖强制变化，需新增正式变更决定，而非私自省略。
- V2/V3为获得目标版号的计划功能，**无发布日期、投入预算或生产可行性批准**。TBD明确不是V3的一部分，也不是取消已批准的功能身份。

## 四、下一步及明确不授权的事项

1. 将193主表中每行的“首次目标版本”标为**DEC-017 Approved**（5项TBD标“待规划 / 版号暂不承诺”），并保证一行一个有效归属。
2. 更新[业务可读版规划](../docs/03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md)、README及文档状态与权威索引；旧187历史表及以前的审批提案原样保留或仅加生效提示。
3. **下一阶段Step04**：按平台后台、Issuer SaaS、投资者门户、外部合法服务责任，梳理V1.0 146项分端功能、菜单/操作/角色/页面组和可验收责任；Step05字段级PRD，Step06全局一致性核查，再由产品负责人单独批准整体V1.0 Frozen/统一UI启动。
4. **仍未决且绝不以本决策替代**：首发法域及法律Instrument、许可/义务主体、外部资金持款与真实出款、代币合约/Token标准、合约生产签名权限、嵌入钱包及实际恢复、法定持有人登记、收益注资及Push/Claim合法完成条件、合规/安全测评。
5. 四份Frozen、所有此前DEC/SCOPE及原187历史记录不改正文。[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6)维持 **Draft/Open/Unmerged**；**没有合并、软件开发、真实资金或Token生产权限的附带授权**。

**最终状态：DEC-017 R-01～R-06 全部A Approved；193项逐ID版号已Approved，但V1.0全套详细PRD/整体范围Frozen/真实生产授权仍未完成。**
