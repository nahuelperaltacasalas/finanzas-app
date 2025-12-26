import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'

function sum(arr) {
  return arr.reduce((acc, n) => acc + (Number(n) || 0), 0)
}

export default function DashboardPage() {
  const {
    movements = [],
    objectives = [],
    tasks = [],
    notes = [],
    activityLog = [],
    getPendingItems,
  } = useData()

  const pendingCount = useMemo(() => {
    try {
      return (getPendingItems?.({ filter: 'all' }) ?? []).length
    } catch {
      return 0
    }
  }, [getPendingItems])

  const confirmedMovements = useMemo(
    () => movements.filter((m) => (m.status ?? 'pending') === 'confirmed'),
    [movements]
  )

  const monthISO = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}` // YYYY-MM
  }, [])

  const confirmedThisMonth = useMemo(() => {
    return confirmedMovements.filter((m) => {
      const dateStr = m.date ?? null
      return dateStr && dateStr.startsWith(monthISO)
    })
  }, [confirmedMovements, monthISO])

  const incomeThisMonth = useMemo(() => {
    return sum(
      confirmedThisMonth
        .filter((m) => m.type === 'ingreso')
        .map((m) => m.finalAmount ?? m.amount ?? 0)
    )
  }, [confirmedThisMonth])

  const expensesThisMonth = useMemo(() => {
    return sum(
      confirmedThisMonth
        .filter((m) => m.type === 'gasto')
        .map((m) => m.finalAmount ?? m.amount ?? 0)
    )
  }, [confirmedThisMonth])

  const balanceThisMonth = useMemo(
    () => incomeThisMonth - expensesThisMonth,
    [incomeThisMonth, expensesThisMonth]
  )

  const activeObjectives = useMemo(() => {
    // "activo" = tiene metas pending o no tiene metas (todavía)
    return objectives.filter((o) => {
      const goals = o.goals ?? []
      if (goals.length === 0) return true
      return goals.some((g) => (g.status ?? 'pending') === 'pending')
    })
  }, [objectives])

  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => (t.status ?? 'pending') === 'pending')
  }, [tasks])

  return (
    <div className="page">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          Resumen rápido del mes y pendientes
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 700 }}>Pendientes</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{pendingCount}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Movimientos + metas acción + actividades
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700 }}>Balance del mes</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>
            ${Number(balanceThisMonth).toFixed(2)}
          </div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Ingresos: ${Number(incomeThisMonth).toFixed(2)} · Gastos: $
            {Number(expensesThisMonth).toFixed(2)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700 }}>Objetivos activos</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>
            {activeObjectives.length}
          </div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Total objetivos: {objectives.length}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700 }}>Actividades pendientes</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>
            {pendingTasks.length}
          </div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Total actividades: {tasks.length}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700 }}>Notas</div>
          <div style={{ fontSize: 28, marginTop: 6 }}>{notes.length}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Activity log: {activityLog.length}
          </div>
        </div>
      </div>
    </div>
  )
}
