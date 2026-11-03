#!/usr/bin/env bash
# Fetches the three repos the app is built on, each at the commit its file holds, none committed:
#
#   standard/   foundationforest/standard at STANDARD, installed and built at its root (one npm
#               workspace): the app uses @foundationforest/keys, /folders (with /locked) and
#               /proofs from there, unchanged, by name (vite.config.ts, tsconfig.json), and the
#               verification circuit's committed proving files.
#   markets/    foundationforest/markets at MARKETS, its package (build/) installed and built: the
#               app reads the directory through it, at build time.
#   services/   foundationforest/services at SERVICES, fetched only: the app uses the host's credits
#               client (host/client/client.ts) as it is, the tests run the host's own code, and
#               the reference app (mcp/test/app.ts) checks that both write the same.
#
# `./standard.sh services` also readies services' own verifier, host, index and mcp to run on this
# machine, as services' loop runs them (its own standard.sh, then `npm ci` in each): the browser test
# needs them.
# Moving a pin is a one-line change to its file. Needs git, Node 22.18 or later, and the network.
set -euo pipefail
cd "$(dirname "$0")"

# The repo at a commit into a directory: fetched once, moved when the commit changes.
pinned() {
  local dir="$1" repo="$2" commit="$3"
  if [ ! -d "$dir/.git" ]; then
    git init -q "$dir"
    git -C "$dir" remote add origin "$repo"
  fi
  if [ "$(git -C "$dir" rev-parse -q --verify HEAD || true)" != "$commit" ]; then
    git -C "$dir" fetch -q --depth 1 origin "$commit"
    git -C "$dir" checkout -q --detach "$commit"
  fi
  echo "$dir at $commit"
}

pin() { tr -d '[:space:]' < "$1"; }

# --include=dev: each builds itself with TypeScript, a dev dependency, which a build machine in
# production mode (Vercel's) would otherwise leave out.
pinned standard "${STANDARD_REPO:-https://github.com/foundationforest/standard}" "$(pin STANDARD)"
(cd standard && npm ci --include=dev --no-audit --no-fund && npm run build)

pinned markets "${MARKETS_REPO:-https://github.com/foundationforest/markets}" "$(pin MARKETS)"
(cd markets/build && npm ci --include=dev --no-audit --no-fund && npm run build)

pinned services "${SERVICES_REPO:-https://github.com/foundationforest/services}" "$(pin SERVICES)"

# The app and services must stand on the same standard and markets: what the app writes is checked
# against services' own code, which reads them at its own pins.
for file in STANDARD MARKETS; do
  if [ "$(pin "$file")" != "$(pin "services/$file")" ]; then
    echo "$file is $(pin "$file") here and $(pin "services/$file") at SERVICES: move them together" >&2
    exit 1
  fi
done

# Services reads them from its own standard/ and markets/: at the same commits, those are these,
# linked, so services' code (the reference app's proving files among it) finds them without a
# second checkout.
for dir in standard markets; do
  [ -e "services/$dir" ] || ln -s "../$dir" "services/$dir"
done

if [ "${1:-}" = services ]; then
  (cd services && ./standard.sh)
  (cd services/host && npm ci --no-audit --no-fund)
  (cd services/verifier && npm ci --no-audit --no-fund)
  (cd services/index && npm ci --no-audit --no-fund)
  (cd services/mcp && npm ci --no-audit --no-fund)
fi
