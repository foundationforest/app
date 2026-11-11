// The mark: three chevrons over a short trunk, one drawing, never redrawn. Its strokes are the ones
// services' mcp draws its icon with (mcp/src/icon.ts). Every screen that shows it draws this
// component, in the color of the text around it; the favicon and the PWA icons are made from it at
// each build, ink on the page's ground (build/shell.ts). test/mark.test.ts holds the drawing as it
// was given. The loader is the same drawing filling from the trunk up, one part at a time, shown
// only while something really loads.

const BOX = { viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: '4', strokeLinecap: 'butt', strokeLinejoin: 'miter' } as const

/** The shapes, by part: the trunk, then each chevron, from the bottom up. */
const TRUNK = { x1: '20', y1: '24', x2: '20', y2: '38' }
const CHEVRONS = ['8,32 20,23 32,32', '8,22 20,13 32,22', '8,12 20,3 32,12']

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} {...BOX} aria-hidden="true">
      {[...CHEVRONS].reverse().map((points) => (
        <polyline key={points} points={points} />
      ))}
      <line {...TRUNK} />
    </svg>
  )
}

/** Something loading: the mark filling from the trunk up, about 1.8 s a loop; still, filled, when motion is reduced. Small in a button or a line, in its text's color, a button's own busy; `big` only for a wait known to be long (a profile being made, a check), and only once it passes half a second (theme.css). */
export function Loader({ big = false }: { big?: boolean }) {
  const size = big ? 72 : 20
  return (
    <svg className={big ? 'loader big' : 'loader'} width={size} height={size} {...BOX} role="status" aria-label="Working">
      <line className="p1" {...TRUNK} />
      {CHEVRONS.map((points, i) => (
        <polyline key={points} className={`p${i + 2}`} points={points} />
      ))}
    </svg>
  )
}
