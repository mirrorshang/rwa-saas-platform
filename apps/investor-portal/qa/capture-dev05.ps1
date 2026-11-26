param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
$setup = Join-Path $dist 'dev05-qa-setup.html'
$profile = Join-Path $env:TEMP 'codex-dev05-chrome'
if (!(Test-Path -LiteralPath $dist)) { throw 'Build dist before capture.' }
if (Test-Path -LiteralPath $setup) { throw 'Temporary QA setup already exists; refusing to overwrite it.' }
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$html = @'
<!doctype html><meta charset="utf-8"><script>
const q = new URLSearchParams(location.search);
const route = q.get('route') || '/m/investments';
const base='/m', email='dev05.qa@example.test';
const account={id:base+':'+email,email,createdAt:'2026-11-26T00:00:00.000Z',kyc:'approved',mpc:'ready',mpcOperationId:'mock-qa-op',mpcAddress:'Mock MPC · 0xA1…E4',ownVerified:false,defaultWallet:'mpc',walletVersion:1};
const order={id:'mock-dev05-qa',requestId:'dev05-qa',accountId:account.id,channelPath:base,issuerId:'harbor',offeringId:'residence-01',units:10,priceCents:10000,amountCents:100000,createdAt:'2026-11-26T08:00:00.000Z',updatedAt:'2026-11-26T09:00:00.000Z',expiresAt:'2026-11-26T08:15:00.000Z',documents:[{name:'认购协议',version:'Mock v1.0'},{name:'权益条款',version:'Mock v1.0'},{name:'风险披露',version:'Mock v1.0'}],mockConfirmedAt:'2026-11-26T08:00:00.000Z',legalSignatureValid:false,payment:'matched',paymentWallet:'Mock MPC · 0xA1…E4',tokenReceiver:'Mock MPC · 0xA1…E4',paymentReference:'Mock-TX-dev05-qa',allocation:'confirmed',registration:'pending',delivery:'unknown',exception:'fulfillment-failed',refund:'processing',refundReference:'Mock-REF-dev05-qa'};
const ticket={id:'mock-ticket-dev05-qa',accountId:account.id,channelPath:base,email,category:'订单付款',orderId:order.id,offeringId:order.offeringId,description:'Mock QA：请核对原付款和退款处理状态。',status:'resolved',replies:[{author:'investor',message:'原交易引用已附在订单详情。',at:'2026-11-26T08:30:00.000Z'},{author:'support-mock',message:'已完成沟通；原业务状态仍以订单详情为准。',at:'2026-11-26T09:00:00.000Z'}],createdAt:'2026-11-26T08:20:00.000Z',updatedAt:'2026-11-26T09:00:00.000Z'};
localStorage.setItem('rwa-mock-account:'+encodeURIComponent(base)+':'+encodeURIComponent(email),JSON.stringify(account));
localStorage.setItem('rwa-mock-order:'+encodeURIComponent(order.id),JSON.stringify(order));
localStorage.setItem('rwa-mock-ticket:'+encodeURIComponent(ticket.id),JSON.stringify(ticket));
sessionStorage.setItem('rwa-mock-active:'+encodeURIComponent(base),email);
location.replace(route);
</script>
'@
[System.IO.File]::WriteAllText($setup, $html, [System.Text.UTF8Encoding]::new($false))
try {
  $pages = @(
    @('orders', '/m/investments', 1000),
    @('order-detail', '/m/investments/orders/mock-dev05-qa', 1450),
    @('support', '/m/support?order=mock-dev05-qa', 1250),
    @('ticket-detail', '/m/account/tickets/mock-ticket-dev05-qa', 1350)
  )
  foreach ($page in $pages) {
    $name, $route, $height = $page
    $target = Join-Path $screenshots "dev05-$name.png"
    $pageUrl = "$BaseUrl/dev05-qa-setup.html?route=$([uri]::EscapeDataString($route))"
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
