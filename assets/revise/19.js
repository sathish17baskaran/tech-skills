/* Quick-revision data for 19-banking-payments.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['19'] = {
  approach: [
    ['Name the rail', 'NPP, PayTo, BECS, cards, HVCS or SWIFT: each has its own speed, settlement model, format and cut-offs.'],
    ['Separate clearing from settlement', 'Who exchanges the messages, and when central-bank money actually moves (real-time gross or batched net).'],
    ['Design for money safety', 'Idempotency key and end-to-end ID from the start, state machine per payment, outbox for events, no blind retries.'],
    ['Cover the failure model', 'Timeouts are "unknown", returns and dishonours arrive days later on batch rails, real-time rails decline instantly.'],
    ['Map regulation to design', 'CPS 230 tolerance levels become RTO/RPO, CPS 234 becomes security controls, AML becomes monitoring, PCI DSS becomes scope reduction.'],
    ['Close with the ledger', 'Double-entry, immutable, exactly-once postings, ledger vs available balance, daily reconciliation.']
  ],
  traps: [
    'Mixing up clearing and settlement.',
    'Retrying a timed-out payment send without first querying its status.',
    'Storing money as a floating-point double.',
    'Saying BECS shuts down on a fixed date: there is currently no agreed end date.',
    'Treating a card authorisation as if money has moved.'
  ],
  sections: {
    landscape: {
      say: 'Several rails move money between Australian banks. Each one clears, meaning banks exchange instructions and work out who owes whom, then settles, moving central-bank money between Exchange Settlement Accounts at the RBA in RITS. NPP and high-value payments settle gross, one by one; BECS and cards settle net in batches.',
      k: ['clearing', 'settlement', 'ESA', 'RITS / RTGS', 'gross vs net', 'AP+', 'AusPayNet'],
      p: ['Clearing = exchanging messages. Settlement = moving central-bank money.', 'Real-time gross settlement removes credit risk between banks.', 'AP+ brings BPAY, eftpos and NPP Australia under one company.', 'Bank payment platforms are mostly adapters between channels, ledger and rails.'],
      f: [
        ['Clearing vs settlement?', 'Clearing is exchanging payment instructions and working out obligations. Settlement is the final movement of central-bank money between banks\' Exchange Settlement Accounts in RITS.'],
        ['Gross vs net settlement?', 'Gross settles each payment on its own (NPP, HVCS). Net adds many payments up and settles only the difference (BECS, cards). Gross removes interbank credit risk; net saves liquidity.'],
        ['Who runs what in Australian payments?', 'AP+ runs NPP, BPAY and eftpos; AusPayNet administers frameworks like BECS and HVCS; the RBA runs RITS and regulates the payments system.']
      ],
      q: [{ q: 'Which statement about settlement is correct?', o: ['It is the final movement of funds between banks\' accounts at the RBA', 'It is the exchange of payment messages between banks', 'It happens before clearing', 'It only applies to card payments'], a: 0, e: 'Clearing exchanges instructions; settlement moves central-bank money between Exchange Settlement Accounts, and it is final.' }]
    },
    npp: {
      say: 'The New Payments Platform is Australia\'s fast-payment rail: account-to-account payments that clear and settle in seconds, 24/7, through the RBA\'s Fast Settlement Service. PayID lets you pay a phone, email or ABN, and messages are rich ISO 20022. The trade-off: no batch window, so fraud checks must happen before the money goes.',
      k: ['NPP', 'Fast Settlement Service (FSS)', 'PayID', 'Osko', 'overlay service', 'ISO 20022 pacs.008', 'Confirmation of Payee'],
      p: ['Funds can be released immediately because each payment settles with finality.', 'Fraud scoring needs a sub-second budget: no "catch it tomorrow".', 'A send timeout is "unknown", not "failed": query by end-to-end ID first.', '24/7 rails need a 24/7 core ledger, fraud and liquidity monitoring.'],
      f: [
        ['Why can an NPP payment be released to the payee immediately?', 'Because the RBA\'s Fast Settlement Service settles each payment individually and with finality, 24/7, so there is no interbank credit risk to cover.'],
        ['A payment send to the scheme times out. Do you retry?', 'Not blindly. A timeout means unknown. Query the status by end-to-end ID, and only resend with the same idempotency key if the scheme confirms it never received it.'],
        ['What does a payments hub do?', 'Orchestrates each payment as a state machine, maps to ISO 20022, routes to the right rail and publishes events through an outbox.'],
        ['What breaks when you move a flow to 24/7 real-time payments?', 'The batch window disappears, so the core ledger, fraud, monitoring and liquidity management all need weekend-grade availability.']
      ],
      q: [{ q: 'An outbound NPP payment call times out. What should the system do first?', o: ['Resend immediately with a new ID', 'Mark it failed and refund the customer', 'Wait for the next business day batch', 'Query the payment status by its end-to-end ID'], a: 3, e: 'A timeout is an unknown outcome. Check status before any retry, and reuse the same idempotency key, or you risk paying twice.' }]
    },
    payto: {
      say: 'PayTo is a digital payment agreement, or mandate, that the customer authorises in their own banking app, so a business can pull payments over the NPP in real time. Agreements live in the Mandate Management Service and the customer can pause, amend or cancel them. It is the modern replacement for BECS direct debits.',
      k: ['payment agreement / mandate', 'Mandate Management Service (MMS)', 'authorise in banking app', 'pause / amend / cancel', 'Migrated DDR Mandates', 'real-time decline'],
      p: ['The bank, not the merchant, holds the source of truth for consent.', 'Model an agreement as a state machine: created, active, paused, cancelled.', 'Payment requests can be declined instantly: design the merchant flow for a "no".'],
      f: [
        ['How is PayTo different from a BECS direct debit?', 'The agreement is stored centrally in the MMS and authorised by the customer in their banking app; payments settle in real time; the customer can pause or cancel it. With BECS the bank never sees the mandate and failures show up days later.'],
        ['How would you migrate a biller from BECS direct debits to PayTo?', 'Notify customers, create Migrated DDR Mandates in the MMS, run both rails in parallel, cancel the old BECS authorities, and handle real-time declines, pauses and cancellations.'],
        ['How should a merchant system handle MMS change notifications?', 'Receive them, queue them and process them idempotently, updating the agreement state machine and rejecting illegal status changes.']
      ],
      q: [{ q: 'Where is the source of truth for a PayTo agreement\'s status?', o: ['The merchant\'s billing database', 'A signed paper Direct Debit Request', 'The NPP Mandate Management Service, via the customer\'s bank', 'The card scheme'], a: 2, e: 'Agreements are stored centrally in the MMS and authorised through the customer\'s bank, so the customer\'s control is real.' }]
    },
    becs: {
      say: 'BECS, or Direct Entry, carries batch payments like payroll, welfare and direct debits as fixed-width ABA files, exchanged and net-settled on business days. Files have header, detail and total records with control totals. It fails late: returns and dishonours arrive days later. BECS is being wound down, but there is currently no fixed end date.',
      k: ['ABA file', 'fixed-width 120 chars', 'type 0 / 1 / 7 records', 'control totals', 'cut-offs', 'returns & dishonours', 'reconciliation'],
      p: ['Every record is exactly 120 characters, CRLF separated.', 'Make file processing idempotent: hash the file, track batch IDs.', 'Amounts are whole cents: parse as integer or decimal, never double.', 'No fixed BECS end date: the June 2030 target was removed in December 2025.'],
      f: [
        ['What are the three ABA record types?', 'Type 0 descriptive header (one per batch), type 1 detail (one per payment, with BSB, account, amount in cents, lodgement reference and trace details), type 7 file total with control totals.'],
        ['How do you stop a re-uploaded payroll file paying staff twice?', 'Store a hash of the file and the batch ID with a unique index, and reject any file already processed.'],
        ['What changes when a flow moves from BECS to NPP?', 'The error model changes from "fails tomorrow" (returns, dishonours) to "fails now" (instant decline), which is usually better for customers and operations.'],
        ['What is the status of the BECS wind-down?', 'Industry intends to move off BECS, but AusPayNet removed the June 2030 target and no new date will be set until there is an agreed roadmap. Batch skills will be needed for years.']
      ],
      q: [{ q: 'A bank rejects an uploaded ABA file whose type 7 totals do not match the detail records. What is the type 7 record?', o: ['The descriptive header', 'The file total with control totals and record count', 'A single payment detail line', 'The return record'], a: 1, e: 'Type 7 holds net, credit and debit totals and the record count. Mismatched control totals get the file rejected.' }]
    },
    cards: {
      say: 'A card payment follows the four-party model: cardholder and issuer, merchant and acquirer, linked by a scheme. It runs in three steps: authorisation in seconds, which is only a promise and a hold, then clearing and net settlement later. For PCI DSS, the cheapest control is never touching the card number: use tokenisation and hosted fields.',
      k: ['four-party model', 'issuer / acquirer / scheme', 'authorisation hold', 'ISO 8583', 'network tokens', '3-D Secure', 'chargeback', 'PCI DSS scope'],
      p: ['Authorisation is not settlement: no money moves at auth time.', 'Holds can expire or be partly captured: the ledger must model both.', 'Prefer network tokens: higher approval rates and automatic card updates.', 'PCI DSS v4.0.1 is the active version; shrink scope, never log the PAN.'],
      f: [
        ['What happens at card authorisation?', 'The issuer checks funds and fraud and places a hold. It is a promise; money moves later through clearing and net settlement.'],
        ['Network token vs PSP vault token?', 'A network token is issued by the scheme, tied to a device or merchant, and updates when a card is reissued. A PSP token is a reference only that provider can use.'],
        ['Name four ways to reduce PCI DSS scope.', 'Hosted payment fields or redirect pages, tokenisation, point-to-point encryption terminals, network segmentation, and never logging the PAN.'],
        ['What does 3-D Secure give the merchant?', 'Issuer authentication for online payments, mostly frictionless and risk-based. A successful check usually shifts fraud liability to the issuer.']
      ],
      q: [{ q: 'A customer taps their phone and the purchase is approved. What has happened to the money?', o: ['It has settled to the merchant', 'It moved in real time through the FSS', 'The issuer has placed a hold; clearing and settlement come later', 'It has been debited from the acquirer'], a: 2, e: 'Authorisation is a promise and a hold. Clearing and net settlement happen later in batches.' }]
    },
    swift: {
      say: 'Cross-border payments hop between correspondent banks that hold nostro and vostro accounts with each other, using Swift messages. Payment instructions are now ISO 20022 under CBPR+, so pacs.008 replaces MT103. Every payment carries a UETR for gpi tracking. The big win is structured data for sanctions screening and AML.',
      k: ['correspondent banking', 'nostro / vostro', 'CBPR+', 'pacs.008 / pacs.009', 'UETR', 'gpi tracker', 'structured data'],
      p: ['MT103 to pacs.008; MT202 to pacs.009; MT940/950 to camt.053.', 'Coexistence for cross-border payment instructions ended 22 November 2025.', 'Never truncate rich ISO data into an MT-shaped internal model.', 'Store the UETR so ops can answer "where is my money?".'],
      f: [
        ['What is the ISO 20022 equivalent of MT103?', 'pacs.008, the customer credit transfer. MT202 maps to pacs.009, and statements like MT940 map to camt.053.'],
        ['What is a UETR for?', 'A unique end-to-end reference carried by every gpi payment, so banks and customers can track it through the chain, including fees deducted.'],
        ['Why is converting ISO 20022 back to an MT-shaped model risky?', 'It truncates structured names, addresses and purpose data, which loses information and can break sanctions screening and compliance.']
      ],
      q: [{ q: 'What is the main business benefit of ISO 20022 for cross-border payments?', o: ['Structured data that improves sanctions screening and AML', 'Smaller message sizes', 'Removal of correspondent banks', 'Instant settlement worldwide'], a: 0, e: 'Rich, structured fields (names, addresses, purpose) make screening and monitoring far more accurate. Correspondent hops and settlement times still exist.' }]
    },
    cdr: {
      say: 'The Consumer Data Right lets consumers tell their bank to share their data with an accredited data recipient through standard, highly secured APIs, with consent they can withdraw any time. Security builds on FAPI: mTLS, PAR with PKCE, JARM and certificate-bound tokens. Consent is a first-class entity with a lifecycle.',
      k: ['Consumer Data Right', 'data holder', 'accredited data recipient', 'FAPI', 'mTLS', 'PAR + PKCE', 'certificate-bound tokens', 'consent dashboard'],
      p: ['Think "mTLS everywhere + sender-constrained tokens + signed requests".', 'Revocation must work from either side.', 'Payment initiation in Australia happens through PayTo, not the CDR.', 'CDR APIs expose core data directly: poor data quality becomes a compliance issue.'],
      f: [
        ['Name the core security pieces of a CDR data holder.', 'An API gateway with mTLS that trusts only the CDR certificate authority, a FAPI-conformant authorisation server (PAR, JARM, private_key_jwt), short-lived certificate-bound tokens, and a consent store.'],
        ['Why is consent modelled as an entity, not a checkbox?', 'It has a lifecycle: what was shared, with whom, for how long, and it can be revoked from either side. It is the source of truth for every data request.'],
        ['Can a fintech initiate payments through the CDR today?', 'Not yet. The action-initiation framework is legislated, but no action types have been declared; account-to-account payment initiation happens through PayTo.']
      ],
      q: [{ q: 'What does a certificate-bound access token prevent in the CDR?', o: ['Consent expiry', 'Rate limiting', 'Data quality issues', 'A stolen token being used by a different client'], a: 3, e: 'The token is bound to the client\'s mTLS certificate (cnf), so it is useless to anyone without that certificate.' }]
    },
    regulation: {
      say: 'Banking rules become design requirements. CPS 230 tolerance levels for critical operations become RTO, RPO and degraded-mode SLOs, plus exit plans for material service providers. CPS 234 drives security controls and 72-hour incident notification. AML/CTF drives monitoring and record keeping, and PCI DSS drives card-data scope reduction.',
      k: ['CPS 230', 'tolerance levels', 'material service provider', 'CPS 234', 'AML/CTF', 'AUSTRAC', 'PCI DSS', 'exit plan'],
      p: ['Tolerance level in numbers: max outage, max data loss, min service level.', 'CPS 234: notify APRA within 72 hours of a material security incident.', 'CPS 230: notify APRA within 24 hours of a disruption outside tolerance.', 'Logs are evidence: complete, tamper-evident, retained, free of secrets and PANs.'],
      f: [
        ['How does CPS 230 change your DR design?', 'You design to board-approved tolerance levels per critical operation, map every dependency including material service providers, prove it with severe-but-plausible scenario tests, and keep a tested exit plan for key vendors.'],
        ['What does CPS 230 mean for a cloud provider?', 'Core cloud and SaaS vendors can be material service providers: register them, set contract terms, and design for exit with portable data, IaC and a tested plan B.'],
        ['Is PCI DSS a law?', 'No. It is an industry standard enforced through card schemes and acquirers.']
      ],
      q: [{ q: 'Under CPS 230, what should a "tolerance level" for payments translate into in your design?', o: ['A marketing SLA', 'Concrete RTO, RPO and minimum service-level targets', 'A list of approved vendors', 'An encryption standard'], a: 1, e: 'Tolerance levels set max outage, max data loss and minimum service in disruption, which map directly to RTO, RPO and degraded-mode SLOs.' }]
    },
    ledger: {
      say: 'A ledger records every money movement as balanced, immutable double entries; balances are derived from them, and every posting must happen exactly once. Fix mistakes with reversing entries, never updates. Distinguish the ledger balance from the available balance, which subtracts holds. Use decimal or integer cents, never double, and reconcile daily.',
      k: ['double entry', 'immutable journal', 'reversing entry', 'idempotent posting', 'ledger vs available balance', 'holds', 'optimistic concurrency', 'reconciliation'],
      p: ['Every journal\'s debits equal its credits.', 'Available = ledger minus holds (plus any overdraft limit).', 'Unique index on the posting key makes replays harmless.', 'Reconcile: entries = balances = what the rails and RITS say.'],
      f: [
        ['Ledger balance vs available balance?', 'Ledger is what has posted. Available is ledger minus holds, plus any overdraft limit. Customers care about available.'],
        ['How do you make postings exactly-once?', 'Give each posting a unique key, such as the scheme\'s transaction ID, and insert it with the journal in one transaction behind a unique index, so a replay fails harmlessly.'],
        ['How do you correct a wrong posting?', 'Never update or delete it. Post a reversing entry so the history itself is the audit trail.']
      ],
      q: [{ q: 'A $80 card authorisation is approved on an account with $500 posted. What are the balances?', o: ['Ledger $500, available $420', 'Ledger $420, available $420', 'Ledger $420, available $500', 'Ledger $500, available $500'], a: 0, e: 'An authorisation places a hold: available drops, but the ledger only changes when the transaction posts.' }]
    }
  }
};
