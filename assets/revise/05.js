/* Quick-revision data for 05-caching.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['05'] = {
  approach: [
    ['Clarify the access pattern', 'Read/write ratio, data size, how stale is acceptable, hot keys?'],
    ['Pick where to cache', 'Browser, CDN, gateway, app (in-memory), distributed (Redis), DB buffer.'],
    ['Pick the read/write pattern', 'Cache-aside by default; write-through when reads must be fresh.'],
    ['Decide expiry and eviction', 'TTL with jitter, explicit invalidation on writes, LRU/LFU when full.'],
    ['Cover failure modes', 'Stampede, penetration, avalanche, cache down: what happens to the DB?'],
    ['Close with numbers', 'Target hit ratio (e.g. 90%+), latency saved, memory sizing.']
  ],
  traps: [
    'Saying "just add Redis" without an invalidation plan.',
    'Forgetting the cache can be stale, down, or cold after a restart.',
    'Caching per-user or sensitive data without scoping the key.'
  ],
  sections: {
    layers: {
      say: 'You can cache at every hop: browser, CDN, gateway, app memory, a distributed cache and the database. The closer to the user, the faster, but the harder to invalidate.',
      k: ['browser cache', 'CDN edge', 'API gateway', 'in-memory (L1)', 'distributed (L2)', 'DB buffer pool'],
      p: ['Closer to the user = lower latency, weaker control.', 'L1 in-process is fastest but each instance has its own copy.', 'L2 (Redis) is shared and survives app restarts.'],
      f: [['What is the trade-off between an in-memory (L1) cache and a distributed (L2) cache?', 'L1 is fastest (no network) but each instance holds its own, possibly inconsistent, copy. L2 is shared and consistent across instances, but adds a network hop.']],
      q: [{ q: 'Which cache layer is shared by all app instances and survives an app restart?', o: ['Browser cache', 'In-process memory cache', 'Distributed cache such as Redis', 'CPU cache'], a: 2, e: 'A distributed cache lives outside the app, so every instance sees the same data and it survives app restarts.' }]
    },
    strategies: {
      say: 'Cache-aside is the default: read the cache, on a miss read the database and fill the cache. Write-through keeps the cache fresh on every write; write-behind is fastest but can lose data.',
      k: ['cache-aside', 'read-through', 'write-through', 'write-behind', 'write-around', 'hit ratio'],
      p: ['Cache-aside: app owns the logic; only requested data is cached.', 'Write-through: fresh reads, slower writes.', 'Write-behind: fast writes, risk of loss if the cache dies.'],
      f: [['Explain cache-aside in one breath.', 'Read cache, on miss read the DB and put the result in the cache with a TTL; on write, update the DB and delete the cache key.'],
          ['When would you choose write-behind?', 'Write-heavy workloads where some delay and a small risk of loss are acceptable, e.g. counters or analytics, not payments.']],
      q: [{ q: 'In cache-aside, what should you usually do to the cache when the data is updated?', o: ['Update the cache first, then the DB', 'Delete (invalidate) the cache key after writing the DB', 'Nothing, wait for the TTL', 'Flush the whole cache'], a: 1, e: 'Write the DB, then delete the key. The next read refills it. Updating the cache directly risks races that leave stale data.' }]
    },
    expiration: {
      say: 'Expire data with a TTL, add jitter so keys do not all expire together, and invalidate explicitly when the source changes.',
      k: ['TTL', 'jitter', 'sliding expiration', 'absolute expiration', 'event-based invalidation', 'versioned keys'],
      p: ['TTL = how stale you can tolerate.', 'Jitter spreads expiries and prevents avalanches.', 'Event or versioned-key invalidation for data that must be fresh.'],
      f: [['Why add jitter to a TTL?', 'So many keys set at the same time do not all expire together and hit the database at once (cache avalanche).']],
      q: [{ q: 'Which technique stops thousands of keys expiring at the same second?', o: ['Longer keys', 'Random jitter on the TTL', 'LRU eviction', 'Write-through'], a: 1, e: 'Adding a random offset to each TTL spreads expiries over time.' }]
    },
    eviction: {
      say: 'When the cache is full it must evict something: LRU removes the least recently used, LFU the least frequently used, and TTL-based eviction removes expired keys first.',
      k: ['LRU', 'LFU', 'FIFO', 'TTL eviction', 'maxmemory-policy', 'working set'],
      p: ['Eviction is about capacity, expiry is about freshness.', 'LRU suits recency-heavy traffic; LFU keeps steady hot keys.', 'Size the cache to the working set, not the whole dataset.'],
      f: [['Eviction vs expiration: what is the difference?', 'Expiration removes data because it is too old (freshness). Eviction removes data because the cache is full (capacity).']],
      q: [{ q: 'A few product pages are always popular, but a nightly batch touches many cold keys once. Which policy protects the popular pages best?', o: ['FIFO', 'LRU', 'LFU', 'Random'], a: 2, e: 'LFU keeps frequently used keys; a one-off scan of cold keys does not push them out the way it can with LRU.' }]
    },
    problems: {
      say: 'Three classic failures: a stampede when a hot key expires, penetration when requests ask for keys that do not exist, and an avalanche when many keys expire or the cache dies at once.',
      k: ['cache stampede', 'single-flight / lock', 'cache penetration', 'negative caching', 'Bloom filter', 'cache avalanche'],
      p: ['Stampede: lock or single-flight so one caller refills; refresh early.', 'Penetration: cache "not found" briefly, or check a Bloom filter first.', 'Avalanche: TTL jitter, multi-level cache, circuit breaker to protect the DB.'],
      f: [['How do you stop a cache stampede on a hot key?', 'Let only one request rebuild the value (lock or single-flight), serve the stale value meanwhile, or refresh it before it expires.'],
          ['What is cache penetration and the fix?', 'Requests for keys that do not exist always miss and hit the DB. Fix: cache a short-lived "null" result or reject unknown keys with a Bloom filter.']],
      q: [{ q: 'Attackers request random product IDs that do not exist, and every request hits the database. What is this called?', o: ['Cache stampede', 'Cache penetration', 'Cache avalanche', 'Cache warming'], a: 1, e: 'Penetration: the keys never exist, so the cache never helps. Negative caching or a Bloom filter blocks them.' }]
    },
    cdn: {
      say: 'A CDN caches static and cacheable content at edge locations close to users, cutting latency and offloading the origin. Control it with Cache-Control headers and versioned file names.',
      k: ['edge / PoP', 'origin', 'Cache-Control', 'ETag', 'cache busting', 'purge'],
      p: ['Best for static assets, images, video and public API responses.', 'Version file names (app.3f2a.js) instead of purging.', 'Never cache personalised responses at the edge without varying the key.'],
      f: [['How do you push a new version of a CSS file through a CDN instantly?', 'Change the file name or add a version hash (cache busting), so the CDN treats it as a new object. Purge only as a fallback.']],
      q: [{ q: 'Which HTTP header mainly controls how long a CDN and browser may cache a response?', o: ['Authorization', 'Cache-Control', 'Content-Type', 'Accept'], a: 1, e: 'Cache-Control (max-age, s-maxage, no-store) tells browsers and CDNs how to cache.' }]
    },
    redis: {
      say: 'Redis is a data-structure server with persistence, replication and pub/sub; Memcached is a simpler, multi-threaded key-value cache. Choose Redis unless you only need plain string caching.',
      k: ['data structures', 'persistence (RDB/AOF)', 'replication', 'Redis Cluster', 'multi-threaded', 'pub/sub'],
      p: ['Redis: lists, sets, sorted sets, streams, Lua, persistence.', 'Memcached: simple strings, multi-threaded, no persistence.', 'Redis also covers locks, rate limits and leaderboards.'],
      f: [['Name three things Redis can do that Memcached cannot.', 'Rich data structures (sorted sets, streams), persistence to disk, and replication with failover. Also pub/sub and Lua scripts.']],
      q: [{ q: 'You need a leaderboard ordered by score. Which Redis structure fits?', o: ['String', 'List', 'Sorted set', 'Hash'], a: 2, e: 'A sorted set keeps members ordered by score, with fast rank and range queries.' }]
    },
    probabilistic: {
      say: 'Probabilistic structures trade a small, known error for huge memory savings: a Bloom filter answers "definitely not" or "maybe", HyperLogLog counts unique items, and Count-Min Sketch estimates frequencies.',
      k: ['Bloom filter', 'false positive', 'HyperLogLog', 'cardinality', 'Count-Min Sketch', 'heavy hitters'],
      p: ['Bloom filter: no false negatives, some false positives.', 'HyperLogLog: unique counts in about 12 KB per key in Redis.', 'Count-Min Sketch: approximate counts for top-K and heavy hitters.'],
      f: [['A Bloom filter says "maybe present". What does that mean?', 'The item might be in the set (false positives are possible). If it says "not present", the item is definitely not there.']],
      q: [{ q: 'Which structure counts unique visitors with tiny memory and a small error?', o: ['Bloom filter', 'HyperLogLog', 'Count-Min Sketch', 'Sorted set'], a: 1, e: 'HyperLogLog estimates cardinality (unique count) with a standard error around 1%.' }]
    }
  }
};
