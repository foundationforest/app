# app

The Forest app: the person's control panel. It makes the seed and keeps it on the device, mixes the
person's keys from it, registers their profiles, posts their offers and reviews, reads and sends
their messages, and makes access keys for their AI. Free and open. A web app first; phones later,
from the same code. No money in v1. Everything it talks to is a service with a public address, the
foundation's on devnet by default, each one the person can switch.

Devnet only. Nothing here is shipped, and this is the scaffold: no screens yet.

## The rules for apps that hold keys

The standard's [keys README](https://github.com/foundationforest/standard/blob/main/keys/README.md#rules-for-apps-that-hold-keys)
sets eleven rules for apps that hold keys. Where the app stands on each:

| Rule | Today |
|---|---|
| 1. The seed stays on the device, locked by its secure hardware; keys mixed from it are held only for the action that needs them | Followed. The seed is encrypted (AES-GCM) under a key mixed from a passkey's PRF secret, which the device's authenticator gives only after the person's face or fingerprint, and kept in IndexedDB. `withSeed` opens it for one action and zeroes it after; nothing mixed from it is stored (`src/seed/`) |
| 2. Every signature asks for the face or fingerprint and shows what is signed | Half. Every action that opens the seed asks for the face or fingerprint, one per action. Showing what is signed comes with the screens |
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is what the standard has a device send: signed records, messages and pulls; a row's transaction, signed, with its zero-knowledge proof; the note number an issuer signs |
| 4. Each app, server or AI gets its own access key for each folder | Not yet: no access keys are made yet |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device (`src/proof/`) |
| 6. The app works with any host, and its host with any app | Followed. Every service address is a setting, devnet's by default (`src/settings.ts`) |
| 7. A server that acts for you holds access keys with write, message or read scope | Not yet |
| 8. The app that holds the seed is open source | Followed: this repo, Apache 2.0 |
| 9. Keep a copy of every record signed | Not yet |
| 10. Keep each grant in the vault | Not yet: no vault yet |
| 11. Keep the issuer's note as safely as a key, in the vault | Not yet: no vault yet |

Where a device's passkeys give no PRF secret, the app refuses to lock a seed and says why. There is
no password route.

## How it works

- **The standard, pinned.** `STANDARD` holds one commit of
  [foundationforest/standard](https://github.com/foundationforest/standard). `./standard.sh` fetches
  it into `standard/` (not committed), runs `npm ci` in the packages named, and copies the registry
  circuit's devnet proving files into `public/circuits/`, each checked against its SHA-256 and named
  by it. The app imports keys, records (and records/private), the registry client and the reputation
  client from there by relative path, unchanged.
- **The seed** (`src/seed/`): 24 words made and read by the keys library; the locked store; `withSeed`.
- **The proof** (`src/proof/`): the registry client's `buildRegistration` in a Web Worker, with the
  proving files fetched from the app's own origin.
- **The services** (`src/services/`): one thin module each, ported from services' e2e: the issuer
  (who it is, a session with a return address, the note), a host (records, the inbox, credits
  spent), the registry payer (a row with a credit), an index (its JSON twins), and `credits.ts`, the
  buyer's side of credits, copied unchanged from services' `e2e/credits/client.ts`.
- **A Buffer for the standard** (`src/buffer.ts`): the records and registry clients call Node's
  global `Buffer`, which browsers lack; the app supplies one until the standard stops.

## Run it

Node 22.18 or later.

```
npm ci
./standard.sh keys records registry/client reputation/client
npm run dev            # on localhost
npm run check          # type-check
npm test               # Vitest, on loopback: records' reference host and stand-ins for the rest
npm run build          # dist/, a static PWA
npm run test:browser   # headless Chromium through Playwright, with a virtual passkey
```

On Vercel, `vercel.json` runs `standard.sh` and the build, and sends every path to the app.

## Limits

- **Devnet only.** Nothing is shipped.
- **Tested in Chromium only.** The browser test runs headless Chromium with a virtual passkey
  authenticator; Safari and Firefox are not tested yet.
- **The seed is as safe as the code the server sends.** A web app's code arrives from its server on
  each visit; installed, it runs from the copy its service worker keeps until the next update.
- **JavaScript cannot erase memory.** The app zeroes the seed after each action and keeps no other
  reference; it cannot promise the bytes are gone.
- **The font comes from Google Fonts,** so Google sees the address of a device that opens the app,
  until the service worker holds a copy.
