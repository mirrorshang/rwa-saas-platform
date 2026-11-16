import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

test('Offering exact arithmetic and seven-stage transitions', async () => {
  const vite = await createServer({ mode: 'demo', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { offeringAmounts, subscriptionLimits, nextOfferingStage } = await vite.ssrLoadModule('/src/offeringDomain.ts');
    assert.deepEqual(offeringAmounts('0.000000000002', '0.000000000001', '0.000000000001'), { valid: true, tokens: '2', raise: '0.000000000002', error: '' });
    assert.equal(offeringAmounts('0.000000000001', '0.000000000002', '1').valid, false);
    assert.equal(offeringAmounts('0.0000000000001', '0.000000000001', '1').valid, false);
    assert.equal(offeringAmounts('2', '1', '0').valid, false);
    assert.deepEqual(subscriptionLimits('1', '3', '0.5', '10'), []);
    assert.ok(subscriptionLimits('0.3', '2', '0.2', '10').some(item => item.includes('整数 Token')));
    assert.ok(subscriptionLimits('3', '2', '1', '10').length);
    const path = [['draft', 'confirm', 'confirmed'], ['confirmed', 'publish', 'published'], ['published', 'open', 'active'], ['active', 'end', 'ended'], ['ended', 'settle', 'settling'], ['settling', 'complete', 'completed']];
    for (const [stage, event, expected] of path) assert.equal(nextOfferingStage(stage, event), expected);
    assert.equal(nextOfferingStage('confirmed', 'cancel-confirmation'), 'draft');
    assert.equal(nextOfferingStage('draft', 'publish'), null);
    assert.equal(nextOfferingStage('confirmed', 'open'), null);
    assert.equal(nextOfferingStage('completed', 'open'), null);
  } finally { await vite.close(); }
});
