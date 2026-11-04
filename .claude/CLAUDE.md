This repo is `app`: the Forest app, the person's control panel for Forest, a web app at
https://app.forest.foundation. It stores nothing of the person's: their seed is their passkey's PRF
secret, asked for at an unlock, then held in the page's memory 5 minutes since the last action, or
until the page closes (a page only hidden keeps it); never stored on a device (each passkey added
after the first keeps a copy on the host, locked to that passkey). It is built on three
repos, each fetched by `./standard.sh` at the commit its file pins: the standard (`STANDARD`), the
markets (`MARKETS`) and services (`SERVICES`), all at github.com/foundationforest.

## Before any task

Read `README.md`, then the READMEs of the pinned repos at their pins: the front page
(foundationforest/.github, `profile/README.md`); standard's `README.md`, `keys/`, `folders/` and
`proofs/`; markets' `README.md` and `build/README.md`; services' `README.md`, `verifier/`, `host/`
(Credits) and `mcp/` (The connection). Then services' `mcp/test/app.ts`, the reference app, and
`e2e/e2e.ts`, the loop.

## Words

Use the standard's, the markets' and services' words: seed, profile, profile entry, entry, folder,
host, verifier, stamp, verification, access key, connector, credits, wallet, unlock, listing,
review, vouch, report, feedback. Never: account (but "no account"), record, signer, permission,
sealed, issuer, vault, registry, keeper, devnet. No em-dashes. A string baked into a recipe keeps
its bytes even when its words grow old (the passkey's salt, `forest-seed-v1`): rename the code
around it, never the string, and say why beside it.

- entry: anything in a folder, the standard's word.
- listing: an offer or a request, at `listing/<id>`; the role's `listings` (`offers` or
  `requests`) says which. Tennis players post requests. "listing" means only that: a host's list of
  entries is a list.
- review, vouch, report: the markets' kinds, each about one profile.
- feedback: what people say about a profile, its reviews, vouches and reports. A word, never a
  kind. On screen, Feedback is where they show together: the place, and a profile's.
- post: only the everyday verb, to post a listing, a review, a vouch or a report.

## How to work

- One session at a time. Plan mode first: read, post the plan, wait. Then one pull request; never
  push to `main`.
- A pull request's title says what changed, in plain words, readable on its own; each lands as one
  commit under its title.
- Follow the reference app: every entry, path and note the app writes matches `mcp/test/app.ts`, so
  another app with the same seed finds the same profiles, stamps and connections. The standard's
  libraries do the protocol, and services' credits client (`host/client/client.ts`) the credits, both
  used as they are; the app adds the screens, the flows between them and what the device keeps.
- Change nothing in another repo or on any service. When something there blocks you, stop and say
  what.
- Small modules, one job each. Service addresses live in `src/config.ts` only.
- Keep `README.md` true. It describes the whole first version; each pull request lists the README
  lines not yet true.
- Tests, all after `./standard.sh services`: `npm run check` (the types, tests included), `npm test`
  (Vitest: the flows, against services' own verifier and host, and the storage) and `npm run
  test:browser` (Chromium with a virtual PRF passkey, against services' own verifier, host, index
  and connector). CI runs all three; a skipped test fails. Real Didit checks cost money: only Carlos
  runs them, on his phone; every test uses the stand-ins.

## Design

The app's own look: paper #edeae0, paper-2 #c0cabf, ink-2 #313c34, ink #121a15, accent #1e5e43 (text
on it #edeae0), danger #b3261e; dark swaps them (paper #121a15, paper-2 #313c34, ink-2 #c0cabf, ink
#edeae0, danger #f28b82). A review's score sits on its chip, #efe3cc with text #6e4106; dark
#3b2c12 with #f0d49a. The dot for what is new is the accent, the ink in dark. Manrope, self-hosted;
bold is the only emphasis. Phone first, fine on a laptop. The mark is drawn once, in `src/mark.tsx`;
never redraw it. A verified profile shows its strongest check's shield, drawn once in `src/ui.tsx`:
an outline for a face check, filled for an ID check; an icon, whose words ("Verified by face",
"Verified with ID") show only when it is tapped. On screen, as few words as work: no line explaining
a title, one button per step. The unlock icon goes beside the word on labeled buttons, only when
tapping will ask the passkey; never on list rows; an icon-only button shows its own icon. When
something can't be done, one plain line says why: red when what was given is wrong, quiet when
something is still missing. Simple and elegant beats complete; when unsure, leave it out.
