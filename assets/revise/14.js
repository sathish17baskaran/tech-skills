/* Quick-revision data for 14-security-iam.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['14'] = {
  approach: [
    ['Name the asset and the threat', 'What data or action are we protecting, from whom: outsider, insider, compromised service?'],
    ['Identity first', 'Who is calling (human or workload), how they authenticate (OIDC, MFA, managed identity, mTLS).'],
    ['Then authorisation', 'Least privilege: RBAC/ABAC per endpoint plus ownership checks per object (BOLA).'],
    ['Protect the data', 'TLS 1.2+ in transit, encryption at rest with keys in a vault/HSM, hashing or tokenisation where it fits.'],
    ['Assume breach', 'Zero Trust: segment, log and trace every access, limit the blast radius, rotate secrets.'],
    ['Shift left in the pipeline', 'SAST, SCA, secret and IaC scanning, SBOM, signed artifacts.'],
    ['Close with .NET and governance', 'JwtBearer / Microsoft.Identity.Web, Key Vault via Azure.Identity, access reviews and audit logs.']
  ],
  traps: [
    'Mixing up authentication (401) and authorisation (403), or OAuth 2.0 (access) with OIDC (login).',
    'Encrypting passwords instead of using a slow, salted hash.',
    'Calling Base64 "encryption".',
    'Trusting internal traffic because it is "inside the network".',
    'Checking roles on the endpoint but never checking who owns the record.'
  ],
  sections: {
    'authn-authz': {
      say: 'Authentication proves who you are, with a password, MFA or a certificate. Authorisation decides what you may do, using roles, scopes or policies. Authentication always comes first: failing it returns 401, failing authorisation returns 403. Add accounting, the audit log, and you have AAA.',
      k: ['authentication', 'authorisation', '401 Unauthorized', '403 Forbidden', 'AAA', 'ClaimsPrincipal', 'resource-based authorisation'],
      p: ['AuthN first, then AuthZ.', 'AuthN failure = 401; AuthZ failure = 403.', 'AAA: Authentication, Authorization, Accounting (audit).', 'Resource-based checks run after you load the record.'],
      f: [['A logged-in user calls an admin-only endpoint. 401 or 403?', '403 Forbidden. They are authenticated, so we know who they are, but they are not authorised for that action. 401 means we do not know who they are.'],
          ['How does ASP.NET Core split AuthN and AuthZ?', 'Authentication handlers (JwtBearer, OpenIdConnect, Certificate, cookies) build the ClaimsPrincipal. Authorization policies and IAuthorizationService then decide if that principal may do the action.']],
      q: [{ q: 'An API receives a request with an expired bearer token. What should it return?', o: ['403 Forbidden', '404 Not Found', '401 Unauthorized', '500 Internal Server Error'], a: 2, e: 'An invalid or expired token means the caller is not authenticated, so 401. 403 is for a known caller who lacks permission.' }]
    },
    iam: {
      say: 'IAM makes sure the right identities get the right access to the right resources at the right time. It covers human and non-human identities, authentication, authorisation models like RBAC and ABAC, the joiner-mover-leaver lifecycle, privileged access and federation. The core rule is least privilege, and in the cloud prefer managed identities over secrets.',
      k: ['least privilege', 'RBAC / ABAC / ReBAC', 'joiner-mover-leaver', 'SCIM', 'PIM / just-in-time', 'managed identity', 'access reviews', 'federation'],
      p: ['Least privilege: minimum access, for the minimum time.', 'Prefer managed identities over secrets for service-to-service.', 'De-provision leavers immediately; orphaned accounts are a top audit finding.', 'Azure scope: management group > subscription > resource group > resource. Assign at the lowest scope that works.'],
      f: [['RBAC vs ABAC?', 'RBAC grants access by role: simple, but leads to role explosion. ABAC uses attributes and context like dept=Finance AND region=AU: fine-grained and flexible, but harder to govern.'],
          ['What does a managed identity solve?', 'It removes credentials from code and config. The cloud platform issues and rotates tokens for the workload automatically.'],
          ['What is PIM / just-in-time access?', 'Admins hold no standing privilege. They request time-bound elevation with approval, sessions can be recorded, and break-glass accounts cover emergencies.'],
          ['Name three IGA controls an auditor will ask about.', 'A joiner-mover-leaver process with automated provisioning (SCIM), periodic access reviews or recertification, and segregation of duties.']],
      q: [{ q: 'A document app should let only the owner of a doc and people they shared it with edit it. Which model fits best?', o: ['ReBAC', 'RBAC', 'ACL-free network rules', 'Basic authentication'], a: 0, e: 'Relationship-based access control decides from relationships like "owner of" or "shared with", which roles alone cannot express well.' },
          { q: 'What is the preferred way for an Azure-hosted API to reach Key Vault?', o: ['A client secret in appsettings.json', 'An API key in an environment variable', 'A shared admin account', 'A managed identity'], a: 3, e: 'A managed identity has no secret to leak or rotate; the platform issues tokens for the workload.' }]
    },
    sso: {
      say: 'SAML and OpenID Connect log users in; OAuth 2.0 grants an app delegated access to an API. SAML uses XML assertions and suits legacy enterprise web SSO. OIDC adds a JWT ID token on top of OAuth 2.0 and is the modern choice for web, mobile and SPAs.',
      k: ['SAML 2.0', 'XML assertion', 'OAuth 2.0', 'access token', 'OpenID Connect', 'ID token', 'delegated access', 'federation'],
      p: ['OAuth 2.0 is authorisation, not login.', 'OIDC = authentication on top of OAuth 2.0 (ID token + access token).', 'SAML is poor for mobile and SPAs.', 'ASP.NET Core has no built-in SAML handler: often let Entra ID federate SAML and speak OIDC only.'],
      f: [['Why is "login with OAuth 2.0" technically wrong?', 'OAuth 2.0 only grants an app access to an API; it says nothing standard about who the user is. OIDC adds the ID token that carries the user identity.'],
          ['When would you still use SAML?', 'For enterprise web SSO with legacy SaaS apps or IdPs that only speak SAML. For new apps, prefer OIDC.']],
      q: [{ q: 'A new mobile app needs users to sign in and then call the bank API. Which protocol fits?', o: ['SAML 2.0 only', 'OpenID Connect (with OAuth 2.0 access tokens)', 'Basic auth over HTTPS', 'WS-Federation'], a: 1, e: 'OIDC gives an ID token for login and an OAuth 2.0 access token for the API, and it works well on mobile.' }]
    },
    keys: {
      say: 'Symmetric encryption uses one shared key: very fast, like AES-GCM, but sharing the key safely is the problem. Asymmetric uses a public and private key pair: slow, but solves key exchange and enables signatures. TLS combines them: asymmetric to agree a session key, symmetric to encrypt the data.',
      k: ['AES-GCM', 'RSA / ECC', 'public / private key', 'digital signature', 'hybrid encryption', 'ECDHE', 'RS256 vs HS256', 'ML-KEM'],
      p: ['Encrypt with the receiver\'s public key; sign with the sender\'s private key.', 'Asymmetric is roughly 100-1000x slower; use it for key exchange and signing.', 'JWT HS256 = shared secret; RS256/ES256 = API only needs the public key (better).', 'Post-quantum work (ML-KEM) is mostly about asymmetric algorithms.'],
      f: [['Why does TLS use both symmetric and asymmetric crypto?', 'Asymmetric (ECDHE) safely agrees a session key over an open network; symmetric (AES-GCM) then encrypts the bulk data fast. Best of both.'],
          ['Why prefer RS256 over HS256 for JWTs?', 'With RS256 the API validates with the public key only, so it cannot forge tokens. With HS256 every validator holds the shared secret that can also sign.'],
          ['Which key do you use to sign, and which to verify?', 'Sign with the sender\'s private key; anyone verifies with the sender\'s public key.']],
      q: [{ q: 'Alice wants to send Bob a message only Bob can read. Which key does she encrypt with?', o: ['Alice\'s private key', 'Bob\'s private key', 'Bob\'s public key', 'Alice\'s public key'], a: 2, e: 'What Bob\'s public key locks, only Bob\'s private key can unlock.' },
          { q: 'Which is a symmetric algorithm suitable for bulk data?', o: ['AES-256-GCM', 'ECDSA P-256', 'RSA-2048', 'Ed25519'], a: 0, e: 'AES-GCM is symmetric authenticated encryption; the others are asymmetric.' }]
    },
    hashing: {
      say: 'Encoding like Base64 is just formatting, anyone can reverse it. Encryption is reversible with a key and gives confidentiality. Hashing is one-way, for integrity and password storage with a slow salted hash. Tokenisation swaps sensitive data such as a card number for a meaningless token, which cuts PCI DSS scope.',
      k: ['encoding (Base64)', 'encryption', 'hashing', 'salt', 'bcrypt / Argon2', 'HMAC', 'tokenisation', 'masking'],
      p: ['Base64 is not security.', 'Passwords: slow, salted hash (bcrypt, scrypt, Argon2, PBKDF2), never plain SHA-256.', 'HMAC = integrity + authenticity with a shared secret (webhooks); compare in constant time.', 'Tokenisation: only the vault can map the token back.'],
      f: [['Why not encrypt passwords instead of hashing them?', 'Encrypted passwords can be decrypted if the key leaks. Slow, salted hashes cannot be reversed and make brute force expensive.'],
          ['How do you verify a webhook really came from the provider?', 'Check its HMAC-SHA256 signature with the shared secret, comparing with a constant-time function such as FixedTimeEquals.'],
          ['How does tokenisation reduce PCI DSS scope?', 'Your systems store only a meaningless token; the real card number lives in the token vault, so far fewer systems handle card data.']],
      q: [{ q: 'Which transform should you use to store user passwords?', o: ['AES-256 encryption', 'Base64 encoding', 'Plain SHA-256', 'Argon2 or bcrypt with a salt'], a: 3, e: 'Password storage needs a one-way, deliberately slow, salted hash. Fast SHA-256 is easy to brute force.' }]
    },
    tls: {
      say: 'TLS encrypts data in transit and proves the server\'s identity with a certificate that chains up to a trusted root CA. mTLS makes the client present a certificate too, which is common for B2B, open banking and service meshes. Use TLS 1.2 or higher, prefer 1.3, and automate certificate renewal.',
      k: ['TLS 1.3', 'mTLS', 'chain of trust', 'root CA', 'intermediate CA', 'leaf certificate', 'certificate rotation'],
      p: ['TLS 1.2+ (prefer 1.3); disable old ciphers.', 'Certificate expiry causes many outages: automate renewal and monitor expiry.', 'Behind a load balancer the client cert may arrive in a header: AddCertificateForwarding.'],
      f: [['TLS vs mTLS?', 'TLS: only the server proves its identity. mTLS: both sides present certificates, so the server also knows which client is calling.'],
          ['How do you stop certificate-expiry outages?', 'Automate issuance and renewal (Key Vault, cert-manager, ACME) and alert on expiry dates well in advance.']],
      q: [{ q: 'A partner bank must prove its identity at the transport layer when calling your API. What do you use?', o: ['Server-side TLS only', 'Mutual TLS (client certificates)', 'Base64 headers', 'CORS'], a: 1, e: 'mTLS requires the client to present a certificate the server validates.' }]
    },
    secrets: {
      say: 'Never hard-code secrets. Keep them in a vault such as Key Vault or HashiCorp Vault, access them by identity, rotate them automatically and audit every use. For data, envelope encryption uses a data key to encrypt the data and a key-encryption key in an HSM to encrypt that data key.',
      k: ['Key Vault', 'HSM', 'envelope encryption', 'DEK / KEK', 'CMK / BYOK', 'rotation', 'secret scanning', 'Always Encrypted'],
      p: ['Protect data at rest, in transit and in use.', 'HSM keys never leave the hardware (FIPS 140-2/3).', 'dotnet user-secrets is for local development only.', 'Scan repos for leaked secrets (GitHub secret scanning, Gitleaks).'],
      f: [['Explain envelope encryption.', 'Data is encrypted with a data encryption key (DEK). The DEK is encrypted (wrapped) by a key encryption key (KEK) kept in an HSM or Key Vault. Rotating the KEK only rewraps DEKs, not all the data.'],
          ['What are the three data protection states?', 'At rest (disk, TDE, blob encryption), in transit (TLS/mTLS everywhere, including internal), and in use (confidential computing, column-level encryption).']],
      q: [{ q: 'In envelope encryption, what protects the data encryption key?', o: ['The user\'s password', 'Base64 encoding', 'A key encryption key held in an HSM or vault', 'A TLS certificate'], a: 2, e: 'The DEK is wrapped by a KEK that never leaves the HSM or Key Vault.' }]
    },
    zerotrust: {
      say: 'Zero Trust means never trust, always verify: being inside the network does not make you trusted. Three principles: verify explicitly on every request using identity, device and risk; least privilege with just-in-time access; and assume breach, so segment, encrypt everything and monitor to limit the blast radius.',
      k: ['never trust, always verify', 'verify explicitly', 'least privilege', 'assume breach', 'micro-segmentation', 'blast radius', 'workload identity'],
      p: ['Every service validates the token on every call, even internal ones.', 'Just-in-time, just-enough, time-bound access.', 'mTLS between services, or let a service mesh do it.'],
      f: [['Name the three Zero Trust principles.', 'Verify explicitly, use least privilege access, and assume breach.'],
          ['What does "assume breach" change in your design?', 'Micro-segment the network, encrypt internal traffic, log and trace every access, and limit the blast radius so one compromised service cannot reach everything.']],
      q: [{ q: 'Which practice breaks Zero Trust?', o: ['Skipping auth for calls from inside the VNet', 'Validating tokens on internal service calls', 'Time-bound admin access', 'mTLS between services'], a: 0, e: 'Zero Trust gives no implicit trust to network location; internal calls are verified too.' }]
    },
    owasp: {
      say: 'The OWASP API Security Top 10 from 2023 lists the most critical API risks. Number one is Broken Object Level Authorization: change an id in the URL and see someone else\'s data, so check ownership on every object. Others include broken authentication, mass assignment, unrestricted resource consumption, function-level authorisation and SSRF.',
      k: ['BOLA', 'broken authentication', 'mass assignment', 'rate limiting', 'BFLA', 'SSRF', 'API inventory'],
      p: ['API1 BOLA: check ownership of each record, not just the role.', 'API3: never bind straight to EF entities; use DTOs and allowlist fields.', 'API4: rate limits, quotas, payload caps, paging caps.', 'API7 SSRF: fixed base addresses and host allow-lists; never fetch a user-supplied URL.'],
      f: [['What is BOLA and how do you fix it?', 'Broken Object Level Authorization: changing /accounts/42 to /43 returns someone else\'s data. Load the record and check the caller owns it, e.g. with IAuthorizationService.AuthorizeAsync(user, resource, policy).'],
          ['BOLA vs BFLA?', 'BOLA is about which object you can touch (someone else\'s account). BFLA is about which function you can call (a normal user hitting an admin endpoint).'],
          ['What is SSRF in an API?', 'The API fetches a URL supplied by the attacker, letting them reach internal services. Validate and allowlist destinations.']],
      q: [{ q: 'A user edits the JSON body to add "isAdmin": true and the API saves it. Which OWASP API risk is this?', o: ['BOLA', 'Improper Inventory Management', 'SSRF', 'Broken Object Property Level Authorization (mass assignment)'], a: 3, e: 'API3 covers exposing or allowing edits to fields the caller should not touch. Allowlist fields with DTOs.' },
          { q: 'Forgotten v1 endpoints are still live and unpatched. Which risk is this?', o: ['Unsafe Consumption of APIs', 'Improper Inventory Management', 'Broken Authentication', 'Unrestricted Resource Consumption'], a: 1, e: 'API9: keep an inventory of APIs and retire old versions.' }]
    },
    devsecops: {
      say: 'DevSecOps builds security checks into every delivery step: SAST, SCA, secret, IaC and container scanning, plus DAST on the running app. Supply chain security proves that what runs is what you built: generate an SBOM, sign builds and images, follow SLSA levels, and block dependency confusion. Gate on severity with time-boxed exceptions.',
      k: ['SAST / DAST', 'SCA', 'SBOM (SPDX, CycloneDX)', 'signed artifacts (cosign)', 'SLSA', 'dependency confusion', 'package source mapping', 'shift left'],
      p: ['Shift left to catch issues cheaply; shift right for what only shows in production.', 'An SBOM is only useful if you store it and re-scan it when new CVEs land.', 'net10.0 projects audit transitive packages by default (NuGetAuditMode=all).', 'Pipelines use OIDC workload identity federation, not long-lived cloud secrets.'],
      f: [['What is an SBOM and why does it matter?', 'A machine-readable list of every component and version in a build, in SPDX or CycloneDX. When a new CVE lands you can find affected systems in minutes, not weeks.'],
          ['What is dependency confusion and how do you prevent it in .NET?', 'An attacker publishes a public package with your internal name, often a higher version. Use NuGet package source mapping, commit lock files and restore with --locked-mode, and reserve your ID prefix.'],
          ['SAST vs DAST vs SCA?', 'SAST scans your source code, DAST attacks the running app from outside, and SCA finds known CVEs and licence issues in third-party packages, including transitive ones.'],
          ['What do the SLSA build levels mean?', 'L1: provenance exists. L2: signed provenance from a hosted build platform. L3: a hardened, isolated build platform.']],
      q: [{ q: 'Which control lets the cluster refuse images your pipeline did not produce?', o: ['SAST', 'DAST', 'Signed images verified at deploy (e.g. cosign or Notation)', 'An SBOM stored in a wiki'], a: 2, e: 'Signing artifacts in the pipeline and verifying signatures at admission blocks anything not built by you.' },
          { q: 'Your build pulls a public package that shares a name with an internal one. What stops this in NuGet?', o: ['Package source mapping in nuget.config', 'TreatWarningsAsErrors', 'A larger build agent', 'DAST scanning'], a: 0, e: 'Source mapping makes internal prefixes resolve only from the internal feed.' }]
    }
  }
};
