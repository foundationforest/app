// A service's credits, as the app gets them: the service read from its directory, and a buy
// collected with what paid for it, then finished. Ported from services e2e (serviceAt, buyCredits);
// the buy itself and the finishing are credits.ts's. Today a buy is paid only by a sponsor's ticket,
// the issuer's welcome gift (services' issuer README, The welcome gift).

import { type Credit, DIRECTORY_PATH, PAYMENT_HEADER, type Pending, type Service, finish, serviceOf } from './credits.ts'
import { ServiceError, getJson } from './http.ts'

/** The service at `origin`, from its Privacy Pass issuer directory. */
export async function serviceAt(origin: string): Promise<Service> {
  return serviceOf(origin, await getJson(`${origin}${DIRECTORY_PATH}`))
}

/**
 * A buy collected at its service with a sponsor's ticket, and its credits finished: each unblinded
 * and checked against the service's key. Collecting again with the same ticket gives the same
 * credits, never more.
 */
export async function collect(service: Service, buy: Uint8Array, pending: Pending, ticket: string): Promise<Credit[]> {
  const res = await fetch(service.requestUri, {
    method: 'POST',
    headers: { 'content-type': 'application/private-token-generic-batch-request', [PAYMENT_HEADER]: `ticket ${ticket}` },
    body: new Uint8Array(buy),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ServiceError(service.requestUri, res.status, typeof body?.error === 'string' ? body.error : 'error')
  }
  return finish(pending, new Uint8Array(await res.arrayBuffer()))
}
