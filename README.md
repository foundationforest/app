# app

The Forest app is the person's control panel. The index finds people and their offers; the app
acts for the person: it opens with their passkey, whose secret is the seed, signs their records and
messages, and makes access keys; their AI does both, with the access keys the app makes for it.
A web app first; phones later, from the same code. Devnet only: nothing here is shipped. Free and
open source, Apache 2.0.

## How it works

In the order a person meets it.

1. **Start.** Start, or Sign in with a passkey the person has. Where the browser says it cannot
   ask a passkey for PRF at all, Start says to open Forest on a newer device, and shows neither.
2. **Open with your face.** One tap makes the passkey, and its PRF secret is the seed (Custody,
   below). The device keeps the seed's fingerprint and nothing else of it. Where the passkey made
   gives no PRF secret, the app asks the person's passkey manager to drop it, keeps nothing, and
   Start says to use a phone with a passkey (the QR code in the passkey sheet) or a newer device.
3. **One face check.** The issuer's check opens in a tab of its own, and the app says to finish it
   there; Didit sends it back to `/back`, which closes. Meanwhile the app buys credits at each
   service the issuer's welcome gift names, asks for the note until the check passes, collects the
   gift's credits with the tickets the note came with, and writes the first vault on the host: the
   note, the credits, the services used. Each stage is kept on the device as it is got, sealed
   (AES-GCM) under a key mixed from the seed, until the vault is written, so a setup that stops,
   even with the page closed, is taken up again after one face. The seed the passkey gave at the
   first step is held for this step, so the check's tab opens on the tap. A face the issuer has
   from another setup ends this one: the passkey it made, which can never get a note, is offered to
   the person's passkey manager to drop, and Start says "This face already has a setup. Sign in
   with that passkey." A note number whose gift was given before (a setup done again, its first
   buys lost) gets no credits: setup says "Your welcome credits were already given once; write to
   us to get more." It finishes if the vault's own folder can pay for the vault, which costs a
   write like any record; if the folder holds nothing, setup waits, nothing lost, and Start tries
   again (`src/flows/setup.ts`, `src/screens/Setup.tsx`).
4. **The board.** The person's profiles: sellers first, with their offers and scores; buyers after,
   compact. A badge counts the messages each inbox holds, grants left out, counted at every face by
   pulls signed with the same seed (`src/face.ts`, `src/inbox.ts`), and the reviews about it not
   seen yet. A card held down, or Hide in the menu on its page, takes it off the board
   on this device; the menu's Hidden profiles shows it again. Nothing is deleted.
5. **A new profile.** A market from the index's list, a side in that market's words, then Make,
   with one face: the person proof made in a Web Worker on the device (`src/proof/`); the row
   through the registry payer, paid with a credit; the folder on the host (its hosts record, one
   host credit into its balance, a card with no name, which the deployed devnet index accepts, and
   an inbox open to people holding a row from the same issuer); the vault written again
   (`src/flows/profile.ts`).
6. **The card.** The profile's address under its role word, short, with a copy button; its
   offers, the reviews it wrote and its access keys, read from its hosts; its score and the reviews about it from the index (the bell). An offer is a description,
   its first line the title, and a price in the index's devnet dollar, per hour, per day or in
   total; a review is an address, a score from 1 to 10 and text. Each is posted, changed or removed
   from its sheet, signed with the main key, one face each (`src/flows/records.ts`).
7. **An access key for the AI.** "+ Access key" offers three: Post offers and reviews (a write
   key, writing under `offer` and `review`), Send messages (a message key), Read the inbox (a read
   key, also added to the card's inbox readers, so every message to the profile is sealed to it
   too). Make, with one face, makes each at random and writes the permissions record's public part:
   each key and its scope, a write key's paths, no names and no dates. Once every host took those
   records, the paste follows, shown once; when one did not, the keys are taken out again and the
   error shows:

   ```
   MCP: https://mcp.devnet.forest.foundation/mcp (add it to your AI once)
   Forest, act for my profile (Tutoring, teacher).
   profile: <address>
   writeKey: <key>
   messageKey: <key>
   readKey: <key>
   Anything else, send me a request and I'll approve it in the app.
   ```

   with a line for each key made, Copy, and Done, which drops it: the app keeps no private half
   anywhere. The menu holds the MCP door's address too. The card's rows come
   from the permissions record; Remove makes a write or message key past, so what it wrote still
   counts, or deletes a read key and drops it from the readers (`src/flows/access.ts`).
8. **The AI acts.** Through services' MCP door, with the keys in the paste: offers and reviews with
   the write key, messages sent and the inbox pulled with the message key, opened with the read
   key. For anything else it sends a request to the profile's own inbox.
9. **The inbox.** One face opens every message on each of the profile's hosts with its inbox key,
   in threads by whom each is with, named by the other card's market and role word. A thread takes
   a reply, sealed to the other card's inbox key and its readers and copied to this inbox, and a
   review. A request is a card: what it asks, then every field of what Approve would sign (the
   index's dollar as "devnet dollar", times in the person's own clock); Approve signs exactly that
   with the main key, one face. The app does offers, reviews and messages; a
   payment, private records or the inbox it shows, and the person can only decline. A grant, an
   access key someone hands this profile, is kept in the vault's grants, and shown nowhere yet
   (`src/flows/messages.ts`, `src/screens/Inbox.tsx`).
10. **The message door.** `/message?to=<address>`, the index's Message link: which profile sends,
    the text, one face. With no seed yet, setup comes first; with no profile, a new one; then the
    message (`src/screens/Compose.tsx`).
11. **The menu.** The AI's door, the hidden profiles, the appearance, and forgetting the device:
    what it keeps is cleared, the fingerprint with it, and the passkey stays in the person's
    password manager.
12. **Sign in.** One face: the passkey's seed reads the vault from the host, the board is kept on
    the device, and so is the fingerprint. When every host answered and none holds a vault for this
    passkey, its setup stopped before the vault was written, on this device or another: the app goes
    on to the face check with it, which gives the same note back to the same face
    (`src/flows/signin.ts`, `src/seed/seed.ts`).

## Custody

- **The passkey's secret is the seed.** The passkey is made for the relying party
  `app.forest.foundation`, the app's own address, now and at mainnet (devnet is only the
  services): no page on another subdomain can ask for it. User name Forest, a resident key, the
  face or fingerprint required, and a user id of its own at random, so a second Start never
  replaces a passkey the manager holds already. Its PRF extension, with the fixed salt
  `forest-seed-v1`, gives 32 bytes, the same each time for the same passkey, and those bytes are
  the seed as they are. Some passkey managers give them as the passkey is made; the others
  (Safari's) only when asked, so one more get follows at once (`src/seed/passkey.ts`).
- **Nothing secret is stored.** The device keeps the seed's fingerprint, the vault key's public
  half, and nothing else of it. Every action asks the passkey again: one system prompt, its PRF
  secret checked against the fingerprint ("This passkey belongs to another setup." when another
  answered), the action run, the seed zeroed (`withSeed`, `src/seed/seed.ts`). There are no words
  anywhere.
- **Where the passkey lives is where it syncs.** iCloud Keychain keeps it on every Apple device of
  the person's Apple Account; Google Password Manager on their Android devices and in Chrome
  wherever they are signed in; 1Password, Bitwarden and the like wherever those are installed. A
  security key keeps it on the key alone, and Windows Hello has kept passkeys on the one PC, so
  check whether yours syncs before relying on it. A device that does not hold the passkey can use a
  phone that does: the QR code in the passkey sheet.
- **It can move between managers.** The FIDO Alliance's Credential Exchange moves passkeys from
  one manager to another: Apple's Passwords app from iOS, iPadOS and macOS 26, 1Password and
  Bitwarden among others. Its format has a field for the PRF secret (`hmacCredentials`); this app
  has not checked which managers fill it in. A passkey moved without it signs in but gives another
  seed, or none: Sign in finds no vault for it and goes on to a face check, which the issuer
  refuses as a face with a setup already. Keep the old manager's copy until Sign in works from the
  new one.
- **Which platforms give PRF,** from Corbado's tables of August 2026, not tested here: iCloud
  Keychain on iOS and iPadOS 18 or later (18.4 or later as the phone behind a QR code, after bugs
  there) and macOS 15 or later, in Safari, Chrome and Firefox;
  Google Password Manager, on Android and in Chrome; Windows Hello on Windows 11 24H2 and 25H2 with
  the February 2026 update (KB5077181), in Chrome and Edge, and in Firefox 148 or later; Firefox on
  macOS from 139 and on Android from 149; 1Password; security keys with hmac-secret, in Chrome and
  Firefox, and in Safari from 26.4 with open bugs on some keys; and a phone over the QR code on
  macOS, Windows 11 and Android. Bitwarden gives it only some of the time. Not: Chrome's own
  profile authenticator, Windows before that update, iOS before 18.
- **No paper backup in v1.** The passkey is the only way in (Limits).

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
  credits not yet spent, from which a profile's folder, or the vault's own, is topped up when a
  host refuses its write for want of credits. Every host asked must answer: one that does not is an error, never "no
  vault", so no new vault is written over one. A profile's own folder is read the same way before
  anything is written over it.
- **On the device** (`src/local.ts`), none of it secret: the seed's fingerprint, the profiles and
  their addresses, the profiles hidden from the board, the inbox counts, the reviews seen, the
  requests answered, the appearance, the settings, and, while setup is under way, its stages,
  sealed under a key mixed from the seed. Opened messages live only while the inbox screen is open.
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
| 1. The seed stays on the device, locked by its secure hardware; keys mixed from it are held only for the action that needs them | Half. Nothing of the seed is stored: it is the passkey's PRF secret, which `withSeed` asks for at each action, after the face or fingerprint, and zeroes after; the device keeps its fingerprint alone, and nothing mixed from it is stored. Each profile's inbox key, mixed in the same action, is held after it until that face's count is back, to leave grants out of it. But the secret behind the seed is the passkey's, which the person's password manager keeps and syncs between their devices: it is locked by that manager, and by secure hardware where the manager uses it, not by one device's hardware |
| 2. Every signature asks for the face or fingerprint and shows what is signed | Half. Every action that asks for the seed asks for the face or fingerprint, once. Shown as signed: an offer, a review and a message, as their sheet shows them, and a request, field by field. Signed without each field shown: setup's records, the vault, the card, the permissions record and the card when an access key is made or removed, and the pulls |
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is signed records, messages and pulls; a row's transaction, signed, with its proof; the note number an issuer signs; blinded buys and credits spent; and the access keys' private halves, only in the paste the person copies |
| 4. Each app, server or AI gets its own access key for each folder | Followed. Each Make makes new keys at random, for the profile it is made from; none is ever reused or kept |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device |
| 6. The app works with any host, and its host with any app | Half. In the code, every service is a setting, kept in the vault. The hosted copy's CSP lets the page reach devnet's services alone, so another host takes a copy of the app with its own `vercel.json`; and no screen changes the settings yet |
| 7. A server that acts for you holds access keys with write, message or read scope | Followed. The app makes exactly those three, and the paste is how a server or an AI gets them |
| 8. The app that holds the seed is open source | Followed: this repo, Apache 2.0 |
| 9. Keep a copy of every record signed | Not yet for records. Each message sent is copied to the sending profile's own inbox |
| 10. Keep each grant in the vault | Kept, not used. A grant that reaches a profile's inbox is added to the vault's grants when the inbox opens; the app does nothing else with it yet |
| 11. Keep the issuer's note as safely as a key, in the vault | Followed. The passkey is made before the face check; the note waits on the device, sealed under a key mixed from the seed, until the vault holds it |

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
                       # stand-ins), at app.forest.foundation mapped to loopback, through setup
                       # (stopped at the vault and taken up again), a new profile, the card, an
                       # offer, a second person through the message door, the inbox with a reply
                       # and a review, requests approved and declined, access keys made, pasted and
                       # acting, a write topped up from the vault, a profile hidden and shown again,
                       # the menu, forgetting the device and signing in again on a cleared one,
                       # another subdomain refused the passkeys, a stopped setup taken up through
                       # Sign in with its gift given before, a face with a setup already, and no PRF
                       # (SHOTS=<dir> keeps a screenshot of each screen)
```

On Vercel, `vercel.json` runs `standard.sh` and the build, sends every path to the app, and sets the
CSP on every response.

## Limits

- **Devnet only.** Nothing is shipped.
- **A web app.** It installs as a PWA; phones come later, from the same code.
- **No paper backup in v1.** The passkey is the only way in. Lose it (the manager's account lost,
  the passkey deleted, which no manager warns about, or moved without its PRF secret) and nothing
  brings back the profiles, the vault or its credits; nor can the same face set up again, since the
  issuer gives one face one note.
- **Any page at app.forest.foundation can ask for the seed.** The passkey's relying party is
  `app.forest.foundation` and its salt is public, so a page served there, or on a subdomain under
  it, gets the same seed after the person's face or fingerprint. The seed is as safe as every page
  served there: nothing but the app belongs under that name.
- **Tested in Chromium only.** The browser test runs headless Chromium with a virtual passkey
  authenticator, which gives the PRF secret as the passkey is made: Safari's way, the secret only
  at the get that follows, is checked with a stand-in for the browser's passkey API (Vitest), not
  in Safari. Not tested: Safari, Firefox, a real passkey manager, the QR code to a phone, a passkey
  moved between managers, and a real Didit check (the test runs it against a stand-in page). The
  test reaches a fresh device with the same passkey by clearing the app's storage in the same tab,
  since Chrome's DevTools cannot hand a passkey's PRF secret to another browser context.
- **Two Forest passkeys look alike.** Each is named Forest, so a person with two (a setup they gave
  up, say) picks between them in the system's sheet; the wrong one gets "This passkey belongs to
  another setup." on a device set up with the other.
- **Your network address is visible to your host and the index.** The board reads each profile's
  folder from its hosts and its twin from the index, and the inbox pulls each profile's messages,
  all from one network address: whoever runs them can link a person's profiles.
- **The gift comes once per note.** The issuer gives its welcome gift once for each note number. A
  setup taken up on another device, or done again, gets the note back with the same face, but not
  the gift: buys made again are refused as `given`, and the person has no credits. The vault's
  first write still costs one: setup waits until its folder holds some, which only someone holding
  host credits can add (the vault's folder is the fingerprint's address). Even then, with no
  registration or host credits in the vault, no profile can be made. "Write to us" is the only way
  on, and no screen takes credits in yet.
- **The credits are the gift's.** No screen shows how many are left, and no money moves in v1, so
  none can be bought. Each profile's folder gets one host credit when it is made; every record and
  every message it sends spends from that balance (0.01 a write and 0.001 a kilobyte by default on
  services' host: about a hundred writes). When the host refuses one of the app's writes for want
  of credits, the app moves one more of the vault's host credits into that folder and sends it
  again; with none left in the vault, it says "This profile has no writes left." A write key's
  records spend from the same balance, and the host refuses them once it is empty: only the app's
  own writes top it up. The vault's own folder, which every vault write spends from, gets one
  credit at setup and is topped up the same way; with none left: "Your vault has no writes left."
- **The CSP pins the services.** The hosted copy connects only to devnet's issuer, host, registry
  payer, index and RPC. A profile whose hosts record names another host cannot be read or messaged
  from it.
- **The proof runs on one thread,** since the CSP refuses the workers snarkjs would start: about
  two seconds, against one, in the browser test on four cores; once per profile.
- **An access key's paste stays in the clipboard** after Copy; the app cannot clear it without
  clearing what the person may be about to paste. Keys made and never pasted still act until
  removed. The card's rows say what each key may do, not who holds it: the permissions record's
  public part has no names. Each read key adds about 2 KB to every message sealed to the profile.
- **A setup that stopped is taken up best on the device it began on,** where its buys and tickets
  are kept. From another device, Sign in goes on to the face check with the same passkey, and the
  gift is given before (above).
- **Taking up a check that still needs its note opens the check's tab after the face.** A browser
  that lets a page open a tab only right after a tap may block it; the app then says so.
- **Decline hides a request on this device only.** A host keeps each message for its keep days (30
  on the reference host); another device shows a request again until then.
- **Threads last as long as the hosts keep messages.** The app keeps no message on the device; each
  time the inbox opens, it pulls every page from the start.
- **What an AI sends to others with a message key is not in the threads.** Services' MCP door sends
  no copy to the profile's own inbox; the other side's answer shows, the question does not.
- **A profile on a host the app does not know cannot be messaged from here.** Another card is read
  from the settings' host and the person's own hosts, and the hosts its hosts record names there; a
  message to one whose hosts record names none the app knows stops with "That host isn't reachable
  from this app yet." A card the app finds on none of the hosts it knows gets "No card for
  <address>."
- **An offer's price is in one dollar,** the index's devnet dollar.
- **A hidden profile is hidden on this device only.** Another device, or this one after a sign in,
  shows it on the board.
- **The seed is as safe as the code the server sends.** A web app's code arrives from its server on
  each visit; installed, it runs from the copy its service worker keeps until the next update. The
  CSP keeps a page from running code from anywhere else.
- **JavaScript cannot erase memory.** The app zeroes the seed after each action and keeps no other
  reference; it cannot promise the bytes are gone, nor those of a paste once it is dropped.
