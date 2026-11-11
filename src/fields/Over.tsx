// A screen over a form, for a field that needs room of its own (a place, hours, a long list): a page,
// not a dialog, a step in the page's history, so the phone's back closes it; opened from the field's
// row, which takes the focus again once it closes. `Over` is its frame: the whole screen, the form
// behind it reached by nothing meanwhile, the screen taking the focus.

import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/** Whether the screen is open; `show` opens it, a step in the history; `close` goes back one, which closes it. */
export function useOver(row: RefObject<HTMLElement | null>) {
  const [open, setOpen] = useState(false)
  const closing = useRef(false)
  useEffect(() => {
    if (!open) return
    const popped = () => setOpen(false)
    addEventListener('popstate', popped)
    return () => {
      removeEventListener('popstate', popped)
      // Back on the row, once the form takes the focus again.
      requestAnimationFrame(() => row.current?.focus())
    }
  }, [open])
  const show = () => {
    closing.current = false
    history.pushState({ ...history.state, placing: true }, '', location.pathname)
    setOpen(true)
  }
  const close = () => {
    if (closing.current) return
    closing.current = true
    history.back()
  }
  return { open, show, close }
}

/** The frame of a screen over a form, named `label`, in the page's body. */
export function Over({ label, children }: { label: string; children: ReactNode }) {
  const self = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.inert = true
    self.current?.focus()
    return () => {
      if (root) root.inert = false
    }
  }, [])
  return createPortal(
    <section className="over" aria-label={label} ref={self} tabIndex={-1}>
      <div className="over-screen">{children}</div>
    </section>,
    document.body,
  )
}
