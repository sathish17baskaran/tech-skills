/* Quick-revision data for 09-apim.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['09'] = {
  approach: [
    ['Frame the problem', 'Who are the consumers (internal, partner, public)? What must be centralised: auth, throttling, metering, transformation?'],
    ['Model the building blocks', 'APIs and operations, products and subscriptions, backends, named values, workspaces.'],
    ['Design the policy pipeline', 'Inbound auth and rate limits, backend routing and retry, outbound transform, on-error; scope inheritance with <base />.'],
    ['Secure both legs', 'Front door: WAF, validate-jwt, mTLS. Back door: managed identity, private network, backend accepts APIM only.'],
    ['Plan change and lifecycle', 'Versions for breaking changes, revisions for safe ones; APIOps from Git with linting.'],
    ['Operate it', 'App Insights + Log Analytics, p95 split gateway vs backend, 4xx/5xx, 429s, capacity; tier choice (Premium for multi-region).']
  ],
  traps: [
    'Treating a subscription key as strong authentication.',
    'Putting business logic in gateway policies.',
    'Securing only the front door, so callers can bypass APIM and hit the backend directly.',
    'Confusing versions (breaking) with revisions (non-breaking).',
    'Calling APIM a service mesh or an ESB.'
  ],
  sections: {
    what: {
      say: 'API Management is the front door and control tower for APIs: it publishes, secures, transforms, meters and monitors them. It has three parts: the gateway (data plane) where every call and policy runs, the management plane where you define APIs, and the developer portal for self-service. It moves cross-cutting concerns out of every backend.',
      k: ['gateway (data plane)', 'management plane', 'developer portal', 'cross-cutting concerns', 'Azure APIM', 'Apigee / Kong', 'YARP'],
      p: ['Gateway = runtime proxy; policies run here.', 'Management plane = portal, ARM/Bicep, CLI, REST.', 'Portal: discover, try, sign up, get keys.', 'Code-first alternative: Yarp.ReverseProxy.'],
      f: [['What are the three parts of APIM?', 'The gateway that proxies every call and applies policies, the management plane where APIs, products and policies are defined, and the developer portal where consumers discover APIs and get keys.'],
          ['Why put APIs behind APIM?', 'To handle security, throttling, logging and transformation consistently in one layer instead of rebuilding them in every backend, and to publish and meter APIs as products.']],
      q: [{ q: 'Which APIM component actually applies rate limits to live traffic?', o: ['Developer portal', 'Management plane', 'Gateway', 'Bicep template'], a: 2, e: 'The gateway is the runtime data plane; every call passes through it and policies run there.' }]
    },
    blocks: {
      say: 'An APIM instance holds APIs made of operations, products that bundle APIs with limits and terms, and subscriptions whose keys identify callers. Backends define targets, policies are the XML rules, and named values hold config and Key Vault secrets. Workspaces give teams federated ownership; the self-hosted gateway runs on-prem.',
      k: ['API / operation', 'product', 'subscription key', 'backend', 'named value', 'workspaces', 'self-hosted gateway', 'Premium tier'],
      p: ['Product = commercial package; API = technical interface.', 'Subscription key identifies and meters; it is not strong auth.', 'Never hard-code secrets; use named values from Key Vault.', 'Premium: multi-region, VNet injection, availability zones.'],
      f: [['Product vs API?', 'An API is the technical interface. A product is the package of one or more APIs with limits and terms that consumers subscribe to.'],
          ['When would you use a self-hosted gateway?', 'For hybrid setups: run the containerised gateway on-prem or in another cloud, close to backends for low latency, while managing it from Azure.'],
          ['What are APIM workspaces for?', 'Federated API management: teams own their APIs inside a shared instance with central governance.']],
      q: [{ q: 'You want partners on a "Gold" plan to get 1000 calls/min across the Accounts and Payments APIs. Which APIM object models this?', o: ['A named value', 'A product with its own limits', 'A backend pool', 'An API revision'], a: 1, e: 'A product bundles APIs with terms and limits; partners subscribe to it.' }]
    },
    policies: {
      say: 'Policies are XML rules that run in four stages: inbound, backend, outbound and on-error. They inherit from global down to workspace, product, API and operation, and <base /> controls where the parent runs. Typical inbound policies validate the JWT, rate limit by key and call the backend with a managed identity. Keep them thin.',
      k: ['inbound / backend / outbound / on-error', '<base /> inheritance', 'validate-jwt', 'rate-limit-by-key', 'set-backend-service', 'policy expressions (C#)', 'policy fragments', 'cache-lookup'],
      p: ['Scope order: global, workspace, product, API, operation.', 'Policy expressions use C# in @(...) with limited types.', 'Reuse snippets with policy fragments.', 'Business logic belongs in services, not the gateway.'],
      f: [['What does <base /> do in a policy?', 'It runs the policies inherited from the parent scope at that point, so an operation policy can add to the API, product and global policies instead of replacing them.'],
          ['Which policy stage runs if anything fails?', 'On-error: return a custom error body and log the failure.'],
          ['rate-limit vs quota?', 'rate-limit caps calls in a short renewal period (e.g. 100 per 60 s); quota caps volume over a longer period. The by-key variants count per custom key such as subscription or IP.']],
      q: [{ q: 'In which stage should validate-jwt and rate-limit-by-key run?', o: ['Outbound', 'Backend', 'Inbound', 'On-error'], a: 2, e: 'Inbound runs before the call reaches the backend, so unauthenticated or excessive calls are rejected early.' }]
    },
    security: {
      say: 'Secure both legs. The front door, consumer to APIM, uses a WAF, OAuth token validation, subscription keys for metering, mTLS and IP filters. The back door, APIM to backend, uses managed identity or a client certificate, private networking and a backend that only accepts APIM traffic. Secrets live in Key Vault via named values.',
      k: ['front door / back door', 'WAF', 'validate-jwt', 'mTLS', 'managed identity', 'private endpoint / VNet', 'Key Vault named values', 'forwarded headers'],
      p: ['Backend firewall: allow APIM only, or it can be bypassed.', 'Backend can require an app role given only to APIM\'s managed identity.', 'Swapping to APIM\'s token loses the user; forward the user token for BOLA checks.', 'Behind a proxy use UseForwardedHeaders for the real client IP.'],
      f: [['Is a subscription key enough security?', 'No. It identifies the app and enables metering. Combine it with OAuth/JWT validation or mTLS for real authentication and authorization.'],
          ['How does a backend trust only APIM?', 'Private networking plus a firewall that allows only APIM, and APIM calls with its managed identity; the backend requires a token for its audience carrying an app role assigned only to APIM.'],
          ['What breaks when APIM replaces the user token with its managed identity token?', 'The backend no longer knows the user, so it cannot do object-level checks. Forward the user token too and validate it.']],
      q: [{ q: 'Which control protects the "back door" from APIM to the backend?', o: ['Developer portal sign-up', 'Subscription keys', 'Managed identity token plus a backend that accepts only APIM', 'CORS policy'], a: 2, e: 'The back door needs APIM to authenticate to the backend and the backend to reject anything not from APIM.' }]
    },
    versions: {
      say: 'A version is a breaking change that consumers choose to adopt, so v1 and v2 live side by side in a version set using a path, header or query scheme. A revision is a non-breaking change you test with ;rev=n, then make current, with instant rollback. Revisions need no app change.',
      k: ['version set', 'path / header / query scheme', 'revision', ';rev=n', 'make current', 'rollback', 'Sunset header'],
      p: ['Version = breaking, consumers migrate at their own pace.', 'Revision = safe change, test then switch traffic.', 'One OpenAPI document per version (AddOpenApi("v1"), ("v2")).', 'Asp.Versioning reports supported and deprecated versions.'],
      f: [['How do you roll out a non-breaking policy change safely?', 'Create a new revision, test it with ;rev=n, make it current, and keep the previous revision for instant rollback.'],
          ['When do you need a new APIM version instead of a revision?', 'When the change breaks consumers, such as removing a field; they must opt in to v2 while v1 keeps running.']],
      q: [{ q: 'You are removing a field from the Payments API response. What should you create in APIM?', o: ['A new revision', 'A new version in the version set', 'A new named value', 'A policy fragment'], a: 1, e: 'Removing a field is breaking, so it needs a new version that consumers adopt when ready.' }]
    },
    lifecycle: {
      say: 'Treat APIs as products with a lifecycle: design contract-first, mock, build and test, secure and publish, monitor, version and retire. APIOps is GitOps for APIM: extract config to Git, review and lint with Spectral, and let a pipeline publish to test and prod. Keep an inventory to avoid shadow and zombie APIs.',
      k: ['contract-first', 'mock-response', 'APIOps', 'extractor / publisher', 'Spectral linting', 'API inventory', 'shadow / zombie APIs', 'Bicep / Terraform'],
      p: ['Unknown APIs are a security risk (OWASP API9).', 'Bicep/Terraform for the instance; APIOps for APIs and policies.', 'Emit OpenAPI at build time so CI can lint it.', 'Design guidelines keep naming, versioning and errors consistent.'],
      f: [['What is APIOps?', 'GitOps for APIM: API definitions, policies and config live in Git, changes go through PR review and linting, and a pipeline publishes them from dev to test to prod.'],
          ['Why keep an API inventory?', 'Shadow or zombie APIs that nobody knows about are unpatched and unmonitored, which OWASP lists as API9 improper inventory management.']],
      q: [{ q: 'How should policy changes reach production APIM in an APIOps setup?', o: ['Edit them in the portal in prod', 'Commit to Git, PR review and lint, then a pipeline publishes', 'Email the XML to the platform team', 'Change them in the backend code'], a: 1, e: 'APIOps treats APIM config as code: Git is the source of truth and pipelines publish it.' }]
    },
    monitor: {
      say: 'Monitoring shows who calls which API, how fast and how often it fails. Use APIM analytics, Application Insights with W3C traceparent correlation, and Log Analytics gateway logs with alerts. Track volume, p95 latency split into gateway and backend time, 4xx and 5xx rates, 429s and capacity, and never log PII.',
      k: ['Application Insights', 'W3C traceparent', 'ApiManagementGatewayLogs', 'p95 latency', 'gateway vs backend time', '429s', 'capacity metric', 'redaction'],
      p: ['Split latency: gateway time vs backend time.', 'Watch 429s and the capacity % metric.', 'Do not log full bodies with PII or card data.', 'UseAzureMonitor() puts backend traces in the same App Insights.'],
      f: [['What would you put on an APIM dashboard?', 'Request volume, p95 latency split into gateway and backend time, 4xx and 5xx rates, 429s and capacity percentage, with alerts on each.'],
          ['How do you get one trace from gateway to services?', 'APIM sends W3C traceparent; ASP.NET Core reads it and HttpClient passes it on, and OpenTelemetry exports to the same Application Insights.']],
      q: [{ q: 'p95 latency rose sharply. What helps most to locate the cause?', o: ['Counting subscriptions', 'Splitting latency into gateway time and backend time', 'Raising the rate limit', 'Logging full request bodies'], a: 1, e: 'Splitting the timing shows whether the gateway (policies, capacity) or the backend is slow.' }]
    },
    patterns: {
      say: 'Standard gateway patterns are routing, aggregation, offloading of TLS, auth, caching and throttling, a backend-for-frontend per channel, and a facade over legacy systems as part of a strangler fig. The newer AI gateway fronts LLM endpoints with token limits, token metrics, semantic caching and load balancing across model deployments.',
      k: ['gateway routing', 'gateway aggregation', 'gateway offloading', 'BFF', 'facade / strangler fig', 'AI gateway', 'llm-token-limit', 'semantic caching'],
      p: ['BFF = one facade per channel (mobile, web, partner).', 'Facade: modern REST in front of SOAP or mainframe.', 'AI gateway limits tokens, not just calls.', 'In .NET only the client endpoint changes to point at APIM.'],
      f: [['What does an AI gateway add in front of LLMs?', 'Token-based limits such as llm-token-limit, token usage metrics, semantic caching and load balancing across model deployments.'],
          ['Gateway aggregation vs BFF?', 'Aggregation combines several backend calls into one response. A BFF is a separate facade per channel shaped for that client; it often aggregates.']],
      q: [{ q: 'Teams share one Azure OpenAI deployment and one team keeps exhausting it with huge prompts. Which gateway feature helps most?', o: ['Call-count rate limit only', 'Token-based limits per consumer (llm-token-limit)', 'Response compression', 'Gateway routing by path'], a: 1, e: 'LLM cost and capacity are driven by tokens, so limit tokens per consumer, not just requests.' }]
    },
    compare: {
      say: 'A load balancer spreads traffic with health checks and knows nothing about business. An API gateway publishes, secures and meters north-south APIs. A service mesh handles east-west mTLS, retries and observability between services. An ESB or iPaaS orchestrates, transforms and bridges protocols between systems, with business mappings.',
      k: ['north-south', 'east-west', 'load balancer', 'API gateway', 'service mesh', 'sidecar', 'ESB / iPaaS', 'orchestration'],
      p: ['Only the ESB knows business flows; gateway is light policy.', 'Mesh runs as sidecars, e.g. Istio, Linkerd.', 'They often coexist at different points in the path.'],
      f: [['API gateway vs service mesh?', 'A gateway handles north-south traffic from clients to APIs: auth, metering, publishing. A mesh handles east-west traffic between services: mTLS, retries and observability via sidecars.'],
          ['Where does an ESB fit compared with APIM?', 'An ESB or iPaaS (MuleSoft, Logic Apps, Boomi) orchestrates flows, maps data and bridges protocols between systems. APIM fronts APIs with light policies.']],
      q: [{ q: 'You need mTLS and automatic retries for traffic between 40 internal microservices. Which component fits?', o: ['API gateway', 'Service mesh', 'Load balancer', 'ESB'], a: 1, e: 'East-west service-to-service concerns like mTLS and retries are what a service mesh provides.' }]
    }
  }
};
