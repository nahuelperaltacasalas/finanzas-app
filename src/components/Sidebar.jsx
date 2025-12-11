function Sidebar({ currentPage, onNavigate }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'objetivos', label: 'Objetivos' },
    { id: 'actividades', label: 'Actividades' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'registrar', label: 'Registrar' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <strong>Finanzas App</strong>
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={currentPage === item.id ? 'active' : ''}
        >
          {item.label}
        </button>
      ))}
    </aside>
  )
}

export default Sidebar
