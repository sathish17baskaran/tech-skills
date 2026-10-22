# Future enhancements

The backlog for Tech Concepts Prep. Pick an item, give it to any AI assistant with the prompt template at the bottom, then tick it off here.

The assistant should read [AGENTS.md](AGENTS.md) first. It has the site rules, page anatomy, diagram specs and the checks to run.

## Content: topics mentioned but without their own section
Each of these appears inside other sections, but has no dedicated concept section yet. Search the site first so a new section links to, rather than repeats, the existing mentions.
- [x] Kafka and event streaming (10.9)
- [x] GraphQL (8.8)
- [x] Chaos engineering and game days (15.16)
- [x] Platform engineering and internal developer platforms (13.9)
- [x] FinOps and cloud cost optimisation (16.14)
- [ ] ISO 20022 message basics for payments (page 19)

## Content: more practice
- [ ] More design case studies on page 21 (it has URL shortener, rate limiter, chat, notifications, news feed, video and payment ledger). Candidates: ride matching, hotel booking at scale, collaborative document editing, metrics/monitoring system, open banking API gateway.
- [ ] A Principal Software Engineer behavioural page (STAR, same format as pages 26–28). Page 29.5 has four starter prompts.
- [ ] A behavioural page for other roles if needed (e.g. Integration Architect, Enterprise Architect), in the same format as pages 26–28.

## AI Architect learning plan (`AI/AI-Architect-12-Week-Plan.html`)
Done so far: Week 0–12 plan with Courses, Docs and Videos boxes, a ⭐ "Start here" video and Optional tags in every week, a 6-week fast track, a daily routine, and links to pages 17, 18 and 25. See AGENTS.md "Standalone learning plans" for the structure and the link check.
- [ ] Recheck every link and exam code each quarter. Videos get removed, URLs move, and Microsoft and AWS change exam codes often.
- [ ] Add a Google Cloud option (Vertex AI, Agent Development Kit, Professional ML Engineer) alongside weeks 9–10.
- [ ] A "Week 13+" path: AI-500 exam prep, then specialisations (multimodal and voice agents, fine-tuning and post-training, self-hosted open-weight models).
- [ ] A fast-track switch that hides Optional items, and a tick per item as well as per week.
- [ ] A "start date" picker that shows calendar dates per week, plus an iCal or Markdown checklist download.
- [ ] Link it from `index.html` (for example a card in the learning path), or turn it into a numbered site page with an animated roadmap and revise data.
- [ ] Move the link check from AGENTS.md into `tools/check-links.ps1` and run it in the GitHub Action below.

## Site features
- [x] **Topic search** in the menu: matches titles, keywords, 30-second answers, key points and flashcard questions; results open a last-minute page per topic (`topic.html`).
- [ ] **Full-text search** of the page body text (tables, boxes, `.dotnet` code). One option: a generated JSON index.
- [ ] **Progress tracking**: a "done" tick per section saved in `localStorage`, with a per-page percentage in the menu.
- [x] **Flashcard / quiz mode**: done as the "Quick revise" panel on every page plus `revise.html` (see AGENTS.md "Quick revise data").
- [ ] Spaced repetition for flashcards: show cards marked "Again" sooner, and track a per-page quiz best score.
- [ ] **Dark mode** via `prefers-color-scheme`. Colours already use CSS variables in `assets/style.css`.
- [ ] **LinkedIn carousel export**: turn a section's post and diagram into square image slides.
- [ ] **Print / PDF-friendly** pages: expand all frames, hide the menu, avoid page breaks inside cards.

## Quality and automation
- [ ] GitHub Action on every push: run `tools/check-pages.ps1` (a Windows runner, or pwsh), plus an external link checker.
- [ ] Accessibility pass: colour contrast, keyboard focus on diagram frame buttons and menu toggles, alt text and aria labels on hand-made SVGs.
- [ ] Learning path on `index.html`: the last row (25–28) wraps at desktop width and leaves a dangling arrow. Split it into balanced rows in `tools/build-index.ps1`.
- [ ] Trim the behavioural answers that run past about 330 words (some on pages 26–28).

## Maintenance
- [ ] When .NET 11 ships (expected November 2026), recheck the `.dotnet` boxes:
  - package versions and preview/commercial pills
  - whether "LTS" wording needs updating (.NET 10 remains the LTS)
- [ ] Recheck facts that change over time once a year: regulation names and dates (e.g. APRA CPS 230), payment scheme details, cloud service names in the cheat sheet, OWASP Top 10 for LLM Applications version, OWASP Top 10 for Agentic Applications version, and Thoughtworks Radar ring names.
- [ ] Verify cited ideas the behavioural pages use from memory: Conway's law, Hyrum's law, the Swiss cheese model (James Reason), psychological safety (Amy Edmondson), "disagree and commit", Goodhart's law.

## Prompt template for any AI assistant
```text
Repository: sathish17baskaran/tech-skills (static HTML site; read masterfiles/AGENTS.md first and follow it).
Task: <paste one backlog item, or describe the change>.
Where: <page file(s), or "find the right page">.
Requirements: simple English with dot points, at least one animated visual (figure.viz),
points to remember, a .NET 10 box if technical, a LinkedIn post, mobile-friendly at 390 px,
no employer-specific content.
When done: run tools/build-menu.ps1 (and build-nav / build-index if you added a page),
run tools/check-pages.ps1, check the page in a browser at desktop and 390 px,
then show me the changes before committing.
```
