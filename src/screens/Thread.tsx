// One thread: the messages between one of the person's profiles and another. At the top, who it is
// from (their market and role, the shield when their verification checks) with which of the
// person's profiles it is with under it, and Review, for a review, a vouch or a report about them;
// then the messages, and the reply. Reply, one unlock: signed with the profile's main key, locked to
// their keys, left with their host and paid from the profile's folder; its copy kept in that folder.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { passkey, profiles, saveCursors } from '../device.ts'
import { openAll, send } from '../flows/inbox.ts'
import { useNewMessages, useOpened, useProfiles } from '../hooks.ts'
import { pairOf } from '../markets.ts'
import { hold, holdThread, looked } from '../opened.ts'
import { withSeed } from '../passkey.ts'
import { checkInWorker } from '../proof/prove.ts'
import { Line, Spinner, Top, UnlockIcon, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { mine: string; them: string; onBack: () => void; onReview: (mine: string, them: string) => void }

export function Thread({ mine, them, onBack, onReview }: Props) {
  const list = useProfiles()
  const me = list.find((p) => p.address === mine)
  const held = useOpened()
  const fresh = useNewMessages()
  const thread = held?.threads.find((t) => t.mine === mine && t.them === them)
  const [text, setText] = useState('')
  useEffect(() => {
    if (thread) looked(thread)
  }, [thread])
  const open = useAction(async () => {
    const ids = Object.values(fresh).flat()
    const got = await withSeed(passkey()!, (seed) => openAll(config, seed, profiles(), checkInWorker))
    hold(got.threads, ids)
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
      <Top
        onBack={onBack}
        right={
          <button className="small" onClick={() => onReview(mine, them)}>
            Review
          </button>
        }
      >
        <span className="two">
          <strong>
            <Who address={them} {...(thread && { who: thread.who })} />
          </strong>
          <span>Your {pairOf(me.label).words}</span>
        </span>
      </Top>
      <div className="thread">
        {thread?.messages.map((m) => (
          <p key={m.id} className={m.mine ? 'said mine' : 'said'}>
            {m.text}
          </p>
        ))}
      </div>
      <div className="fill" />
      {held ? (
        <div className="composer">
          <textarea aria-label="Reply" rows={2} value={text} onChange={(e) => setText(e.target.value)} />
          <Line note={reply.note} />
          <button className="primary" disabled={reply.busy || !text.trim()} onClick={() => reply.run()}>
            {reply.busy ? <Spinner /> : <><UnlockIcon /> Send</>}
          </button>
        </div>
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
