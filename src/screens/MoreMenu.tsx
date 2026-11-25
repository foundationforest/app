// A profile's ··· menu, round, in its header: a small menu opens under it, each item a line, the red
// ones red; a tap outside it, or Escape, closes it. On the person's own profile: Share profile and
// Delete profile; on someone else's: Share profile and Report. Share profile hands out the profile's
// page on the index (Profile.tsx, `share`): the phone's share sheet where there is one, else the link
// copied, the ··· saying Copied for a moment.

import { useEffect, useRef, useState } from 'react'

import { Icon } from '../icons.tsx'
import { share } from './Profile.tsx'

export type MenuItem = { words: string; red?: boolean; onPick: () => void }

type Props = { url: string; items: MenuItem[] }

export function MoreMenu({ url, items }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const box = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', outside)
    addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', outside)
      removeEventListener('keydown', key)
    }
  }, [open])
  const pick = (run: () => void) => {
    setOpen(false)
    run()
  }
  const all: MenuItem[] = [{ words: 'Share profile', onPick: () => void share(url, setCopied) }, ...items]
  return (
    <div className="more" ref={box}>
      <button type="button" className="round" aria-label={copied ? 'Copied' : 'More'} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>
        <Icon name={copied ? 'check' : 'dots-three'} bold />
      </button>
      {open && (
        <div className="menu" role="menu">
          {all.map((item) => (
            <button key={item.words} type="button" role="menuitem" className={item.red ? 'danger' : undefined} onClick={() => pick(item.onPick)}>
              {item.words}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
