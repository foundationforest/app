// One conversation: the messages between one of the person's profiles and another. At the top, one
// header line: Back (on a phone), to where it was opened from (Messages, an offer, a profile's
// messages); their picture with their market's badge (the icon of the person's own profile there);
// their name or short key, no market and no badges (their profile says them); a tap opening their
// profile (Them.tsx); and at the right Review, outlined, its star in the sun, for a review, a vouch
// or a report about them. Then, when a message in it was written from a listing of theirs or of the
// person's own there, the first such names it, pinned under the header as a small card
// (AboutListing.tsx): its photo, title and price, a tap opening it, the person's own listing's page
// (`onOffer`), or theirs on the index; or No longer listed. A listing of anyone else is left out
// (about.ts). Then the messages, theirs on the card with an
// edge, the person's own on the soft green, in ink; a quiet line with the day ("Today") wherever the
// day changes; the time under the last message of each run, quietly.
// At the bottom, the reply, with nothing before it: a pill that grows with what is typed and a round Send, strong green, its
// icon an up arrow (an icon-only button shows what it does), which asks the passkey once: signed with the
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
import { useOpening, useSeen } from '../opening.ts'
import { withSeed } from '../passkey.ts'
import { pairOf } from '../markets.ts'
import { Line, Top, UnlockIcon, clock, dayWords, lastOfRun, newDay, useAction } from '../ui.tsx'
import { aboutOf } from '../about.ts'
import { PinnedListing } from './AboutListing.tsx'
import { NameOf, WhoAvatar } from './Who.tsx'

type Props = { mine: string; them: string; pane?: boolean; onBack: () => void; onReview: (mine: string, them: string) => void; onWho: (them: string) => void; onOffer?: (path: string) => void }

export function Thread({ mine, them, pane = false, onBack, onReview, onWho, onOffer }: Props) {
  const list = useProfiles()
  const me = list.find((p) => p.address === mine)
  const held = useOpened()
  const { open, held: seedHeld } = useOpening()
  const thread = held?.threads.find((t) => t.mine === mine && t.them === them)
  useSeen(!!thread)
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
  // The listing the conversation is about: the one the first message written from one of theirs, or of the person's own, names.
  const about = aboutOf(messages, mine, them)
  const Root = pane ? 'div' : 'main'
  return (
    <Root className={pane ? 'pane-body convo' : undefined}>
      <Top
        {...(!pane && { onBack })}
        clear
        right={
          <button className="small" onClick={() => onReview(mine, them)}>
            <Icon name="star" fill className="sun" />
            Review
          </button>
        }
      >
        <button type="button" className="convo-head" onClick={() => onWho(them)}>
          <WhoAvatar address={them} {...(thread && { who: thread.who })} badge={pairOf(me.label).market} {...(!pane && { size: 'sm' as const })} />
          <NameOf address={them} />
        </button>
      </Top>
      {about && <PinnedListing address={about} mine={mine} {...(onOffer && { onMine: onOffer })} />}
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
