/* Quick-revision layer: mind map, flashcards, quiz, "how to answer" and revise mode.
   Data: assets/revise/NN.js sets window.REVISE['NN'] (see AGENTS.md "Quick revise data").
   On a section page it adds the "Quick revise" panel under the hero; revise.html reuses window.ReviseUI. */
(function () {
  'use strict';
  var R = window.REVISE || {};
  var MENU = window.SITE_MENU || [];
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['blue', 'purple', 'teal', 'amber', 'green', 'pink', 'red'];

  function el(tag, cls, html, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function btn(cls, html, parent, onClick) {
    var b = el('button', cls, html, parent);
    b.type = 'button';
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }
  // STAR skeletons are written on one line ('<b>S</b> … <b>T</b> …'); start each letter on a new line.
  function starLines(s) { return String(s).replace(/\s*(<b>(?:T|A|R\+?)<\/b>)/g, '<br>$1'); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* Page and section labels come from the menu data, so revise.html needs no page HTML. */
  function pageInfo(nn) {
    for (var i = 0; i < MENU.length; i++) if (MENU[i].n === nn) return MENU[i];
    return { n: nn, f: '', t: 'Section ' + nn, s: [] };
  }
  function label(nn, id) {
    var p = pageInfo(nn);
    for (var i = 0; i < p.s.length; i++) if (p.s[i][0] === id) return p.s[i][1];
    var h = document.querySelector('section#' + id + ' h2');
    return h ? h.textContent.replace(/^[\d.]+\s*/, '').replace(/\s*Added$/, '') : id;
  }
  function ids(nn) { return Object.keys((R[nn] && R[nn].sections) || {}); }
  function cardsOf(nn) {
    var out = [], p = pageInfo(nn);
    ids(nn).forEach(function (id) {
      (R[nn].sections[id].f || []).forEach(function (c, i) {
        out.push({ key: nn + '|' + id + '|' + i, q: c[0], a: c[1], tag: nn + ' · ' + label(nn, id), href: p.f + '#' + id });
      });
    });
    return out;
  }
  function quizOf(nn) {
    var out = [], p = pageInfo(nn);
    ids(nn).forEach(function (id) {
      (R[nn].sections[id].q || []).forEach(function (q, i) {
        /* Shuffle the options so the right answer isn't always in the same position. */
        var order = shuffle(q.o.map(function (o, oi) { return oi; }));
        out.push({ key: nn + '|' + id + '|' + i, q: q.q, o: order.map(function (oi) { return q.o[oi]; }), a: order.indexOf(q.a), e: q.e, tag: nn + ' · ' + label(nn, id), href: p.f + '#' + id });
      });
    });
    return out;
  }

  /* ---------- Flashcards ---------- */
  function flashcards(box, cards) {
    box.innerHTML = '';
    var known = load('tcp-known', {});
    var hideKnown = false, deck = [], i = 0;
    var bar = el('div', 'rv-bar', null, box);
    var count = el('span', 'rv-count', '', bar);
    var tools = el('span', 'rv-tools', null, bar);
    btn('rv-mini', '🔀 Shuffle', tools, function () { build(true); });
    var hk = btn('rv-mini', '🙈 Hide known', tools, function () { hideKnown = !hideKnown; hk.classList.toggle('on', hideKnown); build(false); });
    btn('rv-mini', '↺ Reset known', tools, function () { cards.forEach(function (c) { delete known[c.key]; }); save('tcp-known', known); build(false); });
    var card = btn('rv-fc', '', box, flip);
    card.setAttribute('aria-live', 'polite');
    var inner = el('div', 'rv-fc-inner', null, card);
    var front = el('div', 'rv-fc-face rv-fc-front', null, inner);
    var back = el('div', 'rv-fc-face rv-fc-back', null, inner);
    var nav = el('div', 'rv-fc-nav', null, box);
    btn('rv-nav', '←', nav, function () { go(-1); }).title = 'Previous';
    btn('rv-again', '↺ Again', nav, function () { mark(false); });
    btn('rv-got', '✓ Got it', nav, function () { mark(true); });
    btn('rv-nav', '→', nav, function () { go(1); }).title = 'Next';
    el('p', 'rv-hint', 'Tap the card to flip. Keys: space flips, ← → move.', box);

    function build(mix) {
      deck = cards.filter(function (c) { return !hideKnown || !known[c.key]; });
      if (mix) deck = shuffle(deck);
      i = 0; show();
    }
    function show() {
      card.classList.remove('flipped');
      var n = cards.filter(function (c) { return known[c.key]; }).length;
      if (!deck.length) {
        front.innerHTML = '<div class="rv-fc-q">🎉 All cards known.</div><div class="rv-fc-tag">Reset known or turn off "Hide known" to go again.</div>';
        back.innerHTML = '';
        count.textContent = n + ' of ' + cards.length + ' known';
        return;
      }
      var c = deck[i];
      front.innerHTML = '<div class="rv-fc-tag">' + c.tag + (known[c.key] ? ' · ✓ known' : '') + '</div><div class="rv-fc-q">' + c.q + '</div><div class="rv-fc-tip">Tap to reveal</div>';
      back.innerHTML = '<div class="rv-fc-tag">Answer</div><div class="rv-fc-a">' + starLines(c.a) + '</div>' + (c.href ? '<a class="rv-fc-link" href="' + c.href + '">Read the topic →</a>' : '');
      count.textContent = 'Card ' + (i + 1) + ' of ' + deck.length + ' · ' + n + ' known';
    }
    function flip(e) { if (e && e.target.closest('a')) return; if (deck.length) card.classList.toggle('flipped'); }
    function go(d) { if (!deck.length) return; i = (i + d + deck.length) % deck.length; show(); }
    function mark(ok) {
      if (!deck.length) return;
      var c = deck[i];
      if (ok) known[c.key] = 1; else delete known[c.key];
      save('tcp-known', known);
      if (ok && hideKnown) { deck.splice(i, 1); if (i >= deck.length) i = 0; show(); } else go(1);
    }
    box.tabIndex = 0;
    box.onkeydown = function (e) {
      if (e.target.closest('input, textarea')) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    build(false);
  }

  /* ---------- Quiz ---------- */
  function quiz(box, all, limit) {
    box.innerHTML = '';
    var qs = [], idx = 0, score = 0, wrong = [];
    function start(list) { qs = shuffle(list).slice(0, limit || list.length); idx = 0; score = 0; wrong = []; render(); }
    function render() {
      box.innerHTML = '';
      if (!qs.length) { el('p', 'rv-hint', 'No questions for this selection yet.', box); return; }
      if (idx >= qs.length) return done();
      var q = qs[idx];
      var bar = el('div', 'rv-bar', null, box);
      el('span', 'rv-count', 'Question ' + (idx + 1) + ' of ' + qs.length + ' · Score ' + score, bar);
      var prog = el('div', 'rv-prog', null, box);
      el('div', 'rv-prog-fill', null, prog).style.width = (idx / qs.length * 100) + '%';
      el('div', 'rv-fc-tag', q.tag, box);
      el('div', 'rv-q', q.q, box);
      var opts = el('div', 'rv-opts', null, box);
      var expl = el('div', 'rv-expl', null, box);
      var next = btn('rv-got rv-next', idx + 1 < qs.length ? 'Next question →' : 'See my score →', null, function () { idx++; render(); });
      q.o.forEach(function (o, oi) {
        btn('rv-opt', '<span class="rv-letter">' + 'ABCD'.charAt(oi) + '</span>' + o, opts, function () {
          if (opts.dataset.done) return;
          opts.dataset.done = '1';
          var ok = oi === q.a;
          if (ok) score++; else wrong.push(q);
          Array.prototype.forEach.call(opts.children, function (b, bi) {
            b.disabled = true;
            if (bi === q.a) b.classList.add('right');
            else if (bi === oi) b.classList.add('wrong');
          });
          expl.innerHTML = '<b>' + (ok ? '✓ Correct.' : '✗ Not quite.') + '</b> ' + (q.e || '') + (q.href ? ' <a href="' + q.href + '">Read the topic →</a>' : '');
          expl.classList.add(ok ? 'ok' : 'bad');
          box.appendChild(next);
          next.focus({ preventScroll: true });
        });
      });
    }
    function done() {
      var pct = Math.round(score / qs.length * 100);
      var wrap = el('div', 'rv-done', null, box);
      el('div', 'rv-score ' + (pct >= 80 ? 'ok' : pct >= 50 ? 'mid' : 'bad'), pct + '%', wrap);
      el('p', null, 'You got <b>' + score + ' of ' + qs.length + '</b> right. ' + (pct >= 80 ? 'Interview ready on this set. 💪' : pct >= 50 ? 'Nearly there: revise the topics you missed.' : 'Go back over these topics, then try again.'), wrap);
      if (wrong.length) {
        var ul = el('ul', 'rv-missed', null, wrap);
        wrong.forEach(function (w) { el('li', null, (w.href ? '<a href="' + w.href + '">' + w.tag + '</a>' : w.tag), ul); });
      }
      var row = el('div', 'rv-fc-nav', null, wrap);
      if (wrong.length) btn('rv-again', '↺ Retry the ' + wrong.length + ' I missed', row, function () { start(wrong); });
      btn('rv-got', '🔀 New quiz', row, function () { start(all); });
    }
    start(all);
  }

  /* ---------- Mind map ---------- */
  function mindmap(box, nn) {
    box.innerHTML = '';
    var p = pageInfo(nn), list = ids(nn);
    var mm = el('div', 'rv-mm', null, box);
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'rv-mm-lines');
    svg.setAttribute('aria-hidden', 'true');
    mm.appendChild(svg);
    var left = el('div', 'rv-mm-col left', null, mm);
    var root = el('div', 'rv-mm-root', '<small>Section ' + nn + '</small>' + p.t, mm);
    var right = el('div', 'rv-mm-col right', null, mm);
    var half = Math.ceil(list.length / 2), nodes = [];
    list.forEach(function (id, i) {
      var s = R[nn].sections[id], c = COLORS[i % COLORS.length];
      var a = el('a', 'rv-mm-node c-' + c, null, i < half ? left : right);
      a.href = (document.getElementById(id) ? '' : p.f) + '#' + id;
      el('b', null, label(nn, id), a);
      var chips = el('span', 'rv-mm-chips', null, a);
      (s.k || []).slice(0, 4).forEach(function (k) { el('i', null, k, chips); });
      nodes.push({ el: a, side: i < half ? 'l' : 'r', c: c });
    });
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var stacked = mm.clientWidth < 760;
      mm.classList.toggle('stack', stacked);
      if (stacked) return;
      var box0 = mm.getBoundingClientRect(), rb = root.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + box0.width + ' ' + box0.height);
      svg.setAttribute('width', box0.width); svg.setAttribute('height', box0.height);
      nodes.forEach(function (n, i) {
        var nb = n.el.getBoundingClientRect();
        var x1 = (n.side === 'l' ? rb.left : rb.right) - box0.left, y1 = rb.top + rb.height / 2 - box0.top;
        var x2 = (n.side === 'l' ? nb.right : nb.left) - box0.left, y2 = nb.top + nb.height / 2 - box0.top;
        var mx = (x1 + x2) / 2;
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2);
        path.setAttribute('class', 'rv-mm-line s-' + n.c);
        if (!REDUCE) path.style.animationDelay = (i * 0.12) + 's';
        svg.appendChild(path);
      });
    }
    draw();
    if (window.ResizeObserver) new ResizeObserver(draw).observe(mm); else window.addEventListener('resize', draw);
  }

  /* ---------- How to answer ---------- */
  function approach(box, nn) {
    box.innerHTML = '';
    var d = R[nn];
    el('h4', 'rv-h', '🪜 Steps to answer any question on this topic', box);
    var ol = el('ol', 'rv-steps', null, box);
    (d.approach || []).forEach(function (s) { el('li', null, '<b>' + s[0] + '</b><span>' + s[1] + '</span>', ol); });
    if (d.traps && d.traps.length) {
      el('h4', 'rv-h', '⚠️ Avoid these', box);
      var ul = el('ul', 'rv-traps', null, box);
      d.traps.forEach(function (t) { el('li', null, t, ul); });
    }
    el('h4', 'rv-h', '🎤 30-second answers', box);
    var dl = el('div', 'rv-says', null, box);
    ids(nn).forEach(function (id) {
      var s = d.sections[id];
      if (!s.say) return;
      var row = el('div', 'rv-say', null, dl);
      el('a', null, label(nn, id), row).href = (document.getElementById(id) ? '' : pageInfo(nn).f) + '#' + id;
      el('p', null, s.say, row);
    });
  }

  /* ---------- Interview card at the top of each section (key points show only in revise mode) ---------- */
  function sectionCards(nn) {
    ids(nn).forEach(function (id) {
      var sec = document.getElementById(id), s = R[nn].sections[id];
      if (!sec || sec.querySelector('.rv-card')) return;
      var c = el('div', 'rv-card');
      if (s.say) el('p', 'rv-card-say', '<span class="rv-card-h">🎤 Say this</span>' + s.say, c);
      if (s.k && s.k.length) {
        var chips = el('div', 'rv-chips', null, c);
        el('span', 'rv-chips-h', 'Keywords', chips);
        s.k.forEach(function (k) { el('span', 'rv-chip', k, chips); });
      }
      if (s.p && s.p.length) {
        var ul = el('ul', 'rv-card-pts', null, c);
        s.p.forEach(function (t) { el('li', null, t, ul); });
      }
      var at = sec.querySelector(':scope > p.oneliner') || sec.querySelector('h2');
      if (at) at.insertAdjacentElement('afterend', c); else sec.insertBefore(c, sec.firstChild);
    });
  }

  /* ---------- Behavioural question cards: what they test, STAR in 30 seconds, power words; full answer folded ---------- */
  function questionCards(nn) {
    var skel = {};
    cardsOf(nn).forEach(function (c) { var m = /^Q(\d+)\./.exec(c.q); if (m) skel[m[1]] = c.a; });
    document.querySelectorAll('article.bq').forEach(function (art) {
      var n = (art.id || '').replace(/^q/, ''), why = art.querySelector('.bq-why'), star = art.querySelector('.star');
      if (!skel[n] || !why || !star || art.querySelector('.bq-skel')) return;
      var box = el('div', 'bq-skel', '<h5>⭐ STAR in 30 seconds</h5><p>' + starLines(skel[n]) + '</p>');
      var fold = el('details', 'fold fold-star', '<summary>📖 Full answer: STAR, reflection and philosophy</summary>');
      var phi = art.querySelector('.bq-phi');
      if (phi) { fold.appendChild(phi); why.classList.add('solo'); }
      fold.appendChild(star);
      why.insertAdjacentElement('afterend', box);
      var keys = art.querySelector('.bq-keys');
      if (keys) box.insertAdjacentElement('afterend', keys);
      (keys || box).insertAdjacentElement('afterend', fold);
    });
  }

  /* ---------- The panel under the hero ---------- */
  function setMode(on) {
    document.body.classList.toggle('rv-mode', on);
    document.querySelectorAll('.rv-switch input').forEach(function (i) { i.checked = on; });
    save('tcp-rv-mode', on ? 1 : 0);
  }
  function panel(nn) {
    var hero = document.querySelector('header.hero');
    if (!hero) return;
    var d = R[nn];
    var nCards = cardsOf(nn).length, nQ = quizOf(nn).length;
    var wrap = el('div', 'rv-panel');
    wrap.id = 'revise';
    var head = el('div', 'rv-head', null, wrap);
    el('div', 'rv-title', '⚡ Quick revise <small>' + ids(nn).length + ' topics · ' + nCards + ' cards · ' + nQ + ' quiz questions</small>', head);
    var sw = el('label', 'rv-switch', '<input type="checkbox"><span class="rv-track"></span><span>Revise mode</span>', head);
    sw.title = 'Hide the long text and show keywords, key points and a 30-second answer for each topic';
    sw.querySelector('input').addEventListener('change', function (e) { setMode(e.target.checked); });
    var tabs = el('div', 'rv-tabs', null, wrap);
    tabs.setAttribute('role', 'tablist');
    var body = el('div', 'rv-body', null, wrap);
    var defs = [
      ['map', '🧠 Mind map', function () { mindmap(body, nn); }],
      ['cards', '🃏 Flashcards', function () { flashcards(body, cardsOf(nn)); }],
      ['quiz', '❓ Quiz', function () { quiz(body, quizOf(nn)); }],
      ['answer', '🪜 How to answer', function () { approach(body, nn); }]
    ];
    var open = load('tcp-rv-tab', 'map');
    defs.forEach(function (t) {
      var b = btn('rv-tab', t[1], tabs, function () { select(t[0]); });
      b.dataset.tab = t[0];
      b.setAttribute('role', 'tab');
    });
    function select(name) {
      var t = defs.filter(function (x) { return x[0] === name; })[0] || defs[0];
      Array.prototype.forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.dataset.tab === t[0]); b.setAttribute('aria-selected', b.dataset.tab === t[0]); });
      t[2]();
      save('tcp-rv-tab', t[0]);
    }
    hero.insertAdjacentElement('afterend', wrap);
    select(open);

    var pill = btn('rv-pill', '⚡ Revise mode on · show full text', document.body, function () { setMode(false); });
    pill.title = 'Turn revise mode off';
    sectionCards(nn);
    questionCards(nn);
    setMode(!!load('tcp-rv-mode', 0));
    if (!d.approach) wrap.querySelector('[data-tab="answer"]').hidden = true;
  }

  /* ---------- Cram sheet: keywords and 30-second answers for many pages ---------- */
  function cram(box, list) {
    box.innerHTML = '';
    var bar = el('div', 'rv-bar', null, box);
    el('span', 'rv-count', list.length + ' pages', bar);
    btn('rv-mini', '🖨 Print / save as PDF', el('span', 'rv-tools', null, bar), function () { window.print(); });
    list.forEach(function (nn) {
      var p = pageInfo(nn), sec = el('div', 'rv-cram', null, box);
      el('h3', null, '<a href="' + p.f + '">' + nn + ' · ' + p.t + '</a>', sec);
      ids(nn).forEach(function (id) {
        var s = R[nn].sections[id], row = el('div', 'rv-cram-row', null, sec);
        el('b', null, label(nn, id), row);
        if (s.say) el('p', null, s.say, row);
        var chips = el('div', 'rv-chips', null, row);
        (s.k || []).forEach(function (k) { el('span', 'rv-chip', k, chips); });
      });
    });
  }

  /* ---------- revise.html: pick pages, then flashcards / quiz / cram / mind map / how to answer ---------- */
  function hub(root) {
    var avail = MENU.filter(function (p) { return R[p.n]; });
    var all = avail.map(function (p) { return p.n; });
    var sel = load('tcp-hub-sel', null);
    sel = (sel || all).filter(function (n) { return all.indexOf(n) >= 0; });
    if (!sel.length) sel = all.slice();
    var pick = el('div', 'rv-picker', null, root);
    var presets = el('div', 'rv-presets', null, pick);
    el('span', 'rv-chips-h', 'Pick pages', presets);
    btn('rv-mini', 'All', presets, function () { sel = all.slice(); sync(); });
    btn('rv-mini', 'None', presets, function () { sel = []; sync(); });
    var groupsEl = el('div', 'rv-groups', null, pick);
    var chipEls = {}, groupNames = [];
    avail.forEach(function (p) { if (groupNames.indexOf(p.g) < 0) groupNames.push(p.g); });
    groupNames.forEach(function (g) {
      var members = avail.filter(function (p) { return p.g === g; });
      var row = el('div', 'rv-group', null, groupsEl);
      btn('rv-group-h', g, row, function () {
        var ns = members.map(function (p) { return p.n; });
        var allOn = ns.every(function (n) { return sel.indexOf(n) >= 0; });
        sel = allOn ? sel.filter(function (n) { return ns.indexOf(n) < 0; }) : sel.concat(ns.filter(function (n) { return sel.indexOf(n) < 0; }));
        sync();
      }).title = 'Select or clear this group';
      members.forEach(function (p) {
        chipEls[p.n] = btn('rv-pick', '<span>' + p.n + '</span>' + p.t, row, function () {
          sel = sel.indexOf(p.n) >= 0 ? sel.filter(function (n) { return n !== p.n; }) : sel.concat([p.n]);
          sync();
        });
      });
    });
    var tabs = el('div', 'rv-tabs', null, root);
    var tools = el('div', 'rv-hub-tools', null, root);
    var body = el('div', 'rv-body', null, root);
    var pageSel = el('select', 'rv-select', null, tools);
    var modes = [
      ['cards', '🃏 Flashcards', false], ['quiz', '❓ Quiz (10)', false], ['cram', '📝 Cram sheet', false],
      ['map', '🧠 Mind map', true], ['answer', '🪜 How to answer', true]
    ];
    var mode = load('tcp-hub-mode', 'cards');
    modes.forEach(function (m) { btn('rv-tab', m[1], tabs, function () { mode = m[0]; save('tcp-hub-mode', mode); render(); }).dataset.tab = m[0]; });
    pageSel.addEventListener('change', render);
    function ordered() { return all.filter(function (n) { return sel.indexOf(n) >= 0; }); }
    function sync() {
      save('tcp-hub-sel', sel);
      Object.keys(chipEls).forEach(function (n) { chipEls[n].classList.toggle('on', sel.indexOf(n) >= 0); });
      var keep = pageSel.value;
      pageSel.innerHTML = '';
      ordered().forEach(function (n) { var o = el('option', null, n + ' · ' + pageInfo(n).t, pageSel); o.value = n; });
      if (ordered().indexOf(keep) >= 0) pageSel.value = keep;
      render();
    }
    function render() {
      var m = modes.filter(function (x) { return x[0] === mode; })[0] || modes[0];
      Array.prototype.forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.dataset.tab === m[0]); });
      tools.hidden = !m[2];
      var list = ordered();
      if (!list.length) { body.innerHTML = '<p class="rv-hint">Pick at least one page above.</p>'; return; }
      if (m[0] === 'cards') flashcards(body, list.reduce(function (a, n) { return a.concat(cardsOf(n)); }, []));
      else if (m[0] === 'quiz') quiz(body, list.reduce(function (a, n) { return a.concat(quizOf(n)); }, []), 10);
      else if (m[0] === 'cram') cram(body, list);
      else if (m[0] === 'map') mindmap(body, pageSel.value || list[0]);
      else approach(body, pageSel.value || list[0]);
    }
    sync();
  }

  window.ReviseUI = { flashcards: flashcards, quiz: quiz, mindmap: mindmap, approach: approach, cardsOf: cardsOf, quizOf: quizOf, pageInfo: pageInfo, label: label, ids: ids, starLines: starLines };

  var hubEl = document.getElementById('revise-hub');
  if (hubEl) { hub(hubEl); return; }
  var m = decodeURIComponent(location.pathname.split('/').pop()).match(/^(\d{2})-/);
  if (m && R[m[1]]) panel(m[1]);
})();
