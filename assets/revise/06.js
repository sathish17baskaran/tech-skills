/* Quick-revision data for 06-databases-data.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['06'] = {
  approach: [
    ['Clarify the data and access pattern', 'Entities and relationships, read/write ratio, query shapes, volume and growth, consistency needs.'],
    ['Pick the store', 'Relational by default; key-value, document, wide-column, graph, search or vector when the access pattern says so.'],
    ['Design keys and indexes', 'Time-ordered IDs, composite and covering indexes, a shard or partition key that matches the main query.'],
    ['Climb the scaling ladder', 'Queries and indexes, bigger box + pooling, cache, read replicas, federation, partitioning, then sharding.'],
    ['Protect the data', 'Backups to meet RPO/RTO, PITR, 3-2-1-1-0, tested restores, encryption with separate keys.'],
    ['Move data safely', 'CDC or outbox to feed search, caches and the lake; expand-migrate-contract for schema changes.'],
    ['Close with .NET specifics', 'EF Core indexes and rowversion, Guid.CreateVersion7(), SqlBulkCopy, change feed processor.']
  ],
  traps: [
    'Sharding on day one instead of fixing queries, caching and adding replicas first.',
    'Using random UUID v4 as a clustered key.',
    'Using LIKE \'%x%\' for product search.',
    'Claiming backups work without a tested restore.',
    'Dual writes to two systems instead of CDC or an outbox.'
  ],
  sections: {
    'sql-nosql': {
      say: 'SQL databases use tables, a fixed schema, joins and strong transactions, modelled around entities. NoSQL stores, key-value, document, wide-column and graph, offer flexible models built for scale and specific access patterns, modelled queries first. Default to relational unless scale, schema flexibility or the access pattern clearly says otherwise.',
      k: ['relational', 'key-value', 'document', 'wide-column', 'graph', 'access patterns', 'normalisation', 'vector search'],
      p: ['NoSQL: model around queries. SQL: normalise around entities.', 'Graph for relationships and fraud rings; wide-column for massive time-ordered writes.', 'SQL Server 2025 / Azure SQL and pgvector do vector search without a separate DB.'],
      f: [['When would you choose a document database over SQL?', 'When data is naturally a JSON aggregate read and written as a whole, such as a catalogue or profile, the schema varies, and you need easy horizontal scale.'],
          ['Which store fits detecting fraud rings?', 'A graph database such as Neo4j, because the question is about relationships between accounts, devices and people.']],
      q: [{ q: 'A system ingests billions of time-ordered sensor writes per day. Which model fits best?', o: ['Graph', 'Relational with many joins', 'Key-value session store', 'Wide-column'], a: 3, e: 'Wide-column stores like Cassandra are built for massive writes and time-ordered data.' }]
    },
    acid: {
      say: 'ACID means atomicity, all or nothing; consistency, constraints hold; isolation, concurrent transactions do not interfere; and durability, committed data survives a crash. Many NoSQL stores are BASE: basically available, soft state, eventually consistent. Higher isolation levels are more correct but lock more; snapshot isolation is a popular middle ground.',
      k: ['ACID', 'BASE', 'read committed', 'repeatable read', 'serializable', 'snapshot (MVCC)', 'phantom read', 'optimistic concurrency'],
      p: ['Read committed (common default) prevents dirty reads only.', 'Serializable prevents dirty, non-repeatable and phantom reads.', 'One EF Core SaveChanges runs in one transaction.', 'rowversion / [Timestamp] throws on a lost update.'],
      f: [['What anomaly does serializable prevent that repeatable read does not?', 'Phantom reads: new rows appearing in a repeated range query.'],
          ['How do you stop lost updates without heavy locking?', 'Optimistic concurrency: a rowversion column in the WHERE clause; a stale update affects no rows and EF Core throws DbUpdateConcurrencyException.']],
      q: [{ q: 'Which isolation level is the common default and prevents only dirty reads?', o: ['Read committed', 'Read uncommitted', 'Repeatable read', 'Serializable'], a: 0, e: 'Read committed stops reading uncommitted data but still allows non-repeatable and phantom reads.' }]
    },
    indexing: {
      say: 'An index finds rows without scanning the table, like a book index: reads get faster, writes slower. B-tree is the default for equality, ranges and sorting. A composite index follows the leftmost-prefix rule, and a covering index holds every column a query needs. Index WHERE, JOIN and ORDER BY columns and check the plan.',
      k: ['B-tree', 'clustered', 'non-clustered', 'composite index', 'leftmost prefix', 'covering index', 'filtered index', 'execution plan'],
      p: ['One clustered index per table: the table is sorted by it.', '(customer_id, created_at) helps customer_id filters, not created_at alone.', 'Too many indexes slow inserts and updates.', 'Unique index = last line of defence for idempotency keys.'],
      f: [['You have an index on (CustomerId, CreatedAt). Does a filter on CreatedAt alone use it efficiently?', 'No. The leftmost-prefix rule means it helps filters starting with CustomerId, not CreatedAt alone.'],
          ['What is a covering index?', 'An index that includes every column the query needs, so the engine never touches the table. In EF Core use IncludeProperties.'],
          ['How do you cut Cosmos DB write cost from indexing?', 'Cosmos indexes every property by default; exclude paths you never query in the container IndexingPolicy.']],
      q: [{ q: 'Which index type supports equality only, not range queries?', o: ['B-tree', 'Hash', 'Clustered', 'Covering'], a: 1, e: 'Hash indexes map exact keys to buckets, so they cannot serve ranges or sorting.' }]
    },
    ids: {
      say: 'IDs should be unique everywhere, ideally time-sortable and index-friendly, created without a central bottleneck. Auto-increment is simple but single-writer and guessable. UUID v4 is random and fragments indexes. UUID v7 and Snowflake IDs put a timestamp first, so they sort by time and append to the end of the index.',
      k: ['auto-increment', 'UUID v4', 'UUID v7', 'ULID', 'Snowflake ID', 'Hi/Lo', 'page splits', 'clustered key'],
      p: ['Snowflake: 41-bit timestamp, 10-bit machine, 12-bit sequence in a BIGINT.', 'Guid.CreateVersion7() since .NET 9; but SQL Server sorts GUIDs by last bytes.', 'Good clustered key: narrow, unique, never changes, always increases.', 'Expose an opaque public ID if counts or order are sensitive.'],
      f: [['UUID v4 or v7 for a primary key?', 'UUID v7: both can be created anywhere, but v7 starts with a millisecond timestamp, so new keys append to the end of the index instead of random pages.'],
          ['What is in a Snowflake ID?', '64 bits: a sign bit, a 41-bit millisecond timestamp, a 10-bit machine ID and a 12-bit sequence: 1,024 nodes, 4,096 IDs per ms each.'],
          ['Why not show auto-increment IDs in public URLs?', 'They leak business volumes and let anyone guess other records. Use an opaque ID and always check authorisation.']],
      q: [{ q: 'Why is a random UUID v4 a poor clustered key?', o: ['It is too short', 'It cannot be created in the app', 'It needs a central counter', 'Inserts land on random pages, causing page splits and fragmentation'], a: 3, e: 'Random keys scatter inserts across the index; time-ordered keys append at the end.' }]
    },
    search: {
      say: 'A search engine builds an inverted index, term to documents, so it finds and ranks text in milliseconds. Analysers lowercase, tokenise and stem; BM25 scores relevance; fuzzy matching handles typos; facets count categories. Keep the database as the source of truth and feed the index through CDC or events, about a second behind.',
      k: ['inverted index', 'analyser', 'stemming', 'BM25', 'fuzzy matching', 'facets', 'near real time', 'hybrid search'],
      p: ['LIKE \'%x%\' cannot use a B-tree, scans every row, and cannot rank.', 'Use the same analyser at index and query time.', 'The index is a rebuildable read model, never the source of truth.', 'Elasticsearch/OpenSearch refresh every 1 s by default.'],
      f: [['How would you add product search to a SQL-backed app?', 'Keep SQL as the source of truth, push changes via CDC or outbox events into Azure AI Search or Elasticsearch, and query that for ranked, fuzzy, faceted results about a second behind.'],
          ['What does BM25 improve over TF-IDF?', 'Repeated terms give diminishing returns, and long documents do not win just by being long.']],
      q: [{ q: 'A user searches "payments" but the document says "payment". What makes it match?', o: ['Stemming in the analyser', 'A B-tree index', 'A covering index', 'BM25 scoring'], a: 0, e: 'Stemming reduces word forms to a common root at both index and query time.' }]
    },
    geo: {
      say: 'A spatial index turns 2D locations into something searchable, so "nearest ATMs within 1 km" does not scan every row. Geohash interleaves latitude and longitude into a prefix string; quadtrees and R-trees adapt to density; S2 and H3 cover the globe in cells. Coarse filter with the index, then exact distance on the candidates.',
      k: ['geohash', 'quadtree', 'R-tree', 'S2 / H3', 'ST_DWithin', 'geography type', 'SRID 4326', 'GEOSEARCH'],
      p: ['Geohash edge problem: always include the 8 neighbouring cells.', 'Use geography (round earth, metres) for real distances.', 'GeoJSON, NetTopologySuite and Redis take longitude first.', 'H3 hexagons: neighbours are equidistant, good for aggregation.'],
      f: [['Design "find the nearest 5 ATMs".', 'Store locations with a spatial index (PostGIS, SQL geography, Redis GEO or geohash). Filter your cell plus 8 neighbours or use ST_DWithin, compute exact distances, sort, take 5, and cache per cell.'],
          ['Why include neighbouring geohash cells?', 'Two points can be close yet sit either side of a cell edge with different prefixes.']],
      q: [{ q: 'Which structure groups shapes into bounding rectangles and is used by PostGIS GiST indexes?', o: ['Geohash', 'R-tree', 'Inverted index', 'B-tree on latitude'], a: 1, e: 'R-trees nest bounding rectangles in a balanced tree and handle points, lines and polygons.' }]
    },
    scaling: {
      say: 'Climb the scaling ladder and shard last: optimise queries and indexes, scale up with connection pooling, add caching, then read replicas, federation by function, partitioning and finally sharding. Replicas scale reads; sharding scales writes and storage but brings cross-shard joins, rebalancing and global IDs. A good shard key has high cardinality and matches the main query.',
      k: ['read replicas', 'replication lag', 'federation', 'partitioning', 'sharding', 'shard key', 'connection pooling', 'denormalisation'],
      p: ['Range sharding: easy ranges, hotspots. Hash: even spread, ranges hit all shards.', 'Directory sharding: flexible, but the lookup is a SPOF.', 'Connection pooling is often the quickest win.', 'After a write, read your own data from the primary.'],
      f: [['Read replicas or sharding?', 'Replicas scale reads and are simple; sharding scales writes and storage and is complex. Most systems are read-heavy, so start with replicas and caching.'],
          ['What makes a good shard key?', 'High cardinality, even load spread and a match with the main query, so most queries hit one shard.'],
          ['What is the downside of range sharding by date?', 'All new writes land on the latest shard, creating a hotspot.']],
      q: [{ q: 'Which sharding strategy spreads load evenly but makes range queries hit every shard?', o: ['Range', 'Geo', 'Directory', 'Hash'], a: 3, e: 'Hashing scatters adjacent keys across shards, so a range must fan out to all of them.' },
          { q: 'Hundreds of app instances overwhelm the database with connections. What is often the quickest win?', o: ['Connection pooling', 'Sharding', 'Switching to a graph DB', 'Adding a search index'], a: 0, e: 'A pooler (PgBouncer, built-in pools, DbContext pooling) cuts connection overhead without redesign.' }]
    },
    storage: {
      say: 'Block storage is a raw disk attached to one machine: lowest latency, for databases and VM disks. File storage is a shared folder over SMB or NFS for many servers. Object storage is a flat, HTTP-accessed bucket: practically unlimited, cheapest per GB, for documents, backups and data lakes. Use lifecycle tiers and short-lived SAS or presigned URLs.',
      k: ['block', 'file (SMB/NFS)', 'object', 'access tiers', 'lifecycle rules', 'WORM / immutability', 'SAS', 'presigned URL'],
      p: ['Cool, Cold, Archive have minimum periods of 30, 90 and 180 days.', 'Prefer a user delegation SAS (Entra ID) over account-key SAS.', 'Never stream big files through your API.', 'Object updates usually replace the whole object.'],
      f: [['When would you choose block, file or object storage?', 'Block for a database or VM disk. File for a folder shared by servers or a legacy app needing paths. Object for documents, images, backups and lakes at scale.'],
          ['How should users upload large files?', 'Give the client a short-lived, single-object, least-privilege SAS or presigned URL and upload straight to object storage.']],
      q: [{ q: 'Which storage type suits a database data disk?', o: ['Object storage', 'Block storage', 'File share over SMB', 'Archive tier'], a: 1, e: 'Databases need low latency and in-place block updates, which block storage provides.' }]
    },
    backup: {
      say: 'Backups are insurance against deletion, corruption, ransomware and disaster, and only count if the restore is tested. Full copies everything, incremental changes since the last backup, differential changes since the last full. Log backups enable point-in-time restore. Follow 3-2-1-1-0: three copies, two media, one offsite, one immutable, zero restore errors.',
      k: ['full', 'incremental', 'differential', 'point-in-time restore', 'transaction log backup', '3-2-1-1-0', 'immutable / air-gapped', 'GFS retention'],
      p: ['Backup frequency sets RPO; restore speed sets RTO.', 'Incremental restore needs the whole chain; differential needs full + latest diff.', 'Encrypt backups and keep keys separately.', 'Ransomware targets backups first: keep one copy it cannot touch.'],
      f: [['Incremental vs differential restore?', 'Incremental needs the full backup plus every incremental since. Differential needs the full plus only the latest differential.'],
          ['What does the "1-0" add to 3-2-1?', 'One immutable or air-gapped copy, and zero errors after a verified restore test.'],
          ['How do you recover from a bad DELETE at 10:42?', 'Point-in-time restore using transaction log backups to just before 10:42, usually to a separate database, then copy back the rows.']],
      q: [{ q: 'Which backup type is fastest to take but slowest to restore?', o: ['Full', 'Differential', 'Incremental', 'Snapshot'], a: 2, e: 'Incremental backups store only changes since the last backup, so restore must replay the whole chain.' }]
    },
    migration: {
      say: 'Data migration moves data to a new system without losing it, corrupting it or stopping the business: assess, map, extract and transform, load, reconcile, cut over, decommission. Big bang is simple but risky; trickle runs in waves; CDC replication gives near-zero downtime. For schema changes use expand, migrate, contract. Always rehearse and keep a rollback plan.',
      k: ['big bang', 'trickle / phased', 'CDC replication', 'parallel run', 'dual write', 'expand-migrate-contract', 'reconciliation', '7 Rs'],
      p: ['Reconcile with row counts, amount sums, hash totals, sample checks.', 'Dual write is risky (partial failures); prefer CDC or outbox.', 'Run EF migration bundles from the pipeline, not Database.Migrate() at start-up.', 'Profile data quality early and agree cleansing rules.'],
      f: [['How do you achieve a near-zero-downtime migration?', 'Bulk-copy history, keep it in sync with CDC, validate continuously, then do a short cutover with a rollback path.'],
          ['Explain expand-migrate-contract.', 'Add the new column, backfill it, switch reads and writes to it, then drop the old column, each step deployable without downtime.'],
          ['Name the 7 Rs of cloud migration.', 'Rehost, relocate, replatform, refactor, repurchase, retire, retain.']],
      q: [{ q: 'Why is dual write a risky migration approach?', o: ['It is too slow for bulk loads', 'It needs a big-bang cutover', 'It cannot handle schema changes', 'A partial failure can leave the two systems inconsistent'], a: 3, e: 'If one write succeeds and the other fails, the systems diverge; CDC or an outbox avoids this.' }]
    },
    etl: {
      say: 'ETL transforms data in a separate engine before loading it, so clean, masked data lands. ELT loads raw data into the lake or warehouse and transforms there with cloud compute, keeping raw data for re-transformation. ELT is flexible and popular with cloud warehouses; ETL is preferred when PII must be masked before landing.',
      k: ['ETL', 'ELT', 'staging', 'dbt', 'reverse ETL', 'zero-ETL', 'PII masking'],
      p: ['ELT lands raw sensitive data: govern it at landing.', 'Reverse ETL pushes warehouse insights back to CRM.', '.NET for Apache Spark is unmaintained: trigger platform Spark instead.'],
      f: [['When would you choose ETL over ELT?', 'When data must be cleansed or PII masked before it lands, or with an on-prem warehouse without cheap compute.'],
          ['What is reverse ETL?', 'Pushing insights from the warehouse back into operational tools such as a CRM.']],
      q: [{ q: 'What is the main advantage of ELT?', o: ['Raw data is kept, so you can re-transform later', 'Sensitive data never lands raw', 'No compute is needed in the target', 'It avoids the need for a warehouse'], a: 0, e: 'ELT keeps the raw data in the target, so transformations can change and rerun.' }]
    },
    cdc: {
      say: 'Change data capture streams every insert, update and delete from a database to other systems in near real time. Log-based CDC reads the transaction log: low impact and captures deletes. Trigger-based adds write overhead; timestamp polling misses deletes. CDC enables integration, strangler migrations and cache invalidation without touching legacy code.',
      k: ['log-based CDC', 'trigger-based', 'timestamp polling', 'Debezium', 'change feed', 'LSN', 'outbox', 'strangler migration'],
      p: ['Polling WHERE updated_at > last_run misses deletes.', 'Store the last LSN / version processed.', 'Cosmos change feed default mode hides deletes: soft-delete + TTL.', 'Use the outbox when you own the app code.'],
      f: [['Why is log-based CDC preferred?', 'It reads the transaction log, so it adds little load to the source and captures deletes, unlike triggers or timestamp polling.'],
          ['CDC or outbox?', 'CDC when you cannot change the source app, such as legacy systems. Outbox when you own the code and want explicit domain events.']],
      q: [{ q: 'Which CDC approach misses deleted rows?', o: ['Log-based', 'Trigger-based', 'Timestamp / query polling', 'Debezium'], a: 2, e: 'A deleted row has no updated_at to find, so polling never sees it.' }]
    },
    lake: {
      say: 'A warehouse holds structured, schema-on-write data for SQL and BI. A lake stores any raw data cheaply on object storage, schema-on-read, but can become a swamp. A lakehouse adds warehouse features, ACID tables via Delta, Iceberg or Hudi, on lake storage. The medallion architecture refines bronze to silver to gold.',
      k: ['schema-on-write', 'schema-on-read', 'lakehouse', 'Delta / Iceberg / Hudi', 'medallion', 'bronze / silver / gold', 'Lambda vs Kappa', 'Parquet'],
      p: ['Bronze raw, silver cleaned and conformed, gold business-ready.', 'Lambda: batch + speed layer. Kappa: streaming only, replay to reprocess.', 'No official Microsoft Delta/Iceberg library for .NET: land Parquet, let the platform manage tables.'],
      f: [['Warehouse vs lake vs lakehouse in one line each?', 'Warehouse: clean structured SQL for BI. Lake: any raw data on cheap storage, schema-on-read. Lakehouse: lake storage plus ACID tables and warehouse features.'],
          ['Lambda vs Kappa architecture?', 'Lambda runs a batch layer plus a speed layer. Kappa uses streaming only and replays the log to reprocess.']],
      q: [{ q: 'In the medallion architecture, which layer holds cleaned, conformed data?', o: ['Bronze', 'Silver', 'Gold', 'Platinum'], a: 1, e: 'Bronze is raw, silver is cleaned and conformed, gold is business-ready aggregates.' }]
    }
  }
};
