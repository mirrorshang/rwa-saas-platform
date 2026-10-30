# DEC-035｜Step06 冻结前专项工作方向 R01～R03 审批（仅方法与交付顺序）

> **2026-10-26｜Approved（仅Step06工作方法/专项产出安排）**；其下的法域选择、Instrument、资金/Signer、字段schema、角色权限码、API、技术方案和真实测试均**Draft／未决／Not Executed**。本DEC不是V1.0冻结决定，不关闭DEC-028 X-01～X-13，也不更改现有功能版本归属。

## 一、明确用户决策与范围

用户明确：“**RWA SaaS Step06下一轮工作方向审核：R01：A；R02：A；R03：A。请仅按上述批准的工作方向继续，保持X-01～X-13全部Open、技术与法域方案Draft、V1.0未Frozen、PR #6 Draft/Open/Unmerged。**”

三项A采用上一轮[Step05五场景总体一致性审核](../docs/03-product-prd/RWA-SaaS-Step-05-Five-Scenarios-Consistency-and-Step-06-Pre-Freeze-Audit-Draft-v0.1.md)提出的下一轮工作方向；**批准的是如何开展分析和准备文档，不是分析草案中的每项候选字段或法律结论**。

| ID | 本轮获批工作方向（A） | 可立即产出 | 本轮没有批准 |
|---|---|---|---|
| **Step06-R01** | 先以“**一个拟首发法域 × 一种Instrument**”建立合规适用性验证锚点，同时保留全球标准化、多法域配置产品架构 | 法域/Instrument候选调查表、法律与经营主体矩阵、发行/募资/登记/资金等条件性Gate、证据请求和产品决策门 | **未选定哪个法域或Instrument**；没有批准许可、法律意见、发行结构或默认全球适用；不批准集中募集所需V2功能自动提前 |
| **Step06-R02** | **11步流程第08步募集款合法释放与实际划拨**独立成M11-F012/F013专项字段与P/I/V/X跨端异常PRD | 独立对象/状态/Guard、资金来源与受限余额、批准与出款证据、Unknown/部分划拨、四端职责和开放缺口清单 | 不批准真实持管人、托管钱包/合约、实际签名者、释放金额计算公式、受益方、接口及任何真实资金操作 |
| **Step06-R03** | 字段与API收口按“**业务对象/状态/权限矩阵 → 法域与安全/技术专项审核 → 只把新增关键分歧交产品负责人**”分层推进 | 五场景领域对象与唯一权威映射、跨端权限候选矩阵、逻辑接口/异常/证据契约与逐项追踪框架 | 不视为全字段批量Approved，不实际签收schema/工程enum/API，亦不免除用户对未来重大产品或监管决策的批准权 |

## 二、新增的三个专项Draft交付入口

1. [Step06-01：首发法域×Instrument验证锚点与合规证据矩阵 Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-06-01-Jurisdiction-Instrument-Legal-Validation-Anchor-Draft-v0.1.md)。
2. [Step06-02：M11募集款释放与合法划拨专项字段/跨端异常PRD Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-06-02-M11-Funds-Release-Settlement-Field-Cross-Lane-PRD-Draft-v0.1.md)。
3. [Step06-03：五场景对象/状态/权限/API审查矩阵 Draft v0.1](../docs/03-product-prd/RWA-SaaS-Step-06-03-Field-State-Permission-API-Review-Matrix-Draft-v0.1.md)。

以上文件仅用于研究、审核与细化。若后续产生与已Approved业务规则冲突的建议，必须提出差异与独立决策，不能静默覆写上游。

## 三、保留的上游唯一权威

- **DEC-017**：193个正式功能ID，**V1.0 146 / V2.0 22 / V3.0 20 / TBD 5**。如首发Instrument依法必须集中募集，M05-F011、M10-F009、M12-F009/F010（当前V2）须在V1整体冻结前重新单独决定；本次没有任何版号调整。
- **DEC-018～027**：Step04九批146/146功能级Approved；其中**M11-F012/F013**募集款释放/真实划拨已在DEC-023及S04-05产品层批准，本次只补Draft字段与异常描述，不创造新ID。
- **DEC-029～034**：Step05五场景**29条（7+4+6+6+6）产品级规则Approved**；法域、字段、Signer、接口与测试不能以此推定批准。
- **DEC-028**：四端×11步静态覆盖有条件认可，**X-01～X-13 13/13 Open（9 High/3 Medium/1 Low）**。新增专项文档为证据规划，不构成任一风险Close。

## 四、Step06后续审核和禁止事项

后续由产品总控先提交**最小关键选项**：验证锚点候选的法域/Instrument及法律Owner、真实募集款释放权限的责任主体和关键差异。其余字段、技术/API/安全/法域审查仍分别Draft，不能对用户默认授予授权。

**四份Frozen、历史DEC/SCOPE原文及193项主表不修改；V1.0整体未Frozen；PR #6保持Draft/Open/Unmerged；不启动UI、研发、API落地、真实金融/Token链上生产或任何外部法律行为。**

**本DEC效力边界：三项工作方向Approved；专项内容和所有实施决策仍Draft。**
