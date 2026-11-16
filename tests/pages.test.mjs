import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const exists = (p) => existsSync(new URL('../' + p, import.meta.url));
const size = (p) => statSync(new URL('../' + p, import.meta.url)).size;

const PAGES = ['index.html', 'work/agrani-internet-banking.html', 'work/primefocus-rpm.html', 'work/mra-ims.html', 'work/better-health.html', 'resume.html'];
const WORK = PAGES.slice(1, 5);
const facts = read('content/facts.md');
const css = read('styles.css');
const home = read('index.html');

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4));
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => (Math.max(lum(a), lum(b)) + .05) / (Math.min(lum(a), lum(b)) + .05);
const inOrder = (html, needles) => {
  let pos = 0;
  for (const n of needles) {
    const i = html.indexOf(n, pos);
    assert.ok(i >= 0, `missing or out of order: ${n}`);
    pos = i + n.length;
  }
};

for (const p of PAGES) {
  test(`${p}: head and landmarks`, () => {
    if (!exists(p)) assert.fail(`${p} does not exist`);
    const html = read(p);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/tanvir\.eliooo\.org\/[^"]*">/);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one h1');
    assert.match(html, /<a class="skip" href="#main">/);
    assert.match(html, /<main id="main"/);
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  });
}

test('styles.css carries the design tokens verbatim', () => {
  const t = JSON.parse(read('design/tokens.json'));
  for (const { name, value } of t.color.tokens) {
    if (typeof value !== 'string' || value.startsWith('{')) continue;
    assert.ok(css.toLowerCase().includes(`--${name}: ${value.toLowerCase()}`), `--${name}`);
  }
  assert.match(css, /body\s*{[^}]*background:\s*var\(--stage\)/s);
  assert.doesNotMatch(css, /\.resume/);
  assert.match(read('resume.css'), /\.resume\s*{/);
  assert.match(read('resume.html'), /href="resume\.css"/);
});

test('home: sections in order and four case-study links', () => {
  inOrder(home, ['id="top"', 'id="work"', 'id="how"', 'id="stack"', 'id="elioo"', 'id="timeline"', 'id="contact"']);
  for (const w of WORK) assert.match(home, new RegExp(`href="${w.replace('.html', '')}"`), w);
});

test('home: proof figures trace to facts', () => {
  for (const [shown, source] of [['583K+', '583K+'], ['$1.8B', '1.82B'], ['99.99%', '99.99%'], ['100%', '100% pass']]) {
    assert.ok(home.includes(shown), `home shows ${shown}`);
    assert.ok(facts.includes(source), `facts contain ${source}`);
  }
});

test('home: how, stack, elioo, timeline, contact', () => {
  const sec = (id) => home.slice(home.indexOf(`id="${id}"`), home.indexOf('</section>', home.indexOf(`id="${id}"`)));
  assert.equal((sec('how').match(/<h3/g) || []).length, 4);
  assert.equal((sec('stack').match(/<h3/g) || []).length, 4);
  assert.match(sec('elioo'), /href="https:\/\/eliooo\.org"/);
  assert.equal((sec('timeline').match(/<li/g) || []).length, 7);
  assert.match(sec('contact'), /mailto:k\.tanvir\.hossain@gmail\.com/);
  assert.match(sec('contact'), /github\.com\/KhondokerTanvirHossain/);
  assert.match(sec('contact'), /linkedin\.com\/in\/k-tanvir-hossain/);
});

for (const w of WORK) {
  test(`${w}: case study structure`, () => {
    const html = read(w);
    inOrder(html, ['>Context<', '>Constraint<', '>What I owned<', '>Architecture<', '>Decisions and trade-offs<', '>Outcome<', '>Stack<']);
    assert.equal((html.match(/<svg/g) || []).length, 1, 'one diagram');
    assert.match(html, /href="\.\.\/"/);
    assert.match(html, /href="\.\.\/resume\.pdf"/);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const words = main.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    assert.ok(words <= 700, `${words} words, limit 700`);
  });
}

test('resume: ATS structure', () => {
  const html = read('resume.html');
  inOrder(html, ['>Summary<', '>Experience<', '>Skills<', '>Education<', '>Certifications<']);
  assert.doesNotMatch(html, /<table/);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /<h1[^>]*>Khondoker Tanvir Hossain<\/h1>/);
  assert.match(html, /k\.tanvir\.hossain@gmail\.com/);
  assert.match(html, /linkedin\.com\/in\/k-tanvir-hossain/);
  assert.match(html, /github\.com\/KhondokerTanvirHossain/);
  assert.match(html, /Senior Software Engineer/);
});

test('resume.pdf exists and is small', () => {
  assert.ok(exists('resume.pdf'), 'resume.pdf missing, run npm run pdf');
  assert.ok(size('resume.pdf') < 400 * 1024, 'resume.pdf over 400 KB');
});

test('seo: sitemap and person schema', () => {
  const sm = read('sitemap.xml');
  assert.equal((sm.match(/<loc>/g) || []).length, 6);
  assert.match(home, /"@type":\s*"Person"/);
});

test('facts: products, availability, recommendations, Better Health', () => {
  for (const s of ['## Products', 'https://bolo.eliooo.org/', 'https://medioo.eliooo.org/', 'https://finioo.eliooo.org/', 'https://drugdb.eliooo.org/', 'Launching soon',
    '## Availability', '8am to 12pm US Eastern', '## Recommendations', 'Heronmoy Emon', 'Asiya Khatun Papiya', '25 engineers across four streams', 'patient-first'])
    assert.ok(facts.includes(s), `facts.md lacks: ${s}`);
  assert.doesNotMatch(facts, /~20 engineers/);
});

test('design tokens: every text pair named for contrast meets AA', () => {
  const t = JSON.parse(read('design/tokens.json'));
  const v = Object.fromEntries(t.color.tokens.map((x) => [x.name, x.value]));
  for (const [fg, bg, min] of [['ink', 'stage', 4.5], ['ink-2', 'stage', 4.5], ['ink-3', 'stage', 4.5], ['ink-2', 'surface', 4.5], ['ink-3', 'surface', 4.5], ['link', 'stage', 4.5],
    ['bolo-ink', 'bolo-sky-high', 4.5], ['bolo-ink', 'bolo-sky-mid', 4.5], ['bolo-link', 'bolo-sky-high', 4.5], ['medioo-ink', 'medioo-ground', 4.5], ['medioo-link', 'medioo-ground', 4.5],
    ['finioo-ink', 'finioo-ground', 4.5], ['finioo-ink-2', 'finioo-ground', 4.5], ['intellidrugs-ink', 'intellidrugs-ground', 4.5], ['intellidrugs-link', 'intellidrugs-ground', 4.5]])
    assert.ok(contrast(v[fg], v[bg]) >= min, `${fg} on ${bg}: ${contrast(v[fg], v[bg]).toFixed(2)}`);
});
