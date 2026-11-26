param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$profile = Join-Path $env:TEMP 'codex-dev07-chrome'
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null
$pages = @(
  @('m-home-1280', '/m', 1280, 1000),
  @('m-list-1280', '/m/opportunities', 1280, 1000),
  @('v-harbor-home-1440', '/v/harbor', 1440, 1100),
  @('v-cedar-list-1440', '/v/cedar/opportunities', 1440, 1100),
  @('m-detail-1920', '/m/opportunities/debt-01', 1920, 1200),
  @('m-home-1920', '/m', 1920, 1100)
)
foreach ($page in $pages) {
  $name, $route, $width, $height = $page
  $target = Join-Path $screenshots "dev07-$name.png"
  & $Chrome '--headless=new' '--incognito' '--disable-gpu' '--hide-scrollbars' '--no-first-run' '--no-default-browser-check' '--virtual-time-budget=5000' "--window-size=$width,$height" "--user-data-dir=$profile" "--screenshot=$target" "$BaseUrl$route" 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $target)) { throw "Chrome capture failed: $name" }
  $image = [System.Drawing.Image]::FromFile($target)
  try {
    if ($image.Width -ne $width -or $image.Height -ne $height) { throw "Wrong screenshot size: $name $($image.Width)x$($image.Height)" }
    Write-Output "$name $($image.Width)x$($image.Height)"
  } finally { $image.Dispose() }
}
