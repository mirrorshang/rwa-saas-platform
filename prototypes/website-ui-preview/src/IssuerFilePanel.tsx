import { useState, type FormEvent } from 'react';
import type { DemoTenant } from './issuerDemo';
import { addFile, addFileVersion, canEditFiles, getFilePayload, linkFile, listFiles, refsFor, type FileOwner } from './issuerFiles';

type Props = { tenant: DemoTenant; owner: FileOwner; ownerId: string };
export function IssuerFilePanel({ tenant, owner, ownerId }: Props) {
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState('');
  const [feedback, setFeedback] = useState('');
  const references = refsFor(tenant, owner, ownerId);
  const data = listFiles(tenant);
  const files = data?.records || [];
  const update = () => setRefresh(value => value + 1);
  const receive = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) { setFeedback('请选择文件。'); return; }
    const result = addFile(tenant, owner, ownerId, selected, category.trim(), note.trim());
    setFeedback(result.message); if (result.ok) { setSelected(null); update(); }
  };
  const open = (id: string, version: number, download: boolean) => {
    const file = getFilePayload(tenant, id, version);
    if (!file) { setFeedback('当前无法打开该文件版本。请重新提供文件后再试。'); return; }
    if (!download && !/^(image\/(png|jpeg|gif|webp)|application\/pdf|text\/plain)$/.test(file.type)) { setFeedback('此文件类型不支持在线预览，请下载后查看。'); return; }
    const url = URL.createObjectURL(file); const anchor = document.createElement('a');
    anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
    if (download) anchor.download = file.name;
    anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };
  return <section className="issuer-card issuance-files" data-refresh={refresh}>
    <h2>文件与材料</h2><p className="issuance-muted">同一原文件可关联多个业务对象；每个关联固定文件版本。当前文件仅供本地预览，刷新后可能需要重新提供。上传接收不代表安全扫描、内部复核、专业法律意见或签署已完成。</p>
    {!data && <p role="alert">当前没有文件访问权限。</p>}
    {references.length ? <ul className="issuance-file-list">{references.map(({ ref, file }) => { const version = file.versions.find(item => item.number === ref.version)!; return <li key={ref.id}><strong>{version.name}</strong><span>版本 {version.number} · {ref.category || '未分类'} · 已接收</span><small>{ref.note || '无附注'}</small><small>安全扫描：待接入 · 内部复核：未完成 · 专业法律意见：未确认 · 补件原因：暂无</small><small>关联对象：{data?.refs.filter(item => item.fileId === file.id).map(item => `${({ asset: '资产', instrument: '权益结构', project: '发行项目', offering: '发行方案' } as const)[item.owner]} · 版本 ${item.version}`).join('；') || '当前对象'}</small><details><summary>文件版本历史</summary><ol>{file.versions.map(item => <li key={item.number}>版本 {item.number} · {item.name} · {new Date(item.addedAt).toLocaleString('zh-CN')} · 已接收</li>)}</ol></details><div><button type="button" className="issuer-secondary" onClick={() => open(file.id, version.number, false)}>预览</button><button type="button" className="issuer-secondary" onClick={() => open(file.id, version.number, true)}>下载</button></div></li>; })}</ul> : <p>暂无已关联文件。</p>}
    {canEditFiles(tenant) && <><form className="issuance-file-form" onSubmit={receive}><label>文件用途<input value={category} onChange={event => setCategory(event.target.value)} placeholder="例如权属材料或方案说明" /></label><label>文件<input type="file" onChange={event => setSelected(event.target.files?.[0] || null)} /></label><label>关联说明<input value={note} onChange={event => setNote(event.target.value)} /></label><button className="issuer-action" type="submit">接收并关联文件</button></form>
      {files.length > 0 && <div className="issuance-file-form"><label>复用已有文件版本<select value={existing} onChange={event => setExisting(event.target.value)}><option value="">请选择</option>{files.flatMap(file => file.versions.map(version => <option key={`${file.id}/${version.number}`} value={`${file.id}/${version.number}`}>{version.name} · 版本 {version.number}</option>))}</select></label><button type="button" className="issuer-secondary" onClick={() => { const [id, raw] = existing.split('/'); setFeedback(linkFile(tenant, owner, ownerId, id, Number(raw), category.trim(), note.trim()) ? '文件版本已关联。' : '关联失败，请核对企业与文件权限。'); update(); }}>关联所选版本</button></div>}
      {files.length > 0 && <div className="issuance-file-form"><label>上传已有文件的新版本<select id={`file-version-${owner}-${ownerId}`} defaultValue=""><option value="">请选择</option>{files.map(file => <option key={file.id} value={file.id}>{file.versions.at(-1)?.name}</option>)}</select></label><label>新版本文件<input type="file" id={`new-file-${owner}-${ownerId}`} /></label><button type="button" className="issuer-secondary" onClick={() => { const id = (document.getElementById(`file-version-${owner}-${ownerId}`) as HTMLSelectElement).value; const file = (document.getElementById(`new-file-${owner}-${ownerId}`) as HTMLInputElement).files?.[0]; setFeedback(file && addFileVersion(tenant, id, file) ? '新版本已接收；既有对象仍引用原版本。' : '新版本接收失败。'); update(); }}>新增文件版本</button></div>}</>}
    {feedback && <p className="issuer-feedback" role="status">{feedback}</p>}
  </section>;
}
