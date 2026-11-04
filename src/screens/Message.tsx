// A new message, all of it there from the start. To: an address or a Share link, filled in when one
// came with the screen (/message?to=<address>, or Message on a review received), or a profile's page
// on the index, as Share hands it out; under it, once it is a profile, who it is (its market and
// role, the shield). From: the person's profile on the other
// side of that profile's market (the same role where the market has one), picked for them, or New
// profile when they have none, one unlock. The message, and Send, one unlock. When Send can't work,
// one line says why, once. To may be one of the person's own profiles, From their profile on the
// other side, as for anyone's; only where that would be the same profile, in a market with one
// role, is it refused. From shows the shield of that profile's strongest check, from its card.

import { useEffect, useState } from 'react'

import { publicKeyFromAddress } from '@foundationforest/folders'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Who as Known, send, whoIs } from '../flows/inbox.ts'
import { makeProfile } from '../flows/profile.ts'
import { strongest } from '../flows/cards.ts'
import { addressIn } from '../flows/entries.ts'
import { useCards, useProfiles } from '../hooks.ts'
import { otherSide } from '../markets.ts'
import { holdThread, opened } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker, proveInWorker } from '../proof/prove.ts'
import { Line, Named, type Note, Spinner, Top, UnlockIcon, Verified, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { to?: string; onSent: (mine: string, them: string) => void; onBack: () => void }

const red = (text: string): Note => ({ text, red: true })

export function Message({ to: given, onSent, onBack }: Props) {
  const list = useProfiles()
  const [typed, setTyped] = useState(given ?? '')
  const to = addressIn(typed)
  const named = to.length > 0 && publicKeyFromAddress(to) !== null
  const [who, setWho] = useState<Known | undefined>(undefined)
  const [text, setText] = useState('')
  useEffect(() => {
    setWho(undefined)
    if (!named) return
    let live = true
    whoIs(config, to, checkInWorker).then(
      (r) => live && setWho(r.who),
      () => live && setWho(null),
    )
    return () => void (live = false)
  }, [to])
  const side = who ? otherSide(who.market, who.role)[0] : undefined
  // The profile it would be sent from is the one it is to: a market with one role, and To is the person's own.
  const self = !!side && list.some((p) => p.address === to && p.label === `${who!.market}/${side}`)
  const label = !self && who && side ? `${who.market}/${side}` : null
  const me = label ? list.find((p) => p.label === label) : undefined
  const card = useCards(me ? [me] : [])[me?.address ?? '']
  const fromCheck = card ? strongest(card.checks) : null

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

  // Why Send can't work: what was given, in red; else what making the profile or sending said.
  const why = !typed.trim()
    ? null
    : !named
      ? red("That isn't a profile's address.")
      : self
        ? red("That's one of your own profiles.")
        : who === null || (who && !label)
          ? red('No profile Forest can message is at this address.')
          : null
  return (
    <main>
      <Top onBack={onBack}>
        <h1>New message</h1>
      </Top>
      <div className="form">
        <div className="field">
          <span className="label">To</span>
          <input aria-label="To" placeholder="Their address" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
          {named && !self && <Who address={to} {...(who !== undefined && { who })} />}
        </div>
        <div className="field">
          <span className="label">From</span>
          {label ? (
            <div className="from">
              <span className="who">
                <Named label={label} />
                {me && fromCheck && <Verified check={fromCheck} />}
              </span>
              {!me && (
                <button className="small" disabled={make.busy} onClick={() => make.run()}>
                  {make.busy ? <Spinner /> : <><UnlockIcon /> New profile</>}
                </button>
              )}
            </div>
          ) : (
            <span className="quiet-text">–</span>
          )}
        </div>
        <textarea aria-label="Message" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        <Line note={why ?? make.note ?? go.note} />
        <button className="primary" disabled={go.busy || !me || !text.trim()} onClick={() => go.run()}>
          {go.busy ? <Spinner /> : <><UnlockIcon /> Send</>}
        </button>
      </div>
    </main>
  )
}
