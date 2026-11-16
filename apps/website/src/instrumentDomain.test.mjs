import assert from 'node:assert/strict';
import test from 'node:test';
import { exactMapping, fieldChanges, legalVersionReady, nextRightsState, parseAmount, remainingCapacity } from './instrumentDomain.ts';

test('fixed Token mapping supports non 1:1 ratios without rounding', () => {
  assert.deepEqual(exactMapping('100', '0.25'), { valid: true, supply: '400', error: '' });
  assert.deepEqual(exactMapping('1000', '2'), { valid: true, supply: '500', error: '' });
  assert.equal(exactMapping('1', '0.3').valid, false);
  assert.equal(exactMapping('1', '0').valid, false);
  assert.equal(exactMapping('1', '0.0000000000001').valid, false);
  assert.equal(parseAmount('9007199254740993.000000000001'), 9007199254740993000000000001n);
});

test('capacity subtracts confirmed and active reserved independently', () => {
  assert.equal(remainingCapacity('100', '25.125', '10.5'), '64.375');
  assert.equal(remainingCapacity('100', '80', '30'), '-10');
  assert.equal(remainingCapacity('100', '', '1'), null);
});

test('only the approved Instrument lifecycle transitions are accepted', () => {
  const valid = [
    ['draft', 'prepare', 'preparing'], ['preparing', 'ready', 'ready'],
    ['ready', 'publish', 'active'], ['active', 'suspend', 'suspended'],
    ['suspended', 'resume', 'active'], ['suspended', 'terminate', 'terminating'],
    ['terminating', 'finalize', 'terminated'],
  ];
  for (const [state, action, expected] of valid) assert.equal(nextRightsState(state, action), expected);
  for (const [state, action] of [['draft', 'ready'], ['ready', 'suspend'], ['active', 'terminate'], ['terminated', 'prepare']]) assert.equal(nextRightsState(state, action), null);
});

test('Ready legal reference requires same owner, latest version and Passed scan', () => {
  const entries = [{ ref: { id: 'ref', owner: 'instrument', ownerId: 'rs-1', version: 1 }, file: { versions: [{ number: 1, scan: 'passed' }] } }];
  assert.equal(legalVersionReady('ref', 'rs-1', entries), true);
  assert.equal(legalVersionReady('ref', 'rs-2', entries), false);
  entries[0].file.versions[0].scan = 'unknown';
  assert.equal(legalVersionReady('ref', 'rs-1', entries), false);
  entries[0].file.versions[0].scan = 'passed';
  entries[0].file.versions.push({ number: 2, scan: 'pending' });
  assert.equal(legalVersionReady('ref', 'rs-1', entries), false);
});

test('new version field differences preserve before and after values', () => {
  assert.deepEqual(fieldChanges({ structureCap: '100', rightsPerToken: '1' }, { structureCap: '100', rightsPerToken: '0.5' }), [{ field: 'rightsPerToken', before: '1', after: '0.5' }]);
});
