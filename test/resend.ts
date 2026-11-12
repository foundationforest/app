// A stand-in for Resend's `POST /emails`, which the host sends its morning email through (services'
// host/test/email.test.ts has the one this is copied from): it keeps each email it is asked to send,
// and takes one idempotency key once, as Resend does. No real email goes anywhere; a test reads the
// code the host emailed from what was kept.

import { type IncomingHttpHeaders, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

export type Sent = { headers: IncomingHttpHeaders; body: { from: string; to: string[]; subject: string; html: string; text: string; headers?: Record<string, string> } }

export type StandInResend = { url: string; sent: Sent[]; close(): Promise<void> }

export async function standInResend(): Promise<StandInResend> {
  const sent: Sent[] = []
  const keys = new Set<string>()
  const server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const key = req.headers['idempotency-key'] as string | undefined
      if (req.method !== 'POST' || req.url !== '/emails') return void res.writeHead(404).end()
      if (key === undefined || !keys.has(key)) sent.push({ headers: req.headers, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) })
      if (key !== undefined) keys.add(key)
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ id: crypto.randomUUID() }))
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, sent, close: () => new Promise((resolve) => server.close(() => resolve())) }
}

/** The 6-digit code in the newest email sent to `to`: what the person types. */
export function codeSentTo(sent: Sent[], to: string): string {
  const letter = [...sent].reverse().find((s) => s.body.to.includes(to))
  const code = letter && /\b(\d{6})\b/.exec(letter.body.subject)?.[1]
  if (!code) throw new Error(`no code was emailed to ${to}`)
  return code
}
