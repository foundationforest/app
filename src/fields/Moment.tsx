// A moment: a date and time on the device's own picker, or from one to another, written in RFC 3339
// with the device's offset at that time (the markets' types, `moment`).

import { useState } from 'react'

const pad = (n: number) => String(Math.abs(n)).padStart(2, '0')

/** The picker's local time, `YYYY-MM-DDTHH:MM`, in RFC 3339 with this device's offset then. */
export function rfc3339(local: string): string | undefined {
  const d = new Date(local)
  if (!local || Number.isNaN(d.getTime())) return undefined
  const offset = -d.getTimezoneOffset()
  return `${local.slice(0, 16)}:00${offset < 0 ? '-' : '+'}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
}

/** A time, as the picker shows it here. */
function local(time: unknown): string {
  if (typeof time !== 'string' || Number.isNaN(Date.parse(time))) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function Moment({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const was = value && typeof value === 'object' ? (value as { from?: string; to?: string }) : { from: value as string | undefined }
  const [from, setFrom] = useState(local(was.from))
  const [to, setTo] = useState(local(was.to))
  const [span, setSpan] = useState(Boolean(was.to))
  const emit = (f: string, t: string, s: boolean) => {
    const start = rfc3339(f)
    const end = s ? rfc3339(t) : undefined
    onChange(start && end ? { from: start, to: end } : start)
  }
  return (
    <div className="moment">
      <input
        type="datetime-local"
        aria-label={label}
        value={from}
        onChange={(e) => {
          setFrom(e.target.value)
          emit(e.target.value, to, span)
        }}
      />
      {span ? (
        <input
          type="datetime-local"
          aria-label="Until"
          value={to}
          onChange={(e) => {
            setTo(e.target.value)
            emit(from, e.target.value, span)
          }}
        />
      ) : (
        <button
          type="button"
          className="quiet"
          onClick={() => {
            setSpan(true)
            emit(from, to, true)
          }}
        >
          Until
        </button>
      )}
    </div>
  )
}
