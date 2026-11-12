// What counts as green, for the build test: a colour whose hue is between 110 and 200 degrees and
// whose chroma is at least 0.03, in OKLCH. The page's inks, hairlines and grounds are tinted a very
// little toward green (chroma 0.005 to 0.025), which reads as neutral; a green is something a
// person would call green. Colors are read from hex and rgb(), which is how the app writes them.

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** A color's OKLCH, from sRGB channels in 0 to 255. */
export function oklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const [R, G, B] = [r, g, b].map((v) => lin(v / 255)) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  return { l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 }
}

export const GREEN = { from: 110, to: 200, chroma: 0.03 } as const

/** Whether an sRGB color is green. */
export function isGreen(r: number, g: number, b: number): boolean {
  const { c, h } = oklch(r, g, b)
  return c >= GREEN.chroma && h >= GREEN.from && h <= GREEN.to
}

/** Every color a text writes as hex (#rgb, #rrggbb, #rrggbbaa) or rgb()/rgba(), as written and as channels. */
export function colorsIn(text: string): Array<{ written: string; rgb: [number, number, number] }> {
  const out: Array<{ written: string; rgb: [number, number, number] }> = []
  for (const [written, hex] of text.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g) as Iterable<[string, string]>) {
    const full = hex.length === 3 ? [...hex].map((x) => x + x).join('') : hex
    out.push({ written, rgb: [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number] })
  }
  for (const [written, body] of text.matchAll(/rgba?\(\s*([^)]*)\)/g) as Iterable<[string, string]>) {
    const parts = body.split(/[\s,/]+/).filter(Boolean).slice(0, 3)
    if (parts.length === 3 && parts.every((p) => /^[\d.]+$/.test(p))) out.push({ written, rgb: parts.map(Number) as [number, number, number] })
  }
  return out
}

/** The CSS color names that are green, which a stylesheet must not use. */
export const GREEN_NAMES = [
  'green', 'darkgreen', 'lightgreen', 'lime', 'limegreen', 'forestgreen', 'seagreen', 'mediumseagreen', 'springgreen', 'mediumspringgreen',
  'palegreen', 'darkseagreen', 'lightseagreen', 'olive', 'olivedrab', 'darkolivegreen', 'teal', 'aquamarine', 'mediumaquamarine',
  'greenyellow', 'yellowgreen', 'chartreuse', 'lawngreen', 'honeydew', 'mintcream',
] as const
