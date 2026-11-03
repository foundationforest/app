// A profile, opened from its card: its market and role with the shield when it is verified; at the
// top, Share, and its messages, with a dot when one is new. Share hands out the profile's page on
// the index: the phone's share sheet where there is one, else the page's link copied. A link, not a
// fetch: nothing here reaches the index for it. Then the index's rating, how many reviews it
// counted, and how many reviews, vouches and reports are new, which opens Reviews; then its posts,
// each a row with its first photo and its preview (PostRow.tsx), tapped to edit; and at the bottom,
// side by side, Review, which opens Review someone, and a new post in its role's word. Nothing here
// asks the passkey: its folder is public, and so is what the index says.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Posted, readPosts } from '../flows/posts.ts'
import { useCards, useNews, useProfiles, useRated } from '../hooks.ts'
import { kindWords, markets, pairOf, yourPosts } from '../markets.ts'
import { ratingText, reviewCount } from '../show.ts'
import { Dot, Line, MessageIcon, Named, type Note, Shield, Spinner, Top, noteOf } from '../ui.tsx'
import { PostRow } from './PostRow.tsx'

type Props = { address: string; onBack: () => void; onPost: (edit?: Posted) => void; onReviews: () => void; onReview: () => void; onMessages: () => void }

/** A profile's page on the index: what Share hands out. */
const pageOf = (address: string) => `${config.index}/profiles/${address}`

export function Profile({ address, onBack, onPost, onReviews, onReview, onMessages }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const mine = profile ? [profile] : []
  const card = useCards(mine)[address]
  const held = useRated(mine)[address]
  const news = useNews(mine).of[address]
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
  /** The phone's share sheet, with the profile's page; where there is none, the page's link copied. A sheet closed with no answer is no error. */
  const share = async () => {
    const url = pageOf(address)
    if (typeof navigator.share === 'function') return navigator.share({ url }).catch(() => undefined)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const fresh = news?.received.length ?? 0
  return (
    <main className="with-foot">
      <Top
        onBack={onBack}
        right={
          <>
            <button className="small" onClick={() => void share()}>
              {copied ? 'Copied' : 'Share'}
            </button>
            <button className="plain place-icon" aria-label="Messages" onClick={onMessages}>
              <MessageIcon />
              {!!news?.messages && <Dot />}
            </button>
          </>
        }
      />
      <div className="stack">
        <h1 className="titled">
          <Named label={profile.label} />
          {card?.checks.length ? <Shield /> : null}
        </h1>
        <button className="link" onClick={onReviews}>
          {held && 'failed' in held ? 'Reviews' : rated?.rating != null ? `★ ${ratingText(rated.rating)} · ${reviewCount(rated.reviews)}` : 'No reviews yet'}
          {fresh > 0 && (
            <>
              {' · '}
              <strong>{fresh} new</strong>
            </>
          )}{' '}
          ›
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
      <div className="foot pair">
        <button onClick={onReview}>Review</button>
        <button className="primary" onClick={() => onPost()}>
          New {kindWords('post', profile.label).toLowerCase()}
        </button>
      </div>
    </main>
  )
}
