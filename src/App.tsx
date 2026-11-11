// The screens, and the way between them. Start, until a person is verified here: a passkey that
// opens a seed with no stamp goes to Get verified, with a check that didn't pass said there; Start's
// No passkey found opens Your 24 words, which opens a seed from its words, and the person is in as
// from Start (back to No passkey found). Then a person with no profile yet makes their first, and
// once it is made, or put off with Later, Connect your AI, with Skip; then the three places, Home,
// Notifications and You, and from them New profile, every profile's messages (the round button at
// the top of Notifications), what a market outgrew, to update, a profile, its messages, its Reviews
// and a review received, someone else's profile (a tap on another profile wherever it shows; one
// of the person's own opens as theirs), a listing, Review someone, a thread, a new message, Get verified (a check
// to add, the ID's sheet up for the ID), Passkeys, Add a passkey and Your 24 words, Your AI, an AI
// app and Connect your AI, or About Forest. Back wherever there is somewhere to go back to: Get
// verified to Start, Your 24 words to No passkey found. A check runs at Stripe and Didit in this tab:
// back from Stripe's page (/paid) or Didit's (/back), the page opens on Get verified, in setup too,
// which goes on by itself. A step done (a passkey made, verified, a
// profile made) can't be undone by back: Your first profile has Later, Connect your AI Skip. On a
// laptop, every setup screen sits beside the deep green panel (screens/Setup.tsx); every screen past
// setup sits in the frame (frame.tsx): on a phone, the places' tabs at the bottom of each place; on a
// laptop, the sidebar beside every one, and Messages and a thread side by side, in two panes
// (screens/Panes.tsx).
// Each screen the person can come back to has its own path, so a reload opens on it and the phone's
// back goes back; what a screen is about (a profile's address and its tab, a thread, an entry being
// edited, whose messages, the market picked on New profile, Connect your AI in setup) is kept in the
// page's history, never in its path, which a host's logs would keep. Your 24 words, once Passkeys
// had the passkey give them, are kept in the page's memory alone, never its history, while their
// screen is open; reloaded there, the page opens Passkeys. A Share link's address arrives
// in its query: it is moved into the history at once, and waits there through
// Start and the verification when no one is verified here yet. So does an AI app's login, the
// connect page's connector and request: through Start, the verification and the first profile,
// then back to the connect page, Save a passkey on this device? and Connect your AI left out; while
// the page goes to Stripe or Didit and back, what waits is kept for this tab (device.ts,
// `keepWaiting`). A login the page can't take (not this app's connector, or run out) says so at once,
// before Start.
// Above any screen, once a newer version is live, one quiet line says so, with Reload (version.ts).

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { type Check, passkey as inUse, keepWaiting, profiles, takeWaiting, under } from './device.ts'
import type { Posted } from './flows/entries.ts'
import { Frame, type FrameGo, type On, type Place, useWide } from './frame.tsx'
import { RETURNS, PATHS as SCREEN_PATHS } from './paths.ts'
import type { Entered } from './flows/start.ts'
import { NotPassed, type Step, choose, stepOf } from './flows/verify.ts'
import { useNewVersion, useProfiles } from './hooks.ts'
import { opened } from './opened.ts'
import { About } from './screens/About.tsx'
import { AiApp } from './screens/AiApp.tsx'
import { AiApps } from './screens/AiApps.tsx'
import { AddPasskey } from './screens/AddPasskey.tsx'
import { Connect, blocked } from './screens/Connect.tsx'
import { ConnectAi } from './screens/ConnectAi.tsx'
import { Home } from './screens/Home.tsx'
import { Message } from './screens/Message.tsx'
import { Messages } from './screens/Messages.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Panes } from './screens/Panes.tsx'
import { Passkeys } from './screens/Passkeys.tsx'
import { Notifications } from './screens/Notifications.tsx'
import { ImportWords } from './screens/ImportWords.tsx'
import { Listing } from './screens/Listing.tsx'
import { Profile, type Tab } from './screens/Profile.tsx'
import { Received } from './screens/Received.tsx'
import { Reviews } from './screens/Reviews.tsx'
import { Review } from './screens/Review.tsx'
import { Them } from './screens/Them.tsx'
import { Setup } from './screens/Setup.tsx'
import { Start } from './screens/Start.tsx'
import { Thread } from './screens/Thread.tsx'
import { Verify } from './screens/Verify.tsx'
import { Words } from './screens/Words.tsx'
import { You } from './screens/You.tsx'
import { NewVersion } from './ui.tsx'

type Screen =
  | { at: 'start'; noPasskey?: boolean }
  | { at: 'import-words' }
  | { at: 'verify'; setup: boolean; id: string; step: Step; failed?: NotPassed; from?: Back }
  | { at: 'home' }
  | { at: 'new'; market?: string }
  | { at: 'profile'; address: string; tab?: Tab }
  | { at: 'reviews'; address: string }
  | { at: 'received'; address: string; entry: string }
  | { at: 'them'; address: string }
  | { at: 'listing'; address: string; edit?: Posted }
  | { at: 'review'; address: string; subject?: string; edit?: Posted; report?: boolean }
  | { at: 'notifications' }
  | { at: 'messages'; only?: string }
  | { at: 'thread'; mine: string; them: string; only?: string }
  | { at: 'message'; to?: string }
  | { at: 'you' }
  | { at: 'connect'; connector: string; request: string }
  | { at: 'connect-ai'; setup?: boolean }
  | { at: 'ai-apps' }
  | { at: 'ai'; address: string }
  | { at: 'passkeys' }
  | { at: 'add-passkey' }
  | { at: 'words' }
  | { at: 'about' }

const PATHS: Partial<Record<Screen['at'], string>> = SCREEN_PATHS

/** What the page's history keeps of a screen: what it is about, never in the path. */
type Kept = { address?: string; tab?: Tab; entry?: string; edit?: Posted; subject?: string; report?: boolean; only?: string; mine?: string; them?: string; to?: string; market?: string; connector?: string; request?: string; setup?: boolean; pushed?: boolean }

/** An AI app's login, from the connector: what the connect page is about. */
type Login = { connector: string; request: string }

/** The login the page's history holds, or null. */
const loginKept = (): Login | null => {
  const k = kept()
  return isText(k.connector) && isText(k.request) ? { connector: k.connector, request: k.request } : null
}

/** What waits while Start, the verification and a first profile come first: a Share link's address, or an AI app's login. */
type Waiting = { to: string } | { login: Login }

/** Where the page was opened back from: Stripe's page, paid or not, or Didit's, the check done. */
type Back = 'paid' | 'checked'


const kept = (): Kept => (history.state as Kept | null) ?? {}
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** What waited as this tab's last page closed, the check taken to Stripe or Didit: taken back once, as the page opens. */
const waitedThrough: Waiting | null = (() => {
  const w = takeWaiting() as { to?: unknown; login?: { connector?: unknown; request?: unknown } } | null
  if (isText(w?.to)) return { to: w.to }
  if (isText(w?.login?.connector) && isText(w.login.request)) return { login: { connector: w.login.connector, request: w.login.request } }
  return null
})()

/** A check to add, for the person verified here: Get verified, where it stands, from the device; for the ID with nothing under way, its sheet up, its consent screen. */
function checkOf(id: string, check: Check): Screen {
  if (check === 'id' && stepOf(id).at === 'choose') choose(id, 'id')
  return { at: 'verify', setup: false, id, step: stepOf(id) }
}

/** The screen the page's path and history name; Start until someone is verified here. */
function here(): Screen {
  const path = location.pathname
  const k = kept()
  // A Share link: its address out of the path, into the history.
  const query = new URLSearchParams(location.search)
  const to = query.get('to')
  if (path === '/message' && isText(to)) history.replaceState({ ...k, to }, '', '/message')
  // An AI app's login: its connector and request out of the path, into the history.
  const [connector, request] = [query.get('connector'), query.get('request')]
  if (path === '/connect' && isText(connector) && isText(request)) history.replaceState({ ...k, connector, request }, '', '/connect')
  const id = inUse()
  const login = path === '/connect' ? loginKept() : null
  if (login && (blocked(login.connector, login.request) || (id && profiles().length > 0))) return { at: 'connect', ...login }
  // Back from Stripe or Didit, a check under way: Get verified, which goes on by itself, in setup too.
  const from: Back | null = path === RETURNS.paid ? 'paid' : path === RETURNS.checked ? 'checked' : null
  const u = under()
  if (from && u && (!id || u.passkey === id)) return { at: 'verify', setup: !id, id: u.passkey, step: stepOf(u.passkey), from }
  if (!id) return { at: 'start' }
  if (login) return { at: 'new' }
  const now = kept()
  switch (path) {
    case '/id':
      return checkOf(id, 'id')
    case '/new':
      return { at: 'new', ...(isText(now.market) && { market: now.market }) }
    case '/you':
      return { at: 'you' }
    case '/notifications':
      return { at: 'notifications' }
    // A profile's messages, or with none named every profile's.
    case '/messages':
      return { at: 'messages', ...(isText(now.only) && { only: now.only }) }
    case '/message':
      return { at: 'message', ...(isText(now.to) && { to: now.to }) }
    case '/passkeys':
      return { at: 'passkeys' }
    case '/passkey':
      return { at: 'add-passkey' }
    // The words were in the page's memory alone: reloaded, Passkeys, to ask for them again.
    case '/words':
      return { at: 'passkeys' }
    case '/ai-apps':
      return { at: 'ai-apps' }
    case '/about':
      return { at: 'about' }
  }
  if (path === '/profile' && isText(now.address)) return { at: 'profile', address: now.address, ...(now.tab === 'written' && { tab: 'written' }) }
  if (path === '/reviews' && isText(now.address)) return { at: 'reviews', address: now.address }
  if (path === '/received' && isText(now.address) && isText(now.entry)) return { at: 'received', address: now.address, entry: now.entry }
  if (path === '/them' && isText(now.address)) return { at: 'them', address: now.address }
  if (path === '/listing' && isText(now.address)) return { at: 'listing', address: now.address, ...(now.edit && { edit: now.edit }) }
  if (path === '/review' && isText(now.address)) return { at: 'review', address: now.address, ...(now.edit && { edit: now.edit }), ...(isText(now.subject) && { subject: now.subject }), ...(now.report && { report: true }) }
  if (path === '/thread' && isText(now.mine) && isText(now.them)) return { at: 'thread', mine: now.mine, them: now.them, ...(isText(now.only) && { only: now.only }) }
  if (path === '/ai' && isText(now.address)) return { at: 'ai', address: now.address }
  if (path === '/connect-ai') return { at: 'connect-ai', ...(now.setup && { setup: true }) }
  return { at: 'home' }
}

/** What a screen keeps in the history. */
function keptOf(to: Screen): Kept {
  switch (to.at) {
    case 'new':
      return to.market ? { market: to.market } : {}
    case 'profile':
      return { address: to.address, ...(to.tab === 'written' && { tab: 'written' }) }
    case 'reviews':
      return { address: to.address }
    case 'received':
      return { address: to.address, entry: to.entry }
    case 'them':
      return { address: to.address }
    case 'listing':
      return { address: to.address, ...(to.edit && { edit: to.edit }) }
    case 'review':
      return { address: to.address, ...(to.edit && { edit: to.edit }), ...(to.subject && { subject: to.subject }), ...(to.report && { report: true }) }
    case 'messages':
      return to.only ? { only: to.only } : {}
    case 'thread':
      return { mine: to.mine, them: to.them, ...(to.only && { only: to.only }) }
    case 'message':
      return to.to ? { to: to.to } : {}
    case 'connect':
      return { connector: to.connector, request: to.request }
    case 'ai':
      return { address: to.address }
    case 'connect-ai':
      return to.setup ? { setup: true } : {}
    default:
      return {}
  }
}

/** The app: the screen, and above it, once a newer version is live, one quiet line saying so, with Reload. */
export function App() {
  const newer = useNewVersion()
  return (
    <>
      {newer && <NewVersion />}
      <Screens />
    </>
  )
}

function Screens() {
  const [screen, setScreen] = useState<Screen>(here)
  const wide = useWide()
  // Your 24 words, while their screen is open: in the page's memory alone, dropped as it closes.
  const words = useRef<string[] | null>(null)
  if (screen.at !== 'words') words.current = null
  // The Share link's address, or the AI app's login, while Start, the verification and a first profile come first.
  const waiting = useRef<Waiting | null>(waitingAt(screen) ?? waitedThrough)
  useEffect(() => {
    const popped = () => setScreen(here())
    // The page closing with something waiting (to Stripe or Didit, in this tab): kept for the page that opens next.
    const closing = () => waiting.current && keepWaiting(waiting.current)
    addEventListener('popstate', popped)
    addEventListener('pagehide', closing)
    return () => {
      removeEventListener('popstate', popped)
      removeEventListener('pagehide', closing)
    }
  }, [])
  // A path this screen does not have (Start's, or one from before Forget) is put right.
  useEffect(() => {
    const path = PATHS[screen.at] ?? '/'
    if (location.pathname !== path) history.replaceState(kept(), '', path)
  }, [screen.at])

  /** To `to`, its path pushed so back comes back here, or put in place of this one's, which back then leaves as it would have. */
  const go = (to: Screen, push = false) => {
    const path = PATHS[to.at] ?? '/'
    const pushed = push || kept().pushed === true
    const state = { ...keptOf(to), pushed }
    if (push) history.pushState(state, '', path)
    else history.replaceState(state, '', path)
    setScreen(to)
  }
  const back = () => (kept().pushed ? history.back() : go({ at: 'home' }))
  const place = (to: Place) => go({ at: to })
  /** In, past Start and the verification: the AI app's login if one waits, once there is a profile to tick; the Share link's message if one waits; a first profile to make; else Home. */
  const inside = () => {
    const w = waiting.current
    if (w && 'login' in w && profiles().length === 0) return go({ at: 'new' })
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    go(w ? { at: 'message', to: w.to } : profiles().length === 0 ? { at: 'new' } : { at: 'home' })
  }
  /** A profile made on New profile: back to the AI app's login if one waits; after the first, Connect your AI; else the profile. */
  const made = (address: string, first: boolean) => {
    const w = waiting.current
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    go(first ? { at: 'connect-ai', setup: true } : { at: 'profile', address })
  }
  const connecting = () => !!waiting.current && 'login' in waiting.current
  /** Past Start: not verified, to the verification, saying why when a check didn't pass; else in. */
  const entered = (e: Entered, id: string) => {
    if (e.to === 'verify') return go({ at: 'verify', setup: true, id, step: e.step, ...(e.failed && { failed: e.failed }) })
    inside()
  }
  const review = (address: string, more: { subject?: string; edit?: Posted; report?: boolean } = {}) => go({ at: 'review', address, ...more }, true)
  /** Another profile, tapped wherever it shows: one of the person's own opens as theirs; anyone else's as someone else's. */
  const who = (address: string) => go(profiles().some((p) => p.address === address) ? { at: 'profile', address } : { at: 'them', address }, true)
  /** A message to someone: the conversation with them, when one is open in this page; else a new message to them. */
  const messageTo = (to: string) => {
    const t = opened()?.threads.find((x) => x.them === to)
    go(t ? { at: 'thread', mine: t.mine, them: to } : { at: 'message', to }, true)
  }
  /** A check to add, from You or Home: Get verified, the ID's sheet up for the ID. */
  const addCheck = (check: Check) => go(checkOf(inUse()!, check), true)
  // Where the frame's buttons go: a place in place of this screen, as its tabs do; the rest pushed, as from a card.
  const frameGo: FrameGo = {
    place,
    messages: () => go({ at: 'messages' }, true),
    profile: (address) => go({ at: 'profile', address }, true),
    newProfile: () => go({ at: 'new' }, true),
  }
  // The screen; in setup, on a laptop, the deep green panel beside it; past setup, the frame around it.
  const on = onOf(screen)
  const shown = view()
  if (!on) return screen.at === 'start' || screen.at === 'connect' ? shown : <Setup>{shown}</Setup>
  return (
    <Frame on={on} go={frameGo} {...(isPlace(screen.at) && { place: screen.at })} {...(screen.at === 'messages' && { tab: 'notifications' as const })}>
      {shown}
    </Frame>
  )

  function view() {
    switch (screen.at) {
      case 'start':
        return <Start connecting={connecting()} {...(screen.noPasskey && { noPasskey: true })} onEntered={entered} onWords={() => go({ at: 'import-words' })} />
      case 'import-words':
        return <ImportWords onEntered={entered} onBack={() => go({ at: 'start', noPasskey: true })} />
      case 'verify':
        return (
          <Verify
            setup={screen.setup}
            id={screen.id}
            step={screen.step}
            {...(screen.failed && { failed: screen.failed })}
            {...(screen.from && { from: screen.from })}
            onVerified={inside}
            onIn={(e) => entered(e, screen.id)}
            onBack={screen.setup ? () => go({ at: 'start' }) : back}
          />
        )
      case 'home':
        return <Home onOpen={(address) => go({ at: 'profile', address }, true)} onNew={() => go({ at: 'new' }, true)} onCheck={addCheck} />
      case 'new':
        return (
          <NewProfile
            {...(screen.market && { market: screen.market })}
            // A market's roles on a sheet, the market kept in the history so a reload keeps it open.
            onMarket={(market) => go(market ? { at: 'new', market } : { at: 'new' })}
            onMade={made}
            // A role the person has: its profile, so back comes back to New profile.
            onOpen={(address) => go({ at: 'profile', address }, true)}
            onBack={back}
            onLater={() => go({ at: 'connect-ai', setup: true })}
          />
        )
      case 'profile':
        return (
          <Profile
            address={screen.address}
            tab={screen.tab ?? 'listings'}
            // A tab in place of the other, so back leaves the profile.
            onTab={(tab) => go({ at: 'profile', address: screen.address, ...(tab === 'written' && { tab }) })}
            onBack={back}
            onListing={(edit) => go({ at: 'listing', address: screen.address, ...(edit && { edit }) }, true)}
            onReviews={() => go({ at: 'reviews', address: screen.address }, true)}
            onEdit={(edit) => review(screen.address, { edit })}
            onReview={() => review(screen.address)}
            onMessages={() => go({ at: 'messages', only: screen.address }, true)}
            onWho={who}
          />
        )
      case 'reviews':
        return <Reviews address={screen.address} onBack={back} onOpen={(entry) => go({ at: 'received', address: screen.address, entry }, true)} />
      case 'received':
        return (
          <Received
            mine={screen.address}
            at={screen.entry}
            onBack={back}
            onMessage={messageTo}
            onReview={(subject) => review(screen.address, { subject })}
            onReport={(subject) => review(screen.address, { subject, report: true })}
            onWho={who}
          />
        )
      case 'them':
        return <Them key={screen.address} address={screen.address} onBack={back} onMessage={messageTo} onReview={(mine, subject) => review(mine, { subject })} onWho={who} />
      case 'listing':
        return <For address={screen.address}>{(me) => <Listing me={me} {...(screen.edit && { edit: screen.edit })} onDone={back} onBack={back} />}</For>
      case 'review':
        return (
          <For address={screen.address}>
            {(me) => <Review me={me} {...(screen.edit && { edit: screen.edit })} {...(screen.subject && { subject: screen.subject })} {...(screen.report && { report: true })} onDone={back} onBack={back} />}
          </For>
        )
      case 'notifications':
        return (
          <Notifications
            onMessages={() => go({ at: 'messages' }, true)}
            onReviews={(address) => go({ at: 'reviews', address }, true)}
            onUpdate={(address, edit) => (edit.kind === 'listing' ? go({ at: 'listing', address, edit }, true) : review(address, { edit }))}
            onWho={who}
          />
        )
      // On a phone, one at a time; on a laptop, side by side, whose kept with the one open.
      case 'messages':
      case 'thread': {
        const at = screen
        const open = at.at === 'thread' ? at : null
        const list = (
          <Messages
            {...(at.only && { only: at.only })}
            pane={wide}
            {...(open && { open: { mine: open.mine, them: open.them } })}
            // Whose, in place of the screen as it was, so back leaves Messages.
            onOnly={(only) => go({ at: 'messages', ...(only && { only }) })}
            onThread={(mine, them) => go({ at: 'thread', mine, them, ...(at.only && { only: at.only }) }, true)}
            onNew={() => go({ at: 'message' }, true)}
          />
        )
        const thread = open && <Thread key={`${open.mine} ${open.them}`} mine={open.mine} them={open.them} pane={wide} onBack={back} onReview={(mine, them) => review(mine, { subject: them })} onWho={who} />
        if (wide) return <Panes list={list} open={thread} />
        return thread || list
      }
      case 'message':
        return <Message {...(screen.to && { to: screen.to })} onSent={(mine, them) => go({ at: 'thread', mine, them })} onBack={back} />
      case 'you':
        return <You onForgot={() => go({ at: 'start' })} onCheck={addCheck} onPasskeys={() => go({ at: 'passkeys' }, true)} onAiApps={() => go({ at: 'ai-apps' }, true)} onAbout={() => go({ at: 'about' }, true)} />
      case 'passkeys':
        return (
          <Passkeys
            onBack={back}
            onAdd={() => go({ at: 'add-passkey' }, true)}
            onWords={(given) => {
              words.current = given
              go({ at: 'words' }, true)
            }}
          />
        )
      case 'ai-apps':
        return <AiApps onBack={back} onAiApp={(address) => go({ at: 'ai', address }, true)} onConnect={() => go({ at: 'connect-ai' }, true)} />
      case 'about':
        return <About onBack={back} />
      case 'connect':
        return <Connect connector={screen.connector} request={screen.request} />
      case 'connect-ai':
        return <ConnectAi setup={screen.setup === true} onBack={back} onDone={() => go({ at: 'home' })} />
      case 'ai':
        return <AiApp address={screen.address} onBack={back} />
      case 'add-passkey':
        return <AddPasskey onDone={back} onBack={back} />
      case 'words':
        return words.current ? <Words words={words.current} onDone={back} /> : null
    }
  }
}

const isPlace = (at: Screen['at']): at is Place => at === 'home' || at === 'notifications' || at === 'you'

/** What a screen past setup shows selected in the frame; null for a setup screen, which has none. */
function onOf(s: Screen): On | null {
  switch (s.at) {
    case 'home':
    case 'notifications':
    case 'you':
      return s.at
    case 'messages':
      return s.only ? { profile: s.only } : 'messages'
    case 'thread':
    case 'message':
      return 'messages'
    case 'profile':
    case 'reviews':
    case 'received':
    case 'listing':
    case 'review':
    case 'them':
      return { profile: s.address }
    case 'new':
      return profiles().length > 0 ? 'new' : null
    case 'verify':
      return s.setup ? null : 'you'
    case 'connect-ai':
      return s.setup ? null : 'you'
    case 'passkeys':
    case 'add-passkey':
    case 'words':
    case 'ai-apps':
    case 'ai':
    case 'about':
      return 'you'
    default:
      return null
  }
}

/** What waits on `screen`, as the page opens: on Start, a Share link's address or an AI app's login; on a first profile, the login. */
function waitingAt(screen: Screen): Waiting | null {
  const to = kept().to
  if (screen.at === 'start' && isText(to)) return { to }
  const login = loginKept()
  return login && (screen.at === 'start' || screen.at === 'new') ? { login } : null
}

/** A screen for the person's profile at `address`, once the device lists it. */
function For({ address, children }: { address: string; children: (me: ReturnType<typeof useProfiles>[number]) => ReactNode }) {
  const me = useProfiles().find((p) => p.address === address)
  return me ? <>{children(me)}</> : null
}
