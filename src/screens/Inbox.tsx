// A profile's inbox, after one face: every message on each of its hosts, opened, in threads by whom
// each is with, the newest first, each named by that card's market and role word with its address
// under it. A thread shows its messages, oldest first, and a reply field; a reply is sealed to the
// other card's inbox key, signed by the main key, and copied to this inbox. A request the profile
// sent itself (by its main key, or an access key it lists) is a card with what it asks, every field
// of what Approve would sign, Approve, which signs exactly that with the main key after one face,
// and Decline. A grant is kept in the vault, and shown nowhere yet. What the screen showed is read:
// the card's count starts again from here. The opened messages live while this screen does.

import { Fragment, useEffect, useRef, useState } from 'react'

import type { Nav } from '../App.tsx'
import { cardName, localTime, marketOf, priceText, short, splitLabel } from '../cards.ts'
import { withFace } from '../face.ts'
import { DOES, type Inbox, type Opened, type Request, approve, fieldsOf, folderOf, grantsOf, knownHosts, offerTitle, openInbox, requestOf, send, textOf, threadsOf, toSign } from '../flows/messages.ts'
import { markRead } from '../inbox.ts'
import { type LocalProfile, answered, localProfiles, markAnswered } from '../local.ts'
import { settings } from '../settings.ts'
import { BackIcon, Score, Spinner, useAction } from '../ui.tsx'
import { keepGrants } from '../vault.ts'
import { useLocal } from './Board.tsx'
import { ReviewSheet } from './Sheets.tsx'

const cards = new Map<string, Promise<{ market: string; role: string } | null>>()

/** Another profile's market and role, from its card on its hosts; asked once per page load. Null when no card is found. */
function cardOf(address: string): Promise<{ market: string; role: string } | null> {
  const own = localProfiles().find((p) => p.address === address)
  if (own) return Promise.resolve(splitLabel(own.label))
  if (!cards.has(address)) {
    const read = folderOf(address, knownHosts(settings().host, localProfiles())).then(
      (view) => {
        const body = view.current.get('profile')?.record.body
        return body && typeof body.market === 'string' && typeof body.role === 'string' ? { market: body.market, role: body.role } : null
      },
      () => (cards.delete(address), null),
    )
    cards.set(address, read)
  }
  return cards.get(address)!
}

/** A profile's name, its market and its role's word; null until known, or when it has no card. */
export function useCardName(address: string): { name: string | null; market: string | null } {
  const [got, setGot] = useState<{ name: string | null; market: string | null }>({ name: null, market: null })
  useEffect(() => {
    let live = true
    cardOf(address).then(async (card) => {
      if (!card) return
      const file = await marketOf(settings().index, card.market).catch(() => null)
      if (live) setGot({ name: cardName(card.market, card.role, file), market: card.market })
    })
    return () => {
      live = false
    }
  }, [address])
  return got
}

export function InboxPage({ address, thread, nav }: { address: string; thread?: string; nav: Nav }) {
  const p = localProfiles().find((x) => x.address === address)
  useEffect(() => {
    if (!p) nav.reset({ name: 'board' })
  }, [p])
  return p ? <Page p={p} thread={thread} nav={nav} /> : null
}

function Page({ p, thread, nav }: { p: LocalProfile; thread?: string; nav: Nav }) {
  const [inbox, setInbox] = useState<Inbox | null>(null)
  const done = useLocal(answered)
  const known = () => knownHosts(settings().host, localProfiles())

  /** In one face: `act`, then what arrived since, merged with what is open, and read. */
  const face = async (act: (seed: Uint8Array) => Promise<void> = async () => undefined) => {
    const got = await withFace(async (seed) => {
      await act(seed)
      const more = await openInbox(seed, p, inbox?.cursors)
      markRead(p.address, more.cursors)
      // A grant not kept now is pulled again the next time the inbox opens, and kept then.
      const grants = grantsOf(more.messages)
      if (grants.length) await keepGrants(seed, settings().host, grants).catch((err) => console.error(err))
      return more
    })
    setInbox((was) => {
      const byId = new Map((was?.messages ?? []).map((m) => [m.id, m]))
      for (const m of got.messages) byId.set(m.id, m)
      return { ...got, messages: [...byId.values()], cursors: { ...was?.cursors, ...got.cursors } }
    })
  }
  const open = useAction(() => face())
  // Face first: the inbox opens with the screen.
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    void open.run()
  }, [])

  const shown = (inbox?.messages ?? []).filter((m) => !done[m.id])
  const threads = threadsOf(shown, p.address)
  // The access keys that sent this profile something as it, answered or not: a thread with one is the key's.
  const keys = new Set((inbox?.messages ?? []).flatMap((m) => (m.from === p.address && m.key ? [m.key] : [])))
  const t = thread === undefined ? undefined : threads.find((x) => x.with === thread) ?? { with: thread, messages: [], last: 0 }

  return (
    <main>
      <div className="bar">
        <div>
          <button className="icon" aria-label="Back" onClick={nav.back}>
            <BackIcon />
          </button>
        </div>
      </div>
      {!inbox && (
        <>
          <h1>Inbox</h1>
          {open.busy && <Spinner />}
          {open.error && <p className="error">{open.error}</p>}
          {!open.busy && (
            <>
              <div className="fill" />
              <button className="primary" onClick={() => open.run()}>
                Open
              </button>
            </>
          )}
        </>
      )}
      {inbox && !t && (
        <>
          <h1>Inbox</h1>
          <div className="rows">
            {threads.map((x) => (
              <ThreadRow key={x.with} with={x.with} keyed={keys.has(x.with)} asks={x.messages.filter((m) => requestOf(m, p.address, inbox.listed)).length} onOpen={() => nav.go({ name: 'inbox', address: p.address, with: x.with })} />
            ))}
          </div>
        </>
      )}
      {inbox && t && <ThreadView p={p} messages={t.messages} with={t.with} keyed={keys.has(t.with)} inbox={inbox} face={face} known={known} />}
    </main>
  )
}

/** A thread's name, its address under it: an access key's, or a card's market and role word; the address alone when no card is found. */
function Name({ address, keyed }: { address: string; keyed: boolean }) {
  const { name } = useCardName(address)
  const title = keyed ? 'Access key' : name
  return (
    <span>
      <strong style={{ display: 'block' }}>{title ?? short(address)}</strong>
      {title && <span className="sub">{short(address)}</span>}
    </span>
  )
}

function ThreadRow({ with: w, keyed, asks, onOpen }: { with: string; keyed: boolean; asks: number; onOpen: () => void }) {
  return (
    <button className="row thread" onClick={onOpen}>
      <Name address={w} keyed={keyed} />
      {asks > 0 && <span className="badge">{asks}</span>}
    </button>
  )
}

function ThreadView(props: { p: LocalProfile; messages: Opened[]; with: string; keyed: boolean; inbox: Inbox; face: (act?: (seed: Uint8Array) => Promise<void>) => Promise<void>; known: () => string[] }) {
  const { p, messages, with: w, keyed, inbox, face, known } = props
  // A thread with another profile takes a reply and a review; one with an access key, or with this profile, does not.
  const other = !keyed && w !== p.address
  const [text, setText] = useState('')
  const [review, setReview] = useState(false)
  const reply = useAction(async () => {
    await face((seed) => send(seed, p, w, { text: text.trim() }, known()))
    setText('')
  })
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [messages.length])

  return (
    <>
      <div className="thread-head">
        <Name address={w} keyed={keyed} />
        {other && (
          <button onClick={() => setReview(true)}>
            Review
          </button>
        )}
      </div>
      <div className="messages">
        {messages.map((m) => {
          const asked = requestOf(m, p.address, inbox.listed)
          return asked ? <RequestCard key={m.id} p={p} m={m} r={asked} inbox={inbox} face={face} known={known} /> : <Message key={m.id} p={p} m={m} />
        })}
        <div ref={end} />
      </div>
      {other && (
        <form
          className="reply"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) void reply.run()
          }}
        >
          {reply.error && <p className="error">{reply.error}</p>}
          <textarea className="field" rows={2} placeholder="Message" aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="primary" disabled={!text.trim() || reply.busy}>
            {reply.busy ? <Spinner /> : 'Send'}
          </button>
        </form>
      )}
      {review && <ReviewSheet p={p} subject={w} onClose={() => setReview(false)} onDone={() => setReview(false)} />}
    </>
  )
}

function Message({ p, m }: { p: LocalProfile; m: Opened }) {
  const mine = m.from === p.address
  return (
    <div className={mine ? 'message mine' : 'message'}>
      <span className="text">{textOf(m.body)}</span>
      {/* Sent by an access key this profile gave out, rather than by its main key. */}
      {mine && m.key && <span className="sub by">Access key {short(m.key)}</span>}
      <span className="sub when">{localTime(m.time)}</span>
    </div>
  )
}

/** What a request asks, in a line and what it names. */
function Asked({ r, inbox }: { r: Request; inbox: Inbox }) {
  const q = r.params
  switch (r.kind) {
    case 'post-offer':
    case 'update-offer':
      return (
        <>
          <strong>{r.kind === 'post-offer' ? 'Post an offer' : 'Change an offer'}</strong>
          <span className="text">{q.offer.description}</span>
          {priceText(q.offer.price) && <span className="price-tag">{priceText(q.offer.price)}</span>}
        </>
      )
    case 'remove-offer':
      return (
        <>
          <strong>Remove an offer</strong>
          <span className="text">{offerTitle(inbox, q.id)}</span>
        </>
      )
    case 'post-review':
      return (
        <>
          <strong>Post a review</strong>
          <span>{short(q.review.subject)}</span>
          {typeof q.review.ratings?.overall === 'string' && <Score value={Number(q.review.ratings.overall)} />}
          {typeof q.review.text === 'string' && <span className="text">{q.review.text}</span>}
        </>
      )
    case 'send':
      return (
        <>
          <strong>Send a message</strong>
          <Name address={q.to} keyed={false} />
          <span className="text">{q.text ?? JSON.stringify(q.body)}</span>
        </>
      )
    case 'pay': {
      const [owner = '', , id = ''] = String(q.offer).split('/')
      return (
        <>
          <strong>Pay</strong>
          <span>
            {short(owner)} · {id}
            {q.units && ` × ${q.units}`}
          </span>
          {q.note && <span className="text">{q.note}</span>}
        </>
      )
    }
    case 'private':
      return (
        <>
          <strong>Open private records</strong>
          {q.path && <span>{q.path}</span>}
        </>
      )
    default:
      return <strong>Open the inbox</strong>
  }
}

function RequestCard({ p, m, r, inbox, face, known }: { p: LocalProfile; m: Opened; r: Request; inbox: Inbox; face: (act?: (seed: Uint8Array) => Promise<void>) => Promise<void>; known: () => string[] }) {
  // What Approve signs, fixed when the card first shows, so what the person sees is what is signed.
  const [shown] = useState(() => toSign(r, inbox.own))
  const yes = useAction(async () => {
    await face((seed) => approve(seed, p, r, known(), shown ?? undefined))
    markAnswered(r.id, 'approved')
  })
  return (
    <div className="request" role="group" aria-label="Request">
      <Asked r={r} inbox={inbox} />
      {shown && (
        <dl className="fields" aria-label="What is signed">
          {fieldsOf(shown).map(([name, value], i) => (
            <Fragment key={i}>
              <dt>{name}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      {m.key && <span className="sub by">Access key {short(m.key)}</span>}
      <span className="sub when">{localTime(m.time)}</span>
      {yes.error && <p className="error">{yes.error}</p>}
      <div className="answer">
        {DOES.has(r.kind) && (
          <button className="primary" onClick={() => yes.run()} disabled={yes.busy}>
            {yes.busy ? <Spinner /> : 'Approve'}
          </button>
        )}
        <button className="decline" onClick={() => markAnswered(r.id, 'declined')} disabled={yes.busy}>
          Decline
        </button>
      </div>
    </div>
  )
}
