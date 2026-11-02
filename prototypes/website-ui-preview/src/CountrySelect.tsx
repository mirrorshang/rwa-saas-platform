import { useState } from 'react';
import { countryName, countryOptions } from './countries';

export function CountrySelect({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLocaleLowerCase('zh-Hans');
  const matches = term ? countryOptions.filter(item => item.name.toLocaleLowerCase('zh-Hans').includes(term) || item.code.toLowerCase().includes(term)) : countryOptions;
  const options = value && !matches.some(item => item.code === value)
    ? [{ code: value, name: countryName(value) }, ...matches]
    : matches;
  return <>
    <label htmlFor={`${id}-search`}>搜索国家或地区<input id={`${id}-search`} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="输入中文名称或两位代码" autoComplete="off" /></label>
    <label htmlFor={id}>注册国家或地区<select id={id} value={value} onChange={event => onChange(event.target.value)}><option value="">请选择</option>{options.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
    {term && <small className="country-search-count" role="status">{matches.length ? `找到 ${matches.length} 个国家或地区` : '没有匹配的国家或地区，请修改搜索词。'}</small>}
  </>;
}
