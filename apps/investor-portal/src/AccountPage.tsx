import React, { useEffect, useState } from 'react';
import { basePath, type Channel } from './domain';
import { activeAccount, emailError, newAccount, normalizeEmail, otpError, readAccount, safeAccountReturn, saveAccount, signOut, withDefaultWallet, withMpcResult, withOwnWallet, type AccountRecord, type KycStatus } from './account';

const labels: Record<KycStatus,string> = {
  'not-started':'未开始', processing:'认证中', supplement:'待补件', approved:'已通过',
  failed:'未通过', expired:'已过期', unknown:'结果待核实'
};
const mpcLabels = { creating:'创建中', ready:'已就绪', failed:'创建失败', unknown:'结果待核实', 'service-gated':'待服务准入' } as const;
const sections = [
  ['','账户概览'],['/profile','基本资料'],['/kyc','身份认证'],['/wallets','钱包管理'],['/security','账户安全'],['/tickets','我的工单']
] as const;
const walletError = (value: string) => /^0x[0-9a-fA-F]{40}$/.test(value.trim()) ? '' : '请输入 0x 开头的 40 位十六进制演示地址';

export function AccountPage({ channel, section }: { channel: Channel; section: string }) {
  const root = basePath(channel);
  const from = new URLSearchParams(location.search).get('from');
  const back = safeAccountReturn(channel,from);
  const returnLink = from ? back : root + '/opportunities';
  const [account,setAccount] = useState<AccountRecord | null>(() => activeAccount(channel));
  const [email,setEmail] = useState('');
  const [code,setCode] = useState('');
  const [consent,setConsent] = useState(false);
  const [challenge,setChallenge] = useState<{email:string;issuedAt:number;used:boolean} | null>(null);
  const [seconds,setSeconds] = useState(0);
  const [error,setError] = useState('');
  const [statusNote,setStatusNote] = useState('');
  const [ownAddress,setOwnAddress] = useState(account?.ownAddress || '');
  const [ownChallenge,setOwnChallenge] = useState(false);
  useEffect(() => {
    if (!seconds) return;
    const timer = window.setTimeout(() => setSeconds(seconds-1),1000);
    return () => window.clearTimeout(timer);
  },[seconds]);
  const update = (next: AccountRecord) => { saveAccount(channel,next); setAccount(next); };
  const accountLink = (suffix: string) => root + '/account' + suffix + (from ? '?from=' + encodeURIComponent(from) : '');
  if (!account) {
    const send = () => {
      const problem = emailError(email);
      if (problem) { setError(problem); return; }
      setChallenge({ email:normalizeEmail(email), issuedAt:Date.now(), used:false });
      setCode(''); setSeconds(30); setError('');
    };
    const verify = () => {
      if (!challenge || challenge.email !== normalizeEmail(email)) { setError('请重新获取当前邮箱的验证码'); return; }
      const problem = otpError(code,challenge.issuedAt,Date.now(),challenge.used);
      if (problem) { setError(problem); return; }
      const existing = readAccount(channel,email);
      if (!existing && !consent) { setError('首次建号需确认必要协议与隐私政策的 Mock 演示说明'); return; }
      setChallenge({ ...challenge, used:true });
      const next = existing || newAccount(channel,email,new Date().toISOString(),crypto.randomUUID());
      update(next);
      location.href = back;
    };
    return <main className="container inner-page account-login"><div className="account-intro"><p className="eyebrow">ACCOUNT · MOCK</p><h1>邮箱登录</h1><p>当前为 {channel.kind === 'm' ? 'M 总投资者平台' : 'V 企业投资者平台'}独立演示账户。不会发送真实邮件或创建生产账户。</p></div><section className="content-panel login-panel"><label className="field-label" htmlFor="account-email">邮箱地址</label><input id="account-email" type="email" autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder="investor@example.com" /><button className="button button-secondary" type="button" onClick={send} disabled={seconds > 0}>{seconds ? seconds + ' 秒后可重发' : '获取 Mock 验证码'}</button>{challenge && <><p className="mock-code">演示验证码：<strong>246810</strong> · 5 分钟有效，不发送邮件</p><label className="field-label" htmlFor="account-code">六位验证码</label><input id="account-code" inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value)} placeholder="输入页面显示的验证码" /><label className="check-row"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />首次建号时确认已查看必要协议与隐私政策的 Mock 演示说明</label><p className="hint">此勾选仅模拟注册界面，不构成法律签署或真实账户协议接受。</p><button className="button" type="button" onClick={verify}>验证并登录</button></>}{error && <p className="form-error" role="alert">{error}</p>}</section><p className="account-login-note">未登录仍可浏览公开项目。验证成功将返回原项目或认购页面。</p></main>;
  }
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">ACCOUNT · MOCK</p><h1>我的账户</h1><p>{account.email} · {channel.kind === 'm' ? 'M 总投资者平台' : 'V · ' + channel.issuerSlug} 独立账户</p></div><a className="text-link" href={returnLink}>{from ? '返回原页面' : '浏览投资机会'} →</a></div><div className="account-layout"><nav className="account-sidebar" aria-label="账户菜单">{sections.map(([suffix,label]) => <a key={suffix} className={section === suffix ? 'active' : ''} href={accountLink(suffix)}>{label}</a>)}</nav><div className="account-body">
    {section === '' && <section className="content-panel"><h2>账户概览</h2><div className="info-grid"><div><small>登录邮箱</small><strong>{account.email}</strong></div><div><small>KYC 状态</small><strong>{labels[account.kyc]}</strong></div><div><small>MPC 钱包</small><strong>{mpcLabels[account.mpc]}</strong></div><div><small>默认钱包</small><strong>{account.defaultWallet === 'own' ? '已验证自有钱包' : account.defaultWallet === 'mpc' ? 'MPC 钱包' : '尚未设置'}</strong></div></div><p>浏览项目无需 KYC；正式提交认购前需核验身份与投资资格。所有状态仅为本机 Mock。</p></section>}
    {section === '/profile' && <section className="content-panel"><h2>基本资料</h2><div className="info-grid"><div><small>邮箱</small><strong>{account.email}</strong></div><div><small>账户范围</small><strong>{channel.kind === 'm' ? 'M 平台' : 'V · '+channel.issuerSlug}</strong></div><div><small>创建时间</small><strong>{new Date(account.createdAt).toLocaleString('zh-CN')}</strong></div><div><small>个人 / 机构资料</small><strong>未提交 · Mock</strong></div></div><p>本原型不收集真实身份文件、个人信息或机构材料。</p></section>}
    {section === '/kyc' && <section className="content-panel"><h2>身份认证</h2><div className="account-status"><span>当前状态</span><strong>{labels[account.kyc]}</strong></div><p>{account.kyc === 'approved' ? 'Mock 认证状态已通过；真实投资资格仍须由后续服务核验。' : account.kyc === 'unknown' ? '结果待核实，请查询原申请，不要重复创建身份认证。' : account.kyc === 'supplement' ? '请补充材料后继续。当前仅模拟补件，不上传真实证件。' : '本页只演示身份认证状态，不连接真实 KYC Provider。'}</p>{account.kyc !== 'approved' && <button className="button" type="button" onClick={() => { if (account.kyc === 'processing' || account.kyc === 'unknown') { setStatusNote('已查询原 Mock 申请，结果仍待核实。'); return; } update({ ...account, kyc:'processing', kycUpdatedAt:new Date().toISOString() }); setStatusNote('Mock 申请已提交，等待模拟 Provider 结果。'); }}>{account.kyc === 'not-started' ? '开始 Mock 认证' : account.kyc === 'supplement' ? '提交 Mock 补件' : account.kyc === 'failed' || account.kyc === 'expired' ? '重新申请 Mock 认证' : '查询原 Mock 申请'}</button>}{statusNote && <p className="hint" role="status">{statusNote}</p>}<p className="hint">Provider 回跳、页面访问和提交动作本身均不表示 KYC 已通过。测试结果可在独立 /demo 控制台切换。</p></section>}
    {section === '/wallets' && <><section className="content-panel"><h2>默认 MPC 钱包</h2><div className="account-status"><span>分配状态</span><strong>{mpcLabels[account.mpc]}</strong></div><p>操作 ID：{account.mpcOperationId}</p>{account.mpcAddress && <p>地址：{account.mpcAddress}</p>}{account.mpc !== 'ready' && <button className="button button-secondary" type="button" onClick={() => update(withMpcResult(account,'ready'))}>查询原操作并模拟就绪</button>}{account.mpc === 'ready' && <button className="button button-secondary" type="button" disabled={account.defaultWallet === 'mpc'} onClick={() => update(withDefaultWallet(account,'mpc'))}>{account.defaultWallet === 'mpc' ? '当前默认钱包' : '设为默认钱包'}</button>}<p className="hint">不会生成真实私钥、助记词或 Provider 钱包；同一账户保留原操作 ID。</p></section><section className="content-panel"><h2>绑定自有钱包</h2><p>连接、一次性挑战和签名验证均为前端 Mock；输入地址不等于验证通过。</p><label className="field-label" htmlFor="own-address">演示钱包地址</label><input id="own-address" value={ownAddress} onChange={event => { setOwnAddress(event.target.value); setOwnChallenge(false); }} placeholder="0x + 40 位十六进制字符" /><div className="wallet-actions"><button className="button button-secondary" type="button" onClick={() => { const problem=walletError(ownAddress); if (problem) { setError(problem); return; } update(withOwnWallet(account,ownAddress,false)); setOwnChallenge(true); setError(''); }}>连接并创建 Mock 挑战</button>{ownChallenge && <button className="button" type="button" onClick={() => { update(withOwnWallet(account,ownAddress,true)); setOwnChallenge(false); }}>模拟签名验证通过</button>}{account.ownVerified && <button className="button button-secondary" type="button" disabled={account.defaultWallet === 'own'} onClick={() => update(withDefaultWallet(account,'own'))}>{account.defaultWallet === 'own' ? '当前默认钱包' : '设为默认钱包'}</button>}</div>{account.ownAddress && <p className="hint">{account.ownAddress} · {account.ownVerified ? 'Mock 已验证' : '未验证'}</p>}{error && <p className="form-error" role="alert">{error}</p>}</section></>}
    {section === '/security' && <section className="content-panel"><h2>账户安全</h2><p>本机 Mock 会话仅保存在当前浏览器标签。不要输入真实密码、私钥、助记词或验证码。</p><button className="button button-secondary" type="button" onClick={() => { signOut(channel); location.href=accountLink(''); }}>退出当前渠道账户</button></section>}
    {section === '/tickets' && <section className="content-panel"><h2>我的工单</h2><p>工单与客服将在 DEV-05 实现；此处不显示虚构工单。</p></section>}
  </div></div></main>;
}
