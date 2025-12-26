export default function Topbar({ title, onNew }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Placeholder para futuro Auth */}
        <div className="topbar-user">
          <span style={{ opacity: 0.8 }}>Guest</span>
          <button type="button" className="btn" disabled title="Auth próximamente">
            Login
          </button>
        </div>

        <button type="button" className="btn primary" onClick={onNew}>
          + Nuevo
        </button>
      </div>
    </div>
  )
}
