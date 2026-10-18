/* topic.html?p=NN&s=section-id: everything on one topic on one page, for last-minute prep.
   Search results in the menu (assets/menu.js) link here. Uses the page's revise data (assets/revise/NN.js),
   window.ReviseUI from assets/revise.js, and the section itself, fetched from its page. */
(function () {
  'use strict';
  var MENU = window.SITE_MENU || [];
  var q = new URLSearchParams(location.search), nn = q.get('p'), id = q.get('s');
  var page = MENU.filter(function (p) { return p.n === nn; })[0];
  var topic = page && page.s.filter(function (s) { return s[0] === id; })[0];
  var root = document.getElementById('topic');

  function el(tag, cls, html, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(tag, cls, s, parent) { var e = el(tag, cls, null, parent); e.textContent = s; return e; }
  function load(src, done) {
    var s = document.createElement('script');
    s.src = src; s.onload = s.onerror = done || null;
    document.body.appendChild(s);
  }
  function topicHref(n, sid) { return 'topic.html?p=' + n + '&s=' + encodeURIComponent(sid); }
  function block(title, cls) {
    var sec = el('section', 'concept tp-sec' + (cls ? ' ' + cls : ''), null, root);
    text('h2', null, title, sec);
    return sec;
  }
  /* app.js (folds, phone tables) and viz.js (diagrams, speed control) run once the notes are on the page. */
  function finish() { load('assets/app.js', function () { load('assets/viz.js'); }); }

  if (!topic) { if (nn || id) document.querySelector('.hero h1').textContent = 'Topic not found'; finish(); return; }

  document.body.dataset.theme = String(page.g).split(/[^A-Za-z]/)[0].toLowerCase();
  document.title = topic[1] + ' · ' + nn + ' | Tech Concepts Prep';
  var notes = fetch(page.f)
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (html) { return new DOMParser().parseFromString(html, 'text/html').getElementById(id); })
    .catch(function () { return null; });
  load('assets/revise/' + nn + '.js', function () {
    load('assets/revise.js', function () { notes.then(build); });
  });

  function build(sec) {
    var R = (window.REVISE || {})[nn] || {}, s = (R.sections || {})[id] || {}, UI = window.ReviseUI;
    var full = page.f + '#' + id;

    /* Hero: topic, page, one-line definition, links */
    var hero = document.querySelector('.hero');
    hero.innerHTML = '';
    var kick = el('div', 'kicker', null, hero);
    var back = text('a', null, nn + ' · ' + page.t, kick);
    back.href = page.f;
    text('h1', null, topic[1], hero);
    var one = sec && sec.querySelector('p.oneliner');
    if (one) el('p', 'tp-one', one.innerHTML, hero);
    var links = el('div', 'toc', null, hero);
    el('a', null, '📖 Full section', links).href = full;
    el('a', null, '⚡ Quick revise for page ' + nn, links).href = page.f + '#revise';
    var pr = el('a', null, '🖨 Print', links);
    pr.href = '#'; pr.addEventListener('click', function (e) { e.preventDefault(); window.print(); });

    /* 1. What to say */
    if (s.say || (s.k && s.k.length) || (s.p && s.p.length)) {
      var b1 = block('🎤 Say this in 30 seconds', 'tp-say');
      if (s.say) el('p', 'tp-say-text', s.say, b1);
      if (s.k && s.k.length) {
        var chips = el('div', 'rv-chips', null, b1);
        el('span', 'rv-chips-h', 'Keywords', chips);
        s.k.forEach(function (k) { el('span', 'rv-chip', k, chips); });
      }
      if (s.p && s.p.length) {
        el('h4', 'rv-h', '🔑 Key points', b1);
        var ul = el('ul', 'tp-pts', null, b1);
        s.p.forEach(function (t) { el('li', null, t, ul); });
      }
    }

    /* 2. From the notes: points to remember and the interview angle */
    var picks = sec ? Array.prototype.filter.call(sec.querySelectorAll('.remember, .box'), function (n) {
      return n.classList.contains('remember') || /interview angle/i.test((n.querySelector('h4') || {}).textContent || '');
    }) : [];
    if (picks.length) {
      var b2 = block('📌 From the notes', 'tp-notes-pick');
      picks.forEach(function (n) { b2.appendChild(n.cloneNode(true)); });
    }

    /* 3. How to answer (steps for this page's topics) */
    if (R.approach && R.approach.length) {
      var b3 = block('🪜 How to answer', 'tp-answer');
      var ol = el('ol', 'rv-steps', null, b3);
      R.approach.forEach(function (a) { el('li', null, '<b>' + a[0] + '</b><span>' + a[1] + '</span>', ol); });
      if (R.traps && R.traps.length) {
        el('h4', 'rv-h', '⚠️ Avoid these', b3);
        var tr = el('ul', 'rv-traps', null, b3);
        R.traps.forEach(function (t) { el('li', null, t, tr); });
      }
    }

    /* 4. Flashcards: tap a question to see the answer */
    if (s.f && s.f.length) {
      var b4 = block('🃏 Flashcards (' + s.f.length + ')', 'tp-cards');
      el('p', 'rv-hint', 'Say your answer out loud, then tap the question to check.', b4);
      s.f.forEach(function (c) {
        var d = el('details', 'tp-fc', null, b4);
        el('summary', null, c[0], d);
        el('div', 'tp-fc-a', UI ? UI.starLines(c[1]) : c[1], d);
      });
    }

    /* 5. Quiz on this topic */
    var qs = UI ? UI.quizOf(nn).filter(function (x) { return x.key.indexOf(nn + '|' + id + '|') === 0; }) : [];
    if (qs.length) UI.quiz(el('div', 'rv-body', null, block('❓ Quick quiz', 'tp-quiz')), qs);

    /* 6. Full notes, folded */
    var b6 = block('📖 Full notes', 'tp-full');
    if (sec) {
      var fold = el('details', 'fold tp-fold', '<summary>Show the full section from page ' + nn + '</summary>', b6);
      var body = el('div', 'tp-fold-body', null, fold);
      Array.prototype.forEach.call(sec.children, function (c) { if (!/^H2$/.test(c.tagName) && !c.matches('p.oneliner')) body.appendChild(document.importNode(c, true)); });
      /* In-page links in the notes point back to the section's page. */
      body.querySelectorAll('a[href^="#"]').forEach(function (a) { a.setAttribute('href', page.f + a.getAttribute('href')); });
    } else {
      var p6 = el('p', null, 'The full notes are on page ' + nn + '. ', b6);
      text('a', null, 'Open the section →', p6).href = full;
    }

    /* 7. Other topics on this page */
    var i = page.s.indexOf(topic);
    var b7 = block('🧭 More on ' + page.t, 'tp-more');
    var pager = el('div', 'tp-pager', null, b7);
    if (i > 0) text('a', 'tp-prev', '← ' + page.s[i - 1][1], pager).href = topicHref(nn, page.s[i - 1][0]);
    if (i < page.s.length - 1) text('a', 'tp-next', page.s[i + 1][1] + ' →', pager).href = topicHref(nn, page.s[i + 1][0]);
    var all = el('div', 'tp-chips', null, b7);
    page.s.forEach(function (t) {
      var a = text('a', 'tp-chip' + (t === topic ? ' on' : ''), t[1], all);
      a.href = topicHref(nn, t[0]);
    });
    finish();
  }
})();
