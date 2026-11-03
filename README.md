# app

The Forest app is your control panel for Forest: where you create your profiles, get verified, post, keep up with your reviews and messages, and connect your AI. It holds nothing of yours. Your profiles and everything they post live on hosts, open for anyone to read; the app reads them and writes for you.

It never holds your seed either, the secret all your profiles come from. Your passkey does, in your password manager. When you do something, the app asks the passkey for the seed, you allow it with your device's unlock (face, fingerprint or PIN), and the app uses it for that one action and lets it go.

The app is open source, so anyone can run one. The Forest Foundation runs this one, at https://app.forest.foundation. It's a web app for now; phone apps may come later, from the same code.

## How it works

Three places: your **Profiles**, your **Inbox** and **Settings**.

1. **Start.** On a device that has used your Forest passkey, one button, Start: it asks for that passkey alone, you unlock, and you're in. On a device that hasn't, two: Create a passkey makes one, kept by your password manager, its secret your seed; I already have one opens the passkey sheet, which finds yours if it synced here, or, through its QR code, lets a device that doesn't sync with this one answer. A device that knows a passkey never offers to make another. If the sheet closes with no answer, the app says only that no passkey was chosen: a browser can't tell a closed sheet from no passkey.

2. **Get verified.** The first time, a verifier checks that you're a real person it hasn't seen before, and signs a stamp to your seed. Two ways:
   - **Face, free.** A selfie.
   - **ID, $5.** Your ID and a selfie. Indexes can count it as stronger, it comes with ten times the credits, and it helps fund the foundation. Before you pay, the app shows its price and its three tries, and, a tap away, what the check keeps and who keeps it, word for word as the verifier states it. You pay the verifier directly, through Stripe; the app never sees your card.

   Ours runs both with Didit, in their own tab. With the stamp comes a gift of credits, which pay the host for what you write. Both go into your Profiles folder, a private folder only your seed opens, so any device you start on finds them. If Didit has seen your face before, a person at the foundation reviews it, and the app keeps checking. Every step has a back, to the step before, and back loses nothing: pick the same check again and it goes on where it was; switch, and a payment you made waits for the ID check. Close the page midway, and Start picks up where you were. Then you make your first profile.

3. **Profiles.** Your home: one card per profile, those that offer first. Each shows its market and role (Clothing / seller), a shield when it's verified, a dot when something is new on it, and its offers or requests, its rating and how many reviews it has. New profile is two steps: the markets, to search, then a market's roles; one you have shows a check and opens its profile; pick another and unlock, and the app makes it, proving it comes from a verified seed without saying which. A profile's Share shows its address, to copy and give to anyone who wants to message or review it. A profile made on another device shows as one row at the top, New profiles from another device; one unlock reads them, and their cards show. Nothing else here needs you to unlock: your device remembers which profiles are yours, and everything they show is public.

4. **Posting.** Posting starts from a profile: New offer, or New request, as its role posts, at its bottom beside Review. The form is the market's own fields: photos, a price (and what it's per, when the market says, such as per hour), choices, an area, and a contact. An area is enough alone; Near me adds your device's location, rounded to 1, 5 or 25 km, so searches near a point find the post. A contact (a phone, a handle, an email) is public, and the same contact on two posts links them. Post and unlock. Tap a post to edit it; delete is there too.

5. **Reviews.** A profile's rating line opens its Reviews: the rating an index gives it, ours here, what that index counted about it, and what it wrote about others. Reviewing starts from a profile's Review, Reviews, a thread or a review you received, with who it's about shown as soon as you give their address. A review gives a score from 1 to 10, in tenths (the slider shows none until you touch it), and may name which of their posts it's about; no score makes it a vouch ("I know they're real and honest"). A report ("this is fake or a scam") is its own action, in red. Each is about someone on the other side of the same market, never one of your own profiles, and the app checks that before you unlock.

6. **Inbox.** Everything that came to your profiles, or to one of them, from its inbox icon. Reviews, vouches and reports about you show with nothing to unlock, a dot on the new ones. Messages need one unlock, and then every thread opens, each showing who it's from (their market, their role, and the shield when they're verified). Reply, or review them, from the thread. The pencil opens a new message, all of it there at once: To, an address, with who it is under it, one of your own profiles too; From, your profile on the other side, or New profile when you have none; the message, and Send. A message is locked so only they can read it, and paid in tiny amounts from your profile's credits; a copy of what you sent stays in your profile's own folder, locked to you, so every device you start on shows it.

7. **Your AI.** Connect an AI, from Settings, is three steps: in your AI app, add a connector, and if it asks how to sign in, pick Sign in now (Claude offers No sign-in first, and with it Claude never logs in, so it can read but never act); paste this address, https://mcp.forest.foundation, with Copy; it brings you back here to pick its profiles. Right after your first profile is made, one screen, Use Forest from your AI, offers it once. The first time your AI acts, it sends you here, to the connect page: the AI app's name, big, and under it the site it sends you back to, which is what says which app it really is; your profiles to tick, none ticked unless you have just one; Connect, one unlock, and you're back in your chat. Each profile ticked hands it an access key that can read, post, read the inbox and message; the AI never gets your seed or a main key, and the app never shows the key or keeps it. Your AI app's own settings choose which of its tools it uses. With nothing set up here yet, Start, the verification and your first profile run first, then the same page; there Start offers I already have one first, since the login often opens in a browser that has never seen this app.

8. **Settings.** How you're verified, Face and ID, with the ID check if you only have the face; your AI apps, each with the day it connected and how many profiles it acts for: open one to tick or untick its profiles, one unlock each, at least one staying ticked, or Disconnect it (it stops at once, and what it wrote stays); + Connect an AI; and Find AI apps when a profile lists an access key this device doesn't know, as after connecting from another browser; the device's look, light or dark; Forget this device (your passkey stays in your manager).

## Behind the scenes

- **Your seed** is your passkey's PRF secret: a value the passkey gives only after you unlock, the same 32 bytes on every device it syncs to. The app uses it in memory for one action and drops it. Nothing secret made from it is stored; the device keeps addresses.
- **The passkey belongs to app.forest.foundation,** so no other site can ask it for your seed, not even another page under forest.foundation.
- **Credits.** The host charges by the byte, a tiny fraction of a cent per post or message, a little more for a photo. Each new profile gets a credit from your wallet, your Profiles folder's balance, and when one runs low the app tops it up. The host sees the wallet pay for each top-up but can't tell which profile it went to: it signed the credits blind.
- **Your AI's connection** is a folder of its own on the host, named by a random key, so its name links to nothing. It holds the AI app's name and, for each profile you ticked, that profile's access key, all locked to the connector and the folder alone; the AI app's login carries a pointer to it, locked to the connector. Each profile ticked lists its key in its profile entry, with a note only your seed opens naming the folder, so any device with your seed finds your AI apps again. The folder's first write is paid from your wallet. Unticking a profile ends its key; Disconnect deletes the connection, then ends every key it held. All of it in the connector's own format, as the reference app writes it.
- **Photos** are redrawn on your device before they're sent: a JPEG, no side longer than 1600 pixels, nothing but the pixels. So a photo's location, and the rest of what a camera writes into it, never leaves your device. A post names each photo by its fingerprint (SHA-256); the host keeps it while a post names it, and serves it to anyone.
- **Ratings** come from an index, which reads every host, counts verified profiles, and rates each one from the reviews it counts. The app asks it, from your device, what it says of each of your profiles. A review's score is the reviewer's; the rating is the index's.
- **What the device keeps:** your passkey's id, your profiles' labels and addresses, your Profiles folder's address and the label entries it has read there, how you're verified, your AI apps (each one's name, the day it connected, its folder's address and its profiles), the addresses of the access keys it knows of, where you left off in each inbox, the time of the newest review about each profile you've seen, and your theme; while a verification is under way, its check, the ID check's payment, and its gift; and an ID check's payment no stamp has used yet. Never your seed, a key, a stamp or a message.
- **Proofs** run in the background on your device, from files the app serves (about 7 MB, downloaded once).
- **Pay addresses.** Each profile lists its own, for when payments come; the app doesn't show them yet.
- **Same seed, same Forest.** Everything the app writes follows the standard and the reference app in services (`mcp/test/app.ts`) exactly, so any app with your seed sees the same profiles, stamps and connections.

## Run your own

Run `./standard.sh`, which fetches the standard, the markets and the host's credits client at the commits in `STANDARD`, `MARKETS` and `SERVICES`; then `npm ci` and `npm run dev`. `npm run check && npm test` checks it; `npm run test:browser` runs the whole app in Chromium, with a virtual passkey, against services' own verifier, host, index and connector running on your machine, the way services' loop does (`./standard.sh services` readies them). Node 22.18 or later.

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

- The app connects only to our connector, mcp.forest.foundation, for now.
- No notifications: messages and reviews show when the app is open.
- What your AI sends shows in your chat, not in the app.
- The host you write to can link your profiles: one device writes them all, one wallet funds them, one inbox lists them. It promises to keep no addresses in its logs; that's its promise, not the app's.
- To show your ratings, the app asks the index about each of your profiles from your device, so the index can link them, as the host already can.
- What's new goes by the time each writer puts on what they write: a review dated in the past shows no dot.
- A web app's code comes from its server each time you open it, so you trust whoever serves it. It's open source, and you can run your own.
- Your seed can't leave this app yet: the passkey belongs to this address, and there's no export. Lose the passkey and the seed is gone.
- A device that knows a Forest passkey never offers to make another, even when that one was deleted from your manager; clearing this site's data in the browser does.
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
Act for the profiles you ticked: read, post and message as them, with the tools your AI app lets it use. It never gets your seed, a main key or your addresses. In Settings, untick a profile or Disconnect it any time: it stops at once, and what it wrote stays.
