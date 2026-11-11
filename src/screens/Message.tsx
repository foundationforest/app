// A new message, all of it there from the start. To: a box for an address or a Share link (a
// profile's page on the index, as Share hands it out), until it holds a profile; then their card,
// their avatar, who they are to the person (the name they gave them, else their short key) with
// their badges, and their market and role, with a cross to change it.
// It comes filled in when an address came with the screen (/message?to=<address>, or Message on a
// review received). From: the card of the person's profile on the other side of that profile's
// market (the same role where the market has one), picked for them, with its badges, from its
// card; or, when they have none, that profile to make, New profile, one unlock. The message, and Send at the foot, one unlock. When Send can't work, one line says why,
// once. To may be one of the person's own profiles, From their profile on the other side, as for
// anyone's; only where that would be the same profile, in a market with one role, is it refused.

import { useEffect, useState } from 'react'

import { publicKeyFromAddress } from '@foundationforest/folders'

import { Avatar } from '../avatar.tsx'
import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Who as Known, send, whoIs } from '../flows/inbox.ts'
import { makeProfile } from '../flows/profile.ts'
import { addressIn } from '../flows/entries.ts'
import { useCards, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { otherSide } from '../markets.ts'
import { holdThread, opened } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker, proveInWorker } from '../proof/prove.ts'
import { Badges, Line, Named, type Note, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Who, WhoAvatar } from './Who.tsx'

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
      <Top onBack={onBack} clear>
        <h1>New message</h1>
      </Top>
      <div className="form">
        <div className="field">
          <span className="label">To</span>
          {named && who !== null && !self ? (
            <div className="person to">
              <WhoAvatar address={to} {...(who !== undefined && { who })} />
              <span className="two">
                <Who address={to} {...(who !== undefined && { who })} />
              </span>
              <button type="button" className="round clear" aria-label="Change" onClick={() => setTyped('')}>
                <Icon name="x" />
              </button>
            </div>
          ) : (
            <input aria-label="To" placeholder="Their link or address" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} />
          )}
        </div>
        {label && (
          <div className="field">
            <span className="label">From</span>
            <div className="person from">
              <Avatar label={label} {...(me && { address: me.address })} />
              <span className="two">
                <span className="who-name">
                  <Named label={label} />
                  {me && card && <Badges checks={card.checks} />}
                </span>
              </span>
              {!me && (
                <button className="small" disabled={make.busy} onClick={() => make.run()}>
                  {make.busy ? <Loader /> : <><UnlockIcon /> New profile</>}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="field">
          <span className="label">Message</span>
          <textarea aria-label="Message" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      </div>
      <div className="foot">
        <Line note={why ?? make.note ?? go.note} />
        <button className="primary" disabled={go.busy || !me || !text.trim()} onClick={() => go.run()}>
          {go.busy ? <Loader /> : <><UnlockIcon /> Send</>}
        </button>
      </div>
    </main>
  )
}
