// The screens, and the way between them. Start, until a person is verified here: a passkey that
// opens a seed with no stamp goes to Get verified (a check runs there, in its box, never leaving the
// page); Start's No passkey found opens Your 24 words, which opens a seed from its words, and the
// person is in as from Start (back to No passkey found). Then, once a check is done, Continue goes on:
// Add a backup, once a device (skipped for a seed that has a backup passkey already), then Your first
// profiles, whose Continue goes on to Connect your AI, whose back goes on to Home; then the three
// places, Home, Messages and You, and from them New profile, a profile, its offers (an offer's page,
// and editing it), its messages (Messages on its chip, with Back to it), its Reviews, a review
// received and the ones it wrote (You wrote), someone else's profile (a tap on another profile
// wherever it shows; one of the person's own opens as theirs), a new listing, a review of someone, a
// thread, a message to someone, Your checks and an ID's page, Get verified (a check to add),
// Passkeys, Add a passkey and Your 24 recovery words, Your AI (an AI app opens in place) and Connect
// your AI, Email, or About Forest, with Your data, Privacy and Terms. Back wherever there is somewhere
// to go back to, to where the screen was opened from (a thread's to Messages, the offer, or a
// profile's messages): Get verified to Start, Your 24 words to No passkey found. A step done (a
// passkey made, verified, a profile made) can't be undone by back: Get verified has Continue, Your
// first profiles Continue, and Connect your AI's back goes on to Home. On a laptop, every setup screen
// after Start sits beside the Start panel (screens/Setup.tsx); Start and its screens stay on the
// strong green; every screen past setup sits in the frame (frame.tsx): on a phone, the places' tabs at
// the bottom of each place; on a laptop, the sidebar beside every one, Messages and a thread side by
// side, in two panes (screens/Panes.tsx), and an offer, its conversations and the one open, in three
// (screens/Offer.tsx). A tap into Messages (the tab, the sidebar's, a profile's messages button) opens
// them as it goes there: with no seed held, that tap asks the passkey (opening.ts).
// Each screen the person can come back to has its own path, so a reload opens on it and the phone's
// back goes back; what a screen is about (a profile's address, an offer, a thread, an entry being
// edited, whose messages, an ID's entry, setup) is kept in the page's history, never in its path,
// which a host's logs would keep. Your 24 words, once their page had the passkey give them, are kept
// in that page's memory alone, never its history, while it is open; reloaded there, it asks again. A
// message link's address arrives in its query (/message?to=<address>, an index's Message link or a
// Share link), with the listing it is written from when it names one (&listing=<listing address>):
// both are moved into the history at once, and wait there through Start and the verification when no
// one is verified here yet. /message with no address opens Messages: there is no screen to type one.
// So does an AI app's login, the connect page's connector and request: through Start, the
// verification, the backup and the first profiles, then back to the connect page, Save a passkey on
// this device? and Connect your AI left out. A login the page can't take (not this app's connector,
// or run out) says so at once, before Start.
// A link from the person's AI, after the # (links.ts), is moved into the history the same way, and
// opens its screen: a profile of theirs, or New profile with its market's sheet open; one of their
// listings' offer page; a conversation; or Give credits. Through Start and the verification it
// waits, as a message link does; one that matches nothing they have says so (screens/Nothing.tsx).
// A test account, from its words at /type-words, is in with no verification and never opens Get
// verified (test-account.ts).
// Above any screen, once a newer version is live, one quiet line says so, with Reload (version.ts).

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { askedBackup, backupAsked, passkey as inUse, profiles } from './device.ts'
import type { Posted } from './flows/entries.ts'
import { Frame, type FrameGo, type On, type Place, useWide } from './frame.tsx'
import { type Link, isLink, linkIn } from './links.ts'
import { pairOf, pairs } from './markets.ts'
import { PATHS as SCREEN_PATHS } from './paths.ts'
import type { Entered } from './flows/start.ts'
import { useNewVersion, useProfiles } from './hooks.ts'
import { opened } from './opened.ts'
import { intoMessages } from './opening.ts'
import { About } from './screens/About.tsx'
import { Backup } from './screens/Backup.tsx'
import { Framed } from './screens/Framed.tsx'
import { IdPage } from './screens/IdPage.tsx'
import { YourData } from './screens/YourData.tsx'
import { AiApps } from './screens/AiApps.tsx'
import { AddPasskey } from './screens/AddPasskey.tsx'
import { Connect, blocked } from './screens/Connect.tsx'
import { Email } from './screens/Email.tsx'
import { ConnectAi } from './screens/ConnectAi.tsx'
import { Home } from './screens/Home.tsx'
import { Message } from './screens/Message.tsx'
import { Messages } from './screens/Messages.tsx'
import { NewProfile } from './screens/NewProfile.tsx'
import { Panes } from './screens/Panes.tsx'
import { Passkeys } from './screens/Passkeys.tsx'
import { Offer } from './screens/Offer.tsx'
import { Written } from './screens/Written.tsx'
import { YourChecks } from './screens/YourChecks.tsx'
import { ImportWords } from './screens/ImportWords.tsx'
import { Listing } from './screens/Listing.tsx'
import { Profile } from './screens/Profile.tsx'
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
import { Give } from './screens/Give.tsx'
import { NOT_YOUR_LISTING, NO_CONVERSATION, NO_MARKET, Nothing } from './screens/Nothing.tsx'
import { isTestId } from './test-account.ts'
import { NewVersion } from './ui.tsx'
import { config } from './config.ts'

type Screen =
  | { at: 'start'; noPasskey?: boolean }
  | { at: 'import-words' }
  | { at: 'verify'; setup: boolean; id: string; again?: true }
  | { at: 'backup' }
  | { at: 'home' }
  | { at: 'new'; setup?: boolean; link?: string }
  | { at: 'profile'; address: string }
  | { at: 'offer'; address: string; entry: string; them?: string; link?: true }
  | { at: 'reviews'; address: string }
  | { at: 'written'; address: string }
  | { at: 'received'; address: string; entry: string }
  | { at: 'them'; address: string }
  | { at: 'listing'; address: string; edit?: Posted }
  | { at: 'review'; address: string; subject?: string; edit?: Posted; report?: boolean }
  | { at: 'messages'; only?: string; back?: true }
  | { at: 'thread'; mine: string; them: string; only?: string; link?: true }
  | { at: 'message'; to: string; listing?: string }
  | { at: 'you' }
  | { at: 'checks' }
  | { at: 'document'; path: string }
  | { at: 'connect'; connector: string; request: string }
  | { at: 'connect-ai'; setup?: boolean }
  | { at: 'ai-apps' }
  | { at: 'email' }
  | { at: 'passkeys' }
  | { at: 'add-passkey' }
  | { at: 'words'; setup?: boolean }
  | { at: 'about' }
  | { at: 'data' }
  | { at: 'privacy' }
  | { at: 'terms' }
  | { at: 'give'; folder: string }
  | { at: 'nothing'; said: string }

const PATHS: Partial<Record<Screen['at'], string>> = SCREEN_PATHS

/** What the page's history keeps of a screen: what it is about, never in the path. */
type Kept = { link?: unknown; linked?: string | true; sheet?: string; folder?: string; address?: string; entry?: string; back?: boolean; edit?: Posted; subject?: string; report?: boolean; only?: string; mine?: string; them?: string; to?: string; listing?: string; connector?: string; request?: string; setup?: boolean; again?: boolean; path?: string; pushed?: boolean }

/** An AI app's login, from the connector: what the connect page is about. */
type Login = { connector: string; request: string }

/** The login the page's history holds, or null. */
const loginKept = (): Login | null => {
  const k = kept()
  return isText(k.connector) && isText(k.request) ? { connector: k.connector, request: k.request } : null
}

/** What waits while Start, the verification and a first profile come first: a message link's address and the listing it names, or an AI app's login. */
type Waiting = { to: string; listing?: string } | { login: Login } | { link: Link }

const kept = (): Kept => (history.state as Kept | null) ?? {}
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** A check to add, for the person verified here: Get verified. */
const checkOf = (id: string): Screen => ({ at: 'verify', setup: false, id })

/** The screen a link opens, for the person in here: what it names of theirs, or why it matches nothing. */
function linkedScreen(link: Link): Screen {
  if (link.to === 'give') return { at: 'give', folder: link.folder }
  const mine = profiles().find((p) => p.label === link.label)
  if (link.to === 'profile') {
    if (mine) return { at: 'profile', address: mine.address }
    if (!pairs.some((p) => p.label === link.label)) return { at: 'nothing', said: NO_MARKET }
    return { at: 'new', link: link.label, ...(profiles().length === 0 && { setup: true }) }
  }
  if (!mine) return { at: 'nothing', said: link.to === 'listing' ? NOT_YOUR_LISTING : NO_CONVERSATION }
  if (link.to === 'listing') return { at: 'offer', address: mine.address, entry: `listing/${link.id}`, link: true }
  return { at: 'thread', mine: mine.address, them: link.them, link: true }
}

/** The screen the page's path and history name; Start until someone is verified here. */
function here(): Screen {
  const path = location.pathname
  const k = kept()
  // A link from the person's AI: out of the # into the history.
  const link = linkIn(location.hash)
  if (link) history.replaceState({ ...k, link }, '', `${path}${location.search}`)
  // A message link: its address, and the listing it names, out of the path, into the history.
  const query = new URLSearchParams(location.search)
  const [to, listing] = [query.get('to'), query.get('listing')]
  if (path === '/message' && isText(to)) history.replaceState({ ...k, to, ...(isText(listing) && { listing }) }, '', '/message')
  // An AI app's login: its connector and request out of the path, into the history.
  const [connector, request] = [query.get('connector'), query.get('request')]
  if (path === '/connect' && isText(connector) && isText(request)) history.replaceState({ ...k, connector, request }, '', '/connect')
  const id = inUse()
  const login = path === '/connect' ? loginKept() : null
  if (login && (blocked(login.connector, login.request) || (id && profiles().length > 0))) return { at: 'connect', ...login }
  if (!id) return path === '/type-words' ? { at: 'import-words' } : { at: 'start' }
  if (login) return { at: 'new', setup: true }
  if (link) {
    // What the screen keeps, at once, so it finds it as it first draws (New profile's sheet).
    const { link: _, ...rest } = kept()
    const to = linkedScreen(link)
    history.replaceState({ ...rest, ...keptOf(to) }, '')
    return to
  }
  const now = kept()
  switch (path) {
    // Get verified, from Start, after a check is done: still from Start, so Continue shows. Never a test account's.
    case '/id':
      if (isTestId(id)) return { at: 'home' }
      return now.setup ? { at: 'verify', setup: true, id, ...(now.again && { again: true }) } : checkOf(id)
    case '/backup':
      return { at: 'backup' }
    case '/new':
      return { at: 'new', ...(now.setup && { setup: true }), ...(isText(now.linked) && { link: now.linked }) }
    case '/give-credits':
      return isText(now.folder) ? { at: 'give', folder: now.folder } : { at: 'home' }
    case '/you':
      return { at: 'you' }
    case '/checks':
      return { at: 'checks' }
    // A profile's messages, with Back to it, or with none named every profile's.
    case '/messages':
      return { at: 'messages', ...(isText(now.only) && { only: now.only }), ...(now.back && { back: true }) }
    case '/message':
      return isText(now.to) ? { at: 'message', to: now.to, ...(isText(now.listing) && { listing: now.listing }) } : { at: 'messages' }
    case '/passkeys':
      return { at: 'passkeys' }
    case '/passkey':
      return { at: 'add-passkey' }
    // The words were in the page's memory alone: reloaded, their page asks for them again.
    case '/words':
      return { at: 'words', ...(now.setup && { setup: true }) }
    case '/ai-apps':
      return { at: 'ai-apps' }
    case '/email':
      return { at: 'email' }
    case '/about':
      return { at: 'about' }
    case '/data':
      return { at: 'data' }
    case '/privacy':
      return { at: 'privacy' }
    case '/terms':
      return { at: 'terms' }
  }
  if (path === '/document' && isText(now.path)) return { at: 'document', path: now.path }
  if (path === '/profile' && isText(now.address)) return { at: 'profile', address: now.address }
  if (path === '/offer' && isText(now.address) && isText(now.entry)) return { at: 'offer', address: now.address, entry: now.entry, ...(isText(now.them) && { them: now.them }), ...(now.linked && { link: true }) }
  if (path === '/reviews' && isText(now.address)) return { at: 'reviews', address: now.address }
  if (path === '/written' && isText(now.address)) return { at: 'written', address: now.address }
  if (path === '/received' && isText(now.address) && isText(now.entry)) return { at: 'received', address: now.address, entry: now.entry }
  if (path === '/them' && isText(now.address)) return { at: 'them', address: now.address }
  if (path === '/listing' && isText(now.address)) return { at: 'listing', address: now.address, ...(now.edit && { edit: now.edit }) }
  if (path === '/review' && isText(now.address)) return { at: 'review', address: now.address, ...(now.edit && { edit: now.edit }), ...(isText(now.subject) && { subject: now.subject }), ...(now.report && { report: true }) }
  if (path === '/thread' && isText(now.mine) && isText(now.them)) return { at: 'thread', mine: now.mine, them: now.them, ...(isText(now.only) && { only: now.only }), ...(now.linked && { link: true }) }
  if (path === '/connect-ai') return { at: 'connect-ai', ...(now.setup && { setup: true }) }
  return { at: 'home' }
}

/** What a screen keeps in the history. */
function keptOf(to: Screen): Kept {
  switch (to.at) {
    // From a link: its label, and its market's sheet open (NewProfile.tsx keeps `sheet`).
    case 'new':
      return { ...(to.setup && { setup: true }), ...(to.link && { linked: to.link, sheet: pairOf(to.link).market }) }
    case 'give':
      return { folder: to.folder }
    case 'words':
    case 'connect-ai':
      return to.setup ? { setup: true } : {}
    case 'verify':
      return to.setup ? { setup: true, ...(to.again && { again: true }) } : {}
    case 'document':
      return { path: to.path }
    case 'profile':
    case 'reviews':
    case 'written':
      return { address: to.address }
    case 'offer':
      return { address: to.address, entry: to.entry, ...(to.them && { them: to.them }), ...(to.link && { linked: true as const }) }
    case 'received':
      return { address: to.address, entry: to.entry }
    case 'them':
      return { address: to.address }
    case 'listing':
      return { address: to.address, ...(to.edit && { edit: to.edit }) }
    case 'review':
      return { address: to.address, ...(to.edit && { edit: to.edit }), ...(to.subject && { subject: to.subject }), ...(to.report && { report: true }) }
    case 'messages':
      return { ...(to.only && { only: to.only }), ...(to.back && { back: true }) }
    case 'thread':
      return { mine: to.mine, them: to.them, ...(to.only && { only: to.only }), ...(to.link && { linked: true as const }) }
    case 'message':
      return { to: to.to, ...(to.listing && { listing: to.listing }) }
    case 'connect':
      return { connector: to.connector, request: to.request }
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
  // The Share link's address, or the AI app's login, while Start, the verification and the first profiles come first.
  const waiting = useRef<Waiting | null>(waitingAt(screen))
  useEffect(() => {
    // Back and forward; and a link's # changed in the page already open, which is a step of its
    // own: popstate reads it first, where the browser sends one, and takes it out of the address,
    // so hashchange acts only on a # that still holds a link.
    const popped = () => setScreen(here())
    const linked = () => {
      if (linkIn(location.hash)) popped()
    }
    addEventListener('popstate', popped)
    addEventListener('hashchange', linked)
    return () => {
      removeEventListener('popstate', popped)
      removeEventListener('hashchange', linked)
    }
  }, [])
  // A path this screen does not have (Start's, or one from before Forget, or an old way back from a
  // check) is put right, with what the screen keeps.
  useEffect(() => {
    const path = PATHS[screen.at] ?? '/'
    if (location.pathname !== path) history.replaceState({ ...kept(), ...keptOf(screen) }, '', path)
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
  /** A place in place of this screen, as its tabs do; Messages opened as the tap goes there. */
  const place = (to: Place) => {
    if (to === 'messages') intoMessages()
    go({ at: to })
  }
  /** In, past Start and the verification: the AI app's login if one waits, once there is a profile to tick; a link's screen, or the message link's message, if one waits; the first profiles to make; else Home. */
  const inside = () => {
    const w = waiting.current
    if (w && 'login' in w && profiles().length === 0) return go({ at: 'new', setup: true })
    waiting.current = null
    if (w && 'login' in w) return go({ at: 'connect', ...w.login })
    if (w && 'link' in w) return go(linkedScreen(w.link))
    go(w ? { at: 'message', to: w.to, ...(w.listing && { listing: w.listing }) } : profiles().length === 0 ? { at: 'new', setup: true } : { at: 'home' })
  }
  /** Verified, from Start: Add a backup, once a device; then in. Someone checking again, whose profiles are there, goes straight in. */
  const verified = (again: boolean) => (again || backupAsked() ? inside() : go({ at: 'backup' }))
  /** Add a backup done, or put off: never offered again on this device; then in. */
  const backedUp = () => {
    askedBackup()
    inside()
  }
  /** Your first profiles' Continue: back to the AI app's login if one waits; else Connect your AI. */
  const firstDone = () => {
    const w = waiting.current
    if (w && 'login' in w) {
      waiting.current = null
      return go({ at: 'connect', ...w.login })
    }
    go({ at: 'connect-ai', setup: true })
  }
  const connecting = () => !!waiting.current && 'login' in waiting.current
  /** Past Start: not verified, to the verification; else in. */
  const entered = (e: Entered, id: string) => {
    if (e.to === 'verify') return go({ at: 'verify', setup: true, id, ...(e.again && { again: e.again }) })
    inside()
  }
  const review = (address: string, more: { subject?: string; edit?: Posted; report?: boolean } = {}) => go({ at: 'review', address, ...more }, true)
  /** Another profile, tapped wherever it shows: one of the person's own opens as theirs; anyone else's as someone else's. */
  const who = (address: string) => go(profiles().some((p) => p.address === address) ? { at: 'profile', address } : { at: 'them', address }, true)
  /** A message to someone: the conversation with them, when one is open in this page; else the writing screen, to them. */
  const messageTo = (to: string) => {
    const t = opened()?.threads.find((x) => x.them === to)
    go(t ? { at: 'thread', mine: t.mine, them: to } : { at: 'message', to }, true)
  }
  /** A check to add, from You or Home: Get verified; nothing for a test account, which has none. */
  const addCheck = () => {
    if (!isTestId(inUse())) go(checkOf(inUse()!), true)
  }
  // Where the frame's buttons go: a place in place of this screen, as its tabs do; the rest pushed, as from a card.
  const frameGo: FrameGo = {
    place,
    profile: (address) => go({ at: 'profile', address }, true),
    newProfile: () => go({ at: 'new' }, true),
  }
  // The screen; in setup, on a laptop, the Start panel beside it; past setup, the frame around it.
  const on = onOf(screen)
  const shown = view()
  if (!on) return screen.at === 'start' || screen.at === 'connect' ? shown : <Setup>{shown}</Setup>
  return (
    <Frame on={on} go={frameGo} {...(isPlace(screen.at) && { place: screen.at })}>
      {shown}
    </Frame>
  )

  function view() {
    switch (screen.at) {
      case 'start':
        return <Start connecting={connecting()} {...(screen.noPasskey && { noPasskey: true })} onEntered={entered} onWords={() => go({ at: 'import-words' })} />
      case 'import-words':
        return <ImportWords onEntered={entered} onBack={() => go({ at: 'start', noPasskey: true })} />
      case 'verify': {
        const at = screen
        return (
          <Verify
            setup={at.setup}
            id={at.id}
            {...(at.again && { again: true })}
            onVerified={() => verified(at.again === true)}
            onIn={(e) => entered(e, at.id)}
            onBack={at.setup ? () => go({ at: 'start' }) : back}
            onDeleted={() => go({ at: 'start' })}
          />
        )
      }
      case 'backup':
        return <Backup onDone={backedUp} onWords={() => go({ at: 'words', setup: true }, true)} onBack={() => go({ at: 'verify', setup: true, id: inUse()! })} />
      case 'home':
        return <Home onOpen={(address) => go({ at: 'profile', address }, true)} onOffer={(address, entry) => go({ at: 'offer', address, entry }, true)} onNew={() => go({ at: 'new' }, true)} onCheck={addCheck} />
      case 'new':
        return (
          <NewProfile
            setup={screen.setup === true}
            {...(screen.link && { link: screen.link })}
            // A role the person has: its profile, so back comes back to New profile.
            onOpen={(address) => go({ at: 'profile', address }, true)}
            onBack={back}
            onContinue={firstDone}
          />
        )
      case 'profile':
        return (
          <Profile
            address={screen.address}
            onBack={back}
            onNew={() => go({ at: 'listing', address: screen.address }, true)}
            onOffer={(entry) => go({ at: 'offer', address: screen.address, entry }, true)}
            onReviews={() => go({ at: 'reviews', address: screen.address }, true)}
            onMessages={() => {
              intoMessages()
              go({ at: 'messages', only: screen.address, back: true }, true)
            }}
            onDeleted={() => go({ at: 'home' })}
          />
        )
      case 'offer': {
        const at = screen
        return (
          <Offer
            key={`${at.address} ${at.entry}`}
            address={at.address}
            entry={at.entry}
            wide={wide}
            {...(at.them && { them: at.them })}
            {...(at.link && { link: true })}
            onBack={back}
            onEdit={(edit) => go({ at: 'listing', address: at.address, edit }, true)}
            // On a phone, the conversation on a screen of its own, Back to the offer; on a laptop, beside its conversations, the offer staying.
            onThread={(them) => go(wide ? { at: 'offer', address: at.address, entry: at.entry, them } : { at: 'thread', mine: at.address, them }, true)}
            onReview={(mine, them) => review(mine, { subject: them })}
            onWho={who}
          />
        )
      }
      case 'reviews':
        return <Reviews address={screen.address} onBack={back} onOpen={(entry) => go({ at: 'received', address: screen.address, entry }, true)} onWritten={() => go({ at: 'written', address: screen.address }, true)} />
      case 'written':
        return <Written address={screen.address} onBack={back} onEdit={(edit) => review(screen.address, { edit })} />
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
        return <Them key={screen.address} address={screen.address} onBack={back} onMessage={messageTo} onReview={(mine, subject) => review(mine, { subject })} onReport={(mine, subject) => review(mine, { subject, report: true })} onWho={who} />
      case 'listing':
        return <For address={screen.address}>{(me) => <Listing me={me} {...(screen.edit && { edit: screen.edit })} onDone={back} onBack={back} />}</For>
      case 'review':
        return (
          <For address={screen.address}>
            {(me) => <Review me={me} {...(screen.edit && { edit: screen.edit })} {...(screen.subject && { subject: screen.subject })} {...(screen.report && { report: true })} onDone={back} onBack={back} />}
          </For>
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
            // Back to the profile it was opened from, its chip picked.
            {...(at.at === 'messages' && at.back && { onBack: back })}
            // Whose, in place of the screen as it was, so back leaves Messages.
            onOnly={(only) => go({ at: 'messages', ...(only && { only }), ...(at.at === 'messages' && at.back && { back: true }) })}
            onThread={(mine, them) => go({ at: 'thread', mine, them, ...(at.only && { only: at.only }) }, true)}
          />
        )
        const thread = open && <Thread key={`${open.mine} ${open.them}`} mine={open.mine} them={open.them} pane={wide} {...(open.link && { link: true })} onBack={back} onReview={(mine, them) => review(mine, { subject: them })} onWho={who} onOffer={(entry) => go({ at: 'offer', address: open.mine, entry }, true)} />
        if (wide) return <Panes list={list} open={thread} />
        return thread || list
      }
      case 'message':
        return <Message to={screen.to} {...(screen.listing && { listing: screen.listing })} onSent={(mine, them) => go({ at: 'thread', mine, them })} onBack={back} />
      case 'you':
        return <You onForgot={() => go({ at: 'start' })} onCheck={addCheck} onChecks={() => go({ at: 'checks' }, true)} onPasskeys={() => go({ at: 'passkeys' }, true)} onAiApps={() => go({ at: 'ai-apps' }, true)} onEmail={() => go({ at: 'email' }, true)} onAbout={() => go({ at: 'about' }, true)} />
      case 'checks':
        return <YourChecks onBack={back} onId={(path) => go({ at: 'document', path }, true)} />
      case 'document':
        return <IdPage path={screen.path} onBack={back} />
      case 'passkeys':
        return <Passkeys onBack={back} onAdd={() => go({ at: 'add-passkey' }, true)} onWords={() => go({ at: 'words' }, true)} />
      case 'ai-apps':
        return <AiApps onBack={back} onConnect={() => go({ at: 'connect-ai' }, true)} />
      case 'email':
        return <Email onBack={back} />
      case 'about':
        return <About onBack={back} onData={() => go({ at: 'data' }, true)} onPrivacy={() => go({ at: 'privacy' }, true)} onTerms={() => go({ at: 'terms' }, true)} />
      case 'data':
        return <YourData onBack={back} />
      case 'privacy':
        return <Framed title="Privacy" url={config.privacy} onBack={back} />
      case 'terms':
        return <Framed title="Terms" url={config.terms} onBack={back} />
      case 'connect':
        return <Connect connector={screen.connector} request={screen.request} />
      case 'give':
        return <Give to={screen.folder} onBack={back} />
      case 'nothing':
        return <Nothing said={screen.said} onBack={back} />
      case 'connect-ai':
        // In setup, back goes on to Home: a profile made can't be undone.
        return <ConnectAi onBack={screen.setup ? () => go({ at: 'home' }) : back} />
      case 'add-passkey':
        return <AddPasskey onDone={back} onBack={back} />
      case 'words': {
        const setup = screen.setup === true
        return <Words setup={setup} onDone={setup ? backedUp : back} onBack={back} />
      }
    }
  }
}

const isPlace = (at: Screen['at']): at is Place => at === 'home' || at === 'messages' || at === 'you'

/** What a screen past setup shows selected in the frame; null for a setup screen, which has none. */
function onOf(s: Screen): On | null {
  switch (s.at) {
    case 'home':
    case 'you':
      return s.at
    case 'give':
    case 'nothing':
      return 'home'
    case 'messages':
      return s.only ? { profile: s.only } : 'messages'
    case 'thread':
    case 'message':
      return 'messages'
    case 'profile':
    case 'offer':
    case 'reviews':
    case 'written':
    case 'received':
    case 'listing':
    case 'review':
    case 'them':
      return { profile: s.address }
    case 'new':
      return s.setup ? null : 'new'
    case 'verify':
    case 'connect-ai':
    case 'words':
      return s.setup ? null : 'you'
    case 'backup':
      return null
    case 'checks':
    case 'passkeys':
    case 'add-passkey':
    case 'ai-apps':
    case 'email':
    case 'about':
    case 'data':
    case 'privacy':
    case 'terms':
    case 'document':
      return 'you'
    default:
      return null
  }
}

/** What waits on `screen`, as the page opens: on Start, a Share link's address or an AI app's login; on a first profile, the login. */
function waitingAt(screen: Screen): Waiting | null {
  const { to, listing, link } = kept()
  if ((screen.at === 'start' || screen.at === 'import-words') && isLink(link)) return { link }
  if (screen.at === 'start' && isText(to)) return { to, ...(isText(listing) && { listing }) }
  const login = loginKept()
  return login && (screen.at === 'start' || screen.at === 'new' || screen.at === 'backup' || screen.at === 'verify') ? { login } : null
}

/** A screen for the person's profile at `address`, once the device lists it. */
function For({ address, children }: { address: string; children: (me: ReturnType<typeof useProfiles>[number]) => ReactNode }) {
  const me = useProfiles().find((p) => p.address === address)
  return me ? <>{children(me)}</> : null
}
