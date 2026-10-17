/* Quick-revision data for 19-design-case-studies.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['19'] = {
  approach: [
    ['Requirements', 'Pick 2-3 core features; pin the NFRs as numbers: users, read:write ratio, latency percentile, availability, consistency. Say what is out of scope.'],
    ['Estimates', 'Requests/s average and peak, storage per year, bandwidth, connections or key space. Name what the numbers force: cache, shard, queue or CDN.'],
    ['API and data model', 'Main endpoints or events with idempotency keys and cursor pagination; tables with partition key, unique keys and why SQL or NoSQL.'],
    ['High-level design', 'Draw client, edge, gateway, services, stores and async parts; walk the write path and the hot read path end to end.'],
    ['Deep dives', 'The one hard problem per case (key generation, atomic counters, ordering, fan-out, transcoding, double-entry), then failure modes and hot keys.'],
    ['Testing', 'Duplicate and retry tests, concurrency races, failover (store down, provider down), load test at peak, and an SLO you can measure.'],
    ['Trade-offs', 'Close with "I chose X because..., at the cost of..." and how the design scales or evolves in v2.']
  ],
  traps: [
    'Skipping the estimate, so nothing justifies the cache, shards or queues.',
    'Promising exactly-once or global ordering instead of at-least-once with dedupe and per-key ordering.',
    'Putting slow work (analytics, fan-out, transcoding) on the synchronous request path.',
    'Not saying what happens when Redis, a provider or a region fails.',
    'Ignoring hot keys: viral links, huge tenants, celebrities, settlement accounts.'
  ],
  sections: {
    url: {
      say: 'A URL shortener is a read-heavy key-value lookup with one hard part: unique short keys. At 100 million links a month that is about 40 writes and 4,000 reads per second. Seven base62 characters give about 3.5 trillion codes. Use a counter with base62 or a key-generation service, cache-aside in Redis, 302 redirects, and async click analytics.',
      k: ['base62', 'key generation service (KGS)', 'counter + base62', '301 vs 302', 'cache-aside', 'negative caching', 'async analytics', 'open redirect'],
      p: ['Writes ~40/s, reads ~4,000/s (100:1), ~3 TB over 5 years.', '7 base62 chars = about 3.5 trillion codes.', 'Redirect path: one cache lookup, nothing else.', 'Validate URLs at creation (http/https only) to avoid an open redirect.'],
      f: [
        ['How do you avoid two links getting the same code?', 'Encode a unique counter in base62, or give each server a block of pre-generated keys from a key service. If you hash the URL, check for a collision and retry with a salt.'],
        ['301 or 302 for the redirect?', '302 when you need click analytics, expiry or abuse blocking, because every click reaches you. 301 lets browsers cache it, which saves load but loses analytics and control.'],
        ['Why shuffle or encrypt a counter before base62?', 'Sequential codes are guessable, and the NFR says codes should not be easy to guess.'],
        ['How do you protect the DB from bots scanning random codes?', 'Cache "not found" results briefly (negative caching) and rate limit; most requests then never reach the DB.'],
        ['Test scenarios for a URL shortener?', 'Create the same alias twice (expect a conflict), redirect an expired link (expect 410), submit a javascript: URL (expect rejection), and load test redirects at 10,000/s with the cache cold and warm.'],
        ['How do you handle a viral link?', 'An in-process L1 cache on each node plus a CDN with a short TTL in front of GET /{code}, so the hot key never hammers Redis or the DB.']
      ],
      q: [
        { q: 'The product team needs per-click analytics and the ability to expire links. Which redirect should you return?', o: ['302 Found (temporary)', '301 Moved Permanently', '200 with a meta refresh', '404 Not Found'], a: 0, e: 'Browsers cache 301s and skip your service, so you lose clicks and control. A 302 sends every click through you.' },
        { q: 'Each API node grabs a block of 1,000 pre-generated codes and then crashes. What is the impact?', o: ['Duplicate codes will be issued', 'All existing links break', 'The key service must be rebuilt', 'The unused codes in that block are lost, which is acceptable'], a: 3, e: 'Lost keys are harmless with trillions available; collisions cannot happen because each block is handed out once.' }
      ]
    },
    ratelimiter: {
      say: 'A distributed rate limiter shares one bucket per client across all gateway nodes, usually in Redis. Use a token bucket, and run refill-and-take as one atomic Lua script using Redis server time. At a million checks per second, shard Redis by key. Decide fail-open or fail-closed per endpoint, and return 429 with Retry-After.',
      k: ['token bucket', 'sliding window counter', 'Lua script (atomic)', 'Redis Cluster sharding', 'fail-open vs fail-closed', '429 + Retry-After', 'per-region limits', 'hot tenant'],
      p: ['Budget: under 2 ms p99 added; ~5 ms timeout on the Redis call.', '1M checks/s / ~100k ops per shard = ~10 shards, ~20 with headroom.', 'Built-in .NET limiters count per instance; a shared limit needs a shared store.', 'Limit after authentication so attackers cannot invent new keys.'],
      f: [
        ['Why must the check be a Lua script?', 'Read-then-write from two gateways is a race: both see one token and both allow. A Lua script runs atomically inside Redis: refill, take, save, return.'],
        ['What happens if Redis goes down?', 'Decide per endpoint. Most APIs fail open with a local in-memory limiter as a safety net; login, OTP and payment initiation fail closed because abuse costs more than downtime.'],
        ['How do you handle multiple regions?', 'Usually per-region limits (limit divided by regions) with no cross-region calls. Global CRDT counters can overshoot briefly. Never make a synchronous cross-region call per request.'],
        ['Why use Redis server time?', 'So clock skew between gateway nodes does not distort refill calculations.'],
        ['Test scenarios for a rate limiter?', 'Fire concurrent requests from many nodes at one key and assert the limit is not exceeded; kill Redis and check fail-open or fail-closed per endpoint; check 429 and Retry-After headers; burst at a window edge.'],
        ['One huge tenant overloads a shard. Fix?', 'Split its quota into N sub-buckets across keys, or give it a local limiter.']
      ],
      q: [
        { q: 'Two gateways each read "1 token left" from Redis and both allow the request. What fixes this?', o: ['A longer TTL on the key', 'Adding a read replica', 'Doing refill and take in one atomic Lua script', 'Switching to fixed windows'], a: 2, e: 'The race is between read and write. An atomic server-side script removes it.' },
        { q: 'Redis is unreachable. Which endpoint should fail closed?', o: ['Product catalogue search', 'OTP verification', 'Public status page', 'Image thumbnails'], a: 1, e: 'For login, OTP and payment initiation, abuse costs more than a short outage, so deny when you cannot check.' }
      ]
    },
    chat: {
      say: 'A chat app keeps long-lived WebSocket connections on stateless gateways, with chat logic behind them. Each conversation gets its own sequence number, messages go to a wide-column store partitioned by conversation and month, and Redis holds sessions and presence. Persist before you ack, dedupe on the client message ID, and use push only to wake the app.',
      k: ['WebSockets', 'gateway / session map', 'per-conversation sequence', 'wide-column store', 'clientMsgId dedupe', 'presence heartbeat + TTL', 'read up to seq N', 'pub/sub backplane'],
      p: ['~23k messages/s, ~70k/s peak; ~146 TB/year before replication.', '10M connections / ~50k per server = ~200 gateway servers.', 'Store first, then ack, then deliver.', 'Order within a conversation only; global order does not scale.'],
      f: [
        ['How do you keep messages in order?', 'A sequence number per conversation (Redis INCR or one stream partition per conversation). Clients sort by it and fetch any gaps.'],
        ['How do you make sure no message is lost or duplicated?', 'Persist before acking; the client resends until acked; the server dedupes on clientMsgId; offline users catch up with /sync since their last seq.'],
        ['How do you do presence cheaply?', 'A heartbeat every ~30 s sets a Redis key with a TTL. If it expires, the user is offline. Only push presence to people who have the chat open.'],
        ['How are read receipts stored?', 'As "read up to seq N" per member, not a flag on every message.'],
        ['Big channel vs small group delivery?', 'Small groups fan out on write to each online member\'s gateway. Big channels store once and notify, and clients pull.'],
        ['Test scenarios for chat?', 'Drop the ack and resend (expect one message), disconnect and reconnect (expect /sync to fill gaps), deploy gateways (expect jittered reconnects, no storm), and send from two devices at once (expect stable seq order).']
      ],
      q: [
        { q: 'When should the server send the sender\'s single "stored" tick?', o: ['As soon as the message arrives at the gateway', 'After the recipient reads it', 'After the message is persisted', 'After the push notification is sent'], a: 2, e: 'Persist before you ack, so an acked message can never be lost.' },
        { q: 'Why partition messages by (conversation, month) rather than conversation alone?', o: ['To stop one busy chat from creating a huge partition', 'To give global ordering', 'To make presence faster', 'To support end-to-end encryption'], a: 0, e: 'Time bucketing bounds partition size for very active conversations.' }
      ]
    },
    notification: {
      say: 'A shared notification platform takes one API call, returns 202, and routes by user preferences and quiet hours to separate queues per channel and per priority, so marketing never delays an OTP. Workers rate-limit themselves to each provider, retry only transient errors, fail over behind circuit breakers, and dedupe on notification and channel.',
      k: ['202 Accepted', 'Idempotency-Key', 'priority queues per channel', 'preferences / quiet hours', 'provider rate limit', 'circuit breaker + failover', 'DLQ + replay', 'templates per locale'],
      p: ['100M/day = ~1,200/s average; a 10M campaign in 15 min adds ~11k/s.', 'Reserve provider capacity for high priority (e.g. 30% of SMS rate).', 'An OTP 10 minutes late is useless: give it a TTL.', 'With 5 worker replicas, each gets 1/5 of the provider rate, or share a Redis bucket.'],
      f: [
        ['How do you stop a campaign delaying OTPs?', 'Separate queues and worker pools per priority, with reserved provider capacity for high priority. A priority field inside one queue is not enough.'],
        ['Where do you dedupe?', 'Twice: the API Idempotency-Key, and (notificationId, channel) just before calling the provider.'],
        ['What do you retry and what not?', 'Retry timeouts, 429s and 5xx with exponential backoff and jitter. Do not retry hard bounces. After max attempts, dead-letter and replay after the fix.'],
        ['Transactional vs marketing messages?', 'Transactional and security messages cannot be fully opted out of; marketing is opt-in and must honour unsubscribe under spam laws such as the Spam Act 2003.'],
        ['Test scenarios for the platform?', 'Send the same Idempotency-Key twice (one notification), run a 10M campaign while sending OTPs (OTP latency stays under 5 s), force the primary SMS provider to fail (traffic switches to backup), and send during quiet hours (deferred in the user\'s time zone).']
      ],
      q: [
        { q: 'An SMS provider allows 100 messages/s and you run 5 worker replicas, each with its own in-memory token bucket. What should each bucket allow?', o: ['100/s each', '500/s each', 'No limit; rely on the provider\'s 429s', '20/s each, or use one shared Redis bucket'], a: 3, e: 'A local limiter only limits its own worker. Split the rate across replicas or share a bucket.' },
        { q: 'Which design keeps a marketing blast from delaying OTPs?', o: ['A priority field on messages in one queue', 'Separate queues and workers per priority', 'Larger message batches', 'A longer visibility timeout'], a: 1, e: 'Physically separate queues and worker pools isolate high-priority traffic.' }
      ]
    },
    feed: {
      say: 'A news feed is about when you do the work. Fan-out on write pushes each post ID into followers\' Redis sorted sets, making reads one lookup; fan-out on read merges at read time. The answer is hybrid: push for normal authors, pull for celebrities above a follower threshold. Feeds store only IDs, and paging uses cursors.',
      k: ['fan-out on write (push)', 'fan-out on read (pull)', 'hybrid', 'celebrity problem', 'Redis sorted set', 'cursor pagination', 'ranking', 'hydration'],
      p: ['~23k feed reads/s; fan-out on write ~230k inserts/s.', 'Cap each feed at ~800 entries; cache only active users.', 'Skip fan-out for followers inactive 30+ days; rebuild on first visit.', 'Cursor = last (score, post_id), opaque; offsets break as posts arrive.'],
      f: [
        ['What is the celebrity problem?', 'With fan-out on write, one post by an account with millions of followers means millions of feed writes. Fix: push for normal accounts, pull celebrity posts at read time and merge.'],
        ['Why store only post IDs in the feed?', 'Post bodies are cached once and shared by everyone; feeds stay small, and edits or deletes do not need rewriting every feed.'],
        ['Why cursors, not offsets?', 'New posts shift offsets, so users see duplicates or skip items. A cursor of last (score, post_id) stays stable.'],
        ['How do you handle unfollow and delete?', 'Filter at read time, which is cheap, and clean up feeds lazily.'],
        ['Test scenarios for the feed?', 'Post from a celebrity above the threshold (no fan-out, still appears via pull), scroll while new posts arrive (no duplicates or gaps), delete a post (gone on next read), and check a new post shows up for followers within ~10 s.']
      ],
      q: [
        { q: 'An account with 10M followers posts. In a hybrid design, what happens?', o: ['Fan-out is skipped; followers pull the post at read time and merge it', '10M feed inserts are written immediately', 'The post is rejected', 'Only the first 800 followers see it'], a: 0, e: 'Above the follower threshold, pull avoids a write storm while normal authors still get fast push.' },
        { q: 'Why does offset pagination break an infinite-scroll feed?', o: ['Offsets are slower to compute in SQL', 'Redis does not support offsets', 'Offsets leak user data', 'New posts shift positions, causing duplicates or skipped items'], a: 3, e: 'Cursors anchor on the last item seen, so inserts at the top do not shift the next page.' }
      ]
    },
    video: {
      say: 'A video platform has a one-off processing pipeline per upload and a huge read path carried by the CDN. Clients upload chunks straight to blob storage with a short-lived write-only URL. Videos are split at keyframes, encoded in parallel into a bitrate ladder, packaged once as CMAF for HLS and DASH. The player picks the bitrate; egress and hit ratio decide the bill.',
      k: ['resumable chunked upload', 'write-only SAS / pre-signed URL', 'bitrate ladder', 'HLS / DASH / CMAF', 'adaptive bitrate', 'CDN hit ratio', 'origin shield', 'DRM'],
      p: ['Peak egress 15 Tbps: each 1% of CDN misses = 150 Gbps on the origin.', '~80 MB per video minute for a 5-rung ladder; ~88 PB/year.', 'Jobs idempotent per (video, segment, rung), so retries and Spot evictions are safe.', 'Same GOP length on every rung so the player can switch at any segment.'],
      f: [
        ['Why cut a video into segments at several bitrates?', 'Segments allow parallel encoding (minutes, not hours) and let the player switch quality at each boundary. The ladder gives every network a playable rung, and immutable segments cache well.'],
        ['Why not upload through your API servers?', 'Streaming gigabytes through the API wastes capacity. A short-lived, write-only URL for one blob lets the client upload blocks in parallel and resume only the missing ones.'],
        ['What is the biggest cost and how do you cut it?', 'Egress. Keep the cache hit ratio high, use per-title encoding and newer codecs where supported, multi-CDN deals, and cooler storage tiers for the long tail.'],
        ['How do you protect content?', 'The play API signs a manifest URL that expires in minutes to stop hotlinking; premium content adds DRM, with the licence server checking entitlement.'],
        ['How are view counts done?', 'INCR in Redis, flushed to the DB every minute; unique viewers with HyperLogLog. Counts lag a little by design.'],
        ['Test scenarios for the video platform?', 'Drop an upload midway and resume (only missing blocks resent), kill a transcode worker (job retries idempotently), throttle bandwidth in the player (switches rung without stalling), and expire a signed URL (playback denied).']
      ],
      q: [
        { q: 'Who chooses which bitrate rung to fetch next in adaptive streaming?', o: ['The origin server', 'The CDN edge', 'The player, based on measured throughput and buffer', 'The DRM licence server'], a: 2, e: 'ABR is client-driven: the player picks each next segment\'s rung.' },
        { q: 'At 15 Tbps peak, why is CDN hit ratio the key metric?', o: ['It sets encoding speed', 'Each 1% of misses adds about 150 Gbps of origin load and egress', 'It decides DRM licence cost', 'It controls upload resumability'], a: 1, e: 'Misses go back to the origin; a small change in hit ratio is a huge change in traffic and cost.' }
      ]
    },
    ledger: {
      say: 'A payment ledger favours correctness over speed. Each transfer is a balanced set of append-only double entries in integer minor units. Entries, the conditional balance update and an outbox row commit in one ACID transaction, with a unique idempotency key. Reversals add opposite entries, and nightly reconciliation proves stored balances equal the sum of entries.',
      k: ['double-entry', 'append-only', 'minor units (cents)', 'idempotency key', 'conditional update', 'transactional outbox', 'saga + suspense account', 'reconciliation'],
      p: ['50M transactions/day = ~580/s, ~5k/s peak; ~7 TB of entries per year.', 'Read the available balance from the primary, never a stale cache.', 'Update accounts in ID order to avoid deadlocks.', 'Hot account: split into N sub-accounts, or batch its postings.'],
      f: [
        ['Why store a balance if you can sum the entries?', 'Summing is slow for busy accounts and makes the overdraw check expensive. Store it, update it in the same transaction as the entries, and check nightly that it equals the sum.'],
        ['How do you stop double charges and overdraws?', 'A unique index on the idempotency key makes retries return the original result, and a conditional update WHERE available >= amount stops two withdrawals racing.'],
        ['How do you fix a wrong posting?', 'Never update or delete. Post a reversal: new entries opposite to the original.'],
        ['How do you post across shards or to another bank?', 'A saga through a holding or suspense account, with compensating entries if a later step fails.'],
        ['Test scenarios for a ledger?', 'Retry with the same idempotency key (one posting, same response), two concurrent withdrawals exceeding the balance (one fails), opposite transfers A to B and B to A at once (no deadlock), and assert every transaction\'s entries sum to zero.'],
        ['What gives auditors tamper evidence?', 'SQL ledger tables or hash-chained entries, plus append-only design and traced transactions.']
      ],
      q: [
        { q: 'A client retries POST /transfers after a timeout with the same Idempotency-Key. What should the ledger do?', o: ['Post the transfer again', 'Reject it as a fraud attempt', 'Return the original stored result and post nothing new', 'Reverse the first transfer'], a: 2, e: 'The unique idempotency key gives an exactly-once effect: duplicates return the first result.' },
        { q: 'Two transfers run at once: A to B and B to A. How do you avoid a deadlock?', o: ['Lock accounts in a fixed order, such as by account ID', 'Lock accounts in from/to order', 'Use a read replica', 'Disable transactions'], a: 0, e: 'A consistent lock order means both transactions request locks in the same sequence, so neither waits on the other in a cycle.' }
      ]
    }
  }
};
