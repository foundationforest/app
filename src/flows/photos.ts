// A post's photos, as the standard's Files says (folders/README.md, Files) and the markets manual's
// Photos: each `file` field holds the SHA-256 of a photo, and the body's `files` names each one, by
// its SHA-256, type and size. The entry is written first; then each new photo's bytes go to the
// host (PUT /v1/files/<sha256>), which takes them only while a current entry names them, paid from
// the profile's folder and topped up from the wallet when the host refuses for price (paid.ts).
// Every photo is a JPEG the device redrew (redraw.ts). The host serves them to anyone, by their
// SHA-256, so the page shows them from there.

import { type Body, type FileName, fileOf, filesOf } from '@foundationforest/folders'
import type { MainKey } from '@foundationforest/keys'

import { putFile } from '../services/host.ts'
import { paid } from './paid.ts'

/** What every photo is, once redrawn. */
export const PHOTO_TYPE = 'image/jpeg'

/** The most photos one field holds. */
export const MAX_PHOTOS = 8

/** Where the host serves a photo: anyone fetches it by its SHA-256. */
export const photoUrl = (host: string, sha256: string) => `${host}/v1/files/${sha256}`

/** The SHA-256 of each photo a field holds: one, a list, or none. */
export const photosIn = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : typeof value === 'string' ? [value] : [])

/**
 * `body` with its `files`: a name for each photo its file fields hold, the name it had already (an
 * edit) or one from the new bytes in `picked`; none when it holds none. A photo with neither is left
 * out of the field it was in.
 */
export function withFiles(body: Body, fields: string[], picked: Map<string, Uint8Array>): Body {
  const had = new Map(filesOf(body).map((f) => [f.sha256, f]))
  const files: FileName[] = []
  const out: Body = { ...body }
  delete out.files
  for (const field of fields) {
    const many = Array.isArray(body[field])
    const kept: string[] = []
    for (const sha of photosIn(body[field])) {
      const bytes = picked.get(sha)
      const name = had.get(sha) ?? (bytes ? fileOf(bytes, PHOTO_TYPE) : undefined)
      if (!name) continue
      kept.push(sha)
      if (!files.some((f) => f.sha256 === sha)) files.push(name)
    }
    if (kept.length) out[field] = many ? kept : kept[0]!
    else delete out[field]
  }
  if (files.length) out.files = files
  return out
}

/** The bytes of each photo `body` names that are new, from `picked`: those to send to the host. */
export const newPhotos = (body: Body, picked: Map<string, Uint8Array>): Uint8Array[] => filesOf(body).flatMap((f) => (picked.has(f.sha256) ? [picked.get(f.sha256)!] : []))

/** Each photo's bytes to the host, once the entry naming them is written: paid from `folder`, topped up from `wallet`. */
export async function sendPhotos(host: string, folder: string, wallet: MainKey, photos: Uint8Array[]): Promise<void> {
  for (const bytes of photos) await paid(host, folder, wallet, () => putFile(host, bytes, PHOTO_TYPE))
}
