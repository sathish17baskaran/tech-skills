/* Quick-revision data for 23-dotnet-engineering-deep-dive.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['23'] = {
  approach: [
    ['Define it precisely', 'One sentence on what the runtime or framework actually does (state machine, generations, lifetimes, pooled handlers).'],
    ['Explain the mechanism', 'Walk through how it works underneath: stack vs heap, Gen 0/1/2, await continuation, hill-climbing thread injection.'],
    ['Name the classic bug', 'Boxing, leaks via events, sync over async, captive dependency, socket exhaustion, N+1, middleware order.'],
    ['Show the fix in code', 'The good vs bad snippet: List<int>, await all the way, IServiceScopeFactory, IHttpClientFactory, Select projection.'],
    ['Say how you would diagnose it', 'dotnet-counters, dotnet-gcdump, dotnet-dump gcroot, dotnet-stack, logged SQL, BenchmarkDotNet.'],
    ['Close with the trade-off', 'Startup vs throughput (AOT, DATAS), safety vs speed (ValueTask), simplicity vs scale (Orleans).']
  ],
  traps: [
    'Saying "structs live on the stack" without the caveat.',
    'Calling GC.Collect() or raising min threads to hide the real problem.',
    'Claiming async makes a single call faster.',
    'Wrapping HttpClient in a using per call.',
    'Optimising without measuring first.'
  ],
  sections: {
    clr: {
      say: 'The CLR runs .NET code: C# compiles to IL, and the JIT turns IL into machine code at run time, first a quick Tier 0, then an optimised Tier 1 with Dynamic PGO for hot code. Value types copy and live where their container lives; reference types share one heap object. ReadyToRun or Native AOT trade size or flexibility for faster startup.',
      k: ['IL', 'JIT', 'tiered compilation', 'Dynamic PGO', 'ReadyToRun', 'value vs reference type', 'boxing', 'ref struct'],
      p: ['A struct field inside a class lives on the heap.', 'Keep structs small (~16 bytes) and readonly.', 'Boxing hides in ArrayList, object parameters and struct-to-interface casts.', 'Warm-up is real: first requests run Tier 0 code.'],
      f: [
        ['When would you use a struct instead of a class?', 'For small, short-lived, immutable values without identity, like money, coordinates or IDs, ideally a readonly record struct of about 16 bytes or less.'],
        ['What is boxing and how do you avoid it?', 'Copying a value type into a new heap object when it is stored as object or an interface. Use generics, generic constraints and typed APIs.'],
        ['Why is "structs live on the stack" only half true?', 'A value type lives wherever its container lives: a local is inline on the stack, but a struct field inside a class is on the heap.']
      ],
      q: [{ q: 'Which option compiles the whole app to native code with no JIT at all?', o: ['Tiered compilation', 'ReadyToRun', 'Native AOT', 'Dynamic PGO'], a: 2, e: 'ReadyToRun precompiles but still JITs hot paths; Native AOT removes the JIT entirely.' }]
    },
    gc: {
      say: 'The garbage collector frees objects nothing references. It uses generations because most objects die young: Gen 0 is cheap, Gen 2 and large-object-heap churn hurt. ASP.NET Core uses Server GC with DATAS, which sizes the heap to the live data. IDisposable releases resources deterministically, but you can still leak memory through events, static caches, closures and timers.',
      k: ['generations (Gen 0/1/2)', 'large object heap (85 KB+)', 'Server GC', 'DATAS', 'finalizer', 'IDisposable', 'SafeHandle', 'GC roots'],
      p: ['Dispose is about resources, not memory.', 'Finalizers make objects survive an extra GC; use SafeHandle instead.', 'DATAS trades a little throughput for a smaller heap; good in containers.', 'Never call GC.Collect() to fix memory in production.'],
      f: [
        ['IDisposable vs finalizer?', 'Dispose releases resources when you call it, via using. A finalizer is a GC safety net run later on one thread, and it delays collection. Wrap native handles in SafeHandle.'],
        ['Name four ways to leak memory in .NET.', 'Event handlers never unsubscribed, static dictionaries used as caches, lambdas capturing big objects, and undisposed timers.'],
        ['How would you find a memory leak in production?', 'Confirm growth with dotnet-counters, compare two dotnet-gcdump snapshots to see which types grow, then dotnet-dump gcroot to see what holds them.']
      ],
      q: [{ q: 'A class subscribes to a static event in its constructor and never unsubscribes. What happens?', o: ['The GC collects it normally', 'The publisher keeps every subscriber alive: a leak', 'The process crashes immediately', 'The event is removed after Gen 0'], a: 1, e: 'The static event holds a reference to each handler and its target, so they are never collected. Unsubscribe in Dispose.' }]
    },
    async: {
      say: 'async/await lets a thread start I/O, return to the pool while it waits, and resume later. The compiler rewrites the method into a state machine; if the awaited task is already done it simply continues. While I/O is in flight no thread is waiting, which is why it scales. It does not make one call faster or help CPU-bound work.',
      k: ['state machine', 'continuation', 'Task vs ValueTask', 'SynchronizationContext', 'ConfigureAwait(false)', 'async void', 'sync over async', 'CancellationToken'],
      p: ['Async all the way: one .Result undoes the benefit.', 'ValueTask: await once only, for measured hot paths.', 'ConfigureAwait(false) in libraries; optional in ASP.NET Core app code.', 'async void only for UI event handlers.'],
      f: [
        ['Task vs ValueTask?', 'Task by default. ValueTask avoids an allocation when a method usually completes synchronously, but must be awaited once and never read with .Result early.'],
        ['When does ConfigureAwait(false) matter?', 'In library code that may run under a UI or old ASP.NET context, to avoid resuming on it and deadlocking. ASP.NET Core has no SynchronizationContext.'],
        ['Why is async void dangerous?', 'The caller cannot await it and an unhandled exception crashes the process.'],
        ['Why does .Result deadlock in some apps?', 'With a SynchronizationContext, the continuation needs the thread that .Result is blocking. Without one, it starves the thread pool instead.']
      ],
      q: [{ q: 'In ASP.NET Core application code, what does ConfigureAwait(false) change?', o: ['Practically nothing, because there is no SynchronizationContext', 'It prevents all deadlocks', 'It makes the awaited call run faster', 'It forces the continuation onto the UI thread'], a: 0, e: 'ASP.NET Core has no SynchronizationContext, so there is no context to skip. It still matters in libraries.' }]
    },
    threadpool: {
      say: 'The thread pool is a shared set of workers. It hands out threads instantly up to a minimum, about the core count, then adds more slowly with hill climbing. Blocking calls like .Result on async I/O starve it: latency climbs while CPU stays low. The fix is to stop blocking and go async, not to add threads.',
      k: ['thread-pool starvation', 'hill climbing', 'queue length', 'SemaphoreSlim', 'System.Threading.Lock', 'Interlocked', 'Channel<T>', 'back-pressure'],
      p: ['Symptom: low CPU, high latency, growing queue length and thread count.', 'SetMinThreads only hides the blocking call.', 'Never hold a lock across an await; use SemaphoreSlim.WaitAsync.', 'Bound every channel or queue.'],
      f: [
        ['Your API is slow but CPU is at 15%. What do you suspect?', 'Thread-pool starvation from blocking calls. Check dotnet-counters for a growing thread-pool queue length and dotnet-stack for where threads are stuck.'],
        ['How do you cap concurrent calls to a downstream system in async code?', 'A SemaphoreSlim: await WaitAsync, call, and Release in finally.'],
        ['Why use a bounded Channel?', 'Producers wait when it is full, giving back-pressure. An unbounded queue just moves the out-of-memory error elsewhere.']
      ],
      q: [{ q: 'Which primitive is right for mutual exclusion around code that contains an await?', o: ['lock statement', 'System.Threading.Lock', 'Thread.Sleep', 'SemaphoreSlim with WaitAsync'], a: 3, e: 'You cannot await inside a lock; SemaphoreSlim.WaitAsync supports async mutual exclusion.' }]
    },
    di: {
      say: 'The built-in container creates services and controls lifetime: singleton is one per app, scoped one per request, transient a new one each injection. The classic bug is a captive dependency, a singleton holding a scoped DbContext that then lives forever. ValidateScopes and ValidateOnBuild catch it, and background services create a scope per unit of work.',
      k: ['singleton', 'scoped', 'transient', 'captive dependency', 'ValidateScopes', 'IServiceScopeFactory', 'keyed services', 'IOptionsMonitor'],
      p: ['Only depend on equal or longer lifetimes.', 'Validation is on by default only in Development; enable it in CI too.', 'IOptionsSnapshot in a singleton is captive; use IOptionsMonitor.', 'Add ValidateOnStart() so bad config fails at startup.'],
      f: [
        ['What is a captive dependency and how do you catch it?', 'A longer-lived service holding a shorter-lived one, like a singleton injecting a scoped DbContext. Turn on ValidateScopes and ValidateOnBuild.'],
        ['How does a BackgroundService use a DbContext?', 'It is a singleton, so inject IServiceScopeFactory and create an async scope per message or batch, resolving the DbContext inside it.'],
        ['IOptions vs IOptionsSnapshot vs IOptionsMonitor?', 'IOptions reads once (singleton). IOptionsSnapshot re-reads per request (scoped). IOptionsMonitor is a singleton with live updates and OnChange.']
      ],
      q: [{ q: 'A singleton cache needs settings that can change at run time. Which should it inject?', o: ['IOptions<T>', 'IOptionsSnapshot<T>', 'IOptionsMonitor<T>', 'A new ConfigurationBuilder per call'], a: 2, e: 'IOptionsMonitor is a singleton that sees changes; IOptionsSnapshot is scoped and would be captive.' }]
    },
    pipeline: {
      say: 'Each ASP.NET Core request flows through middleware in the order added, reaches an endpoint, and the response flows back in reverse. Order is behaviour: exception handler first, then HSTS, HTTPS redirection, static files, routing, rate limiter, CORS, authentication, authorization, output cache, endpoints. Endpoint filters handle per-endpoint concerns.',
      k: ['middleware', 'request pipeline', 'UseExceptionHandler', 'UseRouting', 'UseAuthentication / UseAuthorization', 'endpoint filters', 'ShortCircuit', 'Kestrel'],
      p: ['CORS -> authentication -> authorization, then output cache.', 'Rate limiter after routing for per-endpoint policies.', 'Code before await next() runs going in, after it coming out.', 'Minimal APIs support Native AOT; controllers do not.'],
      f: [
        ['Why must UseExceptionHandler come first?', 'It can only catch exceptions from middleware registered after it.'],
        ['What happens if UseAuthorization runs before UseAuthentication?', 'The user is not identified yet, so every request is treated as anonymous.'],
        ['Middleware vs endpoint filter?', 'Middleware runs for every request (logging, headers, exceptions). Endpoint filters run only for attached endpoints and see bound arguments, good for validation or idempotency keys.']
      ],
      q: [{ q: 'Which order is correct?', o: ['UseAuthorization, UseAuthentication, UseCors', 'UseCors, UseAuthentication, UseAuthorization', 'UseAuthentication, UseCors, UseAuthorization', 'UseOutputCache, UseCors, UseAuthentication'], a: 1, e: 'Microsoft docs order CORS, then authentication, then authorization, with output caching after all three.' }]
    },
    httpclient: {
      say: 'HttpClient is meant to be reused. A new one per call exhausts sockets in TIME_WAIT; one static client forever misses DNS changes. IHttpClientFactory with typed clients rotates handlers, about every 2 minutes by default, or use one static client with SocketsHttpHandler.PooledConnectionLifetime. Add AddStandardResilienceHandler for timeouts, retries and a circuit breaker.',
      k: ['socket exhaustion', 'TIME_WAIT', 'IHttpClientFactory', 'typed client', 'PooledConnectionLifetime', 'DNS refresh', 'AddStandardResilienceHandler', 'idempotent retry'],
      p: ['Disposing HttpClient is the bug, not the fix.', 'Default HttpClient.Timeout is 100 s: far too long for a request path.', 'Only retry idempotent calls or calls with an idempotency key.', 'Do not capture a typed client in a singleton.'],
      f: [
        ['Why not create a new HttpClient per request?', 'Each disposal leaves a socket in TIME_WAIT and under load you run out of ports. Reuse the handler via IHttpClientFactory or a pooled static client.'],
        ['What is wrong with one static HttpClient forever?', 'It reuses sockets but never sees DNS changes, unless you set PooledConnectionLifetime.'],
        ['What does AddStandardResilienceHandler add?', 'Rate limiting, total and per-attempt timeouts, retries and a circuit breaker, built on Polly v8. Do not also set a short HttpClient.Timeout.']
      ],
      q: [{ q: 'A console tool with no DI needs a long-lived HttpClient that still refreshes DNS. What do you use?', o: ['A static HttpClient over SocketsHttpHandler with PooledConnectionLifetime', 'new HttpClient() in a using per call', 'A static HttpClient with default settings', 'WebClient'], a: 0, e: 'PooledConnectionLifetime recycles connections so DNS changes are picked up while sockets are reused.' }]
    },
    efcore: {
      say: 'EF Core turns LINQ into SQL, and most performance problems come from loading too much too often: N+1 queries, tracking you do not need, and whole entities when you need three columns. Fix them with Select projections, AsNoTracking, AsSplitQuery and ExecuteUpdateAsync, and always read the generated SQL. DbContext is scoped and not thread-safe.',
      k: ['N+1 queries', 'projection (Select)', 'AsNoTracking', 'AsSplitQuery', 'cartesian explosion', 'ExecuteUpdateAsync', 'compiled queries', 'migration bundle'],
      p: ['Keep it IQueryable until the end; ToList too early filters in memory.', 'Avoid Database.Migrate() at startup in production; run scripts or bundles in the pipeline.', 'FromSql with interpolation is parameterised; FromSqlRaw with + is SQL injection.', 'Two parallel queries on one DbContext throw.'],
      f: [
        ['What is N+1 and how do you fix it?', 'One query for the list plus one per row, often from lazy loading in a loop. Use a Select projection (or Include) so it is one query.'],
        ['When do you use AsSplitQuery?', 'When including two or more collections creates a cartesian explosion of rows; split queries load each collection separately.'],
        ['How do you apply migrations in production?', 'Generate an idempotent SQL script or migration bundle, review it, and run it as a pipeline step with additive, backward-compatible changes.'],
        ['How do you expire 10,000 cards without loading them?', 'ExecuteUpdateAsync with a Where filter: one set-based UPDATE, no entities tracked.']
      ],
      q: [{ q: 'Which call is safe from SQL injection?', o: ['FromSqlRaw("... WHERE Bsb = \'" + bsb + "\'")', 'string.Format into FromSqlRaw', 'Concatenating into ExecuteSqlRaw', 'FromSql($"... WHERE Bsb = {bsb}")'], a: 3, e: 'Interpolated FromSql sends the value as a parameter; concatenation builds raw SQL.' }]
    },
    perf: {
      say: 'High-performance .NET is mostly about allocating less and moving work from run time to compile time, then proving it. Span<T> slices without copying, ArrayPool rents big buffers, and source generators handle JSON, regex, logging and config binding. Native AOT gives fast startup and low memory but breaks reflection-heavy code. Measure with BenchmarkDotNet and MemoryDiagnoser.',
      k: ['Span<T>', 'Memory<T>', 'ArrayPool', 'stackalloc', 'source generators', '[GeneratedRegex]', 'Native AOT', 'BenchmarkDotNet'],
      p: ['Measure first: profile, then benchmark the hot spot.', 'Allocation rate is the best proxy for GC cost; watch "Allocated".', 'Span is stack-only; use Memory<T> across await.', 'AOT: fix every trim warning; MVC controllers are not supported.'],
      f: [
        ['Span<T> vs Memory<T>?', 'Span is a stack-only view for sync code. Memory can live on the heap and cross an await, so it suits async I/O buffers.'],
        ['Native AOT: gains and costs?', 'Fast startup, small memory, single file. But no runtime code generation, trimming breaks reflection-heavy libraries, and peak throughput can be a little lower than JIT with PGO.'],
        ['Name three source generators that help performance.', 'System.Text.Json JsonSerializerContext, [GeneratedRegex] and [LoggerMessage]; also the configuration binding generator.']
      ],
      q: [{ q: 'You need a buffer that must be used across an await in an async method. Which type fits?', o: ['Span<byte>', 'stackalloc byte[]', 'Memory<byte>', 'ref struct buffer'], a: 2, e: 'Span and stackalloc memory are stack-only and cannot cross an await; Memory<T> can.' }]
    },
    orleans: {
      say: 'Orleans is Microsoft\'s virtual actor framework. You write grains, small single-threaded objects with a key and state, and silos host them across a cluster. A grain always exists: it is activated when called and deactivated when idle, and recovered on another silo if one dies. It suits many independent stateful entities; it is overkill for CRUD.',
      k: ['virtual actor', 'grain', 'silo', 'activation', 'location transparency', 'single-threaded', 'reminders', 'reentrancy'],
      p: ['One call at a time per grain: no locks in your code.', 'A hot grain is a bottleneck; design keys so load spreads.', 'A -> B -> A call cycles can deadlock without reentrancy.', 'Poor fit: set-based queries across all entities.'],
      f: [
        ['What does "virtual" actor mean?', 'You never create or destroy a grain. The runtime activates it on first call, deactivates it when idle, and the caller only knows its interface and key.'],
        ['When is Orleans a good fit?', 'Many independent entities with their own hot state, like accounts, devices, carts or sessions, needing low latency and scale-out without distributed locks.'],
        ['What happens if you block with .Result inside a grain?', 'Grains process one request at a time, so blocking stalls every caller of that grain.']
      ],
      q: [{ q: 'Why does an Orleans grain usually need no locks?', o: ['It runs on the UI thread', 'It processes one request at a time by default', 'It stores all state in SQL', 'Orleans disables multithreading globally'], a: 1, e: 'Grains are single-threaded by default, so their state is never touched by two calls at once.' }]
    },
    'dotnet-core': {
          say: '.NET Framework 4.8.x is Windows-only and in maintenance: supported with Windows, but frozen. .NET Core made .NET cross-platform, open source and side-by-side, and since .NET 5 it is one platform released every November. Even numbers are LTS for 3 years, odd are STS for 24 months. .NET 10 is the current LTS; .NET 8 and 9 end on 10 November 2026.',
          k: ['.NET Framework 4.8.x', '.NET Core', 'LTS vs STS', 'net10.0 / netstandard2.0', 'SDK vs runtime', 'self-contained', 'PublishContainer', 'strangler fig'],
          p: ['Even = LTS (3 years), odd = STS (24 months since .NET 9).', 'The SDK builds, the runtime runs; servers only need the runtime.', 'netstandard2.0 only for libraries still shared with Framework apps.', 'Migrate incrementally: YARP in front, libraries first; WCF and Web Forms are the hard parts.'],
          f: [
            ['Why move off .NET Framework?', 'It is supported but gets no new features: no Linux containers, no performance gains, harder hiring. Modern .NET is faster every release, cross-platform and container-friendly.'],
            ['LTS or STS for an enterprise service?', 'LTS (3 years) for long-lived services. STS now gets 24 months, so it suits teams that upgrade every year.'],
            ['Framework-dependent vs self-contained vs Native AOT?', 'Framework-dependent is small but needs the runtime installed. Self-contained bundles the runtime per OS/CPU. Native AOT compiles to native code for fast startup but restricts reflection.'],
            ['.NET 8 support ends on 10 Nov 2026. What is your plan?', 'Inventory apps, move to net10.0, update packages, review breaking changes, run CI tests, roll out in waves.'],
            ['How do you migrate a large ASP.NET (System.Web) app?', 'Strangler fig: put YARP in front, move routes one at a time to ASP.NET Core, share session and auth with System.Web adapters, multi-target shared libraries first.']
          ],
          q: [{ q: 'How long is a .NET STS release supported, starting with .NET 9?', o: ['24 months', '18 months', '12 months', '36 months'], a: 0, e: 'Microsoft extended STS from 18 to 24 months in September 2025, effective from .NET 9. LTS stays at 3 years.' }]
        },
    'middleware': {
          say: 'A middleware gets the HttpContext and next: work before await next(), work after it, or skip next to short-circuit. Use inline Use for small things, Run to end a branch, Map or UseWhen to branch, a convention class for reuse, and IMiddleware when you need scoped constructor dependencies. Global errors: IExceptionHandler plus AddProblemDetails.',
          k: ['RequestDelegate', 'InvokeAsync', 'Use / Run / Map', 'UseWhen', 'IMiddleware', 'short-circuit', 'IExceptionHandler', 'Response.OnStarting'],
          p: ['Convention middleware is built once: inject scoped services into InvokeAsync.', 'Not calling next is the short-circuit; set the status code first.', 'Headers after the response has started throw: use Response.OnStarting.', 'Middleware sees raw HttpContext; filters see bound arguments.'],
          f: [
            ['Use vs Run vs Map?', 'Use runs and calls next; Run is terminal; Map forks by path and never rejoins (UseWhen rejoins).'],
            ['Convention-based vs IMiddleware?', 'Convention: one instance for the app, scoped services go into InvokeAsync. IMiddleware: registered in DI and resolved per request, so scoped constructor dependencies are fine.'],
            ['How do you handle exceptions globally in .NET 8+?', 'AddProblemDetails, AddExceptionHandler<T> with IExceptionHandler.TryHandleAsync, and UseExceptionHandler first in the pipeline. .NET 10 no longer logs handled exceptions for you.'],
            ['Write a request-timing middleware.', 'Class with a RequestDelegate; Stopwatch.GetTimestamp, await next in try, log method, path, status and elapsed time in finally.'],
            ['Middleware, MVC filter or endpoint filter?', 'Every request and raw HTTP: middleware. Needs bound arguments or action metadata: MVC filter (controllers) or endpoint filter (minimal APIs).']
          ],
          q: [{ q: 'Your convention-based middleware takes a scoped DbContext in its constructor. What happens?', o: ['It becomes a captive dependency: one context for the app (scope validation throws in Development)', 'ASP.NET Core creates a new middleware instance per request', 'The DbContext is disposed after each request and recreated automatically', 'Nothing; middleware constructors are resolved per request'], a: 0, e: 'Convention middleware is constructed once per app. Inject scoped services into InvokeAsync, or use IMiddleware.' }]
        },
    'webapi': {
          say: 'ASP.NET Core APIs use controllers with ApiController or minimal APIs; Microsoft recommends minimal APIs for new work. A request is routed, bound, validated (AddValidation in .NET 10), handled and returned as TypedResults. Errors are RFC 9457 ProblemDetails. OpenAPI is built in, 3.1 by default in .NET 10. Rate limiting and output caching are built in; test with WebApplicationFactory.',
          k: ['[ApiController]', 'minimal APIs', 'TypedResults', 'AddValidation', 'ProblemDetails / RFC 9457', 'AddOpenApi', 'AddRateLimiter', 'WebApplicationFactory'],
          p: ['[ApiController]: attribute routing, auto-400, binding inference, ProblemDetails.', 'Route constraints pick routes; a mismatch is 404, not validation.', 'Rate limiter rejects with 503 by default: set RejectionStatusCode to 429.', 'Swashbuckle left the template in .NET 9; use Microsoft.AspNetCore.OpenApi.'],
          f: [
            ['Controllers or minimal APIs?', 'Minimal APIs for new services and Native AOT. Controllers when you need custom model binders, OData, application parts, or have a large existing MVC codebase.'],
            ['What does [ApiController] add?', 'Required attribute routing, automatic 400 ValidationProblemDetails, binding source inference, multipart/form-data inference and ProblemDetails for error status codes.'],
            ['How is minimal API validation done in .NET 10?', 'builder.Services.AddValidation(): a source generator plus an endpoint filter check DataAnnotations and IValidatableObject and return 400 ProblemDetails.'],
            ['What changed with OpenAPI in .NET 9 and 10?', '.NET 9: built-in AddOpenApi/MapOpenApi in Microsoft.AspNetCore.OpenApi, Swashbuckle removed from the template. .NET 10: OpenAPI 3.1 by default and YAML output.'],
            ['How do you integration-test an API?', 'WebApplicationFactory<Program> from Microsoft.AspNetCore.Mvc.Testing runs the real pipeline in memory; .NET 10 generates the public partial Program class.']
          ],
          q: [{ q: 'What status code does the built-in ASP.NET Core rate limiter return by default when it rejects a request?', o: ['503 Service Unavailable', '429 Too Many Requests', '400 Bad Request', '403 Forbidden'], a: 0, e: 'RateLimiterOptions.RejectionStatusCode defaults to 503; set it to 429 explicitly.' }]
        },
    'mvc': {
          say: 'MVC routes a request to a controller action, which uses the model and returns a view or other result. Filters run in order: authorization, resource, model binding, action, exception, result. Razor Pages pair each page with a PageModel. Blazor in .NET 8+ has static SSR, Interactive Server, Interactive WebAssembly and Interactive Auto render modes.',
          k: ['Model-View-Controller', 'filter pipeline', 'action filter', 'tag helpers', 'view components', 'antiforgery', 'Razor Pages / PageModel', 'Blazor render modes'],
          p: ['Filter order: Authorization, Resource, binding, Action, Exception, Result.', 'Partial view = markup reuse; view component = markup + logic + DI.', 'Razor Pages validate antiforgery automatically; MVC needs ValidateAntiForgeryToken.', 'Blazor default is static SSR; opt into interactivity with @rendermode.'],
          f: [
            ['Walk through the MVC filter order.', 'Authorization, resource (before binding), model binding, action filters around the action, exception filters if it threw, result filters around the result; resource filters finish last.'],
            ['Partial view vs view component?', 'A partial view reuses markup with the parent model. A view component has its own class, logic and DI, like a small controller called from a view.'],
            ['Razor Pages vs MVC?', 'Same Razor engine and pipeline. Razor Pages: one page with one PageModel and handlers like OnPostAsync. MVC: controllers serve many views; better for large apps.'],
            ['Blazor Interactive Server vs WebAssembly?', 'Server: UI events over a SignalR circuit, thin client, server memory and latency. WebAssembly: runs in the browser, needs an API, bigger first download.'],
            ['When would you choose a SPA plus Web API?', 'A separate front-end team, a rich client, or several clients (web and mobile) sharing one API. Cost: two stacks and BFF/token handling.']
          ],
          q: [{ q: 'Which MVC filter type runs before model binding and wraps most of the pipeline?', o: ['Resource filter', 'Action filter', 'Result filter', 'Exception filter'], a: 0, e: 'Only authorization filters run before resource filters; OnResourceExecuting runs before model binding and OnResourceExecuted runs last.' }]
        },
    'authn-authz': {
          say: 'Authentication proves who the caller is and builds the ClaimsPrincipal; authorisation decides what they may do. Register schemes with AddAuthentication: cookies for server-rendered apps and BFFs, JWT bearer for APIs, OpenID Connect to sign in through an IdP such as Entra ID. Validate signature, issuer, audience and lifetime, and put rules in named policies with requirement handlers.',
          k: ['ClaimsPrincipal', 'scheme + handler', 'JWT bearer', 'OpenID Connect', 'policy + requirement', 'IAuthorizationService', 'BFF', '401 vs 403'],
          p: ['UseAuthentication before UseAuthorization, both after UseRouting.', 'Validate issuer, audience, lifetime and signing key; ClockSkew defaults to 5 minutes.', 'Policies over role checks; resource-based checks via IAuthorizationService.', 'SPA tokens stay server-side (BFF + HttpOnly cookie), never localStorage.'],
          f: [
            ['401 vs 403?', '401: not authenticated, the handler challenges. 403: authenticated but not allowed, the handler forbids.'],
            ['Cookie vs JWT bearer vs OpenID Connect?', 'Cookie for server-rendered apps and BFFs; JWT bearer for APIs; OIDC to sign in through an external IdP, usually followed by a cookie session.'],
            ['How do you build a custom authorisation rule?', 'An IAuthorizationRequirement plus an AuthorizationHandler that calls context.Succeed, registered in DI and added to a named policy with AddAuthorizationBuilder().AddPolicy.'],
            ['How do you revoke a JWT?', 'You cannot cheaply: keep access tokens short-lived, revoke refresh tokens, and use introspection or reference tokens only when you must.'],
            ['What does Microsoft.Identity.Web add?', 'Entra ID integration: AddMicrosoftIdentityWebApi or AddMicrosoftIdentityWebApp, token validation for Entra tokens and token acquisition for downstream APIs.']
          ],
          q: [
            { q: 'A user is signed in but lacks the required claim. What should the API return?', o: ['403 Forbidden', '401 Unauthorized', '404 Not Found', '302 to the login page'], a: 0, e: 'The user is known (authenticated) but not allowed, so the handler forbids with 403. 401 means not authenticated.' },
            { q: 'Where should a browser SPA keep its access token?', o: ['On the server, behind a BFF with an HttpOnly cookie', 'In localStorage', 'In sessionStorage', 'In a JavaScript global variable'], a: 0, e: 'Browser storage readable by JavaScript is exposed to XSS. A BFF keeps tokens server-side and the browser only holds an HttpOnly cookie.' }
          ]
        },
    'ef-essentials': {
          say: 'A DbContext is a short-lived, scoped unit of work. The change tracker moves entities through Added, Unchanged, Modified, Deleted and Detached, and SaveChanges writes all changes in one transaction. Configure with the Fluent API, ship migrations as idempotent scripts or bundles, use rowversion for optimistic concurrency, and global query filters for soft delete and tenancy.',
          k: ['unit of work', 'change tracker', 'entity states', 'SaveChanges transaction', 'migration bundle', 'rowversion', 'global query filter', 'complex types'],
          p: ['AddDbContext scoped; AddDbContextPool for hot paths; AddDbContextFactory for jobs and Blazor.', 'Eager Include or explicit loading; lazy loading hides N+1.', 'FromSql with interpolation is parameterised; never concatenate SQL.', 'EF 10: named query filters, LeftJoin/RightJoin, complex types as JSON, SQL Server vector type.'],
          f: [
            ['What are the entity states?', 'Added, Unchanged, Modified, Deleted and Detached. SaveChanges turns Added, Modified and Deleted into INSERT, UPDATE and DELETE.'],
            ['Is SaveChanges transactional?', 'Yes, one SaveChanges call runs in one transaction. For several saves use BeginTransactionAsync, wrapped in CreateExecutionStrategy().ExecuteAsync when retries are enabled.'],
            ['How do you handle two users editing the same row?', 'Optimistic concurrency: a [Timestamp] rowversion column. A stale update throws DbUpdateConcurrencyException; reload and retry, merge, or return 409.'],
            ['How do you apply migrations in production?', 'Generate an idempotent SQL script or a migration bundle, review it and run it as a pipeline step. Do not call Migrate() at app start-up.'],
            ['EF Core or Dapper?', 'EF Core for writes, change tracking and migrations; Dapper for hot, hand-tuned reads. Many systems use both, CQRS-style.']
          ],
          q: [
            { q: 'What does a DbUpdateConcurrencyException tell you?', o: ['The row changed since you read it', 'The connection pool is exhausted', 'A migration is pending', 'Two queries ran on one context at once'], a: 0, e: 'With a concurrency token, EF adds it to the WHERE clause. Zero rows affected means someone else changed the row, so EF throws DbUpdateConcurrencyException.' },
            { q: 'Which EF Core 10 feature lets you disable only the soft-delete filter in one query?', o: ['Named query filters', 'Compiled models', 'Split queries', 'Lazy loading proxies'], a: 0, e: 'EF 10 named query filters can be switched off individually with IgnoreQueryFilters(["Name"]).' }
          ]
        },
    'config-hosting': {
          say: 'Configuration is a stack of providers and the last one wins: appsettings.json, the environment file, user secrets in Development, environment variables, command line, then anything added later such as Key Vault. Bind sections with the options pattern, validate with ValidateOnStart, run workers as BackgroundService with a scope per unit of work, and expose separate liveness and readiness health checks.',
          k: ['configuration providers', 'last one wins', 'IOptionsMonitor', 'ValidateOnStart', 'Key Vault + managed identity', 'Generic Host', 'BackgroundService', 'liveness vs readiness'],
          p: ['IOptions singleton fixed; IOptionsSnapshot scoped per request; IOptionsMonitor singleton live.', 'Environment variables use __ for nesting; Key Vault secret names use --.', 'Hosted services are singletons: use IServiceScopeFactory for scoped services.', 'Liveness has no dependency checks; readiness checks the database and queues.'],
          f: [
            ['What is the default configuration order?', 'appsettings.json, appsettings.{Environment}.json, user secrets (Development), environment variables, command line. Later providers override earlier ones.'],
            ['How do you fail fast on bad configuration?', 'AddOptions().BindConfiguration(...).ValidateDataAnnotations().ValidateOnStart(), or a source-generated [OptionsValidator]. The app fails at start-up instead of on first use.'],
            ['IHostedService vs BackgroundService?', 'IHostedService gives you StartAsync and StopAsync to implement. BackgroundService implements them and gives you one long-running ExecuteAsync loop with a stopping token.'],
            ['Where do secrets live?', 'User secrets on a developer machine; Azure Key Vault via the configuration provider and managed identity in the cloud. Never in appsettings or source control.'],
            ['Liveness vs readiness?', 'Liveness: is the process alive, failure means restart. Readiness: can it serve traffic now, failure means stop routing to it.']
          ],
          q: [
            { q: 'A setting is in appsettings.json, appsettings.Production.json and an environment variable. Which value does a Production app see?', o: ['The environment variable', 'appsettings.json', 'appsettings.Production.json', 'Whichever file changed last'], a: 0, e: 'Environment variables are added after the JSON files, and the last provider wins.' },
            { q: 'Which options interface can a singleton use to see reloaded values?', o: ['IOptionsMonitor', 'IOptionsSnapshot', 'IOptions', 'IConfigureOptions'], a: 0, e: 'IOptionsMonitor is a singleton with CurrentValue and OnChange. IOptionsSnapshot is scoped, and IOptions never reloads.' }
          ]
        },
    'wcf': {
          say: 'WCF is the .NET Framework SOAP and RPC stack built on Address, Binding and Contract, with WS-* features and heavy config. The server side is not in modern .NET. CoreWCF ports it to ASP.NET Core so SOAP clients do not change; otherwise move each contract to gRPC for internal RPC, REST for reach, or messaging for one-way calls.',
          k: ['ABC: address, binding, contract', 'SOAP / WS-*', 'basicHttp, wsHttp, netTcp', 'CoreWCF', 'System.ServiceModel client', 'dotnet-svcutil', 'gRPC-Web / JSON transcoding'],
          p: ['WCF server is .NET Framework only; the WCF client works on .NET 10.', 'CoreWCF = lift and shift; Microsoft publishes a support policy for it.', 'Decide per contract and consumer, not a big-bang rewrite.', 'Upgrade Assistant is deprecated; use GitHub Copilot app modernization.'],
          f: [
            ['What is WCF\'s ABC?', 'Address (where the service lives), Binding (transport, encoding, security) and Contract (operations and data).'],
            ['How would you migrate a WCF estate?', 'Inventory bindings, features and consumers. Use CoreWCF where clients cannot change, add gRPC or REST endpoints side by side for new consumers, and retire old endpoints by usage.'],
            ['What replaces a netTcp duplex callback?', 'gRPC bidirectional streaming for service-to-service, or SignalR for real-time pushes to clients.'],
            ['Can a .NET 10 app call an existing WCF service?', 'Yes: System.ServiceModel.Http or .NetTcp client packages, with a proxy generated by dotnet-svcutil or a ChannelFactory.'],
            ['Why not gRPC for a public browser API?', 'Browsers cannot speak raw gRPC over HTTP/2. You need gRPC-Web or JSON transcoding, so REST is often simpler for broad reach.']
          ],
          q: [{ q: 'You must move WCF services off .NET Framework, and 40 external partners call them over SOAP and cannot change their code. Best first step?', o: ['Host the same contracts on CoreWCF', 'Rewrite them as gRPC services', 'Replace them with REST APIs', 'Move the calls to a message queue'], a: 0, e: 'CoreWCF keeps the SOAP contracts and bindings, so partner clients keep working while the host moves to modern .NET.' }]
        },
    'modern-dotnet': {
          say: 'Pick a few features per release and the problem each solves. C# 12 and .NET 8: primary constructors, collection expressions, TimeProvider, FrozenDictionary, keyed DI. C# 13 and .NET 9: params collections, the Lock type, Task.WhenEach, built-in OpenAPI; HybridCache went GA in 2025. C# 14 and .NET 10: the field keyword, extension members, file-based apps and minimal API validation.',
          k: ['primary constructors', 'collection expressions', 'TimeProvider', 'Lock type', 'Task.WhenEach', 'HybridCache', 'field keyword', 'extension members'],
          p: ['C# 12 = .NET 8, C# 13 = .NET 9, C# 14 = .NET 10.', 'HybridCache is a NuGet package, GA in 9.3.0 (March 2025).', 'OpenAPI generation is built in since ASP.NET Core 9; 3.1 by default in 10.', 'Always pair a feature with a real use: "TimeProvider removed our flaky tests".'],
          f: [
            ['What is new in C# 14?', 'The field keyword for property accessors, extension members (extension properties and static extensions), null-conditional assignment, and more implicit Span conversions.'],
            ['Primary constructor parameter vs readonly field?', 'The parameter is captured and mutable, and it is not a property except in records. Assign it to a readonly field if you need immutability.'],
            ['How do you test code that depends on time?', 'Inject TimeProvider and use FakeTimeProvider in tests, advancing time instead of sleeping.'],
            ['What does Task.WhenEach give you?', 'An IAsyncEnumerable you await foreach over, yielding each task as it completes, instead of looping on Task.WhenAny.'],
            ['What are file-based apps?', '.NET 10 lets you run a single .cs file with dotnet run app.cs, adding packages with #:package; they publish as Native AOT by default.']
          ],
          q: [{ q: 'Which feature arrived with C# 13 / .NET 9?', o: ['params collections and the System.Threading.Lock type', 'The field keyword and extension members', 'Primary constructors for classes', 'File-based apps with dotnet run app.cs'], a: 0, e: 'params collections and Lock came in C# 13 / .NET 9. field and extension members are C# 14, primary constructors C# 12, file-based apps .NET 10.' }]
        }
  }
};
