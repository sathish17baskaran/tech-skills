/* Quick-revision data for 18-system-design-playbook.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['18'] = {
  approach: [
    ['Clarify (~5 min)', 'Pick 2-3 core use cases; NFRs: scale, latency, availability, consistency, security, compliance; constraints and out of scope.'],
    ['Estimate (~3 min)', 'Users to requests/s (average and peak), read:write ratio, storage per year, bandwidth. Let the numbers drive the design.'],
    ['API and data model (~10 min)', 'Main endpoints or events with auth, idempotency and pagination; entities, SQL vs NoSQL and why, partition key, indexes.'],
    ['High-level design (~10 min)', 'Client, edge, gateway, services, data, async. Walk 1-2 key flows end to end.'],
    ['Deep dives (~15 min)', 'Bottlenecks and scaling, failure modes ("what if X dies?"), consistency, security, observability.'],
    ['Wrap up (~5 min)', 'Summarise trade-offs as "I chose X because..., at the cost of...", risks, and how v2 evolves.']
  ],
  traps: [
    'Drawing boxes before clarifying requirements and doing the numbers.',
    'Opening with Kafka, Kubernetes and 12 microservices instead of starting simple.',
    'Making choices without saying the trade-off out loud.',
    'Thinking silently: interviewers score the reasoning, not just the picture.'
  ],
  sections: {
    e2e: {
      say: 'Follow one "Pay" tap: OAuth2 with PKCE login, TLS, DNS and a global load balancer with CDN and WAF, the API gateway for JWT checks and rate limits, a regional load balancer, a stateless payments service with cache, fraud call and ACID database write with an outbox, then events to notifications, ledger and the lakehouse, all wrapped in secrets, observability and CI/CD.',
      k: ['OAuth2 + PKCE', 'WAF / CDN', 'API gateway', 'stateless service', 'idempotency key', 'transactional outbox', 'CDC to lakehouse', 'one trace ID'],
      p: ['Fraud call: gRPC with a 200 ms timeout, fallback = queue for review.', 'DB: ACID transaction + outbox row + Idempotency-Key check.', 'Replicas: sync in-zone, async to the DR region.', 'Ledger consumer is idempotent, with a DLQ on failure.'],
      f: [
        ['Why write an outbox row in the same transaction as the payment?', 'So the payment and the event commit together. A relay then publishes PaymentCompleted, and you never get "saved but event lost" or "event sent but not saved".'],
        ['What does the API gateway do on the payment path?', 'Validates the JWT, applies rate limits and quotas, transforms requests and logs them before routing to the service.'],
        ['What happens if the fraud service is slow?', 'The call has a short timeout (200 ms) and a circuit breaker; the fallback queues the payment for review instead of blocking the user indefinitely.'],
        ['What runs "around everything" in this design?', 'Key Vault and managed identity, OpenTelemetry traces, metrics and logs, SLOs and alerts, CI/CD with canary deploys, IaC, and ADRs, SO/LLD and SOPs.']
      ],
      q: [{ q: 'In the "Pay" journey, how does PaymentCompleted reach notifications and the ledger reliably?', o: ['An outbox row is committed with the payment, then a relay publishes it to a topic', 'The service calls each consumer synchronously', 'The mobile app sends the event', 'A nightly batch job copies payments'], a: 0, e: 'The transactional outbox guarantees the event is published if and only if the payment committed; consumers are idempotent.' }]
    },
    framework: {
      say: 'Use a repeatable seven-step structure for a 45-60 minute design: clarify requirements, estimate, API, data model, high-level design, deep dives and wrap-up. Think aloud, start simple then scale, and state the trade-off every time: "I chose X because..., at the cost of...".',
      k: ['functional / non-functional', 'back-of-the-envelope', 'read:write ratio', 'API design', 'partition key', 'deep dives', 'trade-offs', 'v2 evolution'],
      p: ['Deep dives get the most time (~15 min).', 'The estimate decides if you need caching, sharding or queues.', 'Structure beats brilliance.'],
      f: [
        ['List the seven steps of the framework.', 'Clarify, estimate, API, data model, high-level design, deep dives, wrap-up.'],
        ['What goes in the clarify step?', 'Two or three core use cases, non-functional needs (scale, latency, availability, consistency, security, compliance), constraints, and what is out of scope.'],
        ['What should the wrap-up cover?', 'The key trade-offs, the risks, what you would do next, and how the design evolves in v2.']
      ],
      q: [{ q: 'Which step in the framework should usually get the most time?', o: ['Clarify requirements', 'Back-of-the-envelope estimate', 'Wrap-up', 'Deep dives'], a: 3, e: 'About 15 minutes go to deep dives: bottlenecks, failure modes, consistency, security and observability.' }]
    },
    xvy: {
      say: 'Answer any "X vs Y" question with one formula: define both in a line each, show how each works, compare three or four key differences, give a decision rule for when to pick which, then a real example from your experience.',
      k: ['define both', 'how each works', 'key differences', 'decision rule', 'real example'],
      p: ['Always end with a decision rule, not a list of features.', 'A real example proves you have used both.', 'Queue = command to one consumer; event = fact to many.'],
      f: [
        ['What are the five steps for an "X vs Y" answer?', 'Define both, explain how each works, compare 3-4 differences, give the decision rule, and close with a real example.'],
        ['Answer "queue vs event" in one breath.', 'A queue hands a command to one consumer for load levelling and reliable hand-off; an event broadcasts a fact to many for decoupling and fan-out. Queue for "process this payment", event for "payment completed".']
      ],
      q: [{ q: 'Which step turns an "X vs Y" comparison into a usable answer?', o: ['Listing every feature of both', 'Naming the vendors', 'Giving a decision rule for when to pick which', 'Drawing a detailed class diagram'], a: 2, e: 'Interviewers want to know when you would choose each; the decision rule shows judgement.' }]
    },
    tradeoffs: {
      say: 'Most design choices are either/or trade-offs with a rule of thumb. Sync when the user needs the answer now, async for later work and spikes. SQL for transactions and joins, NoSQL for massive scale with known access patterns. Consistency for money and identity, availability for feeds and catalogues. Start with a monolith for a small team and unclear domain.',
      k: ['sync vs async', 'SQL vs NoSQL', 'consistency vs availability', 'monolith vs microservices', 'orchestration vs choreography', 'REST vs gRPC', 'RAG vs fine-tune', 'workflow vs agent'],
      p: ['Queue for work distribution; event stream for replay and many consumers.', 'Orchestration for complex flows with compensation; choreography for simple flows.', 'REST for public and browser; gRPC for internal low-latency streaming.', 'RAG for changing knowledge and citations; fine-tune for behaviour and style.'],
      f: [
        ['When choose microservices over a monolith?', 'Many teams, clear domain boundaries and a need for independent scaling. With a small team or unclear domain, start with a monolith.'],
        ['Serverless vs containers?', 'Serverless for spiky, event-driven, short tasks; containers for steady load, long-running work and full control.'],
        ['Orchestration vs choreography?', 'Orchestration for complex flows needing visibility and compensation; choreography for simple flows where services stay autonomous.'],
        ['Batch vs stream?', 'Batch for large periodic volumes where cost matters; stream when you need low-latency reactions.']
      ],
      q: [
        { q: 'For an account balance and money transfers, which side of the trade-off do you choose?', o: ['Availability over consistency', 'Consistency over availability', 'Cache over always-fresh', 'Choreography over orchestration'], a: 1, e: 'Money, inventory and identity need consistency; feeds and catalogues can favour availability.' },
        { q: 'You need many consumers that can replay past messages at high throughput. Which fits?', o: ['A point-to-point queue', 'A synchronous REST call', 'An event stream', 'A nightly batch file'], a: 2, e: 'Event streams (Kafka, Event Hubs) keep a log that many consumers can read and replay; queues are for distributing work.' }
      ]
    },
    example: {
      say: 'For a payment notification platform within 5 seconds: TransactionPosted events come from core banking via CDC into a stream partitioned by account, a rules service checks cached preferences, per-channel queues feed channel workers, and history goes to NoSQL keyed by customer. Deliver at least once with a dedupe key, and measure the percentage delivered within 5 seconds.',
      k: ['CDC', 'partition by accountId', 'per-channel queues', 'at-least-once + dedupe', 'circuit breaker per provider', 'DLQ + replay', 'SLO: % within 5 s'],
      p: ['20M transactions/day = about 230/s average, ~1,000/s peak.', 'History: ~20 GB/day, 90 days hot = ~1.8 TB.', 'Dedupe key = transactionId + channel in Redis, TTL 24 h.', 'Set the dedupe key after a successful send, or delete it on failure.'],
      f: [
        ['How do you avoid duplicate pushes?', 'Use at-least-once delivery with idempotent consumers and a dedupe key of transactionId plus channel in Redis with a 24-hour TTL.'],
        ['How do you keep one customer\'s notifications in order?', 'Partition the stream by accountId so each account\'s events are processed in order.'],
        ['What if the SMS provider goes down?', 'A circuit breaker per provider trips, traffic fails over to a backup SMS provider, and failures go to a DLQ for replay.'],
        ['Test scenario: what should you test for the dedupe logic?', 'Replay the same transaction event twice and assert one push per channel; also fail a send after the key is set and check the retry still delivers.']
      ],
      q: [{ q: 'Why choose at-least-once delivery with dedupe instead of exactly-once for notifications?', o: ['At-least-once plus idempotent dedupe gives the same effect far more cheaply', 'Exactly-once is impossible to describe', 'Duplicates do not matter for notifications', 'It removes the need for queues'], a: 0, e: 'True exactly-once delivery is costly; at-least-once with a dedupe key gives an exactly-once effect.' }]
    },
    checklist: {
      say: 'Before presenting or approving a design, run the checklist: scale and performance, reliability, security, integration, operations and governance. Ask whether peak load is known, single points of failure are gone, every call is authenticated, idempotency and DLQs exist, SLOs and tracing are in place, and ADRs and measurable NFRs are written.',
      k: ['peak load', 'SPOF', 'timeouts / retries / circuit breakers', 'RPO / RTO tested', 'secrets in a vault', 'idempotency + DLQ', 'SLOs and alerts', 'ADRs'],
      p: ['Reliability: SPOFs removed, RPO/RTO met and tested.', 'Integration: right style (real-time, near-real-time, batch), versioned contracts.', 'Governance: cost estimated, compliance (APRA, Privacy, PCI) checked.'],
      f: [
        ['Name the six checklist areas.', 'Scale and performance, reliability, security, integration, operations, governance.'],
        ['What does the operations area check?', 'SLOs and alerts, end-to-end tracing, runbooks and SOPs, and a safe deployment strategy.'],
        ['What does the security area check?', 'AuthN and AuthZ on every call, secrets in a vault, data classified and encrypted, and a threat model done.']
      ],
      q: [{ q: 'In a design review, "Are RPO and RTO met and tested?" falls under which area?', o: ['Scale & performance', 'Integration', 'Governance', 'Reliability'], a: 3, e: 'Recovery objectives are reliability concerns, alongside SPOFs and timeouts, retries and circuit breakers.' }]
    }
  }
};
