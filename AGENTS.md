# Tech Concepts Prep: guide for AI coding assistants

A static HTML study site for system design, integration, cloud, security, GenAI and .NET 10 interview prep. The owner also turns the content into LinkedIn posts.

There's no framework and no build step. Every page is a hand-written HTML file that shares the scripts and stylesheet in `assets/`.

- Live: https://tech-skills-cwox.onrender.com and https://sathish17baskaran.github.io/tech-skills/
- Deploys: pushing to `main` publishes both sites in about a minute (Render via `render.yaml`, GitHub Pages from the repo root).
- Ideas and backlog: [ENHANCEMENTS.md](ENHANCEMENTS.md).

## Content rules
- The site is for **last-minute interview prep**: keywords, key points, how to approach a question and the steps to answer. Keep new prose short (about 250–350 words per section before the `.dotnet` box) and prefer tables, boxes and visuals.
- Pages render interview-first at runtime; the HTML stays as written:
  - `assets/revise.js` puts a "🎤 Say this" card (the section's `say` and keywords from `assets/revise/NN.js`) under each section's one-liner.
  - `assets/app.js` folds every `.dotnet` box and `.post` into a one-line `details.fold` expander. Folds open for printing and when a link targets something inside them.
  - On behavioural pages, each `article.bq` shows the psychology note, a "STAR in 30 seconds" box (the question's flashcard back) and the power words. The philosophy and full STAR answer go into a fold.
- Write plain, simple English: short sentences, dot points and small tables. Bold the key words.
- Each concept section has:
  - a one-line definition (`p.oneliner`)
  - "how it works" as bullets, boxes or tables
  - at least one **animated** visual
  - points to remember (`.remember`)
  - a `.dotnet` "How to implement it" box, for technical concepts
  - usually a LinkedIn post (`.post`)
- Visuals must be animated: a `figure.viz` (see below), an animated `.flow` row, or an inline SVG with SMIL animation. Never use ASCII or box-drawing text as a picture; `pre class="diagram"` is banned.
- `.dotnet` boxes target **.NET 10 (LTS)**:
  - Check package IDs and status on nuget.org before writing them.
  - Mark prerelease packages with `<span class="pill preview">preview</span>` and paid ones with `<span class="pill lic">commercial licence</span>`.
  - Use `<span class="pill builtin">built-in</span>` for framework APIs.
  - Escape `<`, `>` and `&` inside `<pre class="code"><code>`.
- Verify facts that change over time (regulations and their dates, payment schemes, package status, product names) online before writing them. Name fewer things correctly rather than many loosely.
- The repo is **public**. Never add employer names, internal systems or confidential details. Generic banking or enterprise context is fine.
- Behavioural pages (26–28) use illustrative composite stories. Keep the integrity note on those pages, and keep examples unique and non-clichéd.
- Pages must work on phones (360–390 px wide) with no horizontal page scroll and no cut-off text:
  - Tables stack into cards automatically (`assets/app.js`), so keep cells short.
  - Wide SVGs get a swipe container automatically.
- New sections get `<span class="tag-added">Added</span>` in the h2, and `class="added"` on their toc link.

## Files
| Path | What it is |
|---|---|
| `index.html` | Roadmap: hero, learning path, section cards, LinkedIn kit |
| `NN-name.html` | One page per section (01–29). The number is the page order; the menu groups pages by context (page 29, Role foundations, sits in Interview prep next to 25) |
| `26-leadership-behavioural-questions.html` | Redirect stub to `26-solution-architect-behavioural-questions.html`. Keep it so old links work |
| `assets/style.css` | All styles. Later rules override earlier ones, so append overrides at the end. Colour themes: each menu group has a `[data-theme]` block (`--th`, `--th2`; derived `--th-bg`, `--th-line`, `--th-grad`, `--th-grad-ink` for surfaces behind white text). `assets/menu.js` sets `data-theme` on the body, menu groups, roadmap cards and learning-path chips from the group's first word (e.g. "APIs & integration" → `apis`). Use `var(--th)` instead of fixed colours for page chrome. A new menu group needs a theme block |
| `assets/viz.js` | Animated diagram renderer for `figure.viz`, plus the site-wide animation speed pill (pause, slower, faster) |
| `assets/app.js` | Copy buttons on posts, table-to-card labels on phones, SVG minimum widths and swipe hints |
| `assets/menu.js` | Collapsible left menu, grouped by context, with filter |
| `assets/menu-data.js` | **Generated** by `tools/build-menu.ps1`. Don't edit by hand |
| `tools/build-menu.ps1` | Builds the menu from each page's `<title>` and hero toc. The context groups are defined near the end |
| `tools/build-nav.ps1` | Rewrites `nav.top` and the bottom pager on every page from its ordered `$pages` list |
| `tools/build-index.ps1` | Rebuilds the index section cards (from each page's toc) and learning-path rows |
| `tools/check-pages.ps1` | Structure and link check for all pages |
| `revise.html` | Last-minute revision hub: pick pages, then flashcards, a 10-question quiz, a printable cram sheet, mind map and "how to answer" |
| `assets/revise.js` | The "⚡ Quick revise" panel under each page hero (mind map, flashcards, quiz, how to answer) and Revise mode; also renders `revise.html` |
| `assets/revise/NN.js` | Quick-revision data for page NN. See "Quick revise data" below |
| `tools/check-revise.mjs` | Validates the revise data against each page: `node tools/check-revise.mjs [NN ...]` |
| `render.yaml` | Render static-site blueprint |

## Page anatomy
Copy the skeleton from the most similar existing page. The required parts, in order:

```html
<title>NN · Page Name | Tech Concepts Prep</title>            <!-- build-menu reads this format -->
<link rel="stylesheet" href="assets/style.css">
<nav class="top">…</nav>                                         <!-- generated by build-nav -->
<main>
<header class="hero">
  <div class="kicker">Section NN</div>
  <h1>…</h1><p>One-paragraph intro.</p>
  <div class="toc"><a href="#section-id">Short label</a> …</div>  <!-- feeds the menu and index cards -->
</header>
<!-- NAME -->
<section class="concept" id="section-id">
  <h2><span class="num">NN.M</span> Title</h2>
  <p class="oneliner">One-line definition.</p>
  …
</section>
<div class="qa-wrap"><h2>⚡ Quick-fire Q&amp;A</h2><details class="qa"><summary>Q</summary><p>A</p></details></div>
<div class="pager">…</div>                                       <!-- generated by build-nav -->
</main>
<footer>Tech Concepts Prep · Section NN</footer>
<script src="assets/menu-data.js"></script>
<script src="assets/menu.js"></script>
<script src="assets/app.js"></script>
<script src="assets/viz.js"></script>
```

- `span.num` values must run 1, 2, 3… within a page. `.num` is only for section numbers; behavioural cards use `.qnum`.
- Building blocks inside a section:
  - `.grid` (or `.grid.wide`) of `.box` cards in `blue`, `green`, `purple`, `red`, `amber` or `teal`. There is no `slate` box.
  - `div.tablewrap > table`
  - `.cols2`
  - `p.tip` and `p.warn`
  - `.flow` with `.n` nodes (modifiers `s`, `p`, `a`, `g`, `t`, `fill`) and `.ar` arrows
- The `.dotnet` box layout:

  ```html
  <div class="dotnet"><div class="dotnet-head"><span class="dotnet-logo">.NET 10</span> How to implement it</div>
    <table>…</table><pre class="code"><code>…</code></pre></div>
  ```
- The LinkedIn post (`div.post`) is a series of `<p>` lines: a hook, 3–5 short emoji lines, a takeaway or question, then 3–5 hashtags. Keep it under about 1,300 characters.
- The behavioural card (`article.bq`):

  ```html
  <article class="bq" id="qN">
    <div class="bq-q"><span class="qnum">QN</span><span>Question?</span></div>
    <div class="bq-why">
      <div class="bq-psy"><h5>🧠 Psychology: what they're really testing</h5><p>…</p></div>
      <div class="bq-phi"><h5>🧭 Philosophy: the principle behind a strong answer</h5><p>…</p></div>
    </div>
    <div class="star">
      <div class="st-s"><span class="k">S</span><p><b>Situation:</b> …</p></div>
      <div class="st-t"><span class="k">T</span><p><b>Task:</b> …</p></div>
      <div class="st-a"><span class="k">A</span><div><p><b>Action:</b> …</p><ul><li>…</li></ul></div></div>
      <div class="st-r"><span class="k">R</span><p><b>Result:</b> …</p></div>
      <div class="st-l"><span class="k">R+</span><p><b>Reflection:</b> …</p></div>
    </div>
    <p class="bq-keys"><b>Power words to land:</b> …</p>
  </article>
  ```

  Question ids and labels run q1, q2… down each page.

## Animated diagrams (`assets/viz.js`)
Write `<figure class="viz" data-viz="TYPE"><script type="application/json">{…}</script></figure>`.
- A spec error shows as a red `.viz-err` line in the figure.
- Colours: `blue`, `green`, `purple`, `amber`, `red`, `teal`, `slate`, `pink`, `off` (greyed out).
- Every type accepts `"title"`.
- Labels may contain inline HTML such as `<b>`.

| Type | Use for | Spec fields |
|---|---|---|
| `seq` | Request/response between actors | `actors: [{t, c}]`, `steps: [{from, to, t, sub?, c?, dash?} or {note, over: [i, j], c?}]`, optional `colW`, `rowH`, `stepMs`, `holdMs` |
| `lanes` | Timelines and roadmaps | `max`, `rows: [{label, blocks: [{s, e, t?, c?}]}]`, optional `markers: [{at, t, c}]`, `spans: [{s, e, t, c}]`, `ticks: [{at, t}]`, `axis`, `labelW`, `width`, `rowH`, `dur` |
| `frames` | Before/after states that cycle | `interval`, `frames: [{label, caption, ms?, rows: [[item, …]]}]`. An item is `{t, sub?, c?, big?}`, `{k:"arrow", g:"→", t?}`, `{k:"text", t, c?}` or `{k:"gap"}`. A row may also be `{label, items: […]}` |
| `journey` | A vertical walkthrough | `steps: [{t, d?, icon?, c?, indent?, tag?, href?}]`, `stepMs` |
| `bars` | Compare numbers | `rows: [{label, v, c?, show?, note?}]`, optional `max`, `threshold: {v, t}`, `holdMs` |
| `steps` | Checklist or transcript reveal | `items: [{k, t, c?, indent?}]`, `stepMs`, `holdMs` |

Example:
```html
<figure class="viz" data-viz="seq"><script type="application/json">
{"title":"Cache-aside read","actors":[{"t":"API","c":"blue"},{"t":"Cache","c":"amber"},{"t":"DB","c":"teal"}],
 "steps":[{"from":0,"to":1,"t":"GET key"},{"from":1,"to":0,"t":"miss","dash":true,"c":"red"},
  {"from":0,"to":2,"t":"query"},{"from":0,"to":1,"t":"SET key, TTL 5m","c":"green"}]}
</script></figure>
```
Long labels wrap or clip on phones, so keep node labels to a few words and put detail in `caption` or `sub`.

The speed pill (bottom left, on every page with animations) scales every animation inside `figure.viz`, `.flow` and inline SVGs, including SMIL. The chosen speed is stored in `localStorage` as `tcp-anim-speed`; pause isn't stored. When you write a new viz type, time it with `viz.js`'s `sleep()` and `anim()` helpers so the speed control applies to it.

## Quick revise data (`assets/revise/NN.js`)
Each page has a data file that drives its Quick revise panel, Revise mode and the `revise.html` hub. Pages are for reading; this layer is for last-minute recall, so keep it crisp.

```js
(window.REVISE = window.REVISE || {})['NN'] = {
  approach: [['Step', 'detail'], …],     // 4–7 steps to answer any question on this topic
  traps: ['Common mistake', …],           // optional, 1–5
  sections: {                             // one entry per <section class="concept" id>, ids must match exactly
    'section-id': {
      say: '30-second spoken answer',     // 12–70 words
      k: ['keyword', …],                  // 4–8 keyword chips
      p: ['key point', …],                // 2–4 one-line points
      f: [['flashcard question', 'answer'], …],                 // 1–8
      q: [{ q: 'question', o: ['A', 'B', 'C', 'D'], a: 0, e: 'why' }]   // 1–2, a = index of the right option
    }
  }
};
```
- Use `05.js` as the model.
- Quiz options are shuffled at runtime, so never use "all/none of the above".
- Simple inline HTML (`<b>`, `<code>`) is allowed. No scripts.
- Behavioural pages (26–28): one flashcard per question card. The front is `'QN. question'`, and the back is a STAR skeleton written as `'<b>S</b> … <b>T</b> … <b>A</b> … <b>R</b> …'`; the panel puts each letter on its own line. Quiz items ask "what is the interviewer really testing?".
- `tools/build-menu.ps1` adds the `<script>` tags for the data file and `revise.js` to every page that has data, and lists all data files in `revise.html`. Run it after adding a data file.
- Progress is stored in `localStorage`: `tcp-known` (known cards), `tcp-rv-tab` (last tab) and `tcp-rv-mode` (Revise mode).

## Common changes
- **Change a page's sections:** update its `assets/revise/NN.js` to match (add, remove or rename section keys), then run `node tools/check-revise.mjs NN`.
- **Add a section to a page:**
  1. Insert it where it fits.
  2. Renumber every later `span.num` on that page.
  3. Update in-page "see N.M" references, plus any links on other pages that quote those numbers. Search for `page.html#` across the repo.
  4. Add its toc link, then run `build-menu` and `check-pages`.
- **Add a page:**
  1. Create `NN-name.html` from a similar page.
  2. Add it to `$pages` in `tools/build-nav.ps1`, to `$cards` and the `$path` rows in `tools/build-index.ps1`, and to a context group in `tools/build-menu.ps1`.
  3. Write its `assets/revise/NN.js`.
  4. Run all three, then `check-pages` and `check-revise`.
- **Rename or remove a page:** leave a redirect stub at the old file name. A page with `<meta http-equiv="refresh">` is skipped by the menu builder. Then update all links.
- **Change the menu grouping:** edit `$groups` in `tools/build-menu.ps1`. Pages keep their numbers, and the pager stays in number order.

## Running the tools
- Run with Windows PowerShell 5.1 from the repo root: `powershell -ExecutionPolicy Bypass -File tools\build-menu.ps1`. Do the same for `build-nav.ps1`, `build-index.ps1` and `check-pages.ps1`.
- Write HTML as UTF-8 **without** BOM, e.g. `[IO.File]::WriteAllText(path, text, (New-Object Text.UTF8Encoding $false))`.
- `.ps1` files that contain non-ASCII characters need UTF-8 **with** BOM.
- Never name a PowerShell function `rd`, `rm`, `del`, `ri`, `cat` or another built-in alias. Aliases win over functions, and `rd` silently runs Remove-Item. This has deleted files in this repo before.
- PowerShell variable names are case-insensitive: `$D` and `$d` are the same variable.

## Before you commit
1. `tools\check-pages.ps1` prints no `CHECK` lines, and `node tools/check-revise.mjs` prints only `ok` lines.
2. Every page you changed loads without console errors and without any `viz-err`. A quick headless check: `chrome --headless=new --dump-dom file:///…/page.html` and search the output for `viz-err`.
3. Look at the changed sections at desktop width and at 390 px (browser device mode). Check that diagrams render and labels don't overlap, and that the page doesn't scroll sideways.
4. Commit to `main` and push; both sites redeploy. If styles look stale, a hard refresh (Ctrl+F5) clears the browser cache.
