$ErrorActionPreference = 'Stop'
# Regenerates the top bar (nav.top) and the bottom pager on every page from the ordered list below.
# Add a new page to $pages (file name without .html, short label, long label), then run:
#   powershell -ExecutionPolicy Bypass -File tools\build-nav.ps1
$d = Split-Path -Parent $PSScriptRoot
$enc = New-Object Text.UTF8Encoding $false
$L = [string][char]0x2190; $R = [string][char]0x2192; $DOT = [string][char]0xB7; $H = [char]::ConvertFromUtf32(0x1F3E0)
$pages = @(
 @('01-foundations','Foundations','Foundations'),
 @('02-networking-protocols','Protocols','Networking &amp; Protocols'),
 @('03-scalability-reliability','Scalability','Scalability &amp; Reliability'),
 @('04-distributed-systems','Distributed Systems','Distributed Systems'),
 @('05-caching','Caching','Caching'),
 @('06-databases-data','Databases','Databases &amp; Data'),
 @('07-data-governance-privacy','Data Governance','Data Governance &amp; Privacy'),
 @('08-api-design','API Design','API Design'),
 @('09-apim','APIM','API Management'),
 @('10-integration-messaging','Integration','Integration &amp; Messaging'),
 @('11-architecture-patterns','Architecture Patterns','Architecture Patterns'),
 @('12-security-iam','Security &amp; IAM','Security &amp; IAM'),
 @('13-devops-deployment-observability','DevOps','DevOps &amp; Observability'),
 @('14-rag-genai','RAG &amp; GenAI','RAG &amp; GenAI'),
 @('15-agentic-ai','Agentic AI','Agentic AI'),
 @('16-banking-payments','Banking &amp; Payments','Banking &amp; Payments'),
 @('17-architecture-documents','Architecture Docs','Architecture Documents'),
 @('18-system-design-playbook','Playbook','System Design Playbook'),
 @('19-design-case-studies','Case Studies','Design Case Studies'),
 @('20-dotnet-system-design-use-cases','.NET Use Cases','Top 10 .NET Use Cases'),
 @('21-cloud-cheat-sheet','Cloud Cheat Sheet','Cloud Cheat Sheet'),
 @('22-dotnet-engineering-deep-dive','.NET Deep Dive','.NET Engineering Deep Dive'),
 @('23-software-design-coding','Design &amp; Coding','Software Design &amp; Coding'),
 @('24-architecture-practice','Architecture Practice','Architecture Practice'),
 @('25-interview-readiness','Interview Readiness','Interview Readiness'),
 @('26-solution-architect-behavioural-questions','Solution Architect Questions','Solution Architect Behavioural Questions'),
 @('27-solution-designer-behavioural-questions','Solution Designer Questions','Solution Designer Behavioural Questions'),
 @('28-engineering-manager-behavioural-questions','Engineering Manager Questions','Engineering Manager Behavioural Questions'),
 @('29-role-foundations','Role Foundations','Role Foundations'))
for ($i = 0; $i -lt $pages.Count; $i++) {
  $p = $pages[$i]; $f = Join-Path $d ($p[0] + '.html'); $t = [IO.File]::ReadAllText($f)
  $here = [regex]::Match($t, '<span class="here">[\s\S]*?</span>').Value
  if ($i -eq 0) { $np = '<a href="index.html">' + $H + ' Roadmap</a>'; $pp = '<a href="index.html">' + $L + ' Roadmap</a>' }
  else { $q = $pages[$i-1]; $np = '<a href="' + $q[0] + '.html">' + $L + ' ' + $q[1] + '</a>'; $pp = '<a href="' + $q[0] + '.html">' + $L + ' ' + $q[0].Substring(0,2) + ' ' + $DOT + ' ' + $q[2] + '</a>' }
  if ($i -eq $pages.Count - 1) { $nn = '<a href="index.html">' + $H + ' Roadmap</a>'; $pn = '<a class="next" href="index.html">' + $H + ' Back to Roadmap</a>' }
  else { $q = $pages[$i+1]; $nn = '<a href="' + $q[0] + '.html">Next: ' + $q[1] + ' ' + $R + '</a>'; $pn = '<a class="next" href="' + $q[0] + '.html">' + $q[0].Substring(0,2) + ' ' + $DOT + ' ' + $q[2] + ' ' + $R + '</a>' }
  $nav = '<nav class="top">' + $np + $here + $nn + '</nav>'
  $pager = '<div class="pager">' + $pp + $pn + '</div>'
  $t = [regex]::Replace($t, '<nav class="top">[\s\S]*?</nav>', { param($m) $nav })
  $t = [regex]::Replace($t, '<div class="pager">[\s\S]*?</div>', { param($m) $pager })
  [IO.File]::WriteAllText($f, $t, $enc)
  "ok " + $p[0]
}
