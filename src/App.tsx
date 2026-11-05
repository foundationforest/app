// The screens, and the way between them. Start, until a person is verified here: a passkey that
// opens a seed with no stamp and nothing under way goes to New to Forest? first, then Get verified;
// one that answered from another device, letting a verified person in, to Save a passkey on this
// device?, once. Start's I have 24 words opens a seed from its words, and the person is in as from
// Start (back to Start). Then a person with no profile yet makes their first, and once it is made,
// Add a second passkey, then Use Forest from your AI; then Profiles, Notifications and Settings,
// and from them New profile, every profile's messages (the inbox at the top of Profiles and
// Notifications), what a market outgrew, to update, a profile, its messages, its Feedback, a
// review received, a listing, Review someone, a thread, a new message, the ID check, an AI app,
// Connect an AI, Add a passkey, or Your 24 words. Every setup step has a back: New to Forest? to
// Start, Get verified to New to Forest? (or Start, once a check is under way), Your first profile
// to Profiles.
// Each screen the person can come back to has its own path, so a reload opens on it and the phone's
// back goes back; what a screen is about (a profile's address, a thread, an entry being edited, the
// market picked on New profile) is kept in the page's history, never in its path, which a host's
// logs would keep. A Share
// link's address arrives in its query: it is moved into the history at once, and waits there through
// Start and the verification when no one is verified here yet. So does an AI app's login, the
// connect page's connector and request: through Start, the verification and the first profile,
// then back to the connect page, Save a passkey on this device?, Add a second passkey and Use Forest
// from your AI left out. A login the page can't take (not
// this app's connector, or run out) says so at once, before Start. Above any screen, once a newer
// version is live, one quiet line says so, with Reload (version.ts).

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { passkey as inUse, profiles } from './device.ts'
import type { Posted } from './flows/entries.ts'
import { PATHS as SCREEN_PATHS } from './paths.ts'
import type { Entered } from './flows/start.ts'
import { type Step, choose, nothingUnderWay, stepOf } from './flows/verify.ts'
import { useNewVersion, useProfiles } from './hooks.ts'
import { AiApp } from './screens/AiApp.tsx'
import { AddPasskey } from './screens/AddPasskey.tsx'
import { Back } from './screens/Back.tsx'
import { Connect, blocked } from './screens/Connect.tsx'
import { ConnectAi } from './screens/ConnectAi.tsx'
import { Message } from './screens/Message.tsx'
import { Messages } from './screens/Messages.tsx'
import { NewHere } from './screens/NewHere.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Notifications } from './screens/Notifications.tsx'
import { ImportWords } from './screens/ImportWords.tsx'
import { Listing } from './screens/Listing.tsx'
import { Profile } from './screens/Profile.tsx'
import { Profiles } from './screens/Profiles.tsx'
import { Received } from './screens/Received.tsx'
import { Review } from './screens/Review.tsx'
import { ProfileFeedback } from './screens/ProfileFeedback.tsx'
import { SavePasskey } from './screens/SavePasskey.tsx'
import { SecondPasskey } from './screens/SecondPasskey.tsx'
import { Settings } from './screens/Settings.tsx'
import { type How, Start } from './screens/Start.tsx'
import { Thread } from './screens/Thread.tsx'
import { UseAi } from './screens/UseAi.tsx'
import { Verify } from './screens/Verify.tsx'
import { Words } from './screens/Words.tsx'
import { NewVersion, type Place } from './ui.tsx'

type Screen =
  | { at: 'start' }
  | { at: 'import-words' }
  | { at: 'new-here'; id: string; step: Step; aaguid?: string }
  | { at: 'save-passkey' }
  | { at: 'verify'; fromStart: boolean; id: string; step: Step; aaguid?: string }
  | { at: 'profiles' }
  | { at: 'new'; market?: string }
  | { at: 'profile'; address: string }
  | { at: 'profile-feedback'; address: string }
  | { at: 'received'; address: string; entry: string }
  | { at: 'listing'; address: string; edit?: Posted }
  | { at: 'review'; address: string; subject?: string; edit?: Posted; report?: boolean }
  | { at: 'notifications' }
  | { at: 'messages'; only?: string }
  | { at: 'thread'; mine: string; them: string }
  | { at: 'message'; to?: string }
  | { at: 'settings' }
  | { at: 'connect'; connector: string; request: string }
  | { at: 'connect-ai' }
  | { at: 'ai'; address: string }
  | { at: 'use-ai' }
  | { at: 'second-passkey' }
  | { at: 'add-passkey'; offered?: boolean }
  | { at: 'words' }
  | { at: 'back' }

const PATHS: Partial<Record<Screen['at'], string>> = SCREEN_PATHS

/** What the page's history keeps of a screen: what it is about, never in the path. */
type Kept = { address?: string; entry?: string; edit?: Posted; subject?: string; report?: boolean; only?: string; mine?: string; them?: string; to?: string; market?: string; connector?: string; request?: string; offered?: boolean; pushed?: boolean }

/** An AI app's login, from the connector: what the connect page is about. */
type Login = { connector: string; request: string }

/** The login the page's history holds, or null. */
const loginKept = (): Login | null => {
  const k = kept()
  return isText(k.connector) && isText(k.request) ? { connector: k.connector, request: k.request } : null
}

/** What waits while Start, the verification and a first profile come first: a Share link's address, or an AI app's login. */
type Waiting = { to: string } | { login: Login }

const kept = (): Kept => (history.state as Kept | null) ?? {}
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** The ID check, for the person verified here: where it stands, from the device; nothing under way, its consent screen. */
function idCheck(id: string): Screen {
  if (stepOf(id).at === 'choose') choose(id, 'id')
  return { at: 'verify', fromStart: false, id, step: stepOf(id) }
}

/** The screen the page's path and history name; Start until someone is verified here. */
function here(): Screen {
  const path = location.pathname
  const k = kept()
  if (path === '/back') return { at: 'back' }
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
  if (!id) return { at: 'start' }
  if (login) return { at: 'new' }
  const now = kept()
  switch (path) {
    case '/id':
      return idCheck(id)
    case '/new':
      return { at: 'new', ...(isText(now.market) && { market: now.market }) }
    case '/settings':
      return { at: 'settings' }
    case '/notifications':
      return { at: 'notifications' }
    // A profile's messages, or with none named every profile's.
    case '/messages':
      return { at: 'messages', ...(isText(now.only) && { only: now.only }) }
    case '/message':
      return { at: 'message', ...(isText(now.to) && { to: now.to }) }
    case '/passkey':
      return { at: 'add-passkey', ...(now.offered && { offered: true }) }
    case '/words':
      return { at: 'words' }
  }
  if (path === '/profile' && isText(now.address)) return { at: 'profile', address: now.address }
  if (path === '/profile-feedback' && isText(now.address)) return { at: 'profile-feedback', address: now.address }
  if (path === '/received' && isText(now.address) && isText(now.entry)) return { at: 'received', address: now.address, entry: now.entry }
  if (path === '/listing' && isText(now.address)) return { at: 'listing', address: now.address, ...(now.edit && { edit: now.edit }) }
  if (path === '/review' && isText(now.address)) return { at: 'review', address: now.address, ...(now.edit && { edit: now.edit }), ...(isText(now.subject) && { subject: now.subject }), ...(now.report && { report: true }) }
  if (path === '/thread' && isText(now.mine) && isText(now.them)) return { at: 'thread', mine: now.mine, them: now.them }
  if (path === '/ai' && isText(now.address)) return { at: 'ai', address: now.address }
  if (path === '/connect-ai') return { at: 'connect-ai' }
  return { at: 'profiles' }
}

/** What a screen keeps in the history. */
function keptOf(to: Screen): Kept {
  switch (to.at) {
    case 'new':
      return to.market ? { market: to.market } : {}
    case 'profile':
    case 'profile-feedback':
      return { address: to.address }
    case 'received':
      return { address: to.address, entry: to.entry }
    case 'listing':
      return { address: to.address, ...(to.edit && { edit: to.edit }) }
    case 'review':
      return { address: to.address, ...(to.edit && { edit: to.edit }), ...(to.subject && { subject: to.subject }), ...(to.report && { report: true }) }
    case 'messages':
      return to.only ? { only: to.only } : {}
    case 'thread':
      return { mine: to.mine, them: to.them }
    case 'message':
      return to.to ? { to: to.to } : {}
    case 'connect':
      return { connector: to.connector, request: to.request }
    case 'ai':
      return { address: to.address }
    case 'add-passkey':
      return to.offered ? { offered: true } : {}
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
  // The Share link's address, or the AI app's login, while Start, the verification and a first profile come first.
  const waiting = useRef<Waiting | null>(waitingAt(screen))
  useEffect(() => {
    const popped = () => setScreen(here())
    addEventListener('popstate', popped)
    return () => removeEventListener('popstate', popped)
  }, [])
  // A path this screen does not have (Start's, or one from before Forget) is put right.
  useEffect(() => {
    const path = PATHS[screen.at] ?? (screen.at === 'back' ? '/back' : '/')
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
  const back = () => (kept().pushed ? history.back() : go({ at: 'profiles' }))
  const place = (to: Place) => go({ at: to })
  /** In, past Start and the verification: the AI app's login if one waits, once there is a profile to tick; the Share link's message if one waits; a first profile to make; else Profiles. */
  const inside = () => {
    const w = waiting.current
    if (w && 'login' in w && profiles().length === 0) return go({ at: 'new' })
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    go(w ? { at: 'message', to: w.to } : profiles().length === 0 ? { at: 'new' } : { at: 'profiles' })
  }
  /** A profile made on New profile: back to the AI app's login if one waits; after the first, Add a second passkey; else the profile. */
  const made = (address: string, first: boolean) => {
    const w = waiting.current
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    go(first ? { at: 'second-passkey' } : { at: 'profile', address })
  }
  const connecting = () => !!waiting.current && 'login' in waiting.current
  /**
   * Past Start: a passkey with no stamp and nothing under way, to New to Forest? (a passkey just made
   * keeps its manager's AAGUID there); else, not verified, to the verification; verified through a
   * passkey on another device, Save a passkey on this device? first, unless an AI app's login waits;
   * else in.
   */
  const entered = (e: Entered, id: string, how: How) => {
    const aaguid = how.made?.aaguid
    if (e.to === 'verify') return go(nothingUnderWay(id) ? { at: 'new-here', id, step: e.step, ...(aaguid && { aaguid }) } : { at: 'verify', fromStart: true, id, step: e.step })
    if (how.elsewhere && !connecting()) return go({ at: 'save-passkey' })
    inside()
  }
  const review = (address: string, more: { subject?: string; edit?: Posted; report?: boolean } = {}) => go({ at: 'review', address, ...more }, true)

  switch (screen.at) {
    case 'back':
      return <Back />
    case 'start':
      return <Start connecting={connecting()} onEntered={entered} onWords={() => go({ at: 'import-words' })} />
    case 'import-words':
      return <ImportWords onEntered={entered} onBack={() => go({ at: 'start' })} />
    case 'new-here': {
      const { id, step, aaguid } = screen
      return (
        <NewHere
          id={id}
          {...(aaguid && { aaguid })}
          onNew={() => go({ at: 'verify', fromStart: true, id, step, ...(aaguid && { aaguid }) })}
          onIn={(e) => (e.to === 'profiles' ? inside() : go({ at: 'verify', fromStart: true, id, step: e.step }))}
          onBack={() => go({ at: 'start' })}
        />
      )
    }
    case 'save-passkey':
      return <SavePasskey onDone={inside} />
    case 'verify': {
      const { id, aaguid } = screen
      // From Start: back to New to Forest? while nothing is under way, else to Start.
      const toStart = () => go(nothingUnderWay(id) ? { at: 'new-here', id, step: stepOf(id), ...(aaguid && { aaguid }) } : { at: 'start' })
      return <Verify fromStart={screen.fromStart} id={id} step={screen.step} onVerified={inside} onBack={screen.fromStart ? toStart : back} />
    }
    case 'profiles':
      return <Profiles onOpen={(address) => go({ at: 'profile', address }, true)} onNew={() => go({ at: 'new' }, true)} onMessages={() => go({ at: 'messages' }, true)} go={place} />
    case 'new':
      return (
        <NewProfile
          {...(screen.market && { market: screen.market })}
          // The market's roles in place of the markets, so the profile made takes their place and back from it goes where New profile came from.
          onMarket={(market) => go({ at: 'new', market })}
          onMade={made}
          // A role the person has: its profile, so back comes back to the roles.
          onOpen={(address) => go({ at: 'profile', address }, true)}
          // From the roles, the markets; from Your first profile, Profiles, empty, which has New profile too.
          onBack={screen.market ? () => go({ at: 'new' }) : profiles().length > 0 ? back : () => go({ at: 'profiles' })}
        />
      )
    case 'profile':
      return (
        <Profile
          address={screen.address}
          onBack={back}
          onListing={(edit) => go({ at: 'listing', address: screen.address, ...(edit && { edit }) }, true)}
          onFeedback={() => go({ at: 'profile-feedback', address: screen.address }, true)}
          onReview={() => review(screen.address)}
          onMessages={() => go({ at: 'messages', only: screen.address }, true)}
        />
      )
    case 'profile-feedback':
      return (
        <ProfileFeedback
          address={screen.address}
          onBack={back}
          onOpen={(entry) => go({ at: 'received', address: screen.address, entry }, true)}
          onEdit={(edit) => review(screen.address, { edit })}
          onReview={() => review(screen.address)}
        />
      )
    case 'received':
      return (
        <Received
          mine={screen.address}
          at={screen.entry}
          onBack={back}
          onMessage={(to) => go({ at: 'message', to }, true)}
          onReport={(subject) => review(screen.address, { subject, report: true })}
        />
      )
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
          go={place}
          onMessages={() => go({ at: 'messages' }, true)}
          onReceived={(address, entry) => go({ at: 'received', address, entry }, true)}
          onUpdate={(address, edit) => (edit.kind === 'listing' ? go({ at: 'listing', address, edit }, true) : review(address, { edit }))}
        />
      )
    case 'messages':
      return <Messages {...(screen.only && { only: screen.only })} onBack={back} onThread={(mine, them) => go({ at: 'thread', mine, them }, true)} onNew={() => go({ at: 'message' }, true)} />
    case 'thread':
      return <Thread mine={screen.mine} them={screen.them} onBack={back} onReview={(mine, them) => review(mine, { subject: them })} />
    case 'message':
      return <Message {...(screen.to && { to: screen.to })} onSent={(mine, them) => go({ at: 'thread', mine, them })} onBack={back} />
    case 'settings':
      return (
        <Settings
          go={place}
          onForgot={() => go({ at: 'start' })}
          onIdCheck={() => go(idCheck(inUse()!), true)}
          onConnectAi={() => go({ at: 'connect-ai' }, true)}
          onAiApp={(address) => go({ at: 'ai', address }, true)}
          onAddPasskey={() => go({ at: 'add-passkey' }, true)}
          onWords={() => go({ at: 'words' }, true)}
        />
      )
    case 'connect':
      return <Connect connector={screen.connector} request={screen.request} />
    case 'connect-ai':
      return <ConnectAi onBack={back} />
    case 'ai':
      return <AiApp address={screen.address} onBack={back} />
    case 'use-ai':
      return <UseAi onConnect={() => go({ at: 'connect-ai' }, true)} onNotNow={() => go({ at: 'profiles' })} />
    case 'second-passkey':
      return <SecondPasskey onAdd={() => go({ at: 'add-passkey', offered: true })} onNotNow={() => go({ at: 'use-ai' })} />
    case 'add-passkey':
      // From Add a second passkey: on to Use Forest from your AI, and back to the offer. From Settings: back there.
      return screen.offered ? <AddPasskey onDone={() => go({ at: 'use-ai' })} onBack={() => go({ at: 'second-passkey' })} /> : <AddPasskey onDone={back} onBack={back} />
    case 'words':
      return <Words onBack={back} />
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
