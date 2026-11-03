// A post, new or edited, from a profile: an offer, a request or a post, as the profile's role names
// it, its form the market's own fields in the market's order (the markets' browser entry), the
// photos among them. Everything is checked before the unlock (flows/posts.ts); then one unlock signs
// it, writes it and sends its new photos. Its path is set as the form opens, so posting again after
// a photo did not go writes the same post, never a second. An edit's Delete is in red, asking once
// more.

import { useRef, useState } from 'react'

import type { Body } from '@foundationforest/folders'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { newPhotos, withFiles } from '../flows/photos.ts'
import { type Posted, check, newPath, post, unpost } from '../flows/posts.ts'
import { useProfiles } from '../hooks.ts'
import { fieldsOf, kindWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = { me: Profile; edit?: Posted; onDone: () => void; onBack: () => void }

/** A body with what was left out left out. */
export const clean = (body: Body): Body => Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as Body

export function Post({ me, edit, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const [values, setValues] = useState<Body>(() => (edit ? { ...edit.body } : {}))
  const [path] = useState(() => edit?.path ?? newPath('post'))
  const [sure, setSure] = useState(false)
  const picked = useRef<Picked>(new Map()).current

  const fields = market ? Object.entries(fieldsOf(market, 'post', role)) : []
  const photoFields = fields.filter(([, f]) => f.type === 'file').map(([n]) => n)
  const send = useAction(async () => {
    const bytes = new Map([...picked].map(([sha, p]) => [sha, p.bytes]))
    const body = withFiles(clean(values), photoFields, bytes)
    await check(config, me, 'post', body, mine)
    await withSeed(passkey()!, (seed) => post(config, seed, me, 'post', body, path, newPhotos(body, bytes)))
    onDone()
  })
  const remove = useAction(async () => {
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, path))
    onDone()
  })

  if (!market) return null
  const set = (n: string, v: unknown) => setValues((was) => ({ ...was, [n]: v as Body[string] }))
  const word = kindWords('post', me.label)
  return (
    <main>
      <Top onBack={onBack}>
        <h1>{edit ? word : `New ${word.toLowerCase()}`}</h1>
      </Top>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          void send.run()
        }}
      >
        {fields.map(([n, f]) => (
          <Field key={n} name={n} field={f} value={values[n]} onChange={(v) => set(n, v)} picked={picked} />
        ))}
        <Line note={send.note} />
        <button type="submit" className="primary" disabled={send.busy || remove.busy}>
          {send.busy ? <Spinner /> : <><UnlockIcon /> Post</>}
        </button>
        {edit && (
          <>
            <Line note={remove.note} />
            <button type="button" className={sure ? 'danger solid' : 'danger'} disabled={send.busy || remove.busy} onClick={() => (sure ? remove.run() : setSure(true))}>
              {remove.busy ? <Spinner /> : sure ? <><UnlockIcon /> Delete</> : 'Delete'}
            </button>
          </>
        )}
      </form>
    </main>
  )
}
