// What the screens read from the device and the host, kept fresh: the person's profiles as the
// device keeps them; how each is verified, as its profile entry at the host says; how many new
// entries their inboxes hold; and the messages opened in this page.

import { useEffect, useState } from 'react'

import { config } from './config.ts'
import { CHANGED, type Profile, profiles } from './device.ts'
import { type Check, readCard } from './flows/cards.ts'
import { newCount } from './flows/inbox.ts'
import { onOpened, opened } from './opened.ts'

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

/** How each profile is verified, by address, as the host serves its profile entry; filled in as each answers. */
export function useChecks(list: Profile[]): Record<string, Check[]> {
  const [checks, setChecks] = useState<Record<string, Check[]>>({})
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => {
    let live = true
    for (const p of list) {
      readCard(config, p.address).then(
        (card) => live && card && setChecks((was) => ({ ...was, [p.address]: card.checks })),
        () => undefined,
      )
    }
    return () => void (live = false)
  }, [addresses])
  return checks
}

/** A check's name, as a badge says it. */
export const CHECK_WORDS: Record<Check, string> = { face: 'Face check', id: 'ID check' }

/** How often the inboxes are listed while the app is open. */
const COUNT_EVERY_MS = 30_000

/** The last count, so a screen opening shows it at once. */
let lastCount = 0

/** How many new entries every profile's inbox holds, listed with nothing unlocked: now, every half minute, and whenever the device changes. */
export function useNewCount(): number {
  const list = useProfiles()
  const [count, setCount] = useState(lastCount)
  const addresses = list.map((p) => p.address).join(',')
  useEffect(() => {
    let live = true
    const list = profiles()
    const count = () =>
      newCount(config.host, list).then(
        (n) => live && setCount((lastCount = n)),
        () => undefined,
      )
    void count()
    const every = setInterval(count, COUNT_EVERY_MS)
    addEventListener(CHANGED, count)
    return () => {
      live = false
      clearInterval(every)
      removeEventListener(CHANGED, count)
    }
  }, [addresses])
  return count
}

/** The messages opened in this page, or null. */
export function useOpened() {
  const [held, setHeld] = useState(opened)
  useEffect(() => onOpened(() => setHeld(opened())), [])
  return held
}
