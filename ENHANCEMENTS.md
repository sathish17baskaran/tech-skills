# Future enhancements

The backlog for Tech Concepts Prep. Pick an item, give it to any AI assistant with the prompt template at the bottom, then tick it off here.

The assistant should read [AGENTS.md](AGENTS.md) first. It has the site rules, page anatomy, diagram specs and the checks to run.

## Content: topics mentioned but without their own section
Each of these appears inside other sections, but has no dedicated concept section yet. Search the site first so a new section links to, rather than repeats, the existing mentions.
- [x] Kafka and event streaming (10.9)
- [x] GraphQL (8.8)
- [x] Chaos engineering and game days (13.16)
- [x] Platform engineering and internal developer platforms (24.9)
- [x] FinOps and cloud cost optimisation (21.14)
- [ ] ISO 20022 message basics for payments (page 16)

## Content: more practice
- [ ] More design case studies on page 19 (it has URL shortener, rate limiter, chat, notifications, news feed, video and payment ledger). Candidates: ride matching, hotel booking at scale, collaborative document editing, metrics/monitoring system, open banking API gateway.
- [ ] A Principal Software Engineer behavioural page (STAR, same format as pages 26–28). Page 29.5 has four starter prompts.
- [ ] A behavioural page for other roles if needed (e.g. Integration Architect, Enterprise Architect), in the same format as pages 26–28.

## Site features
- [ ] **Full-text search** across all pages. The menu filter only matches page and section titles. One option: a generated JSON index plus a small client-side search box.
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
- [ ] Recheck facts that change over time once a year: regulation names and dates (e.g. APRA CPS 230), payment scheme details, cloud service names in the cheat sheet, OWASP Top 10 for LLM Applications version, and Thoughtworks Radar ring names.
- [ ] Verify cited ideas the behavioural pages use from memory: Conway's law, Hyrum's law, the Swiss cheese model (James Reason), psychological safety (Amy Edmondson), "disagree and commit", Goodhart's law.

## Prompt template for any AI assistant
```text
Repository: sathish17baskaran/tech-skills (static HTML site; read AGENTS.md first and follow it).
Task: <paste one backlog item, or describe the change>.
Where: <page file(s), or "find the right page">.
Requirements: simple English with dot points, at least one animated visual (figure.viz),
points to remember, a .NET 10 box if technical, a LinkedIn post, mobile-friendly at 390 px,
no employer-specific content.
When done: run tools/build-menu.ps1 (and build-nav / build-index if you added a page),
run tools/check-pages.ps1, check the page in a browser at desktop and 390 px,
then show me the changes before committing.
```
