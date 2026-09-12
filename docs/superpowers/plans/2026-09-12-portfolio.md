# tanvir.eliooo.org Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the portfolio site, four case studies, an ATS-friendly résumé PDF and a LinkedIn entry, deployed at tanvir.eliooo.org, with a redirect from eliooo.org/tanvir.

**Architecture:** Plain HTML pages sharing one stylesheet. A Node test file reads every page as text and asserts structure, copy and contrast. Headless Chrome renders `resume.html` to `resume.pdf`. Vercel serves everything statically.

**Tech Stack:** HTML5, CSS3, minimal vanilla JS, Node 24 `node:test`, html-validate, headless Google Chrome, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-12-portfolio-design.md`

## Global Constraints

- Tokens: `--bg #FFFFFF`, `--soft #F3F5F4`, `--ink #15171A`, `--mute #5A6068`, `--accent #1B5E3F`, `--line #E3E5E8`. Single light theme.
- Fonts: Newsreader (display) and Source Sans 3 (body) from Google Fonts, `display=swap`, with Georgia/serif and system-ui/sans-serif fallbacks.
- Every number and claim traces to `content/facts.md`. Items marked INTERNAL there never appear in HTML.
- Title stays "Senior Software Engineer" everywhere.
- Pages: `index.html`, `work/agrani-internet-banking.html`, `work/primefocus-rpm.html`, `work/mra-ims.html`, `work/better-health.html`, `resume.html`. Assets: `assets/tanvir.jpg`, `favicon.svg`, `og.png`, `resume.pdf`.
- Section ids on home, in order: `top`, `work`, `how`, `stack`, `elioo`, `timeline`, `contact`.
- Case study section headings, in order: Context, Constraint, What I owned, Architecture, Decisions and trade-offs, Outcome, Stack.
- Résumé headings, in order: Summary, Experience, Skills, Education, Certifications. No `<table>`, no `<img>`.
- Commit after every task with trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Scaffold, tokens, shared chrome, test harness

**Files:** `package.json`, `.gitignore`, `.htmlvalidate.json`, `styles.css`, `main.js`, `vercel.json`, `robots.txt`, `favicon.svg`, `assets/tanvir.jpg`, `tests/pages.test.mjs`, `index.html` (nav, hero, proof, footer only).

**Interfaces:** `styles.css` exposes classes `.wrap`, `.nav`, `.btn`, `.btn-primary`, `.eyebrow`, `.section`, `.section-head`, `.card`, `.proof`, `.stat`, `.prose`, `.footer`. Later pages use only these plus page-specific additions in the same file.

- [ ] **Step 1: package.json and config**

```json
{
  "name": "tanvir-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "node --test",
    "lint": "npx --yes html-validate@8 index.html work/*.html resume.html",
    "check": "npm run lint && npm test",
    "serve": "python3 -m http.server 4180",
    "pdf": "\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf=resume.pdf --virtual-time-budget=4000 http://localhost:4180/resume.html && cp resume.pdf Tanvir_Hossain_Senior_Software_Engineer.pdf"
  }
}
```

`.htmlvalidate.json`: `{ "extends": ["html-validate:recommended"], "rules": { "no-inline-style": "off" } }`

`.gitignore`: `node_modules/`, `.vercel/`, `.DS_Store`.

`vercel.json`:
```json
{
  "cleanUrls": true,
  "redirects": [{ "source": "/resume", "destination": "/resume.pdf", "permanent": false }],
  "headers": [{ "source": "/(.*)", "headers": [
    { "key": "X-Content-Type-Options", "value": "nosniff" },
    { "key": "X-Frame-Options", "value": "DENY" },
    { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
  ]}]
}
```

- [ ] **Step 2: Failing tests**

`tests/pages.test.mjs` asserts, for every page in the list: `<title>` present, `<link rel="canonical"`, exactly one `<h1`, a skip link `href="#main"`, `<main id="main">`. For `index.html`: the seven section ids in order and four `href="work/..."` links, and the four proof figures `583K+`, `$1.8B`, `99.99%`, `100%` each also present in `content/facts.md` (as `583K+`, `1.82B`, `99.99%`, `100% pass`). Contrast test: `#5A6068` on `#FFFFFF` and on `#F3F5F4` at or above 4.5.

- [ ] **Step 3: Implement** `styles.css` tokens and chrome, `index.html` with nav, hero, proof row, footer, per the spec copy. Photo: `sips -Z 1000` of the reception portrait `DSC07816.jpg`, saved to `assets/tanvir.jpg`.

- [ ] **Step 4: `npm run check` green. Commit** `feat: scaffold with tokens, hero and test harness`.

---

### Task 2: Home page sections

**Files:** `index.html`, `styles.css`, `tests/pages.test.mjs`.

- [ ] Add tests: `#work` has four `.card` with `href="work/<slug>"` for the four slugs; `#how` has four `<h3>`; `#stack` has four `<h3>` groups; `#elioo` links `https://eliooo.org`; `#timeline` has seven `<li>`; `#contact` has mailto, GitHub, LinkedIn.
- [ ] Implement sections with copy from the spec and facts file. Timeline entries, most recent first: Better Health (Oct 2025 to present), Primefocus Health (Jul 2024 to Sep 2025), MRA-IMS (May 2023 to Jun 2024), Internet Banking (Sep 2021 to Apr 2023), CoKreates GRP ERP (2020 to 2021), CUET Computer Club (2019 to 2020), SELISE attachment (2018).
- [ ] `npm run check` green. Commit `feat: home sections`.

---

### Task 3: Case study pages

**Files:** `work/agrani-internet-banking.html`, `work/primefocus-rpm.html`, `work/mra-ims.html`, `work/better-health.html`, `styles.css`, `tests/pages.test.mjs`.

- [ ] Add tests: each work page has the seven `<h2>` headings in order, exactly one `<svg`, a link back to `../`, a link to `../resume.pdf`, under 700 words in `<main>` text.
- [ ] Content per page, from `content/facts.md`:
  - **Agrani**: Software Engineer, Sep 2021 to Apr 2023, team 15. Outcome: launched Mar 2022 in about a month; 583K+ customers, BDT 212.5B (about $1.8B), 23.2M logins in 2025, 120+ TPS. Diagram nodes: Angular app, API gateway, IB services (Spring Boot), Redis, PostgreSQL, CBS middleware, Temenos T24, payment rails (BEFTN, NPSB, MFS, QR). Decisions: CBS middleware as the integration seam; feature flags for bank-hosted zero-downtime releases; OAuth2 PKCE and MFA; being on-site at the bank for infra until a DevOps team existed.
  - **Primefocus**: engineering manager and architect (client title TPM), Jul 2024 to Sep 2025. Outcome: MVP on time and budget, HIPAA scan 100%, funding secured. Diagram nodes: Flutter apps (patient, provider), Cognito, API gateway, 8+ Spring Boot services on EKS, RDS, ElastiCache, Binah.ai SDK, Tenovi scale, FF4j service. Decisions: single Flutter codebase; camera-based vitals over a webview SDK after PoC; strategy pattern for device vs manual weight; Terraform and Terragrunt multi-account; blue-green on Kubernetes.
  - **MRA-IMS**: Team Lead, May 2023 to Jun 2024. Outcome: 600K+ transactions per week, 99.99% uptime, target 20 MFIs, 500 branches, 15K field officers, 1.2M accounts, scoped to 731 MFIs. Diagram nodes: field officer app, web portal, gateway, multi-tenant engine (reactive), batch/EOD processor, Redis, PostgreSQL, regulator MIS. Decisions: configuration over code for product rules; reactive batch for EOD; PoC with two MFIs then scale; field visits to Tangail to fit paper reality.
  - **Better Health**: Senior Software Engineer, product and platform owner, Oct 2025 to present. Outcome: prescription and telemedicine live; 27K+ medicines, 45K+ terms, speech-to-text across seven sections; five boards, ~20 engineers. Diagram nodes: Angular portals, Spring Cloud Gateway, Keycloak, prescription and appointment services, speech platform (Python), five PostgreSQL clusters, Debezium, Kafka, analytics PostgreSQL. Decisions: CDC with PHI excluded at source; hexagonal reactive services; K3s migration; zero-tolerance clinical error gate for AI; no autonomous diagnosis.
- [ ] `npm run check` green. Commit `feat: four case studies`.

---

### Task 4: Résumé page and PDF

**Files:** `resume.html`, `styles.css` (print block), `resume.pdf`, `Tanvir_Hossain_Senior_Software_Engineer.pdf`, `tests/pages.test.mjs`.

- [ ] Add tests: `resume.html` has the five headings in order, no `<table`, no `<img`, name in `<h1>`, contact line contains email, LinkedIn, GitHub; `resume.pdf` exists and is under 400 KB.
- [ ] Résumé content:

**Khondoker Tanvir Hossain**
k.tanvir.hossain@gmail.com · linkedin.com/in/k-tanvir-hossain · github.com/KhondokerTanvirHossain · Dhaka, Bangladesh (UTC+6) · Open to remote roles, US hours overlap

**Summary**
Senior Software Engineer with five years building Java and Spring platforms in regulated domains: internet banking for a state-owned bank, a national microfinance regulator's system, a HIPAA remote patient monitoring MVP, and a doctor-first digital health product. Owns the full path from architecture and infrastructure to delivery and client conversation. Practices TDD, clean and hexagonal architecture, reactive Java, infrastructure as code.

**Experience**

Senior Software Engineer, Celloscope Ltd, Dhaka, Sep 2021 to present

Better Health, product and platform owner, Oct 2025 to present
- Own product and delivery for a doctor-first prescription and telemedicine platform across five Scrum boards and about 20 engineers on two-week sprints.
- Designed a Debezium to Kafka change-data-capture pipeline consolidating five PostgreSQL clusters into an analytics database with PHI excluded at source.
- Built live video consultation with Angular and Agora, including Keycloak-authenticated routing and token handling.
- Migrated deployments from Docker Swarm to K3s with Helm, Traefik, Vault and GitLab CI/CD; ran Prometheus, Grafana, Graylog and Zipkin observability.
- Defined the speech-to-text accuracy plan (WER plus extraction F1, zero-tolerance gate for critical clinical errors) and QA acceptance criteria from a 300-page PRD.
- Authored market sizing, pricing and cost models and investor reporting for the product.

Primefocus Health (LG NOVA), engineering manager and architect, Jul 2024 to Sep 2025
- Led delivery of a HIPAA-compliant remote patient monitoring MVP: 8+ Spring Boot microservices, patient app and provider portal, shipped on time and on budget; funding secured.
- Provisioned multi-account AWS (EKS, RDS, WAF, KMS, Secrets Manager, Vault) with Terraform and Terragrunt across three environments; HIPAA compliance scan passed at 100%.
- Chose a single Flutter codebase for Android, iOS and web, camera-based vitals via Binah.ai after a PoC, and a strategy pattern for smart-scale versus manual weight.
- Set up GitLab CI/CD with blue-green zero-downtime Kubernetes deployments and a centralised FF4j feature-flag service for canary and A/B rollouts.
- Ran observability and on-call: Prometheus, Grafana, Loki, Zipkin, PagerDuty with P0/P1 playbooks.

MRA-IMS, Team Lead, May 2023 to Jun 2024
- Led a multi-tenant microfinance platform for Bangladesh's Microcredit Regulatory Authority, targeting 20 MFIs, 500 branches, 15,000 field officers and 1.2M accounts, scoped to all 731 regulated MFIs.
- Designed a configurable loan and savings engine handling different product rules and interest methods per tenant without code changes.
- Built reactive batch and parallel end-of-day pipelines sustaining 600,000+ transactions per week at 99.99% uptime.
- Ran the two-MFI proof of concept and field rollout, including on-site paper-to-digital migration in Tangail.

Internet Banking for Agrani Bank PLC, Software Engineer, Sep 2021 to Apr 2023
- Built Spring Boot, PostgreSQL and Redis microservices for a mobile-first internet banking platform launched in March 2022 and serving 583,000+ customers and BDT 212.5B (about USD 1.8B) in transactions at 120+ TPS.
- Integrated Temenos T24 core banking through reusable middleware, plus BEFTN, NPSB, MFS (bKash, Nagad, Upay), QR, ekpay, telco and Election Commission eKYC.
- Implemented OAuth2 PKCE, MFA, RBAC, mTLS and Vault-managed secrets; owned JUnit and Mockito test strategy for payment flows.
- Became the bank-facing engineer: gathered requirements from the bank's senior IT staff and handled on-site deployments and incidents until a DevOps team was formed.

Software Engineer, CoKreates, Dhaka, 2020 to 2021
- Built the Accounts module of a government ERP: 13 Spring microservices and 119 controllers on Spring Cloud with Zuul, Eureka, Feign and an OAuth2/JWT gateway.

**Skills**
Java 21, Spring Boot, Spring WebFlux, Reactive Java, Angular, Flutter (delivery), PostgreSQL, Redis, Kafka, Debezium, Elasticsearch, Docker, Kubernetes (EKS, K3s), Helm, Terraform, Terragrunt, Ansible, AWS, GitLab CI/CD, Keycloak, HashiCorp Vault, Prometheus, Grafana, Zipkin, JUnit, Mockito, TDD, DDD, CQRS, event sourcing, clean and hexagonal architecture, HIPAA, PCI DSS, Jira and Scrum.

**Education**
BSc in Computer Science and Engineering, Chittagong University of Engineering and Technology (CUET), 2015 to 2019.

**Certifications**
AWS: Introduction, RDS, CloudFormation, EKS, Advanced Terraform. KodeKloud: Docker Swarm, Kubernetes, DevOps. Python.

- [ ] Print CSS: `@page { size: A4; margin: 16mm 18mm }`, body 10.5pt Source Sans 3, headings Newsreader, no colors other than ink and accent rules. Serve, run `npm run pdf`, confirm two pages and selectable text.
- [ ] `npm run check` green. Commit `feat: résumé page and ATS PDF`.

---

### Task 5: LinkedIn entry, SEO files, OG image

**Files:** `content/linkedin-better-health.md`, `sitemap.xml`, `og.html`, `og.png`, JSON-LD in `index.html`.

- [ ] Write the LinkedIn entry under 2,000 characters from case study 4, no internal names.
- [ ] `sitemap.xml` with six URLs. JSON-LD Person block on home. Open Graph and Twitter meta on every page. `og.png` from `og.html` via headless Chrome at 1200x630.
- [ ] Add test: sitemap lists six `<loc>`; home contains `"@type": "Person"`.
- [ ] `npm run check` green. Commit `feat: seo, og image, linkedin entry`.

---

### Task 6: Lighthouse, responsive pass, README

- [ ] Serve, run `npx lighthouse@12` on home, one case study and résumé. Fix anything under target (perf 95, a11y 100, bp 95, seo 100).
- [ ] Screenshot at 400px via iframe host, check no horizontal scroll and readable diagram.
- [ ] README with run, check, pdf, deploy and DNS steps. Commit `docs: readme` and `fix:` commits as needed.

---

### Task 7: Deploy and cross-link

- [ ] Create GitHub repo `tanvir-web` (`gh repo create KhondokerTanvirHossain/tanvir-web --public --source=. --push`).
- [ ] Vercel: import repo, add domain `tanvir.eliooo.org`, copy CNAME to Hostinger. User does this in the dashboard; CLI is logged out.
- [ ] In `elioo-web`: add to `vercel.json` `"redirects": [{ "source": "/tanvir", "destination": "https://tanvir.eliooo.org", "permanent": true }]`; add a "Portfolio" link in the founder section next to GitHub and LinkedIn. Commit and push.
- [ ] Verify `curl -sI https://eliooo.org/tanvir` returns 308 to the subdomain once deployed.
