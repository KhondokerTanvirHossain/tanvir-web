# tanvir.eliooo.org portfolio, design spec

Date: 2026-09-12
Status: approved (direction A, approach 1)
Source facts: `content/facts.md`

## Purpose

A portfolio for Tanvir's search for remote Senior Software Engineer roles at US and Canadian product companies. Primary reader: a hiring manager with about 40 seconds. Primary action: download the résumé, then email. Secondary: read one case study.

Everything on the site must trace to a line in `content/facts.md`. Internal items listed there stay off the site.

## Positioning

Senior Software Engineer, Java and Spring backend, who owns architecture, infrastructure, delivery and the client conversation on regulated platforms: banking, a national financial regulator, HIPAA healthcare. Title stays Senior Software Engineer. Scope is described honestly and specifically instead of inflating the title.

Hero headline: "I build the systems that banks, regulators and hospitals bet on."
Eyebrow: "Senior Software Engineer · Dhaka, UTC+6 · Open to remote US roles"
Sub: "Java and Spring backend engineer who grew into owning delivery, infrastructure and product for regulated platforms. Internet banking for 583,000 customers, a national microfinance regulator, a HIPAA remote-monitoring MVP that raised its round."

Proof row, four figures: 583K+ internet banking customers · $1.8B transaction value processed · 99.99% uptime on a national microfinance platform · 100% HIPAA compliance scan pass.

## Visual identity (direction A, Editorial)

Single light theme. Every color painted explicitly.

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | page ground |
| `--soft` | `#F3F5F4` | photo backdrop, code and diagram panels, résumé section tint |
| `--ink` | `#15171A` | text, primary button |
| `--mute` | `#5A6068` | secondary text |
| `--accent` | `#1B5E3F` | eyebrows, italic emphasis, links, diagram highlights |
| `--line` | `#E3E5E8` | rules and borders |

Typography: Newsreader (Google Fonts, optical size axis, weights 400, 500, 600, italic 400) for the wordmark, headings, big numbers. Source Sans 3 (400, 500, 600) for everything else. Fallbacks: Georgia, serif and system-ui, sans-serif. Running text 65ch max. Numbers in `font-variant-numeric: tabular-nums`.

Photo: `assets/tanvir.jpg`, 4:5 crop from the reception portrait, max 300px wide on desktop, slight desaturation.

Motion: none beyond hover states. No animation library, no scroll effects.

## Pages

All plain HTML. Shared `styles.css`. One tiny `main.js` for the mobile nav toggle only.

### `/` Home

Sections in order, each with an id for the nav.

1. **Nav**: name as wordmark, links Work, How I work, Résumé, Contact. Under 760px: name plus a menu button.
2. **Hero** (`#top`): eyebrow, headline, sub, buttons "Download résumé" (`resume.pdf`) and "Email me" (mailto), photo right. Proof row beneath.
3. **Selected work** (`#work`): four case-study cards in a two-by-two grid. Each card: client and year, title, one-line outcome, three tags, link "Read the case study". Order: Agrani internet banking, Primefocus RPM, MRA-IMS, Better Health.
4. **How I work** (`#how`): four short principles with one sentence each. Ownership over scope. Tests first, then code. Clean boundaries so the next engineer can move fast. Say the uncomfortable thing early. Each pulled from the facts file's character notes and practice list.
5. **Stack** (`#stack`): grouped plain lists, not badges. Languages and frameworks. Data and messaging. Cloud and infrastructure. Practices. Certifications as one line.
6. **Building elioo** (`#elioo`): one card. "On the side I run elioo, a studio building AI companions for health, memory and money." Link to eliooo.org. This is the only place the elioo mark appears.
7. **Timeline** (`#timeline`): vertical list of roles from the facts file, most recent first, with one line each. GRP ERP and earlier live here.
8. **Contact** (`#contact`): email button, GitHub, LinkedIn, time zone and overlap note: "Dhaka is UTC+6. I keep 8am to 12pm US Eastern free for overlap."
9. **Footer**: name, "Dhaka · 2026", link to source repo.

### `/work/<slug>.html` Case studies

Four pages: `agrani-internet-banking`, `primefocus-rpm`, `mra-ims`, `better-health`.

Shared layout: back link, eyebrow (client, period, role, team size), title, outcome line in one sentence, then sections **Context**, **Constraint**, **What I owned**, **Architecture** (one inline SVG diagram, boxes and arrows, no more than eight nodes), **Decisions and trade-offs** (three to five), **Outcome** (numbers as a short list), **Stack** (one paragraph). Under 700 words each. Ends with "Next case study" link and the résumé button.

### `/resume.html` and `resume.pdf`

Print-first HTML page. ATS rules:
- Single column. No tables, columns, text boxes, icons or images.
- Standard headings in this order: Summary, Experience, Skills, Education, Certifications.
- Name on line one, then one line with email, LinkedIn, GitHub, location, "Open to remote (US)".
- Each role: Title, Company, Location, Dates on one line; then three to six bullets that start with a verb and end with a number where one exists.
- Real text throughout, fonts embedded, selectable. Two pages maximum at A4 and Letter.
- Filename `Tanvir_Hossain_Senior_Software_Engineer.pdf`, also served as `resume.pdf`.

Generated by headless Chrome from `resume.html` with `@page` margins, via `npm run pdf`. The PDF is committed so Vercel serves it statically.

### LinkedIn entry

`content/linkedin-better-health.md`: a LinkedIn Experience entry for Better Health. Title "Senior Software Engineer, Product and Platform Owner, Better Health". Company Celloscope Ltd. Dates Oct 2025 to present. Description under 2,000 characters, plain text, no internal names. Not published on the site; delivered for Tanvir to paste.

## Infrastructure

- Repo `tanvir-web`, GitHub `KhondokerTanvirHossain/tanvir-web`, Vercel project, production domain `tanvir.eliooo.org`.
- Hostinger DNS: `tanvir` CNAME to the value Vercel shows. Nothing else changes.
- `vercel.json`: security headers, `cleanUrls: true` so `/work/mra-ims` serves `work/mra-ims.html`, and a redirect from `/resume` to `/resume.pdf`.
- In `elioo-web`: add a 308 redirect `/tanvir` to `https://tanvir.eliooo.org`, and change the founder section GitHub and LinkedIn links to also include "Portfolio" pointing at the subdomain.

## SEO and sharing

`<title>Tanvir Hossain</title>`, meta description, canonical `https://tanvir.eliooo.org/`, Open Graph with `og.png` (name and headline on white with the green rule), JSON-LD `Person` schema with jobTitle, sameAs for GitHub and LinkedIn. `robots.txt` allow all. `sitemap.xml` listing the six HTML pages. No analytics in v1.

## Accessibility and performance

- All text pairs meet WCAG AA. `--mute` on `--bg` and on `--soft` verified in tests.
- Skip link to main. Visible focus rings. Semantic headings, one h1 per page.
- Lighthouse targets: performance 95+, accessibility 100, best practices 95+, SEO 100.
- Works at 400px. No horizontal scroll. Diagrams scroll inside their own container if wider.

## Testing

- `npm test`: Node tests reading every HTML file. Asserts: each page has title, canonical, one h1, skip link; home has the eight section ids and four case-study links; each case study has the seven section headings and one `<svg>`; résumé page has the five ATS headings in order, no `<table>`, no `<img>`; contrast ratios pass; every number in the proof row appears in `content/facts.md`.
- `npm run lint`: html-validate on all pages.
- `npm run pdf`: regenerates `resume.pdf`; a test checks the PDF exists and is under 400 KB.
- Manual: 400, 760, 1280 widths; keyboard nav; PDF opens in Preview and Chrome, text selectable, two pages.

## Out of scope

- Blog. Dark theme. Contact form. Analytics. Testimonials (none collected yet). Bangla version.

## Open items for Tanvir

- Confirm the four Celloscope date ranges in `content/facts.md`.
- Confirm the Primefocus Health and LG NOVA names may appear publicly.
