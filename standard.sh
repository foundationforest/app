#!/usr/bin/env bash
# Fetches foundationforest/standard at the commit in STANDARD into standard/ (not committed), runs
# `npm ci` in each standard package named on the command line, then copies the registry circuit's
# devnet proving files into public/circuits/, each checked against its SHA-256 in the circuit's
# setup.json. The app uses standard's pieces from there, unchanged, by relative path: standard/keys,
# standard/records (and records/private), standard/registry/client and standard/reputation/client.
# Moving the pin is a one-line change to STANDARD. Needs git and the network.
#
#   ./standard.sh                                                 standard at the pinned commit
#   ./standard.sh keys records registry/client reputation/client  and `npm ci` in those packages
set -euo pipefail
cd "$(dirname "$0")"

STANDARD_REPO="${STANDARD_REPO:-https://github.com/foundationforest/standard}"
STANDARD_COMMIT="$(tr -d '[:space:]' < STANDARD)"

if [ ! -d standard/.git ]; then
  git init -q standard
  git -C standard remote add origin "$STANDARD_REPO"
fi
if [ "$(git -C standard rev-parse -q --verify HEAD || true)" != "$STANDARD_COMMIT" ]; then
  git -C standard fetch -q --depth 1 origin "$STANDARD_COMMIT"
  git -C standard checkout -q --detach "$STANDARD_COMMIT"
fi
echo "standard at $STANDARD_COMMIT"

# --include=dev: records builds itself on install with TypeScript, a dev dependency, which a build
# machine in production mode would otherwise leave out.
for dir in "$@"; do
  (cd "standard/$dir" && npm ci --include=dev --no-audit --no-fund)
done

# The person proof's proving files, served from the app's own origin to the proof's worker, each
# named by its SHA-256 so a cached copy is never a stale one (src/proof/circuit.ts).
circuit=standard/registry/circuit/devnet
rm -rf public/circuits
mkdir -p public/circuits
for name in person.wasm person.zkey; do
  want="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).files[process.argv[2]].sha256)' "$circuit/setup.json" "$name")"
  got="$(sha256sum "$circuit/$name" | cut -d' ' -f1)"
  if [ "$got" != "$want" ]; then
    echo "$name: WRONG, want $want, got $got" >&2
    exit 1
  fi
  cp "$circuit/$name" "public/circuits/$want.${name##*.}"
done
echo "public/circuits: person.wasm and person.zkey, hashes match setup.json"
