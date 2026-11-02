// What the screens read from the device and the host, kept fresh: the person's profiles as the
// device keeps them, and how each is verified, as its profile entry at the host says.

import { useEffect, useState } from 'react'

import { config } from './config.ts'
import { CHANGED, type Profile, profiles } from './device.ts'
import { type Check, readCard } from './flows/cards.ts'

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
