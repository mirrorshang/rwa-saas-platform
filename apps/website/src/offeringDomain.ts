import { exactMapping, formatAmount, parseAmount } from './instrumentDomain';

export type OfferingStage = 'draft' | 'confirmed' | 'published' | 'active' | 'ended' | 'settling' | 'completed';
export type StageEvent = 'confirm' | 'publish' | 'open' | 'end' | 'settle' | 'complete' | 'cancel-confirmation';
export function nextOfferingStage(stage: OfferingStage, event: StageEvent): OfferingStage | null {
  const table: Record<OfferingStage, Partial<Record<StageEvent, OfferingStage>>> = {
    draft: { confirm: 'confirmed' }, confirmed: { publish: 'published', 'cancel-confirmation': 'draft' },
    published: { open: 'active', end: 'ended' }, active: { end: 'ended' },
    ended: { settle: 'settling' }, settling: { complete: 'completed' }, completed: {},
  };
  return table[stage]?.[event] || null;
}

export function offeringAmounts(rights: string, perToken: string, price: string): { valid: boolean; tokens: string; raise: string; error: string } {
  const mapping = exactMapping(rights, perToken);
  if (!mapping.valid) return { valid: false, tokens: '', raise: '', error: mapping.error };
  const unitPrice = parseAmount(price);
  if (unitPrice === null || unitPrice <= 0n) return { valid: false, tokens: mapping.supply, raise: '', error: 'Token 单价须为大于 0、最多 12 位小数的 U/Token。' };
  return { valid: true, tokens: mapping.supply, raise: formatAmount(BigInt(mapping.supply) * unitPrice), error: '' };
}

export function subscriptionLimits(min: string, max: string, price: string, raise: string): string[] {
  const errors: string[] = []; const floor = parseAmount(min); const ceiling = max ? parseAmount(max) : null;
  const unitPrice = parseAmount(price); const total = parseAmount(raise);
  if (floor === null || floor <= 0n) errors.push('单笔最低认购金额须为正数，最多 12 位小数。');
  if (max && (ceiling === null || ceiling <= 0n)) errors.push('每位投资者累计最高认购金额无效。');
  if (floor !== null && total !== null && floor > total) errors.push('单笔最低认购金额不能超过最大募集额。');
  if (floor !== null && ceiling !== null && ceiling < floor) errors.push('累计最高认购金额不能低于单笔最低认购额。');
  if (ceiling !== null && total !== null && ceiling > total) errors.push('累计最高认购金额不能超过最大募集额。');
  if (unitPrice !== null && unitPrice > 0n) {
    if (floor !== null && floor % unitPrice !== 0n) errors.push('单笔最低认购金额须能精确换算为整数 Token。');
    if (ceiling !== null && ceiling % unitPrice !== 0n) errors.push('累计最高认购金额须能精确换算为整数 Token。');
  }
  return errors;
}
