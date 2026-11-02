// The screens, and the way between them. Start, until a person is verified here; then Profiles,
// Messages and Settings, and from them a new profile, a card, a post, a thread, a new message, or
// the ID check. Each screen the person can come back to has its own path, so a reload opens on it
// and the phone's back goes back; what a screen is about (a profile's address, a thread, an entry
// being edited) is kept in the page's history, never in its path, which a host's logs would keep.
// A Share link's address arrives in its query: it is moved into the history at once, and waits
// there through Start and the verification when no one is verified here yet.

import { useEffect, useRef, useState } from 'react'

import { passkey as inUse } from './device.ts'
import type { Posted } from './flows/posts.ts'
import type { Entered } from './flows/start.ts'
import { type Step, choose, stepOf } from './flows/verify.ts'
import { useProfiles } from './hooks.ts'
import type { Kind } from './markets.ts'
import type { Passkey } from './passkey.ts'
import { Back } from './screens/Back.tsx'
import { Card } from './screens/Card.tsx'
import { Message } from './screens/Message.tsx'
import { Messages } from './screens/Messages.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Post } from './screens/Post.tsx'
import { Profiles } from './screens/Profiles.tsx'
import { Settings } from './screens/Settings.tsx'
import { Start } from './screens/Start.tsx'
import { Thread } from './screens/Thread.tsx'
import { Verify } from './screens/Verify.tsx'
import type { Place } from './ui.tsx'

type Screen =
  | { at: 'start' }
  | { at: 'verify'; passkey: Passkey | null; id: string; step: Step }
  | { at: 'profiles' }
  | { at: 'new' }
  | { at: 'card'; address: string }
  | { at: 'post'; address: string; kinds: Kind[]; edit?: Posted; subject?: string }
  | { at: 'messages' }
  | { at: 'thread'; mine: string; them: string }
  | { at: 'message'; to: string }
  | { at: 'settings' }
  | { at: 'back' }

const PATHS: Partial<Record<Screen['at'], string>> = {
  verify: '/id',
  new: '/new',
  card: '/profile',
  post: '/post',
  messages: '/messages',
  thread: '/thread',
  message: '/message',
  settings: '/settings',
}

/** What the page's history keeps of a screen: what it is about, never in the path. */
type Kept = { address?: string; kinds?: Kind[]; edit?: Posted; subject?: string; mine?: string; them?: string; to?: string; pushed?: boolean }

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
  const to = new URLSearchParams(location.search).get('to')
  if (path === '/message' && isText(to)) history.replaceState({ ...k, to }, '', '/message')
  const id = inUse()
  if (!id) return { at: 'start' }
  if (path === '/id') return idCheck(id)
  if (path === '/new') return { at: 'new' }
  if (path === '/settings') return { at: 'settings' }
  if (path === '/messages') return { at: 'messages' }
  const now = kept()
  if (path === '/profile' && isText(now.address)) return { at: 'card', address: now.address }
  if (path === '/post' && isText(now.address) && Array.isArray(now.kinds)) return { at: 'post', address: now.address, kinds: now.kinds, ...(now.edit && { edit: now.edit }), ...(isText(now.subject) && { subject: now.subject }) }
  if (path === '/thread' && isText(now.mine) && isText(now.them)) return { at: 'thread', mine: now.mine, them: now.them }
  if (path === '/message' && isText(now.to)) return { at: 'message', to: now.to }
  return { at: 'profiles' }
}

/** What a screen keeps in the history. */
function keptOf(to: Screen): Kept {
  switch (to.at) {
    case 'card':
      return { address: to.address }
    case 'post':
      return { address: to.address, kinds: to.kinds, ...(to.edit && { edit: to.edit }), ...(to.subject && { subject: to.subject }) }
    case 'thread':
      return { mine: to.mine, them: to.them }
    case 'message':
      return { to: to.to }
    default:
      return {}
  }
}

export function App() {
  const [screen, setScreen] = useState<Screen>(here)
  // The Share link's address, while Start and the verification come first.
  const waiting = useRef<string | null>(screen.at === 'start' && isText(kept().to) ? kept().to! : null)
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
  /** In, past Start and the verification: the Share link's message if one waits, else Profiles. */
  const inside = () => {
    const to = waiting.current
    waiting.current = null
    go(to ? { at: 'message', to } : { at: 'profiles' })
  }

  switch (screen.at) {
    case 'back':
      return <Back />
    case 'start':
      return <Start onEntered={(e: Entered, p: Passkey) => (e.to === 'verify' ? go({ at: 'verify', passkey: p, id: p.id, step: e.step }) : inside())} />
    case 'verify':
      return <Verify passkey={screen.passkey} id={screen.id} step={screen.step} onVerified={inside} {...(!screen.passkey && { onBack: back })} />
    case 'profiles':
      return <Profiles onOpen={(address) => go({ at: 'card', address }, true)} onNew={() => go({ at: 'new' }, true)} go={place} />
    case 'new':
      return <NewProfile onMade={(address) => go({ at: 'card', address })} onBack={back} />
    case 'card':
      return <Card address={screen.address} onBack={back} onPost={(kinds, edit) => go({ at: 'post', address: screen.address, kinds, ...(edit && { edit }) }, true)} />
    case 'post':
      return <PostFor screen={screen} onDone={back} onBack={back} />
    case 'messages':
      return <Messages go={place} onThread={(mine, them) => go({ at: 'thread', mine, them }, true)} />
    case 'thread':
      return <Thread mine={screen.mine} them={screen.them} onBack={back} onPost={(mine, them) => go({ at: 'post', address: mine, kinds: ['review', 'vouch', 'report'], subject: them }, true)} />
    case 'message':
      return <Message to={screen.to} onSent={(mine, them) => go({ at: 'thread', mine, them })} onBack={back} />
    case 'settings':
      return <Settings go={place} onForgot={() => go({ at: 'start' })} onIdCheck={() => go(idCheck(inUse()!), true)} />
  }
}

/** Post, as the person's profile at the screen's address. */
function PostFor({ screen, onDone, onBack }: { screen: Extract<Screen, { at: 'post' }>; onDone: () => void; onBack: () => void }) {
  const me = useProfiles().find((p) => p.address === screen.address)
  if (!me) return null
  return <Post me={me} kinds={screen.kinds} {...(screen.edit && { edit: screen.edit })} {...(screen.subject && { subject: screen.subject })} onDone={onDone} onBack={onBack} />
}
