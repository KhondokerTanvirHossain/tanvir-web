# tanvir-web

Portfolio for [tanvir.eliooo.org](https://tanvir.eliooo.org). Plain HTML, CSS and JS. No build step.

## Pages

- `index.html` home
- `work/*.html` four case studies
- `resume.html` print-first résumé, exported to `resume.pdf`
- `content/facts.md` single source of truth for every claim on the site
- `content/linkedin-better-health.md` LinkedIn entry to paste

## Run locally

    npm run serve
    open http://localhost:4180

## Check

    npm run check   # html-validate + node tests

## Résumé PDF

Edit `resume.html`, then with the server running:

    npm run pdf

This writes `resume.pdf` and `Tanvir_Hossain_Senior_Software_Engineer.pdf`. Commit both.

## Open Graph image

    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
      --window-size=1200,630 --virtual-time-budget=5000 --screenshot=og.png http://localhost:4180/og.html

## Deploy

Vercel, production from `main`. Domain `tanvir.eliooo.org`.

DNS at Hostinger: `tanvir` CNAME to the value Vercel shows for the project. No other records change.

## Design

Spec: `docs/superpowers/specs/2026-09-12-portfolio-design.md`
Plan: `docs/superpowers/plans/2026-09-12-portfolio.md`
