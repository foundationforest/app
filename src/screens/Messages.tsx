// Messages: one inbox for all the person's profiles. How many new entries they hold shows with
// nothing unlocked (Places); one unlock opens every profile's inbox and what it sent, into threads,
// newest first, each showing who it is from and which of the person's profiles it is to. They stay
// open while the page is; new ones since are one more unlock.

import { config } from '../config.ts'
import { passkey, saveCursors } from '../device.ts'
import { openAll } from '../flows/inbox.ts'
import { useNewCount, useOpened, useProfiles } from '../hooks.ts'
import { pairOf } from '../markets.ts'
import { hold } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Line, type Place, Places, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { go: (to: Place) => void; onThread: (mine: string, them: string) => void }

export function Messages({ go, onThread }: Props) {
  const list = useProfiles()
  const held = useOpened()
  const count = useNewCount()
  const open = useAction(async () => {
    const got = await withSeed(passkey()!, (seed) => openAll(config, seed, list, checkInWorker))
    hold(got.threads)
    saveCursors(got.cursors)
  })
  const yours = (address: string) => list.find((p) => p.address === address)
  return (
    <main>
      <Top>
        <h1>Messages</h1>
      </Top>
      {held && (
        <div className="cards">
          {held.threads.map((t) => (
            <button key={`${t.mine} ${t.them}`} className="card" onClick={() => onThread(t.mine, t.them)}>
              <strong>
                <Who address={t.them} who={t.who} />
              </strong>
              <span>To your {pairOf(yours(t.mine)?.label ?? '').words}</span>
              <span className="last">{t.messages.at(-1)?.text}</span>
            </button>
          ))}
          {held.threads.length === 0 && <p className="line">No messages yet.</p>}
        </div>
      )}
      <div className="fill" />
      <Line note={open.note} />
      {(!held || count > 0) && list.length > 0 && (
        <button className="primary" disabled={open.busy} onClick={() => open.run()}>
          {open.busy ? <Spinner /> : <><UnlockIcon /> Open</>}
        </button>
      )}
      <Places at="messages" go={go} />
    </main>
  )
}
