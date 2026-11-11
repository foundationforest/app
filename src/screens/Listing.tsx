// A listing, new or edited, from a profile: an offer or a request, as the profile's role names it.
// At the top, Close, its title in the middle (New offer), the profile's avatar at the right; in a
// beta market, one line under it (BETA, said once where a listing is made). Its form: the market's
// own fields and contact (Field.tsx), in the order form.ts reads from the market's file, each shown
// once the answers it depends on hold and dropped when they no longer do, the photos among them. An
// edit opens with what still fits its market today, so a listing an older market shaped is posted
// again in today's, in place of the old one; each field whose answer no longer fit says so under its
// name until it is answered again. Everything is checked before the unlock (flows/entries.ts); then one unlock
// signs it, writes it and sends its new photos. Its path is set as the form opens, so posting again
// after a photo did not go writes the same listing, never a second. Post stays at the foot as the
// form scrolls; an edit's Delete is under it, in red, asking once more.

import { useRef, useState } from 'react'

import type { Body } from '@foundationforest/folders'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { Field } from '../fields/Field.tsx'
import type { Picked } from '../fields/Photos.tsx'
import { newPhotos, withFiles } from '../flows/photos.ts'
import { type Posted, check, newPath, post, unpost } from '../flows/entries.ts'
import { applies, fitted, formFields, settled } from '../form.ts'
import { useProfiles } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { BETA, kindWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { Line, Top, UnlockIcon, useAction } from '../ui.tsx'

type Props = { me: Profile; edit?: Posted; onDone: () => void; onBack: () => void }

/** A body with what was left out left out. */
export const clean = (body: Body): Body => Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as Body

export function Listing({ me, edit, onDone, onBack }: Props) {
  const mine = useProfiles()
  const { market: name, role } = pairOf(me.label)
  const market = markets.market(name)
  const fields = market ? formFields(market, role) : []
  // What still fits, and which answers didn't, so their fields are marked.
  const [start] = useState(() => (edit ? fitted(name, role, edit.body) : { body: {}, dropped: [] }))
  const [values, setValues] = useState<Body>(start.body)
  const [path] = useState(() => edit?.path ?? newPath('listing'))
  const [sure, setSure] = useState(false)
  const picked = useRef<Picked>(new Map()).current

  const photoFields = fields.filter(([, f]) => f.type === 'file').map(([n]) => n)
  const send = useAction(async () => {
    const bytes = new Map([...picked].map(([sha, p]) => [sha, p.bytes]))
    const body = withFiles(clean(values), photoFields, bytes)
    await check(config, me, 'listing', body, mine)
    await withSeed(passkey()!, (seed) => post(config, seed, me, 'listing', body, path, newPhotos(body, bytes)))
    onDone()
  })
  const remove = useAction(async () => {
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, path))
    onDone()
  })

  // The device keeps no profile in a market the directory doesn't list (markets.ts, `listed`).
  if (!market) return null
  const set = (n: string, v: unknown) => setValues((was) => settled(fields, { ...was, [n]: v as Body[string] }))
  const word = kindWords('listing', me.label)
  return (
    <main>
      <Top onClose={onBack} right={<Avatar label={me.label} size="sm" />}>
        <h1 className="bar-title">{edit ? word : `New ${word.toLowerCase()}`}</h1>
      </Top>
      {market.status === 'beta' && <p className="hint">{BETA}</p>}
      <form
        id="listing"
        className="form"
        onSubmit={(e) => {
          e.preventDefault()
          void send.run()
        }}
      >
        {fields.filter(([, f]) => applies(f, values)).map(([n, f]) => (
          <Field key={n} name={n} field={f} value={values[n]} changed={start.dropped.includes(n) && values[n] === undefined} onChange={(v) => set(n, v)} picked={picked} />
        ))}
      </form>
      <div className="foot">
        <Line note={send.note} />
        <button type="submit" form="listing" className="primary" disabled={send.busy || remove.busy}>
          {send.busy ? <Loader /> : <><UnlockIcon /> Post</>}
        </button>
        {edit && (
          <>
            <Line note={remove.note} />
            <button type="button" className={sure ? 'danger solid' : 'danger'} disabled={send.busy || remove.busy} onClick={() => (sure ? remove.run() : setSure(true))}>
              {remove.busy ? <Loader /> : sure ? <><UnlockIcon /> Delete</> : 'Delete'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
