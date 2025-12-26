import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext.jsx'

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d) {
  const x = new Date(d)
  x.setDate(1)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfMonth(d) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + 1)
  x.setDate(0)
  x.setHours(23, 59, 59, 999)
  return x
}

function money(n) {
  const v = Number(n ?? 0)
  return `$${v.toFixed(2)}`
}

function movementEffectiveAmount(m) {
  // Si confirmaste con MORE/LESS, finalAmount es el que vale.
  // Si no, usa amount.
  const fa = m.finalAmount
  if (fa === null || fa === undefined || Number.isNaN(Number(fa))) return Number(m.amount ?? 0)
  return Number(fa)
}

function movementDateISO(m) {
  // Para finanzas/histórico usamos date (tu modelo).
  // Si no hay, caemos al createdAt (solo para orden visual).
  if (m.date) return m.date
  if (m.createdAt) return String(m.createdAt).slice(0, 10)
  return null
}

export default function FinancePage() {
  const { movements } = useData()

  // filtros
  const [statusFilter, setStatusFilter] = useState('confirmed') // confirmed | pending | canceled | all
  const [range, setRange] = useState('month') // month | all

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const monthStartISO = useMemo(() => toISODate(startOfMonth(now)), [now])
  const monthEndISO = useMemo(() => toISODate(endOfMonth(now)), [now])

  const filtered = useMemo(() => {
    const list = movements ?? []

    // 1) status
    const byStatus = list.filter((m) => {
      const s = m.status ?? 'pending'
      if (statusFilter === 'all') return true
      return s === statusFilter
    })

    // 2) rango
    const byRange = byStatus.filter((m) => {
      if (range === 'all') return true
      const d = movementDateISO(m)
      if (!d) return false
      return d >= monthStartISO && d <= monthEndISO
    })

    // 3) ordenar: más reciente primero
    return byRange.sort((a, b) => {
      const da = movementDateISO(a) ?? '0000-00-00'
      const db = movementDateISO(b) ?? '0000-00-00'
      return db.localeCompare(da)
    })
  }, [movements, statusFilter, range, monthStartISO, monthEndISO])

  const summary = useMemo(() => {
    let income = 0
    let expense = 0

    for (const m of filtered) {
      const amt = movementEffectiveAmount(m)
      if ((m.type ?? 'gasto') === 'ingreso') income += amt
      else expense += amt
    }

    const balance = income - expense
    return { income, expense, balance }
  }, [filtered])

  return (
    <div className="page-root">
      <div className="topbar">
        <div>
          <h2 className="topbar-title">Finanzas</h2>
          <div className="page-subtitle" style={{ marginTop: 6 }}>
            Resumen numérico + historial. Por default: <strong>confirmados</strong> del <strong>mes actual</strong>.
          </div>
        </div>

        <div className="topbar-right" style={{ flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setStatusFilter('confirmed')}
              disabled={statusFilter === 'confirmed'}
              title="Solo confirmados"
            >
              Confirmados
            </button>
            <button
              className="btn"
              onClick={() => setStatusFilter('pending')}
              disabled={statusFilter === 'pending'}
              title="Pendientes"
            >
              Pendientes
            </button>
            <button
              className="btn"
              onClick={() => setStatusFilter('canceled')}
              disabled={statusFilter === 'canceled'}
              title="Cancelados"
            >
              Cancelados
            </button>
            <button
              className="btn"
              onClick={() => setStatusFilter('all')}
              disabled={statusFilter === 'all'}
              title="Todos"
            >
              Todos
            </button>
          </div>

          {/* Range */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setRange('month')} disabled={range === 'month'}>
              Mes
            </button>
            <button className="btn" onClick={() => setRange('all')} disabled={range === 'all'}>
              Todo
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-grid">
        <div className="card stat-pill">
          <span>Ingresos</span>
          <strong>{money(summary.income)}</strong>
        </div>
        <div className="card stat-pill">
          <span>Gastos</span>
          <strong>{money(summary.expense)}</strong>
        </div>
        <div className="card stat-pill">
          <span>Balance</span>
          <strong>{money(summary.balance)}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <div>
            <div className="section-title">Historial</div>
            <div className="section-subtitle" style={{ marginTop: 4 }}>
              {range === 'month'
                ? `Rango: ${monthStartISO} → ${monthEndISO}`
                : 'Rango: todo'}
              {' · '}
              Estado: {statusFilter}
              {' · '}
              Items: {filtered.length}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="placeholder-text" style={{ marginTop: 10 }}>
            No hay movimientos para este filtro/rango.
          </div>
        ) : (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const dateISO = movementDateISO(m) ?? '—'
                  const type = m.type ?? 'gasto'
                  const status = m.status ?? 'pending'
                  const title = m.title ?? '—'
                  const amt = movementEffectiveAmount(m)

                  return (
                    <tr key={m.id}>
                      <td>{dateISO}</td>
                      <td style={{ textTransform: 'capitalize' }}>{type}</td>
                      <td>{title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{status}</td>
                      <td style={{ textAlign: 'right' }}>{money(amt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
