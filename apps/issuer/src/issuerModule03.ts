import type { AppState, Investor } from "./data";
import { nextNumericId } from "./issuerModule01.ts";

export type MockResult = { state: AppState; changed: boolean; error?: string };
const unchanged = (state: AppState, error?: string): MockResult => ({ state, changed: false, error });
const changed = (state: AppState): MockResult => ({ state, changed: true });

export function createMockInvestor(
  state: AppState, offeringId: string, name: string, type: Investor["type"], requestKey: string,
): MockResult {
  if (!state.offerings.some(row => row.id === offeringId)) return unchanged(state, "Offering 不存在");
  if (!name.trim() || !requestKey.trim()) return unchanged(state, "投资者名称和请求编号不能为空");
  if (state.investors.some(row => row.requestKey === requestKey)) return unchanged(state);
  const id = nextNumericId("INV", state.investors, 3000);
  return changed({ ...state, investors: [...state.investors, {
    id, name: name.trim(), type, kyc: "待审核", offeringIds: [offeringId], last: "Sandbox 模拟投资者已创建",
    environment: "Sandbox", source: "Issuer 测试控制区", requestKey,
  }] });
}

export function approveMockInvestorKyc(state: AppState, investorId: string): MockResult {
  const investor = state.investors.find(row => row.id === investorId);
  if (!investor) return unchanged(state, "投资者不存在");
  if (investor.environment !== "Sandbox") return unchanged(state, "只能模拟审核 Sandbox 投资者");
  if (investor.kyc === "有效通过") return unchanged(state);
  return changed({ ...state, investors: state.investors.map(row => row.id === investorId
    ? { ...row, kyc: "有效通过", last: "Mock KYC 已通过" } : row) });
}

export function createMockOrder(
  state: AppState, offeringId: string, investorId: string, quantity: number, requestKey: string, businessDate: string,
): MockResult {
  if (state.orders.some(row => row.requestKey === requestKey && requestKey)) return unchanged(state);
  const offering = state.offerings.find(row => row.id === offeringId);
  const investor = state.investors.find(row => row.id === investorId);
  if (!offering?.confirmationSnapshot || offering.publicationStatus !== "Sandbox 已发布" || offering.subscriptionStatus !== "Sandbox 认购中")
    return unchanged(state, "Offering 尚未 Sandbox 发布并开放认购");
  if (!businessDate || businessDate < offering.start || businessDate > offering.end)
    return unchanged(state, "当前日期不在认购窗口内");
  if (!investor || investor.environment !== "Sandbox" || investor.kyc !== "有效通过")
    return unchanged(state, "模拟投资者 KYC 尚未通过");
  if (state.orders.some(row => row.offeringId === offeringId && row.investorId === investorId))
    return unchanged(state, "该投资者已有本期认购订单");
  if (!Number.isSafeInteger(quantity) || quantity <= 0 || !requestKey.trim())
    return unchanged(state, "认购 Token 数量或请求编号无效");
  const confirmedTerms = offering.confirmationSnapshot.offeringTerms;
  if (offering.price !== confirmedTerms.price || offering.tokens !== confirmedTerms.tokens || offering.assetVersion !== offering.confirmationSnapshot.asset.version || offering.instrumentVersion !== offering.confirmationSnapshot.instrument.version)
    return unchanged(state, "Offering 确认版本已变化，请核对固定报价");
  if (quantity * confirmedTerms.price < (confirmedTerms.minimum || 0)) return unchanged(state, "认购金额低于最低认购额");
  const reserved = state.orders.filter(row => row.offeringId === offeringId && row.status !== "已取消").reduce((sum, row) => sum + row.requested, 0);
  if (reserved + quantity > offering.tokens) return unchanged(state, "认购数量超过本期剩余发行容量");
  const id = nextNumericId("ORD", state.orders, 3000);
  return changed({ ...state, orders: [...state.orders, {
    id, investorId, offeringId, requested: quantity, confirmed: 0, amount: quantity * confirmedTerms.price,
    status: "待付款", payment: "未付款", delivery: "未开始", created: businessDate,
    environment: "Sandbox", requestKey, termsRevision: offering.revision, quotedPrice: confirmedTerms.price,
  }] });
}

export function recordMockPayment(
  state: AppState, orderId: string, intentId: string, outcome: "success" | "failed" | "unknown", at: string,
): MockResult {
  const order = state.orders.find(row => row.id === orderId);
  if (!order || order.environment !== "Sandbox") return unchanged(state, "Sandbox 认购订单不存在");
  if (!intentId.trim()) return unchanged(state, "支付意图编号不能为空");
  const existing = state.payments.find(row => row.orderId === orderId && row.intentId === intentId);
  if (existing && existing.status !== "Unknown") return unchanged(state);
  if (existing && outcome === "unknown") return unchanged(state, "原支付意图仍为 Unknown，请查询原意图结果");
  if (!existing && state.payments.some(row => row.orderId === orderId && ["最终匹配", "Unknown"].includes(row.status)))
    return unchanged(state, "已有成功或未知支付意图，请核对原记录，不能重复付款");
  const status = outcome === "success" ? "最终匹配" : outcome === "failed" ? "失败" : "Unknown";
  const id = existing?.id || nextNumericId("PAY", state.payments, 3000);
  const payment = { id, orderId, expected: order.amount, received: outcome === "success" ? order.amount : 0,
    status, time: at, environment: "Sandbox" as const, intentId };
  return changed({ ...state,
    payments: existing ? state.payments.map(row => row.id === id ? payment : row) : [...state.payments, payment],
    orders: state.orders.map(row => row.id === orderId
      ? { ...row, payment: status, status: outcome === "success" ? "待配售" : row.status } : row),
  });
}

export function allocateMockOrder(state: AppState, orderId: string, at: string): MockResult {
  const order = state.orders.find(row => row.id === orderId);
  if (!order || order.environment !== "Sandbox") return unchanged(state, "Sandbox 订单不存在");
  if (state.allocations.some(row => row.orderId === orderId)) return unchanged(state);
  const payment = state.payments.find(row => row.orderId === orderId && row.status === "最终匹配");
  const offering = state.offerings.find(row => row.id === order.offeringId);
  const instrument = state.instruments.find(row => row.id === offering?.instrumentId);
  if (!payment || payment.received !== order.amount || order.payment !== "最终匹配") return unchanged(state, "付款未最终匹配");
  if (!offering?.confirmationSnapshot || !instrument || order.termsRevision !== offering.revision || order.quotedPrice !== offering.confirmationSnapshot.offeringTerms.price)
    return unchanged(state, "发行条款版本或固定报价冲突");
  const allocated = state.allocations.filter(row => row.offeringId === order.offeringId).reduce((sum, row) => sum + row.quantity, 0);
  if (allocated + order.requested > offering.tokens) return unchanged(state, "配售超过本期发行容量");
  const id = nextNumericId("ALL", state.allocations, 3000);
  const rights = order.requested * instrument.totalRights / instrument.tokenCap;
  return changed({ ...state,
    allocations: [...state.allocations, { id, orderId, offeringId: order.offeringId, investorId: order.investorId,
      quantity: order.requested, rights, status: "已配售", environment: "Sandbox", createdAt: at }],
    orders: state.orders.map(row => row.id === orderId ? { ...row, confirmed: row.requested, status: "待登记" } : row),
  });
}

export function registerMockHolder(state: AppState, orderId: string, at: string): MockResult {
  const allocation = state.allocations.find(row => row.orderId === orderId);
  const order = state.orders.find(row => row.id === orderId);
  if (!allocation || !order) return unchanged(state, "请先完成配售");
  if (state.holders.some(row => row.orderId === orderId)) return unchanged(state);
  if (order.payment !== "最终匹配" || order.confirmed !== allocation.quantity) return unchanged(state, "付款或配售数量不一致");
  const id = nextNumericId("HOL", state.holders, 3000);
  return changed({ ...state,
    holders: [...state.holders, { id, investorId: order.investorId, orderId, offeringId: order.offeringId,
      rights: allocation.rights, tokens: 0, registration: "登记有效", lock: "未开始", lockUntil: "—",
      reconciliation: "待 Token 交付", environment: "Sandbox", source: "Issuer 测试控制区模拟登记",
      effectiveAt: at, allocationId: allocation.id }],
    orders: state.orders.map(row => row.id === orderId ? { ...row, status: "待交付" } : row),
  });
}

export function deliverMockTokens(state: AppState, orderId: string, at: string): MockResult {
  const order = state.orders.find(row => row.id === orderId);
  const holder = state.holders.find(row => row.orderId === orderId);
  const offering = state.offerings.find(row => row.id === order?.offeringId);
  if (!order || !holder || !offering) return unchanged(state, "请先完成模拟持有人登记");
  if (state.tokens.some(row => row.orderId === orderId && row.operation === "Mint / 交付")) return unchanged(state);
  if (offering.publicationStatus !== "Sandbox 已发布" || offering.contractStatus !== "模拟已部署") return unchanged(state, "Sandbox 合约或发布未核验");
  if (holder.registration !== "登记有效" || order.payment !== "最终匹配" || holder.tokens !== 0) return unchanged(state, "登记、付款或交付状态冲突");
  const id = nextNumericId("TOK", state.tokens, 3000);
  const tokens = [...state.tokens, { id, offeringId: order.offeringId, orderId,
    operation: "Mint / 交付", amount: order.confirmed, status: "模拟确认", time: at, tx: `SANDBOX-${id}` }];
  const allAllocated = state.allocations.filter(row => row.offeringId === order.offeringId);
  const allDelivered = allAllocated.length > 0 && allAllocated.every(row => tokens.some(token => token.orderId === row.orderId && token.operation === "Mint / 交付"));
  return changed({ ...state, tokens,
    holders: state.holders.map(row => row.id === holder.id ? { ...row, tokens: order.confirmed, reconciliation: "一致", lock: "锁定中" } : row),
    orders: state.orders.map(row => row.id === orderId ? { ...row, delivery: "模拟最终交付", status: "已完成" } : row),
    offerings: state.offerings.map(row => row.id === order.offeringId && allDelivered ? { ...row, tokenIssuanceStatus: "模拟已发行" } : row),
  });
}

export function createHolderSnapshot(state: AppState, offeringId: string, recordDate: string, at: string): MockResult {
  const offering = state.offerings.find(row => row.id === offeringId);
  if (!offering?.confirmationSnapshot) return unchanged(state, "Offering 未确认");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recordDate)) return unchanged(state, "Record Date 日期格式无效");
  if (state.holderSnapshots.some(row => row.offeringId === offeringId && row.recordDate === recordDate)) return unchanged(state);
  if (state.holders.some(row => row.offeringId === offeringId && row.registration === "模拟已清偿"))
    return unchanged(state, "债权名册已模拟清偿；请查询先前固定的快照，不能事后补建历史 Record Date");
  const lines = state.holders.filter(row => row.offeringId === offeringId && row.registration === "登记有效"
    && row.environment === "Sandbox" && Boolean(row.effectiveAt) && row.effectiveAt!.slice(0, 10) <= recordDate)
    .map(row => ({ holderId: row.id, investorId: row.investorId, orderId: row.orderId, rights: row.rights, tokens: row.tokens }));
  if (!lines.length) return unchanged(state, "Record Date 没有有效模拟持有人");
  const id = nextNumericId("HSP", state.holderSnapshots, 3000);
  return changed({ ...state, holderSnapshots: [...state.holderSnapshots, { id, offeringId, recordDate,
    environment: "Sandbox", createdAt: at, instrumentVersion: offering.instrumentVersion || "", lines }] });
}
