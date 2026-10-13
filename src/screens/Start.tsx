import { Mark } from '../ui.tsx'

export function Start({ onStart, onRestore }: { onStart: () => void; onRestore: () => void }) {
  return (
    <main>
      <div className="fill" />
      <div className="stack center">
        <Mark size={72} />
        <h1>Forest</h1>
        <p>One human, one record, any market, no one in between.</p>
      </div>
      <div className="fill" />
      <div className="stack">
        <button className="primary" onClick={onStart}>
          Start
        </button>
        <button className="quiet wide" onClick={onRestore}>
          I have my 24 words
        </button>
      </div>
    </main>
  )
}
