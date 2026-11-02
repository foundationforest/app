// A profile's card: its market and role, how it is verified, Share, which copies the link anyone can
// tap to message it, Post, and what it posted, each with Edit and Delete. An entry an access key
// wrote is marked as your AI's (the AI app's name comes with the connections). Nothing here asks the
// passkey but Delete: the folder is public.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { type Profile, passkey } from '../device.ts'
import { type Posted, readPosts, unpost } from '../flows/posts.ts'
import { CHECK_WORDS, useChecks, useProfiles } from '../hooks.ts'
import { type Kind, KINDS, kindWords, marketWords, markets, pairOf } from '../markets.ts'
import { withSeed } from '../passkey.ts'
import { contactHref, previewLines } from '../show.ts'
import { Line, Spinner, Top, UnlockIcon, noteOf, useAction, type Note } from '../ui.tsx'

type Props = { address: string; onBack: () => void; onPost: (kinds: Kind[], edit?: Posted) => void }

/** The link that opens the app on a new message to the profile at `address`. */
export const shareLink = (address: string) => `${config.app}/message?to=${address}`

export function Card({ address, onBack, onPost }: Props) {
  const list = useProfiles()
  const profile = list.find((p) => p.address === address)
  const checks = useChecks(profile ? [profile] : [])[address] ?? []
  const [copied, setCopied] = useState(false)
  const [posts, setPosts] = useState<Posted[] | null>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [read, setRead] = useState(0)
  useEffect(() => {
    let live = true
    readPosts(config, address).then(
      (p) => live && setPosts(p),
      (err: unknown) => live && setNote(noteOf(err)),
    )
    return () => void (live = false)
  }, [address, read])
  if (!profile) return null
  const pair = pairOf(profile.label)
  const share = async () => {
    await navigator.clipboard.writeText(shareLink(address))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <main>
      <Top onBack={onBack} />
      <div className="stack">
        <h1>{marketWords(pair.market)}</h1>
        <p>{pair.role}</p>
        <span className="badges">
          {checks.map((c) => (
            <span key={c} className="badge">
              {CHECK_WORDS[c]}
            </span>
          ))}
        </span>
      </div>
      <div className="pair">
        <button onClick={() => void share()}>{copied ? 'Copied' : 'Share'}</button>
        <button className="primary" onClick={() => onPost(KINDS)}>
          Post
        </button>
      </div>
      <Line note={note} />
      {posts === null ? (
        !note && <Spinner />
      ) : (
        <div className="posts">
          {posts.map((p) => (
            <Entry key={p.path} me={profile} posted={p} onEdit={() => onPost([p.kind], p)} onDeleted={() => setRead((n) => n + 1)} />
          ))}
        </div>
      )}
    </main>
  )
}

/** One entry the profile posted: its kind, what it says, its contact to tap, the mark of an access key, and Edit and Delete. */
function Entry({ me, posted, onEdit, onDeleted }: { me: Profile; posted: Posted; onEdit: () => void; onDeleted: () => void }) {
  const [sure, setSure] = useState(false)
  const label = me.label
  const market = markets.market(pairOf(label).market)
  const remove = useAction(async () => {
    await withSeed(passkey()!, (seed) => unpost(config, seed, me, posted.path))
    onDeleted()
  })
  const b = posted.body
  const lines = posted.kind === 'post' && market ? previewLines(market, b) : [posted.kind === 'review' && typeof b.score === 'string' ? `${b.score} out of 10` : '', typeof b.text === 'string' ? b.text : ''].filter(Boolean)
  const contact = typeof b.contact === 'string' ? b.contact : null
  const href = contact ? contactHref(contact) : undefined
  return (
    <article className="entry">
      <span className="badges">
        <span className="kind">{kindWords(posted.kind, label)}</span>
        {posted.key && <span className="badge">By your AI</span>}
      </span>
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
      {contact && <p>{href ? <a href={href}>{contact}</a> : contact}</p>}
      <Line note={remove.note} />
      <div className="pair">
        <button onClick={onEdit}>Edit</button>
        <button className={sure ? 'danger' : ''} disabled={remove.busy} onClick={() => (sure ? remove.run() : setSure(true))}>
          {remove.busy ? <Spinner /> : sure ? <><UnlockIcon /> Delete</> : 'Delete'}
        </button>
      </div>
    </article>
  )
}
