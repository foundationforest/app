// Post, from a card or a thread: one of the kinds a market defines, its form from the market's own
// fields (the markets' browser entry). An offer, a request or a post, as the profile's role names
// it; or a review, a vouch or a report about someone on the other side of the market, its subject
// given as their address or Share link, or filled in from a thread. A review may name one of their
// posts, picked by what it says. Everything is checked before the unlock (flows/posts.ts); then one
// unlock signs and writes it. An edit is the same form, filled in, at the entry's own path.

import { useEffect, useState } from 'react'

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import { type Posted, type Subject, addressIn, check, post, subjectOf } from '../flows/posts.ts'
import { useProfiles } from '../hooks.ts'
import { type Kind, fieldsOf, kindWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { previewLines } from '../show.ts'
import { Line, type Note, Spinner, Top, UnlockIcon, noteOf, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = {
  me: Profile
  /** The kinds offered: every kind from a card, the three about someone from a thread. */
  kinds: Kind[]
  /** An entry of `me`'s to edit. */
  edit?: Posted
  /** The profile it is about, from a thread. */
  subject?: string
  onDone: () => void
  onBack: () => void
}

/** A body with what was left out left out. */
const clean = (body: Body): Body => Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as Body

export function Post({ me, kinds, edit, subject: given, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const [kind, setKind] = useState<Kind | null>(edit?.kind ?? (kinds.length === 1 ? kinds[0]! : null))
  const [values, setValues] = useState<Body>(() => (edit ? { ...edit.body } : {}))
  const [about, setAbout] = useState(given ?? (typeof edit?.body.subject === 'string' ? edit.body.subject : ''))
  const [subject, setSubject] = useState<Subject | null>(null)
  const [subjectNote, setSubjectNote] = useState<Note | null>(null)

  // The subject, read from the host as soon as an address is given.
  const address = addressIn(about)
  useEffect(() => {
    setSubject(null)
    setSubjectNote(null)
    if (!kind || kind === 'post' || !address) return
    let live = true
    subjectOf(config, me, address, mine).then(
      (s) => live && setSubject(s),
      (err: unknown) => live && setSubjectNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [kind, address])

  const send = useAction(async () => {
    if (!kind) return
    const body = clean({ ...values, ...(kind !== 'post' && { subject: address || undefined }) })
    await check(config, me, kind, body, mine)
    await withSeed(passkey()!, (seed) => post(config, seed, me, kind, body, edit?.path))
    onDone()
  })

  if (!market) return null
  if (!kind) {
    return (
      <main>
        <Top onBack={onBack} />
        <h1>Post</h1>
        <div className="rows">
          {kinds.map((k) => (
            <button key={k} className="row" onClick={() => setKind(k)}>
              {kindWords(k, me.label)}
            </button>
          ))}
        </div>
      </main>
    )
  }
  const fields = Object.entries(fieldsOf(market, kind, role, subject?.role)).filter(([n]) => n !== 'subject' && n !== 'post')
  const set = (n: string, v: unknown) => setValues((was) => ({ ...was, [n]: v as Body[string] }))
  const theirPosts = kind === 'review' ? (subject?.posts ?? []) : []
  return (
    <main>
      <Top onBack={onBack} />
      <h1>{kindWords(kind, me.label)}</h1>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          void send.run()
        }}
      >
        {kind !== 'post' && (
          <div className="field">
            <span className="label">About</span>
            {given ? null : <input aria-label="Their address" placeholder="Their address or Share link" autoComplete="off" value={about} onChange={(e) => setAbout(e.target.value)} />}
            {subject && <Who address={subject.address} />}
            <Line note={subjectNote} />
          </div>
        )}
        {theirPosts.length > 0 && (
          <div className="field">
            <span className="label">Their post</span>
            <div className="rows">
              {theirPosts.map((p) => {
                const at = `${subject!.address}/${p.path}`
                const on = values.post === at
                return (
                  <button key={p.path} type="button" className={on ? 'row chosen' : 'row'} aria-pressed={on} onClick={() => set('post', on ? undefined : at)}>
                    <span>{typeof p.body.description === 'string' ? p.body.description : (previewLines(market, p.body)[0] ?? kindWords('post', `${name}/${subject!.role}`))}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {fields.map(([n, f]) => (
          <Field key={n} name={n} field={f} value={values[n]} onChange={(v) => set(n, v)} />
        ))}
        <Line note={send.note} />
        <button type="submit" className="primary" disabled={send.busy}>
          {send.busy ? <Spinner /> : <><UnlockIcon /> {edit ? 'Save' : 'Post'}</>}
        </button>
      </form>
    </main>
  )
}
