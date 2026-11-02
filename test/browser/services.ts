// Services' own verifier and host, on loopback, from services/ at SERVICES, started the way services'
// loop starts them (e2e/services.ts): the verifier with the stand-in Didit its tests run
// (verifier/test/fake-didit.ts, a process of its own) and the stand-in face model, its own name and
// seed in a directory of its own, its gifts credits at this host; the host taking the verifier's
// sponsor's tickets. One more setting than the loop's: APP_ORIGINS, the app's address in this test,
// where the verifier lets Didit and Stripe send a person back; and Stripe, the verifier's own
// stand-in (verifier/test/fakes.ts, FakePayments), so the ID check is for sale: the test pays a
// payment on its page. `./standard.sh services` readies them.

import { type ChildProcess, spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { type AddressInfo, createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readConfig as hostConfig, startHost } from '../../services/host/src/host.ts'
import { readConfig as verifierConfig, startVerifier } from '../../services/verifier/src/service.ts'
import { FakePayments } from '../../services/verifier/test/fakes.ts'

const services = fileURLToPath(new URL('../../services/', import.meta.url))

/** The loop verifier's name, as services' loop names its own: one no real verifier has. */
export const VERIFIER_NAME = 'verifier.app-test.invalid'
/** The stand-in Didit's two workflows. */
const FACE_WORKFLOW = '00000000-0000-4000-8000-00000000f0ce'
const ID_WORKFLOW = '00000000-0000-4000-8000-0000000001d0'

export async function freePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  await new Promise<void>((resolve) => server.close(() => resolve()))
  return port
}

async function answers(url: string, child: ChildProcess): Promise<void> {
  const until = Date.now() + 60_000
  for (;;) {
    if (child.exitCode !== null) throw new Error(`${url}: the process stopped (${child.exitCode})`)
    if (await fetch(url).then(() => true, () => false)) return
    if (Date.now() > until) throw new Error(`${url} did not answer`)
    await new Promise((r) => setTimeout(r, 300))
  }
}

export type Running = { verifier: string; host: string; faceKey: string; idKey: string; payments: FakePayments; stop(): Promise<void> }

export async function startServices({ appOrigin, say }: { appOrigin: string; say: (line: string) => void }): Promise<Running> {
  const dir = mkdtempSync(join(tmpdir(), 'forest-app-browser-'))
  const log = (name: string) => (line: string) => {
    for (const l of line.split('\n').filter(Boolean)) say(`[${name}] ${l}`)
  }
  const diditPort = await freePort()
  const didit = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', 'test/fake-didit.ts'], {
    cwd: join(services, 'verifier'),
    env: { PATH: process.env.PATH ?? '', FAKE_DIDIT_PORT: String(diditPort), FAKE_DIDIT_FACE_WORKFLOW_ID: FACE_WORKFLOW, FAKE_DIDIT_ID_WORKFLOW_ID: ID_WORKFLOW },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (const s of [didit.stdout!, didit.stderr!]) s.on('data', (c: Buffer) => log('stand-in Didit')(c.toString('utf8')))
  const closers: Array<() => Promise<void>> = []
  const stop = async () => {
    for (const close of closers.reverse()) await close().catch(() => undefined)
    if (didit.exitCode === null) {
      didit.kill('SIGTERM')
      await new Promise((r) => didit.once('exit', r))
    }
    rmSync(dir, { recursive: true, force: true })
  }
  try {
    await answers(`http://127.0.0.1:${diditPort}/`, didit)
    const hostPort = await freePort()
    const host = `http://127.0.0.1:${hostPort}`
    const payments = new FakePayments()
    const verifier = await startVerifier(
      verifierConfig({
        VERIFIER_NAME,
        DIDIT_API_KEY: 'stand-in',
        DIDIT_FACE_WORKFLOW_ID: FACE_WORKFLOW,
        DIDIT_ID_WORKFLOW_ID: ID_WORKFLOW,
        DIDIT_BASE_URL: `http://127.0.0.1:${diditPort}`,
        FACE_MODEL: 'stand-in',
        HOST_URL: host,
        APP_ORIGINS: appOrigin,
        DATABASE_PATH: join(dir, 'verifier', 'verifier.sqlite'),
        PORT: '0',
      }),
      { log: log('verifier'), payments },
    )
    closers.push(() => verifier.close())
    if (!verifier.sponsor) throw new Error('the verifier gives no gift')
    const h = await startHost(hostConfig({ DATA_DIR: join(dir, 'host'), PUBLIC_ORIGIN: host, PORT: String(hostPort), SPONSORS: verifier.sponsor }))
    closers.push(() => h.close())
    return { verifier: verifier.url, host, faceKey: verifier.keys.face, idKey: verifier.keys.id, payments, stop }
  } catch (err) {
    await stop()
    throw err
  }
}
