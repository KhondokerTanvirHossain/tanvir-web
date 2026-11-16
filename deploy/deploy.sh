#!/usr/bin/env bash
# tanvir-web deploy on the EC2 box. Run by GitHub Actions over SSH:
#   IMAGE_TAG=<git sha> bash ~/tanvir-web/deploy.sh
# Rollback by hand:
#   IMAGE_TAG=$(cat ~/tanvir-web/PREV_TAG) bash ~/tanvir-web/deploy.sh
# Pulls the image, swaps the container, checks it through Caddy, and puts the previous tag back if the check fails.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO=ghcr.io/khondokertanvirhossain/tanvir-web
CADDY=${CADDY_CONTAINER:-n8n-caddy-1}
: "${IMAGE_TAG:?set IMAGE_TAG to the git sha to deploy}"

log() { printf '[tanvir-web] %s\n' "$*"; }
up() { IMAGE_TAG="$1" docker compose -f "$DIR/compose.yml" -p tanvir-web up -d --remove-orphans; }
healthy() {
  for _ in $(seq 1 20); do
    if docker exec "$CADDY" wget -qO- http://tanvir-web/ 2>/dev/null | grep -q "I lead the team"; then return 0; fi
    sleep 1
  done
  return 1
}

current=$(cat "$DIR/TAG" 2>/dev/null || true)
log "pulling $REPO:$IMAGE_TAG"
docker pull -q "$REPO:$IMAGE_TAG"
up "$IMAGE_TAG"

if healthy; then
  if [ -n "$current" ] && [ "$current" != "$IMAGE_TAG" ]; then echo "$current" > "$DIR/PREV_TAG"; fi
  echo "$IMAGE_TAG" > "$DIR/TAG"
  log "live: $IMAGE_TAG"
  # Keep the three newest images of this repository.
  docker images "$REPO" --format '{{.CreatedAt}}|{{.Tag}}' | sort -r | tail -n +4 | cut -d'|' -f2 |
    while read -r old; do [ "$old" = "$IMAGE_TAG" ] || docker rmi "$REPO:$old" >/dev/null 2>&1 || true; done
else
  log "health check failed for $IMAGE_TAG"
  if [ -n "$current" ]; then log "putting $current back"; up "$current"; fi
  exit 1
fi
