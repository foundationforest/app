// Add a backup, in setup only, once a device, after Get verified and before the first profiles
// (App.tsx): a back arrow, to Get verified; "Add a backup"; "If you lose your passkey, it's the only
// way back." Two cards:
// - Another passkey, "Not in" wherever the first one is (its maker's manager, managers.ts: Apple
//   Passwords, Google Password Manager, or the maker's own name; "Not where your first one is" when
//   the first one said nothing of its maker): Add a backup passkey, strong green, Passkeys' own way of
//   adding one (adding.ts). One made by the first one's maker is dropped before anything is written,
//   and the page comes back with one yellow note above the cards, "That one is in Apple Passwords
//   too. Save it somewhere else.";
// - 24 recovery words, "Written down on paper": Show my words, outlined, which asks the passkey, even
//   with the seed held, and opens Your 24 recovery words with them (Words.tsx).
// Then Later, a link under the cards. A backup added, the words written down, or Later: on to the
// first profiles, and setup never shows this page again on this device. A seed whose Profiles folder
// lists a backup passkey already skips it.

import { useEffect, useRef, useState } from 'react'

import { SameMaker, addPasskey } from '../adding.ts'
import { FIRST, madeHere } from '../device.ts'
import { useBackups } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { managerOf } from '../managers.ts'
import { Loader } from '../mark.tsx'
import { Line, Notice, Top, useAction } from '../ui.tsx'
import { askWords, giveWords } from './Words.tsx'

type Props = { onDone: () => void; onWords: () => void; onBack: () => void }

export function Backup({ onDone: done, onWords, onBack }: Props) {
  const backups = useBackups()
  const maker = madeHere()[FIRST]?.maker
  const [same, setSame] = useState<string | null>(null)
  // On, once: a backup added also has the list read again.
  const left = useRef(false)
  const onDone = () => {
    if (left.current) return
    left.current = true
    done()
  }
  useEffect(() => {
    if (backups && backups.length > 0) onDone()
  }, [backups])

  const add = useAction(async () => {
    setSame(null)
    try {
      await addPasskey(maker ? { notFrom: maker } : {})
    } catch (err) {
      if (err instanceof SameMaker) return setSame(managerOf(err.maker))
      throw err
    }
    onDone()
  })
  const words = useAction(async () => {
    giveWords(await askWords())
    onWords()
  })
  const busy = add.busy || words.busy

  return (
    <main className="backup">
      <Top onBack={onBack} />
      <div className="stack">
        <h1>Add a backup</h1>
        <p className="lead">If you lose your passkey, it's the only way back.</p>
      </div>
      {same && <Notice>{`That one is in ${same} too. Save it somewhere else.`}</Notice>}
      <div className="vcards">
        <div className="vcard" data-backup="passkey">
          <span className="vhead">
            <span className="vico">
              <Icon name="key" fill />
            </span>
            <span className="two">
              <strong>Another passkey</strong>
              <span>{maker ? `Not in ${managerOf(maker)}` : 'Not where your first one is'}</span>
            </span>
          </span>
          <Line note={add.note} />
          <button className="primary" disabled={busy} onClick={() => add.run()}>
            {add.busy ? <Loader /> : 'Add a backup passkey'}
          </button>
        </div>
        <div className="vcard" data-backup="words">
          <span className="vhead">
            <span className="vico">
              <Icon name="file-text" fill />
            </span>
            <span className="two">
              <strong>24 recovery words</strong>
              <span>Written down on paper</span>
            </span>
          </span>
          <Line note={words.note} />
          <button disabled={busy} onClick={() => words.run()}>
            {words.busy ? <Loader /> : 'Show my words'}
          </button>
        </div>
      </div>
      <button className="text-link" disabled={busy} onClick={onDone}>
        Later
      </button>
      <div className="fill" />
    </main>
  )
}
