// The connector (services' mcp/README.md, The login and The connection): what the connect page
// reads from it, its open key, which a connection's entries and its pointer are locked to; and where
// the browser goes back to it, its /connected, with the person's answer: the pointer, or no. The
// browser carries the request on as it came, so the connector checks it is its own.

import { Unreachable, call } from './http.ts'

/** The connector's open key, an age post-quantum key, from its /open-key. */
export async function openKeyOf(connector: string): Promise<string> {
  const { status, body } = await call('connector', new URL('/open-key', connector).href)
  if (status !== 200 || typeof body?.openKey !== 'string' || !body.openKey.startsWith('age1pq1')) throw new Unreachable('connector')
  return body.openKey
}

/** The connector's /connected, with the request and the person's answer: the pointer, or no. */
export function backTo(connector: string, request: string, answer: { pointer: string } | 'no'): string {
  const back = new URL('/connected', connector)
  back.searchParams.set('request', request)
  if (answer === 'no') back.searchParams.set('error', 'access_denied')
  else back.searchParams.set('pointer', answer.pointer)
  return back.href
}
