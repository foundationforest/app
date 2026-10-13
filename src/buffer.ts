// The standard's records client (reading a host's pages and inbox) and registry client (a row's
// address and its `register` instruction) call Node's global `Buffer`, which browsers do not have.
// Until the standard stops, the app gives them one: the `buffer` package, the one @solana/web3.js
// already bundles. Imported first, by the page and by the proof's worker.
import { Buffer } from 'buffer'

const scope = globalThis as { Buffer?: unknown }
scope.Buffer ??= Buffer
