// The ID check's world: services' own verifier, in this process, with its own stand-ins for Didit
// and for Stripe (verifier/test/fakes.ts) and its embedder that knows faces by name, its gifts
// credits at services' own host. The ID check's tests run here, so the verifier's own code says what
// a payment, a try and each refusal come to.
//
// It sits in a directory of its own, with its own tsconfig, as the browser test does: the
// verifier's code needs its own packages, which only `./standard.sh services` installs, so the
// app's build (Vercel's, with `./standard.sh` alone) never type-checks it; `npm run check` does.

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { readConfig, startHost } from '../../services/host/src/host.ts'
import { readConfig as verifierConfig, startVerifier } from '../../services/verifier/src/service.ts'
import { FACE_WORKFLOW, FakeFaceCheck, FakePayments, ID_WORKFLOW, namedFaces } from '../../services/verifier/test/fakes.ts'
import type { Services } from '../../src/config.ts'
import { freePort } from '../world.ts'

/** Services' own verifier and host, on loopback: the stand-ins a test drives, and the verifier's keys. */
export type ServicesWorld = Services & {
  faceCheck: FakeFaceCheck
  idCheck: FakeFaceCheck
  /** Stripe, as the verifier sees it: a test pays a payment with `pay`. Absent when the ID check is not for sale. */
  payments?: FakePayments
  keys: { face: string; id: string }
  balance(folder: string): Promise<number>
  close(): Promise<void>
}

/** The ID check's gift, as services' verifier gives it by default: ten times the face check's. */
export const ID_CREDITS = 100

/** Services' own verifier and host, on loopback, as id.test.ts runs them. `forSale: false` is a verifier with no Stripe. */
export async function services({ forSale = true, entryPerKb }: { forSale?: boolean; entryPerKb?: string } = {}): Promise<ServicesWorld> {
  const dir = mkdtempSync(join(tmpdir(), 'forest-app-services-'))
  const hostPort = await freePort()
  const host = `http://127.0.0.1:${hostPort}`
  const faceCheck = new FakeFaceCheck()
  const idCheck = new FakeFaceCheck()
  const payments = forSale ? new FakePayments() : undefined
  const verifier = await startVerifier(
    verifierConfig({
      VERIFIER_NAME: 'verifier.app-vitest.invalid',
      DIDIT_API_KEY: 'stand-in',
      DIDIT_FACE_WORKFLOW_ID: FACE_WORKFLOW,
      DIDIT_ID_WORKFLOW_ID: ID_WORKFLOW,
      DIDIT_BASE_URL: 'http://127.0.0.1:9',
      FACE_MODEL: 'stand-in',
      HOST_URL: host,
      APP_ORIGINS: 'https://app.example',
      DATABASE_PATH: join(dir, 'verifier', 'verifier.sqlite'),
      PORT: '0',
    }),
    { faceCheck, idCheck, embedder: namedFaces(), ...(payments && { payments }), log: () => undefined },
  )
  const running = await startHost(readConfig({ DATA_DIR: join(dir, 'host'), PUBLIC_ORIGIN: host, PORT: String(hostPort), SPONSORS: verifier.sponsor!, ...(entryPerKb && { ENTRY_PER_KB: entryPerKb }) }))
  return {
    verifier: verifier.url,
    host,
    faceCheck,
    idCheck,
    ...(payments && { payments }),
    keys: verifier.keys,
    balance: async (folder) => ((await (await fetch(`${host}/credits/balance/${folder}`)).json()) as { credits: number }).credits,
    close: async () => {
      await verifier.close()
      await running.close()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
