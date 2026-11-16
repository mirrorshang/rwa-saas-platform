import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync('src/issuerNavigation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const nav = {};
new Function('require', 'exports', source)(() => { throw Error('unexpected import'); }, nav);

test('Free keeps preparation and enterprise routes while locking operational routes and their details', () => {
  for (const path of ['/issuer', '/issuer/assets', '/issuer/instruments/abc', '/issuer/offerings/abc',
    '/issuer/portal', '/issuer/token-contracts', '/issuer/token-contracts/abc', '/issuer/reports',
    '/issuer/audit-records', '/issuer/company', '/issuer/wallets', '/issuer/plan']) {
    assert.equal(nav.issuerFreeLockedPage(path), false, path);
  }
  for (const path of ['/issuer/subscription-records', '/issuer/lockups', '/issuer/investors/abc',
    '/issuer/orders/abc', '/issuer/allocation-holders/holder/abc', '/issuer/receipts/receipt/abc',
    '/issuer/refunds', '/issuer/settlement/abc', '/issuer/token-operations', '/issuer/chain-records/abc',
    '/issuer/servicing', '/issuer/distributions', '/issuer/exits']) {
    assert.equal(nav.issuerFreeLockedPage(path), true, path);
  }
  assert.equal(nav.issuerNavigation.length, 9);
});
