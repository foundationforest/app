// One thread: the messages between one of the person's profiles and another, who it is from (their
// market and role, and Verified when their verification checks) and which profile of the person's
// it is to. Reply, one unlock: signed with the profile's main key, locked to their keys, left with
// their host and paid from the profile's folder; its copy kept in that folder. Post: a review, a
// vouch or a report about them.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey, saveCursors } from '../device.ts'
import { openAll, send } from '../flows/inbox.ts'
import { useOpened, useProfiles } from '../hooks.ts'
import { pairOf } from '../markets.ts'
import { hold, holdThread } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { mine: string; them: string; onBack: () => void; onPost: (mine: string, them: string) => void }

export function Thread({ mine, them, onBack, onPost }: Props) {
  const list = useProfiles()
  const me = list.find((p) => p.address === mine)
  const held = useOpened()
  const thread = held?.threads.find((t) => t.mine === mine && t.them === them)
  const [text, setText] = useState('')
  const open = useAction(async () => {
    const got = await withSeed(passkey()!, (seed) => openAll(config, seed, list, checkInWorker))
    hold(got.threads)
    saveCursors(got.cursors)
  })
  const reply = useAction(async () => {
    if (!me || !text.trim()) return
    const sent = await withSeed(passkey()!, (seed) => send(config, seed, me.label, them, text.trim()))
    holdThread({ mine, them, who: thread?.who ?? null, messages: [...(thread?.messages ?? []), sent] })
    setText('')
  })
  if (!me) return null
  return (
    <main>
      <Top onBack={onBack}>
        <strong>
          <Who address={them} {...(thread && { who: thread.who })} />
        </strong>
      </Top>
      <p>To your {pairOf(me.label).words}</p>
      <div className="thread">
        {thread?.messages.map((m) => (
          <p key={m.id} className={m.mine ? 'said mine' : 'said'}>
            {m.text}
          </p>
        ))}
      </div>
      <div className="fill" />
      {held ? (
        <>
          <textarea aria-label="Reply" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          <Line note={reply.note} />
          <div className="pair">
            <button onClick={() => onPost(mine, them)}>Post</button>
            <button className="primary" disabled={reply.busy || !text.trim()} onClick={() => reply.run()}>
              {reply.busy ? <Spinner /> : <><UnlockIcon /> Send</>}
            </button>
          </div>
        </>
      ) : (
        <>
          <Line note={open.note} />
          <button className="primary" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Spinner /> : <><UnlockIcon /> Open</>}
          </button>
        </>
      )}
    </main>
  )
}
