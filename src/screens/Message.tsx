// A new message to the profile a Share link names (/message?to=<address>): from the person's profile
// on the other side of that profile's market (the same role where the market has one), or, when
// they have none, New profile first. Then the text, and one unlock sends it.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Who as Known, whoIs } from '../flows/inbox.ts'
import { send } from '../flows/inbox.ts'
import { makeProfile } from '../flows/profile.ts'
import { useProfiles } from '../hooks.ts'
import { otherSide, pairOf } from '../markets.ts'
import { holdThread, opened } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker, proveInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { to: string; onSent: (mine: string, them: string) => void; onBack: () => void }

export function Message({ to, onSent, onBack }: Props) {
  const list = useProfiles()
  const [who, setWho] = useState<Known | undefined>(undefined)
  const [text, setText] = useState('')
  useEffect(() => {
    let live = true
    whoIs(config, to, checkInWorker).then(
      (r) => live && setWho(r.who),
      () => live && setWho(null),
    )
    return () => void (live = false)
  }, [to])
  const side = who ? otherSide(who.market, who.role)[0] : undefined
  const label = who && side ? `${who.market}/${side}` : null
  const me = label ? list.find((p) => p.label === label) : undefined

  const make = useAction(async () => {
    if (!label) return
    await withSeed(passkey()!, (seed) => makeProfile(config, seed, label, proveInWorker))
  })
  const go = useAction(async () => {
    if (!me || !text.trim()) return
    const sent = await withSeed(passkey()!, (seed) => send(config, seed, me.label, to, text.trim()))
    const was = opened()?.threads.find((t) => t.mine === me.address && t.them === to)
    holdThread({ mine: me.address, them: to, who: who ?? null, messages: [...(was?.messages ?? []), sent] })
    onSent(me.address, to)
  })

  const own = list.some((p) => p.address === to)
  return (
    <main>
      <Top onBack={onBack}>
        <strong>
          <Who address={to} {...(who !== undefined && { who })} />
        </strong>
      </Top>
      <div className="fill" />
      {who === undefined ? null : own ? (
        <p className="line">This is one of your own profiles.</p>
      ) : !who || !label ? (
        <p className="line red">No profile Forest can message is at this address.</p>
      ) : !me ? (
        <>
          <Line note={make.note} />
          <button className="primary" disabled={make.busy} onClick={() => make.run()}>
            {make.busy ? <Spinner /> : <><UnlockIcon /> New profile: {pairOf(label).words}</>}
          </button>
        </>
      ) : (
        <>
          <p>From your {pairOf(me.label).words}</p>
          <textarea aria-label="Message" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          <Line note={go.note} />
          <button className="primary" disabled={go.busy || !text.trim()} onClick={() => go.run()}>
            {go.busy ? <Spinner /> : <><UnlockIcon /> Send</>}
          </button>
        </>
      )}
    </main>
  )
}
