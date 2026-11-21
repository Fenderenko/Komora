// Regression check of a stylesheet rewrite in the mock (tools/shot.html): the computed style of every element in a set
// of page states, before and after swapping web/app.css for web/app.new.css. Loaded by hand from the console:
//   const m = await import('/tools/cssdiff.js?x=' + Date.now()); await m.snap('before'); await m.swap(); await m.snap('after'); m.diff();
const PROPS = ['display', 'position', 'top', 'left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'color', 'background-color', 'background-image', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-color', 'border-left-color',
  'border-top-left-radius', 'border-bottom-right-radius', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform', 'text-align',
  'gap', 'opacity', 'box-shadow', 'transform', 'filter', 'visibility', 'outline-style', 'outline-color', 'cursor', 'white-space', 'overflow-x', 'overflow-y',
  'grid-template-columns', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-items', 'justify-content', 'z-index', 'animation-name', 'pointer-events', 'text-overflow'];
const wait = ms => new Promise(r => setTimeout(r, ms));
const nav = v => document.querySelector(`#nav [data-view="${v}"]`)?.click();
const click = sel => document.querySelector(sel)?.click();
/** The page states: each renders something, then the whole document is read. */
const STATES = [
  ['home', () => nav('home')],
  ['homeOpen', () => { localStorage.setItem('k_pcFold', 'false'); try { window.store?.set('pcFold', false); } catch {} nav('all'); nav('home'); }],
  ['all', () => nav('all')],
  ['kit', () => nav('kit')],
  ['kitRules', () => { nav('kit'); click('[data-act="kitRules"]'); }],
  ['newpc', () => { document.body.click(); nav('newpc'); }],
  ['updates', () => nav('updates')],
  ['pc', () => nav('pc')],
  ['discover', () => nav('discover')],
  ['discoverF', () => click('[data-act="discFilters"]')],
  ['discoverF2', () => click('[data-act="discFilters"]')],
  ['tweaks', () => nav('tweaks')],
  ['tweaksFix', () => click('[data-act="tweakTab"][data-tab="fix"]')],
  ['tweaksTw', () => click('[data-act="tweakTab"][data-tab="tw"]')],
  ['settings', () => nav('settings')],
  ['app', () => window.openApp('gh:sharex/sharex')],
  ['add', () => window.openAdd('https://github.com/a/b')],
  ['dialog', () => { window.closeOverlay?.(); nav('all'); window.dialog({ title: 'Title', text: 'Text', ok: 'OK', danger: true, input: { value: 'x' } }); }],
  ['toast', () => { window.closeOverlay?.(); window.toast('Done'); window.toast('Failed', true); }],
  ['search', () => { const q = document.getElementById('q'); if (q) { q.focus(); q.value = 'sha'; q.dispatchEvent(new Event('input', { bubbles: true })); } }],
  ['menu', () => { document.activeElement?.blur?.(); window.closeFly?.(); document.body.click(); window.closeOverlay?.(); nav('all'); click('[data-act="tagPick"]'); }],
  ['bulk', () => { window.closeOverlay?.(); const rs = [...document.querySelectorAll('.r[data-id]')].slice(0, 2); for (const r of rs) r.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true })); }],
  ['welcome', () => { window.closeOverlay?.(); document.getElementById('main').innerHTML = window.welcome(); }],
];
const path = el => { const p = []; for (let e = el; e && e !== document.body; e = e.parentElement) p.push(e.tagName + (e.parentElement ? [...e.parentElement.children].indexOf(e) : '')); return p.reverse().join('>'); };
const store = {};
/** Back to a calm page: no focus, flyouts, toasts, selection or cursor left from an earlier pass. */
async function reset() {
  document.activeElement?.blur?.();
  const q = document.getElementById('q');
  if (q) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); }
  window.closeOverlay?.();
  window.closeFly?.();
  document.getElementById('toasts')?.replaceChildren();
  try { window.eval('cursor = null; multi.clear()'); } catch {}
  nav('home');
  await wait(400);
}
export async function snap(name) {
  await reset();
  const out = new Map();
  for (const [st, fn] of STATES) {
    try { fn(); } catch (e) { out.set(st + '|ERR', String(e)); }
    await wait(250);
    for (const el of document.body.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName !== 'svg') continue;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      out.set(`${st}|${path(el)}`, { cls: (el.className?.baseVal ?? el.className) + '', v: PROPS.map(p => cs.getPropertyValue(p)).concat([Math.round(r.width), Math.round(r.height), Math.round(r.x), Math.round(r.y)]) });
      for (const pe of ['::before', '::after']) {
        const ps = getComputedStyle(el, pe);
        if (ps.content && ps.content !== 'none') out.set(`${st}|${path(el)}${pe}`, { cls: pe, v: PROPS.map(p => ps.getPropertyValue(p)).concat([ps.content, ps.width, ps.height]) });
      }
    }
  }
  store[name] = out;
  return out.size;
}
/** Pairs of selector lists [a, b] (tools/pairs.json) that never style the same element in any state, while both style
 *  something: merging a's repeats past b cannot change the cascade. Pseudo-classes and pseudo-elements are dropped
 *  (the selector only gets broader, so the check stays on the safe side). */
let lastBoth = [];
export async function coMatch() {
  const pairs = await fetch('/tools/pairs.json?x=' + Date.now()).then(r => r.json());
  const simple = list => list.split(',').map(s => s.trim().replace(/:root/g, 'html').replace(/::?[\w-]+(\((?:[^()]|\([^()]*\))*\))?/g, '').trim() || '*').join(',');
  const sels = [...new Set(pairs.flat())];
  const hit = new Map(sels.map(s => [s, false]));
  const both = new Set();
  lastBoth = [];
  for (const [, fn] of STATES) {
    try { fn(); } catch {}
    await wait(200);
    const sets = new Map();
    for (const s of sels) {
      let els;
      try { els = new Set(document.querySelectorAll(simple(s))); } catch { els = null; }
      sets.set(s, els);
      if (els === null || els.size) hit.set(s, true);
    }
    pairs.forEach(([a, b], i) => {
      const A = sets.get(a), B = sets.get(b);
      if (A === null || B === null) { both.add(i); return; }
      for (const e of A) if (B.has(e)) { both.add(i); return; }
    });
  }
  lastBoth = [...both];
  return pairs.filter(([a, b], i) => !both.has(i) && hit.get(a) && hit.get(b));
}
/** coMatch's verdicts as two bit masks over tools/pairs.json: allowed (never the same element), denied (seen together). */
export async function verdicts() {
  const pairs = await fetch('/tools/pairs.json?x=' + Date.now()).then(r => r.json());
  const ok = new Set((await coMatch()).map(p => p[0] + '' + p[1]));
  const deny = new Set(lastBoth.map(i => pairs[i][0] + '' + pairs[i][1]));
  const mask = set => { const b = new Uint8Array(Math.ceil(pairs.length / 8)); pairs.forEach(([x, y], i) => { if (set.has(x + '' + y)) b[i >> 3] |= 1 << (i & 7); }); return btoa(String.fromCharCode(...b)); };
  return mask(ok) + ' ' + mask(deny);
}
export async function swap(href = '../web/app.new.css') {
  const l = document.querySelector('link[rel="stylesheet"][href*="app"]');
  await new Promise(res => { l.onload = res; l.href = href + '?x=' + Date.now(); });
  await wait(300);
}
export function diff(limit = 60) {
  const a = store.before, b = store.after, names = PROPS.concat(['w', 'h', 'x', 'y', 'content', 'pw', 'ph']);
  const out = [], kinds = {};
  for (const [k, va] of a) {
    const vb = b.get(k);
    if (!vb) { out.push(`MISSING ${k}`); continue; }
    va.v.forEach((x, i) => {
      if (String(x) !== String(vb.v[i])) {
        const key = `${names[i]} @ ${va.cls.slice(0, 40)}`;
        kinds[key] = (kinds[key] || 0) + 1;
        if (kinds[key] === 1) out.push(`${k.split('|')[0]} ${key}: ${x} → ${vb.v[i]}`);
      }
    });
  }
  for (const k of b.keys()) if (!a.has(k)) out.push(`EXTRA ${k}`);
  return { total: Object.values(kinds).reduce((s, x) => s + x, 0), kinds: Object.keys(kinds).length, first: out.slice(0, limit) };
}
