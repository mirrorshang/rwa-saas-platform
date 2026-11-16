import { useEffect, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { ensureSandboxFunds, readFundsData } from '../issuerFundsV1';
import { ensureSandboxOperationalChain } from '../issuerOperationalScenarioV1';

export function useIssuerFundsScenario(tenant: DemoTenant) {
  const [state, setState] = useState<'idle' | 'preparing' | 'ready' | 'failed'>('idle');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [, setRevision] = useState(0);
  useEffect(() => {
    if (tenant.plan !== 'Standard') return;
    let active = true;
    setState('preparing');
    void ensureSandboxOperationalChain(tenant).then(() => ensureSandboxFunds(tenant)).then(() => {
      if (active) { setState('ready'); setRevision(value => value + 1); }
    }).catch(cause => { if (active) { setError(cause instanceof Error ? cause.message : '资金资料暂不可用。'); setState('failed'); } });
    return () => { active = false; };
  }, [tenant.id, tenant.plan, retry]);
  return { data: readFundsData(tenant), state, error, retry: () => setRetry(value => value + 1) };
}
