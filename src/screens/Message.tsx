// Writing to someone, all of it there from the start: /message?to=<address>, from an index's
// Message link, or Message on someone's profile or a review received, with no conversation open
// with them yet. There is no screen to type or paste an address: who it is to comes with the screen.
// At the top, written from a listing (/message?to=<address>&listing=<listing address>, the listing
// one of theirs), the listing (AboutListing.tsx, `ListingTop`): its first photo, else its market's
// icon on its color, its title, its price, and who posted it, their animal, the name the person
// gave them else their short key, and their rating; else their card: their avatar, who they are to
// the person, with their badges, and their market alone, as everywhere in Messages. Then the message,
// and under it one quiet line, the profile it is sent from, with its market's icon: "From your Goods
// buyer profile", the person's profile on the other side of that profile's market (the same role
// where the market has one); or, when they have none, one line and Create, which makes it, one
// unlock. Send at the foot, one unlock: the message, with `listing` beside its text when it is
// written from one (flows/inbox.ts), then the conversation. When Send can't work, one line says why,
// once. To may be one of the person's own profiles, From their profile on the other side, as for
// anyone's; only where that would be the same profile, in a market with one role, is it refused.

import { useEffect, useState } from 'react'

import { publicKeyFromAddress } from '@foundationforest/folders'

import { MarketIcon, iconOf } from '../avatar.tsx'
import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { type Who as Known, send, whoIs } from '../flows/inbox.ts'
import { makeProfile } from '../flows/profile.ts'
import { addressIn } from '../flows/entries.ts'
import { useHeld, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { otherSide, pairOf } from '../markets.ts'
import { holdThread, opened } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker, proveInWorker } from '../proof/prove.ts'
import { Line, type Note, Top, UnlockIcon, useAction } from '../ui.tsx'
import { ListingTop, isListing } from './AboutListing.tsx'
import { Who, WhoAvatar } from './Who.tsx'

type Props = { to: string; listing?: string; onSent: (mine: string, them: string) => void; onBack: () => void }

const red = (text: string): Note => ({ text, red: true })

export function Message({ to: given, listing: from, onSent, onBack }: Props) {
  const list = useProfiles()
  const seedHeld = useHeld()
  const to = addressIn(given)
  const named = to.length > 0 && publicKeyFromAddress(to) !== null
  // The listing it is written from: one of theirs, by its full address; any other is left out.
  const listing = isListing(from) && from.startsWith(`${to}/listing/`) ? from : undefined
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

  const make = useAction(async () => {
    if (!label) return
    await withSeed(passkey()!, (seed) => makeProfile(config, seed, label, proveInWorker))
  })
  const go = useAction(async () => {
    if (!me || !text.trim()) return
    const sent = await withSeed(passkey()!, (seed) => send(config, seed, me.label, to, text.trim(), listing))
    const was = opened()?.threads.find((t) => t.mine === me.address && t.them === to)
    holdThread({ mine: me.address, them: to, who: who ?? null, messages: [...(was?.messages ?? []), sent] })
    onSent(me.address, to)
  })

  // Why Send can't work: what came with the screen, in red; else what making the profile or sending said.
  const why = !named
    ? red("That isn't a profile's address.")
    : self
      ? red("That's one of your own profiles.")
      : who === null || (who && !label)
        ? red('No profile Forest can message is at this address.')
        : null
  const pair = label ? pairOf(label) : null
  const icon = pair ? iconOf(pair.market) : null
  return (
    <main className="writing">
      <Top onBack={onBack} clear>
        <h1>New message</h1>
      </Top>
      <div className="form">
        {listing ? (
          <ListingTop address={listing} />
        ) : (
          named &&
          who !== null &&
          !self && (
            <div className="person to">
              <WhoAvatar address={to} {...(who !== undefined && { who })} />
              <span className="two">
                <Who address={to} {...(who !== undefined && { who })} market />
              </span>
            </div>
          )
        )}
        <textarea aria-label="Message" placeholder="Message" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        {pair &&
          (me ? (
            <p className="from-line">
              {icon && <MarketIcon name={icon} />}
              From your {pair.words} profile
            </p>
          ) : (
            <div className="from-line">
              {icon && <MarketIcon name={icon} />}
              <span className="grow">You have no {pair.words} profile yet.</span>
              <button className="create" disabled={make.busy} onClick={() => make.run()}>
                {make.busy ? <Loader /> : <>{seedHeld ? <Icon name="plus" bold /> : <UnlockIcon />} Create</>}
              </button>
            </div>
          ))}
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
