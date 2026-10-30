# SCOPE-186～SCOPE-193｜Issuer V1 Batch 05：Token、合约与外部受权执行交付深度决策

> **状态：Approved（2026-10-23，仅产品最低交付深度原则）**。产品负责人在 RWA SaaS 产品总控本轮明确回复：**“Batch 05 的 SCOPE-186～193 全部同意”**。八项按已经提交评审的原草案整体批准，**不是**对全部字段级 PRD、最终 Issuer V1 实施范围、软件开发、合约安全、法域金融许可或生产上线的批准。
>
> 依据：[Batch 05 详细需求及 B05-01～19 验收草案](../docs/03-product-prd/RWA-SaaS-V1-Delivery-Depth-Batch-05-Token-Contracts-External-Execution-v0.1.md)｜[187 项源表](../docs/03-product-prd/RWA-SaaS-Module-Function-Inventory-and-V1-Scope-Matrix-v0.1.md)｜[Frozen WF-01～18](../docs/04-business-workflows/RWA-SaaS-Core-Business-Workflows-and-State-Machines-v0.1.md)｜[Batch 04 Approved](SCOPE-176-185-batch04-investor-payments-registration-principles.md)｜[ARCH-001](ARCH-001-api-first-unified-business-core.md)｜[DEC-011](DEC-011-primary-issuance-v1-controlled-transfer-v2.md)。

## 一、产品负责人正式批准的八项原则

| 编号 | 已批准的产品最低深度原则（保持评审草案原意） |
|---|---|
| **SCOPE-186** | Batch 05 严格以 **M07/M22 共 19 项原 ID**开展产品最低交付深度审核（**P0 16 / P1 1 / P2 2**）；五类交付分类与原 187 项分级不变，不新增业务 ID。 |
| **SCOPE-187** | M07 保留独立 TokenContractPlan/Version、批准链/标准/单位↔Token 映射、环境区分和真实链上事件；**实际合约部署/Mint/签名由受权主体执行**，Issuer/平台前后台仅有其合法职责范围内的申请、批准及核验。 |
| **SCOPE-188** | **M12 Allocation/法定登记、M11 实付、M07 Mint/Finality** 独立留证，Mint/登记时序依法定 Instrument 确认；执行 Unknown 查询原意图/Tx/nonce，合法交割前不显示所有权益交付完成，禁止重复 Mint/伪造登记。 |
| **SCOPE-189** | 投资者账户与**付款来源地址、Token 接收钱包、法定持有人身份**分开管理；接收钱包按合法条件验证控制权、资格、禁转与锁定。**V1 强制合约级必要转让限制**，但不实现 M14 的二级转让/撮合市场。 |
| **SCOPE-190** | 对部署、Mint/Burn、密钥、暂停及敏感授权实行**职责分离、审批、最小权限、审计、可撤销和测试/生产严格隔离**；SaaS 运营不默认掌管生产资产私钥、受监管支付或法律登记权威。 |
| **SCOPE-191** | M22 的**KYC/KYB/AML、USDT/USDC 付款观察、链上事件、权威登记、电子签、Webhook 验签/幂等、健康监测及凭证环境隔离**必须能够支持首发合法外部执行者；Provider 成功响应不自动是法律/资金/链最终事实。 |
| **SCOPE-192** | **M07-F009 Token Burn/赎回/受权调整保持原 P1 条件性**：债权依法到期清偿、股权合法回购/注销等实际工具要求时具备最低受权流程。**M07-F010 多链/复杂升级、M22-F009 多服务商智能切换维持原 P2 后置**；必要安全 Guard 不后置。 |
| **SCOPE-193** | 本批 19 项最低深度与 B05-01～19 均仅为**产品审核草案**；如获批准也不等于实际法域许可、合同/合约已审、金融资产/私钥/资金授权、研发实现、测试 PASS、V1 实施范围全冻结或 PR #6 可合并；之后继续 Batch 06 长篇详细文字+SCOPE 审核。 |

## 二、批准边界与不得扩展解读

- **原功能仍为 M07 10 项 + M22 9 项，共 19 项（P0 16/P1 1/P2 2）**；不新增 Mxx-Fxxx、不改变 187 项编号、优先级或五类交付定位，不自动把所有 P0/P1 判为最终生产必交。
- **各项真实事实仍独立**：M11 真实收款/退款、M12 Allocation 与适用法定登记、M07 Token Mint/Burn/Finality、M13 存续权益及外部实付；Provider 回调与链上 Hash 不代替法律权利证据。
- **M07-F009 维持原 P1 条件性**；M07-F010/M22-F009 维持原 P2、非默认首期。不得因为复杂升级、多服务商智能切换后置而省去合约必要保护、幂等、暂停与异常恢复。
- 已批准的是**业务需求原则与 B05-01～B05-19 验收场景的设计基线**；全部测试场景仍为 **Not Executed**，A/B 187 项验证仍为 **Not Tested**，没有 PASS、生产交易或真实 Token 部署证据。
- **第 02～04 份 Frozen 维持不变**；首发 Instrument/法域、法定权威、外部签名/资金/登记提供方、生产链/合约/Token 标准及实际 V1 交付清单，均需后续独立审定。
- **PR #6 必须保持 Draft / Open / Unmerged**；不得因本次批准进行合并、正式研发、合约部署、收付款或 UI 设计。

## 三、后续交接

- Batch 01～05：最低产品交付深度原则 **Approved**。下一批为 **Batch 06：M13/M17/M18/M20/M21 共 37 项**，继续使用同样的长篇逐功能需求 + SCOPE 集中审核；Batch 06 尚未批准。
- 全部六批原则审核完成后依次进入：四端完整业务泳道图、187 项逐项核验、分端功能清单、真正字段级 PRD、V1 最终一致性与范围冻结、**最后统一 UI**。
- README 与 `docs/Document-Status-Index.md` 须同步，所有“Approved / Frozen / Draft / Not Tested / Not Executed”分别准确标示。

**当前判定：SCOPE-186～193 Approved（产品原则）；B05-01～19 Not Executed；187 项 Not Tested；最终 Issuer V1 交付与字段级 PRD Draft/TBD。**
