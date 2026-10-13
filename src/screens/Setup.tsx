// Setup, three steps: the 24 words, saved to the password manager through the browser's own save
// prompt (a sign-in form: username Forest, password the words); a check that they were saved, by
// filling them back from it (a tap on the field, the eye to see them), which ends with the seed
// locked on this device; and the face check, each of its stages kept in the locked store as it is
// got, finished in a tab of its own. A face check that stopped is taken up again from the locked
// store, after one face, until the vault is written.

import { type FormEvent, useEffect, useRef, useState } from 'react'

import type { Draft, Nav } from '../App.tsx'
import type { Check, Kept } from '../flows/setup.ts'
import { saveProfiles } from '../local.ts'
import { endSetup, keepSetup, lockSeed, readSetup, withSeed } from '../seed/locked.ts'
import { settings } from '../settings.ts'
import { profilesOf } from '../vault.ts'
import { EyeIcon, EyeOffIcon, Progress, ScanFaceIcon, Spinner, Words, useAction } from '../ui.tsx'

/** The words as a person types or pastes them: case and spacing forgiven, as the keys library forgives them. */
export const sameWords = (a: string, b: string) => a.trim().toLowerCase().split(/\s+/).join(' ') === b.trim().toLowerCase().split(/\s+/).join(' ')

/** The username the words are saved under, so a password manager offers them back. */
export const Username = () => <input className="unseen" name="username" autoComplete="username" defaultValue="Forest" tabIndex={-1} aria-hidden="true" />

/** The words' field: a tap fills it from the password manager, and the eye shows what it holds. Nothing in it is corrected or spell-checked. */
export function WordsField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [shown, setShown] = useState(false)
  return (
    <div className="secret">
      <input
        className="field"
        type={shown ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Tap to fill"
        aria-label="Your 24 words"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="icon" aria-label={shown ? 'Hide the words' : 'Show the words'} onClick={() => setShown(!shown)}>
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

export function Setup({ step, draft, nav, onSetupLocked, onLocked }: { step: 1 | 2 | 3; draft: Draft | null; nav: Nav; onSetupLocked: () => void; onLocked: () => void }) {
  if (step === 1) return <Save draft={draft!} nav={nav} />
  if (step === 2) return <Saved draft={draft!} onSetupLocked={onSetupLocked} />
  return <Face draft={draft} onLocked={onLocked} />
}

function Save({ draft, nav }: { draft: Draft; nav: Nav }) {
  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Chromium shows its save prompt for a stored credential; Safari and Firefox see the form sent.
    const Credential = (window as { PasswordCredential?: new (form: HTMLFormElement) => Credential }).PasswordCredential
    if (Credential) await navigator.credentials.store(new Credential(e.currentTarget)).catch(() => undefined)
    nav.go({ name: 'setup', step: 2 })
  }
  return (
    <main>
      <Progress step={1} />
      <h1>Your 24 words</h1>
      <p>These words are you. Lose them and nothing brings them back.</p>
      <Words words={draft.words} />
      <div className="fill" />
      <form onSubmit={save}>
        <Username />
        <input className="unseen" type="password" name="password" autoComplete="new-password" defaultValue={draft.words} tabIndex={-1} aria-hidden="true" />
        <button className="primary">Save to password manager</button>
      </form>
    </main>
  )
}

function Saved({ draft, onSetupLocked }: { draft: Draft; onSetupLocked: () => void }) {
  const [typed, setTyped] = useState('')
  const ok = sameWords(typed, draft.words)
  // Locked now, before the face check, so each of its stages is kept in the locked store.
  const lock = useAction(async () => {
    await lockSeed(draft.seed, { setup: true })
    onSetupLocked()
  })
  return (
    <main>
      <Progress step={2} />
      <h1>Check they're saved</h1>
      <form
        className="grow"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) void lock.run()
        }}
      >
        <Username />
        <WordsField value={typed} onChange={setTyped} />
        <div className="fill" />
        {lock.error ? <p className="error">{lock.error}</p> : typed.trim() && !ok && <p className="error">These aren't your 24 words.</p>}
        <button className="primary" disabled={!ok || lock.busy}>
          {lock.busy ? <Spinner /> : 'Next'}
        </button>
      </form>
    </main>
  )
}

function Face({ draft, onLocked }: { draft: Draft | null; onLocked: () => void }) {
  const check = useRef<Check>({})
  const running = useRef<AbortController | null>(null)
  useEffect(() => () => running.current?.abort(), [])
  // The check's tab is open, and the note not yet here.
  const [away, setAway] = useState(false)

  /** The check from where it stopped, with the seed; `page` is the check's tab when a note is still needed. */
  const run = async (seed: Uint8Array, page: Window | null) => {
    running.current = new AbortController()
    let opened = false
    // Setup's own flow: loaded when first needed, not with the first screen.
    const { faceCheck } = await import('../flows/setup.ts')
    try {
      const vault = await faceCheck(
        seed,
        settings(),
        check.current,
        (url) => {
          page!.opener = null
          page!.location.href = url
          opened = true
          setAway(true)
        },
        `${location.origin}/back`,
        {
          signal: running.current.signal,
          keep: (kept) => {
            if (kept.note) setAway(false)
            return keepSetup(seed, kept)
          },
        },
      )
      saveProfiles(await profilesOf(seed, vault))
    } catch (err) {
      if (!opened) page?.close()
      throw err
    } finally {
      setAway(false)
    }
    await endSetup()
    onLocked()
  }

  /** The check's tab, opened while the tap counts, so the seed stays here; Didit sends the person back to /back there. */
  const tab = () => {
    if (check.current.note) return null
    const page = window.open('', '_blank')
    if (!page) throw new Error('Allow Forest to open a tab, then start again.')
    return page
  }

  const start = useAction(async () => {
    // Setup's own seed, in memory since its words were shown.
    if (draft) return run(draft.seed, tab())
    // Taken up again: the seed and what the locked store kept, after one face.
    await withSeed(async (seed) => {
      if (!check.current.issuer) Object.assign(check.current, (await readSetup<Kept>(seed)) ?? {})
      await run(seed, tab())
    })
  })

  return (
    <main>
      <Progress step={3} />
      <h1>One face check</h1>
      <p>This ties your words to you: one real person, accountable for them.</p>
      <div className="fill stack center" style={{ alignContent: 'center', color: 'var(--ink-2)' }}>
        <ScanFaceIcon />
      </div>
      {start.busy && away && <p className="center">Finish it in the other tab.</p>}
      {start.error && <p className="error">{start.error}</p>}
      <button className="primary" onClick={() => start.run()} disabled={start.busy}>
        {start.busy ? <Spinner /> : 'Start'}
      </button>
    </main>
  )
}
