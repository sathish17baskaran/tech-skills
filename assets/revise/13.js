/* Quick-revision data for 13-architecture-practice.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['13'] = {
  approach: [
    ['Anchor on the business', 'Start from capabilities and value streams: what the business does and where value or risk sits.'],
    ['Make qualities measurable', 'Turn "fast and secure" into quality-attribute scenarios with a response measure; rank them in a utility tree.'],
    ['Choose per workload, not per estate', 'One 7 Rs or modernisation option per application, based on value, fit and deadlines.'],
    ['Move in small, reversible steps', 'Transition architectures, waves, strangler fig, parallel run and reconciliation; always a route back.'],
    ['Design the teams with the system', 'Conway\'s law: align stream-aligned teams to the boundaries you want; platforms cut cognitive load.'],
    ['Evolve without breaking consumers', 'Additive change, tolerant readers, contracts, compatibility modes, Deprecation and Sunset.'],
    ['Close with trade-offs and an ADR', 'Name what you gave up, who decided, and the fitness function or metric that guards it.']
  ],
  traps: [
    'Proposing a big-bang rewrite or a big-bang target state with no value-delivering transitions.',
    'Writing NFRs like "must be fast" with no measurable response.',
    'Refactoring during a large data-centre exit instead of migrating first, modernising second.',
    'Ignoring team structure and cognitive load when drawing service boundaries.',
    'Copying a reference architecture diagram without its reasoning, cost or your own NFRs.'
  ],
  sections: {
    ea: {
      say: 'Enterprise architecture tools turn "what does the business do and what runs it" into decisions. Start with a stable capability map, heat-map it one lens at a time, rationalise apps with TIME, then roadmap through transition architectures that each deliver value. The trade-off: a heat map is only as good as its measure.',
      k: ['business capability map', 'value stream', 'heat map', 'TIME model', 'transition architecture', 'technology radar', 'architecture principles'],
      p: ['Capabilities describe what, not how or who; the map stays stable for years.', 'Heat-map one measure at a time and state the measure, source and date.', 'Every transition architecture must run in production and deliver value: no big bang.', 'Principles without implications are slogans.'],
      f: [
        ['What is a business capability and how does it differ from a process?', 'A capability is what the business does, e.g. Payment initiation, independent of people, process and systems. A process is how it is done and changes far more often, so capabilities are the stable anchor.'],
        ['Explain the TIME model.', 'Gartner portfolio model on business value and technical fit: Tolerate (low value, high fit), Invest (high, high), Migrate (high value, low fit), Eliminate (low, low).'],
        ['Where should the modernisation money go on a heat map?', 'Overlay the lenses: capabilities with high business value and poor technical health are where investment pays off.'],
        ['What are the rings of a technology radar?', 'Adopt, Trial, Assess and Caution (called Hold before Thoughtworks renamed it in April 2026), across quadrants of techniques, tools, platforms, and languages and frameworks.']
      ],
      q: [
        { q: 'An application has high business value but poor technical fit. What does the TIME model suggest?', o: ['Tolerate', 'Invest', 'Migrate', 'Eliminate'], a: 2, e: 'High value with low fit means Migrate: modernise it or move it to a new platform.' },
        { q: 'What must be true of every transition architecture on a roadmap?', o: ['It is documented in TOGAF notation', 'It runs on its own in production and delivers value', 'It lasts exactly one year', 'It replaces all legacy systems at once'], a: 1, e: 'Transitions are stable plateaus that deliver value, which avoids a risky big-bang target.' }
      ]
    },
    quality: {
      say: 'Quality attributes shape an architecture more than features. I make them measurable with six-part scenarios, rank them in a utility tree by importance and difficulty, walk the top ones through the design in an ATAM-lite workshop to find sensitivity points, trade-off points and risks, then automate them as fitness functions.',
      k: ['quality-attribute scenario', 'response measure', 'utility tree', 'ATAM', 'sensitivity point', 'trade-off point', 'fitness function', 'ISO/IEC 25010'],
      p: ['Scenario parts: source, stimulus, artifact, environment, response, measure.', 'Rate scenarios (importance, difficulty) H/M/L; analyse (H,H) first.', 'ISO/IEC 25010:2023 has nine characteristics: interaction capability, flexibility, and new safety.', 'If you cannot write a response measure, it is not a requirement yet.'],
      f: [
        ['Sensitivity point vs trade-off point?', 'A sensitivity point strongly affects one attribute, e.g. Kafka partition count drives consumer throughput. A trade-off point affects two attributes in opposite ways, e.g. sync cross-region replication improves RPO but worsens latency.'],
        ['What are the six parts of a quality-attribute scenario?', 'Source, stimulus, artifact, environment, response and response measure. The measure is what makes it testable.'],
        ['What does an ATAM-lite workshop produce?', 'Risks grouped into themes, new or updated ADRs and follow-up spikes, after walking the top 5-8 utility-tree scenarios through the design.'],
        ['Give two examples of fitness functions.', 'An ArchUnitNET rule that the domain must not reference infrastructure on every build, and a nightly load test that fails the pipeline if p95 exceeds budget.'],
        ['What changed in ISO/IEC 25010:2023?', 'Usability became interaction capability, portability became flexibility (now including scalability), and safety was added, giving nine characteristics.']
      ],
      q: [
        { q: 'Synchronous cross-region replication improves RPO but adds write latency. In ATAM terms this decision is a...', o: ['Sensitivity point', 'Trade-off point', 'Non-risk', 'Utility tree leaf'], a: 1, e: 'It affects two attributes in opposite directions, which is the definition of a trade-off point.' },
        { q: 'Why turn top quality scenarios into fitness functions?', o: ['To replace ADRs', 'So the attribute is checked automatically and cannot silently degrade', 'To satisfy ISO certification', 'To avoid writing NFRs'], a: 1, e: 'Fitness functions run in CI or on a schedule, so the review does not end when the meeting does.' }
      ]
    },
    migration: {
      say: 'Cloud migration is one decision per workload using the 7 Rs: retire, retain, rehost, relocate, replatform, repurchase, refactor. For a big exit, migrate first and modernise second, move in dependency-based waves onto an existing landing zone, and treat cutover as rehearsed and reversible with hypercare afterwards.',
      k: ['7 Rs', 'rehost', 'replatform', 'repurchase', 'landing zone', 'migration waves', 'point of no return', 'hypercare'],
      p: ['AWS advises against refactoring during a large migration.', 'Waves follow dependencies, not org charts; chatty apps move together.', 'At least two dress rehearsals; rollback criteria, one decision-maker, a time box.', 'The source is not migrated until it is switched off and its costs stop.'],
      f: [
        ['Which strategy would you choose for a large data-centre exit?', 'Mostly rehost, relocate and replatform, plus retire anything unused and retain what compliance blocks, with a review date. Move first, stabilise, then modernise what justifies it.'],
        ['What goes into a cutover rollback plan?', 'Written criteria, one named decision-maker, a time box and a clear point of no return, with reverse sync running until then.'],
        ['Replatform vs refactor?', 'Replatform swaps to managed DB or containers with small code changes. Refactor re-architects for cloud-native and only pays off with a strong case.'],
        ['When do you exit hypercare?', 'On agreed exit criteria, for example 10 days without a P1 or P2, after a war room with extra alerts and a fast fix path.']
      ],
      q: [
        { q: 'A workload must leave the data centre in 6 months and will not change for 2+ years. Which R fits best?', o: ['Refactor', 'Rehost', 'Repurchase', 'Retain'], a: 1, e: 'Rehost (lift and shift) is the fast route for a deadline-driven exit with no planned change.' },
        { q: 'How should migration waves be grouped?', o: ['By org chart', 'Alphabetically by app name', 'By dependencies, so chatty apps move together', 'Largest apps first'], a: 2, e: 'Splitting chatty apps across waves adds latency and risk; dependencies define the waves.' }
      ]
    },
    modernisation: {
      say: 'Modernise legacy and mainframe in small reversible steps: encapsulate with an API facade, stream changes out with CDC as business events, strangle one capability at a time behind the facade, and prove each step with parallel run and reconciliation before switching master. Big-bang core rewrites have a poor track record.',
      k: ['encapsulate', 'API facade', 'strangler fig', 'CDC', 'anti-corruption layer', 'parallel run', 'reconciliation', 'shadow mode'],
      p: ['Gartner options from least to most change: encapsulate, rehost, replatform, refactor, rearchitect, rebuild, replace.', 'Never switch master until reconciliation is clean for an agreed period, including a month-end.', 'Publish business events, not raw table changes.', 'Capture business rules as tests now: COBOL experts are retiring.'],
      f: [
        ['How would you move a capability off a mainframe safely?', 'API facade in front, CDC out, build the new service behind the facade in shadow mode while the mainframe stays master. Reconcile daily through a month-end, switch by segment with a route back, then retire the old code.'],
        ['What does reconciliation check?', 'Counts, amount totals, hash totals and field-level diffs, with a daily break report.'],
        ['Why keep the nightly batch when moving to events?', 'It stays as a reconciliation control while consumers move one by one, until the end.'],
        ['What does an anti-corruption layer do here?', 'Translates legacy codes and record layouts into a clean domain model so they do not leak into new services.']
      ],
      q: [
        { q: 'Which Gartner modernisation option has the least change and gives freedom to change what is behind it later?', o: ['Rebuild', 'Encapsulate', 'Rearchitect', 'Replace'], a: 1, e: 'Encapsulate wraps existing functions with APIs, so channels stop depending on the legacy interface.' }
      ]
    },
    teams: {
      say: 'Systems mirror the teams that build them, per Conway\'s law, so I design team boundaries alongside the architecture. Use the inverse Conway manoeuvre, default to stream-aligned teams, add platform, enabling and complicated-subsystem teams only to reduce their cognitive load, and aim for X-as-a-Service interactions.',
      k: ['Conway\'s law', 'inverse Conway manoeuvre', 'Team Topologies', 'stream-aligned', 'platform team', 'cognitive load', 'X-as-a-Service', 'golden paths'],
      p: ['Four team types: stream-aligned, platform, enabling, complicated-subsystem.', 'Three interaction modes: collaboration (time-box it), X-as-a-Service, facilitating.', 'Platforms remove extraneous load; treat the platform as a product with DORA metrics.', 'If the team map and architecture do not match, one will change.'],
      f: [
        ['What is the inverse Conway manoeuvre?', 'Designing the team structure first, for example long-lived stream-aligned teams per domain, so the architecture you want, such as independent services, emerges.'],
        ['Name the three kinds of cognitive load.', 'Intrinsic (the problem itself), extraneous (tooling and process friction) and germane (learning the domain). Platforms should remove extraneous load.'],
        ['What does an enabling team do?', 'Specialists coach other teams in a new skill for a limited time, then move on. They coach rather than do the work.'],
        ['What is Backstage?', 'An open-source developer portal created at Spotify, now a CNCF incubating project, with a software catalog, templates and TechDocs.']
      ],
      q: [
        { q: 'A team needs to learn a new capability quickly. Which interaction mode fits?', o: ['X-as-a-Service', 'Facilitating', 'Permanent collaboration', 'Hand-off'], a: 1, e: 'Facilitating is the enabling-team mode: coach the team until it can do it alone.' }
      ]
    },
    evolution: {
      say: 'Evolve APIs and events without breaking consumers: prefer additive changes with tolerant readers, use expand and contract, verify with consumer-driven contracts, know your schema-registry compatibility mode, version only when you must, and retire with Deprecation and Sunset headers. A new major version is a migration project for every consumer.',
      k: ['additive change', 'tolerant reader', 'expand / contract', 'consumer-driven contracts', 'BACKWARD compatibility', 'schema registry', 'Deprecation header', 'Sunset header'],
      p: ['BACKWARD (Confluent default): upgrade consumers first. FORWARD: producers first.', 'Use TRANSITIVE modes for long-retention or replayed topics.', 'Deprecation (RFC 9745) = stop building on this; Sunset (RFC 8594) = stops working on this date.', 'Adding an enum value clients switch on is a breaking change.'],
      f: [
        ['Schema registry BACKWARD vs FORWARD: which side upgrades first?', 'BACKWARD means the new schema reads old data, so upgrade consumers first. FORWARD means old schemas read new data, so upgrade producers first. FULL allows either order.'],
        ['Name three breaking API changes.', 'Removing or renaming a field, making an optional field required, changing a type or unit. Also tightening validation or adding an enum value clients switch on.'],
        ['Deprecation vs Sunset header?', 'Deprecation (RFC 9745) gives the date it was or will be deprecated, behaviour unchanged. Sunset (RFC 8594) gives the date after which it may stop responding; it must not be earlier than deprecation.'],
        ['What is expand / contract?', 'Add the new field next to the old one, move consumers over, then remove the old field. Also called parallel change.'],
        ['Protobuf evolution rule?', 'Never reuse or change a field number; mark removed numbers and names as reserved.']
      ],
      q: [
        { q: 'A Kafka topic uses the BACKWARD compatibility mode. Which side should you upgrade first?', o: ['Producers', 'Consumers', 'Either, in any order', 'The schema registry itself'], a: 1, e: 'BACKWARD means the new schema can read data written with the old one, so consumers move first.' },
        { q: 'Which change is usually non-breaking for a REST API?', o: ['Rename a response field', 'Make an optional field required', 'Add an optional request field', 'Change status codes'], a: 2, e: 'Adding optional fields is additive; the others break existing clients.' }
      ]
    },
    frontend: {
      say: 'Choose rendering per page type: SSG for content, SSR or SPA for logged-in screens, islands for content with a few widgets. Put a BFF per client experience to keep tokens server-side, a gateway with WAF at the edge, cache at the CDN, and design mobile offline-first. Micro-frontends solve team scaling, at a performance cost.',
      k: ['SPA', 'SSR', 'SSG', 'islands', 'BFF', 'micro-frontends', 'edge compute', 'offline-first'],
      p: ['BFF keeps tokens out of the browser, only a secure cookie.', 'Micro-frontends are worth it only with many teams and real release friction.', 'Offline-first = local DB + sync queue + idempotency + a conflict rule per entity.', 'Never execute a payment offline: queue the intent, confirm online with an idempotency key.'],
      f: [
        ['When are micro-frontends worth it?', 'When several teams share one large web app and the release train really slows them. They cost duplicated dependencies, slower pages and consistency; with one or two teams use a modular front-end.'],
        ['Why use a BFF?', 'One backend per client experience aggregates calls and keeps tokens on the server, with only a secure cookie in the browser, and lets each channel change at its own pace.'],
        ['Which conflict strategy for offline edits involving money?', 'Server decides or ask the user: reject with 409 and show both versions. Last writer wins can silently lose edits.'],
        ['Name the Blazor Web App render modes.', 'Static SSR, Interactive Server (SignalR circuit), Interactive WebAssembly and Interactive Auto, chosen per page or component.']
      ],
      q: [
        { q: 'Which rendering option best suits a public interest-rates page that changes rarely?', o: ['SPA', 'SSR per request', 'SSG on a CDN', 'Interactive Server'], a: 2, e: 'Static generation at build time, served from a CDN, is fastest and cheapest for content that changes rarely.' }
      ]
    },
    katas: {
      say: 'Reference architectures give a proven starting point; katas give practice. Start from a published design, check its date, map it to your NFRs and standards, and record deviations in ADRs. In a kata, pick the top three characteristics before drawing, sketch against the clock, name what you gave up and end with an ADR.',
      k: ['reference architecture', 'architecture kata', 'Ted Neward', 'architecture characteristics', 'time box', 'ADR', 'deviation'],
      p: ['A reference architecture is where your design starts, not where it ends.', 'Samples often show the premium tier: check cost.', '"Reference" does not mean "approved" in your organisation.', 'In a kata the diagram matters least; the characteristics and trade-offs matter most.'],
      f: [
        ['How do you use a reference architecture well?', 'Check its date and services, map it to your NFRs and regulatory needs, swap in your identity, network and logging standards, and record every deviation in an ADR.'],
        ['How do you run a solo kata?', 'Set a 45-minute timer, speak your reasoning aloud, write the top three characteristics before drawing, finish with an ADR and risks, then redo it next day with a different top three.'],
        ['What do you score a team kata on?', 'Reasoning and trade-offs, not boxes and arrows. Each team pitches for 3 minutes while others play the client and challenge.']
      ],
      q: [
        { q: 'What should you do first in an architecture kata?', o: ['Draw the deployment diagram', 'Pick the top three architecture characteristics', 'Choose a cloud provider', 'Estimate cost'], a: 1, e: 'Characteristics drive every later choice; picking them before drawing keeps the design anchored.' }
      ]
    },
    platform: {
      say: 'An internal developer platform is a product whose customers are developers. A platform team offers golden paths, templates, environments and pipelines as self-service, starting from the thinnest viable platform. A portal like Backstage adds a software catalog and scorecards. I measure adoption, lead time, DORA and developer satisfaction, and avoid mandated or ticket-ops platforms.',
      k: ['platform as a product', 'golden path', 'paved road', 'self-service', 'thinnest viable platform', 'Backstage', 'software catalog', 'cognitive load'],
      p: ['Golden paths are the easiest route, not the only route.', 'Platform team serves stream-aligned teams X-as-a-Service and removes extraneous load.', 'Measure adoption, lead time, DORA metrics and developer satisfaction.', 'Anti-patterns: a mandated platform nobody wants, a portal that just files tickets.'],
      f: [
        ['What is a golden path?', 'An opinionated, supported route for a common task, e.g. a new API, with security, logging, pipelines and policy built in. Optional, but the easiest way.'],
        ['What is the thinnest viable platform?', 'The smallest set of APIs, docs and tools that speeds teams up, sometimes just a wiki page and a template. Grow it from real demand.'],
        ['What does Backstage give you?', 'An open-source developer portal (CNCF incubating): software catalog of services and owners, software templates, TechDocs, and scorecards via plugins.'],
        ['How do you build a .NET golden-path template?', 'A <code>dotnet new</code> template package: <code>.template.config/template.json</code> with shortName and sourceName, packed with PackageType Template; optionally an Aspire AppHost for local dev.']
      ],
      q: [
        { q: 'Developers fill in a portal form that creates a ticket for the infra team. What is this?', o: ['A golden path', 'Ticket-ops dressed up as self-service', 'The thinnest viable platform', 'X-as-a-Service'], a: 1, e: 'Self-service means APIs, templates and pipelines that act immediately; a form that queues a ticket keeps the hand-off.' },
        { q: 'Which measure best shows an internal developer platform is succeeding?', o: ['Number of platform features shipped', 'Size of the platform team', 'Voluntary adoption and shorter lead time', 'Number of tools in the portal'], a: 2, e: 'Platforms are products: adoption, lead time, DORA and developer satisfaction show real value.' }
      ]
    }
  }
};
