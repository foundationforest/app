# app

The Forest app: the person's control panel. It makes the seed and keeps it on the device, mixes the
person's keys from it, registers their profiles, posts their offers and reviews, reads and sends
their messages, and makes access keys for their AI. Free and open. A web app first; phones later,
from the same code. No money in v1. Everything it talks to is a service with a public address, the
foundation's on devnet by default, each one the person can switch.

Devnet only. Nothing here is shipped. Here: setup, restore, the board, a new profile, a profile's
page with its offers and reviews, the inbox with its requests, the message door, and the menu.
Making access keys comes next.

## The rules for apps that hold keys

The standard's [keys README](https://github.com/foundationforest/standard/blob/main/keys/README.md#rules-for-apps-that-hold-keys)
sets eleven rules for apps that hold keys. Where the app stands on each:

| Rule | Today |
|---|---|
| 1. The seed stays on the device, locked by its secure hardware; keys mixed from it are held only for the action that needs them | Followed. The seed is encrypted (AES-GCM) under a key mixed from a passkey's PRF secret, which the device's authenticator gives only after the person's face or fingerprint, and kept in IndexedDB. `withSeed` opens it for one action and zeroes it after; nothing mixed from it is stored (`src/seed/`) |
| 2. Every signature asks for the face or fingerprint and shows what is signed | Half. Every action that opens the seed asks for the face or fingerprint, once (`withFace`). An offer, a review and a message are signed as their sheet shows them, and a request as its card shows it; setup's records, the vault, the card and the pulls are signed without being shown |
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is what the standard has a device send: signed records, messages and pulls; a row's transaction, signed, with its zero-knowledge proof; the note number an issuer signs; and, to the services, blinded buys and the credits spent |
| 4. Each app, server or AI gets its own access key for each folder | Not yet: no access keys are made yet |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device (`src/proof/`) |
| 6. The app works with any host, and its host with any app | Followed. Every service address is a setting, devnet's by default (`src/settings.ts`) |
| 7. A server that acts for you holds access keys with write, message or read scope | Not yet |
| 8. The app that holds the seed is open source | Followed: this repo, Apache 2.0 |
| 9. Keep a copy of every record signed | Not yet for records. Each message sent is copied to the sending profile's own inbox |
| 10. Keep each grant in the vault | Not yet: the inbox reads messages, but a grant in one is neither shown nor added to the vault |
| 11. Keep the issuer's note as safely as a key, in the vault | Followed. The seed is locked before the face check; the note waits in the locked store, encrypted under a key mixed from the seed, until the vault holds it (`src/flows/setup.ts`) |

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
  While setup is under way, the locked store also holds what its face check has got so far (the
  gift's buys, then the note and its tickets), encrypted under a key mixed from the seed; it is
  removed once the vault is written.
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
  note, and this app's own field, `settings.forestApp`: the services the person uses, and
  `credits`, the credits not yet spent (bearer credits, as safe as the vault). A vault an older copy
  of this app wrote, with its credits at the top, has them moved in when read, and written there at
  its next write. Read strictly: a host that does not answer is an error, never "no vault", so no
  new vault is written over one.
- **The flows** (`src/flows/`): setup's face check, after the seed is locked (a buy at each service
  the issuer's welcome gift names; the note asked for until the check passes, with the buys'
  references; the credits collected with the gift's tickets; the first vault), each stage kept in
  the locked store as it is got, so a setup that stops, even with the page closed, is taken up
  again after one face; the issuer gives the same tickets for the same buys, and a service the
  same credits for the same ticket. A new profile (the proof in the worker, the row through the
  registry payer with a credit, the hosts record, a host credit into the folder, a card with no
  name and an inbox open to people holding a row from the same issuer, the vault written again);
  restore; removing an access key. The profile's own offers and reviews, written with its main key
  (`records.ts`): an offer's price is in the index's devnet dollar, the classic test dollar, per
  hour, per day or in total (`job`); a buyer's profile asks rather than offers (`direction:
  "request"`). The inbox (`messages.ts`): every page on each of the profile's hosts, opened with
  its inbox key; threads by whom each message is with; a message sealed to the other card's inbox
  key and its readers, signed with the main key, and a copy, `{ text, to }`, to the profile's own
  inbox, which takes a message from itself whatever its rules; and requests: a message the profile
  sent itself, by its main key or a message key it lists now, of one of the standard's kinds with
  parameters that fit (as services' mcp/ checks them), and a record body that fits its shape.
  Approved, the app does it with the main key; a new offer or review with no id takes the
  request's, so approving twice writes one record.
- **The screens** (`src/screens/`, `src/ui.tsx`, `src/theme.css`): Manrope, carried in the app
  (SIL Open Font License 1.1, from `@fontsource-variable/manrope`); four colors and one accent. The
  person's own records come from their hosts, read by POST; scores, the reviews about a profile and
  the markets' role words from the index's JSON twins (`src/cards.ts`). The offer and review sheets
  (`Sheets.tsx`); the inbox, face first (`Inbox.tsx`): threads named by the other card's market and
  role word, read from the hosts the app knows and those its hosts record names; a thread's
  messages, those an access key sent marked, a reply field, a Review button, and requests as cards
  with Approve (the kinds the app does) and Decline. The message door, `/message?to=<address>`, the
  index's Message link (`Compose.tsx`, `App.tsx`): which profile sends, the text, one face; with no
  seed yet, setup comes first, with no profile, a new one, and then the message. What the device
  keeps besides the locked seed is in `src/local.ts`: the profiles with their addresses, the inbox
  counts (a profile's own copies not counted; what the inbox screen showed, read), the reviews
  seen, the requests answered, the appearance. Opened messages are kept only while the inbox
  screen is open.
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
                       # then the app's screens through setup (stopped at the vault and taken up
                       # again), a new profile, the card, an offer posted and changed, a second
                       # person through the message door, the inbox with a reply and a review from
                       # the thread, requests approved and declined, the menu, forgetting the
                       # device and restoring, against the stand-ins
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
- **A setup that stopped is taken up on the device it began on.** From another device, the 24
  words go on to the face check again ("I have my 24 words" does when it finds no vault): the note
  comes back with the same face, but not the welcome gift, whose buys are in the first device's
  locked store; buys made again are refused as `given`.
- **Taking up a check that still needs its note opens the check's tab after the face.** A browser
  that lets a page open a tab only right after a tap may block it; the app then says so.
- **Decline hides a request on this device only.** A host has no way to delete a message: it keeps
  each for its keep days (30 on the reference host). Another device shows a request again until
  then. Approving one again writes the same offer or review, but sends a message again.
- **Threads last as long as the hosts keep messages.** The app keeps no message on the device; each
  time the inbox opens, it pulls every page from the start.
- **What an AI sends to others with a message key is not in the threads.** Services' mcp/ sends no
  copy to the profile's own inbox; the other side's answer shows, the question does not.
- **A profile on a host the app does not know cannot be messaged from here.** Another card is read
  from the settings' host and the person's own hosts, and the hosts its hosts record names there.
- **No grant is kept yet.** A grant that reaches an inbox is not shown, and not added to the vault.
- **An offer's price is in one dollar.** The sheet writes the index's devnet dollar, per hour, per
  day or in total: the standard's `hour`, `day` and `job`.
- **Reading your profiles from one device links them** for whoever sees the requests: the board
  reads each profile's folder from its hosts and its twin from the index, and the inbox pulls each
  profile's messages, from one network address.
- **The seed is as safe as the code the server sends.** A web app's code arrives from its server on
  each visit; installed, it runs from the copy its service worker keeps until the next update.
- **JavaScript cannot erase memory.** The app zeroes the seed after each action and keeps no other
  reference; it cannot promise the bytes are gone.
