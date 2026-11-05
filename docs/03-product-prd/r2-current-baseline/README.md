# R2 当前有效产品基线索引（Draft PR 待合并）
> 2026-11-06｜RWA SaaS｜U01 产品决策已获用户逐批批准；文档为新设计权威候选基线，不代表代码或生产服务已实现。分支 docs/r2-current-product-baseline；未经用户单独批准不合并、不开发生产代码。

## 读取顺序及优先级
1. 当前最新已批准的 R2 产品决策（本目录的 U01-UI-Ready-PRD.md 为 U01 整理文本，须以逐项用户确认结论为准）。
2. 本目录 DELIVERY-AND-ACCEPTANCE.md 开发任务和验收；SUPERSEDED-RULES-AND-CODE-GAPS.md 旧规则废止与证据。
3. 旧 Master PRD 与历史 DEC、Frozen：仅在未被 R2 明确覆盖且不冲突时引用；历史仍保留原始事实，不静默重写。
4. 旧代码与 Mock 仅是现状证据，不是需求权威。法定合规、安全控制、Provider/Signer/资金/链上生产准入门从不因产品规则覆盖而免除。

## 交付范围
- [U01-UI-Ready-PRD.md](U01-UI-Ready-PRD.md)：A 邮箱登录、B 企业入驻/KYB、C 未认证工作台、D 企业钱包、E 订阅；页面字段、流程、状态、校验、提示、异常。
- [DELIVERY-AND-ACCEPTANCE.md](DELIVERY-AND-ACCEPTANCE.md)：开发分层、技术门、测试矩阵、交付顺序。
- [MOCK-CONTROL-CONSOLE-UI-SPEC.md](MOCK-CONTROL-CONSOLE-UI-SPEC.md)：R2 独立 Mock 控制台，M01～M12 全部批准。\n- [SUPERSEDED-RULES-AND-CODE-GAPS.md](SUPERSEDED-RULES-AND-CODE-GAPS.md)：明确废止旧规则、远端源码抽样证据、仍需 Codex 本地详审的未知项。

## 适用约束
- V1 中文 UI；V2 多语言及法域语言/资料适配；V1 账号仅一个 Tenant、一个账户操作，无团队角色配置。
- Free 是模拟发行与资金/Token 行为；但 **KYB 审核通过后自动分配的企业 MPC 钱包必须是真实有效钱包，不得生成模拟 MPC 作为产品结果**。
- Free/Standard 钱包管理能力相同；真实钱包存在不代表 Free 可进行真实募资。
- V1 业务金额 UI 使用 U（按 USDT）；投资者付款仅 OP Mainnet USDT；SaaS 订阅可用 USDT 或法币，渠道和实际结算待准入。
- 旧四份 Frozen、193 项历史版本归属及 PR #6 不在本次变更范围。新 R2 决策优先适用于冲突的现行产品需求，不篡改历史。

## 合并/实施关口
当前只允许审查文档。正式合并该 Draft PR、修改生产或演示代码、外部真实支付/钱包集成及发布均需用户单独授权。不同分支可能存在更新；正式开发前必须核实真实工作分支和未提交改动，禁止基于旧快照覆盖。
