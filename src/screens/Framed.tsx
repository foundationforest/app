// Privacy, or Terms, from About Forest: Back, the title, the page's address small and grey under it
// (forest.foundation/privacy), and that page framed below, filling the rest. The site's own page, as
// it is: the app adds nothing to it and reads nothing from it.

import { Top } from '../ui.tsx'

/** An address as the page writes it under its title: no scheme, no trailing slash. */
export const shortAddress = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

export function Framed({ title, url, onBack }: { title: string; url: string; onBack: () => void }) {
  return (
    <main className="framed-page">
      <Top onBack={onBack} clear>
        <h1>{title}</h1>
        <p className="xs">{shortAddress(url)}</p>
      </Top>
      <iframe title={title} src={url} />
    </main>
  )
}
