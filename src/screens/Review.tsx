// Review someone, from Reviews, a thread or a review received: who it is about at the top (their
// market and role, the shield, their address cut short), or a box for their address or Share link
// when it is not known. A big score on a slider, 1 to 10 in tenths; No score makes it a vouch, "I
// know they're real". The market's review fields for their role, which of their posts it is about,
// a comment, and Post. A red Report at the bottom turns it into a report: a comment only, posted in
// red. Before the unlock, the app checks it as for any entry: they are on the other side of the same
// market, none of the person's own (flows/posts.ts). An edit keeps its kind, and has Delete.

import { useEffect, useState } from 'react'

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { type Posted, type Subject, addressIn, check, newPath, post, subjectOf, unpost } from '../flows/posts.ts'
import { useProfiles } from '../hooks.ts'
import { type Kind, fieldsOf, kindWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { Line, type Note, Quiet, Spinner, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'
import { clean } from './Post.tsx'
import { PostRow } from './PostRow.tsx'
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
const SHARED = ['subject', 'score', 'text', 'post']

/** A slider's value as a score: "9.4", or "9" for a whole one. */
const scoreOf = (v: string) => Number(v).toFixed(1).replace(/\.0$/, '')

export function Review({ me, subject: given, edit, report = false, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const [kind, setKind] = useState<Exclude<Kind, 'post'>>(edit && edit.kind !== 'post' ? edit.kind : report ? 'report' : 'review')
  const [about, setAbout] = useState(given ?? (typeof edit?.body.subject === 'string' ? edit.body.subject : ''))
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjectNote, setSubjectNote] = useState<Note | null>(null)
  const [score, setScore] = useState(typeof edit?.body.score === 'string' ? edit.body.score : '')
  const [values, setValues] = useState<Body>(() => (edit ? Object.fromEntries(Object.entries(edit.body).filter(([n]) => !SHARED.includes(n))) : {}))
  const [their, setTheir] = useState(typeof edit?.body.post === 'string' ? edit.body.post : '')
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

  const send = useAction(async () => {
    if (kind === 'review' && !score) throw new Quiet('Add a score.')
    const said = { subject: address || undefined, text: text.trim() || undefined }
    const body = clean((kind === 'review' ? { ...values, ...said, score, post: their || undefined } : said) as Body)
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
  const theirPosts = kind === 'review' ? (subject?.posts ?? []) : []
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
          {subject && <Who address={subject.address} withAddress />}
          <Line note={subjectNote} />
        </div>
        {kind !== 'report' && (
          <div className="field">
            {kind === 'review' ? (
              <div className="score">
                <strong className="big">{score || '–'}</strong>
                <input type="range" aria-label="Score" min={1} max={10} step={0.1} value={score || '5.5'} onChange={(e) => setScore(scoreOf(e.target.value))} />
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
        {theirPosts.length > 0 && (
          <div className="field">
            <span className="label">{kindWords('post', `${name}/${subject!.role}`)}</span>
            <div className="rows">
              {theirPosts.map((p) => {
                const at = `${subject!.address}/${p.path}`
                return <PostRow key={p.path} market={market} body={p.body} chosen={their === at} onClick={() => setTheir(their === at ? '' : at)} />
              })}
            </div>
          </div>
        )}
        <div className="field">
          <span className="label">Comment</span>
          <textarea aria-label="Comment" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <Line note={send.note} />
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
