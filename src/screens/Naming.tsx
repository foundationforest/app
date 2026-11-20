// Naming someone, from the chip under their role on their profile (Them.tsx), which opens it in
// place, under the header, and closes it on a second tap: a Name field and Save; and, quietly, that
// only the person sees it. Their full address shows nowhere: their short key, on the chip, is their
// name until they're given one. With a name given, Show the key
// instead takes it back. Saving and taking back write the person's Profiles folder
// (flows/names.ts), so they ask the passkey unless the seed is held, and Save shows the unlock icon
// while a tap will ask.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { NAME_MOST, nameFrom, saveName } from '../flows/names.ts'
import { useNames } from '../hooks.ts'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { Line, UnlockIcon, useAction } from '../ui.tsx'

export function Naming({ address, onClose }: { address: string; onClose: () => void }) {
  const name = useNames()[address]
  const [typed, setTyped] = useState(name ?? '')
  const save = useAction(async (given: string) => {
    // Nothing to save: no name typed, and none given before.
    if (nameFrom(given) !== (name ?? '')) await withSeed(passkey()!, (seed) => saveName(config, seed, address, given))
    onClose()
  })
  return (
    <section className="exp card naming" aria-label="Name them">
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          void save.run(typed)
        }}
      >
        <label className="field">
          <span className="label">Name</span>
          <input value={typed} maxLength={NAME_MOST} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
        </label>
        <p className="xs">Only you see it.</p>
        <Line note={save.note} />
        <button type="submit" className="primary" disabled={save.busy}>
          {save.busy ? <Loader /> : <><UnlockIcon /> Save</>}
        </button>
        {name && (
          <button type="button" className="quiet" disabled={save.busy} onClick={() => void save.run('')}>
            Show the key instead
          </button>
        )}
      </form>
    </section>
  )
}
