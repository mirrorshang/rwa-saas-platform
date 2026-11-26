# DEV-02 投资机会与资产详情验收（2026-11-26）

## 基线与范围

- 基线：PR #17 `dd1b0b18ee3f9c63815497d41bf7bf34bbfa974f`；依据已批准 `V-M-SHARED-UI-READY-PRD-v0.1.md` 第 3 节。
- 仅改动 `apps/investor-portal` 的前端 Mock、测试、验收记录。未接真实后端、KYC、钱包或交易。
- 正常 M 渠道仅公开两项有效 Listing。写字楼、商铺、工业园仓储物流、普通股权仅作 V 渠道的未开放模板；无可投资 Offering 被虚构上线。

## 实现

- 列表：可见项目内搜索；资产大类/子类、权益、地区、状态、M 发行企业筛选；上架/截止排序，URL 保留筛选，20 项分页。
- 六类资产模板：住宅、写字楼、商铺、工业园仓储物流、非上市普通股权、单笔企业借款债权。专属字段和三类权益条款分开披露。
- 共用详情：资产、权益、Offering、发行企业、文件与风险五区；Asset/Instrument/Offering 各自版本；Mock 容量未知时显示待核实。
- 企业页：地区、业务方向、经授权公开资料；M 直接访问仍检查有效 Listing，仅列当前 M 可见项目。
- 加载、异常为独立 `/demo` Mock 预览；无权直接 URL 进入受控空态。
- 未开放模板使用非项目照片的抽象视觉，认购按钮禁用。

## 实际验证

- Node `--test src/domain.test.mjs`：11/11 PASS，覆盖六类分类、权益期限、可见性、筛选与排序、M 企业页守卫、认购原有不变量。
- TypeScript `tsc --noEmit`：PASS。
- Vite `build`：PASS。
- 实际浏览器（`http://127.0.0.1:5183`）：点击 M 投资机会、筛选企业借款，URL 和卡片同步为 1 项；M 直接访问 `/m/opportunities/private-01` 显示不可访问；V 访问 `/v/cedar/opportunities/private-01` 显示股权字段且认购禁用；M 企业页仅显示当前有效项目；V 海岚列表显示四类房地产模板。Console Error：0。
- Chrome 截图脚本 `qa/capture-dev02.ps1`：6 张，尺寸校验全部通过。

## 截图

- `screenshots/dev02-m-list.png`
- `screenshots/dev02-m-residence-detail.png`
- `screenshots/dev02-m-debt-detail.png`
- `screenshots/dev02-v-harbor-list.png`
- `screenshots/dev02-v-cedar-equity.png`
- `screenshots/dev02-m-unlisted-blocked.png`

## 限制与后续

- 四个未开放模板的价格、项目和主体均为纯 Mock 演示数据，不能解释为获准发行或有效 Listing。
- 文件正文、账户/KYC、认购真实可操作 Mock 闭环分别属于 DEV-03/04；当前文件清单没有有效签署。
- 独立全新依赖安装仍未验证；DEV-07 必须解决或明确 NOT EXECUTED。
