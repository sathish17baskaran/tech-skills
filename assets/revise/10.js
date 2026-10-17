/* Quick-revision data for 10-integration-messaging.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['10'] = {
  approach: [
    ['Ask how fresh and how big', 'Who is waiting, must others react soon, or is it fine by tomorrow? Real-time, near-real-time or batch.'],
    ['Pick the style', 'Sync API, queue (command), pub/sub (event) or stream (replayable log); avoid shared databases.'],
    ['State the delivery guarantee', 'At-least-once by default, idempotent consumers, ordering per key, DLQ for poison messages.'],
    ['Never lose an event', 'Transactional outbox or CDC, not "write DB then publish".'],
    ['Plan for overload', 'Bounded queues, 429/503 + Retry-After, pull-based consumers, autoscale on lag.'],
    ['Choose orchestration or choreography', 'Orchestrate complex flows with compensation; choreograph simple, autonomous ones.'],
    ['Close with tech and metrics', 'Service Bus vs Event Hubs vs Kafka; consumer lag, oldest-message age, DLQ count.']
  ],
  traps: [
    'Claiming exactly-once delivery end to end without idempotent consumers.',
    'Writing to the database and then publishing as two separate steps.',
    'Asking for global ordering when per-key ordering is enough.',
    'Using an unbounded queue and calling it back-pressure.',
    'Making everything real-time when batch or events would do.'
  ],
  sections: {
    types: {
      say: 'Pick the integration type by freshness and volume. Real-time is a sync API where a user waits, in milliseconds. Near-real-time uses events, CDC or streaming in seconds to minutes. Batch moves millions of records on a schedule. Real-time is the most expensive and tightly coupled, so most flows are hybrid.',
      k: ['real-time', 'near-real-time', 'batch', 'CDC', 'micro-batch', 'coupling', 'reconciliation', 'checkpoint'],
      p: ['Ask: what decision needs this data, and how fast?', 'Micro-batch every 1-5 minutes is a practical middle ground.', 'Hybrid: API for the user, event downstream, batch reconcile at end of day.', 'Failure: real-time fails fast; near-RT retries and DLQs; batch restarts from checkpoint.'],
      f: [['Name a banking example of each integration type.', 'Real-time: payment authorisation or balance enquiry. Near-real-time: transaction notifications or fraud scoring. Batch: statements, GL posting and regulatory reports.'],
          ['Why not make everything real-time?', 'It is the most expensive and most tightly coupled option, because both sides must be up. Many consumers only need data in seconds, minutes or by tomorrow.']],
      q: [{ q: 'The CRM must reflect a new customer address within a minute, but no user is waiting. Which type fits best?', o: ['Synchronous real-time API from the core', 'Near-real-time event or CDC', 'Nightly batch file', 'Shared database'], a: 1, e: 'Seconds-to-minutes freshness without a waiting user is the near-real-time sweet spot, with loose coupling via a broker.' }]
    },
    styles: {
      say: 'Hohpe and Woolf name four styles: file transfer, shared database, RPC and messaging; avoid shared databases because of tight coupling. At enterprise scale, point-to-point becomes spaghetti, hub-and-spoke or ESB centralises but can bottleneck, API-led connectivity layers system, process and experience APIs, and event-driven is the most decoupled.',
      k: ['file transfer', 'shared database', 'RPC', 'messaging', 'point-to-point', 'hub-and-spoke / ESB', 'API-led connectivity', 'iPaaS'],
      p: ['Point-to-point: up to n(n-1)/2 links.', 'API-led: System APIs, Process APIs, Experience APIs, built for reuse.', 'ESB can become a bottleneck and a monolith.', 'Azure Integration Services = Logic Apps + APIM + Service Bus + Event Grid + Functions.'],
      f: [['Explain API-led connectivity.', 'Three layers: System APIs unlock core systems, Process APIs hold business logic such as Make Payment, and Experience APIs shape data per channel. Lower layers are reused by many channels.'],
          ['Why avoid a shared database for integration?', 'It tightly couples systems to one schema, so any change can break others and no team owns the contract.']],
      q: [{ q: '12 systems are each wired directly to every other. How many links can that need?', o: ['12', '24', '66', '144'], a: 2, e: 'Point-to-point needs up to n(n-1)/2 links: 12 x 11 / 2 = 66.' }]
    },
    'queue-event': {
      say: 'A queue delivers each message, usually a command, to one consumer and gives load levelling. Pub/sub broadcasts an event, a past fact, to every subscriber, so producers do not know their consumers. Event streaming like Kafka keeps an append-only, partitioned log that consumer groups can replay. Events are eventually consistent and harder to debug.',
      k: ['command vs event', 'competing consumers', 'topic / subscription', 'event streaming', 'partition key', 'consumer group / offset', 'event-carried state', 'schema registry'],
      p: ['Queue: message removed after one consumer handles it.', 'Stream: kept until retention expires; ordering per partition.', 'Thin event = call back; fat event = carries the data.', 'Invest in correlation IDs and tracing.'],
      f: [['Command vs event?', 'A command such as CreateAccount tells one handler to act and can be rejected. An event such as AccountCreated is a past fact broadcast to anyone, and cannot be rejected.'],
          ['Service Bus or Event Hubs?', 'Service Bus for enterprise messaging: commands, transactions, sessions, DLQ and ordered workflows. Event Hubs for high-throughput event streaming and telemetry with replay.'],
          ['Event notification vs event-carried state transfer?', 'A thin notification says "id 42 changed, call back for details". A fat event carries all the data so consumers need no callback, at the cost of bigger payloads and schema coupling.']],
      q: [{ q: 'A new analytics team wants to reprocess the last 7 days of payment events. Which technology supports this best?', o: ['Service Bus queue', 'Event streaming such as Kafka or Event Hubs', 'In-process Channel<T>', 'Webhooks'], a: 1, e: 'Streams retain events until retention expires and each consumer group tracks its own offset, so it can replay.' }]
    },
    guarantees: {
      say: 'There are three delivery guarantees: at-most-once may lose messages, at-least-once retries so it may duplicate, and exactly-once is hard end to end. At-least-once with idempotent consumers is the default, giving effectively once. Order per key, not globally, and move poison messages to a dead-letter queue after N deliveries.',
      k: ['at-most-once', 'at-least-once', 'effectively once', 'idempotent consumer', 'per-key ordering / sessions', 'dead-letter queue', 'poison message', 'peek-lock'],
      p: ['Ack only after the DB commit.', 'Broker dedup only works within its time window.', 'Kafka exactly-once covers only read-process-write inside Kafka.', 'ReceiveAndDelete = at-most-once; PeekLock = at-least-once.'],
      f: [['How do you handle duplicates with at-least-once delivery?', 'Make consumers idempotent: dedupe by message ID or business key, use upserts and version checks, ideally with a processed-messages table in the same transaction.'],
          ['What is a poison message and what do you do with it?', 'A message that always fails. Detect it by delivery count and move it to the DLQ so it does not block the queue, then investigate and replay.'],
          ['How do you keep payments for one account in order without killing throughput?', 'Order per key: use the account ID as the Kafka partition key or Service Bus SessionId, so different accounts process in parallel.']],
      q: [{ q: 'In practice, how do teams achieve "exactly-once" processing with an external database?', o: ['Use ReceiveAndDelete mode', 'At-least-once delivery plus an idempotent consumer', 'Turn on broker duplicate detection only', 'Use a single consumer'], a: 1, e: 'Effectively once = at-least-once (no loss) plus idempotent handling (duplicates have no extra effect).' },
          { q: 'Where should CompleteMessageAsync be called in a peek-lock Service Bus consumer?', o: ['Before processing starts', 'After the database transaction commits', 'Never; the broker completes it automatically', 'Only when the message is dead-lettered'], a: 1, e: 'Completing only after the commit means a crash causes redelivery, not loss.' }]
    },
    backpressure: {
      say: 'Back-pressure is when a consumer that cannot keep up pushes back on the producer, so work slows or is shed on purpose instead of piling up. Use bounded buffers with a when-full rule, throttle with 429 or 503 and Retry-After, let consumers pull, and autoscale on consumer lag. Never drop payments.',
      k: ['bounded queue', 'when-full rule', '429 vs 503', 'Retry-After', 'pull / prefetch', 'credit-based flow', 'consumer lag', 'KEDA'],
      p: ['Unbounded queues fail later and bigger.', 'Alert on age of the oldest message, not just count.', 'Drop or sample telemetry; block or reject payments.', '202 Accepted while the queue explodes only moves the problem.'],
      f: [['Why is an unbounded queue dangerous?', 'It hides overload: it grows until memory or storage runs out and latency climbs silently. A bound turns a hidden late failure into an early visible signal.'],
          ['429 vs 503?', '429 Too Many Requests means this caller is over its limit. 503 Service Unavailable means the server is overloaded. Both can carry Retry-After.'],
          ['How do you apply back-pressure inside one .NET process?', 'Use Channel.CreateBounded with FullMode Wait so WriteAsync waits for room; Drop modes shed load instead. It is in memory, so durable work belongs in a broker.']],
      q: [{ q: 'Which signal is best for alerting and autoscaling a queue consumer?', o: ['CPU of the producer', 'Age of the oldest message (consumer lag)', 'Total messages ever sent', 'Number of topics'], a: 1, e: 'Lag and oldest-message age show how far behind consumers are, which is what users feel.' }]
    },
    eip: {
      say: 'Enterprise Integration Patterns give a shared vocabulary: competing consumers, request-reply, content-based router, splitter and aggregator, scatter-gather, canonical model, claim check and idempotent receiver. The star is the transactional outbox: write business data and an outbox row in one transaction, and a relay publishes it, so no lost or phantom events.',
      k: ['transactional outbox', 'competing consumers', 'request-reply / correlation ID', 'content-based router', 'scatter-gather', 'claim check', 'canonical model', 'idempotent receiver'],
      p: ['Outbox relay can send twice; reuse the outbox id as MessageId.', 'Claim check: payload in blob storage, reference in the message.', 'Canonical model avoids N-squared mappings.', 'Never "write DB, then publish" as two steps.'],
      f: [['How do you guarantee an event is published when the DB commits?', 'Transactional outbox, or CDC on the outbox table: save the business row and outbox row in one transaction, then a relay publishes. Never write then publish separately.'],
          ['When do you use the claim check pattern?', 'When the payload is too big for the broker: upload it to blob storage and send only the reference or a short-lived SAS URL.'],
          ['What is scatter-gather?', 'Send a request to many recipients, such as FX quote providers, collect the replies and pick the best.']],
      q: [{ q: 'A service saves an order and then publishes OrderCreated; sometimes the publish fails after the commit. Which pattern fixes this?', o: ['Claim check', 'Transactional outbox', 'Content-based router', 'Priority queue'], a: 1, e: 'The outbox row commits atomically with the order, and a relay publishes it later, so the event cannot be lost.' }]
    },
    orch: {
      say: 'Orchestration has a central conductor, such as Durable Functions or Temporal, that tells each service what to do; it is easy to see and debug and suits complex flows with compensation and human steps. Choreography lets services react to each other\'s events, giving autonomy and loose coupling but a harder-to-see end-to-end flow.',
      k: ['orchestrator', 'choreography', 'Durable Functions', 'Temporal', 'compensation', 'deterministic orchestrator', 'checkpointing'],
      p: ['Orchestration: complex flows, SLAs, human approval.', 'Choreography: simple flows, many listeners, high autonomy.', 'Orchestrator code must be deterministic: no DateTime.UtcNow or I/O.', 'State is checkpointed after every await.'],
      f: [['When would you choose orchestration over choreography?', 'For complex multi-step flows that need compensation, SLAs, timers or human steps, where you must see the state of each instance. Choreography suits simple flows with many independent listeners.'],
          ['Why must Durable Functions orchestrator code be deterministic?', 'The orchestrator is replayed from history after each checkpoint, so it must make the same decisions; use context.CurrentUtcDateTime and do I/O in activities.']],
      q: [{ q: 'A loan approval flow has 8 steps, a human approval and compensation if a step fails. Which approach fits?', o: ['Choreography via topics', 'Orchestration with a workflow engine', 'Shared database', 'Nightly batch'], a: 1, e: 'Complex flows with human steps and compensation need the visibility and explicit control of an orchestrator.' }]
    },
    batch: {
      say: 'Reliable batch and file integration means secure transfer over SFTP or MFT with PGP, validation with checksums and control totals, chunked loads with checkpoints so reruns are safe, then reconciliation and reporting. Never read half-written files: use a temp-then-rename convention or a done marker.',
      k: ['SFTP / MFT', 'PGP', 'control totals', 'checksum', '.done marker', 'checkpoints', 'idempotent rerun', 'reconciliation'],
      p: ['Control totals: record count and sum of amounts in trailer or control file.', 'Process in chunks with a checkpoint table.', 'Archive after processing so a file is never processed twice.', 'Schedulers track dependencies and SLAs (Control-M, ADF, cron).'],
      f: [['How do you avoid processing a half-written file?', 'The sender writes to a .tmp name and renames when done, or drops a .done marker file; only pick up files that are complete.'],
          ['How do you make a batch job safe to rerun?', 'Process in chunks with checkpoints, make loads idempotent (upserts or keyed inserts), and archive or mark files once processed.']],
      q: [{ q: 'How do you prove a received file is complete and correct before loading?', o: ['Check the file name', 'Verify the checksum and control totals (record count and amount sum)', 'Load it and look for errors', 'Compare the file size with yesterday'], a: 1, e: 'Checksums detect corruption and control totals confirm every record and the total value arrived.' }]
    },
    kafka: {
      say: 'Kafka is a replayable, partitioned log. Producers write keyed events to topics; the key picks the partition, so order holds per key. Each consumer group splits partitions between its members and commits offsets. Process then commit gives at-least-once, so consumers are idempotent; transactions give exactly-once only inside Kafka. Add a schema registry and a dead-letter topic, and watch consumer lag.',
      k: ['topic / partition', 'message key', 'consumer group', 'rebalance', 'offset commit', 'idempotent producer', 'log compaction', 'schema registry'],
      p: ['Order is per partition only: key by account ID.', 'Consumers beyond the partition count sit idle.', 'Retention keeps a time window; compaction keeps the latest value per key.', 'No built-in DLQ: park poison events in a dead-letter topic.'],
      f: [['How do you get ordering in Kafka?', 'Give related events the same key (e.g. account ID) so they go to one partition, which one consumer in the group reads in order. There is no global order across partitions.'],
          ['What delivery do you get by default, and how do you get exactly-once?', 'Process then commit gives at-least-once, so consumers must be idempotent. Exactly-once needs the idempotent producer, transactions, SendOffsetsToTransaction and read_committed consumers, and covers Kafka-to-Kafka only.'],
          ['Retention vs log compaction?', 'Retention deletes events after a time or size limit, giving a replay window. Compaction keeps the latest value per key, with tombstones for deletes, to hold current state.'],
          ['Kafka or a queue?', 'Kafka when many consumers need the same events, replay or high ordered throughput (CDC, analytics). A queue for one-worker tasks with built-in per-message ack, retry, DLQ and delays.']],
      q: [{ q: 'A topic has 6 partitions. You scale the consumer group from 6 to 10 instances. What happens?', o: ['Throughput rises by two thirds', '4 consumers sit idle', 'Kafka adds 4 partitions automatically', 'Messages are shared round-robin across all 10'], a: 1, e: 'Each partition is read by one consumer in a group, so parallelism is capped at the partition count.' },
          { q: 'One malformed event makes your consumer throw every time, and the partition stops moving. What is the usual fix?', o: ['Restart the consumer', 'Turn on auto-commit', 'Retry a few times, publish it to a dead-letter topic, then commit and move on', 'Delete the topic'], a: 2, e: 'Kafka has no built-in DLQ, so you park the poison event in a dead-letter topic to unblock the partition and replay it later.' }]
    }
  }
};
