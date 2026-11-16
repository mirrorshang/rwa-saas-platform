// Exact, bounded decimal arithmetic for the browser sandbox. Contract decimals are not defined here.
export const precision = 12n;
export const scale = 10n ** precision;

export function parseAmount(value: string): bigint | null {
  if (!/^\d+(?:\.\d{1,12})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * scale + BigInt(fraction.padEnd(Number(precision), '0'));
}

export function formatAmount(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  return `${sign}${absolute / scale}${absolute % scale ? `.${(absolute % scale).toString().padStart(Number(precision), '0').replace(/0+$/, '')}` : ''}`;
}

export function exactMapping(totalText: string, perTokenText: string): { valid: boolean; supply: string; error: string } {
  const total = parseAmount(totalText); const perToken = parseAmount(perTokenText);
  if (total === null || perToken === null || total <= 0n || perToken <= 0n) return { valid: false, supply: '', error: '权益总量和每 Token 对应权益必须为大于 0、最多 12 位小数的数字。' };
  if (total % perToken !== 0n) return { valid: false, supply: '', error: '授权权益无法按当前比例精确划分为整数 Token；请调整映射比例。' };
  return { valid: true, supply: (total / perToken).toString(), error: '' };
}

export function remainingCapacity(total: string, confirmed: string, reserved: string): string | null {
  const values = [total, confirmed, reserved].map(parseAmount);
  if (values.some(value => value === null || value < 0n)) return null;
  return formatAmount(values[0]! - values[1]! - values[2]!);
}

export function legalVersionReady(refId: string | undefined, ownerId: string, entries: { ref: { id: string; owner: string; ownerId: string; version: number }; file: { versions: { number: number; scan?: string }[] } }[]): boolean {
  return Boolean(refId && entries.some(({ ref, file }) => ref.id === refId && ref.owner === 'instrument' && ref.ownerId === ownerId && file.versions.at(-1)?.number === ref.version && file.versions.some(version => version.number === ref.version && version.scan === 'passed')));
}

export function fieldChanges(before: Record<string, unknown>, after: Record<string, unknown>): { field: string; before: string; after: string }[] {
  return Object.keys(after).filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])).map(field => ({ field, before: String(before[field] ?? ''), after: String(after[field] ?? '') }));
}

export type RightsState = 'draft' | 'preparing' | 'ready' | 'active' | 'suspended' | 'terminating' | 'terminated';
export type RightsAction = 'prepare' | 'ready' | 'publish' | 'suspend' | 'resume' | 'terminate' | 'finalize';
export function nextRightsState(state: RightsState, action: RightsAction): RightsState | null {
  const transitions: Partial<Record<RightsState, Partial<Record<RightsAction, RightsState>>>> = {
    draft: { prepare: 'preparing' },
    preparing: { ready: 'ready' },
    ready: { publish: 'active' },
    active: { suspend: 'suspended' },
    suspended: { resume: 'active', terminate: 'terminating' },
    terminating: { finalize: 'terminated' },
  };
  return transitions[state]?.[action] || null;
}
