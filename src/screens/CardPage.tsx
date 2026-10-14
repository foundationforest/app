// A profile's page: its market, its role word, its address (short, copied whole), its score; its
// offers (a buyer's profile calls them requests), the reviews it wrote and its access keys, from
// its permissions record, one row for each, by its kind. The bell opens the reviews about it, from
// the index; the inbox icon, its inbox; the menu, Hide. An offer or a review is added with its
// sheet, and changed or removed by tapping its row; an access key is made with its sheet, and
// removed from its row, an inbox key's two keys together. What failed to read shows in red.

import { useEffect, useState } from 'react'

import type { Nav } from '../App.tsx'
import { type AccessRow, type Offer, type Written, short, words } from '../cards.ts'
import { withFace } from '../face.ts'
import { localProfiles, markSeen } from '../local.ts'
import { BackIcon, BellIcon, CheckIcon, CopyIcon, InboxIcon, Line, MoreIcon, Score, Spinner, useAction, useCopy } from '../ui.tsx'
import { lazy } from '../version.ts'
import { ProfileMenu, useProfile } from './Board.tsx'
import { AccessKeySheet, OfferSheet, ReviewSheet } from './Sheets.tsx'

/** An access key's row, by its kind; a message or read key alone was made before the two kinds. */
const KIND: Record<AccessRow['kind'], string> = { writing: 'Writing key', inbox: 'Inbox key', message: 'Message key', read: 'Read key' }

function Section({ title, add, onAdd, children }: { title: string; add: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        <button onClick={onAdd}>
          + {add}
        </button>
      </div>
      {children}
    </section>
  )
}

export function CardPage({ address, nav }: { address: string; nav: Nav }) {
  const p = localProfiles().find((x) => x.address === address)
  useEffect(() => {
    if (!p) nav.reset({ name: 'board' })
  }, [p])
  return p ? <Page p={p} nav={nav} /> : null
}

function Page({ p, nav }: { p: ReturnType<typeof localProfiles>[number]; nav: Nav }) {
  const d = useProfile(p)
  const [reviews, setReviews] = useState(false)
  // The sheet open: a new offer or review (null), or the one tapped.
  const [offer, setOffer] = useState<Offer | null>()
  const [review, setReview] = useState<Written | null>()
  const [access, setAccess] = useState(false)
  const [menu, setMenu] = useState(false)
  const copy = useCopy()
  const [removing, setRemoving] = useState('')
  const remove = useAction(async (keys: string[]) => {
    setRemoving(keys[0]!)
    try {
      const { removeAccessKey } = await lazy(() => import('../flows/access.ts'))
      await withFace((seed) => removeAccessKey(seed, p, keys))
      d.reload()
    } finally {
      setRemoving('')
    }
  })
  const asks = d.role === 'buyer'
  const received = d.index?.received ?? []
  const openReviews = () => {
    markSeen(p.address, received.length)
    setReviews(true)
  }

  return (
    <main>
      <div className="bar">
        <div>
          <button className="icon" aria-label="Back" onClick={nav.back}>
            <BackIcon />
          </button>
        </div>
        <div>
          <button className="icon" aria-label="Reviews about this profile" onClick={openReviews}>
            <BellIcon />
            {d.newReviews > 0 && <span className="dot" />}
          </button>
          <button className="icon" aria-label="Inbox" onClick={() => nav.go({ name: 'inbox', address: p.address })}>
            <InboxIcon />
            {d.inbox > 0 && <span className="badge">{d.inbox}</span>}
          </button>
          <button className="icon" aria-label="Profile menu" onClick={() => setMenu(true)}>
            <MoreIcon />
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <h1>{words(d.name)}</h1>
        <p className="sub">{words(d.word)}</p>
        <p className="sub address">
          {short(p.address)}
          <button className="icon" aria-label={copy.copied ? 'Copied' : 'Copy address'} onClick={() => copy.copy(p.address)}>
            {copy.copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </p>
        <Line error={copy.error || d.error} />
        {d.index?.rating && (
          <p className="sub" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Score value={d.index.rating.value} />
            {d.index.rating.reviews} {d.index.rating.reviews === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      <Section title={asks ? 'Requests' : 'Offers'} add={asks ? 'Request' : 'Offer'} onAdd={() => setOffer(null)}>
        {!!d.own?.offers.length && (
          <div className="rows">
            {d.own.offers.map((o) => (
              <button className="tint" key={o.path} onClick={() => setOffer(o)}>
                <span>{o.title}</span>
                {o.price && <span>{o.price}</span>}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Reviews you wrote" add="Review" onAdd={() => setReview(null)}>
        {!!d.own?.written.length && (
          <div className="rows">
            {d.own.written.map((r) => (
              <button className="row top" key={r.path} onClick={() => setReview(r)}>
                <span>
                  <strong>{short(r.subject)}</strong>
                  {r.text && <span className="sub" style={{ display: 'block' }}>{r.text}</span>}
                </span>
                {r.score && <Score value={Number(r.score)} />}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Access keys" add="Access key" onAdd={() => setAccess(true)}>
        {!!d.own?.access.length && (
          <div className="rows">
            {d.own.access.map((row) => (
              <div className="row" key={row.keys[0]} style={{ alignItems: 'center' }}>
                <span>{KIND[row.kind]}</span>
                <button className="remove" onClick={() => remove.run(row.keys)} disabled={remove.busy}>
                  {removing === row.keys[0] ? <Spinner /> : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
        <Line error={remove.error} />
      </Section>

      {offer !== undefined && <OfferSheet p={p} offer={offer ?? undefined} onClose={() => setOffer(undefined)} onDone={() => (setOffer(undefined), d.reload())} />}
      {review !== undefined && <ReviewSheet p={p} review={review ?? undefined} onClose={() => setReview(undefined)} onDone={() => (setReview(undefined), d.reload())} />}
      {menu && <ProfileMenu p={p} onClose={() => setMenu(false)} onHidden={nav.back} />}
      {access && <AccessKeySheet p={p} market={words(d.name)} role={d.word} onClose={() => setAccess(false)} onMade={d.reload} />}

      {reviews && (
        <>
          <div className="sheet-back" onClick={() => setReviews(false)} />
          <div className="sheet" role="dialog" aria-label="Reviews about this profile">
            <div className="grip" />
            <div className="rows" style={{ paddingBottom: 8 }}>
              {received.map((r) => (
                <div className="row top" key={r.uri}>
                  <span>
                    <strong>{short(r.reviewer)}</strong>
                    {r.text && <span className="sub" style={{ display: 'block' }}>{r.text}</span>}
                  </span>
                  {r.score !== null && <Score value={r.score} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
