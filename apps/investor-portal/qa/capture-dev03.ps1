param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
$setup = Join-Path $dist 'dev03-qa-setup.html'
$profile = Join-Path $env:TEMP 'codex-dev03-chrome'
if (!(Test-Path -LiteralPath $dist)) { throw 'Build dist before capture.' }
if (Test-Path -LiteralPath $setup) { throw 'Temporary QA setup already exists; refusing to overwrite it.' }
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$html = @'
<!doctype html><meta charset="utf-8"><script>
const q = new URLSearchParams(location.search);
const route = q.get('route') || '/m/account';
const base = route.startsWith('/v/harbor') ? '/v/harbor' : '/m';
const email = 'dev03.qa@example.test';
const ready = q.get('mpc') === 'ready';
const record = {
  id: base + ':' + email, email, createdAt: '2026-11-26T00:00:00.000Z',
  kyc: q.get('kyc') || 'processing', mpc: q.get('mpc') || 'creating',
  mpcOperationId: 'mock-qa-operation', mpcAddress: 'Mock MPC · 0xA1…E4',
  ownAddress: ready ? '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' : undefined, ownVerified: ready,
  defaultWallet: ready ? 'own' : undefined, walletVersion: ready ? 1 : 0
};
localStorage.setItem('rwa-mock-account:' + encodeURIComponent(base) + ':' + encodeURIComponent(email), JSON.stringify(record));
sessionStorage.setItem('rwa-mock-active:' + encodeURIComponent(base), email);
location.replace(route);
</script>
'@
[System.IO.File]::WriteAllText($setup, $html, [System.Text.UTF8Encoding]::new($false))
try {
  $pages = @(
    @('m-login', '/m/account', 1440, 1000, $false, '', ''),
    @('m-overview', '/m/account', 1440, 1050, $true, 'processing', 'creating'),
    @('m-kyc-supplement', '/m/account/kyc', 1440, 1050, $true, 'supplement', 'failed'),
    @('m-wallets', '/m/account/wallets', 1440, 1300, $true, 'approved', 'ready'),
    @('v-account', '/v/harbor/account', 1440, 1050, $true, 'not-started', 'creating')
  )
  foreach ($page in $pages) {
    $name, $route, $width, $height, $withAccount, $kyc, $mpc = $page
    $target = Join-Path $screenshots "dev03-$name.png"
    $pageUrl = if ($withAccount) { "$BaseUrl/dev03-qa-setup.html?route=$([uri]::EscapeDataString($route))&kyc=$kyc&mpc=$mpc" } else { "$BaseUrl$route" }
    & $Chrome '--headless=new' '--incognito' '--disable-gpu' '--hide-scrollbars' '--no-first-run' '--no-default-browser-check' '--virtual-time-budget=5000' "--window-size=$width,$height" "--user-data-dir=$profile" "--screenshot=$target" $pageUrl 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $target)) { throw "Chrome capture failed: $name" }
    $image = [System.Drawing.Image]::FromFile($target)
    try {
      if ($image.Width -ne $width -or $image.Height -ne $height) { throw "Wrong screenshot size: $name $($image.Width)x$($image.Height)" }
      Write-Output "$name $($image.Width)x$($image.Height)"
    } finally { $image.Dispose() }
  }
} finally {
  Remove-Item -LiteralPath $setup -Force -ErrorAction SilentlyContinue
}
