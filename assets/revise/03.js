/* Quick-revision data for 03-scalability-reliability.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['03'] = {
  approach: [
    ['Clarify the targets', 'Peak load (req/s), latency target (p95), availability SLO, RPO/RTO, budget.'],
    ['Size it', 'Little\'s Law (L = arrival rate x time), per-instance limit from a load test, N+1 headroom at 60-70%.'],
    ['Scale the tiers', 'Stateless app tier scales out behind an L7 LB; the data tier is the hard part (replicas, sharding).'],
    ['Remove single points of failure', 'Redundancy across zones, health checks, automated failover, cells to cap the blast radius.'],
    ['Protect against dependencies', 'Timeouts, retries with backoff + jitter (idempotent only), circuit breaker, bulkhead, fallback.'],
    ['State the trade-offs', 'CAP/PACELC: consistency vs availability and latency; cost of each extra nine.'],
    ['Close with SLOs and DR', 'SLIs and error budget, RPO/RTO strategy, tested failover drills.']
  ],
  traps: [
    'Saying CAP means "pick any 2 of 3"; partitions happen, so the choice is C or A during a partition.',
    'Retrying at every layer, or retrying non-idempotent payment POSTs without an idempotency key.',
    'Designing for average load instead of the peak, or running at 95% utilisation.',
    'Putting the database in the liveness check, so a DB blip restarts every instance.',
    'Claiming a DR plan without ever testing it.'
  ],
  sections: {
    scaling: {
      say: 'Vertical scaling means a bigger machine: simple, but it hits a hardware ceiling and is a single point of failure. Horizontal scaling adds more machines behind a load balancer: nearly unlimited and redundant, but it needs stateless apps and distributed data. Start vertical, go horizontal for HA or past the ceiling.',
      k: ['scale up', 'scale out', 'auto-scaling', 'stateless', 'cool-down', 'single point of failure', 'KEDA / HPA'],
      p: ['The data tier is the hardest to scale out.', 'Scale out fast, scale in slowly (cool-down) to avoid flapping.', 'Auto-scale on CPU, queue length or request rate.', 'New instances get traffic only once readiness checks pass.'],
      f: [['When would you scale vertically instead of horizontally?', 'When the load fits on one bigger node and simplicity matters, typically a relational DB primary or a legacy app. Move to horizontal for HA or when you hit the ceiling.'],
          ['Why scale in more slowly than you scale out?', 'A cool-down stops capacity flapping up and down when load hovers near a threshold.']],
      q: [{ q: 'What must be true of an app tier before you can scale it out freely?', o: ['It runs on the largest VM size', 'It uses sticky sessions', 'It connects directly to one database replica', 'It keeps no client state in memory between requests'], a: 3, e: 'Stateless instances are interchangeable, so the load balancer can send any request to any instance.' }]
    },
    stateless: {
      say: 'A stateless service keeps no client data in memory between requests, so any instance can serve any request. Move state out: sessions to Redis, files to blob storage, data to the database, identity into tokens. Sticky sessions are a workaround that breaks even spreading and loses sessions when a node dies.',
      k: ['stateless', 'sticky sessions', 'session affinity', 'distributed cache', 'JWT', 'Data Protection keys', 'StatefulSet'],
      p: ['All instances must share Data Protection keys, or cookies and antiforgery tokens fail.', 'Stateful workloads (DBs, Kafka, WebSocket servers) need partitions and replication.', 'Files go to blob storage, not local disk.'],
      f: [['What is wrong with sticky sessions?', 'Load spreads unevenly, and when a node dies all sessions pinned to it are lost.'],
          ['You scale an ASP.NET Core app to 3 instances and users get logged out randomly. Likely cause?', 'Data Protection keys are not shared, so a cookie issued by one instance cannot be decrypted by another. Persist keys centrally, e.g. blob storage protected by Key Vault.']],
      q: [{ q: 'Which is the best way to make a login session survive any instance dying?', o: ['Store it in instance memory', 'Enable sticky sessions', 'Store it in a distributed cache or carry it in a token', 'Write it to the local disk'], a: 2, e: 'External state (Redis) or a self-contained token (JWT) lets any instance handle the next request.' }]
    },
    lb: {
      say: 'A load balancer spreads traffic across healthy servers. Algorithms include round robin, weighted, least connections, least response time, IP hash and consistent hashing. L4 balancers forward on IP and port; L7 balancers read URLs, headers and cookies and can terminate TLS and run a WAF. Health checks remove bad nodes.',
      k: ['round robin', 'weighted round robin', 'least connections', 'L4 vs L7', 'TLS termination', 'health probes', 'global load balancing'],
      p: ['Weighted round robin also drives canary releases (90/10).', 'Least connections suits long requests.', 'The LB itself must be redundant.', 'Global LB is DNS-based or anycast for multi-region.'],
      f: [['When would you choose least connections over round robin?', 'When request durations vary a lot or requests are long-lived; round robin assumes equal servers and equal requests.'],
          ['Where should TLS be terminated?', 'Usually at the L7 load balancer to offload crypto and allow routing and WAF; re-encrypt to the backend if compliance needs end-to-end TLS.']],
      q: [{ q: 'You want to send 10% of traffic to a new version. Which algorithm fits?', o: ['Weighted round robin', 'IP hash', 'Least response time', 'Consistent hashing'], a: 0, e: 'Weights (90/10) split traffic in fixed proportions, which is how canary releases are routed.' }]
    },
    'consistent-hashing': {
      say: 'Consistent hashing puts nodes and keys on a hash ring; each key belongs to the next node clockwise. Adding or removing a node moves only about 1/N of keys, whereas hash mod N moves almost all of them. Virtual nodes give an even spread. Used in Cassandra, DynamoDB and distributed caches.',
      k: ['hash ring', 'virtual nodes', 'hash mod N', 'rebalancing', 'hash slots', 'partition key'],
      p: ['mod N from 4 to 5 nodes moves about 80% of keys.', 'Redis Cluster uses 16,384 hash slots instead of a ring.', 'Use a stable hash (XxHash), never string.GetHashCode() which changes per process.'],
      f: [['Why not just use hash(key) mod N?', 'Changing N remaps almost every key, so a cache loses nearly all hits or a shard store must move nearly all data.'],
          ['What problem do virtual nodes solve?', 'With few nodes the ring segments are uneven; placing each server many times on the ring spreads keys evenly and spreads load when a node leaves.']],
      q: [{ q: 'A cache cluster grows from 4 to 5 nodes using consistent hashing. Roughly how many keys move?', o: ['All of them', 'About 80%', 'About 1/N (around 20%)', 'None'], a: 2, e: 'Only keys between the new node and its predecessor move, about 1/N. mod N would move about 80%.' }]
    },
    ft: {
      say: 'Fault tolerance means the system keeps working, perhaps degraded, when parts fail. Remove single points of failure with at least two of everything across zones, replicate data, detect and fail over automatically, isolate with bulkheads and cells, and degrade gracefully. Prove it with chaos engineering.',
      k: ['SPOF', 'active-active', 'active-passive', 'N+1', 'sync vs async replication', 'failover', 'graceful degradation', 'chaos engineering'],
      p: ['HA = minimal downtime; fault tolerance = no interruption; resilience = absorb and recover.', 'Sync replication: no data loss, slower. Async: fast, may lose recent writes.', 'Keep liveness shallow; dependency checks belong in readiness.'],
      f: [['Difference between high availability and fault tolerance?', 'HA minimises downtime with redundancy and fast failover, so a brief blip is OK. Fault tolerance means no interruption at all when a component fails, and costs more.'],
          ['Why must a liveness probe not check the database?', 'A DB outage would make every instance fail liveness and the platform would restart them all at once. Put dependency checks in readiness.'],
          ['Name three ways to degrade gracefully.', 'Serve cached or stale data, return partial results, and switch off non-critical features.']],
      q: [{ q: 'Which replication choice risks losing the latest writes on failover?', o: ['Synchronous replication', 'Asynchronous replication', 'Quorum writes with W = N', 'No replication with backups every second'], a: 1, e: 'Async replication acknowledges before the replica has the write, so recent writes can be lost.' }]
    },
    resilience: {
      say: 'Resilience patterns stop one slow or failing dependency taking everything down: timeouts so you never wait forever, retries with exponential backoff and jitter for transient errors only, a circuit breaker to fail fast, bulkheads to isolate resource pools, fallbacks, and load shedding. Only retry idempotent operations.',
      k: ['timeout', 'exponential backoff', 'jitter', 'circuit breaker', 'half-open', 'bulkhead', 'load shedding', 'idempotency key'],
      p: ['Retry in one layer only: 3 layers x 3 retries = 27x traffic.', 'Backoff without jitter causes retry storms.', 'Breaker: CLOSED -> OPEN after threshold -> HALF-OPEN test calls.', 'AddStandardResilienceHandler retries all methods unless you disable unsafe ones.'],
      f: [['Explain the circuit breaker states.', 'Closed: calls flow and failures are counted. Open: after the threshold, fail fast with no calls. Half-open: after a cool-down, let a few test calls through; success closes it, failure reopens it.'],
          ['Why add jitter to retries?', 'Without randomness, all clients retry at the same moments and hammer the recovering service in waves.'],
          ['What is a bulkhead?', 'A separate thread or connection pool per dependency, so one slow dependency cannot exhaust all resources.'],
          ['What gives you timeout, retry and circuit breaker for HttpClient in .NET in one line?', 'AddStandardResilienceHandler() from Microsoft.Extensions.Http.Resilience, built on Polly v8.']],
      q: [{ q: 'A payment POST times out. What makes it safe to retry?', o: ['A longer timeout', 'Retrying at every layer', 'Switching to HTTP/2', 'An idempotency key so the server can detect duplicates'], a: 3, e: 'Without an idempotency key, a retry after a timeout can charge the customer twice.' },
          { q: 'Three layers each retry 3 times. One user call fails everywhere. How many calls can hit the bottom service?', o: ['3', '9', '27', '6'], a: 2, e: 'Retries multiply: 3 x 3 x 3 = 27. Retry in one layer only.' }]
    },
    availability: {
      say: 'Availability is the percentage of time a system works for users, best measured as successful requests over total. Each nine cuts downtime tenfold: 99.9% is about 8.8 hours a year, 99.99% about 53 minutes. Dependencies in series multiply down; redundancy in parallel multiplies up. Cutting MTTR is usually cheaper than raising MTBF.',
      k: ['the nines', 'MTBF', 'MTTR', 'composite availability', 'redundancy', 'active-active', 'availability zones', 'durability'],
      p: ['Series: 99.9% x 99.9% = 99.8%. Parallel: two 99% nodes = 99.99%.', '99.9% = 43.8 min/month; 99.99% = 4.4 min/month.', 'Changes cause most outages: safe deployment matters as much as redundancy.', 'Durability (data not lost) is not availability.'],
      f: [['Your service has 3 dependencies at 99.9% each. What is your max availability?', 'About 99.7% (0.999 cubed). To do better, add redundancy, caching or async decoupling.'],
          ['How do you raise availability: fail less or recover faster?', 'Both, but cutting MTTR (detection, automated failover, one-click rollback) is usually cheaper than raising MTBF.'],
          ['Why measure availability by requests rather than time?', 'Successful over total valid requests reflects what users actually experienced, including partial outages.']],
      q: [{ q: 'Two independent replicas each have 99% availability. What is the combined availability if either can serve?', o: ['98%', '99%', '99.5%', '99.99%'], a: 3, e: 'Parallel: 1 - (0.01 x 0.01) = 99.99%. Redundancy raises availability.' },
          { q: 'Roughly how much downtime per year does 99.99% allow?', o: ['52.6 minutes', '8.8 hours', '5.3 minutes', '3.65 days'], a: 0, e: '99.99% allows about 52.6 minutes a year; 99.9% is 8.77 hours and 99.999% is 5.26 minutes.' }]
    },
    performance: {
      say: 'Performance is how fast a system responds and how much it gets through. Track p95 and p99 latency, throughput, utilisation and error rate under load. Slow for one user is a performance problem; slow only under load is a scalability problem. Queueing makes latency explode near full utilisation, so keep headroom.',
      k: ['p95 / p99', 'throughput', 'utilisation', 'queueing', 'bottleneck', 'load test', 'soak test', 'N+1 queries'],
      p: ['R = S / (1 - U): 50% busy = 2x, 90% busy = 10x service time.', 'Run at 60-70% utilisation.', 'Write NFRs like "p95 < 300 ms at 500 TPS, errors < 0.1%".', 'Fix the biggest bottleneck first; test with production-like data.'],
      f: [['Performance problem vs scalability problem?', 'Performance: slow even for one user, so fix code, query or network path. Scalability: fast for one but slows as load grows, so fix capacity, contention or architecture.'],
          ['Name the five performance test types.', 'Load (meets target at peak), stress (where and how it breaks), spike (sudden surge), soak (degrades over hours), capacity (load per instance).'],
          ['What is the tuning loop?', 'Set a target, measure, find the biggest bottleneck, fix that one thing, re-measure.']],
      q: [{ q: 'Which test finds a memory leak that appears after six hours?', o: ['Spike test', 'Stress test', 'Soak / endurance test', 'Micro-benchmark'], a: 2, e: 'Soak tests run moderate load for 8-24 hours to expose leaks and pool exhaustion.' },
          { q: 'A server goes from 50% to 90% utilisation. What happens to queueing latency?', o: ['Roughly unchanged', 'Rises from about 2x to about 10x service time', 'Drops because of batching', 'Doubles exactly'], a: 1, e: 'In the simple model R = S / (1 - U), 50% gives 2x and 90% gives 10x.' }]
    },
    capacity: {
      say: 'Capacity planning makes sure you can serve the peak with headroom: baseline, forecast, add headroom at 60-70% plus N+1, load test the per-instance limit, set autoscale limits and review. Little\'s Law gives concurrency. FinOps keeps cost in check: reserve the baseline, autoscale the peak, spot for interruptible work.',
      k: ['Little\'s Law', 'headroom', 'N+1', 'reactive / scheduled / predictive autoscale', 'quotas', 'unit economics', 'reservations', 'spot'],
      p: ['400 req/s x 0.25 s = 100 in flight; at 25 per instance = 4, +1 = 5.', 'Latency eats capacity: double W, double L.', 'Plan for losing a zone: 2 of 3 must carry the peak.', 'Find non-scalable limits (quotas, DB connections, rate limits) in the load test.'],
      f: [['Peak 600 req/s, average 200 ms. How many requests in flight?', 'L = 600 x 0.2 = 120. If one instance safely handles 30, you need 4, plus at least one spare.'],
          ['Reactive vs scheduled vs predictive autoscaling?', 'Reactive scales on a metric threshold but lags. Scheduled uses cron rules for known patterns. Predictive learns history and scales ahead; combine it with reactive for surprises.'],
          ['What is unit economics in FinOps?', 'Tracking cost per transaction, customer or payment, not just the total bill. A rising bill with falling unit cost is healthy growth.']],
      q: [{ q: 'A slow dependency doubles average response time at the same arrival rate. What happens to required concurrency?', o: ['It halves', 'It stays the same', 'It doubles', 'It depends only on CPU'], a: 2, e: 'Little\'s Law: L = arrival rate x W, so doubling W doubles L.' },
          { q: 'Which workload is a good fit for spot / preemptible capacity?', o: ['The payments database primary', 'The cell router', 'The login service', 'A CI build agent pool'], a: 3, e: 'Spot can be reclaimed at short notice, so it only suits interruptible work like CI, batch and stateless workers.' }]
    },
    sla: {
      say: 'An SLI is what you measure, an SLO is your internal target, and an SLA is the contractual promise with penalties. Set the SLO stricter than the SLA so you are warned early. The error budget is 100% minus the SLO; when it is spent, freeze features and fix reliability.',
      k: ['SLI', 'SLO', 'SLA', 'error budget', 'service credits', 'burn rate'],
      p: ['99.9% SLO = about 43 min/month error budget.', 'Good SLIs: success rate, p95/p99 latency, freshness, correctness.', 'SLO maths lives in the monitoring tool; the app emits honest metrics.'],
      f: [['Why set the SLO stricter than the SLA?', 'So you breach your internal target and react before breaking the contract and paying service credits.'],
          ['What happens when the error budget is used up?', 'Freeze risky feature releases and spend the effort on reliability until the budget recovers.']],
      q: [{ q: 'Which is an SLI?', o: ['Measured: 99.95% of requests under 300 ms', '"We promise 99.5% or service credits"', 'Internal target of 99.9%', 'The incident runbook'], a: 0, e: 'An SLI is the measured indicator; the target is the SLO and the contract is the SLA.' }]
    },
    cap: {
      say: 'CAP says that when a network partition splits a distributed data store, it must choose consistency, refusing or erroring rather than returning stale data, or availability, answering possibly stale. It is not pick any two: partitions happen, so the real choice is C or A during a partition. Payments lean CP; feeds and carts lean AP.',
      k: ['consistency', 'availability', 'partition tolerance', 'CP', 'AP', 'tunable consistency'],
      p: ['P is a given in distributed systems.', 'CP: ZooKeeper, etcd, HBase. AP: Cassandra, DynamoDB, CouchDB.', 'Many DBs tune it per request (Cassandra levels, Cosmos DB 5 levels).'],
      f: [['When would you choose AP over CP?', 'When stale data is acceptable and downtime is not: product catalogues, social feeds, recommendations, shopping carts.'],
          ['Why is "pick any 2 of 3" wrong?', 'You cannot opt out of partitions in a distributed system, so the choice is only between consistency and availability while a partition lasts.']],
      q: [{ q: 'A ledger service must never show a wrong balance, even during a network split. Which choice?', o: ['AP', 'CP', 'CA', 'Eventual consistency'], a: 1, e: 'CP refuses or delays answers rather than return stale or conflicting data.' }]
    },
    pacelc: {
      say: 'PACELC extends CAP: during a partition choose availability or consistency; else, in normal operation, choose latency or consistency. Consistency ranges from strong (linearizable) through bounded staleness, session and causal down to eventual. With quorums, R plus W greater than N means reads see the latest write.',
      k: ['PACELC', 'linearizable', 'bounded staleness', 'read-your-writes', 'causal', 'eventual', 'quorum R + W > N', 'optimistic concurrency'],
      p: ['PA/EL: Cassandra, DynamoDB. PC/EC: RDBMS clusters, Spanner.', 'Cosmos DB levels: Strong, Bounded Staleness, Session (default), Consistent Prefix, Eventual.', 'N=3, W=2, R=2 gives overlapping quorums.', 'rowversion / [Timestamp] stops lost updates.'],
      f: [['What does the "ELC" in PACELC add?', 'Even with no partition, replication forces a trade-off: wait for replicas (consistency) or answer fast (latency).'],
          ['What is session consistency?', 'Read-your-writes: within a session you always see your own updates, while others may see them later. It is the Cosmos DB default.']],
      q: [{ q: 'With N = 3 replicas, which setting guarantees reads see the latest write?', o: ['W = 1, R = 1', 'W = 2, R = 1', 'W = 2, R = 2', 'W = 1, R = 2'], a: 2, e: 'R + W must exceed N: 2 + 2 = 4 > 3, so every read quorum overlaps the last write quorum.' }]
    },
    dr: {
      say: 'RPO is how much data you can afford to lose; RTO is how long you can be down. The business sets them through a business impact analysis, and tech picks a strategy: backup and restore, pilot light, warm standby, or multi-site active-active, each faster and more expensive. Test DR regularly.',
      k: ['RPO', 'RTO', 'business impact analysis', 'backup and restore', 'pilot light', 'warm standby', 'active-active', 'failover group'],
      p: ['Backup & restore: hours-days RTO. Active-active: near zero, highest cost.', 'An untested DR plan is just a wish.', 'Drills miss RTO on DNS caches, firewall rules, secrets, connection strings.', 'APRA CPS 230 and CPS 234 shape DR/BCP for Australian regulated entities.'],
      f: [['Difference between HA and DR?', 'HA handles local failures (node or zone) automatically with little downtime. DR recovers from large-scale disasters (region loss, ransomware) within the agreed RPO/RTO.'],
          ['What is pilot light?', 'Data is replicated to the DR region but core compute is minimal or off; you start it on failover. RTO tens of minutes to hours, low cost, needs good IaC.']],
      q: [{ q: 'The business says "we can lose at most 5 minutes of transactions". Which metric is that?', o: ['RTO', 'MTBF', 'SLA', 'RPO'], a: 3, e: 'RPO is the maximum acceptable data loss, measured back in time from the failure.' }]
    },
    cells: {
      say: 'Cell-based architecture splits the whole stack into independent cells, each with its own app, database and cache, serving a slice of customers behind a thin router. A failure or bad deploy hits one cell, not everyone, and you scale by adding cells of a tested size. Multi-region active-active adds region protection; the hard parts are capacity headroom and write conflicts.',
      k: ['cell', 'deployment stamps', 'cell router', 'blast radius', 'home region', 'last writer wins', 'CRDT', 'anycast'],
      p: ['10 cells: one failure hits about 10% of customers.', 'Keep the router dumb and static (a lookup table) and cache the mapping.', 'Single writer per record (home region) avoids conflicts: right for balances.', 'Front Door fails over fast (no DNS TTL); Traffic Manager depends on DNS TTL.'],
      f: [['What is the hardest part of active-active across regions?', 'Not routing. Data (async replication means possible loss or conflicts, so use a home region or conflict policy) and capacity (each region must take 100% after failover).'],
          ['Why is last writer wins wrong for an account balance?', 'It silently drops one of two concurrent updates. For money, give each account one home region for writes so there is nothing to resolve.'],
          ['When is a cell-based architecture probably not worth it?', 'When single-region with zones already meets the SLO, or the team cannot yet automate deployments and failover.']],
      q: [{ q: 'What is the main benefit of a cell-based architecture?', o: ['A smaller blast radius for failures and bad deployments', 'Lower latency for every request', 'No need for a router', 'Strong consistency across regions'], a: 0, e: 'Each cell serves a slice of customers, so an outage or bad deploy affects only that slice.' },
          { q: 'Two regions accept writes for the same customer profile at once. Which conflict policy is simplest?', o: ['Two-phase commit', 'Last writer wins by timestamp', 'Pilot light', 'Consistent hashing'], a: 1, e: 'Last writer wins is simple and fine for profiles, though it silently drops one update.' }]
    }
  }
};
