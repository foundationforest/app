// A post's photos: tiles, added from the device, up to eight (one for a field that holds one). Each
// photo picked is redrawn on the device first (redraw.ts) and shown from its new bytes until it is
// sent; one the post holds already shows from the host. The field holds each photo's SHA-256; the
// form keeps the bytes of those not sent yet in `picked`, for the post to name and send.

import { useEffect, useRef, useState } from 'react'

import { fileOf } from '@foundationforest/folders'

import { config } from '../config.ts'
import { MAX_PHOTOS, PHOTO_TYPE, photoUrl, photosIn } from '../flows/photos.ts'
import { redraw } from '../redraw.ts'
import { CloseIcon, PlusIcon, Spinner } from '../ui.tsx'

/** The photos picked and not sent yet, by SHA-256: their bytes, and where the page shows them meanwhile. */
export type Picked = Map<string, { bytes: Uint8Array; url: string }>

type Props = { label: string; many: boolean; value: unknown; onChange: (v: unknown) => void; picked: Picked }

export function Photos({ label, many, value, onChange, picked }: Props) {
  const [shas, setShas] = useState<string[]>(photosIn(value))
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const most = many ? MAX_PHOTOS : 1
  // The photos picked here are let go with the form.
  useEffect(() => () => picked.forEach((p) => URL.revokeObjectURL(p.url)), [])

  const set = (next: string[]) => {
    setShas(next)
    onChange(next.length ? (many ? next : next[0]) : undefined)
  }
  const add = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setFailed(false)
    const added: string[] = []
    for (const file of [...files].slice(0, most - shas.length)) {
      try {
        const bytes = await redraw(file)
        const { sha256 } = fileOf(bytes, PHOTO_TYPE)
        if (!picked.has(sha256)) picked.set(sha256, { bytes, url: URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: PHOTO_TYPE })) })
        if (!shas.includes(sha256) && !added.includes(sha256)) added.push(sha256)
      } catch {
        setFailed(true)
      }
    }
    set([...shas, ...added])
    setBusy(false)
    if (input.current) input.current.value = ''
  }
  return (
    <div className="photos" role="group" aria-label={label}>
      <div className="tiles">
        {shas.map((sha) => (
          <span key={sha} className="tile">
            <img src={picked.get(sha)?.url ?? photoUrl(config.host, sha)} alt="" />
            <button type="button" className="plain remove" aria-label="Remove photo" onClick={() => set(shas.filter((s) => s !== sha))}>
              <CloseIcon />
            </button>
          </span>
        ))}
        {shas.length < most && (
          <label className="tile add" aria-label="Add photos">
            {busy ? <Spinner /> : <PlusIcon />}
            <input ref={input} type="file" accept="image/*" multiple={many} hidden disabled={busy} onChange={(e) => void add(e.target.files)} />
          </label>
        )}
      </div>
      {failed && <p className="hint">That photo can't be read.</p>}
    </div>
  )
}
