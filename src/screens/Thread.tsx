// One conversation: the messages between one of the person's profiles and another. At the top, one
// block: their picture with their market's badge (the icon of the person's own profile there); their
// name or short key with their badges, on one line; their market under it, no role, since in a
// market a person talks only with the other side; a tap opening their profile (Them.tsx); and at the
// right Review, for a review, a vouch or a report about them: on a laptop the soft button with its
// star, on a phone, after Back, a round star button. Then the
// messages, theirs on the card with an edge, the person's own in forest green; a quiet line with
// the day ("Today") wherever the day changes; the time under the last message of each run, quietly.
// At the bottom, the reply: a pill that grows with what is typed and a round Send, which shows its own
// icon (an icon-only button shows what it does) and asks the passkey once: signed with the
// profile's main key, locked to their keys, left with their host and paid from the profile's
// folder; its copy kept in that folder. Reached with the messages not yet opened (a reload), they
// open by themselves with a seed held, else with Open (opening.ts). On a laptop it is the right of
// two panes (`pane`, Panes.tsx), the conversations on the left, so it has no Back.

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
import { pairOf } from '../markets.ts'
import { Line, Top, UnlockIcon, clock, dayWords, lastOfRun, newDay, useAction } from '../ui.tsx'
import { Who, WhoAvatar } from './Who.tsx'

type Props = { mine: string; them: string; pane?: boolean; onBack: () => void; onReview: (mine: string, them: string) => void; onWho: (them: string) => void }

export function Thread({ mine, them, pane = false, onBack, onReview, onWho }: Props) {
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
  const Root = pane ? 'div' : 'main'
  return (
    <Root className={pane ? 'pane-body convo' : undefined}>
      <Top
        {...(!pane && { onBack })}
        clear
        right={
          pane ? (
            <button className="soft small" onClick={() => onReview(mine, them)}>
              <Icon name="star" bold />
              Review
            </button>
          ) : (
            <button className="round soft" aria-label="Review" onClick={() => onReview(mine, them)}>
              <Icon name="star" bold />
            </button>
          )
        }
      >
        <button type="button" className="convo-head" onClick={() => onWho(them)}>
          <WhoAvatar address={them} {...(thread && { who: thread.who })} badge={pairOf(me.label).market} {...(!pane && { size: 'sm' as const })} />
          <span className="two">
            <Who address={them} {...(thread && { who: thread.who })} market />
          </span>
        </button>
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
      ) : seedHeld && !open.note ? null : (
        <>
          <Line note={open.note} />
          <button className="primary" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Loader /> : <><UnlockIcon /> Open</>}
          </button>
        </>
      )}
    </Root>
  )
}
