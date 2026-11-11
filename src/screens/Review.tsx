// Review someone, one screen, from a conversation's Review or a review received, who it is about
// known; or from a profile, which first asks who on a sheet (WhoSheet.tsx). At the top, Close, then
// their avatar, market and role and badge. A switch of three, Score, Vouch and Report, and one quiet
// line under it saying what the one picked is. Score: the score big with its star, over a slider, 1
// to 10 in tenths, its thumb hidden until touched, so no score looks chosen. Vouch: says they're
// real and honest, without a score, its mint square. Report: warns others it's fake or a scam, its
// red one. Then, for a score, the market's own fields for their role, a choice of two in one row,
// its words and its chips; then one comment, its placeholder by what is picked; and the button at
// the foot names what it does: Post, Vouch, or Report, in red. No review here names one of their
// listings. Before the unlock, the app checks it as for any entry: they are on the other side of
// the same market, and none of the person's own profiles (flows/entries.ts); a refusal shows once.
// One of a kind about someone this profile wrote before goes in its place (writtenAbout). An edit
// keeps its kind, so shows no switch, keeps a listing an older review named, and has Delete; a
// review an older market shaped opens with what still fits once who it is about is known
// (form.ts), so it is posted again in the market's shape today.

import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { type Body, publicKeyFromAddress } from '@foundationforest/folders'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { type Posted, type Subject, addressIn, check, newPath, post, subjectOf, unpost, writtenAbout } from '../flows/entries.ts'
import { fitting } from '../form.ts'
import { useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { type Field as MarketField, type Kind, fieldsOf, goneLine, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { choiceWords } from '../show.ts'
import { Line, type Note, Quiet, Seg, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'
import { fieldWords } from '../words.ts'
import { clean } from './Listing.tsx'
import { Who, WhoAvatar } from './Who.tsx'
import { WhoSheet } from './WhoSheet.tsx'

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

type Said = Exclude<Kind, 'listing'>

/** The shared fields, which this form asks for in its own way; `listing` it never asks. */
const SHARED = ['subject', 'score', 'text', 'listing']

/** What each kind is, said under the switch; its comment's placeholder; and its button. */
const KINDS: Record<Said, { words: string; icon: 'star' | 'handshake' | 'flag'; says: string; asks: string; button: string }> = {
  review: { words: 'Score', icon: 'star', says: 'How did it go, from 1 to 10?', asks: "What went well, or didn't?", button: 'Post' },
  vouch: { words: 'Vouch', icon: 'handshake', says: "Say they're real and honest, without a score.", asks: 'How do you know them? (optional)', button: 'Vouch' },
  report: { words: 'Report', icon: 'flag', says: "Warn others it's fake or a scam.", asks: 'What happened?', button: 'Report' },
}

/** A slider's value as a score: "9.4", or "9" for a whole one. */
const scoreOf = (v: string) => Number(v).toFixed(1).replace(/\.0$/, '')

export function Review({ me, subject: given, edit, report = false, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const [kind, setKind] = useState<Said>(edit && edit.kind !== 'listing' ? edit.kind : report ? 'report' : 'review')
  const [about, setAbout] = useState(given ?? (typeof edit?.body.subject === 'string' ? edit.body.subject : ''))
  const [asking, setAsking] = useState(!about)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjectNote, setSubjectNote] = useState<Note | null>(null)
  const [score, setScore] = useState(typeof edit?.body.score === 'string' ? edit.body.score : '')
  const [values, setValues] = useState<Body>(() => (edit ? Object.fromEntries(Object.entries(edit.body).filter(([n]) => !SHARED.includes(n))) : {}))
  // The listing an older review named, kept as it was: this screen names none, and dropping it would make it another review at the index.
  const [named, setNamed] = useState(typeof edit?.body.listing === 'string' ? edit.body.listing : undefined)
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
    setNamed(typeof fit.listing === 'string' ? fit.listing : undefined)
    setText(typeof fit.text === 'string' ? fit.text : '')
  }, [subject])

  const send = useAction(async () => {
    // Refused already, under their name: nothing more to say.
    if (subjectNote) return
    if (kind === 'review' && !score) throw new Quiet('Add a score.')
    const said = { subject: address || undefined, text: text.trim() || undefined }
    const body = clean((kind === 'review' ? { ...values, ...said, score, listing: named } : said) as Body)
    await check(config, me, kind, body, mine)
    const path = edit?.path ?? (await writtenAbout(config, me, kind, address)) ?? paths[kind]
    await withSeed(passkey()!, (seed) => post(config, seed, me, kind, body, path))
    onDone()
  })
  const remove = useAction(async () => {
    if (!edit) return
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, edit.path))
    onDone()
  })

  if (!market)
    return (
      <main>
        <Top onClose={onBack} />
        <p className="line">{goneLine(me.label)}</p>
      </main>
    )
  if (asking)
    return (
      <main>
        <WhoSheet
          me={me}
          mine={mine}
          onPick={(picked) => {
            setAbout(picked)
            setAsking(false)
          }}
          onClose={onBack}
        />
      </main>
    )
  const fields = kind === 'review' ? Object.entries(fieldsOf(market, 'review', role, subject?.role)).filter(([n]) => !SHARED.includes(n)) : []
  const busy = send.busy || remove.busy
  const k = KINDS[kind]
  const at = score ? `${((Number(score) - 1) / 9) * 100}%` : '0%'
  return (
    <main>
      <Top onClose={onBack}>
        {address && publicKeyFromAddress(address) && (
          <span className="convo-head">
            <WhoAvatar address={address} size="sm" />
            <Who address={address} />
          </span>
        )}
      </Top>
      <Line note={subjectNote} />
      <form
        id="review"
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          void send.run()
        }}
      >
        <div className="stack">
          {!edit && <Seg label="Kind" options={(Object.keys(KINDS) as Said[]).map((v) => ({ value: v, words: KINDS[v].words, icon: KINDS[v].icon }))} value={kind} onPick={(v) => v && setKind(v)} />}
          <p className="kind-line">{k.says}</p>
        </div>
        {kind === 'review' ? (
          <div className="score">
            <span className="score-big">
              <Icon name="star" fill />
              <strong className="big">{score || '–'}</strong>
            </span>
            <input
              type="range"
              aria-label="Score"
              className={score ? undefined : 'untouched'}
              style={{ '--at': at } as CSSProperties}
              min={1}
              max={10}
              step={0.1}
              value={score || '5.5'}
              onChange={(e) => setScore(scoreOf(e.target.value))}
              // A tap just where the hidden thumb sits changes nothing, so no change comes: it counts too.
              onPointerUp={(e) => !score && setScore(scoreOf(e.currentTarget.value))}
            />
            <span className="ends xs">
              <span>1</span>
              <span>10</span>
            </span>
          </div>
        ) : (
          <div className="kind-mark">
            <span className={kind === 'vouch' ? 'sq big mint' : 'sq big red'}>
              <Icon name={k.icon} fill />
            </span>
          </div>
        )}
        {fields.map(([n, f]) =>
          f.type === 'choice' && !f.many && f.values?.length === 2 ? (
            <Question key={n} name={n} field={f} value={values[n]} onChange={(v) => setValues((was) => ({ ...was, [n]: v as Body[string] }))} />
          ) : (
            <Field key={n} name={n} field={f} value={values[n]} onChange={(v) => setValues((was) => ({ ...was, [n]: v as Body[string] }))} picked={picked} />
          ),
        )}
        <textarea aria-label="Comment" placeholder={k.asks} rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </form>
      <div className="foot">
        {/* The subject's refusal is said once, under their name. */}
        <Line note={send.note && send.note.text !== subjectNote?.text ? send.note : null} />
        <button type="submit" form="review" className={kind === 'report' ? 'danger solid' : 'primary'} disabled={busy}>
          {send.busy ? <Loader /> : <><UnlockIcon /> {k.button}</>}
        </button>
        {edit && (
          <>
            <Line note={remove.note} />
            <button type="button" className={sure ? 'danger solid' : 'danger'} disabled={busy} onClick={() => (sure ? remove.run() : setSure(true))}>
              {remove.busy ? <Loader /> : sure ? <><UnlockIcon /> Delete</> : 'Delete'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

/** A market's choice of two for a review, in one row: its words, the market's own name for the field, then its two chips. */
function Question({ name, field, value, onChange }: { name: string; field: MarketField; value: unknown; onChange: (v: string | undefined) => void }) {
  const words = fieldWords(name)
  return (
    <div className="qrow" role="group" aria-label={words}>
      <strong>{words}</strong>
      {(field.values ?? []).map((v) => {
        const on = value === v
        return (
          <button key={v} type="button" className={on ? 'chip here' : 'chip'} aria-pressed={on} onClick={() => onChange(on ? undefined : v)}>
            {choiceWords(field, v)}
          </button>
        )
      })}
    </div>
  )
}
