// The verification circuit's proving files, as the app serves them (build/proofs.ts): each under its
// SHA-256, from the standard's setup.json at STANDARD, which names each file's hash and size.

import setup from '../../standard/proofs/verification/setup/setup.json'

export type ProofFile = { path: string; sha256: string; bytes: number }

const file = (name: 'verification.wasm' | 'verification.zkey'): ProofFile => {
  const { sha256, bytes } = setup.files[name]
  return { path: `/proofs/${sha256}.${name.split('.').pop()}`, sha256, bytes }
}

export const FILES = { wasm: file('verification.wasm'), zkey: file('verification.zkey') }
