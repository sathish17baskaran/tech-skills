# Rebuilds index.html: the section cards (from each page's hero toc) and the learning-path rows.
# Add a new page to $cards and to the $path rows, then run:
#   powershell -ExecutionPolicy Bypass -File tools\build-index.ps1
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $PSScriptRoot
$enc = New-Object Text.UTF8Encoding $false
$PLUS = [string][char]0xFF0B; $DOT = [string][char]0xB7; $ARROW = [string][char]0x2192

$cards = @(
 @('01-foundations','SECTION 01','Foundations'),
 @('02-networking-protocols','SECTION 02','Networking &amp; Communication Protocols'),
 @('03-scalability-reliability','SECTION 03','Scalability &amp; Reliability'),
 @('04-distributed-systems','SECTION 04','Distributed Systems'),
 @('05-caching','SECTION 05','Caching'),
 @('06-databases-data','SECTION 06','Databases &amp; Data'),
 @('07-data-governance-privacy','SECTION 07','Data Governance &amp; Privacy'),
 @('08-api-design','SECTION 08','API Design, Security &amp; Performance'),
 @('09-apim','SECTION 09','API Management (APIM)'),
 @('10-integration-messaging','SECTION 10','Integration &amp; Messaging'),
 @('11-architecture-patterns','SECTION 11','Architecture Patterns'),
 @('12-security-iam','SECTION 12','Security, IAM &amp; Cryptography'),
 @('13-devops-deployment-observability','SECTION 13','DevOps, Deployment &amp; Observability'),
 @('14-rag-genai','SECTION 14','RAG &amp; GenAI'),
 @('15-agentic-ai','SECTION 15','Agentic AI'),
 @('16-banking-payments','SECTION 16','Banking &amp; Payments Domain'),
 @('17-architecture-documents','SECTION 17','Architecture Documents &amp; Governance'),
 @('18-system-design-playbook',('SECTION 18 ' + $DOT + ' CAPSTONE'),'End-to-End System Design Playbook'),
 @('19-design-case-studies',('SECTION 19 ' + $DOT + ' PRACTICE'),'Design Case Studies'),
 @('20-dotnet-system-design-use-cases',('SECTION 20 ' + $DOT + ' PRACTICE'),'Top 10 System Design Use Cases in .NET'),
 @('21-cloud-cheat-sheet',('SECTION 21 ' + $DOT + ' REFERENCE'),'Cloud Cheat Sheet: Azure vs AWS vs GCP'),
 @('22-dotnet-engineering-deep-dive','SECTION 22','.NET Engineering Deep Dive'),
 @('23-software-design-coding','SECTION 23','Software Design &amp; Coding Fundamentals'),
 @('24-architecture-practice','SECTION 24','Architecture Practice'),
 @('25-interview-readiness',('SECTION 25 ' + $DOT + ' INTERVIEW'),'Interview Readiness'),
 @('26-solution-architect-behavioural-questions',('SECTION 26 ' + $DOT + ' INTERVIEW'),'Solution Architect Behavioural Questions (STAR)'),
 @('27-solution-designer-behavioural-questions',('SECTION 27 ' + $DOT + ' INTERVIEW'),'Solution Designer Behavioural Questions (STAR)'),
 @('28-engineering-manager-behavioural-questions',('SECTION 28 ' + $DOT + ' INTERVIEW'),'Engineering Manager Behavioural Questions (STAR)'),
 @('29-role-foundations',('SECTION 29 ' + $DOT + ' INTERVIEW'),'Role Foundations: Architect, Designer, Manager, Principal Engineer'))

$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine('<section id="sections">')
[void]$sb.AppendLine('  <div class="grid wide">')
foreach ($c in $cards) {
  $t = [IO.File]::ReadAllText((Join-Path $dir ($c[0] + '.html')))
  $toc = [regex]::Match($t, '<div class="toc">([\s\S]*?)</div>').Groups[1].Value
  $items = foreach ($m in [regex]::Matches($toc, '<a href="#[^"]*"( class="added")?>([\s\S]*?)</a>')) {
    if ($m.Groups[1].Success) { '<li class="added">' + $PLUS + ' ' + $m.Groups[2].Value + '</li>' } else { '<li>' + $m.Groups[2].Value + '</li>' }
  }
  [void]$sb.AppendLine('    <a class="sec-card" href="' + $c[0] + '.html"><div class="sn">' + $c[1] + '</div><h3>' + $c[2] + '</h3><ul>')
  [void]$sb.AppendLine('      ' + ($items -join '') + '</ul></a>')
  [void]$sb.AppendLine('')
}
[void]$sb.AppendLine('  </div>')
[void]$sb.Append('</section>')
$grid = $sb.ToString()

$ar = '<div class="ar">' + $ARROW + '</div>'
function N($cls, $label) { '<div class="n' + $cls + '">' + $label + '</div>' }
$path = @"
  <div class="flow">
    $(N ' s' '01 Foundations')$ar$(N ' s' '02 Protocols')$ar$(N '' '03 Scalability &amp; Reliability')$ar$(N '' '04 Distributed Systems')$ar$(N '' '05 Caching')
  </div>
  <div class="flow">
    $(N '' '06 Databases &amp; Data')$ar$(N '' '07 Data Governance')$ar$(N ' p' '08 API Design')$ar$(N ' p' '09 APIM')$ar$(N ' p' '10 Integration &amp; Messaging')
  </div>
  <div class="flow">
    $(N ' p' '11 Architecture Patterns')$ar$(N ' a' '12 Security &amp; IAM')$ar$(N ' a' '13 DevOps &amp; Observability')$ar$(N ' g' '14 RAG &amp; GenAI')$ar$(N ' g' '15 Agentic AI')
  </div>
  <div class="flow">
    $(N ' t' '16 Banking &amp; Payments')$ar$(N ' t' '17 Architecture Docs')$ar$(N ' fill' '18 E2E Playbook')$ar$(N ' fill' '19 Case Studies')$ar$(N ' fill' '20 .NET Use Cases')
  </div>
  <div class="flow">
    $(N ' s' '21 Cloud Cheat Sheet')$ar$(N ' a' '22 .NET Deep Dive')$ar$(N ' a' '23 Design &amp; Coding')$ar$(N ' p' '24 Architecture Practice')
  </div>
  <div class="flow">
    $(N ' fill' '25 Interview Readiness')$ar$(N ' fill' '26 Solution Architect Questions')$ar$(N ' fill' '27 Solution Designer Questions')$ar$(N ' fill' '28 Engineering Manager Questions')$ar$(N ' fill' '29 Role Foundations')
  </div>
"@

$fi = Join-Path $dir 'index.html'; $t = [IO.File]::ReadAllText($fi)
$t = [regex]::Replace($t, '<section id="sections">[\s\S]*?</section>', { param($m) $grid })
$t = [regex]::Replace($t, '(<p class="oneliner">From the basics[^<]*</p>\s*)(<div class="flow">[\s\S]*?</div>\s*</div>\s*)+', { param($m) $m.Groups[1].Value + $path.TrimStart() + "`r`n" })
$count = $cards.Count
$t = [regex]::Replace($t, 'All \d+ sections', ('All ' + $count + ' sections'))
[IO.File]::WriteAllText($fi, $t, $enc)
'index updated'
