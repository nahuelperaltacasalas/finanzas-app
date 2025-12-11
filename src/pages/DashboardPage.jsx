import { useData } from '../context/DataContext.jsx'

function DashboardPage() {
  const { movements, objectives, activities } = useData()

  const today = new Date().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)

  const movementsThisMonth = movements.filter((m) =>
    m.date.startsWith(monthPrefix),
  )

  const incomes = movementsThisMonth.filter((m) => m.kind === 'INGRESO')
  const expenses = movementsThisMonth.filter((m) => m.kind === 'GASTO')

  const totalIncome = incomes.reduce((acc, m) => acc + m.amount, 0)
  const totalExpense = expenses.reduce((acc, m) => acc + m.amount, 0)
  const monthBalance = totalIncome - totalExpense

  const nextMovements = movements
    .filter((m) => m.status === 'PLANIFICADO')
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 3)

  const objectivesActive = objectives.filter((o) => o.status === 'ACTIVO')
  const mainObjective = objectivesActive[0] || objectives[0]

  let mainProgress = 0
  if (mainObjective && mainObjective.targetValue > 0) {
    mainProgress = Math.min(
      100,
      Math.round(
        (mainObjective.currentValue / mainObjective.targetValue) * 100,
      ),
    )
  }

  const activitiesToday = activities.filter((a) => a.date === today)
  const lastActivity = [...activities]
    .filter((a) => a.status === 'HECHA')
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]

  return (
    <div className="page-root dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Resumen simple de tu situación actual (datos de esta sesión).
      </p>

      <section className="card">
        <h2 className="section-title">Hoy</h2>
        <p>
          Fecha: <strong>{today}</strong>
        </p>
        {activitiesToday.length > 0 ? (
          <p>
            Actividades de hoy: <strong>{activitiesToday.length}</strong>
          </p>
        ) : (
          <p className="placeholder-text">
            No tienes actividades registradas para hoy.
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">Finanzas del mes</h2>
        <div className="stats-grid" style={{ marginBottom: '8px' }}>
          <div className="stat-pill">
            <span>Ingresos</span>
            <strong>${totalIncome.toFixed(2)}</strong>
          </div>
          <div className="stat-pill">
            <span>Gastos</span>
            <strong>${totalExpense.toFixed(2)}</strong>
          </div>
          <div className="stat-pill">
            <span>Balance</span>
            <strong>${monthBalance.toFixed(2)}</strong>
          </div>
        </div>
        <p className="section-subtitle">Próximos movimientos (planificados):</p>
        {nextMovements.length > 0 ? (
          <ul>
            {nextMovements.map((m) => (
              <li key={m.id}>
                {m.date} — {m.kind === 'INGRESO' ? 'Ingreso' : 'Gasto'} — $
                {m.amount.toFixed(2)} ({m.sourceOrReason})
              </li>
            ))}
          </ul>
        ) : (
          <p className="placeholder-text">
            No hay próximos movimientos planificados.
          </p>
        )}
      </section>

      {mainObjective && (
        <section className="card">
          <h2 className="section-title">Objetivo principal</h2>
          <p>
            <strong>{mainObjective.name}</strong>
          </p>
          <p>
            Área: <strong>{mainObjective.area}</strong> | Estado:{' '}
            <strong>{mainObjective.status}</strong> | Prioridad:{' '}
            <strong>{mainObjective.priorityLevel}</strong>
          </p>
          {mainObjective.targetValue > 0 && (
            <p>
              Progreso: {mainObjective.currentValue} /{' '}
              {mainObjective.targetValue} ({mainProgress}%)
            </p>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="section-title">Acción</h2>
        {activitiesToday.length > 0 ? (
          <>
            <p>Actividades de hoy:</p>
            <ul>
              {activitiesToday.map((a) => (
                <li key={a.id}>
                  {a.name} ({a.type}) — {a.status}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="placeholder-text">
            No tienes actividades cargadas para hoy.
          </p>
        )}
        {lastActivity && (
          <p style={{ marginTop: '8px' }}>
            Última actividad realizada:{' '}
            <strong>{lastActivity.name}</strong> ({lastActivity.date})
          </p>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
