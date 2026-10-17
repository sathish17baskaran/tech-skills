// Adds a "Copy" button to every LinkedIn post idea block.
document.querySelectorAll('.post').forEach(function (post) {
  var btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';
  btn.addEventListener('click', function () {
    var text = Array.from(post.querySelectorAll('p, li')).map(function (el) { return el.innerText; }).join('\n\n');
    var done = function () { btn.textContent = 'Copied ✓'; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); done();
    }
  });
  post.appendChild(btn);
});

// Interview-first pages: fold the .NET implementation box and the LinkedIn post behind a one-line summary.
function fold(box, cls, summary) {
  var d = document.createElement('details');
  d.className = 'fold ' + cls;
  d.innerHTML = '<summary>' + summary + '</summary>';
  box.parentNode.insertBefore(d, box);
  d.appendChild(box);
}
document.querySelectorAll('main .dotnet').forEach(function (box) {
  var head = box.querySelector('.dotnet-head');
  var title = head ? head.innerHTML : '<span class="dotnet-logo">.NET 10</span> How to implement it';
  if (head) head.remove();
  fold(box, 'fold-dotnet', title + ' <small>packages &amp; code</small>');
});
document.querySelectorAll('main .post').forEach(function (box) {
  fold(box, 'fold-post', '📣 LinkedIn post <small>ready to copy</small>');
});
// Open everything when printing, and open a fold that a link points into.
window.addEventListener('beforeprint', function () { document.querySelectorAll('details').forEach(function (d) { d.open = true; }); });
function openTarget() {
  var t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
  for (var p = t && t.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
}
window.addEventListener('hashchange', openTarget);
openTarget();

// Mobile: label table cells with their column header so tables can stack into cards on small screens.
document.querySelectorAll('main table').forEach(function (table) {
  var rows = table.rows;
  if (!rows.length) return;
  var head = rows[0];
  var isHead = Array.prototype.every.call(head.cells, function (c) { return c.tagName === 'TH'; });
  if (!isHead || head.cells.length < 2) return;
  var labels = Array.prototype.map.call(head.cells, function (c) { return c.textContent.trim(); });
  head.classList.add('stack-head');
  for (var i = 1; i < rows.length; i++) {
    var col = 0;
    Array.prototype.forEach.call(rows[i].cells, function (cell) {
      var span = cell.colSpan || 1;
      var label = labels.slice(col, col + span).filter(Boolean).join(' \u00b7 ');
      if (label && !cell.hasAttribute('data-label')) cell.setAttribute('data-label', label);
      col += span;
    });
  }
  table.classList.add('stack');
});

// Mobile: keep diagram labels readable. Hand-drawn SVGs get a minimum width (based on their
// smallest font) and scroll sideways inside their own box instead of shrinking the text.
function readableSvg(svg) {
  var vb = svg.viewBox && svg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  // viz.js diagrams draw their labels progressively (13px labels, 11px captions): keep them at >= 85% size.
  if (svg.closest('figure.viz')) { svg.style.setProperty('--minw', Math.round(vb.width * 0.85) + 'px'); return; }
  var minFont = 99;
  svg.querySelectorAll('text').forEach(function (t) {
    var fs = parseFloat(t.getAttribute('font-size')) || 13;
    if (fs < minFont) minFont = fs;
  });
  if (minFont === 99) return;
  var need = Math.min(vb.width, Math.round(vb.width * 10.5 / minFont));
  svg.style.setProperty('--minw', need + 'px');
}
function markScrollable() {
  document.querySelectorAll('figure.viz, .svgwrap').forEach(function (box) {
    box.classList.toggle('scrollx', box.scrollWidth > box.clientWidth + 4);
  });
}
document.querySelectorAll('.svgwrap svg, figure.viz svg').forEach(readableSvg);
new MutationObserver(function (list) {
  list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.tagName === 'svg' || n.tagName === 'SVG') { readableSvg(n); markScrollable(); } }); });
}).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
window.addEventListener('load', markScrollable);
window.addEventListener('resize', markScrollable);