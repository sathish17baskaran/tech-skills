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
    }
  }
};
