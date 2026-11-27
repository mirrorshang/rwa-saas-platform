import React, { useEffect, useState } from 'react';
import { basePath, type Channel } from './domain';
import { activeAccount, emailError, newAccount, normalizeEmail, otpError, readAccount, safeAccountReturn, saveAccount, signOut, withDefaultWallet, withMpcResult, withOwnWallet, type AccountRecord, type KycStatus } from './account';
import { TicketPanel } from './OrdersPage';
import { issuers } from './data';

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
  const demoMode = new URLSearchParams(location.search).get('demo') === '1';
  const channelName = channel.kind === 'm' ? '总投资者平台' : issuers[channel.issuerSlug as keyof typeof issuers]?.name || '企业投资者平台';
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
  const accountLink = (suffix: string) => root + '/account' + suffix + (from || demoMode ? '?' + [from ? 'from=' + encodeURIComponent(from) : '', demoMode ? 'demo=1' : ''].filter(Boolean).join('&') : '');
  if (!account && !demoMode) return <main className="container inner-page account-login"><div className="account-intro"><p className="eyebrow">ACCOUNT</p><h1>邮箱登录</h1><p>{channelName}的账户服务尚未开放。当前无法发送真实验证码或创建正式账户。</p></div><section className="content-panel login-panel"><h2>服务暂不可用</h2><p>您可以继续浏览公开的示例项目。认证和交易服务开放后，登录将在此处提供。</p><a className="button button-secondary" href={returnLink}>返回项目浏览</a></section></main>;
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
  return <main className="container inner-page"><div className="page-head"><div><p className="eyebrow">ACCOUNT</p><h1>我的账户</h1><p>{account.email} · {channelName}</p></div><a className="text-link" href={returnLink}>{from ? '返回原页面' : '浏览投资机会'} →</a></div><div className="account-layout"><nav className="account-sidebar" aria-label="账户菜单">{sections.map(([suffix,label]) => <a key={suffix} className={section === suffix ? 'active' : ''} href={accountLink(suffix)}>{label}</a>)}</nav><div className="account-body">
    {section === '' && <section className="content-panel"><h2>账户概览</h2><div className="info-grid"><div><small>登录邮箱</small><strong>{account.email}</strong></div><div><small>身份认证</small><strong>{labels[account.kyc]}</strong></div><div><small>平台钱包</small><strong>{mpcLabels[account.mpc]}</strong></div><div><small>默认钱包</small><strong>{account.defaultWallet === 'own' ? '已验证自有钱包' : account.defaultWallet === 'mpc' ? '平台钱包' : '尚未设置'}</strong></div></div><p>浏览项目无需身份认证；提交真实认购前须完成身份与投资资格核验。当前记录只在此浏览器中保存，不代表正式账户或认证结果。</p><a className="text-link" href={accountLink('/kyc')}>查看认证状态 →</a></section>}
    {section === '/profile' && <section className="content-panel"><h2>基本资料</h2><div className="info-grid"><div><small>邮箱</small><strong>{account.email}</strong></div><div><small>账户范围</small><strong>{channelName}</strong></div><div><small>创建时间</small><strong>{new Date(account.createdAt).toLocaleString('zh-CN')}</strong></div><div><small>个人 / 机构资料</small><strong>尚未提交</strong></div></div><p>身份资料服务尚未开放，请勿在此输入真实证件或机构材料。</p></section>}
    {section === '/kyc' && <section className="content-panel"><h2>身份认证</h2><div className="account-status"><span>当前记录</span><strong>{labels[account.kyc]}</strong></div><p>认购前需要核验身份与投资资格。认证服务尚未接入，当前浏览器记录不能证明真实认证已通过。</p>{demoMode && account.kyc !== 'approved' && <button className="button" type="button" onClick={() => { if (account.kyc === 'processing' || account.kyc === 'unknown') { setStatusNote('原示例申请仍待核实。'); return; } update({ ...account, kyc:'processing', kycUpdatedAt:new Date().toISOString() }); setStatusNote('已记录示例申请，等待测试结果。'); }}>模拟认证申请</button>}{statusNote && <p className="hint" role="status">{statusNote}</p>}{!demoMode && <p className="hint">当前暂无可提交的认证申请。请等待认证服务开放。</p>}<a className="text-link" href={returnLink}>返回原项目 →</a></section>}
    {section === '/wallets' && <><section className="content-panel"><h2>平台钱包</h2><div className="account-status"><span>分配状态</span><strong>{mpcLabels[account.mpc]}</strong></div>{account.mpcAddress && <p>地址：{account.mpcAddress.replace(/^Mock\s*/i, '示例 ')}</p>}<p className="hint">真实钱包服务尚未开放。当前地址及状态为本地示例记录，不能用于收付款或保管资产。</p>{demoMode && <><p>演示操作 ID：{account.mpcOperationId}</p>{account.mpc !== 'ready' && <button className="button button-secondary" type="button" onClick={() => update(withMpcResult(account,'ready'))}>模拟钱包就绪</button>}{account.mpc === 'ready' && <button className="button button-secondary" type="button" disabled={account.defaultWallet === 'mpc'} onClick={() => update(withDefaultWallet(account,'mpc'))}>设为示例默认钱包</button>}</>}</section><section className="content-panel"><h2>自有钱包</h2><p>真实钱包连接和签名验证尚未开放。输入地址本身不能证明持有权。</p>{account.ownAddress && <p>已记录地址：{account.ownAddress} · {account.ownVerified ? '示例验证记录' : '未验证'}</p>}{demoMode && <><label className="field-label" htmlFor="own-address">演示钱包地址</label><input id="own-address" value={ownAddress} onChange={event => { setOwnAddress(event.target.value); setOwnChallenge(false); }} placeholder="0x + 40 位十六进制字符" /><div className="wallet-actions"><button className="button button-secondary" type="button" onClick={() => { const problem=walletError(ownAddress); if (problem) { setError(problem); return; } update(withOwnWallet(account,ownAddress,false)); setOwnChallenge(true); setError(''); }}>创建演示挑战</button>{ownChallenge && <button className="button" type="button" onClick={() => { update(withOwnWallet(account,ownAddress,true)); setOwnChallenge(false); }}>模拟签名验证</button>}{account.ownVerified && <button className="button button-secondary" type="button" disabled={account.defaultWallet === 'own'} onClick={() => update(withDefaultWallet(account,'own'))}>设为示例默认钱包</button>}</div>{error && <p className="form-error" role="alert">{error}</p>}</>}</section></>}
    {section === '/security' && <section className="content-panel"><h2>账户安全</h2><p>当前账户记录仅保存在此浏览器中。请勿输入真实密码、私钥、助记词或验证码。</p><button className="button button-secondary" type="button" onClick={() => { signOut(channel); location.href=accountLink(''); }}>退出当前渠道账户</button></section>}
    {section === '/tickets' && <TicketPanel channel={channel} account={account} />}
  </div></div></main>;
}
