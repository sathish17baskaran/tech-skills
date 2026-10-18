/* Quick-revision data for 12-architecture-documents.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['12'] = {
  approach: [
    ['Name the document and its question', 'ACD: why and what concept? AIA: what impact and risk? SO/HLD: what solution? LLD: how to build? ADR: why X over Y? SOP: how to operate?'],
    ['Say who reads it and when', 'Audience and lifecycle stage set the level of detail: low for sponsors, high for developers.'],
    ['List the core contents', 'Context diagram, options, NFRs, integrations, data, security, deployment, risks, linked ADRs.'],
    ['Make it measurable and visual', 'C4 diagrams first; NFRs as numbers (p95, availability, RPO/RTO); trade-offs stated openly.'],
    ['Show governance', 'Risk rating drives fast-track vs full review; guardrails and paved roads over gates; ADRs for exceptions.'],
    ['Close with how it stays alive', 'Docs in the repo, diagrams as code, generated artefacts, owner and review date.']
  ],
  traps: [
    'Stopping at "it depends" without naming the drivers.',
    'Writing NFRs like "the system should be fast" instead of measurable targets.',
    'Editing an accepted ADR instead of superseding it.',
    'Presenting the same level of detail to executives and engineers.',
    'Signing a vendor deal with no exit plan.'
  ],
  sections: {
    lifecycle: {
      say: 'Architecture documents get more detailed as an initiative moves from idea to operations: ACD for the concept, AIA for impact and governance, SO or HLD for the solution, LLD for build detail, then SOPs and runbooks to operate. ADRs are written at any stage, one per significant decision.',
      k: ['ACD', 'AIA', 'SO / HLD', 'LLD', 'ADR', 'SOP / runbook', 'audience'],
      p: ['Detail rises from low (ACD) to high (LLD).', 'ADRs: one per significant decision, at any stage.', 'Acronyms vary by organisation: keep the purpose, adjust the names.'],
      f: [
        ['Which document answers "why are we doing this?"', 'The ACD: problem, business drivers, scope and target concept, read by business sponsors and enterprise architects.'],
        ['Order the main documents from idea to operations.', 'ACD, AIA, SO or HLD, LLD, build and test, then SOP or runbook. ADRs run throughout.']
      ],
      q: [{ q: 'Which document is aimed mainly at developers and testers, with the highest level of detail?', o: ['LLD', 'ACD', 'AIA', 'SO'], a: 0, e: 'The LLD is the developer-ready blueprint: contracts, schemas, error handling and test approach.' }]
    },
    acd: {
      say: 'The ACD, Architecture Concept or Context Document, is the earliest architecture artefact. It frames the problem, business drivers, scope, current state and target concept, with high-level options and a recommended direction. Keep it short and visual: its job is agreement on direction, not design detail.',
      k: ['problem statement', 'business drivers', 'scope in / out', 'as-is / to-be', 'context diagram', 'options', 'strategic alignment'],
      p: ['One context diagram (C4 level 1) beats pages of text.', 'Capture options early so later reviews do not reopen them.', 'Include assumptions, constraints, dependencies and risks.'],
      f: [
        ['What goes in an ACD?', 'Problem and drivers, scope and stakeholders, as-is context, to-be concept and affected capabilities, high-level options with a recommended direction, assumptions, constraints, risks and strategic alignment.'],
        ['Why record options in the ACD?', 'So later reviews do not reopen decisions that were already weighed and agreed.']
      ],
      q: [{ q: 'What is the main job of an ACD?', o: ['Specify database schemas', 'Describe operating procedures', 'Record a single technical decision', 'Get agreement on the problem and direction'], a: 3, e: 'The ACD frames the problem and target concept so stakeholders agree on direction before detailed design.' }]
    },
    aia: {
      say: 'An AIA, Architecture Impact Assessment, assesses how a change affects existing applications, interfaces, data, security, operations and cost, then gives a risk rating that decides the governance path: fast-track or full review board. In AI programmes AIA can also mean AI Impact Assessment.',
      k: ['change classification', 'impacted systems', 'data classification / PII', 'regulatory obligations', 'technical debt', 'risk rating', 'governance path'],
      p: ['Risk rating decides fast-track vs full review board.', 'Be honest: impacts found later cost much more.', 'AI Impact Assessment covers fairness, transparency, data use, oversight, model risk.'],
      f: [
        ['What decides the governance path in an AIA?', 'The risk rating, based on the change classification and its impact on systems, data, security and operations: low risk can fast-track, high risk goes to the full review board.'],
        ['Which data impacts does an AIA check?', 'Data classification, PII, residency and retention.']
      ],
      q: [{ q: 'An AIA rates a change as low risk and minor. What usually follows?', o: ['A full architecture review board', 'A new ACD', 'A fast-track governance path', 'Immediate production deployment without review'], a: 2, e: 'The AIA risk rating sets the governance path; low-risk changes take the lighter fast-track route.' }]
    },
    so: {
      say: 'The Solution Outline describes the proposed solution: components, integrations, data flows, security, deployment and HA/DR, and how it meets functional and non-functional requirements. It bridges concept and detailed design. Show options, key decisions with linked ADRs, and the trade-offs you accept.',
      k: ['requirements summary', 'C4 level 2', 'build vs buy', 'integration patterns', 'security architecture', 'HA / DR', 'options analysis'],
      p: ['Explain how each NFR is met, e.g. availability target to zone redundancy plus DR region.', 'Reviewers trust designs that admit their weaknesses.', 'Link ADRs for key decisions.'],
      f: [
        ['How should an SO handle NFRs?', 'Map each NFR to the design feature that meets it, e.g. 99.95% availability via zone redundancy and a DR region, not just list them.'],
        ['What integration detail belongs in an SO?', 'Interfaces, patterns (sync, async, batch) and protocols at overview level; exact contracts belong in the LLD.']
      ],
      q: [{ q: 'Which C4 level is typical for the main diagram in a Solution Outline?', o: ['Level 1 Context only', 'Level 2 Container', 'Level 3 Component', 'Level 4 Code'], a: 1, e: 'An SO shows the apps, APIs, databases and queues: the container level. Component and code levels belong in the LLD.' }]
    },
    hld: {
      say: 'The HLD is the system-level design: major components, interactions, technology choices and deployment topology, with logical and physical diagrams and sequence diagrams for key flows. It also covers cross-cutting concerns like logging, monitoring, security and resilience. In many organisations the SO and HLD are one document.',
      k: ['logical / physical diagram', 'sequence diagrams', 'technology stack', 'deployment topology', 'cross-cutting concerns', 'architecture tests'],
      p: ['SO and HLD are often merged.', 'Cross-cutting: logging, monitoring, security, resilience.', 'Architecture tests (ArchUnitNET) can enforce the HLD layering in CI.'],
      f: [
        ['HLD vs LLD?', 'HLD covers which components exist and how they interact (system view). LLD covers how each component is built: contracts, schemas, logic and error handling (developer view).'],
        ['How can you stop code drifting from the HLD?', 'Encode layering rules as architecture tests that fail the build, and describe the topology as code (e.g. an Aspire AppHost).']
      ],
      q: [{ q: 'Which of these belongs in an HLD rather than an LLD?', o: ['Table indexes and partitioning', 'Validation rules per field', 'Deployment topology and component interactions', 'Alert definitions per metric'], a: 2, e: 'The HLD is the system view: components, interactions, technology and topology. Field-level detail is LLD.' }]
    },
    lld: {
      say: 'The LLD is the developer-ready blueprint: component internals, API contracts, message schemas, database schema, detailed sequences including error paths, validation, retries, idempotency, configuration, logging and test approach. Keep it close to the code, in the repo, and prefer generated artefacts like OpenAPI and DDL over hand-copied tables.',
      k: ['OpenAPI contract', 'message schemas', 'database schema', 'error paths', 'idempotency / retries', 'feature flags', 'docs as code'],
      p: ['Detailed enough to build and test without guessing.', 'Include error handling, retries, idempotency and timeouts.', 'Generated artefacts do not drift; hand-copied tables do.'],
      f: [
        ['Name five things an LLD must contain.', 'API contracts, message schemas, database schema with keys and indexes, sequence diagrams including error paths, and error handling with retries, idempotency and timeouts. Also config, logging and test approach.'],
        ['How do you keep an LLD from drifting?', 'Store it in the repo as Markdown with diagrams as code, and generate OpenAPI and schema DDL from the code instead of copying them.']
      ],
      q: [{ q: 'What is the best way to keep the API contract in an LLD accurate?', o: ['Generate the OpenAPI document from the code', 'Copy it into a Word table each release', 'Describe it in prose only', 'Leave it to the testers'], a: 0, e: 'Generated artefacts stay in sync with the code; hand-maintained tables drift.' }]
    },
    adr: {
      say: 'An ADR is a short, immutable record of one significant decision: its context, the options, the choice and its consequences. Write one for decisions that are hard to reverse or often questioned. Never edit an accepted ADR; supersede it with a new one so the history stays.',
      k: ['context', 'decision', 'consequences', 'status', 'supersede', 'Nygard format', 'MADR'],
      p: ['Write ADRs for hard-to-reverse or often-questioned decisions.', 'Never edit an accepted ADR: supersede it.', 'Store them in the repo, e.g. /docs/adr.'],
      f: [
        ['When do you write an ADR?', 'For any decision that is significant, costly to reverse or likely to be questioned later: technology choice, integration pattern, data store, security approach.'],
        ['A team wants to change an accepted ADR. What do you do?', 'Write a new ADR that supersedes it and mark the old one superseded, so the reasoning history is kept.']
      ],
      q: [{ q: 'Six months later the team reverses a decision recorded in an accepted ADR. What is the right action?', o: ['Edit the original ADR', 'Delete the original ADR', 'Record it only in meeting minutes', 'Write a new ADR that supersedes it'], a: 3, e: 'ADRs are immutable. A superseding ADR keeps the full history of why things changed.' }]
    },
    sop: {
      say: 'An SOP gives step-by-step instructions for a routine operational task so anyone trained does it the same way every time. It covers purpose, roles, prerequisites, numbered steps with expected results, verification, rollback, escalation, and an owner and review date.',
      k: ['purpose and scope', 'RACI', 'prerequisites', 'numbered steps', 'verification', 'rollback', 'escalation', 'review date'],
      p: ['Each step has an expected result.', 'Always include rollback or exception handling.', 'Examples: certificate rotation, DR failover test, DLQ replay.'],
      f: [
        ['Give three examples of SOPs.', 'Certificate renewal and rotation, the monthly DR failover test, onboarding a new API consumer in APIM, replaying messages from a DLQ, patching and release deployment.'],
        ['What makes an SOP usable at 3 a.m.?', 'Prerequisites and access listed up front, numbered steps with expected results, clear verification, rollback, and escalation contacts.']
      ],
      q: [{ q: 'Which section is essential in an SOP so an operator can recover if a step goes wrong?', o: ['Business drivers', 'Rollback or exception handling', 'Options analysis', 'Architecture diagram'], a: 1, e: 'SOPs must say how to back out or handle exceptions, not just the happy path.' }]
    },
    nfr: {
      say: 'Functional requirements say what the system does; NFRs say how well it does it. Cover performance, availability, scalability, recoverability, security, compliance, observability, maintainability and cost, and make every one measurable, for example p95 under 300 ms at 500 TPS, or RPO 5 minutes and RTO 1 hour.',
      k: ['p95 latency', 'availability %', 'RPO / RTO', 'scalability', 'security', 'compliance', 'observability', 'cost per transaction'],
      p: ['Bad: "should be fast". Good: "95% of balance enquiries within 300 ms at 1,000 req/s".', 'Availability needs a window and exclusions, e.g. 99.95% monthly excl. planned maintenance.', 'Prove performance NFRs with load tests before go-live.'],
      f: [
        ['Rewrite "the system should be fast" as an NFR.', '"95% of balance enquiries respond within 300 ms at 1,000 requests per second."'],
        ['Name six NFR categories.', 'Performance, availability, scalability, recoverability, security, compliance, observability, maintainability and cost.']
      ],
      q: [{ q: 'Which is a well-formed NFR?', o: ['p95 latency under 300 ms at 500 TPS', 'The system should be highly available', 'The API should be quick for users', 'The system must scale as needed'], a: 0, e: 'A good NFR is measurable: a percentile, a threshold and the load it applies at.' }]
    },
    c4: {
      say: 'The C4 model gives four zoom levels of diagrams, like Google Maps for software: context, container, component and code. The ACD uses level 1, SO and HLD use levels 1 and 2, and the LLD levels 3 and 4. Write them as code with Structurizr, PlantUML or Mermaid.',
      k: ['Context', 'Container', 'Component', 'Code', 'zoom levels', 'diagrams as code', 'Structurizr'],
      p: ['Level 4 (code) is rarely drawn.', 'Container = apps, APIs, databases, queues.', 'Diagrams as code live in the repo and render in CI.'],
      f: [
        ['Name the four C4 levels.', 'Context (system, users, external systems), Container (apps, APIs, databases, queues), Component (modules inside one container), Code (classes, rarely drawn).'],
        ['Which C4 level goes in which document?', 'ACD: level 1. SO/HLD: levels 1-2. LLD: levels 3-4.']
      ],
      q: [{ q: 'A diagram shows the web app, the API, the database and a message queue. Which C4 level is it?', o: ['Context', 'Component', 'Code', 'Container'], a: 3, e: 'Separately deployable apps and data stores are containers in C4.' }]
    },
    threat: {
      say: 'Threat modelling means systematically asking "what could go wrong?" on your data-flow diagram before attackers do. STRIDE gives the categories: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service and Elevation of privilege, each with a typical control.',
      k: ['STRIDE', 'data-flow diagram', 'spoofing', 'tampering', 'repudiation', 'information disclosure', 'denial of service', 'elevation of privilege'],
      p: ['Spoofing: MFA, mTLS. Tampering: signatures, TLS.', 'Repudiation: audit logs, signing.', 'Elevation of privilege: least privilege, authZ checks.'],
      f: [
        ['What does STRIDE stand for?', 'Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.'],
        ['Which STRIDE threat do audit logs address?', 'Repudiation: a user denying they performed an action. Logs and signing provide proof.']
      ],
      q: [{ q: 'A user claims they never approved a payment, and there is no record either way. Which STRIDE threat is this?', o: ['Spoofing', 'Tampering', 'Repudiation', 'Elevation of privilege'], a: 2, e: 'Repudiation is denying an action; audit logs and signatures are the control.' }]
    },
    runbook: {
      say: 'An SOP covers routine, planned tasks. A runbook gives specific operational or incident steps for one system or alert, such as what to do when DLQ depth exceeds 100, and is often automated. A playbook is a broader cross-team response strategy for a scenario like a cyber incident or regional outage.',
      k: ['SOP', 'runbook', 'playbook', 'alert-driven', 'automation', 'cross-team response'],
      p: ['SOP = how we always do X.', 'Runbook = one system or alert, often automated.', 'Playbook = scenario-level strategy across teams.'],
      f: [
        ['Runbook vs playbook?', 'A runbook is the specific steps for one system or alert. A playbook is the broader strategy across teams for a scenario such as a cyber incident or regional outage.'],
        ['"If DLQ depth is over 100, do..." Which document is that?', 'A runbook: specific incident steps tied to one alert, often automated.']
      ],
      q: [{ q: 'Which document coordinates several teams during a regional cloud outage?', o: ['SOP', 'Playbook', 'Runbook', 'ADR'], a: 1, e: 'Playbooks cover scenario-wide response strategy across teams; runbooks are per system or alert.' }]
    },
    frameworks: {
      say: 'TOGAF is a framework for running enterprise architecture; its ADM cycles from Vision through Business, Information Systems and Technology architectures to migration planning, governance and change, with requirements management at the centre. Well-Architected, from Azure and AWS, is a pillar-based checklist for reviewing cloud workloads.',
      k: ['TOGAF ADM', 'architecture vision', 'requirements management', 'migration planning', 'Well-Architected pillars', 'reliability / security / cost'],
      p: ['ADM phases: Preliminary, A Vision, B Business, C Information Systems, D Technology, E Opportunities, F Migration, G Governance, H Change.', 'Azure pillars: Reliability, Security, Cost Optimisation, Operational Excellence, Performance Efficiency.', 'AWS adds a sixth pillar: Sustainability.'],
      f: [
        ['Name the five Azure Well-Architected pillars.', 'Reliability, Security, Cost Optimisation, Operational Excellence and Performance Efficiency. AWS adds Sustainability.'],
        ['What sits at the centre of the TOGAF ADM?', 'Requirements Management, which feeds every phase of the cycle.']
      ],
      q: [{ q: 'Which pillar does AWS Well-Architected have that the Azure list on this page does not?', o: ['Reliability', 'Security', 'Sustainability', 'Cost Optimisation'], a: 2, e: 'AWS adds Sustainability to the five shared pillars.' }]
    },
    softskills: {
      say: 'Architecture is decisions plus persuasion. Never stop at "it depends": name the drivers and which way each pushes. Lead with the recommendation, then the reason and the trade-off you accept, and say what would change your mind. Tailor the depth to the audience, and finish every review with a recorded decision.',
      k: ['"it depends on what"', 'options table', 'recommendation first', 'trade-off accepted', 'influence without authority', 'pre-wire', 'decision memo'],
      p: ['2-3 genuine options including "do nothing", same criteria for each.', 'Executives: one page, decision and risk. Engineers: reasoning and constraints.', 'Say no with data, and offer a "yes, if...".', 'End reviews with decisions, actions, owners, recorded as ADRs.'],
      f: [
        ['How do you present a trade-off to executives vs engineers?', 'Executives: one page, recommendation first, cost, risk and time, and the decision you need. Engineers: the drivers, rejected options and why, diagrams, NFRs and constraints.'],
        ['What are the six parts of a one-page decision memo?', 'Decision and deadline, context, options against the same criteria, recommendation and why, trade-offs accepted, and the ask.'],
        ['How do you influence without authority?', 'Build relationships early, frame proposals around stakeholders\' goals, co-design with the teams who will build it, and pre-wire decisions in 1:1s before the big meeting.']
      ],
      q: [{ q: 'A delivery lead asks "Kafka or Service Bus?". What is the strongest response?', o: ['Name the drivers, score both options, and lead with a recommendation and the accepted trade-off', '"It depends."', 'Pick whichever you used last', 'Ask the vendor to decide'], a: 0, e: 'Turn "it depends" into "it depends on X, Y, Z", then make a recommendation and own the trade-off.' }]
    },
    buildbuy: {
      say: 'Build only what differentiates you; buy or subscribe for commodity capabilities. Compare three-to-five-year TCO, time to market, lock-in, skills and regulatory fit, and write the exit plan before you sign. Manage technical debt deliberately with a register, a budget and fitness functions, and govern with guardrails and paved roads rather than gates.',
      k: ['differentiation', 'TCO 3-5 years', 'exit plan', 'Fowler\'s debt quadrant', 'debt register', 'fitness functions', 'paved road', 'guardrails over gates'],
      p: ['Debt budget: often 15-20% of each sprint or quarter.', 'Only prudent, deliberate debt is a real choice: log it, plan repayment.', 'Teams on the paved road need little review; leaving it needs an ADR.', 'CPS 230: regulated entities must be able to exit a material provider in an orderly way.'],
      f: [
        ['How do you decide build vs buy?', 'Build what differentiates the business, buy or SaaS for commodity. Compare 3-5 year TCO including the team to run it, time to market, lock-in, skills and regulatory fit, and write the exit plan first.'],
        ['What is Fowler\'s technical debt quadrant?', 'Reckless vs prudent crossed with deliberate vs inadvertent. Prudent, deliberate debt ("ship now, fix later") is legitimate if logged and repaid; reckless debt needs better skills and guardrails.'],
        ['What is a fitness function?', 'An automated check in CI that guards an architecture characteristic, such as dependency rules, p95 latency or no vulnerable packages.'],
        ['Guardrails vs gates?', 'Gates are review boards approving every design: slow bottlenecks. Guardrails are automated policies plus paved roads that make the right way the easy way; keep gates for high-risk, hard-to-reverse decisions.']
      ],
      q: [{ q: '"We know the right design, but we\'ll ship this shortcut now and fix it next sprint." Which quadrant is this debt?', o: ['Reckless, deliberate', 'Reckless, inadvertent', 'Prudent, inadvertent', 'Prudent, deliberate'], a: 3, e: 'A conscious, reasoned shortcut with a repayment plan is prudent, deliberate debt.' }]
    }
  }
};
