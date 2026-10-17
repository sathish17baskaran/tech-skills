/* Quick-revision data for 13-devops-deployment-observability.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['13'] = {
  approach: [
    ['Start from the outcome', 'What are we optimising: release speed, safety, recovery time, cost? Tie it to SLOs or DORA metrics.'],
    ['Describe the path to production', 'Trunk-based + PR checks, CI build once, scans, signed immutable artifact, promote through environments.'],
    ['Pick a release strategy', 'Rolling, blue-green, canary or rings, plus feature flags to split deploy from release.'],
    ['Handle the hard parts', 'Expand/contract DB migrations, rollback triggers, IaC with drift control, health probes.'],
    ['Make it observable', 'Structured logs with trace IDs, RED/USE metrics, distributed traces via OpenTelemetry.'],
    ['Alert and respond', 'Symptom and burn-rate alerts with runbooks, incident roles, blameless postmortems.'],
    ['Close with metrics', 'Lead time, deploy frequency, change fail rate, recovery time, rework rate; error budget status.']
  ],
  traps: [
    'Rebuilding the artifact per environment instead of promoting the same one.',
    'Ignoring the database in a zero-downtime deployment answer.',
    'Paging on causes like CPU 85% instead of user-facing symptoms.',
    'Using averages instead of p95/p99 latency, or userId as a metric label.',
    'Using DORA metrics to rank teams or individuals.'
  ],
  sections: {
    cicd: {
      say: 'CI means merging often and building and testing automatically. Continuous delivery keeps every passing change releasable with a manual approval before prod; continuous deployment releases automatically. The pipeline builds once, scans for security issues, produces a signed versioned artifact and promotes that same artifact through every environment, changing only config.',
      k: ['continuous integration', 'continuous delivery', 'continuous deployment', 'build once, deploy many', 'approval gate', 'shift-left', 'DORA metrics'],
      p: ['Delivery = manual approval before prod; deployment = fully automatic.', 'Build once; only config changes per environment.', 'Security scans (SAST, SCA, secrets, IaC) run in the pipeline, not after go-live.'],
      f: [['Continuous delivery vs continuous deployment?', 'Both keep every change releasable. Delivery has a manual approval before production; deployment pushes every passing change to production automatically.'],
          ['Why build once and promote the same artifact?', 'What reaches production is exactly what was tested. Rebuilding per environment can pull different dependencies or compiler output.']],
      q: [{ q: 'Which describes continuous deployment?', o: ['Developers merge weekly', 'Every change waits for a monthly release', 'Every passing change goes to production automatically', 'Builds run only on release branches'], a: 2, e: 'Continuous deployment removes the manual approval; continuous delivery keeps it.' }]
    },
    branching: {
      say: 'Trunk-based development means everyone integrates into trunk at least daily, with short branches and unfinished work behind feature flags, which is what CI/CD assumes. GitHub flow is a simple default for one live version; GitFlow suits products with several supported releases. Keep PRs small, automate style and checks, and protect main.',
      k: ['trunk-based development', 'GitHub flow', 'GitFlow', 'feature flags', 'pull request', 'CODEOWNERS', 'merge queue', 'Conventional Commits'],
      p: ['Integrate at least daily; long-lived branches are postponed merge pain.', 'Google guide: ~100 lines is reasonable, 1,000 is usually too large.', 'Respond to reviews within one business day; label optional comments nit:.', 'Protect main: required checks, required reviews, CODEOWNERS.'],
      f: [['Trunk-based development vs GitFlow?', 'GitFlow keeps long-lived develop and release branches: fits versioned products but merges arrive late and big. Trunk-based merges small changes daily with flags hiding unfinished work, which CI/CD needs.'],
          ['What makes a good pull request?', 'Small, with a clear description of why and how it was tested, self-reviewed first. Automated checks handle style, tests and scans so reviewers focus on correctness, design, security and operability.'],
          ['What does a merge queue do?', 'It tests each PR on top of the latest main before merging, so main stays green.'],
          ['Monorepo vs polyrepo trade-off?', 'Monorepo: atomic cross-service changes and shared code, but needs change-aware builds and CODEOWNERS. Polyrepo: clear ownership and fast repos, but cross-repo changes need versioned packages and coordination.']],
      q: [{ q: 'Why does trunk-based development pair with feature flags?', o: ['Flags let unfinished code merge safely, splitting deploy from release', 'Flags make builds faster', 'Flags replace code review', 'Flags remove the need for tests'], a: 0, e: 'Code can be merged and deployed dark, then released when ready.' }]
    },
    testing: {
      say: 'Buy the most confidence for the least test time. The pyramid has many unit tests, fewer integration, very few end-to-end; the trophy weights integration tests most. For microservices, consumer-driven contract tests replace most flaky cross-team E2E tests. Add load, stress, spike and soak tests against SLOs, and chaos experiments with a hypothesis and abort switch.',
      k: ['test pyramid', 'testing trophy', 'contract testing (Pact)', 'can-i-deploy', 'load / stress / spike / soak', 'chaos engineering', 'synthetic monitoring', 'canary analysis'],
      p: ['Anti-pattern: the ice-cream cone of mostly manual and E2E tests.', 'Never use raw production customer data in test; synthetic or irreversibly masked.', 'Chaos without a hypothesis and an abort button is just an outage.', 'Aim for confidence, not a coverage percentage.'],
      f: [['What is consumer-driven contract testing?', 'Each consumer records what it needs from a provider (a pact). The provider verifies all pacts in its own pipeline and only deploys if they pass, catching breaking changes without a shared E2E environment.'],
          ['Load vs stress vs spike vs soak?', 'Load: do we meet SLOs at expected peak. Stress: where does it break and does it recover. Spike: can we survive a sudden surge. Soak: does it degrade over hours (leaks, pools, disks).'],
          ['How do you run a safe chaos experiment?', 'State a hypothesis, e.g. "if one zone fails p99 stays under 500 ms", start with a small blast radius (one instance, staging, 1% traffic), and keep an abort switch.']],
      q: [{ q: 'A service slowly leaks memory and fails after about 10 hours. Which test finds this?', o: ['Spike test', 'Contract test', 'Unit test', 'Soak (endurance) test'], a: 3, e: 'Soak tests run for hours to expose leaks, pool exhaustion and full disks.' },
          { q: 'Which testing shape puts the most weight on integration tests?', o: ['Test pyramid', 'Testing trophy', 'Ice-cream cone', 'Test diamond of E2E'], a: 1, e: 'Kent C. Dodds\' trophy argues integration tests give the most confidence per minute.' }]
    },
    releases: {
      say: 'A version number is a promise about compatibility. SemVer bumps MAJOR for breaking changes, MINOR for compatible features and PATCH for fixes. Published artifacts are immutable: never overwrite a version, promote the same artifact by digest. Derive versions and changelogs from git. Release trains trade speed for predictability; continuous delivery trades process for automation.',
      k: ['SemVer', 'MAJOR.MINOR.PATCH', 'pre-release label', 'artifact immutability', 'image digest', 'release train', 'changelog', 'package validation'],
      p: ['Any breaking change = new MAJOR, no exceptions.', 'Deploy containers by digest (@sha256:...), not latest.', 'HTTP APIs expose only the major (/v1, /v2); changes within it are additive.', 'Git-based versioning needs full history: fetch-depth: 0 in CI.'],
      f: [['How do you version a NuGet library?', 'SemVer, derived from git with MinVer, Nerdbank.GitVersioning or GitVersion. Turn on package validation to catch accidental breaking changes and never overwrite a published version.'],
          ['Release train vs continuous delivery?', 'A train ships whatever is ready on a fixed cadence: predictable but big batches. Continuous delivery ships each change on its own: small risk per change but needs strong automation, observability and rollback.'],
          ['Changelog vs release notes?', 'A changelog lists notable changes per version for developers (Added, Changed, Fixed...). Release notes explain what changed for users, including migration steps and known issues.']],
      q: [{ q: 'You remove a public method from a library at version 1.4.2. What is the next version?', o: ['1.4.3', '1.5.0', '2.0.0', '1.4.2-beta'], a: 2, e: 'Removing a member can break consumers, so SemVer requires a new MAJOR.' }]
    },
    deploy: {
      say: 'Deployment strategies trade downtime, risk, cost and rollback speed. Recreate is simple but has downtime. Rolling replaces instances in batches. Blue-green flips between two full environments for instant rollback at double cost. Canary exposes a small slice first with automatic rollback triggers. The hard part is the database, so use expand, migrate, contract.',
      k: ['recreate', 'rolling', 'blue-green', 'canary', 'shadow / dark launch', 'ring-based deployment', 'expand/contract', 'rollback trigger'],
      p: ['Blue-green: instant rollback, 2x cost, schema must work with both versions.', 'Canary: lowest risk, needs good monitoring and traffic splitting.', 'Shadow traffic must be side-effect free: do not double-charge.', 'Run migrations as a separate pipeline step, not at app startup.'],
      f: [['Blue-green vs canary?', 'Blue-green switches all traffic at once between two full environments with instant rollback and double cost. Canary shifts traffic gradually on real users with a smaller blast radius, but needs strong monitoring.'],
          ['How do you deploy a DB schema change with zero downtime?', 'Expand/contract: add the new column or table, deploy code that writes both, backfill, switch reads, then remove the old structure in a later release.'],
          ['Roll back or roll forward?', 'Roll back if it is fast; it is the safest. Roll forward when the fix is small and well understood.']],
      q: [{ q: 'Which strategy tests v2 with real production traffic and no user impact?', o: ['Shadow / dark launch', 'Rolling', 'Recreate', 'A/B testing'], a: 0, e: 'Shadow mirrors traffic to v2 and discards its responses; watch for side effects.' },
          { q: 'What is the main drawback of blue-green deployment?', o: ['Long downtime', 'Mixed versions serving traffic for hours', 'Slow rollback', 'Running two full environments (about 2x cost)'], a: 3, e: 'Blue-green keeps two full environments so the switch and rollback are instant.' }]
    },
    flags: {
      say: 'Feature flags ship code turned off and turn it on for chosen users without redeploying, so deploy is not release. Types are release toggles for unfinished work, experiment toggles for A/B tests, ops toggles or kill switches, and permission toggles. Remove old flags, because flag debt becomes untestable code paths.',
      k: ['deploy vs release', 'release toggle', 'experiment toggle', 'kill switch', 'permission toggle', 'flag debt', 'targeting filter', 'OpenFeature'],
      p: ['Release toggles enable trunk-based development.', 'A kill switch is a fast incident mitigation with no redeploy.', 'Clean up flags; each one doubles the paths to test.'],
      f: [['Name the four types of feature toggle.', 'Release (hide unfinished work), experiment (A/B tests), ops or kill switch (turn off a troublesome feature), and permission (premium or beta users).'],
          ['What is flag debt?', 'Old flags left in the code. They create untestable code paths and confusion, so remove them once a feature is fully released.']],
      q: [{ q: 'A new feature causes errors in production. What is the fastest mitigation if it is behind a flag?', o: ['Roll back the database', 'Turn off the ops toggle (kill switch)', 'Rebuild the image', 'Scale out the cluster'], a: 1, e: 'A kill switch disables the feature immediately without a redeploy.' }]
    },
    iac: {
      say: 'Infrastructure as Code defines infrastructure in versioned files, reviewed in a PR with a plan or what-if, and the tool makes the cloud match the code. Prefer declarative tools like Terraform or Bicep. Benefits are repeatable environments and an audit trail. Detect and stop drift, and in GitOps an agent like Argo CD or Flux pulls and reconciles from Git.',
      k: ['declarative vs imperative', 'Terraform / Bicep', 'plan / what-if', 'drift', 'immutable infrastructure', 'GitOps', 'Argo CD / Flux'],
      p: ['Drift = manual changes outside code; detect and stop it.', 'Immutable infrastructure: replace, do not patch in place.', 'GitOps is pull-based: Git is the source of truth.'],
      f: [['Declarative vs imperative IaC?', 'Declarative states what you want (Terraform, Bicep, ARM) and the tool works out the steps. Imperative lists the steps to run (scripts, or Pulumi in code).'],
          ['What is GitOps?', 'Git is the source of truth for the desired state, and an agent in the cluster such as Argo CD or Flux continuously pulls and reconciles it.']],
      q: [{ q: 'Someone changes a firewall rule in the portal. What is this called in IaC terms?', o: ['Promotion', 'Idempotency', 'Drift', 'Provenance'], a: 2, e: 'Drift is the gap between the real environment and the code; detect it and reconcile.' }]
    },
    k8s: {
      say: 'A container packages an app with its dependencies on the shared host kernel, lighter than a VM. Kubernetes schedules, heals, scales and connects containers: Deployments manage ReplicaSets of Pods, Services give stable DNS, Ingress routes HTTP in, and HPA autoscales. Probes matter: liveness restarts, readiness gates traffic.',
      k: ['Pod', 'Deployment / ReplicaSet', 'Service', 'Ingress', 'HPA', 'liveness / readiness / startup probe', 'StatefulSet', 'etcd'],
      p: ['Liveness = restart if dead; readiness = send traffic only when ready.', 'Do not check the database in the liveness probe; a DB outage would restart every pod.', 'StatefulSet for stateful apps, DaemonSet for one pod per node.', 'Handle SIGTERM gracefully to finish in-flight requests.'],
      f: [['VM vs container?', 'A VM carries a guest OS on a hypervisor. A container shares the host OS kernel and carries only the app and its libraries, so it is lighter and starts in seconds.'],
          ['Why not check the DB in a liveness probe?', 'If the DB goes down every pod fails liveness and Kubernetes restarts them all, which does not help. Put dependency checks in readiness instead.'],
          ['What are the control plane components?', 'API server, scheduler, controller manager and etcd for state. Worker nodes run the kubelet and a container runtime.']],
      q: [{ q: 'A pod is warming its cache and should not receive traffic yet. Which probe handles this?', o: ['Readiness probe', 'Liveness probe', 'HPA', 'DaemonSet'], a: 0, e: 'Readiness controls whether the Service sends traffic; liveness controls restarts.' }]
    },
    observability: {
      say: 'Monitoring tells you something is wrong; observability lets you ask why from the telemetry the system emits. The three pillars are logs, metrics and traces, joined by a trace ID propagated in the W3C traceparent header. Use golden signals, RED for services and USE for resources, emit with OpenTelemetry, and alert on symptoms users feel.',
      k: ['logs / metrics / traces', 'OpenTelemetry', 'W3C traceparent', 'span', 'golden signals', 'RED', 'USE', 'correlation ID'],
      p: ['Metrics say something is wrong, traces say where, logs say why.', 'Golden signals: latency, traffic, errors, saturation.', 'RED = Rate, Errors, Duration; USE = Utilisation, Saturation, Errors.'],
      f: [['Logs vs metrics vs traces?', 'Metrics tell you something is wrong (error rate up). Traces show where (which hop is slow). Logs explain why (the exception details).'],
          ['What are the four golden signals?', 'Latency, traffic, errors and saturation (Google SRE).']],
      q: [{ q: 'Which telemetry type best shows which service in a call chain added the latency?', o: ['Metrics', 'Heartbeats', 'Audit logs', 'Distributed traces'], a: 3, e: 'A trace shows the spans of one request across services with their timings.' }]
    },
    logging: {
      say: 'A log is a timestamped record of an event, useful only if you can search and correlate it. Write structured JSON logs with consistent levels and a trace or correlation ID on every line. Never log secrets, tokens, full card numbers or PII. Log an error once where it is handled, and control volume with sampling and retention tiers.',
      k: ['structured logging', 'log levels', 'correlation ID', 'message template', 'redaction', 'audit log', 'retention tiers', 'sampling'],
      p: ['Never log passwords, tokens, PAN, CVV or full PII: mask or tokenise.', 'Log an error once, at the boundary where it is handled.', 'UTC timestamps in ISO 8601; log level changeable at runtime.', 'No string interpolation in log calls: use templates like {PaymentId}.'],
      f: [['Why avoid $"Payment {id}" in ILogger calls?', 'Interpolation loses the structured field and always builds the string, even when the level is off. Use message templates or [LoggerMessage].'],
          ['How do audit logs differ from app logs?', 'Audit logs record who did what and when, for compliance. They are immutable, tamper-evident and kept longer.'],
          ['WARN vs ERROR?', 'WARN is unexpected but handled, e.g. a retry. ERROR means an operation failed and needs attention, e.g. a payment failed after 3 retries.']],
      q: [{ q: 'Which field lets you follow one request across services in your logs?', o: ['Log level', 'Trace / correlation ID', 'Hostname only', 'Timestamp only'], a: 1, e: 'A trace ID propagated via W3C traceparent ties every log line of one request together.' }]
    },
    metrics: {
      say: 'Metrics are numbers over time: cheap, fast to query and ideal for alerts. Counters only go up, gauges go up and down, and histograms bucket values so you can compute p95 and p99. Measure RED for services, USE for resources, plus business KPIs. Avoid high-cardinality labels like userId, and never trust the average.',
      k: ['counter', 'gauge', 'histogram', 'p95 / p99', 'cardinality', 'RED / USE', 'business KPIs', 'consumer lag'],
      p: ['Averages hide the tail: 95 at 100 ms + 5 at 3 s = 245 ms mean, p99 = 3 s.', 'Prefer histograms over summaries; summaries cannot be combined across instances.', 'Labels must be bounded: endpoint template, status class, region.', '"CPU fine, payments/min down 40%" is the alert that matters.'],
      f: [['Why are high-cardinality labels a problem?', 'Each unique label combination is a separate time series. userId or paymentId labels create millions of series, blowing up memory, cost and query time. Put IDs in logs and traces.'],
          ['Counter vs gauge vs histogram?', 'A counter only increases (requests, errors; look at its rate). A gauge goes up and down (queue depth, CPU). A histogram buckets values for percentiles (latency).'],
          ['Why look at p99 rather than the average?', 'The average hides the slow tail. p99 shows what the slowest 1% of users experience.']],
      q: [{ q: 'Which metric type should you use for request latency so you can compute p99 across instances?', o: ['Counter', 'Gauge', 'Histogram', 'Client-side summary'], a: 2, e: 'Histograms can be aggregated across instances and give percentiles; summaries cannot be combined.' }]
    },
    alerting: {
      say: 'An alert should page a human only when something needs action now: urgent, actionable and tied to user impact. Alert on symptoms such as error rate, latency and SLO burn rate, and use dashboards for causes. Multi-window burn-rate alerts cut false alarms. Every page needs an owner, a runbook and the right severity routing.',
      k: ['symptom-based alerting', 'SLO burn rate', 'error budget', 'multi-window', 'heartbeat / absence', 'severity routing', 'runbook', 'alert fatigue'],
      p: ['99.9% SLO = 0.1% error budget, about 43 min per 30 days.', 'Burn rate 1x uses the budget in exactly 30 days.', 'Page rules need a long AND a short window over threshold.', 'Do not forget silent failures: missing heartbeats, DLQ growth, cert expiry, batch SLAs.'],
      f: [['What should you alert on?', 'User-facing symptoms: error rate, latency against the SLO (burn rate), failed synthetic journeys, missing heartbeats and business KPIs dropping. Causes like CPU go to dashboards and tickets.'],
          ['How do you reduce alert fatigue?', 'Page only on actionable symptoms, add duration windows, use multi-window burn-rate alerts, group and deduplicate, attach runbooks, and delete alerts nobody acts on.'],
          ['What is burn rate?', 'Actual error rate divided by allowed error rate. At 1x you use the whole budget in exactly the SLO window; higher means it runs out sooner.']],
      q: [{ q: 'A nightly batch file silently stops arriving. Which alert type catches it?', o: ['Heartbeat / absence alert', 'Static CPU threshold', 'Log level change', 'Dynamic latency baseline'], a: 0, e: 'Absence alerts fire when an expected signal, such as a processed file by 06:00, does not appear.' },
          { q: 'Why does a burn-rate page rule use both a long and a short window?', o: ['To double the alert volume', 'Because SLOs require two dashboards', 'To save storage', 'The short window confirms the problem is still happening, reducing false alarms'], a: 3, e: 'Both windows must exceed the threshold, so stale spikes that already recovered do not page.' }]
    },
    incident: {
      say: 'Incident management is how a team detects, responds to and learns from production incidents: detect, triage by severity, mitigate, resolve, then a blameless post-incident review. Mitigate first to restore service, using rollback, failover, a runbook or a kill switch, and find the root cause second. Track MTTD, MTTR and MTBF.',
      k: ['detect / triage / mitigate', 'severity P1-P4', 'MTTD', 'MTTR', 'MTBF', 'rollback / failover', 'blameless review'],
      p: ['Restore service first; root cause second.', 'Change-caused incidents feed DORA change fail rate and recovery time.', 'Diagnostics: dotnet-counters, dotnet-trace, dotnet-dump.'],
      f: [['What do MTTD, MTTR and MTBF measure?', 'MTTD: time to detect. MTTR: time to restore. MTBF: time between failures.'],
          ['Payments are failing after a deploy. What do you do first?', 'Mitigate: roll back or turn off the feature flag to restore service, then investigate the root cause and run a blameless review.']],
      q: [{ q: 'During a P1 incident, what is the first priority?', o: ['Find the root cause', 'Restore service (mitigate)', 'Write the postmortem', 'Identify who made the change'], a: 1, e: 'Mitigate first to stop customer impact; root cause and review come after.' }]
    },
    sre: {
      say: 'SRE treats operations as a software problem: agree how reliable a service must be with SLOs, spend the error budget on purpose, and automate toil away. Key practices are a pre-agreed error budget policy, a 50% cap on toil, healthy on-call rotations, blameless postmortems with owned actions, production readiness reviews and game days.',
      k: ['SLO / error budget', 'error budget policy', 'toil', '50% cap', 'on-call health', 'blameless postmortem', 'production readiness review', 'game day'],
      p: ['Agree the error budget policy in advance, not mid-incident.', 'Toil capped at 50% of each engineer\'s time; automate the most frequent task first.', 'On-call: at least 8 people for single-site 24x7, at most 2 incidents per 12-hour shift.', 'Put a histogram bucket edge exactly at the SLO threshold.'],
      f: [['What is an error budget policy?', 'A pre-agreed rule between product and engineering: ship normally while budget remains, slow down as it burns, freeze features and fix reliability when it is gone. Exceptions and escalation are written down.'],
          ['What is toil?', 'Manual, repetitive, automatable work with no lasting value that grows with the service, like restarting stuck jobs or renewing certificates by hand.'],
          ['What goes into a blameless postmortem?', 'Summary, impact, timestamped timeline, contributing factors (not a person to blame), what went well and badly, and action items with owners and due dates.'],
          ['What does a production readiness review check?', 'Observability (SLOs, alerts with runbooks), resilience (timeouts, load and DR tests), safe deploy and rollback, security and capacity, and clear ownership.']],
      q: [{ q: 'The error budget is always untouched quarter after quarter. What does SRE suggest?', o: ['Tighten alerts until it burns', 'Freeze all releases', 'The SLO may be too loose, or you can take more risk', 'Remove the SLO'], a: 2, e: 'An unused budget means you could ship faster or the target is too easy.' },
          { q: 'Why are postmortems blameless?', o: ['Blame makes people hide information; fixing the system prevents recurrence', 'To avoid writing action items', 'Because incidents have no causes', 'To speed up the timeline'], a: 0, e: 'Assume people acted sensibly with what they knew and fix the system.' }]
    },
    dora: {
      say: 'DORA metrics measure delivery outcomes. Throughput: change lead time, deployment frequency and failed deployment recovery time. Instability: change fail rate and, since 2024, deployment rework rate. Speed and stability move together, and small batches improve both. Use them for team learning, never to rank teams or people. The 2025 report replaced the elite ladder with archetypes.',
      k: ['change lead time', 'deployment frequency', 'failed deployment recovery time', 'change fail rate', 'deployment rework rate', 'small batches', 'SPACE', 'Goodhart\'s law'],
      p: ['Recovery time replaced MTTR in 2023; rework rate added in 2024.', 'Tag every deploy with service, version, SHA, environment; link incidents to changes.', 'Use medians, one service at a time, trends over months.', '2025: per-metric benchmarks and seven team archetypes instead of elite-to-low clusters.'],
      f: [['What are the DORA metrics today?', 'Five: change lead time, deployment frequency, failed deployment recovery time (throughput), and change fail rate and deployment rework rate (instability).'],
          ['How can DORA metrics be misused?', 'Ranking teams, using them in individual reviews, or setting top-down targets. Teams then game them, e.g. splitting deploys or not logging incidents.'],
          ['What is the SPACE framework?', 'Productivity cannot be one number. Pick metrics from at least three of Satisfaction, Performance, Activity, Communication and Efficiency/flow, mixing surveys and system data.'],
          ['How do you measure change lead time?', 'Median of production deploy time minus commit time for the commits that deploy shipped.']],
      q: [{ q: 'Which DORA metric was added in 2024?', o: ['Deployment frequency', 'Change lead time', 'Change fail rate', 'Deployment rework rate'], a: 3, e: 'Rework rate counts unplanned deploys made to fix production incidents.' },
          { q: 'What does DORA research say about speed vs stability?', o: ['You must trade one for the other', 'They move together; top performers do well on both', 'Stability matters only for banks', 'Speed always increases failures'], a: 1, e: 'Small batches improve both throughput and stability.' }]
    },
    chaos: {
      say: 'Chaos engineering injects real failures in a controlled experiment to prove resilience. Define steady state, write a hypothesis, inject one fault with the smallest useful blast radius and automated abort conditions such as an SLO burn-rate alarm. Start in staging, then production. Game days add people: on-call responds with real alerts and runbooks. Experiments spend error budget, so no budget means no chaos.',
      k: ['steady state', 'hypothesis', 'blast radius', 'abort conditions', 'game day', 'error budget', 'Azure Chaos Studio / AWS FIS', 'Polly chaos strategies'],
      p: ['Hypothesis first; without it, it is just an outage.', 'Common faults: latency, dependency failure, instance/zone loss, resource exhaustion.', 'Use the SLO burn rate as an automatic abort condition.', 'Polly v8 chaos strategies are on as soon as added: gate them with config.'],
      f: [['What are the parts of a chaos experiment?', 'Steady state (measurable normal), a hypothesis, a fault with a limited blast radius, abort conditions and a duration, then learn and fix.'],
          ['Chaos experiment vs game day?', 'An experiment tests a technical hypothesis and can be automated. A game day is a team exercise where on-call responds with real alerts and runbooks, followed by a blameless review.'],
          ['How does chaos link to error budgets?', 'Experiments spend error budget on purpose. Run them only while budget remains, and abort when the burn rate passes an agreed threshold.'],
          ['Which Polly APIs inject chaos in .NET?', '<code>AddChaosFault</code>, <code>AddChaosLatency</code>, <code>AddChaosOutcome</code> and <code>AddChaosBehavior</code> from Polly.Core, placed last in the resilience pipeline.']],
      q: [{ q: 'When should you NOT run a chaos experiment yet?', o: ['After adding retries and failover', 'Before a peak trading event', 'When there is no observability to see the impact', 'When on-call needs practice'], a: 2, e: 'Without SLIs and alerts you cannot tell whether the hypothesis held or when to abort.' },
          { q: 'Where should Polly chaos strategies go in a resilience pipeline?', o: ['First, before retry', 'Last, closest to the real call', 'In a separate HttpClient', 'Only in unit tests'], a: 1, e: 'Placed last, the retry and timeout strategies further out must handle the injected faults.' }]
    }
  }
};
