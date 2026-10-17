/* Quick-revision data for 01-foundations.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['01'] = {
  approach: [
    ['Name the work type', 'Is it CPU-bound (compute) or I/O-bound (waiting on network, disk, DB)?'],
    ['Pick the execution model', 'Process for isolation, threads for shared memory, async for waiting, parallelism for cores.'],
    ['Decide sync or async between systems', 'Sync when the user needs the answer now; async (queue, 202 + status) when work can finish later.'],
    ['Handle shared state', 'Locks, SemaphoreSlim, Interlocked, concurrent collections or immutable data; never block on async.'],
    ['Size it with numbers', 'Requests/day to req/s, peak 2-5x, Little\'s Law for concurrency, storage per day/year.'],
    ['Close with metrics', 'Report p50/p95/p99 latency and throughput, not averages.']
  ],
  traps: [
    'Mixing up concurrency (juggling) and parallelism (simultaneous on cores).',
    'Claiming async makes a single request faster; it improves throughput and decoupling.',
    'Quoting average latency instead of p95/p99.',
    'Wrapping I/O in Task.Run or blocking with .Result / .Wait().'
  ],
  sections: {
    'process-thread': {
      say: 'A process is a running program with its own isolated memory; a thread is a worker inside a process that shares its heap but has its own stack and registers. Threads are cheaper and communicate through shared memory, but need locks; processes are safer and talk through IPC.',
      k: ['address space', 'heap vs stack', 'context switch', 'IPC', 'race condition', 'deadlock', 'thread pool', 'GIL'],
      p: ['Process switch costs more than thread switch: memory mappings change.', 'One bad thread can crash the whole process; a crashed process dies alone.', 'Thread pools reuse threads instead of creating one per request.', 'Never hold a lock across an await; use SemaphoreSlim.WaitAsync.'],
      f: [['Why are threads cheaper than processes?', 'They share the parent process\'s memory and resources, so creating and switching them needs no new address space.'],
          ['How do processes communicate versus threads?', 'Threads share variables in the same heap, which is fast but needs locks. Processes use IPC: pipes, sockets, message queues or shared memory, which is slower but safer.'],
          ['Why use multiple processes for CPU-bound Python?', 'The GIL lets only one thread run Python code at a time, so threads cannot use multiple cores for CPU work.']],
      q: [{ q: 'Which of these do threads in the same process NOT share?', o: ['The heap', 'Global variables', 'Their stack', 'Open file handles'], a: 2, e: 'Each thread has its own stack and registers; heap, globals and file handles are shared.' }]
    },
    concurrency: {
      say: 'Concurrency is dealing with many tasks by switching between them; parallelism is doing many tasks at the same instant on multiple cores. I/O-bound work gains most from concurrency and async; CPU-bound work gains from parallelism, limited by Amdahl\'s law.',
      k: ['concurrency', 'parallelism', 'I/O-bound', 'CPU-bound', 'event loop', 'Amdahl\'s law', 'MaxDegreeOfParallelism', 'back-pressure'],
      p: ['Concurrency without parallelism: a single-core event loop.', 'Amdahl\'s law: the serial part caps the total speed-up.', 'Async I/O is already concurrent; Task.Run around it only adds overhead.'],
      f: [['Can you have concurrency without parallelism?', 'Yes. A single-core event loop interleaves many tasks but only runs one at any instant.'],
          ['Which .NET tools fit I/O-bound vs CPU-bound work?', 'I/O-bound: async/await, Task.WhenAll, Parallel.ForEachAsync with a cap. CPU-bound: PLINQ or Parallel.For across cores.']],
      q: [{ q: 'A job is 25% inherently serial. What limits the best speed-up from adding cores?', o: ['Little\'s Law', 'The CAP theorem', 'The thread pool size', 'Amdahl\'s law'], a: 3, e: 'Amdahl\'s law: the part that cannot run in parallel bounds the total speed-up (here, at most 4x).' }]
    },
    'sync-async': {
      say: 'Synchronous means the caller waits for the answer; asynchronous means it moves on and gets the result later. In code, async releases the thread while waiting. Between systems, a queue decouples services in time and absorbs spikes, at the cost of eventual consistency, retries and correlation.',
      k: ['non-blocking I/O', 'async/await', '202 Accepted', 'async request-reply', 'correlation ID', 'idempotent consumer', 'load levelling', 'eventual consistency'],
      p: ['Async does not make one request faster: it improves throughput, resilience and decoupling.', 'Long jobs: POST returns 202 + status URL, then poll or webhook.', 'Async consumers must be idempotent: messages can arrive twice.', 'Never block on async with .Result or .Wait(): thread-pool starvation.'],
      f: [['When do you choose sync versus async between services?', 'Sync when the user needs the answer to continue, like queries or validation. Async when the work can finish later or fan out, like long jobs, notifications and integration.'],
          ['Describe the async request-reply pattern.', 'The client POSTs the job and gets 202 Accepted with a Location status URL. It polls the status or receives a webhook, then gets 200 with the result URL.'],
          ['Why is a chain of sync calls risky?', 'A calls B calls C: latency adds up and each hop multiplies the chance of failure.']],
      q: [{ q: 'What is the main benefit of putting a queue between two services?', o: ['Each request completes faster', 'Strong immediate consistency', 'The services are decoupled in time and spikes are absorbed', 'Tracing becomes simpler'], a: 2, e: 'A queue lets the consumer be down or slow while load is levelled; it adds latency and tracing complexity rather than removing it.' }]
    },
    latency: {
      say: 'Latency is how long one request takes, throughput is how many complete per second, and bandwidth is the maximum the pipe can carry. Report percentiles, p50, p95 and p99, not averages. Batching raises throughput but can add latency.',
      k: ['latency', 'throughput', 'bandwidth', 'p99 / tail latency', 'Little\'s Law', 'batching', 'histogram'],
      p: ['Little\'s Law: L = arrival rate x time in system; 200 req/s x 0.5 s = 100 in flight.', 'One slow dependency drives p99.', 'Measure latency with a histogram, throughput with a counter.'],
      f: [['Why does p99 matter more than the average?', 'If one page calls 10 services, most users hit at least one tail-latency call. The average hides that pain.'],
          ['Use Little\'s Law: 200 req/s, each takes 0.5 s. How many concurrent workers?', 'L = 200 x 0.5 = 100 requests in flight, so about 100 concurrent workers.']],
      q: [{ q: 'You batch writes to the database. What usually happens?', o: ['Throughput rises, per-item latency may rise', 'Both throughput and latency fall', 'Bandwidth increases', 'p99 latency always improves'], a: 0, e: 'Batching does more work per trip (higher throughput) but items wait to fill the batch, adding latency.' }]
    },
    estimation: {
      say: 'Back-of-the-envelope estimates size a design quickly. Convert daily volume to requests per second, multiply for peak, then estimate storage per day and year. Use the latency ladder: memory is far faster than a network hop, so caching and data locality matter. Round to orders of magnitude.',
      k: ['latency ladder', 'req/s', 'peak factor', 'orders of magnitude', '86,400 s/day', 'storage growth'],
      p: ['1 day ~ 86,400 s ~ 10^5 s; 1M requests/day ~ 12 req/s.', 'Peak ~ 2-5x average.', 'RAM ~100 ns, DC round trip ~0.5 ms, Sydney-US West ~150 ms.', '99.9% availability ~ 8.8 h downtime/year.'],
      f: [['Estimate: 10M users x 5 calls/day.', '50M/day / 86,400 ~ 580 req/s average, about 1,700 req/s peak. At 1 KB per record that is ~50 GB/day, ~18 TB/year.'],
          ['Roughly how slow is a Redis GET versus a RAM read?', 'A Redis GET over the network is ~0.5-1 ms; a RAM read is ~100 ns, thousands of times faster.'],
          ['How do you check an estimate in .NET?', 'BenchmarkDotNet for the cost of one operation, a load test (k6, Azure Load Testing) for req/s, and dotnet-counters to see which resource runs out first.']],
      q: [{ q: 'A service gets 1 million requests per day. What is the average rate?', o: ['About 12 req/s', 'About 1 req/s', 'About 120 req/s', 'About 1,000 req/s'], a: 0, e: '1,000,000 / 86,400 s ~ 11.6, so about 12 req/s on average (plan for 2-5x at peak).' }]
    },
    'locks': {
          say: 'A race condition is when the result depends on thread timing, like two read-modify-write updates where one is lost. Protect critical sections with a lock, a semaphore, or atomic compare-and-swap. In the database, use optimistic row versions for rare conflicts and SELECT FOR UPDATE for hot rows. Prevent deadlock with a fixed lock order, timeouts and small lock scope.',
          k: ['critical section', 'read-modify-write', 'compare-and-swap', 'mutex vs semaphore', 'optimistic concurrency', 'SELECT FOR UPDATE', 'Coffman conditions', 'lock ordering'],
          p: ['count++ is read, add, write: not atomic.', 'Mutex lets in 1, semaphore N, reader-writer lock many readers or 1 writer.', 'Deadlock needs all four: mutual exclusion, hold and wait, no preemption, circular wait.', 'An in-process lock does nothing across two servers: use the DB or a distributed lock.'],
          f: [['What are the four Coffman conditions?', 'Mutual exclusion, hold and wait, no preemption and circular wait. Break any one to prevent deadlock: lock ordering breaks circular wait, timeouts break no preemption.'],
              ['Optimistic vs pessimistic concurrency?', 'Optimistic: read a row version or ETag, update WHERE version matches, retry on conflict; best when conflicts are rare. Pessimistic: SELECT ... FOR UPDATE locks the row until commit; best for hot rows.'],
              ['Livelock vs starvation?', 'Livelock: threads keep reacting and retrying but none progresses; fix with random jitter. Starvation: one thread never gets the resource; fix with fair queues and short hold times.'],
              ['How does EF Core do optimistic concurrency?', 'Mark a [Timestamp] / IsRowVersion() property. EF adds it to the UPDATE WHERE clause and throws DbUpdateConcurrencyException if 0 rows changed.']],
          q: [{ q: 'Two threads take locks A and B in opposite orders and hang. Which fix removes the circular wait?', o: ['Always acquire A before B', 'Use a reader-writer lock', 'Add more threads', 'Make the locks reentrant'], a: 0, e: 'A single global lock order means no thread can hold B while waiting for A, so no cycle can form.' },
              { q: 'Conflicts on a record are rare and you want no locks held between read and write. What fits?', o: ['Optimistic concurrency with a row version', 'SELECT ... FOR UPDATE', 'A static lock in the API', 'Serializable isolation for every query'], a: 0, e: 'Optimistic concurrency checks the version at write time and retries only on the rare conflict.' }]
        },
    'concurrency-models': {
          say: 'There are five common concurrency models. Shared memory with locks is fast but risks races and deadlocks. An event loop runs one thread over async I/O, but blocking it freezes everything. Actors own state and process one message at a time. Channels connect producers and consumers with back-pressure. Data parallelism splits CPU work across cores. Real systems mix them.',
          k: ['shared memory', 'event loop', 'actor model', 'mailbox', 'CSP / channels', 'back-pressure', 'data parallelism', 'virtual actors'],
          p: ['Event loop: never block it with CPU work or sync I/O.', 'Actors: no locks, but watch mailbox overflow and A to B to A call cycles.', 'Channels: always bound them so memory cannot grow forever.', 'Data parallelism is for CPU-bound work; Amdahl caps the speed-up.'],
          f: [['When do you pick the actor model?', 'Many independent stateful entities such as accounts, devices or sessions. Each actor owns its state and handles one message at a time, so no locks. Orleans, Akka.NET and Erlang.'],
              ['What is CSP?', 'Communicating sequential processes: tasks share data by passing it through channels instead of shared memory. Go channels and System.Threading.Channels in .NET.'],
              ['Main failure mode of each model?', 'Locks: races and deadlocks. Event loop: one blocking call stalls all. Actors: full mailboxes and call-cycle deadlocks. Channels: unbounded buffers and blocked sends. Data parallel: overhead on small jobs.']],
          q: [{ q: 'A Node.js API slows down for every user when one request resizes an image. Why?', o: ['The CPU work blocks the single event-loop thread', 'The libuv pool has too many threads', 'Async I/O is slower than sync I/O', 'The garbage collector is disabled'], a: 0, e: 'JavaScript runs on one event-loop thread; CPU-heavy work blocks it, so move it to worker_threads or another service.' }]
        },
    'os': {
          say: 'The kernel owns CPU, memory, files and sockets; apps reach them through system calls. A container that exceeds its memory limit is SIGKILLed: exit 137, OOMKilled, no exception. Every socket is a file descriptor and outbound connections use ephemeral ports, so reuse connections. Async scales because epoll, kqueue, IOCP or io_uring let a few threads wait on thousands of sockets.',
          k: ['system call', 'virtual memory', 'OOMKilled / 137', 'file descriptor', 'ephemeral ports', 'context switch', 'epoll / kqueue / IOCP', 'io_uring'],
          p: ['OOM kill = cgroup memory limit hit; SIGKILL, so no catch, no finally, no dump.', 'Too many open files = fd limit; SocketException under load = port exhaustion. Reuse connections.', 'Readiness (epoll, kqueue) vs completion (IOCP, io_uring): both free the thread while waiting.', 'Diagnose .NET with dotnet-counters (live), dotnet-trace (CPU), dotnet-dump (memory).'],
          f: [['Pod restarts with exit code 137. What happened?', 'The container exceeded its memory limit and the kernel sent SIGKILL (OOMKilled). Check limit vs working set, unbounded caches or queues, and dump while memory climbs.'],
              ['Why does creating a new connection per request fail under load?', 'Each connection uses a file descriptor and a local ephemeral port; closed ones sit in TIME_WAIT. You run out. Pool and reuse connections (IHttpClientFactory).'],
              ['Why does async scale better than thread-per-connection?', 'A waiting request holds a kernel registration (epoll, kqueue, IOCP), not a blocked thread with its stack and context switches. A few threads serve only the ready sockets.'],
              ['Which .NET tools diagnose a live process?', 'dotnet-counters for live metrics, dotnet-trace for CPU and events, dotnet-dump to capture and analyse memory. All are .NET global tools.']],
          q: [{ q: 'A container restarts with exit code 137 and no exception in the logs. Most likely cause?', o: ['It exceeded its memory limit and was OOM-killed', 'An unhandled exception in a background thread', 'The thread pool was starved', 'The readiness probe returned 500'], a: 0, e: '137 = 128 + 9 (SIGKILL). The kernel kills the process at the cgroup memory limit, so the app never gets to log anything.' },
              { q: 'Which mechanism lets one thread wait for readiness on thousands of Linux sockets?', o: ['epoll', 'IOCP', 'fsync', 'kqueue'], a: 0, e: 'epoll is the Linux readiness API. kqueue is the BSD/macOS equivalent and IOCP is the Windows completion model.' }]
        },
    'storage-hierarchy': {
          say: 'Storage is a ladder from registers and CPU caches to RAM, SSD, HDD and object storage; each step is bigger, cheaper and much slower. Locality decides speed, which is why arrays beat linked lists. Sequential beats random, hence append-only logs and LSM trees. A write is durable only after fsync. OLTP uses rows; analytics uses columnar formats like Parquet.',
          k: ['cache line', 'temporal / spatial locality', 'sequential vs random I/O', 'LSM tree', 'page cache', 'fsync / durable', 'columnar / Parquet'],
          p: ['Each rung down is roughly 10-1,000x slower but far bigger and cheaper per GB.', 'Arrays win on cache lines and prefetching; linked lists miss on every node.', 'write() lands in the OS page cache; only fsync or write-through makes it durable.', 'B-tree: read-friendly, in-place writes. LSM: write-friendly, compaction cost.'],
          f: [['Why is iterating an array faster than a linked list of the same size?', 'Array elements are contiguous, so one 64-byte cache line brings several and the prefetcher reads ahead. Each list node can be a separate cache miss.'],
              ['Why do Kafka, WALs and LSM trees append instead of updating in place?', 'Sequential I/O is far cheaper than random I/O on every device. Appending turns random writes into sequential ones; compaction tidies up later.'],
              ['What does durable mean for a single write?', 'It is on stable storage after fsync (or write-through) returns, not just in the OS page cache. In .NET: Flush(true) or FileOptions.WriteThrough.'],
              ['Row store vs columnar store?', 'Rows for OLTP: fetch or update whole records. Columns for analytics: scan a few columns, compress well, skip row groups. Parquet is the columnar file format.']],
          q: [{ q: 'Your service calls write() and returns 200, then the server loses power. Why can the data be lost?', o: ['It was still in the OS page cache, not fsynced to disk', 'write() always writes straight to disk', 'The SSD reordered the HTTP response', 'Parquet buffers rows in memory'], a: 0, e: 'write() usually only copies into the page cache. Durability needs fsync (or write-through) to complete before you acknowledge.' }]
        },
    'data-structures': {
          say: 'I start from the access pattern. Point lookups: hash table, as in Redis. Ranges: a B+tree, as in SQL indexes. Heavy writes: an LSM tree, as in Cassandra or RocksDB. Rank and top-N: a skip list, as in Redis sorted sets. Next-due or top-K: a heap. Prefixes: a trie. Full text: an inverted index. Nearby: geohash or quadtree.',
          k: ['hash table', 'B+tree', 'LSM tree', 'memtable / SSTable', 'skip list', 'heap / top-K', 'inverted index', 'geohash'],
          p: ['B+tree is read- and range-optimised; LSM is write-optimised but pays in compaction and multi-file reads.', 'Hash tables give O(1) average lookups but no ordering or range queries.', 'Top-K = min-heap of size K, O(n log K); PriorityQueue in .NET is a quaternary min-heap.', 'Geohash proximity search must check the 8 neighbouring cells.'],
          f: [['Why is an LSM tree fast for writes?', 'Writes are a sequential WAL append plus an in-memory memtable insert. Full memtables flush to immutable SSTables; compaction merges them later.'],
              ['What structure backs a Redis sorted set, and why use it?', 'A skip list plus a hash table: O(log n) insert, rank and range by score, which suits leaderboards.'],
              ['When would you pick a trie?', 'For prefix queries: autocomplete and longest-prefix match in IP routing. Lookup costs O(key length); use a radix trie to save memory.'],
              ['What does a ring buffer give a logging pipeline?', 'Fixed memory and O(1) push/pop with no allocation. When full you must block or overwrite the oldest; in .NET use a bounded Channel with a FullMode.']],
          q: [{ q: 'A telemetry service ingests 200k writes per second and mostly reads recent data. Which storage structure fits best?', o: ['LSM tree', 'B+tree', 'Trie', 'Inverted index'], a: 0, e: 'LSM trees turn writes into sequential appends and flushes, so they suit write-heavy ingest. B+trees favour reads and ranges.' },
              { q: 'You need the 10 largest payments from a stream of millions. What is the most efficient approach?', o: ['Sort the whole stream', 'A min-heap of size 10', 'A hash table keyed by amount', 'A trie of amounts'], a: 1, e: 'A min-heap of size K keeps the current top K; each item costs O(log K), so O(n log K) overall.' }]
        },
    'url-journey': {
          say: 'The browser parses the URL and applies HSTS, checks its caches, then resolves DNS through a recursive resolver: root, TLD, authoritative. It opens TCP plus TLS 1.3, or QUIC for HTTP/3. The request passes the CDN and WAF, load balancer, gateway, app, cache and database. The compressed response is rendered: DOM, CSSOM, layout, paint.',
          k: ['HSTS', 'recursive resolver', 'TTL', 'TCP handshake', 'TLS 1.3', 'QUIC / HTTP/3', 'CDN + WAF', 'DOM + CSSOM'],
          p: ['Answer breadth first, then ask which layer to go deep on.', 'DNS: resolver → root → TLD → authoritative, cached for the TTL.', 'TCP + TLS 1.3 = 2 RTT before the request; QUIC = 1 RTT, 0 on resumption.', 'Kestrel HTTP/3 is off by default and needs MsQuic; keep HTTP/1.1 and HTTP/2 as fallback.'],
          f: [['Walk the DNS resolution steps.', 'Browser and OS cache, then the recursive resolver asks a root server, then the TLD server (.com), then the authoritative server, and caches the answer for its TTL.'],
              ['What does the browser check in the TLS certificate?', 'That it chains to a trusted root CA, matches the hostname, and is within its validity dates (and not revoked).'],
              ['What is HSTS?', 'A Strict-Transport-Security header (or browser preload list) telling the browser to use https only for that host, so it never sends a plain-http request.'],
              ['What are the browser rendering steps?', 'Parse HTML into the DOM and CSS into the CSSOM, combine them into the render tree, then layout and paint. Render-blocking JS delays first paint.']],
          q: [{ q: 'Which order does a recursive DNS resolver follow on a cold cache?', o: ['Root → TLD → authoritative', 'Authoritative → TLD → root', 'TLD → root → authoritative', 'CDN → root → authoritative'], a: 0, e: 'The resolver starts at a root server, which points to the TLD servers, which point to the authoritative server for the domain.' },
              { q: 'Why does HTTP/3 usually connect faster than HTTP/2?', o: ['QUIC combines the transport and TLS handshakes', 'It skips encryption', 'It does not need DNS', 'It uses a bigger TCP window'], a: 0, e: 'QUIC runs over UDP and merges transport setup with TLS 1.3, so a new connection needs 1 round trip instead of 2.' }]
        },
    'building-blocks': {
              say: 'Most systems use the same blocks: DNS, CDN, load balancer, gateway or reverse proxy, stateless app servers, cache, database with replicas, queue and workers, object storage, search and observability. I start with client, app and database, then add each block only when a requirement such as read load, latency or slow work demands it.',
              k: ['client-server', 'CDN', 'load balancer', 'reverse proxy', 'stateless', 'cache + replicas', 'queue + workers', 'GeoDNS / anycast'],
              p: ['Start simple; every extra box needs a requirement behind it.', 'Edge order: DNS, CDN, LB, gateway, stateless app.', 'Reverse proxy protects servers; forward proxy controls clients.', 'YARP (Yarp.ReverseProxy) is a .NET reverse proxy library configured with routes and clusters.'],
              f: [['How do you approach "draw a high-level design"?', 'Clarify requirements and scale, draw client, API, service, DB, add blocks only when a requirement demands them, walk one request through, then name failure points and monitoring.'],
                  ['Forward proxy vs reverse proxy?', 'Forward sits in front of clients and hides them (egress control). Reverse sits in front of servers and hides them (TLS offload, routing, LB, WAF).'],
                  ['Client-server vs peer-to-peer?', 'Client-server: central server owns the data, easy to secure and govern, server must scale. P2P: every node serves and consumes, no central bottleneck, but hard to trust and keep consistent.'],
                  ['GeoDNS vs anycast?', 'GeoDNS answers with a location-specific IP, failover bound by TTL. Anycast announces one IP from many sites over BGP; routing picks the nearest, failover in seconds.'],
                  ['When do you add a queue?', 'When work is slow, bursty or fans out: it decouples the request path, buffers spikes and lets workers retry.']],
              q: [{ q: 'Which component sits in front of servers and hides them from clients?', o: ['Reverse proxy', 'Forward proxy', 'Recursive DNS resolver', 'Message queue'], a: 0, e: 'A reverse proxy is owned by the service and fronts its servers for routing, TLS offload and load balancing. A forward proxy fronts clients.' },
                  { q: 'Why does anycast fail over faster than GeoDNS?', o: ['Routing changes do not wait for DNS TTLs to expire', 'It uses UDP instead of TCP', 'It caches responses at the client', 'It needs fewer servers'], a: 0, e: 'Anycast uses the same IP everywhere; when a site withdraws its BGP route, traffic goes to the next site. GeoDNS answers stay cached until the TTL expires.' }]
            },
    'requirements': {
              say: 'Functional requirements say what the system does; non-functional requirements say how well. I quantify every NFR: p95 and p99 latency, peak requests per second, availability in nines, RPO and RTO, consistency per data type, growth, compliance and cost. Then I rank the top qualities and tie each design choice back to one.',
              k: ['FR vs NFR', 'p95 / p99', 'req/s', 'nines', 'RPO / RTO', 'durability', 'read:write ratio', 'clarifying questions'],
              p: ['An NFR without a number is a wish.', '99.9% = 8.76 h/year; 99.99% = 52.6 min/year; 99.999% = 5.26 min/year.', 'Read:write ratio and access pattern pick the cache and database.', 'Spend the first 5 minutes on users, scope, scale, latency, uptime, consistency, security and constraints.'],
              f: [['What do you ask in the first 5 minutes of a design interview?', 'Users and regions, features in and out of scope, peak scale and growth, read:write ratio, latency target, availability and RPO/RTO, consistency needs, security/compliance, budget and constraints.'],
                  ['Functional vs non-functional requirements?', 'Functional: what the system does (features, behaviour). Non-functional: how well it does it (latency, availability, security, cost). NFRs drive the architecture.'],
                  ['RPO vs RTO?', 'RPO: the maximum data loss you accept, measured in time. RTO: the maximum time to restore service after a disaster.'],
                  ['How do you measure p99 in .NET?', 'Record durations in a System.Diagnostics.Metrics histogram (ASP.NET Core already emits http.server.request.duration), export with OpenTelemetry, and compute percentiles in the backend.'],
                  ['Why does the read:write ratio matter?', 'Read-heavy systems add caches and read replicas; write-heavy ones need partitioning, append-only logs and queues.']],
              q: [{ q: 'About how much downtime per year does 99.99% availability allow?', o: ['52.6 minutes', '8.76 hours', '5.26 minutes', '3.65 days'], a: 0, e: '0.01% of 525,600 minutes is about 52.6 minutes. 8.76 h is 99.9%, 5.26 min is 99.999%, 3.65 days is 99%.' },
                  { q: 'Which latency figure should an SLO usually use?', o: ['p95 or p99 percentile', 'Mean latency', 'Minimum latency', 'Median of the fastest server'], a: 0, e: 'Averages hide the slow tail that users actually feel; percentiles like p95 and p99 capture it.' }]
            },
    'scaling-basics': {
          say: 'Scale the cheap way first: measure, cache hot reads, add read replicas, move slow work to queues. Partition only when one database cannot take the writes or hold the data. Replicas scale reads; shards scale writes and size, but every query then needs the shard key, and hot keys and cross-shard queries become your problem.',
          k: ['vertical vs horizontal', 'read replicas', 'replication lag', 'sharding', 'shard key', 'hot partition', 'consistent hashing', 'scatter-gather'],
          p: ['Replication = copies (reads, availability). Partitioning = split (writes, size).', 'Range shards: easy scans, hotspot on the newest range. Hash shards: even spread, ranges fan out.', 'Hot key fixes: cache, salt or write-shard, split, isolate the whale.', '10x order: measure, cache, replicas, async, partition.'],
          f: [['How would you scale this system to 10x?', 'Measure the bottleneck first. Then cache hot reads and use a CDN, add read replicas, move slow work to queues, and partition last with a named shard key and a hot-key plan.'],
              ['Replication vs partitioning?', 'Replication copies all data to N nodes: more read capacity and availability, same write limit. Partitioning splits rows across nodes: more write capacity and storage, but cross-shard queries and transactions.'],
              ['Range vs hash sharding?', 'Range keeps ordered data together, so scans are cheap, but new writes pile onto the last shard. Hash spreads writes evenly, but range queries must hit every shard.'],
              ['What makes a good shard key?', 'High cardinality, even load, and present in most queries so requests go to one shard. Example: account or tenant id, not status or country.'],
              ['Why does consistent hashing help rebalancing?', 'With hash mod N, changing N moves almost every key. Consistent hashing moves only about 1/N of keys when a node joins or leaves.']],
          q: [{ q: 'Writes to the primary database are the bottleneck. Which move actually adds write capacity?', o: ['Add read replicas', 'Partition the data by a shard key', 'Put a CDN in front', 'Add more stateless API instances'], a: 1, e: 'Replicas, CDNs and more app instances help reads or compute. Only partitioning spreads writes across several databases.' },
              { q: 'Sharding payments by transaction date causes one shard to run hot. Why?', o: ['Hash collisions', 'All new writes fall into the newest date range', 'Replication lag', 'The directory lookup is slow'], a: 1, e: 'Range sharding on a time key sends every new write to the latest range, creating a hotspot.' }]
        },
    'data-basics': {
          say: 'I start from the access pattern: key lookups, aggregates, joins, scans, text or similarity. Money and joins go relational with ACID; specialised stores only where a pattern needs them. Normalise to write, denormalise to read. OLTP uses rows, OLAP uses columns. Batch is complete but late; streams are fast but need windows and watermarks.',
          k: ['access pattern', 'polyglot persistence', 'normalisation', 'denormalised read model', 'OLTP vs OLAP', 'eventual consistency', 'batch vs stream', 'watermark'],
          p: ['Default relational; add a store per access pattern it cannot serve.', 'Denormalised views give one-read screens but cost write fan-out and staleness.', 'OLTP: row store, small transactions. OLAP: columnar, big scans.', 'Batch = bounded and complete. Stream = unbounded, low latency, late events.'],
          f: [['Which database would you choose?', 'Access pattern first, then consistency needs, then scale and shape, then ops cost. Default to relational; add key-value, document, search or vector stores only for a pattern relational serves badly.'],
              ['Normalisation vs denormalisation?', 'Normalised: each fact once, safe writes, joins on read. Denormalised: data copied into the read shape, one fast read, but write fan-out and possible staleness.'],
              ['OLTP vs OLAP?', 'OLTP runs many small transactions on a row store (payments DB). OLAP runs big scans and aggregates on a columnar store (warehouse), fed by ETL or CDC.'],
              ['Batch vs stream processing?', 'Batch processes bounded data on a schedule: complete but late. Stream processes unbounded events as they arrive in windows: seconds of latency, but you must handle late, out-of-order events with watermarks.'],
              ['Lambda vs Kappa architecture?', 'Lambda runs a batch layer and a speed layer and merges them (two codebases). Kappa uses only streaming and reprocesses by replaying the log.']],
          q: [{ q: 'A fraud check must flag suspicious card payments within seconds. Which approach fits?', o: ['Nightly batch job', 'Stream processing with time windows', 'Monthly warehouse report', 'Weekly ETL into a data lake'], a: 1, e: 'Seconds of latency on unbounded events needs stream processing; batch is complete but hours late.' },
              { q: 'Which workload suits a columnar store best?', o: ['Updating one account balance', 'Summing amounts across 500 million rows', 'Looking up a session by key', 'Inserting single orders at high rate'], a: 1, e: 'Columnar storage reads only the needed columns and compresses well, so large scans and aggregates (OLAP) are fast.' }]
        },
    'communication': {
              say: 'First I decide who starts the exchange: push gives low latency, pull lets the receiver control the rate. For client updates I go polling, then SSE, then WebSocket, and webhooks between servers. Feeds use hybrid fan-out, pulling celebrity posts at read time. Big lists use keyset pagination. HTTP/3 removes TCP head-of-line blocking.',
              k: ['push vs pull', 'long polling', 'SSE', 'WebSocket', 'webhook', 'fan-out on write', 'keyset pagination', 'head-of-line blocking'],
              p: ['Push = sender owns delivery and latency; pull = receiver owns the rate (natural backpressure).', 'Feeds: fan-out on write for most accounts, fan-out on read for celebrities, merged at read.', 'Cursor pagination costs the same on every page; offset gets slower and drifts.', 'HTTP/2 fixes HOL at the HTTP layer; QUIC (HTTP/3) fixes it at transport.'],
              f: [['How will clients get live updates?', 'Clarify freshness, direction and client count. Polling for rare changes, SSE for server-to-client, WebSocket for two-way, webhooks for partners. Plan scale-out (backplane) and reconnect with resume from the last event ID.'],
                  ['Push vs pull: give an example of each.', 'Push: webhooks, mobile push, WebSocket. Pull: Prometheus scraping /metrics, Kafka consumers, polling a status URL.'],
                  ['What is the celebrity problem in feeds?', 'With fan-out on write, one post from an account with millions of followers means millions of timeline writes. Fix: pull those posts at read time and merge (hybrid).'],
                  ['Why do cursors scale better than offsets?', 'The query seeks straight to the last key seen using an index, so cost depends on page size, not depth. Offsets read and discard every skipped row.'],
                  ['Where does head-of-line blocking still happen in HTTP/2?', 'At TCP: all streams share one connection, so one lost packet stalls every stream until it is retransmitted. HTTP/3 over QUIC keeps streams independent.']],
              q: [{ q: 'An API must page through 50 million transactions for an export. Which approach scales best?', o: ['Keyset pagination on (date, id)', 'OFFSET/LIMIT with a bigger page size', 'Load all rows and page in memory', 'Random page numbers in parallel'], a: 0, e: 'Keyset pagination uses an index seek from the last key seen, so every page costs the same and inserts do not shift results.' },
                  { q: 'Which option streams server-to-client events over a single HTTP response?', o: ['Server-Sent Events', 'Webhooks', 'Short polling', 'gRPC unary calls'], a: 0, e: 'SSE keeps one HTTP response open and writes events to it. It is one-way and text-based.' }]
            },
    'reliability-basics': {
              say: 'I walk the request path and ask what happens if each part dies. I remove single points of failure with redundancy across zones and choose a failover mode by RTO and cost. I detect failure with heartbeats and liveness and readiness checks, bound retries with timeouts, backoff, jitter and a budget, shed load early, degrade by business priority, and use quorum and fencing tokens against split brain.',
              k: ['SPOF', 'active-passive', 'active-active', 'liveness vs readiness', 'backoff + jitter', 'retry budget', 'load shedding', 'fencing token'],
              p: ['Find SPOFs by asking "if only this dies?" for every box, including DNS, certificates and the identity provider.', 'Cold, warm, hot, active-active: RTO falls as cost rises.', 'Retries need timeouts, backoff with jitter, a budget (~10%), idempotency and one retrying layer.', 'Split brain is prevented with a majority quorum and fencing tokens checked by storage.'],
              f: [['What happens when X fails? How do you answer?', 'Draw the path; for each component give detection, blast radius and the automatic response (failover, retry, degrade); then data impact (RPO, duplicates); cover slow-not-down; close with RTO/RPO and how you test it.'],
                  ['Liveness vs readiness?', 'Liveness: is the process alive? Failing restarts it, so keep it shallow. Readiness: can it take traffic now? Failing removes it from the load balancer without a restart.'],
                  ['What is a retry budget?', 'A cap on retries as a share of normal traffic (about 10%), so retries cannot multiply load during an outage. Retry at one layer: 3 layers x 3 attempts can mean 27 calls.'],
                  ['Load shedding vs graceful degradation?', 'Shedding rejects excess requests early (503/429 + Retry-After) so admitted ones meet the SLO. Degradation keeps serving with less: kill-switch flags, stale cache, static fallback, read-only mode.'],
                  ['How does a fencing token prevent split-brain writes?', 'Each lease carries an increasing number; storage rejects writes with a lower number than it has seen, so a stale ex-leader cannot overwrite data.']],
              q: [{ q: 'Two clients retry a failed service at exactly the same intervals and keep overloading it. What fixes this best?', o: ['Exponential backoff with jitter', 'More retry attempts', 'A shorter fixed retry interval', 'Retrying at every layer'], a: 0, e: 'Backoff spaces retries out and jitter randomises them, so clients stop retrying in synchronised waves.' },
                  { q: 'A readiness probe fails on one instance. What should the platform do?', o: ['Stop routing traffic to it until it is ready', 'Restart the container immediately', 'Fail over the whole region', 'Delete the instance and its data'], a: 0, e: 'Readiness controls traffic. Liveness controls restarts.' }]
            },
    'coordination': {
          say: 'Split it into four jobs. Membership: a registry for services, gossip for big peer clusters. Failure detection: heartbeats and timeouts or phi accrual, which only suspect failure. Agreement: Raft or a lease in etcd plus a fencing token when you need one leader. Repair: quorum plus Merkle-tree anti-entropy.',
          k: ['gossip', 'O(log N) rounds', 'Merkle tree', 'anti-entropy', 'heartbeat', 'phi accrual', 'leader lease', 'service registry'],
          p: ['Gossip spreads state peer-to-peer in about O(log N) rounds; eventually consistent.', 'Merkle trees find differing ranges with O(log n) hash comparisons.', 'You cannot tell slow from dead: detectors suspect, fencing tokens keep you safe.', 'Discovery is client-side (smart client) or server-side (LB / DNS) over a health-checked registry.'],
          f: [
            ['How do nodes in a large cluster learn about membership changes without a central server?', 'Gossip: each node periodically swaps state with a few random peers; newer versions win. Converges in about O(log N) rounds (Cassandra, Consul/Serf, Redis Cluster).'],
            ['How do replicas find which data differs without comparing every row?', 'Build a Merkle tree of hashes over key ranges. Compare roots, then recurse only into children that differ, and stream just those ranges (anti-entropy repair).'],
            ['How would you elect a leader for a job that must run once across many instances?', 'Take a renewable lease in a coordinator (etcd, ZooKeeper, Kubernetes Lease, Azure blob lease) or use a Raft log. Renew it; on expiry someone else wins. Pass a fencing token so a stale leader is rejected.'],
            ['What is the phi accrual failure detector?', 'Instead of a fixed timeout, it learns the heartbeat interval distribution and outputs a suspicion level phi; the system acts once phi passes a threshold. Used by Cassandra and Akka.'],
            ['Client-side vs server-side service discovery?', 'Client-side: the client queries the registry and load-balances itself (e.g. .NET ServiceDiscovery, Eureka). Server-side: the client calls a stable name and a load balancer or Kubernetes Service routes it.']
          ],
          q: [
            { q: 'Roughly how many gossip rounds does it take for news to reach all nodes in a 1,000-node cluster?', o: ['About 10', 'About 100', 'About 500', 'About 1,000'], a: 0, e: 'Informed nodes roughly double each round, so it takes about log2(1000), which is about 10 rounds.' },
            { q: 'Why does a leader holding a lease still need a fencing token?', o: ['A paused leader may wake up after its lease expired and write stale data', 'Leases cannot be renewed', 'Tokens make heartbeats faster', 'Fencing tokens replace the need for a quorum'], a: 0, e: 'After a long GC pause or partition, two nodes can briefly both think they lead. The resource rejects writes carrying an older token.' }
          ]
        },
    'security-observability-basics': {
          say: 'I weave it in as I draw, then give it 60 seconds. Security: tokens at the gateway, policy checks in the service, TLS and encryption at rest, secrets in a vault via managed identity, least privilege, input validation, classified data and an audit log. Observability: logs, metrics and traces joined by a trace ID, with SLOs and symptom-based alerts.',
          k: ['authN vs authZ', 'TLS / at rest', 'least privilege', 'Key Vault', 'audit log', 'logs, metrics, traces', 'correlation ID', 'SLO alerts'],
          p: ['Mention the 10-point baseline in 60 seconds; go deep only where the domain needs it.', 'AuthN = who you are, AuthZ = what you may do; check access per object.', 'Three signals joined by a W3C trace ID; alert on SLO burn, not CPU.'],
          f: [
            ['How do you fit security and observability into a 45-minute design interview?', 'Requirements and core design first. Add one line per hop while drawing (token check, trace context), then a 60-second baseline near the end. Deep-dive only on what the domain demands.'],
            ['What is the difference between authentication and authorisation?', 'Authentication proves who the caller is (OIDC sign-in, a validated token). Authorisation decides what that caller may do (roles, scopes, policies, object-level checks).'],
            ['Where should secrets live in a cloud design?', 'In a vault such as Azure Key Vault, accessed with a managed identity so there are no credentials in code or config, with rotation and access logging.'],
            ['What should you alert on?', 'Symptoms users feel: SLO burn on error rate and latency. Use CPU and queue depth on dashboards for diagnosis, not as pages.'],
            ['What are the three observability signals?', 'Logs (structured events), metrics (cheap aggregated numbers over time) and traces (one request across services), linked by a trace / correlation ID.']
          ],
          q: [
            { q: 'Which alert best follows SRE practice?', o: ['Checkout error-rate SLO is burning budget fast', 'CPU above 70% on one node', 'Disk 60% full on a log server', 'A pod restarted once'], a: 0, e: 'Alert on symptoms users feel, measured against an SLO. Resource metrics help diagnosis but make noisy pages.' },
            { q: 'A service needs a database password in Azure. What is the best baseline?', o: ['Managed identity reading from Key Vault', 'Password in appsettings.json', 'Password in an environment variable baked into the image', 'Password committed to a private repo'], a: 0, e: 'A managed identity avoids stored credentials, and the vault adds rotation and access auditing.' }
          ]
        }
  }
};
