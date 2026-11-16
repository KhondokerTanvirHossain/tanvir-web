// Headless Chrome smoke test for the home page. Run: npm run smoke
// Starts a static server, drives Chrome over the DevTools protocol, prints PASS/FAIL per check, exits 1 on any failure.
// CHROME_PATH overrides the browser (CI: google-chrome).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { showState, PHASES } from '../show.js';

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
  const load = async (path = '') => { await send('Page.navigate', { url: BASE + path }); await sleep(2500); };
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

    // 4. At each product's hold point that chapter is fully in and its link is the only reachable one.
    for (let k = 0; k < 4; k++) {
      await scrollShow(PHASES.settleEnd + ((1 - PHASES.settleEnd) * k) / 3 + 0.01);
      const r = await ev(`(() => { const ch = [...document.querySelectorAll('.tp-chapter')]; const live = ch.filter((c) => !c.inert);
        return { layer: getComputedStyle(ch[${k}]).getPropertyValue('--layer').trim(), live: live.map((c) => ch.indexOf(c)) }; })()`);
      check(`${tag} chapter ${k} in, only its link reachable`, r.layer === '1' && r.live.length === 1 && r.live[0] === k, JSON.stringify(r));
    }

    // 5. Reloading mid-show paints the right product straight away.
    await scrollShow(0.62);
    await send('Page.reload'); await sleep(2500);
    const after = await ev(`(() => { const s = document.querySelector('.tp-show'); const span = s.offsetHeight - innerHeight;
      return { p: Math.min(1, Math.max(0, -s.getBoundingClientRect().top / span)), on: [...document.querySelectorAll('.tp-rail button')].findIndex((b) => b.classList.contains('is-on')) }; })()`);
    check(`${tag} reload mid-show shows the right product`, after.on === showState(after.p, 4).active, JSON.stringify(after));
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
  check('show scrolls at a steady frame rate', timing < 20, `p95 ${timing.toFixed(1)} ms`);

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
