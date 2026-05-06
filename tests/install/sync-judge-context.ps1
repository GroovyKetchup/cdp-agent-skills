param(
  [Parameter(Mandatory=$true)][string]$ResultsRoot
)

$ErrorActionPreference = 'Stop'
$src  = "c:\project\js\CDP\cdp-agent-skills\tests"
$tmpl = Join-Path $src "e2e-evaluation-template.md"

$scenarios = @(
  '01-zero-knowledge',
  '02-from-scratch-field',
  '03-wrap-third-party-datepicker',
  '04-add-card-to-existing',
  '05-broken-manifest',
  '06-data-table-dynamic-slot',
  '07-button-native-loading',
  '08-data-container-hook',
  '09-copy-paste-cleanup'
)

foreach ($s in $scenarios) {
  $jc = Join-Path $ResultsRoot "$s\judge-context"
  if (-not (Test-Path $jc)) {
    Write-Host "SKIP (no judge-context): $jc"
    continue
  }
  $prompt = Join-Path $src "e2e-fixtures\$s\_tester-only\prompt.md"
  $readme = Join-Path $src "e2e-fixtures\$s\_tester-only\README.md"

  Copy-Item -LiteralPath $tmpl   -Destination (Join-Path $jc '01-evaluation-template.md') -Force
  Copy-Item -LiteralPath $readme -Destination (Join-Path $jc '03-tester-readme.md')        -Force
  Copy-Item -LiteralPath $prompt -Destination (Join-Path $jc '04-tester-prompt.md')        -Force
  Write-Host "OK: $s"
}
Write-Host "Done."
