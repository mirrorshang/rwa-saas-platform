import { getDemoAuth, type DemoTenant } from './issuerDemo';
import { getKybCase, getKybDraft } from './issuerB04Demo';

export type KybState = 'draft' | 'submitted' | 'reviewing' | 'supplement' | 'rejected' | 'passed';
export type KybPerson = { id: string; name: string; method: 'direct' | 'indirect' | 'other'; share: string; explanation: string };
export type KybMaterial = { kind: string; fileName: string; mime: string; size: number; addedAt: number; version: number; status: 'ready' | 'failed' };
export type KybValue = {
  legalName: string; entityType: string; entityOther: string; country: string; registrationId: string; address: string; website: string;
  industry: string; industryOther: string; business: string; regulated: string; licenseStatus: string; licenseAuthority: string; licenseNumber: string;
  representativeName: string; representativeTitle: string; representativeAuthority: string;
  uboPath: string; people: KybPerson[]; noUboReason: string; seniorName: string; seniorTitle: string;
  contactName: string; contactEmail: string; contactPhone: string; materials: KybMaterial[];
  truthful: boolean; authorized: boolean;
};
export type KybVersion = { number: number; submittedAt: number; value: KybValue };
export type KybRecord = { value: KybValue; step: number; savedAt: number; status: KybState; versions: KybVersion[]; reviewNotes: string; reviewKind?: string };
export type KybError = { step: number; field: string; message: string };
const key = 'wdex-issuer-kyb-v03';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/[^\s.]+(?:\.[^\s.]+)+/i;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const person = (): KybPerson => ({ id: crypto.randomUUID(), name: '', method: 'direct', share: '', explanation: '' });
export function emptyKybValue(tenant: DemoTenant): KybValue {
  return { legalName: tenant.name, entityType: '', entityOther: '', country: tenant.country, registrationId: '', address: '', website: '',
    industry: '', industryOther: '', business: '', regulated: '', licenseStatus: '', licenseAuthority: '', licenseNumber: '',
    representativeName: '', representativeTitle: '', representativeAuthority: '', uboPath: '', people: [person()], noUboReason: '', seniorName: '', seniorTitle: '',
    contactName: '', contactEmail: getDemoAuth()?.email || tenant.contactEmail, contactPhone: '', materials: [], truthful: false, authorized: false };
}
function migrateOld(tenant: DemoTenant): KybRecord | null {
  const old = getKybDraft(tenant);
  const oldCase = getKybCase(tenant);
  if (!old.savedAt && !oldCase) return null;
  const convert = (source: typeof old.value, materials: typeof old.materials): KybValue => ({
    ...emptyKybValue(tenant), legalName: source.legalName || tenant.name, entityType: source.entityType.includes('公司') ? '有限责任公司' : '', country: source.country || tenant.country,
    registrationId: source.registrationId, address: source.address, contactEmail: source.contactEmail || tenant.contactEmail,
    representativeName: source.representative, representativeAuthority: source.authority ? 'special' : '',
    people: source.beneficialControl ? [{ ...person(), name: source.beneficialControl }] : [person()],
    materials: materials.filter(item => item.status === '模拟已上传').map(item => ({ kind: item.name.includes('登记') ? 'registration' : 'other', fileName: item.name, mime: 'application/pdf', size: 0, addedAt: old.savedAt || Date.now(), version: item.version, status: 'ready' as const })),
  });
  const versions = oldCase?.versions.map(item => ({ number: item.number, submittedAt: item.submittedAt, value: convert(item.draft, item.materials) })) || [];
  return { value: convert(old.value, old.materials), step: 0, savedAt: old.savedAt, status: oldCase?.status === 'reviewing' ? 'reviewing' : oldCase?.status === 'supplement' ? 'supplement' : oldCase?.status === 'rejected' ? 'rejected' : oldCase ? 'submitted' : 'draft', versions, reviewNotes: '' };
}
export function getKybRecord(tenant: DemoTenant): KybRecord {
  const auth = getDemoAuth();
  if (auth) try {
    const data = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, { email: string; record: KybRecord }>;
    const stored = data[tenant.id];
    if (stored?.email === auth.email && stored.record?.value) return stored.record;
  } catch { /* Keep the original data and offer a fresh form. */ }
  const migrated = migrateOld(tenant);
  if (migrated) { saveKybRecord(tenant, migrated); return migrated; }
  return { value: emptyKybValue(tenant), step: 0, savedAt: 0, status: 'draft', versions: [], reviewNotes: '' };
}
export function saveKybRecord(tenant: DemoTenant, record: KybRecord): boolean {
  const auth = getDemoAuth();
  if (!auth) return false;
  let data: Record<string, { email: string; record: KybRecord }> = {};
  try { data = JSON.parse(localStorage.getItem(key) || '{}') as typeof data; } catch { /* Preserve no malformed data. */ }
  data[tenant.id] = { email: auth.email, record: clone(record) };
  localStorage.setItem(key, JSON.stringify(data));
  return true;
}
export function exampleKybValue(tenant: DemoTenant): KybValue {
  return { ...emptyKybValue(tenant), legalName: tenant.name, entityType: '有限责任公司', country: tenant.country || 'HK', registrationId: '77889901', address: '香港中环皇后大道中 18 号 12 楼', website: 'https://example.com',
    industry: '金融与投资管理', business: '从事资产管理及相关企业服务。', regulated: 'no',
    representativeName: '林致远', representativeTitle: '董事', representativeAuthority: 'registry', uboPath: 'share',
    people: [{ ...person(), name: '林致远', method: 'direct', share: '75' }], contactName: '陈晓', contactEmail: getDemoAuth()?.email || tenant.contactEmail, contactPhone: '',
    materials: [{ kind: 'registration', fileName: '企业注册证明.pdf', mime: 'application/pdf', size: 245760, addedAt: Date.now(), version: 1, status: 'ready' }],
    truthful: false, authorized: false };
}
export function validateKyb(value: KybValue): KybError[] {
  const errors: KybError[] = [];
  const requireText = (step: number, field: keyof KybValue, message: string) => { if (!String(value[field] || '').trim()) errors.push({ step, field, message }); };
  requireText(0, 'legalName', '请填写企业法定名称。'); requireText(0, 'entityType', '请选择企业类型。');
  if (value.entityType === '其他') requireText(0, 'entityOther', '请说明企业类型。');
  requireText(0, 'country', '请选择注册国家或地区。'); requireText(0, 'registrationId', '请填写企业注册编号。'); requireText(0, 'address', '请填写注册地址。');
  if (value.website.trim() && !urlPattern.test(value.website.trim())) errors.push({ step: 0, field: 'website', message: '请输入以 http:// 或 https:// 开头的有效网址。' });
  requireText(1, 'industry', '请选择所属行业。'); if (value.industry === '其他') requireText(1, 'industryOther', '请说明所属行业。');
  requireText(1, 'business', '请填写主营业务简介。'); requireText(1, 'regulated', '请选择金融业务情况。');
  if (value.regulated === 'yes') { requireText(1, 'licenseStatus', '请选择监管许可情况。'); if (value.licenseStatus === 'licensed') { requireText(1, 'licenseAuthority', '请填写监管机构。'); requireText(1, 'licenseNumber', '请填写许可证编号。'); } }
  requireText(2, 'representativeName', '请填写授权代表姓名。'); requireText(2, 'representativeTitle', '请填写授权代表职务。'); requireText(2, 'representativeAuthority', '请选择授权依据。');
  requireText(2, 'uboPath', '请选择实际控制人识别方式。');
  if (value.uboPath === 'none') { requireText(2, 'noUboReason', '请说明无法识别的原因。'); requireText(2, 'seniorName', '请填写高级管理人员姓名。'); requireText(2, 'seniorTitle', '请填写高级管理人员职务。'); }
  if (value.uboPath === 'share' || value.uboPath === 'other') {
    if (!value.people.length) errors.push({ step: 2, field: 'people', message: '请至少填写一位相关自然人。' });
    value.people.forEach((item, index) => { if (!item.name.trim()) errors.push({ step: 2, field: `person-${index}-name`, message: `请填写第 ${index + 1} 位自然人姓名。` });
      if (value.uboPath === 'share' && (!Number.isFinite(Number(item.share)) || Number(item.share) <= 0 || Number(item.share) > 100)) errors.push({ step: 2, field: `person-${index}-share`, message: `第 ${index + 1} 位持股比例须大于 0 且不超过 100%。` });
      if (value.uboPath === 'other' && !item.explanation.trim()) errors.push({ step: 2, field: `person-${index}-explanation`, message: `请说明第 ${index + 1} 位自然人的控制关系。` }); });
  }
  requireText(2, 'contactName', '请填写业务联系人姓名。'); requireText(2, 'contactEmail', '请填写业务联系人邮箱。');
  if (value.contactEmail.trim() && !emailPattern.test(value.contactEmail.trim())) errors.push({ step: 2, field: 'contactEmail', message: '请输入有效的业务联系人邮箱。' });
  if (!value.materials.some(item => item.kind === 'registration' && item.status === 'ready')) errors.push({ step: 3, field: 'registration', message: '请提供企业注册证明或营业执照。' });
  if (value.licenseStatus === 'licensed' && !value.materials.some(item => item.kind === 'license' && item.status === 'ready')) errors.push({ step: 3, field: 'license', message: '请提供行业许可证明。' });
  if (!value.truthful) errors.push({ step: 4, field: 'truthful', message: '请确认资料真实性。' });
  if (!value.authorized) errors.push({ step: 4, field: 'authorized', message: '请确认企业提交授权。' });
  return errors;
}
export function validateKybRecord(record: KybRecord): KybError[] {
  const errors = validateKyb(record.value);
  if (['supplement', 'rejected'].includes(record.status) && record.reviewKind) {
    const before = record.versions.at(-1)?.value.materials.find(item => item.kind === record.reviewKind);
    const after = record.value.materials.find(item => item.kind === record.reviewKind && item.status === 'ready');
    if (!after || after.version <= (before?.version || 0)) errors.push({ step: 3, field: record.reviewKind, message: '请按审核意见补充或替换这份文件。' });
  }
  return errors;
}
export function submitKyb(tenant: DemoTenant, record: KybRecord): KybRecord | null {
  if (validateKybRecord(record).length || !['draft', 'supplement', 'rejected'].includes(record.status)) return null;
  const version = { number: record.versions.length + 1, submittedAt: Date.now(), value: clone(record.value) };
  const next = { ...record, status: record.versions.length ? 'reviewing' as const : 'submitted' as const, versions: [...record.versions, version], reviewNotes: '', reviewKind: undefined };
  return saveKybRecord(tenant, next) ? next : null;
}
export function setKybReview(tenant: DemoTenant, status: Exclude<KybState, 'draft' | 'submitted'>, reviewNotes = ''): boolean {
  const record = getKybRecord(tenant);
  if (!record.versions.length) return false;
  const materialRequested = /补充|替换|上传|提供/.test(reviewNotes) && /证明|执照|文件|许可证/.test(reviewNotes);
  const reviewKind = !materialRequested ? undefined : reviewNotes.includes('许可') ? 'license' : reviewNotes.includes('授权') ? 'authority' : reviewNotes.includes('股权') || reviewNotes.includes('控制') ? 'control' : reviewNotes.includes('注册') || reviewNotes.includes('营业执照') ? 'registration' : undefined;
  return saveKybRecord(tenant, { ...record, status, reviewNotes, reviewKind,
    value: status === 'supplement' || status === 'rejected' ? { ...record.value, truthful: false, authorized: false } : record.value });
}
