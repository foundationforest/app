# app

The Forest app is your control panel for Forest: where you create your profiles, get verified, post, keep up with your reviews and messages, and connect your AI. It holds nothing of yours. Your profiles and everything they post live on hosts, open for anyone to read; the app reads them and writes for you.

It never holds your seed either, the secret all your profiles come from. Your passkey does, in your password manager. When you do something, the app asks the passkey for the seed, you allow it with your device's unlock (face, fingerprint or PIN), and the app uses it for that one action and lets it go.

The app is open source, so anyone can run one. The Forest Foundation runs this one, at https://app.forest.foundation. It's a web app for now; phone apps may come later, from the same code.

## How it works

Three places: your **Profiles**, your **Inbox** and **Settings**.

1. **Start.** One button. If your password manager has your Forest passkey, made here or synced from another device, you unlock and you're in. If it lives on a device that doesn't sync with this one, I already have one opens the passkey sheet, whose QR code lets that device answer. If you have none, Create a passkey makes one, kept by your password manager; its secret is your seed.

2. **Get verified.** The first time, a verifier checks that you're a real person it hasn't seen before, and signs a stamp to your seed. Two ways:
   - **Face, free.** A selfie.
   - **ID, $5.** Your ID and a selfie. Indexes can count it as stronger, it comes with ten times the credits, and it helps fund the foundation. Before it starts, the app shows what the check keeps and who keeps it, word for word as the verifier states it. You pay the verifier directly, through Stripe; the app never sees your card.

   Ours runs both with Didit, in their own tab. With the stamp comes a gift of credits, which pay the host for what you write. Both go into your Profiles folder, a private folder only your seed opens, so any device you start on finds them. If Didit has seen your face before, a person at the foundation reviews it, and the app keeps checking. Close the page midway, and Start picks up where you were. Then you make your first profile.

3. **Profiles.** Your home: one card per profile, those that offer first. Each shows its market and role (Clothing / seller), a shield when it's verified, a dot when something is new on it, and its offers or requests, its rating and how many reviews it has. New profile is one list of markets and roles to search: pick one and unlock, and the app makes it, proving it comes from a verified seed without saying which. A profile's Share shows its address, to copy and give to anyone who wants to message or review it. Nothing here needs you to unlock: your device remembers which profiles are yours, and everything they show is public.

4. **Posting.** Posting starts from a profile: New offer, or New request, as its role posts. The form is the market's own fields: photos, a price (and what it's per, when the market says, such as per hour), choices, an area, and a contact. An area is enough alone; Near me adds your device's location, rounded to 1, 5 or 25 km, so searches near a point find the post. A contact (a phone, a handle, an email) is public, and the same contact on two posts links them. Post and unlock. Tap a post to edit it; delete is there too.

5. **Reviews.** A profile's rating line opens its Reviews: the rating an index gives it, ours here, what that index counted about it, and what it wrote about others. Reviewing starts from Reviews, a thread or a review you received. A review gives a score from 1 to 10, in tenths, and may name which of their posts it's about; no score makes it a vouch ("I know they're real and honest"). A report ("this is fake or a scam") is its own action, in red. Each is about someone on the other side of the same market, and the app checks that before you unlock.

6. **Inbox.** Everything that came to your profiles, or to one of them, from its inbox icon. Reviews, vouches and reports about you show with nothing to unlock, a dot on the new ones. Messages need one unlock, and then every thread opens, each showing who it's from (their market, their role, and the shield when they're verified). Reply, or review them, from the thread; the pencil writes a new message to an address. A message is locked so only they can read it, and paid in tiny amounts from your profile's credits; a copy of what you sent stays in your profile's own folder, locked to you, so every device you start on shows it.

7. **Your AI.** Add Forest to your AI app (Claude, ChatGPT) as a connector. The first time it acts, it sends you here: you see which AI app is asking, tick the profiles it can act for, unlock, and you're back in your chat. Each profile hands it an access key, never your seed or a main key; your AI app's own settings choose which of its tools it uses. With nothing set up here yet, Start and the verification run first.

8. **Settings.** How you're verified, Face and ID, with the ID check if you only have the face; your AI apps, each with its profiles, Add profile and Disconnect (it stops at once, and what it wrote stays); the device's look, light or dark; Forget this device (your passkey stays in your manager).

## Behind the scenes

- **Your seed** is your passkey's PRF secret: a value the passkey gives only after you unlock, the same 32 bytes on every device it syncs to. The app uses it in memory for one action and drops it. Nothing secret made from it is stored; the device keeps addresses.
- **The passkey belongs to app.forest.foundation,** so no other site can ask it for your seed, not even another page under forest.foundation.
- **Credits.** The host charges by the byte, a tiny fraction of a cent per post or message, a little more for a photo. Each new profile gets a credit from your wallet, your Profiles folder's balance, and when one runs low the app tops it up. The host sees the wallet pay for each top-up but can't tell which profile it went to: it signed the credits blind.
- **Photos** are redrawn on your device before they're sent: a JPEG, no side longer than 1600 pixels, nothing but the pixels. So a photo's location, and the rest of what a camera writes into it, never leaves your device. A post names each photo by its fingerprint (SHA-256); the host keeps it while a post names it, and serves it to anyone.
- **Ratings** come from an index, which reads every host, counts verified profiles, and rates each one from the reviews it counts. The app asks it, from your device, what it says of each of your profiles. A review's score is the reviewer's; the rating is the index's.
- **What the device keeps:** your passkey's id, your profiles' labels and addresses, how you're verified, your AI apps' names and their profiles, where you left off in each inbox, the time of the newest review about each profile you've seen, and your theme; while a verification is under way, its check, the ID check's payment, and its gift. Never your seed, a key, a stamp or a message.
- **Proofs** run in the background on your device, from files the app serves (about 7 MB, downloaded once).
- **Pay addresses.** Each profile lists its own, for when payments come; the app doesn't show them yet.
- **Same seed, same Forest.** Everything the app writes follows the standard and the reference app in services (`mcp/test/app.ts`) exactly, so any app with your seed sees the same profiles, stamps and connections.

## Run your own

Run `./standard.sh`, which fetches the standard, the markets and the host's credits client at the commits in `STANDARD`, `MARKETS` and `SERVICES`; then `npm ci` and `npm run dev`. `npm run check && npm test` checks it; `npm run test:browser` runs the whole app in Chromium, with a virtual passkey, against services' own verifier, host and index running on your machine, the way services' loop does (`./standard.sh services` readies them). Node 22.18 or later.

To host a copy, serve the build from any static host with the security headers in `vercel.json`, and set the services it talks to in its one config file. A copy at another address makes its own passkeys, so its own seeds.

## How we run it

On Vercel, at app.forest.foundation. The page talks only to our host, verifier, connector and index, and shows photos from our host's bucket: a strict content security policy lets it reach nothing else. The page loads from the network first, so a new version never leaves you on an old one. No analytics and no logs of our own; Vercel keeps its own edge logs.

## Promises

- **It never holds your seed.** It uses it for one action and drops it, and stores nothing secret made from it.
- **It moves no money,** and keeps no key of yours past one action.
- **Nothing it writes lets a reader link two of your profiles.**
- **It writes only what the standard and the reference app write,** so any app with your seed finds what this one made.
- **When something can't be done, it says why, in one line.**

## Limits

- No notifications: messages and reviews show when the app is open.
- What your AI sends shows in your chat, not in the app.
- The host you write to can link your profiles: one device writes them all, one wallet funds them, one inbox lists them. It promises to keep no addresses in its logs; that's its promise, not the app's.
- To show your ratings, the app asks the index about each of your profiles from your device, so the index can link them, as the host already can.
- A web app's code comes from its server each time you open it, so you trust whoever serves it. It's open source, and you can run your own.
- Your seed can't leave this app yet: the passkey belongs to this address, and there's no export. Lose the passkey and the seed is gone.
- One host, ours, for everything you make, and only profiles on it can be messaged from here.
- Anyone can see when one of your profiles keeps a copy of what it sent, though not what it says or whom it's to; someone watching the other person's inbox could match the times.
- An area may carry your device's location, rounded to the kilometres you pick; without it, a search near a point won't find the post.
- Photos show as the host serves them; the app doesn't check them against their names yet.
- Not yet: payments between people, carrying your reputation from one profile to another, moving to another host.
- A face Didit has seen before waits for a person at the foundation.
- A proof takes a few seconds on a phone.

## FAQ

**Is it free?**
The app and the face check are; the ID check is $5. The host charges for what you write, a tiny fraction of a cent per post or message, and your verification comes with a gift that covers thousands of them. Buying more comes later.

**Why do I unlock to post, but not to look?**
Posting needs your seed, to sign as your profile, and your passkey gives it only after you unlock. Looking needs nothing: everything your profiles show is public, and your device remembers which ones are yours. Messages are the one thing locked to you, so opening them takes one unlock.

**Where does my rating come from?**
From an index, ours here: it reads the reviews your profiles received, weighs each by how much it trusts the reviewer, and gives each profile its rating. Each index rates its own way, so another may show another number.

**Who sees my face?**
Didit, the provider our verifier uses, and for the ID check, your document too. The verifier reads the result, turns your selfie into numbers that go into your stamp, keeps none of it, and deletes the check at Didit an hour later; Didit keeps a template of your face so the same face can't be stamped twice. The app never sees any of it, and your profiles show only how you're verified. The details: [services/verifier](https://github.com/foundationforest/services/blob/main/verifier/README.md).

**What can my AI do?**
Act for the profiles you ticked: read, post and message as them, with the tools your AI app lets it use. It never gets your seed, a main key or your addresses. Disconnect it any time in Settings.
