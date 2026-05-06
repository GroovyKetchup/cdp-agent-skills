param([Parameter(Mandatory=$true)][string]$ResultsRoot)
$ErrorActionPreference='Stop'
$src='c:\project\js\CDP\cdp-agent-skills\tests'
$scenarios=@(
  '01-zero-knowledge','02-from-scratch-field','03-wrap-third-party-datepicker',
  '04-add-card-to-existing','05-broken-manifest','06-data-table-dynamic-slot',
  '07-button-native-loading','08-data-container-hook','09-copy-paste-cleanup'
)
foreach($s in $scenarios){
  $a=Join-Path $src "e2e-fixtures\$s\_tester-only\prompt.md"
  $b=Join-Path $ResultsRoot "$s\judge-context\04-tester-prompt.md"
  $r=Join-Path $src "e2e-fixtures\$s\_tester-only\README.md"
  $rb=Join-Path $ResultsRoot "$s\judge-context\03-tester-readme.md"
  $pd=(Compare-Object (Get-Content $a) (Get-Content $b)).Count
  $rd=(Compare-Object (Get-Content $r) (Get-Content $rb)).Count
  Write-Host ("{0}  prompt-diff={1}  readme-diff={2}" -f $s,$pd,$rd)
}
$e=Join-Path $src 'e2e-evaluation-template.md'
foreach($s in $scenarios){
  $eb=Join-Path $ResultsRoot "$s\judge-context\01-evaluation-template.md"
  $ed=(Compare-Object (Get-Content $e) (Get-Content $eb)).Count
  Write-Host ("{0}  eval-template-diff={1}" -f $s,$ed)
}
