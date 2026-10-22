# RWA SaaS Platform｜产品总览

> **项目性质**：从零建设的标准化、可配置、多资产 RWA Tokenization B2B SaaS。
>
> **当前阶段（2026-10-23）**：**Step 03.5 文档治理整理，下一步回到 Step 03 版本与新增功能审核。** 尚未进入正式 UI 设计、软件研发、真实资金/Token 生产执行。
>
> **唯一当前文档权威与审批状态入口**：[当前有效文档目录与历史覆盖索引](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)；[完整文件与 DEC/SCOPE 状态清单](docs/Document-Status-Index.md)；[Step03.5首轮审计及原95文件分类](docs/00-governance/RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md)。

## 1. 我们要做的产品

**首要客户**：有持续发行需求的发行企业与资产管理机构（Issuer）；此外规划 White-label 运营商和商业 Open API 客户，具体交付版本以后续批准为准。

**首期产品边界**：企业购买并开通 Issuer SaaS，使用自己的发行工作台及标准独立投资者门户，对合法的金融权益工具完成发行、投资者认购、真实结算、发行后管理及适用资产的收益/本金/退出流程。**投资者通常由 Issuer 自行拓展和运营**；不默认经营公开 RWA 资产超市。

**产品基本规则**：Asset、法律 Instrument 权益、Offering、法定持有人登记、资金实收/实付、链上 Token 各有自己的权威状态；Token 已交付不必然意味着法律权益已生效，钱包付款成功也不意味着配售和权益登记完成。平台提供软件与合法受权操作编排，**不默认自己持有募集款、成为法定登记者或替客户控制所有合约私钥**。全球化是标准化架构目标，不表示无需选择首发法域或取得相关许可。

本项目独立于 WDEX，Brickken 为主要竞品参考之一；历史 RWA V2 PRD 已归档作参考，不代表本项目自动批准其中的需求。

## 2. 已审核通过的核心业务流程（七段易读版）

1. **企业购买 SaaS**：官网申请/注册、KYB、订阅与商业付费或受控人工合同、创建并授权 Tenant。
2. **企业配置工作台与投资者门户**：组织成员/角色权限、标准独立 Portal URL、基础品牌、公开与定向 Offering。
3. **企业准备并发行资产**：A债权/B SPV股份参考受控模板、合法文件与专业意见、Offering定价/额度/适格规则、经授权Contract Factory与合约部署。
4. **投资者认购及合法交付**：门户注册、KYC、外部或安全嵌入式钱包、签署与认购、USDT/USDC真实付款、合规配售、必要法定登记、Token交付与持仓展示。
5. **发行机构管理募集资金**：查询销售与收款、区分受限/可结算余额、受权申请划拨、核验真实到账；不把退款与结算视为同一种付款。
6. **发行后收益或本金分配**：按债权/公司法定权利和记录日核算与审批、实际注资和足额核验，按适用合法方式 Push 或 Claim、查询未领/已付记录。
7. **存续与依法退出**：持续披露、A债到期清偿与逾期处理、B股份仅在合法前提下进行适用回购/注销，法定权益与 Token 变化独立核对。

[DEC-014：原始11步核心流程11/11已 Approved](decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md)。[Step02 v0.3 可编辑四端详细流程图](docs/04-business-workflows/RWA-SaaS-Step-02-Four-Lane-Core-Flow-Approved-CR-v0.3-Draft.md)供详细 PRD 与工程使用，**技术字段和资金/法律方案仍未冻结**。

## 3. 当前版本规划（**全部为范围草案**）

| 版本 | 当前业务目标 | 原187项的建议数量（非正式开发承诺） |
|---|---|---:|
| **V1.0** | 首版完整发行SaaS闭环，包含标准门户、钱包、受权发行、投资结算及适用收益和退出 | 140 |
| **V2.0** | 受控转让、专业高级White-label与运营增强 | 22 |
| **V3.0** | 商业Open API/SDK、多链与高级资产/服务商生态 | 25 |

**DEC-012 已 Approved的是管理方法**：V1.0 = 第一版真正承诺开发及验收的完整功能集合；不再在 V1.0 内以 P0/P1/P2 区分必做/可选。以上140/22/25依旧是**原187项的Draft候选统计**，不是已批准的逐项唯一版本，且 [PROP-01～11](docs/03-product-prd/RWA-SaaS-Step-03-Cross-Domain-Gaps-Duplications-and-Decision-Gates-v0.1.md)尚待判断扩原ID还是新立正式ID。原P0/P1/P2保留为历史审计证据。

[按七段流程阅读三版本业务范围草案](docs/03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md) ｜ [187条逐ID目标版本Draft表](docs/03-product-prd/RWA-SaaS-Version-Plan-V1.0-V2.0-V3.0-187-Function-Migration-Draft-v0.1.md)

## 4. 已批准和未完成的范围

| 成果 | 当前状态 | 资料入口 |
|---|---|---|
| 战略、总体PRD、22模块功能树、WF01～18状态机 | **四份有条件/原则Frozen** | [文档权威目录](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md#2-正式可引用的四份冻结业务基线) |
| 六批业务原则 Batch01～06 | **Approved：产品最小规则，不是完整字段PRD** | [完整批准状态表](docs/Document-Status-Index.md) |
| CR01～10 产品方向 | **DEC-013 Approved A** | [DEC-013](decisions/DEC-013-cr01-10-v1-complete-loop-and-release-directions-approved.md) |
| 企业11步核心业务主流程 | **DEC-014 Approved** | [DEC-014](decisions/DEC-014-step02-issuer-core-eleven-step-flow-reviewed-approved.md) |
| Step03 原187功能与流程纸面对照、缺口审核原则 | **187/187已完成纸面关联；DEC-015 XCHK原则 Approved** | [逐项对照](docs/03-product-prd/RWA-SaaS-Step-03-187-Function-Bidirectional-Flow-Audit-Matrix-v0.1.md)、[DEC-015](decisions/DEC-015-step03-xchk01-10-approved-a-function-audit.md) |
| Step03.5文档统一导航/历史入口标记 | **治理整理中；审计不是新产品冻结决定** | [Step03.5现行权威索引](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md) |
| V1.0/V2.0/V3.0真实功能数量、PROP新增编号 | **Draft / 未批准** | [功能范围审查稿](docs/03-product-prd/RWA-SaaS-Step-03-Release-Plan-V1.0-V2.0-V3.0-Readable-Review-v0.1.md) |
| 法域、资金/托管/分配执行主体、钱包/合约技术与上线许可 | **TBD** | [未决风险与决策覆盖](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md#4-关键决策的有效范围与历史覆盖矩阵) |

## 5. 从现在到 UI 前的顺序

- **Step 03.5 收尾**：统一现行索引、标记历史版本、关键事实交叉审查，不覆写历史批准/冻结原文。
- **Step 03 范围收口**：逐功能审定 V1.0/V2.0/V3.0版号，解决 PROP-01～11的新正式ID或原ID扩深，批准唯一版本功能清单。
- **Step 04 分端功能清单**：平台运营后台、Issuer工作台、Issuer投资者门户、外部合法主体责任；菜单/模块/页面组/入口/权限与功能。
- **Step 05 详细产品PRD**：按端/模块完善字段、对象/状态、计算、权限、异常、第三方责任与 Given-When-Then 验收。
- **Step 06 全局一致性核验与V1.0冻结**：11步×功能ID×页面/角色×规则/状态×验收可追溯；单独授权后统一UI/UX设计。

**不提前声明软件研发/实测已完成，也不因产品方向 Approved 就假定真实资金、法律和链上执行已获许可。**

## 6. GitHub 治理规则

- 唯一当前完整状态导航：[docs/Document-Status-Index.md](docs/Document-Status-Index.md)。
- 权威/历史覆盖及当前主文档：[文档权威目录](docs/00-governance/RWA-SaaS-Current-Document-Authority-and-Supersession-Index-v0.1.md)。
- 95份原有文件的逐文件处理建议与审计证据：[首轮报告](docs/00-governance/RWA-SaaS-Step-03.5-Document-Governance-Audit-and-Disposition-Proposal-v0.1.md)。
- 历史草案仅标 **Superseded as current reading entry**，路径、正文和对应DEC/SCOPE审批历史均保留；四份 Frozen 不直接改写。
- 当前工作分支：`docs/regulated-activity-boundaries-v01`。[PR #6](https://github.com/mirrorshang/rwa-saas-platform/pull/6) **Draft / Open / Unmerged**，base `docs/initial-asset-scope-v01`；没有收到明确合并授权。
