# app

The Forest app is the person's control panel. The index finds people and their offers; the app
acts for the person: it makes the seed and keeps it on the device, signs their records and
messages, and makes access keys; their AI does both, with the access keys the app makes for it.
A web app first; phones later, from the same code. Devnet only: nothing here is shipped. Free and
open source, Apache 2.0.

## How it works

In the order a person meets it.

1. **Start.** Start, or "I have my 24 words" to restore.
2. **The 24 words.** The app makes a seed, 32 random bytes, with the standard's keys library, and
   shows it as 24 words. "Save to password manager" hands them to the browser's own save prompt, as
   a sign-in (username Forest, the words as the password); the next screen fills them back from
   it. Then the seed is locked on the device: encrypted (AES-GCM) under a key mixed from a
   passkey's PRF secret, which the device gives only after the person's face or fingerprint, and
   kept in IndexedDB. Where a device's passkeys give no PRF secret, the app says so and stops:
   there is no password route (`src/seed/`).
3. **One face check.** The issuer's check opens in a tab of its own; Didit sends it back to
   `/back`, which closes. Meanwhile the app buys credits at each service the issuer's welcome gift
   names, asks for the note until the check passes, collects the gift's credits with the tickets
   the note came with, and writes the first vault on the host: the note, the credits, the services
   used. Each stage is kept in the locked store as it is got, so a setup that stops, even with the
   page closed, is taken up again after one face (`src/flows/setup.ts`).
4. **The board.** The person's profiles: sellers first, with their offers and scores; buyers after,
   compact. A badge counts the messages each inbox holds, counted at every face by pulls signed in
   the same opening of the seed (`src/face.ts`, `src/inbox.ts`), and the reviews about it not seen
   yet.
5. **A new profile.** A market from the index's list, a side in that market's words, then Make,
   with one face: the person proof made in a Web Worker on the device (`src/proof/`); the row
   through the registry payer, paid with a credit; the folder on the host (its hosts record, one
   host credit into its balance, a card with no name and an inbox open to people holding a row from
   the same issuer); the vault written again (`src/flows/profile.ts`).
6. **The card.** The profile's offers, the reviews it wrote and its access keys, read from its
   hosts; its score and the reviews about it from the index (the bell). An offer is a description,
   its first line the title, and a price in the index's devnet dollar, per hour, per day or in
   total; a review is an address, a score from 1 to 10 and text. Each is posted, changed or removed
   from its sheet, signed with the main key, one face each (`src/flows/records.ts`).
7. **An access key for the AI.** "+ Access key" offers three: Post offers and reviews (a write
   key, writing under `offer` and `review`), Send messages (a message key), Read the inbox (a read
   key, also added to the card's inbox readers, so every message to the profile is sealed to it
   too). Make, with one face, makes each at random and writes the permissions record's public part:
   each key and its scope, a write key's paths, no names and no dates. The paste follows, shown
   once:

   ```
   Forest, act for my profile (Tutoring, teacher).
   profile: <address>
   writeKey: <key>
   messageKey: <key>
   readKey: <key>
   Anything else, send me a request and I'll approve it in the app.
   ```

   with a line for each key made, Copy, and Done, which drops it: the app keeps no private half
   anywhere. The menu holds the address of the MCP door to add to the AI once. The card's rows come
   from the permissions record; Remove makes a write or message key past, so what it wrote still
   counts, or deletes a read key and drops it from the readers (`src/flows/access.ts`).
8. **The AI acts.** Through services' MCP door, with the keys in the paste: offers and reviews with
   the write key, messages sent and the inbox pulled with the message key, opened with the read
   key. For anything else it sends a request to the profile's own inbox.
9. **The inbox.** One face opens every message on each of the profile's hosts with its inbox key,
   in threads by whom each is with, named by the other card's market and role word. A thread takes
   a reply, sealed to the other card's inbox key and its readers and copied to this inbox, and a
   review. A request is a card: what it asks, then every field of what Approve would sign; Approve
   signs exactly that with the main key, one face. The app does offers, reviews and messages; a
   payment, private records or the inbox it shows, and the person can only decline. A grant, an
   access key someone hands this profile, is kept in the vault's grants, and shown nowhere yet
   (`src/flows/messages.ts`, `src/screens/Inbox.tsx`).
10. **The message door.** `/message?to=<address>`, the index's Message link: which profile sends,
    the text, one face. With no seed yet, setup comes first; with no profile, a new one; then the
    message (`src/screens/Compose.tsx`).
11. **The menu.** The AI's door, the appearance, the 24 words after a face, and forgetting the
    device.
12. **Restore.** The 24 words read the vault from the host and bring the profiles back, and the
    seed is locked under a new passkey. With no vault for those words, the face check is still to
    do, and the app goes on to it (`src/flows/restore.ts`).

Underneath:

- **The standard, pinned.** `STANDARD` holds one commit of
  [foundationforest/standard](https://github.com/foundationforest/standard). `./standard.sh`
  fetches it into `standard/` (not committed), runs `npm ci` in the packages named, and copies the
  registry circuit's devnet proving files into `public/circuits/`, each checked against its
  SHA-256 and named by it. The app imports keys, records (and records/private), the registry
  client and the reputation client from there by relative path, unchanged.
- **The services** (`src/services/`): one thin module each, ported from services' e2e: the issuer,
  a host, the registry payer, an index (its JSON twins), the RPC, and `credits.ts`, the buyer's side
  of credits. Every address is a setting, devnet's by default (`src/settings.ts`).
- **The vault** (`src/vault.ts`): the standard's vault, on the person's host, read and written with
  keys mixed from the seed for the action. It holds the labels of their profiles, their grants,
  their issuer's note, and this app's own field, `settings.forestApp`: the services used, and the
  credits not yet spent. Every host asked must answer: one that does not is an error, never "no
  vault", so no new vault is written over one. A profile's own folder is read the same way before
  anything is written over it.
- **On the device** (`src/local.ts`), besides the locked seed: the profiles and their addresses,
  the inbox counts, the reviews seen, the requests answered, the appearance. Opened messages live
  only while the inbox screen is open.
- **The screens** (`src/screens/`, `src/ui.tsx`, `src/theme.css`): Manrope, carried in the app
  (SIL Open Font License 1.1); four colors and one accent.
- **The CSP** (`vercel.json`): every response carries a `Content-Security-Policy` header. Scripts,
  styles, images, fonts, workers and the manifest come from the app's own origin alone, with no
  inline script; WebAssembly may compile (`'wasm-unsafe-eval'`), for the proof; the page connects to
  itself and the five devnet services in the settings (issuer, host, registry payer, index, RPC),
  nothing else; no page may frame it. snarkjs would start a worker per core from a `blob:` URL,
  which the CSP refuses, so the proof's worker runs it on its own thread.

## The rules for apps that hold keys

The standard's [keys README](https://github.com/foundationforest/standard/blob/main/keys/README.md#rules-for-apps-that-hold-keys)
sets eleven rules for apps that hold keys. Where the app stands on each:

| Rule | Status |
|---|---|
| 1. The seed stays on the device, locked by its secure hardware; keys mixed from it are held only for the action that needs them | Followed. The seed is locked under a passkey's PRF secret; `withSeed` opens it for one action and zeroes it after; nothing mixed from it is stored |
| 2. Every signature asks for the face or fingerprint and shows what is signed | Half. Every action that opens the seed asks for the face or fingerprint, once. Shown as signed: an offer, a review and a message, as their sheet shows them, and a request, field by field. Signed without each field shown: setup's records, the vault, the card, the permissions record and the card when an access key is made or removed, and the pulls |
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is signed records, messages and pulls; a row's transaction, signed, with its proof; the note number an issuer signs; blinded buys and credits spent; and the access keys' private halves, only in the paste the person copies |
| 4. Each app, server or AI gets its own access key for each folder | Followed. Each Make makes new keys at random, for the profile it is made from; none is ever reused or kept |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device |
| 6. The app works with any host, and its host with any app | Half. In the code, every service is a setting, kept in the vault. The hosted copy's CSP lets the page reach devnet's services alone, so another host takes a copy of the app with its own `vercel.json`; and no screen changes the settings yet |
| 7. A server that acts for you holds access keys with write, message or read scope | Followed. The app makes exactly those three, and the paste is how a server or an AI gets them |
| 8. The app that holds the seed is open source | Followed: this repo, Apache 2.0 |
| 9. Keep a copy of every record signed | Not yet for records. Each message sent is copied to the sending profile's own inbox |
| 10. Keep each grant in the vault | Kept, not used. A grant that reaches a profile's inbox is added to the vault's grants when the inbox opens; the app does nothing else with it yet |
| 11. Keep the issuer's note as safely as a key, in the vault | Followed. The seed is locked before the face check; the note waits in the locked store, encrypted under a key mixed from the seed, until the vault holds it |

## Run it

Node 22.18 or later.

```
npm ci
./standard.sh keys records registry/client reputation/client
npm run dev            # on localhost, without the CSP
npm run check          # type-check
npm test               # Vitest, on loopback: records' reference host and stand-ins for the rest
npm run build          # dist/, a static PWA
npm run test:browser   # headless Chromium through Playwright, with a virtual passkey: the modules,
                       # then the app's build under vercel.json's CSP (its connect-src naming the
                       # stand-ins), through setup (stopped at the vault and taken up again), a new
                       # profile, the card, an offer, a second person through the message door, the
                       # inbox with a reply and a review, requests approved and declined, access
                       # keys made, pasted and acting, the menu, forgetting the device and restoring
                       # (SHOTS=<dir> keeps a screenshot of each screen)
```

On Vercel, `vercel.json` runs `standard.sh` and the build, sends every path to the app, and sets the
CSP on every response.

## Limits

- **Devnet only.** Nothing is shipped.
- **A web app.** It installs as a PWA; phones come later, from the same code.
- **Tested in Chromium only.** The browser test runs headless Chromium with a virtual passkey
  authenticator; Safari and Firefox are not tested yet. Nor is the password manager's own save
  prompt, nor a real Didit check: the test checks the form the prompt saves, and runs the face check
  against a stand-in page.
- **Your network address is visible to your host and the index.** The board reads each profile's
  folder from its hosts and its twin from the index, and the inbox pulls each profile's messages,
  all from one network address: whoever runs them can link a person's profiles.
- **The gift comes once per note.** The issuer gives its welcome gift once for each note number. A
  setup taken up on another device, or done again, gets the note back with the same face, but not
  the gift: buys made again are refused as `given`.
- **The credits are the gift's.** No screen shows how many are left, and no money moves in v1, so
  none can be bought. Each profile's folder gets one host credit when it is made; every record and
  every message it sends spends from that balance (0.01 a write and 0.001 a kilobyte by default on
  services' host: about a hundred writes), and when it runs out the host refuses them, with no way
  in the app yet to add one. A write key's records spend from it too.
- **The CSP pins the services.** The hosted copy connects only to devnet's issuer, host, registry
  payer, index and RPC. A profile whose hosts record names another host cannot be read or messaged
  from it.
- **The proof runs on one thread,** since the CSP refuses the workers snarkjs would start: about
  two seconds, against one, in the browser test on four cores; once per profile.
- **An access key's paste stays in the clipboard** after Copy; the app cannot clear it without
  clearing what the person may be about to paste. Keys made and never pasted still act until
  removed. The card's rows say what each key may do, not who holds it: the permissions record's
  public part has no names. Each read key adds about 2 KB to every message sealed to the profile.
- **A setup that stopped is taken up on the device it began on.** From another device, the 24
  words go on to the face check again.
- **Taking up a check that still needs its note opens the check's tab after the face.** A browser
  that lets a page open a tab only right after a tap may block it; the app then says so.
- **Decline hides a request on this device only.** A host keeps each message for its keep days (30
  on the reference host); another device shows a request again until then.
- **Threads last as long as the hosts keep messages.** The app keeps no message on the device; each
  time the inbox opens, it pulls every page from the start.
- **What an AI sends to others with a message key is not in the threads.** Services' MCP door sends
  no copy to the profile's own inbox; the other side's answer shows, the question does not.
- **A profile on a host the app does not know cannot be messaged from here.** Another card is read
  from the settings' host and the person's own hosts, and the hosts its hosts record names there.
- **An offer's price is in one dollar,** the index's devnet dollar.
- **The devnet index may not show these cards.** A card here has no name, as the standard allows
  since commit b30c0b6; services' index takes such cards from the commit it pins on main, but which
  copy the foundation's devnet index runs is not checked here.
- **The seed is as safe as the code the server sends.** A web app's code arrives from its server on
  each visit; installed, it runs from the copy its service worker keeps until the next update. The
  CSP keeps a page from running code from anywhere else.
- **JavaScript cannot erase memory.** The app zeroes the seed after each action and keeps no other
  reference; it cannot promise the bytes are gone, nor those of a paste once it is dropped.
