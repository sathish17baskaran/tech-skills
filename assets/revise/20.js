/* Quick-revision data for 20-dotnet-system-design-use-cases.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['20'] = {
  approach: [
    ['Restate and size it', 'Functional needs, then numbers: peak req/s, data size, p99 target, "zero oversold" style correctness rules.'],
    ['Find the one hard part', 'Atomic stock, exclusive holds, ranking at read time, moving objects, single firing, permissions. Say it out loud.'],
    ['Pick the core decisions', 'Store per problem (SQL truth, Redis gate), sync vs async, and the trade-off of each in one line.'],
    ['Show the core trick in .NET', 'Lua script, conditional UPDATE via ExecuteUpdateAsync, SET NX PX, GEOSEARCH, SAS, durable timer, search.in filter.'],
    ['Design for retries and failure', 'Idempotency keys, duplicate messages, fail closed or fail soft, fallbacks, dead-letter queues.'],
    ['Prove it with tests', 'Positive, negative and edge cases: Task.WhenAll race tests on Testcontainers, FakeTimeProvider, load tests with k6.'],
    ['Close with observability', 'OpenTelemetry metrics for the business events (reserved, expired, scanned, declined) and the latency SLO.']
  ],
  traps: [
    'Doing "read, then write" in two calls instead of one atomic check-and-update.',
    'Claiming exactly-once delivery instead of at-least-once plus idempotent handlers.',
    'Testing concurrency on the EF Core in-memory provider, which has no row locks.',
    'Using DateTime.UtcNow directly, so expiry and DST logic cannot be tested.',
    'Letting the LLM prompt decide permissions instead of trimming at retrieval.'
  ],
  sections: {
    'flash-sale': {
      say: 'For a flash sale the hard part is never overselling under a huge spike. I gate stock in Redis with a Lua script that checks and decrements atomically, answer 202 fast, and let a queue and worker write the order to SQL with a final WHERE Stock >= @qty guard. Idempotency keys stop double buys; unpaid reservations expire after 10 minutes.',
      k: ['atomic check-and-decrement', 'Redis Lua script', 'conditional UPDATE', '202 Accepted', 'idempotency key', 'reservation expiry', 'admission control', 'pre-scale'],
      p: ['Never read stock then write stock in two calls.', 'Redis is the gate, SQL is the truth; a reconcile job fixes drift.', 'Redis down = 503, fail closed: never sell blind.', 'Pre-scale before 12:00; autoscale is too slow for a 2-minute spike.'],
      f: [
        ['How do you guarantee you never oversell?', 'Make check and take one atomic step: a Redis Lua script or UPDATE ... SET Stock = Stock - @qty WHERE Stock >= @qty and check rows affected. Add idempotency keys and prove it with a parallel Task.WhenAll test against a real container.'],
        ['Why answer 202 instead of writing the order synchronously?', 'The queue absorbs the spike and keeps the reserve call under 200 ms. The cost is a short "pending" state and a timeout to release unpaid stock.'],
        ['Why check the idempotency key inside the same Lua script?', 'So "seen before?" and "take stock" cannot race. A double-click or retry returns the first orderId and stock goes down once.'],
        ['What happens if Redis says 1 left but SQL says 0?', 'The SQL guard updates 0 rows, the worker rolls back, releases the reservation in Redis and the shopper is told sold out.']
      ],
      q: [
        { q: '500 parallel buys arrive for the last 100 items. Which design guarantees exactly 100 orders?', o: ['A Redis Lua script that checks and decrements in one atomic step', 'Read stock, then decrement it in a second call', 'Optimistic UI that hides the button at zero', 'A longer cache TTL on the stock count'], a: 0, e: 'A Lua script runs as one step in Redis, so no two requests can see the same last item.' },
        { q: 'Redis fails during the sale. What should the reserve endpoint do?', o: ['Fall back to selling without a stock check', 'Return 202 and fix it later', 'Retry forever', 'Return 503 and fail closed'], a: 3, e: 'Correctness is "0 oversold, ever", so the system must never sell blind.' }
      ]
    },
    booking: {
      say: 'Booking needs a short exclusive hold. I grant it with one conditional UPDATE: set HeldBy and HoldExpiresAt where the seat is free or the hold has expired. Expiry is lazy, so an expired hold simply counts as free and a sweeper only tidies up. Multi-seat holds are all or nothing in one transaction. For huge on-sales, Redis SET NX PX goes in front.',
      k: ['temporary hold', 'conditional UPDATE', 'lazy expiry', 'all or nothing', 'SET NX PX', 'TimeProvider', 'FakeTimeProvider', 'compare-and-delete'],
      p: ['Hold = "mine until time X", granted atomically.', 'Expired hold (<= now) is free in every query; no timer per seat.', 'Confirm re-checks the hold; a late payment for a taken seat is refunded.', 'Race-test against real SQL, never the in-memory provider.'],
      f: [
        ['How do holds expire without a timer per seat?', 'Store HoldExpiresAt and treat any hold with HoldExpiresAt <= now as free in every query. A periodic sweeper only clears rows and pushes "free again" events.'],
        ['How do you make a 3-seat hold all or nothing?', 'Run one conditional ExecuteUpdateAsync inside a transaction; if fewer rows changed than seats requested, roll back and return 409.'],
        ['How do you test a 10-minute expiry in milliseconds?', 'Inject TimeProvider everywhere and in tests swap in FakeTimeProvider, then call Advance(TimeSpan.FromMinutes(10)).'],
        ['How do you release a Redis hold safely?', 'Compare-and-delete in one Lua script: delete the key only if its value is still your user id, so you never remove someone else\'s hold.']
      ],
      q: [{ q: 'Why does a race test pass on the EF Core in-memory provider but fail in production?', o: ['The in-memory provider is slower', 'Production uses a different LINQ syntax', 'The in-memory provider has no row locks', 'The in-memory provider ignores transactions only on Linux'], a: 2, e: 'Without real row locks, concurrent updates are not serialised, so concurrency must be tested on a real database via Testcontainers.' }]
    },
    autocomplete: {
      say: 'Typeahead must answer in under 20 ms, so I do the work at write time: a batch job builds the top 10 completions per prefix into Redis sorted sets, written to a new version and switched with one pointer key. The client debounces about 250 ms and cancels stale calls, short prefixes are cached at the CDN, and if Redis fails it returns an empty list.',
      k: ['top-k per prefix', 'trie', 'Redis sorted set', 'debounce', 'edge caching', 'versioned rebuild', 'pointer switch', 'fail soft'],
      p: ['LIKE \'abc%\' on the main DB is too slow and cannot rank cheaply.', 'Normalise once (lower case, strip accents), same function in indexer and API.', 'Rebuild into ac:vN and flip ac:current so readers never see half-built data.', 'Use Azure AI Search suggesters when you need typo tolerance.'],
      f: [
        ['Why not run LIKE \'abc%\' on the database?', 'At thousands of requests per second it is too slow and cannot rank by popularity cheaply. Precompute top 10 per prefix and cache short prefixes.'],
        ['What is the cheapest request?', 'The one never sent: debounce on the client (200-300 ms) and cancel the previous call with AbortController or a new CancellationTokenSource.'],
        ['How do you rebuild the index without users seeing a mix?', 'Write the new lists under a new version prefix, then switch a single pointer key to that version in one step.'],
        ['What should autocomplete return when Redis is down?', 'A fast 200 with an empty list. Autocomplete fails soft; search itself still works.']
      ],
      q: [{ q: 'You need "most popular first" suggestions for each prefix with one fast read. What fits best?', o: ['One sorted set queried with ZRANGEBYLEX', 'A precomputed top-10 sorted set per prefix', 'A LIKE query with an index', 'A full-text scan per keystroke'], a: 1, e: 'ZRANGEBYLEX returns prefix matches in A-Z order; ranking by popularity needs a ready-sorted list per prefix.' }]
    },
    proximity: {
      say: 'Nearest ATM and nearest driver are different problems. ATMs barely move and need filters, so SQL geography with a spatial index and EF Core NetTopologySuite fits. Drivers send 50,000 updates a second, so they live in Redis GEO, sharded by city, with a heartbeat key and TTL so offline drivers disappear. The classic bug is Point(lat, lon) instead of Point(lon, lat).',
      k: ['spatial index', 'geography SRID 4326', 'NetTopologySuite', 'Redis GEOADD', 'GEOSEARCH', 'heartbeat TTL', 'geo sharding', 'lon/lat order'],
      p: ['Static places: SQL/PostGIS; moving objects: in-memory Redis GEO.', 'GEO members never expire on their own: heartbeat key + cleanup job.', 'Near a shard border, query the neighbour key too.', 'Throttle clients: send only if moved > 50 m or 4 s passed.'],
      f: [
        ['Why two different stores for ATMs and drivers?', 'ATMs rarely change and need rich filters, so a SQL spatial index fits. Drivers move every few seconds at tens of thousands of writes per second, so an in-memory Redis GEO index fits.'],
        ['How do you hide drivers who stopped reporting?', 'Write a heartbeat key with a 15 s TTL on each update, drop search results with no heartbeat, and run a cleanup job that calls GeoRemoveAsync.'],
        ['How do you catch a latitude/longitude swap in tests?', 'Use real, asymmetric coordinates (e.g. Sydney, lat -33.87, lon 151.21) so a swap gives obviously wrong results and the test fails.']
      ],
      q: [{ q: 'Which line creates a correct NetTopologySuite point for a location?', o: ['new Point(lon, lat) { SRID = 4326 }', 'new Point(lat, lon)', 'new Point(lat, lon) { SRID = 3857 }', 'new Point(lon * lat)'], a: 0, e: 'NetTopologySuite uses (x, y) = (longitude, latitude); swapping them silently returns wrong results.' }]
    },
    'file-upload': {
      say: 'Keep the bytes off your API. The API validates size and type, then returns a short write-only SAS for one blob. The client uploads 8 MiB blocks and commits the block list, so a drop costs one block. Defender for Storage scans on upload, Event Grid reports the result, and only clean files move to the clean container for processing.',
      k: ['user delegation SAS', 'block blob', 'Put Block / Put Block List', 'resumable upload', 'Defender for Storage', 'Event Grid', 'magic bytes', 'dead-letter queue'],
      p: ['SAS: one blob, Create + Write only, about 1 hour, no read or list.', 'Uncommitted blocks are kept, so resume is free; client tracks block IDs.', 'Untrusted until scanned; treat "Not scanned" as not safe.', 'Every handler idempotent: events can arrive twice.'],
      f: [
        ['How do you make a 5 GB upload resumable?', 'Upload fixed-size blocks with StageBlockAsync, save progress after each, then CommitBlockListAsync. After a drop, skip the blocks already sent.'],
        ['Why use a SAS instead of posting the file to the API?', 'The bytes go straight to storage, so app servers scale and are not tied up. Keep the SAS tight: one blob, write-only, short expiry.'],
        ['When would you choose tus (tusdotnet) instead?', 'When you want a standard resumable protocol with ready clients or non-Azure storage; the trade-off is that bytes flow through your servers.'],
        ['Why check magic bytes?', 'A renamed .exe is not a PDF; the declared content type and extension can lie.']
      ],
      q: [{ q: 'A scan event says "Not scanned". What should happen to the file?', o: ['Process it, since no threat was found', 'Move it to the clean container', 'Delete the user account', 'Keep it blocked and flag it for review or retry'], a: 3, e: 'Only "No threats found" files are safe to process; anything else stays blocked.' }]
    },
    scheduler: {
      say: 'A distributed scheduler must fire each job once per due time across several nodes and survive node failure. I use Quartz.NET with a clustered SQL job store: a DB row lock lets one node take each firing, and a dead node\'s jobs are recovered. Since that means a job can run twice, jobs are idempotent with a key of job name plus scheduled fire time, and they only enqueue work.',
      k: ['clustered job store', 'DB row lock', 'at-least-once', 'idempotency key', 'misfire policy', 'named time zone', 'DST', 'DisallowConcurrentExecution'],
      p: ['Exactly-once firing is a myth: at-least-once + idempotent jobs.', 'Same InstanceName on every node, unique instance id per node.', 'Store UTC, schedule in a named time zone, test DST gaps.', 'Scheduler fires, a queue and workers do the heavy work.'],
      f: [
        ['How do you stop two nodes running the same job?', 'A shared store decides: clustered Quartz takes a DB row lock when it acquires a trigger, so only one node fires it.'],
        ['Why must jobs still be idempotent?', 'A crashed node\'s job is recovered and may run again. A run key of job name + ScheduledFireTimeUtc in a unique index makes the effect happen once.'],
        ['When would you use a Functions timer trigger or Hangfire instead?', 'Timer triggers for a few fixed jobs; Hangfire for background jobs with a dashboard. Both give less control at 50,000 jobs.'],
        ['What DST problem should you test?', 'A local time like 2:30 am may not exist (or occur twice) on a changeover day, so define and test the misfire behaviour.']
      ],
      q: [{ q: 'Which key best makes a scheduled job idempotent across retries and recovery?', o: ['A new Guid per execution', 'The node machine name', 'Job name plus scheduled fire time', 'The current wall-clock time'], a: 2, e: 'A retried or recovered firing has the same job and scheduled fire time, so it maps to the same key and runs once.' }]
    },
    crawler: {
      say: 'A crawler is a loop of fetch, parse, enqueue around a frontier queue. At a billion pages a month, about 400 pages a second, the rules matter: obey robots.txt, rate-limit each host to about one request a second, shard the frontier by host so one worker owns each site, normalise URLs and check a Bloom filter, and recrawl with conditional GET.',
      k: ['frontier', 'robots.txt (RFC 9309)', 'politeness', 'per-host rate limit', 'Bloom filter', 'URL normalisation', 'SimHash', 'conditional GET'],
      p: ['1B pages/month = ~400 pages/s and ~100 TB raw HTML.', '10B seen URLs in ~12 GB with a Bloom filter at 1% false positives.', 'Spider traps: depth limits and per-host URL caps.', 'SHA-256 catches exact copies; SimHash near copies.'],
      f: [
        ['How do you stay polite?', 'Shard the frontier by host, check robots.txt (cached per host), and rate-limit per host with a token bucket at about 1 request/s or the site\'s Crawl-delay.'],
        ['Why a Bloom filter for seen URLs, and what is the cost?', 'It stores billions of URLs in a few GB instead of hundreds. The cost is false positives: about 1% of new URLs get wrongly skipped.'],
        ['How do recrawls stay cheap?', 'Send a conditional GET with ETag or Last-Modified; unchanged pages return 304 with no body. Adapt the recrawl interval per page.']
      ],
      q: [{ q: 'Why key the Kafka frontier topic by host?', o: ['To compress pages better', 'So one worker owns each host and can enforce politeness locally', 'To avoid needing robots.txt', 'To sort URLs alphabetically'], a: 1, e: 'All URLs for a host go to one partition and worker, so per-host rate limits stay simple and local.' }]
    },
    fraud: {
      say: 'Real-time payments cannot be pulled back, so fraud must be decided before the money moves, in under 100 ms. The inline path stays tiny: Redis velocity counters, hard rules that override, then an in-process ML.NET or ONNX model whose score bands map to approve, review, step-up or decline. Everything else runs off a stream, and on timeout we fall back to rules only.',
      k: ['inline scoring', 'velocity counters', 'hard rules', 'score bands', 'in-process model', 'rules-only fallback', 'shadow mode', 'training-serving skew'],
      p: ['Hard rules (sanctions, known mule) never reach the model.', '80 ms budget, then a rules-only decision: never block every payment.', 'Every decision audited with rule and model versions.', 'Compute features the same way offline and online.'],
      f: [
        ['How do you decide in under 100 ms?', 'Read and update Redis counters, run hard rules, then score in-process (no network hop). Publish the decision to a stream and do long-window features and cases asynchronously.'],
        ['What happens if scoring times out?', 'A resilience pipeline with an 80 ms timeout falls back to a rules-only decision, so payments keep flowing with slightly higher risk.'],
        ['How do you roll out a new model safely?', 'Run it in shadow mode: score every payment but do not act, compare with the live model, then switch.'],
        ['What is training-serving skew?', 'Features computed differently offline and online, so the model sees different numbers in production. Use the same code or definitions for both.']
      ],
      q: [{ q: 'The ML scoring call is slow during an outage. What is the best behaviour?', o: ['Fall back to a rules-only decision after the time budget', 'Decline every payment', 'Wait as long as needed for the model', 'Approve everything without checks'], a: 0, e: 'A bounded timeout plus rules-only fallback keeps payments flowing while still catching the obvious fraud.' }]
    },
    onboarding: {
      say: 'KYC onboarding is a long-running workflow: minutes for most, weeks for a few. I model it as a durable workflow (Durable Functions or Temporal): verify ID, screen and rate risk, and for medium risk wait for an analyst event racing a durable timer. Opening the account and issuing a card use saga compensations, and every step goes to an append-only audit store kept 7 years.',
      k: ['durable workflow', 'deterministic orchestrator', 'external event', 'durable timer', 'saga', 'compensation', 'append-only ledger', 'sanctions / PEP screening'],
      p: ['Not a status column and a cron job: state, timers and retries survive restarts.', 'Orchestrator code must be deterministic: no DateTime.Now, no I/O.', 'Audit store is separate from workflow history.', 'Tipping off: keep decline messages neutral.'],
      f: [
        ['How do you model a human approval that can take days?', 'The orchestrator waits for an external "ReviewDecision" event racing a durable timer; it costs nothing while waiting and expires cleanly.'],
        ['The card issue fails after the account opened. What now?', 'Run a compensation: close the account. Compensations must be idempotent, keyed by application id + step.'],
        ['Why keep audit outside the workflow history?', 'It must be tamper-evident and queryable for 7 years after the relationship ends, while workflow history can be purged.'],
        ['Why must orchestrator code be deterministic?', 'The engine replays it from history to rebuild state, so it must use the context clock and call activities for any I/O.']
      ],
      q: [{ q: 'Inside a durable orchestrator, how should you get the current time?', o: ['DateTime.Now', 'DateTime.UtcNow', 'An HTTP call to a time server', 'The orchestration context time (ctx.CurrentUtcDateTime)'], a: 3, e: 'Orchestrators are replayed, so they must be deterministic and use the context clock, not the system clock.' }]
    },
    'rag-assistant': {
      say: 'For an enterprise RAG assistant, the hard part is permissions, not the LLM. Each chunk stores its allowed group ids and every query filters by the user\'s groups from the validated token, so unauthorised text never reaches the prompt. I use hybrid search with a semantic ranker, structure-aware chunks, validated citations, and golden-set evals in CI.',
      k: ['security trimming', 'group ids per chunk', 'hybrid search', 'semantic ranker', 'citations', 'golden set', 'groundedness', 'prompt injection'],
      p: ['Trim at retrieval from the token, never in the prompt.', 'Ingestion must sync deletes and permission changes, not just new docs.', 'Treat retrieved text as data, never as instructions.', 'Say "I don\'t know" when nothing fits.'],
      f: [
        ['How do you stop the assistant leaking documents?', 'Store allowed group ids on every chunk, read the user\'s groups from the validated Entra token, and filter every search (e.g. search.in in Azure AI Search).'],
        ['Why hybrid search instead of vectors only?', 'Keywords find codes and acronyms that embeddings miss; vectors find meaning. A semantic ranker reorders the combined results.'],
        ['How do you trust citations?', 'Make the model cite numbered sources, then check in the API that each cited source was really retrieved.'],
        ['How do you prove quality over time?', 'Run a golden Q&A set as tests in CI with groundedness and relevance scores, and fail the PR if scores drop; add online thumbs feedback.']
      ],
      q: [{ q: 'Where should permission filtering happen in an enterprise RAG system?', o: ['In the system prompt', 'After the model answers', 'In the search query, from the validated user token', 'In the browser'], a: 2, e: 'Filtering at retrieval means unauthorised text never reaches the model, so it cannot leak it.' }]
    }
  }
};
