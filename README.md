# tanvir-web

Portfolio for [tanvir.eliooo.org](https://tanvir.eliooo.org): Tanvir Hossain, Engineering Lead. Plain HTML, CSS and small ES modules. No framework, no build step.

## Pages

- `index.html` home: hero, overview, the product show (Bolo, Medioo, Finioo, IntelliDrugs), client work, how I lead, about, contact
- `work/*.html` four case studies
- `resume.html` print-first résumé, exported to `resume.pdf` and `Tanvir_Hossain_Engineering_Lead.pdf`
- `content/facts.md` the single source of truth for every claim on the site
- `design/` snapshot of the design system ([artifact](https://claude.ai/artifact/Ua7QX6S9yrzGVAMxY51dGp)); refresh by hand when the artifact changes

Scripts: `main.js` (nav, menu), `overview.js` (Dhaka clock, quotes, burndown), `show.js` (the pinned product show), `films.js` (film slots).

## Run locally

    npm run serve
    open http://localhost:4180

Clean URLs like `/work/better-health` only work in the container; locally open `/work/better-health.html`.

## Check

    npm run check   # html-validate + node tests (structure, facts, tokens, contrast, show maths)
    npm run smoke   # headless Chrome: layout, nav, show, reload, resize, frame rate, no-JS
    bash deploy/test-image.sh   # builds the image and checks URLs, headers and what is served

## Add a product film (Remotion)

Render 1728×1080 (16:10), a 6 to 15 s loop, at most 3 MB, and a poster frame. Then:

1. Put `assets/films/<name>.webm`, `<name>.mp4` and `<name>-poster.jpg` in place (`<name>` is `bolo`, `medioo`, `finioo` or `intellidrugs`).
2. In `index.html` add `data-film-ready` to that product's `<div class="tp-film" data-film="<name>">`.

The film plays muted while on screen; without the files the drawn poster stays.

## Résumé PDF

Edit `resume.html`, then with `npm run serve` running:

    npm run pdf

This writes `resume.pdf` and `Tanvir_Hossain_Engineering_Lead.pdf`. Commit both.

## Open Graph image

    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
      --window-size=1200,630 --virtual-time-budget=5000 --screenshot=og.png http://localhost:4180/og.html

## Deploy

Hosted on the EC2 box (13.205.14.249, Elastic IP) behind the shared Caddy in `~/n8n`, as the container `tanvir-web` on the `n8n_edge` network.

- Every push and pull request runs `.github/workflows/ci.yml` (check, smoke, image test).
- A push to `main` runs `.github/workflows/deploy.yml`: the same checks, then the image `ghcr.io/khondokertanvirhossain/tanvir-web:<sha>` is pushed and `~/tanvir-web/deploy.sh` swaps it in over SSH, health-checking through Caddy and putting the previous tag back on failure.
- Repository secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, and optionally `EC2_KNOWN_HOSTS` (pins the host key).

Rollback on the box:

    IMAGE_TAG=$(cat ~/tanvir-web/PREV_TAG) bash ~/tanvir-web/deploy.sh

Caddy site blocks are in `deploy/Caddyfile.tanvir`. Change the shared Caddyfile only by: back up, append, `docker exec n8n-caddy-1 caddy validate --config /etc/caddy/Caddyfile`, `caddy reload`, then confirm n8n, medioo, drugdb and bolo still answer.

DNS at Hostinger: `tanvir` is an A record for 13.205.14.249.

## Design

Spec: `docs/superpowers/specs/2026-11-17-portfolio-redesign-design.md` (prototype beside it)
Plan: `docs/superpowers/plans/2026-11-17-portfolio-redesign.md`
