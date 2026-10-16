# Structure check for every page: balanced <section>/<div>, sequential section numbers, no text diagrams,
# and every internal link and #anchor resolves. Any line marked CHECK needs fixing.
#   powershell -ExecutionPolicy Bypass -File tools\check-pages.ps1
$dir = Split-Path -Parent $PSScriptRoot
$files = Get-ChildItem $dir -Filter *.html
$ids = @{}
foreach ($f in $files) { $t = [IO.File]::ReadAllText($f.FullName); $ids[$f.Name] = @([regex]::Matches($t, '\sid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }) }
foreach ($f in $files) {
  $t = [IO.File]::ReadAllText($f.FullName)
  $sec = ([regex]::Matches($t, '<section[\s>]')).Count; $secC = ([regex]::Matches($t, '</section>')).Count
  $dv = ([regex]::Matches($t, '<div[\s>]')).Count; $dvC = ([regex]::Matches($t, '</div>')).Count
  $box = ([regex]::Matches($t, 'class="dotnet"')).Count
  $diag = ([regex]::Matches($t, 'class="diagram"')).Count
  $nums = @([regex]::Matches($t, '<span class="num">(\d+)\.(\d+)</span>') | ForEach-Object { [int]$_.Groups[2].Value })
  $seq = $true; for ($i = 0; $i -lt $nums.Count; $i++) { if ($nums[$i] -ne $i + 1) { $seq = $false } }
  $bad = @()
  foreach ($m in [regex]::Matches($t, 'href="([^"#:]*\.html)?(#[^"]*)?"')) {
    $file = $m.Groups[1].Value; $anchor = $m.Groups[2].Value
    if (-not $file -and -not $anchor) { continue }
    $target = if ($file) { $file } else { $f.Name }
    if (-not $ids.ContainsKey($target)) { $bad += "$file$anchor"; continue }
    if ($anchor -and $anchor.Length -gt 1 -and -not ($ids[$target] -contains $anchor.Substring(1))) { $bad += "$file$anchor" }
  }
  $flag = if ($sec -ne $secC -or $dv -ne $dvC -or -not $seq -or $diag -gt 0 -or $bad.Count -gt 0) { 'CHECK' } else { 'ok' }
  '{0,-40} {1,-5} sec {2}/{3} div {4}/{5} nums {6} seq={7} dotnet={8} diagram={9} badlinks={10}' -f $f.Name, $flag, $sec, $secC, $dv, $dvC, $nums.Count, $seq, $box, $diag, ($bad -join ',')
}
