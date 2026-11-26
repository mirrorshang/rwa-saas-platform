param(
  [string]$BaseUrl = 'http://127.0.0.1:5183',
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
)

$ErrorActionPreference = 'Stop'
$screenshots = Join-Path $PSScriptRoot 'screenshots'
$profile = Join-Path $env:TEMP 'codex-dev01r-chrome'
New-Item -ItemType Directory -Force -Path $screenshots, $profile | Out-Null

$pages = @(
  @('v-home-1440', '/v/harbor', 1440, 1500),
  @('m-home-1440', '/m', 1440, 1500),
  @('m-list-1440', '/m/opportunities', 1440, 1200),
  @('residence-detail-1440', '/m/opportunities/residence-01', 1440, 2200),
  @('debt-detail-1440', '/m/opportunities/debt-01', 1440, 2200),
  @('step1-1440', '/m/subscribe/residence-01/quote', 1440, 1300),
  @('step2-1440', '/m/subscribe/residence-01/documents', 1440, 1300),
  @('step3-1440', '/m/subscribe/residence-01/payment', 1440, 1300),
  @('step4-1440', '/m/subscribe/residence-01/progress', 1440, 1300),
  @('v-home-1280', '/v/harbor', 1280, 1500),
  @('residence-detail-1280', '/m/opportunities/residence-01', 1280, 2200),
  @('m-home-1920', '/m', 1920, 1500),
  @('debt-detail-1920', '/m/opportunities/debt-01', 1920, 2200)
)

foreach ($page in $pages) {
  $name, $route, $width, $height = $page
  $target = Join-Path $screenshots "dev01r-$name.png"
  & $Chrome '--headless=new' '--disable-gpu' '--hide-scrollbars' '--no-first-run' '--no-default-browser-check' '--virtual-time-budget=5000' "--window-size=$width,$height" "--user-data-dir=$profile" "--screenshot=$target" "$BaseUrl$route" 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath $target)) {
    throw "Chrome capture failed: $name"
  }
  $image = [System.Drawing.Image]::FromFile($target)
  try {
    if ($image.Width -ne $width -or $image.Height -ne $height) {
      throw "Wrong screenshot size: $name $($image.Width)x$($image.Height)"
    }
    Write-Output "$name $($image.Width)x$($image.Height)"
  } finally {
    $image.Dispose()
  }
}
