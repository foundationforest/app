// The connect page, where the connector sends the browser when an AI app logs in
// (/connect?connector=<origin>&request=<request>, moved into the page's history at once: App.tsx).
// Only this app's connector: for any other, one line and nothing else. At the top, the AI app's name,
// big, and under it the host it sends the person back to: a name is what the AI app calls itself,
// the host is what says which app it really is. Then the person's profiles as checkboxes, none
// ticked unless they have just one; Connect, once one is ticked, asks the passkey once, makes the
// connection (flows/connect.ts) and sends the browser back to the connector; Cancel sends it back
// with no. A request lasts 10 minutes: one that ran out says so, in one line, before anything is
// asked.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { connect, ranOut, readRequest } from '../flows/connect.ts'
import { useProfiles } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { backTo } from '../services/connector.ts'
import { Line, Quiet, UnlockIcon, useAction } from '../ui.tsx'
import { Ticks } from './Ticks.tsx'

const TOO_LONG = 'This took too long. Start again from your AI app.'

/** Why the connect page can't go on for this login, in one line; or null. */
export function blocked(connector: string, request: string): string | null {
  if (connector !== config.connector) return `Forest connects only to ${new URL(config.connector).host} for now.`
  const asked = readRequest(request)
  if (!asked) return 'Start again from your AI app.'
  return ranOut(asked) ? TOO_LONG : null
}

type Props = { connector: string; request: string }

export function Connect({ connector, request }: Props) {
  const labels = useProfiles().map((p) => p.label)
  const [ticked, setTicked] = useState(() => new Set(labels.length === 1 ? labels : []))
  const [leaving, setLeaving] = useState(false)
  const asked = readRequest(request)
  const go = useAction(async () => {
    if (!asked || ranOut(asked)) throw new Quiet(TOO_LONG)
    const to = await withSeed(passkey()!, (seed) => connect(config, seed, request, labels.filter((l) => ticked.has(l))))
    setLeaving(true)
    location.replace(to)
  })
  const why = blocked(connector, request)
  if (why || !asked) {
    return (
      <main>
        <div className="fill" />
        <p className="line">{why}</p>
        <div className="fill" />
      </main>
    )
  }
  const busy = go.busy || leaving
  const tick = (label: string) =>
    setTicked((was) => {
      const next = new Set(was)
      if (!next.delete(label)) next.add(label)
      return next
    })
  return (
    <main>
      <div className="stack">
        <h1 className="big">{asked.name}</h1>
        <p>{asked.from}</p>
      </div>
      <Ticks labels={labels} ticked={ticked} onTick={tick} disabled={busy} />
      <div className="fill" />
      <Line note={go.note} />
      <button className="primary" disabled={ticked.size === 0 || busy} onClick={() => go.run()}>
        {busy ? <Loader /> : <><UnlockIcon /> Connect</>}
      </button>
      <button className="quiet" disabled={busy} onClick={() => location.replace(backTo(connector, request, 'no'))}>
        Cancel
      </button>
    </main>
  )
}
