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
