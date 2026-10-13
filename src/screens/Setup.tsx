// Setup, three steps: the 24 words, saved to the password manager through the browser's own save
// prompt (a sign-in form: username Forest, password the words); a check that they were saved, by
// filling them back from it, which ends with the seed locked on this device; and the face check,
// each of its stages kept in the locked store as it is got. A face check that stopped is taken up
// again from the locked store, after one face, until the vault is written.

import { type FormEvent, useEffect, useRef, useState } from 'react'

import type { Draft, Nav } from '../App.tsx'
import type { Check, Kept } from '../flows/setup.ts'
import { saveProfiles } from '../local.ts'
import { endSetup, keepSetup, lockSeed, readSetup, withSeed } from '../seed/locked.ts'
import { settings } from '../settings.ts'
import { Progress, ScanFaceIcon, Spinner, Words, useAction } from '../ui.tsx'

/** The words as a person types or pastes them: case and spacing forgiven, as the keys library forgives them. */
export const sameWords = (a: string, b: string) => a.trim().toLowerCase().split(/\s+/).join(' ') === b.trim().toLowerCase().split(/\s+/).join(' ')

/** The username the words are saved under, so a password manager offers them back. */
export const Username = () => <input className="unseen" name="username" autoComplete="username" defaultValue="Forest" tabIndex={-1} aria-hidden="true" />

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
        <input className="field" type="password" name="password" autoComplete="current-password" aria-label="Your 24 words" value={typed} onChange={(e) => setTyped(e.target.value)} />
        <div className="fill" />
        {lock.error && <p className="error">{lock.error}</p>}
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

  /** The check from where it stopped, with the seed; `page` is the check's tab when a note is still needed. */
  const run = async (seed: Uint8Array, page: Window | null) => {
    running.current = new AbortController()
    let opened = false
    // The flows carry the registry client and Solana's library: loaded when first needed, not with the first screen.
    const [{ faceCheck }, { profilesOf }] = await Promise.all([import('../flows/setup.ts'), import('../vault.ts')])
    try {
      const vault = await faceCheck(
        seed,
        settings(),
        check.current,
        (url) => {
          page!.opener = null
          page!.location.href = url
          opened = true
        },
        `${location.origin}/back`,
        { signal: running.current.signal, keep: (kept) => keepSetup(seed, kept) },
      )
      saveProfiles(await profilesOf(seed, vault))
    } catch (err) {
      if (!opened) page?.close()
      throw err
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
      <p>This ties your seed to you: one real person, accountable for it.</p>
      <div className="fill stack center" style={{ alignContent: 'center', color: 'var(--ink-2)' }}>
        <ScanFaceIcon />
      </div>
      {start.error && <p className="error">{start.error}</p>}
      <button className="primary" onClick={() => start.run()} disabled={start.busy}>
        {start.busy ? <Spinner /> : 'Start'}
      </button>
    </main>
  )
}
