param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$profile = Join-Path $env:TEMP 'codex-dev02-chrome'
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$pages = @(
  @('m-list', '/m/opportunities', 1440, 1150),
  @('m-residence-detail', '/m/opportunities/residence-01', 1440, 1800),
  @('m-debt-detail', '/m/opportunities/debt-01', 1440, 1800),
  @('v-harbor-list', '/v/harbor/opportunities', 1440, 1600),
  @('v-cedar-equity', '/v/cedar/opportunities/private-01', 1440, 1800),
  @('m-unlisted-blocked', '/m/opportunities/private-01', 1440, 800)
)

foreach ($page in $pages) {
  $name, $route, $width, $height = $page
  $target = Join-Path $screenshots "dev02-$name.png"
  & $Chrome '--headless=new' '--incognito' '--disable-gpu' '--hide-scrollbars' '--no-first-run' '--no-default-browser-check' '--virtual-time-budget=5000' "--window-size=$width,$height" "--user-data-dir=$profile" "--screenshot=$target" "$BaseUrl$route" 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $target)) { throw "Chrome capture failed: $name" }
  $image = [System.Drawing.Image]::FromFile($target)
  try {
    if ($image.Width -ne $width -or $image.Height -ne $height) { throw "Wrong screenshot size: $name $($image.Width)x$($image.Height)" }
    Write-Output "$name $($image.Width)x$($image.Height)"
  } finally { $image.Dispose() }
}
