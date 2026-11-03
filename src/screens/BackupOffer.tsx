// Right after the person's first profile is made, once, before Use Forest from your AI: Add a backup
// opens Add a backup; Not now goes on. It has no path of its own, so back or a reload lands on
// Profiles (App.tsx).

export function BackupOffer({ onAdd, onNotNow }: { onAdd: () => void; onNotNow: () => void }) {
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <h1>Add a backup passkey</h1>
        <p className="line">If you lose your only passkey, your profiles are gone.</p>
      </div>
      <div className="fill" />
      <button className="primary" onClick={onAdd}>
        Add a backup
      </button>
      <button className="quiet" onClick={onNotNow}>
        Not now
      </button>
    </main>
  )
}
