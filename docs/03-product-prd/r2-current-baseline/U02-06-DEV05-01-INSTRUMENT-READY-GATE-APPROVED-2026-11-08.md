# RWA SaaS R2｜DEV-05-01 Offering 创建前置条件正式决策

> **决策日期：2026-11-08｜用户选择 A｜状态：Approved**  
> 本决策将「权益结构必须 Ready 才能创建 Offering」正式纳入 U02-06 产品基线。仅批准产品入口与前置条件，不构成 DEV-05 源码开发授权、真实发行/支付/Mint/生产合规准入或 PR #8 合并授权。

## 一、用户明确批准

用户对 DEV-05-01 选择 **A**：

**当前 Asset 的 Instrument（权益结构）必须完成 Ready 检查，才能创建 Offering（发行方案）。**

## 二、正式规则

1. 企业先创建 Asset，并完成该资产所需的资产资料。
2. 在 Asset 详情的「权益结构」TAB 中创建该 Asset 唯一的一套 Instrument。
3. Instrument 必须通过已批准的字段、计算与核心文件检查，状态达到 **Ready（资料已完备）**。
4. 只有当前有效 Instrument 的确定版本处于 Ready，Asset 详情「发行管理」TAB 才显示可用的「新建发行方案」入口。
5. 没有 Instrument 时：不显示可创建 Offering 的入口；显示清楚的下一步提示和「创建权益结构」跳转。
6. Instrument 为 Draft、资料检查未通过、核心文件扫描中/失败或 Ready 已失效时：不允许创建 Offering；显示缺项原因及「继续编辑权益结构」入口。
7. Instrument 达到 Ready 后：允许创建 Offering Draft。Offering 必须引用该 Instrument 的**确定版本**，并只读继承权益类型、权利说明、Token 拆分结果及当前可发行份数；Offering 不得自行重建或修改权益池。
8. 创建 Offering 时必须重新核对 Instrument 当前版本与 Ready 状态，不能只信前端缓存、旧页面状态或伪造 URL。任何绕过页面入口的请求同样必须被可信业务层拒绝。
9. Offering 建立后固定关联创建时引用的 InstrumentVersion。后续 Instrument 修改、版本更新或 Ready 状态变化，不得静默改变既有 Offering、发布快照、订单或投资者权利；既有 Offering 继续引用原确定版本。新 Offering 只能基于当时当前有效且 Ready 的 Instrument 版本创建。
10. 若 Instrument 后续编辑导致当前版本 Ready 失效，则暂停新建 Offering 入口，直到重新完成 Ready 检查；不影响历史 Offering 对其固定版本的引用。

## 三、页面交互

| Asset / Instrument 当前状态 | 「发行管理」TAB 展示 | 可执行动作 |
|---|---|---|
| 无 Instrument | 未创建权益结构的空状态；解释先确定投资者权利 | 「创建权益结构」 |
| Instrument Draft | 显示草稿状态、待补项及最近保存时间 | 「继续编辑权益结构」；不显示「新建发行方案」 |
| Instrument 检查失败/Ready 失效 | 显示具体缺项、文件扫描或检查失败原因 | 「修复权益结构」；不显示「新建发行方案」 |
| Instrument 文件扫描中/关键文件不可引用 | 显示等待/失败原因 | 等待或重新上传/引用；不显示「新建发行方案」 |
| Instrument Ready | 显示权益结构摘要、当前确定版本及可用 Token 份数 | 「新建发行方案」 |
| 已有 Offering | 按每期显示状态与摘要；保留其固定 InstrumentVersion | 查看/继续编辑符合权限的 Offering；创建新一期仍需当前 Instrument Ready 和共享容量检查 |

推荐提示文案：
- 无权益结构：「请先完成这项资产的权益结构，再创建发行方案。」
- 权益结构草稿：「权益结构尚未完成。请补齐资料并完成检查后，再创建发行方案。」
- 文件待扫描：「权益结构的必要文件仍在检查中，暂时不能创建发行方案。」
- Ready：「权益结构已准备就绪，可以创建发行方案。」

## 四、与 Free / Standard 权限衔接

- KYB 已通过的新 Free 与有效 Standard，均可按 U01 已批准规则创建/编辑真实业务 Asset 与 Instrument。
- 只要 Instrument Ready，二者均可创建并保存正式 Offering Draft；Free 可进行内部只读投资者端预览。
- Free 不能真实发布、公开上架、创建真实投资者门户、收款、认购、Mint 或使用发行后运营功能。
- Standard 的真实发布仍必须同时通过适用法律、投资者资格、钱包、Provider/Signer、合约、OP Mainnet USDT 支付、安全及其他生产准入；购买 Standard 本身不代表生产准入。
- Standard 到期降级后的历史业务按 U01 规则只读；不得因为当前套餐文字显示 Free 而将历史权限重新当成新 Free 的新增编辑权限。

## 五、范围边界

本决策只明确 **Instrument Ready 是创建 Offering 的必要前置条件**，不额外批准：
- 真实法律/监管审核、投资者 KYC/AML 资格认定；
- 真实合约部署、USDT 支付、Signer/Provider、Mint、资金托管/分账/退款；
- Offering 发布后修改、延期、撤回、并行预定时间窗等尚未批准的复杂规则；
- 任何新的 Asset/Instrument 结构或多套权益池。

## 六、验收要点

- 无 Instrument：不能创建 Offering，只能跳转创建权益结构。
- Instrument Draft / 检查失败 / 文件待扫描 / Ready 失效：不能创建 Offering。
- Instrument Ready：可以创建 Offering Draft，且自动绑定确定版本。
- 深链、直接 API/服务层请求、伪造 asset_id/instrument_version_id 均不能绕过 Ready 守卫或跨 Tenant。
- 创建后更新 Instrument，不得改变既有 Offering 的固定版本引用。
- 新 Free 与 Standard 的资料创建权限一致；Free 发布权限仍被 U01 限制。
- 以上产品规则测试通过不代表真实生产发行能力通过。

## 七、保护与版本

- 本决策属于 R2 当前候选产品基线中已由用户批准的规则。
- 不修改旧 Master、Frozen 文档、193 项历史版本归属、历史 DEC/SCOPE、根 README 或 PR #6。
- PR #8 保持 Draft / Open / Unmerged；本文件仅记录产品决策，不授权 Codex 开发或真实生产执行。
