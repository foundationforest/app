// Passkeys, from You: every passkey that opens the person's profiles, in one card, read with nothing
// unlocked. Their first passkey, then each added after it (a backup, as the standard names it),
// oldest first. Each by its password manager's name where this device knows it, else the day it was
// added (the first's day isn't known: Your first passkey); under it, quietly, This device for one
// this device made for itself, Backup for any other added after the first. Each added after the
// first has Remove, in red: tapped twice, then one unlock, though a row shows no unlock icon; the
// first is the seed itself, so never. With one alone, a quiet line on why a second. Then Add a
// passkey (AddPasskey.tsx). Under If you lose every passkey, Your 24 words, which opens a sheet: its
// warning, and Show words, which always asks the passkey, even with the seed held, so a device
// someone else picks up while it is held never shows them; then the words, handed to Your 24 words
// (Words.tsx) in the page's memory alone. A passkey prompt must come from a tap, so it is asked here,
// on the sheet's button, not as the next screen opens.

import { useState } from 'react'

import { exportWords } from '@foundationforest/keys'

import { config } from '../config.ts'
import { FIRST, madeHere, passkey } from '../device.ts'
import { removeBackup } from '../flows/backups.ts'
import { seedFor } from '../flows/seed.ts'
import { backupsChanged, useBackups } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { ask, withSeed } from '../passkey.ts'
import { Line, Opens, Sheet, Top, UnlockIcon, day, useAction } from '../ui.tsx'

/** The line that says why a second passkey, while there is one alone. */
const WHY_SECOND = "Add a second, so losing one doesn't lose your profiles."

/** What the sheet before the words warns. */
export const WARNING = 'Anyone who sees them can act as you. Write them on paper and keep it somewhere safe.'

type Props = { onBack: () => void; onAdd: () => void; onWords: (words: string[]) => void }

export function Passkeys({ onBack, onAdd, onWords }: Props) {
  const backups = useBackups()
  const made = madeHere()
  // The backup whose Remove was tapped once: tapped again, it is removed.
  const [removing, setRemoving] = useState<string | null>(null)
  const remove = useAction(async (id: string) => {
    await withSeed(passkey()!, (seed) => removeBackup(config, seed, id))
    setRemoving(null)
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
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>Passkeys</h1>
      </Top>
      {backups ? (
        <div className="rows" role="list" aria-label="Your passkeys">
          <div className="row" role="listitem">
            <span className="sq sm plain">
              <Icon name="key" />
            </span>
            <span className="two">
              <strong>{made[FIRST]?.name ?? 'Your first passkey'}</strong>
              {made[FIRST]?.here && <span>This device</span>}
            </span>
          </div>
          {backups.map((b) => (
            <div key={b.id} className="row" role="listitem">
              <span className="sq sm plain">
                <Icon name="key" />
              </span>
              <span className="two">
                <strong>{made[b.id]?.name ?? day(b.time)}</strong>
                <span>{made[b.id]?.here ? 'This device' : 'Backup'}</span>
              </span>
              <button className={removing === b.id ? 'small danger solid' : 'danger text'} disabled={remove.busy} onClick={() => (removing === b.id ? remove.run(b.id) : setRemoving(b.id))}>
                {remove.busy && removing === b.id ? <Loader /> : 'Remove'}
              </button>
            </div>
          ))}
          <Opens icon="plus" words="Add a passkey" green onClick={onAdd} />
        </div>
      ) : (
        <Loader big />
      )}
      {backups?.length === 0 && <p className="line">{WHY_SECOND}</p>}
      <Line note={remove.note} />
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
