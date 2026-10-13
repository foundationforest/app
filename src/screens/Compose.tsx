// A new message, from the message door (/message?to=<address>): who it is to, which of the person's
// profiles sends it (one in the same market first), the text, and Send, with one face. It is sealed
// to that card's inbox key, signed by the sending profile's main key, and copied to its own inbox.

import { useEffect, useState } from 'react'

import { marketOf, roleWord, short, splitLabel, words } from '../cards.ts'
import { withFace } from '../face.ts'
import { knownHosts, send } from '../flows/messages.ts'
import type { LocalProfile } from '../local.ts'
import { settings } from '../settings.ts'
import { Spinner, useAction } from '../ui.tsx'
import { useCardName } from './Inbox.tsx'
import { Sheet } from './Sheets.tsx'

/** One of the person's profiles, as the board names it: its market, and its role's word. */
function Own({ p }: { p: LocalProfile }) {
  const { market, role } = splitLabel(p.label)
  const [word, setWord] = useState(role)
  useEffect(() => {
    marketOf(settings().index, market).then((m) => setWord(roleWord(role, m)), () => undefined)
  }, [p.label])
  return <>{`${words(market)} ${word}`}</>
}

export function Compose({ to, profiles, onClose }: { to: string; profiles: LocalProfile[]; onClose: () => void }) {
  const them = useCardName(to)
  const [from, setFrom] = useState(profiles[0]?.address)
  const [text, setText] = useState('')
  const [picked, setPicked] = useState(false)
  // A profile in the recipient's market sends, unless the person picked another.
  useEffect(() => {
    const same = profiles.find((p) => splitLabel(p.label).market === them.market)
    if (!picked && same) setFrom(same.address)
  }, [them.market])
  const p = profiles.find((x) => x.address === from)
  const go = useAction(async () => {
    await withFace((seed) => send(seed, p!, to, { text: text.trim() }, knownHosts(settings().host, profiles)))
    onClose()
  })

  return (
    <Sheet label="Message" busy={go.busy} onClose={onClose}>
      <form
        className="sheet-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (p && text.trim()) void go.run()
        }}
      >
        <span>
          <strong style={{ display: 'block' }}>{them.name ?? short(to)}</strong>
          {them.name && <span className="sub">{short(to)}</span>}
        </span>
        <div className="choices" role="radiogroup" aria-label="From">
          {profiles.map((x) => (
            <button
              type="button"
              key={x.address}
              role="radio"
              aria-checked={x.address === from}
              className={x.address === from ? 'on' : ''}
              onClick={() => {
                setPicked(true)
                setFrom(x.address)
              }}
            >
              <Own p={x} />
            </button>
          ))}
        </div>
        <textarea className="field" rows={5} placeholder="Message" aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
        {go.error && <p className="error">{go.error}</p>}
        <button className="primary" disabled={!p || !text.trim() || go.busy}>
          {go.busy ? <Spinner /> : 'Send'}
        </button>
      </form>
    </Sheet>
  )
}
