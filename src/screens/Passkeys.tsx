// Passkeys, from You: every passkey that opens the person's profiles, in one card, read with nothing
// unlocked. Their first passkey, the one the seed comes from, with a mint Main chip; then each added
// after it (a backup, as the standard names it), oldest first. Each a row: a square with its maker's
// logo (Apple's, Google's, else a key), its name, a chevron. Its name is the one the person gave it
// on this device, else its maker's, read from the id it sent as it was made (managers.ts), else
// Passkey; a name shown already takes the next number (Apple 2). With one alone, a quiet line on why
// a second. Then Add a passkey (AddPasskey.tsx). A row opens its sheet: the name as its title, a Name
// field and Save, kept on this device alone, asking nothing; and, on any passkey but the first, Remove
// this passkey, in red, tapped twice, then one unlock. The first is the seed itself: the app never
// removes it, so its sheet has no Remove. Under If you lose every passkey, Your 24 words, which opens
// a sheet: its warning, and Show words, which always asks the passkey, even with the seed held, so a
// device someone else picks up while it is held never shows them; then the words, handed to Your 24
// words (Words.tsx) in the page's memory alone. A passkey prompt must come from a tap, so it is asked
// here, on the sheet's button, not as the next screen opens.

import { useState } from 'react'

import { exportWords } from '@foundationforest/keys'

import { config } from '../config.ts'
import { FIRST, madeHere, nameMade, passkey } from '../device.ts'
import { removeBackup } from '../flows/backups.ts'
import { seedFor } from '../flows/seed.ts'
import { backupsChanged, useBackups } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { logoOf, nameOf, numbered } from '../managers.ts'
import { Loader } from '../mark.tsx'
import { ask, withSeed } from '../passkey.ts'
import { Line, Opens, Sheet, Top, UnlockIcon, useAction } from '../ui.tsx'

/** The line that says why a second passkey, while there is one alone. */
const WHY_SECOND = "Add a second, so losing one doesn't lose your profiles."

/** What the sheet before the words warns. */
export const WARNING = 'Anyone who sees them can act as you. Write them on paper and keep it somewhere safe.'

type Props = { onBack: () => void; onAdd: () => void; onWords: (words: string[]) => void }

export function Passkeys({ onBack, onAdd, onWords }: Props) {
  const backups = useBackups()
  const made = madeHere()
  const ids = backups ? [FIRST, ...backups.map((b) => b.id)] : null
  const shown = ids ? numbered(ids.map((id) => nameOf(made[id]))) : []
  // The passkey whose sheet is open, by its id; and whether its Remove was tapped once.
  const [open, setOpen] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [removing, setRemoving] = useState(false)
  const remove = useAction(async (id: string) => {
    await withSeed(passkey()!, (seed) => removeBackup(config, seed, id))
    shut()
    backupsChanged()
  })
  const [sheet, setSheet] = useState(false)
  const show = useAction(async () => {
    const seed = await seedFor(config.host, (await ask({ allow: [passkey()!] })).seed)
    let words: string[]
    try {
      words = exportWords(seed).split(' ')
    } finally {
      seed.fill(0)
    }
    setSheet(false)
    onWords(words)
  })
  const close = () => {
    if (show.busy) return
    setSheet(false)
    show.setNote(null)
  }
  const at = open && ids ? ids.indexOf(open) : -1
  const opening = (id: string, i: number) => {
    setOpen(id)
    setTyped(shown[i]!)
    setRemoving(false)
    remove.setNote(null)
  }
  function shut() {
    setOpen(null)
    setRemoving(false)
  }
  const save = () => {
    nameMade(open!, typed)
    shut()
  }
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Passkeys</h1>
      </Top>
      {ids && (
        <div className="rows" role="list" aria-label="Your passkeys">
          {ids.map((id, i) => (
            <button key={id} className="row passkey" role="listitem" onClick={() => opening(id, i)}>
              <span className="sq sm plain">
                <Icon name={logoOf(made[id]?.maker)} fill={made[id]?.maker === 'Apple'} bold={made[id]?.maker === 'Google'} />
              </span>
              <span className="grow named-row">
                <strong>{shown[i]}</strong>
                {id === FIRST && <span className="mainchip">Main</span>}
              </span>
              <Icon name="caret-right" className="car" />
            </button>
          ))}
          <Opens icon="plus" words="Add a passkey" green onClick={onAdd} />
        </div>
      )}
      {backups?.length === 0 && <p className="line">{WHY_SECOND}</p>}
      {open && at >= 0 && (
        <Sheet label={shown[at]!} onClose={() => !remove.busy && shut()}>
          <h2>{shown[at]}</h2>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <label className="field">
              <span className="label">Name</span>
              <input value={typed} maxLength={40} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
            </label>
            <button type="submit" className="primary" disabled={remove.busy}>
              Save
            </button>
            {open !== FIRST && (
              <>
                <Line note={remove.note} />
                <button type="button" className={removing ? 'danger solid' : 'danger text'} disabled={remove.busy} onClick={() => (removing ? remove.run(open) : setRemoving(true))}>
                  {remove.busy ? (
                    <Loader />
                  ) : (
                    <>
                      {removing ? <UnlockIcon /> : <Icon name="trash" />} Remove this passkey
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        </Sheet>
      )}
      <h2>If you lose every passkey</h2>
      <div className="rows">
        <Opens icon="list-numbers" words="Your 24 words" line="Write them down to get back in" onClick={() => setSheet(true)} />
      </div>
      {sheet && (
        <Sheet label="Show your 24 words?" onClose={close}>
          <span className="sq red">
            <Icon name="warning" fill />
          </span>
          <h2>Show your 24 words?</h2>
          <p className="sheet-line">{WARNING}</p>
          <div className="stack">
            <Line note={show.note} />
            <button className="primary" disabled={show.busy} onClick={() => show.run()}>
              {show.busy ? <Loader /> : <><UnlockIcon always /> Show words</>}
            </button>
            <button className="quiet" disabled={show.busy} onClick={close}>
              Cancel
            </button>
          </div>
        </Sheet>
      )}
    </main>
  )
}
