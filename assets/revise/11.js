/* Quick-revision data for 11-architecture-patterns.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['11'] = {
  approach: [
    ['Clarify the forces', 'Team size and count, domain complexity, scaling differences, change rate, DevOps maturity.'],
    ['Pick the style', 'Modular monolith by default; microservices, serverless or event-driven only when the forces demand it.'],
    ['Draw the boundaries', 'DDD bounded contexts from event storming; database per service; aggregates as consistency units.'],
    ['Design communication', 'Gateway + BFF at the edge, sync for answers you need now, async events for side effects.'],
    ['Handle data across services', 'Sagas with compensation, outbox, CQRS read models, idempotent consumers.'],
    ['Cover resilience and operations', 'Timeouts, retries only if idempotent, circuit breakers, tracing, 12-factor config.'],
    ['Close with trade-offs', 'What complexity you moved where, and how you would migrate (strangler fig).']
  ],
  traps: [
    'Starting with microservices for a small team with unclear boundaries.',
    'Building a distributed monolith: services that share a DB or must deploy together.',
    'Long synchronous call chains of 4+ services.',
    'Applying CQRS, event sourcing or Clean architecture to simple CRUD.',
    'Taking the tenant ID from the request body instead of the token or host.'
  ],
  sections: {
    styles: {
      say: 'An architecture style is the overall shape of a system: how it is split and how parts talk. Options include monolith, layered, modular monolith, SOA, microservices, event-driven, serverless, hexagonal, microkernel, space-based, micro-frontends and cell-based. A modular monolith is a great default; each step towards distribution moves complexity into the network.',
      k: ['modular monolith', 'layered / N-tier', 'microservices', 'event-driven', 'hexagonal', 'microkernel', 'cell-based', 'architecture tests'],
      p: ['Layered: watch for sinkhole layers that only pass calls through.', 'Cell-based: full-stack copies per slice of users limit blast radius.', 'Space-based: in-memory data grid for extreme, spiky scale.', 'Enforce boundaries with NetArchTest or ArchUnitNET in CI.'],
      f: [['Why is a modular monolith a good default?', 'One deployable keeps build, test and deploy simple, while strict module boundaries keep the code clean and ready to extract into services once boundaries are proven.'],
          ['What is cell-based architecture?', 'Running several copies of the full stack, each serving a slice of users, so one failure only affects that cell.'],
          ['When would you use a microkernel style?', 'When a core system needs plug-ins, such as IDEs, browsers or rules engines; in .NET, AssemblyLoadContext loads plug-ins at runtime.']],
      q: [{ q: 'You want a failure in one deployment to affect only 5% of customers. Which style targets that directly?', o: ['Layered N-tier', 'Cell-based architecture', 'Microkernel', 'SOA with an ESB'], a: 1, e: 'Cells are full-stack copies each serving a slice of users, so the blast radius is limited to one cell.' }]
    },
    hexagonal: {
      say: 'Hexagonal, Onion and Clean all put business rules in the middle and make every dependency point inwards. The core owns ports as interfaces, and adapters at the edge implement them: API endpoints, EF Core repositories, broker clients. You test the core in milliseconds, but for simple CRUD it is ceremony, so consider vertical slices.',
      k: ['ports and adapters', 'dependency rule', 'dependency inversion', 'inbound / outbound port', 'use cases', 'entities', 'vertical slice architecture'],
      p: ['Test: does the Domain project reference EF Core or ASP.NET Core? Then it is not clean.', 'Hexagonal: Cockburn 2005; Onion: Palermo 2008; Clean: Martin 2012.', 'Overkill risks: mappers everywhere, an interface per class, a repository over EF Core.', 'Vertical slices outside, clean core for complex parts.'],
      f: [['Hexagonal vs Clean vs Onion: what is the difference?', 'Very little. All put the domain at the centre with dependencies pointing inwards. Hexagonal talks about ports and adapters; Onion and Clean draw concentric layers, and Clean names them: entities, use cases, interface adapters, frameworks.'],
          ['Port vs adapter?', 'A port is an interface the core owns, such as the TransferFunds use case (inbound) or IAccountStore (outbound). An adapter is edge code that plugs into it, such as an endpoint or an EF Core repository.'],
          ['What is vertical slice architecture?', 'Organising by feature: one folder per use case holds the endpoint, handler and data access, and each slice picks the simplest approach it needs.']],
      q: [{ q: 'In Clean architecture, where should the IAccountStore interface live?', o: ['In the Infrastructure project next to EF Core', 'In the inner application/domain layer that uses it', 'In the API project', 'In a shared NuGet package used by all services'], a: 1, e: 'The core declares the port it needs; infrastructure implements it, so dependencies point inwards (dependency inversion).' }]
    },
    'mono-micro': {
      say: 'A monolith deploys and scales as one unit with one database and easy ACID transactions. Microservices deploy and scale independently, each owning its data, suiting many autonomous teams, but complexity moves into the network: sagas, tracing and eventual consistency. Start with a modular monolith and extract services when boundaries are proven.',
      k: ['independent deployment', 'database per service', 'Conway\'s Law', 'distributed monolith', 'eventual consistency', 'modular monolith', 'Aspire'],
      p: ['Microservices do not remove complexity, they move it.', 'Conway\'s Law: systems mirror the org\'s communication structure.', 'Distributed monolith: services deployed together or sharing a DB.', 'Worth it with many teams, different scaling needs, clear domains.'],
      f: [['When would you NOT use microservices?', 'With a small team, unclear domain boundaries, an early-stage product, or no mature DevOps and observability. Use a modular monolith instead.'],
          ['What is a distributed monolith?', 'Services that must be deployed together or share a database, so you get network complexity without independent deployment.'],
          ['How does Conway\'s Law affect service design?', 'Systems mirror how teams communicate, so design team boundaries and service boundaries together.']],
      q: [{ q: 'Three "microservices" share one database and every release deploys all three together. What is this?', o: ['A modular monolith', 'A distributed monolith', 'Cell-based architecture', 'A healthy microservice setup'], a: 1, e: 'Shared DB and lock-step deployment are the classic signs of a distributed monolith.' }]
    },
    'ms-patterns': {
      say: 'Microservice patterns group by problem: decomposition by business capability or subdomain, data management with database per service, sagas, CQRS and outbox, communication via gateway, BFF, discovery and messaging, reliability with circuit breakers, bulkheads and timeouts, and observability with tracing and correlation IDs. An anti-corruption layer keeps legacy models out.',
      k: ['decompose by business capability', 'database per service', 'API composition', 'service discovery', 'circuit breaker', 'bulkhead', 'correlation IDs', 'anti-corruption layer'],
      p: ['Share data through APIs or events, never another service\'s tables.', 'ACL translates a legacy model at the boundary.', 'Health check API: liveness and readiness.', '.NET: AddStandardResilienceHandler + AddServiceDiscovery.'],
      f: [['Name the six groups of microservice patterns.', 'Decomposition, data management, communication, reliability, observability, and deployment and cross-cutting concerns.'],
          ['What is an anti-corruption layer?', 'A translation layer at the boundary that converts a legacy or external model into your domain model, so its concepts do not leak in.']],
      q: [{ q: 'The Payments service needs customer names. What is the right approach?', o: ['Read the Customers service\'s tables directly', 'Call the Customers API or keep a local copy updated from its events', 'Share one database for both services', 'Copy the Customers codebase into Payments'], a: 1, e: 'Database per service: data is shared through APIs or events, never through another service\'s tables.' }]
    },
    'ms-api': {
      say: 'Microservice API patterns cover the edge, service-to-service calls and contracts. At the edge, a gateway routes and offloads with no business logic, a BFF shapes data per client, and composition fans out in parallel. Use sync for answers you need now and async for side effects, and change contracts with tolerant readers and expand-and-contract.',
      k: ['API gateway', 'BFF', 'API composition', 'async request-reply (202)', 'token exchange', 'tolerant reader', 'expand and contract', 'consumer-driven contracts'],
      p: ['More than 2-3 synchronous hops is a design smell.', 'Every remote call: timeout, retry only if idempotent, fallback.', 'Required calls may fail the request; optional calls degrade.', 'Do not forward one all-powerful token; exchange for narrower ones.'],
      f: [['API gateway or BFF?', 'Usually both. The gateway is the shared front door for routing, TLS, token validation and rate limits, with no business logic. A BFF per client type sits behind it and shapes data for that client.'],
          ['How do you query data owned by several microservices?', 'For simple reads, API composition: call owners in parallel, merge, with per-call timeouts and partial results. For big joins, search or paging, build a CQRS read model fed by events.'],
          ['What is expand and contract?', 'Add the new field or endpoint, move consumers over, then remove the old one once nobody calls it.'],
          ['When do you use async request-reply?', 'For work taking seconds to minutes, such as exports or KYC checks: return 202 with a status URL, then poll or send a webhook. Make the POST idempotent.']],
      q: [{ q: 'A dashboard calls Accounts (required) and Cards (optional tile) with Task.WhenAll; when Cards is slow the whole page fails. What is the fix?', o: ['Remove the timeout on Cards', 'Call them sequentially', 'Give Cards its own timeout and return a degraded response without it', 'Retry Cards forever'], a: 2, e: 'Decide per call: required calls may fail the request, optional ones degrade to partial data.' },
          { q: 'Which pattern stops a provider from breaking consumers it did not know about?', o: ['Gateway aggregation', 'Consumer-driven contract tests verified in the provider\'s CI', 'Client-side discovery', 'Chained calls'], a: 1, e: 'Consumers publish what they rely on (e.g. with PactNet) and the provider build fails if it breaks them.' }]
    },
    saga: {
      say: 'A saga splits a long business transaction into local transactions; if a step fails, compensating actions undo the earlier steps in reverse order. Choreography sagas react to events; orchestration sagas use a central coordinator such as Durable Functions or Temporal. Sagas give eventual consistency, not ACID isolation, so use pending states.',
      k: ['local transactions', 'compensating action', 'choreography saga', 'orchestration saga', 'eventual consistency', 'semantic lock / pending state', 'idempotent compensation'],
      p: ['Compensate in reverse order.', 'Compensations must be idempotent and should not fail; give them their own retries.', 'No isolation: other readers can see intermediate states.', 'Orchestration suits complex flows; choreography suits simple ones.'],
      f: [['How do you keep data consistent across microservices?', 'Sagas with compensating actions, the transactional outbox for reliable events, idempotent consumers, and accepting eventual consistency where the business allows it.'],
          ['Choreography vs orchestration saga?', 'In choreography each service listens for events and emits the next. In orchestration a central orchestrator calls each step and triggers compensation, which is easier to see and debug.'],
          ['Why use "pending" states in a saga?', 'Sagas lack ACID isolation, so a semantic lock or pending status stops other operations acting on data that may still be compensated.']],
      q: [{ q: 'A payment saga reserved funds and debited the account, then sending the payment failed. What should happen?', o: ['Roll back with a distributed two-phase commit', 'Run compensations in reverse: credit back, then release funds', 'Leave it for manual fix', 'Retry the debit'], a: 1, e: 'Sagas undo completed steps with compensating actions in reverse order.' }]
    },
    cqrs: {
      say: 'CQRS separates the write model, which handles commands and rules, from read models tuned for queries, so each side scales independently. Event sourcing stores every change as an event and rebuilds state from them, giving a full audit trail and time travel. Costs are eventual consistency, more parts, event versioning and snapshots. Avoid both for CRUD.',
      k: ['command / query separation', 'write model', 'read model / projection', 'event store', 'append-only stream', 'snapshots', 'event versioning', 'Marten'],
      p: ['CQRS does not require event sourcing.', 'Read side lags the write side (eventual consistency).', 'Snapshots keep long streams fast to rebuild.', 'CQRS needs no library; MediatR v13+ is commercial.'],
      f: [['Does CQRS require event sourcing?', 'No. You can have separate command and query models over a normal database. Event sourcing is an optional, separate choice.'],
          ['What do you gain and lose with event sourcing?', 'You gain a full audit trail, time travel and replayable projections. You pay with eventual consistency, event versioning, snapshots for long streams and more moving parts.']],
      q: [{ q: 'A bank needs a provable history of every balance change and the ability to rebuild state as at any date. Which pattern fits?', o: ['Shared database', 'Event sourcing', 'API composition', 'Gateway aggregation'], a: 1, e: 'Event sourcing stores each change as an immutable event, so state at any point can be rebuilt and audited.' }]
    },
    strangler: {
      say: 'The strangler fig pattern modernises a legacy system bit by bit: put a facade in front, route one feature at a time to new services, and retire the old system once it is empty. It pairs well with CDC to sync data, an anti-corruption layer, and feature flags to switch routes and roll back.',
      k: ['facade', 'incremental migration', 'routing per feature', 'CDC', 'anti-corruption layer', 'feature flags', 'YARP', 'SystemWebAdapters'],
      p: ['Avoids a big-bang rewrite.', 'Catch-all route to legacy at lowest priority.', 'Feature flags switch a route gradually and back.', 'CDC keeps old and new data in sync during migration.'],
      f: [['How does a strangler fig migration work?', 'A facade such as YARP sits in front; migrated routes go to the new service, everything else still forwards to legacy, until legacy has nothing left and is retired.'],
          ['What helps keep data consistent during a strangler migration?', 'CDC to sync data between the legacy and new stores, plus an anti-corruption layer to translate models.']],
      q: [{ q: 'Why prefer the strangler fig over a big-bang rewrite?', o: ['It is always faster to finish', 'It delivers value incrementally and allows rollback route by route', 'It removes the need for testing', 'It avoids any facade'], a: 1, e: 'Migrating one feature at a time limits risk and lets you switch back via flags or routing.' }]
    },
    mesh: {
      say: 'A sidecar is a helper container running next to a service. A service mesh puts a sidecar proxy like Envoy next to every service, managed by a control plane such as Istio or Linkerd, to provide mTLS, retries, timeouts, traffic splitting and telemetry without changing service code. It carries real operational cost.',
      k: ['sidecar', 'Envoy proxy', 'control plane', 'mTLS', 'traffic splitting / canary', 'Istio / Linkerd', 'Dapr'],
      p: ['Do not stack aggressive app retries on mesh retries.', 'Worth it with many services, many languages, zero trust.', 'Dapr sidecar: service invocation, pub/sub, state, secrets.', 'Propagate trace context so mesh and app traces join.'],
      f: [['What does a service mesh give you without code changes?', 'mTLS between services, retries and timeouts, traffic splitting for canaries, and metrics and traces, all handled by the sidecar proxies.'],
          ['What breaks if both the mesh and the app retry aggressively?', 'Retries multiply: each layer retries the other\'s retries, amplifying load on a struggling service during an outage.']],
      q: [{ q: 'Which component configures and manages the Envoy sidecars in an Istio mesh?', o: ['The API gateway', 'The control plane', 'The load balancer', 'Each service\'s code'], a: 1, e: 'The control plane pushes config such as mTLS and routing rules to the data-plane proxies.' }]
    },
    ddd: {
      say: 'Domain-Driven Design models software around the business domain and draws service boundaries where the business language changes. Key ideas are bounded contexts, ubiquitous language, core versus supporting and generic subdomains, aggregates changed as one unit through a root, entities versus value objects, and domain events linked by a context map.',
      k: ['bounded context', 'ubiquitous language', 'core / supporting / generic subdomain', 'aggregate root', 'entity vs value object', 'domain events', 'context map'],
      p: ['"Account" in Lending is not "Account" in Login.', 'Build the core subdomain; buy generic ones.', 'Load and save one aggregate per transaction.', 'Value objects: C# records, persisted with ComplexProperty or OwnsOne.'],
      f: [['Entity vs value object?', 'An entity has an identity that persists over time, such as Customer #42. A value object is defined only by its values, such as Money or Address, and is immutable.'],
          ['What is an aggregate?', 'A cluster of objects changed as one unit through a single root, such as an Order and its OrderLines. It is the consistency boundary: one transaction each.'],
          ['How do you find a bounded context boundary?', 'Look for where the language changes: the same word with different meanings, or a change in ownership, usually marks a boundary.']],
      q: [{ q: 'Which subdomain should a bank build in-house rather than buy?', o: ['Email sending', 'The core subdomain that differentiates it, such as lending decisioning', 'Generic identity management', 'Payroll'], a: 1, e: 'Core subdomains are the competitive edge, so build them; generic ones are bought.' }]
    },
    eventstorming: {
      say: 'Event storming is a sticky-note workshop by Alberto Brandolini where business and tech map a domain as a timeline of past-tense domain events, then add commands, actors, policies, read models, external systems, aggregates and hotspots. Where language and ownership change, you find candidate bounded contexts that feed the DDD context map.',
      k: ['domain event (orange)', 'command (blue)', 'policy (lilac)', 'aggregate', 'hotspot', 'pivotal events', 'big picture / process / design', 'candidate bounded contexts'],
      p: ['Events are past tense, business language: not "PaymentRow inserted".', 'Three levels: big picture, process modelling, software design.', 'Hotspots become open questions, risks and ADRs.', 'Output is shared understanding, not a document.'],
      f: [['What do you get from an event storming workshop?', 'A shared timeline of domain events with their commands, actors, policies and external systems, a list of hotspots, and candidate bounded contexts where language and ownership change.'],
          ['What is a policy sticky?', 'A reaction rule, "whenever X happens, do Y", such as holding a payment when the fraud score is high. In code it becomes an event handler that sends the next command, or a saga.']],
      q: [{ q: 'Which of these is a well-formed domain event sticky?', o: ['Submit payment', 'PaymentRow inserted', 'Payment settled', 'Payments ops'], a: 2, e: 'Domain events are past tense in business language. "Submit payment" is a command and "Payments ops" an actor.' }]
    },
    serverless: {
      say: 'Serverless means you write code or config and the cloud runs, scales even to zero, and bills per execution. It covers FaaS like Azure Functions, managed back-end services, and serverless containers and workflows. It suits spiky, event-driven glue; watch cold starts, time limits, lock-in, cost at steady high load, and overwhelming downstream databases.',
      k: ['FaaS', 'triggers', 'scale to zero', 'cold start', 'Flex Consumption', 'Durable Functions', 'isolated worker', 'concurrency cap'],
      p: ['Functions: stateless, idempotent, short.', 'Cap concurrency (e.g. maxConcurrentCalls) to protect databases.', 'In-process model ends 10 Nov 2026; use the isolated worker for .NET 10.', '.NET 10 cannot run on Linux Consumption; use Flex Consumption.'],
      f: [['Serverless or containers?', 'Serverless for event-driven, spiky, short tasks. Containers for long-running, steady, latency-sensitive workloads or when you need full runtime control.'],
          ['How do you reduce cold starts?', 'Use premium or provisioned plans, keep packages small and keep functions warm.'],
          ['Name three common serverless patterns.', 'Event processing (blob upload triggers a function), API backend (APIM to Functions to Cosmos DB), and fan-out/fan-in with Durable Functions. Timer jobs and queue-based load levelling too.']],
      q: [{ q: 'A queue-triggered function scales out under a burst and the SQL database starts failing. What is the first fix?', o: ['Increase the function timeout', 'Cap function concurrency so the database is protected', 'Switch to synchronous HTTP', 'Disable retries'], a: 1, e: 'Serverless scale-out can overwhelm downstream systems; cap concurrency (e.g. Service Bus maxConcurrentCalls in host.json).' }]
    },
    twelve: {
      say: 'The 12-Factor App is twelve principles for portable, scalable cloud-native apps: one codebase, explicit dependencies, config in the environment, backing services as attached resources, separate build-release-run, stateless processes, port binding, scale by processes, disposability, dev/prod parity, logs as event streams and admin tasks as one-off processes.',
      k: ['config in environment', 'stateless processes', 'backing services', 'build / release / run', 'disposability', 'dev/prod parity', 'logs as event streams', 'one-off admin processes'],
      p: ['Config via env vars, App Configuration, Key Vault; validate on start.', 'Graceful shutdown on SIGTERM: finish in-flight work.', 'Logs to stdout; the platform ships them.', 'Run EF migrations as a one-off bundle, not on app startup.'],
      f: [['How do you apply factor 3 (config) in .NET?', 'Read settings from IConfiguration: environment variables, Azure App Configuration and Key Vault, bound with the options pattern and ValidateOnStart so bad config fails fast.'],
          ['What does disposability mean?', 'Processes start fast and shut down gracefully: on SIGTERM stop taking new work, finish in-flight requests within a timeout, then exit.']],
      q: [{ q: 'Where should database migrations run in a 12-factor app?', o: ['On every app instance at startup', 'As a one-off admin process, e.g. an EF Core migration bundle', 'Manually by developers in prod', 'Inside the logging pipeline'], a: 1, e: 'Factor 12: admin tasks run as one-off processes, avoiding races when many instances start together.' }]
    },
    multitenancy: {
      say: 'Multi-tenancy serves many customers from one system; the key question is how much they share. Silo gives each tenant its own stack or database, pool shares tables with a TenantId, and bridge mixes them. Resolve the tenant from the token or host, carry it everywhere, filter every query, partition rate limits and cache keys.',
      k: ['silo / pool / bridge', 'database per tenant', 'shared tables + TenantId', 'tenant context', 'global query filter', 'row-level security', 'noisy neighbour', 'tenant-aware cache keys'],
      p: ['Tenant ID from token or host, never the request body.', 'IgnoreQueryFilters() with no names drops the tenant filter too.', 'Tiered: pool for the long tail, silos for big or regulated tenants.', 'CI tests that try to read tenant B as tenant A.'],
      f: [['How do you isolate tenants in a shared database?', 'Resolve the tenant from the token or host, put TenantId on every row and enforce it with a named EF Core query filter plus database row-level security. Prefix cache keys, rate limit per tenant and test for cross-tenant leaks in CI.'],
          ['When would you give a tenant its own database?', 'For large or regulated customers needing strong isolation, single-tenant restore or data residency, accepting higher cost and per-database migrations.'],
          ['How do you stop a noisy neighbour?', 'Partition rate limits and quotas by tenant, and move very large tenants to dedicated compute or their own silo.']],
      q: [{ q: 'Which tenancy model makes restoring a single tenant and meeting data residency easiest?', o: ['Shared tables with TenantId', 'Schema per tenant', 'Database per tenant', 'One global cache'], a: 2, e: 'A separate database per tenant can be restored and located independently; shared tables make both hard.' },
          { q: 'Where should the API get the tenant ID from?', o: ['A tenantId field in the JSON body', 'A query string parameter', 'The authenticated token claim or host name', 'A cookie the client sets'], a: 2, e: 'Client-supplied values can be forged; the token or host name is trusted and resolved once at the edge.' }]
    }
  }
};
