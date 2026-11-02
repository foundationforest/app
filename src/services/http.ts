// Requests to a service, with the two ways they fail in words a person reads: the service did not
// answer, or it answered no, with its own code.

/** A service did not answer, or not as a service of its kind does. */
export class Unreachable extends Error {
  constructor(service: string) {
    super(`Can't reach the ${service}. Try again.`)
    this.name = 'Unreachable'
  }
}

/** A service answered no, with its code. */
export class Refused extends Error {
  readonly code: string
  readonly status: number
  constructor(service: string, status: number, code: string) {
    super(`The ${service} said no: ${code}.`)
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
