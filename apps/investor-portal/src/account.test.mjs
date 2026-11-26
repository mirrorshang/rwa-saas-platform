import test from 'node:test';
import assert from 'node:assert/strict';
import { accountKey, activeAccountKey, canSubmitSubscription, emailError, newAccount, otpError, safeAccountReturn, withDefaultWallet, withMpcResult, withOwnWallet } from './account.ts';

const m = { kind:'m' };
const v = { kind:'v', issuerSlug:'harbor' };
test('OTP validates email, expiry, one-time use and current code', () => {
  assert.match(emailError('bad'),/邮箱/);
  assert.equal(emailError(' User@Example.com '),'');
  assert.equal(otpError('246810',1000,1000), '');
  assert.match(otpError('246810',1000,1000+300001),/过期/);
  assert.match(otpError('246810',1000,1000,true),/已使用/);
  assert.match(otpError('000000',1000,1000),/Mock/);
});
test('same email remains isolated by V/M channel', () => {
  const email='User@Example.com';
  assert.notEqual(accountKey(m,email),accountKey(v,email));
  assert.notEqual(activeAccountKey(m),activeAccountKey(v));
  const mAccount=newAccount(m,email,'2026-11-26T00:00:00Z','op-m');
  const vAccount=newAccount(v,email,'2026-11-26T00:00:00Z','op-v');
  assert.notEqual(mAccount.id,vAccount.id);
  assert.equal(mAccount.email,'user@example.com');
  assert.equal(mAccount.mpc,'creating');
  assert.equal(mAccount.defaultWallet,undefined);
  assert.equal(mAccount.walletVersion,0);
  assert.equal(canSubmitSubscription(mAccount),false);
});
test('MPC creation and default wallet need confirmed Mock state', () => {
  const account=newAccount(m,'user@example.com','now','op-1');
  assert.equal(withDefaultWallet(account,'mpc').defaultWallet,undefined);
  const failed=withMpcResult(account,'failed');
  assert.equal(failed.mpcOperationId,'op-1');
  const ready=withMpcResult(failed,'ready');
  assert.equal(ready.mpc,'ready');
  assert.equal(ready.defaultWallet,'mpc');
  assert.equal(ready.walletVersion,0);
  assert.deepEqual(withMpcResult(ready,'ready'),ready);
  assert.equal(withDefaultWallet(ready,'own').defaultWallet,'mpc');
  const connected=withOwnWallet(ready,'0x'+'a'.repeat(40),false);
  assert.equal(withDefaultWallet(connected,'own').defaultWallet,'mpc');
  const verified=withOwnWallet(connected,connected.ownAddress,true);
  const switched=withDefaultWallet(verified,'own');
  assert.equal(switched.defaultWallet,'own');
  assert.equal(switched.walletVersion,1);
  assert.deepEqual(withDefaultWallet(switched,'own'),switched);
});
test('KYC only allows submission after approved and return stays in channel', () => {
  const account=newAccount(v,'user@example.com','now','op');
  for(const kyc of ['not-started','processing','supplement','failed','expired','unknown']) assert.equal(canSubmitSubscription({...account,kyc}),false);
  assert.equal(canSubmitSubscription({...account,kyc:'approved'}),true);
  assert.equal(safeAccountReturn(v,'/v/harbor/opportunities/residence-01'),'/v/harbor/opportunities/residence-01');
  assert.equal(safeAccountReturn(v,'/m/opportunities/debt-01'),'/v/harbor/account');
  assert.equal(safeAccountReturn(v,'/v/harbor//evil'),'/v/harbor/account');
  assert.equal(safeAccountReturn(v,'/v/harbor/../cedar/account'),'/v/harbor/account');
});
