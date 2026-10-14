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
   Start always goes on to make a passkey and never asks for one, so it cannot go round in a
   loop; Forget this device is in the board's menu alone.
2. **Open with your face.** One tap makes the passkey, and its PRF secret is the seed (Custody,
   below). The device keeps the seed's fingerprint and nothing else of it. Where the passkey made
   gives no PRF secret, as it is made or at the get that follows, the app asks the person's
   passkey manager to drop it, keeps nothing, and Start says "This password manager can't open
   Forest. Save it in Passwords instead." on an Apple device, "in another password manager"
   elsewhere. Where the manager holds a Forest passkey this device knows (One passkey per person,
   below), it makes none: Start says "You already have a Forest passkey. Sign in with it." and
   Sign in is under way at once, its sheet open, which goes on with that passkey as Sign in does
   (12, below). The back arrow goes to Start.
3. **One face check.** The issuer's check opens in a tab of its own, and the app says to finish it
   there; Didit sends it back to `/back`, which closes (where the issuer lists the app's address,
   Limits). The tab is never left blank: whatever fails before the check is in it closes it, and
   the screen says what failed, with Try again. The back arrow goes to Start and keeps the
   passkey: Start is refused it then, and Sign in takes the setup up. Meanwhile the app buys credits
   at each service the issuer's welcome gift names, asks for the note until the check passes,
   collects the gift's credits with the tickets the note came with, and writes the first vault on
   the host: the note, the credits, the services used. Each stage is kept on the device as it is
   got, sealed (AES-GCM) under a key mixed from the seed, until the vault is written, so a setup
   that stops, even with the page closed, is taken up again after one face. The seed the passkey
   gave at the first step, or at Start taking a setup up, is held for this step, so the check's tab
   opens on the tap; the check opened again asks for the face first, and holds the seed from then. A
   face the issuer has from another setup ends this one: the passkey it made, which can never get a
   note, is offered to the person's passkey manager to drop, and Start says "This face already has a
   setup. Sign in with that passkey." A note number whose gift was given before (a setup done again,
   its first buys lost) gets no credits: setup says "Your welcome credits were already given once;
   write to us to get more." It finishes if the vault's own folder can pay for the vault, which
   costs a write like any record; if the folder holds nothing, setup waits, nothing lost, and Try
   again tries again (`src/flows/setup.ts`, `src/screens/Setup.tsx`).
4. **The board.** The person's profiles: sellers first, with their offers and scores; buyers after,
   compact. A badge counts the messages someone else sent to each inbox, and the requests its AI
   sent, counted at every face by pulls signed with the same seed (`src/face.ts`, `src/inbox.ts`),
   and the reviews about it not seen yet. A copy of what the profile sent, through the app or
   through an access key, never counts, nor does a grant. What a card fails to read shows in red. A card held down, or Hide in the menu on its page, takes it off the board
   on this device; the menu's Hidden profiles shows it again. Nothing is deleted.
5. **A new profile.** A market from the index's list, a side in that market's words, then Make,
   with one face: the person proof made in a Web Worker on the device (`src/proof/`); the row
   through the registry payer, paid with a credit; the folder on the host (its hosts record, one
   host credit into its balance, a card with no name, which the deployed devnet index accepts, and
   an inbox open to people holding a row from the same issuer); the vault written again
   (`src/flows/profile.ts`).
6. **The card.** The profile's address under its role word, short, with a copy button; its
   offers, the reviews it wrote and its access keys, read from its hosts; its score and the reviews
   about it from the index (the bell). A buyer's profile asks for things, so its offers are
   Requests: the section, "+ Request" and the sheet say so; the seller's side says Offers. An offer
   is a description, its first line the title, a price in the index's devnet dollar, per hour, per
   day or in total, and under them the fields its market's file suggests, read from the index, all
   optional: text (its known values offered), whole numbers, yes or no, and lists as chips, a
   language's as BCP 47 tags (`pt-br` written `pt-BR`, a language's name refused). A review is an
   address, one score, required, on a slider from 1 to 10 in half points, its value large above
   it and none until it moves, and text, optional, at most 500 characters, counted under it. Its
   address must be a profile the index has registered on the other side of this one's market (the
   same market when it is one-sided): checked against the index's profile JSON as soon as it is an
   address and again before the face, and "This address doesn't belong to a Tutoring teacher." (the
   market and the other side's word) in red when it is not. Each is posted, changed or removed from
   its sheet, signed with the main key, one face each (`src/flows/records.ts`,
   `src/screens/Sheets.tsx`). On every screen, what went wrong shows in red, and where something is
   not open, one line under it says why: red when what was given is wrong, quiet when something is
   still to give (`Line`, `src/ui.tsx`).
7. **An access key for the AI.** "+ Access key" offers two kinds, one or both: a Writing key (a
   write key, writing under `offer` and `review`: it posts and edits offers and reviews) and an
   Inbox key (a message key and a read key made together: it reads the inbox, sends messages and
   asks the person for things; the read key is also added to the card's inbox readers, so every
   message to the profile is sealed to it too). Make, with one face, makes each key at random and
   writes the permissions record's public part: each key and its scope, a write key's paths, no
   names and no dates, an inbox key's read key right after its message key. Once every host took
   those records, the paste follows, shown once; when one did not, the keys are taken out again
   and the error shows:

   ```
   Forest profile: <address> (Tutoring, teacher)
   writingKey: <key>
   inboxKey: <message key>.<read key>
   ```

   with a line for each kind made, Copy, and Done, which drops it: the app keeps no private half
   anywhere. The card shows a row for each, by its kind, with Remove: a write key is a Writing
   key, and a message key with the read key right after it is an Inbox key. Remove makes a write
   or message key past, so what it wrote still counts, and deletes a read key and drops it from the
   readers; an Inbox key's two go in one write (`src/flows/access.ts`). The menu holds the MCP
   door's address, https://mcp.forest.foundation; a device or a vault that kept one before it,
   https://mcp.devnet.forest.foundation/mcp or https://mcp.forest.foundation/mcp, reads today's.
8. **The AI acts.** Through services' MCP door, with the keys in the paste: offers and reviews with
   the writing key, messages sent and the inbox pulled with the inbox key's message key, opened
   with its read key. For anything else it sends a request to the profile's own inbox.
9. **The inbox.** One face opens every message on each of the profile's hosts with its inbox key,
   in threads by whom each is with, named by the other card's market and role word. A thread takes
   a reply, sealed to the other card's inbox key and its readers and copied to this inbox, and a
   review. A request is a card: what it asks, then every field of what Approve would sign (the
   index's dollar as "devnet dollar", times in the person's own clock); Approve signs exactly that
   with the main key, one face. The app does offers, reviews and messages; a
   payment, private records or the inbox it shows, says it cannot do yet, and the person can only
   decline. The copy the MCP door leaves of a text the AI sent shows in the thread with whom it
   went to, marked with its access key. A grant, an
   access key someone hands this profile, is kept in the vault's grants, and shown nowhere yet
   (`src/flows/messages.ts`, `src/screens/Inbox.tsx`).
10. **The message door.** `/message?to=<address>`, the index's Message link: which profile sends,
    the text, one face. With no seed yet, setup comes first; with no profile, a new one; then the
    message (`src/screens/Compose.tsx`).
11. **The menu.** The AI's door; Your face check: one face, then the note's facts from the vault
    (issuer, date, tier, model, and "face numbers: 128", how many numbers the embedding holds) and
    Copy, the numbers as JSON, under "These stay in your vault; copy them only to test." (the
    numbers live only while the menu is open); the hidden profiles; the appearance; and forgetting
    the device: what it keeps is cleared, the fingerprint with it, all but the ids of the passkeys
    made here, and the passkey stays in the person's password manager.
12. **Sign in.** One face: the passkey's seed reads the vault from the host, the board is kept on
    the device, and so is the fingerprint. When every host answered and none holds a vault for this
    passkey, its setup stopped before the vault was written, on this device or another: the app goes
    on to the face check with it, which gives the same note back to the same face
    (`src/flows/signin.ts`, `src/seed/seed.ts`). With a setup under way here, the same passkey
    takes it up where it stopped; another replaces it (One passkey per person, below).

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
- **One passkey per person.** The device keeps the id of every passkey it made (public), and Open
  with your face names them all, and the passkey of a setup under way here, as passkeys not to
  make again (`excludeCredentials`): a manager that holds one of them makes none, and Sign in
  follows at once. Start never asks for a passkey by its id; the face check opened again does,
  its own (`allowCredentials`). A setup this device made and then gave up (a new passkey made in
  its place, the manager holding the old one no longer, or a sign in with another passkey) has
  its passkey offered to the manager to drop, and so does one the issuer refused as a face with a
  setup already, and one that gave no PRF secret: `signalUnknownCredential` where the browser has
  it, nothing where it does not. Never one whose check gave a note: the issuer gives that face no
  other note, so only that passkey can finish its setup (`src/seed/seed.ts`).
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
  requests answered, the appearance, the settings, the ids of the passkeys made here, and, while
  setup is under way, its passkey's id, whether its check gave a note, and its stages, sealed
  under a key mixed from the seed. Opened messages live only while the inbox screen is open.
- **The screens** (`src/screens/`, `src/ui.tsx`, `src/theme.css`): Manrope, carried in the app
  (SIL Open Font License 1.1); four colors and one accent, and red for what went wrong. The mark, three roofs and a trunk, is
  one drawing never redrawn, held by one component (`src/mark.tsx`) that the board's header, Start
  and `/back` all draw, in the theme's ink. The favicon (ink on paper, 8 units around it) and the
  PWA icons are made from that component at each build (`shell.ts`); no copy is kept by hand.
- **Versions** (`vite.config.ts`, `src/version.ts`, `vercel.json`): the service worker asks the
  network first for `index.html`, the manifest and the icons, so each open takes the newest version
  deployed, and keeps a copy only for when the network does not answer. The files under `assets/`,
  named by a hash of their content, it serves from its cache first. A new service worker, found when
  the app opens, takes over at once; the page open keeps its own version, and the next navigation
  is the new one's. A file of the old version, gone from the server, is a 404 there, never
  `index.html`: the page reloads once to take the new version, back on the screen it was on. The
  person never clears anything.
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
| 3. Nothing leaves the device but access keys and signatures | Followed. No seed, main key, inbox key or issuer secret is sent anywhere. What goes out is signed records, messages and pulls; a row's transaction, signed, with its proof; the note number an issuer signs; blinded buys and credits spent; the access keys' private halves, only in the paste the person copies; and the note's face numbers, only if the person copies them from the menu |
| 4. Each app, server or AI gets its own access key for each folder | Followed. Each Make makes new keys at random, for the profile it is made from; none is ever reused or kept |
| 5. Proofs are made in the app, never delegated | Followed. The person proof is made in a Web Worker on the device |
| 6. The app works with any host, and its host with any app | Half. In the code, every service is a setting, kept in the vault. The hosted copy's CSP lets the page reach devnet's services alone, so another host takes a copy of the app with its own `vercel.json`; and no screen changes the settings yet |
| 7. A server that acts for you holds access keys with write, message or read scope | Followed. The app makes exactly those three, as a writing key (write) and an inbox key (message and read, together), and the paste is how a server or an AI gets them |
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
                       # offer with its market's fields, a second person through the message door,
                       # the inbox with a reply and a review, refused first about a profile in
                       # another market, requests approved and declined, a writing key and an inbox
                       # key made, pasted and acting, a write topped up from the vault, a profile
                       # hidden and shown again, the menu and its face check, forgetting the device,
                       # Start refused into Sign in, and
                       # signing in again on a cleared one, another subdomain refused the passkeys,
                       # a stopped setup taken up through Sign in with its gift given before, a face
                       # with a setup already, no PRF, Start twice on one device ending with one
                       # passkey, and a deploy landing
                       # while setup is open, served as Vercel serves it (SHOTS=<dir> keeps a
                       # screenshot of each screen)
```

On Vercel, `vercel.json` runs `standard.sh` and the build, sends every path to the app but those
under `/assets/` and those with a dot, so a file that is not there is a 404, sets the CSP on every
response, and sends the old address, app.devnet.forest.foundation, on to
https://app.forest.foundation with a 308, path and query kept. That address must be a domain of
the Vercel project for the redirect to land.

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
  moved between managers, a real Didit check (the test runs it against a stand-in page), and a
  deploy on a real phone (the test swaps one build for another under Chromium's service worker).
  The test reaches a fresh device with the same passkey by clearing the app's storage in the same
  tab, since Chrome's DevTools cannot hand a passkey's PRF secret to another browser context.
- **Two Forest passkeys can still happen.** A device refuses a second passkey where the manager
  holds one it knows, but another device does not know those ids, and a passkey whose drop the
  manager ignored stays. Each is named Forest, so a person with two picks between them in the
  system's sheet; the wrong one gets "This passkey belongs to another setup." on a device set up
  with the other.
- **Dropping a passkey is a request.** `signalUnknownCredential` is in Chrome from 132 and Safari
  from 26 (Chrome's developer docs, Corbado, August 2026, not tested here beyond Chromium's virtual
  authenticator); Google Password Manager hides the passkey rather than deleting it, and a browser
  or manager without it keeps the passkey, unused. The app never drops a passkey whose check gave
  a note, nor one it did not make.
- **The first open after this version still shows the one before, once.** A phone that has the
  earlier service worker gets the earlier copy from it at that open, and the new worker takes over
  meanwhile: the next open is the new version.
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
  removed. The card's rows say each key's kind, not who holds it: the permissions record's
  public part has no names. Each inbox key's read key adds about 2 KB to every message sealed to
  the profile.
- **The paste's names are not the MCP door's yet.** The door's tools take `writeKey`,
  `messageKey` and `readKey`; the paste gives `writingKey`, and `inboxKey` as the message key and
  the read key joined by a dot, with no instructions. Until the door takes those names, an AI that
  does not split the inbox key at its dot cannot use it.
- **An inbox key is two keys side by side.** The permissions record has no names, so the card
  takes a message key and the read key listed right after it as one inbox key, as this app writes
  them. A message key or a read key made before the two kinds shows alone, as a Message key or a
  Read key, unless the one was listed right after the other, which shows as one Inbox key.
- **The face check's date is the vault's.** The note the issuer signs carries no date, and the
  vault's entry for it can hold none (the standard refuses any other field there), so the date in
  the menu is the day the vault's folder was made: setup writes it once, right after the note comes,
  or, for a setup that stopped at the vault, when it is taken up. The face numbers are the
  embedding read as 32-bit floats, as the issuer's model gives them.
- **A review's other ratings are an older review's.** The sheet writes overall alone; one written
  before keeps the other ratings it gave when changed, and its text past 500 characters must be
  cut before it can be posted again.
- **A setup that stopped is taken up best on the device it began on,** where its buys and tickets
  are kept. From another device, Sign in goes on to the face check with the same passkey, and the
  gift is given before (above).
- **Sign in opened at once may wait for a tap.** When Start is refused a passkey the manager holds,
  Sign in starts with no tap of its own. A browser that lets a page ask for a passkey only right
  after a tap may refuse it, or the person may close the sheet: Start then shows "You already have
  a Forest passkey. Sign in with it." with Sign in under it, and asks nothing more.
- **The check sends the person back only to an app its issuer lists.** The issuer takes a return
  address on an origin in its `APP_ORIGINS` alone; on any other, the app opens the check with
  none, Didit's page stays open when it is done, and the app finishes on its own once the note
  comes.
- **A review goes only to a profile the index holds.** The other side is checked with the index's
  profile JSON, so a profile the index has not stored yet, or has stored under another label,
  cannot be reviewed from here, though the standard takes a review of any address.
- **Offer fields of the four plain kinds.** The sheet shows a market's text, whole number, yes or
  no and list-of-text fields; a field of any other kind is left as the offer holds it. A language
  tag is checked for its form, not against the registry of languages.
- **Taking up a check that still needs its note opens the check's tab after the face.** A browser
  that lets a page open a tab only right after a tap may block it; the app then says "Try again to
  open the check.", with the seed held from that face, so Try again opens it on the tap.
- **Decline hides a request on this device only.** A host keeps each message for its keep days (30
  on the reference host); another device shows a request again until then.
- **Threads last as long as the hosts keep messages.** The app keeps no message on the device; each
  time the inbox opens, it pulls every page from the start.
- **What an AI sends as a body, not text, is not in the threads.** Services' MCP door leaves a copy
  in the profile's own inbox of text alone; the other side's answer shows, the question does not.
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
