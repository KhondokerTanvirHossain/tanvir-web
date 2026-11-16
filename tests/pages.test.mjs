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
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1(, viewport-fit=cover)?">/);
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

const sec = (id) => home.slice(home.indexOf(`id="${id}"`), home.indexOf('</section>', home.indexOf(`id="${id}"`)));
test('home: sections in order', () => inOrder(home, ['id="hero"', 'id="overview"', 'id="products"', 'class="tp-show"', 'id="work"', 'id="lead"', 'id="about"', 'id="contact"']));
test('home: hero states the role and the résumé', () => {
  assert.match(home, /<h1[^>]*>I lead the team\. And ship the whole product\.<\/h1>/);
  assert.match(sec('hero'), /Open to remote Engineering Lead roles/);
  assert.match(sec('hero'), /href="resume\.pdf"/);
  assert.match(sec('hero'), /25 engineers/);
  assert.match(sec('hero'), /patient-first/);
  assert.match(sec('hero'), /<img[^>]+portrait-1086\.jpg[^>]+alt="Tanvir Hossain/);
});
test('home: four product chapters with their live links', () => {
  for (const [p, url] of [['bolo', 'https://bolo.eliooo.org/'], ['medioo', 'https://medioo.eliooo.org/'], ['finioo', 'https://finioo.eliooo.org/'], ['intellidrugs', 'https://drugdb.eliooo.org/']]) {
    assert.match(home, new RegExp(`tp-chapter--${p}`)); assert.ok(home.includes(`href="${url}"`), url); assert.match(home, new RegExp(`data-film="${p}"`));
  }
  assert.match(home, /Launching soon/);
  assert.match(home, /honest about what it doesn.t know/);
});
test('home: every figure traces to facts', () => {
  for (const [shown, source] of [['25', '25 engineers'], ['583K+', '583K+'], ['$1.8B', '1.82B'], ['99.99%', '99.99%'], ['600K+', '600,000+'], ['100%', '100% pass']]) {
    assert.ok(home.includes(shown), shown); assert.ok(facts.includes(source), source);
  }
});
test('home: quotes are real and traced', () => {
  assert.doesNotMatch(home, /Example|Name Surname/);
  const names = [...home.matchAll(/class="tp-quote__name">([^<]+)</g)].map((m) => m[1]);
  assert.equal(names.length, 2);
  for (const n of names) assert.ok(facts.includes(n), n);
});
test('home: client cards link case studies, contact is complete', () => {
  for (const w of WORK) assert.ok(sec('work').includes(`href="${w.replace('.html', '')}"`), w);
  assert.match(sec('contact'), /mailto:k\.tanvir\.hossain@gmail\.com/);
  assert.match(sec('contact'), />k\.tanvir\.hossain@gmail\.com/);
  assert.match(home, /linkedin\.com\/in\/k-tanvir-hossain/);
  assert.match(home, /github\.com\/KhondokerTanvirHossain/);
  assert.match(sec('about'), /href="https:\/\/eliooo\.org"/);
});
test('no page says doctor-first', () => { for (const p of PAGES) assert.doesNotMatch(read(p), /doctor-first/i, p); });

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

test('Better Health case study: patient-first, 25 engineers, Engineering Lead', () => {
  const bh = read('work/better-health.html');
  assert.match(bh, /patient-first/); assert.match(bh, /25 engineers/); assert.match(bh, /Engineering Lead/); assert.doesNotMatch(bh, /about 20 engineers/);
});

test('résumé: Engineering Lead now, real titles before', () => {
  const r = read('resume.html');
  assert.match(r, /class="contact-line">Engineering Lead/); assert.match(r, /Better Health, Engineering Lead/); assert.match(r, /Senior Software Engineer/); assert.match(r, /25 engineers/);
  assert.ok(exists('Tanvir_Hossain_Engineering_Lead.pdf')); assert.ok(!exists('Tanvir_Hossain_Senior_Software_Engineer.pdf'));
});

test('case studies use the new chrome', () => {
  for (const w of WORK) { const h = read(w); assert.match(h, /class="tp-nav/); assert.match(h, /type="module" src="\.\.\/main\.js"/); }
});

const prototype = read('docs/superpowers/specs/2026-11-17-portfolio-redesign-prototype.html');
const plain = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
test('home: every product lede sentence traces to facts or the approved prototype', () => {
  const sources = plain(facts) + ' ' + plain(prototype);
  for (const m of home.matchAll(/<p class="tp-chapter__lede">([\s\S]*?)<\/p>/g)) {
    for (const s of plain(m[1]).split(/(?<=[.।;])\s+/).map((x) => x.replace(/[.।;]$/, '')).filter(Boolean))
      assert.ok(sources.includes(s), `untraced: "${s}"`);
  }
});

test('résumé: the current title is Engineering Lead, not Senior Software Engineer', () => {
  const r = read('resume.html');
  assert.doesNotMatch(r, /<h3>Senior Software Engineer, Celloscope/);
  assert.match(r, /<h3>Celloscope Ltd, Dhaka, Bangladesh, Sep 2021 to present<\/h3>/);
  assert.match(r, /Engineering Lead from Oct 2025/);
});

test('facts: identity carries the current title', () => assert.doesNotMatch(facts, /Title: Senior Software Engineer/));

test('deploy workflow: only the deploy job can write packages', () => {
  const y = read('.github/workflows/deploy.yml');
  const top = y.slice(0, y.indexOf('jobs:'));
  assert.doesNotMatch(top, /packages:\s*write/);
  assert.match(y.slice(y.indexOf('  deploy:')), /permissions:\s*\n\s*contents: read\s*\n\s*packages: write/);
});

test('home: only Inter loads up front; product fonts wait for the show; the portrait is fetched first', () => {
  const head = home.slice(0, home.indexOf('</head>'));
  assert.doesNotMatch(head, /rel="preload" href="https:\/\/fonts\.googleapis/);
  const lazy = head.match(/<link id="product-fonts" rel="stylesheet" href="([^"]+)" media="print">/);
  assert.ok(lazy, 'product fonts stylesheet with media="print"');
  for (const f of ['Anek+Bangla', 'Noto+Sans+Bengali', 'Instrument+Sans', 'Onest']) assert.ok(lazy[1].includes(f), f);
  assert.match(head, /<noscript><link rel="stylesheet" href="[^"]*Anek\+Bangla/);
  for (const m of head.matchAll(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis[^"]+)" media="print" onload/g)) assert.doesNotMatch(m[1], /Anek|Onest|Instrument|Noto/);
  assert.match(head, /<link rel="preload" as="image" href="assets\/portrait-1086\.webp"[^>]*fetchpriority="high"/);
});
