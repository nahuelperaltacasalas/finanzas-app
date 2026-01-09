import { useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getTodayISO } from '../lib/dateUtils.js'

const effectiveAmount = (m) => Number(m?.finalAmount ?? m?.amount ?? 0)

export default function DashboardPage() {
  const { movements = [], objectives = [], activityLog = [], getPendingItems, todayISO: ctxToday } =
    useData()

  const todayISO = ctxToday ?? getTodayISO()

  const pendingBuckets = useMemo(() => {
    try {
      const items = getPendingItems?.({ filter: 'all' }) ?? []
      let today = 0
      let overdue = 0
      let noDate = 0

      items.forEach((it) => {
        const dateStr =
          it?.dateISO ?? it?.date ?? it?.data?.date ?? it?.data?.dueDate ?? null
        if (!dateStr) {
          noDate += 1
        } else if (dateStr === todayISO) {
          today += 1
        } else if (dateStr < todayISO) {
          overdue += 1
        }
      })

      return { today, overdue, noDate }
    } catch {
      return { today: 0, overdue: 0, noDate: 0 }
    }
  }, [getPendingItems, todayISO])

  const monthPrefix = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }, [])

  const confirmedThisMonth = useMemo(() => {
    return (movements ?? []).filter((m) => {
      const isConfirmed = (m?.status ?? 'pending') === 'confirmed'
      const dateStr = m?.date ?? null
      return isConfirmed && dateStr && dateStr.startsWith(monthPrefix)
    })
  }, [movements, monthPrefix])

  const incomeThisMonth = useMemo(() => {
    return confirmedThisMonth
      .filter((m) => m?.type === 'ingreso')
      .reduce((acc, m) => acc + effectiveAmount(m), 0)
  }, [confirmedThisMonth])

  const expensesThisMonth = useMemo(() => {
    return confirmedThisMonth
      .filter((m) => m?.type === 'gasto')
      .reduce((acc, m) => acc + effectiveAmount(m), 0)
  }, [confirmedThisMonth])

  const activeObjectives = useMemo(() => {
    return (objectives ?? []).filter((o) => (o?.status ?? 'active') !== 'canceled')
  }, [objectives])

  const pendingActionGoals = useMemo(() => {
    return (objectives ?? []).reduce((acc, o) => {
      const pendingGoals =
        o?.goals?.filter((g) => g?.type === 'action' && (g?.status ?? 'pending') === 'pending')
          ?.length ?? 0
      return acc + pendingGoals
    }, 0)
  }, [objectives])

  const recentActivity = useMemo(() => {
    return [...(activityLog ?? [])]
      .sort((a, b) => (b?.createdAt ?? '').localeCompare(a?.createdAt ?? ''))
      .slice(0, 5)
  }, [activityLog])

  return (
    <div className="page">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Resumen visual (solo lectura)</div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 800 }}>Resumen de pendientes</div>
          <div className="stats-grid" style={{ marginTop: 12 }}>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>HOY</div>
              <div style={{ fontSize: 22 }}>{pendingBuckets.today}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>ATRASADOS</div>
              <div style={{ fontSize: 22 }}>{pendingBuckets.overdue}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>SIN FECHA</div>
              <div style={{ fontSize: 22 }}>{pendingBuckets.noDate}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800 }}>Finanzas del mes (confirmados)</div>
          <div className="stats-grid" style={{ marginTop: 12 }}>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>Ingresos</div>
              <div style={{ fontSize: 22 }}>${incomeThisMonth.toFixed(2)}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>Gastos</div>
              <div style={{ fontSize: 22 }}>${expensesThisMonth.toFixed(2)}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>Balance</div>
              <div style={{ fontSize: 22 }}>${(incomeThisMonth - expensesThisMonth).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800 }}>Objetivos</div>
          <div className="stats-grid" style={{ marginTop: 12 }}>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>Activos</div>
              <div style={{ fontSize: 22 }}>{activeObjectives.length}</div>
            </div>
            <div className="stat-pill">
              <div style={{ fontSize: 12, opacity: 0.8 }}>Metas acción pendientes</div>
              <div style={{ fontSize: 22 }}>{pendingActionGoals}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Actividad reciente</div>
          {recentActivity.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No hay actividad reciente.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {recentActivity.map((log) => (
                <div
                  key={log?.id ?? log?.createdAt}
                  className="stat-pill"
                  style={{ alignItems: 'flex-start', padding: '10px 12px' }}
                >
                  <div style={{ fontWeight: 700 }}>{log?.type ?? 'evento'}</div>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>
                    {log?.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : 'sin fecha'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
