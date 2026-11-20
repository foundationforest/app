// Where this copy of the app is, the services it talks to, the AI apps whose plugin directories list
// Forest, and the pages About Forest links to (its privacy and terms, and its source code): the one
// place they are set. A copy hosted elsewhere sets
// its own here, and in vercel.json's content security policy. The browser
// test builds the app with its own loopback copies, named in VITE_FOREST_CONFIG at build time.

/** The AI apps Connect your AI names. */
export const AI_APPS = ['Claude', 'ChatGPT'] as const
export type AiApp = (typeof AI_APPS)[number]

export type Config = {
  /** The app's own address: the verifier sends people back here after a check, and Share links here. */
  app: string
  /** The verifier, which checks a person and signs a stamp to their seed. */
  verifier: string
  /** The host, which keeps every folder the app writes. */
  host: string
  /** The connector, over MCP, which an AI app acts through. */
  connector: string
  /** The AI apps whose plugin directory lists Forest: Connect your AI has the person search for it there; any other is added by the connector's address. */
  listedIn: AiApp[]
  /** The index, which rates each profile: the app reads what it says of the person's own. */
  index: string
  /** Places, services' place lookup: words to towns and colonias for the place screen's search, and the name nearest a place's centre for its caption. Only ever a help: with no answer, a place reads by its size. */
  places: string
  /** The map's tiles, OpenFreeMap: its styles, light and dark, at /styles/positron and /styles/dark, on the place screen alone. */
  tiles: string
  /** The pages About Forest opens, each in a new tab: how this copy treats what people give it, its terms, and its source code. Links, never fetched. */
  privacy: string
  terms: string
  source: string
}

const OURS: Config = {
  app: 'https://app.forest.foundation',
  verifier: 'https://verifier.forest.foundation',
  host: 'https://host.forest.foundation',
  connector: 'https://mcp.forest.foundation',
  // No plugin directory lists Forest yet: adding an app's name here switches it to the search steps.
  listedIn: [],
  index: 'https://index.forest.foundation',
  places: 'https://places.forest.foundation',
  tiles: 'https://tiles.openfreemap.org',
  privacy: 'https://forest.foundation/privacy',
  terms: 'https://forest.foundation/terms',
  source: 'https://github.com/foundationforest/app',
}

const given = import.meta.env?.VITE_FOREST_CONFIG as string | undefined

export const config: Config = given ? { ...OURS, ...(JSON.parse(given) as Partial<Config>) } : OURS

/** The services a flow uses: the verifier and the one host everything is written to. */
export type Services = Pick<Config, 'verifier' | 'host'>
