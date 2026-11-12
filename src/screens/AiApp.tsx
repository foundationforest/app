// One AI app, opened in place under its row in Your AI (AiApps.tsx), as a passkey opens in Passkeys,
// and closed by a second tap of the row: the person's profiles as ticks, ticked for those it acts for
// (only those the device lists; a profile it has forgotten is not shown, nor counted); then one row
// of buttons, Disconnect at the left, red, asking again in its own place (Disconnect Claude?, with
// Cancel and Disconnect) and Save at the right, which makes the connection act for the ticked ones:
// one unlock, no new login (flows/connections.ts, `actFor`, as the reference app adds and ends a
// key). Ticking changes nothing until Save. The last one stays ticked: its note is what finds the
// connection from the seed, and ending its key deletes it, so a connection left with none could
// never be found again, to tick or to end. Disconnect ends the connection: it stops at once, and
// what the AI wrote stays.

import { useState } from 'react'

import { config } from '../config.ts'
import { type Connection, passkey } from '../device.ts'
import { actFor, end } from '../flows/connections.ts'
import { withSeed } from '../passkey.ts'
import { Loader } from '../mark.tsx'
import { AskAgain, Line, UnlockIcon, useAction } from '../ui.tsx'
import { Ticks } from './Ticks.tsx'

type Props = { conn: Connection; labels: string[]; onDone: () => void }

export function AiApp({ conn, labels, onDone }: Props) {
  // The profiles it acts for among those the device lists.
  const acts = conn.labels.filter((l) => labels.includes(l))
  const [ticked, setTicked] = useState(() => new Set(acts))
  const [asking, setAsking] = useState(false)
  const add = [...ticked].filter((l) => !acts.includes(l))
  const remove = acts.filter((l) => !ticked.has(l))
  const save = useAction(async () => {
    await withSeed(passkey()!, (seed) => actFor(config, seed, conn.address, add, remove))
    onDone()
  })
  const off = useAction(async () => {
    await withSeed(passkey()!, (seed) => end(config, seed, conn.address))
    onDone()
  })
  const working = save.busy || off.busy
  const tick = (label: string) =>
    setTicked((was) => {
      const now = new Set(was)
      if (!now.delete(label)) now.add(label)
      return now
    })
  return (
    <div className="exp" role="group" aria-label={conn.name}>
      <Ticks labels={labels} ticked={ticked} onTick={tick} disabled={working} fixed={ticked.size === 1 ? [...ticked][0]! : null} />
      <Line note={save.note} />
      <div className="exp-buttons">
        <AskAgain words="Disconnect" ask={`Disconnect ${conn.name}?`} unlock busy={off.busy} disabled={save.busy} note={off.note} onAsking={setAsking} onYes={() => off.run()} />
        {!asking && (
          <>
            <span className="grow" />
            <button type="button" className="primary small" disabled={working || add.length + remove.length === 0} onClick={() => save.run()}>
              {save.busy ? <Loader /> : <><UnlockIcon /> Save</>}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
