/* Quick-revision data for 02-networking-protocols.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['02'] = {
  approach: [
    ['Name the interaction', 'Answer now, live push, "something happened", decouple, or bulk file?'],
    ['Pick the protocol', 'REST/gRPC, WebSocket/SSE, webhook/event, AMQP/Kafka, SFTP batch.'],
    ['Go down the stack', 'HTTP version, TCP vs UDP (QUIC), TLS 1.2+, DNS and load balancer layer (L4 vs L7).'],
    ['Choose the format', 'JSON for public APIs, Protobuf for gRPC, Avro for Kafka, ISO 20022 for payments.'],
    ['Cover the operational questions', 'How does it authenticate, retry, order messages and get monitored?'],
    ['Show the .NET implementation', 'Kestrel + HttpClient via IHttpClientFactory, Grpc.AspNetCore, SignalR, TypedResults.ServerSentEvents.']
  ],
  traps: [
    'Picking a protocol for hype rather than for the interaction needed.',
    'Saying HTTP/2 removes all head-of-line blocking (it still blocks at the TCP level).',
    'Forgetting that TCP is a byte stream and needs message framing.',
    'Using a static HttpClient that never sees DNS changes.',
    'Accepting webhooks without HMAC signature, timestamp and idempotency checks.'
  ],
  sections: {
    layers: {
      say: 'A network is a stack of layers, each doing one job. OSI has seven, TCP/IP collapses them into four: application, transport, internet and link. In system design the key split is L4, which sees IP and port, versus L7, which sees URLs, headers and cookies.',
      k: ['OSI model', 'TCP/IP model', 'L4 vs L7', 'transport layer', 'application layer', 'TLS', 'IP routing'],
      p: ['Mnemonic 7->1: All People Seem To Need Data Processing.', 'L4 load balancer: IP + port. L7: URL, headers, cookies.', 'QUIC is transport-level reliability built on UDP.'],
      f: [['What can an L7 load balancer do that an L4 one cannot?', 'It reads HTTP: it can route by URL path, header or cookie, terminate TLS and do content-based routing. L4 only sees IP addresses and ports.'],
          ['Which layers do TCP, IP and HTTP live at?', 'HTTP is application (7), TCP is transport (4), IP is network (3).']],
      q: [{ q: 'You need to route /api/payments and /api/cards to different backends. What do you need?', o: ['An L4 load balancer', 'A DNS CNAME', 'A UDP listener', 'An L7 load balancer'], a: 3, e: 'Path-based routing needs to read the HTTP request, which only a layer 7 load balancer does.' }]
    },
    'tcp-udp': {
      say: 'TCP is a connection-oriented, reliable, ordered byte stream, like a phone call: it handshakes, retransmits and keeps order, at the cost of overhead and head-of-line blocking. UDP is fire-and-forget datagrams: fast, no guarantees. QUIC builds per-stream reliability on top of UDP.',
      k: ['handshake', 'retransmission', 'ordering', 'datagram', 'head-of-line blocking', 'QUIC', 'framing'],
      p: ['TCP: HTTP/1.1, HTTP/2, DB connections, AMQP. UDP: DNS, voice/video, gaming, QUIC.', 'One lost TCP packet holds up everything behind it.', 'TCP is a stream, not messages: add a length prefix or delimiter.'],
      f: [['When would you choose UDP over TCP?', 'When speed matters more than guaranteed delivery and a lost packet is better skipped than resent: voice, video, gaming, metrics, DNS.'],
          ['Why can one ReadAsync on a TCP socket return half a message?', 'TCP delivers a byte stream with no message boundaries, so you need framing such as a length prefix or delimiter (System.IO.Pipelines helps).']],
      q: [{ q: 'How does QUIC avoid TCP head-of-line blocking?', o: ['It disables encryption', 'It sends larger packets', 'It handles reliability per stream on top of UDP', 'It opens six TCP connections'], a: 2, e: 'QUIC runs over UDP and retransmits per stream, so a lost packet only stalls its own stream.' }]
    },
    http: {
      say: 'All three HTTP versions keep the same methods, status codes and headers but send them differently. HTTP/1.1 is text with one request at a time per connection. HTTP/2 adds binary framing, multiplexing and HPACK, but still blocks at TCP. HTTP/3 runs on QUIC with TLS 1.3 built in.',
      k: ['keep-alive', 'binary framing', 'multiplexing', 'HPACK', 'QUIC', 'TLS 1.3', '0-RTT', 'connection migration'],
      p: ['HTTP/1.1: browsers open about 6 connections per host.', 'gRPC runs on HTTP/2.', 'HTTP/3 survives network changes (Wi-Fi to 4G).', 'Use TLS 1.2 or later, prefer 1.3.'],
      f: [['What did HTTP/2 fix and what did it not fix?', 'It multiplexes many streams on one TCP connection with binary framing and header compression, fixing HTTP-level head-of-line blocking. A lost TCP packet still blocks all streams.'],
          ['Why is HTTP/3 good for mobile users?', 'QUIC gives faster setup (1-RTT, 0-RTT on resume), no TCP head-of-line blocking, and the connection survives switching networks.']],
      q: [{ q: 'Which feature first appeared in HTTP/2?', o: ['Multiplexing many streams on one connection', 'Keep-alive connections', 'Running over UDP', 'Status codes'], a: 0, e: 'Keep-alive was HTTP/1.1; UDP (via QUIC) is HTTP/3; multiplexing on one TCP connection came with HTTP/2.' }]
    },
    dns: {
      say: 'DNS is the internet\'s phone book: it turns a name into an IP. The client asks a recursive resolver, which walks root, TLD and authoritative servers. Answers are cached by TTL, which is why DNS-based failover is slow; lower the TTL before a cutover.',
      k: ['recursive resolver', 'authoritative server', 'TTL', 'A / AAAA', 'CNAME', 'private DNS zone', 'geo routing'],
      p: ['Lower the TTL before a migration or cutover.', 'DNS can load balance by geography (Traffic Manager, Route 53).', 'Static HttpClient without PooledConnectionLifetime never sees DNS changes.', 'Private DNS zones resolve private endpoints inside a VNet.'],
      f: [['Why is DNS failover slow?', 'Clients and resolvers cache the old answer until the TTL expires, and long-lived connections keep using the old IP.'],
          ['What do A, CNAME, MX and TXT records do?', 'A maps a name to IPv4 (AAAA to IPv6), CNAME aliases to another name, MX names the mail server, TXT holds verification data such as SPF/DKIM.']],
      q: [{ q: 'You plan to move an API to a new IP tomorrow. What should you do today?', o: ['Raise the DNS TTL', 'Lower the DNS TTL', 'Add an MX record', 'Delete the CNAME'], a: 1, e: 'A low TTL means caches expire quickly, so clients pick up the new address soon after the cutover.' }]
    },
    protocols: {
      say: 'Pick the protocol by the interaction: REST or gRPC when you need an answer now, WebSocket or SSE for live push, webhooks or events to say something happened, AMQP or Kafka to decouple systems, and SFTP for bulk files. Then check auth, retries, ordering and monitoring.',
      k: ['REST', 'gRPC', 'GraphQL', 'WebSocket', 'webhook', 'AMQP', 'Kafka', 'SFTP / MFT'],
      p: ['gRPC between services; REST for public, discoverable APIs.', 'JMS is a Java API, not a wire protocol; AMQP is a wire protocol.', 'GraphQL watch-outs: caching, query cost, N+1.', 'The protocol follows the interaction, not the hype.'],
      f: [['Why is gRPC faster than REST/JSON?', 'Binary Protobuf payloads, HTTP/2 multiplexing, persistent connections and generated client stubs.'],
          ['When would you still use SFTP batch files?', 'Big daily volumes and bank or partner exchanges where batch is acceptable; watch for polling, partial files and latency.'],
          ['What is the catch with gRPC for browsers?', 'Browsers cannot speak native gRPC, so you need gRPC-Web or JSON transcoding to expose it as REST.']],
      q: [{ q: 'A partner needs to be told when a payment settles. Which fits best?', o: ['Short polling every second', 'SMTP email', 'A shared database table', 'A webhook (HTTP POST callback)'], a: 3, e: 'Webhooks push "something happened" to the partner; add signatures, retries and idempotency.' }]
    },
    realtime: {
      say: 'There are five ways to get updates: short polling keeps asking, long polling holds the request open, SSE streams server to client over HTTP, WebSocket is full-duplex, and a webhook has the server call you. Pick the simplest that meets the direction and frequency.',
      k: ['short polling', 'long polling', 'SSE', 'WebSocket', 'webhook', 'HMAC signature', 'backplane', 'auto-reconnect'],
      p: ['SSE: one direction, plain HTTP, reconnects automatically: great for LLM tokens.', 'WebSocket/SSE scale-out needs sticky connections or a backplane (Redis, Azure SignalR).', 'Webhooks: HMAC check, retries with backoff, idempotent handler, fast 2xx.', 'Compare signatures in constant time and check a timestamp to block replays.'],
      f: [['WebSocket or SSE for a live dashboard?', 'SSE if data only flows server to client: simpler, plain HTTP, auto-reconnect. WebSocket if the client also sends frequent messages.'],
          ['How do you secure webhooks?', 'HTTPS only, an HMAC signature with a shared secret (or mTLS), a timestamp to block replays, an allowlist, idempotent processing and a quick 2xx.'],
          ['What does SignalR give you over raw WebSockets?', 'It picks WebSocket, SSE or long polling automatically, and adds groups, reconnects and scale-out options.']],
      q: [{ q: 'Why should a webhook receiver reply 2xx quickly and do the work asynchronously?', o: ['To avoid sender timeouts and duplicate retries', 'Because HMAC requires it', 'To keep the connection open', 'So the payload is encrypted'], a: 0, e: 'Slow handlers trigger sender timeouts and retries; acknowledge fast, queue the work, and make it idempotent.' }]
    },
    formats: {
      say: 'The protocol carries the message; the format defines its shape. JSON is the web API default, XML for SOAP and legacy, Protobuf for gRPC, Avro with a schema registry for Kafka, Parquet for analytics. In payments, ISO 20022 is XML messaging and ISO 8583 is binary card messaging.',
      k: ['JSON Schema', 'Protobuf', 'Avro + Schema Registry', 'Parquet (columnar)', 'XSD validation', 'ISO 20022', 'ISO 8583'],
      p: ['ISO 20022 (pacs, pain, camt) is replacing SWIFT MT; used in Australia\'s NPP.', 'Batch CSV: agree headers, encoding and control totals.', 'Validate ISO 20022 XML against the official XSD.', 'System.Text.Json source generation: no reflection, AOT-safe.'],
      f: [['When would you choose Avro over JSON?', 'For Kafka streams where schemas evolve: Avro is compact binary and a schema registry checks compatibility.'],
          ['What is the difference between ISO 20022 and ISO 8583?', 'ISO 20022 is rich XML messaging for payments (pacs, pain, camt). ISO 8583 is a binary format for card authorisations at ATMs and POS.']],
      q: [{ q: 'Which format is columnar and suited to analytics in a data lake?', o: ['Parquet', 'Protobuf', 'ISO 8583', 'CSV'], a: 0, e: 'Parquet stores data by column, so analytic scans read only the needed columns and compress well.' }]
    }
  }
};
