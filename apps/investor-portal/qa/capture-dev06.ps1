param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
$setup = Join-Path $dist 'dev06-qa-setup.html'
$profile = Join-Path $env:TEMP 'codex-dev06-chrome'
if (!(Test-Path -LiteralPath $dist)) { throw 'Build dist before capture.' }
if (Test-Path -LiteralPath $setup) { throw 'Temporary QA setup already exists; refusing to overwrite it.' }
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$html = @'
<!doctype html><meta charset="utf-8"><script>
const route=new URLSearchParams(location.search).get('route')||'/m/investments?tab=holdings';
const base='/m',email='dev06.qa@example.test',now='2026-11-26T08:00:00.000Z';
const account={id:base+':'+email,email,createdAt:now,kyc:'approved',mpc:'ready',mpcOperationId:'mock-qa-op',mpcAddress:'Mock MPC · 0xA1…E4',ownVerified:false,defaultWallet:'mpc',walletVersion:1};
const order=(id,offeringId,issuerId,units)=>({id,requestId:id,accountId:account.id,channelPath:base,issuerId,offeringId,units,priceCents:10000,amountCents:units*10000,createdAt:now,updatedAt:now,expiresAt:now,documents:[{name:'认购协议',version:'Mock v1.0'},{name:'权益条款',version:'Mock v1.0'},{name:'风险披露',version:'Mock v1.0'}],mockConfirmedAt:now,legalSignatureValid:false,payment:'matched',paymentWallet:'Mock MPC · 0xA1…E4',tokenReceiver:'Mock MPC · 0xA1…E4',paymentReference:'Mock-TX-'+id,allocation:'confirmed',allocatedAt:now,registration:'confirmed',registeredAt:now,registrationEvidence:'Mock-REG-'+id,delivery:'confirmed',deliveredAt:now,deliveryReference:'Mock-DEL-'+id});
const residence=order('mock-dev06-residence','residence-01','harbor',10),debt=order('mock-dev06-debt','debt-01','cedar',20);
const distribution=(id,source,kind,amount,state,method)=>({id,accountId:account.id,channelPath:base,orderId:source.id,offeringId:source.offeringId,issuerId:source.issuerId,kind,state,method,period:'2026 Q4 · Mock',recordDate:'2026-11-26',dueDate:'2026-12-15',actualAt:state==='paid'?now:undefined,grossCents:amount,deductionsCents:0,legalBasis:'仅 Mock 演示；决议、合同及实际可分配金额须另行核实',createdAt:now,updatedAt:now,transactionReference:state==='paid'?'Mock-PAY-'+id:undefined});
const events=[distribution('mock-dev06-participation',residence,'participation',1200,'claimable','claim'),distribution('mock-dev06-interest',debt,'interest',850,'paid','push'),distribution('mock-dev06-principal',debt,'principal',5000,'paid','external')];
localStorage.setItem('rwa-mock-account:'+encodeURIComponent(base)+':'+encodeURIComponent(email),JSON.stringify(account));
for(const item of [residence,debt]) localStorage.setItem('rwa-mock-order:'+encodeURIComponent(item.id),JSON.stringify(item));
for(const item of events) localStorage.setItem('rwa-mock-distribution:'+encodeURIComponent(item.id),JSON.stringify(item));
sessionStorage.setItem('rwa-mock-active:'+encodeURIComponent(base),email);
location.replace(route);
</script>
'@
[System.IO.File]::WriteAllText($setup, $html, [System.Text.UTF8Encoding]::new($false))
try {
  $pages = @(
    @('holdings', '/m/investments?tab=holdings', 1250),
    @('holding-detail', '/m/investments/holdings/mock-dev06-residence', 1700),
    @('returns', '/m/investments?tab=returns', 1500),
    @('distribution-detail', '/m/investments/returns/mock-dev06-participation', 1450),
    @('messages', '/m/messages', 1350),
    @('disclosures', '/m/disclosures', 1450)
  )
  foreach ($page in $pages) {
    $name, $route, $height = $page
    $target = Join-Path $screenshots "dev06-$name.png"
    $pageUrl = "$BaseUrl/dev06-qa-setup.html?route=$([uri]::EscapeDataString($route))"
    & $Chrome '--headless=new' '--incognito' '--disable-gpu' '--hide-scrollbars' '--no-first-run' '--no-default-browser-check' '--virtual-time-budget=5000' "--window-size=1440,$height" "--user-data-dir=$profile" "--screenshot=$target" $pageUrl 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $target)) { throw "Chrome capture failed: $name" }
    $image = [System.Drawing.Image]::FromFile($target)
    try {
      if ($image.Width -ne 1440 -or $image.Height -ne $height) { throw "Wrong screenshot size: $name $($image.Width)x$($image.Height)" }
      Write-Output "$name $($image.Width)x$($image.Height)"
    } finally { $image.Dispose() }
  }
} finally {
  Remove-Item -LiteralPath $setup -Force -ErrorAction SilentlyContinue
}
