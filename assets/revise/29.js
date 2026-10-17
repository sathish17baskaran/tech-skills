/* Quick-revision data for 29-role-foundations.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['29'] = {
  approach: [
      ['Name the altitude and horizon', 'Open with where the role sits (enterprise, portfolio, solution, team or codebase) and how far ahead it looks.'],
      ['State what it owns', 'Responsibilities, decisions and artefacts: e.g. an architect owns the solution shape, options and ADRs.'],
      ['Contrast with the nearest role', 'For "how is X different from Y?", compare altitude, primary output and decisions owned, then say where they overlap.'],
      ['Show how success is measured', 'Give outcomes and metrics, not activities: delivery, risk, quality, DORA, people growth.'],
      ['Prove it with one story', 'A short STAR example where you did the role\'s core work, with a number in the result.'],
      ['For 90 days: listen, map, deliver', '30 days learn people, systems and pain points; 60 days a quick win and a plan; 90 days a visible outcome.'],
      ['Tie it to their context', 'Close by linking to the job description and the company\'s likely problems.']
    ],
    traps: [
      'Describing tasks and meetings instead of outcomes and decisions owned.',
      'Treating the roles as a seniority ladder rather than different altitudes and outputs.',
      'Assuming titles mean the same everywhere instead of reading the job description.',
      'A 90-day plan that changes everything in month one before listening.'
    ],
  sections: {
    'compare': {
          say: 'The four roles differ by altitude and time horizon. The solution architect shapes the solution and its trade-offs over months to years. The solution designer turns it into buildable detail. The engineering manager builds and runs a team that delivers. The principal engineer sets the technical bar across teams and still codes. Titles vary, so read the job description.',
          k: ['altitude', 'time horizon', 'primary output', 'decisions owned', 'influence without authority', 'job description', 'staff vs principal'],
          p: ['Architect owns the shape, designer the detail, manager the team, principal the technical bar.', 'Higher altitude means a longer horizon and more influence without authority.', 'Titles vary between companies: read the job description and mirror its words.', 'Tune every story to the role\'s primary output.'],
          f: [
            ['How is a solution architect different from a principal engineer?', 'Architect: solution altitude, options, NFRs, build vs buy, ADRs, business and risk stakeholders. Principal: codebase up, technical approach, quality bar, cross-team standards, still hands-on.'],
            ['How is a solution designer different from a solution architect?', 'Architect decides the <b>shape</b> and trade-offs; designer produces <b>buildable detail</b>: interfaces, data mappings, sequences, edge cases (LLD).'],
            ['How is an engineering manager measured?', 'Team health and delivery: DORA metrics, predictability, retention and engagement, growth of people, and outcomes for the product.'],
            ['What is the difference between a solution and an enterprise architect?', 'Enterprise architects work on the portfolio, capabilities and standards across the organisation; solution architects design one initiative end to end within those standards.'],
            ['What should a principal-engineer candidate emphasise?', 'Technical depth first, then leverage: RFCs, standards, cross-team designs and engineers they levelled up.']
          ],
          q: [
            { q: 'Which role mainly works at team altitude, on people and delivery?', o: ['Engineering manager', 'Solution architect', 'Solution designer', 'Principal engineer'], a: 0, e: 'The engineering manager owns the team: hiring, coaching, priorities and predictable delivery.' },
            { q: 'A job ad says "principal engineer". What should you do first?', o: ['Read the job description for scope and level', 'Assume it is above staff engineer', 'Assume it is a people-management role', 'Prepare only coding questions'], a: 0, e: 'Staff and principal levels are ordered differently between companies, so the job description defines the real scope.' }
          ]
        },
    'solution-architect': {
          say: 'A solution architect turns business strategy into a target state, a roadmap and guardrails that many teams can deliver. I shape the target, decide the big trade-offs (build, buy or reuse, cloud, integration, AI) and record them in ADRs, and I guard NFRs and risk. I lead through evidence and trust, not authority.',
          k: ['target state', 'roadmap', 'NFRs', 'build / buy / reuse', 'ADR', 'TOGAF ADM', 'AI governance', 'influence without authority'],
          p: ['Altitude: portfolio, many teams, 6–36 months.', 'Own decisions and guardrails, not the code.', 'Measured by reuse, NFRs met in production and decision lead time.'],
          f: [
            ['What does a good solution architect do?', 'Starts from the business outcome, then <b>shapes</b> the target state, <b>decides</b> trade-offs with ADRs and <b>guards</b> NFRs and risk across teams, backed by one story with a metric.'],
            ['How do you decide build vs buy vs reuse?', 'Reuse if a platform fits. Buy when it is not a differentiator. Build only for differentiation. Compare total cost, time to value, fit, lock-in and an exit plan.'],
            ['How do you make governance enabling rather than a gate?', 'Paved roads, templates and reference architectures; light reviews scaled to risk; publish ADRs so teams can self-serve decisions.'],
            ['How do you govern GenAI adoption?', 'A use-case gate (value, data classification, risk), evaluation and guardrails, human oversight where needed, cost tracking and a model exit plan. Frameworks: NIST AI RMF, ISO/IEC 42001.'],
            ['What do you do in your first 90 days?', 'Listen to stakeholders, map the baseline and risks, land a few quick-win decisions, then publish a target state, roadmap and light review process.']
          ],
          q: [
            { q: 'Which artefact best records a solution architect\u2019s key trade-off and the options it rejected?', o: ['Architecture decision record (ADR)', 'Field mapping sheet', 'Runbook', 'Sprint backlog'], a: 0, e: 'An ADR captures context, options, the decision and its consequences, so the trade-off survives people changing.' },
            { q: 'What altitude does a solution architect mainly work at?', o: ['Portfolio / solution across many teams', 'A single class or module', 'One sprint for one team', 'Individual code reviews'], a: 0, e: 'The role spans many teams and a multi-year horizon; depth inside one solution is the designer\u2019s job.' }
          ]
        },
    'solution-designer': {
          say: 'A solution designer takes one solution from requirements to a build-ready design. Working with BAs, developers and testers, I produce the HLD and LLD: API contracts, data models and mappings, sequence flows, error handling and security controls, all traced back to requirements. The architect sets direction in breadth; I make it buildable in depth.',
          k: ['HLD / LLD', 'API contract', 'OpenAPI', 'data mapping', 'sequence diagram', 'error handling', 'traceability', 'design review'],
          p: ['Altitude: one solution, in depth, weeks to months.', 'Architect = breadth and strategy; designer = depth and detail.', 'Measured by design defects in SIT, rework and traceability coverage.'],
          f: [
            ['How is a solution designer different from a solution architect?', 'The architect works across many teams on target state, roadmap and strategy. The designer goes deep on one solution: LLD, contracts, data mappings, flows and failure handling.'],
            ['What goes into a good API contract?', 'Resources and operations, request and response schemas, error model (e.g. RFC 9457 problem details), auth scopes, versioning, idempotency keys, pagination and limits.'],
            ['How do you design for failure in an integration?', 'Timeouts, retries with back-off and jitter, idempotent receivers, dead-letter queues, compensation for multi-step flows, and alerts on stuck messages.'],
            ['How do you keep traceability?', 'A matrix linking each requirement to design elements and test cases, kept current through change and checked at design review.'],
            ['How do you work with BAs and testers?', 'Clarify rules with BAs early, write Given/When/Then criteria together, share sequences and contracts with testers before build so SIT cases are ready.']
          ],
          q: [
            { q: 'Which artefact is mainly owned by the solution designer rather than the solution architect?', o: ['Field-level data mapping', 'Multi-year technology roadmap', 'Enterprise capability map', 'Portfolio investment case'], a: 0, e: 'Field mappings are solution-level detail; roadmaps, capability maps and investment cases sit at the architect\u2019s altitude.' },
            { q: 'A design covers only the happy path. What is the most important thing missing?', o: ['Timeouts, retries and compensation', 'A larger context diagram', 'A product logo', 'More user personas'], a: 0, e: 'Interviewers look for unhappy paths: how each call fails, retries and recovers.' }
          ]
        },
    'engineering-manager': {
          say: 'An Engineering Manager builds a team that delivers outcomes sustainably. I own people (hiring, 1:1s, feedback, growth), delivery (priorities, predictability, small batches) and operational health (SLOs, incidents, on-call). I measure team trends with DORA, SPACE and retention, never individual activity, and I succeed through the team, not my own commits.',
          k: ['team & people altitude', '1:1s & feedback', 'hiring & onboarding', 'delivery predictability', 'DORA', 'SPACE', 'Team Topologies', 'psychological safety'],
          p: ['Three pillars: people, delivery, operational health.', 'Use DORA and SPACE as team trends, never to rank teams or people.', 'Adapt your style to the person and task (situational leadership).', 'Protect capacity for tech debt and ops; share bad news early.'],
          f: [
            ['What does a good Engineering Manager do?', 'Builds a team that delivers outcomes sustainably: hires and grows people, keeps delivery predictable with small batches, and keeps the service healthy with SLOs and blameless postmortems.'],
            ['What are the Team Topologies team types and interaction modes?', 'Four types: stream-aligned, platform, enabling, complicated-subsystem. Three modes: collaboration, X-as-a-Service, facilitating. The goal is to limit cognitive load.'],
            ['What does SPACE stand for?', 'Satisfaction and well-being, Performance, Activity, Communication and collaboration, Efficiency and flow (Forsgren et al., 2021). Measure several dimensions, never activity alone.'],
            ['How would you lead adoption of AI coding assistants?', 'Pilot with a volunteer team, set guardrails (data, licences, review rules), measure lead time, quality and developer satisfaction, then scale what works.'],
            ['What do you do in your first 90 days as an EM?', 'Listen first: 1:1s and skip-levels, observe flow, read incidents. Then fix one bottleneck for a quick win, agree priorities, and set OKRs and a hiring plan.']
          ],
          q: [
            { q: 'A director wants to rank teams by deployment frequency. Best EM response?', o: ['Use DORA as team trends with SPACE signals, not a ranking', 'Agree, and add story points to the ranking', 'Rank individuals by commits instead', 'Stop measuring delivery'], a: 0, e: 'Ranking teams on DORA invites gaming. Use the metrics for each team\'s own improvement, read with well-being and flow signals.' },
            { q: 'In situational leadership, a capable but unsure engineer on a new task needs mostly...', o: ['Supporting', 'Directing', 'Delegating', 'Ignoring'], a: 0, e: 'High competence with variable commitment or confidence calls for a supporting style: encourage and involve, with little direction.' }
          ]
        },
    'principal-engineer': {
          say: 'A Principal Engineer is a hands-on technical leader across teams. I set direction through technical strategy and RFCs, take on the hardest performance, reliability and scale problems, set standards through design and code review, and grow senior engineers. I lead by influence, partner with architects and managers, and prove impact with numbers.',
          k: ['codebase & systems altitude', 'technical strategy', 'RFCs / design docs', 'engineering standards', 'staff archetypes', 'multiplier', 'influence without authority'],
          p: ['Three jobs: set direction, solve the hardest problems, multiply others.', 'Influence through RFCs, reviews and prototypes, not authority.', 'Stay hands-on: credibility comes from code and production context.'],
          f: [
            ['What does a good Principal Engineer do?', 'Sets technical direction across teams, solves the hardest problems (performance, reliability, scale), raises standards through review, and makes other engineers better.'],
            ['What are the staff archetypes and who described them?', 'Will Larson, in <i>Staff Engineer</i>: Tech Lead, Architect, Solver and Right Hand.'],
            ['What goes in a good RFC or design doc?', 'Context, goals and non-goals, options with trade-offs, the decision, risks and rollout. Review it openly and record the outcome as an ADR.'],
            ['How do you write a technical strategy?', 'Rumelt\'s kernel: a diagnosis of the real problem, a guiding policy, and coherent actions. Larson suggests synthesising it from several real design docs.'],
            ['How do you split work with an architect and an EM?', 'The architect owns the wider solution and governance, the EM owns people and delivery, and the principal owns technical depth and direction in the codebase.']
          ],
          q: [
            { q: 'Which archetype goes deep on one hard problem at a time, often across teams?', o: ['Solver', 'Tech Lead', 'Right Hand', 'Architect'], a: 0, e: 'In Larson\'s archetypes, the Solver digs into the hardest problems wherever they are; the Tech Lead guides one team\'s execution.' },
            { q: 'The best sign of a principal engineer\'s multiplier effect is...', o: ['Other engineers and teams improve and depend on them less', 'They write the most code', 'They approve every pull request', 'They are paged for every incident'], a: 0, e: 'A multiplier raises everyone\'s output. Being the bottleneck is the opposite.' }
          ]
        },
    'collaboration': {
          say: 'The architect shapes the solution with an HLD and ADRs, the designer details it in an LLD, the principal de-risks the technology and leads the build with the team, and the engineering manager is accountable for delivery and running it. Keep one accountable owner per stage, settle disagreements with an ADR and evidence, and hand off with artefacts plus conversations.',
          k: ['RACI', 'one accountable owner', 'ACD/HLD', 'LLD', 'ADR', 'runbook', 'paved road', 'thin slice'],
          p: ['One A per stage: unclear decision rights cause most friction.', 'Settle technical disagreements with an ADR and a spike, not seniority.', 'Fix scope-vs-date tension by slicing scope, not cutting quality.', 'Handoffs are conversations backed by artefacts.'],
          f: [
            ['Architect and principal engineer disagree on a technology. How do you resolve it?', 'Write both options in an ADR against agreed NFRs, run a time-boxed spike for missing evidence, decide, record consequences; allow a justified exception.'],
            ['The design needs more time than the manager\'s date allows. What do you do?', 'Slice into a thin first release, make the trade-off visible to the product owner, and keep quality and NFRs non-negotiable.'],
            ['How do you balance architecture standards with team autonomy?', 'A paved road (templates, platforms) that is easiest to follow, a few hard guardrails, and exceptions through an ADR.'],
            ['Who is accountable during build, release and run?', 'Usually the engineering manager; the principal and team are responsible, the architect and designer consulted or informed. Confirm locally.'],
            ['Which artefacts pass between the roles?', 'ACD/HLD and NFRs from the architect, LLD from the designer, ADRs from anyone deciding, runbooks from the team before go-live.']
          ],
          q: [
            { q: 'In a RACI, how many people should be Accountable for a stage?', o: ['Exactly one', 'At least two', 'Everyone who is Responsible', 'Nobody, the team shares it'], a: 0, e: 'One accountable owner per stage keeps decision rights clear.' },
            { q: 'Which artefact best settles a technology disagreement between architect and principal?', o: ['An ADR comparing options against NFRs', 'A runbook', 'An LLD sequence diagram', 'A sprint burndown chart'], a: 0, e: 'An ADR records context, options, decision and consequences, so evidence decides rather than rank.' }
          ]
        }
  }
};
