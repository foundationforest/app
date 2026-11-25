// An ID's page, from Your checks: Back, the document's name as its title (YourChecks.tsx); its badge
// and Verified; then one card of rows, Name, Born, Document (its kind and the country that issued
// it), Number and Expires, from the facts Didit read on it, as the stamp's list holds them in its
// entry of the Profiles folder, locked so only the seed opens it. A row whose fact the stamp lacks is
// left out. The device keeps none of them (device.ts): with the seed held they show at once; with
// none, the lock and Open, strong green, which asks the passkey. Shown to the person alone, never
// stored, and gone with the page.

import { useEffect, useState } from 'react'

import { config } from '../config.ts'
import { passkey } from '../device.ts'
import { countryOf, dayOf, documentWords, idName } from '../documents.ts'
import { openProfiles } from '../flows/profiles.ts'
import { factOf, idShownOf } from '../flows/verify.ts'
import { ifHeld } from '../held.ts'
import { useIds } from '../hooks.ts'
import { Icon } from '../icons.tsx'
import { Loader } from '../mark.tsx'
import { withSeed } from '../passkey.ts'
import { CHECK_ICON, Line, Top, UnlockIcon, useAction } from '../ui.tsx'

/** The rows, in their order, each read from the stamp's facts. */
export type IdRows = Array<[label: string, value: string]>

/** The rows of an ID stamp's page, from the list of facts beside it: those it holds. */
export function rowsOf(stamp: string): IdRows {
  const fact = (name: string) => factOf(stamp, name)
  const name = fact('full_name') ?? ([fact('first_name'), fact('last_name')].filter(Boolean).join(' ') || undefined)
  const born = fact('date_of_birth')
  const kind = fact('document_type')
  const country = fact('issuing_state')
  const document = [kind && documentWords(kind), country && countryOf(country)].filter(Boolean).join(', ')
  const number = fact('document_number')
  const expires = fact('expiration_date')
  const rows: Array<[string, string | undefined]> = [
    ['Name', name],
    ['Born', born && dayOf(born)],
    ['Document', document || undefined],
    ['Number', number],
    ['Expires', expires && dayOf(expires)],
  ]
  return rows.filter((r): r is [string, string] => !!r[1])
}

/** The stamp at `path` in the Profiles folder, read with the seed. */
async function stampAt(seed: Uint8Array, path: string): Promise<string | null> {
  const folder = await openProfiles(seed, config.host)
  return folder.held.find((h) => h.path === path)?.stamp ?? null
}

export function IdPage({ path, onBack }: { path: string; onBack: () => void }) {
  const kept = useIds().find((id) => id.path === path)
  const [stamp, setStamp] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  const got = (s: string | null) => (s ? setStamp(s) : setMissing(true))
  // With the seed held, read at once, quietly.
  useEffect(() => {
    let live = true
    void ifHeld(passkey()!, (seed) => stampAt(seed, path))
      .then((s) => live && s !== undefined && got(s))
      .catch(() => undefined)
    return () => void (live = false)
  }, [path])
  const open = useAction(async () => got(await withSeed(passkey()!, (seed) => stampAt(seed, path))))
  const title = stamp ? idName(idShownOf(stamp)) : kept ? idName(kept) : 'ID'
  return (
    <main>
      <Top onBack={onBack} clear>
        <h1>{title}</h1>
      </Top>
      <div className="row plainrow">
        <span className="sq sm ink">
          <Icon name={CHECK_ICON.id} fill />
        </span>
        <span className="donechip">
          <Icon name="check" bold />
          Verified
        </span>
      </div>
      {stamp ? (
        <div className="rows facts" aria-label="What the check read">
          {rowsOf(stamp).map(([label, value]) => (
            <div key={label} className="row">
              <span className="two">
                <span>{label}</span>
                <strong>{value}</strong>
              </span>
            </div>
          ))}
        </div>
      ) : missing ? (
        <p className="line">This ID's details aren't in your Forest.</p>
      ) : (
        <>
          <div className="fill" />
          <div className="unopened">
            <span className="sq big plain">
              <Icon name="lock-simple" fill />
            </span>
          </div>
          <Line note={open.note} />
          <button className="primary" disabled={open.busy} onClick={() => open.run()}>
            {open.busy ? <Loader /> : <><UnlockIcon /> Open</>}
          </button>
          <div className="fill" />
        </>
      )}
    </main>
  )
}
