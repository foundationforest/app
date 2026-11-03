// A profile, opened from its card: its market and role with the shield when it is verified; at the
// top, Share, a sheet with its address and Copy, and its Inbox, with a dot when something there is
// new; the index's rating and how many reviews it counted, which opens Reviews; then its posts, each
// a row with its first photo and its preview (PostRow.tsx), tapped to edit; and a button for a new
// one. Nothing here asks the passkey: its folder is public, and so is what the index says.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Posted, readPosts } from '../flows/posts.ts'
import { useCards, useNews, useProfiles, useRated } from '../hooks.ts'
import { kindWords, markets, pairOf, yourPosts } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Dot, InboxIcon, Line, type Note, Shield, ShareIcon, Sheet, Spinner, Top, noteOf } from '../ui.tsx'
import { PostRow } from './PostRow.tsx'

type Props = { address: string; onBack: () => void; onPost: (edit?: Posted) => void; onReviews: () => void; onInbox: () => void }

export function Profile({ address, onBack, onPost, onReviews, onInbox }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const mine = profile ? [profile] : []
  const card = useCards(mine)[address]
  const held = useRated(mine)[address]
  const news = useNews(mine).of[address]
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [posts, setPosts] = useState<Posted[] | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  useEffect(() => {
    let live = true
    readPosts(config, address).then(
      (p) => live && setPosts(p.filter((x) => x.kind === 'post')),
      (err: unknown) => live && setNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [address])
  if (!profile) return null
  const pair = pairOf(profile.label)
  const market = markets.market(pair.market)
  const rated = held && 'rated' in held ? held.rated : null
  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <main className="with-foot">
      <Top
        onBack={onBack}
        right={
          <>
            <button className="plain" aria-label="Share" onClick={() => setSharing(true)}>
              <ShareIcon />
            </button>
            <button className="plain place-icon" aria-label="Inbox" onClick={onInbox}>
              <InboxIcon />
              {news && (news.messages > 0 || news.received.length > 0) && <Dot />}
            </button>
          </>
        }
      />
      <div className="stack">
        <h1 className="titled">
          {pair.words}
          {card?.checks.length ? <Shield /> : null}
        </h1>
        <button className="link" onClick={onReviews}>
          {held && 'failed' in held ? 'Reviews' : rated?.rating != null ? `★ ${ratingText(rated.rating)} · ${reviewCount(rated.reviews)}` : 'No reviews yet'} ›
        </button>
        {held && 'failed' in held && <p className="line">Can't reach the index.</p>}
      </div>
      <h2>{yourPosts(profile.label)}</h2>
      <Line note={note} />
      {posts === null ? (
        !note && <Spinner />
      ) : (
        <div className="rows">
          {market && posts.map((p) => <PostRow key={p.path} market={market} body={p.body} onClick={() => onPost(p)} />)}
        </div>
      )}
      <div className="foot">
        <button className="primary" onClick={() => onPost()}>
          New {kindWords('post', profile.label).toLowerCase()}
        </button>
      </div>
      {sharing && (
        <Sheet onClose={() => setSharing(false)}>
          <h2>{pair.words}</h2>
          <p className="address">{address}</p>
          <button className="primary" onClick={() => void copy()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </Sheet>
      )}
    </main>
  )
}
