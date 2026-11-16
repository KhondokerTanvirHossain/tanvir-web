# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild tanvir.eliooo.org as a black, Apple-like Engineering Lead portfolio with a pinned product show, and move hosting from Vercel to the EC2 box behind its Caddy, deployed by CI.

**Architecture:** Plain HTML, one shared stylesheet plus a home stylesheet, and three small ES-module scripts whose maths lives in pure exported functions tested with `node --test`. Without JavaScript the product show is four stacked chapters; `show.js` adds `is-live` and drives CSS custom properties per chapter. The site ships as an `nginx:alpine` image on GHCR; GitHub Actions deploys it over SSH with a TAG/PREV_TAG rollback, like Bolo on the same box.

**Tech Stack:** HTML, CSS custom properties, vanilla ES modules, `node --test`, html-validate 8, headless Chrome over CDP (Node 22+ built-in WebSocket), Docker, nginx 1.27-alpine, Caddy 2 (existing), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-17-portfolio-redesign-design.md`. Reference implementation for layout, copy and motion: `docs/superpowers/specs/2026-11-17-portfolio-redesign-prototype.html` (open it in a browser). Design system snapshot: `design/README.md` and `design/tokens.json` (Task 1).

## Global Constraints

- Every claim on any page traces to `content/facts.md`. Internal items listed there stay off the site.
- No framework, no bundler, no runtime dependencies. Dev tooling only: html-validate 8 via npx, Node 22+, Chrome.
- Colours, type, radii and spacing come from `design/tokens.json`. Stage `#000000`, surface `#161617`, ink `#f5f5f7`, ink-2 `#a1a1a6`, ink-3 `#86868b`, link `#2997ff`. Component classes use the `tp-` prefix. No class name is used for two purposes (the prototype's nav `show` class collided with the show container and blanked the screen).
- Product chapters use only their own product tokens and fonts; the page's link blue never appears inside a chapter.
- Animate only `transform` and `opacity` (plus border-radius on the film). Everything is readable with JavaScript off and under `prefers-reduced-motion: reduce`.
- Copy rules: first person, sentence case, buttons name the result, links end with " ›", no emoji, no exclamation marks.
- Better Health is patient-first: "a patient-first health platform" built as e-prescriptions for doctors, then telemedicine, now the patient's lifelong health record. 25 engineers across four streams. "doctor-first" must not appear on any page.
- Title: Engineering Lead (current role). Earlier roles keep real titles.
- Finioo links to https://finioo.eliooo.org/ although it is not live, with status "Launching soon".
- Quotes are verbatim; no quote marked "Example" may ship.
- Server work never takes down the other tenants on the box (n8n, medioo, drugdb, bolo); every Caddy change is backed up, validated, then reloaded.

## Review Focus

1. **Window resize mid-show** (rotate a phone, resize a laptop window while inside the product show): the film must re-measure and stay aligned with its frame. Pinned in Task 5 (`layout()` re-runs on resize; smoke test resizes and checks alignment).
2. **Arriving mid-page** (a link to `/#work` or a reload while scrolled into the show): the show must render the right product on first paint, not the start state. Pinned in Task 5 (smoke test loads with a scroll position and checks the active rail item).
3. **Keyboard users tabbing through the show:** focus must land only on the visible chapter's link, never on a hidden one. Pinned in Task 5 (`chapterVars` gives `inert`; smoke test tabs).
4. **Slow or failed font loads:** the film geometry must not be measured before fonts settle. Pinned in Task 5 (`document.fonts.ready` re-layout).
5. **A film file that 404s or never loads:** the poster must stay. Pinned in Task 6.

---

## File structure

| Path | Responsibility |
|---|---|
| `design/tokens.json`, `design/README.md` | Snapshot of the design system artifact; CI source of truth |
| `content/facts.md` | Every claim; gains Products, Availability, Recommendations; Better Health updated |
| `styles.css` | Tokens, base, nav, buttons, footer, cards, case study pages (dark) |
| `home.css` | Hero, overview bento, products intro, product show, client work, lead, about, contact |
| `resume.css` | The light, print-first résumé (moved out of today's `styles.css`) |
| `index.html` | Home markup |
| `main.js` | Nav reveal and mobile menu (all pages) |
| `overview.js` | Dhaka clock, quote carousel, burndown reveal |
| `show.js` | Product show: pure state maths plus DOM wiring |
| `films.js` | Film slots: video when files exist, poster otherwise |
| `assets/portrait-720.jpg`, `assets/portrait-1086.jpg`, `.webp` twins | Hero portrait derived from `assets/src/portrait-studio.png` |
| `work/*.html` | Case studies, restyled; Better Health copy updated |
| `resume.html`, `resume.pdf`, `Tanvir_Hossain_Engineering_Lead.pdf` | Résumé |
| `og.html`, `og.png`, `sitemap.xml` | Social card and sitemap |
| `tests/pages.test.mjs` | Structure, content and token tests |
| `tests/show.test.mjs`, `tests/overview.test.mjs`, `tests/films.test.mjs` | Pure-function tests |
| `tests/smoke.mjs` | Headless Chrome checks (`npm run smoke`) |
| `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`, `deploy/test-image.sh` | The image and its test |
| `deploy/compose.yml`, `deploy/deploy.sh`, `deploy/Caddyfile.tanvir` | Server side |
| `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | CI and deploy |
| `README.md` | Run, check, deploy, rollback, films |

---

### Task 1: Facts and design snapshot

**Files:**
- Create: `design/tokens.json`, `design/README.md` (copy of the artifact's `project/tokens.json` and `project/README.md`; a local copy sits at `/private/tmp/claude-501/-Users-tanvirhossain-Documents-projects-github-tanvir-web/f7e05213-05f2-42cf-b6d8-39001b21e67d/scratchpad/ds-portfolio/project/`; if gone, read them from https://claude.ai/artifact/Ua7QX6S9yrzGVAMxY51dGp with the Artifact tool)
- Modify: `content/facts.md`
- Test: `tests/pages.test.mjs` (new tests appended; old home tests are replaced in Task 3)

**Interfaces:**
- Produces: `design/tokens.json` (shape: `color.tokens[] {name, value, usage}`), the facts strings later tests search for: `25 engineers`, `https://bolo.eliooo.org/`, `https://medioo.eliooo.org/`, `https://finioo.eliooo.org/`, `https://drugdb.eliooo.org/`, `Heronmoy Emon`, `Asiya Khatun Papiya`, `patient-first`.

- [ ] **Step 1: Write the failing tests**

```js
test('facts: products, availability, recommendations, Better Health', () => {
  for (const s of ['## Products', 'https://bolo.eliooo.org/', 'https://medioo.eliooo.org/', 'https://finioo.eliooo.org/', 'https://drugdb.eliooo.org/', 'Launching soon',
    '## Availability', '8am to 12pm US Eastern', '## Recommendations', 'Heronmoy Emon', 'Asiya Khatun Papiya', '25 engineers across four streams', 'patient-first'])
    assert.ok(facts.includes(s), `facts.md lacks: ${s}`);
  assert.doesNotMatch(facts, /~20 engineers/);
});

test('design tokens: every text pair named for contrast meets AA', () => {
  const t = JSON.parse(read('design/tokens.json'));
  const v = Object.fromEntries(t.color.tokens.map((x) => [x.name, x.value]));
  for (const [fg, bg, min] of [['ink','stage',4.5],['ink-2','stage',4.5],['ink-3','stage',4.5],['ink-2','surface',4.5],['ink-3','surface',4.5],['link','stage',4.5],
    ['bolo-ink','bolo-sky-high',4.5],['bolo-ink','bolo-sky-mid',4.5],['bolo-link','bolo-sky-high',4.5],['medioo-ink','medioo-ground',4.5],['medioo-link','medioo-ground',4.5],
    ['finioo-ink','finioo-ground',4.5],['finioo-ink-2','finioo-ground',4.5],['intellidrugs-ink','intellidrugs-ground',4.5],['intellidrugs-link','intellidrugs-ground',4.5]])
    assert.ok(contrast(v[fg], v[bg]) >= min, `${fg} on ${bg}: ${contrast(v[fg], v[bg]).toFixed(2)}`);
});
```

`contrast()` and `lum()` already exist in the test file; `lum` must accept `#rrggbb` only (all these tokens are hex).

- [ ] **Step 2: Run to verify they fail**

Run: `node --test tests/`
Expected: FAIL on `design/tokens.json` missing and on the facts strings.

- [ ] **Step 3: Copy the design snapshot and edit `content/facts.md`**

In facts.md: in the Better Health section replace "~20 engineers across four streams" with "25 engineers across four streams" and add a line "Positioning: patient-first. Built in order: e-prescriptions (eRx) for doctors, then telemedicine, now the patient's lifelong health record (LHR)." Add the timeline note "Current title: Engineering Lead (LinkedIn updated to match)." Append three sections:
- `## Products` with the four entries exactly as the spec's "Content changes" section lists them (name, URL, status, one-line description), and "All four designed, built and run by Tanvir alone, under the elioo studio (https://eliooo.org)."
- `## Availability`: "Open to remote roles with US and Canadian product teams. Keeps 8am to 12pm US Eastern open for overlap. Worked daily with a US client's leadership (Primefocus Health)."
- `## Recommendations` with both quotes verbatim, each with name, title, relationship and date, as in the spec's Decisions table.

- [ ] **Step 4: Run to verify they pass**

Run: `node --test tests/`
Expected: the two new tests PASS (old home tests may still pass; they are replaced in Task 3).

- [ ] **Step 5: Commit**

```bash
git add design content/facts.md tests/pages.test.mjs
git commit -m "content: facts for products, availability, quotes; design system snapshot"
```

---

### Task 2: Stylesheets: tokens, base, chrome, résumé split

**Files:**
- Modify: `styles.css` (rewrite)
- Create: `resume.css` (today's `.resume*` rules from `styles.css:168-220` plus the light tokens they use, renamed so they do not depend on the dark tokens)
- Modify: `resume.html` (link `resume.css` instead of `styles.css`)
- Test: `tests/pages.test.mjs`

**Interfaces:**
- Produces in `styles.css`: custom properties named exactly as the tokens (`--stage`, `--surface`, `--surface-2`, `--hairline`, `--line-control`, `--ink`, `--ink-2`, `--ink-3`, `--on-ink`, `--link`, `--focus`, `--material`, every `--bolo-*`, `--medioo-*`, `--finioo-*`, `--intellidrugs-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--w-page`, `--w-film`, `--h-nav`, `--tap-min`, `--play-disc`, `--font-display`, `--font-text`, `--font-bolo`, `--font-medioo`, `--font-finioo`, `--font-intellidrugs`); classes `.wrap`, `.skip`, `.tp-nav` (+ `.is-in`, `.tp-nav__name`, `.tp-nav__links`, `.tp-nav__menu`, `.is-open`), `.tp-btn` `--fill` `--outline`, `.tp-link`, `.tp-actions`, `.tp-status` `--soon`, `.tp-card` and its parts (as `design/` WorkCard), `.tp-footer`, and the case study classes already used in `work/*.html`: `.cs-head .back .eyebrow .lede .cs-meta .cs-body .prose .diagram .outcome-list .cs-foot`.

- [ ] **Step 1: Write the failing test**

```js
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
```

Remove the old `stylesheet defines the tokens` and `mute text meets WCAG AA` tests (replaced by this and Task 1's contrast test).

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/` — Expected: FAIL (`--stage` missing).

- [ ] **Step 3: Write `styles.css` and `resume.css`**

Write every colour token as `--<name>: <value>;` with the value exactly as `design/tokens.json` spells it (one space after the colon, e.g. `--material: rgba(22, 22, 23, 0.72);`), since the test matches the text. Values from `design/tokens.json` and `design/README.md`; component rules follow the prototype's `.nav`, `.btn`, `.lnk`, `.card` rules renamed to the `tp-` classes. Nav is `position: fixed`, `height: var(--h-nav)`, translated off-screen until `.is-in`; under 760px links hide and `.tp-nav__menu` shows; `.tp-nav.is-open` shows the links as a full-screen list on `var(--stage)`. Case study pages: black stage, text in ink/ink-2, `.diagram` SVGs keep their own colours but sit on `var(--surface)` with `--radius-card`, max text width 65ch. `prefers-reduced-transparency` and `prefers-contrast: more` make the nav solid `var(--surface)`. `résumé.css` keeps today's look byte-for-byte in print.

- [ ] **Step 4: Run tests and lint**

Run: `npm run check` — Expected: PASS except tests owned by Task 3 (home structure) if already rewritten; html-validate clean.

- [ ] **Step 5: Commit**

```bash
git add styles.css resume.css resume.html tests/pages.test.mjs
git commit -m "style: dark design system foundation; résumé styles split out"
```

---

### Task 3: Home markup, static (no JavaScript)

**Files:**
- Modify: `index.html` (rewrite), `assets/` (portrait files)
- Create: `home.css`
- Test: `tests/pages.test.mjs`

**Interfaces:**
- Produces these hooks for Tasks 4 to 6 (ids and classes are contracts):
  - `#hero` (section), `#overview`, `#products`, `#work`, `#lead`, `#about`, `#contact`, in that order.
  - Overview: `#clock-date`, `#clock-time` (text), `.tp-quotes` containing `figure.tp-quote` ×2 (first has `.is-on`), `.tp-quotes__dots`, `#quote-prev`, `#quote-next`, `svg#burndown`, `.tp-ticker`, `.tp-marquee` (each with an `__in` track whose second half is `aria-hidden="true"`).
  - Show: `div.tp-show` > `div.tp-show__stage` > four `section.tp-chapter.tp-chapter--{bolo|medioo|finioo|intellidrugs}` each containing `.tp-chapter__copy` and `.tp-film[data-film="{bolo|medioo|finioo|intellidrugs}"]` holding a `.tp-poster`; then `div.tp-show__over` (aria-hidden, Bolo's number and headline) and `nav.tp-rail[aria-label="Products"]` with four `button[data-index]`.
  - `script type="module"` tags for `main.js`, `overview.js`, `show.js`, `films.js`.

- [ ] **Step 1: Write the failing tests** (replace the old `home:` tests)

```js
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
  for (const [p, url] of [['bolo','https://bolo.eliooo.org/'],['medioo','https://medioo.eliooo.org/'],['finioo','https://finioo.eliooo.org/'],['intellidrugs','https://drugdb.eliooo.org/']]) {
    assert.match(home, new RegExp(`tp-chapter--${p}`)); assert.ok(home.includes(`href="${url}"`), url); assert.match(home, new RegExp(`data-film="${p}"`));
  }
  assert.match(home, /Launching soon/);
  assert.match(home, /honest about what it doesn.t know/);
});
test('home: every figure traces to facts', () => {
  for (const [shown, source] of [['25','25 engineers'],['583K+','583K+'],['$1.8B','1.82B'],['99.99%','99.99%'],['600K+','600,000+'],['100%','100% pass']]) {
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
  assert.match(sec('contact'), /k\.tanvir\.hossain@gmail\.com/);
  assert.match(home, /linkedin\.com\/in\/k-tanvir-hossain/);
  assert.match(home, /github\.com\/KhondokerTanvirHossain/);
  assert.match(sec('about'), /href="https:\/\/eliooo\.org"/);
});
test('no page says doctor-first', () => { for (const p of PAGES) assert.doesNotMatch(read(p), /doctor-first/i, p); });
```

Also keep the per-page head tests (`head and landmarks`) for all pages; the home h1 stays the only h1.

- [ ] **Step 2: Run to verify they fail**

Run: `node --test tests/` — Expected: FAIL on the new home tests.

- [ ] **Step 3: Make the portrait files**

```bash
sips -s format jpeg -s formatOptions 82 assets/src/portrait-studio.png --out assets/portrait-1086.jpg
sips -s format jpeg -s formatOptions 80 -Z 960 assets/src/portrait-studio.png --out assets/portrait-720.jpg
cwebp -q 80 assets/portrait-1086.jpg -o assets/portrait-1086.webp
cwebp -q 78 assets/portrait-720.jpg -o assets/portrait-720.webp
git rm assets/tanvir.jpg
```

Use `<picture>` with WebP and JPEG `srcset` (720w, 1086w), `sizes="(max-width: 820px) 100vw, 50vw"`, `width="1086" height="1448"`, `fetchpriority="high"`, CSS `object-position: 58% 18%; filter: grayscale(1)`.

- [ ] **Step 4: Write `index.html` and `home.css`**

Copy, order and look from the prototype, with these differences: hero lede says "a patient-first health platform"; the Better Health card title is "A patient-first health platform" and its meta reads "Better Health · 2025 to now · Engineering Lead"; IntelliDrugs headline "Bangladesh's drug data, honest about what it doesn't know."; quote names in `<b class="tp-quote__name">`; contact shows the email as visible text inside the mailto link; all product CTAs use the real URLs with `rel="noopener"`. Keep the head from today's `index.html` (canonical, OG, Person JSON-LD with `jobTitle: "Engineering Lead"`, non-blocking font loading) and add the product font families to the font URL. Without JS, `.tp-show__stage` is normal flow: each chapter is a full-width band (its ground colour, copy left, film frame right, stacked on phones with copy first), `.tp-rail` and `.tp-show__over` are `display:none`. Phones under 820px: hero copy first, photo second at `height: 72vh`. Ticker and marquee pause on `:hover` and `:focus-within` and have no animation under reduced motion.

- [ ] **Step 5: Run tests and lint**

Run: `npm run check` — Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html home.css assets tests/pages.test.mjs
git commit -m "feat(home): black stage layout, overview, products, client work, about, contact"
```

---

### Task 4: Overview behaviour and nav

**Files:**
- Create: `overview.js`, `tests/overview.test.mjs`
- Modify: `main.js` (rewrite as ES module)

**Interfaces:**
- Consumes: Task 3 hooks.
- Produces: `export function dhakaClock(date: Date): { date: string, time: string }` (`date` like `"Tuesday 17 November"`, `time` 24-hour `"01:33:28"`, both in `Asia/Dhaka`); `export function nextIndex(current: number, delta: number, count: number): number` (wraps both ways); `export function initOverview(doc: Document): void`; in `main.js` `export function initNav(doc: Document): void`.

- [ ] **Step 1: Write the failing tests**

```js
import { dhakaClock, nextIndex } from '../overview.js';
test('dhakaClock renders Dhaka time', () => {
  const r = dhakaClock(new Date('2026-11-16T19:33:28Z'));
  assert.deepEqual(r, { date: 'Tuesday 17 November', time: '01:33:28' });
});
test('nextIndex wraps', () => {
  assert.equal(nextIndex(1, 1, 2), 0); assert.equal(nextIndex(0, -1, 2), 1); assert.equal(nextIndex(0, 1, 2), 1);
});
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/overview.test.mjs` → FAIL (module missing).

- [ ] **Step 3: Implement**

`dhakaClock` uses `Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', … })`. `initOverview`: ticks the clock every second (date line reads "<date> in Dhaka"); carousel shows one `.tp-quote.is-on`, builds dot buttons with `aria-label="Quote N"`, arrows step with `nextIndex`, auto-advances every 7000 ms unless reduced motion, pauses on `mouseenter` and `focusin`, resumes on `mouseleave` and `focusout`; burndown gets `.is-in` once 50% visible (IntersectionObserver). The module must not touch `document` at import time; call `initOverview(document)` behind `if (typeof document !== 'undefined')`.
`initNav`: adds `.is-in` to `.tp-nav` when `#hero` is not intersecting (IntersectionObserver; pages without `#hero`, like case studies, show the nav immediately); the Menu button toggles `.is-open` and `aria-expanded`, traps focus inside the open menu, closes on Escape and on link click, returns focus to the button.

- [ ] **Step 4: Run** — `npm run check` → PASS.

- [ ] **Step 5: Commit**

```bash
git add overview.js main.js tests/overview.test.mjs
git commit -m "feat(home): Dhaka clock, quote carousel, burndown, nav reveal and menu"
```

---

### Task 5: Product show

**Files:**
- Create: `show.js`, `tests/show.test.mjs`
- Modify: `home.css` (the `.tp-show.is-live` rules)

**Interfaces:**
- Consumes: Task 3's `.tp-show` structure.
- Produces:
  - `export const PHASES = { expandEnd: 0.08, holdEnd: 0.14, settleEnd: 0.22 }`
  - `export function smoothstep(x: number): number` (clamps to 0..1 first)
  - `export function showState(progress: number, count: number, opts?: { reduce?: boolean }): { expand: number, settle: number, index: number, mix: number, t: number, active: number }`
  - `export function filmTransform(state, geom: { cx: number, cy: number, small: number, full: number }): { scale: number, x: number, y: number, radius: number }` — `radius` already divided by `scale` so the visible corner is right; visible radius is 28 in the frame and small states, 0 at full screen.
  - `export function chapterVars(k: number, state): { layer: number, world: number, copy: number, copyY: number, inert: boolean }`
  - `export function initShow(root: HTMLElement): void`

The state maths (the prototype's, kept exact):

```js
expand = reduce ? 1 : smoothstep(p / PHASES.expandEnd);
settle = reduce ? (p > PHASES.holdEnd ? 1 : 0) : smoothstep((p - PHASES.holdEnd) / (PHASES.settleEnd - PHASES.holdEnd));
raw = clamp((p - PHASES.settleEnd) / (1 - PHASES.settleEnd)) * (count - 1);
index = Math.min(count - 2, Math.floor(raw)); f = raw - index;
mix = reduce ? Math.round(f) : smoothstep((f - 0.35) / 0.3);
t = index + mix; active = Math.round(t);
// chapterVars:
layer = k === index ? 1 : k === index + 1 ? mix : 0;
world = k === 0 && index === 0 ? expand : 1;
copy = clamp(1 - Math.abs(t - k) * 2.2) * (k === 0 ? clamp((settle - 0.5) / 0.5) : 1);
copyY = -(t - k) * 40; inert = copy < 0.5;
```

- [ ] **Step 1: Write the failing tests**

```js
import { showState, filmTransform, chapterVars, PHASES } from '../show.js';
test('start: small film, nothing settled, Bolo active', () => {
  const s = showState(0, 4); assert.equal(s.expand, 0); assert.equal(s.settle, 0); assert.equal(s.index, 0); assert.equal(s.active, 0);
});
test('phase boundaries', () => {
  assert.equal(showState(PHASES.expandEnd, 4).expand, 1);
  assert.equal(showState(PHASES.holdEnd, 4).settle, 0);
  assert.equal(showState(PHASES.settleEnd, 4).settle, 1);
});
test('end: IntelliDrugs fully in', () => { const s = showState(1, 4); assert.equal(s.index, 2); assert.equal(s.mix, 1); assert.equal(s.active, 3); });
test('holds: no mixing at the start or end of a segment', () => {
  const at = (raw) => PHASES.settleEnd + (raw / 3) * (1 - PHASES.settleEnd);
  assert.equal(showState(at(1.2), 4).mix, 0); assert.equal(showState(at(1.8), 4).mix, 1);
});
test('crossfade never dips: the outgoing layer stays opaque', () => {
  for (let p = PHASES.settleEnd; p <= 1; p += 0.01) {
    const s = showState(p, 4); const sum = [0,1,2,3].reduce((a, k) => a + (chapterVars(k, s).layer === 1 ? 1 : 0), 0);
    assert.ok(sum >= 1, `p=${p.toFixed(2)}`);
  }
});
test('reduce: no partial states', () => {
  for (const p of [0.02, 0.5, 0.63]) { const s = showState(p, 4, { reduce: true }); assert.equal(s.expand, 1); assert.ok(s.mix === 0 || s.mix === 1); }
});
test('film transform: small, full, framed', () => {
  const g = { cx: -200, cy: 30, small: 0.8, full: 1.6 };
  assert.deepEqual(filmTransform({ expand: 0, settle: 0 }, g), { scale: 0.8, x: -200, y: 30, radius: 35 });
  assert.deepEqual(filmTransform({ expand: 1, settle: 0 }, g), { scale: 1.6, x: -200, y: 30, radius: 0 });
  assert.deepEqual(filmTransform({ expand: 1, settle: 1 }, g), { scale: 1, x: 0, y: 0, radius: 28 });
});
test('hidden chapters are inert', () => { const s = showState(PHASES.settleEnd + (1 - PHASES.settleEnd) / 3, 4); // Medioo fully in, no mixing assert.equal(chapterVars(s.active, s).inert, false); assert.equal(chapterVars((s.active + 2) % 4, s).inert, true); });
```

- [ ] **Step 2: Run to verify it fails** — `node --test tests/show.test.mjs` → FAIL.

- [ ] **Step 3: Implement the pure functions, then `initShow`**

`initShow(root)`: adds `is-live` (skips entirely if `IntersectionObserver` or `requestAnimationFrame` is missing); sets the outer height to `800vh`; `layout()` measures the first chapter's `.tp-film` box relative to the stage and computes `geom` (`small = min(0.6 * stageWidth / filmWidth, 1)`, `full = max(stageWidth / filmWidth, stageHeight / filmHeight) * 1.01`, `cx/cy` from film centre to stage centre); runs on init, `resize`, and `document.fonts.ready`. `frame()` (rAF-throttled on `scroll`) computes `progress` from the root's rect, `showState`, writes on each chapter `--layer --world --copy --copy-y` and toggles `inert`, writes the first film's `transform: translate3d(x,y,0) scale(scale)` and `border-radius`, the over-headline opacity `clamp((expand - 0.85) / 0.15) * (1 - clamp(settle * 2.5))`, the rail's `.is-on` and fill `--fill: clamp(1 - |t - k| * 1.2)`. Rail button `k` scrolls to `rootTop + span * (settleEnd + (1 - settleEnd) * k / (count - 1)) + 2` (smooth unless reduced motion). `frame()` runs once on init so mid-page loads paint the right product. CSS for `.is-live`: stage `position: sticky; top: 0; height: 100vh; overflow: hidden; contain: paint`; chapters `position: absolute; inset: 0; opacity: var(--layer)`; chapter ground on `::before` with `opacity: var(--world)`; copy `opacity: var(--copy); transform: translateY(calc(var(--copy-y) * 1px))`; phones single column (copy above, film below).

- [ ] **Step 4: Run** — `npm run check` → PASS. Then open `index.html` via `npm run serve` and scroll the show in Firefox and Chrome.

- [ ] **Step 5: Commit**

```bash
git add show.js home.css tests/show.test.mjs
git commit -m "feat(home): pinned product show, film expands then products cross-fade"
```

---

### Task 6: Film slots

**Files:**
- Create: `films.js`, `tests/films.test.mjs`, `assets/films/.gitkeep`
- Modify: `index.html` (a `data-film-ready` attribute is the switch, absent for now)

**Interfaces:**
- Produces: `export function filmSources(name: string): { src: string, type: string }[]` → `[{ src: 'assets/films/<name>.webm', type: 'video/webm' }, { src: 'assets/films/<name>.mp4', type: 'video/mp4' }]`; `export function initFilms(doc: Document): void`.

- [ ] **Step 1: Write the failing test**

```js
import { filmSources } from '../films.js';
test('filmSources lists webm then mp4', () => assert.deepEqual(filmSources('bolo'), [{ src: 'assets/films/bolo.webm', type: 'video/webm' }, { src: 'assets/films/bolo.mp4', type: 'video/mp4' }]));
test('home has no video until a film is marked ready', () => { assert.doesNotMatch(home, /<video/); });
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement `initFilms`**

For each `.tp-film[data-film][data-film-ready]`: insert a `<video muted loop playsinline preload="none" poster="assets/films/<name>-poster.jpg" aria-label="…">` with `filmSources`, above the HTML poster; play while ≥ 50% visible, pause otherwise; never autoplay under reduced motion; add a `.tp-play` button toggling play/pause with `aria-pressed`. On the video's `error` or a `stalled` with no `loadeddata` after 8 s, remove the video so the HTML poster stays (Review Focus 5).

- [ ] **Step 4: Run** — `npm run check` → PASS.

- [ ] **Step 5: Commit**

```bash
git add films.js tests/films.test.mjs assets/films/.gitkeep index.html
git commit -m "feat(home): film slots that switch on when a Remotion film is added"
```

---

### Task 7: Case studies, résumé, social card, sitemap

**Files:**
- Modify: `work/*.html` (nav markup to `tp-nav`, `main.js` module, footer), `work/better-health.html` (copy), `resume.html`, `og.html`, `og.png`, `sitemap.xml`, `package.json` (`pdf` script output name)
- Create: `Tanvir_Hossain_Engineering_Lead.pdf`, `resume.pdf` (regenerated)
- Delete: `Tanvir_Hossain_Senior_Software_Engineer.pdf`
- Test: `tests/pages.test.mjs`

**Interfaces:**
- Consumes: Task 2 classes; Task 4 `initNav`.

- [ ] **Step 1: Write the failing tests**

```js
test('Better Health case study: patient-first, 25 engineers, Engineering Lead', () => {
  const bh = read('work/better-health.html');
  assert.match(bh, /patient-first/); assert.match(bh, /25 engineers/); assert.match(bh, /Engineering Lead/); assert.doesNotMatch(bh, /about 20 engineers/);
});
test('résumé: Engineering Lead now, real titles before', () => {
  const r = read('resume.html');
  assert.match(r, /class="contact-line">Engineering Lead/); assert.match(r, /Better Health, Engineering Lead/); assert.match(r, /Senior Software Engineer/); assert.match(r, /25 engineers/);
  assert.ok(exists('Tanvir_Hossain_Engineering_Lead.pdf')); assert.ok(!exists('Tanvir_Hossain_Senior_Software_Engineer.pdf'));
});
test('case studies use the new chrome', () => { for (const w of WORK) { const h = read(w); assert.match(h, /class="tp-nav/); assert.match(h, /type="module" src="\.\.\/main\.js"/); } });
```

Keep the existing case-study structure test (sections in order, one SVG, 700 words, back link, résumé link) and the résumé ATS test.

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Edit the pages**

Better Health: `<title>` "Better Health, a patient-first health platform · Tanvir Hossain"; og:title "A patient-first health platform · Tanvir Hossain"; og:description "Prescriptions and telemedicine live, the patient health record next. CDC analytics across five database clusters. 25 engineers across four streams."; lede "Better Health is Celloscope's own product: a patient-first health platform for Bangladesh, built as e-prescriptions for doctors first, then telemedicine, and now the patient's lifelong health record. I lead product and platform delivery."; meta Role "Engineering Lead, product and platform", Team "25 engineers, four streams". Keep the h1 and the rest (stay under 700 words).
Résumé: contact line starts "Engineering Lead · "; summary first sentence "Engineering Lead with five years building Java and Spring platforms in regulated domains, now leading 25 engineers across four streams on a patient-first health platform." (rest kept, replacing "doctor-first digital health product" with "patient-first health platform"); Better Health h4 "Better Health, Engineering Lead, Oct 2025 to present"; first bullet "Lead product and platform delivery for a patient-first health platform (e-prescriptions, telemedicine, patient health record) across five Scrum boards and 25 engineers on two-week sprints." `package.json` `pdf` copies to `Tanvir_Hossain_Engineering_Lead.pdf`; run it with `npm run serve` up; `git rm` the old PDF.
og.html: 1200×630 black, portrait right half greyscale, left: "Engineering Lead · Dhaka · Open to remote", h1 "I lead the team. And ship the whole product.", name line; regenerate `og.png` with the Chrome command in README.
sitemap: keep six URLs.

- [ ] **Step 4: Run** — `npm run check` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A work resume.html resume.pdf Tanvir_Hossain_Engineering_Lead.pdf og.html og.png sitemap.xml package.json tests/pages.test.mjs
git commit -m "feat: restyle case studies; résumé and social card for Engineering Lead"
```

---

### Task 8: Browser smoke test

**Files:**
- Create: `tests/smoke.mjs`
- Modify: `package.json` (`"smoke": "node tests/smoke.mjs"`)

**Interfaces:**
- Consumes: every hook above. Chrome path from `CHROME_PATH` (default `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, CI sets `google-chrome`). Starts `python3 -m http.server 4181` itself and stops it.

- [ ] **Step 1: Write the smoke checks** (each prints PASS/FAIL; exit code 1 on any FAIL). At 1440×900 and 390×844:
  1. `document.documentElement.scrollWidth <= innerWidth` at top, mid-show and bottom.
  2. The hero's `a[href="resume.pdf"]` bottom edge is within the first viewport.
  3. After scrolling into the show: `.tp-nav` height is 52 (regression for the class collision).
  4. At each rail segment's centre, the matching chapter's `--layer` is 1 and its CTA is the only focusable CTA in the show (Review Focus 3).
  5. Load with `#work` then scroll back into the show by script: the active rail button matches `showState` for the current progress (Review Focus 2).
  6. Resize from 1440×900 to 1024×768 while at the settle phase end: the first film's bounding box matches its frame slot within 2 px (Review Focus 1).
  7. A scripted 2.5 s scroll across the first 35% of the show: 95th-percentile frame gap under 20 ms.
  8. With JavaScript disabled (`Emulation.setScriptExecutionDisabled`), all four chapter headlines are visible and none has opacity 0.
  9. No console errors.

The CDP plumbing follows `/private/tmp/claude-501/-Users-tanvirhossain-Documents-projects-github-tanvir-web/f7e05213-05f2-42cf-b6d8-39001b21e67d/scratchpad/cdp/shoot.mjs` (launch with `--headless=new --remote-debugging-port`, fresh `--user-data-dir`, `Emulation.setDeviceMetricsOverride`, `Runtime.evaluate`).

- [ ] **Step 2: Run** — `npm run smoke` → all PASS. Temporarily rename `.tp-nav.is-in` to `.show` in `styles.css` and the JS, confirm check 3 FAILs, revert.

- [ ] **Step 3: Commit**

```bash
git add tests/smoke.mjs package.json
git commit -m "test: headless browser smoke checks for layout, motion and no-JS"
```

---

### Task 9: Container image

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`, `deploy/test-image.sh`

**Interfaces:**
- Produces: an image serving the site on port 80; `bash deploy/test-image.sh` exits 0 when the image behaves.

- [ ] **Step 1: Write `deploy/test-image.sh`** (builds `tanvir-web:test`, runs it on a free local port, then asserts with `curl -s -o /dev/null -w`):
  - `/` → 200 and body contains `I lead the team`
  - `/work/better-health` → 200; `/work/better-health.html` → 200
  - `/resume` → 302 with `Location` ending `/resume.pdf`; `/resume.pdf` → 200, `/Tanvir_Hossain_Engineering_Lead.pdf` → 200
  - headers on `/`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cache-Control: no-cache`
  - `/styles.css` has `Cache-Control: public, max-age=3600`
  - `/docs/`, `/tests/smoke.mjs`, `/content/facts.md`, `/assets/src/portrait-studio.png`, `/Dockerfile` → 404
  - `/nope` → 404
  - removes the container at the end, also on failure (`trap`).

- [ ] **Step 2: Run it** → FAIL (no Dockerfile).

- [ ] **Step 3: Write the image**

`Dockerfile`: `FROM nginx:1.27-alpine`, copy `deploy/nginx.conf` to `/etc/nginx/conf.d/default.conf`, copy the site into `/usr/share/nginx/html`. `.dockerignore` excludes `.git`, `.github`, `.superpowers`, `.impeccable`, `docs`, `tests`, `content`, `design`, `deploy`, `assets/src`, `node_modules`, `*.md`, `package*.json`, `.htmlvalidate.json`, `vercel.json`, `Dockerfile`. `nginx.conf`: `server_tokens off`; `try_files $uri $uri.html $uri/ =404`; `location = /resume { return 302 /resume.pdf; }`; the three security headers with `always`; `Cache-Control: no-cache` for `/` and `*.html`, `public, max-age=3600` for css, js, images, fonts, pdf, video; `gzip off` (Caddy compresses).

- [ ] **Step 4: Run** — `bash deploy/test-image.sh` → all PASS.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile .dockerignore deploy/nginx.conf deploy/test-image.sh
git commit -m "build: nginx image with clean URLs, résumé redirect and headers"
```

---

### Task 10: Server files and CI

**Files:**
- Create: `deploy/compose.yml`, `deploy/deploy.sh`, `deploy/Caddyfile.tanvir`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: `IMAGE_TAG=<sha> bash ~/tanvir-web/deploy.sh` on the box; rollback `IMAGE_TAG=$(cat ~/tanvir-web/PREV_TAG) bash ~/tanvir-web/deploy.sh`. CI secrets: `EC2_HOST` (13.205.14.249), `EC2_USER` (ec2-user), `EC2_SSH_KEY`.

- [ ] **Step 1: Write the files**
  - `compose.yml`: service `tanvir-web`, image `ghcr.io/khondokertanvirhossain/tanvir-web:${IMAGE_TAG}`, `container_name: tanvir-web`, `restart: unless-stopped`, `mem_limit: 64m`, `read_only: true` with tmpfs `/var/cache/nginx` and `/var/run`, network `edge` = external `n8n_edge`, no ports.
  - `deploy.sh` (`set -euo pipefail`): requires `IMAGE_TAG`; `docker pull`; saves the running tag to `PREV_TAG`; `IMAGE_TAG=… docker compose -f ~/tanvir-web/compose.yml up -d`; health check up to 20 s: `docker exec n8n-caddy-1 wget -qO- http://tanvir-web/ | grep -q "I lead the team"`; on failure redeploys `PREV_TAG` (if any) and exits 1; on success writes `TAG` and keeps the newest 3 tanvir-web images.
  - `Caddyfile.tanvir`: a `tanvir.13-205-14-249.sslip.io` block (preview) and a commented `tanvir.eliooo.org` block for cut-over; both `encode zstd gzip`, `header { Strict-Transport-Security "max-age=31536000"; -Server }`, `reverse_proxy tanvir-web:80`.
  - `ci.yml`: on `pull_request` and `push`: Node 22, `npm run check`, `npm run smoke` with `CHROME_PATH=google-chrome`, `bash deploy/test-image.sh`.
  - `deploy.yml`: on `push` to `main` and `workflow_dispatch`; `permissions: packages: write, contents: read`; job `check` (same as CI) then job `deploy`: log in to GHCR with `GITHUB_TOKEN`, build and push `ghcr.io/khondokertanvirhossain/tanvir-web:${{ github.sha }}`, write `EC2_SSH_KEY` to a 600 key file, `scp deploy/compose.yml deploy/deploy.sh` to `~/tanvir-web/`, `ssh … "IMAGE_TAG=${{ github.sha }} bash ~/tanvir-web/deploy.sh"`. Pin actions to major versions (`actions/checkout@v4`, `actions/setup-node@v4`, `docker/login-action@v3`, `docker/build-push-action@v6`).
  - `README.md`: new design, run, check, smoke, deploy, rollback, how to add a film (drop `assets/films/<name>.webm|.mp4|-poster.jpg`, add `data-film-ready`), DNS.

- [ ] **Step 2: Verify locally**

Run: `bash -n deploy/deploy.sh` (syntax), `docker compose -f deploy/compose.yml config` with `IMAGE_TAG=test` (valid; the external network warning is expected), `npx --yes @action-validator/cli .github/workflows/ci.yml .github/workflows/deploy.yml` (schema valid).

- [ ] **Step 3: Commit and push the branch**

```bash
git add deploy .github README.md
git commit -m "ci: checks on every push; deploy to EC2 over SSH with rollback"
git push -u origin feat/redesign
```

Expected: the CI workflow passes on the branch (deploy does not run; it is `main` only).

---

### Task 11: Server setup and preview (gate: ask Tanvir first)

Do not start until Tanvir answers "yes" to: make the one-time box changes, add the three GitHub secrets.

- [ ] **Step 1: Prepare the box** (over SSH with `~/Documents/000_office/umr/aws/bdemr-text-analysis.pem`): `mkdir -p ~/tanvir-web`; `docker pull` of an existing ghcr image succeeds (proves the box's GHCR login; if not, stop and ask Tanvir for a read token).
- [ ] **Step 2: Secrets**: `gh secret set EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` (from the pem file, never printed).
- [ ] **Step 3: First deploy from the branch**: `gh workflow run deploy.yml --ref feat/redesign`; watch it; expect the `deploy.sh` health check to pass.
- [ ] **Step 4: Caddy preview block**: `cp ~/n8n/Caddyfile ~/n8n/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)`; append the sslip block from `deploy/Caddyfile.tanvir`; `docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile`; only if valid, `docker exec n8n-caddy-1 caddy reload --config /etc/caddy/Caddyfile`; if invalid, restore the backup.
- [ ] **Step 5: Verify**: `curl -sI https://tanvir.13-205-14-249.sslip.io/` → 200 with the security headers; `curl -s -o /dev/null -w "%{http_code}"` → 200 (or the site's usual code) for medioo.eliooo.org, drugdb.eliooo.org, bolo.eliooo.org and the n8n domain. Run Lighthouse on the preview (performance 90+, accessibility 100). Send Tanvir the preview link.

---

### Task 12: Cut-over (gate: Tanvir approves the preview)

- [ ] **Step 1:** Tanvir disconnects the Vercel project's Git integration (Vercel → Project → Settings → Git → Disconnect), so merging cannot publish there.
- [ ] **Step 2:** Merge `feat/redesign` to `main` (PR, CI green). The deploy workflow redeploys the same image tag from `main`.
- [ ] **Step 3:** Tanvir changes the Hostinger DNS: delete the `tanvir` CNAME, add `A tanvir 13.205.14.249` (TTL 300). Wait until `dig +short tanvir.eliooo.org` returns 13.205.14.249.
- [ ] **Step 4:** Uncomment the `tanvir.eliooo.org` block on the box with the same backup → validate → reload routine; `curl -sI https://tanvir.eliooo.org/` → 200 with a valid certificate; `curl -sI https://tanvir.eliooo.org/resume` → 302 to `/resume.pdf`; other tenants still answer.
- [ ] **Step 5:** Remove `vercel.json`, update README's Deploy section, commit to `main`; Tanvir deletes the Vercel project.
