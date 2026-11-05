// Review someone, from a profile, its Feedback, a thread or a review received: who it is about at
// the top (their market and role, the shield, their address cut short), or a box for their address
// or Share link when it is not known, with who it is under it as soon as it holds an address. A big
// score on a slider, 1 to 10 in tenths, its thumb hidden until touched, so no score looks chosen;
// No score makes it a vouch, "I know they're real". The market's review fields for their role,
// which of their listings it is about, a comment, and Post. A red Report at the bottom turns it
// into a report: a comment only, posted in red. Before the unlock, the app checks it as for any
// entry: they are on the other side of the same market, and none of the person's own profiles
// (flows/entries.ts); a refusal shows once. An edit keeps its kind, and has Delete; a review an older
// market shaped opens with what still fits once who it is about is known (form.ts), so it is posted
// again in the market's shape today.

import { useEffect, useRef, useState } from 'react'

import { type Body, publicKeyFromAddress } from '@foundationforest/folders'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { type Posted, type Subject, addressIn, check, newPath, post, subjectOf, unpost } from '../flows/entries.ts'
import { fitting } from '../form.ts'
import { useProfiles } from '../hooks.ts'
import { type Kind, fieldsOf, kindWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { Line, type Note, Quiet, Spinner, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'
import { clean } from './Listing.tsx'
import { ListingRow } from './ListingRow.tsx'
import { Who } from './Who.tsx'

type Props = {
  me: Profile
  /** The profile it is about, when known: from a thread or a review received. */
  subject?: string
  /** One of `me`'s reviews, vouches or reports, to edit. */
  edit?: Posted
  /** Opened as a report, from a review received. */
  report?: boolean
  onDone: () => void
  onBack: () => void
}

/** The shared fields, which this form asks for in its own way. */
const SHARED = ['subject', 'score', 'text', 'listing']

/** A slider's value as a score: "9.4", or "9" for a whole one. */
const scoreOf = (v: string) => Number(v).toFixed(1).replace(/\.0$/, '')

export function Review({ me, subject: given, edit, report = false, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const [kind, setKind] = useState<Exclude<Kind, 'listing'>>(edit && edit.kind !== 'listing' ? edit.kind : report ? 'report' : 'review')
  const [about, setAbout] = useState(given ?? (typeof edit?.body.subject === 'string' ? edit.body.subject : ''))
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjectNote, setSubjectNote] = useState<Note | null>(null)
  const [score, setScore] = useState(typeof edit?.body.score === 'string' ? edit.body.score : '')
  const [values, setValues] = useState<Body>(() => (edit ? Object.fromEntries(Object.entries(edit.body).filter(([n]) => !SHARED.includes(n))) : {}))
  const [their, setTheir] = useState(typeof edit?.body.listing === 'string' ? edit.body.listing : '')
  const [text, setText] = useState(typeof edit?.body.text === 'string' ? edit.body.text : '')
  const [sure, setSure] = useState(false)
  const [picked] = useState<Picked>(() => new Map())
  const paths = useState(() => ({ review: newPath('review'), vouch: newPath('vouch'), report: newPath('report') }))[0]

  // The subject, read from the host as soon as an address is given.
  const address = addressIn(about)
  useEffect(() => {
    setSubject(null)
    setSubjectNote(null)
    if (!address) return
    let live = true
    subjectOf(config, me, address, mine).then(
      (s) => live && setSubject(s),
      (err: unknown) => live && setSubjectNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [address])

  // A review its market outgrew: what still fits, once, as soon as the role of whom it is about is known.
  const fitted = useRef(false)
  useEffect(() => {
    if (!edit || edit.kind !== 'review' || !subject || fitted.current) return
    fitted.current = true
    const fit = fitting(name, role, edit.body, 'review', subject.role)
    if (Object.keys(fit).length === Object.keys(edit.body).length) return
    setValues(Object.fromEntries(Object.entries(fit).filter(([n]) => !SHARED.includes(n))))
    setScore(typeof fit.score === 'string' ? fit.score : '')
    setTheir(typeof fit.listing === 'string' ? fit.listing : '')
    setText(typeof fit.text === 'string' ? fit.text : '')
  }, [subject])

  const send = useAction(async () => {
    // Refused already, under the box: nothing more to say.
    if (subjectNote) return
    if (kind === 'review' && !score) throw new Quiet('Add a score.')
    const said = { subject: address || undefined, text: text.trim() || undefined }
    const body = clean((kind === 'review' ? { ...values, ...said, score, listing: their || undefined } : said) as Body)
    await check(config, me, kind, body, mine)
    await withSeed(passkey()!, (seed) => post(config, seed, me, kind, body, edit?.path ?? paths[kind]))
    onDone()
  })
  const remove = useAction(async () => {
    if (!edit) return
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, edit.path))
    onDone()
  })

  if (!market) return null
  const fields = kind === 'review' ? Object.entries(fieldsOf(market, 'review', role, subject?.role)).filter(([n]) => !SHARED.includes(n)) : []
  const theirListings = kind === 'review' ? (subject?.listings ?? []) : []
  const busy = send.busy || remove.busy
  return (
    <main>
      <Top onBack={onBack}>
        <h1>{kind === 'report' ? 'Report' : 'Review'}</h1>
      </Top>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          void send.run()
        }}
      >
        <div className="field">
          {given || edit ? null : <input aria-label="Their address" placeholder="Their address" autoComplete="off" value={about} onChange={(e) => setAbout(e.target.value)} />}
          {address && publicKeyFromAddress(address) && <Who address={address} withAddress={!!(given || edit)} />}
          <Line note={subjectNote} />
        </div>
        {kind !== 'report' && (
          <div className="field">
            {kind === 'review' ? (
              <div className="score">
                <strong className="big">{score || '–'}</strong>
                <input
                  type="range"
                  aria-label="Score"
                  className={score ? undefined : 'untouched'}
                  min={1}
                  max={10}
                  step={0.1}
                  value={score || '5.5'}
                  onChange={(e) => setScore(scoreOf(e.target.value))}
                  // A tap just where the hidden thumb sits changes nothing, so no change comes: it counts too.
                  onPointerUp={(e) => !score && setScore(scoreOf(e.currentTarget.value))}
                />
              </div>
            ) : (
              <p className="hint">You know they're real.</p>
            )}
            {!edit && (
              <div className="chips">
                <button type="button" className={kind === 'vouch' ? 'chip here' : 'chip'} aria-pressed={kind === 'vouch'} onClick={() => setKind(kind === 'vouch' ? 'review' : 'vouch')}>
                  No score
                </button>
              </div>
            )}
          </div>
        )}
        {fields.map(([n, f]) => (
          <Field key={n} name={n} field={f} value={values[n]} onChange={(v) => setValues((was) => ({ ...was, [n]: v as Body[string] }))} picked={picked} />
        ))}
        {theirListings.length > 0 && (
          <div className="field">
            <span className="label">{kindWords('listing', `${name}/${subject!.role}`)}</span>
            <div className="rows">
              {theirListings.map((l) => {
                const at = `${subject!.address}/${l.path}`
                return <ListingRow key={l.path} market={market} body={l.body} chosen={their === at} onClick={() => setTheir(their === at ? '' : at)} />
              })}
            </div>
          </div>
        )}
        <div className="field">
          <span className="label">Comment</span>
          <textarea aria-label="Comment" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {/* The subject's refusal is said once, under the box. */}
        <Line note={send.note && send.note.text !== subjectNote?.text ? send.note : null} />
        <button type="submit" className={kind === 'report' ? 'danger solid' : 'primary'} disabled={busy}>
          {send.busy ? <Spinner /> : <><UnlockIcon /> Post</>}
        </button>
        {edit ? (
          <>
            <Line note={remove.note} />
            <button type="button" className={sure ? 'danger solid' : 'danger'} disabled={busy} onClick={() => (sure ? remove.run() : setSure(true))}>
              {remove.busy ? <Spinner /> : sure ? <><UnlockIcon /> Delete</> : 'Delete'}
            </button>
          </>
        ) : (
          kind !== 'report' && (
            <button type="button" className="quiet danger-text" onClick={() => setKind('report')}>
              Report
            </button>
          )
        )}
      </form>
    </main>
  )
}
