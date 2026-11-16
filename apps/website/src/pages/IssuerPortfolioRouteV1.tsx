import type { DemoTenant } from '../issuerDemo';
import { createOffering, latest, readPortfolio } from '../issuerPortfolioV1';
import { AssetList, AssetEditor } from './IssuerPortfolioV1';
import { IssuerCorporateAssetV1 } from './IssuerCorporateAssetV1';
import { AssetDetail } from './IssuerAssetDetailV1';
import { OfferingPage } from './IssuerOfferingV1';
import { IssuerAssetsR2 } from './IssuerAssetsR2';
import { IssuerInstrumentsR2 } from './IssuerInstrumentsR2';
import { IssuerIssuance } from './IssuerIssuance';

type Props = { tenant: DemoTenant; query: string; onDirtyChange: (dirty: boolean) => void; onRequestDiscard: (action: () => void) => void; onSavedNavigate: (url: string) => void };
export function IssuerPortfolioRouteV1(props: Props) {
  const path = location.pathname; const parts = path.split('/').filter(Boolean); const id = parts[2] || ''; const data = readPortfolio(props.tenant);
  if (parts[1] === 'assets') {
    if (!id) return <AssetList {...props} />;
    if (id === 'new') {
      const params = new URLSearchParams(location.search);
      const selected = params.get('type') || '';
      const draft = data.assets.find(item => item.id === params.get('draftId') && latest(item).fields.subtype === selected);
      if (selected === 'private_equity' || selected === 'corporate_loan') return <IssuerCorporateAssetV1 {...props} initial={draft} subtype={selected} />;
      return <AssetEditor {...props} />;
    }
    const asset = data.assets.find(item => item.id === id);
    if (!asset) return <IssuerAssetsR2 {...props} />;
    if (parts[3] === 'edit') {
      const selected = latest(asset).fields.subtype;
      if (selected === 'private_equity' || selected === 'corporate_loan') return <IssuerCorporateAssetV1 {...props} initial={asset} subtype={selected} />;
      return <AssetEditor {...props} initial={asset} />;
    }
    return <AssetDetail tenant={props.tenant} query={props.query} record={asset} onDirtyChange={props.onDirtyChange} />;
  }
  if (parts[1] === 'instruments') {
    const instrument = data.instruments.find(item => item.id === id);
    if (instrument) { const asset = data.assets.find(item => item.id === instrument.assetId); if (asset) { location.replace(`/issuer/assets/${asset.id}?${props.query}&tab=rights`); return <section className="issuer-card">正在打开权益结构…</section>; } }
    return <IssuerInstrumentsR2 {...props} />;
  }
  if (parts[1] === 'offerings') {
    if (id === 'new') {
      const assetId = new URLSearchParams(location.search).get('assetId') || '';
      try { const record = createOffering(props.tenant, assetId); location.replace(`/issuer/offerings/${record.id}/edit?${props.query}`); return <section className="issuer-card">正在创建发行方案…</section>; }
      catch (cause) { return <section className="issuer-card asset-state" role="alert"><h1>无法创建发行方案</h1><p>{cause instanceof Error ? cause.message : '请从资产详情的发行管理进入。'}</p><a href={`/issuer/assets?${props.query}`}>返回资产管理</a></section>; }
    }
    const record = data.offerings.find(item => item.id === id);
    if (record) return <OfferingPage tenant={props.tenant} query={props.query} record={record} edit={parts[3] === 'edit'} onDirtyChange={props.onDirtyChange} />;
    return <IssuerIssuance {...props} />;
  }
  return <IssuerIssuance {...props} />;
}
