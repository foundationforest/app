// OpenFreeMap's stand-in on loopback, for the place screen's map: its two styles at the paths the
// app asks for (/styles/positron, /styles/dark), each a background and the water from one vector
// source, as OpenFreeMap's are, its TileJSON at /planet and its tiles at /planet/{z}/{x}/{y}.pbf,
// each an empty tile, with an attribution as OpenFreeMap's has; CORS open to any page, as OpenFreeMap
// answers. It counts what it is asked.

import { type Server, createServer } from 'node:http'

/** What the stand-in's tiles say they come from, as OpenFreeMap's TileJSON does: the map shows it. */
export const ATTRIBUTION = '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> stand-in'

export type Tiles = { origin: string; asked: { styles: string[]; tilejson: number; tiles: number }; close: () => Promise<void> }

export async function standInTiles(): Promise<Tiles> {
  const asked: Tiles['asked'] = { styles: [], tilejson: 0, tiles: 0 }
  let origin = ''
  const style = (name: string) => ({
    version: 8,
    name,
    sources: { openmaptiles: { type: 'vector', url: `${origin}/planet` } },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': name === 'dark' ? '#2b2b2b' : '#f4f4f0' } },
      { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': name === 'dark' ? '#1d2a33' : '#c9dce8' } },
    ],
  })
  const server: Server = createServer((req, res) => {
    const path = new URL(req.url!, 'http://x').pathname
    const json = (body: unknown) => res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }).end(JSON.stringify(body))
    const styled = /^\/styles\/(positron|dark)$/.exec(path)
    if (styled) {
      asked.styles.push(styled[1]!)
      return json(style(styled[1]!))
    }
    if (path === '/planet') {
      asked.tilejson++
      return json({ tilejson: '3.0.0', tiles: [`${origin}/planet/{z}/{x}/{y}.pbf`], minzoom: 0, maxzoom: 14, attribution: ATTRIBUTION })
    }
    if (/^\/planet\/\d+\/\d+\/\d+\.pbf$/.test(path)) {
      asked.tiles++
      return res.writeHead(200, { 'Content-Type': 'application/x-protobuf', 'Access-Control-Allow-Origin': '*' }).end()
    }
    res.writeHead(404, { 'Access-Control-Allow-Origin': '*' }).end()
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  return { origin, asked, close: () => new Promise<void>((resolve) => (server.close(() => resolve()), server.closeAllConnections())) }
}
