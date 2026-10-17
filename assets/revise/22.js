/* Quick-revision data for 22-dotnet-engineering-deep-dive.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['22'] = {
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
    }
  }
};
