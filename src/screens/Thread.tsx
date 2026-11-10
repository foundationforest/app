// One conversation: the messages between one of the person's profiles and another. At the top, who it
// is with (their avatar, market and role, the badge when their verification checks), to which of
// the person's profiles under it, and Review, for a review, a vouch or a report about them. Then the
// messages, theirs on the card with an edge, the person's own in forest green; a quiet line with
// the day ("Today") wherever the day changes; the time under the last message of each run, quietly.
// At the bottom, the reply: a pill that grows with what is typed and a round Send, which shows its own
// icon (an icon-only button shows what it does) and asks the passkey once: signed with the
// profile's main key, locked to their keys, left with their host and paid from the profile's
// folder; its copy kept in that folder. Reached with the messages not yet opened (a reload), they
// open by themselves with a seed held, else with Open (opening.ts).

import { Fragment, useEffect, useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { send } from '../flows/inbox.ts'
import { useOpened, useProfiles } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { holdThread, looked } from '../opened.ts'
import { useOpening } from '../opening.ts'
import { withSeed } from '../passkey.ts'
import { Line, Named, Top, UnlockIcon, clock, dayWords, lastOfRun, newDay, useAction } from '../ui.tsx'
import { Who, WhoAvatar } from './Who.tsx'

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
  const messages = thread?.messages ?? []
  return (
    <main>
      <Top
        onBack={onBack}
        clear
        right={
          <button className="soft small" onClick={() => onReview(mine, them)}>
            <Icon name="star" bold />
            Review
          </button>
        }
      >
        <span className="convo-head">
          <WhoAvatar address={them} {...(thread && { who: thread.who })} size="sm" />
          <span className="two">
            <Who address={them} {...(thread && { who: thread.who })} avatar={false} />
            <span className="xs">
              to your <Named label={me.label} />
            </span>
          </span>
        </span>
      </Top>
      <div className="fill" />
      <div className="thread">
        {messages.map((m, i) => {
          const before = messages[i - 1]
          return (
            <Fragment key={m.id}>
              {newDay(before?.time, m.time) && <p className="day-line">{dayWords(m.time)}</p>}
              <div className={`said${m.mine ? ' mine' : ''}${before && before.mine !== m.mine ? ' gap' : ''}`}>
                <span className="text">{m.text}</span>
              </div>
              {lastOfRun(messages, i) && (
                <time className={m.mine ? 'stamp mine' : 'stamp'} dateTime={new Date(m.time).toISOString()}>
                  {clock(m.time)}
                </time>
              )}
            </Fragment>
          )
        })}
      </div>
      {thread || held?.all ? (
        <>
          <Line note={reply.note} />
          <div className="composer">
            <textarea aria-label="Message" placeholder="Message" rows={1} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="primary round" aria-label="Send" disabled={reply.busy || !text.trim()} onClick={() => reply.run()}>
              {reply.busy ? <Loader /> : <Icon name="arrow-up" bold />}
            </button>
          </div>
        </>
      ) : seedHeld && !open.note ? (
        <Loader big />
      ) : (
        <>
          <Line note={open.note} />
          <button className="primary" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Loader /> : <><UnlockIcon /> Open</>}
          </button>
        </>
      )}
    </main>
  )
}
