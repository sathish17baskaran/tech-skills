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
 @('12-architecture-documents','SECTION 12','Architecture Documents &amp; Governance'),
 @('13-architecture-practice','SECTION 13','Architecture Practice'),
 @('14-security-iam','SECTION 14','Security, IAM &amp; Cryptography'),
 @('15-devops-deployment-observability','SECTION 15','DevOps, Deployment &amp; Observability'),
 @('16-cloud-cheat-sheet',('SECTION 16 ' + $DOT + ' REFERENCE'),'Cloud Cheat Sheet: Azure vs AWS vs GCP'),
 @('17-rag-genai','SECTION 17','RAG &amp; GenAI'),
 @('18-agentic-ai','SECTION 18','Agentic AI'),
 @('19-banking-payments','SECTION 19','Banking &amp; Payments Domain'),
 @('20-system-design-playbook',('SECTION 20 ' + $DOT + ' CAPSTONE'),'End-to-End System Design Playbook'),
 @('21-design-case-studies',('SECTION 21 ' + $DOT + ' PRACTICE'),'Design Case Studies'),
 @('22-dotnet-system-design-use-cases',('SECTION 22 ' + $DOT + ' PRACTICE'),'Top 10 System Design Use Cases in .NET'),
 @('23-dotnet-engineering-deep-dive','SECTION 23','.NET Engineering Deep Dive'),
 @('24-software-design-coding','SECTION 24','Software Design &amp; Coding Fundamentals'),
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
    $(N ' p' '11 Architecture Patterns')$ar$(N ' t' '12 Architecture Docs')$ar$(N ' p' '13 Architecture Practice')$ar$(N ' a' '14 Security &amp; IAM')$ar$(N ' a' '15 DevOps &amp; Observability')
  </div>
  <div class="flow">
    $(N ' s' '16 Cloud Cheat Sheet')$ar$(N ' g' '17 RAG &amp; GenAI')$ar$(N ' g' '18 Agentic AI')$ar$(N ' t' '19 Banking &amp; Payments')$ar$(N ' fill' '20 E2E Playbook')
  </div>
  <div class="flow">
    $(N ' fill' '21 Case Studies')$ar$(N ' fill' '22 .NET Use Cases')$ar$(N ' a' '23 .NET Deep Dive')$ar$(N ' a' '24 Design &amp; Coding')
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
