import { useEffect, useMemo, useState } from 'react';
import type { DemoTenant } from '../issuerDemo';
import { getKybRecord } from '../issuerKybFlow';
import { latest as latestPortfolio, readPortfolio, type Portfolio } from '../issuerPortfolioV1';
import { latest as latestLegacy, listOfferings, type Offering as LegacyOffering } from '../issuerIssuance';
import {
  finishPreviewAction, inspectPreviewIntent, portalOfferingVisibility, readPortal, savePortalDraft,
  startPreviewAction, validatePortalLogo, validatePortalName,
  type PortalLogo, type PortalOfferingView, type PortalRecord, type PreviewAction,
} from '../issuerPortalV1';
import '../portfolioV1.scss';
import '../issuerPortalV1.scss';

type Props = { tenant: DemoTenant; query: string; onDirtyChange: (dirty: boolean) => void; onRequestDiscard: (action: () => void) => void };
const href = (path: string, query: string) => `${path}?${query}`;
const when = (value?: number) => value ? new Date(value).toLocaleString('zh-CN') : '尚无成功核验记录';
const stageLabel: Record<string, string> = { draft: '草稿', confirmed: '已确认', published: '已发布', active: '认购中', ended: '已结束', settling: '结算中', completed: '已完成', 'sandbox-published': '已发布', 'sandbox-paused': '已暂停', 'sandbox-ended': '已结束' };
const flowLabel: Record<string, string> = { idle: '未开始', published: '发布后预览', paused: '暂停后预览', processing: '处理中', unknown: '结果待确认', failed: '失败' };
const actionLabel: Record<PreviewAction, string> = { publish: '发布', pause: '暂停', resume: '恢复' };

function offeringRows(portfolio: Portfolio, legacy: LegacyOffering[]): PortalOfferingView[] {
  const current = portfolio.offerings.map(item => {
    const fields = latestPortfolio(item).fields;
    const asset = portfolio.assets.find(asset => asset.id === item.assetId);
    const required = [item.documents.find(doc => doc.id === fields.subscriptionDocId && doc.kind === 'subscription' && doc.status === 'passed' && !doc.removed),
      fields.riskDocIds.some(id => item.documents.some(doc => doc.id === id && doc.kind === 'risk' && doc.status === 'passed' && !doc.removed))];
    return { id: item.id, number: item.number, name: fields.name, assetName: asset ? latestPortfolio(asset).fields.name : '关联资产待核对',
      assetVersion: item.assetVersion, instrumentVersion: item.instrumentVersion, stage: '草稿', startsAt: fields.startsAt,
      endsAt: fields.endsAt, timezone: fields.timezone, disclosure: required[0] && required[1] ? '待核实' : '缺项', source: '当前发行方案' } satisfies PortalOfferingView;
  });
  const earlier = legacy.filter(item => !current.some(row => row.id === item.id)).map(item => {
    const fields = latestLegacy(item).fields;
    return { id: item.id, number: item.number, name: fields.name || item.number, assetName: fields.assetId || '关联资产待核对',
      assetVersion: fields.assetVersion, instrumentVersion: fields.instrumentVersion,
      stage: item.status === 'draft' ? '草稿' : `Sandbox ${stageLabel[item.status] || '状态待核对'}`,
      startsAt: fields.opensAt, endsAt: fields.closesAt, timezone: '按发行方案', disclosure: '待核实', source: '既有发行记录' } satisfies PortalOfferingView;
  });
  return [...current, ...earlier];
}

const readImage = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(Error('图片读取失败。'));
  reader.onerror = () => reject(Error('图片读取失败。'));
  reader.readAsDataURL(file);
});

export function IssuerPortalV1({ tenant, query, onDirtyChange, onRequestDiscard }: Props) {
  const free = tenant.plan === 'Free';
  const [portal, setPortal] = useState<PortalRecord>(() => readPortal(tenant));
  const [portfolio, setPortfolio] = useState(() => readPortfolio(tenant));
  const [legacy, setLegacy] = useState(() => listOfferings(tenant) || []);
  const [name, setName] = useState(() => readPortal(tenant).draft?.name || tenant.name);
  const [logo, setLogo] = useState<PortalLogo | null>(() => readPortal(tenant).draft?.logo || null);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<'none' | 'current' | 'saved'>('none');
  const [confirm, setConfirm] = useState<PreviewAction | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [checkedAt, setCheckedAt] = useState(0);
  const kyb = getKybRecord(tenant);
  const approvedIntro = kyb.status === 'passed' ? kyb.value.business : '';
  const rows = useMemo(() => offeringRows(portfolio, legacy), [portfolio, legacy]);
  const dirty = editing && (name !== (portal.draft?.name || tenant.name) || logo?.dataUrl !== portal.draft?.logo?.dataUrl);
  const canEdit = !free && tenant.role === '企业管理员';
  const refresh = () => { setPortal(readPortal(tenant)); setPortfolio(readPortfolio(tenant)); setLegacy(listOfferings(tenant) || []); };
  useEffect(() => { window.addEventListener('wdex-portal-changed', refresh); window.addEventListener('wdex-portfolio-changed', refresh); return () => { window.removeEventListener('wdex-portal-changed', refresh); window.removeEventListener('wdex-portfolio-changed', refresh); }; }, [tenant]);
  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  const restore = () => { const saved = readPortal(tenant); setPortal(saved); setName(saved.draft?.name || tenant.name); setLogo(saved.draft?.logo || null); setEditing(false); setError(''); setNotice('已加载当前保存版本。'); };
  const cancel = () => { if (dirty) onRequestDiscard(restore); else restore(); };
  const reload = () => { if (dirty) onRequestDiscard(restore); else restore(); };
  const upload = async (file?: File) => {
    if (!file) return;
    const issue = validatePortalLogo(file);
    if (issue) { setError(issue); return; }
    setBusy(true); setError('');
    try { setLogo({ name: file.name, mime: file.type, size: file.size, dataUrl: await readImage(file) }); setNotice('图片已加入当前草稿，保存后仍需服务端安全核验。'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Logo 读取失败。'); }
    finally { setBusy(false); }
  };
  const save = () => {
    setError(''); setNotice('');
    const issue = validatePortalName(name);
    if (issue) { setError(issue); return; }
    setBusy(true);
    try { const saved = savePortalDraft(tenant, name, logo, portal.draft?.version || 0); setPortal(saved); setName(saved.draft?.name || name.trim()); setEditing(false); setNotice('基础展示草稿已保存，仅供内部预览，尚未对外生效。'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '保存失败，当前修改已保留。'); }
    finally { setBusy(false); }
  };
  const beginFlow = (action: PreviewAction) => {
    setConfirm(null); setError('');
    try {
      const started = startPreviewAction(tenant, action);
      setPortal(started); setNotice('内部流程预览处理中，不会发送对外发布请求。');
    } catch (cause) { setError(cause instanceof Error ? cause.message : '无法开始内部流程预览。'); }
  };
  const settleFlow = (result: 'success' | 'failed' | 'unknown') => {
    if (!portal.intent) return;
    try { setPortal(finishPreviewAction(tenant, portal.intent.id, result)); setNotice(result === 'success' ? '内部流程状态已更新，真实门户状态仍为未创建。' : result === 'failed' ? '内部流程失败，原状态保持。' : '结果待确认。请先查询原操作，不要重复提交。'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : '原操作结果待核对。'); }
  };
  const viewName = free ? tenant.name : preview === 'saved' ? portal.draft?.name || tenant.name : preview === 'current' ? name : portal.draft?.name || tenant.name;
  const viewLogo = free ? null : preview === 'saved' ? portal.draft?.logo : preview === 'current' ? logo : portal.draft?.logo;
  const blockers = [
    ...(free ? ['Free 套餐仅允许内部只读预览'] : []),
    ...(kyb.status !== 'passed' ? ['企业 KYB 尚未通过'] : []),
    ...(!portal.draft && !free ? ['基础展示草稿尚未保存'] : []),
    '标准门户生产服务与实例未接入', '真实订阅、法律披露及生产准入尚无权威核验结果',
    ...(rows.some(row => portalOfferingVisibility(row).label === '可展示') ? [] : ['当前无可核实为对外可展示的 Offering']),
  ];
  const baseHref = href('/issuer/company', query);
  return <div className="issuer-portal asset-page">
    <header className="asset-page-head"><nav className="issuer-crumb" aria-label="面包屑"><a href={href('/issuer', query)}>工作台首页</a><span> / </span>投资者门户</nav><div className="asset-heading"><div><h1>投资者门户</h1><p>管理本机构的标准投资者门户。展示与认购始终以各自业务状态及适用法律为准。</p></div><button type="button" className="issuer-action" onClick={() => setPreview(free ? 'saved' : 'current')}>内部预览</button></div></header>
    {free && <div className="portal-sandbox" role="status">Sandbox 模拟 · 不是真实投资产品 · 仅供内部只读预览</div>}
    <section className="issuer-card portal-overview" aria-labelledby="portal-overview-title"><div className="portal-section-head"><div><h2 id="portal-overview-title">门户概览</h2><p>真实门户服务尚未连接，当前页面不会创建对外实例。</p></div><span className="asset-pill">真实状态：未创建</span></div><dl className="portal-facts"><div><dt>当前企业</dt><dd>{tenant.name}</dd></div><div><dt>套餐</dt><dd>{tenant.plan} · {free ? '内部预览' : '生产资格待核验'}</dd></div><div><dt>服务环境</dt><dd>{free ? '内部 Sandbox' : '生产门户服务未连接'}</dd></div><div><dt>门户地址</dt><dd>未提供对外地址</dd></div><div><dt>最近成功核验</dt><dd>尚无真实服务核验记录</dd></div></dl><details><summary>当前阻断事项（{blockers.length}）</summary><ul className="pv-checks">{blockers.map(item => <li key={item}>{item}</li>)}</ul><a href={baseHref}>查看企业资料与认证</a></details></section>
    <section className="issuer-card portal-section" aria-labelledby="portal-basic-title"><div className="portal-section-head"><div><h2 id="portal-basic-title">基础展示信息</h2><p>采用固定标准模板；机构简介引用已批准的企业资料。</p></div><span className="asset-pill">{portal.draft ? `草稿 V${portal.draft.version} · 已保存` : '尚无配置草稿'}</span></div>
      {free ? <dl className="portal-facts"><div><dt>门户展示名称</dt><dd>{tenant.name}</dd></div><div><dt>机构 Logo</dt><dd>使用标准占位标识</dd></div><div><dt>机构简介</dt><dd>{approvedIntro || '企业资料暂无可引用的简介'}</dd></div><div><dt>门户模板</dt><dd>标准模板 · 固定布局</dd></div></dl> : <><div className="portal-form"><label className="pv-field"><span>门户展示名称 <em>必填</em></span><input value={editing ? name : portal.draft?.name || tenant.name} disabled={!editing} maxLength={80} onChange={event => setName(event.target.value)} placeholder="请输入门户展示名称" /><small>仅作为展示名称，不改变法定企业名称。</small></label><div className="portal-logo"><strong>机构 Logo <small>选填</small></strong>{(editing ? logo : portal.draft?.logo) ? <img src={(editing ? logo : portal.draft?.logo)!.dataUrl} alt="机构 Logo 预览" /> : <span className="portal-logo-empty">标准占位标识</span>}{editing && <><label className="issuer-secondary">选择图片<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label>{logo && <button type="button" className="issuer-secondary" onClick={() => setLogo(null)}>移除</button>}<small>PNG、JPG、WebP；内部预览上限 2 MB。正式生效仍须安全核验。</small></>}</div></div><dl className="portal-facts"><div><dt>机构简介</dt><dd>{approvedIntro || '企业资料暂无可引用的简介'}</dd></div><div><dt>门户模板</dt><dd>标准模板 · 固定布局</dd></div><div><dt>保存状态</dt><dd>{busy ? '保存中' : dirty ? '有未保存修改' : portal.draft ? '已保存 · 未对外生效' : '尚无草稿'}</dd></div></dl><div className="c08-actions">{canEdit && (editing ? <><button type="button" className="issuer-action" disabled={busy} onClick={save}>保存草稿</button><button type="button" className="issuer-secondary" onClick={cancel}>取消修改</button></> : <button type="button" className="issuer-secondary" onClick={() => { setEditing(true); setError(''); }}>编辑展示信息</button>)}<button type="button" className="issuer-secondary" onClick={reload}>重新加载</button><a className="issuer-secondary" href={baseHref}>查看企业资料</a></div></>}
    </section>
    <section className="issuer-card portal-section" aria-labelledby="portal-legal-title"><div className="portal-section-head"><div><h2 id="portal-legal-title">法律链接与披露来源</h2><p>仅引用原业务资料；文件存在不代表已获准对外披露。</p></div><span className="asset-pill">来源待核验</span></div><div className="portal-table-wrap"><table><thead><tr><th>资料</th><th>版本与来源</th><th>适用范围</th><th>核验状态</th><th>原始资料</th></tr></thead><tbody><tr><td>机构主体资料</td><td>{kyb.versions.length ? `KYB V${kyb.versions.at(-1)?.number}` : '企业认证资料'}</td><td>当前企业；对外适用性待核实</td><td>{kyb.status === 'passed' ? '内部认证通过，披露待核实' : '待核实'}</td><td><a href={baseHref}>企业资料</a></td></tr><tr><td>门户服务条款与隐私政策</td><td>权威法律来源未连接</td><td>法域与受众待核实</td><td>缺失</td><td>来源页面待接入</td></tr>{portfolio.offerings.map(item => { const fields = latestPortfolio(item).fields; const docs = item.documents.filter(doc => !doc.removed && (doc.kind === 'subscription' || doc.kind === 'risk')); return <tr key={item.id}><td>{fields.name || item.number} · 发行披露</td><td>{docs.length ? docs.map(doc => `${doc.kind === 'risk' ? '风险披露' : '认购协议'} V${doc.version}`).join('、') : '未关联文件'}</td><td>仅此 Offering；公开适用性待核实</td><td>{docs.some(doc => doc.status !== 'passed') || docs.length < 2 ? '缺项或待检查' : '内部文件已检查，披露待核实'}</td><td><a href={href(`/issuer/offerings/${item.id}/edit`, query)}>发行方案</a></td></tr>; })}</tbody></table></div></section>
    <section className="issuer-card portal-section" aria-labelledby="portal-offerings-title"><div className="portal-section-head"><div><h2 id="portal-offerings-title">Offering 展示范围</h2><p>状态直接引用本企业发行记录；此处不能修改发行条款。</p></div><span className="asset-pill">{rows.length} 项</span></div>{rows.length ? <div className="portal-table-wrap"><table><thead><tr><th>Offering</th><th>关联版本</th><th>发行状态</th><th>认购窗口</th><th>披露</th><th>门户展示</th><th>操作</th></tr></thead><tbody>{rows.map(row => { const visibility = portalOfferingVisibility(row); return <tr key={row.id}><td><strong>{row.name || row.number}</strong><small>{row.number} · {row.source}</small></td><td>{row.assetName}<small>Asset V{row.assetVersion} · Instrument V{row.instrumentVersion}</small></td><td>{row.stage}</td><td>{row.startsAt && row.endsAt ? `${row.startsAt} ～ ${row.endsAt}` : '待配置'}<small>{row.timezone}</small></td><td>{row.disclosure}</td><td><strong>{visibility.label}</strong><small>{visibility.reason}</small></td><td><a href={href(`/issuer/offerings/${row.id}`, query)}>内部查看</a></td></tr>; })}</tbody></table></div> : <div className="pv-empty">当前企业尚无可展示的发行方案。<a href={href('/issuer/assets', query)}>前往资产与发行</a></div>}</section>
    <section className="issuer-card portal-section" aria-labelledby="portal-preview-title"><div className="portal-section-head"><div><h2 id="portal-preview-title">标准模板与门户预览</h2><p>固定展示机构信息、获授权的 Offering、详情及法律披露。</p></div><div className="c08-actions"><button type="button" className="issuer-secondary" onClick={() => setPreview(free ? 'saved' : 'current')}>预览当前内容</button>{!free && portal.draft && <button type="button" className="issuer-secondary" onClick={() => setPreview('saved')}>预览已保存草稿</button>}</div></div><details><summary>查看标准模板组成与数据来源</summary><ul className="portal-composition"><li>机构信息与 Logo：企业资料、门户基础草稿</li><li>Offering 列表、详情与法律披露：发行方案和文件原始资料</li><li>投资者登录与统一 KYC：平台统一身份服务</li><li>认购订单、付款状态、本人持仓、Token、收益及通知：各自权威模块</li></ul><p>本页只预览结构，不发起投资者登录、KYC、认购或付款。</p></details>{preview !== 'none' && <div className="portal-preview"><div className="portal-preview-banner">{free ? 'Sandbox 模拟 · 不是真实投资产品' : '内部预览 · 尚未正式生效 · 不可分享'}</div><div className="portal-preview-head">{viewLogo ? <img src={viewLogo.dataUrl} alt="机构 Logo" /> : <span className="portal-preview-mark">W</span>}<div><strong>{viewName}</strong><p>{approvedIntro || '机构简介以企业批准资料为准。'}</p></div></div><h3>发行方案</h3>{rows.length ? <div className="portal-preview-offerings">{rows.map(row => <article key={row.id}><strong>{row.name}</strong><small>{row.number} · {portalOfferingVisibility(row).label}</small><p>{portalOfferingVisibility(row).reason}</p><a href={href(`/issuer/offerings/${row.id}`, query)}>查看发行详情与披露</a></article>)}</div> : <p className="pv-empty">当前无可展示的发行方案。</p>}<div className="portal-preview-footer">投资者登录 · 平台统一 KYC · 认购与付款 · 本人持仓与收益：仅展示标准结构，当前不可操作。</div><button type="button" className="issuer-secondary" onClick={() => setPreview('none')}>关闭预览</button></div>}</section>
    <section className="issuer-card portal-section" aria-labelledby="portal-publish-title"><div className="portal-section-head"><div><h2 id="portal-publish-title">发布状态与历史记录</h2><p>门户状态与 Offering 发布状态独立；暂停门户不会改变已成立业务义务。</p></div><span className="asset-pill">真实状态：未创建</span></div><div className="portal-publish-layout"><div><h3>发布前检查</h3><ul className="pv-checks">{blockers.map(item => <li key={item}>{item}</li>)}</ul><button type="button" className="issuer-secondary" onClick={() => { refresh(); setCheckedAt(Date.now()); setNotice('已重新读取本地资料；真实服务、法律及生产准入仍待权威核验。'); }}>查看发布前检查</button>{checkedAt > 0 && <p className="asset-hint">本地资料最近读取：{when(checkedAt)}；不作为真实核验时间。</p>}</div><div><h3>对外操作</h3><p className="asset-hint">当前没有可核验的生产门户实例、法律披露与服务授权。真实发布、暂停和恢复不可用。</p>{!free && <><div className="c08-actions"><button type="button" className="issuer-action" disabled title="须先完成真实服务、法律和生产准入">发布标准门户</button><button type="button" className="issuer-secondary" disabled title="当前不存在已发布的真实门户">暂停门户</button><button type="button" className="issuer-secondary" disabled title="当前不存在已暂停的真实门户">恢复门户</button></div><details className="portal-flow"><summary>内部操作流程预览</summary><p>以下操作只改变当前企业的本地流程预览状态，不创建门户实例或公网地址。</p><p>内部流程：<strong>{flowLabel[portal.previewState]}</strong>；真实门户：<strong>未创建</strong>。</p><div className="c08-actions">{portal.previewState === 'idle' && <button type="button" className="issuer-secondary" disabled={!portal.draft} onClick={() => setConfirm('publish')}>预览发布确认</button>}{portal.previewState === 'published' && <button type="button" className="issuer-secondary" onClick={() => setConfirm('pause')}>预览暂停确认</button>}{portal.previewState === 'paused' && <button type="button" className="issuer-secondary" onClick={() => setConfirm('resume')}>预览恢复确认</button>}{portal.intent?.status === 'processing' && <><button type="button" className="issuer-secondary" onClick={() => settleFlow('success')}>完成内部流程</button><button type="button" className="issuer-secondary" onClick={() => settleFlow('failed')}>记录失败</button><button type="button" className="issuer-secondary" onClick={() => settleFlow('unknown')}>结果待确认</button></>}{portal.intent && <button type="button" className="issuer-secondary" onClick={() => setNotice(inspectPreviewIntent(tenant).message)}>查询原操作</button>}</div>{!portal.draft && <p className="asset-hint">先保存基础展示草稿，才能预览操作确认。</p>}</details></>}</div></div>{confirm && <div className="portal-confirm" role="alertdialog" aria-label="确认内部流程预览"><strong>确认预览{actionLabel[confirm]}后的界面状态？</strong><p>{confirm === 'pause' ? '暂停只限制新的公开访问；既有订单、投资者权利与存续义务不受此本地预览影响。' : confirm === 'resume' ? '恢复前应重新核验企业、法律文件、Offering 与服务状态。' : '门户发布不代表每个 Offering 均可见或可认购。'}本操作不连接真实服务。</p><div className="c08-actions"><button type="button" className="issuer-action" onClick={() => beginFlow(confirm)}>确认内部预览</button><button type="button" className="issuer-secondary" onClick={() => setConfirm(null)}>取消</button></div></div>}{portal.events.length > 0 && <details className="portal-history"><summary>查看操作历史（{portal.events.length}）</summary><ol>{portal.events.map((event, index) => <li key={`${event.at}-${index}`}>{when(event.at)} · {event.action} · {event.result} · {event.source} · {event.actor}</li>)}</ol></details>}{error && <div className="asset-errors" role="alert">{error}</div>}{notice && <p className="issuer-feedback" role="status">{notice}</p>}</section>
  </div>;
}
