import {
  sampleMovements,
  sampleObjectives,
  sampleActivities,
} from '../lib/sampleData.js'

function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10)
  const monthPrefix = today.slice(0, 7)

  const movementsThisMonth = sampleMovements.filter((m) =>
    m.date.startsWith(monthPrefix),
  )
  const incomes = movementsThisMonth.filter((m) => m.kind === 'INGRESO')
  const expenses = movementsThisMonth.filter((m) => m.kind === 'GASTO')

  const totalIncome = incomes.reduce((acc, m) => acc + m.amount, 0)
  const totalExpense = expenses.reduce((acc, m) => acc + m.amount, 0)
  const monthBalance = totalIncome - totalExpense

  const nextMovements = sampleMovements
    .filter((m) => m.status === 'PLANIFICADO')
    .slice(0, 3)

  const objectivesActive = sampleObjectives.filter(
    (o) => o.status === 'ACTIVO',
  )
  const mainObjective = objectivesActive[0] || sampleObjectives[0]

  const activitiesToday = sampleActivities.filter((a) => a.date === today)
  const lastActivity = [...sampleActivities]
    .filter((a) => a.status === 'HECHA')
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Resumen simple de tu situación actual (datos de ejemplo).</p>

      <section className="dashboard-section">
        <h2 className="section-title">Hoy</h2>
        <p>
          Fecha: <strong>{today}</strong>
        </p>
        {activitiesToday.length > 0 ? (
          <p>
            Actividades de hoy: <strong>{activitiesToday.length}</strong>
          </p>
        ) : (
          <p>No tienes actividades registradas para hoy.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Finanzas del mes</h2>
        <p>
          Ingresos: <strong>${totalIncome.toFixed(2)}</strong>
        </p>
        <p>
          Gastos: <strong>${totalExpense.toFixed(2)}</strong>
        </p>
        <p>
          Balance: <strong>${monthBalance.toFixed(2)}</strong>
        </p>
        <div style={{ marginTop: '8px' }}>
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
            <p className="placeholder-text">No hay próximos movimientos planificados.</p>
          )}
        </div>
      </section>

      {mainObjective && (
        <section className="dashboard-section">
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
              Progreso: {mainObjective.currentValue} / {mainObjective.targetValue} (
              {Math.round(
                (mainObjective.currentValue / mainObjective.targetValue) * 100,
              )}
              %)
            </p>
          )}
        </section>
      )}

      <section className="dashboard-section">
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
          <p className="placeholder-text">No tienes actividades cargadas para hoy.</p>
        )}
        {lastActivity && (
          <p style={{ marginTop: '8px' }}>
            Última actividad realizada: <strong>{lastActivity.name}</strong> ({lastActivity.date})
          </p>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
