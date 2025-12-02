import { sampleActivities } from '../lib/sampleData.js'

function ActivitiesPage() {
  const activities = [...sampleActivities].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )

  return (
    <div className="activities-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 className="page-title">Actividades</h1>
      <p className="page-subtitle">Registro de tus acciones diarias (datos de ejemplo).</p>

      {activities.length > 0 ? (
        <table className="activities-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Actividad</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Objetivo asociado</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id}>
                <td>{act.date}</td>
                <td>{act.name}</td>
                <td>{act.type}</td>
                <td>{act.status}</td>
                <td>{act.objectiveId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay actividades registradas.</p>
      )}
    </div>
  )
}

export default ActivitiesPage
