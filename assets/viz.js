/* Tech Concepts Prep - animated diagram renderer.
   Usage: <figure class="viz" data-viz="seq|lanes|frames|journey|bars|steps">
            <script type="application/json">{ ...spec... }</script>
          </figure>
   Colours: blue, green, purple, amber, red, teal, slate, pink, off (greyed out). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var C = { blue: '#2563eb', green: '#059669', purple: '#7c3aed', amber: '#d97706', red: '#dc2626', teal: '#0f766e', slate: '#475569', pink: '#db2777', off: '#94a3b8' };
  var BG = { blue: '#dbeafe', green: '#d1fae5', purple: '#ede9fe', amber: '#fef3c7', red: '#fee2e2', teal: '#ccfbf1', slate: '#e2e8f0', pink: '#fce7f3', off: '#f1f5f9' };
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animation speed: one site-wide rate (0 = paused). The pill control is built at the end of this file. */
  var SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2], SPEED_KEY = 'tcp-anim-speed';
  var speed = 1, rate = 1;
  try { var saved = parseFloat(localStorage.getItem(SPEED_KEY)); if (SPEEDS.indexOf(saved) >= 0) speed = rate = saved; } catch (e) { }

  /* Waits ms of animation time: slower speeds stretch the wait and pause freezes it. */
  function sleep(ms) {
    return new Promise(function (r) {
      var left = ms, last = performance.now();
      (function tick() {
        var now = performance.now();
        left -= (now - last) * rate; last = now;
        if (left <= 0) r(); else setTimeout(tick, rate ? Math.min(left / rate, 250) : 250);
      })();
    });
  }
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function htmlEl(tag, cls, html, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, opts) {
    opts = opts || {};
    var t = svgEl('text', { x: x, y: y, 'text-anchor': opts.anchor || 'middle', 'font-size': opts.size || 13,
      'font-weight': opts.weight || 400, fill: opts.fill || '#1e293b' }, parent);
    if (opts.halo) { t.setAttribute('stroke', '#f8fafc'); t.setAttribute('stroke-width', 5); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); }
    t.textContent = s;
    return t;
  }
  function col(c) { return C[c] || C.slate; }
  function bg(c) { return BG[c] || BG.slate; }

  /* Only animate while the figure is on screen. */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      e.target._vis = e.isIntersecting;
      if (e.isIntersecting && e.target._wake) { var w = e.target._wake; e.target._wake = null; w(); }
    });
  }, { threshold: 0.1 }) : null;
  function visible(fig) {
    if (!io || fig._vis) return Promise.resolve();
    return new Promise(function (r) { fig._wake = r; });
  }
  function anim(node, frames, opts) {
    if (!node.animate) return { finished: Promise.resolve() };
    var a = node.animate(frames, opts);
    tune(a, true);
    return a;
  }

  /* Apply the current rate to a Web Animation (viz animations, plus CSS animations and transitions in diagrams).
     While paused, running animations freeze; new finite ones jump to their end so diagrams don't show half-drawn. */
  var SCOPE = 'figure.viz, .flow, svg';
  function tune(a, fresh) {
    var t = a.effect && a.effect.target;
    if (!t || !t.closest || !t.closest(SCOPE) || a.playState === 'finished') return;
    if (rate) {
      if (a.playbackRate !== rate) a.playbackRate = rate;
      if (a._spdPaused) { a._spdPaused = false; a.play(); }
    } else if (fresh && a.effect.getComputedTiming().endTime !== Infinity) {
      a.finish();
    } else if (a.playState === 'running') {
      a.pause(); a._spdPaused = true;
    }
  }
  function tuneAll() { if (document.getAnimations) document.getAnimations().forEach(function (a) { tune(a, false); }); }
  ['animationstart', 'transitionrun'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.target.getAnimations) e.target.getAnimations().forEach(function (a) { tune(a, true); });
    }, true);
  });

  /* ---------------- SEQUENCE DIAGRAM ---------------- */
  function seq(fig, s) {
    var n = s.actors.length;
    var colW = s.colW || (n <= 2 ? 300 : n === 3 ? 230 : n === 4 ? 190 : 165);
    var W = Math.max(colW * n, s.minWidth || 420);
    var top = 50, rowH = s.rowH || 46;
    var H = top + 18 + s.steps.length * rowH;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, class: 'viz-svg', role: 'img', 'aria-label': s.title || 'Sequence diagram' }, fig);
    var defs = svgEl('defs', {}, svg);
    Object.keys(C).forEach(function (k) {
      var m = svgEl('marker', { id: 'ah-' + k + '-' + fig._id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: C[k] }, m);
    });
    var off = (W - colW * n) / 2;
    var xs = s.actors.map(function (a, i) { return off + colW * i + colW / 2; });
    s.actors.forEach(function (a, i) {
      var name = typeof a === 'string' ? a : a.t, c = (typeof a === 'object' && a.c) || ['blue', 'purple', 'teal', 'amber', 'green', 'pink'][i % 6];
      var w = Math.min(colW - 18, 160);
      svgEl('line', { x1: xs[i], y1: 40, x2: xs[i], y2: H - 4, stroke: '#cbd5e1', 'stroke-width': 2, 'stroke-dasharray': '4 5' }, svg);
      svgEl('rect', { x: xs[i] - w / 2, y: 6, width: w, height: 32, rx: 9, fill: bg(c), stroke: col(c), 'stroke-width': 2 }, svg);
      txt(svg, xs[i], 27, name, { weight: 700, size: 13.5 });
    });
    var items = s.steps.map(function (st, i) {
      var y = top + 22 + i * rowH;
      var g = svgEl('g', { opacity: REDUCE ? 1 : 0 }, svg);
      var tone = st.c || 'slate';
      var it = { g: g, y: y, tone: tone };
      if (st.note != null) {
        var over = st.over || [0, n - 1];
        var lo = xs[Math.min.apply(null, over)], hi = xs[Math.max.apply(null, over)];
        var w = Math.min(W - 8, Math.max(hi - lo + 120, String(st.note).length * 7 + 28));
        var mid = Math.min(Math.max((lo + hi) / 2, 4 + w / 2), W - 4 - w / 2);
        var x1 = mid - w / 2, x2 = mid + w / 2;
        svgEl('rect', { x: x1, y: y - 17, width: x2 - x1, height: 28, rx: 8, fill: bg(tone), stroke: col(tone), 'stroke-width': 1.5 }, g);
        txt(g, (x1 + x2) / 2, y + 2, st.note, { size: 12.5, weight: 600 });
      } else if (st.from === st.to) {
        var x = xs[st.from];
        svgEl('path', { d: 'M' + x + ',' + (y - 10) + ' h34 v18 h-30', fill: 'none', stroke: col(tone), 'stroke-width': 2, 'marker-end': 'url(#ah-' + tone + '-' + fig._id + ')' }, g);
        txt(g, x + 42, y + 2, st.t, { anchor: 'start', size: 12.5, weight: 600 });
      } else {
        var a = xs[st.from], b = xs[st.to], dir = b > a ? 1 : -1;
        var xa = a + dir * 6, xb = b - dir * 8;
        var line = svgEl('line', { x1: xa, y1: y, x2: xb, y2: y, stroke: col(tone), 'stroke-width': 2.2, 'marker-end': 'url(#ah-' + tone + '-' + fig._id + ')' }, g);
        if (st.dash) line.setAttribute('stroke-dasharray', '6 5');
        txt(g, (a + b) / 2, y - 8, st.t, { size: 12.5, weight: 600, halo: true });
        if (st.sub) txt(g, (a + b) / 2, y + 16, st.sub, { size: 11, fill: '#64748b', halo: true });
        it.line = line; it.xa = xa; it.xb = xb; it.len = Math.abs(xb - xa);
      }
      return it;
    });
    if (REDUCE) return;
    var dotLayer = svgEl('g', {}, svg);
    (async function loop() {
      for (;;) {
        await visible(fig);
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          anim(it.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'forwards' });
          if (it.line) {
            var dot = svgEl('circle', { r: 6, cx: 0, cy: 0, fill: col(it.tone), stroke: '#fff', 'stroke-width': 2 }, dotLayer);
            var mv = anim(dot, [{ transform: 'translate(' + it.xa + 'px,' + it.y + 'px)' }, { transform: 'translate(' + it.xb + 'px,' + it.y + 'px)' }], { duration: 650, easing: 'ease-in-out', fill: 'forwards' });
            (function (d, m) { m.finished.then(function () { d.remove(); }); })(dot, mv);
          }
          await sleep(s.stepMs || 900);
        }
        await sleep(s.holdMs || 2600);
        items.forEach(function (it) { anim(it.g, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }); });
        await sleep(600);
      }
    })();
  }

  /* ---------------- TIMELINE / LANES ---------------- */
  function lanes(fig, s) {
    var labelW = s.labelW != null ? s.labelW : 110, W = s.width || 760, plotW = W - labelW - 16;
    var rowH = s.rowH || 38, spanH = (s.spans && s.spans.length) ? 34 : 6, markH = (s.markers && s.markers.length) ? 22 : 0;
    var top = spanH + markH, rowsH = s.rows.length * rowH;
    var H = top + rowsH + (s.ticks ? 24 : 4) + (s.axis ? 18 : 0);
    var max = s.max;
    function X(t) { return labelW + (t / max) * plotW; }
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, class: 'viz-svg', role: 'img', 'aria-label': s.title || 'Timeline' }, fig);
    var timed = [];
    s.rows.forEach(function (r, ri) {
      var y = top + ri * rowH;
      if (ri % 2 === 0) svgEl('rect', { x: labelW, y: y, width: plotW, height: rowH, fill: '#f8fafc' }, svg);
      txt(svg, labelW - 10, y + rowH / 2 + 5, r.label || '', { anchor: 'end', weight: 700, size: 12.5 });
      (r.blocks || []).forEach(function (b) {
        var c = b.c || 'blue', hf = b.h || 1, bh = (rowH - 10) * hf;
        var g = svgEl('g', {}, svg);
        var rect = svgEl('rect', { x: X(b.s) + 1, y: y + 5 + (rowH - 10 - bh), width: Math.max(2, X(b.e) - X(b.s) - 2), height: bh, rx: 6, fill: bg(c), stroke: col(c), 'stroke-width': 1.6 }, g);
        rect.style.transformBox = 'fill-box'; rect.style.transformOrigin = 'left center';
        var label = null;
        if (b.t) label = txt(g, (X(b.s) + X(b.e)) / 2, y + rowH / 2 + 5, b.t, { size: b.size || 12, weight: 600 });
        timed.push({ kind: 'block', rect: rect, label: label, s: b.s, e: b.e });
      });
    });
    (s.markers || []).forEach(function (m) {
      var g = svgEl('g', {}, svg);
      svgEl('line', { x1: X(m.at), y1: spanH + 21, x2: X(m.at), y2: top + rowsH, stroke: col(m.c || 'red'), 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
      txt(g, X(m.at), spanH + 16, m.t, { size: 12, weight: 700, fill: col(m.c || 'red'), halo: true });
      timed.push({ kind: 'fade', g: g, s: m.at });
    });
    (s.spans || []).forEach(function (sp) {
      var g = svgEl('g', {}, svg), c = col(sp.c || 'amber'), y = 22;
      svgEl('path', { d: 'M' + X(sp.s) + ',' + (y + 8) + ' v-8 H' + X(sp.e) + ' v8', fill: 'none', stroke: c, 'stroke-width': 2.2 }, g);
      txt(g, (X(sp.s) + X(sp.e)) / 2, y - 6, sp.t, { size: 12.5, weight: 800, fill: c });
      timed.push({ kind: 'fade', g: g, s: sp.e });
    });
    if (s.ticks) s.ticks.forEach(function (tk) { txt(svg, X(tk.at), top + rowsH + 17, tk.t, { size: 11.5, fill: '#64748b' }); });
    if (s.axis) txt(svg, labelW + plotW, H - 4, s.axis, { anchor: 'end', size: 11.5, fill: '#64748b' });
    var head = svgEl('line', { x1: 0, y1: spanH + 2, x2: 0, y2: top + rowsH, stroke: '#0f172a', 'stroke-width': 2, opacity: 0.55 }, svg);
    if (REDUCE) { head.remove(); return; }
    var dur = s.dur || 4500;
    (async function loop() {
      for (;;) {
        await visible(fig);
        timed.forEach(function (t) {
          var d0 = (t.s / max) * dur;
          if (t.kind === 'block') {
            anim(t.rect, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { delay: d0, duration: Math.max(180, ((t.e - t.s) / max) * dur), fill: 'both' });
            if (t.label) anim(t.label, [{ opacity: 0 }, { opacity: 1 }], { delay: d0 + 120, duration: 300, fill: 'both' });
          } else {
            anim(t.g, [{ opacity: 0 }, { opacity: 1 }], { delay: d0, duration: 350, fill: 'both' });
          }
        });
        anim(head, [{ transform: 'translateX(' + X(0) + 'px)' }, { transform: 'translateX(' + X(max) + 'px)' }], { duration: dur, fill: 'both' });
        await sleep(dur + (s.holdMs || 2500));
        timed.forEach(function (t) { anim(t.kind === 'block' ? t.rect : t.g, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }); if (t.label) anim(t.label, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }); });
        await sleep(400);
      }
    })();
  }

  /* ---------------- FRAMES (state changes) ---------------- */
  function itemHtml(it) {
    if (it.k === 'arrow') return { cls: 'vf-arrow', html: (it.g || '→') + (it.t ? '<small>' + it.t + '</small>' : '') };
    if (it.k === 'text') return { cls: 'vf-text' + (it.c ? ' tc-' + it.c : ''), html: it.t };
    if (it.k === 'gap') return { cls: 'vf-gap', html: '' };
    return { cls: 'vf-node c-' + (it.c || 'slate') + (it.big ? ' big' : ''), html: '<b>' + it.t + '</b>' + (it.sub ? '<small>' + it.sub + '</small>' : '') };
  }
  function frames(fig, s) {
    var stage = htmlEl('div', 'vf-stage', null, fig);
    var cap = htmlEl('div', 'vf-caption', '', fig);
    var dots = htmlEl('div', 'vf-dots', null, fig);
    var cur = -1, paused = false;
    var dotEls = s.frames.map(function (f, i) {
      var d = htmlEl('button', 'vf-dot', '<span>' + (i + 1) + '</span>' + (f.label ? ' ' + f.label : ''), dots);
      d.type = 'button';
      d.addEventListener('click', function () { show(i); paused = true; setTimeout(function () { paused = false; }, 6000); });
      return d;
    });
    function rowsOf(f) { return f.rows.map(function (r) { return Array.isArray(r) ? { items: r } : r; }); }
    function show(i) {
      var f = s.frames[i], rows = rowsOf(f);
      var rowEls = stage.children;
      if (rowEls.length !== rows.length) { stage.innerHTML = ''; }
      rows.forEach(function (r, ri) {
        var rowEl = stage.children[ri];
        if (!rowEl) { rowEl = htmlEl('div', 'vf-row', null, stage); }
        var lab = rowEl.querySelector('.vf-rowlabel');
        if (r.label && !lab) { lab = htmlEl('div', 'vf-rowlabel', r.label); rowEl.insertBefore(lab, rowEl.firstChild); }
        if (lab) lab.innerHTML = r.label || '';
        var cells = Array.prototype.filter.call(rowEl.children, function (c) { return !c.classList.contains('vf-rowlabel'); });
        if (cells.length !== r.items.length) {
          cells.forEach(function (c) { c.remove(); });
          cells = r.items.map(function () { return htmlEl('div', '', null, rowEl); });
          cells.forEach(function (c) { c._fresh = true; });
        }
        r.items.forEach(function (it, ci) {
          var cell = cells[ci], o = itemHtml(it);
          if (cell.className.replace(' pop', '') !== o.cls || cell.innerHTML !== o.html) {
            cell.className = o.cls; cell.innerHTML = o.html;
            if (cur >= 0 && !REDUCE) { cell.classList.remove('pop'); void cell.offsetWidth; cell.classList.add('pop'); }
          }
          if (it.w) cell.style.minWidth = it.w + 'px'; else cell.style.minWidth = '';
        });
      });
      cap.innerHTML = f.caption || '';
      if (!REDUCE && cur !== i) { cap.classList.remove('pop'); void cap.offsetWidth; cap.classList.add('pop'); }
      dotEls.forEach(function (d, di) { d.classList.toggle('on', di === i); });
      cur = i;
    }
    show(0);
    if (REDUCE) return;
    (async function loop() {
      for (;;) {
        await sleep(s.frames[cur].ms || s.interval || 1800);
        await visible(fig);
        if (!paused) show((cur + 1) % s.frames.length);
      }
    })();
  }

  /* ---------------- JOURNEY (vertical walkthrough) ---------------- */
  function journey(fig, s) {
    var wrap = htmlEl('div', 'vj', null, fig);
    var track = htmlEl('div', 'vj-track', null, wrap);
    var dot = htmlEl('div', 'vj-dot', null, wrap);
    var els = s.steps.map(function (st) {
      var li = htmlEl('div', 'vj-step' + (st.indent ? ' indent' : '') + (st.c ? ' c-' + st.c : ''), null, wrap);
      htmlEl('div', 'vj-icon', st.icon || '•', li);
      var body = htmlEl('div', 'vj-body', null, li);
      htmlEl('div', 'vj-title', st.t, body);
      if (st.d) htmlEl('div', 'vj-desc', st.d, body);
      if (st.tag) {
        var tag = htmlEl(st.href ? 'a' : 'span', 'vj-tag', st.tag, li);
        if (st.href) tag.href = st.href;
      }
      return li;
    });
    if (REDUCE) { dot.remove(); return; }
    (async function loop() {
      for (;;) {
        await visible(fig);
        for (var i = 0; i < els.length; i++) {
          els.forEach(function (e, j) { e.classList.toggle('on', j === i); e.classList.toggle('done', j < i); });
          dot.style.top = (els[i].offsetTop + els[i].offsetHeight / 2 - 7) + 'px';
          await sleep(s.stepMs || 1100);
        }
        await sleep(1500);
        els.forEach(function (e) { e.classList.remove('on', 'done'); });
        await sleep(300);
      }
    })();
  }

  /* ---------------- BARS ---------------- */
  function bars(fig, s) {
    var wrap = htmlEl('div', 'vb', null, fig);
    var max = s.max || Math.max.apply(null, s.rows.map(function (r) { return r.v; }));
    var fills = s.rows.map(function (r) {
      var row = htmlEl('div', 'vb-row', null, wrap);
      htmlEl('div', 'vb-label', r.label, row);
      var trackEl = htmlEl('div', 'vb-track', null, row);
      var fill = htmlEl('div', 'vb-fill c-' + (r.c || 'blue'), null, trackEl);
      fill.dataset.w = Math.min(100, (r.v / max) * 100) + '%';
      htmlEl('div', 'vb-val', (r.show != null ? r.show : r.v) + (r.note ? '<small>' + r.note + '</small>' : ''), row);
      return fill;
    });
    if (s.threshold) {
      var th = htmlEl('div', 'vb-threshold', '<span>' + s.threshold.t + '</span>', wrap);
      th.style.setProperty('--x', (s.threshold.v / max) * 100);
      wrap.style.paddingTop = '20px'; th.style.top = '18px';
    }
    if (REDUCE) { fills.forEach(function (f) { f.style.width = f.dataset.w; }); return; }
    (async function loop() {
      for (;;) {
        await visible(fig);
        for (var i = 0; i < fills.length; i++) { fills[i].style.width = fills[i].dataset.w; await sleep(260); }
        await sleep(s.holdMs || 4500);
        fills.forEach(function (f) { f.style.width = '0'; });
        await sleep(900);
      }
    })();
  }

  /* ---------------- STEPS (transcript / checklist reveal) ---------------- */
  function steps(fig, s) {
    var wrap = htmlEl('div', 'vs', null, fig);
    var els = s.items.map(function (it) {
      var row = htmlEl('div', 'vs-item' + (it.indent ? ' indent' : ''), null, wrap);
      htmlEl('span', 'vs-k c-' + (it.c || 'slate'), it.k, row);
      htmlEl('span', 'vs-t', it.t, row);
      return row;
    });
    if (REDUCE) { els.forEach(function (e) { e.classList.add('on'); }); return; }
    (async function loop() {
      for (;;) {
        await visible(fig);
        for (var i = 0; i < els.length; i++) { els[i].classList.add('on'); await sleep(s.stepMs || 1000); }
        await sleep(s.holdMs || 3000);
        els.forEach(function (e) { e.classList.remove('on'); });
        await sleep(500);
      }
    })();
  }

  var R = { seq: seq, lanes: lanes, frames: frames, journey: journey, bars: bars, steps: steps };
  var uid = 0;
  document.querySelectorAll('figure.viz').forEach(function (fig) {
    var script = fig.querySelector('script[type="application/json"]');
    if (!script) return;
    var spec;
    try { spec = JSON.parse(script.textContent); } catch (e) { fig.insertAdjacentHTML('beforeend', '<p class="viz-err">Diagram spec error: ' + e.message + '</p>'); return; }
    fig._id = ++uid;
    if (spec.title) htmlEl('figcaption', 'viz-title', spec.title, fig);
    var fn = R[fig.dataset.viz];
    if (!fn) return;
    if (io) io.observe(fig);
    try { fn(fig, spec); } catch (e) { fig.insertAdjacentHTML('beforeend', '<p class="viz-err">Diagram error: ' + e.message + '</p>'); }
  });

  /* Make the arrows in every static flow pulse in sequence, so the flow direction is visible. */
  if (!REDUCE) {
    document.querySelectorAll('.flow').forEach(function (flow) {
      flow.querySelectorAll('.ar').forEach(function (a, i) { a.style.animationDelay = (i * 0.35) + 's'; });
    });
  }

  /* Inline SVG (SMIL) animations have no playback rate, so at any speed other than 1x their clock is driven by hand. */
  var smil = Array.prototype.filter.call(document.querySelectorAll('svg'), function (s) {
    return s.pauseAnimations && !(s.parentElement && s.parentElement.closest('svg')) && s.querySelector('animate, animateTransform, animateMotion, set');
  });
  var smilRaf = 0, smilLast = 0;
  function smilTick(now) {
    var dt = (now - smilLast) / 1000; smilLast = now;
    smil.forEach(function (s) { s.setCurrentTime(s.getCurrentTime() + dt * rate); });
    smilRaf = requestAnimationFrame(smilTick);
  }
  function applySmil() {
    cancelAnimationFrame(smilRaf); smilRaf = 0;
    if (rate === 1) { smil.forEach(function (s) { s.unpauseAnimations(); }); return; }
    smil.forEach(function (s) { s.pauseAnimations(); });
    if (rate) { smilLast = performance.now(); smilRaf = requestAnimationFrame(smilTick); }
  }

  /* Speed control: a small pill (bottom left) on every page that has animations. */
  if (!document.querySelector('figure.viz, .flow .ar') && !smil.length) return;
  var spd = htmlEl('div', 'spd', null, document.body);
  spd.setAttribute('role', 'group'); spd.setAttribute('aria-label', 'Animation speed');
  htmlEl('span', 'spd-lab', 'Speed', spd).setAttribute('aria-hidden', 'true');
  function spdBtn(cls, label, fn) {
    var b = htmlEl('button', cls, null, spd);
    b.type = 'button'; b.setAttribute('aria-label', label); b.title = label;
    b.addEventListener('click', fn);
    return b;
  }
  var bPause = spdBtn('spd-pause', 'Pause animations', function () { rate = rate ? 0 : speed; apply(); });
  var bSlow = spdBtn('spd-step', 'Slower', function () { step(-1); });
  var bVal = spdBtn('spd-val', 'Reset to normal speed', function () { speed = 1; rate = 1; apply(); });
  var bFast = spdBtn('spd-step', 'Faster', function () { step(1); });
  bSlow.textContent = '\u2212'; bFast.textContent = '+';
  function step(d) {
    var i = SPEEDS.indexOf(speed) + d;
    if (i < 0 || i >= SPEEDS.length) return;
    speed = rate = SPEEDS[i]; apply();
  }
  function apply() {
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch (e) { }
    bVal.textContent = rate ? speed + '\u00d7' : 'Paused';
    bPause.textContent = rate ? '\u23f8' : '\u25b6';
    bPause.setAttribute('aria-label', rate ? 'Pause animations' : 'Play animations'); bPause.title = bPause.getAttribute('aria-label');
    bSlow.disabled = speed === SPEEDS[0]; bFast.disabled = speed === SPEEDS[SPEEDS.length - 1];
    spd.classList.toggle('off', !rate);
    tuneAll(); applySmil();
  }
  apply();
  requestAnimationFrame(tuneAll);
})();
