// Validates the quick-revision data files (assets/revise/NN.js) against their pages.
//   node tools/check-revise.mjs            (all files)
//   node tools/check-revise.mjs 05 14      (selected pages)
// Prints one line per page; lines starting with "FAIL" or "WARN" need attention.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'assets', 'revise');
const want = process.argv.slice(2);
const pages = Object.fromEntries(readdirSync(root)
  .filter(f => /^\d{2}-.*\.html$/.test(f) && !/http-equiv="refresh"/.test(readFileSync(join(root, f), 'utf8')))
  .map(f => [f.slice(0, 2), f]));
const files = readdirSync(dataDir).filter(f => /^\d{2}\.js$/.test(f)).map(f => f.slice(0, 2)).filter(n => !want.length || want.includes(n));
const words = s => String(s).replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
let failed = 0;

for (const nn of files) {
  const errs = [], warns = [];
  const ctx = { window: {} };
  try { vm.runInNewContext(readFileSync(join(dataDir, nn + '.js'), 'utf8'), ctx, { filename: nn + '.js' }); }
  catch (e) { console.log(`FAIL ${nn}: syntax error: ${e.message}`); failed++; continue; }
  const d = ctx.window.REVISE && ctx.window.REVISE[nn];
  if (!d) { console.log(`FAIL ${nn}: window.REVISE['${nn}'] not set`); failed++; continue; }
  const html = pages[nn] && readFileSync(join(root, pages[nn]), 'utf8');
  if (!html) errs.push('no matching NN-*.html page');
  const ids = html ? [...html.matchAll(/<section class="concept" id="([^"]+)"/g)].map(m => m[1]) : [];
  const secs = d.sections || {};
  ids.filter(id => !secs[id]).forEach(id => errs.push(`missing section "${id}"`));
  Object.keys(secs).filter(id => !ids.includes(id)).forEach(id => errs.push(`unknown section "${id}"`));
  const arr = (v, lo, hi, what) => { if (!Array.isArray(v) || v.length < lo || v.length > hi) errs.push(`${what}: expected ${lo}-${hi} items, got ${Array.isArray(v) ? v.length : typeof v}`); return Array.isArray(v) ? v : []; };
  arr(d.approach, 4, 7, 'approach').forEach((s, i) => { if (!Array.isArray(s) || s.length !== 2 || !s[0] || !s[1]) errs.push(`approach[${i}] must be [step, detail]`); });
  if (d.traps) arr(d.traps, 1, 5, 'traps');
  let cards = 0, qs = 0;
  for (const [id, s] of Object.entries(secs)) {
    const at = `"${id}"`;
    if (typeof s.say !== 'string' || words(s.say) < 12 || words(s.say) > 70) errs.push(`${at}.say: 12-70 words (got ${words(s.say || '')})`);
    arr(s.k, 4, 8, `${at}.k`);
    arr(s.p, 2, 4, `${at}.p`);
    arr(s.f, 1, 8, `${at}.f`).forEach((c, i) => { if (!Array.isArray(c) || c.length !== 2 || !c[0] || !c[1]) errs.push(`${at}.f[${i}] must be [question, answer]`); cards++; });
    arr(s.q, 1, 2, `${at}.q`).forEach((q, i) => {
      qs++;
      if (!q || !q.q || !Array.isArray(q.o) || q.o.length !== 4 || !Number.isInteger(q.a) || q.a < 0 || q.a > 3 || !q.e) errs.push(`${at}.q[${i}] needs q, 4 options o, a (0-3) and e`);
      else {
        if (new Set(q.o).size !== 4) errs.push(`${at}.q[${i}] has duplicate options`);
        if (q.o.some(o => /\b(all|none|both) of the above\b/i.test(o))) errs.push(`${at}.q[${i}]: options are shuffled, so don't use "all/none of the above"`);
      }
    });
  }
  const text = JSON.stringify(d);
  if (/<script|on\w+=/i.test(text)) errs.push('contains <script> or inline event handlers');
  if (/westpac/i.test(text)) errs.push('mentions an employer name');
  const status = errs.length ? 'FAIL' : warns.length ? 'WARN' : 'ok  ';
  if (errs.length) failed++;
  console.log(`${status} ${nn}: ${Object.keys(secs).length}/${ids.length} sections, ${cards} cards, ${qs} quiz`);
  [...errs, ...warns].forEach(e => console.log('     - ' + e));
}
process.exitCode = failed ? 1 : 0;
