/* Quick-revision data for 08-api-design.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['08'] = {
  approach: [
    ['Ask who the consumer is', 'External partner, rich UI, internal service, or event subscriber? That picks REST, GraphQL, gRPC or events.'],
    ['Design the contract first', 'Resources and verbs, status codes, Problem Details errors, versioning and pagination in OpenAPI.'],
    ['Secure it', 'OAuth 2.0 / OIDC with the right grant, validate the JWT, scopes plus object-level checks (BOLA).'],
    ['Make retries safe', 'Idempotency-Key on POST, unique index, idempotent consumers.'],
    ['Protect it', 'Rate limit at the gateway (token bucket), 429 + Retry-After, quotas per plan.'],
    ['Make it fast', 'Measure p95/p99, then cache, paginate, batch N+1, pool connections, go async with 202.'],
    ['Close with .NET 10', 'Minimal APIs, AddOpenApi, AddProblemDetails, JwtBearer / Microsoft.Identity.Web, AddRateLimiter.']
  ],
  traps: [
    'Mixing up 401 (not authenticated) and 403 (authenticated but not allowed).',
    'Checking the token but not whether this user may see this object (BOLA).',
    'Putting secrets or sensitive PII in a JWT; it is only encoded, not encrypted.',
    'Making POST payments without an idempotency key, so retries charge twice.',
    'Forgetting built-in rate limiters count per instance, not across the cluster.'
  ],
  sections: {
    styles: {
      say: 'The main API styles are REST, GraphQL, gRPC, SOAP, webhooks, WebSocket or SSE, and async event APIs. Pick by consumer: REST for partners and public APIs, GraphQL for rich UIs, gRPC for low-latency internal calls, events for decoupled integration. A common enterprise mix is REST outside and gRPC or events inside.',
      k: ['REST', 'GraphQL', 'gRPC / Protobuf', 'webhooks', 'SSE / WebSocket', 'AsyncAPI', 'contract-first', 'BFF'],
      p: ['Ask "who is the consumer?", not "which is best?".', 'GraphQL: harder HTTP caching, query-cost attacks, N+1.', 'gRPC: HTTP/2, fast, weak browser support.', 'Contracts: OpenAPI, .proto, SDL, AsyncAPI.'],
      f: [['When would you choose gRPC over REST?', 'For internal service-to-service calls that need low latency, streaming and a strict generated contract. Not for browsers or external partners, where REST is universal and cacheable.'],
          ['What are the weaknesses of GraphQL?', 'HTTP caching is harder, clients can send expensive queries so you need cost limits, and naive resolvers cause N+1 queries (use DataLoader).'],
          ['How do you stream status updates from a .NET 10 minimal API?', 'Return TypedResults.ServerSentEvents over an IAsyncEnumerable, new in .NET 10, or use SignalR for two-way real time.']],
      q: [{ q: 'A partner wants to be told immediately when a payment settles, without polling. Which style fits best?', o: ['GraphQL query', 'Webhook to the partner\'s URL', 'gRPC unary call from the partner', 'SOAP with WSDL'], a: 1, e: 'Webhooks push an event to the client URL in real time; you must sign payloads and retry delivery.' }]
    },
    rest: {
      say: 'Good REST uses nouns for resources, HTTP verbs for actions and status codes for outcomes. GET, PUT and DELETE are idempotent; POST is not, so use an Idempotency-Key. Version only for breaking changes, prefer cursor pagination, return RFC 9457 Problem Details, and use ETag with If-Match for optimistic concurrency.',
      k: ['resources + verbs', 'idempotent methods', 'status codes', 'versioning', 'cursor pagination', 'Problem Details (RFC 9457)', 'ETag / If-Match', 'tolerant reader'],
      p: ['Adding optional fields is safe; removing, renaming or retyping is breaking.', 'Offset pagination drifts and slows on deep pages; keyset is stable.', '412 on ETag mismatch; 409 for conflicts; 429 for rate limits.', 'Publish a deprecation policy (Sunset header, 6-12 months).'],
      f: [['Which HTTP methods are idempotent?', 'GET, PUT and DELETE are idempotent. POST is not, and PATCH is not guaranteed, so creates need an Idempotency-Key.'],
          ['Name three breaking API changes.', 'Removing or renaming a field, changing a field\'s type, and making an optional field required.'],
          ['How do you implement optimistic concurrency in REST?', 'Return an ETag from the row version, require If-Match on updates, and return 412 Precondition Failed when it does not match.']],
      q: [{ q: 'Which change can ship without a new major API version?', o: ['Renaming customerId to clientId', 'Adding a new optional field to the response', 'Making the email field required', 'Changing amount from number to string'], a: 1, e: 'Adding optional fields is backward compatible, as long as consumers are tolerant readers.' },
          { q: 'Users paging deep into a large, frequently changing list see duplicates and slow responses. What fixes it?', o: ['Bigger page sizes', 'Cursor (keyset) pagination', 'Offset pagination with caching', 'HATEOAS links'], a: 1, e: 'Keyset pagination seeks from the last seen key, so it stays fast and does not drift when rows are inserted.' }]
    },
    auth: {
      say: 'Authentication is who you are, authorization is what you may do; fail authN and you get 401, fail authZ and you get 403. Options range from API keys and mTLS to OAuth bearer tokens and HMAC signatures. Always check object-level access, because broken object-level authorization is OWASP API number one.',
      k: ['401 vs 403', 'API key', 'bearer token', 'mTLS', 'HMAC signature', 'scopes', 'RBAC / ABAC / ReBAC', 'BOLA'],
      p: ['API key identifies an app, not a user; rotate it.', 'JWTs are hard to revoke; keep them short-lived.', 'Check "can this user see account 42?" on every call.', 'Compare secrets with FixedTimeEquals.'],
      f: [['API key vs OAuth token?', 'An API key identifies the calling app and lasts until rotated. An OAuth token is short-lived, scoped, can represent a user, and is issued by a trusted authorization server.'],
          ['What is BOLA and how do you prevent it in .NET?', 'Broken object-level authorization: a valid user reads someone else\'s object by changing an ID. Load the resource and call IAuthorizationService.AuthorizeAsync with a resource-based requirement.'],
          ['RBAC vs ABAC vs ReBAC?', 'RBAC grants by role, ABAC by attributes like region or time, ReBAC by relationship such as being the account owner.']],
      q: [{ q: 'A signed-in customer changes the URL from /accounts/41 to /accounts/42 and sees another customer\'s account. Which control was missing?', o: ['TLS', 'JWT signature validation', 'Object-level authorization check', 'Rate limiting'], a: 2, e: 'The user is authenticated, but nobody checked that this user may access this object (BOLA, OWASP API #1).' }]
    },
    oauth: {
      say: 'OAuth 2.0 gives an app limited, delegated access to an API without seeing the user\'s password; OIDC adds identity with an ID token. Use Authorization Code with PKCE for user apps, Client Credentials for machine-to-machine, and validate signature, issuer, audience, expiry and scopes on every JWT. Banking adds FAPI.',
      k: ['Authorization Code + PKCE', 'Client Credentials', 'On-Behalf-Of', 'ID token vs access token', 'JWKS / kid', 'aud / iss / exp', 'BFF', 'FAPI'],
      p: ['OAuth = authorization (access token); OIDC = authentication (ID token).', 'Implicit and ROPC are deprecated in OAuth 2.1.', 'Access tokens short: 5-60 minutes.', 'SPAs: BFF keeps tokens server-side, not in localStorage.'],
      f: [['Which grant for a nightly batch job calling an API?', 'Client Credentials, ideally with a certificate, private_key_jwt or a managed identity instead of a client secret.'],
          ['What must an API validate on a JWT?', 'The signature via the JWKS key (kid), issuer, audience, expiry and not-before, then the scopes or roles.'],
          ['API A must call API B as the signed-in user. Which flow?', 'On-Behalf-Of (token exchange), so API B still sees the user\'s identity.'],
          ['What is FAPI?', 'The Financial-grade API profile that tightens OAuth with mTLS or private_key_jwt, PAR and JARM. Australia\'s Consumer Data Right uses it.']],
      q: [{ q: 'Which OAuth flow should a new single-page app use to sign users in?', o: ['Implicit grant', 'Resource Owner Password Credentials', 'Authorization Code with PKCE', 'Client Credentials'], a: 2, e: 'Auth Code + PKCE is the recommended flow for any app acting for a user; Implicit and ROPC are deprecated.' },
          { q: 'Your API receives an ID token instead of an access token. What is the right response?', o: ['Accept it; both are JWTs', 'Reject it; ID tokens prove identity to the client, they are not for calling APIs', 'Accept it if not expired', 'Decode it and use the email claim as the scope'], a: 1, e: 'ID tokens are for the client (OIDC authentication). APIs should only accept access tokens with the right audience.' }]
    },
    performance: {
      say: 'Measure first with p95 and p99 latency, throughput and error rate, find the slowest hop, then fix it. Usual fixes are caching, pagination and sparse fields, compression, connection pooling, fixing N+1 queries, parallel downstream calls and async 202 for long work. Slow APIs are usually slow queries.',
      k: ['p95 / p99 latency', 'latency budget', 'N+1', 'connection pooling', 'compression', 'keyset pagination', '202 Accepted', 'Task.WhenAll'],
      p: ['Set a latency budget per hop (e.g. gateway 20 ms, service 50 ms, DB 30 ms).', 'Compress JSON over about 1 KB; HTTPS compression is off by default (BREACH).', 'Reuse connections: IHttpClientFactory, DbContext pooling.', 'Load-test before tuning (k6, JMeter, Azure Load Testing).'],
      f: [['Name five ways to make an API faster.', 'Cache responses, paginate and select only needed fields, batch away N+1 queries, reuse connections, and fan out independent downstream calls in parallel. Push long work to a queue and return 202.'],
          ['What is the N+1 problem?', 'One query for a list, then one more query per item. Fix it with a JOIN, IN clause, Include or projection, or a GraphQL DataLoader.']],
      q: [{ q: 'An endpoint calls the customer service and then the accounts service, one after the other; neither depends on the other. What is the quickest win?', o: ['Add more CPU', 'Run both calls in parallel with Task.WhenAll', 'Turn on response compression', 'Switch to SOAP'], a: 1, e: 'Independent calls should fan out together, so latency is the slower call, not the sum.' }]
    },
    ratelimit: {
      say: 'Rate limiting caps how many requests a client can make in a window, to protect backends and ensure fairness. Token bucket is the usual choice: bursts up to B, then a steady rate. Apply it at the gateway, key it by API key or user, return 429 with Retry-After, and share counters in Redis across nodes.',
      k: ['token bucket', 'leaky bucket', 'fixed window', 'sliding window log', 'sliding window counter', '429 + Retry-After', 'quota vs throttling', 'Redis Lua'],
      p: ['Fixed window allows 2x bursts at window edges.', 'Sliding counter = current + previous x overlap: accurate, low memory.', 'Built-in .NET limiters count per instance (10 nodes = 10x).', 'Clients back off with exponential backoff and jitter.'],
      f: [['How do you rate limit across 10 gateway nodes?', 'Use a shared counter store such as Redis with atomic Lua scripts, or a gateway feature with synchronised counters, and accept slight approximation.'],
          ['Token bucket vs leaky bucket?', 'Token bucket allows bursts up to the bucket size, then a steady rate. Leaky bucket smooths output to a constant rate, queuing or dropping bursts, which adds latency.'],
          ['Rate limit vs quota vs throttling?', 'A rate limit is short-term (100/s), a quota long-term (1M/month), and throttling slows requests rather than rejecting them.']],
      q: [{ q: 'A limit of 100 requests per minute lets a client send 200 requests in two seconds around 12:00:59 to 12:01:01. Which algorithm has this flaw?', o: ['Token bucket', 'Sliding window log', 'Fixed window counter', 'Leaky bucket'], a: 2, e: 'Fixed windows reset at the boundary, so a client can use the full limit at the end of one window and again at the start of the next.' }]
    },
    idempotency: {
      say: 'An operation is idempotent if doing it once or many times has the same effect, which matters because networks retry. The client sends an Idempotency-Key; the server stores the key and response, scoped per client with a TTL, and replays the response on retry. A unique index gives the hard guarantee.',
      k: ['Idempotency-Key', 'replay response', 'unique index', 'TTL (24 h)', 'scope per client', 'idempotent receiver', 'SET NX'],
      p: ['Payments, transfers and order creation must be idempotent.', 'Same key with a different payload: reject (422).', 'Claim the key first (SET NX or unique index) to avoid races.', 'Consumers dedupe by message ID in the same transaction.'],
      f: [['How do you make POST /payments safe to retry?', 'Require an Idempotency-Key, claim it atomically, store the response for about 24 hours scoped per client, and replay it on retries. Back it with a unique index on (ClientId, IdempotencyKey) in the payment transaction.'],
          ['What is the idempotent receiver pattern?', 'A message consumer inserts the message ID into a processed-messages table with a unique key, in the same transaction as the business change, so duplicates are skipped.']],
      q: [{ q: 'Two identical payment requests with the same Idempotency-Key arrive at the same millisecond. What prevents a double charge?', o: ['Checking the cache before processing', 'An atomic claim of the key (Redis SET NX or a unique index) before processing', 'A longer TTL', 'Returning 202 Accepted'], a: 1, e: 'A plain check-then-act races; both requests see no key. An atomic claim lets only one proceed.' }]
    },
    graphql: {
      say: 'GraphQL is a typed schema behind one endpoint: clients ask for exactly the fields they need through queries, mutations and subscriptions, and resolvers fetch each field. The costs are N+1 queries, so use DataLoader; expensive queries, so add cost and depth limits or persisted operations; and harder HTTP caching. It suits rich UIs and BFFs. Federation joins subgraphs into a supergraph.',
      k: ['schema / SDL', 'query / mutation / subscription', 'resolver', 'N+1 + DataLoader', 'cost analysis', 'persisted operations', 'supergraph / subgraph', 'Hot Chocolate'],
      p: ['The client writes the query, so the server must cap cost, depth and page size.', 'DataLoader batches and dedupes keys per request.', 'One POST URL: no per-URL HTTP or CDN caching.', 'Federation pays off only with many teams and clear domains.'],
      f: [['How does DataLoader fix N+1 in GraphQL?', 'Resolvers call LoadAsync(key) instead of querying. The DataLoader collects and dedupes the keys from all resolvers in that tick, then runs one batched query (e.g. WHERE id IN ...).'],
          ['Persisted operations vs cost analysis?', 'Persisted (trusted) operations allow only pre-registered query hashes, which suits your own apps. Cost analysis scores any query and rejects it if it is over budget, which suits partner or public APIs.'],
          ['What are a supergraph and subgraphs?', 'Subgraphs are team-owned GraphQL services. Composition merges them into one supergraph schema, and a gateway plans each query across subgraphs and merges the results.'],
          ['When would you not use GraphQL?', 'Simple CRUD with one client, public APIs that rely on HTTP caching, file or bulk transfer, and service-to-service calls where gRPC or events fit better.']],
      q: [{ q: 'A GraphQL query for 50 orders and each order\'s customer makes 51 database calls. What is the standard fix?', o: ['Add a depth limit', 'Use a DataLoader to batch the customer lookups', 'Switch on HTTP response caching', 'Split the query into two mutations'], a: 1, e: 'This is N+1. A DataLoader collects the 50 customer keys and loads them in one batched query.' },
          { q: 'Your own mobile app is the only GraphQL client. What is the strongest guard against arbitrary expensive queries?', o: ['Disable mutations', 'Persisted (trusted) operations', 'A bigger database', 'Schema stitching'], a: 1, e: 'With trusted documents the server only runs operations registered at build time, so ad-hoc queries are rejected.' }]
    }
  }
};
