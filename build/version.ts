// The version About shows: the commit the build was made from, as its first seven characters.
// Vercel names it in VERCEL_GIT_COMMIT_SHA; elsewhere git does; a copy with neither says dev.

import { execFileSync } from 'node:child_process'

export function commit(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || gitHead()
  return sha ? sha.slice(0, 7) : 'dev'
}

function gitHead(): string | undefined {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return undefined
  }
}
