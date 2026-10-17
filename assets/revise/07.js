/* Quick-revision data for 07-data-governance-privacy.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['07'] = {
  approach: [
    ['Identify the data', 'What data, whose, how sensitive? Classify it and find the most sensitive field.'],
    ['Name the owner and rules', 'Business owner, steward, custodian; which laws apply (Privacy Act/APPs, APRA, AML/CTF, PCI DSS).'],
    ['Minimise and protect', 'Collect less; mask, tokenise or pseudonymise; encrypt and restrict access by classification.'],
    ['Decide where it lives', 'In-country regions, keys in-country, policy guardrails; map every copy.'],
    ['Plan its whole life', 'Retention schedule, legal hold, hard delete, backups, crypto-shredding.'],
    ['Make it trustworthy', 'Quality gates, quarantine, lineage, data contracts enforced in CI.'],
    ['Automate it', 'Governance as code: catalogue tags, Azure Policy, log redaction, schema registry.']
  ],
  traps: [
    'Saying IT owns the data. The business owns it; IT is the custodian.',
    'Calling pseudonymised data anonymous. If it can be re-linked, privacy law still applies.',
    'Assuming "hosted in Australia East" solves residency and sovereignty.',
    'Treating soft delete as deletion, or forgetting backups, logs and history tables.',
    'Recommending a full data mesh for a small organisation with a few sources.'
  ],
  sections: {
    governance: {
      say: 'Data governance is the roles, policies and processes that decide who owns data, who may use it and how it is handled through its life. The business owner is accountable, the steward keeps it clean, IT is the custodian. Build it into the platform as code, or people go around it.',
      k: ['data owner', 'data steward', 'data custodian', 'data catalogue', 'business glossary', 'governance as code', 'CPG 235'],
      p: ['Owner = business, accountable; custodian = IT, applies controls.', 'Catalogue + glossary: find data and agree one meaning per term.', 'Good governance is a fast lane for safe use, not just "no".', 'APRA CPG 235 describes the same owner/steward/custodian roles.'],
      f: [['Owner vs steward vs custodian?', 'The owner is a senior business person accountable for a domain who approves access and sets classification and retention. The steward looks after definitions and quality day to day. The custodian (IT/platform) stores, secures and moves the data as the owner asks.'],
          ['What does "governance as code" mean?', 'Enforce rules through the platform: catalogue tags, policies and pipelines that apply classification, access and retention automatically, instead of a wiki page people forget.'],
          ['Should you build a data catalogue in .NET?', 'No. Use an existing catalogue such as Microsoft Purview and feed it from code or its REST API.']],
      q: [{ q: 'In a well-governed organisation, who is accountable for the "Customer" data domain?', o: ['The DBA team', 'A senior business data owner', 'The cloud platform team', 'Whoever built the pipeline'], a: 1, e: 'The owner is a business leader who approves access and sets classification and retention. IT is the custodian.' }]
    },
    classification: {
      say: 'Classification labels data by the harm its exposure would cause, typically public, internal, confidential and restricted. The label drives encryption, access, masking, logging and sharing. A dataset takes its most sensitive field\'s level, and aggregation can raise it.',
      k: ['public / internal / confidential / restricted', 'PII', 'sensitive information', 'sensitivity labels', 'automated discovery', 'aggregation risk', 'CPS 234', 'redaction'],
      p: ['A dataset takes the level of its most sensitive field.', 'Aggregation raises the level (a million names + balances).', 'CPS 234 requires classifying assets by criticality and sensitivity.', 'Cheapest control: do not collect the field.'],
      f: [['Personal vs sensitive information under the Privacy Act?', 'Personal information is about an identified or reasonably identifiable person (name, email, account number, often device IDs). Sensitive information is a special category such as health, biometrics, religion or criminal record, with a higher bar that usually needs consent.'],
          ['How does classification help in .NET logging?', 'Tag properties with DataClassification attributes (Microsoft.Extensions.Compliance) and map each class to a redactor: erase restricted values, HMAC confidential ones, so logs never hold the raw data.'],
          ['Why can combining harmless fields be a problem?', 'Aggregation raises sensitivity: one postcode is low risk, but a bulk extract of names, postcodes and balances is restricted.']],
      q: [{ q: 'A table holds product codes, customer emails and one column of card numbers. What classification does the table get?', o: ['Internal, because most columns are harmless', 'Confidential, the average level', 'Restricted, the level of its most sensitive field', 'Public, if the card column is hidden in the UI'], a: 2, e: 'A dataset takes the level of its most sensitive field; card numbers are restricted.' }]
    },
    privacy: {
      say: 'Privacy means collecting only what you need, using it for expected purposes, protecting it and respecting people\'s rights. Architects apply privacy by design, minimisation, and masking, tokenisation or pseudonymisation. In Australia that means the Privacy Act and 13 APPs plus the Notifiable Data Breaches scheme. Pseudonymised data is still personal information.',
      k: ['privacy by design', 'data minimisation', 'purpose limitation', 'APPs', 'NDB scheme', 'tokenisation', 'pseudonymisation', 'PIA'],
      p: ['Masked and tokenised data is still personal; anonymised is not, if done properly.', 'NDB: notify OAIC and people if serious harm is likely; assess within 30 days.', 'No general right to be forgotten in Australia, but APP 11.2 says destroy or de-identify.', 'GDPR: 72-hour breach notice, fines up to 4% of global turnover.'],
      f: [['Masking vs tokenisation vs pseudonymisation vs anonymisation?', 'Masking hides part of the value on screen but stores it unchanged. Tokenisation swaps it for a token only the vault can reverse. Pseudonymisation uses a keyed ID that can be re-linked, so it is still personal. Anonymisation cannot be linked back.'],
          ['Why tokenise card numbers?', 'Systems that only hold tokens cannot reveal the card number, which shrinks PCI DSS scope to the vault.'],
          ['What changes from 10 December 2026?', 'Under the 2024 amendments, privacy policies must explain automated decisions that significantly affect people.'],
          ['What breaks if you lose the ASP.NET Core Data Protection key ring?', 'Everything protected with it can never be decrypted. Persist it (e.g. Blob Storage), wrap it with Key Vault, back it up and keep old keys.']],
      q: [{ q: 'Analysts get records where customer IDs are replaced with an HMAC of the ID using a secret key. Which statement is true?', o: ['The data is anonymised, so privacy law no longer applies', 'The data is pseudonymised and is still personal information', 'The data is masked and cannot be joined', 'The data is tokenised and needs a vault to read'], a: 1, e: 'A keyed hash can be re-linked by whoever has the key, so it is pseudonymised and still personal information.' },
          { q: 'Under the Notifiable Data Breaches scheme, when must you notify the OAIC and affected people?', o: ['Within 72 hours of any incident', 'Only if more than 1,000 records leak', 'As soon as practicable when a breach is likely to cause serious harm', 'At the next annual privacy report'], a: 2, e: 'NDB requires notification as soon as practicable for eligible breaches likely to cause serious harm; a suspected breach must be assessed within 30 days. 72 hours is GDPR.' }]
    },
    residency: {
      say: 'Residency is where data physically sits, sovereignty is whose laws can reach it, and localisation is a rule that it must stay in a country. Use in-country regions, keep keys in an Australian vault, block other regions with policy, and map every copy. APP 8 keeps you accountable for overseas disclosure.',
      k: ['data residency', 'data sovereignty', 'localisation', 'APP 8', 'allowed locations policy', 'customer-managed keys', 'CPS 230', 'regional cells'],
      p: ['Residency is not sovereignty: a foreign provider may be compelled by home laws.', 'Usual leaks: backups, logs, CDN caches, AI endpoints, offshore support access.', 'Enforce location with Azure Policy / SCPs at management-group level.', 'CPS 230 (from 1 July 2025) covers material service providers.'],
      f: [['We host in Australia East. Is that enough for residency?', 'Not alone. Check replicas, backups, logs, CDN and AI endpoints, keep keys in an Australian vault, deny other regions by policy and control offshore support access, which can be an APP 8 disclosure.'],
          ['Does Cosmos DB ApplicationPreferredRegions enforce residency?', 'No. It only picks between regions the account already replicates to. Residency is set by which regions you add and enforced by policy.']],
      q: [{ q: 'What is the best way to stop teams accidentally deploying resources outside Australia?', o: ['A note in the architecture standards wiki', 'An app setting with the default region', 'Azure Policy "Allowed locations" at the management-group level', 'Cosmos DB preferred regions'], a: 2, e: 'Platform policy at a high scope denies other regions and is inherited by new subscriptions; app settings and wikis do not enforce anything.' }]
    },
    retention: {
      say: 'Keep data as long as law and business need it and no longer, then delete it everywhere. A retention schedule lists each data type, period and reason; legal holds override it. Deletion must reach replicas, history, lakes, caches and backups; crypto-shredding makes every copy unreadable.',
      k: ['retention schedule', 'legal hold', 'soft vs hard delete', 'lifecycle tiering', 'crypto-shredding', 'deletion log', 'WORM / immutability'],
      p: ['AML/CTF records: generally 7 years; check the trigger (record made vs relationship ended).', 'Several rules apply? Keep for the longest, and no longer.', 'Soft delete is not deletion; temporal history tables need purging too.', 'Over-retention is breach exposure, not a safety net.'],
      f: [['How do you delete a customer\'s data that is also in backups?', 'Hard-delete in live systems, keep a deletion log replayed after any restore, and let backups age out on a short cycle. For a stronger guarantee use crypto-shredding. Check legal holds and AML/CTF retention first.'],
          ['What is crypto-shredding?', 'Encrypt each customer\'s or period\'s data with its own key; delete and purge the key and every copy, including backups, becomes unreadable.'],
          ['What overrides the retention schedule?', 'A legal hold from litigation, a regulator or an investigation freezes deletion of specific records until released.']],
      q: [{ q: 'A customer is erased by setting IsDeleted = true in the Customers table. What is the main problem?', o: ['EF Core cannot filter soft-deleted rows', 'The data still exists, so it is not deletion for privacy or retention', 'Soft delete breaks temporal tables', 'It violates the 7-year AML/CTF rule'], a: 1, e: 'Soft delete only hides the row. A hard delete (including history, copies and backups handling) is still needed.' }]
    },
    quality: {
      say: 'Data quality is whether data is fit for purpose, measured on accuracy, completeness, consistency, timeliness, validity and uniqueness. Lineage traces where data came from and where it goes, for impact analysis, root cause and regulators like BCBS 239. Fix quality at the source and quarantine bad rows.',
      k: ['quality dimensions', 'quality gates', 'quarantine', 'column-level lineage', 'BCBS 239', 'OpenLineage', 'Microsoft Purview', 'FluentValidation'],
      p: ['Six dimensions: accuracy, completeness, consistency, timeliness, validity, uniqueness.', 'Check early, quarantine failures, alert the steward; never fail silently.', 'Column-level lineage is what auditors and impact analysis need.', 'Measure quality as numbers with thresholds and owners.'],
      f: [['Why does lineage matter?', 'Impact analysis (what breaks if I change this column), root cause (why is this number wrong) and regulation: BCBS 239 expects banks to trace risk figures to source.'],
          ['What do you do with rows that fail validation in a pipeline?', 'Quarantine them with the errors and alert the steward. Do not silently drop them or load them anyway.']],
      q: [{ q: 'The ledger balance and the data warehouse balance disagree. Which quality dimension is failing?', o: ['Timeliness', 'Consistency', 'Uniqueness', 'Validity'], a: 1, e: 'Consistency means data agrees across systems.' }]
    },
    mdm: {
      say: 'Master data management creates one trusted golden record for core entities like customer and product. Matching finds duplicates and survivorship picks the best value per field. Styles go from registry and consolidation to coexistence and centralised; start light because centralised is the most invasive.',
      k: ['golden record', 'master vs reference data', 'matching', 'survivorship', 'registry', 'consolidation', 'coexistence', 'centralised hub'],
      p: ['MDM manages master data, not transactional data.', 'A false merge is worse than a missed match in banking.', 'Agree field ownership and stewardship before tooling.', 'Start with registry or consolidation.'],
      f: [['Consolidation vs coexistence MDM?', 'Consolidation copies data into a hub and builds golden records for analytics, but nothing flows back. Coexistence also syncs the golden record back to sources, which needs complex two-way sync and conflict rules.'],
          ['Master vs reference vs transactional data?', 'Master data are shared nouns like customer and product. Reference data are code lists like ISO 4217 currencies. Transactional data are high-volume events like payments, not managed by MDM.']],
      q: [{ q: 'You need a single customer view quickly without changing any source system. Which MDM style fits?', o: ['Centralised (transaction) hub', 'Coexistence', 'Registry', 'Rewrite every source system'], a: 2, e: 'A registry holds only match links and IDs and builds the view on demand, with no change to sources.' }]
    },
    mesh: {
      say: 'A data contract is a versioned promise from producer to consumers: schema, meaning, SLAs, owner and version. Data mesh is an operating model where domains own data as products on a self-serve platform under federated governance. Enforce contracts in CI and the schema registry; mesh is overkill for small organisations.',
      k: ['data contract', 'schema registry', 'compatibility', 'data as a product', 'domain ownership', 'self-serve platform', 'federated governance', 'data fabric'],
      p: ['Four mesh principles: domain ownership, data as a product, self-serve platform, federated governance.', 'Breaking changes get a new major version and a deprecation window.', 'A contract in a wiki is just a hope; fail the build.', 'Mesh changes the org chart before the tech.'],
      f: [['When would you not recommend a data mesh?', 'Small or medium organisations with few sources, a central team that keeps up, or domains without data skills or a self-serve platform. Start with contracts, a catalogue and clear ownership.'],
          ['What goes in a data contract?', 'Schema, semantics (e.g. amount in cents, AUD), quality and SLA targets, ownership and classification, and versioning rules.'],
          ['Mesh vs fabric?', 'Mesh is mainly organisational: domains own data products. Fabric is technology-led: metadata, catalogue and automation connect data. They can work together.']],
      q: [{ q: 'How do you stop a producer from shipping a breaking change to a Kafka event schema?', o: ['Document the schema in a wiki', 'Let producers auto-register schemas at runtime', 'Register schemas only from CI with compatibility checks in the schema registry', 'Ask consumers to handle any payload'], a: 2, e: 'The registry enforces compatibility; disabling auto-register means only CI, after checks, can publish a new version.' }]
    }
  }
};
