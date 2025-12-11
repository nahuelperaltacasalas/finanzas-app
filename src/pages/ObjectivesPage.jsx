import { useData } from '../context/DataContext.jsx'

function ObjectivesPage() {
  const { objectives } = useData()

  return (
    <div className="page-root objectives-page">
      <h1 className="page-title">Objetivos</h1>
      <p className="page-subtitle">
        Tus metas definidas con área, prioridad y estado.
      </p>

      {objectives.length > 0 ? (
        <ul className="objectives-list">
          {objectives.map((obj) => {
            let progress = 0
            if (obj.targetValue > 0) {
              progress = Math.min(
                100,
                Math.round((obj.currentValue / obj.targetValue) * 100),
              )
            }
            return (
              <li key={obj.id} className="card">
                <h3 style={{ marginBottom: '4px' }}>{obj.name}</h3>
                <p style={{ marginBottom: '4px' }}>
                  Área: <strong>{obj.area}</strong> | Estado:{' '}
                  <strong>{obj.status}</strong> | Prioridad:{' '}
                  <strong>{obj.priorityLevel}</strong>
                </p>
                {obj.description && (
                  <p style={{ marginBottom: '4px' }}>{obj.description}</p>
                )}
                {obj.targetValue > 0 && (
                  <p>
                    Progreso: {obj.currentValue} / {obj.targetValue} ({progress}
                    %)
                  </p>
                )}
                {obj.startDate && obj.endDate && (
                  <p>
                    Fechas: {obj.startDate} → {obj.endDate}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="placeholder-text">No tienes objetivos definidos.</p>
      )}
    </div>
  )
}

export default ObjectivesPage
