/* Quick-revision data for 04-distributed-systems.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['04'] = {
  approach: [
    ['Name the failure model', 'Partial failure, partitions, slow-looks-dead: a timeout means "I don\'t know".'],
    ['Decide who writes', 'Single-leader by default; multi-leader or leaderless only with a conflict plan.'],
    ['Choose the consistency knobs', 'Sync vs async replication, quorum R + W > N, read-your-writes for fresh reads.'],
    ['Borrow coordination', 'Leader election and locks from etcd, ZooKeeper, Kubernetes leases or Blob leases; never build consensus.'],
    ['Make writes safe to retry', 'Idempotency keys, unique constraints, conditional updates, fencing tokens.'],
    ['Handle cross-service transactions', 'Saga + transactional outbox instead of 2PC; TCC for reservations.'],
    ['Order events correctly', 'Single sequencer, version numbers or logical clocks, not wall-clock timestamps.']
  ],
  traps: [
    'Treating a timeout as a failure and retrying a non-idempotent write.',
    'Relying on a Redis lock for correctness without a fencing token.',
    'Proposing 2PC across microservices.',
    'Ordering cross-machine events by wall-clock time, or using last-write-wins for balances.',
    'Choosing an even number of consensus nodes.'
  ],
  sections: {
    fallacies: {
      say: 'Distributed systems are hard because of partial failure: some parts fail while others run, and you often cannot tell which. The eight fallacies, such as "the network is reliable" and "latency is zero", are false assumptions. A timeout means "I don\'t know", so every remote write must be safe to retry.',
      k: ['8 fallacies', 'partial failure', 'network partition', 'two generals problem', 'timeout', 'idempotency', 'failure detection'],
      p: ['A slow node (GC pause, busy disk) looks exactly like a dead one.', 'Partition: both sides alive, each may think the other is dead.', 'More services in a path = availabilities multiply down.', 'Give every remote call a deadline (CancellationToken) and pass it down.'],
      f: [['Name four of the eight fallacies of distributed computing.', 'The network is reliable, latency is zero, bandwidth is infinite, the network is secure. Others: topology doesn\'t change, one administrator, transport cost is zero, the network is homogeneous.'],
          ['What does the two generals problem teach?', 'Over an unreliable network no finite number of messages guarantees agreement, so you build good-enough protocols with retries and idempotency.'],
          ['Your call to a payment service times out. What do you know?', 'Nothing certain: it may have failed, succeeded, or still be running. Retry only with an idempotency key, or check status first.']],
      q: [{ q: 'A remote write times out. What is the correct interpretation?', o: ['The write definitely failed', 'The write definitely succeeded', 'The outcome is unknown', 'The network is partitioned'], a: 2, e: 'A timeout only means no reply arrived in time; the work may or may not have happened.' }]
    },
    replication: {
      say: 'Replication keeps copies on several nodes for availability, durability and read scale. Single-leader is simple with no write conflicts; multi-leader gives local writes per region but needs conflict resolution; leaderless writes to many replicas and relies on quorums. Synchronous replication means no loss but slower writes; asynchronous is fast but can lose recent writes and serve stale reads.',
      k: ['single-leader', 'multi-leader', 'leaderless', 'sync vs async', 'semi-sync', 'replication lag', 'read-your-writes', 'monotonic reads'],
      p: ['Single-leader is the default.', 'Async replication: RPO > 0 and stale reads; say so in the design.', 'Fresh reads (balance after payment) go to the primary; reports to replicas.', 'Semi-sync: wait for one follower, rest async.'],
      f: [['A user updates their address and refreshes, but sees the old one. Why and how to fix?', 'The read hit a lagging async follower. Fix with read-your-writes: read from the leader for a short time after a write, or use session tokens.'],
          ['What is a monotonic reads anomaly?', 'You see new data, refresh, then see older data because the reads hit two different followers. Fix by pinning a user to one replica.'],
          ['When would you pick multi-leader replication?', 'When you need local writes in several regions and can survive region loss, and you have a conflict plan: last-write-wins, merge or CRDTs.']],
      q: [{ q: 'Which replication model avoids write conflicts entirely?', o: ['Multi-leader', 'Leaderless', 'Single-leader', 'Sloppy quorum'], a: 2, e: 'Only one node accepts writes, so there is a single order of writes and nothing to merge.' }]
    },
    quorum: {
      say: 'With N replicas, a write must be confirmed by W and a read asks R. If R plus W is greater than N, every read overlaps at least one replica with the latest write. N=3, W=2, R=2 is the balanced default and tolerates one node down. Quorums alone are not full linearizability.',
      k: ['replication factor (N)', 'write quorum (W)', 'read quorum (R)', 'R + W > N', 'LOCAL_QUORUM', 'sloppy quorum', 'hinted handoff', 'read repair'],
      p: ['3/3/1: fast reads, writes fail if any node is down.', '3/1/1: fastest, eventually consistent.', 'Use odd N (3, 5).', 'Cosmos DB has no N/W/R knobs: you pick a consistency level.'],
      f: [['Does R + W > N guarantee strong consistency?', 'It makes read and write sets overlap, so a read normally sees the latest acknowledged write. Sloppy quorums, concurrent writes and half-failed writes can still cause anomalies.'],
          ['What is a sloppy quorum with hinted handoff?', 'When home replicas are down, a stand-in node accepts the write and keeps a hint, handing the data back when the home replica returns. During that window fresh reads are not guaranteed.']],
      q: [{ q: 'N = 3. Which setting gives fast writes but makes reads fail if any node is down?', o: ['W = 2, R = 2', 'W = 3, R = 1', 'W = 1, R = 1', 'W = 1, R = 3'], a: 3, e: 'W = 1 makes writes fast; R = 3 needs every replica to answer, so one node down fails reads.' }]
    },
    consensus: {
      say: 'Consensus gets a group of nodes to agree on one value or one ordered log, as long as a majority is up. Raft elects a leader per term using randomised timeouts and votes, replicates the log, and commits an entry once a majority stores it. 2f plus 1 nodes survive f failures. Never build your own: borrow etcd, ZooKeeper or a lease.',
      k: ['Raft', 'Paxos', 'term', 'leader election', 'log replication', 'majority (2f + 1)', 'split brain', 'fencing token'],
      p: ['3 nodes survive 1, 5 survive 2; 4 still survives only 1.', 'A higher term always wins; an old leader steps down.', 'Majority lost = writes stop: the CP choice by design.', 'Kafka 4.0 removed ZooKeeper (KRaft); etcd holds Kubernetes state.'],
      f: [['How many nodes should a consensus cluster have?', 'An odd number, usually 3 or 5. 2f + 1 nodes survive f failures; a 4th node adds cost without extra fault tolerance.'],
          ['How does a Raft election work?', 'A follower that misses heartbeats for a randomised timeout becomes a candidate, bumps the term and asks for votes. A majority of votes makes it leader for that term.'],
          ['What is split brain and how is it prevented?', 'Two nodes both think they are leader and accept writes. Requiring a majority to lead means only one side can win; use odd counts or a witness, plus fencing tokens.']],
      q: [{ q: 'When is a Raft log entry committed?', o: ['When a majority of nodes have stored it', 'When the leader writes it locally', 'When every node has stored it', 'When the client acknowledges it'], a: 0, e: 'Majority storage means any future leader (which needs a majority vote) will have the entry.' }]
    },
    locks: {
      say: 'A distributed lock lets only one worker across machines do something at a time, but it is really a lease with a TTL. A holder that pauses past the TTL becomes a zombie and two writers run. Fencing tokens let storage reject stale holders. For efficiency, Redis is fine; for correctness, use fencing or, better, idempotency.',
      k: ['lease / TTL', 'zombie holder', 'fencing token', 'SET NX PX', 'Redlock', 'Blob lease', 'advisory lock', 'efficiency vs correctness'],
      p: ['Ask: what happens if two workers run at once?', 'lock / SemaphoreSlim only work inside one process.', 'Prefer unique constraints, conditional updates, one consumer per key.', 'Redlock relies on timing assumptions and has no fencing token.'],
      f: [['Is a Redis SET NX lock safe?', 'For efficiency, yes, with a TTL and a release that checks the value. For correctness, no: a paused holder can outlive its lease. Add a fencing token checked by storage, or make the operation idempotent.'],
          ['How does a fencing token work?', 'The lock service hands out a number that increases with every grant. Storage rejects any write carrying a lower number than it has already seen.'],
          ['Name three ways to avoid needing a lock.', 'A unique constraint on a business key, a conditional update with rowversion or ETag, and one consumer per key such as Service Bus sessions or Kafka partitions.']],
      q: [{ q: 'Worker 1 holds a lease, freezes in a GC pause, the lease expires and Worker 2 takes it. What stops Worker 1 corrupting data when it wakes?', o: ['A longer TTL', 'A fencing token checked by the storage', 'Using Redlock', 'An in-process SemaphoreSlim'], a: 1, e: 'Storage rejects Worker 1\'s older token. Longer TTLs only shrink the window; SemaphoreSlim is per process.' }]
    },
    'two-pc': {
      say: 'Two-phase commit makes several databases commit or roll back together: prepare, then commit. It is atomic but blocking: if the coordinator dies, participants wait with rows locked. Microservices use a saga instead, local transactions with compensating actions, plus the transactional outbox. TCC adds an explicit reservation step.',
      k: ['2PC', 'prepare / commit', 'coordinator', 'XA / MSDTC', 'saga', 'compensating action', 'TCC', 'transactional outbox'],
      p: ['2PC is CP and blocks; sagas are eventually consistent.', 'Brokers, NoSQL and HTTP APIs usually do not support XA.', 'Design intermediate states ("pending") into a saga.', 'MSDTC escalation is Windows-only; does not work in Linux containers.'],
      f: [['Why not use 2PC across microservices?', 'It blocks when the coordinator fails, holds locks across services, needs every participant to support XA, and lowers availability. Use a saga with compensations plus the outbox.'],
          ['What is TCC, with a banking example?', 'Try-Confirm-Cancel: Try reserves, Confirm uses the reservation, Cancel releases it. Card payments: authorise (hold funds), then capture or void.'],
          ['What does the outbox add to a saga?', 'It writes the DB change and the outgoing event in one local transaction, so a step never commits without publishing its event.']],
      q: [{ q: 'In 2PC, a participant voted yes and the coordinator crashed. What happens?', o: ['It commits on its own', 'It aborts after a timeout safely', 'It waits with its locks held', 'It runs a compensating action'], a: 2, e: 'After voting yes it cannot decide alone, so it blocks with rows locked until the coordinator returns.' },
          { q: 'An account-opening flow spans KYC, core banking and card issuing services. Which approach fits?', o: ['XA two-phase commit', 'A single distributed lock', 'Last-write-wins replication', 'A saga with compensating steps'], a: 3, e: 'Long-running flows across services use sagas: local transactions plus undo steps on failure.' }]
    },
    clocks: {
      say: 'Every machine\'s clock is slightly wrong and can jump, so wall-clock timestamps cannot reliably order events across machines. Logical clocks order by cause and effect: Lamport timestamps give a causal total order, vector clocks also detect concurrent updates, and hybrid logical clocks stay close to real time. Use a monotonic clock for durations.',
      k: ['clock skew', 'NTP', 'monotonic clock', 'last-write-wins', 'Lamport timestamp', 'vector clock', 'hybrid logical clock', 'CRDT'],
      p: ['LWW with a fast clock silently drops the newer update.', 'Lamport: on receive, max(local, received) + 1; cannot detect concurrency.', 'Durations: Stopwatch / TimeProvider, never DateTime.Now.', 'CRDTs suit counters, carts, presence; not balances that must stay >= 0.'],
      f: [['Why can\'t you order events from different servers by timestamp?', 'Clocks skew and can jump backwards, so a later event can get an earlier timestamp. Use a single sequencer, version numbers or logical clocks.'],
          ['Lamport vs vector clocks?', 'Lamport gives one counter and a total order consistent with causality, but cannot tell if two events were concurrent. Vector clocks keep a counter per node and can detect true conflicts, at the cost of size.'],
          ['What is a CRDT?', 'A data type any replica can update that always merges to the same result in any order, such as a G-Counter or OR-Set.']],
      q: [{ q: 'Which mechanism can tell that two updates were concurrent rather than one happening before the other?', o: ['Vector clocks', 'Lamport timestamps', 'Wall-clock UTC', 'Monotonic Stopwatch'], a: 0, e: 'Comparing vectors shows happened-before or concurrent; Lamport timestamps impose an order but cannot detect concurrency.' }]
    }
  }
};
