# app

The Forest app: the person's control panel. It makes the seed and keeps it on the device, mixes the
person's keys from it, registers their profiles, posts their offers and reviews, reads and sends
their messages, and makes access keys for their AI. Free and open. A web app first; phones later,
from the same code. No money in v1. Everything it talks to is a service with a public address, the
foundation's on devnet by default, each one the person can switch.

Devnet only. Nothing here is shipped. The first screens are here: setup, restore, the board, a new
profile, a profile's page and the menu; adding offers, reviews and access keys, and the inbox, come
next.

## The rules for apps that hold keys

The standard's [keys README](https://github.com/foundationforest/standard/blob/main/keys/README.md#rules-for-apps-that-hold-keys)
sets eleven rules for apps that hold keys. Where the app stands on each:

| Rule | Today |
|---|---|
| 1. The seed stays on the device, locked by its secure hardware; keys mixed from it are held only for the action that needs them | Followed. The seed is encrypted (AES-GCM) under a key mixed from a passkey's PRF secret, which the device's authenticator gives only after the person's face or fingerprint, and kept in IndexedDB. `withSeed` opens it for one action and zeroes it after; nothing mixed from it is stored (`src/seed/`) |
| 2. Every signature asks for the face or fingerprint and shows what is signed | Half. Every action that opens the seed asks for the face or fingerprint, once (`withFace`). The screens do not yet show what is signed |
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is what the standard has a device send: signed records, messages and pulls; a row's transaction, signed, with its zero-knowledge proof; the note number an issuer signs; and, to the services, blinded buys and the credits spent |
| 4. Each app, server or AI gets its own access key for each folder | Not yet: no access keys are made yet |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device (`src/proof/`) |
| 6. The app works with any host, and its host with any app | Followed. Every service address is a setting, devnet's by default (`src/settings.ts`) |
| 7. A server that acts for you holds access keys with write, message or read scope | Not yet |
| 8. The app that holds the seed is open source | Followed: this repo, Apache 2.0 |
| 9. Keep a copy of every record signed | Not yet |
| 10. Keep each grant in the vault | Not yet: the vault is written, but no grant reaches the app until the inbox does |
| 11. Keep the issuer's note as safely as a key, in the vault | Followed. Setup writes the note to the vault before it locks the seed (`src/flows/setup.ts`) |

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
- **The face** (`src/face.ts`): every action that needs the seed opens it once with `withSeed`, one
  face or fingerprint, and in the same opening signs a pull for each profile's inbox, sent once the
  seed is closed, so the inbox's count is what the last face found (`src/inbox.ts`). Nothing mixed
  from the seed outlives the action.
- **The vault** (`src/vault.ts`): the standard's vault, on the person's host, read and written with
  keys mixed from the seed for the action. It holds the labels of their profiles, their issuer's
  note, and two fields of this app's: `credits`, the credits not yet spent (bearer credits, as safe
  as the vault), and `settings.forestApp`, the services the person uses. Read strictly: a host that
  does not answer is an error, never "no vault", so no new vault is written over one.
- **The flows** (`src/flows/`): setup's face check (a buy at each service the issuer's welcome
  gift names; the note asked for until the check passes, with the buys' references; the credits
  collected with the gift's tickets; the first vault), each stage kept so trying again starts where
  it stopped; a new profile (the proof in the worker, the row through the registry payer with a
  credit, the hosts record, a host credit into the folder, a card with no name and an inbox open
  to people holding a row from the same issuer, the vault written again); restore; removing an
  access key.
- **The screens** (`src/screens/`, `src/ui.tsx`, `src/theme.css`): Manrope, carried in the app
  (SIL Open Font License 1.1, from `@fontsource-variable/manrope`); four colors and one accent. The
  person's own records come from their hosts, read by POST; scores, the reviews about a profile and
  the markets' role words from the index's JSON twins (`src/cards.ts`). What the device keeps
  besides the locked seed is in `src/local.ts`: the profiles with their addresses, the inbox counts,
  the reviews seen, the appearance.
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
npm run test:browser   # headless Chromium through Playwright, with a virtual passkey: the modules,
                       # then the app's screens through setup, a new profile, the card, the menu,
                       # forgetting the device and restoring, against the stand-ins
                       # (SHOTS=<dir> keeps a screenshot of each screen)
```

On Vercel, `vercel.json` runs `standard.sh` and the build, and sends every path to the app.

## Limits

- **Devnet only.** Nothing is shipped.
- **Tested in Chromium only.** The browser test runs headless Chromium with a virtual passkey
  authenticator; Safari and Firefox are not tested yet. Nor is the password manager's own save
  prompt, nor a real Didit check: the test checks the form the prompt saves, and runs the face check
  against a stand-in page.
- **The devnet index does not show these cards yet.** A card here has no name, as the standard
  allows since the commit this app pins; the foundation's index checks cards against the schema of
  an older commit, which requires one, and leaves them out until services moves its pin.
- **The welcome gift is lost if setup stops between the note and the vault.** The buys live in the
  page until then, and the issuer gives a note number one gift: buys made again are refused as
  `given`. The note itself comes back with the same face and the same 24 words ("I have my 24
  words" goes on to the face check when it finds no vault).
- **A browser that asks for a tap to make a passkey** (Safari does) may refuse the lock after a
  long face check; Start again goes straight to the lock.
- **Reading your profiles from one device links them** for whoever sees the requests: the board
  reads each profile's folder from its hosts and its twin from the index, from one network address.
- **The seed is as safe as the code the server sends.** A web app's code arrives from its server on
  each visit; installed, it runs from the copy its service worker keeps until the next update.
- **JavaScript cannot erase memory.** The app zeroes the seed after each action and keeps no other
  reference; it cannot promise the bytes are gone.
