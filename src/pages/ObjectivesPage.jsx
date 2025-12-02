import { sampleObjectives } from '../lib/sampleData.js'

function ObjectivesPage() {
  return (
    <div className="objectives-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 className="page-title">Objetivos</h1>
      <p className="page-subtitle">Tus metas y objetivos definidos (datos de ejemplo).</p>

      {sampleObjectives.length > 0 ? (
        <ul
          className="objectives-list"
          style={{
            listStyle: 'none',
            paddingLeft: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {sampleObjectives.map((obj) => {
            let progress = 0
            if (obj.targetValue > 0) {
              progress = Math.min(
                100,
                Math.round((obj.currentValue / obj.targetValue) * 100),
              )
            }

            return (
              <li
                key={obj.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                }}
              >
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
                <p>
                  Fechas: {obj.startDate} → {obj.endDate}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>No tienes objetivos definidos.</p>
      )}
    </div>
  )
}

export default ObjectivesPage
