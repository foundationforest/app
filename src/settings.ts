// Where the app finds each service. The foundation's on devnet by default; each is the person's to
// change, since every service is one they can switch. Not secret, so kept in localStorage, and in
// the vault's `settings` (src/vault.ts), where a new device finds them.

import registryDevnet from '../standard/registry/devnet/devnet.json'

export type Settings = {
  issuer: string
  host: string
  registryPayer: string
  index: string
  /** A Solana RPC, for a recent blockhash and reading rows. */
  rpc: string
  /** The MCP door the person adds to their AI, which then acts with the access keys it is given. */
  mcp: string
}

export const DEVNET: Settings = {
  issuer: 'https://issuer.devnet.forest.foundation',
  host: 'https://host.devnet.forest.foundation',
  registryPayer: 'https://registry-payer.devnet.forest.foundation',
  index: 'https://index.devnet.forest.foundation',
  rpc: 'https://api.devnet.solana.com',
  mcp: 'https://mcp.devnet.forest.foundation/mcp',
}

/** The registry's program on devnet, from the pinned standard: part of the standard, not a setting. */
export const REGISTRY_PROGRAM = registryDevnet.registry.programId

const KEY = 'forest.settings'

export function settings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>
    return { ...DEVNET, ...saved }
  } catch {
    return { ...DEVNET }
  }
}

export function saveSettings(change: Partial<Settings>): Settings {
  const next = { ...settings(), ...change }
  for (const origin of Object.values(next)) new URL(origin)
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
