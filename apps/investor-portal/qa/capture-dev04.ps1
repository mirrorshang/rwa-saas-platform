param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
$setup = Join-Path $dist 'dev04-qa-setup.html'
$profile = Join-Path $env:TEMP 'codex-dev04-chrome'
if (!(Test-Path -LiteralPath $dist)) { throw 'Build dist before capture.' }
if (Test-Path -LiteralPath $setup) { throw 'Temporary QA setup already exists; refusing to overwrite it.' }
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$html = @'
<!doctype html><meta charset="utf-8"><script>
const q = new URLSearchParams(location.search);
const route = q.get('route') || '/m/subscribe/residence-01/quote';
const stage = q.get('stage') || 'none';
const base = '/m';
const email = 'dev04.qa@example.test';
const account = {
  id: base + ':' + email, email, createdAt: '2026-11-26T00:00:00.000Z',
  kyc: 'approved', mpc: 'ready', mpcOperationId: 'mock-qa-operation',
  mpcAddress: 'Mock MPC · 0xA1…E4', ownVerified: false,
  defaultWallet: 'mpc', walletVersion: 1
};
localStorage.setItem('rwa-mock-account:' + encodeURIComponent(base) + ':' + encodeURIComponent(email), JSON.stringify(account));
sessionStorage.setItem('rwa-mock-active:' + encodeURIComponent(base), email);
if (stage !== 'none') {
  const now = '2026-11-26T08:00:00.000Z';
  const order = {
    id: 'mock-dev04-qa', requestId: 'dev04-qa', accountId: account.id,
    channelPath: base, issuerId: 'harbor', offeringId: 'residence-01',
    units: 10, priceCents: 10000, amountCents: 100000,
    createdAt: now, updatedAt: now, expiresAt: '2026-12-01T08:00:00.000Z',
    documents: [
      {name:'认购协议',version:'Mock v1.0'},
      {name:'权益条款',version:'Mock v1.0'},
      {name:'风险披露',version:'Mock v1.0'}
    ],
    mockConfirmedAt: now, legalSignatureValid: false,
    payment: stage === 'payment' ? 'not-started' : 'matched',
    paymentWallet: 'Mock MPC · 0xA1…E4', tokenReceiver: 'Mock MPC · 0xA1…E4',
    paymentReference: stage === 'payment' ? undefined : 'Mock-TX-dev04-qa',
    allocation: stage === 'payment' ? 'pending' : 'confirmed',
    registration: 'pending', delivery: 'pending'
  };
  localStorage.setItem('rwa-mock-order:' + encodeURIComponent(order.id), JSON.stringify(order));
  const key = ['rwa-dev01-draft', encodeURIComponent(base), encodeURIComponent('harbor'), encodeURIComponent('residence-01'), 'order-id'].join(':') + ':' + account.id;
  sessionStorage.setItem(key, order.id);
}
location.replace(route);
</script>
'@
[System.IO.File]::WriteAllText($setup, $html, [System.Text.UTF8Encoding]::new($false))
try {
  $pages = @(
    @('quote', '/m/subscribe/residence-01/quote', 'none', 1050),
    @('documents', '/m/subscribe/residence-01/documents', 'none', 1200),
    @('payment', '/m/subscribe/residence-01/payment', 'payment', 1200),
    @('progress', '/m/subscribe/residence-01/progress', 'progress', 1100)
  )
  foreach ($page in $pages) {
    $name, $route, $stage, $height = $page
    $target = Join-Path $screenshots "dev04-$name.png"
    $pageUrl = "$BaseUrl/dev04-qa-setup.html?route=$([uri]::EscapeDataString($route))&stage=$stage"
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
