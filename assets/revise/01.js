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
        }
  }
};
