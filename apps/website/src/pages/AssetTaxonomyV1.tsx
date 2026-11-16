import { useState } from 'react';
import { assetCategories, assetType, type AssetSubtype } from '../assetTaxonomyV1';

export function AssetTaxonomy({ selected, onSelect, locked = false, readOnly = false }: { selected?: string; onSelect?: (id: AssetSubtype) => void; locked?: boolean; readOnly?: boolean }) {
  const initial = assetType(selected || '')?.categoryId || assetCategories[0].id;
  const [categoryId, setCategoryId] = useState<string>(initial);
  const category = assetCategories.find(item => item.id === categoryId) || assetCategories[0];
  return <div className="pv-taxonomy">
    <div className="pv-taxonomy-categories" role="tablist" aria-label="一级资产分类">{assetCategories.map(item => <button key={item.id} type="button" role="tab" aria-selected={category.id === item.id} className={category.id === item.id ? 'active' : ''} onClick={() => setCategoryId(item.id)}>{item.label}<small>{item.types.length} 类</small></button>)}</div>
    <div className="pv-kind-grid" role="tabpanel" aria-label={`${category.label}二级类型`}>{category.types.map(item => <button key={item.id} type="button" className={`pv-kind ${selected === item.id ? 'selected' : ''}`} disabled={!item.enabled || locked || readOnly || !onSelect} onClick={() => onSelect?.(item.id)}><strong>{item.label}</strong><span>{readOnly ? '历史目录只读' : item.enabled ? '可创建' : '暂未开放创建'}</span></button>)}</div>
    <p className="asset-hint">{readOnly ? '当前仅可浏览历史资产分类与既有资料。' : `${category.label}：${category.types.length} 个二级类型；${category.types.filter(item => item.enabled).length} 个可创建模板。未开放的类型可浏览目录，暂不能创建资产。`}</p>
  </div>;
}
