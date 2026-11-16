import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const tenant = { id: 'tenant-a', name: '示例企业', plan: 'Standard' };
const other = { id: 'tenant-b', name: '另一企业', plan: 'Standard' };
let selected = tenant;
const storage = new Map();
let orders = [];
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) };
const load = (path, dependencies) => {
  const source = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exported = {};
  new Function('require', 'exports', source)(name => {
    if (name === './issuerDemo') return { getDemoAuth: () => ({ email: 'owner@example.com' }), getDemoTenant: () => selected };
    if (name === './issuerOrdersV1') return { readOrders: () => orders };
    if (name === './issuerAllocationV1') return { readAllocationData: () => ({ allocations: [], holders: [] }) };
    if (name === './issuerPortfolioV1') return { readPortfolio: () => ({ wallets: [] }), latest: item => item.versions.at(-1) };
    if (dependencies[name]) return dependencies[name];
    throw Error(name);
  }, exported);
  return exported;
};
const fundsModule = load('src/issuerFundsV1.ts', {});
const settlement = load('src/issuerSettlementV1.ts', { './issuerFundsV1': fundsModule });
const order = (index, payment, registration) => ({ id: `order-${index}`, tenantId: tenant.id, source: 'internal-sandbox',
  offeringId: 'offering-1', offeringVersion: 1, instrumentVersion: 1, amount: `${index * 10}`, createdAt: index * 1000,
  payment, registration, investorRef: `investor-${index}` });
const setup = () => {
  selected = tenant;
  storage.clear();
  orders = [order(1, 'awaiting', 'none'), order(2, 'unknown', 'none'), order(3, 'final-matched', 'pending'),
    order(4, 'final-matched', 'effective'), order(5, 'difference', 'none')];
  fundsModule.ensureSandboxFunds(tenant);
  return settlement.ensureSandboxSettlement(tenant);
};

test('fixed Sandbox snapshot links source and preserves exact candidate capacity', () => {
  const data = setup();
  const snapshot = data.snapshots[0];
  assert.equal(snapshot.finalMatched, '70');
  assert.equal(snapshot.candidateAmount, '40');
  assert.equal(snapshot.restricted, '30');
  assert.equal(snapshot.sourceRef, `${tenant.id}-sandbox-receipt-2`);
  assert.equal(settlement.transferRoom(data, snapshot), '40');
  assert.deepEqual(settlement.ensureSandboxSettlement(tenant), data);
  selected = other;
  assert.deepEqual(settlement.readSettlementData(other), { snapshots: [], transfers: [] });
});

test('application checks fixed authorization, exact amount and concurrent commitment', () => {
  const data = setup();
  const snapshot = data.snapshots[0];
  const input = { amount: '10.000001', purpose: 'issuer-proceeds', beneficiaryRef: snapshot.beneficiaryRef,
    accountRef: snapshot.accountRef, legalBasisRef: snapshot.legalBasisRef, authorityRef: snapshot.authorityRef,
    note: '请按当前资金池条款与授权范围核对本次划拨申请。', confirmed: true };
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, { ...input, accountRef: 'changed' }), /不一致/);
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, { ...input, confirmed: false }), /请确认/);
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, { ...input, amount: '0' }), /额度/);
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, { ...input, amount: '1.0000001' }), /额度/);
  const first = settlement.submitTransferRequest(tenant, snapshot.id, input);
  assert.equal(first.approval, 'requested');
  assert.equal(first.execution, 'not-submitted');
  assert.equal(first.actualOut, '0');
  assert.equal(settlement.submitTransferRequest(tenant, snapshot.id, input).id, first.id);
  assert.equal(settlement.transferRoom(settlement.readSettlementData(tenant), snapshot), '29.999999');
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, { ...input, amount: '30' }), /额度/);
  assert.equal(settlement.transferCommitted(settlement.readSettlementData(tenant), snapshot.poolId), '10.000001');
  const updated = settlement.updateTransferApproval(tenant, first.id, 'unknown', 'SB-AUTH-UNKNOWN-1');
  assert.equal(updated.execution, 'not-submitted');
  assert.equal(settlement.transferRoom(settlement.readSettlementData(tenant), snapshot), '29.999999');
  settlement.updateTransferApproval(tenant, first.id, 'rejected', 'SB-AUTH-REJECT-1');
  assert.equal(settlement.transferRoom(settlement.readSettlementData(tenant), snapshot), '40');
  assert.equal(fundsModule.readFundsData(tenant).receipts[0].match, 'matched');
});

test('expired or conflicted snapshot blocks application and malformed storage is preserved', () => {
  const data = setup();
  const snapshot = data.snapshots[0];
  const input = { amount: '1', purpose: 'issuer-proceeds', beneficiaryRef: snapshot.beneficiaryRef,
    accountRef: snapshot.accountRef, legalBasisRef: snapshot.legalBasisRef, authorityRef: snapshot.authorityRef,
    note: '请按已核验条款核对本次释放资格和划拨申请。', confirmed: true };
  const key = 'wdex-issuer-settlement-v1';
  const all = JSON.parse(storage.get(key));
  all['owner@example.com/tenant-a'].snapshots[0].validUntil = Date.now() - 1;
  storage.set(key, JSON.stringify(all));
  assert.throws(() => settlement.submitTransferRequest(tenant, snapshot.id, input), /已过期/);
  storage.set(key, '{broken');
  assert.throws(() => settlement.ensureSandboxSettlement(tenant), /无法读取/);
  assert.equal(storage.get(key), '{broken');
});

test('new refund facts invalidate an older release snapshot without changing receipt facts', () => {
  const data = setup();
  const snapshot = data.snapshots[0];
  const funds = fundsModule.readFundsData(tenant);
  const eligibility = funds.refundEligibility[0];
  const original = funds.receipts.map(item => item.match);
  const request = fundsModule.submitRefundRequest(tenant, eligibility.id, {
    amount: '1', reason: 'offering-failed', note: '请按发行条款核对当前退款义务。', basisRef: eligibility.basisRef, confirmed: true,
  });
  const latestFunds = fundsModule.readFundsData(tenant);
  const modified = { ...latestFunds, refunds: latestFunds.refunds.map(item => item.id === request.id ? { ...item, updatedAt: snapshot.asOf + 1 } : item) };
  assert.match(settlement.releaseSnapshotIssues(snapshot, modified).join('；'), /重新核验/);
  assert.deepEqual(latestFunds.receipts.map(item => item.match), original);
});
