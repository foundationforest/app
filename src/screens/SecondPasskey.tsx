// Right after the person's first profile is made, once, before Use Forest from your AI: Add opens
// Add a passkey; Not now goes on. It has no path of its own, so back or a reload lands on Profiles
// (App.tsx).

/** The line that says why a second passkey: here, and in You while there is one alone. */
export const WHY_SECOND = "Add a second, so losing one doesn't lose your profiles."

export function SecondPasskey({ onAdd, onNotNow }: { onAdd: () => void; onNotNow: () => void }) {
  return (
    <main className="start">
      <div className="fill" />
      <div className="brand">
        <h1>Add a second passkey</h1>
        <p className="line">{WHY_SECOND}</p>
      </div>
      <div className="fill" />
      <button className="primary" onClick={onAdd}>
        Add
      </button>
      <button className="quiet" onClick={onNotNow}>
        Not now
      </button>
    </main>
  )
}
