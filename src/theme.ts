// The theme on the page: light or dark as the person chose, else the device's.

import type { Theme } from './device.ts'

/** The paper, light and dark (theme.css), for the browser's own bars. */
export const PAPER = { light: '#edeae0', dark: '#121a15' }

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'device') delete root.dataset.theme
  else root.dataset.theme = theme
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const own = meta.media.includes('dark') ? 'dark' : 'light'
    meta.content = PAPER[theme === 'device' ? own : theme]
  }
}
