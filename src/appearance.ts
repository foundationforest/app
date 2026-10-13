// The appearance: the device's light or dark, unless the person picked one. theme.css reads
// data-theme; the browser's own bars follow theme-color.

import type { Appearance } from './local.ts'

const PAPER = { light: '#EDEAE0', dark: '#121A15' }

export function applyAppearance(choice: Appearance): void {
  const root = document.documentElement
  if (choice === 'device') delete root.dataset.theme
  else root.dataset.theme = choice
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const own = meta.media.includes('dark') ? PAPER.dark : PAPER.light
    meta.content = choice === 'device' ? own : PAPER[choice]
  }
}
