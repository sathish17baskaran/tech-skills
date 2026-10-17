/* Quick-revision data for 25-interview-readiness.html. Schema: see AGENTS.md "Quick revise data". */
(window.REVISE = window.REVISE || {})['25'] = {
  approach: [
    ['Find the round and the hidden question', 'Each round tests something different: fit, depth, design, communication or judgement. Answer what they are really testing.'],
    ['Lead with one crisp sentence', 'Technical: one-line answer, then a trade-off, then an example. Stop and let them pull you deeper.'],
    ['Tell stories with STAR(R)', 'About 2 minutes, most of it on Action, in the first person, with a number in the Result and a Reflection.'],
    ['Design against the clock', 'Requirements, top 3 characteristics, C4 L1-L2 components, 3-4 hard decisions, then an ADR.'],
    ['Present the decision, not the tech', 'Problem, constraints, at least two options, decision and what you gave up, risks named before the panel does.'],
    ['Be honest at your limit', '"I don\'t know, but here is how I\'d find out" beats a confident guess.'],
    ['Close with smart questions', 'Ask how decisions are made, what success looks like at 90 days, and the biggest problem to solve.']
  ],
  traps: [
    'Three minutes of Situation and ten seconds of Action.',
    'Saying "we decided" with no clue what you personally did.',
    'No measurable Result, or a "failure" story where nothing failed.',
    'Running out of time in a kata before reaching the trade-offs.',
    'Presenting one option: that is a sales pitch, not a decision.'
  ],
  sections: {
    format: {
      say: 'An architect hiring loop is 4-7 conversations, each testing something different: recruiter screen, hiring manager, technical deep dive, system design, case presentation, behavioural and a stakeholder panel. Prepare per round, practise out loud and timed, and ask the recruiter for the exact format.',
      k: ['hiring loop', 'technical deep dive', 'system design', 'case presentation', 'stakeholder panel', 'trade-offs', 'communication'],
      p: ['Prepare per round, not "for the interview".', 'Architects are judged on trade-offs and communication as much as technology.', 'Reading is not rehearsing: practise out loud and timed.', 'Be ready to go 3 levels deep on your own projects.'],
      f: [
        ['How do you prepare for the hiring-manager round?', 'Three headline achievements with numbers, and research into their products and strategy, to show scope match and impact.'],
        ['What does the stakeholder panel assess, and how do you prepare?', 'Communication across audiences and risk awareness. Practise explaining one design to a business, a risk and an engineering listener.'],
        ['How does the emphasis differ for a senior engineer vs a solution architect?', 'Senior engineers get more coding, debugging and in-service design. Solution architects get end-to-end design, NFRs, build vs buy, HLDs, ADRs and governance.']
      ],
      q: [
        { q: 'What is the best way to find out what each round will cover?', o: ['Guess from the job title', 'Ask the recruiter for the exact format and panel', 'Read only the company website', 'Wait until the day'], a: 1, e: 'Recruiters will usually share rounds, panel members, any presentation and the key skills.' }
      ]
    },
    star: {
      say: 'Answer "tell me about a time" with STAR(R): Situation and Task in about 30 seconds, Action for about a minute in the first person including the trade-off, a Result with a number or clear before and after, then a Reflection on what you would do differently. About 2 minutes, then stop.',
      k: ['Situation', 'Task', 'Action', 'Result', 'Reflection', 'first person', 'quantify', 'story bank'],
      p: ['Say "I" for your actions; "we" only for the team result.', 'Every Result has a number or a clear before/after.', 'Use recent stories (last 3-5 years) at the level of the role.', 'Keep 8-10 stories, each tagged with the themes it can answer.'],
      f: [
        ['How long should a STAR answer be?', 'About two minutes, mostly Action, ending with a measurable Result and a short Reflection, then stop and let them probe.'],
        ['Why add the Reflection?', 'It shows self-awareness and learning, which is what makes the answer sound senior.'],
        ['What goes in the Action part?', 'Three things I did, the options I weighed, the trade-off I made and who I influenced.'],
        ['Why never borrow someone else\'s story?', 'Interviewers probe, and a second follow-up question exposes it fast.']
      ],
      q: [
        { q: 'Where should most of a STAR answer\'s time go?', o: ['Situation', 'Task', 'Action', 'Reflection'], a: 2, e: 'Action is where your judgement shows; keep Situation and Task to about 30 seconds.' }
      ]
    },
    behavioural: {
      say: 'Behavioural questions test judgement under real conditions: influence, conflict, failure, trade-offs, saying no, leading, mentoring, ambiguity, tech debt, security and vendors. Each has a hidden question behind it, so answer that, and map 8-10 stories so one story covers several themes with a different emphasis.',
      k: ['hidden question', 'influence without authority', 'ownership', 'integrity', 'trade-off', 'psychological safety', 'build vs buy'],
      p: ['Find the hidden question: influence, ownership, judgement or integrity.', 'Failure stories need a real failure, your part in it and what changed after.', 'For security or compliance pressure, the right answer never bypasses the control.', 'One migration story can answer leading, trade-off, ambiguity and influence.'],
      f: [
        ['What is "tell me about a time you changed direction without authority" really testing?', 'Influence through evidence, not rank: understanding their goals, a prototype or data, building allies, and the outcome.'],
        ['What does a strong "said no to the business" answer include?', 'Understanding the real need, offering an alternative and explaining the risk in business terms.'],
        ['How do you get tech debt prioritised?', 'Tie it to cost, risk or speed in business language, fix it in small slices and track the outcome.'],
        ['How should you answer delivery pressure versus a security control?', 'You did not bypass it: you found a compliant path, involved risk early and delivered an outcome.']
      ],
      q: [
        { q: 'What is "tell me about an architecture decision that turned out wrong" really testing?', o: ['Technical breadth', 'Ownership and learning', 'Speed of delivery', 'Knowledge of frameworks'], a: 1, e: 'They want a real mistake, how you noticed and fixed it, and what changed afterwards.' }
      ]
    },
    technical: {
      say: 'Rapid technical questions check breadth; follow-ups check depth. Give a crisp one-line answer, then a trade-off, then an example or when you would use it. Know your own CV at depth, and if you hit your limit, say so and reason out loud.',
      k: ['one-line answer', 'trade-off', 'CAP / PACELC', 'quorum W + R > N', 'idempotency key', 'saga', 'RPO / RTO', 'at-least-once'],
      p: ['Lead with one sentence. Stop. Let them pull you deeper.', 'Interviewers probe until your limit: they test honesty too.', 'Anything on your CV is fair game.'],
      f: [
        ['How does a quorum give consistency?', 'If W + R > N, every read overlaps at least one node that has the latest write.'],
        ['Exactly-once delivery: is it real?', 'Not end to end. Use at-least-once delivery plus idempotent consumers to get effectively-once processing.'],
        ['Why CDC instead of dual writes?', 'CDC reads the database log, so the event and the data cannot disagree; dual writes can half-fail.'],
        ['Does async/await make code faster?', 'No. It frees threads while waiting on I/O, so a server can handle more concurrent requests.'],
        ['RAG or fine-tuning?', 'RAG for fresh or private facts with citations; fine-tuning for style, format or narrow skills.'],
        ['Logs, metrics and traces: why all three?', 'Metrics tell you something is wrong, traces show where, logs explain why.']
      ],
      q: [
        { q: 'Which is the best response to a technical question you cannot answer?', o: ['Give a confident guess', 'Change the subject', 'Say so, then reason out loud about how you would find out', 'Ask to skip it without comment'], a: 2, e: 'Honesty plus a structured approach scores better than a confident wrong answer.' },
        { q: 'What does mTLS add over TLS?', o: ['Faster handshakes', 'The client also presents a certificate, so the server authenticates it', 'Payload compression', 'Encryption at rest'], a: 1, e: 'In mTLS both sides present certificates, giving mutual authentication.' }
      ]
    },
    katas: {
      say: 'An architecture kata is a short timed design exercise from a brief, started by Ted Neward. Clarify requirements, pick the top three characteristics, sketch C4 context and containers, spend real time on three or four hard decisions, and finish with a one-page ADR and a list of risks.',
      k: ['architecture kata', 'top 3 characteristics', 'C4 L1-L2', 'hard decisions', 'ADR', 'time-box', 'assumptions'],
      p: ['Time-box each stage; running out before trade-offs is the most common failure.', '"Everything is important" means nothing is.', 'An ADR shows you can commit, not just list options.', 'State your own assumptions about volumes and rules.'],
      f: [
        ['What are the stages of a kata?', 'Requirements, characteristics (top 3), components (C4 L1-L2), trade-offs, then an ADR with decision and consequences.'],
        ['Name two hard decisions in a real-time payments notification hub.', 'One event model across channels, and at-least-once delivery plus dedupe; also per-channel provider fallback and what is safe in an SMS.'],
        ['Name two hard decisions in a fraud alerting kata.', 'Inline (block) vs async (alert) scoring, and fail-open vs fail-closed; also feature store freshness and false-positive cost.'],
        ['What do you do after finishing a kata?', 'Compare it with the design review checklist and note what you missed.']
      ],
      q: [
        { q: 'What is the most common way to fail an architecture kata?', o: ['Drawing too few boxes', 'Running out of time before discussing trade-offs', 'Choosing the wrong cloud', 'Writing an ADR'], a: 1, e: 'Time-box each stage so the trade-offs and decision get real time.' }
      ]
    },
    presenting: {
      say: 'A case presentation tests whether you can tell a decision story: problem, constraints, at least two options, what you chose and why, and what could go wrong. Problem first, technology last. Zoom in with C4, label every arrow, and handle challenge by listening, agreeing with what is true, explaining the trade-off and showing you would adapt.',
      k: ['decision story', 'constraints', 'options', 'C4 model', 'trade-off', 'risks and mitigations', 'decision memo', 'the ask'],
      p: ['Show at least two real options; one option is a sales pitch.', 'Name your risks before they do: it builds trust.', 'Label every arrow with what flows and sync or async.', 'Rehearse to time, out loud, at least twice.'],
      f: [
        ['How do you handle a challenge question?', 'Listen fully and restate it, agree with what is true, explain the trade-off ("we accepted X because Y mattered more, mitigated by Z"), and show how you would adapt.'],
        ['What headings go in a one-page decision memo?', 'Decision, context and problem, constraints, options considered, recommendation and rationale, risks and mitigations, cost and roadmap, and the ask.'],
        ['How would you structure a 25-minute architecture presentation?', 'Problem and goals, constraints and NFRs, two or three options, decision and design (C4), risks, roadmap and outcome, a summary, then time for challenge.']
      ],
      q: [
        { q: 'A panellist says your design has a slow failover. What is the strongest first response?', o: ['Defend the design immediately', 'Restate the concern and agree with what is true', 'Say it is out of scope', 'Move to the next slide'], a: 1, e: 'Listening, restating and acknowledging the real risk costs less than defensiveness, then you explain the trade-off.' }
      ]
    },
    checklist: {
      say: 'Your questions show how you think about the role. Ask how decisions are made and recorded, the biggest tech debt, team topology, delivery model and what success looks like at 90 days. Bring a 30-60-90 plan of learn, contribute, lead, and sort logistics the day before.',
      k: ['architecture governance', 'design review', 'tech debt', 'team topology', '30-60-90 plan', 'success at 90 days'],
      p: ['A 30-60-90 plan is learn, contribute, lead.', 'Do not promise to redesign everything in month one.', 'Keep one page of notes in a video interview: glance, don\'t read.'],
      f: [
        ['What should a 30-60-90 day plan for an architect show?', 'Learn stakeholders, systems and pain points by 30; contribute a quick win, design reviews and a first ADR by 60; lead an agreed target state and roadmap by 90.'],
        ['Name three smart questions to ask the panel.', 'How are architecture decisions made and recorded here? What tech debt slows delivery most today? What does success look like in this role after 90 days?']
      ],
      q: [
        { q: 'What is the right shape for a 30-60-90 day plan?', o: ['Redesign, rebuild, release', 'Learn, contribute, lead', 'Audit, cut, replace', 'Observe only for 90 days'], a: 1, e: 'Learn first, contribute a quick win and reviews, then lead an agreed roadmap.' }
      ]
    }
  }
};
