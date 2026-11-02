// Requests to a service, with the two ways they fail in words a person reads: the service did not
// answer, or it answered no, with its own code, which words.ts says as one plain line.

import { Said, hostSays, verifierSays } from '../words.ts'

/** A service did not answer, or not as a service of its kind does. */
export class Unreachable extends Said {
  constructor(service: string) {
    super(`Can't reach the ${service}. Try again.`)
    this.name = 'Unreachable'
  }
}

/** A service answered no, with its code; said as words.ts says it, for the check the person is on. */
export class Refused extends Said {
  readonly code: string
  readonly status: number
  constructor(service: 'verifier' | 'host', status: number, code: string, check: 'face' | 'id' = 'face') {
    const said = service === 'verifier' ? verifierSays(code, check) : hostSays(code)
    super(said.message, said.red)
    this.name = 'Refused'
    this.code = code
    this.status = status
  }
}

export type Answer = { status: number; body: any }

/** A JSON request to `url`: its status and its body, or Unreachable when nothing, or no JSON, came back. */
export async function call(service: string, url: string, body?: unknown): Promise<Answer> {
  let res: Response
  try {
    res = await fetch(url, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw new Unreachable(service)
  }
  const text = await res.text().catch(() => '')
  try {
    return { status: res.status, body: text ? JSON.parse(text) : null }
  } catch {
    throw new Unreachable(service)
  }
}
