# RWA SaaS V1.1 增量工程交接

状态：**前端候选实现；后端、数据库和生产金融服务 NOT VERIFIED**。本目录是工程师阅读 V1.1 增量的入口，不替代冻结的 [V1.0 Backend Developer PRD](../V1.0/V1.0-BACKEND-DEVELOPER-PRD.md) 与 [V1.0 OpenAPI](../V1.0/openapi.yaml)。产品依据为 PR #21（`630fa4b99c6b14aca430c4d3ea7b1c19d6f94981`）中的 R01–R06 决议、联合 PRD 和整改计划。

## 基线与边界

- Issuer 候选分支：`feat/v1.1-issuer-investment-disclosure-and-spv`，起点 `48e3e0b65b125d301975f7f25c3bb4c9321977d5`（`release/v1-engineering-handover-20261116`）。
- V/M 候选分支：`feat/v1.1-vm-investment-disclosure-and-spv`，起点 `052eb0416898346cd1b94d28b87f1cdea1924809`（PR #20）。
- 两端均为本地 Mock 候选。V1.0 发布分支、PR #17–#21 和冻结文档不被改写。Issuer 当前 `localStorage` v4 不是生产主账；没有真实支付、钱包、KYC、登记、签署、合约或 Claim 后端。
- 可供发行确认的原有闭环仅住宅收益参与和单笔企业借款债权。其余四类可记录资料与公开字段，不能因此宣称已可认购。

## 阅读顺序

1. [变更清单](V1.1-CHANGELOG.md)和[PRD 增量](V1.1-PRD-DELTA.md)。
2. [数据结构差异](V1.1-DATA-SCHEMA-DIFF.md)、[API 差异](V1.1-API-DIFF.md)、[完整候选 OpenAPI](V1.1-OPENAPI.yaml)。
3. [升级迁移方案](V1.0-TO-V1.1-MIGRATION.md)、[页面矩阵](V1.1-UI-CHANGE-MATRIX.md)、[六类资产字段映射](V1.1-PUBLIC-FIELD-MAPPING.md)。
4. [验收与限制](V1.1-ACCEPTANCE.md)和[操作手册增量](V1.1-OPERATION-GUIDE.md)。

`node docs/V1.1/generate-openapi.mjs` 从原始 V1.0 规范重新生成 1.1 候选规范；它保留原路径，只增加经 R01–R06 影响的字段与端点。**此命令不部署接口。**

## 工程师需先确认

真实后端仓库、分支、Commit、数据库 DDL、已实现接口、文件服务和各模块进度当前均 **NOT VERIFIED**。以实际系统核对本目录的候选字段和路径后，再决定迁移、回填与上线顺序。未取得这些证据前，不能宣称生产联调完成。
