// Setup, three steps: the 24 words, saved to the password manager through the browser's own save
// prompt (a sign-in form: username Forest, password the words); a check that they were saved, by
// filling them back from it; and the face check, which ends with the seed locked on this device.

import { type FormEvent, useEffect, useRef, useState } from 'react'

import type { Draft, Nav } from '../App.tsx'
import type { Check } from '../flows/setup.ts'
import { saveProfiles } from '../local.ts'
import { lockSeed } from '../seed/locked.ts'
import { settings } from '../settings.ts'
import { Progress, ScanFaceIcon, Spinner, Words, useAction } from '../ui.tsx'

/** The words as a person types or pastes them: case and spacing forgiven, as the keys library forgives them. */
export const sameWords = (a: string, b: string) => a.trim().toLowerCase().split(/\s+/).join(' ') === b.trim().toLowerCase().split(/\s+/).join(' ')

/** The username the words are saved under, so a password manager offers them back. */
export const Username = () => <input className="unseen" name="username" autoComplete="username" defaultValue="Forest" tabIndex={-1} aria-hidden="true" />

export function Setup({ step, draft, nav, onLocked }: { step: 1 | 2 | 3; draft: Draft; nav: Nav; onLocked: () => void }) {
  if (step === 1) return <Save draft={draft} nav={nav} />
  if (step === 2) return <Saved draft={draft} nav={nav} />
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

function Saved({ draft, nav }: { draft: Draft; nav: Nav }) {
  const [typed, setTyped] = useState('')
  const ok = sameWords(typed, draft.words)
  return (
    <main>
      <Progress step={2} />
      <h1>Check they're saved</h1>
      <form
        className="grow"
        onSubmit={(e) => {
          e.preventDefault()
          if (ok) nav.go({ name: 'setup', step: 3 })
        }}
      >
        <Username />
        <input className="field" type="password" name="password" autoComplete="current-password" aria-label="Your 24 words" value={typed} onChange={(e) => setTyped(e.target.value)} />
        <div className="fill" />
        <button className="primary" disabled={!ok}>
          Next
        </button>
      </form>
    </main>
  )
}

function Face({ draft, onLocked }: { draft: Draft; onLocked: () => void }) {
  const check = useRef<Check>({})
  const running = useRef<AbortController | null>(null)
  useEffect(() => () => running.current?.abort(), [])

  const start = useAction(async () => {
    // The check's page opens in a tab of its own, opened now while the tap counts, so the seed stays
    // here; Didit sends the person back to /back there.
    const page = check.current.note ? null : window.open('', '_blank')
    if (!check.current.note && !page) throw new Error('Allow Forest to open a tab, then start again.')
    running.current = new AbortController()
    let opened = false
    // The flows carry the registry client and Solana's library: loaded when first needed, not with the first screen.
    const { faceCheck } = await import('../flows/setup.ts')
    try {
      await faceCheck(
        draft.seed,
        settings(),
        check.current,
        (url) => {
          page!.opener = null
          page!.location.href = url
          opened = true
        },
        `${location.origin}/back`,
        running.current.signal,
      )
    } catch (err) {
      if (!opened) page?.close()
      throw err
    }
    // Where the browser asks for a tap to make a passkey, and the check took longer than one lasts,
    // this throws; Start again goes straight here.
    await lockSeed(draft.seed)
    saveProfiles([])
    onLocked()
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
