// What the screens read from the device, the host and the index, kept fresh: the person's profiles
// and AI apps as the device keeps them; how each is verified, as its profile entry at the host says;
// the new entries in their inboxes, one list for the page (list.ts); what the index says of
// each, read as a screen showing it opens and held in the page meanwhile, and what a market outgrew
// of what each posted, the same way; what is new on each;
// whether a profile was made on another device; the messages opened in this page; the passkeys added
// to the Profiles folder (backups, as the standard names them); whether a seed is held in it; and
// whether a newer version of the app is live.

import { useEffect, useState } from 'react'

import { config } from './config.ts'
import { CHANGED, type Connection, type Profile, connections, folder, profiles, seen } from './device.ts'
import { type Card, readCard } from './flows/cards.ts'
import { type Backup, backupsAt } from './flows/backups.ts'
import { anyNew, labelIds } from './flows/elsewhere.ts'
import { type Received, newOf, rate } from './flows/feedback.ts'
import type { Posted } from './flows/entries.ts'
import { onOutgrown, outgrownHeld, readOutgrown } from './flows/outgrown.ts'
import { isHeld, onHeld } from './held.ts'
import { newMessagesList } from './list.ts'
import { onOpened, opened } from './opened.ts'
import { type Held, onRated, ratedOf } from './rated.ts'
import { entryIn, newerLive } from './version.ts'

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

/** Each profile's card, by address, as the host serves its folder: how it is verified and how many listings it holds; filled in as each answers. */
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

/** The new inbox entries of every profile, by address, listed with nothing unlocked: the page's one list (list.ts), followed while the screen is open, the last one shown at once. */
export function useNewMessages(): Record<string, string[]> {
  const [found, setFound] = useState(newMessagesList.last)
  useEffect(() => newMessagesList.follow(setFound), [])
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

/** What a market outgrew of what each profile in `list` posted, when last read in this page. */
export function useHeldOutgrown(list: Profile[]): Record<string, Posted[] | undefined> {
  const [, tick] = useState(0)
  useEffect(() => onOutgrown(() => tick((n) => n + 1)), [])
  return Object.fromEntries(list.map((p) => [p.address, outgrownHeld(p.address)]))
}

/** What a market outgrew of what each profile in `list` posted: read as the screen opens, held in the page meanwhile. */
export function useOutgrown(list: Profile[]): Record<string, Posted[] | undefined> {
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => void readOutgrown(config, list), [addresses])
  return useHeldOutgrown(list)
}

/** What is new on one profile: how many new messages, and the new reviews, vouches and reports. */
export type News = { messages: number; received: Received[] }

/** What is new on each profile in `list`, by address; and in all, how many messages (what the inbox counts) and how many reviews, vouches and reports (what the bell counts, with what a market outgrew). */
export function useNews(list: Profile[]): { of: Record<string, News>; messages: number; received: number } {
  useDevice()
  const messages = useNewMessages()
  const rated = useHeldRated(list)
  const marks = seen()
  const of: Record<string, News> = {}
  let [allMessages, allReceived] = [0, 0]
  for (const p of list) {
    const held = rated[p.address]
    const received = held && 'rated' in held && p.address in marks ? newOf(held.rated, marks[p.address]!) : []
    const n = messages[p.address]?.length ?? 0
    of[p.address] = { messages: n, received }
    allMessages += n
    allReceived += received.length
  }
  return { of, messages: allMessages, received: allReceived }
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

/** The event that has the backups read again: one was added or removed. */
const BACKUPS = 'forest:backups'

/** The backups read again, wherever they show: after one is added or removed. */
export const backupsChanged = () => dispatchEvent(new Event(BACKUPS))

/** The last read of the backups, so a screen opening shows it at once. */
let lastBackups: { address: string; list: Backup[] } | null = null

/** The passkeys added after the first, as the Profiles folder lists them, read with nothing unlocked as a screen opens, again when the page comes back into view, and after one is added or removed; null until read. */
export function useBackups(): Backup[] | null {
  useDevice()
  const address = folder()?.address
  const [list, setList] = useState<Backup[] | null>(() => (lastBackups && lastBackups.address === address ? lastBackups.list : null))
  useEffect(() => {
    if (!address) return
    let live = true
    const look = () =>
      backupsAt(config.host, address).then(
        (found) => {
          lastBackups = { address, list: found }
          if (live) setList(found)
        },
        () => undefined,
      )
    const shown = () => document.visibilityState === 'visible' && void look()
    void look()
    document.addEventListener('visibilitychange', shown)
    addEventListener(BACKUPS, look)
    return () => {
      live = false
      document.removeEventListener('visibilitychange', shown)
      removeEventListener(BACKUPS, look)
    }
  }, [address])
  return address && lastBackups?.address === address ? list : null
}

/** The messages opened in this page, or null. */
export function useOpened() {
  const [held, setHeld] = useState(opened)
  useEffect(() => onOpened(() => setHeld(opened())), [])
  return held
}

/** Whether a seed is held in the page (held.ts): a tap that needs it asks nothing. */
export function useHeld(): boolean {
  const [held, setHeld] = useState(isHeld)
  useEffect(() => onHeld(() => setHeld(isHeld())), [])
  return held
}

/** How often the page asks whether a newer version is live while it is open, besides each time it comes back into view. */
const VERSION_EVERY_MS = 10 * 60_000

/** Whether a newer version of the app than this page's is live (version.ts). Never asked in development, where the page is the source itself. */
export function useNewVersion(): boolean {
  const [newer, setNewer] = useState(false)
  useEffect(() => {
    if (import.meta.env.DEV) return
    const mine = entryIn(document.documentElement.outerHTML)
    let live = true
    const look = () => {
      if (document.visibilityState !== 'visible') return
      void newerLive(mine).then((n) => live && n && setNewer(true))
    }
    const every = setInterval(look, VERSION_EVERY_MS)
    document.addEventListener('visibilitychange', look)
    return () => {
      live = false
      clearInterval(every)
      document.removeEventListener('visibilitychange', look)
    }
  }, [])
  return newer
}
