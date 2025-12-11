import { useData } from '../context/DataContext.jsx'

function ActivitiesPage() {
  const { activities } = useData()

  const sorted = [...activities].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  )

  return (
    <div className="page-root activities-page">
      <h1 className="page-title">Actividades</h1>
      <p className="page-subtitle">
        Registro de tus acciones diarias vinculadas a objetivos.
      </p>

      <section className="card">
        {sorted.length > 0 ? (
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
              {sorted.map((act) => (
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
          <p className="placeholder-text">No hay actividades registradas.</p>
        )}
      </section>
    </div>
  )
}

export default ActivitiesPage
