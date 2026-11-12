// Passkeys, from You: every passkey that opens the person's profiles, in one card, read with nothing
// unlocked. Their first passkey, the one the seed comes from, with a mint Main chip; then each added
// after it (a backup, as the standard names it), oldest first, each with a Backup chip in neutral
// grey, so it reads differently from Main's mint. Each a row: the same key on its square
// for every one, its name, a chevron. Its name is the one the person gave it on this device, else
// its maker's, read from the id it sent as it was made (managers.ts), else Passkey; a name shown
// already takes the next number (Apple 2). With one alone, a quiet line on why a second. Then Add a
// passkey (AddPasskey.tsx). A row opens in place, under itself, and a second tap closes it: a Name
// field with Save at its right, on the same line, kept on this device alone, asking nothing; and, on
// any passkey but the first, Remove under it, at the left, in red text, which asks again in its own
// place, Remove this passkey?, with Cancel and Remove, then one unlock (Save gives way while it
// asks). The first is the seed itself: the app never removes it, so it has no Remove. Under If you lose every passkey, Your 24 words, which
// opens its own page (Words.tsx). Nothing floats.

import { useState } from 'react'

import { config } from '../config.ts'
import { FIRST, madeHere, nameMade, passkey } from '../device.ts'
import { removeBackup } from '../flows/backups.ts'
import { backupsChanged, useBackups } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { nameOf, numbered } from '../managers.ts'
import { withSeed } from '../passkey.ts'
import { AskAgain, Opens, Top, useAction } from '../ui.tsx'

/** The line that says why a second passkey, while there is one alone. */
const WHY_SECOND = "Add a second, so losing one doesn't lose your profiles."

type Props = { onBack: () => void; onAdd: () => void; onWords: () => void }

export function Passkeys({ onBack, onAdd, onWords }: Props) {
  const backups = useBackups()
  const made = madeHere()
  const ids = backups ? [FIRST, ...backups.map((b) => b.id)] : null
  const shown = ids ? numbered(ids.map((id) => nameOf(made[id]))) : []
  // The passkey open in place, by its id; what its Name field holds; and whether its Remove is asking again.
  const [open, setOpen] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [asking, setAsking] = useState(false)
  const remove = useAction(async (id: string) => {
    await withSeed(passkey()!, (seed) => removeBackup(config, seed, id))
    setOpen(null)
    backupsChanged()
  })
  const toggle = (id: string, i: number) => {
    if (remove.busy) return
    setOpen(open === id ? null : id)
    setTyped(shown[i]!)
    setAsking(false)
    remove.setNote(null)
  }
  const save = () => {
    nameMade(open!, typed)
    setOpen(null)
  }
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Passkeys</h1>
      </Top>
      {ids && (
        <div className="rows" role="list" aria-label="Your passkeys">
          {ids.map((id, i) => (
            <div key={id} role="listitem" className="opens">
              <button type="button" className="row passkey" aria-expanded={open === id} onClick={() => toggle(id, i)}>
                <span className="sq sm plain">
                  <Icon name="key" />
                </span>
                <span className="grow named-row">
                  <strong>{shown[i]}</strong>
                  <span className={id === FIRST ? 'mainchip' : 'backupchip'}>{id === FIRST ? 'Main' : 'Backup'}</span>
                </span>
                <Icon name={open === id ? 'caret-up' : 'caret-right'} className="car" />
              </button>
              {open === id && (
                <form
                  className="exp"
                  aria-label={shown[i]}
                  onSubmit={(e) => {
                    e.preventDefault()
                    save()
                  }}
                >
                  <div className="name-row">
                    <label className="field grow">
                      <span className="label">Name</span>
                      <input value={typed} maxLength={40} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
                    </label>
                    {!asking && (
                      <button type="submit" className="primary small" disabled={remove.busy}>
                        Save
                      </button>
                    )}
                  </div>
                  {id !== FIRST && (
                    <div className="exp-buttons">
                      <AskAgain words="Remove" ask="Remove this passkey?" icon="trash" unlock busy={remove.busy} note={remove.note} onAsking={setAsking} onYes={() => remove.run(id)} />
                    </div>
                  )}
                </form>
              )}
            </div>
          ))}
          <Opens icon="plus" words="Add a passkey" green onClick={onAdd} />
        </div>
      )}
      {backups?.length === 0 && <p className="line">{WHY_SECOND}</p>}
      <h2>If you lose every passkey</h2>
      <div className="rows">
        <Opens icon="list-numbers" words="Your 24 words" line="Write them down to get back in" onClick={onWords} />
      </div>
    </main>
  )
}
