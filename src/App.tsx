// The screens, and the way between them. Start, until a person is verified here; then a person with
// no profile yet makes their first, and once it is made, Use Forest from your AI; then Profiles,
// Inbox and Settings, and from them New profile, a profile, its reviews, a review received, a post,
// Review someone, a thread, a new message, the ID check, an AI app, or Connect an AI. Every setup
// step has a back: Get verified to Start, Your first profile to Profiles.
// Each screen the person can come back to has its own path, so a reload opens on it and the phone's
// back goes back; what a screen is about (a profile's address, a thread, an entry being edited, the
// market picked on New profile) is kept in the page's history, never in its path, which a host's
// logs would keep. A Share
// link's address arrives in its query: it is moved into the history at once, and waits there through
// Start and the verification when no one is verified here yet. So does an AI app's login, the
// connect page's connector and request: through Start, the verification and the first profile,
// then back to the connect page, Use Forest from your AI left out. A login the page can't take (not
// this app's connector, or run out) says so at once, before Start.

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { passkey as inUse, profiles } from './device.ts'
import type { Posted } from './flows/posts.ts'
import type { Entered } from './flows/start.ts'
import { type Step, choose, stepOf } from './flows/verify.ts'
import { useProfiles } from './hooks.ts'
import type { Passkey } from './passkey.ts'
import { AiApp } from './screens/AiApp.tsx'
import { Back } from './screens/Back.tsx'
import { Connect, blocked } from './screens/Connect.tsx'
import { ConnectAi } from './screens/ConnectAi.tsx'
import { Inbox } from './screens/Inbox.tsx'
import { Message } from './screens/Message.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Post } from './screens/Post.tsx'
import { Profile } from './screens/Profile.tsx'
import { Profiles } from './screens/Profiles.tsx'
import { Received } from './screens/Received.tsx'
import { Review } from './screens/Review.tsx'
import { Reviews } from './screens/Reviews.tsx'
import { Settings } from './screens/Settings.tsx'
import { Start } from './screens/Start.tsx'
import { Thread } from './screens/Thread.tsx'
import { UseAi } from './screens/UseAi.tsx'
import { Verify } from './screens/Verify.tsx'
import type { Place } from './ui.tsx'

type Screen =
  | { at: 'start' }
  | { at: 'verify'; passkey: Passkey | null; id: string; step: Step }
  | { at: 'profiles' }
  | { at: 'new'; market?: string }
  | { at: 'profile'; address: string }
  | { at: 'reviews'; address: string }
  | { at: 'received'; address: string; entry: string }
  | { at: 'post'; address: string; edit?: Posted }
  | { at: 'review'; address: string; subject?: string; edit?: Posted; report?: boolean }
  | { at: 'inbox'; only?: string }
  | { at: 'thread'; mine: string; them: string }
  | { at: 'message'; to?: string }
  | { at: 'settings' }
  | { at: 'connect'; connector: string; request: string }
  | { at: 'connect-ai' }
  | { at: 'ai'; address: string }
  | { at: 'use-ai' }
  | { at: 'back' }

const PATHS: Partial<Record<Screen['at'], string>> = {
  verify: '/id',
  new: '/new',
  profile: '/profile',
  reviews: '/reviews',
  received: '/received',
  post: '/post',
  review: '/review',
  inbox: '/inbox',
  thread: '/thread',
  message: '/message',
  settings: '/settings',
  connect: '/connect',
  'connect-ai': '/connect-ai',
  ai: '/ai',
}

/** What the page's history keeps of a screen: what it is about, never in the path. */
type Kept = { address?: string; entry?: string; edit?: Posted; subject?: string; report?: boolean; only?: string; mine?: string; them?: string; to?: string; market?: string; connector?: string; request?: string; pushed?: boolean }

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
  return { at: 'verify', passkey: null, id, step: stepOf(id) }
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
    case '/inbox':
    case '/messages':
      return { at: 'inbox', ...(isText(now.only) && { only: now.only }) }
    case '/message':
      return { at: 'message', ...(isText(now.to) && { to: now.to }) }
  }
  if (path === '/profile' && isText(now.address)) return { at: 'profile', address: now.address }
  if (path === '/reviews' && isText(now.address)) return { at: 'reviews', address: now.address }
  if (path === '/received' && isText(now.address) && isText(now.entry)) return { at: 'received', address: now.address, entry: now.entry }
  if (path === '/post' && isText(now.address)) return { at: 'post', address: now.address, ...(now.edit && { edit: now.edit }) }
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
    case 'reviews':
      return { address: to.address }
    case 'received':
      return { address: to.address, entry: to.entry }
    case 'post':
      return { address: to.address, ...(to.edit && { edit: to.edit }) }
    case 'review':
      return { address: to.address, ...(to.edit && { edit: to.edit }), ...(to.subject && { subject: to.subject }), ...(to.report && { report: true }) }
    case 'inbox':
      return to.only ? { only: to.only } : {}
    case 'thread':
      return { mine: to.mine, them: to.them }
    case 'message':
      return to.to ? { to: to.to } : {}
    case 'connect':
      return { connector: to.connector, request: to.request }
    case 'ai':
      return { address: to.address }
    default:
      return {}
  }
}

export function App() {
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
  /** A profile made on New profile: back to the AI app's login if one waits; after the first, Use Forest from your AI; else the profile. */
  const made = (address: string, first: boolean) => {
    const w = waiting.current
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    go(first ? { at: 'use-ai' } : { at: 'profile', address })
  }
  const review = (address: string, more: { subject?: string; edit?: Posted; report?: boolean } = {}) => go({ at: 'review', address, ...more }, true)

  switch (screen.at) {
    case 'back':
      return <Back />
    case 'start':
      return <Start connecting={!!waiting.current && 'login' in waiting.current} onEntered={(e: Entered, p: Passkey) => (e.to === 'verify' ? go({ at: 'verify', passkey: p, id: p.id, step: e.step }) : inside())} />
    case 'verify':
      return <Verify passkey={screen.passkey} id={screen.id} step={screen.step} onVerified={inside} onBack={screen.passkey ? () => go({ at: 'start' }) : back} />
    case 'profiles':
      return <Profiles onOpen={(address) => go({ at: 'profile', address }, true)} onNew={() => go({ at: 'new' }, true)} go={place} />
    case 'new':
      return (
        <NewProfile
          {...(screen.market && { market: screen.market })}
          // The market's roles in place of the markets, so the profile made takes their place and back from it goes where New profile came from.
          onMarket={(market) => go({ at: 'new', market })}
          onMade={made}
          // From the roles, the markets; from Your first profile, Profiles, empty, which has New profile too.
          onBack={screen.market ? () => go({ at: 'new' }) : profiles().length > 0 ? back : () => go({ at: 'profiles' })}
        />
      )
    case 'profile':
      return (
        <Profile
          address={screen.address}
          onBack={back}
          onPost={(edit) => go({ at: 'post', address: screen.address, ...(edit && { edit }) }, true)}
          onReviews={() => go({ at: 'reviews', address: screen.address }, true)}
          onReview={() => review(screen.address)}
          onInbox={() => go({ at: 'inbox', only: screen.address }, true)}
        />
      )
    case 'reviews':
      return (
        <Reviews
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
    case 'post':
      return <For address={screen.address}>{(me) => <Post me={me} {...(screen.edit && { edit: screen.edit })} onDone={back} onBack={back} />}</For>
    case 'review':
      return (
        <For address={screen.address}>
          {(me) => <Review me={me} {...(screen.edit && { edit: screen.edit })} {...(screen.subject && { subject: screen.subject })} {...(screen.report && { report: true })} onDone={back} onBack={back} />}
        </For>
      )
    case 'inbox':
      return (
        <Inbox
          {...(screen.only && { only: screen.only, onBack: back })}
          go={place}
          onThread={(mine, them) => go({ at: 'thread', mine, them }, true)}
          onReceived={(address, entry) => go({ at: 'received', address, entry }, true)}
          onNew={() => go({ at: 'message' }, true)}
        />
      )
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
