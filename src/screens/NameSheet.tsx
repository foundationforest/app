// Naming someone, from the chip under their role on their profile (Them.tsx): a sheet whose title is
// who they are to the person, the name they gave them or their short key; their full key in a box,
// with Copy; a Name field and Save; and, quietly, that only the person sees it. With a name given,
// Show the key instead takes it back. Saving and taking back write the person's Profiles folder
// (flows/names.ts), so they ask the passkey unless the seed is held, and Save shows the unlock icon
// while a tap will ask.

import { useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { NAME_MOST, nameFrom, saveName } from '../flows/names.ts'
import { useNames } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { Line, Sheet, UnlockIcon, short, useAction } from '../ui.tsx'

export function NameSheet({ address, onClose }: { address: string; onClose: () => void }) {
  const name = useNames()[address]
  const [typed, setTyped] = useState(name ?? '')
  const [copied, setCopied] = useState(false)
  const save = useAction(async (given: string) => {
    // Nothing to save: no name typed, and none given before.
    if (nameFrom(given) !== (name ?? '')) await withSeed(passkey()!, (seed) => saveName(config, seed, address, given))
    onClose()
  })
  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const title = name ?? short(address)
  return (
    <Sheet label={title} onClose={() => !save.busy && onClose()}>
      <h2 className={name ? undefined : 'key'}>{title}</h2>
      <div className="keybox">
        <Icon name="key" />
        <span className="grow">{address}</span>
        <button type="button" className="round clear" aria-label={copied ? 'Copied' : 'Copy'} onClick={() => void copy()}>
          <Icon name={copied ? 'check' : 'copy'} />
        </button>
      </div>
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
    </Sheet>
  )
}
