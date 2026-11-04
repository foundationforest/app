// One thread: the messages between one of the person's profiles and another. At the top, who it is
// from (their market and role, the shield when their verification checks) with which of the
// person's profiles it is with under it, and Review, for a review, a vouch or a report about them;
// then the messages, each with the time it was sent, quietly, and a line with the day wherever the
// day changes; and the reply, in one row: the text box and a round Send, which shows its own icon
// (an icon-only button shows what it does) and asks the passkey once: signed with the profile's main
// key, locked to their keys, left with their host and paid from the profile's folder; its copy kept
// in that folder. Reached with the messages not yet opened (a reload), they open by themselves with
// a seed held, else with Open (opening.ts).

import { Fragment, useEffect, useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { send } from '../flows/inbox.ts'
import { useOpened, useProfiles } from '../hooks.ts'
import { holdThread, looked } from '../opened.ts'
import { useOpening } from '../opening.ts'
import { withSeed } from '../passkey.ts'
import { Line, Named, SendIcon, Spinner, Top, UnlockIcon, clock, day, newDay, useAction } from '../ui.tsx'
import { Who } from './Who.tsx'

type Props = { mine: string; them: string; onBack: () => void; onReview: (mine: string, them: string) => void }

export function Thread({ mine, them, onBack, onReview }: Props) {
  const list = useProfiles()
  const me = list.find((p) => p.address === mine)
  const held = useOpened()
  const { open, held: seedHeld } = useOpening()
  const thread = held?.threads.find((t) => t.mine === mine && t.them === them)
  const [text, setText] = useState('')
  useEffect(() => {
    if (thread) looked(thread)
  }, [thread])
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
          <span>
            Your <Named label={me.label} />
          </span>
        </span>
      </Top>
      <div className="thread">
        {thread?.messages.map((m, i) => (
          <Fragment key={m.id}>
            {newDay(thread.messages[i - 1]?.time, m.time) && <p className="day-line">{day(m.time)}</p>}
            <div className={m.mine ? 'said mine' : 'said'}>
              <span className="text">{m.text}</span>
              <time className="sent" dateTime={new Date(m.time).toISOString()}>
                {clock(m.time)}
              </time>
            </div>
          </Fragment>
        ))}
      </div>
      <div className="fill" />
      {thread || held?.all ? (
        <>
          <Line note={reply.note} />
          <div className="composer">
            <textarea aria-label="Reply" rows={1} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="primary round" aria-label="Send" disabled={reply.busy || !text.trim()} onClick={() => reply.run()}>
              {reply.busy ? <Spinner /> : <SendIcon />}
            </button>
          </div>
        </>
      ) : seedHeld && !open.note ? (
        <Spinner />
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
