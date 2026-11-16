import { getDemoAuth, getDemoTenant, type DemoTenant } from './issuerDemo';
import { addSandboxOrders, exactOrderAmount, readOrders, type OrderRecord } from './issuerOrdersV1';
import { addSandboxAllocationData, ensureSandboxRegistrationPolicy, ensureSandboxRestrictionPolicy, legalRightsForTokens, readAllocationData, type AllocationData } from './issuerAllocationV1';
import { linkSandboxInvestor, readInvestorRelations } from './issuerInvestorsV1';
import {
  addExampleDocument, createOffering, exampleAssetFor, exampleInstrument, exampleOffering,
  latest, offeringIssues, readPortfolio, requiredAssetDocumentKinds, saveAsset, saveInstrument,
  saveOffering, seedWallet, setAssetReady, setInstrumentReady,
  type AssetRecord, type InstrumentRecord, type OfferingRecord,
} from './issuerPortfolioV1';

const manifestKey = 'wdex-issuer-operational-scenario-v1';
type Manifest = { assetId?: string; instrumentId?: string; offeringId?: string };
const scope = (tenant: DemoTenant) => {
  const auth = getDemoAuth();
  return auth && getDemoTenant()?.id === tenant.id ? `${auth.email.toLowerCase()}/${tenant.id}` : null;
};
const readManifest = (): Record<string, Manifest> => {
  try { return JSON.parse(localStorage.getItem(manifestKey) || '{}') as Record<string, Manifest>; } catch { return {}; }
};
const saveManifest = (id: string, value: Manifest) => {
  const all = readManifest(); all[id] = value; localStorage.setItem(manifestKey, JSON.stringify(all));
};
const localTime = (offsetDays: number) => {
  const time = Date.now() + offsetDays * 86400000 + 8 * 3600000;
  return new Date(time).toISOString().slice(0, 16);
};

export function buildSandboxOrders(tenant: DemoTenant, asset: AssetRecord, instrument: InstrumentRecord, offering: OfferingRecord, investor: { id: string; ref: string }, now = Date.now()): OrderRecord[] {
  const version = latest(offering);
  const price = version.fields.price;
  const subscriptionDocument = offering.documents.find(item => item.id === version.fields.subscriptionDocId && !item.removed);
  const riskDocuments = offering.documents.filter(item => version.fields.riskDocIds?.includes(item.id) && !item.removed);
  const quoteSnapshot = {
    assetName: latest(asset).fields.name, offeringName: version.fields.name || offering.number,
    instrumentName: latest(instrument).fields.name || instrument.number,
    minOrder: version.fields.minOrder || '', maxOrderTokens: version.fields.maxOrderTokens || '',
    investorCap: version.fields.investorCap || '', walletId: version.fields.walletId || '',
    subscriptionDocument: subscriptionDocument && { id: subscriptionDocument.id, name: subscriptionDocument.name, version: subscriptionDocument.version },
    riskDocuments: riskDocuments.map(item => ({ id: item.id, name: item.name, version: item.version })),
  };
  const cases = [
    { quantity: '5', payment: 'awaiting', capacity: 'reserved', registration: 'none', delivery: 'none' },
    { quantity: '3', payment: 'unknown', capacity: 'protected', registration: 'none', delivery: 'none' },
    { quantity: '4', payment: 'final-matched', capacity: 'allocated', registration: 'pending', delivery: 'confirmed' },
    { quantity: '2', payment: 'final-matched', capacity: 'allocated', registration: 'effective', delivery: 'confirmed' },
    { quantity: '2', payment: 'difference', capacity: 'protected', registration: 'none', delivery: 'none' },
  ] as const;
  return cases.map((item, index) => {
    const number = index + 1;
    const at = now - (5 - number) * 3600000;
    const id = `${tenant.id}-sandbox-order-${number}`;
    const amount = exactOrderAmount(item.quantity, price);
    if (!amount) throw Error('示例发行价格或认购数量无效。');
    return {
      id, number: `SO-SB-${String(number).padStart(4, '0')}`, tenantId: tenant.id,
      investorId: investor.id, investorRef: investor.ref, assetId: asset.id, offeringId: offering.id,
      offeringNumber: offering.number, offeringVersion: version.number, instrumentVersion: latest(instrument).number,
      quantity: item.quantity, unitPrice: price, amount, currency: 'U', network: 'OP Mainnet',
      quoteSnapshot: structuredClone(quoteSnapshot),
      createdAt: at, timezone: version.fields.timezone || 'Asia/Shanghai', quoteStatus: 'valid', signatureStatus: 'signed',
      payment: item.payment, capacity: item.capacity, registration: item.registration, delivery: item.delivery,
      paymentRef: item.payment === 'awaiting' ? undefined : `SB-PAY-${number}`,
      capacityRef: `SB-CAP-${number}`, registrationRef: item.registration === 'effective' ? `SB-REG-${number}` : undefined,
      deliveryRef: item.delivery === 'confirmed' ? `SB-DEL-${number}` : undefined,
      anomaly: item.payment === 'unknown' ? { code: `SB-EX-${number}`, category: '付款结果暂不可确认', module: '资金与结算', status: 'open', at } :
        item.payment === 'difference' ? { code: `SB-EX-${number}`, category: '付款金额差异', module: '资金与结算', status: 'open', at } : undefined,
      canCancelAuthoritative: index === 0,
      events: [
        { at, label: '内部情景报价与签署条件已形成', source: 'Sandbox 订单', ref: id },
        { at: at + 60000, label: item.payment === 'awaiting' ? '等待付款' : item.payment === 'unknown' ? '付款结果待核' : item.payment === 'difference' ? '付款差异待核' : '内部情景实收结果已形成', source: 'Sandbox 资金', ref: `SB-PAY-${number}` },
      ],
      source: 'internal-sandbox', scenarioOfferingStatus: 'hypothetical-sandbox',
    };
  });
}

export function buildSandboxAllocationData(tenant: DemoTenant, asset: AssetRecord, instrument: InstrumentRecord, offering: OfferingRecord, orders: OrderRecord[], investor: { id: string; ref: string; displayName: string; kind: 'person' | 'organization' }, now = Date.now()): AllocationData {
  const decisions = orders.filter(item => item.capacity === 'allocated' && item.payment === 'final-matched');
  const allocations = decisions.map((order, index) => ({
    id: `${tenant.id}-sandbox-allocation-${index + 1}`, tenantId: tenant.id, orderId: order.id,
    investorId: investor.id, assetId: asset.id, offeringId: offering.id, instrumentId: instrument.id,
    instrumentVersion: order.instrumentVersion, tokenQuantity: order.quantity, state: 'confirmed' as const,
    decisionRef: `SB-ALLOC-${index + 1}`, decisionAt: now - 120000, decisionSource: 'Sandbox 流程规则',
    authorityRef: 'SB-RULE-001', lastCheckedAt: now,
    events: [{ at: now - 120000, label: '内部情景配售决定已形成', source: 'Sandbox 配售', ref: `SB-ALLOC-${index + 1}` }],
    source: 'internal-sandbox' as const,
  }));
  const holders = allocations.map((allocation, index) => {
    const order = decisions[index];
    const effective = order.registration === 'effective';
    const rights = legalRightsForTokens(instrument, order.instrumentVersion, order.quantity);
    if (!rights) throw Error('权益结构版本无法精确映射示例 Token 份数。');
    return {
      id: `${tenant.id}-sandbox-holder-${index + 1}`, tenantId: tenant.id, allocationId: allocation.id,
      investorId: investor.id, legalSubjectRef: `${investor.ref}-LEGAL`, displayName: investor.displayName,
      kind: investor.kind, assetId: asset.id, offeringId: offering.id, instrumentId: instrument.id,
      instrumentVersion: order.instrumentVersion, registration: effective ? 'effective' as const : 'submitted' as const,
      registrationRef: effective ? `SB-REG-${index + 1}` : undefined,
      registrationMode: effective ? 'self' as const : 'delegated' as const,
      authorityRef: effective ? 'SB-REG-AUTH-001' : 'SB-DELEGATE-REG-001',
      registrationPolicy: effective ? { submissionAllowed: true, responsibleRef: 'SB-REG-AUTH-001',
        authorityBasisRef: 'SB-REG-AUTH-V1', evidenceVersions: [{ ref: 'SB-REG-CORR-DOC-V1', label: '登记更正依据 V1', status: 'passed' as const }] } :
        { submissionAllowed: true, responsibleRef: 'SB-DELEGATE-REG-001',
          authorityBasisRef: 'SB-DELEGATION-V1', evidenceVersions: [{ ref: 'SB-REG-DOC-V1', label: '登记材料版本 V1', status: 'passed' as const }] },
      restrictionPolicy: effective ? { allowed: true, requesterRef: 'SB-REQUESTER-001', authorityBasisRef: 'SB-RESTRICTION-RULE-V1', partialAllowed: true } : undefined,
      restrictionFacts: effective ? [{ ref: 'SB-REST-001', state: 'effective' as const, rightsQuantity: legalRightsForTokens(instrument, order.instrumentVersion, '1')!.quantity,
        tokenQuantity: '1', basisRef: 'SB-RESTRICTION-RULE-V1', at: now - 50000 }] : undefined,
      rightsQuantity: effective ? rights.quantity : undefined, rightsUnit: effective ? rights.unit : undefined,
      effectiveAt: effective ? now - 60000 : undefined,
      tokenQuantity: order.quantity, tokenConfirmedAt: now - 30000,
      tokenSubjectRef: `${investor.ref}-LEGAL`, legalAsOf: effective ? now : undefined, tokenAsOf: now,
      updatedAt: now,
      events: [{ at: now - 30000, label: effective ? '内部情景登记与交付已核对' : '内部情景交付待登记回执核对', source: 'Sandbox 登记' }],
      source: 'internal-sandbox' as const,
    };
  });
  const issued = BigInt(latest(offering).fields.quantity);
  const allocated = decisions.reduce((sum, item) => sum + BigInt(item.quantity), 0n);
  const protectedTokens = orders.filter(item => item.capacity === 'protected').reduce((sum, item) => sum + BigInt(item.quantity), 0n);
  const max = BigInt(latest(instrument).fields.tokenSupply);
  if (issued > max || allocated > issued) throw Error('示例权益容量超出当前权益结构。');
  return { allocations, holders, capacities: [{
    tenantId: tenant.id, instrumentId: instrument.id, instrumentVersion: latest(instrument).number,
    maxTokens: max.toString(), confirmedOccupied: allocated.toString(), effectiveReserved: (issued - allocated).toString(),
    protectedTokens: protectedTokens.toString(), availableTokens: (max - issued).toString(),
    offeringReserved: { [offering.id]: (issued - allocated).toString() }, checkedAt: now, source: 'internal-sandbox',
  }] };
}

const inFlight = new Map<string, Promise<void>>();
async function prepareSandboxOperationalChain(tenant: DemoTenant): Promise<void> {
  const bucket = scope(tenant);
  if (!bucket || tenant.plan !== 'Standard' || tenant.role !== '企业管理员') return;
  for (const key of [manifestKey, 'wdex-issuer-portfolio-v1', 'wdex-issuer-investors-v1', 'wdex-issuer-orders-v1', 'wdex-issuer-allocation-v1']) {
    const raw = localStorage.getItem(key);
    if (raw) try { JSON.parse(raw); } catch { throw Error('本地业务记录无法读取，请先保留现有数据并核对存储状态。'); }
  }
  const manifest = readManifest()[bucket] || {};
  const scenarioOrder = (readOrders(tenant) || []).find(item => item.id === `${tenant.id}-sandbox-order-1`);
  if (scenarioOrder && (!manifest.offeringId || scenarioOrder.offeringId !== manifest.offeringId || scenarioOrder.assetId !== manifest.assetId)) throw Error('已有订单情景与资产或发行引用不一致，请先核对历史记录。');
  if (scenarioOrder && (readAllocationData(tenant)?.allocations || []).some(item => item.id === `${tenant.id}-sandbox-allocation-1`)) {
    const current = readPortfolio(tenant);
    if (!current.assets.some(item => item.id === scenarioOrder.assetId) || !current.offerings.some(item => item.id === scenarioOrder.offeringId)) throw Error('已有订单情景的资产或发行方案引用不可用，请先核对历史记录。');
    ensureSandboxRestrictionPolicy(tenant);
    ensureSandboxRegistrationPolicy(tenant);
    return;
  }
  let portfolio = readPortfolio(tenant);
  let asset = portfolio.assets.find(item => item.id === manifest.assetId);
  if (!asset) {
    asset = saveAsset(tenant, exampleAssetFor('office'));
    manifest.assetId = asset.id; saveManifest(bucket, manifest);
  }
  for (const kind of requiredAssetDocumentKinds(latest(asset).fields)) {
    portfolio = readPortfolio(tenant); asset = portfolio.assets.find(item => item.id === manifest.assetId)!;
    if (!asset.documents.some(doc => doc.kind === kind && doc.status === 'passed' && !doc.removed)) await addExampleDocument(tenant, 'asset', asset.id, kind);
  }
  portfolio = readPortfolio(tenant); asset = portfolio.assets.find(item => item.id === manifest.assetId)!;
  if (asset.status !== 'ready') asset = setAssetReady(tenant, asset.id);
  let instrument = portfolio.instruments.find(item => item.id === manifest.instrumentId);
  if (!instrument) {
    instrument = saveInstrument(tenant, asset.id, exampleInstrument(asset, 'income'));
    manifest.instrumentId = instrument.id; saveManifest(bucket, manifest);
  }
  portfolio = readPortfolio(tenant); instrument = portfolio.instruments.find(item => item.id === manifest.instrumentId)!;
  let legalDoc = instrument.documents.find(doc => doc.kind === 'legal' && doc.status === 'passed' && !doc.removed);
  if (!legalDoc) legalDoc = await addExampleDocument(tenant, 'instrument', instrument.id, 'legal');
  if (latest(instrument).fields.legalDocId !== legalDoc.id) {
    instrument = saveInstrument(tenant, asset.id, { ...latest(instrument).fields, legalDocId: legalDoc.id }, instrument.id, latest(instrument).number);
  }
  portfolio = readPortfolio(tenant); instrument = portfolio.instruments.find(item => item.id === manifest.instrumentId)!;
  if (instrument.status !== 'ready') instrument = setInstrumentReady(tenant, instrument.id);
  let offering = portfolio.offerings.find(item => item.id === manifest.offeringId);
  if (!offering) {
    offering = createOffering(tenant, asset.id);
    manifest.offeringId = offering.id; saveManifest(bucket, manifest);
  }
  portfolio = readPortfolio(tenant); offering = portfolio.offerings.find(item => item.id === manifest.offeringId)!;
  let subscription = offering.documents.find(doc => doc.kind === 'subscription' && doc.status === 'passed' && !doc.removed);
  let risk = offering.documents.find(doc => doc.kind === 'risk' && doc.status === 'passed' && !doc.removed);
  if (!subscription) subscription = await addExampleDocument(tenant, 'offering', offering.id, 'subscription');
  if (!risk) risk = await addExampleDocument(tenant, 'offering', offering.id, 'risk');
  const wallet = seedWallet(tenant);
  portfolio = readPortfolio(tenant); offering = portfolio.offerings.find(item => item.id === manifest.offeringId)!;
  if (!latest(offering).fields.price) {
    const fields = { ...exampleOffering(asset, 1), startsAt: localTime(-7), endsAt: localTime(30),
      walletId: wallet.id, subscriptionDocId: subscription.id, riskDocIds: [risk.id],
      partyIds: latest(asset).fields.relatedParties.map(item => item.id), noPartyDisclosure: !latest(asset).fields.relatedParties.length };
    const issues = offeringIssues(fields, asset, instrument, offering.documents, portfolio.wallets, offering);
    if (issues.length) throw Error(issues.join(' '));
    offering = saveOffering(tenant, offering.id, fields, latest(offering).number);
  }
  const investor = (readInvestorRelations(tenant) || []).find(item => item.kyc === 'passed' && item.state === 'active');
  if (!investor) throw Error('当前企业没有可用的脱敏投资者示例关系。');
  linkSandboxInvestor(tenant, investor.id, asset.id, offering.id);
  const existingOrders = readOrders(tenant) || [];
  const orders = buildSandboxOrders(tenant, asset, instrument, offering, investor);
  addSandboxOrders(tenant, orders);
  const recorded = readOrders(tenant) || [];
  const scenarioOrders = orders.map(item => recorded.find(saved => saved.id === item.id) || item);
  if (!existingOrders.some(item => item.id === orders[0].id) || !(readAllocationData(tenant)?.allocations.length)) {
    addSandboxAllocationData(tenant, buildSandboxAllocationData(tenant, asset, instrument, offering, scenarioOrders, investor));
  }
  ensureSandboxRestrictionPolicy(tenant);
  ensureSandboxRegistrationPolicy(tenant);
}
export function ensureSandboxOperationalChain(tenant: DemoTenant): Promise<void> {
  const bucket = scope(tenant);
  if (!bucket) return Promise.resolve();
  const existing = inFlight.get(bucket);
  if (existing) return existing;
  const next = prepareSandboxOperationalChain(tenant).finally(() => inFlight.delete(bucket));
  inFlight.set(bucket, next);
  return next;
}
