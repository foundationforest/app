// Where this copy of the app is, and the services it talks to: the one place they are set. A copy
// hosted elsewhere sets its own here, and in vercel.json's content security policy. The browser
// test builds the app with its own loopback copies, named in VITE_FOREST_CONFIG at build time.

export type Config = {
  /** The app's own address: the verifier sends people back here after a check, and Share links here. */
  app: string
  /** The verifier, which checks a person and signs a stamp to their seed. */
  verifier: string
  /** The host, which keeps every folder the app writes. */
  host: string
  /** The connector, over MCP, which an AI app acts through. */
  connector: string
}

const OURS: Config = {
  app: 'https://app.forest.foundation',
  verifier: 'https://verifier.forest.foundation',
  host: 'https://host.forest.foundation',
  connector: 'https://mcp.forest.foundation',
}

const given = import.meta.env?.VITE_FOREST_CONFIG as string | undefined

export const config: Config = given ? { ...OURS, ...(JSON.parse(given) as Partial<Config>) } : OURS

/** The services a flow uses: the verifier and the one host everything is written to. */
export type Services = Pick<Config, 'verifier' | 'host'>
