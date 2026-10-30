# DEC-054｜Step06 Issuer B08：Token管理四页六项方向正式批准

- **日期：**2026-10-29
- **状态：**Approved（仅用户明确批准的B08-01～B08-06六项推荐A产品方向）；新增页面实施细节Draft，执行/QA Not Executed。
- **批准来源：**用户明确「Issuer SaaS B08-01～B08-06全部同意推荐方案A，无补充意见」，要求DEC-054、Master PRD第6.26节I-37～I-40四页完整详细设计；常规细节由产品负责完善，新增正式功能/重大未决Draft，不修改Frozen、193项、历史DEC/SCOPE/README、X-01～X-13和PR #6状态，不开展UI开发。
- **归档位置：**[Master PRD v0.2 §6.26](../docs/03-product-prd/RWA-SaaS-Master-Product-PRD-Development-Handoff-Draft-v0.2.md)。
- **承继依据**：DEC-021 S04-03 M07-F001～F009 V1业务规则、DEC-031 Offering发布/文书后绑定、DEC-032 投资者合法配售/登记与Token交付、DEC-033 到期/清偿/Token处置、Master §6.22/6.24/6.25等。**本DEC只追加已批准B08方向，不回写历史DEC。**

| 方向 | 页面组 | 本次明确批准的A方向 | 既有V1功能与边界 |
|---|---|---|---|
| B08-01 | I-37 | 按Instrument及Offering合法权利选择获批链/标准，映射Token数量与法律单位，并保留必要转让限制 | M07-F001/F007；M04/M05/M19真实权利与合规来源 |
| B08-02 | I-38 | 受审模板、参数版本、申请及法定/安全审批分离 | M07-F002/F008，实际模板、参数/Factory方案Draft |
| B08-03 | I-38 | 部署授权与真实X Signer执行分离，广播、Finality、失败、Unknown分别表达 | M07-F002/F005/F008，不能凭Approved或Hash断言Deployed |
| B08-04 | I-39 | 基于M12合法Allocation、必要登记条件与受权接收钱包进行Mint/Token交付 | M07-F003/F004/F005；不可重复Mint或以Token余额取代法定登记 |
| B08-05 | I-39 | 法定必要冻结、暂停、Burn及合法调整，涉及清偿/公司行动与真实Signer分权 | M07-F007/F008/F009；Burn不等于本金实付或权利终止 |
| B08-06 | I-40 | 链上部署/Mint/Burn/限制事件及最终性核验、与配售/名册差异及有权异常恢复 | M07-F005/F006/F007；M12登记与M17任务不被复制成Token主账 |

## 继续有效的业务边界

1. **TokenContractPlan、真实合约部署、Token Mint/交付、法定配售及名册、收益/到期实际清偿是不同权威事实**。Offering/Instrument/文书M04/M05/M06、法定名册M12/X、资金M11、Token链M07/X、合法存续清偿M13各司其职。合约已部署不等于Offering合法发布、Token已Mint不等于持有人法律权利已完成登记、Burn不等于法律权利和支付义务消灭。
2. **P-01～P-07、Issuer合法发行及平台适用RG、合约模板安全与真正Signer权限**均必须在实际生产部署/Mint/Burn前独立满足。Free永久Sandbox仅允许模拟与获得批准的测试流程；Standard商业订阅不授予合约生产或法定金融授权。
3. **实际Signer不自动是Tenant管理员、SaaS运维或前端编辑人**。部署、权限变更、Mint/Burn、暂停与撤权须遵循M07-F008及实际法定/安全授权。广播、Provider回执、TxHash≠已达到合法Finality；Unknown先核原Intent和链证据，不盲重试。
4. M07-F007的必要合同/法律转让限制不等于V1有公开二级撮合或自由交易功能；合法持有资格、钱包控制和受控名册必须分开。
5. **M07-F010复杂多链部署/合约升级原V3.0不变**；M14二级交易/流动性相关能力不得因Token设置进入V1。不得静默引入第194项功能、跨链桥、智能合约通用部署平台、可升级代理管理、批量高危转账或统一个人资金管理。
6. 存续退出时A债权本金和B SPV股权/份额的合法公司行动按实际Instrument分别核定；M13真实还本、M12登记/权益调整、M07 Burn必须各有证据，不能通过一个按钮完成法律清偿。

## 本DEC不批准及待关闭的门

Master §6.26新增的具体表单字段、链/标准、模板/ABI、合约代码、数量和精度、Gas、实际签名及密钥托管技术、可升级策略、法域Token的法律性质、登记/部署时序、确认数/nonce和重试算法、链节点Provider、权限MFA/审批阈值、API/Schema与错误码、UX实现、真实智能合约安全审计和25项测试结果**全部Draft/Not Executed**。不借本批A改变原V1已批准正式ID或法域/技术风险决策。

**治理不变量**：原193项首交付版号V1.0=146／V2.0=22／V3.0=20／TBD=5；Issuer 9个一级导航、63组候选页面组保持；Frozen、历史DEC/SCOPE、README不修改；Project一Project多Asset仍Draft；X-01～X-13全部Open；V1整体未Frozen；PR #6必须Draft/Open/Unmerged，不合并、不进入Issuer UI/链上生产。

**下批**：B09审核I-54～I-58收益、存续、分配与退出管理，6项方案需新一轮用户明确决定，未经批准均Draft。
