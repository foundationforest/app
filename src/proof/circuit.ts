// The person circuit's proving files, from the pinned standard's devnet setup, served from the app's
// own origin under their SHA-256 (standard.sh copies them there).

import setup from '../../standard/registry/circuit/devnet/setup.json'

export const PERSON = {
  wasm: { path: `/circuits/${setup.files['person.wasm'].sha256}.wasm`, sha256: setup.files['person.wasm'].sha256 },
  zkey: { path: `/circuits/${setup.files['person.zkey'].sha256}.zkey`, sha256: setup.files['person.zkey'].sha256 },
}

export type Artifact = (typeof PERSON)['wasm']
