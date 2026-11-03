// What the screens read from the device, the host and the index, kept fresh: the person's profiles
// and AI apps as the device keeps them; how each is verified, as its profile entry at the host says; the new
// entries in their inboxes; what the index says of each, read as a screen showing it opens and held
// in the page meanwhile; what is new on each; whether a profile was made on another device; and the
// messages opened in this page.

import { useEffect, useState } from 'react'

import { config } from './config.ts'
import { CHANGED, type Connection, type Profile, connections, folder, profiles, seen } from './device.ts'
import { type Card, readCard } from './flows/cards.ts'
import { anyNew, labelIds } from './flows/elsewhere.ts'
import { newMessages } from './flows/inbox.ts'
import { type Received, newOf, rate } from './flows/reviews.ts'
import { onOpened, opened } from './opened.ts'
import { type Held, onRated, ratedOf } from './rated.ts'

/** A render again whenever what the device keeps changes. */
function useDevice(): void {
  const [, tick] = useState(0)
  useEffect(() => {
    const changed = () => tick((n) => n + 1)
    addEventListener(CHANGED, changed)
    return () => removeEventListener(CHANGED, changed)
  }, [])
}

/** The person's profiles, as this device keeps them, read again whenever that changes. */
export function useProfiles(): Profile[] {
  const [list, setList] = useState(profiles)
  useEffect(() => {
    const changed = () => setList(profiles())
    addEventListener(CHANGED, changed)
    return () => removeEventListener(CHANGED, changed)
  }, [])
  return list
}

/** The person's AI apps, as this device keeps them, read again whenever that changes. */
export function useConnections(): Connection[] {
  const [list, setList] = useState(connections)
  useEffect(() => {
    const changed = () => setList(connections())
    addEventListener(CHANGED, changed)
    return () => removeEventListener(CHANGED, changed)
  }, [])
  return list
}

/** Each profile's card, by address, as the host serves its folder: how it is verified and how many posts it holds; filled in as each answers. */
export function useCards(list: Profile[], again = 0): Record<string, Card> {
  const [cards, setCards] = useState<Record<string, Card>>({})
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => {
    let live = true
    for (const p of list) {
      readCard(config, p.address).then(
        (card) => live && card && setCards((was) => ({ ...was, [p.address]: card })),
        () => undefined,
      )
    }
    return () => void (live = false)
  }, [addresses, again])
  return cards
}

/** How often the inboxes are listed while the app is open. */
const LIST_EVERY_MS = 30_000

/** The last listing, so a screen opening shows it at once. */
let lastMessages: Record<string, string[]> = {}

/** The new inbox entries of every profile, by address, listed with nothing unlocked: now, every half minute, and whenever the device changes. */
export function useNewMessages(): Record<string, string[]> {
  const list = useProfiles()
  const [found, setFound] = useState(lastMessages)
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => {
    let live = true
    const list = profiles()
    const look = () =>
      newMessages(config.host, list).then(
        (ids) => live && setFound((lastMessages = ids)),
        () => undefined,
      )
    void look()
    const every = setInterval(look, LIST_EVERY_MS)
    addEventListener(CHANGED, look)
    return () => {
      live = false
      clearInterval(every)
      removeEventListener(CHANGED, look)
    }
  }, [addresses])
  return found
}

/** What the index said of each profile in `list` when last read in this page, as it is held. */
export function useHeldRated(list: Profile[]): Record<string, Held | undefined> {
  const [, tick] = useState(0)
  useEffect(() => onRated(() => tick((n) => n + 1)), [])
  return Object.fromEntries(list.map((p) => [p.address, ratedOf(p.address)]))
}

/** What the index says of each profile in `list`: read as the screen opens, held in the page meanwhile. */
export function useRated(list: Profile[]): Record<string, Held | undefined> {
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => void rate(config.index, list), [addresses])
  return useHeldRated(list)
}

/** What is new on one profile: how many new messages, and the new reviews, vouches and reports. */
export type News = { messages: number; received: Received[] }

/** What is new on each profile in `list`, by address, and how many new messages in all: what Messages counts. */
export function useNews(list: Profile[]): { of: Record<string, News>; messages: number } {
  useDevice()
  const messages = useNewMessages()
  const rated = useHeldRated(list)
  const marks = seen()
  const of: Record<string, News> = {}
  let total = 0
  for (const p of list) {
    const held = rated[p.address]
    const received = held && 'rated' in held && p.address in marks ? newOf(held.rated, marks[p.address]!) : []
    const n = messages[p.address]?.length ?? 0
    of[p.address] = { messages: n, received }
    total += n
  }
  return { of, messages: total }
}

/** Whether the Profiles folder holds a profile made on another device: its list read with nothing unlocked as the screen opens, and again whenever the page comes back into view. */
export function useElsewhere(): boolean {
  useDevice()
  const kept = folder()
  const address = kept?.address
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    setIds([])
    if (!address) return
    let live = true
    const look = () =>
      labelIds(config.host, address).then(
        (found) => live && setIds(found),
        () => undefined,
      )
    const shown = () => document.visibilityState === 'visible' && void look()
    void look()
    document.addEventListener('visibilitychange', shown)
    return () => {
      live = false
      document.removeEventListener('visibilitychange', shown)
    }
  }, [address])
  return kept !== null && anyNew(ids, kept, new Set(profiles().map((p) => p.label)))
}

/** The messages opened in this page, or null. */
export function useOpened() {
  const [held, setHeld] = useState(opened)
  useEffect(() => onOpened(() => setHeld(opened())), [])
  return held
}
