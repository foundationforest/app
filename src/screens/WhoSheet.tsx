// Who a review is about, asked first when Review someone opens from a profile, on a sheet: the
// people that profile has a conversation with, when the messages are open in this page, each by
// their avatar, market and role and badge; then a box for their link or address. Each is checked
// before the sheet closes, as for any review (flows/entries.ts, subjectOf): one that can't be
// reviewed says why in one red line, there. Closed with no one picked, Review someone closes too.

import { useState } from 'react'

import { publicKeyFromAddress } from '@foundationforest/folders'

import { config } from '../config.ts'
import type { Profile } from '../device.ts'
import { addressIn, subjectOf } from '../flows/entries.ts'
import { useOpened } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Line, type Note, Sheet, noteOf } from '../ui.tsx'
import { Who, WhoAvatar } from './Who.tsx'

type Props = { me: Profile; mine: Profile[]; onPick: (address: string) => void; onClose: () => void }

export function WhoSheet({ me, mine, onPick, onClose }: Props) {
  const threads = (useOpened()?.threads ?? []).filter((t) => t.mine === me.address)
  const [typed, setTyped] = useState('')
  const [note, setNote] = useState<Note | null>(null)
  const pick = (address: string) => {
    setNote(null)
    subjectOf(config, me, address, mine).then(
      () => onPick(address),
      (err: unknown) => setNote(noteOf(err)),
    )
  }
  return (
    <Sheet label="Who are you reviewing?" onClose={onClose}>
      <h2>Who are you reviewing?</h2>
      <div className="stack">
        {threads.length > 0 && (
          <div className="rows">
            {threads.map((t) => (
              <button key={t.them} className="row" onClick={() => pick(t.them)}>
                <WhoAvatar address={t.them} who={t.who} size="sm" />
                <Who address={t.them} who={t.who} avatar={false} />
                <Icon name="caret-right" className="car" />
              </button>
            ))}
          </div>
        )}
        <input
          aria-label="Their address"
          placeholder="Their link or address"
          autoComplete="off"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value)
            const address = addressIn(e.target.value)
            if (address && publicKeyFromAddress(address)) pick(address)
            else setNote(null)
          }}
        />
        <Line note={note} />
      </div>
    </Sheet>
  )
}
