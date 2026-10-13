// JSON over HTTP, the way each service answers: a body, or `{ "error": "<code>" }` with a status.

export class ServiceError extends Error {
  readonly url: string
  readonly status: number
  readonly code: string
  constructor(url: string, status: number, code: string) {
    super(`${url}: ${status} ${code}`)
    this.url = url
    this.status = status
    this.code = code
  }
}

async function answer(url: string, res: Response): Promise<any> {
  const text = await res.text()
  let body: any = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    // Not JSON: refused below, by status.
  }
  if (!res.ok) throw new ServiceError(url, res.status, typeof body?.error === 'string' ? body.error : 'error')
  return body
}

export async function getJson(url: string): Promise<any> {
  return answer(url, await fetch(url))
}

export async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<any> {
  return answer(url, await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }))
}
