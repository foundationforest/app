// The app in headless Chromium, through Playwright, with Chrome's virtual passkey authenticator,
// which has PRF, against services' own verifier (its stand-in Didit and stand-in face model), host
// and index on loopback (services.ts), and services' own mcp, its APP_URL this app's /connect, as
// services' tests run it (mcp/test/setup.ts: its host reached with plain fetch, on loopback), and
// OpenFreeMap's stand-in for the map's tiles (tiles.ts). The app is built with its config pointed at
// them, served as Vercel serves it (vercel.ts: vercel.json's headers, its files, its rewrites, else
// 404) under vercel.json's CSP, its connect-src and img-src naming these services, at
// app.forest.foundation mapped to loopback and taken as a secure origin, so its passkeys are made
// for that address.
//
//   ./standard.sh services && npm run test:browser
//
// No walk names a market: each finds what it deals in in the directory by its shape
// (test/directory.ts), live markets first. Lessons, as a tutor posts them, a price per one of
// several values, a long list and a place on an answer; things sold, with photos, a chain of lists
// and chips; and so on. Below, in the words of the markets they find today.
//
//  1. Start, on a device that knows no passkey: the strong green, the name Forest drawn (six letters,
//     no font), one cream Start, nothing asked first; nothing coming back (the browser's window closed),
//     Start found nothing, in Start's own place, where its button was, nothing floating, a back arrow
//     at its top left, I'm new on cream and I already use Forest outlined, neither with the unlock
//     icon, no First time here?; its back arrow, Start's button again, nothing asked; I already use
//     Forest finding nothing: No passkey found, in the same place, its line, Try again with its QR
//     code, Type my 24 words, and quietly Back, to Start's button again; I'm new made the passkey for
//     app.forest.foundation and opened Get verified, its title in Figtree at 800, a little tight, and
//     no font but Figtree fetched. Here and on every screen below with a filled button, its icon takes
//     its text color.
//  2. Get verified: its title, its line, two cards, Face first, each its badge's black square, its
//     name and line, its price at the right in ink, what it gives with a tick each, then its button,
//     strong green, the card's whole width (Face, "Quick start", Free, Free credits, Take a selfie;
//     Face + ID, "Have an official ID in hand", $5 over "one time", 10× the credits, Higher trust,
//     Supports Forest, and, the stand-in Stripe's key a test one, "Test mode: pay with the card 4242
//     4242 4242 4242." in one quiet line, Verify with your ID), never Selfie, no grey note, the two
//     prices one size and shape, no warning, no unlock icon, nothing under them, no Continue; back to
//     Start, which now asks for the passkey made alone and goes straight back to Get verified; the face
//     check's box: a white card filling the screen under a round × at its top left; Before, "Before your
//     face check", the verifier's own words for it word for word, one tick, the verifier's line,
//     unticked, Start working once ticked, no unlock icon with the seed held, Terms · Privacy, each the
//     site's page in a new tab; the × at Before: nothing opened; ticked and started: Didit's page framed
//     in the box, with what a camera check needs, nothing asked, no tab, the page never left; a message
//     from anywhere but its frame changes nothing; the × with Didit's page open: the check kept, and
//     tapped again, Checking once, the same session's page; didit:close_request closing the box; back to
//     Start and straight back. On a laptop, the Start panel beside it, with the name drawn, the screen
//     520px wide at most; the box over the right side alone.
//  3. The face check, Before again (the ID's box, opened last, dropped its session): Didit's page framed; didit:completed taking the frame
//     away at once, Checking, the loader in the middle; then the card shrunk to its badge and name,
//     Verified on the soft green, no button, the ID still to do, no back, nothing asked again through
//     the box, no tab; Continue at the foot, an underlined link while the ID is still to do; Add a
//     backup, its two cards (the key, Another passkey, Not where your first one is, Add a backup
//     passkey, strong green; the paper, 24 recovery words, Written down on paper, Show my words,
//     outlined) and Later; Show my words asking the passkey though the seed is held, Your 24 recovery
//     words, its one line, the words in three numbered columns, I wrote them down; then Your first
//     profiles, Add a backup never shown again on this device; the gift collected into the wallet; the
//     stamp kept in the Profiles folder; nothing of the seed kept, nothing waiting in the tab.
//  4. Your first profiles: no back, Continue at the foot, strong green, always; every market a tile,
//     in the directory's order, about 104px tall, corners 22px, its color filling it under a dark fade,
//     its icon 96px, white at 28%, at the top right, cut by the edge, its whole name white at the
//     bottom left, 19px at 800, two to a row, and a round + at its top left while none of its roles is
//     the person's; a search over the markets, by their roles' words too, and no summary on them; a
//     tile opens its market's roles in a sheet from the bottom over the tiles: its icon white on its
//     color, its name, Beta in one quiet line for a beta market, its summary in one quiet line, its
//     roles, each a row, its avatar (solid where it offers, light where it requests), its name and
//     Create, in the strong green, its plus while the seed is held; on a laptop, the sheet centred on
//     the setup's side, its round × at its top right; a tap on the dimmed screen closes it; Create, nothing asked, the seed
//     held since the last unlock, the loader in its row, the verification proven in the worker, the
//     sheet staying, its row a round ✓; the tile's ✓ and the role named under the market's name;
//     Continue, on to Connect your AI: Ask your AI to, small and grey, one green line at a time
//     rolling up; Add to ChatGPT and Add to Claude side by side, strong green, Add manually under
//     them, the whole width, and the small line; no Claude, ChatGPT and Other choice; Add to ChatGPT
//     opening the page the config names, in a new tab; Add to Claude, which it names none for, Add
//     manually's sheet: its four steps, Connectors, Plugins and Forest in bold, the address in its
//     grey pill, Copy copying it, Copied; back, to Home; its profile entry on the host, its
//     verification checking as any reader checks it; its market's avatar, solid, a tutor offering; no
//     badge on its card; on a laptop, the person's badges, once, the face check's, a face being scanned
//     on the black square, its words its label and title, Verified with Face, and the ID's outline,
//     dashed and muted, which opens Get verified: Face Verified, the ID to do, Back and no Continue; on
//     the profile's header, where its badge stands alone, a tap says "Verified with Face"; the header
//     on a tint of its market's color, its bottom corners rounded: the market big in the titles' face,
//     the role small, the badge right after it, its rating pill, No reviews yet, no caret; no tabs, no
//     pencil, No offers yet, quiet, and New offer with its plus at the foot; at its top right,
//     Messages, then the round ···, a small menu under it, Share profile and Delete profile in red, a
//     tap outside closing it; Share profile copies its page on the index where there is no share
//     sheet, the ··· saying Copied, and hands the sheet that page where there is; Home with the mark,
//     Search Forest opening the index in a new tab, the three tabs, the card its market in bold over
//     its role, No reviews at its right; New profile, with a back arrow and no Continue: a role made,
//     its round soft green ✓, which opens its profile, Create in the strong green; one search on Home,
//     New a small strong green pill with its + at the right of Profiles, Home's one action, and the
//     badges beside the title on a phone too, nothing floating.
//  5. You: You, with the person's badges beside it, the face check's black square and the ID's
//     outline, dashed; one card of settings rows, each its icon, its name, its detail and a caret: Your
//     checks (Face), Your AI (Not yet), Passkeys (Passkey), Email (Off), About Forest, then Appearance;
//     never Selfie; Your checks, a page of its own: one card, Face, no caret, no price, nothing for a
//     check not held; Forget this device in red with its icon, asking again in place, Forget this
//     device?, its line, Cancel and Forget, Cancel bringing the button back. Appearance: three icons
//     at its row's right, Auto, Light and Dark, each its name for screen readers, Auto pressed; Dark
//     applied at once, nothing floating, kept through a reload, then Light, then Auto. About Forest:
//     one card, Your data, Privacy and Terms, each with its caret, and Source code in a new tab; under
//     it the mark and the company lines the test's config sets, small and grey, the contact a mailto
//     link; no version line, no Contact row; Privacy, its address under its title and the site's page
//     framed below, filling the rest; Terms the same; Your data's four blocks, each its icon, title and
//     words. Your AI's Connect another opens Connect your AI, with a back and no Skip. On a laptop, no
//     tabs: the sidebar, its first line the mark, a link to Home, and the search filling the rest, no
//     name; its places, the one picked on the soft green; the profiles with their markets' icons;
//     Profiles with its small outlined New, which opens New profile, no New profile row and no AI
//     card; Appearance switching in place there too; a profile opened from it; Home's New profile at
//     its top right, strong green.
//  6. Two people: the first, whose phone allows its location, posts an offer from their profile:
//     each field a row in the market's own order and words, its question in grey while empty,
//     opening in place; its price, $30 for 1 of the market's own per (an hour), the whole job last;
//     its subjects from a long list, a search and ticks; its card its market's icon, its first line,
//     then $30 an hour at the right; tapped, its page, Back and Share, its card with a pencil, which
//     edits it, and No messages yet; no place until sessions are In person (a chip with its tick), then
//     the place right after, and nothing of the map asked for yet; opened, the map from
//     OpenFreeMap's stand-in with its attribution, the location asked for as it opens, the circle in
//     its middle at the market's size, round the phone, its caption from places under it; Chamberí
//     searched for by name, picked, and the slider to 10 km; the row says Within 10 km of Chamberí;
//     nothing of where kept on the device; the place gone again
//     with In person; a contact, which no market
//     lists; asking nothing, the seed still held, so Post shows no unlock icon; the second
//     opens its link with nothing set up, goes through Start, I'm new and the face check (the link
//     waiting in the page, which never left); the writing screen, no box for an address:
//     the link's profile as its card, by its short key once, its market alone, the message box, and
//     one quiet line under it, with its market's icon, You have no Tutoring student profile yet. and
//     Create, which makes it, then From your Tutoring student profile; Send, strong green, nothing
//     asked after the unlock back from the check; the
//     first, the seed held, sees the message open by itself: the conversation counted, 1, on the
//     card's avatar, the Messages tab and the profile's messages button, nothing on its rating; the
//     page closed and opened again, the seed dropped: the black dot in the count's place, on the card
//     and the tab, since what the page opened by itself nobody saw, and how many conversations is not
//     known; the Messages tab's tap asks the passkey itself, its prompt closed here: the lock, New
//     messages and Open with its unlock icon, no chips, the title alone at the top, no New message,
//     no pencil, no back, the tabs below with Messages picked; every inbox opens in one unlock, chips
//     for All, picked on the soft green, and Tutoring, its market alone, a dot in its market's color
//     and no avatar; each row two lines, on the ground, not in a card: their short key, bold, in the
//     key's face, never cut, no market, and the time of day, bold while new; then the last message on
//     one line, bold, with its black dot; their animal with their market's badge at its bottom right,
//     the tutor's own icon, white on its color; and nothing else: no check's badge, no role, no "to
//     your"; the thread with no tabs, its header one line: Back, their animal with the market's badge,
//     their key, no market and no badges, no "to your", and Review at the right, outlined in ink, its
//     star in the sun, nothing floating; the reply in one row, the pill and a round Send, strong
//     green, with its arrow; their message on the card with an edge, the reply on the soft
//     green in ink; the time under each run and Today above them; the tab's mark gone once looked at;
//     the second, their page closed and opened again, the dot on their card, opens Messages from their
//     profile's button, whose tap asks the passkey, picked to it, with Back to it, reads the
//     reply beside what they sent, and reviews the tutor from the thread: Close, Score, Vouch and
//     Report, Score picked, its line, the slider's thumb hidden until touched, naming no listing.
//  7. A second browser, with the same passkey, answered from the first, as a phone answers through
//     the passkey prompt's QR code, from another device: Start, then
//     Save a passkey on this device?, in Start's own place, Save with the unlock icon, and Not now; it finds the
//     profile and the stamp; it
//     makes a profile of its own, nothing asked again; the first, with nothing unlocked, shows one
//     yellow line under Profiles, Sync profiles, its round arrows at its right, no unlock icon, which,
//     the page closed and opened again, one unlock reads, the line gone and the profiles in the order
//     they were made.
//     Then a message from one of the person's profiles to another of theirs: the page opened anew,
//     the profile's messages button asks the passkey itself, no Open, the inbox's read slowed: the loader, hidden for its first
//     half second, then shown, alone, in the middle: at 1280px across both panes, on a phone in the
//     middle of the screen; then a link to their tutor, the page opened anew, From their student,
//     Send asking once; it arrives and opens by itself, new, with nothing more asked.
//  8. One passkey per person: after Forget, Start finds the passkey, straight to Home, and asks
//     nothing more; with the passkey prompt closed, Start found nothing, in Start's place, I already
//     use Forest, Home.
//     Then passkeys, every one a row, with two virtual authenticators, which send no maker id:
//     Passkeys, from You, says Passkey, Main outlined in ink (what the device knew of it went with Forget),
//     its key square and chevron, no Remove in the list, and the quiet line, no dot; tapped, it
//     opens in place under itself, nothing floating, its chevron up, a Name field with Save at its
//     right, on the same line, no Remove at all, and a second tap closes it; renamed My phone, nothing asked, kept
//     on the device, then its name taken back; the phone's own manager, which keeps the first
//     passkey the new one excludes, refuses, in one red line; a security key, a second virtual
//     authenticator, makes one: Passkey 2, no line, renamed Security key, every row the same key, no
//     maker's logo; opened in place, Save beside the name field, Remove under it in red text at the left, and
//     a Backup chip in neutral grey on its row, not Main's outline; Remove asks
//     again in its own place, Remove this passkey?, Cancel and Remove on solid red, Save making room,
//     nothing floating; Cancel, and both back; on a laptop the same in place, Main's Save alone; a
//     browser holding only that one, answered through the QR code, Not now, opens the same profiles;
//     Remove, asking again, then Remove, the line back, and that browser's next unlock, its page closed and
//     opened again, says "This passkey no longer opens your profiles."; after Forget, its Start
//     opens its own seed, with no stamp and no profile: This passkey has never been verified, then
//     Continue to verification, Get verified.
//     Then a browser signed in through the QR code saves a passkey: Save makes one there, added to
//     the first, the one in use there, so its next unlock asks it and not the phone; the first lists
//     it, Passkey 2, and removes it again, in place.
//     Then 24 words: Passkeys' Your 24 recovery words, a page of its own at /words, nothing floating,
//     its one line, Show my words asking the passkey though the seed is held, Back asking nothing;
//     the standard's words for the seed, on the same page, in three columns, each its number,
//     nothing keeping them, gone with I wrote them down and with a reload, which asks again; another
//     browser, which lists a Forest of its own (a passkey just made, Get verified, back), its passkey
//     prompt closed at Start, Start found nothing, closed again at I already use Forest, No passkey
//     found, types them on Type my 24 words: "23 of 24" and Continue off; a
//     word wrong, a red line; then "These words open a different Forest." with Forget this device
//     in place of Continue, and no passkey made; forgotten, Continue, with the unlock icon, makes
//     one, and it opens the same profiles; its next unlock shows the same words, the passkey made
//     there Passkey 2; the first lists one passkey more.
//  9. Things sold, with the index: the first, the page closed and opened again so Post shows its unlock
//     icon, a moment hidden keeping it so, posts a coat with two photos in one unlock, redrawn on the device as JPEGs no longer
//     than 1600 pixels, their notes gone, the whole deal its only price; clothing, what is sold, one
//     choice among chips, each a radio, no tick box; then the kind it opens, clothes, side by side;
//     and only then the questions the kind opens, after it: for women, one of several, its chip with
//     its tick; the size by its label (XXS), searched; two
//     conditions, each its tick; in person and shipped; its circle round the phone as the place
//     opens, a size out, an exact spot waiting to be moved since the location alone is never one,
//     then the circle again; posted with its centre moved
//     by up to a tenth of its radius, no name, nothing kept on the device; its card's price reading
//     $40; the index lists it. A buyer, whose phone hasn't allowed its location: told no before,
//     nothing is asked and the map opens on the whole world, with no circle and no button for the
//     location, and says to move it or search; Madrid searched for by name, then an exact spot near
//     it, posted exactly where the map went, never moved; never asked, the place asks as it opens,
//     and the prompt refused, one quiet line, the button gone; the
//     map's code never in the service worker's install; their page closed and opened again, their
//     profile's messages button, its passkey prompt closed, none new: the lock and Open alone, never
//     "No new messages"; no New message: a link to their own profile, From the other side, Create;
//     /message alone, Messages; then the coat's link, as an index's Message link opens it, ?to= and
//     &listing=: the listing at the top, its first photo, its price, who posted it, their animal and
//     short key; the box; From your Goods selling buyer profile with its market's icon; Send, strong
//     green; the message carries the listing beside its text, in its locked copy too, and the
//     conversation shows it pinned under its header, no About, the coat's photo, title and price,
//     opening it on the index. They review the seller from the thread, a score and words, no question
//     of the market's, since it asks none, naming no listing; then, from the seller's profile, opened
//     by the thread's header, a vouch, its neutral square, written again in the same place, and a
//     report, its red square, Report in red; their profile's rating pill, No reviews yet, opens its
//     Reviews, and You wrote 3 ›, underlined, lists all three, each About, the seller's animal and
//     short key, a pencil at its right, then its score or chip; the whole card opens it to edit. The
//     seller sees the rating with its star over 1 review on the card and on the profile's pill, 3 new
//     on the pill, no caret, 1 on its messages button, the card counting the three and the
//     conversation, 4, the Messages tab the conversation alone; the pill opens the profile's Reviews,
//     the profile's line and no You wrote, the score large and how many, never which index, the three
//     marked and first, each a card with who wrote it right after its score, by their key, and once
//     seen there they are new no more, nothing new on the pill, the card counting the conversation
//     alone; the review opened: the day, the score big with its star, no listing named, From a row
//     with who wrote it, their badge, market and role, no caret, Message and Review back side by side,
//     both outlined, Review back's star in the sun, Report under them in red; From opens their
//     profile: Not yours, their header, their short key on its chip with a pencil, no rating, one
//     request and three written, Message filled, Review outlined, which opens Review about them, and
//     See everything on the index in a new tab; Review back opens Review about them too. The page
//     closed and opened again, the conversation nobody saw is the dot on the card and the tab; the
//     tab's tap opens the messages, the row saying what it is about, the coat's title beside who, cut
//     with "…" when too long, no review among them.
//     Then someone else's profile from a conversation, and names: the seller's messages, open since
//     the tab's unlock; the thread with the buyer, its header, by their key, a tap opening their
//     profile; Message there opens the conversation again; naming them, opened in place under their
//     header by the chip, nothing floating: no full key and no Copy, an empty Name, Only you see it,
//     Save asking nothing with the seed held; Marta saved, the chip saying so, the key gone from
//     beside it; underneath, one locked entry at names in the Profiles folder, nothing readable,
//     nothing in the seller's own folder, a copy on the device; Marta in place of the key in the
//     thread's header, Review's, Messages and the reviews she wrote; another browser, the same
//     passkey answering, has Marta after its one unlock at Start; Show the key instead, from her
//     profile, opened by a review's From, takes it back, the key again, the entry deleted, nothing
//     kept; on a laptop, the same in place, a second tap on the chip closing it.
//     Then a listing its market no longer fits, written to the host as the app wrote it before the
//     market changed, days ago (one price, not a list; answers in shapes gone): the yellow ! on its
//     profile's card on Home and on its own card, first, Needs updating in yellow in its price's
//     place; its page's card opens its form, one yellow note at its top, "This market changed.
//     Answers to redo are in yellow.", every answer that still fits filled in, each row whose answer
//     didn't in yellow, "Changed: answer again." until it is answered; posted, it goes in place of
//     the old one, at its own path, fits, and the marks go. Then a review an older market shaped,
//     with an answer to a question it asks no more: the ! on its profile's card, its rating pill and
//     beside You wrote 1 ›, its card there Needs updating; opened, its kind kept, what still fits;
//     posted, the marks gone. Then a review that names its listing, written to the host as another
//     app or an AI writes one: on the page of the profile it is about, among the reviews it
//     received, under its words, About, the listing's title, its market's icon on its color,
//     opening it on the index in a new tab; none on You wrote, whose card is its edit; named again,
//     a listing the index holds none of: No longer listed, and no tap; named again, the tutor's
//     offer, a profile in neither: no About, the review as ever.
//     Then a review of one of the person's own profiles, from their student about their tutor, from
//     the conversation between them: refused under the name, in one red line, nothing asked, Post
//     doing nothing; Close. Someone else writes to the tutor from its link and vouches for them from
//     the conversation: the tutor's pill reads 1 new, its Reviews the vouch first, with its dot, by
//     their key; once shown it is seen, the pill saying nothing new. The tutor vouches back, from
//     that conversation: with no score yet, their pill reads 1 vouch, opening their Reviews.
//     Then the AI apps, with services' own mcp and an AI app as services' tests make one (the MCP
//     SDK's client, mcp/test/setup.ts):
//  a. its login comes to the connect page: the AI app's name, its redirect's host, the profiles
//     unticked, none with a badge; one ticked, Connect, one unlock; the AI app gets its token,
//     reads its profile and writes a listing, which shows on the profile; the device keeps the AI app,
//     never a key; a browser with the same seed, as one set up before the AI app connected: Your AI
//     empty, with no Find AI apps; its next unlock, the Messages tab's, finds the AI app by itself;
//     Then a whole visit asks exactly once: from a page just opened, post, edit, open messages (by
//     themselves), message, review from a thread with someone else, the note arriving and opening
//     by itself, an AI app's profile ticked and unticked with Save, and the listing deleted, the page hidden
//     between each;
//  b. You's Your AI: the AI app and "1 profile", nothing of since when; tapped, it opens in place
//     under its row, as a passkey does, no page of its own: its profiles as ticks, the last kept
//     ticked, Save disabled until something changes; ticking asks nothing and changes nothing;
//     Save, one unlock then none with the seed held, the AI's profiles following with no new
//     login; Disconnect, asking again in its own place, Disconnect An AI app?, Cancel and
//     Disconnect with its unlock icon while no seed is held, Save making room, then Disconnect,
//     nothing asked: the row gone from Your AI, the AI's next call refused, and its listing stays;
//  c. a new phone, nothing set up, at a connect page: Start finding nothing, I'm new; the face
//     check, Add a backup put off, a first profile in its sheet, then Continue back to the connect
//     page (the login waiting in the page, which never left), its one profile ticked, no Connect your
//     AI; Connect, nothing asked after the unlock at Start; then a profile made from New profile with
//     the AI app connected: the sheet turns into what was made, a round soft green ✓, "Tutor profile
//     created", the market under it, "Your AI can use it", the AI app's row ticked, Done giving it the
//     profile; then Delete profile from its ···: Delete this profile?, its three lines, Delete profile
//     in red and Cancel; Cancel, nothing done; Delete profile: Home without it, nothing live in its
//     folder at the host, the AI app acting for it no more; made again, the same address;
//  d. a connector that isn't ours: one line, nothing else; a request that ran out: one line.
// 10. A face seen before, in the box (the verifier answering known_face): the yellow round !,
//     "Someone with a similar face is already verified", its line, Use my other passkey, strong green,
//     then Verify with your ID, outlined; for someone verified in another browser who made a passkey
//     in this one by mistake: their passkey answers, as a phone does through the QR code, this
//     browser's is added to it as a backup, and they're in, on Your first profiles; opened again, the
//     first profile asks this browser's own passkey, which opens their Forest, and their Profiles
//     folder lists it; the other browser asked nothing more.
// 11. A manager that gives no PRF secret, in a browser that can ask for it: its passkey dropped, the
//     line naming another. A browser that cannot ask for PRF: Passkeys don't work here, nothing asked.
// 12. The passkey belongs to app.forest.foundation: another page under forest.foundation is refused.
// 13. The build: its manifest, its service worker in control, installable, and nothing of the map
//     precached: its code comes with the place screen alone.
// 14. A deploy while the app is open: back in view, the page says nothing while its version is the
//     one live, then "A new version is ready." with Reload, above the screen; the next version takes
//     over and the old proof worker is gone; the page reloads once, back on a market's roles, and the
//     profile is made.
// 15. The ID check, from the ID's dashed badge beside You: Get verified, Face Verified, the ID to
//     do, its price and lines, Back and no Continue, nothing floating; its box: Before, with the unlock
//     icon on Continue to pay, no seed held after a reload, one unlock for the stamp number; the
//     verifier's own payment page framed in the box, its client secret after the #, its stand-in Pay,
//     its one message moving the box on; Didit's page framed; done, and the card Verified, nothing
//     asked again, no tab opened, the page never left, its price taken at the stand-in Stripe; both
//     Verified, no Continue; both verifications on every profile, and both badges, the same black
//     square, the face check's first, beside Profiles on a laptop (no outline, none on a card), on
//     the profile's header, and on the writing screen's card of who it is to, its link opened; both
//     solid beside You, nothing to add; Your checks, Face, which does not open, then the ID by the
//     document's own name (the stand-in Didit reads no kind: ID), with its caret, the device keeping
//     its country and its entry, never the name, birth date or number; the ID's page: its name, its
//     badge and Verified, then its rows, Name, Born and Document (the stand-in reads no number and no
//     end), after one unlock at most; the connect page's ticks with no badge; a student's avatar
//     light, a tint of its market's color, its market's icon. Every tick and card, here and above, is
//     tapped on the row itself, as a person taps it.
// 16. The seed held 15 minutes after the last action, on the page's clock: then Post shows its unlock
//     icon again.
// 17. A face check that doesn't pass (other): in its box, "Too many failed tries", "Verify with your
//     ID instead.", Verify with your ID alone, strong green; it opens the ID's Before in the same box,
//     paid and checked there; the ID check gives a face stamp too: both Verified, Continue, Add a
//     backup, Later, Your first profiles. Then too young: "We couldn't confirm you're 18 or older",
//     the box closed, the Face card greyed, its name alone, its free check used.
//     Then the ID check's answers, from Start, each paid on the verifier's page in the box: an ID it
//     couldn't accept, "We couldn't accept this ID", Keep trying and Skip, you won't be charged; Keep
//     trying, a new session on the same payment, no payment page; on its third session, "Too many
//     failed tries", "You weren't charged.", Close, the payment dropped; Skip: the payment cancelled at
//     the verifier; a person seen before: "You're already verified with another passkey", Delete this
//     passkey in red, Lost your passkey? Contact us, a mailto; too young: "Forest is for people 18 and
//     older"; a service's error: "Something went wrong", "It wasn't you. Try again.", Try again, then
//     both checks Verified, Continue strong green.
// 18. A number with its unit: many before anything is typed, one for 1, + adding one, many for 27,
//     beside the number in the form; 27 and its unit on its row; and the beta market's one line at
//     the form's top.
// 19. Several places in one field: the first round the phone, Chamberí and Monterrey searched for by
//     name with Add another area, each in the list by its caption with a remove button; Monterrey
//     removed; posted, both in the field, each moved by up to a tenth of its radius.
// 20. A language picked by its name: the long list every value by its name, a code searched
//     showing no code, the name searched finding it; its row shows the name, the listing holds the
//     code.
// 21. A profile whose market is gone (a made-up market, its folder written as an old one's is, on the
//     device's list): forgotten as the page opens, and shown nowhere, not on Home, in the sidebar or
//     Messages' chips, nor offered to sync.
// 22. The app on a laptop, 1280px wide: the sidebar's first line the mark and the search, no name;
//     New profile's tiles as many columns of about 170px as fit; Home's profiles three to a row of
//     about 300px, each a block, its header on its market's tint, no mark, its market and role, its
//     rating; under it its offers as lines, up to two, then how many more, which opens the profile, or
//     No offers yet; New profile at Home's top right with the badges, strong green; the profile, its
//     offers as photo tiles, no pencils, New offer beside the Offers heading; a line opens its offer;
//     the coat from its tile,
//     three panes: itself, its photos one at a time, 1 of 2, its price, its answers, its words and
//     Edit, then its conversations, opened by themselves with the seed held, without its
//     title, and the one tapped beside them, the offer staying; Messages in two panes, the
//     conversations without a back on the left, nothing open on the right until one is tapped, then
//     it, its row on the soft green, the others flat; its header one line, the market's badge on
//     their picture, no "to your", Review outlined, with its star and its word, nothing floating; the
//     sidebar and Home in one order, the order the profiles were made, the first first and the one
//     just made last; a listing an older market shaped: the ! on its profile's row and its line,
//     nothing moving; past eight profiles (the device's list made longer with the same seed's
//     addresses, never written, so no more proofs), every one in the sidebar, in Home's order, those
//     made as they were and the rest after, no All profiles, the sidebar scrolling inside itself and
//     the page not; Home lists them all, and its one search is Search Forest.
// 23. A range (a number the market asks as one, such as the ages a coach takes): From 18 and To
//     empty, "18 years or more" under them; posted, the field holds { from: "18" }; reopened a range
//     again, From emptied and To 11, "Up to 11 years"; posted again at its own path, no second. Then
//     spots, a coach's: the description the form's first field; the listing's spots, a whole number
//     with − and +, no unit; Saturdays from 10 to 12, with that time's own spots under Advanced, its
//     hint, read with the time ("3 spots"); posted, both held; reopened, Advanced open by itself.
// 24. A price list, a tutor's: MX$1,300 for 5 months; Add another price, in the last one's currency,
//     $25 for 45 minutes with its note, 50 minutes refused in a line; both numbered, each its remove
//     button; posted, every price in order, counts as decimal text, 45 minutes as 0.75 of an hour; its
//     card the first price, "for 5 months", and "+1 more"; reopened from its page, both, one removed,
//     the last with no remove button.
// 25. Every market's own icon, from its market file, else its first letter, and its color by its
//     number, the index's ten in their order, on New profile's tiles; markets numbered next to each
//     other apart; the tutor's avatar on Home the same.
// 26. The ID check while the verifier doesn't sell it (its GET / answering forSale false): the Face
//     card alone on Get verified, Continue strong green once it is done, no ID outline beside You, no
//     ID row in Your checks, no ID outline on Home; a face seen before, in a second browser: Use my
//     other passkey alone, no Verify with your ID; sold with a live key (testPayments false), the ID
//     card with no test line.
// 27. Messages before they are opened, on a laptop: the sidebar's Messages asks the passkey itself;
//     its prompt closed, one block in the middle of the whole content, the lock, New messages when
//     some came, and Open, no split, no Pick a conversation, no chips; opened, one unlock, the two
//     panes; a phone keeps its title and the block; no New message anywhere.
// 28. Email: Off in You to start; its page, nothing floating: Off (its one line, Your email, Turn on,
//     strong green, no ticks); "That doesn't look like an email address." before anything is asked;
//     Turn on, then Which profiles?, a sheet: each profile a row, its avatar, Market · role and a round
//     tick, all on, the host's line, Continue with the unlock icon; "Tick at least one profile." with
//     none, nothing asked; two kept and Continue, one unlock, the sheet gone, the stand-in Resend
//     holding the code; Code sent (the email with Change, the 6-digit code, Turn on), a wrong code in
//     one line, the code, On: the email on a white row, its mail icon and pencil, Profiles with their
//     round ticks, no Save, no Turn off; the Profiles folder's one locked entry holding the id, the
//     address and the two profiles, nothing readable in it, a copy on the device; one tick tapped,
//     saved at once, the entry and the host counting the one; the last one staying, in one line; You
//     says Every morning; the pencil: the row open in place, the email in its field, Delete email in
//     red with its trash at the left, Save at the right; a new address, a new code, On, the old id
//     gone at the host; a second code inside a minute: "Wait a minute, then send a new code."; the
//     same address saved closes the row; a second browser, the same passkey, shows Every morning, the
//     address and the ticks after its Start; Delete email asking again in place, Delete your email?,
//     Cancel keeping it, then Delete: deleted at the host, the entry, the device copy, and You says
//     Off.
// 29. Passkeys don't work here, in an app's own browser (Instagram's user agent): in place of
//     Start, its line, Copy link, white, with its copy icon, copying the page's address, Copied.
//     Then a passkey met at Start whose seed was never verified: This passkey has never been
//     verified, its line, Continue to verification, white, to Get verified; again, Delete passkey, red:
//     the browser told it's gone (signalUnknownCredential), the device forgotten, the passkey with it,
//     Start. Then Add a backup, every passkey this browser makes saying Apple made it: Not in Apple
//     Passwords; a security key's, Apple's too, dropped, the browser asked to drop it, nothing written,
//     and the yellow note above the cards, "That one is in Apple Passwords too. Save it somewhere
//     else."; another maker's, added, a backup/<id> in the Profiles folder, and on to Your first
//     profiles. Then Report, from someone else's profile: its ··· with Share profile and Report; the
//     sheet, Warn others with its caret, Illegal content with its arrow, a mailto to the contact
//     address, its subject Illegal content, its body their page on the index; Warn others opening a
//     report, from the person's profile on the other side.
// 30. A test account, its address in the build's config: Give credits, from its link alone, on the
//     person checked with the ID ("Give 20 credits to this account?", its short key, one tap with the
//     seed held), 20 in its wallet; then in a browser with no passkey, /type-words, its 24 words,
//     nothing asked and no passkey made, straight to Your first profiles; a link to a profile it lacks,
//     its market's sheet open, Create making it with no verification; held after a reload, nothing
//     asked; a link to a listing that isn't there, to a profile it lacks, to a conversation it doesn't
//     have and to no market, each its one line; an AI app connected with no passkey; a link to another
//     role, Create giving it to the AI app at once, "Your AI can use it. Go back to your chat.", and the
//     AI acting for both; a link to its own profile and to the listing the AI wrote, each opening it.
// 31. Nothing the app did, through all of it, was refused by the CSP.
// SHOTS=<dir> keeps a screenshot of each screen there, light and dark.

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { crc32 } from 'node:zlib'

import { Resvg } from '@resvg/resvg-js'

import { type Browser, type BrowserContext, type CDPSession, type Locator, type Page, chromium } from 'playwright'
import { build } from 'vite'

import { type Body, b64u, entry, liveContent, nextTime, proofsOf, readFolder, verificationCheck, write } from '../../standard/folders/dist/index.js'
import { isLocked, openLocked } from '../../standard/folders/dist/locked.js'
import { exportWords, mainKey, newSeed, openingHalf } from '../../standard/keys/dist/index.js'
import { checkVerification, stampFromJson } from '../../standard/proofs/dist/index.js'
import { labelOf, loadMarkets, previewOf, valuesOf } from '../../markets/build/dist/index.js'
import { type Served, serve } from '../../services/mcp/src/server.ts'
import { App } from '../../services/mcp/test/app.ts'
import { REDIRECT, aiApp } from '../../services/mcp/test/setup.ts'
import { PALETTE, colorFor } from '../../services/index/src/avatar.ts'
import { animalOf } from '../../src/animals.ts'
import { unitWords } from '../../src/units.ts'
import { codeSentTo } from '../resend.ts'
import { choiceWords, fieldWith, isFor, isLong, labelled, lessons, marketWords, opening, roleWords, shop, sides, twoSides, valueWords } from '../directory.ts'
import { type Running, freePort, startServices } from './services.ts'
import { type Tiles, standInTiles } from './tiles.ts'
import { serveLikeVercel } from './vercel.ts'

const app = fileURLToPath(new URL('../../', import.meta.url))
const outDir = fileURLToPath(new URL('out/app', import.meta.url))
/** The next deploy: the same app, every chunk named anew. */
const nextDir = fileURLToPath(new URL('out/next', import.meta.url))
const shots = process.env.SHOTS
const say = (line: string) => console.log(`  ${line}`)

// What each walk deals in, found in the directory by its shape (test/directory.ts), never named: a
// market changing, or a new one, leaves the walks working while some market holds each shape.
const MARKETS = loadMarkets()
/** The icon a market's file names, or null: its avatar shows its first letter then. */
const iconOf = (market: string) => MARKETS.market(market)?.icon ?? null
/** Lessons: the first person's first profile offers them, the second person's asks for them. */
const L = lessons(MARKETS)
const LESSONS = L.market.name
const TUTORING = marketWords(LESSONS)
const LESSONS_ICON = iconOf(LESSONS)
const TUTOR_LABEL = L.offer.label
const STUDENT_LABEL = L.request.label
const TUTOR_WORDS = `${TUTORING} ${L.offer.role}`
const STUDENT_WORDS = `${TUTORING} ${L.request.role}`
/** Things sold, with photos, a chain of lists and chips: the seller is the first person's second profile. */
const S = shop(MARKETS)
const SHOP = S.market.name
const SHOPPING = marketWords(SHOP)
const SELLER_LABEL = `${SHOP}/${S.seller}`
const BUYER_LABEL = `${SHOP}/${S.buyer}`
const SELLER_WORDS = `${SHOPPING} ${S.seller}`
const BUYER_WORDS = `${SHOPPING} ${S.buyer}`
/** A third market with two sides, whose role that offers the person makes across a deploy. */
const D = twoSides(MARKETS, (m) => m.name !== LESSONS && m.name !== SHOP)
const DEPLOY = marketWords(D.market.name)
/** A choice's value as the form says it: the markets' words for it, with a capital. */
const wordOf = (name: string, value: string, market = L.market) => choiceWords(market.listing[name]!, value, MARKETS.lists)
/** A choice's values, its own or its shared list's. */
const valuesIn = (name: string, market = L.market) => valuesOf(market.listing[name]!, MARKETS.lists)
/** A field as its market asks it of a role: its label, its question, its hint. */
const fieldAsked = (market: string, role: string, name: string, kind: 'listing' | 'review' = 'listing', about?: string) => MARKETS.ask(market, role, kind, about).find((f) => f.name === name)!
/** What a price is for, one of it, as people say it: an hour, a month. */
const forOne = (p: string) => `${/^(hour|[aeio])/.test(p) ? 'an' : 'a'} ${p}`

/** What the test's build sets in the app's config beside the services: the stand-in Didit's page, ChatGPT's page for adding Forest, and a company to show. */
const TEST_CONFIG = {
  didit: 'https://fake-didit.invalid',
  addPages: { ChatGPT: 'https://chatgpt.example/add-forest' },
  company: { name: 'Open Forest Test', registered: 'Registered in Testland', number: 'No. 0001', office: '1 Test Street, Testville' },
}

let services: Running
/** OpenFreeMap's stand-in, for the place screen's map. */
let tiles: Tiles
/** Services' own mcp, and the directory it keeps its two keys in. */
let mcp: Served
let mcpDir: string
let server: Awaited<ReturnType<typeof serveLikeVercel>>
let browser: Browser
let APP: string
let OTHER: string
let csp: string
/** app.forest.foundation and other.forest.foundation on loopback, each taken as a secure origin. */
let CHROME_ARGS: string[]
const refused: string[] = []

type Phone = { context: BrowserContext; page: Page; cdp: CDPSession; authenticator: string; counts: { created: number; asserted: number }; went: Went[] }
/** A stand-in page a box framed: Didit's for a session, or Stripe's script on the verifier's payment page; and the page whose box framed it. */
type Went = { to: 'stripe' | 'didit'; page: Page }
/** The first person's browser, its seed (asked of its passkey by the test itself), and their profile. */
let first: Phone
let seed: Uint8Array
/** The test account's seed, and its Profiles folder's address, which the build's config lists. */
const TESTER = newSeed()
let TESTER_ADDRESS: string
let tutor: string
/** The clothing buyer's profile, another person's. */
let buyerAt: string

async function shot(page: Page, name: string) {
  if (!shots) return
  mkdirSync(shots, { recursive: true })
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.screenshot({ path: `${shots}/${name}-${scheme}.png`, fullPage: true })
  }
  await page.emulateMedia({ colorScheme: 'light' })
}

/** The same screen on a laptop, 1280px wide, shot only when screenshots are taken; then a phone again. */
async function laptopShot(page: Page, name: string) {
  if (!shots) return
  await page.setViewportSize({ width: 1280, height: 800 })
  await shot(page, name)
  await page.setViewportSize({ width: 390, height: 844 })
}

/** Where a phone that allows its location is: Madrid's Puerta del Sol. */
const SPOT = { latitude: 40.41678, longitude: -3.70379 }

/** A point as a place holds it, in degrees as decimal text. */
type Point = { lat: string; lon: string }

/** The distance between two points, in kilometres. */
function kmApart(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(rad(Number(b.lat) - Number(a.lat)) / 2) ** 2 + Math.cos(rad(Number(a.lat))) * Math.cos(rad(Number(b.lat))) * Math.sin(rad(Number(b.lon) - Number(a.lon)) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

/** The distance between a place's point and SPOT, in kilometres. */
const kmFromSpot = (p: Point) => kmApart(p, { lat: String(SPOT.latitude), lon: String(SPOT.longitude) })

/** A place's input, opened in its row in the form, named by its label, once its map is drawn. */
async function placeScreen(page: Page, label: string) {
  const open = await openRow(page, label)
  await open.locator('.maplibregl-canvas').waitFor()
  return open
}

/** The middle of a place input's map, on the page. */
async function middleOf(screen: Locator) {
  const box = (await screen.locator('.map').boundingBox())!
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** The place slider's size, as it says it: Exact spot, 10 km. */
const sizeOf = (screen: Locator) => screen.getByRole('slider', { name: 'Size' }).getAttribute('aria-valuetext')

/** A size in kilometres, from the slider's words: an exact spot is 0. */
const km = (words: string | null) => (!words || words === 'Exact spot' ? 0 : Number(words.replace(' km', '')))

/** The place slider moved, a step at a time with the arrow keys, until it says `words`. */
async function setSize(screen: Locator, words: string) {
  const slider = screen.getByRole('slider', { name: 'Size' })
  for (let i = 0; i < 30 && (await sizeOf(screen)) !== words; i++) await slider.press(km(await sizeOf(screen)) < km(words) ? 'ArrowRight' : 'ArrowLeft')
  assert.equal(await sizeOf(screen), words)
}

/** The caption places gives a circle's centre, as the app picks it: the nearest place not much smaller than the circle, else the nearest. */
async function captionAt(p: Point & { radiusKm: number }): Promise<string> {
  const { places } = (await (await fetch(`${services.places}/v1/name?near=${Number(p.lat).toFixed(2)},${Number(p.lon).toFixed(2)}`)).json()) as { places: Array<{ caption: string; radiusKm: number }> }
  return (places.find((f) => f.radiusKm * 5 >= p.radiusKm) ?? places[0])!.caption
}

/**
 * A browser of its own, a phone's size, with a virtual passkey authenticator on the device (face
 * or fingerprint checked), with PRF unless `prf` is false; its passkeys made and asserted, counted;
 * at SPOT, its location allowed, when `located`, and otherwise never allowed.
 * What the CSP refuses on any of its pages is reported.
 */
async function phone({ prf = true, located = false }: { prf?: boolean; located?: boolean } = {}): Promise<Phone> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    // Screenshots a person looks at, sharp: twice the pixels while they are taken.
    ...(shots && { deviceScaleFactor: 2 }),
    locale: 'en-US',
    permissions: ['clipboard-read', 'clipboard-write', ...(located ? ['geolocation'] : [])],
    ...(located && { geolocation: SPOT }),
  })
  await context.exposeFunction('cspRefused', (what: string) => void refused.push(what))
  await context.addInitScript(() => addEventListener('securitypolicyviolation', (e) => (globalThis as any).cspRefused(`${e.violatedDirective} ${e.blockedURI}`)))
  const went: Went[] = []
  // Didit's page, for the stand-in Didit's sessions: services' stand-in serves none and posts nothing,
  // so the test serves one, and posts its messages to the box itself (diditSays).
  await context.route('https://fake-didit.invalid/**', (route) => {
    went.push({ to: 'didit', page: route.request().frame().page() })
    return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Didit</title><h1>The stand-in Didit</h1>' })
  })
  // Stripe's script, on the verifier's own payment page: services' page loads the real one, which a
  // test can't reach. Its stand-in mounts one Pay button, which pays the payment at the verifier's
  // stand-in Stripe (by its client secret, as Stripe knows it) and then completes, as Stripe's own
  // does, so the verifier's page posts its one message.
  await context.route('https://js.stripe.com/endive/stripe.js', (route) => {
    went.push({ to: 'stripe', page: route.request().frame().page() })
    return route.fulfill({ contentType: 'text/javascript', body: STRIPE_STAND_IN })
  })
  await context.route('https://checkout.stripe.example/pay/**', (route) => {
    const secret = decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop()!)
    services.payments.pay(secret.split('_secret_')[0]!)
    return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, body: 'paid' })
  })
  // ChatGPT's page for adding Forest, as the test's config names it.
  await context.route('https://chatgpt.example/**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>ChatGPT</title>' }))
  // The site's privacy and terms pages, which About Forest frames.
  await context.route('https://forest.foundation/**', (route) => route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>Forest</title><h1>${new URL(route.request().url()).pathname}</h1>` }))
  // A browser that wants a tap before the passkey is asked (as Safari may): the next page the app
  // opens, once the test says so, has its first ask refused, as such a browser refuses it.
  await context.addInitScript(() => {
    if (localStorage.getItem('test.tap') !== 'first') return
    localStorage.removeItem('test.tap')
    const own = navigator.credentials.get.bind(navigator.credentials)
    navigator.credentials.get = () => {
      navigator.credentials.get = own
      return Promise.reject(new DOMException('A tap first.', 'NotAllowedError'))
    }
  })
  const page = await context.newPage()
  page.on('pageerror', (err) => say(`page error: ${err.message}`))
  // A cross-origin frame going away (the box's Didit and payment pages) clears the location this
  // page was given, in Chromium's DevTools; so it's given again each time one does.
  if (located) page.on('framedetached', () => void context.setGeolocation(SPOT))
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable', { enableUI: false })
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: prf, automaticPresenceSimulation: true },
  })
  const counts = { created: 0, asserted: 0 }
  cdp.on('WebAuthn.credentialAdded', () => void counts.created++)
  cdp.on('WebAuthn.credentialAsserted', () => void counts.asserted++)
  return { context, page, cdp, authenticator: authenticatorId, counts, went }
}

/** Stripe's script on the verifier's payment page, as its stand-in: `Stripe(key).createEmbeddedCheckoutPage({ fetchClientSecret, onComplete })`, mounting one Pay button. */
const STRIPE_STAND_IN = `window.Stripe = () => ({
  createEmbeddedCheckoutPage: async ({ fetchClientSecret, onComplete }) => {
    const secret = await fetchClientSecret()
    return {
      mount: (at) => {
        const pay = document.createElement('button')
        pay.textContent = 'Pay'
        pay.onclick = async () => {
          await fetch('https://checkout.stripe.example/pay/' + encodeURIComponent(secret))
          onComplete()
        }
        document.querySelector(at).append(pay)
      },
    }
  },
})`

/** Where `p`'s boxes framed stand-in pages since `since`: each, and whether in `p`'s own tab. */
const wentFrom = (p: Phone, since: number) => p.went.slice(since).map((w) => [w.to, w.page === p.page])

/** The frame of `page` showing `origin`'s page, once it does. */
async function frameAt(page: Page, origin: string) {
  for (const until = Date.now() + 60_000; ; await page.waitForTimeout(100)) {
    const frame = page.frames().find((f) => f.url().startsWith(origin))
    if (frame) return frame
    if (Date.now() > until) throw new Error(`no frame at ${origin}`)
  }
}

/** Didit's page in the box posts `type` to the app around it, as Didit's own page does: `{ type, data, timestamp }`. Services' stand-in posts none, so the test posts it from inside the frame. */
async function diditSays(page: Page, type: string) {
  const frame = await frameAt(page, 'https://fake-didit.invalid')
  await frame.locator('h1').waitFor()
  await frame.evaluate((t) => parent.postMessage({ type: t, data: { sessionId: location.pathname.split('/').pop(), status: 'Approved' }, timestamp: Date.now() }, '*'), type)
}

/** The seed as the app derives it, asked by the test itself: the PRF secret for "forest-seed-v1", relying party app.forest.foundation. One assertion. */
async function seedOn(page: Page): Promise<Uint8Array> {
  const bytes = await page.evaluate(async () => {
    const got = (await navigator.credentials.get({
      publicKey: { rpId: 'app.forest.foundation', challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', extensions: { prf: { eval: { first: new TextEncoder().encode('forest-seed-v1') } } } },
    })) as PublicKeyCredential
    return Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer))
  })
  return new Uint8Array(bytes)
}

const kept = (page: Page) => page.evaluate(() => ({ ...localStorage }))
/** The badge a verified profile shows for one of its checks: the same mint square, a face being scanned or an ID card inside; an icon, whose words show only when tapped. */
const badge = (within: { getByRole: Page['getByRole'] }, check: 'face' | 'id' = 'face') => within.getByRole('img', { name: check === 'id' ? 'Verified with Face + ID' : 'Verified with Face', exact: true })
/** Home, its card for `words` there, and `check` among how the person is verified (on a phone, Home shows no badges: the device's own word for it): the profiles found, and how the person is verified. */
async function homeWith(page: Page, words: string, check: 'face' | 'id' = 'face', timeout = 60_000) {
  await page.locator('button.card', { hasText: words }).waitFor({ timeout })
  await page.waitForFunction((c) => (JSON.parse(localStorage.getItem('forest.counted') ?? '[]') as string[]).includes(c), check, { timeout })
}

/** Which badge it is, as drawn: the black square, its icon in the page's ground; a face being scanned inside, the selfie check's; an ID card, the ID check's. */
const drawnAs = (b: Locator) =>
  b.evaluate((el) => {
    const probe = document.body.appendChild(document.createElement('span'))
    probe.style.color = 'var(--ink)'
    const mint = getComputedStyle(probe).color
    probe.style.color = 'var(--bg)'
    const onMint = getComputedStyle(probe).color
    probe.remove()
    return { check: (el as HTMLElement).dataset.check, icon: el.querySelector('svg')!.dataset.icon, ground: getComputedStyle(el).backgroundColor === mint, ink: getComputedStyle(el.querySelector('svg')!).color === onMint }
  })
const SELFIE = { check: 'face', icon: 'scan-smiley', ground: true, ink: true }
/** The ID card's line while the verifier's payments are test payments. */
const TEST_LINE = 'Test mode: pay with the card 4242 4242 4242 4242.'
const ID = { check: 'id', icon: 'identification-card', ground: true, ink: true }

/** A profile's avatar as drawn: its market's color (services' avatar.ts), solid or light, and its animal, or for a market or a role, its market's icon. */
const avatarOf = (av: Locator) =>
  av.evaluate((el) => ({ light: el.classList.contains('look'), h: getComputedStyle(el).getPropertyValue('--h').trim(), ground: getComputedStyle(el).backgroundColor, icon: el.querySelector('svg')?.dataset.icon ?? el.querySelector('svg')?.dataset.animal }))
/** The animal the app draws for the profile at `address`. */
const animal = (address: string) => animalOf(address)[0]
/** A market's color, as the app and the index give it: its number cycled through the index's ten colors (services' avatar.ts). */
const colorOf = (market: string) => colorFor(MARKETS.market(market)?.number)
/** `#3d76c9` as the page computes it: rgb(61, 118, 201). */
const rgbOf = (hex: string) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`

/**
 * The page hidden a moment and shown again, as when the person goes to another app or tab, or locks
 * the phone, and comes back: its visibility and the event, as the page sees them. Headless Chromium
 * never hides a page, so the test tells it.
 */
async function away(page: Page) {
  await page.evaluate(() => {
    for (const state of ['hidden', 'visible']) {
      Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    delete (document as { visibilityState?: string }).visibilityState
  })
}

/** Nothing floats: no dialog, no sheet, no box and nothing over the page on the screen now, only what the page itself holds. */
async function nothingFloats(page: Page, what: string) {
  const floating = await page.evaluate(() =>
    [...document.querySelectorAll('body *')].filter((el) => el.matches('[role="dialog"], [aria-modal], .sheet, .scrim') || (getComputedStyle(el).position === 'fixed' && !el.matches('.over, .placing'))).map((el) => el.outerHTML.slice(0, 80)),
  )
  assert.deepEqual(floating, [], `${what}: nothing floats`)
}

/** `inside` opened in place, right under `opener`, in the page's own flow: below it, and as wide as the column holds it. */
async function underIt(opener: Locator, inside: Locator) {
  await inside.waitFor()
  const [a, b] = [(await opener.boundingBox())!, (await inside.boundingBox())!]
  assert.ok(b.y >= a.y + a.height - 1 && b.y - (a.y + a.height) < 40, `right under it: ${JSON.stringify([a, b])}`)
}

/** Whether `b` shows the unlock icon: it does only when a tap on it will ask the passkey. */
const asks = async (b: Locator) => (await b.locator('.unlock').count()) === 1

/** The round Messages button at the top right of the screen: the way into messages, its number only when some are new. */
const inbox = (page: Page) => page.locator('.top-right').getByRole('button', { name: /^Messages/ })

/** A profile's messages, from its card on Home and the round button at its top: Messages, picked to it. */
async function messagesOf(page: Page, card: string) {
  await page.locator('button.card', { hasText: card }).click()
  await inbox(page).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
}

/** The page closed and opened again, on the same screen: what drops the seed now, besides 15 minutes with nothing done. */
async function closed(page: Page) {
  await page.reload()
  await page.locator('main').waitFor()
}

const balance = async (folder: string) => ((await (await fetch(`${services.host}/credits/balance/${folder}`)).json()) as { credits: number }).credits
const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name, exact: typeof name === 'string' })

/** A profile's name as it shows in `within`: its market in bold, then its role in the muted tone, no symbol between. */
async function named(within: Locator, words: string) {
  const name = within.locator('.named', { hasText: words }).first()
  await name.waitFor()
  const seen = await name.evaluate((el) => {
    const muted = document.createElement('span')
    muted.style.color = 'var(--ink2)'
    el.append(muted)
    const ink2 = getComputedStyle(muted).color
    muted.remove()
    const [market, role] = [el.querySelector('strong')!, el.querySelector('.role')!]
    return { text: el.textContent, market: [market.textContent, getComputedStyle(market).fontWeight], role: [role.textContent, getComputedStyle(role).fontWeight, getComputedStyle(role).color === ink2] }
  })
  const [market, role] = [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)]
  assert.deepEqual(seen, { text: words, market: [market, '700'], role: [role, '500', true] }, `${words}: the market in bold, the role muted, nothing between`)
}

/** Another profile's market and role, as it shows apart from who they are to the person: the market in its color, bold, then the role, muted. */
async function mkrIn(within: Locator, market: string, role: string) {
  const m = within.locator('.mkr', { hasText: `${market} ${role}` }).first()
  await m.waitFor()
  const seen = await m.evaluate((el) => {
    const [mk, r] = [el.querySelector('.m')!, el.querySelector('.r')!]
    return [mk.textContent, getComputedStyle(mk).fontWeight, r.textContent, getComputedStyle(r).color]
  })
  assert.deepEqual(seen, [market, '700', role, await muted(within.page())], `${market} ${role}: the market bold in its color, the role muted`)
}

/** Within `within`, someone's market alone, bold in its color, and no role: as Messages shows them, since in a market a person talks only with the other side. */
async function marketIn(within: Locator, market: string) {
  const m = within.locator('.mkr').first()
  await m.waitFor()
  assert.deepEqual(await m.evaluate((el) => [el.textContent, el.querySelector('.m')?.textContent, getComputedStyle(el.querySelector('.m')!).fontWeight, el.querySelectorAll('.r').length]), [market, market, '700', 0], `${market}: the market alone, bold, no role`)
}

/** Someone's short key, as the app shows a profile no one named: its address's first 6 characters, and "…". */
const short = (address: string) => `${address.slice(0, 6)}…`

/** One of the person's own offers (or requests) on their profile, by its words: its card. */
const offerCard = (page: Page, words: string) => page.locator('main button.offer', { hasText: words })

/** One of the person's own offers opened to edit: its card, its page, then its own card there, the whole of which edits it. */
async function editOffer(page: Page, words: string) {
  await offerCard(page, words).click()
  await page.locator('button.card.offer-big', { hasText: words }).click()
  await page.locator('form#listing').waitFor()
}

/** Home's title, Profiles. */
const homeTitle = (page: Page) => page.getByRole('heading', { name: 'Profiles', exact: true, level: 1 })

/** A profile's card on Home: its market in bold over its role, muted. */
async function cardNamed(card: Locator, market: string, role: string) {
  const seen = await card.locator('.nm2').evaluate((el) => {
    const [m, r] = [el.querySelector('strong')!, el.querySelector('span')!]
    return [m.textContent, getComputedStyle(m).fontWeight, r.textContent, getComputedStyle(r).fontWeight]
  })
  assert.deepEqual(seen, [market, '700', role, '400'], `${market} ${role}: the market in bold over the role`)
}

/** A field's row in the posting form, by the label its market gives it. */
const rowOf = (page: Page, label: string) => page.locator('.field-row').filter({ has: page.locator('.field-head .name').getByText(label, { exact: true }) })

/** A field's row, opened in place: what it opens, its input inside. */
async function openRow(page: Page, label: string): Promise<Locator> {
  const head = rowOf(page, label).locator('.field-head')
  if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click()
  return rowOf(page, label).locator('.field-open')
}

/** A field's row, closed by its Done. */
async function closeRow(page: Page, label: string) {
  await rowOf(page, label).locator('.field-open').getByRole('button', { name: 'Done', exact: true }).click()
  await rowOf(page, label).locator('.field-open').waitFor({ state: 'detached' })
}

/** What a field's row says while closed: its answer's lines, or its question. */
const rowSays = (page: Page, label: string) => rowOf(page, label).locator('.field-head .answer').allTextContents()

/** On a field with a long list, opened, `words` searched for and picked: of one choice, its radio row; of several, its tick box. */
async function pick(page: Page, label: string, words: string) {
  const open = await openRow(page, label)
  await open.getByRole('searchbox').fill(words)
  const one = (await open.getByRole('radiogroup').count()) === 1
  await open.getByRole(one ? 'radio' : 'checkbox', { name: words, exact: true }).click()
  await closeRow(page, label)
}

/** The quiet tone, ink3, as the page draws it now. */
const muted = (page: Page) =>
  page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--ink3)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  })

/** Every icon on a filled button on the page, in its button's text color; how many there were. */
async function iconsInTheirButtonsColor(page: Page): Promise<number> {
  const icons = await page.evaluate(() =>
    [...document.querySelectorAll('button.primary .icon, button.solid .icon, button.cream .icon')].map((icon) => ({ on: icon.closest('button')!.textContent || icon.closest('button')!.getAttribute('aria-label'), same: getComputedStyle(icon).color === getComputedStyle(icon.closest('button')!).color })),
  )
  assert.deepEqual(icons.filter((i) => !i.same).map((i) => i.on), [], "every icon on a filled button in the button's text color")
  return icons.length
}

/** No list row on the page shows the unlock icon: on a row, an open padlock reads as locked. */
const noLockOnRows = async (page: Page) => assert.equal(await page.locator('button.row .unlock').count(), 0, 'no unlock icon on a list row')

/** A token's color as the page draws it now (rgb()): to check what is strong green, soft green or ink. */
const tokenColor = (page: Page, token: string) =>
  page.evaluate((t) => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = `var(--${t})`
    const color = getComputedStyle(span).color
    span.remove()
    return color
  }, token)

/** A check's card on Get verified, by its name, and its button, strong green, the card's whole width. */
const cardOf = (page: Page, name: 'Face' | 'Face + ID') => page.locator(`.vcard[data-check="${name === 'Face + ID' ? 'id' : 'face'}"]`)
const checkCard = (page: Page, name: 'Face' | 'Face + ID') => cardOf(page, name).locator('> button.primary')

/** A check's box, open over Get verified. */
const boxOf = (page: Page, check: 'face' | 'id' = 'face') => page.getByRole('dialog', { name: check === 'id' ? 'ID check' : 'Face check' })

/** The box's Before step: the tick ticked, and Start (or Continue to pay). */
async function agreed(page: Page, check: 'face' | 'id' = 'face') {
  const box = boxOf(page, check)
  await box.getByRole('heading', { name: check === 'id' ? 'Before your ID check' : 'Before your face check' }).waitFor({ timeout: 60_000 })
  await box.getByRole('checkbox').click()
  await box.getByRole('button', { name: check === 'id' ? 'Continue to pay' : 'Start' }).click()
}

/** The Face card tapped on Get verified: its box, its Before step agreed to, Didit's page framed in it, done; then the card Verified. */
async function faceCheck(p: Phone) {
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  const since = p.went.length
  await checkCard(p.page, 'Face').click()
  await agreed(p.page)
  await diditSays(p.page, 'didit:completed')
  await cardOf(p.page, 'Face').locator('.donechip').waitFor({ timeout: 90_000 })
  assert.deepEqual(wentFrom(p, since), [['didit', true]], "Didit's page, framed in the box, in this tab")
}

/** On Get verified from Start, a check done: Continue; then Add a backup put off with Later, the first time on this device; on to Your first profiles. */
async function onward(p: Phone) {
  await p.page.locator('.vcard .donechip').first().waitFor({ timeout: 90_000 })
  await button(p.page, 'Continue').click()
  const backup = p.page.getByRole('heading', { name: 'Add a backup' })
  const firsts = p.page.getByRole('heading', { name: 'Your first profiles' })
  await backup.or(firsts).first().waitFor({ timeout: 60_000 })
  if (await backup.isVisible()) await button(p.page, 'Later').click()
}

/** Start on a device that knows no passkey: nothing comes back, so Start found nothing, and I'm new makes the passkey. */
async function imNew(p: Phone) {
  await closeTheSheetOnce(p.page)
  await button(p.page, 'Start').click()
  await p.page.getByRole('region', { name: 'Start found nothing' }).waitFor()
  await button(p.page, "I'm new").click()
}

/** A new person in `p`'s browser through Start, I'm new, and the face check. */
async function newPerson(p: Phone) {
  await p.page.goto(APP)
  await imNew(p)
  await faceCheck(p)
}

/** Start on a device that knows no passkey: it asks for any, which the browser's own window answers, a phone's QR code among its ways. */
async function elsewhere(p: Phone) {
  await button(p.page, 'Start').click()
}

/** A role's Create on its market's page: Create seller. */
const create = (role: string) => ({ name: `Create ${role}`, exact: true })

/** A profile's name, "Goods selling seller", as its market and its role. */
const split = (words: string) => [words.slice(0, words.lastIndexOf(' ')), words.slice(words.lastIndexOf(' ') + 1)] as [string, string]

/** A market's tile on New profile, by its words: a beta one's name says so (Tutoring, beta), and one with a role of the person's, which (yours: Tutor). */
const tile = (page: Page, market: string) => page.getByRole('button', { name: new RegExp(`^${market}(, beta)?(, yours: .*)?$`) })

/** The tiles' market words, whole, in their order: each tile's name. */
const tileNames = (page: Page) => page.locator('button.market-tile').evaluateAll((t) => t.map((x) => x.getAttribute('aria-label')!.replace(/, yours: .*$/, '').replace(/, beta$/, '')))

/** A market's roles, its sheet open from its tile. */
const marketSheet = (page: Page, market: string) => page.getByRole('dialog', { name: market })

/** A role made in its market's sheet, found by searching: Create, one unlock unless the seed is held, then its round ✓; with an AI app connected, the made sheet, whose Done gives it to them. The sheet closed. */
async function made(page: Page, words: string) {
  const [market, role] = split(words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await tile(page, market).click()
  const sheet = marketSheet(page, market)
  await sheet.getByRole('button', create(role)).click()
  const done = page.getByRole('dialog', { name: `${roleWords(role)} profile created` })
  const yours = sheet.getByRole('button', { name: `Open ${role}`, exact: true })
  await done.or(yours).first().waitFor({ timeout: 120_000 })
  if (await done.isVisible()) return done.getByRole('button', { name: 'Done', exact: true }).click()
  await page.keyboard.press('Escape')
}

/** One of the markets' roles picked on New profile: made in its market's sheet, then its profile, opened from its ✓. */
async function pickProfile(page: Page, words: string) {
  const [market, role] = split(words)
  await made(page, words)
  await page.getByLabel('Search').fill(market.toLowerCase())
  await tile(page, market).click()
  await marketSheet(page, market).getByRole('button', { name: `Open ${role}`, exact: true }).click()
  await page.getByRole('heading', { name: words }).waitFor({ timeout: 120_000 })
}

/** A first profile made on Your first profiles, as on New profile; then Continue, on to Connect your AI. */
async function pickFirst(page: Page, words: string) {
  await page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  await made(page, words)
  await button(page, 'Continue').click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor({ timeout: 120_000 })
}

/**
 * `p`'s passkey sheet answered by `from`'s passkeys, as a phone answers through the sheet's QR
 * code: their PRF secret for the same salt, from another device (cross-platform). With `only`, the
 * one passkey it names answers, as the person picks it on that phone. A passkey `p`'s own
 * authenticator holds, once one is saved there, answers there.
 */
async function answerFrom(p: Phone, from: Phone, only?: () => string) {
  await p.context.exposeFunction('answerFromFirst', (wire: { rpId: string; allow: number[][]; first: number[] }) =>
    from.page.evaluate(
      async (w) => {
        try {
          const got = (await navigator.credentials.get({
            publicKey: { rpId: w.rpId, challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', ...(w.allow.length && { allowCredentials: w.allow.map((id) => ({ type: 'public-key' as const, id: new Uint8Array(id) })) }), extensions: { prf: { eval: { first: new Uint8Array(w.first) } } } },
          })) as PublicKeyCredential
          return { rawId: Array.from(new Uint8Array(got.rawId)), first: Array.from(new Uint8Array(got.getClientExtensionResults().prf!.results!.first as ArrayBuffer)) }
        } catch (err) {
          return { error: { name: (err as Error).name, message: (err as Error).message } }
        }
      },
      only ? { ...wire, allow: [[...Buffer.from(only(), 'base64url')]] } : wire,
    ),
  )
  await p.context.addInitScript(() => {
    const own = navigator.credentials.get.bind(navigator.credentials)
    const bytes = (b: BufferSource) => Array.from(b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer, b.byteOffset, b.byteLength))
    navigator.credentials.get = async (options?: CredentialRequestOptions) => {
      const pk = options?.publicKey
      if (!pk) return own(options)
      // A passkey named that this browser's own authenticator holds (one saved here) answers here;
      // one it doesn't hold, it says so at once, and the phone answers.
      if (pk.allowCredentials?.length) {
        try {
          return await own(options)
        } catch (err) {
          if ((err as Error).name !== 'NotAllowedError') throw err
        }
      }
      const got = await (globalThis as any).answerFromFirst({ rpId: pk.rpId, allow: (pk.allowCredentials ?? []).map((c) => bytes(c.id)), first: bytes(pk.extensions!.prf!.eval!.first) })
      if (got.error) throw new DOMException(got.error.message, got.error.name)
      const first = new Uint8Array(got.first).buffer
      // From another device, as a phone through the QR code answers: cross-platform.
      return { type: 'public-key', id: '', rawId: new Uint8Array(got.rawId).buffer, authenticatorAttachment: 'cross-platform', getClientExtensionResults: () => ({ prf: { results: { first } } }) } as unknown as Credential
    }
  })
}

/** The page's own navigator.credentials.get, answering once as a closed sheet does: no passkey. */
const closeTheSheetOnce = (page: Page) =>
  page.evaluate(() => {
    const own = navigator.credentials.get
    navigator.credentials.get = () => {
      navigator.credentials.get = own
      return Promise.reject(new DOMException('The sheet was closed.', 'NotAllowedError'))
    }
  })

/** A service's route in `context` answered with `status` and `body` (or what `body` gives at the time), and CORS as the services answer it; while `when` says no, the route answered before it, else the service. */
async function answer(context: BrowserContext, url: string, status: number, body: unknown, when: () => boolean = () => true) {
  await context.route(url, (route) => {
    if (!when()) return route.fallback()
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST' }
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    return route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(typeof body === 'function' ? body() : body) })
  })
}

/** A PNG of `width` by `height`, drawn from an SVG, carrying a note as a camera's location would be carried: what the device's redraw must leave behind. */
function photoPng(width: number, height: number, color: string, note: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 3}" fill="#edeae0"/></svg>`
  const png = Buffer.from(new Resvg(svg).render().asPng())
  const data = Buffer.concat([Buffer.from('Comment\0', 'latin1'), Buffer.from(note, 'latin1')])
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write('tEXt', 4, 'latin1')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([Buffer.from('tEXt', 'latin1'), data])), 8 + data.length)
  const end = png.length - 12
  return Buffer.concat([png.subarray(0, end), chunk, png.subarray(end)])
}

/** A JPEG's width and height, from its frame header. */
function jpegSize(b: Uint8Array): { width: number; height: number } {
  assert.deepEqual([b[0], b[1]], [0xff, 0xd8], 'a JPEG')
  for (let i = 2; i + 9 < b.length; ) {
    const marker = b[i + 1]!
    const length = (b[i + 2]! << 8) | b[i + 3]!
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: (b[i + 5]! << 8) | b[i + 6]!, width: (b[i + 7]! << 8) | b[i + 8]! }
    i += 2 + length
  }
  throw new Error('no frame header')
}

/** The rating pill under a profile's role, or its line, its parts as they read: 10.0 1 review. */
const lineOf = async (page: Page) =>
  (await page.locator('.ratepill > *, .rate-line').allTextContents())
    .map((t) => t.replace(/^· /, ''))
    .filter(Boolean)
    .join(' ')

/** A profile opened again and again from its card, so it reads the index each time, until its rating line says `text`. */
async function untilLine(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await page.locator('button.card', { hasText: card }).click()
    await page.locator('.ratepill, .rate-line').first().waitFor({ timeout: 10_000 })
    if ((await lineOf(page)).includes(text)) return
    if (Date.now() > until) throw new Error(`${card}'s rating line never said ${text}`)
    await button(page, 'Back').click()
    await button(page, 'You').click()
    await button(page, 'Home').click()
    await page.waitForTimeout(1_000)
  }
}

/** What a card says: its words, and the words of what it shows as a sign alone (its new-count, 3 new). */
const cardSays = (card: Locator, timeout = 10_000) => card.evaluate((el) => [el.textContent ?? '', ...[...el.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'))].join(' '), undefined, { timeout })

/** Home opened again and again, so it reads the index each time, until `card` says `text`. */
async function untilCard(page: Page, card: string, text: string) {
  const until = Date.now() + 90_000
  for (;;) {
    await button(page, 'You').click()
    await button(page, 'Home').click()
    const line = page.locator('button.card', { hasText: card })
    if ((await cardSays(line)).includes(text)) return line
    if (Date.now() > until) throw new Error(`${card} never said ${text}`)
    await page.waitForTimeout(1_000)
  }
}

before(async () => {
  const port = await freePort()
  APP = `http://app.forest.foundation:${port}/`
  OTHER = `http://other.forest.foundation:${port}/`
  services = await startServices({ appOrigin: APP.slice(0, -1), say })
  tiles = await standInTiles()
  mcpDir = mkdtempSync(join(tmpdir(), 'forest-app-mcp-'))
  mcp = await serve({ appUrl: `${APP}connect`, dataDir: mcpDir, read: { index: services.index }, hostFetch: fetch }, '127.0.0.1', 0)
  // The app's one config file, pointed at these services (src/config.ts) and the stand-in Didit's
  // page; ChatGPT with a page for adding Forest, so Connect your AI shows both ways: ChatGPT's page,
  // and Claude's Add manually; and company lines, so About Forest shows each.
  TESTER_ADDRESS = (await mainKey(TESTER, '')).address
  process.env.VITE_FOREST_CONFIG = JSON.stringify({ ...TEST_CONFIG, testAccounts: [TESTER_ADDRESS], app: APP.slice(0, -1), verifier: services.verifier, host: services.host, connector: mcp.origin, index: services.index, places: services.places, tiles: tiles.origin })
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir, emptyOutDir: true } })
  const renamed = { entryFileNames: 'assets/[name]-next-[hash].js', chunkFileNames: 'assets/[name]-next-[hash].js' }
  await build({ root: app, configFile: `${app}vite.config.ts`, logLevel: 'warn', build: { outDir: nextDir, emptyOutDir: true, rolldownOptions: { output: renamed } }, worker: { rolldownOptions: { output: renamed } } })
  // vercel.json's CSP, its connect-src and img-src naming these services in place of ours (test/build.test.ts checks it names ours).
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8'))
  const real: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  csp = real
    .split('; ')
    .map((d) =>
      d.startsWith('connect-src ')
        ? `connect-src 'self' ${services.verifier} ${services.host} ${mcp.origin} ${services.index} ${services.places} ${tiles.origin}`
        : d.startsWith('img-src ')
          ? d.replace('https://host.forest.foundation', services.host)
          : d.startsWith('frame-src ')
            ? d.replace('https://verifier.forest.foundation', services.verifier).replace('https://verify.didit.me', TEST_CONFIG.didit)
            : d,
    )
    .join('; ')
  server = await serveLikeVercel({ root: outDir, port, override: { 'Content-Security-Policy': csp } })
  // Chromium itself, not its headless shell, which does not take an insecure origin as secure; and WebAuthn wants a secure one.
  CHROME_ARGS = ['--host-resolver-rules=MAP *.forest.foundation 127.0.0.1', `--unsafely-treat-insecure-origin-as-secure=${[APP, OTHER].map((o) => o.slice(0, -1)).join(',')}`]
  browser = await chromium.launch({ channel: 'chromium', args: CHROME_ARGS })
  first = await phone({ located: true })
  say(`Chromium ${browser.version()}, the app at ${APP}, services' verifier at ${services.verifier}, host at ${services.host}, index at ${services.index} and mcp at ${mcp.origin}`)
})

after(async () => {
  await browser?.close()
  await server?.close()
  await mcp?.close()
  await tiles?.close()
  if (mcpDir) rmSync(mcpDir, { recursive: true, force: true })
  await services?.stop()
})

test("Start, on a device that knows no passkey: one cream Start, nothing asked first; nothing coming back, Start found nothing, in its place, with a back arrow; I already use Forest finding nothing, No passkey found; I'm new made the passkey for app.forest.foundation and opened Get verified", async () => {
  const { page, counts, cdp, authenticator } = first
  const res = await page.goto(APP)
  assert.equal(res?.headers()['content-security-policy'], csp, 'the page comes with the CSP')
  const start = button(page, 'Start')
  await start.waitFor()
  await page.waitForFunction(() => !document.querySelector('main.start button.cream')?.hasAttribute('disabled'))
  assert.deepEqual((await page.locator('main button').allTextContents()).map((t) => t.trim()), ['Start'], 'one button')
  assert.match((await start.getAttribute('class')) ?? '', /cream/)
  await page.getByRole('heading', { name: 'Forest' }).waitFor()
  assert.deepEqual(await page.locator('main.start h1').evaluate((h) => [h.textContent, h.querySelector('svg.wordmark')?.getAttribute('aria-label'), h.querySelectorAll('svg.wordmark path').length]), ['', 'Forest', 6], 'the name drawn, six letters, no font')
  assert.equal(counts.asserted + counts.created, 0, 'nothing asked')
  await shot(page, 'start')
  // Start asks for any passkey; nothing comes back (the browser's window closed, or none there, which it can't tell apart).
  await closeTheSheetOnce(page)
  await start.click()
  const nothing = page.getByRole('region', { name: 'Start found nothing' })
  await nothing.waitFor()
  assert.equal(await start.count(), 0, "in place of Start's button")
  await nothingFloats(page, 'Start found nothing')
  assert.deepEqual((await nothing.getByRole('button').allTextContents()).map((t) => t.trim()), ["I'm new", 'I already use Forest'])
  assert.match((await button(page, "I'm new").getAttribute('class')) ?? '', /cream/, 'white')
  assert.match((await button(page, 'I already use Forest').getAttribute('class')) ?? '', /ghost/, 'outlined')
  assert.equal(await page.getByRole('region', { name: 'First time here?' }).count(), 0, 'no First time here?')
  assert.equal(await page.locator('.unlock').count(), 0, 'no unlock icon on Start or what it says, where every button asks')
  const arrow = page.locator('main.start > .top').getByRole('button', { name: 'Back' })
  const at = (await arrow.boundingBox())!
  assert.ok(at.x < 40 && at.y < 60, `a back arrow, top left: ${JSON.stringify(at)}`)
  await shot(page, 'start-found-nothing')
  // Its back arrow: Start's button again, nothing asked.
  const before = counts.asserted + counts.created
  await arrow.click()
  await button(page, 'Start').waitFor()
  assert.equal(counts.asserted + counts.created, before, 'back asks nothing')
  // I already use Forest, finding nothing: No passkey found, the one door to the 24 words.
  await closeTheSheetOnce(page)
  await button(page, 'Start').click()
  await closeTheSheetOnce(page)
  await button(page, 'I already use Forest').click()
  const none = page.getByRole('region', { name: 'No passkey found' })
  await none.getByText('Try again with the device that has it, or type your 24 words.').waitFor()
  assert.deepEqual((await none.getByRole('button').allTextContents()).map((t) => t.trim()), ['Try again', 'Type my 24 words', 'Back'])
  assert.equal(await button(page, 'Try again').locator('[data-icon="qr-code"]').count(), 1, 'Try again, with its QR code')
  assert.match((await button(page, 'Type my 24 words').getAttribute('class')) ?? '', /ghost/)
  await nothingFloats(page, 'No passkey found')
  assert.equal(await page.locator('.unlock').count(), 0, 'and no unlock icon')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Try again's QR code, in its text color")
  assert.equal(counts.created, 0, 'nothing made')
  await shot(page, 'start-no-passkey')
  // Back, quietly under them: Start's button again, then I'm new makes the passkey, and Get verified.
  assert.match((await none.getByRole('button', { name: 'Back' }).getAttribute('class')) ?? '', /quiet/, 'quiet')
  const beforeBack = counts.asserted + counts.created
  await none.getByRole('button', { name: 'Back' }).click()
  await none.waitFor({ state: 'detached' })
  await button(page, 'Start').waitFor()
  assert.equal(counts.asserted + counts.created, beforeBack, 'Back asks nothing')
  await imNew(first)
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1)
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.deepEqual(credentials.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]])
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.folder', 'forest.passkeys'], 'the passkey known, not yet in use: no one is verified here yet; nothing noted of it, since this one sends no maker')
  assert.deepEqual(JSON.parse(local['forest.folder']!).labels, {}, 'its Profiles folder looked at, with no profile in it')
  await shot(page, 'verify')
  // Type: Figtree sets every word, the titles at 800, a little tight; no other font is fetched.
  const title = await page.getByRole('heading', { name: 'Get verified' }).evaluate((h) => [getComputedStyle(h).fontFamily, getComputedStyle(h).fontWeight, getComputedStyle(h).letterSpacing])
  assert.ok(title[0]!.startsWith('"Figtree Variable"') && title[1] === '800' && title[2] === '-0.75px', `the title in Figtree, 800, a little tight: ${title}`)
  assert.ok(await page.evaluate(() => document.fonts.check('800 30px "Figtree Variable"')), 'Figtree loaded')
  const fonts = await page.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).filter((n) => /\.(woff2?|ttf|otf)$/.test(n)))
  assert.ok(fonts.length > 0 && fonts.every((f) => /figtree/.test(f)), `only Figtree fetched: ${fonts}`)
  say("Start: one button, nothing asked first; Start found nothing; No passkey found; I'm new made it for app.forest.foundation, then Get verified")
})

test("Get verified: its two cards, Face then Face + ID, the price from the verifier; back to Start, which asks for the passkey made alone and goes straight back; a check in one box, never leaving the page: Before, the verifier's words and one tick, Didit's page framed, the × closing it at any step, a session kept opening at Checking once; on a laptop, the Start panel beside it, the box on the right", async () => {
  const { page, context, counts } = first
  // Get verified: its line, two cards, each its badge, the black square, its name and line, its
  // price at the right in ink, what it gives with a tick each, then its button, strong green, the
  // card's whole width; nothing under them.
  await page.getByText("So people know you're real.").waitFor()
  await cardOf(page, 'Face + ID').getByText('10× the credits').waitFor()
  const cards = await page.locator('.vcard').evaluateAll((b) => b.map((x) => [...x.querySelectorAll('.two > *, .price3 > *, .vlist > span, .vnote, :scope > button')].map((e) => e.textContent)))
  assert.deepEqual(cards, [
    ['Face', 'Quick start', 'Free', 'Free credits', 'Take a selfie'],
    ['Face + ID', 'Have an official ID in hand', '$5', 'one time', '10× the credits', 'Higher trust', 'Supports Forest', 'Verify with your ID'],
  ])
  assert.equal(await page.getByText(/selfie/i).count(), 1, "Face, never Selfie: the word only on its button, Take a selfie")
  assert.equal(await page.locator('.vcard .vlist [data-icon="check"]').count(), 4, 'a tick each')
  assert.equal(await page.locator('.vcard .vnote').count(), 0, 'no grey note above the button')
  for (const name of ['Face', 'Face + ID'] as const) {
    const [card, act] = [(await cardOf(page, name).boundingBox())!, (await checkCard(page, name).boundingBox())!]
    assert.ok(Math.abs(card.width - 32 - act.width) < 2, `${name}: its button the card's whole width`)
    assert.equal(await checkCard(page, name).evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(page, 'forest'), `${name}: strong green`)
  }
  assert.deepEqual(await page.locator('.price3 .d').evaluateAll((d) => d.map((x) => getComputedStyle(x).color)), [await tokenColor(page, 'ink'), await tokenColor(page, 'ink')], 'the prices in ink')
  // The stand-in Stripe's key is a test one (GET / says testPayments): one quiet line on the ID card, Stripe's test card.
  assert.deepEqual(await page.locator('.vcard .vtest').evaluateAll((l) => l.map((x) => [x.closest('.vcard')!.getAttribute('data-check'), x.textContent])), [['id', TEST_LINE]], 'the test line, on the ID card alone')
  assert.equal(await page.locator('.vcard .vtest').evaluate((x) => getComputedStyle(x).color), await muted(page), 'quiet')
  const prices = await page.locator('.price3').evaluateAll((p) => p.map((x) => { const box = x.getBoundingClientRect(); const d = x.querySelector('.d')!; return [Math.round(box.width), Math.round(box.right), getComputedStyle(d).fontSize] }))
  assert.deepEqual(prices[0], prices[1], 'Free and $5: one size and shape, one right edge')
  assert.equal(await page.locator('.notice').count(), 0, 'no warning')
  assert.equal(await page.locator('main [data-icon="fingerprint-simple"]').count(), 0, 'no unlock icon on a card')
  const ground = (token: string) =>
    page.evaluate((t) => {
      const span = document.body.appendChild(document.createElement('span'))
      span.style.background = `var(--${t})`
      const color = getComputedStyle(span).backgroundColor
      span.remove()
      return color
    }, token)
  const squares = await page.locator('.vcard .vico').evaluateAll((v) => v.map((x) => [getComputedStyle(x).backgroundColor, x.querySelector('svg')?.dataset.icon]))
  assert.deepEqual(squares, [
    [await ground('ink'), 'scan-smiley'],
    [await ground('ink'), 'identification-card'],
  ], "each card's square as its badge draws it: the black square")
  assert.equal(await page.locator('.vcards ~ button').count(), 0, 'nothing under the cards: What the checks keep is gone')
  assert.equal(await button(page, 'Continue').count(), 0, 'no Continue before a check is done')

  // Back to Start: this device knows the passkey now, so Start asks for it alone, and goes straight back to Get verified.
  await button(page, 'Back').click()
  await button(page, 'Start').waitFor()
  await shot(page, 'start-known')
  const asked = counts.asserted
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock, by the passkey made, and no question first')

  // The face check's box: a white card filling the screen under a round ×; Before, the verifier's
  // own words for it, scrolling, one tick unticked, Start working only once ticked, Terms · Privacy.
  const about = (await (await fetch(`${services.verifier}/`)).json()) as { face: { consent: string }; consent: string; agree: string; id: { cancelRight: string } }
  await checkCard(page, 'Face').click()
  const box = boxOf(page)
  await box.getByRole('heading', { name: 'Before your face check' }).waitFor()
  assert.equal(await box.locator('.consent').textContent(), about.face.consent, "the verifier's words for the face check, word for word")
  const tick = box.getByRole('checkbox')
  assert.equal(await tick.textContent(), about.agree, 'the one tick, the verifier\'s line')
  assert.equal(await tick.getAttribute('aria-checked'), 'false', 'unticked at first')
  const go = box.getByRole('button', { name: 'Start' })
  assert.ok(await go.isDisabled(), 'Start works once ticked')
  assert.deepEqual(await box.locator('.legal a').evaluateAll((a) => a.map((x) => [x.textContent, x.getAttribute('href'), x.getAttribute('target')])), [
    ['Terms', 'https://forest.foundation/terms', '_blank'],
    ['Privacy', 'https://forest.foundation/privacy', '_blank'],
  ])
  assert.equal(await go.locator('.unlock').count(), 0, 'the seed held: no unlock icon')
  const shell = (await page.locator('.box-shell').boundingBox())!
  assert.deepEqual([shell.x, shell.y, shell.width, shell.height], [0, 0, 390, 844], 'the box fills the screen')
  const x = page.locator('.box-shell').getByRole('button', { name: 'Close' })
  const xAt = (await x.boundingBox())!
  assert.ok(xAt.x < 30 && xAt.y < 40, `its round × at the top left: ${JSON.stringify(xAt)}`)
  await shot(page, 'box-before-face')
  // The × at Before: back to the cards, nothing opened.
  await x.click()
  await box.waitFor({ state: 'detached' })
  assert.equal((await kept(page))['forest.setup'] && JSON.parse((await kept(page))['forest.setup']!).session, undefined, 'no check opened')

  // Ticked and started: Didit's page framed in the box, with what a camera check needs; nothing asked, the seed held, and no tab opened.
  let unfinished = true
  await answer(context, `${services.verifier}/face/stamp`, 403, { error: 'not_approved' }, () => unfinished)
  const opened = context.pages().length
  const since = first.went.length
  const before = counts.asserted
  await checkCard(page, 'Face').click()
  await tick.click()
  assert.equal(await tick.getAttribute('aria-checked'), 'true')
  await go.click()
  const frame = box.locator('iframe')
  await frame.waitFor()
  assert.match((await frame.getAttribute('src'))!, /^https:\/\/fake-didit\.invalid\/session\//, "the session's page")
  assert.equal(await frame.getAttribute('allow'), 'camera; microphone; geolocation; clipboard-write; fullscreen; autoplay; encrypted-media; digital-credentials-get')
  await (await frameAt(page, 'https://fake-didit.invalid')).locator('h1').waitFor()
  assert.deepEqual(wentFrom(first, since), [['didit', true]], "Didit's page, framed in this tab")
  assert.equal(counts.asserted - before, 0, 'nothing asked: the seed held since Start')
  assert.equal(context.pages().length, opened, 'no tab opened')
  assert.equal(new URL(page.url()).pathname, '/id', 'the page never left')
  const session = JSON.parse((await kept(page))['forest.setup']!).session as string
  assert.ok(session, 'the check under way, kept')
  await shot(page, 'box-didit')
  // A message from anywhere but Didit's frame is nothing.
  await page.evaluate(() => postMessage({ type: 'didit:completed' }, '*'))
  await page.waitForTimeout(300)
  assert.equal(await frame.count(), 1, 'a message not from its frame changes nothing')
  // The × with Didit's page open: back to the cards, the check kept; tapped again, Checking once, then its page again.
  await x.click()
  await box.waitFor({ state: 'detached' })
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).session, session, 'still under way')
  await checkCard(page, 'Face').click()
  await frame.waitFor()
  assert.match((await frame.getAttribute('src'))!, new RegExp(session), 'the same session, picked up where it was')
  // didit:close_request closes the box.
  await diditSays(page, 'didit:close_request')
  await box.waitFor({ state: 'detached' })
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).session, session, 'and still under way')
  // Under way: Get verified's back to Start, and Start straight back to Get verified.
  await button(page, 'Back').click()
  await button(page, 'Start').click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  unfinished = false

  // On a laptop: the Start panel on the left, with the mark and the name drawn, and the screen beside it, 520px wide at most; the box over the right side alone.
  await page.setViewportSize({ width: 1280, height: 800 })
  const panel = page.locator('.setup-panel')
  await panel.waitFor()
  assert.equal(await panel.locator('svg.wordmark').getAttribute('aria-label'), 'Forest', 'the name, drawn')
  const [left, right] = [await panel.boundingBox(), await page.locator('.setup-main > main').boundingBox()]
  assert.ok(Math.abs(left!.width - 512) < 2, `the panel about 40% of the page: ${left!.width}`)
  assert.ok(right!.width - 40 <= 520, `the screen 520px wide at most: ${right!.width - 40}`)
  await shot(page, 'laptop-verify')
  await checkCard(page, 'Face + ID').click()
  await boxOf(page, 'id').getByRole('heading', { name: 'Before your ID check' }).waitFor()
  const wide = (await page.locator('.box-shell').boundingBox())!
  assert.ok(Math.abs(wide.x - 512) < 2 && Math.abs(wide.width - 768) < 2, `the box over the right side: ${JSON.stringify(wide)}`)
  assert.ok(await panel.isVisible(), 'the panel beside it')
  await shot(page, 'laptop-box-before-id')
  await page.locator('.box-shell').getByRole('button', { name: 'Close' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await panel.waitFor({ state: 'hidden' })
  assert.ok(await checkCard(page, 'Face').isVisible(), 'the same screen, its state kept through the resize')
  say("Get verified: Face, then Face + ID; back to Start and straight back; the face check's box: Before, Didit framed, the × and close_request; on a laptop, the panel and the box on the right")
})

test("the face check, in its box: Didit's page framed, didit:completed taking it away at once, Checking while the stamp is asked, then the card Verified, nothing asked again and the page never left; Continue, a link while the ID is still to do; Add a backup, once, its two cards and Later; Show my words, Your 24 recovery words, I wrote them down; then Your first profiles; the gift in the wallet, the stamp in the Profiles folder", async () => {
  const { page, context, counts } = first
  // The ID's box opened last, which dropped the face check's session: Before again, and a new session, Didit's page.
  let unfinished = true
  await answer(context, `${services.verifier}/face/stamp`, 403, { error: 'not_approved' }, () => unfinished)
  const asked = counts.asserted
  const opened = context.pages().length
  await checkCard(page, 'Face').click()
  await agreed(page)
  const box = boxOf(page)
  const frame = box.locator('iframe')
  await frame.waitFor({ timeout: 60_000 })
  // Didit says it's done: its page goes at once, so its own result never shows; Checking, the loader in the middle.
  await diditSays(page, 'didit:completed')
  await frame.waitFor({ state: 'detached' })
  await box.getByText('Checking', { exact: true }).waitFor()
  assert.equal(await box.locator('.loader').count(), 1, 'the loader')
  await shot(page, 'box-checking')
  unfinished = false
  // Back on Get verified: Face Verified on its mint chip and nothing else, no longer a tap; the ID as it was; Continue at the foot, a link, and no back.
  const face = cardOf(page, 'Face')
  await face.locator('.donechip').waitFor({ timeout: 60_000 })
  await box.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - asked, 0, 'nothing asked again: the seed held through the box')
  assert.equal(context.pages().length, opened, 'no tab opened')
  assert.deepEqual(await face.evaluate((c) => [c.querySelector('.two')!.textContent, c.querySelector('.donechip')!.textContent, getComputedStyle(c.querySelector('.donechip')!).backgroundColor, c.querySelectorAll('.price3, .vlist, button').length]), ['Face', 'Verified', await tokenColor(page, 'mint'), 0], 'shrunk to its badge and name: Verified on the soft green, and no button')
  assert.ok(await checkCard(page, 'Face + ID').isEnabled(), 'the ID still to do')
  assert.equal(await page.locator('.notice').count(), 0)
  assert.equal(await button(page, 'Back').count(), 0, 'no back: being verified is not undone')
  const continuing = button(page, 'Continue')
  await continuing.waitFor()
  assert.match((await continuing.getAttribute('class')) ?? '', /text-link/, 'an underlined link while the ID is still to do')
  await shot(page, 'verify-done')
  await laptopShot(page, 'laptop-verify-done')
  await continuing.click()

  // Add a backup: back, its title and line, two cards, Later under them.
  await page.getByRole('heading', { name: 'Add a backup' }).waitFor({ timeout: 60_000 })
  await page.getByText("If you lose your passkey, it's the only way back.").waitFor()
  const backups = await page.locator('.vcard').evaluateAll((c) => c.map((x) => [x.querySelector('.vico svg')?.getAttribute('data-icon'), ...[...x.querySelectorAll('.two > *, :scope > button')].map((e) => e.textContent), x.querySelector(':scope > button')!.className]))
  assert.deepEqual(backups, [
    ['key', 'Another passkey', 'Not where your first one is', 'Add a backup passkey', 'primary'],
    ['file-text', '24 recovery words', 'Written down on paper', 'Show my words', ''],
  ], "the virtual passkey names no maker: Not where your first one is")
  assert.equal(await button(page, 'Back').count(), 1)
  assert.match((await button(page, 'Later').getAttribute('class')) ?? '', /text-link/)
  await shot(page, 'backup')
  // Show my words: the passkey asked, even with the seed held; Your 24 recovery words, its line, three numbered columns, I wrote them down.
  const before = counts.asserted
  await button(page, 'Show my words').click()
  await page.getByRole('heading', { name: 'Your 24 recovery words' }).waitFor()
  assert.equal(counts.asserted - before, 1, 'asked afresh, though the seed is held')
  await page.getByText('Write them on paper, in order. Anyone with them can open your Forest.').waitFor()
  const words = page.getByRole('list', { name: 'Your 24 recovery words' }).locator('li')
  assert.equal(await words.count(), 24)
  assert.equal(await page.getByRole('list', { name: 'Your 24 recovery words' }).evaluate((l) => getComputedStyle(l).gridTemplateColumns.split(' ').length), 3, 'three columns')
  assert.deepEqual(await words.first().locator('.xs').textContent(), '1', 'numbered')
  await shot(page, 'words-setup')
  await button(page, 'I wrote them down').click()
  await page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  assert.equal((await kept(page))['forest.backupAsked'], 'true', 'setup never shows Add a backup again on this device')
  await shot(page, 'first-profiles')
  seed = await seedOn(page)
  const wallet = await mainKey(seed, '')
  const left = await balance(wallet.address)
  assert.ok(left > 9.9 && left < 10, `the gift's 10 credits in the wallet, less the Profiles folder's first write: ${left}`)
  const view = await readFolder([services.host], wallet.address, Date.now())
  assert.deepEqual(view.current.get('profile')?.entry.body, { hosts: [services.host] })
  const { identity } = await openingHalf(wallet.secret)
  const stamps = [...liveContent(view)].filter(([path]) => path.startsWith('stamp/'))
  assert.equal(stamps.length, 1)
  const body = stamps[0]![1].entry.body
  assert.ok(isLocked(body))
  const stamp = stampFromJson(JSON.parse((await openLocked(body, identity)).stamp as string))
  assert.equal(stamp.verifier, services.faceKey, "the stamp from the verifier's face key")
  const local = await kept(page)
  assert.deepEqual(Object.keys(local).sort(), ['forest.backupAsked', 'forest.counted', 'forest.folder', 'forest.passkey', 'forest.passkeys'])
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), [], 'nothing waits in this tab')
  assert.deepEqual(JSON.parse(local['forest.counted']!), ['face'], 'how the person is verified')
  assert.deepEqual(JSON.parse(local['forest.folder']!), { address: wallet.address, labels: {}, made: {} }, "the Profiles folder's address, never a key")
  for (const secret of [Buffer.from(seed).toString('hex'), Buffer.from(seed).toString('base64url'), String(stamp.signature.S)]) assert.ok(!JSON.stringify(local).includes(secret), 'nothing of the seed or the stamp kept')
  say(`verified: the stamp in the Profiles folder, the wallet at ${left} credits`)
})

test("Your first profiles: every market a tile, its color filling it, its round + at its top left, a search; a tile's roles in a sheet, each its avatar and Create; Create makes it there, nothing asked, its verification proven in the worker, the sheet staying, its row a ✓, the tile's ✓ and the role named; Continue, always; Connect your AI, its rolling lines, Add to ChatGPT and Add to Claude, Add manually's sheet and its steps; its back on to Home; the badge; its name; the ··· menu's Share profile hands out its page on the index; a role made, its ✓ opening it", async () => {
  const { page, counts } = first
  // Being verified can't be undone: no back; Continue at the foot, always, since profiles are optional.
  assert.equal(await button(page, 'Back').count(), 0, 'no back')
  assert.equal(await button(page, 'Continue').evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(page, 'forest'), 'Continue, strong green')
  // Every market a tile, live and beta alike, in the directory's order, two to a row: its color filling it, a soft dark fade
  // behind its words, its icon big and faint at the top right, cut by the tile's edge, its whole name in white at the
  // bottom left, large; nothing else: no Beta, no counts, no ticks.
  const tiles = page.locator('button.market-tile')
  const directory = MARKETS.directory.markets
  assert.deepEqual(await tileNames(page), directory.map((m) => marketWords(m.name)), 'one tile a market, in its words, in its order')
  assert.deepEqual(await tiles.evaluateAll((t) => t.map((x) => x.textContent)), directory.map((m) => marketWords(m.name)), 'its whole name, and nothing else')
  assert.equal(await tiles.locator('.chip, .beta, .count, .got, [data-icon="check"]').count(), 0, 'no Beta, no counts, no ✓ while none of its roles is the person\'s')
  assert.deepEqual(await tiles.locator('.tile-mark').evaluateAll((m) => [...new Set(m.map((x) => (x.querySelector('svg') as SVGElement).dataset.icon))]), ['plus'], 'a round + at each top left')
  const mark = (await tiles.first().locator('.tile-mark').boundingBox())!
  const first0 = (await tiles.first().boundingBox())!
  assert.ok(mark.x - first0.x < 16 && mark.y - first0.y < 16 && Math.abs(mark.width - mark.height) < 1, `round, at the top left: ${JSON.stringify(mark)}`)
  const drawn = await tiles.first().evaluate((t) => {
    const box = t.getBoundingClientRect()
    const icon = t.querySelector('svg, .letter')!
    const i = icon.getBoundingClientRect()
    const name = t.querySelector('.tile-name')!
    const n = name.getBoundingClientRect()
    const style = getComputedStyle(t)
    return {
      height: Math.round(box.height),
      radius: style.borderTopLeftRadius,
      cut: i.right > box.right && i.top < box.top,
      icon: [Math.round(i.width), getComputedStyle(icon).color],
      name: [box.bottom - n.bottom < 20, n.left - box.left < 20, getComputedStyle(name).color, getComputedStyle(name).fontSize, getComputedStyle(name).fontWeight],
      fade: style.backgroundImage.includes('linear-gradient'),
    }
  })
  assert.deepEqual(drawn, { height: 104, radius: '22px', cut: true, icon: [96, 'rgba(255, 255, 255, 0.28)'], name: [true, true, 'rgb(255, 255, 255)', '19px', '800'], fade: true }, 'about 104px, corners 22px; the icon 96px, white at 28%, cut by the edge at the top right; the name white at the bottom left, 19px at 800, over the fade')
  const lessonsTile = tile(page, TUTORING)
  const tutoring = await lessonsTile.evaluate((el) => ({ h: getComputedStyle(el).getPropertyValue('--h').trim(), ground: getComputedStyle(el).backgroundColor, icon: el.querySelector('svg')?.dataset.icon }))
  assert.deepEqual(tutoring, { h: colorOf(LESSONS), ground: rgbOf(colorOf(LESSONS)), icon: LESSONS_ICON ?? undefined }, "the market's color filling it, its icon")
  const [a, b] = [await tiles.nth(0).boundingBox(), await tiles.nth(1).boundingBox()]
  assert.equal(a!.y, b!.y, 'two to a row')
  assert.notEqual((await tiles.nth(2).boundingBox())!.y, a!.y, 'two, not three')
  // The search, over the markets' words and their roles': a word two markets' names share, then a role's word two markets share that no name holds.
  const said = (m: (typeof directory)[number]) => [marketWords(m.name), ...m.roles.map((r) => r.role)].join(' ').toLowerCase()
  const found = (word: string) => directory.filter((m) => said(m).includes(word)).map((m) => marketWords(m.name))
  const named = directory.flatMap((m) => m.name.split('-')).find((w, _, all) => all.filter((x) => x === w).length > 1)!
  await page.getByLabel('Search').fill(named)
  assert.deepEqual(await tileNames(page), found(named), 'the search narrows the markets')
  const role = directory.flatMap((m) => m.roles.map((r) => r.role)).find((r, _, all) => all.filter((x) => x === r).length > 1 && !directory.some((m) => m.name.includes(r.slice(0, 5))))!
  await page.getByLabel('Search').fill(role)
  assert.deepEqual(await tileNames(page), found(role), "and finds them by their roles' words")
  assert.ok(found(role).length > 1)
  await page.getByLabel('Search').fill('')
  await shot(page, 'first-profile-markets')
  // The tiles show no summary. A tile opens the market's roles in a sheet from the bottom: its icon, white on its color;
  // its name; one quiet line, Beta, for a beta market; then the market's own summary, in place of its description; each
  // role a row, its avatar and its name, and Create, in the strong green, its plus.
  const shopping = MARKETS.market(SHOP)!
  const { summary, description } = MARKETS.directory.markets.find((m) => m.name === SHOP)!
  assert.equal(await page.locator('.market-tile').getByText(summary).count(), 0, 'no summary on the tiles')
  await tile(page, SHOPPING).click()
  const roles = marketSheet(page, SHOPPING)
  await roles.getByRole('heading', { name: SHOPPING, level: 2 }).waitFor()
  const rose = (await page.locator('.sheet').boundingBox())!
  assert.ok(Math.abs(rose.y + rose.height - 844) < 2 && rose.width === 390, `a sheet from the bottom: ${JSON.stringify(rose)}`)
  assert.ok((await page.locator('.market-tile').count()) > 0, 'over the tiles, which stay')
  assert.deepEqual(await roles.locator('.market-icon').evaluate((m) => [m.querySelector('svg')?.dataset.icon ?? null, getComputedStyle(m).backgroundColor, getComputedStyle(m).color]), [MARKETS.market(SHOP)!.icon ?? null, rgbOf(colorOf(SHOP)), 'rgb(255, 255, 255)'], 'its icon, white on its color')
  assert.equal(await roles.locator('p.lead').textContent(), summary, 'its summary')
  if (description) assert.equal(await roles.getByText(description).count(), 0, 'not its description, which is for an AI')
  assert.equal(await roles.locator('p.lead').evaluate((p) => getComputedStyle(p).color), await muted(page), 'one quiet line')
  const beta = shopping.status === 'beta'
  assert.deepEqual(await roles.locator('.stack > p').allTextContents(), beta ? ['Beta', summary] : [summary], 'a beta market says Beta, one quiet line, before its summary')
  assert.equal(await roles.getByText('Beta: it works, at your own risk, and may change.', { exact: true }).count(), 0, 'the long line is the form\'s')
  assert.deepEqual(
    await roles.locator('.role-row').evaluateAll((r) => r.map((x) => [...x.children].map((c) => c.textContent))),
    shopping.roles.map((r) => ['', roleWords(r.role), 'Create']),
  )
  assert.deepEqual(await roles.locator('.role-row .av').evaluateAll((a) => a.map((x) => [x.classList.contains('look'), x.querySelector('svg')?.dataset.icon])), shopping.roles.map((r) => [r.listings !== 'offers', shopping.icon ?? undefined]), "each role's avatar, its market's icon, solid where it offers, light where it requests")
  const forest = await tokenColor(page, 'forest')
  assert.deepEqual(await roles.getByRole('button', create(S.seller)).evaluate((b) => [getComputedStyle(b).backgroundColor, (b.querySelector('.icon') as SVGElement).dataset.icon]), [forest, 'plus'], 'Create in the strong green, its plus: the seed is held, so no unlock icon')
  await shot(page, 'first-profile-roles')
  // On a laptop: the sheet centred on the setup's side, beside Start's panel (40% of the window), its round × at its top right.
  await page.setViewportSize({ width: 1280, height: 800 })
  const centred = (await page.locator('.sheet').boundingBox())!
  assert.ok(Math.abs(centred.x + centred.width / 2 - (512 + 768 / 2)) < 2 && Math.abs(centred.y + centred.height / 2 - 400) < 2, `centred on the setup's side: ${JSON.stringify(centred)}`)
  const sx = (await page.locator('.sheet .sheet-x').boundingBox())!
  assert.ok(centred.x + centred.width - (sx.x + sx.width) < 20 && sx.y - centred.y < 20, `its round × at its top right: ${JSON.stringify(sx)}`)
  await shot(page, 'laptop-market')
  await page.locator('.sheet .sheet-x').click()
  await roles.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 390, height: 844 })
  // A tap on the dimmed screen closes it too.
  await tile(page, SHOPPING).click()
  await roles.waitFor()
  await page.mouse.click(195, 40)
  await roles.waitFor({ state: 'detached' })
  // Create, in its row: the profile made right there, nothing asked, and the sheet stays, its row a round soft green ✓.
  const asked = counts.asserted
  const started = Date.now()
  await page.getByLabel('Search').fill(TUTORING.toLowerCase())
  await tile(page, TUTORING).click()
  const tutoringSheet = marketSheet(page, TUTORING)
  await tutoringSheet.getByRole('button', create(L.offer.role)).click()
  await tutoringSheet.locator('.role-row .loader').waitFor()
  await shot(page, 'making')
  const made1 = tutoringSheet.getByRole('button', { name: `Open ${L.offer.role}`, exact: true })
  await made1.waitFor({ timeout: 120_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held since the unlock at Start')
  assert.ok(await tutoringSheet.isVisible(), 'the sheet stays')
  say(`a profile made in ${((Date.now() - started) / 1000).toFixed(1)} s, its proof in the worker`)
  await page.keyboard.press('Escape')
  await tutoringSheet.waitFor({ state: 'detached' })
  // Its tile: a ✓ now, and the role named small under the market's.
  const madeTile = tile(page, TUTORING)
  assert.equal(await madeTile.getAttribute('aria-label'), `${TUTORING}${L.market.status === 'beta' ? ', beta' : ''}, yours: ${roleWords(L.offer.role)}`)
  assert.deepEqual(await madeTile.evaluate((t) => [(t.querySelector('.tile-mark svg') as SVGElement).dataset.icon, t.querySelector('.tile-roles')?.textContent]), ['check', roleWords(L.offer.role)])
  await shot(page, 'first-profiles-made')
  await page.getByLabel('Search').fill('')
  await button(page, 'Continue').click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor({ timeout: 60_000 })
  // Connect your AI: Ask your AI to, small and grey, and one green line at a time, big and bold, rolling up; at the foot,
  // Add to ChatGPT and Add to Claude side by side, both strong green, Add manually under them, outlined, then one small line.
  await page.getByText('Ask your AI to', { exact: true }).waitFor()
  const line = page.locator('.ask-line')
  const asks = ['find a tennis coach', 'sell my old bike', 'post me as a math tutor', 'find a plumber', 'find a city tour', 'hire a web developer']
  const firstLine = await line.textContent()
  assert.equal(firstLine, asks[0])
  assert.equal(await line.evaluate((l) => getComputedStyle(l).color), forest, 'green')
  await page.waitForFunction((was) => document.querySelector('.ask-line')?.textContent !== was, firstLine, { timeout: 5_000 })
  assert.equal(await line.textContent(), asks[1], 'rolling up, one at a time')
  const foot = page.locator('main .foot')
  assert.deepEqual((await foot.getByRole('button').allTextContents()).map((t) => t.trim()), ['Add to ChatGPT', 'Add to Claude', 'Add manually'])
  const [gpt, claude, manually] = await Promise.all(['Add to ChatGPT', 'Add to Claude', 'Add manually'].map(async (n) => (await button(page, n).boundingBox())!))
  assert.ok(gpt.y === claude.y && gpt.x < claude.x, 'side by side')
  assert.ok(manually.y > gpt.y && Math.abs(manually.width - (claude.x + claude.width - gpt.x)) < 2, 'Add manually under them, the whole width')
  for (const n of ['Add to ChatGPT', 'Add to Claude']) assert.equal(await button(page, n).evaluate((b) => getComputedStyle(b).backgroundColor), forest, `${n}: strong green`)
  await foot.getByText("Forest can't see your chats or memory.").waitFor()
  assert.equal(await page.getByRole('group', { name: 'AI app' }).count(), 0, 'no Claude, ChatGPT and Other choice')
  await shot(page, 'connect-ai')
  await laptopShot(page, 'laptop-connect-ai')
  // Add to ChatGPT: the page config names for it, in a new tab.
  const [gptPage] = await Promise.all([page.context().waitForEvent('page'), button(page, 'Add to ChatGPT').click()])
  assert.equal(gptPage.url(), TEST_CONFIG.addPages.ChatGPT)
  await gptPage.close()
  // Add to Claude, whose page config doesn't name: Add manually, its four steps, the address in a grey pill with its round copy button.
  await button(page, 'Add to Claude').click()
  const manual = page.getByRole('dialog', { name: 'Add Forest to any AI' })
  await manual.getByRole('heading', { name: 'Add Forest to any AI' }).waitFor()
  assert.deepEqual(await manual.locator('ol.steps > li').allTextContents(), [
    "1In your AI's settings, open Connectors or Plugins and add a custom one.",
    `2Name it Forest. As its server URL, paste:${mcp.origin}`,
    '3If it asks how to sign in, choose to sign in.',
    '4When Forest opens, pick your profiles and accept.',
  ])
  assert.deepEqual(await manual.locator('ol.steps strong').allTextContents(), ['Connectors', 'Plugins', 'Forest'], 'in bold')
  await manual.getByRole('button', { name: 'Copy' }).click()
  await manual.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), mcp.origin, 'the address shown, in full')
  await shot(page, 'connect-ai-manually')
  await page.keyboard.press('Escape')
  await manual.waitFor({ state: 'detached' })
  await button(page, 'Add manually').click()
  await manual.waitFor()
  await page.keyboard.press('Escape')
  // Back, in setup, on to Home: a profile made can't be undone.
  await button(page, 'Back').click()
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await badge(page.getByRole('heading', { name: TUTOR_WORDS })).waitFor()
  // The header, on a tint of the market's color, its bottom corners rounded: the market, big, in the titles' face; the role,
  // small; its badges right after the role; under them, its rating pill, here No reviews yet, which still opens its
  // Reviews. At the top right, its messages, always there, with no mark while nothing is new, then Share, each round with its
  // own icon. No tabs, no description, no pencil: its offers, here none, quiet, and New offer at the foot, its plus.
  const head = page.locator('.profile-head')
  const parts = await head.locator('.ph2').evaluate((el) => {
    const [mk, rl] = [el.querySelector('.mk')!, el.querySelector('.rl')!]
    return { market: [mk.textContent, getComputedStyle(mk).fontSize, getComputedStyle(mk).fontFamily.includes('Figtree') && getComputedStyle(mk).fontWeight === '800'], role: [rl.firstChild?.textContent, getComputedStyle(rl).fontSize], badges: [...rl.querySelectorAll('.vb')].map((b) => (b as HTMLElement).dataset.check) }
  })
  assert.deepEqual(parts, { market: [TUTORING, '28px', true], role: [roleWords(L.offer.role), '15px'], badges: ['face'] }, 'the market big, the role small, the badge after it')
  assert.equal(await head.evaluate((h) => getComputedStyle(h).borderBottomLeftRadius), '30px', 'its bottom corners rounded')
  assert.equal(await head.evaluate((h) => (h as HTMLElement).style.getPropertyValue('--h')), colorOf(LESSONS), "a tint of its market's color")
  await head.locator('button.ratepill', { hasText: 'No reviews yet' }).waitFor()
  assert.equal(await head.locator('button.ratepill [data-icon="caret-right"]').count(), 0, 'no caret: the pill opens what it shows')
  assert.equal(await page.getByRole('tab').count(), 0, 'no tabs')
  await page.locator('main p.none', { hasText: 'No offers yet' }).waitFor()
  assert.equal(await page.locator('main [data-icon="pencil-simple"]').count(), 0, 'no pencil')
  assert.equal(await button(page, 'New offer').locator('.icon').getAttribute('data-icon'), 'plus')
  assert.deepEqual(await page.locator('.top-right > button, .top-right .more > button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label'))), ['Messages', 'More'])
  assert.deepEqual(await page.locator('.top-right > button .icon, .top-right .more > button .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['chat-circle', 'dots-three'])
  assert.deepEqual([await inbox(page).locator('.icon').count(), await inbox(page).locator('.corner').count(), await inbox(page).locator('.unlock').count()], [1, 0, 0], 'its own icon, no mark, no fingerprint')
  // Its avatar, solid: a tutor offers; one of the person's own, so its market's icon, never an animal, white on its market's color; and the selfie check's badge.
  const tutorIcon = iconOf(LESSONS)
  assert.ok(tutorIcon, "a market the shared table names")
  assert.deepEqual(await avatarOf(page.locator('.titled .av')), { light: false, h: colorOf(LESSONS), ground: rgbOf(colorOf(LESSONS)), icon: tutorIcon }, "its market's icon, white on its color")
  assert.deepEqual(await drawnAs(badge(page.getByRole('heading', { name: TUTOR_WORDS }))), SELFIE, "the face check's badge, a face being scanned: the black square, its icon in the ground")
  await shot(page, 'profile')
  const main = await mainKey(seed, TUTOR_LABEL)
  tutor = main.address
  const body = (await readFolder([services.host], tutor, Date.now())).current.get('profile')?.entry.body
  assert.deepEqual([body?.market, body?.role, body?.hosts], [LESSONS, L.offer.role, [services.host]])
  const check = verificationCheck(proofsOf(body).find((p) => p.circuit === 'verification'), tutor)
  assert.ok(check && (await checkVerification(check)), 'its verification checks, as any reader checks it')
  // Its ···: a small menu under it, Share profile and Delete profile, red; a tap outside closes it.
  const more = button(page, 'More')
  await more.click()
  const menu = page.getByRole('menu')
  assert.deepEqual(await menu.getByRole('menuitem').evaluateAll((m) => m.map((x) => [x.textContent, x.classList.contains('danger')])), [['Share profile', false], ['Delete profile', true]])
  const [moreAt, menuAt] = [(await more.boundingBox())!, (await menu.boundingBox())!]
  assert.ok(menuAt.y >= moreAt.y + moreAt.height && menuAt.y - (moreAt.y + moreAt.height) < 12, `under it: ${JSON.stringify([moreAt, menuAt])}`)
  await shot(page, 'profile-menu')
  await page.mouse.click(195, 600)
  await menu.waitFor({ state: 'detached' })
  // Share profile: the profile's page on the index. Here, as on most laptops, there is no share sheet, so its link is copied.
  const onTheIndex = `${services.index}/profiles/${tutor}`
  await page.evaluate(() => delete (Navigator.prototype as { share?: unknown }).share)
  await more.click()
  await page.getByRole('menuitem', { name: 'Share profile' }).click()
  await button(page, 'Copied').waitFor()
  assert.equal(await button(page, 'Copied').locator('.icon').getAttribute('data-icon'), 'check')
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), onTheIndex, "the profile's page on the index")
  await shot(page, 'profile-copied')
  // Where there is a share sheet, as on a phone, the sheet gets the page's link, and only that.
  await page.evaluate(() => void ((navigator as { share?: unknown }).share = async (data: ShareData) => void ((globalThis as { shared?: ShareData }).shared = data)))
  await button(page, 'More').click({ timeout: 5_000 })
  await page.getByRole('menuitem', { name: 'Share profile' }).click()
  assert.deepEqual(await page.waitForFunction(() => (globalThis as { shared?: ShareData }).shared).then((h) => h.jsonValue()), { url: onTheIndex })
  await button(page, 'Back').click()
  const card = page.locator('button.card', { hasText: TUTOR_WORDS })
  await card.waitFor()
  await cardNamed(card, TUTORING, L.offer.role)
  assert.equal(await card.locator('.vb').count(), 0, "no badge on the card: the person's badges are beside the title")
  assert.deepEqual([(await avatarOf(card.locator('.av'))).h, (await avatarOf(card.locator('.av'))).icon], [colorOf(LESSONS), tutorIcon], "its avatar: its market's icon, on its color")
  await card.locator('.rt2', { hasText: 'No reviews' }).waitFor()
  assert.deepEqual([await card.locator('.corner').count(), await card.locator('[data-icon="caret-right"]').count()], [0, 0], 'nothing new, no mark; no caret')
  assert.deepEqual(JSON.parse((await kept(page))['forest.profiles']!), [{ label: TUTOR_LABEL, address: tutor }])
  // At the top of Home, the mark and Search Forest, the index in a new tab; no Messages button: they open from Notifications.
  const search = page.getByRole('link', { name: 'Search Forest' })
  assert.deepEqual([await search.getAttribute('href'), await search.getAttribute('target')], [services.index, '_blank'])
  assert.equal(await inbox(page).count(), 0, 'no Messages on Home')
  assert.deepEqual(await page.locator('.tabbar button').allTextContents(), ['Home', 'Messages', 'You'])
  assert.equal(await page.locator('.tabbar button[aria-current="page"] .icon').getAttribute('data-icon'), 'house')
  // One search, Search Forest; New, a small strong green pill with its +, at the right of Profiles, Home's one action; the
  // person's badges beside the title on a phone too; nothing floating, no dashed card.
  assert.deepEqual([await page.getByRole('searchbox').count(), await page.locator('.addcard').count()], [0, 0], 'no search of their own profiles, no dashed card')
  const newPill = page.locator('main.home .titled > button.new-pill')
  const [mainBox, pillBox] = [(await page.locator('main.home').boundingBox())!, (await newPill.boundingBox())!]
  assert.ok(mainBox.x + mainBox.width - (pillBox.x + pillBox.width) < 30, `at the title's right: ${JSON.stringify(pillBox)}`)
  assert.deepEqual(await newPill.evaluate((b) => [b.getAttribute('aria-label'), b.textContent, getComputedStyle(b).borderRadius, getComputedStyle(b).backgroundColor, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['New profile', 'New', '999px', await tokenColor(page, 'forest'), 'plus'], "a pill, strong green, Home's one action, its plus")
  const phoneBadges = page.getByRole('group', { name: "How you're verified" })
  assert.deepEqual([await drawnAs(badge(phoneBadges)), await phoneBadges.getByRole('button', { name: 'Verify with Face + ID' }).count(), await page.locator('button.fab').count()], [SELFIE, 1, 0], 'the badges beside the title on a phone too, the ID dashed; nothing floating')
  await shot(page, 'home')
  // On a laptop, beside Your profiles, the person's badges, once: the face check's, its words its label and its title; the ID's
  // not done, its outline, dashed and muted, a button that opens Get verified: Face Verified, the ID to do, Back and no
  // Continue; and back, Home.
  await page.setViewportSize({ width: 1280, height: 800 })
  // The laptop's layout in place of the phone's, which had its badges too: the sidebar first.
  await page.locator('aside.side').waitFor()
  const badges = page.locator('main.home').getByRole('group', { name: "How you're verified" })
  await badge(badges).waitFor()
  assert.deepEqual(await drawnAs(badge(badges)), SELFIE, "the face check's badge")
  assert.equal(await badge(badges).getAttribute('title'), 'Verified with Face')
  const outline = badges.getByRole('button', { name: 'Verify with Face + ID' })
  assert.deepEqual(await outline.evaluate((b) => [getComputedStyle(b).borderTopStyle, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['dashed', 'identification-card'], "the ID's outline, dashed")
  assert.equal(await outline.evaluate((b) => getComputedStyle(b).color), await muted(page), 'muted')
  await outline.click()
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await page.locator('.vcard[data-check="face"] .donechip').waitFor()
  assert.ok(await checkCard(page, 'Face + ID').isEnabled(), 'the ID to do')
  await nothingFloats(page, 'no sheet')
  assert.deepEqual([await button(page, 'Continue').count(), await button(page, 'Back').count()], [0, 1], 'Back, no Continue')
  await button(page, 'Back').click()
  await badges.waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await card.click()
  const title = page.getByRole('heading', { name: TUTOR_WORDS })
  await title.waitFor()
  // On the profile's header, its badge stands alone: a tap says its words for a moment.
  await badge(title).click()
  await page.getByText('Verified with Face', { exact: true }).waitFor()
  await shot(page, 'profile-badge-tapped')
  await page.getByText('Verified with Face', { exact: true }).waitFor({ state: 'detached' })
  await button(page, 'Back').click()
  // On New profile, with a back arrow: a role made shows its round ✓ on the soft green, which opens it; one not made holds
  // Create, in the strong green, which acts.
  await button(page, 'New profile').click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  assert.equal(await button(page, 'Back').count(), 1, 'a back arrow')
  assert.equal(await button(page, 'Continue').count(), 0, 'no Continue past setup')
  await tile(page, TUTORING).click()
  const tutoringRoles = marketSheet(page, TUTORING)
  assert.deepEqual(await tutoringRoles.locator('.role-row strong').allTextContents(), L.market.roles.map((r) => roleWords(r.role)), 'every role')
  const yours = tutoringRoles.getByRole('button', { name: `Open ${L.offer.role}`, exact: true })
  const [soft, strong] = await page.evaluate(() => {
    const probe = document.body.appendChild(document.createElement('span'))
    probe.style.background = 'var(--mint)'
    probe.style.color = 'var(--forest)'
    const out = [getComputedStyle(probe).backgroundColor, getComputedStyle(probe).color]
    probe.remove()
    return out
  })
  assert.deepEqual(await yours.evaluate((g) => [getComputedStyle(g).backgroundColor, getComputedStyle(g).color, (g.querySelector('svg') as SVGElement).dataset.icon, getComputedStyle(g).borderRadius]), [soft, strong, 'check', '50%'], 'a round ✓, on the soft green')
  assert.equal(await tutoringRoles.getByRole('button', create(L.request.role)).evaluate((b) => getComputedStyle(b).backgroundColor), strong, 'Create in the strong green, which acts')
  await shot(page, 'new-profile-made')
  const asked2 = counts.asserted
  await yours.click()
  await badge(page.getByRole('heading', { name: TUTOR_WORDS })).waitFor()
  assert.equal(counts.asserted - asked2, 0, 'opened, nothing unlocked')
  // Back: New profile, the sheet its ✓ was in open again; closed, Back goes Home.
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await tutoringRoles.getByRole('button', { name: `Open ${L.offer.role}`, exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await tutoringRoles.waitFor({ state: 'detached' })
  await button(page, 'Back').click()
  await card.waitFor()
})

test("You: its badges beside it, the face check's black square and the ID's outline, dashed; Your checks, Your AI, Passkeys, Email and About Forest, each its icon, detail and caret, Your checks a page of its own, Face alone there, no price; then Appearance switching in place; About Forest's rows, its company lines, Privacy framed, Your data's four blocks; Forget this device in red, asking again in place; on a laptop, the sidebar in place of the tabs, its first line the mark and the search, its place on the soft green, its outlined + New beside Profiles", async () => {
  const { page } = first
  await button(page, 'You').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  // You, with both check badges beside it: the face check's done, its black square; the ID's not, its outline, dashed, a tap
  // opening Get verified.
  const badges = page.locator('main .top').getByRole('group', { name: "How you're verified" })
  await badge(badges).waitFor()
  assert.deepEqual(await drawnAs(badge(badges)), SELFIE, "the face check's badge, beside You")
  assert.deepEqual(await badges.getByRole('button', { name: 'Verify with Face + ID' }).evaluate((b) => [getComputedStyle(b).borderTopStyle, (b.querySelector('.icon') as SVGElement).dataset.icon]), ['dashed', 'identification-card'], "the ID's outline, dashed")
  const tone = (token: string) =>
    page.evaluate((t) => {
      const span = document.body.appendChild(document.createElement('span'))
      span.style.background = `var(--${t})`
      const color = getComputedStyle(span).backgroundColor
      span.remove()
      return color
    }, token)
  // Then one card of settings rows, each its icon, its name, its detail under it, and a caret, since it opens a page: Your
  // checks, what the person holds; Your AI, Not yet; Passkeys, their names, the main one first; Email, Off; About Forest; last,
  // Appearance. No verification card.
  await page.locator('button.row', { hasText: 'Passkeys' }).locator('.two > span').waitFor()
  assert.deepEqual(await page.locator('main .rows > .row strong').allTextContents(), ['Your checks', 'Your AI', 'Passkeys', 'Email', 'About Forest', 'Appearance'])
  assert.deepEqual(
    await page.locator('main .rows > button.row').evaluateAll((r) => r.map((x) => [x.querySelector('strong')!.textContent, x.querySelector('.two > span')?.textContent ?? null, !!x.querySelector('.sq [data-icon]'), !!x.querySelector('[data-icon="caret-right"]')])),
    [
      ['Your checks', 'Face', true, true],
      ['Your AI', 'Not yet', true, true],
      ['Passkeys', 'Passkey', true, true],
      ['Email', 'Off', true, true],
      ['About Forest', null, true, true],
    ],
    'each its icon, its name, its detail and a caret',
  )
  assert.equal(await page.getByRole('group', { name: 'Verified', exact: true }).count(), 0, 'no verification card')
  assert.equal(await page.getByText('Selfie', { exact: true }).count(), 0, 'Face, never Selfie')
  // Your checks, a page of its own: one card, Face, its badge, no caret, which doesn't open; nothing for a check not held, no price.
  await page.locator('button.row', { hasText: 'Your checks' }).click()
  await page.getByRole('heading', { name: 'Your checks' }).waitFor()
  const checkRows = page.locator('main .rows > .row')
  assert.deepEqual(await checkRows.evaluateAll((r) => r.map((x) => [x.tagName, x.textContent, !!x.querySelector('[data-icon="caret-right"]')])), [['DIV', 'Face', false]])
  assert.equal(await checkRows.nth(0).locator('.sq.ink [data-icon="scan-smiley"]').count(), 1, "the face check's badge, its black square")
  assert.equal(await checkRows.nth(0).locator('.sq.ink').evaluate((q) => getComputedStyle(q).backgroundColor), await tone('ink'), 'black')
  assert.equal(await page.getByText('$5').count(), 0, 'no prices')
  await nothingFloats(page, 'Your checks')
  await shot(page, 'your-checks')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  const forget = button(page, 'Forget this device')
  assert.deepEqual(await forget.evaluate((b) => [getComputedStyle(b).color, (b.querySelector('.icon') as SVGElement).dataset.icon]), [await page.evaluate(() => {
    const span = document.body.appendChild(document.createElement('span'))
    span.style.color = 'var(--danger)'
    const color = getComputedStyle(span).color
    span.remove()
    return color
  }), 'sign-out'], 'Forget this device, red text with its icon')
  await shot(page, 'you')
  // Forget this device asks again, in its own place: the question, its line, Cancel and Forget; Cancel, and the button is back.
  await forget.click()
  const forgetting = page.getByRole('group', { name: 'Forget this device?' })
  await forgetting.getByText('Your passkey stays in your password manager.', { exact: true }).waitFor()
  assert.deepEqual((await forgetting.getByRole('button').allTextContents()).map((t) => t.trim()), ['Cancel', 'Forget'])
  assert.match((await forgetting.getByRole('button', { name: 'Forget' }).getAttribute('class')) ?? '', /danger solid/)
  await nothingFloats(page, 'Forget this device?')
  await forgetting.getByRole('button', { name: 'Cancel' }).click()
  await forget.waitFor()
  // Appearance, the last row: three icon buttons at its right, Auto, Light and Dark, each named for screen readers; a tap
  // applies it at once, in place, nothing opening; kept through a reload.
  const looks = page.getByRole('group', { name: 'Appearance' })
  const look = (name: string) => looks.getByRole('button', { name, exact: true })
  assert.deepEqual(await looks.getByRole('button').evaluateAll((b) => b.map((x) => [x.getAttribute('aria-label'), x.textContent, x.querySelector('svg')?.dataset.icon])), [
    ['Auto', '', 'circle-half'],
    ['Light', '', 'sun'],
    ['Dark', '', 'moon'],
  ], 'three icons, each its name for screen readers')
  assert.equal(await look('Auto').getAttribute('aria-pressed'), 'true')
  await shot(page, 'appearance')
  await look('Dark').click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'at once')
  assert.equal(await look('Dark').getAttribute('aria-pressed'), 'true')
  await nothingFloats(page, 'Appearance')
  await shot(page, 'appearance-dark')
  await page.reload()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'kept, and back on You after a reload')
  assert.equal(await look('Dark').getAttribute('aria-pressed'), 'true')
  await look('Light').click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light')
  await look('Auto').click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), undefined)
  // About Forest: one card, Your data, Privacy and Terms, each a page with its caret, and Source code in a new tab; under it,
  // the mark, then each company line config sets, small and grey, and the contact, a mailto link; no version line.
  await page.locator('button.row', { hasText: 'About Forest' }).click()
  await page.getByRole('heading', { name: 'About Forest' }).waitFor()
  assert.deepEqual(await page.locator('main .rows > .row').evaluateAll((r) => r.map((x) => [x.textContent, x.querySelector('svg')?.dataset.icon, x.getAttribute('href'), x.getAttribute('target')])), [
    ['Your data', 'caret-right', null, null],
    ['Privacy', 'caret-right', null, null],
    ['Terms', 'caret-right', null, null],
    ['Source code', 'arrow-up-right', 'https://github.com/foundationforest/app', '_blank'],
  ])
  const company = page.locator('.company')
  assert.deepEqual(await company.locator(':scope > :not(svg)').allTextContents(), ['Open Forest Test', 'Registered in Testland, No. 0001', '1 Test Street, Testville', 'support@forest.foundation'])
  assert.equal(await company.getByRole('link', { name: 'support@forest.foundation' }).getAttribute('href'), 'mailto:support@forest.foundation')
  assert.equal(await company.locator('.mark').count(), 1, 'the mark')
  assert.equal(await company.evaluate((c) => getComputedStyle(c).color), await muted(page), 'small and grey')
  assert.equal(await page.getByText(/^Version /).count(), 0, 'no version line')
  assert.equal(await page.locator('main .rows').getByText('Contact').count(), 0, 'no Contact row')
  await shot(page, 'about')
  // Privacy: a page of its own, its address small and grey under its title, the site's page framed below, filling the rest.
  await page.locator('button.row', { hasText: 'Privacy' }).click()
  await page.getByRole('heading', { name: 'Privacy' }).waitFor()
  await page.getByText('forest.foundation/privacy', { exact: true }).waitFor()
  const framed = page.locator('main.framed-page iframe')
  assert.equal(await framed.getAttribute('src'), 'https://forest.foundation/privacy')
  await (await frameAt(page, 'https://forest.foundation/privacy')).locator('h1').waitFor()
  const [frameBox, view] = [(await framed.boundingBox())!, page.viewportSize()!]
  assert.ok(view.height - (frameBox.y + frameBox.height) < 120, `filling the rest: ${JSON.stringify(frameBox)}`)
  await shot(page, 'privacy')
  await button(page, 'Back').click()
  await page.locator('button.row', { hasText: 'Terms' }).click()
  assert.equal(await page.locator('main.framed-page iframe').getAttribute('src'), 'https://forest.foundation/terms')
  await button(page, 'Back').click()
  // Your data: four blocks, each an icon in a soft square, a bold title and its words.
  await page.locator('button.row', { hasText: 'Your data' }).click()
  await page.getByRole('heading', { name: 'Your data' }).waitFor()
  assert.deepEqual(await page.locator('.data-block').evaluateAll((b) => b.map((x) => [x.querySelector('svg')?.dataset.icon, x.querySelector('strong')!.textContent, x.querySelector('.two > span')!.textContent])), [
    ['user', 'Public', 'Your profiles, listings and reviews. Anyone can see them.'],
    ['lock-simple', 'Private', 'Encrypted with your passkey. Only you, and whoever you let in, can read it.'],
    ['shield-check', 'Kept apart', 'No one can tell your profiles belong to the same person.'],
    ['identification-card', 'Your checks', "We only keep what's necessary to stop someone verifying twice."],
  ])
  await shot(page, 'your-data')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'About Forest' }).waitFor()
  await button(page, 'Back').click()
  // Your AI: none yet, then Connect another, which opens Connect your AI, with a back and no Skip.
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  await button(page, 'Connect another').click()
  await page.getByRole('heading', { name: 'Connect your AI' }).waitFor()
  assert.deepEqual((await page.locator('main .foot').getByRole('button').allTextContents()).map((t) => t.trim()), ['Add to ChatGPT', 'Add to Claude', 'Add manually'], 'no Skip')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  // On a laptop: no tabs; the sidebar, its places and the profiles, beside every screen. Its first line: the mark alone, a
  // link to Home, and Search Forest beside it, filling the rest; no name. The place where the person is on the soft green.
  // Profiles with a small outlined + New at its right, which opens New profile; no New profile row, no AI card.
  await page.setViewportSize({ width: 1280, height: 800 })
  const side = page.locator('aside.side')
  await side.waitFor()
  assert.equal(await page.locator('.tabbar').count(), 0, 'no tabs')
  const firstLine = await side.locator('.brand').evaluate((b) => {
    const [mark, search] = [b.querySelector('button.mark-home')!, b.querySelector('.search')!]
    const [m, q, line] = [mark.getBoundingClientRect(), search.getBoundingClientRect(), b.getBoundingClientRect()]
    return { mark: mark.getAttribute('aria-label'), drawn: !!mark.querySelector('svg'), search: search.textContent, oneLine: Math.abs(m.top + m.height / 2 - (q.top + q.height / 2)) < 2, fills: Math.round(line.right - q.right) <= 4, name: b.querySelectorAll('.wordmark').length }
  })
  assert.deepEqual(firstLine, { mark: 'Forest home', drawn: true, search: 'Search Forest', oneLine: true, fills: true, name: 0 }, 'the mark, a link to Home, then the search, filling the line; no name')
  assert.equal(await side.locator('button[aria-current="page"]').evaluate((b) => getComputedStyle(b).backgroundColor), await tone('mint'), 'where the person is, on the soft green')
  assert.deepEqual(await side.getByRole('navigation', { name: 'Places' }).getByRole('button').allTextContents(), ['Home', 'Messages', 'You'])
  assert.equal(await side.locator('button[aria-current="page"]').textContent(), 'You')
  const row = side.getByRole('button', { name: TUTOR_WORDS })
  assert.deepEqual([(await avatarOf(row.locator('.av.sm'))).h, (await avatarOf(row.locator('.av.sm'))).icon], [colorOf(LESSONS), iconOf(LESSONS)], "its market's icon, as on its card")
  const plus = side.locator('.side-head').getByRole('button', { name: 'New profile' })
  assert.deepEqual(await plus.evaluate((b) => [b.textContent, (b.querySelector('.icon') as SVGElement).dataset.icon, b.getBoundingClientRect().height]), ['New', 'plus', 28], 'a small New pill, its plus, beside Profiles')
  assert.deepEqual(await plus.evaluate((b) => [getComputedStyle(b).backgroundColor, getComputedStyle(b).boxShadow]), ['rgba(0, 0, 0, 0)', `${await tokenColor(page, 'ink')} 0px 0px 0px 1.5px inset`], 'outlined in ink, on what is behind it: white is for cards')
  assert.equal(await side.getByRole('button', { name: 'New profile' }).count(), 1, 'and no New profile row')
  assert.equal(await side.locator('.ai-app, [data-icon="sparkle"]').count(), 0, 'no AI card')
  await shot(page, 'laptop-you')
  // Appearance, on a laptop: the same, in place, at its row's right.
  await look('Dark').click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  await nothingFloats(page, 'Appearance, on a laptop')
  await shot(page, 'laptop-appearance')
  await look('Auto').click()
  await plus.click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await row.click()
  await page.getByRole('heading', { name: TUTOR_WORDS }).waitFor()
  assert.equal(await side.locator('button[aria-current="page"]').textContent(), TUTOR_WORDS, 'the profile, selected')
  await side.getByRole('button', { name: 'Home', exact: true }).click()
  await homeTitle(page).waitFor()
  assert.equal(await page.locator('main .search').count(), 0, 'Search Forest in the sidebar, not on Home')
  // New profile at the top right of Home, in the row of its title; nothing floating.
  const newOne = page.locator('main .titled').getByRole('button', { name: 'New profile' })
  const [newBox, mainBox] = [(await newOne.boundingBox())!, (await page.locator('main.home').boundingBox())!]
  assert.ok(mainBox.x + mainBox.width - (newBox.x + newBox.width) < 40, `at the right: ${JSON.stringify(newBox)}`)
  assert.equal(await newOne.evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(page, 'forest'), "strong green, Home's one action")
  assert.equal(await page.locator('button.fab').count(), 0, 'nothing floating on a laptop')
  await shot(page, 'laptop-home')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.tabbar').waitFor()
  assert.equal(await page.locator('aside.side').count(), 0, 'no sidebar on a phone')
})

const ASK = 'Is Tuesday at six free?'
const YES = 'Tuesday at six, yes.'
const OFFER = 'Maths for secondary school, one hour online.'

/** The live entries of a folder under `kind/`, as the host serves it now. */
const entriesOf = async (address: string, kind: string) => [...liveContent(await readFolder([services.host], address, Date.now()))].filter(([path]) => path.startsWith(`${kind}/`))

test('two people: one posts an offer, its price per hour, the place only for sessions in person, a contact, asking nothing while the seed is held; the other opens its link, messages it, gets the reply, and reviews it from the thread; the card, the Messages tab and the messages button count the conversation, the dot once the page opens anew; the Messages tab asks the passkey itself', async () => {
  const { page, counts } = first
  // The offer, from the tutor's profile: each of the market's fields a row, its label, then its
  // question in grey while it holds nothing; the listing's own words, an open box at the foot.
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await button(page, 'New offer').click()
  await page.getByRole('heading', { name: 'New offer' }).waitFor()
  const ask = (name: string) => fieldAsked(LESSONS, L.offer.role, name)
  const [PRICE, CHOICE, MODE, PLACE, ABOUT] = [ask('price'), ask(L.choice), ask(L.mode), ask(L.place), ask('description')]
  assert.deepEqual(await rowSays(page, PRICE.label), [PRICE.question], 'empty: its question')
  await page.getByLabel(ABOUT.label, { exact: true }).fill(OFFER)
  // The price: an amount for 1 of what the market's price may be for, hours, minutes or the whole job.
  const price = await openRow(page, PRICE.label)
  if (PRICE.hint) await price.getByText(PRICE.hint).waitFor()
  await price.getByLabel('Amount', { exact: true }).fill('30')
  const units = await price.getByLabel('For', { exact: true }).locator('option').allTextContents()
  assert.deepEqual(units, [...L.per.flatMap((p) => (p === 'hour' ? ['hour', 'minute'] : [p])), 'the whole job'], "the field's own per, for 1 of each, minutes after hours, then the whole job")
  await closeRow(page, PRICE.label)
  assert.deepEqual(await rowSays(page, PRICE.label), [`$30 ${forOne(L.per[0]!)}`], 'closed: the price as people say it')
  // A long list (a tutor's subjects): opened, a search over the values' words, each with its tick box; one ticked, a chip.
  const listed = valuesIn(L.choice)
  const subject = wordOf(L.choice, listed[0]!)
  const subjects = await openRow(page, CHOICE.label)
  const typed = subject.slice(0, 3).toLowerCase()
  await subjects.getByRole('searchbox').fill(typed)
  assert.deepEqual(await subjects.getByRole('checkbox').allTextContents(), listed.map((v) => wordOf(L.choice, v)).filter((w) => w.toLowerCase().includes(typed)), 'the search, by their words')
  await subjects.getByRole('checkbox', { name: subject, exact: true }).click()
  assert.deepEqual(await subjects.locator('.chips .chip').allTextContents(), [subject], 'picked, a chip')
  await shot(page, 'picker')
  await closeRow(page, CHOICE.label)
  assert.deepEqual(await rowSays(page, CHOICE.label), [subject], 'the row says it')
  // How sessions are held: no place until they are in person; then the place, right after, one row,
  // and nothing of the map asked for yet: its code and its tiles come with the place opened alone.
  const [IN_PERSON, ONLINE] = [wordOf(L.mode, L.inPerson), wordOf(L.mode, L.online)]
  const mapCode: string[] = []
  const watch = (r: { url: () => string }) => void (/\/assets\/(PlaceMap|maplibre-gl-worker)-/.test(r.url()) && mapCode.push(r.url()))
  page.on('request', watch)
  assert.equal(await rowOf(page, PLACE.label).count(), 0, 'no place before In person')
  const mode = await openRow(page, MODE.label)
  await mode.getByRole('button', { name: IN_PERSON }).click()
  assert.equal(await mode.getByRole('button', { name: IN_PERSON }).locator('[data-icon="check"]').count(), 1, 'two that can both be picked: chips with their tick')
  await closeRow(page, MODE.label)
  await rowOf(page, PLACE.label).waitFor()
  const labels = await page.locator('.field-head .name').allTextContents()
  assert.equal(labels.indexOf(PLACE.label), labels.indexOf(MODE.label) + 1, 'the place right after how sessions are held')
  assert.equal(labels.at(-1), 'Contact', 'contact last')
  const expected = MARKETS.ask(LESSONS, L.offer.role)
    .filter((f) => f.name !== 'description' && Object.entries(f.when ?? {}).every(([n, v]) => n === L.mode && v.includes(L.inPerson)))
    .map((f) => f.label)
  assert.deepEqual(labels, expected, "the market's own order and words")
  assert.deepEqual([mapCode, tiles.asked], [[], { styles: [], tilejson: 0, tiles: 0 }], 'nothing of the map yet')
  // Opened: the map, on OpenFreeMap's tiles (the stand-in's), its attribution shown, the circle in its
  // middle at the market's own radius; the location allowed already, so the map goes to the phone and
  // the caption places gives that circle shows under it, never stored.
  const placing = await placeScreen(page, PLACE.label)
  await placing.locator('.maplibregl-ctrl-attrib', { hasText: 'OpenFreeMap stand-in' }).waitFor()
  assert.ok(mapCode.some((u) => u.includes('/PlaceMap-')) && tiles.asked.styles[0] === 'positron' && tiles.asked.tiles > 0, "the map's code, its style and its tiles, now")
  page.off('request', watch)
  await placing.getByRole('button', { name: 'Your location' }).waitFor()
  const radius = PLACE.start!.radiusKm!
  assert.equal(await sizeOf(placing), `${radius} km`, "the market's own size for the role")
  const here = await captionAt({ lat: String(SPOT.latitude), lon: String(SPOT.longitude), radiusKm: radius })
  await placing.locator('.place-caption', { hasText: `Within ${radius} km of ${here}` }).waitFor({ timeout: 20_000 })
  // A place searched for by its name: places' answers, each with where it is; one picked, the map goes there.
  await placing.getByRole('searchbox', { name: 'Search a place' }).fill('chamberi')
  const found = placing.getByRole('option', { name: /^Chamberí/ })
  await found.waitFor()
  await found.click()
  await placing.locator('.place-caption', { hasText: 'of Chamberí' }).waitFor({ timeout: 20_000 })
  await setSize(placing, '10 km')
  await placing.locator('.place-caption', { hasText: 'Within 10 km of Chamberí' }).waitFor({ timeout: 20_000 })
  await shot(page, 'place-area')
  await closeRow(page, PLACE.label)
  assert.match((await rowSays(page, PLACE.label))[0]!, /^Within 10 km of Chamberí/, 'closed: its size and its caption')
  assert.equal((await kept(page))['forest.points'], undefined, 'nothing of where it is kept on the device')
  assert.equal(await page.getByLabel(ABOUT.label, { exact: true }).inputValue(), OFFER, 'the form keeps all it holds')
  const contact = await openRow(page, 'Contact')
  await contact.getByLabel('Contact', { exact: true }).fill('ada@example.com')
  await rowOf(page, 'Contact').getByText('Public.').waitFor()
  await closeRow(page, 'Contact')
  await shot(page, 'listing-offer-in-person')
  // Online only: the place goes, and nothing of it is posted.
  const again = await openRow(page, MODE.label)
  await again.getByRole('button', { name: IN_PERSON }).click()
  await rowOf(page, PLACE.label).waitFor({ state: 'detached' })
  await again.getByRole('button', { name: ONLINE }).click()
  await closeRow(page, MODE.label)
  // You's reload dropped the seed: Post will ask, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'listing-offer')
  let asked = counts.asserted
  await button(page, 'Post').click()
  // Its card on the profile, its own, with gaps around it: its picture, with no photo its market's icon; its title, its
  // description's first line, on one line, cut with "…" when too long; its price at the right, the amount, then an hour.
  const offerRow = page.locator('button.offer.card', { hasText: OFFER })
  await offerRow.waitFor({ timeout: 60_000 })
  assert.deepEqual(
    await offerRow.evaluate((el) => [el.querySelector('.offer-title')!.textContent, getComputedStyle(el.querySelector('.offer-title')!).textOverflow, el.querySelector('.offer-price')!.textContent, !!el.querySelector('.offer-pic .mthumb'), el.querySelectorAll('.corner').length]),
    [OFFER, 'ellipsis', `$30 ${forOne(L.per[0]!)}`, true, 0],
    'its picture, its title on one line, its price; no mark, nothing new',
  )
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  // Tapped, its page: Back and Share, round; the offer as one card, its pencil at the right; no details or description on a
  // phone; under it Messages, none yet, the messages opened by themselves with the seed held.
  await offerRow.click()
  const bigCard = page.locator('button.card.offer-big')
  await bigCard.waitFor()
  assert.deepEqual(await page.locator('main .top button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label'))), ['Back', 'Share'])
  assert.deepEqual(await bigCard.evaluate((el) => [el.querySelector('.offer-title')!.textContent, el.querySelector('.offer-price')!.textContent, (el.querySelector('.pen') as SVGElement).dataset.icon]), [OFFER, `$30 ${forOne(L.per[0]!)}`, 'pencil-simple'])
  assert.equal(await page.getByText('ada@example.com').count(), 0, 'no details on a phone')
  await page.locator('main p.none', { hasText: 'No messages yet' }).waitFor()
  await shot(page, 'offer')
  // The card, edited and posted again: the seed held since that unlock, Post shows no unlock icon, and asks nothing.
  await bigCard.click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  assert.equal(await asks(button(page, 'Post')), false, 'no unlock icon: a tap will not ask')
  await shot(page, 'listing-offer-held')
  asked = counts.asserted
  await button(page, 'Post').click()
  await bigCard.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked')
  await button(page, 'Back').click()
  const listings = await entriesOf(tutor, 'listing')
  assert.equal(listings.length, 1)
  const [offerPath, offer] = listings[0]!
  assert.match(offerPath, /^listing\/[0-9a-f]{32}$/, 'at a random id')
  assert.deepEqual(offer.entry.body, { description: OFFER, price: [{ amount: '30', currency: 'USD', per: L.per[0] }], [L.choice]: [listed[0]], [L.mode]: [L.online], contact: 'ada@example.com' })
  await offerRow.waitFor()
  await shot(page, 'profile-listings')

  // The second person opens a message link with nothing set up: Start and the selfie first, then the message.
  const second = await phone()
  await second.page.goto(`${APP}message?to=${tutor}`)
  await imNew(second)
  await faceCheck(second)
  await onward(second)
  // The writing screen, all of it there: their card, who it is and its address cut short, with its badge and its market;
  // the message box; under it, one quiet line, with no profile on that side yet: Create, which makes it. No box for an address.
  await second.page.getByRole('heading', { name: 'New message' }).waitFor({ timeout: 60_000 })
  assert.equal(new URL(second.page.url()).search, '', "the profile's address out of the path")
  const toCard = second.page.locator('.person.to')
  await toCard.locator('.name.key', { hasText: short(tutor) }).waitFor()
  assert.equal(await second.page.getByLabel('To').count(), 0, 'no box for an address')
  await badge(toCard.locator('.who', { hasText: TUTORING })).waitFor()
  await marketIn(toCard, TUTORING)
  assert.equal(await toCard.getByText(short(tutor)).count(), 1, 'its short key once: no one named it')
  const fromLine = second.page.locator('.from-line')
  await fromLine.getByText(`You have no ${STUDENT_WORDS} profile yet.`, { exact: true }).waitFor()
  assert.equal(await fromLine.locator('[data-icon]').first().getAttribute('data-icon'), LESSONS_ICON, "its market's icon")
  assert.ok(await second.page.getByLabel('Message').isVisible(), 'the message box from the start')
  assert.ok(await button(second.page, 'Send').isDisabled(), 'Send once there is a profile to send from')
  await shot(second.page, 'message-new-profile')
  const secondAsked = second.counts.asserted
  await fromLine.getByRole('button', { name: 'Create' }).click()
  await fromLine.getByText(`From your ${STUDENT_WORDS} profile`, { exact: true }).waitFor({ timeout: 120_000 })
  assert.equal(await fromLine.getByRole('button').count(), 0, 'from the profile just made, one quiet line')
  assert.equal(await fromLine.evaluate((l) => getComputedStyle(l).color), await muted(second.page), 'quiet')
  await second.page.getByLabel('Message').fill(ASK)
  assert.equal(await asks(button(second.page, 'Send')), false, 'the seed held since the unlock back from the check: Send will ask nothing')
  await shot(second.page, 'message')
  assert.equal(await button(second.page, 'Send').evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(second.page, 'forest'), 'Send, strong green')
  await button(second.page, 'Send').click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor({ timeout: 60_000 })
  assert.equal(second.counts.asserted - secondAsked, 0, 'the profile made and the message sent, nothing asked: the seed held since the unlock back from the check')
  const student = JSON.parse((await kept(second.page))['forest.profiles']!)[0].address as string

  // The first, the seed held since posting: the message opens by itself as it comes, so the card counts the conversation
  // with something new, 1, on its avatar's corner, in black; so do the Messages tab and the profile's messages button.
  // Nothing on its rating: a message is no review.
  await button(page, 'Back').click()
  const tutorCard = page.locator('button.card', { hasText: TUTOR_WORDS })
  await tutorCard.locator('.corner[aria-label="1 new"]').waitFor({ timeout: 45_000 })
  assert.equal(await tutorCard.locator('.corner').evaluate((c) => getComputedStyle(c).backgroundColor), await tokenColor(page, 'ink'), 'in black')
  await page.locator('.tabbar .corner', { hasText: '1' }).waitFor({ timeout: 45_000 })
  assert.equal(await page.locator('.tabbar .corner').getAttribute('aria-label'), '1 new', 'the Messages tab: one conversation with something new')
  await shot(page, 'home-message')
  await tutorCard.click()
  await inbox(page).locator('.corner', { hasText: '1' }).waitFor()
  assert.equal(await inbox(page).getAttribute('aria-label'), 'Messages, 1 new')
  assert.equal(await page.locator('button.ratepill').textContent(), 'No reviews yet', 'nothing on its rating')
  await shot(page, 'profile-message')
  await button(page, 'Back').click()
  // The page closed and opened again, the seed dropped: what the page opened by itself and nobody saw is new still, and with
  // the message not opened, how many conversations it makes can't be known: the black dot in the count's place, on the card
  // and the Messages tab.
  await closed(page)
  await tutorCard.locator('.corner.dot').waitFor({ timeout: 45_000 })
  await page.locator('.tabbar .corner.dot').waitFor({ timeout: 45_000 })
  assert.equal(await page.locator('.tabbar .corner').getAttribute('aria-label'), 'New')
  // A tap on the Messages tab asks the passkey itself. The prompt closed: only what is true, the lock, New messages, and
  // Open with its unlock icon; at the top, the title alone: no New message, here or anywhere; the tabs below, Messages picked.
  await closeTheSheetOnce(page)
  asked = counts.asserted
  await page.locator('.tabbar button', { hasText: 'Messages' }).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  const unopened = page.locator('.unopened', { hasText: 'New messages' })
  await unopened.waitFor()
  assert.equal(counts.asserted - asked, 0, 'the prompt closed: nothing given')
  assert.deepEqual(await unopened.locator('.sq [data-icon]').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['lock-simple'], 'the lock: an envelope shows no one who wrote it')
  assert.equal(await unopened.locator('.av').count(), 0, 'no avatars')
  assert.equal(await page.getByText('No new messages').count(), 0)
  assert.equal(await page.locator('.filters').count(), 0, 'no chips before the unlock')
  assert.equal(await page.locator('.top button').count(), 0, 'no back, the tabs are there; and no New message')
  assert.equal(await page.locator('[data-icon="note-pencil"]').count(), 0, 'no pencil')
  assert.match((await page.locator('.tabbar button[aria-current="page"]').textContent()) ?? '', /Messages$/)
  // No seed held: Open asks, and says so.
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Open's unlock icon, in its text color")
  await shot(page, 'messages-asking')
  asked = counts.asserted
  await button(page, 'Open').click()
  const row = page.locator('button.thread-row', { hasText: short(student) })
  await row.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock opens every inbox')
  // A row is two lines, as any messaging app has them: their short key, bold in the key's face, never cut, the title of the
  // listing it is about beside it when there is one (here none), and when, at the right; then the last message, on one line. While new: that line bold, a black dot at its right,
  // and the time bold. Their picture, their animal, carries their market's badge at its bottom right: the market's own icon,
  // white on its color, the same icon the tutor's own profile shows. No check's badge, no role, no "to your": in a market a
  // person talks only with the other side. The rows sit on the ground, each its own, not in one card.
  await row.locator('.dot').waitFor()
  assert.equal((await avatarOf(row.locator('.av'))).icon, animal(student), 'their animal')
  const marketBadge = row.locator('.avb > .mb')
  assert.deepEqual(
    await marketBadge.evaluate((b) => [b.dataset.market, b.querySelector('svg')?.dataset.icon, getComputedStyle(b).color, Math.round(b.getBoundingClientRect().right - b.parentElement!.querySelector('.av')!.getBoundingClientRect().right), Math.round(b.getBoundingClientRect().bottom - b.parentElement!.querySelector('.av')!.getBoundingClientRect().bottom)]),
    [LESSONS, LESSONS_ICON, 'rgb(255, 255, 255)', 5, 5],
    "the market's badge, the icon the tutor's own profile shows, white, at the picture's bottom right",
  )
  assert.equal(await row.evaluate((r) => r.parentElement!.className), 'threads', 'on the ground, not in a card')
  assert.equal(await row.locator('.thread-last .text').evaluate((t) => getComputedStyle(t).whiteSpace), 'nowrap', 'the last message on one line')
  const key = row.locator('.thread-top .name.key')
  assert.deepEqual(await key.evaluate((k) => [k.textContent, getComputedStyle(k).fontWeight, getComputedStyle(k).fontFamily.includes('monospace')]), [short(student), '700', true], 'their key, bold, in its own face')
  assert.match((await row.locator('.thread-top .xs').textContent()) ?? '', /^\d{1,2}:\d{2}\s?[AP]M$/, 'today: the time of day')
  assert.deepEqual([await row.locator('.thread-top .mk').count(), await row.locator('.thread-top .about-title').count()], [0, 0], 'no market; no listing, none named')
  assert.deepEqual(await key.evaluate((k) => [getComputedStyle(k).overflow, getComputedStyle(k).textOverflow, getComputedStyle(k).flexShrink]), ['visible', 'clip', '0'], 'a key is never cut')
  assert.equal(await row.locator('.thread-last .text.fresh').textContent(), ASK, 'its last message, bold while new')
  assert.deepEqual([await row.locator('.thread-top .when').evaluate((t) => getComputedStyle(t).fontWeight), await row.locator('.dot').evaluate((d) => getComputedStyle(d).backgroundColor)], ['800', await tokenColor(page, 'ink')], 'the time bold, the dot black')
  assert.deepEqual([await row.locator('.vb').count(), await row.locator('.mkr').count(), await row.getByText(L.request.role).count(), await row.getByText('to your').count()], [0, 0, 0, 0], 'nothing else')
  assert.deepEqual((await row.locator('.two > *').allTextContents()).length, 2, 'two lines')
  assert.equal(await page.locator('.unopened').count(), 0, 'opened')
  // Chips that pick whose: All, then each profile, a dot in its market's color and its market, its role added only where two
  // of the person's share a market; no avatar. The one picked on the soft green.
  assert.deepEqual(await page.locator('.filters button').allTextContents(), ['All', TUTORING])
  assert.deepEqual(await button(page, TUTORING).evaluate((b) => [getComputedStyle(b.querySelector('.fdot')!).backgroundColor, b.querySelectorAll('.av').length]), [rgbOf(colorOf(LESSONS)), 0], "its market's dot, no avatar")
  assert.equal(await button(page, 'All').getAttribute('aria-pressed'), 'true')
  assert.deepEqual(await button(page, 'All').evaluate((b) => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]), [await tokenColor(page, 'mint'), await tokenColor(page, 'forest')], 'the chip picked, on the soft green')
  await shot(page, 'messages')
  await row.click()
  await page.getByText(ASK).waitFor()
  assert.equal(await page.locator('.tabbar').count(), 0, 'a conversation keeps its own full screen')
  // Its header, one line: Back; their picture with its market's badge; their key; no market line and no badges, which their
  // profile says; no "to your"; at the right Review, outlined, its star in the sun.
  const convo = page.locator('.top')
  await convo.locator('.convo-head .name.key', { hasText: short(student) }).waitFor()
  assert.deepEqual([await convo.locator('.mkr').count(), await convo.locator('.vb').count(), await convo.getByText(TUTORING).count()], [0, 0, 0], 'no market line, no badges')
  assert.equal(await convo.getByText('to your').count(), 0, 'no "to your"')
  assert.equal(await convo.locator('.convo-head .av').getAttribute('data-market'), LESSONS)
  assert.equal((await avatarOf(convo.locator('.convo-head .av'))).icon, animal(student), 'someone else: their animal')
  assert.equal(await convo.locator('.convo-head .avb > .mb').getAttribute('data-market'), LESSONS, "their market's badge on their picture")
  assert.deepEqual(await convo.locator(':scope > button, .top-right > button').evaluateAll((b) => b.map((x) => x.getAttribute('aria-label') ?? x.textContent)), ['Back', 'Review'], 'Back first, Review at the right')
  const reviewing = button(page, 'Review')
  assert.deepEqual(
    await reviewing.evaluate((b) => [b.className, b.textContent, getComputedStyle(b).backgroundColor, getComputedStyle(b).boxShadow, (b.querySelector('.icon') as SVGElement).dataset.icon, getComputedStyle(b.querySelector('.icon')!).color]),
    ['small', 'Review', 'rgba(0, 0, 0, 0)', `${await tokenColor(page, 'ink')} 0px 0px 0px 1.5px inset`, 'star', await tokenColor(page, 'sun')],
    'Review, outlined in ink, on what is behind it, its star in the sun',
  )
  const [headTop, reviewBox] = [(await convo.locator('.convo-head').boundingBox())!, (await reviewing.boundingBox())!]
  assert.ok(Math.abs(headTop.y + headTop.height / 2 - (reviewBox.y + reviewBox.height / 2)) < 6, 'one header line')
  await nothingFloats(page, 'a conversation')
  await shot(page, 'thread')
  // The reply, in one row: the pill and a round Send, which shows its own icon.
  const reply = page.getByLabel('Message')
  const send = button(page, 'Send')
  const [box, round] = [(await reply.boundingBox())!, (await send.boundingBox())!]
  assert.ok(round.y < box.y + box.height && box.y < round.y + round.height && round.x > box.x + box.width - 1, 'side by side, in one row')
  assert.equal(Math.round(round.width), Math.round(round.height), 'as wide as it is high')
  assert.equal(await send.evaluate((b) => getComputedStyle(b).borderRadius), '50%', 'round')
  assert.deepEqual([await send.locator('.icon').count(), await send.locator('.unlock').count(), await send.textContent(), await send.locator('.icon').getAttribute('data-icon')], [1, 0, '', 'arrow-up'], 'its own icon, no word, no padlock')
  await reply.fill(YES)
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Send's icon, in its text color")
  assert.equal(await send.evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(page, 'forest'), 'Send, strong green')
  await send.click()
  await page.locator('.said.mine', { hasText: YES }).waitFor({ timeout: 60_000 })
  // Their message on the card with an edge; the person's own on the soft green, its words in ink.
  assert.deepEqual(await page.locator('.said.mine', { hasText: YES }).evaluate((m) => [getComputedStyle(m).backgroundColor, getComputedStyle(m).color]), [await tokenColor(page, 'mint'), await tokenColor(page, 'ink')], 'your message: soft green, in ink')
  assert.deepEqual(await page.locator('.said:not(.mine)').first().evaluate((m) => [getComputedStyle(m).backgroundColor, getComputedStyle(m).boxShadow.includes('inset')]), [await tokenColor(page, 'card'), true], 'theirs: the card, with an edge')
  // The time under the last message of each run, quietly, at its side; the day once, above them, since they are of one day: Today.
  const times = await page.locator('.thread .stamp').allTextContents()
  assert.equal(times.length, 2, 'two runs, one each')
  for (const t of times) assert.match(t, /^\d{1,2}:\d{2}\s?[AP]M$/, `a time of day: ${t}`)
  assert.deepEqual(await page.locator('.thread > *').evaluateAll((els) => els.map((e) => e.className)), ['day-line', 'said', 'stamp', 'said mine gap', 'stamp mine'], 'one day line, before the first')
  assert.equal(await page.locator('.day-line').textContent(), 'Today')
  await shot(page, 'thread')
  assert.equal((await entriesOf(tutor, 'sent')).length, 1, "the reply's copy, in the tutor's own folder")
  await button(page, 'Back').click()
  assert.equal(await row.locator('.dot').count(), 0, 'looked at: new no more')
  await page.locator('.tabbar .corner').waitFor({ state: 'detached' })

  // The second reads the reply beside what they sent, and reviews the tutor from the thread; their
  // page closed and opened again first, so Open asks.
  await button(second.page, 'Back').click()
  await closed(second.page)
  await second.page.locator('button.card', { hasText: STUDENT_WORDS }).locator('.corner.dot').waitFor({ timeout: 45_000 })
  // From the profile's own messages button, whose tap asks the passkey itself: Messages on its chip, with Back to the profile.
  const secondBefore = second.counts.asserted
  await messagesOf(second.page, STUDENT_WORDS)
  await second.page.locator('button.thread-row', { hasText: short(tutor) }).waitFor({ timeout: 60_000 })
  assert.equal(second.counts.asserted - secondBefore, 1, 'one unlock, asked by the tap itself')
  assert.equal(await button(second.page, TUTORING).getAttribute('aria-pressed'), 'true', 'picked to the profile it was opened from')
  assert.equal(await second.page.locator('main .top').getByRole('button', { name: 'Back' }).count(), 1, 'Back to the profile')
  assert.equal(await button(second.page, 'All').getAttribute('aria-pressed'), 'false')
  await shot(second.page, 'messages-picked')
  await second.page.locator('button.thread-row', { hasText: short(tutor) }).click()
  await second.page.locator('.said.mine', { hasText: ASK }).waitFor()
  await second.page.locator('.said:not(.mine)', { hasText: YES }).waitFor()
  // Review, from the thread: who it is about known, at the top with Close; Score, Vouch and Report, Score picked, its line.
  await button(second.page, 'Review').click()
  await badge(second.page.locator('.top .who', { hasText: TUTOR_WORDS })).waitFor()
  assert.equal(await button(second.page, 'Close').locator('.icon').getAttribute('data-icon'), 'x')
  const kinds = second.page.getByRole('group', { name: 'Kind' })
  assert.deepEqual(await kinds.getByRole('button').allTextContents(), ['Score', 'Vouch', 'Report'])
  assert.deepEqual(await kinds.getByRole('button').evaluateAll((b) => b.map((x) => [x.getAttribute('aria-pressed'), (x.querySelector('.icon') as SVGElement).dataset.icon])), [['true', 'star'], ['false', 'handshake'], ['false', 'flag']])
  await second.page.getByText('How did it go, from 1 to 10?').waitFor()
  assert.equal(await second.page.getByLabel('Comment').getAttribute('placeholder'), "What went well, or didn't?")
  const score = second.page.getByLabel('Score')
  assert.match((await score.getAttribute('class')) ?? '', /untouched/, "the thumb hidden until touched: no score looks chosen")
  await second.page.locator('.score .big', { hasText: '–' }).waitFor()
  await shot(second.page, 'review-untouched')
  await score.focus()
  await score.press('End')
  await second.page.locator('.score .big', { hasText: '10' }).waitFor()
  assert.equal(await score.getAttribute('class'), null, 'touched: its thumb shows')
  for (let i = 0; i < 6; i++) await score.press('ArrowLeft')
  await second.page.locator('.score .big', { hasText: '9.4' }).waitFor()
  await second.page.getByLabel('Comment').fill('Clear and patient.')
  assert.equal(await second.page.getByText(`$30 ${forOne(L.per[0]!)}`).count(), 0, 'none of their listings to name')
  await shot(second.page, 'review-someone')
  await button(second.page, 'Post').click()
  await second.page.getByLabel('Message').waitFor({ timeout: 60_000 })
  const reviews = await entriesOf(student, 'review')
  assert.equal(reviews.length, 1)
  const [, review] = reviews[0]!
  assert.deepEqual(review.entry.body, { subject: tutor, score: '9.4', text: 'Clear and patient.' }, 'about the tutor, in tenths, naming none of their listings')
  await second.context.close()
  await button(page, 'Home').click()
  say('two people: an offer per hour, found by its link, messaged, replied to, reviewed in tenths; nothing asked while the seed was held')
})

test("a second browser, the same passkey answering from the first, as a phone answers through the passkey prompt's QR code: Start finds the profile and the stamp, after Save a passkey on this device?, in Start's place, Not now; a profile it makes, the first shows as New profiles from another device, read in one unlock", async () => {
  const second = await phone()
  // The second browser's own authenticator holds no Forest passkey. Asked with the sheet, the first
  // browser's answers, as a phone does through the QR code: its PRF secret for the same salt.
  await answerFrom(second, first)
  const asked = first.counts.asserted
  await second.page.goto(APP)
  await elsewhere(second)
  // From another device: once, Save a passkey on this device?, in Start's own place, Save and Not now.
  const save = second.page.getByRole('region', { name: 'Save a passkey on this device?' })
  await save.waitFor({ timeout: 60_000 })
  await nothingFloats(second.page, 'Save a passkey on this device?')
  assert.deepEqual((await save.getByRole('button').allTextContents()).map((t) => t.trim()), ['Save', 'Not now'])
  assert.ok(await asks(button(second.page, 'Save')), 'Save shows the unlock icon: it makes a passkey')
  await shot(second.page, 'save-passkey')
  await button(second.page, 'Not now').click()
  await homeWith(second.page, TUTOR_WORDS)
  assert.equal(first.counts.asserted - asked, 1, "answered once, by the first browser's passkey")
  assert.equal(second.counts.created, 0, 'and no second passkey')
  assert.deepEqual(JSON.parse((await kept(second.page))['forest.profiles']!), [{ label: TUTOR_LABEL, address: tutor }])

  // The second browser makes a profile of its own, with the seed it holds since its Start.
  await button(second.page, 'New profile').click()
  await pickProfile(second.page, STUDENT_WORDS)
  assert.equal(first.counts.asserted - asked, 1, 'nothing asked again: the seed held since Start')
  await second.context.close()
  const student = (await mainKey(seed, STUDENT_LABEL)).address

  // The first, with nothing unlocked, tells it: one yellow line under the title, Sync profiles, with round arrows at its
  // right; a tap asks the passkey once, the arrows spin, then the line goes and the card shows.
  const { page, counts } = first
  await button(page, 'You').click()
  await button(page, 'Home').click()
  const row = page.locator('main button.sync', { hasText: 'Sync profiles' })
  await row.waitFor({ timeout: 30_000 })
  assert.equal(first.counts.asserted - asked, 1, 'told with nothing unlocked')
  assert.deepEqual(await row.evaluate((b) => [getComputedStyle(b).backgroundColor, (b.querySelector('.arrows .icon') as SVGElement).dataset.icon, b.querySelectorAll('.unlock').length]), [await tokenColor(page, 'sun-bg'), 'arrows-clockwise', 0], 'yellow, its round arrows, no unlock icon')
  const [titleBox, lineBox] = [(await homeTitle(page).boundingBox())!, (await row.boundingBox())!]
  assert.ok(lineBox.y > titleBox.y + titleBox.height - 1 && lineBox.y - (titleBox.y + titleBox.height) < 40, 'under the title')
  await shot(page, 'profiles-elsewhere')
  await closed(page)
  await row.waitFor({ timeout: 30_000 })
  const before = counts.asserted
  await row.click()
  await page.locator('button.card', { hasText: STUDENT_WORDS }).waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - before, 1, 'one unlock')
  await row.waitFor({ state: 'detached' })
  // In the order they were made: the tutor, then the student, as their label entries say.
  assert.deepEqual(await page.locator('main button.card .nm2 strong + span').allTextContents(), [L.offer.role, L.request.role], 'the order they were made in')
  // In label order.
  assert.deepEqual(
    JSON.parse((await kept(page))['forest.profiles']!),
    [
      { label: STUDENT_LABEL, address: student },
      { label: TUTOR_LABEL, address: tutor },
    ].sort((a, b) => a.label.localeCompare(b.label)),
  )
  say('a second browser found the profile and its verification, answered by the same passkey; the profile it made, the first read in one unlock')
})

const NOTE = 'Note to self: Tuesday at six.'

test("a message to one of the person's own profiles: with the seed held since the last unlock, the messages open by themselves, the loader showing past half a second; then a link to their tutor, From their student, the page opened anew so Send asks once, and it opens with nothing more asked", async () => {
  const { page, context, counts } = first
  const asked = counts.asserted
  const ownStudent = short((await mainKey(seed, STUDENT_LABEL)).address)
  // Reading the inbox, slowed here, is a known long wait: the loader shows, once it passes half a second, alone in the
  // middle of the content: on a laptop across both panes, not in the left one, with no title and no Pick a conversation.
  const inboxes = `${services.host}/v1/inbox/read`
  await context.route(inboxes, async (route) => {
    await new Promise((r) => setTimeout(r, 4_000))
    await route.continue()
  })
  // The page opened anew, so the messages are not opened yet; the profile's messages button asks the passkey itself, and
  // the messages open with the seed it gives.
  await closed(page)
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await page.setViewportSize({ width: 1280, height: 800 })
  await inbox(page).click()
  const loader = page.locator('main .loader.big')
  await loader.waitFor({ state: 'attached' })
  assert.deepEqual(await loader.evaluate((l) => [getComputedStyle(l).animationName, getComputedStyle(l).animationDelay]), ['late', '0.5s'], 'shown only once the wait passes half a second')
  await loader.waitFor()
  const middle = (b: { x: number; y: number; width: number; height: number }) => [b.x + b.width / 2, b.y + b.height / 2]
  const [atLoader, area] = [middle((await loader.boundingBox())!), middle((await page.locator('.content').boundingBox())!)]
  assert.ok(Math.abs(atLoader[0]! - area[0]!) < 4 && Math.abs(atLoader[1]! - area[1]!) < 10, `in the middle of both panes: ${atLoader} against ${area}`)
  assert.deepEqual([await page.getByRole('heading', { name: 'Messages', exact: true }).count(), await page.getByText('Pick a conversation.').isVisible()], [0, false], 'alone')
  await shot(page, 'laptop-messages-loading')
  // On a phone, the same: in the middle of the screen above the tabs.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('main.panes').waitFor({ state: 'detached' })
  await page.locator('.tabbar').waitFor()
  await loader.waitFor()
  const [onPhone, tabs] = [middle((await loader.boundingBox())!), (await page.locator('.tabbar').boundingBox())!]
  assert.ok(Math.abs(onPhone[0]! - 195) < 4 && Math.abs(onPhone[1]! - tabs.y / 2) < 40, `in the middle of the screen: ${onPhone}`)
  await shot(page, 'messages-loading')
  // The seed held: no Open, the conversations opened by themselves.
  await page.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  await context.unroute(inboxes)
  assert.equal(await page.locator('.unopened').count(), 0, 'no Open')
  await shot(page, 'messages-held')
  assert.equal(counts.asserted - asked, 1, 'one unlock, asked by the tap itself')
  // A link to their own tutor, as an index's Message link opens it: the page opened anew, so Send asks once; From their
  // student, nothing refused.
  await page.goto(`${APP}message?to=${tutor}`)
  await badge(page.locator('.person.to .who', { hasText: TUTORING })).waitFor()
  await page.locator('.from-line', { hasText: `From your ${STUDENT_WORDS} profile` }).waitFor()
  assert.equal(await page.locator('main .line').count(), 0, 'not refused')
  assert.equal(await page.locator('.from-line button').count(), 0, 'from the student they have')
  await page.getByLabel('Message').fill(NOTE)
  const sending = counts.asserted
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: NOTE }).waitFor({ timeout: 60_000 })
  // The thread, with their tutor: its header their key alone, no market, no "to your".
  await page.locator('button.convo-head .name.key', { hasText: short(tutor) }).waitFor()
  assert.equal(await page.locator('button.convo-head .mkr').count(), 0, 'no market line')
  await button(page, 'Back').click()
  await page.locator('.tabbar button', { hasText: 'Messages' }).click()
  // The tutor's messages: it arrives, and with the seed held it opens by itself, from the student, new.
  const row = page.locator('button.thread-row', { hasText: NOTE }).filter({ hasText: ownStudent })
  await row.waitFor({ timeout: 90_000 })
  assert.equal(await page.locator('.unopened').count(), 0, 'never Open')
  assert.equal(counts.asserted - sending, 1, 'Send asked once, the page opened anew; then opened again, nothing asked')
  await row.locator('.dot').waitFor()
  await row.click()
  await page.locator('.said:not(.mine)', { hasText: NOTE }).waitFor()
  await page.locator('button.convo-head .name.key', { hasText: ownStudent }).waitFor()
  await button(page, 'Back').click()
  await button(page, 'Home').click()
  say("a message from the person's student to their own tutor: sent, counted, opened")
})

test('one passkey per person: after Forget, Start finds it, straight to Home; with the passkey prompt closed, Start found nothing, and I already use Forest finds it', async () => {
  const { page, counts, cdp, authenticator } = first
  await button(page, 'You').click()
  await button(page, 'Forget this device').click()
  await page.getByText('Your passkey stays in your password manager.').waitFor()
  await button(page, 'Forget').click()
  await button(page, 'Start').click()
  await page.locator('button.card', { hasText: TUTOR_WORDS }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'Start found the passkey; nothing made')

  await button(page, 'You').click()
  await button(page, 'Forget this device').click()
  await button(page, 'Forget').click()
  // The person closes the passkey prompt: a browser can't tell that from no passkey, so Start found nothing.
  await closeTheSheetOnce(page)
  await button(page, 'Start').click()
  await page.getByRole('region', { name: 'Start found nothing' }).waitFor()
  await shot(page, 'start-closed-known')
  await button(page, 'I already use Forest').click()
  await page.locator('button.card', { hasText: TUTOR_WORDS }).waitFor({ timeout: 60_000 })
  assert.equal(counts.created, 1, 'and no second passkey')
  const { credentials } = await cdp.send('WebAuthn.getCredentials', { authenticatorId: authenticator })
  assert.equal(credentials.length, 1)
  say('one passkey: found after Forget, straight to Home; a closed prompt, Start found nothing, I already use Forest, and never a second')
})

/** The live, locked backup/<id> entries of the Profiles folder at `wallet`, as anyone reads them. */
const backupsOn = async (wallet: string) => (await entriesOf(wallet, 'backup')).filter(([, c]) => isLocked(c.entry.body))

/** A passkey's id as the app keeps it, from the id the virtual authenticator gives. */
const idOf = (credentialId: string) => Buffer.from(credentialId, 'base64').toString('base64url')

/** The rows of Passkeys, one per passkey. */
const passkeyRows = (page: Page) => page.getByRole('list', { name: 'Your passkeys' }).getByRole('listitem')
/** Each passkey's row in words: its name, and Main on the first. */
const passkeyWords = (page: Page) => passkeyRows(page).evaluateAll((rows) => rows.map((r) => [...r.querySelectorAll('.grow > *')].map((x) => x.textContent)))
/** A passkey's row, by its name: the button that opens it in place. */
const passkeyRow = (page: Page, name: string) => passkeyRows(page).filter({ hasText: name }).first().locator('button.row.passkey')
/** A passkey opened in place, from its row: under it, named by it, nothing floating. */
async function openPasskey(page: Page, name: string) {
  const row = passkeyRow(page, name)
  await row.click()
  const opened = page.getByRole('form', { name })
  await underIt(row, opened)
  assert.equal(await row.getAttribute('aria-expanded'), 'true')
  await nothingFloats(page, `${name}, opened`)
  return opened
}
/** A passkey renamed in place: its Name field, then Save, which closes it. */
async function renamePasskey(page: Page, from: string, to: string) {
  const opened = await openPasskey(page, from)
  await opened.getByLabel('Name').fill(to)
  await opened.getByRole('button', { name: 'Save' }).click()
  await opened.waitFor({ state: 'detached' })
}
/** A passkey removed in place: Remove, which asks again in its own place, Remove this passkey?, then Remove; its row gone. */
async function removePasskey(page: Page, name: string) {
  const opened = await openPasskey(page, name)
  await opened.getByRole('button', { name: 'Remove', exact: true }).click()
  const asking = opened.getByRole('group', { name: 'Remove this passkey?' })
  await asking.getByText('Remove this passkey?', { exact: true }).waitFor()
  assert.deepEqual((await asking.getByRole('button').allTextContents()).map((t) => t.trim()), ['Cancel', 'Remove'], 'Cancel and Remove')
  assert.match((await asking.getByRole('button', { name: 'Remove', exact: true }).getAttribute('class')) ?? '', /danger solid/, 'Remove on solid red')
  await nothingFloats(page, 'Remove this passkey?')
  await asking.getByRole('button', { name: 'Remove', exact: true }).click()
  await opened.waitFor({ state: 'detached', timeout: 30_000 })
  await passkeyRows(page).filter({ hasText: name }).waitFor({ state: 'detached' })
}
/** Passkeys, from You, from a place. */
async function toPasskeys(page: Page) {
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Passkeys' }).click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  await passkeyRows(page).first().waitFor({ timeout: 30_000 })
}
/** Back from Passkeys to You, then Home: twice after a reload, each back waited for by a mark left on the entry it leaves. */
async function passkeysHome(page: Page) {
  const you = page.getByRole('heading', { name: 'You', exact: true })
  for (let i = 0; i < 3 && !(await you.isVisible()); i++) {
    await page.evaluate(() => history.replaceState({ ...history.state, left: true }, ''))
    await button(page, 'Back').click()
    await page.waitForFunction(() => !history.state?.left && document.querySelector('main h1')?.textContent === (location.pathname === '/you' ? 'You' : 'Passkeys'))
  }
  await you.waitFor()
  await button(page, 'Home').click()
}

test("passkeys, every one a row, the same key on each: the first Main, by the name it was given else Passkey after Forget, opened in place and renamed and back, with no Remove; the same manager refused; a security key made one, Passkey 2, since it sends no maker, renamed; a browser holding only that one opens the same profiles; removed in place, asking again first, it opens them no more; after Forget, its own seed, never verified, then Get verified", async () => {
  const { page, cdp, counts } = first
  const wallet = (await mainKey(seed, '')).address
  const passkeys = page.getByRole('list', { name: 'Your passkeys' })
  const add = button(page, 'Add a passkey')
  const why = page.getByText("Add a second, so losing one doesn't lose your profiles.", { exact: true })
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Passkeys' }).locator('.two > span', { hasText: 'Passkey' }).waitFor()
  await toPasskeys(page)
  // The first: Passkey, since this device forgot what it knew of it, and since this one sends no maker; Main, a chip outlined
  // in ink; its square a key; a chevron; no dates, no line under it, no Remove in the list.
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main']])
  const main = passkeyRows(page).first()
  assert.deepEqual(await main.evaluate((r) => [(r.querySelector('.sq .icon') as SVGElement).dataset.icon, !!r.querySelector('[data-icon="caret-right"]'), getComputedStyle(r.querySelector('.mainchip')!).boxShadow]), ['key', true, `${await tokenColor(page, 'ink')} 0px 0px 0px 1.5px inset`], 'a key, a chevron, Main outlined in ink')
  assert.equal(await passkeys.getByRole('button', { name: /Remove/ }).count(), 0, 'no Remove in the list')
  // Tapped, it opens in place, under itself, its chevron turned up: a Name field, Save; no Remove at all, since the app
  // never removes the passkey the seed comes from. Tapped again, it closes.
  const mainSheet = await openPasskey(page, 'Passkey')
  assert.equal(await passkeyRow(page, 'Passkey').locator('[data-icon="caret-up"]').count(), 1, 'its chevron up')
  assert.equal(await mainSheet.getByLabel('Name').inputValue(), 'Passkey')
  assert.equal(await mainSheet.getByRole('button', { name: /Remove/ }).count(), 0, 'the first, never removed')
  await shot(page, 'passkey-open-main')
  await passkeyRow(page, 'Passkey').click()
  await mainSheet.waitFor({ state: 'detached' })
  assert.equal(await passkeyRow(page, 'Passkey').getAttribute('aria-expanded'), 'false')
  // Renamed, on this device alone, nothing asked; its name taken back with the field emptied.
  const renamedAsked = counts.asserted
  await renamePasskey(page, 'Passkey', 'My phone')
  assert.deepEqual(await passkeyWords(page), [['My phone', 'Main']])
  assert.deepEqual(JSON.parse((await kept(page))['forest.backups']!), { first: { name: 'My phone' } }, 'kept on the device')
  await renamePasskey(page, 'My phone', '')
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main']])
  assert.equal(counts.asserted - renamedAsked, 0, 'nothing asked')
  await why.waitFor()
  assert.equal(await why.getAttribute('class'), 'line', 'a quiet line')
  assert.equal(await add.locator('[data-icon="plus"]').count(), 1, 'Add a passkey, its plus')
  assert.equal(await page.locator('.dot').count(), 0, 'no dot')
  await page.getByRole('heading', { name: 'If you lose every passkey' }).waitFor()
  await page.locator('button.row', { hasText: 'Your 24 recovery words' }).getByText('Write them down to get back in', { exact: true }).waitFor()
  await shot(page, 'settings-passkeys-one')

  // The phone's own manager keeps the Forest passkey, which the new one excludes: it refuses.
  const made = counts.created
  await add.click()
  await page.getByRole('heading', { name: 'Add a passkey', exact: true }).waitFor()
  await button(page, 'Create a passkey').click()
  const same = page.getByText('This password manager already has your Forest passkey. Save the new one in another.')
  await same.waitFor()
  assert.equal(await same.getAttribute('class'), 'line red')
  assert.equal(counts.created, made, 'nothing made')
  await shot(page, 'add-passkey-same-manager')

  // A security key, a second virtual authenticator: it makes the new passkey.
  const { authenticatorId: key } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'usb', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true },
  })
  await button(page, 'Create a passkey').click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor({ timeout: 60_000 })
  const onKey = (await cdp.send('WebAuthn.getCredentials', { authenticatorId: key })).credentials
  assert.deepEqual(onKey.map((c) => [c.rpId, c.isResidentCredential]), [['app.forest.foundation', true]], 'made on the security key')
  assert.equal((await cdp.send('WebAuthn.getCredentials', { authenticatorId: first.authenticator })).credentials.length, 1, "none more in the phone's own manager")
  const addedId = idOf(onKey[0]!.credentialId)
  await passkeyRows(page).nth(1).waitFor()
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main'], ['Passkey 2', 'Backup']], 'it sends no maker, so Passkey, and a second Passkey takes 2; every one but the first a Backup')
  assert.equal(await why.count(), 0, 'two: no line')
  assert.equal(await passkeyRows(page).nth(1).locator('.unlock').count(), 0, 'no unlock icon on a row')
  assert.deepEqual(await passkeyRows(page).evaluateAll((r) => r.map((x) => (x.querySelector('.sq .icon') as SVGElement).dataset.icon)), ['key', 'key'], 'the same key on every row: no maker logos')
  await renamePasskey(page, 'Passkey 2', 'Security key')
  assert.deepEqual(await passkeyWords(page), [['Passkey', 'Main'], ['Security key', 'Backup']])
  // Backup is a chip in neutral grey, so it reads differently from Main's outline.
  const chipLooks = await passkeyRows(page).evaluateAll((rows) => rows.map((r) => { const c = r.querySelector('.mainchip, .backupchip')!; const s = getComputedStyle(c); return [c.className, s.backgroundColor, s.color] }))
  const tokens = await page.evaluate(() => { const probe = document.body.appendChild(document.createElement('span')); const of = (bg: string, fg: string) => { probe.style.background = `var(--${bg})`; probe.style.color = `var(--${fg})`; return [getComputedStyle(probe).backgroundColor, getComputedStyle(probe).color] }; const out = { main: [of('sunk', 'ink')[1]], grey: of('sunk', 'ink2') }; probe.remove(); return out })
  assert.deepEqual(chipLooks, [['mainchip', 'rgba(0, 0, 0, 0)', ...tokens.main], ['backupchip', ...tokens.grey]], 'Main outlined, in ink, no green; Backup on neutral grey')
  await shot(page, 'settings-passkeys-two')
  // Opened in place: the Name field with Save at its right, on the same line; under them Remove in red text, at the left.
  // Remove asks again in its own place, Save making room: Remove this passkey?, Cancel and Remove; Cancel, and Remove and Save are back.
  const buttonsOf = (opened: Locator) => opened.locator('.exp-buttons button').evaluateAll((b) => b.map((x) => [x.textContent!.trim(), Math.round(x.getBoundingClientRect().x), x.className]))
  const saveBeside = (opened: Locator) =>
    opened.evaluate((o) => {
      const input = o.querySelector('input')!.getBoundingClientRect()
      const save = [...o.querySelectorAll('button')].find((b) => b.textContent!.trim() === 'Save')!.getBoundingClientRect()
      return { atItsRight: save.left >= input.right - 0.5, sameLine: Math.abs((save.top + save.bottom) / 2 - (input.top + input.bottom) / 2) < input.height / 2, overlap: save.left < input.right - 1 }
    })
  const keySheet = await openPasskey(page, 'Security key')
  assert.deepEqual(await saveBeside(keySheet), { atItsRight: true, sameLine: true, overlap: false }, 'Save at the right of the name field, on the same line')
  const onPhone = await buttonsOf(keySheet)
  assert.deepEqual(onPhone.map(([words, , kind]) => [words, kind]), [['Remove', 'danger text']], 'Remove alone in its row, under the field')
  assert.ok((onPhone[0]![1] as number) < (await keySheet.locator('button', { hasText: 'Save' }).evaluate((b) => Math.round(b.getBoundingClientRect().x))), 'Remove at the left')
  await keySheet.getByRole('button', { name: 'Remove', exact: true }).click()
  const asking = keySheet.getByRole('group', { name: 'Remove this passkey?' })
  await asking.waitFor()
  assert.deepEqual((await buttonsOf(keySheet)).map(([words]) => words), ['Cancel', 'Remove'], 'Cancel and Remove, Save making room')
  assert.equal(await keySheet.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'Save gives way while Remove asks')
  await nothingFloats(page, 'Remove this passkey?')
  await shot(page, 'passkey-remove-asks')
  await asking.getByRole('button', { name: 'Cancel' }).click()
  assert.deepEqual((await buttonsOf(keySheet)).map(([words]) => words), ['Remove'], 'back as it was')
  assert.deepEqual(await saveBeside(keySheet), { atItsRight: true, sameLine: true, overlap: false }, 'with Save beside the field again')
  await passkeyRow(page, 'Security key').click()
  await keySheet.waitFor({ state: 'detached' })
  // On a laptop the same, in place in the column: Save beside the field, Remove under it; Main's, Save alone.
  await page.setViewportSize({ width: 1280, height: 800 })
  const keyOpened = await openPasskey(page, 'Security key')
  assert.deepEqual((await buttonsOf(keyOpened)).map(([words]) => words), ['Remove'])
  assert.deepEqual(await saveBeside(keyOpened), { atItsRight: true, sameLine: true, overlap: false })
  await shot(page, 'laptop-passkey-open')
  await passkeyRow(page, 'Security key').click()
  await keyOpened.waitFor({ state: 'detached' })
  const mainOpened = await openPasskey(page, 'Passkey')
  assert.deepEqual((await buttonsOf(mainOpened)).map(([words]) => words), [], 'never Remove on Main')
  assert.deepEqual(await saveBeside(mainOpened), { atItsRight: true, sameLine: true, overlap: false }, "Main's Save, beside its field")
  await passkeyRow(page, 'Passkey').click()
  await mainOpened.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal((await backupsOn(wallet)).length, 1, 'underneath, the standard\'s backup/<id> entry in the Profiles folder')
  assert.ok((JSON.parse((await kept(page))['forest.passkeys']!) as string[]).includes(addedId), 'the device knows it')

  // A browser holding only that passkey, answered through the sheet's QR code: Save a passkey on this device?, Not now, and the same profiles.
  const other = await phone()
  await answerFrom(other, first, () => addedId)
  await other.page.goto(APP)
  await elsewhere(other)
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await homeWith(other.page, TUTOR_WORDS)
  const there = await kept(other.page)
  assert.equal(JSON.parse(there['forest.passkey']!), addedId, 'that passkey, the one in use there')
  assert.deepEqual((JSON.parse(there['forest.profiles']!) as Array<{ label: string }>).map((x) => x.label), [STUDENT_LABEL, TUTOR_LABEL].sort(), 'in label order')
  assert.equal(JSON.parse(there['forest.folder']!).address, wallet, "the first passkey's Profiles folder")

  // Removed in place, asking again first: one passkey again, the line back, and that passkey opens the profiles no more.
  await removePasskey(page, 'Security key')
  await why.waitFor()
  assert.equal(JSON.parse((await kept(page))['forest.backups'] ?? '{}')[(await backupsOn(wallet))[0]?.[0] ?? ''], undefined, 'its name gone with it')
  assert.equal((await backupsOn(wallet)).length, 0)
  await closed(other.page)
  // The tap into Messages asks it: refused, in one red line, over Open.
  await messagesOf(other.page, TUTOR_WORDS)
  const gone = other.page.getByText('This passkey no longer opens your profiles.')
  await gone.waitFor({ timeout: 30_000 })
  assert.equal(await gone.getAttribute('class'), 'line red')
  await shot(other.page, 'not-yours')

  // After Forget, Start with it: its own seed, with no stamp and no profile, met here, not made here: This passkey
  // has never been verified, in Start's place; Continue to verification, Get verified. Messages has no back: the phone's own.
  await other.page.goBack()
  await button(other.page, 'Back').click()
  await button(other.page, 'You').click()
  await button(other.page, 'Forget this device').click()
  await button(other.page, 'Forget').click()
  await button(other.page, 'Start').click()
  await other.page.getByRole('region', { name: 'This passkey has never been verified' }).waitFor({ timeout: 60_000 })
  await button(other.page, 'Continue to verification').click()
  await other.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await other.context.close()
  await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId: key })

  assert.equal(await passkeyRows(page).count(), 1)
  await passkeysHome(page)
  say('passkeys: one made on a security key, opened elsewhere, removed, and its own seed after Forget')
})

test('signed in through the QR code: Save a passkey on this device? once; Save makes one here, added to the first, and the one in use here from then, so the next unlock asks this device, not the phone', async () => {
  const third = await phone()
  await answerFrom(third, first)
  const asked = first.counts.asserted
  await third.page.goto(APP)
  await elsewhere(third)
  await third.page.getByRole('region', { name: 'Save a passkey on this device?' }).waitFor({ timeout: 60_000 })
  await button(third.page, 'Save').click()
  await homeWith(third.page, TUTOR_WORDS)
  assert.equal(first.counts.asserted - asked, 1, 'the phone asked once, to sign in')
  assert.equal(third.counts.created, 1, 'one made here')
  const { credentials } = await third.cdp.send('WebAuthn.getCredentials', { authenticatorId: third.authenticator })
  assert.equal(credentials.length, 1)
  const here = idOf(credentials[0]!.credentialId)
  assert.equal(JSON.parse((await kept(third.page))['forest.passkey']!), here, 'the one in use here')
  const wallet = (await mainKey(seed, '')).address
  assert.equal((await backupsOn(wallet)).length, 1, 'added to the first')

  // The page closed: the next unlock is this device's own, the phone left alone.
  await closed(third.page)
  const before = [first.counts.asserted, third.counts.asserted]
  await messagesOf(third.page, TUTOR_WORDS)
  await third.page.locator('.filters').waitFor({ timeout: 60_000 })
  assert.deepEqual([first.counts.asserted - before[0]!, third.counts.asserted - before[1]!], [0, 1], 'this device asked, not the phone, at the tap into Messages')
  await third.context.close()

  // On the first device, two passkeys alike; the one saved there removed again.
  const { page } = first
  await toPasskeys(page)
  await passkeyRows(page).nth(1).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), 2)
  assert.deepEqual((await passkeyWords(page))[1], ['Passkey 2', 'Backup'], 'made on another device: nothing known of it here')
  await removePasskey(page, 'Passkey 2')
  await passkeysHome(page)
  say('signed in through the QR code: a passkey saved here, the next unlock asked here')
})

/** What the sheet before the 24 words warns, and the line under them. */
/** Passkeys' Your 24 recovery words, its own page, and its Show my words: the passkey asked, and the words on that page. */
async function showWords(page: Page) {
  await page.locator('button.row', { hasText: 'Your 24 recovery words' }).click()
  await button(page, 'Show my words').click()
  await page.locator('.words li').nth(23).waitFor({ timeout: 30_000 })
}

/** The 24 words Your 24 recovery words shows, in order, without their numbers. */
const wordsShown = async (page: Page) => (await page.locator('.words li').allTextContents()).map((t) => t.replace(/^\d+\s*/, '').trim())

test("24 words: Passkeys' Your 24 recovery words, a page of its own with its one line, Show my words asking the passkey, the seed held or not, then the words in three columns on that page, kept nowhere, gone with I wrote them down and with a reload; another browser types them from No passkey found: refused while it lists a different Forest, until Forget; then a new passkey opens the same profiles, and the first lists it", async () => {
  const { page, counts } = first
  await toPasskeys(page)
  const before = await passkeyRows(page).count()
  // Its own page, nothing floating: Back, its title, its one line; Show my words with the unlock icon, even with the seed held. Back asks nothing.
  await page.locator('button.row', { hasText: 'Your 24 recovery words' }).click()
  const sheet = page.locator('main')
  await page.getByRole('heading', { name: 'Your 24 recovery words', level: 1 }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/words', 'a page, with its own path')
  await nothingFloats(page, 'Your 24 recovery words')
  await sheet.getByText('Write them on paper, in order. Anyone with them can open your Forest.', { exact: true }).waitFor()
  const show = sheet.getByRole('button', { name: 'Show my words' })
  assert.ok(await asks(show), 'Show my words asks the passkey, even with the seed held')
  assert.equal((await sheet.locator('button.primary').textContent())?.trim(), 'Show my words', 'the primary')
  assert.equal(await page.locator('.words li').count(), 0, 'no words before the unlock')
  await shot(page, 'words-page')
  const asked = counts.asserted
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  assert.equal(counts.asserted, asked, 'Back asks nothing')
  await page.locator('button.row', { hasText: 'Your 24 recovery words' }).click()
  await show.click()
  await page.locator('.words li').nth(23).waitFor()
  assert.equal(await show.count(), 0, 'the words, then I wrote them down in its place, on the same page')
  assert.equal(counts.asserted, asked + 1, 'one unlock')
  const words = await wordsShown(page)
  assert.equal(words.join(' '), exportWords(seed), "the standard's 24 words for the seed")
  assert.equal((await page.locator('.words').evaluate((g) => getComputedStyle(g).gridTemplateColumns)).split(' ').length, 3, 'three columns')
  assert.deepEqual(await page.locator('.words li .xs').evaluateAll((n) => n.slice(0, 3).map((x) => x.textContent)), ['1', '2', '3'], 'each its number')
  await shot(page, 'words')
  const stored = JSON.stringify({ local: await kept(page), session: await page.evaluate(() => ({ ...sessionStorage })), history: await page.evaluate(() => history.state) })
  for (let i = 0; i + 3 <= 24; i++) assert.ok(!stored.includes(words.slice(i, i + 3).join(' ')), 'nothing keeps them')
  // I wrote them down: back on Passkeys, the words gone; shown again and the page reloaded: Show my words again, the words gone too.
  await button(page, 'I wrote them down').click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  assert.equal(await page.locator('.words li').count(), 0, 'gone once the page closed')
  await showWords(page)
  await page.reload()
  await page.getByRole('button', { name: 'Show my words' }).waitFor()
  assert.equal(await page.locator('.words li').count(), 0, 'gone with the page: a reload asks again')
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Passkeys' }).waitFor()
  await passkeysHome(page)
  await page.locator('button.card').first().waitFor()
  const cards = (await page.locator('button.card .nm2').allTextContents()).sort()

  // Another browser, which lists a Forest of its own: a passkey just made, Get verified, and back; its passkey sheet closed at Start, Start found nothing; I already use Forest, closed again, No passkey found, and Type my 24 words.
  const other = await phone()
  await other.page.goto(APP)
  await imNew(other)
  await other.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await button(other.page, 'Back').click()
  await closeTheSheetOnce(other.page)
  await button(other.page, 'Start').click()
  await closeTheSheetOnce(other.page)
  await button(other.page, 'I already use Forest').click()
  await button(other.page, 'Type my 24 words').click()
  await other.page.getByRole('heading', { name: 'Your 24 words' }).waitFor()
  // Its back: No passkey found again.
  await button(other.page, 'Back').click()
  await other.page.getByRole('region', { name: 'No passkey found' }).waitFor()
  await button(other.page, 'Type my 24 words').click()
  const box = other.page.getByLabel('Your 24 words')
  const create = button(other.page, 'Continue')
  assert.ok(await asks(create), 'Continue shows the unlock icon: it makes a passkey')
  const count = other.page.locator('.words-count')
  assert.equal(await count.textContent(), 'In order, with spaces between them0 of 24')
  assert.ok(await create.isDisabled(), 'Continue off until all 24 are there')
  await shot(other.page, 'words-in')
  const made = other.counts.created
  const line = other.page.locator('main .line')
  // Some missing: how many, and Continue still off; a word wrong: a red line; neither makes a passkey.
  await box.fill(words.slice(0, 23).join(' '))
  assert.equal(await count.textContent(), 'In order, with spaces between them23 of 24')
  assert.ok(await create.isDisabled(), 'still off at 23')
  await box.fill([...words.slice(0, 23), 'forest1'].join(' '))
  await create.click()
  await line.getByText('A word is wrong, or in the wrong place.', { exact: true }).waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  // The person's words, on a browser that lists another Forest: never two seeds on one device.
  await box.fill(words.join('  ').toUpperCase())
  await create.click()
  await line.getByText('These words open a different Forest.', { exact: true }).waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  assert.equal(await button(other.page, 'Continue').count(), 0, 'Forget this device in its place')
  assert.equal(other.counts.created, made, 'no passkey made')
  await shot(other.page, 'words-different')
  // Forget this device asks again, in its own place, then forgets.
  await button(other.page, 'Forget this device').click()
  await other.page.getByRole('group', { name: 'Forget this device?' }).waitFor()
  await button(other.page, 'Forget').click()
  await line.waitFor({ state: 'detached' })
  assert.deepEqual(Object.keys(await kept(other.page)), ['forest.passkeys'], 'forgotten: only the passkeys it knows')
  await button(other.page, 'Continue').click()
  await other.page.locator('button.card').first().waitFor({ timeout: 60_000 })
  assert.equal(other.counts.created, made + 1, 'one passkey made')
  assert.deepEqual((await other.page.locator('button.card .nm2').allTextContents()).sort(), cards, 'the same profiles')
  const there = JSON.stringify({ local: await kept(other.page), session: await other.page.evaluate(() => ({ ...sessionStorage })), history: await other.page.evaluate(() => history.state) })
  for (let i = 0; i + 3 <= 24; i++) assert.ok(!there.includes(words.slice(i, i + 3).join(' ')), 'nothing keeps them there either')
  // Its next unlock follows the new passkey's seed entry to the seed: the same words. There, the passkey made for the words is the
  // last, Passkey 2, since it sends no maker.
  await closed(other.page)
  await toPasskeys(other.page)
  assert.deepEqual((await passkeyWords(other.page)).at(-1), ['Passkey 2', 'Backup'], 'made there, for the words')
  await showWords(other.page)
  assert.deepEqual(await wordsShown(other.page), words, 'the same seed')
  await other.context.close()

  // The first lists one passkey more.
  await toPasskeys(page)
  await passkeyRows(page).nth(before).waitFor({ timeout: 30_000 })
  assert.equal(await passkeyRows(page).count(), before + 1)
  await passkeysHome(page)
  say('24 words: shown after an unlock and kept nowhere; typed in another browser, refused while it lists another Forest, then a passkey there opening the same profiles')
})

const COAT = 'A wool coat, worn twice.'
/** What the buyer asks for, at an exact spot. */
const WANTED = 'A warm winter coat, size M.'

test('clothing, with the index: a coat with two photos redrawn on the device, no per, for women, size XL, picked up or shipped, near Lavapiés, $40, listed; a buyer, with no location allowed, puts an area on the map and asks for a coat at an exact spot; the buyer messages, reviews, vouches and reports, and finds them under You wrote; the seller sees the rating, "3 new" on its pill, the card counting the three and the conversation, the three marked in the profile\'s Reviews and seen there; Messages holds the conversation alone', async () => {
  const { page, counts } = first
  // The seller's profile, and the coat.
  await button(page, 'New profile').click()
  await pickProfile(page, SELLER_WORDS)
  const seller = (await mainKey(seed, SELLER_LABEL)).address
  // The page closed and opened again on the profile: the seed dropped, so Post will ask, and show it.
  await closed(page)
  await button(page, 'New offer').click()
  const ask = (name: string) => fieldAsked(SHOP, S.seller, name)
  const [PHOTOS, TOP, KIND, WEARER, SIZE, SEVERAL, HANDOVER, WHERE] = [S.photos, S.top, S.opener, S.follow, S.sized, S.several, S.handover, S.place].map((n) => ask(n).label) as [string, string, string, string, string, string, string, string]
  await page.getByLabel(ask('description').label, { exact: true }).fill(COAT)
  const priceRow = await openRow(page, ask('price').label)
  await priceRow.getByLabel('Amount', { exact: true }).fill('40')
  assert.deepEqual(await priceRow.getByLabel('For', { exact: true }).locator('option').allTextContents(), ['the whole job'], 'a coat has no per: the whole deal alone')
  await closeRow(page, ask('price').label)
  assert.deepEqual(await rowSays(page, ask('price').label), ['$40'])
  const big = photoPng(2400, 1200, '#1e5e43', 'GPS 40.4089 -3.7007')
  const small = photoPng(800, 1000, '#313c34', 'GPS 40.4089 -3.7007')
  const photosRow = await openRow(page, PHOTOS)
  await photosRow.locator('input[type=file]').setInputFiles([
    { name: 'coat.png', mimeType: 'image/png', buffer: big },
    { name: 'back.png', mimeType: 'image/png', buffer: small },
  ])
  await page.locator('.tile img').nth(1).waitFor()
  assert.equal(await page.locator('.tile img').count(), 2)
  assert.match((await page.locator('.tile img').first().getAttribute('src')) ?? '', /^blob:/, 'shown from the device until sent')
  await closeRow(page, PHOTOS)
  assert.deepEqual(await rowSays(page, PHOTOS), ['2 photos'])
  // What is sold, a choice of one among more than a few: chips, each a radio, no tick box. Only
  // then the kind it opens, a few of one, as chips; then who it's for and the size, the questions the
  // kind opens, right after it. Who it's for takes several: each chip picked shows its tick.
  const M = S.market.listing
  const kindsOpened = Object.keys(M).filter((n) => M[n]!.when?.[S.opener]?.includes(S.kind) && Object.keys(M[n]!.when!).length === 1 && isFor(M[n]!, S.seller)).map((n) => ask(n).label)
  for (const opened of [KIND, WEARER, ...kindsOpened]) assert.equal(await rowOf(page, opened).count(), 0, `no ${opened} before what is sold`)
  const topRow = await openRow(page, TOP)
  assert.deepEqual([await topRow.getByRole('radiogroup').count(), await topRow.getByRole('checkbox').count()], [1, 0], 'one choice: radios, no tick box')
  assert.equal(await topRow.locator('.chips button[role=radio]').count(), valuesIn(S.top, S.market).length, 'each value a chip')
  await shot(page, 'picker-one')
  await topRow.getByRole('radio', { name: wordOf(S.top, S.topValue, S.market), exact: true }).click()
  await closeRow(page, TOP)
  assert.deepEqual(await rowSays(page, TOP), [wordOf(S.top, S.topValue, S.market)], 'one picked, in words, on its row')
  const kindRow = await openRow(page, KIND)
  await kindRow.getByRole('button', { name: wordOf(S.opener, S.kind, S.market), exact: true }).click()
  await closeRow(page, KIND)
  assert.deepEqual(await rowSays(page, KIND), [wordOf(S.opener, S.kind, S.market)], 'one picked, in words, on its row')
  const coatLabels = await page.locator('.field-head .name').allTextContents()
  assert.ok(coatLabels.indexOf(KIND) > coatLabels.indexOf(TOP), `the kind after what is sold: ${coatLabels.join(', ')}`)
  assert.ok(kindsOpened.every((n) => coatLabels.indexOf(n) > coatLabels.indexOf(KIND)), `the questions the kind opens, after it: ${coatLabels.join(', ')}`)
  assert.equal(coatLabels.at(-1), 'Contact')
  const wearer = await openRow(page, WEARER)
  const women = wordOf(S.follow, S.other, S.market)
  await wearer.getByRole('button', { name: women }).click()
  assert.deepEqual([await wearer.getByRole('button', { name: women }).getAttribute('aria-pressed'), await wearer.getByRole('button', { name: women }).locator('[data-icon="check"]').count()], ['true', 1], 'one of several, its tick')
  await closeRow(page, WEARER)
  // The size, by the market's labels for it: XL, never xl.
  const size = Object.keys(M[S.sized]!.ask!.labels!).find((v) => v !== v.toUpperCase()) ?? Object.keys(M[S.sized]!.ask!.labels!)[0]!
  const sizeWords = wordOf(S.sized, size, S.market)
  assert.notEqual(sizeWords, valueWords(size), 'its label, not its value in words')
  await pick(page, SIZE, sizeWords)
  assert.deepEqual(await rowSays(page, SIZE), [sizeWords])
  // A choice of several among chips: two picked, each with its tick.
  const [good, likeNew] = [valuesIn(S.several, S.market)[2]!, valuesIn(S.several, S.market)[1]!]
  const condition = await openRow(page, SEVERAL)
  await condition.getByRole('button', { name: wordOf(S.several, likeNew, S.market) }).click()
  await condition.getByRole('button', { name: wordOf(S.several, good, S.market) }).click()
  assert.equal(await condition.locator('[data-icon="check"]').count(), 2, 'both, each its tick')
  await closeRow(page, SEVERAL)
  // In person and shipped: the place, and where it ships, follow.
  const handover = await openRow(page, HANDOVER)
  await handover.getByRole('button', { name: wordOf(S.handover, S.inPerson, S.market) }).click()
  await handover.getByRole('button', { name: wordOf(S.handover, S.away, S.market) }).click()
  await closeRow(page, HANDOVER)
  // Where the coat is: the phone allowed its location, so the map goes there as it opens, the circle
  // in its middle at the field's own size, its caption under it; a size out; an exact spot, never from
  // the location alone, waits to be moved to the spot; back to the circle round the phone.
  const start = fieldAsked(SHOP, S.seller, S.place).start!.radiusKm!
  const out = [1, 2, 3, 5, 7, 10, 15, 20, 30, 50].find((r) => r > start)!
  const where = await placeScreen(page, WHERE)
  assert.equal(await sizeOf(where), `${start} km`)
  await where.locator('.place-caption', { hasText: new RegExp(`^Within ${start} km of `) }).waitFor({ timeout: 20_000 })
  await setSize(where, `${out} km`)
  await setSize(where, 'Exact spot')
  await where.getByText('Move the map to the spot.', { exact: true }).waitFor()
  await where.locator('.map-pin.middle').waitFor()
  assert.equal(await where.locator('.place-caption').count(), 0, 'no spot yet: the location alone is never one')
  await setSize(where, `${out} km`)
  await where.locator('.place-caption', { hasText: new RegExp(`^Within ${out} km of `) }).waitFor({ timeout: 20_000 })
  await closeRow(page, WHERE)
  const contactRow = await openRow(page, 'Contact')
  await contactRow.getByLabel('Contact', { exact: true }).fill('@coats')
  await closeRow(page, 'Contact')
  // The page hidden a moment keeps the seed, which closing it dropped: Post asks, and shows it.
  await away(page)
  assert.equal(await asks(button(page, 'Post')), true, 'the unlock icon on Post')
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Post's unlock icon, in its text color")
  await shot(page, 'listing-coat')
  const asked = counts.asserted
  await button(page, 'Post').click()
  const coatRow = offerCard(page, COAT)
  await coatRow.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock: the listing and its photos')
  const [[coatPath, coat]] = (await entriesOf(seller, 'listing')) as unknown as [[string, { entry: { body: any } }]]
  const body = coat.entry.body
  assert.deepEqual(
    [body.description, body.price, body[S.top], body[S.opener], body[S.follow], body[S.sized], body[S.several], body[S.handover], body.contact],
    [COAT, [{ amount: '40', currency: 'USD' }], S.topValue, S.kind, [S.other], [size], [likeNew, good], [S.inPerson, S.away], '@coats'],
    'no per; what is sold, the kind, who, the size by its value, two conditions, two ways to hand it over',
  )
  // Posted round the phone, its centre moved by up to a tenth of its radius, and nothing kept on the device.
  const [placed] = body[S.place] as Array<Point & { radiusKm: number }>
  assert.deepEqual([body[S.place].length, placed!.radiusKm, Object.keys(placed!).sort()], [1, out, ['lat', 'lon', 'radiusKm']], 'one circle, no name')
  const km = kmFromSpot(placed!)
  assert.ok(km <= out * 0.1 + 0.05, `its centre moved at most a tenth of ${out} km from the phone, ${km.toFixed(3)} km`)
  assert.equal((await kept(page))['forest.points'], undefined, 'nothing of where it is kept on the device')
  assert.equal(loadMarkets().checkEntry(SHOP, S.seller, 'listing', body), null, 'it fits the market')
  assert.equal(body[S.photos].length, 2)
  assert.deepEqual(body.files.map((f: any) => [f.sha256, f.type]), body[S.photos].map((sha: string) => [sha, 'image/jpeg']), 'each photo named in its files, a JPEG')
  const sizes = []
  for (const sha of body[S.photos] as string[]) {
    const res = await fetch(`${services.host}/v1/files/${sha}`)
    assert.equal(res.status, 200, 'sent to the host, which serves it to anyone')
    const bytes = new Uint8Array(await res.arrayBuffer())
    assert.ok(!Buffer.from(bytes).toString('latin1').includes('GPS 40.4089'), "the photo's note left on the device")
    sizes.push(jpegSize(bytes))
  }
  assert.deepEqual(sizes, [{ width: 1600, height: 800 }, { width: 800, height: 1000 }], 'its longest side at most 1600 pixels')
  assert.equal(await coatRow.locator('img.thumb').getAttribute('src'), `${services.host}/v1/files/${body[S.photos][0]}`, 'its first photo, from the host')
  await coatRow.locator('img.thumb').evaluate((img: HTMLImageElement) => img.decode())
  await coatRow.getByText('$40', { exact: true }).waitFor()
  assert.equal(await coatRow.getByText('Needs updating').count(), 0, 'it fits: nothing to update')
  await shot(page, 'profile-coat')
  // The index lists it: it fits the market as the index reads it.
  const onIndex = `${services.index}/profiles/${seller}/${coatPath}.json`
  for (const until = Date.now() + 45_000; ; ) {
    const res = await fetch(onIndex)
    const listed = res.ok ? ((await res.json()) as { listing: { listed: boolean; why?: string } }).listing : null
    if (listed?.listed) break
    if (Date.now() > until) throw new Error(`the index never listed the coat: ${listed?.why ?? res.status}`)
    await new Promise((r) => setTimeout(r, 1_000))
  }

  // A buyer: verified, their first profile, a message with the pencil, and a review from the thread.
  const buyer = await phone()
  await newPerson(buyer)
  await onward(buyer)
  await pickFirst(buyer.page, BUYER_WORDS)
  const buying = (await kept(buyer.page))['forest.profiles']!
  const buyerAddress = JSON.parse(buying)[0].address as string
  buyerAt = buyerAddress
  await button(buyer.page, 'Back').click()
  // A phone that hasn't allowed its location. Its browser told no before (headless Chromium's
  // answer for a site never granted): nothing is asked, and the map opens on the whole world, with no
  // circle, no button for the location and no line, and says to move it or search. A place searched
  // for by its name: the map goes there, its caption under it. Then an exact spot, there since it was
  // searched for: a pin in the middle, posted exactly there.
  await buyer.page.locator('button.card', { hasText: BUYER_WORDS }).click()
  await button(buyer.page, 'New request').click()
  const buyerAsk = (name: string) => fieldAsked(SHOP, S.buyer, name)
  const handing = await openRow(buyer.page, buyerAsk(S.handover).label)
  await handing.getByRole('button', { name: wordOf(S.handover, S.inPerson, S.market) }).click()
  await closeRow(buyer.page, buyerAsk(S.handover).label)
  const map = await placeScreen(buyer.page, buyerAsk(S.place).label)
  assert.equal(await map.getByRole('button', { name: 'Your location' }).count(), 0, 'told no before: no button')
  assert.equal(await map.locator('.line').count(), 0, 'and no line')
  await map.getByText('Move the map, or search a place.', { exact: true }).waitFor()
  await map.getByRole('searchbox', { name: 'Search a place' }).fill('madrid')
  const madrid = map.getByRole('option').filter({ hasText: /Spain/ }).first()
  await madrid.waitFor()
  await madrid.click()
  await map.locator('.place-caption', { hasText: /^Within \d+ km of / }).waitFor({ timeout: 20_000 })
  await shot(buyer.page, 'place-searched')
  await setSize(map, 'Exact spot')
  await map.getByText('Anyone can see this exact spot.', { exact: true }).waitFor()
  await map.locator('.place-caption', { hasText: /^Exact spot near / }).waitFor()
  await shot(buyer.page, 'place-spot')
  await closeRow(buyer.page, buyerAsk(S.place).label)
  assert.match((await rowSays(buyer.page, buyerAsk(S.place).label))[0]!, /^Exact spot near /)
  await buyer.page.getByLabel(buyerAsk('description').label, { exact: true }).fill(WANTED)
  await button(buyer.page, 'Post').click()
  await offerCard(buyer.page, WANTED).waitFor({ timeout: 60_000 })
  const [[, wanted]] = (await entriesOf(buyerAddress, 'listing')) as unknown as [[string, { entry: { body: any } }]]
  const [spot] = wanted.entry.body[S.place]
  assert.equal(spot.radiusKm, 0, 'an exact spot')
  assert.match(spot.lat, /^-?\d+(\.\d{1,4})?$/, 'to about 10 m')
  const { places: madrids } = (await (await fetch(`${services.places}/v1/find?q=madrid`)).json()) as { places: Array<{ country: string; place: Point }> }
  const searched = madrids.find((f) => f.country === 'ES')!.place
  assert.ok(kmApart(spot, searched) < 0.05, `exactly where the map went, ${(kmApart(spot, searched) * 1000).toFixed(0)} m from the place found, never moved`)
  assert.equal(loadMarkets().checkEntry(SHOP, S.buyer, 'listing', wanted.entry.body), null, 'it fits the market')
  // Never asked: the location is asked for as the place opens, the browser's own prompt with it; here
  // the prompt is refused: one quiet line, and the button goes.
  const { targetInfo } = await buyer.cdp.send('Target.getTargetInfo')
  await buyer.cdp.send('Browser.setPermission', { permission: { name: 'geolocation' }, setting: 'prompt', origin: APP.slice(0, -1), browserContextId: targetInfo.browserContextId! })
  await button(buyer.page, 'New request').click()
  const again = await openRow(buyer.page, buyerAsk(S.handover).label)
  await again.getByRole('button', { name: wordOf(S.handover, S.inPerson, S.market) }).click()
  await closeRow(buyer.page, buyerAsk(S.handover).label)
  const asking = await placeScreen(buyer.page, buyerAsk(S.place).label)
  await asking.getByText("Your location isn't allowed.", { exact: true }).waitFor()
  assert.equal(await asking.getByRole('button', { name: 'Your location' }).count(), 0, 'refused: the line alone')
  await shot(buyer.page, 'place-refused')
  await button(buyer.page, 'Close').click()
  await button(buyer.page, 'Back').click()
  // The page closed and opened again, so no seed is held; the messages button's tap asks the passkey, the prompt closed:
  // with none new, the lock and Open alone.
  await closed(buyer.page)
  await closeTheSheetOnce(buyer.page)
  await messagesOf(buyer.page, BUYER_WORDS)
  const none = buyer.page.locator('.unopened')
  await none.locator('[data-icon="lock-simple"]').waitFor()
  await button(buyer.page, 'Open').waitFor()
  assert.equal(await none.locator('h2').count(), 0, 'nothing new: Open alone')
  assert.equal(await buyer.page.getByText('No new messages').count(), 0, 'never "No new messages" beside Open')
  await shot(buyer.page, 'messages-none')
  // To one of their own profiles, by its link: From their profile on the other side, to make; nothing refused. There is
  // no box to type an address in, and /message with none opens Messages.
  assert.equal(await button(buyer.page, 'New message').count(), 0, 'no New message')
  await buyer.page.goto(`${APP}message?to=${buyerAddress}`)
  await buyer.page.getByRole('heading', { name: 'New message' }).waitFor()
  await badge(buyer.page.locator('.person.to .who', { hasText: SHOPPING })).waitFor()
  await buyer.page.locator('.from-line', { hasText: `You have no ${SELLER_WORDS} profile yet.` }).getByRole('button', { name: 'Create' }).waitFor()
  assert.equal(await buyer.page.locator('main .line').count(), 0, 'not refused')
  assert.equal(await buyer.page.getByLabel('To').count(), 0, 'no box for an address')
  await shot(buyer.page, 'message-own')
  await buyer.page.goto(APP)
  await buyer.page.goto(`${APP}message`)
  await buyer.page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  // Written from the coat, as an index's Message link opens it (/message?to=<address>&listing=<listing address>): at the
  // top, the listing, its first photo, its title, its price, and who posted it, their animal and short key; the message
  // box; one quiet line, From your Goods buyer profile, with its market's icon; Send at the foot, strong green.
  const coatAt = `${seller}/${coatPath}`
  await buyer.page.goto(`${APP}message?to=${seller}&listing=${encodeURIComponent(coatAt)}`)
  await buyer.page.getByRole('heading', { name: 'New message' }).waitFor()
  assert.equal(new URL(buyer.page.url()).search, '', 'its addresses out of the path')
  const top = buyer.page.getByRole('region', { name: 'The listing' })
  await top.getByText(COAT, { exact: true }).waitFor({ timeout: 20_000 })
  assert.deepEqual(
    await top.evaluate((t) => [t.querySelector('img.thumb')?.getAttribute('src'), t.querySelector('.d')?.textContent, t.querySelector('.by .av svg')?.getAttribute('data-animal'), t.querySelector('.by .name.key')?.textContent]),
    [`${services.host}/v1/files/${coat.entry.body[S.photos][0]}`, '$40', animal(seller), short(seller)],
    'its first photo, its price, and who posted it: their animal and short key',
  )
  assert.equal(await buyer.page.locator('.person.to').count(), 0, 'the listing in place of their card')
  const fromLine = buyer.page.locator('.from-line')
  await fromLine.getByText(`From your ${BUYER_WORDS} profile`, { exact: true }).waitFor()
  assert.equal(await fromLine.locator('[data-icon]').first().getAttribute('data-icon'), iconOf(SHOP), "its market's icon")
  const box = buyer.page.getByLabel('Message')
  const [topBox, boxBox, fromBox] = [(await top.boundingBox())!, (await box.boundingBox())!, (await fromLine.boundingBox())!]
  assert.ok(topBox.y < boxBox.y && boxBox.y < fromBox.y, 'the listing, the box, then the line')
  assert.equal(await button(buyer.page, 'Send').evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(buyer.page, 'forest'), 'Send, strong green')
  await box.fill('Is the coat still there?')
  await shot(buyer.page, 'message-from-listing')
  await button(buyer.page, 'Send').click()
  await buyer.page.locator('.said.mine', { hasText: 'Is the coat still there?' }).waitFor({ timeout: 60_000 })
  // The message carries the listing, its full address beside its text, in its copy too; and the conversation says what it
  // is about, pinned under its header as a small card: the coat's photo, its title and price, no About word, a tap opening
  // it on the index, since it is theirs.
  const buyerSeed = await seedOn(buyer.page)
  const { identity: buyerIdentity } = await openingHalf((await mainKey(buyerSeed, BUYER_LABEL)).secret)
  const [[, sentCopy]] = await entriesOf(buyerAddress, 'sent')
  assert.deepEqual(((await openLocked(sentCopy!.entry.body!, buyerIdentity)) as { body: unknown }).body, { text: 'Is the coat still there?', listing: coatAt }, '{ text, listing }')
  const about = buyer.page.locator('main a.pinned')
  await about.getByText(COAT, { exact: true }).waitFor()
  assert.deepEqual(
    await about.evaluate((a) => [a.querySelector('.about-word')?.textContent ?? null, a.querySelector('img.thumb')?.getAttribute('src'), a.querySelector('.two > span')?.textContent, a.getAttribute('href'), a.getAttribute('target')]),
    [null, `${services.host}/v1/files/${coat.entry.body[S.photos][0]}`, '$40', `${services.index}/profiles/${coatAt}`, '_blank'],
    'no About: its photo, title and price, opening it on the index',
  )
  const [headerBox, aboutBox, firstSaid] = [(await buyer.page.locator('main > .top').boundingBox())!, (await about.boundingBox())!, (await buyer.page.locator('.said.mine').first().boundingBox())!]
  assert.ok(aboutBox.y >= headerBox.y + headerBox.height - 1 && aboutBox.y - (headerBox.y + headerBox.height) < 30 && aboutBox.y + aboutBox.height <= firstSaid.y, 'pinned under the header, above the messages')
  await shot(buyer.page, 'thread-about')
  // A score and words: the market asks a review nothing of its own, so the form holds no question of it.
  await button(buyer.page, 'Review').click()
  const score = buyer.page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  const own = MARKETS.ask(SHOP, S.buyer, 'review', S.seller).filter((f) => !['subject', 'listing', 'score', 'text'].includes(f.name))
  for (const f of own) assert.equal(await buyer.page.getByRole('group', { name: f.label }).count(), 1, `the market's own question, ${f.label}`)
  assert.equal(await buyer.page.locator('.qrow').count(), own.length, 'no question the market does not ask')
  assert.equal(await buyer.page.getByRole('button', { name: COAT }).count(), 0, 'no listing of theirs to name')
  await buyer.page.getByLabel('Comment').fill('Just like the photos.')
  await shot(buyer.page, 'review-score')
  await button(buyer.page, 'Post').click()
  await buyer.page.getByLabel('Message').waitFor({ timeout: 60_000 })
  const [[, reviewed]] = (await entriesOf(buyerAddress, 'review')) as unknown as [[string, { entry: { body: any } }]]
  assert.deepEqual(reviewed.entry.body, { subject: seller, text: 'Just like the photos.', score: '10' })

  // A vouch and a report, from the seller's profile, opened from the thread's header: a vouch, written again in its place,
  // then a report, each about the seller.
  await buyer.page.locator('button.convo-head').click()
  const sellerPage = buyer.page.locator('main.them')
  await sellerPage.locator('.chip', { hasText: 'Not yours' }).waitFor()
  await button(buyer.page, 'Review').click()
  await badge(buyer.page.locator('.top .who', { hasText: SELLER_WORDS })).waitFor()
  // Vouch: its line, its neutral square, no score, its comment's own placeholder, and Vouch at the foot.
  const kinds = buyer.page.getByRole('group', { name: 'Kind' })
  await kinds.getByRole('button', { name: 'Vouch' }).click()
  await buyer.page.getByText("Say they're real and honest, without a score.").waitFor()
  assert.equal(await kinds.getByRole('button', { name: 'Vouch' }).locator('.icon').getAttribute('data-icon'), 'handshake')
  assert.equal(await buyer.page.locator('.kind-mark .sq.plain [data-icon="handshake"]').count(), 1, 'its neutral square: nothing else is green')
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'no score: a vouch')
  assert.equal(await buyer.page.locator('.qrow').count(), 0, "a review's questions only, where its market asks any")
  assert.equal(await buyer.page.getByLabel('Comment').getAttribute('placeholder'), 'How do you know them? (optional)')
  assert.match((await button(buyer.page, 'Vouch').last().getAttribute('class')) ?? '', /primary/)
  await shot(buyer.page, 'review-vouch')
  await buyer.page.getByLabel('Comment').fill('Real.')
  await buyer.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await sellerPage.waitFor({ timeout: 60_000 })
  const [[vouchAt]] = await entriesOf(buyerAddress, 'vouch')
  // Vouched again for the same person: in place of the first, never a second.
  await button(buyer.page, 'Review').click()
  await kinds.getByRole('button', { name: 'Vouch' }).click()
  await buyer.page.getByLabel('Comment').fill('Real and kind.')
  await buyer.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await sellerPage.waitFor({ timeout: 60_000 })
  const vouches = await entriesOf(buyerAddress, 'vouch')
  assert.deepEqual(vouches.map(([path, c]) => [path, c.entry.body]), [[vouchAt, { subject: seller, text: 'Real and kind.' }]], 'one vouch, at the first one\'s path')
  // Report: its line, its red square, Report in red at the foot.
  await button(buyer.page, 'Review').click()
  await buyer.page.locator('.top .who', { hasText: SELLER_WORDS }).waitFor()
  await kinds.getByRole('button', { name: 'Report' }).click()
  await buyer.page.getByText("Warn others it's fake or a scam.").waitFor()
  assert.equal(await buyer.page.locator('.kind-mark .sq.red [data-icon="flag"]').count(), 1, 'its red square')
  assert.equal(await buyer.page.getByLabel('Score').count(), 0, 'a report: text only')
  assert.equal(await buyer.page.getByLabel('Comment').getAttribute('placeholder'), 'What happened?')
  await buyer.page.getByLabel('Comment').fill('Sold me the wrong size twice.')
  const red = buyer.page.locator('.foot').getByRole('button', { name: 'Report' })
  assert.match((await red.getAttribute('class')) ?? '', /danger solid/, 'posted in red')
  assert.equal(await asks(red), false, 'the seed held since the review: Report will ask nothing')
  await shot(buyer.page, 'report')
  await red.click()
  await sellerPage.waitFor({ timeout: 60_000 })
  // What the buyer wrote, from their profile: its rating pill, No reviews yet, opens its Reviews; there, You wrote 3 ›, an
  // underlined link at the profile's line, opens them: each a card, About, the seller's animal and short key, no one having
  // named them, a pencil at its right, then its score or chip and the words; the whole card edits it.
  await button(buyer.page, 'Back').click()
  await button(buyer.page, 'Back').click()
  await buyer.page.locator('button.card', { hasText: BUYER_WORDS }).click()
  await buyer.page.locator('button.ratepill', { hasText: 'No reviews yet' }).click()
  await buyer.page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor()
  const wroteLink = buyer.page.locator('.of-line button.link', { hasText: 'You wrote 3 ›' })
  await wroteLink.waitFor({ timeout: 30_000 })
  assert.equal(await wroteLink.evaluate((b) => getComputedStyle(b).textDecorationLine), 'underline', 'an underlined link')
  await named(buyer.page.locator('.of-line'), BUYER_WORDS)
  assert.equal(await buyer.page.getByText(/^Rated by/).count(), 0, 'not which index rated it')
  await wroteLink.click()
  await buyer.page.getByRole('heading', { name: 'You wrote' }).waitFor()
  const given = buyer.page.locator('main .cards > button.card.wrote')
  await given.nth(2).waitFor()
  assert.deepEqual((await given.locator('.said-chip').allTextContents()).sort(), ['10', 'Report', 'Vouch'])
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(await given.nth(i).locator('.wrote-head').evaluate((h) => [...h.children].map((c) => c.classList[0])), ['about-word', 'av', 'name', 'grow', 'icon'], 'About, who, then the pencil at the right')
    assert.equal(await given.nth(i).locator('.wrote-head .name').textContent(), short(seller), 'their short key, no one having named them')
    assert.equal(await given.nth(i).locator('.pen').getAttribute('data-icon'), 'pencil-simple')
    assert.equal((await avatarOf(given.nth(i).locator('.av'))).icon, animal(seller), 'their animal')
  }
  await shot(buyer.page, 'profile-written')
  // Tapped, one opens to edit: its kind kept, its Delete; closed, You wrote again.
  await given.filter({ hasText: 'Real and kind.' }).click()
  await button(buyer.page, 'Delete').waitFor()
  assert.equal(await buyer.page.getByRole('group', { name: 'Kind' }).count(), 0, 'an edit keeps its kind')
  await button(buyer.page, 'Close').click()
  await buyer.page.getByRole('heading', { name: 'You wrote' }).waitFor()
  for (const kind of ['vouch', 'report']) assert.equal((await entriesOf(buyerAddress, kind)).length, 1, `one ${kind}, in the buyer's folder`)
  // The coat's link once more, opened on a laptop, for its picture there.
  if (shots) {
    await buyer.page.setViewportSize({ width: 1280, height: 800 })
    await buyer.page.goto(`${APP}message?to=${seller}&listing=${encodeURIComponent(coatAt)}`)
    await buyer.page.getByRole('region', { name: 'The listing' }).getByText(COAT, { exact: true }).waitFor({ timeout: 20_000 })
    await buyer.page.locator('.from-line').waitFor()
    await shot(buyer.page, 'laptop-message-from-listing')
  }
  await buyer.context.close()

  // The seller: back from the profile to New profile, its sheet open again where its ✓ opened it;
  // closed, then Home; the index's rating on the card, with its star, and what is new.
  await button(page, 'Back').click()
  await marketSheet(page, split(SELLER_WORDS)[0]).waitFor()
  await page.keyboard.press('Escape')
  await button(page, 'Back').click()
  await homeTitle(page).waitFor()
  const card = await untilCard(page, SELLER_WORDS, '10.0')
  assert.deepEqual(await card.locator('.rt2 > *').allTextContents(), ['10.0', '1 review'], 'its rating over how many reviews')
  assert.equal(await card.locator('.rate .icon').getAttribute('data-icon'), 'star')
  // The card counts the things with something new, once the index counts all three: the review, the vouch and the report,
  // and the conversation, opened by itself with the seed held since the coat: 4, never a number of messages. The Messages
  // tab counts the conversation alone.
  await untilCard(page, SELLER_WORDS, '4 new')
  await page.locator('.tabbar .corner', { hasText: '1' }).waitFor()
  await shot(page, 'home-rated')
  // The profile: the rating under its role, a pill, its star, its score, how many reviews, and "3 new" while something
  // came, no caret; the conversation, 1 on its messages button.
  await untilLine(page, SELLER_WORDS, '10.0 1 review')
  await page.locator('button.ratepill .new-words', { hasText: '3 new' }).waitFor()
  assert.deepEqual(await page.locator('button.ratepill .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['star'])
  await inbox(page).locator('.corner', { hasText: '1' }).waitFor()
  await shot(page, 'profile-new')
  await button(page, 'Back').click()
  // The rating opens the profile's Reviews: the profile's line, the score large, how many, never which index rated it;
  // they mark the new ones, first, newest first; seeing them, they are new no more. Each a card: its score or chip, who
  // wrote it right after, by their key, when and its dot, then what they wrote.
  await page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await page.locator('button.ratepill').click()
  await page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await page.locator('.rated .rate', { hasText: '10.0' }).waitFor({ timeout: 60_000 })
  await page.locator('.rated').getByText('1 review', { exact: true }).waitFor()
  const said = page.locator('main .cards button.said-card')
  const received = said.filter({ hasText: 'Just like the photos.' })
  await received.waitFor({ timeout: 60_000 })
  await said.nth(2).waitFor()
  assert.equal(await said.count(), 3)
  assert.deepEqual(await said.locator('.said-chip').allTextContents(), ['Report', 'Vouch', '10'], 'newest first')
  assert.deepEqual(await said.locator('.said-chip .icon').evaluateAll((i) => i.map((x) => (x as SVGElement).dataset.icon)), ['flag', 'handshake', 'star'])
  assert.equal(await said.locator('.dot').count(), 3, 'each with its dot')
  for (let i = 0; i < 3; i++) {
    assert.equal(await said.nth(i).locator('.said-head .name.key').textContent(), short(buyerAddress), 'who wrote it, by their key')
    assert.equal(await said.nth(i).getByText('From').count(), 0, 'no From')
  }
  assert.equal(await page.getByText(/^Rated by/).count(), 0, 'not which index rated it')
  await named(page.locator('.of-line'), SELLER_WORDS)
  assert.equal(await page.locator('.of-line button.link').count(), 0, 'it wrote none: no You wrote')
  await shot(page, 'profile-reviews')
  // A card opened: the review as received, the day, the score big with its star, no field of its
  // market's, since it asks none, and no listing named; From, a row: who wrote it, by their key, their badge, their market and
  // role; at the foot Message and Review back side by side, Report under them in red.
  await received.click()
  await page.getByText(new RegExp(`^On your ${SELLER_WORDS}, `)).waitFor()
  await page.locator('.score-big', { hasText: '10' }).locator('[data-icon="star"]').waitFor()
  assert.equal(await page.locator('.facts').count(), 0, 'no field, and no listing named')
  const from = page.locator('button.whorow')
  await badge(from).waitFor()
  await from.locator('.name.key', { hasText: short(buyerAddress) }).waitFor()
  await mkrIn(from, SHOPPING, S.buyer)
  assert.equal(await from.locator('[data-icon="caret-right"]').count(), 0, 'no caret: a row that opens what it shows')
  const [message, back, report] = [button(page, 'Message'), button(page, 'Review back'), button(page, 'Report')]
  const [m, b] = [(await message.boundingBox())!, (await back.boundingBox())!]
  assert.ok(Math.abs(m.y - b.y) < 2 && m.x < b.x, 'Message and Review back side by side')
  assert.deepEqual(await back.evaluate((b) => [b.className, getComputedStyle(b).boxShadow, getComputedStyle(b.querySelector('.icon')!).color]), ['', `${await tokenColor(page, 'ink')} 0px 0px 0px 1.5px inset`, await tokenColor(page, 'sun')], 'Review back, outlined like Message, its star in the sun')
  assert.ok((await report.boundingBox())!.y > m.y, 'Report under them')
  assert.match((await report.getAttribute('class')) ?? '', /danger/)
  await shot(page, 'received')
  // From, tapped: their profile. Back, and Not yours; their header; their key on its chip; three numbers; Message and Review;
  // their page on the index in a new tab.
  await from.click()
  const them = page.locator('main.them')
  await them.locator('.chip', { hasText: 'Not yours' }).waitFor()
  assert.deepEqual(await them.locator('.ph2').evaluate((el) => [el.querySelector('.mk')?.textContent, el.querySelector('.rl')?.firstChild?.textContent]), [SHOPPING, roleWords(S.buyer)])
  await badge(them.locator('.ph2')).waitFor()
  const chip = them.locator('button.idchip.key')
  await chip.locator('[data-icon="pencil-simple"]').waitFor()
  assert.equal(await chip.textContent(), short(buyerAddress), 'their short key: no one named them')
  await them.locator('.stat3').waitFor({ timeout: 30_000 })
  assert.deepEqual(await them.locator('.stat3 > span').evaluateAll((s) => s.map((x) => [...x.children].map((c) => c.textContent))), [['–', 'No reviews'], ['1', 'request'], ['3', 'written']], 'no rating, one request, three written')
  assert.match((await button(page, 'Message').getAttribute('class')) ?? '', /primary/)
  assert.deepEqual(await button(page, 'Review').evaluate((b) => [b.className, getComputedStyle(b.querySelector('.icon')!).color]), ['', await tokenColor(page, 'sun')], 'Review, outlined, its star in the sun')
  const site = them.getByRole('link', { name: 'See everything on the index' })
  assert.deepEqual([await site.getAttribute('href'), await site.getAttribute('target')], [`${services.index}/profiles/${buyerAddress}`, '_blank'])
  await shot(page, 'them')
  // Review: from the seller, about them; closed, their profile again.
  await button(page, 'Review').click()
  await page.locator('.top .who .name.key', { hasText: short(buyerAddress) }).waitFor()
  await button(page, 'Close').click()
  await them.waitFor()
  await button(page, 'Back').click()
  // Review back, from the review: about who wrote it, from the profile it was on.
  await button(page, 'Review back').click()
  await page.locator('.top .who .name.key', { hasText: short(buyerAddress) }).waitFor()
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await button(page, 'Back').click()
  await page.locator('button.ratepill').waitFor()
  assert.equal(await page.locator('button.ratepill .new-words').count(), 0, 'seen: nothing new on the rating')
  await button(page, 'Back').click()
  await page.locator('.tabbar .corner', { hasText: '1' }).waitFor()
  assert.equal(await card.locator('.corner').getAttribute('aria-label'), '1 new', "the card counting the conversation alone now, the three seen in the profile's Reviews")
  await page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await page.locator('button.ratepill').click()
  await received.waitFor()
  assert.equal(await said.locator('.dot').count(), 0, 'seen once: new no more')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // The page closed and opened again: the conversation, opened by itself and seen by no one, is new still, and with nothing
  // unlocked how many conversations it makes isn't known: the dot, on the card and on the Messages tab. The tab's tap asks
  // the passkey itself; Messages holds the conversation, its row saying what it is about, the coat's title beside who; no
  // review, vouch or report.
  await closed(page)
  await page.locator('button.card', { hasText: SELLER_WORDS }).locator('.corner.dot').waitFor({ timeout: 45_000 })
  await page.locator('.tabbar .corner.dot').waitFor()
  await page.locator('.tabbar button', { hasText: 'Messages' }).click()
  const coatTalk = page.locator('button.thread-row', { hasText: short(buyerAddress) })
  await coatTalk.locator('.about-title', { hasText: COAT }).waitFor({ timeout: 60_000 })
  assert.equal(await coatTalk.locator('.about-title').evaluate((t) => getComputedStyle(t).textOverflow), 'ellipsis', 'its title, cut with "…" when too long')
  assert.equal(await page.locator('.said-chip').count(), 0, 'messages only: no review, vouch or report')
  await shot(page, 'messages-about')
  await button(page, 'Home').click()
  say("clothing: two photos redrawn and sent, a review, a vouch and a report, under You wrote; the rating with 3 new, the card counting them and the conversation, the profile's Reviews, and Messages")
})

test("someone else's profile from a conversation, and the names you give others: their short key by default; Message from their profile opens the conversation; a name, saved where their chip opens in place, for you alone, in the Profiles folder, locked; the name in place of the key in the conversation, Messages, Review and the reviews they wrote; the name back on another device after one unlock; Show the key instead", async () => {
  const { page, counts } = first
  const wallet = await mainKey(seed, '')
  const key = short(buyerAt)
  // The seller's conversation with the buyer, the messages opened at the Messages tab's unlock; its header, a tap, opens their profile.
  let asked = counts.asserted
  await page.locator('.tabbar button', { hasText: 'Messages' }).click()
  const row = page.locator('button.thread-row', { hasText: key })
  await row.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held since that unlock')
  await row.click()
  const head = page.locator('button.convo-head')
  await head.locator('.name.key', { hasText: key }).waitFor()
  await head.click()
  const them = page.locator('main.them')
  await them.locator('.chip', { hasText: 'Not yours' }).waitFor()
  const chip = them.locator('button.idchip')
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], [key, 'idchip key'], 'their short key, in its own face')
  // Message: the conversation open in this page, again; back, their profile.
  await button(page, 'Message').click()
  await page.getByText('Is the coat still there?').waitFor()
  await button(page, 'Back').click()
  await them.waitFor()

  // Naming them, opened in place under their header by the chip, nothing floating: an empty Name, only you see it; no Show
  // the key instead yet. Their full address shows nowhere, and nothing copies it.
  // Their header whole first (who they are, read from the host), so it doesn't grow under the sheet as it is measured.
  await badge(them.locator('.ph2')).waitFor()
  await chip.click()
  const sheet = page.getByRole('region', { name: 'Name them' })
  await underIt(them.locator('.titled'), sheet)
  assert.equal(await chip.getAttribute('aria-expanded'), 'true')
  await nothingFloats(page, 'naming them')
  assert.deepEqual([await page.getByText(buyerAt).count(), await sheet.getByRole('button', { name: 'Copy' }).count(), await sheet.locator('[data-icon="key"]').count()], [0, 0, 0], 'no full key, no Copy')
  assert.ok(!(await page.locator('body').innerText()).includes(buyerAt), 'their full address nowhere on the screen')
  assert.equal(await sheet.getByLabel('Name').inputValue(), '')
  await sheet.getByText('Only you see it.', { exact: true }).waitFor()
  assert.equal(await sheet.getByRole('button', { name: 'Show the key instead' }).count(), 0)
  const save = sheet.getByRole('button', { name: 'Save' })
  assert.equal(await asks(save), false, 'the seed held since the Messages tab asked it: Save will ask nothing')
  await shot(page, 'naming')
  await sheet.getByLabel('Name').fill('Marta')
  asked = counts.asserted
  await save.click()
  await sheet.waitFor({ state: 'detached', timeout: 30_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked')
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], ['Marta', 'idchip'], 'the name, in place of the key')
  assert.equal(await them.getByText(key).count(), 0, 'never the name and the key side by side')
  await shot(page, 'them-named')
  // Underneath: one locked entry in the Profiles folder, which only the seed opens; nothing in the seller's own folder.
  const body = (await readFolder([services.host], wallet.address, Date.now())).current.get('names')?.entry.body
  assert.ok(isLocked(body), 'locked')
  assert.ok(!JSON.stringify(body).includes('Marta') && !JSON.stringify(body).includes(buyerAt), 'nothing readable')
  assert.deepEqual(await openLocked(body!, (await openingHalf(wallet.secret)).identity), { names: [{ address: buyerAt, name: 'Marta' }] })
  const seller = (await mainKey(seed, SELLER_LABEL)).address
  assert.equal((await readFolder([services.host], seller, Date.now())).current.has('names'), false, "nothing in the seller's own folder")
  assert.deepEqual(JSON.parse((await kept(page))['forest.names']!), { [buyerAt]: 'Marta' }, 'a copy on the device')

  // The name everywhere they show, for this person: the conversation's header, Review's, Messages, the reviews they wrote.
  await button(page, 'Back').click()
  await head.locator('.name', { hasText: 'Marta' }).waitFor()
  assert.equal(await head.getByText(key).count(), 0)
  assert.equal(await head.locator('.mkr').count(), 0, 'no market line')
  await button(page, 'Review').click()
  await page.locator('.top .who .name', { hasText: 'Marta' }).waitFor()
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await page.locator('button.thread-row', { hasText: 'Marta' }).waitFor()
  assert.equal(await page.locator('button.thread-row', { hasText: key }).count(), 0, 'in Messages, the name alone')
  assert.equal(await page.locator('button.thread-row', { hasText: 'Marta' }).locator('.thread-top .name:not(.key)').textContent(), 'Marta', 'bold, in the words\' face')
  await shot(page, 'messages-named')
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await page.locator('button.ratepill').click()
  const said = page.locator('main .cards button.said-card')
  await said.nth(2).waitFor({ timeout: 30_000 })
  assert.deepEqual(await said.locator('.said-head .name').allTextContents(), ['Marta', 'Marta', 'Marta'], 'on the reviews she wrote')
  await button(page, 'Back').click()
  await button(page, 'Back').click()

  // Another device, the same passkey answering: after the one unlock at Start, the name there too.
  const other = await phone()
  await answerFrom(other, first)
  await other.page.goto(APP)
  await elsewhere(other)
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await homeWith(other.page, SELLER_WORDS)
  assert.deepEqual(JSON.parse((await kept(other.page))['forest.names']!), { [buyerAt]: 'Marta' }, 'read from the Profiles folder at the unlock')
  await other.page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await other.page.locator('button.ratepill').click({ timeout: 60_000 })
  await other.page.locator('main .cards button.said-card .said-head .name', { hasText: 'Marta' }).first().waitFor({ timeout: 60_000 })
  await other.context.close()

  // Show the key instead, from her profile, opened by a review's From: the name taken back, the key again, the entry
  // deleted, and the device's copy.
  await page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await page.locator('button.ratepill').click()
  await said.first().click()
  await page.locator('button.whorow').click()
  await chip.filter({ hasText: 'Marta' }).click()
  const named = page.getByRole('region', { name: 'Name them' })
  await named.waitFor()
  assert.equal(await named.getByLabel('Name').inputValue(), 'Marta')
  await shot(page, 'naming-named')
  await named.getByRole('button', { name: 'Show the key instead' }).click()
  await named.waitFor({ state: 'detached', timeout: 30_000 })
  assert.deepEqual([await chip.textContent(), await chip.getAttribute('class')], [key, 'idchip key'], 'the key again')
  assert.equal((await kept(page))['forest.names'], undefined, 'nothing kept')
  assert.equal((await readFolder([services.host], wallet.address, Date.now())).current.get('names')?.entry.body, null, 'the entry deleted')
  // Naming someone, on a laptop: the same, in place in the column; a second tap on the chip closes it.
  await page.setViewportSize({ width: 1280, height: 800 })
  await chip.click()
  const naming = page.getByRole('region', { name: 'Name them' })
  await underIt(them.locator('.titled'), naming)
  await nothingFloats(page, 'naming them, on a laptop')
  await shot(page, 'laptop-naming')
  await chip.click()
  await naming.waitFor({ state: 'detached' })
  await page.setViewportSize({ width: 390, height: 844 })
  // Back from her profile, the review, the Reviews and the seller's profile: Home.
  for (let i = 0; i < 4; i++) await button(page, 'Back').click()
  await homeTitle(page).waitFor()
  say("someone else's profile, from a conversation and a review's From; named, the name everywhere, on another device after its unlock; the key again")
})

const TROUSERS = 'Linen trousers, worn once.'

/** The yellow !, in a count's place, as drawn: on the sun, its ink dark, in both looks. */
async function warned(mark: Locator) {
  await mark.waitFor({ timeout: 30_000 })
  assert.deepEqual(await mark.evaluate((m) => [m.textContent, m.getAttribute('aria-label'), getComputedStyle(m).backgroundColor]), ['!', 'Needs updating', await tokenColor(mark.page(), 'sun')], 'the yellow !')
}

test('a listing its market no longer fits: the yellow ! on its profile\'s card and on its own, Needs updating in its price\'s place; its edit, from its page, one yellow note at its top, what still fits filled in, the rest in yellow; posted, it replaces the old one in place, and the marks go', async () => {
  const { page } = first
  // Written to the host as the app wrote it before the markets moved: one wearer, not a list, a size
  // as text, either for delivery, an area alone for its location.
  const main = await mainKey(seed, SELLER_LABEL)
  const path = 'listing/0123456789abcdef0123456789abcdef'
  const M = S.market.listing
  const ask = (name: string) => fieldAsked(SHOP, S.seller, name)
  const [KIND, WEARER, SEVERAL, CHAIN, SIZE, PRICE] = [S.opener, S.follow, S.several, S.chain, S.sized, 'price'].map((n) => ask(n).label) as [string, string, string, string, string, string]
  const old: Body = { description: TROUSERS, price: { amount: '25', currency: 'USD' }, [S.top]: S.topValue, [S.opener]: S.kind, [S.follow]: S.other, [S.sized]: 'EU 38', [S.several]: 'either', [S.place]: { area: 'Lavapiés, Madrid' }, contact: '@coats' }
  assert.notEqual(loadMarkets().checkEntry(SHOP, S.seller, 'listing', old), null, "it doesn't fit the market today")
  // Three days ago, so it was posted before what came today.
  const view = await readFolder([services.host], main.address, Date.now())
  const [outcome] = await write([services.host], [entry(main, path, old, nextTime(Date.now() - 3 * 86_400_000, view, path))])
  assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')

  // Home, opened again so it reads what a market outgrew: the yellow ! in the count's place on the seller's card.
  await button(page, 'You').click()
  await button(page, 'Home').click()
  const sellerCard = page.locator('button.card', { hasText: SELLER_WORDS })
  await warned(sellerCard.locator('.avwrap > .corner.warn'))
  await shot(page, 'home-update')
  // On the profile, its card first, as it needs the person: the ! on its picture's corner, and Needs updating in yellow in
  // its price's place; the coat as it was.
  await sellerCard.click()
  const row = offerCard(page, TROUSERS)
  await warned(row.locator('.offer-pic > .corner.warn'))
  assert.deepEqual(await row.locator('.needs').evaluate((n) => [n.textContent, getComputedStyle(n).backgroundColor]), ['Needs updating', await tokenColor(page, 'sun-bg')], 'in yellow')
  assert.equal(await row.locator('.offer-price').count(), 0, "in its price's place")
  assert.equal(await offerCard(page, COAT).locator('.needs, .corner').count(), 0, 'the coat fits')
  assert.match((await page.locator('main button.offer').first().textContent()) ?? '', new RegExp(TROUSERS), 'first: it needs the person')
  await shot(page, 'profile-update')
  // Its page, its card saying so too, which opens its edit: one yellow note at its top.
  await row.click()
  await page.locator('button.card.offer-big .needs', { hasText: 'Needs updating' }).waitFor()
  await page.locator('button.card.offer-big').click()
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  const redo = page.locator('main p.redo')
  assert.deepEqual(await redo.evaluate((n) => [n.textContent, getComputedStyle(n).backgroundColor]), ['This market changed. Answers to redo are in yellow.', await tokenColor(page, 'sun-bg')], 'one yellow note at its top')
  // What still fits, filled in: the description, what is sold, the kind and the contact. Each answer that didn't
  // fit marked on its row: the price, one where the market now takes a list; who it's for, the size
  // and the condition, asked again. Where it is waits on how it is handed over, which the old one
  // never said, so it is not asked at all.
  assert.equal(await page.getByLabel(ask('description').label, { exact: true }).inputValue(), TROUSERS)
  assert.deepEqual(await rowSays(page, PRICE), [ask('price').question])
  const marked = async () => (await page.locator('.field-row.changed .field-head .name').allTextContents()).sort()
  assert.deepEqual(await marked(), [PRICE, WEARER, SIZE, SEVERAL].sort(), 'what no longer fit, marked')
  assert.deepEqual([...new Set(await page.locator('.field-row.changed .changed-line').allTextContents())], ['Changed: answer again.'])
  assert.deepEqual([...new Set(await page.locator('.field-row.changed').evaluateAll((r) => r.map((x) => getComputedStyle(x).backgroundColor)))], [await tokenColor(page, 'sun-bg')], 'each such row in yellow')
  const price = await openRow(page, PRICE)
  await price.getByLabel('Amount', { exact: true }).fill('25')
  await closeRow(page, PRICE)
  assert.deepEqual(await marked(), [WEARER, SIZE, SEVERAL].sort(), 'answered, its mark gone')
  assert.deepEqual(await rowSays(page, KIND), [wordOf(S.opener, S.kind, S.market)])
  assert.deepEqual(await rowSays(page, 'Contact'), ['@coats'])
  assert.equal(await rowOf(page, ask(S.place).label).count(), 0, 'no place: nothing says how it is handed over')
  await shot(page, 'listing-update')
  // Who it's for, then the question that answer opens, down the chain: for children, their age.
  const chained = valuesIn(S.chain, S.market)[0]!
  assert.equal(await rowOf(page, CHAIN).count(), 0, `no ${CHAIN.toLowerCase()} before who it's for`)
  const wearer = await openRow(page, WEARER)
  assert.equal(await wearer.locator('[aria-pressed=true]').count(), 0, 'nothing picked')
  await wearer.getByRole('button', { name: wordOf(S.follow, S.opens, S.market) }).click()
  await closeRow(page, WEARER)
  await pick(page, CHAIN, wordOf(S.chain, chained, S.market))
  await button(page, 'Post').click()
  // Back on its page: posted, it fits, so its card says Needs updating no more.
  await page.locator('button.card.offer-big', { hasText: TROUSERS }).locator('.offer-price').waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('button.card.offer-big .needs').count(), 0, 'its card fits')
  const listed = await entriesOf(main.address, 'listing')
  assert.deepEqual(
    listed.filter(([, e]) => (e.entry.body as any)?.description === TROUSERS).map(([p]) => p),
    [path],
    'in place of the old one: its own path, and no second',
  )
  const body = listed.find(([p]) => p === path)![1].entry.body as any
  assert.equal(loadMarkets().checkEntry(SHOP, S.seller, 'listing', body), null, 'it fits the market')
  assert.deepEqual(
    [body.description, body.price, body[S.top], body[S.opener], body[S.follow], body[S.chain], body.contact],
    [TROUSERS, [{ amount: '25', currency: 'USD' }], S.topValue, S.kind, [S.opens], [chained], '@coats'],
  )
  assert.deepEqual([body[S.sized], body[S.several], body[S.place]], [undefined, undefined, undefined], "what didn't fit, gone")
  await button(page, 'Back').click()
  await offerCard(page, TROUSERS).waitFor()
  assert.equal(await offerCard(page, TROUSERS).locator('.needs, .corner').count(), 0, 'nor on its card on the profile')
  await button(page, 'Back').click()
  await sellerCard.locator('.avwrap > .corner.warn').waitFor({ state: 'detached', timeout: 30_000 })
  say("a listing its market no longer fits: the ! on its profile's card and its own, Needs updating, its edit's yellow note, what fits filled in and the rest in yellow, posted in place in the market's shape today")
})

const PAID = 'Paid on time, picked it up as agreed.'

test('a review an older market shaped: the yellow ! on its profile\'s card, its rating pill and You wrote; there, its card says Needs updating; opened, what still fits is filled in; posted, it fits and the marks go', async () => {
  const { page } = first
  // Written to the host from the seller about the buyer, as an older app might have: with an answer to
  // a question the market asks no more.
  const main = await mainKey(seed, SELLER_LABEL)
  const path = 'review/0123456789abcdef0123456789abcdef'
  const old = { subject: buyerAt, score: '8', text: PAID, speed: 'fast' }
  assert.notEqual(loadMarkets().checkEntry(SHOP, S.seller, 'review', old, S.buyer), null, "it doesn't fit the market today")
  const view = await readFolder([services.host], main.address, Date.now())
  const [outcome] = await write([services.host], [entry(main, path, old, nextTime(Date.now(), view, path))])
  assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')

  // The ! on the seller's card; on its profile, on its rating pill, the way to the reviews it wrote; on its Reviews, beside
  // You wrote 1 ›; and on You wrote, its card says Needs updating.
  await button(page, 'You').click()
  await button(page, 'Home').click()
  const sellerCard = page.locator('button.card', { hasText: SELLER_WORDS })
  await warned(sellerCard.locator('.avwrap > .corner.warn'))
  await sellerCard.click()
  await warned(page.locator('button.ratepill > .corner.warn'))
  await page.locator('button.ratepill').click()
  await page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor()
  await warned(page.locator('.of-line > .corner.warn'))
  await page.locator('.of-line button.link', { hasText: 'You wrote 1 ›' }).click()
  await page.getByRole('heading', { name: 'You wrote' }).waitFor()
  const wrote = page.locator('main button.card.wrote', { hasText: PAID })
  assert.deepEqual(await wrote.locator('.needs').evaluate((n) => [n.textContent, getComputedStyle(n).backgroundColor]), ['Needs updating', await tokenColor(page, 'sun-bg')], 'in yellow')
  await shot(page, 'written-update')
  await wrote.click()
  // The edit: its kind kept, so no switch; who it is about at the top.
  await badge(page.locator('.top .who', { hasText: BUYER_WORDS })).waitFor()
  assert.equal(await page.getByRole('group', { name: 'Kind' }).count(), 0, 'an edit keeps its kind')
  assert.equal(await page.getByLabel('Comment').inputValue(), PAID)
  assert.equal(await page.locator('.score .big').textContent(), '8')
  await shot(page, 'review-update')
  await button(page, 'Post').click()
  await page.getByRole('heading', { name: 'You wrote' }).waitFor({ timeout: 60_000 })
  await wrote.locator('.needs').waitFor({ state: 'detached', timeout: 30_000 })
  const body = (await entriesOf(main.address, 'review')).find(([p]) => p === path)![1].entry.body as any
  assert.equal(loadMarkets().checkEntry(SHOP, S.seller, 'review', body, S.buyer), null, 'it fits the market')
  assert.deepEqual(body, { subject: buyerAt, score: '8', text: PAID }, "what didn't fit, gone")
  // Back from You wrote, the Reviews and the profile: Home, opened again, the ! gone.
  for (let i = 0; i < 3; i++) await button(page, 'Back').click()
  await homeTitle(page).waitFor()
  await sellerCard.locator('.avwrap > .corner.warn').waitFor({ state: 'detached', timeout: 30_000 })
  say('an old review: the ! on its card, its pill and You wrote, what fits filled in, posted in the shape today')
})

test("a review that names its listing, as another app or an AI writes one: its About box on the profile it is about, among the reviews it received, the listing's title, a tap opening it on the index; one the index holds none of: No longer listed; one of a profile in neither: no About; You wrote holds it as any review written", async () => {
  const { page } = first
  // The seller's review of the buyer, written again to the host naming the buyer's request: a review's listing is the deal's.
  const main = await mainKey(seed, SELLER_LABEL)
  const reviewPath = 'review/0123456789abcdef0123456789abcdef'
  const [[wantedPath]] = await entriesOf(buyerAt, 'listing')
  const wantedAt = `${buyerAt}/${wantedPath}`
  const named = async (listing: string) => {
    const body = { subject: buyerAt, score: '8', text: PAID, listing }
    assert.equal(loadMarkets().checkEntry(SHOP, S.seller, 'review', body, S.buyer), null, 'it fits the market')
    const view = await readFolder([services.host], main.address, Date.now())
    const [outcome] = await write([services.host], [entry(main, reviewPath, body, nextTime(Date.now(), view, reviewPath))])
    assert.ok(outcome?.results.length === 1 && outcome.results[0]!.ok, 'written')
    // Counted by the index naming it (one review per writer, subject and listing).
    for (const until = Date.now() + 45_000; ; ) {
      const received = ((await (await fetch(`${services.index}/profiles/${buyerAt}.json`)).json()) as { reviews?: { received?: Array<{ address: string; counted: boolean; why?: string; body: { listing?: string } }> } }).reviews?.received ?? []
      const it = received.find((r) => r.address === `${main.address}/${reviewPath}`)
      if (it?.counted && it.body.listing === listing) break
      if (Date.now() > until) throw new Error(`the index never counted it naming the listing: ${it?.why ?? 'not there'}`)
      await new Promise((r) => setTimeout(r, 1_000))
    }
  }
  /** The buyer's page, from the seller's conversation with them, read anew: the page opened again, the messages' tap asking the passkey. */
  const theirPage = async () => {
    await page.goto(APP)
    await messagesOf(page, SELLER_WORDS)
    await page.locator('button.thread-row', { hasText: short(buyerAt) }).click()
    await page.locator('button.convo-head').click()
    const them = page.locator('main.them')
    await them.locator('.chip', { hasText: 'Not yours' }).waitFor()
    return them.locator('.said-card', { hasText: PAID })
  }
  await named(wantedAt)
  // On the profile it is about, among the reviews it received: under its words, About, the request's title, opening it on
  // the index in a new tab; no photo, so its market's icon on its color.
  const card = await theirPage()
  const about = card.locator('.about-box')
  await about.getByText(WANTED, { exact: true }).waitFor({ timeout: 45_000 })
  assert.deepEqual(await about.evaluate((a) => [a.tagName, a.querySelector('.about-word')?.textContent, a.getAttribute('href'), a.getAttribute('target'), a.querySelector('.mthumb')?.getAttribute('style')?.includes('--h') ?? false]), ['A', 'About', `${services.index}/profiles/${wantedAt}`, '_blank', true], 'About, opening it on the index; no photo, so its market\'s icon on its color')
  const [aboutBox, words] = [(await about.boundingBox())!, (await card.locator('.said-text').boundingBox())!]
  assert.ok(aboutBox.y >= words.y + words.height - 1, "under the review's words")
  await shot(page, 'them-review-about')
  // You wrote, the seller's: its card, About and the buyer, a pencil, the whole card its edit; no box in it.
  await page.goto(APP)
  await page.locator('button.card', { hasText: SELLER_WORDS }).click()
  await page.locator('button.ratepill').click()
  await page.locator('.of-line button.link', { hasText: /^You wrote/ }).click()
  const wrote = page.locator('main button.card.wrote', { hasText: PAID })
  await wrote.waitFor({ timeout: 30_000 })
  assert.equal(await wrote.locator('.about-box').count(), 0, 'no box inside the card, which is its edit')
  // Named again, a listing the index holds none of: No longer listed, its tap gone.
  await named(`${buyerAt}/listing/00000000000000000000000000000000`)
  const gone = (await theirPage()).locator('.about-box')
  await gone.getByText('No longer listed', { exact: true }).waitFor({ timeout: 30_000 })
  assert.deepEqual(await gone.evaluate((a) => [a.tagName, a.querySelector('.about-word')?.textContent]), ['DIV', 'About'], 'no tap')
  await shot(page, 'review-about-gone')
  // Named again, a listing of a profile that is in neither (the tutor's offer, listed on the index): no About box, the review
  // as ever, so a review can't borrow someone else's listing.
  const [[offerPath]] = (await entriesOf(tutor, 'listing')).filter(([, e]) => (e.entry.body as { description?: unknown }).description === OFFER)
  await named(`${tutor}/${offerPath}`)
  const borrowed = await theirPage()
  await borrowed.getByText(PAID, { exact: true }).waitFor()
  await page.waitForTimeout(1_500)
  assert.equal(await borrowed.locator('.about-box').count(), 0, "a third profile's listing: no About")
  await named(wantedAt)
  await page.goto(APP)
  say('a review naming its listing: About, its title, opening it on the index; one gone, No longer listed')
})

const OWN = 'Patient with my own questions.'
const VOUCH = 'Real, and there every week.'

test("no review of one's own profiles: from their student, about their tutor, refused before the unlock in one red line; someone else's vouch, new: counted on the tutor's card, 1 new on its rating, first in its Reviews with its dot; opened, it is seen", async () => {
  const { page, counts } = first
  // From the student's conversation with their own tutor: Review, who it is about known, refused under their name, in
  // one red line, before any unlock; Post does nothing.
  await messagesOf(page, STUDENT_WORDS)
  await page.locator('button.thread-row', { hasText: short(tutor) }).click()
  const asked = counts.asserted
  await button(page, 'Review').click()
  const line = page.locator('main .line', { hasText: "That's one of your profiles." })
  await line.waitFor({ timeout: 30_000 })
  assert.equal(await line.getAttribute('class'), 'line red')
  await page.locator('.foot').getByRole('button', { name: 'Post' }).click()
  await page.waitForTimeout(500)
  assert.equal(await page.locator('main .line').count(), 1, 'said once, under their name')
  assert.equal(counts.asserted, asked, 'refused before the unlock: nothing asked')
  assert.equal((await entriesOf((await mainKey(seed, STUDENT_LABEL)).address, 'review')).length, 0, 'nothing written')
  await shot(page, 'review-own')
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await homeTitle(page).waitFor()

  // Someone else, a student, writes to the tutor from its link, and vouches for them from the conversation.
  const other = await phone()
  await newPerson(other)
  await onward(other)
  await pickFirst(other.page, STUDENT_WORDS)
  await button(other.page, 'Back').click()
  await other.page.goto(`${APP}message?to=${tutor}`)
  await other.page.locator('.from-line', { hasText: `From your ${STUDENT_WORDS} profile` }).waitFor({ timeout: 60_000 })
  await other.page.getByLabel('Message').fill(OWN)
  await button(other.page, 'Send').click()
  await other.page.locator('.said.mine', { hasText: OWN }).waitFor({ timeout: 60_000 })
  await button(other.page, 'Review').click()
  await badge(other.page.locator('.top .who', { hasText: TUTOR_WORDS })).waitFor()
  assert.equal(await other.page.locator('main .line').count(), 0, 'not refused')
  await other.page.getByRole('group', { name: 'Kind' }).getByRole('button', { name: 'Vouch' }).click()
  await other.page.getByLabel('Comment').fill(VOUCH)
  await other.page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await other.page.locator('.said.mine', { hasText: OWN }).waitFor({ timeout: 60_000 })
  const theirs = (JSON.parse((await kept(other.page))['forest.profiles']!) as Array<{ address: string }>)[0]!.address

  // Counted by the index, it is new: on the tutor's rating, 1 new; on its Reviews, first, with its dot, by who wrote it.
  const tutorCard = page.locator('button.card', { hasText: TUTOR_WORDS })
  await untilLine(page, TUTOR_WORDS, '1 new')
  await page.locator('button.ratepill .new-words', { hasText: '1 new' }).waitFor()
  await shot(page, 'profile-new-vouch')
  await page.locator('button.ratepill').click()
  await page.getByRole('heading', { name: 'Reviews', exact: true }).waitFor()
  await named(page.locator('.of-line'), TUTOR_WORDS)
  const said = page.locator('main .cards button.said-card')
  const vouch = said.filter({ hasText: VOUCH })
  await vouch.locator('.said-head .name.key', { hasText: short(theirs) }).waitFor({ timeout: 30_000 })
  await vouch.locator('.dot').waitFor()
  assert.match((await said.first().textContent()) ?? '', new RegExp(VOUCH), 'the new one first')
  await vouch.locator('.said-chip', { hasText: 'Vouch' }).locator('[data-icon="handshake"]').waitFor()
  assert.equal(await vouch.locator('.said-chip', { hasText: 'Vouch' }).evaluate((c) => getComputedStyle(c).backgroundColor), await tokenColor(page, 'sunk'), 'a vouch on a neutral chip: nothing else is green')
  await shot(page, 'reviews-new')
  // Shown, it is seen: the rating says nothing new any more.
  await button(page, 'Back').click()
  await page.locator('button.ratepill').waitFor()
  assert.equal(await page.locator('button.ratepill .new-words').count(), 0, 'new no more')
  await button(page, 'Back').click()
  await tutorCard.waitFor()

  // The tutor vouches back, from the conversation the other started. A profile with no score yet, only a vouch: its rating
  // line reads what came, 1 vouch, a button to its Reviews.
  await messagesOf(page, TUTOR_WORDS)
  await page.locator('button.thread-row', { hasText: short(theirs) }).click({ timeout: 60_000 })
  await button(page, 'Review').click()
  await badge(page.locator('.top .who', { hasText: STUDENT_WORDS })).waitFor()
  await page.getByRole('group', { name: 'Kind' }).getByRole('button', { name: 'Vouch' }).click()
  await page.locator('.foot').getByRole('button', { name: 'Vouch' }).click()
  await page.locator('.said', { hasText: OWN }).waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  await homeTitle(page).waitFor()
  await other.page.goto(APP)
  await untilLine(other.page, STUDENT_WORDS, '1 vouch')
  assert.equal(await other.page.locator('button.ratepill').count(), 1, 'a button')
  await shot(other.page, 'profile-vouched')
  await other.page.locator('button.ratepill').click()
  await other.page.getByRole('heading', { name: 'Reviews' }).waitFor()
  await other.page.locator('.rated').getByText('1 vouch', { exact: true }).waitFor()
  await other.page.locator('button.said-card .said-head .name.key', { hasText: short(tutor) }).waitFor()
  await other.context.close()
  say("one's own profile: refused before the unlock; someone else's vouch, 1 new on the rating, first in its Reviews, seen once shown; a vouch alone, 1 vouch under the name")
})

type AiApp = Awaited<ReturnType<typeof aiApp>>
type Answer = { isError?: boolean; content: Array<{ text: string }> }
/** A tool's answer to the AI app, as JSON; an error answer throws, with its text. */
async function tool(ai: AiApp, name: string, args: Record<string, unknown> = {}): Promise<any> {
  const r = (await ai.client.callTool({ name, arguments: args })) as Answer
  if (r.isError) throw new Error(`${name}: ${r.content[0]?.text}`)
  return JSON.parse(r.content[0]!.text)
}
const SWITCHES = ['read-inbox', 'read', 'write', 'message']
/** The AI's own listing, on the tutor's profile. */
const BY_THE_AI = 'Physics for secondary school, written by the AI.'
/** The AI's listing as its row shows it: its subjects, then its price; its description shows when it is opened. */
/** What the AI writes: a description and two values of the lessons' long list, which its card's quiet line shows. */
const BY_THE_AI_BODY = { description: BY_THE_AI, [L.choice]: valuesIn(L.choice).slice(0, 2) }

/** An AI app, as services' tests make one (mcp/test/setup.ts): the MCP SDK's own client, whose first call that acts gets the challenge, and the address it sends the browser to, to log in. */
async function aiLogin(): Promise<AiApp> {
  const ai = await aiApp(mcp.origin)
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError')
  return ai
}

/**
 * The code the connector sends the browser back to the AI app with, from the page's request for
 * the AI app's redirect: no page answers there, since the AI app is the test's own client.
 */
const backToTheAiApp = (page: Page) => page.waitForRequest((r) => r.url().startsWith(REDIRECT), { timeout: 60_000 }).then((r) => new URL(r.url()).searchParams.get('code')!)

/**
 * The app opened again after the AI app's redirect, which loads nowhere here: once its error page is
 * in, so it never cuts the app's own load short. A redirect that fails while this waits (a slow
 * lookup of the AI app's host, as on GitHub's runners) throws its network error first, and its error
 * page follows.
 */
async function backToTheApp(page: Page) {
  const errorPage = () => page.waitForURL((url) => url.protocol === 'chrome-error:', { waitUntil: 'commit', timeout: 30_000 })
  await errorPage().catch((err: Error) => {
    if (!err.message.includes('net::ERR_')) throw err
    return errorPage()
  })
  await page.goto(APP)
}

/** The profiles' checkboxes, by their words, and whether each is ticked. */
const ticks = async (page: Page) => Object.fromEntries(await Promise.all((await page.getByRole('checkbox').all()).map(async (c) => [await c.textContent(), await c.getAttribute('aria-checked')])))

let ai: AiApp

test("an AI app's login: the connect page, its name and its redirect's host, the profiles unticked; one ticked, Connect, one unlock; the AI reads its profile and writes a listing, which shows; the device keeps no key", async () => {
  const { page, counts } = first
  ai = await aiLogin()
  await page.goto(ai.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/connect', 'the login out of the path, into the history')
  await page.getByText('ai-app.example', { exact: true }).waitFor()
  assert.deepEqual(await ticks(page), { [SELLER_WORDS]: 'false', [STUDENT_WORDS]: 'false', [TUTOR_WORDS]: 'false' }, 'none ticked: there are three')
  assert.ok(await button(page, 'Connect').isDisabled(), 'Connect once one is ticked')
  await named(page.getByRole('checkbox', { name: TUTOR_WORDS }), TUTOR_WORDS)
  assert.equal(await page.getByRole('checkbox').locator('.vb').count(), 0, "no badge on the person's own profiles: it is theirs, not each profile's")
  assert.equal(await iconsInTheirButtonsColor(page), 1, "Connect's unlock icon, in its text color")
  await shot(page, 'connect')
  await page.getByRole('checkbox', { name: TUTOR_WORDS }).click()
  const asked = counts.asserted
  const code = backToTheAiApp(page)
  await button(page, 'Connect').click()
  await ai.transport.finishAuth(await code)
  assert.equal(counts.asserted - asked, 1, 'one unlock')

  // The AI acts: its profiles, one, with every switch; it reads its profile entry and writes a listing.
  assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: [{ label: TUTOR_LABEL, can: SWITCHES }] })
  const profile = await tool(ai, 'read', { label: TUTOR_LABEL, path: 'profile' })
  assert.deepEqual([profile.body.market, profile.body.role], [LESSONS, L.offer.role])
  await tool(ai, 'write', { label: TUTOR_LABEL, path: 'listing/by-the-ai', body: BY_THE_AI_BODY })
  await backToTheApp(page)
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await offerCard(page, BY_THE_AI).waitFor()
  await shot(page, 'profile-ai-listing')

  // The device: the AI app's name, its day, its folder's address and its profile; no key.
  const local = await kept(page)
  const [conn] = await new App({ seed, hosts: [services.host] }).connections()
  assert.deepEqual(JSON.parse(local['forest.connections']!), [{ address: conn!.address, name: 'An AI app', time: conn!.view.current.get('connection')!.entry.time, labels: [TUTOR_LABEL] }])
  const all = JSON.stringify(local)
  for (const secret of [b64u.encode(conn!.key.secret), ...conn!.access.map((a) => a.body.key as string)]) assert.equal(all.includes(secret), false, 'never a key')
  say('an AI app connected: one unlock, and its listing on the profile')
})

test('an AI app connected in another browser comes back here by itself, at the next unlock: Your AI has no Find AI apps', async () => {
  // A browser with the same seed, as one set up before the AI app connected: what it knew of AI apps and their keys taken back.
  const b = await phone()
  await answerFrom(b, first)
  await b.page.goto(APP)
  await elsewhere(b)
  await button(b.page, 'Not now').click()
  await homeWith(b.page, TUTOR_WORDS)
  await b.page.evaluate(() => ['forest.connections', 'forest.known'].forEach((k) => localStorage.removeItem(k)))
  await closed(b.page)
  // Home reads every profile's entry: the tutor's lists the AI app's key, which this browser doesn't know.
  await homeWith(b.page, TUTOR_WORDS)
  await b.page.waitForTimeout(1_000)
  await button(b.page, 'You').click()
  await b.page.locator('button.row', { hasText: 'Your AI' }).click()
  await b.page.getByRole('heading', { name: 'Your AI' }).waitFor()
  assert.deepEqual(await b.page.locator('main .rows button.row').allTextContents(), ['Connect another'], 'none yet, and nothing to tap to find it')
  assert.equal(await button(b.page, 'Find AI apps').count(), 0, 'no Find AI apps')
  // The next unlock, for anything (the messages): the AI app found by itself, nothing more asked.
  const asked = first.counts.asserted
  await button(b.page, 'Back').click()
  await b.page.locator('.tabbar button', { hasText: 'Messages' }).click()
  await b.page.locator('.filters').waitFor({ timeout: 60_000 })
  assert.equal(first.counts.asserted - asked, 1, 'one unlock, for the messages, asked by the tab\'s tap')
  await button(b.page, 'You').click()
  await b.page.locator('button.row', { hasText: 'Your AI' }).locator('.two > span', { hasText: 'An AI app' }).waitFor({ timeout: 30_000 })
  await b.page.locator('button.row', { hasText: 'Your AI' }).click()
  await b.page.locator('button.row', { hasText: 'An AI app' }).waitFor()
  assert.equal(first.counts.asserted - asked, 1, 'and nothing more asked')
  await b.context.close()
  say('an AI app made in another browser: found at the next unlock, by itself')
})

const VISIT = 'Physics for the visit, one hour online.'
const VISIT_NOTE = 'A note from the visit.'

test('a whole visit asks exactly once: post, edit, message, open messages, review, tick an AI app, the page hidden between each, as a window another covers is', async () => {
  const { page, counts } = first
  await page.getByRole('heading', { name: TUTOR_WORDS }).waitFor()
  const asked = counts.asserted
  // Post: the one unlock.
  await button(page, 'New offer').click()
  const ask = (name: string) => fieldAsked(LESSONS, L.offer.role, name)
  await page.getByLabel(ask('description').label, { exact: true }).fill(VISIT)
  const price = await openRow(page, ask('price').label)
  await price.getByLabel('Amount', { exact: true }).fill('20')
  await closeRow(page, ask('price').label)
  await pick(page, ask(L.choice).label, wordOf(L.choice, valuesIn(L.choice)[1]!))
  const mode = await openRow(page, ask(L.mode).label)
  await mode.getByRole('button', { name: wordOf(L.mode, L.online) }).click()
  await closeRow(page, ask(L.mode).label)
  const contact = await openRow(page, 'Contact')
  await contact.getByLabel('Contact', { exact: true }).fill('ada@example.com')
  await closeRow(page, 'Contact')
  assert.equal(await asks(button(page, 'Post')), true, 'Post will ask: the one unlock of the visit')
  await button(page, 'Post').click()
  const posted = offerCard(page, VISIT).filter({ hasText: '$20' })
  await posted.waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1)
  await away(page)
  // Edit, from its page.
  await editOffer(page, VISIT)
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  const repriced = await openRow(page, ask('price').label)
  await repriced.getByLabel('Amount', { exact: true }).fill('25')
  await closeRow(page, ask('price').label)
  assert.equal(await asks(button(page, 'Post')), false, 'hidden, and the seed still held')
  await button(page, 'Post').click()
  await page.locator('button.card.offer-big', { hasText: '$25' }).waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()
  const edited = offerCard(page, VISIT).filter({ hasText: '$25' })
  await edited.waitFor({ timeout: 60_000 })
  await away(page)
  // Open messages: by themselves, the seed held.
  await inbox(page).click()
  await page.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  assert.equal(await page.locator('.unopened').count(), 0, 'no Open')
  await away(page)
  // Message: from their student to their tutor, in the conversation they have, among every profile's.
  await button(page, 'All').click()
  await page.locator('button.thread-row', { hasText: NOTE }).filter({ hasText: short(tutor) }).click()
  await page.getByLabel('Message').fill(VISIT_NOTE)
  assert.equal(await asks(button(page, 'Send')), false)
  await button(page, 'Send').click()
  await page.locator('.said.mine', { hasText: VISIT_NOTE }).waitFor({ timeout: 60_000 })
  await away(page)
  // Review, from a thread: the tutor's with the other person's student, never one of their own.
  await button(page, 'Back').click()
  await page.locator('button.thread-row', { hasText: YES }).click()
  await page.getByLabel('Message').waitFor()
  await button(page, 'Review').click()
  await badge(page.locator('.top .who', { hasText: STUDENT_WORDS })).waitFor()
  const score = page.getByLabel('Score')
  await score.focus()
  await score.press('End')
  assert.equal(await asks(button(page, 'Post')), false)
  await button(page, 'Post').click()
  await page.getByLabel('Message').waitFor({ timeout: 60_000 })
  await away(page)
  // The tutor's messages again: the note arrives and opens by itself, from their own student.
  await button(page, 'Back').click()
  const ownStudent = short((await mainKey(seed, STUDENT_LABEL)).address)
  await page.locator('button.thread-row', { hasText: VISIT_NOTE }).filter({ hasText: ownStudent }).waitFor({ timeout: 90_000 })
  await page.goBack()
  await button(page, 'Back').click()
  // Tick an AI app, opened in place: a profile given to it with Save, and taken back.
  await button(page, 'You').click()
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  for (const ticked of [true, false]) {
    await page.locator('button.row', { hasText: 'An AI app' }).click()
    await page.getByRole('checkbox', { name: SELLER_WORDS }).click()
    await button(page, 'Save').click()
    await page.getByRole('group', { name: 'An AI app', exact: true }).waitFor({ state: 'detached', timeout: 60_000 })
    assert.equal(await page.locator('button.row', { hasText: 'An AI app' }).locator('.two > span').textContent(), ticked ? '2 profiles' : '1 profile')
    await away(page)
  }
  assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
  // The visit's listing deleted, which asks nothing either.
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await editOffer(page, VISIT)
  await button(page, 'Delete').click()
  await button(page, 'Delete').click()
  // Deleted, its page goes too: back on the profile, the card gone.
  await page.locator('.profile-head').waitFor({ timeout: 60_000 })
  await edited.waitFor({ state: 'detached', timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'the whole visit, one unlock')
  // The page closed, as the next tests start: the seed dropped.
  await page.goto(APP)
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  say('a whole visit: post, edit, open messages, message, review, an AI app ticked and unticked, a listing deleted, one unlock')
})

test("Your AI: the AI app and how many of this device's profiles it acts for, and nothing of since when; tapped, it opens in place under its row, like a passkey: its profiles as ticks, kept ticked while it is the last, Save and Disconnect; ticking changes nothing until Save, which asks one unlock; Disconnect asks again in place, with no new login; its next call refused, its listing kept", async () => {
  const { page, counts } = first
  await button(page, 'Back').click()
  await button(page, 'You').click()
  // You's row names it; Your AI lists it: its name and how many profiles, nothing of since when; then Connect another.
  await page.locator('button.row', { hasText: 'Your AI' }).locator('.two > span', { hasText: 'An AI app' }).waitFor()
  await page.locator('button.row', { hasText: 'Your AI' }).click()
  await page.getByRole('heading', { name: 'Your AI' }).waitFor()
  const row = page.locator('button.row', { hasText: 'An AI app' })
  assert.equal(await row.locator('.two > span').textContent(), '1 profile', 'its one profile, and nothing of since when')
  assert.equal(await button(page, 'Find AI apps').count(), 0, 'no Find AI apps')
  assert.deepEqual(await page.locator('main .rows button.row').allTextContents(), ['An AI app1 profile', 'Connect another'])
  await shot(page, 'your-ai')
  // Opened in place, under its row, as a passkey is: no page of its own, a second tap closes it.
  await row.click()
  const open = page.getByRole('group', { name: 'An AI app', exact: true })
  await open.waitFor()
  assert.equal(await row.getAttribute('aria-expanded'), 'true')
  assert.equal(new URL(page.url()).pathname, '/ai-apps', 'still Your AI')
  assert.equal(await page.getByRole('heading', { name: 'An AI app' }).count(), 0, 'no page of its own')
  assert.equal(await row.locator('[data-icon="caret-up"]').count(), 1, 'its chevron up')
  assert.deepEqual(await ticks(page), { [SELLER_WORDS]: 'false', [STUDENT_WORDS]: 'false', [TUTOR_WORDS]: 'true' })
  assert.ok(await page.getByRole('checkbox', { name: TUTOR_WORDS }).isDisabled(), 'the last one stays ticked')
  assert.ok(await button(page, 'Save').isDisabled(), 'nothing to save yet')
  await noLockOnRows(page)
  await row.click()
  await open.waitFor({ state: 'detached' })
  await row.click()
  await open.waitFor()
  // Disconnect asks again, in its own place: Disconnect An AI app?, Cancel and Disconnect, which keeps its unlock icon.
  const disconnecting = page.getByRole('group', { name: 'Disconnect An AI app?' })
  await button(page, 'Disconnect').click()
  assert.deepEqual((await disconnecting.getByRole('button').allTextContents()).map((t) => t.trim()), ['Cancel', 'Disconnect'])
  assert.equal(await disconnecting.getByRole('button', { name: 'Disconnect' }).locator('.unlock').count(), 1, 'Disconnect keeps its unlock icon')
  assert.equal(await button(page, 'Save').count(), 0, 'Save gives way while Disconnect asks')
  await nothingFloats(page, 'Disconnect An AI app?')
  await shot(page, 'ai-app')
  await disconnecting.getByRole('button', { name: 'Cancel' }).click()

  /** One tick and Save, and the AI's profiles after it, with no new login; `unlocks`, how many it asked: one, or none with the seed held. Ticking alone asks nothing and changes nothing. */
  const tickOne = async (words: string, ticked: boolean, profiles: string[], count: string, unlocks: number) => {
    const asked = counts.asserted
    const before = await tool(ai, 'my_profiles')
    await page.getByRole('checkbox', { name: words }).click()
    await page.getByRole('checkbox', { name: words, checked: ticked }).waitFor()
    assert.equal(counts.asserted - asked, 0, 'ticking asks nothing')
    assert.deepEqual(await tool(ai, 'my_profiles'), before, 'and changes nothing until Save')
    await button(page, 'Save').click()
    await open.waitFor({ state: 'detached', timeout: 60_000 })
    assert.equal(await row.locator('.two > span').textContent(), count)
    assert.equal(await page.locator('p.line').count(), 0, (await page.locator('p.line').allTextContents()).join(' '))
    assert.equal(counts.asserted - asked, unlocks, unlocks ? 'one unlock' : 'nothing asked: the seed held')
    assert.deepEqual(await tool(ai, 'my_profiles'), { profiles: [...profiles].sort().map((label) => ({ label, can: SWITCHES })) }, 'in label order')
    await row.click()
    await open.waitFor()
  }
  await tickOne(SELLER_WORDS, true, [SELLER_LABEL, TUTOR_LABEL], '2 profiles', 1)
  await button(page, 'Disconnect').click()
  assert.equal(await asks(disconnecting.getByRole('button', { name: 'Disconnect' })), false, 'Disconnect, with the seed held, shows no unlock icon')
  await disconnecting.getByRole('button', { name: 'Cancel' }).click()
  await tickOne(TUTOR_WORDS, false, [SELLER_LABEL], '1 profile', 0)
  assert.ok(await page.getByRole('checkbox', { name: SELLER_WORDS }).isDisabled(), 'now the seller is the last')
  await tickOne(TUTOR_WORDS, true, [SELLER_LABEL, TUTOR_LABEL], '2 profiles', 0)

  const asked = counts.asserted
  await button(page, 'Disconnect').click()
  await disconnecting.getByRole('button', { name: 'Disconnect' }).click()
  await row.waitFor({ state: 'detached', timeout: 60_000 })
  assert.equal(counts.asserted - asked, 0, 'nothing asked: the seed held')
  await assert.rejects(ai.client.callTool({ name: 'my_profiles', arguments: {} }), (err: Error) => err.constructor.name === 'UnauthorizedError', 'its next call refused')
  assert.deepEqual(JSON.parse((await kept(page))['forest.connections']!), [])
  await button(page, 'Back').click()
  await button(page, 'Home').click()
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await offerCard(page, BY_THE_AI).waitFor()
  await button(page, 'Back').click()
  await ai.client.close()
  say('an AI app given a profile, one taken away and given back, each with Save, and disconnected; its listing kept')
})

test("a new phone at a connect page, nothing set up: Start, finding nothing; I'm new, the face check and a first profile, then Continue back to the connect page, its one profile ticked; Connect", async () => {
  const p = await phone()
  const login = await aiLogin()
  await p.page.goto(login.app.authorization!.href)
  await imNew(p)
  await shot(p.page, 'start-connecting')
  await faceCheck(p)
  await onward(p)
  await p.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  await made(p.page, STUDENT_WORDS)
  await button(p.page, 'Continue').click()
  await p.page.getByRole('heading', { name: 'An AI app' }).waitFor({ timeout: 120_000 })
  assert.equal(await p.page.getByRole('heading', { name: 'Connect your AI' }).count(), 0, 'no Connect your AI')
  assert.deepEqual(await ticks(p.page), { [STUDENT_WORDS]: 'true' }, 'its one profile, ticked')
  const asked = p.counts.asserted
  const code = backToTheAiApp(p.page)
  await button(p.page, 'Connect').click()
  await login.transport.finishAuth(await code)
  assert.equal(p.counts.asserted - asked, 0, 'nothing asked: the seed held since the unlock back from the check')
  assert.deepEqual(await tool(login, 'my_profiles'), { profiles: [{ label: STUDENT_LABEL, can: SWITCHES }] })

  // A profile made later, with an AI app connected: the sheet turns into what was made, the AI app ticked; Done gives it the profile.
  await p.page.goto(APP)
  await homeTitle(p.page).waitFor({ timeout: 60_000 })
  await p.page.locator('main .titled').getByRole('button', { name: 'New profile' }).click()
  await p.page.getByLabel('Search').fill(TUTORING.toLowerCase())
  await tile(p.page, TUTORING).click()
  await marketSheet(p.page, TUTORING).getByRole('button', create(L.offer.role)).click()
  const madeSheet = p.page.getByRole('dialog', { name: `${roleWords(L.offer.role)} profile created` })
  await madeSheet.waitFor({ timeout: 120_000 })
  assert.deepEqual(await madeSheet.locator('.made').evaluate((m) => [!!m.querySelector('.done-round [data-icon="check"]'), m.querySelector('h2')!.textContent, m.querySelector('p')!.textContent]), [true, `${roleWords(L.offer.role)} profile created`, TUTORING])
  await madeSheet.getByText('Your AI can use it', { exact: true }).waitFor()
  assert.deepEqual(await ticks(p.page), { 'An AI app': 'true' }, 'each AI app a row, ticked')
  await shot(p.page, 'made-with-ai')
  await madeSheet.getByRole('button', { name: 'Done', exact: true }).click()
  await madeSheet.waitFor({ state: 'detached', timeout: 60_000 })
  assert.deepEqual((await tool(login, 'my_profiles')).profiles.map((x: { label: string }) => x.label).sort(), [STUDENT_LABEL, TUTOR_LABEL].sort(), 'given to the AI app')

  // Delete profile, from its ···: Delete this profile?, its three lines; Delete profile, red, then Home without it; its folder empty at the host; the AI app acts for it no more.
  await p.page.keyboard.press('Escape')
  await button(p.page, 'Back').click()
  await p.page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  await button(p.page, 'More').click()
  await p.page.getByRole('menuitem', { name: 'Delete profile' }).click()
  const deleting = p.page.getByRole('dialog', { name: 'Delete this profile?' })
  await deleting.getByRole('heading', { name: 'Delete this profile?' }).waitFor()
  assert.deepEqual(await deleting.locator('.bullets li').allTextContents(), ['Your profile and its listings disappear from Forest.', "Reviews people left you don't go away.", 'If you make this profile again, it comes back with the same reviews.'])
  assert.deepEqual(await deleting.locator(':scope > button:not(.sheet-x)').evaluateAll((b) => b.map((x) => [x.textContent?.trim(), x.className])), [['Delete profile', 'danger solid'], ['Cancel', '']])
  await shot(p.page, 'delete-profile')
  await deleting.getByRole('button', { name: 'Cancel' }).click()
  await deleting.waitFor({ state: 'detached' })
  const pSeed = await seedOn(p.page)
  const address = (await mainKey(pSeed, TUTOR_LABEL)).address
  await button(p.page, 'More').click()
  await p.page.getByRole('menuitem', { name: 'Delete profile' }).click()
  await deleting.getByRole('button', { name: 'Delete profile' }).click()
  await homeTitle(p.page).waitFor({ timeout: 60_000 })
  assert.equal(await p.page.locator('button.card', { hasText: TUTOR_WORDS }).count(), 0, 'Home without it')
  assert.deepEqual([...liveContent(await readFolder([services.host], address, Date.now()))].map(([path]) => path), [], 'nothing live in its folder at the host')
  assert.deepEqual((await tool(login, 'my_profiles')).profiles.map((x: { label: string }) => x.label), [STUDENT_LABEL], 'the AI app acts for it no more')
  // Made again: the same profile, at the same address.
  await p.page.locator('main .titled').getByRole('button', { name: 'New profile' }).click()
  await made(p.page, TUTOR_WORDS)
  assert.equal(JSON.parse((await kept(p.page))['forest.profiles']!).find((x: { label: string }) => x.label === TUTOR_LABEL).address, address, 'the same seed, the same address')
  await login.client.close()
  await p.context.close()
  say('a new phone: set up from the connect page, then back to it, and connected; a profile made later, given to the AI app; deleted, and made again')
})

test("a connector that isn't ours: one line, nothing else; a request that ran out: one line", async () => {
  const p = await phone()
  await p.page.goto(`${APP}connect?connector=${encodeURIComponent('https://other.example')}&request=x.y`)
  await p.page.getByText(`Forest connects only to ${new URL(mcp.origin).host} for now.`).waitFor()
  assert.equal(await p.page.getByRole('button').count(), 0, 'nothing else')
  await shot(p.page, 'connect-not-ours')
  // A login 11 minutes old, as the clock goes: run out.
  const login = await aiLogin()
  const res = await fetch(login.app.authorization!, { redirect: 'manual' })
  const connect = res.headers.get('location')!
  assert.ok(connect.startsWith(`${APP}connect?`), connect)
  await p.page.clock.setFixedTime(Date.now() + 11 * 60_000)
  await p.page.goto(connect)
  await p.page.getByText('This took too long. Start again from your AI app.').waitFor()
  assert.equal(await p.page.getByRole('button').count(), 0, 'nothing else')
  await login.client.close()
  await p.context.close()
})

test("a face seen before, in the box: its answer, Use my other passkey first and Verify with your ID; Use my other passkey asks for the passkey the person uses, adds the one made here by mistake to it, and they're in; from then this browser's own passkey opens their Forest", async () => {
  // Someone verified in one browser; in a second, I'm new by mistake, and the face check.
  const a = await phone()
  await newPerson(a)
  await onward(a)
  await a.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 90_000 })
  const b = await phone()
  // The passkey sheet with no passkey named: the first browser's answers, as a phone does through the QR code.
  await answerFrom(b, a)
  // Didit sees the face under another person: the verifier answers known_face.
  await answer(b.context, `${services.verifier}/face/stamp`, 403, { error: 'known_face' })
  await b.page.goto(APP)
  await imNew(b)
  await b.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await checkCard(b.page, 'Face').click()
  await agreed(b.page)
  await diditSays(b.page, 'didit:completed')
  // In the box: the yellow round !, the bold title, one line, its buttons at the foot.
  const box = boxOf(b.page)
  await box.getByRole('heading', { name: 'Someone with a similar face is already verified' }).waitFor({ timeout: 60_000 })
  await box.getByText("If it's you, sign in with your other passkey. If not, verify with your ID.").waitFor()
  assert.equal(await box.locator('.sun-round [data-icon="exclamation-mark"]').count(), 1, 'the yellow round !')
  assert.equal(await box.locator('.sun-round').evaluate((r) => getComputedStyle(r).backgroundColor), await tokenColor(b.page, 'sun'), 'yellow')
  assert.deepEqual(await box.locator('.answer .stack > button').evaluateAll((x) => x.map((y) => [y.textContent, y.className])), [['Use my other passkey', 'primary'], ['Verify with your ID', '']], 'Use my other passkey, strong green, then Verify with your ID, outlined')
  await shot(b.page, 'face-seen')
  const already = box.getByRole('button', { name: 'Use my other passkey' })

  const own = JSON.parse((await kept(b.page))['forest.passkeys']!) as string[]
  assert.equal(own.length, 1, 'the passkey made here')
  const asked = a.counts.asserted
  await already.click()
  await b.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 90_000 })
  assert.equal(a.counts.asserted - asked, 1, 'the passkey the person uses, asked once')
  const local = await kept(b.page)
  assert.equal(JSON.parse(local['forest.passkey']!), own[0], "this browser's own passkey, in use here")
  assert.ok(!('first' in JSON.parse(local['forest.backups'] ?? '{}')), 'a backup now, not a first passkey')
  assert.equal((await backupsOn(JSON.parse(local['forest.folder']!).address)).length, 1, "added to the person's Forest: a backup/<id> in their Profiles folder")
  assert.equal(JSON.parse(local['forest.folder']!).address, JSON.parse((await kept(a.page))['forest.folder']!).address, "the first browser's Forest")

  // Opened again, no seed held: the first profile asks this browser's own passkey, in use here, which opens the same Forest; the first browser isn't asked.
  await b.page.reload()
  await b.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  const mine = b.counts.asserted
  await pickFirst(b.page, TUTOR_WORDS)
  assert.equal(b.counts.asserted - mine, 1, "this browser's own passkey, asked once")
  assert.equal(a.counts.asserted - asked, 1, 'nothing more asked of the first browser')
  assert.equal((await entriesOf(JSON.parse(local['forest.folder']!).address, 'label')).length, 1, "the profile listed in the person's Profiles folder")
  await a.context.close()
  await b.context.close()
  say("a face seen before: its answer in the box; Use my other passkey added this browser's passkey to the person's, and it opens their Forest from then")
})

test("the ID check's answers, in the box: an ID it couldn't accept, Keep trying while the payment has a session left, the payment page skipped; on its last, Too many failed tries, nothing charged; Skip cancels the payment at the verifier; a person seen before, under another passkey; too young; an error of the app's or a service's, Try again; then both checks Verified, Continue strong green", async () => {
  const p = await phone()
  const { page } = p
  const said = { stamp: null as null | string, status: 403 }
  await answer(p.context, `${services.verifier}/id/stamp`, 403, () => ({ error: said.stamp }), () => said.stamp !== null && said.status === 403)
  await answer(p.context, `${services.verifier}/id/stamp`, 500, { error: 'internal' }, () => said.stamp !== null && said.status === 500)
  const box = boxOf(page, 'id')
  /** The ID check's box from its card: Before, agreed, and Continue to pay. */
  const begin = async () => {
    await checkCard(page, 'Face + ID').click()
    await agreed(page, 'id')
  }
  /** Paid on the verifier's own payment page, framed in the box: its stand-in Pay; its one message moves the box on, to Didit's page. */
  const pays = async () => {
    const frame = box.locator('iframe')
    await frame.waitFor({ timeout: 60_000 })
    assert.match((await frame.getAttribute('src'))!, new RegExp(`^${services.verifier}/id/pay#cs_test_`), 'the payment page, its client secret after the #')
    assert.equal(await frame.getAttribute('allow'), 'payment')
    await (await frameAt(page, services.verifier)).getByRole('button', { name: 'Pay' }).click()
  }
  /** Didit's page, framed in the box: done; then Checking, and the answer. */
  const checked = async () => {
    await frameAt(page, 'https://fake-didit.invalid')
    await diditSays(page, 'didit:completed')
  }
  const answered = async (title: string, line: string) => {
    await box.getByRole('heading', { name: title }).waitFor({ timeout: 60_000 })
    await box.getByText(line, { exact: true }).waitFor()
    return box.locator('.answer .stack > *').evaluateAll((x) => x.map((y) => [y.textContent, y.tagName === 'A' ? 'link' : y.className]))
  }
  await page.goto(APP)
  await imNew(p)
  await page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })

  // Before the ID check: the verifier's words for it, and one tick holding its line and its right to cancel, right after it.
  const about = (await (await fetch(`${services.verifier}/`)).json()) as { consent: string; agree: string; id: { cancelRight: string } }
  await checkCard(page, 'Face + ID').click()
  await box.getByRole('heading', { name: 'Before your ID check' }).waitFor()
  assert.equal(await box.locator('.consent').textContent(), about.consent, "the ID check's own words, word for word")
  assert.deepEqual(await box.locator('.tick-row .agree > span').allTextContents(), [about.agree, about.id.cancelRight], 'one tick: the line to agree to, then the right to cancel')
  assert.ok(await box.getByRole('button', { name: 'Continue to pay' }).isDisabled())
  await shot(page, 'box-before-id')
  await box.getByRole('checkbox').click()
  await box.getByRole('button', { name: 'Continue to pay' }).click()
  await pays()
  await shot(page, 'box-paying')
  // An ID it couldn't accept, with sessions left: Keep trying, and Skip; Keep trying opens a new session on the same payment, no payment page.
  said.stamp = 'id_unclear'
  await checked()
  assert.deepEqual(await answered("We couldn't accept this ID", 'Try again, or with a different ID.'), [['Keep trying', 'primary'], ["Skip, you won't be charged", 'text-link']])
  await shot(page, 'id-retry')
  const payment = JSON.parse((await kept(page))['forest.setup']!).payment as string
  for (const n of [2, 3]) {
    await box.getByRole('button', { name: 'Keep trying' }).click()
    await checked()
    assert.equal(JSON.parse((await kept(page))['forest.setup']!).payment ?? payment, payment, 'the same payment')
    if (n === 2) await answered("We couldn't accept this ID", 'Try again, or with a different ID.')
  }
  // Its last session: Too many failed tries, nothing charged, Close.
  assert.deepEqual(await answered('Too many failed tries', "You weren't charged."), [['Close', 'primary']])
  await shot(page, 'id-tries-used')
  await box.locator('.answer').getByRole('button', { name: 'Close' }).click()
  await box.waitFor({ state: 'detached' })
  assert.equal(JSON.parse((await kept(page))['forest.setup']!).payment, undefined, 'the payment dropped')

  // Skip, you won't be charged: the payment cancelled at the verifier, back to Get verified.
  await begin()
  await pays()
  await checked()
  await answered("We couldn't accept this ID", 'Try again, or with a different ID.')
  const skipped = JSON.parse((await kept(page))['forest.setup']!).payment as string
  await box.getByRole('button', { name: "Skip, you won't be charged" }).click()
  await box.waitFor({ state: 'detached' })
  assert.equal(services.payments.state(skipped), 'cancelled', 'its hold cancelled at the verifier')

  // A person seen before, under another passkey, while this one holds no stamp: Delete this passkey, red, and Lost your passkey? Contact us.
  said.stamp = 'known_person'
  await begin()
  await pays()
  await checked()
  assert.deepEqual(await answered("You're already verified with another passkey", "Sign in with it. You weren't charged."), [['Delete this passkey', 'danger solid'], ['Lost your passkey? Contact us', 'link']])
  assert.equal(await box.getByRole('link', { name: 'Lost your passkey? Contact us' }).getAttribute('href'), 'mailto:support@forest.foundation')
  await shot(page, 'known-person')
  await page.locator('.box-shell').getByRole('button', { name: 'Close' }).click()

  // Too young: Forest is for people 18 and older.
  said.stamp = 'too_young'
  await begin()
  await pays()
  await checked()
  assert.deepEqual(await answered('Forest is for people 18 and older', "You weren't charged."), [['Close', 'primary']])
  await box.locator('.answer').getByRole('button', { name: 'Close' }).click()

  // An error of a service's: Something went wrong, it wasn't you; Try again asks again, and the stamps come.
  said.status = 500
  said.stamp = 'internal'
  await begin()
  await pays()
  await checked()
  assert.deepEqual(await answered('Something went wrong', "It wasn't you. Try again."), [['Try again', 'primary']])
  await shot(page, 'went-wrong')
  said.stamp = null
  await box.getByRole('button', { name: 'Try again' }).click()
  // The ID check gives a face stamp too, from the same selfie: both Verified, and Continue, strong green, at the foot.
  await cardOf(page, 'Face + ID').locator('.donechip').waitFor({ timeout: 90_000 })
  await cardOf(page, 'Face').locator('.donechip').waitFor()
  assert.equal(await button(page, 'Continue').getAttribute('class'), 'primary', 'strong green once both are done')
  await shot(page, 'verify-both')
  assert.deepEqual(wentFrom(p, 0).filter(([to]) => to === 'stripe').length, 5, "five payments, each on the verifier's page, framed")
  await p.context.close()
})

test("a manager that gives no PRF secret: its passkey dropped, and one red line names another; a browser that cannot ask for it: Passkeys don't work here, nothing asked", async () => {
  const p = await phone({ prf: false })
  // The browser can ask for PRF, as Chrome can, though this manager gives none: Chromium's DevTools
  // say a browser with only a manager like it can't, so the test says what a real one says.
  await p.context.addInitScript(() => void ((PublicKeyCredential as any).getClientCapabilities = async () => ({ 'extension:prf': true })))
  await p.page.goto(APP)
  await imNew(p)
  const line = p.page.getByText("This password manager can't keep a Forest passkey. Save it in another password manager instead.")
  await line.waitFor()
  assert.equal(await line.getAttribute('class'), 'line red')
  assert.equal((await kept(p.page))['forest.passkey'], undefined)
  const { credentials } = await p.cdp.send('WebAuthn.getCredentials', { authenticatorId: p.authenticator })
  assert.deepEqual([p.counts.created, credentials.length], [1, 0], 'made, then dropped: the manager was asked to forget it')
  await p.context.close()

  const old = await phone()
  await old.context.addInitScript(() => void ((PublicKeyCredential as any).getClientCapabilities = async () => ({ 'extension:prf': false })))
  await old.page.goto(APP)
  await old.page.getByRole('region', { name: "Passkeys don't work here" }).waitFor()
  assert.equal(await button(old.page, 'Start').count(), 0, 'no Start')
  assert.equal(old.counts.created + old.counts.asserted, 0, 'nothing asked')
  await old.context.close()
})

test('the passkey belongs to app.forest.foundation: another page under forest.foundation cannot ask for it', async () => {
  const page = await first.context.newPage()
  await page.goto(OTHER)
  const got = await page.evaluate(() =>
    navigator.credentials.get({ publicKey: { rpId: 'app.forest.foundation', challenge: new Uint8Array(32), userVerification: 'required' } }).then(
      () => 'answered',
      (err: Error) => err.name,
    ),
  )
  assert.equal(got, 'SecurityError')
  await page.close()
})

test('the build: its manifest, its service worker in control, installable', async () => {
  // A browser profile of its own, on disk: Chrome installs nothing from a private window.
  const dir = mkdtempSync(join(tmpdir(), 'forest-chrome-'))
  const context = await chromium.launchPersistentContext(dir, { channel: 'chromium', args: CHROME_ARGS })
  try {
    const page = context.pages()[0] ?? (await context.newPage())
    await page.goto(APP)
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'the service worker controls the page')
    const cached = await page.evaluate(async () => (await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((r) => r.url)))).flat())
    assert.ok(cached.some((url) => /\/assets\/index-[\w-]+\.js/.test(url)), "the app's code, precached")
    assert.deepEqual(cached.filter((url) => /PlaceMap|maplibre/.test(url)), [], "nothing of the map's: it comes with the place screen alone")
    const manifest = await (await fetch(`http://127.0.0.1:${new URL(APP).port}/manifest.webmanifest`)).json()
    assert.deepEqual([manifest.name, manifest.display, manifest.start_url, manifest.icons.length], ['Forest', 'standalone', '/', 3])
    const cdp = await context.newCDPSession(page)
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
    assert.deepEqual(installabilityErrors, [], 'Chrome takes it as installable')
  } finally {
    await context.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test("a deploy while the app is open: one quiet line says a new version is ready, with Reload; the old proof worker gone, the page reloads once, back on a market's roles, its sheet kept open, and the profile is made", async () => {
  const { page } = first
  await page.goto(`${APP}new`)
  await tile(page, DEPLOY).click()
  const seller = page.getByRole('button', create(D.offer.role))
  await seller.waitFor()
  const before = await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')
  assert.ok(!before.includes('-next-'))
  // Nothing newer yet: back in view, the page asks, and says nothing.
  await away(page)
  await page.waitForTimeout(1_000)
  assert.equal(await page.getByText('A new version is ready.').count(), 0, 'the version live is this one')
  // The next version in place of this one, its service worker taking over: this version's files are gone.
  server.root = nextDir
  await page.evaluate(async () => {
    const changed = new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))
    await (await navigator.serviceWorker.getRegistration())!.update()
    await changed
  })
  // Back in view, the page asks the server which version is live, and says so, quietly, at the top, with Reload.
  await away(page)
  const ready = page.locator('p.line', { hasText: 'A new version is ready.' })
  await ready.waitFor()
  assert.ok(await ready.getByRole('button', { name: 'Reload' }).isVisible())
  assert.ok((await ready.boundingBox())!.y < (await page.getByRole('heading', { name: DEPLOY }).boundingBox())!.y, 'above the screen')
  await shot(page, 'new-version')
  const loads: string[] = []
  page.on('load', () => loads.push(page.url()))
  await seller.click()
  await page.waitForEvent('load', { timeout: 60_000 })
  assert.deepEqual(loads.map((u) => new URL(u).pathname), ['/new'], 'one reload, back on New profile')
  assert.ok((await page.evaluate(() => document.querySelector('script[type=module]')?.getAttribute('src') ?? '')).includes('-next-'), 'on the next version')
  // The market's sheet open again, kept in the history: Create makes the profile there, its ✓, or the made sheet when an AI app acts for the person.
  await marketSheet(page, DEPLOY).waitFor()
  await seller.click()
  const madeIt = page.getByRole('dialog', { name: `${roleWords(D.offer.role)} profile created` }).or(marketSheet(page, DEPLOY).getByRole('button', { name: `Open ${D.offer.role}`, exact: true }))
  await madeIt.first().waitFor({ timeout: 120_000 })
  assert.equal(loads.length, 1, 'and no reload more')
  say('a deploy while open: one reload onto the next version, and the profile made')
})

test("the ID check, in its box, from the ID's dashed badge beside You: Get verified, Face Verified, the ID to do, Back and no Continue; Before, with the unlock icon while no seed is held, one unlock for the stamp number; the verifier's payment page framed, its Pay, its one message; Didit's page framed; Checking; Verified, and nothing asked again; both verifications on every profile; Your checks, Face and the ID, whose page shows what the check read, after one unlock", async () => {
  const { page, context, counts } = first
  await page.goto(APP)
  await button(page, 'You').click()
  await page.locator('main .top').getByRole('button', { name: 'Verify with Face + ID' }).click()
  // Get verified from You: Face, which they have, Verified on its chip; the ID to do, its price and lines; Back and no Continue; no sheet.
  await page.getByRole('heading', { name: 'Get verified' }).waitFor()
  await cardOf(page, 'Face').locator('.donechip').waitFor()
  await nothingFloats(page, 'no sheet')
  assert.deepEqual(await cardOf(page, 'Face + ID').evaluate((c) => [...c.querySelectorAll('.price3 > *, .vlist > span')].map((e) => e.textContent)), ['$5', 'one time', '10× the credits', 'Higher trust', 'Supports Forest'])
  assert.deepEqual([await button(page, 'Back').count(), await button(page, 'Continue').count()], [1, 0])
  assert.equal(await page.locator('.notice').count(), 0)
  await shot(page, 'verify-from-you')
  // The box: no seed held after a reload, so its button carries the unlock icon, and asks once, for the stamp number; then
  // the verifier's payment page, framed; its Pay; its message; Didit's page; done, Checking, and the card Verified, nothing
  // asked again.
  const opened = context.pages().length
  const since = first.went.length
  const paying = counts.asserted
  await checkCard(page, 'Face + ID').click()
  const box = boxOf(page, 'id')
  await box.getByRole('heading', { name: 'Before your ID check' }).waitFor()
  await box.getByRole('checkbox').click()
  const pay = box.getByRole('button', { name: 'Continue to pay' })
  assert.ok(await asks(pay), 'no seed held: the unlock icon')
  await pay.click()
  const frame = box.locator('iframe')
  await frame.waitFor({ timeout: 60_000 })
  assert.match((await frame.getAttribute('src'))!, new RegExp(`^${services.verifier}/id/pay#cs_test_`))
  await (await frameAt(page, services.verifier)).getByRole('button', { name: 'Pay' }).click()
  await frameAt(page, 'https://fake-didit.invalid')
  await diditSays(page, 'didit:completed')
  await cardOf(page, 'Face + ID').locator('.donechip').waitFor({ timeout: 180_000 })
  assert.deepEqual(wentFrom(first, since), [['stripe', true], ['didit', true]], "the verifier's payment page, then Didit's, framed in this tab")
  assert.equal(counts.asserted - paying, 1, 'one unlock, at Continue to pay; nothing asked again to the end')
  assert.equal(context.pages().length, opened, 'no tab opened')
  assert.equal(new URL(page.url()).pathname, '/id', 'the page never left')
  assert.equal(await page.locator('.vcard .donechip').count(), 2, 'back on Get verified: both Verified')
  assert.equal(await button(page, 'Continue').count(), 0, 'no Continue from You')
  const payment = [...services.payments.clientSecrets.keys()].at(-1)!
  assert.equal(services.payments.state(payment), 'taken', 'its price taken, for the stamp')
  // Back where the badge opened it, since the page never left: You; then Home.
  await button(page, 'Back').click()
  await page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await button(page, 'Home').click()
  await homeTitle(page).waitFor()
  // On a laptop, beside Your profiles, both of the person's badges now, the ID's an ID card on the mint square; no outline, and none on a card.
  await page.setViewportSize({ width: 1280, height: 800 })
  const badges = page.getByRole('group', { name: "How you're verified" })
  await badge(badges, 'id').waitFor()
  assert.deepEqual(await drawnAs(badge(badges, 'id')), ID, "the ID check's badge, an ID card on the mint square")
  assert.deepEqual(await drawnAs(badge(badges)), SELFIE, "and the face check's")
  assert.equal(await badges.getByRole('button').count(), 0, 'no outline: both done')
  const cards = page.locator('main .blocks > section.block')
  assert.ok((await cards.count()) >= 3, 'every profile')
  assert.equal(await cards.locator('.vb').count(), 0, 'no badge on a block')
  for (const label of JSON.parse((await kept(page))['forest.profiles']!) as Array<{ address: string }>) {
    const body = (await readFolder([services.host], label.address, Date.now())).current.get('profile')?.entry.body
    const keys: string[] = []
    for (const proof of proofsOf(body).filter((p) => p.circuit === 'verification')) {
      const check = verificationCheck(proof, label.address)
      assert.ok(check && (await checkVerification(check)), 'each verification checks, as any reader checks it')
      keys.push(proof.verifier as string)
    }
    assert.deepEqual(keys.sort(), [services.faceKey, services.idKey].sort())
  }
  assert.equal((await kept(page))['forest.setup'], undefined, 'nothing of the verification left on the device')
  await shot(page, 'home-both')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.tabbar').waitFor()
  await page.locator('aside.side').waitFor({ state: 'detached' })
  // A student requests: its avatar light, a tint of the market's color with its market's icon in it, never an animal: one of the person's own.
  const student = await avatarOf(page.locator('button.card', { hasText: STUDENT_WORDS }).locator('.av'))
  assert.deepEqual([student.light, student.h, student.icon], [true, colorOf(LESSONS), iconOf(LESSONS)])
  assert.notEqual(student.ground, rgbOf(colorOf(LESSONS)), 'a tint of it, not the color itself')
  // Both badges everywhere, the face check's first: the profile's header, right after its role; the writing screen's card of who it is to.
  await page.locator('button.card', { hasText: TUTOR_WORDS }).click()
  const title = page.getByRole('heading', { name: TUTOR_WORDS })
  await badge(title, 'id').waitFor()
  assert.deepEqual([await drawnAs(badge(title)), await drawnAs(badge(title, 'id'))], [SELFIE, ID], 'both, the same black square, the picture inside telling them apart')
  assert.deepEqual(await title.locator('.vb').evaluateAll((b) => b.map((x) => (x as HTMLElement).dataset.check)), ['face', 'id'], 'the face check first')
  await shot(page, 'profile-id')
  await page.goto(`${APP}message?to=${tutor}`)
  await badge(page.locator('.person.to .who', { hasText: TUTORING }), 'id').waitFor({ timeout: 60_000 })
  await badge(page.locator('.person.to .who', { hasText: TUTORING })).waitFor()
  await page.locator('.from-line', { hasText: `From your ${STUDENT_WORDS} profile` }).waitFor()
  await shot(page, 'message-id')
  await button(page, 'Back').click()
  // You: both badges beside it, solid, nothing to add; Your checks, what the person holds: Face, then the ID stamp by the
  // document's own name (the stand-in Didit reads no kind of document: ID).
  await button(page, 'You').click()
  const youBadges = page.locator('main .top').getByRole('group', { name: "How you're verified" })
  await badge(youBadges, 'id').waitFor()
  assert.equal(await youBadges.getByRole('button').count(), 0, 'nothing to add')
  const checksRow = page.locator('button.row', { hasText: 'Your checks' })
  await checksRow.locator('.two > span', { hasText: 'Face, ID' }).waitFor({ timeout: 30_000 })
  await checksRow.click()
  await page.getByRole('heading', { name: 'Your checks' }).waitFor()
  assert.deepEqual(await page.locator('main .rows > .row').evaluateAll((r) => r.map((x) => [x.tagName, x.textContent, !!x.querySelector('[data-icon="caret-right"]')])), [['DIV', 'Face', false], ['BUTTON', 'ID', true]], 'Face, which does not open; the ID, with its caret')
  const ids = JSON.parse((await kept(page))['forest.ids']!) as Array<{ country?: string; path?: string }>
  assert.deepEqual(ids.map((x) => [x.country, /^stamp\/[0-9a-f]+$/.test(x.path ?? '')]), [['GBR', true]], 'what the device keeps of it: its facts but the name, the birth date and the number, and its entry')
  for (const fact of ['Standin', '1990-01-01']) assert.ok(!JSON.stringify(await kept(page)).includes(fact), `never ${fact} on the device`)
  await shot(page, 'your-checks-id')
  // The ID's page: its name, its badge and Verified; the lock and Open, with no seed held; one unlock, and its rows, from the stamp's facts.
  const asked = counts.asserted
  await page.locator('main .rows > button.row', { hasText: 'ID' }).click()
  await page.getByRole('heading', { name: 'ID', exact: true }).waitFor()
  await page.locator('.donechip', { hasText: 'Verified' }).waitFor()
  const open = button(page, 'Open')
  if (await open.isVisible()) {
    assert.ok(await asks(open), 'Open asks the passkey')
    await open.click()
  }
  const facts = page.getByLabel('What the check read')
  await facts.waitFor({ timeout: 30_000 })
  const rows = await facts.locator('.row .two').evaluateAll((r) => r.map((x) => [x.children[0]!.textContent, x.children[1]!.textContent]))
  assert.deepEqual(rows.map(([k]) => k), ['Name', 'Born', 'Document'], 'a row only for a fact the stamp holds: the stand-in reads no number and no end')
  assert.match(rows[0]![1]!, /^Sam Standin [0-9a-f]+$/)
  assert.equal(rows[2]![1], 'United Kingdom')
  assert.ok(counts.asserted - asked <= 1, 'one unlock at most')
  await shot(page, 'id-page')
  await button(page, 'Back').click()
  await button(page, 'Back').click()
  // The connect page's ticks, from an AI app's login: each of the person's profiles, with no badge.
  const login = await aiLogin()
  await page.goto(login.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  for (const words of [SELLER_WORDS, STUDENT_WORDS, TUTOR_WORDS]) await page.getByRole('checkbox', { name: words }).waitFor()
  assert.equal(await page.getByRole('checkbox').locator('.vb').count(), 0, 'no badge on a tick row')
  await shot(page, 'connect-id')
  await login.client.close()
  await page.goto(APP)
  say("the ID check: paid on the verifier's page in its box, one unlock, both verifications on every profile, and its badge everywhere")
})

test("a test account: Give credits from its link, on a checked person's phone; its 24 words at /type-words, no passkey; links to its profiles, its listing and what it lacks; an AI app given a profile made from a link at once", async () => {
  // Give credits, from the link alone, on the first phone: its wallet holds the ID check's gift.
  const giver = first.page
  await giver.goto(`${APP}#/give-credits/${TESTER_ADDRESS}`)
  await giver.getByRole('heading', { name: 'Give credits' }).waitFor()
  await giver.getByText('Give 20 credits to this account?', { exact: false }).waitFor()
  await giver.getByText(short(TESTER_ADDRESS), { exact: true }).waitFor()
  assert.equal(new URL(giver.url()).hash, '', 'the link out of the #, into the history')
  await shot(giver, 'give-credits')
  await button(giver, 'Give 20 credits').click()
  await giver.getByText('20 credits given to', { exact: false }).waitFor({ timeout: 30_000 })
  assert.equal(await balance(TESTER_ADDRESS), 20)
  await button(giver, 'Done').click()
  await homeTitle(giver).waitFor()

  // Its 24 words, straight from a link: no passkey asked, none made, in, and Your first profiles.
  const t = await phone()
  const { page, counts } = t
  await page.goto(`${APP}type-words`)
  await page.getByRole('heading', { name: 'Your 24 words' }).waitFor()
  await page.getByRole('textbox', { name: 'Your 24 words' }).fill(exportWords(TESTER))
  await button(page, 'Continue').click()
  await page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  assert.deepEqual([counts.created, counts.asserted], [0, 0], 'no passkey made or asked')
  assert.equal((await kept(page))['forest.passkey'], JSON.stringify(`test:${TESTER_ADDRESS}`))

  // A link to a profile it lacks: its market's sheet, Create a tap away, made with no verification.
  await page.goto(`${APP}#/${TUTOR_LABEL}`)
  const sheet = marketSheet(page, TUTORING)
  await sheet.waitFor()
  await sheet.getByRole('button', create(L.offer.role)).click()
  await sheet.getByRole('button', { name: `Open ${L.offer.role}`, exact: true }).waitFor({ timeout: 60_000 })
  const tutor = (await mainKey(TESTER, TUTOR_LABEL)).address
  const body = (await readFolder([services.host], tutor, Date.now())).current.get('profile')!.entry.body!
  assert.deepEqual(body.proofs, [], 'no verification')
  assert.deepEqual([counts.created, counts.asserted], [0, 0], 'nothing asked')

  // A reload: still in, the seed held in the tab, nothing asked.
  await page.reload()
  await page.goto(APP)
  await homeTitle(page).waitFor({ timeout: 30_000 })
  await page.goto(`${APP}#/${TUTOR_LABEL}/listing/nothing-here`)
  await page.getByText("This listing isn't one of yours.", { exact: true }).waitFor({ timeout: 30_000 })
  await page.goto(`${APP}#/${STUDENT_LABEL}/listing/nothing-here`)
  await page.getByText("This listing isn't one of yours.", { exact: true }).waitFor()
  await page.goto(`${APP}#/${STUDENT_LABEL}/messages/${tutor}`)
  await page.getByText('You have no conversation with this profile.', { exact: true }).waitFor()
  await page.goto(`${APP}#/${TUTOR_LABEL}/messages/${TESTER_ADDRESS}`)
  await page.getByText('You have no conversation with this profile.', { exact: true }).waitFor({ timeout: 30_000 })
  await page.goto(`${APP}#/no-such/market`)
  await page.getByText('Forest has no such market.', { exact: true }).waitFor()
  assert.deepEqual([counts.created, counts.asserted], [0, 0], 'nothing asked, all along')

  // An AI app, connected with no passkey.
  const bot = await aiLogin()
  await page.goto(bot.app.authorization!.href)
  await page.getByRole('heading', { name: 'An AI app' }).waitFor()
  assert.deepEqual(await ticks(page), { [TUTOR_WORDS]: 'true' }, 'its one profile, ticked')
  const code = backToTheAiApp(page)
  await button(page, 'Connect').click()
  await bot.transport.finishAuth(await code)
  await backToTheApp(page)

  // A link to another role: Create gives it to the AI app at once, and says to go back to the chat.
  await page.goto(`${APP}#/${STUDENT_LABEL}`)
  await sheet.waitFor()
  await sheet.getByRole('button', create(L.request.role)).click()
  await page.getByText('Your AI can use it. Go back to your chat.', { exact: true }).waitFor({ timeout: 60_000 })
  await page.getByRole('heading', { name: `${roleWords(L.request.role)} profile created` }).waitFor()
  await shot(page, 'made-from-a-link')
  const theirs = await tool(bot, 'my_profiles')
  assert.deepEqual(theirs.profiles.map((x: { label: string }) => x.label).sort(), [STUDENT_LABEL, TUTOR_LABEL].sort(), 'the AI acts for both')
  await button(page, 'Done').click()

  // The AI posts a listing; a link to it opens its offer page, and one to the profile, the profile.
  await tool(bot, 'write', { label: TUTOR_LABEL, path: 'listing/from-the-test', body: BY_THE_AI_BODY })
  await page.goto(`${APP}#/${TUTOR_LABEL}/listing/from-the-test`)
  await page.locator('main .offer-page, main').getByText(BY_THE_AI, { exact: false }).first().waitFor({ timeout: 30_000 })
  await page.goto(`${APP}#/${TUTOR_LABEL}`)
  await inbox(page).waitFor({ timeout: 30_000 })
  assert.deepEqual([counts.created, counts.asserted], [0, 0], 'never a passkey')
  await t.context.close()
  say('a test account: credits given from a link, in from its words with no passkey, its links, and an AI app given a profile made from a link at once')
})

test('the seed held for 15 minutes after the last action: a button that will not ask shows no unlock icon, until the 15 minutes run out', async () => {
  const { page, counts } = first
  await page.clock.install()
  await page.goto(APP)
  // A page just opened holds no seed: the profile's messages button asks it, as its tap goes there.
  const asked = counts.asserted
  await messagesOf(page, TUTOR_WORDS)
  await page.locator('.filters').waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  await page.goBack()
  await button(page, 'New offer').click()
  const send = button(page, 'Post')
  assert.equal(await asks(send), false, 'within the 15 minutes, Post will ask nothing')
  await page.clock.fastForward('14:50')
  assert.equal(await asks(send), false, 'still held')
  await page.clock.fastForward('00:15')
  await send.locator('.unlock').waitFor()
  await shot(page, 'post-asks-again')
  // The page's clock back to the real one: what it writes from now is dated now, as a host takes it.
  await page.clock.setSystemTime(new Date())
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  say('the seed held 15 minutes after the last action, then dropped: the unlock icon back')
})

test("a face check that doesn't pass, in its box: Too many failed tries, Verify with your ID, the ID's Before in the same box, paid and checked there; the Face card greyed, its name alone, until the ID check gives a face stamp too; both Verified, Continue, Add a backup, Your first profiles", async () => {
  const p = await phone()
  // The verifier answers the face stamp as Didit refused it, naming no risk: other.
  await answer(p.context, `${services.verifier}/face/stamp`, 403, { error: 'other' })
  await p.page.goto(APP)
  await imNew(p)
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await checkCard(p.page, 'Face').click()
  await agreed(p.page)
  await diditSays(p.page, 'didit:completed')
  const box = boxOf(p.page)
  await box.getByRole('heading', { name: 'Too many failed tries' }).waitFor({ timeout: 60_000 })
  await box.getByText('Verify with your ID instead.', { exact: true }).waitFor()
  assert.deepEqual(await box.locator('.answer .stack > button').evaluateAll((x) => x.map((y) => [y.textContent, y.className])), [['Verify with your ID', 'primary']], 'Verify with your ID, alone, strong green')
  await shot(p.page, 'face-tries')
  // Verify with your ID: the ID's Before, in the same box; paid on the verifier's page; Didit; Verified.
  await box.getByRole('button', { name: 'Verify with your ID' }).click()
  await agreed(p.page, 'id')
  const idBox = boxOf(p.page, 'id')
  await idBox.locator('iframe').waitFor({ timeout: 60_000 })
  await (await frameAt(p.page, services.verifier)).getByRole('button', { name: 'Pay' }).click()
  await frameAt(p.page, 'https://fake-didit.invalid')
  await diditSays(p.page, 'didit:completed')
  await cardOf(p.page, 'Face + ID').locator('.donechip').waitFor({ timeout: 90_000 })
  await cardOf(p.page, 'Face').locator('.donechip').waitFor()
  assert.deepEqual(JSON.parse((await kept(p.page))['forest.counted']!), ['face', 'id'], 'both, from the ID check')
  await button(p.page, 'Continue').click()
  await p.page.getByRole('heading', { name: 'Add a backup' }).waitFor({ timeout: 60_000 })
  await button(p.page, 'Later').click()
  await p.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  assert.equal(await button(p.page, 'Start').count(), 0)
  await p.context.close()
})

test("the free face check used, with no face stamp: its card greyed, its name alone; a face estimated under 18, its answer", async () => {
  const p = await phone()
  await answer(p.context, `${services.verifier}/face/stamp`, 403, { error: 'too_young' })
  await p.page.goto(APP)
  await imNew(p)
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await checkCard(p.page, 'Face').click()
  await agreed(p.page)
  await diditSays(p.page, 'didit:completed')
  const box = boxOf(p.page)
  await box.getByRole('heading', { name: "We couldn't confirm you're 18 or older" }).waitFor({ timeout: 60_000 })
  await box.getByText('Try with your ID instead.', { exact: true }).waitFor()
  await p.page.locator('.box-shell').getByRole('button', { name: 'Close' }).click()
  await box.waitFor({ state: 'detached' })
  const used = p.page.locator('.vcard.tried[data-check="face"]')
  assert.deepEqual(await used.evaluate((c) => [c.textContent, c.querySelectorAll('.price3, .vlist, button').length, getComputedStyle(c).opacity]), ['Face', 0, '0.5'], 'greyed, its name alone')
  await p.context.close()
})

/** What a beta market says, once, where someone makes a profile or a listing in it: word for word as services' pages say it. */
const BETA_LINE = 'Beta: it works, at your own risk, and may change.'


/** The first person's profile of `label`, opened from Home: its card, or, with none, made from New profile. */
async function profileOf(page: Page, label: string) {
  const [market, role] = label.split('/') as [string, string]
  const words = `${marketWords(market)} ${role}`
  await page.goto(APP)
  await homeTitle(page).waitFor()
  const card = page.locator('button.card', { hasText: words })
  if (await card.count()) await card.first().click()
  else {
    await page.locator('main .titled').getByRole('button', { name: 'New profile' }).click()
    await pickProfile(page, words)
  }
  await page.getByRole('heading', { name: words }).waitFor({ timeout: 120_000 })
}

/** A choice answered on a form, by its value, as suits its field: a long list searched, else its chip or its button. */
async function choose(page: Page, market: string, role: string, name: string, value: string) {
  const field = fieldAsked(market, role, name)
  const words = field.choices!.find((c) => c.value === value)!.label
  if (field.choices!.length > 8) return pick(page, field.label, words)
  const open = await openRow(page, field.label)
  await open.getByRole(!field.several && field.choices!.length > 3 ? 'radio' : 'button', { name: words, exact: true }).click()
  await closeRow(page, field.label)
}

test('a number with its unit, in the form and on its listing: one in the singular, more in the plural; a beta market says so, once, in the form', async () => {
  const { page } = first
  const n = fieldWith(MARKETS, 'a number with a unit, asked as one number, which its preview names', (f, name, side) => f.piece === 'number' && f.unit !== undefined && previewOf(side.market).includes(name) && !fieldAsked(side.market.name, side.role, name).start?.range)
  await profileOf(page, n.label)
  await button(page, `New ${n.offers ? 'offer' : 'request'}`).click()
  assert.equal(await page.getByText(BETA_LINE, { exact: true }).count(), n.market.status === 'beta' ? 1 : 0, 'a beta market says so, once; a live one says nothing')
  // The answers that open it, then the number, its unit after it, in words as the number typed says.
  for (const [name, value] of Object.entries(opening(n.market, n.field))) await choose(page, n.market.name, n.role, name, Array.isArray(value) ? value[0]! : value)
  const NUMBER = fieldAsked(n.market.name, n.role, n.name).label
  const open = await openRow(page, NUMBER)
  const unit = open.locator('.number .unit').first()
  assert.equal(await unit.textContent(), unitWords(n.field.unit!), 'many, before anything is typed')
  await open.getByLabel(NUMBER, { exact: true }).fill('1')
  assert.equal(await unit.textContent(), unitWords(n.field.unit!, '1'), 'one')
  await open.getByRole('button', { name: `More ${NUMBER.toLowerCase()}` }).click()
  assert.equal(await open.getByLabel(NUMBER, { exact: true }).inputValue(), '2', '+ adds one')
  await open.getByLabel(NUMBER, { exact: true }).fill('27')
  assert.equal(await unit.textContent(), unitWords(n.field.unit!, '27'), 'more')
  await shot(page, 'listing-unit')
  await closeRow(page, NUMBER)
  const said = `27 ${unitWords(n.field.unit!, '27')}`
  assert.deepEqual(await rowSays(page, NUMBER), [said], 'the row: the number with its unit')
  await button(page, 'Post').click()
  // Posted: back on the profile.
  await page.locator('.profile-head').waitFor({ timeout: 60_000 })
  const [[, posted]] = (await entriesOf((await mainKey(seed, n.label)).address, 'listing')).filter(([, c]) => JSON.stringify((c.entry.body as Record<string, unknown>)[n.name]) === JSON.stringify(n.field.several ? ['27'] : '27')) as unknown as [[string, { entry: { body: Record<string, unknown> } }]]
  assert.deepEqual(posted.entry.body[n.name], n.field.several ? ['27'] : '27', 'the number as it was typed, in its unit')
  assert.equal(loadMarkets().checkEntry(n.market.name, n.role, 'listing', posted.entry.body), null, 'it fits the market')
  say(`a number with its unit: ${said}`)
})

test('several places in one field: the first round the phone, more searched for by name, each in the list with its caption and its remove button; posted, the listing holds them all, each moved by up to a tenth of its radius', async () => {
  const { page } = first
  const at = fieldWith(MARKETS, 'places waiting on nothing', (f) => f.piece === 'place' && f.several === true && !f.when)
  await profileOf(page, at.label)
  await button(page, `New ${at.offers ? 'offer' : 'request'}`).click()
  const field = fieldAsked(at.market.name, at.role, at.name)
  const radius = field.start!.radiusKm!
  const where = await placeScreen(page, field.label)
  // The phone allowed its location: the first circle round it.
  const here = await captionAt({ lat: String(SPOT.latitude), lon: String(SPOT.longitude), radiusKm: radius })
  await where.locator('.place-caption', { hasText: `Within ${radius} km of ${here}` }).waitFor({ timeout: 20_000 })
  /** Another area: Add another area, then a place searched for by name and picked. */
  const add = async (words: string, found: RegExp) => {
    await where.getByRole('button', { name: 'Add another area' }).click()
    await where.getByRole('searchbox', { name: 'Search a place' }).fill(words)
    await where.getByRole('option', { name: found }).first().click()
    await where.locator('.place-caption', { hasText: found }).waitFor({ timeout: 20_000 })
  }
  await add('chamberi', /Chamberí/)
  await add('monterrey', /Monterrey/)
  const listed = () => where.locator('.place-row .row-button > span:not(.aside)').allTextContents()
  for (const until = Date.now() + 20_000; (await listed()).some((t) => t.startsWith('Within')); await page.waitForTimeout(200)) if (Date.now() > until) break
  const of = (name: string) => `Within ${radius} km of ${name}`
  assert.deepEqual((await listed()).map((t) => t.replace(/,.*$/, '')), [of(here.replace(/,.*$/, '')), of('Chamberí'), of('Monterrey')], 'each its own row, by its size and caption, in order')
  assert.equal(await where.locator('.place-row [data-icon="x"]').count(), 3, 'each its remove button')
  // Removed: its row goes, the others stay.
  await where.getByRole('button', { name: new RegExp(`^Remove ${of('Monterrey')}`) }).click()
  assert.equal(await where.locator('.place-row').count(), 2)
  await shot(page, 'listing-places')
  await closeRow(page, field.label)
  assert.equal((await rowSays(page, field.label)).length, 2, 'the row: both, each a line')
  const DESTINATIONS = 'Either side of the city.'
  if (at.market.listing.description) await page.getByLabel(fieldAsked(at.market.name, at.role, 'description').label, { exact: true }).fill(DESTINATIONS)
  await button(page, 'Post').click()
  // Posted: back on the profile.
  await page.locator('.profile-head').waitFor({ timeout: 60_000 })
  const [[, posted]] = (await entriesOf((await mainKey(seed, at.label)).address, 'listing')).filter(([, c]) => Array.isArray((c.entry.body as Record<string, unknown>)[at.name]) && ((c.entry.body as Record<string, unknown[]>)[at.name]!.length === 2)) as unknown as [[string, { entry: { body: Record<string, Array<Point & { radiusKm: number }>> } }]]
  const [first_, second_] = posted.entry.body[at.name]!
  assert.deepEqual([first_!.radiusKm, second_!.radiusKm], [radius, radius], 'both places, in one field, at the field\'s own radius')
  assert.ok(kmFromSpot(first_!) <= radius * 0.1 + 0.05, `the first round the phone, moved ${kmFromSpot(first_!).toFixed(3)} km`)
  const { places: chamberi } = (await (await fetch(`${services.places}/v1/find?q=chamberi`)).json()) as { places: Array<{ place: Point }> }
  assert.ok(kmApart(second_!, chamberi[0]!.place) <= radius * 0.1 + 0.05, 'the second round Chamberí')
  assert.equal(loadMarkets().checkEntry(at.market.name, at.role, 'listing', posted.entry.body), null, 'it fits the market')
  say('several places in one field: two posted, each moved by up to a tenth of its radius')
})

test("a language picked by its name: the long list shows names, never codes, and searches them; the listing holds the code", async () => {
  const { page } = first
  const lang = fieldWith(MARKETS, 'a shared long list, such as languages, whose names its codes do not say', (f) => typeof f.values === 'string' && isLong(f, MARKETS.lists) && labelled(f, MARKETS.lists) !== undefined && !f.when)
  await profileOf(page, lang.label)
  await button(page, `New ${lang.offers ? 'offer' : 'request'}`).click()
  const field = fieldAsked(lang.market.name, lang.role, lang.name)
  const code = labelled(lang.field, MARKETS.lists)!
  const name = labelOf(lang.field, code, MARKETS.lists, true)
  const open = await openRow(page, field.label)
  const rows = open.getByRole(lang.field.several ? 'checkbox' : 'radio')
  const words = field.choices!.map((c) => c.label)
  assert.deepEqual(await rows.allTextContents(), words.slice(0, 8), 'the first, each by its name, until something is typed')
  // Its code, searched: no row reads it.
  await open.getByRole('searchbox').fill(code)
  assert.ok(!(await rows.allTextContents()).includes(valueWords(code)) && !(await rows.allTextContents()).includes(code), 'never a code')
  // Its name, searched: the names that hold what is typed.
  await open.getByRole('searchbox').fill(name.toLowerCase())
  assert.deepEqual(await rows.allTextContents(), words.filter((w) => w.toLowerCase().includes(name.toLowerCase())), 'found by its name')
  await rows.getByText(name, { exact: true }).click()
  assert.deepEqual(await open.locator('.chips .chip').allTextContents(), [name], 'picked, by its name')
  await shot(page, 'listing-language')
  await closeRow(page, field.label)
  assert.deepEqual(await rowSays(page, field.label), [name], 'the row shows its name')
  const SPOKEN = `Speaking ${name}.`
  if (lang.market.listing.description) await page.getByLabel(fieldAsked(lang.market.name, lang.role, 'description').label, { exact: true }).fill(SPOKEN)
  await button(page, 'Post').click()
  // Posted: back on the profile.
  await page.locator('.profile-head').waitFor({ timeout: 60_000 })
  const posted = (await entriesOf((await mainKey(seed, lang.label)).address, 'listing')).map(([, c]) => c.entry.body as Record<string, unknown>).find((b) => (lang.market.listing.description ? b.description === SPOKEN : b[lang.name] !== undefined))!
  assert.deepEqual(posted[lang.name], lang.field.several ? [code] : code, 'the code, as the market holds it')
  say(`a language by its name: ${name}, posted as ${code}`)
})

test("a profile whose market is gone: forgotten by the device as the page opens, and shown nowhere: not on Home, in the sidebar or Messages' chips", async () => {
  const { page } = first
  // A profile of the person's seed in a market the directory doesn't list, as a test profile from the old markets is: its folder
  // funded from the wallet and its profile entry written, then on the device's list, as a device that made it before keeps it.
  const label = 'pottery/potter'
  assert.equal(MARKETS.market('pottery'), undefined, 'a market the directory does not list')
  const key = await mainKey(seed, label)
  await new App({ seed, hosts: [services.host] }).fund(key.address, 1)
  const view = await readFolder([services.host], key.address, Date.now())
  await write([services.host], [entry(key, 'profile', { market: 'pottery', role: 'potter', hosts: [services.host] }, nextTime(Date.now(), view, 'profile'))])
  const listed = (await kept(page))['forest.profiles']!
  await page.evaluate(([list, gone]) => localStorage.setItem('forest.profiles', JSON.stringify([...JSON.parse(list), gone])), [listed, { label, address: key.address }] as const)
  await page.goto(APP)
  await homeTitle(page).waitFor()
  assert.equal((await kept(page))['forest.profiles'], listed, 'forgotten as the page opened: the device lists only the profiles it listed before')
  assert.equal(await page.locator('button.card', { hasText: 'Pottery' }).count(), 0, 'not on Home')
  assert.equal(await page.locator('main button.sync').count(), 0, 'and not offered to sync')
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.locator('aside.side').waitFor()
  assert.equal(await page.locator('aside.side').getByText('Pottery').count(), 0, 'not in the sidebar')
  await page.locator('aside.side').getByRole('button', { name: 'Messages' }).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  assert.equal(await page.getByText('Pottery').count(), 0, "not among Messages' chips")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(APP)
  await homeTitle(page).waitFor()
  say('a profile whose market is gone: forgotten, shown nowhere')
})

test("the app on a laptop: Home's profiles in columns, each a block, its header on its market's tint with no mark, its offers as lines with their own, up to two and how many more, or No offers yet; a profile's offers as photo tiles, New offer beside its heading; an offer in three panes, its photos one at a time; Messages in two panes; the sidebar in the order the profiles were made, a profile's whole mark there and a listing to update marked, nothing moving; past eight, every profile, the sidebar scrolling, and one search, Search Forest", async () => {
  const { page, counts } = first
  // A third offer of the tutor's, written to the host as another app would, so its block has more than two.
  const tutorKey = await mainKey(seed, TUTOR_LABEL)
  const thirdPath = `listing/${'ab'.repeat(16)}`
  const thirdView = await readFolder([services.host], tutorKey.address, Date.now())
  await write([services.host], [entry(tutorKey, thirdPath, { description: 'Algebra, for the exams.', [L.choice]: valuesIn(L.choice).slice(0, 1) }, nextTime(Date.now() - 86_400_000, thirdView, thirdPath))])
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(APP)
  const side = page.locator('aside.side')
  await side.waitFor()
  // The longest market and role the person has no profile of yet, made from the sidebar's plus.
  const mine = (JSON.parse((await kept(page))['forest.profiles']!) as Array<{ label: string }>).map((p) => p.label)
  const longest = sides(MARKETS)
    .filter((x) => !mine.includes(x.label))
    .map((x) => ({ ...x, market: marketWords(x.market.name), words: `${marketWords(x.market.name)} ${x.role}` }))
    .reduce((a, b) => (b.words.length > a.words.length ? b : a))
  // The sidebar's first line: the mark alone, drawn, a link to Home, then Search Forest; no name.
  assert.equal(await side.locator('.brand button.mark-home svg').count(), 1, 'the mark, drawn')
  assert.deepEqual([await side.locator('.brand svg.wordmark').count(), await side.locator('.brand').textContent()], [0, 'Search Forest'], 'no name, the search beside it')
  await side.locator('.side-head').getByRole('button', { name: 'New profile' }).click()
  await page.getByRole('heading', { name: 'New profile' }).waitFor()
  // New profile on a laptop: as many columns of about 170px as fit.
  const tiles = page.locator('button.market-tile')
  const tops = await tiles.evaluateAll((t) => t.map((x) => Math.round(x.getBoundingClientRect().top)))
  const across = (await page.locator('.market-tiles').evaluate((g) => g.getBoundingClientRect().width))
  const fit = Math.floor((across + 12) / (170 + 12))
  assert.ok(fit > 2, `more than two across: ${fit}`)
  assert.equal(tops.filter((y) => y === tops[0]).length, Math.min(fit, tops.length), `as many columns of about 170px as fit: ${fit}`)
  assert.ok((await tiles.evaluateAll((t) => t.map((x) => x.getBoundingClientRect().width))).every((w) => w >= 170), 'each about 170px or more')
  await shot(page, 'laptop-new-profile')
  await pickProfile(page, longest.words)
  await side.getByRole('button', { name: 'Home', exact: true }).click()
  await homeTitle(page).waitFor()
  // The profiles in columns of about 300px, each a block: its header on a light tint of its market's color, its avatar with
  // no mark (the sidebar holds the profile's), its market and role, its rating; New profile at the top right.
  const blocks = page.locator('main .blocks > section.block')
  await blocks.nth(4).waitFor()
  const boxes = await blocks.evaluateAll((c) => c.map((x) => x.getBoundingClientRect()).map((r) => ({ x: Math.round(r.left), w: r.width })))
  assert.equal(new Set(boxes.map((b) => b.x)).size, 3, 'three columns')
  assert.ok(boxes.every((b) => b.w >= 290), 'each about 300px wide or more')
  assert.equal(await page.locator('main button.card.profile-card').count(), 0, 'blocks, not cards')
  const sellerBlock = blocks.filter({ hasText: SELLER_WORDS })
  const sellerHead = sellerBlock.locator('button.block-head')
  await sellerHead.locator('.rt2 .rate').waitFor({ timeout: 30_000 })
  assert.deepEqual(await sellerHead.evaluate((h) => [(h as HTMLElement).style.getPropertyValue('--h'), h.querySelectorAll('.corner').length, h.querySelector('.nm2')!.textContent]), [colorOf(SHOP), 0, SELLER_WORDS], "on its market's tint, no mark, its market and role")
  assert.notEqual(await sellerHead.evaluate((h) => getComputedStyle(h).backgroundColor), await sellerBlock.evaluate((b) => getComputedStyle(b).backgroundColor), 'a tint, over the white block')
  assert.match((await page.locator('main .titled').getByRole('button', { name: 'New profile' }).getAttribute('class')) ?? '', /primary/, "strong green: Home's one action")
  await page.locator('main').getByRole('group', { name: "How you're verified" }).waitFor()
  // Under each header, its offers as lines (photo, title, price), up to two, then how many more, which opens the profile; or
  // No offers yet.
  const lines = (b: Locator) => b.locator('.block-lines > button.offer.line')
  const sellerAt = (await mainKey(seed, SELLER_LABEL)).address
  const sold = (await entriesOf(sellerAt, 'listing')).length
  await lines(sellerBlock).nth(Math.min(sold, 2) - 1).waitFor({ timeout: 30_000 })
  assert.equal(await lines(sellerBlock).count(), Math.min(sold, 2), 'up to two, none new')
  assert.equal(await lines(sellerBlock).locator('.thumb').count(), Math.min(sold, 2), 'each its picture')
  const tutorBlock = blocks.filter({ hasText: TUTOR_WORDS })
  const offered = (await entriesOf(tutor, 'listing')).length
  assert.ok(offered > 2, `the tutor offers more than two: ${offered}`)
  await lines(tutorBlock).nth(1).waitFor()
  assert.equal(await lines(tutorBlock).count(), 2, 'two in all, none new')
  const moreOf = tutorBlock.getByRole('button', { name: `${offered - 2} more` })
  await moreOf.waitFor()
  await blocks.filter({ hasText: longest.words }).locator('p.none', { hasText: /^No (offers|requests) yet$/ }).waitFor()
  await shot(page, 'laptop-home')
  // A line opens its offer's page, Back to Home.
  const firstLine = (await lines(tutorBlock).first().locator('.offer-title').textContent())!
  await lines(tutorBlock).first().click()
  await page.locator('main.offer-panes > .offer-detail h1.offer-title', { hasText: firstLine }).waitFor()
  await page.locator('main.offer-panes > .offer-detail').getByRole('button', { name: 'Back' }).click()
  await moreOf.click()
  // The profile: its header as on a phone, then its offers as photo tiles, each its mark on the corner, title and price; no
  // pencils; New offer beside the Offers heading.
  await page.locator('.profile-head .ph2 .mk', { hasText: TUTORING }).waitFor()
  const heading = page.locator('main .offers-head')
  assert.deepEqual([await heading.locator('h2').textContent(), (await heading.getByRole('button').textContent())?.trim()], ['Offers', 'New offer'])
  await page.locator('main .tiles > button.offer.tile').nth(offered - 1).waitFor()
  assert.equal(await page.locator('main .tiles > button.offer.tile').count(), offered, 'every offer, a tile')
  assert.equal(await page.locator('main .tiles [data-icon="pencil-simple"]').count(), 0, 'no pencils')
  assert.equal(await page.locator('main .foot button.primary').count(), 0, 'New offer beside the heading, not at the foot')
  await shot(page, 'laptop-profile')
  // The seller's: the coat's tile opens its page.
  await side.getByRole('button', { name: SELLER_WORDS }).click()
  await page.locator('main .tiles > button.offer.tile', { hasText: COAT }).locator('img.thumb').waitFor()
  // An offer: three panes. On the left, the offer, big: its photos one at a time, 1 of 2, its title, its price,
  // its answers in words and its place, its own words, and Edit; beside it, its conversations, here the buyer's, opened by
  // themselves with the seed held; one tapped opens beside them, the offer staying.
  await page.locator('main .tiles > button.offer.tile', { hasText: COAT }).click()
  const detail = page.locator('main.offer-panes > .offer-detail')
  await detail.locator('h1.offer-title', { hasText: COAT }).waitFor()
  assert.equal(await detail.locator('.photos-bar .xs').textContent(), '1 of 2')
  await detail.getByRole('button', { name: 'The photo after' }).click()
  assert.equal(await detail.locator('.photos-bar .xs').textContent(), '2 of 2')
  assert.equal(await detail.locator('.offer-prices').textContent(), '$40')
  await detail.locator('.listing-read.bare .read-row').first().waitFor()
  assert.match((await detail.locator('.read-about').textContent()) ?? '', new RegExp(COAT))
  await detail.getByRole('button', { name: 'Edit' }).waitFor()
  const talks = page.locator('main.offer-panes > .pane-list')
  const asked = counts.asserted
  const talk = talks.locator('button.thread-row', { hasText: short(buyerAt) })
  await talk.waitFor({ timeout: 60_000 })
  assert.deepEqual([await talks.getByRole('button', { name: 'Open' }).count(), counts.asserted - asked], [0, 0], 'opened by themselves, the seed held since the profile was made: no Open, nothing asked')
  assert.equal(await talk.locator('.about-title').count(), 0, "without the offer's title: every one is about it")
  await talk.click()
  await page.locator('main.offer-panes.three > .pane-open').getByRole('textbox', { name: 'Message' }).waitFor()
  await detail.locator('h1.offer-title', { hasText: COAT }).waitFor()
  assert.equal(await talks.locator('button.thread-row[aria-current="true"]').count(), 1, 'the one open, marked')
  await shot(page, 'laptop-offer')

  // Messages: the conversations on the left, nothing open on the right; one tapped opens there, its row in the list on the
  // soft green, where the person is; its header one line, Review outlined, its star and its word.
  await side.getByRole('button', { name: /^Messages/ }).click()
  const list = page.getByRole('region', { name: 'Conversations', exact: true })
  const open = page.getByRole('region', { name: 'Conversation', exact: true })
  await list.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  await open.getByText('Pick a conversation.', { exact: true }).waitFor()
  assert.equal(await list.getByRole('button', { name: 'Back' }).count(), 0, 'no back: the sidebar is there')
  await list.getByRole('group', { name: 'Whose' }).waitFor()
  await list.locator('button.thread-row').first().click()
  await open.getByRole('textbox', { name: 'Message' }).waitFor()
  assert.equal(await list.locator('button.thread-row[aria-current="true"]').count(), 1, 'the one open, marked')
  const openRow = list.locator('button.thread-row[aria-current="true"]')
  assert.deepEqual(await openRow.evaluate((r) => [getComputedStyle(r).backgroundColor, getComputedStyle(r).boxShadow]), [await tokenColor(page, 'mint'), 'none'], 'on the soft green, no edge')
  assert.equal(await list.locator('button.thread-row:not([aria-current])').first().evaluate((r) => getComputedStyle(r).boxShadow), 'none', 'the others flat on the ground')
  const [left, right] = await Promise.all([list.boundingBox(), open.boundingBox()])
  assert.ok(left && right && left.x + left.width <= right.x + 1 && Math.abs(left.y - right.y) < 2, 'side by side')
  assert.equal(await open.getByRole('button', { name: 'Back' }).count(), 0)
  await open.getByRole('button', { name: 'Review' }).waitFor()
  assert.deepEqual([await open.getByRole('button', { name: 'Review' }).getAttribute('class'), (await open.getByRole('button', { name: 'Review' }).textContent())?.trim()], ['small', 'Review'], 'Review, outlined, its star and its word')
  await open.locator('button.convo-head .avb > .mb').waitFor()
  assert.equal(await open.getByText('to your').count(), 0, 'no "to your"')
  await nothingFloats(page, 'Messages on a laptop')
  await shot(page, 'laptop-messages')

  // The order: the profiles in the order they were made, the tutor first, the one just made last, on Home and in the
  // sidebar; then a listing an older market shaped, one to update, in the profile made across the deploy: the yellow ! on its
  // row in the sidebar and on its line on Home, and nothing moves.
  const sideRows = side.locator('button.nav.profile .named')
  const blockNames = page.locator('main .blocks > section.block .block-head .nm2')
  await side.getByRole('button', { name: 'Home', exact: true }).click()
  await homeTitle(page).waitFor()
  const order = await sideRows.allTextContents()
  assert.deepEqual([order[0], order.at(-1)], [TUTOR_WORDS, longest.words], 'the first made first, the one just made last')
  assert.deepEqual(await blockNames.allTextContents(), order, 'on Home too')
  const updatingKey = await mainKey(seed, D.offer.label)
  const path = 'listing/fedcba9876543210fedcba9876543210'
  const old = { description: 'An old phone.', colour: 'mint' }
  assert.notEqual(loadMarkets().checkEntry(D.market.name, D.offer.role, 'listing', old), null, "it doesn't fit the market today")
  const view = await readFolder([services.host], updatingKey.address, Date.now())
  await write([services.host], [entry(updatingKey, path, old, nextTime(Date.now(), view, path))])
  await side.getByRole('button', { name: 'You' }).click()
  await side.getByRole('button', { name: 'Home', exact: true }).click()
  const updating = `${DEPLOY} ${D.offer.role}`
  await warned(side.locator('button.nav.profile', { hasText: updating }).locator('.corner.warn'))
  await warned(blocks.filter({ hasText: updating }).locator('button.offer.line', { hasText: 'An old phone.' }).locator('.corner.warn'))
  assert.equal(await blocks.filter({ hasText: updating }).locator('button.block-head .corner').count(), 0, 'its header no mark')
  assert.deepEqual(await sideRows.allTextContents(), order, 'nothing moves')
  await shot(page, 'laptop-order')
  const now = await readFolder([services.host], updatingKey.address, Date.now())
  await write([services.host], [entry(updatingKey, path, null, nextTime(Date.now(), now, path))])

  // Past eight: the device's list made longer with profiles of the same seed (their addresses as any app works them out, never
  // written: nine more proofs would add minutes). The sidebar lists every one, in Home's order, those whose time isn't
  // known after, scrolling inside itself; Home lists them all, with one search, Search Forest, in the sidebar.
  const listed = (await kept(page))['forest.profiles']!
  const had = JSON.parse(listed) as Array<{ label: string; address: string }>
  const others = sides(MARKETS)
    .map((x) => x.label)
    .filter((label) => !had.some((p) => p.label === label))
    .slice(0, 5)
  const more = await Promise.all(others.map(async (label) => ({ label, address: (await mainKey(seed, label)).address })))
  const all = [...had, ...more]
  assert.ok(all.length > 8, `more than eight: ${all.length}`)
  await page.evaluate((list) => localStorage.setItem('forest.profiles', JSON.stringify(list)), all)
  await page.reload()
  await homeTitle(page).waitFor()
  await blocks.nth(all.length - 1).waitFor()
  assert.equal(await side.locator('button.nav.profile').count(), all.length, 'every profile in the sidebar')
  assert.equal(await side.getByRole('button', { name: /^All profiles/ }).count(), 0, 'no All profiles')
  assert.deepEqual(await sideRows.allTextContents(), await blockNames.allTextContents(), "in Home's order")
  assert.deepEqual((await sideRows.allTextContents()).slice(0, order.length), order, 'those made, as they were; the rest after')
  const scrolls = await side.evaluate((s) => [s.scrollHeight > s.clientHeight, getComputedStyle(s).overflowY, s.getBoundingClientRect().height])
  assert.deepEqual(scrolls, [true, 'auto', 800], 'the sidebar scrolls inside itself, the screen tall')
  const lastRow = side.locator('button.nav.profile').last()
  await lastRow.scrollIntoViewIfNeeded()
  assert.ok(await lastRow.isVisible(), 'the last, scrolled to')
  assert.equal(await side.evaluate((s) => s.scrollTop > 0), true, 'scrolled inside the sidebar')
  assert.equal(await blocks.count(), all.length, 'Home lists them all')
  assert.deepEqual([await page.getByRole('searchbox').count(), await page.getByRole('link', { name: 'Search Forest' }).count()], [0, 1], 'one search: Search Forest')
  await shot(page, 'laptop-many')
  await page.evaluate((list) => localStorage.setItem('forest.profiles', list), listed)
  const thirdNow = await readFolder([services.host], tutorKey.address, Date.now())
  await write([services.host], [entry(tutorKey, thirdPath, null, nextTime(Date.now(), thirdNow, thirdPath))])
  await page.reload()
  await page.setViewportSize({ width: 390, height: 844 })
  say('a laptop: blocks with their offers, photo tiles, an offer in three panes, two panes for Messages, the sidebar in the order made and every profile in it, scrolling, and one search')
})

test("Messages before they're opened, on a laptop: the sidebar's Messages asks the passkey itself; its prompt closed, one block in the middle of the whole content, the lock, New messages when some came, and Open; no split, no Pick a conversation, no chips; opened, the two panes as before; a phone keeps its title and its block; no New message anywhere", async () => {
  const { page, counts } = first
  await page.setViewportSize({ width: 1280, height: 800 })
  await closed(page)
  const side = page.locator('aside.side')
  await side.waitFor()
  await closeTheSheetOnce(page)
  await side.getByRole('button', { name: /^Messages/ }).click()
  const block = page.locator('.unopened')
  await block.waitFor()
  await button(page, 'Open').waitFor()
  assert.match((await block.textContent()) ?? '', /^(New messages)?$/, 'the lock, and New messages when some came')
  assert.equal(await block.locator('[data-icon="lock-simple"]').count(), 1, 'the lock')
  const seen = await page.evaluate(() => {
    const [b, main, list, open] = ['.unopened', 'main.panes', '.pane-list', '.pane-open'].map((q) => document.querySelector(q) as HTMLElement)
    const [box, area, pane] = [b!, main!, list!].map((e) => e.getBoundingClientRect())
    return { centred: Math.abs((box!.left + box!.right) / 2 - (area!.left + area!.right) / 2) < 2, wholeWidth: Math.abs(pane!.width - area!.width) < 2, middle: box!.top > area!.top + area!.height * 0.25 && box!.bottom < area!.bottom - area!.height * 0.25, open: getComputedStyle(open!).display }
  })
  assert.deepEqual(seen, { centred: true, wholeWidth: true, middle: true, open: 'none' }, 'one block, centred across the whole content; the right pane is not there')
  assert.equal(await page.getByText('Pick a conversation.').isVisible(), false, 'no Pick a conversation')
  assert.equal(await page.getByRole('button', { name: 'New message' }).count(), 0, 'no New message')
  assert.equal(await page.getByRole('group', { name: 'Whose' }).count(), 0, 'no chips either')
  await nothingFloats(page, 'Messages, before it is opened')
  await shot(page, 'laptop-messages-closed')
  // Opened, one unlock: the split as before, and still no New message.
  const asked = counts.asserted
  await button(page, 'Open').click()
  const list = page.getByRole('region', { name: 'Conversations', exact: true })
  await list.locator('button.thread-row').first().waitFor({ timeout: 60_000 })
  assert.equal(counts.asserted - asked, 1, 'one unlock')
  await page.getByRole('region', { name: 'Conversation', exact: true }).getByText('Pick a conversation.', { exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'New message' }).count(), 0, 'no New message, opened')
  await list.getByRole('group', { name: 'Whose' }).waitFor()
  assert.equal(await page.locator('.pane-open').evaluate((e) => getComputedStyle(e).display !== 'none'), true, 'the right pane is back')
  // A phone is unchanged: its title above the block.
  await page.setViewportSize({ width: 390, height: 844 })
  await closed(page)
  await closeTheSheetOnce(page)
  await page.locator('.tabbar button', { hasText: 'Messages' }).click()
  await page.getByRole('heading', { name: 'Messages', exact: true }).waitFor()
  await block.waitFor()
  assert.equal(await page.getByRole('button', { name: 'New message' }).count(), 0, 'no New message on a phone either')
  assert.equal(await page.locator('main.panes').count(), 0, 'and no panes')
  await page.goto(APP)
  await homeTitle(page).waitFor()
  say('Messages on a laptop before they are opened: one block across the whole content, no split; opened, the panes; a phone as it was; no New message anywhere')
})

const MORNING = 'ada@example.com'
const ELSEWHERE = 'ada@example.org'

test("Email: Off to start; Turn on, then Which profiles? in a sheet, every profile on, two kept; a code asked for with the passkey, a wrong code, the code, On; a tick saved at once; the pencil opens the row in place: a new address with a new code, the old one gone; a second code inside a minute waits; a second browser sees the same state after its unlock; Delete email asks again in place, then Off, all deleted at the host", async () => {
  const { page, counts } = first
  const wallet = await mainKey(seed, '')
  const entryNow = async () => {
    const body = (await readFolder([services.host], wallet.address, Date.now())).current.get('email')?.entry.body ?? null
    return { body, opened: body && isLocked(body) ? await openLocked(body, (await openingHalf(wallet.secret)).identity) : null }
  }
  /** Whether the host holds the email with this id: its answer to a change with no body is 400 when it does, 404 when it does not. */
  const atHost = async (id: string) => ((await fetch(`${services.host}/email/${id}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })).status === 404 ? 'gone' : 'there')
  const [tutorAt, sellerAt] = [tutor, (await mainKey(seed, SELLER_LABEL)).address]

  await closed(page)
  await button(page, 'You').click()
  const emailRow = page.locator('button.row', { hasText: 'Email' })
  assert.equal(await emailRow.locator('.two > span').textContent(), 'Off', 'Off under its name')
  await emailRow.click()
  await page.getByRole('heading', { name: 'Email', exact: true }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/email')
  /** A profile as Email names it: its market, a dot, its role. */
  const dotted = (words: string) => split(words).join(' · ')

  // 1. Off: one line, Your email, Turn on, strong green; nothing asked yet.
  await page.getByText("One email each morning when something's new.", { exact: true }).waitFor()
  await page.getByLabel('Your email').waitFor()
  const turnOn = button(page, 'Turn on')
  assert.equal(await turnOn.evaluate((b) => getComputedStyle(b).backgroundColor), await tokenColor(page, 'forest'), 'strong green')
  assert.equal(await page.getByRole('checkbox').count(), 0, 'no ticks on the page')
  await nothingFloats(page, 'Email, off')
  await shot(page, 'email-off')
  const asked0 = counts.asserted
  await turnOn.click()
  await page.getByText("That doesn't look like an email address.", { exact: true }).waitFor()
  await page.getByLabel('Your email').fill(MORNING)
  await turnOn.click()
  // Which profiles?, a sheet: each profile a row, its avatar, Market · role and a round tick, all on; the host's line; Continue, which asks the passkey.
  const which = page.getByRole('dialog', { name: 'Which profiles?' })
  await which.getByRole('heading', { name: 'Which profiles?' }).waitFor()
  const everyone = await ticks(page)
  assert.ok(Object.keys(everyone).length >= 4 && Object.values(everyone).every((t) => t === 'true'), `every profile on to start: ${Object.keys(everyone).length}`)
  assert.ok(Object.keys(everyone).includes(dotted(TUTOR_WORDS)), 'each as Market · role')
  assert.equal(await which.locator('.tick.round').count(), Object.keys(everyone).length, 'round ticks')
  assert.equal(await which.locator('.row .av').count(), Object.keys(everyone).length, 'each its avatar')
  await which.getByText("Forest's host will know these share your email.", { exact: true }).waitFor()
  assert.ok(await asks(which.getByRole('button', { name: 'Continue' })), 'Continue asks the passkey: the seed is dropped')
  await shot(page, 'email-which')
  for (const name of Object.keys(everyone)) await which.getByRole('checkbox', { name }).click()
  await which.getByRole('button', { name: 'Continue' }).click()
  await which.getByText('Tick at least one profile.', { exact: true }).waitFor()
  assert.equal(counts.asserted - asked0, 0, 'nothing asked for either')
  // Two profiles ticked; one unlock, each signing.
  for (const name of [TUTOR_WORDS, SELLER_WORDS]) await which.getByRole('checkbox', { name: dotted(name) }).click()
  const asked = counts.asserted
  await which.getByRole('button', { name: 'Continue' }).click()
  // 2. Code sent: the sheet gone, the email shown with Change, the 6-digit code, Turn on.
  const code = page.getByLabel('6-digit code')
  await code.waitFor({ timeout: 60_000 })
  await which.waitFor({ state: 'detached' })
  assert.equal(counts.asserted - asked, 1, 'one unlock: each ticked profile signs')
  await page.getByText(MORNING, { exact: true }).waitFor()
  await button(page, 'Change').waitFor()
  assert.deepEqual(services.sent.at(-1)!.body.to, [MORNING], 'the host emailed the code')
  assert.equal((await entryNow()).body, null, 'nothing kept until it is on')
  await shot(page, 'email-code')
  // A wrong code: one line, and still waiting.
  const sent = codeSentTo(services.sent, MORNING)
  await code.fill(sent === '000000' ? '111111' : '000000')
  await button(page, 'Turn on').click()
  await page.getByText("That code isn't right, or it has expired. Send a new one.", { exact: true }).waitFor()
  assert.equal((await entryNow()).body, null)
  // The code: Turn on asks nothing, the seed held since Continue.
  await code.fill(sent)
  assert.equal(await asks(button(page, 'Turn on')), false)
  await button(page, 'Turn on').click()

  // 3. On: the email on a white row with its mail icon and a pencil; Profiles, each its round tick; no Turn off button.
  const pencil = button(page, 'Edit email')
  await pencil.waitFor({ timeout: 60_000 })
  const emailLine = page.locator('main .rows > .row', { hasText: MORNING })
  assert.deepEqual(await emailLine.evaluate((r) => [...r.querySelectorAll('svg')].map((x) => (x as SVGElement).dataset.icon)), ['envelope-simple', 'pencil-simple'])
  await page.getByRole('heading', { name: 'Profiles', exact: true }).waitFor()
  assert.deepEqual(Object.entries(await ticks(page)).filter(([, t]) => t === 'true').map(([n]) => n).sort(), [dotted(SELLER_WORDS), dotted(TUTOR_WORDS)].sort(), 'the two profiles')
  assert.deepEqual([await button(page, 'Turn off').count(), await button(page, 'Save').count()], [0, 0], 'no Turn off, no Save')
  await nothingFloats(page, 'Email, on')
  await shot(page, 'email-on')
  const onIt = await entryNow()
  assert.ok(isLocked(onIt.body), 'one locked entry in the Profiles folder')
  const kept1 = onIt.opened as { id: string; email: string; profiles: string[] }
  const id1 = kept1.id
  assert.match(id1, /^[A-Za-z0-9_-]{22}$/)
  assert.deepEqual({ ...kept1, profiles: [...kept1.profiles].sort() }, { id: id1, email: MORNING, profiles: [tutorAt, sellerAt].sort() }, 'its id, the address and the two profiles')
  assert.equal(JSON.stringify(onIt.body).includes(MORNING), false, 'nothing readable in it')
  assert.equal(await atHost(id1), 'there')
  assert.equal(JSON.parse((await kept(page))['forest.email']!).email, MORNING, 'the device keeps a copy')
  // A tick tapped: saved at once, with the seed held; the host and the entry count the tutor alone.
  await page.getByRole('checkbox', { name: dotted(SELLER_WORDS) }).click()
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('forest.email') ?? 'null')?.profiles ?? []).length === 1, undefined, { timeout: 60_000 })
  assert.deepEqual(((await entryNow()).opened as { profiles: string[] }).profiles, [tutorAt], 'the tutor alone')
  // The last one stays: one line.
  await page.getByRole('checkbox', { name: dotted(TUTOR_WORDS) }).click()
  await page.getByText('Tick at least one profile.', { exact: true }).waitFor()
  // The row in You says it.
  await button(page, 'Back').click()
  assert.equal(await emailRow.locator('.two > span').textContent(), 'Every morning')
  await emailRow.click()

  // The pencil: the row opens in place, the email in a field, Delete email, red, at the left, Save, strong green, at the right.
  await pencil.click()
  const edit = page.getByRole('group', { name: 'Your email' })
  await edit.waitFor()
  assert.equal(await edit.getByLabel('Your email').inputValue(), MORNING)
  const [del, save] = [edit.getByRole('button', { name: 'Delete email' }), edit.getByRole('button', { name: 'Save' })]
  assert.deepEqual(await del.evaluate((b) => [b.className, (b.querySelector('svg') as SVGElement).dataset.icon]), ['danger text', 'trash'])
  assert.ok((await del.boundingBox())!.x < (await save.boundingBox())!.x, 'Delete email at the left, Save at the right')
  await shot(page, 'email-edit')
  // A new address: a new code; the old one stays until the new one is on.
  await edit.getByLabel('Your email').fill(ELSEWHERE)
  await save.click()
  await page.getByLabel('6-digit code').waitFor({ timeout: 60_000 })
  await page.getByText(ELSEWHERE, { exact: true }).waitFor()
  assert.equal(await atHost(id1), 'there', 'the old one stays until the new one is on')
  await page.getByLabel('6-digit code').fill(codeSentTo(services.sent, ELSEWHERE))
  await button(page, 'Turn on').click()
  // On, once the code's step is gone: its own row already shows the address while the code is asked.
  await page.getByLabel('6-digit code').waitFor({ state: 'detached', timeout: 60_000 })
  await page.locator('main .rows > .row', { hasText: ELSEWHERE }).waitFor()
  const kept2 = (await entryNow()).opened as { id: string; email: string; profiles: string[] }
  assert.deepEqual([kept2.email, kept2.profiles, kept2.id === id1], [ELSEWHERE, [tutorAt], false], 'a new id, the new address, the tutor')
  assert.equal(await atHost(id1), 'gone', 'the old one gone')
  assert.equal(await atHost(kept2.id), 'there')
  // A second code to an address inside a minute waits; the same address saved closes the row.
  const third = `third-${MORNING}`
  await pencil.click()
  await edit.getByLabel('Your email').fill(third)
  await edit.getByRole('button', { name: 'Save' }).click()
  await page.getByLabel('6-digit code').waitFor({ timeout: 60_000 })
  await button(page, 'Change').click()
  await edit.getByRole('button', { name: 'Save' }).click()
  await page.getByText('Wait a minute, then send a new code.', { exact: true }).waitFor()
  await edit.getByLabel('Your email').fill(ELSEWHERE)
  await edit.getByRole('button', { name: 'Save' }).click()
  await edit.waitFor({ state: 'detached' })
  await pencil.waitFor()

  // A second browser, the same passkey answering from the first: after its Start it shows the same state.
  const other = await phone()
  await answerFrom(other, first)
  await other.page.goto(APP)
  await elsewhere(other)
  await button(other.page, 'Not now').click({ timeout: 60_000 })
  await homeWith(other.page, TUTOR_WORDS)
  await button(other.page, 'You').click()
  assert.equal(await other.page.locator('button.row', { hasText: 'Email' }).locator('.two > span').textContent(), 'Every morning', 'the same state, once it has unlocked')
  await other.page.locator('button.row', { hasText: 'Email' }).click()
  await other.page.getByText(ELSEWHERE, { exact: true }).waitFor()
  assert.deepEqual(Object.entries(await ticks(other.page)).filter(([, t]) => t === 'true').map(([n]) => n), [dotted(TUTOR_WORDS)], 'the same ticks')
  await other.context.close()

  // Delete email asks again, in its own place; Cancel keeps it; Delete deletes it all, as Turn off did.
  await pencil.click()
  await edit.getByRole('button', { name: 'Delete email' }).click()
  const asking = page.getByRole('group', { name: 'Delete your email?' })
  await asking.waitFor()
  assert.deepEqual((await asking.getByRole('button').allTextContents()).map((t) => t.trim()), ['Cancel', 'Delete'])
  assert.equal(await edit.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'Save gives way while Delete email asks')
  await shot(page, 'email-delete')
  await asking.getByRole('button', { name: 'Cancel' }).click()
  await edit.getByRole('button', { name: 'Save', exact: true }).waitFor()
  assert.equal(await atHost(kept2.id), 'there', 'Cancel keeps it')
  await edit.getByRole('button', { name: 'Delete email' }).click()
  await asking.getByRole('button', { name: 'Delete' }).click()
  await button(page, 'Turn on').waitFor({ timeout: 60_000 })
  assert.equal(await atHost(kept2.id), 'gone', 'deleted at the host')
  assert.equal((await entryNow()).body, null, 'and its entry')
  assert.equal((await kept(page))['forest.email'], undefined, 'and the device copy')
  await button(page, 'Back').click()
  assert.equal(await emailRow.locator('.two > span').textContent(), 'Off')
  await page.goto(APP)
  say('Email: Which profiles?, a code, a wrong one, On, a tick saved, the pencil, a new address, a second code waiting, a second browser, Delete email')
})

test("a range: a number the market asks as From and To, either end left empty; its words as the markets read them; posted open at the top, reopened a range, posted again open at the bottom, in place", async () => {
  const { page } = first
  const r = fieldWith(MARKETS, 'a number asked as a range, with a unit, in a market whose listings have a description', (f, name, side) => f.piece === 'number' && f.unit !== undefined && fieldAsked(side.market.name, side.role, name).start?.range === true && side.market.listing.description !== undefined)
  const unit = r.field.unit!
  const said = (value: object) => MARKETS.read({ ...r.field, several: undefined }, value)
  const held = (value: object) => (r.field.several ? [value] : value)
  await profileOf(page, r.label)
  await button(page, `New ${r.offers ? 'offer' : 'request'}`).click()
  for (const [name, value] of Object.entries(opening(r.market, r.field))) await choose(page, r.market.name, r.role, name, Array.isArray(value) ? value[0]! : value)
  const RANGED = 'Open at the top, then at the bottom.'
  await page.getByLabel(fieldAsked(r.market.name, r.role, 'description').label, { exact: true }).fill(RANGED)
  const NAME = fieldAsked(r.market.name, r.role, r.name).label
  // From and To, each empty for no limit that way, its unit after them.
  let open = await openRow(page, NAME)
  assert.deepEqual([await open.getByLabel('From', { exact: true }).getAttribute('placeholder'), await open.getByLabel('To', { exact: true }).getAttribute('placeholder')], ['From', 'To'])
  await open.getByLabel('From', { exact: true }).fill('18')
  assert.equal(await open.locator('.range .unit').textContent(), unitWords(unit, '18'))
  assert.equal(await open.locator('.range-words').textContent(), said({ from: '18' }), 'open at the top')
  await open.getByLabel('To', { exact: true }).fill('25')
  assert.equal(await open.locator('.range-words').textContent(), said({ from: '18', to: '25' }), 'from one to another')
  await open.getByLabel('To', { exact: true }).fill('')
  await shot(page, 'listing-range')
  await closeRow(page, NAME)
  assert.deepEqual(await rowSays(page, NAME), [said({ from: '18' })])
  await button(page, 'Post').click()
  const card = offerCard(page, RANGED)
  await card.waitFor({ timeout: 60_000 })
  const address = (await mainKey(seed, r.label)).address
  const postedOf = async () => (await entriesOf(address, 'listing')).filter(([, c]) => (c.entry.body as Record<string, unknown>).description === RANGED)
  const [[path, posted]] = (await postedOf()) as unknown as [[string, { entry: { body: Record<string, unknown> } }]]
  assert.deepEqual(posted.entry.body[r.name], held({ from: '18' }), 'its top left out')
  assert.equal(loadMarkets().checkEntry(r.market.name, r.role, 'listing', posted.entry.body), null, 'it fits the market')

  // Reopened, from its page: a range again, with its words; open at the bottom now.
  await editOffer(page, RANGED)
  await page.getByRole('heading', { name: r.offers ? 'Offer' : 'Request', exact: true }).waitFor()
  open = await openRow(page, NAME)
  assert.deepEqual([await open.getByLabel('From', { exact: true }).inputValue(), await open.getByLabel('To', { exact: true }).inputValue()], ['18', ''])
  await open.getByLabel('From', { exact: true }).fill('')
  await open.getByLabel('To', { exact: true }).fill('11')
  assert.equal(await open.locator('.range-words').textContent(), said({ to: '11' }), 'open at the bottom')
  await button(page, 'Post').click()
  await page.locator('button.card.offer-big', { hasText: RANGED }).waitFor({ timeout: 60_000 })
  await button(page, 'Back').click()
  await card.waitFor({ timeout: 60_000 })
  for (const until = Date.now() + 30_000; ; await page.waitForTimeout(300)) {
    const now = (await postedOf()) as unknown as Array<[string, { entry: { body: Record<string, unknown> } }]>
    if (now.length === 1 && JSON.stringify(now[0]![1].entry.body[r.name]) === JSON.stringify(held({ to: '11' }))) {
      assert.equal(now[0]![0], path, 'in place: its own path, and no second')
      break
    }
    if (Date.now() > until) throw new Error(`the range posted again: ${JSON.stringify(now.map(([p, c]) => [p, c.entry.body[r.name]]))}`)
  }
  say(`a range: ${said({ from: '18' })}, then ${said({ to: '11' })}`)
})

test("spots: the description the form's first field; the listing's spots by the market's word for them, a whole number; a time's own under Advanced, its hint, posted with the time and read with it; reopened, Advanced open by itself, holding them", async () => {
  const { page } = first
  const weekly = (f: { piece: string; several?: boolean; when?: unknown; start?: { way?: string; hours?: boolean } }) => f.piece === 'date' && f.several === true && !f.when && f.start?.way === 'weekly' && f.start?.hours === true
  const sp = fieldWith(MARKETS, 'spots, beside times asked weekly with their hours', (_, name, side) => name === 'spots' && MARKETS.ask(side.market.name, side.role).some(weekly))
  const day = MARKETS.ask(sp.market.name, sp.role).find(weekly)!
  const [DESCRIPTION, SPOTS, DAYS] = [fieldAsked(sp.market.name, sp.role, 'description').label, fieldAsked(sp.market.name, sp.role, 'spots').label, day.label]
  const OWN = `${SPOTS} at this time`
  const TEXT = 'Saturday mornings, in the park.'
  await profileOf(page, sp.label)
  await button(page, `New ${sp.offers ? 'offer' : 'request'}`).click()
  assert.equal(await page.locator('#listing > :first-child textarea').getAttribute('aria-label'), DESCRIPTION, 'the description, first, as the market asks it')
  await page.getByLabel(DESCRIPTION, { exact: true }).fill(TEXT)
  // The listing's spots: a whole number, − and + beside it, no unit.
  let open = await openRow(page, SPOTS)
  await open.getByLabel(SPOTS, { exact: true }).fill('5')
  await open.getByRole('button', { name: `More ${SPOTS.toLowerCase()}` }).click()
  assert.equal(await open.locator('.unit').count(), 0, 'no unit')
  await closeRow(page, SPOTS)
  assert.deepEqual(await rowSays(page, SPOTS), ['6'])
  // A time, every Saturday from 10 to 12, and its own spots under Advanced, closed till tapped.
  open = await openRow(page, DAYS)
  await open.getByRole('button', { name: 'Saturday', exact: true }).click()
  await open.getByLabel('From', { exact: true }).fill('10:00')
  await open.getByLabel('To', { exact: true }).fill('12:00')
  assert.equal(await open.getByLabel(OWN, { exact: true }).count(), 0, 'Advanced closed')
  const advanced = open.getByRole('button', { name: 'Advanced' })
  assert.equal(await advanced.getAttribute('aria-expanded'), 'false')
  await advanced.click()
  await open.getByText("Only for this time. 0 when it's full.", { exact: true }).waitFor()
  await open.getByLabel(OWN, { exact: true }).fill('3')
  await shot(page, 'listing-spots')
  await closeRow(page, DAYS)
  assert.match((await rowSays(page, DAYS)).join(' '), /, 3 spots/, 'read with its time')
  await button(page, 'Post').click()
  const card = offerCard(page, TEXT)
  await card.waitFor({ timeout: 60_000 })
  const address = (await mainKey(seed, sp.label)).address
  const [[, posted]] = (await entriesOf(address, 'listing')).filter(([, c]) => (c.entry.body as Record<string, unknown>).description === TEXT) as unknown as [[string, { entry: { body: any } }]]
  const body = posted.entry.body
  assert.deepEqual([body.spots, body[day.name].map((t: any) => [t.every, t.start, t.end, t.spots])], ['6', [[['saturday'], '10:00', '12:00', '3']]], "the listing's spots, and the time's own")
  assert.equal(loadMarkets().checkEntry(sp.market.name, sp.role, 'listing', body), null, 'it fits the market')
  // Reopened, from its page: Advanced open by itself, the time's own spots in it.
  await editOffer(page, TEXT)
  await page.getByRole('heading', { name: sp.offers ? 'Offer' : 'Request', exact: true }).waitFor()
  open = await openRow(page, DAYS)
  assert.equal(await open.getByRole('button', { name: 'Advanced' }).getAttribute('aria-expanded'), 'true', 'open by itself')
  assert.equal(await open.getByLabel(OWN, { exact: true }).inputValue(), '3')
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await card.waitFor()
  say(`spots: ${body.spots}, and ${body[day.name][0].spots} on Saturdays from 10 to 12, under Advanced`)
})

test('a price list: two prices, the first for several of what the market prices by, posted; its card the first price as people say it, and +1 more; reopened, both, each with its remove button until one is left; a length in minutes, held as hours', async () => {
  const { page } = first
  const [pack, hour] = [L.per.find((p) => p !== 'hour')!, 'hour']
  assert.ok(L.per.includes(hour), 'lessons are priced by the hour')
  await profileOf(page, TUTOR_LABEL)
  await button(page, 'New offer').click()
  const ask = (name: string) => fieldAsked(LESSONS, L.offer.role, name)
  const PRICED = 'Five lessons for less, or by the hour.'
  await page.getByLabel(ask('description').label, { exact: true }).fill(PRICED)
  // One price to start, with no remove button, so the last is never removed.
  const open = await openRow(page, ask('price').label)
  assert.equal(await open.getByRole('button', { name: /^Remove price/ }).count(), 0, 'no remove button on the last price')
  await open.getByLabel('Currency', { exact: true }).selectOption('MXN')
  await open.getByLabel('Amount', { exact: true }).fill('1300')
  await open.getByLabel('For', { exact: true }).selectOption(pack)
  await open.getByLabel('How many', { exact: true }).fill('5')
  assert.equal(await open.getByLabel('For', { exact: true }).locator('option:checked').textContent(), `${pack}s`, 'its per, many')
  // Add another price: a second, both numbered, each with its remove button, in the last one's currency.
  await open.getByRole('button', { name: 'Add another price' }).click()
  await open.getByLabel('Amount 2', { exact: true }).fill('25')
  assert.equal(await open.getByLabel('Currency 2', { exact: true }).inputValue(), 'MXN', "in the last one's currency")
  await open.getByLabel('Currency 2', { exact: true }).selectOption('USD')
  // 45 minutes: held as 0.75 of an hour. 50 is no exact part of an hour: said, and not posted so.
  await open.getByLabel('For 2', { exact: true }).selectOption('minutes')
  await open.getByLabel('How many 2', { exact: true }).fill('50')
  await open.getByText('Minutes go in steps of 3, such as 45.', { exact: true }).waitFor()
  await open.getByLabel('How many 2', { exact: true }).fill('45')
  await open.getByText('Minutes go in steps of 3, such as 45.', { exact: true }).waitFor({ state: 'detached' })
  await open.getByLabel('Note 2', { exact: true }).fill('at least 2 lessons')
  assert.equal(await open.getByRole('button', { name: /^Remove price/ }).count(), 2, 'each its remove button')
  await shot(page, 'listing-prices')
  await closeRow(page, ask('price').label)
  assert.deepEqual(await rowSays(page, ask('price').label), [`MX$1,300 for 5 ${pack}s`, '$25 for 45 minutes'])
  await button(page, 'Post').click()
  const card = offerCard(page, PRICED)
  await card.waitFor({ timeout: 60_000 })
  // Small: the first price, what it is for, and how many more.
  assert.equal(await card.locator('.offer-price').textContent(), `MX$1,300 for 5 ${pack}s +1 more`)
  const [[, posted]] = (await entriesOf((await mainKey(seed, TUTOR_LABEL)).address, 'listing')).filter(([, c]) => (c.entry.body as Record<string, unknown>).description === PRICED) as unknown as [[string, { entry: { body: Record<string, unknown> } }]]
  assert.deepEqual(posted.entry.body.price, [{ amount: '1300', currency: 'MXN', per: pack, count: '5' }, { amount: '25', currency: 'USD', per: hour, count: '0.75', note: 'at least 2 lessons' }], 'every price, in order, a count as decimal text, a length in hours')
  assert.equal(loadMarkets().checkEntry(LESSONS, L.offer.role, 'listing', posted.entry.body), null, 'it fits the market')
  // Reopened, from its page: every price, as posted, the length in minutes again; one removed, the last has no remove button.
  await editOffer(page, PRICED)
  await page.getByRole('heading', { name: 'Offer', exact: true }).waitFor()
  const again = await openRow(page, ask('price').label)
  assert.deepEqual([await again.getByLabel('Amount 1', { exact: true }).inputValue(), await again.getByLabel('How many 1', { exact: true }).inputValue(), await again.getByLabel('Amount 2', { exact: true }).inputValue(), await again.getByLabel('How many 2', { exact: true }).inputValue()], ['1300', '5', '25', '45'])
  await again.getByRole('button', { name: 'Remove price 2' }).click()
  assert.equal(await again.getByRole('button', { name: /^Remove price/ }).count(), 0, 'the last one stays')
  assert.equal(await again.getByLabel('Amount', { exact: true }).inputValue(), '1300')
  await button(page, 'Close').click()
  await button(page, 'Back').click()
  await card.waitFor()
  say(`a price list: MX$1,300 for 5 ${pack}s, +1 more, and $25 for 45 minutes`)
})

test("every market's own icon, from its market file, and its color by its number, the index's ten in their order, so markets numbered next to each other differ; one of the person's own profiles the same", async () => {
  const { page } = first
  await page.goto(APP)
  await homeTitle(page).waitFor()
  const tutorCard = page.locator('button.card', { hasText: TUTOR_WORDS })
  const number = MARKETS.market(LESSONS)!.number
  assert.deepEqual(await avatarOf(tutorCard.locator('.av')).then((a) => [a.h, a.icon]), [PALETTE[(number - 1) % 10], MARKETS.market(LESSONS)!.icon ?? undefined], "the tutor's avatar: its market file's icon, its number's color")
  await page.locator('main').getByRole('button', { name: 'New profile', exact: true }).click()
  await page.locator('button.market-tile').first().waitFor()
  const drawn = await page.locator('button.market-tile').evaluateAll((t) => t.map((x) => [x.querySelector('svg')?.dataset.icon ?? null, x.querySelector('.letter')?.textContent ?? null, (x as HTMLElement).style.getPropertyValue('--h')]))
  assert.deepEqual(
    drawn,
    MARKETS.directory.markets.map((m) => [m.icon ?? null, m.icon ? null : m.name.charAt(0).toUpperCase(), PALETTE[(m.number - 1) % 10]]),
    "each its file's icon, else its first letter, on its number's color",
  )
  const colorAt = new Map(MARKETS.directory.markets.map((m, i) => [m.number, drawn[i]![2]]))
  for (const [n, color] of colorAt) if (colorAt.has(n + 1)) assert.notEqual(colorAt.get(n + 1), color, `${n} and ${n + 1} apart`)
  await shot(page, 'market-icons')
  await page.goto(APP)
  say(`every market its own icon and its number's color: ${MARKETS.directory.markets.map((m) => `${m.number} ${m.icon}`).join(', ')}`)
})

/** The verifier's GET / in `context`, as it answers, with its ID check's `forSale` and `testPayments` as given: a verifier with no Stripe key, or a live one. */
async function idCheckSays(context: BrowserContext, id: { forSale: boolean; testPayments: boolean }) {
  await context.route(`${services.verifier}/`, async (route) => {
    if (route.request().method() !== 'GET') return route.continue()
    const response = await route.fetch()
    const body = await response.json()
    await route.fulfill({ response, json: { ...body, id: { ...body.id, ...id } } })
  })
}

test("the ID check while the verifier doesn't sell it: nowhere, not on Get verified, You or Home; a face seen before offers Use my other passkey alone; sold with a live key, its card with no test line", async () => {
  const a = await phone()
  await idCheckSays(a.context, { forSale: false, testPayments: false })
  await a.page.goto(APP)
  await imNew(a)
  await a.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await checkCard(a.page, 'Face').waitFor()
  await a.page.waitForTimeout(500)
  assert.deepEqual(await a.page.locator('.vcard').evaluateAll((c) => c.map((x) => x.getAttribute('data-check'))), ['face'], 'the face check alone')
  await faceCheck(a)
  assert.equal(await button(a.page, 'Continue').getAttribute('class'), 'primary', 'with no ID to do, Continue strong green')
  await onward(a)
  await pickFirst(a.page, TUTOR_WORDS)
  await button(a.page, 'Back').click()
  await homeTitle(a.page).waitFor()
  await button(a.page, 'You').click()
  await a.page.getByRole('heading', { name: 'You', exact: true }).waitFor()
  await a.page.locator('button.row', { hasText: 'Your checks' }).locator('.two > span', { hasText: 'Face' }).waitFor()
  assert.equal(await a.page.locator('main .top').getByRole('button', { name: 'Verify with Face + ID' }).count(), 0, 'You: no ID outline')
  await a.page.locator('button.row', { hasText: 'Your checks' }).click()
  await a.page.getByRole('heading', { name: 'Your checks' }).waitFor()
  assert.deepEqual(await a.page.locator('main .rows > .row strong').allTextContents(), ['Face'], 'Your checks: no ID row')
  await button(a.page, 'Back').click()
  await a.page.setViewportSize({ width: 1280, height: 800 })
  await a.page.goto(APP)
  const badges = a.page.getByRole('group', { name: "How you're verified" })
  await badges.waitFor()
  await a.page.waitForTimeout(500)
  assert.equal(await badges.locator('[data-icon="identification-card"]').count(), 0, "Home: no ID outline")
  assert.equal(await badges.locator('[data-icon="scan-smiley"]').count(), 1, 'the face badge')

  // A second browser, I'm new by mistake, the same face: the ID check isn't there to point to, so Use my other passkey alone.
  const b = await phone()
  await idCheckSays(b.context, { forSale: false, testPayments: false })
  await answer(b.context, `${services.verifier}/face/stamp`, 403, { error: 'known_face' })
  await b.page.goto(APP)
  await imNew(b)
  await b.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  await checkCard(b.page, 'Face').click()
  await agreed(b.page)
  await diditSays(b.page, 'didit:completed')
  const box = boxOf(b.page)
  await box.getByRole('heading', { name: 'Someone with a similar face is already verified' }).waitFor({ timeout: 60_000 })
  assert.deepEqual(await box.locator('.answer .stack > button').allTextContents(), ['Use my other passkey'], 'no Verify with your ID while it is not sold')
  await shot(b.page, 'face-seen-not-for-sale')

  // Sold with a live key: the ID card, as it is, with no test line.
  const c = await phone()
  await idCheckSays(c.context, { forSale: true, testPayments: false })
  await c.page.goto(APP)
  await imNew(c)
  await cardOf(c.page, 'Face + ID').getByText('10× the credits').waitFor({ timeout: 60_000 })
  assert.equal(await c.page.locator('.vcard .vtest').count(), 0, 'no test line with a live key')
  for (const p of [a, b, c]) await p.context.close()
  say("not for sale: the ID nowhere, a face seen before offers the other passkey alone; a live key: no test line")
})

test("Passkeys don't work here: in an app's own browser, in place of Start, Open Forest in a different browser and Copy link, which copies the page's address and says Copied", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ...(shots && { deviceScaleFactor: 2 }), permissions: ['clipboard-read', 'clipboard-write'], userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0' })
  const page = await context.newPage()
  await page.goto(`${APP}message?to=${tutor}`)
  const here = page.getByRole('region', { name: "Passkeys don't work here" })
  await here.getByText('Open Forest in a different browser.', { exact: true }).waitFor()
  assert.equal(await button(page, 'Start').count(), 0, "in place of Start")
  const copy = here.getByRole('button', { name: 'Copy link' })
  assert.match((await copy.getAttribute('class')) ?? '', /cream/, 'white')
  assert.equal(await copy.locator('[data-icon="copy"]').count(), 1, 'its copy icon')
  await shot(page, 'passkeys-dont-work')
  await copy.click()
  await here.getByRole('button', { name: 'Copied' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), page.url(), "the page's address")
  await context.close()
})

test("a passkey met at Start whose seed was never verified: This passkey has never been verified; Continue to verification goes on to Get verified; Delete passkey tells the browser it's gone, forgets this device, and goes back to Start", async () => {
  const p = await phone()
  await p.page.goto(APP)
  await imNew(p)
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  // Another visit: the passkey met at Start, not made in it.
  await p.page.goto(APP)
  await p.page.evaluate(() => void ((PublicKeyCredential as unknown as Record<string, unknown>).signalUnknownCredential = async (o: unknown) => void ((globalThis as { signalled?: unknown }).signalled = o)))
  await button(p.page, 'Start').click()
  const never = p.page.getByRole('region', { name: 'This passkey has never been verified' })
  await never.getByText('Verified with another passkey? Delete this one.', { exact: true }).waitFor({ timeout: 60_000 })
  assert.deepEqual(await never.getByRole('button').evaluateAll((b) => b.map((x) => [x.textContent, x.className])), [['Continue to verification', 'cream'], ['Delete passkey', 'danger solid']])
  await shot(p.page, 'never-verified')
  await laptopShot(p.page, 'laptop-never-verified')
  await never.getByRole('button', { name: 'Continue to verification' }).click()
  await p.page.getByRole('heading', { name: 'Get verified' }).waitFor({ timeout: 60_000 })
  // Again, and Delete passkey.
  await p.page.goto(APP)
  await p.page.evaluate(() => void ((PublicKeyCredential as unknown as Record<string, unknown>).signalUnknownCredential = async (o: unknown) => void ((globalThis as { signalled?: unknown }).signalled = o)))
  const id = JSON.parse((await kept(p.page))['forest.passkeys']!)[0] as string
  await button(p.page, 'Start').click()
  await never.getByRole('button', { name: 'Delete passkey' }).click()
  await button(p.page, 'Start').waitFor({ timeout: 60_000 })
  assert.deepEqual(await p.page.evaluate(() => (globalThis as { signalled?: unknown }).signalled), { rpId: 'app.forest.foundation', credentialId: id }, 'the browser told it is gone')
  assert.deepEqual(Object.keys(await kept(p.page)), [], 'this device forgotten, the passkey with it')
  await p.context.close()
})

test("Add a backup: the first passkey's manager named, Not in Apple Passwords; a backup made by the same maker dropped, and the yellow note; one made elsewhere added, and on to Your first profiles", async () => {
  const p = await phone()
  // Every passkey this browser makes says Apple made it, while the test says so: the AAGUID in its authenticator data.
  await p.context.addInitScript(() => {
    const own = AuthenticatorAttestationResponse.prototype.getAuthenticatorData
    AuthenticatorAttestationResponse.prototype.getAuthenticatorData = function () {
      const data = new Uint8Array(own.call(this))
      if ((globalThis as { maker?: string }).maker === 'none') return data.buffer
      const apple = 'fbfc3007154e4ecc8c0b6e020557d7bd'.match(/../g)!.map((h) => parseInt(h, 16))
      data.set(apple, 37)
      return data.buffer
    }
  })
  await newPerson(p)
  await button(p.page, 'Continue').click()
  await p.page.getByRole('heading', { name: 'Add a backup' }).waitFor({ timeout: 60_000 })
  await p.page.getByText('Not in Apple Passwords', { exact: true }).waitFor()
  // A second authenticator, a security key, which says Apple made it too: dropped, and the note.
  await p.cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: { protocol: 'ctap2', ctap2Version: 'ctap2_1', transport: 'usb', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true },
  })
  const signalled: unknown[] = []
  await p.page.exposeFunction('signalledTest', (o: unknown) => void signalled.push(o))
  await p.page.evaluate(() => void ((PublicKeyCredential as unknown as Record<string, unknown>).signalUnknownCredential = async (o: unknown) => (globalThis as unknown as { signalledTest: (o: unknown) => void }).signalledTest(o)))
  await button(p.page, 'Add a backup passkey').click()
  const note = p.page.locator('.notice', { hasText: 'That one is in Apple Passwords too. Save it somewhere else.' })
  await note.waitFor({ timeout: 60_000 })
  assert.equal(await note.evaluate((n) => n.nextElementSibling?.classList.contains('vcards')), true, 'above the cards')
  assert.equal(signalled.length, 1, 'the browser asked to drop it')
  assert.equal((await backupsOn(JSON.parse((await kept(p.page))['forest.folder']!).address)).length, 0, 'nothing written')
  await shot(p.page, 'backup-same-maker')
  // One made by another maker: added, and on.
  await p.page.evaluate(() => void ((globalThis as { maker?: string }).maker = 'none'))
  await button(p.page, 'Add a backup passkey').click()
  await p.page.getByRole('heading', { name: 'Your first profiles' }).waitFor({ timeout: 60_000 })
  assert.equal((await backupsOn(JSON.parse((await kept(p.page))['forest.folder']!).address)).length, 1, 'a backup/<id> in the Profiles folder')
  await p.context.close()
})

test("Report, from someone else's profile: its ··· with Share profile and Report; Report's sheet: Warn others, a report from the person's profile on the other side; Illegal content, an email to Forest's host naming the profile's page on the index", async () => {
  const { page } = first
  await page.goto(APP)
  await homeTitle(page).waitFor()
  await page.evaluate((address) => history.replaceState({ address }, '', '/them'), buyerAt)
  await page.reload()
  await page.getByText('Not yours', { exact: true }).waitFor({ timeout: 60_000 })
  await button(page, 'More').click()
  assert.deepEqual(await page.getByRole('menu').getByRole('menuitem').allTextContents(), ['Share profile', 'Report'])
  await page.getByRole('menuitem', { name: 'Report' }).click()
  const report = page.getByRole('dialog', { name: 'Report' })
  await report.getByRole('heading', { name: 'Report' }).waitFor()
  assert.deepEqual(await report.locator('.row').evaluateAll((r) => r.map((x) => [[...x.querySelectorAll('.two > *')].map((e) => e.textContent), x.querySelector(':scope > svg')?.getAttribute('data-icon')])), [
    [['Warn others', 'People will see it on this profile'], 'caret-right'],
    [['Illegal content', "Tell Forest's host by email"], 'arrow-up-right'],
  ])
  const mail = new URL((await report.getByRole('link', { name: /Illegal content/ }).getAttribute('href'))!)
  assert.deepEqual([mail.protocol + mail.pathname, mail.searchParams.get('subject'), mail.searchParams.get('body')], ['mailto:support@forest.foundation', 'Illegal content', `${services.index}/profiles/${buyerAt}`])
  await shot(page, 'report')
  await report.getByRole('button', { name: /Warn others/ }).click()
  await page.getByRole('group', { name: 'Kind' }).getByRole('button', { name: 'Report', pressed: true }).waitFor({ timeout: 30_000 })
  await button(page, 'Close').click()
  await page.getByText('Not yours', { exact: true }).waitFor()
  await page.goto(APP)
})

test('nothing the app did was refused by the CSP', () => {
  assert.deepEqual(refused, [])
})
