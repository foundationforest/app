// Once the person's first profile is made, once, after Add a backup passkey: Connect opens Connect
// an AI; Not now, the profiles. It has no path of its own, so back or a reload lands on Profiles (App.tsx).

export function UseAi({ onConnect, onNotNow }: { onConnect: () => void; onNotNow: () => void }) {
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <h1>Use Forest from your AI</h1>
      </div>
      <div className="fill" />
      <button className="primary" onClick={onConnect}>
        Connect
      </button>
      <button className="quiet" onClick={onNotNow}>
        Not now
      </button>
    </main>
  )
}
