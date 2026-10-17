/* Quick-revision data for 21-cloud-cheat-sheet.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['21'] = {
  approach: [
    ['Name the capability first', 'Say what the building block does (object storage, L7 load balancer, workload identity) before any product name.'],
    ['Map it across the three clouds', 'Azure, AWS, GCP names, and say where there is no exact twin (e.g. Service Bus).'],
    ['Call out the real differences', 'Regional vs global VPC, zone pairing, archive read times, pricing units. Names match, behaviour differs.'],
    ['Cover security', 'Identity for code (managed identity, IAM role, service account), private endpoints, no public access, least privilege.'],
    ['Cover cost', 'On-demand vs commit vs spot, egress, minimum storage days, log ingestion, idle clusters.'],
    ['State the pattern and lock-in', 'Most managed option that fits; portable tech (containers, PostgreSQL, Kafka, OpenTelemetry, Terraform) keeps an exit.'],
    ['Show the .NET side', 'SDK package per cloud, credentials from the default chain, Aspire integrations, OpenTelemetry once.']
  ],
  traps: [
    'Using retired names (Azure AD, Cognitive Services, Cloud Functions, Container Registry) without knowing the new ones.',
    'Assuming "S3 = Blob = Cloud Storage" means identical limits, consistency and pricing.',
    'Storing access keys or connection strings instead of using workload identity.',
    'Ignoring egress and cross-region traffic in multi-cloud designs.',
    'Going multi-cloud with no clear reason or splitting one app across clouds.'
  ],
  sections: {
    howto: {
      say: 'Four ideas make any cloud easier to read: shared responsibility, where the provider secures the hardware and you always own data, identities and config; regions and zones; pricing models of on-demand, commitments and spot; and the identity model, where each cloud has a directory, a resource hierarchy, role-based access and guardrails.',
      k: ['shared responsibility', 'region', 'availability zone', 'paired region', 'on-demand', 'committed use', 'spot', 'resource hierarchy'],
      p: ['Production uses at least 2 zones.', 'Zone names map per subscription/account; AWS AZ IDs are fixed.', 'Billing boundary: subscription / account / project.', 'Data in is mostly free; data out is billed per GB.'],
      f: [
        ['What do you always own under shared responsibility?', 'Your data, your identities and access rules, and your configuration. The more managed the service, the more the provider patches for you.'],
        ['How do the three clouds organise resources?', 'Azure: management groups, subscriptions, resource groups. AWS: Organizations, OUs, accounts. GCP: organization, folders, projects.'],
        ['When do you use on-demand, commitments and spot?', 'On-demand for new or spiky load, 1- or 3-year commitments for the proven steady baseline, spot for work that can restart.']
      ],
      q: [{ q: 'Which statement about private network scope is correct?', o: ['Azure VNets are global', 'GCP VPCs are global with regional subnets', 'AWS VPCs are global', 'All three are zonal'], a: 1, e: 'A GCP VPC spans regions; Azure VNets and AWS VPCs are regional.' }]
    },
    compute: {
      say: 'Compute ranges from VMs, where you own the OS, through scale sets, PaaS web apps and batch, down to functions that run per event. I pick the most managed option that fits: functions for events, containers for services, and VMs only when I must, such as lift-and-shift or a custom OS. Spot VMs give up to about 90% off but can be reclaimed.',
      k: ['Virtual Machines / EC2 / Compute Engine', 'scale sets / auto scaling groups', 'App Service', 'Azure Functions / Lambda', 'Cloud Run functions', 'Spot VMs', 'cold start', 'Flex Consumption'],
      p: ['Spot notice: Azure ~30 s, AWS 2 min, GCP ~30 s; checkpoint work.', 'Functions can cost more than containers at high steady volume.', 'Google Cloud Functions is now Cloud Run functions.', 'Function triggers and bindings lock you in; VMs and containers move easily.'],
      f: [
        ['When would you choose functions over containers?', 'For event handlers, glue code and spiky loads. At high, steady volume containers are often cheaper, and functions have cold starts and run-time limits.'],
        ['How do you run .NET 10 if a managed function runtime lags behind?', 'Ship a container image; Lambda, Container Apps and Cloud Run all accept one.'],
        ['How do you secure VM admin access?', 'No public IP unless needed, a managed identity or role for the VM, and a bastion or session manager instead of open RDP/SSH.']
      ],
      q: [{ q: 'An overnight risk simulation can restart if interrupted. Which compute option is cheapest?', o: ['Spot VMs with checkpointing', 'On-demand VMs', 'A reserved premium App Service plan', 'Dedicated hosts'], a: 0, e: 'Spot capacity is deeply discounted and suits restartable batch work, as long as it checkpoints.' }]
    },
    containers: {
      say: 'Containers package the app with its runtime. I start with serverless containers such as Container Apps, Fargate or Cloud Run, which run an image, scale and serve HTTPS. I move to managed Kubernetes (AKS, EKS, GKE) when I need custom networking, operators, or dozens of services under one platform team. The image is portable; platform config is not.',
      k: ['AKS / EKS / GKE', 'Container Apps', 'Fargate', 'Cloud Run', 'scale to zero', 'container registry', 'workload identity', 'service mesh'],
      p: ['Container Apps and Cloud Run can scale to zero; Fargate bills per running task.', 'Pull only from a private registry, run as non-root.', 'Registry in the same region as the runtime to avoid egress.', 'dotnet publish /t:PublishContainer builds an image with no Dockerfile.'],
      f: [
        ['When do you choose Kubernetes over serverless containers?', 'When you need custom networking, operators or many services run by a platform team. Otherwise serverless containers need far less ops.'],
        ['What does managed Kubernetes still leave to you?', 'Upgrades, policies, add-ons and workloads. The cloud runs the control plane; hands-off modes like GKE Autopilot also manage nodes.'],
        ['What is the GCP replacement for Container Registry?', 'Artifact Registry. Container Registry shut down in March 2025.']
      ],
      q: [{ q: 'An internal API gets bursty traffic with long idle periods. Which platform fits best?', o: ['A dedicated AKS cluster', 'A fixed pool of VMs', 'Bare-metal servers', 'A serverless container platform that scales to zero'], a: 3, e: 'Container Apps or Cloud Run scale to zero, so you pay little when idle.' }]
    },
    storage: {
      say: 'Object storage (Blob, S3, Cloud Storage) holds files and data lakes over HTTPS; block storage is a VM disk; file shares serve apps that need a mounted drive; archive is very cheap for records you rarely read. Block public access, share with short-lived signed URLs, and use lifecycle rules, remembering that colder tiers have minimum stays and read fees.',
      k: ['Blob / S3 / Cloud Storage', 'block storage', 'file share (SMB/NFS)', 'archive tier', 'lifecycle rules', 'signed URL / SAS', 'egress', 'customer-managed keys'],
      p: ['Archive minimum stay: 180 / 180 / 365 days (Azure / AWS / GCP).', 'Azure and AWS archive reads take hours; GCP is instant but costs more per GB.', 'Block storage is zonal: copy snapshots to another zone or region.', 'Immutable backup vaults in a separate account protect against ransomware.'],
      f: [
        ['How do you share a private file safely?', 'A short-lived signed URL: user delegation SAS on Azure, S3 presigned URL, or V4 signed URL on GCP. Keep public access off.'],
        ['Why can a cheap archive tier get expensive?', 'Retrieval and egress are billed per GB, early deletion before the minimum stay is charged, and reads can take hours.'],
        ['When do you need customer-managed keys?', 'When policy says you must control the key. All three encrypt at rest by default.']
      ],
      q: [{ q: 'Which archive class has a 365-day minimum storage duration?', o: ['Azure Blob Archive', 'S3 Glacier Deep Archive', 'GCP Cloud Storage Archive', 'Azure Files premium'], a: 2, e: 'GCP Archive has a 365-day minimum; Azure Archive and S3 Glacier Deep Archive have 180 days.' }]
    },
    network: {
      say: 'Networking covers private networks, private access to PaaS, DNS, layer 4 and layer 7 load balancers, a global edge with CDN and WAF, firewalls and hybrid links. The pattern is one public door at the edge with WAF, everything else private behind private endpoints, in a hub-and-spoke layout. The big difference: GCP VPCs are global, Azure and AWS are regional.',
      k: ['VNet / VPC', 'hub-and-spoke', 'Private Link / PrivateLink / Private Service Connect', 'L4 vs L7 load balancer', 'Front Door / CloudFront', 'WAF', 'ExpressRoute / Direct Connect', 'forwarded headers'],
      p: ['Peering is not transitive.', 'Private endpoints need private DNS zones.', 'NAT, private endpoints, firewalls and cross-region traffic bill per hour and GB.', 'Trust X-Forwarded-For only from your proxy addresses.'],
      f: [
        ['L4 or L7 load balancer?', 'L4 spreads TCP/UDP connections, for non-HTTP or very high throughput. L7 routes HTTP by host and path, ends TLS, and can host a WAF.'],
        ['How do you reach a managed database without public access?', 'A private endpoint: Private Link on Azure, an interface VPC endpoint on AWS, Private Service Connect on GCP, plus private DNS.'],
        ['What does the app need behind a load balancer?', 'UseForwardedHeaders to read the real client IP and scheme (trusting only known proxies) and a health endpoint for probes.']
      ],
      q: [{ q: 'You peer VNet A to B and B to C. Can A reach C through B by default?', o: ['Yes, peering is transitive', 'No, peering is not transitive; use a hub with routing', 'Only over the internet', 'Only if all are in one zone'], a: 1, e: 'Peering is not transitive, so hub-and-spoke designs use a hub firewall, Virtual WAN or Transit Gateway.' }]
    },
    databases: {
      say: 'Managed databases handle patching, backups and failover. I choose by data shape and access pattern: managed SQL Server for existing .NET apps, PostgreSQL as the most portable engine, Cosmos DB, DynamoDB or Firestore for document and key-value at scale, Spanner for global consistent SQL, and Redis as a cache, never the source of truth.',
      k: ['Azure SQL / RDS / Cloud SQL', 'PostgreSQL', 'Cosmos DB / DynamoDB / Firestore', 'Spanner', 'partition key', 'Bigtable', 'Azure Managed Redis', 'IAM database auth'],
      p: ['Design the NoSQL partition key for your queries first.', 'Zone-redundant HA roughly doubles compute cost.', 'Cloud-native NoSQL ties your data model to one cloud.', 'Use identity-based auth, not SQL passwords.'],
      f: [
        ['What is the GCP match for DynamoDB or Cosmos DB for a server app?', 'Firestore for documents, or Bigtable for wide-column. Firebase Realtime Database is mainly a mobile/web sync store.'],
        ['Which engine is most portable across clouds and why?', 'PostgreSQL: every cloud offers a managed version and EF Core works the same through Npgsql.'],
        ['How do you connect to RDS without a password?', 'Generate a short-lived IAM auth token (RDSAuthTokenGenerator) and use it as the password.']
      ],
      q: [{ q: 'You need relational, strongly consistent data with writes across regions on GCP. Which service?', o: ['Spanner', 'Bigtable', 'Firestore', 'Memorystore'], a: 0, e: 'Spanner is globally distributed SQL; the AWS counterparts are Aurora DSQL and Aurora Global Database.' }]
    },
    analytics: {
      say: 'Analytics moves operational data into a lake and a warehouse, processes it in batch or as a stream, and serves dashboards. Stream ingestion (Event Hubs, Kinesis, Pub/Sub) and stream processing (Stream Analytics, Flink, Dataflow) are separate jobs. Scan-based pricing punishes SELECT *, so partition, use Parquet, and keep medallion layers in open formats.',
      k: ['data warehouse', 'data lake', 'BigQuery / Redshift / Fabric', 'Athena', 'Spark / Databricks', 'Event Hubs / Kinesis / Pub/Sub', 'Flink / Dataflow', 'medallion (bronze, silver, gold)'],
      p: ['Partition by key to keep order; retention = how far back you can replay.', 'Plan for late and duplicate events.', 'Mask or tokenise card numbers before they reach the lake.', 'Idle Spark clusters burn money: serverless or auto-terminate.'],
      f: [
        ['Why separate stream ingestion from stream processing?', 'Ingestion is a durable ordered log; processing computes windows and aggregates. Different services do each.'],
        ['How do you cut cost on per-scan engines like Athena or BigQuery?', 'Store Parquet, partition and cluster tables, avoid SELECT *, and set budgets or quotas per team.'],
        ['How does .NET usually fit with Spark?', '.NET for Apache Spark is no longer maintained, so .NET apps produce the events and query the results while jobs run in Python, Scala or SQL.']
      ],
      q: [{ q: 'Which service is a stream processing engine rather than an ingestion log?', o: ['Kinesis Data Streams', 'Event Hubs', 'Pub/Sub', 'Managed Service for Apache Flink'], a: 3, e: 'Flink computes over data in motion; the other three are durable event logs for ingestion.' }]
    },
    messaging: {
      say: 'Messaging lets services work without waiting on each other: queues for commands, topics for fan-out, event routers for "something happened", and workflow engines for multi-step processes. Delivery is at-least-once, so workers must be idempotent, and every queue needs a dead-letter queue with an alert. Service Bus has no exact twin on AWS or GCP.',
      k: ['queue', 'topic / pub-sub', 'Service Bus', 'SQS / SNS', 'Pub/Sub', 'Event Grid / EventBridge / Eventarc', 'dead-letter queue', 'CloudEvents'],
      p: ['Queue for commands, topic for events, workflow engine for long processes.', 'Use identities and data roles, not connection strings.', 'Batching, long polling and subscription filters cut the bill.', 'Kafka and CloudEvents travel between clouds best.'],
      f: [
        ['What is the AWS or GCP equivalent of Azure Service Bus?', 'No exact twin. AWS: SQS (FIFO for order) plus SNS, or Amazon MQ for AMQP/JMS. GCP: Pub/Sub with ordering keys and dead-letter topics, or Cloud Tasks.'],
        ['What is the GCP match for a plain work queue?', 'Cloud Tasks or a Pub/Sub pull subscription. Firebase Cloud Messaging is mobile push.'],
        ['Why make queue consumers idempotent?', 'Delivery is at-least-once, so the same message can arrive twice.']
      ],
      q: [{ q: 'A blob upload should trigger three different handlers. Which building block fits?', o: ['A simple queue with one consumer', 'A workflow engine only', 'An event router or topic with several subscriptions', 'A cron job polling storage'], a: 2, e: 'Event Grid, EventBridge or Eventarc route one event to many subscribers.' }]
    },
    ai: {
      say: 'Cloud AI has three layers: an ML platform to train and serve your own models, a foundation models API for hosted LLMs and embeddings, and prebuilt AI for documents, speech and vision, plus agent runtimes, retrieval search and safety guardrails. The pattern is identity, retrieve, guardrail, model, guardrail, with a thin IChatClient layer so you can switch models.',
      k: ['Azure Machine Learning / SageMaker AI', 'foundation models', 'Azure OpenAI / Bedrock', 'Azure AI Search', 'RAG', 'content safety guardrails', 'IChatClient', 'data residency'],
      p: ['Tokens are the new egress: cache, trim context, route to smaller models.', 'Index only what users may see; trim per user.', 'Not every model is in every region; check residency.', 'Check guardrails on both input and output.'],
      f: [
        ['Why put IChatClient between your code and the model?', 'It is one interface (Microsoft.Extensions.AI) over any provider, so you can switch models or clouds; evaluate before you switch.'],
        ['How do you control GenAI cost?', 'Cache answers, trim context, route easy questions to smaller models and set budgets per app.'],
        ['What are the AWS services for foundation models and guardrails?', 'Amazon Bedrock for models, Bedrock Guardrails for safety, and Bedrock AgentCore for agents.']
      ],
      q: [{ q: 'Which is the recommended order of a safe GenAI request?', o: ['Model, then retrieve, then identity', 'Identity, retrieve, guardrail, model, guardrail', 'Guardrail only on the output', 'Retrieve everything, then filter in the prompt'], a: 1, e: 'Authenticate, retrieve only permitted content, check input, call the model, then check output.' }]
    },
    identity: {
      say: 'Identity covers who can do what. Staff sign in through one directory such as Entra ID, each cloud keeps its own permission model (Azure RBAC, AWS IAM, Cloud IAM), and code uses workload identity, not secrets. CI uses OIDC federation, the few real secrets live in a vault with rotation, and audit logs go to a separate locked-down account.',
      k: ['Entra ID', 'Azure RBAC / AWS IAM / Cloud IAM', 'managed identity', 'IAM role', 'service account', 'OIDC federation', 'KMS / Key Vault', 'least privilege'],
      p: ['Leaked keys are the most common breach: no long-lived access keys.', 'Pin federation to repo, branch and environment claims.', 'Separate key admins from data admins.', 'In production prefer a specific credential (ManagedIdentityCredential) over DefaultAzureCredential.'],
      f: [
        ['How does an app call cloud APIs without storing a secret?', 'Workload identity: managed identity on Azure, IAM role on AWS, attached service account on GCP. The SDK gets a short-lived token from the platform.'],
        ['How should a GitHub Actions pipeline log in to a cloud?', 'OIDC federation: swap the pipeline\'s token for short-lived cloud credentials, pinned to repo and branch claims. No stored keys.'],
        ['Is Entra ID the equivalent of AWS IAM?', 'No. Entra ID is a directory for people; the permission systems are Azure RBAC, AWS IAM and Cloud IAM.']
      ],
      q: [{ q: 'Why is DefaultAzureCredential discouraged in production?', o: ['It can silently pick up the wrong identity from its chain', 'It is slower than storing keys', 'It does not support managed identity', 'It only works on Windows'], a: 0, e: 'It tries several sources in turn; a specific credential like ManagedIdentityCredential is predictable.' }]
    },
    monitoring: {
      say: 'Monitoring means metrics and alerts, logs, and distributed tracing, plus infrastructure as code, policy guardrails and cost management. I instrument once with OpenTelemetry and export to any backend, alert on symptoms like errors and latency, deploy everything from IaC with policy checks, and tag every resource for cost. Log ingestion is often the biggest bill.',
      k: ['Azure Monitor / CloudWatch / Cloud Monitoring', 'Log Analytics (KQL)', 'Application Insights / X-Ray', 'OpenTelemetry', 'Bicep / CloudFormation / Terraform', 'Azure Policy', 'budgets', 'tagging'],
      p: ['Alert on symptoms, not every CPU blip.', 'Never log PII or card data; sample and set retention.', 'Policies start in audit mode, then deny.', 'Deployment Manager is retired: use Infrastructure Manager or Terraform.'],
      f: [
        ['Why instrument with OpenTelemetry?', 'Instrument once and export over OTLP to Application Insights, CloudWatch, Cloud Trace or any collector, so switching backends needs no code change.'],
        ['How do you keep log costs down?', 'Sample and filter, use cheaper log tiers for noisy logs, set retention, and keep debug logging off in production.'],
        ['How should a new policy guardrail be rolled out?', 'Start in audit mode to see what breaks, then switch to deny.']
      ],
      q: [{ q: 'Which is usually the best alerting target?', o: ['Every CPU spike above 50%', 'Every log line at warning level', 'Disk usage of dev VMs', 'User-facing symptoms such as error rate and latency'], a: 3, e: 'Symptom-based alerts page people for real impact and reduce noise.' }]
    },
    devops: {
      say: 'DevOps tools cover repositories, CI builds, CD releases with approvals, and package registries. Many teams use one tool such as GitHub Actions or Azure Pipelines across every cloud rather than three native ones. Pipelines log in with OIDC federation, run on least-privilege identities, sign what they publish, and promote the same artifact through every stage.',
      k: ['GitHub Actions / Azure Pipelines', 'CodeBuild / Cloud Build', 'CodePipeline / Cloud Deploy', 'Azure Artifacts / CodeArtifact / Artifact Registry', 'OIDC federation', 'same artifact every stage', 'canary / blue-green', 'secret scanning'],
      p: ['Proxy public package feeds to block typo-squatting.', 'Cache NuGet packages; build minutes add up.', 'Keep native registries close to each runtime.', 'Automated rollback for staged releases.'],
      f: [
        ['Why one CI/CD tool for all clouds?', 'One set of skills, templates and security controls beats three native tools; keep registries near each runtime.'],
        ['Why promote the same artifact through every stage?', 'What you tested is exactly what reaches production; rebuilding per stage can introduce differences.'],
        ['How do you reduce build cost?', 'Cache dependencies, run only affected tests on PRs, and use spot-backed self-hosted runners for heavy builds.']
      ],
      q: [{ q: 'How should a pipeline authenticate to deploy to the cloud?', o: ['A long-lived access key in a variable', 'A shared admin password', 'OIDC federation to short-lived credentials', 'An SSH key committed to the repo'], a: 2, e: 'OIDC federation removes stored keys and scopes access to repo, branch and environment.' }]
    },
    choose: {
      say: 'Most organisations pick one primary cloud, add a second for a specific strength or regulation, and keep some systems on-prem. I choose on skills, regions and residency, key services, compliance and commercials, and plan for exit. Then I build a landing zone before the first workload, and split multi-cloud by workload, not by tier.',
      k: ['landing zone', 'multi-cloud', 'hybrid', 'data gravity', 'egress', 'exit plan', 'Azure Arc', 'concentration risk'],
      p: ['Good reasons: a unique service, a regulatory concern, a real exit plan.', 'Hidden costs: double skills and guardrails, split discounts, egress.', 'Landing zone first: Azure landing zones, AWS Control Tower, GCP enterprise foundations.', 'Portable tech makes an exit plan believable.'],
      f: [
        ['Why is egress so important in multi-cloud?', 'Data leaving a cloud is billed per GB. An app in one cloud reading a database in another pays on every call and adds latency.'],
        ['What goes into a landing zone?', 'Resource hierarchy (subscriptions, accounts or projects), guardrail policies, a network hub, central logging and identity, and a vending process for new environments.'],
        ['Multi-cloud vs hybrid?', 'Multi-cloud uses several public clouds for the best service or leverage; hybrid keeps some systems on-prem, managed from one control plane like Azure Arc.']
      ],
      q: [{ q: 'Which multi-cloud split is usually best?', o: ['Front end in one cloud, database in another', 'Each workload with its data in one cloud', 'Alternate clouds per environment', 'Random by team preference'], a: 1, e: 'Splitting by workload avoids per-call egress and cross-cloud latency.' }]
    },
    finops: {
      say: 'FinOps makes engineering, finance and product share ownership of cloud spend, in a loop: Inform, Optimise, Operate. I start with tagging and showback, track unit cost such as cost per payment, then delete idle resources, rightsize, autoscale, commit to the steady baseline and use spot for restartable work. Budgets and anomaly alerts keep it running.',
      k: ['Inform / Optimise / Operate', 'tagging', 'showback / chargeback', 'unit economics', 'rightsizing', 'commitment discounts', 'spot', 'egress'],
      p: ['No tags, no allocation, no accountability.', 'Rightsize first, then commit only to the proven baseline.', 'Egress and log ingestion are the hidden costs.', 'Budgets alert; they do not stop spend unless you automate it.'],
      f: [['What are the three FinOps phases?', 'Inform (visibility, allocation, unit cost), Optimise (cut waste, buy smarter) and Operate (guardrails, budgets, alerts, regular reviews). It is a loop.'],
          ['Showback vs chargeback?', 'Showback reports cost to teams for awareness; chargeback bills it to their budget. Start with showback until tagging and shared-cost rules are trusted.'],
          ['What is unit economics in FinOps?', 'Cost divided by a business volume, such as cost per 1,000 payments or per active customer. The trend shows whether efficiency improves as you grow.'],
          ['Name the native cost tools on each cloud.', 'Azure: Microsoft Cost Management (cost analysis, budgets, anomaly alerts). AWS: Cost Explorer, AWS Budgets, Cost Anomaly Detection. GCP: Cloud Billing reports, budgets and alerts.']],
      q: [{ q: 'In what order should you usually optimise cloud cost?', o: ['Buy 3-year commitments first, then rightsize', 'Move everything to spot first', 'Delete idle and rightsize, then commit to the baseline', 'Archive all storage first'], a: 2, e: 'Committing before rightsizing locks in waste.' },
          { q: 'Which workload suits spot / preemptible VMs?', o: ['A single primary database', 'Checkpointed batch jobs and CI runners', 'A stateful payment switch', 'The only instance of a login service'], a: 1, e: 'Spot capacity can be reclaimed at short notice, so it fits restartable work.' }]
    }
  }
};
