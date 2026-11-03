// One AI app, from Settings: its name, the person's profiles as checkboxes, ticked for those it acts
// for, and a red Disconnect. Ticking adds a profile and unticking removes one, each with one unlock,
// with no new login (flows/connections.ts, as the reference app adds and ends a key). The last one
// stays ticked: its note is what finds the connection from the seed, and ending its key deletes it,
// so a connection left with none could never be found again, to tick or to end. Disconnect ends the
// connection: it stops at once, and what the AI wrote stays; then back to Settings.

import { useRef, useState } from 'react'

import { config } from '../config.ts'
import { type Connection, passkey } from '../device.ts'
import { addTo, end, removeFrom } from '../flows/connections.ts'
import { useConnections, useProfiles } from '../hooks.ts'
import { withSeed } from '../passkey.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Ticks } from './Ticks.tsx'

type Props = { address: string; onBack: () => void }

export function AiApp({ address, onBack }: Props) {
  const labels = useProfiles().map((p) => p.label)
  const now = useConnections().find((c) => c.address === address)
  // What it showed last, while Disconnect ends its keys after the device has let it go.
  const shown = useRef<Connection | undefined>(now)
  if (now) shown.current = now
  const conn = shown.current
  const [busy, setBusy] = useState<string | null>(null)
  const tick = useAction(async (label: string) => {
    setBusy(label)
    try {
      const change = conn!.labels.includes(label) ? removeFrom : addTo
      await withSeed(passkey()!, (seed) => change(config, seed, address, label))
    } finally {
      setBusy(null)
    }
  })
  const off = useAction(async () => {
    await withSeed(passkey()!, (seed) => end(config, seed, address))
    onBack()
  })
  if (!conn) return null
  const working = tick.busy || off.busy
  return (
    <main>
      <Top onBack={onBack} />
      <h1>{conn.name}</h1>
      <Ticks labels={labels} ticked={new Set(conn.labels)} onTick={(label) => void tick.run(label)} disabled={working} fixed={conn.labels.length === 1 ? conn.labels[0] : null} busy={busy} />
      <Line note={tick.note ?? off.note} />
      <div className="fill" />
      <button className="danger" disabled={working} onClick={() => off.run()}>
        {off.busy ? <Spinner /> : <><UnlockIcon /> Disconnect</>}
      </button>
    </main>
  )
}
