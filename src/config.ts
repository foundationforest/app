// Where this copy of the app is, the services it talks to (Didit's own page among them, which the
// checks frame), each AI app's own page for adding Forest, the pages About Forest opens (its privacy
// and terms, framed, and its source code), and who runs it, with an address to write to: the one
// place they are set. A copy hosted elsewhere sets its own here, and in vercel.json's content security
// policy. The browser test builds the app with its own loopback copies, named in VITE_FOREST_CONFIG
// at build time.

/** The AI apps Connect your AI names, each with a button of its own. */
export const AI_APPS = ['ChatGPT', 'Claude'] as const
export type AiApp = (typeof AI_APPS)[number]

/** Who runs this copy, as About Forest says under its card: each line only when it is set. */
export type Company = { name?: string; registered?: string; number?: string; office?: string }

export type Config = {
  /** The app's own address: Share links here. */
  app: string
  /** The verifier, which checks a person and signs a stamp to their seed; its payment page is framed in the ID check's box. */
  verifier: string
  /** Didit, the verifier's check provider: the origin of the check's own page, which the box frames, and the only one its messages are taken from. */
  didit: string
  /** The host, which keeps every folder the app writes. */
  host: string
  /** The connector, over MCP, which an AI app acts through. */
  connector: string
  /** Each AI app's own page for adding Forest, where it has one: its button on Connect your AI opens it, in a new tab; without one, it opens Add manually. */
  addPages: Partial<Record<AiApp, string>>
  /** The index, which rates each profile: the app reads what it says of the person's own. */
  index: string
  /** Places, services' place lookup: words to towns and colonias for the place screen's search, and the name nearest a place's centre for its caption. Only ever a help: with no answer, a place reads by its size. */
  places: string
  /** The map's tiles, OpenFreeMap: its styles, light and dark, at /styles/positron and /styles/dark, on the place screen alone. */
  tiles: string
  /** The pages About Forest opens: how this copy treats what people give it, and its terms, each framed on a page of the app's own; and its source code, in a new tab. */
  privacy: string
  terms: string
  source: string
  /** Where to write: support, illegal content, a lost passkey. */
  contact: string
  /** Who runs this copy, under About Forest's card. */
  company: Company
  /** Test accounts, by their Profiles folder's address: for AI testing and app reviewers. Their 24 words open them with no passkey, they skip Get verified and make profiles with no check, and nothing else changes: they post, message and spend credits like anyone (test-account.ts). */
  testAccounts: string[]
}

const OURS: Config = {
  app: 'https://app.forest.foundation',
  verifier: 'https://verifier.forest.foundation',
  didit: 'https://verify.didit.me',
  host: 'https://host.forest.foundation',
  connector: 'https://mcp.forest.foundation',
  // No AI app has a page for adding Forest yet: each button opens Add manually until one is named here.
  addPages: {},
  index: 'https://index.forest.foundation',
  places: 'https://places.forest.foundation',
  tiles: 'https://tiles.openfreemap.org',
  privacy: 'https://forest.foundation/privacy',
  terms: 'https://forest.foundation/terms',
  source: 'https://github.com/foundationforest/app',
  contact: 'support@forest.foundation',
  // The foundation isn't registered yet: its lines show once they are set here.
  company: {},
  // One, for AI testing of the app and for Claude's and OpenAI's reviewers. Its words are given to
  // them, never kept in this repo.
  testAccounts: ['2KsR6wpfN78YfGgvdmt2C1Hxzquj3DQXwsjVn4o31TDY'],
}

const given = import.meta.env?.VITE_FOREST_CONFIG as string | undefined

export const config: Config = given ? { ...OURS, ...(JSON.parse(given) as Partial<Config>) } : OURS

/** The services a flow uses: the verifier and the one host everything is written to; and the test accounts, which make profiles with no check (none when not given). */
export type Services = Pick<Config, 'verifier' | 'host'> & Partial<Pick<Config, 'testAccounts'>>
