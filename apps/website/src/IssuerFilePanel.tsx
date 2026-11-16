import { useState, type FormEvent } from 'react';
import type { DemoTenant } from './issuerDemo';
import { addFile, addFileVersion, canEditOwnerFiles, defaultVisibility, effectiveVisibility, getFilePayload, linkFile, listFiles, refsFor, refreshFileScan, type FileOwner, type FileVisibility } from './issuerFiles';

type Props = { tenant: DemoTenant; owner: FileOwner; ownerId: string };
export function IssuerFilePanel({ tenant, owner, ownerId }: Props) {
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [effectiveAt, setEffectiveAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [language, setLanguage] = useState('');
  const [visibility, setVisibility] = useState<FileVisibility | ''>('');
  const [existing, setExisting] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const references = refsFor(tenant, owner, ownerId);
  const data = listFiles(tenant);
  const files = data?.records || [];
  const update = () => setRefresh(value => value + 1);
  const receive = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!selected) { setFeedback('请选择文件。'); return; }
    if (!category.trim()) { setFeedback('请先选择文件分类。'); return; }
    if (category === '其他支持文件' && !visibility) { setFeedback('其他支持文件请明确选择申请可见范围。'); return; }
    setBusy(true);
    try {
      const result = await addFile(tenant, owner, ownerId, selected, category.trim(), note.trim(), { issuer: issuer.trim(), issuedAt, effectiveAt, expiresAt, language: language.trim(), visibility: visibility || defaultVisibility(category) });
      setFeedback(result.message); if (result.ok) { setSelected(null); update(); }
    } finally { setBusy(false); }
  };
  const open = async (id: string, version: number, download: boolean) => {
    const file = await getFilePayload(tenant, id, version);
    if (!file) { setFeedback('当前无法打开该文件版本。请重新提供文件后再试。'); return; }
    if (!download && !/^(image\/(png|jpeg|gif|webp)|application\/pdf|text\/plain)$/.test(file.type)) { setFeedback('此文件类型不支持在线预览，请下载后查看。'); return; }
    const url = URL.createObjectURL(file); const anchor = document.createElement('a');
    anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    if (download) anchor.download = file.name;
    anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  return <section id={`files-${owner}-${ownerId}`} className="issuer-card issuance-files" data-refresh={refresh}>
    <h2>文件与材料</h2><p className="issuance-muted">同一原文件可关联多个业务对象；每个关联固定文件版本。文件保存在当前浏览器，退出账号时清除。上传接收不代表安全扫描、内部复核、专业法律意见或签署已完成。</p>
    {!data && <p role="alert">当前没有文件访问权限。</p>}
    {references.length ? <ul className="issuance-file-list">{references.map(({ ref, file }) => { const version = file.versions.find(item => item.number === ref.version)!; return <li key={ref.id}><div className="c08-file-row"><div><strong>{version.name}</strong><span>版本 {version.number} · {ref.category || '未分类'} · Sandbox扫描：{version.scan === "passed" ? "模拟通过" : version.scan === "failed" ? "失败／隔离" : version.scan === "unknown" ? "无法确认" : "待扫描"} · 当前有效范围：{effectiveVisibility(ref, version) === 'internal' ? '企业内部可见' : effectiveVisibility(ref, version) === 'public' ? '公开可见' : '合格投资者可见'}</span></div><div><button type="button" className="issuer-secondary" disabled={version.scan !== "passed"} onClick={() => open(file.id, version.number, false)}>预览</button><button type="button" className="issuer-secondary" disabled={version.scan !== "passed"} onClick={() => open(file.id, version.number, true)}>下载</button>{canEditOwnerFiles(tenant, owner, ownerId) && <button type="button" className="issuer-secondary" onClick={() => { if (refreshFileScan(tenant, file.id, version.number)) { setFeedback('Sandbox模拟扫描状态已更新，请核对资产就绪条件。'); update(); } }}>重新检查扫描状态</button>}</div></div><details className="c08-file-detail"><summary>查看文件信息与版本</summary><small>出具主体：{ref.issuer || '待补充'} · 出具日期：{ref.issuedAt || '待补充'} · 生效日期：{ref.effectiveAt || '待补充'} · 到期日期：{ref.expiresAt || '不适用／待补充'} · 语言：{ref.language || '待补充'}</small><small>申请可见范围：{({ public: '公开可见', eligible: '合格投资者可见', internal: '企业内部可见' } as const)[ref.visibility || defaultVisibility(ref.category)]} · 当前有效范围：{effectiveVisibility(ref, version) === 'internal' ? '企业内部可见' : effectiveVisibility(ref, version) === 'public' ? '公开可见' : '合格投资者可见'}</small><small>{ref.note || '无附注'}</small><small>安全扫描：{version.scan === 'failed' ? '未通过' : version.scan === 'passed' ? '模拟通过' : version.scan === 'unknown' ? '无法确认' : '待扫描'}。专业法律意见未确认。</small><small>关联对象：{data?.refs.filter(item => item.fileId === file.id).map(item => `${({ asset: '资产', instrument: '权益结构', project: '发行项目', offering: '发行方案' } as const)[item.owner]} · 版本 ${item.version}`).join('；') || '当前对象'}</small><ol>{file.versions.map(item => <li key={item.number}>版本 {item.number} · {item.name} · {new Date(item.addedAt).toLocaleString('zh-CN')} · Sandbox扫描{item.scan === 'passed' ? '模拟通过' : item.scan === 'failed' ? '失败／隔离' : item.scan === 'unknown' ? '无法确认' : '待扫描'} <button type="button" className="issuer-secondary" disabled={item.scan !== 'passed'} onClick={() => open(file.id, item.number, false)}>预览此版本</button></li>)}</ol></details></li>; })}</ul> : <p>暂无已关联文件。</p>}
    {canEditOwnerFiles(tenant, owner, ownerId) && <><form className="issuance-file-form c08-file-upload" onSubmit={receive}><div className="c08-file-primary"><label>文件分类{owner === 'asset' || owner === 'instrument' ? <select value={category} required onChange={event => { setCategory(event.target.value); setVisibility(event.target.value === '其他支持文件' ? '' : defaultVisibility(event.target.value)); }}><option value="">请选择</option>{(owner === 'asset' ? ['封面照片','其他资产照片','权属证明','估值报告','物业平面图','运营情况汇总','内部运营资料','其他支持文件'] : ['权益协议','债权协议','股权法律文件','其他支持文件']).map(item => <option key={item}>{item}</option>)}</select> : <input value={category} required onChange={event => setCategory(event.target.value)} placeholder="文件用途" />}</label><label>选择文件<input key={refresh} type="file" onChange={event => setSelected(event.target.files?.[0] || null)} /></label><button className="issuer-action" type="submit" disabled={busy}>{busy ? '正在保存文件…' : '上传并关联文件'}</button></div><details className="c08-file-advanced"><summary>补充出具信息与申请可见范围（其他支持文件必选）</summary><div className="c08-file-metadata"><label>出具主体<input value={issuer} onChange={event => setIssuer(event.target.value)} placeholder="填写文件出具主体" /></label><label>出具日期<input type="date" value={issuedAt} onChange={event => setIssuedAt(event.target.value)} /></label><label>生效日期<input type="date" value={effectiveAt} onChange={event => setEffectiveAt(event.target.value)} /></label><label>到期日期（如适用）<input type="date" value={expiresAt} onChange={event => setExpiresAt(event.target.value)} /></label><label>文件语言<input value={language} onChange={event => setLanguage(event.target.value)} placeholder="如中文、英文" /></label><label>申请可见范围<select value={visibility || (category === '其他支持文件' ? '' : defaultVisibility(category))} onChange={event => setVisibility(event.target.value as FileVisibility)}><option value="" disabled>请选择可见范围</option><option value="public">公开可见</option><option value="eligible">合格投资者可见</option><option value="internal">企业内部可见</option></select></label><label>关联说明<input value={note} onChange={event => setNote(event.target.value)} placeholder="简述文件用途（可选）" /></label></div><p>当前文件仍仅企业内部可见。申请范围不会使文件自动对投资者开放。</p></details></form>
      {files.length > 0 && <details className="c08-file-advanced"><summary>复用已有文件版本</summary><div className="issuance-file-form"><label>复用已有文件版本<select value={existing} onChange={event => setExisting(event.target.value)}><option value="">请选择</option>{files.flatMap(file => file.versions.map(version => <option key={`${file.id}/${version.number}`} value={`${file.id}/${version.number}`}>{version.name} · 版本 {version.number}</option>))}</select></label><button type="button" className="issuer-secondary" onClick={() => { const [id, raw] = existing.split('/'); setFeedback(linkFile(tenant, owner, ownerId, id, Number(raw), category.trim(), note.trim()) ? '文件版本已关联。' : '关联失败，请核对企业与文件权限。'); update(); }}>关联所选版本</button></div></details>}
      {files.length > 0 && <details className="c08-file-advanced"><summary>替换已有文件版本</summary><div className="issuance-file-form"><label>替换已有文件<select id={`file-version-${owner}-${ownerId}`} defaultValue=""><option value="">请选择</option>{files.map(file => <option key={file.id} value={file.id}>{file.versions.at(-1)?.name}</option>)}</select></label><label>新版本文件<input type="file" id={`new-file-${owner}-${ownerId}`} /></label><button type="button" className="issuer-secondary" onClick={async () => { const id = (document.getElementById(`file-version-${owner}-${ownerId}`) as HTMLSelectElement).value; const file = (document.getElementById(`new-file-${owner}-${ownerId}`) as HTMLInputElement).files?.[0]; if (!file || !await addFileVersion(tenant, id, file)) { setFeedback('新版本接收失败。'); return; } const next = listFiles(tenant)?.records.find(item => item.id === id)?.versions.at(-1)?.number; const linked = next && linkFile(tenant, owner, ownerId, id, next, category.trim(), note.trim(), { issuer: issuer.trim(), issuedAt, effectiveAt, expiresAt, language: language.trim(), visibility: visibility || defaultVisibility(category) }); setFeedback(linked ? '新版本已关联当前对象；历史版本引用保留。' : '新版本已接收，但关联未完成。'); update(); }}>新增并关联版本</button></div></details>}</>}
    {feedback && <p className="issuer-feedback" role="status">{feedback}</p>}
  </section>;
}
