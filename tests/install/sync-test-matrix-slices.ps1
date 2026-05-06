param([Parameter(Mandatory=$true)][string]$ResultsRoot)
$ErrorActionPreference='Stop'
$matrix = 'c:\project\js\CDP\cdp-agent-skills\tests\e2e-test-matrix.md'
$lines = Get-Content -LiteralPath $matrix

# Find every "### 场景 NN" line index (0-based)
$starts = @()
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^### 场景 0[1-9]\b') { $starts += $i }
}
if ($starts.Count -ne 9) { throw "Expected 9 scene anchors, found $($starts.Count)" }

$scenarios = @(
  '01-zero-knowledge','02-from-scratch-field','03-wrap-third-party-datepicker',
  '04-add-card-to-existing','05-broken-manifest','06-data-table-dynamic-slot',
  '07-button-native-loading','08-data-container-hook','09-copy-paste-cleanup'
)

for ($k=0; $k -lt 9; $k++) {
  $sceneStart = $starts[$k]
  # End: walk forward until we hit a line that is "---" alone or a "## " heading or end of file or next "### 场景"
  $end = $lines.Count - 1
  for ($j=$sceneStart+1; $j -lt $lines.Count; $j++) {
    $t = $lines[$j]
    if ($t -match '^### 场景 0[1-9]\b') { $end = $j - 1; break }
    if ($t -match '^## ')               { $end = $j - 1; break }
  }
  # Trim trailing blank lines and a trailing "---" separator (if present)
  while ($end -gt $sceneStart -and $lines[$end].Trim() -eq '') { $end-- }
  if ($end -gt $sceneStart -and $lines[$end].Trim() -eq '---') { $end-- }
  while ($end -gt $sceneStart -and $lines[$end].Trim() -eq '') { $end-- }

  $slice = $lines[$sceneStart..$end] -join "`r`n"
  $sceneNo = '{0:D2}' -f ($k + 1)
  $sceneDir = $scenarios[$k]
  $jc = Join-Path $ResultsRoot "$sceneDir\judge-context"
  if (-not (Test-Path $jc)) { Write-Host "SKIP (no judge-context): $jc"; continue }
  $out = Join-Path $jc "02-test-matrix-scene-$sceneNo.md"
  # Write UTF-8 (no BOM)
  [System.IO.File]::WriteAllText($out, $slice + "`r`n", (New-Object System.Text.UTF8Encoding $false))
  Write-Host "OK: $sceneDir  lines=$($sceneStart+1)..$($end+1)  -> $out"
}
Write-Host 'Done.'
