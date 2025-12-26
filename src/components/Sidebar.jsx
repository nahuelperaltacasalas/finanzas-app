import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'

function Sidebar({ currentPage, onNavigate }) {
  const { getPendingItems } = useData()

  const DEV_MODE = false

  const pendingCount = useMemo(() => {
    return getPendingItems({ filter: 'all' }).length
  }, [getPendingItems])

  const items = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pendientes', label: `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'finanzas', label: 'Finanzas' },
    { id: 'objetivos', label: 'Objetivos' },
    { id: 'actividades', label: 'Actividades' },
    { id: 'calendario', label: 'Calendario' },
    ...(DEV_MODE ? [{ id: 'registrar', label: 'Dev: Registrar' }] : []), // ✅ dev tool
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
