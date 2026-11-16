// Headless Chrome smoke test for the home page. Run: npm run smoke
// Starts a static server, drives Chrome over the DevTools protocol, prints PASS/FAIL per check, exits 1 on any failure.
// CHROME_PATH overrides the browser (CI: google-chrome).
import { spawn } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showState, holdProgress, PHASES } from '../show.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4181;
const DEBUG = 9333;
const BASE = `http://127.0.0.1:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'smoke-'))}`, '--hide-scrollbars', '--no-first-run', '--no-sandbox', 'about:blank'], { stdio: 'ignore' });
const stop = () => { chrome.kill(); server.kill(); };

let failures = 0;
const check = (name, ok, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

try {
  let targets;
  for (let i = 0; i < 60 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${DEBUG}/json`)).json(); } catch { await sleep(250); } }
  for (let i = 0; i < 40; i++) { try { await fetch(BASE); break; } catch { await sleep(250); } }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  let seq = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error' && !/fonts\.(googleapis|gstatic)/.test(d.params.entry.url || '')) errors.push(`${d.params.entry.text} ${d.params.entry.url || ''}`);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++seq; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'evaluate failed');
    return r.result?.result?.value;
  };
  const viewport = (w, h) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  const load = async (path = '', base = BASE) => { await send('Page.navigate', { url: base + path }); await sleep(2500); };
  const tab = async () => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await sleep(650); };
  const scrollShow = async (p) => {
    await ev(`(() => { const s = document.querySelector('.tp-show'); const top = s.getBoundingClientRect().top + scrollY; scrollTo(0, top + (s.offsetHeight - innerHeight) * ${p}); })()`);
    await sleep(450);
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await viewport(w, h);
    await load();
    const tag = `${w}x${h}`;

    // 1. No sideways scroll at the top, mid-show and bottom.
    const over = [];
    over.push(await ev('document.documentElement.scrollWidth - innerWidth'));
    await scrollShow(0.5); over.push(await ev('document.documentElement.scrollWidth - innerWidth'));
    await ev('scrollTo(0, document.documentElement.scrollHeight)'); await sleep(300); over.push(await ev('document.documentElement.scrollWidth - innerWidth'));
    check(`${tag} no horizontal overflow`, over.every((o) => o <= 0), over.join(','));

    // 2. The résumé button is on the first screen.
    await ev('scrollTo(0,0)'); await sleep(300);
    const btn = await ev(`document.querySelector('#hero a[href="resume.pdf"]').getBoundingClientRect().bottom`);
    check(`${tag} résumé button in first viewport`, btn <= h, `bottom ${Math.round(btn)}`);

    // 3. The nav stays a thin bar inside the show (regression: a class collision once made it full-screen).
    await scrollShow(0.5);
    const navH = await ev(`document.querySelector('.tp-nav').getBoundingClientRect().height`);
    check(`${tag} nav is 52px inside the show`, Math.round(navH) === 52, `${navH}`);

    // 4. Keyboard: Tab from the client strip reaches each product's link in order, on screen in a fully shown chapter,
    //    and a click at that spot lands on that link (hidden chapters must not swallow it).
    await ev(`document.querySelector('.tp-marquee').focus()`);
    for (let k = 0; k < 4; k++) {
      await tab();
      const r = await ev(`(() => { const a = document.activeElement; const ch = [...document.querySelectorAll('.tp-chapter')]; const i = ch.findIndex((c) => c.contains(a));
        const b = a.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return { i, cta: a.classList.contains('tp-chapter__cta'), layer: i >= 0 ? getComputedStyle(ch[i]).getPropertyValue('--layer').trim() : null,
          onScreen: b.top >= 0 && b.bottom <= innerHeight, hit: !!hit && hit.closest('a') === a }; })()`);
      check(`${tag} Tab reaches product ${k} and it is clickable`, r.i === k && r.cta && r.layer === '1' && r.onScreen && r.hit, JSON.stringify(r));
    }

    // 4b. Tabbing into the nav while it is tucked away over the hero brings it into view.
    await ev(`scrollTo(0,0); document.querySelector('.skip').focus()`); await sleep(300);
    await tab();
    const navFocus = await ev(`(() => { const n = document.querySelector('.tp-nav'); return { inNav: n.contains(document.activeElement), top: Math.round(n.getBoundingClientRect().top) }; })()`);
    check(`${tag} focused nav is visible`, navFocus.inNav && navFocus.top >= 0, JSON.stringify(navFocus));

    // 5. Reloading mid-show paints the right product straight away.
    await scrollShow(0.62);
    await send('Page.reload'); await sleep(2500);
    const after = await ev(`(() => { const s = document.querySelector('.tp-show'); const span = s.offsetHeight - innerHeight;
      return { p: Math.min(1, Math.max(0, -s.getBoundingClientRect().top / span)), on: [...document.querySelectorAll('.tp-rail button')].findIndex((b) => b.classList.contains('is-on')) }; })()`);
    check(`${tag} reload mid-show shows the right product`, after.on === showState(after.p, 4).active, JSON.stringify(after));
  }

  // 4c. Short and landscape screens: at each hold the product link and the film clear the rail and the viewport.
  for (const [w, h] of [[844, 390], [375, 548]]) {
    await viewport(w, h); await load();
    for (let k = 0; k < 4; k++) {
      await scrollShow(holdProgress(k, 4) + 0.003);
      const r = await ev(`(() => { const ch = document.querySelectorAll('.tp-chapter')[${k}]; const a = ch.querySelector('.tp-chapter__cta').getBoundingClientRect();
        const f = ch.querySelector('.tp-film').getBoundingClientRect(); const rail = document.querySelector('.tp-rail'); const rr = rail.getBoundingClientRect();
        const railOn = parseFloat(getComputedStyle(rail).opacity) > 0.5; const clear = (b) => !railOn || b.bottom <= rr.top + 1 || b.right <= rr.left || b.left >= rr.right;
        return { link: a.bottom <= innerHeight && clear(a), film: f.bottom <= innerHeight + 1 && clear(f), a: Math.round(a.bottom), f: Math.round(f.bottom), rail: Math.round(rr.top) }; })()`);
      check(`${w}x${h} product ${k} link and film clear the rail`, r.link && r.film, JSON.stringify(r));
    }
  }

  // 4d. Films: a missing WebM falls back to the MP4, and only the visible product's film plays.
  if ((() => { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } })()) {
    const site = mkdtempSync(join(tmpdir(), 'smoke-site-'));
    for (const f of ['index.html', 'styles.css', 'home.css', 'main.js', 'overview.js', 'show.js', 'films.js', 'favicon.svg']) cpSync(join(ROOT, f), join(site, f));
    cpSync(join(ROOT, 'assets'), join(site, 'assets'), { recursive: true, filter: (src) => !src.includes('/src') });
    mkdirSync(join(site, 'assets/films'), { recursive: true });
    const clip = (out, codec) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=purple:s=320x200:d=2', '-c:v', codec, '-pix_fmt', 'yuv420p', ...(codec === 'libx264' ? ['-movflags', '+faststart'] : []), out]);
    clip(join(site, 'assets/films/bolo.mp4'), 'libx264'); // no bolo.webm on purpose
    clip(join(site, 'assets/films/medioo.webm'), 'libvpx-vp9');
    clip(join(site, 'assets/films/medioo.mp4'), 'libx264');
    for (const n of ['bolo', 'medioo']) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=purple:s=320x200', '-frames:v', '1', join(site, `assets/films/${n}-poster.jpg`)]);
    const errorsBefore = errors.length; // the fixture's missing bolo.webm 404 is deliberate
    writeFileSync(join(site, 'index.html'), readFileSync(join(site, 'index.html'), 'utf8').replace('data-film="bolo"', 'data-film="bolo" data-film-ready').replace('data-film="medioo"', 'data-film="medioo" data-film-ready'));
    const films = spawn('python3', ['-m', 'http.server', '4183', '--bind', '127.0.0.1'], { cwd: site, stdio: 'ignore' });
    try {
      await sleep(800);
      await viewport(1440, 900); await load('', 'http://127.0.0.1:4183/');
      const state = `(() => { const v = (n) => document.querySelector('[data-film=' + n + '] video'); return { bolo: v('bolo') ? (v('bolo').paused ? 'paused' : 'playing') : 'gone', medioo: v('medioo') ? (v('medioo').paused ? 'paused' : 'playing') : 'gone' }; })()`;
      await scrollShow(holdProgress(0, 4) + 0.003); await sleep(3000);
      const atBolo = await ev(state);
      check('film: missing WebM falls back to MP4', atBolo.bolo === 'playing', JSON.stringify(atBolo));
      check('film: hidden product does not play', atBolo.medioo !== 'playing', JSON.stringify(atBolo));
      await scrollShow(holdProgress(1, 4) + 0.003); await sleep(1500);
      const atMedioo = await ev(state);
      check('film: only the visible product plays', atMedioo.medioo === 'playing' && atMedioo.bolo !== 'playing', JSON.stringify(atMedioo));
    } finally { films.kill(); errors.length = errorsBefore; }
  } else {
    console.log('INFO  ffmpeg not found: film checks skipped');
  }

  // 6. Resizing mid-show re-measures the film: at the full-screen hold it still covers the stage.
  await viewport(1440, 900); await load();
  await scrollShow((PHASES.expandEnd + PHASES.holdEnd) / 2);
  await viewport(1024, 768); await sleep(600);
  await scrollShow((PHASES.expandEnd + PHASES.holdEnd) / 2 + 0.001);
  const cover = await ev(`(() => { const f = document.querySelector('.tp-chapter--bolo .tp-film').getBoundingClientRect(); return { l: f.left, t: f.top, r: f.right - innerWidth, b: f.bottom - innerHeight }; })()`);
  check('resize keeps the full-screen film covering the stage', cover.l <= 2 && cover.t <= 2 && cover.r >= -2 && cover.b >= -2, JSON.stringify(cover));

  // 7. Scrolling the show stays smooth.
  await viewport(1440, 900); await load();
  await scrollShow(0);
  const timing = await ev(`new Promise((done) => { const s = document.querySelector('.tp-show'); const start = scrollY; const end = start + (s.offsetHeight - innerHeight) * 0.35;
    const gaps = []; let last = performance.now(); const t0 = last;
    function step(now) { gaps.push(now - last); last = now; const k = Math.min(1, (now - t0) / 2500); scrollTo(0, start + (end - start) * k);
      if (k < 1) requestAnimationFrame(step); else { gaps.sort((a, b) => a - b); done(gaps[Math.floor(gaps.length * 0.95)]); } }
    requestAnimationFrame(step); })`);
  // CI runners have no GPU, so frame timing there is noise: report it, but only fail locally.
  const timingOk = timing < 20;
  if (process.env.CI && !timingOk) console.log(`INFO  show frame rate on CI (no GPU): p95 ${timing.toFixed(1)} ms, not enforced`);
  else check('show scrolls at a steady frame rate', timingOk, `p95 ${timing.toFixed(1)} ms`);

  // 9. No script errors on any of the loads above.
  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  // 8. With JavaScript off, all four products are readable.
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await load();
  const nojs = await ev(`[...document.querySelectorAll('.tp-chapter')].map((c) => { const t = c.querySelector('.tp-chapter__title').getBoundingClientRect();
    return t.height > 0 && getComputedStyle(c).opacity !== '0' && getComputedStyle(c.querySelector('.tp-chapter__copy')).opacity !== '0'; })`);
  check('no-JS: all four products visible', nojs.length === 4 && nojs.every(Boolean), JSON.stringify(nojs));

  ws.close();
} catch (e) {
  failures++;
  console.log(`FAIL  smoke run crashed: ${e.message}`);
} finally {
  stop();
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
