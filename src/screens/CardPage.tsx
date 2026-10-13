// A profile's page: its market, its role word, its score; its offers, the reviews it wrote and its
// access keys. The bell opens the reviews about it, from the index. Adding an offer, a review or an
// access key, and the inbox, come next; their buttons are here, not yet working.

import { useEffect, useState } from 'react'

import type { Nav } from '../App.tsx'
import { short, words } from '../cards.ts'
import { withFace } from '../face.ts'
import { localProfiles, markSeen } from '../local.ts'
import type { AccessKey } from '../../standard/records/src/index.ts'
import { BackIcon, BellIcon, InboxIcon, Score, Spinner, useAction } from '../ui.tsx'
import { useProfile } from './Board.tsx'

const can = (e: AccessKey) => (e.scope === 'write' && e.paths ? `write · ${e.paths.join(', ')}` : e.scope!)

function Section({ title, add, children }: { title: string; add: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        <button disabled>+ {add}</button>
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
  const [removing, setRemoving] = useState('')
  const remove = useAction(async (key: string) => {
    setRemoving(key)
    try {
      const { removeAccessKey } = await import('../flows/access.ts')
      await withFace((seed) => removeAccessKey(seed, p, key))
      d.reload()
    } finally {
      setRemoving('')
    }
  })
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
          <button className="icon" aria-label="Inbox" aria-disabled="true">
            <InboxIcon />
            {d.inbox > 0 && <span className="badge">{d.inbox}</span>}
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 4 }}>
        <h1>{words(d.name)}</h1>
        <p className="sub">{words(d.word)}</p>
        {d.index?.rating && (
          <p className="sub" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Score value={d.index.rating.value} />
            {d.index.rating.reviews} {d.index.rating.reviews === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      <Section title="Offers" add="Offer">
        {!!d.own?.offers.length && (
          <div className="rows">
            {d.own.offers.map((o) => (
              <div className="tint" key={o.path}>
                <span>{o.title}</span>
                {o.price && <span>{o.price}</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Reviews you wrote" add="Review">
        {!!d.own?.written.length && (
          <div className="rows">
            {d.own.written.map((r) => (
              <div className="row top" key={r.path}>
                <span>
                  <strong>{short(r.subject)}</strong>
                  {r.text && <span className="sub" style={{ display: 'block' }}>{r.text}</span>}
                </span>
                {r.score && <Score value={Number(r.score)} />}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Access keys" add="Access key">
        {!!d.own?.access.length && (
          <div className="rows">
            {d.own.access.map((e) => (
              <div className="row" key={e.key} style={{ alignItems: 'center' }}>
                <span>
                  <strong>{short(e.key)}</strong>
                  <span className="sub" style={{ display: 'block' }}>{can(e)}</span>
                </span>
                <button className="remove" onClick={() => remove.run(e.key)} disabled={remove.busy}>
                  {removing === e.key ? <Spinner /> : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
        {remove.error && <p className="error">{remove.error}</p>}
      </Section>

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
