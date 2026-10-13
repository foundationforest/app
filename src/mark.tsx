// The mark: three roofs and a trunk, one drawing, never redrawn. Every screen that shows it draws
// this component, in the theme's ink; the favicon and the PWA icons are made from it at each build,
// ink on paper (icons.ts). test/mark.test.ts holds the drawing as it was given.

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true">
      <polyline points="8,12 20,3 32,12" />
      <polyline points="8,22 20,13 32,22" />
      <polyline points="8,32 20,23 32,32" />
      <line x1="20" y1="24" x2="20" y2="38" />
    </svg>
  )
}
