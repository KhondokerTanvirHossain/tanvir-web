#!/usr/bin/env bash
# Builds the site image and checks it behaves: clean URLs, the résumé redirect, headers, caching,
# and that nothing private is served. Usage: bash deploy/test-image.sh
set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE=tanvir-web:test
NAME=tanvir-web-test-$$
docker build -q -t "$IMAGE" . >/dev/null
docker run -d --rm --name "$NAME" -p 127.0.0.1::80 "$IMAGE" >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
PORT=$(docker port "$NAME" 80/tcp | head -1 | sed 's/.*://')
BASE="http://127.0.0.1:$PORT"
for _ in $(seq 1 30); do curl -fs -o /dev/null "$BASE/" && break; sleep 0.2; done

fails=0
ok() { echo "PASS  $1"; }
bad() { echo "FAIL  $1"; fails=$((fails + 1)); }
code() { curl -s -o /dev/null -w '%{http_code}' "$BASE$1"; }
header() { curl -s -D - -o /dev/null "$BASE$1" | tr -d '\r' | grep -i "^$2:" | head -1 | cut -d' ' -f2-; }
expect_code() { local got; got=$(code "$1"); [ "$got" = "$2" ] && ok "$1 → $2" || bad "$1 → $got (want $2)"; }

[ "$(code /)" = 200 ] && curl -s "$BASE/" | grep -q "I lead the team" && ok "/ serves the home page" || bad "/ does not serve the home page"
expect_code /work/better-health 200
expect_code /work/better-health.html 200
expect_code /resume.pdf 200
expect_code /Tanvir_Hossain_Engineering_Lead.pdf 200
[ "$(code /resume)" = 302 ] && header /resume Location | grep -q '/resume\.pdf$' && ok "/resume → 302 /resume.pdf" || bad "/resume is not a redirect to /resume.pdf"
[ "$(header / X-Content-Type-Options)" = nosniff ] && ok "nosniff" || bad "X-Content-Type-Options missing"
[ "$(header / X-Frame-Options)" = DENY ] && ok "X-Frame-Options DENY" || bad "X-Frame-Options missing"
[ "$(header / Referrer-Policy)" = strict-origin-when-cross-origin ] && ok "Referrer-Policy" || bad "Referrer-Policy missing"
[ "$(header / Cache-Control)" = no-cache ] && ok "HTML is no-cache" || bad "HTML Cache-Control is '$(header / Cache-Control)'"
[ "$(header /styles.css Cache-Control)" = "public, max-age=3600" ] && ok "CSS cached 1h" || bad "CSS Cache-Control is '$(header /styles.css Cache-Control)'"
[ -z "$(header / Server | grep -i '[0-9]')" ] && ok "no server version" || bad "Server header leaks a version"
for private in /docs/ /tests/smoke.mjs /content/facts.md /assets/src/portrait-studio.png /Dockerfile /design/tokens.json /package.json /README.md /.git/HEAD; do
  expect_code "$private" 404
done
expect_code /nope 404

echo
[ "$fails" -eq 0 ] && echo "all checks passed" || { echo "$fails check(s) failed"; exit 1; }
