// A sheet: a short choice or a confirmation (a market's roles, the made sheet, Add manually, Which
// profiles?, Delete this profile?, Report), over the screen it opens from. On a phone it rises from
// the bottom, the screen dimmed behind it; on a laptop it opens centred, with a round × at its top
// right. A tap on the dimmed screen, or Escape, closes it; so does the ×.

import { type ReactNode, useEffect, useRef } from 'react'

import { Icon } from './icons.tsx'

type Props = { label: string; onClose: () => void; children: ReactNode; className?: string }

export function Sheet({ label, onClose, children, className }: Props) {
  const card = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', key)
    card.current?.focus()
    return () => removeEventListener('keydown', key)
  }, [onClose])
  return (
    <div className="sheet-shade" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={card} className={className ? `sheet ${className}` : 'sheet'} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <button type="button" className="round clear sheet-x" aria-label="Close" onClick={onClose}>
          <Icon name="x" />
        </button>
        {children}
      </div>
    </div>
  )
}
