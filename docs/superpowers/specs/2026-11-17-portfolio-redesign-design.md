# tanvir.eliooo.org redesign, design spec

Date: 2026-11-17
Status: approved by Tanvir, 2026-11-17
Supersedes: `2026-09-12-portfolio-design.md` (visual identity, page structure, hosting). Its content rules (every claim traces to `content/facts.md`, internal items stay off the site, ATS résumé rules) still apply.
Design system: https://claude.ai/artifact/Ua7QX6S9yrzGVAMxY51dGp ("Tanvir Portfolio": README, tokens, components)
Approved prototype: `docs/superpowers/specs/2026-11-17-portfolio-redesign-prototype.html` (open it in a browser; it is the reference for layout, copy and motion)

## Why

Tanvir hated how the current site looks: a light, serif, green-accent editorial page that reads like a document. He now also has four products of his own (Bolo, Medioo, Finioo, IntelliDrugs), each with its own design system, and he is making Remotion films about them. The site should look like Apple's product pages and feel as alive as michaelpumo.com, while still doing one job: get him hired.

## Who it is for and what success looks like

- **Reader:** a recruiter, skimming fast, matching him against a role. Secondary: the hiring manager who clicks one level deeper.
- **Positioning:** Engineering Lead who ships the whole product. TPM stays open through a second résumé, not on the site.
- **Success:** in the first screen a recruiter sees his face, "Engineering Lead", the 25-engineer team, and the résumé button. Scrolling shows four live products he built alone, then proof of scale from client work, then a one-click way to contact him.

### Goals
- A black Apple-like stage; each product shown in its own colours, type and film.
- Interactive product motion that feels like a keynote, smooth on Firefox and Safari as well as Chrome.
- Hosted on Tanvir's EC2 box behind its existing Caddy, deployed by CI with checks before every release.

### Non-goals
- No blog, no CMS, no build step or framework.
- No changes to the four products or to eliooo.org.
- The films themselves (Tanvir makes them in Remotion); the site only provides slots, posters and the spec.

### Anti-goals (a failure even if it works)
- Looking like a template or like elioo's site (serif italic accents, stacked cards).
- Any claim not in `content/facts.md`, or an invented quote, shipped to production.
- Motion that stutters, hides content from no-JS or reduced-motion visitors, or makes the résumé button hard to find.
- The DNS cut-over breaking any other site on the EC2 box (n8n, medioo, drugdb, bolo).

## Decisions made with Tanvir

| Topic | Decision |
|---|---|
| Overall look | Option C: pure black stage, products as full-screen worlds in their own colours. |
| Product motion | "C into B": Bolo's film starts small in the black and grows to fill the screen, its headline rises, then the film settles into a frame on the right while Bolo's copy appears on the left; further scroll cross-fades the whole world to Medioo, Finioo, IntelliDrugs. A pill bar (Bolo · Medioo · Finioo · IntelliDrugs) shows progress and jumps on click. |
| Hero | Full-screen split like michaelpumo.com: copy left on near-black, portrait right, full height. On phones the copy comes first and the photo second. |
| Portrait | The studio portrait Tanvir supplied (suit, grey wall), always greyscale. Saved at `assets/src/portrait-studio.png` (1086×1448; the original file is wanted for sharper large screens). |
| Overview bento | Directly after the hero: positioning card with "Say hello" and a live Dhaka clock; a quote carousel; "Backend and platform" with a scrolling tech ticker; "Product and delivery" with a self-drawing sprint burndown; a client-name marquee below. |
| Team size | 25 engineers across four streams (Better Health). `content/facts.md` currently says ~20 and must be corrected. |
| Better Health wording | Patient-first. It was designed for patients; the build order was e-prescriptions (eRx) for doctors first, then telemedicine, and now the patient's lifelong health record (LHR). Use this everywhere: hero ("a patient-first health platform"), the client card, the case study's title, og:title and lede, the résumé bullet. The doctor-first eRx stays as the first step of the story, not the positioning. |
| Title | Engineering Lead. Tanvir is changing his LinkedIn title to match, so the site, the résumé's current role and LinkedIn agree. Earlier roles keep their real titles (Team Lead, Engineering manager and architect, Senior Software Engineer). |
| Finioo | Not live yet. Its link to finioo.eliooo.org stays; it carries a "Launching soon" status (hollow dot). |
| elioo | Sister site, linked once from About. Film format shared with elioo (16:10) so each film is rendered once. |
| Hosting | EC2 (13.205.14.249) behind the existing Caddy, not Vercel. |
| Quotes | Two real LinkedIn recommendations, quoted verbatim (ellipsis marks a cut), one slide each, no photos: Heronmoy Emon, Backend Software Engineer, worked with Tanvir on the same team (Apr 29, 2025): "As a team lead, he demonstrates exceptional leadership - blending deep technical expertise with a collaborative and supportive approach that brings out the best in everyone on the team." Asiya Khatun Papiya, Human Resource Administrator (Technical Recruiter), managed Tanvir directly (Apr 28, 2025): "He has master level grips over Spring Boot, System Architecture, Cloud Native. … He is a super genius in problem solving, team management, task management, hiring and mentoring." Both go into `content/facts.md` with name, title, relationship and date. |

## Approaches considered

**Site technology**
1. **Plain HTML, CSS and a small vanilla JS file, no build** (chosen). The repo already works this way, the prototype proves the motion in about 4 KB of JS, and a static site has nothing to break on the shared box.
2. Astro with islands: nicer componentisation, but adds a toolchain for a one-page site.
3. Next.js like Tanvir's products: needs a Node server on a 2-vCPU box that already runs six apps.

**Motion**
1. **Vanilla requestAnimationFrame on scroll, transforms and opacity only** (chosen). Proven in the prototype at a steady 60 fps in headless Chrome; zero dependencies.
2. GSAP ScrollTrigger plus Lenis smooth scroll (what michaelpumo.com uses): more tooling, ~60 KB, smooth-scroll hijacking that some recruiters dislike.

**Deploy**
1. **Container image on GHCR, GitHub Actions deploys over SSH** (chosen). Same pattern as Bolo and MedScribe on this box: `nginx:alpine` image with the files baked in, tagged by commit SHA, pulled by a small server script that keeps the previous tag for one-command rollback.
2. rsync the files into a folder served by a bind-mounted nginx: simpler, but no atomic swap and no rollback.
3. Stay on Vercel: zero work, but Tanvir wants it on his EC2.

## The site

### Pages
- `/` home (below).
- `/work/<slug>` four case studies, restyled to the new system, content kept (Better Health updated to 25 engineers and patient-first).
- `/resume.html` and `/resume.pdf` (also `Tanvir_Hossain_Senior_Software_Engineer.pdf`). The résumé stays a light, print-first ATS page; only its summary and Better Health bullet change (see Résumé).
- `og.html` regenerated into `og.png` with the new portrait and headline.

### Home, top to bottom
Copy is in the prototype; numbers come from `content/facts.md`.

1. **Nav** (`tp-nav`): hidden over the hero, slides in after it. Name left; Products, Work, About, Contact right; Menu pill under 760 px. Its visible-state class must not reuse any layout class name (the prototype's first version broke because the nav's `show` class collided with the product section's `.show`).
2. **Hero:** green-dot pill "Open to remote Engineering Lead roles"; eyebrow; h1 "I lead the team. And ship the whole product."; lede with 25 engineers, 583,000 customers, a national regulator, four products; Download résumé + Email me; GitHub, LinkedIn, résumé PDF links at the bottom; portrait right.
3. **Overview bento:**
   - Positioning card: "Engineering Lead who takes products from first idea to production.", Say hello (to #contact), live clock in Asia/Dhaka with date, "UTC+6 · overlaps 8am to 12pm US Eastern".
   - Quote carousel: 2 or 3 real recommendations (name, title, company). Auto-advances every 7 s, pauses on hover and focus, arrows and dots, no autoplay under reduced motion. **Placeholder quotes may not ship**: a test fails the build if any quote is marked as an example.
   - Backend and platform: tech ticker (Java 21, Spring Boot, WebFlux, Kafka, PostgreSQL, Redis, Kubernetes, AWS, Terraform, Vault, Keycloak, Angular). Text chips, not logos.
   - Product and delivery: SVG burndown that draws once in view.
   - Client marquee: Agrani Bank PLC, Microcredit Regulatory Authority, Primefocus Health, Better Health, Celloscope, CoKreates, as typeset names.
   - The ticker and the marquee pause on hover and keyboard focus, stop entirely under reduced motion, and expose their full list to screen readers once (duplicates `aria-hidden`).
4. **Products intro:** "Four products I designed, built and run myself."
5. **Product show** (the C-into-B motion, specified under Motion).
6. **Client work:** stat row (25 engineers led across four streams, 583K+ customers, $1.8B processed, 99.99% uptime) and four cards (Better Health, Primefocus, MRA-IMS, Agrani), each naming Tanvir's role and linking its case study.
7. **How I lead:** four habits (ownership over scope; a definition of done that means something; tests first; say the uncomfortable thing early).
8. **About:** short story, link to elioo, timeline (six rows from facts).
9. **Contact:** "Hiring an engineering lead?", Download résumé, LinkedIn, email address as visible text and mailto, US-overlap note.
10. **Footer:** name, Dhaka, year; GitHub; elioo.

### Product chapters
Each product: number and wordmark, headline, lede, live link, status (Live / Launching soon) and "Designed, built and run solo", a film slot. Colours, fonts and wordmarks exactly as the design system's chapter tokens (copied from each product's own system). Copy as in the prototype.

### Films
- Slot per product, 16:10, rounded 28 px in the frame state.
- Until a film file exists, the slot shows the HTML/CSS poster from the prototype (Bolo's dusk scene, Medioo's phone with a lab line, Finioo's runway figure, IntelliDrugs' review rows).
- When `assets/films/<product>.webm` and `.mp4` (+ `<product>-poster.jpg`) exist, the slot plays them: muted, looping, only while on screen, paused under reduced motion, with a play/pause control. Adding a film is dropping in files plus one attribute, no code change.
- Spec for Tanvir's Remotion renders: 1728×1080, 6 to 15 s loop, at most 3 MB, WebM + MP4 + poster.

## Motion

From the prototype's script, which is the reference implementation:

- The product show is one pinned section about 800vh tall with a sticky 100vh stage.
- Phases by scroll fraction: 0 to 0.08 the small film (60% of the viewport width) scales up to cover the screen; 0.08 to 0.14 hold full screen with Bolo's headline over it; 0.14 to 0.22 the film scales and translates into its frame slot while Bolo's copy fades in; 0.22 to 1 the four products cross-fade, each transition centred in its segment with a hold either side.
- The film's box is the frame slot; every move is `transform: translate3d() scale()` plus a compensated border radius. No layout properties are animated.
- Cross-fades put the incoming layer on top fading in while the outgoing stays opaque underneath (no z-index swap, no dip to black).
- Copy blocks fade and move 40 px; the rail fills per product.
- Reduced motion: no scaling or fading; the show snaps between products, films do not autoplay.
- **No JavaScript:** the product show renders as four stacked static chapters (frame on the right, copy on the left, each in its own colours). Everything is readable.
- Phones: the same show, single column (copy above, film below), shorter copy blocks.

## Visual system

As the design system artifact specifies. In short: stage `#000`, surface `#161617`, ink `#f5f5f7`, ink-2 `#a1a1a6`, ink-3 `#86868b`, link `#2997ff`; system face (SF Pro on Apple, Inter elsewhere); product fonts only inside their chapter (Anek Bangla, Noto Sans + Noto Sans Bengali, Instrument Sans, Onest); pills for buttons, 24 px cards, 28 px films; nav is the only translucent material. Tokens live in `styles.css` as custom properties and must match the artifact's `tokens.json`.

## Résumé

- Keep every ATS rule and section order from the 2026-09-12 spec.
- Contact line and summary lead with Engineering Lead. The Better Health role is titled Engineering Lead (matching Tanvir's updated LinkedIn); earlier roles keep their real titles, so "Senior Software Engineer" still appears.
- Better Health bullet: 25 engineers across four streams; patient-first platform built as eRx for doctors, then telemedicine, now the patient health record.
- Regenerate the PDFs. The download file becomes `Tanvir_Hossain_Engineering_Lead.pdf`; `resume.pdf` stays the stable link; the old `Tanvir_Hossain_Senior_Software_Engineer.pdf` is removed (nothing on the new site links it).

## Content changes to `content/facts.md`

- Better Health: ~20 engineers becomes 25 engineers across four streams; the description per Tanvir's answer to open question 3.
- Recommendations: add each approved quote with name, title and company, so the quote test can trace them.
- **New "Products" section** (Claude's call, sourced from each product's own design system README and the live addresses Tanvir gave):
  - Bolo, https://bolo.eliooo.org/, live: voice-first speaking buddy for Bangla speakers who know English on paper but freeze when they speak.
  - Medioo, https://medioo.eliooo.org/, live: keeps a family's medical papers and says what is written on them in plain Bangla; code decides urgency, numbers and medicines, the model only words what code has checked.
  - Finioo, https://finioo.eliooo.org/, not live yet (link kept on purpose, "Launching soon"): AI co-pilot that builds and runs a founder's business model.
  - IntelliDrugs, https://drugdb.eliooo.org/, live: Bangladesh's drug and interaction database with pharmacist review, honest about what it doesn't know.
  - All four designed, built and run by Tanvir alone, under the elioo studio.
- **Availability** (Claude's call, carried over from the live site's approved copy): open to remote roles with US and Canadian product teams; keeps 8am to 12pm US Eastern open for overlap; worked daily with a US client's leadership (Primefocus).

## Calls made after the builder check

- **IntelliDrugs headline** is "Bangladesh's drug data, honest about what it doesn't know." (elioo's approved pitch). "Checked by pharmacists" overstated it: most records are not yet reviewed.
- **Design system in the repo:** commit a snapshot of the artifact's `tokens.json` and `README.md` to `design/` as the source of truth for CI tests; refresh it by hand when the artifact changes. Where the artifact and the prototype differ, the artifact wins for tokens, type and colour; the prototype wins for layout, copy and motion.
- **Phones** get the same copy in a shorter container, not separate copy.
- **Release path:** all work on a branch. Before anything merges to `main`, disconnect the Vercel project's Git integration so a merge cannot publish the redesign on Vercel; `vercel.json` stays until DNS points at EC2. The branch is previewed on the box first at `tanvir.13-205-14-249.sslip.io` (the pattern Bolo used before its DNS existed). After Tanvir approves the preview: merge, deploy, switch DNS, then delete the Vercel project and `vercel.json`.

## Hosting and deploy

- **Image:** `ghcr.io/khondokertanvirhossain/tanvir-web:<sha>`, built from `nginx:alpine` with the site files and an `nginx.conf` that does what `vercel.json` did: clean URLs (`/work/better-health` serves `better-health.html`), `/resume` redirects to `/resume.pdf`, the three security headers, long cache for hashed or versioned assets and short cache for HTML, gzip off (Caddy compresses).
- **On the box:** `~/tanvir-web/compose.yml` runs one container `tanvir-web` on the external network `n8n_edge`, no published ports, memory limit 64 MB, `restart: unless-stopped`. `~/tanvir-web/deploy.sh` pulls a tag, swaps the container, health-checks it through Caddy, and records `TAG` and `PREV_TAG` (Bolo's pattern). Rollback is `IMAGE_TAG=$(cat PREV_TAG) bash ~/tanvir-web/deploy.sh`.
- **Caddy:** append a `tanvir.eliooo.org` block to `~/n8n/Caddyfile` (`encode zstd gzip`, HSTS, `-Server`, `reverse_proxy tanvir-web:80`), validate with `caddy validate` inside the container, then `caddy reload`, then confirm the other four sites still answer. Back up the Caddyfile first, as the box's history of `.bak-` files shows is the habit.
- **CI (GitHub Actions):** on pull requests run `npm run check` and the headless browser smoke test. On push to `main`: check, build and push the image, then SSH to the box and run the deploy script. Needs repository secrets for the SSH key and host, and GHCR push via `GITHUB_TOKEN`; the box needs a `docker login ghcr.io` that can pull the image (or the package is public).
- **DNS cut-over:** at Hostinger, change `tanvir` from the Vercel CNAME to an A record for the box's IP. Lower the TTL a day before. Caddy gets the certificate on first request. Keep Vercel serving until the new address answers over HTTPS, then disconnect the Vercel project.

## Checks

- `npm run check`: html-validate plus node tests, updated for the new structure:
  - every page's head, canonical, one h1, skip link, landmarks (kept);
  - tokens in `styles.css` match the design system; every text/ground pair named in the README meets 4.5:1 (3:1 at 24 px+);
  - home section order; four product chapters with live links (Finioo allowed to be "Launching soon"); four client cards linking existing case studies;
  - every figure shown on home traces to `content/facts.md` (25, 583K+, $1.8B, 99.99%, 600K+, 100%);
  - no quote marked as an example, and every quote's name appears in `content/facts.md`;
  - case studies keep their structure and 700-word limit; résumé keeps ATS structure; sitemap and Person schema.
- **Browser smoke test** (headless Chrome over CDP, like the script used during design): at 1440×900 and 390×844, no horizontal overflow; nav is 52 px tall after scrolling into the product show (regression test for the collision bug); each product's copy is visible at its point in the show; the résumé button is in the first viewport; with JavaScript disabled, all four product headlines are visible; scrolling the show keeps the 95th-percentile frame gap under 20 ms.
- Lighthouse on the deployed page: performance 90+, accessibility 100.

## Left to the builder

- File layout of CSS and JS, naming (keep the design system's `tp-` prefix), how posters are factored.
- Image pipeline for the portrait (sizes, AVIF/WebP/JPEG, `srcset`), font loading strategy within the existing non-blocking pattern.
- Exact nginx caching headers and the deploy script's health check.
- Mobile menu implementation (focus trap, Escape to close).

## Open questions for Tanvir

1. ~~Recommendations~~ answered: two LinkedIn recommendations (see Decisions).
2. ~~Title~~ answered: Engineering Lead; LinkedIn changes to match.
3. ~~Better Health~~ answered: patient-first (eRx for doctors, then telemedicine, now the LHR). The LinkedIn draft's extra claims ("designed the full architecture", Manager) are not added to `content/facts.md` unless Tanvir confirms them; the site uses only what facts already records.
4. Server and deploy access: asked again at the deploy step, as a gate in the plan. Claude would make the one-time box changes (create `~/tanvir-web/`, append the Caddy block after a backup and `caddy validate`, reload, then check n8n, medioo, drugdb and bolo still answer), add the EC2 SSH key as a GitHub secret, and publish the image as a public GHCR package. Tanvir makes the Hostinger DNS change.
5. ~~Elastic IP~~ answered: 13.205.14.249 is a fixed Elastic IP.
6. ~~Portrait~~ answered: no higher-resolution original; build with the supplied 1086×1448 file.
